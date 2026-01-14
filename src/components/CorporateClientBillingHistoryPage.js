import React, { useState } from 'react';
import { Bell, ChevronRight, ChevronLeft, CreditCard } from 'lucide-react';

const CorporateClientBillingHistoryPage = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const userInfo = JSON.parse(localStorage.getItem('userData') || '{}');
  const userName = userInfo?.first_name && userInfo?.last_name 
    ? `${userInfo.first_name} ${userInfo.last_name}` 
    : 'Tonia Martins';
  const organizationName = userInfo?.organization || 'Access Bank';

  const billingHistoryData = [
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
      date: '15-08-2025',
      status: 'Pending',
      statusColor: 'rgba(243, 111, 38, 0.10)',
      textColor: '#F59E0B'
    },
    {
      package: 'Pro / Monthly',
      paymentMethod: 'Mobile Money',
      amount: 'Gh¢800',
      date: '20-07-2025',
      status: 'Failed',
      statusColor: 'rgba(243, 89.25, 38, 0.10)',
      textColor: '#EF4444'
    }
  ];

  const filteredData = activeTab === 'all' 
    ? billingHistoryData 
    : activeTab === 'monthly'
    ? billingHistoryData.filter(item => item.package.includes('Monthly'))
    : billingHistoryData.filter(item => item.package.includes('Yearly'));

  return (
    <div className="bg-[#F7F8FA] min-h-screen">
      {/* Full Width Header */}
      <div className="w-full bg-white py-3.5 px-6 mb-4">
        <div className="flex justify-between items-center">
          <div className="flex justify-between items-center w-[700px] pr-2 rounded-lg border border-solid border-[#D4E1EA] bg-white">
            <input
              type="text"
              placeholder="Search companies and persons here"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 self-stretch text-[#525866] bg-transparent text-xs py-3.5 pl-2 mr-1 border-0 outline-none"
            />
            <div className="flex items-center w-[73px] gap-1.5">
              <div className="w-3 h-3 border border-[#868C98] rounded"></div>
              <div className="flex items-center bg-white w-12 py-1 px-[9px] gap-1 rounded">
                <span className="text-[#525866] text-xs font-bold">All</span>
                <ChevronRight className="w-3 h-3 text-[#141B34] rotate-90" />
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
                <span className="text-[#040E1B] text-base font-bold">{userName}</span>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-[#10B981] rounded-full"></div>
                  <span className="text-[#525866] text-xs">Online</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-6">
        <div className="flex flex-col self-stretch bg-white py-4 px-4 gap-6 rounded-lg">
            {/* Breadcrumb */}
            <span className="text-[#525866] text-xs font-normal opacity-75">
              BILLING
            </span>

            {/* Title Section */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-1">
                <button
                  onClick={onBack}
                  className="p-1 hover:opacity-70"
                >
                  <ChevronLeft className="w-4 h-4 text-[#050F1C]" />
                </button>
                <CreditCard className="w-4 h-4 text-[#050F1C]" />
                <span className="text-[#050F1C] text-xl font-semibold" style={{ fontFamily: 'Roboto' }}>
                  Billing history
                </span>
              </div>
              <span className="text-[#070810] text-sm font-normal opacity-75" style={{ fontFamily: 'Roboto' }}>
                All billing information and history are here.
              </span>
            </div>

            {/* Tabs */}
            <div className="flex flex-col self-stretch">
              <div className="flex items-center gap-4 pb-2">
                <button
                  onClick={() => setActiveTab('all')}
                  className={`pb-2 px-2 ${activeTab === 'all' ? 'border-b-4 border-[#022658]' : ''}`}
                >
                  <span className={`text-base font-normal ${activeTab === 'all' ? 'text-[#022658] font-bold' : 'text-[#525866]'}`}>
                    All
                  </span>
                </button>
                <button
                  onClick={() => setActiveTab('monthly')}
                  className={`pb-2 px-2 ${activeTab === 'monthly' ? 'border-b-4 border-[#022658]' : ''}`}
                >
                  <span className={`text-base font-normal ${activeTab === 'monthly' ? 'text-[#022658] font-bold' : 'text-[#525866]'}`}>
                    Monthly
                  </span>
                </button>
                <button
                  onClick={() => setActiveTab('yearly')}
                  className={`pb-2 px-2 ${activeTab === 'yearly' ? 'border-b-4 border-[#022658]' : ''}`}
                >
                  <span className={`text-base font-normal ${activeTab === 'yearly' ? 'text-[#022658] font-bold' : 'text-[#525866]'}`}>
                    Yearly
                  </span>
                </button>
              </div>

              {/* Table */}
              <div className="pt-4 pb-4 bg-white rounded-3xl">
                <div className="overflow-hidden rounded-[14px] border border-[#E5E8EC] w-full">
                  {/* Table Header */}
                  <div className="bg-[#F4F6F9] py-4 px-3">
                    <div className="flex items-center gap-3 w-full">
                      <div className="flex-1 min-w-[210px] px-2">
                        <span className="text-[#070810] text-sm font-bold">Package</span>
                      </div>
                      <div className="flex-1 min-w-[210px] px-2">
                        <span className="text-[#070810] text-sm font-bold">Payment method</span>
                      </div>
                      <div className="flex-1 min-w-[210px] px-2">
                        <span className="text-[#070810] text-sm font-bold">Amount</span>
                      </div>
                      <div className="flex-1 min-w-[210px] px-2">
                        <span className="text-[#070810] text-sm font-bold">Date</span>
                      </div>
                      <div className="flex-1 min-w-[210px] px-2 flex justify-center">
                        <span className="text-[#070810] text-sm font-bold">Status</span>
                      </div>
                    </div>
                  </div>

                  {/* Table Rows */}
                  <div className="bg-white w-full">
                    {filteredData.map((item, index, array) => (
                      <div
                        key={index}
                        className="flex items-center gap-3 py-3 px-3 pr-2 w-full"
                        style={{
                          borderBottom: index < array.length - 1 ? '0.40px solid #E5E8EC' : 'none'
                        }}
                      >
                        <div className="flex-1 min-w-[210px] px-2">
                          <span className="text-[#070810] text-sm font-normal">{item.package}</span>
                        </div>
                        <div className="flex-1 min-w-[210px] px-2">
                          <span className="text-[#070810] text-sm font-normal">{item.paymentMethod}</span>
                        </div>
                        <div className="flex-1 min-w-[210px] px-2">
                          <span className="text-[#070810] text-sm font-normal">{item.amount}</span>
                        </div>
                        <div className="flex-1 min-w-[210px] px-2">
                          <span className="text-[#070810] text-sm font-normal">{item.date}</span>
                        </div>
                        <div className="flex-1 min-w-[210px] px-2 flex justify-center">
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
      </div>
  );
};

export default CorporateClientBillingHistoryPage;

