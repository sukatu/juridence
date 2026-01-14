import React from 'react';
import { X } from 'lucide-react';

const LogoutConfirmationModal = ({ onClose, onConfirm }) => {
  return (
    <>
      {/* Overlay with backdrop blur */}
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center"
        style={{ 
          background: 'rgba(4.60, 14.87, 27.60, 0.50)',
          backdropFilter: 'blur(8px)'
        }}
      >
        {/* Modal */}
        <div className="bg-white rounded-lg p-8 relative" style={{ width: '378px' }}>
          {/* Close Button */}
          <button 
            onClick={onClose}
            className="absolute top-8 right-8 w-6 h-6 flex items-center justify-center hover:opacity-70 cursor-pointer"
          >
            <X className="w-6 h-6 text-[#050F1C]" />
          </button>

          {/* Modal Content */}
          <div className="flex flex-col items-center gap-8">
            {/* Heading and Description */}
            <div className="flex flex-col items-center gap-2">
              <h2 
                className="text-[#050F1C] text-lg text-center"
                style={{ fontFamily: 'Poppins', fontWeight: 400 }}
              >
                Are You Sure You Want To Log Out?
              </h2>
              <p 
                className="text-[#525866] text-xs text-center"
                style={{ fontFamily: 'Satoshi', fontWeight: 400 }}
              >
                Press "Log Out" to leave or "Cancel" to return to Dashboard.
              </p>
            </div>

            {/* Buttons */}
            <div className="flex items-start gap-10 w-full">
              {/* Cancel Button */}
              <button
                onClick={onClose}
                className="flex-1 h-[58px] px-2.5 shadow-md rounded-lg border-2 border-[#4CAF50] flex items-center justify-center gap-2.5 hover:bg-green-50 transition-colors"
              >
                <span 
                  className="text-[#10B981] text-base font-bold"
                  style={{ fontFamily: 'Satoshi' }}
                >
                  Cancel
                </span>
              </button>

              {/* Log out Button */}
              <button
                onClick={onConfirm}
                className="flex-1 h-[58px] px-2.5 bg-gradient-to-b from-[#EF4444] to-[#B11E1E] shadow-md rounded-lg border-4 border-[rgba(239,68,68,0.15)] flex items-center justify-center gap-2.5 hover:opacity-90 transition-opacity"
              >
                <span 
                  className="text-white text-base font-bold"
                  style={{ fontFamily: 'Satoshi' }}
                >
                  Log Out
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default LogoutConfirmationModal;

