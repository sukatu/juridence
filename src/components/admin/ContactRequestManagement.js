import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Plus, 
  Filter, 
  Eye, 
  Edit, 
  Trash2, 
  CheckCircle,
  Clock,
  AlertCircle,
  User,
  Mail,
  Phone,
  Building2,
  Calendar,
  MessageSquare
} from 'lucide-react';
import { apiGet, apiPost, apiPut, apiDelete } from '../../utils/api';

const ContactRequestManagement = () => {
  const [contactRequests, setContactRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    type: '',
    priority: ''
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    total_pages: 0
  });
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [statusUpdate, setStatusUpdate] = useState('');

  useEffect(() => {
    loadContactRequests();
    loadStats();
  }, [pagination.page, filters]);

  const loadContactRequests = async () => {
    try {
      setLoading(true);
      
      const filteredFilters = Object.fromEntries(
        Object.entries(filters).filter(([key, value]) => value !== '' && value !== null && value !== undefined)
      );
      
      const params = new URLSearchParams({
        page: pagination.page,
        limit: pagination.limit,
        ...filteredFilters
      });
      
      if (searchTerm) {
        params.append('search', searchTerm);
      }

      const response = await apiGet(`/subscription/contact-requests?${params}`);
      setContactRequests(response.contact_requests || []);
      setPagination(prev => ({
        ...prev,
        total: response.total || 0,
        total_pages: response.total_pages || 0
      }));
    } catch (error) {
      console.error('Error loading contact requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await apiGet('/subscription/contact-requests/stats/overview');
      setStats(response);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPagination(prev => ({ ...prev, page: 1 }));
    loadContactRequests();
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleViewDetails = (request) => {
    setSelectedRequest(request);
    setAdminNotes(request.admin_notes || '');
    setStatusUpdate(request.status);
    setShowDetailsModal(true);
  };

  const handleUpdateRequest = async () => {
    if (!selectedRequest) return;

    try {
      const updateData = {
        status: statusUpdate,
        admin_notes: adminNotes
      };

      await apiPut(`/subscription/contact-requests/${selectedRequest.id}`, updateData);
      setShowDetailsModal(false);
      loadContactRequests();
      loadStats();
    } catch (error) {
      console.error('Error updating contact request:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'contacted': return 'text-blue-600 bg-blue-100';
      case 'in_progress': return 'text-orange-600 bg-orange-100';
      case 'completed': return 'text-green-600 bg-green-100';
      case 'cancelled': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'contacted': return <Mail className="h-4 w-4" />;
      case 'in_progress': return <AlertCircle className="h-4 w-4" />;
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'cancelled': return <Trash2 className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Contact Requests</h1>
          <p className="text-slate-600 dark:text-slate-400">Manage incoming contact requests and inquiries</p>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow">
            <div className="flex items-center">
              <Building2 className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Requests</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.total_requests}</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Pending</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.pending_requests}</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow">
            <div className="flex items-center">
              <Mail className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Contacted</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.contacted_requests}</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow">
            <div className="flex items-center">
              <AlertCircle className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">In Progress</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.in_progress_requests}</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Completed</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.completed_requests}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search contact requests..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                />
              </div>
            </div>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Search
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="contacted">Contacted</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>

            <select
              value={filters.type}
              onChange={(e) => handleFilterChange('type', e.target.value)}
              className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
            >
              <option value="">All Types</option>
              <option value="contact_request">Contact Request</option>
              <option value="subscription_inquiry">Subscription Inquiry</option>
              <option value="demo_request">Demo Request</option>
              <option value="support_request">Support Request</option>
            </select>

            <select
              value={filters.priority}
              onChange={(e) => handleFilterChange('priority', e.target.value)}
              className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
            >
              <option value="">All Priorities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
        </form>
      </div>

      {/* Contact Requests List */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-slate-600 dark:text-slate-400">Loading contact requests...</p>
          </div>
        ) : (
          <div className="overflow-x-auto w-full">
            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700 w-full">
              <thead className="bg-slate-50 dark:bg-slate-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">
                    Organization
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
                {contactRequests.map((request) => (
                  <tr key={request.id} className="hover:bg-slate-50 dark:hover:bg-slate-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-slate-900 dark:text-white">
                          {request.full_name}
                        </div>
                        <div className="text-sm text-slate-500 dark:text-slate-400">
                          {request.email}
                        </div>
                        <div className="text-sm text-slate-500 dark:text-slate-400">
                          {request.phone}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-slate-900 dark:text-white">
                        {request.organization}
                      </div>
                      {request.position && (
                        <div className="text-sm text-slate-500 dark:text-slate-400">
                          {request.position}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                        {getStatusIcon(request.status)}
                        <span className="ml-1 capitalize">{request.status.replace('_', ' ')}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-slate-900 dark:text-white capitalize">
                        {request.type.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                      {new Date(request.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleViewDetails(request)}
                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Details Modal */}
      {showDetailsModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                  Contact Request Details
                </h2>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                >
                  ×
                </button>
              </div>

              <div className="space-y-6">
                {/* Contact Information */}
                <div>
                  <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-3">Contact Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Full Name</label>
                      <p className="text-sm text-slate-900 dark:text-white">{selectedRequest.full_name}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Email</label>
                      <p className="text-sm text-slate-900 dark:text-white">{selectedRequest.email}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Phone</label>
                      <p className="text-sm text-slate-900 dark:text-white">{selectedRequest.phone}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Organization</label>
                      <p className="text-sm text-slate-900 dark:text-white">{selectedRequest.organization}</p>
                    </div>
                    {selectedRequest.position && (
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Position</label>
                        <p className="text-sm text-slate-900 dark:text-white">{selectedRequest.position}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Message */}
                {selectedRequest.message && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Message</label>
                    <p className="text-sm text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-700 p-3 rounded-lg">
                      {selectedRequest.message}
                    </p>
                  </div>
                )}

                {/* Admin Management */}
                <div>
                  <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-3">Admin Management</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Status</label>
                      <select
                        value={statusUpdate}
                        onChange={(e) => setStatusUpdate(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                      >
                        <option value="pending">Pending</option>
                        <option value="contacted">Contacted</option>
                        <option value="in_progress">In Progress</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Admin Notes</label>
                      <textarea
                        value={adminNotes}
                        onChange={(e) => setAdminNotes(e.target.value)}
                        rows={4}
                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                        placeholder="Add notes about this contact request..."
                      />
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200 dark:border-slate-700">
                  <button
                    onClick={() => setShowDetailsModal(false)}
                    className="px-4 py-2 text-slate-700 dark:text-slate-300 bg-slate-200 dark:bg-slate-600 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-500 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpdateRequest}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Update Request
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContactRequestManagement;
