export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
  SOCKET_URL: import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000',
  TIMEOUT: 30000,
};

export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  USER_DATA: 'user_data',
  THEME: 'theme',
  LAYOUT: 'layout',
};

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  CHAT: '/chat',
  CHANNEL: (id: string) => `/chat/${id}`,
  PROFILE: '/profile',
  SETTINGS: '/settings',
};

export const QUERY_KEYS = {
  AUTH: 'auth',
  CHANNELS: 'channels',
  MESSAGES: 'messages',
  USERS: 'users',
  ONLINE_USERS: 'online-users',
};

export const MESSAGE_TYPES = {
  TEXT: 'text',
  IMAGE: 'image',
  FILE: 'file',
} as const;

export const PAGINATION = {
  DEFAULT_LIMIT: 50,
  MESSAGE_LIMIT: 30,
};
