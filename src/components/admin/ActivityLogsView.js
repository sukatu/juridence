import React, { useState, useEffect, useRef } from 'react';
import ActivityLogDetailsDrawer from './ActivityLogDetailsDrawer';
import AdminHeader from './AdminHeader';
import { apiGet } from '../../utils/api';
import { Search, ChevronDown, Download, Calendar, Filter, ChevronLeft, ChevronRight, ArrowLeft } from 'lucide-react';
import * as XLSX from 'xlsx';

const ActivityLogsView = ({ category, onBack, userInfo, onNavigate, onLogout }) => {
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedLog, setSelectedLog] = useState(null);
  const [showLogDrawer, setShowLogDrawer] = useState(false);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showActionTypeMenu, setShowActionTypeMenu] = useState(false);
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [showDateMenu, setShowDateMenu] = useState(false);
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [stats, setStats] = useState({ totalAdmins: 0, totalMinutes: 0, totalData: 0 });
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 });
  const [dateRange, setDateRange] = useState('30'); // days
  const [actionTypeFilter, setActionTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');
  const [users, setUsers] = useState({});

  const filterMenuRef = useRef(null);
  const sortMenuRef = useRef(null);
  const exportMenuRef = useRef(null);
  const dateMenuRef = useRef(null);
  const actionTypeMenuRef = useRef(null);
  const statusMenuRef = useRef(null);

  const getStatusClasses = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'success':
      case 'info':
        return { bg: 'bg-[#30AB401A]', text: 'text-emerald-500' };
      case 'error':
      case 'critical':
        return { bg: 'bg-[#F359261A]', text: 'text-red-500' };
      case 'warning':
        return { bg: 'bg-yellow-100', text: 'text-yellow-600' };
      default:
        return { bg: 'bg-gray-100', text: 'text-gray-600' };
    }
  };

  const getStatusLabel = (severity) => {
    if (!severity) return 'Unknown';
    const statusMap = {
      'success': 'Success',
      'info': 'Success',
      'error': 'With error',
      'critical': 'With error',
      'warning': 'Warning',
      'debug': 'Debug'
    };
    return statusMap[severity.toLowerCase()] || 'Success';
  };

  const filters = [
    { id: 'all', label: 'All', resourceType: null },
    { id: 'people', label: 'People', resourceType: 'people' },
    { id: 'cases', label: 'Cases', resourceType: 'case' },
    { id: 'companies', label: 'Companies', resourceType: 'company' },
    { id: 'gazettes', label: 'Gazettes', resourceType: 'gazette' },
    { id: 'commercial-bulletin', label: 'Commercial Bulletin', resourceType: 'commercial_bulletin' },
    { id: 'search-requests', label: 'Search requests', resourceType: 'search_request' }
  ];

  const actionTypes = [
    { value: '', label: 'All Actions' },
    { value: 'CREATE', label: 'Create' },
    { value: 'UPDATE', label: 'Update' },
    { value: 'DELETE', label: 'Delete' },
    { value: 'VIEW', label: 'View' },
    { value: 'SEARCH', label: 'Search' },
    { value: 'DOWNLOAD', label: 'Download' },
    { value: 'UPLOAD', label: 'Upload' },
    { value: 'LOGIN', label: 'Login' },
    { value: 'LOGOUT', label: 'Logout' }
  ];

  const statusTypes = [
    { value: '', label: 'All Statuses' },
    { value: 'success', label: 'Success' },
    { value: 'error', label: 'With error' },
    { value: 'warning', label: 'Warning' }
  ];

  // Map category to user role
  const getRoleForCategory = (categoryName) => {
    if (categoryName === 'Administrators') return 'admin';
    if (categoryName === 'Corporate Clients') return 'corporate_client';
    if (categoryName === 'Court Registrars') return 'court_registrar';
    return null;
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) + 
             ' - ' + date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return dateString;
    }
  };

  // Get date range for API
  const getDateRange = () => {
    const days = parseInt(dateRange);
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    return {
      start: startDate.toISOString(),
      end: endDate.toISOString()
    };
  };

  // Load users to map user IDs to names
  const loadUsers = async () => {
    try {
      const role = getRoleForCategory(category);
      if (!role) return;
      
      const response = await apiGet(`/admin/users?limit=1000&role=${role}`);
      if (response && response.users) {
        const userMap = {};
        response.users.forEach(user => {
          userMap[user.id] = {
            name: `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email || 'Unknown',
            email: user.email
          };
        });
        setUsers(userMap);
      }
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  // Load activity logs
  const loadLogs = async () => {
    try {
      setLoading(true);
      
      const role = getRoleForCategory(category);
      const { start, end } = getDateRange();
      
      const params = new URLSearchParams({
        limit: '1000',
        offset: '0',
        start_date: start,
        end_date: end
      });

      if (actionTypeFilter) {
        params.append('activity_type', actionTypeFilter.toLowerCase());
      }

      const response = await apiGet(`/admin/logs/activity?${params.toString()}`);
      let allLogs = response?.logs || [];

      // Filter by user role if category is selected
      if (role && users) {
        const userIds = Object.keys(users).map(id => parseInt(id));
        allLogs = allLogs.filter(log => userIds.includes(log.user_id));
      }

      // Apply resource type filter
      if (activeFilter !== 'all') {
        const filterObj = filters.find(f => f.id === activeFilter);
        if (filterObj && filterObj.resourceType) {
          allLogs = allLogs.filter(log => {
            const resourceType = (log.resource_type || '').toLowerCase();
            return resourceType.includes(filterObj.resourceType.toLowerCase());
          });
        }
      }

      // Apply status filter
      if (statusFilter) {
        allLogs = allLogs.filter(log => {
          const severity = (log.severity || '').toLowerCase();
          return severity === statusFilter.toLowerCase();
        });
      }

      // Apply search
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        allLogs = allLogs.filter(log => {
          const userName = users[log.user_id]?.name || 'Unknown';
          return (
            userName.toLowerCase().includes(searchLower) ||
            (log.action && log.action.toLowerCase().includes(searchLower)) ||
            (log.resource_id && log.resource_id.toLowerCase().includes(searchLower)) ||
            (log.description && log.description.toLowerCase().includes(searchLower)) ||
            (log.ip_address && log.ip_address.toLowerCase().includes(searchLower))
          );
        });
      }

      // Sort
      allLogs.sort((a, b) => {
        let aVal, bVal;
        if (sortBy === 'created_at') {
          aVal = new Date(a.created_at || 0);
          bVal = new Date(b.created_at || 0);
        } else {
          aVal = a[sortBy] || '';
          bVal = b[sortBy] || '';
        }
        
        if (sortOrder === 'asc') {
          return aVal > bVal ? 1 : -1;
        } else {
          return aVal < bVal ? 1 : -1;
        }
      });

      // Calculate stats
      const uniqueUsers = new Set(allLogs.map(log => log.user_id).filter(Boolean));
      setStats({
        totalAdmins: uniqueUsers.size,
        totalMinutes: Math.floor(allLogs.length * 0.5), // Mock calculation
        totalData: allLogs.length
      });

      // Apply pagination
      const total = allLogs.length;
      const totalPages = Math.ceil(total / pagination.limit);
      const startIndex = (pagination.page - 1) * pagination.limit;
      const endIndex = startIndex + pagination.limit;
      const paginatedLogs = allLogs.slice(startIndex, endIndex);

      setLogs(paginatedLogs);
      setPagination(prev => ({ ...prev, total, totalPages }));
      
    } catch (error) {
      console.error('Error loading logs:', error);
      alert('Failed to load activity logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [category]);

  useEffect(() => {
    if (Object.keys(users).length > 0 || !getRoleForCategory(category)) {
      loadLogs();
    }
  }, [pagination.page, activeFilter, actionTypeFilter, statusFilter, searchTerm, sortBy, sortOrder, dateRange, users, category]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterMenuRef.current && !filterMenuRef.current.contains(event.target)) {
        setShowSortMenu(false);
      }
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target)) {
        setShowExportMenu(false);
      }
      if (dateMenuRef.current && !dateMenuRef.current.contains(event.target)) {
        setShowDateMenu(false);
      }
      if (actionTypeMenuRef.current && !actionTypeMenuRef.current.contains(event.target)) {
        setShowActionTypeMenu(false);
      }
      if (statusMenuRef.current && !statusMenuRef.current.contains(event.target)) {
        setShowStatusMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle search
  useEffect(() => {
    const timer = setTimeout(() => {
      setPagination(prev => ({ ...prev, page: 1 }));
      loadLogs();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Export to CSV
  const exportToCSV = () => {
    const exportData = logs.map(log => {
      const userName = users[log.user_id]?.name || 'Unknown';
      return {
        'Name/ID': userName,
        'IP Address': log.ip_address || 'N/A',
        'Action': log.action || 'N/A',
        'Timestamp': formatDate(log.created_at),
        'Module': log.resource_type || 'N/A',
        'Item ID': log.resource_id || 'N/A',
        'Status': getStatusLabel(log.severity),
        'Description': log.description || 'N/A'
      };
    });

    const headers = Object.keys(exportData[0]);
    let csvContent = headers.join(',') + '\n';
    
    exportData.forEach(row => {
      const values = headers.map(header => {
        const value = row[header] || '';
        if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      });
      csvContent += values.join(',') + '\n';
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `activity_logs_${category}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setShowExportMenu(false);
  };

  // Export to Excel
  const exportToExcel = () => {
    const exportData = logs.map(log => {
      const userName = users[log.user_id]?.name || 'Unknown';
      return {
        'Name/ID': userName,
        'IP Address': log.ip_address || 'N/A',
        'Action': log.action || 'N/A',
        'Timestamp': formatDate(log.created_at),
        'Module': log.resource_type || 'N/A',
        'Item ID': log.resource_id || 'N/A',
        'Status': getStatusLabel(log.severity),
        'Description': log.description || 'N/A'
      };
    });

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(exportData);
    XLSX.utils.book_append_sheet(wb, ws, 'Activity Logs');
    XLSX.writeFile(wb, `activity_logs_${category}_${new Date().toISOString().split('T')[0]}.xlsx`);
    setShowExportMenu(false);
  };

  // Handle page change
  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  return (
    <div className="bg-[#F7F8FA] min-h-screen w-full">
      {/* Header */}
      <AdminHeader userInfo={userInfo} onNavigate={onNavigate} onLogout={onLogout} />

      {/* Main Content */}
      <div className="px-6 w-full">
        <div className="flex flex-col items-center w-full bg-white py-[13px] px-6 gap-6 rounded-lg">
          <div className="flex flex-col items-start w-full gap-4">
            {/* Breadcrumb and Filters */}
            <div className="flex justify-between items-center w-full">
              <div className="flex items-start">
                <span className="text-[#525866] text-xs mr-1.5 whitespace-nowrap">REPORTS & LOGS</span>
                <ChevronRight className="w-4 h-4 mr-1 text-[#525866] flex-shrink-0" />
                <span className="text-[#070810] text-sm whitespace-nowrap">{category}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[#525866] text-xs whitespace-nowrap">Show data for</span>
                <div ref={dateMenuRef} className="relative">
                  <button
                    onClick={() => setShowDateMenu(!showDateMenu)}
                    className="flex items-center bg-[#F7F8FA] p-2 gap-1 rounded-lg border border-solid border-[#D4E1EA] hover:bg-gray-100"
                  >
                    <Calendar className="w-4 h-4 text-gray-600" />
                    <span className="text-[#070810] text-sm whitespace-nowrap">
                      Last {dateRange} days (as of {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })})
                    </span>
                    <ChevronDown className="w-4 h-4 text-gray-600" />
                  </button>
                  {showDateMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10 p-2">
                      {[7, 30, 60, 90, 365].map(days => (
                        <button
                          key={days}
                          onClick={() => {
                            setDateRange(days.toString());
                            setShowDateMenu(false);
                            setPagination(prev => ({ ...prev, page: 1 }));
                          }}
                          className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded ${
                            dateRange === days.toString() ? 'bg-blue-50 text-blue-600' : ''
                          }`}
                        >
                          Last {days} days
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <div ref={actionTypeMenuRef} className="relative">
                  <button
                    onClick={() => setShowActionTypeMenu(!showActionTypeMenu)}
                    className="flex items-center bg-[#F7F8FA] text-left p-2 gap-0.5 rounded-lg border border-solid border-[#D4E1EA] hover:bg-gray-100 transition-colors"
                  >
                    <span className="text-[#070810] text-sm whitespace-nowrap">
                      {actionTypeFilter ? actionTypes.find(t => t.value === actionTypeFilter)?.label : 'Action type'}
                    </span>
                    <ChevronDown className="w-4 h-4 text-gray-600" />
                  </button>
                  {showActionTypeMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10 p-2">
                      {actionTypes.map(type => (
                        <button
                          key={type.value}
                          onClick={() => {
                            setActionTypeFilter(type.value);
                            setShowActionTypeMenu(false);
                            setPagination(prev => ({ ...prev, page: 1 }));
                          }}
                          className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded ${
                            actionTypeFilter === type.value ? 'bg-blue-50 text-blue-600' : ''
                          }`}
                        >
                          {type.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <div ref={statusMenuRef} className="relative">
                  <button
                    onClick={() => setShowStatusMenu(!showStatusMenu)}
                    className="flex items-center bg-[#F7F8FA] text-left p-2 gap-[3px] rounded-lg border border-solid border-[#D4E1EA] hover:bg-gray-100 transition-colors"
                  >
                    <span className="text-[#070810] text-sm whitespace-nowrap">
                      {statusFilter ? statusTypes.find(t => t.value === statusFilter)?.label : 'Status'}
                    </span>
                    <ChevronDown className="w-4 h-4 text-gray-600" />
                </button>
                  {showStatusMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10 p-2">
                      {statusTypes.map(type => (
                        <button
                          key={type.value}
                          onClick={() => {
                            setStatusFilter(type.value);
                            setShowStatusMenu(false);
                            setPagination(prev => ({ ...prev, page: 1 }));
                          }}
                          className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded ${
                            statusFilter === type.value ? 'bg-blue-50 text-blue-600' : ''
                          }`}
                        >
                          {type.label}
                </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Back Button */}
            <button onClick={onBack} className="cursor-pointer hover:opacity-70 p-2 rounded-lg hover:bg-gray-100 transition-colors">
              <ArrowLeft className="w-6 h-6 text-[#040E1B] flex-shrink-0" />
            </button>

            {/* Filter Tabs */}
            <div className="flex items-start p-1 gap-4">
              {filters.map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => {
                    setActiveFilter(filter.id);
                    setPagination(prev => ({ ...prev, page: 1 }));
                  }}
                  className={`flex flex-col items-start pb-2 ${
                    activeFilter === filter.id ? 'border-b-2 border-[#022658]' : ''
                  }`}
                >
                  <span
                    className={`text-base whitespace-nowrap ${
                      activeFilter === filter.id ? 'text-[#022658] font-bold' : 'text-[#525866]'
                    }`}
                  >
                    {filter.label}
                  </span>
                </button>
              ))}
            </div>

            {/* Stats Cards */}
            <div className="flex items-start w-full gap-6">
              <div className="flex flex-col items-center bg-white text-left flex-1 py-[21px] gap-2 rounded-lg border border-solid border-[#D4E1EA]" style={{ boxShadow: '2px 2px 2px #0708101A' }}>
                <span className="text-[#040E1B] text-lg whitespace-nowrap">{stats.totalAdmins}</span>
                <span className="text-[#525866] text-base whitespace-nowrap">Total {category}</span>
              </div>
              <div className="flex flex-col items-center bg-white text-left flex-1 py-[21px] gap-2 rounded-lg border border-solid border-[#D4E1EA]" style={{ boxShadow: '2px 2px 2px #0708101A' }}>
                <span className="text-[#040E1B] text-lg whitespace-nowrap">{stats.totalMinutes.toLocaleString()}</span>
                <span className="text-[#525866] text-base whitespace-nowrap">Total minutes spent</span>
              </div>
              <div className="flex flex-col items-center bg-white text-left flex-1 py-[21px] gap-2 rounded-lg border border-solid border-[#D4E1EA]" style={{ boxShadow: '2px 2px 2px #0708101A' }}>
                <span className="text-[#040E1B] text-lg whitespace-nowrap">{stats.totalData.toLocaleString()}</span>
                <span className="text-[#525866] text-base whitespace-nowrap">Total Activities</span>
              </div>
            </div>
          </div>

          {/* Search, Sort and Export */}
          <div className="flex justify-between items-start w-full pb-[1px] gap-2">
            <div className="flex-1 pb-0.5 mr-4">
              <div className="flex items-center self-stretch bg-[#F7F8FA] py-[7px] px-2 gap-1.5 rounded-[5px] border border-solid border-[#F7F8FA]">
                <Search className="w-[11px] h-[11px] text-[#868C98]" />
                <input
                  type="text"
                  placeholder="Search here"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1 text-[#868C98] bg-transparent text-[10px] border-0 outline-none"
                />
              </div>
            </div>
            <div className="flex items-start gap-[7px] mr-4">
              <div ref={filterMenuRef} className="relative">
                <button
                  onClick={() => setShowSortMenu(!showSortMenu)}
                  className="flex items-center py-[7px] px-[9px] gap-[5px] rounded border border-solid border-[#D4E1EA] cursor-pointer hover:bg-gray-50"
                >
                  <ChevronDown className="w-[11px] h-[11px] text-[#525866]" />
                <span className="text-[#525866] text-xs whitespace-nowrap">Sort</span>
                </button>
                {showSortMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10 p-3">
                    <div className="space-y-2">
                      <button
                        onClick={() => {
                          setSortBy('created_at');
                          setSortOrder('desc');
                          setShowSortMenu(false);
                          setPagination(prev => ({ ...prev, page: 1 }));
                        }}
                        className={`w-full text-left text-xs px-2 py-1 rounded hover:bg-gray-100 ${
                          sortBy === 'created_at' && sortOrder === 'desc' ? 'bg-blue-50 text-blue-600' : ''
                        }`}
                      >
                        Date (Newest First)
                      </button>
                      <button
                        onClick={() => {
                          setSortBy('created_at');
                          setSortOrder('asc');
                          setShowSortMenu(false);
                          setPagination(prev => ({ ...prev, page: 1 }));
                        }}
                        className={`w-full text-left text-xs px-2 py-1 rounded hover:bg-gray-100 ${
                          sortBy === 'created_at' && sortOrder === 'asc' ? 'bg-blue-50 text-blue-600' : ''
                        }`}
                      >
                        Date (Oldest First)
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div ref={exportMenuRef} className="relative">
              <button
                onClick={() => setShowExportMenu(!showExportMenu)}
                className="flex items-center bg-transparent text-left py-1 px-4 gap-[7px] rounded-lg border border-solid border-[#F59E0B] hover:bg-orange-50 transition-colors"
              >
              <span className="text-[#F59E0B] text-base whitespace-nowrap">Export list</span>
                <Download className="w-4 h-4 text-[#F59E0B]" />
              </button>
              {showExportMenu && (
                <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                  <button
                    onClick={exportToCSV}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Export to CSV
                  </button>
                  <button
                    onClick={exportToExcel}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Export to Excel
            </button>
                </div>
              )}
            </div>
          </div>

          {/* Activity Table */}
          {loading ? (
            <div className="flex justify-center items-center py-12 w-full">
              <span className="text-gray-500">Loading...</span>
            </div>
          ) : logs.length === 0 ? (
            <div className="flex justify-center items-center py-12 w-full">
              <span className="text-gray-500">No activity logs found</span>
            </div>
          ) : (
          <div className="flex flex-col w-full gap-1 rounded-[14px] border border-solid border-[#E5E8EC] overflow-hidden">
            {/* Table Header */}
            <div className="flex items-start w-full bg-[#F4F6F9] py-4 px-4 gap-3">
              <div className="flex flex-col items-start w-[13%] py-[7px]">
                <span className="text-[#070810] text-sm font-bold whitespace-nowrap">Name/ID</span>
              </div>
              <div className="flex flex-col items-start w-[13%] py-[7px]">
                <span className="text-[#070810] text-sm font-bold whitespace-nowrap">IP Address</span>
              </div>
              <div className="flex flex-col items-start w-[12%] py-[7px]">
                <span className="text-[#070810] text-sm font-bold whitespace-nowrap">Action</span>
              </div>
              <div className="flex flex-col items-start w-[16%] py-[7px]">
                <span className="text-[#070810] text-sm font-bold whitespace-nowrap">Timestamp</span>
              </div>
              <div className="flex flex-col items-start w-[12%] py-[7px]">
                <span className="text-[#070810] text-sm font-bold whitespace-nowrap">Module</span>
              </div>
              <div className="flex flex-col items-start w-[16%] py-[7px]">
                <span className="text-[#070810] text-sm font-bold whitespace-nowrap">Item ID</span>
              </div>
              <div className="flex flex-col items-start w-[18%] py-[7px]">
                <span className="text-[#070810] text-sm font-bold whitespace-nowrap">Status</span>
              </div>
            </div>

            {/* Table Rows */}
              {logs.map((item, idx) => {
                const statusClasses = getStatusClasses(item.severity);
                const userName = users[item.user_id]?.name || 'Unknown';
              return (
                <div 
                  key={idx} 
                  onClick={() => {
                      setSelectedLog({...item, name: userName});
                    setShowLogDrawer(true);
                  }}
                  className="flex items-center w-full py-3 px-4 gap-3 hover:bg-blue-50 cursor-pointer transition-colors"
                >
                  <div className="flex flex-col items-start w-[13%] py-[7px]">
                      <span className="text-[#070810] text-sm whitespace-nowrap overflow-hidden text-ellipsis w-full">{userName}</span>
                  </div>
                  <div className="flex flex-col items-start w-[13%] py-[7px]">
                      <span className="text-[#070810] text-sm whitespace-nowrap overflow-hidden text-ellipsis w-full">{item.ip_address || 'N/A'}</span>
                  </div>
                  <div className="flex flex-col items-start w-[12%] py-[7px]">
                      <span className="text-[#070810] text-sm whitespace-nowrap overflow-hidden text-ellipsis w-full">{item.action || 'N/A'}</span>
                  </div>
                  <div className="flex flex-col items-start w-[16%] py-[7px]">
                      <span className="text-[#070810] text-sm whitespace-nowrap overflow-hidden text-ellipsis w-full">{formatDate(item.created_at)}</span>
                  </div>
                  <div className="flex flex-col items-start w-[12%] py-[7px]">
                      <span className="text-[#070810] text-sm whitespace-nowrap overflow-hidden text-ellipsis w-full">{item.resource_type || 'N/A'}</span>
                  </div>
                  <div className="flex flex-col items-start w-[16%] py-[7px]">
                      <span className="text-[#070810] text-sm whitespace-nowrap overflow-hidden text-ellipsis w-full">{item.resource_id || 'N/A'}</span>
                  </div>
                  <div className="flex flex-col w-[18%] py-2">
                    <div className={`flex items-center justify-center ${statusClasses.bg} py-[3px] px-4 rounded-lg`}>
                        <span className={`${statusClasses.text} text-xs whitespace-nowrap`}>{getStatusLabel(item.severity)}</span>
                      </div>
                  </div>
                </div>
              );
            })}
          </div>
          )}

          {/* Pagination */}
          {!loading && logs.length > 0 && (
          <div className="flex items-center justify-start w-full">
              <span className="text-[#525866] text-sm mr-[42px] whitespace-nowrap">
                {((pagination.page - 1) * pagination.limit) + 1}-{Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
              </span>
              <button 
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="flex items-start bg-white text-left w-[70px] py-2 px-3 mr-1.5 gap-1 rounded border border-solid border-[#D4E1EA] hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
              <ChevronLeft className="w-4 h-4 text-[#525866]" />
              <span className="text-[#525866] text-xs whitespace-nowrap">Back</span>
            </button>
              
              {/* Page Numbers */}
              {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                let pageNum;
                if (pagination.totalPages <= 5) {
                  pageNum = i + 1;
                } else if (pagination.page <= 3) {
                  pageNum = i + 1;
                } else if (pagination.page >= pagination.totalPages - 2) {
                  pageNum = pagination.totalPages - 4 + i;
                } else {
                  pageNum = pagination.page - 2 + i;
                }
                
                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`flex flex-col items-start py-[7px] px-2 mr-1.5 rounded border border-solid ${
                      pagination.page === pageNum
                        ? 'bg-[#022658] border-[#022658]'
                        : 'bg-white border-[#D4E1EA] hover:bg-gray-50'
                    }`}
                  >
                    <span className={`text-xs whitespace-nowrap ${
                      pagination.page === pageNum ? 'text-white font-bold' : 'text-[#525866]'
                    }`}>
                      {pageNum}
                    </span>
                  </button>
                );
              })}
              
              <button 
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages}
                className="flex items-start bg-white text-left w-[68px] py-2 px-3 mr-10 gap-1.5 rounded border border-solid border-[#D4E1EA] hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
              <span className="text-[#525866] text-xs whitespace-nowrap">Next</span>
              <ChevronRight className="w-4 h-4 text-[#525866]" />
            </button>
            <div className="flex items-center w-[119px]">
              <span className="text-[#040E1B] text-sm mr-[11px] whitespace-nowrap">Page</span>
                <input
                  type="number"
                  min="1"
                  max={pagination.totalPages}
                  value={pagination.page}
                  onChange={(e) => {
                    const page = parseInt(e.target.value);
                    if (page >= 1 && page <= pagination.totalPages) {
                      handlePageChange(page);
                    }
                  }}
                  className="flex flex-col items-start bg-white w-[51px] py-[5px] pl-2 mr-2 rounded border border-solid border-[#F59E0B] text-sm"
                />
                <span 
                  onClick={() => handlePageChange(pagination.page)}
                  className="text-[#F59E0B] text-sm font-bold cursor-pointer hover:underline whitespace-nowrap"
                >
                  Go
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Activity Log Details Drawer */}
      {showLogDrawer && selectedLog && (
        <ActivityLogDetailsDrawer
          logEntry={selectedLog}
          onClose={() => setShowLogDrawer(false)}
        />
      )}
    </div>
  );
};

export default ActivityLogsView;
