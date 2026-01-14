import React from 'react';
import { X, Plus } from 'lucide-react';

const RegistrarCaseDiaryDrawer = ({ event, caseData, onClose }) => {
  // Default event data if not provided
  const defaultEvent = {
    caseNo: 'CM/1245/2023',
    fileDate: 'Oct 3, 2025',
    fileTime: '9:30am',
    judge: 'Justice A. Mensah',
    courtNote: 'Counsel for EcoWind Corp. opened with an update on settlement talks but confirmed that no agreement has been reached. SafeDrive Insurance responded by requesting additional time to review new documents submitted last week. The judge accepted the documents into the record and directed both parties to exchange any remaining disclosures before the next date. Counsel on both sides agreed to the timeline. No witnesses were called today.',
    outcome: 'The matter was adjourned for a compliance check on filings. A new date will be issued on the next cause list.',
    originalFileDate: 'October 10, 2023',
    notableMentions: [
      'Case adjourned on 26th October till 2nd of November, 2025.',
      'New witness presented in court in person of Mr. James Johnson.'
    ],
    judgement: 'Ongoing'
  };

  const eventData = event || defaultEvent;
  const caseTitle = caseData?.fullTitle || caseData?.title || 'EcoWind Corp. vs. SafeDrive Insurance - Dispute over breach of lease agreement for commercial property';
  const caseNo = caseData?.suitNo || eventData.caseNo;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className="fixed right-0 top-0 h-full w-[553px] bg-white shadow-lg z-50 overflow-y-auto"
        style={{ boxShadow: '-5px 8px 4px 4px rgba(7, 8, 16, 0.10)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="pt-6 pl-10 pr-10 flex flex-col gap-4">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="w-6 h-6 flex items-center justify-center hover:opacity-70"
          >
            <X className="w-6 h-6 text-[#050F1C]" />
          </button>

          {/* Content */}
          <div className="flex flex-col gap-6">
            {/* Header */}
            <div className="flex flex-col gap-6">
              <span className="text-[#525866] text-xs opacity-75">VIEW CASE DIARY</span>
              <div className="flex flex-col gap-1">
                <span className="text-[#050F1C] text-lg font-medium">{caseNo}</span>
                <span className="text-[#050F1C] text-sm font-normal">{caseTitle}</span>
              </div>
            </div>

            {/* Fields */}
            <div className="flex flex-col gap-4">
              {/* File Date & Time */}
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-start">
                  <span className="text-[#050F1C] text-xs font-bold">File Date & Time</span>
                  <Plus className="w-4 h-4 text-[#050F1C]" />
                </div>
                <div className="p-4 bg-[#F7F8FA] rounded-lg">
                  <span className="text-[#050F1C] text-sm">
                    {eventData.fileDate} – {eventData.fileTime}
                  </span>
                </div>
              </div>

              {/* Judge */}
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-start">
                  <span className="text-[#050F1C] text-xs font-bold">Judge</span>
                  <Plus className="w-4 h-4 text-[#050F1C]" />
                </div>
                <div className="p-4 bg-[#F7F8FA] rounded-lg">
                  <span className="text-[#050F1C] text-sm">{eventData.judge}</span>
                </div>
              </div>

              {/* Court note */}
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-start">
                  <span className="text-[#050F1C] text-xs font-bold">Court note</span>
                  <Plus className="w-4 h-4 text-[#050F1C]" />
                </div>
                <div className="p-4 bg-[#F7F8FA] rounded-lg">
                  <span className="text-[#050F1C] text-sm">{eventData.courtNote}</span>
                </div>
              </div>

              {/* Outcome for the Day */}
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-start">
                  <span className="text-[#050F1C] text-xs font-bold">Outcome for the Day</span>
                  <Plus className="w-4 h-4 text-[#050F1C]" />
                </div>
                <div className="p-4 bg-[#F7F8FA] rounded-lg">
                  <span className="text-[#050F1C] text-sm">{eventData.outcome}</span>
                </div>
              </div>

              {/* File date */}
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-start">
                  <span className="text-[#050F1C] text-xs font-bold">File date</span>
                  <Plus className="w-4 h-4 text-[#050F1C]" />
                </div>
                <div className="p-4 bg-[#F7F8FA] rounded-lg">
                  <span className="text-[#050F1C] text-sm">{eventData.originalFileDate}</span>
                </div>
              </div>

              {/* Notable mentions */}
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-start">
                  <span className="text-[#050F1C] text-xs font-bold">Notable mentions</span>
                  <Plus className="w-4 h-4 text-[#050F1C]" />
                </div>
                <div className="p-4 bg-[#F7F8FA] rounded-lg flex flex-col gap-2.5">
                  {eventData.notableMentions && eventData.notableMentions.map((mention, index) => (
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
                  <Plus className="w-4 h-4 text-[#050F1C]" />
                </div>
                <div className="p-4 bg-[#F7F8FA] rounded-lg">
                  <span className="text-[#050F1C] text-sm">{eventData.judgement}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default RegistrarCaseDiaryDrawer;

