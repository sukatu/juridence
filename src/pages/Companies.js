import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Search, AlertTriangle, ChevronLeft, ChevronRight, ArrowLeft, Phone, Mail } from 'lucide-react';

const Companies = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const searchRef = useRef(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(9);
  const [companiesData, setCompaniesData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [totalResults, setTotalResults] = useState(0);

  // Company logo mapping
  const companyLogoMap = {
    'MTN Ghana Limited': '/companies/mtn-ghana.svg',
    'Vodafone Ghana Limited': '/companies/vodafone-ghana.svg',
    'Gold Fields Ghana Limited': '/companies/goldfields-ghana.svg',
    'AngloGold Ashanti Ghana Limited': '/companies/anglogold-ashanti-ghana.svg',
    'Access Bank Ghana Limited': '/companies/access-bank-ghana.svg',
    'Ecobank Ghana Limited': '/companies/ecobank-ghana.svg',
    'Newmont Ghana Gold Limited': '/companies/newmont-ghana.svg',
    // Bank logos (keeping existing ones)
    'GCB Bank Limited': '/banks/gcb bank.jpeg',
    'Standard Chartered Bank Ghana': '/banks/stanchart.jpeg',
    'Absa Bank Ghana': '/banks/absa.jpeg',
    'Fidelity Bank Ghana': '/banks/Fidelity.jpeg',
    'Zenith Bank Ghana': '/banks/zenith.jpeg',
    'First Atlantic Bank': '/banks/first atlantic.jpeg',
    'Ghana Exim Bank': '/banks/ghana exim bank.jpeg',
    'GTBank Ghana': '/banks/gtbank.jpeg',
    'National Investment Bank': '/banks/national invenstment bank.jpeg',
    'Prudential Bank': '/banks/prudential bank.jpeg',
    'Republic Bank Ghana': '/banks/republic bank.jpeg',
    'Societe Generale Bank Ghana': '/banks/societe generale bank.jpeg',
    'The Royal Bank': '/banks/the royal bank.jpeg',
    'Universal Merchant Bank': '/banks/universal merchant bank.jpeg',
    'FBN Bank Ghana': '/banks/fbn.jpeg',
    'Agricultural Development Bank': '/banks/adb.jpeg',
    'Bank of Africa Ghana': '/banks/bank of africa.jpeg',
    'Bank of Ghana': '/banks/Bank of ghana.jpeg',
    'CAL Bank': '/banks/calbank.jpeg',
    'Consolidated Bank Ghana': '/banks/cbg.jpeg',
    'Stanbic Bank Ghana': '/banks/stanbic bank.jpeg',
    'UMB Bank Ghana': '/banks/umb.jpeg'
  };

  // Load companies data from API
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('accessToken');
      setIsAuthenticated(!!token);
      return !!token;
    };

    if (checkAuth()) {
      const hasSearchOrFilter = searchTerm || filterStatus !== 'all';
      loadCompaniesData(hasSearchOrFilter);
    } else {
      setIsLoading(false);
      setSearchLoading(false);
    }
  }, [currentPage, itemsPerPage, searchTerm, filterStatus]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadCompaniesData = async (isSearch = false) => {
    try {
      if (isSearch) {
        setSearchLoading(true);
      } else {
        setIsLoading(true);
      }
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString()
      });

      if (searchTerm) {
        params.append('query', searchTerm);
      }

      const response = await fetch(`/api/companies/search?${params}`, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        
        // Load case statistics and analytics for each company
        const companiesWithStats = await Promise.all(
          (data.results || []).map(async (company) => {
            try {
              // Fetch both case statistics and analytics for this company
              const [statsResponse, analyticsResponse] = await Promise.all([
                fetch(`/api/companies/${company.id}/case-statistics`, {
                  headers: { 'Content-Type': 'application/json' }
                }),
                fetch(`/api/companies/${company.id}/analytics`, {
                  headers: { 'Content-Type': 'application/json' }
                })
              ]);
              
              let caseStats = {
                total_cases: 0,
                resolved_cases: 0,
                unresolved_cases: 0,
                favorable_cases: 0,
                unfavorable_cases: 0,
                mixed_cases: 0,
                case_outcome: 'N/A'
              };
              
              let analytics = {
                risk_level: 'Low',
                risk_score: 0,
                risk_factors: [],
                financial_risk_level: 'Low'
              };
              
              if (statsResponse.ok) {
                const statsData = await statsResponse.json();
                caseStats = statsData.case_statistics_available ? statsData : caseStats;
              }
              
              if (analyticsResponse.ok) {
                const analyticsData = await analyticsResponse.json();
                analytics = analyticsData.analytics_available ? analyticsData : analytics;
              }
              
              return {
                id: company.id,
                name: String(company.name || 'N/A'),
                shortName: String(company.short_name || 'N/A'),
                industry: String(company.industry || 'N/A'),
                phone: String(company.phone || 'N/A'),
                email: String(company.email || 'N/A'),
                address: String(company.address || 'N/A'),
                website: String(company.website || 'N/A'),
                established: company.established_date ? new Date(company.established_date).getFullYear().toString() : 'N/A',
                companyType: String(company.company_type || 'N/A'),
                logo: company.logo_url || companyLogoMap[company.name] || '/companies/default-company.svg',
                lastActivity: company.updated_at ? new Date(company.updated_at).toISOString().split('T')[0] : 'N/A',
                ...caseStats,
                ...analytics
              };
            } catch (error) {
              console.error(`Error loading data for company ${company.name}:`, error);
              return {
                id: company.id,
                name: String(company.name || 'N/A'),
                shortName: String(company.short_name || 'N/A'),
                industry: String(company.industry || 'N/A'),
                phone: String(company.phone || 'N/A'),
                email: String(company.email || 'N/A'),
                address: String(company.address || 'N/A'),
                website: String(company.website || 'N/A'),
                established: company.established_date ? new Date(company.established_date).getFullYear().toString() : 'N/A',
                companyType: String(company.company_type || 'N/A'),
                logo: company.logo_url || companyLogoMap[company.name] || '/companies/default-company.svg',
                lastActivity: company.updated_at ? new Date(company.updated_at).toISOString().split('T')[0] : 'N/A',
                total_cases: 0,
                resolved_cases: 0,
                unresolved_cases: 0,
                favorable_cases: 0,
                unfavorable_cases: 0,
                mixed_cases: 0,
                case_outcome: 'N/A',
                risk_level: 'Low',
                risk_score: 0,
                risk_factors: [],
                financial_risk_level: 'Low'
              };
            }
          })
        );

        setCompaniesData(companiesWithStats);
        setTotalResults(data.total || 0);
      } else {
        console.error('Failed to load companies data:', response.status);
      }
    } catch (error) {
      console.error('Error loading companies data:', error);
    } finally {
      if (isSearch) {
        setSearchLoading(false);
      } else {
        setIsLoading(false);
      }
    }
  };

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    const hasSearchOrFilter = searchTerm || filterStatus !== 'all';
    loadCompaniesData(hasSearchOrFilter);
  };

  // Handle company click
  const handleCompanyClick = (company) => {
    navigate(`/company-profile/${company.id}?name=${encodeURIComponent(company.name)}`);
  };

  // Filter and sort companies
  const filteredCompanies = companiesData.filter(company => {
    if (filterStatus === 'all') return true;
    return company.risk_level === filterStatus;
  });

  // Pagination
  const totalPagesCount = Math.ceil(totalResults / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;

  // Early return for loading state (only on initial load, not during search)
  if (isLoading && !searchLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-sky-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading companies...</p>
        </div>
      </div>
    );
  }

  // Authentication check
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-4">
            <AlertTriangle className="h-16 w-16 mx-auto mb-4" />
            <h2 className="text-2xl font-bold">Authentication Required</h2>
            <p className="text-gray-600 mt-2">Please log in to view companies data</p>
          </div>
          <button
            onClick={() => navigate('/login')}
            className="bg-sky-600 text-white px-6 py-2 rounded-lg hover:bg-sky-700 transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Companies</h1>
              <p className="text-gray-600 mt-1">
                {totalResults} companies found
              </p>
            </div>
            <button
              onClick={() => navigate('/')}
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-5 w-5 mr-1" />
              Back to Home
            </button>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <form onSubmit={handleSearch} className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search companies..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                ref={searchRef}
              />
              {searchLoading && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-sky-500"></div>
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              >
                <option value="all">All Risk Levels</option>
                <option value="Low">Low Risk</option>
                <option value="Medium">Medium Risk</option>
                <option value="High">High Risk</option>
              </select>
              <button
                type="submit"
                className="px-6 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors flex items-center"
              >
                <Search className="h-4 w-4 mr-2" />
                Search
              </button>
            </div>
          </form>
      </div>

      {/* Companies Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCompanies.map((company) => (
            <div
              key={company.id}
              onClick={() => handleCompanyClick(company)}
              className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <img
                    src={company.logo}
                    alt={company.name}
                    className="h-12 w-12 rounded-lg object-cover mr-4"
                    onError={(e) => {
                      e.target.src = '/companies/default-company.svg';
                    }}
                  />
                <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">{company.name}</h3>
                    <p className="text-sm text-gray-600">{company.established}</p>
                </div>
                  <div className="text-right">
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                      company.risk_level === 'Low' ? 'bg-green-100 text-green-800' :
                      company.risk_level === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {company.risk_level} Risk
                    </div>
                    {company.risk_score > 0 && (
                      <div className="text-xs text-gray-500 mt-1">
                        Score: {company.risk_score}/100
                      </div>
                    )}
                  </div>
              </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <Building2 className="h-4 w-4 mr-2" />
                    {company.industry}
                </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Phone className="h-4 w-4 mr-2" />
                    {company.phone}
                </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Mail className="h-4 w-4 mr-2" />
                    {company.email}
                </div>
              </div>

                {/* Quick Stats */}
                <div className="border-t pt-4">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-gray-600">Total Cases:</span>
                      <span className="font-semibold text-gray-900">{company.total_cases || 0}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-gray-600">Resolved:</span>
                      <span className="font-semibold text-green-600">{company.resolved_cases || 0}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      <span className="text-gray-600">Unresolved:</span>
                      <span className="font-semibold text-red-600">{company.unresolved_cases || 0}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <span className="text-gray-600">Outcome:</span>
                      <span className="font-semibold text-purple-600">{company.case_outcome || 'N/A'}</span>
                    </div>
                  </div>
                  
                  {/* Risk Assessment Details */}
                  {company.risk_score > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
                        <span>Risk Assessment</span>
                        <span className="font-medium">{company.risk_score}/100</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div 
                          className={`h-1.5 rounded-full ${
                            company.risk_score <= 30 ? 'bg-green-500' :
                            company.risk_score <= 60 ? 'bg-yellow-500' :
                            'bg-red-500'
                          }`}
                          style={{ width: `${Math.min(company.risk_score, 100)}%` }}
                        ></div>
                      </div>
                      {company.risk_factors && company.risk_factors.length > 0 && (
                        <div className="mt-2 text-xs text-gray-500">
                          <span className="font-medium">Key Risks:</span> {company.risk_factors.slice(0, 2).join(', ')}
                          {company.risk_factors.length > 2 && '...'}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* No Results */}
        {filteredCompanies.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <Building2 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No companies found</h3>
            <p className="text-gray-600">Try adjusting your search or filter criteria</p>
          </div>
        )}

        {/* Pagination */}
        {totalPagesCount > 1 && (
          <div className="mt-8 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing {startIndex + 1} to {Math.min(endIndex, totalResults)} of {totalResults} companies
            </div>
            <div className="flex items-center space-x-2">
                <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                <ChevronLeft className="h-4 w-4" />
                </button>
                
              <span className="px-4 py-2 text-sm font-medium text-gray-700">
                Page {currentPage} of {totalPagesCount}
              </span>
                
                <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPagesCount))}
                disabled={currentPage === totalPagesCount}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="h-4 w-4" />
                </button>
            </div>
          </div>
        )}
        </div>
    </div>
  );
};

export default Companies;
