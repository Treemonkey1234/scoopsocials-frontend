import React from 'react';

interface DemoBadgeProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function DemoBadge({ className = '', size = 'sm' }: DemoBadgeProps) {
  const sizeClasses = {
    sm: 'text-xs px-1.5 py-0.5',
    md: 'text-sm px-2 py-1',
    lg: 'text-base px-3 py-1.5'
  };

  return (
    <span 
      className={`
        inline-flex items-center rounded-full 
        bg-purple-100 text-purple-800 font-medium
        ${sizeClasses[size]}
        ${className}
      `}
    >
      Demo
    </span>
  );
} 