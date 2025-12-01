import React from 'react';
import { AlertCircle } from 'lucide-react';

interface ErrorAlertProps {
  title: string;
  message?: string;
}

const ErrorAlert: React.FC<ErrorAlertProps> = ({ title, message }) => {
  return (
    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-start gap-3">
      <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
      <div>
        <h3 className="font-semibold text-red-800 dark:text-red-200">{title}</h3>
        {message && <p className="text-sm text-red-700 dark:text-red-300 mt-1">{message}</p>}
      </div>
    </div>
  );
};

export default ErrorAlert;
