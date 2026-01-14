import React from 'react';
import { X } from 'lucide-react';

const DeleteNotificationModal = ({ isOpen, onClose, onConfirm, notificationTitle }) => {
  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-50 backdrop-blur-sm"
        style={{ backgroundColor: 'rgba(4.60, 14.87, 27.60, 0.50)' }}
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div
        className="fixed left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-2xl z-50 p-8"
        style={{ width: '482px' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col items-end gap-8">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="w-6 h-6 flex items-center justify-center hover:opacity-70 transition-opacity"
          >
            <X className="w-6 h-6 text-[#050F1C]" />
          </button>

          {/* Content */}
          <div className="flex flex-col items-center gap-8 w-full">
            <div className="flex flex-col items-center gap-2 w-full">
              <div className="text-[#050F1C] text-lg font-normal text-center">
                Are you sure you want to delete this message?
              </div>
              <div className="text-[#525866] text-sm font-normal text-center">
                {notificationTitle}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-10 w-full">
              <button
                onClick={onClose}
                className="flex-1 h-[58px] px-2.5 rounded-lg border-2 border-[#4CAF50] text-[#10B981] text-base font-bold hover:opacity-90 transition-opacity"
                style={{ boxShadow: '0px 4px 4px rgba(5, 15, 28, 0.10)' }}
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                className="flex-1 h-[58px] px-2.5 rounded-lg border-4 border-[#EF444415] text-white text-base font-bold hover:opacity-90 transition-opacity"
                style={{
                  background: 'linear-gradient(180deg, #EF4444 43%, #B11E1E 100%)',
                  boxShadow: '0px 4px 4px rgba(5, 15, 28, 0.10)',
                  outline: '4px solid rgba(239, 68, 68, 0.15)'
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default DeleteNotificationModal;

