import React, { useState } from 'react';

interface SmartDateTimePickerProps {
  date: string;
  time: string;
  onDateChange: (date: string) => void;
  onTimeChange: (time: string) => void;
  className?: string;
}

interface TimeSlot {
  time: string;
  label: string;
  popularity: 'high' | 'medium' | 'low';
  available: boolean;
}

const popularTimes: TimeSlot[] = [
  { time: '18:00', label: '6:00 PM', popularity: 'high', available: true },
  { time: '19:00', label: '7:00 PM', popularity: 'high', available: true },
  { time: '20:00', label: '8:00 PM', popularity: 'medium', available: true },
  { time: '21:00', label: '9:00 PM', popularity: 'medium', available: true },
  { time: '22:00', label: '10:00 PM', popularity: 'low', available: true },
  { time: '12:00', label: '12:00 PM', popularity: 'medium', available: true },
  { time: '13:00', label: '1:00 PM', popularity: 'medium', available: true },
  { time: '14:00', label: '2:00 PM', popularity: 'low', available: true },
  { time: '15:00', label: '3:00 PM', popularity: 'low', available: true },
  { time: '16:00', label: '4:00 PM', popularity: 'medium', available: true },
  { time: '17:00', label: '5:00 PM', popularity: 'high', available: true },
];

export default function SmartDateTimePicker({ 
  date, 
  time, 
  onDateChange, 
  onTimeChange, 
  className = "" 
}: SmartDateTimePickerProps) {
  const [showTimeSuggestions, setShowTimeSuggestions] = useState(false);
  const [selectedDate, setSelectedDate] = useState(date);

  // Get next 7 days for quick selection
  const getNextDays = () => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      days.push({
        date: date.toISOString().split('T')[0],
        label: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
      });
    }
    return days;
  };

  const handleDateChange = (newDate: string) => {
    setSelectedDate(newDate);
    onDateChange(newDate);
  };

  const handleTimeSelect = (selectedTime: string) => {
    onTimeChange(selectedTime);
    setShowTimeSuggestions(false);
  };

  const getPopularityColor = (popularity: string) => {
    switch (popularity) {
      case 'high': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPopularityLabel = (popularity: string) => {
    switch (popularity) {
      case 'high': return 'Popular';
      case 'medium': return 'Moderate';
      case 'low': return 'Quiet';
      default: return '';
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Quick Date Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Date *
        </label>
        <div className="grid grid-cols-4 gap-2 mb-3">
          {getNextDays().map((day) => (
            <button
              key={day.date}
              onClick={() => handleDateChange(day.date)}
              className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                selectedDate === day.date
                  ? 'border-purple-500 bg-purple-50 text-purple-700'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              {day.label}
            </button>
          ))}
        </div>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => handleDateChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        />
      </div>

      {/* Smart Time Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Time *
        </label>
        <div className="relative">
          <input
            type="time"
            value={time}
            onChange={(e) => onTimeChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
          <button
            type="button"
            onClick={() => setShowTimeSuggestions(!showTimeSuggestions)}
            className="absolute right-2 top-2 text-sm text-purple-600 hover:text-purple-700"
          >
            Popular times
          </button>
        </div>

        {/* Time Suggestions */}
        {showTimeSuggestions && (
          <div className="mt-2 p-3 bg-gray-50 rounded-lg">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Popular Times</h4>
            <div className="grid grid-cols-2 gap-2">
              {popularTimes.map((slot) => (
                <button
                  key={slot.time}
                  onClick={() => handleTimeSelect(slot.time)}
                  className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                    time === slot.time
                      ? 'border-purple-500 bg-purple-50 text-purple-700'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <div className="font-medium">{slot.label}</div>
                  <div className={`text-xs px-1 py-0.5 rounded-full inline-block ${getPopularityColor(slot.popularity)}`}>
                    {getPopularityLabel(slot.popularity)}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Smart Suggestions */}
      <div className="p-3 bg-blue-50 rounded-lg">
        <div className="flex items-start">
          <div className="text-blue-600 mr-2 mt-0.5">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="text-sm text-blue-800">
            <strong>Pro tip:</strong> Events at 7-8 PM typically have the highest attendance rates. 
            Weekend events see 40% more engagement than weekday events.
          </div>
        </div>
      </div>
    </div>
  );
} 