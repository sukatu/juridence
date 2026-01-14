import React, { useState, useEffect } from 'react';
import { X, Edit } from 'lucide-react';

const ViewCauseListDrawer = ({ caseData, onClose, onEdit }) => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Trigger animation after mount
    setTimeout(() => setIsOpen(true), 10);
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    setTimeout(onClose, 300); // Wait for animation to complete
  };

  // Default case data if not provided
  const defaultCaseData = {
    caseNo: 'CV/1089/2021',
    title: 'EcoWind Corp. vs. SafeDrive Insurance - Dispute over breach of lease agreement for commercial property',
    hearingDate: 'Oct. 29, 2025',
    hearingTime: '9:00am',
    judge: 'Justice Benjamin Carson',
    recordOfDay: 'The plaintiff is seeking damages amounting to GHS 150,000 and an order compelling the defendant to either honor the original lease terms or compensate for the loss incurred.',
    outcome: 'The matter was adjourned for a compliance check on filings. A new date will be issued on the next cause list.',
    fileDate: 'October 10, 2021',
    notableMentions: [
      'Case adjourned on 26th October till 2nd of November, 2025.',
      'New witness presented in court in person of Mr. James Johnson.'
    ],
    judgement: 'Ongoing'
  };

  const data = caseData || defaultCaseData;

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
        className={`fixed top-0 right-0 h-full w-[553px] bg-white transform transition-transform duration-300 ease-in-out z-50 overflow-y-auto ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{ boxShadow: '-5px 8px 4px 4px rgba(7, 8, 16, 0.10)' }}
      >
        <div className="py-[25px] px-10">
          <div className="flex flex-col items-start gap-4">
            {/* Header Actions */}
            <div className="flex items-center justify-between w-full">
            <button onClick={handleClose} className="cursor-pointer hover:opacity-70">
              <X className="w-6 h-6 text-[#050F1C]" />
            </button>
              {onEdit && (
                <button
                  onClick={() => {
                    if (onEdit && caseData?.rawData) {
                      onEdit(caseData.rawData);
                      handleClose();
                    }
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-[#022658] text-white rounded-lg hover:bg-[#033a7a] transition-colors"
                >
                  <Edit className="w-4 h-4" />
                  <span className="text-sm font-medium">Edit</span>
                </button>
              )}
            </div>

            <div className="flex flex-col self-stretch gap-6">
              {/* Header */}
              <div className="flex flex-col items-start gap-6">
                <span className="text-[#525866] text-xs opacity-75">VIEW CAUSE LIST</span>
                <div className="flex flex-col items-start gap-1">
                  <span className="text-[#050F1C] text-lg font-medium">{data.caseNo}</span>
                  <span className="text-[#050F1C] text-sm font-normal">{data.title}</span>
                </div>
              </div>

              {/* Form Fields */}
              <div className="flex flex-col gap-4">
                {/* Hearing Date & Time */}
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-start">
                    <span className="text-[#050F1C] text-xs font-bold">Hearing Date & Time</span>
                    <div className="w-4 h-4 rounded-full border border-[#050F1C]"></div>
                  </div>
                  <div className="p-4 bg-[#F7F8FA] rounded-lg">
                    <span className="text-[#050F1C] text-sm">
                      {data.hearingDate} – {data.hearingTime ? data.hearingTime.toLowerCase() : ''}
                    </span>
                  </div>
                </div>

                {/* Judge */}
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-start">
                    <span className="text-[#050F1C] text-xs font-bold">Judge</span>
                    <div className="w-4 h-4 rounded-full border border-[#050F1C]"></div>
                  </div>
                  <div className="p-4 bg-[#F7F8FA] rounded-lg">
                    <span className="text-[#050F1C] text-sm">{data.judge}</span>
                  </div>
                </div>

                {/* Record of the day */}
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-start">
                    <span className="text-[#050F1C] text-xs font-bold">Record of the day</span>
                    <div className="w-4 h-4 rounded-full border border-[#050F1C]"></div>
                  </div>
                  <div className="p-4 bg-[#F7F8FA] rounded-lg">
                    <span className="text-[#050F1C] text-sm flex-1">{data.recordOfDay}</span>
                  </div>
                </div>

                {/* Outcome for the Day */}
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-start">
                    <span className="text-[#050F1C] text-xs font-bold">Outcome for the Day</span>
                    <div className="w-4 h-4 rounded-full border border-[#050F1C]"></div>
                  </div>
                  <div className="p-4 bg-[#F7F8FA] rounded-lg">
                    <span className="text-[#050F1C] text-sm flex-1">{data.outcome}</span>
                  </div>
                </div>

                {/* File date */}
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-start">
                    <span className="text-[#050F1C] text-xs font-bold">File date</span>
                    <div className="w-4 h-4 rounded-full border border-[#050F1C]"></div>
                  </div>
                  <div className="p-4 bg-[#F7F8FA] rounded-lg">
                    <span className="text-[#050F1C] text-sm">{data.fileDate}</span>
                  </div>
                </div>

                {/* Notable mentions */}
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-start">
                    <span className="text-[#050F1C] text-xs font-bold">Notable mentions</span>
                    <div className="w-4 h-4 rounded-full border border-[#050F1C]"></div>
                  </div>
                  <div className="p-4 bg-[#F7F8FA] rounded-lg flex flex-col gap-2.5">
                    {data.notableMentions && data.notableMentions.map((mention, index) => (
                      <span key={index} className="text-[#050F1C] text-sm">
                        {mention}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Judgement */}
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-start">
                    <span className="text-[#050F1C] text-xs font-bold">Judgement</span>
                    <div className="w-4 h-4 rounded-full border border-[#050F1C]"></div>
                  </div>
                  <div className="p-4 bg-[#F7F8FA] rounded-lg">
                    <span className="text-[#050F1C] text-sm">{data.judgement}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ViewCauseListDrawer;

