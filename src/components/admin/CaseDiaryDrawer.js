import React from 'react';
import { X } from 'lucide-react';

const CaseDiaryDrawer = ({ event, onClose }) => {
  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-30 z-40"
        onClick={onClose}
      ></div>
      
      {/* Drawer */}
      <div className="fixed top-0 right-0 h-full w-[450px] bg-white py-5 px-10 rounded-l-lg shadow-lg z-50 overflow-y-auto" style={{boxShadow: '-5px 8px 4px #0708101A'}}>
        <div className="flex flex-col items-start gap-4">
          {/* Close Button */}
          <button onClick={onClose} className="cursor-pointer hover:opacity-70">
            <img
              src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Iq8V0MifpP/42kekw6e_expires_30_days.png"
              className="w-6 h-6 object-fill"
              alt="Close"
            />
          </button>

          <div className="flex flex-col self-stretch gap-6">
            <div className="flex flex-col items-start self-stretch gap-6">
              <span className="text-[#525866] text-xs">CASE DIARY</span>
              <div className="flex flex-col items-start self-stretch pr-12 gap-1">
                <span className="text-[#040E1B] text-lg">{event?.caseNo || 'CM/0245/2023'}</span>
                <span className="text-[#040E1B] text-sm">
                  EcoWind Corp. vs. SafeDrive Insurance - Dispute over breach of lease agreement for commercial property
                </span>
              </div>
            </div>

            <div className="flex flex-col self-stretch gap-4">
              {/* File Date & Time */}
              <div className="flex flex-col items-start self-stretch gap-2">
                <span className="text-[#040E1B] text-xs font-bold">File Date & Time</span>
                <input
                  type="text"
                  placeholder="Oct 23, 2025 – 14:20pm"
                  className="self-stretch text-[#040E1B] bg-[#F7F8FA] text-sm p-4 rounded-lg border-0 outline-none"
                />
              </div>

              {/* Court and Judge */}
              <div className="flex items-center self-stretch gap-2">
                <div className="flex flex-1 flex-col items-start gap-2">
                  <span className="text-[#040E1B] text-sm font-bold">Court</span>
                  <button className="flex flex-col items-center self-stretch bg-[#F7F8FA] text-left py-3.5 rounded-lg border-0">
                    <span className="text-[#525866] text-sm">High Court (Commercial Division)</span>
                  </button>
                </div>
                <span className="text-[#040E1B] text-sm font-bold mt-8">-</span>
                <div className="flex flex-1 flex-col items-start gap-2">
                  <span className="text-[#040E1B] text-sm font-bold">Judge</span>
                  <input
                    type="text"
                    placeholder="Ben Carson (SAN)"
                    className="self-stretch text-[#525866] bg-[#F7F8FA] text-sm py-3.5 px-4 rounded-lg border-0 outline-none"
                  />
                </div>
              </div>

              {/* Court Note */}
              <div className="flex flex-col self-stretch gap-2">
                <div className="flex justify-between items-start self-stretch">
                  <span className="text-[#040E1B] text-xs font-bold">Court note</span>
                  <img
                    src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Iq8V0MifpP/s22rshfl_expires_30_days.png"
                    className="w-4 h-4 object-fill cursor-pointer"
                  />
                </div>
                <div className="flex flex-col self-stretch bg-[#F7F8FA] p-4 rounded-lg">
                  <span className="text-[#040E1B] text-sm">
                    Counsel for EcoWind Corp. opened with an update on settlement talks but confirmed that no agreement has been reached. SafeDrive Insurance responded by requesting additional time to review new documents submitted last week. The judge accepted the documents into the record and directed both parties to exchange any remaining disclosures before the next date. Counsel on both sides agreed to the timeline. No witnesses were called today.
                  </span>
                </div>
              </div>

              {/* Outcome for the Day */}
              <div className="flex flex-col self-stretch gap-2">
                <div className="flex justify-between items-start self-stretch">
                  <span className="text-[#040E1B] text-xs font-bold">Outcome for the Day</span>
                  <img
                    src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Iq8V0MifpP/zcw7pwv4_expires_30_days.png"
                    className="w-4 h-4 object-fill cursor-pointer"
                  />
                </div>
                <input
                  type="text"
                  placeholder="The matter was adjourned for a compliance check on filings. A new date will be issued on the next cause list."
                  className="self-stretch text-[#040E1B] bg-[#F7F8FA] text-sm p-4 rounded-lg border-0 outline-none"
                />
              </div>

              {/* Upload Date */}
              <div className="flex flex-col items-start self-stretch gap-2">
                <span className="text-[#040E1B] text-xs font-bold">Upload date</span>
                <input
                  type="text"
                  placeholder="04/11/2025"
                  className="self-stretch text-[#040E1B] bg-[#F7F8FA] text-sm p-4 rounded-lg border-0 outline-none"
                />
              </div>

              {/* Notable Mentions */}
              <div className="flex flex-col items-start self-stretch gap-2">
                <span className="text-[#040E1B] text-xs font-bold">Notable mentions</span>
                <div className="flex flex-col items-start self-stretch bg-[#F7F8FA] py-4 gap-2.5 rounded-lg">
                  <span className="text-[#040E1B] text-sm ml-4">
                    • Case adjourned on 26th October till 2nd of November, 2025.
                  </span>
                  <span className="text-[#040E1B] text-sm ml-4">
                    • New witness presented in court in person of Mr. James Johnson.
                  </span>
                </div>
              </div>

              {/* Judgment */}
              <div className="flex flex-col items-start self-stretch gap-2">
                <span className="text-[#040E1B] text-xs font-bold">Judgment</span>
                <input
                  type="text"
                  placeholder="Ongoing"
                  className="self-stretch text-[#040E1B] bg-[#F7F8FA] text-sm p-4 rounded-lg border-0 outline-none"
                />
              </div>

              {/* Save Button */}
              <button 
                className="flex items-center justify-center self-stretch py-4 mt-4 rounded-lg border-4 border-solid border-[#0F284726] hover:opacity-90 transition-opacity"
                style={{background: 'linear-gradient(180deg, #022658, #1A4983)'}}
              >
                <span className="text-white text-base font-bold">Save Diary Entry</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CaseDiaryDrawer;

