import React, { useState } from "react";
// @ts-ignore
import { useNavigate } from "react-router-dom";
import PlusButton from "../components/PlusButton";

type Group = {
  id: number;
  name: string;
  description: string;
  avatar: string;
  memberCount: number;
  isPrivate: boolean;
  category: string;
  trustScore: number;
  isMember: boolean;
  isAdmin: boolean;
  lastActivity: string;
  createdBy: string;
  tags: string[];
  location?: string;
  upcomingEvents: number;
};

type GroupMember = {
  id: number;
  name: string;
  username: string;
  avatar: string;
  role: 'admin' | 'moderator' | 'member';
  trustScore: number;
  joinedAt: string;
  isOnline: boolean;
};

type GroupEvent = {
  id: number;
  title: string;
  date: string;
  time: string;
  location: string;
  attendees: number;
  maxAttendees: number;
  isVirtual: boolean;
};

// Mock data
const mockGroups: Group[] = [
  {
    id: 1,
    name: "NYC Tech Enthusiasts",
    description: "A community for tech professionals and enthusiasts in New York City",
    avatar: "https://via.placeholder.com/60x60/6366f1/fff?text=NYC",
    memberCount: 1247,
    isPrivate: false,
    category: "Technology",
    trustScore: 92,
    isMember: true,
    isAdmin: false,
    lastActivity: "2 hours ago",
    createdBy: "Sarah Wilson",
    tags: ["tech", "networking", "startups"],
    location: "New York, NY",
    upcomingEvents: 3
  },
  {
    id: 2,
    name: "Coffee Lovers NYC",
    description: "Discover the best coffee shops and cafes in New York City",
    avatar: "https://via.placeholder.com/60x60/f59e0b/fff?text=☕",
    memberCount: 892,
    isPrivate: false,
    category: "Food & Drink",
    trustScore: 88,
    isMember: true,
    isAdmin: true,
    lastActivity: "1 day ago",
    createdBy: "Alex Johnson",
    tags: ["coffee", "food", "cafes"],
    location: "New York, NY",
    upcomingEvents: 1
  },
  {
    id: 3,
    name: "Brooklyn Photography Club",
    description: "Photography enthusiasts sharing tips, techniques, and photo walks",
    avatar: "https://via.placeholder.com/60x60/ef4444/fff?text=📸",
    memberCount: 456,
    isPrivate: true,
    category: "Creative",
    trustScore: 85,
    isMember: false,
    isAdmin: false,
    lastActivity: "3 days ago",
    createdBy: "Mike Chen",
    tags: ["photography", "art", "creative"],
    location: "Brooklyn, NY",
    upcomingEvents: 2
  },
  {
    id: 4,
    name: "Central Park Runners",
    description: "Running group for all levels - meetups in Central Park",
    avatar: "https://via.placeholder.com/60x60/10b981/fff?text=🏃",
    memberCount: 234,
    isPrivate: false,
    category: "Fitness",
    trustScore: 90,
    isMember: false,
    isAdmin: false,
    lastActivity: "5 hours ago",
    createdBy: "Jamie Rivera",
    tags: ["running", "fitness", "outdoors"],
    location: "Central Park, NY",
    upcomingEvents: 4
  }
];

const mockGroupMembers: GroupMember[] = [
  {
    id: 1,
    name: "Sarah Wilson",
    username: "@sarahw",
    avatar: "https://via.placeholder.com/40x40/6366f1/fff?text=SW",
    role: "admin",
    trustScore: 95,
    joinedAt: "2024-01-15",
    isOnline: true
  },
  {
    id: 2,
    name: "Alex Johnson",
    username: "@alexj",
    avatar: "https://via.placeholder.com/40x40/6366f1/fff?text=AJ",
    role: "moderator",
    trustScore: 87,
    joinedAt: "2024-02-20",
    isOnline: false
  },
  {
    id: 3,
    name: "Mike Chen",
    username: "@mikechen",
    avatar: "https://via.placeholder.com/40x40/6366f1/fff?text=MC",
    role: "member",
    trustScore: 82,
    joinedAt: "2024-03-10",
    isOnline: true
  }
];

const mockGroupEvents: GroupEvent[] = [
  {
    id: 1,
    title: "Tech Meetup: AI & Machine Learning",
    date: "2024-06-25",
    time: "7:00 PM",
    location: "WeWork Soho",
    attendees: 45,
    maxAttendees: 60,
    isVirtual: false
  },
  {
    id: 2,
    title: "Coffee Tasting Workshop",
    date: "2024-06-28",
    time: "2:00 PM",
    location: "Blue Bottle Coffee",
    attendees: 12,
    maxAttendees: 20,
    isVirtual: false
  },
  {
    id: 3,
    title: "Virtual Photography Q&A",
    date: "2024-06-30",
    time: "8:00 PM",
    location: "Zoom Meeting",
    attendees: 28,
    maxAttendees: 50,
    isVirtual: true
  }
];

const categories = [
  "All", "Technology", "Food & Drink", "Creative", "Fitness", 
  "Business", "Social", "Education", "Entertainment", "Health"
];

export default function Groups() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("discover");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showGroupDetails, setShowGroupDetails] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [showEventsModal, setShowEventsModal] = useState(false);

  const filteredGroups = mockGroups.filter(group => {
    const matchesCategory = selectedCategory === "All" || group.category === selectedCategory;
    const matchesSearch = group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         group.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         group.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const myGroups = mockGroups.filter(group => group.isMember);
  const recommendedGroups = mockGroups.filter(group => !group.isMember).slice(0, 3);

  const handleJoinGroup = (groupId: number) => {
    const group = mockGroups.find(g => g.id === groupId);
    if (group) {
      group.isMember = true;
      alert(`Joined ${group.name}!`);
    }
  };

  const handleLeaveGroup = (groupId: number) => {
    const group = mockGroups.find(g => g.id === groupId);
    if (group && confirm(`Are you sure you want to leave ${group.name}?`)) {
      group.isMember = false;
      alert(`Left ${group.name}`);
    }
  };

  const handleCreateGroup = () => {
    setShowCreateModal(true);
  };

  const handlePlusAction = (action: 'post' | 'event' | 'friend') => {
    if (action === 'post') {
      navigate('/home', { state: { openCreatePost: true } });
    } else if (action === 'event') {
      navigate('/events', { state: { openCreateEvent: true } });
    } else if (action === 'friend') {
      navigate('/friends', { state: { openAddFriend: true } });
    }
  };

  const renderDiscoverTab = () => (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="space-y-3">
        <div className="relative">
          <input
            type="text"
            placeholder="Search groups..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-200"
          />
          <div className="absolute left-3 top-2.5 text-gray-400">🔍</div>
        </div>
        
        <div className="flex overflow-x-auto space-x-2 pb-2">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap ${
                selectedCategory === category
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Recommended Groups */}
      {selectedCategory === "All" && searchQuery === "" && (
        <div>
          <h3 className="font-semibold text-gray-800 mb-3">Recommended for You</h3>
          <div className="space-y-3">
            {recommendedGroups.map(group => (
              <div key={group.id} className="bg-white rounded-lg p-4 border">
                <div className="flex items-start space-x-3">
                  <img src={group.avatar} alt={group.name} className="w-12 h-12 rounded-lg" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-medium text-gray-800">{group.name}</h4>
                      {group.isPrivate && <span className="text-xs bg-gray-100 text-gray-600 px-1 rounded">Private</span>}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{group.description}</p>
                    <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                      <span>{group.memberCount} members</span>
                      <span>•</span>
                      <span>{group.category}</span>
                      <span>•</span>
                      <span>Trust {group.trustScore}</span>
                    </div>
                    <div className="flex items-center space-x-2 mt-2">
                      {group.tags.slice(0, 3).map(tag => (
                        <span key={tag} className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={() => handleJoinGroup(group.id)}
                    className="px-4 py-1 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700"
                  >
                    Join
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All Groups */}
      <div>
        <h3 className="font-semibold text-gray-800 mb-3">
          {selectedCategory === "All" ? "All Groups" : `${selectedCategory} Groups`}
          {searchQuery && ` - "${searchQuery}"`}
        </h3>
        <div className="space-y-3">
          {filteredGroups.map(group => (
            <div key={group.id} className="bg-white rounded-lg p-4 border">
              <div className="flex items-start space-x-3">
                <img src={group.avatar} alt={group.name} className="w-12 h-12 rounded-lg" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <h4 className="font-medium text-gray-800">{group.name}</h4>
                    {group.isPrivate && <span className="text-xs bg-gray-100 text-gray-600 px-1 rounded">Private</span>}
                    {group.isAdmin && <span className="text-xs bg-purple-100 text-purple-700 px-1 rounded">Admin</span>}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{group.description}</p>
                  <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                    <span>{group.memberCount} members</span>
                    <span>•</span>
                    <span>{group.category}</span>
                    <span>•</span>
                    <span>Trust {group.trustScore}</span>
                    <span>•</span>
                    <span>{group.lastActivity}</span>
                  </div>
                  <div className="flex items-center space-x-2 mt-2">
                    {group.tags.slice(0, 3).map(tag => (
                      <span key={tag} className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col space-y-2">
                  {group.isMember ? (
                    <button
                      onClick={() => handleLeaveGroup(group.id)}
                      className="px-4 py-1 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200"
                    >
                      Leave
                    </button>
                  ) : (
                    <button
                      onClick={() => handleJoinGroup(group.id)}
                      className="px-4 py-1 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700"
                    >
                      Join
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setSelectedGroup(group);
                      setShowGroupDetails(true);
                    }}
                    className="px-4 py-1 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200"
                  >
                    View
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderMyGroupsTab = () => (
    <div className="space-y-4">
      {myGroups.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-4xl mb-2">👥</div>
          <h3 className="font-medium text-gray-800 mb-2">No Groups Yet</h3>
          <p className="text-gray-600 mb-4">Join some groups to get started!</p>
          <button
            onClick={() => setActiveTab("discover")}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Discover Groups
          </button>
        </div>
      ) : (
        myGroups.map(group => (
          <div key={group.id} className="bg-white rounded-lg p-4 border">
            <div className="flex items-start space-x-3">
              <img src={group.avatar} alt={group.name} className="w-12 h-12 rounded-lg" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <h4 className="font-medium text-gray-800">{group.name}</h4>
                  {group.isPrivate && <span className="text-xs bg-gray-100 text-gray-600 px-1 rounded">Private</span>}
                  {group.isAdmin && <span className="text-xs bg-purple-100 text-purple-700 px-1 rounded">Admin</span>}
                </div>
                <p className="text-sm text-gray-600 mt-1">{group.description}</p>
                <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                  <span>{group.memberCount} members</span>
                  <span>•</span>
                  <span>{group.upcomingEvents} upcoming events</span>
                  <span>•</span>
                  <span>{group.lastActivity}</span>
                </div>
              </div>
              <div className="flex flex-col space-y-2">
                <button
                  onClick={() => {
                    setSelectedGroup(group);
                    setShowGroupDetails(true);
                  }}
                  className="px-4 py-1 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700"
                >
                  Open
                </button>
                <button
                  onClick={() => handleLeaveGroup(group.id)}
                  className="px-4 py-1 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200"
                >
                  Leave
                </button>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-white border-b">
        <h1 className="text-lg font-semibold">Groups</h1>
        <PlusButton onAction={handlePlusAction} />
      </div>

      {/* Tabs */}
      <div className="bg-white border-b">
        <div className="flex">
          {["discover", "my-groups"].map(tab => (
            <button
              key={tab}
              className={`flex-1 py-3 text-center font-medium text-sm transition-colors ${
                activeTab === tab 
                  ? 'border-b-2 border-purple-600 text-purple-600' 
                  : 'text-gray-500'
              }`}
              onClick={() => setActiveTab(tab)}
            >
              {tab === "discover" ? "Discover" : "My Groups"}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {activeTab === "discover" && renderDiscoverTab()}
        {activeTab === "my-groups" && renderMyGroupsTab()}
      </div>

      {/* Create Group Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">Create New Group</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Group Name
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-200"
                    placeholder="Enter group name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-200"
                    rows={3}
                    placeholder="Describe your group"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-200">
                    {categories.slice(1).map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Privacy
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input type="radio" name="privacy" value="public" defaultChecked className="mr-2" />
                      <span className="text-sm">Public - Anyone can find and join</span>
                    </label>
                    <label className="flex items-center">
                      <input type="radio" name="privacy" value="private" className="mr-2" />
                      <span className="text-sm">Private - Invitation only</span>
                    </label>
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-2 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    alert("Group created successfully!");
                    setShowCreateModal(false);
                  }}
                  className="flex-1 py-2 px-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  Create Group
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Group Details Modal */}
      {showGroupDetails && selectedGroup && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold">{selectedGroup.name}</h3>
              <button
                onClick={() => setShowGroupDetails(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <div className="p-4 overflow-y-auto max-h-96">
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <img src={selectedGroup.avatar} alt={selectedGroup.name} className="w-16 h-16 rounded-lg" />
                  <div>
                    <h4 className="font-medium text-gray-800">{selectedGroup.name}</h4>
                    <p className="text-sm text-gray-600">{selectedGroup.description}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      {selectedGroup.isPrivate && <span className="text-xs bg-gray-100 text-gray-600 px-1 rounded">Private</span>}
                      <span className="text-xs text-gray-500">{selectedGroup.category}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="text-xl font-bold text-purple-700">{selectedGroup.memberCount}</div>
                    <div className="text-xs text-gray-600">Members</div>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="text-xl font-bold text-blue-700">{selectedGroup.upcomingEvents}</div>
                    <div className="text-xs text-gray-600">Events</div>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      setShowMembersModal(true);
                      setShowGroupDetails(false);
                    }}
                    className="flex-1 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200"
                  >
                    Members
                  </button>
                  <button
                    onClick={() => {
                      setShowEventsModal(true);
                      setShowGroupDetails(false);
                    }}
                    className="flex-1 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200"
                  >
                    Events
                  </button>
                </div>

                <div>
                  <h5 className="font-medium text-gray-800 mb-2">Tags</h5>
                  <div className="flex flex-wrap gap-2">
                    {selectedGroup.tags.map(tag => (
                      <span key={tag} className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="text-xs text-gray-500">
                  Created by {selectedGroup.createdBy} • {selectedGroup.lastActivity}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Members Modal */}
      {showMembersModal && selectedGroup && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold">{selectedGroup.name} - Members</h3>
              <button
                onClick={() => setShowMembersModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <div className="p-4 overflow-y-auto max-h-96">
              <div className="space-y-3">
                {mockGroupMembers.map(member => (
                  <div key={member.id} className="flex items-center space-x-3 p-2 bg-gray-50 rounded-lg">
                    <img src={member.avatar} alt={member.name} className="w-10 h-10 rounded-full" />
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-gray-800">{member.name}</span>
                        <span className={`text-xs px-1.5 py-0.5 rounded ${
                          member.role === 'admin' ? 'bg-red-100 text-red-700' :
                          member.role === 'moderator' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {member.role}
                        </span>
                        {member.isOnline && <span className="text-xs text-green-600">● Online</span>}
                      </div>
                      <div className="text-xs text-gray-500">{member.username}</div>
                      <div className="text-xs text-gray-400">Trust {member.trustScore} • Joined {member.joinedAt}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Events Modal */}
      {showEventsModal && selectedGroup && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold">{selectedGroup.name} - Events</h3>
              <button
                onClick={() => setShowEventsModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <div className="p-4 overflow-y-auto max-h-96">
              <div className="space-y-3">
                {mockGroupEvents.map(event => (
                  <div key={event.id} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-800">{event.title}</h4>
                        <div className="text-sm text-gray-600 mt-1">
                          {event.date} at {event.time}
                        </div>
                        <div className="text-sm text-gray-500 mt-1">
                          {event.isVirtual ? '🌐 Virtual Event' : `📍 ${event.location}`}
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          {event.attendees}/{event.maxAttendees} attending
                        </div>
                      </div>
                      <button className="px-3 py-1 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700">
                        RSVP
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 