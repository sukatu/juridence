import React, { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown, Bell, ChevronRight, ChevronLeft, Filter, ArrowUpDown } from 'lucide-react';
import ViewCauseListPage from './ViewCauseListPage';

const JudgeCasesPage = ({ judge, registry, onBack }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [goToPage, setGoToPage] = useState('101');
  const [showCauseList, setShowCauseList] = useState(false);
  const [selectedCase, setSelectedCase] = useState(null);
  const filterDropdownRef = useRef(null);

  // Sample cases data
  const [cases, setCases] = useState([
    {
      id: 1,
      title: 'EcoWind Corp. vs. SafeDrive Insurance',
      suitNo: 'CV/1089/2021',
      filedOn: '10-10-1978',
      courtName: 'Business Court',
      location: 'Accra',
      judge: 'Sam Chris',
      status: 'Ongoing'
    },
    {
      id: 2,
      title: 'EcoWind Corp. vs. SafeDrive Insurance',
      suitNo: 'CV/1089/2021',
      filedOn: '03-11-2000',
      courtName: 'Civil Court',
      location: 'Kumasi',
      judge: 'Kwame Louis',
      status: 'Heard'
    },
    {
      id: 3,
      title: 'EcoWind Corp. vs. Wellness Insurance',
      suitNo: 'CV/1089/2021',
      filedOn: '03-11-2000',
      courtName: 'Business Court',
      location: 'Accra',
      judge: 'Barimah John',
      status: 'Heard'
    },
    {
      id: 4,
      title: 'EcoWind Corp. vs. Digital Services',
      suitNo: 'CV/1089/2021',
      filedOn: '15-11-1990',
      courtName: 'Commercial Court',
      location: 'Takoradi',
      judge: 'Mark Solomon',
      status: 'Adjourned'
    },
    {
      id: 5,
      title: 'EcoWind Corp. vs. Digital Services',
      suitNo: 'CV/1089/2021',
      filedOn: '15-11-1990',
      courtName: 'Civil Court',
      location: 'Kumasi',
      judge: 'Joel Nkrumah',
      status: 'Adjourned'
    },
    {
      id: 6,
      title: 'EcoWind Corp. vs. Digital Services',
      suitNo: 'CV/1089/2021',
      filedOn: '03-11-2000',
      courtName: 'Business Court',
      location: 'Accra',
      judge: 'Samuel Ofori',
      status: 'Pending'
    }
  ]);

  const totalCases = 120;
  const itemsPerPage = 10;
  const totalPages = Math.ceil(totalCases / itemsPerPage);
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalCases);

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

  const userInfo = JSON.parse(localStorage.getItem('userData') || '{}');
  const userName = userInfo?.first_name && userInfo?.last_name 
    ? `${userInfo.first_name} ${userInfo.last_name}` 
    : 'Ben Frimpong';

  // Filter cases based on active tab
  const filteredCases = cases.filter(caseItem => {
    if (activeTab === 'active') return caseItem.status === 'Ongoing' || caseItem.status === 'Pending';
    if (activeTab === 'closed') return caseItem.status === 'Heard';
    return true; // 'all'
  });

  const handleViewCase = (caseItem) => {
    setSelectedCase(caseItem);
    setShowCauseList(true);
  };

  // If cause list page is shown
  if (showCauseList) {
    return (
      <ViewCauseListPage
        registry={registry}
        judge={judge}
        caseData={selectedCase}
        onBack={() => {
          setShowCauseList(false);
          setSelectedCase(null);
        }}
      />
    );
  }

  return (
    <div className="bg-[#F7F8FA] min-h-screen">
      {/* Full Width Header */}
      <div className="w-full bg-white py-3.5 px-6 mb-4 border-b border-[#D4E1EA]">
        <div className="flex justify-between items-center">
          <div className="flex flex-col items-start gap-1">
            <span className="text-[#050F1C] text-xl font-medium">High Court (Commercial),</span>
            <span className="text-[#050F1C] text-base opacity-75">Track all your activities here.</span>
          </div>
          <div className="flex items-start gap-4">
            <div className="flex justify-between items-center w-[600px] pr-2 rounded-lg border border-solid border-[#D4E1EA] bg-white">
              <input
                type="text"
                placeholder="Search cases and gazette here"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 self-stretch text-[#525866] bg-transparent text-xs py-3.5 pl-2 mr-1 border-0 outline-none"
              />
              <div className="flex items-center w-[73px] gap-1.5">
                <Search className="w-[19px] h-[19px] text-[#525866]" />
                <div 
                  ref={filterDropdownRef}
                  className="flex items-center bg-white w-12 py-1 px-[9px] gap-1 rounded cursor-pointer relative"
                  onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                >
                  <span className="text-[#525866] text-xs font-bold">
                    {selectedFilter}
                  </span>
                  <ChevronDown className="w-3 h-3 text-[#525866]" />
                  {showFilterDropdown && (
                    <div className="absolute top-full right-0 mt-1 bg-white border border-[#D4E1EA] rounded-lg shadow-lg z-10 min-w-[120px]">
                      {['All', 'Cases', 'Gazette'].map((filter) => (
                        <div
                          key={filter}
                          onClick={() => {
                            setSelectedFilter(filter);
                            setShowFilterDropdown(false);
                          }}
                          className="px-3 py-2 text-xs text-[#525866] hover:bg-gray-50 cursor-pointer"
                        >
                          {filter}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
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
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-1">
                    <span className="text-[#050F1C] text-base font-bold whitespace-nowrap">
                      {userName}
                    </span>
                    <ChevronDown className="w-3 h-3 text-[#050F1C]" />
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-[#525866] text-xs">Online</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-6 w-full">
        <div className="flex flex-col bg-white p-4 gap-6 rounded-lg w-full">
          {/* Breadcrumb */}
          <div className="flex items-center gap-1">
            <button
              onClick={onBack}
              className="cursor-pointer hover:opacity-70"
            >
              <ChevronRight className="w-4 h-4 text-[#525866] rotate-180" />
            </button>
            <span className="text-[#525866] text-xs opacity-75 mr-1 whitespace-nowrap">COURT REGISTRY</span>
            <ChevronRight className="w-4 h-4 text-[#525866] mr-1" />
            <span className="text-[#070810] text-sm font-normal whitespace-nowrap">
              {registry?.name || 'High Court (Commercial Division)'}
            </span>
            <ChevronRight className="w-4 h-4 text-[#525866] mr-1" />
            <span className="text-[#070810] text-sm font-normal whitespace-nowrap">Judges</span>
            <ChevronRight className="w-4 h-4 text-[#525866] mr-1" />
            <span className="text-[#070810] text-sm font-normal whitespace-nowrap">
              {judge?.name || 'Justice Mary Freeman'}
            </span>
          </div>

          {/* Title Section */}
          <div className="flex items-start gap-1">
            <button
              onClick={onBack}
              className="cursor-pointer hover:opacity-70 mt-1"
            >
              <ChevronRight className="w-4 h-4 text-[#050F1C] rotate-180" />
            </button>
            <div className="flex flex-col items-start gap-0.5">
              <span className="text-[#050F1C] text-xl font-semibold">
                {judge?.name || 'Justice Mary Freeman'}
              </span>
              <span className="text-[#050F1C] text-sm font-normal">
                {judge?.judgeID || 'JUD_00023'}
              </span>
            </div>
          </div>

          {/* Stats Card and Action Button */}
          <div className="flex justify-between items-center self-stretch">
            {/* Stats Card */}
            <div className="flex items-center gap-3 w-[271.5px] p-2 bg-white rounded-lg border border-[#D4E1EA]">
              <div className="p-2 bg-[#F7F8FA] rounded-lg">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M2 2H22V22H2V2Z" stroke="#868C98" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M2 9H22" stroke="#868C98" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M9 2V22" stroke="#868C98" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[#868C98] text-xs font-normal">Total number of Cases</span>
                <span className="text-[#F59E0B] text-base font-medium">{totalCases}</span>
              </div>
            </div>

            {/* Action Button */}
            <button
              className="w-[271.5px] h-[42px] px-2.5 rounded-lg border-4 border-[#0F284726] text-white text-base font-bold hover:opacity-90 transition-opacity"
              style={{ 
                background: 'linear-gradient(180deg, #022658 43%, #1A4983 100%)', 
                boxShadow: '0px 4px 4px rgba(5, 15, 28, 0.10)' 
              }}
            >
              Add New Judge
            </button>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-4 border-b border-transparent">
            <button
              onClick={() => setActiveTab('all')}
              className={`pb-2 px-0 text-base font-bold transition-colors ${
                activeTab === 'all'
                  ? 'text-[#022658] border-b-4 border-[#022658]'
                  : 'text-[#525866] font-normal'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setActiveTab('active')}
              className={`pb-2 px-0 text-base transition-colors ${
                activeTab === 'active'
                  ? 'text-[#022658] border-b-4 border-[#022658] font-bold'
                  : 'text-[#525866] font-normal'
              }`}
            >
              Active
            </button>
            <button
              onClick={() => setActiveTab('closed')}
              className={`pb-2 px-0 text-base transition-colors ${
                activeTab === 'closed'
                  ? 'text-[#022658] border-b-4 border-[#022658] font-bold'
                  : 'text-[#525866] font-normal'
              }`}
            >
              Closed
            </button>
          </div>

          {/* Search and Filter Section */}
          <div className="flex flex-col gap-4 w-full">
            <div className="flex justify-between items-start gap-8 w-full">
              {/* Search Bar */}
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-[#868C98]" />
                <input
                  type="text"
                  placeholder="Search Case"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-[31px] pl-8 pr-3 py-2 bg-[#F7F8FA] rounded-[5.8px] border border-[#F7F8FA] text-[#868C98] text-[10px] font-normal outline-none focus:border-[#022658]"
                />
              </div>

              {/* Filter and Sort */}
              <div className="flex items-center gap-1.5">
                <button className="flex items-center gap-1.5 px-2.5 py-2 rounded border border-[#D4E1EA] hover:bg-gray-50 transition-colors">
                  <Filter className="w-3 h-3 text-[#868C98]" />
                  <span className="text-[#525866] text-xs font-normal">Filter</span>
                </button>
                <button className="flex items-center gap-1.5 px-2.5 py-2 rounded border border-[#D4E1EA] hover:bg-gray-50 transition-colors">
                  <ArrowUpDown className="w-3 h-3 text-[#868C98]" />
                  <span className="text-[#525866] text-xs font-normal">Sort</span>
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-hidden rounded-[14px] border border-[#E5E8EC] w-full">
              {/* Table Header */}
              <div className="bg-[#F4F6F9] py-4 px-2">
                <div className="flex items-center gap-3 w-full">
                  <div className="flex-[2.3] min-w-[230px] px-2">
                    <span className="text-[#070810] text-sm font-bold">Title</span>
                  </div>
                  <div className="flex-1 min-w-[110px] px-2">
                    <span className="text-[#070810] text-sm font-bold">Suit No.</span>
                  </div>
                  <div className="flex-1 min-w-[110px] px-2">
                    <span className="text-[#070810] text-sm font-bold">Filed on</span>
                  </div>
                  <div className="flex-[1.4] min-w-[140px] px-2">
                    <span className="text-[#070810] text-sm font-bold">Court Name</span>
                  </div>
                  <div className="flex-1 min-w-[110px] px-2">
                    <span className="text-[#070810] text-sm font-bold">Location</span>
                  </div>
                  <div className="flex-[1.4] min-w-[140px] px-2">
                    <span className="text-[#070810] text-sm font-bold">Judge</span>
                  </div>
                  <div className="flex-1 min-w-[110px] px-2">
                    <span className="text-[#070810] text-sm font-bold">Status</span>
                  </div>
                  <div className="flex-[0.8] min-w-[80px] px-2">
                    <span className="text-[#070810] text-sm font-bold">Action</span>
                  </div>
                </div>
              </div>

              {/* Table Body */}
              <div className="bg-white w-full">
                {filteredCases.map((caseItem, index) => (
                  <div
                    key={caseItem.id}
                    className={`flex items-center gap-3 py-3 px-2 w-full ${
                      index < filteredCases.length - 1 ? 'border-b border-[#E5E8EC]' : ''
                    }`}
                  >
                    <div className="flex-[2.3] min-w-[230px] px-2">
                      <span className="text-[#070810] text-sm font-normal">{caseItem.title}</span>
                    </div>
                    <div className="flex-1 min-w-[110px] px-2">
                      <span className="text-[#070810] text-sm font-normal">{caseItem.suitNo}</span>
                    </div>
                    <div className="flex-1 min-w-[110px] px-2">
                      <span className="text-[#070810] text-sm font-normal">{caseItem.filedOn}</span>
                    </div>
                    <div className="flex-[1.4] min-w-[140px] px-2">
                      <span className="text-[#070810] text-sm font-normal">{caseItem.courtName}</span>
                    </div>
                    <div className="flex-1 min-w-[110px] px-2">
                      <span className="text-[#070810] text-sm font-normal">{caseItem.location}</span>
                    </div>
                    <div className="flex-[1.4] min-w-[140px] px-2">
                      <span className="text-[#070810] text-sm font-normal">{caseItem.judge}</span>
                    </div>
                    <div className="flex-1 min-w-[110px] px-2 flex justify-center">
                      <span
                        className={`text-xs font-medium px-2 py-1 rounded whitespace-nowrap ${
                          caseItem.status === 'Ongoing'
                            ? 'bg-blue-50 text-blue-600'
                            : caseItem.status === 'Heard'
                            ? 'bg-green-50 text-green-600'
                            : caseItem.status === 'Adjourned'
                            ? 'bg-yellow-50 text-yellow-600'
                            : 'bg-red-50 text-red-600'
                        }`}
                      >
                        {caseItem.status}
                      </span>
                    </div>
                    <div className="flex-[0.8] min-w-[80px] px-2">
                      <button
                        onClick={() => handleViewCase(caseItem)}
                        className="flex items-center gap-1 text-[#022658] text-sm font-bold hover:opacity-70 whitespace-nowrap"
                      >
                        <span>View</span>
                        <ChevronRight className="w-4 h-4 text-[#050F1C]" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Pagination */}
            <div className="flex justify-between items-center">
              <span className="text-[#525866] text-sm font-normal">
                {startItem}-{endItem} of {totalCases}
              </span>

              <div className="flex items-center gap-10">
                {/* Page Numbers */}
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="flex items-center gap-1 h-8 px-3 py-2 bg-white rounded border border-[#D4E1EA] hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-4 h-4 text-[#868C98]" />
                    <span className="text-[#525866] text-xs font-normal">Back</span>
                  </button>

                  {currentPage === 1 && (
                    <>
                      <button className="px-2 py-2 bg-[#022658] rounded text-white text-xs font-bold">1</button>
                      <button className="w-8 h-8 px-2 py-2 bg-white rounded border border-[#D4E1EA] flex items-center justify-center">
                        <span className="text-[#525866] text-xs">...</span>
                      </button>
                      <button className="px-2 py-2 bg-white rounded border border-[#D4E1EA] text-[#525866] text-xs font-normal">98</button>
                      <button className="px-2 py-2 bg-white rounded border border-[#D4E1EA] text-[#525866] text-xs font-normal">99</button>
                      <button className="px-2 py-2 bg-white rounded border border-[#D4E1EA] text-[#525866] text-xs font-normal">100</button>
                      <button className="px-3 py-2 bg-white rounded border border-[#D4E1EA] text-[#525866] text-xs font-normal">101</button>
                      <button className="px-2 py-2 bg-white rounded border border-[#D4E1EA] text-[#525866] text-xs font-normal">102</button>
                      <button className="px-2 py-2 bg-white rounded border border-[#D4E1EA] text-[#525866] text-xs font-normal">103</button>
                      <button className="w-8 h-8 px-2 py-2 bg-white rounded border border-[#D4E1EA] flex items-center justify-center">
                        <span className="text-[#525866] text-xs">...</span>
                      </button>
                      <button className="px-2 py-2 bg-white rounded border border-[#D4E1EA] text-[#525866] text-xs font-normal">125</button>
                    </>
                  )}

                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="flex items-center gap-1 h-8 px-3 py-2 bg-white rounded border border-[#D4E1EA] hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="text-[#525866] text-xs font-normal">Next</span>
                    <ChevronRight className="w-4 h-4 text-[#868C98]" />
                  </button>
                </div>

                {/* Go to Page */}
                <div className="flex items-center gap-2">
                  <span className="text-[#050F1C] text-sm font-normal">Page</span>
                  <input
                    type="text"
                    value={goToPage}
                    onChange={(e) => setGoToPage(e.target.value)}
                    className="w-[51px] h-8 px-2 py-1 bg-white rounded border border-[#F59E0B] text-[#050F1C] text-sm font-normal outline-none text-center"
                  />
                  <button className="text-[#F59E0B] text-sm font-bold hover:underline">
                    Go
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JudgeCasesPage;

