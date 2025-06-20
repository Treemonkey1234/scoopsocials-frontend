// Mapbox Loader Script
// This script loads Mapbox GL JS from CDN when npm dependencies are not available

(function() {
  // Check if mapboxgl is already loaded
  if (window.mapboxgl) {
    return;
  }

  // Load Mapbox CSS
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = 'https://api.mapbox.com/mapbox-gl-js/v3.13.0/mapbox-gl.css';
  document.head.appendChild(link);

  // Load Mapbox JS
  const script = document.createElement('script');
  script.src = 'https://api.mapbox.com/mapbox-gl-js/v3.13.0/mapbox-gl.js';
  script.onload = function() {
    console.log('Mapbox GL JS loaded successfully');
    // Dispatch custom event to notify components
    window.dispatchEvent(new CustomEvent('mapboxLoaded'));
  };
  script.onerror = function() {
    console.error('Failed to load Mapbox GL JS');
  };
  document.head.appendChild(script);
})(); 