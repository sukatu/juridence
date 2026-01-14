import React, { useState, useEffect, useRef } from 'react';
import IntegrationConfigDrawer from './IntegrationConfigDrawer';
import AdminHeader from './AdminHeader';
import { apiGet } from '../../utils/api';
import { Phone, Globe, ChevronDown, ChevronUp, Camera, Info, MoreVertical, Plus, Mail, Plug, HardDrive, Database, Folder, MessageSquare, Cloud, CheckCircle, Circle, Eye, EyeOff } from 'lucide-react';

const SystemSettingsPage = ({ userInfo, onNavigate, onLogout }) => {
  const [activeTab, setActiveTab] = useState('profile');
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [showActiveSessions, setShowActiveSessions] = useState(false);
  const [showEnable2FA, setShowEnable2FA] = useState(false);
  const [showChange2FAMethod, setShowChange2FAMethod] = useState(false);
  const [showDisable2FA, setShowDisable2FA] = useState(false);
  const [selected2FAMethod, setSelected2FAMethod] = useState('pin');
  const [selectedIntegration, setSelectedIntegration] = useState(null);
  const [profileData, setProfileData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
    profile_picture: null
  });
  const [loading, setLoading] = useState(true);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef(null);
  
  // Notification settings
  const [notificationChannels, setNotificationChannels] = useState({
    inApp: true,
    email: true
  });
  const [notificationPreferences, setNotificationPreferences] = useState({
    caseUpdates: true,
    gazetteUpdates: true,
    searchRequests: true,
    errors: true,
    announcements: true,
    entityStatusChanges: true
  });

  // Load user profile data
  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        
        // Try to use userInfo prop first
        if (userInfo && (userInfo.first_name || userInfo.email)) {
          setProfileData({
            first_name: userInfo.first_name || '',
            last_name: userInfo.last_name || '',
            email: userInfo.email || '',
            phone_number: userInfo.phone_number || '',
            profile_picture: userInfo.profile_picture || userInfo.avatar || null
          });
          setLoading(false);
          return;
        }
        
        // Try localStorage as fallback
        try {
          const userDataStr = localStorage.getItem('userData');
          if (userDataStr) {
            const userData = JSON.parse(userDataStr);
            if (userData && (userData.first_name || userData.email)) {
              setProfileData({
                first_name: userData.first_name || '',
                last_name: userData.last_name || '',
                email: userData.email || '',
                phone_number: userData.phone_number || '',
                profile_picture: userData.profile_picture || userData.avatar || null
              });
              setLoading(false);
              return;
            }
          }
        } catch (storageError) {
          console.error('Error reading from localStorage:', storageError);
        }
        
        // Fetch from API
        const data = await apiGet('/profile/me');
        setProfileData({
          first_name: data.first_name || '',
          last_name: data.last_name || '',
          email: data.email || '',
          phone_number: data.phone_number || '',
          profile_picture: data.profile_picture || data.avatar || null
        });
      } catch (err) {
        console.error('Error loading profile:', err);
      } finally {
        setLoading(false);
      }
    };
    
    loadProfile();
  }, [userInfo]);

  // Get user display name
  const getUserName = () => {
    if (profileData.first_name && profileData.last_name) {
      return `${profileData.first_name} ${profileData.last_name}`;
    }
    if (profileData.first_name) {
      return profileData.first_name;
    }
    if (userInfo?.name) {
      return userInfo.name;
    }
    return 'User';
  };

  // Get profile picture URL (matches AdminHeader logic exactly)
  const getProfilePicture = () => {
    // Check userInfo first (like AdminHeader does)
    let profilePic = userInfo?.avatar || userInfo?.profile_picture;
    
    // If not in userInfo, check profileData
    if (!profilePic) {
      profilePic = profileData.profile_picture || profileData.avatar;
    }
    
    // Return the profile picture path directly (AdminHeader uses it as-is)
    // The path should already be in the correct format from the backend
    return profilePic || "/images/image.png";
  };

  // Handle profile picture upload
  const handleEditProfilePicture = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    try {
      setUploadingImage(true);
      const token = localStorage.getItem('accessToken');
      
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/profile/upload-avatar', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to upload avatar');
      }

      const data = await response.json();
      
      // Update profile data
      setProfileData(prev => ({
        ...prev,
        profile_picture: data.profile_picture
      }));
      
      // Update localStorage
      try {
        const currentUserData = JSON.parse(localStorage.getItem('userData') || '{}');
        const updatedUserData = {
          ...currentUserData,
          profile_picture: data.profile_picture,
          avatar: data.profile_picture
        };
        localStorage.setItem('userData', JSON.stringify(updatedUserData));
        window.dispatchEvent(new CustomEvent('authStateChanged'));
      } catch (storageError) {
        console.error('Error updating localStorage:', storageError);
      }
    } catch (err) {
      console.error('Upload error:', err);
      alert('Failed to upload avatar: ' + err.message);
    } finally {
      setUploadingImage(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile' },
    { id: 'account-security', label: 'Account & Security' },
    { id: 'notifications', label: 'Notifications' },
    { id: 'preferences', label: 'Preferences' },
    { id: 'integrations', label: 'Integrations' }
  ];

  return (
    <div className="bg-[#F7F8FA] min-h-screen w-full">
      {/* Header */}
      <AdminHeader userInfo={userInfo} onNavigate={onNavigate} onLogout={onLogout} />

      {/* Main Content */}
      <div className="px-6 w-full">
        <div className="flex flex-col items-start w-full bg-white pt-4 pb-[137px] px-6 gap-6 rounded-lg">
          {/* Page Title */}
          <span className="text-[#040E1B] text-xl whitespace-nowrap">Settings</span>

          {/* Settings Content */}
          <div className="flex flex-col items-start w-full gap-6">
            {/* Tabs */}
            <div className="flex items-start p-1 gap-4">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex flex-col items-start pb-2 ${
                    activeTab === tab.id ? 'border-b-2 border-[#022658]' : ''
                  }`}
                >
                  <span
                    className={`text-base whitespace-nowrap ${
                      activeTab === tab.id ? 'text-[#022658] font-bold' : 'text-[#525866]'
                    }`}
                  >
                    {tab.label}
                  </span>
                </button>
              ))}
            </div>

            {/* Profile Tab Content */}
            {activeTab === 'profile' && (
              <>
                {/* Section Title */}
                <div className="flex flex-col items-start gap-2">
                  <span className="text-[#040E1B] text-xl whitespace-nowrap">Personal information</span>
                  <span className="text-[#040E1B] text-base whitespace-nowrap">Update your photo and personal details here</span>
                </div>

                {/* Content Layout */}
                <div className="flex flex-col items-start w-full gap-8">
                  {/* Profile Photo Section */}
                  <div className="flex flex-col items-center gap-6">
                    <div className="flex flex-col items-center gap-2">
                      <img
                        src={getProfilePicture()}
                        alt={getUserName()}
                        className="w-20 h-20 object-cover rounded-full flex-shrink-0"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "/images/image.png";
                        }}
                      />
                      <span className="text-[#040E1B] text-xl font-bold whitespace-nowrap">{getUserName()}</span>
                    </div>
                    <div className="flex flex-col items-start gap-3">
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept="image/*"
                        className="hidden"
                      />
                      <button 
                        onClick={handleEditProfilePicture}
                        disabled={uploadingImage}
                        className="flex flex-col items-center bg-transparent text-left py-2 px-[59px] rounded-lg border-2 border-solid border-[#022658] hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" 
                        style={{ boxShadow: '0px 4px 4px #050F1C1A' }}
                      >
                        <span className="text-[#022658] text-xs font-bold whitespace-nowrap">
                          {uploadingImage ? 'Uploading...' : 'Edit'}
                        </span>
                      </button>
                      <span className="text-[#525866] text-sm whitespace-nowrap">At least 256px x 256px</span>
                    </div>
                  </div>

                  {/* Form Fields */}
                  <div className="w-full">
                    <div className="flex flex-col w-full mb-20 gap-6">
                      {/* Name and Email Row */}
                      <div className="flex items-start w-full gap-6">
                        <div className="flex flex-col items-start flex-1 gap-2">
                          <span className="text-[#040E1B] text-sm whitespace-nowrap">Name</span>
                          <input
                            type="text"
                            value={getUserName()}
                            readOnly
                            className="w-full text-[#040E1B] bg-[#F7F8FA] text-base p-4 rounded-lg border-0 outline-none"
                          />
                        </div>
                        <div className="flex flex-col items-start flex-1 gap-2">
                          <span className="text-[#040E1B] text-sm whitespace-nowrap">Email</span>
                          <input
                            type="text"
                            value={profileData.email || ''}
                            readOnly
                            className="w-full text-[#040E1B] bg-[#F7F8FA] text-base p-4 rounded-lg border-0 outline-none"
                          />
                        </div>
                      </div>

                      {/* Phone and Country Row */}
                      <div className="flex items-start w-full gap-6">
                        <div className="flex flex-col items-start flex-1 gap-2">
                          <span className="text-[#040E1B] text-sm whitespace-nowrap">Phone</span>
                          <div className="flex items-center w-full bg-[#F7F8FA] py-[13px] pl-4 rounded-lg">
                            <Phone className="w-4 h-4 text-[#525866] flex-shrink-0" />
                            <span className="text-[#040E1B] text-base ml-3 whitespace-nowrap">{profileData.phone_number || 'Not set'}</span>
                          </div>
                        </div>
                        <div className="flex flex-col items-start flex-1 gap-2">
                          <span className="text-[#040E1B] text-sm whitespace-nowrap">Country</span>
                          <div className="flex justify-between items-center w-full bg-[#F7F8FA] pr-4 rounded-lg">
                            <input
                              type="text"
                              placeholder="Ghana"
                              className="flex-1 text-[#040E1B] bg-transparent text-base py-4 pl-4 mr-1 border-0 outline-none"
                            />
                            <Globe className="w-4 h-4 text-[#525866] flex-shrink-0" />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-start w-full gap-10">
                      <button
                        className="flex flex-col items-center flex-1 py-[18px] rounded-lg border-2 border-solid border-[#022658] hover:bg-gray-50 transition-colors"
                        style={{ boxShadow: '0px 4px 4px #050F1C1A' }}
                      >
                        <span className="text-[#022658] text-base font-bold whitespace-nowrap" style={{ fontFamily: 'Satoshi' }}>Cancel Changes</span>
                      </button>
                      <button
                        className="flex flex-col items-center flex-1 py-[18px] rounded-lg border-4 border-solid border-[#0F284726] hover:opacity-90 transition-opacity"
                        style={{ background: 'linear-gradient(180deg, #022658, #1A4983)' }}
                      >
                        <span className="text-white text-base font-bold whitespace-nowrap" style={{ fontFamily: 'Satoshi' }}>Save Changes</span>
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Account & Security Tab Content */}
            {activeTab === 'account-security' && (
              <div className="flex flex-col items-start w-full gap-6">
                {/* Change Password */}
                <button 
                  onClick={() => setShowPasswordForm(!showPasswordForm)}
                  className="flex items-center gap-[11px] cursor-pointer hover:opacity-70"
                >
                  <span className="text-[#040E1B] text-base whitespace-nowrap" style={{ fontFamily: 'Satoshi' }}>Change Password</span>
                  {showPasswordForm ? (
                    <ChevronUp className="w-4 h-4 text-[#040E1B] flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-[#040E1B] flex-shrink-0" />
                  )}
                </button>

                {/* Change Password Form (when expanded) */}
                {showPasswordForm && (
                  <div className="flex flex-col w-full p-4 gap-10 rounded-lg border border-solid border-[#D4E1EA]">
                    {/* Old and New Password Row */}
                    <div className="flex items-start w-full gap-6">
                      <div className="flex flex-col items-start flex-1 gap-2">
                        <span className="text-[#040E1B] text-sm whitespace-nowrap">Old password</span>
                        <div className="flex justify-between items-center w-full bg-[#F7F8FA] pr-4 rounded-lg">
                          <input
                            type="password"
                            placeholder="#EricisanAdmin#"
                            className="flex-1 text-[#040E1B] bg-transparent text-base py-4 pl-4 mr-1 border-0 outline-none"
                          />
                          <EyeOff className="w-4 h-4 text-[#525866] flex-shrink-0" />
                        </div>
                      </div>
                      <div className="flex flex-col items-start flex-1 gap-2">
                        <span className="text-[#040E1B] text-sm whitespace-nowrap">New password</span>
                        <div className="flex justify-between items-center w-full bg-[#F7F8FA] pr-4 rounded-lg">
                          <input
                            type="password"
                            placeholder="#EricisanAdmin001#"
                            className="flex-1 text-[#040E1B] bg-transparent text-base py-4 pl-4 mr-1 border-0 outline-none"
                          />
                          <EyeOff className="w-4 h-4 text-[#525866] flex-shrink-0" />
                        </div>
                        <div className="flex flex-col items-start gap-1">
                          <span className="text-[#525866] text-xs whitespace-nowrap">Password must be at least 8 characters</span>
                          <span className="text-[#525866] text-xs whitespace-nowrap">Password must include at least a character and number</span>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-start w-full gap-10">
                      <button
                        onClick={() => setShowPasswordForm(false)}
                        className="flex flex-col items-center flex-1 py-[18px] rounded-lg border-2 border-solid border-[#022658] hover:bg-gray-50 transition-colors"
                        style={{ boxShadow: '0px 4px 4px #050F1C1A' }}
                      >
                        <span className="text-[#022658] text-base font-bold whitespace-nowrap" style={{ fontFamily: 'Satoshi' }}>Cancel Changes</span>
                      </button>
                      <button
                        className="flex flex-col items-center flex-1 py-[18px] rounded-lg border-4 border-solid border-[#0F284726] hover:opacity-90 transition-opacity"
                        style={{ background: 'linear-gradient(180deg, #022658, #1A4983)' }}
                      >
                        <span className="text-white text-base font-bold whitespace-nowrap" style={{ fontFamily: 'Satoshi' }}>Save Changes</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Active Sessions */}
                <button 
                  onClick={() => setShowActiveSessions(!showActiveSessions)}
                  className="flex items-center gap-2.5 cursor-pointer hover:opacity-70"
                >
                  <span className="text-[#040E1B] text-base whitespace-nowrap">Active sessions</span>
                  {showActiveSessions ? (
                    <ChevronUp className="w-4 h-4 text-[#040E1B] flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-[#040E1B] flex-shrink-0" />
                  )}
                </button>

                {/* Active Sessions Details (when expanded) */}
                {showActiveSessions && (
                  <div className="flex flex-col items-start gap-2">
                    <div className="flex items-center w-full pr-4 gap-1 rounded-lg border border-solid border-[#D4E1EA]">
                      <div className="flex items-center py-[33px] pl-4">
                        <span className="text-[#040E1B] text-base whitespace-nowrap">Currently logged in on:</span>
                      </div>
                      <div className="flex flex-col items-start py-4 gap-3 ml-auto">
                        <div className="flex items-center gap-2.5">
                          <span className="text-[#040E1B] text-base whitespace-nowrap">Chrome/Mac</span>
                          <div className="w-[38px] h-[18px] bg-[#022658] rounded-full flex items-center justify-end px-0.5">
                            <div className="w-[14px] h-[14px] bg-white rounded-full"></div>
                          </div>
                        </div>
                        <div className="flex items-center gap-[11px]">
                          <span className="text-[#040E1B] text-base whitespace-nowrap">Chrome/Windows</span>
                          <div className="w-[38px] h-[18px] bg-[#022658] rounded-full flex items-center justify-end px-0.5">
                            <div className="w-[14px] h-[14px] bg-white rounded-full"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 2 Factor Authentication */}
                <div className="flex flex-col items-start gap-2">
                  <span className="text-[#525866] text-sm whitespace-nowrap">2 factor authentication</span>
                  <div className="flex flex-col items-start p-4 gap-6 rounded-lg border border-solid border-[#D4E1EA]">
                    {/* Enable 2FA */}
                    <div className="flex flex-col items-start w-full gap-2">
                      <button 
                        onClick={() => setShowEnable2FA(!showEnable2FA)}
                        className="flex items-center gap-[11px] hover:opacity-70 transition-opacity cursor-pointer"
                      >
                        <span className="text-[#040E1B] text-base whitespace-nowrap">Enable 2FA</span>
                        {showEnable2FA ? (
                          <ChevronUp className="w-4 h-4 text-[#040E1B] flex-shrink-0" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-[#040E1B] flex-shrink-0" />
                        )}
                      </button>

                      {/* Enable 2FA Form (when expanded) */}
                      {showEnable2FA && (
                        <div className="flex flex-col w-full bg-[#F7F8FA] p-4 gap-10 rounded-lg">
                          {/* PIN Fields Row */}
                          <div className="flex items-start w-full gap-6">
                            <div className="flex flex-col items-start flex-1 gap-2">
                              <span className="text-[#040E1B] text-sm whitespace-nowrap">Enter PIN</span>
                              <div className="flex justify-between items-center w-full bg-white pr-4 rounded-lg">
                                <input
                                  type="password"
                                  placeholder="987654"
                                  className="flex-1 text-[#040E1B] bg-transparent text-base py-4 pl-4 mr-1 border-0 outline-none"
                                />
                                <EyeOff className="w-4 h-4 text-[#525866] flex-shrink-0 cursor-pointer" />
                              </div>
                            </div>
                            <div className="flex flex-col items-start flex-1 gap-2">
                              <span className="text-[#040E1B] text-sm whitespace-nowrap">Confirm PIN</span>
                              <div className="flex justify-between items-center w-full bg-white pr-4 rounded-lg">
                                <input
                                  type="password"
                                  placeholder="987654"
                                  className="flex-1 text-[#040E1B] bg-transparent text-base py-4 pl-4 mr-1 border-0 outline-none"
                                />
                                <EyeOff className="w-4 h-4 text-[#525866] flex-shrink-0 cursor-pointer" />
                              </div>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-start w-full gap-10">
                            <button
                              onClick={() => setShowEnable2FA(false)}
                              className="flex flex-col items-center flex-1 py-[18px] rounded-lg border-2 border-solid border-[#022658] hover:bg-gray-50 transition-colors"
                              style={{ boxShadow: '0px 4px 4px #050F1C1A' }}
                            >
                              <span className="text-[#022658] text-base font-bold whitespace-nowrap">Cancel changes</span>
                            </button>
                            <button
                              className="flex flex-col items-center flex-1 py-[18px] rounded-lg border-4 border-solid border-[#0F284726] hover:opacity-90 transition-opacity"
                              style={{ background: 'linear-gradient(180deg, #022658, #1A4983)' }}
                            >
                              <span className="text-white text-base font-bold whitespace-nowrap">Save changes</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Change 2FA Method */}
                    <div className="flex flex-col items-start gap-2">
                      <button 
                        onClick={() => setShowChange2FAMethod(!showChange2FAMethod)}
                        className="flex items-center gap-[58px] hover:opacity-70 transition-opacity cursor-pointer"
                      >
                        <span className="text-[#040E1B] text-base whitespace-nowrap">Change 2FA method</span>
                        {showChange2FAMethod ? (
                          <ChevronUp className="w-4 h-4 text-[#040E1B] flex-shrink-0" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-[#040E1B] flex-shrink-0" />
                        )}
                      </button>

                      {/* 2FA Method Options (when expanded) */}
                      {showChange2FAMethod && (
                        <div className="flex items-start bg-[#F7F8FA] p-4 gap-6 rounded-lg">
                          {/* PIN Option */}
                          <button 
                            onClick={() => setSelected2FAMethod('pin')}
                            className="flex items-center gap-3 hover:opacity-70 cursor-pointer"
                          >
                            <span className="text-[#040E1B] text-base whitespace-nowrap">PIN</span>
                            {selected2FAMethod === 'pin' ? (
                              <CheckCircle className="w-4 h-4 text-[#30AB40] flex-shrink-0" />
                            ) : (
                              <Circle className="w-4 h-4 text-[#525866] flex-shrink-0" />
                            )}
                          </button>

                          {/* Email OTP Option */}
                          <button 
                            onClick={() => setSelected2FAMethod('email')}
                            className="flex items-center gap-[11px] hover:opacity-70 cursor-pointer"
                          >
                            <span className="text-[#040E1B] text-base whitespace-nowrap">Email OTP</span>
                            {selected2FAMethod === 'email' ? (
                              <CheckCircle className="w-4 h-4 text-[#30AB40] flex-shrink-0" />
                            ) : (
                              <Circle className="w-4 h-4 text-[#525866] flex-shrink-0" />
                            )}
                          </button>

                          {/* Google Authenticator Option */}
                          <button 
                            onClick={() => setSelected2FAMethod('google')}
                            className="flex items-center gap-2.5 hover:opacity-70 cursor-pointer"
                          >
                            <span className="text-[#040E1B] text-base whitespace-nowrap">Google Authenticator</span>
                            {selected2FAMethod === 'google' ? (
                              <CheckCircle className="w-4 h-4 text-[#30AB40] flex-shrink-0" />
                            ) : (
                              <Circle className="w-4 h-4 text-[#525866] flex-shrink-0" />
                            )}
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Disable 2FA */}
                    <button 
                      onClick={() => setShowDisable2FA(!showDisable2FA)}
                      className="flex items-center hover:opacity-70 transition-opacity cursor-pointer"
                    >
                      <span className="text-[#040E1B] text-base mr-[121px] whitespace-nowrap">Disable 2FA</span>
                      {showDisable2FA ? (
                        <ChevronUp className="w-4 h-4 text-[#040E1B] flex-shrink-0" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-[#040E1B] flex-shrink-0" />
                      )}
                    </button>

                    {/* Disable 2FA Form (when expanded) */}
                    {showDisable2FA && (
                      <div className="flex items-start w-full bg-[#F7F8FA] p-4 gap-6 rounded-lg">
                        <div className="flex flex-col items-start flex-1 gap-2">
                          <span className="text-[#040E1B] text-sm whitespace-nowrap">Enter Password</span>
                          <div className="flex justify-between items-center w-full bg-white pr-4 rounded-lg">
                            <input
                              type="password"
                              placeholder="#EricisanAdmin001#"
                              className="flex-1 text-[#040E1B] bg-transparent text-base py-4 pl-4 mr-1 border-0 outline-none"
                            />
                            <EyeOff className="w-4 h-4 text-[#525866] flex-shrink-0 cursor-pointer" />
                          </div>
                        </div>
                        <button
                          className="flex flex-col items-center flex-1 py-[18px] mt-[23px] rounded-lg border-4 border-solid border-[#0F284726] hover:opacity-90 transition-opacity"
                          style={{ background: 'linear-gradient(180deg, #022658, #1A4983)' }}
                        >
                          <span className="text-white text-base font-bold whitespace-nowrap">Disable</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Preferences Tab Content */}
            {activeTab === 'preferences' && (
              <div className="flex flex-col items-start gap-6">
                {/* Language */}
                <div className="flex flex-col items-start gap-2">
                  <span className="text-[#040E1B] text-sm whitespace-nowrap">Language</span>
                  <button className="flex items-center bg-[#F7F8FA] text-left p-4 rounded-lg border-0 hover:bg-gray-100 transition-colors w-[490px]">
                    <span className="text-[#040E1B] text-base mr-auto whitespace-nowrap">English (Default)</span>
                    <ChevronDown className="w-4 h-4 text-[#525866] flex-shrink-0" />
                  </button>
                </div>

                {/* Data Retention Policy */}
                <div className="flex flex-col items-start gap-2">
                  <span className="text-[#040E1B] text-base whitespace-nowrap">Data Retention Policy</span>
                  <div className="flex items-start bg-[#F7F8FA] p-4 gap-6 rounded-lg">
                    <button className="flex items-center gap-2.5 hover:opacity-70 cursor-pointer">
                      <span className="text-[#040E1B] text-base whitespace-nowrap">3 months</span>
                      <Circle className="w-4 h-4 text-[#525866] flex-shrink-0" />
                    </button>
                    <button className="flex items-center gap-[11px] hover:opacity-70 cursor-pointer">
                      <span className="text-[#040E1B] text-base whitespace-nowrap">6 months</span>
                      <Circle className="w-4 h-4 text-[#525866] flex-shrink-0" />
                    </button>
                    <button className="flex items-center gap-2.5 hover:opacity-70 cursor-pointer">
                      <span className="text-[#040E1B] text-base whitespace-nowrap">12 months</span>
                      <Circle className="w-4 h-4 text-[#525866] flex-shrink-0" />
                    </button>
                  </div>
                </div>

                {/* Backup Frequency */}
                <div className="flex flex-col items-start gap-2">
                  <span className="text-[#040E1B] text-base whitespace-nowrap">Backup Frequency</span>
                  <div className="flex items-start bg-[#F7F8FA] p-4 gap-6 rounded-lg">
                    <button className="flex items-center gap-2.5 hover:opacity-70 cursor-pointer">
                      <span className="text-[#040E1B] text-base whitespace-nowrap">2 weeks</span>
                      <Circle className="w-4 h-4 text-[#525866] flex-shrink-0" />
                    </button>
                    <button className="flex items-center gap-[11px] hover:opacity-70 cursor-pointer">
                      <span className="text-[#040E1B] text-base whitespace-nowrap">Monthly</span>
                      <Circle className="w-4 h-4 text-[#525866] flex-shrink-0" />
                    </button>
                  </div>
                </div>

                {/* Date Format */}
                <div className="flex flex-col items-start gap-2">
                  <span className="text-[#040E1B] text-base whitespace-nowrap">Date format</span>
                  <div className="flex items-start bg-[#F7F8FA] p-4 gap-6 rounded-lg">
                    <button className="flex items-center gap-[11px] hover:opacity-70 cursor-pointer">
                      <span className="text-[#040E1B] text-base whitespace-nowrap">DD/MM/YYYY</span>
                      <Circle className="w-4 h-4 text-[#525866] flex-shrink-0" />
                    </button>
                    <button className="flex items-center gap-[11px] hover:opacity-70 cursor-pointer">
                      <span className="text-[#040E1B] text-base whitespace-nowrap">MM/DD/YYYY</span>
                      <Circle className="w-4 h-4 text-[#525866] flex-shrink-0" />
                    </button>
                    <button className="flex items-center gap-2.5 hover:opacity-70 cursor-pointer">
                      <span className="text-[#040E1B] text-base whitespace-nowrap">YYYY/MM/DD</span>
                      <Circle className="w-4 h-4 text-[#525866] flex-shrink-0" />
                    </button>
                  </div>
                </div>

                {/* Time Format */}
                <div className="flex flex-col items-start gap-2">
                  <span className="text-[#040E1B] text-base whitespace-nowrap">Time format</span>
                  <div className="flex items-start bg-[#F7F8FA] p-4 gap-6 rounded-lg">
                    <button className="flex items-center gap-2.5 hover:opacity-70 cursor-pointer">
                      <span className="text-[#040E1B] text-base whitespace-nowrap">12-hour</span>
                      <Circle className="w-4 h-4 text-[#525866] flex-shrink-0" />
                    </button>
                    <button className="flex items-center gap-2.5 hover:opacity-70 cursor-pointer">
                      <span className="text-[#040E1B] text-base whitespace-nowrap">24-hour</span>
                      <Circle className="w-4 h-4 text-[#525866] flex-shrink-0" />
                    </button>
                  </div>
                </div>

                {/* Default Format */}
                <div className="flex flex-col items-start gap-2">
                  <span className="text-[#040E1B] text-base whitespace-nowrap">Default format</span>
                  <div className="flex items-start bg-[#F7F8FA] p-4 gap-6 rounded-lg">
                    <button className="flex items-center gap-[11px] hover:opacity-70 cursor-pointer">
                      <span className="text-[#040E1B] text-base whitespace-nowrap">PDF</span>
                      <Circle className="w-4 h-4 text-[#525866] flex-shrink-0" />
                    </button>
                    <button className="flex items-center gap-3 hover:opacity-70 cursor-pointer">
                      <span className="text-[#040E1B] text-base whitespace-nowrap">Excel</span>
                      <Circle className="w-4 h-4 text-[#525866] flex-shrink-0" />
                    </button>
                    <button className="flex items-center gap-2.5 hover:opacity-70 cursor-pointer">
                      <span className="text-[#040E1B] text-base whitespace-nowrap">CSV</span>
                      <Circle className="w-4 h-4 text-[#525866] flex-shrink-0" />
                    </button>
                  </div>
                </div>

                {/* Auto Recalculate Risk */}
                <div className="flex flex-col items-start gap-2">
                  <span className="text-[#040E1B] text-base whitespace-nowrap">Auto recalculate risk</span>
                  <div className="flex items-start bg-[#F7F8FA] p-4 gap-6 rounded-lg">
                    <button className="flex items-center gap-[11px] hover:opacity-70 cursor-pointer">
                      <span className="text-[#040E1B] text-base whitespace-nowrap">Daily at midnight</span>
                      <Circle className="w-4 h-4 text-[#525866] flex-shrink-0" />
                    </button>
                    <button className="flex items-center gap-2.5 hover:opacity-70 cursor-pointer">
                      <span className="text-[#040E1B] text-base whitespace-nowrap">Weekly on Mondays</span>
                      <Circle className="w-4 h-4 text-[#525866] flex-shrink-0" />
                    </button>
                    <button className="flex items-center gap-[11px] hover:opacity-70 cursor-pointer">
                      <span className="text-[#040E1B] text-base whitespace-nowrap">Monthly on the first</span>
                      <Circle className="w-4 h-4 text-[#525866] flex-shrink-0" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Integrations Tab Content */}
            {activeTab === 'integrations' && (
              <div className="flex flex-col w-full gap-6">
                {/* All Connections Section */}
                <div className="flex justify-between items-start w-full">
                  <div className="flex items-center gap-1">
                    <span className="text-[#040E1B] text-base whitespace-nowrap">All Connections</span>
                    <Info className="w-4 h-4 text-[#525866] flex-shrink-0" />
                  </div>
                  {/* Gmail Connection */}
                  <div className="flex justify-between items-start flex-1 ml-6 pb-4 border-b border-[#E5E8EC]">
                    <div className="flex items-center gap-1">
                      <Mail className="w-6 h-6 text-[#525866] flex-shrink-0" />
                      <span className="text-[#040E1B] text-base whitespace-nowrap">Gmail</span>
                    </div>
                    <div className="flex flex-col items-start gap-2">
                      <span className="text-[#040E1B] text-base whitespace-nowrap">Status</span>
                      <div className="flex items-center justify-center bg-[#30AB401A] py-1 px-4 rounded-lg">
                        <span className="text-emerald-500 text-xs whitespace-nowrap">Connected</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-start gap-2">
                      <span className="text-[#040E1B] text-base whitespace-nowrap">Connections</span>
                      <span className="text-[#040E1B] text-base whitespace-nowrap">4</span>
                    </div>
                    <div className="flex flex-col items-start gap-2">
                      <span className="text-[#040E1B] text-base whitespace-nowrap">Last sync</span>
                      <span className="text-[#040E1B] text-base whitespace-nowrap">3 hours ago</span>
                    </div>
                    <MoreVertical className="w-4 h-4 text-[#525866] flex-shrink-0 cursor-pointer hover:opacity-70" />
                  </div>
                </div>

                {/* Add Connections Section */}
                <div className="flex flex-col w-full gap-6">
                  <div className="flex items-center gap-1">
                    <span className="text-[#040E1B] text-base whitespace-nowrap">Add connections</span>
                    <Plus className="w-4 h-4 text-[#525866] flex-shrink-0" />
                  </div>

                  {/* Integration Options */}
                  {[
                    { name: 'Slack', icon: MessageSquare, description: 'Send watchlist alerts to team Slack channel' },
                    { name: 'Google Drive', icon: HardDrive, description: 'Auto-save exported reports to company\'s shared drive and Backup all screening results to cloud folder' },
                    { name: 'Salesforce', icon: Database, description: 'Push risk scores to loan application system and Sync company due diligence data with CRM' },
                    { name: 'SharePoint', icon: Folder, description: 'Sync case documents to document management system and Auto-file court records in proper folders' }
                  ].map((integration, idx) => {
                    const IconComponent = integration.icon;
                    return (
                      <div key={idx} className="flex justify-between items-start w-full pb-4">
                        <div className="flex items-center gap-1">
                          <IconComponent className="w-6 h-6 text-[#525866] flex-shrink-0" />
                          <span className="text-[#040E1B] text-base whitespace-nowrap">{integration.name}</span>
                        </div>
                        <div className="flex flex-col items-start flex-1 ml-6 gap-2">
                          <span className="text-[#040E1B] text-base">{integration.description}</span>
                          <button 
                            onClick={() => setSelectedIntegration(integration)}
                            className="flex items-center bg-transparent text-left py-2 px-4 gap-1 rounded-lg border border-solid border-[#F59E0B] hover:bg-orange-50 transition-colors"
                          >
                            <Plus className="w-4 h-4 text-[#F59E0B] flex-shrink-0" />
                            <span className="text-[#F59E0B] text-base whitespace-nowrap">Add connection</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Notifications Tab Content */}
            {activeTab === 'notifications' && (
              <div className="flex flex-col items-start gap-6">
                {/* Notification Channels */}
                <div className="flex flex-col items-start gap-2">
                  <span className="text-[#040E1B] text-base whitespace-nowrap">Notification Channels</span>
                  <div className="flex items-start bg-[#F7F8FA] p-4 gap-6 rounded-lg">
                    <button 
                      onClick={() => setNotificationChannels(prev => ({ ...prev, inApp: !prev.inApp }))}
                      className="flex items-center gap-[11px] hover:opacity-70 cursor-pointer"
                    >
                      <span className="text-[#040E1B] text-base whitespace-nowrap">In-app</span>
                      {notificationChannels.inApp ? (
                        <CheckCircle className="w-4 h-4 text-[#30AB40] flex-shrink-0" />
                      ) : (
                        <Circle className="w-4 h-4 text-[#525866] flex-shrink-0" />
                      )}
                    </button>
                    <button 
                      onClick={() => setNotificationChannels(prev => ({ ...prev, email: !prev.email }))}
                      className="flex items-center gap-[11px] hover:opacity-70 cursor-pointer"
                    >
                      <span className="text-[#040E1B] text-base whitespace-nowrap">Email</span>
                      {notificationChannels.email ? (
                        <CheckCircle className="w-4 h-4 text-[#30AB40] flex-shrink-0" />
                      ) : (
                        <Circle className="w-4 h-4 text-[#525866] flex-shrink-0" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Notify me on... */}
                <div className="flex flex-col items-start gap-2">
                  <span className="text-[#525866] text-xs whitespace-nowrap">Notify me on...</span>
                  <div className="flex flex-col items-start gap-4">
                    {/* New case updates */}
                    <button
                      onClick={() => setNotificationPreferences(prev => ({ ...prev, caseUpdates: !prev.caseUpdates }))}
                      className="flex items-center hover:opacity-70 cursor-pointer"
                    >
                      <span className="text-[#040E1B] text-base mr-[276px] whitespace-nowrap">New case updates</span>
                      <div className={`w-[38px] h-[18px] rounded-full flex items-center ${notificationPreferences.caseUpdates ? 'bg-[#30AB40] justify-end' : 'bg-[#D4E1EA] justify-start'} px-0.5`}>
                        <div className="w-[14px] h-[14px] bg-white rounded-full"></div>
                      </div>
                    </button>

                    {/* New gazette updates */}
                    <button
                      onClick={() => setNotificationPreferences(prev => ({ ...prev, gazetteUpdates: !prev.gazetteUpdates }))}
                      className="flex items-center hover:opacity-70 cursor-pointer"
                    >
                      <span className="text-[#040E1B] text-base mr-[257px] whitespace-nowrap">New gazette updates</span>
                      <div className={`w-[38px] h-[18px] rounded-full flex items-center ${notificationPreferences.gazetteUpdates ? 'bg-[#30AB40] justify-end' : 'bg-[#D4E1EA] justify-start'} px-0.5`}>
                        <div className="w-[14px] h-[14px] bg-white rounded-full"></div>
                      </div>
                    </button>

                    {/* New search request */}
                    <button
                      onClick={() => setNotificationPreferences(prev => ({ ...prev, searchRequests: !prev.searchRequests }))}
                      className="flex items-center hover:opacity-70 cursor-pointer"
                    >
                      <span className="text-[#040E1B] text-base mr-[266px] whitespace-nowrap">New search request</span>
                      <div className={`w-[38px] h-[18px] rounded-full flex items-center ${notificationPreferences.searchRequests ? 'bg-[#30AB40] justify-end' : 'bg-[#D4E1EA] justify-start'} px-0.5`}>
                        <div className="w-[14px] h-[14px] bg-white rounded-full"></div>
                      </div>
                    </button>

                    {/* Error occurs */}
                    <button
                      onClick={() => setNotificationPreferences(prev => ({ ...prev, errors: !prev.errors }))}
                      className="flex items-center hover:opacity-70 cursor-pointer"
                    >
                      <span className="text-[#040E1B] text-base mr-[319px] whitespace-nowrap">Error occurs</span>
                      <div className={`w-[38px] h-[18px] rounded-full flex items-center ${notificationPreferences.errors ? 'bg-[#30AB40] justify-end' : 'bg-[#D4E1EA] justify-start'} px-0.5`}>
                        <div className="w-[14px] h-[14px] bg-white rounded-full"></div>
                      </div>
                    </button>

                    {/* System announcements */}
                    <button
                      onClick={() => setNotificationPreferences(prev => ({ ...prev, announcements: !prev.announcements }))}
                      className="flex items-center hover:opacity-70 cursor-pointer"
                    >
                      <span className="text-[#040E1B] text-base mr-[237px] whitespace-nowrap">System announcements</span>
                      <div className={`w-[38px] h-[18px] rounded-full flex items-center ${notificationPreferences.announcements ? 'bg-[#30AB40] justify-end' : 'bg-[#D4E1EA] justify-start'} px-0.5`}>
                        <div className="w-[14px] h-[14px] bg-white rounded-full"></div>
                      </div>
                    </button>

                    {/* Change of all entities status */}
                    <button
                      onClick={() => setNotificationPreferences(prev => ({ ...prev, entityStatusChanges: !prev.entityStatusChanges }))}
                      className="flex items-center hover:opacity-70 cursor-pointer"
                    >
                      <span className="text-[#040E1B] text-base mr-[212px] whitespace-nowrap">Change of all entities status</span>
                      <div className={`w-[38px] h-[18px] rounded-full flex items-center ${notificationPreferences.entityStatusChanges ? 'bg-[#30AB40] justify-end' : 'bg-[#D4E1EA] justify-start'} px-0.5`}>
                        <div className="w-[14px] h-[14px] bg-white rounded-full"></div>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Integration Configuration Drawer */}
      {selectedIntegration && (
        <IntegrationConfigDrawer
          integration={selectedIntegration}
          onClose={() => setSelectedIntegration(null)}
        />
      )}
    </div>
  );
};

export default SystemSettingsPage;

