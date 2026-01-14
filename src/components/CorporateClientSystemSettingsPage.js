import React, { useState } from 'react';
import { Bell, ChevronRight, ChevronDown, Settings, Camera, Check, Eye, EyeOff } from 'lucide-react';
import CorporateClientHeader from './CorporateClientHeader';

const CorporateClientSystemSettingsPage = ({ userInfo, onNavigate, onLogout }) => {
  const [activeTab, setActiveTab] = useState('Profile');
  const [formData, setFormData] = useState({
    name: 'Tonia Martins',
    email: 'toniamartins@gmail.com',
    phone: '+233445556666',
    country: 'Ghana',
    companyName: 'Access Bank'
  });

  const [companyData, setCompanyData] = useState({
    industry: 'Banking & Finance',
    registrationNumber: 'AB12345678990',
    companyName: 'Access Bank',
    companyMail: 'accessbankghana@gmail.com',
    dateOfIncorporation: '02/10/1990',
    tin: '0925671866',
    companyStatus: 'Active',
    companyLocation: 'Plot 45, Acme road, off Greater Accra Park, Accra.',
    phone: '+233998887777',
    country: 'Ghana'
  });

  const [notificationSettings, setNotificationSettings] = useState({
    channels: {
      inApp: true,
      email: false
    },
    notifications: {
      newCaseRecords: false,
      newGazetteUpload: false,
      newCompanyInIndustry: false,
      billingExpires: false,
      systemAnnouncements: false,
      entityStatusChange: false
    }
  });

  const [preferences, setPreferences] = useState({
    language: 'English',
    dataRetention: '3 months',
    backupFrequency: '2 weeks',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '12-hour',
    defaultFormat: 'PDF'
  });

  const [expandedSections, setExpandedSections] = useState({
    changePassword: false,
    activeSessions: false,
    enable2FA: false,
    change2FAMethod: false,
    disable2FA: false
  });

  const [passwordData, setPasswordData] = useState({
    oldPassword: '#ToniaMartins02#',
    newPassword: '#@ToniaisaDiva#'
  });

  const [showPasswords, setShowPasswords] = useState({
    oldPassword: false,
    newPassword: false
  });

  const [activeSessions, setActiveSessions] = useState([
    { id: 1, device: 'Chrome/Mac', active: true },
    { id: 2, device: 'Chrome/Windows', active: true }
  ]);

  const [twoFAData, setTwoFAData] = useState({
    pin: '987654',
    confirmPin: '987654'
  });

  const [showPins, setShowPins] = useState({
    pin: false,
    confirmPin: false
  });

  const [twoFAMethod, setTwoFAMethod] = useState('PIN');

  const [disable2FAPassword, setDisable2FAPassword] = useState('#@ToniaisaDiva#');
  const [showDisable2FAPassword, setShowDisable2FAPassword] = useState(false);

  // Use userInfo from props or localStorage
  const displayUserInfo = userInfo || JSON.parse(localStorage.getItem('userData') || '{}');
  const userName = displayUserInfo?.first_name && displayUserInfo?.last_name 
    ? `${displayUserInfo.first_name} ${displayUserInfo.last_name}` 
    : 'Tonia Martins';
  const organizationName = displayUserInfo?.organization || 'Access Bank';
  const userEmail = displayUserInfo?.email || 'toniamartins@gmail.com';

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = () => {
    // Save logic here
    console.log('Saving changes:', formData);
  };

  const handleCancel = () => {
    // Reset form data
    if (activeTab === 'Profile') {
      setFormData({
        name: userName,
        email: userEmail,
        phone: '+233445556666',
        country: 'Ghana',
        companyName: organizationName
      });
    } else if (activeTab === 'Company information') {
      setCompanyData({
        industry: 'Banking & Finance',
        registrationNumber: 'AB12345678990',
        companyName: organizationName,
        companyMail: 'accessbankghana@gmail.com',
        dateOfIncorporation: '02/10/1990',
        tin: '0925671866',
        companyStatus: 'Active',
        companyLocation: 'Plot 45, Acme road, off Greater Accra Park, Accra.',
        phone: '+233998887777',
        country: 'Ghana'
      });
    }
  };

  const handleCompanyInputChange = (field, value) => {
    setCompanyData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCompanySave = () => {
    // Save logic here
    console.log('Saving company changes:', companyData);
  };

  const handleChannelToggle = (channel) => {
    setNotificationSettings(prev => ({
      ...prev,
      channels: {
        ...prev.channels,
        [channel]: !prev.channels[channel]
      }
    }));
  };

  const handleNotificationToggle = (notification) => {
    setNotificationSettings(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [notification]: !prev.notifications[notification]
      }
    }));
  };

  const handlePreferenceChange = (field, value) => {
    setPreferences(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
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
          <div className="flex-1 p-4 bg-white rounded-lg flex flex-col gap-6">
            {/* Breadcrumb */}
            <div className="flex flex-col gap-6">
              <span className="text-[#525866] text-xs opacity-75 font-normal">SYSTEM SETTINGS</span>

              {/* Tabs */}
              <div className="flex items-center gap-4 border-b border-[#E4E7EB]">
                <button
                  onClick={() => setActiveTab('Profile')}
                  className={`pb-2 px-2 ${activeTab === 'Profile' ? 'border-b-4 border-[#022658] text-[#022658] font-bold' : 'text-[#525866] font-normal'}`}
                >
                  <span className="text-base" style={{ fontFamily: 'Satoshi' }}>Profile</span>
                </button>
                <button
                  onClick={() => setActiveTab('Company information')}
                  className={`pb-2 px-2 ${activeTab === 'Company information' ? 'border-b-4 border-[#022658] text-[#022658] font-bold' : 'text-[#525866] font-normal'}`}
                >
                  <span className="text-base" style={{ fontFamily: 'Satoshi' }}>Company information</span>
                </button>
                <button
                  onClick={() => setActiveTab('Notifications')}
                  className={`pb-2 px-2 ${activeTab === 'Notifications' ? 'border-b-4 border-[#022658] text-[#022658] font-bold' : 'text-[#525866] font-normal'}`}
                >
                  <span className="text-base" style={{ fontFamily: 'Satoshi' }}>Notifications</span>
                </button>
                <button
                  onClick={() => setActiveTab('Preferences')}
                  className={`pb-2 px-2 ${activeTab === 'Preferences' ? 'border-b-4 border-[#022658] text-[#022658] font-bold' : 'text-[#525866] font-normal'}`}
                >
                  <span className="text-base" style={{ fontFamily: 'Satoshi' }}>Preferences</span>
                </button>
                <button
                  onClick={() => setActiveTab('Account & Security')}
                  className={`pb-2 px-2 ${activeTab === 'Account & Security' ? 'border-b-4 border-[#022658] text-[#022658] font-bold' : 'text-[#525866] font-normal'}`}
                >
                  <span className="text-base" style={{ fontFamily: 'Satoshi' }}>Account & Security</span>
                </button>
              </div>

              {/* Profile Tab Content */}
              {activeTab === 'Profile' && (
                <div className="flex flex-col gap-6">
                  {/* Section Header */}
                  <div className="flex flex-col gap-2">
                    <h2 className="text-[#050F1C] text-xl font-normal" style={{ fontFamily: 'Poppins' }}>
                      Personal information
                    </h2>
                    <p className="text-[#050F1C] text-base font-normal" style={{ fontFamily: 'Satoshi' }}>
                      Update your photo and personal details here
                    </p>
                  </div>

                  {/* Profile Photo and Form */}
                  <div className="flex flex-col gap-8">
                    {/* Profile Photo Section */}
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
                        <h3 className="text-[#050F1C] text-xl font-bold" style={{ fontFamily: 'Poppins' }}>
                          {formData.name}
                        </h3>
                      </div>
                      <div className="flex flex-col items-center gap-3">
                        <button className="h-8 px-2.5 shadow-md rounded-lg border-2 border-[#0F2847] flex items-center justify-center gap-2.5">
                          <span className="text-[#022658] text-xs font-bold" style={{ fontFamily: 'Satoshi' }}>Edit</span>
                        </button>
                        <p className="text-center text-[#525866] text-sm font-normal" style={{ fontFamily: 'Satoshi' }}>
                          At least 256px x 256px
                        </p>
                      </div>
                    </div>

                    {/* Form Fields */}
                    <div className="flex flex-col gap-6">
                      {/* Name and Email Row */}
                      <div className="flex items-start gap-6">
                        <div className="flex-1 flex flex-col gap-2">
                          <label className="text-[#050F1C] text-sm font-normal" style={{ fontFamily: 'Satoshi' }}>
                            Name
                          </label>
                          <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => handleInputChange('name', e.target.value)}
                            className="w-full px-4 py-4 bg-[#F7F8FA] rounded-lg text-[#050F1C] text-base font-medium border-0 outline-none"
                            style={{ fontFamily: 'Satoshi' }}
                          />
                        </div>
                        <div className="flex-1 flex flex-col gap-2">
                          <label className="text-[#050F1C] text-sm font-normal" style={{ fontFamily: 'Satoshi' }}>
                            Email
                          </label>
                          <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => handleInputChange('email', e.target.value)}
                            className="w-full px-4 py-4 bg-[#F7F8FA] rounded-lg text-[#050F1C] text-base font-medium border-0 outline-none"
                            style={{ fontFamily: 'Satoshi' }}
                          />
                        </div>
                      </div>

                      {/* Phone and Country Row */}
                      <div className="flex items-start gap-6">
                        <div className="flex-1 flex flex-col gap-2">
                          <label className="text-[#050F1C] text-sm font-normal" style={{ fontFamily: 'Satoshi' }}>
                            Phone
                          </label>
                          <div className="h-12 px-4 py-3 bg-[#F7F8FA] rounded-lg flex items-center gap-1">
                            <div className="flex items-center gap-1">
                              <img
                                src="https://flagcdn.com/w40/gh.png"
                                alt="Ghana"
                                className="w-6 h-4 object-cover"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                }}
                              />
                              <ChevronDown className="w-4 h-4 text-[#141B34]" />
                              <span className="text-[#022658] text-sm font-normal" style={{ fontFamily: 'Satoshi' }}>|</span>
                            </div>
                            <input
                              type="tel"
                              value={formData.phone}
                              onChange={(e) => handleInputChange('phone', e.target.value)}
                              className="flex-1 bg-transparent text-[#050F1C] text-base font-medium border-0 outline-none"
                              style={{ fontFamily: 'Satoshi' }}
                            />
                          </div>
                        </div>
                        <div className="flex-1 flex flex-col gap-2">
                          <label className="text-[#050F1C] text-sm font-normal" style={{ fontFamily: 'Satoshi' }}>
                            Country
                          </label>
                          <div className="px-4 py-4 bg-[#F7F8FA] rounded-lg flex items-center justify-between">
                            <span className="text-[#050F1C] text-base font-medium" style={{ fontFamily: 'Satoshi' }}>
                              {formData.country}
                            </span>
                            <ChevronDown className="w-4 h-4 text-[#050F1C] rotate-180" />
                          </div>
                        </div>
                      </div>

                      {/* Company Name */}
                      <div className="flex flex-col gap-2">
                        <label className="text-[#050F1C] text-sm font-normal" style={{ fontFamily: 'Satoshi' }}>
                          Company name
                        </label>
                        <div className="px-4 py-4 bg-[#F7F8FA] rounded-lg flex items-center justify-between">
                          <span className="text-[#050F1C] text-base font-medium" style={{ fontFamily: 'Satoshi' }}>
                            {formData.companyName}
                          </span>
                          <ChevronDown className="w-4 h-4 text-[#050F1C] rotate-180" />
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-start gap-10">
                      <button
                        onClick={handleCancel}
                        className="flex-1 h-[58px] px-2.5 shadow-md rounded-lg border-2 border-[#0F2847] flex items-center justify-center gap-2.5"
                      >
                        <span className="text-[#022658] text-base font-bold" style={{ fontFamily: 'Satoshi' }}>Cancel Changes</span>
                      </button>
                      <button
                        onClick={handleSave}
                        className="flex-1 h-[58px] px-2.5 bg-gradient-to-b from-[#022658] to-[#1A4983] shadow-md rounded-lg border-4 border-[rgba(15,40,71,0.15)] flex items-center justify-center gap-2.5"
                      >
                        <span className="text-white text-base font-bold" style={{ fontFamily: 'Satoshi' }}>Save Changes</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Company Information Tab Content */}
              {activeTab === 'Company information' && (
                <div className="flex flex-col gap-8">
                  {/* Form Fields */}
                  <div className="flex flex-col gap-6">
                    {/* Industry and Registration Number Row */}
                    <div className="flex items-start gap-6">
                      <div className="flex-1 flex flex-col gap-2">
                        <label className="text-[#050F1C] text-sm font-normal" style={{ fontFamily: 'Satoshi' }}>
                          Industry
                        </label>
                        <div className="px-4 py-4 bg-[#F7F8FA] rounded-lg flex items-center justify-between">
                          <span className="text-[#050F1C] text-base font-medium" style={{ fontFamily: 'Satoshi' }}>
                            {companyData.industry}
                          </span>
                          <ChevronDown className="w-4 h-4 text-[#050F1C] rotate-180" />
                        </div>
                      </div>
                      <div className="flex-1 flex flex-col gap-2">
                        <label className="text-[#050F1C] text-sm font-normal" style={{ fontFamily: 'Satoshi' }}>
                          Registration number
                        </label>
                        <input
                          type="text"
                          value={companyData.registrationNumber}
                          onChange={(e) => handleCompanyInputChange('registrationNumber', e.target.value)}
                          className="w-full px-4 py-4 bg-[#F7F8FA] rounded-lg text-[#050F1C] text-base font-medium border-0 outline-none"
                          style={{ fontFamily: 'Satoshi' }}
                        />
                      </div>
                    </div>

                    {/* Company Name and Company Mail Row */}
                    <div className="flex items-start gap-6">
                      <div className="flex-1 flex flex-col gap-2">
                        <label className="text-[#050F1C] text-sm font-normal" style={{ fontFamily: 'Satoshi' }}>
                          Company name
                        </label>
                        <input
                          type="text"
                          value={companyData.companyName}
                          onChange={(e) => handleCompanyInputChange('companyName', e.target.value)}
                          className="w-full px-4 py-4 bg-[#F7F8FA] rounded-lg text-[#050F1C] text-base font-medium border-0 outline-none"
                          style={{ fontFamily: 'Satoshi' }}
                        />
                      </div>
                      <div className="flex-1 flex flex-col gap-2">
                        <label className="text-[#050F1C] text-sm font-normal" style={{ fontFamily: 'Satoshi' }}>
                          Company mail
                        </label>
                        <input
                          type="email"
                          value={companyData.companyMail}
                          onChange={(e) => handleCompanyInputChange('companyMail', e.target.value)}
                          className="w-full px-4 py-4 bg-[#F7F8FA] rounded-lg text-[#050F1C] text-base font-medium border-0 outline-none"
                          style={{ fontFamily: 'Satoshi' }}
                        />
                      </div>
                    </div>

                    {/* Date of Incorporation and TIN Row */}
                    <div className="flex items-start gap-6">
                      <div className="flex-1 flex flex-col gap-2">
                        <label className="text-[#050F1C] text-sm font-normal" style={{ fontFamily: 'Satoshi' }}>
                          Date of incorporation
                        </label>
                        <div className="px-4 py-4 bg-[#F7F8FA] rounded-lg flex items-center justify-between">
                          <span className="text-[#050F1C] text-base font-medium" style={{ fontFamily: 'Satoshi' }}>
                            {companyData.dateOfIncorporation}
                          </span>
                          <ChevronDown className="w-4 h-4 text-[#050F1C] rotate-180" />
                        </div>
                      </div>
                      <div className="flex-1 flex flex-col gap-2">
                        <label className="text-[#050F1C] text-sm font-normal" style={{ fontFamily: 'Satoshi' }}>
                          TIN
                        </label>
                        <input
                          type="text"
                          value={companyData.tin}
                          onChange={(e) => handleCompanyInputChange('tin', e.target.value)}
                          className="w-full px-4 py-4 bg-[#F7F8FA] rounded-lg text-[#050F1C] text-base font-medium border-0 outline-none"
                          style={{ fontFamily: 'Satoshi' }}
                        />
                      </div>
                    </div>

                    {/* Company Status and Company Location Row */}
                    <div className="flex items-start gap-6">
                      <div className="flex-1 flex flex-col gap-2">
                        <label className="text-[#050F1C] text-sm font-normal" style={{ fontFamily: 'Satoshi' }}>
                          Company Status
                        </label>
                        <div className="px-4 py-4 bg-[#F7F8FA] rounded-lg flex items-center justify-between">
                          <span className="text-[#050F1C] text-base font-medium" style={{ fontFamily: 'Satoshi' }}>
                            {companyData.companyStatus}
                          </span>
                          <ChevronDown className="w-4 h-4 text-[#050F1C] rotate-180" />
                        </div>
                      </div>
                      <div className="flex-1 flex flex-col gap-2">
                        <label className="text-[#050F1C] text-sm font-normal" style={{ fontFamily: 'Satoshi' }}>
                          Company location
                        </label>
                        <input
                          type="text"
                          value={companyData.companyLocation}
                          onChange={(e) => handleCompanyInputChange('companyLocation', e.target.value)}
                          className="w-full px-4 py-4 bg-[#F7F8FA] rounded-lg text-[#050F1C] text-base font-medium border-0 outline-none"
                          style={{ fontFamily: 'Satoshi' }}
                        />
                      </div>
                    </div>

                    {/* Phone and Country Row */}
                    <div className="flex items-start gap-6">
                      <div className="flex-1 flex flex-col gap-2">
                        <label className="text-[#050F1C] text-sm font-normal" style={{ fontFamily: 'Satoshi' }}>
                          Phone
                        </label>
                        <div className="h-12 px-4 py-3 bg-[#F7F8FA] rounded-lg flex items-center gap-2.5">
                          <div className="flex items-center gap-1">
                            <img
                              src="https://flagcdn.com/w40/gh.png"
                              alt="Ghana"
                              className="w-6 h-4 object-cover"
                              onError={(e) => {
                                e.target.style.display = 'none';
                              }}
                            />
                            <ChevronDown className="w-4 h-4 text-[#141B34]" />
                            <span className="text-[#022658] text-sm font-normal" style={{ fontFamily: 'Satoshi' }}>|</span>
                          </div>
                          <input
                            type="tel"
                            value={companyData.phone}
                            onChange={(e) => handleCompanyInputChange('phone', e.target.value)}
                            className="flex-1 bg-transparent text-[#050F1C] text-base font-medium border-0 outline-none"
                            style={{ fontFamily: 'Satoshi' }}
                          />
                        </div>
                      </div>
                      <div className="flex-1 flex flex-col gap-2">
                        <label className="text-[#050F1C] text-sm font-normal" style={{ fontFamily: 'Satoshi' }}>
                          Country
                        </label>
                        <div className="px-4 py-4 bg-[#F7F8FA] rounded-lg flex items-center justify-between">
                          <span className="text-[#050F1C] text-base font-medium" style={{ fontFamily: 'Satoshi' }}>
                            {companyData.country}
                          </span>
                          <ChevronDown className="w-4 h-4 text-[#050F1C] rotate-180" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-start gap-10">
                    <button
                      onClick={handleCancel}
                      className="flex-1 h-[58px] px-2.5 shadow-md rounded-lg border-2 border-[#0F2847] flex items-center justify-center gap-2.5"
                    >
                      <span className="text-[#022658] text-base font-bold" style={{ fontFamily: 'Satoshi' }}>Cancel Changes</span>
                    </button>
                    <button
                      onClick={handleCompanySave}
                      className="flex-1 h-[58px] px-2.5 bg-gradient-to-b from-[#022658] to-[#1A4983] shadow-md rounded-lg border-4 border-[rgba(15,40,71,0.15)] flex items-center justify-center gap-2.5"
                    >
                      <span className="text-white text-base font-bold" style={{ fontFamily: 'Satoshi' }}>Save Changes</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Notifications Tab Content */}
              {activeTab === 'Notifications' && (
                <div className="w-[440px] flex flex-col gap-6">
                  {/* Notification Channels */}
                  <div className="flex flex-col gap-2">
                    <h3 className="text-[#050F1C] text-base font-normal" style={{ fontFamily: 'Satoshi' }}>
                      Notification Channels
                    </h3>
                    <div className="p-4 bg-[#F7F8FA] rounded-lg flex flex-col gap-2">
                      <div className="flex items-start gap-6">
                        <div className="flex items-center gap-2">
                          <span className="text-[#050F1C] text-base font-normal" style={{ fontFamily: 'Satoshi' }}>In-app</span>
                          <button
                            onClick={() => handleChannelToggle('inApp')}
                            className={`w-4 h-4 rounded border border-[#050F1C] flex items-center justify-center ${
                              notificationSettings.channels.inApp ? 'bg-[#022658] border-[#022658]' : 'bg-transparent'
                            }`}
                          >
                            {notificationSettings.channels.inApp && (
                              <Check className="w-3 h-3 text-white" />
                            )}
                          </button>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[#050F1C] text-base font-normal" style={{ fontFamily: 'Satoshi' }}>Email</span>
                          <button
                            onClick={() => handleChannelToggle('email')}
                            className={`w-4 h-4 rounded border border-[#050F1C] flex items-center justify-center ${
                              notificationSettings.channels.email ? 'bg-[#022658] border-[#022658]' : 'bg-transparent'
                            }`}
                          >
                            {notificationSettings.channels.email && (
                              <Check className="w-3 h-3 text-white" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Notify me on... */}
                  <div className="w-[440px] flex flex-col gap-2">
                    <p className="text-[#525866] text-xs font-medium" style={{ fontFamily: 'Satoshi' }}>
                      Notify me on...
                    </p>
                    <div className="flex flex-col gap-4">
                      {/* New or modified case records */}
                      <div className="flex items-center justify-between">
                        <span className="text-[#050F1C] text-base font-normal" style={{ fontFamily: 'Satoshi' }}>
                          New or modified case records
                        </span>
                        <button
                          onClick={() => handleNotificationToggle('newCaseRecords')}
                          className={`relative w-11 h-6 rounded-full border transition-colors ${
                            notificationSettings.notifications.newCaseRecords 
                              ? 'bg-[#022658] border-[#022658]' 
                              : 'bg-transparent border-[#868C98]'
                          }`}
                        >
                          <div
                            className={`absolute top-0.5 w-2.5 h-2.5 bg-[#868C98] rounded-full transition-all ${
                              notificationSettings.notifications.newCaseRecords 
                                ? 'left-[26px] bg-white' 
                                : 'left-1'
                            }`}
                          />
                        </button>
                      </div>

                      {/* New Gazette or Commercial Bulletin upload */}
                      <div className="flex items-center justify-between">
                        <span className="text-[#050F1C] text-base font-normal" style={{ fontFamily: 'Satoshi' }}>
                          New Gazette or Commercial Bulletin upload
                        </span>
                        <button
                          onClick={() => handleNotificationToggle('newGazetteUpload')}
                          className={`relative w-11 h-6 rounded-full border transition-colors ${
                            notificationSettings.notifications.newGazetteUpload 
                              ? 'bg-[#022658] border-[#022658]' 
                              : 'bg-transparent border-[#868C98]'
                          }`}
                        >
                          <div
                            className={`absolute top-0.5 w-2.5 h-2.5 bg-[#868C98] rounded-full transition-all ${
                              notificationSettings.notifications.newGazetteUpload 
                                ? 'left-[26px] bg-white' 
                                : 'left-1'
                            }`}
                          />
                        </button>
                      </div>

                      {/* New Company in my Industry upload */}
                      <div className="flex items-center justify-between">
                        <span className="text-[#050F1C] text-base font-normal" style={{ fontFamily: 'Satoshi' }}>
                          New Company in my Industry upload
                        </span>
                        <button
                          onClick={() => handleNotificationToggle('newCompanyInIndustry')}
                          className={`relative w-11 h-6 rounded-full border transition-colors ${
                            notificationSettings.notifications.newCompanyInIndustry 
                              ? 'bg-[#022658] border-[#022658]' 
                              : 'bg-transparent border-[#868C98]'
                          }`}
                        >
                          <div
                            className={`absolute top-0.5 w-2.5 h-2.5 bg-[#868C98] rounded-full transition-all ${
                              notificationSettings.notifications.newCompanyInIndustry 
                                ? 'left-[26px] bg-white' 
                                : 'left-1'
                            }`}
                          />
                        </button>
                      </div>

                      {/* 2 days before billing expires */}
                      <div className="flex items-center justify-between">
                        <span className="text-[#050F1C] text-base font-normal" style={{ fontFamily: 'Satoshi' }}>
                          2 days before billing expires
                        </span>
                        <button
                          onClick={() => handleNotificationToggle('billingExpires')}
                          className={`relative w-11 h-6 rounded-full border transition-colors ${
                            notificationSettings.notifications.billingExpires 
                              ? 'bg-[#022658] border-[#022658]' 
                              : 'bg-transparent border-[#868C98]'
                          }`}
                        >
                          <div
                            className={`absolute top-0.5 w-2.5 h-2.5 bg-[#868C98] rounded-full transition-all ${
                              notificationSettings.notifications.billingExpires 
                                ? 'left-[26px] bg-white' 
                                : 'left-1'
                            }`}
                          />
                        </button>
                      </div>

                      {/* System announcements */}
                      <div className="flex items-center justify-between">
                        <span className="text-[#050F1C] text-base font-normal" style={{ fontFamily: 'Satoshi' }}>
                          System announcements
                        </span>
                        <button
                          onClick={() => handleNotificationToggle('systemAnnouncements')}
                          className={`relative w-11 h-6 rounded-full border transition-colors ${
                            notificationSettings.notifications.systemAnnouncements 
                              ? 'bg-[#022658] border-[#022658]' 
                              : 'bg-transparent border-[#868C98]'
                          }`}
                        >
                          <div
                            className={`absolute top-0.5 w-2.5 h-2.5 bg-[#868C98] rounded-full transition-all ${
                              notificationSettings.notifications.systemAnnouncements 
                                ? 'left-[26px] bg-white' 
                                : 'left-1'
                            }`}
                          />
                        </button>
                      </div>

                      {/* Change of all entities status */}
                      <div className="flex items-center justify-between">
                        <span className="text-[#050F1C] text-base font-normal" style={{ fontFamily: 'Satoshi' }}>
                          Change of all entities status
                        </span>
                        <button
                          onClick={() => handleNotificationToggle('entityStatusChange')}
                          className={`relative w-11 h-6 rounded-full border transition-colors ${
                            notificationSettings.notifications.entityStatusChange 
                              ? 'bg-[#022658] border-[#022658]' 
                              : 'bg-transparent border-[#868C98]'
                          }`}
                        >
                          <div
                            className={`absolute top-0.5 w-2.5 h-2.5 bg-[#868C98] rounded-full transition-all ${
                              notificationSettings.notifications.entityStatusChange 
                                ? 'left-[26px] bg-white' 
                                : 'left-1'
                            }`}
                          />
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
                    <label className="text-[#050F1C] text-sm font-normal" style={{ fontFamily: 'Satoshi' }}>
                      Language
                    </label>
                    <div className="px-4 py-4 bg-[#F7F8FA] rounded-lg flex items-center justify-between">
                      <div>
                        <span className="text-[#050F1C] text-base font-medium" style={{ fontFamily: 'Satoshi' }}>
                          {preferences.language}{' '}
                        </span>
                        <span className="text-[#868C98] text-base font-medium" style={{ fontFamily: 'Satoshi' }}>
                          (Default)
                        </span>
                      </div>
                      <ChevronDown className="w-4 h-4 text-[#050F1C] rotate-180" />
                    </div>
                  </div>

                  {/* Data Retention Policy */}
                  <div className="flex flex-col gap-2">
                    <label className="text-[#050F1C] text-base font-normal" style={{ fontFamily: 'Satoshi' }}>
                      Data Retention Policy
                    </label>
                    <div className="p-4 bg-[#F7F8FA] rounded-lg flex flex-col gap-2">
                      <div className="flex items-start gap-6">
                        {['3 months', '6 months', '12 months'].map((option) => (
                          <div key={option} className="flex items-center gap-2">
                            <span className="text-[#050F1C] text-base font-normal" style={{ fontFamily: 'Satoshi' }}>
                              {option}
                            </span>
                            <button
                              onClick={() => handlePreferenceChange('dataRetention', option)}
                              className={`w-4 h-4 rounded border border-[#050F1C] flex items-center justify-center ${
                                preferences.dataRetention === option ? 'bg-[#022658] border-[#022658]' : 'bg-transparent'
                              }`}
                            >
                              {preferences.dataRetention === option && (
                                <Check className="w-3 h-3 text-white" />
                              )}
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Backup Frequency */}
                  <div className="flex flex-col gap-2">
                    <label className="text-[#050F1C] text-base font-normal" style={{ fontFamily: 'Satoshi' }}>
                      Backup Frequency
                    </label>
                    <div className="p-4 bg-[#F7F8FA] rounded-lg flex flex-col gap-2">
                      <div className="flex items-start gap-6">
                        {['2 weeks', 'Monthly'].map((option) => (
                          <div key={option} className="flex items-center gap-2">
                            <span className="text-[#050F1C] text-base font-normal" style={{ fontFamily: 'Satoshi' }}>
                              {option}
                            </span>
                            <button
                              onClick={() => handlePreferenceChange('backupFrequency', option)}
                              className={`w-4 h-4 rounded border border-[#050F1C] flex items-center justify-center ${
                                preferences.backupFrequency === option ? 'bg-[#022658] border-[#022658]' : 'bg-transparent'
                              }`}
                            >
                              {preferences.backupFrequency === option && (
                                <Check className="w-3 h-3 text-white" />
                              )}
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Date format */}
                  <div className="flex flex-col gap-2">
                    <label className="text-[#050F1C] text-base font-normal" style={{ fontFamily: 'Satoshi' }}>
                      Date format
                    </label>
                    <div className="p-4 bg-[#F7F8FA] rounded-lg flex flex-col gap-2">
                      <div className="flex items-start gap-6">
                        {['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY/MM/DD'].map((option) => (
                          <div key={option} className="flex items-center gap-2">
                            <span className="text-[#050F1C] text-base font-normal" style={{ fontFamily: 'Satoshi' }}>
                              {option}
                            </span>
                            <button
                              onClick={() => handlePreferenceChange('dateFormat', option)}
                              className={`w-4 h-4 rounded border border-[#050F1C] flex items-center justify-center ${
                                preferences.dateFormat === option ? 'bg-[#022658] border-[#022658]' : 'bg-transparent'
                              }`}
                            >
                              {preferences.dateFormat === option && (
                                <Check className="w-3 h-3 text-white" />
                              )}
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Time format */}
                  <div className="flex flex-col gap-2">
                    <label className="text-[#050F1C] text-base font-normal" style={{ fontFamily: 'Satoshi' }}>
                      Time format
                    </label>
                    <div className="p-4 bg-[#F7F8FA] rounded-lg flex flex-col gap-2">
                      <div className="flex items-start gap-6">
                        {['12-hour', '24-hour'].map((option) => (
                          <div key={option} className="flex items-center gap-2">
                            <span className="text-[#050F1C] text-base font-normal" style={{ fontFamily: 'Satoshi' }}>
                              {option}
                            </span>
                            <button
                              onClick={() => handlePreferenceChange('timeFormat', option)}
                              className={`w-4 h-4 rounded border border-[#050F1C] flex items-center justify-center ${
                                preferences.timeFormat === option ? 'bg-[#022658] border-[#022658]' : 'bg-transparent'
                              }`}
                            >
                              {preferences.timeFormat === option && (
                                <Check className="w-3 h-3 text-white" />
                              )}
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Default format */}
                  <div className="flex flex-col gap-2">
                    <label className="text-[#050F1C] text-base font-normal" style={{ fontFamily: 'Satoshi' }}>
                      Default format
                    </label>
                    <div className="p-4 bg-[#F7F8FA] rounded-lg flex flex-col gap-2">
                      <div className="flex items-start gap-6">
                        {['PDF', 'Excel', 'CSV'].map((option) => (
                          <div key={option} className="flex items-center gap-2">
                            <span className="text-[#050F1C] text-base font-normal" style={{ fontFamily: 'Satoshi' }}>
                              {option}
                            </span>
                            <button
                              onClick={() => handlePreferenceChange('defaultFormat', option)}
                              className={`w-4 h-4 rounded border border-[#050F1C] flex items-center justify-center ${
                                preferences.defaultFormat === option ? 'bg-[#022658] border-[#022658]' : 'bg-transparent'
                              }`}
                            >
                              {preferences.defaultFormat === option && (
                                <Check className="w-3 h-3 text-white" />
                              )}
                            </button>
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
                  <div className="flex flex-col gap-6">
                    <div className="flex items-center gap-2">
                      <span className="text-[#050F1C] text-base font-normal" style={{ fontFamily: 'Satoshi' }}>
                        Change password
                      </span>
                      <button
                        onClick={() => toggleSection('changePassword')}
                        className="p-1 hover:bg-gray-100 rounded"
                      >
                        <ChevronRight
                          className="w-4 h-4 text-[#050F1C] transition-transform"
                          style={{ transform: expandedSections.changePassword ? 'rotate(-90deg)' : 'rotate(90deg)' }}
                        />
                      </button>
                    </div>

                    {/* Expanded Change Password Section */}
                    {expandedSections.changePassword && (
                      <div className="p-4 rounded-lg border border-[#D4E1EA] flex flex-col gap-10">
                        {/* Password Fields */}
                        <div className="flex items-start gap-6">
                          {/* Old Password */}
                          <div className="flex-1 flex flex-col gap-2">
                            <label className="text-[#050F1C] text-sm font-normal" style={{ fontFamily: 'Satoshi' }}>
                              Old password
                            </label>
                            <div className="px-4 py-4 bg-[#F7F8FA] rounded-lg flex items-center justify-between">
                              <input
                                type={showPasswords.oldPassword ? 'text' : 'password'}
                                value={passwordData.oldPassword}
                                onChange={(e) => setPasswordData(prev => ({ ...prev, oldPassword: e.target.value }))}
                                className="flex-1 bg-transparent text-[#050F1C] text-base font-medium border-0 outline-none"
                                style={{ fontFamily: 'Satoshi' }}
                              />
                              <button
                                onClick={() => setShowPasswords(prev => ({ ...prev, oldPassword: !prev.oldPassword }))}
                                className="p-1 hover:bg-gray-200 rounded"
                              >
                                {showPasswords.oldPassword ? (
                                  <EyeOff className="w-4 h-4 text-[#050F1C]" />
                                ) : (
                                  <Eye className="w-4 h-4 text-[#050F1C]" />
                                )}
                              </button>
                            </div>
                          </div>

                          {/* New Password */}
                          <div className="flex-1 flex flex-col gap-2">
                            <label className="text-[#050F1C] text-sm font-normal" style={{ fontFamily: 'Satoshi' }}>
                              New password
                            </label>
                            <div className="px-4 py-4 bg-[#F7F8FA] rounded-lg flex items-center justify-between">
                              <input
                                type={showPasswords.newPassword ? 'text' : 'password'}
                                value={passwordData.newPassword}
                                onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                                className="flex-1 bg-transparent text-[#050F1C] text-base font-medium border-0 outline-none"
                                style={{ fontFamily: 'Satoshi' }}
                              />
                              <button
                                onClick={() => setShowPasswords(prev => ({ ...prev, newPassword: !prev.newPassword }))}
                                className="p-1 hover:bg-gray-200 rounded"
                              >
                                {showPasswords.newPassword ? (
                                  <EyeOff className="w-4 h-4 text-[#050F1C]" />
                                ) : (
                                  <Eye className="w-4 h-4 text-[#050F1C]" />
                                )}
                              </button>
                            </div>
                            {/* Password Requirements */}
                            <div className="flex flex-col gap-1">
                              <p className="text-[#525866] text-xs font-normal" style={{ fontFamily: 'Satoshi' }}>
                                Password must be at least 8 characters
                              </p>
                              <p className="text-[#525866] text-xs font-normal" style={{ fontFamily: 'Satoshi' }}>
                                Password must include at least a character and number
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-start gap-10">
                          <button
                            onClick={() => {
                              setPasswordData({
                                oldPassword: '#ToniaMartins02#',
                                newPassword: '#@ToniaisaDiva#'
                              });
                              toggleSection('changePassword');
                            }}
                            className="flex-1 h-[58px] px-2.5 shadow-md rounded-lg border-2 border-[#0F2847] flex items-center justify-center gap-2.5"
                          >
                            <span className="text-[#022658] text-base font-bold" style={{ fontFamily: 'Satoshi' }}>Cancel Changes</span>
                          </button>
                          <button
                            onClick={() => {
                              console.log('Saving password changes:', passwordData);
                              toggleSection('changePassword');
                            }}
                            className="flex-1 h-[58px] px-2.5 bg-gradient-to-b from-[#022658] to-[#1A4983] shadow-md rounded-lg border-4 border-[rgba(15,40,71,0.15)] flex items-center justify-center gap-2.5"
                          >
                            <span className="text-white text-base font-bold" style={{ fontFamily: 'Satoshi' }}>Save Changes</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Active sessions */}
                  <div className="w-[600px] flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[#050F1C] text-base font-normal" style={{ fontFamily: 'Satoshi' }}>
                        Active sessions
                      </span>
                      <button
                        onClick={() => toggleSection('activeSessions')}
                        className="p-1 hover:bg-gray-100 rounded"
                      >
                        <ChevronRight
                          className="w-4 h-4 text-[#050F1C] transition-transform"
                          style={{ transform: expandedSections.activeSessions ? 'rotate(-90deg)' : 'rotate(90deg)' }}
                        />
                      </button>
                    </div>

                    {/* Expanded Active Sessions Section */}
                    {expandedSections.activeSessions && (
                      <div className="p-4 rounded-lg border border-[#D4E1EA] flex items-start justify-between">
                        <span className="text-[#050F1C] text-base font-normal" style={{ fontFamily: 'Satoshi' }}>
                          Currently logged in on:
                        </span>
                        <div className="flex flex-col items-end gap-3">
                          {activeSessions.map((session) => (
                            <div key={session.id} className="flex items-center gap-2">
                              <span className="text-[#050F1C] text-base font-normal" style={{ fontFamily: 'Satoshi' }}>
                                {session.device}
                              </span>
                              <button
                                onClick={() => {
                                  setActiveSessions(prev =>
                                    prev.map(s =>
                                      s.id === session.id ? { ...s, active: !s.active } : s
                                    )
                                  );
                                }}
                                className={`relative w-11 h-6 rounded-full border transition-colors ${
                                  session.active
                                    ? 'bg-[#022658] border-[#022658]'
                                    : 'bg-transparent border-[#868C98]'
                                }`}
                              >
                                <div
                                  className={`absolute top-0.5 w-2.5 h-2.5 bg-[#868C98] rounded-full transition-all ${
                                    session.active
                                      ? 'left-[26px] bg-white'
                                      : 'left-1'
                                  }`}
                                />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 2 factor authentication */}
                  <div className="flex flex-col gap-2">
                    <span className="text-[#525866] text-sm font-normal" style={{ fontFamily: 'Satoshi' }}>
                      2 factor authentication
                    </span>
                    <div className="p-4 rounded-lg border border-[#D4E1EA] flex flex-col gap-6">
                      {/* Enable 2FA */}
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[#050F1C] text-base font-normal" style={{ fontFamily: 'Satoshi' }}>
                            Enable 2FA
                          </span>
                          <button
                            onClick={() => toggleSection('enable2FA')}
                            className="p-1 hover:bg-gray-100 rounded"
                          >
                            <ChevronRight
                              className="w-4 h-4 text-[#050F1C] transition-transform"
                              style={{ transform: expandedSections.enable2FA ? 'rotate(-90deg)' : 'rotate(90deg)' }}
                            />
                          </button>
                        </div>

                        {/* Expanded Enable 2FA Section */}
                        {expandedSections.enable2FA && (
                          <div className="p-4 bg-[#F7F8FA] rounded-lg flex flex-col gap-10">
                            {/* PIN Fields */}
                            <div className="flex items-start gap-6">
                              {/* Enter PIN */}
                              <div className="flex-1 flex flex-col gap-2">
                                <label className="text-[#050F1C] text-sm font-normal" style={{ fontFamily: 'Satoshi' }}>
                                  Enter PIN
                                </label>
                                <div className="px-4 py-4 bg-white rounded-lg flex items-center justify-between">
                                  <input
                                    type={showPins.pin ? 'text' : 'password'}
                                    value={twoFAData.pin}
                                    onChange={(e) => setTwoFAData(prev => ({ ...prev, pin: e.target.value }))}
                                    className="flex-1 bg-transparent text-[#050F1C] text-base font-medium border-0 outline-none"
                                    style={{ fontFamily: 'Satoshi' }}
                                    maxLength={6}
                                  />
                                  <button
                                    onClick={() => setShowPins(prev => ({ ...prev, pin: !prev.pin }))}
                                    className="p-1 hover:bg-gray-200 rounded"
                                  >
                                    {showPins.pin ? (
                                      <EyeOff className="w-4 h-4 text-[#050F1C]" />
                                    ) : (
                                      <Eye className="w-4 h-4 text-[#050F1C]" />
                                    )}
                                  </button>
                                </div>
                              </div>

                              {/* Confirm PIN */}
                              <div className="flex-1 flex flex-col gap-2">
                                <label className="text-[#050F1C] text-sm font-normal" style={{ fontFamily: 'Satoshi' }}>
                                  Confirm PIN
                                </label>
                                <div className="px-4 py-4 bg-white rounded-lg flex items-center justify-between">
                                  <input
                                    type={showPins.confirmPin ? 'text' : 'password'}
                                    value={twoFAData.confirmPin}
                                    onChange={(e) => setTwoFAData(prev => ({ ...prev, confirmPin: e.target.value }))}
                                    className="flex-1 bg-transparent text-[#050F1C] text-base font-medium border-0 outline-none"
                                    style={{ fontFamily: 'Satoshi' }}
                                    maxLength={6}
                                  />
                                  <button
                                    onClick={() => setShowPins(prev => ({ ...prev, confirmPin: !prev.confirmPin }))}
                                    className="p-1 hover:bg-gray-200 rounded"
                                  >
                                    {showPins.confirmPin ? (
                                      <EyeOff className="w-4 h-4 text-[#050F1C]" />
                                    ) : (
                                      <Eye className="w-4 h-4 text-[#050F1C]" />
                                    )}
                                  </button>
                                </div>
                              </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-start gap-10">
                              <button
                                onClick={() => {
                                  setTwoFAData({ pin: '987654', confirmPin: '987654' });
                                  toggleSection('enable2FA');
                                }}
                                className="flex-1 h-[58px] px-2.5 shadow-md rounded-lg border-2 border-[#0F2847] flex items-center justify-center gap-2.5"
                              >
                                <span className="text-[#022658] text-base font-bold" style={{ fontFamily: 'Satoshi' }}>Cancel Changes</span>
                              </button>
                              <button
                                onClick={() => {
                                  console.log('Saving 2FA settings:', twoFAData);
                                  toggleSection('enable2FA');
                                }}
                                className="flex-1 h-[58px] px-2.5 bg-gradient-to-b from-[#022658] to-[#1A4983] shadow-md rounded-lg border-4 border-[rgba(15,40,71,0.15)] flex items-center justify-center gap-2.5"
                              >
                                <span className="text-white text-base font-bold" style={{ fontFamily: 'Satoshi' }}>Save Changes</span>
                              </button>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Change 2FA method */}
                      <div className="flex flex-col gap-2">
                        <div className="w-[218px] flex items-center justify-between">
                          <span className="text-[#050F1C] text-base font-normal" style={{ fontFamily: 'Satoshi' }}>
                            Change 2FA method
                          </span>
                          <button
                            onClick={() => toggleSection('change2FAMethod')}
                            className="p-1 hover:bg-gray-100 rounded"
                          >
                            <ChevronRight
                              className="w-4 h-4 text-[#050F1C] transition-transform"
                              style={{ transform: expandedSections.change2FAMethod ? 'rotate(-90deg)' : 'rotate(90deg)' }}
                            />
                          </button>
                        </div>

                        {/* Expanded Change 2FA Method Section */}
                        {expandedSections.change2FAMethod && (
                          <div className="p-4 bg-[#F7F8FA] rounded-lg flex flex-col gap-2">
                            <div className="flex items-start gap-6">
                              {/* PIN Option */}
                              <div className="flex items-center gap-2">
                                <span className="text-[#050F1C] text-base font-normal" style={{ fontFamily: 'Satoshi' }}>
                                  PIN
                                </span>
                                <button
                                  onClick={() => setTwoFAMethod('PIN')}
                                  className={`w-4 h-4 rounded border border-[#050F1C] flex items-center justify-center ${
                                    twoFAMethod === 'PIN' ? 'bg-[#022658] border-[#022658]' : 'bg-transparent'
                                  }`}
                                >
                                  {twoFAMethod === 'PIN' && (
                                    <div className="w-2.5 h-2.5 bg-white rounded-full"></div>
                                  )}
                                </button>
                              </div>

                              {/* Email OTP Option */}
                              <div className="flex items-center gap-2">
                                <span className="text-[#050F1C] text-base font-normal" style={{ fontFamily: 'Satoshi' }}>
                                  Email OTP
                                </span>
                                <button
                                  onClick={() => setTwoFAMethod('Email OTP')}
                                  className={`w-4 h-4 rounded border border-[#050F1C] flex items-center justify-center ${
                                    twoFAMethod === 'Email OTP' ? 'bg-[#022658] border-[#022658]' : 'bg-transparent'
                                  }`}
                                >
                                  {twoFAMethod === 'Email OTP' && (
                                    <div className="w-2.5 h-2.5 bg-white rounded-full"></div>
                                  )}
                                </button>
                              </div>

                              {/* Google Authenticator Option */}
                              <div className="flex items-center gap-2">
                                <span className="text-[#050F1C] text-base font-normal" style={{ fontFamily: 'Satoshi' }}>
                                  Google Authenticator
                                </span>
                                <button
                                  onClick={() => setTwoFAMethod('Google Authenticator')}
                                  className={`w-4 h-4 rounded border border-[#050F1C] flex items-center justify-center ${
                                    twoFAMethod === 'Google Authenticator' ? 'bg-[#022658] border-[#022658]' : 'bg-transparent'
                                  }`}
                                >
                                  {twoFAMethod === 'Google Authenticator' && (
                                    <div className="w-2.5 h-2.5 bg-white rounded-full"></div>
                                  )}
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Disable 2FA */}
                      <div className="flex flex-col gap-2">
                        <div className="w-[218px] flex items-center justify-between">
                          <span className="text-[#050F1C] text-base font-normal" style={{ fontFamily: 'Satoshi' }}>
                            Disable 2FA
                          </span>
                          <button
                            onClick={() => toggleSection('disable2FA')}
                            className="p-1 hover:bg-gray-100 rounded"
                          >
                            <ChevronRight
                              className="w-4 h-4 text-[#050F1C] transition-transform"
                              style={{ transform: expandedSections.disable2FA ? 'rotate(-90deg)' : 'rotate(90deg)' }}
                            />
                          </button>
                        </div>

                        {/* Expanded Disable 2FA Section */}
                        {expandedSections.disable2FA && (
                          <div className="p-4 bg-[#F7F8FA] rounded-lg flex flex-col gap-10">
                            <div className="flex items-end gap-6">
                              {/* Enter Password Field */}
                              <div className="flex-1 flex flex-col gap-2">
                                <label className="text-[#050F1C] text-sm font-normal" style={{ fontFamily: 'Satoshi' }}>
                                  Enter Password
                                </label>
                                <div className="px-4 py-4 bg-white rounded-lg flex items-center justify-between">
                                  <input
                                    type={showDisable2FAPassword ? 'text' : 'password'}
                                    value={disable2FAPassword}
                                    onChange={(e) => setDisable2FAPassword(e.target.value)}
                                    className="flex-1 bg-transparent text-[#050F1C] text-base font-medium border-0 outline-none"
                                    style={{ fontFamily: 'Satoshi' }}
                                  />
                                  <button
                                    onClick={() => setShowDisable2FAPassword(!showDisable2FAPassword)}
                                    className="p-1 hover:bg-gray-200 rounded"
                                  >
                                    {showDisable2FAPassword ? (
                                      <EyeOff className="w-4 h-4 text-[#050F1C]" />
                                    ) : (
                                      <Eye className="w-4 h-4 text-[#050F1C]" />
                                    )}
                                  </button>
                                </div>
                              </div>

                              {/* Disable Button */}
                              <button
                                onClick={() => {
                                  console.log('Disabling 2FA with password:', disable2FAPassword);
                                  toggleSection('disable2FA');
                                }}
                                className="flex-1 h-[58px] px-2.5 bg-gradient-to-b from-[#022658] to-[#1A4983] shadow-md rounded-lg border-4 border-[rgba(15,40,71,0.15)] flex items-center justify-center gap-2.5"
                              >
                                <span className="text-white text-base font-bold" style={{ fontFamily: 'Satoshi' }}>Disable 2FA</span>
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Placeholder for other tabs */}
              {activeTab !== 'Profile' && activeTab !== 'Company information' && activeTab !== 'Notifications' && activeTab !== 'Preferences' && activeTab !== 'Account & Security' && (
                <div className="py-8">
                  <p className="text-[#525866] text-sm">{activeTab} content coming soon...</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CorporateClientSystemSettingsPage;

