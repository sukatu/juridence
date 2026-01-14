import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, ChevronRight, ChevronDown, Calendar } from 'lucide-react';
import CorporateClientCaseDiaryDrawer from './CorporateClientCaseDiaryDrawer';

const CorporateClientCaseDiary = ({ caseData, person, company, industry, entity, onBack, userInfo }) => {
  const [selectedPeriod, setSelectedPeriod] = useState('Last 7 days (as of 29 Oct., 2025)');
  const [selectedStatus, setSelectedStatus] = useState('Status');
  const [showPeriodDropdown, setShowPeriodDropdown] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showDrawer, setShowDrawer] = useState(false);
  const periodDropdownRef = useRef(null);
  const statusDropdownRef = useRef(null);

  const userName = userInfo?.first_name && userInfo?.last_name 
    ? `${userInfo.first_name} ${userInfo.last_name}` 
    : 'Tonia Martins';
  const organizationName = userInfo?.organization || 'Access Bank';

  // Handle click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (periodDropdownRef.current && !periodDropdownRef.current.contains(event.target)) {
        setShowPeriodDropdown(false);
      }
      if (statusDropdownRef.current && !statusDropdownRef.current.contains(event.target)) {
        setShowStatusDropdown(false);
      }
    };

    if (showPeriodDropdown || showStatusDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showPeriodDropdown, showStatusDropdown]);

  // Sample case events for November 2025
  const caseEvents = {
    6: { 
      caseNo: 'CM/0245/2023', 
      judge: 'Judge Nkrumah', 
      time: '10:00am'
    },
    11: { 
      caseNo: 'CM/0245/2023', 
      judge: 'Judge Nkrumah', 
      time: '10:00am'
    },
    15: { 
      caseNo: 'CM/0245/2023', 
      judge: 'Judge Nkrumah', 
      time: '10:00am'
    },
    20: { 
      caseNo: 'CM/0245/2023', 
      judge: 'Judge Nkrumah', 
      time: '10:00am'
    },
    26: { 
      caseNo: 'CM/0245/2023', 
      judge: 'Judge Nkrumah', 
      time: '10:00am'
    }
  };

  const daysOfWeek = ['Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
  
  // Generate calendar weeks for November 2025 (starts on Saturday, Nov 1)
  const generateCalendarWeeks = () => {
    const weeks = [];
    const daysInMonth = 30;
    const startDay = 6; // Saturday (0 = Sunday, 6 = Saturday)
    
    let currentDate = 1;
    
    // First week - November starts on Saturday, so no days before
    let week = [];
    while (week.length < 7 && currentDate <= daysInMonth) {
      week.push({ 
        date: currentDate, 
        isCurrentMonth: true, 
        isFirstDay: currentDate === 1,
        month: currentDate === 1 ? 'November' : null
      });
      currentDate++;
    }
    weeks.push(week);
    
    // Remaining weeks
    while (currentDate <= daysInMonth) {
      week = [];
      while (week.length < 7 && currentDate <= daysInMonth) {
        week.push({ 
          date: currentDate, 
          isCurrentMonth: true, 
          isFirstDay: false,
          month: null
        });
        currentDate++;
      }
      // Fill remaining days with December dates if needed
      let decDate = 1;
      while (week.length < 7) {
        week.push({ 
          date: decDate, 
          isCurrentMonth: false, 
          isFirstDay: decDate === 1,
          month: decDate === 1 ? 'December' : null
        });
        decDate++;
      }
      weeks.push(week);
    }
    
    return weeks;
  };

  const calendarWeeks = generateCalendarWeeks();

  const getEventForDate = (date) => {
    return caseEvents[date] || null;
  };

  const personName = person?.name || 'John Kwame Louis';
  const companyName = company || 'EcoWind Corp.';
  const entityName = entity?.name || 'Access Bank';
  const industryName = industry?.name || (typeof industry === 'string' ? industry : 'BANKING & FINANCE');
  const isCompany = !!company;
  const caseTitle = caseData?.title?.split(' - ')[0] || 'JKL Ventures Ltd vs. Meridian Properties';

  return (
    <div className="flex-1 bg-[#F7F8FA] pr-6 rounded-lg">
      <div className="flex items-start gap-6">
        {/* Main Content */}
        <div className="flex-1 flex flex-col bg-[#F7F8FA] pt-2 pb-[52px] gap-4">
          {/* Header */}
          <div className="flex items-center self-stretch py-2 px-1.5 gap-[50px] rounded border-b border-[#D4E1EA]">
            <div className="flex flex-col items-start gap-1">
              <span className="text-[#050F1C] text-xl font-medium">{organizationName},</span>
              <span className="text-[#050F1C] text-base font-normal opacity-75">Track all your activities here.</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-[600px] h-11 px-2 py-2.5 rounded-lg border border-[#D4E1EA] flex items-center justify-between">
                <span className="text-[#525866] text-xs font-normal">Search companies and persons here</span>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 relative">
                    <div className="w-1.75 h-1.75 left-[2.5px] top-[2.5px] absolute border border-[#868C98]"></div>
                  </div>
                  <span className="text-[#868C98] text-sm font-normal">|</span>
                  <div className="w-12 px-1 py-1 bg-white rounded flex items-center justify-end gap-0.5">
                    <span className="text-[#525866] text-xs font-bold">All</span>
                    <div className="w-3 h-3 relative">
                      <div className="w-1.5 h-0.75 left-[3px] top-[4.5px] absolute border border-[#141B34]"></div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#F7F8FA] rounded-full border border-[#D4E1EA]">
                  <Calendar className="w-5 h-5 text-[#022658]" />
                </div>
                <div className="flex items-center gap-1.5">
                  <img 
                    src="https://placehold.co/36x36" 
                    alt="Avatar" 
                    className="w-9 h-9 rounded-full"
                  />
                  <div className="flex flex-col items-start gap-1">
                    <div className="flex items-center gap-0.5">
                      <span className="text-[#050F1C] text-base font-bold">{userName}</span>
                      <ChevronDown className="w-3 h-3 text-[#141B34]" />
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-[#10B981] rounded-full"></div>
                      <span className="text-[#525866] text-xs font-normal">Online</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 p-4 bg-white rounded-lg flex flex-col gap-10">
            {/* Breadcrumb and Filters */}
            <div className="flex flex-col gap-4">
              {/* Breadcrumb */}
              <div className="flex items-center gap-1">
                <div className="flex items-center gap-1">
                  <span className="text-[#525866] text-xs font-normal opacity-75">{isCompany ? 'COMPANIES' : 'PERSONS'}</span>
                  <ChevronRight className="w-4 h-4 text-[#7B8794]" />
                  <span className="text-[#050F1C] text-xs font-normal">{industryName}</span>
                </div>
                {!isCompany && (
                  <>
                    <ChevronRight className="w-4 h-4 text-[#7B8794]" />
                    <span className="text-[#070810] text-sm font-normal">{entityName}</span>
                  </>
                )}
                <ChevronRight className="w-4 h-4 text-[#7B8794]" />
                <span className="text-[#070810] text-sm font-normal">{isCompany ? companyName : personName}</span>
                <ChevronRight className="w-4 h-4 text-[#7B8794]" />
                <span className="text-[#070810] text-sm font-normal whitespace-nowrap">{caseTitle}</span>
                <ChevronRight className="w-4 h-4 text-[#7B8794]" />
                <span className="text-[#070810] text-sm font-normal">Case Diary</span>
              </div>

              {/* Filters and Back Button */}
              <div className="flex justify-end items-center gap-6">
                <span className="text-[#525866] text-xs font-normal opacity-75">Show data for</span>
                <div className="relative" ref={periodDropdownRef}>
                  <button
                    onClick={() => setShowPeriodDropdown(!showPeriodDropdown)}
                    className="px-2 py-2 bg-[#F7F8FA] rounded-lg border border-[#D4E1EA] flex items-center gap-1"
                  >
                    <Calendar className="w-4 h-4 text-[#7B8794]" />
                    <span className="text-[#070810] text-sm font-normal">{selectedPeriod}</span>
                    <ChevronDown className="w-4 h-4 text-[#525866]" />
                  </button>
                  {showPeriodDropdown && (
                    <div className="absolute top-full mt-1 bg-white border border-[#D4E1EA] rounded-lg shadow-lg z-10 min-w-[200px]">
                      <button
                        onClick={() => {
                          setSelectedPeriod('Last 7 days (as of 29 Oct., 2025)');
                          setShowPeriodDropdown(false);
                        }}
                        className="w-full px-4 py-2 text-left text-sm hover:bg-[#F7F8FA]"
                      >
                        Last 7 days (as of 29 Oct., 2025)
                      </button>
                      <button
                        onClick={() => {
                          setSelectedPeriod('Last 30 days');
                          setShowPeriodDropdown(false);
                        }}
                        className="w-full px-4 py-2 text-left text-sm hover:bg-[#F7F8FA]"
                      >
                        Last 30 days
                      </button>
                    </div>
                  )}
                </div>
                <div className="relative" ref={statusDropdownRef}>
                  <button
                    onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                    className="px-2 py-2 bg-[#F7F8FA] rounded-lg border border-[#D4E1EA] flex items-center gap-1"
                  >
                    <span className="text-[#070810] text-sm font-normal">{selectedStatus}</span>
                    <ChevronDown className="w-4 h-4 text-[#525866]" />
                  </button>
                  {showStatusDropdown && (
                    <div className="absolute top-full mt-1 bg-white border border-[#D4E1EA] rounded-lg shadow-lg z-10 min-w-[150px]">
                      <button
                        onClick={() => {
                          setSelectedStatus('All');
                          setShowStatusDropdown(false);
                        }}
                        className="w-full px-4 py-2 text-left text-sm hover:bg-[#F7F8FA]"
                      >
                        All
                      </button>
                      <button
                        onClick={() => {
                          setSelectedStatus('Active');
                          setShowStatusDropdown(false);
                        }}
                        className="w-full px-4 py-2 text-left text-sm hover:bg-[#F7F8FA]"
                      >
                        Active
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Back Button */}
              <div className="flex justify-start">
                <button 
                  onClick={onBack}
                  className="p-2 bg-[#F7F8FA] rounded-lg flex items-center justify-center"
                >
                  <ArrowLeft className="w-6 h-6 text-[#050F1C]" />
                </button>
              </div>
            </div>

            {/* Calendar */}
            <div className="p-6 bg-white rounded-2xl shadow-lg flex flex-col gap-6"
              style={{ boxShadow: '0px 0px 15.96px 2.99px rgba(0, 0, 0, 0.15)' }}
            >
              {/* Month Header */}
              <div className="flex flex-col gap-4">
                <div>
                  <span className="text-[#050F1C] text-xl font-bold">November</span>
                  <span className="text-[#050F1C] text-[32px] font-medium leading-[35px]"> </span>
                  <span className="text-[#050F1C] text-xl font-normal">2025</span>
                </div>
              </div>

              {/* Calendar Grid */}
              <div className="flex flex-col">
                {/* Week Header */}
                <div className="flex items-start">
                  <div className="w-[20px] p-2 bg-white border-r border-b border-[#D4E1EA]"></div>
                  {daysOfWeek.map((day, idx) => (
                    <div
                      key={idx}
                      className="flex-1 min-w-[148px] p-2 bg-white border-l border-r border-b border-[#D4E1EA] min-h-[100px] flex items-end justify-center"
                    >
                      <span className="text-[#868C98] text-sm font-bold">{day}</span>
                    </div>
                  ))}
                </div>

                {/* Calendar Weeks */}
                {calendarWeeks.map((week, weekIdx) => (
                  <div key={weekIdx} className="flex items-start">
                    {/* Week Number */}
                    <div className="w-[20px] p-2 bg-white border-t border-r border-b border-[#D4E1EA] flex flex-col items-end">
                      <span className="text-[#868C98] text-[10px] font-normal">{weekIdx + 1}</span>
                    </div>

                    {/* Week Days */}
                    {week.map((day, dayIdx) => {
                      const event = day.date && day.isCurrentMonth ? getEventForDate(day.date) : null;
                      const isFirstDay = day.isFirstDay;
                      const isCurrentMonth = day.isCurrentMonth;

                      return (
                        <div
                          key={`${weekIdx}-${dayIdx}`}
                          className={`flex-1 min-w-[148px] relative bg-white border-l border-r border-b border-[#D4E1EA] min-h-[100px] ${
                            event ? 'p-2' : isFirstDay ? 'pt-[19px] pb-[63px] px-2' : 'p-2'
                          }`}
                        >
                          {event ? (
                            <>
                              <button
                                onClick={() => {
                                  setSelectedEvent(event);
                                  setShowDrawer(true);
                                }}
                                className="absolute left-0 top-[10px] w-[120px] h-[80px] p-2 bg-[#CFFAE2] rounded-lg border-l-4 border-[#10B981] flex flex-col gap-1 cursor-pointer hover:bg-[#B8F5D4] transition-colors"
                              >
                                <span className="text-[#10B981] text-sm font-bold">{event.caseNo}</span>
                                <span className="text-[#10B981] text-xs font-medium">{event.judge}</span>
                                <span className="text-[#10B981] text-xs">{event.time}</span>
                              </button>
                              <div className="flex justify-end">
                                <span className={`text-base ${isCurrentMonth ? 'text-[#050F1C]' : 'text-[#868C98]'}`}>
                                  {day.date}
                                </span>
                              </div>
                            </>
                          ) : isFirstDay ? (
                            <div className="flex justify-between items-start">
                              <span className="text-[#868C98] text-base">{day.month || 'November'}</span>
                              <span className={`text-base ${isCurrentMonth ? 'text-[#050F1C]' : 'text-[#868C98]'}`}>
                                {day.date}
                              </span>
                            </div>
                          ) : (
                            <>
                              {day.date && (
                                <>
                                  <div className="flex justify-end">
                                    <span className={`text-base ${isCurrentMonth ? 'text-[#050F1C]' : 'text-[#868C98]'}`}>
                                      {day.date}
                                    </span>
                                  </div>
                                </>
                              )}
                            </>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Case Diary Drawer */}
      {showDrawer && selectedEvent && (
        <CorporateClientCaseDiaryDrawer
          event={selectedEvent}
          caseData={caseData}
          onClose={() => {
            setShowDrawer(false);
            setSelectedEvent(null);
          }}
        />
      )}
    </div>
  );
};

export default CorporateClientCaseDiary;

