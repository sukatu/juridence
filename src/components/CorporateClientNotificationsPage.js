import React, { useState } from 'react';
import { Bell, ChevronRight, ChevronLeft, X, Calendar, Filter } from 'lucide-react';
import CorporateClientHeader from './CorporateClientHeader';

const CorporateClientNotificationsPage = ({ userInfo, onNavigate, onLogout }) => {
  const [activeTab, setActiveTab] = useState('All');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [notificationToDelete, setNotificationToDelete] = useState(null);
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'case',
      title: 'New Case Filed Against: Meridian Properties',
      filed: 'High Court, Accra – Nov 12, 2025',
      description: 'A new case was filed against Meridian Properties by EcoWind Corp. The case was filed on the grounds of trespassing.',
      role: 'Defendant',
      time: '11 min',
      read: false
    },
    {
      id: 2,
      type: 'gazette',
      title: 'Gazette Update: BlueRock Mining Ltd',
      description: 'A new Gazette was published 2 days ago where it was stated that BlueRock Mining limited changed their warehouse location from Kumasi to Greater Accra Region.',
      typeLabel: 'Change of Warehouse location',
      time: '11 min',
      read: false
    },
    {
      id: 3,
      type: 'case',
      title: 'New Case Filed Against: Meridian Properties',
      filed: 'High Court, Accra – Nov 12, 2025',
      description: 'A new case was filed against Meridian Properties by EcoWind Corp. The case was filed on the grounds of trespassing.',
      role: 'Defendant',
      time: '11 min',
      read: true
    }
  ]);

  // Use userInfo from props or localStorage
  const displayUserInfo = userInfo || JSON.parse(localStorage.getItem('userData') || '{}');
  const organizationName = displayUserInfo?.organization || 'Access Bank';

  const filteredNotifications = notifications.filter(notification => {
    if (activeTab === 'Unread') return !notification.read;
    if (activeTab === 'Read') return notification.read;
    return true;
  });

  const handleDeleteClick = (notification) => {
    setNotificationToDelete(notification);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = () => {
    if (notificationToDelete) {
      setNotifications(prev => prev.filter(n => n.id !== notificationToDelete.id));
      setShowDeleteModal(false);
      setNotificationToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setNotificationToDelete(null);
  };

  const handleMarkAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const handleClearAll = () => {
    setNotifications([]);
  };

  return (
    <div className="flex-1 bg-[#F7F8FA] pr-6 rounded-lg">
      <div className="flex items-start gap-6">
        {/* Main Content */}
        <div className="flex-1 flex flex-col bg-[#F7F8FA] pt-2 pb-[52px] gap-4">
          {/* Header */}
          <CorporateClientHeader userInfo={displayUserInfo} onNavigate={onNavigate} onLogout={onLogout} />
          
          {/* Page Title Section */}
          <div className="px-1.5 pb-2 border-b border-[#D4E1EA]">
            <div className="flex flex-col items-start w-[263px] gap-1">
              <span className="text-[#050F1C] text-xl font-medium">
                {organizationName},
              </span>
              <span className="text-[#050F1C] text-base font-normal opacity-75">
                Track all your activities here.
              </span>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 p-4 bg-white rounded-lg flex flex-col gap-10">
            {/* Breadcrumb and Back Button */}
            <div className="flex items-center justify-between">
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-1">
                  <span className="text-[#525866] text-xs opacity-75 font-normal">NOTIFICATIONS</span>
                </div>
                <button className="p-2 bg-[#F7F8FA] rounded-lg w-fit">
                  <ChevronLeft className="w-6 h-6 text-[#050F1C]" />
                </button>
              </div>

              {/* Filter Controls */}
              <div className="flex items-center gap-6">
                <span className="text-[#525866] text-xs opacity-75 font-normal">Show data for</span>
                <div className="px-2 py-2 bg-[#F7F8FA] rounded-lg border border-[#D4E1EA] flex items-center gap-1 cursor-pointer">
                  <Calendar className="w-4 h-4 text-[#7B8794]" />
                  <span className="text-[#070810] text-sm font-normal" style={{ fontFamily: 'Roboto' }}>This week</span>
                  <ChevronRight className="w-4 h-4 text-[#525866] rotate-90" />
                </div>
                <div className="px-2 py-2 bg-[#F7F8FA] rounded-lg border border-[#D4E1EA] flex items-center gap-1 cursor-pointer">
                  <span className="text-[#070810] text-sm font-normal" style={{ fontFamily: 'Roboto' }}>Entity type</span>
                  <ChevronRight className="w-4 h-4 text-[#525866] rotate-90" />
                </div>
              </div>
            </div>

            {/* Tabs and Action Buttons */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 border-b border-[#E4E7EB]">
                <button
                  onClick={() => setActiveTab('All')}
                  className={`pb-2 px-2 ${activeTab === 'All' ? 'border-b-4 border-[#022658] text-[#022658] font-bold' : 'text-[#525866] font-normal'}`}
                >
                  <span className="text-base" style={{ fontFamily: 'Satoshi' }}>All</span>
                </button>
                <button
                  onClick={() => setActiveTab('Unread')}
                  className={`pb-2 px-2 ${activeTab === 'Unread' ? 'border-b-4 border-[#022658] text-[#022658] font-bold' : 'text-[#525866] font-normal'}`}
                >
                  <span className="text-base" style={{ fontFamily: 'Satoshi' }}>Unread</span>
                </button>
                <button
                  onClick={() => setActiveTab('Read')}
                  className={`pb-2 px-2 ${activeTab === 'Read' ? 'border-b-4 border-[#022658] text-[#022658] font-bold' : 'text-[#525866] font-normal'}`}
                >
                  <span className="text-base" style={{ fontFamily: 'Satoshi' }}>Read</span>
                </button>
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={handleMarkAllAsRead}
                  className="text-[#F59E0B] text-xs font-medium hover:opacity-70"
                  style={{ fontFamily: 'Satoshi' }}
                >
                  Mark all as read
                </button>
                <button
                  onClick={handleClearAll}
                  className="text-[#EF4444] text-xs font-medium hover:opacity-70"
                  style={{ fontFamily: 'Satoshi' }}
                >
                  Clear All
                </button>
              </div>
            </div>

            {/* Notifications List */}
            <div className="flex flex-col gap-0">
              {filteredNotifications.map((notification, index, array) => (
                <div
                  key={notification.id}
                  className="flex items-start gap-6 py-2 px-0"
                  style={{
                    borderBottom: index < array.length - 1 ? '1px solid #D4E1EA' : 'none'
                  }}
                >
                  {/* Bell Icon */}
                  <div className="p-2 bg-[#F7F8FA] rounded-lg flex-shrink-0">
                    <Bell className="w-4 h-4 text-[#525866]" />
                  </div>

                  {/* Notification Content */}
                  <div className="flex-1 flex flex-col gap-1.5 pr-[95px]">
                    {/* Title */}
                    <div className="flex items-center gap-1">
                      <span className="text-[#F59E0B] text-[13px] font-medium" style={{ fontFamily: 'Inter', lineHeight: '20px' }}>⚠️</span>
                      <span className="text-[#050F1C] text-[13px] font-medium" style={{ fontFamily: 'Inter', lineHeight: '20px' }}>
                        {notification.title}
                      </span>
                    </div>

                    {/* Details */}
                    <div className="flex flex-col gap-1">
                      {notification.type === 'case' && (
                        <>
                          <div>
                            <span className="text-[#10B981] text-sm font-normal" style={{ fontFamily: 'Satoshi' }}>Filed:</span>
                            <span className="text-[#525866] text-sm font-normal" style={{ fontFamily: 'Satoshi' }}> {notification.filed}</span>
                          </div>
                          <p className="text-[#050F1C] text-sm font-normal" style={{ fontFamily: 'Satoshi' }}>
                            {notification.description}
                          </p>
                          <div>
                            <span className="text-[#EF4444] text-sm font-normal" style={{ fontFamily: 'Satoshi' }}>Role: </span>
                            <span className="text-[#525866] text-sm font-normal" style={{ fontFamily: 'Satoshi' }}>{notification.role}</span>
                          </div>
                        </>
                      )}
                      {notification.type === 'gazette' && (
                        <>
                          <p className="text-[#050F1C] text-sm font-normal" style={{ fontFamily: 'Satoshi' }}>
                            {notification.description}
                          </p>
                          <div>
                            <span className="text-[#10B981] text-sm font-normal" style={{ fontFamily: 'Satoshi' }}>Type:</span>
                            <span className="text-[#525866] text-sm font-normal" style={{ fontFamily: 'Satoshi' }}> {notification.typeLabel}</span>
                          </div>
                        </>
                      )}
                      <span className="text-[#525866] text-xs font-medium" style={{ fontFamily: 'Satoshi' }}>
                        {notification.time}
                      </span>
                    </div>
                  </div>

                  {/* Delete Button */}
                  <button
                    onClick={() => handleDeleteClick(notification)}
                    className="p-1 hover:bg-red-50 rounded flex-shrink-0"
                  >
                    <X className="w-5 h-5 text-[#EF4444]" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && notificationToDelete && (
        <div className="fixed inset-0 bg-[rgba(4.60,14.87,27.60,0.50)] backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="p-8 bg-white rounded-lg flex flex-col items-center gap-6 max-w-md w-full mx-4">
            {/* Close Button */}
            <div className="w-full flex justify-end">
              <button
                onClick={handleCancelDelete}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="w-6 h-6 text-[#050F1C]" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex flex-col items-center gap-8 w-full">
              <div className="flex flex-col items-center gap-2 w-full">
                <p className="text-[#050F1C] text-lg font-normal text-center" style={{ fontFamily: 'Poppins' }}>
                  Are you sure you want to delete this message?
                </p>
                <p className="text-[#525866] text-sm font-normal text-center" style={{ fontFamily: 'Satoshi' }}>
                  ⚠️ {notificationToDelete.title}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-start gap-10 w-full">
                <button
                  onClick={handleCancelDelete}
                  className="flex-1 h-[58px] px-2.5 shadow-md rounded-lg border-2 border-[#4CAF50] flex items-center justify-center gap-2.5"
                >
                  <span className="text-[#10B981] text-base font-bold" style={{ fontFamily: 'Satoshi' }}>Cancel</span>
                </button>
                <button
                  onClick={handleConfirmDelete}
                  className="flex-1 h-[58px] px-2.5 bg-gradient-to-b from-[#EF4444] to-[#B11E1E] shadow-md rounded-lg border-4 border-[rgba(239,68,68,0.15)] flex items-center justify-center gap-2.5"
                >
                  <span className="text-white text-base font-bold" style={{ fontFamily: 'Satoshi' }}>Delete</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CorporateClientNotificationsPage;

