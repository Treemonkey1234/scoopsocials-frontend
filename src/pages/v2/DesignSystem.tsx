import React, { useState } from 'react';
import Button from '../../components-v2/common/Button';
import Card from '../../components-v2/common/Card';
import Input from '../../components-v2/common/Input';


const DesignSystem: React.FC = () => {
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
        <Card className="mb-8">
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
        </Card>

        {/* Typography Section */}
        <Card className="mb-8">
          <h2 className="text-h2 mb-6">Typography</h2>
          <div className="flex flex-col gap-4">
            <h1 className="text-h1">Heading 1 - 2rem</h1>
            <h2 className="text-h2">Heading 2 - 1.5rem</h2>
            <h3 className="text-h3">Heading 3 - 1.25rem</h3>
            <p className="text-body1">Body 1 - 1rem</p>
            <p className="text-body2">Body 2 - 0.875rem</p>
          </div>
        </Card>

        {/* Buttons Section */}
        <Card className="mb-8">
          <h2 className="text-h2 mb-6">Buttons</h2>
          
          {/* Button Variants */}
          <div className="mb-8">
            <h3 className="text-h3 mb-4">Variants</h3>
            <div className="flex gap-4 flex-wrap">
              <Button variant="primary">Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="text">Text</Button>
            </div>
          </div>

          {/* Button Sizes */}
          <div className="mb-8">
            <h3 className="text-h3 mb-4">Sizes</h3>
            <div className="flex gap-4 items-center flex-wrap">
              <Button variant="primary" size="small">Small</Button>
              <Button variant="primary" size="medium">Medium</Button>
              <Button variant="primary" size="large">Large</Button>
            </div>
          </div>

          {/* Button States */}
          <div>
            <h3 className="text-h3 mb-4">States</h3>
            <div className="flex gap-4 flex-wrap">
              <Button variant="primary">Normal</Button>
              <Button variant="primary" disabled>
                Disabled
              </Button>
            </div>
          </div>
        </Card>

        {/* Inputs Section */}
        <Card className="mb-8">
          <h2 className="text-h2 mb-6">Inputs</h2>
          
          {/* Input Sizes */}
          <div className="mb-8">
            <h3 className="text-h3 mb-4">Sizes</h3>
            <div className="flex flex-col gap-4 max-w-md">
              <Input 
                size="small" 
                placeholder="Small input"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
              />
              <Input 
                size="medium" 
                placeholder="Medium input"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
              />
              <Input 
                size="large" 
                placeholder="Large input"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
              />
            </div>
          </div>

          {/* Input States */}
          <div>
            <h3 className="text-h3 mb-4">States</h3>
            <div className="flex flex-col gap-4 max-w-md">
              <Input 
                placeholder="Normal input"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
              />
              <Input 
                placeholder="Disabled input"
                disabled
              />
              <Input 
                placeholder="Error input"
                error
                helperText="This field is required"
              />
            </div>
          </div>
        </Card>

        {/* Spacing Section */}
        <Card className="mb-8">
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
        </Card>

        {/* Cards Section */}
        <Card className="mb-8">
          <h2 className="text-h2 mb-6">Cards</h2>
          <div className="flex flex-col md:flex-row gap-6">
            <Card className="flex-1" hoverable>
              <h3 className="text-h3 mb-4">Basic Card</h3>
              <p className="text-body2 text-secondary">
                This is a basic card component with subtle shadow and rounded corners.
              </p>
            </Card>
            <Card className="flex-1" hoverable>
              <h3 className="text-h3 mb-4">Interactive Card</h3>
              <p className="text-body2 text-secondary mb-4">
                This card has hover effects and interactive elements.
              </p>
              <Button variant="primary" size="small">
                Action
              </Button>
            </Card>
            <Card className="flex-1" hoverable>
              <h3 className="text-h3 mb-4">Content Card</h3>
              <p className="text-body2 text-secondary">
                Cards can contain various types of content including text, images, and actions.
              </p>
            </Card>
          </div>
        </Card>

        {/* Layout Section */}
        <Card className="mb-8">
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
        </Card>
      </div>
    </div>
  );
};

export default DesignSystem; 
