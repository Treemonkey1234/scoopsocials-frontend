import React, { useState, useEffect } from "react";
// @ts-ignore
import { useNavigate, useLocation } from "react-router-dom";
import PlusButton from "../components/PlusButton";
import AddFriendModal from "../components/AddFriendModal";

// Mock data for friends and friend requests
const mockFriends = [
  {
    id: 1,
    name: "Jamie Rivera",
    username: "@jamier",
    avatar: "https://via.placeholder.com/40x40/6366f1/fff?text=JR",
    trustScore: 92,
    mutualFriends: 5,
    isOnline: true,
    lastSeen: "2m ago",
    status: "Active now"
  },
  {
    id: 2,
    name: "Taylor Kim",
    username: "@taylork",
    avatar: "https://via.placeholder.com/40x40/6366f1/fff?text=TK",
    trustScore: 78,
    mutualFriends: 3,
    isOnline: false,
    lastSeen: "1h ago",
    status: "Last seen 1h ago"
  },
  {
    id: 3,
    name: "Sarah Wilson",
    username: "@sarahw",
    avatar: "https://via.placeholder.com/40x40/6366f1/fff?text=SW",
    trustScore: 85,
    mutualFriends: 7,
    isOnline: true,
    lastSeen: "Just now",
    status: "Active now"
  }
];

const mockFriendRequests = [
  {
    id: 1,
    name: "Mike Chen",
    username: "@mikechen",
    avatar: "https://via.placeholder.com/40x40/6366f1/fff?text=MC",
    trustScore: 88,
    mutualFriends: 4,
    message: "Hey! We met at the tech meetup last week. Would love to connect!",
    timestamp: "2h ago"
  },
  {
    id: 2,
    name: "Alex Rodriguez",
    username: "@alexrod",
    avatar: "https://via.placeholder.com/40x40/6366f1/fff?text=AR",
    trustScore: 72,
    mutualFriends: 2,
    message: "Mutual friend with Jamie. Thought we should connect!",
    timestamp: "1d ago"
  }
];

const mockFriendSuggestions = [
  {
    id: 1,
    name: "Emma Davis",
    username: "@emmad",
    avatar: "https://via.placeholder.com/40x40/6366f1/fff?text=ED",
    trustScore: 91,
    mutualFriends: 6,
    reason: "6 mutual friends including Jamie Rivera and Sarah Wilson"
  },
  {
    id: 2,
    name: "David Park",
    username: "@davidp",
    avatar: "https://via.placeholder.com/40x40/6366f1/fff?text=DP",
    trustScore: 83,
    mutualFriends: 4,
    reason: "4 mutual friends including Taylor Kim"
  },
  {
    id: 3,
    name: "Lisa Thompson",
    username: "@lisat",
    avatar: "https://via.placeholder.com/40x40/6366f1/fff?text=LT",
    trustScore: 79,
    mutualFriends: 3,
    reason: "3 mutual friends including Sarah Wilson"
  }
];

const currentUser = {
  name: "Alex Johnson",
  username: "@alexj",
  avatar: "https://via.placeholder.com/40x40/6366f1/fff?text=AJ",
  trustScore: 87
};

const friendCategories = ["Friends", "Requests", "Suggestions"];

export default function Friends() {
  const navigate = useNavigate();
  const location = useLocation();
  const [friends, setFriends] = useState(mockFriends);
  const [friendRequests, setFriendRequests] = useState(mockFriendRequests);
  const [friendSuggestions, setFriendSuggestions] = useState(mockFriendSuggestions);
  const [activeCategory, setActiveCategory] = useState("Friends");
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddFriendModal, setShowAddFriendModal] = useState(false);

  // Handle navigation state to open add friend modal
  useEffect(() => {
    if (location.state && location.state.openAddFriend) {
      setShowAddFriendModal(true);
      // Clear the navigation state
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, navigate, location.pathname]);

  const handlePlusAction = (action: 'post' | 'event' | 'friend') => {
    if (action === 'post') {
      navigate('/home', { state: { openCreatePost: true } });
    } else if (action === 'event') {
      navigate('/events', { state: { openCreateEvent: true } });
    } else if (action === 'friend') {
      setShowAddFriendModal(true);
    }
  };

  const handleAcceptFriendRequest = (requestId: number) => {
    const request = friendRequests.find(r => r.id === requestId);
    if (request) {
      // Add to friends list
      const newFriend = {
        ...request,
        isOnline: false,
        lastSeen: "Just now",
        status: "Recently added"
      };
      setFriends(prev => [newFriend, ...prev]);
      
      // Remove from requests
      setFriendRequests(prev => prev.filter(r => r.id !== requestId));
    }
  };

  const handleDeclineFriendRequest = (requestId: number) => {
    setFriendRequests(prev => prev.filter(r => r.id !== requestId));
  };

  const handleSendFriendRequest = (suggestionId: number) => {
    const suggestion = friendSuggestions.find(s => s.id === suggestionId);
    if (suggestion) {
      // In a real app, this would send a friend request
      // For now, we'll just remove from suggestions
      setFriendSuggestions(prev => prev.filter(s => s.id !== suggestionId));
    }
  };

  const handleRemoveFriend = (friendId: number) => {
    setFriends(prev => prev.filter(f => f.id !== friendId));
  };

  const handleAddFriend = (friendData: any) => {
    console.log('Friend request sent:', friendData);
    // In a real app, this would send the friend request to the backend
    // For now, we'll just log it
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

  const getOnlineStatusColor = (isOnline: boolean) => {
    return isOnline ? "bg-green-500" : "bg-gray-400";
  };

  const filteredFriends = friends.filter(friend =>
    friend.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    friend.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredRequests = friendRequests.filter(request =>
    request.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    request.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredSuggestions = friendSuggestions.filter(suggestion =>
    suggestion.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    suggestion.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-white border-b">
        <h1 className="text-xl font-bold">Friends</h1>
        <div className="flex items-center space-x-2">
          <button 
            onClick={() => navigate('/groups')}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
            title="Groups"
          >
            <span className="sr-only">Groups</span>
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </button>
          <PlusButton onAction={handlePlusAction} />
        </div>
      </div>

      {/* Search Bar */}
      <div className="px-4 py-3 bg-white border-b">
        <div className="relative">
          <input
            type="text"
            placeholder="Search friends..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-200"
          />
          <span className="absolute left-3 top-2.5 text-gray-400">🔍</span>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="px-4 py-2 bg-white border-b">
        <div className="flex space-x-1">
          {friendCategories.map(category => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`flex-1 py-2 px-3 text-sm font-medium rounded-lg transition-colors ${
                activeCategory === category
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {category}
              {category === "Requests" && friendRequests.length > 0 && (
                <span className="ml-1 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                  {friendRequests.length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {activeCategory === "Friends" && (
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">
                Your Friends ({friends.length})
              </h3>
              <span className="text-sm text-gray-500">
                {friends.filter(f => f.isOnline).length} online
              </span>
            </div>
            
            {filteredFriends.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-4">👥</div>
                <div className="text-lg font-semibold text-gray-700 mb-2">No friends found</div>
                <div className="text-gray-500">
                  {searchQuery ? "Try adjusting your search." : "Start connecting with people!"}
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredFriends.map(friend => (
                  <div key={friend.id} className="bg-white rounded-lg p-4 shadow-sm">
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <img src={friend.avatar} alt={friend.name} className="w-12 h-12 rounded-full object-cover" />
                        <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${getOnlineStatusColor(friend.isOnline)}`}></div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold text-gray-800">{friend.name}</span>
                          <span className="text-sm text-gray-400">{friend.username}</span>
                          <div className={`px-2 py-0.5 rounded-full text-xs font-medium ${getTrustScoreBg(friend.trustScore)} ${getTrustScoreColor(friend.trustScore)}`}>
                            Trust {friend.trustScore}
                          </div>
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          {friend.mutualFriends} mutual friends • {friend.status}
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => navigate(`/profile/${friend.username.replace('@', '')}`)}
                          className="px-3 py-1 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition-colors"
                        >
                          View
                        </button>
                        <button
                          onClick={() => handleRemoveFriend(friend.id)}
                          className="px-3 py-1 bg-gray-200 text-gray-700 text-sm rounded-lg hover:bg-gray-300 transition-colors"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeCategory === "Requests" && (
          <div className="p-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Friend Requests ({friendRequests.length})
            </h3>
            
            {filteredRequests.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-4">🤝</div>
                <div className="text-lg font-semibold text-gray-700 mb-2">No friend requests</div>
                <div className="text-gray-500">
                  {searchQuery ? "Try adjusting your search." : "You're all caught up!"}
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredRequests.map(request => (
                  <div key={request.id} className="bg-white rounded-lg p-4 shadow-sm">
                    <div className="flex items-start space-x-3">
                      <img src={request.avatar} alt={request.name} className="w-12 h-12 rounded-full object-cover" />
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold text-gray-800">{request.name}</span>
                          <span className="text-sm text-gray-400">{request.username}</span>
                          <div className={`px-2 py-0.5 rounded-full text-xs font-medium ${getTrustScoreBg(request.trustScore)} ${getTrustScoreColor(request.trustScore)}`}>
                            Trust {request.trustScore}
                          </div>
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          {request.mutualFriends} mutual friends • {request.timestamp}
                        </div>
                        {request.message && (
                          <div className="text-sm text-gray-700 mt-2 bg-gray-50 p-2 rounded">
                            "{request.message}"
                          </div>
                        )}
                        <div className="flex space-x-2 mt-3">
                          <button
                            onClick={() => handleAcceptFriendRequest(request.id)}
                            className="flex-1 py-2 px-3 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition-colors"
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => handleDeclineFriendRequest(request.id)}
                            className="flex-1 py-2 px-3 bg-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-300 transition-colors"
                          >
                            Decline
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeCategory === "Suggestions" && (
          <div className="p-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              People You May Know ({friendSuggestions.length})
            </h3>
            
            {filteredSuggestions.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-4">👤</div>
                <div className="text-lg font-semibold text-gray-700 mb-2">No suggestions</div>
                <div className="text-gray-500">
                  {searchQuery ? "Try adjusting your search." : "Check back later for new suggestions!"}
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredSuggestions.map(suggestion => (
                  <div key={suggestion.id} className="bg-white rounded-lg p-4 shadow-sm">
                    <div className="flex items-start space-x-3">
                      <img src={suggestion.avatar} alt={suggestion.name} className="w-12 h-12 rounded-full object-cover" />
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold text-gray-800">{suggestion.name}</span>
                          <span className="text-sm text-gray-400">{suggestion.username}</span>
                          <div className={`px-2 py-0.5 rounded-full text-xs font-medium ${getTrustScoreBg(suggestion.trustScore)} ${getTrustScoreColor(suggestion.trustScore)}`}>
                            Trust {suggestion.trustScore}
                          </div>
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          {suggestion.reason}
                        </div>
                        <div className="flex space-x-2 mt-3">
                          <button
                            onClick={() => handleSendFriendRequest(suggestion.id)}
                            className="flex-1 py-2 px-3 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition-colors"
                          >
                            Add Friend
                          </button>
                          <button
                            onClick={() => navigate(`/profile/${suggestion.username.replace('@', '')}`)}
                            className="flex-1 py-2 px-3 bg-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-300 transition-colors"
                          >
                            View Profile
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add Friend Modal */}
      <AddFriendModal
        isOpen={showAddFriendModal}
        onClose={() => setShowAddFriendModal(false)}
        onSubmit={handleAddFriend}
      />
    </div>
  );
} 