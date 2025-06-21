import React, { useState, useEffect } from "react";
// @ts-ignore
import { useRouter } from "next/router";
import PlusButton from "../components/PlusButton";
import { Card, Button } from "../components-v2";

// Enhanced mock data for advanced search
const mockPosts = [
  {
    id: 1,
    user: {
    name: "Jamie Rivera",
    username: "@jamier",
    avatar: "https://via.placeholder.com/40x40/6366f1/fff?text=JR",
      trustScore: 92
    },
    content: "Had an amazing time at the Central Park event! The sunset was absolutely breathtaking.",
    timestamp: "2h ago",
    location: "Central Park, NYC",
    reactions: {
      "👍": { count: 8, users: ["@alexj", "@taylork"] },
      "❤️": { count: 3, users: ["@mikechen"] }
    }
  },
  {
    id: 2,
    user: {
      name: "Alex Johnson",
      username: "@alexj",
      avatar: "https://via.placeholder.com/40x40/6366f1/fff?text=AJ",
      trustScore: 87
    },
    content: "Anyone going to the rooftop party tonight? Should be an amazing view!",
    timestamp: "4h ago",
    location: "Skyline Rooftop, Brooklyn",
    reactions: {
      "👍": { count: 2, users: ["@taylork"] },
      "😮": { count: 1, users: ["@sarahw"] }
    }
  }
];

const mockEvents = [
  {
    id: 1,
    title: "Central Park Sunset Meetup",
    description: "Join us for a beautiful evening in Central Park",
    date: "Tomorrow, 6:00 PM",
    location: "Central Park, NYC",
    status: "upcoming",
    attendees: 24,
    category: "Social"
  },
  {
    id: 2,
    title: "Tech Networking Night",
    description: "Connect with fellow developers and tech enthusiasts",
    date: "Friday, 7:00 PM",
    location: "Brooklyn Tech Hub",
    status: "upcoming",
    attendees: 45,
    category: "Professional"
  }
];

const mockPeople = [
  {
    id: 1,
    name: "Sarah Wilson",
    username: "@sarahw",
    avatar: "https://via.placeholder.com/40x40/6366f1/fff?text=SW",
    occupation: "Product Manager",
    location: "New York, NY",
    trustScore: 88
  },
  {
    id: 2,
    name: "Mike Chen",
    username: "@mikechen",
    avatar: "https://via.placeholder.com/40x40/6366f1/fff?text=MC",
    occupation: "Software Engineer",
    location: "Brooklyn, NY",
    trustScore: 82
  }
];

const trendingTopics = [
  { id: 1, topic: "Central Park", icon: "🌳", postCount: 156, trend: "up" as const },
  { id: 2, topic: "Tech Meetups", icon: "💻", postCount: 89, trend: "up" as const },
  { id: 3, topic: "Coffee Shops", icon: "☕", postCount: 234, trend: "stable" as const },
  { id: 4, topic: "Art Galleries", icon: "🎨", postCount: 67, trend: "down" as const }
];

export default function Search() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("Posts");
  const [filteredPosts, setFilteredPosts] = useState(mockPosts);
  const [filteredEvents, setFilteredEvents] = useState(mockEvents);
  const [filteredPeople, setFilteredPeople] = useState(mockPeople);

  // Filter functions
  const handlePostClick = (post: any) => {
    console.log("Post clicked:", post);
    // Navigate to post detail
  };

  const handleEventClick = (event: any) => {
    console.log("Event clicked:", event);
    // Navigate to event detail
  };

  const handlePersonClick = (person: any) => {
    console.log("Person clicked:", person);
    // Navigate to profile
  };

  const handlePlusAction = (action: 'post' | 'event' | 'friend') => {
    console.log(`Plus button clicked: ${action}`);
  };

  // Enhanced search with filters
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredPosts([]);
      setFilteredEvents([]);
      setFilteredPeople([]);
      return;
    }
    
    const timeoutId = setTimeout(() => {
      const query = searchQuery.toLowerCase();
      
      // Filter posts
      const filteredPosts = mockPosts.filter(post => 
        post.content.toLowerCase().includes(query) ||
        post.user.name.toLowerCase().includes(query) ||
        post.user.username.toLowerCase().includes(query) ||
        post.location.toLowerCase().includes(query)
      );

      // Filter events
      const filteredEvents = mockEvents.filter(event =>
        event.title.toLowerCase().includes(query) ||
        event.description.toLowerCase().includes(query) ||
        event.location.toLowerCase().includes(query)
      );

      // Filter people
      const filteredPeople = mockPeople.filter(person => 
        person.name.toLowerCase().includes(query) ||
        person.username.toLowerCase().includes(query) ||
        person.location.toLowerCase().includes(query)
      );

      setFilteredPosts(filteredPosts);
      setFilteredEvents(filteredEvents);
      setFilteredPeople(filteredPeople);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
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

  const renderPostResult = (post: typeof mockPosts[0]) => (
    <Card key={post.id} className="p-md cursor-pointer" onClick={() => handlePostClick(post)}>
      <div className="flex items-start space-x-md">
        <img src={post.user.avatar} alt={post.user.name} className="w-10 h-10 rounded-full" />
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div>
              <span className="font-bold text-primary">{post.user.name}</span>
              <span className="text-secondary text-sm ml-sm">· {post.timestamp}</span>
          </div>
            <span className={`px-sm py-xs rounded-full text-xs font-medium ${getTrustScoreBg(post.user.trustScore)} ${getTrustScoreColor(post.user.trustScore)}`}>
              {post.user.trustScore}
            </span>
          </div>
          <p className="text-primary mt-xs">{post.content}</p>
        </div>
      </div>
    </Card>
  );

  const renderEventResult = (event: typeof mockEvents[0]) => (
    <Card key={event.id} className="p-md cursor-pointer" onClick={() => handleEventClick(event)}>
        <h4 className="font-bold text-primary">{event.title}</h4>
        <p className="text-secondary text-sm mt-xs">{event.description}</p>
        <div className="flex justify-between items-center mt-sm">
            <span className="text-secondary text-sm">{event.date}</span>
            <span className="text-secondary text-sm">{event.attendees} going</span>
        </div>
    </Card>
  );

  const renderPersonResult = (person: typeof mockPeople[0]) => (
    <Card key={person.id} className="p-md cursor-pointer" onClick={() => handlePersonClick(person)}>
        <div className="flex items-center space-x-md">
            <img src={person.avatar} alt={person.name} className="w-12 h-12 rounded-full" />
            <div className="flex-1">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="font-bold text-primary">{person.name}</p>
                        <p className="text-secondary text-sm">{person.username}</p>
      </div>
                    <span className={`px-sm py-xs rounded-full text-xs font-medium ${getTrustScoreBg(person.trustScore)} ${getTrustScoreColor(person.trustScore)}`}>
                        {person.trustScore}
            </span>
        </div>
      </div>
    </div>
    </Card>
  );

  const hasQuery = searchQuery.trim().length > 0;
  const tabOptions = ["Posts", "Events", "People", "Topics"];

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-background)' }}>
      {/* Header */}
      <div className="bg-primary text-white p-lg shadow-lg sticky top-0 z-10">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <h1 className="text-h1 font-bold text-white">Search</h1>
          <PlusButton onAction={handlePlusAction} />
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto p-lg">
        {/* Search Bar */}
        <div className="bg-white rounded-lg p-lg mb-lg">
          <div className="relative">
            <input
              type="text"
              placeholder="Search users, events, and posts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full p-lg pl-12 pr-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
            <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex space-x-6 overflow-x-auto items-center mt-md">
          {tabOptions.map(tab => (
            <div
              key={tab}
              className="cursor-pointer py-2"
              onClick={() => setActiveTab(tab)}
            >
              {activeTab === tab ? (
                <span className="bg-white text-primary text-md font-bold rounded-full px-4 py-2">
                  {tab}
                </span>
              ) : (
                <span className="text-blue-200 text-md font-normal">{tab}</span>
              )}
            </div>
          ))}
        </div>

        {hasQuery ? (
            <div className="space-y-md max-w-2xl mx-auto">
                {activeTab === 'Posts' && filteredPosts.map(renderPostResult)}
                {activeTab === 'Events' && filteredEvents.map(renderEventResult)}
                {activeTab === 'People' && filteredPeople.map(renderPersonResult)}
                {activeTab === 'Topics' && trendingTopics.map(topic => (
                    <Card key={topic.id} className="p-md">
                        <span className="text-lg mr-sm">{topic.icon}</span>
                        <span className="font-bold text-primary">{topic.topic}</span>
                    </Card>
              ))}
            </div>
      ) : (
          <div className="text-center text-secondary py-xl">
              <p>Search for people, events, posts, and more.</p>
        </div>
      )}
      </div>
    </div>
  );
} 