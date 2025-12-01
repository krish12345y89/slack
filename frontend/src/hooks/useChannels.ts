import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/services/api';
import { QUERY_KEYS } from '@/config';
import { successToast, errorToast } from '@/utils/toast';

export const useChannels = (params?: { page?: number; limit?: number }) => {
  return useQuery({
    queryKey: [QUERY_KEYS.CHANNELS, params],
    queryFn: () => api.channels.list(params),
    staleTime: 1000 * 60 * 5,
  });
};

export const useCreateChannel = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { name: string; description?: string; isPrivate?: boolean }) =>
      api.channels.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CHANNELS] });
      successToast('Channel created successfully');
    },
    onError: (error: any) => {
      errorToast(error.response?.data?.message || 'Failed to create channel');
    },
  });
};

export const useJoinChannel = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (channelId: string) => api.channels.join(channelId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CHANNELS] });
      successToast('Joined channel successfully');
    },
    onError: (error: any) => {
      errorToast(error.response?.data?.message || 'Failed to join channel');
    },
  });
};

export const useLeaveChannel = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (channelId: string) => api.channels.leave(channelId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CHANNELS] });
      successToast('Left channel successfully');
    },
    onError: (error: any) => {
      errorToast(error.response?.data?.message || 'Failed to leave channel');
    },
  });
};

export const useDeleteChannel = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (channelId: string) => api.channels.delete(channelId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CHANNELS] });
      successToast('Channel deleted successfully');
    },
    onError: (error: any) => {
      errorToast(error.response?.data?.message || 'Failed to delete channel');
    },
  });
};
