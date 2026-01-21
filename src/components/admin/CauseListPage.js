import React, { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown, Bell, ChevronRight, Plus } from 'lucide-react';
import CauseListDrawer from './CauseListDrawer';
import AddRegistryForm from '../AddRegistryForm';
import AddJudgeForm from '../AddJudgeForm';
import AddCourtForm from '../AddCourtForm';
import AddCasesToCauseListPage from '../AddCasesToCauseListPage';
import RegistryCourtsView from '../RegistryCourtsView';
import JudgesListView from '../JudgesListView';
import AdminHeader from './AdminHeader';
import { apiGet, apiPost } from '../../utils/api';

const CauseListPage = ({ userInfo, onNavigate, onLogout }) => {
  const [selectedCourt, setSelectedCourt] = useState(null);
  const [selectedRegistry, setSelectedRegistry] = useState(null);
  const [showAddRegistryForm, setShowAddRegistryForm] = useState(false);
  const [showAddJudgeForm, setShowAddJudgeForm] = useState(false);
  const [showAddCourtForm, setShowAddCourtForm] = useState(false);
  const [showAddCaseForm, setShowAddCaseForm] = useState(false);
  const [activeCourtContext, setActiveCourtContext] = useState(null);
  const [showCourtsView, setShowCourtsView] = useState(false);
  const [showJudgesView, setShowJudgesView] = useState(false);
  const [viewingRegistry, setViewingRegistry] = useState(null);
  const [judgesViewingRegistry, setJudgesViewingRegistry] = useState(null);
  const [timePeriod, setTimePeriod] = useState('today');
  const [showDrawer, setShowDrawer] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [registrySearchQuery, setRegistrySearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const filterDropdownRef = useRef(null);
  const [registries, setRegistries] = useState([]);
  const [loadingRegistries, setLoadingRegistries] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState('All Regions');
  const [courtsList, setCourtsList] = useState([]);
  const [courtsLoading, setCourtsLoading] = useState(false);
  const [courtsSearchQuery, setCourtsSearchQuery] = useState('');
  const [courtsPage, setCourtsPage] = useState(1);
  const [courtsTotalPages, setCourtsTotalPages] = useState(1);
  const [courtsTotal, setCourtsTotal] = useState(0);
  const [courtsRefreshKey, setCourtsRefreshKey] = useState(0);
  const [viewMode, setViewMode] = useState('list');
  const [mapApiKey, setMapApiKey] = useState('');
  const [mapCourts, setMapCourts] = useState([]);
  const [mapLoading, setMapLoading] = useState(false);
  const [mapError, setMapError] = useState('');
  const [mapCourtType, setMapCourtType] = useState('All Courts');
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const infoWindowRef = useRef(null);
  const courtsPerPage = 20;

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterDropdownRef.current && !filterDropdownRef.current.contains(event.target)) {
        setShowFilterDropdown(false);
      }
    };

    if (showFilterDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showFilterDropdown]);

  const courts = [
    {
      name: 'Supreme Court',
      image: encodeURI('/courts/supreme-court.png')
    },
    {
      name: 'Court of Appeal',
      image: encodeURI('/courts/court-of-appeal.png')
    },
    {
      name: 'High Court',
      image: encodeURI('/courts/high-court.png')
    },
    {
      name: 'Circuit Court',
      image: encodeURI('/courts/circuit-court.png')
    },
    {
      name: 'District Court',
      image: '/courts/district-court.png'
    }
  ];

  const handleCourtClick = (courtName) => {
    setSelectedCourt(courtName);
    setSelectedRegistry(null);
    setShowAddRegistryForm(false);
    setSelectedRegion('All Regions');
    setCourtsSearchQuery('');
    setCourtsPage(1);
  };

  const handleRegionSelect = (regionValue) => {
    setSelectedRegion(regionValue);
    setCourtsPage(1);
  };
  const loadGoogleMapsScript = (apiKey) => {
    if (window.google && window.google.maps) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      const existingScript = document.getElementById('google-maps-script');
      if (existingScript) {
        existingScript.addEventListener('load', resolve);
        existingScript.addEventListener('error', reject);
        return;
      }

      const script = document.createElement('script');
      script.id = 'google-maps-script';
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}`;
      script.async = true;
      script.defer = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Google Maps'));
      document.head.appendChild(script);
    });
  };


  // Fetch registries when a court is selected
  useEffect(() => {
    const fetchRegistries = async () => {
      if (!selectedCourt) {
        setRegistries([]);
        return;
      }

      try {
        setLoadingRegistries(true);
        // Map court names to court types for API (using exact enum values)
        const courtTypeMap = {
          'Supreme Court': 'Supreme Court',
          'Court of Appeal': 'Appeal Court',
          'High Court': 'High Court',
          'Circuit Court': 'Circuit Court',
          'District Court': 'District Court'
        };

        const courtType = courtTypeMap[selectedCourt] || selectedCourt;
        
        // Fetch courts with registry_name as registries
        const response = await apiGet(`/courts/search?court_type=${courtType}&limit=100`);
        
        if (response && response.courts && Array.isArray(response.courts)) {
          // Filter courts that have registry_name and group by registry_name
          const registryMap = new Map();
          response.courts.forEach(court => {
            if (court.registry_name) {
              const registryKey = court.registry_name;
              if (!registryMap.has(registryKey)) {
                registryMap.set(registryKey, {
                  id: court.id,
                  name: court.registry_name,
                  division: court.court_division || `${selectedCourt} (General)`,
                  region: court.region || 'N/A',
                  registryCode: court.registry_code || court.name.substring(0, 4).toUpperCase(),
                  location: court.location || court.address || 'N/A',
                  court_type: court.court_type,
                  courts: []
                });
              }
              registryMap.get(registryKey).courts.push(court);
            }
          });
          
          // If no registries found, try to get unique registry names from courts
          if (registryMap.size === 0) {
            // Create registries from courts that have distinct registry_name or name
            const uniqueRegistries = new Map();
            response.courts.forEach(court => {
              const registryName = court.registry_name || court.name;
              if (!uniqueRegistries.has(registryName)) {
                uniqueRegistries.set(registryName, {
                  id: court.id,
                  name: registryName,
                  division: court.court_division || `${selectedCourt} (General)`,
                  region: court.region || 'N/A',
                  registryCode: court.registry_code || registryName.substring(0, 4).toUpperCase(),
                  location: court.location || court.address || 'N/A',
                  court_type: court.court_type,
                  courts: [court]
                });
              } else {
                uniqueRegistries.get(registryName).courts.push(court);
              }
            });
            setRegistries(Array.from(uniqueRegistries.values()));
          } else {
            setRegistries(Array.from(registryMap.values()));
          }
        } else {
          setRegistries([]);
        }
      } catch (err) {
        console.error('Error fetching registries:', err);
        setRegistries([]);
      } finally {
        setLoadingRegistries(false);
      }
    };

    fetchRegistries();
  }, [selectedCourt]);

  const REGION_OPTIONS = [
    { label: 'All Regions', value: 'All Regions' },
    { label: 'Ahafo (Goaso)', value: 'Ahafo Region' },
    { label: 'Ashanti (Kumasi)', value: 'Ashanti Region' },
    { label: 'Bono (Sunyani)', value: 'Bono Region' },
    { label: 'Bono East (Techiman)', value: 'Bono East Region' },
    { label: 'Central (Cape Coast)', value: 'Central Region' },
    { label: 'Eastern (Koforidua)', value: 'Eastern Region' },
    { label: 'Greater Accra (Accra)', value: 'Greater Accra Region' },
    { label: 'Northern (Tamale)', value: 'Northern Region' },
    { label: 'North East (Nalerigu)', value: 'North-East Region' },
    { label: 'Oti (Dambai)', value: 'Oti Region' },
    { label: 'Savannah (Damongo)', value: 'Savannah Region' },
    { label: 'Upper East (Bolgatanga)', value: 'Upper-East Region' },
    { label: 'Upper West (Wa)', value: 'Upper-West Region' },
    { label: 'Volta (Ho)', value: 'Volta Region' },
    { label: 'Western (Sekondi-Takoradi)', value: 'Western Region' },
    { label: 'Western North (Sefwi Wiawso)', value: 'Western North Region' }
  ];

  useEffect(() => {
    const fetchCourts = async () => {
      try {
        setCourtsLoading(true);
        const params = new URLSearchParams();
        if (courtsSearchQuery.trim()) {
          params.append('query', courtsSearchQuery.trim());
        }
        if (selectedRegion && selectedRegion !== 'All Regions') {
          params.append('region', selectedRegion);
        }
        if (selectedCourt) {
          params.append('court_type', selectedCourt);
        }
        params.append('page', String(courtsPage));
        params.append('limit', String(courtsPerPage));

        const response = await apiGet(`/courts/search?${params.toString()}`);
        if (response && Array.isArray(response.courts)) {
          setCourtsList(response.courts);
          setCourtsTotal(response.total || 0);
          setCourtsTotalPages(response.total_pages || 1);
        } else {
          setCourtsList([]);
          setCourtsTotal(0);
          setCourtsTotalPages(1);
        }
      } catch (err) {
        console.error('Error fetching courts:', err);
        setCourtsList([]);
        setCourtsTotal(0);
        setCourtsTotalPages(1);
      } finally {
        setCourtsLoading(false);
      }
    };

    fetchCourts();
  }, [selectedCourt, selectedRegion, courtsSearchQuery, courtsPage, courtsRefreshKey]);

  useEffect(() => {
    const fetchMapApiKey = async () => {
      try {
        const response = await apiGet('/api/admin/settings/key/google_maps_api_key');
        if (response && response.value) {
          setMapApiKey(response.value);
        }
      } catch (err) {
        console.error('Error fetching Google Maps API key:', err);
      }
    };

    fetchMapApiKey();
  }, []);

  useEffect(() => {
    if (viewMode !== 'map' || !mapApiKey) {
      return;
    }

    loadGoogleMapsScript(mapApiKey)
      .then(() => {
        if (!mapInstanceRef.current && mapContainerRef.current) {
          mapInstanceRef.current = new window.google.maps.Map(mapContainerRef.current, {
            center: { lat: 7.9465, lng: -1.0232 },
            zoom: 6,
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: false
          });
          infoWindowRef.current = new window.google.maps.InfoWindow();
        }
      })
      .catch((err) => {
        console.error(err);
        setMapError('Unable to load Google Maps.');
      });
  }, [viewMode, mapApiKey]);

  useEffect(() => {
    if (viewMode !== 'map') {
      return;
    }

    const fetchMapCourts = async () => {
      try {
        setMapLoading(true);
        setMapError('');
        const params = new URLSearchParams();
        if (courtsSearchQuery.trim()) {
          params.append('query', courtsSearchQuery.trim());
        }
        if (selectedRegion && selectedRegion !== 'All Regions') {
          params.append('region', selectedRegion);
        }
        if (mapCourtType && mapCourtType !== 'All Courts') {
          params.append('court_type', mapCourtType);
        }
        params.append('page', '1');
        params.append('limit', '100');

        const response = await apiGet(`/courts/search?${params.toString()}`);
        if (response && Array.isArray(response.courts)) {
          setMapCourts(response.courts);
        } else {
          setMapCourts([]);
        }
      } catch (err) {
        console.error('Error fetching map courts:', err);
        setMapCourts([]);
        setMapError('Failed to load courts for the map.');
      } finally {
        setMapLoading(false);
      }
    };

    fetchMapCourts();
  }, [viewMode, selectedRegion, courtsSearchQuery, mapCourtType]);

  useEffect(() => {
    if (viewMode !== 'map' || !mapInstanceRef.current || !window.google?.maps) {
      return;
    }

    markersRef.current.forEach((marker) => marker.setMap(null));
    markersRef.current = [];

    const bounds = new window.google.maps.LatLngBounds();
    const validCourts = mapCourts.filter((court) => {
      const lat = parseFloat(court.latitude);
      const lng = parseFloat(court.longitude);
      return Number.isFinite(lat) && Number.isFinite(lng);
    });

    validCourts.forEach((court) => {
      const lat = parseFloat(court.latitude);
      const lng = parseFloat(court.longitude);
      const marker = new window.google.maps.Marker({
        position: { lat, lng },
        map: mapInstanceRef.current,
        title: court.name,
        icon: {
          url: getCourtMarkerIcon(court.court_type),
          scaledSize: new window.google.maps.Size(32, 32)
        }
      });

      marker.addListener('click', () => {
        const mapsLink = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
        const directionsLink = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
        const content = `
          <div style="font-size:12px;line-height:1.4;">
            <strong>${court.name || 'Court'}</strong><br/>
            ${court.court_type ? `<span>${court.court_type}</span><br/>` : ''}
            ${court.region ? `<span>${court.region}</span><br/>` : ''}
            ${court.location || court.address ? `<span>${court.location || court.address}</span><br/>` : ''}
            <span>Lat: ${lat.toFixed(6)}, Lng: ${lng.toFixed(6)}</span><br/>
            <a href="${mapsLink}" target="_blank" rel="noopener noreferrer">View location</a> ·
            <a href="${directionsLink}" target="_blank" rel="noopener noreferrer">Get directions</a>
          </div>
        `;
        infoWindowRef.current.setContent(content);
        infoWindowRef.current.open(mapInstanceRef.current, marker);
      });

      markersRef.current.push(marker);
      bounds.extend({ lat, lng });
    });

    if (validCourts.length > 0) {
      mapInstanceRef.current.fitBounds(bounds);
    }
  }, [viewMode, mapCourts]);

  // Filter registries based on search query
  const filteredRegistries = registries.filter(registry => {
    if (!registrySearchQuery.trim()) return true;
    
    const query = registrySearchQuery.toLowerCase();
    return (
      (registry.name && registry.name.toLowerCase().includes(query)) ||
      (registry.division && registry.division.toLowerCase().includes(query)) ||
      (registry.region && registry.region.toLowerCase().includes(query)) ||
      (registry.registryCode && registry.registryCode.toLowerCase().includes(query)) ||
      (registry.location && registry.location.toLowerCase().includes(query))
    );
  });

  const mapCourtsWithCoords = mapCourts.filter((court) => {
    const lat = parseFloat(court.latitude);
    const lng = parseFloat(court.longitude);
    return Number.isFinite(lat) && Number.isFinite(lng);
  });

  const getCourtMarkerIcon = (courtType) => {
    const normalized = (courtType || '').toLowerCase();
    if (normalized.includes('supreme')) return '/courts/supreme-court.png';
    if (normalized.includes('appeal')) return '/courts/court-of-appeal.png';
    if (normalized.includes('high')) return '/courts/high-court.png';
    if (normalized.includes('circuit')) return '/courts/circuit-court.png';
    if (normalized.includes('district')) return '/courts/district-court.png';
    return '/courts/image.png';
  };

  const handleSaveRegistry = (formData) => {
    // Handle saving the new registry
    console.log('Saving registry:', formData);
    // TODO: Add API call to save registry
  };

  const handleSaveJudge = (formData) => {
    const payload = {
      name: formData.judgeName,
      title: formData.title || null,
      gender: formData.gender || null,
      court_type: activeCourtContext?.court_type || selectedCourt || null,
      court_division: activeCourtContext?.court_division || null,
      region: activeCourtContext?.region || (selectedRegion !== 'All Regions' ? selectedRegion : null),
      status: formData.status || 'active',
      bio: formData.bio || null,
      date_of_birth: formData.dateOfBirth || null,
      appointment_date: formData.appointmentDate || null,
      contact_info: JSON.stringify({
        email: formData.email || '',
        phoneNumber: formData.phoneNumber || '',
        chamberAddress: formData.chamberAddress || '',
        assistantName: formData.assistantName || '',
        assistantEmail: formData.assistantEmail || ''
      }),
      specializations: formData.legalBackground || null,
      schools_attended: [
        formData.education1 && { degree: formData.education1 },
        formData.education2 && { degree: formData.education2 },
        formData.education3 && { degree: formData.education3 }
      ].filter(Boolean)
    };

    apiPost('/admin/judges', payload)
      .then(() => {
        setShowAddJudgeForm(false);
        setActiveCourtContext(null);
      })
      .catch((err) => {
        console.error('Error saving judge:', err);
        alert(err?.detail || err?.message || 'Failed to save judge.');
      });
  };

  const handleSaveCourt = (formData) => {
    const regionValue = selectedRegion !== 'All Regions'
      ? selectedRegion
      : (activeCourtContext?.region || 'Greater Accra Region');

    const payload = {
      name: formData.courtName,
      court_type: selectedCourt,
      region: regionValue,
      location: formData.location || formData.address || '',
      address: formData.location || formData.address || '',
      court_division: formData.division || null,
      is_active: formData.status === 'Active'
    };

    apiPost('/courts/', payload)
      .then(() => {
        setShowAddCourtForm(false);
        setActiveCourtContext(null);
        setCourtsPage(1);
        setCourtsRefreshKey((prev) => prev + 1);
      })
      .catch((err) => {
        console.error('Error saving court:', err);
        alert(err?.detail || err?.message || 'Failed to save court.');
      });
  };

  const handleSaveCase = (formData) => {
    const payload = {
      suit_reference_number: formData.suitNo || '',
      hearing_date: formData.dateOfHearing || null,
      hearing_time: formData.timeOfHearing || null,
      coram: formData.judgeName || null,
      remark: 'fh',
      proceedings: formData.remarks || null
    };

    apiPost('/admin/case-hearings', payload)
      .then(() => {
        setShowAddCaseForm(false);
        setActiveCourtContext(null);
      })
      .catch((err) => {
        console.error('Error saving case hearing:', err);
        alert(err?.detail || err?.message || 'Failed to save case hearing.');
      });
  };

  const handleEventClick = (event) => {
    setSelectedEvent(event);
    setShowDrawer(true);
  };

  const weekCases = [
    { title: 'EcoWind Corp. vs. SafeDrive Insurance', caseNo: 'CV/1089/2021', firstParty: 'EcoWind Corp.', secondParty: 'SafeDrive insurance', judge: 'Justice B. Carson', hearingDate: 'Oct. 29, 2025', hearingTime: '9:00 AM' },
    { title: 'Tecno Digital Services vs. Power Media Company', caseNo: 'CV/1165/2021', firstParty: 'Tecno Digital Services', secondParty: 'Power Media Company', judge: 'Justice B. Carson', hearingDate: 'Oct. 29, 2025', hearingTime: '10:00 AM' },
    { title: 'SafeDrive Insurance vs. Wellness Insurance', caseNo: 'CV/1022/2021', firstParty: 'SafeDrive insurance', secondParty: 'Wellness Insurance', judge: 'Justice K. Botang', hearingDate: 'Oct. 30, 2025', hearingTime: '11:00 AM' },
    { title: 'Tecno Digital Services vs. Power Media Company', caseNo: 'CV/1165/2021', firstParty: 'Tecno Digital Services', secondParty: 'Power Media Company', judge: 'Justice B. Carson', hearingDate: 'Oct. 30, 2025', hearingTime: '12:00 PM' },
    { title: 'EcoWind Corp. vs. SafeDrive Insurance', caseNo: 'CV/1089/2021', firstParty: 'EcoWind Corp.', secondParty: 'SafeDrive insurance', judge: 'Justice B. Carson', hearingDate: 'Oct. 30, 2025', hearingTime: '1:00 PM' },
    { title: 'SafeDrive Insurance vs. Wellness Insurance', caseNo: 'CV/1022/2021', firstParty: 'SafeDrive insurance', secondParty: 'Wellness Insurance', judge: 'Justice K. Botang', hearingDate: 'Oct. 30, 2025', hearingTime: '2:00 PM' }
  ];

  // If no court is selected, show the court selection interface
  if (!selectedCourt) {
    return (
      <div className="bg-[#F7F8FA] min-h-screen">
        {/* Full Width Header */}
        <AdminHeader userInfo={userInfo} onNavigate={onNavigate} onLogout={onLogout} />

        {/* Main Content */}
        <div className="px-6">
          <div className="flex flex-col bg-white pt-4 pb-[31px] px-3.5 gap-10 rounded-lg">
            <div className="flex flex-col items-start self-stretch gap-4">
              {/* Breadcrumb */}
              <div className="flex items-start">
                <span className="text-[#525866] text-xs mr-1.5 whitespace-nowrap">COURT REGISTRY</span>
              </div>

              {/* Header Section */}
              <div className="flex justify-between items-start self-stretch">
                <div className="flex flex-col items-start w-[290px] gap-2">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center w-[122px] gap-1">
                      <span className="text-[#040E1B] text-xl font-bold">Cause List</span>
                    </div>
                  </div>
                  <span className="text-[#070810] text-sm">
                    Select a Court to create cause list
                  </span>
                </div>
              </div>
            </div>

            {/* Court Cards */}
            <div className="flex items-start self-stretch gap-6">
              {courts.map((court, index) => (
                <div
                  key={index}
                  onClick={() => handleCourtClick(court.name)}
                  className="flex flex-col items-start bg-white flex-1 py-[23px] pl-4 gap-3 rounded-lg border border-solid border-[#D4E1EA] cursor-pointer hover:shadow-lg transition-shadow"
                  style={{ boxShadow: '4px 4px 4px #0708101A' }}
                >
                  <div className="w-20 h-20 flex items-center justify-center rounded-lg overflow-hidden bg-gray-50">
                    <img
                      key={court.name}
                      src={court.image}
                      alt={court.name}
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        console.error(`Failed to load image for ${court.name}:`, court.image);
                        e.target.src = '/courts/image.png';
                      }}
                    />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[#F59E0B] text-base font-normal whitespace-nowrap">
                      {court.name}
                    </span>
                    <ChevronRight className="w-4 h-4 text-[#F59E0B] flex-shrink-0" />
                  </div>
                </div>
              ))}
            </div>

            {/* Region Filter and Courts List */}
            <div className="flex flex-col gap-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="text-[#040E1B] text-base font-semibold">Courts Directory</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setViewMode('list')}
                    className={`px-4 py-2 text-sm font-medium rounded-lg border ${
                      viewMode === 'list'
                        ? 'bg-[#022658] text-white border-[#022658]'
                        : 'bg-white text-[#525866] border-[#D4E1EA] hover:bg-[#F7F8FA]'
                    }`}
                  >
                    List View
                  </button>
                  <button
                    onClick={() => setViewMode('map')}
                    className={`px-4 py-2 text-sm font-medium rounded-lg border ${
                      viewMode === 'map'
                        ? 'bg-[#022658] text-white border-[#022658]'
                        : 'bg-white text-[#525866] border-[#D4E1EA] hover:bg-[#F7F8FA]'
                    }`}
                  >
                    Map View
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <span className="text-[#040E1B] text-lg font-semibold">Filter by Region</span>
                <div className="flex items-center gap-2 overflow-x-auto pb-2">
                  {REGION_OPTIONS.map((region) => (
                    <button
                      key={region.value}
                      onClick={() => handleRegionSelect(region.value)}
                      className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap border transition-colors ${
                        selectedRegion === region.value
                          ? 'bg-[#022658] text-white border-[#022658]'
                          : 'bg-white text-[#525866] border-[#D4E1EA] hover:bg-[#F7F8FA]'
                      }`}
                    >
                      {region.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div className="flex items-center bg-[#F7F8FA] px-3 py-2 rounded-lg border border-[#E5E8EC] w-full md:max-w-md">
                  <Search className="w-4 h-4 text-[#868C98] mr-2" />
                  <input
                    type="text"
                    value={courtsSearchQuery}
                    onChange={(e) => {
                      setCourtsSearchQuery(e.target.value);
                      setCourtsPage(1);
                    }}
                    placeholder="Search courts by name, location, or area..."
                    className="flex-1 bg-transparent text-sm text-[#040E1B] outline-none"
                  />
                </div>
                <span className="text-[#525866] text-sm whitespace-nowrap">
                  {courtsTotal} court{courtsTotal === 1 ? '' : 's'}
                </span>
              </div>

              {viewMode === 'map' ? (
                <div className="flex flex-col gap-3">
                  {mapLoading && (
                    <div className="text-sm text-[#525866]">Loading map data...</div>
                  )}
                  {mapError && (
                    <div className="text-sm text-red-600">{mapError}</div>
                  )}
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-[#525866]">Court type:</span>
                      <select
                        value={mapCourtType}
                        onChange={(e) => setMapCourtType(e.target.value)}
                        className="px-3 py-2 text-sm border border-[#D4E1EA] rounded-lg bg-white text-[#040E1B]"
                      >
                        {['All Courts', 'Supreme Court', 'Court of Appeal', 'High Court', 'Circuit Court', 'District Court'].map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>
                    </div>
                    <span className="text-xs text-[#525866]">
                      Showing courts with available coordinates. Click a marker to view court details.
                    </span>
                  </div>
                  <div className="text-xs text-[#525866]">
                    Filtering by region and court type also applies to the map.
                  </div>
                  {!mapLoading && !mapError && mapCourtsWithCoords.length === 0 && (
                    <div className="text-sm text-[#525866]">
                      No courts with coordinates found for the selected filters.
                    </div>
                  )}
                  <div
                    ref={mapContainerRef}
                    className="w-full h-[520px] rounded-xl border border-[#E5E8EC]"
                  ></div>
                </div>
              ) : courtsLoading ? (
                <div className="text-sm text-[#525866]">Loading courts...</div>
              ) : courtsList.length === 0 ? (
                <div className="text-sm text-[#525866]">No courts found.</div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {courtsList.map((court) => (
                      <div
                        key={court.id}
                        className="bg-white border border-[#E5E8EC] rounded-lg p-4 hover:shadow-sm transition-shadow"
                      >
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className="text-[#040E1B] text-base font-semibold">
                            {court.name}
                          </span>
                          <span className="text-xs font-semibold text-[#F59E0B] bg-[#FFF7E6] px-2 py-1 rounded-full">
                            {court.court_type}
                          </span>
                        </div>
                        <div className="text-sm text-[#525866]">
                          {court.region || 'N/A'}
                        </div>
                        <div className="text-sm text-[#525866]">
                          {court.location || court.address || 'N/A'}
                        </div>
                      </div>
                    ))}
                  </div>

                  {courtsTotalPages > 1 && (
                    <div className="flex items-center justify-between mt-4">
                      <button
                        onClick={() => setCourtsPage((prev) => Math.max(prev - 1, 1))}
                        disabled={courtsPage === 1}
                        className={`px-4 py-2 text-sm font-medium rounded-lg border ${
                          courtsPage === 1
                            ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                            : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        Previous
                      </button>
                      <span className="text-sm text-[#525866]">
                        Page <span className="font-semibold">{courtsPage}</span> of{' '}
                        <span className="font-semibold">{courtsTotalPages}</span>
                      </span>
                      <button
                        onClick={() => setCourtsPage((prev) => Math.min(prev + 1, courtsTotalPages))}
                        disabled={courtsPage >= courtsTotalPages}
                        className={`px-4 py-2 text-sm font-medium rounded-lg border ${
                          courtsPage >= courtsTotalPages
                            ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                            : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        Next
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // If judges view is shown
  if (showJudgesView && judgesViewingRegistry) {
    return (
      <JudgesListView
        registry={judgesViewingRegistry}
        onBack={() => {
          setShowJudgesView(false);
          setJudgesViewingRegistry(null);
        }}
      />
    );
  }

  // If courts view is shown
  if (showCourtsView && viewingRegistry) {
    return (
      <RegistryCourtsView
        registry={viewingRegistry}
        onBack={() => {
          setShowCourtsView(false);
          setViewingRegistry(null);
        }}
      />
    );
  }

  // If add court form is shown
  if (showAddCourtForm) {
    return (
      <AddCourtForm
        registry={activeCourtContext}
        onBack={() => {
          setShowAddCourtForm(false);
          setActiveCourtContext(null);
        }}
        onSave={handleSaveCourt}
      />
    );
  }

  // If add case form is shown
  if (showAddCaseForm && activeCourtContext) {
    return (
      <AddCasesToCauseListPage
        registry={activeCourtContext}
        onBack={() => {
          setShowAddCaseForm(false);
          setActiveCourtContext(null);
        }}
        onSave={handleSaveCase}
      />
    );
  }

  // If add judge form is shown
  if (showAddJudgeForm) {
    return (
      <AddJudgeForm
        onBack={() => {
          setShowAddJudgeForm(false);
          setActiveCourtContext(null);
        }}
        onSave={handleSaveJudge}
      />
    );
  }

  // If add registry form is shown
  if (showAddRegistryForm && selectedCourt) {
    return (
      <AddRegistryForm
        selectedCourt={selectedCourt}
        onBack={() => setShowAddRegistryForm(false)}
        onSave={handleSaveRegistry}
      />
    );
  }

  // If a court is selected but no registry, show registry list
  if (selectedCourt && !selectedRegistry) {
    return (
      <div className="bg-[#F7F8FA] min-h-screen overflow-x-hidden">
        {/* Full Width Header */}
        <AdminHeader userInfo={userInfo} onNavigate={onNavigate} onLogout={onLogout} />

        {/* Main Content */}
        <div className="px-6 max-w-full">
          <div className="flex flex-col bg-white pt-4 pb-[31px] px-3.5 gap-10 rounded-lg w-full">
            <div className="flex flex-col items-start self-stretch gap-4">
              {/* Breadcrumb */}
              <div className="flex items-start gap-2">
                <button
                  onClick={() => setSelectedCourt(null)}
                  className="cursor-pointer hover:opacity-70"
                >
                  <ChevronRight className="w-4 h-4 text-[#525866] rotate-180" />
                </button>
                <span className="text-[#525866] text-xs mr-1.5 whitespace-nowrap">COURT REGISTRY</span>
                <span className="text-[#525866] text-xs mr-1.5 whitespace-nowrap">/</span>
                <span className="text-[#525866] text-xs whitespace-nowrap">{selectedCourt}</span>
              </div>

              {/* Filters and Actions */}
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <span className="text-[#040E1B] text-base font-semibold">Filter by Region</span>
                  <div className="flex flex-wrap items-center gap-2 pb-2 max-w-full">
                    {REGION_OPTIONS.map((region) => (
                      <button
                        key={region.value}
                        onClick={() => handleRegionSelect(region.value)}
                        className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap border transition-colors ${
                          selectedRegion === region.value
                            ? 'bg-[#022658] text-white border-[#022658]'
                            : 'bg-white text-[#525866] border-[#D4E1EA] hover:bg-[#F7F8FA]'
                        }`}
                      >
                        {region.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                  <div className="flex items-center bg-[#F7F8FA] px-3 py-2 rounded-lg border border-[#E5E8EC] w-full md:max-w-md min-w-0">
                    <Search className="w-4 h-4 text-[#868C98] mr-2" />
                    <input
                      type="text"
                      value={courtsSearchQuery}
                      onChange={(e) => {
                        setCourtsSearchQuery(e.target.value);
                        setCourtsPage(1);
                      }}
                      placeholder={`Search ${selectedCourt} courts...`}
                      className="flex-1 bg-transparent text-sm text-[#040E1B] outline-none"
                    />
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      onClick={() => setShowAddCourtForm(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-[#022658] text-white rounded-lg hover:bg-[#033a7a] transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      <span className="text-sm font-medium">Add New Court</span>
                    </button>
                    <button
                      onClick={() => {
                        setActiveCourtContext(null);
                        setShowAddJudgeForm(true);
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-[#022658] text-white rounded-lg hover:bg-[#033a7a] transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      <span className="text-sm font-medium">Add New Judge</span>
                    </button>
                  </div>
                </div>
              </div>

              {courtsLoading ? (
                <div className="flex items-center justify-center w-full py-8">
                  <span className="text-[#525866] text-sm">Loading courts...</span>
                </div>
              ) : courtsList.length === 0 ? (
                <div className="flex flex-col items-center justify-center w-full py-12 gap-4">
                  <span className="text-[#525866] text-sm">
                    {courtsSearchQuery.trim()
                      ? `No courts found matching "${courtsSearchQuery}"`
                      : `No courts found for ${selectedCourt}`
                    }
                  </span>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
                    {courtsList.map((court) => (
                      <div
                        key={court.id}
                        className="flex flex-col items-start bg-white p-4 gap-4 rounded-lg border border-solid border-[#D4E1EA] hover:shadow-lg transition-shadow"
                        style={{ boxShadow: '4px 4px 4px #0708101A' }}
                      >
                        <div className="flex flex-col items-start gap-2 min-w-0">
                          <span className="text-[#040E1B] text-lg font-semibold break-words">
                            {court.name}
                          </span>
                          {court.court_division && (
                            <span className="text-[#040E1B] text-sm font-normal">
                              Division: {court.court_division}
                            </span>
                          )}
                          {court.region && (
                            <span className="text-[#040E1B] text-sm font-normal">
                              Region: {court.region}
                            </span>
                          )}
                          {court.location && (
                            <span className="text-[#040E1B] text-sm font-normal">
                              Location: {court.location}
                            </span>
                          )}
                        </div>

                        <div className="flex flex-col items-start self-stretch gap-2">
                          <button
                            onClick={() => {
                              setActiveCourtContext(court);
                              setShowAddCaseForm(true);
                            }}
                            className="flex items-center gap-2 px-4 py-2 bg-[#022658] text-white rounded-lg hover:bg-[#033a7a] transition-colors w-full"
                          >
                            <Plus className="w-4 h-4" />
                            <span className="text-sm font-medium">Add Case</span>
                          </button>
                          <button
                            onClick={() => {
                              setActiveCourtContext(court);
                              setShowAddJudgeForm(true);
                            }}
                            className="flex items-center gap-2 px-4 py-2 bg-[#022658] text-white rounded-lg hover:bg-[#033a7a] transition-colors w-full"
                          >
                            <Plus className="w-4 h-4" />
                            <span className="text-sm font-medium">Add New Judge</span>
                          </button>
                          <button
                            onClick={() => setSelectedRegistry({
                              id: court.id,
                              name: court.name,
                              division: court.court_division || `${selectedCourt} (General)`,
                              region: court.region || 'N/A',
                              location: court.location || court.address || 'N/A',
                              court_type: court.court_type,
                              courts: [court]
                            })}
                            className="flex items-center gap-2 px-4 py-2 bg-[#F59E0B] text-white rounded-lg hover:bg-[#d6890a] transition-colors w-full"
                          >
                            <span className="text-sm font-medium">Cause Lists</span>
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {courtsTotalPages > 1 && (
                    <div className="flex items-center justify-between mt-4">
                      <button
                        onClick={() => setCourtsPage((prev) => Math.max(prev - 1, 1))}
                        disabled={courtsPage === 1}
                        className={`px-4 py-2 text-sm font-medium rounded-lg border ${
                          courtsPage === 1
                            ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                            : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        Previous
                      </button>
                      <span className="text-sm text-[#525866]">
                        Page <span className="font-semibold">{courtsPage}</span> of{' '}
                        <span className="font-semibold">{courtsTotalPages}</span>
                      </span>
                      <button
                        onClick={() => setCourtsPage((prev) => Math.min(prev + 1, courtsTotalPages))}
                        disabled={courtsPage >= courtsTotalPages}
                        className={`px-4 py-2 text-sm font-medium rounded-lg border ${
                          courtsPage >= courtsTotalPages
                            ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                            : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        Next
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // If a registry is selected, show the detailed calendar/table view
  return (
    <div className="bg-[#F7F8FA] min-h-screen w-full">
      {/* Full Width Header */}
      <AdminHeader userInfo={userInfo} onNavigate={onNavigate} onLogout={onLogout} />

      {/* Main Content */}
      <div className="px-6 w-full">
        <div className="flex flex-col items-start w-full bg-white py-[15px] gap-6 rounded-lg">

          <div className="flex flex-col items-start w-full gap-4 px-6">
            {/* Header with Filters */}
            <div className="flex justify-between items-center w-full">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSelectedCourt(null)}
                  className="text-[#525866] text-xs hover:underline cursor-pointer"
                >
                  ← Back
                </button>
                <span className="text-[#525866] text-xs whitespace-nowrap">CAUSE LIST - {selectedCourt}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[#525866] text-xs whitespace-nowrap">Show data for</span>
                <div className="flex items-center bg-[#F7F8FA] p-2 gap-1 rounded-lg border border-solid border-[#D4E1EA]">
                  <img
                    src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Iq8V0MifpP/22ymbudi_expires_30_days.png"
                    className="w-4 h-4 rounded-lg object-fill flex-shrink-0"
                  />
                  <span className="text-[#070810] text-sm whitespace-nowrap">Last 7 days (as of 29 Oct., 2025)</span>
                  <img
                    src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Iq8V0MifpP/fh66rupm_expires_30_days.png"
                    className="w-4 h-4 object-fill flex-shrink-0"
                  />
                </div>
                <button className="flex items-center bg-[#F7F8FA] text-left p-2 gap-0.5 rounded-lg border border-solid border-[#D4E1EA] hover:bg-gray-100 transition-colors">
                  <span className="text-[#070810] text-sm whitespace-nowrap">Case type</span>
                  <img
                    src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Iq8V0MifpP/lxhi8ee8_expires_30_days.png"
                    className="w-4 h-4 rounded-lg object-fill flex-shrink-0"
                  />
                </button>
                <button className="flex items-center bg-[#F7F8FA] text-left p-2 gap-[3px] rounded-lg border border-solid border-[#D4E1EA] hover:bg-gray-100 transition-colors">
                  <span className="text-[#070810] text-sm whitespace-nowrap">Status</span>
                  <img
                    src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Iq8V0MifpP/6wkyev7x_expires_30_days.png"
                    className="w-4 h-4 rounded-lg object-fill flex-shrink-0"
                  />
                </button>
              </div>
            </div>

            {/* Back Button */}
            <img
              src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Iq8V0MifpP/dyl9xpgk_expires_30_days.png"
              className="w-10 h-10 object-fill cursor-pointer hover:opacity-70"
            />
          </div>

          {/* Today/This Week Toggle */}
          <div className="flex justify-center w-full px-6">
            <div className="flex items-center bg-white py-1 px-2 gap-[50px] rounded-lg border border-solid border-[#D4E1EA]">
              <button
                onClick={() => setTimePeriod('today')}
              className={`flex flex-col items-center w-40 rounded ${
                timePeriod === 'today' ? 'bg-[#022658] py-[7px]' : 'bg-transparent py-[9px]'
              }`}
            >
              <span className={`text-base whitespace-nowrap ${timePeriod === 'today' ? 'text-white font-bold' : 'text-[#040E1B]'}`}>
                Today
              </span>
            </button>
            <button
              onClick={() => setTimePeriod('week')}
              className={`flex flex-col items-center w-40 rounded ${
                timePeriod === 'week' ? 'bg-[#022658] py-[7px]' : 'bg-transparent py-[9px]'
              }`}
            >
              <span className={`text-base whitespace-nowrap ${timePeriod === 'week' ? 'text-white font-bold' : 'text-[#040E1B]'}`}>
                This Week
              </span>
            </button>
            </div>
          </div>

          {/* Today View - Calendar */}
          {timePeriod === 'today' && (
            <div className="px-6 w-full">
              <div className="flex flex-col w-full bg-white p-6 gap-[23px] rounded-[15px]" style={{ boxShadow: '0px 0px 15px #00000026' }}>
              <div className="flex flex-col items-start w-full pb-[1px]">
                <span className="text-[#040E1B] whitespace-nowrap">November 10 / 11 2025</span>
              </div>

              <div className="w-full">
                {/* Header Row */}
                <div className="flex items-start w-full">
                  <div className="bg-white w-[19px] h-[100px] flex-shrink-0"></div>
                  <div className="bg-white w-[148px] h-[100px] pt-2 pb-[75px] px-2 mr-[1px] flex-shrink-0"></div>
                  {[...Array(6)].map((_, idx) => (
                    <div key={idx} className="flex flex-col items-start bg-white flex-1 min-w-[148px] px-[55px]">
                      <span className="text-[#868C98] text-sm font-bold mt-2 mb-[74px] whitespace-nowrap">Today</span>
                    </div>
                  ))}
                </div>

                {/* Row 1 */}
                <div className="flex items-start w-full">
                  <div className="flex flex-col items-start bg-white w-[19px] px-1.5 flex-shrink-0">
                    <span className="text-[#868C98] text-[9px] mt-2 mb-20 whitespace-nowrap">1</span>
                  </div>
                  <div className="flex items-start bg-white w-[148px] pt-[19px] pb-[62px] px-2 mr-[1px] gap-[21px] border border-solid border-[#D4E1EA] flex-shrink-0">
                    <span className="text-[#868C98] text-[15px] whitespace-nowrap">Nov. 10</span>
                    <span className="text-[#040E1B] text-[15px] whitespace-nowrap">9:00am</span>
                  </div>
                  <div className="flex flex-col items-start bg-white flex-1 min-w-[148px] pt-2 border border-solid border-[#D4E1EA]">
                    <span className="text-[#040E1B] text-[15px] ml-[82px] mr-2.5 whitespace-nowrap">9:30am</span>
                    <button onClick={() => handleEventClick({ caseNo: 'CM/0245/2023', time: '9:30am' })} className="flex flex-col items-start bg-[#CEF1F9] px-2 rounded-lg border-l-4 border-blue-500 cursor-pointer hover:opacity-90 transition-opacity">
                      <span className="text-blue-500 text-sm font-bold my-2 whitespace-nowrap">CM/0245/2023</span>
                      <span className="text-blue-500 text-xs mb-[22px] whitespace-nowrap">9:30am</span>
                    </button>
                  </div>
                  <div className="flex flex-col items-start bg-white flex-1 min-w-[148px] pl-[75px] border border-solid border-[#D4E1EA]">
                    <span className="text-[#040E1B] text-[15px] mt-2 mb-[73px] whitespace-nowrap">10:00am</span>
                  </div>
                  <div className="flex flex-col items-start bg-white flex-1 min-w-[148px] pl-[76px] mr-[1px] border border-solid border-[#D4E1EA]">
                    <span className="text-[#040E1B] text-[15px] mt-2 mb-[73px] whitespace-nowrap">10:30am</span>
                  </div>
                  <div className="flex flex-col items-start bg-white flex-1 min-w-[148px] pl-[77px] border border-solid border-[#D4E1EA]">
                    <span className="text-[#040E1B] text-[15px] mt-2 mb-[73px] whitespace-nowrap">11:00am</span>
                  </div>
                  <div className="flex flex-col items-start bg-white flex-1 min-w-[148px] pt-2 px-[1px] border border-solid border-[#D4E1EA]">
                    <div className="flex flex-col items-end self-stretch">
                      <span className="text-[#040E1B] text-[15px] whitespace-nowrap">11:30am</span>
                    </div>
                    <button onClick={() => handleEventClick({ caseNo: 'CM/0245/2023', judge: 'Judge Nkrumah', time: '11:30am' })} className="flex flex-col items-start bg-[#F9DBCE] text-left p-2 gap-1 rounded-lg border-l-4 border-red-500 cursor-pointer hover:opacity-90 transition-opacity">
                      <span className="text-red-500 text-sm font-bold whitespace-nowrap">CM/0245/2023</span>
                      <span className="text-red-500 text-xs whitespace-nowrap">Judge Nkrumah</span>
                      <span className="text-red-500 text-xs whitespace-nowrap">11:30am</span>
                    </button>
                  </div>
                  <div className="flex flex-col items-start bg-white flex-1 min-w-[148px] pl-[75px] border border-solid border-[#D4E1EA]">
                    <span className="text-[#040E1B] text-[15px] mt-2 mb-[73px] whitespace-nowrap">12:00pm</span>
                  </div>
                </div>

                {/* Row 2 */}
                <div className="flex items-start w-full">
                  <div className="flex flex-col items-start bg-white w-[19px] px-1 flex-shrink-0">
                    <span className="text-[#868C98] text-[9px] mt-2 mb-20 whitespace-nowrap">2</span>
                  </div>
                  <div className="flex flex-col items-start bg-white w-[148px] pl-[75px] mr-[1px] border border-solid border-[#D4E1EA] flex-shrink-0">
                    <span className="text-[#040E1B] text-[15px] mt-2 mb-[73px] whitespace-nowrap">12:30pm</span>
                  </div>
                  <div className="flex flex-col items-start bg-white flex-1 min-w-[148px] pl-[84px] border border-solid border-[#D4E1EA]">
                    <span className="text-[#040E1B] text-[15px] mt-2 mb-[73px] whitespace-nowrap">1:00pm</span>
                  </div>
                  <div className="flex flex-col items-start bg-white flex-1 min-w-[148px] pl-[84px] border border-solid border-[#D4E1EA]">
                    <span className="text-[#040E1B] text-[15px] mt-2 mb-[73px] whitespace-nowrap">1:30pm</span>
                  </div>
                  <div className="flex flex-col items-start bg-white flex-1 min-w-[148px] pt-2 mr-[1px] border border-solid border-[#D4E1EA]">
                    <span className="text-[#040E1B] text-[15px] ml-[83px] mr-[9px] whitespace-nowrap">2:00pm</span>
                    <button onClick={() => handleEventClick({ caseNo: 'CM/0245/2023', judge: 'Judge Nkrumah', time: '2:00pm' })} className="flex flex-col items-start bg-[#CEF9E2] text-left py-[7px] px-2 ml-[1px] gap-1 rounded-lg border-l-4 border-emerald-600 cursor-pointer hover:opacity-90 transition-opacity">
                      <span className="text-emerald-500 text-sm font-bold whitespace-nowrap">CM/0245/2023</span>
                      <span className="text-emerald-500 text-xs whitespace-nowrap">Judge Nkrumah</span>
                      <span className="text-emerald-500 text-xs whitespace-nowrap">2:00pm</span>
                    </button>
                  </div>
                  <div className="flex flex-col items-start bg-white flex-1 min-w-[148px] pl-[82px] border border-solid border-[#D4E1EA]">
                    <span className="text-[#040E1B] text-[15px] mt-2 mb-[73px] whitespace-nowrap">2:30pm</span>
                  </div>
                  <div className="flex flex-col items-start bg-white flex-1 min-w-[148px] pl-[81px] border border-solid border-[#D4E1EA]">
                    <span className="text-[#040E1B] text-[15px] mt-2 mb-[73px] whitespace-nowrap">3:00pm</span>
                  </div>
                  <div className="flex flex-col items-start bg-white flex-1 min-w-[148px] pl-[82px] border border-solid border-[#D4E1EA]">
                    <span className="text-[#040E1B] text-[15px] mt-2 mb-[73px] whitespace-nowrap">3:30pm</span>
                  </div>
                </div>

                {/* Row 3 */}
                <div className="flex items-start w-full">
                  <div className="flex flex-col items-start bg-white w-[19px] px-1 flex-shrink-0">
                    <span className="text-[#868C98] text-[9px] mt-2 mb-20 whitespace-nowrap">3</span>
                  </div>
                  <div className="flex flex-col items-start bg-white w-[148px] pt-2 px-[1px] mr-[1px] border border-solid border-[#D4E1EA] flex-shrink-0">
                    <div className="flex flex-col items-end self-stretch">
                      <span className="text-[#040E1B] text-[15px] whitespace-nowrap">10:30am</span>
                    </div>
                    <button onClick={() => handleEventClick({ caseNo: 'CM/0245/2023', judge: 'Judge Nkrumah', time: '10:30am' })} className="flex flex-col items-start bg-[#F9F9CE] text-left p-2 gap-1 rounded-lg border-l-4 border-yellow-500 cursor-pointer hover:opacity-90 transition-opacity">
                      <span className="text-[#DEBB0C] text-sm font-bold whitespace-nowrap">CM/0245/2023</span>
                      <span className="text-[#DEBB0C] text-xs whitespace-nowrap">Judge Nkrumah</span>
                      <span className="text-[#DEBB0C] text-xs whitespace-nowrap">10:30am</span>
                    </button>
                  </div>
                  <div className="flex flex-col items-start bg-white flex-1 min-w-[148px] pl-[75px] border border-solid border-[#D4E1EA]">
                    <span className="text-[#040E1B] text-[15px] mt-2 mb-[73px] whitespace-nowrap">10:00am</span>
                  </div>
                  <div className="flex flex-col items-start bg-white flex-1 min-w-[148px] pl-[82px] border border-solid border-[#D4E1EA]">
                    <span className="text-[#040E1B] text-[15px] mt-2 mb-[73px] whitespace-nowrap">9:30am</span>
                  </div>
                  <div className="bg-white flex-1 min-w-[148px] px-2 mr-[1px] border border-solid border-[#D4E1EA]">
                    <div className="flex items-start self-stretch mt-2 mb-[7px] gap-[25px]">
                      <span className="text-[#868C98] text-[15px] whitespace-nowrap">Nov. 11</span>
                      <span className="text-[#040E1B] text-[15px] whitespace-nowrap">9:00am</span>
                    </div>
                    <div className="self-stretch h-[18px] mb-12"></div>
                  </div>
                  <div className="flex flex-col items-start bg-white flex-1 min-w-[148px] pl-[82px] border border-solid border-[#D4E1EA]">
                    <span className="text-[#040E1B] text-[15px] mt-2 mb-[73px] whitespace-nowrap">5:00pm</span>
                  </div>
                  <div className="flex flex-col items-start bg-white flex-1 min-w-[148px] pt-2 px-[1px] border border-solid border-[#D4E1EA]">
                    <div className="flex flex-col items-end self-stretch">
                      <span className="text-[#040E1B] text-[15px] whitespace-nowrap">4:30pm</span>
                    </div>
                    <button onClick={() => handleEventClick({ caseNo: 'CM/0245/2023', judge: 'Judge Nkrumah', time: '4:30pm' })} className="flex flex-col items-start bg-[#EDEAE8] text-left p-2 gap-1 rounded-lg border-l-4 border-gray-500 cursor-pointer hover:opacity-90 transition-opacity">
                      <span className="text-[#525866] text-sm font-bold whitespace-nowrap">CM/0245/2023</span>
                      <span className="text-[#525866] text-xs whitespace-nowrap">Judge Nkrumah</span>
                      <span className="text-[#525866] text-xs whitespace-nowrap">4:30pm</span>
                    </button>
                  </div>
                  <div className="flex flex-col items-start bg-white flex-1 min-w-[148px] pl-[82px] border border-solid border-[#D4E1EA]">
                    <span className="text-[#040E1B] text-[15px] mt-2 mb-[73px] whitespace-nowrap">4:00pm</span>
                  </div>
                </div>

                {/* Row 4 */}
                <div className="flex items-start w-full">
                  <div className="flex flex-col items-start bg-white w-[19px] px-1 flex-shrink-0">
                    <span className="text-[#868C98] text-[9px] mt-2 mb-20 whitespace-nowrap">4</span>
                  </div>
                  <div className="flex flex-col items-start bg-white w-[148px] pl-[78px] mr-[1px] border border-solid border-[#D4E1EA] flex-shrink-0">
                    <span className="text-[#040E1B] text-[15px] mt-2 mb-[73px] whitespace-nowrap">11:00am</span>
                  </div>
                  <div className="flex flex-col items-start bg-white flex-1 min-w-[148px] pl-[77px] border border-solid border-[#D4E1EA]">
                    <span className="text-[#040E1B] text-[15px] mt-2 mb-[73px] whitespace-nowrap">11:30am</span>
                  </div>
                  <div className="flex flex-col items-start bg-white flex-1 min-w-[148px] pl-[74px] border border-solid border-[#D4E1EA]">
                    <span className="text-[#040E1B] text-[15px] mt-2 mb-[73px] whitespace-nowrap">12:00pm</span>
                  </div>
                  <div className="flex flex-col items-start bg-white flex-1 min-w-[148px] pl-[75px] mr-[1px] border border-solid border-[#D4E1EA]">
                    <span className="text-[#040E1B] text-[15px] mt-2 mb-[73px] whitespace-nowrap">12:30pm</span>
                  </div>
                  <div className="flex flex-col items-start bg-white flex-1 min-w-[148px] pt-2 border border-solid border-[#D4E1EA]">
                    <span className="text-[#040E1B] text-[15px] ml-[84px] mr-2.5 whitespace-nowrap">1:00pm</span>
                    <button onClick={() => handleEventClick({ caseNo: 'CM/0245/2023', judge: 'Judge Nkrumah', time: '1:00pm' })} className="flex flex-col items-start bg-[#F9F3CE] text-left py-[7px] px-2 gap-1 rounded-lg border-l-4 border-amber-500 cursor-pointer hover:opacity-90 transition-opacity">
                      <span className="text-[#F59E0B] text-sm font-bold whitespace-nowrap">CM/0245/2023</span>
                      <span className="text-[#F59E0B] text-xs whitespace-nowrap">Judge Nkrumah</span>
                      <span className="text-[#F59E0B] text-xs whitespace-nowrap">1:00pm</span>
                    </button>
                  </div>
                  <div className="flex flex-col items-start bg-white flex-1 min-w-[148px] pl-[84px] border border-solid border-[#D4E1EA]">
                    <span className="text-[#040E1B] text-[15px] mt-2 mb-[73px] whitespace-nowrap">1:30pm</span>
                  </div>
                  <div className="flex flex-col items-start bg-white flex-1 min-w-[148px] pl-[83px] border border-solid border-[#D4E1EA]">
                    <span className="text-[#040E1B] text-[15px] mt-2 mb-[73px] whitespace-nowrap">2:00pm</span>
                  </div>
                </div>

                {/* Row 5 */}
                <div className="flex items-start w-full">
                  <div className="flex flex-col items-start bg-white w-[19px] px-1 flex-shrink-0">
                    <span className="text-[#868C98] text-[9px] mt-2 mb-20 whitespace-nowrap">5</span>
                  </div>
                  <div className="flex flex-col items-start bg-white w-[148px] pl-[82px] mr-[1px] border border-solid border-[#D4E1EA] flex-shrink-0">
                    <span className="text-[#040E1B] text-[15px] mt-2 mb-[73px] whitespace-nowrap">3:00pm</span>
                  </div>
                  <div className="flex flex-col items-start bg-white flex-1 min-w-[148px] pl-[82px] border border-solid border-[#D4E1EA]">
                    <span className="text-[#040E1B] text-[15px] mt-2 mb-[73px] whitespace-nowrap">2:30pm</span>
                  </div>
                  <div className="flex flex-col items-start bg-white flex-1 min-w-[148px] px-[45px] border border-solid border-[#D4E1EA]">
                    <span className="text-[#040E1B] text-[15px] mt-2 mb-[73px] whitespace-nowrap">3:30pm</span>
                  </div>
                  <div className="flex flex-col items-start bg-white flex-1 min-w-[148px] pl-[82px] mr-[1px] border border-solid border-[#D4E1EA]">
                    <span className="text-[#040E1B] text-[15px] mt-2 mb-[73px] whitespace-nowrap">4:00pm</span>
                  </div>
                  <div className="flex flex-col items-start bg-white flex-1 min-w-[148px] pl-[81px] border border-solid border-[#D4E1EA]">
                    <span className="text-[#040E1B] text-[15px] mt-2 mb-[73px] whitespace-nowrap">4:30pm</span>
                  </div>
                  <div className="flex flex-col items-start bg-white flex-1 min-w-[148px] pl-[82px] border border-solid border-[#D4E1EA]">
                    <span className="text-[#040E1B] text-[15px] mt-2 mb-[73px] whitespace-nowrap">5:00pm</span>
                  </div>
                  <div className="flex flex-col items-start bg-white flex-1 min-w-[148px] pl-[83px] border border-solid border-[#D4E1EA]">
                    <span className="text-[#040E1B] text-[15px] mt-2 mb-[73px] whitespace-nowrap">5:30pm</span>
                  </div>
                </div>
              </div>
            </div>
            </div>
          )}

          {/* This Week View - Table */}
          {timePeriod === 'week' && (
            <div className="flex flex-col items-start w-full gap-4 px-6">
              <div className="flex flex-col w-full bg-white py-4 gap-4 rounded-3xl">
                <div className="flex justify-between items-start w-full px-4">
                  <div className="flex-1 pb-0.5 mr-4">
                    <div className="flex items-center self-stretch bg-[#F7F8FA] py-[7px] px-2 gap-1.5 rounded-[5px] border border-solid border-[#F7F8FA]">
                      <img src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Iq8V0MifpP/dkfzwodi_expires_30_days.png" className="w-[11px] h-[11px] object-fill" />
                      <input type="text" placeholder="Search here" className="flex-1 text-[#868C98] bg-transparent text-[10px] border-0 outline-none" />
                    </div>
                  </div>
                  <div className="flex items-start w-[125px] gap-[7px]">
                    <div className="flex items-center w-[61px] py-[7px] px-[9px] gap-1.5 rounded border border-solid border-[#D4E1EA] cursor-pointer hover:bg-gray-50">
                      <img src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Iq8V0MifpP/ck5ozu9h_expires_30_days.png" className="w-[11px] h-[11px] rounded object-fill" />
                      <span className="text-[#525866] text-xs whitespace-nowrap">Filter</span>
                    </div>
                    <div className="flex items-center w-[57px] py-[7px] px-[9px] gap-[5px] rounded border border-solid border-[#D4E1EA] cursor-pointer hover:bg-gray-50">
                      <img src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Iq8V0MifpP/v92lz9jr_expires_30_days.png" className="w-[11px] h-[11px] rounded object-fill" />
                      <span className="text-[#525866] text-xs whitespace-nowrap">Sort</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col w-full gap-1 rounded-[14px] border border-solid border-[#E5E8EC] overflow-hidden">
                  <div className="flex items-start w-full bg-[#F4F6F9] py-4 px-4 gap-3">
                    <div className="flex flex-col items-start w-[20%] py-[7px]">
                      <span className="text-[#070810] text-sm font-bold whitespace-nowrap">Title</span>
                    </div>
                    <div className="flex flex-col items-start w-[12%] py-[7px]">
                      <span className="text-[#070810] text-sm font-bold whitespace-nowrap">Case No.</span>
                    </div>
                    <div className="flex flex-col items-start w-[12%] py-[7px]">
                      <span className="text-[#070810] text-sm font-bold whitespace-nowrap">First Party</span>
                    </div>
                    <div className="flex flex-col items-start w-[12%] py-[7px]">
                      <span className="text-[#070810] text-sm font-bold whitespace-nowrap">Second Party</span>
                    </div>
                    <div className="flex flex-col items-start w-[15%] py-[7px]">
                      <span className="text-[#070810] text-sm font-bold whitespace-nowrap">Judge's name</span>
                    </div>
                    <div className="flex flex-col items-start w-[13%] py-[7px]">
                      <span className="text-[#070810] text-sm font-bold whitespace-nowrap">Hearing date</span>
                    </div>
                    <div className="flex flex-col items-start w-[11%] py-[7px]">
                      <span className="text-[#070810] text-sm font-bold whitespace-nowrap">Hearing time</span>
                    </div>
                    <div className="w-[5%] flex-shrink-0 py-[7px] flex justify-center">
                      <span className="text-[#070810] text-sm font-bold whitespace-nowrap">Actions</span>
                    </div>
                  </div>

                  {weekCases.map((caseItem, idx) => (
                    <div key={idx} className="flex items-center w-full py-3 px-4 gap-3">
                      <div className="flex flex-col items-start w-[20%] py-[7px]">
                        <span className="text-[#070810] text-sm whitespace-nowrap overflow-hidden text-ellipsis w-full">{caseItem.title}</span>
                      </div>
                      <div className="flex flex-col items-start w-[12%] py-[7px]">
                        <span className="text-[#070810] text-sm whitespace-nowrap overflow-hidden text-ellipsis w-full">{caseItem.caseNo}</span>
                      </div>
                      <div className="flex flex-col items-start w-[12%] py-[7px]">
                        <span className="text-[#070810] text-sm whitespace-nowrap overflow-hidden text-ellipsis w-full">{caseItem.firstParty}</span>
                      </div>
                      <div className="flex flex-col items-start w-[12%] py-[7px]">
                        <span className="text-[#070810] text-sm whitespace-nowrap overflow-hidden text-ellipsis w-full">{caseItem.secondParty}</span>
                      </div>
                      <div className="flex flex-col items-start w-[15%] py-[7px]">
                        <span className="text-[#070810] text-sm whitespace-nowrap overflow-hidden text-ellipsis w-full">{caseItem.judge}</span>
                      </div>
                      <div className="flex flex-col items-start w-[13%] py-[7px]">
                        <span className="text-[#070810] text-sm whitespace-nowrap overflow-hidden text-ellipsis w-full">{caseItem.hearingDate}</span>
                      </div>
                      <div className="flex flex-col items-start w-[11%] py-[7px]">
                        <span className="text-[#070810] text-sm whitespace-nowrap overflow-hidden text-ellipsis w-full">{caseItem.hearingTime}</span>
                      </div>
                      <div className="w-[5%] flex-shrink-0 flex items-center justify-center py-[7px]">
                        <img src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Iq8V0MifpP/ybor38kf_expires_30_days.png" className="w-4 h-4 object-fill cursor-pointer hover:opacity-70" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-start w-full mx-4">
                <span className="text-[#525866] text-sm mr-[42px] whitespace-nowrap">110-120 of 1,250</span>
                <button className="flex items-start bg-white text-left w-[70px] py-2 px-3 mr-1.5 gap-1 rounded border border-solid border-[#D4E1EA] hover:bg-gray-50">
                  <img src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Iq8V0MifpP/kkliohn7_expires_30_days.png" className="w-4 h-4 rounded object-fill" />
                  <span className="text-[#525866] text-xs whitespace-nowrap">Back</span>
                </button>
                <div className="flex flex-col items-start bg-[#022658] w-[21px] py-[7px] px-2 mr-1.5 rounded">
                  <span className="text-white text-xs font-bold whitespace-nowrap">1</span>
                </div>
                <img src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Iq8V0MifpP/giw1vjiq_expires_30_days.png" className="w-[31px] h-[31px] mr-1.5 object-fill" />
                <div className="flex flex-col items-start bg-white w-[31px] py-[7px] px-2 mr-1.5 rounded border border-solid border-[#D4E1EA]">
                  <span className="text-[#525866] text-xs whitespace-nowrap">98</span>
                </div>
                <div className="flex flex-col items-start bg-white w-[31px] py-[7px] px-2 mr-1.5 rounded border border-solid border-[#D4E1EA]">
                  <span className="text-[#525866] text-xs whitespace-nowrap">99</span>
                </div>
                <div className="flex flex-col items-start bg-white w-[37px] py-[7px] px-2 mr-1.5 rounded border border-solid border-[#D4E1EA]">
                  <span className="text-[#525866] text-xs whitespace-nowrap">100</span>
                </div>
                <div className="flex flex-col items-start bg-white w-[41px] py-[7px] px-3 mr-1.5 rounded border border-solid border-[#D4E1EA]">
                  <span className="text-[#525866] text-xs whitespace-nowrap">101</span>
                </div>
                <div className="flex flex-col items-start bg-white w-[35px] py-[7px] px-2 mr-1.5 rounded border border-solid border-[#D4E1EA]">
                  <span className="text-[#525866] text-xs whitespace-nowrap">102</span>
                </div>
                <div className="flex flex-col items-start bg-white w-[35px] py-[7px] px-2 mr-1.5 rounded border border-solid border-[#D4E1EA]">
                  <span className="text-[#525866] text-xs whitespace-nowrap">103</span>
                </div>
                <img src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Iq8V0MifpP/5zukcpb5_expires_30_days.png" className="w-[31px] h-[31px] mr-1.5 object-fill" />
                <div className="flex flex-col items-start bg-white w-[34px] py-[7px] px-2 mr-1.5 rounded border border-solid border-[#D4E1EA]">
                  <span className="text-[#525866] text-xs whitespace-nowrap">125</span>
                </div>
                <button className="flex items-start bg-white text-left w-[68px] py-2 px-3 mr-10 gap-1.5 rounded border border-solid border-[#D4E1EA] hover:bg-gray-50">
                  <span className="text-[#525866] text-xs whitespace-nowrap">Next</span>
                  <img src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Iq8V0MifpP/4uzc12a6_expires_30_days.png" className="w-4 h-4 rounded object-fill" />
                </button>
                <div className="flex items-center w-[119px]">
                  <span className="text-[#040E1B] text-sm mr-[11px] whitespace-nowrap">Page</span>
                  <div className="flex flex-col items-start bg-white w-[51px] py-[5px] pl-2 mr-2 rounded border border-solid border-[#F59E0B]">
                    <span className="text-[#040E1B] text-sm whitespace-nowrap">101</span>
                  </div>
                  <span className="text-[#F59E0B] text-sm font-bold cursor-pointer hover:underline whitespace-nowrap">Go</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Drawer */}
      {showDrawer && selectedEvent && (
        <CauseListDrawer
          event={selectedEvent}
          onClose={() => {
            setShowDrawer(false);
            setSelectedEvent(null);
          }}
        />
      )}
    </div>
  );
};

export default CauseListPage;

