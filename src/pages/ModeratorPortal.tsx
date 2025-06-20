import React, { useState, useEffect } from 'react';
import { useDemoMode } from '../context/DemoContext';

interface Flag {
  id: string;
  category: 'INAPPROPRIATE' | 'SPAM' | 'FAKE_ACCOUNT' | 'HARASSMENT' | 'OTHER';
  evidence: string;
  status: 'PENDING' | 'RESOLVED' | 'REJECTED';
  createdAt: string;
  flagger: {
    id: string;
    name: string;
    trustScore: number;
  };
  flaggedUser: {
    id: string;
    name: string;
    trustScore: number;
  };
  flaggedContent: {
    type: 'POST' | 'EVENT' | 'SOCIAL_ACCOUNT';
    id: string;
    title?: string;
    content?: string;
    platform?: string;
    username?: string;
  };
  moderatorAction?: {
    action: 'ACCEPT' | 'REJECT' | 'PENALIZE';
    reason: string;
    penalizedUserId?: string;
    createdAt: string;
  };
}

const ModeratorPortal: React.FC = () => {
  const { isDemoMode } = useDemoMode();
  const [flags, setFlags] = useState<Flag[]>([]);
  const [selectedFlag, setSelectedFlag] = useState<Flag | null>(null);
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'RESOLVED' | 'REJECTED'>('ALL');
  const [action, setAction] = useState<'ACCEPT' | 'REJECT' | 'PENALIZE'>('ACCEPT');
  const [actionReason, setActionReason] = useState('');
  const [penalizedUserId, setPenalizedUserId] = useState('');

  // Demo data
  useEffect(() => {
    if (isDemoMode) {
      setFlags([
        {
          id: '1',
          category: 'INAPPROPRIATE',
          evidence: 'This post contains inappropriate content that violates community guidelines. The user is sharing content that is not suitable for our platform.',
          status: 'PENDING',
          createdAt: '2024-01-15T10:30:00Z',
          flagger: {
            id: 'flagger1',
            name: 'Sarah Johnson',
            trustScore: 85
          },
          flaggedUser: {
            id: 'flagged1',
            name: 'Mike Chen',
            trustScore: 72
          },
          flaggedContent: {
            type: 'POST',
            id: 'post1',
            title: 'My weekend update',
            content: 'Had an amazing time at the beach yesterday! Perfect weather and great company.'
          }
        },
        {
          id: '2',
          category: 'FAKE_ACCOUNT',
          evidence: 'This Instagram account does not belong to the user. The username and profile picture are clearly fabricated.',
          status: 'PENDING',
          createdAt: '2024-01-14T15:45:00Z',
          flagger: {
            id: 'flagger2',
            name: 'Alex Rodriguez',
            trustScore: 92
          },
          flaggedUser: {
            id: 'flagged2',
            name: 'Emma Wilson',
            trustScore: 45
          },
          flaggedContent: {
            type: 'SOCIAL_ACCOUNT',
            id: 'social1',
            platform: 'Instagram',
            username: '@fake_celebrity_account'
          }
        },
        {
          id: '3',
          category: 'SPAM',
          evidence: 'This event is clearly spam - promoting a product rather than a legitimate social gathering.',
          status: 'RESOLVED',
          createdAt: '2024-01-13T09:20:00Z',
          flagger: {
            id: 'flagger3',
            name: 'David Kim',
            trustScore: 78
          },
          flaggedUser: {
            id: 'flagged3',
            name: 'Lisa Thompson',
            trustScore: 38
          },
          flaggedContent: {
            type: 'EVENT',
            id: 'event1',
            title: 'Free Product Giveaway - Join Now!',
            content: 'Get your free sample of our amazing product! Limited time offer!'
          },
          moderatorAction: {
            action: 'ACCEPT',
            reason: 'Event violates spam policy',
            createdAt: '2024-01-13T14:30:00Z'
          }
        }
      ]);
    }
  }, [isDemoMode]);

  const filteredFlags = flags.filter(flag => {
    if (filter === 'ALL') return true;
    return flag.status === filter;
  });

  const handleResolveFlag = (flagId: string) => {
    if (!actionReason.trim()) {
      alert('Please provide a reason for your action.');
      return;
    }

    const updatedFlags = flags.map(flag => {
      if (flag.id === flagId) {
        return {
          ...flag,
          status: 'RESOLVED' as const,
          moderatorAction: {
            action,
            reason: actionReason,
            penalizedUserId: action === 'PENALIZE' ? penalizedUserId : undefined,
            createdAt: new Date().toISOString()
          }
        };
      }
      return flag;
    });

    setFlags(updatedFlags);
    setSelectedFlag(null);
    setActionReason('');
    setPenalizedUserId('');
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'INAPPROPRIATE': return 'bg-red-100 text-red-800';
      case 'SPAM': return 'bg-yellow-100 text-yellow-800';
      case 'FAKE_ACCOUNT': return 'bg-purple-100 text-purple-800';
      case 'HARASSMENT': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-blue-100 text-blue-800';
      case 'RESOLVED': return 'bg-green-100 text-green-800';
      case 'REJECTED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Moderator Portal</h1>
          <p className="mt-2 text-gray-600">
            Review and manage flagged content from the community
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-2xl font-bold text-blue-600">
              {flags.filter(f => f.status === 'PENDING').length}
            </div>
            <div className="text-sm text-gray-600">Pending Review</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-2xl font-bold text-green-600">
              {flags.filter(f => f.status === 'RESOLVED').length}
            </div>
            <div className="text-sm text-gray-600">Resolved</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-2xl font-bold text-red-600">
              {flags.filter(f => f.status === 'REJECTED').length}
            </div>
            <div className="text-sm text-gray-600">Rejected</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-2xl font-bold text-gray-600">
              {flags.length}
            </div>
            <div className="text-sm text-gray-600">Total Flags</div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <div className="flex flex-wrap gap-2">
            {(['ALL', 'PENDING', 'RESOLVED', 'REJECTED'] as const).map((filterOption) => (
              <button
                key={filterOption}
                onClick={() => setFilter(filterOption)}
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  filter === filterOption
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {filterOption.charAt(0) + filterOption.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Flags List */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Flagged Content</h2>
          </div>
          
          {filteredFlags.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No flags found for the selected filter.
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredFlags.map((flag) => (
                <div key={flag.id} className="p-6 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(flag.category)}`}>
                          {flag.category.replace('_', ' ')}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(flag.status)}`}>
                          {flag.status}
                        </span>
                        <span className="text-sm text-gray-500">
                          {new Date(flag.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      <div className="mb-3">
                        <div className="text-sm text-gray-600 mb-1">
                          <strong>Flagged by:</strong> {flag.flagger.name} (Trust: {flag.flagger.trustScore})
                        </div>
                        <div className="text-sm text-gray-600 mb-1">
                          <strong>Flagged user:</strong> {flag.flaggedUser.name} (Trust: {flag.flaggedUser.trustScore})
                        </div>
                        <div className="text-sm text-gray-600">
                          <strong>Content type:</strong> {flag.flaggedContent.type.replace('_', ' ')}
                        </div>
                      </div>

                      {flag.flaggedContent.title && (
                        <div className="mb-2">
                          <strong className="text-sm">Title:</strong> {flag.flaggedContent.title}
                        </div>
                      )}

                      {flag.flaggedContent.content && (
                        <div className="mb-2">
                          <strong className="text-sm">Content:</strong>
                          <div className="mt-1 p-2 bg-gray-100 rounded text-sm">
                            {flag.flaggedContent.content}
                          </div>
                        </div>
                      )}

                      {flag.flaggedContent.platform && (
                        <div className="mb-2">
                          <strong className="text-sm">Platform:</strong> {flag.flaggedContent.platform}
                          {flag.flaggedContent.username && ` - ${flag.flaggedContent.username}`}
                        </div>
                      )}

                      <div className="mb-3">
                        <strong className="text-sm">Evidence:</strong>
                        <div className="mt-1 p-2 bg-red-50 border border-red-200 rounded text-sm">
                          {flag.evidence}
                        </div>
                      </div>

                      {flag.moderatorAction && (
                        <div className="mb-3">
                          <strong className="text-sm">Moderator Action:</strong>
                          <div className="mt-1 p-2 bg-blue-50 border border-blue-200 rounded text-sm">
                            <div><strong>Action:</strong> {flag.moderatorAction.action}</div>
                            <div><strong>Reason:</strong> {flag.moderatorAction.reason}</div>
                            <div><strong>Date:</strong> {new Date(flag.moderatorAction.createdAt).toLocaleDateString()}</div>
                          </div>
                        </div>
                      )}
                    </div>

                    {flag.status === 'PENDING' && (
                      <button
                        onClick={() => setSelectedFlag(flag)}
                        className="ml-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                      >
                        Review
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Review Modal */}
      {selectedFlag && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Review Flag #{selectedFlag.id}
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Action
                  </label>
                  <select
                    value={action}
                    onChange={(e) => setAction(e.target.value as any)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="ACCEPT">Accept Flag</option>
                    <option value="REJECT">Reject Flag</option>
                    <option value="PENALIZE">Penalize User</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reason for Action *
                  </label>
                  <textarea
                    value={actionReason}
                    onChange={(e) => setActionReason(e.target.value)}
                    rows={3}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    placeholder="Explain your decision..."
                  />
                </div>

                {action === 'PENALIZE' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      User to Penalize
                    </label>
                    <select
                      value={penalizedUserId}
                      onChange={(e) => setPenalizedUserId(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    >
                      <option value="">Select user...</option>
                      <option value={selectedFlag.flagger.id}>
                        {selectedFlag.flagger.name} (Flagger)
                      </option>
                      <option value={selectedFlag.flaggedUser.id}>
                        {selectedFlag.flaggedUser.name} (Flagged User)
                      </option>
                    </select>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => {
                    setSelectedFlag(null);
                    setActionReason('');
                    setPenalizedUserId('');
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleResolveFlag(selectedFlag.id)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Submit Decision
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ModeratorPortal; 