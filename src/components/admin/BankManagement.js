import React, { useState, useEffect, useRef } from 'react';
import { 
  Building2, 
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
  Shield,
  CheckCircle,
  XCircle,
  ChevronLeft,
  ChevronRight,
  X,
  BarChart3,
  TrendingUp,
  DollarSign,
  Users,
  Star
} from 'lucide-react';

const BankManagement = () => {
  const [banks, setBanks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [bankTypeFilter, setBankTypeFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalBanks, setTotalBanks] = useState(0);
  const [selectedBank, setSelectedBank] = useState(null);
  const [showBankModal, setShowBankModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [analytics, setAnalytics] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingBank, setEditingBank] = useState(null);
  const searchInputRef = useRef(null);

  // Initial load
  useEffect(() => {
    loadBanks(false);
    loadAnalytics();
  }, []);

  // Debounced search and filter changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      // Only show search loading if we have a search term or filter
      const hasSearchOrFilter = searchTerm || bankTypeFilter;
      loadBanks(hasSearchOrFilter);
      // Don't reload analytics on every search - it's expensive and causes re-renders
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, bankTypeFilter]);

  // Page changes (no debouncing needed)
  useEffect(() => {
    const hasSearchOrFilter = searchTerm || bankTypeFilter;
    loadBanks(hasSearchOrFilter);
  }, [currentPage]);

  const loadBanks = async (isSearch = false) => {
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
      if (bankTypeFilter) params.append('bank_type', bankTypeFilter);

      const response = await fetch(`/api/admin/banks?${params}`);
      const data = await response.json();

      if (response.ok) {
        setBanks(data.banks || []);
        setTotalPages(data.total_pages || 1);
        setTotalBanks(data.total || 0);
      } else {
        console.error('Error loading banks:', data.detail);
      }
    } catch (error) {
      console.error('Error loading banks:', error);
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
      const response = await fetch('/api/admin/banks/stats');
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

  const handleBankTypeFilter = (e) => {
    setBankTypeFilter(e.target.value);
    setCurrentPage(1);
  };

  const handleViewBank = (bank) => {
    setSelectedBank(bank);
    setShowBankModal(true);
  };

  const handleDeleteBank = (bank) => {
    setSelectedBank(bank);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/admin/banks/${selectedBank.id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setShowDeleteModal(false);
        setSelectedBank(null);
        loadBanks();
      } else {
        const data = await response.json();
        console.error('Error deleting bank:', data.detail);
      }
    } catch (error) {
      console.error('Error deleting bank:', error);
    }
  };

  const handleCreateBank = () => {
    setEditingBank(null);
    setShowCreateModal(true);
  };

  const handleEditBank = (bank) => {
    setEditingBank(bank);
    setShowEditModal(true);
  };

  const handleSaveBank = async (bankData) => {
    try {
      const url = editingBank 
        ? `/api/admin/banks/${editingBank.id}`
        : '/api/admin/banks/';
      
      const method = editingBank ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bankData)
      });

      if (response.ok) {
        setShowCreateModal(false);
        setShowEditModal(false);
        setEditingBank(null);
        loadBanks();
      } else {
        const data = await response.json();
        console.error('Error saving bank:', data.detail);
      }
    } catch (error) {
      console.error('Error saving bank:', error);
    }
  };

  const getBankTypeBadgeColor = (bankType) => {
    switch (bankType?.toLowerCase()) {
      case 'commercial': return 'bg-blue-100 text-blue-800';
      case 'investment': return 'bg-purple-100 text-purple-800';
      case 'development': return 'bg-green-100 text-green-800';
      case 'microfinance': return 'bg-yellow-100 text-yellow-800';
      case 'central': return 'bg-red-100 text-red-800';
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
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="w-full">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Banks</h1>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Bank Management</h2>
              <p className="text-gray-600">Manage bank records and analytics</p>
            </div>
            <button
              onClick={handleCreateBank}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            >
              <Building2 className="h-4 w-4 mr-2" />
              Create Bank
            </button>
          </div>
        </div>

        {/* Analytics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Building2 className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Banks</p>
                <p className="text-2xl font-bold text-gray-900">{analytics?.total_banks || 0}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Assets</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(analytics?.total_assets)}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Branches</p>
                <p className="text-2xl font-bold text-gray-900">{analytics?.total_branches || 0}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Star className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg Rating</p>
                <p className="text-2xl font-bold text-gray-900">{analytics?.avg_rating?.toFixed(1) || '0.0'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search banks..."
                value={searchTerm}
                onChange={handleSearch}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              {searchLoading && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                </div>
              )}
            </div>
            
            <select
              value={bankTypeFilter}
              onChange={handleBankTypeFilter}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Bank Types</option>
              <option value="commercial">Commercial</option>
              <option value="investment">Investment</option>
              <option value="development">Development</option>
              <option value="microfinance">Microfinance</option>
              <option value="central">Central</option>
            </select>
            
            <div className="text-sm text-gray-600 flex items-center">
              <Building2 className="h-4 w-4 mr-2" />
              {totalBanks} total banks
            </div>
          </div>
        </div>

        {/* Banks Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading banks...</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto w-full">
                <table className="min-w-full divide-y divide-gray-200 w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Bank
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Contact
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Assets
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {banks.map((bank) => (
                      <tr key={bank.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                            <Building2 className="h-4 w-4 text-gray-400" />
                          </div>
                          <div className="ml-3 min-w-0">
                            <div className="text-sm font-medium text-gray-900 truncate max-w-xs">
                              {bank.name}
                            </div>
                            <div className="text-xs text-gray-500 truncate">
                              {bank.short_name || bank.city || 'N/A'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getBankTypeBadgeColor(bank.bank_type)}`}>
                          {bank.bank_type || 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {bank.phone ? (
                            <div className="flex items-center">
                              <Phone className="h-3 w-3 mr-1 text-gray-400 flex-shrink-0" />
                              <span className="truncate max-w-32">{bank.phone}</span>
                            </div>
                          ) : bank.email ? (
                            <div className="flex items-center">
                              <Mail className="h-3 w-3 mr-1 text-gray-400 flex-shrink-0" />
                              <span className="truncate max-w-32">{truncateText(bank.email, 20)}</span>
                            </div>
                          ) : (
                            <span className="text-gray-400">N/A</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {bank.total_assets ? formatCurrency(bank.total_assets) : 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleViewBank(bank)}
                            className="text-gray-600 hover:text-gray-900 p-1"
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleEditBank(bank)}
                            className="text-green-600 hover:text-green-900 p-1"
                            title="Edit Bank"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteBank(bank)}
                            className="text-red-600 hover:text-red-900 p-1"
                            title="Delete Bank"
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
                <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Showing page <span className="font-medium">{currentPage}</span> of{' '}
                      <span className="font-medium">{totalPages}</span>
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
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
      </div>

      {/* Bank Detail Modal */}
      {showBankModal && selectedBank && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-slate-900">Bank Details</h3>
              <button
                onClick={() => setShowBankModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-medium text-slate-500 mb-2">Bank Name</h4>
                  <p className="text-sm text-slate-900">{selectedBank.name}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-slate-500 mb-2">Short Name</h4>
                  <p className="text-sm text-slate-900">{selectedBank.short_name || 'N/A'}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-slate-500 mb-2">Bank Type</h4>
                  <p className="text-sm text-slate-900">{selectedBank.bank_type || 'N/A'}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-slate-500 mb-2">License Number</h4>
                  <p className="text-sm text-slate-900">{selectedBank.license_number || 'N/A'}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-slate-500 mb-2">Established Date</h4>
                  <p className="text-sm text-slate-900">{formatDate(selectedBank.established_date)}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-slate-500 mb-2">Status</h4>
                  <p className="text-sm text-slate-900">
                    {selectedBank.is_active ? (
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
                    <p className="text-sm text-slate-900">{selectedBank.email || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Phone</p>
                    <p className="text-sm text-slate-900">{selectedBank.phone || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Website</p>
                    <p className="text-sm text-slate-900">
                      {selectedBank.website ? (
                        <a href={selectedBank.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
                          {selectedBank.website}
                        </a>
                      ) : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Customer Service</p>
                    <p className="text-sm text-slate-900">{selectedBank.customer_service_phone || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Financial Information */}
              <div className="bg-slate-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-slate-500 mb-3">Financial Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs text-slate-500">Total Assets</p>
                    <p className="text-sm font-medium text-slate-900">{formatCurrency(selectedBank.total_assets)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Net Worth</p>
                    <p className="text-sm font-medium text-slate-900">{formatCurrency(selectedBank.net_worth)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Rating</p>
                    <p className="text-sm font-medium text-slate-900">
                      {selectedBank.rating ? `${selectedBank.rating}/5` : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Services */}
              <div>
                <h4 className="text-sm font-medium text-slate-500 mb-2">Services</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="flex items-center space-x-2">
                    {selectedBank.has_mobile_app ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500" />
                    )}
                    <span className="text-sm text-slate-900">Mobile App</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {selectedBank.has_online_banking ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500" />
                    )}
                    <span className="text-sm text-slate-900">Online Banking</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {selectedBank.has_atm_services ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500" />
                    )}
                    <span className="text-sm text-slate-900">ATM Services</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {selectedBank.has_foreign_exchange ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500" />
                    )}
                    <span className="text-sm text-slate-900">Foreign Exchange</span>
                  </div>
                </div>
              </div>

              {/* Location */}
              <div>
                <h4 className="text-sm font-medium text-slate-500 mb-2">Location</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-slate-500">Address</p>
                    <p className="text-sm text-slate-900">{selectedBank.address || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">City, Region</p>
                    <p className="text-sm text-slate-900">
                      {selectedBank.city && selectedBank.region 
                        ? `${selectedBank.city}, ${selectedBank.region}` 
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
      {showDeleteModal && selectedBank && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center space-x-3 mb-4">
              <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                <Trash2 className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Delete Bank</h3>
                <p className="text-sm text-slate-600">This action cannot be undone.</p>
              </div>
            </div>
            
            <p className="text-slate-700 mb-6">
              Are you sure you want to delete <strong>{selectedBank.name}</strong>? 
              This will permanently remove the bank and all associated data.
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
                Delete Bank
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create/Edit Bank Modal */}
      {(showCreateModal || showEditModal) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900">
                {editingBank ? 'Edit Bank' : 'Create New Bank'}
              </h3>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setShowEditModal(false);
                  setEditingBank(null);
                }}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <BankForm
              bankData={editingBank}
              onSave={handleSaveBank}
              onCancel={() => {
                setShowCreateModal(false);
                setShowEditModal(false);
                setEditingBank(null);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

// Bank Form Component
const BankForm = ({ bankData, onSave, onCancel }) => {
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
    bank_code: '',
    swift_code: '',
    license_number: '',
    established_date: '',
    bank_type: '',
    ownership_type: '',
    services: '',
    previous_names: '',
    branches_count: '',
    atm_count: '',
    total_assets: '',
    net_worth: '',
    rating: '',
    head_office_address: '',
    customer_service_phone: '',
    customer_service_email: '',
    has_mobile_app: false,
    has_online_banking: false,
    has_atm_services: false,
    has_foreign_exchange: false,
    is_active: true,
    is_verified: false,
    verification_notes: '',
    description: '',
    notes: '',
    status: 'ACTIVE'
  });

  useEffect(() => {
    if (bankData) {
      setFormData({
        name: bankData.name || '',
        short_name: bankData.short_name || '',
        logo_url: bankData.logo_url || '',
        website: bankData.website || '',
        phone: bankData.phone || '',
        email: bankData.email || '',
        address: bankData.address || '',
        city: bankData.city || '',
        region: bankData.region || '',
        country: bankData.country || '',
        postal_code: bankData.postal_code || '',
        bank_code: bankData.bank_code || '',
        swift_code: bankData.swift_code || '',
        license_number: bankData.license_number || '',
        established_date: bankData.established_date ? bankData.established_date.split('T')[0] : '',
        bank_type: bankData.bank_type || '',
        ownership_type: bankData.ownership_type || '',
        services: bankData.services || '',
        previous_names: bankData.previous_names || '',
        branches_count: bankData.branches_count || '',
        atm_count: bankData.atm_count || '',
        total_assets: bankData.total_assets || '',
        net_worth: bankData.net_worth || '',
        rating: bankData.rating || '',
        head_office_address: bankData.head_office_address || '',
        customer_service_phone: bankData.customer_service_phone || '',
        customer_service_email: bankData.customer_service_email || '',
        has_mobile_app: bankData.has_mobile_app || false,
        has_online_banking: bankData.has_online_banking || false,
        has_atm_services: bankData.has_atm_services || false,
        has_foreign_exchange: bankData.has_foreign_exchange || false,
        is_active: bankData.is_active !== undefined ? bankData.is_active : true,
        is_verified: bankData.is_verified || false,
        verification_notes: bankData.verification_notes || '',
        description: bankData.description || '',
        notes: bankData.notes || '',
        status: bankData.status || 'ACTIVE'
      });
    }
  }, [bankData]);

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
            <label className="block text-sm font-medium text-slate-700 mb-1">Bank Name *</label>
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
            <label className="block text-sm font-medium text-slate-700 mb-1">Bank Code</label>
            <input
              type="text"
              name="bank_code"
              value={formData.bank_code}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">SWIFT Code</label>
            <input
              type="text"
              name="swift_code"
              value={formData.swift_code}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
            />
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

      {/* Services and Previous Names */}
      <div className="space-y-4">
        <h4 className="text-md font-semibold text-slate-900 border-b pb-2">Services & History</h4>
        
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Services (comma-separated)</label>
          <input
            type="text"
            name="services"
            value={formData.services}
            onChange={handleInputChange}
            placeholder="e.g., Personal Banking, Corporate Banking, Digital Banking"
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
            placeholder="e.g., Old Bank Name, Previous Bank Ltd"
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
          />
        </div>
      </div>

      {/* Financial Information */}
      <div className="space-y-4">
        <h4 className="text-md font-semibold text-slate-900 border-b pb-2">Financial Information</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              name="has_online_banking"
              checked={formData.has_online_banking}
              onChange={handleInputChange}
              className="h-4 w-4 text-sky-600 focus:ring-sky-500 border-slate-300 rounded"
            />
            <span className="ml-2 text-sm text-slate-700">Online Banking</span>
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
          {bankData ? 'Update Bank' : 'Create Bank'}
        </button>
      </div>
    </form>
  );
};

export default BankManagement;
