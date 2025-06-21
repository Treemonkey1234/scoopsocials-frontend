import express from 'express';
import { logger } from '../utils/logger';

const router = express.Router();

// Mock data for now - we will connect this to the database later
const mockFeed = [
  {
    id: 1,
    author: { id: 'user-1', name: "Jamie Rivera", username: "@jamier", avatar: "https://via.placeholder.com/40x40/6366f1/fff?text=JR", trustScore: 92 },
    content: "Just connected the frontend to the backend! It's working!",
    timestamp: new Date().toISOString(),
    votes: 100,
    canVote: true,
    reactions: { "🚀": { count: 10, users: [] } },
    reviewOf: { type: 'event', event: { id: 'evt-123', name: 'Live Deployment Party', date: 'Today', location: 'The Internet', currentUserAttended: true, hasEnded: false } },
  },
    {
    id: 2,
    author: { id: 'user-2', name: "Alex Johnson", username: "@alexj", avatar: "https://via.placeholder.com/40x40/6366f1/fff?text=AJ", trustScore: 87 },
    content: "This is a post coming directly from the live Railway backend.",
    timestamp: new Date().toISOString(),
    votes: 42,
    canVote: true,
    reactions: { "👍": { count: 5, users: [] } },
    reviewOf: { type: 'user', user: { id: 'user-1', name: "Jamie Rivera", username: "@jamier", avatar: "https://via.placeholder.com/40x40/6366f1/fff?text=JR", trustScore: 92 } },
  },
];


/**
 * @route GET /api/posts
 * @desc Get all posts for the main feed
 * @access Public
 */
router.get('/', (req, res) => {
  logger.info('GET /api/posts - Fetching feed');
  res.json(mockFeed);
});

/**
 * @route POST /api/posts
 * @desc Create a new post
 * @access Private (to be implemented)
 */
router.post('/', (req, res) => {
    const { content, taggedUsers } = req.body;

    if (!content || !taggedUsers || taggedUsers.length === 0) {
        return res.status(400).json({ msg: 'Post content and at least one tagged user are required.' });
    }

    const newPost = {
        id: Date.now(),
        author: { id: 'user-id-from-auth', name: "Authenticated User", username: "@authuser", avatar: "https://via.placeholder.com/40x40/6366f1/fff?text=AU", trustScore: 100 },
        content,
        taggedUsers,
        timestamp: new Date().toISOString(),
        votes: 0,
        canVote: true,
        reactions: {},
        reviewOf: { type: 'user' as const, user: { id: 'user-id-from-auth', name: "Authenticated User", username: "@authuser", avatar: "https://via.placeholder.com/40x40/6366f1/fff?text=AU", trustScore: 100 } }
    };
    
    logger.info('POST /api/posts - Creating new post:', newPost);

    // Add to our in-memory mock feed for now
    mockFeed.unshift(newPost as any);
    
    res.status(201).json(newPost);
});

export default router; 