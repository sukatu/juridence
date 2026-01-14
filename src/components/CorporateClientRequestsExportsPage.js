import React, { useState } from 'react';
import { Bell, ChevronRight, ChevronLeft, Search, Filter, ArrowUpDown, Download } from 'lucide-react';
import CorporateClientHeader from './CorporateClientHeader';

const CorporateClientRequestsExportsPage = ({ userInfo, onNavigate, onLogout }) => {
  const [activeMainTab, setActiveMainTab] = useState('Requests');
  const [activeFilterTab, setActiveFilterTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Use userInfo from props or localStorage
  const displayUserInfo = userInfo || JSON.parse(localStorage.getItem('userData') || '{}');
  const organizationName = displayUserInfo?.organization || 'Access Bank';

  // Sample exports data
  const exportsData = [
    {
      id: 1,
      entityName: 'JKL Ventures Ltd',
      type: 'Company Risk Report',
      format: 'PDF',
      date: 'Nov 3, 2025'
    },
    {
      id: 2,
      entityName: 'Vivian Osei vs Tano Holdings',
      type: 'Case Report',
      format: 'PDF',
      date: 'Nov 1, 2025'
    },
    {
      id: 3,
      entityName: 'Kofi Mensah',
      type: 'Individual Risk Report',
      format: 'PDF',
      date: 'Oct 28, 2025'
    }
  ];

  // Sample requests data
  const requestsData = [
    {
      id: 1,
      requestId: 'JKL28/26/25',
      title: 'Request on John Kwame Louis',
      category: 'Person verification',
      status: 'Pending',
      statusColor: '#DEBB0C',
      submissionDate: '28 Nov. 2025',
      toBeCompleted: '10 Dec. 2025'
    },
    {
      id: 2,
      requestId: 'JKL28/26/25',
      title: 'Request on Sam Nkrumah',
      category: 'Person verification',
      status: 'In Progress',
      statusColor: '#3B82F6',
      submissionDate: '2 Nov. 2025',
      toBeCompleted: '10 Nov. 2025'
    },
    {
      id: 3,
      requestId: 'JKL28/26/25',
      title: 'Request on Alex Chen',
      category: 'Document review',
      status: 'In Progress',
      statusColor: '#3B82F6',
      submissionDate: '11 Oct. 2025',
      toBeCompleted: '15 Oct. 2025'
    },
    {
      id: 4,
      requestId: 'JKL28/26/25',
      title: 'Request on Sam Nkrumah',
      category: 'Case history research',
      status: 'Completed',
      statusColor: '#10B981',
      submissionDate: '5 Sept. 2025',
      toBeCompleted: '10 Sept. 2025'
    },
    {
      id: 5,
      requestId: 'JKL28/26/25',
      title: 'Request on David Johnson',
      category: 'System upgrade',
      status: 'Completed',
      statusColor: '#10B981',
      submissionDate: '15 Aug. 2025',
      toBeCompleted: '25 Aug. 2025'
    },
    {
      id: 6,
      requestId: 'JKL28/26/25',
      title: 'Request on Omar Patel',
      category: 'Company due diligence',
      status: 'Completed',
      statusColor: '#10B981',
      submissionDate: '18 July 2025',
      toBeCompleted: '28 July 2025'
    }
  ];

  const filteredRequests = requestsData.filter(request => {
    const matchesSearch = request.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         request.requestId.toLowerCase().includes(searchQuery.toLowerCase());
    
    let matchesFilter = true;
    if (activeFilterTab !== 'All') {
      if (activeFilterTab === 'Other') {
        // Other includes categories that don't match the main filter tabs
        matchesFilter = !['Person verification', 'Company due diligence', 'Case history research'].includes(request.category);
      } else {
        matchesFilter = request.category === activeFilterTab;
      }
    }
    
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="flex-1 bg-[#F7F8FA] pr-6 rounded-lg">
      <div className="flex items-start gap-6">
        {/* Main Content */}
        <div className="flex-1 flex flex-col bg-[#F7F8FA] pt-2 pb-[52px] gap-4">
          {/* Header */}
          <CorporateClientHeader userInfo={displayUserInfo} onNavigate={onNavigate} onLogout={onLogout} />
          
          {/* Page Title Section */}
          <div className="px-1.5 pb-2 border-b border-[#D4E1EA]">
            <div className="flex flex-col items-start w-[263px] gap-1">
              <span className="text-[#050F1C] text-xl font-medium">
                {organizationName},
              </span>
              <span className="text-[#050F1C] text-base font-normal opacity-75">
                Track all your activities here.
              </span>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 p-4 bg-white rounded-lg flex flex-col gap-10">
            {/* Breadcrumb and Back Button */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-1">
                <span className="text-[#525866] text-xs opacity-75 font-normal">REQUESTS & EXPORTS</span>
              </div>
              <button className="p-2 bg-[#F7F8FA] rounded-lg w-fit">
                <ChevronLeft className="w-6 h-6 text-[#050F1C]" />
              </button>
            </div>

            {/* Main Tabs - Requests/Exports */}
            <div className="px-2 py-1 bg-white rounded-lg border border-[#D4E1EA] flex items-center gap-6">
              <button
                onClick={() => setActiveMainTab('Requests')}
                className={`w-40 px-2 py-2 rounded flex items-center justify-center gap-2 ${
                  activeMainTab === 'Requests'
                    ? 'bg-[#022658] text-white'
                    : 'text-[#050F1C]'
                }`}
              >
                <span className="text-base font-bold" style={{ fontFamily: 'Satoshi' }}>Requests</span>
              </button>
              <button
                onClick={() => setActiveMainTab('Exports')}
                className={`w-40 px-2 py-2 rounded flex items-center justify-center gap-2 ${
                  activeMainTab === 'Exports'
                    ? 'bg-[#022658] text-white'
                    : 'text-[#050F1C]'
                }`}
              >
                <span className="text-base font-normal" style={{ fontFamily: 'Satoshi' }}>Exports</span>
              </button>
            </div>

            {/* Filter Tabs - Only show for Requests */}
            {activeMainTab === 'Requests' && (
              <>
                <div className="flex items-center gap-4 border-b border-[#E4E7EB] pb-2">
                  <button
                    onClick={() => setActiveFilterTab('All')}
                    className={`pb-2 px-2 ${activeFilterTab === 'All' ? 'border-b-4 border-[#022658] text-[#022658] font-bold' : 'text-[#525866] font-normal'}`}
                  >
                    <span className="text-base" style={{ fontFamily: 'Satoshi' }}>All</span>
                  </button>
                  <button
                    onClick={() => setActiveFilterTab('Person verification')}
                    className={`pb-2 px-2 ${activeFilterTab === 'Person verification' ? 'border-b-4 border-[#022658] text-[#022658] font-bold' : 'text-[#525866] font-normal'}`}
                  >
                    <span className="text-base" style={{ fontFamily: 'Satoshi' }}>Person verification</span>
                  </button>
                  <button
                    onClick={() => setActiveFilterTab('Company due diligence')}
                    className={`pb-2 px-2 ${activeFilterTab === 'Company due diligence' ? 'border-b-4 border-[#022658] text-[#022658] font-bold' : 'text-[#525866] font-normal'}`}
                  >
                    <span className="text-base" style={{ fontFamily: 'Satoshi' }}>Company due diligence</span>
                  </button>
                  <button
                    onClick={() => setActiveFilterTab('Case history research')}
                    className={`pb-2 px-2 ${activeFilterTab === 'Case history research' ? 'border-b-4 border-[#022658] text-[#022658] font-bold' : 'text-[#525866] font-normal'}`}
                  >
                    <span className="text-base" style={{ fontFamily: 'Satoshi' }}>Case history research</span>
                  </button>
                  <button
                    onClick={() => setActiveFilterTab('Other')}
                    className={`pb-2 px-2 ${activeFilterTab === 'Other' ? 'border-b-4 border-[#022658] text-[#022658] font-bold' : 'text-[#525866] font-normal'}`}
                  >
                    <span className="text-base" style={{ fontFamily: 'Satoshi' }}>Other</span>
                  </button>
                </div>

                {/* Search and Filter Controls - Only show for Requests */}
                <div className="flex items-center justify-between gap-4">
                  <div className="relative w-[490px]">
                    <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 w-3 h-3 text-[#868C98]" />
                    <input
                      type="text"
                      placeholder="Search Case"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-7 pr-3 py-2 bg-[#F7F8FA] rounded-lg border border-[#F7F8FA] text-[10px] text-[#868C98] focus:outline-none focus:border-[#022658]"
                      style={{ fontFamily: 'Satoshi' }}
                    />
                  </div>
                  <div className="flex items-center gap-8">
                    <div className="flex items-center gap-1.5">
                      <button className="px-2.5 py-2 border border-[#D4E1EA] rounded flex items-center gap-1.5 hover:bg-[#F7F8FA]">
                        <Filter className="w-3 h-3 text-[#868C98]" />
                        <span className="text-xs text-[#525866]" style={{ fontFamily: 'Satoshi' }}>Filter</span>
                      </button>
                      <button className="px-2.5 py-2 border border-[#D4E1EA] rounded flex items-center gap-1.5 hover:bg-[#F7F8FA]">
                        <ArrowUpDown className="w-3 h-3 text-[#868C98]" />
                        <span className="text-xs text-[#525866]" style={{ fontFamily: 'Satoshi' }}>Sort</span>
                      </button>
                    </div>
                    <button className="h-8 px-4 py-2 border border-[#F59E0B] rounded-lg text-[#F59E0B] text-base font-medium hover:opacity-70 flex items-center gap-1" style={{ fontFamily: 'Satoshi' }}>
                      Export list
                      <ChevronRight className="w-4 h-4 rotate-90" />
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* Requests Table */}
            {activeMainTab === 'Requests' && (
              <div className="overflow-hidden rounded-[14px] border border-[#E5E8EC]">
                <div className="bg-[#F4F6F9] py-4 px-3">
                  <div className="flex items-center gap-3">
                    <div className="w-[170px] px-2">
                      <span className="text-[#070810] text-sm font-bold" style={{ fontFamily: 'Satoshi' }}>Request ID</span>
                    </div>
                    <div className="w-[170px] px-2">
                      <span className="text-[#070810] text-sm font-bold" style={{ fontFamily: 'Satoshi' }}>Title</span>
                    </div>
                    <div className="w-[170px] px-2">
                      <span className="text-[#070810] text-sm font-bold" style={{ fontFamily: 'Satoshi' }}>Category</span>
                    </div>
                    <div className="w-[170px] px-2">
                      <span className="text-[#070810] text-sm font-bold" style={{ fontFamily: 'Satoshi' }}>Status</span>
                    </div>
                    <div className="w-[170px] px-2">
                      <span className="text-[#070810] text-sm font-bold" style={{ fontFamily: 'Satoshi' }}>Submission Date</span>
                    </div>
                    <div className="w-[170px] px-2">
                      <span className="text-[#070810] text-sm font-bold" style={{ fontFamily: 'Satoshi' }}>To be Completed</span>
                    </div>
                  </div>
                </div>
                <div className="bg-white">
                  {filteredRequests.length > 0 ? (
                    filteredRequests.map((request, index, array) => (
                      <div
                        key={request.id}
                        className="flex items-center gap-3 py-3 px-3"
                        style={{
                          borderBottom: index < array.length - 1 ? '0.40px solid #E5E8EC' : 'none'
                        }}
                      >
                        <div className="w-[170px] px-2">
                          <span className="text-[#050F1C] text-sm font-normal" style={{ fontFamily: 'Satoshi' }}>{request.requestId}</span>
                        </div>
                        <div className="w-[170px] px-2">
                          <span className="text-[#070810] text-sm font-normal" style={{ fontFamily: 'Satoshi' }}>{request.title}</span>
                        </div>
                        <div className="w-[170px] px-2">
                          <span className="text-[#070810] text-sm font-normal" style={{ fontFamily: 'Satoshi' }}>{request.category}</span>
                        </div>
                        <div className="w-[170px] px-2">
                          <span 
                            className="text-sm font-bold" 
                            style={{ 
                              color: request.statusColor,
                              fontFamily: 'Satoshi'
                            }}
                          >
                            {request.status}
                          </span>
                        </div>
                        <div className="w-[170px] px-2">
                          <span className="text-[#070810] text-sm font-normal" style={{ fontFamily: 'Satoshi' }}>{request.submissionDate}</span>
                        </div>
                        <div className="w-[170px] px-2">
                          <span className="text-[#070810] text-sm font-normal" style={{ fontFamily: 'Satoshi' }}>{request.toBeCompleted}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-8 text-center">
                      <span className="text-[#525866] text-sm">No requests found</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Exports Tab Content */}
            {activeMainTab === 'Exports' && (
              <div className="overflow-hidden rounded-[14px] border border-[#E5E8EC]">
                <div className="bg-[#F4F6F9] py-4 px-3">
                  <div className="flex items-center gap-3">
                    <div className="w-[260px] px-2">
                      <span className="text-[#070810] text-sm font-bold" style={{ fontFamily: 'Satoshi' }}>Entity Name</span>
                    </div>
                    <div className="w-[260px] px-2">
                      <span className="text-[#070810] text-sm font-bold" style={{ fontFamily: 'Satoshi' }}>Type</span>
                    </div>
                    <div className="w-[260px] px-2">
                      <span className="text-[#070810] text-sm font-bold" style={{ fontFamily: 'Satoshi' }}>Format</span>
                    </div>
                    <div className="w-[260px] px-2">
                      <span className="text-[#070810] text-sm font-bold" style={{ fontFamily: 'Satoshi' }}>Date</span>
                    </div>
                  </div>
                </div>
                <div className="bg-white">
                  {exportsData.length > 0 ? (
                    exportsData.map((exportItem, index, array) => (
                      <div
                        key={exportItem.id}
                        className="flex items-center gap-3 py-3 px-3"
                        style={{
                          borderBottom: index < array.length - 1 ? '0.40px solid #E5E8EC' : 'none'
                        }}
                      >
                        <div className="w-[260px] px-2">
                          <span className="text-[#070810] text-sm font-normal" style={{ fontFamily: 'Satoshi' }}>{exportItem.entityName}</span>
                        </div>
                        <div className="w-[260px] px-2">
                          <span className="text-[#070810] text-sm font-normal" style={{ fontFamily: 'Satoshi' }}>{exportItem.type}</span>
                        </div>
                        <div className="w-[260px] px-2">
                          <span className="text-[#070810] text-sm font-normal" style={{ fontFamily: 'Satoshi' }}>{exportItem.format}</span>
                        </div>
                        <div className="w-[260px] px-2">
                          <span className="text-[#070810] text-sm font-normal" style={{ fontFamily: 'Satoshi' }}>{exportItem.date}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-8 text-center">
                      <span className="text-[#525866] text-sm">No exports found</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CorporateClientRequestsExportsPage;

