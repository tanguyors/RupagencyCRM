import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Home, 
  Phone, 
  Calendar, 
  Building2, 
  BarChart3, 
  Users, 
  Settings,
  Sun,
  Moon,
  LogOut,
  Globe
} from 'lucide-react';
import useStore from '../../store/useStore';
import { useLanguage } from '../../contexts/LanguageContext';
import LanguageSelector from '../ui/LanguageSelector';

const Sidebar = () => {
  const { user, isDarkMode, toggleTheme, logout, isAdmin } = useStore();
  const { t } = useLanguage();
  
  const menuItems = [
    { path: '/dashboard', icon: Home, label: t('dashboard') },
    { path: '/calls', icon: Phone, label: t('calls') },
    { path: '/appointments', icon: Calendar, label: t('appointments') },
    { path: '/companies', icon: Building2, label: t('companies') },
    { path: '/stats', icon: BarChart3, label: t('stats') },
    ...(isAdmin ? [{ path: '/admin', icon: Users, label: t('admin') }] : []),
  ];

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="w-64 bg-white dark:bg-dark-800 border-r border-dark-200 dark:border-dark-700 h-screen flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-dark-200 dark:border-dark-700">
        <h1 className="text-2xl font-bold text-primary-600 dark:text-primary-400">
          Rupagency
        </h1>
        <p className="text-sm text-dark-600 dark:text-dark-400 mt-1">
          CRM Closers
        </p>
      </div>

      {/* User Info */}
      <div className="p-4 border-b border-dark-200 dark:border-dark-700">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center">
            <span className="text-primary-600 dark:text-primary-400 font-semibold text-sm">
              {user?.avatar || 'U'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-dark-900 dark:text-cream-50 truncate">
              {user?.name}
            </p>
            <p className="text-xs text-dark-500 dark:text-dark-400 truncate">
              {user?.role === 'admin' ? t('admin') : t('closer')}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `sidebar-item ${isActive ? 'active' : ''}`
            }
          >
            <item.icon className="w-5 h-5 mr-3" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-dark-200 dark:border-dark-700 space-y-2">
        {/* Language Selector */}
        <div className="flex items-center space-x-2 mb-2">
          <Globe className="w-5 h-5 text-dark-400" />
          <LanguageSelector />
        </div>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="sidebar-item w-full justify-between"
        >
          <div className="flex items-center">
            {isDarkMode ? <Moon className="w-5 h-5 mr-3" /> : <Sun className="w-5 h-5 mr-3" />}
            {isDarkMode ? t('darkMode') : t('lightMode')}
          </div>
        </button>

        {/* Settings */}
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `sidebar-item ${isActive ? 'active' : ''}`
          }
        >
          <Settings className="w-5 h-5 mr-3" />
          {t('settings')}
        </NavLink>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="sidebar-item w-full text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
        >
          <LogOut className="w-5 h-5 mr-3" />
          {t('logout')}
        </button>
      </div>
    </div>
  );
};

export default Sidebar; 