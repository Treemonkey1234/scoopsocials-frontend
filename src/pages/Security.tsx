import React, { useState } from "react";
// @ts-ignore
import { useNavigate } from "react-router-dom";

type LoginSession = {
  id: string;
  device: string;
  location: string;
  ipAddress: string;
  lastActive: string;
  isCurrent: boolean;
  trusted: boolean;
};

type SecurityEvent = {
  id: string;
  type: 'login' | 'logout' | 'password_change' | '2fa_enabled' | '2fa_disabled' | 'suspicious_activity';
  description: string;
  timestamp: string;
  location: string;
  device: string;
  ipAddress: string;
};

type PrivacySetting = {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  category: 'profile' | 'activity' | 'location' | 'social' | 'data';
};

// Mock data
const mockLoginSessions: LoginSession[] = [
  {
    id: "1",
    device: "iPhone 15 Pro",
    location: "New York, NY",
    ipAddress: "192.168.1.100",
    lastActive: "2 minutes ago",
    isCurrent: true,
    trusted: true
  },
  {
    id: "2",
    device: "MacBook Pro",
    location: "New York, NY",
    ipAddress: "192.168.1.101",
    lastActive: "1 hour ago",
    isCurrent: false,
    trusted: true
  },
  {
    id: "3",
    device: "Unknown Device",
    location: "San Francisco, CA",
    ipAddress: "203.0.113.45",
    lastActive: "3 days ago",
    isCurrent: false,
    trusted: false
  }
];

const mockSecurityEvents: SecurityEvent[] = [
  {
    id: "1",
    type: "login",
    description: "Successful login from iPhone 15 Pro",
    timestamp: "2024-06-19 14:30:00",
    location: "New York, NY",
    device: "iPhone 15 Pro",
    ipAddress: "192.168.1.100"
  },
  {
    id: "2",
    type: "2fa_enabled",
    description: "Two-factor authentication enabled",
    timestamp: "2024-06-18 10:15:00",
    location: "New York, NY",
    device: "MacBook Pro",
    ipAddress: "192.168.1.101"
  },
  {
    id: "3",
    type: "suspicious_activity",
    description: "Failed login attempt from unknown device",
    timestamp: "2024-06-15 22:45:00",
    location: "San Francisco, CA",
    device: "Unknown Device",
    ipAddress: "203.0.113.45"
  }
];

const mockPrivacySettings: PrivacySetting[] = [
  {
    id: "1",
    name: "Profile Visibility",
    description: "Control who can see your profile information",
    enabled: true,
    category: "profile"
  },
  {
    id: "2",
    name: "Activity Status",
    description: "Show when you're active on the platform",
    enabled: false,
    category: "activity"
  },
  {
    id: "3",
    name: "Location Sharing",
    description: "Share your location with friends",
    enabled: true,
    category: "location"
  },
  {
    id: "4",
    name: "Social Connections",
    description: "Allow others to see your friend list",
    enabled: false,
    category: "social"
  },
  {
    id: "5",
    name: "Data Analytics",
    description: "Help improve the platform with anonymous data",
    enabled: true,
    category: "data"
  }
];

export default function Security() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [showTwoFactorModal, setShowTwoFactorModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showSessionsModal, setShowSessionsModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  const getEventIcon = (type: SecurityEvent['type']) => {
    switch (type) {
      case 'login': return '🔓';
      case 'logout': return '🔒';
      case 'password_change': return '🔑';
      case '2fa_enabled': return '🔐';
      case '2fa_disabled': return '🔓';
      case 'suspicious_activity': return '⚠️';
      default: return '📝';
    }
  };

  const getEventColor = (type: SecurityEvent['type']) => {
    switch (type) {
      case 'login': return 'text-green-600';
      case 'logout': return 'text-gray-600';
      case 'password_change': return 'text-blue-600';
      case '2fa_enabled': return 'text-green-600';
      case '2fa_disabled': return 'text-red-600';
      case 'suspicious_activity': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const handleTerminateSession = (sessionId: string) => {
    if (confirm("Are you sure you want to terminate this session?")) {
      alert(`Session ${sessionId} terminated`);
    }
  };

  const handleEnable2FA = () => {
    setShowTwoFactorModal(true);
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Security Score */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-800">Security Score</h3>
            <div className="text-2xl font-bold text-green-600">85/100</div>
            <div className="text-sm text-gray-600">Good security practices</div>
          </div>
          <div className="text-right">
            <div className="text-4xl">🛡️</div>
          </div>
        </div>
        <div className="mt-3 bg-white rounded-full h-2">
          <div className="bg-green-500 h-2 rounded-full" style={{ width: '85%' }}></div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={handleEnable2FA}
          className="p-4 bg-purple-50 rounded-lg text-center hover:bg-purple-100 transition-colors"
        >
          <div className="text-2xl mb-1">🔐</div>
          <div className="text-sm font-medium text-purple-700">Two-Factor Auth</div>
          <div className="text-xs text-gray-600">{twoFactorEnabled ? 'Enabled' : 'Disabled'}</div>
        </button>
        
        <button
          onClick={() => setShowSessionsModal(true)}
          className="p-4 bg-blue-50 rounded-lg text-center hover:bg-blue-100 transition-colors"
        >
          <div className="text-2xl mb-1">💻</div>
          <div className="text-sm font-medium text-blue-700">Active Sessions</div>
          <div className="text-xs text-gray-600">{mockLoginSessions.length} devices</div>
        </button>
        
        <button
          onClick={() => setShowHistoryModal(true)}
          className="p-4 bg-green-50 rounded-lg text-center hover:bg-green-100 transition-colors"
        >
          <div className="text-2xl mb-1">📱</div>
          <div className="text-sm font-medium text-green-700">Login History</div>
          <div className="text-xs text-gray-600">Recent activity</div>
        </button>
        
        <button
          onClick={() => setShowPrivacyModal(true)}
          className="p-4 bg-orange-50 rounded-lg text-center hover:bg-orange-100 transition-colors"
        >
          <div className="text-2xl mb-1">🛡️</div>
          <div className="text-sm font-medium text-orange-700">Privacy Settings</div>
          <div className="text-xs text-gray-600">Data control</div>
        </button>
      </div>

      {/* Recent Security Events */}
      <div>
        <h3 className="font-semibold text-gray-800 mb-3">Recent Security Events</h3>
        <div className="space-y-2">
          {mockSecurityEvents.slice(0, 3).map(event => (
            <div key={event.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <div className="text-xl">{getEventIcon(event.type)}</div>
              <div className="flex-1">
                <div className={`font-medium text-sm ${getEventColor(event.type)}`}>
                  {event.description}
                </div>
                <div className="text-xs text-gray-500">
                  {event.timestamp} • {event.location}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderPrivacy = () => (
    <div className="space-y-4">
      {mockPrivacySettings.map(setting => (
        <div key={setting.id} className="flex items-center justify-between p-4 bg-white rounded-lg border">
          <div className="flex-1">
            <div className="font-medium text-gray-800">{setting.name}</div>
            <div className="text-sm text-gray-600">{setting.description}</div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={setting.enabled}
              onChange={() => {}}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
          </label>
        </div>
      ))}
    </div>
  );

  const renderSessions = () => (
    <div className="space-y-4">
      {mockLoginSessions.map(session => (
        <div key={session.id} className="flex items-center justify-between p-4 bg-white rounded-lg border">
          <div className="flex items-center space-x-3">
            <div className="text-2xl">
              {session.device.includes('iPhone') ? '📱' : 
               session.device.includes('MacBook') ? '💻' : '🖥️'}
            </div>
            <div>
              <div className="font-medium text-gray-800">{session.device}</div>
              <div className="text-sm text-gray-600">{session.location}</div>
              <div className="text-xs text-gray-500">
                {session.ipAddress} • {session.lastActive}
                {session.isCurrent && <span className="ml-2 text-green-600">• Current</span>}
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {session.trusted && (
              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                Trusted
              </span>
            )}
            {!session.isCurrent && (
              <button
                onClick={() => handleTerminateSession(session.id)}
                className="text-xs text-red-600 hover:text-red-700"
              >
                Terminate
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );

  const renderHistory = () => (
    <div className="space-y-3">
      {mockSecurityEvents.map(event => (
        <div key={event.id} className="flex items-start space-x-3 p-3 bg-white rounded-lg border">
          <div className="text-xl mt-1">{getEventIcon(event.type)}</div>
          <div className="flex-1">
            <div className={`font-medium text-sm ${getEventColor(event.type)}`}>
              {event.description}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {event.timestamp} • {event.location} • {event.device}
            </div>
            <div className="text-xs text-gray-400">{event.ipAddress}</div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-white border-b">
        <button 
          onClick={() => navigate('/settings')}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100"
        >
          <span className="sr-only">Back</span>
          <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-lg font-semibold">Security & Privacy</h1>
        <div className="w-10"></div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b">
        <div className="flex">
          {["overview", "privacy", "sessions", "history"].map(tab => (
            <button
              key={tab}
              className={`flex-1 py-3 text-center font-medium text-sm transition-colors ${
                activeTab === tab 
                  ? 'border-b-2 border-purple-600 text-purple-600' 
                  : 'text-gray-500'
              }`}
              onClick={() => setActiveTab(tab)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {activeTab === "overview" && renderOverview()}
        {activeTab === "privacy" && renderPrivacy()}
        {activeTab === "sessions" && renderSessions()}
        {activeTab === "history" && renderHistory()}
      </div>

      {/* Two-Factor Authentication Modal */}
      {showTwoFactorModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">Two-Factor Authentication</h3>
              
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-4xl mb-2">🔐</div>
                  <p className="text-gray-600">
                    Add an extra layer of security to your account
                  </p>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-800 mb-2">How it works:</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Download an authenticator app (Google Authenticator, Authy)</li>
                    <li>• Scan the QR code or enter the setup key</li>
                    <li>• Enter the 6-digit code to verify</li>
                    <li>• Use the code for future logins</li>
                  </ul>
                </div>
              </div>
              
              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => setShowTwoFactorModal(false)}
                  className="flex-1 py-2 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setTwoFactorEnabled(true);
                    setShowTwoFactorModal(false);
                  }}
                  className="flex-1 py-2 px-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  Enable 2FA
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Privacy Settings Modal */}
      {showPrivacyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold">Privacy Settings</h3>
              <button
                onClick={() => setShowPrivacyModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <div className="p-4 overflow-y-auto max-h-96">
              {renderPrivacy()}
            </div>
          </div>
        </div>
      )}

      {/* Active Sessions Modal */}
      {showSessionsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold">Active Sessions</h3>
              <button
                onClick={() => setShowSessionsModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <div className="p-4 overflow-y-auto max-h-96">
              {renderSessions()}
            </div>
          </div>
        </div>
      )}

      {/* Login History Modal */}
      {showHistoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold">Login History</h3>
              <button
                onClick={() => setShowHistoryModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <div className="p-4 overflow-y-auto max-h-96">
              {renderHistory()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 