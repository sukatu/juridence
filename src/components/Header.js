import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, LogOut, Settings, ChevronDown, Bell, Clock, CheckCircle, AlertCircle, Info } from 'lucide-react';
import ThemeToggle from './ThemeToggle';

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [userName, setUserName] = useState('');
  const [userProfilePicture, setUserProfilePicture] = useState('');
  const [profileImageError, setProfileImageError] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const location = useLocation();
  const navigate = useNavigate();

  // Check authentication status on component mount and listen for changes
  useEffect(() => {
    const checkAuthStatus = () => {
    const authStatus = localStorage.getItem('isAuthenticated');
      const adminStatus = localStorage.getItem('isAdmin');
    const email = localStorage.getItem('userEmail');
    const name = localStorage.getItem('userName');
    const authProvider = localStorage.getItem('authProvider');
    
    // Get user data from localStorage
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    
    setIsAuthenticated(authStatus === 'true');
      setIsAdmin(adminStatus === 'true');
    setUserEmail(email || '');
    setUserName(name || '');
    setUserProfilePicture(userData.profile_picture || '');
    
    // Log authentication provider for debugging
    if (authProvider) {
    }
    };

    // Check initial auth status
    checkAuthStatus();

    // Listen for authentication changes
    const handleAuthChange = () => {
      checkAuthStatus();
    };

    // Listen for profile updates
    const handleProfileUpdate = () => {
      const userData = JSON.parse(localStorage.getItem('userData') || '{}');
      setUserProfilePicture(userData.profile_picture || '');
      setProfileImageError(false); // Reset error state when profile updates
    };

    // Add event listener for custom auth events
    window.addEventListener('authStateChanged', handleAuthChange);
    window.addEventListener('profileUpdated', handleProfileUpdate);
    
    // Also listen for storage changes (in case localStorage is modified from another tab)
    window.addEventListener('storage', handleAuthChange);

    // Cleanup event listeners
    return () => {
      window.removeEventListener('authStateChanged', handleAuthChange);
      window.removeEventListener('profileUpdated', handleProfileUpdate);
      window.removeEventListener('storage', handleAuthChange);
    };
  }, []);

  // Load notifications from API
  const loadNotifications = async () => {
    if (!isAuthenticated) return;
    
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) return;

      const response = await fetch('/api/notifications/stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const stats = await response.json();
        setUnreadCount(stats.unread || 0);
      }
    } catch (error) {
      console.error('Error loading notification stats:', error);
    }
  };

  // Load notifications list
  const loadNotificationsList = async () => {
    if (!isAuthenticated) return;
    
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) return;

      const response = await fetch('/api/notifications/?limit=10', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications || []);
        setUnreadCount(data.notifications?.filter(n => n.status === 'unread').length || 0);
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  // Load notifications when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      loadNotifications();
      loadNotificationsList();
    } else {
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [isAuthenticated]);

  // Refresh notifications every 30 seconds
  useEffect(() => {
    if (!isAuthenticated) return;
    
    const interval = setInterval(() => {
      loadNotifications();
    }, 30000);

    return () => clearInterval(interval);
  }, [isAuthenticated]);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isUserMenuOpen && !event.target.closest('.user-menu')) {
        setIsUserMenuOpen(false);
      }
      if (isNotificationsOpen && !event.target.closest('.notifications-menu')) {
        setIsNotificationsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isUserMenuOpen, isNotificationsOpen]);

  // Function to get user initials
  const getUserInitials = () => {
    if (userName) {
      return userName
        .split(' ')
        .map(name => name.charAt(0))
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    if (userEmail) {
      const emailName = userEmail.split('@')[0];
      return emailName
        .split('.')
        .map(part => part.charAt(0))
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    return 'U';
  };


  const handleLogout = () => {
    // Clear all authentication data
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
    localStorage.removeItem('userPicture');
    localStorage.removeItem('authProvider');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('userData');
    
    // If user was authenticated via Google, also sign out from Google
    if (window.google?.accounts?.id) {
      window.google.accounts.id.disableAutoSelect();
    }
    
    // Dispatch custom event to notify other components
    window.dispatchEvent(new CustomEvent('authStateChanged'));
    
    setIsAuthenticated(false);
    setUserEmail('');
    setUserName('');
    setUserProfilePicture('');
    setProfileImageError(false);
    setIsUserMenuOpen(false);
    navigate('/');
  };

  const markNotificationAsRead = async (notificationId) => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) return;

      const response = await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        // Update local state immediately for better UX
        setNotifications(prev => 
          prev.map(notification => 
            notification.id === notificationId 
              ? { ...notification, status: 'read' }
              : notification
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
        
        // Refresh notifications to ensure consistency
        setTimeout(() => {
          loadNotifications();
          loadNotificationsList();
        }, 500);
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) return;

      const userData = JSON.parse(localStorage.getItem('userData') || '{}');
      const userId = userData.id;
      
      if (!userId) return;

      const response = await fetch(`/api/notifications/mark-all-read?user_id=${userId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        // Update local state immediately
        setNotifications(prev => 
          prev.map(notification => ({ ...notification, status: 'read' }))
        );
        setUnreadCount(0);
        
        // Refresh notifications to ensure consistency
        setTimeout(() => {
          loadNotifications();
          loadNotificationsList();
        }, 500);
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'SUBSCRIPTION':
        return CheckCircle;
      case 'PAYMENT':
        return AlertCircle;
      case 'SYSTEM':
        return Info;
      case 'CASE_UPDATE':
        return Info;
      case 'SECURITY':
        return AlertCircle;
      case 'SEARCH':
        return Info;
      case 'GENERAL':
        return Info;
      default:
        return Info;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'SUBSCRIPTION':
        return 'text-green-600 dark:text-green-400';
      case 'PAYMENT':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'SYSTEM':
        return 'text-blue-600 dark:text-blue-400';
      case 'CASE_UPDATE':
        return 'text-purple-600 dark:text-purple-400';
      case 'SECURITY':
        return 'text-red-600 dark:text-red-400';
      case 'SEARCH':
        return 'text-indigo-600 dark:text-indigo-400';
      case 'GENERAL':
        return 'text-gray-600 dark:text-gray-400';
      default:
        return 'text-blue-600 dark:text-blue-400';
    }
  };

  const formatNotificationTime = (createdAt) => {
    if (!createdAt) return 'Unknown time';
    
    const now = new Date();
    const notificationTime = new Date(createdAt);
    const diffInMinutes = Math.floor((now - notificationTime) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    
    return notificationTime.toLocaleDateString();
  };

  const allNavigationItems = [
    { name: 'Home', href: '/' },
    { name: 'About', href: '/about' },
    { name: 'Services', href: '/services' },
    { name: 'Contact', href: '/contact' },
    { name: 'People', href: '/people', requiresAuth: true },
    { name: 'Banks', href: '/banks', requiresAuth: true },
    { name: 'Insurance', href: '/insurance', requiresAuth: true },
    { name: 'Companies', href: '/companies', requiresAuth: true },
    { name: 'Judges', href: '/judges', requiresAuth: true },
    { name: 'Courts', href: '/justice-locator', requiresAuth: true },
    { name: 'Subscribe', href: '/subscribe' },
    ...(isAdmin ? [{ name: 'Admin', href: '/admin' }] : []),
  ];

  // Filter navigation items based on authentication status
  const navigation = allNavigationItems.filter(item => 
    !item.requiresAuth || isAuthenticated
  );

  // Debug logging

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border-b border-slate-200 dark:border-slate-700 shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
      <div className="relative">
        <img
          src="/logos/main-logo.png" 
          alt="juridence logo" 
          className="h-12 w-auto object-contain shadow-lg group-hover:shadow-xl transition-shadow"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = "/logo.png";
          }}
        />
      </div>
        </Link>
        
          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-2 flex-1 justify-center max-w-4xl">
          {navigation.map((item) => (
            <Link
              key={item.name}
              to={item.href}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                  isActive(item.href)
        ? 'bg-brand-50 dark:bg-brand-900/30 text-brand-500 dark:text-brand-400'
        : 'text-slate-600 dark:text-slate-300 hover:text-brand-500 dark:hover:text-brand-400 hover:bg-light-100 dark:hover:bg-slate-800'
              }`}
            >
              {item.name}
            </Link>
          ))}
        </nav>

          {/* Right Side Actions */}
          <div className="flex items-center gap-3">
            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Authentication Section */}
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
                {/* Notifications */}
                <div className="relative notifications-menu">
                  <button 
                    onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                    className="relative p-2 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                  >
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Notifications Dropdown */}
                  {isNotificationsOpen && (
                    <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 z-50">
                      {/* Header */}
                      <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                        <h3 className="font-semibold text-slate-900 dark:text-white">Notifications</h3>
                        {unreadCount > 0 && (
                          <button
                            onClick={markAllAsRead}
                            className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
                          >
                            Mark all as read
                          </button>
                        )}
                      </div>

                      {/* Notifications List */}
                      <div className="max-h-96 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <div className="px-4 py-8 text-center text-slate-500 dark:text-slate-400">
                            <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                            <p>No notifications</p>
                          </div>
                        ) : (
                          notifications.map((notification) => {
                            const IconComponent = getNotificationIcon(notification.type);
                            const colorClass = getNotificationColor(notification.type);
                            
                            return (
                              <div
                                key={notification.id}
                                onClick={() => markNotificationAsRead(notification.id)}
                                className={`px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer transition-colors border-b border-slate-100 dark:border-slate-700 last:border-b-0 ${
                                  notification.status === 'unread' ? 'bg-blue-50/50 dark:bg-blue-900/20' : ''
                                }`}
                              >
                                <div className="flex items-start gap-3">
                                  <div className={`flex-shrink-0 ${colorClass}`}>
                                    <IconComponent className="h-5 w-5" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between">
                                      <p className={`text-sm font-medium ${
                                        notification.status === 'unread'
                                          ? 'text-slate-900 dark:text-white' 
                                          : 'text-slate-700 dark:text-slate-300'
                                      }`}>
                                        {notification.title}
                                      </p>
                                      {notification.status === 'unread' && (
                                        <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                                      )}
                                    </div>
                                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 line-clamp-2">
                                      {notification.message}
                                    </p>
                                    <p className="text-xs text-slate-500 dark:text-slate-500 mt-1 flex items-center gap-1">
                                      <Clock className="h-3 w-3" />
                                      {formatNotificationTime(notification.created_at)}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>

                      {/* Footer */}
                      {notifications.length > 0 && (
                        <div className="px-4 py-3 border-t border-slate-200 dark:border-slate-700">
                          <div className="flex items-center justify-between">
                            <button
                              onClick={markAllAsRead}
                              className="text-sm text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 font-medium"
                            >
                              Mark all as read
                            </button>
                            <Link
                              to="/notifications"
                              className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
                              onClick={() => setIsNotificationsOpen(false)}
                            >
                              View all notifications
                            </Link>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* User Menu */}
                <div className="relative user-menu">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    {userProfilePicture && !profileImageError ? (
                      <img
                        src={userProfilePicture.startsWith('http') ? userProfilePicture : `/api${userProfilePicture}`}
                        alt={userName || 'User'}
                        className="w-8 h-8 rounded-full object-cover border-2 border-slate-200 dark:border-slate-600 shadow-lg"
                        onError={() => {
                          // Fallback to initials if image fails to load
                          setProfileImageError(true);
                        }}
                      />
                    ) : (
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-sm font-semibold shadow-lg">
                        {getUserInitials()}
                      </div>
                    )}
                    <div className="hidden sm:block text-left">
                      <div className="text-sm font-medium text-slate-900 dark:text-white">
                  {userName || userEmail.split('@')[0]}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        {userEmail}
                      </div>
                    </div>
                    <ChevronDown className={`h-4 w-4 text-slate-500 dark:text-slate-400 transition-transform ${
                      isUserMenuOpen ? 'rotate-180' : ''
                    }`} />
                  </button>

                  {/* User Dropdown Menu */}
                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 py-2 z-50">
                      {/* User Info */}
                      <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                            {getUserInitials()}
                          </div>
                          <div>
                            <div className="font-medium text-slate-900 dark:text-white">
                              {userName || 'User'}
                            </div>
                            <div className="text-sm text-slate-500 dark:text-slate-400">
                              {userEmail}
                            </div>
                          </div>
                        </div>
              </div>

                      {/* Menu Items */}
                      <div className="py-2">
                        <Link
                          to="/settings"
                          className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <Settings className="h-4 w-4" />
                          Settings
                        </Link>
                        <div className="border-t border-slate-200 dark:border-slate-700 my-2"></div>
              <button
                onClick={handleLogout}
                          className="flex items-center gap-3 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors w-full text-left"
              >
                <LogOut className="h-4 w-4" />
                          Sign Out
              </button>
                      </div>
                    </div>
                  )}
                </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                  className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap"
              >
                Login
              </Link>
        <Link
          to="/select-role"
          className="px-4 py-2 text-sm font-medium text-white bg-brand-500 hover:bg-brand-600 rounded-lg transition-colors shadow-sm hover:shadow-md whitespace-nowrap"
        >
                  Get Started
        </Link>
            </div>
          )}
        
            {/* Mobile Menu Button */}
        <button
              className="lg:hidden p-2 text-slate-500 dark:text-slate-400 hover:text-brand-500 dark:hover:text-brand-400 hover:bg-light-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
          </div>
        </div>
      </div>
      
      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
          <div className="px-4 py-4 space-y-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`block px-4 py-3 rounded-lg text-base font-medium transition-colors ${
                  isActive(item.href)
                    ? 'bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300'
                    : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            
            {/* Mobile Authentication */}
            {!isAuthenticated && (
              <div className="border-t border-slate-200 dark:border-slate-700 pt-4 mt-4 space-y-2">
                  <Link
                    to="/login"
                  className="block px-4 py-3 text-base font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors whitespace-nowrap"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    to="/select-role"
                  className="block px-4 py-3 text-base font-medium text-white bg-brand-500 hover:bg-brand-600 rounded-lg transition-colors text-center whitespace-nowrap"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Get Started
                  </Link>
                </div>
              )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;