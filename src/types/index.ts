export interface User {
  id?: string | number; // Optional ID for user
  name: string;
  username: string;
  avatar: string;
  trustScore?: number;
}

export interface Event {
  id: string;
  name: string;
  description: string;
  date: string;
  location: string;
  organizer: {
    id: string;
    name: string;
    username: string;
  };
  attendees: string[];
  maxAttendees?: number;
  category?: string;
  tags?: string[];
  isPublic: boolean;
  createdAt: string;
  updatedAt?: string;
}

export type MediaItem = {
  id: number;
  type: 'image' | 'video';
  url: string;
  thumbnail?: string;
  caption?: string;
  alt?: string;
  uploadedAt: string;
  size: number;
  dimensions?: { width: number; height: number };
};

export type ReactionData = {
  count: number;
  users: string[]; // should be User['id'][]
};

export type PostReactions = {
  [emoji: string]: ReactionData;
};

export interface Post {
  id: number | string;
  author: User; // Renamed from 'user' for clarity
  content: string;
  timestamp: string;
  votes: number;
  canVote: boolean;
  reactions: PostReactions;
  media?: MediaItem[];
  tags?: string[];
  location?: string;
  isEdited?: boolean;
  isDemo?: boolean;
  editHistory?: Array<{ timestamp: string; content: string }>;
  engagement?: {
    views: number;
    shares: number;
    saves: number;
    reach: number;
  };
  taggedUsers?: User[]; // Replaces mentionedFriend, allows multiple
  reviewOf?: {
    type: 'user';
    user: User;
  } | {
    type: 'event';
    event: Event;
  };
}

// Advanced analytics types
export type EngagementMetrics = {
  likes: number;
  comments: number;
  shares: number;
  views: number;
  engagementRate: number;
  reach: number;
  impressions: number;
};

export type TrendingTopic = {
  id: number;
  topic: string;
  postCount: number;
  engagement: number;
  trend: 'up' | 'down' | 'stable';
  category: string;
};

export type UserInsight = {
  id: number;
  type: 'engagement' | 'reach' | 'growth' | 'activity';
  title: string;
  description: string;
  value: string;
  change: number;
  trend: 'positive' | 'negative' | 'neutral';
  icon: string;
};

export type ContentAnalytics = {
  postId: number;
  metrics: EngagementMetrics;
  audience: {
    demographics: { age: string; percentage: number }[];
    interests: string[];
    locations: string[];
  };
  performance: {
    bestTime: string;
    bestDay: string;
    reachRate: number;
    viralCoefficient: number;
  };
};

// --- Profile Page Specific Types ---

export interface SocialConnection {
  platform: string;
  username: string;
  verified: boolean;
  connectedAt: string;
  lastActive: string;
}

export interface Achievement {
  id: number;
  title: string;
  description: string;
  icon: string;
  earnedAt: string;
  category: string;
}

export interface MutualFriend {
  id: number;
  name: string;
  username: string;
  avatar: string;
  trustScore: number;
  mutualFriends: number;
  connectionStrength: number;
}

export interface SocialStat {
  posts: number;
  events: number;
  groups: number;
  followers: number;
  following: number;
  trustScore: number;
  verificationLevel: string;
  memberSince: string;
  lastActive: string;
}

export interface Interest {
  name: string;
  category: string;
  level: 'beginner' | 'intermediate' | 'expert';
  verified: boolean;
}

export interface Flavor {
  id: number;
  name: string;
  description: string;
  confidence: number;
  postCount: number;
  category: 'personality' | 'skill' | 'trait' | 'reputation';
  generatedAt: string;
  samplePosts: string[];
}

export interface CreateEventData {
  name: string;
  description: string;
  date: string;
  location: string;
  maxAttendees?: number;
  category?: string;
  tags?: string[];
  isPublic?: boolean;
}

export interface UpdateEventData extends Partial<CreateEventData> {
  // All fields are optional for updates
} 