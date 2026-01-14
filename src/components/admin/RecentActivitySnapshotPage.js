import React from 'react';
import AdminHeader from './AdminHeader';

const RecentActivitySnapshotPage = ({ onBack, userInfo, onNavigate, onLogout }) => {
  const activityData = [
    { date: 'Oct 24, 2025', module: 'Cases', event: 'New filings', count: '32', executor: 'Admin - Chris', success: '30', fail: '2', trend: '▲ +8%', trendColor: 'text-emerald-500' },
    { date: 'Oct 22, 2025', module: 'Cases', event: 'Motions filed', count: '22', executor: 'Admin - John', success: '21', fail: '1', trend: '▲ +5%', trendColor: 'text-emerald-500' },
    { date: 'Oct 23, 2025', module: 'Gazettes', event: 'Uploads approved', count: '10', executor: 'Registrar - Louis', success: '7', fail: '3', trend: '▼ -2%', trendColor: 'text-red-500' },
    { date: 'Oct 21, 2025', module: 'Gazettes', event: 'Notices issued', count: '15', executor: 'Registrar - Sarah', success: '14', fail: '1', trend: '▲ +10%', trendColor: 'text-emerald-500' },
    { date: 'Oct 19, 2025', module: 'Corporate Users', event: 'Access requests', count: '12', executor: 'Client - Emma', success: '10', fail: '2', trend: '▼ -10%', trendColor: 'text-red-500' },
    { date: 'Oct 24, 2025', module: 'Cases', event: 'New filings', count: '32', executor: 'Admin - Chris', success: '30', fail: '2', trend: '▲ +8%', trendColor: 'text-emerald-500' },
    { date: 'Oct 20, 2025', module: 'Cases', event: 'Hearing requests', count: '25', executor: 'Admin - Emily', success: '20', fail: '5', trend: '▲ +20%', trendColor: 'text-emerald-500' }
  ];

  return (
    <div className="bg-[#F7F8FA] min-h-screen w-full">
      {/* Header */}
      <AdminHeader userInfo={userInfo} onNavigate={onNavigate} onLogout={onLogout} />

      {/* Main Content */}
      <div className="px-6 w-full">
        <div className="flex flex-col w-full bg-white pt-4 pb-[46px] px-6 gap-6 rounded-lg">
          {/* Breadcrumb and Back Button */}
          <div className="flex flex-col items-start w-full gap-6">
            <div className="flex items-start">
              <span className="text-[#525866] text-xs mr-[5px] whitespace-nowrap">AUDIT LOG VIEWER</span>
              <img
                src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Iq8V0MifpP/0qitjc4y_expires_30_days.png"
                className="w-4 h-4 mr-1 object-fill flex-shrink-0"
              />
              <span className="text-[#070810] text-sm whitespace-nowrap">Recent Activity snapshot</span>
            </div>
            <button onClick={onBack} className="cursor-pointer hover:opacity-70">
              <img
                src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Iq8V0MifpP/xb6zioyu_expires_30_days.png"
                className="w-10 h-10 object-fill flex-shrink-0"
              />
            </button>
          </div>

          {/* Filter Controls */}
          <div className="flex justify-end items-center w-full">
            <span className="text-[#525866] text-xs mr-[25px] whitespace-nowrap">Show data for</span>
            <div className="flex items-center bg-[#F7F8FA] p-2 gap-1 rounded-lg border border-solid border-[#D4E1EA]">
              <img
                src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Iq8V0MifpP/s9kcqu8q_expires_30_days.png"
                className="w-4 h-4 rounded-lg object-fill flex-shrink-0"
              />
              <span className="text-[#070810] text-sm whitespace-nowrap">Last 30 days (as of 29 Oct., 2025)</span>
              <img
                src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Iq8V0MifpP/1om8e66s_expires_30_days.png"
                className="w-4 h-4 object-fill flex-shrink-0"
              />
            </div>
            <button className="flex items-center bg-[#F7F8FA] text-left p-2 ml-6 gap-0.5 rounded-lg border border-solid border-[#D4E1EA] hover:bg-gray-100 transition-colors">
              <span className="text-[#070810] text-sm whitespace-nowrap">Data type</span>
              <img
                src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Iq8V0MifpP/c9nl2s7b_expires_30_days.png"
                className="w-4 h-4 rounded-lg object-fill flex-shrink-0"
              />
            </button>
            <button className="flex items-center bg-[#F7F8FA] text-left p-2 ml-6 gap-[3px] rounded-lg border border-solid border-[#D4E1EA] hover:bg-gray-100 transition-colors">
              <span className="text-[#070810] text-sm whitespace-nowrap">Role</span>
              <img
                src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Iq8V0MifpP/yaiqe7pv_expires_30_days.png"
                className="w-4 h-4 rounded-lg object-fill flex-shrink-0"
              />
            </button>
          </div>

          {/* Search, Sort and Export */}
          <div className="flex justify-between items-start w-full gap-2">
            <div className="flex-1 pb-0.5 mr-4">
              <div className="flex items-center self-stretch bg-[#F7F8FA] py-[7px] px-2 gap-1.5 rounded-[5px] border border-solid border-[#F7F8FA]">
                <img
                  src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Iq8V0MifpP/harr0n2p_expires_30_days.png"
                  className="w-[11px] h-[11px] object-fill"
                />
                <input
                  type="text"
                  placeholder="Search here"
                  className="flex-1 text-[#868C98] bg-transparent text-[10px] border-0 outline-none"
                />
              </div>
            </div>
            <div className="flex items-start gap-[7px] mr-4">
              <div className="flex items-center py-[7px] px-[9px] gap-[5px] rounded border border-solid border-[#D4E1EA] cursor-pointer hover:bg-gray-50">
                <img
                  src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Iq8V0MifpP/x08ywoqb_expires_30_days.png"
                  className="w-[11px] h-[11px] rounded object-fill"
                />
                <span className="text-[#525866] text-xs whitespace-nowrap">Sort</span>
              </div>
            </div>
            <button className="flex items-center bg-transparent text-left py-1 px-4 gap-[7px] rounded-lg border border-solid border-[#F59E0B] hover:bg-orange-50 transition-colors">
              <span className="text-[#F59E0B] text-base whitespace-nowrap">Export list</span>
              <img
                src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Iq8V0MifpP/i6vkysaw_expires_30_days.png"
                className="w-4 h-4 rounded-lg object-fill flex-shrink-0"
              />
            </button>
          </div>

          {/* Activity Table */}
          <div className="flex flex-col w-full gap-1 rounded-[14px] border border-solid border-[#E5E8EC] overflow-hidden">
            {/* Table Header */}
            <div className="flex items-start w-full bg-[#F4F6F9] py-4 px-4 gap-3">
              <div className="flex flex-col items-start w-[13%] py-[7px]">
                <span className="text-[#070810] text-sm font-bold whitespace-nowrap">Date</span>
              </div>
              <div className="flex flex-col items-start w-[12%] py-[7px]">
                <span className="text-[#070810] text-sm font-bold whitespace-nowrap">Module</span>
              </div>
              <div className="flex flex-col items-start w-[14%] py-[7px]">
                <span className="text-[#070810] text-sm font-bold whitespace-nowrap">Event</span>
              </div>
              <div className="flex flex-col items-start w-[10%] py-[7px]">
                <span className="text-[#070810] text-sm font-bold whitespace-nowrap">Count</span>
              </div>
              <div className="flex flex-col items-start w-[16%] py-[7px]">
                <span className="text-[#070810] text-sm font-bold whitespace-nowrap">Executor</span>
              </div>
              <div className="flex flex-col items-start w-[10%] py-[7px]">
                <span className="text-[#070810] text-sm font-bold whitespace-nowrap">Success</span>
              </div>
              <div className="flex flex-col items-start w-[10%] py-[7px]">
                <span className="text-[#070810] text-sm font-bold whitespace-nowrap">Fail</span>
              </div>
              <div className="flex flex-col items-start w-[15%] py-[7px]">
                <span className="text-[#070810] text-sm font-bold whitespace-nowrap">Trend</span>
              </div>
            </div>

            {/* Table Rows */}
            {activityData.map((item, idx) => (
              <div key={idx} className="flex items-start w-full py-3 px-4 gap-3">
                <div className="flex flex-col items-start w-[13%] py-[7px]">
                  <span className="text-[#070810] text-sm whitespace-nowrap overflow-hidden text-ellipsis w-full">{item.date}</span>
                </div>
                <div className="flex flex-col items-start w-[12%] py-[7px]">
                  <span className="text-[#070810] text-sm whitespace-nowrap overflow-hidden text-ellipsis w-full">{item.module}</span>
                </div>
                <div className="flex flex-col items-start w-[14%] py-[7px]">
                  <span className="text-[#070810] text-sm whitespace-nowrap overflow-hidden text-ellipsis w-full">{item.event}</span>
                </div>
                <div className="flex flex-col items-start w-[10%] py-[7px]">
                  <span className="text-[#070810] text-sm whitespace-nowrap overflow-hidden text-ellipsis w-full">{item.count}</span>
                </div>
                <div className="flex flex-col items-start w-[16%] py-[7px]">
                  <span className="text-[#070810] text-sm whitespace-nowrap overflow-hidden text-ellipsis w-full">{item.executor}</span>
                </div>
                <div className="flex flex-col items-start w-[10%] py-[7px]">
                  <span className="text-[#070810] text-sm whitespace-nowrap overflow-hidden text-ellipsis w-full">{item.success}</span>
                </div>
                <div className="flex flex-col items-start w-[10%] py-[7px]">
                  <span className="text-[#070810] text-sm whitespace-nowrap overflow-hidden text-ellipsis w-full">{item.fail}</span>
                </div>
                <div className="flex flex-col items-start w-[15%] py-[7px]">
                  <span className={`text-sm whitespace-nowrap overflow-hidden text-ellipsis w-full ${item.trendColor}`}>{item.trend}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecentActivitySnapshotPage;

