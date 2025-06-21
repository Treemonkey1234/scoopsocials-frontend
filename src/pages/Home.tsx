import React, { useState, useEffect } from 'react';
import PostCard from '../components-v2/features/PostCard';
import { Post, User, Event } from '../types';
import { Card } from '../components-v2';
import PlusButton from '../components/PlusButton';
import { getFeed, createPost } from '../services/api';
import { useNavigate, useLocation } from 'react-router-dom';
import CreatePostModal from '../components/CreatePostModal';
import { useUser } from '../context/UserContext';

const mockUser1: User = { id: 'user-1', name: "Jamie Rivera", username: "@jamier", avatar: "https://via.placeholder.com/40x40/6366f1/fff?text=JR", trustScore: 92 };
const mockUser2: User = { id: 'user-2', name: "Alex Johnson", username: "@alexj", avatar: "https://via.placeholder.com/40x40/6366f1/fff?text=AJ", trustScore: 87 };
const mockUser3: User = { id: 'user-3', name: "Taylor Kim", username: "@taylork", avatar: "https://via.placeholder.com/40x40/6366f1/fff?text=TK", trustScore: 78 };

const mockEvent1: Event = { 
  id: 'evt-123', 
  name: 'Central Park Sunset Viewing', 
  description: 'A beautiful sunset viewing event in Central Park',
  date: 'Yesterday', 
  location: 'Central Park',
  organizer: { id: 'user-1', name: 'Jamie Rivera', username: '@jamier' },
  attendees: ['user-1', 'user-2'],
  isPublic: true,
  createdAt: '2024-01-01T00:00:00Z'
};
const mockEvent2: Event = { 
  id: 'evt-456', 
  name: 'Rooftop Party', 
  description: 'An amazing rooftop party with great views',
  date: 'Last Night', 
  location: 'Skyline Rooftop',
  organizer: { id: 'user-3', name: 'Taylor Kim', username: '@taylork' },
  attendees: ['user-1', 'user-2', 'user-3'],
  isPublic: true,
  createdAt: '2024-01-01T00:00:00Z'
};

const mockFeed: Post[] = [
  {
    id: 1,
    author: mockUser1,
    content: "Had an amazing time at the Central Park event! The sunset was absolutely breathtaking. Highly recommend this spot for evening gatherings.",
    timestamp: "2h ago",
    votes: 12,
    canVote: true,
    reactions: { "👍": { count: 8, users: [] }, "❤️": { count: 3, users: [] } },
    reviewOf: { type: 'event', event: mockEvent1 },
    taggedUsers: [mockUser2],
  },
  {
    id: 2,
    author: mockUser2,
    content: "Taylor is a fantastic event organizer. Everything is always so well-planned!",
    timestamp: "4h ago",
    votes: 3,
    canVote: true,
    reactions: { "👍": { count: 2, users: [] }, "😮": { count: 1, users: [] } },
    reviewOf: { type: 'user', user: mockUser3 },
  },
  {
    id: 3,
    author: mockUser3,
    content: "Always brings the best energy to every event. A true community builder!",
    timestamp: "1d ago",
    votes: 7,
    canVote: false,
    reactions: { "🔥": { count: 5, users: [] }, "👍": { count: 3, users: [] } },
    reviewOf: { type: 'user', user: mockUser1 },
  },
  {
    id: 4,
    author: mockUser1,
    content: "The rooftop party last night was amazing! Great music and even better company.",
    timestamp: "8h ago",
    votes: 15,
    canVote: true,
    reactions: { "🎉": { count: 10, users: [] } },
    reviewOf: { type: 'event', event: mockEvent2 },
    taggedUsers: [mockUser2, mockUser3],
  }
];

const Home: React.FC = () => {
    const { currentUser } = useUser();
    const [feed, setFeed] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [votes, setVotes] = useState<{ [id: string]: 0 | 1 | -1 }>({});
    const navigate = useNavigate();
    const location = useLocation();
    const [isCreatePostModalOpen, setCreatePostModalOpen] = useState(false);

    // Check for navigation state to open create post modal
    useEffect(() => {
        if (location.state?.openCreatePost) {
            setCreatePostModalOpen(true);
            // Clear the state to prevent reopening on subsequent renders
            navigate(location.pathname, { replace: true, state: {} });
        }
    }, [location.state, navigate, location.pathname]);

    useEffect(() => {
        const fetchFeed = async () => {
            try {
                const response = await getFeed();
                setFeed(response.data);
                setLoading(false);
            } catch (err) {
                setError('Failed to fetch feed. Please try again later.');
                setLoading(false);
                console.error(err);
            }
        };

        fetchFeed();
    }, []);

    const handleVote = (id: string | number, direction: 1 | -1) => {
        const idStr = id.toString();
        setVotes(prev => ({ ...prev, [idStr]: prev[idStr] === direction ? 0 : direction }));
    };
    
    const handleAction = (action: string) => (id: string | number) => {
        console.log(`${action} on item ${id}`);
    };

    const handlePlusAction = (action: 'post' | 'event' | 'friend') => {
        switch (action) {
            case 'post':
                setCreatePostModalOpen(true);
                break;
            case 'event':
                navigate('/events', { state: { openCreateEvent: true } });
                break;
            case 'friend':
                navigate('/friends', { state: { openAddFriend: true } });
                break;
        }
    };

    const handleCreatePost = async (postData: { content: string; taggedUsers: User[] }) => {
        try {
            const response = await createPost(postData);
            const newPost = response.data;
            setFeed([newPost, ...feed]);
            setCreatePostModalOpen(false);
        } catch (err) {
            console.error("Failed to create post:", err);
            // Optionally: show an error message to the user
            alert("Error: Could not create post. Please try again.");
        }
    };

    return (
        <div className="min-h-screen" style={{ backgroundColor: 'var(--color-background)' }}>
            {/* Header - Updated to match other pages */}
            <div className="bg-primary text-white p-lg shadow-lg sticky top-0 z-10">
                <div className="max-w-2xl mx-auto flex items-center justify-between">
                    <h1 className="text-h1 font-bold text-white">Home</h1>
                    <PlusButton onAction={handlePlusAction} />
                </div>
            </div>

            <CreatePostModal
                isOpen={isCreatePostModalOpen}
                onClose={() => setCreatePostModalOpen(false)}
                onSubmit={handleCreatePost}
            />

            {/* Main Content - Updated with white background for content cards */}
            <main className="max-w-2xl mx-auto p-lg">
                <div className="space-y-xl">
                    {/* --- Welcome Card --- */}
                    <Card className="p-xl text-center relative overflow-hidden bg-white mb-lg">
                        <h2 className="text-h2 font-bold mb-sm text-primary">Welcome back, {currentUser ? currentUser.name : 'Guest'}!</h2>
                        <p className="text-secondary-text">Here's what's happening in your network.</p>
                    </Card>

                    {/* --- Post Feed --- */}
                    <div className="bg-white rounded-lg p-lg">
                        <h3 className="text-h3 font-bold text-primary mb-md">Feed</h3>
                        {loading && <p>Loading feed...</p>}
                        {error && <p className="text-red-500">{error}</p>}
                        {!loading && !error && (
                            <div className="space-y-md">
                                {feed.map(post => (
                                    <PostCard 
                                        key={post.id}
                                        post={post}
                                        onComment={handleAction('Comment')}
                                        onShare={handleAction('Share')}
                                        onReaction={handleAction('Reaction')}
                                        onVote={handleVote}
                                        userVote={votes[post.id.toString()] || 0}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Home;

/*
// =================================================================================
// The original content of Home.tsx is commented out below for debugging purposes.
// =================================================================================
[The entire previous content of Home.tsx would be here, inside a giant comment block]
*/