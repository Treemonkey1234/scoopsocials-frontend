import React, { createContext, useContext, useState, useEffect } from 'react';

// Types for demo content
interface DemoUser {
  id: string;
  name: string;
  username: string;
  profilePhoto: string;
  trustScore: number;
  isDemo: true;
}

interface DemoComment {
  id: string;
  content: string;
  author: DemoUser;
  createdAt: string;
  isDemo: true;
}

interface DemoPost {
  id: string;
  content: string;
  author: DemoUser;
  likes: number;
  comments: DemoComment[];
  createdAt: string;
  isDemo: true;
}

interface DemoEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  attendees: DemoUser[];
  organizer: DemoUser;
  isDemo: true;
}

interface DemoMessage {
  id: string;
  content: string;
  sender: DemoUser;
  receiver: DemoUser;
  createdAt: string;
  isDemo: true;
}

interface DemoContent {
  posts: DemoPost[];
  events: DemoEvent[];
  users: DemoUser[];
  messages: DemoMessage[];
}

interface DemoContextType {
  isDemoMode: boolean;
  toggleDemoMode: () => void;
  demoContent: DemoContent;
  interactWithDemoContent: (
    type: 'like' | 'comment' | 'attend',
    contentId: string,
    action: {
      increment?: boolean;
      comment?: DemoComment;
      join?: boolean;
      user?: DemoUser;
    }
  ) => void;
}

// Create demo users first since they're referenced by other content
const demoUsers: DemoUser[] = [
  {
    id: 'demo-user-1',
    name: 'Alex Johnson',
    username: '@alexj',
    profilePhoto: 'https://via.placeholder.com/150?text=AJ',
    trustScore: 87,
    isDemo: true
  },
  {
    id: 'demo-user-2',
    name: 'Sarah Wilson',
    username: '@sarahw',
    profilePhoto: 'https://via.placeholder.com/150?text=SW',
    trustScore: 92,
    isDemo: true
  },
  {
    id: 'demo-user-3',
    name: 'Mike Chen',
    username: '@mikec',
    profilePhoto: 'https://via.placeholder.com/150?text=MC',
    trustScore: 78,
    isDemo: true
  }
];

// Create the static demo content
const staticDemoContent: DemoContent = {
  users: demoUsers,
  posts: [
    {
      id: 'demo-post-1',
      content: 'Just hosted an amazing community event! Thanks to everyone who came out! 🎉',
      author: demoUsers[0],
      likes: 24,
      comments: [
        {
          id: 'demo-comment-1',
          content: 'It was fantastic! Looking forward to the next one!',
          author: demoUsers[1],
          createdAt: '2024-03-19T11:30:00Z',
          isDemo: true
        }
      ],
      createdAt: '2024-03-19T10:00:00Z',
      isDemo: true
    },
    {
      id: 'demo-post-2',
      content: 'Check out my latest photography project! 📸 #Photography #Art',
      author: demoUsers[1],
      likes: 42,
      comments: [],
      createdAt: '2024-03-18T15:20:00Z',
      isDemo: true
    }
  ],
  events: [
    {
      id: 'demo-event-1',
      title: 'Community Meetup',
      description: 'Join us for our monthly community gathering! Food, drinks, and great conversations.',
      date: '2024-04-15T18:00:00Z',
      location: 'Central Park, NYC',
      attendees: [demoUsers[0], demoUsers[2]],
      organizer: demoUsers[1],
      isDemo: true
    },
    {
      id: 'demo-event-2',
      title: 'Tech Workshop',
      description: 'Learn about the latest web development trends and best practices.',
      date: '2024-04-20T14:00:00Z',
      location: 'Virtual',
      attendees: [demoUsers[1]],
      organizer: demoUsers[0],
      isDemo: true
    }
  ],
  messages: [
    {
      id: 'demo-message-1',
      content: 'Hey! Are you coming to the community meetup next week?',
      sender: demoUsers[1],
      receiver: demoUsers[0],
      createdAt: '2024-03-19T09:30:00Z',
      isDemo: true
    },
    {
      id: 'demo-message-2',
      content: 'Yes, definitely! Looking forward to it!',
      sender: demoUsers[0],
      receiver: demoUsers[1],
      createdAt: '2024-03-19T09:35:00Z',
      isDemo: true
    }
  ]
};

const DemoContext = createContext<DemoContextType | null>(null);

export function useDemoMode() {
  const context = useContext(DemoContext);
  if (!context) {
    throw new Error('useDemoMode must be used within a DemoProvider');
  }
  return context;
}

export function DemoProvider({ children }: { children: React.ReactNode }) {
  const [isDemoMode, setIsDemoMode] = useState(() => {
    const saved = localStorage.getItem('isDemoMode');
    return saved ? JSON.parse(saved) : true;
  });
  const [demoContent, setDemoContent] = useState<DemoContent>(staticDemoContent);

  useEffect(() => {
    localStorage.setItem('isDemoMode', JSON.stringify(isDemoMode));
  }, [isDemoMode]);

  const toggleDemoMode = () => {
    setIsDemoMode((prev: boolean) => !prev);
  };

  const interactWithDemoContent: DemoContextType['interactWithDemoContent'] = (type, contentId, action) => {
    setDemoContent((prev: DemoContent) => {
      const newContent = { ...prev };
      
      switch (type) {
        case 'like':
          const post = newContent.posts.find(p => p.id === contentId);
          if (post && typeof action.increment === 'boolean') {
            post.likes += action.increment ? 1 : -1;
          }
          break;
        case 'comment':
          const targetPost = newContent.posts.find(p => p.id === contentId);
          if (targetPost && action.comment) {
            targetPost.comments.push(action.comment);
          }
          break;
        case 'attend':
          const event = newContent.events.find(e => e.id === contentId);
          const { user, join } = action;
          if (event && user && typeof join === 'boolean') {
            if (join) {
              event.attendees = [...event.attendees, user];
            } else {
              event.attendees = event.attendees.filter(a => a.id !== user.id);
            }
          }
          break;
      }
      
      return newContent;
    });
  };

  return (
    <DemoContext.Provider
      value={{
        isDemoMode,
        toggleDemoMode,
        demoContent,
        interactWithDemoContent
      }}
    >
      {children}
    </DemoContext.Provider>
  );
} 