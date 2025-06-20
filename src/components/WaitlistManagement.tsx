import React, { useState } from 'react';

interface WaitlistManagementProps {
  eventId: string;
  maxCapacity: number;
  currentAttendees: number;
  onWaitlistUpdate: (waitlistData: any) => void;
  className?: string;
}

interface WaitlistEntry {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  joinedAt: string;
  priority: number;
  status: 'waiting' | 'promoted' | 'removed';
  notes?: string;
}

interface WaitlistSettings {
  enabled: boolean;
  maxWaitlistSize: number;
  autoPromote: boolean;
  notifyOnPromotion: boolean;
  allowWaitlistInvites: boolean;
  priorityRules: string[];
}

// Mock waitlist data
const mockWaitlistEntries: WaitlistEntry[] = [
  {
    id: '1',
    userId: 'user-1',
    userName: 'Sarah Johnson',
    userEmail: 'sarah@example.com',
    joinedAt: '2024-01-10T14:30:00Z',
    priority: 1,
    status: 'waiting',
    notes: 'VIP customer'
  },
  {
    id: '2',
    userId: 'user-2',
    userName: 'Mike Chen',
    userEmail: 'mike@example.com',
    joinedAt: '2024-01-10T15:45:00Z',
    priority: 2,
    status: 'waiting'
  },
  {
    id: '3',
    userId: 'user-3',
    userName: 'Emily Davis',
    userEmail: 'emily@example.com',
    joinedAt: '2024-01-10T16:20:00Z',
    priority: 3,
    status: 'waiting'
  }
];

export default function WaitlistManagement({ 
  eventId, 
  maxCapacity, 
  currentAttendees,
  onWaitlistUpdate,
  className = "" 
}: WaitlistManagementProps) {
  const [waitlistEntries, setWaitlistEntries] = useState<WaitlistEntry[]>(mockWaitlistEntries);
  const [showWaitlistModal, setShowWaitlistModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<WaitlistEntry | null>(null);
  const [waitlistSettings, setWaitlistSettings] = useState<WaitlistSettings>({
    enabled: true,
    maxWaitlistSize: 50,
    autoPromote: true,
    notifyOnPromotion: true,
    allowWaitlistInvites: false,
    priorityRules: ['VIP customers first', 'Early joiners first', 'Random selection']
  });

  const availableSpots = maxCapacity - currentAttendees;
  const waitlistCount = waitlistEntries.filter(entry => entry.status === 'waiting').length;

  const handlePromote = (entryId: string) => {
    setWaitlistEntries(prev => prev.map(entry => 
      entry.id === entryId 
        ? { ...entry, status: 'promoted' as const }
        : entry
    ));
    onWaitlistUpdate({ action: 'promote', entryId });
  };

  const handleRemove = (entryId: string) => {
    setWaitlistEntries(prev => prev.map(entry => 
      entry.id === entryId 
        ? { ...entry, status: 'removed' as const }
        : entry
    ));
    onWaitlistUpdate({ action: 'remove', entryId });
  };

  const handlePriorityChange = (entryId: string, newPriority: number) => {
    setWaitlistEntries(prev => prev.map(entry => 
      entry.id === entryId 
        ? { ...entry, priority: newPriority }
        : entry
    ));
  };

  const autoPromoteNext = () => {
    const nextInLine = waitlistEntries
      .filter(entry => entry.status === 'waiting')
      .sort((a, b) => a.priority - b.priority)[0];
    
    if (nextInLine && availableSpots > 0) {
      handlePromote(nextInLine.id);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'waiting': return 'text-yellow-600 bg-yellow-100';
      case 'promoted': return 'text-green-600 bg-green-100';
      case 'removed': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className={className}>
      {/* Waitlist Overview */}
      <div className="p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg border border-orange-200">
        <div className="flex justify-between items-center mb-3">
          <h4 className="font-medium text-gray-900">Waitlist Management</h4>
          <div className="flex space-x-2">
            <button
              onClick={() => setShowSettingsModal(true)}
              className="text-sm text-orange-600 hover:text-orange-700"
            >
              Settings
            </button>
            <button
              onClick={() => setShowWaitlistModal(true)}
              className="text-sm text-orange-600 hover:text-orange-700"
            >
              View All
            </button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-gray-900">{availableSpots}</div>
            <div className="text-xs text-gray-600">Available Spots</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-orange-600">{waitlistCount}</div>
            <div className="text-xs text-gray-600">On Waitlist</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-600">
              {waitlistEntries.filter(e => e.status === 'promoted').length}
            </div>
            <div className="text-xs text-gray-600">Promoted</div>
          </div>
        </div>

        {availableSpots > 0 && waitlistCount > 0 && (
          <button
            onClick={autoPromoteNext}
            className="w-full mt-3 px-3 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm"
          >
            Promote Next in Line
          </button>
        )}
      </div>

      {/* Quick Waitlist Preview */}
      <div className="mt-3">
        <h5 className="text-sm font-medium text-gray-700 mb-2">Next in Line</h5>
        <div className="space-y-2">
          {waitlistEntries
            .filter(entry => entry.status === 'waiting')
            .sort((a, b) => a.priority - b.priority)
            .slice(0, 3)
            .map((entry) => (
              <div key={entry.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <div>
                  <div className="text-sm font-medium text-gray-900">{entry.userName}</div>
                  <div className="text-xs text-gray-500">Priority: {entry.priority}</div>
                </div>
                <button
                  onClick={() => handlePromote(entry.id)}
                  className="text-xs bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700"
                >
                  Promote
                </button>
              </div>
            ))}
        </div>
      </div>

      {/* Waitlist Modal */}
      {showWaitlistModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Waitlist Management</h3>
                <button
                  onClick={() => setShowWaitlistModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Filters */}
              <div className="mb-4 flex space-x-2">
                <button className="px-3 py-1 text-sm bg-orange-600 text-white rounded">All</button>
                <button className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded">Waiting</button>
                <button className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded">Promoted</button>
                <button className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded">Removed</button>
              </div>

              {/* Waitlist Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-2">Name</th>
                      <th className="text-left py-2">Email</th>
                      <th className="text-left py-2">Joined</th>
                      <th className="text-left py-2">Priority</th>
                      <th className="text-left py-2">Status</th>
                      <th className="text-left py-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {waitlistEntries.map((entry) => (
                      <tr key={entry.id} className="border-b border-gray-100">
                        <td className="py-2">
                          <div className="font-medium text-gray-900">{entry.userName}</div>
                          {entry.notes && (
                            <div className="text-xs text-gray-500">{entry.notes}</div>
                          )}
                        </td>
                        <td className="py-2 text-gray-600">{entry.userEmail}</td>
                        <td className="py-2 text-gray-600">
                          {new Date(entry.joinedAt).toLocaleDateString()}
                        </td>
                        <td className="py-2">
                          <select
                            value={entry.priority}
                            onChange={(e) => handlePriorityChange(entry.id, parseInt(e.target.value))}
                            className="text-sm border border-gray-300 rounded px-1 py-0.5"
                          >
                            {[1, 2, 3, 4, 5].map(num => (
                              <option key={num} value={num}>{num}</option>
                            ))}
                          </select>
                        </td>
                        <td className="py-2">
                          <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(entry.status)}`}>
                            {entry.status}
                          </span>
                        </td>
                        <td className="py-2">
                          <div className="flex space-x-1">
                            {entry.status === 'waiting' && (
                              <>
                                <button
                                  onClick={() => handlePromote(entry.id)}
                                  className="text-xs bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700"
                                >
                                  Promote
                                </button>
                                <button
                                  onClick={() => handleRemove(entry.id)}
                                  className="text-xs bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700"
                                >
                                  Remove
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Bulk Actions */}
              <div className="mt-4 flex justify-between items-center">
                <div className="text-sm text-gray-600">
                  {waitlistCount} people waiting
                </div>
                <div className="flex space-x-2">
                  <button className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 text-sm">
                    Export List
                  </button>
                  <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm">
                    Send Notification
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Waitlist Settings</h3>
              <button
                onClick={() => setShowSettingsModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={waitlistSettings.enabled}
                  onChange={(e) => setWaitlistSettings(prev => ({
                    ...prev,
                    enabled: e.target.checked
                  }))}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">Enable waitlist</span>
              </label>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Waitlist Size
                </label>
                <input
                  type="number"
                  value={waitlistSettings.maxWaitlistSize}
                  onChange={(e) => setWaitlistSettings(prev => ({
                    ...prev,
                    maxWaitlistSize: parseInt(e.target.value) || 50
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={waitlistSettings.autoPromote}
                  onChange={(e) => setWaitlistSettings(prev => ({
                    ...prev,
                    autoPromote: e.target.checked
                  }))}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">Auto-promote when spots open</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={waitlistSettings.notifyOnPromotion}
                  onChange={(e) => setWaitlistSettings(prev => ({
                    ...prev,
                    notifyOnPromotion: e.target.checked
                  }))}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">Notify users when promoted</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={waitlistSettings.allowWaitlistInvites}
                  onChange={(e) => setWaitlistSettings(prev => ({
                    ...prev,
                    allowWaitlistInvites: e.target.checked
                  }))}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">Allow waitlist invites</span>
              </label>
            </div>

            <div className="mt-6 flex space-x-3">
              <button
                onClick={() => setShowSettingsModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowSettingsModal(false)}
                className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
              >
                Save Settings
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
      )}
    </div>
  );
} 