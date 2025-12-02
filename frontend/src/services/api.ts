import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { API_CONFIG, STORAGE_KEYS } from '@/config';
import { showToast } from '@/utils/toast';

class ApiService {
  private static instance: ApiService;
  private api: AxiosInstance;

  private constructor() {
    this.api = axios.create({
      baseURL: API_CONFIG.BASE_URL,
      timeout: API_CONFIG.TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  static getInstance(): ApiService {
    if (!ApiService.instance) {
      ApiService.instance = new ApiService();
    }
    return ApiService.instance;
  }

  private setupInterceptors(): void {
    // Request interceptor
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
          // Debug: log token being sent (remove in production)
          if (process.env.NODE_ENV !== 'production') {
            console.log('[API] Sending token:', token.substring(0, 20) + '...');
          }
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor
    this.api.interceptors.response.use(
      (response: AxiosResponse) => response.data,
      (error) => {
        const message = error.response?.data?.message || 'An error occurred';
        
        if (error.response?.status === 401) {
          // Debug log
          console.error('[API] 401 Unauthorized:', error.response?.data);
          
          // Only clear storage if not a login/register request (they handle their own auth)
          const url = error.config?.url || '';
          if (!url.includes('/auth/login') && !url.includes('/auth/register')) {
            localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
            localStorage.removeItem(STORAGE_KEYS.USER_DATA);
            window.location.href = ROUTES.LOGIN;
            showToast('Session expired. Please login again.', 'error');
          }
        } else if (error.response?.status === 403) {
          showToast('You do not have permission for this action', 'error');
        } else if (error.response?.status === 429) {
          showToast('Too many requests. Please try again later.', 'error');
        } else if (error.response?.status >= 400) {
          showToast(message, 'error');
        }

        return Promise.reject(error);
      }
    );
  }

  // Auth endpoints
  public auth = {
    register: (data: { username: string; email: string; password: string }) =>
      this.api.post('/auth/register', data),
    login: (data: { email: string; password: string }) =>
      this.api.post('/auth/login', data),
    logout: () => this.api.post('/auth/logout'),
    getMe: () => this.api.get('/auth/me'),
  };

  // Channel endpoints
  public channels = {
    create: (data: { name: string; description?: string; isPrivate?: boolean }) =>
      this.api.post('/channels', data),
    list: (params?: { page?: number; limit?: number }) =>
      this.api.get('/channels', { params }),
    get: (channelId: string) => this.api.get(`/channels/${channelId}`),
    join: (channelId: string) => this.api.post(`/channels/${channelId}/join`),
    leave: (channelId: string) => this.api.post(`/channels/${channelId}/leave`),
    delete: (channelId: string) => this.api.delete(`/channels/${channelId}`),
  };

  // Message endpoints
  public messages = {
    list: (channelId: string, params?: { page?: number; limit?: number }) =>
      this.api.get(`/messages/${channelId}`, { params }),
    create: (channelId: string, data: { content: string; type?: string }) =>
      this.api.post(`/messages/${channelId}`, data),
    update: (messageId: string, data: { content: string }) =>
      this.api.put(`/messages/${messageId}`, data),
    delete: (messageId: string) => this.api.delete(`/messages/${messageId}`),
  };

  // Socket endpoints
  public socket = {
    getOnlineUsers: () => this.api.get('/socket/online-users'),
  };

  // Generic methods
  public get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.api.get(url, config);
  }

  public post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return this.api.post(url, data, config);
  }

  public put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return this.api.put(url, data, config);
  }

  public delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.api.delete(url, config);
  }
}

import { ROUTES } from '@/config';
export const api = ApiService.getInstance();
