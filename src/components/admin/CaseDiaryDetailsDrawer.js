import React, { useState, useEffect } from 'react';

const CaseDiaryDetailsDrawer = ({ event, onClose }) => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Trigger animation after mount
    setTimeout(() => setIsOpen(true), 10);
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    setTimeout(onClose, 300); // Wait for animation to complete
  };

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black transition-opacity duration-300 z-40 ${
          isOpen ? 'opacity-50' : 'opacity-0'
        }`}
        onClick={handleClose}
      />

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-[500px] bg-white shadow-lg transform transition-transform duration-300 ease-in-out z-50 overflow-y-auto ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{ boxShadow: '-5px 8px 4px #0708101A' }}
      >
        <div className="self-stretch bg-white py-[21px] px-10 rounded-lg">
          <div className="flex flex-col items-start self-stretch gap-4">
            {/* Close Button */}
            <button onClick={handleClose} className="cursor-pointer hover:opacity-70">
              <img
                src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Iq8V0MifpP/evv97uy9_expires_30_days.png"
                className="w-6 h-6 object-fill"
                alt="Close"
              />
            </button>

            <div className="flex flex-col self-stretch gap-6">
              {/* Header */}
              <div className="flex flex-col items-start self-stretch gap-6">
                <span className="text-[#525866] text-xs">VIEW CASE DIARY</span>
                <div className="flex flex-col items-start self-stretch pr-12 gap-1">
                  <span className="text-[#040E1B] text-lg">CM/1245/2023</span>
                  <span className="text-[#040E1B] text-sm">
                    EcoWind Corp. vs. SafeDrive Insurance - Dispute over breach of lease agreement for commercial
                    property
                  </span>
                </div>
              </div>

              {/* Form Fields */}
              <div className="flex flex-col self-stretch gap-4">
                {/* File Date & Time */}
                <div className="flex flex-col self-stretch gap-2">
                  <div className="flex justify-between items-start self-stretch">
                    <span className="text-[#040E1B] text-xs font-bold">File Date & Time</span>
                    <img
                      src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Iq8V0MifpP/1okqyjz7_expires_30_days.png"
                      className="w-4 h-4 object-fill"
                    />
                  </div>
                  <input
                    type="text"
                    placeholder="Oct 3, 2025 – 9:30am"
                    defaultValue="Oct 3, 2025 – 9:30am"
                    className="self-stretch text-[#040E1B] bg-[#F7F8FA] text-sm p-4 rounded-lg border-0 outline-none"
                  />
                </div>

                {/* Judge */}
                <div className="flex flex-col self-stretch gap-2">
                  <div className="flex justify-between items-start self-stretch">
                    <span className="text-[#040E1B] text-xs font-bold">Judge</span>
                    <img
                      src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Iq8V0MifpP/7saki78s_expires_30_days.png"
                      className="w-4 h-4 object-fill"
                    />
                  </div>
                  <input
                    type="text"
                    placeholder="Justice A. Mensah"
                    defaultValue="Justice A. Mensah"
                    className="self-stretch text-[#040E1B] bg-[#F7F8FA] text-sm p-4 rounded-lg border-0 outline-none"
                  />
                </div>

                {/* Court Note */}
                <div className="flex flex-col self-stretch gap-2">
                  <div className="flex justify-between items-start self-stretch">
                    <span className="text-[#040E1B] text-xs font-bold">Court note</span>
                    <img
                      src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Iq8V0MifpP/k1ioj8bo_expires_30_days.png"
                      className="w-4 h-4 object-fill"
                    />
                  </div>
                  <div className="flex flex-col self-stretch bg-[#F7F8FA] p-4 rounded-lg">
                    <span className="text-[#040E1B] text-sm">
                      Counsel for EcoWind Corp. opened with an update on settlement talks but confirmed that no
                      agreement has been reached. SafeDrive Insurance responded by requesting additional time to review
                      new documents submitted last week. The judge accepted the documents into the record and directed
                      both parties to exchange any remaining disclosures before the next date. Counsel on both sides
                      agreed to the timeline. No witnesses were called today.
                    </span>
                  </div>
                </div>

                {/* Outcome for the Day */}
                <div className="flex flex-col self-stretch gap-2">
                  <div className="flex justify-between items-start self-stretch">
                    <span className="text-[#040E1B] text-xs font-bold">Outcome for the Day</span>
                    <img
                      src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Iq8V0MifpP/ut1ch0k6_expires_30_days.png"
                      className="w-4 h-4 object-fill"
                    />
                  </div>
                  <input
                    type="text"
                    placeholder="The matter was adjourned for a compliance check on filings. A new date will be issued on the next cause list."
                    defaultValue="The matter was adjourned for a compliance check on filings. A new date will be issued on the next cause list."
                    className="self-stretch text-[#040E1B] bg-[#F7F8FA] text-sm p-4 rounded-lg border-0 outline-none"
                  />
                </div>

                {/* File Date */}
                <div className="flex flex-col self-stretch gap-2">
                  <div className="flex justify-between items-start self-stretch">
                    <span className="text-[#040E1B] text-xs font-bold">File date</span>
                    <img
                      src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Iq8V0MifpP/0nbcqe6j_expires_30_days.png"
                      className="w-4 h-4 object-fill"
                    />
                  </div>
                  <input
                    type="text"
                    placeholder="October 10, 2023"
                    defaultValue="October 10, 2023"
                    className="self-stretch text-[#040E1B] bg-[#F7F8FA] text-sm p-4 rounded-lg border-0 outline-none"
                  />
                </div>

                {/* Notable Mentions */}
                <div className="flex flex-col self-stretch gap-2">
                  <div className="flex justify-between items-start self-stretch">
                    <span className="text-[#040E1B] text-xs font-bold">Notable mentions</span>
                    <img
                      src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Iq8V0MifpP/wgrbezbe_expires_30_days.png"
                      className="w-4 h-4 object-fill"
                    />
                  </div>
                  <div className="flex flex-col items-start self-stretch bg-[#F7F8FA] py-4 gap-2.5 rounded-lg">
                    <span className="text-[#040E1B] text-sm ml-4">
                      Case adjourned on 26th October till 2nd of November, 2025.
                    </span>
                    <span className="text-[#040E1B] text-sm ml-4">
                      New witness presented in court in person of Mr. James Johnson.
                    </span>
                  </div>
                </div>

                {/* Judgement */}
                <div className="flex flex-col self-stretch gap-2">
                  <div className="flex justify-between items-start self-stretch">
                    <span className="text-[#040E1B] text-xs font-bold">Judgement</span>
                    <img
                      src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Iq8V0MifpP/kuse55dk_expires_30_days.png"
                      className="w-4 h-4 object-fill"
                    />
                  </div>
                  <input
                    type="text"
                    placeholder="Ongoing"
                    defaultValue="Ongoing"
                    className="self-stretch text-[#040E1B] bg-[#F7F8FA] text-sm p-4 rounded-lg border-0 outline-none"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CaseDiaryDetailsDrawer;

