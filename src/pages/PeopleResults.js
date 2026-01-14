import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Search, ArrowLeft, Eye, X, FileText, Calendar, MapPin, Tag, User } from 'lucide-react';
import { apiGet } from '../utils/api';

const PeopleResults = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);
  const [totalPages, setTotalPages] = useState(0);
  const [totalResults, setTotalResults] = useState(0);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportDetails, setReportDetails] = useState(null);
  const [loadingReport, setLoadingReport] = useState(false);

  // Set search query from URL params
  useEffect(() => {
    const firstName = searchParams.get('first_name') || '';
    const lastName = searchParams.get('last_name') || '';
    const query = searchParams.get('query') || '';
    
    // Combine first_name and last_name if both are present
    let combinedQuery = '';
    if (firstName && lastName) {
      combinedQuery = `${firstName} ${lastName}`.trim();
    } else if (firstName) {
      combinedQuery = firstName;
    } else if (lastName) {
      combinedQuery = lastName;
    } else if (query) {
      combinedQuery = query;
    }
    
    setSearchQuery(combinedQuery);
  }, [searchParams]);

  // Perform unified search
  const performSearch = async (query, page = 1) => {
    if (!query || !query.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await apiGet(`/persons-unified-search?query=${encodeURIComponent(query)}&page=${page}&limit=${itemsPerPage}`);
      setResults(response.results || []);
      setTotalResults(response.total || 0);
      setTotalPages(response.total_pages || 0);
      setCurrentPage(response.page || 1);
    } catch (err) {
      console.error('Search error:', err);
      setError('Failed to search. Please try again.');
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  // Load search results when query changes
  useEffect(() => {
    const firstName = searchParams.get('first_name') || '';
    const lastName = searchParams.get('last_name') || '';
    const query = searchParams.get('query') || '';
    
    // Combine first_name and last_name if both are present
    let combinedQuery = '';
    if (firstName && lastName) {
      combinedQuery = `${firstName} ${lastName}`.trim();
    } else if (firstName) {
      combinedQuery = firstName;
    } else if (lastName) {
      combinedQuery = lastName;
    } else if (query) {
      combinedQuery = query;
    }
    
    if (combinedQuery) {
      performSearch(combinedQuery, currentPage);
    }
  }, [searchParams, currentPage]);

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle view report
  const handleViewReport = async (entry) => {
    setSelectedEntry(entry);
    setShowReportModal(true);
    setLoadingReport(true);
    setReportDetails(null);

    try {
      const details = await apiGet(`/persons-unified-search/${entry.source_type}/${entry.id}`);
      setReportDetails(details);
    } catch (err) {
      console.error('Error fetching report details:', err);
      setError('Failed to load report details.');
    } finally {
      setLoadingReport(false);
    }
  };

  // Get card border color based on match type
  const getCardBorderColor = (entry) => {
    if (entry.source_type === 'change_of_name') {
      if (entry.match_type === 'current_name') {
        return 'border-green-500'; // Green for current name
      } else if (entry.match_type === 'old_name') {
        return 'border-red-500'; // Red for old name
      } else if (entry.match_type === 'alias') {
        return 'border-orange-500'; // Orange for alias
      }
    }
    return 'border-slate-300'; // Default border
  };

  // Get card background color based on match type
  const getCardBgColor = (entry) => {
    if (entry.source_type === 'change_of_name') {
      if (entry.match_type === 'current_name') {
        return 'bg-green-50'; // Light green for current name
      } else if (entry.match_type === 'old_name') {
        return 'bg-red-50'; // Light red for old name
      } else if (entry.match_type === 'alias') {
        return 'bg-orange-50'; // Light orange for alias
      }
    }
    return 'bg-white'; // Default background
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    } catch {
      return dateString;
    }
  };

  // Handle search form submission
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setCurrentPage(1);
      navigate(`/people-results?query=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/people')}
                className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Search
              </button>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Search Results</h1>
                <p className="text-slate-600">
                  {loading ? 'Searching...' : `Found ${totalResults} result${totalResults !== 1 ? 's' : ''} matching '${searchQuery}'`}
                </p>
              </div>
            </div>
            {/* Search Box */}
            <form onSubmit={handleSearch} className="flex gap-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search..."
                className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Search className="h-5 w-5" />
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="rounded-lg bg-red-50 border border-red-200 p-4">
            <div className="flex items-center gap-2">
              <span className="text-red-800">{error}</span>
            </div>
          </div>
        </div>
      )}

      {/* Results */}
      {!loading && !error && (
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          {results.length === 0 ? (
            <div className="text-center py-12">
              <User className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">No results found</h3>
              <p className="text-slate-600">Try adjusting your search terms.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {results.map((entry, index) => (
                <div
                  key={`${entry.source_type}-${entry.id}-${entry.match_type || ''}-${index}`}
                  className={`rounded-lg border-2 ${getCardBorderColor(entry)} ${getCardBgColor(entry)} p-5 shadow-sm hover:shadow-md transition-shadow`}
                  style={{ minHeight: '200px', display: 'flex', flexDirection: 'column' }}
                >
                  {/* Data Source Badge */}
                  <div className="mb-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {entry.data_source}
                    </span>
                    {entry.source_type === 'change_of_name' && entry.match_type && (
                      <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        entry.match_type === 'current_name' ? 'bg-green-100 text-green-800' :
                        entry.match_type === 'old_name' ? 'bg-red-100 text-red-800' :
                        'bg-orange-100 text-orange-800'
                      }`}>
                        {entry.match_type === 'current_name' ? 'Current Name' :
                         entry.match_type === 'old_name' ? 'Old Name' :
                         'Alias'}
                      </span>
                    )}
                  </div>

                  {/* Footer with View Report button */}
                  <div className="mt-auto">
                    <button
                      onClick={() => handleViewReport(entry)}
                      className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Eye className="h-4 w-4" />
                      View Report
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Pagination */}
      {!loading && !error && totalPages > 1 && (
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div className="text-sm text-slate-600">
              Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, totalResults)} of {totalResults} results
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="px-3 py-2 text-sm font-medium text-slate-900">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">
                {reportDetails?.data_source || 'Report Details'}
              </h2>
              <button
                onClick={() => {
                  setShowReportModal(false);
                  setReportDetails(null);
                  setSelectedEntry(null);
                }}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {loadingReport ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-4 text-slate-600">Loading report details...</p>
                </div>
              ) : reportDetails ? (
                <div className="space-y-6">
                  {/* Change of Name Details */}
                  {reportDetails.source_type === 'change_of_name' && (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-slate-500 mb-1">Current Name</label>
                          <p className="text-base text-slate-900">{reportDetails.current_name || 'N/A'}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-500 mb-1">Old Name</label>
                          <p className="text-base text-slate-900">{reportDetails.old_name || 'N/A'}</p>
                        </div>
                        {reportDetails.alias_names && reportDetails.alias_names.length > 0 && (
                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-slate-500 mb-1">Alias Names</label>
                            <div className="flex flex-wrap gap-2">
                              {reportDetails.alias_names.map((alias, idx) => (
                                <span key={idx} className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-orange-100 text-orange-800">
                                  {alias}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        <div>
                          <label className="block text-sm font-medium text-slate-500 mb-1">Effective Date of Change</label>
                          <p className="text-base text-slate-900">{formatDate(reportDetails.effective_date_of_change)}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-500 mb-1">Gazette Date</label>
                          <p className="text-base text-slate-900">{formatDate(reportDetails.gazette_date)}</p>
                        </div>
                        {reportDetails.source && (
                          <div>
                            <label className="block text-sm font-medium text-slate-500 mb-1">Source</label>
                            <p className="text-base text-slate-900">{reportDetails.source}</p>
                          </div>
                        )}
                        {reportDetails.reference_number && (
                          <div>
                            <label className="block text-sm font-medium text-slate-500 mb-1">Reference Number</label>
                            <p className="text-base text-slate-900">{reportDetails.reference_number}</p>
                          </div>
                        )}
                        {reportDetails.source_details && (
                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-slate-500 mb-1">Source Details</label>
                            <p className="text-base text-slate-900">{reportDetails.source_details}</p>
                          </div>
                        )}
                        {reportDetails.remarks && (
                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-slate-500 mb-1">Remarks</label>
                            <p className="text-base text-slate-900">{reportDetails.remarks}</p>
                          </div>
                        )}
                      </div>
                    </>
                  )}

                  {/* Correction of Place of Birth Details */}
                  {reportDetails.source_type === 'correction_of_place_of_birth' && (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-slate-500 mb-1">Person Name</label>
                          <p className="text-base text-slate-900">{reportDetails.person_name || 'N/A'}</p>
                        </div>
                        {reportDetails.alias && (
                          <div>
                            <label className="block text-sm font-medium text-slate-500 mb-1">Alias</label>
                            <p className="text-base text-slate-900">{reportDetails.alias}</p>
                          </div>
                        )}
                        <div>
                          <label className="block text-sm font-medium text-slate-500 mb-1">Old Place of Birth</label>
                          <p className="text-base text-slate-900">{reportDetails.old_place_of_birth || 'N/A'}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-500 mb-1">New Place of Birth</label>
                          <p className="text-base text-slate-900">{reportDetails.new_place_of_birth || 'N/A'}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-500 mb-1">Effective Date</label>
                          <p className="text-base text-slate-900">{formatDate(reportDetails.effective_date)}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-500 mb-1">Gazette Date</label>
                          <p className="text-base text-slate-900">{formatDate(reportDetails.gazette_date)}</p>
                        </div>
                        {reportDetails.source_details && (
                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-slate-500 mb-1">Source Details</label>
                            <p className="text-base text-slate-900">{reportDetails.source_details}</p>
                          </div>
                        )}
                      </div>
                    </>
                  )}

                  {/* Correction of Date of Birth Details */}
                  {reportDetails.source_type === 'correction_of_date_of_birth' && (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-slate-500 mb-1">Person Name</label>
                          <p className="text-base text-slate-900">{reportDetails.person_name || 'N/A'}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-500 mb-1">Old Date of Birth</label>
                          <p className="text-base text-slate-900">{formatDate(reportDetails.old_date_of_birth)}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-500 mb-1">New Date of Birth</label>
                          <p className="text-base text-slate-900">{formatDate(reportDetails.new_date_of_birth)}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-500 mb-1">Effective Date</label>
                          <p className="text-base text-slate-900">{formatDate(reportDetails.effective_date)}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-500 mb-1">Gazette Date</label>
                          <p className="text-base text-slate-900">{formatDate(reportDetails.gazette_date)}</p>
                        </div>
                        {reportDetails.source_details && (
                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-slate-500 mb-1">Source Details</label>
                            <p className="text-base text-slate-900">{reportDetails.source_details}</p>
                          </div>
                        )}
                      </div>
                    </>
                  )}

                  {/* Marriage Officer Details */}
                  {reportDetails.source_type === 'marriage_officer' && (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-slate-500 mb-1">Officer Name</label>
                          <p className="text-base text-slate-900">{reportDetails.officer_name || 'N/A'}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-500 mb-1">Church</label>
                          <p className="text-base text-slate-900">{reportDetails.church || 'N/A'}</p>
                        </div>
                        {reportDetails.location && (
                          <div>
                            <label className="block text-sm font-medium text-slate-500 mb-1">Location</label>
                            <p className="text-base text-slate-900">{reportDetails.location}</p>
                          </div>
                        )}
                        {reportDetails.appointing_authority && (
                          <div>
                            <label className="block text-sm font-medium text-slate-500 mb-1">Appointing Authority</label>
                            <p className="text-base text-slate-900">{reportDetails.appointing_authority}</p>
                          </div>
                        )}
                        {reportDetails.appointing_authority_title && (
                          <div>
                            <label className="block text-sm font-medium text-slate-500 mb-1">Appointing Authority Title</label>
                            <p className="text-base text-slate-900">{reportDetails.appointing_authority_title}</p>
                          </div>
                        )}
                        {reportDetails.appointment_date && (
                          <div>
                            <label className="block text-sm font-medium text-slate-500 mb-1">Appointment Date</label>
                            <p className="text-base text-slate-900">{formatDate(reportDetails.appointment_date)}</p>
                          </div>
                        )}
                        <div>
                          <label className="block text-sm font-medium text-slate-500 mb-1">Gazette Date</label>
                          <p className="text-base text-slate-900">{formatDate(reportDetails.gazette_date)}</p>
                        </div>
                        {reportDetails.source_details && (
                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-slate-500 mb-1">Source Details</label>
                            <p className="text-base text-slate-900">{reportDetails.source_details}</p>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-slate-600">No details available.</p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => {
                  setShowReportModal(false);
                  setReportDetails(null);
                  setSelectedEntry(null);
                }}
                className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PeopleResults;
