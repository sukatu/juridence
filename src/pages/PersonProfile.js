import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Star, User, Calendar, Mail, Building2, Phone, Shield, Clock, Users, GraduationCap, Heart, AlertCircle, CheckCircle, XCircle, Eye, EyeOff, Search, Filter, ArrowUpDown, Scale, RefreshCw, ChevronLeft, ChevronRight, DollarSign, Percent, BookOpen, Calculator, AlertTriangle, History, FileText } from 'lucide-react';
import RequestDetailsModal from '../components/RequestDetailsModal';
import GazetteSearch from '../components/GazetteSearch';

const PersonProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('search') || '';
  
  const [personData, setPersonData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [relatedCases, setRelatedCases] = useState([]);
  const [filteredCases, setFilteredCases] = useState([]);
  const [caseSearchQuery, setCaseSearchQuery] = useState('');
  const [caseSortBy, setCaseSortBy] = useState('date');
  const [caseSortOrder, setCaseSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [casesPerPage] = useState(10);
  const [analytics, setAnalytics] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [caseStats, setCaseStats] = useState(null);
  const [caseStatsLoading, setCaseStatsLoading] = useState(true);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectedCase, setSelectedCase] = useState(null);
  const [showProfileRequestModal, setShowProfileRequestModal] = useState(false);
  const [gazetteData, setGazetteData] = useState([]);
  const [gazetteLoading, setGazetteLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('cases'); // 'cases' or 'names'

  // Court name mapping function
  const getCourtFullName = (courtCode) => {
    const courtMap = {
      'SC': 'Supreme Court',
      'CA': 'Court of Appeal',
      'HC': 'High Court',
      'DC': 'District Court',
      'MC': 'Magistrate Court',
      'CC': 'Circuit Court',
      'FC': 'Family Court',
      'LC': 'Labour Court',
      'TC': 'Tribunal Court',
      'sc': 'Supreme Court',
      'ca': 'Court of Appeal',
      'hc': 'High Court',
      'dc': 'District Court',
      'mc': 'Magistrate Court',
      'cc': 'Circuit Court',
      'fc': 'Family Court',
      'lc': 'Labour Court',
      'tc': 'Tribunal Court',
      'Supreme Court': 'Supreme Court',
      'Court of Appeal': 'Court of Appeal',
      'High Court': 'High Court',
      'District Court': 'District Court',
      'Magistrate Court': 'Magistrate Court',
      'Circuit Court': 'Circuit Court',
      'Family Court': 'Family Court',
      'Labour Court': 'Labour Court',
      'Tribunal Court': 'Tribunal Court'
    };
    return courtMap[courtCode] || courtCode;
  };

  // Human-readable date formatting function
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    // If date is within the last 30 days, show relative format
    if (diffDays <= 30) {
      if (diffDays === 0) return 'Today';
      if (diffDays === 1) return 'Yesterday';
      if (diffDays < 7) return `${diffDays} days ago`;
      if (diffDays < 14) return '1 week ago';
      if (diffDays < 21) return '2 weeks ago';
      if (diffDays < 28) return '3 weeks ago';
      return '1 month ago';
    }
    
    // For older dates, show full date
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  // Load gazette data for the person
  const loadGazetteData = async (personId) => {
    try {
      setGazetteLoading(true);
      const response = await fetch(`/api/gazette/person/${personId}`, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setGazetteData(data.gazettes || []);
      } else {
        setGazetteData([]);
      }
    } catch (error) {
      console.error('Error loading gazette data:', error);
      setGazetteData([]);
    } finally {
      setGazetteLoading(false);
    }
  };

  // Load person data
  useEffect(() => {
    const loadPersonData = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem('accessToken') || 'test-token-123';
        
        const response = await fetch(`/api/people/${id}`, {
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          setPersonData(data);
          // Load gazette data for this person
          loadGazetteData(data.id);
        } else {
          // Fallback to mock data
          setPersonData({
            id: id,
            full_name: searchQuery || 'Unknown Person',
            occupation: 'N/A',
            gender: 'N/A',
            id_number: 'N/A',
            region: 'N/A',
            city: 'N/A',
            country: 'N/A',
            education: 'N/A',
            marital_status: 'N/A',
            phone: 'N/A',
            email: 'N/A',
            address: 'N/A',
            emergency_contact: 'N/A',
            languages: [],
            risk_level: 'N/A',
            risk_score: 0,
            total_cases: 0,
            resolved_cases: 0,
            pending_cases: 0,
            favorable_outcomes: 0,
            verification_status: 'Not Verified',
            verified_on: 'N/A',
            // Gazette-related fields
            date_of_birth: null,
            place_of_birth: null,
            old_name: null,
            new_name: null,
            alias_names: [],
            old_place_of_birth: null,
            new_place_of_birth: null,
            old_date_of_birth: null,
            new_date_of_birth: null,
            effective_date_of_change: null,
            gazette_remarks: null,
            gazette_source: null,
            gazette_reference: null
          });
        }
      } catch (error) {
        console.error('Error loading person data:', error);
        setError('Failed to load person data');
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      loadPersonData();
    }
  }, [id]);

  // Load analytics data
  useEffect(() => {
    const loadAnalytics = async () => {
      if (!id) return;
      
      try {
        setAnalyticsLoading(true);
        const response = await fetch(`/api/person/${id}/analytics`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          setAnalytics(data);
        } else {
          // Fallback to mock data - don't log 404 errors as they're expected
          if (response.status !== 404) {
            console.error('Error loading analytics data:', response.status);
          }
          setAnalytics({
            risk_score: 0,
            risk_level: 'Low',
            risk_factors: [],
            total_monetary_amount: 0,
            average_case_value: 0,
            financial_risk_level: 'Low',
            primary_subject_matter: 'N/A',
            subject_matter_categories: [],
            legal_issues: [],
            financial_terms: [],
            case_complexity_score: 0,
            success_rate: 0
          });
        }
      } catch (error) {
        console.error('Error loading analytics data:', error);
        // Use fallback data on error
        setAnalytics({
          risk_score: 0,
          risk_level: 'Low',
          risk_factors: [],
          total_monetary_amount: 0,
          average_case_value: 0,
          financial_risk_level: 'Low',
          primary_subject_matter: 'N/A',
          subject_matter_categories: [],
          legal_issues: [],
          financial_terms: [],
          case_complexity_score: 0,
          success_rate: 0
        });
      } finally {
        setAnalyticsLoading(false);
      }
    };

    if (id) {
      loadAnalytics();
    }
  }, [id]);

  // Load case statistics
  useEffect(() => {
    const loadCaseStats = async () => {
      if (!id) return;
      
      try {
        setCaseStatsLoading(true);
        const response = await fetch(`/api/person-case-statistics/person/${id}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          setCaseStats(data);
        } else {
          // Fallback to mock data
          setCaseStats({
            total_cases: 0,
            resolved_cases: 0,
            unresolved_cases: 0,
            favorable_cases: 0,
            unfavorable_cases: 0,
            mixed_cases: 0,
            case_outcome: 'N/A'
          });
        }
      } catch (error) {
        console.error('Error loading case statistics:', error);
        // Use fallback data on error
        setCaseStats({
          total_cases: 0,
          resolved_cases: 0,
          unresolved_cases: 0,
          favorable_cases: 0,
          unfavorable_cases: 0,
          mixed_cases: 0,
          case_outcome: 'N/A'
        });
      } finally {
        setCaseStatsLoading(false);
      }
    };

    if (id) {
      loadCaseStats();
    }
  }, [id]);

  // Load related cases
  useEffect(() => {
    const loadRelatedCases = async () => {
      try {
        const token = localStorage.getItem('accessToken') || 'test-token-123';
        const response = await fetch(`/api/case-search/search?query=${encodeURIComponent(personData?.full_name || '')}&limit=50`, {
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          setRelatedCases(data.results || []);
          setFilteredCases(data.results || []);
        } else {
          // Fallback to mock data
          const mockCases = [
      {
        id: 1,
              title: `Sample case involving ${searchQuery || 'Unknown Person'}`,
              suit_reference_number: 'SAMPLE-001',
              court_type: 'High Court',
              date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 2 days ago
        status: 'Resolved',
        type: 'Civil',
        area_of_law: 'Contract Dispute',
        nature: 'Contract Dispute'
      },
      {
        id: 2,
              title: `Another case involving ${searchQuery || 'Unknown Person'}`,
              suit_reference_number: 'SAMPLE-002',
              court_type: 'Supreme Court',
              date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 1 week ago
        status: 'Pending',
        type: 'Criminal',
        area_of_law: 'Fraud',
        nature: 'Fraud'
      },
      {
        id: 3,
              title: `Third case involving ${searchQuery || 'Unknown Person'}`,
              suit_reference_number: 'SAMPLE-003',
              court_type: 'Court of Appeal',
              date: '2023-06-15', // Older date
        status: 'Resolved',
        type: 'Commercial',
        area_of_law: 'Property Dispute',
        nature: 'Property Dispute'
      }
    ];
          setRelatedCases(mockCases);
          setFilteredCases(mockCases);
        }
      } catch (error) {
        console.error('Error loading related cases:', error);
      }
    };

    if (personData?.full_name) {
      loadRelatedCases();
    }
  }, [personData, searchQuery]);

  // Filter and sort cases
  useEffect(() => {
    let filtered = [...relatedCases];

    // Apply search filter
    if (caseSearchQuery) {
      filtered = filtered.filter(case_ => 
        case_.title.toLowerCase().includes(caseSearchQuery.toLowerCase()) ||
        case_.suit_number.toLowerCase().includes(caseSearchQuery.toLowerCase())
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (caseSortBy) {
        case 'date':
          aValue = new Date(a.date);
          bValue = new Date(b.date);
          break;
        case 'title':
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case 'suit_number':
          aValue = a.suit_number.toLowerCase();
          bValue = b.suit_number.toLowerCase();
          break;
        default:
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
      }

      if (caseSortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredCases(filtered);
    setCurrentPage(1);
  }, [relatedCases, caseSearchQuery, caseSortBy, caseSortOrder]);

  // Handle request details modal
  const handleRequestDetails = (caseItem, event) => {
    event.stopPropagation(); // Prevent event bubbling to parent div
    setSelectedCase(caseItem);
    setShowRequestModal(true);
  };

  // Handle profile request modal
  const handleProfileRequest = () => {
    setShowProfileRequestModal(true);
  };

  // Pagination
  const totalPages = Math.ceil(filteredCases.length / casesPerPage);
  const startIndex = (currentPage - 1) * casesPerPage;
  const endIndex = startIndex + casesPerPage;
  const currentCases = filteredCases.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const clearFilters = () => {
    setCaseSearchQuery('');
    setCaseSortBy('date');
    setCaseSortOrder('desc');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading person profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
  return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600">{error}</p>
            <button
            onClick={() => navigate('/people-results')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Go Back
            </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Fixed Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-slate-200 shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/people-results')}
                className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </button>
              <div>
                <h1 className="text-2xl font-bold text-slate-900 truncate max-w-md">
                  {personData?.full_name || 'Loading...'}
                </h1>
                {searchQuery && (
                  <div className="mt-1">
                    <span className="text-xs text-slate-500">Search results for: </span>
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                      "{searchQuery}"
                    </span>
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${
                  personData?.risk_level === 'High' ? 'bg-red-500' :
                  personData?.risk_level === 'Medium' ? 'bg-yellow-500' : 'bg-green-500'
                }`}></div>
                <span className="text-sm font-medium text-slate-700">
                  {personData?.risk_level || 'Low'} Risk
                </span>
              </div>
              <button className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors">
                <Star className="h-4 w-4" />
                Watchlist
              </button>
              <button
                onClick={handleProfileRequest}
                className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Request Profile Information
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content with top padding to account for fixed header */}
      <div className="pt-24 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information */}
            <div className="bg-white rounded-lg border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                  <User className="h-5 w-5 text-blue-600" />
                  Personal Information
                </h2>
                <button className="text-slate-400 hover:text-slate-600">
                  <RefreshCw className="h-5 w-5" />
                </button>
                </div>
              
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
                    <div className="flex items-center space-x-2 mb-1">
                      <User className="w-4 h-4 text-blue-600" />
                      <span className="text-xs font-medium text-blue-800 uppercase tracking-wide">Full Name</span>
                    </div>
                    <p className="text-sm font-semibold text-blue-900">{personData?.full_name}</p>
                  </div>
                  
                  <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
                    <div className="flex items-center space-x-2 mb-1">
                      <Building2 className="w-4 h-4 text-green-600" />
                      <span className="text-xs font-medium text-green-800 uppercase tracking-wide">Address</span>
                    </div>
                    <p className="text-sm font-semibold text-green-900">{personData?.address || 'N/A'}</p>
                  </div>

                  <div className="bg-purple-50 p-4 rounded-lg border-l-4 border-purple-500">
                    <div className="flex items-center space-x-2 mb-1">
                      <GraduationCap className="w-4 h-4 text-purple-600" />
                      <span className="text-xs font-medium text-purple-800 uppercase tracking-wide">Profession</span>
                    </div>
                    <p className="text-sm font-semibold text-purple-900">{personData?.occupation || 'N/A'}</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="bg-orange-50 p-4 rounded-lg border-l-4 border-orange-500">
                    <div className="flex items-center space-x-2 mb-1">
                      <Calendar className="w-4 h-4 text-orange-600" />
                      <span className="text-xs font-medium text-orange-800 uppercase tracking-wide">Date of Birth</span>
                    </div>
                    <p className="text-sm font-semibold text-orange-900">
                      {personData?.date_of_birth ? new Date(personData.date_of_birth).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      }) : 'N/A'}
                    </p>
                  </div>

                  <div className="bg-indigo-50 p-4 rounded-lg border-l-4 border-indigo-500">
                    <div className="flex items-center space-x-2 mb-1">
                      <Building2 className="w-4 h-4 text-indigo-600" />
                      <span className="text-xs font-medium text-indigo-800 uppercase tracking-wide">Place of Birth</span>
                    </div>
                    <p className="text-sm font-semibold text-indigo-900">{personData?.place_of_birth || 'N/A'}</p>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center space-x-2 mb-1">
                      <Users className="w-4 h-4 text-gray-600" />
                      <span className="text-xs font-medium text-gray-700 uppercase tracking-wide">Gender</span>
                    </div>
                    <p className="text-sm font-semibold text-gray-900">{personData?.gender || 'N/A'}</p>
                  </div>
                </div>
              </div>
            </div>


            {/* Contact Information */}
            <div className="bg-white rounded-lg border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                  <Phone className="h-5 w-5 text-blue-600" />
                  Contact Information
                </h2>
                <button className="text-slate-400 hover:text-slate-600">
                  <RefreshCw className="h-5 w-5" />
                </button>
              </div>
              
              <div className="text-center py-8">
                <p className="text-lg text-slate-500">N/A</p>
                        </div>
                      </div>

            {/* Related Cases & Names */}
            <div className="bg-white rounded-lg border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                  <Scale className="h-5 w-5 text-blue-600" />
                  Related Information
                </h2>
                <button className="text-slate-400 hover:text-slate-600">
                  <RefreshCw className="h-5 w-5" />
                </button>
              </div>

              {/* Tabs */}
              <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
                <button
                  onClick={() => setActiveTab('cases')}
                  className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
                    activeTab === 'cases'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <Scale className="h-4 w-4" />
                    Cases ({filteredCases.length})
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('names')}
                  className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
                    activeTab === 'names'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <User className="h-4 w-4" />
                    Gazette ({gazetteData?.length || 0})
                  </div>
                </button>
              </div>
              
              {/* Tab Content */}
              {activeTab === 'cases' && (
                <>
                  {/* Search and Filter Controls */}
                  <div className="mb-6 space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                          <input
                            type="text"
                            placeholder="Search cases..."
                            value={caseSearchQuery}
                            onChange={(e) => setCaseSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                      </div>
                      <select
                        value={caseSortBy}
                        onChange={(e) => setCaseSortBy(e.target.value)}
                        className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="date">Sort by Date</option>
                        <option value="title">Sort by Title</option>
                        <option value="suit_number">Sort by Suit Number</option>
                      </select>
                      <select
                        value={caseSortOrder}
                        onChange={(e) => setCaseSortOrder(e.target.value)}
                        className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="desc">Descending</option>
                        <option value="asc">Ascending</option>
                      </select>
                      <button
                        onClick={clearFilters}
                        className="px-4 py-2 text-slate-600 hover:text-slate-800 transition-colors"
                      >
                        Clear
                      </button>
                    </div>
                  </div>

                  {/* Cases List */}
                  <div className="space-y-4">
                    {currentCases.map((case_) => (
                      <div 
                        key={case_.id} 
                        className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                        onClick={() => navigate(`/case-details/${case_.id}?q=${encodeURIComponent(personData?.full_name || searchQuery || '')}`, {
                          state: { originalPersonCases: personData?.cases || [] }
                        })}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            {/* Person Name - Prominently displayed */}
                            <div className="mb-2">
                              <h2 className="text-lg font-bold text-blue-900 break-words leading-tight">
                                {personData?.full_name || searchQuery || 'Unknown Person'}
                              </h2>
                            </div>
                            {/* Case Title */}
                            <h3 className="font-semibold text-slate-900 mb-2">{case_.title}</h3>
                            <div className="grid grid-cols-2 gap-4 text-sm text-slate-600">
                              <div>
                                <span className="font-medium">Suit Number:</span> {case_.suit_reference_number || case_.suit_number || 'N/A'}
                              </div>
                              <div>
                                <span className="font-medium">Court:</span> {getCourtFullName(case_.court_type || case_.court) || 'N/A'}
                              </div>
                              <div>
                                <span className="font-medium">Date:</span> {formatDate(case_.date)}
                              </div>
                              <div>
                                <span className="font-medium">Nature:</span> {case_.area_of_law || case_.type || case_.case_type || case_.nature || 'N/A'}
                              </div>
                            </div>
                          </div>
                          <div className="ml-4 flex gap-2">
                            <button 
                              onClick={(e) => handleRequestDetails(case_, e)}
                              className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                            >
                              Request Details
                            </button>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                const fullName = personData?.full_name || searchQuery || '';
                                const originalSearch = searchQuery || '';
                                navigate(`/case-details/${case_.id}?q=${encodeURIComponent(fullName)}&search=${encodeURIComponent(originalSearch)}`);
                              }}
                              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                            >
                              View Case
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="mt-6 flex items-center justify-between">
                      <div className="text-sm text-slate-600">
                        Page {currentPage} of {totalPages}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 1}
                          className="px-3 py-2 text-slate-600 hover:text-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage === totalPages}
                          className="px-3 py-2 text-slate-600 hover:text-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Related Names Tab */}
              {activeTab === 'names' && (
                <div className="space-y-4">
                  {gazetteLoading ? (
                    <div className="space-y-3">
                      <div className="animate-pulse">
                        <div className="h-4 bg-gray-200 rounded mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded mb-2"></div>
                      </div>
                    </div>
                  ) : gazetteData && gazetteData.length > 0 ? (
                    <div className="space-y-4">
                      {gazetteData.map((gazette, index) => (
                        <div key={gazette.id} className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <User className="h-5 w-5 text-blue-600" />
                              <span className="text-sm font-medium text-slate-700">
                                Gazette Entry #{gazette.item_number || gazette.id}
                              </span>
                            </div>
                            <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">
                              {gazette.gazette_type?.replace('_', ' ')}
                            </span>
                          </div>
                          
                          {/* Name Changes */}
                          {(gazette.old_name || gazette.new_name) && (
                            <div className="mb-3 p-3 bg-gray-50 rounded-lg">
                              <div className="space-y-2">
                                {gazette.old_name && (
                                  <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">Previous Name:</span>
                                    <span className="text-sm font-medium text-gray-900">{gazette.old_name}</span>
                                  </div>
                                )}
                                {gazette.new_name && (
                                  <div className="flex items-center justify-between">
                                    <span className="text-sm text-blue-600">New Name:</span>
                                    <span className="text-sm font-medium text-blue-900">{gazette.new_name}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Date of Birth Changes */}
                          {(gazette.old_date_of_birth || gazette.new_date_of_birth) && (
                            <div className="mb-3 p-3 bg-blue-50 rounded-lg">
                              <div className="space-y-2">
                                {gazette.old_date_of_birth && (
                                  <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">Previous Date of Birth:</span>
                                    <span className="text-sm font-medium text-gray-900">
                                      {new Date(gazette.old_date_of_birth).toLocaleDateString('en-US', { 
                                        year: 'numeric', 
                                        month: 'long', 
                                        day: 'numeric' 
                                      })}
                                    </span>
                                  </div>
                                )}
                                {gazette.new_date_of_birth && (
                                  <div className="flex items-center justify-between">
                                    <span className="text-sm text-blue-600">New Date of Birth:</span>
                                    <span className="text-sm font-medium text-blue-900">
                                      {new Date(gazette.new_date_of_birth).toLocaleDateString('en-US', { 
                                        year: 'numeric', 
                                        month: 'long', 
                                        day: 'numeric' 
                                      })}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Place of Birth Changes */}
                          {(gazette.old_place_of_birth || gazette.new_place_of_birth) && (
                            <div className="mb-3 p-3 bg-green-50 rounded-lg">
                              <div className="space-y-2">
                                {gazette.old_place_of_birth && (
                                  <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">Previous Place of Birth:</span>
                                    <span className="text-sm font-medium text-gray-900">{gazette.old_place_of_birth}</span>
                                  </div>
                                )}
                                {gazette.new_place_of_birth && (
                                  <div className="flex items-center justify-between">
                                    <span className="text-sm text-green-600">New Place of Birth:</span>
                                    <span className="text-sm font-medium text-green-900">{gazette.new_place_of_birth}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Marriage Officer Appointment */}
                          {gazette.gazette_type === 'APPOINTMENT_OF_MARRIAGE_OFFICERS' && (
                            <div className="mb-3 p-3 bg-purple-50 rounded-lg">
                              <div className="space-y-2">
                                {gazette.officer_name && (
                                  <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">Officer Name:</span>
                                    <span className="text-sm font-medium text-gray-900">{gazette.officer_name}</span>
                                  </div>
                                )}
                                {gazette.officer_title && (
                                  <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">Title:</span>
                                    <span className="text-sm font-medium text-gray-900">{gazette.officer_title}</span>
                                  </div>
                                )}
                                {gazette.appointment_authority && (
                                  <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">Appointing Authority:</span>
                                    <span className="text-sm font-medium text-gray-900">{gazette.appointment_authority}</span>
                                  </div>
                                )}
                                {gazette.jurisdiction_area && (
                                  <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">Jurisdiction Area:</span>
                                    <span className="text-sm font-medium text-gray-900">{gazette.jurisdiction_area}</span>
                                  </div>
                                )}
                                {gazette.effective_date_of_change && (
                                  <div className="flex items-center justify-between">
                                    <span className="text-sm text-purple-600">Appointment Date:</span>
                                    <span className="text-sm font-medium text-purple-900">
                                      {new Date(gazette.effective_date_of_change).toLocaleDateString('en-US', { 
                                        year: 'numeric', 
                                        month: 'long', 
                                        day: 'numeric' 
                                      })}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Alias Names */}
                          {gazette.alias_names && gazette.alias_names.length > 0 && (
                            <div className="mb-3">
                              <span className="text-sm font-medium text-slate-700 mb-2 block">Also Known As:</span>
                              <div className="flex flex-wrap gap-2">
                                {gazette.alias_names.map((alias, aliasIndex) => (
                                  <span key={aliasIndex} className="px-3 py-1 bg-purple-100 text-purple-800 text-sm rounded-full">
                                    {alias}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Effective Date */}
                          {gazette.effective_date_of_change && (
                            <div className="mb-3">
                              <span className="text-sm font-medium text-slate-700">Effective Date of Change:</span>
                              <p className="text-sm text-slate-600 mt-1">
                                {new Date(gazette.effective_date_of_change).toLocaleDateString('en-US', { 
                                  year: 'numeric', 
                                  month: 'long', 
                                  day: 'numeric' 
                                })}
                              </p>
                            </div>
                          )}

                          {/* Remarks */}
                          {gazette.remarks && (
                            <div className="mb-3">
                              <span className="text-sm font-medium text-slate-700">Remarks:</span>
                              <p className="text-sm text-slate-600 mt-1">{gazette.remarks}</p>
                            </div>
                          )}

                          {/* Gazette Source */}
                          <div className="text-xs text-gray-500 border-t pt-2">
                            Source: {gazette.gazette_number} - {gazette.source || 'High Court'}
                            {gazette.effective_date_of_change && (
                              <span className="ml-2">
                                (Effective: {new Date(gazette.effective_date_of_change).toLocaleDateString('en-US', { 
                                  year: 'numeric', 
                                  month: 'long', 
                                  day: 'numeric' 
                                })})
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <User className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No Related Names Found</h3>
                      <p className="text-gray-500">
                        No gazette entries or name changes found for this person.
                      </p>
                    </div>
                  )}
                </div>
              )}
              </div>
          </div>

          {/* Right Column - Side Panel */}
          <div className="space-y-6">
            {/* Risk Assessment */}
            <div className="bg-white rounded-lg border border-slate-200 p-6">
              <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2 mb-4">
                <Shield className="h-5 w-5 text-blue-600" />
                Financial Risk Assessment
                {(caseStatsLoading || analyticsLoading) && <RefreshCw className="h-4 w-4 animate-spin text-blue-600" />}
              </h3>
              {(caseStatsLoading || analyticsLoading) ? (
                <div className="text-center py-4">
                  <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded mb-4"></div>
                    <div className="h-2 bg-gray-200 rounded"></div>
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  {(() => {
                    // Calculate risk score based on case statistics and financial factors
                    let riskScore = 0;
                    let riskLevel = 'Low';
                    let riskFactors = [];
                    
                    if (caseStats) {
                      const totalCases = caseStats.total_cases || 0;
                      const unfavorableCases = caseStats.unfavorable_cases || 0;
                      const mixedCases = caseStats.mixed_cases || 0;
                      const unresolvedCases = caseStats.unresolved_cases || 0;
                      
                      // Base risk from unfavorable cases (40% weight)
                      if (totalCases > 0) {
                        const unfavorableRate = (unfavorableCases / totalCases) * 100;
                        riskScore += (unfavorableRate * 0.4);
                        
                        if (unfavorableRate > 50) {
                          riskFactors.push('High unfavorable case rate');
                        } else if (unfavorableRate > 25) {
                          riskFactors.push('Moderate unfavorable case rate');
                        }
                      }
                      
                      // Risk from mixed cases (20% weight)
                      if (totalCases > 0) {
                        const mixedRate = (mixedCases / totalCases) * 100;
                        riskScore += (mixedRate * 0.2);
                        
                        if (mixedRate > 30) {
                          riskFactors.push('Inconsistent case outcomes');
                        }
                      }
                      
                      // Risk from unresolved cases (20% weight)
                      if (totalCases > 0) {
                        const unresolvedRate = (unresolvedCases / totalCases) * 100;
                        riskScore += (unresolvedRate * 0.2);
                        
                        if (unresolvedRate > 60) {
                          riskFactors.push('High unresolved case rate');
                        } else if (unresolvedRate > 30) {
                          riskFactors.push('Moderate unresolved case rate');
                        }
                      }
                      
                      // Risk from total case volume (20% weight)
                      if (totalCases > 10) {
                        riskScore += 20;
                        riskFactors.push('High case volume');
                      } else if (totalCases > 5) {
                        riskScore += 10;
                        riskFactors.push('Moderate case volume');
                      }
                      
                      // Financial risk factors from analytics
                      if (analytics) {
                        if (analytics.financial_risk_level === 'Critical') {
                          riskScore += 30;
                          riskFactors.push('Critical financial risk');
                        } else if (analytics.financial_risk_level === 'High') {
                          riskScore += 20;
                          riskFactors.push('High financial risk');
                        } else if (analytics.financial_risk_level === 'Medium') {
                          riskScore += 10;
                          riskFactors.push('Moderate financial risk');
                        }
                        
                        if (analytics.total_monetary_amount > 1000000) {
                          riskFactors.push('High monetary involvement');
                        }
                      }
                      
                      // Determine risk level
                      if (riskScore >= 80) {
                        riskLevel = 'Critical';
                      } else if (riskScore >= 60) {
                        riskLevel = 'High';
                      } else if (riskScore >= 30) {
                        riskLevel = 'Medium';
                      } else {
                        riskLevel = 'Low';
                      }
                    }
                    
                    return (
                      <>
                        <div className={`text-4xl font-bold mb-2 ${
                          riskLevel === 'Critical' ? 'text-red-600' :
                          riskLevel === 'High' ? 'text-orange-600' :
                          riskLevel === 'Medium' ? 'text-yellow-600' :
                          'text-green-600'
                        }`}>
                          {Math.round(riskScore)}%
                        </div>
                        <div className={`text-sm mb-4 ${
                          riskLevel === 'Critical' ? 'text-red-600' :
                          riskLevel === 'High' ? 'text-orange-600' :
                          riskLevel === 'Medium' ? 'text-yellow-600' :
                          'text-slate-600'
                        }`}>
                          {riskLevel} Financial Risk
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                          <div
                            className={`h-2 rounded-full transition-all duration-300 ${
                              riskLevel === 'Critical' ? 'bg-red-500' :
                              riskLevel === 'High' ? 'bg-orange-500' :
                              riskLevel === 'Medium' ? 'bg-yellow-500' :
                              'bg-green-500'
                            }`}
                            style={{ width: `${Math.min(riskScore, 100)}%` }}
                          ></div>
                        </div>
                        <p className="text-xs text-slate-500 mb-3">Based on legal history, case outcomes & financial factors</p>
                        
                        {/* Risk Assessment Summary */}
                        <div className="text-left bg-slate-50 rounded-lg p-3 mb-3">
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div className="flex justify-between">
                              <span className="text-slate-600">Total Cases:</span>
                              <span className="font-semibold">{caseStats?.total_cases || 0}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-600">Unfavorable:</span>
                              <span className="font-semibold text-red-600">{caseStats?.unfavorable_cases || 0}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-600">Unresolved:</span>
                              <span className="font-semibold text-orange-600">{caseStats?.unresolved_cases || 0}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-600">Mixed:</span>
                              <span className="font-semibold text-yellow-600">{caseStats?.mixed_cases || 0}</span>
                            </div>
                          </div>
                        </div>
                        
                        {riskFactors.length > 0 && (
                          <div className="text-left">
                            <p className="text-xs font-medium text-slate-700 mb-2">Key Risk Factors:</p>
                            <div className="flex flex-wrap gap-1">
                              {riskFactors.slice(0, 4).map((factor, index) => (
                                <span key={index} className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded">
                                  {factor}
                                </span>
                              ))}
                              {riskFactors.length > 4 && (
                                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                                  +{riskFactors.length - 4} more
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </>
                    );
                  })()}
                </div>
              )}
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-lg border border-slate-200 p-6">
              <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2 mb-4">
                <Clock className="h-5 w-5 text-blue-600" />
                Quick Stats
                {(caseStatsLoading || analyticsLoading) && <RefreshCw className="h-4 w-4 animate-spin text-blue-600" />}
              </h3>
              {(caseStatsLoading || analyticsLoading) ? (
                <div className="space-y-3">
                  <div className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-600">Total Cases:</span>
                    <span className="text-sm font-semibold text-slate-900">{caseStats?.total_cases || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-600">Resolved Cases:</span>
                    <span className="text-sm font-semibold text-slate-900">{caseStats?.resolved_cases || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-600">Unresolved Cases:</span>
                    <span className="text-sm font-semibold text-slate-900">{caseStats?.unresolved_cases || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-600">Favorable Cases:</span>
                    <span className="text-sm font-semibold text-green-600">{caseStats?.favorable_cases || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-600">Unfavorable Cases:</span>
                    <span className="text-sm font-semibold text-red-600">{caseStats?.unfavorable_cases || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-600">Mixed Cases:</span>
                    <span className="text-sm font-semibold text-yellow-600">{caseStats?.mixed_cases || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-600">Overall Outcome:</span>
                    <span className={`text-sm font-semibold ${
                      caseStats?.case_outcome === 'Favorable' ? 'text-green-600' :
                      caseStats?.case_outcome === 'Unfavorable' ? 'text-red-600' :
                      caseStats?.case_outcome === 'Mixed' ? 'text-yellow-600' :
                      'text-gray-600'
                    }`}>
                      {caseStats?.case_outcome || 'N/A'}
                    </span>
                  </div>
                </div>
              )}
            </div>



            {/* Affiliations */}
            <div className="bg-white rounded-lg border border-slate-200 p-6">
              <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2 mb-4">
                <Building2 className="h-5 w-5 text-green-600" />
                Affiliations
              </h3>
              <div className="space-y-3">
                <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
                  <div className="flex items-center space-x-2 mb-2">
                    <Building2 className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-semibold text-green-800">Professional Associations</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-green-900">Ghana Bar Association</span>
                      <span className="text-xs text-green-700 bg-green-100 px-2 py-1 rounded">Active</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-green-900">International Bar Association</span>
                      <span className="text-xs text-green-700 bg-green-100 px-2 py-1 rounded">Member</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-green-900">Chartered Institute of Arbitrators</span>
                      <span className="text-xs text-green-700 bg-green-100 px-2 py-1 rounded">Fellow</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
                  <div className="flex items-center space-x-2 mb-2">
                    <Users className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-semibold text-blue-800">Board Positions</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-blue-900">Ghana Legal Aid Board</span>
                      <span className="text-xs text-blue-700 bg-blue-100 px-2 py-1 rounded">Chairman</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-blue-900">National Democratic Congress</span>
                      <span className="text-xs text-blue-700 bg-blue-100 px-2 py-1 rounded">Former President</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Organizations */}
            <div className="bg-white rounded-lg border border-slate-200 p-6">
              <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2 mb-4">
                <Building2 className="h-5 w-5 text-purple-600" />
                Organizations
              </h3>
              <div className="space-y-3">
                <div className="bg-purple-50 p-4 rounded-lg border-l-4 border-purple-500">
                  <div className="flex items-center space-x-2 mb-2">
                    <Building2 className="w-4 h-4 text-purple-600" />
                    <span className="text-sm font-semibold text-purple-800">Current Organizations</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-purple-900">John Dramani Mahama Foundation</span>
                      <span className="text-xs text-purple-700 bg-purple-100 px-2 py-1 rounded">Founder</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-purple-900">Ghana Investment Promotion Centre</span>
                      <span className="text-xs text-purple-700 bg-purple-100 px-2 py-1 rounded">Board Member</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-purple-900">African Development Bank</span>
                      <span className="text-xs text-purple-700 bg-purple-100 px-2 py-1 rounded">Consultant</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-orange-50 p-4 rounded-lg border-l-4 border-orange-500">
                  <div className="flex items-center space-x-2 mb-2">
                    <History className="w-4 h-4 text-orange-600" />
                    <span className="text-sm font-semibold text-orange-800">Previous Organizations</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-orange-900">Government of Ghana</span>
                      <span className="text-xs text-orange-700 bg-orange-100 px-2 py-1 rounded">Former President</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-orange-900">Parliament of Ghana</span>
                      <span className="text-xs text-orange-700 bg-orange-100 px-2 py-1 rounded">Former MP</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-orange-900">Ministry of Communications</span>
                      <span className="text-xs text-orange-700 bg-orange-100 px-2 py-1 rounded">Former Minister</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Financial Risk Profile */}
            <div className="bg-white rounded-lg border border-slate-200 p-6">
              <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2 mb-4">
                <DollarSign className="h-5 w-5 text-green-600" />
                Financial Risk Profile
                {(caseStatsLoading || analyticsLoading) && <RefreshCw className="h-4 w-4 animate-spin text-green-600" />}
              </h3>
              {(caseStatsLoading || analyticsLoading) ? (
                <div className="space-y-4">
                  <div className="animate-pulse">
                    <div className="h-16 bg-gray-200 rounded"></div>
                    <div className="h-16 bg-gray-200 rounded"></div>
                    <div className="h-16 bg-gray-200 rounded"></div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {(() => {
                    // Calculate financial risk indicators
                    const totalCases = caseStats?.total_cases || 0;
                    const unfavorableCases = caseStats?.unfavorable_cases || 0;
                    const mixedCases = caseStats?.mixed_cases || 0;
                    const unresolvedCases = caseStats?.unresolved_cases || 0;
                    
                    // Calculate risk indicators
                    const unfavorableRate = totalCases > 0 ? (unfavorableCases / totalCases) * 100 : 0;
                    const unresolvedRate = totalCases > 0 ? (unresolvedCases / totalCases) * 100 : 0;
                    const mixedRate = totalCases > 0 ? (mixedCases / totalCases) * 100 : 0;
                    
                    // Determine creditworthiness
                    let creditworthiness = 'Good';
                    if (unfavorableRate > 50 || unresolvedRate > 60) {
                      creditworthiness = 'Poor';
                    } else if (unfavorableRate > 25 || unresolvedRate > 30 || mixedRate > 40) {
                      creditworthiness = 'Fair';
                    }
                    
                    return (
                      <>
                        <div className={`p-4 rounded-lg border-l-4 ${
                          creditworthiness === 'Poor' ? 'bg-red-50 border-red-500' :
                          creditworthiness === 'Fair' ? 'bg-yellow-50 border-yellow-500' :
                          'bg-green-50 border-green-500'
                        }`}>
                          <div className="flex items-center space-x-2 mb-2">
                            <DollarSign className={`w-4 h-4 ${
                              creditworthiness === 'Poor' ? 'text-red-600' :
                              creditworthiness === 'Fair' ? 'text-yellow-600' :
                              'text-green-600'
                            }`} />
                            <span className={`text-xs font-medium uppercase tracking-wide ${
                              creditworthiness === 'Poor' ? 'text-red-800' :
                              creditworthiness === 'Fair' ? 'text-yellow-800' :
                              'text-green-800'
                            }`}>Creditworthiness</span>
                          </div>
                          <p className={`text-lg font-bold ${
                            creditworthiness === 'Poor' ? 'text-red-900' :
                            creditworthiness === 'Fair' ? 'text-yellow-900' :
                            'text-green-900'
                          }`}>
                            {creditworthiness}
                          </p>
                          <p className={`text-xs mt-1 ${
                            creditworthiness === 'Poor' ? 'text-red-700' :
                            creditworthiness === 'Fair' ? 'text-yellow-700' :
                            'text-green-700'
                          }`}>
                            Based on legal history and case outcomes
                          </p>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-slate-50 p-3 rounded-lg">
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-xs text-slate-600">Unfavorable Rate</span>
                              <span className={`text-sm font-semibold ${
                                unfavorableRate > 50 ? 'text-red-600' :
                                unfavorableRate > 25 ? 'text-yellow-600' :
                                'text-green-600'
                              }`}>
                                {unfavorableRate.toFixed(1)}%
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-1">
                              <div
                                className={`h-1 rounded-full ${
                                  unfavorableRate > 50 ? 'bg-red-500' :
                                  unfavorableRate > 25 ? 'bg-yellow-500' :
                                  'bg-green-500'
                                }`}
                                style={{ width: `${Math.min(unfavorableRate, 100)}%` }}
                              ></div>
                            </div>
                          </div>
                          
                          <div className="bg-slate-50 p-3 rounded-lg">
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-xs text-slate-600">Unresolved Rate</span>
                              <span className={`text-sm font-semibold ${
                                unresolvedRate > 60 ? 'text-red-600' :
                                unresolvedRate > 30 ? 'text-yellow-600' :
                                'text-green-600'
                              }`}>
                                {unresolvedRate.toFixed(1)}%
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-1">
                              <div
                                className={`h-1 rounded-full ${
                                  unresolvedRate > 60 ? 'bg-red-500' :
                                  unresolvedRate > 30 ? 'bg-yellow-500' :
                                  'bg-green-500'
                                }`}
                                style={{ width: `${Math.min(unresolvedRate, 100)}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                        
                        {analytics?.total_monetary_amount && analytics.total_monetary_amount > 0 && (
                          <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
                            <div className="flex items-center space-x-2 mb-2">
                              <DollarSign className="w-4 h-4 text-blue-600" />
                              <span className="text-xs font-medium text-blue-800 uppercase tracking-wide">Monetary Involvement</span>
                            </div>
                            <p className="text-lg font-bold text-blue-900">
                              ${analytics.total_monetary_amount.toLocaleString()}
                            </p>
                            {analytics.average_case_value && analytics.average_case_value > 0 && (
                              <p className="text-xs text-blue-700 mt-1">
                                Avg per case: ${analytics.average_case_value.toLocaleString()}
                              </p>
                            )}
                          </div>
                        )}
                        
                        <div className="mt-3 p-3 bg-slate-50 rounded-lg">
                          <p className="text-xs text-slate-600">
                            <strong>Banking Recommendation:</strong> {
                              creditworthiness === 'Poor' ? 'High risk - Enhanced due diligence required' :
                              creditworthiness === 'Fair' ? 'Medium risk - Standard monitoring recommended' :
                              'Low risk - Standard banking services suitable'
                            }
                          </p>
                        </div>
                      </>
                    );
                  })()}
                </div>
              )}
            </div>

            {/* Gazette Entries */}
            <div className="bg-white rounded-lg border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                  <FileText className="h-5 w-5 text-blue-600" />
                  Gazette Entries
                </h2>
                <button 
                  onClick={() => navigate('/gazette')}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  View All
                </button>
              </div>
              
              <GazetteSearch 
                personId={id}
                showActions={false}
                onGazetteSelect={(gazette) => {
                  // Handle gazette selection if needed
                  console.log('Selected gazette:', gazette);
                }}
              />
            </div>

          </div>
        </div>
      </div>

      {/* Request Details Modal */}
      <RequestDetailsModal
        isOpen={showRequestModal}
        onClose={() => setShowRequestModal(false)}
        caseData={selectedCase}
        entityType="Person"
        entityName={personData?.name}
      />

      {/* Profile Request Modal */}
      <RequestDetailsModal
        isOpen={showProfileRequestModal}
        onClose={() => setShowProfileRequestModal(false)}
        caseData={null}
        entityType="Person"
        entityName={personData?.full_name}
        isProfileRequest={true}
      />
    </div>
  );
};

export default PersonProfile;