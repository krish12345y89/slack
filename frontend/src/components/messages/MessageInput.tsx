import React, { useState } from 'react';
import { Send, Loader } from 'lucide-react';
import Button from '@/components/common/Button';

interface MessageInputProps {
  onSend: (content: string) => void;
  disabled?: boolean;
  isTyping?: boolean;
  onTypingChange?: (typing: boolean) => void;
  placeholder?: string;
}

const MessageInput: React.FC<MessageInputProps> = ({
  onSend,
  disabled = false,
  isTyping = false,
  placeholder = 'Type a message...',
}) => {
  const [content, setContent] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (content.trim()) {
      onSend(content);
      setContent('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-3 items-end">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        rows={1}
        className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none transition-all max-h-32"
        style={{
          minHeight: '44px',
          height: content ? `${Math.min(content.split('\n').length * 24 + 20, 128)}px` : '44px',
        }}
      />

      <Button
        type="submit"
        variant="primary"
        size="md"
        disabled={disabled || !content.trim() || isTyping}
        loading={isTyping}
        rightIcon={isTyping ? <Loader className="animate-spin" size={20} /> : <Send size={20} />}
      >
        {isTyping ? 'Sending...' : 'Send'}
      </Button>
    </form>
  );
};

export default MessageInput;
