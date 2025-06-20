import React, { useState, useEffect, useRef } from 'react';

interface AddressSuggestion {
  display_name: string;
  lat: string;
  lon: string;
  type: string;
}

interface Coordinates {
  lat: number;
  lng: number;
}

interface AddressAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onCoordinatesSelect?: (coords: Coordinates) => void;
  placeholder?: string;
  className?: string;
  required?: boolean;
}

export default function AddressAutocomplete({ 
  value, 
  onChange, 
  onCoordinatesSelect,
  placeholder = "Enter address", 
  className = "",
  required = false 
}: AddressAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Debounce function to limit API calls
  const debounce = (func: Function, delay: number) => {
    let timeoutId: NodeJS.Timeout;
    return (...args: any[]) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func.apply(null, args), delay);
    };
  };

  // Fetch address suggestions from OpenStreetMap Nominatim API
  const fetchSuggestions = async (query: string) => {
    if (!query || query.length < 3) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    try {
      // Remove country restriction to allow worldwide addresses
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1&bounded=0`
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Filter out results that don't have proper coordinates
      const validSuggestions = data.filter((item: any) => 
        item.lat && item.lon && 
        !isNaN(parseFloat(item.lat)) && 
        !isNaN(parseFloat(item.lon))
      );
      
      setSuggestions(validSuggestions);
    } catch (error) {
      console.error('Error fetching address suggestions:', error);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Debounced version of fetchSuggestions
  const debouncedFetchSuggestions = useRef(
    debounce(fetchSuggestions, 300)
  ).current;

  useEffect(() => {
    debouncedFetchSuggestions(value);
  }, [value, debouncedFetchSuggestions]);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && suggestions[selectedIndex]) {
          selectSuggestion(suggestions[selectedIndex]);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  const selectSuggestion = (suggestion: AddressSuggestion) => {
    console.log('AddressAutocomplete: Selected suggestion:', suggestion);
    onChange(suggestion.display_name);
    
    // If coordinates callback is provided, pass the coordinates
    if (onCoordinatesSelect) {
      const lat = parseFloat(suggestion.lat);
      const lng = parseFloat(suggestion.lon);
      
      console.log('AddressAutocomplete: Parsed coordinates:', { lat, lng });
      
      // Validate coordinates before passing them
      if (!isNaN(lat) && !isNaN(lng) && 
          lat >= -90 && lat <= 90 && 
          lng >= -180 && lng <= 180) {
        console.log('AddressAutocomplete: Valid coordinates, calling callback');
        onCoordinatesSelect({
          lat: lat,
          lng: lng
        });
      } else {
        console.warn('AddressAutocomplete: Invalid coordinates received:', suggestion.lat, suggestion.lon);
      }
    } else {
      console.log('AddressAutocomplete: No onCoordinatesSelect callback provided');
    }
    
    setShowSuggestions(false);
    setSelectedIndex(-1);
    setSuggestions([]);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    setShowSuggestions(true);
    setSelectedIndex(-1);
  };

  const handleInputFocus = () => {
    if (suggestions.length > 0) {
      setShowSuggestions(true);
    }
  };

  const handleInputBlur = () => {
    // Delay hiding suggestions to allow for clicks
    setTimeout(() => {
      setShowSuggestions(false);
      setSelectedIndex(-1);
    }, 200);
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        inputRef.current && 
        !inputRef.current.contains(event.target as Node) &&
        suggestionsRef.current && 
        !suggestionsRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={handleInputChange}
        onFocus={handleInputFocus}
        onBlur={handleInputBlur}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        required={required}
        className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent ${className}`}
      />
      
      {/* Loading indicator */}
      {isLoading && (
        <div className="absolute right-3 top-2.5">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-500"></div>
        </div>
      )}

      {/* Suggestions dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto"
        >
          {suggestions.map((suggestion, index) => (
            <div
              key={`${suggestion.lat}-${suggestion.lon}`}
              className={`px-3 py-2 cursor-pointer hover:bg-gray-50 transition-colors ${
                index === selectedIndex ? 'bg-purple-50 text-purple-700' : ''
              }`}
              onClick={() => selectSuggestion(suggestion)}
            >
              <div className="text-sm font-medium text-gray-900">
                {suggestion.display_name.split(',')[0]}
              </div>
              <div className="text-xs text-gray-500">
                {suggestion.display_name.split(',').slice(1).join(',')}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* No results message */}
      {showSuggestions && !isLoading && suggestions.length === 0 && value.length >= 3 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg">
          <div className="px-3 py-2 text-sm text-gray-500">
            No addresses found. Try a different search term.
          </div>
        </div>
      )}
    </div>
  );
} 