import React, { useState, useEffect } from 'react';
import { Bell, CheckCircle, AlertCircle, Info, Clock, Trash2, Filter, Search, Check, X } from 'lucide-react';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [filteredNotifications, setFilteredNotifications] = useState([]);
  const [filter, setFilter] = useState('all'); // all, unread, read
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNotifications, setSelectedNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch notifications from API
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/notifications/');
        if (response.ok) {
          const data = await response.json();
          setNotifications(data.notifications || []);
          setFilteredNotifications(data.notifications || []);
        } else {
          console.error('Failed to fetch notifications');
          // Fallback to sample data if API fails
          setNotifications([]);
          setFilteredNotifications([]);
        }
      } catch (error) {
        console.error('Error fetching notifications:', error);
        // Fallback to sample data if API fails
        setNotifications([]);
        setFilteredNotifications([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  // Filter and search notifications
  useEffect(() => {
    let filtered = notifications;

    // Apply filter
    if (filter === 'unread') {
      filtered = filtered.filter(n => n.status === 'unread');
    } else if (filter === 'read') {
      filtered = filtered.filter(n => n.status === 'read');
    }

    // Apply search
    if (searchTerm) {
      filtered = filtered.filter(n => 
        n.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        n.message.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredNotifications(filtered);
  }, [notifications, filter, searchTerm]);

  const markAsRead = async (notificationId) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'PUT'
      });
      if (response.ok) {
        setNotifications(prev => 
          prev.map(notification => 
            notification.id === notificationId 
              ? { ...notification, status: 'read', read_at: new Date().toISOString() }
              : notification
          )
        );
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAsUnread = async (notificationId) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}/unread`, {
        method: 'PUT'
      });
      if (response.ok) {
        setNotifications(prev => 
          prev.map(notification => 
            notification.id === notificationId 
              ? { ...notification, status: 'unread', read_at: null }
              : notification
          )
        );
      }
    } catch (error) {
      console.error('Error marking notification as unread:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const response = await fetch('/api/notifications/mark-all-read?user_id=1', {
        method: 'PUT'
      });
      if (response.ok) {
        setNotifications(prev => 
          prev.map(notification => ({ ...notification, status: 'read', read_at: new Date().toISOString() }))
        );
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        setNotifications(prev => prev.filter(n => n.id !== notificationId));
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const deleteSelected = () => {
    setNotifications(prev => prev.filter(n => !selectedNotifications.includes(n.id)));
    setSelectedNotifications([]);
  };

  const toggleSelect = (notificationId) => {
    setSelectedNotifications(prev => 
      prev.includes(notificationId)
        ? prev.filter(id => id !== notificationId)
        : [...prev, notificationId]
    );
  };

  const selectAll = () => {
    setSelectedNotifications(filteredNotifications.map(n => n.id));
  };

  const deselectAll = () => {
    setSelectedNotifications([]);
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
        return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20';
      case 'PAYMENT':
        return 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20';
      case 'SYSTEM':
        return 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20';
      case 'CASE_UPDATE':
        return 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20';
      case 'SECURITY':
        return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20';
      case 'SEARCH':
        return 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20';
      case 'GENERAL':
        return 'text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/20';
      default:
        return 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20';
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'subscription':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
      case 'cases':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'billing':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'system':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
      case 'profile':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'reports':
        return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300';
      case 'storage':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300';
      case 'features':
        return 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
    }
  };

  const unreadCount = notifications.filter(n => n.status === 'unread').length;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-1/4 mb-6"></div>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-20 bg-slate-200 dark:bg-slate-700 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Bell className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Notifications</h1>
            {unreadCount > 0 && (
              <span className="px-3 py-1 bg-red-500 text-white text-sm font-medium rounded-full">
                {unreadCount} unread
              </span>
            )}
          </div>
          <p className="text-slate-600 dark:text-slate-400">
            Stay updated with the latest activity and important information
          </p>
        </div>

        {/* Controls */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search notifications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Filters and Actions */}
            <div className="flex items-center gap-3">
              {/* Filter */}
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All notifications</option>
                <option value="unread">Unread only</option>
                <option value="read">Read only</option>
              </select>

              {/* Bulk Actions */}
              {selectedNotifications.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-600 dark:text-slate-400">
                    {selectedNotifications.length} selected
                  </span>
                  <button
                    onClick={deleteSelected}
                    className="px-3 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              )}

              {/* Mark all as read */}
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium"
                >
                  Mark all as read
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Notifications List */}
        <div className="space-y-4">
          {filteredNotifications.length === 0 ? (
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-12 text-center">
              <Bell className="h-12 w-12 text-slate-400 dark:text-slate-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                {searchTerm ? 'No notifications found' : 'No notifications'}
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                {searchTerm 
                  ? 'Try adjusting your search terms or filters'
                  : 'You\'re all caught up! New notifications will appear here.'
                }
              </p>
            </div>
          ) : (
            filteredNotifications.map((notification) => {
              const IconComponent = getNotificationIcon(notification.type);
              const colorClass = getNotificationColor(notification.type);
              const isSelected = selectedNotifications.includes(notification.id);
              
              return (
                <div
                  key={notification.id}
                  className={`bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 transition-all duration-200 ${
                    isSelected ? 'ring-2 ring-blue-500' : ''
                  } ${notification.status === 'unread' ? 'border-l-4 border-l-blue-500' : ''}`}
                >
                  <div className="flex items-start gap-4">
                    {/* Checkbox */}
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelect(notification.id)}
                      className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 dark:border-slate-600 rounded"
                    />

                    {/* Icon */}
                    <div className={`p-2 rounded-lg ${colorClass}`}>
                      <IconComponent className="h-5 w-5" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className={`text-lg font-semibold ${
                                      notification.status === 'unread'
                                        ? 'text-slate-900 dark:text-white' 
                                        : 'text-slate-700 dark:text-slate-300'
                            }`}>
                              {notification.title}
                            </h3>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(notification.category)}`}>
                              {notification.category}
                            </span>
                            {notification.status === 'unread' && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                            )}
                          </div>
                          <p className="text-slate-600 dark:text-slate-400 mb-3 leading-relaxed">
                            {notification.message}
                          </p>
                          <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-500">
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {notification.time}
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 ml-4">
                          {notification.status === 'unread' ? (
                            <button
                              onClick={() => markAsRead(notification.id)}
                              className="p-2 text-slate-400 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                              title="Mark as read"
                            >
                              <Check className="h-4 w-4" />
                            </button>
                          ) : (
                            <button
                              onClick={() => markAsUnread(notification.id)}
                              className="p-2 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                              title="Mark as unread"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          )}
                          <button
                            onClick={() => deleteNotification(notification.id)}
                            className="p-2 text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                            title="Delete notification"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Bulk Actions Footer */}
        {selectedNotifications.length > 0 && (
          <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 p-4">
            <div className="flex items-center gap-4">
              <span className="text-sm text-slate-600 dark:text-slate-400">
                {selectedNotifications.length} notification{selectedNotifications.length !== 1 ? 's' : ''} selected
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={selectAll}
                  className="px-3 py-1 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                >
                  Select All
                </button>
                <button
                  onClick={deselectAll}
                  className="px-3 py-1 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg transition-colors"
                >
                  Deselect All
                </button>
                <button
                  onClick={deleteSelected}
                  className="px-3 py-1 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                >
                  Delete Selected
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
