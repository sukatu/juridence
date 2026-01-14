import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Filter, 
  DollarSign,
  Calendar,
  User,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle
} from 'lucide-react';
import { apiGet, apiPost, apiPut, apiDelete } from '../../utils/api';

const PaymentManagement = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({});
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalPayments, setTotalPayments] = useState(0);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingPayment, setEditingPayment] = useState(null);

  useEffect(() => {
    loadPayments();
    loadStats();
  }, [currentPage, searchTerm, statusFilter]);

  const loadPayments = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage,
        limit: 10,
        ...(searchTerm && { search: searchTerm }),
        ...(statusFilter && { status: statusFilter })
      });
      
      // Try with API utility first, fallback to direct fetch if it fails
      let data;
      try {
        data = await apiGet(`/api/admin/payments?${params}`);
      } catch (apiError) {
        // Fallback to direct fetch without authentication
        const response = await fetch(`/api/admin/payments?${params}`);
        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }
        data = await response.json();
      }
      
      setPayments(data.payments || []);
      setTotalPages(data.total_pages || 1);
      setTotalPayments(data.total || 0);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      // Try with API utility first, fallback to direct fetch if it fails
      let data;
      try {
        data = await apiGet('/admin/payments/stats');
      } catch (apiError) {
        // Fallback to direct fetch without authentication
        const response = await fetch('/admin/payments/stats');
        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }
        data = await response.json();
      }
      setStats(data);
    } catch (err) {
      console.error('Error loading stats:', err);
    }
  };

  const handleCreatePayment = () => {
    setEditingPayment(null);
    setShowCreateModal(true);
  };

  const handleEditPayment = (payment) => {
    setEditingPayment(payment);
    setShowEditModal(true);
  };

  const handleSavePayment = async (paymentData) => {
    try {
      if (editingPayment) {
        await apiPut(`/api/admin/payments/${editingPayment.id}`, paymentData);
      } else {
        await apiPost('/api/admin/payments', paymentData);
      }
      
      setShowCreateModal(false);
      setShowEditModal(false);
      setEditingPayment(null);
      loadPayments();
      loadStats();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeletePayment = async (paymentId) => {
    if (!window.confirm('Are you sure you want to delete this payment?')) return;
    
    try {
      await apiDelete(`/api/admin/payments/${paymentId}`);
      loadPayments();
      loadStats();
    } catch (err) {
      setError(err.message);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'cancelled':
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading && payments.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Payment Management</h2>
          <p className="text-slate-600">Manage payment records and transactions</p>
        </div>
        <button
          onClick={handleCreatePayment}
          className="flex items-center space-x-2 bg-sky-600 text-white px-4 py-2 rounded-lg hover:bg-sky-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>Create Payment</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <CreditCard className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-slate-600">Total Payments</p>
              <p className="text-2xl font-bold text-slate-900">{stats.total_payments || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-slate-600">Total Revenue</p>
              <p className="text-2xl font-bold text-slate-900">
                {formatCurrency(stats.total_revenue || 0)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-slate-600">Pending</p>
              <p className="text-2xl font-bold text-slate-900">{stats.pending_payments || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-slate-600">Completed</p>
              <p className="text-2xl font-bold text-slate-900">{stats.completed_payments || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search payments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
              />
            </div>
          </div>
          <div className="md:w-48">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto w-full">
          <table className="min-w-full divide-y divide-slate-200 w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Payment ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Payment Method
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {payments.map((payment) => (
                <tr key={payment.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                    #{payment.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                    User #{payment.user_id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                    {formatCurrency(payment.amount, payment.currency)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(payment.status)}`}>
                      {getStatusIcon(payment.status)}
                      <span className="ml-1 capitalize">{payment.status}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                    {payment.payment_method || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                    {formatDate(payment.created_at)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditPayment(payment)}
                        className="text-sky-600 hover:text-sky-900"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeletePayment(payment.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-slate-200 sm:px-6">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="relative inline-flex items-center px-4 py-2 border border-slate-300 text-sm font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-slate-300 text-sm font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-50"
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-slate-700">
                Showing <span className="font-medium">{((currentPage - 1) * 10) + 1}</span> to{' '}
                <span className="font-medium">{Math.min(currentPage * 10, totalPayments)}</span> of{' '}
                <span className="font-medium">{totalPayments}</span> results
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-slate-300 bg-white text-sm font-medium text-slate-500 hover:bg-slate-50 disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-slate-300 bg-white text-sm font-medium text-slate-500 hover:bg-slate-50 disabled:opacity-50"
                >
                  Next
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Form Modal */}
      {(showCreateModal || showEditModal) && (
        <PaymentForm
          payment={editingPayment}
          onSave={handleSavePayment}
          onCancel={() => {
            setShowCreateModal(false);
            setShowEditModal(false);
            setEditingPayment(null);
          }}
        />
      )}
    </div>
  );
};

// Payment Form Component
const PaymentForm = ({ payment, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    subscription_id: '',
    user_id: '',
    amount: '',
    currency: 'USD',
    status: 'pending',
    stripe_payment_intent_id: '',
    stripe_charge_id: '',
    payment_method: '',
    last_four: '',
    billing_period_start: '',
    billing_period_end: '',
    paid_at: ''
  });

  useEffect(() => {
    if (payment) {
      setFormData({
        subscription_id: payment.subscription_id || '',
        user_id: payment.user_id || '',
        amount: payment.amount || '',
        currency: payment.currency || 'USD',
        status: payment.status || 'pending',
        stripe_payment_intent_id: payment.stripe_payment_intent_id || '',
        stripe_charge_id: payment.stripe_charge_id || '',
        payment_method: payment.payment_method || '',
        last_four: payment.last_four || '',
        billing_period_start: payment.billing_period_start ? payment.billing_period_start.split('T')[0] : '',
        billing_period_end: payment.billing_period_end ? payment.billing_period_end.split('T')[0] : '',
        paid_at: payment.paid_at ? payment.paid_at.split('T')[0] : ''
      });
    }
  }, [payment]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Convert date strings to ISO format
    const submitData = {
      ...formData,
      amount: parseFloat(formData.amount),
      subscription_id: parseInt(formData.subscription_id),
      user_id: parseInt(formData.user_id),
      billing_period_start: formData.billing_period_start ? new Date(formData.billing_period_start).toISOString() : null,
      billing_period_end: formData.billing_period_end ? new Date(formData.billing_period_end).toISOString() : null,
      paid_at: formData.paid_at ? new Date(formData.paid_at).toISOString() : null
    };
    
    onSave(submitData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">
          {payment ? 'Edit Payment' : 'Create Payment'}
        </h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Subscription ID *</label>
              <input
                type="number"
                name="subscription_id"
                value={formData.subscription_id}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">User ID *</label>
              <input
                type="number"
                name="user_id"
                value={formData.user_id}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Amount *</label>
              <input
                type="number"
                step="0.01"
                name="amount"
                value={formData.amount}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Currency</label>
              <select
                name="currency"
                value={formData.currency}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
              >
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
                <option value="GHS">GHS</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
              >
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
                <option value="failed">Failed</option>
                <option value="cancelled">Cancelled</option>
                <option value="refunded">Refunded</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Payment Method</label>
              <input
                type="text"
                name="payment_method"
                value={formData.payment_method}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Last Four Digits</label>
              <input
                type="text"
                name="last_four"
                value={formData.last_four}
                onChange={handleInputChange}
                maxLength="4"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Billing Period Start *</label>
              <input
                type="date"
                name="billing_period_start"
                value={formData.billing_period_start}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Billing Period End *</label>
              <input
                type="date"
                name="billing_period_end"
                value={formData.billing_period_end}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Paid At</label>
              <input
                type="date"
                name="paid_at"
                value={formData.paid_at}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
              />
            </div>
          </div>
          
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors"
            >
              {payment ? 'Update Payment' : 'Create Payment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PaymentManagement;