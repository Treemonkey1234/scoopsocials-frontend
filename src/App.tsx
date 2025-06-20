import React from "react";
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
        </div>
      </DemoProvider>
    </UserProvider>
  );
}

export default App;
