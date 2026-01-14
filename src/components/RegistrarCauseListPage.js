import React, { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown, Bell, ChevronRight } from 'lucide-react';
import AddRegistryForm from './AddRegistryForm';
import AddJudgeForm from './AddJudgeForm';
import RegistryCourtsView from './RegistryCourtsView';
import JudgesListView from './JudgesListView';
import RegistrarHeader from './RegistrarHeader';

const RegistrarCauseListPage = ({ userInfo, onNavigate, onLogout }) => {
  const [selectedCourt, setSelectedCourt] = useState(null);
  const [selectedRegistry, setSelectedRegistry] = useState(null);
  const [showAddRegistryForm, setShowAddRegistryForm] = useState(false);
  const [showAddJudgeForm, setShowAddJudgeForm] = useState(false);
  const [showCourtsView, setShowCourtsView] = useState(false);
  const [showJudgesView, setShowJudgesView] = useState(false);
  const [viewingRegistry, setViewingRegistry] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [registrySearchQuery, setRegistrySearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const filterDropdownRef = useRef(null);

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
  };

  // Sample registry data
  const registries = [
    {
      name: 'High Court',
      division: 'High Court (General)',
      region: 'Greater Accra',
      registryCode: 'HCCM',
      location: '32, High Court Avenue, Greater Accra, Accra, Ghana.'
    }
  ];

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

  // If judges view is shown
  if (showJudgesView && viewingRegistry) {
    return (
      <JudgesListView
        registry={viewingRegistry}
        onBack={() => {
          setShowJudgesView(false);
          setViewingRegistry(null);
        }}
      />
    );
  }

  // If courts view is shown
  if (showCourtsView && selectedRegistry) {
    return (
      <RegistryCourtsView
        registry={selectedRegistry}
        onBack={() => {
          setShowCourtsView(false);
          setSelectedRegistry(null);
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

  // Use userInfo from props or localStorage
  const displayUserInfo = userInfo || JSON.parse(localStorage.getItem('userData') || '{}');

  // If a court is selected, show registry list
  if (selectedCourt) {
    return (
      <div className="bg-[#F7F8FA] min-h-screen">
        {/* Header */}
        <RegistrarHeader userInfo={displayUserInfo} onNavigate={onNavigate} onLogout={onLogout} />

        {/* Main Content */}
        <div className="px-6">
          <div className="flex flex-col bg-white pt-4 pb-[31px] px-3.5 gap-10 rounded-lg">
            <div className="flex flex-col items-start self-stretch gap-4">
              {/* Breadcrumb */}
              <div className="flex items-start">
                <span className="text-[#525866] text-xs mr-1.5 whitespace-nowrap">COURT REGISTRY</span>
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
              <div className="flex flex-wrap items-stretch self-stretch gap-6">
                {/* Registry Cards */}
                {registries.map((registry, index) => (
                  <div
                    key={index}
                    className="flex flex-col items-start bg-white w-[358px] py-4 pl-4 gap-3 rounded-lg border border-solid border-[#D4E1EA]"
                    style={{ boxShadow: '4px 4px 4px #0708101A' }}
                  >
                    <div className="flex flex-col items-start self-stretch mr-4 gap-1">
                      <span className="text-[#040E1B] text-lg font-normal">
                        {registry.name}
                      </span>
                      <span className="text-[#040E1B] text-sm font-normal">
                        Division: {registry.division}
                      </span>
                      <span className="text-[#040E1B] text-sm font-normal">
                        Region: {registry.region}
                      </span>
                      <span className="text-[#040E1B] text-sm font-normal">
                        Registry code: {registry.registryCode}
                      </span>
                      <span className="text-[#040E1B] text-sm font-normal">
                        Location: {registry.location}
                      </span>
                    </div>
                      <div 
                        className="flex items-center gap-[5px] cursor-pointer hover:opacity-70"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedRegistry(registry);
                          setShowCourtsView(true);
                        }}
                      >
                        <span className="text-[#022658] text-base font-normal">
                          Add Courts here
                        </span>
                        <ChevronRight className="w-4 h-4 text-[#022658]" />
                      </div>
                      <div 
                        className="flex items-center gap-[5px] cursor-pointer hover:opacity-70"
                        onClick={(e) => {
                          e.stopPropagation();
                          setViewingRegistry(registry);
                          setShowJudgesView(true);
                        }}
                      >
                        <span className="text-[#022658] text-base font-normal">
                          Add Judges here
                        </span>
                        <ChevronRight className="w-4 h-4 text-[#022658]" />
                      </div>
                    <div className="flex items-center gap-1.5 cursor-pointer hover:opacity-70">
                      <span className="text-[#F59E0B] text-base font-normal">
                        Cause List
                      </span>
                      <ChevronRight className="w-4 h-4 text-[#F59E0B]" />
                    </div>
                  </div>
                ))}

                {/* Add New Registry Button */}
                <button
                  onClick={() => setShowAddRegistryForm(true)}
                  className="flex items-center justify-center bg-white w-[358px] gap-1 rounded-lg border border-solid border-[#D4E1EA] cursor-pointer hover:shadow-lg transition-shadow"
                  style={{ boxShadow: '4px 4px 4px #0708101A' }}
                >
                  <span className="flex-1 text-[#F59E0B] text-base font-normal py-4 pl-4 text-center">
                    Add new Registry here
                  </span>
                  <ChevronRight className="w-4 h-4 text-[#F59E0B] mr-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Court selection view
  return (
    <div className="bg-[#F7F8FA] min-h-screen">
      {/* Header */}
      <RegistrarHeader userInfo={displayUserInfo} onNavigate={onNavigate} onLogout={onLogout} />

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

            {/* Header Section */}
            <div className="flex justify-between items-start self-stretch">
              <div className="flex flex-col items-start w-[290px] gap-2">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedCourt(null)}
                    className="cursor-pointer hover:opacity-70"
                  >
                    <ChevronRight className="w-4 h-4 text-[#525866] rotate-180" />
                  </button>
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
};

export default RegistrarCauseListPage;

