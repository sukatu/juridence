import React, { useState, useEffect, useRef } from 'react';
import AssignRequestDrawer from './AssignRequestDrawer';
import SearchRequestDetails from './SearchRequestDetails';
import SuccessNotification from './SuccessNotification';
import AdminHeader from './AdminHeader';
import { apiGet, apiPut } from '../../utils/api';
import { showSuccess, handleApiError, confirmAction } from '../../utils/errorHandler';
import { Search, Filter, ChevronDown, Download, MoreVertical, Eye, UserCheck, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import * as XLSX from 'xlsx';

const ManageRequestsPage = ({ userInfo, onNavigate, onLogout }) => {
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showAssignDrawer, setShowAssignDrawer] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [showActionMenu, setShowActionMenu] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [stats, setStats] = useState({ total: 0, assignedToMe: 0, unassigned: 0, inProgress: 0, overdue: 0, completedToday: 0 });
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 });
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');
  const [statusFilter, setStatusFilter] = useState('');
  const [requestTypeFilter, setRequestTypeFilter] = useState('');
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [users, setUsers] = useState([]);
  
  const filterMenuRef = useRef(null);
  const sortMenuRef = useRef(null);
  const exportMenuRef = useRef(null);
  const actionMenuRefs = useRef({});

  const getStatusClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return { class: 'text-[#DEBB0C]', bg: 'bg-yellow-50', text: 'text-yellow-700' };
      case 'in_progress':
      case 'in-progress':
        return { class: 'text-blue-500', bg: 'bg-blue-50', text: 'text-blue-700' };
      case 'completed':
        return { class: 'text-emerald-500', bg: 'bg-green-50', text: 'text-green-700' };
      case 'rejected':
      case 'cancelled':
        return { class: 'text-red-500', bg: 'bg-red-50', text: 'text-red-700' };
      default:
        return { class: 'text-gray-600', bg: 'bg-gray-50', text: 'text-gray-700' };
    }
  };

  const getStatusLabel = (status) => {
    if (!status) return 'Unknown';
    const statusMap = {
      'pending': 'Pending',
      'in_progress': 'In Progress',
      'in-progress': 'In Progress',
      'completed': 'Completed',
      'rejected': 'Rejected',
      'cancelled': 'Cancelled'
    };
    return statusMap[status.toLowerCase()] || status;
  };

  const getRequestTypeLabel = (type) => {
    if (!type) return 'Other';
    const typeMap = {
      'case_details': 'Case history research',
      'legal_documents': 'Legal Documents',
      'court_records': 'Court Records',
      'financial_information': 'Financial Information',
      'profile_information': 'Person verification',
      'contact_details': 'Contact Details',
      'management_details': 'Company due diligence',
      'legal_history': 'Legal History',
      'other': 'Other'
    };
    return typeMap[type?.toLowerCase()] || type;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch (e) {
      return dateString;
    }
  };

  // Check if request is overdue (>48 hours)
  const isOverdue = (request) => {
    if (!request.created_at) return false;
    const created = new Date(request.created_at);
    const now = new Date();
    const hoursDiff = (now - created) / (1000 * 60 * 60);
    return hoursDiff > 48 && request.status !== 'completed';
  };

  // Check if completed today
  const isCompletedToday = (request) => {
    if (!request.completed_at) return false;
    const completed = new Date(request.completed_at);
    const today = new Date();
    return completed.toDateString() === today.toDateString();
  };

  const filters = [
    { id: 'all', label: 'All', requestType: null },
    { id: 'assigned-to-me', label: 'Assigned to Me', requestType: null },
    { id: 'unassigned', label: 'Unassigned', requestType: null },
    { id: 'in-progress', label: 'In Progress', requestType: null },
    { id: 'overdue', label: 'Overdue (>48hrs)', requestType: null },
    { id: 'completed-today', label: 'Completed Today', requestType: null }
  ];

  // Load users for assignment
  const loadUsers = async () => {
    try {
      const response = await apiGet('/admin/users?limit=100');
      if (response && response.users) {
        setUsers(response.users);
      }
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  // Load requests from API
  const loadRequests = async () => {
    try {
      setLoading(true);
      
      const params = new URLSearchParams({
        skip: '0',
        limit: '1000' // Get more for client-side filtering
      });

      if (statusFilter) {
        params.append('status', statusFilter);
      }

      if (requestTypeFilter) {
        params.append('request_type', requestTypeFilter);
      }

      const response = await apiGet(`/request-details?${params.toString()}`);
      let allRequests = Array.isArray(response) ? response : [];

      // Apply client-side search
      if (searchTerm) {
        allRequests = allRequests.filter(req => {
          const searchLower = searchTerm.toLowerCase();
          return (
            (req.entity_name && req.entity_name.toLowerCase().includes(searchLower)) ||
            (req.requester_name && req.requester_name.toLowerCase().includes(searchLower)) ||
            (req.requester_email && req.requester_email.toLowerCase().includes(searchLower)) ||
            (req.case_suit_number && req.case_suit_number.toLowerCase().includes(searchLower)) ||
            (req.id && req.id.toString().includes(searchLower)) ||
            (getRequestTypeLabel(req.request_type).toLowerCase().includes(searchLower))
          );
        });
      }

      // Apply active filter
      const currentUser = userInfo?.username || userInfo?.full_name || userInfo?.email;
      let filteredRequests = allRequests;
      
      if (activeFilter === 'assigned-to-me') {
        filteredRequests = allRequests.filter(r => r.assigned_to === currentUser);
      } else if (activeFilter === 'unassigned') {
        filteredRequests = allRequests.filter(r => !r.assigned_to);
      } else if (activeFilter === 'in-progress') {
        filteredRequests = allRequests.filter(r => r.status === 'in_progress' || r.status === 'in-progress');
      } else if (activeFilter === 'overdue') {
        filteredRequests = allRequests.filter(r => isOverdue(r));
      } else if (activeFilter === 'completed-today') {
        filteredRequests = allRequests.filter(r => isCompletedToday(r));
      }

      // Calculate stats
      const stats = {
        total: allRequests.length,
        assignedToMe: allRequests.filter(r => r.assigned_to === currentUser).length,
        unassigned: allRequests.filter(r => !r.assigned_to).length,
        inProgress: allRequests.filter(r => r.status === 'in_progress' || r.status === 'in-progress').length,
        overdue: allRequests.filter(r => isOverdue(r)).length,
        completedToday: allRequests.filter(r => isCompletedToday(r)).length
      };
      setStats(stats);

      // Sort
      filteredRequests.sort((a, b) => {
        let aVal, bVal;
        if (sortBy === 'created_at') {
          aVal = new Date(a.created_at || 0);
          bVal = new Date(b.created_at || 0);
        } else if (sortBy === 'status') {
          aVal = getStatusLabel(a.status);
          bVal = getStatusLabel(b.status);
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
      const total = filteredRequests.length;
      const totalPages = Math.ceil(total / pagination.limit);
      const startIndex = (pagination.page - 1) * pagination.limit;
      const endIndex = startIndex + pagination.limit;
      const paginatedRequests = filteredRequests.slice(startIndex, endIndex);

      setRequests(paginatedRequests);
      setPagination(prev => ({ ...prev, total, totalPages }));
      
    } catch (error) {
      console.error('Error loading requests:', error);
      if (error.status !== 401) { // Don't show error for auth failures
        handleApiError(error, 'load requests');
      }
    } finally {
      setLoading(false);
    }
  };

  // Load stats
  const loadStats = async () => {
    try {
      const response = await apiGet('/request-details/stats');
      if (response) {
        // Stats will be calculated from loaded requests
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  useEffect(() => {
    loadRequests();
  }, [pagination.page, activeFilter, statusFilter, requestTypeFilter, sortBy, sortOrder]);

  useEffect(() => {
    loadUsers();
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterMenuRef.current && !filterMenuRef.current.contains(event.target)) {
        setShowFilterMenu(false);
      }
      if (sortMenuRef.current && !sortMenuRef.current.contains(event.target)) {
        setShowSortMenu(false);
      }
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target)) {
        setShowExportMenu(false);
      }
      Object.keys(actionMenuRefs.current).forEach(id => {
        if (actionMenuRefs.current[id] && !actionMenuRefs.current[id].contains(event.target)) {
          setShowActionMenu(null);
        }
      });
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle search
  useEffect(() => {
    const timer = setTimeout(() => {
      setPagination(prev => ({ ...prev, page: 1 }));
      loadRequests();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleAssignRequest = async (admin) => {
    if (!selectedRequest) {
      handleApiError({ message: 'No request selected' }, 'assign request');
      return;
    }
    
    if (!admin || !admin.name) {
      handleApiError({ message: 'Please select a user to assign' }, 'assign request');
      return;
    }
    
    try {
      const assignedTo = admin.name === 'Me' ? (userInfo?.username || userInfo?.full_name || userInfo?.email) : admin.name;
      await apiPut(`/request-details/${selectedRequest.id}`, { 
        assigned_to: assignedTo,
        status: selectedRequest.status === 'pending' ? 'in_progress' : selectedRequest.status
      });
      
      setShowAssignDrawer(false);
      setSuccessMessage(`Request successfully assigned to ${admin.name}.`);
      setShowSuccess(true);
      setSelectedRequest(null);
      loadRequests();
    } catch (error) {
      handleApiError(error, 'assign request');
    }
  };

  // Export to CSV
  const exportToCSV = () => {
    const exportData = requests.map(r => ({
      'Request ID': r.id ? `REQ${r.id.toString().padStart(4, '0')}` : 'N/A',
      'Title': r.entity_name || r.case_suit_number || 'Untitled Request',
      'Category': getRequestTypeLabel(r.request_type),
      'Status': getStatusLabel(r.status),
      'Submitted Date': formatDate(r.created_at),
      'Assigned To': r.assigned_to || '-',
      'To be Completed': r.completed_at ? formatDate(r.completed_at) : 'N/A',
      'Requester': r.requester_name || 'N/A',
      'Requester Email': r.requester_email || 'N/A',
      'Priority': r.priority || 'MEDIUM',
      'Urgent': r.is_urgent ? 'Yes' : 'No',
      'Overdue': isOverdue(r) ? 'Yes' : 'No'
    }));

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
    link.setAttribute('download', `manage_requests_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setShowExportMenu(false);
  };

  // Export to Excel
  const exportToExcel = () => {
    const exportData = requests.map(r => ({
      'Request ID': r.id ? `REQ${r.id.toString().padStart(4, '0')}` : 'N/A',
      'Title': r.entity_name || r.case_suit_number || 'Untitled Request',
      'Category': getRequestTypeLabel(r.request_type),
      'Status': getStatusLabel(r.status),
      'Submitted Date': formatDate(r.created_at),
      'Assigned To': r.assigned_to || '-',
      'To be Completed': r.completed_at ? formatDate(r.completed_at) : 'N/A',
      'Requester': r.requester_name || 'N/A',
      'Requester Email': r.requester_email || 'N/A',
      'Priority': r.priority || 'MEDIUM',
      'Urgent': r.is_urgent ? 'Yes' : 'No',
      'Overdue': isOverdue(r) ? 'Yes' : 'No'
    }));

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(exportData);
    XLSX.utils.book_append_sheet(wb, ws, 'Manage Requests');
    XLSX.writeFile(wb, `manage_requests_export_${new Date().toISOString().split('T')[0]}.xlsx`);
    setShowExportMenu(false);
  };

  // Handle page change
  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  // Prepare users for assignment drawer
  const prepareUsersForAssignment = () => {
    const currentUser = userInfo?.username || userInfo?.full_name || userInfo?.email || 'Me';
    const currentUserObj = {
      name: 'Me',
      assignedRequests: requests.filter(r => r.assigned_to === currentUser).length,
      avatar: 'https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Iq8V0MifpP/wzlvmrem_expires_30_days.png',
      buttonText: 'Assign to me',
      username: currentUser
    };

    const otherUsers = users.slice(0, 10).map(user => ({
      name: `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email || 'User',
      assignedRequests: requests.filter(r => r.assigned_to === (user.username || user.email)).length,
      avatar: 'https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Iq8V0MifpP/hm3he4y3_expires_30_days.png',
      buttonText: 'Assign to',
      username: user.username || user.email
    }));

    return [currentUserObj, ...otherUsers];
  };

  if (showViewModal && selectedRequest) {
    return (
      <SearchRequestDetails 
        request={selectedRequest} 
        onBack={() => {
          setShowViewModal(false);
          setSelectedRequest(null);
          loadRequests();
        }} 
        userInfo={userInfo} 
        onNavigate={onNavigate} 
        onLogout={onLogout}
      />
    );
  }

  return (
    <div className="bg-[#F7F8FA] min-h-screen w-full">
      {/* Header */}
      <AdminHeader userInfo={userInfo} onNavigate={onNavigate} onLogout={onLogout} />

      {/* Main Content */}
      <div className="px-6 w-full">
        <div className="flex flex-col items-start w-full bg-white py-4 gap-6 rounded-lg">
          {/* Breadcrumb */}
          <span className="text-[#525866] text-xs whitespace-nowrap px-6">MANAGE REQUESTS</span>

          {/* Title */}
          <div className="flex flex-col items-start px-6 gap-2">
            <div className="flex items-center gap-1">
              <img
                src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Iq8V0MifpP/33dz2ikr_expires_30_days.png"
                className="w-4 h-4 object-fill flex-shrink-0"
              />
              <img
                src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Iq8V0MifpP/u6xg9kwu_expires_30_days.png"
                className="w-4 h-4 object-fill flex-shrink-0"
              />
              <span className="text-[#040E1B] text-xl font-bold whitespace-nowrap">Manage requests</span>
            </div>
            <span className="text-[#070810] text-sm whitespace-nowrap">All search requests are managed here</span>
          </div>

          {/* Stats Card */}
          <div className="flex items-center bg-white py-2 px-6 rounded-lg border border-solid border-[#D4E1EA]">
            <img
              src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Iq8V0MifpP/xhyd6s6y_expires_30_days.png"
              className="w-10 h-10 mr-3 rounded-lg object-fill flex-shrink-0"
            />
            <div className="flex flex-col items-start gap-1">
              <span className="text-[#868C98] text-xs whitespace-nowrap">Total amount of Requests</span>
              <span className="text-[#F59E0B] text-base whitespace-nowrap">{stats.total}</span>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex flex-col items-start w-full px-6">
            <div className="flex items-start p-1 gap-4">
              {filters.map((filter) => {
                let count = 0;
                if (filter.id === 'all') {
                  count = stats.total;
                } else if (filter.id === 'assigned-to-me') {
                  count = stats.assignedToMe;
                } else if (filter.id === 'unassigned') {
                  count = stats.unassigned;
                } else if (filter.id === 'in-progress') {
                  count = stats.inProgress;
                } else if (filter.id === 'overdue') {
                  count = stats.overdue;
                } else if (filter.id === 'completed-today') {
                  count = stats.completedToday;
                }

                return (
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
                      {filter.label} ({count})
                  </span>
                </button>
                );
              })}
            </div>

            {/* Table and Pagination */}
            <div className="flex flex-col items-start w-full gap-4">
              <div className="flex flex-col w-full bg-white py-4 gap-4 rounded-3xl">
                {/* Search, Filter and Export */}
                <div className="flex justify-between items-start w-full px-4">
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
                        onClick={() => setShowFilterMenu(!showFilterMenu)}
                        className="flex items-center py-[7px] px-[9px] gap-1.5 rounded border border-solid border-[#D4E1EA] cursor-pointer hover:bg-gray-50"
                      >
                        <Filter className="w-[11px] h-[11px] text-[#525866]" />
                      <span className="text-[#525866] text-xs whitespace-nowrap">Filter</span>
                      </button>
                      {showFilterMenu && (
                        <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-10 p-3">
                          <div className="space-y-3">
                            <div>
                              <label className="block text-xs text-gray-600 mb-1">Status</label>
                              <select
                                value={statusFilter}
                                onChange={(e) => {
                                  setStatusFilter(e.target.value);
                                  setPagination(prev => ({ ...prev, page: 1 }));
                                }}
                                className="w-full text-xs px-2 py-1 border border-gray-300 rounded"
                              >
                                <option value="">All Statuses</option>
                                <option value="pending">Pending</option>
                                <option value="in_progress">In Progress</option>
                                <option value="completed">Completed</option>
                                <option value="rejected">Rejected</option>
                                <option value="cancelled">Cancelled</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-xs text-gray-600 mb-1">Request Type</label>
                              <select
                                value={requestTypeFilter}
                                onChange={(e) => {
                                  setRequestTypeFilter(e.target.value);
                                  setPagination(prev => ({ ...prev, page: 1 }));
                                }}
                                className="w-full text-xs px-2 py-1 border border-gray-300 rounded"
                              >
                                <option value="">All Types</option>
                                <option value="profile_information">Person verification</option>
                                <option value="case_details">Case history research</option>
                                <option value="management_details">Management Details</option>
                                <option value="legal_documents">Legal Documents</option>
                                <option value="other">Other</option>
                              </select>
                            </div>
                            {(statusFilter || requestTypeFilter) && (
                              <button
                                onClick={() => {
                                  setStatusFilter('');
                                  setRequestTypeFilter('');
                                  setPagination(prev => ({ ...prev, page: 1 }));
                                }}
                                className="w-full text-xs text-blue-600 hover:text-blue-800"
                              >
                                Clear Filters
                              </button>
                            )}
                          </div>
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
                            <button
                              onClick={() => {
                                setSortBy('status');
                                setSortOrder('asc');
                                setShowSortMenu(false);
                                setPagination(prev => ({ ...prev, page: 1 }));
                              }}
                              className={`w-full text-left text-xs px-2 py-1 rounded hover:bg-gray-100 ${
                                sortBy === 'status' ? 'bg-blue-50 text-blue-600' : ''
                              }`}
                            >
                              Status (A-Z)
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

                {/* Request Table */}
                {loading ? (
                  <div className="flex justify-center items-center py-12">
                    <span className="text-gray-500">Loading...</span>
                  </div>
                ) : requests.length === 0 ? (
                  <div className="flex justify-center items-center py-12">
                    <span className="text-gray-500">No requests found</span>
                  </div>
                ) : (
                <div className="flex flex-col w-full gap-1 rounded-[14px] border border-solid border-[#E5E8EC] overflow-hidden">
                  {/* Table Header */}
                  <div className="flex items-start w-full bg-[#F4F6F9] py-4 px-4 gap-3">
                    <div className="flex flex-col items-start w-[12%] py-[7px]">
                      <span className="text-[#070810] text-sm font-bold whitespace-nowrap">Request ID</span>
                    </div>
                    <div className="flex flex-col items-start w-[16%] py-[7px]">
                      <span className="text-[#070810] text-sm font-bold whitespace-nowrap">Title</span>
                    </div>
                    <div className="flex flex-col items-start w-[14%] py-[7px]">
                      <span className="text-[#070810] text-sm font-bold whitespace-nowrap">Category</span>
                    </div>
                    <div className="flex flex-col items-start w-[12%] py-[7px]">
                      <span className="text-[#070810] text-sm font-bold whitespace-nowrap">Status</span>
                    </div>
                    <div className="flex flex-col items-start w-[13%] py-[7px]">
                      <span className="text-[#070810] text-sm font-bold whitespace-nowrap">Submitted Date</span>
                    </div>
                    <div className="flex flex-col items-start w-[13%] py-[7px]">
                      <span className="text-[#070810] text-sm font-bold whitespace-nowrap">Assigned To</span>
                    </div>
                    <div className="flex flex-col items-start w-[15%] py-[7px]">
                      <span className="text-[#070810] text-sm font-bold whitespace-nowrap">To be Completed</span>
                    </div>
                    <div className="w-[5%] flex-shrink-0 py-[7px] flex justify-center">
                      <span className="text-[#070810] text-sm font-bold whitespace-nowrap">Actions</span>
                    </div>
                  </div>

                  {/* Table Rows */}
                    {requests.map((item, idx) => {
                      const statusInfo = getStatusClass(item.status);
                      const requestId = item.id ? `REQ${item.id.toString().padStart(4, '0')}` : 'N/A';
                      const isOverdueRequest = isOverdue(item);
                      
                    return (
                      <div 
                        key={idx} 
                          className={`flex items-center w-full py-3 px-4 gap-3 hover:bg-blue-50 transition-colors ${
                            isOverdueRequest ? 'bg-red-50' : ''
                          }`}
                      >
                        <div className="flex flex-col items-start w-[12%] py-[7px]">
                            <span className="text-[#070810] text-sm whitespace-nowrap overflow-hidden text-ellipsis w-full">
                              {requestId}
                            </span>
                        </div>
                        <div className="flex flex-col items-start w-[16%] py-[7px]">
                            <span className="text-[#070810] text-sm whitespace-nowrap overflow-hidden text-ellipsis w-full">
                              {item.entity_name || item.case_suit_number || 'Untitled Request'}
                            </span>
                        </div>
                        <div className="flex flex-col items-start w-[14%] py-[7px]">
                            <span className="text-[#070810] text-sm whitespace-nowrap overflow-hidden text-ellipsis w-full">
                              {getRequestTypeLabel(item.request_type)}
                            </span>
                        </div>
                        <div className="flex flex-col items-start w-[12%] py-[7px]">
                            <span className={`text-sm font-bold whitespace-nowrap overflow-hidden text-ellipsis w-full px-2 py-1 rounded ${statusInfo.bg} ${statusInfo.text}`}>
                              {getStatusLabel(item.status)}
                            </span>
                        </div>
                        <div className="flex flex-col items-start w-[13%] py-[7px]">
                            <span className="text-[#070810] text-sm whitespace-nowrap overflow-hidden text-ellipsis w-full">
                              {formatDate(item.created_at)}
                            </span>
                        </div>
                        <div className="flex flex-col items-start w-[13%] py-[7px]">
                            <span className="text-[#070810] text-sm whitespace-nowrap overflow-hidden text-ellipsis w-full">
                              {item.assigned_to || '-'}
                            </span>
                        </div>
                        <div className="flex flex-col items-start w-[15%] py-[7px]">
                            <span className="text-[#070810] text-sm whitespace-nowrap overflow-hidden text-ellipsis w-full">
                              {item.completed_at ? formatDate(item.completed_at) : 'N/A'}
                            </span>
                          </div>
                          <div className="w-[5%] flex-shrink-0 flex items-center justify-center py-[7px] relative">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setShowActionMenu(showActionMenu === item.id ? null : item.id);
                                setSelectedRequest(item);
                              }}
                              className="p-1 hover:bg-gray-100 rounded"
                            >
                              <MoreVertical className="w-4 h-4 text-gray-600" />
                            </button>
                            {showActionMenu === item.id && (
                              <div
                                ref={el => actionMenuRefs.current[item.id] = el}
                                className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-20"
                              >
                                <button
                                  onClick={() => {
                                    setShowViewModal(true);
                                    setShowActionMenu(null);
                                  }}
                                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                >
                                  <Eye className="w-4 h-4" />
                                  View Details
                                </button>
                                <button
                                  onClick={() => {
                                    setShowAssignDrawer(true);
                                    setShowActionMenu(null);
                                  }}
                                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                >
                                  <UserCheck className="w-4 h-4" />
                                  Assign
                                </button>
                                {item.status !== 'completed' && (
                                  <button
                                    onClick={async () => {
                                      confirmAction(
                                        'Are you sure you want to mark this request as completed?',
                                        async () => {
                                          try {
                                            await apiPut(`/request-details/${item.id}`, { 
                                              status: 'completed',
                                              completed_at: new Date().toISOString()
                                            });
                                            showSuccess('Request marked as completed');
                                            setShowActionMenu(null);
                                            loadRequests();
                                          } catch (error) {
                                            handleApiError(error, 'mark request as completed');
                                          }
                                        }
                                      );
                                    }}
                                    className="w-full text-left px-4 py-2 text-sm text-green-600 hover:bg-green-50 flex items-center gap-2"
                                  >
                                    <CheckCircle className="w-4 h-4" />
                                    Mark Completed
                                  </button>
                                )}
                        </div>
                            )}
                        </div>
                      </div>
                    );
                  })}
                </div>
                )}
              </div>

              {/* Pagination */}
              {!loading && requests.length > 0 && (
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
                    src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Iq8V0MifpP/cx5c94sy_expires_30_days.png"
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
                    src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Iq8V0MifpP/iyrf8sen_expires_30_days.png"
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
        </div>
      </div>

      {/* Assignment Drawer */}
      {showAssignDrawer && selectedRequest && (
        <AssignRequestDrawer
          request={selectedRequest}
          onClose={() => {
            setShowAssignDrawer(false);
            setSelectedRequest(null);
          }}
          onAssign={handleAssignRequest}
          admins={prepareUsersForAssignment()}
        />
      )}

      {/* Success Notification */}
      {showSuccess && (
        <SuccessNotification
          message={successMessage}
          onClose={() => setShowSuccess(false)}
        />
      )}
    </div>
  );
};

export default ManageRequestsPage;
