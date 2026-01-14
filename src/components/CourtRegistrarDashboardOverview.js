import React, { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown, Bell, MoreVertical, X } from 'lucide-react';
import RegistrarHeader from './RegistrarHeader';

const CourtRegistrarDashboardOverview = ({ userInfo, onNavigate, onLogout }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
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

  // Sample data
  const quickActions = [
    {
      title: 'Total Cases Managed',
      value: '128',
      icon: '📋'
    },
    {
      title: 'Upcoming Hearings (This Week)',
      value: '12',
      icon: '📅'
    },
    {
      title: 'Gazette Notices Uploaded (This Week)',
      value: '8',
      icon: '📰'
    }
  ];

  const gazetteData = [
    {
      id: 'GZ-1093',
      title: 'Contract Ruling Notice',
      dateUploaded: 'Oct 28',
      linkedCases: 'CM/0245/2023',
      status: 'Approved',
      statusColor: 'rgba(48.52, 171.63, 64.94, 0.10)',
      textColor: '#10B981',
      opacity: 1
    },
    {
      id: 'GZ-1079',
      title: 'Revocation Notice',
      dateUploaded: 'Oct 24',
      linkedCases: '-',
      status: 'Pending',
      statusColor: 'rgba(243, 111, 38, 0.10)',
      textColor: '#F59E0B',
      opacity: 0.80
    },
    {
      id: 'GZ-1093',
      title: 'Contract Ruling Notice',
      dateUploaded: 'Oct 20',
      linkedCases: 'CM/0245/2023',
      status: 'Approved',
      statusColor: 'rgba(48.52, 171.63, 64.94, 0.10)',
      textColor: '#10B981',
      opacity: 1
    }
  ];

  const pendingTasks = [
    {
      task: 'Review Case #CM/0245/2023',
      due: 'Dec. 1'
    },
    {
      task: 'Upload Cause List for Dec. 4',
      due: 'Dec. 2'
    }
  ];

  const caseManagement = [
    {
      caseNo: 'CM/0245/2023',
      parties: 'JKL Ventures Ltd vs Meridian Properties',
      lastUpdated: 'Oct 30',
      nextHearing: 'Nov 3',
      status: 'Ongoing',
      statusColor: 'rgba(48.52, 171.63, 147.01, 0.10)',
      textColor: '#3B82F6',
      opacity: 1
    },
    {
      caseNo: 'CM/0290/2023',
      parties: 'Ama Osei vs Tano Holdings',
      lastUpdated: 'Oct 27',
      nextHearing: '-',
      status: 'Closed',
      statusColor: 'rgba(48.52, 171.63, 64.94, 0.10)',
      textColor: '#10B981',
      opacity: 0.80
    },
    {
      caseNo: 'CM/0312/2023',
      parties: 'Kwame Ltd vs Eagle Group',
      lastUpdated: 'Oct 29',
      nextHearing: 'Nov 4',
      status: 'Pending',
      statusColor: 'rgba(243, 111, 38, 0.10)',
      textColor: '#F59E0B',
      opacity: 1
    }
  ];

  const alerts = [
    {
      icon: '🔔',
      title: 'New approval',
      message: 'Admin approved Gazette #GZ-1079',
      time: 'Just now'
    },
    {
      icon: '📢',
      title: 'Hearing alert',
      message: 'Upcoming Cause List for Nov 3 has been published',
      time: '3 hours ago'
    }
  ];

  return (
    <div className="flex-1 bg-[#F7F8FA] pr-6 rounded-lg">
      <div className="flex items-start gap-6">
        {/* Main Content */}
        <div className="flex-1 flex flex-col bg-[#F7F8FA] pt-2 pb-[52px] gap-4">
          {/* Header */}
          <RegistrarHeader userInfo={displayUserInfo} onNavigate={onNavigate} onLogout={onLogout} />
          
          {/* Page Title Section */}
          <div className="px-1.5 pb-2 border-b border-[#D4E1EA]">
            <div className="flex flex-col items-start w-[263px] gap-1">
              <span className="text-[#050F1C] text-xl font-medium">
                High Court (Commercial),
              </span>
              <span className="text-[#050F1C] text-base font-normal opacity-75">
                Track all your activities here.
              </span>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex flex-col self-stretch bg-white py-4 px-4 gap-8 rounded-lg">
            {/* Quick Actions */}
            <div className="flex flex-col items-start self-stretch gap-2">
              <span className="text-[#050F1C] text-lg font-normal">
                Quick actions
              </span>
              <div className="flex items-start self-stretch gap-4">
                {quickActions.map((action, index) => (
                  <div
                    key={index}
                    className="flex flex-col bg-white flex-1 p-4 gap-3 rounded-2xl h-[129px]"
                    style={{ 
                      boxShadow: '0px 2px 20px rgba(0, 0, 0, 0.06)',
                      borderLeft: '1px solid #F59E0B',
                      borderBottom: '1px solid #F59E0B'
                    }}
                  >
                    <div className="flex justify-between items-start self-stretch">
                      <div className="flex flex-col items-start gap-2">
                        <span className="text-2xl">{action.icon}</span>
                        <span className="text-[#050F1C] text-base font-normal text-center">
                          {action.title}
                        </span>
                      </div>
                      <div className="w-6 h-6 relative">
                        <ChevronDown className="w-6 h-6 text-[#022658] rotate-90" />
                      </div>
                    </div>
                    <div className="flex flex-col items-start self-stretch gap-2">
                      <div className="self-stretch h-px" style={{ outline: '1px #B1B9C6 solid', outlineOffset: '-0.5px' }}></div>
                      <span className="text-[#050F1C] text-xl font-semibold" style={{ fontFamily: 'Roboto' }}>
                        {action.value}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Gazette Tracking and Today's Alert + Pending Tasks */}
            <div className="flex items-start self-stretch gap-6">
              {/* Gazette Tracking */}
              <div className="flex flex-col flex-1 gap-2">
                <div className="flex justify-between items-center self-stretch">
                  <span className="text-[#050F1C] text-lg font-normal">
                    Gazette Tracking
                  </span>
                  <span className="text-[#022658] text-xs font-bold cursor-pointer hover:underline">
                    See all
                  </span>
                </div>
                <div className="flex flex-col self-stretch gap-1 rounded-[14px] border border-solid border-[#E5E8EC] overflow-hidden">
                  {/* Header */}
                  <div className="flex items-center self-stretch bg-[#F4F6F9] py-4 gap-3">
                    <div className="w-[148px] px-2">
                      <span className="text-[#070810] text-sm font-bold">
                        Gazette ID
                      </span>
                    </div>
                    <div className="w-[180px] px-2">
                      <span className="text-[#070810] text-sm font-bold">
                        Title
                      </span>
                    </div>
                    <div className="w-[120px] px-2">
                      <span className="text-[#070810] text-sm font-bold">
                        Date Uploaded
                      </span>
                    </div>
                    <div className="w-[110px] px-2">
                      <span className="text-[#070810] text-sm font-bold">
                        Linked Cases
                      </span>
                    </div>
                    <div className="w-[110px] px-2 flex justify-center">
                      <span className="text-[#070810] text-sm font-bold">
                        Status
                      </span>
                    </div>
                  </div>
                  {/* Rows */}
                  {gazetteData.map((item, index) => (
                    <div 
                      key={index} 
                      className="flex items-center self-stretch py-3 gap-3"
                      style={{ 
                        borderBottom: index < gazetteData.length - 1 ? '0.40px solid #E5E8EC' : 'none',
                        opacity: item.opacity
                      }}
                    >
                      <div className="w-[148px] px-2">
                        <span className="text-[#070810] text-sm font-normal">
                          {item.id}
                        </span>
                      </div>
                      <div className="w-[180px] px-2 flex-1">
                        <span className="text-[#070810] text-sm font-normal">
                          {item.title}
                        </span>
                      </div>
                      <div className="w-[120px] px-2">
                        <span className="text-[#070810] text-sm font-normal">
                          {item.dateUploaded}
                        </span>
                      </div>
                      <div className="w-[110px] px-2">
                        <span className="text-[#070810] text-sm font-normal">
                          {item.linkedCases}
                        </span>
                      </div>
                      <div className="w-[110px] px-2 flex justify-center">
                        <div 
                          className="px-2 py-1 rounded-lg"
                          style={{
                            background: item.statusColor,
                            width: '70px'
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

              {/* Today's Alert and Pending Tasks */}
              <div className="flex flex-col gap-6" style={{ width: '380px' }}>
                {/* Today at 10am Alert */}
                <div 
                  className="h-[58px] px-2 py-4 bg-[#3B82F6] rounded-lg flex items-center gap-3"
                >
                  <span className="text-white text-sm font-normal">
                    Today at 10am:
                  </span>
                  <span className="text-white text-sm font-bold">
                    JKL Ventures Ltd vs Meridian Properties
                  </span>
                </div>

                {/* Pending Tasks */}
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-center self-stretch">
                    <span className="text-[#050F1C] text-lg font-normal">
                      Pending tasks
                    </span>
                    <span className="text-[#022658] text-xs font-bold cursor-pointer hover:underline">
                      See all
                    </span>
                  </div>
                  <div className="flex flex-col self-stretch gap-1 rounded-[14px] border border-solid border-[#E5E8EC] overflow-hidden">
                    {/* Header */}
                    <div className="flex items-center self-stretch bg-[#F4F6F9] py-4 gap-3">
                      <div className="w-[210px] px-2">
                        <span className="text-[#070810] text-sm font-bold">
                          Task
                        </span>
                      </div>
                      <div className="w-[100px] px-2">
                        <span className="text-[#070810] text-sm font-bold">
                          Due
                        </span>
                      </div>
                      <div className="w-10 h-[35px]"></div>
                    </div>
                    {/* Rows */}
                    {pendingTasks.map((task, index) => (
                      <div 
                        key={index} 
                        className="flex items-center self-stretch py-3 gap-3"
                        style={{ 
                          borderBottom: index < pendingTasks.length - 1 ? '0.40px solid #E5E8EC' : 'none'
                        }}
                      >
                        <div className="w-[210px] px-2 flex-1">
                          <span className="text-[#070810] text-sm font-normal">
                            {task.task}
                          </span>
                        </div>
                        <div className="w-[100px] px-2">
                          <span className="text-[#070810] text-sm font-normal">
                            {task.due}
                          </span>
                        </div>
                        <div className="w-10 px-2 flex items-center justify-center">
                          <MoreVertical className="w-4 h-4 text-[#050F1C] rotate-90" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Case Management Snapshot and Alerts */}
            <div className="flex items-start self-stretch gap-6">
              {/* Case Management Snapshot */}
              <div className="flex flex-col flex-1 gap-2">
                <div className="flex justify-between items-center self-stretch">
                  <span className="text-[#050F1C] text-lg font-normal">
                    Case Management snapshot
                  </span>
                  <span className="text-[#022658] text-xs font-bold cursor-pointer hover:underline">
                    See all
                  </span>
                </div>
                <div className="flex flex-col self-stretch gap-1 rounded-[14px] border border-solid border-[#E5E8EC] overflow-hidden">
                  {/* Header */}
                  <div className="flex items-center self-stretch bg-[#F4F6F9] py-4 gap-3">
                    <div className="w-[110px] px-2">
                      <span className="text-[#070810] text-sm font-bold">
                        Case No.
                      </span>
                    </div>
                    <div className="w-[180px] px-2">
                      <span className="text-[#070810] text-sm font-bold">
                        Parties
                      </span>
                    </div>
                    <div className="w-[110px] px-2">
                      <span className="text-[#070810] text-sm font-bold">
                        Last updated
                      </span>
                    </div>
                    <div className="w-[110px] px-2">
                      <span className="text-[#070810] text-sm font-bold">
                        Next hearing
                      </span>
                    </div>
                    <div className="w-[110px] px-2 flex justify-center">
                      <span className="text-[#070810] text-sm font-bold">
                        Status
                      </span>
                    </div>
                    <div className="w-10 h-[35px]"></div>
                  </div>
                  {/* Rows */}
                  {caseManagement.map((caseItem, index) => (
                    <div 
                      key={index} 
                      className="flex items-center self-stretch py-3 gap-3"
                      style={{ 
                        borderBottom: index < caseManagement.length - 1 ? '0.40px solid #E5E8EC' : 'none',
                        opacity: caseItem.opacity
                      }}
                    >
                      <div className="w-[110px] px-2">
                        <span className="text-[#070810] text-sm font-normal">
                          {caseItem.caseNo}
                        </span>
                      </div>
                      <div className="w-[180px] px-2 flex-1">
                        <span className="text-[#070810] text-sm font-normal">
                          {caseItem.parties}
                        </span>
                      </div>
                      <div className="w-[110px] px-2">
                        <span className="text-[#070810] text-sm font-normal">
                          {caseItem.lastUpdated}
                        </span>
                      </div>
                      <div className="w-[110px] px-2">
                        <span className="text-[#070810] text-sm font-normal">
                          {caseItem.nextHearing}
                        </span>
                      </div>
                      <div className="w-[110px] px-2 flex justify-center">
                        <div 
                          className="px-2 py-1 rounded-lg"
                          style={{
                            background: caseItem.statusColor,
                            width: '70px'
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
                      <div className="w-10 px-2 flex items-center justify-center">
                        <MoreVertical className="w-4 h-4 text-[#050F1C] rotate-90" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Alerts */}
              <div className="flex flex-col gap-2" style={{ width: '358px' }}>
                <div className="flex justify-between items-center self-stretch">
                  <span className="text-[#050F1C] text-lg font-normal">
                    Alerts
                  </span>
                  <span className="text-[#022658] text-xs font-bold cursor-pointer hover:underline">
                    See all
                  </span>
                </div>
                <div 
                  className="flex flex-col self-stretch bg-white p-4 gap-10 rounded-3xl border border-solid border-[#D4E1EA]"
                  style={{ minHeight: '313px' }}
                >
                  <div className="flex flex-col items-start self-stretch gap-6">
                    {alerts.map((alert, index) => (
                      <div 
                        key={index} 
                        className={`flex items-start self-stretch gap-3 ${index === 0 ? 'pb-4 border-b border-[#D4E1EA]' : ''}`}
                      >
                        <div className="p-2 bg-[#F7F8FA] rounded-lg">
                          <span className="text-base">{alert.icon}</span>
                        </div>
                        <div className="flex flex-col items-start flex-1 gap-3">
                          <div className="flex flex-col items-start self-stretch gap-2">
                            <span className="text-[#050F1C] text-base font-medium">
                              {alert.title}
                            </span>
                            <span className="text-[#525866] text-sm font-normal">
                              {alert.message}
                            </span>
                          </div>
                          <span className="text-[#525866] text-xs font-normal">
                            {alert.time}
                          </span>
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
    </div>
  );
};

export default CourtRegistrarDashboardOverview;
