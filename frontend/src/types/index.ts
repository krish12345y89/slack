export interface User {
  userId: string;
  username: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export interface Channel {
  channelId: string;
  name: string;
  description: string;
  isPrivate: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  memberCount?: number;
  isMember?: boolean;
}

export interface Message {
  messageId: string;
  content: string;
  type: 'text' | 'image' | 'file';
  userId: string;
  channelId: string;
  username: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T = any> {
  data?: T;
  message?: string;
  errors?: Array<{ msg: string }>;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
}

export interface SocketUser {
  userId: string;
  username: string;
  socketIds: string[];
}

export interface OnlineUsersResponse {
  data: Array<{
    userId: string;
    username: string;
    sockets: number;
  }>;
}
