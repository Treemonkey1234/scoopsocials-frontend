import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import Home from "./pages/Home";
import Events from "./pages/Events";
import Search from "./pages/Search";
import Inbox from "./pages/Inbox";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import Friends from "./pages/Friends";
import Auth from "./pages/Auth";
import ModeratorPortal from "./pages/ModeratorPortal";
import DesignSystem from "./pages/v2/DesignSystem";
import FooterNav from "./components/FooterNav";
import { WalkthroughModal } from "./components/WalkthroughModal";
import { TestNewUser } from "./components/TestNewUser";
import { DemoProvider } from "./context/DemoContext";
import { UserProvider } from "./context/UserContext";

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  // Check if user is authenticated
  const isAuthenticated = localStorage.getItem('auth_token');

  if (!isAuthenticated) {
    // Redirect them to the /auth page, but save the current location they were
    // trying to go to when they were redirected.
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
};

function App() {
  const location = useLocation();
  const isAuthPage = location.pathname === '/auth';
  const [showWalkthrough, setShowWalkthrough] = useState(false);

  useEffect(() => {
    // Check if user just completed authentication and hasn't seen walkthrough
    const isAuthenticated = localStorage.getItem('auth_token');
    const walkthroughCompleted = localStorage.getItem('walkthroughCompleted');
    const isNewUser = localStorage.getItem('isNewUser') === 'true';

    if (isAuthenticated && !walkthroughCompleted && isNewUser) {
      setShowWalkthrough(true);
    }
  }, [location.pathname]);

  const handleWalkthroughComplete = () => {
    setShowWalkthrough(false);
    localStorage.removeItem('isNewUser'); // Clean up the flag
  };

  const handleWalkthroughClose = () => {
    setShowWalkthrough(false);
    localStorage.removeItem('isNewUser'); // Clean up the flag
  };

  return (
    <UserProvider>
      <DemoProvider>
        <div className="App">
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/design-system" element={<DesignSystem />} />
            <Route path="/home" element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            } />
            <Route path="/events" element={
              <ProtectedRoute>
                <Events />
              </ProtectedRoute>
            } />
            <Route path="/search" element={
              <ProtectedRoute>
                <Search />
              </ProtectedRoute>
            } />
            <Route path="/inbox" element={
              <ProtectedRoute>
                <Inbox />
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } />
            <Route path="/settings" element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            } />
            <Route path="/friends" element={
              <ProtectedRoute>
                <Friends />
              </ProtectedRoute>
            } />
            <Route path="/moderator-portal" element={
              <ProtectedRoute>
                <ModeratorPortal />
              </ProtectedRoute>
            } />
            <Route path="/" element={<Navigate to="/home" replace />} />
          </Routes>
          {!isAuthPage && <FooterNav />}
          
          <WalkthroughModal
            isOpen={showWalkthrough}
            onClose={handleWalkthroughClose}
            onComplete={handleWalkthroughComplete}
          />
          
          {/* Development tools - remove in production */}
          {process.env.NODE_ENV === 'development' && <TestNewUser />}
        </div>
      </DemoProvider>
    </UserProvider>
  );
}

export default App;
