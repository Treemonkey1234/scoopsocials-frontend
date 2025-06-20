import React, { useState } from 'react';
import AddressAutocomplete from './AddressAutocomplete';
import EventTemplates, { EventTemplate } from './EventTemplates';
import SmartDateTimePicker from './SmartDateTimePicker';

interface CreateEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (eventData: EventFormData) => void;
}

interface EventFormData {
  name: string;
  date: string;
  time: string;
  location: string;
  description: string;
  category: string;
  maxGuests: number;
  isPrivate: boolean;
  price: number;
  ageRestriction: string;
  tags: string[];
  coordinates?: { lat: number; lng: number };
  invitedFriends?: string[];
}

// Mock friends data - in a real app, this would come from a friends API
const mockFriends = [
  { id: '1', name: 'Sarah Johnson', username: '@sarahj', avatar: '/avatars/sarah.jpg' },
  { id: '2', name: 'Mike Chen', username: '@mikechen', avatar: '/avatars/mike.jpg' },
  { id: '3', name: 'Emma Davis', username: '@emmad', avatar: '/avatars/emma.jpg' },
  { id: '4', name: 'Alex Rodriguez', username: '@alexr', avatar: '/avatars/alex.jpg' },
  { id: '5', name: 'Lisa Wang', username: '@lisaw', avatar: '/avatars/lisa.jpg' },
];

const eventCategories = ["Social", "Party", "Food", "Sports", "Business", "Wellness", "Music", "Outdoor", "Tech"];

export default function CreateEventModal({ isOpen, onClose, onSubmit }: CreateEventModalProps) {
  const [formData, setFormData] = useState<EventFormData>({
    name: '',
    date: '',
    time: '',
    location: '',
    description: '',
    category: 'Social',
    maxGuests: 50,
    isPrivate: false,
    price: 0,
    ageRestriction: 'All ages',
    tags: [],
    invitedFriends: []
  });

  const [tagInput, setTagInput] = useState('');
  const [showTemplates, setShowTemplates] = useState(true);
  const [showFriendsModal, setShowFriendsModal] = useState(false);
  const [selectedFriends, setSelectedFriends] = useState<string[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Submitting event form data:', formData);
    console.log('Form coordinates:', formData.coordinates);
    onSubmit(formData);
    onClose();
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleTemplateSelect = (template: EventTemplate) => {
    setFormData(prev => ({
      ...prev,
      category: template.category,
      maxGuests: template.defaultSettings.maxGuests,
      isPrivate: template.defaultSettings.isPrivate,
      price: template.defaultSettings.price,
      ageRestriction: template.defaultSettings.ageRestriction,
      tags: template.defaultSettings.tags
    }));
    setShowTemplates(false);
  };

  const handleAddFriends = () => {
    setSelectedFriends(formData.invitedFriends || []);
    setShowFriendsModal(true);
  };

  const handleFriendsModalClose = () => {
    setShowFriendsModal(false);
  };

  const handleFriendsModalSave = () => {
    setFormData(prev => ({
      ...prev,
      invitedFriends: selectedFriends
    }));
    setShowFriendsModal(false);
  };

  const toggleFriendSelection = (friendId: string) => {
    setSelectedFriends(prev => 
      prev.includes(friendId) 
        ? prev.filter(id => id !== friendId)
        : [...prev, friendId]
    );
  };

  const removeInvitedFriend = (friendId: string) => {
    setFormData(prev => ({
      ...prev,
      invitedFriends: prev.invitedFriends?.filter(id => id !== friendId) || []
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-800">Create Event</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Event Templates */}
            {showTemplates && (
              <EventTemplates onSelectTemplate={handleTemplateSelect} />
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Event Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Enter event name"
              />
            </div>

            {/* Smart Date/Time Picker */}
            <SmartDateTimePicker
              date={formData.date}
              time={formData.time}
              onDateChange={(date) => setFormData(prev => ({ ...prev, date }))}
              onTimeChange={(time) => setFormData(prev => ({ ...prev, time }))}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location *
              </label>
              <AddressAutocomplete
                value={formData.location}
                onChange={(value) => setFormData(prev => ({ ...prev, location: value }))}
                onCoordinatesSelect={(coords) => {
                  console.log('CreateEventModal: Received coordinates from AddressAutocomplete:', coords);
                  setFormData(prev => {
                    const newData = { ...prev, coordinates: coords };
                    console.log('CreateEventModal: Updated form data with coordinates:', newData);
                    return newData;
                  });
                }}
                placeholder="Enter location or address"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Describe your event"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  {eventCategories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Max Guests
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.maxGuests}
                  onChange={(e) => setFormData(prev => ({ ...prev, maxGuests: parseInt(e.target.value) || 1 }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price ($)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Age Restriction
                </label>
                <select
                  value={formData.ageRestriction}
                  onChange={(e) => setFormData(prev => ({ ...prev, ageRestriction: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="All ages">All ages</option>
                  <option value="18+">18+</option>
                  <option value="21+">21+</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tags
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Add a tag"
                />
                <button
                  type="button"
                  onClick={addTag}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Add
                </button>
              </div>
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map(tag => (
                    <span
                      key={tag}
                      className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="ml-1 text-purple-600 hover:text-purple-800"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="isPrivate"
                checked={formData.isPrivate}
                onChange={(e) => setFormData(prev => ({ ...prev, isPrivate: e.target.checked }))}
                className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
              />
              <label htmlFor="isPrivate" className="ml-2 block text-sm text-gray-700">
                Private event
              </label>
            </div>

            {/* Add Friends section for private events */}
            {formData.isPrivate && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-medium text-gray-700">
                    Invite Friends
                  </label>
                  <button
                    type="button"
                    onClick={handleAddFriends}
                    className="px-3 py-1 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    Add Friends
                  </button>
                </div>
                
                {/* Invited friends list */}
                {formData.invitedFriends && formData.invitedFriends.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs text-gray-500">Invited friends:</p>
                    <div className="flex flex-wrap gap-2">
                      {formData.invitedFriends.map(friendId => {
                        const friend = mockFriends.find(f => f.id === friendId);
                        return friend ? (
                          <div
                            key={friendId}
                            className="flex items-center gap-2 px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs"
                          >
                            <span>{friend.name}</span>
                            <button
                              type="button"
                              onClick={() => removeInvitedFriend(friendId)}
                              className="text-purple-600 hover:text-purple-800"
                            >
                              ×
                            </button>
                          </div>
                        ) : null;
                      })}
                    </div>
                  </div>
                )}
                
                <p className="text-xs text-gray-500">
                  Only invited friends will be able to see and RSVP to this event.
                </p>
              </div>
            )}

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
                Create Event
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Friends Selection Modal */}
      {showFriendsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-gray-800">Select Friends to Invite</h3>
                <button
                  onClick={handleFriendsModalClose}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-3 mb-6">
                {mockFriends.map(friend => (
                  <div
                    key={friend.id}
                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedFriends.includes(friend.id)
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => toggleFriendSelection(friend.id)}
                  >
                    <input
                      type="checkbox"
                      checked={selectedFriends.includes(friend.id)}
                      onChange={() => toggleFriendSelection(friend.id)}
                      className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                    />
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                        <span className="text-xs font-medium text-gray-600">
                          {friend.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{friend.name}</p>
                        <p className="text-sm text-gray-500">{friend.username}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleFriendsModalClose}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleFriendsModalSave}
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Save ({selectedFriends.length} selected)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 