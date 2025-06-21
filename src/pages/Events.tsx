import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, Button } from '../components-v2';
import MapComponent, { MapComponentRef } from '../components/MapComponent';
import PlusButton from '../components/PlusButton';
import CreateEventModal from '../components/CreateEventModal';
import { eventsAPI } from '../services/api';
import { Event, CreateEventData } from '../types';
import { useUser } from '../context/UserContext';

// Types
type RSVPStatus = 'going' | 'not_going' | 'maybe' | 'pending';

// Constants - RESTORED the Discover tab!
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

// Convert location string to coordinates (for map functionality)
const getEventCoordinates = (location: string): { lat: number; lng: number } => {
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
    return locationMap[location];
  }
  
  // Try partial matches
  for (const [key, coords] of Object.entries(locationMap)) {
    if (location.toLowerCase().includes(key.toLowerCase()) || 
        key.toLowerCase().includes(location.toLowerCase())) {
      return coords;
    }
  }
  
  // Default to NYC with some random offset
  return {
    lat: 40.7128 + (Math.random() - 0.5) * 0.1,
    lng: -74.0060 + (Math.random() - 0.5) * 0.1
  };
};

// Convert API Event to UI Event format
const convertToUIEvent = (apiEvent: any): any => {
  return {
    id: apiEvent.id,
    name: apiEvent.name,
    date: new Date(apiEvent.date).toISOString().split('T')[0],
    time: new Date(apiEvent.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    location: apiEvent.location || 'Location TBD',
    coordinates: apiEvent.coordinates || getEventCoordinates(apiEvent.location || 'NYC'),
    category: apiEvent.category || 'Social',
    description: apiEvent.description || 'No description available',
    guests: apiEvent.attendees || [],
    organizer: apiEvent.organizer || { name: 'Unknown Organizer' },
    maxGuests: apiEvent.maxAttendees || 50,
    isPrivate: !apiEvent.isPublic,
    trending: false,
    matchScore: Math.floor(Math.random() * 30) + 70, // Random match score for demo
    tags: apiEvent.tags || ['community', 'social']
  };
};

export default function Events() {
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
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // Convert backend events to UI format
  const allEvents = React.useMemo(() => {
    return events.map(convertToUIEvent);
  }, [events]);

  // Filter events based on active tab
  const filteredEvents = React.useMemo(() => {
    return allEvents.filter(event => 
      activeTab === "Upcoming" ? isUpcoming(event) : isPast(event)
    );
  }, [allEvents, activeTab]);

  // Create recommended and trending events for Discover tab
  const recommendedEvents = React.useMemo(() => {
    return allEvents
      .filter(event => event.matchScore && event.matchScore > 80)
      .sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
  }, [allEvents]);

  const trendingEvents = React.useMemo(() => {
    return allEvents
      .filter(event => event.trending || (event.guests.length > 5));
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
      setEvents(prev => [response.data, ...prev]);
      setShowCreateEventModal(false);
    } catch (err) {
      console.error('Error creating event:', err);
    }
  };

  const handleJoinEvent = async (eventId: string) => {
    if (!currentUser?.id) return;
    
    try {
      await eventsAPI.joinEvent(eventId, currentUser.id);
      await fetchEvents();
    } catch (err) {
      console.error('Error joining event:', err);
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
              <span className="text-sm text-secondary">{event.guests?.length || 0} attending</span>
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

  // RESTORED: Sliding panel functionality for Discover tab
  const renderSlidingPanel = (index: number) => {
    const panelContent = () => {
      switch(index) {
        case 0: return recommendedEvents;
        case 1: return trendingEvents;
        case 2: return allEvents;
        default: return [];
      }
    };

    const panelTitle = () => {
      switch(index) {
        case 0: return 'Recommended';
        case 1: return 'Trending';
        case 2: return 'All Events';
        default: return '';
      }
    };

    const isActive = activePanelIndex === index;
    const events = panelContent();

    return (
      <div 
        key={index}
        className={`absolute left-4 bg-white rounded-lg shadow-lg transition-all duration-300 ease-in-out z-20 ${
          isActive ? 'w-80' : 'w-12'
        }`}
        style={{ 
          top: `${4 + index * 3.5}rem`,
          maxHeight: isActive ? 'calc(100vh - 16rem)' : '3rem'
        }}
      >
        {/* Panel Header */}
        <div 
          className={`flex items-center justify-between p-3 cursor-pointer ${
            isActive ? 'border-b border-gray-200' : ''
          }`}
          onClick={() => togglePanel(index)}
        >
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${
              index === 0 ? 'bg-green-500' : 
              index === 1 ? 'bg-orange-500' : 
              'bg-blue-500'
            }`}></div>
            {isActive && (
              <span className="font-medium text-gray-800">{panelTitle()}</span>
            )}
          </div>
          {isActive && (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">
                {activePanelIndex === 0 && `${recommendedEvents.length} for you`}
                {activePanelIndex === 1 && `${trendingEvents.length} trending`}
                {activePanelIndex === 2 && `${allEvents.length} total events`}
              </span>
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
          )}
        </div>

        {/* Panel Content */}
        {isActive && (
          <div className="overflow-y-auto" style={{ maxHeight: 'calc(100vh - 20rem)' }}>
            <div className="p-3 space-y-3">
              {events.map((event: any) => (
                <div 
                  key={event.id} 
                  className={`p-3 rounded-lg border cursor-pointer transition-all duration-200 hover:shadow-md ${
                    selectedEventId === event.id 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => {
                    setSelectedEventId(event.id);
                    setSelectedPinId(event.id.toString());
                    // Center map on event
                    if (event.coordinates && mapRef.current) {
                      mapRef.current.centerOnCoordinates(event.coordinates.lat, event.coordinates.lng, 14);
                    }
                  }}
                  ref={selectedEventId === event.id ? selectedEventRef : null}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-sm text-gray-800 leading-tight">{event.name}</h4>
                    {event.matchScore && (
                      <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded-full ml-2 whitespace-nowrap">
                        {event.matchScore}% match
                      </span>
                    )}
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex items-center text-xs text-gray-600">
                      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {event.date} at {event.time}
                    </div>
                    
                    <div className="flex items-center text-xs text-gray-600">
                      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span className="truncate">{event.location}</span>
                    </div>
                    
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-gray-500">
                        {event.guests?.length || 0} attending
                      </span>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        event.category === 'Social' ? 'bg-blue-100 text-blue-700' :
                        event.category === 'Business' ? 'bg-purple-100 text-purple-700' :
                        event.category === 'Sports' ? 'bg-green-100 text-green-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {event.category}
                      </span>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex gap-2 mt-3">
                    <button 
                      className="flex-1 px-3 py-1 rounded-lg bg-primary text-white text-xs font-medium hover:bg-blue-600 transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleJoinEvent(event.id);
                      }}
                    >
                      Join Event
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--color-background)' }}>
      {/* Header */}
      <div className="bg-primary text-white p-lg shadow-lg sticky top-0 z-30">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <h1 className="text-h1 font-bold text-white">Events</h1>
          <PlusButton onAction={handlePlusAction} />
        </div>
      </div>

      {/* Tab Navigation - RESTORED all 3 tabs! */}
      <div className="bg-white border-b border-gray-200 sticky top-[4.5rem] z-20">
        <div className="max-w-2xl mx-auto">
          <div className="flex">
            {tabOptions.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-md px-lg text-center font-medium transition-all duration-200 ${
                  activeTab === tab
                    ? 'text-primary border-b-2 border-primary bg-blue-50'
                    : 'text-secondary hover:text-primary hover:bg-gray-50'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content - Flex grow to fill space between header and footer */}
      <div className="flex-1 flex flex-col">
        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12 flex-1">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-secondary">Loading events...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="text-center py-12 flex-1 flex items-center justify-center">
            <div>
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
          </div>
        )}

        {/* Content when not loading and no error */}
        {!loading && !error && (
          <>
            {/* RESTORED: Discover Tab with Map and Sliding Panels */}
            {activeTab === "Discover" && (
              <div className="flex-1 relative">
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

                {/* Full-screen Map - Now properly fills the space */}
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

            {/* Upcoming and Past tabs - List view with proper scrolling */}
            {(activeTab === "Upcoming" || activeTab === "Past") && (
              <div className="flex-1 overflow-y-auto">
                <div className="max-w-2xl mx-auto p-lg">
                  <div className="space-y-md">
                    {filteredEvents.map(renderEventCard)}
                    
                    {/* Empty state for filtered events */}
                    {filteredEvents.length === 0 && (
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
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Create Event Modal */}
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