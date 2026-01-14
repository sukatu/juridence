import React, { useState } from 'react';
import { Search, ChevronDown, Bell, ChevronRight, Home } from 'lucide-react';

const RegistrarBillingHistoryPage = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState('All');
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);

  const userInfo = JSON.parse(localStorage.getItem('userData') || '{}');
  const userName = userInfo?.first_name && userInfo?.last_name 
    ? `${userInfo.first_name} ${userInfo.last_name}` 
    : 'Ben Frimpong';

  // Sample billing history data
  const billingHistory = [
    {
      package: 'Pro / Yearly',
      paymentMethod: 'Paystack',
      amount: 'Gh¢1,990',
      date: '11-10-2025',
      status: 'Processed',
      statusColor: 'rgba(48.52, 171.63, 147.01, 0.10)',
      textColor: '#3B82F6'
    },
    {
      package: 'Standard / Monthly',
      paymentMethod: 'Bank Transfer',
      amount: 'Gh¢450',
      date: '05-09-2025',
      status: 'Processed',
      statusColor: 'rgba(48.52, 171.63, 147.01, 0.10)',
      textColor: '#3B82F6'
    },
    {
      package: 'Advanced / Yearly',
      paymentMethod: 'Paystack',
      amount: 'Gh¢2,500',
      date: '28-08-2025',
      status: 'Pending',
      statusColor: 'rgba(245, 158, 11, 0.10)',
      textColor: '#F59E0B'
    },
    {
      package: 'Pro / Monthly',
      paymentMethod: 'Mobile Money',
      amount: 'Gh¢650',
      date: '15-08-2025',
      status: 'Processed',
      statusColor: 'rgba(48.52, 171.63, 147.01, 0.10)',
      textColor: '#3B82F6'
    },
    {
      package: 'Standard / Yearly',
      paymentMethod: 'Paystack',
      amount: 'Gh¢1,200',
      date: '01-08-2025',
      status: 'Failed',
      statusColor: 'rgba(239, 68, 68, 0.10)',
      textColor: '#EF4444'
    }
  ];

  // Filter billing history based on active tab
  const filteredHistory = billingHistory.filter(item => {
    if (activeTab === 'Monthly') return item.package.includes('Monthly');
    if (activeTab === 'Yearly') return item.package.includes('Yearly');
    return true; // 'All'
  });

  return (
    <div className="bg-[#F7F8FA] min-h-screen w-full">
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
                className="flex-1 self-stretch text-[#525866] bg-transparent text-xs py-3.5 pl-2 mr-1 border-0 outline-none"
              />
              <div className="flex items-center w-[73px] gap-1.5">
                <div className="w-3 h-3 border border-[#868C98] rounded"></div>
                <span className="text-[#868C98] text-sm">|</span>
              </div>
              <div 
                className="w-12 px-1 py-1 bg-white rounded text-center cursor-pointer"
                onClick={() => setShowFilterDropdown(!showFilterDropdown)}
              >
                <span className="text-[#525866] text-xs font-bold">All</span>
                <ChevronDown className="w-3 h-3 text-[#141B34] inline ml-0.5" />
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
        <div className="flex flex-col bg-white p-4 gap-6 rounded-lg w-full" style={{ minHeight: '917px' }}>
          {/* Breadcrumb */}
          <span className="text-[#525866] text-xs opacity-75">BILLING</span>

          {/* Header Section */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-1">
              <ChevronRight className="w-4 h-4 text-[#050F1C] rotate-180" />
              <Home className="w-4 h-4 text-[#050F1C]" />
              <span className="text-[#050F1C] text-xl font-semibold">Billing history</span>
            </div>
            <span className="text-[#070810] text-sm opacity-75">
              All billing information and history are here.
            </span>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-4 px-1 pb-2 border-b border-transparent">
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
              onClick={() => setActiveTab('Monthly')}
              className={`pb-2 px-0 text-base transition-colors ${
                activeTab === 'Monthly'
                  ? 'text-[#022658] border-b-4 border-[#022658] font-bold'
                  : 'text-[#525866] font-normal'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setActiveTab('Yearly')}
              className={`pb-2 px-0 text-base transition-colors ${
                activeTab === 'Yearly'
                  ? 'text-[#022658] border-b-4 border-[#022658] font-bold'
                  : 'text-[#525866] font-normal'
              }`}
            >
              Yearly
            </button>
          </div>

          {/* Billing History Table */}
          <div className="pt-4 pb-4 bg-white rounded-3xl flex flex-col gap-4">
            <div className="overflow-hidden rounded-[14px] border border-[#E5E8EC] w-full">
              {/* Table Header */}
              <div className="bg-[#F4F6F9] py-4 px-3">
                <div className="flex items-center gap-3 w-full">
                  <div className="w-[210px] px-2">
                    <span className="text-[#070810] text-sm font-bold">Package</span>
                  </div>
                  <div className="w-[210px] px-2">
                    <span className="text-[#070810] text-sm font-bold">Payment method</span>
                  </div>
                  <div className="w-[210px] px-2">
                    <span className="text-[#070810] text-sm font-bold">Amount</span>
                  </div>
                  <div className="w-[210px] px-2">
                    <span className="text-[#070810] text-sm font-bold">Date</span>
                  </div>
                  <div className="w-[210px] px-2 flex justify-center">
                    <span className="text-[#070810] text-sm font-bold">Status</span>
                  </div>
                </div>
              </div>

              {/* Table Body */}
              <div className="bg-white w-full">
                {filteredHistory.map((item, index, array) => (
                  <div
                    key={index}
                    className={`flex items-center gap-3 py-3 px-3 w-full ${
                      index < array.length - 1 ? 'border-b border-[#E5E8EC]' : ''
                    }`}
                    style={{ borderBottomWidth: index < array.length - 1 ? '0.40px' : '0' }}
                  >
                    <div className="w-[210px] px-2">
                      <span className="text-[#070810] text-sm">{item.package}</span>
                    </div>
                    <div className="w-[210px] px-2">
                      <span className="text-[#070810] text-sm">{item.paymentMethod}</span>
                    </div>
                    <div className="w-[210px] px-2">
                      <span className="text-[#070810] text-sm">{item.amount}</span>
                    </div>
                    <div className="w-[210px] px-2">
                      <span className="text-[#070810] text-sm">{item.date}</span>
                    </div>
                    <div className="w-[210px] px-2 flex justify-center">
                      <div
                        className="px-2 py-1 rounded-lg"
                        style={{
                          background: item.statusColor,
                          width: '90px'
                        }}
                      >
                        <span
                          className="text-xs font-medium"
                          style={{ color: item.textColor }}
                        >
                          {item.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegistrarBillingHistoryPage;

