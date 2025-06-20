import React, { useState, useEffect } from 'react';

interface AddFriendModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (friendData: FriendFormData) => void;
}

interface FriendFormData {
  username: string;
}

interface UserSuggestion {
  id: string;
  username: string;
  name: string;
  avatar: string;
  trustScore: number;
}

// Mock user suggestions - in a real app this would come from an API
const mockUsers: UserSuggestion[] = [
  { id: '1', username: '@alexj', name: 'Alex Johnson', avatar: '/avatars/alex.jpg', trustScore: 87 },
  { id: '2', username: '@sarahw', name: 'Sarah Wilson', avatar: '/avatars/sarah.jpg', trustScore: 92 },
  { id: '3', username: '@mikec', name: 'Mike Chen', avatar: '/avatars/mike.jpg', trustScore: 78 },
  { id: '4', username: '@emilyd', name: 'Emily Davis', avatar: '/avatars/emily.jpg', trustScore: 85 },
  { id: '5', username: '@johnd', name: 'John Doe', avatar: '/avatars/john.jpg', trustScore: 90 },
];

export default function AddFriendModal({ isOpen, onClose, onSubmit }: AddFriendModalProps) {
  const [formData, setFormData] = useState<FriendFormData>({
    username: ''
  });
  const [suggestions, setSuggestions] = useState<UserSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.username.trim()) {
      onSubmit(formData);
      onClose();
    }
  };

  const handleUsernameChange = (value: string) => {
    setFormData({ username: value });
    
    if (value.trim()) {
      const filtered = mockUsers.filter(user => 
        user.username.toLowerCase().includes(value.toLowerCase()) ||
        user.name.toLowerCase().includes(value.toLowerCase())
      );
      setSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const selectSuggestion = (user: UserSuggestion) => {
    setFormData({ username: user.username });
    setShowSuggestions(false);
  };

  useEffect(() => {
    if (!isOpen) {
      setFormData({ username: '' });
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-800">Add Friend</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Username *
              </label>
              <input
                type="text"
                required
                value={formData.username}
                onChange={(e) => handleUsernameChange(e.target.value)}
                onFocus={() => formData.username.trim() && setShowSuggestions(true)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Search for users..."
              />
              
              {/* Suggestions dropdown */}
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
                  {suggestions.map(user => (
                    <button
                      key={user.id}
                      type="button"
                      onClick={() => selectSuggestion(user)}
                      className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center space-x-3 border-b border-gray-100 last:border-b-0"
                    >
                      <img 
                        src={user.avatar} 
                        alt={user.name}
                        className="w-8 h-8 rounded-full"
                        onError={(e) => {
                          e.currentTarget.src = 'https://via.placeholder.com/32?text=' + user.name.charAt(0);
                        }}
                      />
                      <div className="flex-1">
                        <div className="font-medium text-gray-800">{user.name}</div>
                        <div className="text-sm text-gray-500">{user.username}</div>
                      </div>
                      <div className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded-full">
                        {user.trustScore}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Send Request
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 