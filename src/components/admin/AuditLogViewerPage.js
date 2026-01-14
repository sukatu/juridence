import React, { useState, useEffect, useRef } from 'react';
import AdminHeader from './AdminHeader';
import { apiGet } from '../../utils/api';
import { Search, ChevronDown, Download, Calendar, Filter, Eye, MoreVertical } from 'lucide-react';
import * as XLSX from 'xlsx';

const AuditLogViewerPage = ({ userInfo, onNavigate, onLogout }) => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDateMenu, setShowDateMenu] = useState(false);
  const [showTableMenu, setShowTableMenu] = useState(false);
  const [showActionMenu, setShowActionMenu] = useState(false);
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 });
  const [dateRange, setDateRange] = useState('30'); // days
  const [tableFilter, setTableFilter] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');
  const [users, setUsers] = useState({});
  const [stats, setStats] = useState({ total: 0, inserts: 0, updates: 0, deletes: 0 });

  const dateMenuRef = useRef(null);
  const tableMenuRef = useRef(null);
  const actionMenuRef = useRef(null);
  const sortMenuRef = useRef(null);
  const exportMenuRef = useRef(null);

  const tableNames = [
    { value: '', label: 'All Tables' },
    { value: 'users', label: 'Users' },
    { value: 'people', label: 'People' },
    { value: 'cases', label: 'Cases' },
    { value: 'companies', label: 'Companies' },
    { value: 'gazettes', label: 'Gazettes' },
    { value: 'gazette_entries', label: 'Gazette Entries' },
    { value: 'courts', label: 'Courts' },
    { value: 'judges', label: 'Judges' }
  ];

  const actionTypes = [
    { value: '', label: 'All Actions' },
    { value: 'INSERT', label: 'Insert' },
    { value: 'UPDATE', label: 'Update' },
    { value: 'DELETE', label: 'Delete' }
  ];

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

  // Get action badge class
  const getActionBadgeClass = (action) => {
    switch (action?.toUpperCase()) {
      case 'INSERT':
        return { bg: 'bg-green-100', text: 'text-green-700', label: 'Insert' };
      case 'UPDATE':
        return { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Update' };
      case 'DELETE':
        return { bg: 'bg-red-100', text: 'text-red-700', label: 'Delete' };
      default:
        return { bg: 'bg-gray-100', text: 'text-gray-700', label: action || 'N/A' };
    }
  };

  // Get table label
  const getTableLabel = (tableName) => {
    const table = tableNames.find(t => t.value === tableName);
    return table ? table.label : tableName || 'N/A';
  };

  // Load users to map user IDs to names
  const loadUsers = async () => {
    try {
      const response = await apiGet('/admin/users?limit=1000');
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

  // Load audit logs
  const loadLogs = async () => {
    try {
      setLoading(true);
      
      const { start, end } = getDateRange();
      
      const params = new URLSearchParams({
        limit: '1000',
        offset: '0',
        start_date: start,
        end_date: end
      });

      if (tableFilter) {
        params.append('table_name', tableFilter);
      }

      const response = await apiGet(`/admin/logs/audit?${params.toString()}`);
      let allLogs = response?.logs || [];

      // Apply action filter
      if (actionFilter) {
        allLogs = allLogs.filter(log => log.action === actionFilter);
      }

      // Apply search
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        allLogs = allLogs.filter(log => {
          const userName = users[log.user_id]?.name || 'Unknown';
          return (
            userName.toLowerCase().includes(searchLower) ||
            (log.table_name && log.table_name.toLowerCase().includes(searchLower)) ||
            (log.record_id && log.record_id.toLowerCase().includes(searchLower)) ||
            (log.field_name && log.field_name.toLowerCase().includes(searchLower)) ||
            (log.action && log.action.toLowerCase().includes(searchLower)) ||
            (log.old_value && log.old_value.toString().toLowerCase().includes(searchLower)) ||
            (log.new_value && log.new_value.toString().toLowerCase().includes(searchLower))
          );
        });
      }

      // Calculate stats
      setStats({
        total: allLogs.length,
        inserts: allLogs.filter(l => l.action === 'INSERT').length,
        updates: allLogs.filter(l => l.action === 'UPDATE').length,
        deletes: allLogs.filter(l => l.action === 'DELETE').length
      });

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

      // Apply pagination
      const total = allLogs.length;
      const totalPages = Math.ceil(total / pagination.limit);
      const startIndex = (pagination.page - 1) * pagination.limit;
      const endIndex = startIndex + pagination.limit;
      const paginatedLogs = allLogs.slice(startIndex, endIndex);

      setLogs(paginatedLogs);
      setPagination(prev => ({ ...prev, total, totalPages }));
      
    } catch (error) {
      console.error('Error loading audit logs:', error);
      alert('Failed to load audit logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
    loadLogs(); // Load logs immediately, don't wait for users
  }, []);

  useEffect(() => {
    loadLogs();
  }, [pagination.page, tableFilter, actionFilter, sortBy, sortOrder, dateRange]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dateMenuRef.current && !dateMenuRef.current.contains(event.target)) {
        setShowDateMenu(false);
      }
      if (tableMenuRef.current && !tableMenuRef.current.contains(event.target)) {
        setShowTableMenu(false);
      }
      if (actionMenuRef.current && !actionMenuRef.current.contains(event.target)) {
        setShowActionMenu(false);
      }
      if (sortMenuRef.current && !sortMenuRef.current.contains(event.target)) {
        setShowSortMenu(false);
      }
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target)) {
        setShowExportMenu(false);
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
      const actionInfo = getActionBadgeClass(log.action);
      return {
        'ID': log.id || 'N/A',
        'User': userName,
        'Table': getTableLabel(log.table_name),
        'Record ID': log.record_id || 'N/A',
        'Action': actionInfo.label,
        'Field Name': log.field_name || 'N/A',
        'Old Value': log.old_value || 'N/A',
        'New Value': log.new_value || 'N/A',
        'IP Address': log.ip_address || 'N/A',
        'Timestamp': formatDate(log.created_at)
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
    link.setAttribute('download', `audit_logs_${new Date().toISOString().split('T')[0]}.csv`);
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
      const actionInfo = getActionBadgeClass(log.action);
      return {
        'ID': log.id || 'N/A',
        'User': userName,
        'Table': getTableLabel(log.table_name),
        'Record ID': log.record_id || 'N/A',
        'Action': actionInfo.label,
        'Field Name': log.field_name || 'N/A',
        'Old Value': log.old_value || 'N/A',
        'New Value': log.new_value || 'N/A',
        'IP Address': log.ip_address || 'N/A',
        'Timestamp': formatDate(log.created_at)
      };
    });

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(exportData);
    XLSX.utils.book_append_sheet(wb, ws, 'Audit Logs');
    XLSX.writeFile(wb, `audit_logs_${new Date().toISOString().split('T')[0]}.xlsx`);
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
        <div className="flex flex-col w-full bg-white pt-4 pb-6 px-6 gap-6 rounded-lg">
          {/* Title */}
          <div className="flex flex-col items-start gap-2">
            <span className="text-[#040E1B] text-xl whitespace-nowrap">Audit Log Viewer</span>
            <span className="text-[#040E1B] text-base whitespace-nowrap">
              View and track all database changes and modifications.
            </span>
          </div>

          {/* Stats Cards */}
          <div className="flex items-start w-full gap-6">
            <div className="flex flex-col items-center bg-white text-left flex-1 py-4 gap-2 rounded-lg border border-solid border-[#D4E1EA]" style={{ boxShadow: '2px 2px 2px #0708101A' }}>
              <span className="text-[#040E1B] text-lg whitespace-nowrap">{stats.total.toLocaleString()}</span>
              <span className="text-[#525866] text-base whitespace-nowrap">Total Audit Logs</span>
            </div>
            <div className="flex flex-col items-center bg-white text-left flex-1 py-4 gap-2 rounded-lg border border-solid border-[#D4E1EA]" style={{ boxShadow: '2px 2px 2px #0708101A' }}>
              <span className="text-green-600 text-lg whitespace-nowrap">{stats.inserts.toLocaleString()}</span>
              <span className="text-[#525866] text-base whitespace-nowrap">Inserts</span>
            </div>
            <div className="flex flex-col items-center bg-white text-left flex-1 py-4 gap-2 rounded-lg border border-solid border-[#D4E1EA]" style={{ boxShadow: '2px 2px 2px #0708101A' }}>
              <span className="text-blue-600 text-lg whitespace-nowrap">{stats.updates.toLocaleString()}</span>
              <span className="text-[#525866] text-base whitespace-nowrap">Updates</span>
            </div>
            <div className="flex flex-col items-center bg-white text-left flex-1 py-4 gap-2 rounded-lg border border-solid border-[#D4E1EA]" style={{ boxShadow: '2px 2px 2px #0708101A' }}>
              <span className="text-red-600 text-lg whitespace-nowrap">{stats.deletes.toLocaleString()}</span>
              <span className="text-[#525866] text-base whitespace-nowrap">Deletes</span>
                </div>
              </div>

          {/* Filter Controls */}
          <div className="flex justify-between items-center w-full">
            <div className="flex-1 pb-0.5 mr-4">
              <div className="flex items-center self-stretch bg-[#F7F8FA] py-[7px] px-2 gap-1.5 rounded-[5px] border border-solid border-[#F7F8FA]">
                <Search className="w-[11px] h-[11px] text-[#868C98]" />
                <input
                  type="text"
                  placeholder="Search by user, table, record ID, field name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1 text-[#868C98] bg-transparent text-[10px] border-0 outline-none"
                />
              </div>
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
              <div ref={tableMenuRef} className="relative">
                <button
                  onClick={() => setShowTableMenu(!showTableMenu)}
                  className="flex items-center bg-[#F7F8FA] text-left p-2 gap-0.5 rounded-lg border border-solid border-[#D4E1EA] hover:bg-gray-100 transition-colors"
                >
                  <Filter className="w-4 h-4 text-gray-600" />
                  <span className="text-[#070810] text-sm whitespace-nowrap">
                    {tableFilter ? getTableLabel(tableFilter) : 'Table'}
                  </span>
                  <ChevronDown className="w-4 h-4 text-gray-600" />
                </button>
                {showTableMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10 p-2 max-h-64 overflow-y-auto">
                    {tableNames.map(table => (
                      <button
                        key={table.value}
                        onClick={() => {
                          setTableFilter(table.value);
                          setShowTableMenu(false);
                          setPagination(prev => ({ ...prev, page: 1 }));
                        }}
                        className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded ${
                          tableFilter === table.value ? 'bg-blue-50 text-blue-600' : ''
                        }`}
                      >
                        {table.label}
                      </button>
                    ))}
                  </div>
                )}
                </div>
              <div ref={actionMenuRef} className="relative">
                <button
                  onClick={() => setShowActionMenu(!showActionMenu)}
                  className="flex items-center bg-[#F7F8FA] text-left p-2 gap-[3px] rounded-lg border border-solid border-[#D4E1EA] hover:bg-gray-100 transition-colors"
                >
                  <span className="text-[#070810] text-sm whitespace-nowrap">
                    {actionFilter ? actionTypes.find(t => t.value === actionFilter)?.label : 'Action'}
                  </span>
                  <ChevronDown className="w-4 h-4 text-gray-600" />
                </button>
                {showActionMenu && (
                  <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-10 p-2">
                    {actionTypes.map(type => (
                      <button
                        key={type.value}
                        onClick={() => {
                          setActionFilter(type.value);
                          setShowActionMenu(false);
                          setPagination(prev => ({ ...prev, page: 1 }));
                        }}
                        className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded ${
                          actionFilter === type.value ? 'bg-blue-50 text-blue-600' : ''
                        }`}
                      >
                        {type.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div ref={sortMenuRef} className="relative">
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
              <div ref={exportMenuRef} className="relative">
                <button
                  onClick={() => setShowExportMenu(!showExportMenu)}
                  className="flex items-center bg-transparent text-left py-1 px-4 gap-[7px] rounded-lg border border-solid border-[#F59E0B] hover:bg-orange-50 transition-colors"
                >
                  <span className="text-[#F59E0B] text-base whitespace-nowrap">Export</span>
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
                </div>

          {/* Audit Logs Table */}
          {loading ? (
            <div className="flex justify-center items-center py-12 w-full">
              <span className="text-gray-500">Loading audit logs...</span>
            </div>
          ) : logs.length === 0 ? (
            <div className="flex justify-center items-center py-12 w-full">
              <span className="text-gray-500">No audit logs found</span>
            </div>
          ) : (
                <div className="flex flex-col w-full gap-1 rounded-[14px] border border-solid border-[#E5E8EC] overflow-hidden">
                  {/* Table Header */}
                  <div className="flex items-start w-full bg-[#F4F6F9] py-4 px-4 gap-3">
                <div className="flex flex-col items-start w-[12%] py-[7px]">
                  <span className="text-[#070810] text-sm font-bold whitespace-nowrap">User</span>
                </div>
                <div className="flex flex-col items-start w-[10%] py-[7px]">
                  <span className="text-[#070810] text-sm font-bold whitespace-nowrap">Table</span>
                </div>
                <div className="flex flex-col items-start w-[10%] py-[7px]">
                  <span className="text-[#070810] text-sm font-bold whitespace-nowrap">Record ID</span>
                </div>
                <div className="flex flex-col items-start w-[10%] py-[7px]">
                  <span className="text-[#070810] text-sm font-bold whitespace-nowrap">Action</span>
                </div>
                <div className="flex flex-col items-start w-[12%] py-[7px]">
                  <span className="text-[#070810] text-sm font-bold whitespace-nowrap">Field</span>
                </div>
                <div className="flex flex-col items-start w-[15%] py-[7px]">
                  <span className="text-[#070810] text-sm font-bold whitespace-nowrap">Old Value</span>
                </div>
                <div className="flex flex-col items-start w-[15%] py-[7px]">
                  <span className="text-[#070810] text-sm font-bold whitespace-nowrap">New Value</span>
                </div>
                <div className="flex flex-col items-start w-[14%] py-[7px]">
                  <span className="text-[#070810] text-sm font-bold whitespace-nowrap">Timestamp</span>
                </div>
                <div className="w-[2%] flex-shrink-0 py-[7px] flex justify-center">
                  <span className="text-[#070810] text-sm font-bold whitespace-nowrap">Actions</span>
                </div>
              </div>

              {/* Table Rows */}
              {logs.map((item, idx) => {
                const actionInfo = getActionBadgeClass(item.action);
                const userName = users[item.user_id]?.name || 'Unknown';
                const oldValue = item.old_value ? (typeof item.old_value === 'string' ? item.old_value : JSON.stringify(item.old_value)) : '-';
                const newValue = item.new_value ? (typeof item.new_value === 'string' ? item.new_value : JSON.stringify(item.new_value)) : '-';
                
                return (
                  <div 
                    key={idx} 
                    className="flex items-center w-full py-3 px-4 gap-3 hover:bg-blue-50 transition-colors"
                  >
                    <div className="flex flex-col items-start w-[12%] py-[7px]">
                      <span className="text-[#070810] text-sm whitespace-nowrap overflow-hidden text-ellipsis w-full">{userName}</span>
                    </div>
                    <div className="flex flex-col items-start w-[10%] py-[7px]">
                      <span className="text-[#070810] text-sm whitespace-nowrap overflow-hidden text-ellipsis w-full">{getTableLabel(item.table_name)}</span>
                    </div>
                    <div className="flex flex-col items-start w-[10%] py-[7px]">
                      <span className="text-[#070810] text-sm whitespace-nowrap overflow-hidden text-ellipsis w-full">{item.record_id || 'N/A'}</span>
                    </div>
                    <div className="flex flex-col items-start w-[10%] py-[7px]">
                      <span className={`text-xs px-2 py-1 rounded ${actionInfo.bg} ${actionInfo.text} whitespace-nowrap`}>
                        {actionInfo.label}
                      </span>
                    </div>
                    <div className="flex flex-col items-start w-[12%] py-[7px]">
                      <span className="text-[#070810] text-sm whitespace-nowrap overflow-hidden text-ellipsis w-full">{item.field_name || 'N/A'}</span>
                    </div>
                    <div className="flex flex-col items-start w-[15%] py-[7px]">
                      <span className="text-[#070810] text-sm whitespace-nowrap overflow-hidden text-ellipsis w-full" title={oldValue}>
                        {oldValue.length > 20 ? oldValue.substring(0, 20) + '...' : oldValue}
                      </span>
                  </div>
                    <div className="flex flex-col items-start w-[15%] py-[7px]">
                      <span className="text-[#070810] text-sm whitespace-nowrap overflow-hidden text-ellipsis w-full" title={newValue}>
                        {newValue.length > 20 ? newValue.substring(0, 20) + '...' : newValue}
                      </span>
                      </div>
                    <div className="flex flex-col items-start w-[14%] py-[7px]">
                      <span className="text-[#070810] text-sm whitespace-nowrap overflow-hidden text-ellipsis w-full">{formatDate(item.created_at)}</span>
                    </div>
                    <div className="w-[2%] flex-shrink-0 flex items-center justify-center py-[7px]">
                      <button
                        onClick={() => {
                          setSelectedLog({...item, userName});
                          setShowDetailModal(true);
                        }}
                        className="p-1 hover:bg-gray-100 rounded"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4 text-gray-600" />
                      </button>
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
                <img
                  src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Iq8V0MifpP/89iv7huw_expires_30_days.png"
                  className="w-4 h-4 rounded object-fill"
                />
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
                <img
                  src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Iq8V0MifpP/u1o3gwuf_expires_30_days.png"
                  className="w-4 h-4 rounded object-fill"
                />
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

      {/* Detail Modal */}
      {showDetailModal && selectedLog && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowDetailModal(false)}></div>
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Audit Log Details</h3>
                  <button
                    onClick={() => setShowDetailModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">User</label>
                    <p className="text-sm text-gray-900">{selectedLog.userName || 'Unknown'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Table</label>
                    <p className="text-sm text-gray-900">{getTableLabel(selectedLog.table_name)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Record ID</label>
                    <p className="text-sm text-gray-900">{selectedLog.record_id || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Action</label>
                    <span className={`inline-block text-xs px-2 py-1 rounded ${getActionBadgeClass(selectedLog.action).bg} ${getActionBadgeClass(selectedLog.action).text}`}>
                      {getActionBadgeClass(selectedLog.action).label}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Field Name</label>
                    <p className="text-sm text-gray-900">{selectedLog.field_name || 'N/A'}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Old Value</label>
                      <textarea
                        readOnly
                        value={selectedLog.old_value || 'N/A'}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-gray-50"
                        rows={4}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">New Value</label>
                      <textarea
                        readOnly
                        value={selectedLog.new_value || 'N/A'}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-gray-50"
                        rows={4}
                      />
                    </div>
                </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">IP Address</label>
                    <p className="text-sm text-gray-900">{selectedLog.ip_address || 'N/A'}</p>
              </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Timestamp</label>
                    <p className="text-sm text-gray-900">{formatDate(selectedLog.created_at)}</p>
                  </div>
                  {selectedLog.user_agent && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">User Agent</label>
                      <p className="text-sm text-gray-900 break-words">{selectedLog.user_agent}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuditLogViewerPage;
