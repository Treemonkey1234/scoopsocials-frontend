import React from 'react';

export interface EventTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  defaultSettings: {
    maxGuests: number;
    isPrivate: boolean;
    price: number;
    ageRestriction: string;
    tags: string[];
  };
}

const eventTemplates: EventTemplate[] = [
  {
    id: 'house-party',
    name: 'House Party',
    description: 'Casual gathering at home',
    icon: '🏠',
    category: 'Social',
    defaultSettings: {
      maxGuests: 30,
      isPrivate: true,
      price: 0,
      ageRestriction: '21+',
      tags: ['party', 'social', 'casual']
    }
  },
  {
    id: 'business-networking',
    name: 'Business Networking',
    description: 'Professional networking event',
    icon: '💼',
    category: 'Business',
    defaultSettings: {
      maxGuests: 50,
      isPrivate: false,
      price: 25,
      ageRestriction: '18+',
      tags: ['networking', 'business', 'professional']
    }
  },
  {
    id: 'outdoor-adventure',
    name: 'Outdoor Adventure',
    description: 'Hiking, camping, or outdoor activities',
    icon: '🏔️',
    category: 'Outdoor',
    defaultSettings: {
      maxGuests: 15,
      isPrivate: false,
      price: 0,
      ageRestriction: 'All ages',
      tags: ['outdoor', 'adventure', 'nature']
    }
  },
  {
    id: 'food-tasting',
    name: 'Food Tasting',
    description: 'Restaurant visits or food events',
    icon: '🍽️',
    category: 'Food',
    defaultSettings: {
      maxGuests: 20,
      isPrivate: false,
      price: 50,
      ageRestriction: 'All ages',
      tags: ['food', 'dining', 'tasting']
    }
  },
  {
    id: 'music-concert',
    name: 'Music Concert',
    description: 'Live music or concert events',
    icon: '🎵',
    category: 'Music',
    defaultSettings: {
      maxGuests: 100,
      isPrivate: false,
      price: 75,
      ageRestriction: 'All ages',
      tags: ['music', 'concert', 'live']
    }
  },
  {
    id: 'wellness-workshop',
    name: 'Wellness Workshop',
    description: 'Yoga, meditation, or wellness events',
    icon: '🧘',
    category: 'Wellness',
    defaultSettings: {
      maxGuests: 25,
      isPrivate: false,
      price: 35,
      ageRestriction: 'All ages',
      tags: ['wellness', 'yoga', 'meditation']
    }
  }
];

interface EventTemplatesProps {
  onSelectTemplate: (template: EventTemplate) => void;
}

export default function EventTemplates({ onSelectTemplate }: EventTemplatesProps) {
  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-3">Quick Start Templates</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {eventTemplates.map((template) => (
          <button
            key={template.id}
            onClick={() => onSelectTemplate(template)}
            className="p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-all duration-200 text-left group"
          >
            <div className="text-2xl mb-2">{template.icon}</div>
            <h4 className="font-medium text-gray-900 group-hover:text-purple-700">
              {template.name}
            </h4>
            <p className="text-sm text-gray-600 mt-1">
              {template.description}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}

export { eventTemplates }; 