import React, { useState } from 'react';

interface PrivateEventInvitesProps {
  eventId: string;
  eventTitle: string;
  eventDate: string;
  eventLocation: string;
  onInviteSent: (inviteData: any) => void;
  className?: string;
}

interface Invitee {
  id: string;
  name: string;
  email: string;
  status: 'pending' | 'accepted' | 'declined' | 'maybe';
  invitedAt: string;
  respondedAt?: string;
  message?: string;
  canInviteOthers: boolean;
}

interface InviteGroup {
  id: string;
  name: string;
  description: string;
  invitees: Invitee[];
}

// Mock invite data
const mockInviteGroups: InviteGroup[] = [
  {
    id: 'group-1',
    name: 'Close Friends',
    description: 'Your closest circle',
    invitees: [
      {
        id: 'inv-1',
        name: 'Alex Johnson',
        email: 'alex@example.com',
        status: 'pending',
        invitedAt: '2024-01-10T10:00:00Z',
        canInviteOthers: false
      },
      {
        id: 'inv-2',
        name: 'Sarah Wilson',
        email: 'sarah@example.com',
        status: 'accepted',
        invitedAt: '2024-01-10T10:00:00Z',
        respondedAt: '2024-01-10T14:30:00Z',
        canInviteOthers: false
      }
    ]
  },
  {
    id: 'group-2',
    name: 'Work Colleagues',
    description: 'Professional connections',
    invitees: [
      {
        id: 'inv-3',
        name: 'Mike Chen',
        email: 'mike@example.com',
        status: 'maybe',
        invitedAt: '2024-01-10T11:00:00Z',
        respondedAt: '2024-01-10T16:45:00Z',
        message: 'I\'ll try to make it!',
        canInviteOthers: false
      }
    ]
  }
];

export default function PrivateEventInvites({ 
  eventId, 
  eventTitle, 
  eventDate, 
  eventLocation,
  onInviteSent,
  className = "" 
}: PrivateEventInvitesProps) {
  const [inviteGroups, setInviteGroups] = useState<InviteGroup[]>(mockInviteGroups);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showManageModal, setShowManageModal] = useState(false);
  const [newInvitees, setNewInvitees] = useState<{ name: string; email: string }[]>([]);
  const [inviteMessage, setInviteMessage] = useState('');

  const totalInvited = inviteGroups.reduce((sum, group) => sum + group.invitees.length, 0);
  const acceptedCount = inviteGroups.reduce((sum, group) => 
    sum + group.invitees.filter(inv => inv.status === 'accepted').length, 0
  );
  const pendingCount = inviteGroups.reduce((sum, group) => 
    sum + group.invitees.filter(inv => inv.status === 'pending').length, 0
  );

  const handleAddInvitee = () => {
    setNewInvitees(prev => [...prev, { name: '', email: '' }]);
  };

  const handleInviteeChange = (index: number, field: 'name' | 'email', value: string) => {
    setNewInvitees(prev => prev.map((invitee, i) => 
      i === index ? { ...invitee, [field]: value } : invitee
    ));
  };

  const handleRemoveInvitee = (index: number) => {
    setNewInvitees(prev => prev.filter((_, i) => i !== index));
  };

  const handleSendInvites = () => {
    const validInvitees = newInvitees.filter(inv => inv.name && inv.email);
    
    if (validInvitees.length === 0) return;

    const newGroup: InviteGroup = {
      id: `group-${Date.now()}`,
      name: 'New Invites',
      description: `Invited on ${new Date().toLocaleDateString()}`,
      invitees: validInvitees.map((invitee, index) => ({
        id: `inv-${Date.now()}-${index}`,
        name: invitee.name,
        email: invitee.email,
        status: 'pending',
        invitedAt: new Date().toISOString(),
        canInviteOthers: false
      }))
    };

    setInviteGroups(prev => [...prev, newGroup]);
    setNewInvitees([]);
    setInviteMessage('');
    setShowInviteModal(false);
    
    onInviteSent({
      eventId,
      invitees: validInvitees,
      message: inviteMessage,
      timestamp: new Date().toISOString()
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted': return 'text-green-600 bg-green-100';
      case 'declined': return 'text-red-600 bg-red-100';
      case 'maybe': return 'text-yellow-600 bg-yellow-100';
      case 'pending': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'accepted': return '✅';
      case 'declined': return '❌';
      case 'maybe': return '🤔';
      case 'pending': return '⏳';
      default: return '⏳';
    }
  };

  return (
    <div className={className}>
      {/* Invitation Overview */}
      <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
        <div className="flex justify-between items-center mb-3">
          <h4 className="font-medium text-gray-900">Private Event Invites</h4>
          <div className="flex space-x-2">
            <button
              onClick={() => setShowManageModal(true)}
              className="text-sm text-purple-600 hover:text-purple-700"
            >
              Manage
            </button>
            <button
              onClick={() => setShowInviteModal(true)}
              className="text-sm text-purple-600 hover:text-purple-700"
            >
              Invite
            </button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-gray-900">{totalInvited}</div>
            <div className="text-xs text-gray-600">Total Invited</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-600">{acceptedCount}</div>
            <div className="text-xs text-gray-600">Accepted</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-yellow-600">{pendingCount}</div>
            <div className="text-xs text-gray-600">Pending</div>
          </div>
        </div>

        <div className="mt-3 p-2 bg-white rounded border">
          <div className="text-xs text-gray-600">
            🔒 Private event - Only invited guests can RSVP
          </div>
        </div>
      </div>

      {/* Quick Invite Preview */}
      <div className="mt-3">
        <h5 className="text-sm font-medium text-gray-700 mb-2">Recent Invites</h5>
        <div className="space-y-2">
          {inviteGroups.flatMap(group => group.invitees).slice(0, 3).map((invitee) => (
            <div key={invitee.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
              <div>
                <div className="text-sm font-medium text-gray-900">{invitee.name}</div>
                <div className="text-xs text-gray-500">{invitee.email}</div>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(invitee.status)}`}>
                  {getStatusIcon(invitee.status)} {invitee.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Send Invites Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Send Invites</h3>
                <button
                  onClick={() => setShowInviteModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Event Details */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900">{eventTitle}</h4>
                <p className="text-sm text-gray-600">{eventDate} • {eventLocation}</p>
              </div>

              {/* Add Invitees */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-sm font-medium text-gray-700">Invite People</h4>
                  <button
                    onClick={handleAddInvitee}
                    className="text-sm text-purple-600 hover:text-purple-700"
                  >
                    + Add Person
                  </button>
                </div>
                
                <div className="space-y-3">
                  {newInvitees.map((invitee, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <input
                        type="text"
                        placeholder="Name"
                        value={invitee.name}
                        onChange={(e) => handleInviteeChange(index, 'name', e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                      <input
                        type="email"
                        placeholder="Email"
                        value={invitee.email}
                        onChange={(e) => handleInviteeChange(index, 'email', e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                      <button
                        onClick={() => handleRemoveInvitee(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Personal Message */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Personal Message (Optional)
                </label>
                <textarea
                  value={inviteMessage}
                  onChange={(e) => setInviteMessage(e.target.value)}
                  placeholder="Add a personal message to your invitation..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {/* Privacy Notice */}
              <div className="mb-6 p-3 bg-purple-50 rounded-lg">
                <div className="flex items-start space-x-2">
                  <span className="text-purple-600">🔒</span>
                  <div className="text-sm text-purple-800">
                    <strong>Private Event Notice:</strong> Invited guests can RSVP but cannot invite others. 
                    Only you can send additional invitations.
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowInviteModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendInvites}
                  disabled={newInvitees.length === 0 || newInvitees.some(inv => !inv.name || !inv.email)}
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Send Invites
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Manage Invites Modal */}
      {showManageModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Manage Invites</h3>
                <button
                  onClick={() => setShowManageModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Invite Groups */}
              <div className="space-y-6">
                {inviteGroups.map((group) => (
                  <div key={group.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-3">
                      <div>
                        <h4 className="font-medium text-gray-900">{group.name}</h4>
                        <p className="text-sm text-gray-600">{group.description}</p>
                      </div>
                      <span className="text-sm text-gray-500">
                        {group.invitees.length} invitees
                      </span>
                    </div>

                    <div className="space-y-2">
                      {group.invitees.map((invitee) => (
                        <div key={invitee.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <div>
                            <div className="font-medium text-gray-900">{invitee.name}</div>
                            <div className="text-sm text-gray-600">{invitee.email}</div>
                            {invitee.message && (
                              <div className="text-xs text-gray-500 mt-1">
                                "{invitee.message}"
                              </div>
                            )}
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(invitee.status)}`}>
                              {getStatusIcon(invitee.status)} {invitee.status}
                            </span>
                            <span className="text-xs text-gray-500">
                              {new Date(invitee.invitedAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Summary */}
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <div className="grid grid-cols-4 gap-4 text-center">
                  <div>
                    <div className="text-lg font-bold text-gray-900">{totalInvited}</div>
                    <div className="text-xs text-gray-600">Total Invited</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-green-600">{acceptedCount}</div>
                    <div className="text-xs text-gray-600">Accepted</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-yellow-600">
                      {inviteGroups.reduce((sum, group) => 
                        sum + group.invitees.filter(inv => inv.status === 'maybe').length, 0
                      )}
                    </div>
                    <div className="text-xs text-gray-600">Maybe</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-red-600">
                      {inviteGroups.reduce((sum, group) => 
                        sum + group.invitees.filter(inv => inv.status === 'declined').length, 0
                      )}
                    </div>
                    <div className="text-xs text-gray-600">Declined</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 