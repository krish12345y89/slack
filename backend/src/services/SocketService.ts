import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import AuthService from './authService';
import MessageService from './MessageService';
import ChannelService from './ChannelService';
import { SocketUser } from '../interfaces';

class SocketService {
  private static instance: SocketService;
  private io: Server | null = null;
  private onlineUsers: Map<string, SocketUser> = new Map();
  private authService: AuthService;
  private messageService: MessageService;
  private channelService: ChannelService;

  private constructor() {
    this.authService = AuthService.getInstance();
    this.messageService = MessageService.getInstance();
    this.channelService = ChannelService.getInstance();
  }

  public static getInstance(): SocketService {
    if (!SocketService.instance) {
      SocketService.instance = new SocketService();
    }
    return SocketService.instance;
  }

  public initialize(httpServer: HttpServer): void {
    this.io = new Server(httpServer, {
      cors: {
        origin: process.env.CLIENT_URL || 'http://localhost:3000',
        methods: ['GET', 'POST'],
        credentials: true,
      },
    });

    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token;
        if (!token) {
          return next(new Error('Authentication error'));
        }

        const decoded = this.authService.verifyToken(token);
        const user = await this.authService.getUserById(decoded.userId);

        if (!user) {
          return next(new Error('User not found'));
        }

        socket.data.user = {
          userId: user._id.toString(),
          username: user.username,
        };
        next();
      } catch (error) {
        next(new Error('Authentication error'));
      }
    });

    this.io.on('connection', (socket) => this.handleConnection(socket));
  }

  private handleConnection(socket: Socket): void {
    const { userId, username } = socket.data.user;

    console.log(`User connected: ${username} (${userId})`);

    // Add socket id for this user (support multiple tabs/sockets)
    const existing = this.onlineUsers.get(userId);
    if (existing) {
      if (!existing.socketIds.includes(socket.id)) {
        existing.socketIds.push(socket.id);
      }
    } else {
      this.onlineUsers.set(userId, {
        socketIds: [socket.id],
        userId,
        username,
      });
      // first connection for this user, update DB online status
      this.authService.updateUserOnlineStatus(userId, true);
    }

    // Broadcast online users
    this.broadcastOnlineUsers();

    // Handle joining channels
    socket.on('join-channel', async (channelId: string) => {
      socket.join(channelId);
      console.log(`${username} joined channel: ${channelId}`);
      
      socket.to(channelId).emit('user-joined', {
        userId,
        username,
        channelId,
      });
    });

    // Handle leaving channels
    socket.on('leave-channel', (channelId: string) => {
      socket.leave(channelId);
      console.log(`${username} left channel: ${channelId}`);
      
      socket.to(channelId).emit('user-left', {
        userId,
        username,
        channelId,
      });
    });

    // Handle new messages
    socket.on('send-message', async (data: {
      content: string;
      channelId: string;
      type?: 'text' | 'image' | 'file';
    }) => {
      try {
        const message = await this.messageService.createMessage(
          data.content,
          userId,
          data.channelId,
          data.type
        );

        this.io?.to(data.channelId).emit('new-message', message);
      } catch (error) {
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Handle typing indicator
    socket.on('typing-start', (channelId: string) => {
      socket.to(channelId).emit('user-typing', {
        userId,
        username,
        channelId,
      });
    });

    socket.on('typing-stop', (channelId: string) => {
      socket.to(channelId).emit('user-stopped-typing', {
        userId,
        channelId,
      });
    });

    // Handle message edit
    socket.on('edit-message', async (data: {
      messageId: string;
      content: string;
      channelId: string;
    }) => {
      try {
        const message = await this.messageService.updateMessage(
          data.messageId,
          userId,
          data.content
        );

        if (message) {
          this.io?.to(data.channelId).emit('message-edited', message);
        }
      } catch (error) {
        socket.emit('error', { message: 'Failed to edit message' });
      }
    });

    // Handle message delete
    socket.on('delete-message', async (data: {
      messageId: string;
      channelId: string;
    }) => {
      try {
        const success = await this.messageService.deleteMessage(
          data.messageId,
          userId
        );

        if (success) {
          this.io?.to(data.channelId).emit('message-deleted', {
            messageId: data.messageId,
          });
        }
      } catch (error) {
        socket.emit('error', { message: 'Failed to delete message' });
      }
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${username} (${userId})`);

      const entry = this.onlineUsers.get(userId);
      if (entry) {
        // remove this socket id
        entry.socketIds = entry.socketIds.filter((id) => id !== socket.id);
        if (entry.socketIds.length === 0) {
          // last socket disconnected for this user
          this.onlineUsers.delete(userId);
          this.authService.updateUserOnlineStatus(userId, false);
        } else {
          // update map with remaining sockets
          this.onlineUsers.set(userId, entry);
        }
      }

      this.broadcastOnlineUsers();
    });
  }

  private broadcastOnlineUsers(): void {
    const users = Array.from(this.onlineUsers.values()).map((u) => ({
      userId: u.userId,
      username: u.username,
    }));

    this.io?.emit('online-users', users);
  }

  public getIO(): Server | null {
    return this.io;
  }

  public getOnlineUsers(): SocketUser[] {
    return Array.from(this.onlineUsers.values());
  }
}

export default SocketService;
