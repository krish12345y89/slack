import { Router } from 'express';
import ChannelController from '../controllers/ChannelController';
import AuthMiddleware from '../middleware/AuthMiddleware';

const router = Router();

router.use(AuthMiddleware.authenticate);

router.post('/', ChannelController.validateCreate, ChannelController.createChannel);
router.get('/', ChannelController.getChannels);
router.get('/:channelId', ChannelController.getChannelById);
router.post('/:channelId/join', ChannelController.joinChannel);
router.post('/:channelId/leave', ChannelController.leaveChannel);
router.delete('/:channelId', ChannelController.deleteChannel);

export default router;
