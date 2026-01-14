import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Search, Filter, ChevronDown, ArrowLeft, Eye, Clock, MapPin, Scale, Users, Building2, ShieldCheck, AlertCircle } from 'lucide-react';

const EnhancedSearchResults = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get('q') || searchParams.get('search') || '';

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchProgress, setSearchProgress] = useState(0);
  const [currentSearching, setCurrentSearching] = useState('');
  const [searchStats, setSearchStats] = useState({
    totalResults: 0,
    searchTime: 0,
    courtsSearched: 0,
    totalCourts: 0
  });
  const [filters, setFilters] = useState({
    sortBy: 'relevance',
    region: 'all',
    caseType: 'all'
  });
  const [showFilters, setShowFilters] = useState(false);

  // Region mapping function
  const getRegionName = (regionCode) => {
    const regionMap = {
      'GAR': 'Greater Accra Region',
      'ASR': 'Ashanti Region',
      'AR': 'Ashanti Region', // Alternative abbreviation
      'VR': 'Volta Region',
      'ER': 'Eastern Region',
      'WR': 'Western Region',
      'CR': 'Central Region',
      'NR': 'Northern Region',
      'UER': 'Upper East Region',
      'UWR': 'Upper West Region',
      'BR': 'Brong-Ahafo Region',
      'WNR': 'Western North Region',
      'AHR': 'Ahafo Region',
      'BER': 'Bono East Region',
      'NER': 'North East Region',
      'SR': 'Savannah Region',
      'OR': 'Oti Region',
      'gar': 'Greater Accra Region', // Handle lowercase
      'asr': 'Ashanti Region', // Handle lowercase
      'Greater Accra Region': 'Greater Accra Region',
      'Ashanti Region': 'Ashanti Region',
      'Volta Region': 'Volta Region',
      'Eastern Region': 'Eastern Region',
      'Western Region': 'Western Region',
      'Central Region': 'Central Region',
      'Northern Region': 'Northern Region',
      'Upper East Region': 'Upper East Region',
      'Upper West Region': 'Upper West Region',
      'Brong-Ahafo Region': 'Brong-Ahafo Region',
      'Western North Region': 'Western North Region',
      'Ahafo Region': 'Ahafo Region',
      'Bono East Region': 'Bono East Region',
      'North East Region': 'North East Region',
      'Savannah Region': 'Savannah Region',
      'Oti Region': 'Oti Region'
    };
    return regionMap[regionCode] || regionCode;
  };

  // Court type mapping function
  const getCourtName = (courtType) => {
    const courtMap = {
      'SC': 'Supreme Court',
      'HC': 'High Court',
      'CA': 'Court of Appeal',
      'Supreme Court': 'Supreme Court',
      'High Court': 'High Court',
      'Court of Appeal': 'Court of Appeal',
      'Circuit Court': 'Circuit Court',
      'District Court': 'District Court',
      'Commercial Court': 'Commercial Court',
      'Family Court': 'Family Court',
      'Land Court': 'Land Court'
    };
    return courtMap[courtType] || courtType;
  };

  // Enhanced search with real-time progress updates
  const performEnhancedSearch = async (searchQuery) => {
    setLoading(true);
    setError(null);
    setSearchProgress(0);
    setSearchStats({ totalResults: 0, searchTime: 0, courtsSearched: 0, totalCourts: 0 });

    const courts = [
      'Supreme Court',
      'Court of Appeal', 
      'High Court - Accra',
      'High Court - Kumasi',
      'High Court - Tamale',
      'Circuit Court - Accra',
      'Circuit Court - Kumasi',
      'District Court - Accra',
      'District Court - Kumasi',
      'Commercial Court',
      'Family Court',
      'Land Court'
    ];

    const totalCourts = courts.length;
    let startTime = Date.now();

    try {
      // Simulate progressive search across courts
      for (let i = 0; i < courts.length; i++) {
        const court = courts[i];
        setCurrentSearching(court);
        setSearchStats(prev => ({ ...prev, courtsSearched: i + 1, totalCourts }));

        // Simulate API call delay for each court
        await new Promise(resolve => setTimeout(resolve, 150 + Math.random() * 200));

        // Update progress
        const progress = Math.round(((i + 1) / totalCourts) * 100);
        setSearchProgress(progress);
      }

      // Make actual API call to enhanced search endpoint
      const token = localStorage.getItem('accessToken');
      const params = new URLSearchParams({
        q: searchQuery,
        page: 1,
        limit: 50,
        sort_by: filters.sortBy,
        sort_order: filters.sortBy === 'relevance' ? 'desc' : 'asc'
      });

      const response = await fetch(`/api/enhanced-search/search?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setResults(data.results || []);
        setSearchStats(prev => ({ 
          ...prev, 
          totalResults: data.total || 0,
          searchTime: data.search_time || Math.round((Date.now() - startTime) / 1000)
        }));
      } else {
        const errorData = await response.json();
        setError(errorData.detail || 'Search failed');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
      setCurrentSearching('');
      setSearchProgress(100);
    }
  };


  // Sort and filter results
  const sortAndFilterResults = (results, filters) => {
    let filtered = [...results];

    // Apply filters

    if (filters.region !== 'all') {
      filtered = filtered.filter(result => result.region === filters.region);
    }

    if (filters.caseType !== 'all') {
      filtered = filtered.filter(result => 
        result.case_types && result.case_types.includes(filters.caseType)
      );
    }

    // Sort results
    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case 'date':
          return new Date(b.date || 0) - new Date(a.date || 0);
        case 'relevance':
          return (b.relevance_score || 0) - (a.relevance_score || 0);
        case 'name':
          return (a.title || '').localeCompare(b.title || '');
        default:
          return 0;
      }
    });

    return filtered;
  };

  // Load search results on component mount
  useEffect(() => {
    if (query.trim()) {
      performEnhancedSearch(query);
    }
  }, [query]); // eslint-disable-next-line react-hooks/exhaustive-deps

  // Handle filter changes
  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({ ...prev, [filterType]: value }));
  };

  // Apply filters
  useEffect(() => {
    if (results.length > 0) {
      const filtered = sortAndFilterResults(results, filters);
      setResults(filtered);
    }
  }, [filters]); // eslint-disable-next-line react-hooks/exhaustive-deps


  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getTimeAgo = (dateString) => {
    if (!dateString) return 'Unknown';
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={() => navigate(-1)}
                className="flex items-center text-blue-600 hover:text-blue-800 mr-4"
              >
                <ArrowLeft className="h-5 w-5 mr-1" />
                Back to Search
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Search Results</h1>
                <p className="text-sm text-gray-600">
                  Found {searchStats.totalResults} results matching "{query}"
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search Progress */}
      {loading && (
        <div className="bg-blue-50 border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                <span className="text-sm font-medium text-blue-800">
                  Searching {currentSearching}...
                </span>
              </div>
              <span className="text-sm text-blue-600">{searchProgress}%</span>
            </div>
            <div className="w-full bg-blue-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${searchProgress}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-xs text-blue-600 mt-1">
              <span>Courts searched: {searchStats.courtsSearched}/{searchStats.totalCourts}</span>
              <span>Time: {searchStats.searchTime}s</span>
            </div>
          </div>
        </div>
      )}

      {/* Filters and Controls */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <Filter className="h-4 w-4 mr-2" />
                Filter by
                <ChevronDown className="h-4 w-4 ml-2" />
              </button>
              
              <select
                value={filters.sortBy}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="relevance">Sort by Relevance</option>
                <option value="date">Sort by Date</option>
                <option value="name">Sort by Name</option>
              </select>
            </div>

            {searchStats.searchTime > 0 && (
              <div className="text-sm text-gray-600">
                Search completed in {searchStats.searchTime}s
              </div>
            )}
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Region</label>
                <select
                  value={filters.region}
                  onChange={(e) => handleFilterChange('region', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Regions</option>
                  <option value="GAR">Greater Accra Region</option>
                  <option value="ASR">Ashanti Region</option>
                  <option value="VR">Volta Region</option>
                  <option value="ER">Eastern Region</option>
                  <option value="WR">Western Region</option>
                  <option value="CR">Central Region</option>
                  <option value="NR">Northern Region</option>
                  <option value="UER">Upper East Region</option>
                  <option value="UWR">Upper West Region</option>
                  <option value="BR">Brong-Ahafo Region</option>
                  <option value="WNR">Western North Region</option>
                  <option value="AHR">Ahafo Region</option>
                  <option value="BER">Bono East Region</option>
                  <option value="NER">North East Region</option>
                  <option value="SR">Savannah Region</option>
                  <option value="OR">Oti Region</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Court Type</label>
                <select
                  value={filters.caseType}
                  onChange={(e) => handleFilterChange('caseType', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Court Types</option>
                  <option value="Supreme Court">Supreme Court</option>
                  <option value="High Court">High Court</option>
                  <option value="Court of Appeal">Court of Appeal</option>
                  <option value="Circuit Court">Circuit Court</option>
                  <option value="District Court">District Court</option>
                  <option value="Commercial Court">Commercial Court</option>
                  <option value="Family Court">Family Court</option>
                  <option value="Land Court">Land Court</option>
                </select>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Results */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Searching through court records...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600 mb-2">Error loading search results</p>
            <p className="text-gray-600">{error}</p>
          </div>
        ) : results.length === 0 ? (
          <div className="text-center py-12">
            <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-2">No results found</p>
            <p className="text-gray-500">Try adjusting your search terms or filters</p>
          </div>
        ) : (
          <div className="space-y-4">
            {results.map((result, index) => (
              <div key={result.id || index} className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    {/* Profile Icon */}
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                        {result.type === 'person' ? (
                          <Users className="h-6 w-6 text-gray-600" />
                        ) : result.type === 'bank' ? (
                          <Building2 className="h-6 w-6 text-gray-600" />
                        ) : result.type === 'insurance' ? (
                          <ShieldCheck className="h-6 w-6 text-gray-600" />
                        ) : (
                          <Scale className="h-6 w-6 text-gray-600" />
                        )}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 
                            className="text-lg font-semibold text-gray-900 mb-1 cursor-pointer hover:text-blue-600 transition-colors"
                            onClick={() => {
                              if (result.type === 'person') {
                                navigate(`/person-profile/${result.id}?search=${encodeURIComponent(query)}`);
                              } else if (result.type === 'bank') {
                                navigate(`/bank-detail?id=${result.id}&name=${encodeURIComponent(result.name)}`);
                              } else if (result.type === 'insurance') {
                                navigate(`/insurance-detail?id=${result.id}&name=${encodeURIComponent(result.name)}`);
                              } else {
                                navigate(`/case-details?id=${result.id}`);
                              }
                            }}
                          >
                            {result.title || result.full_name || result.name}
                          </h3>
                          


                          <p className="text-gray-700 mb-3 line-clamp-2">
                            {result.case_summary || result.description || result.notes || 'No description available'}
                          </p>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                              <span className="flex items-center">
                                <Clock className="h-4 w-4 mr-1" />
                                {getTimeAgo(result.updated_at || result.created_at)}
                              </span>
                              {result.region && (
                                <span className="flex items-center">
                                  <MapPin className="h-4 w-4 mr-1" />
                                  {getRegionName(result.region)}
                                </span>
                              )}
                              {result.court_type && (
                                <span className="flex items-center">
                                  <Scale className="h-4 w-4 mr-1" />
                                  {getCourtName(result.court_type)}
                                </span>
                              )}
                            </div>

                            <button
                              onClick={() => {
                                if (result.type === 'person') {
                                  // Navigate to person profile with search query to show related cases
                                  navigate(`/person-profile/${result.id}?search=${encodeURIComponent(query)}`);
                                } else if (result.type === 'bank') {
                                  navigate(`/bank-detail?id=${result.id}&name=${encodeURIComponent(result.name)}`);
                                } else if (result.type === 'insurance') {
                                  navigate(`/insurance-detail?id=${result.id}&name=${encodeURIComponent(result.name)}`);
                                } else {
                                  navigate(`/case-details?id=${result.id}`);
                                }
                              }}
                              className="flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium"
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              Click to view details
                            </button>
                          </div>
                        </div>

                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EnhancedSearchResults;
