import { Router } from 'express';
import AuthController from '../controllers/authController';
import AuthMiddleware from '../middleware/AuthMiddleware';

const router = Router();

router.post(
  '/register',
  AuthController.validateRegister,
  AuthController.register
);

router.post('/login', AuthController.validateLogin, AuthController.login);

router.post('/logout', AuthMiddleware.authenticate, AuthController.logout);

router.get('/me', AuthMiddleware.authenticate, AuthController.getMe);

export default router;
