import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  Mail, 
  Phone, 
  Building, 
  CreditCard, 
  Shield, 
  Bell, 
  Save, 
  Edit3,
  Check,
  X,
  Crown,
  Settings as SettingsIcon
} from 'lucide-react';
import useNotifications from '../hooks/useNotifications';
import NotificationContainer from '../components/NotificationContainer';

// Password Change Form Component
const PasswordChangeForm = ({ onSubmit, showError, showSuccess }) => {
  const [formData, setFormData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.new_password !== formData.confirm_password) {
      showError('Password Mismatch', 'New password and confirmation do not match');
      return;
    }
    if (formData.new_password.length < 8) {
      showError('Invalid Password', 'New password must be at least 8 characters long');
      return;
    }
    
    setIsSubmitting(true);
    const success = await onSubmit(formData);
    if (success) {
      setFormData({
        current_password: '',
        new_password: '',
        confirm_password: ''
      });
    }
    setIsSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Current Password
        </label>
        <input
          type="password"
          name="current_password"
          value={formData.current_password}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
          placeholder="Enter current password"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          New Password
        </label>
        <input
          type="password"
          name="new_password"
          value={formData.new_password}
          onChange={handleChange}
          required
          minLength={8}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
          placeholder="Enter new password"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Confirm New Password
        </label>
        <input
          type="password"
          name="confirm_password"
          value={formData.confirm_password}
          onChange={handleChange}
          required
          minLength={8}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
          placeholder="Confirm new password"
        />
      </div>
      <button 
        type="submit"
        disabled={isSubmitting}
        className="bg-sky-600 text-white py-2 px-4 rounded-lg hover:bg-sky-700 disabled:opacity-50 transition-colors"
      >
        {isSubmitting ? 'Updating...' : 'Update Password'}
      </button>
    </form>
  );
};

const Settings = () => {
  const navigate = useNavigate();
  const { notifications: toastNotifications, removeNotification, showSuccess, showError, showWarning, showInfo } = useNotifications();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
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
    sms_notifications: false
  });
  const [subscriptionData, setSubscriptionData] = useState({
    plan: 'Free',
    status: 'Active',
    expires_at: null,
    is_premium: false,
    features: [],
    usage: {},
    limits: {}
  });
  const [subscriptionPlans, setSubscriptionPlans] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [notificationStats, setNotificationStats] = useState({
    total: 0,
    unread: 0,
    read: 0,
    archived: 0
  });
  const [securitySettings, setSecuritySettings] = useState({
    two_factor_auth: { is_enabled: false },
    api_keys: [],
    active_sessions: [],
    recent_events: [],
    security_score: 0
  });

  // Load user data from backend
  const loadUserData = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('/api/profile/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const userData = await response.json();
        setUserData(userData);
        setFormData({
          first_name: userData.first_name || '',
          last_name: userData.last_name || '',
          email: userData.email || '',
          phone_number: userData.phone_number || '',
          organization: userData.organization || '',
          job_title: userData.job_title || '',
          bio: userData.bio || '',
          language: userData.language || 'en',
          timezone: userData.timezone || 'UTC',
          email_notifications: userData.email_notifications !== false,
          sms_notifications: userData.sms_notifications === true
        });
      } else {
        console.error('Error loading user data:', response.statusText);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  // Load subscription plans from backend
  const loadSubscriptionPlans = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('/api/subscription/plans', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const plans = await response.json();
        setSubscriptionPlans(plans);
      }
    } catch (error) {
      console.error('Error loading subscription plans:', error);
    }
  };

  // Load subscription data from backend
  const loadSubscriptionData = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('/api/subscription/current', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setSubscriptionData({
          plan: data.plan,
          status: data.status,
          expires_at: data.expires_at,
          is_premium: data.is_premium,
          features: data.features,
          usage: data.usage,
          limits: data.limits
        });
      }
    } catch (error) {
      console.error('Error loading subscription data:', error);
    }
  };

  // Load notifications
  const loadNotifications = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('/api/notifications/', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications || []);
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  // Load notification stats
  const loadNotificationStats = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('/api/notifications/stats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setNotificationStats(data);
      }
    } catch (error) {
      console.error('Error loading notification stats:', error);
    }
  };

  // Load security settings
  const loadSecuritySettings = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('/api/security/settings', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setSecuritySettings(data);
      }
    } catch (error) {
      console.error('Error loading security settings:', error);
    }
  };

  // Check authentication status and load data
  useEffect(() => {
    const authStatus = localStorage.getItem('isAuthenticated');
    
    if (authStatus === 'true') {
      setIsAuthenticated(true);
      
      // Load all data from backend
      loadUserData();
      loadSubscriptionData();
      loadSubscriptionPlans();
      loadNotifications();
      loadNotificationStats();
      loadSecuritySettings();
    } else {
      navigate('/login');
    }
    setIsLoading(false);
  }, [navigate]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSave = async () => {
    setIsLoading(true);
    showInfo('Saving Profile', 'Updating your profile information...');
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('/api/profile/me', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const updatedUser = await response.json();
        localStorage.setItem('userData', JSON.stringify(updatedUser));
        setUserData(updatedUser);
        setIsEditing(false);
        showSuccess('Profile Updated', 'Your profile has been updated successfully!');
      } else {
        const error = await response.json();
        showError('Update Failed', error.detail || 'Error updating profile. Please try again.');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      showError('Update Failed', 'Error updating profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      first_name: userData?.first_name || '',
      last_name: userData?.last_name || '',
      email: userData?.email || '',
      phone_number: userData?.phone_number || '',
      organization: userData?.organization || '',
      job_title: userData?.job_title || '',
      bio: userData?.bio || '',
      language: userData?.language || 'en',
      timezone: userData?.timezone || 'UTC',
      email_notifications: userData?.email_notifications !== false,
      sms_notifications: userData?.sms_notifications === true
    });
    setIsEditing(false);
  };

  // Subscription management functions
  const handleUpgradeSubscription = async (plan) => {
    showInfo('Upgrading Subscription', 'Processing your subscription upgrade...');
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('/api/subscription/upgrade', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ plan })
      });

      if (response.ok) {
        const data = await response.json();
        showSuccess('Subscription Upgraded', data.message);
        loadSubscriptionData(); // Reload subscription data
      } else {
        const error = await response.json();
        showError('Upgrade Failed', error.detail || 'Error upgrading subscription');
      }
    } catch (error) {
      console.error('Error upgrading subscription:', error);
      showError('Upgrade Failed', 'Error upgrading subscription');
    }
  };

  const handleCancelSubscription = async () => {
    showWarning('Cancel Subscription', 'Are you sure you want to cancel your subscription?', 0);
    showInfo('Cancelling Subscription', 'Processing your subscription cancellation...');
    // Note: In a real app, you'd want a proper confirmation modal instead of just a warning notification
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('/api/subscription/cancel', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        showSuccess('Subscription Cancelled', data.message);
        loadSubscriptionData(); // Reload subscription data
      } else {
        const error = await response.json();
        showError('Cancellation Failed', error.detail || 'Error cancelling subscription');
      }
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      showError('Cancellation Failed', 'Error cancelling subscription');
    }
  };

  // Notification management functions
  const handleMarkAsRead = async (notificationId) => {
    showInfo('Updating Notification', 'Marking notification as read...');
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: 'read' })
      });

      if (response.ok) {
        showSuccess('Notification Updated', 'Notification marked as read');
        loadNotifications();
        loadNotificationStats();
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    showInfo('Updating Notifications', 'Marking all notifications as read...');
    try {
      const token = localStorage.getItem('accessToken');
      
      // Mark each notification as read individually
      const unreadNotifications = notifications.filter(n => !n.is_read);
      const promises = unreadNotifications.map(notification => 
        fetch(`/api/notifications/${notification.id}/read`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
      );
      
      await Promise.all(promises);
      showSuccess('Notifications Updated', 'All notifications marked as read');
      loadNotifications();
      loadNotificationStats();
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      showError('Update Failed', 'Error marking notifications as read. Please try again.');
    }
  };

  // Security functions
  const handleChangePassword = async (passwordData) => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('/api/security/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(passwordData)
      });

      if (response.ok) {
        const data = await response.json();
        showSuccess('Password Changed', data.message);
        return true;
      } else {
        const error = await response.json();
        showError('Password Change Failed', error.detail || 'Error changing password');
        return false;
      }
    } catch (error) {
      console.error('Error changing password:', error);
      showError('Password Change Failed', 'Error changing password');
      return false;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading settings...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-4">Access Denied</h1>
          <p className="text-slate-600 mb-6">You need to be logged in to access settings.</p>
          <button
            onClick={() => navigate('/login')}
            className="bg-sky-600 text-white px-6 py-2 rounded-lg hover:bg-sky-700 transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'profile', name: 'Profile', icon: User },
    { id: 'subscription', name: 'Subscription', icon: CreditCard },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'security', name: 'Security', icon: Shield }
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <NotificationContainer 
        notifications={toastNotifications} 
        onRemove={removeNotification} 
      />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <SettingsIcon className="h-8 w-8 text-sky-600" />
            <h1 className="text-3xl font-bold text-slate-900">Settings</h1>
          </div>
          <p className="text-slate-600">Manage your account settings and preferences</p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <nav className="space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                      activeTab === tab.id
                        ? 'bg-sky-50 text-sky-700 border border-sky-200'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {tab.name}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="bg-white rounded-lg shadow-sm border border-slate-200">
                <div className="px-6 py-4 border-b border-slate-200">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-slate-900">Profile Information</h2>
                    {!isEditing ? (
                      <button
                        onClick={() => setIsEditing(true)}
                        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                      >
                        <Edit3 className="h-4 w-4" />
                        Edit Profile
                      </button>
                    ) : (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={handleSave}
                          disabled={isLoading}
                          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 disabled:opacity-50 rounded-lg transition-colors"
                        >
                          <Save className="h-4 w-4" />
                          {isLoading ? 'Saving...' : 'Save Changes'}
                        </button>
                        <button
                          onClick={handleCancel}
                          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                          <X className="h-4 w-4" />
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-6">
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        First Name
                      </label>
                      <input
                        type="text"
                        name="first_name"
                        value={formData.first_name}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 disabled:bg-slate-50 disabled:text-slate-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Last Name
                      </label>
                      <input
                        type="text"
                        name="last_name"
                        value={formData.last_name}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 disabled:bg-slate-50 disabled:text-slate-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Email Address
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 disabled:bg-slate-50 disabled:text-slate-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Phone Number
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input
                          type="tel"
                          name="phone_number"
                          value={formData.phone_number}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 disabled:bg-slate-50 disabled:text-slate-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Organization
                      </label>
                      <div className="relative">
                        <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input
                          type="text"
                          name="organization"
                          value={formData.organization}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 disabled:bg-slate-50 disabled:text-slate-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Job Title
                      </label>
                      <input
                        type="text"
                        name="job_title"
                        value={formData.job_title}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 disabled:bg-slate-50 disabled:text-slate-500"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Bio
                      </label>
                      <textarea
                        name="bio"
                        rows={3}
                        value={formData.bio}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 disabled:bg-slate-50 disabled:text-slate-500"
                        placeholder="Tell us about yourself..."
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Subscription Tab */}
            {activeTab === 'subscription' && (
              <div className="space-y-6">
                {/* Current Plan */}
                <div className="bg-white rounded-lg shadow-sm border border-slate-200">
                  <div className="px-6 py-4 border-b border-slate-200">
                    <h2 className="text-lg font-semibold text-slate-900">Current Subscription</h2>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${subscriptionData.is_premium ? 'bg-amber-100' : 'bg-slate-100'}`}>
                          <Crown className={`h-6 w-6 ${subscriptionData.is_premium ? 'text-amber-600' : 'text-slate-600'}`} />
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold text-slate-900">{subscriptionData.plan} Plan</h3>
                          <p className="text-slate-600">Status: <span className="text-green-600 font-medium">{subscriptionData.status}</span></p>
                        </div>
                      </div>
                      {subscriptionData.is_premium && (
                        <div className="text-right">
                          <p className="text-sm text-slate-600">Expires on</p>
                          <p className="font-medium text-slate-900">{formatDate(subscriptionData.expires_at)}</p>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <h4 className="font-medium text-slate-900 mb-2">Included Features</h4>
                        <ul className="space-y-1">
                          {subscriptionData.features.map((feature, index) => (
                            <li key={index} className="flex items-center gap-2 text-sm text-slate-600">
                              <Check className="h-4 w-4 text-green-500" />
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-medium text-slate-900 mb-2">Usage This Month</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-600">Searches</span>
                            <span className="font-medium">
                              {subscriptionData.usage?.searches_this_month || 0} / {subscriptionData.limits?.searches_per_month || 'Unlimited'}
                            </span>
                          </div>
                          <div className="w-full bg-slate-200 rounded-full h-2">
                            <div 
                              className="bg-sky-600 h-2 rounded-full" 
                              style={{ 
                                width: `${subscriptionData.limits?.searches_per_month ? 
                                  Math.min((subscriptionData.usage?.searches_this_month || 0) / subscriptionData.limits.searches_per_month * 100, 100) : 0}%` 
                              }}
                            ></div>
                          </div>
                          {subscriptionData.usage?.api_calls_this_month !== undefined && (
                            <>
                              <div className="flex justify-between text-sm">
                                <span className="text-slate-600">API Calls</span>
                                <span className="font-medium">
                                  {subscriptionData.usage.api_calls_this_month} / {subscriptionData.limits?.api_calls_per_month || 'Unlimited'}
                                </span>
                              </div>
                              <div className="w-full bg-slate-200 rounded-full h-2">
                                <div 
                                  className="bg-amber-600 h-2 rounded-full" 
                                  style={{ 
                                    width: `${subscriptionData.limits?.api_calls_per_month ? 
                                      Math.min((subscriptionData.usage.api_calls_this_month || 0) / subscriptionData.limits.api_calls_per_month * 100, 100) : 0}%` 
                                  }}
                                ></div>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Upgrade Options */}
                {!subscriptionData.is_premium && subscriptionPlans.length > 0 && (
                  <div className="bg-white rounded-lg shadow-sm border border-slate-200">
                    <div className="px-6 py-4 border-b border-slate-200">
                      <h2 className="text-lg font-semibold text-slate-900">Upgrade Your Plan</h2>
                    </div>
                    <div className="p-6">
                      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                        {subscriptionPlans
                          .filter(plan => plan.id !== 'free' && !plan.is_current)
                          .map((plan) => (
                            <div 
                              key={plan.id}
                              className={`border rounded-lg p-6 ${
                                plan.is_popular 
                                  ? 'border-amber-200 bg-amber-50' 
                                  : 'border-slate-200'
                              }`}
                            >
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="text-lg font-semibold text-slate-900">{plan.name}</h3>
                                {plan.is_popular && (
                                  <span className="bg-amber-100 text-amber-800 text-xs font-medium px-2 py-1 rounded-full">Popular</span>
                                )}
                              </div>
                              <p className="text-3xl font-bold text-slate-900 mb-4">
                                ${plan.price}
                                <span className="text-lg font-normal text-slate-600">/{plan.billing_cycle}</span>
                              </p>
                              <p className="text-sm text-slate-600 mb-4">{plan.description}</p>
                              <ul className="space-y-2 mb-6">
                                {plan.features.map((feature, index) => (
                                  <li key={index} className="flex items-center gap-2 text-sm text-slate-600">
                                    <Check className="h-4 w-4 text-green-500" />
                                    {feature.name}
                                    {feature.limit && (
                                      <span className="text-xs text-slate-500">({feature.limit} {feature.limit === 1000 ? 'calls/month' : 'per month'})</span>
                                    )}
                                  </li>
                                ))}
                              </ul>
                              <button 
                                onClick={() => handleUpgradeSubscription(plan.id)}
                                className={`w-full text-white py-2 px-4 rounded-lg transition-colors ${
                                  plan.is_popular 
                                    ? 'bg-amber-600 hover:bg-amber-700' 
                                    : 'bg-sky-600 hover:bg-sky-700'
                                }`}
                              >
                                Upgrade to {plan.name}
                              </button>
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Cancel Subscription for Premium Users */}
                {subscriptionData.is_premium && (
                  <div className="bg-white rounded-lg shadow-sm border border-slate-200">
                    <div className="px-6 py-4 border-b border-slate-200">
                      <h2 className="text-lg font-semibold text-slate-900">Manage Subscription</h2>
                    </div>
                    <div className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-sm font-medium text-slate-900">Cancel Subscription</h3>
                          <p className="text-sm text-slate-600">You can cancel your subscription at any time</p>
                        </div>
                        <button
                          onClick={handleCancelSubscription}
                          className="bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors"
                        >
                          Cancel Subscription
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <div className="space-y-6">
                {/* Notification Stats */}
                <div className="bg-white rounded-lg shadow-sm border border-slate-200">
                  <div className="px-6 py-4 border-b border-slate-200">
                    <div className="flex items-center justify-between">
                      <h2 className="text-lg font-semibold text-slate-900">Notifications</h2>
                      {notificationStats.unread > 0 && (
                        <button
                          onClick={handleMarkAllAsRead}
                          className="text-sm text-sky-600 hover:text-sky-700 font-medium"
                        >
                          Mark all as read
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-slate-900">{notificationStats.total}</div>
                        <div className="text-sm text-slate-600">Total</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">{notificationStats.unread}</div>
                        <div className="text-sm text-slate-600">Unread</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">{notificationStats.read}</div>
                        <div className="text-sm text-slate-600">Read</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-slate-400">{notificationStats.archived}</div>
                        <div className="text-sm text-slate-600">Archived</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recent Notifications */}
                <div className="bg-white rounded-lg shadow-sm border border-slate-200">
                  <div className="px-6 py-4 border-b border-slate-200">
                    <h2 className="text-lg font-semibold text-slate-900">Recent Notifications</h2>
                  </div>
                  <div className="divide-y divide-slate-200">
                    {(notifications || []).slice(0, 10).map((notification) => (
                      <div key={notification.id} className="p-4 hover:bg-slate-50">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="text-sm font-medium text-slate-900">{notification.title}</h3>
                              {notification.status === 'unread' && (
                                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                              )}
                            </div>
                            <p className="text-sm text-slate-600 mt-1">{notification.message}</p>
                            <p className="text-xs text-slate-500 mt-1">
                              {new Date(notification.created_at).toLocaleString()}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            {notification.status === 'unread' && (
                              <button
                                onClick={() => handleMarkAsRead(notification.id)}
                                className="text-xs text-sky-600 hover:text-sky-700 font-medium"
                              >
                                Mark as read
                              </button>
                            )}
                            {notification.action_url && (
                              <a
                                href={notification.action_url}
                                className="text-xs text-sky-600 hover:text-sky-700 font-medium"
                              >
                                {notification.action_text || 'View'}
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                    {(notifications || []).length === 0 && (
                      <div className="p-8 text-center text-slate-500">
                        <Bell className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                        <p>No notifications yet</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Notification Preferences */}
                <div className="bg-white rounded-lg shadow-sm border border-slate-200">
                  <div className="px-6 py-4 border-b border-slate-200">
                    <h2 className="text-lg font-semibold text-slate-900">Notification Preferences</h2>
                  </div>
                  <div className="p-6">
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-sm font-medium text-slate-900">Email Notifications</h3>
                          <p className="text-sm text-slate-600">Receive updates about your searches and account activity</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            name="email_notifications"
                            checked={formData.email_notifications}
                            onChange={handleInputChange}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-sky-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-600"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-sm font-medium text-slate-900">SMS Notifications</h3>
                          <p className="text-sm text-slate-600">Receive urgent updates via text message</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            name="sms_notifications"
                            checked={formData.sms_notifications}
                            onChange={handleInputChange}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-sky-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-600"></div>
                        </label>
                      </div>

                      <div className="pt-4 border-t border-slate-200">
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                              Language
                            </label>
                            <select
                              name="language"
                              value={formData.language}
                              onChange={handleInputChange}
                              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                            >
                              <option value="en">English</option>
                              <option value="fr">Français</option>
                              <option value="es">Español</option>
                              <option value="de">Deutsch</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                              Timezone
                            </label>
                            <select
                              name="timezone"
                              value={formData.timezone}
                              onChange={handleInputChange}
                              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                            >
                              <option value="UTC">UTC</option>
                              <option value="America/New_York">Eastern Time</option>
                              <option value="America/Chicago">Central Time</option>
                              <option value="America/Denver">Mountain Time</option>
                              <option value="America/Los_Angeles">Pacific Time</option>
                              <option value="Europe/London">London</option>
                              <option value="Europe/Paris">Paris</option>
                              <option value="Asia/Tokyo">Tokyo</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <div className="space-y-6">
                {/* Security Score */}
                <div className="bg-white rounded-lg shadow-sm border border-slate-200">
                  <div className="px-6 py-4 border-b border-slate-200">
                    <h2 className="text-lg font-semibold text-slate-900">Security Overview</h2>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-medium text-slate-900">Security Score</h3>
                        <p className="text-sm text-slate-600">Based on your security settings and activity</p>
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-bold text-slate-900">{securitySettings.security_score}/100</div>
                        <div className="w-32 bg-slate-200 rounded-full h-2 mt-2">
                          <div 
                            className={`h-2 rounded-full ${
                              securitySettings.security_score >= 80 ? 'bg-green-500' :
                              securitySettings.security_score >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${securitySettings.security_score}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Change Password */}
                <div className="bg-white rounded-lg shadow-sm border border-slate-200">
                  <div className="px-6 py-4 border-b border-slate-200">
                    <h2 className="text-lg font-semibold text-slate-900">Change Password</h2>
                  </div>
                  <div className="p-6">
                    <PasswordChangeForm 
                      onSubmit={handleChangePassword} 
                      showError={showError}
                      showSuccess={showSuccess}
                    />
                  </div>
                </div>

                {/* Two-Factor Authentication */}
                <div className="bg-white rounded-lg shadow-sm border border-slate-200">
                  <div className="px-6 py-4 border-b border-slate-200">
                    <h2 className="text-lg font-semibold text-slate-900">Two-Factor Authentication</h2>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-medium text-slate-900">2FA Status</h3>
                        <p className="text-sm text-slate-600">
                          {securitySettings.two_factor_auth?.is_enabled ? 'Enabled' : 'Disabled'}
                        </p>
                      </div>
                      <button className={`py-2 px-4 rounded-lg transition-colors ${
                        securitySettings.two_factor_auth?.is_enabled 
                          ? 'bg-red-600 text-white hover:bg-red-700' 
                          : 'bg-sky-600 text-white hover:bg-sky-700'
                      }`}>
                        {securitySettings.two_factor_auth?.is_enabled ? 'Disable 2FA' : 'Enable 2FA'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* API Keys */}
                <div className="bg-white rounded-lg shadow-sm border border-slate-200">
                  <div className="px-6 py-4 border-b border-slate-200">
                    <h2 className="text-lg font-semibold text-slate-900">API Keys</h2>
                  </div>
                  <div className="p-6">
                    <div className="space-y-4">
                      {securitySettings.api_keys?.map((key) => (
                        <div key={key.id} className="flex items-center justify-between py-2 border-b border-slate-100">
                          <div>
                            <p className="text-sm font-medium text-slate-900">{key.name}</p>
                            <p className="text-sm text-slate-600">••••••••{key.key_prefix}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              key.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {key.is_active ? 'Active' : 'Inactive'}
                            </span>
                            <button className="text-red-600 text-sm hover:text-red-700">
                              Revoke
                            </button>
                          </div>
                        </div>
                      ))}
                      {securitySettings.api_keys?.length === 0 && (
                        <p className="text-slate-500 text-sm">No API keys created</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Active Sessions */}
                <div className="bg-white rounded-lg shadow-sm border border-slate-200">
                  <div className="px-6 py-4 border-b border-slate-200">
                    <h2 className="text-lg font-semibold text-slate-900">Active Sessions</h2>
                  </div>
                  <div className="p-6">
                    <div className="space-y-4">
                      {securitySettings.active_sessions?.map((session) => (
                        <div key={session.id} className="flex items-center justify-between py-2 border-b border-slate-100">
                          <div>
                            <p className="text-sm font-medium text-slate-900">
                              {session.country ? `${session.city}, ${session.country}` : 'Unknown Location'}
                            </p>
                            <p className="text-sm text-slate-600">
                              {session.ip_address} • {new Date(session.last_activity).toLocaleString()}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-green-600 text-sm font-medium">Active</span>
                            <button className="text-red-600 text-sm hover:text-red-700">
                              Terminate
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Recent Security Events */}
                <div className="bg-white rounded-lg shadow-sm border border-slate-200">
                  <div className="px-6 py-4 border-b border-slate-200">
                    <h2 className="text-lg font-semibold text-slate-900">Recent Security Events</h2>
                  </div>
                  <div className="p-6">
                    <div className="space-y-4">
                      {securitySettings.recent_events?.map((event) => (
                        <div key={event.id} className="flex items-center justify-between py-2 border-b border-slate-100">
                          <div>
                            <p className="text-sm font-medium text-slate-900">{event.description}</p>
                            <p className="text-sm text-slate-600">
                              {event.ip_address} • {new Date(event.created_at).toLocaleString()}
                            </p>
                          </div>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            event.risk_score >= 70 ? 'bg-red-100 text-red-800' :
                            event.risk_score >= 40 ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                          }`}>
                            {event.risk_score ? `Risk: ${event.risk_score}` : 'Low Risk'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
