import React, { useState, useEffect, useRef } from 'react';
import { 
  Database, 
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
  Building
} from 'lucide-react';

const CompanyManagement = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [companyTypeFilter, setCompanyTypeFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCompanies, setTotalCompanies] = useState(0);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [showCompanyModal, setShowCompanyModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [analytics, setAnalytics] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingCompany, setEditingCompany] = useState(null);
  const searchInputRef = useRef(null);

  // Initial load
  useEffect(() => {
    loadCompanies(false);
    loadAnalytics();
  }, []);

  // Debounced search and filter changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      // Only show search loading if we have a search term or filter
      const hasSearchOrFilter = searchTerm || companyTypeFilter;
      loadCompanies(hasSearchOrFilter);
      // Don't reload analytics on every search - it's expensive and causes re-renders
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, companyTypeFilter]);

  // Page changes (no debouncing needed)
  useEffect(() => {
    const hasSearchOrFilter = searchTerm || companyTypeFilter;
    loadCompanies(hasSearchOrFilter);
  }, [currentPage]);

  const loadCompanies = async (isSearch = false) => {
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
      if (companyTypeFilter) params.append('company_type', companyTypeFilter);

      const response = await fetch(`/api/admin/companies?${params}`);
      const data = await response.json();

      if (response.ok) {
        setCompanies(data.companies || []);
        setTotalPages(data.total_pages || 1);
        setTotalCompanies(data.total || 0);
      } else {
        console.error('Error loading companies:', data.detail);
      }
    } catch (error) {
      console.error('Error loading companies:', error);
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
      const response = await fetch('/api/admin/companies/stats');
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

  const handleCompanyTypeFilter = (e) => {
    setCompanyTypeFilter(e.target.value);
    setCurrentPage(1);
  };

  const handleViewCompany = (company) => {
    setSelectedCompany(company);
    setShowCompanyModal(true);
  };

  const handleDeleteCompany = (company) => {
    setSelectedCompany(company);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/admin/companies/${selectedCompany.id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setShowDeleteModal(false);
        setSelectedCompany(null);
        loadCompanies();
      } else {
        const data = await response.json();
        console.error('Error deleting company:', data.detail);
      }
    } catch (error) {
      console.error('Error deleting company:', error);
    }
  };

  const handleCreateCompany = () => {
    setEditingCompany(null);
    setShowCreateModal(true);
  };

  const handleEditCompany = (company) => {
    setEditingCompany(company);
    setShowEditModal(true);
  };

  const handleSaveCompany = async (companyData) => {
    try {
      const url = editingCompany 
        ? `/api/admin/companies/${editingCompany.id}`
        : '/api/admin/companies/';
      
      const method = editingCompany ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(companyData)
      });

      if (response.ok) {
        setShowCreateModal(false);
        setShowEditModal(false);
        setEditingCompany(null);
        loadCompanies();
      } else {
        const data = await response.json();
        console.error('Error saving company:', data.detail);
      }
    } catch (error) {
      console.error('Error saving company:', error);
    }
  };

  const getCompanyTypeBadgeColor = (companyType) => {
    switch (companyType?.toLowerCase()) {
      case 'limited': return 'bg-blue-100 text-blue-800';
      case 'public': return 'bg-green-100 text-green-800';
      case 'private': return 'bg-purple-100 text-purple-800';
      case 'partnership': return 'bg-yellow-100 text-yellow-800';
      case 'sole proprietorship': return 'bg-orange-100 text-orange-800';
      case 'ngo': return 'bg-red-100 text-red-800';
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
          <h2 className="text-2xl font-bold text-slate-900">Company Management</h2>
          <p className="text-slate-600">Manage company records and analytics</p>
        </div>
        <button
          onClick={handleCreateCompany}
          className="inline-flex items-center px-4 py-2 bg-sky-600 text-white text-sm font-medium rounded-lg hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 transition-colors"
        >
          <Building className="h-4 w-4 mr-2" />
          Create Company
        </button>
      </div>

      {/* Analytics Cards */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Database className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600">Total Companies</p>
                <p className="text-2xl font-bold text-slate-900">{analytics.total_companies || 0}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600">Total Revenue</p>
                <p className="text-2xl font-bold text-slate-900">{formatCurrency(analytics.total_revenue)}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600">Total Employees</p>
                <p className="text-2xl font-bold text-slate-900">{analytics.total_employees || 0}</p>
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
              placeholder="Search companies..."
              value={searchTerm}
              onChange={handleSearch}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
            />
          </div>
          
          <select
            value={companyTypeFilter}
            onChange={handleCompanyTypeFilter}
            className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
          >
            <option value="">All Company Types</option>
            <option value="limited">Limited Company</option>
            <option value="public">Public Company</option>
            <option value="private">Private Company</option>
            <option value="partnership">Partnership</option>
            <option value="sole proprietorship">Sole Proprietorship</option>
            <option value="ngo">NGO</option>
          </select>
          
          <div className="text-sm text-slate-600 flex items-center">
            <Database className="h-4 w-4 mr-2" />
            {totalCompanies} total companies
          </div>
        </div>
      </div>

      {/* Companies Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600 mx-auto"></div>
            <p className="mt-2 text-slate-600">Loading companies...</p>
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
                      Industry
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Location
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Revenue
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {companies.map((company) => (
                    <tr key={company.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-slate-200 flex items-center justify-center">
                            <Building className="h-5 w-5 text-slate-400" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-slate-900">
                              {company.name}
                            </div>
                            <div className="text-sm text-slate-500">
                              {company.short_name || 'N/A'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getCompanyTypeBadgeColor(company.company_type)}`}>
                          {company.company_type || 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                        {company.industry || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-slate-900">
                          {company.email && (
                            <div className="flex items-center">
                              <Mail className="h-3 w-3 mr-1 text-slate-400" />
                              {truncateText(company.email, 25)}
                            </div>
                          )}
                          {company.phone && (
                            <div className="flex items-center mt-1">
                              <Phone className="h-3 w-3 mr-1 text-slate-400" />
                              {company.phone}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-slate-900">
                          {company.city && company.region ? (
                            <div className="flex items-center">
                              <MapPin className="h-3 w-3 mr-1 text-slate-400" />
                              {company.city}, {company.region}
                            </div>
                          ) : (
                            <span className="text-slate-400">N/A</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                        {formatCurrency(company.annual_revenue)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleViewCompany(company)}
                            className="text-slate-600 hover:text-slate-900 p-1"
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleEditCompany(company)}
                            className="text-green-600 hover:text-green-900 p-1"
                            title="Edit Company"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteCompany(company)}
                            className="text-red-600 hover:text-red-900 p-1"
                            title="Delete Company"
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

      {/* Company Detail Modal */}
      {showCompanyModal && selectedCompany && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-slate-900">Company Details</h3>
              <button
                onClick={() => setShowCompanyModal(false)}
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
                  <p className="text-sm text-slate-900">{selectedCompany.name}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-slate-500 mb-2">Short Name</h4>
                  <p className="text-sm text-slate-900">{selectedCompany.short_name || 'N/A'}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-slate-500 mb-2">Company Type</h4>
                  <p className="text-sm text-slate-900">{selectedCompany.company_type || 'N/A'}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-slate-500 mb-2">Industry</h4>
                  <p className="text-sm text-slate-900">{selectedCompany.industry || 'N/A'}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-slate-500 mb-2">Registration Number</h4>
                  <p className="text-sm text-slate-900">{selectedCompany.registration_number || 'N/A'}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-slate-500 mb-2">TIN Number</h4>
                  <p className="text-sm text-slate-900">{selectedCompany.tax_identification_number || 'N/A'}</p>
                </div>
              </div>

              {/* Contact Information */}
              <div>
                <h4 className="text-sm font-medium text-slate-500 mb-3">Contact Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-slate-500">Email</p>
                    <p className="text-sm text-slate-900">{selectedCompany.email || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Phone</p>
                    <p className="text-sm text-slate-900">{selectedCompany.phone || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Website</p>
                    <p className="text-sm text-slate-900">
                      {selectedCompany.website ? (
                        <a href={selectedCompany.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
                          {selectedCompany.website}
                        </a>
                      ) : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Customer Service</p>
                    <p className="text-sm text-slate-900">{selectedCompany.customer_service_phone || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Financial Information */}
              <div className="bg-slate-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-slate-500 mb-3">Financial Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs text-slate-500">Annual Revenue</p>
                    <p className="text-sm font-medium text-slate-900">{formatCurrency(selectedCompany.annual_revenue)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Net Worth</p>
                    <p className="text-sm font-medium text-slate-900">{formatCurrency(selectedCompany.net_worth)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Employee Count</p>
                    <p className="text-sm font-medium text-slate-900">{selectedCompany.employee_count || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Business Information */}
              <div>
                <h4 className="text-sm font-medium text-slate-500 mb-2">Business Activities</h4>
                <p className="text-sm text-slate-900">{selectedCompany.business_activities || 'N/A'}</p>
              </div>

              {/* Key Personnel */}
              {selectedCompany.directors && (
                <div>
                  <h4 className="text-sm font-medium text-slate-500 mb-2">Directors</h4>
                  <p className="text-sm text-slate-900">{selectedCompany.directors}</p>
                </div>
              )}

              {/* Location */}
              <div>
                <h4 className="text-sm font-medium text-slate-500 mb-2">Location</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-slate-500">Address</p>
                    <p className="text-sm text-slate-900">{selectedCompany.address || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">City, Region</p>
                    <p className="text-sm text-slate-900">
                      {selectedCompany.city && selectedCompany.region 
                        ? `${selectedCompany.city}, ${selectedCompany.region}` 
                        : 'N/A'
                      }
                    </p>
                  </div>
                </div>
              </div>

              {/* Incorporation Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-medium text-slate-500 mb-2">Date of Incorporation</h4>
                  <p className="text-sm text-slate-900">{formatDate(selectedCompany.date_of_incorporation)}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-slate-500 mb-2">Date of Commencement</h4>
                  <p className="text-sm text-slate-900">{formatDate(selectedCompany.date_of_commencement)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedCompany && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center space-x-3 mb-4">
              <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                <Trash2 className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Delete Company</h3>
                <p className="text-sm text-slate-600">This action cannot be undone.</p>
              </div>
            </div>
            
            <p className="text-slate-700 mb-6">
              Are you sure you want to delete <strong>{selectedCompany.name}</strong>? 
              This will permanently remove the company and all associated data.
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

      {/* Create/Edit Company Modal */}
      {(showCreateModal || showEditModal) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900">
                {editingCompany ? 'Edit Company' : 'Create New Company'}
              </h3>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setShowEditModal(false);
                  setEditingCompany(null);
                }}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <CompanyForm
              companyData={editingCompany}
              onSave={handleSaveCompany}
              onCancel={() => {
                setShowCreateModal(false);
                setShowEditModal(false);
                setEditingCompany(null);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

// Company Form Component
const CompanyForm = ({ companyData, onSave, onCancel }) => {
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
    type_of_company: '',
    district: '',
    date_of_incorporation: '',
    date_of_commencement: '',
    nature_of_business: '',
    registration_number: '',
    tax_identification_number: '',
    phone_number: '',
    directors: '',
    secretary: '',
    auditor: '',
    authorized_shares: '',
    stated_capital: '',
    shareholders: '',
    other_linked_companies: '',
    tin_number: '',
    established_date: '',
    company_type: '',
    industry: '',
    ownership_type: '',
    business_activities: '',
    previous_names: '',
    board_of_directors: '',
    key_personnel: '',
    subsidiaries: '',
    annual_revenue: '',
    net_worth: '',
    employee_count: '',
    rating: '',
    head_office_address: '',
    customer_service_phone: '',
    customer_service_email: '',
    has_website: false,
    has_social_media: false,
    has_mobile_app: false,
    is_active: true,
    is_verified: false,
    verification_notes: '',
    description: '',
    notes: '',
    status: 'ACTIVE'
  });

  useEffect(() => {
    if (companyData) {
      setFormData({
        name: companyData.name || '',
        short_name: companyData.short_name || '',
        logo_url: companyData.logo_url || '',
        website: companyData.website || '',
        phone: companyData.phone || '',
        email: companyData.email || '',
        address: companyData.address || '',
        city: companyData.city || '',
        region: companyData.region || '',
        country: companyData.country || '',
        postal_code: companyData.postal_code || '',
        type_of_company: companyData.type_of_company || '',
        district: companyData.district || '',
        date_of_incorporation: companyData.date_of_incorporation ? companyData.date_of_incorporation.split('T')[0] : '',
        date_of_commencement: companyData.date_of_commencement ? companyData.date_of_commencement.split('T')[0] : '',
        nature_of_business: companyData.nature_of_business || '',
        registration_number: companyData.registration_number || '',
        tax_identification_number: companyData.tax_identification_number || '',
        phone_number: companyData.phone_number || '',
        directors: companyData.directors || '',
        secretary: companyData.secretary || '',
        auditor: companyData.auditor || '',
        authorized_shares: companyData.authorized_shares || '',
        stated_capital: companyData.stated_capital || '',
        shareholders: companyData.shareholders || '',
        other_linked_companies: companyData.other_linked_companies || '',
        tin_number: companyData.tin_number || '',
        established_date: companyData.established_date ? companyData.established_date.split('T')[0] : '',
        company_type: companyData.company_type || '',
        industry: companyData.industry || '',
        ownership_type: companyData.ownership_type || '',
        business_activities: companyData.business_activities || '',
        previous_names: companyData.previous_names || '',
        board_of_directors: companyData.board_of_directors || '',
        key_personnel: companyData.key_personnel || '',
        subsidiaries: companyData.subsidiaries || '',
        annual_revenue: companyData.annual_revenue || '',
        net_worth: companyData.net_worth || '',
        employee_count: companyData.employee_count || '',
        rating: companyData.rating || '',
        head_office_address: companyData.head_office_address || '',
        customer_service_phone: companyData.customer_service_phone || '',
        customer_service_email: companyData.customer_service_email || '',
        has_website: companyData.has_website || false,
        has_social_media: companyData.has_social_media || false,
        has_mobile_app: companyData.has_mobile_app || false,
        is_active: companyData.is_active !== undefined ? companyData.is_active : true,
        is_verified: companyData.is_verified || false,
        verification_notes: companyData.verification_notes || '',
        description: companyData.description || '',
        notes: companyData.notes || '',
        status: companyData.status || 'ACTIVE'
      });
    }
  }, [companyData]);

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
            <label className="block text-sm font-medium text-slate-700 mb-1">Company Type</label>
            <select
              name="company_type"
              value={formData.company_type}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
            >
              <option value="">Select Type</option>
              <option value="Private Limited">Private Limited</option>
              <option value="Public Limited">Public Limited</option>
              <option value="Partnership">Partnership</option>
              <option value="Sole Proprietorship">Sole Proprietorship</option>
              <option value="Non-Profit">Non-Profit</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Industry</label>
            <input
              type="text"
              name="industry"
              value={formData.industry}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Registration Number</label>
            <input
              type="text"
              name="registration_number"
              value={formData.registration_number}
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

      {/* Business Information */}
      <div className="space-y-4">
        <h4 className="text-md font-semibold text-slate-900 border-b pb-2">Business Information</h4>
        
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Business Activities (comma-separated)</label>
          <input
            type="text"
            name="business_activities"
            value={formData.business_activities}
            onChange={handleInputChange}
            placeholder="e.g., Software Development, IT Consulting, Digital Solutions"
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Directors (comma-separated)</label>
          <input
            type="text"
            name="directors"
            value={formData.directors}
            onChange={handleInputChange}
            placeholder="e.g., John Doe, Jane Smith, Bob Johnson"
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Secretary</label>
            <input
              type="text"
              name="secretary"
              value={formData.secretary}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Auditor</label>
            <input
              type="text"
              name="auditor"
              value={formData.auditor}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
            />
          </div>
        </div>
      </div>

      {/* Financial Information */}
      <div className="space-y-4">
        <h4 className="text-md font-semibold text-slate-900 border-b pb-2">Financial Information</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Employee Count</label>
            <input
              type="number"
              name="employee_count"
              value={formData.employee_count}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Annual Revenue (GHS)</label>
            <input
              type="number"
              name="annual_revenue"
              value={formData.annual_revenue}
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
              name="has_website"
              checked={formData.has_website}
              onChange={handleInputChange}
              className="h-4 w-4 text-sky-600 focus:ring-sky-500 border-slate-300 rounded"
            />
            <span className="ml-2 text-sm text-slate-700">Has Website</span>
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
          {companyData ? 'Update Company' : 'Create Company'}
        </button>
      </div>
    </form>
  );
};

export default CompanyManagement;
