import { Router } from 'express';
import SocketService from '../services/SocketService';

const router = Router();

router.get('/online-users', (req, res) => {
  const socketService = SocketService.getInstance();
  const users = socketService.getOnlineUsers().map(u => ({ userId: u.userId, username: u.username, sockets: u.socketIds.length }));
  res.json({ data: users });
});

export default router;
