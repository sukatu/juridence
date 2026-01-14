import React, { useState } from 'react';

const IntegrationConfigDrawer = ({ integration, onClose }) => {
  const [notifications, setNotifications] = useState({
    watchlistAlerts: true,
    highRiskEntities: true,
    searchRequestsCompleted: false,
    dailyActivitySummary: false,
    newCasesFiled: false,
    changeOfEntitiesStatus: false
  });

  const [notificationFormat, setNotificationFormat] = useState('summary');

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed top-0 right-0 h-full w-[500px] bg-white z-50 overflow-y-auto" style={{ boxShadow: '-5px 8px 4px #0708101A' }}>
        <div className="flex flex-col items-start w-full px-10 py-6 gap-4">
          {/* Close Button */}
          <button onClick={onClose} className="cursor-pointer hover:opacity-70">
            <img
              src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Iq8V0MifpP/7q2wlr61_expires_30_days.png"
              className="w-6 h-6 object-fill flex-shrink-0"
            />
          </button>

          {/* Header */}
          <div className="flex flex-col items-start gap-6">
            <span className="text-[#525866] text-xs whitespace-nowrap">CONFIGURE CONNECTION</span>
            <div className="flex items-center">
              <img
                src={integration.icon}
                className="w-7 h-7 mr-1 object-fill flex-shrink-0"
              />
              <span className="text-[#040E1B] text-xl whitespace-nowrap">{integration.name}</span>
            </div>
          </div>

          {/* Configuration Form */}
          <div className="flex flex-col w-full gap-6">
            {/* Workspace */}
            <div className="flex flex-col items-start w-full gap-2">
              <span className="text-[#040E1B] text-xs font-bold whitespace-nowrap">Workspace</span>
              <input
                type="text"
                placeholder="Paste link here"
                className="w-full text-[#525866] bg-[#F7F8FA] text-sm p-4 rounded-lg border-0 outline-none"
              />
            </div>

            {/* Default Channel */}
            <div className="flex flex-col items-start w-full gap-2">
              <span className="text-[#040E1B] text-xs font-bold whitespace-nowrap">Default Channel</span>
              <div className="flex justify-between items-center w-full bg-[#F7F8FA] pr-4 rounded-lg">
                <input
                  type="text"
                  placeholder="#compliance"
                  className="flex-1 text-[#040E1B] bg-transparent text-sm py-4 pl-4 mr-1 border-0 outline-none"
                />
                <img
                  src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Iq8V0MifpP/5mnlm21b_expires_30_days.png"
                  className="w-4 h-4 rounded-lg object-fill flex-shrink-0"
                />
              </div>
            </div>

            {/* Send Notifications For */}
            <div className="flex flex-col items-start w-full gap-2">
              <span className="text-[#525866] text-base whitespace-nowrap">Send notifications for...</span>
              <div className="flex flex-col w-full gap-3">
                {[
                  { key: 'watchlistAlerts', label: 'Watchlist alerts' },
                  { key: 'highRiskEntities', label: 'High-risk entities detected' },
                  { key: 'searchRequestsCompleted', label: 'Search requests completed' },
                  { key: 'dailyActivitySummary', label: 'Daily activity summary' },
                  { key: 'newCasesFiled', label: 'New cases filed' },
                  { key: 'changeOfEntitiesStatus', label: 'Change of all entities status' }
                ].map((item) => (
                  <button
                    key={item.key}
                    onClick={() => setNotifications(prev => ({ ...prev, [item.key]: !prev[item.key] }))}
                    className="flex justify-between items-center w-full hover:opacity-70 cursor-pointer"
                  >
                    <span className="text-[#040E1B] text-base whitespace-nowrap">{item.label}</span>
                    <img
                      src={notifications[item.key] 
                        ? "https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Iq8V0MifpP/8fxrb3mf_expires_30_days.png"
                        : "https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Iq8V0MifpP/67akfzyq_expires_30_days.png"}
                      className="w-6 h-6 object-fill flex-shrink-0"
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Notification Format */}
            <div className="flex flex-col items-start w-full gap-2">
              <span className="text-[#525866] text-base whitespace-nowrap">Notification format</span>
              <div className="flex flex-col items-start gap-3">
                <button
                  onClick={() => setNotificationFormat('summary')}
                  className="flex items-center gap-2 hover:opacity-70 cursor-pointer"
                >
                  <img
                    src={notificationFormat === 'summary'
                      ? "https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Iq8V0MifpP/17xiwkvs_expires_30_days.png"
                      : "https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Iq8V0MifpP/qptl5ghs_expires_30_days.png"}
                    className="w-6 h-6 object-fill flex-shrink-0"
                  />
                  <span className="text-[#040E1B] text-base whitespace-nowrap">Summary only</span>
                </button>
                <button
                  onClick={() => setNotificationFormat('detailed')}
                  className="flex items-center gap-2 hover:opacity-70 cursor-pointer"
                >
                  <img
                    src={notificationFormat === 'detailed'
                      ? "https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Iq8V0MifpP/17xiwkvs_expires_30_days.png"
                      : "https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Iq8V0MifpP/qptl5ghs_expires_30_days.png"}
                    className="w-6 h-6 object-fill flex-shrink-0"
                  />
                  <span className="text-[#040E1B] text-base whitespace-nowrap">Detailed (with links)</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default IntegrationConfigDrawer;

