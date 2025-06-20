import React, { useState } from 'react';

interface SocialSharingProps {
  eventTitle: string;
  eventDate: string;
  eventLocation: string;
  eventUrl?: string;
  className?: string;
}

interface SocialPlatform {
  name: string;
  icon: string;
  color: string;
  shareUrl: (params: any) => string;
}

const socialPlatforms: SocialPlatform[] = [
  {
    name: 'Facebook',
    icon: '📘',
    color: 'bg-blue-600 hover:bg-blue-700',
    shareUrl: ({ title, url, description }) => 
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(title)}`
  },
  {
    name: 'Twitter',
    icon: '🐦',
    color: 'bg-blue-400 hover:bg-blue-500',
    shareUrl: ({ title, url }) => 
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`
  },
  {
    name: 'LinkedIn',
    icon: '💼',
    color: 'bg-blue-700 hover:bg-blue-800',
    shareUrl: ({ title, url, description }) => 
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`
  },
  {
    name: 'WhatsApp',
    icon: '💬',
    color: 'bg-green-500 hover:bg-green-600',
    shareUrl: ({ title, url }) => 
      `https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`
  },
  {
    name: 'Email',
    icon: '📧',
    color: 'bg-gray-600 hover:bg-gray-700',
    shareUrl: ({ title, url, description }) => 
      `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`${description}\n\n${url}`)}`
  },
  {
    name: 'Copy Link',
    icon: '🔗',
    color: 'bg-purple-600 hover:bg-purple-700',
    shareUrl: ({ url }) => url
  }
];

export default function SocialSharing({ 
  eventTitle, 
  eventDate, 
  eventLocation, 
  eventUrl = window.location.href,
  className = "" 
}: SocialSharingProps) {
  const [showShareModal, setShowShareModal] = useState(false);
  const [copiedPlatform, setCopiedPlatform] = useState<string | null>(null);

  const handleShare = (platform: SocialPlatform) => {
    const shareParams = {
      title: eventTitle,
      url: eventUrl,
      description: `Join me at ${eventTitle} on ${eventDate} at ${eventLocation}!`
    };

    if (platform.name === 'Copy Link') {
      navigator.clipboard.writeText(eventUrl);
      setCopiedPlatform('Copy Link');
      setTimeout(() => setCopiedPlatform(null), 2000);
    } else {
      const shareUrl = platform.shareUrl(shareParams);
      window.open(shareUrl, '_blank', 'width=600,height=400');
    }
  };

  const quickShareText = `Join me at ${eventTitle} on ${eventDate} at ${eventLocation}!`;

  return (
    <div className={className}>
      {/* Quick Share Button */}
      <button
        onClick={() => setShowShareModal(true)}
        className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center space-x-2"
      >
        <span>📤</span>
        <span>Share Event</span>
      </button>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Share Event</h3>
              <button
                onClick={() => setShowShareModal(false)}
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
              <p className="text-sm text-gray-600">{eventDate} • {eventLocation}</p>
            </div>

            {/* Social Platforms */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              {socialPlatforms.map((platform) => (
                <button
                  key={platform.name}
                  onClick={() => handleShare(platform)}
                  className={`p-3 rounded-lg text-white transition-colors flex flex-col items-center space-y-1 ${platform.color}`}
                >
                  <span className="text-lg">{platform.icon}</span>
                  <span className="text-xs font-medium">{platform.name}</span>
                  {copiedPlatform === platform.name && (
                    <span className="text-xs bg-white text-green-600 px-1 rounded">Copied!</span>
                  )}
                </button>
              ))}
            </div>

            {/* Quick Copy Text */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quick Share Text
              </label>
              <div className="flex">
                <textarea
                  value={quickShareText}
                  readOnly
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                  rows={2}
                />
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(quickShareText);
                    setCopiedPlatform('Text');
                    setTimeout(() => setCopiedPlatform(null), 2000);
                  }}
                  className="px-4 py-2 bg-purple-600 text-white rounded-r-lg hover:bg-purple-700 transition-colors"
                >
                  {copiedPlatform === 'Text' ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>

            {/* QR Code Placeholder */}
            <div className="text-center p-4 border border-gray-200 rounded-lg">
              <div className="text-4xl mb-2">📱</div>
              <p className="text-sm text-gray-600">QR Code for mobile sharing</p>
              <p className="text-xs text-gray-500">(Coming soon)</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 