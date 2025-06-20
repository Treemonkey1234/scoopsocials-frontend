import React, { useState } from "react";
// @ts-ignore
import { useNavigate } from "react-router-dom";

type Notification = {
  id: number;
  type: 'friend_request' | 'event_invite' | 'group_invite' | 'like' | 'comment' | 'mention' | 'trust_score' | 'achievement' | 'security' | 'system';
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  isImportant: boolean;
  sender?: {
    name: string;
    username: string;
    avatar: string;
    trustScore: number;
  };
  action?: {
    type: 'accept' | 'decline' | 'view' | 'respond';
    label: string;
  };
  metadata?: {
    eventId?: number;
    groupId?: number;
    postId?: number;
    commentId?: number;
  };
};

// Mock data
const mockNotifications: Notification[] = [
  {
    id: 1,
    type: "friend_request",
    title: "New Friend Request",
    message: "Sarah Wilson wants to connect with you",
    timestamp: "2 minutes ago",
    isRead: false,
    isImportant: true,
    sender: {
      name: "Sarah Wilson",
      username: "@sarahw",
      avatar: "https://via.placeholder.com/40x40/6366f1/fff?text=SW",
      trustScore: 95
    },
    action: {
      type: "accept",
      label: "Accept"
    }
  },
  {
    id: 2,
    type: "event_invite",
    title: "Event Invitation",
    message: "You're invited to 'Tech Meetup: AI & Machine Learning'",
    timestamp: "1 hour ago",
    isRead: false,
    isImportant: true,
    sender: {
      name: "NYC Tech Enthusiasts",
      username: "@nyctech",
      avatar: "https://via.placeholder.com/40x40/6366f1/fff?text=NYC",
      trustScore: 92
    },
    action: {
      type: "respond",
      label: "RSVP"
    },
    metadata: {
      eventId: 123
    }
  },
  {
    id: 3,
    type: "like",
    title: "New Like",
    message: "Alex Johnson liked your post about coffee",
    timestamp: "3 hours ago",
    isRead: true,
    isImportant: false,
    sender: {
      name: "Alex Johnson",
      username: "@alexj",
      avatar: "https://via.placeholder.com/40x40/6366f1/fff?text=AJ",
      trustScore: 87
    },
    action: {
      type: "view",
      label: "View"
    },
    metadata: {
      postId: 456
    }
  },
  {
    id: 4,
    type: "comment",
    title: "New Comment",
    message: "Mike Chen commented on your event: 'Looking forward to this!'",
    timestamp: "5 hours ago",
    isRead: true,
    isImportant: false,
    sender: {
      name: "Mike Chen",
      username: "@mikechen",
      avatar: "https://via.placeholder.com/40x40/6366f1/fff?text=MC",
      trustScore: 82
    },
    action: {
      type: "view",
      label: "Reply"
    },
    metadata: {
      postId: 456,
      commentId: 789
    }
  },
  {
    id: 5,
    type: "mention",
    title: "You were mentioned",
    message: "Jamie Rivera mentioned you in a post about the upcoming meetup",
    timestamp: "1 day ago",
    isRead: true,
    isImportant: false,
    sender: {
      name: "Jamie Rivera",
      username: "@jamier",
      avatar: "https://via.placeholder.com/40x40/6366f1/fff?text=JR",
      trustScore: 88
    },
    action: {
      type: "view",
      label: "View"
    },
    metadata: {
      postId: 101
    }
  },
  {
    id: 6,
    type: "trust_score",
    title: "Trust Score Update",
    message: "Your trust score increased by 3 points! You're now at 87",
    timestamp: "2 days ago",
    isRead: true,
    isImportant: false,
    action: {
      type: "view",
      label: "View Details"
    }
  },
  {
    id: 7,
    type: "achievement",
    title: "New Achievement Unlocked!",
    message: "You earned the 'Community Builder' badge for creating 5+ groups",
    timestamp: "3 days ago",
    isRead: true,
    isImportant: false,
    action: {
      type: "view",
      label: "View Badge"
    }
  },
  {
    id: 8,
    type: "security",
    title: "Security Alert",
    message: "New login detected from San Francisco, CA",
    timestamp: "1 week ago",
    isRead: true,
    isImportant: true,
    action: {
      type: "view",
      label: "Review"
    }
  },
  {
    id: 9,
    type: "group_invite",
    title: "Group Invitation",
    message: "You're invited to join 'Brooklyn Photography Club'",
    timestamp: "1 week ago",
    isRead: true,
    isImportant: false,
    sender: {
      name: "Brooklyn Photography Club",
      username: "@bkphoto",
      avatar: "https://via.placeholder.com/40x40/ef4444/fff?text=📸",
      trustScore: 85
    },
    action: {
      type: "respond",
      label: "Join"
    },
    metadata: {
      groupId: 456
    }
  },
  {
    id: 10,
    type: "system",
    title: "System Update",
    message: "New features are now available! Check out the enhanced group management tools.",
    timestamp: "1 week ago",
    isRead: true,
    isImportant: false,
    action: {
      type: "view",
      label: "Learn More"
    }
  }
];

const notificationTypes = [
  { key: "all", label: "All", icon: "📬" },
  { key: "friend_request", label: "Requests", icon: "👥" },
  { key: "event_invite", label: "Events", icon: "📅" },
  { key: "group_invite", label: "Groups", icon: "👥" },
  { key: "social", label: "Social", icon: "💬" },
  { key: "security", label: "Security", icon: "🔒" },
  { key: "system", label: "System", icon: "⚙️" }
];

export default function Notifications() {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState("all");
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const [showImportantOnly, setShowImportantOnly] = useState(false);

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'friend_request': return '👥';
      case 'event_invite': return '📅';
      case 'group_invite': return '👥';
      case 'like': return '❤️';
      case 'comment': return '💬';
      case 'mention': return '📢';
      case 'trust_score': return '🛡️';
      case 'achievement': return '🏆';
      case 'security': return '🔒';
      case 'system': return '⚙️';
      default: return '📬';
    }
  };

  const getNotificationColor = (type: Notification['type']) => {
    switch (type) {
      case 'friend_request': return 'text-blue-600';
      case 'event_invite': return 'text-green-600';
      case 'group_invite': return 'text-purple-600';
      case 'like': return 'text-red-600';
      case 'comment': return 'text-blue-600';
      case 'mention': return 'text-orange-600';
      case 'trust_score': return 'text-green-600';
      case 'achievement': return 'text-yellow-600';
      case 'security': return 'text-red-600';
      case 'system': return 'text-gray-600';
      default: return 'text-gray-600';
    }
  };

  const filteredNotifications = mockNotifications.filter(notification => {
    const matchesFilter = activeFilter === "all" || 
                         (activeFilter === "social" && ['like', 'comment', 'mention'].includes(notification.type)) ||
                         notification.type === activeFilter;
    const matchesUnread = !showUnreadOnly || !notification.isRead;
    const matchesImportant = !showImportantOnly || notification.isImportant;
    
    return matchesFilter && matchesUnread && matchesImportant;
  });

  const unreadCount = mockNotifications.filter(n => !n.isRead).length;
  const importantCount = mockNotifications.filter(n => n.isImportant).length;

  const handleMarkAsRead = (notificationId: number) => {
    const notification = mockNotifications.find(n => n.id === notificationId);
    if (notification) {
      notification.isRead = true;
    }
  };

  const handleMarkAllAsRead = () => {
    mockNotifications.forEach(n => n.isRead = true);
  };

  const handleAction = (notification: Notification) => {
    switch (notification.action?.type) {
      case 'accept':
        alert(`Accepted friend request from ${notification.sender?.name}`);
        break;
      case 'decline':
        alert(`Declined friend request from ${notification.sender?.name}`);
        break;
      case 'view':
        alert(`Viewing ${notification.type} notification`);
        break;
      case 'respond':
        alert(`Responding to ${notification.type} notification`);
        break;
      default:
        alert('Action not implemented');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-white border-b">
        <button 
          onClick={() => navigate('/inbox')}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100"
        >
          <span className="sr-only">Back</span>
          <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-lg font-semibold">Notifications</h1>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleMarkAllAsRead}
            className="text-sm text-purple-600 hover:text-purple-700"
          >
            Mark all read
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="bg-white border-b px-4 py-3">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-4">
            <span className="text-gray-600">
              {unreadCount} unread
            </span>
            <span className="text-gray-600">
              {importantCount} important
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <label className="flex items-center text-xs">
              <input
                type="checkbox"
                checked={showUnreadOnly}
                onChange={(e) => setShowUnreadOnly(e.target.checked)}
                className="mr-1"
              />
              Unread only
            </label>
            <label className="flex items-center text-xs">
              <input
                type="checkbox"
                checked={showImportantOnly}
                onChange={(e) => setShowImportantOnly(e.target.checked)}
                className="mr-1"
              />
              Important only
            </label>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-b">
        <div className="flex overflow-x-auto space-x-1 px-4 py-2">
          {notificationTypes.map(type => (
            <button
              key={type.key}
              onClick={() => setActiveFilter(type.key)}
              className={`flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap ${
                activeFilter === type.key
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <span>{type.icon}</span>
              <span>{type.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Notifications List */}
      <div className="p-4 space-y-3">
        {filteredNotifications.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-2">📬</div>
            <h3 className="font-medium text-gray-800 mb-2">No notifications</h3>
            <p className="text-gray-600">You're all caught up!</p>
          </div>
        ) : (
          filteredNotifications.map(notification => (
            <div
              key={notification.id}
              className={`bg-white rounded-lg p-4 border ${
                !notification.isRead ? 'border-l-4 border-l-purple-500' : ''
              }`}
            >
              <div className="flex items-start space-x-3">
                <div className="text-2xl">{getNotificationIcon(notification.type)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h4 className={`font-medium ${getNotificationColor(notification.type)}`}>
                          {notification.title}
                        </h4>
                        {!notification.isRead && (
                          <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                        )}
                        {notification.isImportant && (
                          <span className="text-xs bg-red-100 text-red-700 px-1 rounded">Important</span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                      <div className="text-xs text-gray-500 mt-2">{notification.timestamp}</div>
                    </div>
                    {notification.sender && (
                      <div className="flex items-center space-x-2">
                        <img 
                          src={notification.sender.avatar} 
                          alt={notification.sender.name} 
                          className="w-8 h-8 rounded-full"
                        />
                        <div className="text-right">
                          <div className="text-xs font-medium text-gray-800">
                            {notification.sender.name}
                          </div>
                          <div className="text-xs text-gray-500">
                            Trust {notification.sender.trustScore}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {notification.action && (
                    <div className="flex items-center space-x-2 mt-3">
                      <button
                        onClick={() => handleAction(notification)}
                        className="px-3 py-1 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700"
                      >
                        {notification.action.label}
                      </button>
                      {!notification.isRead && (
                        <button
                          onClick={() => handleMarkAsRead(notification.id)}
                          className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200"
                        >
                          Mark read
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
} 