import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDemoMode } from "../context/DemoContext";
import { useUser } from "../context/UserContext";

type MediaItem = {
  id: number;
  type: 'image' | 'video';
  url: string;
  thumbnail?: string;
  caption?: string;
  alt?: string;
  uploadedAt: string;
  size: number;
  category: 'profile' | 'banner' | 'event';
  isActive?: boolean;
};

type Achievement = {
  id: number;
  title: string;
  description: string;
  icon: string;
  earnedAt: string;
  category: string;
};

type MutualFriend = {
  id: number;
  name: string;
  username: string;
  avatar: string;
  trustScore: number;
  mutualFriends: number;
  connectionStrength: number;
};

type SocialStat = {
  posts: number;
  events: number;
  groups: number;
  followers: number;
  following: number;
  trustScore: number;
  verificationLevel: string;
  memberSince: string;
  lastActive: string;
};

type SettingsItem = {
  label: string;
  action: () => void;
  icon: string;
  danger?: boolean;
  toggle?: boolean;
  value?: boolean;
};

type SettingsSection = {
  title: string;
  items: SettingsItem[];
};

// Mock data
const mockMedia: MediaItem[] = [
  {
    id: 1,
    type: 'image',
    url: "https://via.placeholder.com/400x400/6366f1/fff?text=Profile+Pic",
    thumbnail: "https://via.placeholder.com/200x200/6366f1/fff?text=Profile",
    caption: "Current Profile Picture",
    alt: "Profile picture",
    uploadedAt: "2024-06-15",
    size: 2048576,
    category: 'profile',
    isActive: true
  },
  {
    id: 2,
    type: 'image',
    url: "https://via.placeholder.com/1200x400/6366f1/fff?text=Banner+Image",
    thumbnail: "https://via.placeholder.com/300x100/6366f1/fff?text=Banner",
    caption: "Profile Banner",
    alt: "Profile banner",
    uploadedAt: "2024-06-14",
    size: 3072000,
    category: 'banner',
    isActive: true
  },
  {
    id: 3,
    type: 'image',
    url: "https://via.placeholder.com/400x300/f59e0b/fff?text=Event+Photo+1",
    thumbnail: "https://via.placeholder.com/200x150/f59e0b/fff?text=Event1",
    caption: "Central Park Event",
    alt: "Event photo",
    uploadedAt: "2024-06-13",
    size: 1536000,
    category: 'event'
  },
  {
    id: 4,
    type: 'image',
    url: "https://via.placeholder.com/400x300/ef4444/fff?text=Event+Photo+2",
    thumbnail: "https://via.placeholder.com/200x150/ef4444/fff?text=Event2",
    caption: "Food Truck Festival",
    alt: "Event photo",
    uploadedAt: "2024-06-12",
    size: 2048576,
    category: 'event'
  }
];

const mockAchievements: Achievement[] = [
  { id: 1, title: "Trust Pioneer", description: "First 100 connections", icon: "🏆", earnedAt: "2024-01-15", category: "Social" },
  { id: 2, title: "Event Organizer", description: "Hosted 10+ events", icon: "🎉", earnedAt: "2024-02-20", category: "Events" },
  { id: 3, title: "Verified Profile", description: "Completed verification", icon: "✓", earnedAt: "2024-01-10", category: "Trust" },
  { id: 4, title: "Community Builder", description: "Created 5+ groups", icon: "👥", earnedAt: "2024-03-05", category: "Community" }
];

const mockSocialStats: SocialStat = {
  posts: 156,
  events: 23,
  groups: 8,
  followers: 342,
  following: 289,
  trustScore: 87,
  verificationLevel: "Verified",
  memberSince: "January 2024",
  lastActive: "2 hours ago"
};

const mockMutualFriends: MutualFriend[] = [
  { id: 1, name: "Jamie Rivera", username: "@jamier", avatar: "https://via.placeholder.com/40x40/6366f1/fff?text=JR", trustScore: 92, mutualFriends: 15, connectionStrength: 0.85 },
  { id: 2, name: "Taylor Kim", username: "@taylork", avatar: "https://via.placeholder.com/40x40/6366f1/fff?text=TK", trustScore: 78, mutualFriends: 8, connectionStrength: 0.72 },
  { id: 3, name: "Sarah Wilson", username: "@sarahw", avatar: "https://via.placeholder.com/40x40/6366f1/fff?text=SW", trustScore: 88, mutualFriends: 12, connectionStrength: 0.91 },
  { id: 4, name: "Mike Chen", username: "@mikechen", avatar: "https://via.placeholder.com/40x40/6366f1/fff?text=MC", trustScore: 82, mutualFriends: 6, connectionStrength: 0.68 }
];

// Demo tour data for new beta users
const demoSteps = [
  {
    id: 1,
    title: "Welcome to ScoopSocials! 🎉",
    description: "Let's explore all the amazing features you can use to connect, share, and discover events.",
    icon: "🌟",
    action: "Start Tour"
  },
  {
    id: 2,
    title: "Create Your First Post 📝",
    description: "Share your thoughts, photos, and experiences with your trusted network. Use hashtags and location tags to reach more people.",
    icon: "📱",
    action: "Try Posting"
  },
  {
    id: 3,
    title: "Discover Events 📅",
    description: "Find amazing events in your area or create your own. RSVP, invite friends, and track who's going.",
    icon: "🎉",
    action: "Browse Events"
  },
  {
    id: 4,
    title: "Connect with Friends 👥",
    description: "Build your trusted network. Send friend requests, see mutual connections, and view trust scores.",
    icon: "🤝",
    action: "Find Friends"
  },
  {
    id: 5,
    title: "Advanced Search 🔍",
    description: "Search for people, events, posts, and trending topics. Use filters to find exactly what you're looking for.",
    icon: "🔎",
    action: "Try Search"
  },
  {
    id: 6,
    title: "Analytics & Insights 📊",
    description: "Track your engagement, see trending topics, and understand your audience with detailed analytics.",
    icon: "📈",
    action: "View Analytics"
  },
  {
    id: 7,
    title: "Security & Privacy 🔒",
    description: "Control your privacy settings, manage your trust score, and keep your account secure.",
    icon: "🛡️",
    action: "Check Settings"
  },
  {
    id: 8,
    title: "You're All Set! 🚀",
    description: "You now know all the key features of ScoopSocials. Start exploring and connecting with your trusted network!",
    icon: "🎯",
    action: "Get Started"
  }
];

export default function Settings() {
  const navigate = useNavigate();
  const { isDemoMode, toggleDemoMode } = useDemoMode();
  const { logout } = useUser();
  const [showDemoTour, setShowDemoTour] = useState(false);
  const [demoStep, setDemoStep] = useState(0);
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [locationSharing, setLocationSharing] = useState(true);
  
  // Media management state
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
  const [uploadCategory, setUploadCategory] = useState<'profile' | 'banner' | 'event'>('profile');
  const [uploadCaption, setUploadCaption] = useState("");

  // Analytics & Achievements state
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false);
  const [showAchievementsModal, setShowAchievementsModal] = useState(false);
  const [showNetworkModal, setShowNetworkModal] = useState(false);

  // Sign out function
  const handleSignOut = () => {
    if (confirm('Are you sure you want to sign out?')) {
      logout();
      navigate('/auth');
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getTrustScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getTrustScoreBg = (score: number) => {
    if (score >= 80) return "bg-green-100";
    if (score >= 60) return "bg-yellow-100";
    return "bg-red-100";
  };

  const getConnectionStrengthColor = (strength: number) => {
    if (strength >= 0.8) return "text-green-600";
    if (strength >= 0.6) return "text-yellow-600";
    return "text-red-600";
  };

  const handleUploadMedia = () => {
    // Simulate file upload
    const newMedia: MediaItem = {
      id: Date.now(),
      type: 'image',
      url: `https://via.placeholder.com/400x300/${Math.floor(Math.random()*16777215).toString(16)}/fff?text=Uploaded+${uploadCategory}`,
      thumbnail: `https://via.placeholder.com/200x150/${Math.floor(Math.random()*16777215).toString(16)}/fff?text=Thumbnail`,
      caption: uploadCaption || `New ${uploadCategory} image`,
      alt: `${uploadCategory} image`,
      uploadedAt: new Date().toISOString().split('T')[0],
      size: Math.floor(Math.random() * 2000000) + 500000,
      category: uploadCategory,
      isActive: uploadCategory === 'profile' || uploadCategory === 'banner'
    };
    
    // In a real app, you'd add this to your media array
    console.log('Uploaded media:', newMedia);
    setShowUploadModal(false);
    setUploadCaption("");
  };

  const handleSetAsActive = (media: MediaItem) => {
    // In a real app, you'd update the active status
    alert(`Set as active ${media.category}`);
  };

  const handleDeleteMedia = (media: MediaItem) => {
    if (confirm(`Are you sure you want to delete "${media.caption}"?`)) {
      alert(`Deleted ${media.caption}`);
    }
  };

  const getMediaByCategory = (category: 'profile' | 'banner' | 'event') => {
    return mockMedia.filter(media => media.category === category);
  };

  const settingsSections: SettingsSection[] = [
    {
      title: "Demo & Testing",
      items: [
        {
          label: "Show Demo Content",
          action: () => toggleDemoMode(),
          icon: "🎭",
          toggle: true,
          value: isDemoMode
        },
        {
          label: "Start Demo Tour",
          action: () => setShowDemoTour(true),
          icon: "🎯"
        }
      ]
    },
    {
      title: "Profile",
      items: [
        { label: "Edit Profile", action: () => navigate("/profile"), icon: "👤" },
        { label: "Manage Media", action: () => setShowMediaModal(true), icon: "📷" },
        { label: "Privacy Settings", action: () => {}, icon: "🔒" },
      ]
    },
    {
      title: "Analytics & Achievements",
      items: [
        { label: "View Achievements", action: () => setShowAchievementsModal(true), icon: "🏆" },
        { label: "Network Analytics", action: () => setShowNetworkModal(true), icon: "📊" },
        { label: "Social Stats", action: () => setShowAnalyticsModal(true), icon: "📈" },
      ]
    },
    {
      title: "Security & Privacy",
      items: [
        { label: "Two-Factor Authentication", action: () => navigate("/security"), icon: "🔐" },
        { label: "Login History", action: () => navigate("/security"), icon: "📱" },
        { label: "Active Sessions", action: () => navigate("/security"), icon: "💻" },
        { label: "Data & Privacy", action: () => navigate("/security"), icon: "🛡️" },
        { label: "Blocked Users", action: () => {}, icon: "🚫" },
      ]
    },
    {
      title: "Account",
      items: [
        { label: "Phone Number", action: () => {}, icon: "📱" },
        { label: "Email", action: () => {}, icon: "📧" },
        { label: "Password", action: () => {}, icon: "🔑" },
        { label: "Sign Out", action: handleSignOut, icon: "🚪", danger: true },
        { label: "Delete Account", action: () => {}, icon: "🗑️", danger: true },
      ]
    },
    {
      title: "Preferences",
      items: [
        { 
          label: "Dark Mode", 
          action: () => setDarkMode(!darkMode), 
          icon: "🌙",
          toggle: true,
          value: darkMode
        },
        { 
          label: "Notifications", 
          action: () => setNotifications(!notifications), 
          icon: "🔔",
          toggle: true,
          value: notifications
        },
        { 
          label: "Location Sharing", 
          action: () => setLocationSharing(!locationSharing), 
          icon: "📍",
          toggle: true,
          value: locationSharing
        },
        { label: "Language", action: () => {}, icon: "🌐" },
        { label: "Accessibility", action: () => {}, icon: "♿" },
      ]
    },
    {
      title: "Content & Discovery",
      items: [
        { label: "Content Filters", action: () => {}, icon: "🔍" },
        { label: "Discovery Settings", action: () => {}, icon: "🎯" },
        { label: "Auto-Play Media", action: () => {}, icon: "▶️" },
        { label: "Data Usage", action: () => {}, icon: "📊" },
      ]
    },
    {
      title: "Premium",
      items: [
        { label: "Upgrade to Pro", action: () => {}, icon: "⭐" },
        { label: "Venue Account", action: () => {}, icon: "🏢" },
        { label: "Billing", action: () => {}, icon: "💳" },
      ]
    },
    {
      title: "Support",
      items: [
        { label: "Help & FAQ", action: () => {}, icon: "❓" },
        { label: "Contact Support", action: () => {}, icon: "📞" },
        { label: "Report a Bug", action: () => {}, icon: "🐛" },
        { label: "Terms of Service", action: () => {}, icon: "📄" },
        { label: "Privacy Policy", action: () => {}, icon: "📋" },
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-white border-b">
        <h1 className="text-xl font-bold">Settings</h1>
        <div className="flex items-center space-x-2">
          <button 
            onClick={() => navigate(-1)}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            <span className="sr-only">Back</span>
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Settings Content */}
      <div className="p-4 space-y-6">
        {settingsSections.map((section, sectionIndex) => (
          <div key={sectionIndex} className="bg-white rounded-lg shadow-sm">
            <div className="px-4 py-3 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-800">{section.title}</h3>
            </div>
            <div className="divide-y divide-gray-100">
              {section.items.map((item, itemIndex) => (
                <div 
                  key={itemIndex}
                  className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors"
                >
                  <button 
                    onClick={item.action}
                    className="flex items-center space-x-3 flex-1 text-left"
                  >
                    <span className="text-lg">{item.icon}</span>
                    <span className={`font-medium ${item.danger ? 'text-red-600' : 'text-gray-800'}`}>
                      {item.label}
                    </span>
                  </button>
                  
                  {item.toggle ? (
                    <button
                      onClick={item.action}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        item.value ? 'bg-purple-600' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          item.value ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  ) : (
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Version Info */}
        <div className="text-center text-sm text-gray-500 py-4">
          Scoop Socials v1.0.0
        </div>

        {/* Content Settings */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Content Settings</h3>
          
          <div className="space-y-4">
            {/* Demo Content Toggle */}
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-gray-800">Demo Content</div>
                <div className="text-sm text-gray-500">Show sample posts, events, and users for exploration</div>
              </div>
              <button
                onClick={() => toggleDemoMode()}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  isDemoMode ? 'bg-purple-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    isDemoMode ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            
            <div className="border-t pt-4">
              <div className="text-sm text-gray-600">
                {isDemoMode ? (
                  <span className="text-green-600">✅ Demo content is enabled - you'll see sample data to explore features</span>
                ) : (
                  <span className="text-gray-500">Demo content is disabled - you'll only see real user data</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Media Management Modal */}
      {showMediaModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold">Manage Media</h3>
              <div className="flex space-x-2">
                <button
                  onClick={() => setShowUploadModal(true)}
                  className="bg-purple-600 text-white px-3 py-1 rounded text-sm hover:bg-purple-700"
                >
                  📤 Upload
                </button>
                <button
                  onClick={() => setShowMediaModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-4 overflow-y-auto max-h-96">
              {/* Profile Pictures */}
              <div className="mb-6">
                <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                  👤 Profile Pictures
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {getMediaByCategory('profile').map(media => (
                    <div key={media.id} className="relative group">
                      <img
                        src={media.thumbnail || media.url}
                        alt={media.alt}
                        className="w-full h-24 object-cover rounded-lg"
                      />
                      {media.isActive && (
                        <div className="absolute top-1 left-1 bg-green-500 text-white text-xs px-1 rounded">
                          Active
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all rounded-lg flex items-center justify-center">
                        <div className="opacity-0 group-hover:opacity-100 flex space-x-1">
                          {!media.isActive && (
                            <button
                              onClick={() => handleSetAsActive(media)}
                              className="bg-green-600 text-white p-1 rounded text-xs"
                              title="Set as active"
                            >
                              ✓
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteMedia(media)}
                            className="bg-red-600 text-white p-1 rounded text-xs"
                            title="Delete"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Banner Images */}
              <div className="mb-6">
                <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                  🖼️ Banner Images
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {getMediaByCategory('banner').map(media => (
                    <div key={media.id} className="relative group">
                      <img
                        src={media.thumbnail || media.url}
                        alt={media.alt}
                        className="w-full h-16 object-cover rounded-lg"
                      />
                      {media.isActive && (
                        <div className="absolute top-1 left-1 bg-green-500 text-white text-xs px-1 rounded">
                          Active
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all rounded-lg flex items-center justify-center">
                        <div className="opacity-0 group-hover:opacity-100 flex space-x-1">
                          {!media.isActive && (
                            <button
                              onClick={() => handleSetAsActive(media)}
                              className="bg-green-600 text-white p-1 rounded text-xs"
                              title="Set as active"
                            >
                              ✓
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteMedia(media)}
                            className="bg-red-600 text-white p-1 rounded text-xs"
                            title="Delete"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Event Photos */}
              <div className="mb-6">
                <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                  📸 Event Photos
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {getMediaByCategory('event').map(media => (
                    <div key={media.id} className="relative group">
                      <img
                        src={media.thumbnail || media.url}
                        alt={media.alt}
                        className="w-full h-24 object-cover rounded-lg"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all rounded-lg flex items-center justify-center">
                        <div className="opacity-0 group-hover:opacity-100 flex space-x-1">
                          <button
                            onClick={() => handleDeleteMedia(media)}
                            className="bg-red-600 text-white p-1 rounded text-xs"
                            title="Delete"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                      <div className="mt-1 text-xs text-gray-600 truncate">
                        {media.caption}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">Upload Media</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Media Type
                  </label>
                  <select
                    value={uploadCategory}
                    onChange={(e) => setUploadCategory(e.target.value as any)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-200"
                  >
                    <option value="profile">Profile Picture</option>
                    <option value="banner">Banner Image</option>
                    <option value="event">Event Photo</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Caption (Optional)
                  </label>
                  <input
                    type="text"
                    value={uploadCaption}
                    onChange={(e) => setUploadCaption(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-200"
                    placeholder={`Enter ${uploadCategory} caption`}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Select File
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <div className="text-4xl mb-2">📁</div>
                    <p className="text-gray-600">Click to select a file</p>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      id="file-upload"
                    />
                    <label
                      htmlFor="file-upload"
                      className="mt-2 inline-block bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 cursor-pointer"
                    >
                      Choose File
                    </label>
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="flex-1 py-2 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUploadMedia}
                  className="flex-1 py-2 px-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  Upload
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Achievements Modal */}
      {showAchievementsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold">Achievements</h3>
              <button
                onClick={() => setShowAchievementsModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <div className="p-4 overflow-y-auto max-h-96">
              <div className="text-center mb-4">
                <div className="text-2xl font-bold text-purple-700">{mockAchievements.length}</div>
                <div className="text-sm text-gray-600">Achievements Earned</div>
              </div>
              
              <div className="space-y-3">
                {mockAchievements.map(achievement => (
                  <div key={achievement.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="text-2xl">{achievement.icon}</div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-800">{achievement.title}</div>
                      <div className="text-sm text-gray-600">{achievement.description}</div>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
                          {achievement.category}
                        </span>
                        <span className="text-xs text-gray-500">Earned {achievement.earnedAt}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Network Analytics Modal */}
      {showNetworkModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold">Network Analytics</h3>
              <button
                onClick={() => setShowNetworkModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <div className="p-4 overflow-y-auto max-h-96">
              {/* Network Overview */}
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-lg mb-4">
                <h4 className="font-semibold text-gray-800 mb-3">Network Overview</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-700">{mockSocialStats.followers}</div>
                    <div className="text-xs text-gray-600">Followers</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-700">{mockSocialStats.following}</div>
                    <div className="text-xs text-gray-600">Following</div>
                  </div>
                </div>
                <div className="mt-3 flex justify-between text-xs text-gray-600">
                  <span>Connection Strength: 87%</span>
                  <span>Network Diversity: 76%</span>
                </div>
              </div>

              {/* Mutual Friends */}
              <div>
                <h4 className="font-semibold text-gray-800 mb-3">Mutual Friends ({mockMutualFriends.length})</h4>
                <div className="space-y-2">
                  {mockMutualFriends.map(friend => (
                    <div key={friend.id} className="flex items-center space-x-3 p-2 bg-gray-50 rounded-lg">
                      <img src={friend.avatar} alt={friend.name} className="w-10 h-10 rounded-full" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-gray-800">{friend.name}</span>
                          <span className={`text-xs px-1.5 py-0.5 rounded ${getTrustScoreBg(friend.trustScore)} ${getTrustScoreColor(friend.trustScore)}`}>
                            {friend.trustScore}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500">{friend.username}</div>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="text-xs text-gray-600">{friend.mutualFriends} mutual</span>
                          <span className={`text-xs ${getConnectionStrengthColor(friend.connectionStrength)}`}>
                            {Math.round(friend.connectionStrength * 100)}% strength
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Social Stats Modal */}
      {showAnalyticsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold">Social Statistics</h3>
              <button
                onClick={() => setShowAnalyticsModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <div className="p-4 overflow-y-auto max-h-96">
              {/* Trust Score */}
              <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-lg mb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-gray-800">Trust Score</h4>
                    <div className={`text-2xl font-bold ${getTrustScoreColor(mockSocialStats.trustScore)}`}>
                      {mockSocialStats.trustScore}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-600">Verification</div>
                    <div className="text-sm font-medium text-green-600">{mockSocialStats.verificationLevel}</div>
                  </div>
                </div>
              </div>

              {/* Activity Stats */}
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-xl font-bold text-purple-700">{mockSocialStats.posts}</div>
                  <div className="text-xs text-gray-600">Posts</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-xl font-bold text-blue-700">{mockSocialStats.events}</div>
                  <div className="text-xs text-gray-600">Events</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-xl font-bold text-green-700">{mockSocialStats.groups}</div>
                  <div className="text-xs text-gray-600">Groups</div>
                </div>
              </div>

              {/* Account Info */}
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-600">Member Since</span>
                  <span className="text-sm font-medium">{mockSocialStats.memberSince}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-600">Last Active</span>
                  <span className="text-sm font-medium">{mockSocialStats.lastActive}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-600">Followers</span>
                  <span className="text-sm font-medium">{mockSocialStats.followers}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-600">Following</span>
                  <span className="text-sm font-medium">{mockSocialStats.following}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Demo Tour Modal */}
      {showDemoTour && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md max-h-[80vh] overflow-hidden">
            <div className="p-6">
              <div className="text-center mb-6">
                <div className="text-4xl mb-4">{demoSteps[demoStep].icon}</div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">{demoSteps[demoStep].title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{demoSteps[demoStep].description}</p>
              </div>
              
              {/* Progress indicator */}
              <div className="flex justify-center mb-6">
                <div className="flex space-x-2">
                  {demoSteps.map((_, index) => (
                    <div
                      key={index}
                      className={`w-2 h-2 rounded-full ${
                        index <= demoStep ? 'bg-purple-600' : 'bg-gray-300'
                      }`}
                    />
                  ))}
                </div>
              </div>
              
              <div className="flex space-x-3">
                {demoStep > 0 && (
                  <button
                    onClick={() => setDemoStep(demoStep - 1)}
                    className="flex-1 py-2 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Previous
                  </button>
                )}
                
                {demoStep < demoSteps.length - 1 ? (
                  <button
                    onClick={() => setDemoStep(demoStep + 1)}
                    className="flex-1 py-2 px-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    {demoSteps[demoStep].action}
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setShowDemoTour(false);
                      setDemoStep(0);
                    }}
                    className="flex-1 py-2 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Start Exploring!
                  </button>
                )}
              </div>
              
              <div className="text-center mt-4">
                <button
                  onClick={() => {
                    setShowDemoTour(false);
                    setDemoStep(0);
                  }}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Skip Tour
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 