import express from 'express';
import { createServer } from 'http';
import cors from 'cors';
import dotenv from 'dotenv';
import Database from './config/database';
import SocketService from './services/SocketService';
import authRoutes from './routes/authRoutes';
import channelRoutes from './routes/channelRoutes';
import messageRoutes from './routes/messageRoutes';
import debugRoutes from './routes/debugRoutes';

dotenv.config();

class App {
  public app: express.Application;
  private httpServer: ReturnType<typeof createServer>;
  private port: number;

  constructor() {
    this.app = express();
    this.httpServer = createServer(this.app);
    this.port = parseInt(process.env.PORT || '5000');

    this.initializeMiddlewares();
    this.initializeRoutes();
  }

  private initializeMiddlewares(): void {
    // Parse allowed origins from environment variables
    const clientUrls = (process.env.CLIENT_URLS || process.env.CLIENT_URL || 'https://slack-uavy.vercel.app')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    console.log('Allowed CORS origins:', clientUrls);

    const corsOptions = {
      origin: (origin: any, callback: any) => {
        // Allow requests with no origin (like curl, server-to-server, Postman)
        if (!origin) {
          console.log('No origin header (server-to-server request)');
          return callback(null, true);
        }

        console.log('Incoming origin:', origin);
        
        // Normalize origins for comparison (remove trailing slashes)
        const normalizedOrigin = origin.replace(/\/$/, '');
        const normalizedClientUrls = clientUrls.map(url => url.replace(/\/$/, ''));

        // Check if origin matches any allowed URL
        const isAllowed = normalizedClientUrls.some(allowedOrigin => {
          // Exact match
          if (normalizedOrigin === allowedOrigin) return true;
          
          // Match with or without trailing slash
          if (normalizedOrigin === allowedOrigin.replace(/\/$/, '') || 
              normalizedOrigin === allowedOrigin + '/') {
            return true;
          }
          
          // Match any subpath of the allowed origin (for frontend routes)
          if (normalizedOrigin.startsWith(allowedOrigin.replace(/\/$/, ''))) {
            return true;
          }
          
          return false;
        });

        if (isAllowed) {
          console.log(`Origin ${origin} is allowed`);
          return callback(null, true);
        } else {
          console.log(`Origin ${origin} is NOT allowed. Allowed origins:`, normalizedClientUrls);
          return callback(new Error(`Not allowed by CORS. Origin: ${origin}`), false);
        }
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin']
    };

    this.app.use(cors(corsOptions));
    
    // Handle preflight requests
    this.app.options('*', cors(corsOptions));
    
    // Add CORS headers manually as backup
    this.app.use((req, res, next) => {
      const origin = req.headers.origin;
      if (origin) {
        const normalizedOrigin = origin.replace(/\/$/, '');
        const normalizedClientUrls = clientUrls.map(url => url.replace(/\/$/, ''));
        
        const isAllowed = normalizedClientUrls.some(allowedOrigin => 
          normalizedOrigin.startsWith(allowedOrigin.replace(/\/$/, ''))
        );
        
        if (isAllowed) {
          res.header('Access-Control-Allow-Origin', origin);
          res.header('Access-Control-Allow-Credentials', 'true');
          res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
          res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
        }
      }
      next();
    });

    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
  }

  private initializeRoutes(): void {
    // Health check endpoint
    this.app.get('/health', (req, res) => {
      res.json({ 
        status: 'ok', 
        timestamp: new Date().toISOString(),
        cors: 'enabled'
      });
    });

    this.app.use('/api/auth', authRoutes);
    this.app.use('/api/channels', channelRoutes);
    this.app.use('/api/messages', messageRoutes);
    this.app.use('/api/socket', debugRoutes);

    // Dev debug routes
    if (process.env.NODE_ENV !== 'production') {
      this.app.use('/api/debug', debugRoutes);
    }

    // Error handling
    this.app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
      console.error(err.stack);
      
      // Handle CORS errors specifically
      if (err.message.includes('CORS')) {
        return res.status(403).json({ 
          message: 'CORS Error', 
          error: err.message,
          allowedOrigins: process.env.CLIENT_URLS || process.env.CLIENT_URL 
        });
      }
      
      res.status(500).json({ message: 'Something went wrong!' });
    });

    // 404 handler
    this.app.use('*', (req, res) => {
      res.status(404).json({ message: 'Route not found' });
    });
  }

  private initializeSocket(): void {
    const socketService = SocketService.getInstance();
    socketService.initialize(this.httpServer);
  }

  public async start(): Promise<void> {
    try {
      const database = Database.getInstance();
      await database.connect();

      // Initialize socket only when starting the long-running server (local or container).
      this.initializeSocket();

      this.httpServer.listen(this.port, () => {
        console.log(`🚀 Server running on port ${this.port}`);
        console.log(`🌐 CORS enabled for: ${process.env.CLIENT_URLS || process.env.CLIENT_URL || 'https://slack-uavy.vercel.app'}`);
      });
    } catch (error) {
      console.error('Failed to start server:', error);
      process.exit(1);
    }
  }
}

// Create app instance but do NOT start the HTTP server automatically in production
// (serverless platforms like Vercel expect the module to export the Express app).
const appInstance = new App();

// Start the server when running locally (non-production). Vercel sets NODE_ENV=production
// and will import the exported Express app instead of running a persistent server.
if (process.env.NODE_ENV !== 'production') {
  appInstance.start();
}

// Export the underlying Express application for serverless adapters (Vercel, etc.).
export default appInstance.app;