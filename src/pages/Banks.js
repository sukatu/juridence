import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Search, AlertTriangle, ChevronLeft, ChevronRight, ArrowLeft, Phone, Mail } from 'lucide-react';
import AuthGuard from '../components/AuthGuard';

const Banks = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const searchRef = useRef(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(9);
  const [banksData, setBanksData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [totalResults, setTotalResults] = useState(0);

  // Bank logo mapping
  const bankLogoMap = {
    'GCB Bank': '/banks/gcb bank.jpeg',
    'Ghana Commercial Bank': '/banks/gcb bank.jpeg',
    'Ecobank': '/banks/ecobank.jpeg',
    'Ecobank Ghana': '/banks/ecobank.jpeg',
    'Standard Chartered Bank': '/banks/stanchart.jpeg',
    'Standard Chartered Bank Ghana': '/banks/stanchart.jpeg',
    'Absa Bank': '/banks/absa.jpeg',
    'Absa Bank Ghana': '/banks/absa.jpeg',
    'Fidelity Bank': '/banks/Fidelity.jpeg',
    'Fidelity Bank Ghana': '/banks/Fidelity.jpeg',
    'Zenith Bank': '/banks/zenith.jpeg',
    'Zenith Bank Ghana': '/banks/zenith.jpeg',
    'First Atlantic Bank': '/banks/first atlantic.jpeg',
    'Ghana Exim Bank': '/banks/ghana exim bank.jpeg',
    'Ghana EXIM Bank': '/banks/ghana exim bank.jpeg',
    'GTBank': '/banks/gtbank.jpeg',
    'Guaranty Trust Bank': '/banks/gtbank.jpeg',
    'National Investment Bank': '/banks/national invenstment bank.jpeg',
    'Prudential Bank': '/banks/prudential bank.jpeg',
    'Republic Bank': '/banks/republic bank.jpeg',
    'Societe Generale Bank': '/banks/societe generale bank.jpeg',
    'The Royal Bank': '/banks/the royal bank.jpeg',
    'Universal Merchant Bank': '/banks/universal merchant bank.jpeg',
    'FBN Bank': '/banks/fbn.jpeg',
    'First Bank of Nigeria': '/banks/fbn.jpeg',
    'Access Bank': '/banks/access bank.jpeg',
    'Access Bank Ghana': '/banks/access bank.jpeg',
    'Agricultural Development Bank': '/banks/adb.jpeg',
    'Bank of Africa': '/banks/bank of africa.jpeg',
    'Bank of Ghana': '/banks/Bank of ghana.jpeg',
    'CAL Bank': '/banks/calbank.jpeg',
    'Consolidated Bank Ghana': '/banks/cbg.jpeg',
    'NIB Bank': '/banks/nib.jpeg',
    'Omnibsic Bank': '/banks/omnibsic.jpeg',
    'Stanbic Bank': '/banks/stanbic bank.jpeg',
    'Stanbic Bank Ghana': '/banks/stanbic bank.jpeg',
    'UMB Bank': '/banks/umb.jpeg',
    'ABII National Bank': '/banks/abii national.jpeg'
  };

  // Load banks data from API
  useEffect(() => {
    const hasSearchOrFilter = searchTerm || filterStatus !== 'all';
    loadBanksData(hasSearchOrFilter);
  }, [currentPage, itemsPerPage, searchTerm, filterStatus]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadBanksData = async (isSearch = false) => {
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
        params.append('name', searchTerm);
      }

      const response = await fetch(`/api/banks/search?${params}`, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        
        // Load case statistics and analytics for each bank
        const banksWithStats = await Promise.all(
          (data.banks || []).map(async (bank) => {
            try {
              // Fetch both case statistics and analytics for this bank
              const [statsResponse, analyticsResponse] = await Promise.all([
                fetch(`/api/banks/${bank.id}/case-statistics`, {
                  headers: { 'Content-Type': 'application/json' }
                }),
                fetch(`/api/banks/${bank.id}/analytics`, {
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
                caseStats = statsData.statistics_available ? statsData : caseStats;
              }
              
              if (analyticsResponse.ok) {
                const analyticsData = await analyticsResponse.json();
                analytics = analyticsData.analytics_available ? analyticsData : analytics;
              }
              
              return {
                id: bank.id,
                name: bank.name,
                logo: bank.logo_url || bankLogoMap[bank.name] || '/banks/default-bank.jpeg',
                phone: bank.phone || 'N/A',
                email: bank.email || 'N/A',
                address: bank.address || 'N/A',
                website: bank.website || 'N/A',
                established: bank.established_date ? new Date(bank.established_date).getFullYear().toString() : 'N/A',
                lastActivity: bank.updated_at ? new Date(bank.updated_at).toISOString().split('T')[0] : 'N/A',
                ...caseStats,
                ...analytics
              };
            } catch (error) {
              console.error(`Error loading data for bank ${bank.name}:`, error);
              return {
                id: bank.id,
                name: bank.name,
                logo: bank.logo_url || bankLogoMap[bank.name] || '/banks/default-bank.jpeg',
                phone: bank.phone || 'N/A',
                email: bank.email || 'N/A',
                address: bank.address || 'N/A',
                website: bank.website || 'N/A',
                established: bank.established_date ? new Date(bank.established_date).getFullYear().toString() : 'N/A',
                lastActivity: bank.updated_at ? new Date(bank.updated_at).toISOString().split('T')[0] : 'N/A',
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

        setBanksData(banksWithStats);
        // setTotalPages(data.total_pages || 0);
        setTotalResults(data.total || 0);
      } else {
        console.error('Failed to load banks data:', response.status);
      }
    } catch (error) {
      console.error('Error loading banks data:', error);
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
    loadBanksData(hasSearchOrFilter);
  };

  // Handle bank click
  const handleBankClick = (bank) => {
    navigate(`/bank-detail/${bank.id}`);
  };

  // Filter and sort banks
  const filteredBanks = banksData.filter(bank => {
    if (filterStatus === 'all') return true;
    return bank.risk_level === filterStatus;
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
          <p className="mt-4 text-slate-600">Loading banks...</p>
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
            <p className="text-gray-600 mt-2">Please log in to view banks data</p>
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
    <AuthGuard>
      <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Banks</h1>
              <p className="text-gray-600 mt-1">
                {totalResults} banks found
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
                placeholder="Search banks..."
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

      {/* Banks Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBanks.map((bank) => (
            <div
              key={bank.id}
              onClick={() => handleBankClick(bank)}
              className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <img
                    src={bank.logo}
                    alt={bank.name}
                    className="h-12 w-12 rounded-lg object-cover mr-4"
                    onError={(e) => {
                      e.target.src = '/banks/default-bank.jpeg';
                    }}
                  />
                <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">{bank.name}</h3>
                    <p className="text-sm text-gray-600">{bank.established}</p>
                </div>
                  <div className="text-right">
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                      bank.risk_level === 'Low' ? 'bg-green-100 text-green-800' :
                      bank.risk_level === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {bank.risk_level} Risk
                    </div>
                    {bank.risk_score > 0 && (
                      <div className="text-xs text-gray-500 mt-1">
                        Score: {bank.risk_score}/100
                      </div>
                    )}
                  </div>
              </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <Phone className="h-4 w-4 mr-2" />
                    {bank.phone}
                </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Mail className="h-4 w-4 mr-2" />
                    {bank.email}
                </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Building2 className="h-4 w-4 mr-2" />
                    {bank.address}
                </div>
              </div>

                {/* Quick Stats */}
                <div className="border-t pt-4">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-gray-600">Total Cases:</span>
                      <span className="font-semibold text-gray-900">{bank.total_cases || 0}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-gray-600">Resolved:</span>
                      <span className="font-semibold text-green-600">{bank.resolved_cases || 0}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      <span className="text-gray-600">Unresolved:</span>
                      <span className="font-semibold text-red-600">{bank.unresolved_cases || 0}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <span className="text-gray-600">Outcome:</span>
                      <span className="font-semibold text-purple-600">{bank.case_outcome || 'N/A'}</span>
                    </div>
                  </div>
                  
                  {/* Risk Assessment Details */}
                  {bank.risk_score > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
                        <span>Risk Assessment</span>
                        <span className="font-medium">{bank.risk_score}/100</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div 
                          className={`h-1.5 rounded-full ${
                            bank.risk_score <= 30 ? 'bg-green-500' :
                            bank.risk_score <= 60 ? 'bg-yellow-500' :
                            'bg-red-500'
                          }`}
                          style={{ width: `${Math.min(bank.risk_score, 100)}%` }}
                        ></div>
                      </div>
                      {bank.risk_factors && bank.risk_factors.length > 0 && (
                        <div className="mt-2 text-xs text-gray-500">
                          <span className="font-medium">Key Risks:</span> {bank.risk_factors.slice(0, 2).join(', ')}
                          {bank.risk_factors.length > 2 && '...'}
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
        {filteredBanks.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <Building2 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No banks found</h3>
            <p className="text-gray-600">Try adjusting your search or filter criteria</p>
          </div>
        )}

        {/* Pagination */}
        {totalPagesCount > 1 && (
          <div className="mt-8 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing {startIndex + 1} to {Math.min(endIndex, totalResults)} of {totalResults} banks
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
    </AuthGuard>
  );
};

export default Banks;
