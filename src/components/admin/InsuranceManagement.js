import React, { useState, useEffect, useRef } from 'react';
import { 
  Shield, 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Trash2, 
  Calendar,
  MapPin,
  Phone,
  Mail,
  Globe,
  CheckCircle,
  XCircle,
  ChevronLeft,
  ChevronRight,
  X,
  BarChart3,
  TrendingUp,
  DollarSign,
  Users,
  Star,
  AlertTriangle
} from 'lucide-react';

const InsuranceManagement = () => {
  const [insurance, setInsurance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [insuranceTypeFilter, setInsuranceTypeFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalInsurance, setTotalInsurance] = useState(0);
  const [selectedInsurance, setSelectedInsurance] = useState(null);
  const [showInsuranceModal, setShowInsuranceModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [analytics, setAnalytics] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingInsurance, setEditingInsurance] = useState(null);
  const searchInputRef = useRef(null);

  // Initial load
  useEffect(() => {
    loadInsurance(false);
    loadAnalytics();
  }, []);

  // Debounced search and filter changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      // Only show search loading if we have a search term or filter
      const hasSearchOrFilter = searchTerm || insuranceTypeFilter;
      loadInsurance(hasSearchOrFilter);
      // Don't reload analytics on every search - it's expensive and causes re-renders
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, insuranceTypeFilter]);

  // Page changes (no debouncing needed)
  useEffect(() => {
    const hasSearchOrFilter = searchTerm || insuranceTypeFilter;
    loadInsurance(hasSearchOrFilter);
  }, [currentPage]);

  const loadInsurance = async (isSearch = false) => {
    try {
      if (isSearch) {
        setSearchLoading(true);
        // Don't set loading to true during search operations
      } else {
        setLoading(true);
      }
      
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10'
      });

      if (searchTerm) params.append('search', searchTerm);
      if (insuranceTypeFilter) params.append('insurance_type', insuranceTypeFilter);

      const response = await fetch(`/api/admin/insurance?${params}`);
      const data = await response.json();

      if (response.ok) {
        setInsurance(data.insurance || []);
        setTotalPages(data.total_pages || 1);
        setTotalInsurance(data.total || 0);
      } else {
        console.error('Error loading insurance:', data.detail);
      }
    } catch (error) {
      console.error('Error loading insurance:', error);
    } finally {
      if (isSearch) {
        setSearchLoading(false);
      } else {
        setLoading(false);
      }
    }
  };

  const loadAnalytics = async () => {
    try {
      const response = await fetch('/admin/insurance/stats');
      const data = await response.json();
      if (response.ok) {
        setAnalytics(data);
      }
    } catch (error) {
      console.error('Error loading analytics:', error);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleInsuranceTypeFilter = (e) => {
    setInsuranceTypeFilter(e.target.value);
    setCurrentPage(1);
  };

  const handleViewInsurance = (insuranceItem) => {
    setSelectedInsurance(insuranceItem);
    setShowInsuranceModal(true);
  };

  const handleDeleteInsurance = (insuranceItem) => {
    setSelectedInsurance(insuranceItem);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/admin/insurance/${selectedInsurance.id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setShowDeleteModal(false);
        setSelectedInsurance(null);
        loadInsurance();
      } else {
        const data = await response.json();
        console.error('Error deleting insurance:', data.detail);
      }
    } catch (error) {
      console.error('Error deleting insurance:', error);
    }
  };

  const handleCreateInsurance = () => {
    setEditingInsurance(null);
    setShowCreateModal(true);
  };

  const handleEditInsurance = (insuranceItem) => {
    setEditingInsurance(insuranceItem);
    setShowEditModal(true);
  };

  const handleSaveInsurance = async (insuranceData) => {
    try {
      const url = editingInsurance 
        ? `/api/admin/insurance/${editingInsurance.id}`
        : '/api/admin/insurance/';
      
      const method = editingInsurance ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(insuranceData)
      });

      if (response.ok) {
        setShowCreateModal(false);
        setShowEditModal(false);
        setEditingInsurance(null);
        loadInsurance();
      } else {
        const data = await response.json();
        console.error('Error saving insurance:', data.detail);
      }
    } catch (error) {
      console.error('Error saving insurance:', error);
    }
  };

  const getInsuranceTypeBadgeColor = (insuranceType) => {
    switch (insuranceType?.toLowerCase()) {
      case 'life': return 'bg-blue-100 text-blue-800';
      case 'general': return 'bg-green-100 text-green-800';
      case 'health': return 'bg-red-100 text-red-800';
      case 'motor': return 'bg-yellow-100 text-yellow-800';
      case 'property': return 'bg-purple-100 text-purple-800';
      case 'marine': return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount) => {
    if (!amount) return 'N/A';
    return new Intl.NumberFormat('en-GH', {
      style: 'currency',
      currency: 'GHS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const truncateText = (text, maxLength = 50) => {
    if (!text) return 'N/A';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Insurance Management</h2>
          <p className="text-slate-600">Manage insurance records and analytics</p>
        </div>
        <button
          onClick={handleCreateInsurance}
          className="inline-flex items-center px-4 py-2 bg-sky-600 text-white text-sm font-medium rounded-lg hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 transition-colors"
        >
          <Shield className="h-4 w-4 mr-2" />
          Create Insurance
        </button>
      </div>

      {/* Analytics Cards */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Shield className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600">Total Insurance</p>
                <p className="text-2xl font-bold text-slate-900">{analytics.total_insurance || 0}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600">Total Assets</p>
                <p className="text-2xl font-bold text-slate-900">{formatCurrency(analytics.total_assets)}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600">Total Branches</p>
                <p className="text-2xl font-bold text-slate-900">{analytics.total_branches || 0}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Star className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600">Avg Rating</p>
                <p className="text-2xl font-bold text-slate-900">{analytics.avg_rating?.toFixed(1) || '0.0'}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search insurance companies..."
              value={searchTerm}
              onChange={handleSearch}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
            />
          </div>
          
          <select
            value={insuranceTypeFilter}
            onChange={handleInsuranceTypeFilter}
            className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
          >
            <option value="">All Insurance Types</option>
            <option value="life">Life Insurance</option>
            <option value="general">General Insurance</option>
            <option value="health">Health Insurance</option>
            <option value="motor">Motor Insurance</option>
            <option value="property">Property Insurance</option>
            <option value="marine">Marine Insurance</option>
          </select>
          
          <div className="text-sm text-slate-600 flex items-center">
            <Shield className="h-4 w-4 mr-2" />
            {totalInsurance} total companies
          </div>
        </div>
      </div>

      {/* Insurance Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600 mx-auto"></div>
            <p className="mt-2 text-slate-600">Loading insurance companies...</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto w-full">
              <table className="min-w-full divide-y divide-slate-200 w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Company
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Location
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Assets
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Branches
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {insurance.map((insuranceItem) => (
                    <tr key={insuranceItem.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-slate-200 flex items-center justify-center">
                            <Shield className="h-5 w-5 text-slate-400" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-slate-900">
                              {insuranceItem.name}
                            </div>
                            <div className="text-sm text-slate-500">
                              {insuranceItem.short_name || 'N/A'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getInsuranceTypeBadgeColor(insuranceItem.insurance_type)}`}>
                          {insuranceItem.insurance_type || 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-slate-900">
                          {insuranceItem.email && (
                            <div className="flex items-center">
                              <Mail className="h-3 w-3 mr-1 text-slate-400" />
                              {truncateText(insuranceItem.email, 25)}
                            </div>
                          )}
                          {insuranceItem.phone && (
                            <div className="flex items-center mt-1">
                              <Phone className="h-3 w-3 mr-1 text-slate-400" />
                              {insuranceItem.phone}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-slate-900">
                          {insuranceItem.city && insuranceItem.region ? (
                            <div className="flex items-center">
                              <MapPin className="h-3 w-3 mr-1 text-slate-400" />
                              {insuranceItem.city}, {insuranceItem.region}
                            </div>
                          ) : (
                            <span className="text-slate-400">N/A</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                        {formatCurrency(insuranceItem.total_assets)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                        {insuranceItem.branches_count || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleViewInsurance(insuranceItem)}
                            className="text-slate-600 hover:text-slate-900 p-1"
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleEditInsurance(insuranceItem)}
                            className="text-green-600 hover:text-green-900 p-1"
                            title="Edit Insurance"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteInsurance(insuranceItem)}
                            className="text-red-600 hover:text-red-900 p-1"
                            title="Delete Insurance"
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
              <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-slate-200">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-4 py-2 border border-slate-300 text-sm font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
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
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-slate-300 bg-white text-sm font-medium text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-slate-300 bg-white text-sm font-medium text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronRight className="h-5 w-5" />
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Insurance Detail Modal */}
      {showInsuranceModal && selectedInsurance && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-slate-900">Insurance Company Details</h3>
              <button
                onClick={() => setShowInsuranceModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-medium text-slate-500 mb-2">Company Name</h4>
                  <p className="text-sm text-slate-900">{selectedInsurance.name}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-slate-500 mb-2">Short Name</h4>
                  <p className="text-sm text-slate-900">{selectedInsurance.short_name || 'N/A'}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-slate-500 mb-2">Insurance Type</h4>
                  <p className="text-sm text-slate-900">{selectedInsurance.insurance_type || 'N/A'}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-slate-500 mb-2">License Number</h4>
                  <p className="text-sm text-slate-900">{selectedInsurance.license_number || 'N/A'}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-slate-500 mb-2">Established Date</h4>
                  <p className="text-sm text-slate-900">{formatDate(selectedInsurance.established_date)}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-slate-500 mb-2">Status</h4>
                  <p className="text-sm text-slate-900">
                    {selectedInsurance.is_active ? (
                      <span className="text-green-600">Active</span>
                    ) : (
                      <span className="text-red-600">Inactive</span>
                    )}
                  </p>
                </div>
              </div>

              {/* Contact Information */}
              <div>
                <h4 className="text-sm font-medium text-slate-500 mb-3">Contact Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-slate-500">Email</p>
                    <p className="text-sm text-slate-900">{selectedInsurance.email || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Phone</p>
                    <p className="text-sm text-slate-900">{selectedInsurance.phone || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Website</p>
                    <p className="text-sm text-slate-900">
                      {selectedInsurance.website ? (
                        <a href={selectedInsurance.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
                          {selectedInsurance.website}
                        </a>
                      ) : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Customer Service</p>
                    <p className="text-sm text-slate-900">{selectedInsurance.customer_service_phone || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Financial Information */}
              <div className="bg-slate-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-slate-500 mb-3">Financial Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-xs text-slate-500">Total Assets</p>
                    <p className="text-sm font-medium text-slate-900">{formatCurrency(selectedInsurance.total_assets)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Net Worth</p>
                    <p className="text-sm font-medium text-slate-900">{formatCurrency(selectedInsurance.net_worth)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Premium Income</p>
                    <p className="text-sm font-medium text-slate-900">{formatCurrency(selectedInsurance.premium_income)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Claims Paid</p>
                    <p className="text-sm font-medium text-slate-900">{formatCurrency(selectedInsurance.claims_paid)}</p>
                  </div>
                </div>
              </div>

              {/* Services */}
              <div>
                <h4 className="text-sm font-medium text-slate-500 mb-2">Services</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="flex items-center space-x-2">
                    {selectedInsurance.has_mobile_app ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500" />
                    )}
                    <span className="text-sm text-slate-900">Mobile App</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {selectedInsurance.has_online_portal ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500" />
                    )}
                    <span className="text-sm text-slate-900">Online Portal</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {selectedInsurance.has_online_claims ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500" />
                    )}
                    <span className="text-sm text-slate-900">Online Claims</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {selectedInsurance.has_24_7_support ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500" />
                    )}
                    <span className="text-sm text-slate-900">24/7 Support</span>
                  </div>
                </div>
              </div>

              {/* Specialization */}
              {selectedInsurance.specializes_in && (
                <div>
                  <h4 className="text-sm font-medium text-slate-500 mb-2">Specialization</h4>
                  <p className="text-sm text-slate-900">{selectedInsurance.specializes_in}</p>
                </div>
              )}

              {/* Location */}
              <div>
                <h4 className="text-sm font-medium text-slate-500 mb-2">Location</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-slate-500">Address</p>
                    <p className="text-sm text-slate-900">{selectedInsurance.address || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">City, Region</p>
                    <p className="text-sm text-slate-900">
                      {selectedInsurance.city && selectedInsurance.region 
                        ? `${selectedInsurance.city}, ${selectedInsurance.region}` 
                        : 'N/A'
                      }
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedInsurance && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center space-x-3 mb-4">
              <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                <Trash2 className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Delete Insurance Company</h3>
                <p className="text-sm text-slate-600">This action cannot be undone.</p>
              </div>
            </div>
            
            <p className="text-slate-700 mb-6">
              Are you sure you want to delete <strong>{selectedInsurance.name}</strong>? 
              This will permanently remove the insurance company and all associated data.
            </p>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete Company
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create/Edit Insurance Modal */}
      {(showCreateModal || showEditModal) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900">
                {editingInsurance ? 'Edit Insurance Company' : 'Create New Insurance Company'}
              </h3>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setShowEditModal(false);
                  setEditingInsurance(null);
                }}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <InsuranceForm
              insuranceData={editingInsurance}
              onSave={handleSaveInsurance}
              onCancel={() => {
                setShowCreateModal(false);
                setShowEditModal(false);
                setEditingInsurance(null);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

// Insurance Form Component
const InsuranceForm = ({ insuranceData, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    short_name: '',
    logo_url: '',
    website: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    region: '',
    country: '',
    postal_code: '',
    license_number: '',
    registration_number: '',
    established_date: '',
    insurance_type: '',
    ownership_type: '',
    services: '',
    previous_names: '',
    coverage_areas: '',
    branches_count: '',
    agents_count: '',
    total_assets: '',
    net_worth: '',
    premium_income: '',
    claims_paid: '',
    rating: '',
    head_office_address: '',
    customer_service_phone: '',
    customer_service_email: '',
    claims_phone: '',
    claims_email: '',
    has_mobile_app: false,
    has_online_portal: false,
    has_online_claims: false,
    has_24_7_support: false,
    specializes_in: '',
    target_market: '',
    is_active: true,
    is_verified: false,
    verification_notes: '',
    description: '',
    notes: '',
    status: 'ACTIVE'
  });

  useEffect(() => {
    if (insuranceData) {
      setFormData({
        name: insuranceData.name || '',
        short_name: insuranceData.short_name || '',
        logo_url: insuranceData.logo_url || '',
        website: insuranceData.website || '',
        phone: insuranceData.phone || '',
        email: insuranceData.email || '',
        address: insuranceData.address || '',
        city: insuranceData.city || '',
        region: insuranceData.region || '',
        country: insuranceData.country || '',
        postal_code: insuranceData.postal_code || '',
        license_number: insuranceData.license_number || '',
        registration_number: insuranceData.registration_number || '',
        established_date: insuranceData.established_date ? insuranceData.established_date.split('T')[0] : '',
        insurance_type: insuranceData.insurance_type || '',
        ownership_type: insuranceData.ownership_type || '',
        services: insuranceData.services || '',
        previous_names: insuranceData.previous_names || '',
        coverage_areas: insuranceData.coverage_areas || '',
        branches_count: insuranceData.branches_count || '',
        agents_count: insuranceData.agents_count || '',
        total_assets: insuranceData.total_assets || '',
        net_worth: insuranceData.net_worth || '',
        premium_income: insuranceData.premium_income || '',
        claims_paid: insuranceData.claims_paid || '',
        rating: insuranceData.rating || '',
        head_office_address: insuranceData.head_office_address || '',
        customer_service_phone: insuranceData.customer_service_phone || '',
        customer_service_email: insuranceData.customer_service_email || '',
        claims_phone: insuranceData.claims_phone || '',
        claims_email: insuranceData.claims_email || '',
        has_mobile_app: insuranceData.has_mobile_app || false,
        has_online_portal: insuranceData.has_online_portal || false,
        has_online_claims: insuranceData.has_online_claims || false,
        has_24_7_support: insuranceData.has_24_7_support || false,
        specializes_in: insuranceData.specializes_in || '',
        target_market: insuranceData.target_market || '',
        is_active: insuranceData.is_active !== undefined ? insuranceData.is_active : true,
        is_verified: insuranceData.is_verified || false,
        verification_notes: insuranceData.verification_notes || '',
        description: insuranceData.description || '',
        notes: insuranceData.notes || '',
        status: insuranceData.status || 'ACTIVE'
      });
    }
  }, [insuranceData]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Basic Information */}
        <div className="space-y-4">
          <h4 className="text-md font-semibold text-slate-900 border-b pb-2">Basic Information</h4>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Company Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Short Name</label>
            <input
              type="text"
              name="short_name"
              value={formData.short_name}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Insurance Type</label>
            <select
              name="insurance_type"
              value={formData.insurance_type}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
            >
              <option value="">Select Type</option>
              <option value="Life Insurance">Life Insurance</option>
              <option value="General Insurance">General Insurance</option>
              <option value="Health Insurance">Health Insurance</option>
              <option value="Motor Insurance">Motor Insurance</option>
              <option value="Property Insurance">Property Insurance</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">License Number</label>
            <input
              type="text"
              name="license_number"
              value={formData.license_number}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Established Date</label>
            <input
              type="date"
              name="established_date"
              value={formData.established_date}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
            />
          </div>
        </div>

        {/* Contact Information */}
        <div className="space-y-4">
          <h4 className="text-md font-semibold text-slate-900 border-b pb-2">Contact Information</h4>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Website</label>
            <input
              type="url"
              name="website"
              value={formData.website}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Address</label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">City</label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Country</label>
              <input
                type="text"
                name="country"
                value={formData.country}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Services and Coverage */}
      <div className="space-y-4">
        <h4 className="text-md font-semibold text-slate-900 border-b pb-2">Services & Coverage</h4>
        
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Services (comma-separated)</label>
          <input
            type="text"
            name="services"
            value={formData.services}
            onChange={handleInputChange}
            placeholder="e.g., Motor Insurance, Property Insurance, Health Insurance"
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Coverage Areas (comma-separated)</label>
          <input
            type="text"
            name="coverage_areas"
            value={formData.coverage_areas}
            onChange={handleInputChange}
            placeholder="e.g., Greater Accra, Ashanti, Western"
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Specializes In (comma-separated)</label>
          <input
            type="text"
            name="specializes_in"
            value={formData.specializes_in}
            onChange={handleInputChange}
            placeholder="e.g., General Insurance, Motor Insurance, Property Insurance"
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Previous Names (comma-separated)</label>
          <input
            type="text"
            name="previous_names"
            value={formData.previous_names}
            onChange={handleInputChange}
            placeholder="e.g., Old Insurance Name, Previous Insurance Ltd"
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
          />
        </div>
      </div>

      {/* Financial Information */}
      <div className="space-y-4">
        <h4 className="text-md font-semibold text-slate-900 border-b pb-2">Financial Information</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Branches Count</label>
            <input
              type="number"
              name="branches_count"
              value={formData.branches_count}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Agents Count</label>
            <input
              type="number"
              name="agents_count"
              value={formData.agents_count}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Total Assets (GHS)</label>
            <input
              type="number"
              name="total_assets"
              value={formData.total_assets}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Net Worth (GHS)</label>
            <input
              type="number"
              name="net_worth"
              value={formData.net_worth}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
            />
          </div>
        </div>
      </div>

      {/* Status and Options */}
      <div className="space-y-4">
        <h4 className="text-md font-semibold text-slate-900 border-b pb-2">Status & Options</h4>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              name="is_active"
              checked={formData.is_active}
              onChange={handleInputChange}
              className="h-4 w-4 text-sky-600 focus:ring-sky-500 border-slate-300 rounded"
            />
            <span className="ml-2 text-sm text-slate-700">Active</span>
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              name="is_verified"
              checked={formData.is_verified}
              onChange={handleInputChange}
              className="h-4 w-4 text-sky-600 focus:ring-sky-500 border-slate-300 rounded"
            />
            <span className="ml-2 text-sm text-slate-700">Verified</span>
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              name="has_mobile_app"
              checked={formData.has_mobile_app}
              onChange={handleInputChange}
              className="h-4 w-4 text-sky-600 focus:ring-sky-500 border-slate-300 rounded"
            />
            <span className="ml-2 text-sm text-slate-700">Mobile App</span>
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              name="has_online_portal"
              checked={formData.has_online_portal}
              onChange={handleInputChange}
              className="h-4 w-4 text-sky-600 focus:ring-sky-500 border-slate-300 rounded"
            />
            <span className="ml-2 text-sm text-slate-700">Online Portal</span>
          </label>
        </div>
      </div>

      {/* Form Actions */}
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
          {insuranceData ? 'Update Insurance' : 'Create Insurance'}
        </button>
      </div>
    </form>
  );
};

export default InsuranceManagement;
