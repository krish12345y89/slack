import React from 'react';
import { Lock, Users } from 'lucide-react';
import { Channel } from '@/types';
import { Button } from '@/components/common';

interface ChannelItemProps {
  channel: Channel;
  onJoin: () => void;
  onLeave: () => void;
  isJoining: boolean;
  isLeaving: boolean;
  onClick?: () => void;
}

const ChannelItem: React.FC<ChannelItemProps> = ({
  channel,
  onJoin,
  onLeave,
  isJoining,
  isLeaving,
  onClick,
}) => {
  return (
    <Card className="p-4 hover:shadow-lg transition-shadow cursor-pointer" onClick={onClick}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-2 flex-1">
          {channel.isPrivate ? (
            <Lock className="w-5 h-5 text-gray-400" />
          ) : (
            <Users className="w-5 h-5 text-gray-400" />
          )}
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate">
            {channel.name}
          </h3>
        </div>
      </div>

      {channel.description && (
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
          {channel.description}
        </p>
      )}

      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {channel.memberCount || 0} members
        </span>
        <Button
          onClick={(e) => {
            e.stopPropagation();
            channel.isMember ? onLeave() : onJoin();
          }}
          variant={channel.isMember ? 'danger' : 'primary'}
          size="sm"
          loading={isJoining || isLeaving}
          disabled={isJoining || isLeaving}
        >
          {channel.isMember ? 'Leave' : 'Join'}
        </Button>
      </div>
    </Card>
  );
};

import { Card } from '@/components/common';

export default ChannelItem;
