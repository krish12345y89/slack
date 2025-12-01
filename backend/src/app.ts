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
    // Support multiple allowed origins via `CLIENT_URLS` (comma-separated) or single `CLIENT_URL`.
    const clientUrls = (process.env.CLIENT_URLS || process.env.CLIENT_URL || 'https://slack-uavy.vercel.app')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const corsOptions = {
      origin: (origin: any, callback: any) => {
        // allow requests with no origin (like curl, server-to-server)
        if (!origin) return callback(null, true);
        if (clientUrls.length === 0 || clientUrls.includes(origin)) {
          return callback(null, true);
        }
        return callback(new Error('Not allowed by CORS'));
      },
      credentials: true,
    };

    this.app.use(cors(corsOptions));
    // Ensure preflight requests are handled for all routes
    this.app.options('*', cors(corsOptions));
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
  }

  private initializeRoutes(): void {
    this.app.get('/health', (req, res) => {
      res.json({ status: 'ok', timestamp: new Date().toISOString() });
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
      res.status(500).json({ message: 'Something went wrong!' });
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
