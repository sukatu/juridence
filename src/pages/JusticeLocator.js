import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  MapPin, 
  Search, 
  Filter, 
  List, 
  Map, 
  Phone, 
  Mail, 
  Globe, 
  Navigation,
  Building2,
  ChevronDown,
  ChevronUp,
  X,
  AlertCircle
} from 'lucide-react';

const JusticeLocator = () => {
  const [courts, setCourts] = useState([]);
  const [filteredCourts, setFilteredCourts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCourt, setSelectedCourt] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState('list'); // 'map', 'list', or 'iframe'
  
  const [map, setMap] = useState(null);
  const [markers, setMarkers] = useState([]);
  const [mapsAvailable, setMapsAvailable] = useState(false);
  const mapRef = useRef(null);

  // Filters
  const [filters, setFilters] = useState({
    courtType: '',
    region: '',
    city: '',
    hasLocation: true
  });

  const [regions, setRegions] = useState([]);
  const [cities, setCities] = useState([]);
  const [courtTypes, setCourtTypes] = useState([]);

  // Load courts data
  const loadCourts = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        ...(filters.courtType && { court_type: filters.courtType }),
        ...(filters.region && { region: filters.region }),
        ...(filters.city && { city: filters.city }),
        is_active: 'true'
      });

      const response = await fetch(`/api/courts/?${params}`);
      if (response.ok) {
        const data = await response.json();
        setCourts(data.courts);
        setFilteredCourts(data.courts);
        
        // Initialize map if we have courts with coordinates
        const courtsWithCoords = data.courts.filter(court => court.latitude && court.longitude);
        if (courtsWithCoords.length > 0) {
          initializeMap(courtsWithCoords);
        }
      }
    } catch (error) {
      console.error('Error loading courts:', error);
    } finally {
      setLoading(false);
    }
  }, [filters.courtType, filters.region, filters.city]);

  // Load filter options
  const loadFilterOptions = async () => {
    try {
      const [regionsRes, citiesRes, typesRes] = await Promise.all([
        fetch('/api/courts/regions'),
        fetch('/api/courts/cities'),
        fetch('/api/courts/types')
      ]);

      if (regionsRes.ok) {
        const regionsData = await regionsRes.json();
        setRegions(regionsData);
      }

      if (citiesRes.ok) {
        const citiesData = await citiesRes.json();
        setCities(citiesData);
      }

      if (typesRes.ok) {
        const typesData = await typesRes.json();
        setCourtTypes(typesData);
      }
    } catch (error) {
      console.error('Error loading filter options:', error);
    }
  };

  // Initialize Google Maps
  const initializeMap = (courtsData, bounds = null) => {
    const debugInfo = {
      mapRefExists: !!mapRef.current,
      googleLoaded: !!window.google,
      googleMapsLoaded: !!(window.google && window.google.maps),
      courtsDataLength: courtsData?.length
    };
    
    if (!mapRef.current || !window.google || !window.google.maps) {
      return;
    }

    // Calculate bounds from courts data if not provided
    let mapCenter = { lat: 5.6037, lng: -0.1870 }; // Default to Accra, Ghana
    let mapZoom = 10;

    if (courtsData.length > 0) {
      const validCourts = courtsData.filter(court => court.latitude && court.longitude);
      if (validCourts.length > 0) {
        const lats = validCourts.map(court => court.latitude);
        const lngs = validCourts.map(court => court.longitude);
        
        const bounds = {
          north: Math.max(...lats),
          south: Math.min(...lats),
          east: Math.max(...lngs),
          west: Math.min(...lngs)
        };
        
        mapCenter = {
          lat: bounds.north - (bounds.north - bounds.south) / 2,
          lng: bounds.west + (bounds.east - bounds.west) / 2
        };
        
        // Adjust zoom based on bounds
        const latDiff = bounds.north - bounds.south;
        const lngDiff = bounds.east - bounds.west;
        const maxDiff = Math.max(latDiff, lngDiff);
        
        if (maxDiff > 1) mapZoom = 8;
        else if (maxDiff > 0.5) mapZoom = 9;
        else if (maxDiff > 0.1) mapZoom = 11;
        else mapZoom = 12;
      }
    }

    
    let mapInstance;
    try {
      mapInstance = new window.google.maps.Map(mapRef.current, {
        center: mapCenter,
        zoom: mapZoom,
        styles: [
          {
            featureType: 'poi',
            elementType: 'labels',
            stylers: [{ visibility: 'off' }]
          }
        ]
      });

      setMap(mapInstance);
    } catch (error) {
      console.error('Error creating Google Map:', error);
      return;
    }

    // Add markers for each court
    const newMarkers = courtsData.map(court => {
      if (!court.latitude || !court.longitude) return null;

      const marker = new window.google.maps.Marker({
        position: { lat: court.latitude, lng: court.longitude },
        map: mapInstance,
        title: court.name,
        icon: {
          url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
            <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
              <circle cx="16" cy="16" r="12" fill="#3B82F6" stroke="#ffffff" stroke-width="2"/>
              <path d="M16 8l-4 8h8l-4-8z" fill="#ffffff"/>
            </svg>
          `)}`,
          scaledSize: new window.google.maps.Size(32, 32),
          anchor: new window.google.maps.Point(16, 16)
        }
      });

      // Add click listener
      marker.addListener('click', () => {
        setSelectedCourt(court);
      });

      return marker;
    }).filter(Boolean);

    setMarkers(newMarkers);

    // Fit map to show all markers
    if (newMarkers.length > 0) {
      const bounds = new window.google.maps.LatLngBounds();
      newMarkers.forEach(marker => bounds.extend(marker.getPosition()));
      mapInstance.fitBounds(bounds);
    }
  };

  // Load Google Maps script
  useEffect(() => {
    const loadGoogleMapsAPI = async () => {
      try {
        // Fetch API key from backend
        const response = await fetch('/api/admin/google-maps-api-key');
        if (!response.ok) {
          throw new Error('Failed to fetch Google Maps API key');
        }
        
        const data = await response.json();
        const apiKey = data.api_key;
        
        if (!apiKey) {
          console.warn('Google Maps API key not configured. Map functionality will be limited.');
          setMapsAvailable(false);
          // Load data without map
          loadCourts();
          loadFilterOptions();
          return;
        }

        const loadGoogleMaps = () => {
      if (!window.google) {
        
        // Test the API key first
        fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=Accra,Ghana&key=${apiKey}`)
          .then(response => response.json())
          .then(data => {
            if (data.status === 'OK') {
              const script = document.createElement('script');
              script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
              script.async = true;
              script.defer = true;
              script.onload = () => {
                // Add a small delay to ensure Google Maps is fully initialized
                setTimeout(() => {
                  if (window.google && window.google.maps) {
                    setMapsAvailable(true);
                    loadCourts();
                    loadFilterOptions();
                  } else {
                    console.error('Google Maps API script loaded but window.google.maps is not available');
                    setMapsAvailable(false);
                    loadCourts();
                    loadFilterOptions();
                  }
                }, 500);
              };
              script.onerror = (error) => {
                console.error('Failed to load Google Maps API script:', error);
                setMapsAvailable(false);
                loadCourts();
                loadFilterOptions();
              };
              document.head.appendChild(script);
            } else {
              console.error('Google Maps API key is invalid:', data.status, data.error_message);
              setMapsAvailable(false);
              loadCourts();
              loadFilterOptions();
            }
          })
          .catch(error => {
            console.error('Error testing Google Maps API key:', error);
            setMapsAvailable(false);
            loadCourts();
            loadFilterOptions();
          });
      } else {
        setMapsAvailable(true);
        loadCourts();
        loadFilterOptions();
      }
    };

        // Try to load Google Maps
        loadGoogleMaps();

        // Fallback: try again after 2 seconds if not loaded
        const fallbackTimer = setTimeout(() => {
          if (!window.google || !window.google.maps) {
            loadGoogleMaps();
          }
        }, 2000);

        return () => {
          clearTimeout(fallbackTimer);
        };
      } catch (error) {
        console.error('Error loading Google Maps API:', error);
        setMapsAvailable(false);
        // Load data without map
        loadCourts();
        loadFilterOptions();
      }
    };

    // Load the Google Maps API
    loadGoogleMapsAPI();
  }, []);

  // Filter courts based on search and filters
  useEffect(() => {
    let filtered = courts;

    // Text search
    if (searchQuery) {
      filtered = filtered.filter(court =>
        court.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        court.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        court.region.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (court.address && court.address.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Apply filters
    if (filters.courtType) {
      filtered = filtered.filter(court => court.court_type === filters.courtType);
    }
    if (filters.region) {
      filtered = filtered.filter(court => court.region === filters.region);
    }
    if (filters.city) {
      filtered = filtered.filter(court => court.city === filters.city);
    }
    if (filters.hasLocation) {
      filtered = filtered.filter(court => court.latitude && court.longitude);
    }

    setFilteredCourts(filtered);

    // Update map markers
    if (map && markers.length > 0) {
      markers.forEach(marker => {
        const court = filtered.find(c => 
          c.latitude === marker.getPosition().lat() && 
          c.longitude === marker.getPosition().lng()
        );
        marker.setVisible(!!court);
      });
    }
  }, [searchQuery, filters, courts, map, markers]);

  // Load courts on mount
  useEffect(() => {
    loadCourts();
    loadFilterOptions();
  }, []);

  // Initialize map when view mode changes to map and we have courts data
  useEffect(() => {
    const debugInfo = {
      viewMode,
      mapsAvailable,
      googleLoaded: !!window.google,
      googleMapsLoaded: !!(window.google && window.google.maps),
      courtsCount: courts.length
    };
    
    if (viewMode === 'map' && mapsAvailable && courts.length > 0) {
      const courtsWithCoords = courts.filter(court => court.latitude && court.longitude);
      if (courtsWithCoords.length > 0) {
        // Check if Google Maps is ready, if not, retry after a short delay
        if (window.google && window.google.maps) {
          initializeMap(courtsWithCoords);
        } else {
          setTimeout(() => {
            if (window.google && window.google.maps) {
              initializeMap(courtsWithCoords);
            } else {
              console.error('Google Maps still not available after retry');
            }
          }, 500);
        }
      }
    }
  }, [viewMode, mapsAvailable, courts]);

  // Get directions
  const getDirections = (court) => {
    if (court.latitude && court.longitude) {
      const url = `https://www.google.com/maps/dir/?api=1&destination=${court.latitude},${court.longitude}`;
      window.open(url, '_blank');
    }
  };

  // Get court type color
  const getCourtTypeColor = (type) => {
    const colors = {
      'Supreme Court': 'bg-purple-100 text-purple-800',
      'High Court': 'bg-blue-100 text-blue-800',
      'Circuit Court': 'bg-green-100 text-green-800',
      'District Court': 'bg-yellow-100 text-yellow-800',
      'Commercial Court': 'bg-indigo-100 text-indigo-800',
      'Family Court': 'bg-pink-100 text-pink-800',
      'Labour Court': 'bg-orange-100 text-orange-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Courts</h1>
          <p className="text-slate-600">Find courts and legal institutions across Ghana</p>
        </div>

        {/* Google Maps API Warning */}
        {!mapsAvailable && (
          <div className="mb-6 bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <AlertCircle className="h-5 w-5 text-amber-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-amber-800">
                  Map functionality limited
                </h3>
                <div className="mt-2 text-sm text-amber-700">
                  <p>
                    Google Maps API key is not configured. Map view is disabled, but you can still browse courts in list view.
                    <a 
                      href="/JUSTICE_LOCATOR_SETUP.md" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="ml-1 font-medium underline hover:text-amber-600"
                    >
                      View setup instructions
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search courts by name, location, or region..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg"
              >
                <Filter className="h-4 w-4" />
                Filters
                {showFilters ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>
              <div className="flex items-center bg-slate-100 rounded-lg p-1" style={{ pointerEvents: 'auto' }}>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-md transition-colors cursor-pointer ${
                    viewMode === 'list' ? 'bg-white shadow-sm' : 'hover:bg-slate-200'
                  }`}
                  style={{ pointerEvents: 'auto' }}
                  title="List view"
                >
                  <List className="h-4 w-4" />
                </button>
                <button
                  onClick={() => {
                    setViewMode('map');
                  }}
                  disabled={!mapsAvailable}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'map' ? 'bg-white shadow-sm' : 'hover:bg-slate-200'
                  } ${!mapsAvailable ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                  title={!mapsAvailable ? 'Google Maps API key not configured' : 'Interactive Map view'}
                  style={{ pointerEvents: mapsAvailable ? 'auto' : 'none' }}
                >
                  <Map className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('iframe')}
                  className={`p-2 rounded-md transition-colors cursor-pointer ${
                    viewMode === 'iframe' ? 'bg-white shadow-sm' : 'hover:bg-slate-200'
                  }`}
                  style={{ pointerEvents: 'auto' }}
                  title="Google Maps Locator Plus"
                >
                  <MapPin className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {showFilters && (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4">
              <select
                value={filters.courtType}
                onChange={(e) => setFilters({...filters, courtType: e.target.value})}
                className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Court Types</option>
                {courtTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
              <select
                value={filters.region}
                onChange={(e) => setFilters({...filters, region: e.target.value})}
                className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Regions</option>
                {regions.map(region => (
                  <option key={region} value={region}>{region}</option>
                ))}
              </select>
              <select
                value={filters.city}
                onChange={(e) => setFilters({...filters, city: e.target.value})}
                className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Cities</option>
                {cities.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.hasLocation}
                  onChange={(e) => setFilters({...filters, hasLocation: e.target.checked})}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-slate-700">With Map Location</span>
              </label>
            </div>
          )}
        </div>

        {/* Results */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Map/List/Iframe View */}
          <div className={`${viewMode === 'map' || viewMode === 'iframe' ? 'lg:col-span-2' : 'lg:col-span-3'}`}>
            {viewMode === 'map' ? (
              <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
                {mapsAvailable ? (
                  <div className="h-96 w-full" ref={mapRef}></div>
                ) : (
                  <div className="h-96 w-full flex items-center justify-center bg-slate-50">
                    <div className="text-center">
                      <Map className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-slate-900 mb-2">Map View Unavailable</h3>
                      <p className="text-slate-500 mb-4">
                        Google Maps API key is not configured. Please set up your API key to enable map functionality.
                      </p>
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left max-w-md">
                        <h4 className="font-medium text-blue-900 mb-2">To enable map functionality:</h4>
                        <ol className="text-sm text-blue-800 space-y-1">
                          <li>1. Get a Google Maps API key from Google Cloud Console</li>
                          <li>2. Create a <code className="bg-blue-100 px-1 rounded">.env</code> file in the project root</li>
                          <li>3. Add: <code className="bg-blue-100 px-1 rounded">REACT_APP_GOOGLE_MAPS_API_KEY=your_api_key_here</code></li>
                          <li>4. Restart the development server</li>
                        </ol>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : viewMode === 'iframe' ? (
              <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
                <div className="h-96 w-full">
                  <iframe 
                    src="https://storage.googleapis.com/maps-solutions-youqs5ej1f/locator-plus/fxor/locator-plus.html"
                    width="100%" 
                    height="100%"
                    style={{border: 0}}
                    loading="lazy"
                    title="Google Maps Locator Plus"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {loading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-2 text-slate-500">Loading courts...</p>
                  </div>
                ) : filteredCourts.length === 0 ? (
                  <div className="text-center py-12">
                    <Building2 className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-slate-900 mb-2">No courts found</h3>
                    <p className="text-slate-500">Try adjusting your search criteria or filters</p>
                  </div>
                ) : (
                  filteredCourts.map((court) => (
                    <div
                      key={court.id}
                      className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => setSelectedCourt(court)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-slate-900">{court.name}</h3>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCourtTypeColor(court.court_type)}`}>
                              {court.court_type}
                            </span>
                          </div>
                          {court.registry_name && (
                            <p className="text-sm text-slate-600 mb-2">{court.registry_name}</p>
                          )}
                          <div className="flex items-center text-slate-600 mb-2">
                            <MapPin className="h-4 w-4 mr-1" />
                            <span>{court.location}, {court.region}</span>
                          </div>
                          {court.address && (
                            <p className="text-sm text-slate-500 mb-3">{court.address}</p>
                          )}
                          <div className="flex items-center gap-4 text-sm text-slate-500">
                            {court.contact_phone && (
                              <div className="flex items-center">
                                <Phone className="h-3 w-3 mr-1" />
                                {court.contact_phone}
                              </div>
                            )}
                            {court.contact_email && (
                              <div className="flex items-center">
                                <Mail className="h-3 w-3 mr-1" />
                                {court.contact_email}
                              </div>
                            )}
                            {court.website && (
                              <div className="flex items-center">
                                <Globe className="h-3 w-3 mr-1" />
                                Website
                              </div>
                            )}
                          </div>
                        </div>
                        {court.latitude && court.longitude && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              getDirections(court);
                            }}
                            className="flex items-center gap-1 px-3 py-1 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg"
                          >
                            <Navigation className="h-3 w-3" />
                            Directions
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Court Details Sidebar */}
          {selectedCourt && (
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 sticky top-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-slate-900">Court Details</h3>
                  <button
                    onClick={() => setSelectedCourt(null)}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-slate-900">{selectedCourt.name}</h4>
                    {selectedCourt.registry_name && (
                      <p className="text-sm text-slate-600">{selectedCourt.registry_name}</p>
                    )}
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-2 ${getCourtTypeColor(selectedCourt.court_type)}`}>
                      {selectedCourt.court_type}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-slate-600">
                      <MapPin className="h-4 w-4 mr-2" />
                      <span>{selectedCourt.location}, {selectedCourt.region}</span>
                    </div>
                    {selectedCourt.address && (
                      <div className="text-sm text-slate-600">
                        <strong>Address:</strong> {selectedCourt.address}
                      </div>
                    )}
                    {selectedCourt.area_coverage && (
                      <div className="text-sm text-slate-600">
                        <strong>Jurisdiction:</strong> {selectedCourt.area_coverage}
                      </div>
                    )}
                  </div>

                  {(selectedCourt.contact_phone || selectedCourt.contact_email || selectedCourt.website) && (
                    <div className="space-y-2">
                      <h5 className="font-medium text-slate-900">Contact Information</h5>
                      {selectedCourt.contact_phone && (
                        <div className="flex items-center text-sm text-slate-600">
                          <Phone className="h-4 w-4 mr-2" />
                          <a href={`tel:${selectedCourt.contact_phone}`} className="hover:text-blue-600">
                            {selectedCourt.contact_phone}
                          </a>
                        </div>
                      )}
                      {selectedCourt.contact_email && (
                        <div className="flex items-center text-sm text-slate-600">
                          <Mail className="h-4 w-4 mr-2" />
                          <a href={`mailto:${selectedCourt.contact_email}`} className="hover:text-blue-600">
                            {selectedCourt.contact_email}
                          </a>
                        </div>
                      )}
                      {selectedCourt.website && (
                        <div className="flex items-center text-sm text-slate-600">
                          <Globe className="h-4 w-4 mr-2" />
                          <a href={selectedCourt.website} target="_blank" rel="noopener noreferrer" className="hover:text-blue-600">
                            Visit Website
                          </a>
                        </div>
                      )}
                    </div>
                  )}

                  {selectedCourt.latitude && selectedCourt.longitude && (
                    <div className="pt-4 border-t border-slate-200">
                      <button
                        onClick={() => getDirections(selectedCourt)}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        <Navigation className="h-4 w-4" />
                        Get Directions
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Results Summary */}
        <div className="mt-6 text-center text-sm text-slate-500">
          Showing {filteredCourts.length} of {courts.length} courts
        </div>
      </div>
    </div>
  );
};

export default JusticeLocator;
