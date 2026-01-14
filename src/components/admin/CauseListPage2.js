import React, { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown, Bell, ChevronRight, Plus, ArrowLeft } from 'lucide-react';
import CauseListDrawer from './CauseListDrawer';
import AddRegistryForm from '../AddRegistryForm';
import AddJudgeForm from '../AddJudgeForm';
import RegistryCourtsView from '../RegistryCourtsView';
import JudgesListView from '../JudgesListView';
import ViewCauseListPage from '../ViewCauseListPage';
import AdminHeader from './AdminHeader';
import { apiGet } from '../../utils/api';

const CauseListPage2 = ({ userInfo, onNavigate, onLogout }) => {
  const [selectedCourt, setSelectedCourt] = useState(null);
  const [selectedRegistry, setSelectedRegistry] = useState(null);
  const [showAddRegistryForm, setShowAddRegistryForm] = useState(false);
  const [showAddJudgeForm, setShowAddJudgeForm] = useState(false);
  const [showCourtsView, setShowCourtsView] = useState(false);
  const [showJudgesView, setShowJudgesView] = useState(false);
  const [viewingRegistry, setViewingRegistry] = useState(null);
  const [judgesViewingRegistry, setJudgesViewingRegistry] = useState(null);
  const [showCauseListView, setShowCauseListView] = useState(false);
  const [viewingCauseListRegistry, setViewingCauseListRegistry] = useState(null);
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

  // Fetch registries when a court is selected
  useEffect(() => {
    if (selectedCourt) {
      fetchRegistries();
    }
  }, [selectedCourt]);

  const fetchRegistries = async () => {
    if (!selectedCourt) return;
    
    try {
      setLoadingRegistries(true);
      // Map court name to CourtType enum
      const courtTypeMap = {
        'Supreme Court': 'SUPREME_COURT',
        'Court of Appeal': 'COURT_OF_APPEAL',
        'High Court': 'HIGH_COURT',
        'Circuit Court': 'CIRCUIT_COURT',
        'District Court': 'DISTRICT_COURT',
        'Magistrate Court': 'MAGISTRATE_COURT'
      };
      
      const courtType = courtTypeMap[selectedCourt.name] || selectedCourt.name.toUpperCase().replace(/\s+/g, '_');
      
      const response = await apiGet(`/api/courts/search?court_type=${courtType}`);
      
      if (response && Array.isArray(response)) {
        // Group by registry_name
        const registryMap = {};
        response.forEach(court => {
          const registryName = court.registry_name || 'General';
          if (!registryMap[registryName]) {
            registryMap[registryName] = {
              name: registryName,
              division: court.division || 'General',
              region: court.region || 'N/A',
              registryCode: court.registry_code || 'N/A',
              location: court.location || 'N/A',
              courts: []
            };
          }
          registryMap[registryName].courts.push(court);
        });
        
        setRegistries(Object.values(registryMap));
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

  // Handle click outside to close dropdowns
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

  const handleCourtClick = (court) => {
    setSelectedCourt(court);
    setShowCourtsView(false);
    setShowJudgesView(false);
    setShowCauseListView(false);
  };

  const handleBackToCourts = () => {
    setSelectedCourt(null);
    setSelectedRegistry(null);
    setShowCourtsView(false);
    setShowJudgesView(false);
    setShowCauseListView(false);
    setViewingRegistry(null);
    setJudgesViewingRegistry(null);
    setViewingCauseListRegistry(null);
  };

  const handleAddRegistry = () => {
    setShowAddRegistryForm(true);
  };

  const handleAddCourt = (registry) => {
    setSelectedRegistry(registry);
    setShowCourtsView(true);
    setViewingRegistry(registry);
  };

  const handleAddJudge = (registry) => {
    setSelectedRegistry(registry);
    setShowJudgesView(true);
    setJudgesViewingRegistry(registry);
  };

  const handleCauseLists = (registry) => {
    setSelectedRegistry(registry);
    setShowCauseListView(true);
    setViewingCauseListRegistry(registry);
  };

  const handleBackFromRegistry = () => {
    setShowAddRegistryForm(false);
    fetchRegistries();
  };

  const handleBackFromCourt = () => {
    setShowCourtsView(false);
    setViewingRegistry(null);
    setSelectedRegistry(null);
  };

  const handleBackFromJudge = () => {
    setShowJudgesView(false);
    setJudgesViewingRegistry(null);
    setSelectedRegistry(null);
  };

  const handleBackFromCauseList = () => {
    setShowCauseListView(false);
    setViewingCauseListRegistry(null);
    setSelectedRegistry(null);
  };

  // Sample courts data
  const courts = [
    { id: 1, name: 'Supreme Court', icon: '⚖️' },
    { id: 2, name: 'Court of Appeal', icon: '⚖️' },
    { id: 3, name: 'High Court', icon: '⚖️' },
    { id: 4, name: 'Circuit Court', icon: '⚖️' },
    { id: 5, name: 'District Court', icon: '⚖️' },
    { id: 6, name: 'Magistrate Court', icon: '⚖️' }
  ];

  // Filter registries based on search
  const filteredRegistries = registries.filter(registry => {
    const searchLower = registrySearchQuery.toLowerCase();
    return (
      registry.name.toLowerCase().includes(searchLower) ||
      registry.division.toLowerCase().includes(searchLower) ||
      registry.region.toLowerCase().includes(searchLower) ||
      registry.registryCode.toLowerCase().includes(searchLower) ||
      registry.location.toLowerCase().includes(searchLower)
    );
  });

  const userName = userInfo?.first_name && userInfo?.last_name 
    ? `${userInfo.first_name} ${userInfo.last_name}` 
    : 'Admin User';

  // If showing cause list view, render ViewCauseListPage
  if (showCauseListView && viewingCauseListRegistry) {
    return (
      <div className="w-full h-screen bg-[#F7F8FA] flex flex-col">
        <AdminHeader 
          userInfo={userInfo} 
          onNavigate={onNavigate} 
          onLogout={onLogout}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedFilter={selectedFilter}
          setSelectedFilter={setSelectedFilter}
          showFilterDropdown={showFilterDropdown}
          setShowFilterDropdown={setShowFilterDropdown}
          filterDropdownRef={filterDropdownRef}
        />
        <ViewCauseListPage
          registry={viewingCauseListRegistry}
          onBack={handleBackFromCauseList}
        />
      </div>
    );
  }

  // If showing courts view
  if (showCourtsView && viewingRegistry) {
    return (
      <div className="w-full h-screen bg-[#F7F8FA] flex flex-col">
        <AdminHeader 
          userInfo={userInfo} 
          onNavigate={onNavigate} 
          onLogout={onLogout}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedFilter={selectedFilter}
          setSelectedFilter={setSelectedFilter}
          showFilterDropdown={showFilterDropdown}
          setShowFilterDropdown={setShowFilterDropdown}
          filterDropdownRef={filterDropdownRef}
        />
        <RegistryCourtsView
          registry={viewingRegistry}
          onBack={handleBackFromCourt}
        />
      </div>
    );
  }

  // If showing judges view
  if (showJudgesView && judgesViewingRegistry) {
    return (
      <div className="w-full h-screen bg-[#F7F8FA] flex flex-col">
        <AdminHeader 
          userInfo={userInfo} 
          onNavigate={onNavigate} 
          onLogout={onLogout}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedFilter={selectedFilter}
          setSelectedFilter={setSelectedFilter}
          showFilterDropdown={showFilterDropdown}
          setShowFilterDropdown={setShowFilterDropdown}
          filterDropdownRef={filterDropdownRef}
        />
        <JudgesListView
          registry={judgesViewingRegistry}
          onBack={handleBackFromJudge}
        />
      </div>
    );
  }

  // If showing add registry form
  if (showAddRegistryForm) {
    return (
      <div className="w-full h-screen bg-[#F7F8FA] flex flex-col">
        <AdminHeader 
          userInfo={userInfo} 
          onNavigate={onNavigate} 
          onLogout={onLogout}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedFilter={selectedFilter}
          setSelectedFilter={setSelectedFilter}
          showFilterDropdown={showFilterDropdown}
          setShowFilterDropdown={setShowFilterDropdown}
          filterDropdownRef={filterDropdownRef}
        />
        <AddRegistryForm
          court={selectedCourt}
          onBack={handleBackFromRegistry}
        />
      </div>
    );
  }

  // Main view - show courts or registries
  return (
    <div className="w-full h-screen bg-[#F7F8FA] flex flex-col">
      <AdminHeader 
        userInfo={userInfo} 
        onNavigate={onNavigate} 
        onLogout={onLogout}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedFilter={selectedFilter}
        setSelectedFilter={setSelectedFilter}
        showFilterDropdown={showFilterDropdown}
        setShowFilterDropdown={setShowFilterDropdown}
        filterDropdownRef={filterDropdownRef}
      />
      
      <div className="flex-1 overflow-y-auto px-6 py-4">
        {!selectedCourt ? (
          // Show courts
          <div className="max-w-7xl mx-auto">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-[#050F1C]">Court Registry</h1>
              <p className="text-[#525866] text-sm mt-1">Select a court to view registries</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {courts.map((court) => (
                <div
                  key={court.id}
                  onClick={() => handleCourtClick(court)}
                  className="bg-white rounded-lg border border-[#D4E1EA] p-6 cursor-pointer hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-4">
                    <div className="text-4xl">{court.icon}</div>
                    <div>
                      <h3 className="text-lg font-semibold text-[#050F1C]">{court.name}</h3>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          // Show registries for selected court
          <div className="max-w-7xl mx-auto">
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={handleBackToCourts}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ArrowLeft className="w-5 h-5 text-[#525866]" />
                </button>
                <div>
                  <h1 className="text-2xl font-bold text-[#050F1C]">{selectedCourt.name}</h1>
                  <p className="text-[#525866] text-sm mt-1">Select a registry to manage</p>
                </div>
              </div>
            </div>

            {/* Search Registry */}
            <div className="mb-6">
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#525866]" />
                <input
                  type="text"
                  placeholder="Search Registry here"
                  value={registrySearchQuery}
                  onChange={(e) => setRegistrySearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-[#D4E1EA] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#022658]"
                />
              </div>
            </div>

            {loadingRegistries ? (
              <div className="text-center py-12">
                <p className="text-[#525866]">Loading registries...</p>
              </div>
            ) : filteredRegistries.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg border border-[#D4E1EA]">
                <p className="text-[#525866] mb-4">No registries found for this court</p>
                <button
                  onClick={handleAddRegistry}
                  className="px-4 py-2 bg-[#022658] text-white rounded-lg hover:bg-[#033a7a] transition-colors"
                >
                  Add New Registry
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredRegistries.map((registry, index) => (
                  <div
                    key={index}
                    className="bg-white rounded-lg border border-[#D4E1EA] p-6"
                  >
                    <h3 className="text-xl font-bold text-[#050F1C] mb-4">{registry.name}</h3>
                    <div className="space-y-2 mb-4 text-sm">
                      <p><span className="text-[#525866]">Division:</span> <span className="text-[#050F1C] font-medium">{registry.division}</span></p>
                      <p><span className="text-[#525866]">Region:</span> <span className="text-[#050F1C] font-medium">{registry.region}</span></p>
                      <p><span className="text-[#525866]">Registry code:</span> <span className="text-[#050F1C] font-medium">{registry.registryCode}</span></p>
                      <p><span className="text-[#525866]">Location:</span> <span className="text-[#050F1C] font-medium">{registry.location}</span></p>
                    </div>
                    <div className="flex flex-col gap-2 mt-4">
                      <button
                        onClick={() => handleAddCourt(registry)}
                        className="w-full px-4 py-2 bg-[#022658] text-white rounded-lg hover:bg-[#033a7a] transition-colors flex items-center justify-center gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        Add New Court
                      </button>
                      <button
                        onClick={() => handleAddJudge(registry)}
                        className="w-full px-4 py-2 bg-[#022658] text-white rounded-lg hover:bg-[#033a7a] transition-colors flex items-center justify-center gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        Add New Judge
                      </button>
                      <button
                        onClick={() => handleCauseLists(registry)}
                        className="w-full px-4 py-2 bg-[#F59E0B] text-white rounded-lg hover:bg-[#D97706] transition-colors flex items-center justify-center gap-2"
                      >
                        Cause Lists
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CauseListPage2;

