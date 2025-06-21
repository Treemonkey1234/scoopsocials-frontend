import React, { useState } from 'react';

interface WalkthroughModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

const SOCIAL_PLATFORMS = [
  { value: 'facebook', label: 'Facebook' },
  { value: 'youtube', label: 'YouTube' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'tiktok', label: 'TikTok' },
  { value: 'twitter', label: 'Twitter/X' },
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'snapchat', label: 'Snapchat' },
  { value: 'discord', label: 'Discord' },
  { value: 'reddit', label: 'Reddit' },
  { value: 'twitch', label: 'Twitch' },
  { value: 'pinterest', label: 'Pinterest' },
  { value: 'other', label: 'Other' },
];

interface SocialAccount {
  platform: string;
  username: string;
  customPlatform?: string;
  customUrl?: string;
}

export const WalkthroughModal: React.FC<WalkthroughModalProps> = ({
  isOpen,
  onClose,
  onComplete,
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [socialAccounts, setSocialAccounts] = useState<SocialAccount[]>([
    { platform: 'facebook', username: '' }
  ]);
  const [showOtherModal, setShowOtherModal] = useState(false);
  const [customPlatform, setCustomPlatform] = useState('');
  const [customUrl, setCustomUrl] = useState('');

  const totalSteps = 6;

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const skipToEnd = () => {
    onComplete();
  };

  const addSocialAccount = () => {
    setSocialAccounts([...socialAccounts, { platform: 'facebook', username: '' }]);
  };

  const updateSocialAccount = (index: number, field: string, value: string) => {
    const updated = [...socialAccounts];
    updated[index] = { ...updated[index], [field]: value };
    setSocialAccounts(updated);
  };

  const removeSocialAccount = (index: number) => {
    if (socialAccounts.length > 1) {
      setSocialAccounts(socialAccounts.filter((_, i) => i !== index));
    }
  };

  const handleAddOtherPlatform = () => {
    if (customPlatform && customUrl) {
      setSocialAccounts([...socialAccounts, {
        platform: 'other',
        username: '',
        customPlatform,
        customUrl
      }]);
      setCustomPlatform('');
      setCustomUrl('');
      setShowOtherModal(false);
    }
  };

  const importPhoneContacts = () => {
    console.log('Importing phone contacts...');
    alert('Contact import feature would be implemented here');
  };

  const finishWalkthrough = () => {
    localStorage.setItem('walkthroughCompleted', 'true');
    localStorage.setItem('userSocialAccounts', JSON.stringify(socialAccounts));
    onComplete();
  };

  if (!isOpen) return null;

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="text-center">
            <div className="text-4xl mb-4"></div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Welcome to Scoop Socials!</h2>
            <p className="text-gray-600 mb-6">
              This is your HOME FEED where you'll see REVIEWS from your network about people.
            </p>
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="text-left space-y-3">
                <div className="border-b pb-2">
                  <div className="font-semibold"> John reviewed Sarah </div>
                  <div className="text-sm text-gray-600">"Great project partner, very reliable"</div>
                  <div className="text-sm text-gray-500"> 12   3   5</div>
                </div>
                <div>
                  <div className="font-semibold"> Mike reviewed Lisa </div>
                  <div className="text-sm text-gray-600">"Helpful mentor, always on time"</div>
                  <div className="text-sm text-gray-500"> 8    7   2</div>
                </div>
              </div>
            </div>
            <button
              onClick={nextStep}
              className="bg-cyan-600 text-white px-6 py-2 rounded-lg hover:bg-cyan-700"
            >
              Next: See Reviews 
            </button>
          </div>
        );

      case 2:
        return (
          <div className="text-center">
            <div className="text-4xl mb-4"></div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Trust Scores</h2>
            <p className="text-gray-600 mb-6">
              These show how reliable people are based on community reviews!
            </p>
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="text-left">
                <div className="font-semibold mb-2"> John reviewed Sarah </div>
                <div className="bg-yellow-100 border-l-4 border-yellow-500 p-3 rounded">
                  <div className="font-semibold text-yellow-800">Sarah: 94/100 Trust Score</div>
                  <div className="text-sm text-yellow-700">Based on 23 community reviews</div>
                </div>
              </div>
            </div>
            <button
              onClick={nextStep}
              className="bg-cyan-600 text-white px-6 py-2 rounded-lg hover:bg-cyan-700"
            >
              Next: Search 
            </button>
          </div>
        );

      case 3:
        return (
          <div className="text-center">
            <div className="text-4xl mb-4"></div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Find People to Review</h2>
            <p className="text-gray-600 mb-6">
              Use Search to find people you know and can write reviews about their character!
            </p>
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <input
                type="text"
                placeholder="Try &quot;Sarah Johnson&quot; or &quot;New York&quot;"
                className="w-full p-3 border rounded-lg mb-4"
                disabled
              />
              <div className="text-left space-y-2">
                <div className="text-sm font-semibold"> Nearby Users</div>
                <div className="text-sm"> Alex Chen - Software Dev - 0.5mi</div>
                <div className="text-sm"> Maria Lopez - Designer - 1.2mi</div>
              </div>
            </div>
            <button
              onClick={nextStep}
              className="bg-cyan-600 text-white px-6 py-2 rounded-lg hover:bg-cyan-700"
            >
              Next: Events 
            </button>
          </div>
        );

      case 4:
        return (
          <div className="text-center">
            <div className="text-4xl mb-4"></div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Meet in Real Life!</h2>
            <p className="text-gray-600 mb-6">
              Events help you connect with your network offline. Meet people you can later review!
            </p>
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="text-left space-y-3">
                <div className="border-b pb-2">
                  <div className="font-semibold"> Tech Meetup Tonight</div>
                  <div className="text-sm text-gray-600"> Downtown Cafe  7:00 PM</div>
                  <div className="text-sm text-gray-500"> 12 going  Trust Req: 70+</div>
                </div>
                <div>
                  <div className="font-semibold"> Pizza & Code Session</div>
                  <div className="text-sm text-gray-600"> Library  Tomorrow 6PM</div>
                  <div className="text-sm text-gray-500"> 8 going  Trust Req: 50+</div>
                </div>
              </div>
            </div>
            <button
              onClick={nextStep}
              className="bg-cyan-600 text-white px-6 py-2 rounded-lg hover:bg-cyan-700"
            >
              Next: Friends 
            </button>
          </div>
        );

      case 5:
        return (
          <div className="text-center">
            <div className="text-4xl mb-4"></div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Your Network</h2>
            <p className="text-gray-600 mb-6">
              This is where you'll see your friends and their trust scores. Build meaningful connections!
            </p>
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="text-left space-y-3">
                <div className="text-sm font-semibold mb-2"> Your Network</div>
                <div className="flex items-center justify-between p-2 bg-white rounded">
                  <div>
                    <div className="font-semibold"> Sarah Johnson</div>
                    <div className="text-sm text-gray-500">Trust Score: 94</div>
                  </div>
                  <div className="text-green-600 text-sm">Connected</div>
                </div>
                <div className="flex items-center justify-between p-2 bg-white rounded">
                  <div>
                    <div className="font-semibold"> Alex Chen</div>
                    <div className="text-sm text-gray-500">Trust Score: 87</div>
                  </div>
                  <div className="text-green-600 text-sm">Connected</div>
                </div>
                <div className="text-center text-sm text-gray-500 mt-4">
                  + Import contacts to find more friends
                </div>
              </div>
            </div>
            <button
              onClick={nextStep}
              className="bg-cyan-600 text-white px-6 py-2 rounded-lg hover:bg-cyan-700"
            >
              Next: Your Profile 
            </button>
          </div>
        );

      case 6:
        return (
          <div className="text-center">
            <div className="text-4xl mb-4"></div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Connect & Discover!</h2>
            <p className="text-gray-600 mb-6">
              Add your social profiles and import phone contacts to find people you already know!
            </p>
            
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3"> ADD SOCIAL PROFILES</h3>
              <div className="space-y-3">
                {socialAccounts.map((account, index) => (
                  <div key={index} className="flex gap-2 items-center">
                    <select
                      value={account.platform}
                      onChange={(e) => {
                        if (e.target.value === 'other') {
                          setShowOtherModal(true);
                        } else {
                          updateSocialAccount(index, 'platform', e.target.value);
                        }
                      }}
                      className="border rounded px-3 py-2 flex-1"
                    >
                      {SOCIAL_PLATFORMS.map(platform => (
                        <option key={platform.value} value={platform.value}>
                          {platform.label}
                        </option>
                      ))}
                    </select>
                    <input
                      type="text"
                      placeholder="@username"
                      value={account.username}
                      onChange={(e) => updateSocialAccount(index, 'username', e.target.value)}
                      className="border rounded px-3 py-2 flex-1"
                    />
                    {socialAccounts.length > 1 && (
                      <button
                        onClick={() => removeSocialAccount(index)}
                        className="text-red-500 hover:text-red-700 px-2"
                      >
                        
                      </button>
                    )}
                  </div>
                ))}
                <button
                  onClick={addSocialAccount}
                  className="text-cyan-600 hover:text-cyan-700 text-sm"
                >
                   Add another? [+]
                </button>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3"> FIND FRIENDS</h3>
              <button
                onClick={importPhoneContacts}
                className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg p-4 w-full hover:bg-gray-50"
              >
                 Import Phone Contacts
              </button>
            </div>

            <div className="flex gap-3 justify-center">
              <button
                onClick={skipToEnd}
                className="text-gray-500 px-6 py-2 rounded-lg hover:text-gray-700"
              >
                Skip for Now
              </button>
              <button
                onClick={finishWalkthrough}
                className="bg-cyan-600 text-white px-6 py-2 rounded-lg hover:bg-cyan-700"
              >
                Let's Go!
              </button>
            </div>
            <div className="text-xs text-red-500 mt-2">
               Skipping will limit participation until you add accounts and friends
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <div className="text-sm text-gray-500">
                Step {currentStep} of {totalSteps}
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 text-xl"
              >
                
              </button>
            </div>

            <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
              <div
                className="bg-cyan-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(currentStep / totalSteps) * 100}%` }}
              />
            </div>

            {renderStep()}

            {showOtherModal && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60">
                <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
                  <h3 className="text-lg font-semibold mb-4">Add Custom Platform</h3>
                  <div className="space-y-3">
                    <input
                      type="text"
                      placeholder="Platform Name (e.g. Behance, Medium)"
                      value={customPlatform}
                      onChange={(e) => setCustomPlatform(e.target.value)}
                      className="w-full border rounded px-3 py-2"
                    />
                    <input
                      type="url"
                      placeholder="https://www.platform.com/username"
                      value={customUrl}
                      onChange={(e) => setCustomUrl(e.target.value)}
                      className="w-full border rounded px-3 py-2"
                    />
                  </div>
                  <div className="flex gap-3 mt-6">
                    <button
                      onClick={() => setShowOtherModal(false)}
                      className="text-gray-500 px-4 py-2 rounded hover:text-gray-700"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleAddOtherPlatform}
                      className="bg-cyan-600 text-white px-4 py-2 rounded hover:bg-cyan-700"
                    >
                      Add Platform
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};
