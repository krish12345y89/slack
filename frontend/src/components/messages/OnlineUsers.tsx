import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/api';
import { socketService } from '@/services/socket';
import { QUERY_KEYS } from '@/config';
import { Users } from 'lucide-react';
import LoadingSpinner from '@/components/common/LoadingSpinner';

interface OnlineUsersProps {
  channelId: string;
}

const OnlineUsers: React.FC<OnlineUsersProps> = ({ channelId }) => {
  const [onlineUsers, setOnlineUsers] = useState<any[]>([]);

  const { data, isLoading } = useQuery({
    queryKey: [QUERY_KEYS.ONLINE_USERS, channelId],
    queryFn: () => api.socket.getOnlineUsers(),
    refetchInterval: 10000,
  });

  useEffect(() => {
    if (data?.data) {
      setOnlineUsers(data.data);
    }

    const handleUserOnline = (user: any) => {
      setOnlineUsers((prev) => {
        const existing = prev.find((u) => u.userId === user.userId);
        if (existing) {
          return prev.map((u) =>
            u.userId === user.userId
              ? { ...u, sockets: (u.sockets || 0) + 1 }
              : u
          );
        }
        return [...prev, user];
      });
    };

    const handleUserOffline = (userId: string) => {
      setOnlineUsers((prev) =>
        prev
          .map((u) =>
            u.userId === userId
              ? { ...u, sockets: Math.max(0, (u.sockets || 1) - 1) }
              : u
          )
          .filter((u) => u.sockets > 0)
      );
    };

    socketService.on('user:online', handleUserOnline);
    socketService.on('user:offline', handleUserOffline);

    return () => {
      socketService.off('user:online');
      socketService.off('user:offline');
    };
  }, [data]);

  if (isLoading) {
    return <LoadingSpinner size="sm" />;
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <Users size={20} className="text-gray-600 dark:text-gray-400" />
          <h3 className="font-semibold text-gray-900 dark:text-gray-100">
            Online ({onlineUsers.length})
          </h3>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {onlineUsers.map((user) => (
          <div
            key={user.userId}
            className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
              {user.username[0].toUpperCase()}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {user.username}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {user.sockets || 1} socket
              </p>
            </div>
            <div className="w-2 h-2 bg-green-500 rounded-full" />
          </div>
        ))}

        {onlineUsers.length === 0 && (
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">
            No users online
          </p>
        )}
      </div>
    </div>
  );
};

export default OnlineUsers;
