import React, { useState, useEffect } from 'react';
import {
  Bar,
  Doughnut,
  Line
} from 'react-chartjs-2';
import {
  BarChart3,
  MessageCircle,
  Users,
  Clock,
  Zap,
  TrendingUp,
  Activity,
  RefreshCw,
  Calendar,
  DollarSign,
  Database,
  Eye,
  Download,
  Filter,
  Search,
  X
} from 'lucide-react';
import { apiGet } from '../../utils/api';

const AIAnalytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [userAnalytics, setUserAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState(30);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'users', 'sessions'
  const [selectedSession, setSelectedSession] = useState(null);
  const [sessionDetails, setSessionDetails] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserDetailModal, setShowUserDetailModal] = useState(false);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiGet(`/ai-chat/analytics/usage?days=${selectedPeriod}`);
      setAnalytics(response);
    } catch (err) {
      console.error('Error loading AI analytics:', err);
      setError('Failed to load AI analytics data');
    } finally {
      setLoading(false);
    }
  };

  const loadUserAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiGet(`/ai-chat/analytics/users?days=${selectedPeriod}`);
      console.log('User analytics response:', response); // Debug log
      setUserAnalytics(response);
    } catch (err) {
      console.error('Error loading user analytics:', err);
      setError('Failed to load user analytics data');
    } finally {
      setLoading(false);
    }
  };

  const loadSessionDetails = async (sessionId) => {
    try {
      const response = await apiGet(`/ai-chat/analytics/session/${sessionId}`);
      setSessionDetails(response);
    } catch (err) {
      console.error('Error loading session details:', err);
    }
  };

  useEffect(() => {
    if (activeTab === 'overview') {
      loadAnalytics();
    } else if (activeTab === 'users') {
      loadUserAnalytics();
    }
  }, [selectedPeriod, activeTab]);

  useEffect(() => {
    if (selectedSession) {
      loadSessionDetails(selectedSession);
    }
  }, [selectedSession]);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return 'Invalid Date';
    }
  };

  const formatDuration = (seconds) => {
    if (!seconds) return 'N/A';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  const formatNumber = (num) => {
    if (!num || isNaN(num)) return '0';
    return new Intl.NumberFormat('en-US').format(num);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2">
          <RefreshCw className="w-5 h-5 animate-spin text-blue-600" />
          <span className="text-gray-600">Loading AI analytics...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center space-x-2">
          <Activity className="w-5 h-5 text-red-600" />
          <span className="text-red-800">{error}</span>
        </div>
        <button
          onClick={loadAnalytics}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center py-8">
        <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No AI Analytics Data</h3>
        <p className="text-gray-600">No JuridenceAI chat sessions found for the selected period.</p>
      </div>
    );
  }

  // Chart data for daily usage
  const dailyUsageData = {
    labels: (analytics?.daily_usage || []).map(day => formatDate(day.date)),
    datasets: [
      {
        label: 'Sessions',
        data: (analytics?.daily_usage || []).map(day => day.sessions || 0),
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 2,
        yAxisID: 'y'
      },
      {
        label: 'Messages',
        data: (analytics?.daily_usage || []).map(day => day.messages || 0),
        backgroundColor: 'rgba(16, 185, 129, 0.5)',
        borderColor: 'rgba(16, 185, 129, 1)',
        borderWidth: 2,
        yAxisID: 'y1'
      }
    ]
  };

  const dailyUsageOptions = {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: 'Daily JuridenceAI Usage'
      },
      legend: {
        position: 'top'
      }
    },
    scales: {
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        title: {
          display: true,
          text: 'Sessions'
        }
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        title: {
          display: true,
          text: 'Messages'
        },
        grid: {
          drawOnChartArea: false
        }
      }
    }
  };

  // Chart data for model usage
  const modelUsageData = {
    labels: (analytics?.model_usage || []).map(model => model.model || 'Unknown'),
    datasets: [
      {
        data: (analytics?.model_usage || []).map(model => model.count || 0),
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(139, 92, 246, 0.8)'
        ],
        borderWidth: 2,
        borderColor: '#fff'
      }
    ]
  };

  const modelUsageOptions = {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: 'AI Model Usage Distribution'
      },
      legend: {
        position: 'bottom'
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">JuridenceAI Analytics</h2>
          <p className="text-gray-600">Monitor JuridenceAI usage, performance, and user engagement</p>
        </div>
        <div className="flex items-center space-x-4">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(parseInt(e.target.value))}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
            <option value={365}>Last year</option>
          </select>
          <button
            onClick={() => {
              if (activeTab === 'overview') {
                loadAnalytics();
              } else if (activeTab === 'users') {
                loadUserAnalytics();
              }
            }}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'overview'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center space-x-2">
              <BarChart3 className="w-4 h-4" />
              <span>Overview</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'users'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4" />
              <span>User Usage & Billing</span>
            </div>
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div>
          {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Sessions</p>
              <p className="text-2xl font-bold text-gray-900">{formatNumber(analytics.overview.total_sessions)}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <MessageCircle className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-gray-600">
            <Activity className="w-4 h-4 mr-1" />
            <span>{analytics.overview.active_sessions} active</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Messages</p>
              <p className="text-2xl font-bold text-gray-900">{formatNumber(analytics.overview.total_messages)}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <Users className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-gray-600">
            <TrendingUp className="w-4 h-4 mr-1" />
            <span>{analytics.overview.average_messages_per_session} avg/session</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Sessions</p>
              <p className="text-2xl font-bold text-gray-900">{formatNumber(analytics.overview.active_sessions)}</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-full">
              <Zap className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-gray-600">
            <Clock className="w-4 h-4 mr-1" />
            <span>Currently active</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Period</p>
              <p className="text-2xl font-bold text-gray-900">{selectedPeriod} days</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <Calendar className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-gray-600">
            <Database className="w-4 h-4 mr-1" />
            <span>Data range</span>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Daily Usage Trends</h3>
          <Line data={dailyUsageData} options={dailyUsageOptions} />
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Model Distribution</h3>
          <Doughnut data={modelUsageData} options={modelUsageOptions} />
        </div>
      </div>

      {/* Most Active Cases */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Most Active Cases</h3>
          <p className="text-sm text-gray-600">Cases with the most JuridenceAI sessions</p>
        </div>
        <div className="overflow-x-auto w-full">
          <table className="min-w-full divide-y divide-gray-200 w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Case ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sessions
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Messages
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {(analytics.most_active_cases || []).map((caseData, index) => (
                <tr key={caseData.case_id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    #{caseData.case_id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatNumber(caseData.session_count)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatNumber(caseData.total_messages)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <button
                      onClick={() => setSelectedSession(caseData.case_id)}
                      className="text-blue-600 hover:text-blue-800 flex items-center space-x-1"
                    >
                      <Eye className="w-4 h-4" />
                      <span>View Details</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Session Details Modal */}
      {selectedSession && sessionDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Session Details</h3>
                <button
                  onClick={() => {
                    setSelectedSession(null);
                    setSessionDetails(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Session ID</label>
                  <p className="text-sm text-gray-900">{sessionDetails.session_id}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Case ID</label>
                  <p className="text-sm text-gray-900">#{sessionDetails.case_id}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Case Title</label>
                  <p className="text-sm text-gray-900">{sessionDetails.case_title}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">User ID</label>
                  <p className="text-sm text-gray-900">{sessionDetails.user_id || 'Anonymous'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Created At</label>
                  <p className="text-sm text-gray-900">{formatDate(sessionDetails.created_at)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Last Activity</label>
                  <p className="text-sm text-gray-900">{formatDate(sessionDetails.last_activity)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Duration</label>
                  <p className="text-sm text-gray-900">{formatDuration(sessionDetails.duration_seconds)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Total Messages</label>
                  <p className="text-sm text-gray-900">{formatNumber(sessionDetails.total_messages)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">AI Model</label>
                  <p className="text-sm text-gray-900">{sessionDetails.ai_model_used}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Status</label>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    sessionDetails.is_active 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {sessionDetails.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>

              {sessionDetails.interaction_logs && sessionDetails.interaction_logs.length > 0 && (
                <div>
                  <h4 className="text-md font-semibold text-gray-900 mb-3">Recent Interactions</h4>
                  <div className="space-y-2">
                    {(sessionDetails.interaction_logs || []).map((log, index) => (
                      <div key={index} className="bg-gray-50 p-3 rounded-lg">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-sm text-gray-600">
                              Message Length: {log.user_message_length} chars
                            </p>
                            <p className="text-sm text-gray-600">
                              Response Length: {log.response_length} chars
                            </p>
                            {log.response_time_ms && (
                              <p className="text-sm text-gray-600">
                                Response Time: {log.response_time_ms}ms
                              </p>
                            )}
                            {log.tokens_used && (
                              <p className="text-sm text-gray-600">
                                Tokens Used: {formatNumber(log.tokens_used)}
                              </p>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-gray-500">
                              {formatDate(log.timestamp)}
                            </p>
                            {log.error && (
                              <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                                Error
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
        </div>
      )}

      {/* Users Tab Content */}
      {activeTab === 'users' && (
        <div>
          {userAnalytics ? (
            <div className="space-y-6">
              {/* User Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Users</p>
                      <p className="text-2xl font-bold text-gray-900">{userAnalytics.summary?.total_users || 0}</p>
                    </div>
                    <Users className="w-8 h-8 text-blue-600" />
                  </div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Tokens</p>
                      <p className="text-2xl font-bold text-gray-900">{formatNumber(userAnalytics.summary?.total_tokens || 0)}</p>
                    </div>
                    <Database className="w-8 h-8 text-green-600" />
                  </div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Cost</p>
                      <p className="text-2xl font-bold text-gray-900">${(userAnalytics.summary.total_estimated_cost || 0).toFixed(4)}</p>
                    </div>
                    <DollarSign className="w-8 h-8 text-yellow-600" />
                  </div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Avg Cost/User</p>
                      <p className="text-2xl font-bold text-gray-900">${(userAnalytics.summary.average_cost_per_user || 0).toFixed(4)}</p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-purple-600" />
                  </div>
                </div>
              </div>

              {/* User Usage Table */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">User Token Usage & Billing</h3>
                  <p className="text-sm text-gray-600">Individual user consumption and estimated costs</p>
                </div>
                <div className="overflow-x-auto w-full">
                  <table className="min-w-full divide-y divide-gray-200 w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          User
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Role/Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Sessions
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Messages
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Tokens Used
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Estimated Cost
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          AI Models
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Last Login
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {(userAnalytics.users || []).map((user) => (
                        <tr key={user.user_id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {user.first_name && user.last_name ? `${user.first_name} ${user.last_name}` : 'Unknown User'}
                              </div>
                              <div className="text-sm text-gray-500">
                                {user.email}
                              </div>
                              <div className="text-xs text-gray-400">
                                ID: {user.user_id}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div className="flex flex-col space-y-1">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                user.role === 'admin' 
                                  ? 'bg-red-100 text-red-800' 
                                  : 'bg-blue-100 text-blue-800'
                              }`}>
                                {user.role || 'user'}
                              </span>
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                user.status === 'active' 
                                  ? 'bg-green-100 text-green-800' 
                                  : user.status === 'pending'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}>
                                {user.status || 'unknown'}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatNumber(user.totals?.total_records || 0)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatNumber(user.totals?.total_api_calls || 0)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatNumber(user.totals?.total_tokens || 0)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            ${(user.totals?.total_cost || 0).toFixed(4)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div className="flex flex-wrap gap-1">
                              {user.by_resource_type?.ai_chat?.ai_models_used?.map((model, index) => (
                                <span
                                  key={index}
                                  className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                                >
                                  {model}
                                </span>
                              )) || <span className="text-gray-400">N/A</span>}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(user.last_login)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 hover:text-blue-900 cursor-pointer"
                            onClick={() => {
                              setSelectedUser(user);
                              setShowUserDetailModal(true);
                            }}>
                            View Details
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No User Data</h3>
              <p className="text-gray-600">No user-specific JuridenceAI data found for the selected period.</p>
            </div>
          )}
        </div>
      )}

      {/* User Detail Modal */}
      {showUserDetailModal && selectedUser && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex justify-center items-center">
          <div className="bg-white p-8 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                User Details: {selectedUser.first_name && selectedUser.last_name ? `${selectedUser.first_name} ${selectedUser.last_name}` : 'Unknown User'}
              </h2>
              <button onClick={() => setShowUserDetailModal(false)} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>

            {/* User Information */}
            <div className="bg-blue-50 p-4 rounded-lg mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">User Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p><strong>Name:</strong> {selectedUser.first_name && selectedUser.last_name ? `${selectedUser.first_name} ${selectedUser.last_name}` : 'Unknown User'}</p>
                  <p><strong>Email:</strong> {selectedUser.email}</p>
                  <p><strong>User ID:</strong> {selectedUser.user_id}</p>
                </div>
                <div>
                  <p><strong>Organization:</strong> {selectedUser.organization || 'N/A'}</p>
                  <p><strong>Subscription Plan:</strong> {selectedUser.subscription_plan || 'N/A'}</p>
                  <p><strong>Premium User:</strong> {selectedUser.is_premium ? 'Yes' : 'No'}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Usage Summary</h3>
                <div className="space-y-2">
                  <p><strong>Total Sessions:</strong> {formatNumber(selectedUser.totals?.total_records || 0)}</p>
                  <p><strong>Total Messages:</strong> {formatNumber(selectedUser.totals?.total_api_calls || 0)}</p>
                  <p><strong>Total Tokens:</strong> {formatNumber(selectedUser.totals?.total_tokens || 0)}</p>
                  <p><strong>Estimated Cost:</strong> ${(selectedUser.totals?.total_cost || 0).toFixed(4)}</p>
                  <p><strong>AI Models Used:</strong> {selectedUser.by_resource_type?.ai_chat?.ai_models_used?.join(', ') || 'N/A'}</p>
                  <p><strong>First Session:</strong> {formatDate(selectedUser.period?.start_date)}</p>
                  <p><strong>Last Session:</strong> {formatDate(selectedUser.period?.end_date)}</p>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Billing Information</h3>
                <div className="space-y-2">
                  <p><strong>Cost per Token (GPT-4):</strong> $0.00003</p>
                  <p><strong>Cost per Token (GPT-3.5):</strong> $0.000002</p>
                  <p><strong>Average Tokens per Session:</strong> {(selectedUser.totals?.total_records || 0) > 0 ? Math.round((selectedUser.totals?.total_tokens || 0) / (selectedUser.totals?.total_records || 1)) : 0}</p>
                  <p><strong>Average Cost per Session:</strong> ${(selectedUser.totals?.total_records || 0) > 0 ? ((selectedUser.totals?.total_cost || 0) / (selectedUser.totals?.total_records || 1)).toFixed(4) : 0}</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Daily Usage History</h3>
              <div className="overflow-x-auto w-full">
                <table className="min-w-full divide-y divide-gray-200 w-full">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">API Calls</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Tokens Used</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Cost</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {(selectedUser.daily_usage || []).map((day, index) => (
                      <tr key={index}>
                        <td className="px-4 py-2 text-sm text-gray-900">{formatDate(day.date)}</td>
                        <td className="px-4 py-2 text-sm text-gray-900">{formatNumber(day.count)}</td>
                        <td className="px-4 py-2 text-sm text-gray-900">{formatNumber(day.tokens)}</td>
                        <td className="px-4 py-2 text-sm text-gray-900">${(day.cost || 0).toFixed(4)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIAnalytics;
