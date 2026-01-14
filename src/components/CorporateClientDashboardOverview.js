import React, { useState, useRef, useEffect } from 'react';
import { Bell, ChevronRight, FileText, Eye, AlertTriangle, MoreVertical } from 'lucide-react';
import CorporateClientHeader from './CorporateClientHeader';

const CorporateClientDashboardOverview = ({ userInfo, onNavigate, onLogout }) => {
  const [openActionMenuIndex, setOpenActionMenuIndex] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const actionMenuRefs = useRef({});
  
  // Use userInfo from props or localStorage
  const displayUserInfo = userInfo || JSON.parse(localStorage.getItem('userData') || '{}');
  const organizationName = displayUserInfo?.organization || 'Access Bank';

  const recentSearches = [
    { name: 'JKL Ventures Ltd', type: 'Company', status: '2 cases', lastViewed: 'Today' },
    { name: 'Ama Osei', type: 'Person', status: '1 cases', lastViewed: '2 days ago' },
    { name: 'BlueRock Mining Ltd', type: 'Company', status: 'No cases', lastViewed: 'Last week' },
    { name: 'Kofi Mensah', type: 'Person', status: 'No cases', lastViewed: 'Last week' }
  ];

  const watchlistItems = [
    { name: 'Meridian Properties', activity: '1 new case', riskScore: '58/100', riskColor: '#DEBB0C' },
    { name: 'Alpha Trade Ghana', activity: '2 gazette mentions', riskScore: '40/100', riskColor: '#10B981' },
    { name: 'Kofi Mensah', activity: 'No new updates', riskScore: '72/100', riskColor: '#EF4444' }
  ];

  const exportHistory = [
    { name: 'JKL Ventures Ltd', type: 'Company Risk Report', format: 'PDF', date: 'Nov 3, 2025' },
    { name: 'Vivian Osei vs Tano Holdings', type: 'Case Report', format: 'PDF', date: 'Nov 1, 2025' },
    { name: 'Kofi Mensah', type: 'Individual Risk Report', format: 'PDF', date: 'Oct 28, 2025' }
  ];

  // Handle click outside to close action menu
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (openActionMenuIndex !== null) {
        const ref = actionMenuRefs.current[openActionMenuIndex];
        if (ref && !ref.contains(event.target)) {
          setOpenActionMenuIndex(null);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openActionMenuIndex]);

  const handleActionMenuClick = (index, e) => {
    e.stopPropagation();
    setOpenActionMenuIndex(openActionMenuIndex === index ? null : index);
  };

  const handleRemove = (item) => {
    console.log('Remove item:', item);
    setOpenActionMenuIndex(null);
    // TODO: Implement remove functionality
  };

  const handleAssignInvestigation = (item) => {
    console.log('Assign investigation for:', item);
    setOpenActionMenuIndex(null);
    // TODO: Implement assign investigation functionality
  };

  return (
    <div className="bg-[#F7F8FA] min-h-screen">
      {/* Header */}
      <CorporateClientHeader userInfo={displayUserInfo} onNavigate={onNavigate} onLogout={onLogout} />

      {/* Main Content */}
      <div className="px-6">
        <div className="flex flex-col self-stretch bg-white py-4 px-4 gap-8 rounded-lg">
            {/* Quick Actions */}
            <div className="flex flex-col self-stretch gap-2">
              <span className="text-[#050F1C] text-base font-medium">Quick actions</span>
              <div className="flex items-center self-stretch gap-4">
                {/* Recent Searches Card */}
                <div className="w-[269px] h-[129px] p-4 bg-white rounded-2xl border-l border-b border-[#F59E0B] shadow-sm flex flex-col gap-3">
                  <div className="flex justify-between items-start self-stretch">
                    <div className="flex flex-col gap-2">
                      <div className="w-6 h-6 relative">
                        <div className="w-[18px] h-[18px] left-[3px] top-[3px] absolute border-2 border-[#022658] rounded"></div>
                      </div>
                      <span className="text-[#050F1C] text-base font-normal">Recent Searches</span>
                    </div>
                    <ChevronRight className="w-6 h-6 text-[#022658]" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <div className="self-stretch h-px bg-[#B1B9C6]"></div>
                    <span className="text-[#050F1C] text-xl font-semibold">12 this week</span>
                  </div>
                </div>

                {/* Reports Generated Card */}
                <div className="w-[269px] h-[129px] p-4 bg-white rounded-2xl border-l border-b border-[#F59E0B] shadow-sm flex flex-col gap-3">
                  <div className="flex justify-between items-start self-stretch">
                    <div className="flex flex-col gap-2">
                      <div className="w-6 h-6 relative">
                        <div className="w-[19px] h-[19px] left-[2.50px] top-[2.50px] absolute bg-white border-2 border-[#022658] rounded"></div>
                        <div className="w-[2.50px] h-[2.50px] left-[7px] top-[5.75px] absolute bg-[#022658] rounded-full"></div>
                        <div className="w-[2.50px] h-[2.50px] left-[7px] top-[15.75px] absolute bg-[#022658] rounded-full"></div>
                      </div>
                      <span className="text-[#050F1C] text-base font-normal">Reports Generated</span>
                    </div>
                    <ChevronRight className="w-6 h-6 text-[#022658]" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <div className="self-stretch h-px bg-[#B1B9C6]"></div>
                    <span className="text-[#050F1C] text-xl font-semibold">4 this month</span>
                  </div>
                </div>

                {/* Watchlisted Card */}
                <div className="w-[269px] h-[129px] p-4 bg-white rounded-2xl border-l border-b border-[#F59E0B] shadow-sm flex flex-col gap-3">
                  <div className="flex justify-between items-start self-stretch">
                    <div className="flex flex-col gap-2">
                      <Eye className="w-6 h-6 text-[#022658]" />
                      <span className="text-[#050F1C] text-base font-normal">Watchlisted</span>
                    </div>
                    <ChevronRight className="w-6 h-6 text-[#022658]" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <div className="self-stretch h-px bg-[#B1B9C6]"></div>
                    <span className="text-[#050F1C] text-xl font-semibold">8 entities</span>
                  </div>
                </div>

                {/* Search Requests Card */}
                <div className="w-[269px] h-[129px] p-4 bg-white rounded-2xl border-l border-b border-[#F59E0B] shadow-sm flex flex-col gap-3">
                  <div className="flex justify-between items-start self-stretch">
                    <div className="flex flex-col gap-1.5">
                      <FileText className="w-6 h-6 text-[#022658]" />
                      <span className="text-[#050F1C] text-base font-normal">Search Requests</span>
                    </div>
                    <ChevronRight className="w-6 h-6 text-[#022658]" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <div className="self-stretch h-px bg-[#B1B9C6]"></div>
                    <span className="text-[#050F1C] text-xl font-semibold">3 pending requests</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Searches and Watchlist */}
            <div className="flex items-start self-stretch gap-6">
              {/* Recent Searches Table */}
              <div className="flex-1 flex flex-col gap-2">
                <div className="flex justify-between items-center self-stretch">
                  <span className="text-[#050F1C] text-base font-medium">Recent searches</span>
                  <button className="text-[#022658] text-xs font-bold hover:opacity-70">See all</button>
                </div>
                <div className="flex-1 overflow-hidden rounded-[14px] border border-[#E5E8EC] flex flex-col">
                  {/* Table Header */}
                  <div className="flex items-center self-stretch bg-[#F4F6F9] py-4 gap-3">
                    <div className="w-[260px] px-2">
                      <span className="text-[#070810] text-sm font-bold">Entity Name</span>
                    </div>
                    <div className="w-[180px] px-2">
                      <span className="text-[#070810] text-sm font-bold">Type</span>
                    </div>
                    <div className="w-[110px] px-2">
                      <span className="text-[#070810] text-sm font-bold">Status</span>
                    </div>
                    <div className="w-[110px] px-2">
                      <span className="text-[#070810] text-sm font-bold">Last Viewed</span>
                    </div>
                  </div>

                  {/* Table Rows */}
                  {recentSearches.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center self-stretch py-3 gap-3"
                      style={{
                        borderBottom: index < recentSearches.length - 1 ? '0.40px solid #E5E8EC' : 'none'
                      }}
                    >
                      <div className="w-[260px] px-2">
                        <span className="text-[#070810] text-sm font-normal">{item.name}</span>
                      </div>
                      <div className="w-[180px] px-2 flex-1">
                        <span className="text-[#070810] text-sm font-normal">{item.type}</span>
                      </div>
                      <div className="w-[110px] px-2">
                        <span className="text-[#070810] text-sm font-normal">{item.status}</span>
                      </div>
                      <div className="w-[110px] px-2">
                        <span className="text-[#070810] text-sm font-normal">{item.lastViewed}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top 3 Monitored on Watchlist */}
              <div className="w-[380px] flex flex-col gap-2">
                <div className="flex justify-between items-center self-stretch">
                  <span className="text-[#050F1C] text-base font-medium">Top 3 monitored on Watchlist</span>
                  <button className="text-[#022658] text-xs font-bold hover:opacity-70">See all</button>
                </div>
                <div className="flex-1 overflow-hidden rounded-[14px] border border-[#E5E8EC] flex flex-col">
                  {/* Table Header */}
                  <div className="flex justify-between items-center self-stretch bg-[#F4F6F9] py-4 px-2">
                    <div className="w-[210px]">
                      <span className="text-[#070810] text-sm font-bold">Entity / Activity</span>
                    </div>
                    <div className="w-[100px]">
                      <span className="text-[#070810] text-sm font-bold">Risk score</span>
                    </div>
                    <div className="w-[40px]"></div>
                  </div>

                  {/* Table Rows */}
                  {watchlistItems.map((item, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center self-stretch py-3 px-2 relative"
                      style={{
                        borderBottom: index < watchlistItems.length - 1 ? '0.40px solid #E5E8EC' : 'none'
                      }}
                    >
                      <div className="w-[210px] flex flex-col gap-1.5">
                        <span className="text-[#070810] text-sm font-normal">{item.name}</span>
                        <span 
                          className="text-xs font-normal"
                          style={{ 
                            color: item.activity.includes('case') ? '#EF4444' : 
                                   item.activity.includes('gazette') ? '#F59E0B' : '#3B82F6'
                          }}
                        >
                          {item.activity}
                        </span>
                      </div>
                      <div className="w-[100px]">
                        <span 
                          className="text-sm font-bold"
                          style={{ color: item.riskColor }}
                        >
                          {item.riskScore}
                        </span>
                      </div>
                      <div className="w-[40px] flex justify-center relative">
                        <button
                          onClick={(e) => handleActionMenuClick(index, e)}
                          className="p-1 rounded-full hover:bg-gray-100"
                        >
                          <MoreVertical className="w-4 h-4 text-[#050F1C] rotate-90" />
                        </button>
                        {openActionMenuIndex === index && (
                          <div
                            ref={el => actionMenuRefs.current[index] = el}
                            className="absolute right-0 top-8 bg-white shadow-lg rounded-lg border border-[#E4E7EB] z-50 flex flex-col items-center p-4 gap-2"
                            style={{ 
                              boxShadow: '4px 4px 4px rgba(7, 8, 16, 0.10)', 
                              width: 'auto',
                              minWidth: '180px'
                            }}
                          >
                            <button
                              onClick={() => handleRemove(item)}
                              className="w-full text-center text-[#050F1C] text-base font-normal leading-[22px] hover:bg-gray-50 py-1 rounded transition-colors"
                              style={{ fontFamily: 'Roboto' }}
                            >
                              Remove
                            </button>
                            <div className="w-full h-px bg-[#D4E1EA]"></div>
                            <button
                              onClick={() => handleAssignInvestigation(item)}
                              className="w-full text-center text-[#050F1C] text-base font-normal leading-[22px] hover:bg-gray-50 py-1 rounded transition-colors"
                              style={{ fontFamily: 'Roboto' }}
                            >
                              Assign investigation
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Export History and Alerts */}
            <div className="flex items-start self-stretch gap-6">
              {/* Export History */}
              <div className="w-[716px] flex flex-col gap-2">
                <div className="flex justify-between items-center self-stretch">
                  <span className="text-[#050F1C] text-base font-medium">Export history</span>
                  <button className="text-[#022658] text-xs font-bold hover:opacity-70">See all</button>
                </div>
                <div className="flex-1 overflow-hidden rounded-[14px] border border-[#E5E8EC] flex flex-col">
                  {/* Table Header */}
                  <div className="flex items-center self-stretch bg-[#F4F6F9] py-4 gap-3">
                    <div className="w-[260px] px-2">
                      <span className="text-[#070810] text-sm font-bold">Entity Name</span>
                    </div>
                    <div className="w-[180px] px-2">
                      <span className="text-[#070810] text-sm font-bold">Type</span>
                    </div>
                    <div className="w-[110px] px-2">
                      <span className="text-[#070810] text-sm font-bold">Format</span>
                    </div>
                    <div className="w-[110px] px-2">
                      <span className="text-[#070810] text-sm font-bold">Date</span>
                    </div>
                  </div>

                  {/* Table Rows */}
                  {exportHistory.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center self-stretch py-3 gap-3"
                      style={{
                        borderBottom: index < exportHistory.length - 1 ? '0.40px solid #E5E8EC' : 'none'
                      }}
                    >
                      <div className="w-[260px] px-2">
                        <span className="text-[#070810] text-sm font-normal">{item.name}</span>
                      </div>
                      <div className="w-[180px] px-2 flex-1">
                        <span className="text-[#070810] text-sm font-normal">{item.type}</span>
                      </div>
                      <div className="w-[110px] px-2">
                        <span className="text-[#070810] text-sm font-normal">{item.format}</span>
                      </div>
                      <div className="w-[110px] px-2">
                        <span className="text-[#070810] text-sm font-normal">{item.date}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Alerts */}
              <div className="w-[380px] flex flex-col gap-2">
                <div className="flex justify-between items-center self-stretch h-5">
                  <span className="text-[#050F1C] text-base font-medium">Alerts</span>
                  <button className="text-[#022658] text-xs font-bold hover:opacity-70">See all</button>
                </div>
                <div className="flex-1 p-4 bg-white rounded-3xl border border-[#D4E1EA] flex flex-col gap-10">
                  <div className="flex flex-col self-stretch gap-6">
                    {/* Alert 1 */}
                    <div className="flex flex-col self-stretch gap-4 pb-2 border-b border-[#D4E1EA]">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-[#F7F8FA] rounded-lg">
                          <AlertTriangle className="w-4 h-4 text-[#525866]" />
                        </div>
                        <div className="flex-1 flex flex-col gap-3">
                          <div className="flex flex-col gap-2">
                            <span className="text-[#050F1C] text-base font-medium">
                              ⚠️ New Case Filed Against: Meridian Properties
                            </span>
                            <div>
                              <span className="text-[#10B981] text-sm font-normal">Filed</span>
                              <span className="text-[#525866] text-sm font-normal">: High Court, Accra – Nov 12, 2025</span>
                            </div>
                            <div>
                              <span className="text-[#EF4444] text-sm font-normal">Role</span>
                              <span className="text-[#525866] text-sm font-normal">: Defendant</span>
                            </div>
                          </div>
                          <span className="text-[#525866] text-xs font-normal">Just now</span>
                        </div>
                      </div>
                    </div>

                    {/* Alert 2 */}
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-[#F7F8FA] rounded-lg">
                        <FileText className="w-4 h-4 text-[#525866]" />
                      </div>
                      <div className="flex-1 flex flex-col gap-3">
                        <div className="flex flex-col gap-2">
                          <span className="text-[#050F1C] text-base font-medium">
                            ⚠️ Gazette Update: BlueRock Mining Ltd
                          </span>
                          <div>
                            <span className="text-[#10B981] text-sm font-normal">Type</span>
                            <span className="text-[#525866] text-sm font-normal">: Change of Warehouse location</span>
                          </div>
                        </div>
                        <span className="text-[#525866] text-xs font-normal">3 hours ago</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
  );
};

export default CorporateClientDashboardOverview;

