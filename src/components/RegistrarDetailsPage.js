import React, { useState } from 'react';
import { Search, ChevronLeft, ChevronRight, Filter, ArrowUpDown, Bell, ChevronRight as ChevronRightIcon, MoreVertical, FileText } from 'lucide-react';

const RegistrarDetailsPage = ({ registrar, onBack }) => {
  const [activeTab, setActiveTab] = useState('cases-registered');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageInput, setPageInput] = useState('1');

  // Get registrar data from props or use default
  const registrarData = registrar || {
    name: 'Mrs. Ama Ofori',
    id: 'REG_00013',
    email: 'ama.ofori@judiciary.gov.gh',
    totalCases: 120,
    totalCauseLists: 48,
    totalPendingTasks: 4
  };

  const casesData = [
    {
      title: 'EcoWind Corp. vs. SafeDrive Insurance',
      suitNo: 'CV/1089/2021',
      filedOn: '10-10-1978',
      courtName: 'Business Court',
      location: 'Accra',
      judge: 'Sam Chris',
      status: 'Ongoing',
      statusColor: 'rgba(48.52, 171.63, 147.01, 0.10)',
      textColor: '#3B82F6'
    },
    {
      title: 'EcoWind Corp. vs. SafeDrive Insurance',
      suitNo: 'CV/1089/2021',
      filedOn: '03-11-2000',
      courtName: 'Civil Court',
      location: 'Kumasi',
      judge: 'Kwame Louis',
      status: 'Heard',
      statusColor: 'rgba(48.52, 171.63, 64.94, 0.10)',
      textColor: '#10B981'
    },
    {
      title: 'EcoWind Corp. vs. Wellness Insurance',
      suitNo: 'CV/1089/2021',
      filedOn: '03-11-2000',
      courtName: 'Business Court',
      location: 'Accra',
      judge: 'Barimah John',
      status: 'Heard',
      statusColor: 'rgba(48.52, 171.63, 64.94, 0.10)',
      textColor: '#10B981'
    },
    {
      title: 'EcoWind Corp. vs. Digital Services',
      suitNo: 'CV/1089/2021',
      filedOn: '15-11-1990',
      courtName: 'Commercial Court',
      location: 'Takoradi',
      judge: 'Mark Solomon',
      status: 'Adjourned',
      statusColor: 'rgba(243, 111, 38, 0.10)',
      textColor: '#F59E0B'
    },
    {
      title: 'EcoWind Corp. vs. Digital Services',
      suitNo: 'CV/1089/2021',
      filedOn: '15-11-1990',
      courtName: 'Civil Court',
      location: 'Kumasi',
      judge: 'Joel Nkrumah',
      status: 'Adjourned',
      statusColor: 'rgba(243, 111, 38, 0.10)',
      textColor: '#F59E0B'
    },
    {
      title: 'EcoWind Corp. vs. Digital Services',
      suitNo: 'CV/1089/2021',
      filedOn: '03-11-2000',
      courtName: 'Business Court',
      location: 'Accra',
      judge: 'Samuel Ofori',
      status: 'Pending',
      statusColor: 'rgba(243, 89.25, 38, 0.10)',
      textColor: '#EF4444'
    }
  ];

  const totalPages = 125;
  const startRange = 110;
  const endRange = 120;
  const totalItems = 1250;

  const userInfo = JSON.parse(localStorage.getItem('userData') || '{}');
  const userName = userInfo?.first_name && userInfo?.last_name 
    ? `${userInfo.first_name} ${userInfo.last_name}` 
    : 'Ben Frimpong';

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      setPageInput(page.toString());
    }
  };

  const handlePageInputChange = (e) => {
    setPageInput(e.target.value);
  };

  const handleGoToPage = () => {
    const page = parseInt(pageInput);
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    } else {
      setPageInput(currentPage.toString());
    }
  };

  const handleViewCase = (caseItem) => {
    // TODO: Navigate to case details
    console.log('View case:', caseItem);
  };

  return (
    <div className="flex-1 bg-[#F7F8FA] pr-6 rounded-lg">
      <div className="flex items-start gap-6">
        {/* Main Content */}
        <div className="flex-1 flex flex-col bg-[#F7F8FA] pt-2 pb-[52px] gap-4">
          {/* Header */}
          <div className="flex items-center self-stretch py-2 px-1.5 gap-[50px] rounded border-b border-[#D4E1EA]">
            <div className="flex flex-col items-start w-[263px] gap-1">
              <span className="text-[#050F1C] text-xl font-medium">
                High Court (Commercial),
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
                  placeholder="Search cases and gazette here"
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
                REGISTRARS
              </span>
              <ChevronRightIcon className="w-4 h-4 text-[#7B8794]" />
              <span className="text-[#070810] text-sm font-normal">
                {registrarData.name}
              </span>
            </div>

            {/* Registrar Header */}
            <div className="flex items-center justify-between self-stretch">
              <div className="flex items-start gap-1">
                <button
                  onClick={onBack}
                  className="p-1 hover:opacity-70"
                >
                  <ChevronLeft className="w-4 h-4 text-[#050F1C]" />
                </button>
                <div className="flex flex-col items-start gap-0.5">
                  <span className="text-[#050F1C] text-xl font-semibold" style={{ fontFamily: 'Roboto' }}>
                    {registrarData.name}
                  </span>
                  <span className="text-[#050F1C] text-sm font-normal">
                    {registrarData.id}
                  </span>
                  <a 
                    href={`mailto:${registrarData.email}`}
                    className="text-[#3B82F6] text-sm font-normal hover:underline"
                  >
                    {registrarData.email}
                  </a>
                </div>
              </div>
              <button className="p-1 hover:opacity-70">
                <MoreVertical className="w-4 h-4 text-[#050F1C] rotate-90" />
              </button>
            </div>

            {/* Stats Cards */}
            <div className="flex items-center self-stretch gap-6">
              {/* Total Cases Registered */}
              <div className="flex-1 p-2 bg-white rounded-lg border border-[#D4E1EA] flex items-center gap-3">
                <div className="p-2 bg-[#F7F8FA] rounded-lg">
                  <FileText className="w-6 h-6 text-[#868C98]" />
                </div>
                <div className="flex flex-col justify-center items-start gap-1">
                  <span className="text-[#868C98] text-xs font-normal">
                    Total number of Cases Registered
                  </span>
                  <span className="text-[#F59E0B] text-base font-medium">
                    {registrarData.totalCases}
                  </span>
                </div>
              </div>

              {/* Total Cause Lists published */}
              <div className="flex-1 p-2 bg-white rounded-lg border border-[#D4E1EA] flex items-center gap-3">
                <div className="p-2 bg-[#F7F8FA] rounded-lg">
                  <FileText className="w-6 h-6 text-[#868C98]" />
                </div>
                <div className="flex flex-col justify-center items-start gap-1">
                  <span className="text-[#868C98] text-xs font-normal">
                    Total Cause Lists published
                  </span>
                  <span className="text-[#F59E0B] text-base font-medium">
                    {registrarData.totalCauseLists}
                  </span>
                </div>
              </div>

              {/* Total Pending tasks */}
              <div className="flex-1 p-2 bg-white rounded-lg border border-[#D4E1EA] flex items-center gap-3">
                <div className="p-2 bg-[#F7F8FA] rounded-lg">
                  <FileText className="w-6 h-6 text-[#868C98]" />
                </div>
                <div className="flex flex-col justify-center items-start gap-1">
                  <span className="text-[#868C98] text-xs font-normal">
                    Total Pending tasks
                  </span>
                  <span className="text-[#F59E0B] text-base font-medium">
                    {registrarData.totalPendingTasks}
                  </span>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex items-center self-stretch gap-4 border-b border-[#D4E1EA]">
              <button
                onClick={() => setActiveTab('cases-registered')}
                className={`pb-2 px-2 ${activeTab === 'cases-registered' ? 'border-b-4 border-[#022658]' : ''}`}
              >
                <span className={`text-base font-normal ${activeTab === 'cases-registered' ? 'text-[#022658] font-bold' : 'text-[#525866]'}`}>
                  Cases registered
                </span>
              </button>
              <button
                onClick={() => setActiveTab('cause-lists')}
                className={`pb-2 px-2 ${activeTab === 'cause-lists' ? 'border-b-4 border-[#022658]' : ''}`}
              >
                <span className={`text-base font-normal ${activeTab === 'cause-lists' ? 'text-[#022658] font-bold' : 'text-[#525866]'}`}>
                  Cause lists published
                </span>
              </button>
              <button
                onClick={() => setActiveTab('pending-tasks')}
                className={`pb-2 px-2 ${activeTab === 'pending-tasks' ? 'border-b-4 border-[#022658]' : ''}`}
              >
                <span className={`text-base font-normal ${activeTab === 'pending-tasks' ? 'text-[#022658] font-bold' : 'text-[#525866]'}`}>
                  Pending tasks
                </span>
              </button>
            </div>

            {/* Tab Content */}
            {activeTab === 'cases-registered' && (
              <div className="flex flex-col items-center self-stretch gap-4">
                {/* Search and Filter Controls */}
                <div className="flex items-start self-stretch gap-1.5">
                  {/* Search Input */}
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      placeholder="Search Case"
                      className="w-full py-2 px-7 bg-[#F7F8FA] rounded text-[#868C98] text-xs font-normal border border-[#F7F8FA] outline-none"
                    />
                    <Search className="absolute left-2.5 top-2.5 w-3 h-3 text-[#868C98]" />
                  </div>

                  {/* Filter and Sort Buttons */}
                  <div className="flex items-start gap-1.5">
                    <button className="px-2.5 py-2 rounded border border-[#D4E1EA] flex items-center gap-1.5">
                      <Filter className="w-3 h-3 text-[#868C98]" />
                      <span className="text-[#525866] text-xs font-normal">Filter</span>
                    </button>
                    <button className="px-2.5 py-2 rounded border border-[#D4E1EA] flex items-center gap-1.5">
                      <ArrowUpDown className="w-3 h-3 text-[#868C98]" />
                      <span className="text-[#525866] text-xs font-normal">Sort</span>
                    </button>
                  </div>
                </div>

                {/* Table */}
                <div className="flex flex-col self-stretch gap-1 rounded-[14px] border border-[#E5E8EC] overflow-hidden">
                  {/* Table Header */}
                  <div className="flex items-center self-stretch bg-[#F4F6F9] py-4 gap-3">
                    <div className="flex-1 min-w-[230px] px-2">
                      <span className="text-[#070810] text-sm font-bold">Title</span>
                    </div>
                    <div className="flex-1 min-w-[110px] px-2">
                      <span className="text-[#070810] text-sm font-bold">Suit No.</span>
                    </div>
                    <div className="flex-1 min-w-[110px] px-2">
                      <span className="text-[#070810] text-sm font-bold">Filed on</span>
                    </div>
                    <div className="flex-1 min-w-[140px] px-2">
                      <span className="text-[#070810] text-sm font-bold">Court Name</span>
                    </div>
                    <div className="flex-1 min-w-[110px] px-2">
                      <span className="text-[#070810] text-sm font-bold">Location</span>
                    </div>
                    <div className="flex-1 min-w-[140px] px-2">
                      <span className="text-[#070810] text-sm font-bold">Judge</span>
                    </div>
                    <div className="flex-1 min-w-[110px] px-2 flex justify-center">
                      <span className="text-[#070810] text-sm font-bold">Status</span>
                    </div>
                    <div className="w-[100px] px-2 flex-shrink-0"></div>
                  </div>

                  {/* Table Rows */}
                  {casesData.map((caseItem, index) => (
                    <div
                      key={index}
                      className="flex items-center self-stretch py-3 gap-3 pr-2"
                      style={{
                        borderBottom: index < casesData.length - 1 ? '0.40px solid #E5E8EC' : 'none'
                      }}
                    >
                      <div className="flex-1 min-w-[230px] px-2">
                        <span className="text-[#070810] text-sm font-normal">{caseItem.title}</span>
                      </div>
                      <div className="flex-1 min-w-[110px] px-2">
                        <span className="text-[#070810] text-sm font-normal">{caseItem.suitNo}</span>
                      </div>
                      <div className="flex-1 min-w-[110px] px-2">
                        <span className="text-[#070810] text-sm font-normal">{caseItem.filedOn}</span>
                      </div>
                      <div className="flex-1 min-w-[140px] px-2">
                        <span className="text-[#070810] text-sm font-normal">{caseItem.courtName}</span>
                      </div>
                      <div className="flex-1 min-w-[110px] px-2">
                        <span className="text-[#070810] text-sm font-normal">{caseItem.location}</span>
                      </div>
                      <div className="flex-1 min-w-[140px] px-2">
                        <span className="text-[#070810] text-sm font-normal">{caseItem.judge}</span>
                      </div>
                      <div className="flex-1 min-w-[110px] px-2 flex justify-center">
                        <div
                          className="px-2 py-1 rounded-lg"
                          style={{
                            background: caseItem.statusColor,
                            width: '90px'
                          }}
                        >
                          <span
                            className="text-xs font-medium"
                            style={{ color: caseItem.textColor }}
                          >
                            {caseItem.status}
                          </span>
                        </div>
                      </div>
                      <div className="w-[100px] px-2 flex items-center justify-end gap-1 flex-shrink-0">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewCase(caseItem);
                          }}
                          className="flex items-center gap-1 text-[#022658] text-sm font-bold hover:opacity-70"
                        >
                          <span>View</span>
                          <ChevronRightIcon className="w-4 h-4 text-[#050F1C]" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                <div className="flex items-center self-stretch justify-between">
                  <div className="flex items-center gap-10">
                    <span className="text-[#525866] text-sm font-normal">
                      {startRange}-{endRange} of {totalItems}
                    </span>
                    <div className="flex items-center gap-1.5">
                      {/* Back Button */}
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        className="h-8 px-3 py-2 bg-white rounded border border-[#D4E1EA] flex items-center gap-1"
                      >
                        <ChevronLeft className="w-4 h-4 text-[#868C98]" />
                        <span className="text-[#525866] text-xs font-normal">Back</span>
                      </button>

                      {/* Page Numbers */}
                      <button
                        onClick={() => handlePageChange(1)}
                        className={`px-2 py-2 rounded border border-[#D4E1EA] ${currentPage === 1 ? 'bg-[#022658]' : 'bg-white'}`}
                      >
                        <span className={`text-xs font-normal ${currentPage === 1 ? 'text-white font-bold' : 'text-[#525866]'}`}>1</span>
                      </button>

                      {/* Ellipsis */}
                      <div className="w-8 h-8 px-3 py-2 bg-white rounded border border-[#D4E1EA] flex items-center justify-center">
                        <div className="flex items-center gap-1">
                          <div className="w-1 h-1 bg-[#525866] rounded-full"></div>
                          <div className="w-1 h-1 bg-[#525866] rounded-full"></div>
                          <div className="w-1 h-1 bg-[#525866] rounded-full"></div>
                        </div>
                      </div>

                      {/* Page Numbers around current */}
                      {[98, 99, 100].map((page) => (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className="px-2 py-2 bg-white rounded border border-[#D4E1EA]"
                        >
                          <span className="text-[#525866] text-xs font-normal">{page}</span>
                        </button>
                      ))}

                      {/* Current Page */}
                      <button className="px-3 py-2 bg-[#022658] rounded">
                        <span className="text-white text-xs font-bold">1</span>
                      </button>

                      {/* Page Numbers after current */}
                      {[102, 103].map((page) => (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className="px-2 py-2 bg-white rounded border border-[#D4E1EA]"
                        >
                          <span className="text-[#525866] text-xs font-normal">{page}</span>
                        </button>
                      ))}

                      {/* Ellipsis */}
                      <div className="w-8 h-8 px-3 py-2 bg-white rounded border border-[#D4E1EA] flex items-center justify-center">
                        <div className="flex items-center gap-1">
                          <div className="w-1 h-1 bg-[#525866] rounded-full"></div>
                          <div className="w-1 h-1 bg-[#525866] rounded-full"></div>
                          <div className="w-1 h-1 bg-[#525866] rounded-full"></div>
                        </div>
                      </div>

                      {/* Last Page */}
                      <button
                        onClick={() => handlePageChange(totalPages)}
                        className="px-2 py-2 bg-white rounded border border-[#D4E1EA]"
                      >
                        <span className="text-[#525866] text-xs font-normal">{totalPages}</span>
                      </button>

                      {/* Next Button */}
                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        className="h-8 px-3 py-2 bg-white rounded border border-[#D4E1EA] flex items-center gap-1"
                      >
                        <span className="text-[#525866] text-xs font-normal">Next</span>
                        <ChevronRight className="w-4 h-4 text-[#868C98]" />
                      </button>
                    </div>
                  </div>

                  {/* Go to Page */}
                  <div className="flex items-center gap-2">
                    <span className="text-[#050F1C] text-sm font-normal">Page</span>
                    <input
                      type="text"
                      value={pageInput}
                      onChange={handlePageInputChange}
                      onKeyPress={(e) => e.key === 'Enter' && handleGoToPage()}
                      className="w-[51px] h-8 px-2 py-1 bg-white rounded border border-[#F59E0B] text-[#050F1C] text-sm font-normal outline-none"
                      placeholder="1"
                    />
                    <button
                      onClick={handleGoToPage}
                      className="text-[#F59E0B] text-sm font-bold cursor-pointer hover:opacity-70"
                    >
                      Go
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'cause-lists' && (
              <div className="flex flex-col items-center self-stretch gap-4">
                <p className="text-[#525866] text-sm">Cause lists published content coming soon...</p>
              </div>
            )}

            {activeTab === 'pending-tasks' && (
              <div className="flex flex-col items-center self-stretch gap-4">
                <p className="text-[#525866] text-sm">Pending tasks content coming soon...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegistrarDetailsPage;

