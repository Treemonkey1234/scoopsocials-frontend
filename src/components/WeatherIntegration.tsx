import React, { useState, useEffect } from 'react';

interface WeatherIntegrationProps {
  eventDate: string;
  eventTime: string;
  eventLocation: string;
  className?: string;
}

interface WeatherData {
  date: string;
  time: string;
  temperature: number;
  condition: string;
  icon: string;
  humidity: number;
  windSpeed: number;
  precipitation: number;
  uvIndex: number;
  feelsLike: number;
}

interface WeatherAlert {
  type: 'warning' | 'danger' | 'info';
  message: string;
  icon: string;
}

// Mock weather data - in real app this would come from a weather API
const mockWeatherData: WeatherData = {
  date: '2024-01-15',
  time: '19:00',
  temperature: 72,
  condition: 'Partly Cloudy',
  icon: '⛅',
  humidity: 65,
  windSpeed: 8,
  precipitation: 10,
  uvIndex: 3,
  feelsLike: 74
};

const mockAlerts: WeatherAlert[] = [
  {
    type: 'warning',
    message: 'Light rain expected during event time',
    icon: '🌧️'
  },
  {
    type: 'info',
    message: 'UV index moderate - consider shade',
    icon: '☀️'
  }
];

export default function WeatherIntegration({ 
  eventDate, 
  eventTime, 
  eventLocation,
  className = "" 
}: WeatherIntegrationProps) {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [alerts, setAlerts] = useState<WeatherAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showWeatherModal, setShowWeatherModal] = useState(false);

  useEffect(() => {
    // Simulate API call to fetch weather data
    const fetchWeatherData = async () => {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      setWeatherData(mockWeatherData);
      setAlerts(mockAlerts);
      setIsLoading(false);
    };

    fetchWeatherData();
  }, [eventDate, eventTime, eventLocation]);

  const getWeatherAdvice = (weather: WeatherData) => {
    const advice = [];
    
    if (weather.precipitation > 50) {
      advice.push('Consider indoor backup plan');
    }
    if (weather.temperature < 50) {
      advice.push('Recommend warm clothing');
    }
    if (weather.temperature > 85) {
      advice.push('Provide shade and water');
    }
    if (weather.windSpeed > 15) {
      advice.push('Secure decorations and equipment');
    }
    if (weather.uvIndex > 5) {
      advice.push('Encourage sunscreen use');
    }
    
    return advice.length > 0 ? advice : ['Weather looks great for your event!'];
  };

  const getWeatherColor = (condition: string) => {
    if (condition.includes('Rain') || condition.includes('Storm')) return 'text-blue-600';
    if (condition.includes('Snow')) return 'text-gray-600';
    if (condition.includes('Cloud')) return 'text-gray-500';
    return 'text-yellow-600';
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'danger': return 'bg-red-100 border-red-300 text-red-800';
      case 'warning': return 'bg-yellow-100 border-yellow-300 text-yellow-800';
      case 'info': return 'bg-blue-100 border-blue-300 text-blue-800';
      default: return 'bg-gray-100 border-gray-300 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className={`p-4 bg-gray-50 rounded-lg ${className}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
        </div>
      </div>
    );
  }

  if (!weatherData) {
    return (
      <div className={`p-4 bg-gray-50 rounded-lg ${className}`}>
        <p className="text-gray-500">Weather data unavailable</p>
      </div>
    );
  }

  const weatherAdvice = getWeatherAdvice(weatherData);

  return (
    <div className={className}>
      {/* Weather Widget */}
      <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h4 className="font-medium text-gray-900">Weather Forecast</h4>
            <p className="text-sm text-gray-600">{eventLocation}</p>
          </div>
          <button
            onClick={() => setShowWeatherModal(true)}
            className="text-blue-600 hover:text-blue-700 text-sm"
          >
            View Details
          </button>
        </div>

        <div className="flex items-center space-x-4">
          <div className="text-4xl">{weatherData.icon}</div>
          <div>
            <div className="text-2xl font-bold text-gray-900">{weatherData.temperature}°F</div>
            <div className={`text-sm font-medium ${getWeatherColor(weatherData.condition)}`}>
              {weatherData.condition}
            </div>
            <div className="text-xs text-gray-500">Feels like {weatherData.feelsLike}°F</div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-2 mt-3 text-xs">
          <div className="text-center">
            <div className="text-gray-500">Humidity</div>
            <div className="font-medium">{weatherData.humidity}%</div>
          </div>
          <div className="text-center">
            <div className="text-gray-500">Wind</div>
            <div className="font-medium">{weatherData.windSpeed} mph</div>
          </div>
          <div className="text-center">
            <div className="text-gray-500">Rain</div>
            <div className="font-medium">{weatherData.precipitation}%</div>
          </div>
        </div>

        {/* Weather Advice */}
        <div className="mt-3 p-2 bg-white rounded border">
          <div className="text-xs font-medium text-gray-700 mb-1">Event Advice:</div>
          <div className="text-xs text-gray-600">{weatherAdvice[0]}</div>
        </div>
      </div>

      {/* Weather Alerts */}
      {alerts.length > 0 && (
        <div className="mt-3 space-y-2">
          {alerts.map((alert, index) => (
            <div
              key={index}
              className={`p-3 rounded-lg border ${getAlertColor(alert.type)} flex items-center space-x-2`}
            >
              <span className="text-lg">{alert.icon}</span>
              <span className="text-sm font-medium">{alert.message}</span>
            </div>
          ))}
        </div>
      )}

      {/* Detailed Weather Modal */}
      {showWeatherModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Weather Details</h3>
              <button
                onClick={() => setShowWeatherModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Current Weather */}
            <div className="text-center mb-6">
              <div className="text-6xl mb-2">{weatherData.icon}</div>
              <div className="text-3xl font-bold text-gray-900">{weatherData.temperature}°F</div>
              <div className={`text-lg font-medium ${getWeatherColor(weatherData.condition)}`}>
                {weatherData.condition}
              </div>
              <div className="text-sm text-gray-500">Feels like {weatherData.feelsLike}°F</div>
            </div>

            {/* Detailed Stats */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-500">Humidity</div>
                <div className="text-lg font-semibold">{weatherData.humidity}%</div>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-500">Wind Speed</div>
                <div className="text-lg font-semibold">{weatherData.windSpeed} mph</div>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-500">Precipitation</div>
                <div className="text-lg font-semibold">{weatherData.precipitation}%</div>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-500">UV Index</div>
                <div className="text-lg font-semibold">{weatherData.uvIndex}/10</div>
              </div>
            </div>

            {/* Event Recommendations */}
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Event Recommendations</h4>
              <div className="space-y-2">
                {weatherAdvice.map((advice, index) => (
                  <div key={index} className="flex items-start space-x-2">
                    <span className="text-green-500 mt-0.5">✓</span>
                    <span className="text-sm text-gray-700">{advice}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Hourly Forecast Placeholder */}
            <div className="p-3 bg-blue-50 rounded-lg">
              <h4 className="text-sm font-medium text-blue-900 mb-2">Hourly Forecast</h4>
              <div className="text-xs text-blue-800">
                Detailed hourly forecast coming soon...
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 