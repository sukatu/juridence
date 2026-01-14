import React from 'react';
import { X, ArrowLeft } from 'lucide-react';

const CorporateClientCaseDiaryDrawer = ({ event, caseData, onClose }) => {
  if (!event) return null;

  // Sample data - in real app, this would come from props or API
  const drawerData = {
    caseNo: event.caseNo || 'CM/0245/2023',
    caseTitle: caseData?.title || 'EcoWind Corp. vs. SafeDrive Insurance - Dispute over breach of lease agreement for commercial property',
    fileDate: 'Oct 23, 2025',
    fileTime: '14:20pm',
    court: 'High Court (Commercial Division)',
    judge: event.judge || 'Ben Carson (SAN)',
    caseSummary: 'This case revolves around a contractual dispute concerning a lease agreement for a commercial property located in Accra. JKL Ventures Ltd, through its director, contends that Meridian Properties breached the terms of the agreement by prematurely terminating the lease and failing to fulfill specific maintenance and renewal obligations stipulated in the contract. As a result, JKL Ventures claims to have suffered operational and financial setbacks due to the sudden loss of the leased premises.\nThe plaintiff is seeking damages amounting to GHS 150,000 and an order compelling the defendant to either honor the original lease terms or compensate for the loss incurred.',
    uploadDate: '04/11/2025',
    notableMentions: [
      'Case adjourned on 26th October till 2nd of November, 2025.',
      'New witness presented in court in person of Mr. James Johnson.'
    ],
    judgment: 'Ongoing'
  };

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      ></div>

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-[553px] bg-white shadow-2xl z-50 overflow-y-auto"
        style={{ boxShadow: '-5px 8px 4px 4px rgba(7, 8, 16, 0.10)' }}
      >
        <div className="px-10 pt-6 pb-6 flex flex-col gap-6">
          {/* Close Button */}
          <div className="flex justify-start">
            <button
              onClick={onClose}
              className="p-0 hover:opacity-70 transition-opacity"
            >
              <ArrowLeft className="w-6 h-6 text-[#050F1C]" />
            </button>
          </div>

          {/* Content */}
          <div className="flex flex-col gap-6">
            {/* Header Section */}
            <div className="flex flex-col gap-6">
              <span className="text-[#525866] text-xs font-normal opacity-75">CAUSE LIST</span>
              <div className="flex flex-col gap-1">
                <span className="text-[#050F1C] text-lg font-medium">{drawerData.caseNo}</span>
                <span className="text-[#050F1C] text-sm font-normal">{drawerData.caseTitle}</span>
              </div>
            </div>

            {/* Details Section */}
            <div className="flex flex-col gap-4">
              {/* File Date & Time */}
              <div className="flex flex-col gap-2">
                <span className="text-[#050F1C] text-xs font-bold">File Date & Time</span>
                <div className="p-4 bg-[#F7F8FA] rounded-lg">
                  <span className="text-[#050F1C] text-sm font-normal">{drawerData.fileDate} – {drawerData.fileTime}</span>
                </div>
              </div>

              {/* Court and Judge */}
              <div className="flex items-center gap-2">
                <div className="flex-1 flex flex-col gap-2">
                  <span className="text-[#050F1C] text-sm font-bold">Court</span>
                  <div className="h-12 bg-[#F7F8FA] rounded-lg flex items-center px-4">
                    <span className="text-[#525866] text-sm font-normal">{drawerData.court}</span>
                  </div>
                </div>
                <span className="text-[#050F1C] text-sm font-bold">-</span>
                <div className="flex-1 flex flex-col gap-2">
                  <span className="text-[#050F1C] text-sm font-bold">Judge</span>
                  <div className="h-12 bg-[#F7F8FA] rounded-lg flex items-center px-4">
                    <span className="text-[#525866] text-sm font-normal">{drawerData.judge}</span>
                  </div>
                </div>
              </div>

              {/* Case Summary */}
              <div className="flex flex-col gap-2">
                <span className="text-[#050F1C] text-xs font-bold">Case summary</span>
                <div className="p-4 bg-[#F7F8FA] rounded-lg">
                  <span className="text-[#050F1C] text-sm font-normal whitespace-pre-line">{drawerData.caseSummary}</span>
                </div>
              </div>

              {/* Upload Date */}
              <div className="flex flex-col gap-2">
                <span className="text-[#050F1C] text-xs font-bold">Upload date</span>
                <div className="p-4 bg-[#F7F8FA] rounded-lg">
                  <span className="text-[#050F1C] text-sm font-normal">{drawerData.uploadDate}</span>
                </div>
              </div>

              {/* Notable Mentions */}
              <div className="flex flex-col gap-2">
                <span className="text-[#050F1C] text-xs font-bold">Notable mentions</span>
                <div className="p-4 bg-[#F7F8FA] rounded-lg flex flex-col gap-2.5">
                  {drawerData.notableMentions.map((mention, index) => (
                    <span key={index} className="text-[#050F1C] text-sm font-normal">{mention}</span>
                  ))}
                </div>
              </div>

              {/* Judgment */}
              <div className="flex flex-col gap-2">
                <span className="text-[#050F1C] text-xs font-bold">Judgment</span>
                <div className="p-4 bg-[#F7F8FA] rounded-lg">
                  <span className="text-[#050F1C] text-sm font-normal">{drawerData.judgment}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CorporateClientCaseDiaryDrawer;

