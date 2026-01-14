import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Eye, 
  User, 
  Building2, 
  CreditCard,
  Calendar,
  MessageSquare,
  RefreshCw
} from 'lucide-react';
import { apiGet, apiPut } from '../../utils/api';

const SubscriptionRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [filters, setFilters] = useState({
    status: 'all',
    search: ''
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });

  useEffect(() => {
    fetchRequests();
  }, [pagination.page, filters]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(filters.status !== 'all' && { status: filters.status }),
        ...(filters.search && { search: filters.search })
      });

      // Try with API utility first, fallback to direct fetch if it fails
      let data;
      try {
        data = await apiGet(`/api/tenant/subscription-requests?${params}`);
      } catch (apiError) {
        // Fallback to direct fetch without authentication
        const response = await fetch(`/api/tenant/subscription-requests?${params}`);
        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }
        data = await response.json();
      }
      
      setRequests(data.requests || []);
      setPagination(prev => ({
        ...prev,
        total: data.total,
        totalPages: data.total_pages
      }));
    } catch (error) {
      console.error('Error fetching subscription requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (requestId) => {
    try {
      setActionLoading(true);
      await apiPut(`/api/tenant/subscription-requests/${requestId}/approve`, {
        admin_notes: adminNotes
      });

      await fetchRequests();
      setShowModal(false);
      setAdminNotes('');
      setSelectedRequest(null);
      // Show success notification
      showNotification('Subscription request approved successfully', 'success');
    } catch (error) {
      console.error('Error approving request:', error);
      showNotification('Failed to approve request', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (requestId) => {
    if (!adminNotes.trim()) {
      showNotification('Please provide a reason for rejection', 'error');
      return;
    }

    try {
      setActionLoading(true);
      await apiPut(`/api/tenant/subscription-requests/${requestId}/reject`, {
        admin_notes: adminNotes
      });

      await fetchRequests();
      setShowModal(false);
      setAdminNotes('');
      setSelectedRequest(null);
      showNotification('Subscription request rejected', 'success');
    } catch (error) {
      console.error('Error rejecting request:', error);
      showNotification('Failed to reject request', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const showNotification = (message, type) => {
    // This would integrate with your notification system
    // Notification system integration would go here
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-gray-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300';
      case 'approved':
        return 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300';
      case 'rejected':
        return 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300';
      case 'cancelled':
        return 'bg-gray-100 dark:bg-gray-900/20 text-gray-800 dark:text-gray-300';
      default:
        return 'bg-gray-100 dark:bg-gray-900/20 text-gray-800 dark:text-gray-300';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const openModal = (request) => {
    setSelectedRequest(request);
    setAdminNotes(request.admin_notes || '');
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedRequest(null);
    setAdminNotes('');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            Subscription Requests
          </h2>
          <p className="text-slate-600 dark:text-slate-300">
            Review and manage subscription requests from organizations
          </p>
        </div>
        <button
          onClick={fetchRequests}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search by organization name, requester, or email..."
            value={filters.search}
            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
            className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
          />
        </div>
        <select
          value={filters.status}
          onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
          className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow border border-slate-200 dark:border-slate-700">
          <div className="flex items-center">
            <Clock className="h-8 w-8 text-yellow-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Pending</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                {requests.filter(r => r.status === 'pending').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow border border-slate-200 dark:border-slate-700">
          <div className="flex items-center">
            <CheckCircle className="h-8 w-8 text-green-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Approved</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                {requests.filter(r => r.status === 'approved').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow border border-slate-200 dark:border-slate-700">
          <div className="flex items-center">
            <XCircle className="h-8 w-8 text-red-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Rejected</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                {requests.filter(r => r.status === 'rejected').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow border border-slate-200 dark:border-slate-700">
          <div className="flex items-center">
            <Building2 className="h-8 w-8 text-blue-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Total</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                {requests.length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Requests Table */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto w-full">
          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700 w-full">
            <thead className="bg-slate-50 dark:bg-slate-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">
                  Organization
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">
                  Requester
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">
                  Plan
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">
                  Billing
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">
                  Requested
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
              {requests.map((request) => (
                <tr key={request.id} className="hover:bg-slate-50 dark:hover:bg-slate-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Building2 className="h-8 w-8 text-slate-400" />
                      <div className="ml-3">
                        <div className="text-sm font-medium text-slate-900 dark:text-white">
                          {request.tenant_name}
                        </div>
                        <div className="text-sm text-slate-500 dark:text-slate-400">
                          ID: {request.tenant_id}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <User className="h-8 w-8 text-slate-400" />
                      <div className="ml-3">
                        <div className="text-sm font-medium text-slate-900 dark:text-white">
                          {request.requester_name}
                        </div>
                        <div className="text-sm text-slate-500 dark:text-slate-400">
                          {request.requester_email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-slate-900 dark:text-white">
                      {request.plan_name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <CreditCard className="h-4 w-4 text-slate-400 mr-2" />
                      <span className="text-sm text-slate-900 dark:text-white capitalize">
                        {request.billing_cycle}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                      {getStatusIcon(request.status)}
                      <span className="ml-1 capitalize">{request.status}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-slate-500 dark:text-slate-400">
                      <Calendar className="h-4 w-4 mr-2" />
                      {formatDate(request.created_at)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => openModal(request)}
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      {request.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleApprove(request.id)}
                            disabled={actionLoading}
                            className="text-green-600 dark:text-green-400 hover:text-green-900 dark:hover:text-green-300 disabled:opacity-50"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => openModal(request)}
                            className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
                          >
                            <XCircle className="h-4 w-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="bg-white dark:bg-slate-800 px-4 py-3 flex items-center justify-between border-t border-slate-200 dark:border-slate-700 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                disabled={pagination.page === 1}
                className="relative inline-flex items-center px-4 py-2 border border-slate-300 dark:border-slate-600 text-sm font-medium rounded-md text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setPagination(prev => ({ ...prev, page: Math.min(prev.totalPages, prev.page + 1) }))}
                disabled={pagination.page === pagination.totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-slate-300 dark:border-slate-600 text-sm font-medium rounded-md text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-slate-700 dark:text-slate-300">
                  Showing{' '}
                  <span className="font-medium">
                    {((pagination.page - 1) * pagination.limit) + 1}
                  </span>{' '}
                  to{' '}
                  <span className="font-medium">
                    {Math.min(pagination.page * pagination.limit, pagination.total)}
                  </span>{' '}
                  of{' '}
                  <span className="font-medium">{pagination.total}</span>{' '}
                  results
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setPagination(prev => ({ ...prev, page }))}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        page === pagination.page
                          ? 'z-10 bg-blue-50 dark:bg-blue-900/20 border-blue-500 text-blue-600 dark:text-blue-400'
                          : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Action Modal */}
      {showModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                {selectedRequest.status === 'pending' ? 'Review Request' : 'Request Details'}
              </h3>
              <button
                onClick={closeModal}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Organization
                </label>
                <p className="text-sm text-slate-900 dark:text-white">{selectedRequest.tenant_name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Requester
                </label>
                <p className="text-sm text-slate-900 dark:text-white">{selectedRequest.requester_name}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">{selectedRequest.requester_email}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Plan & Billing
                </label>
                <p className="text-sm text-slate-900 dark:text-white">
                  {selectedRequest.plan_name} ({selectedRequest.billing_cycle})
                </p>
              </div>
              {selectedRequest.notes && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Requester Notes
                  </label>
                  <p className="text-sm text-slate-900 dark:text-white">{selectedRequest.notes}</p>
                </div>
              )}
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Admin Notes
              </label>
              <textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                placeholder="Add notes about this request..."
              />
            </div>

            {selectedRequest.status === 'pending' && (
              <div className="flex justify-end space-x-3">
                <button
                  onClick={closeModal}
                  className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleReject(selectedRequest.id)}
                  disabled={actionLoading}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg disabled:opacity-50"
                >
                  {actionLoading ? 'Rejecting...' : 'Reject'}
                </button>
                <button
                  onClick={() => handleApprove(selectedRequest.id)}
                  disabled={actionLoading}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg disabled:opacity-50"
                >
                  {actionLoading ? 'Approving...' : 'Approve'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SubscriptionRequests;
