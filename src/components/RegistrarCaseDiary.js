import React, { useState, useRef, useEffect } from 'react';
import { ChevronRight, ChevronLeft, Calendar as CalendarIcon, Bell, ChevronDown } from 'lucide-react';
import RegistrarCaseDiaryDrawer from './RegistrarCaseDiaryDrawer';

const RegistrarCaseDiary = ({ caseData, onBack }) => {
  const [selectedPeriod, setSelectedPeriod] = useState('Last 7 days (as of 29 Oct., 2025)');
  const [selectedStatus, setSelectedStatus] = useState('Status');
  const [showPeriodDropdown, setShowPeriodDropdown] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showDrawer, setShowDrawer] = useState(false);
  const periodDropdownRef = useRef(null);
  const statusDropdownRef = useRef(null);

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
      caseNo: 'CM/1245/2023', 
      title: 'EcoWind Corp. vs. SafeDrive Insurance - Dispute over breach of lease agreement for commercial property',
      judge: 'Justice A. Mensah', 
      time: '10:00am',
      fileDate: 'Oct 3, 2025',
      fileTime: '9:30am',
      courtNote: 'Counsel for EcoWind Corp. opened with an update on settlement talks but confirmed that no agreement has been reached. SafeDrive Insurance responded by requesting additional time to review new documents submitted last week. The judge accepted the documents into the record and directed both parties to exchange any remaining disclosures before the next date. Counsel on both sides agreed to the timeline. No witnesses were called today.',
      outcome: 'The matter was adjourned for a compliance check on filings. A new date will be issued on the next cause list.',
      originalFileDate: 'October 10, 2023',
      notableMentions: [
        'Case adjourned on 26th October till 2nd of November, 2025.',
        'New witness presented in court in person of Mr. James Johnson.'
      ],
      judgement: 'Ongoing'
    },
    11: { 
      caseNo: 'CM/1245/2023', 
      title: 'EcoWind Corp. vs. SafeDrive Insurance - Dispute over breach of lease agreement for commercial property',
      judge: 'Justice A. Mensah', 
      time: '10:00am',
      fileDate: 'Oct 3, 2025',
      fileTime: '9:30am',
      courtNote: 'Counsel for EcoWind Corp. opened with an update on settlement talks but confirmed that no agreement has been reached.',
      outcome: 'The matter was adjourned for a compliance check on filings.',
      originalFileDate: 'October 10, 2023',
      notableMentions: ['Case adjourned on 26th October till 2nd of November, 2025.'],
      judgement: 'Ongoing'
    },
    15: { 
      caseNo: 'CM/1245/2023', 
      title: 'EcoWind Corp. vs. SafeDrive Insurance - Dispute over breach of lease agreement for commercial property',
      judge: 'Justice A. Mensah', 
      time: '10:00am',
      fileDate: 'Oct 3, 2025',
      fileTime: '9:30am',
      courtNote: 'Counsel for EcoWind Corp. opened with an update on settlement talks.',
      outcome: 'The matter was adjourned.',
      originalFileDate: 'October 10, 2023',
      notableMentions: [],
      judgement: 'Ongoing'
    },
    20: { 
      caseNo: 'CM/1245/2023', 
      title: 'EcoWind Corp. vs. SafeDrive Insurance - Dispute over breach of lease agreement for commercial property',
      judge: 'Justice A. Mensah', 
      time: '10:00am',
      fileDate: 'Oct 3, 2025',
      fileTime: '9:30am',
      courtNote: 'Counsel for EcoWind Corp. opened with an update.',
      outcome: 'The matter was adjourned.',
      originalFileDate: 'October 10, 2023',
      notableMentions: [],
      judgement: 'Ongoing'
    },
    26: { 
      caseNo: 'CM/1245/2023', 
      title: 'EcoWind Corp. vs. SafeDrive Insurance - Dispute over breach of lease agreement for commercial property',
      judge: 'Justice A. Mensah', 
      time: '10:00am',
      fileDate: 'Oct 3, 2025',
      fileTime: '9:30am',
      courtNote: 'Counsel for EcoWind Corp. opened with an update.',
      outcome: 'The matter was adjourned.',
      originalFileDate: 'October 10, 2023',
      notableMentions: [],
      judgement: 'Ongoing'
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

  const caseTitle = caseData?.title || 'JKL Ventures Ltd vs. Meridian Properties';

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
              <div className="w-12 px-1 py-1 bg-white rounded text-center">
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
                  src="/images/image.png" 
                  alt="User" 
                  className="w-9 h-9 rounded-full"
                  onError={(e) => { e.target.src = 'https://placehold.co/36x36'; }}
                />
                <div className="flex flex-col items-start gap-1">
                  <div className="flex items-center gap-0.5">
                    <span className="text-[#050F1C] text-base font-bold">Ben Frimpong</span>
                    <ChevronDown className="w-3 h-3 text-[#141B34]" />
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-[#10B981] rounded-full"></div>
                    <span className="text-[#525866] text-xs">Online</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 py-4">
        <div className="bg-white rounded-lg p-4 shadow-lg" style={{ boxShadow: '0px 0px 15.96px 2.99px rgba(0, 0, 0, 0.15)' }}>
          {/* Breadcrumb and Filters */}
          <div className="flex flex-col gap-4 mb-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-1">
                <span className="text-[#525866] text-xs opacity-75">CASE PROFILE</span>
                <ChevronRight className="w-4 h-4 text-[#7B8794] rotate-90" />
                <span className="text-[#070810] text-sm">{caseTitle}</span>
                <ChevronRight className="w-4 h-4 text-[#7B8794] rotate-90" />
                <span className="text-[#070810] text-sm">View case diary</span>
              </div>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-6">
                  <span className="text-[#525866] text-xs opacity-75">Show data for</span>
                  <div className="relative" ref={periodDropdownRef}>
                    <button
                      onClick={() => {
                        setShowPeriodDropdown(!showPeriodDropdown);
                        setShowStatusDropdown(false);
                      }}
                      className="px-2 py-2 bg-[#F7F8FA] rounded-lg border border-[#D4E1EA] flex items-center gap-1"
                    >
                      <CalendarIcon className="w-4 h-4 text-[#7B8794]" />
                      <span className="text-[#070810] text-sm">{selectedPeriod}</span>
                      <ChevronDown className="w-4 h-4 text-[#525866]" />
                    </button>
                    {showPeriodDropdown && (
                      <div className="absolute right-0 mt-1 bg-white border border-[#D4E1EA] rounded-lg shadow-lg z-10 min-w-[200px]">
                        <div 
                          onClick={() => {
                            setSelectedPeriod('Last 7 days (as of 29 Oct., 2025)');
                            setShowPeriodDropdown(false);
                          }}
                          className="px-3 py-2 text-xs text-[#525866] hover:bg-gray-50 cursor-pointer"
                        >
                          Last 7 days (as of 29 Oct., 2025)
                        </div>
                        <div 
                          onClick={() => {
                            setSelectedPeriod('Last 30 days');
                            setShowPeriodDropdown(false);
                          }}
                          className="px-3 py-2 text-xs text-[#525866] hover:bg-gray-50 cursor-pointer"
                        >
                          Last 30 days
                        </div>
                        <div 
                          onClick={() => {
                            setSelectedPeriod('Last 90 days');
                            setShowPeriodDropdown(false);
                          }}
                          className="px-3 py-2 text-xs text-[#525866] hover:bg-gray-50 cursor-pointer"
                        >
                          Last 90 days
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="relative" ref={statusDropdownRef}>
                    <button
                      onClick={() => {
                        setShowStatusDropdown(!showStatusDropdown);
                        setShowPeriodDropdown(false);
                      }}
                      className="px-2 py-2 bg-[#F7F8FA] rounded-lg border border-[#D4E1EA] flex items-center gap-1"
                    >
                      <span className="text-[#070810] text-sm">{selectedStatus}</span>
                      <ChevronDown className="w-4 h-4 text-[#525866]" />
                    </button>
                    {showStatusDropdown && (
                      <div className="absolute right-0 mt-1 bg-white border border-[#D4E1EA] rounded-lg shadow-lg z-10 min-w-[150px]">
                        <div 
                          onClick={() => {
                            setSelectedStatus('All');
                            setShowStatusDropdown(false);
                          }}
                          className="px-3 py-2 text-xs text-[#525866] hover:bg-gray-50 cursor-pointer"
                        >
                          All
                        </div>
                        <div 
                          onClick={() => {
                            setSelectedStatus('Active');
                            setShowStatusDropdown(false);
                          }}
                          className="px-3 py-2 text-xs text-[#525866] hover:bg-gray-50 cursor-pointer"
                        >
                          Active
                        </div>
                        <div 
                          onClick={() => {
                            setSelectedStatus('Closed');
                            setShowStatusDropdown(false);
                          }}
                          className="px-3 py-2 text-xs text-[#525866] hover:bg-gray-50 cursor-pointer"
                        >
                          Closed
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Back Button */}
            <button
              onClick={onBack}
              className="w-fit p-2 bg-[#F7F8FA] rounded-lg cursor-pointer hover:opacity-70"
            >
              <ChevronRight className="w-6 h-6 text-[#050F1C] rotate-180" />
            </button>
          </div>

          {/* Calendar */}
          <div className="flex flex-col gap-4">
            {/* Month Header */}
            <div className="flex flex-col gap-4">
              <div>
                <span className="text-[#050F1C] text-xl font-bold">November</span>
                <span className="text-[#050F1C] text-[32px] font-medium"> </span>
                <span className="text-[#050F1C] text-xl font-normal">2025</span>
              </div>
            </div>

            {/* Calendar Grid */}
            <div className="relative">
              {/* Weekday Headers */}
              <div className="flex items-start">
                <div className="w-5 py-4 px-2 bg-white border-r border-b border-[#D4E1EA]"></div>
                {daysOfWeek.map((day) => (
                  <div
                    key={day}
                    className="flex-1 min-w-[148px] py-2 px-2 bg-white border-l border-r border-b border-[#D4E1EA]"
                  >
                    <div className="text-center text-[#868C98] text-sm font-bold">{day}</div>
                  </div>
                ))}
              </div>

              {/* Calendar Weeks */}
              {calendarWeeks.map((week, weekIdx) => (
                <div key={weekIdx} className="flex items-start">
                  {/* Week Number */}
                  <div className="w-5 py-2 px-2 bg-white border-t border-r border-b border-[#D4E1EA]">
                    <span className="text-[#868C98] text-[10px] text-right block">{weekIdx + 1}</span>
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
                              <span className={`text-[16px] ${isCurrentMonth ? 'text-[#050F1C]' : 'text-[#868C98]'}`}>
                                {day.date}
                              </span>
                            </div>
                          </>
                        ) : isFirstDay ? (
                          <div className="flex justify-between items-start">
                            <span className="text-[#868C98] text-[16px]">{day.month || 'November'}</span>
                            <span className={`text-[16px] ${isCurrentMonth ? 'text-[#050F1C]' : 'text-[#868C98]'}`}>
                              {day.date}
                            </span>
                          </div>
                        ) : (
                          <>
                            {day.date && (
                              <>
                                <div className="flex justify-end">
                                  <span className={`text-[16px] ${isCurrentMonth ? 'text-[#050F1C]' : 'text-[#868C98]'}`}>
                                    {day.date}
                                  </span>
                                </div>
                                {isCurrentMonth && !event && (
                                  <div className="absolute left-[40px] top-[40px]">
                                    <span className="text-[#B1B9C6] text-sm font-bold">Add Event</span>
                                  </div>
                                )}
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

      {/* Case Diary Drawer */}
      {showDrawer && selectedEvent && (
        <RegistrarCaseDiaryDrawer
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

export default RegistrarCaseDiary;

