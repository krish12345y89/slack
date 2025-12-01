import React from 'react';
import { Message } from '@/types';
import { format } from 'date-fns';
import { Trash2, Edit2 } from 'lucide-react';
import Button from '@/components/common/Button';

interface MessageItemProps {
  message: Message;
  isOwn: boolean;
  onEdit?: (message: Message) => void;
  onDelete?: (messageId: string) => void;
}

const MessageItem: React.FC<MessageItemProps> = ({ message, isOwn, onEdit, onDelete }) => {
  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} animate-slide-in`}>
      <div
        className={`max-w-[70%] group flex items-end gap-2 ${
          isOwn ? 'flex-row-reverse' : 'flex-row'
        }`}
      >
        <div
          className={`px-4 py-2 rounded-2xl break-words ${
            isOwn
              ? 'bg-primary-500 text-white rounded-br-none'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-bl-none'
          }`}
        >
          <p className="text-sm">{message.content}</p>
          <p
            className={`text-xs mt-1 ${
              isOwn ? 'text-primary-100' : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            {format(new Date(message.createdAt), 'HH:mm')}
          </p>
        </div>

        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
          {isOwn && (
            <>
              {onEdit && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onEdit(message)}
                  className="p-1"
                >
                  <Edit2 size={16} />
                </Button>
              )}
              {onDelete && (
                <Button
                  size="sm"
                  variant="danger"
                  onClick={() => onDelete(message.messageId)}
                  className="p-1"
                >
                  <Trash2 size={16} />
                </Button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageItem;
