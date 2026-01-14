import React, { useState } from 'react';
import CaseDiaryDrawer from './CaseDiaryDrawer';

const CaseDiary = ({ caseData, person, onBack, userInfo }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('November 2025');
  const [selectedEvent, setSelectedEvent] = useState(null);

  // Sample case events for the calendar
  const caseEvents = [
    { date: 2, caseNo: 'CM/0245/2023', judge: 'Judge Nkrumah', time: '10:00am' },
    { date: 6, caseNo: 'CM/0245/2023', judge: 'Judge Nkrumah', time: '10:00am' },
    { date: 11, caseNo: 'CM/0245/2023', judge: 'Judge Nkrumah', time: '10:00am' },
    { date: 15, caseNo: 'CM/0245/2023', judge: 'Judge Nkrumah', time: '10:00am' },
    { date: 20, caseNo: 'CM/0245/2023', judge: 'Judge Nkrumah', time: '10:00am' },
    { date: 26, caseNo: 'CM/0245/2023', judge: 'Judge Nkrumah', time: '10:00am' }
  ];

  const daysOfWeek = ['Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
  
  // Generate calendar days for November 2025 (starts on Saturday)
  const calendarDays = [
    { date: 1, month: 'November', isCurrentMonth: true },
    { date: 2, month: 'November', isCurrentMonth: true },
    { date: 3, month: 'November', isCurrentMonth: true },
    { date: 4, month: 'November', isCurrentMonth: true },
    { date: 5, month: 'November', isCurrentMonth: true },
    { date: 6, month: 'November', isCurrentMonth: true },
    { date: 7, month: 'November', isCurrentMonth: true },
    { date: 8, month: 'November', isCurrentMonth: true },
    { date: 9, month: 'November', isCurrentMonth: true },
    { date: 10, month: 'November', isCurrentMonth: true },
    { date: 11, month: 'November', isCurrentMonth: true },
    { date: 12, month: 'November', isCurrentMonth: true },
    { date: 13, month: 'November', isCurrentMonth: true },
    { date: 14, month: 'November', isCurrentMonth: true },
    { date: 15, month: 'November', isCurrentMonth: true },
    { date: 16, month: 'November', isCurrentMonth: true },
    { date: 17, month: 'November', isCurrentMonth: true },
    { date: 18, month: 'November', isCurrentMonth: true },
    { date: 19, month: 'November', isCurrentMonth: true },
    { date: 20, month: 'November', isCurrentMonth: true },
    { date: 21, month: 'November', isCurrentMonth: true },
    { date: 22, month: 'November', isCurrentMonth: true },
    { date: 23, month: 'November', isCurrentMonth: true },
    { date: 24, month: 'November', isCurrentMonth: true },
    { date: 25, month: 'November', isCurrentMonth: true },
    { date: 26, month: 'November', isCurrentMonth: true },
    { date: 27, month: 'November', isCurrentMonth: true },
    { date: 28, month: 'November', isCurrentMonth: true },
    { date: 29, month: 'November', isCurrentMonth: true },
    { date: 30, month: 'November', isCurrentMonth: true },
    { date: 1, month: 'December', isCurrentMonth: false },
    { date: 2, month: 'December', isCurrentMonth: false },
    { date: 3, month: 'December', isCurrentMonth: false },
    { date: 4, month: 'December', isCurrentMonth: false }
  ];

  const getEventForDate = (date) => {
    return caseEvents.find(event => event.date === date);
  };

  return (
    <div className="bg-[#F7F8FA] min-h-screen relative">
      {/* Drawer */}
      {selectedEvent && (
        <CaseDiaryDrawer 
          event={selectedEvent} 
          onClose={() => setSelectedEvent(null)} 
        />
      )}

      {/* Full Width Header */}
      <div className="w-full bg-white py-3.5 px-6 mb-4">
        <div className="flex justify-between items-center">
          <div className="flex justify-between items-center w-[700px] pr-2 rounded-lg border border-solid border-[#D4E1EA] bg-white">
            <input
              type="text"
              placeholder="Search persons, companies and cases here"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 text-[#525866] bg-transparent text-xs py-3.5 pl-2 mr-1 border-0 outline-none"
            />
            <div className="flex items-center w-[73px] gap-1.5">
              <img src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Iq8V0MifpP/34063dx6_expires_30_days.png" className="w-[19px] h-[19px] object-fill" />
              <div className="flex items-center bg-white w-12 py-1 px-[9px] gap-1 rounded">
                <span className="text-[#525866] text-xs font-bold">All</span>
                <img src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Iq8V0MifpP/ow7s1w4c_expires_30_days.png" className="w-3 h-3 rounded object-fill" />
              </div>
            </div>
          </div>
          <div className="flex items-center w-[173px] py-[1px] gap-3">
            <img src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Iq8V0MifpP/7qbi3381_expires_30_days.png" className="w-9 h-9 object-fill" />
            <div className="flex items-center w-[125px] gap-1.5">
              <img src={userInfo?.avatar || "/images/image.png"} className="w-9 h-9 rounded-full object-cover" />
              <div className="flex flex-col items-start w-[83px] gap-1">
                <span className="text-[#040E1B] text-base font-bold">{userInfo?.name || 'Eric Kwaah'}</span>
                <div className="flex items-center gap-1">
                  <img src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Iq8V0MifpP/o27z1oxf_expires_30_days.png" className="w-2 h-2 object-fill" />
                  <span className="text-[#525866] text-xs">Online</span>
                </div>
              </div>
            </div>
          </div>
        </div>

      {/* Main Content */}
      <div className="px-6">
        <div className="flex flex-col bg-white pt-4 pb-[68px] px-3.5 gap-4 rounded-lg">
          <div className="flex flex-col items-start self-stretch gap-4">
            {/* Breadcrumb */}
            <div className="flex items-center gap-1 flex-wrap">
              <span className="text-[#525866] text-xs whitespace-nowrap">PERSONS</span>
              <img src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Iq8V0MifpP/gzf0ss78_expires_30_days.png" className="w-4 h-4 object-fill" />
              <span className="text-[#040E1B] text-xs whitespace-nowrap">{person?.industry?.name?.toUpperCase() || 'BANKING & FINANCE'}</span>
              <img src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Iq8V0MifpP/38uujzg1_expires_30_days.png" className="w-4 h-4 object-fill" />
              <span className="text-[#070810] text-sm whitespace-nowrap">{person?.name || 'John Kwame Louis'}</span>
              <img src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Iq8V0MifpP/htkz1gnf_expires_30_days.png" className="w-4 h-4 object-fill" />
              <span className="text-[#070810] text-sm whitespace-nowrap">JKL Ventures Ltd vs. Meridian Properties</span>
              <img src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Iq8V0MifpP/taap4vp9_expires_30_days.png" className="w-4 h-4 object-fill" />
              <span className="text-[#070810] text-sm whitespace-nowrap">Case Diary</span>
            </div>

            {/* Filter Controls */}
            <div className="flex justify-end items-center self-stretch">
              <span className="text-[#525866] text-xs mr-[25px] whitespace-nowrap">Show data for</span>
              <button className="flex items-start bg-[#F7F8FA] w-[261px] p-2 mr-6 gap-1 rounded-lg border border-solid border-[#D4E1EA]">
                <img src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Iq8V0MifpP/n44b5tnm_expires_30_days.png" className="w-4 h-4 rounded-lg object-fill" />
                <div className="flex items-start w-[225px] gap-[3px]">
                  <span className="text-[#070810] text-sm whitespace-nowrap">Last 30 days (as of 29 Oct., 2025)</span>
                  <img src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Iq8V0MifpP/vjv5y23a_expires_30_days.png" className="w-4 h-4 object-fill" />
                </div>
              </button>
              <button className="flex items-start bg-[#F7F8FA] text-left w-[73px] p-2 gap-[3px] rounded-lg border border-solid border-[#D4E1EA]">
                <span className="text-[#070810] text-sm">Status</span>
                <img src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Iq8V0MifpP/137pgegs_expires_30_days.png" className="w-4 h-4 rounded-lg object-fill" />
              </button>
            </div>

            {/* Back Button */}
            <button onClick={onBack} className="cursor-pointer hover:opacity-70">
              <img src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Iq8V0MifpP/60dpn1hv_expires_30_days.png" className="w-10 h-10 object-fill" />
            </button>
          </div>

          {/* Calendar */}
          <div className="flex flex-col self-stretch bg-white p-6 gap-[23px] rounded-[15px]" style={{boxShadow: '0px 0px 15px #00000026'}}>
            <div className="flex flex-col items-start pb-[1px]">
              <span className="text-[#040E1B]">{selectedMonth}</span>
            </div>

            <div className="flex flex-col self-stretch">
              {/* Calendar Header - Days of Week */}
              <div className="flex items-start self-stretch">
                <div className="bg-white w-[19px] h-[100px]"></div>
                {daysOfWeek.map((day) => (
                  <div key={day} className="flex flex-col items-center bg-white flex-1">
                    <span className="text-[#868C98] text-sm font-bold mt-2 mb-[74px]">{day}</span>
                  </div>
                ))}
              </div>

              {/* Calendar Weeks */}
              {[0, 1, 2, 3, 4].map((weekIdx) => (
                <div key={weekIdx} className="flex items-start self-stretch">
                  <div className="flex flex-col items-start bg-white w-[19px] px-1">
                    <span className="text-[#868C98] text-[9px] mt-2 mb-20">{weekIdx + 1}</span>
                  </div>
                  {calendarDays.slice(weekIdx * 7, (weekIdx + 1) * 7).map((day, dayIdx) => {
                    const event = day.isCurrentMonth ? getEventForDate(day.date) : null;
                    const isFirstDay = day.date === 1;
                    
                    return (
                      <div 
                        key={`${day.month}-${day.date}-${dayIdx}`}
                        className={`flex items-start bg-white flex-1 border border-solid border-[#D4E1EA] ${
                          event ? 'py-[9px] px-[1px] gap-[5px]' : isFirstDay ? 'pt-[19px] pb-[62px] px-2 gap-12' : 'justify-end pr-2'
                        }`}
                      >
                        {event && (
                          <button
                            onClick={() => setSelectedEvent(event)}
                            className="flex flex-col items-start bg-[#CEF9E2] w-[120px] py-2.5 pl-2 gap-1 rounded-lg border-l-4 border-emerald-600 cursor-pointer hover:bg-emerald-100 transition-colors"
                          >
                            <span className="text-emerald-500 text-sm font-bold">{event.caseNo}</span>
                            <span className="text-emerald-500 text-xs">{event.judge}</span>
                            <span className="text-emerald-500 text-xs">{event.time}</span>
                          </button>
                        )}
                        {isFirstDay && <span className={`${day.isCurrentMonth ? 'text-[#868C98]' : 'text-[#868C98]'} text-[15px]`}>{day.month}</span>}
                        <span className={`${day.isCurrentMonth ? 'text-[#040E1B]' : 'text-[#868C98]'} text-[15px] ${!event && !isFirstDay ? 'mt-2 mb-[73px]' : ''}`}>
                          {day.date}
                        </span>
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
    </div>
  );
};

export default CaseDiary;

