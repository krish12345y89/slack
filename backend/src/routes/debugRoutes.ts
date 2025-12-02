import { Router } from 'express';
import SocketService from '../services/SocketService';
import User from '../models/User';

const router = Router();

// Returns online users. If SocketService has active sockets, return them.
// In serverless environments (e.g., Vercel) SocketService may not be initialized,
// so fall back to querying the User model for `isOnline: true`.
router.get('/online-users', async (req, res) => {
  try {
    const socketService = SocketService.getInstance();
    const socketUsers = socketService.getOnlineUsers();

    if (socketUsers && socketUsers.length > 0) {
      const users = socketUsers.map(u => ({ userId: u.userId, username: u.username, sockets: u.socketIds.length }));
      return res.json({ data: users });
    }

    // Fallback: query DB for users marked as online
    const dbUsers = await User.find({ isOnline: true }).select('username _id avatar');
    const users = dbUsers.map(u => ({ userId: u._id.toString(), username: u.username, sockets: 0 }));
    return res.json({ data: users });
  } catch (err: any) {
    console.error('Failed to get online users:', err);
    return res.status(500).json({ message: 'Failed to get online users' });
  }
});

export default router;
