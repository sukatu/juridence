import React, { useState, useEffect, useCallback } from 'react';
import { 
  MapPin, 
  Phone, 
  Mail, 
  Search, 
  Filter, 
  Plus, 
  Edit, 
  Trash2, 
  Map,
  Building2,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { apiGet, apiPost, apiPut, apiDelete } from '../../utils/api';

const CourtManagement = () => {
  const [courts, setCourts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterRegion, setFilterRegion] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedCourt, setSelectedCourt] = useState(null);
  const [regions, setRegions] = useState([]);
  const [courtTypes, setCourtTypes] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCourts, setTotalCourts] = useState(0);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [courtToDelete, setCourtToDelete] = useState(null);

  // Form data for add/edit
  const [formData, setFormData] = useState({
    name: '',
    registry_name: '',
    court_type: '',
    region: '',
    location: '',
    address: '',
    city: '',
    district: '',
    latitude: '',
    longitude: '',
    google_place_id: '',
    area_coverage: '',
    contact_phone: '',
    contact_email: '',
    website: '',
    court_picture_url: '',
    operating_hours: '',
    is_active: true,
    is_verified: false,
    notes: ''
  });

  // Validation function
  const validateForm = () => {
    const errors = {};
    
    if (!formData.name.trim()) {
      errors.name = 'Court name is required';
    }
    if (!formData.court_type) {
      errors.court_type = 'Court type is required';
    }
    if (!formData.region.trim()) {
      errors.region = 'Region is required';
    }
    if (!formData.location.trim()) {
      errors.location = 'Location is required';
    }
    
    // Validate operating_hours JSON if provided
    if (formData.operating_hours && formData.operating_hours.trim()) {
      try {
        JSON.parse(formData.operating_hours);
      } catch (e) {
        errors.operating_hours = 'Operating hours must be valid JSON format';
      }
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Clear alerts
  const clearAlerts = () => {
    setError(null);
    setSuccess(null);
    setValidationErrors({});
  };

  // Load courts data
  const loadCourts = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage,
        limit: 20,
        ...(searchQuery && { query: searchQuery }),
        ...(filterType && { court_type: filterType }),
        ...(filterRegion && { region: filterRegion }),
        ...(filterStatus && { is_active: filterStatus === 'active' })
      });

      const data = await apiGet(`/courts/?${params}`);
      setCourts(data.courts || []);
      setTotalPages(data.total_pages || 1);
      setTotalCourts(data.total || 0);
    } catch (error) {
      console.error('Error loading courts:', error);
      setError(`Failed to load courts: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchQuery, filterType, filterRegion, filterStatus]);

  // Load filter options
  const loadFilterOptions = async () => {
    try {
      const [regionsData, typesData] = await Promise.all([
        apiGet('/courts/regions'),
        apiGet('/courts/types')
      ]);

      setRegions(regionsData || []);
      setCourtTypes(typesData || []);
    } catch (error) {
      console.error('Error loading filter options:', error);
    }
  };

  useEffect(() => {
    loadCourts();
    loadFilterOptions();
  }, [loadCourts]);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Clear previous alerts
    clearAlerts();
    
    // Validate form
    if (!validateForm()) {
      setError('Please fix the validation errors before submitting');
      return;
    }
    
    try {
      // Prepare form data, handling special fields
      const submitData = { ...formData };
      
      // Handle operating_hours - convert empty string to null or parse JSON
      if (submitData.operating_hours === '' || submitData.operating_hours === null) {
        submitData.operating_hours = null;
      } else if (typeof submitData.operating_hours === 'string') {
        try {
          submitData.operating_hours = JSON.parse(submitData.operating_hours);
        } catch (e) {
          // If it's not valid JSON, set to null
          submitData.operating_hours = null;
        }
      }
      
      // Handle additional_images - convert empty string to null
      if (submitData.additional_images === '' || submitData.additional_images === null) {
        submitData.additional_images = null;
      }
      
      if (selectedCourt) {
        await apiPut(`/courts/${selectedCourt.id}`, submitData);
        setSuccess('Court updated successfully!');
      } else {
        await apiPost('/courts/', submitData);
        setSuccess('Court created successfully!');
      }
      
      setShowAddModal(false);
      setShowEditModal(false);
      setSelectedCourt(null);
      setFormData({
        name: '',
        registry_name: '',
        court_type: '',
        region: '',
        location: '',
        address: '',
        city: '',
        district: '',
        latitude: '',
        longitude: '',
        google_place_id: '',
        area_coverage: '',
        contact_phone: '',
        contact_email: '',
        website: '',
        court_picture_url: '',
        operating_hours: '',
        is_active: true,
        is_verified: false,
        notes: ''
      });
      loadCourts();
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error('Error saving court:', error);
      setError(`Error saving court: ${error.message}`);
    }
  };

  // Handle edit
  const handleEdit = (court) => {
    setSelectedCourt(court);
    setFormData({
      name: court.name || '',
      registry_name: court.registry_name || '',
      court_type: court.court_type || '',
      region: court.region || '',
      location: court.location || '',
      address: court.address || '',
      city: court.city || '',
      district: court.district || '',
      latitude: court.latitude || '',
      longitude: court.longitude || '',
      google_place_id: court.google_place_id || '',
      area_coverage: court.area_coverage || '',
      contact_phone: court.contact_phone || '',
      contact_email: court.contact_email || '',
      website: court.website || '',
      court_picture_url: court.court_picture_url || '',
      operating_hours: court.operating_hours ? JSON.stringify(court.operating_hours, null, 2) : '',
      is_active: court.is_active,
      is_verified: court.is_verified,
      notes: court.notes || ''
    });
    setShowEditModal(true);
  };

  // Handle delete
  const handleDelete = (court) => {
    setCourtToDelete(court);
    setShowDeleteModal(true);
  };

  // Confirm delete
  const confirmDelete = async () => {
    if (!courtToDelete) return;
    
    try {
      await apiDelete(`/courts/${courtToDelete.id}`);
      setSuccess('Court deleted successfully!');
      setShowDeleteModal(false);
      setCourtToDelete(null);
      loadCourts();
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error('Error deleting court:', error);
      setError(`Error deleting court: ${error.message}`);
    }
  };

  // Cancel delete
  const cancelDelete = () => {
    setShowDeleteModal(false);
    setCourtToDelete(null);
  };

  // Get status icon
  const getStatusIcon = (court) => {
    if (court.is_verified) {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    } else if (court.is_active) {
      return <AlertCircle className="h-4 w-4 text-yellow-500" />;
    } else {
      return <XCircle className="h-4 w-4 text-red-500" />;
    }
  };

  // Get court type color
  const getCourtTypeColor = (type) => {
    const colors = {
      'Supreme Court': 'bg-purple-100 text-purple-800',
      'High Court': 'bg-blue-100 text-blue-800',
      'Circuit Court': 'bg-green-100 text-green-800',
      'District Court': 'bg-yellow-100 text-yellow-800',
      'Commercial Court': 'bg-indigo-100 text-indigo-800',
      'Family Court': 'bg-pink-100 text-pink-800',
      'Labour Court': 'bg-orange-100 text-orange-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      {/* Alerts */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-3">
          <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
          <div>
            <p className="text-red-800 font-medium">Error</p>
            <p className="text-red-700 text-sm">{error}</p>
          </div>
          <button
            onClick={() => setError(null)}
            className="ml-auto text-red-400 hover:text-red-600"
          >
            <XCircle className="h-4 w-4" />
          </button>
        </div>
      )}
      
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center space-x-3">
          <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
          <div>
            <p className="text-green-800 font-medium">Success</p>
            <p className="text-green-700 text-sm">{success}</p>
          </div>
          <button
            onClick={() => setSuccess(null)}
            className="ml-auto text-green-400 hover:text-green-600"
          >
            <XCircle className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Court Management</h2>
          <p className="text-slate-600">Manage courts in the system</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          Add Court
        </button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
          <div className="flex items-center">
            <Building2 className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-slate-600">Total Courts</p>
              <p className="text-2xl font-bold text-slate-900">{totalCourts}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
          <div className="flex items-center">
            <CheckCircle className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-slate-600">Verified</p>
              <p className="text-2xl font-bold text-slate-900">
                {courts.filter(c => c.is_verified).length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
          <div className="flex items-center">
            <Map className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-slate-600">With Location</p>
              <p className="text-2xl font-bold text-slate-900">
                {courts.filter(c => c.latitude && c.longitude).length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
          <div className="flex items-center">
            <Clock className="h-8 w-8 text-orange-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-slate-600">Active</p>
              <p className="text-2xl font-bold text-slate-900">
                {courts.filter(c => c.is_active).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search courts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg"
          >
            <Filter className="h-4 w-4" />
            Filters
          </button>
        </div>

        {showFilters && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Court Types</option>
              {courtTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            <select
              value={filterRegion}
              onChange={(e) => setFilterRegion(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Regions</option>
              {regions.map(region => (
                <option key={region} value={region}>{region}</option>
              ))}
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        )}
      </div>

      {/* Courts Table */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200">
        <div className="overflow-x-auto w-full">
          <table className="min-w-full divide-y divide-slate-200 w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Court
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center text-slate-500">
                    Loading courts...
                  </td>
                </tr>
              ) : courts.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center text-slate-500">
                    No courts found
                  </td>
                </tr>
              ) : (
                courts.map((court) => (
                  <tr key={court.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-slate-900">{court.name}</div>
                        {court.registry_name && (
                          <div className="text-sm text-slate-500">{court.registry_name}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCourtTypeColor(court.court_type)}`}>
                        {court.court_type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-slate-900">
                        <MapPin className="h-4 w-4 text-slate-400 mr-1" />
                        <div>
                          <div>{court.location}</div>
                          <div className="text-slate-500">{court.region}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                      <div className="space-y-1">
                        {court.contact_phone && (
                          <div className="flex items-center">
                            <Phone className="h-3 w-3 text-slate-400 mr-1" />
                            {court.contact_phone}
                          </div>
                        )}
                        {court.contact_email && (
                          <div className="flex items-center">
                            <Mail className="h-3 w-3 text-slate-400 mr-1" />
                            {court.contact_email}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getStatusIcon(court)}
                        <span className="ml-2 text-sm text-slate-900">
                          {court.is_verified ? 'Verified' : court.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEdit(court)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(court)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-3 border-t border-slate-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-slate-700">
                Showing {((currentPage - 1) * 20) + 1} to {Math.min(currentPage * 20, totalCourts)} of {totalCourts} courts
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 text-sm border border-slate-300 rounded-md hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="px-3 py-1 text-sm text-slate-700">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 text-sm border border-slate-300 rounded-md hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {(showAddModal || showEditModal) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900">
                {selectedCourt ? 'Edit Court' : 'Add New Court'}
              </h3>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setShowEditModal(false);
                  setSelectedCourt(null);
                }}
                className="text-slate-400 hover:text-slate-600"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Court Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      validationErrors.name ? 'border-red-300' : 'border-slate-300'
                    }`}
                  />
                  {validationErrors.name && (
                    <p className="text-red-500 text-xs mt-1">{validationErrors.name}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Registry Name
                  </label>
                  <input
                    type="text"
                    value={formData.registry_name}
                    onChange={(e) => setFormData({...formData, registry_name: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Court Type *
                  </label>
                  <select
                    required
                    value={formData.court_type}
                    onChange={(e) => setFormData({...formData, court_type: e.target.value})}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      validationErrors.court_type ? 'border-red-300' : 'border-slate-300'
                    }`}
                  >
                    <option value="">Select Court Type</option>
                    <option value="Supreme Court">Supreme Court</option>
                    <option value="High Court">High Court</option>
                    <option value="Circuit Court">Circuit Court</option>
                    <option value="District Court">District Court</option>
                    <option value="Commercial Court">Commercial Court</option>
                    <option value="Family Court">Family Court</option>
                    <option value="Labour Court">Labour Court</option>
                    <option value="Tribunal">Tribunal</option>
                  </select>
                  {validationErrors.court_type && (
                    <p className="text-red-500 text-xs mt-1">{validationErrors.court_type}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Region *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.region}
                    onChange={(e) => setFormData({...formData, region: e.target.value})}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      validationErrors.region ? 'border-red-300' : 'border-slate-300'
                    }`}
                  />
                  {validationErrors.region && (
                    <p className="text-red-500 text-xs mt-1">{validationErrors.region}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Location *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      validationErrors.location ? 'border-red-300' : 'border-slate-300'
                    }`}
                  />
                  {validationErrors.location && (
                    <p className="text-red-500 text-xs mt-1">{validationErrors.location}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({...formData, city: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Latitude
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={formData.latitude}
                    onChange={(e) => setFormData({...formData, latitude: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Longitude
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={formData.longitude}
                    onChange={(e) => setFormData({...formData, longitude: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Contact Phone
                  </label>
                  <input
                    type="tel"
                    value={formData.contact_phone}
                    onChange={(e) => setFormData({...formData, contact_phone: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Contact Email
                  </label>
                  <input
                    type="email"
                    value={formData.contact_email}
                    onChange={(e) => setFormData({...formData, contact_email: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Court Picture URL
                  </label>
                  <input
                    type="url"
                    value={formData.court_picture_url}
                    onChange={(e) => setFormData({...formData, court_picture_url: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Address
                </label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Area Coverage
                </label>
                <textarea
                  value={formData.area_coverage}
                  onChange={(e) => setFormData({...formData, area_coverage: e.target.value})}
                  rows={2}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Operating Hours (JSON format)
                </label>
                <textarea
                  value={formData.operating_hours}
                  onChange={(e) => setFormData({...formData, operating_hours: e.target.value})}
                  rows={3}
                  placeholder='{"monday": "9:00 AM - 5:00 PM", "tuesday": "9:00 AM - 5:00 PM", ...}'
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    validationErrors.operating_hours ? 'border-red-300' : 'border-slate-300'
                  }`}
                />
                <p className="text-xs text-slate-500 mt-1">
                  Enter operating hours as JSON object or leave empty
                </p>
                {validationErrors.operating_hours && (
                  <p className="text-red-500 text-xs mt-1">{validationErrors.operating_hours}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="flex items-center space-x-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-slate-700">Active</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.is_verified}
                    onChange={(e) => setFormData({...formData, is_verified: e.target.checked})}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-slate-700">Verified</span>
                </label>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setShowEditModal(false);
                    setSelectedCourt(null);
                  }}
                  className="px-4 py-2 text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {selectedCourt ? 'Update Court' : 'Add Court'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center mb-4">
              <AlertCircle className="h-6 w-6 text-red-500 mr-3" />
              <h3 className="text-lg font-medium text-slate-900">Delete Court</h3>
            </div>
            <p className="text-slate-600 mb-6">
              Are you sure you want to delete <strong>{courtToDelete?.name}</strong>? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={cancelDelete}
                className="px-4 py-2 text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourtManagement;
