import React, { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown, Bell, ChevronRight, ChevronLeft, Filter, ArrowUpDown, FileText } from 'lucide-react';
import RegistrarCaseDetailsPage from './RegistrarCaseDetailsPage';
import AddNewCaseForm from './AddNewCaseForm';
import AdminHeader from './admin/AdminHeader';
import RegistrarHeader from './RegistrarHeader';

const CaseProfilePage = ({ userInfo, onNavigate, onLogout, isRegistrar }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [activeTab, setActiveTab] = useState('All');
  const [currentPage, setCurrentPage] = useState(101);
  const [goToPage, setGoToPage] = useState('101');
  const [showCaseDetails, setShowCaseDetails] = useState(false);
  const [selectedCase, setSelectedCase] = useState(null);
  const [showAddCaseForm, setShowAddCaseForm] = useState(false);
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

  // Use userInfo from props or localStorage
  const displayUserInfo = userInfo || JSON.parse(localStorage.getItem('userData') || '{}');

  // Sample cases data
  const casesData = [
    {
      id: 1,
      title: 'JKL Ventures Ltd vs. Meridian Properties',
      fullTitle: 'JKL Ventures Ltd vs. Meridian Properties - Dispute over breach of lease agreement for commercial property',
      suitNo: 'CM/1245/2023',
      filedOn: '10-10-2023',
      dateFiled: 'October 10, 2023',
      lastUpdated: 'December 3, 2023',
      judge: 'Justice A. Mensah',
      nextHearing: 'Nov 3, 2025, 9:30 AM',
      status: 'Ongoing',
      town: 'Accra',
      region: 'Greater Accra',
      courtType: 'High Court',
      courtName: 'Domestic Jurisdiction 1',
      areaOfLaw: 'Land Law',
      expectedOutcome: 'The expected outcome of this case is a favorable judgment for JKL Ventures Ltd, where the court directs Meridian Properties to compensate the plaintiff for breach of the lease agreement and to either restore the original lease terms or provide financial restitution for the loss suffered.',
      caseSummary: 'This case revolves around a contractual dispute concerning a lease agreement for a commercial property located in Accra. JKL Ventures Ltd, through its director, contends that Meridian Properties breached the terms of the agreement by prematurely terminating the lease and failing to fulfill specific maintenance and renewal obligations stipulated in the contract. As a result, JKL Ventures claims to have suffered operational and financial setbacks due to the sudden loss of the leased premises.\n\nThe plaintiff is seeking damages amounting to GHS 150,000 and an order compelling the defendant to either honor the original lease terms or compensate for the loss incurred. The case, filed on March 15, 2023, is currently ongoing before the High Court (Commercial Division) in Accra, where preliminary hearings have focused on validating the contract and assessing the extent of the alleged breach.',
      documents: [
        { name: 'Lease_Agreement.pdf', url: '#', date: 'Mar 15, 2023', type: 'Evidence', submittedBy: "Plaintiff's Counsel" },
        { name: 'Court_Order_0245.pdf', url: '#', date: 'Oct 17, 2025', type: 'Ruling', submittedBy: "Defendant's Counsel" },
        { name: 'Gazette_1093.pdf', url: '#', date: 'Oct 28, 2025', type: 'Gazette notice', submittedBy: "Defendant's Counsel" }
      ],
      courtDocuments: [
        { name: 'Lease_Agreement.pdf', url: '#', date: 'Mar 15, 2025', judge: 'Justice A. Mensah', citation: 'Reported in the System' },
        { name: 'Court_Order_0245.pdf', url: '#', date: 'Oct 17, 2025', judge: 'Justice A. Mensah', citation: 'Reported in the System' },
        { name: 'Gazette_1093.pdf', url: '#', date: 'Oct 28, 2025', judge: 'Justice A. Mensah', citation: 'Reported in the System' }
      ],
      parties: [
        { name: 'JKL Ventures Ltd', role: 'Plaintiff', type: 'Company', contact: 'info@jklventures.com', status: 'Active' },
        { name: 'Meridian Properties', role: 'Defendant', type: 'Company', contact: 'legal@meridianprops.com', status: 'Active' },
        { name: 'K. Owusu', role: "Plaintiff's Counsel", type: 'Individual', contact: 'owusu@lawfirm.com', status: 'Active' },
        { name: 'S. Baffoe', role: "Defendant's Counsel", type: 'Individual', contact: 'sbaffoe@firm.com', status: 'Active' }
      ],
      caseDiary: [
        { date: 'Nov 3, 2025', judge: 'Justice A. Mensah', time: '9:30 AM', activity: 'Scheduled', notes: 'Counsel for EcoWind Corp. opened with an update on...' },
        { date: 'Oct 17, 2025', judge: 'Justice A. Mensah', time: '11:30 AM', activity: 'Adjourned', notes: 'SafeDrive Insurance responded by requesting ...' },
        { date: 'Aug 22, 2025', judge: 'Justice A. Mensah', time: '9:00 AM', activity: 'Heard', notes: 'The judge accepted the documents into the record... ' },
        { date: 'July 22, 2025', judge: 'Justice A. Mensah', time: '10:30 AM', activity: 'Heard', notes: 'Counsel on both sides agreed to the timeline...' }
      ],
      auditHistory: [
        { date: 'Oct 30, 2025', user: 'Registrar K. Boateng', action: 'Edit', description: 'Updated case status to "Ongoing"', status: 'Success' },
        { date: 'Oct 28, 2025', user: 'Me', action: 'Gazette Link', description: 'Linked Gazette #GZ-1093', status: 'Success' },
        { date: 'Oct 17, 2025', user: 'Registrar K. Boateng', action: 'Hearing Update', description: 'Added Oct 17 cause list entry', status: 'Success' }
      ],
      notes: [
        { date: 'Oct 29, 2025', user: 'Registrar K. Boateng', note: 'The matter was adjourned for a compliance check on filings. A new date will be issued on the next cause list.', visible: false },
        { date: 'Oct 22, 2025', user: 'Me', note: 'The matter was adjourned for a compliance check on filings. A new date will be issued on the next cause list.', visible: false },
        { date: 'Oct 17, 2025', user: 'Registrar K. Boateng', note: 'The matter was adjourned for a compliance check on filings. A new date will be issued on the next cause list.', visible: false }
      ],
      moreCasesThisWeek: 2
    },
    {
      id: 2,
      title: 'EcoWind Corp. vs. SafeDrive Insurance',
      suitNo: 'CV/1089/2021',
      filedOn: '03-11-2021',
      lastUpdated: '03-12-2021',
      judge: 'Justice Sam Ofori',
      nextHearing: '-',
      status: 'Heard'
    },
    {
      id: 3,
      title: 'EcoWind Corp. vs. Wellness Insurance',
      suitNo: 'CV/1089/2021',
      filedOn: '03-11-2021',
      lastUpdated: '03-12-2021',
      judge: 'Justice A. Mensah',
      nextHearing: '-',
      status: 'Heard'
    },
    {
      id: 4,
      title: 'EcoWind Corp. vs. Digital Services',
      suitNo: 'CV/1089/2021',
      filedOn: '15-11-2021',
      lastUpdated: '03-12-2021',
      judge: 'Justice Sam Ofori',
      nextHearing: '05-12-2025',
      status: 'Adjourned'
    },
    {
      id: 5,
      title: 'EcoWind Corp. vs. Digital Services',
      suitNo: 'CV/1089/2021',
      filedOn: '15-11-2021',
      lastUpdated: '03-12-2021',
      judge: 'Justice A. Mensah',
      nextHearing: '05-12-2025',
      status: 'Adjourned'
    },
    {
      id: 6,
      title: 'EcoWind Corp. vs. Digital Services',
      suitNo: 'CV/1089/2021',
      filedOn: '03-11-2021',
      lastUpdated: '03-12-2021',
      judge: 'Justice Sam Ofori',
      nextHearing: '05-12-2025',
      status: 'Heard'
    }
  ];

  const totalCases = 1234379;
  const itemsPerPage = 10;
  const totalPages = Math.ceil(totalCases / itemsPerPage);
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalCases);

  // Filter cases based on active tab
  const filteredCases = casesData.filter(caseItem => {
    if (activeTab === 'Open') return caseItem.status === 'Ongoing';
    if (activeTab === 'Pending') return caseItem.status === 'Pending';
    if (activeTab === 'Adjourned') return caseItem.status === 'Adjourned';
    if (activeTab === 'Heard') return caseItem.status === 'Heard';
    return true; // 'All'
  });

  const handleViewCauseList = () => {
    // TODO: Navigate to cause list
    console.log('View Cause List');
  };

  const handleAddNewCase = () => {
    setShowAddCaseForm(true);
  };

  const handleSaveCase = (caseData) => {
    // TODO: Save case to backend
    console.log('Saving case:', caseData);
    setShowAddCaseForm(false);
  };

  const handleCaseClick = (caseItem) => {
    setSelectedCase(caseItem);
    setShowCaseDetails(true);
  };

  // If add case form is shown
  if (showAddCaseForm) {
    return (
      <AddNewCaseForm
        onBack={() => setShowAddCaseForm(false)}
        onSave={handleSaveCase}
        userInfo={displayUserInfo}
        onNavigate={onNavigate}
        onLogout={onLogout}
        isRegistrar={isRegistrar}
      />
    );
  }

  // If case details page is shown
  if (showCaseDetails) {
    return (
      <RegistrarCaseDetailsPage
        caseData={selectedCase}
        onBack={() => {
          setShowCaseDetails(false);
          setSelectedCase(null);
        }}
        userInfo={displayUserInfo}
        onNavigate={onNavigate}
        onLogout={onLogout}
        isRegistrar={isRegistrar}
      />
    );
  }

  // Determine which header to use based on isRegistrar prop or user role
  const HeaderComponent = isRegistrar ? RegistrarHeader : AdminHeader;

  return (
    <div className="bg-[#F7F8FA] min-h-screen">
      {/* Full Width Header */}
      <HeaderComponent userInfo={displayUserInfo} onNavigate={onNavigate} onLogout={onLogout} />
      
      {/* Page Title Section */}
      <div className="px-6 mb-4">
        <div className="flex flex-col items-start gap-1">
          <span className="text-[#050F1C] text-xl font-medium">High Court (Commercial),</span>
          <span className="text-[#050F1C] text-base opacity-75">Track all your activities here.</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-6 w-full">
        <div className="flex flex-col bg-white p-4 gap-6 rounded-lg w-full">
          {/* Header Section */}
          <div className="flex flex-col gap-6">
            <span className="text-[#525866] text-xs opacity-75">CASE PROFILE</span>
            
            <div className="flex items-center gap-1">
              <ChevronRight className="w-4 h-4 text-[#050F1C] rotate-180" />
              <FileText className="w-4 h-4 text-[#050F1C]" />
              <span className="text-[#050F1C] text-xl font-semibold">Cases</span>
            </div>
            <span className="text-[#070810] text-sm opacity-75">
              All cases in the High Court (Commercial) database.
            </span>
          </div>

          {/* Stats Card and Action Buttons */}
          <div className="flex justify-between items-center gap-4">
            {/* Stats Card */}
            <div className="w-[271.5px] p-2 bg-white rounded-lg border border-[#D4E1EA] flex items-center gap-3">
              <div className="p-2 bg-[#F7F8FA] rounded-lg">
                <FileText className="w-6 h-6 text-[#868C98]" />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[#868C98] text-xs">Total number of Cases</span>
                <span className="text-[#F59E0B] text-base font-medium">{totalCases.toLocaleString()}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              <button
                onClick={handleViewCauseList}
                className="w-[271.5px] h-[42px] px-2.5 rounded-lg border-2 border-[#0F2847] text-[#022658] text-base font-bold hover:opacity-90 transition-opacity"
                style={{ boxShadow: '0px 4px 4px rgba(5, 15, 28, 0.10)' }}
              >
                View Cause List
              </button>
              <button
                onClick={handleAddNewCase}
                className="w-[271.5px] h-[42px] px-2.5 rounded-lg border-4 border-[#0F284726] text-white text-base font-bold hover:opacity-90 transition-opacity"
                style={{ 
                  background: 'linear-gradient(180deg, #022658 43%, #1A4983 100%)', 
                  boxShadow: '0px 4px 4px rgba(5, 15, 28, 0.10)' 
                }}
              >
                Add new case
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-4 border-b border-transparent">
            <button
              onClick={() => setActiveTab('All')}
              className={`pb-2 px-0 text-base transition-colors ${
                activeTab === 'All'
                  ? 'text-[#022658] border-b-4 border-[#022658] font-bold'
                  : 'text-[#525866] font-normal'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setActiveTab('Open')}
              className={`pb-2 px-0 text-base transition-colors ${
                activeTab === 'Open'
                  ? 'text-[#022658] border-b-4 border-[#022658] font-bold'
                  : 'text-[#525866] font-normal'
              }`}
            >
              Open
            </button>
            <button
              onClick={() => setActiveTab('Pending')}
              className={`pb-2 px-0 text-base transition-colors ${
                activeTab === 'Pending'
                  ? 'text-[#022658] border-b-4 border-[#022658] font-bold'
                  : 'text-[#525866] font-normal'
              }`}
            >
              Pending
            </button>
            <button
              onClick={() => setActiveTab('Adjourned')}
              className={`pb-2 px-0 text-base transition-colors ${
                activeTab === 'Adjourned'
                  ? 'text-[#022658] border-b-4 border-[#022658] font-bold'
                  : 'text-[#525866] font-normal'
              }`}
            >
              Adjourned
            </button>
            <button
              onClick={() => setActiveTab('Heard')}
              className={`pb-2 px-0 text-base transition-colors ${
                activeTab === 'Heard'
                  ? 'text-[#022658] border-b-4 border-[#022658] font-bold'
                  : 'text-[#525866] font-normal'
              }`}
            >
              Heard
            </button>
          </div>

          {/* Search and Filter Section */}
          <div className="flex flex-col gap-4 w-full">
            <div className="flex justify-between items-start gap-2 w-full">
              {/* Search Bar */}
              <div className="relative flex-1 max-w-[490px]">
                <Search className="absolute left-2.5 top-2.5 w-3 h-3 text-[#868C98]" />
                <input
                  type="text"
                  placeholder="Search Case"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-[31px] pl-8 pr-3 py-2 bg-[#F7F8FA] rounded-[5.8px] border border-[#F7F8FA] text-[#868C98] text-[10px] font-normal outline-none focus:border-[#022658]"
                />
              </div>

              {/* Filter and Sort */}
              <div className="flex items-center gap-1.5 flex-shrink-0">
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
                  <div className="flex-[2.8] min-w-[280px] px-2">
                    <span className="text-[#070810] text-sm font-bold">Title</span>
                  </div>
                  <div className="flex-[1.2] min-w-[120px] px-2">
                    <span className="text-[#070810] text-sm font-bold">Suit No.</span>
                  </div>
                  <div className="flex-1 min-w-[110px] px-2">
                    <span className="text-[#070810] text-sm font-bold">Filed on</span>
                  </div>
                  <div className="flex-[1.4] min-w-[140px] px-2">
                    <span className="text-[#070810] text-sm font-bold">Last updated</span>
                  </div>
                  <div className="flex-[1.6] min-w-[160px] px-2">
                    <span className="text-[#070810] text-sm font-bold">Judge</span>
                  </div>
                  <div className="flex-1 min-w-[110px] px-2">
                    <span className="text-[#070810] text-sm font-bold">Next Hearing</span>
                  </div>
                  <div className="flex-1 min-w-[110px] px-2 flex justify-center">
                    <span className="text-[#070810] text-sm font-bold">Status</span>
                  </div>
                </div>
              </div>

              {/* Table Body */}
              <div className="bg-white w-full">
                {filteredCases.map((caseItem, index) => (
                  <div
                    key={caseItem.id}
                    onClick={() => handleCaseClick(caseItem)}
                    className={`flex items-center gap-3 py-3 px-2 w-full cursor-pointer hover:bg-gray-50 transition-colors ${
                      index < filteredCases.length - 1 ? 'border-b border-[#E5E8EC]' : ''
                    }`}
                  >
                    <div className="flex-[2.8] min-w-[280px] px-2">
                      <span className="text-[#070810] text-sm font-normal">{caseItem.title}</span>
                    </div>
                    <div className="flex-[1.2] min-w-[120px] px-2">
                      <span className="text-[#070810] text-sm font-normal">{caseItem.suitNo}</span>
                    </div>
                    <div className="flex-1 min-w-[110px] px-2">
                      <span className="text-[#070810] text-sm font-normal">{caseItem.filedOn}</span>
                    </div>
                    <div className="flex-[1.4] min-w-[140px] px-2">
                      <span className="text-[#070810] text-sm font-normal">{caseItem.lastUpdated}</span>
                    </div>
                    <div className="flex-[1.6] min-w-[160px] px-2">
                      <span className="text-[#070810] text-sm font-normal">{caseItem.judge}</span>
                    </div>
                    <div className="flex-1 min-w-[110px] px-2 flex justify-center">
                      <span className="text-[#070810] text-sm font-normal">{caseItem.nextHearing}</span>
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
                  </div>
                ))}
              </div>
            </div>

            {/* Pagination */}
            <div className="flex justify-between items-center">
              <span className="text-[#525866] text-sm text-right">110-120 of 1,250</span>

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

                  <button className="px-3 py-2 bg-white rounded border border-[#D4E1EA] text-[#525866] text-xs font-normal">1</button>
                  <button className="w-8 h-8 px-2 py-2 bg-white rounded border border-[#D4E1EA] flex items-center justify-center">
                    <span className="text-[#525866] text-xs">...</span>
                  </button>
                  <button className="px-2 py-2 bg-white rounded border border-[#D4E1EA] text-[#525866] text-xs font-normal">98</button>
                  <button className="px-2 py-2 bg-white rounded border border-[#D4E1EA] text-[#525866] text-xs font-normal">99</button>
                  <button className="px-2 py-2 bg-white rounded border border-[#D4E1EA] text-[#525866] text-xs font-normal">100</button>
                  <button className="px-2 py-2 bg-[#022658] rounded text-white text-xs font-bold">101</button>
                  <button className="px-2 py-2 bg-white rounded border border-[#D4E1EA] text-[#525866] text-xs font-normal">102</button>
                  <button className="px-2 py-2 bg-white rounded border border-[#D4E1EA] text-[#525866] text-xs font-normal">103</button>
                  <button className="w-8 h-8 px-2 py-2 bg-white rounded border border-[#D4E1EA] flex items-center justify-center">
                    <span className="text-[#525866] text-xs">...</span>
                  </button>
                  <button className="px-2 py-2 bg-white rounded border border-[#D4E1EA] text-[#525866] text-xs font-normal">125</button>

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

export default CaseProfilePage;

