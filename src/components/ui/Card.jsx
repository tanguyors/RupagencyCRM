import React from 'react';
import { clsx } from 'clsx';

const Card = ({ 
  children, 
  className = '', 
  padding = 'p-6',
  ...props 
}) => {
  return (
    <div
      className={clsx(
        'bg-white dark:bg-dark-800 rounded-xl shadow-sm border border-dark-200 dark:border-dark-700',
        padding,
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card; 