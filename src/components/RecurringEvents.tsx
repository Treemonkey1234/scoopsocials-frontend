import React, { useState } from 'react';

interface RecurringEventsProps {
  onRecurringSetup: (recurringData: any) => void;
  className?: string;
}

interface RecurringPattern {
  type: 'daily' | 'weekly' | 'monthly' | 'custom';
  interval: number;
  daysOfWeek?: number[];
  dayOfMonth?: number;
  endDate?: string;
  occurrences?: number;
}

interface RecurringSettings {
  pattern: RecurringPattern;
  exceptions: string[];
  autoPublish: boolean;
  sendReminders: boolean;
  copyAttendees: boolean;
}

export default function RecurringEvents({ onRecurringSetup, className = "" }: RecurringEventsProps) {
  const [showRecurringModal, setShowRecurringModal] = useState(false);
  const [recurringSettings, setRecurringSettings] = useState<RecurringSettings>({
    pattern: {
      type: 'weekly',
      interval: 1,
      daysOfWeek: [1], // Monday
      endDate: '',
      occurrences: 10
    },
    exceptions: [],
    autoPublish: true,
    sendReminders: true,
    copyAttendees: false
  });

  const daysOfWeek = [
    { value: 0, label: 'Sunday', short: 'Sun' },
    { value: 1, label: 'Monday', short: 'Mon' },
    { value: 2, label: 'Tuesday', short: 'Tue' },
    { value: 3, label: 'Wednesday', short: 'Wed' },
    { value: 4, label: 'Thursday', short: 'Thu' },
    { value: 5, label: 'Friday', short: 'Fri' },
    { value: 6, label: 'Saturday', short: 'Sat' }
  ];

  const handleDayToggle = (dayValue: number) => {
    const currentDays = recurringSettings.pattern.daysOfWeek || [];
    const newDays = currentDays.includes(dayValue)
      ? currentDays.filter(d => d !== dayValue)
      : [...currentDays, dayValue];
    
    setRecurringSettings(prev => ({
      ...prev,
      pattern: { ...prev.pattern, daysOfWeek: newDays }
    }));
  };

  const handleSave = () => {
    onRecurringSetup(recurringSettings);
    setShowRecurringModal(false);
  };

  const getPreviewDates = () => {
    const dates = [];
    const startDate = new Date();
    let currentDate = new Date(startDate);
    let count = 0;
    
    while (count < 5 && currentDate <= new Date(recurringSettings.pattern.endDate || '2024-12-31')) {
      if (recurringSettings.pattern.type === 'weekly' && recurringSettings.pattern.daysOfWeek) {
        if (recurringSettings.pattern.daysOfWeek.includes(currentDate.getDay())) {
          dates.push(new Date(currentDate));
          count++;
        }
      } else {
        dates.push(new Date(currentDate));
        count++;
      }
      
      // Move to next interval
      switch (recurringSettings.pattern.type) {
        case 'daily':
          currentDate.setDate(currentDate.getDate() + recurringSettings.pattern.interval);
          break;
        case 'weekly':
          currentDate.setDate(currentDate.getDate() + 1);
          break;
        case 'monthly':
          currentDate.setMonth(currentDate.getMonth() + recurringSettings.pattern.interval);
          break;
      }
    }
    
    return dates;
  };

  return (
    <div className={className}>
      {/* Recurring Events Button */}
      <button
        onClick={() => setShowRecurringModal(true)}
        className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center space-x-2"
      >
        <span>🔄</span>
        <span>Setup Recurring Events</span>
      </button>

      {/* Recurring Modal */}
      {showRecurringModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Recurring Events Setup</h3>
                <button
                  onClick={() => setShowRecurringModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Recurrence Pattern */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Recurrence Pattern</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Repeat Every
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        min="1"
                        value={recurringSettings.pattern.interval}
                        onChange={(e) => setRecurringSettings(prev => ({
                          ...prev,
                          pattern: { ...prev.pattern, interval: parseInt(e.target.value) || 1 }
                        }))}
                        className="w-16 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                      <select
                        value={recurringSettings.pattern.type}
                        onChange={(e) => setRecurringSettings(prev => ({
                          ...prev,
                          pattern: { ...prev.pattern, type: e.target.value as any }
                        }))}
                        className="flex-1 px-3 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                      >
                        <option value="daily">Day(s)</option>
                        <option value="weekly">Week(s)</option>
                        <option value="monthly">Month(s)</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      End Date
                    </label>
                    <input
                      type="date"
                      value={recurringSettings.pattern.endDate}
                      onChange={(e) => setRecurringSettings(prev => ({
                        ...prev,
                        pattern: { ...prev.pattern, endDate: e.target.value }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>
              </div>

              {/* Days of Week (for weekly) */}
              {recurringSettings.pattern.type === 'weekly' && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Days of Week
                  </label>
                  <div className="grid grid-cols-7 gap-2">
                    {daysOfWeek.map((day) => (
                      <button
                        key={day.value}
                        onClick={() => handleDayToggle(day.value)}
                        className={`p-2 text-xs rounded-lg border transition-colors ${
                          recurringSettings.pattern.daysOfWeek?.includes(day.value)
                            ? 'bg-purple-500 text-white border-purple-500'
                            : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        {day.short}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Preview */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Preview (Next 5 Events)</h4>
                <div className="p-3 bg-gray-50 rounded-lg">
                  {getPreviewDates().map((date, index) => (
                    <div key={index} className="text-sm text-gray-700">
                      {date.toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </div>
                  ))}
                </div>
              </div>

              {/* Advanced Settings */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Advanced Settings</h4>
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={recurringSettings.autoPublish}
                      onChange={(e) => setRecurringSettings(prev => ({
                        ...prev,
                        autoPublish: e.target.checked
                      }))}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">Auto-publish events</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={recurringSettings.sendReminders}
                      onChange={(e) => setRecurringSettings(prev => ({
                        ...prev,
                        sendReminders: e.target.checked
                      }))}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">Send automatic reminders</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={recurringSettings.copyAttendees}
                      onChange={(e) => setRecurringSettings(prev => ({
                        ...prev,
                        copyAttendees: e.target.checked
                      }))}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">Copy attendees from first event</span>
                  </label>
                </div>
              </div>

              {/* Exceptions */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Exceptions (Skip Dates)</h4>
                <div className="space-y-2">
                  {recurringSettings.exceptions.map((exception, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <input
                        type="date"
                        value={exception}
                        onChange={(e) => {
                          const newExceptions = [...recurringSettings.exceptions];
                          newExceptions[index] = e.target.value;
                          setRecurringSettings(prev => ({ ...prev, exceptions: newExceptions }));
                        }}
                        className="px-3 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                      <button
                        onClick={() => {
                          const newExceptions = recurringSettings.exceptions.filter((_, i) => i !== index);
                          setRecurringSettings(prev => ({ ...prev, exceptions: newExceptions }));
                        }}
                        className="text-red-500 hover:text-red-700"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => setRecurringSettings(prev => ({
                      ...prev,
                      exceptions: [...prev.exceptions, '']
                    }))}
                    className="text-sm text-purple-600 hover:text-purple-700"
                  >
                    + Add Exception Date
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowRecurringModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Save Recurring Setup
                </button>
              </div>

              {/* Venue Tier Notice */}
              <div className="mt-4 p-3 bg-purple-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <span className="text-purple-600">👑</span>
                  <span className="text-sm text-purple-800">
                    This feature is available for Venue Tier accounts only
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 