import React, { useState } from 'react';
import AddressAutocomplete from './AddressAutocomplete';

export default function AddressAutocompleteDemo() {
  const [address, setAddress] = useState('');
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null);

  return (
    <div className="p-6 max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4">Address Autocomplete Demo</h2>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Try typing an address:
        </label>
        <AddressAutocomplete
          value={address}
          onChange={setAddress}
          onCoordinatesSelect={setCoordinates}
          placeholder="Start typing an address..."
        />
      </div>

      {address && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-medium text-gray-900 mb-2">Selected Address:</h3>
          <p className="text-sm text-gray-700 mb-2">{address}</p>
          
          {coordinates && (
            <div>
              <h4 className="font-medium text-gray-900 mb-1">Coordinates:</h4>
              <p className="text-sm text-gray-600">
                Latitude: {coordinates.lat.toFixed(6)}<br />
                Longitude: {coordinates.lng.toFixed(6)}
              </p>
            </div>
          )}
        </div>
      )}

      <div className="mt-6 text-sm text-gray-600">
        <h4 className="font-medium mb-2">Features:</h4>
        <ul className="list-disc list-inside space-y-1">
          <li>Real-time address suggestions as you type</li>
          <li>Keyboard navigation (arrow keys, enter, escape)</li>
          <li>Debounced API calls to prevent spam</li>
          <li>Automatic coordinate extraction</li>
          <li>Focused on NYC area addresses</li>
          <li>Loading indicators and error handling</li>
        </ul>
      </div>
    </div>
  );
} 