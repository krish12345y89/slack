import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Settings, Moon, Sun } from 'lucide-react';
import { useAuth } from '@/hooks';
import { useTheme } from '@/contexts/ThemeContext';
import Button from '@/components/common/Button';

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  if (!user) return null;

  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white font-bold">
          {user.username[0].toUpperCase()}
        </div>
        <div>
          <p className="font-semibold text-gray-900 dark:text-gray-100">{user.username}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">{user.email}</p>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Button variant="ghost" size="sm" onClick={toggleTheme} title="Toggle theme">
          {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/settings')}
          leftIcon={<Settings size={20} />}
        >
          Settings
        </Button>
        <Button variant="danger" size="sm" onClick={logout} leftIcon={<LogOut size={20} />}>
          Logout
        </Button>
      </div>
    </header>
  );
};

export default Header;
