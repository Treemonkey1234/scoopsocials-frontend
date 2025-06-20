import React from 'react';
import { Card, Button } from '../components-v2';

interface EventDetailsModalProps {
  event: any;
  isOpen: boolean;
  onClose: () => void;
  onJoin: (eventId: string) => void;
  onLeave: (eventId: string) => void;
  currentUserId?: string;
}

const EventDetailsModal: React.FC<EventDetailsModalProps> = ({
  event,
  isOpen,
  onClose,
  onJoin,
  onLeave,
  currentUserId
}) => {
  if (!isOpen || !event) return null;

  const isAttending = event.attendees?.includes(currentUserId);
  const isOrganizer = event.organizer?.id === currentUserId;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-primary">{event.name}</h2>
          <Button
            variant="text"
            size="small"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Event Info */}
          <div className="space-y-4">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg text-primary">{formatDate(event.date)}</h3>
                <p className="text-secondary">{formatTime(event.date)}</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg text-primary">Location</h3>
                <p className="text-secondary">{event.location}</p>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="font-semibold text-lg text-primary mb-2">About this event</h3>
            <p className="text-secondary leading-relaxed">{event.description}</p>
          </div>

          {/* Event Details */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-primary mb-1">Category</h4>
              <p className="text-secondary">{event.category || 'General'}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-primary mb-1">Attendees</h4>
              <p className="text-secondary">
                {event.attendees?.length || 0}
                {event.maxAttendees && ` / ${event.maxAttendees}`}
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-primary mb-1">Privacy</h4>
              <p className="text-secondary">{event.isPublic ? 'Public' : 'Private'}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-primary mb-1">Organizer</h4>
              <p className="text-secondary">{event.organizer?.name || 'Unknown'}</p>
            </div>
          </div>

          {/* Tags */}
          {event.tags && event.tags.length > 0 && (
            <div>
              <h3 className="font-semibold text-lg text-primary mb-2">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {event.tags.map((tag: string) => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Attendees List */}
          {event.attendees && event.attendees.length > 0 && (
            <div>
              <h3 className="font-semibold text-lg text-primary mb-3">Attendees ({event.attendees.length})</h3>
              <div className="space-y-2">
                {event.attendees.slice(0, 10).map((attendeeId: string, index: number) => (
                  <div key={attendeeId} className="flex items-center space-x-3 p-2 bg-gray-50 rounded-lg">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-sm font-medium">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-primary">User {attendeeId}</p>
                      <p className="text-sm text-secondary">@user{attendeeId}</p>
                    </div>
                  </div>
                ))}
                {event.attendees.length > 10 && (
                  <p className="text-sm text-secondary text-center">
                    +{event.attendees.length - 10} more attendees
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          
          {!isOrganizer && (
            <Button
              variant={isAttending ? "outline" : "primary"}
              onClick={() => {
                if (isAttending) {
                  onLeave(event.id);
                } else {
                  onJoin(event.id);
                }
              }}
            >
              {isAttending ? 'Leave Event' : 'Join Event'}
            </Button>
          )}
          
          {isOrganizer && (
            <Button variant="outline" className="text-red-600 border-red-600 hover:bg-red-50">
              Edit Event
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
};

export default EventDetailsModal; 