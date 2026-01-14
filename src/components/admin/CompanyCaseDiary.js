import React, { useState } from 'react';
import CaseDiaryDetailsDrawer from './CaseDiaryDetailsDrawer';

const CompanyCaseDiary = ({ caseData, onBack, userInfo }) => {
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showDrawer, setShowDrawer] = useState(false);
  // Sample calendar events
  const eventsData = {
    2: { caseNo: 'CM/0245/2023', judge: 'Judge Nkrumah', time: '10:00am' },
    6: { caseNo: 'CM/0245/2023', judge: 'Judge Nkrumah', time: '10:00am' },
    11: { caseNo: 'CM/0245/2023', judge: 'Judge Nkrumah', time: '10:00am' },
    15: { caseNo: 'CM/0245/2023', judge: 'Judge Nkrumah', time: '10:00am' },
    20: { caseNo: 'CM/0245/2023', judge: 'Judge Nkrumah', time: '10:00am' },
    26: { caseNo: 'CM/0245/2023', judge: 'Judge Nkrumah', time: '10:00am' }
  };

  // Generate calendar data for November 2025
  const calendarData = [
    // Week 1
    [
      { date: 1, month: 'November', isCurrentMonth: true, isFirstDay: true },
      { date: 2, isCurrentMonth: true },
      { date: 3, isCurrentMonth: true },
      { date: 4, isCurrentMonth: true },
      { date: 5, isCurrentMonth: true },
      { date: 6, isCurrentMonth: true },
      { date: 7, isCurrentMonth: true }
    ],
    // Week 2
    [
      { date: 8, isCurrentMonth: true },
      { date: 9, isCurrentMonth: true },
      { date: 10, isCurrentMonth: true },
      { date: 11, isCurrentMonth: true },
      { date: 12, isCurrentMonth: true },
      { date: 13, isCurrentMonth: true },
      { date: 14, isCurrentMonth: true }
    ],
    // Week 3
    [
      { date: 15, isCurrentMonth: true },
      { date: 16, isCurrentMonth: true },
      { date: 17, isCurrentMonth: true },
      { date: 18, isCurrentMonth: true },
      { date: 19, isCurrentMonth: true },
      { date: 20, isCurrentMonth: true },
      { date: 21, isCurrentMonth: true }
    ],
    // Week 4
    [
      { date: 22, isCurrentMonth: true },
      { date: 23, isCurrentMonth: true },
      { date: 24, isCurrentMonth: true },
      { date: 25, isCurrentMonth: true },
      { date: 26, isCurrentMonth: true },
      { date: 27, isCurrentMonth: true },
      { date: 28, isCurrentMonth: true }
    ],
    // Week 5
    [
      { date: 29, isCurrentMonth: true },
      { date: 30, isCurrentMonth: true },
      { date: 1, month: 'December', isCurrentMonth: false, isFirstDay: true },
      { date: 2, isCurrentMonth: false },
      { date: 2, isCurrentMonth: false },
      { date: 3, isCurrentMonth: false },
      { date: 4, isCurrentMonth: false }
    ]
  ];

  return (
    <div className="bg-[#F7F8FA] min-h-screen py-1">
      <div className="flex flex-col self-stretch gap-4">
        {/* Header */}
        <div className="flex justify-between items-start self-stretch py-3.5 px-1.5 rounded">
          <div className="flex justify-between items-center w-[700px] pr-2 rounded-lg border border-solid border-[#D4E1EA]">
            <input
              type="text"
              placeholder="Search persons, companies and cases here"
              className="flex-1 self-stretch text-[#525866] bg-transparent text-xs py-3.5 pl-2 mr-1 border-0 outline-none"
            />
            <div className="flex items-center w-[73px] gap-1.5">
              <img
                src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Iq8V0MifpP/3yk3e2i2_expires_30_days.png"
                className="w-[19px] h-[19px] object-fill"
              />
              <div className="flex items-center bg-white w-12 py-1 px-[9px] gap-1 rounded">
                <span className="text-[#525866] text-xs font-bold">All</span>
                <img
                  src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Iq8V0MifpP/k8b2y8ni_expires_30_days.png"
                  className="w-3 h-3 rounded object-fill"
                />
              </div>
            </div>
          </div>
          <div className="flex items-center w-[173px] py-[1px] gap-3">
            <img
              src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Iq8V0MifpP/vyijkt9p_expires_30_days.png"
              className="w-9 h-9 object-fill"
            />
            <div className="flex items-center w-[125px] gap-1.5">
              <img src="/images/image.png" className="w-9 h-9 object-fill rounded-full" alt="User" />
              <div className="flex flex-col items-start w-[83px] gap-1">
                <span className="text-[#040E1B] text-base font-bold">Eric Kwaah</span>
                <div className="flex items-center self-stretch mr-9 gap-1">
                  <img
                    src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Iq8V0MifpP/aw3ut9bg_expires_30_days.png"
                    className="w-2 h-2 object-fill"
                  />
                  <span className="text-[#525866] text-xs">Online</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex flex-col self-stretch bg-white pt-4 pb-[68px] px-3.5 gap-4 rounded-lg">
          <div className="flex flex-col items-start self-stretch gap-4">
            {/* Breadcrumb */}
            <div className="flex items-start self-stretch flex-wrap">
              <span className="text-[#525866] text-xs mr-1.5 whitespace-nowrap">COMPANIES</span>
              <img
                src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Iq8V0MifpP/xdig1zp4_expires_30_days.png"
                className="w-4 h-4 mr-1 object-fill flex-shrink-0"
              />
              <span className="text-[#525866] text-xs mr-1.5 whitespace-nowrap">ENERGY</span>
              <img
                src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Iq8V0MifpP/bundgu3a_expires_30_days.png"
                className="w-4 h-4 mr-1 object-fill flex-shrink-0"
              />
              <span className="text-[#070810] text-sm mr-[7px] whitespace-nowrap">EcoWind Corp.</span>
              <img
                src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Iq8V0MifpP/od1wq6p4_expires_30_days.png"
                className="w-4 h-4 mr-1 object-fill flex-shrink-0"
              />
              <span className="text-[#070810] text-sm mr-[7px] whitespace-nowrap">
                EcoWind Corp. vs. Meridian Properties
              </span>
              <img
                src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Iq8V0MifpP/mi8q8ou4_expires_30_days.png"
                className="w-4 h-4 mr-1 object-fill flex-shrink-0"
              />
              <span className="text-[#070810] text-sm whitespace-nowrap">Case Diary</span>
            </div>

            {/* Filter Controls */}
            <div className="flex justify-end items-center self-stretch">
              <span className="text-[#525866] text-xs mr-[25px]">Show data for</span>
              <div className="flex items-start bg-[#F7F8FA] w-[254px] p-2 mr-6 gap-1 rounded-lg border border-solid border-[#D4E1EA]">
                <img
                  src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Iq8V0MifpP/sfaxcy1w_expires_30_days.png"
                  className="w-4 h-4 rounded-lg object-fill"
                />
                <div className="flex items-start w-[218px] gap-1">
                  <span className="text-[#070810] text-sm">Last 7 days (as of 29 Oct., 2025)</span>
                  <img
                    src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Iq8V0MifpP/no7ptsgp_expires_30_days.png"
                    className="w-4 h-4 object-fill"
                  />
                </div>
              </div>
              <button className="flex items-start bg-[#F7F8FA] text-left w-[73px] p-2 gap-[3px] rounded-lg border border-solid border-[#D4E1EA] hover:bg-gray-100 transition-colors">
                <span className="text-[#070810] text-sm">Status</span>
                <img
                  src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Iq8V0MifpP/3lvj3mwd_expires_30_days.png"
                  className="w-4 h-4 rounded-lg object-fill"
                />
              </button>
            </div>

            {/* Back Button */}
            <button onClick={onBack} className="cursor-pointer hover:opacity-70">
              <img
                src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Iq8V0MifpP/18815vw7_expires_30_days.png"
                className="w-10 h-10 object-fill"
              />
            </button>
          </div>

          {/* Calendar */}
          <div
            className="flex flex-col self-stretch bg-white p-6 gap-[23px] rounded-[15px]"
            style={{ boxShadow: '0px 0px 15px #00000026' }}
          >
            <div className="flex flex-col items-start self-stretch pb-[1px]">
              <span className="text-[#040E1B]">November 2025</span>
            </div>

            <div className="self-stretch">
              {/* Days of Week Header */}
              <div className="flex items-start self-stretch">
                <div className="bg-white w-[19px] h-[100px]"></div>
                <div className="flex flex-col items-start bg-white w-[148px] px-[65px] mr-[1px]">
                  <span className="text-[#868C98] text-sm font-bold mt-2 mb-[74px]">Sat</span>
                </div>
                <div className="flex flex-col items-start bg-white w-[148px] px-[62px]">
                  <span className="text-[#868C98] text-sm font-bold mt-2 mb-[74px]">Sun</span>
                </div>
                <div className="flex flex-col items-start bg-white w-[148px] px-[61px]">
                  <span className="text-[#868C98] text-sm font-bold mt-2 mb-[74px]">Mon</span>
                </div>
                <div className="flex flex-col items-start bg-white w-[148px] px-[63px] mr-[1px]">
                  <span className="text-[#868C98] text-sm font-bold mt-2 mb-[74px]">Tue</span>
                </div>
                <div className="flex flex-col items-start bg-white w-[148px] px-[59px]">
                  <span className="text-[#868C98] text-sm font-bold mt-2 mb-[74px]">Wed</span>
                </div>
                <div className="flex flex-col items-start bg-white w-[148px] px-[62px]">
                  <span className="text-[#868C98] text-sm font-bold mt-2 mb-[74px]">Thu</span>
                </div>
                <div className="flex flex-col items-start bg-white w-[148px] px-[67px] mr-[17px]">
                  <span className="text-[#868C98] text-sm font-bold mt-2 mb-[74px]">Fri</span>
                </div>
              </div>

              {/* Calendar Weeks */}
              {calendarData.map((week, weekIdx) => (
                <div key={weekIdx} className="flex items-start self-stretch">
                  {/* Week Number */}
                  <div className="flex flex-col items-start bg-white w-[19px] px-1">
                    <span className="text-[#868C98] text-[9px] mt-2 mb-20">{weekIdx + 1}</span>
                  </div>

                  {/* Days in Week */}
                  {week.map((day, dayIdx) => {
                    const hasEvent = day.isCurrentMonth && eventsData[day.date];
                    const isFirstDay = day.isFirstDay;

                    return (
                      <div
                        key={`${weekIdx}-${dayIdx}`}
                        className={`flex items-start bg-white w-[148px] border border-solid border-[#D4E1EA] ${
                          dayIdx === 0 ? 'mr-[1px]' : ''
                        } ${dayIdx === 3 ? 'mr-[1px]' : ''} ${dayIdx === 6 ? 'mr-[17px]' : ''} ${
                          hasEvent ? 'py-[9px] px-[1px] gap-[5px]' : isFirstDay ? 'pt-[19px] pb-[62px] px-2 gap-12' : ''
                        }`}
                      >
                        {hasEvent ? (
                          <>
                            <div 
                              onClick={() => {
                                setSelectedEvent(hasEvent);
                                setShowDrawer(true);
                              }}
                              className="flex flex-col items-start bg-[#CEF9E2] w-[120px] py-2.5 pl-2 gap-1 rounded-lg border-l-4 border-emerald-600 cursor-pointer hover:bg-emerald-100 transition-colors"
                            >
                              <span className="text-emerald-500 text-sm font-bold mr-2">{hasEvent.caseNo}</span>
                              <span className="text-emerald-500 text-xs mr-[25px]">{hasEvent.judge}</span>
                              <span className="text-emerald-500 text-xs mr-16">{hasEvent.time}</span>
                            </div>
                            <span
                              className={`text-[15px] ${day.isCurrentMonth ? 'text-[#040E1B]' : 'text-[#868C98]'}`}
                            >
                              {day.date}
                            </span>
                          </>
                        ) : isFirstDay ? (
                          <>
                            <span className="text-[#868C98] text-[15px]">{day.month}</span>
                            <span
                              className={`text-[15px] ${day.isCurrentMonth ? 'text-[#040E1B]' : 'text-[#868C98]'}`}
                            >
                              {day.date}
                            </span>
                          </>
                        ) : (
                          <div
                            className={`flex flex-col items-start ${
                              day.isCurrentMonth ? 'pl-[130px]' : 'pl-[131px]'
                            }`}
                          >
                            <span
                              className={`text-[15px] mt-2 mb-[73px] ${
                                day.isCurrentMonth ? 'text-[#040E1B]' : 'text-[#868C98]'
                              }`}
                            >
                              {day.date}
                            </span>
                          </div>
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

      {/* Case Diary Details Drawer */}
      {showDrawer && selectedEvent && (
        <CaseDiaryDetailsDrawer
          event={selectedEvent}
          onClose={() => {
            setShowDrawer(false);
            setSelectedEvent(null);
          }}
        />
      )}
    </div>
  );
};

export default CompanyCaseDiary;

