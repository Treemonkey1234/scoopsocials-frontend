import axios, { AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';

// Use Railway URL for production, localhost for development
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://scoopsocials-backend-production.up.railway.app'
  : (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001');

console.log('🚀 [API] Connecting to backend at:', API_BASE_URL);

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests if available
api.interceptors.request.use((config: AxiosRequestConfig) => {
  const token = localStorage.getItem('auth_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor for debugging
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    // Don't log 404 errors as they're expected when endpoints don't exist
    if (error.response?.status !== 404) {
      console.error('API Error:', {
        url: error.config?.url,
        method: error.config?.method,
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
    }
    return Promise.reject(error);
  }
);

// Mock authentication service for testing when backend is not available
const mockAuthService = {
  sendVerification: async (phone: string) => {
    console.log(`[MOCK] Sending verification code to ${phone}`);
    const code = '123456';
    localStorage.setItem(`mock_verification_${phone}`, code);
    return { data: { message: 'Verification code sent successfully', expiresIn: 300 } };
  },
  
  verifyPhone: async (phone: string, code: string) => {
    const storedCode = localStorage.getItem(`mock_verification_${phone}`);
    if (code === storedCode) {
      localStorage.removeItem(`mock_verification_${phone}`);
      const mockUser = { id: 'mock-user-1', name: 'Test User', username: 'testuser', phone };
      const mockTokens = { accessToken: 'mock-access-token', refreshToken: 'mock-refresh-token' };
      return { data: { message: 'Phone verified successfully', user: mockUser, ...mockTokens } };
    }
    throw new Error('Invalid verification code');
  },
  
  verifySignup: async (phone: string, code: string) => {
    const storedCode = localStorage.getItem(`mock_verification_${phone}`);
    if (code === storedCode) {
      localStorage.removeItem(`mock_verification_${phone}`);
      localStorage.setItem(`mock_verified_${phone}`, 'true');
      return { data: { message: 'Phone verified successfully', phone, isNewUser: true, requiresSignup: true } };
    }
    throw new Error('Invalid verification code');
  },
  
  signup: async (userData: any) => {
    const verified = localStorage.getItem(`mock_verified_${userData.phone}`);
    if (!verified) {
      throw new Error('Phone number must be verified before signup');
    }
    localStorage.removeItem(`mock_verified_${userData.phone}`);
    const mockUser = { ...userData, id: 'mock-user-2', trustScore: 50 };
    const mockTokens = { accessToken: 'mock-access-token-2', refreshToken: 'mock-refresh-token-2' };
    return { data: { message: 'Account created successfully', user: mockUser, ...mockTokens } };
  },
  
  login: async (phone: string) => {
    return { data: { message: 'User found. Please verify your phone number to continue.', requiresPhoneVerification: true } };
  }
};

// Mock user service for development
const mockUserService = {
  getUser: async (id: string) => {
    console.log(`[MOCK] Fetching user with ID: ${id}`);
    
    // Create mock user data based on the ID
    const mockUsers: { [key: string]: any } = {
      'mock-user-1': {
        id: 'mock-user-1',
        name: 'Test User',
        username: 'testuser',
        phone: '+1234567890',
        email: 'test@example.com',
        bio: 'This is a test user for development',
        trustScore: 75,
        socials: {
          'Instagram': '@testuser',
          'Twitter/X': '@testuser'
        },
        interests: ['Technology', 'Sports'],
        memberSince: '2024-01-01',
        lastActive: 'Just now'
      },
      'mock-user-2': {
        id: 'mock-user-2',
        name: 'Alex Johnson',
        username: 'alexj',
        phone: '+1234567891',
        email: 'alex@example.com',
        bio: 'Welcome to ScoopSocials!',
        trustScore: 87,
        socials: {
          'Facebook': 'alex.johnson',
          'LinkedIn': 'alexjohnson'
        },
        interests: ['Business', 'Networking'],
        memberSince: '2024-01-15',
        lastActive: '2 hours ago'
      }
    };
    
    const user = mockUsers[id];
    if (!user) {
      throw new Error('User not found');
    }
    
    return { data: user };
  }
};

// Mock events service for development
const mockEventsService = {
  // Utility function to clear all mock data
  clearMockData: () => {
    localStorage.removeItem('mock_events');
    console.log('🧹 [MOCK] Cleared all mock events data');
  },
  
  // Utility function to get mock data info
  getMockDataInfo: () => {
    const storedEvents = localStorage.getItem('mock_events');
    const events = storedEvents ? JSON.parse(storedEvents) : [];
    console.log('📊 [MOCK] Current mock data info:', {
      totalEvents: events.length,
      eventIds: events.map((e: any) => e.id),
      lastUpdated: new Date().toISOString()
    });
    return { totalEvents: events.length, events };
  },

  getEvents: async () => {
    console.log('🎉 [MOCK] Fetching events - Backend unavailable, using mock data');
    
    // Try to get events from localStorage first
    const storedEvents = localStorage.getItem('mock_events');
    let mockEvents = [];
    
    if (storedEvents) {
      mockEvents = JSON.parse(storedEvents);
      console.log('📅 [MOCK] Loaded events from localStorage:', mockEvents.length, 'events');
    } else {
      // Initialize with default events if none exist
      mockEvents = [
        {
          id: 'evt-1',
          name: 'Tech Meetup 2024',
          description: 'Join us for an evening of networking and tech talks',
          date: '2024-02-15T18:00:00Z',
          location: 'Downtown Conference Center',
          organizer: {
            id: 'mock-user-1',
            name: 'Test User',
            username: 'testuser'
          },
          attendees: ['mock-user-1', 'mock-user-2'],
          maxAttendees: 50,
          category: 'Technology',
          tags: ['networking', 'tech', 'meetup'],
          isPublic: true,
          createdAt: '2024-01-20T10:00:00Z'
        },
        {
          id: 'evt-2',
          name: 'Weekend Hiking Trip',
          description: 'Explore beautiful trails with fellow outdoor enthusiasts',
          date: '2024-02-20T09:00:00Z',
          location: 'Central Park, NYC',
          organizer: {
            id: 'mock-user-2',
            name: 'Alex Johnson',
            username: 'alexj'
          },
          attendees: ['mock-user-2'],
          maxAttendees: 20,
          category: 'Outdoor',
          tags: ['hiking', 'outdoor', 'nature'],
          isPublic: true,
          createdAt: '2024-01-25T14:30:00Z'
        },
        {
          id: 'evt-3',
          name: 'Yoga in the Park',
          description: 'Morning yoga session in the park',
          date: '2024-02-22T09:00:00Z',
          location: 'Bryant Park, NYC',
          organizer: {
            id: 'mock-user-1',
            name: 'Sarah Wellness',
            username: 'sarah_wellness'
          },
          attendees: ['mock-user-1', 'mock-user-2'],
          maxAttendees: 30,
          category: 'Wellness',
          tags: ['yoga', 'wellness', 'outdoor'],
          isPublic: true,
          createdAt: '2024-01-26T10:00:00Z'
        },
        {
          id: 'evt-4',
          name: 'Private Dinner Party',
          description: 'Exclusive dinner party for close friends',
          date: '2024-02-18T19:00:00Z',
          location: 'Times Square, NYC',
          organizer: {
            id: 'mock-user-2',
            name: 'Alex Johnson',
            username: 'alexj'
          },
          attendees: ['mock-user-2'],
          maxAttendees: 10,
          category: 'Social',
          tags: ['dinner', 'private', 'exclusive'],
          isPublic: false,
          createdAt: '2024-01-27T15:00:00Z'
        }
      ];
      
      // Save initial events to localStorage
      localStorage.setItem('mock_events', JSON.stringify(mockEvents));
      console.log('📅 [MOCK] Initialized with default events and saved to localStorage');
    }
    
    console.log('📅 [MOCK] Returning events:', mockEvents.length, 'events');
    return { data: mockEvents };
  },
  
  createEvent: async (eventData: any) => {
    console.log('[MOCK] Creating event:', eventData);
    
    // Get existing events
    const storedEvents = localStorage.getItem('mock_events');
    const existingEvents = storedEvents ? JSON.parse(storedEvents) : [];
    
    const newEvent = {
      id: `evt-${Date.now()}`,
      ...eventData,
      organizer: {
        id: 'mock-user-1',
        name: 'Test User',
        username: 'testuser'
      },
      attendees: ['mock-user-1'],
      createdAt: new Date().toISOString()
    };
    
    // Add new event to the list
    const updatedEvents = [newEvent, ...existingEvents];
    
    // Save updated events to localStorage
    localStorage.setItem('mock_events', JSON.stringify(updatedEvents));
    
    console.log('[MOCK] Event created and saved to localStorage:', newEvent);
    return { data: newEvent };
  },
  
  updateEvent: async (id: string, eventData: any) => {
    console.log(`[MOCK] Updating event ${id}:`, eventData);
    
    // Get existing events
    const storedEvents = localStorage.getItem('mock_events');
    const existingEvents = storedEvents ? JSON.parse(storedEvents) : [];
    
    // Find and update the event
    const updatedEvents = existingEvents.map((event: any) => 
      event.id === id ? { ...event, ...eventData, updatedAt: new Date().toISOString() } : event
    );
    
    // Save updated events to localStorage
    localStorage.setItem('mock_events', JSON.stringify(updatedEvents));
    
    const updatedEvent = updatedEvents.find((event: any) => event.id === id);
    return { data: updatedEvent };
  },
  
  deleteEvent: async (id: string) => {
    console.log(`[MOCK] Deleting event ${id}`);
    
    // Get existing events
    const storedEvents = localStorage.getItem('mock_events');
    const existingEvents = storedEvents ? JSON.parse(storedEvents) : [];
    
    // Remove the event
    const updatedEvents = existingEvents.filter((event: any) => event.id !== id);
    
    // Save updated events to localStorage
    localStorage.setItem('mock_events', JSON.stringify(updatedEvents));
    
    return { data: { message: 'Event deleted successfully' } };
  },
  
  joinEvent: async (eventId: string, userId: string) => {
    console.log(`[MOCK] User ${userId} joining event ${eventId}`);
    
    // Get existing events
    const storedEvents = localStorage.getItem('mock_events');
    const existingEvents = storedEvents ? JSON.parse(storedEvents) : [];
    
    // Find and update the event
    const updatedEvents = existingEvents.map((event: any) => {
      if (event.id === eventId && !event.attendees.includes(userId)) {
        return { ...event, attendees: [...event.attendees, userId] };
      }
      return event;
    });
    
    // Save updated events to localStorage
    localStorage.setItem('mock_events', JSON.stringify(updatedEvents));
    
    return { data: { message: 'Successfully joined event' } };
  },
  
  leaveEvent: async (eventId: string, userId: string) => {
    console.log(`[MOCK] User ${userId} leaving event ${eventId}`);
    
    // Get existing events
    const storedEvents = localStorage.getItem('mock_events');
    const existingEvents = storedEvents ? JSON.parse(storedEvents) : [];
    
    // Find and update the event
    const updatedEvents = existingEvents.map((event: any) => {
      if (event.id === eventId) {
        return { ...event, attendees: event.attendees.filter((id: string) => id !== userId) };
      }
      return event;
    });
    
    // Save updated events to localStorage
    localStorage.setItem('mock_events', JSON.stringify(updatedEvents));
    
    return { data: { message: 'Successfully left event' } };
  }
};

/**
 * Authentication API functions with fallback to mock service
 */
export const authAPI = {
  // Send verification code to phone
  sendVerification: async (phone: string) => {
    try {
      return await api.post('/api/auth/send-verification', { phone });
    } catch (error) {
      console.log('Backend unavailable, using mock service');
      return await mockAuthService.sendVerification(phone);
    }
  },
  
  // Verify phone for sign-in
  verifyPhone: async (phone: string, code: string) => {
    try {
      return await api.post('/api/auth/verify-phone', { phone, code });
    } catch (error) {
      console.log('Backend unavailable, using mock service');
      return await mockAuthService.verifyPhone(phone, code);
    }
  },
  
  // Verify phone for sign-up
  verifySignup: async (phone: string, code: string) => {
    try {
      return await api.post('/api/auth/verify-signup', { phone, code });
    } catch (error) {
      console.log('Backend unavailable, using mock service');
      return await mockAuthService.verifySignup(phone, code);
    }
  },
  
  // Create new account
  signup: async (userData: {
    phone: string;
    name: string;
    username: string;
    email?: string;
    accountType?: 'FREE' | 'PROFESSIONAL' | 'VENUE';
    bio?: string;
    location?: {
      city: string;
      state: string;
      country: string;
    };
    occupation?: string;
    interests?: string[];
  }) => {
    try {
      return await api.post('/api/auth/signup', userData);
    } catch (error) {
      console.log('Backend unavailable, using mock service');
      return await mockAuthService.signup(userData);
    }
  },
  
  // Login (initiates phone verification)
  login: async (phone: string) => {
    try {
      return await api.post('/api/auth/login', { phone });
    } catch (error) {
      console.log('Backend unavailable, using mock service');
      return await mockAuthService.login(phone);
    }
  },
  
  // Refresh access token
  refreshToken: (refreshToken: string) => 
    api.post('/api/auth/refresh', { refreshToken }),
  
  // Logout
  logout: () => api.post('/api/auth/logout'),
  
  // Logout from all devices
  logoutAll: () => api.post('/api/auth/logout-all'),
};

/**
 * Fetches the main feed of posts.
 */
export const getFeed = () => api.get('/api/posts');

/**
 * Creates a new post.
 * @param postData The data for the new post.
 */
export const createPost = (postData: { content: string; taggedUsers: any[] }) => api.post('/api/posts', postData);

/**
 * Events API functions with fallback to mock service
 * 
 * 🔧 BACKEND SETUP INSTRUCTIONS:
 * To connect to the real backend instead of mock services:
 * 
 * 1. Set up PostgreSQL database and Redis
 * 2. Create .env file in backend/ with required variables:
 *    - DATABASE_URL=postgresql://user:pass@localhost:5432/scoopsocials
 *    - REDIS_URL=redis://localhost:6379
 *    - JWT_SECRET=your-secret-key
 *    - JWT_REFRESH_SECRET=your-refresh-secret
 * 3. Run database migrations: npm run db:migrate
 * 4. Start backend: npm run dev (in backend/ directory)
 * 5. Backend will be available at http://localhost:3001
 * 
 * 📝 CURRENT STATUS: Using mock services (data persists in localStorage)
 */
export const eventsAPI = {
  // Get all events
  getEvents: async () => {
    try {
      console.log('🔗 [API] Attempting to connect to real backend...');
      const response = await api.get('/api/events');
      console.log('✅ [API] Successfully connected to real backend!');
      return response;
    } catch (error) {
      console.log('⚠️ [API] Backend unavailable, using mock service');
      console.log('💡 [API] To use real backend, follow setup instructions above');
      return await mockEventsService.getEvents();
    }
  },
  
  // Get a specific event
  getEvent: async (id: string) => {
    try {
      return await api.get(`/api/events/${id}`);
    } catch (error) {
      console.log('Backend unavailable, using mock service');
      const events = await mockEventsService.getEvents();
      const event = events.data.find((e: any) => e.id === id);
      if (!event) throw new Error('Event not found');
      return { data: event };
    }
  },
  
  // Create a new event
  createEvent: async (eventData: {
    name: string;
    description: string;
    date: string;
    location: string;
    maxAttendees?: number;
    category?: string;
    tags?: string[];
    isPublic?: boolean;
  }) => {
    try {
      return await api.post('/api/events', eventData);
    } catch (error) {
      console.log('Backend unavailable, using mock service');
      return await mockEventsService.createEvent(eventData);
    }
  },
  
  // Update an event
  updateEvent: async (id: string, eventData: any) => {
    try {
      return await api.put(`/api/events/${id}`, eventData);
    } catch (error) {
      console.log('Backend unavailable, using mock service');
      return await mockEventsService.updateEvent(id, eventData);
    }
  },
  
  // Delete an event
  deleteEvent: async (id: string) => {
    try {
      return await api.delete(`/api/events/${id}`);
    } catch (error) {
      console.log('Backend unavailable, using mock service');
      return await mockEventsService.deleteEvent(id);
    }
  },
  
  // Join an event
  joinEvent: async (eventId: string, userId: string) => {
    try {
      return await api.post(`/api/events/${eventId}/join`, { userId });
    } catch (error) {
      console.log('Backend unavailable, using mock service');
      return await mockEventsService.joinEvent(eventId, userId);
    }
  },
  
  // Leave an event
  leaveEvent: async (eventId: string, userId: string) => {
    try {
      return await api.post(`/api/events/${eventId}/leave`, { userId });
    } catch (error) {
      console.log('Backend unavailable, using mock service');
      return await mockEventsService.leaveEvent(eventId, userId);
    }
  },
  
  // Utility functions for debugging mock data
  clearMockData: () => mockEventsService.clearMockData(),
  getMockDataInfo: () => mockEventsService.getMockDataInfo()
};

// Add other API functions as needed
export const getUser = async (id: string) => {
  try {
    return await api.get(`/api/users/${id}`);
  } catch (error) {
    console.log('Backend unavailable, using mock service');
    return await mockUserService.getUser(id);
  }
};

export default api; 