import { Router } from 'express';
import MessageController from '../controllers/MessageController';
import AuthMiddleware from '../middleware/AuthMiddleware';

const router = Router();

router.use(AuthMiddleware.authenticate);

router.get('/:channelId', MessageController.getMessages);
router.post(
  '/:channelId',
  MessageController.validateCreate,
  MessageController.createMessage
);
router.put('/:messageId', MessageController.updateMessage);
router.delete('/:messageId', MessageController.deleteMessage);

export default router;
