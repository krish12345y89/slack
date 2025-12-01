import { Request, Response, NextFunction } from 'express';
import AuthService from '../services/authService';

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
  };
}

class AuthMiddleware {
  private authService: AuthService;

  constructor() {
    this.authService = AuthService.getInstance();
  }

  public authenticate = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ message: 'No token provided' });
        return;
      }

      const token = authHeader.split(' ')[1];
      const decoded = this.authService.verifyToken(token);

      const user = await this.authService.getUserById(decoded.userId);

      if (!user) {
        res.status(401).json({ message: 'User not found' });
        return;
      }

      req.user = decoded;
      next();
    } catch (error) {
      res.status(401).json({ message: 'Invalid token' });
    }
  };
}

export default new AuthMiddleware();
