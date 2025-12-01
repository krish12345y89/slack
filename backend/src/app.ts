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
    // SIMPLIFIED CORS - Allow all Vercel preview deployments
    const allowedOrigins = [
      // Your main frontend URLs
      'https://slack-iexh.vercel.app',
      'https://slack-uavy.vercel.app',
      'http://localhost:5173',
      'http://localhost:3000',
      // Vercel preview pattern (wildcard for your project)
      /https:\/\/slack-iexh-.*-krishs-projects-2077802b\.vercel\.app$/,
      /https:\/\/slack-uavy-.*-krishs-projects-.*\.vercel\.app$/,
    ];

    const corsOptions = {
      origin: (origin: any, callback: any) => {
        // Allow requests with no origin (like server-to-server, curl)
        if (!origin) {
          return callback(null, true);
        }

        // Check against allowed origins
        for (const allowedOrigin of allowedOrigins) {
          if (typeof allowedOrigin === 'string') {
            if (origin === allowedOrigin || origin.startsWith(allowedOrigin.replace(/\/$/, ''))) {
              return callback(null, true);
            }
          } else if (allowedOrigin instanceof RegExp) {
            if (allowedOrigin.test(origin)) {
              return callback(null, true);
            }
          }
        }

        console.warn(`🚫 CORS blocked: ${origin}`);
        callback(new Error('Not allowed by CORS'));
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin', 'Cookie'],
      exposedHeaders: ['Set-Cookie'],
      optionsSuccessStatus: 200
    };

    // CRITICAL: Apply CORS BEFORE any routes
    this.app.use(cors(corsOptions));

    // Body parsers
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
  }

  private initializeRoutes(): void {
    // Test endpoint for CORS
    this.app.get('/cors-test', (req, res) => {
      res.json({
        message: 'CORS test successful!',
        origin: req.headers.origin || 'none',
        headers: req.headers,
        timestamp: new Date().toISOString()
      });
    });

    // Health check
    this.app.get('/health', (req, res) => {
      res.json({ 
        status: 'ok', 
        timestamp: new Date().toISOString(),
        cors: 'enabled',
        origin: req.headers.origin || 'none',
        note: 'If origin is none, this was a direct request'
      });
    });

    // API routes
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
      console.error('Server Error:', err);
      
      if (err.message.includes('CORS')) {
        return res.status(403).json({
          error: 'CORS Error',
          message: err.message,
          yourOrigin: req.headers.origin,
          tip: 'Make sure your frontend URL matches the allowed patterns'
        });
      }
      
      res.status(500).json({ error: 'Internal Server Error' });
    });

    // 404 handler
    this.app.use('*', (req, res) => {
      res.status(404).json({ error: 'Not Found', path: req.originalUrl });
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
        console.log(`🌐 CORS enabled for:`);
        console.log(`   - https://slack-iexh.vercel.app`);
        console.log(`   - https://slack-uavy.vercel.app`);
        console.log(`   - All Vercel preview deployments`);
        console.log(`   - Localhost:5173 and :3000`);
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