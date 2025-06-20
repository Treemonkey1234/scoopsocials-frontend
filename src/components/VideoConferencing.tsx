import React, { useState } from 'react';

interface VideoConferencingProps {
  eventTitle: string;
  eventDate: string;
  eventTime: string;
  onMeetingCreated: (meetingData: any) => void;
  className?: string;
}

interface VideoPlatform {
  id: string;
  name: string;
  icon: string;
  color: string;
  description: string;
  features: string[];
  pricing: string;
}

const videoPlatforms: VideoPlatform[] = [
  {
    id: 'zoom',
    name: 'Zoom',
    icon: '📹',
    color: 'bg-blue-600 hover:bg-blue-700',
    description: 'Most popular video conferencing platform',
    features: ['HD Video', 'Screen Sharing', 'Recording', 'Breakout Rooms', 'Polls'],
    pricing: 'Free up to 40 minutes, $15/month for longer'
  },
  {
    id: 'teams',
    name: 'Microsoft Teams',
    icon: '💼',
    color: 'bg-purple-600 hover:bg-purple-700',
    description: 'Great for business and enterprise events',
    features: ['HD Video', 'Screen Sharing', 'Recording', 'Whiteboard', 'Chat'],
    pricing: 'Free with Microsoft 365, $6/month standalone'
  },
  {
    id: 'google-meet',
    name: 'Google Meet',
    icon: '🔵',
    color: 'bg-green-600 hover:bg-green-700',
    description: 'Simple and reliable video meetings',
    features: ['HD Video', 'Screen Sharing', 'Recording', 'Live Captions', 'Chat'],
    pricing: 'Free up to 60 minutes, $6/month for longer'
  },
  {
    id: 'webex',
    name: 'Cisco Webex',
    icon: '🌐',
    color: 'bg-blue-500 hover:bg-blue-600',
    description: 'Enterprise-grade video conferencing',
    features: ['HD Video', 'Screen Sharing', 'Recording', 'AI Assistant', 'Security'],
    pricing: 'Free up to 50 minutes, $13/month for longer'
  }
];

interface MeetingSettings {
  duration: number;
  maxParticipants: number;
  recording: boolean;
  waitingRoom: boolean;
  password: boolean;
  autoStart: boolean;
}

export default function VideoConferencing({ 
  eventTitle, 
  eventDate, 
  eventTime,
  onMeetingCreated,
  className = "" 
}: VideoConferencingProps) {
  const [selectedPlatform, setSelectedPlatform] = useState<string>('');
  const [showSetupModal, setShowSetupModal] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [meetingSettings, setMeetingSettings] = useState<MeetingSettings>({
    duration: 60,
    maxParticipants: 100,
    recording: false,
    waitingRoom: true,
    password: true,
    autoStart: false
  });

  const selectedPlatformData = videoPlatforms.find(p => p.id === selectedPlatform);

  const handleCreateMeeting = async () => {
    setIsCreating(true);
    
    // Simulate API call to create meeting
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const meetingData = {
      platform: selectedPlatform,
      meetingId: `meeting_${Date.now()}`,
      joinUrl: `https://${selectedPlatform}.com/join/${Math.random().toString(36).substr(2, 9)}`,
      password: Math.random().toString(36).substr(2, 6).toUpperCase(),
      settings: meetingSettings,
      createdAt: new Date().toISOString()
    };
    
    setIsCreating(false);
    setShowSetupModal(false);
    onMeetingCreated(meetingData);
  };

  const updateSetting = (key: keyof MeetingSettings, value: any) => {
    setMeetingSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className={className}>
      {/* Create Meeting Button */}
      <button
        onClick={() => setShowSetupModal(true)}
        className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
      >
        <span>📹</span>
        <span>Add Video Meeting</span>
      </button>

      {/* Setup Modal */}
      {showSetupModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Setup Video Meeting</h3>
                <button
                  onClick={() => setShowSetupModal(false)}
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
                <p className="text-sm text-gray-600">{eventDate} at {eventTime}</p>
              </div>

              {/* Platform Selection */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Choose Video Platform</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {videoPlatforms.map((platform) => (
                    <div
                      key={platform.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        selectedPlatform === platform.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setSelectedPlatform(platform.id)}
                    >
                      <div className="flex items-start space-x-3">
                        <span className="text-2xl">{platform.icon}</span>
                        <div className="flex-1">
                          <h5 className="font-medium text-gray-900">{platform.name}</h5>
                          <p className="text-sm text-gray-600 mb-2">{platform.description}</p>
                          <div className="space-y-1">
                            {platform.features.map((feature, index) => (
                              <div key={index} className="flex items-center text-xs text-gray-500">
                                <span className="w-1 h-1 bg-green-500 rounded-full mr-2"></span>
                                {feature}
                              </div>
                            ))}
                          </div>
                          <p className="text-xs text-gray-500 mt-2">{platform.pricing}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Meeting Settings */}
              {selectedPlatform && (
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Meeting Settings</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Duration (minutes)
                      </label>
                      <select
                        value={meetingSettings.duration}
                        onChange={(e) => updateSetting('duration', parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value={30}>30 minutes</option>
                        <option value={60}>1 hour</option>
                        <option value={90}>1.5 hours</option>
                        <option value={120}>2 hours</option>
                        <option value={180}>3 hours</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Max Participants
                      </label>
                      <select
                        value={meetingSettings.maxParticipants}
                        onChange={(e) => updateSetting('maxParticipants', parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value={50}>50</option>
                        <option value={100}>100</option>
                        <option value={250}>250</option>
                        <option value={500}>500</option>
                        <option value={1000}>1000</option>
                      </select>
                    </div>
                  </div>

                  {/* Security Settings */}
                  <div className="mt-4 space-y-3">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={meetingSettings.waitingRoom}
                        onChange={(e) => updateSetting('waitingRoom', e.target.checked)}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">Enable waiting room</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={meetingSettings.password}
                        onChange={(e) => updateSetting('password', e.target.checked)}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">Require meeting password</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={meetingSettings.recording}
                        onChange={(e) => updateSetting('recording', e.target.checked)}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">Allow recording</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={meetingSettings.autoStart}
                        onChange={(e) => updateSetting('autoStart', e.target.checked)}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">Auto-start when host joins</span>
                    </label>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowSetupModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateMeeting}
                  disabled={!selectedPlatform || isCreating}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {isCreating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Creating Meeting...</span>
                    </>
                  ) : (
                    <>
                      <span>📹</span>
                      <span>Create Meeting</span>
                    </>
                  )}
                </button>
              </div>

              {/* Tips */}
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <h4 className="text-sm font-medium text-blue-900 mb-2">💡 Tips for Virtual Events</h4>
                <ul className="text-xs text-blue-800 space-y-1">
                  <li>• Test your setup 15 minutes before the event</li>
                  <li>• Have a backup plan in case of technical issues</li>
                  <li>• Send meeting links to attendees 24 hours in advance</li>
                  <li>• Consider recording for attendees who can't join live</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 