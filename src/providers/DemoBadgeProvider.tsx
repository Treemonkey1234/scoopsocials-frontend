import React from 'react';
import { useDemoMode } from '../context/DemoContext';
import DemoBadge from '../components/DemoBadge';

interface DemoBadgeProviderProps {
  children: React.ReactNode;
  contentType: 'post' | 'event' | 'user' | 'message';
  isDemo?: boolean;
  className?: string;
}

export default function DemoBadgeProvider({
  children,
  contentType,
  isDemo,
  className = ''
}: DemoBadgeProviderProps) {
  const { isDemoMode } = useDemoMode();

  // Don't show badge if demo mode is off or content isn't demo content
  if (!isDemoMode || !isDemo) {
    return <>{children}</>;
  }

  const badgePositions = {
    post: 'top-2 right-2',
    event: 'top-2 right-2',
    user: 'bottom-2 right-2',
    message: 'top-2 right-2'
  };

  return (
    <div className={`relative ${className}`}>
      {children}
      <div className={`absolute ${badgePositions[contentType]} z-10`}>
        <DemoBadge size="sm" />
      </div>
    </div>
  );
} 