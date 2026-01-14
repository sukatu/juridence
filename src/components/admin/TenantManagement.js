import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Search, 
  Filter, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Users, 
  Database, 
  CreditCard, 
  Settings,
  Globe,
  Mail,
  Phone,
  MapPin,
  Calendar,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Download,
  Upload
} from 'lucide-react';

const TenantManagement = () => {
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [planFilter, setPlanFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    pending: 0,
    trial: 0,
    cancelled: 0
  });
  const [selectedTenant, setSelectedTenant] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('view'); // view, edit, create

  // Load tenants data
  useEffect(() => {
    loadTenants();
    loadStats();
  }, [currentPage, searchTerm, statusFilter, planFilter]);

  const loadTenants = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage,
        limit: 10,
        search: searchTerm,
        status: statusFilter !== 'all' ? statusFilter : '',
        plan: planFilter !== 'all' ? planFilter : ''
      });

      const response = await fetch(`/api/tenant/tenants?${params}`);
      const data = await response.json();
      
      setTenants(data.tenants || []);
      setTotalPages(data.total_pages || 1);
    } catch (error) {
      console.error('Error loading tenants:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await fetch('/tenant/tenants/stats');
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error loading tenant stats:', error);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleStatusFilter = (status) => {
    setStatusFilter(status);
    setCurrentPage(1);
  };

  const handlePlanFilter = (plan) => {
    setPlanFilter(plan);
    setCurrentPage(1);
  };

  const handleViewTenant = (tenant) => {
    setSelectedTenant(tenant);
    setModalType('view');
    setShowModal(true);
  };

  const handleEditTenant = (tenant) => {
    setSelectedTenant(tenant);
    setModalType('edit');
    setShowModal(true);
  };

  const handleCreateTenant = () => {
    setSelectedTenant(null);
    setModalType('create');
    setShowModal(true);
  };

  const handleDeleteTenant = async (tenantId) => {
    if (window.confirm('Are you sure you want to delete this organization?')) {
      try {
        const response = await fetch(`/api/tenant/tenants/${tenantId}`, {
          method: 'DELETE'
        });
        
        if (response.ok) {
          loadTenants();
          loadStats();
        } else {
          alert('Error deleting organization');
        }
      } catch (error) {
        console.error('Error deleting tenant:', error);
        alert('Error deleting organization');
      }
    }
  };

  const handleToggleStatus = async (tenantId, currentStatus) => {
    try {
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
      const response = await fetch(`/api/tenant/tenants/${tenantId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ is_active: newStatus === 'active' })
      });
      
      if (response.ok) {
        loadTenants();
        loadStats();
      } else {
        alert('Error updating organization status');
      }
    } catch (error) {
      console.error('Error updating tenant status:', error);
      alert('Error updating organization status');
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      inactive: { color: 'bg-red-100 text-red-800', icon: XCircle },
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      trial: { color: 'bg-blue-100 text-blue-800', icon: Clock },
      cancelled: { color: 'bg-gray-100 text-gray-800', icon: XCircle }
    };
    
    const config = statusConfig[status] || statusConfig.inactive;
    const Icon = config.icon;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        <Icon className="h-3 w-3 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getSubscriptionBadge = (subscriptionStatus) => {
    const statusConfig = {
      active: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      trial: { color: 'bg-blue-100 text-blue-800', icon: Clock },
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      cancelled: { color: 'bg-red-100 text-red-800', icon: XCircle },
      expired: { color: 'bg-gray-100 text-gray-800', icon: XCircle }
    };
    
    const config = statusConfig[subscriptionStatus] || statusConfig.pending;
    const Icon = config.icon;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        <Icon className="h-3 w-3 mr-1" />
        {subscriptionStatus.charAt(0).toUpperCase() + subscriptionStatus.slice(1)}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Organizations Management</h2>
          <p className="text-slate-600">Manage tenant organizations and their subscriptions</p>
        </div>
        <button
          onClick={handleCreateTenant}
          className="bg-sky-600 text-white px-4 py-2 rounded-lg hover:bg-sky-700 transition-colors flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Add Organization</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Building2 className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-slate-600">Total Organizations</p>
              <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-slate-600">Active</p>
              <p className="text-2xl font-bold text-slate-900">{stats.active}</p>
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
              <p className="text-2xl font-bold text-slate-900">{stats.pending}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Clock className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-slate-600">Trial</p>
              <p className="text-2xl font-bold text-slate-900">{stats.trial}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <XCircle className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-slate-600">Cancelled</p>
              <p className="text-2xl font-bold text-slate-900">{stats.cancelled}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search organizations..."
                value={searchTerm}
                onChange={handleSearch}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => handleStatusFilter(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="pending">Pending</option>
              <option value="trial">Trial</option>
              <option value="cancelled">Cancelled</option>
            </select>

            <select
              value={planFilter}
              onChange={(e) => handlePlanFilter(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
            >
              <option value="all">All Plans</option>
              <option value="trial">Trial</option>
              <option value="starter">Starter</option>
              <option value="professional">Professional</option>
              <option value="enterprise">Enterprise</option>
            </select>

            <button
              onClick={loadTenants}
              className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors flex items-center space-x-2"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tenants Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <RefreshCw className="h-8 w-8 animate-spin text-slate-400 mx-auto mb-4" />
            <p className="text-slate-600">Loading organizations...</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto w-full">
              <table className="min-w-full divide-y divide-slate-200 w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Organization
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Plan
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Subscription
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {tenants.map((tenant) => (
                    <tr key={tenant.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            {tenant.logo_url ? (
                              <img
                                className="h-10 w-10 rounded-lg object-cover"
                                src={tenant.logo_url}
                                alt={tenant.name}
                              />
                            ) : (
                              <div className="h-10 w-10 rounded-lg bg-slate-200 flex items-center justify-center">
                                <Building2 className="h-5 w-5 text-slate-500" />
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-slate-900">
                              {tenant.name}
                            </div>
                            <div className="text-sm text-slate-500">
                              {tenant.app_name}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-slate-900">
                          {tenant.contact_person_name || 'N/A'}
                        </div>
                        <div className="text-sm text-slate-500">
                          {tenant.contact_person_email || tenant.email}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-slate-900">
                          {tenant.subscription_plan?.name || 'No Plan'}
                        </div>
                        <div className="text-sm text-slate-500">
                          {tenant.subscription_plan?.price_monthly ? `${tenant.subscription_plan.currency === 'GHS' ? '₵' : '$'}${tenant.subscription_plan.price_monthly}/month` : 'Free'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(tenant.is_active ? 'active' : 'inactive')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getSubscriptionBadge(tenant.subscription_status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                        {new Date(tenant.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleViewTenant(tenant)}
                            className="text-slate-600 hover:text-slate-900 transition-colors"
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleEditTenant(tenant)}
                            className="text-sky-600 hover:text-sky-900 transition-colors"
                            title="Edit"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleToggleStatus(tenant.id, tenant.is_active ? 'active' : 'inactive')}
                            className={`transition-colors ${
                              tenant.is_active 
                                ? 'text-red-600 hover:text-red-900' 
                                : 'text-green-600 hover:text-green-900'
                            }`}
                            title={tenant.is_active ? 'Deactivate' : 'Activate'}
                          >
                            {tenant.is_active ? <XCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                          </button>
                          <button
                            onClick={() => handleDeleteTenant(tenant.id)}
                            className="text-red-600 hover:text-red-900 transition-colors"
                            title="Delete"
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
            {totalPages > 1 && (
              <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-slate-200 sm:px-6">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-4 py-2 border border-slate-300 text-sm font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-slate-300 text-sm font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-slate-700">
                      Showing page <span className="font-medium">{currentPage}</span> of{' '}
                      <span className="font-medium">{totalPages}</span>
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                      <button
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-slate-300 bg-white text-sm font-medium text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Previous
                      </button>
                      <button
                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-slate-300 bg-white text-sm font-medium text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <TenantModal
          tenant={selectedTenant}
          type={modalType}
          onClose={() => setShowModal(false)}
          onSave={() => {
            setShowModal(false);
            loadTenants();
            loadStats();
          }}
        />
      )}
    </div>
  );
};

// Tenant Modal Component
const TenantModal = ({ tenant, type, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    website: '',
    email: '',
    phone: '',
    address_line_1: '',
    city: '',
    state: '',
    country: '',
    postal_code: '',
    app_name: '',
    app_tagline: '',
    primary_color: '#2563EB',
    secondary_color: '#1D4ED8',
    accent_color: '#F59E0B',
    font_family: 'Inter',
    is_active: true,
    is_approved: false,
    is_verified: false
  });

  useEffect(() => {
    if (tenant && type !== 'create') {
      setFormData({
        name: tenant.name || '',
        slug: tenant.slug || '',
        description: tenant.description || '',
        website: tenant.website || '',
        email: tenant.email || '',
        phone: tenant.phone || '',
        address_line_1: tenant.address_line_1 || '',
        city: tenant.city || '',
        state: tenant.state || '',
        country: tenant.country || '',
        postal_code: tenant.postal_code || '',
        app_name: tenant.app_name || '',
        app_tagline: tenant.app_tagline || '',
        primary_color: tenant.primary_color || '#2563EB',
        secondary_color: tenant.secondary_color || '#1D4ED8',
        accent_color: tenant.accent_color || '#F59E0B',
        font_family: tenant.font_family || 'Inter',
        is_active: tenant.is_active || false,
        is_approved: tenant.is_approved || false,
        is_verified: tenant.is_verified || false
      });
    }
  }, [tenant, type]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const url = type === 'create' 
        ? '/api/tenant/tenants'
        : `/api/tenant/tenants/${tenant.id}`;
      
      const method = type === 'create' ? 'POST' : 'PUT';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      
      if (response.ok) {
        onSave();
      } else {
        alert('Error saving organization');
      }
    } catch (error) {
      console.error('Error saving tenant:', error);
      alert('Error saving organization');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900">
              {type === 'create' ? 'Create Organization' : 
               type === 'edit' ? 'Edit Organization' : 'Organization Details'}
            </h3>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 transition-colors"
            >
              <XCircle className="h-6 w-6" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h4 className="text-md font-medium text-slate-900">Basic Information</h4>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Organization Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Slug *
                </label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({...formData, slug: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Website
                </label>
                <input
                  type="url"
                  value={formData.website}
                  onChange={(e) => setFormData({...formData, website: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-4">
              <h4 className="text-md font-medium text-slate-900">Contact Information</h4>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Phone
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Address
                </label>
                <input
                  type="text"
                  value={formData.address_line_1}
                  onChange={(e) => setFormData({...formData, address_line_1: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({...formData, city: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    State
                  </label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) => setFormData({...formData, state: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Country
                  </label>
                  <input
                    type="text"
                    value={formData.country}
                    onChange={(e) => setFormData({...formData, country: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Postal Code
                  </label>
                  <input
                    type="text"
                    value={formData.postal_code}
                    onChange={(e) => setFormData({...formData, postal_code: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* App Branding */}
          <div className="space-y-4">
            <h4 className="text-md font-medium text-slate-900">App Branding</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  App Name
                </label>
                <input
                  type="text"
                  value={formData.app_name}
                  onChange={(e) => setFormData({...formData, app_name: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  App Tagline
                </label>
                <input
                  type="text"
                  value={formData.app_tagline}
                  onChange={(e) => setFormData({...formData, app_tagline: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Primary Color
                </label>
                <input
                  type="color"
                  value={formData.primary_color}
                  onChange={(e) => setFormData({...formData, primary_color: e.target.value})}
                  className="w-full h-10 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Secondary Color
                </label>
                <input
                  type="color"
                  value={formData.secondary_color}
                  onChange={(e) => setFormData({...formData, secondary_color: e.target.value})}
                  className="w-full h-10 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Accent Color
                </label>
                <input
                  type="color"
                  value={formData.accent_color}
                  onChange={(e) => setFormData({...formData, accent_color: e.target.value})}
                  className="w-full h-10 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Status */}
          {type !== 'view' && (
            <div className="space-y-4">
              <h4 className="text-md font-medium text-slate-900">Status</h4>
              
              <div className="flex space-x-6">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                    className="h-4 w-4 text-sky-600 focus:ring-sky-500 border-slate-300 rounded"
                  />
                  <span className="ml-2 text-sm text-slate-700">Active</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.is_approved}
                    onChange={(e) => setFormData({...formData, is_approved: e.target.checked})}
                    className="h-4 w-4 text-sky-600 focus:ring-sky-500 border-slate-300 rounded"
                  />
                  <span className="ml-2 text-sm text-slate-700">Approved</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.is_verified}
                    onChange={(e) => setFormData({...formData, is_verified: e.target.checked})}
                    className="h-4 w-4 text-sky-600 focus:ring-sky-500 border-slate-300 rounded"
                  />
                  <span className="ml-2 text-sm text-slate-700">Verified</span>
                </label>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            {type !== 'view' && (
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-sky-600 border border-transparent rounded-lg hover:bg-sky-700 transition-colors"
              >
                {type === 'create' ? 'Create Organization' : 'Save Changes'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default TenantManagement;
