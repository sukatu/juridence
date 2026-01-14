import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Shield, 
  AlertTriangle, 
  Eye, 
  Search, 
  Filter, 
  Download,
  RefreshCw,
  Calendar,
  User,
  Clock,
  MapPin,
  Monitor,
  Smartphone,
  Tablet,
  Globe,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { apiGet } from '../utils/api';

const LogsViewer = () => {
  const [activeTab, setActiveTab] = useState('access');
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({});
  const [filters, setFilters] = useState({
    user_id: '',
    limit: 100,
    offset: 0,
    start_date: '',
    end_date: '',
    activity_type: '',
    severity: '',
    event_type: '',
    table_name: '',
    resolved: '',
    blocked: ''
  });
  const [expandedLogs, setExpandedLogs] = useState(new Set());

  const logTypes = [
    { id: 'access', name: 'Access Logs', icon: Eye, color: 'blue' },
    { id: 'activity', name: 'Activity Logs', icon: Activity, color: 'green' },
    { id: 'audit', name: 'Audit Logs', icon: Search, color: 'purple' },
    { id: 'errors', name: 'Error Logs', icon: AlertTriangle, color: 'red' },
    { id: 'security', name: 'Security Logs', icon: Shield, color: 'orange' }
  ];

  useEffect(() => {
    loadLogs();
    loadStats();
  }, [activeTab, filters]);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });

      const data = await apiGet(`/admin/logs/${activeTab}?${params}`);
      
      setLogs(data.logs || []);
    } catch (error) {
      console.error('Error loading logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.start_date) params.append('start_date', filters.start_date);
      if (filters.end_date) params.append('end_date', filters.end_date);

      const data = await apiGet(`/admin/logs/stats?${params}`);
      setStats(data);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value, offset: 0 }));
  };

  const resetFilters = () => {
    setFilters({
      user_id: '',
      limit: 100,
      offset: 0,
      start_date: '',
      end_date: '',
      activity_type: '',
      severity: '',
      event_type: '',
      table_name: '',
      resolved: '',
      blocked: ''
    });
  };

  const toggleLogExpansion = (logId) => {
    setExpandedLogs(prev => {
      const newSet = new Set(prev);
      if (newSet.has(logId)) {
        newSet.delete(logId);
      } else {
        newSet.add(logId);
      }
      return newSet;
    });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusColor = (statusCode) => {
    if (statusCode >= 200 && statusCode < 300) return 'text-green-600';
    if (statusCode >= 300 && statusCode < 400) return 'text-yellow-600';
    if (statusCode >= 400 && statusCode < 500) return 'text-orange-600';
    return 'text-red-600';
  };

  const getSeverityColor = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'debug': return 'text-gray-500';
      case 'info': return 'text-blue-600';
      case 'warning': return 'text-yellow-600';
      case 'error': return 'text-red-600';
      case 'critical': return 'text-red-800';
      default: return 'text-gray-500';
    }
  };

  const getDeviceIcon = (deviceType) => {
    switch (deviceType?.toLowerCase()) {
      case 'mobile': return <Smartphone className="h-4 w-4" />;
      case 'tablet': return <Tablet className="h-4 w-4" />;
      case 'desktop': return <Monitor className="h-4 w-4" />;
      default: return <Monitor className="h-4 w-4" />;
    }
  };

  const renderAccessLogs = () => (
    <div className="space-y-4">
      {logs.map((log) => (
        <div key={log.id} className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 rounded text-sm font-medium ${getStatusColor(log.status_code)}`}>
                  {log.status_code}
                </span>
                <span className="text-sm font-mono text-slate-600">{log.method}</span>
              </div>
              <div className="text-sm text-slate-600 truncate max-w-md">
                {log.endpoint}
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-slate-500">
                {getDeviceIcon(log.device_type)}
                <span>{log.browser}</span>
                <span>•</span>
                <span>{log.os}</span>
              </div>
              <div className="text-sm text-slate-500">
                {formatDate(log.created_at)}
              </div>
              <button
                onClick={() => toggleLogExpansion(log.id)}
                className="p-1 hover:bg-slate-100 rounded"
              >
                {expandedLogs.has(log.id) ? 
                  <ChevronUp className="h-4 w-4" /> : 
                  <ChevronDown className="h-4 w-4" />
                }
              </button>
            </div>
          </div>
          
          {expandedLogs.has(log.id) && (
            <div className="mt-4 pt-4 border-t border-slate-200 space-y-2">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-slate-700">IP Address:</span>
                  <span className="ml-2 text-slate-600">{log.ip_address}</span>
                </div>
                <div>
                  <span className="font-medium text-slate-700">User ID:</span>
                  <span className="ml-2 text-slate-600">{log.user_id || 'Anonymous'}</span>
                </div>
                <div>
                  <span className="font-medium text-slate-700">Response Time:</span>
                  <span className="ml-2 text-slate-600">{log.response_time}ms</span>
                </div>
                <div>
                  <span className="font-medium text-slate-700">Location:</span>
                  <span className="ml-2 text-slate-600">
                    {log.city && log.country ? `${log.city}, ${log.country}` : 'Unknown'}
                  </span>
                </div>
              </div>
              {log.referer && (
                <div className="text-sm">
                  <span className="font-medium text-slate-700">Referer:</span>
                  <span className="ml-2 text-slate-600 break-all">{log.referer}</span>
                </div>
              )}
              <div className="text-sm">
                <span className="font-medium text-slate-700">User Agent:</span>
                <span className="ml-2 text-slate-600 break-all">{log.user_agent}</span>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );

  const renderActivityLogs = () => (
    <div className="space-y-4">
      {logs.map((log) => (
        <div key={log.id} className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className={`px-2 py-1 rounded text-sm font-medium ${getSeverityColor(log.severity)}`}>
                {log.activity_type}
              </div>
              <div className="text-sm font-medium text-slate-900">
                {log.action}
              </div>
              {log.resource_type && (
                <div className="text-sm text-slate-600">
                  {log.resource_type}: {log.resource_id}
                </div>
              )}
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-slate-500">
                {formatDate(log.created_at)}
              </div>
              <button
                onClick={() => toggleLogExpansion(log.id)}
                className="p-1 hover:bg-slate-100 rounded"
              >
                {expandedLogs.has(log.id) ? 
                  <ChevronUp className="h-4 w-4" /> : 
                  <ChevronDown className="h-4 w-4" />
                }
              </button>
            </div>
          </div>
          
          {log.description && (
            <div className="mt-2 text-sm text-slate-600">
              {log.description}
            </div>
          )}
          
          {expandedLogs.has(log.id) && (
            <div className="mt-4 pt-4 border-t border-slate-200 space-y-2">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-slate-700">User ID:</span>
                  <span className="ml-2 text-slate-600">{log.user_id || 'Anonymous'}</span>
                </div>
                <div>
                  <span className="font-medium text-slate-700">IP Address:</span>
                  <span className="ml-2 text-slate-600">{log.ip_address}</span>
                </div>
              </div>
              {log.old_values && (
                <div className="text-sm">
                  <span className="font-medium text-slate-700">Old Values:</span>
                  <pre className="mt-1 p-2 bg-slate-50 rounded text-xs overflow-x-auto">
                    {JSON.stringify(log.old_values, null, 2)}
                  </pre>
                </div>
              )}
              {log.new_values && (
                <div className="text-sm">
                  <span className="font-medium text-slate-700">New Values:</span>
                  <pre className="mt-1 p-2 bg-slate-50 rounded text-xs overflow-x-auto">
                    {JSON.stringify(log.new_values, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );

  const renderAuditLogs = () => (
    <div className="space-y-4">
      {logs.map((log) => (
        <div key={log.id} className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="px-2 py-1 rounded text-sm font-medium bg-purple-100 text-purple-700">
                {log.action}
              </div>
              <div className="text-sm font-medium text-slate-900">
                {log.table_name}
              </div>
              <div className="text-sm text-slate-600">
                ID: {log.record_id}
              </div>
              {log.field_name && (
                <div className="text-sm text-slate-600">
                  Field: {log.field_name}
                </div>
              )}
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-slate-500">
                {formatDate(log.created_at)}
              </div>
              <button
                onClick={() => toggleLogExpansion(log.id)}
                className="p-1 hover:bg-slate-100 rounded"
              >
                {expandedLogs.has(log.id) ? 
                  <ChevronUp className="h-4 w-4" /> : 
                  <ChevronDown className="h-4 w-4" />
                }
              </button>
            </div>
          </div>
          
          {expandedLogs.has(log.id) && (
            <div className="mt-4 pt-4 border-t border-slate-200 space-y-2">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-slate-700">User ID:</span>
                  <span className="ml-2 text-slate-600">{log.user_id || 'Anonymous'}</span>
                </div>
                <div>
                  <span className="font-medium text-slate-700">IP Address:</span>
                  <span className="ml-2 text-slate-600">{log.ip_address}</span>
                </div>
              </div>
              {log.old_value && (
                <div className="text-sm">
                  <span className="font-medium text-slate-700">Old Value:</span>
                  <div className="mt-1 p-2 bg-slate-50 rounded text-xs break-all">
                    {log.old_value}
                  </div>
                </div>
              )}
              {log.new_value && (
                <div className="text-sm">
                  <span className="font-medium text-slate-700">New Value:</span>
                  <div className="mt-1 p-2 bg-slate-50 rounded text-xs break-all">
                    {log.new_value}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );

  const renderErrorLogs = () => (
    <div className="space-y-4">
      {logs.map((log) => (
        <div key={log.id} className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className={`px-2 py-1 rounded text-sm font-medium ${getSeverityColor(log.severity)}`}>
                {log.severity}
              </div>
              <div className="text-sm font-medium text-slate-900">
                {log.error_type}
              </div>
              <div className={`px-2 py-1 rounded text-xs ${log.resolved ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {log.resolved ? 'Resolved' : 'Unresolved'}
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-slate-500">
                {formatDate(log.created_at)}
              </div>
              <button
                onClick={() => toggleLogExpansion(log.id)}
                className="p-1 hover:bg-slate-100 rounded"
              >
                {expandedLogs.has(log.id) ? 
                  <ChevronUp className="h-4 w-4" /> : 
                  <ChevronDown className="h-4 w-4" />
                }
              </button>
            </div>
          </div>
          
          <div className="mt-2 text-sm text-slate-600">
            {log.error_message}
          </div>
          
          {expandedLogs.has(log.id) && (
            <div className="mt-4 pt-4 border-t border-slate-200 space-y-2">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-slate-700">User ID:</span>
                  <span className="ml-2 text-slate-600">{log.user_id || 'Anonymous'}</span>
                </div>
                <div>
                  <span className="font-medium text-slate-700">Status Code:</span>
                  <span className="ml-2 text-slate-600">{log.status_code || 'N/A'}</span>
                </div>
                <div>
                  <span className="font-medium text-slate-700">URL:</span>
                  <span className="ml-2 text-slate-600 break-all">{log.url || 'N/A'}</span>
                </div>
                <div>
                  <span className="font-medium text-slate-700">Method:</span>
                  <span className="ml-2 text-slate-600">{log.method || 'N/A'}</span>
                </div>
              </div>
              {log.stack_trace && (
                <div className="text-sm">
                  <span className="font-medium text-slate-700">Stack Trace:</span>
                  <pre className="mt-1 p-2 bg-slate-50 rounded text-xs overflow-x-auto">
                    {log.stack_trace}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );

  const renderSecurityLogs = () => (
    <div className="space-y-4">
      {logs.map((log) => (
        <div key={log.id} className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className={`px-2 py-1 rounded text-sm font-medium ${getSeverityColor(log.severity)}`}>
                {log.severity}
              </div>
              <div className="text-sm font-medium text-slate-900">
                {log.event_type}
              </div>
              <div className={`px-2 py-1 rounded text-xs ${log.blocked ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                {log.blocked ? 'Blocked' : 'Allowed'}
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-slate-500">
                {formatDate(log.created_at)}
              </div>
              <button
                onClick={() => toggleLogExpansion(log.id)}
                className="p-1 hover:bg-slate-100 rounded"
              >
                {expandedLogs.has(log.id) ? 
                  <ChevronUp className="h-4 w-4" /> : 
                  <ChevronDown className="h-4 w-4" />
                }
              </button>
            </div>
          </div>
          
          <div className="mt-2 text-sm text-slate-600">
            {log.description}
          </div>
          
          {expandedLogs.has(log.id) && (
            <div className="mt-4 pt-4 border-t border-slate-200 space-y-2">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-slate-700">User ID:</span>
                  <span className="ml-2 text-slate-600">{log.user_id || 'Anonymous'}</span>
                </div>
                <div>
                  <span className="font-medium text-slate-700">IP Address:</span>
                  <span className="ml-2 text-slate-600">{log.ip_address}</span>
                </div>
                <div>
                  <span className="font-medium text-slate-700">Location:</span>
                  <span className="ml-2 text-slate-600">
                    {log.city && log.country ? `${log.city}, ${log.country}` : 'Unknown'}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-slate-700">Session ID:</span>
                  <span className="ml-2 text-slate-600">{log.session_id || 'N/A'}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );

  const renderLogs = () => {
    switch (activeTab) {
      case 'access': return renderAccessLogs();
      case 'activity': return renderActivityLogs();
      case 'audit': return renderAuditLogs();
      case 'errors': return renderErrorLogs();
      case 'security': return renderSecurityLogs();
      default: return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">System Logs</h2>
          <p className="text-slate-600">Monitor system activity, errors, and security events</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={loadLogs}
            disabled={loading}
            className="flex items-center space-x-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Total Requests</p>
              <p className="text-2xl font-bold text-slate-900">{stats.total_requests || 0}</p>
            </div>
            <Eye className="h-8 w-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Unique Users</p>
              <p className="text-2xl font-bold text-slate-900">{stats.unique_users || 0}</p>
            </div>
            <User className="h-8 w-8 text-green-500" />
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Error Rate</p>
              <p className="text-2xl font-bold text-slate-900">{stats.error_rate?.toFixed(1) || 0}%</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-red-500" />
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Security Events</p>
              <p className="text-2xl font-bold text-slate-900">{stats.total_security_events || 0}</p>
            </div>
            <Shield className="h-8 w-8 text-orange-500" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200">
        <nav className="-mb-px flex space-x-8">
          {logTypes.map((type) => {
            const Icon = type.icon;
            return (
              <button
                key={type.id}
                onClick={() => setActiveTab(type.id)}
                className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === type.id
                    ? `border-${type.color}-500 text-${type.color}-600`
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{type.name}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Filters */}
      <div className="bg-white border border-slate-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-slate-900">Filters</h3>
          <button
            onClick={resetFilters}
            className="text-sm text-slate-600 hover:text-slate-800"
          >
            Reset Filters
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">User ID</label>
            <input
              type="number"
              value={filters.user_id}
              onChange={(e) => handleFilterChange('user_id', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-500"
              placeholder="Enter user ID"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Start Date</label>
            <input
              type="datetime-local"
              value={filters.start_date}
              onChange={(e) => handleFilterChange('start_date', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">End Date</label>
            <input
              type="datetime-local"
              value={filters.end_date}
              onChange={(e) => handleFilterChange('end_date', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Limit</label>
            <select
              value={filters.limit}
              onChange={(e) => handleFilterChange('limit', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-500"
            >
              <option value={50}>50</option>
              <option value={100}>100</option>
              <option value={200}>200</option>
              <option value={500}>500</option>
            </select>
          </div>
          
          {activeTab === 'activity' && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Activity Type</label>
              <select
                value={filters.activity_type}
                onChange={(e) => handleFilterChange('activity_type', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-500"
              >
                <option value="">All Types</option>
                <option value="LOGIN">Login</option>
                <option value="LOGOUT">Logout</option>
                <option value="CREATE">Create</option>
                <option value="UPDATE">Update</option>
                <option value="DELETE">Delete</option>
                <option value="VIEW">View</option>
                <option value="SEARCH">Search</option>
                <option value="NAVIGATION">Navigation</option>
                <option value="ADMIN_ACTION">Admin Action</option>
              </select>
            </div>
          )}
          
          {(activeTab === 'errors' || activeTab === 'security') && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Severity</label>
              <select
                value={filters.severity}
                onChange={(e) => handleFilterChange('severity', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-500"
              >
                <option value="">All Severities</option>
                <option value="DEBUG">Debug</option>
                <option value="INFO">Info</option>
                <option value="WARNING">Warning</option>
                <option value="ERROR">Error</option>
                <option value="CRITICAL">Critical</option>
              </select>
            </div>
          )}
          
          {activeTab === 'security' && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Event Type</label>
              <input
                type="text"
                value={filters.event_type}
                onChange={(e) => handleFilterChange('event_type', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-500"
                placeholder="e.g., failed_login"
              />
            </div>
          )}
          
          {activeTab === 'audit' && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Table Name</label>
              <input
                type="text"
                value={filters.table_name}
                onChange={(e) => handleFilterChange('table_name', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-500"
                placeholder="e.g., users"
              />
            </div>
          )}
        </div>
      </div>

      {/* Logs */}
      <div className="bg-white border border-slate-200 rounded-lg">
        <div className="p-4 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-slate-900">
              {logTypes.find(t => t.id === activeTab)?.name} ({logs.length})
            </h3>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => window.print()}
                className="flex items-center space-x-2 px-3 py-2 text-slate-600 hover:text-slate-800"
              >
                <Download className="h-4 w-4" />
                <span>Export</span>
              </button>
            </div>
          </div>
        </div>
        
        <div className="p-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin text-slate-500" />
              <span className="ml-2 text-slate-500">Loading logs...</span>
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-slate-400 mb-2">
                {logTypes.find(t => t.id === activeTab)?.icon && 
                  React.createElement(logTypes.find(t => t.id === activeTab).icon, { className: "h-12 w-12 mx-auto" })
                }
              </div>
              <p className="text-slate-500">No logs found for the selected criteria</p>
            </div>
          ) : (
            renderLogs()
          )}
        </div>
      </div>
    </div>
  );
};

export default LogsViewer;
