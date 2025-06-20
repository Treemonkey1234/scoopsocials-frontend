import React, { useState } from 'react';

interface CalendarIntegrationProps {
  eventTitle: string;
  eventDate: string;
  eventTime: string;
  eventLocation: string;
  eventDescription: string;
  className?: string;
}

interface CalendarProvider {
  name: string;
  icon: string;
  color: string;
  generateUrl: (params: any) => string;
}

const calendarProviders: CalendarProvider[] = [
  {
    name: 'Google Calendar',
    icon: '📅',
    color: 'bg-blue-500 hover:bg-blue-600',
    generateUrl: ({ title, date, time, location, description }) => {
      const startDate = new Date(`${date}T${time}`);
      const endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000); // 2 hours later
      
      const params = new URLSearchParams({
        action: 'TEMPLATE',
        text: title,
        dates: `${startDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z/${endDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
        details: description,
        location: location,
        ctz: Intl.DateTimeFormat().resolvedOptions().timeZone
      });
      
      return `https://calendar.google.com/calendar/render?${params.toString()}`;
    }
  },
  {
    name: 'Outlook',
    icon: '📧',
    color: 'bg-blue-600 hover:bg-blue-700',
    generateUrl: ({ title, date, time, location, description }) => {
      const startDate = new Date(`${date}T${time}`);
      const endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000);
      
      const params = new URLSearchParams({
        path: '/calendar/action/compose',
        rru: 'addevent',
        subject: title,
        startdt: startDate.toISOString(),
        enddt: endDate.toISOString(),
        body: `${description}\n\nLocation: ${location}`,
        location: location
      });
      
      return `https://outlook.live.com/calendar/0/${params.toString()}`;
    }
  },
  {
    name: 'Apple Calendar',
    icon: '🍎',
    color: 'bg-gray-800 hover:bg-gray-900',
    generateUrl: ({ title, date, time, location, description }) => {
      const startDate = new Date(`${date}T${time}`);
      const endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000);
      
      // Apple Calendar uses a special format
      const icsContent = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//ScoopSocials//Event//EN',
        'BEGIN:VEVENT',
        `DTSTART:${startDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
        `DTEND:${endDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
        `SUMMARY:${title}`,
        `DESCRIPTION:${description}`,
        `LOCATION:${location}`,
        'END:VEVENT',
        'END:VCALENDAR'
      ].join('\r\n');
      
      const blob = new Blob([icsContent], { type: 'text/calendar' });
      return URL.createObjectURL(blob);
    }
  }
];

export default function CalendarIntegration({ 
  eventTitle, 
  eventDate, 
  eventTime, 
  eventLocation, 
  eventDescription,
  className = "" 
}: CalendarIntegrationProps) {
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<CalendarProvider | null>(null);

  const handleCalendarAdd = (provider: CalendarProvider) => {
    const url = provider.generateUrl({
      title: eventTitle,
      date: eventDate,
      time: eventTime,
      location: eventLocation,
      description: eventDescription
    });

    if (provider.name === 'Apple Calendar') {
      // Download .ics file for Apple Calendar
      const link = document.createElement('a');
      link.href = url;
      link.download = `${eventTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.ics`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      // Open in new window for web calendars
      window.open(url, '_blank', 'width=600,height=600');
    }
    
    setShowCalendarModal(false);
  };

  return (
    <div className={className}>
      {/* Quick Add to Calendar Button */}
      <button
        onClick={() => setShowCalendarModal(true)}
        className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
      >
        <span>📅</span>
        <span>Add to Calendar</span>
      </button>

      {/* Calendar Modal */}
      {showCalendarModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Add to Calendar</h3>
              <button
                onClick={() => setShowCalendarModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Event Preview */}
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900">{eventTitle}</h4>
              <p className="text-sm text-gray-600">{eventDate} at {eventTime}</p>
              <p className="text-sm text-gray-600">{eventLocation}</p>
            </div>

            {/* Calendar Providers */}
            <div className="space-y-3">
              {calendarProviders.map((provider) => (
                <button
                  key={provider.name}
                  onClick={() => handleCalendarAdd(provider)}
                  className={`w-full p-4 rounded-lg text-white transition-colors flex items-center space-x-3 ${provider.color}`}
                >
                  <span className="text-xl">{provider.icon}</span>
                  <span className="font-medium">{provider.name}</span>
                </button>
              ))}
            </div>

            {/* Reminder Options */}
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <h4 className="text-sm font-medium text-gray-900 mb-2">Reminder Options</h4>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" defaultChecked />
                  <span className="text-sm text-gray-700">15 minutes before</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  <span className="text-sm text-gray-700">1 hour before</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  <span className="text-sm text-gray-700">1 day before</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 