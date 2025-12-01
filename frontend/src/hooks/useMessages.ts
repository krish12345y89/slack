import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/services/api';
import { QUERY_KEYS, PAGINATION } from '@/config';
import { successToast, errorToast } from '@/utils/toast';

export const useMessages = (channelId: string, params?: { page?: number; limit?: number }) => {
  return useQuery({
    queryKey: [QUERY_KEYS.MESSAGES, channelId, params],
    queryFn: () =>
      api.messages.list(channelId, {
        limit: PAGINATION.MESSAGE_LIMIT,
        ...params,
      }),
    enabled: !!channelId,
    staleTime: 1000 * 60,
  });
};

export const useSendMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ channelId, content, type }: { channelId: string; content: string; type?: string }) =>
      api.messages.create(channelId, { content, type }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.MESSAGES, variables.channelId],
      });
      successToast('Message sent');
    },
    onError: (error: any) => {
      errorToast(error.response?.data?.message || 'Failed to send message');
    },
  });
};

export const useUpdateMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ messageId, content }: { messageId: string; content: string }) =>
      api.messages.update(messageId, { content }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.MESSAGES] });
      successToast('Message updated');
    },
    onError: (error: any) => {
      errorToast(error.response?.data?.message || 'Failed to update message');
    },
  });
};

export const useDeleteMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (messageId: string) => api.messages.delete(messageId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.MESSAGES] });
      successToast('Message deleted');
    },
    onError: (error: any) => {
      errorToast(error.response?.data?.message || 'Failed to delete message');
    },
  });
};
