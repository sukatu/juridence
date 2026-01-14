import React, { useState } from 'react';
import { Bell, ChevronRight, ChevronDown, Search, Filter, ArrowUpDown, MoreVertical, Eye, Trash2, Building2, Users, ChevronLeft, TrendingUp, TrendingDown } from 'lucide-react';
import CorporateClientHeader from './CorporateClientHeader';

const CorporateClientWatchlistPage = ({ userInfo, onNavigate, onLogout }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Use userInfo from props or localStorage
  const displayUserInfo = userInfo || JSON.parse(localStorage.getItem('userData') || '{}');
  const organizationName = displayUserInfo?.organization || 'Access Bank';

  // Sample watchlist data
  const watchlistItems = [
    { 
      id: 1, 
      name: 'EcoWind Corp.', 
      type: 'Company', 
      industry: 'Renewable Energy',
      riskScore: 90,
      riskColor: '#EF4444',
      trend: -36,
      trendColor: '#EF4444',
      performance: 'Low',
      authorizedCapital: '25M',
      people: ['/images/image.png', '/images/image.png', '/images/image.png']
    },
    { 
      id: 2, 
      name: 'TechNova', 
      type: 'Company', 
      industry: 'Technology',
      riskScore: 12,
      riskColor: '#10B981',
      trend: 52,
      trendColor: '#10B981',
      performance: 'High',
      authorizedCapital: '12M',
      people: ['/images/image.png', '/images/image.png', '/images/image.png']
    },
    { 
      id: 3, 
      name: 'AgriFuture', 
      type: 'Company', 
      industry: 'Agriculture',
      riskScore: 48,
      riskColor: '#DEBB0C',
      trend: 48,
      trendColor: '#3B82F6',
      performance: 'Low',
      authorizedCapital: '8M',
      people: ['/images/image.png', '/images/image.png', '/images/image.png']
    },
    { 
      id: 4, 
      name: 'John Kwame Louis', 
      type: 'Person', 
      industry: 'Manager at Access Bank',
      riskScore: 5,
      riskColor: '#10B981',
      trend: 93,
      trendColor: '#10B981',
      performance: 'High',
      totalCases: 2,
      people: ['/images/image.png']
    }
  ];

  const filteredItems = watchlistItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    let matchesFilter = true;
    if (selectedFilter === 'High risk') {
      matchesFilter = item.riskScore >= 71;
    } else if (selectedFilter === 'Medium risk') {
      matchesFilter = item.riskScore >= 41 && item.riskScore <= 70;
    } else if (selectedFilter === 'Low risk') {
      matchesFilter = item.riskScore <= 40;
    }
    return matchesSearch && matchesFilter;
  });

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const paginatedItems = filteredItems.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="bg-[#F7F8FA] min-h-screen">
      {/* Header */}
      <CorporateClientHeader userInfo={displayUserInfo} onNavigate={onNavigate} onLogout={onLogout} />

      {/* Main Content */}
      <div className="px-6 pb-10">
        {/* Page Title */}
        <div className="flex flex-col items-start w-full gap-2 mb-4">
          <span className="text-[#050F1C] text-xl font-medium" style={{ fontFamily: 'Poppins' }}>
            {organizationName},
          </span>
          <span className="text-[#050F1C] text-base opacity-75" style={{ fontFamily: 'Satoshi' }}>
            Track all your activities here.
          </span>
        </div>

        {/* Card Container */}
        <div className="flex flex-col bg-white rounded-lg border border-[#E5E8EC] shadow-sm p-6 gap-10">
          {/* Breadcrumb and Back Button */}
          <div className="flex items-center justify-between">
            <span className="text-[#525866] text-xs opacity-75 font-normal" style={{ fontFamily: 'Satoshi' }}>WATCHLIST</span>
            <button className="p-2 bg-[#F7F8FA] rounded-lg w-fit hover:opacity-80 transition-opacity">
              <ChevronLeft className="w-6 h-6 text-[#050F1C]" />
            </button>
          </div>

          {/* Title Section */}
          <div className="flex flex-col gap-1">
            <span className="text-[#050F1C] text-xl font-semibold" style={{ fontFamily: 'Poppins' }}>
              Watchlist
            </span>
            <span className="text-[#070810] text-sm font-normal opacity-75" style={{ fontFamily: 'Satoshi' }}>
              Monitor your tracked companies and persons in one place.
            </span>
          </div>

          {/* Filter Tabs and Clear Button */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSelectedFilter('All')}
                className={`pb-2 px-2 flex justify-center items-center gap-2.5 ${selectedFilter === 'All' ? 'border-b-4 border-[#022658] text-[#022658] font-bold' : 'text-[#525866] font-normal'}`}
                style={{ fontFamily: 'Satoshi' }}
              >
                <span className="text-base">All</span>
              </button>
              <button
                onClick={() => setSelectedFilter('High risk')}
                className={`pb-2 px-2 flex justify-center items-center gap-2.5 ${selectedFilter === 'High risk' ? 'border-b-4 border-[#022658] text-[#022658] font-bold' : 'text-[#525866] font-normal'}`}
                style={{ fontFamily: 'Satoshi' }}
              >
                <span className="text-base">High risk</span>
              </button>
              <button
                onClick={() => setSelectedFilter('Medium risk')}
                className={`pb-2 px-2 flex justify-center items-center gap-2.5 ${selectedFilter === 'Medium risk' ? 'border-b-4 border-[#022658] text-[#022658] font-bold' : 'text-[#525866] font-normal'}`}
                style={{ fontFamily: 'Satoshi' }}
              >
                <span className="text-base">Medium risk</span>
              </button>
              <button
                onClick={() => setSelectedFilter('Low risk')}
                className={`pb-2 px-2 flex justify-center items-center gap-2.5 ${selectedFilter === 'Low risk' ? 'border-b-4 border-[#022658] text-[#022658] font-bold' : 'text-[#525866] font-normal'}`}
                style={{ fontFamily: 'Satoshi' }}
              >
                <span className="text-base">Low risk</span>
              </button>
            </div>
            <button className="px-4 py-2 border border-[#F59E0B] rounded-lg text-[#F59E0B] text-base font-semibold hover:opacity-80 transition-opacity" style={{ fontFamily: 'Satoshi' }}>
              Clear watchlist
            </button>
          </div>

          {/* Watchlist Cards */}
          <div className="flex flex-col gap-4">
            {filteredItems.map((item) => (
              <div key={item.id} className="h-[95px] p-6 bg-[#F7F8FA] rounded-lg flex justify-between items-center">
                {/* Left Section */}
                <div className="flex-1 max-w-[760px] flex justify-between items-center">
                  {/* Company/Person Info */}
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-[#F7F8FA] rounded-lg">
                      {item.type === 'Company' ? (
                        <Building2 className="w-4 h-4 text-[#050F1C]" />
                      ) : (
                        <Users className="w-4 h-4 text-[#050F1C]" />
                      )}
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-[#050F1C] text-base font-medium" style={{ fontFamily: 'Satoshi' }}>{item.name}</span>
                      <span className="text-[#525866] text-[10px] font-normal" style={{ fontFamily: 'Satoshi' }}>{item.industry}</span>
                    </div>
                  </div>

                  {/* Right Section - Stats */}
                  <div className="flex items-center gap-10">
                    {/* People Avatars */}
                    {item.type === 'Company' && (
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center -space-x-2">
                          {item.people?.slice(0, 3).map((avatar, idx) => (
                            <img
                              key={idx}
                              src={avatar}
                              alt="Person"
                              className="w-6 h-6 rounded-full border-2 border-white object-cover"
                              onError={(e) => {
                                e.target.src = '/images/image.png';
                              }}
                            />
                          ))}
                        </div>
                        <span className="text-[#050F1C] text-sm font-normal" style={{ fontFamily: 'Satoshi' }}>People</span>
                      </div>
                    )}

                    {/* Trend Chart */}
                    <div className="flex flex-col gap-1">
                      <div className="relative w-[92px] h-[24px]">
                        <div 
                          className="w-full h-full rounded-t"
                          style={{
                            background: `linear-gradient(180deg, ${item.trendColor} 0%, rgba(255, 255, 255, 0) 100%)`
                          }}
                        ></div>
                        <div 
                          className="absolute bottom-0 w-[90px] h-[19px] rounded-t border-t-2"
                          style={{
                            borderColor: item.trendColor
                          }}
                        ></div>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-[#050F1C] text-sm font-normal" style={{ fontFamily: 'Satoshi' }}>Trend</span>
                        <span className="text-sm font-bold" style={{ color: item.trendColor, fontFamily: 'Satoshi' }}>
                          {Math.abs(item.trend)}%
                        </span>
                        {item.trend > 0 ? (
                          <TrendingUp className="w-3 h-3" style={{ color: item.trendColor }} />
                        ) : (
                          <TrendingDown className="w-3 h-3" style={{ color: item.trendColor }} />
                        )}
                      </div>
                    </div>

                    {/* Risk Score Indicator */}
                    <div className="flex items-center gap-2">
                      {/* Circular Progress Indicator */}
                      <div className="relative w-8 h-8">
                        <svg className="w-8 h-8 transform -rotate-90" viewBox="0 0 32 32">
                          <circle
                            cx="16"
                            cy="16"
                            r="14"
                            fill="none"
                            stroke="#E5E8EC"
                            strokeWidth="2"
                          />
                          <circle
                            cx="16"
                            cy="16"
                            r="14"
                            fill="none"
                            stroke={item.riskColor}
                            strokeWidth="2"
                            strokeDasharray={`${(item.riskScore / 100) * 87.96} 87.96`}
                            strokeLinecap="round"
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-[6px] font-bold text-[#050F1C]" style={{ fontFamily: 'Satoshi', lineHeight: '6px' }}>
                            {item.riskScore}%
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-[#050F1C] text-sm font-normal" style={{ fontFamily: 'Satoshi' }}>Score out of 100</span>
                        <div>
                          <span className="text-[#525866] text-sm font-normal" style={{ fontFamily: 'Satoshi' }}>Performance </span>
                          <span className="text-sm font-bold" style={{ color: item.riskColor, fontFamily: 'Satoshi' }}>
                            {item.performance}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Authorized Capital / Total Cases */}
                    <div className="flex flex-col gap-1">
                      <span className="text-[#050F1C] text-sm font-normal" style={{ fontFamily: 'Satoshi' }}>
                        {item.type === 'Company' ? 'Authorized capital' : 'Total cases'}
                      </span>
                      <div>
                        {item.type === 'Company' ? (
                          <>
                            <span className="text-[#525866] text-sm font-normal" style={{ fontFamily: 'Satoshi' }}>GHS </span>
                            <span className="text-[#022658] text-sm font-bold" style={{ fontFamily: 'Satoshi' }}>{item.authorizedCapital}</span>
                          </>
                        ) : (
                          <span className="text-[#022658] text-sm font-bold" style={{ fontFamily: 'Satoshi' }}>{item.totalCases}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Remove Button */}
                <button className="text-[#022658] text-sm font-bold hover:opacity-70" style={{ fontFamily: 'Satoshi' }}>
                  Remove from Watchlist
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CorporateClientWatchlistPage;

