import React from 'react';
import { AlertCircle, Home, MessageSquare } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: 'alert' | 'channel' | 'message' | 'home';
  action?: {
    label: string;
    onClick: () => void;
  };
}

const EmptyState: React.FC<EmptyStateProps> = ({ title, description, icon, action }) => {
  const icons = {
    alert: <AlertCircle className="w-16 h-16 text-gray-400" />,
    channel: <MessageSquare className="w-16 h-16 text-gray-400" />,
    message: <MessageSquare className="w-16 h-16 text-gray-400" />,
    home: <Home className="w-16 h-16 text-gray-400" />,
  };

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      {icons[icon || 'alert']}
      <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-gray-100">{title}</h3>
      {description && <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{description}</p>}
      {action && (
        <button
          onClick={action.onClick}
          className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          {action.label}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
