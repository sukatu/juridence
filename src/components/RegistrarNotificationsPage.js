import React, { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown, Bell, ChevronRight, Calendar, X } from 'lucide-react';
import DeleteNotificationModal from './DeleteNotificationModal';
import RegistrarHeader from './RegistrarHeader';

const RegistrarNotificationsPage = ({ userInfo, onNavigate, onLogout }) => {
  const [activeTab, setActiveTab] = useState('All');
  const [selectedPeriod, setSelectedPeriod] = useState('This week');
  const [selectedEntityType, setSelectedEntityType] = useState('Entity type');
  const [showPeriodDropdown, setShowPeriodDropdown] = useState(false);
  const [showEntityTypeDropdown, setShowEntityTypeDropdown] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [notificationToDelete, setNotificationToDelete] = useState(null);
  const periodDropdownRef = useRef(null);
  const entityTypeDropdownRef = useRef(null);

  // Use userInfo from props or localStorage
  const displayUserInfo = userInfo || JSON.parse(localStorage.getItem('userData') || '{}');

  // Sample notifications data
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'approval',
      title: 'New approval',
      message: 'Admin approved Gazette #GZ-1079',
      timestamp: 'Just now',
      read: false,
      icon: '⚠️'
    },
    {
      id: 2,
      type: 'case',
      title: 'New Case Filed Against: Meridian Properties',
      message: 'A new case was filed against Meridian Properties by EcoWind Corp. The case was filed on the grounds of trespassing.',
      filed: 'High Court, Accra – Nov 12, 2025',
      role: 'Defendant',
      timestamp: '11 min',
      read: false,
      icon: '⚠️'
    },
    {
      id: 3,
      type: 'gazette',
      title: 'Gazette Update: BlueRock Mining Ltd',
      message: 'A new Gazette was published today by Registrar Ben Nyango where it was stated that BlueRock Mining limited changed their warehouse location from Kumasi to Greater Accra Region.',
      gazetteType: 'Change of Warehouse location',
      timestamp: '2 days ago',
      read: false,
      icon: '⚠️'
    },
    {
      id: 4,
      type: 'case',
      title: 'New Case Filed Against: Meridian Properties',
      message: 'A new case was filed against Meridian Properties by EcoWind Corp. The case was filed on the grounds of trespassing.',
      filed: 'High Court, Accra – Nov 12, 2025',
      role: 'Defendant',
      timestamp: '3 days ago',
      read: true,
      icon: '⚠️'
    }
  ]);

  // Handle click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (periodDropdownRef.current && !periodDropdownRef.current.contains(event.target)) {
        setShowPeriodDropdown(false);
      }
      if (entityTypeDropdownRef.current && !entityTypeDropdownRef.current.contains(event.target)) {
        setShowEntityTypeDropdown(false);
      }
    };

    if (showPeriodDropdown || showEntityTypeDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showPeriodDropdown, showEntityTypeDropdown]);

  // Filter notifications based on active tab
  const filteredNotifications = notifications.filter(notification => {
    if (activeTab === 'Unread') {
      return !notification.read;
    }
    if (activeTab === 'Read') {
      return notification.read;
    }
    return true; // 'All'
  });

  const handleMarkAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const handleClearAll = () => {
    setNotifications([]);
  };

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

  return (
    <div className="bg-[#F7F8FA] min-h-screen w-full">
      {/* Header */}
      <RegistrarHeader userInfo={displayUserInfo} onNavigate={onNavigate} onLogout={onLogout} />
      
      {/* Page Title Section */}
      <div className="px-6 mb-4 pb-2 border-b border-[#D4E1EA]">
        <div className="flex flex-col items-start gap-1">
          <span className="text-[#050F1C] text-xl font-medium">High Court (Commercial),</span>
          <span className="text-[#050F1C] text-base opacity-75">Track all your activities here.</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-6 w-full">
        <div className="flex flex-col bg-white p-4 gap-10 rounded-lg w-full min-h-[930px]">
          <div className="flex flex-col gap-4">
            {/* Breadcrumb */}
            <span className="text-[#525866] text-xs opacity-75">NOTIFICATIONS</span>

            {/* Back Button and Filters */}
            <div className="flex justify-between items-center">
              <button className="w-fit p-2 bg-[#F7F8FA] rounded-lg cursor-pointer hover:opacity-70">
                <ChevronRight className="w-6 h-6 text-[#050F1C] rotate-180" />
              </button>
              <div className="flex items-center gap-6">
                <span className="text-[#525866] text-xs opacity-75">Show data for</span>
                <div className="relative" ref={periodDropdownRef}>
                  <button
                    onClick={() => {
                      setShowPeriodDropdown(!showPeriodDropdown);
                      setShowEntityTypeDropdown(false);
                    }}
                    className="px-2 py-2 bg-[#F7F8FA] rounded-lg border border-[#D4E1EA] flex items-center gap-1"
                  >
                    <Calendar className="w-4 h-4 text-[#7B8794]" />
                    <span className="text-[#070810] text-sm">{selectedPeriod}</span>
                    <ChevronDown className="w-4 h-4 text-[#525866]" />
                  </button>
                  {showPeriodDropdown && (
                    <div className="absolute right-0 mt-1 bg-white border border-[#D4E1EA] rounded-lg shadow-lg z-10 min-w-[150px]">
                      <div 
                        onClick={() => {
                          setSelectedPeriod('This week');
                          setShowPeriodDropdown(false);
                        }}
                        className="px-3 py-2 text-xs text-[#525866] hover:bg-gray-50 cursor-pointer"
                      >
                        This week
                      </div>
                      <div 
                        onClick={() => {
                          setSelectedPeriod('This month');
                          setShowPeriodDropdown(false);
                        }}
                        className="px-3 py-2 text-xs text-[#525866] hover:bg-gray-50 cursor-pointer"
                      >
                        This month
                      </div>
                      <div 
                        onClick={() => {
                          setSelectedPeriod('All time');
                          setShowPeriodDropdown(false);
                        }}
                        className="px-3 py-2 text-xs text-[#525866] hover:bg-gray-50 cursor-pointer"
                      >
                        All time
                      </div>
                    </div>
                  )}
                </div>
                <div className="relative" ref={entityTypeDropdownRef}>
                  <button
                    onClick={() => {
                      setShowEntityTypeDropdown(!showEntityTypeDropdown);
                      setShowPeriodDropdown(false);
                    }}
                    className="px-2 py-2 bg-[#F7F8FA] rounded-lg border border-[#D4E1EA] flex items-center gap-1"
                  >
                    <span className="text-[#070810] text-sm">{selectedEntityType}</span>
                    <ChevronDown className="w-4 h-4 text-[#525866]" />
                  </button>
                  {showEntityTypeDropdown && (
                    <div className="absolute right-0 mt-1 bg-white border border-[#D4E1EA] rounded-lg shadow-lg z-10 min-w-[150px]">
                      <div 
                        onClick={() => {
                          setSelectedEntityType('All');
                          setShowEntityTypeDropdown(false);
                        }}
                        className="px-3 py-2 text-xs text-[#525866] hover:bg-gray-50 cursor-pointer"
                      >
                        All
                      </div>
                      <div 
                        onClick={() => {
                          setSelectedEntityType('Cases');
                          setShowEntityTypeDropdown(false);
                        }}
                        className="px-3 py-2 text-xs text-[#525866] hover:bg-gray-50 cursor-pointer"
                      >
                        Cases
                      </div>
                      <div 
                        onClick={() => {
                          setSelectedEntityType('Gazette');
                          setShowEntityTypeDropdown(false);
                        }}
                        className="px-3 py-2 text-xs text-[#525866] hover:bg-gray-50 cursor-pointer"
                      >
                        Gazette
                      </div>
                      <div 
                        onClick={() => {
                          setSelectedEntityType('Approvals');
                          setShowEntityTypeDropdown(false);
                        }}
                        className="px-3 py-2 text-xs text-[#525866] hover:bg-gray-50 cursor-pointer"
                      >
                        Approvals
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Tabs and Actions */}
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4 px-1 pb-2">
                <button
                  onClick={() => setActiveTab('All')}
                  className={`pb-2 px-0 text-base transition-colors ${
                    activeTab === 'All'
                      ? 'text-[#022658] border-b-4 border-[#022658] font-bold'
                      : 'text-[#525866] font-normal'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setActiveTab('Unread')}
                  className={`pb-2 px-0 text-base transition-colors ${
                    activeTab === 'Unread'
                      ? 'text-[#022658] border-b-4 border-[#022658] font-bold'
                      : 'text-[#525866] font-normal'
                  }`}
                >
                  Unread
                </button>
                <button
                  onClick={() => setActiveTab('Read')}
                  className={`pb-2 px-0 text-base transition-colors ${
                    activeTab === 'Read'
                      ? 'text-[#022658] border-b-4 border-[#022658] font-bold'
                      : 'text-[#525866] font-normal'
                  }`}
                >
                  Read
                </button>
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={handleMarkAllAsRead}
                  className="text-[#F59E0B] text-xs font-medium hover:opacity-70 transition-opacity"
                >
                  <span style={{ fontFamily: 'Satoshi' }}>Mark All As Read</span>
                </button>
                <button
                  onClick={handleClearAll}
                  className="text-[#EF4444] text-xs font-medium hover:opacity-70 transition-opacity"
                >
                  <span style={{ fontFamily: 'Satoshi' }}>Clear All</span>
                </button>
              </div>
            </div>

            {/* Notifications List */}
            <div className="flex flex-col gap-0">
              {filteredNotifications.map((notification, index, array) => (
                <div
                  key={notification.id}
                  className={`flex items-start gap-6 py-2 px-0 w-full ${
                    index < array.length - 1 ? 'border-b border-[#D4E1EA]' : ''
                  }`}
                >
                  <div className="flex-1 flex items-start gap-2">
                    <div className="p-2 bg-[#F7F8FA] rounded-lg flex-shrink-0">
                      <div className="w-4 h-4 border border-[#525866] rounded"></div>
                    </div>
                    <div className="flex-1 flex flex-col gap-1.5">
                      <div className="flex items-center gap-1">
                        <span className="text-[#F59E0B] text-[13px] font-medium leading-5">{notification.icon}</span>
                        <span className="text-[#050F1C] text-[13px] font-medium leading-5">{notification.title}</span>
                      </div>
                      <div className="flex flex-col gap-1 pr-[95px]">
                        {notification.type === 'approval' && (
                          <>
                            <div className="text-[#050F1C] text-sm font-normal">{notification.message}</div>
                            <div className="text-[#525866] text-xs font-medium">{notification.timestamp}</div>
                          </>
                        )}
                        {notification.type === 'case' && (
                          <>
                            <div className="flex items-center gap-1">
                              <span className="text-[#10B981] text-sm font-normal">Filed:</span>
                              <span className="text-[#525866] text-sm font-normal">{notification.filed}</span>
                            </div>
                            <div className="text-[#050F1C] text-sm font-normal">{notification.message}</div>
                            <div className="flex items-center gap-1">
                              <span className="text-[#EF4444] text-sm font-normal">Role:</span>
                              <span className="text-[#525866] text-sm font-normal">{notification.role}</span>
                            </div>
                            <div className="text-[#525866] text-xs font-medium">{notification.timestamp}</div>
                          </>
                        )}
                        {notification.type === 'gazette' && (
                          <>
                            <div className="text-[#050F1C] text-sm font-normal">{notification.message}</div>
                            <div className="flex items-center gap-1">
                              <span className="text-[#10B981] text-sm font-normal">Type:</span>
                              <span className="text-[#525866] text-sm font-normal">{notification.gazetteType}</span>
                            </div>
                            <div className="text-[#525866] text-xs font-medium">{notification.timestamp}</div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteClick(notification)}
                    className="w-5 h-5 flex items-center justify-center flex-shrink-0 hover:opacity-70 transition-opacity"
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
      <DeleteNotificationModal
        isOpen={showDeleteModal}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        notificationTitle={notificationToDelete ? `${notificationToDelete.icon} ${notificationToDelete.title}` : ''}
      />
    </div>
  );
};

export default RegistrarNotificationsPage;

