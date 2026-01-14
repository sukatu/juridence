import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Search, User, Building2, Shield, Building, MapPin, Phone, Globe, Star, ChevronRight, Eye } from 'lucide-react';

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalResults, setTotalResults] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchStats, setSearchStats] = useState(null);
  const [searchProgress, setSearchProgress] = useState(0);
  const [currentSearching, setCurrentSearching] = useState('');
  const [searchTime, setSearchTime] = useState(0);

  const query = searchParams.get('search') || '';

  useEffect(() => {
    if (query) {
      loadSearchResults();
    }
  }, [query, currentPage]);

  const loadSearchResults = async () => {
    setLoading(true);
    setError(null);
    setSearchProgress(0);
    setCurrentSearching('');
    
    const startTime = Date.now();
    
    try {
      // Simulate progressive search across entity types
      const searchSteps = [
        { name: 'People', progress: 25 },
        { name: 'Banks', progress: 50 },
        { name: 'Insurance', progress: 75 },
        { name: 'Companies', progress: 100 }
      ];

      for (const step of searchSteps) {
        setCurrentSearching(step.name);
        setSearchProgress(step.progress);
        
        // Simulate search delay for each entity type
        await new Promise(resolve => setTimeout(resolve, 200 + Math.random() * 300));
      }

      // Make actual API call
      const response = await fetch(`/api/search/unified?query=${encodeURIComponent(query)}&page=${currentPage}&limit=1000`);
      
      if (response.ok) {
        const data = await response.json();
        setResults(data.results || []);
        setTotalResults(data.total || 0);
        setTotalPages(data.total_pages || 1);
        setSearchStats(data.search_stats || null);
        setSearchTime(Math.round((Date.now() - startTime) / 1000));
      } else {
        setError('Failed to load search results');
      }
    } catch (err) {
      setError('Error loading search results');
      console.error('Search error:', err);
    } finally {
      setLoading(false);
      setCurrentSearching('');
      setSearchProgress(100);
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  const handleResultClick = (result) => {
    // Route to appropriate entity type based on result type
    switch (result.type) {
      case 'people':
        navigate(`/person-profile/${result.id}?search=${encodeURIComponent(query)}`);
        break;
      case 'banks':
        navigate(`/bank-detail/${result.id}`);
        break;
      case 'insurance':
        navigate(`/insurance-profile/${result.id}`);
        break;
      case 'companies':
        navigate(`/company-profile/${result.id}`);
        break;
      default:
        // Unknown entity type - could add handling here if needed
    }
  };

  const getEntityIcon = (type) => {
    switch (type) {
      case 'people':
        return <User className="h-6 w-6 text-blue-500" />;
      case 'banks':
        return <Building2 className="h-6 w-6 text-green-500" />;
      case 'insurance':
        return <Shield className="h-6 w-6 text-purple-500" />;
      case 'companies':
        return <Building className="h-6 w-6 text-orange-500" />;
      default:
        return <Search className="h-6 w-6 text-gray-500" />;
    }
  };

  const getEntityTypeLabel = (type) => {
    switch (type) {
      case 'people':
        return 'Person';
      case 'banks':
        return 'Bank';
      case 'insurance':
        return 'Insurance';
      case 'companies':
        return 'Company';
      default:
        return 'Unknown';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="max-w-md mx-auto">
              <div className="flex items-center gap-3 mb-4">
                <Search className="h-8 w-8 text-brand-500" />
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                  Searching Database
                </h1>
              </div>
              
              <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      {currentSearching ? `Searching ${currentSearching}...` : 'Initializing search...'}
                    </span>
                    <span className="text-sm text-slate-500 dark:text-slate-400">
                      {searchProgress}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                    <div 
                      className="bg-brand-500 h-2 rounded-full transition-all duration-300 ease-out"
                      style={{ width: `${searchProgress}%` }}
                    ></div>
                  </div>
                </div>
                
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Searching through people, banks, insurance companies, and businesses...
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Search className="h-8 w-8 text-brand-500" />
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                Search Results
              </h1>
            </div>
            {searchTime > 0 && (
              <div className="text-sm text-slate-500 dark:text-slate-400">
                Search completed in {searchTime}s
              </div>
            )}
          </div>
          
          {query && (
            <div className="text-slate-600 dark:text-slate-400">
              <p className="text-lg">
                Found <span className="font-semibold text-slate-900 dark:text-white">{totalResults}</span> results 
                for "<span className="font-semibold text-slate-900 dark:text-white">{query}</span>"
              </p>
              {searchStats && (
                <div className="flex gap-4 mt-2 text-sm">
                  {searchStats.people_count > 0 && (
                    <span className="flex items-center gap-1">
                      <User className="h-4 w-4 text-blue-500" />
                      {searchStats.people_count} people
                    </span>
                  )}
                  {searchStats.banks_count > 0 && (
                    <span className="flex items-center gap-1">
                      <Building2 className="h-4 w-4 text-green-500" />
                      {searchStats.banks_count} banks
                    </span>
                  )}
                  {searchStats.insurance_count > 0 && (
                    <span className="flex items-center gap-1">
                      <Shield className="h-4 w-4 text-purple-500" />
                      {searchStats.insurance_count} insurance
                    </span>
                  )}
                  {searchStats.companies_count > 0 && (
                    <span className="flex items-center gap-1">
                      <Building className="h-4 w-4 text-orange-500" />
                      {searchStats.companies_count} companies
                    </span>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
            <p className="text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        {/* Results */}
        {results.length > 0 ? (
          <div className="grid gap-4">
            {results.map((result, index) => (
              <div
                key={`${result.type}-${result.id}-${index}`}
                onClick={() => handleResultClick(result)}
                className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-4 hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  {/* Entity Icon/Logo */}
                  <div className="flex-shrink-0">
                    {result.logo_url ? (
                      <img
                        src={`/api${result.logo_url}`}
                        alt={`${result.name} logo`}
                        className="h-12 w-12 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="h-12 w-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                        {getEntityIcon(result.type)}
                      </div>
                    )}
                  </div>

                  {/* Entity Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                            {result.name}
                          </h3>
                          <span className="text-xs text-slate-500 dark:text-slate-400">
                            ({getEntityTypeLabel(result.type)})
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                        <Eye className="h-4 w-4" />
                        <span>Click to view details</span>
                      </div>
                    </div>

                    {/* Statistics for People */}
                    {result.type === 'people' && result.additional_info && (
                      <div className="flex items-center gap-4 mt-2">
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <span className="text-sm text-slate-700 dark:text-slate-300">
                            Total Cases: {result.additional_info.total_cases || result.additional_info.case_count || 0}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-sm text-slate-700 dark:text-slate-300">
                            Resolved: {result.additional_info.resolved_cases || 0}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                          <span className="text-sm text-slate-700 dark:text-slate-300">
                            Unresolved: {result.additional_info.unresolved_cases || 0}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                          <span className="text-sm text-slate-700 dark:text-slate-300">
                            Outcome: {result.additional_info.case_outcome || 'Mixed'}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Additional Info for other entity types */}
                    {result.type !== 'people' && (
                      <div className="mt-2">
                        {result.description && (
                          <p className="text-sm text-slate-600 dark:text-slate-400">
                            {result.description}
                          </p>
                        )}
                        {(result.city || result.region) && (
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            📍 {result.city && result.region ? `${result.city}, ${result.region}` : result.city || result.region}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : !loading && (
          <div className="text-center py-12">
            <Search className="h-16 w-16 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
              No results found
            </h3>
            <p className="text-slate-600 dark:text-slate-400">
              Try adjusting your search terms or browse our database.
            </p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8 flex justify-center">
            <nav className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-2 text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i + 1}
                  onClick={() => handlePageChange(i + 1)}
                  className={`px-3 py-2 text-sm font-medium rounded-lg ${
                    currentPage === i + 1
                      ? 'bg-brand-500 text-white'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-2 text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </nav>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchResults;
