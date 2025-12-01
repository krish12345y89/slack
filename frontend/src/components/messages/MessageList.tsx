import React, { useMemo } from 'react';
import { Message } from '@/types';
import MessageItem from './MessageItem';
import { format } from 'date-fns';

interface MessageListProps {
  messages: Message[];
  currentUserId?: string;
  onEditMessage?: (message: Message) => void;
  onDeleteMessage?: (messageId: string) => void;
}

const MessageList: React.FC<MessageListProps> = ({
  messages,
  currentUserId,
  onEditMessage,
  onDeleteMessage,
}) => {
  const groupedMessages = useMemo(() => {
    const groups: { [key: string]: Message[] } = {};

    messages.forEach((msg) => {
      const dateKey = format(new Date(msg.createdAt), 'yyyy-MM-dd');
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(msg);
    });

    return groups;
  }, [messages]);

  return (
    <div className="space-y-4">
      {Object.entries(groupedMessages).map(([date, msgs]) => (
        <div key={date}>
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-gray-300 dark:bg-gray-700" />
            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
              {format(new Date(date), 'MMM d, yyyy')}
            </span>
            <div className="flex-1 h-px bg-gray-300 dark:bg-gray-700" />
          </div>

          <div className="space-y-3">
            {msgs.map((msg) => (
              <MessageItem
                key={msg.messageId}
                message={msg}
                isOwn={msg.userId === currentUserId}
                onEdit={onEditMessage}
                onDelete={onDeleteMessage}
              />
            ))}
          </div>
        </div>
      ))}

      {messages.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">No messages yet. Start the conversation!</p>
        </div>
      )}
    </div>
  );
};

export default MessageList;
