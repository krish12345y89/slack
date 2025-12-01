import { io, Socket } from 'socket.io-client';
import { API_CONFIG, STORAGE_KEYS } from '@/config';
import { showToast } from '@/utils/toast';
import { Message, SocketUser } from '@/types';

export interface SocketEvents {
  'connect': () => void;
  'connect_error': (error: Error) => void;
  'disconnect': (reason: string) => void;
  'message:new': (message: Message) => void;
  'message:update': (message: Message) => void;
  'message:delete': (data: { messageId: string; channelId: string }) => void;
  'user:online': (user: SocketUser) => void;
  'user:offline': (userId: string) => void;
  'channel:join': (data: { channelId: string; userId: string }) => void;
  'channel:leave': (data: { channelId: string; userId: string }) => void;
}

class SocketService {
  private static instance: SocketService;
  private socket: Socket | null = null;
  private listeners: Map<keyof SocketEvents, Function[]> = new Map();

  private constructor() {}

  static getInstance(): SocketService {
    if (!SocketService.instance) {
      SocketService.instance = new SocketService();
    }
    return SocketService.instance;
  }

  connect(): void {
    if (this.socket?.connected) return;

    const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    if (!token) {
      throw new Error('No authentication token found');
    }

    this.socket = io(API_CONFIG.SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('Socket connected');
      this.emit('connect');
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      this.emit('connect_error', error);
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
      this.emit('disconnect', reason);
    });

    this.socket.on('message:new', (message) => {
      this.emit('message:new', message);
      showToast(`New message from ${message.username}`, 'info');
    });

    this.socket.on('message:update', (message) => this.emit('message:update', message));
    this.socket.on('message:delete', (data) => this.emit('message:delete', data));
    this.socket.on('user:online', (user) => this.emit('user:online', user));
    this.socket.on('user:offline', (userId) => this.emit('user:offline', userId));
    this.socket.on('channel:join', (data) => this.emit('channel:join', data));
    this.socket.on('channel:leave', (data) => this.emit('channel:leave', data));
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.listeners.clear();
    }
  }

  emit<T extends keyof SocketEvents>(event: T, ...args: any[]): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach(callback => callback(...args));
    }
  }

  on<T extends keyof SocketEvents>(event: T, callback: SocketEvents[T]): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback as Function);
  }

  off<T extends keyof SocketEvents>(event: T, callback?: SocketEvents[T]): void {
    if (!callback) {
      this.listeners.delete(event);
      return;
    }

    const callbacks = this.listeners.get(event);
    if (callbacks) {
      const index = callbacks.indexOf(callback as Function);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  joinChannel(channelId: string): void {
    this.socket?.emit('channel:join', { channelId });
  }

  leaveChannel(channelId: string): void {
    this.socket?.emit('channel:leave', { channelId });
  }

  sendMessage(channelId: string, content: string, type: string = 'text'): void {
    this.socket?.emit('message:send', { channelId, content, type });
  }

  updateMessage(messageId: string, content: string): void {
    this.socket?.emit('message:update', { messageId, content });
  }

  deleteMessage(messageId: string): void {
    this.socket?.emit('message:delete', { messageId });
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

export const socketService = SocketService.getInstance();
