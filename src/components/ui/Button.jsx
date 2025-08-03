import React from 'react';
import { clsx } from 'clsx';

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  disabled = false,
  ...props 
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'bg-primary-600 hover:bg-primary-700 text-white focus:ring-primary-500',
    secondary: 'bg-dark-200 hover:bg-dark-300 text-dark-900 dark:bg-dark-700 dark:hover:bg-dark-600 dark:text-cream-50 focus:ring-dark-500',
    outline: 'border border-dark-300 dark:border-dark-600 bg-transparent hover:bg-dark-50 dark:hover:bg-dark-800 text-dark-900 dark:text-cream-50 focus:ring-dark-500',
    ghost: 'bg-transparent hover:bg-dark-100 dark:hover:bg-dark-800 text-dark-900 dark:text-cream-50 focus:ring-dark-500',
    danger: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500',
  };
  
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };
  
  return (
    <button
      className={clsx(
        baseClasses,
        variants[variant],
        sizes[size],
        className
      )}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button; 