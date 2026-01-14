import React, { useEffect } from 'react';

const SuccessNotification = ({ message, onClose }) => {
  useEffect(() => {
    // Auto-dismiss after 5 seconds
    const timer = setTimeout(() => {
      onClose();
    }, 5000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-[#040E1B80] z-50 flex items-start justify-center">
        <div className="flex items-start bg-emerald-500 p-4 mt-[62px] rounded-lg shadow-lg">
          <div className="flex items-start gap-3">
            <img
              src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Iq8V0MifpP/gmta24ep_expires_30_days.png"
              className="w-6 h-6 object-fill flex-shrink-0"
            />
            <div className="flex flex-col items-start gap-2">
              <span className="text-white text-base font-bold whitespace-nowrap">Success</span>
              <span className="text-white text-xs whitespace-nowrap">{message}</span>
            </div>
          </div>
          <button onClick={onClose} className="ml-[164px] cursor-pointer hover:opacity-70">
            <img
              src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Iq8V0MifpP/8z9xjhgt_expires_30_days.png"
              className="w-6 h-6 rounded-lg object-fill flex-shrink-0"
            />
          </button>
        </div>
      </div>
    </>
  );
};

export default SuccessNotification;

