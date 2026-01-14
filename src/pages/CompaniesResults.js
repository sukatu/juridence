import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Building, MapPin, Phone, Globe, Star, ChevronRight, Users, DollarSign } from 'lucide-react';

const CompaniesResults = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalResults, setTotalResults] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const query = searchParams.get('search') || '';

  useEffect(() => {
    if (query) {
      loadCompanies();
    }
  }, [query, currentPage]);

  const loadCompanies = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/companies/search?query=${encodeURIComponent(query)}&page=${currentPage}&limit=20`);
      
      if (response.ok) {
        const data = await response.json();
        setCompanies(data.companies || []);
        setTotalResults(data.total || 0);
        setTotalPages(data.total_pages || 1);
      } else {
        setError('Failed to load companies');
      }
    } catch (err) {
      setError('Error loading companies');
      console.error('Companies search error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  const handleCompanyClick = (companyId) => {
    navigate(`/companies/${companyId}`);
  };

  const formatRevenue = (revenue) => {
    if (!revenue) return 'N/A';
    if (typeof revenue === 'string') return revenue;
    if (revenue >= 1000000000) {
      return `$${(revenue / 1000000000).toFixed(1)}B`;
    } else if (revenue >= 1000000) {
      return `$${(revenue / 1000000).toFixed(1)}M`;
    } else if (revenue >= 1000) {
      return `$${(revenue / 1000).toFixed(1)}K`;
    }
    return `$${revenue}`;
  };

  const formatEmployees = (employees) => {
    if (!employees) return 'N/A';
    if (typeof employees === 'string') return employees;
    if (employees >= 1000) {
      return `${(employees / 1000).toFixed(1)}K`;
    }
    return employees.toString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500 mx-auto"></div>
            <p className="mt-4 text-slate-600 dark:text-slate-400">Loading companies...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Building className="h-8 w-8 text-orange-500" />
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
              Companies Search Results
            </h1>
          </div>
          
          {query && (
            <div className="text-slate-600 dark:text-slate-400">
              <p>
                Found <span className="font-semibold text-slate-900 dark:text-white">{totalResults}</span> companies 
                for "<span className="font-semibold text-slate-900 dark:text-white">{query}</span>"
              </p>
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
        {companies.length > 0 ? (
          <div className="grid gap-6">
            {companies.map((company) => (
              <div
                key={company.id}
                onClick={() => handleCompanyClick(company.id)}
                className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6 hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="flex items-start gap-4">
                  {/* Company Logo */}
                  <div className="flex-shrink-0">
                    {company.logo_url ? (
                      <img
                        src={`/api${company.logo_url}`}
                        alt={`${company.name} logo`}
                        className="h-16 w-16 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="h-16 w-16 bg-orange-100 dark:bg-orange-900/20 rounded-lg flex items-center justify-center">
                        <Building className="h-8 w-8 text-orange-600 dark:text-orange-400" />
                      </div>
                    )}
                  </div>

                  {/* Company Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-1">
                          {company.name}
                        </h3>
                        {company.short_name && (
                          <p className="text-slate-600 dark:text-slate-400 text-sm mb-2">
                            {company.short_name}
                          </p>
                        )}
                      </div>
                      <ChevronRight className="h-5 w-5 text-slate-400 flex-shrink-0" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      {/* Basic Info */}
                      <div className="space-y-2">
                        {company.company_type && (
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Type:</span>
                            <span className="text-sm text-slate-900 dark:text-white">{company.company_type}</span>
                          </div>
                        )}
                        
                        {company.industry && (
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Industry:</span>
                            <span className="text-sm text-slate-900 dark:text-white">{company.industry}</span>
                          </div>
                        )}

                        {company.registration_number && (
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Reg. No:</span>
                            <span className="text-sm text-slate-900 dark:text-white">{company.registration_number}</span>
                          </div>
                        )}
                      </div>

                      {/* Contact & Stats Info */}
                      <div className="space-y-2">
                        {company.city && company.region && (
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-slate-400" />
                            <span className="text-sm text-slate-900 dark:text-white">
                              {company.city}, {company.region}
                            </span>
                          </div>
                        )}
                        
                        {company.phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-slate-400" />
                            <span className="text-sm text-slate-900 dark:text-white">{company.phone}</span>
                          </div>
                        )}
                        
                        {company.website && (
                          <div className="flex items-center gap-2">
                            <Globe className="h-4 w-4 text-slate-400" />
                            <a
                              href={company.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-brand-600 dark:text-brand-400 hover:underline"
                              onClick={(e) => e.stopPropagation()}
                            >
                              Website
                            </a>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Company Stats */}
                    <div className="flex flex-wrap gap-4 mt-4">
                      {company.employee_count && (
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-slate-400" />
                          <span className="text-sm text-slate-900 dark:text-white">
                            {formatEmployees(company.employee_count)} employees
                          </span>
                        </div>
                      )}
                      
                      {company.annual_revenue && (
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-slate-400" />
                          <span className="text-sm text-slate-900 dark:text-white">
                            {formatRevenue(company.annual_revenue)} revenue
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Features */}
                    <div className="flex flex-wrap gap-2 mt-4">
                      {company.is_verified && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                          Verified
                        </span>
                      )}
                      {company.is_active && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                          Active
                        </span>
                      )}
                      {company.established_date && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400">
                          Est. {new Date(company.established_date).getFullYear()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : !loading && (
          <div className="text-center py-12">
            <Building className="h-16 w-16 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
              No companies found
            </h3>
            <p className="text-slate-600 dark:text-slate-400">
              Try adjusting your search terms or browse all companies.
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

export default CompaniesResults;
