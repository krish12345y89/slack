import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { MessageSquare, Settings, Home, Menu, X } from 'lucide-react';
import { useAuth } from '@/hooks';
import Button from '@/components/common/Button';
import { ROUTES } from '@/config';

const Sidebar: React.FC = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(true);

  if (!user) return null;

  const navItems = [
    { icon: MessageSquare, label: 'Chat', path: ROUTES.CHAT },
    { icon: Settings, label: 'Settings', path: ROUTES.SETTINGS },
  ];

  return (
    <>
      {/* Mobile Toggle */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsOpen(!isOpen)}
          className="bg-white dark:bg-gray-800"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </Button>
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed lg:static left-0 top-0 h-screen w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } z-40 flex flex-col`}
      >
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2">
            <Home className="w-8 h-8 text-primary-600" />
            <span className="text-xl font-bold text-gray-900 dark:text-gray-100">Chat App</span>
          </div>
        </div>

        <nav className="flex-1 p-6 space-y-2">
          {navItems.map(({ icon: Icon, label, path }) => (
            <NavLink
              key={path}
              to={path}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'
                    : 'text-gray-700 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`
              }
              onClick={() => setIsOpen(false)}
            >
              <Icon size={20} />
              <span className="font-medium">{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-6 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-600 dark:text-gray-400 text-center">
            Enterprise Chat v1.0.0
          </p>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 lg:hidden z-30"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};

export default Sidebar;
