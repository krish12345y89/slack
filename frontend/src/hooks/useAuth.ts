import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { api } from '@/services/api';
import { socketService } from '@/services/socket';
import { STORAGE_KEYS, ROUTES, QUERY_KEYS } from '@/config';
import { User } from '@/types';
import { successToast, errorToast } from '@/utils/toast';

interface LoginData {
  email: string;
  password: string;
}

interface RegisterData {
  username: string;
  email: string;
  password: string;
}

export const useAuth = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const loginMutation = useMutation({
    mutationFn: (data: LoginData) => api.auth.login(data),
    onSuccess: (response: any) => {
      // ApiService returns `response.data` (via interceptor) in many setups,
      // but some backends return the payload directly. Handle both shapes.
      const payload = response?.data ?? response ?? {};
      const user = payload.user ?? payload.data?.user ?? payload.userData ?? null;
      const token = payload.token ?? payload.data?.token ?? payload.accessToken ?? payload.authToken ?? null;

      if (!user || !token) {
        errorToast('Login failed: invalid server response');
        return;
      }

      localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
      localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));
      try {
        socketService.connect();
      } catch (error) {
        console.error('Failed to connect socket:', error);
      }
      successToast('Login successful');
      navigate(ROUTES.HOME);
    },
    onError: (error: any) => {
      errorToast(error.response?.data?.message || 'Login failed');
    },
  });

  const registerMutation = useMutation({
    mutationFn: (data: RegisterData) => api.auth.register(data),
    onSuccess: (response: any) => {
      const payload = response?.data ?? response ?? {};
      const user = payload.user ?? payload.data?.user ?? payload.userData ?? null;
      const token = payload.token ?? payload.data?.token ?? payload.accessToken ?? payload.authToken ?? null;

      if (!user || !token) {
        errorToast('Registration failed: invalid server response');
        return;
      }

      localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
      localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));
      try {
        socketService.connect();
      } catch (error) {
        console.error('Failed to connect socket:', error);
      }
      successToast('Registration successful');
      navigate(ROUTES.HOME);
    },
    onError: (error: any) => {
      errorToast(error.response?.data?.message || 'Registration failed');
    },
  });

  const logoutMutation = useMutation({
    mutationFn: () => api.auth.logout(),
    onSuccess: () => {
      localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER_DATA);
      socketService.disconnect();
      queryClient.clear();
      successToast('Logged out successfully');
      navigate(ROUTES.LOGIN);
    },
    onError: (error: any) => {
      errorToast(error.response?.data?.message || 'Logout failed');
    },
  });

  const { data: currentUser, isLoading: isLoadingUser } = useQuery({
    queryKey: [QUERY_KEYS.AUTH],
    queryFn: () => {
      const stored = localStorage.getItem(STORAGE_KEYS.USER_DATA);
      if (stored) {
        return JSON.parse(stored) as User;
      }
      return null;
    },
    staleTime: 1000 * 60 * 5,
  });

  return {
    user: currentUser || null,
    isLoading: isLoadingUser,
    login: loginMutation,
    register: registerMutation,
    logout: () => logoutMutation.mutate(),
    isLoggingIn: loginMutation.isPending,
    isRegistering: registerMutation.isPending,
  };
};
