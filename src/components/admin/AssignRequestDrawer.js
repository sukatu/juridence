import React from 'react';

const AssignRequestDrawer = ({ request, onClose, onAssign, admins = [] }) => {
  // Default admins if none provided
  const defaultAdmins = [
    { name: 'Me', assignedRequests: 0, avatar: 'https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Iq8V0MifpP/wzlvmrem_expires_30_days.png', buttonText: 'Assign to me' }
  ];
  
  const adminList = admins.length > 0 ? admins : defaultAdmins;

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed top-0 right-0 h-full w-[500px] bg-white z-50 overflow-y-auto shadow-lg" style={{ boxShadow: '-5px 8px 4px #0708101A' }}>
        <div className="flex flex-col items-start w-full px-10 py-[49px] gap-4">
          {/* Close Button */}
          <button onClick={onClose} className="cursor-pointer hover:opacity-70">
            <img
              src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Iq8V0MifpP/uhzmmtkk_expires_30_days.png"
              className="w-6 h-6 object-fill flex-shrink-0"
            />
          </button>

          {/* Header */}
          <div className="flex flex-col items-start w-full gap-6">
            <div className="flex flex-col items-start gap-2">
              <span className="text-[#525866] text-xs whitespace-nowrap">MANAGE REQUESTS</span>
              <span className="text-[#040E1B] text-lg font-bold whitespace-nowrap">Choose Admin to assign to</span>
            </div>

            {/* Admin List */}
            <div className="flex flex-col w-full gap-4">
              {adminList.map((admin, idx) => (
                <div key={idx} className={`flex justify-between items-center w-full ${idx === 0 ? 'pb-4 border-b border-[#E5E8EC]' : ''}`}>
                  <div className="flex items-center gap-1">
                    <img
                      src={admin.avatar}
                      className="w-9 h-9 object-fill flex-shrink-0 rounded-full"
                    />
                    <div className="flex flex-col items-start gap-1">
                      <span className="text-[#040E1B] text-base whitespace-nowrap">{admin.name}</span>
                      <span className="text-blue-500 text-xs font-bold whitespace-nowrap">
                        {admin.assignedRequests} assigned requests
                      </span>
                    </div>
                  </div>
                  <button 
                    onClick={() => onAssign && onAssign(admin)}
                    className="flex flex-col items-center py-1 px-4 rounded-lg border border-solid border-[#F59E0B] hover:bg-orange-50 transition-colors"
                  >
                    <span className="text-[#F59E0B] text-base whitespace-nowrap" style={{ fontFamily: 'Satoshi' }}>{admin.buttonText === 'Assign to me' ? 'Assign To Me' : 'Assign To'}</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AssignRequestDrawer;

