import React, { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown, Bell, Eye, EyeOff } from 'lucide-react';
import RegistrarHeader from './RegistrarHeader';

const RegistrarSystemSettingsPage = ({ userInfo, onNavigate, onLogout }) => {
  const [activeTab, setActiveTab] = useState('Profile');
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [showCourtDropdown, setShowCourtDropdown] = useState(false);
  const [showPhoneCountryDropdown, setShowPhoneCountryDropdown] = useState(false);
  const countryDropdownRef = useRef(null);
  const courtDropdownRef = useRef(null);
  const phoneCountryDropdownRef = useRef(null);

  // Use userInfo from props or localStorage
  const displayUserInfo = userInfo || JSON.parse(localStorage.getItem('userData') || '{}');
  const userName = displayUserInfo?.first_name && displayUserInfo?.last_name 
    ? `${displayUserInfo.first_name} ${displayUserInfo.last_name}` 
    : 'Ben Frimpong';
  const userEmail = displayUserInfo?.email || 'benfrimpong@gmail.com';
  const userPhone = displayUserInfo?.phone_number || '+233445556666';

  const [formData, setFormData] = useState({
    name: userName,
    email: userEmail,
    phone: userPhone,
    phoneCountry: 'GH',
    country: 'Ghana',
    court: 'High Court (Commercial)'
  });

  const [courtInfoData, setCourtInfoData] = useState({
    courtName: 'High Court (Commercial)',
    courtMail: 'highcourtcommercialaccra@gmail.com',
    phone: '+233998887777',
    phoneCountry: 'GH',
    country: 'Ghana'
  });

  const [showCourtInfoCountryDropdown, setShowCourtInfoCountryDropdown] = useState(false);
  const [showCourtInfoPhoneCountryDropdown, setShowCourtInfoPhoneCountryDropdown] = useState(false);
  const courtInfoCountryDropdownRef = useRef(null);
  const courtInfoPhoneCountryDropdownRef = useRef(null);

  // Notification preferences state
  const [notificationChannels, setNotificationChannels] = useState({
    inApp: true,
    email: false
  });

  const [notificationPreferences, setNotificationPreferences] = useState({
    newCaseRecords: false,
    gazetteApprovals: false,
    tasksDue: false,
    hearingSchedules: false,
    systemAnnouncements: false,
    entityStatusChange: false
  });

  // Preferences state
  const [preferences, setPreferences] = useState({
    language: 'English',
    dataRetention: '3 months',
    backupFrequency: '2 weeks',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '12-hour',
    defaultFormat: 'PDF',
    autoSave: 'Every 30 seconds'
  });

  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const languageDropdownRef = useRef(null);

  // Account & Security state
  const [showPasswordForm, setShowPasswordForm] = useState(false); // Collapsed by default
  const [showActiveSessions, setShowActiveSessions] = useState(false); // Collapsed by default
  const [showEnable2FA, setShowEnable2FA] = useState(false); // Collapsed by default
  const [showChange2FAMethod, setShowChange2FAMethod] = useState(false); // Collapsed by default
  const [showDisable2FA, setShowDisable2FA] = useState(true); // Expanded by default
  const [selected2FAMethod, setSelected2FAMethod] = useState('pin');
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showPIN, setShowPIN] = useState(false);
  const [showConfirmPIN, setShowConfirmPIN] = useState(false);
  const [showDisablePassword, setShowDisablePassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: ''
  });
  const [pinData, setPinData] = useState({
    pin: '',
    confirmPin: ''
  });
  const [disablePassword, setDisablePassword] = useState('');
  const [activeSessions, setActiveSessions] = useState(['chrome-mac', 'chrome-windows']); // Both sessions active by default

  const handleToggleSession = (sessionId) => {
    setActiveSessions(prev => 
      prev.includes(sessionId)
        ? prev.filter(id => id !== sessionId)
        : [...prev, sessionId]
    );
  };

  // Handle click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (countryDropdownRef.current && !countryDropdownRef.current.contains(event.target)) {
        setShowCountryDropdown(false);
      }
      if (courtDropdownRef.current && !courtDropdownRef.current.contains(event.target)) {
        setShowCourtDropdown(false);
      }
      if (phoneCountryDropdownRef.current && !phoneCountryDropdownRef.current.contains(event.target)) {
        setShowPhoneCountryDropdown(false);
      }
      if (courtInfoCountryDropdownRef.current && !courtInfoCountryDropdownRef.current.contains(event.target)) {
        setShowCourtInfoCountryDropdown(false);
      }
      if (courtInfoPhoneCountryDropdownRef.current && !courtInfoPhoneCountryDropdownRef.current.contains(event.target)) {
        setShowCourtInfoPhoneCountryDropdown(false);
      }
      if (languageDropdownRef.current && !languageDropdownRef.current.contains(event.target)) {
        setShowLanguageDropdown(false);
      }
    };

    if (showCountryDropdown || showCourtDropdown || showPhoneCountryDropdown || showCourtInfoCountryDropdown || showCourtInfoPhoneCountryDropdown || showLanguageDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showCountryDropdown, showCourtDropdown, showPhoneCountryDropdown, showCourtInfoCountryDropdown, showCourtInfoPhoneCountryDropdown, showLanguageDropdown]);

  const countries = ['Ghana', 'Nigeria', 'Kenya', 'South Africa', 'Tanzania'];
  const courts = ['High Court (Commercial)', 'Supreme Court', 'Court of Appeal', 'Circuit Court', 'District Court'];
  const phoneCountries = [
    { code: 'GH', flag: '🇬🇭', dial: '+233' },
    { code: 'NG', flag: '🇳🇬', dial: '+234' },
    { code: 'KE', flag: '🇰🇪', dial: '+254' }
  ];

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
        <div className="flex flex-col bg-white p-4 gap-6 rounded-lg w-full min-h-[914px]">
          <div className="flex flex-col gap-6">
            {/* Breadcrumb */}
            <span className="text-[#525866] text-xs opacity-75">SYSTEM SETTINGS</span>

            {/* Tabs */}
            <div className="flex items-center gap-4 px-1 pb-2">
              <button
                onClick={() => setActiveTab('Profile')}
                className={`pb-2 px-0 text-base transition-colors ${
                  activeTab === 'Profile'
                    ? 'text-[#022658] border-b-4 border-[#022658] font-bold'
                    : 'text-[#525866] font-normal'
                }`}
              >
                Profile
              </button>
              <button
                onClick={() => setActiveTab('Court information')}
                className={`pb-2 px-0 text-base transition-colors ${
                  activeTab === 'Court information'
                    ? 'text-[#022658] border-b-4 border-[#022658] font-bold'
                    : 'text-[#525866] font-normal'
                }`}
              >
                Court information
              </button>
              <button
                onClick={() => setActiveTab('Notifications')}
                className={`pb-2 px-0 text-base transition-colors ${
                  activeTab === 'Notifications'
                    ? 'text-[#022658] border-b-4 border-[#022658] font-bold'
                    : 'text-[#525866] font-normal'
                }`}
              >
                Notifications
              </button>
              <button
                onClick={() => setActiveTab('Preferences')}
                className={`pb-2 px-0 text-base transition-colors ${
                  activeTab === 'Preferences'
                    ? 'text-[#022658] border-b-4 border-[#022658] font-bold'
                    : 'text-[#525866] font-normal'
                }`}
              >
                Preferences
              </button>
              <button
                onClick={() => setActiveTab('Account & Security')}
                className={`pb-2 px-0 text-base transition-colors ${
                  activeTab === 'Account & Security'
                    ? 'text-[#022658] border-b-4 border-[#022658] font-bold'
                    : 'text-[#525866] font-normal'
                }`}
              >
                Account & Security
              </button>
            </div>

            {/* Profile Tab Content */}
            {activeTab === 'Profile' && (
              <div className="flex flex-col gap-6">
                {/* Section Header */}
                <div className="flex flex-col gap-2">
                  <span className="text-[#050F1C] text-xl font-normal">Personal information</span>
                  <span className="text-[#050F1C] text-base font-normal">Update your photo and personal details here</span>
                </div>

                <div className="flex flex-col gap-8">
                  {/* Photo Section */}
                  <div className="flex flex-col items-center gap-6">
                    <div className="flex flex-col items-center gap-2">
                      <img
                        src={userInfo?.profile_picture || '/images/image.png'}
                        alt="Profile"
                        className="w-20 h-20 rounded-full object-cover"
                        onError={(e) => {
                          e.target.src = '/images/image.png';
                        }}
                      />
                      <span className="text-[#050F1C] text-xl font-bold">{formData.name}</span>
                    </div>
                    <div className="flex flex-col items-center gap-3">
                      <button
                        className="w-full h-8 px-2.5 py-2.5 rounded-lg border-2 border-[#0F2847] text-[#022658] text-xs font-bold hover:opacity-90 transition-opacity"
                        style={{ boxShadow: '0px 4px 4px rgba(5, 15, 28, 0.10)' }}
                      >
                        Edit
                      </button>
                      <span className="text-[#525866] text-sm text-center">At least 256px x 256px</span>
                    </div>
                  </div>

                  {/* Form Fields */}
                  <div className="flex flex-col gap-20">
                    <div className="flex flex-col gap-6">
                      {/* Name and Email */}
                      <div className="flex gap-6">
                        <div className="flex-1 flex flex-col gap-2">
                          <span className="text-[#050F1C] text-sm font-normal">Name</span>
                          <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-4 py-4 bg-[#F7F8FA] rounded-lg text-[#050F1C] text-base font-medium outline-none focus:ring-2 focus:ring-[#022658]"
                          />
                        </div>
                        <div className="flex-1 flex flex-col gap-2">
                          <span className="text-[#050F1C] text-sm font-normal">Email</span>
                          <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="w-full px-4 py-4 bg-[#F7F8FA] rounded-lg text-[#050F1C] text-base font-medium outline-none focus:ring-2 focus:ring-[#022658]"
                          />
                        </div>
                      </div>

                      {/* Phone and Country */}
                      <div className="flex gap-6">
                        <div className="flex-1 flex flex-col gap-2 relative" ref={phoneCountryDropdownRef}>
                          <span className="text-[#050F1C] text-sm font-normal">Phone</span>
                          <div className="w-full h-12 px-4 py-3 bg-[#F7F8FA] rounded-lg flex items-center gap-1">
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => {
                                  setShowPhoneCountryDropdown(!showPhoneCountryDropdown);
                                  setShowCountryDropdown(false);
                                  setShowCourtDropdown(false);
                                }}
                                className="flex items-center gap-1"
                              >
                                <span className="text-base">{phoneCountries.find(c => c.code === formData.phoneCountry)?.flag || '🇬🇭'}</span>
                                <ChevronDown className="w-4 h-4 text-[#141B34]" />
                              </button>
                              <span className="text-[#022658] text-sm">|</span>
                            </div>
                            <input
                              type="tel"
                              value={formData.phone}
                              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                              className="flex-1 bg-transparent text-[#050F1C] text-base font-medium outline-none"
                              placeholder="+233445556666"
                            />
                            {showPhoneCountryDropdown && (
                              <div className="absolute top-full left-0 mt-1 bg-white border border-[#D4E1EA] rounded-lg shadow-lg z-10 min-w-[150px]">
                                {phoneCountries.map((country) => (
                                  <div
                                    key={country.code}
                                    onClick={() => {
                                      setFormData({ ...formData, phoneCountry: country.code });
                                      setShowPhoneCountryDropdown(false);
                                    }}
                                    className="px-3 py-2 text-sm text-[#525866] hover:bg-gray-50 cursor-pointer flex items-center gap-2"
                                  >
                                    <span>{country.flag}</span>
                                    <span>{country.dial}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex-1 flex flex-col gap-2 relative" ref={countryDropdownRef}>
                          <span className="text-[#050F1C] text-sm font-normal">Country</span>
                          <button
                            onClick={() => {
                              setShowCountryDropdown(!showCountryDropdown);
                              setShowCourtDropdown(false);
                              setShowPhoneCountryDropdown(false);
                            }}
                            className="w-full px-4 py-4 bg-[#F7F8FA] rounded-lg flex justify-between items-center text-[#050F1C] text-base font-medium"
                          >
                            <span>{formData.country}</span>
                            <ChevronDown className="w-4 h-4 text-[#050F1C] rotate-90" />
                          </button>
                          {showCountryDropdown && (
                            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#D4E1EA] rounded-lg shadow-lg z-10">
                              {countries.map((country) => (
                                <div
                                  key={country}
                                  onClick={() => {
                                    setFormData({ ...formData, country });
                                    setShowCountryDropdown(false);
                                  }}
                                  className="px-4 py-2 text-sm text-[#525866] hover:bg-gray-50 cursor-pointer"
                                >
                                  {country}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Court */}
                      <div className="flex flex-col gap-2 relative" ref={courtDropdownRef}>
                        <span className="text-[#050F1C] text-sm font-normal">Court</span>
                        <button
                          onClick={() => {
                            setShowCourtDropdown(!showCourtDropdown);
                            setShowCountryDropdown(false);
                            setShowPhoneCountryDropdown(false);
                          }}
                          className="w-full px-4 py-4 bg-[#F7F8FA] rounded-lg flex justify-between items-center text-[#050F1C] text-base font-medium"
                        >
                          <span>{formData.court}</span>
                          <ChevronDown className="w-4 h-4 text-[#050F1C] rotate-90" />
                        </button>
                        {showCourtDropdown && (
                          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#D4E1EA] rounded-lg shadow-lg z-10">
                            {courts.map((court) => (
                              <div
                                key={court}
                                onClick={() => {
                                  setFormData({ ...formData, court });
                                  setShowCourtDropdown(false);
                                }}
                                className="px-4 py-2 text-sm text-[#525866] hover:bg-gray-50 cursor-pointer"
                              >
                                {court}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-10">
                      <button
                        className="flex-1 h-[58px] px-2.5 rounded-lg border-2 border-[#0F2847] text-[#022658] text-base font-bold hover:opacity-90 transition-opacity"
                        style={{ boxShadow: '0px 4px 4px rgba(5, 15, 28, 0.10)' }}
                      >
                        <span style={{ fontFamily: 'Satoshi' }}>Cancel Changes</span>
                      </button>
                      <button
                        className="flex-1 h-[58px] px-2.5 rounded-lg border-4 border-[#0F284726] text-white text-base font-bold hover:opacity-90 transition-opacity"
                        style={{
                          background: 'linear-gradient(180deg, #022658 43%, #1A4983 100%)',
                          boxShadow: '0px 4px 4px rgba(5, 15, 28, 0.10)',
                          outline: '4px solid rgba(15, 40, 71, 0.15)'
                        }}
                      >
                        <span style={{ fontFamily: 'Satoshi' }}>Save Changes</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Court information Tab Content */}
            {activeTab === 'Court information' && (
              <div className="flex flex-col gap-8">
                <div className="flex flex-col gap-20">
                  <div className="flex flex-col gap-6">
                    {/* Court name and Court mail */}
                    <div className="flex gap-6">
                      <div className="flex-1 flex flex-col gap-2">
                        <span className="text-[#050F1C] text-sm font-normal">Court name</span>
                        <input
                          type="text"
                          value={courtInfoData.courtName}
                          onChange={(e) => setCourtInfoData({ ...courtInfoData, courtName: e.target.value })}
                          className="w-full px-4 py-4 bg-[#F7F8FA] rounded-lg text-[#050F1C] text-base font-medium outline-none focus:ring-2 focus:ring-[#022658]"
                        />
                      </div>
                      <div className="flex-1 flex flex-col gap-2">
                        <span className="text-[#050F1C] text-sm font-normal">Court mail</span>
                        <input
                          type="email"
                          value={courtInfoData.courtMail}
                          onChange={(e) => setCourtInfoData({ ...courtInfoData, courtMail: e.target.value })}
                          className="w-full px-4 py-4 bg-[#F7F8FA] rounded-lg text-[#050F1C] text-base font-medium outline-none focus:ring-2 focus:ring-[#022658]"
                        />
                      </div>
                    </div>

                    {/* Phone and Country */}
                    <div className="flex gap-6">
                      <div className="flex-1 flex flex-col gap-2 relative" ref={courtInfoPhoneCountryDropdownRef}>
                        <span className="text-[#050F1C] text-sm font-normal">Phone</span>
                        <div className="w-full h-12 px-4 py-3 bg-[#F7F8FA] rounded-lg flex items-center gap-1">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => {
                                setShowCourtInfoPhoneCountryDropdown(!showCourtInfoPhoneCountryDropdown);
                                setShowCourtInfoCountryDropdown(false);
                                setShowCountryDropdown(false);
                                setShowCourtDropdown(false);
                                setShowPhoneCountryDropdown(false);
                              }}
                              className="flex items-center gap-1"
                            >
                              <span className="text-base">{phoneCountries.find(c => c.code === courtInfoData.phoneCountry)?.flag || '🇬🇭'}</span>
                              <ChevronDown className="w-4 h-4 text-[#141B34]" />
                            </button>
                            <span className="text-[#022658] text-sm">|</span>
                          </div>
                          <input
                            type="tel"
                            value={courtInfoData.phone}
                            onChange={(e) => setCourtInfoData({ ...courtInfoData, phone: e.target.value })}
                            className="flex-1 bg-transparent text-[#050F1C] text-base font-medium outline-none"
                            placeholder="+233998887777"
                          />
                          {showCourtInfoPhoneCountryDropdown && (
                            <div className="absolute top-full left-0 mt-1 bg-white border border-[#D4E1EA] rounded-lg shadow-lg z-10 min-w-[150px]">
                              {phoneCountries.map((country) => (
                                <div
                                  key={country.code}
                                  onClick={() => {
                                    setCourtInfoData({ ...courtInfoData, phoneCountry: country.code });
                                    setShowCourtInfoPhoneCountryDropdown(false);
                                  }}
                                  className="px-3 py-2 text-sm text-[#525866] hover:bg-gray-50 cursor-pointer flex items-center gap-2"
                                >
                                  <span>{country.flag}</span>
                                  <span>{country.dial}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex-1 flex flex-col gap-2 relative" ref={courtInfoCountryDropdownRef}>
                        <span className="text-[#050F1C] text-sm font-normal">Country</span>
                        <button
                          onClick={() => {
                            setShowCourtInfoCountryDropdown(!showCourtInfoCountryDropdown);
                            setShowCourtInfoPhoneCountryDropdown(false);
                            setShowCountryDropdown(false);
                            setShowCourtDropdown(false);
                            setShowPhoneCountryDropdown(false);
                          }}
                          className="w-full px-4 py-4 bg-[#F7F8FA] rounded-lg flex justify-between items-center text-[#050F1C] text-base font-medium"
                        >
                          <span>{courtInfoData.country}</span>
                          <ChevronDown className="w-4 h-4 text-[#050F1C] rotate-90" />
                        </button>
                        {showCourtInfoCountryDropdown && (
                          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#D4E1EA] rounded-lg shadow-lg z-10">
                            {countries.map((country) => (
                              <div
                                key={country}
                                onClick={() => {
                                  setCourtInfoData({ ...courtInfoData, country });
                                  setShowCourtInfoCountryDropdown(false);
                                }}
                                className="px-4 py-2 text-sm text-[#525866] hover:bg-gray-50 cursor-pointer"
                              >
                                {country}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-10">
                    <button
                      className="flex-1 h-[58px] px-2.5 rounded-lg border-2 border-[#0F2847] text-[#022658] text-base font-bold hover:opacity-90 transition-opacity"
                      style={{ boxShadow: '0px 4px 4px rgba(5, 15, 28, 0.10)' }}
                    >
                      <span style={{ fontFamily: 'Satoshi' }}>Cancel Changes</span>
                    </button>
                    <button
                      className="flex-1 h-[58px] px-2.5 rounded-lg border-4 border-[#0F284726] text-white text-base font-bold hover:opacity-90 transition-opacity"
                      style={{
                        background: 'linear-gradient(180deg, #022658 43%, #1A4983 100%)',
                        boxShadow: '0px 4px 4px rgba(5, 15, 28, 0.10)',
                        outline: '4px solid rgba(15, 40, 71, 0.15)'
                      }}
                    >
                      <span style={{ fontFamily: 'Satoshi' }}>Save Changes</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Notifications Tab Content */}
            {activeTab === 'Notifications' && (
              <div className="flex flex-col gap-6 w-[440px]">
                {/* Notification Channels */}
                <div className="flex flex-col gap-2">
                  <span className="text-[#050F1C] text-base font-normal">Notification Channels</span>
                  <div className="p-4 bg-[#F7F8FA] rounded-lg flex flex-col gap-2">
                    <div className="flex items-center gap-6">
                      <div className="flex items-center gap-2">
                        <span className="text-[#050F1C] text-base font-normal">In-app</span>
                        <div className="relative">
                          <input
                            type="checkbox"
                            checked={notificationChannels.inApp}
                            onChange={(e) => setNotificationChannels({ ...notificationChannels, inApp: e.target.checked })}
                            className="w-4 h-4 rounded border-[#050F1C] text-[#022658] focus:ring-[#022658] cursor-pointer"
                          />
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[#050F1C] text-base font-normal">Email</span>
                        <div className="relative">
                          <input
                            type="checkbox"
                            checked={notificationChannels.email}
                            onChange={(e) => setNotificationChannels({ ...notificationChannels, email: e.target.checked })}
                            className="w-4 h-4 rounded border-[#050F1C] text-[#022658] focus:ring-[#022658] cursor-pointer"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Notification Preferences */}
                <div className="flex flex-col gap-2 w-[440px]">
                  <span className="text-[#525866] text-xs font-medium">Notify me on...</span>
                  <div className="flex flex-col gap-4">
                    {/* New or modified case records */}
                    <div className="flex justify-between items-center">
                      <span className="text-[#050F1C] text-base font-normal">New or modified case records</span>
                      <button
                        onClick={() => setNotificationPreferences({ ...notificationPreferences, newCaseRecords: !notificationPreferences.newCaseRecords })}
                        className={`w-14 h-6 rounded-full px-1 flex items-center transition-colors ${
                          notificationPreferences.newCaseRecords
                            ? 'bg-[#022658] justify-end'
                            : 'bg-[#868C98] justify-start'
                        }`}
                      >
                        <div className="w-4 h-4 bg-white rounded-full"></div>
                      </button>
                    </div>

                    {/* Admin approves or rejects gazette uploads */}
                    <div className="flex justify-between items-center">
                      <span className="text-[#050F1C] text-base font-normal">Admin approves or rejects gazette uploads</span>
                      <button
                        onClick={() => setNotificationPreferences({ ...notificationPreferences, gazetteApprovals: !notificationPreferences.gazetteApprovals })}
                        className={`w-14 h-6 rounded-full px-1 flex items-center transition-colors ${
                          notificationPreferences.gazetteApprovals
                            ? 'bg-[#022658] justify-end'
                            : 'bg-[#868C98] justify-start'
                        }`}
                      >
                        <div className="w-4 h-4 bg-white rounded-full"></div>
                      </button>
                    </div>

                    {/* Tasks due in the next 24 or 48 hours */}
                    <div className="flex justify-between items-center">
                      <span className="text-[#050F1C] text-base font-normal">Tasks due in the next 24 or 48 hours</span>
                      <button
                        onClick={() => setNotificationPreferences({ ...notificationPreferences, tasksDue: !notificationPreferences.tasksDue })}
                        className={`w-14 h-6 rounded-full px-1 flex items-center transition-colors ${
                          notificationPreferences.tasksDue
                            ? 'bg-[#022658] justify-end'
                            : 'bg-[#868C98] justify-start'
                        }`}
                      >
                        <div className="w-4 h-4 bg-white rounded-full"></div>
                      </button>
                    </div>

                    {/* 2 days before hearing schedules */}
                    <div className="flex justify-between items-center">
                      <span className="text-[#050F1C] text-base font-normal">2 days before hearing schedules</span>
                      <button
                        onClick={() => setNotificationPreferences({ ...notificationPreferences, hearingSchedules: !notificationPreferences.hearingSchedules })}
                        className={`w-14 h-6 rounded-full px-1 flex items-center transition-colors ${
                          notificationPreferences.hearingSchedules
                            ? 'bg-[#022658] justify-end'
                            : 'bg-[#868C98] justify-start'
                        }`}
                      >
                        <div className="w-4 h-4 bg-white rounded-full"></div>
                      </button>
                    </div>

                    {/* System announcements */}
                    <div className="flex justify-between items-center">
                      <span className="text-[#050F1C] text-base font-normal">System announcements</span>
                      <button
                        onClick={() => setNotificationPreferences({ ...notificationPreferences, systemAnnouncements: !notificationPreferences.systemAnnouncements })}
                        className={`w-14 h-6 rounded-full px-1 flex items-center transition-colors ${
                          notificationPreferences.systemAnnouncements
                            ? 'bg-[#022658] justify-end'
                            : 'bg-[#868C98] justify-start'
                        }`}
                      >
                        <div className="w-4 h-4 bg-white rounded-full"></div>
                      </button>
                    </div>

                    {/* Change of all entities status */}
                    <div className="flex justify-between items-center">
                      <span className="text-[#050F1C] text-base font-normal">Change of all entities status</span>
                      <button
                        onClick={() => setNotificationPreferences({ ...notificationPreferences, entityStatusChange: !notificationPreferences.entityStatusChange })}
                        className={`w-14 h-6 rounded-full px-1 flex items-center transition-colors ${
                          notificationPreferences.entityStatusChange
                            ? 'bg-[#022658] justify-end'
                            : 'bg-[#868C98] justify-start'
                        }`}
                      >
                        <div className="w-4 h-4 bg-white rounded-full"></div>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Preferences Tab Content */}
            {activeTab === 'Preferences' && (
              <div className="flex flex-col gap-6">
                {/* Language */}
                <div className="flex flex-col gap-2">
                  <span className="text-[#050F1C] text-sm font-normal">Language</span>
                  <div className="relative" ref={languageDropdownRef}>
                    <button
                      onClick={() => {
                        setShowLanguageDropdown(!showLanguageDropdown);
                        setShowCountryDropdown(false);
                        setShowCourtDropdown(false);
                        setShowPhoneCountryDropdown(false);
                        setShowCourtInfoCountryDropdown(false);
                        setShowCourtInfoPhoneCountryDropdown(false);
                      }}
                      className="w-full px-4 py-4 bg-[#F7F8FA] rounded-lg flex justify-between items-center"
                    >
                      <span className="text-[#050F1C] text-base font-medium">
                        {preferences.language} <span className="text-[#868C98] font-medium">(Default)</span>
                      </span>
                      <ChevronDown className="w-4 h-4 text-[#050F1C] rotate-90" />
                    </button>
                    {showLanguageDropdown && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#D4E1EA] rounded-lg shadow-lg z-10">
                        <div
                          onClick={() => {
                            setPreferences({ ...preferences, language: 'English' });
                            setShowLanguageDropdown(false);
                          }}
                          className="px-4 py-2 text-sm text-[#525866] hover:bg-gray-50 cursor-pointer"
                        >
                          English
                        </div>
                        <div
                          onClick={() => {
                            setPreferences({ ...preferences, language: 'French' });
                            setShowLanguageDropdown(false);
                          }}
                          className="px-4 py-2 text-sm text-[#525866] hover:bg-gray-50 cursor-pointer"
                        >
                          French
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Data Retention Policy */}
                <div className="flex flex-col gap-2">
                  <span className="text-[#050F1C] text-base font-normal">Data Retention Policy</span>
                  <div className="p-4 bg-[#F7F8FA] rounded-lg flex flex-col gap-2">
                    <div className="flex items-center gap-6">
                      {['3 months', '6 months', '12 months'].map((option) => (
                        <div key={option} className="flex items-center gap-2">
                          <span className="text-[#050F1C] text-base font-normal">{option}</span>
                          <input
                            type="radio"
                            name="dataRetention"
                            checked={preferences.dataRetention === option}
                            onChange={() => setPreferences({ ...preferences, dataRetention: option })}
                            className="w-4 h-4 border-[#050F1C] text-[#022658] focus:ring-[#022658] cursor-pointer"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Backup Frequency */}
                <div className="flex flex-col gap-2">
                  <span className="text-[#050F1C] text-base font-normal">Backup Frequency</span>
                  <div className="p-4 bg-[#F7F8FA] rounded-lg flex flex-col gap-2">
                    <div className="flex items-center gap-6">
                      {['2 weeks', 'Monthly'].map((option) => (
                        <div key={option} className="flex items-center gap-2">
                          <span className="text-[#050F1C] text-base font-normal">{option}</span>
                          <input
                            type="radio"
                            name="backupFrequency"
                            checked={preferences.backupFrequency === option}
                            onChange={() => setPreferences({ ...preferences, backupFrequency: option })}
                            className="w-4 h-4 border-[#050F1C] text-[#022658] focus:ring-[#022658] cursor-pointer"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Date format */}
                <div className="flex flex-col gap-2">
                  <span className="text-[#050F1C] text-base font-normal">Date format</span>
                  <div className="p-4 bg-[#F7F8FA] rounded-lg flex flex-col gap-2">
                    <div className="flex items-center gap-6">
                      {['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY/MM/DD'].map((option) => (
                        <div key={option} className="flex items-center gap-2">
                          <span className="text-[#050F1C] text-base font-normal">{option}</span>
                          <input
                            type="radio"
                            name="dateFormat"
                            checked={preferences.dateFormat === option}
                            onChange={() => setPreferences({ ...preferences, dateFormat: option })}
                            className="w-4 h-4 border-[#050F1C] text-[#022658] focus:ring-[#022658] cursor-pointer"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Time format */}
                <div className="flex flex-col gap-2">
                  <span className="text-[#050F1C] text-base font-normal">Time format</span>
                  <div className="p-4 bg-[#F7F8FA] rounded-lg flex flex-col gap-2">
                    <div className="flex items-center gap-6">
                      {['12-hour', '24-hour'].map((option) => (
                        <div key={option} className="flex items-center gap-2">
                          <span className="text-[#050F1C] text-base font-normal">{option}</span>
                          <input
                            type="radio"
                            name="timeFormat"
                            checked={preferences.timeFormat === option}
                            onChange={() => setPreferences({ ...preferences, timeFormat: option })}
                            className="w-4 h-4 border-[#050F1C] text-[#022658] focus:ring-[#022658] cursor-pointer"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Default format */}
                <div className="flex flex-col gap-2">
                  <span className="text-[#050F1C] text-base font-normal">Default format</span>
                  <div className="p-4 bg-[#F7F8FA] rounded-lg flex flex-col gap-2">
                    <div className="flex items-center gap-6">
                      {['PDF', 'Excel', 'CSV'].map((option) => (
                        <div key={option} className="flex items-center gap-2">
                          <span className="text-[#050F1C] text-base font-normal">{option}</span>
                          <input
                            type="radio"
                            name="defaultFormat"
                            checked={preferences.defaultFormat === option}
                            onChange={() => setPreferences({ ...preferences, defaultFormat: option })}
                            className="w-4 h-4 border-[#050F1C] text-[#022658] focus:ring-[#022658] cursor-pointer"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Auto save edits */}
                <div className="flex flex-col gap-2">
                  <span className="text-[#050F1C] text-base font-normal">Auto save edits</span>
                  <div className="p-4 bg-[#F7F8FA] rounded-lg flex flex-col gap-2">
                    <div className="flex items-center gap-6">
                      {['Every 30 seconds', 'Every 1 minute', 'Every 2 minutes'].map((option) => (
                        <div key={option} className="flex items-center gap-2">
                          <span className="text-[#050F1C] text-base font-normal">{option}</span>
                          <input
                            type="radio"
                            name="autoSave"
                            checked={preferences.autoSave === option}
                            onChange={() => setPreferences({ ...preferences, autoSave: option })}
                            className="w-4 h-4 border-[#050F1C] text-[#022658] focus:ring-[#022658] cursor-pointer"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Account & Security Tab Content */}
            {activeTab === 'Account & Security' && (
              <div className="flex flex-col gap-6">
                {/* Change password */}
                <button
                  onClick={() => setShowPasswordForm(!showPasswordForm)}
                  className="flex items-center gap-2 hover:opacity-70 transition-opacity"
                >
                  <span className="text-[#050F1C] text-base font-normal">Change password</span>
                  <ChevronDown className={`w-4 h-4 text-[#050F1C] transition-transform ${showPasswordForm ? '-rotate-90' : 'rotate-90'}`} />
                </button>

                {/* Change Password Form (when expanded) */}
                {showPasswordForm && (
                  <div className="flex flex-col w-full p-4 gap-10 rounded-lg border border-[#D4E1EA]">
                    <div className="flex items-start w-full gap-6">
                      <div className="flex flex-col items-start flex-1 gap-2">
                        <span className="text-[#050F1C] text-sm font-normal">Old password</span>
                        <div className="flex justify-between items-center w-full bg-[#F7F8FA] pr-4 rounded-lg">
                          <input
                            type={showOldPassword ? 'text' : 'password'}
                            value={passwordData.oldPassword}
                            onChange={(e) => setPasswordData({ ...passwordData, oldPassword: e.target.value })}
                            placeholder="Enter old password"
                            className="flex-1 text-[#050F1C] bg-transparent text-base py-4 pl-4 mr-1 border-0 outline-none"
                          />
                          <button
                            onClick={() => setShowOldPassword(!showOldPassword)}
                            className="cursor-pointer"
                          >
                            {showOldPassword ? <EyeOff className="w-4 h-4 text-[#525866]" /> : <Eye className="w-4 h-4 text-[#525866]" />}
                          </button>
                        </div>
                      </div>
                      <div className="flex flex-col items-start flex-1 gap-2">
                        <span className="text-[#050F1C] text-sm font-normal">New password</span>
                        <div className="flex justify-between items-center w-full bg-[#F7F8FA] pr-4 rounded-lg">
                          <input
                            type={showNewPassword ? 'text' : 'password'}
                            value={passwordData.newPassword}
                            onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                            placeholder="Enter new password"
                            className="flex-1 text-[#050F1C] bg-transparent text-base py-4 pl-4 mr-1 border-0 outline-none"
                          />
                          <button
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            className="cursor-pointer"
                          >
                            {showNewPassword ? <EyeOff className="w-4 h-4 text-[#525866]" /> : <Eye className="w-4 h-4 text-[#525866]" />}
                          </button>
                        </div>
                        <div className="flex flex-col items-start gap-1">
                          <span className="text-[#525866] text-xs">Password must be at least 8 characters</span>
                          <span className="text-[#525866] text-xs">Password must include at least a character and number</span>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-start w-full gap-10">
                      <button
                        onClick={() => {
                          setShowPasswordForm(false);
                          setPasswordData({ oldPassword: '', newPassword: '' });
                        }}
                        className="flex flex-col items-center flex-1 py-[18px] rounded-lg border-2 border-[#022658] hover:bg-gray-50 transition-colors"
                        style={{ boxShadow: '0px 4px 4px rgba(5, 15, 28, 0.10)' }}
                      >
                        <span className="text-[#022658] text-base font-bold" style={{ fontFamily: 'Satoshi' }}>Cancel Changes</span>
                      </button>
                      <button
                        className="flex flex-col items-center flex-1 py-[18px] rounded-lg border-4 border-[#0F284726] hover:opacity-90 transition-opacity"
                        style={{
                          background: 'linear-gradient(180deg, #022658, #1A4983)',
                          boxShadow: '0px 4px 4px rgba(5, 15, 28, 0.10)'
                        }}
                      >
                        <span className="text-white text-base font-bold" style={{ fontFamily: 'Satoshi' }}>Save Changes</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Active sessions */}
                <button
                  onClick={() => setShowActiveSessions(!showActiveSessions)}
                  className="flex items-center gap-2 hover:opacity-70 transition-opacity"
                >
                  <span className="text-[#050F1C] text-base font-normal">Active sessions</span>
                  <ChevronDown className={`w-4 h-4 text-[#050F1C] transition-transform ${showActiveSessions ? '-rotate-90' : 'rotate-90'}`} />
                </button>

                {/* Active Sessions Details (when expanded) */}
                {showActiveSessions && (
                  <div className="flex flex-col items-start gap-2" style={{ width: '600px' }}>
                    <div className="flex items-start justify-between w-full p-4 rounded-lg border border-[#D4E1EA]">
                      <span className="text-[#050F1C] text-base font-normal">Currently logged in on:</span>
                      <div className="flex flex-col items-end gap-3">
                        <div className="flex items-center gap-2">
                          <span className="text-[#050F1C] text-base font-normal">Chrome/Mac</span>
                          <div
                            onClick={() => handleToggleSession('chrome-mac')}
                            className={`w-[38px] h-[18px] rounded-full flex items-center px-0.5 cursor-pointer transition-all duration-300 ${
                              activeSessions.includes('chrome-mac') ? 'bg-[#022658] justify-end' : 'bg-[#868C98] justify-start'
                            }`}
                            style={{ border: '1px solid #022658' }}
                          >
                            <div className="w-[14px] h-[14px] bg-white rounded-full"></div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[#050F1C] text-base font-normal">Chrome/Windows</span>
                          <div
                            onClick={() => handleToggleSession('chrome-windows')}
                            className={`w-[38px] h-[18px] rounded-full flex items-center px-0.5 cursor-pointer transition-all duration-300 ${
                              activeSessions.includes('chrome-windows') ? 'bg-[#022658] justify-end' : 'bg-[#868C98] justify-start'
                            }`}
                            style={{ border: '1px solid #022658' }}
                          >
                            <div className="w-[14px] h-[14px] bg-white rounded-full"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 2 Factor Authentication */}
                <div className="flex flex-col items-start gap-2">
                  <span className="text-[#525866] text-sm font-normal">2 factor authentication</span>
                  <div className="flex flex-col items-start p-4 gap-6 rounded-lg border border-[#D4E1EA]" style={{ width: '250px' }}>
                    {/* Enable 2FA */}
                    <div className="flex flex-col items-start w-full gap-2">
                      <button
                        onClick={() => setShowEnable2FA(!showEnable2FA)}
                        className="flex items-center justify-between w-full hover:opacity-70 transition-opacity"
                      >
                        <span className="text-[#050F1C] text-base font-normal">Enable 2FA</span>
                        <ChevronDown className={`w-4 h-4 text-[#050F1C] transition-transform ${showEnable2FA ? '-rotate-90' : 'rotate-90'}`} />
                      </button>

                      {/* Enable 2FA Form (when expanded) */}
                      {showEnable2FA && (
                        <div className="flex flex-col w-full bg-[#F7F8FA] p-4 gap-10 rounded-lg mt-2" style={{ minWidth: '600px' }}>
                          <div className="flex items-start w-full gap-6">
                            <div className="flex flex-col items-start flex-1 gap-2">
                              <span className="text-[#050F1C] text-sm font-normal">Enter PIN</span>
                              <div className="flex justify-between items-center w-full bg-white pr-4 rounded-lg">
                                <input
                                  type={showPIN ? 'text' : 'password'}
                                  value={pinData.pin}
                                  onChange={(e) => setPinData({ ...pinData, pin: e.target.value })}
                                  placeholder="987654"
                                  className="flex-1 text-[#050F1C] bg-transparent text-base py-4 pl-4 mr-1 border-0 outline-none"
                                />
                                <button
                                  onClick={() => setShowPIN(!showPIN)}
                                  className="cursor-pointer"
                                >
                                  {showPIN ? <EyeOff className="w-4 h-4 text-[#525866]" /> : <Eye className="w-4 h-4 text-[#525866]" />}
                                </button>
                              </div>
                            </div>
                            <div className="flex flex-col items-start flex-1 gap-2">
                              <span className="text-[#050F1C] text-sm font-normal">Confirm PIN</span>
                              <div className="flex justify-between items-center w-full bg-white pr-4 rounded-lg">
                                <input
                                  type={showConfirmPIN ? 'text' : 'password'}
                                  value={pinData.confirmPin}
                                  onChange={(e) => setPinData({ ...pinData, confirmPin: e.target.value })}
                                  placeholder="987654"
                                  className="flex-1 text-[#050F1C] bg-transparent text-base py-4 pl-4 mr-1 border-0 outline-none"
                                />
                                <button
                                  onClick={() => setShowConfirmPIN(!showConfirmPIN)}
                                  className="cursor-pointer"
                                >
                                  {showConfirmPIN ? <EyeOff className="w-4 h-4 text-[#525866]" /> : <Eye className="w-4 h-4 text-[#525866]" />}
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-start w-full gap-10">
                            <button
                              onClick={() => {
                                setShowEnable2FA(false);
                                setPinData({ pin: '', confirmPin: '' });
                              }}
                              className="flex flex-col items-center flex-1 py-[18px] rounded-lg border-2 border-[#022658] hover:bg-gray-50 transition-colors"
                              style={{ boxShadow: '0px 4px 4px rgba(5, 15, 28, 0.10)' }}
                            >
                              <span className="text-[#022658] text-base font-bold" style={{ fontFamily: 'Satoshi' }}>Cancel Changes</span>
                            </button>
                            <button
                              className="flex flex-col items-center flex-1 py-[18px] rounded-lg border-4 border-[#0F284726] hover:opacity-90 transition-opacity"
                              style={{
                                background: 'linear-gradient(180deg, #022658, #1A4983)',
                                boxShadow: '0px 4px 4px rgba(5, 15, 28, 0.10)'
                              }}
                            >
                              <span className="text-white text-base font-bold" style={{ fontFamily: 'Satoshi' }}>Save Changes</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Change 2FA Method */}
                    <div className="flex flex-col items-start w-full gap-2">
                      <button
                        onClick={() => setShowChange2FAMethod(!showChange2FAMethod)}
                        className="flex items-center justify-between w-full hover:opacity-70 transition-opacity"
                      >
                        <span className="text-[#050F1C] text-base font-normal">Change 2FA method</span>
                        <ChevronDown className={`w-4 h-4 text-[#050F1C] transition-transform ${showChange2FAMethod ? '-rotate-90' : 'rotate-90'}`} />
                      </button>

                      {/* 2FA Method Options (when expanded) */}
                      {showChange2FAMethod && (
                        <div className="flex flex-col items-start bg-[#F7F8FA] p-4 gap-2 rounded-lg mt-2 w-full">
                          <div className="flex items-start gap-6">
                            <button
                              onClick={() => setSelected2FAMethod('pin')}
                              className="flex items-center gap-2 hover:opacity-70 cursor-pointer"
                            >
                              <span className="text-[#050F1C] text-base font-normal">PIN</span>
                              <div className="relative w-4 h-4">
                                <div className="absolute inset-0 border border-[#050F1C] rounded-full" style={{ outline: '1px solid #050F1C', outlineOffset: '-0.5px' }}></div>
                                {selected2FAMethod === 'pin' && (
                                  <>
                                    <div className="absolute inset-[1.67px] border border-[#050F1C] rounded-full" style={{ outline: '1px solid #050F1C', outlineOffset: '-0.5px' }}></div>
                                    <div className="absolute left-[5.34px] top-[6px] w-[5.33px] h-1 border border-[#050F1C]" style={{ outline: '1px solid #050F1C', outlineOffset: '-0.5px' }}></div>
                                  </>
                                )}
                              </div>
                            </button>
                            <button
                              onClick={() => setSelected2FAMethod('email')}
                              className="flex items-center gap-2 hover:opacity-70 cursor-pointer"
                            >
                              <span className="text-[#050F1C] text-base font-normal">Email OTP</span>
                              <div className="relative w-4 h-4">
                                <div className="absolute inset-0 border border-[#050F1C] rounded-full" style={{ outline: '1px solid #050F1C', outlineOffset: '-0.5px' }}></div>
                                {selected2FAMethod === 'email' && (
                                  <>
                                    <div className="absolute inset-[1.67px] border border-[#050F1C] rounded-full" style={{ outline: '1px solid #050F1C', outlineOffset: '-0.5px' }}></div>
                                    <div className="absolute left-[5.34px] top-[6px] w-[5.33px] h-1 border border-[#050F1C]" style={{ outline: '1px solid #050F1C', outlineOffset: '-0.5px' }}></div>
                                  </>
                                )}
                              </div>
                            </button>
                            <button
                              onClick={() => setSelected2FAMethod('google')}
                              className="flex items-center gap-2 hover:opacity-70 cursor-pointer"
                            >
                              <span className="text-[#050F1C] text-base font-normal">Google Authenticator</span>
                              <div className="relative w-4 h-4">
                                <div className="absolute inset-0 border border-[#050F1C] rounded-full" style={{ outline: '1px solid #050F1C', outlineOffset: '-0.5px' }}></div>
                                {selected2FAMethod === 'google' && (
                                  <>
                                    <div className="absolute inset-[1.67px] border border-[#050F1C] rounded-full" style={{ outline: '1px solid #050F1C', outlineOffset: '-0.5px' }}></div>
                                    <div className="absolute left-[5.34px] top-[6px] w-[5.33px] h-1 border border-[#050F1C]" style={{ outline: '1px solid #050F1C', outlineOffset: '-0.5px' }}></div>
                                  </>
                                )}
                              </div>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Disable 2FA */}
                    <button
                      onClick={() => setShowDisable2FA(!showDisable2FA)}
                      className="flex items-center justify-between w-full hover:opacity-70 transition-opacity"
                    >
                      <span className="text-[#050F1C] text-base font-normal">Disable 2FA</span>
                      <ChevronDown className={`w-4 h-4 text-[#050F1C] transition-transform ${showDisable2FA ? '-rotate-90' : 'rotate-90'}`} />
                    </button>

                    {/* Disable 2FA Form (when expanded) */}
                    {showDisable2FA && (
                      <div className="flex flex-col w-full bg-[#F7F8FA] p-4 gap-10 rounded-lg mt-2">
                        <div className="flex items-end w-full gap-6">
                          <div className="flex flex-col items-start flex-1 gap-2">
                            <span className="text-[#050F1C] text-sm font-normal">Enter Password</span>
                            <div className="flex justify-between items-center w-full bg-white pr-4 rounded-lg">
                              <input
                                type={showDisablePassword ? 'text' : 'password'}
                                value={disablePassword}
                                onChange={(e) => setDisablePassword(e.target.value)}
                                placeholder="#@BenisFrimpong#"
                                className="flex-1 text-[#050F1C] bg-transparent text-base font-medium py-4 pl-4 mr-1 border-0 outline-none"
                              />
                              <button
                                onClick={() => setShowDisablePassword(!showDisablePassword)}
                                className="cursor-pointer"
                              >
                                {showDisablePassword ? <EyeOff className="w-4 h-4 text-[#050F1C]" /> : <Eye className="w-4 h-4 text-[#050F1C]" />}
                              </button>
                            </div>
                          </div>
                          <button
                            className="flex items-center justify-center flex-1 h-[58px] px-2.5 rounded-lg border-4 border-[#0F284726] hover:opacity-90 transition-opacity"
                            style={{
                              background: 'linear-gradient(180deg, #022658 43%, #1A4983 100%)',
                              boxShadow: '0px 4px 4px rgba(5, 15, 28, 0.10)',
                              outline: '4px solid rgba(15, 40, 71, 0.15)'
                            }}
                          >
                            <span className="text-white text-base font-bold">Disable</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Placeholder for other tabs */}
            {activeTab !== 'Profile' && activeTab !== 'Court information' && activeTab !== 'Notifications' && activeTab !== 'Preferences' && activeTab !== 'Account & Security' && (
              <div className="p-8">
                <p className="text-[#525866]">{activeTab} content coming soon...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegistrarSystemSettingsPage;

