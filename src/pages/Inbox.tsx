import React, { useState, useEffect } from "react";
// @ts-ignore
import { useNavigate } from "react-router-dom";
import { Card, Button } from '../components-v2';
import PlusButton from "../components/PlusButton";

// Enhanced notification types with real-time features
type NotificationPriority = 'low' | 'medium' | 'high' | 'urgent';

type RealTimeNotification = {
  id: number;
  type: "friend_request" | "event_invitation" | "notification" | "group_invitation" | "trust_score_update" | "event_reminder" | "flag_result" | "moderation_notice";
  sender: {
    name: string;
    username: string;
    avatar: string;
    trustScore: number;
  };
  content: string;
  timestamp: string;
  isRead: boolean;
  isUrgent: boolean;
  priority: NotificationPriority;
  expiresAt?: string;
  actionRequired: boolean;
  realTimeId?: string;
  metadata?: {
    eventId?: number;
    groupId?: number;
    trustScoreChange?: number;
    flagId?: string;
    flagResult?: 'accepted' | 'rejected' | 'penalized';
    penalizedUserId?: string;
  };
};

// Enhanced mock data with real-time features
const mockInboxItems: RealTimeNotification[] = [
  {
    id: 1,
    type: "friend_request",
    sender: {
      name: "Taylor Kim",
      username: "@taylork",
      avatar: "https://via.placeholder.com/40x40/6366f1/fff?text=TK",
      trustScore: 78
    },
    content: "sent you a friend request",
    timestamp: "4h ago",
    isRead: false,
    isUrgent: false,
    priority: 'high',
    actionRequired: true,
    realTimeId: 'fr_001'
  },
  {
    id: 2,
    type: "event_invitation",
    sender: {
      name: "Alex Chen",
      username: "@alexchen",
      avatar: "https://via.placeholder.com/40x40/6366f1/fff?text=AC",
      trustScore: 85
    },
    content: "invited you to Tech Meetup",
    timestamp: "1d ago",
    isRead: true,
    isUrgent: false,
    priority: 'medium',
    actionRequired: true,
    realTimeId: 'evt_001',
    metadata: { eventId: 123 }
  },
  {
    id: 3,
    type: "flag_result",
    sender: {
      name: "ScoopSocials Moderation",
      username: "@moderation",
      avatar: "https://via.placeholder.com/40x40/6366f1/fff?text=MOD",
      trustScore: 100
    },
    content: "Your flag for inappropriate content has been accepted",
    timestamp: "2d ago",
    isRead: false,
    isUrgent: false,
    priority: 'medium',
    actionRequired: false,
    realTimeId: 'flag_001',
    metadata: { 
      flagId: 'flag_123',
      flagResult: 'accepted'
    }
  },
  {
    id: 4,
    type: "moderation_notice",
    sender: {
      name: "ScoopSocials Moderation",
      username: "@moderation",
      avatar: "https://via.placeholder.com/40x40/6366f1/fff?text=MOD",
      trustScore: 100
    },
    content: "Content you posted has been flagged and is under review",
    timestamp: "3d ago",
    isRead: false,
    isUrgent: true,
    priority: 'high',
    actionRequired: false,
    realTimeId: 'mod_001',
    metadata: { 
      flagId: 'flag_456',
      flagResult: 'accepted'
    }
  },
  {
    id: 5,
    type: "trust_score_update",
    sender: {
      name: "ScoopSocials",
      username: "@scoopsocials",
      avatar: "https://via.placeholder.com/40x40/6366f1/fff?text=SS",
      trustScore: 100
    },
    content: "Your trust score increased to 87! ��",
    timestamp: "2d ago",
    isRead: true,
    isUrgent: false,
    priority: 'low',
    actionRequired: false,
    realTimeId: 'trust_001',
    metadata: { trustScoreChange: 2 }
  },
  {
    id: 6,
    type: "event_reminder",
    sender: {
      name: "ScoopSocials",
      username: "@scoopsocials",
      avatar: "https://via.placeholder.com/40x40/6366f1/fff?text=SS",
      trustScore: 100
    },
    content: "Reminder: Central Park Picnic starts in 2 hours",
    timestamp: "Just now",
    isRead: false,
    isUrgent: true,
    priority: 'urgent',
    actionRequired: false,
    realTimeId: 'reminder_001',
    metadata: { eventId: 456 }
  }
];

const inboxCategories = ["All", "Requests", "Events", "Notifications", "Moderation"];

export default function Inbox() {
  const navigate = useNavigate();
  const [inboxItems, setInboxItems] = useState<RealTimeNotification[]>(mockInboxItems);
  const [activeCategory, setActiveCategory] = useState("All");
  const [selectedItem, setSelectedItem] = useState<RealTimeNotification | null>(null);
  const [realTimeUpdates, setRealTimeUpdates] = useState<RealTimeNotification[]>([]);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate new notifications
      if (Math.random() > 0.7) {
        const newNotification: RealTimeNotification = {
          id: Date.now(),
          type: "notification",
          sender: {
            name: "System",
            username: "@system",
            avatar: "https://via.placeholder.com/40x40/6366f1/fff?text=S",
            trustScore: 100
          },
          content: "New real-time update available",
          timestamp: "Just now",
          isRead: false,
          isUrgent: false,
          priority: 'low',
          actionRequired: false,
          realTimeId: `rt_${Date.now()}`
        };
        setRealTimeUpdates(prev => [newNotification, ...prev]);
      }
    }, 10000); // Check every 10 seconds

    return () => clearInterval(interval);
  }, []);

  const handlePlusAction = (action: 'post' | 'event' | 'friend') => {
    if (action === 'post') {
      navigate('/home', { state: { focusCreatePost: true } });
    } else if (action === 'event') {
      navigate('/events', { state: { openCreateEvent: true } });
    } else if (action === 'friend') {
      navigate('/friends');
    }
  };

  const handleItemClick = (item: RealTimeNotification) => {
    setSelectedItem(item);
    // Mark as read
    setInboxItems(prev => 
      prev.map(inboxItem => 
        inboxItem.id === item.id ? { ...inboxItem, isRead: true } : inboxItem
      )
    );
  };

  const handleAcceptFriendRequest = (itemId: number) => {
    setInboxItems(prev => 
      prev.map(item => 
        item.id === itemId 
          ? { ...item, type: "notification", content: "Friend request accepted", isRead: true }
          : item
      )
    );
  };

  const handleDeclineFriendRequest = (itemId: number) => {
    setInboxItems(prev => prev.filter(item => item.id !== itemId));
  };

  const handleAcceptEventInvitation = (itemId: number) => {
    setInboxItems(prev => 
      prev.map(item => 
        item.id === itemId 
          ? { ...item, type: "notification", content: "Event invitation accepted", isRead: true }
          : item
      )
    );
  };

  const handleDeclineEventInvitation = (itemId: number) => {
    setInboxItems(prev => prev.filter(item => item.id !== itemId));
  };

  const handleModeratorPortalAccess = () => {
    navigate('/moderator-portal');
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

  const getCategoryIcon = (type: string) => {
    switch (type) {
      case "friend_request":
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
          </svg>
        );
      case "event_invitation":
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        );
      case "trust_score_update":
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case "event_reminder":
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case "flag_result":
      case "moderation_notice":
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4 19h6a2 2 0 002-2V7a2 2 0 00-2-2H4a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        );
    }
  };

  const getCategoryColor = (type: string) => {
    switch (type) {
      case "friend_request":
        return "text-blue-600 bg-blue-100";
      case "event_invitation":
        return "text-purple-600 bg-purple-100";
      case "trust_score_update":
        return "text-green-600 bg-green-100";
      case "event_reminder":
        return "text-orange-600 bg-orange-100";
      case "flag_result":
      case "moderation_notice":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const filteredItems = inboxItems.filter(item => {
    if (activeCategory === "All") return true;
    if (activeCategory === "Requests" && item.type === "friend_request") return true;
    if (activeCategory === "Events" && (item.type === "event_invitation" || item.type === "event_reminder")) return true;
    if (activeCategory === "Notifications" && item.type === "notification") return true;
    if (activeCategory === "Moderation" && (item.type === "flag_result" || item.type === "moderation_notice")) return true;
    return false;
  });

  const unreadCount = inboxItems.filter(item => !item.isRead).length;

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-background)' }}>
      {/* Header */}
      <div className="bg-primary text-white p-lg shadow-lg sticky top-0 z-10">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <h1 className="text-h1 font-bold text-white">Inbox</h1>
          <PlusButton onAction={handlePlusAction} />
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto p-lg">
        <div className="max-w-2xl mx-auto space-y-md">
          {filteredItems.map(item => (
            <Card 
                  key={item.id}
              className={`p-lg cursor-pointer transition-all duration-300 hover:shadow-lg ${
                !item.isRead ? 'border-l-4 border-primary bg-blue-50/50' : ''
              }`}
                  onClick={() => handleItemClick(item)}
            >
              <div className="flex items-start space-x-lg">
                <div className={`p-md rounded-xl ${getCategoryColor(item.type)} flex-shrink-0`}>
                  {getCategoryIcon(item.type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-sm">
                    <div className="flex items-center space-x-sm">
                      <img 
                        src={item.sender.avatar} 
                        alt={item.sender.name}
                        className="w-10 h-10 rounded-full border-2 border-gray-200"
                      />
                      <div>
                        <h4 className="font-semibold text-primary text-body1">{item.sender.name}</h4>
                        <span className="text-secondary text-sm">{item.sender.username}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-sm">
                      <span className={`px-sm py-xs rounded-full text-xs font-medium ${getTrustScoreBg(item.sender.trustScore)} ${getTrustScoreColor(item.sender.trustScore)}`}>
                            {item.sender.trustScore}
                          </span>
                      <span className="text-secondary text-sm">{item.timestamp}</span>
                        </div>
                      </div>
                  
                  <p className="text-secondary text-body2 mb-md leading-relaxed">{item.content}</p>
                      
                  {item.actionRequired && (item.type === "friend_request" || item.type === "event_invitation") && (
                    <div className="flex space-x-sm">
                      <Button 
                        variant="primary" 
                        size="small"
                        onClick={() => {
                          item.type === "friend_request" 
                            ? handleAcceptFriendRequest(item.id)
                            : handleAcceptEventInvitation(item.id);
                            }}
                          >
                            Accept
                      </Button>
                      <Button 
                        variant="outline" 
                        size="small"
                        onClick={() => {
                          item.type === "friend_request" 
                            ? handleDeclineFriendRequest(item.id)
                            : handleDeclineEventInvitation(item.id);
                            }}
                          >
                            Decline
                      </Button>
                        </div>
                      )}
                    </div>
                  </div>
            </Card>
              ))}

          {filteredItems.length === 0 && (
            <Card className="p-xl text-center">
              <div className="text-gray-400 mb-md">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
            </div>
              <h3 className="text-h3 text-primary mb-sm">No notifications</h3>
              <p className="text-secondary">You're all caught up!</p>
            </Card>
          )}
        </div>
      </div>

      {/* Selected Item Modal */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-md">
          <Card className="w-full max-w-md max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between p-md border-b">
              <h3 className="text-h3 text-primary">Notification Details</h3>
              <Button
                variant="text"
                size="small"
                onClick={() => setSelectedItem(null)}
              >
                ✕
              </Button>
            </div>
            <div className="p-md">
              <div className="flex items-center space-x-md mb-md">
                <div className={`p-sm rounded-full ${getCategoryColor(selectedItem.type)}`}>
                  {getCategoryIcon(selectedItem.type)}
                </div>
                <div>
                  <h4 className="font-semibold text-primary">{selectedItem.sender.name}</h4>
                  <span className="text-secondary text-sm">{selectedItem.sender.username}</span>
                </div>
              </div>
              <p className="text-secondary mb-md">{selectedItem.content}</p>
              <div className="text-sm text-secondary">
                <p>Received: {selectedItem.timestamp}</p>
                <p>Priority: {selectedItem.priority}</p>
                {selectedItem.isUrgent && <p className="text-red-600 font-medium">⚠️ Urgent</p>}
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
} 