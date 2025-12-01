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
    // VERCEL-SPECIFIC CORS FIX
    // For Vercel serverless functions, we need to handle CORS differently
    
    // Allow ALL Vercel preview domains (adjust as needed)
    const allowedOrigins = [
      'https://slack-iexh.vercel.app',
      'https://slack-iexh-49dkpmx6c-krishs-projects-2077802b.vercel.app',
      'https://slack-uavy.vercel.app',
      'https://slack-ebon.vercel.app',
      'http://localhost:5173',
      'http://localhost:3000',
      // Wildcard pattern for all preview deployments
      /^https:\/\/(slack-iexh|slack-uavy|slack-ebon).*\.vercel\.app$/,
      /^https:\/\/slack-.*-krishs-projects-.*\.vercel\.app$/,
    ];

    // Vercel-specific CORS middleware
    this.app.use((req, res, next) => {
      const origin = req.headers.origin;
      
      // Always allow OPTIONS requests (preflight)
      if (req.method === 'OPTIONS') {
        // Check if origin is allowed
        let isAllowed = false;
        if (origin) {
          for (const allowed of allowedOrigins) {
            if (typeof allowed === 'string') {
              if (origin === allowed || origin.startsWith(allowed.replace(/\/$/, ''))) {
                isAllowed = true;
                break;
              }
            } else if (allowed instanceof RegExp) {
              if (allowed.test(origin)) {
                isAllowed = true;
                break;
              }
            }
          }
        }
        
        // For Vercel, always set CORS headers for OPTIONS
        if (origin && isAllowed) {
          res.header('Access-Control-Allow-Origin', origin);
        } else if (origin) {
          // Allow the requesting origin for preflight
          res.header('Access-Control-Allow-Origin', origin);
        }
        
        res.header('Access-Control-Allow-Credentials', 'true');
        res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
        res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin, Cookie, Cookies');
        res.header('Access-Control-Max-Age', '86400'); // 24 hours
        return res.status(204).end();
      }
      
      // For non-OPTIONS requests, check CORS
      if (origin) {
        let isAllowed = false;
        for (const allowed of allowedOrigins) {
          if (typeof allowed === 'string') {
            if (origin === allowed || origin.startsWith(allowed.replace(/\/$/, ''))) {
              isAllowed = true;
              break;
            }
          } else if (allowed instanceof RegExp) {
            if (allowed.test(origin)) {
              isAllowed = true;
              break;
            }
          }
        }
        
        if (isAllowed) {
          res.header('Access-Control-Allow-Origin', origin);
        }
      }
      
      res.header('Access-Control-Allow-Credentials', 'true');
      next();
    });

    // Also use cors middleware as backup
    this.app.use(cors({
      origin: function (origin, callback) {
        // Allow requests with no origin
        if (!origin) return callback(null, true);
        
        // Check if origin is allowed
        for (const allowed of allowedOrigins) {
          if (typeof allowed === 'string') {
            if (origin === allowed || origin.startsWith(allowed.replace(/\/$/, ''))) {
              return callback(null, true);
            }
          } else if (allowed instanceof RegExp) {
            if (allowed.test(origin)) {
              return callback(null, true);
            }
          }
        }
        
        console.log(`CORS blocked: ${origin}`);
        callback(new Error('Not allowed by CORS'));
      },
      credentials: true
    }));

    // Body parsers
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    
    // Debug middleware
    this.app.use((req, res, next) => {
      console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
      console.log('Origin:', req.headers.origin);
      console.log('User-Agent:', req.headers['user-agent']);
      next();
    });
  }

  private initializeRoutes(): void {
    // CORS test endpoint
    this.app.get('/api/cors-test', (req, res) => {
      res.json({
        success: true,
        message: 'CORS is working!',
        yourOrigin: req.headers.origin || 'none',
        timestamp: new Date().toISOString(),
        allowedOrigins: [
          'https://slack-iexh.vercel.app',
          'https://slack-uavy.vercel.app',
          'https://slack-ebon.vercel.app',
          'All Vercel preview deployments'
        ]
      });
    });

    // Simple test endpoint
    this.app.get('/api/test', (req, res) => {
      res.json({
        message: 'API is working!',
        method: req.method,
        origin: req.headers.origin,
        timestamp: new Date().toISOString()
      });
    });

    // Health check
    this.app.get('/health', (req, res) => {
      res.json({ 
        status: 'ok', 
        timestamp: new Date().toISOString(),
        origin: req.headers.origin || 'none',
        environment: process.env.NODE_ENV || 'development'
      });
    });

    // API routes
    this.app.use('/api/auth', authRoutes);
    this.app.use('/api/channels', channelRoutes);
    this.app.use('/api/messages', messageRoutes);
    this.app.use('/api/socket', debugRoutes);

    // Error handling
    this.app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
      console.error('Error:', err);
      
      // CORS error handling
      if (err.message.includes('CORS')) {
        res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
        res.header('Access-Control-Allow-Credentials', 'true');
        return res.status(403).json({
          error: 'CORS Error',
          message: err.message,
          yourOrigin: req.headers.origin,
          tip: 'Contact admin to add your origin to allowed list'
        });
      }
      
      res.status(500).json({ error: 'Internal Server Error' });
    });

    // 404 handler
    this.app.use('*', (req, res) => {
      res.status(404).json({ 
        error: 'Not Found', 
        path: req.originalUrl,
        method: req.method 
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