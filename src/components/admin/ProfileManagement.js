import React, { useState, useEffect, useCallback } from 'react';
import {
  User,
  Mail,
  Phone,
  Building,
  Briefcase,
  Globe,
  Clock,
  Bell,
  BellOff,
  Camera,
  Trash2,
  Save,
  Edit3,
  X,
  Check,
  AlertCircle,
  Shield,
  Users,
  UserCheck,
  UserX,
  Eye,
  EyeOff,
  Upload,
  Download,
  LogOut
} from 'lucide-react';
import AdminHeader from './AdminHeader';
import { apiGet, apiPut } from '../../utils/api';

const ProfileManagement = ({ userInfo, onNavigate, onLogout }) => {
  // Profile data state
  const [profileData, setProfileData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
    organization: '',
    job_title: '',
    bio: '',
    language: 'en',
    timezone: 'UTC',
    email_notifications: true,
    sms_notifications: false,
    profile_picture: null
  });

  // UI state
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [showUserManagement, setShowUserManagement] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // Password change state
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  // User management state
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // Load current user profile
  const loadProfile = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Helper function to extract profile data from user object
      const extractProfileData = (user) => {
        if (!user) return null;
        return {
          first_name: user.first_name || '',
          last_name: user.last_name || '',
          email: user.email || '',
          phone_number: user.phone_number || '',
          organization: user.organization || '',
          job_title: user.job_title || '',
          bio: user.bio || '',
          language: user.language || 'en',
          timezone: user.timezone || 'UTC',
          email_notifications: user.email_notifications !== undefined ? user.email_notifications : true,
          sms_notifications: user.sms_notifications || false,
          profile_picture: user.profile_picture || user.avatar || null
        };
      };
      
      // Try to use userInfo prop first if available
      if (userInfo && (userInfo.first_name || userInfo.email || userInfo.id)) {
        const profileDataFromUserInfo = extractProfileData(userInfo);
        if (profileDataFromUserInfo) {
          setProfileData(profileDataFromUserInfo);
          setIsLoading(false);
          return;
        }
      }
      
      // Try to load from localStorage as fallback
      try {
        const userDataStr = localStorage.getItem('userData');
        if (userDataStr) {
          const userData = JSON.parse(userDataStr);
          if (userData && (userData.first_name || userData.email || userData.id)) {
            const profileDataFromStorage = extractProfileData(userData);
            if (profileDataFromStorage) {
              setProfileData(profileDataFromStorage);
              setIsLoading(false);
              return;
            }
          }
        }
      } catch (storageError) {
        console.error('Error reading from localStorage:', storageError);
      }
      
      // Otherwise, try to fetch from API
      const data = await apiGet('/profile/me');
      setProfileData(extractProfileData(data) || {
        first_name: '',
        last_name: '',
        email: '',
        phone_number: '',
        organization: '',
        job_title: '',
        bio: '',
        language: 'en',
        timezone: 'UTC',
        email_notifications: true,
        sms_notifications: false,
        profile_picture: null
      });
    } catch (err) {
      // If API fails, try fallbacks
      let fallbackData = null;
      
      // Try userInfo prop
      if (userInfo && (userInfo.first_name || userInfo.email || userInfo.id)) {
        fallbackData = {
          first_name: userInfo.first_name || '',
          last_name: userInfo.last_name || '',
          email: userInfo.email || '',
          phone_number: userInfo.phone_number || '',
          organization: userInfo.organization || '',
          job_title: userInfo.job_title || '',
          bio: userInfo.bio || '',
          language: userInfo.language || 'en',
          timezone: userInfo.timezone || 'UTC',
          email_notifications: userInfo.email_notifications !== undefined ? userInfo.email_notifications : true,
          sms_notifications: userInfo.sms_notifications || false,
          profile_picture: userInfo.profile_picture || userInfo.avatar || null
        };
      }
      
      // Try localStorage if userInfo didn't work
      if (!fallbackData) {
        try {
          const userDataStr = localStorage.getItem('userData');
          if (userDataStr) {
            const userData = JSON.parse(userDataStr);
            if (userData && (userData.first_name || userData.email || userData.id)) {
              fallbackData = {
                first_name: userData.first_name || '',
                last_name: userData.last_name || '',
                email: userData.email || '',
                phone_number: userData.phone_number || '',
                organization: userData.organization || '',
                job_title: userData.job_title || '',
                bio: userData.bio || '',
                language: userData.language || 'en',
                timezone: userData.timezone || 'UTC',
                email_notifications: userData.email_notifications !== undefined ? userData.email_notifications : true,
                sms_notifications: userData.sms_notifications || false,
                profile_picture: userData.profile_picture || userData.avatar || null
              };
            }
          }
        } catch (storageError) {
          console.error('Error reading from localStorage:', storageError);
        }
      }
      
      if (fallbackData) {
        setProfileData(fallbackData);
        // Don't show error if we successfully loaded from fallback
      } else {
        setError('Failed to load profile: ' + err.message);
      }
    } finally {
      setIsLoading(false);
    }
  }, [userInfo]);

  // Load all users (admin only)
  const loadUsers = useCallback(async () => {
    try {
      setUsersLoading(true);
      const token = localStorage.getItem('accessToken');
      const response = await fetch('/api/profile/users', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to load users');
      }

      const data = await response.json();
      setUsers(data);
    } catch (err) {
      setError('Failed to load users: ' + err.message);
    } finally {
      setUsersLoading(false);
    }
  }, []);

  // Load data on component mount
  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  // Form validation
  const validateForm = () => {
    const errors = {};
    
    if (!profileData.first_name.trim()) {
      errors.first_name = 'First name is required';
    }
    if (!profileData.last_name.trim()) {
      errors.last_name = 'Last name is required';
    }
    if (!profileData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(profileData.email)) {
      errors.email = 'Email is invalid';
    }
    if (profileData.phone_number && !/^[\+]?[1-9][\d]{0,15}$/.test(profileData.phone_number)) {
      errors.phone_number = 'Phone number is invalid';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Password validation
  const validatePasswordForm = () => {
    const errors = {};
    
    if (!passwordData.current_password) {
      errors.current_password = 'Current password is required';
    }
    if (!passwordData.new_password) {
      errors.new_password = 'New password is required';
    } else if (passwordData.new_password.length < 8) {
      errors.new_password = 'Password must be at least 8 characters';
    }
    if (passwordData.new_password !== passwordData.confirm_password) {
      errors.confirm_password = 'Passwords do not match';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Save profile changes
  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setIsSaving(true);
      setError(null);
      
      // Use apiPut for consistent authentication handling
      const updatedData = await apiPut('/profile/me', profileData);
      
      // Update profile data state
      setProfileData({
        first_name: updatedData.first_name || '',
        last_name: updatedData.last_name || '',
        email: updatedData.email || '',
        phone_number: updatedData.phone_number || '',
        organization: updatedData.organization || '',
        job_title: updatedData.job_title || '',
        bio: updatedData.bio || '',
        language: updatedData.language || 'en',
        timezone: updatedData.timezone || 'UTC',
        email_notifications: updatedData.email_notifications !== undefined ? updatedData.email_notifications : true,
        sms_notifications: updatedData.sms_notifications || false,
        profile_picture: updatedData.profile_picture || null
      });
      
      // Update localStorage userData
      try {
        const currentUserData = JSON.parse(localStorage.getItem('userData') || '{}');
        const updatedUserData = {
          ...currentUserData,
          first_name: updatedData.first_name,
          last_name: updatedData.last_name,
          email: updatedData.email,
          phone_number: updatedData.phone_number,
          organization: updatedData.organization,
          job_title: updatedData.job_title,
          bio: updatedData.bio,
          language: updatedData.language,
          timezone: updatedData.timezone,
          email_notifications: updatedData.email_notifications,
          sms_notifications: updatedData.sms_notifications,
          profile_picture: updatedData.profile_picture
        };
        localStorage.setItem('userData', JSON.stringify(updatedUserData));
        
        // Dispatch event to update userInfo in parent components
        window.dispatchEvent(new CustomEvent('authStateChanged'));
      } catch (storageError) {
        console.error('Error updating localStorage:', storageError);
      }
      
      setSuccess('Profile updated successfully');
      setIsEditing(false);
    } catch (err) {
      console.error('Save error:', err);
      setError('Failed to update profile: ' + (err.message || err.detail || 'Unknown error'));
    } finally {
      setIsSaving(false);
    }
  };

  // Change password
  const handlePasswordChange = async () => {
    if (!validatePasswordForm()) {
      return;
    }

    try {
      setIsSaving(true);
      const token = localStorage.getItem('accessToken');
      const response = await fetch('/api/profile/change-password', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          current_password: passwordData.current_password,
          new_password: passwordData.new_password
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to change password');
      }

      setSuccess('Password changed successfully');
      setShowPasswordForm(false);
      setPasswordData({
        current_password: '',
        new_password: '',
        confirm_password: ''
      });
      setError(null);
    } catch (err) {
      setError('Failed to change password: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  // Upload avatar
  const handleAvatarUpload = async (event) => {
    const file = event.target.files[0];
    
    if (!file) {
      return;
    }

    const fileData = {
      name: file.name,
      type: file.type,
      size: file.size
    };

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target.result);
    };
    reader.readAsDataURL(file);

    try {
      setIsSaving(true);
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
        console.error('Upload error:', errorData);
        throw new Error(errorData.detail || 'Failed to upload avatar');
      }

      const data = await response.json();
      
      setProfileData(prev => ({
        ...prev,
        profile_picture: data.profile_picture
      }));
      setImagePreview(null);
      setSuccess('Avatar uploaded successfully');
      setError(null);
      
      // Update userData in localStorage
      try {
        const currentUserData = JSON.parse(localStorage.getItem('userData') || '{}');
        const updatedUserData = {
          ...currentUserData,
          profile_picture: data.profile_picture,
          avatar: data.profile_picture // Also update avatar field for compatibility
        };
        localStorage.setItem('userData', JSON.stringify(updatedUserData));
        
        // Dispatch event to update userInfo in parent components
        window.dispatchEvent(new CustomEvent('authStateChanged'));
      } catch (storageError) {
        console.error('Error updating localStorage:', storageError);
      }
    } catch (err) {
      console.error('Upload error:', err);
      setError('Failed to upload avatar: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  // Delete avatar
  const handleDeleteAvatar = async () => {
    try {
      setIsSaving(true);
      const token = localStorage.getItem('accessToken');
      const response = await fetch('/api/profile/avatar', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete avatar');
      }

      setProfileData(prev => ({
        ...prev,
        profile_picture: null
      }));
      setImagePreview(null);
      setSuccess('Avatar deleted successfully');
      setError(null);
      
      // Update userData in localStorage
      try {
        const currentUserData = JSON.parse(localStorage.getItem('userData') || '{}');
        const updatedUserData = {
          ...currentUserData,
          profile_picture: null,
          avatar: null // Also update avatar field for compatibility
        };
        localStorage.setItem('userData', JSON.stringify(updatedUserData));
        
        // Dispatch event to update userInfo in parent components
        window.dispatchEvent(new CustomEvent('authStateChanged'));
      } catch (storageError) {
        console.error('Error updating localStorage:', storageError);
      }
      const currentUserData = JSON.parse(localStorage.getItem('userData') || '{}');
      const updatedUserData = {
        ...currentUserData,
        profile_picture: null
      };
      localStorage.setItem('userData', JSON.stringify(updatedUserData));
      
      // Dispatch profile update event
      window.dispatchEvent(new CustomEvent('profileUpdated'));
    } catch (err) {
      setError('Failed to delete avatar: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  // Clear image preview
  const clearImagePreview = () => {
    setImagePreview(null);
  };

  // Delete user (admin only)
  const handleDeleteUser = async (user) => {
    setUserToDelete(user);
    setShowDeleteModal(true);
  };

  const confirmDeleteUser = async () => {
    if (!userToDelete) return;

    try {
      setIsSaving(true);
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`/api/profile/users/${userToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete user');
      }

      setSuccess('User deleted successfully');
      loadUsers();
      setShowDeleteModal(false);
      setUserToDelete(null);
      setError(null);
    } catch (err) {
      setError('Failed to delete user: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  // Toggle user status (admin only)
  const handleToggleUserStatus = async (user) => {
    try {
      setIsSaving(true);
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`/api/profile/users/${user.id}/toggle-status`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to update user status');
      }

      setSuccess(`User status updated successfully`);
      loadUsers();
      setError(null);
    } catch (err) {
      setError('Failed to update user status: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  // Filter users
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || user.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // Quick login function for testing
  const handleQuickLogin = async () => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: 'admin@test.com',
          password: 'admin123'
        })
      });

      if (!response.ok) {
        throw new Error('Login failed');
      }

      const data = await response.json();
      localStorage.setItem('accessToken', data.access_token);
      localStorage.setItem('userData', JSON.stringify(data.user));
      localStorage.setItem('isAuthenticated', 'true');
      
      setSuccess('Logged in successfully! Refreshing profile...');
      setTimeout(() => {
        loadProfile();
      }, 1000);
    } catch (err) {
      setError('Quick login failed: ' + err.message);
    }
  };

  // Logout function
  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('userData');
    localStorage.removeItem('isAuthenticated');
    setProfileData({
      first_name: '',
      last_name: '',
      email: '',
      phone_number: '',
      organization: '',
      job_title: '',
      bio: '',
      language: 'en',
      timezone: 'UTC',
      email_notifications: true,
      sms_notifications: false,
      profile_picture: null
    });
    setSuccess('Logged out successfully');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Show login prompt if no token
  if (!localStorage.getItem('accessToken')) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Authentication Required</h2>
            <p className="text-slate-600 mb-6">
              You need to be logged in to access profile management.
            </p>
            <div className="space-y-4">
              <button
                onClick={handleQuickLogin}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Login as Admin (Test)
              </button>
              <div className="text-sm text-slate-500">
                <p>Test Credentials:</p>
                <p>Email: admin@test.com</p>
                <p>Password: admin123</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#F7F8FA] min-h-screen w-full">
      {/* Header */}
      <AdminHeader userInfo={userInfo} onNavigate={onNavigate} onLogout={onLogout} />

      {/* Main Content */}
      <div className="px-6 w-full">
        <div className="w-full bg-white px-6 rounded-lg">
          <div className="flex flex-col items-start self-stretch mt-4 mb-10 gap-4">
            {/* Page Title */}
            <span className="text-[#040E1B] text-xl whitespace-nowrap" style={{ fontFamily: 'Poppins' }}>Profile Management</span>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 self-stretch">
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center px-4 py-2 text-sm font-medium text-white bg-[#022658] rounded-lg hover:bg-[#1A4983] transition-colors"
                  style={{ fontFamily: 'Satoshi' }}
                >
                  <Edit3 className="h-4 w-4 mr-2" />
                  Edit Profile
                </button>
              ) : (
                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setValidationErrors({});
                      setImagePreview(null);
                      loadProfile();
                    }}
                    className="flex items-center px-4 py-2 text-sm font-medium text-[#022658] bg-white border-2 border-[#022658] rounded-lg hover:bg-gray-50 transition-colors"
                    style={{ fontFamily: 'Satoshi' }}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancel Changes
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex items-center px-4 py-2 text-sm font-medium text-white bg-[#022658] rounded-lg hover:bg-[#1A4983] disabled:opacity-50 transition-colors"
                    style={{ fontFamily: 'Satoshi' }}
                  >
                    {isSaving ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    Save Changes
                  </button>
                </div>
              )}
            </div>

            {/* Error/Success Messages */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-3 w-full">
                <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                <div>
                  <p className="text-red-800 font-medium">Error</p>
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
                <button onClick={() => setError(null)} className="ml-auto text-red-400 hover:text-red-600">
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}

            {success && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center space-x-3 w-full">
                <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                <div>
                  <p className="text-green-800 font-medium">Success</p>
                  <p className="text-green-700 text-sm">{success}</p>
                </div>
                <button onClick={() => setSuccess(null)} className="ml-auto text-green-400 hover:text-green-600">
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}

            {/* Profile Form */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full self-stretch">
              {/* Profile Picture */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
                  <h3 className="text-lg font-medium text-slate-900 mb-4">Profile Picture</h3>
                  <div className="flex flex-col items-center space-y-4">
                    <div className="relative">
                      {imagePreview || profileData.profile_picture ? (
                        <img
                          src={imagePreview || profileData.profile_picture}
                          alt="Profile"
                          className="w-24 h-24 rounded-full object-cover border-2 border-slate-200"
                        />
                      ) : (
                        <div className="w-24 h-24 rounded-full bg-slate-100 flex items-center justify-center border-2 border-slate-200">
                          <User className="h-8 w-8 text-slate-400" />
                        </div>
                      )}
                      {isEditing && (
                        <div className="absolute -bottom-2 -right-2 flex space-x-1">
                          <label className="bg-blue-600 text-white p-1 rounded-full cursor-pointer hover:bg-blue-700 transition-colors">
                            <Camera className="h-4 w-4" />
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleAvatarUpload}
                              className="hidden"
                            />
                          </label>
                          {imagePreview && (
                            <button
                              onClick={clearImagePreview}
                              className="bg-yellow-600 text-white p-1 rounded-full hover:bg-yellow-700 transition-colors"
                              title="Cancel preview"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          )}
                          {(profileData.profile_picture || imagePreview) && (
                            <button
                              onClick={handleDeleteAvatar}
                              className="bg-red-600 text-white p-1 rounded-full hover:bg-red-700 transition-colors"
                              title="Delete avatar"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-slate-600">
                        {profileData.first_name} {profileData.last_name}
                      </p>
                      <p className="text-xs text-slate-500">{profileData.email}</p>
                    </div>
                  </div>
                </div>

                {/* Password Section */}
                <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 mt-6">
                  <h3 className="text-lg font-medium text-slate-900 mb-4">Security</h3>
                  {!showPasswordForm ? (
              <button
                onClick={() => setShowPasswordForm(true)}
                className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
              >
                <Shield className="h-4 w-4 mr-2" />
                Change Password
              </button>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Current Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.current ? 'text' : 'password'}
                      value={passwordData.current_password}
                      onChange={(e) => setPasswordData({...passwordData, current_password: e.target.value})}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        validationErrors.current_password ? 'border-red-300' : 'border-slate-300'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords({...showPasswords, current: !showPasswords.current})}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                    >
                      {showPasswords.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {validationErrors.current_password && (
                    <p className="text-red-500 text-xs mt-1">{validationErrors.current_password}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.new ? 'text' : 'password'}
                      value={passwordData.new_password}
                      onChange={(e) => setPasswordData({...passwordData, new_password: e.target.value})}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        validationErrors.new_password ? 'border-red-300' : 'border-slate-300'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords({...showPasswords, new: !showPasswords.new})}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                    >
                      {showPasswords.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {validationErrors.new_password && (
                    <p className="text-red-500 text-xs mt-1">{validationErrors.new_password}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.confirm ? 'text' : 'password'}
                      value={passwordData.confirm_password}
                      onChange={(e) => setPasswordData({...passwordData, confirm_password: e.target.value})}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        validationErrors.confirm_password ? 'border-red-300' : 'border-slate-300'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords({...showPasswords, confirm: !showPasswords.confirm})}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                    >
                      {showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {validationErrors.confirm_password && (
                    <p className="text-red-500 text-xs mt-1">{validationErrors.confirm_password}</p>
                  )}
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      setShowPasswordForm(false);
                      setPasswordData({current_password: '', new_password: '', confirm_password: ''});
                      setValidationErrors({});
                    }}
                    className="flex-1 px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handlePasswordChange}
                    disabled={isSaving}
                    className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                  >
                    {isSaving ? 'Changing...' : 'Change Password'}
                  </button>
                </div>
              </div>
                  )}
                </div>
              </div>

              {/* Profile Details */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
                  <h3 className="text-lg font-medium text-slate-900 mb-6">Profile Information</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  First Name *
                </label>
                <input
                  type="text"
                  value={profileData.first_name}
                  onChange={(e) => setProfileData({...profileData, first_name: e.target.value})}
                  disabled={!isEditing}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    validationErrors.first_name ? 'border-red-300' : 'border-slate-300'
                  } ${!isEditing ? 'bg-slate-50' : ''}`}
                />
                {validationErrors.first_name && (
                  <p className="text-red-500 text-xs mt-1">{validationErrors.first_name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Last Name *
                </label>
                <input
                  type="text"
                  value={profileData.last_name}
                  onChange={(e) => setProfileData({...profileData, last_name: e.target.value})}
                  disabled={!isEditing}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    validationErrors.last_name ? 'border-red-300' : 'border-slate-300'
                  } ${!isEditing ? 'bg-slate-50' : ''}`}
                />
                {validationErrors.last_name && (
                  <p className="text-red-500 text-xs mt-1">{validationErrors.last_name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                    disabled={!isEditing}
                    className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      validationErrors.email ? 'border-red-300' : 'border-slate-300'
                    } ${!isEditing ? 'bg-slate-50' : ''}`}
                  />
                </div>
                {validationErrors.email && (
                  <p className="text-red-500 text-xs mt-1">{validationErrors.email}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="tel"
                    value={profileData.phone_number}
                    onChange={(e) => setProfileData({...profileData, phone_number: e.target.value})}
                    disabled={!isEditing}
                    className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      validationErrors.phone_number ? 'border-red-300' : 'border-slate-300'
                    } ${!isEditing ? 'bg-slate-50' : ''}`}
                  />
                </div>
                {validationErrors.phone_number && (
                  <p className="text-red-500 text-xs mt-1">{validationErrors.phone_number}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Organization
                </label>
                <div className="relative">
                  <Building className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    value={profileData.organization}
                    onChange={(e) => setProfileData({...profileData, organization: e.target.value})}
                    disabled={!isEditing}
                    className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      validationErrors.organization ? 'border-red-300' : 'border-slate-300'
                    } ${!isEditing ? 'bg-slate-50' : ''}`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Job Title
                </label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    value={profileData.job_title}
                    onChange={(e) => setProfileData({...profileData, job_title: e.target.value})}
                    disabled={!isEditing}
                    className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      validationErrors.job_title ? 'border-red-300' : 'border-slate-300'
                    } ${!isEditing ? 'bg-slate-50' : ''}`}
                  />
                </div>
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Bio
              </label>
              <textarea
                value={profileData.bio}
                onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
                disabled={!isEditing}
                rows={4}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  validationErrors.bio ? 'border-red-300' : 'border-slate-300'
                } ${!isEditing ? 'bg-slate-50' : ''}`}
                placeholder="Tell us about yourself..."
              />
            </div>

            {/* Preferences */}
            <div className="mt-6 pt-6 border-t border-slate-200">
              <h4 className="text-md font-medium text-slate-900 mb-4">Preferences</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Language
                  </label>
                  <select
                    value={profileData.language}
                    onChange={(e) => setProfileData({...profileData, language: e.target.value})}
                    disabled={!isEditing}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      validationErrors.language ? 'border-red-300' : 'border-slate-300'
                    } ${!isEditing ? 'bg-slate-50' : ''}`}
                  >
                    <option value="en">English</option>
                    <option value="fr">French</option>
                    <option value="es">Spanish</option>
                    <option value="de">German</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Timezone
                  </label>
                  <select
                    value={profileData.timezone}
                    onChange={(e) => setProfileData({...profileData, timezone: e.target.value})}
                    disabled={!isEditing}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      validationErrors.timezone ? 'border-red-300' : 'border-slate-300'
                    } ${!isEditing ? 'bg-slate-50' : ''}`}
                  >
                    <option value="UTC">UTC</option>
                    <option value="America/New_York">Eastern Time</option>
                    <option value="America/Chicago">Central Time</option>
                    <option value="America/Denver">Mountain Time</option>
                    <option value="America/Los_Angeles">Pacific Time</option>
                    <option value="Europe/London">London</option>
                    <option value="Europe/Paris">Paris</option>
                    <option value="Asia/Tokyo">Tokyo</option>
                    <option value="Africa/Accra">Accra</option>
                  </select>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="email_notifications"
                    checked={profileData.email_notifications}
                    onChange={(e) => setProfileData({...profileData, email_notifications: e.target.checked})}
                    disabled={!isEditing}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
                  />
                  <label htmlFor="email_notifications" className="ml-2 block text-sm text-slate-700">
                    <div className="flex items-center">
                      <Bell className="h-4 w-4 mr-2" />
                      Email notifications
                    </div>
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="sms_notifications"
                    checked={profileData.sms_notifications}
                    onChange={(e) => setProfileData({...profileData, sms_notifications: e.target.checked})}
                    disabled={!isEditing}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
                  />
                  <label htmlFor="sms_notifications" className="ml-2 block text-sm text-slate-700">
                    <div className="flex items-center">
                      <BellOff className="h-4 w-4 mr-2" />
                      SMS notifications
                    </div>
                  </label>
                </div>
              </div>
            </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* User Management Section (Admin Only) */}
      {showUserManagement && (
        <div className="px-6 w-full mt-4">
          <div className="w-full bg-white px-6 rounded-lg">
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-medium text-slate-900">User Management</h3>
                <button
                  onClick={loadUsers}
                  disabled={usersLoading}
                  className="flex items-center px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 disabled:opacity-50 transition-colors"
                >
                  {usersLoading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-slate-600 mr-2"></div>
                  ) : (
                    <Download className="h-4 w-4 mr-2" />
                  )}
                  Refresh
                </button>
              </div>

              {/* Search and Filter */}
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="pending">Pending</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>

              {/* Users Table */}
              <div className="overflow-x-auto w-full">
                <table className="min-w-full divide-y divide-slate-200 w-full">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Created
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-200">
                    {filteredUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-slate-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              {user.profile_picture ? (
                                <img
                                  className="h-10 w-10 rounded-full"
                                  src={user.profile_picture}
                                  alt={user.first_name}
                                />
                              ) : (
                                <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center">
                                  <User className="h-5 w-5 text-slate-400" />
                                </div>
                              )}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-slate-900">
                                {user.first_name} {user.last_name}
                              </div>
                              <div className="text-sm text-slate-500">
                                {user.organization || 'No organization'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                          {user.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            user.role === 'admin' 
                              ? 'bg-purple-100 text-purple-800' 
                              : user.role === 'premium'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            user.status === 'active' 
                              ? 'bg-green-100 text-green-800' 
                              : user.status === 'inactive'
                              ? 'bg-red-100 text-red-800'
                              : user.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {user.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                          {new Date(user.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleToggleUserStatus(user)}
                              className={`${
                                user.status === 'active' 
                                  ? 'text-red-600 hover:text-red-900' 
                                  : 'text-green-600 hover:text-green-900'
                              }`}
                              title={user.status === 'active' ? 'Deactivate' : 'Activate'}
                            >
                              {user.status === 'active' ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                            </button>
                            <button
                              onClick={() => handleDeleteUser(user)}
                              className="text-red-600 hover:text-red-900"
                              title="Delete User"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {filteredUsers.length === 0 && (
                <div className="text-center py-8">
                  <User className="mx-auto h-12 w-12 text-slate-400" />
                  <h3 className="mt-2 text-sm font-medium text-slate-900">No users found</h3>
                  <p className="mt-1 text-sm text-slate-500">
                    {searchQuery ? 'Try adjusting your search criteria.' : 'No users have been created yet.'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center mb-4">
              <AlertCircle className="h-6 w-6 text-red-500 mr-3" />
              <h3 className="text-lg font-medium text-slate-900">Delete User</h3>
            </div>
            <p className="text-slate-600 mb-6">
              Are you sure you want to delete <strong>{userToDelete?.first_name} {userToDelete?.last_name}</strong>? 
              This action cannot be undone and will permanently remove the user and all associated data.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setUserToDelete(null);
                }}
                className="px-4 py-2 text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteUser}
                disabled={isSaving}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {isSaving ? 'Deleting...' : 'Delete User'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileManagement;
