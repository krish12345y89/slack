import { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import AuthService from '../services/authService';
import { AuthRequest } from '../middleware/AuthMiddleware';

class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = AuthService.getInstance();
  }

  public validateRegister = [
    body('username')
      .trim()
      .isLength({ min: 3, max: 30 })
      .withMessage('Username must be 3-30 characters'),
    body('email').isEmail().normalizeEmail().withMessage('Invalid email'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters'),
  ];

  public validateLogin = [
    body('email').isEmail().normalizeEmail().withMessage('Invalid email'),
    body('password').notEmpty().withMessage('Password is required'),
  ];

  public register = async (req: Request, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      const { username, email, password } = req.body;
      const { user, token } = await this.authService.register(
        username,
        email,
        password
      );

      res.status(201).json({
        message: 'User registered successfully',
        user,
        token,
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  };

  public login = async (req: Request, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      const { email, password } = req.body;
      const { user, token } = await this.authService.login(email, password);

      res.json({
        message: 'Login successful',
        user,
        token,
      });
    } catch (error: any) {
      res.status(401).json({ message: error.message });
    }
  };

  public logout = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (req.user) {
        await this.authService.logout(req.user.userId);
      }
      res.json({ message: 'Logout successful' });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  };

  public getMe = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }

      const user = await this.authService.getUserById(req.user.userId);
      res.json({ user });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  };
}

export default new AuthController();
