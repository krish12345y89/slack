import React from 'react';
import { Channel } from '@/types';
import { Lock, Users, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/common';
import { useNavigate } from 'react-router-dom';

interface ChannelHeaderProps {
  channel: Channel;
  onLeave?: () => void;
}

const ChannelHeader: React.FC<ChannelHeaderProps> = ({ channel, onLeave }) => {
  const navigate = useNavigate();

  return (
    <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/chat')}
          leftIcon={<ArrowLeft size={20} />}
          className="lg:hidden"
        >
          Back
        </Button>
        <div>
          <div className="flex items-center space-x-2">
            {channel.isPrivate ? (
              <Lock className="w-5 h-5 text-gray-400" />
            ) : (
              <Users className="w-5 h-5 text-gray-400" />
            )}
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">{channel.name}</h2>
          </div>
          {channel.description && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{channel.description}</p>
          )}
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {channel.memberCount} members
        </span>
        {onLeave && (
          <Button variant="danger" size="sm" onClick={onLeave}>
            Leave
          </Button>
        )}
      </div>
    </div>
  );
};

export default ChannelHeader;
