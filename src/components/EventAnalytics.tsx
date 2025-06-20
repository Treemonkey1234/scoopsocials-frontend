import React from 'react';

interface EventAnalyticsProps {
  eventId: string;
  className?: string;
}

interface AnalyticsData {
  views: number;
  shares: number;
  saves: number;
  rsvps: number;
  engagementRate: number;
  topInterests: string[];
  peakActivityTime: string;
  demographics: {
    ageGroups: { range: string; percentage: number }[];
    locations: { city: string; percentage: number }[];
  };
}

// Mock analytics data - in real app this would come from API
const mockAnalytics: AnalyticsData = {
  views: 1247,
  shares: 89,
  saves: 156,
  rsvps: 67,
  engagementRate: 23.4,
  topInterests: ['Technology', 'Networking', 'Startups', 'Innovation'],
  peakActivityTime: '7:00 PM - 9:00 PM',
  demographics: {
    ageGroups: [
      { range: '25-34', percentage: 45 },
      { range: '35-44', percentage: 28 },
      { range: '18-24', percentage: 18 },
      { range: '45+', percentage: 9 }
    ],
    locations: [
      { city: 'New York', percentage: 35 },
      { city: 'Los Angeles', percentage: 22 },
      { city: 'Chicago', percentage: 15 },
      { city: 'Other', percentage: 28 }
    ]
  }
};

export default function EventAnalytics({ eventId, className = "" }: EventAnalyticsProps) {
  const data = mockAnalytics;

  const formatNumber = (num: number) => {
    if (num >= 1000) return `${(num / 1000).toFixed(1)}k`;
    return num.toString();
  };

  const getEngagementColor = (rate: number) => {
    if (rate >= 20) return 'text-green-600';
    if (rate >= 10) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Event Analytics</h3>
        <span className="text-sm text-gray-500">Last 7 days</span>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="text-center p-4 bg-blue-50 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">{formatNumber(data.views)}</div>
          <div className="text-sm text-gray-600">Views</div>
        </div>
        <div className="text-center p-4 bg-green-50 rounded-lg">
          <div className="text-2xl font-bold text-green-600">{formatNumber(data.shares)}</div>
          <div className="text-sm text-gray-600">Shares</div>
        </div>
        <div className="text-center p-4 bg-purple-50 rounded-lg">
          <div className="text-2xl font-bold text-purple-600">{formatNumber(data.saves)}</div>
          <div className="text-sm text-gray-600">Saves</div>
        </div>
        <div className="text-center p-4 bg-orange-50 rounded-lg">
          <div className="text-2xl font-bold text-orange-600">{formatNumber(data.rsvps)}</div>
          <div className="text-sm text-gray-600">RSVPs</div>
        </div>
      </div>

      {/* Engagement Rate */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">Engagement Rate</span>
          <span className={`text-lg font-bold ${getEngagementColor(data.engagementRate)}`}>
            {data.engagementRate}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${Math.min(data.engagementRate * 2, 100)}%` }}
          ></div>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          {data.engagementRate >= 20 ? 'Excellent engagement!' : 
           data.engagementRate >= 10 ? 'Good engagement' : 'Consider promoting more'}
        </p>
      </div>

      {/* Top Interests */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Top Interests</h4>
        <div className="flex flex-wrap gap-2">
          {data.topInterests.map((interest, index) => (
            <span 
              key={interest}
              className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
            >
              {interest}
            </span>
          ))}
        </div>
      </div>

      {/* Demographics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Age Groups */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3">Age Distribution</h4>
          <div className="space-y-2">
            {data.demographics.ageGroups.map((group) => (
              <div key={group.range} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{group.range}</span>
                <div className="flex items-center space-x-2">
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ width: `${group.percentage}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900 w-8">{group.percentage}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Locations */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3">Top Locations</h4>
          <div className="space-y-2">
            {data.demographics.locations.map((location) => (
              <div key={location.city} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{location.city}</span>
                <div className="flex items-center space-x-2">
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full"
                      style={{ width: `${location.percentage}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900 w-8">{location.percentage}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Insights */}
      <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
        <h4 className="text-sm font-medium text-gray-900 mb-2">💡 Insights</h4>
        <ul className="text-sm text-gray-700 space-y-1">
          <li>• Peak activity time: {data.peakActivityTime}</li>
          <li>• 67% of attendees are aged 25-44</li>
          <li>• High engagement from tech professionals</li>
          <li>• Consider promoting in LA and Chicago</li>
        </ul>
      </div>

      {/* Action Buttons */}
      <div className="mt-6 flex space-x-3">
        <button className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm">
          Export Report
        </button>
        <button className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm">
          Share Insights
        </button>
      </div>
    </div>
  );
} 