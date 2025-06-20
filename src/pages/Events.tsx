import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, Button } from '../components-v2';
import MapComponent, { MapComponentRef } from '../components/MapComponent';
import PlusButton from '../components/PlusButton';
import CreateEventModal from '../components/CreateEventModal';
import { useDemoMode } from '../context/DemoContext';
import { eventsAPI } from '../services/api';
import { Event, CreateEventData } from '../types';
import { useUser } from '../context/UserContext';

// Types
type RSVPStatus = 'going' | 'not_going' | 'maybe' | 'pending';

type Guest = {
  id: number;
  name: string;
  username: string;
  avatar: string;
  rsvpStatus: RSVPStatus;
  rsvpDate?: string;
  plusOne?: boolean;
  dietaryRestrictions?: string;
  message?: string;
  trustScore?: number;
  mutualFriends?: number;
};

// Constants
const tabOptions = ["Upcoming", "Past", "Discover"];
const eventCategories = ["All", "Social", "Party", "Food", "Sports", "Business", "Wellness", "Music", "Outdoor", "Tech"];
const filterPanels = ["Recommended", "Trending", "All Events"];

// Helper functions for date filtering
const isUpcoming = (event: Event) => {
  const eventDate = new Date(event.date);
  const now = new Date();
  return eventDate >= now;
};

const isPast = (event: Event) => {
  const eventDate = new Date(event.date);
  const now = new Date();
  return eventDate < now;
};

// Convert location string to coordinates (mock geocoding)
const getEventCoordinates = (location: string): { lat: number; lng: number } => {
  console.log('getEventCoordinates called with location:', location);
  
  // Mock geocoding - in real app, you'd use a geocoding service
  const locationMap: { [key: string]: { lat: number; lng: number } } = {
    'Downtown Conference Center': { lat: 40.7589, lng: -73.9851 }, // NYC
    'Mountain View Trailhead': { lat: 40.7128, lng: -74.0060 }, // NYC area
    'Central Park, NYC': { lat: 40.7829, lng: -73.9654 },
    'Bryant Park, NYC': { lat: 40.7536, lng: -73.9832 },
    'Times Square, NYC': { lat: 40.7580, lng: -73.9855 },
    'Brooklyn Bridge': { lat: 40.7061, lng: -73.9969 },
    'Empire State Building': { lat: 40.7484, lng: -73.9857 },
    'Statue of Liberty': { lat: 40.6892, lng: -74.0445 },
    'Metropolitan Museum': { lat: 40.7794, lng: -73.9632 },
    'High Line Park': { lat: 40.7480, lng: -74.0048 }
  };
  
  // Try to find exact match first
  if (locationMap[location]) {
    console.log('getEventCoordinates: Found exact match for', location);
    return locationMap[location];
  }
  
  // Try partial matches
  for (const [key, coords] of Object.entries(locationMap)) {
    if (location.toLowerCase().includes(key.toLowerCase()) || 
        key.toLowerCase().includes(location.toLowerCase())) {
      console.log('getEventCoordinates: Found partial match for', location, '->', key);
      return coords;
    }
  }
  
  // Default to NYC with some random offset
  console.log('getEventCoordinates: No match found for', location, '- using NYC fallback');
  return {
    lat: 40.7128 + (Math.random() - 0.5) * 0.1,
    lng: -74.0060 + (Math.random() - 0.5) * 0.1
  };
};

// Convert API Event to UI Event format
const convertToUIEvent = (apiEvent: any): any => {
  console.log('Converting API event to UI event:', apiEvent.name);
  console.log('API event coordinates:', apiEvent.coordinates);
  
  const result = {
    id: apiEvent.id,
    name: apiEvent.name,
    date: new Date(apiEvent.date).toISOString().split('T')[0],
    time: new Date(apiEvent.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    location: apiEvent.location,
    coordinates: apiEvent.coordinates || getEventCoordinates(apiEvent.location),
    category: apiEvent.category || 'Social',
    trending: false,
    rsvped: false,
    rsvpStatus: 'pending' as RSVPStatus,
    guests: (apiEvent.attendees || []).map((attendeeId: string, index: number) => ({
      id: index + 1,
      name: `User ${attendeeId}`,
      username: `@user${attendeeId}`,
      avatar: "/avatars/default.jpg",
      rsvpStatus: 'going' as RSVPStatus,
      trustScore: 75
    })),
    maxGuests: apiEvent.maxAttendees || 50,
    isPrivate: !apiEvent.isPublic,
    organizer: {
      id: apiEvent.organizer?.id || 'unknown',
      name: apiEvent.organizer?.name || 'Unknown Organizer',
      username: apiEvent.organizer?.username || '@unknown',
      avatar: "/avatars/default.jpg",
      trustScore: 85
    },
    description: apiEvent.description,
    price: 0,
    ageRestriction: 'All ages',
    matchScore: Math.floor(Math.random() * 30) + 70, // Random match score between 70-100
    tags: apiEvent.tags || ['community', 'social']
  };
  
  console.log('Final UI event coordinates:', result.coordinates);
  return result;
};

// Convert demo event to UI format
const convertDemoEvent = (demoEvent: any): any => {
  console.log('Converting demo event to UI event:', demoEvent.title);
  console.log('Demo event coordinates:', demoEvent.coordinates);
  
  const result = {
    id: demoEvent.id,
    name: demoEvent.title,
    date: new Date(demoEvent.date).toISOString().split('T')[0],
    time: new Date(demoEvent.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    location: demoEvent.location,
    coordinates: demoEvent.coordinates || getEventCoordinates(demoEvent.location),
    category: 'Social', // Default category for demo events
    trending: false,
    rsvped: false,
    rsvpStatus: 'pending' as RSVPStatus,
    guests: demoEvent.attendees.map((attendee: any) => ({
      id: parseInt(attendee.id.split('-')[2]),
      name: attendee.name,
      username: attendee.username,
      avatar: attendee.profilePhoto,
      rsvpStatus: 'going' as RSVPStatus,
      trustScore: attendee.trustScore
    })),
    maxGuests: 50,
    isPrivate: false,
    organizer: {
      id: demoEvent.organizer.id,
      name: demoEvent.organizer.name,
      username: demoEvent.organizer.username,
      avatar: demoEvent.organizer.profilePhoto,
      trustScore: demoEvent.organizer.trustScore
    },
    description: demoEvent.description,
    price: 0,
    ageRestriction: 'All ages',
    matchScore: Math.floor(Math.random() * 30) + 70, // Random match score between 70-100
    tags: ['community', 'social']
  };
  
  console.log('Final demo UI event coordinates:', result.coordinates);
  return result;
};

export default function Events() {
  const { isDemoMode, demoContent } = useDemoMode();
  const { currentUser } = useUser();
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("Upcoming");
  const [selectedEventId, setSelectedEventId] = useState<string | number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [activePanelIndex, setActivePanelIndex] = useState<number | null>(null);
  const [selectedPinId, setSelectedPinId] = useState<string | null>(null);
  const selectedEventRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapComponentRef>(null);
  
  // Modal states
  const [showCreateEventModal, setShowCreateEventModal] = useState(false);
  
  // Data states
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Scroll to selected event when it changes
  useEffect(() => {
    if (selectedEventId && selectedEventRef.current) {
      selectedEventRef.current.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center' 
      });
    }
  }, [selectedEventId]);

  // Fetch events on component mount
  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await eventsAPI.getEvents();
      setEvents(response.data || []);
    } catch (err: any) {
      console.error('Error fetching events:', err);
      // Don't show error if it's a 404 (backend not available) - mock service will handle it
      if (err?.response?.status !== 404) {
        setError('Failed to load events');
      }
    } finally {
      setLoading(false);
    }
  };

  // Check for navigation state to auto-open modal
  useEffect(() => {
    if (location.state?.openCreateEvent) {
      setShowCreateEventModal(true);
      // Clear the state to prevent reopening on refresh
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // Convert events to UI format using useMemo to prevent infinite re-renders
  const allEvents = React.useMemo(() => {
    return isDemoMode 
      ? demoContent.events.map(convertDemoEvent)
      : events.map(convertToUIEvent);
  }, [isDemoMode, demoContent.events, events]);
    
  const [filteredEvents, setFilteredEvents] = useState<any[]>([]);

  // Update filtered events when allEvents changes
  useEffect(() => {
    setFilteredEvents(allEvents);
  }, [allEvents]);

  // Create recommended and trending events using useMemo
  const recommendedEvents = React.useMemo(() => {
    return allEvents
      .filter(event => event.matchScore && event.matchScore > 80)
      .sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
  }, [allEvents]);

  const trendingEvents = React.useMemo(() => {
    return allEvents
      .filter(event => event.trending || (event.guests.length > 10));
  }, [allEvents]);

  const handlePlusAction = (action: 'post' | 'event' | 'friend') => {
    switch (action) {
      case 'post':
        navigate('/home', { state: { openCreatePost: true } });
        break;
      case 'event':
        setShowCreateEventModal(true);
        break;
      case 'friend':
        navigate('/friends', { state: { openAddFriend: true } });
        break;
    }
  };

  const handleCreateEvent = async (eventData: any) => {
    try {
      console.log('Creating event with data:', eventData);
      console.log('Coordinates from address autocomplete:', eventData.coordinates);
      
      const createEventData: CreateEventData = {
        name: eventData.name,
        description: eventData.description,
        date: new Date(`${eventData.date}T${eventData.time}`).toISOString(),
        location: eventData.location,
        maxAttendees: eventData.maxGuests,
        category: eventData.category,
        tags: eventData.tags,
        isPublic: !eventData.isPrivate
      };

      const response = await eventsAPI.createEvent(createEventData);
      const newEvent = response.data;
      
      // Prioritize coordinates from address autocomplete
      let finalCoordinates;
      if (eventData.coordinates && eventData.coordinates.lat && eventData.coordinates.lng) {
        console.log('Using coordinates from address autocomplete:', eventData.coordinates);
        finalCoordinates = eventData.coordinates;
      } else {
        console.log('No coordinates from address autocomplete, using fallback for:', eventData.location);
        finalCoordinates = getEventCoordinates(eventData.location);
      }
      
      const eventWithCoordinates = {
        ...newEvent,
        coordinates: finalCoordinates
      };
      
      console.log('Final event with coordinates:', eventWithCoordinates);
      
      // Add the new event to the list
      setEvents(prev => [eventWithCoordinates, ...prev]);
      console.log('Event created:', eventWithCoordinates);
      
      // Close modal
      setShowCreateEventModal(false);
    } catch (err) {
      console.error('Error creating event:', err);
      // You could show an error message to the user here
    }
  };

  const handleJoinEvent = async (eventId: string) => {
    if (!currentUser?.id) return;
    
    try {
      await eventsAPI.joinEvent(eventId, currentUser.id);
      // Refresh events to update attendee count
      await fetchEvents();
    } catch (err) {
      console.error('Error joining event:', err);
    }
  };

  const handleLeaveEvent = async (eventId: string) => {
    if (!currentUser?.id) return;
    
    try {
      await eventsAPI.leaveEvent(eventId, currentUser.id);
      // Refresh events to update attendee count
      await fetchEvents();
    } catch (err) {
      console.error('Error leaving event:', err);
    }
  };

  const togglePanel = (index: number) => {
    setActivePanelIndex(activePanelIndex === index ? null : index);
  };

  const renderEventCard = (event: any) => {
    return (
      <Card key={event.id} className="p-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02] relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-sm">
            <h4 className="font-bold text-primary text-body1">{event.name}</h4>
            <span className={`px-sm py-xs rounded-full text-xs font-medium ${
              isUpcoming(event) ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
            }`}>
              {isUpcoming(event) ? 'Upcoming' : 'Past'}
            </span>
          </div>
          <p className="text-secondary text-body2 mb-sm">{event.description}</p>
          <div className="flex items-center space-x-md text-sm text-secondary mb-sm">
            <span className="flex items-center">
              <svg className="w-4 h-4 mr-xs text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {event.date} at {event.time}
            </span>
            <span className="flex items-center">
              <svg className="w-4 h-4 mr-xs text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {event.location}
              </span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-sm">
              <span className="text-sm text-secondary">{event.guests.length} attending</span>
              <span className="text-sm text-secondary">•</span>
              <span className="text-sm text-secondary">{event.category}</span>
            </div>
            <Button variant="outline" size="small" onClick={() => setSelectedEventId(event.id)}>
              View Event
            </Button>
          </div>
      </div>
      </Card>
    );
  };

  const renderSlidingPanel = (index: number) => {
    const panelContent = () => {
      switch(index) {
        case 0: return recommendedEvents;
        case 1: return trendingEvents;
        case 2: return filteredEvents;
        default: return [];
      }
    };

    return (
      <div 
        className={`fixed left-0 top-[7rem] bg-white shadow-xl transition-all duration-300 transform ${
          activePanelIndex !== null ? 'translate-x-0' : '-translate-x-[calc(100%-3rem)]'
        }`}
        style={{ 
          width: '380px', 
          zIndex: 20,
          height: 'calc(100vh - 7rem - 5rem)' // Account for header, tabs, and footer
        }}
      >
        {/* Tabs Column */}
        <div className="absolute right-0 transform translate-x-full">
          {filterPanels.map((panel, idx) => (
            <div 
              key={panel}
              className={`cursor-pointer bg-white rounded-r-lg shadow-lg transition-all duration-200 hover:shadow-xl mb-2
                ${idx === activePanelIndex ? 'border-l-4 border-primary' : 'border-l-4 border-transparent hover:border-gray-300'}`}
              onClick={() => togglePanel(idx)}
              style={{ padding: '0.75rem 0.5rem' }}
            >
              <div 
                className={`text-sm font-semibold py-3 px-1 transition-colors duration-200 ${
                  idx === activePanelIndex ? 'text-primary' : 'text-gray-700'
                }`} 
                style={{ 
                  writingMode: 'vertical-rl', 
                  textOrientation: 'mixed',
                  minHeight: '80px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {panel}
              </div>
            </div>
          ))}
        </div>

        {/* Panel Content */}
        <div className="h-full overflow-y-auto">
          {/* Panel Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 shadow-sm z-10">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-primary">
                  {activePanelIndex !== null ? filterPanels[activePanelIndex] : ''}
                </h2>
                <p className="text-sm text-secondary mt-1">
                  {activePanelIndex === 0 && `${recommendedEvents.length} personalized events`}
                  {activePanelIndex === 1 && `${trendingEvents.length} trending events`}
                  {activePanelIndex === 2 && `${filteredEvents.length} total events`}
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  💡 Click any event to center the map on its location
                </p>
              </div>
              <button 
                onClick={() => setActivePanelIndex(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors duration-200 p-2 rounded-full hover:bg-gray-100"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Search and Filter Section */}
            <div className="mt-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search events..."
                  className="w-full px-4 py-2 pr-10 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
                <div className="absolute right-3 top-2.5 text-gray-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
              <div className="flex gap-2 mt-2 overflow-x-auto pb-2 scrollbar-hide">
                {eventCategories.map((category) => (
                  <button
                    key={category}
                    className={`px-3 py-1 text-sm rounded-full whitespace-nowrap transition-colors
                      ${selectedCategory === category 
                        ? 'bg-primary text-white font-medium' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    onClick={() => setSelectedCategory(category)}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Panel Body */}
          <div className="p-6">
            <div className="space-y-4">
              {activePanelIndex !== null && panelContent().map((event: any) => (
                <div key={event.id} className="relative">
                  {/* Event Card */}
                  <div className={`bg-white rounded-lg p-4 border transition-all cursor-pointer hover:shadow-md ${
                    selectedEventId === event.id ? 'border-primary shadow-lg' : ''
                  } ${selectedPinId === event.id ? 'ring-4 ring-blue-500 ring-opacity-80 shadow-xl bg-blue-50' : ''}`}
                  onClick={() => {
                    // Toggle event selection
                    setSelectedEventId(selectedEventId === event.id ? null : event.id);
                    setSelectedPinId(selectedEventId === event.id ? null : event.id);
                    
                    // Center map on event location
                    if (event.coordinates && mapRef.current) {
                      console.log('Centering map on event:', event.name);
                      console.log('Event coordinates:', event.coordinates);
                      console.log('Event location:', event.location);
                      
                      // Ensure we're using the correct coordinates
                      const lat = event.coordinates.lat;
                      const lng = event.coordinates.lng;
                      
                      console.log('Using coordinates - Lat:', lat, 'Lng:', lng);
                      
                      // Center the map with a higher zoom level to make it more obvious
                      mapRef.current.centerOnCoordinates(lat, lng, 12);
                    } else {
                      console.warn('No coordinates found for event:', event.name);
                    }
                  }}
                  >
                    {/* Connection indicator for map pin */}
                    {selectedPinId === event.id && (
                      <div className="absolute -top-3 -left-3 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center shadow-xl border-2 border-white">
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                        </svg>
                      </div>
                    )}
                    
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="font-medium text-primary">{event.name}</div>
                        <div className="text-sm text-secondary mt-1">{event.date} • {event.time}</div>
                        <div className="text-sm text-gray-400">{event.location}</div>
                        {event.matchScore && (
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs bg-primary text-white px-2 py-0.5 rounded-full">
                              {event.matchScore}% match
                            </span>
                            <span className="text-xs text-gray-500">{event.category}</span>
                          </div>
                        )}
                        {event.tags && event.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {event.tags.map((tag: string) => (
                              <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="flex gap-2 ml-3">
                        <button 
                          className="p-1.5 rounded-full bg-white shadow-md hover:shadow-lg transition-shadow border border-gray-100 text-gray-400 hover:text-primary"
                          onClick={(e) => {
                            e.stopPropagation();
                            // Handle save action
                          }}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                          </svg>
                        </button>
                        {selectedEventId !== event.id && (
                          <button 
                            className="px-3 py-1 rounded-full bg-primary text-white text-sm font-medium hover:bg-blue-600 transition-colors shadow-md hover:shadow-lg"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleJoinEvent(event.id);
                            }}
                          >
                            RSVP
                          </button>
                        )}
                      </div>
                    </div>
                    
                    {/* Expand/Collapse Indicator */}
                    <div className="flex justify-center mt-2">
                      <div className={`w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center transition-transform duration-200 ${
                        selectedEventId === event.id ? 'rotate-180' : ''
                      }`}>
                        <svg className="w-3 h-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  
                  {/* Expanded Event Details */}
                  {selectedEventId === event.id && (
                    <div 
                      className="bg-blue-50 border border-blue-200 rounded-lg mt-2 p-4 animate-in slide-in-from-top-2 duration-200"
                      ref={selectedEventRef}
                    >
                      <div className="space-y-3">
                        {/* Description */}
                        <div>
                          <h4 className="font-medium text-gray-800 mb-1">About this event</h4>
                          <p className="text-sm text-gray-600 leading-relaxed">{event.description}</p>
                        </div>
                        
                        {/* Event Stats */}
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500">Attendees:</span>
                            <span className="ml-1 font-medium text-gray-800">
                              {event.guests.length}{event.maxGuests ? ` / ${event.maxGuests}` : ''}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-500">Privacy:</span>
                            <span className={`ml-1 font-medium ${event.isPrivate ? 'text-red-600' : 'text-green-600'}`}>
                              {event.isPrivate ? 'Private' : 'Public'}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-500">Category:</span>
                            <span className="ml-1 font-medium text-gray-800">{event.category}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Organizer:</span>
                            <span className="ml-1 font-medium text-gray-800">{event.organizer.name}</span>
                          </div>
                        </div>
                        
                        {/* Attendees List */}
                        {event.guests.length > 0 && (
                          <div>
                            <h4 className="font-medium text-gray-800 mb-2">Attendees</h4>
                            <div className="space-y-1">
                              {event.guests.slice(0, 5).map((guest: any) => (
                                <div key={guest.id} className="flex items-center space-x-2 text-sm">
                                  <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white text-xs font-medium">
                                    {guest.name.charAt(0)}
                                  </div>
                                  <span className="text-gray-700">{guest.name}</span>
                                  <span className="text-gray-500">@{guest.username}</span>
                                </div>
                              ))}
                              {event.guests.length > 5 && (
                                <p className="text-xs text-gray-500 mt-1">
                                  +{event.guests.length - 5} more attendees
                                </p>
                              )}
                            </div>
                          </div>
                        )}
                        
                        {/* Action Buttons */}
                        <div className="flex gap-2 pt-2 border-t border-blue-200">
                          <button 
                            className="flex-1 px-4 py-2 rounded-lg bg-primary text-white font-medium hover:bg-blue-600 transition-colors"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleJoinEvent(event.id);
                            }}
                          >
                            Join Event
                          </button>
                          <button 
                            className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 font-medium hover:bg-gray-300 transition-colors"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedEventId(null);
                              setSelectedPinId(null);
                            }}
                          >
                            Close
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            {/* Empty state */}
            {(activePanelIndex === null || panelContent().length === 0) && (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="text-gray-500">No events found</p>
                <p className="text-sm text-gray-400 mt-1">Try adjusting your filters</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Handle event card click to center map on event location
  const handleEventCardClick = (event: any) => {
    if (event.coordinates && mapRef.current) {
      console.log('Centering map on event:', event.name, 'at coordinates:', event.coordinates);
      mapRef.current.centerOnCoordinates(event.coordinates.lat, event.coordinates.lng, 14);
      
      // Also set the selected event for visual feedback
      setSelectedEventId(event.id);
      setSelectedPinId(event.id.toString());
    }
  };

  // Debug functions for mock data
  const handleClearMockData = () => {
    eventsAPI.clearMockData();
    // Refresh the page to reload with default events
    window.location.reload();
  };

  const handleShowMockDataInfo = () => {
    const info = eventsAPI.getMockDataInfo();
    console.log('Mock data info:', info);
    alert(`Mock Events: ${info.totalEvents}\nEvent IDs: ${info.events.map((e: any) => e.id).join(', ')}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      {/* Enhanced Header with Solid Blue */}
      <div className="bg-primary text-white p-lg shadow-lg">
        <div className="flex items-center justify-between mb-md">
          <h1 className="text-5xl font-extrabold">Events</h1>
          <div className="flex items-center space-x-4">
            {/* Debug panel - only show in development */}
            {process.env.NODE_ENV === 'development' && (
              <div className="flex items-center space-x-2 bg-blue-800 px-3 py-1 rounded-lg">
                <button
                  onClick={handleShowMockDataInfo}
                  className="text-xs bg-blue-600 hover:bg-blue-700 px-2 py-1 rounded transition-colors"
                >
                  📊 Mock Info
                </button>
                <button
                  onClick={handleClearMockData}
                  className="text-xs bg-red-600 hover:bg-red-700 px-2 py-1 rounded transition-colors"
                >
                  🧹 Clear Mock
                </button>
              </div>
            )}
            <PlusButton onAction={handlePlusAction} />
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex space-x-6 overflow-x-auto items-center">
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
      </div>

      {/* Content Area */}
      <div className="p-lg">
        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-secondary">Loading events...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="text-center py-12">
            <div className="text-red-500 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <p className="text-red-600 font-medium mb-2">Failed to load events</p>
            <p className="text-secondary mb-4">{error}</p>
            <Button onClick={fetchEvents} variant="outline">
              Try Again
            </Button>
          </div>
        )}

        {/* Content when not loading and no error */}
        {!loading && !error && (
          <>
            {activeTab === "Discover" && (
              <div className="h-[calc(100vh-12rem-5rem)] relative">
                {/* Sliding Panels */}
                {filterPanels.map((_, index) => renderSlidingPanel(index))}

                {/* Map Legend - Bottom Right */}
                <div className="absolute bottom-4 right-4 z-30 bg-white rounded-lg shadow-lg p-3">
                  <h3 className="font-semibold text-sm text-gray-800 mb-2">Event Types</h3>
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                      <span className="text-xs text-gray-600">Public Events</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      <span className="text-xs text-gray-600">Private Events</span>
                    </div>
                  </div>
                </div>

                {/* Full-screen Map */}
                <div className="absolute inset-0">
                  <MapComponent
                    ref={mapRef}
                    initialCenter={[-74.006, 40.7128]} // New York City
                    initialZoom={12}
                    markers={allEvents.map(event => ({
                      id: event.id,
                      lat: event.coordinates.lat,
                      lng: event.coordinates.lng,
                      title: event.name,
                      description: `${event.date} at ${event.time} • ${event.location}`,
                      category: event.category,
                      color: event.isPrivate ? '#ef4444' : '#0891b2', // Red for private, blue for public
                      isSelected: selectedPinId === event.id
                    }))}
                    onMarkerClick={(markerId) => {
                      // Find the event and show it in the sidebar
                      const event = allEvents.find(e => e.id === markerId);
                      if (event) {
                        setSelectedEventId(markerId);
                        setSelectedPinId(markerId);
                        // Open the "All Events" panel and scroll to the event
                        setActivePanelIndex(2); // "All Events" panel
                      }
                    }}
                  />
                </div>
              </div>
            )}

            {(activeTab === "Upcoming" || activeTab === "Past") && (
              <div className="space-y-md">
                {filteredEvents.filter(e => activeTab === "Upcoming" ? isUpcoming(e) : isPast(e)).map(renderEventCard)}
                
                {/* Empty state for filtered events */}
                {filteredEvents.filter(e => activeTab === "Upcoming" ? isUpcoming(e) : isPast(e)).length === 0 && (
                  <div className="text-center py-12">
                    <div className="text-gray-400 mb-4">
                      <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <p className="text-gray-500">No {activeTab.toLowerCase()} events</p>
                    <p className="text-sm text-gray-400 mt-1">
                      {activeTab === "Upcoming" 
                        ? "Check back later for new events" 
                        : "No past events to display"
                      }
                    </p>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {showCreateEventModal && (
      <CreateEventModal
        isOpen={showCreateEventModal}
        onClose={() => setShowCreateEventModal(false)}
        onSubmit={handleCreateEvent}
      />
      )}
    </div>
  );
} 