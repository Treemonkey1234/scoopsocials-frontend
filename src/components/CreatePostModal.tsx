import React, { useState } from 'react';
import { User } from '../types'; // Using the main User type now

interface PostFormData {
  content: string;
  taggedUsers: User[];
}

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (postData: PostFormData) => void;
  friends?: User[]; // Pass in a list of friends to tag
}

// Mock friends data as a fallback if no `friends` prop is provided
const mockFriends: User[] = [
  { id: 'user-2', name: 'Alex Johnson', username: '@alexj', avatar: 'https://via.placeholder.com/40x40/6366f1/fff?text=AJ', trustScore: 87 },
  { id: 'user-3', name: 'Taylor Kim', username: '@taylork', avatar: 'https://via.placeholder.com/40x40/6366f1/fff?text=TK', trustScore: 78 },
  { id: 'user-1', name: "Jamie Rivera", username: "@jamier", avatar: "https://via.placeholder.com/40x40/6366f1/fff?text=JR", trustScore: 92 },
];

const CreatePostModal: React.FC<CreatePostModalProps> = ({ isOpen, onClose, onSubmit, friends }) => {
  const [content, setContent] = useState('');
  const [taggedUsers, setTaggedUsers] = useState<User[]>([]);
  const [showFriendSelector, setShowFriendSelector] = useState(false);

  const availableFriends = friends || mockFriends;
  const isPostButtonDisabled = taggedUsers.length === 0;

  if (!isOpen) {
    return null;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (content.trim()) {
      onSubmit({ content, taggedUsers });
      setContent('');
      setTaggedUsers([]);
      onClose();
    }
  };

  const toggleFriendSelection = (friend: User) => {
    setTaggedUsers(prev => 
      prev.some(u => u.id === friend.id)
        ? prev.filter(u => u.id !== friend.id)
        : [...prev, friend]
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-800">Create Post</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <textarea
              required
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="What's on your mind?"
            />

            <div>
              <button
                type="button"
                onClick={() => setShowFriendSelector(!showFriendSelector)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-left text-gray-700 hover:bg-gray-50 flex items-center justify-between"
              >
                <span>{taggedUsers.length > 0 ? `${taggedUsers.length} friend(s) tagged` : 'Tag Friends'}</span>
                <span>{showFriendSelector ? '▲' : '▼'}</span>
              </button>

              {showFriendSelector && (
                <div className="mt-2 border border-gray-200 rounded-lg max-h-48 overflow-y-auto">
                  {availableFriends.map(friend => {
                    const isSelected = taggedUsers.some(u => u.id === friend.id);
                    return (
                      <div
                        key={friend.id}
                        onClick={() => toggleFriendSelection(friend)}
                        className={`p-3 hover:bg-gray-100 cursor-pointer flex items-center justify-between ${isSelected ? 'bg-blue-50' : ''}`}
                      >
                        <span>{friend.name} ({friend.username})</span>
                        {isSelected && <span className="text-primary">✓</span>}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className={`flex-1 px-4 py-2 rounded-lg text-white ${
                  isPostButtonDisabled
                    ? 'bg-primary-light cursor-not-allowed'
                    : 'bg-primary hover:bg-primary-dark'
                }`}
                disabled={isPostButtonDisabled}
                title={isPostButtonDisabled ? "You must tag at least one friend to post." : ""}
              >
                Post
              </button>
            </div>
            {isPostButtonDisabled && (
              <p className="text-center text-sm text-red-500 mt-2">
                Please tag at least one friend to continue.
              </p>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreatePostModal; 