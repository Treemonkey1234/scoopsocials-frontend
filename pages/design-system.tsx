import React, { useState } from 'react';

// Simple design system showcase without external dependencies
const DesignSystemPage: React.FC = () => {
  const [inputValue, setInputValue] = useState('');

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-h1 text-brand mb-4">
            Scoop Socials Design System V2
          </h1>
          <p className="text-body1 text-secondary">
            A comprehensive design system for the next generation of Scoop Socials
          </p>
        </div>

        {/* Colors Section */}
        <div className="card padding-lg margin-lg">
          <h2 className="text-h2 mb-6">Colors</h2>
          <div className="flex flex-col md:flex-row gap-8">
            <div className="flex-1">
              <h3 className="text-h3 mb-4">Primary Colors</h3>
              <div className="flex gap-4 mb-6 flex-wrap">
                <div className="w-20 h-20 bg-blue-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                  Primary
                </div>
                <div className="w-20 h-20 bg-blue-400 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                  Light
                </div>
                <div className="w-20 h-20 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                  Dark
                </div>
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-h3 mb-4">Text Colors</h3>
              <div className="flex flex-col gap-4">
                <p className="text-body1 text-primary">Primary Text Color</p>
                <p className="text-body1 text-secondary">Secondary Text Color</p>
                <p className="text-body1 text-brand">Brand Color</p>
              </div>
            </div>
          </div>
        </div>

        {/* Typography Section */}
        <div className="card padding-lg margin-lg">
          <h2 className="text-h2 mb-6">Typography</h2>
          <div className="flex flex-col gap-4">
            <h1 className="text-h1">Heading 1 - 2rem</h1>
            <h2 className="text-h2">Heading 2 - 1.5rem</h2>
            <h3 className="text-h3">Heading 3 - 1.25rem</h3>
            <p className="text-body1">Body 1 - 1rem</p>
            <p className="text-body2">Body 2 - 0.875rem</p>
          </div>
        </div>

        {/* Buttons Section */}
        <div className="card padding-lg margin-lg">
          <h2 className="text-h2 mb-6">Buttons</h2>
          
          {/* Button Variants */}
          <div className="mb-8">
            <h3 className="text-h3 mb-4">Variants</h3>
            <div className="flex gap-4 flex-wrap">
              <button className="btn btn-primary px-6 py-3 text-base">Primary</button>
              <button className="btn btn-secondary px-6 py-3 text-base">Secondary</button>
              <button className="btn btn-outline px-6 py-3 text-base">Outline</button>
              <button className="bg-transparent text-blue-500 hover:bg-blue-50 px-6 py-3 text-base rounded-full">Text</button>
            </div>
          </div>

          {/* Button Sizes */}
          <div className="mb-8">
            <h3 className="text-h3 mb-4">Sizes</h3>
            <div className="flex gap-4 items-center flex-wrap">
              <button className="btn btn-primary px-4 py-2 text-sm">Small</button>
              <button className="btn btn-primary px-6 py-3 text-base">Medium</button>
              <button className="btn btn-primary px-8 py-4 text-lg">Large</button>
            </div>
          </div>

          {/* Button States */}
          <div>
            <h3 className="text-h3 mb-4">States</h3>
            <div className="flex gap-4 flex-wrap">
              <button className="btn btn-primary px-6 py-3 text-base">Normal</button>
              <button className="btn btn-primary px-6 py-3 text-base opacity-50 cursor-not-allowed" disabled>
                Disabled
              </button>
            </div>
          </div>
        </div>

        {/* Inputs Section */}
        <div className="card padding-lg margin-lg">
          <h2 className="text-h2 mb-6">Inputs</h2>
          
          {/* Input Sizes */}
          <div className="mb-8">
            <h3 className="text-h3 mb-4">Sizes</h3>
            <div className="flex flex-col gap-4 max-w-md">
              <input 
                type="text"
                placeholder="Small input"
                className="input w-full rounded-md border px-3 py-2 text-sm"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
              />
              <input 
                type="text"
                placeholder="Medium input"
                className="input w-full rounded-md border px-4 py-3 text-base"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
              />
              <input 
                type="text"
                placeholder="Large input"
                className="input w-full rounded-md border px-5 py-4 text-lg"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
              />
            </div>
          </div>

          {/* Input States */}
          <div>
            <h3 className="text-h3 mb-4">States</h3>
            <div className="flex flex-col gap-4 max-w-md">
              <input 
                type="text"
                placeholder="Normal input"
                className="input w-full rounded-md border px-4 py-3 text-base"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
              />
              <input 
                type="text"
                placeholder="Disabled input"
                className="input w-full rounded-md border px-4 py-3 text-base opacity-50 cursor-not-allowed"
                disabled
              />
              <div>
                <input 
                  type="text"
                  placeholder="Error input"
                  className="input w-full rounded-md border-red-500 px-4 py-3 text-base"
                />
                <p className="mt-1 text-sm text-red-500">This field is required</p>
              </div>
            </div>
          </div>
        </div>

        {/* Spacing Section */}
        <div className="card padding-lg margin-lg">
          <h2 className="text-h2 mb-6">Spacing</h2>
          <div className="flex flex-col md:flex-row gap-8">
            <div className="flex-1">
              <h3 className="text-h3 mb-4">Spacing Scale</h3>
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-4">
                  <div className="w-1 h-1 bg-blue-500"></div>
                  <span className="text-body2">XS - 4px</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-2 h-2 bg-blue-500"></div>
                  <span className="text-body2">SM - 8px</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-4 h-4 bg-blue-500"></div>
                  <span className="text-body2">MD - 16px</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-6 h-6 bg-blue-500"></div>
                  <span className="text-body2">LG - 24px</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 bg-blue-500"></div>
                  <span className="text-body2">XL - 32px</span>
                </div>
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-h3 mb-4">Border Radius</h3>
              <div className="flex flex-col gap-4">
                <div className="w-24 h-10 bg-blue-500 rounded-sm flex items-center justify-center text-white text-xs">
                  SM - 8px
                </div>
                <div className="w-24 h-10 bg-blue-500 rounded-md flex items-center justify-center text-white text-xs">
                  MD - 12px
                </div>
                <div className="w-24 h-10 bg-blue-500 rounded-lg flex items-center justify-center text-white text-xs">
                  LG - 16px
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Cards Section */}
        <div className="card padding-lg margin-lg">
          <h2 className="text-h2 mb-6">Cards</h2>
          <div className="flex flex-col md:flex-row gap-6">
            <div className="card padding-md flex-1 hover:shadow-md transition-shadow duration-200">
              <h3 className="text-h3 mb-4">Basic Card</h3>
              <p className="text-body2 text-secondary">
                This is a basic card component with subtle shadow and rounded corners.
              </p>
            </div>
            <div className="card padding-md flex-1 hover:shadow-md transition-shadow duration-200">
              <h3 className="text-h3 mb-4">Interactive Card</h3>
              <p className="text-body2 text-secondary mb-4">
                This card has hover effects and interactive elements.
              </p>
              <button className="btn btn-primary px-4 py-2 text-sm">
                Action
              </button>
            </div>
            <div className="card padding-md flex-1 hover:shadow-md transition-shadow duration-200">
              <h3 className="text-h3 mb-4">Content Card</h3>
              <p className="text-body2 text-secondary">
                Cards can contain various types of content including text, images, and actions.
              </p>
            </div>
          </div>
        </div>

        {/* Layout Section */}
        <div className="card padding-lg margin-lg">
          <h2 className="text-h2 mb-6">Layout</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <h4 className="text-h3 mb-2">Grid Item 1</h4>
              <p className="text-body2 text-secondary">Responsive grid layout</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <h4 className="text-h3 mb-2">Grid Item 2</h4>
              <p className="text-body2 text-secondary">Adapts to screen size</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <h4 className="text-h3 mb-2">Grid Item 3</h4>
              <p className="text-body2 text-secondary">Mobile-first design</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DesignSystemPage; 