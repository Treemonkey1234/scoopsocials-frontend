# Scoop Socials Design System V2

## Overview
This document describes the implementation of the new design system for Scoop Socials V2. The design system is built with a mobile-first approach and follows modern design principles.

## Directory Structure
```
src/
├── components-v2/          # New design components
│   ├── common/            # Shared components
│   │   ├── Button.tsx     # Button component
│   │   ├── Card.tsx       # Card component
│   │   └── Input.tsx      # Input component
│   ├── layout/            # Layout components (to be implemented)
│   ├── features/          # Feature-specific components (to be implemented)
│   └── index.ts           # Component exports
├── themes/v2/             # Theme configuration
│   └── theme.ts           # Material-UI theme (optional)
├── styles/v2/             # Global styles
│   └── base.css           # CSS variables and utilities
└── pages/v2/              # Design system pages
    └── DesignSystem.tsx   # Design system showcase
```

## Design Tokens

### Colors
- **Primary**: `#00B6FF` (Vibrant Sky Blue)
- **Primary Light**: `#33C4FF`
- **Primary Dark**: `#0080B3`
- **Secondary**: `#FFFFFF`
- **Secondary Light**: `#F5F5F5`
- **Secondary Dark**: `#EEEEEE`
- **Text Primary**: `#1A1A1A`
- **Text Secondary**: `#666666`
- **Background**: `#F5F5F5`
- **Background Paper**: `#FFFFFF`

### Typography
- **Font Family**: "Inter", "Roboto", "Helvetica", "Arial", sans-serif
- **H1**: 2rem (32px)
- **H2**: 1.5rem (24px)
- **H3**: 1.25rem (20px)
- **Body1**: 1rem (16px)
- **Body2**: 0.875rem (14px)

### Spacing
- **XS**: 4px
- **SM**: 8px
- **MD**: 16px
- **LG**: 24px
- **XL**: 32px

### Border Radius
- **SM**: 8px
- **MD**: 12px
- **LG**: 16px
- **XL**: 25px (buttons)

### Shadows
- **SM**: 0px 2px 8px rgba(0, 0, 0, 0.05)
- **MD**: 0px 4px 12px rgba(0, 0, 0, 0.08)
- **LG**: 0px 8px 16px rgba(0, 0, 0, 0.12)

## Components

### Button
A versatile button component with multiple variants and sizes.

```tsx
import { Button } from '../components-v2';

<Button variant="primary" size="medium" onClick={handleClick}>
  Click Me
</Button>
```

**Props:**
- `variant`: 'primary' | 'secondary' | 'outline' | 'text'
- `size`: 'small' | 'medium' | 'large'
- `disabled`: boolean
- `fullWidth`: boolean
- `onClick`: function

### Card
A container component for content with optional hover effects.

```tsx
import { Card } from '../components-v2';

<Card hoverable padding="md" onClick={handleClick}>
  <h3>Card Title</h3>
  <p>Card content goes here</p>
</Card>
```

**Props:**
- `hoverable`: boolean
- `padding`: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
- `onClick`: function
- `className`: string

### Input
A form input component with various states and sizes.

```tsx
import { Input } from '../components-v2';

<Input 
  type="text"
  placeholder="Enter text"
  size="medium"
  error={hasError}
  helperText="Error message"
  onChange={handleChange}
/>
```

**Props:**
- `type`: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url'
- `size`: 'small' | 'medium' | 'large'
- `error`: boolean
- `helperText`: string
- `disabled`: boolean
- `value`: string
- `onChange`: function

## CSS Classes

The design system provides utility classes for common styling needs:

### Typography
- `.text-h1`, `.text-h2`, `.text-h3`
- `.text-body1`, `.text-body2`
- `.text-primary`, `.text-secondary`, `.text-brand`

### Spacing
- `.margin-xs`, `.margin-sm`, `.margin-md`, `.margin-lg`, `.margin-xl`
- `.padding-xs`, `.padding-sm`, `.padding-md`, `.padding-lg`, `.padding-xl`

### Layout
- `.container` - Responsive container
- `.card` - Card styling
- `.btn`, `.btn-primary`, `.btn-secondary`, `.btn-outline`
- `.input` - Input styling

### Utilities
- `.flex`, `.flex-col`, `.flex-row`
- `.items-center`, `.justify-center`, `.justify-between`
- `.w-full`, `.h-full`
- `.rounded-sm`, `.rounded-md`, `.rounded-lg`, `.rounded-xl`
- `.shadow-sm`, `.shadow-md`, `.shadow-lg`

## Usage

### Viewing the Design System
Navigate to `/design-system` to see all components and design tokens in action.

### Importing Components
```tsx
import { Button, Card, Input } from '../components-v2';
```

### Using CSS Classes
```tsx
<div className="card padding-md margin-lg">
  <h2 className="text-h2 text-primary">Title</h2>
  <p className="text-body1 text-secondary">Content</p>
</div>
```

## Implementation Strategy

1. **Phase 1**: ✅ Core components (Button, Card, Input)
2. **Phase 2**: Layout components (Header, Navigation, Container)
3. **Phase 3**: Feature components (PostCard, EventCard, ProfileHeader)
4. **Phase 4**: Apply to existing pages
5. **Phase 5**: Add Material-UI integration (optional)

## Browser Support
- Modern browsers with CSS Grid and Flexbox support
- Mobile-first responsive design
- Progressive enhancement approach

## Future Enhancements
- Dark mode support
- Animation library integration
- Icon system
- Advanced form components
- Data visualization components
- Accessibility improvements

## Contributing
When adding new components:
1. Follow the existing naming conventions
2. Include TypeScript interfaces
3. Add to the design system showcase
4. Update this documentation
5. Test across different screen sizes 