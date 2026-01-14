import React, { useState, useEffect } from 'react';
import { Search, Filter, Calendar, MapPin, Building, User, Shield, FileText, Banknote } from 'lucide-react';
import { apiGet } from '../utils/api';
import GazetteEntry from './GazetteEntry';

const GazetteSearch = ({ onGazetteSelect, showActions = false, personId = null, companyId = null, bankId = null, insuranceId = null }) => {
  const [gazettes, setGazettes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    gazette_type: '',
    status: '',
    priority: '',
    jurisdiction: '',
    source: '',
    date_from: '',
    date_to: '',
    is_public: true,
    is_featured: ''
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    total_pages: 0
  });
  const [showFilters, setShowFilters] = useState(false);

  const gazetteTypes = [
    // Legal Notices
    { value: 'CHANGE_OF_NAME', label: 'Change of Name', icon: User, color: 'blue' },
    { value: 'CHANGE_OF_DATE_OF_BIRTH', label: 'Change of Date of Birth', icon: Calendar, color: 'green' },
    { value: 'CHANGE_OF_PLACE_OF_BIRTH', label: 'Change of Place of Birth', icon: MapPin, color: 'orange' },
    { value: 'APPOINTMENT_OF_MARRIAGE_OFFICERS', label: 'Appointment of Marriage Officers', icon: User, color: 'purple' },
    
    // General Categories
    { value: 'LEGAL_NOTICE', label: 'Legal Notice', icon: FileText, color: 'blue' },
    { value: 'BUSINESS_NOTICE', label: 'Business Notice', icon: Building, color: 'green' },
    { value: 'PROPERTY_NOTICE', label: 'Property Notice', icon: MapPin, color: 'orange' },
    { value: 'PERSONAL_NOTICE', label: 'Personal Notice', icon: User, color: 'purple' },
    { value: 'REGULATORY_NOTICE', label: 'Regulatory Notice', icon: Shield, color: 'red' },
    { value: 'COURT_NOTICE', label: 'Court Notice', icon: FileText, color: 'blue' },
    { value: 'BANKRUPTCY_NOTICE', label: 'Bankruptcy Notice', icon: Banknote, color: 'red' },
    { value: 'PROBATE_NOTICE', label: 'Probate Notice', icon: FileText, color: 'gray' },
    { value: 'OTHER', label: 'Other', icon: FileText, color: 'gray' }
  ];

  const statusOptions = [
    { value: 'DRAFT', label: 'Draft' },
    { value: 'PUBLISHED', label: 'Published' },
    { value: 'ARCHIVED', label: 'Archived' },
    { value: 'CANCELLED', label: 'Cancelled' }
  ];

  const priorityOptions = [
    { value: 'LOW', label: 'Low' },
    { value: 'MEDIUM', label: 'Medium' },
    { value: 'HIGH', label: 'High' },
    { value: 'URGENT', label: 'Urgent' }
  ];

  useEffect(() => {
    if (personId || companyId || bankId || insuranceId || searchTerm || Object.values(filters).some(v => v !== '' && v !== true)) {
      searchGazettes();
    }
  }, [pagination.page, filters, personId, companyId, bankId, insuranceId]);

  const searchGazettes = async () => {
    try {
      setLoading(true);
      
      // Filter out empty values to avoid 422 errors
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

      let endpoint = '/gazette';
      if (personId) {
        endpoint = `/gazette/person/${personId}`;
      } else if (companyId) {
        endpoint = `/gazette/company/${companyId}`;
      } else if (bankId) {
        endpoint = `/gazette/bank/${bankId}`;
      } else if (insuranceId) {
        endpoint = `/gazette/insurance/${insuranceId}`;
      }

      const response = await apiGet(`${endpoint}?${params}`);
      setGazettes(response.gazettes || []);
      setPagination(prev => ({
        ...prev,
        total: response.total || 0,
        total_pages: response.total_pages || 0
      }));
    } catch (error) {
      console.error('Error searching gazettes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPagination(prev => ({ ...prev, page: 1 }));
    searchGazettes();
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const clearFilters = () => {
    setFilters({
      gazette_type: '',
      status: '',
      priority: '',
      jurisdiction: '',
      source: '',
      date_from: '',
      date_to: '',
      is_public: true,
      is_featured: ''
    });
    setSearchTerm('');
    setGazettes([]);
    setPagination(prev => ({ ...prev, page: 1, total: 0, total_pages: 0 }));
  };

  return (
    <div className="space-y-6">
      {/* Search Form */}
      <div className="bg-white p-6 rounded-lg shadow">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search gazettes by title, content, reference number..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex space-x-2">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {loading ? 'Searching...' : 'Search'}
              </button>
              <button
                type="button"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </button>
            </div>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-gray-200">
              <select
                value={filters.gazette_type}
                onChange={(e) => handleFilterChange('gazette_type', e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Types</option>
                {gazetteTypes.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>

              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Status</option>
                {statusOptions.map(status => (
                  <option key={status.value} value={status.value}>{status.label}</option>
                ))}
              </select>

              <select
                value={filters.priority}
                onChange={(e) => handleFilterChange('priority', e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Priorities</option>
                {priorityOptions.map(priority => (
                  <option key={priority.value} value={priority.value}>{priority.label}</option>
                ))}
              </select>

              <input
                type="text"
                placeholder="Jurisdiction"
                value={filters.jurisdiction}
                onChange={(e) => handleFilterChange('jurisdiction', e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />

              <input
                type="date"
                placeholder="From Date"
                value={filters.date_from}
                onChange={(e) => handleFilterChange('date_from', e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />

              <input
                type="date"
                placeholder="To Date"
                value={filters.date_to}
                onChange={(e) => handleFilterChange('date_to', e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />

              <input
                type="text"
                placeholder="Source"
                value={filters.source}
                onChange={(e) => handleFilterChange('source', e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />

              <div className="flex items-center space-x-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.is_public}
                    onChange={(e) => handleFilterChange('is_public', e.target.checked)}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">Public Only</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.is_featured}
                    onChange={(e) => handleFilterChange('is_featured', e.target.checked)}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">Featured Only</span>
                </label>
              </div>
            </div>
          )}

          {/* Filter Actions */}
          {showFilters && (
            <div className="flex justify-end space-x-2 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={clearFilters}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          )}
        </form>
      </div>

      {/* Results */}
      {gazettes.length > 0 && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">
              Search Results ({pagination.total})
            </h3>
            <div className="text-sm text-gray-600">
              Page {pagination.page} of {pagination.total_pages}
            </div>
          </div>

          <div className="space-y-4">
            {gazettes.map((gazette) => (
              <GazetteEntry
                key={gazette.id}
                gazette={gazette}
                showActions={showActions}
                onView={onGazetteSelect}
              />
            ))}
          </div>

          {/* Pagination */}
          {pagination.total_pages > 1 && (
            <div className="flex justify-center space-x-2">
              <button
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                disabled={pagination.page === 1}
                className="px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="px-4 py-2 text-sm text-gray-700">
                {pagination.page} of {pagination.total_pages}
              </span>
              <button
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                disabled={pagination.page === pagination.total_pages}
                className="px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}

      {/* No Results */}
      {!loading && gazettes.length === 0 && (searchTerm || Object.values(filters).some(v => v !== '' && v !== true)) && (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No gazettes found</h3>
          <p className="text-gray-600 mb-4">
            Try adjusting your search terms or filters
          </p>
          <button
            onClick={clearFilters}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Clear Filters
          </button>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Searching gazettes...</p>
        </div>
      )}
    </div>
  );
};

export default GazetteSearch;
