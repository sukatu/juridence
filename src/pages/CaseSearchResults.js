import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Search, Calendar, Building2, Scale, Clock, CheckCircle, XCircle, AlertCircle, ArrowLeft, Filter, ChevronDown } from 'lucide-react';

const CaseSearchResults = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get('q') || '';
  
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [searchTime, setSearchTime] = useState(0);
  
  // Filters
  const [filters, setFilters] = useState({
    case_type: '',
    area_of_law: '',
    court_type: '',
    status: ''
  });
  const [showFilters, setShowFilters] = useState(false);

  // Load search results
  const loadResults = async (page = 1) => {
    if (!query.trim()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('accessToken');
      const params = new URLSearchParams({
        query: query,
        page: page,
        limit: 20,
        ...filters
      });
      
      const response = await fetch(`/api/case-search/search?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setResults(data.results || []);
        setCurrentPage(data.page || 1);
        setTotalPages(data.total_pages || 1);
        setTotalResults(data.total || 0);
        setSearchTime(data.search_time_ms || 0);
      } else {
        setError('Failed to load search results');
      }
    } catch (err) {
      setError('Error loading search results');
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadResults(1);
  }, [query, filters]); // eslint-disable-line react-hooks/exhaustive-deps

  const handlePageChange = (page) => {
    setCurrentPage(page);
    loadResults(page);
    window.scrollTo(0, 0);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
    setCurrentPage(1);
  };

  const getOutcomeIcon = (outcome) => {
    switch (outcome?.toLowerCase()) {
      case 'favorable':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'unfavorable':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'mixed':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return dateString;
    }
  };

  const truncateText = (text, maxLength = 200) => {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate(-1)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Case Search Results</h1>
                <p className="text-gray-600">
                  {totalResults > 0 ? `${totalResults} cases found` : 'No cases found'} for "{query}"
                  {searchTime > 0 && ` • ${searchTime.toFixed(0)}ms`}
                </p>
              </div>
            </div>
            
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Filter className="w-4 h-4" />
              <span>Filters</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-white border-b shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Case Type</label>
                <select
                  value={filters.case_type}
                  onChange={(e) => handleFilterChange('case_type', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Types</option>
                  <option value="reported">Reported</option>
                  <option value="unreported">Unreported</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Area of Law</label>
                <input
                  type="text"
                  value={filters.area_of_law}
                  onChange={(e) => handleFilterChange('area_of_law', e.target.value)}
                  placeholder="e.g., Contract Law"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Court Type</label>
                <select
                  value={filters.court_type}
                  onChange={(e) => handleFilterChange('court_type', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Courts</option>
                  <option value="SC">Supreme Court</option>
                  <option value="CA">Court of Appeal</option>
                  <option value="HC">High Court</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Status</option>
                  <option value="resolved">Resolved</option>
                  <option value="pending">Pending</option>
                  <option value="dismissed">Dismissed</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Results */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Searching cases...</span>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600">{error}</p>
          </div>
        ) : results.length === 0 ? (
          <div className="text-center py-12">
            <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No cases found for "{query}"</p>
            <p className="text-sm text-gray-500 mt-2">Try adjusting your search terms or filters</p>
          </div>
        ) : (
          <>
            {/* Results List */}
            <div className="space-y-6">
              {results.map((case_item) => (
                <div key={case_item.id} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <button
                          onClick={() => navigate(`/case-details/${case_item.id}?q=${encodeURIComponent(query)}`, {
                            state: { originalPersonCases: results }
                          })}
                          className="text-left"
                        >
                          <h3 className="text-lg font-semibold text-blue-600 hover:text-blue-800 mb-2 transition-colors">
                            {case_item.title}
                          </h3>
                        </button>
                        <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-4 h-4" />
                            <span>{formatDate(case_item.date)}</span>
                          </div>
                          {case_item.suit_reference_number && (
                            <div className="flex items-center space-x-1">
                              <Scale className="w-4 h-4" />
                              <span>{case_item.suit_reference_number}</span>
                            </div>
                          )}
                          {case_item.court_type && (
                            <div className="flex items-center space-x-1">
                              <Building2 className="w-4 h-4" />
                              <span>{case_item.court_type}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getOutcomeIcon(case_item.outcome)}
                        <span className="text-sm text-gray-600">
                          {case_item.outcome || 'Unknown'}
                        </span>
                      </div>
                    </div>
                    
                    {/* Key Information Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                      {/* Court Type */}
                      {case_item.court_type && (
                        <div className="bg-blue-50 p-3 rounded-lg">
                          <h4 className="text-sm font-medium text-blue-900 mb-1">Court Type</h4>
                          <p className="text-sm text-blue-700">{case_item.court_type}</p>
                        </div>
                      )}
                      
                      {/* Suit Number */}
                      {case_item.suit_reference_number && (
                        <div className="bg-green-50 p-3 rounded-lg">
                          <h4 className="text-sm font-medium text-green-900 mb-1">Suit Number</h4>
                          <p className="text-sm text-green-700">{case_item.suit_reference_number}</p>
                        </div>
                      )}
                      
                      {/* Status */}
                      <div className="bg-purple-50 p-3 rounded-lg">
                        <h4 className="text-sm font-medium text-purple-900 mb-1">Status</h4>
                        <p className="text-sm text-purple-700">
                          {case_item.status === '1' || case_item.status === 1 ? 'Judgment' : 
                           case_item.status === '0' || case_item.status === 0 ? 'Resolved' : 
                           case_item.status || 'Unknown'}
                        </p>
                      </div>
                      
                      {/* Region */}
                      {case_item.region && (
                        <div className="bg-orange-50 p-3 rounded-lg">
                          <h4 className="text-sm font-medium text-orange-900 mb-1">Region</h4>
                          <p className="text-sm text-orange-700">{case_item.region}</p>
                        </div>
                      )}
                      
                      {/* Town/City */}
                      {case_item.city && (
                        <div className="bg-indigo-50 p-3 rounded-lg">
                          <h4 className="text-sm font-medium text-indigo-900 mb-1">Town/City</h4>
                          <p className="text-sm text-indigo-700">{case_item.city}</p>
                        </div>
                      )}
                      
                      {/* Amount Involved */}
                      {case_item.monetary_amount && (
                        <div className="bg-yellow-50 p-3 rounded-lg">
                          <h4 className="text-sm font-medium text-yellow-900 mb-1">Amount Involved</h4>
                          <p className="text-sm text-yellow-700">
                            {new Intl.NumberFormat('en-GH', {
                              style: 'currency',
                              currency: 'GHS',
                              minimumFractionDigits: 0,
                              maximumFractionDigits: 0
                            }).format(case_item.monetary_amount)}
                          </p>
                        </div>
                      )}
                    </div>
                    
                    {/* Case Summary */}
                    {case_item.case_summary && (
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Summary</h4>
                        <p className="text-gray-700 leading-relaxed">
                          {truncateText(case_item.case_summary, 300)}
                        </p>
                      </div>
                    )}
                    
                    {/* Board of Directors Resolution */}
                    {case_item.board_resolution && (
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Board Resolution</h4>
                        <p className="text-gray-700 leading-relaxed">
                          {truncateText(case_item.board_resolution, 200)}
                        </p>
                      </div>
                    )}
                    
                    {/* Conclusion of the Case */}
                    {case_item.conclusion && (
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Conclusion</h4>
                        <p className="text-gray-700 leading-relaxed">
                          {truncateText(case_item.conclusion, 200)}
                        </p>
                      </div>
                    )}
                    
                    {/* Order of the Court */}
                    {case_item.court_order && (
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Order of the Court</h4>
                        <p className="text-gray-700 leading-relaxed">
                          {truncateText(case_item.court_order, 200)}
                        </p>
                      </div>
                    )}
                    
                    {/* Subject Matter */}
                    {case_item.subject_matter && (
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Subject Matter</h4>
                        <p className="text-gray-700 leading-relaxed">
                          {truncateText(case_item.subject_matter, 200)}
                        </p>
                      </div>
                    )}
                    
                    {/* Final Orders */}
                    {case_item.final_orders && (
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Final Orders</h4>
                        <p className="text-gray-700 leading-relaxed">
                          {truncateText(case_item.final_orders, 200)}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center space-x-2 mt-8">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const page = i + 1;
                  return (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`px-3 py-2 text-sm font-medium rounded-lg ${
                        currentPage === page
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}
                
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default CaseSearchResults;
