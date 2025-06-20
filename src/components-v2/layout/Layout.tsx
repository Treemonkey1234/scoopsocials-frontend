import React from 'react';
import BottomNavBar from './BottomNavBar';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="bg-background min-h-screen">
      <main className="pb-16">
        {children}
      </main>
      <BottomNavBar />
    </div>
  );
};

export default Layout; 