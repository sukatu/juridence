import React, { useState, useEffect, useRef } from 'react';
import { Bell, ChevronRight, ChevronLeft, CreditCard, ChevronDown } from 'lucide-react';
import { apiGet } from '../utils/api';
import CorporateClientPersonsListView from './CorporateClientPersonsListView';

const CorporateClientPersonsEntitySelector = ({ userInfo, industry, onSelectEntity, onBack }) => {
  const [selectedEntity, setSelectedEntity] = useState(null);
  const [entities, setEntities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRegion, setSelectedRegion] = useState('Region');
  const [selectedTown, setSelectedTown] = useState('Town');
  const [showRegionDropdown, setShowRegionDropdown] = useState(false);
  const [showTownDropdown, setShowTownDropdown] = useState(false);
  const [failedLogos, setFailedLogos] = useState(new Set());
  const regionDropdownRef = useRef(null);
  const townDropdownRef = useRef(null);

  const userName = userInfo?.first_name && userInfo?.last_name 
    ? `${userInfo.first_name} ${userInfo.last_name}` 
    : 'Tonia Martins';
  const organizationName = userInfo?.organization || 'Access Bank';

  const regions = [
    'Region',
    'Greater Accra',
    'Ashanti',
    'Central',
    'Eastern',
    'Northern',
    'Western',
    'Volta',
    'Upper East',
    'Upper West',
    'Bono',
    'Bono East',
    'Ahafo',
    'Savannah',
    'North East',
    'Oti',
    'Western North'
  ];

  const towns = [
    'Town',
    'Accra',
    'Kumasi',
    'Tamale',
    'Takoradi',
    'Cape Coast',
    'Sunyani',
    'Ho',
    'Koforidua',
    'Wa',
    'Bolgatanga'
  ];

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (regionDropdownRef.current && !regionDropdownRef.current.contains(event.target)) {
        setShowRegionDropdown(false);
      }
      if (townDropdownRef.current && !townDropdownRef.current.contains(event.target)) {
        setShowTownDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Generate initials for bank logo fallback
  const getBankInitials = (bankName) => {
    if (!bankName) return 'BK';
    const words = bankName.split(' ');
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return bankName.substring(0, 2).toUpperCase();
  };

  useEffect(() => {
    const fetchEntities = async () => {
      try {
        setIsLoading(true);
        // Fetch banks from the API
        const result = await apiGet('/admin/banks?limit=100');
        
        let banksData = [];
        
        if (result && result.banks && Array.isArray(result.banks)) {
          banksData = result.banks;
        } else if (result && result.data && result.data.banks) {
          banksData = result.data.banks;
        } else if (result && result.data && Array.isArray(result.data)) {
          banksData = result.data;
        } else if (Array.isArray(result)) {
          banksData = result;
        }

        if (banksData && banksData.length > 0) {
          const mappedEntities = banksData.map((bank, idx) => ({
            id: bank._id || bank.id || `bank-${idx}`,
            name: bank.name || bank.bank_name || bank.bankName || `Bank ${idx + 1}`,
            logoUrl: bank.logo_url || bank.logo,
            initials: getBankInitials(bank.name || bank.bank_name || bank.bankName),
            data: bank
          }));
          setEntities(mappedEntities);
        } else {
          // Fallback sample data
          const sampleBanks = [
            'Access Bank', 'Absa Bank', 'Bank of Ghana', 'Cal Bank',
            'Eco Bank', 'FBN Bank', 'Fidelity Bank', 'First Atlantic Bank',
            'GCB Bank', 'GTB Bank', 'National Investment Bank', 'OmniBSIC Bank',
            'Heritage Bank', 'Standard Chartered Bank', 'UBA Bank', 'Zenith Bank'
          ];
          setEntities(sampleBanks.map((name, idx) => ({
            id: `bank-${idx}`,
            name,
            logoUrl: null,
            initials: getBankInitials(name)
          })));
        }
      } catch (error) {
        console.error('Error fetching banks:', error);
        // Fallback sample data on error
        const sampleBanks = [
          'Access Bank', 'Absa Bank', 'Bank of Ghana', 'Cal Bank',
          'Eco Bank', 'FBN Bank', 'Fidelity Bank', 'First Atlantic Bank',
          'GCB Bank', 'GTB Bank', 'National Investment Bank', 'OmniBSIC Bank',
          'Heritage Bank', 'Standard Chartered Bank', 'UBA Bank', 'Zenith Bank'
        ];
        setEntities(sampleBanks.map((name, idx) => ({
          id: `bank-${idx}`,
          name,
          logoUrl: null,
          initials: getBankInitials(name)
        })));
      } finally {
        setIsLoading(false);
      }
    };

    if (industry && industry.id === 'banking') {
      fetchEntities();
    }
  }, [industry]);

  const handleEntityClick = (entity) => {
    setSelectedEntity(entity);
    if (onSelectEntity) {
      onSelectEntity(entity);
    }
  };

  const handleBackToList = () => {
    setSelectedEntity(null);
  };

  const handlePersonSelect = (person) => {
    // Handle person selection - can navigate to person details
    console.log('Selected person:', person);
  };

  // If an entity is selected, show the persons list
  if (selectedEntity) {
    return (
      <CorporateClientPersonsListView
        userInfo={userInfo}
        industry={industry}
        entity={selectedEntity}
        onBack={handleBackToList}
        onSelectPerson={handlePersonSelect}
      />
    );
  }

  // Group entities into rows of 4
  const groupedEntities = [];
  for (let i = 0; i < entities.length; i += 4) {
    groupedEntities.push(entities.slice(i, i + 4));
  }

  return (
    <div className="flex-1 bg-[#F7F8FA] pr-6 rounded-lg">
      <div className="flex items-start gap-6">
        {/* Main Content */}
        <div className="flex-1 flex flex-col bg-[#F7F8FA] pt-2 pb-[52px] gap-4">
          {/* Header */}
          <div className="flex items-center self-stretch py-2 px-1.5 gap-[50px] rounded border-b border-[#D4E1EA]">
            <div className="flex flex-col items-start w-[263px] gap-1">
              <span className="text-[#050F1C] text-xl font-medium">
                {organizationName},
              </span>
              <span className="text-[#050F1C] text-base font-normal opacity-75">
                Track all your activities here.
              </span>
            </div>
            <div className="flex items-start flex-1 gap-4">
              {/* Search Bar */}
              <div className="flex justify-between items-center flex-1 pr-2 rounded-lg border border-solid border-[#D4E1EA] bg-white h-11">
                <input
                  type="text"
                  placeholder="Search companies and persons here"
                  className="flex-1 self-stretch text-[#525866] bg-transparent text-xs py-3.5 pl-2 mr-1 border-0 outline-none"
                />
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 border border-[#868C98] rounded"></div>
                  <span className="text-[#868C98] text-sm">|</span>
                  <div className="flex items-center bg-white w-12 py-1 px-1 gap-0.5 rounded">
                    <span className="text-[#525866] text-xs font-bold">All</span>
                    <ChevronRight className="w-3 h-3 text-[#141B34] rotate-90" />
                  </div>
                </div>
              </div>
              
              {/* Notification and User Profile */}
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#F7F8FA] rounded-full border border-[#D4E1EA]">
                  <Bell className="w-5 h-5 text-[#022658]" />
                </div>
                <div className="flex items-center gap-1.5">
                  <img
                    src={userInfo?.profile_picture || '/images/image.png'}
                    alt="User"
                    className="w-9 h-9 rounded-full object-cover"
                    onError={(e) => {
                      e.target.src = '/images/image.png';
                    }}
                  />
                  <div className="flex flex-col items-start gap-1">
                    <div className="flex items-center gap-0.5">
                      <span className="text-[#050F1C] text-base font-bold whitespace-nowrap">
                        {userName}
                      </span>
                      <ChevronRight className="w-3 h-3 text-[#141B34] rotate-90" />
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-[#10B981] rounded-full"></div>
                      <span className="text-[#525866] text-xs">
                        Online
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex flex-col self-stretch bg-white py-4 px-4 gap-6 rounded-lg">
            {/* Breadcrumb */}
            <div className="flex items-center gap-1">
              <span className="text-[#525866] text-xs font-normal opacity-75">
                PERSONS
              </span>
              <ChevronRight className="w-4 h-4 text-[#7B8794]" />
              <span className="text-[#050F1C] text-xs font-normal">
                {industry?.name?.toUpperCase() || 'BANKING & FINANCE'}
              </span>
            </div>

            {/* Title Section */}
            <div className="flex justify-between items-start self-stretch">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-1">
                  <button
                    onClick={onBack}
                    className="p-2 bg-[#F7F8FA] rounded-lg hover:opacity-70"
                  >
                    <ChevronLeft className="w-4 h-4 text-[#050F1C]" />
                  </button>
                  <CreditCard className="w-4 h-4 text-[#050F1C]" />
                  <span className="text-[#050F1C] text-xl font-semibold" style={{ fontFamily: 'Roboto' }}>
                    Persons
                  </span>
                </div>
                <span className="text-[#070810] text-sm font-normal opacity-75" style={{ fontFamily: 'Roboto' }}>
                  Search through all the persons in our database
                </span>
              </div>
              <div className="flex items-center gap-6">
                <span className="text-[#525866] text-xs font-normal opacity-75">
                  Show data for
                </span>
                {/* Region Dropdown */}
                <div className="relative" ref={regionDropdownRef}>
                  <button
                    onClick={() => {
                      setShowRegionDropdown(!showRegionDropdown);
                      setShowTownDropdown(false);
                    }}
                    className="px-2 py-2 bg-[#F7F8FA] rounded-lg border border-[#D4E1EA] flex items-center gap-1 hover:opacity-70"
                  >
                    <span className="text-[#070810] text-sm font-normal" style={{ fontFamily: 'Roboto' }}>
                      {selectedRegion}
                    </span>
                    <ChevronDown className="w-4 h-4 text-[#525866]" />
                  </button>
                  {showRegionDropdown && (
                    <div className="absolute top-full left-0 mt-1 bg-white border border-[#D4E1EA] rounded-lg shadow-lg z-10 min-w-[200px] max-h-60 overflow-y-auto">
                      {regions.map((region) => (
                        <button
                          key={region}
                          onClick={() => {
                            setSelectedRegion(region);
                            setShowRegionDropdown(false);
                          }}
                          className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm text-[#070810]"
                        >
                          {region}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                {/* Town Dropdown */}
                <div className="relative" ref={townDropdownRef}>
                  <button
                    onClick={() => {
                      setShowTownDropdown(!showTownDropdown);
                      setShowRegionDropdown(false);
                    }}
                    className="px-2 py-2 bg-[#F7F8FA] rounded-lg border border-[#D4E1EA] flex items-center gap-1 hover:opacity-70"
                  >
                    <span className="text-[#070810] text-sm font-normal" style={{ fontFamily: 'Roboto' }}>
                      {selectedTown}
                    </span>
                    <ChevronDown className="w-4 h-4 text-[#525866]" />
                  </button>
                  {showTownDropdown && (
                    <div className="absolute top-full left-0 mt-1 bg-white border border-[#D4E1EA] rounded-lg shadow-lg z-10 min-w-[200px] max-h-60 overflow-y-auto">
                      {towns.map((town) => (
                        <button
                          key={town}
                          onClick={() => {
                            setSelectedTown(town);
                            setShowTownDropdown(false);
                          }}
                          className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm text-[#070810]"
                        >
                          {town}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Bank Cards Grid */}
            {isLoading ? (
              <div className="flex justify-center items-center py-20">
                <span className="text-[#525866] text-base">Loading banks...</span>
              </div>
            ) : (
              <div className="flex flex-col self-stretch gap-6">
                {groupedEntities.map((row, rowIndex) => (
                  <div key={rowIndex} className="flex items-start self-stretch gap-6">
                    {row.map((entity) => (
                      <button
                        key={entity.id}
                        onClick={() => handleEntityClick(entity)}
                        className="flex-1 h-[200px] py-4 px-4 bg-white rounded-lg border border-[#D4E1EA] flex flex-col justify-center items-center gap-2 hover:opacity-90 transition-opacity"
                        style={{ boxShadow: '4px 4px 4px rgba(7, 8, 16, 0.10)' }}
                      >
                        <div className="flex flex-col justify-center items-center gap-2">
                          {entity.logoUrl && !failedLogos.has(entity.id) ? (
                            <img
                              src={entity.logoUrl}
                              alt={entity.name}
                              className="w-10 h-10 rounded-lg object-cover"
                              onError={() => {
                                setFailedLogos(prev => new Set([...prev, entity.id]));
                              }}
                            />
                          ) : (
                            <div
                              className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-sm font-bold"
                              style={{ background: '#022658' }}
                            >
                              {entity.initials}
                            </div>
                          )}
                          <span className="text-[#050F1C] text-lg font-medium">
                            {entity.name}
                          </span>
                        </div>
                        <span className="self-stretch text-center text-[#525866] text-base font-normal">
                          View and track system activities of this Bank.
                        </span>
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CorporateClientPersonsEntitySelector;

