import React, { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown, Bell, ChevronRight, Plus } from 'lucide-react';
import CauseListDrawer from './CauseListDrawer';
import AddRegistryForm from '../AddRegistryForm';
import AddJudgeForm from '../AddJudgeForm';
import RegistryCourtsView from '../RegistryCourtsView';
import JudgesListView from '../JudgesListView';
import AdminHeader from './AdminHeader';
import { apiGet } from '../../utils/api';

const CauseListPage = ({ userInfo, onNavigate, onLogout }) => {
  const [selectedCourt, setSelectedCourt] = useState(null);
  const [selectedRegistry, setSelectedRegistry] = useState(null);
  const [showAddRegistryForm, setShowAddRegistryForm] = useState(false);
  const [showAddJudgeForm, setShowAddJudgeForm] = useState(false);
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

  const handleSaveRegistry = (formData) => {
    // Handle saving the new registry
    console.log('Saving registry:', formData);
    // TODO: Add API call to save registry
  };

  const handleSaveJudge = (formData) => {
    // Handle saving the new judge
    console.log('Saving judge:', formData);
    // TODO: Add API call to save judge
    setShowAddJudgeForm(false);
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
                    Select a Court to create Registry
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

  // If add judge form is shown
  if (showAddJudgeForm) {
    return (
      <AddJudgeForm
        onBack={() => setShowAddJudgeForm(false)}
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
      <div className="bg-[#F7F8FA] min-h-screen">
        {/* Full Width Header */}
        <AdminHeader userInfo={userInfo} onNavigate={onNavigate} onLogout={onLogout} />

        {/* Main Content */}
        <div className="px-6">
          <div className="flex flex-col bg-white pt-4 pb-[31px] px-3.5 gap-10 rounded-lg">
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

              {/* Search Registry */}
              <div className="flex items-center py-3.5 pl-2 gap-2.5 rounded-lg border border-solid border-[#D4E1EA] w-full" style={{ boxShadow: '4px 4px 4px #0708101A' }}>
                <Search className="w-3 h-3 text-[#525866]" />
                <input
                  type="text"
                  placeholder="Search Registry here"
                  value={registrySearchQuery}
                  onChange={(e) => setRegistrySearchQuery(e.target.value)}
                  className="flex-1 text-[#525866] bg-transparent text-xs border-0 outline-none"
                />
              </div>

              {/* Registry Cards and Add New */}
              {loadingRegistries ? (
                <div className="flex items-center justify-center w-full py-8">
                  <span className="text-[#525866] text-sm">Loading registries...</span>
                </div>
              ) : filteredRegistries.length === 0 ? (
                <div className="flex flex-col items-center justify-center w-full py-12 gap-4">
                  <span className="text-[#525866] text-sm">
                    {registrySearchQuery.trim() 
                      ? `No registries found matching "${registrySearchQuery}"`
                      : `No registries found for ${selectedCourt}`
                    }
                  </span>
                  {!registrySearchQuery.trim() && (
                    <button
                      onClick={() => setShowAddRegistryForm(true)}
                      className="flex items-center gap-2 px-6 py-3 bg-[#022658] text-white rounded-lg hover:bg-[#033a7a] transition-colors"
                    >
                      <Plus className="w-5 h-5" />
                      <span>Add New Registry</span>
                    </button>
                  )}
                </div>
              ) : (
                <div className="flex flex-wrap items-stretch self-stretch gap-6">
                  {/* Registry Cards */}
                  {filteredRegistries.map((registry, index) => (
                    <div
                      key={registry.id || index}
                      className="flex flex-col items-start bg-white w-[358px] py-4 pl-4 gap-4 rounded-lg border border-solid border-[#D4E1EA] hover:shadow-lg transition-shadow"
                      style={{ boxShadow: '4px 4px 4px #0708101A' }}
                    >
                      <div className="flex flex-col items-start self-stretch mr-4 gap-2">
                        <span className="text-[#040E1B] text-lg font-semibold">
                          {registry.name}
                        </span>
                        <span className="text-[#040E1B] text-sm font-normal">
                          Division: {registry.division}
                        </span>
                        {registry.region && (
                          <span className="text-[#040E1B] text-sm font-normal">
                            Region: {registry.region}
                          </span>
                        )}
                        {registry.registryCode && (
                          <span className="text-[#040E1B] text-sm font-normal">
                            Registry code: {registry.registryCode}
                          </span>
                        )}
                        {registry.location && (
                          <span className="text-[#040E1B] text-sm font-normal">
                            Location: {registry.location}
                          </span>
                        )}
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="flex flex-col items-start self-stretch gap-2 mr-4">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setViewingRegistry(registry);
                            setShowCourtsView(true);
                          }}
                          className="flex items-center gap-2 px-4 py-2 bg-[#022658] text-white rounded-lg hover:bg-[#033a7a] transition-colors w-full"
                        >
                          <Plus className="w-4 h-4" />
                          <span className="text-sm font-medium">Add New Court</span>
                        </button>
                        
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setJudgesViewingRegistry(registry);
                            setShowJudgesView(true);
                          }}
                          className="flex items-center gap-2 px-4 py-2 bg-[#022658] text-white rounded-lg hover:bg-[#033a7a] transition-colors w-full"
                        >
                          <Plus className="w-4 h-4" />
                          <span className="text-sm font-medium">Add New Judge</span>
                        </button>
                        
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedRegistry(registry);
                          }}
                          className="flex items-center gap-2 px-4 py-2 bg-[#F59E0B] text-white rounded-lg hover:bg-[#d6890a] transition-colors w-full"
                        >
                          <span className="text-sm font-medium">Cause Lists</span>
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* Add New Registry Button */}
                  <button
                    onClick={() => setShowAddRegistryForm(true)}
                    className="flex items-center justify-center bg-white w-[358px] gap-1 rounded-lg border-2 border-dashed border-[#D4E1EA] cursor-pointer hover:border-[#F59E0B] hover:bg-[#F59E0B]/5 transition-all"
                    style={{ boxShadow: '4px 4px 4px #0708101A' }}
                  >
                    <Plus className="w-5 h-5 text-[#F59E0B]" />
                    <span className="text-[#F59E0B] text-base font-normal py-4 text-center">
                      Add New Registry
                    </span>
                  </button>
                </div>
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

