import React, { useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/services/api';
import { socketService } from '@/services/socket';
import { QUERY_KEYS } from '@/config';
import { useAuth } from '@/hooks';
import { useSendMessage, useDeleteMessage } from '@/hooks/useMessages';
import { ChannelHeader } from '@/components/channels';
import { MessageList, MessageInput, OnlineUsers } from '@/components/messages';
import { LoadingSpinner, ErrorAlert } from '@/components/common';
import { errorToast } from '@/utils/toast';

const ChannelPage: React.FC = () => {
  const { channelId } = useParams<{ channelId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: channelData, isLoading: isLoadingChannel } = useQuery({
    queryKey: [QUERY_KEYS.CHANNELS, channelId],
    queryFn: () => api.channels.get(channelId!),
    enabled: !!channelId,
  });

  const { data: messagesData, isLoading: isLoadingMessages } = useQuery({
    queryKey: [QUERY_KEYS.MESSAGES, channelId],
    queryFn: () => api.messages.list(channelId!, { limit: 50 }),
    enabled: !!channelId,
    refetchInterval: 30000,
  });

  const sendMessageMutation = useSendMessage();
  const deleteMessageMutation = useDeleteMessage();

  const leaveMutation = useMutation({
    mutationFn: (id: string) => api.channels.leave(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CHANNELS] });
      navigate('/chat');
    },
  });

  useEffect(() => {
    if (!channelId || !user) return;

    socketService.joinChannel(channelId);

    const handleNewMessage = () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.MESSAGES, channelId],
      });
    };

    socketService.on('message:new', handleNewMessage);
    socketService.on('message:update', handleNewMessage);
    socketService.on('message:delete', handleNewMessage);

    return () => {
      socketService.leaveChannel(channelId);
      socketService.off('message:new');
      socketService.off('message:update');
      socketService.off('message:delete');
    };
  }, [channelId, user, queryClient]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messagesData]);

  // Dev-time debug: always declare this effect (to avoid hook order changes).
  useEffect(() => {
    if (channelId) {
      console.log('[ChannelPage]', {
        channelId,
        channelDataDefined: !!channelData,
        channelData,
        isLoadingChannel,
        messagesDataDefined: !!messagesData,
        isLoadingMessages,
      });
    }
  }, [channelId, channelData, messagesData, isLoadingChannel, isLoadingMessages]);

  if (isLoadingChannel || isLoadingMessages) {
    return (
      <div className="flex items-center justify-center h-full">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Normalize API response shapes: API returns response.data via interceptor
  // getChannelById returns { channel }, others may return channel directly
  const channel = channelData?.data?.channel || channelData?.data || channelData;
  if (!channelId || !channel) {
    return (
      <div className="flex items-center justify-center h-full p-4">
        <ErrorAlert title="Channel not found" message="The channel you're looking for doesn't exist" />
      </div>
    );
  }

  const messagesPayload = messagesData?.data || messagesData;
  const messages = messagesPayload?.data || messagesPayload || [];

  

  return (
    <div className="flex flex-col h-full">
      <ChannelHeader
        channel={channel}
        onLeave={() => {
          if (!channelId) {
            errorToast('Unable to leave channel: channel id not available');
            return;
          }

          leaveMutation.mutate(channelId);
        }}
      />

      <div className="flex flex-1 overflow-hidden gap-4 p-4">
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto space-y-4 mb-4">
            <MessageList
              messages={messages}
              currentUserId={user?.userId}
              onDeleteMessage={(id) => deleteMessageMutation.mutate(id)}
            />
            <div ref={messagesEndRef} />
          </div>

          <MessageInput
            onSend={(content) => {
              if (!channelId) {
                errorToast('Unable to send message: channel not found');
                return;
              }

              sendMessageMutation.mutate({
                channelId,
                content,
              });
            }}
            disabled={sendMessageMutation.isPending}
            isTyping={sendMessageMutation.isPending}
          />
        </div>

        <div className="hidden lg:block w-72 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <OnlineUsers channelId={channelId} />
        </div>
      </div>
    </div>
  );
};

export default ChannelPage;
