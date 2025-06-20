import React from 'react';

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hoverable?: boolean;
  padding?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

const Card: React.FC<CardProps> = ({ 
  children, 
  className = '', 
  onClick, 
  hoverable = false,
  padding = 'md'
}) => {
  const paddingClasses = {
    xs: 'p-2',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
    xl: 'p-8'
  };

  const baseClasses = 'card rounded-lg shadow-sm';
  const hoverClasses = hoverable ? 'hover:shadow-md transition-shadow duration-200' : '';
  const clickClasses = onClick ? 'cursor-pointer' : '';
  const paddingClass = paddingClasses[padding];

  return (
    <div 
      className={`${baseClasses} ${hoverClasses} ${clickClasses} ${paddingClass} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export default Card; 