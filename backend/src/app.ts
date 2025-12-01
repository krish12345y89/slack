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
    const clientUrls = (process.env.CLIENT_URLS || process.env.CLIENT_URL || 'https://slack-iexh.vercel.app')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    // ADD your frontend URL since it's different from backend
    if (!clientUrls.includes('https://slack-iexh.vercel.app')) {
      clientUrls.push('https://slack-iexh.vercel.app');
    }

    console.log('🔒 Allowed CORS origins:', clientUrls);

    // CORS configuration
    const corsOptions = {
      origin: function (origin: any, callback: any) {
        // Allow requests with no origin (like curl, server-to-server)
        if (!origin) {
          return callback(null, true);
        }

        // Check if the origin is in the allowed list
        const isAllowed = clientUrls.some(allowedOrigin => {
          // Remove protocol and ports for comparison
          const normalize = (url: string) => {
            return url.replace(/^(https?:\/\/)/, '').replace(/\/$/, '');
          };

          const normalizedOrigin = normalize(origin);
          const normalizedAllowed = normalize(allowedOrigin);

          // Check exact match or subdomain match
          return normalizedOrigin === normalizedAllowed || 
                 normalizedOrigin.endsWith('.' + normalizedAllowed);
        });

        if (isAllowed) {
          callback(null, true);
        } else {
          console.warn(`🚫 CORS blocked: ${origin}. Allowed: ${clientUrls.join(', ')}`);
          callback(new Error('Not allowed by CORS'));
        }
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin', 'Cookies'],
      exposedHeaders: ['Set-Cookie'],
      preflightContinue: false,
      optionsSuccessStatus: 204
    };

    // Apply CORS middleware to ALL routes
    this.app.use(cors(corsOptions));

    // Handle preflight requests explicitly
    this.app.options('*', cors(corsOptions));

    // Manual CORS headers as fallback (important for preflight)
    this.app.use((req, res, next) => {
      const origin = req.headers.origin;
      
      if (origin && clientUrls.some(allowed => origin.includes(allowed.replace(/https?:\/\//, '')))) {
        res.header('Access-Control-Allow-Origin', origin);
        res.header('Access-Control-Allow-Credentials', 'true');
        res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
        res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
        
        // Handle preflight requests
        if (req.method === 'OPTIONS') {
          return res.status(204).end();
        }
      }
      
      next();
    });

    // Body parsers
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
  }

  private initializeRoutes(): void {
    // Health check with CORS test
    this.app.get('/health', (req, res) => {
      res.json({ 
        status: 'ok', 
        timestamp: new Date().toISOString(),
        cors: 'enabled',
        allowedOrigins: process.env.CLIENT_URLS || process.env.CLIENT_URL,
        currentOrigin: req.headers.origin || 'none'
      });
    });

    // Add a test endpoint for CORS debugging
    this.app.get('/api/cors-test', (req, res) => {
      res.json({
        message: 'CORS is working!',
        origin: req.headers.origin,
        method: req.method
      });
    });

    // Your API routes
    this.app.use('/api/auth', authRoutes);
    this.app.use('/api/channels', channelRoutes);
    this.app.use('/api/messages', messageRoutes);
    this.app.use('/api/socket', debugRoutes);

    // Dev debug routes
    if (process.env.NODE_ENV !== 'production') {
      this.app.use('/api/debug', debugRoutes);
    }

    // Error handling middleware
    this.app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
      console.error('🔥 Server Error:', err.stack);
      
      // CORS error handling
      if (err.message.includes('CORS') || err.message.includes('Not allowed')) {
        return res.status(403).json({
          error: 'CORS Error',
          message: err.message,
          allowedOrigins: process.env.CLIENT_URLS || process.env.CLIENT_URL,
          requestedOrigin: req.headers.origin || 'unknown'
        });
      }
      
      res.status(500).json({ 
        error: 'Internal Server Error',
        message: 'Something went wrong!' 
      });
    });

    // 404 handler
    this.app.use('*', (req, res) => {
      res.status(404).json({ 
        error: 'Not Found',
        message: `Route ${req.originalUrl} not found` 
      });
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

      this.initializeSocket();

      this.httpServer.listen(this.port, () => {
        console.log(`🚀 Server running on port ${this.port}`);
        console.log(`🌐 CORS enabled for origins:`);
        const origins = (process.env.CLIENT_URLS || process.env.CLIENT_URL || 'https://slack-iexh.vercel.app')
          .split(',')
          .map((s) => s.trim());
        origins.forEach(origin => console.log(`   - ${origin}`));
      });
    } catch (error) {
      console.error('Failed to start server:', error);
      process.exit(1);
    }
  }
}

const appInstance = new App();

if (process.env.NODE_ENV !== 'production') {
  appInstance.start();
}

export default appInstance.app;