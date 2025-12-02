import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/services/api';
import { QUERY_KEYS } from '@/config';
import { useAuth } from '@/hooks';
import { ChannelItem, CreateChannelModal } from '@/components/channels';
import { Button, EmptyState, LoadingSpinner, SearchInput } from '@/components/common';
import { Plus, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ChatPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: [QUERY_KEYS.CHANNELS],
    queryFn: () => api.channels.list({ limit: 100 }),
  });

  const joinMutation = useMutation({
    mutationFn: (channelId: string) => api.channels.join(channelId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CHANNELS] });
    },
  });

  const leaveMutation = useMutation({
    mutationFn: (channelId: string) => api.channels.leave(channelId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CHANNELS] });
    },
  });

  const filteredChannels = data?.data?.filter(
    (channel: any) =>
      channel.name.toLowerCase().includes(search.toLowerCase()) ||
      channel.description?.toLowerCase().includes(search.toLowerCase())
  ) || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <EmptyState title="Failed to load channels" description="Please try again later" />
      </div>
    );
  }

  return (
    <div className="h-full p-4 md:p-6">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <MessageSquare className="w-6 h-6 text-primary-600" />
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Channels</h1>
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              {user ? `Welcome back, ${user.username}!` : 'Browse and join channels'}
            </p>
          </div>

          <Button
            onClick={() => setShowCreateModal(true)}
            variant="primary"
            leftIcon={<Plus size={20} />}
          >
            New Channel
          </Button>
        </div>

        <div className="flex-1 max-w-md">
          <SearchInput value={search} onChange={setSearch} placeholder="Search channels..." />
        </div>

        {filteredChannels && filteredChannels.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredChannels.map((channel: any) => {
              const id = channel.channelId ?? channel._id ?? channel.id;
              return (
                <ChannelItem
                  key={id}
                  channel={channel}
                  onJoin={() => joinMutation.mutate(id)}
                  onLeave={() => leaveMutation.mutate(id)}
                  isJoining={joinMutation.isPending}
                  isLeaving={leaveMutation.isPending}
                  onClick={() => navigate(`/chat/${id}`)}
                />
              );
            })}
          </div>
        ) : (
          <EmptyState
            title={search ? 'No channels found' : 'No channels available'}
            description={search ? 'Try a different search' : 'Create your first channel to get started'}
            icon="channel"
            action={{
              label: 'Create Channel',
              onClick: () => setShowCreateModal(true),
            }}
          />
        )}

        <CreateChannelModal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} />
      </div>
    </div>
  );
};

export default ChatPage;
