import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Star, User, Calendar, Mail, Building2, Phone, Shield, Clock, Users, GraduationCap, Heart, AlertCircle, CheckCircle, XCircle, Eye, EyeOff, Search, Filter, ArrowUpDown, Scale, RefreshCw, ChevronLeft, ChevronRight, DollarSign, Percent, BookOpen, Calculator, AlertTriangle, History, MapPin, Globe } from 'lucide-react';
import RequestDetailsModal from '../components/RequestDetailsModal';
import { apiGet } from '../utils/api';

const BankDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [bankData, setBankData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [caseStats, setCaseStats] = useState(null);
  const [caseStatsLoading, setCaseStatsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('manager');
  const [managementData, setManagementData] = useState([]);
  const [relatedCases, setRelatedCases] = useState([]);
  const [casesLoading, setCasesLoading] = useState(false);
  const [filteredCases, setFilteredCases] = useState([]);
  const [caseSearchQuery, setCaseSearchQuery] = useState('');
  const [caseSortBy, setCaseSortBy] = useState('date');
  const [caseSortOrder, setCaseSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [casesPerPage] = useState(100);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectedCase, setSelectedCase] = useState(null);
  const [showProfileRequestModal, setShowProfileRequestModal] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [employeesLoading, setEmployeesLoading] = useState(false);
  const [employeeStats, setEmployeeStats] = useState({
    total: 0,
    active: 0,
    onLeave: 0,
    departments: 0
  });

  // Bank logo mapping
  const bankLogoMap = {
    'Ghana Commercial Bank': '/banks/gcb bank.jpeg',
    'GCB Bank': '/banks/gcb bank.jpeg',
    'Ecobank Ghana': '/banks/ecobank.jpeg',
    'Ecobank': '/banks/ecobank.jpeg',
    'Standard Chartered Bank': '/banks/stanchart.jpeg',
    'Stanbic Bank': '/banks/stanbic bank.jpeg',
    'Absa Bank': '/banks/absa.jpeg',
    'Access Bank': '/banks/access bank.jpeg',
    'Agricultural Development Bank': '/banks/adb.jpeg',
    'Bank of Africa': '/banks/bank of africa.jpeg',
    'Bank of Ghana': '/banks/Bank of ghana.jpeg',
    'CAL Bank': '/banks/calbank.jpeg',
    'Consolidated Bank Ghana': '/banks/cbg.jpeg',
    'First Bank of Nigeria': '/banks/fbn.jpeg',
    'Fidelity Bank': '/banks/Fidelity.jpeg',
    'First Atlantic Bank': '/banks/first atlantic.jpeg',
    'Ghana EXIM Bank': '/banks/ghana exim bank.jpeg',
    'Guaranty Trust Bank': '/banks/gtbank.jpeg',
    'National Investment Bank': '/banks/national invenstment bank.jpeg',
    'NIB Bank': '/banks/nib.jpeg',
    'Omnibsic Bank': '/banks/omnibsic.jpeg',
    'Prudential Bank': '/banks/prudential bank.jpeg',
    'Republic Bank': '/banks/republic bank.jpeg',
    'Societe Generale': '/banks/societe generale bank.jpeg',
    'The Royal Bank': '/banks/the royal bank.jpeg',
    'UMB Bank': '/banks/umb.jpeg',
    'Universal Merchant Bank': '/banks/universal merchant bank.jpeg',
    'Zenith Bank': '/banks/zenith.jpeg',
  };

  // Load bank data
  useEffect(() => {
    
    if (id) {
      loadBankData(id);
      loadManagementData(id);
      loadRelatedCases(id);
      loadBankAnalytics(id);
      loadBankCaseStats(id);
    }
  }, [id]);

  // Load employees when bank data is available
  useEffect(() => {
    if (bankData && bankData.name) {
      loadBankEmployees(bankData.name);
    }
  }, [bankData]);

  const loadBankData = async (bankId) => {
    try {
      setIsLoading(true);
      setError(null);
      

      const url = `/api/banks/${bankId}`;
      
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      
      if (response.ok) {
        const data = await response.json();

        if (data) {
          // Transform API data to match expected format
          const transformedData = {
            id: data.id,
            name: data.name,
            shortName: data.short_name || data.name,
            logo: data.logo_url || bankLogoMap[data.name] || '/banks/default-bank.jpeg',
            established: data.established_date ? new Date(data.established_date).getFullYear().toString() : 'N/A',
            incorporated: data.established_date ? new Date(data.established_date).toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            }) : 'N/A',
            headquarters: `${data.city || 'N/A'}, ${data.region || 'N/A'}`,
            address: data.address || data.head_office_address || 'N/A',
            city: data.city || 'N/A',
            region: data.region || 'N/A',
            country: data.country || 'Ghana',
            postalCode: data.postal_code || 'N/A',
            phone: data.phone || 'N/A',
            customerServicePhone: data.customer_service_phone || 'N/A',
            email: data.email || 'N/A',
            customerServiceEmail: data.customer_service_email || 'N/A',
            website: data.website || 'N/A',
            bankCode: data.bank_code || 'N/A',
            swiftCode: data.swift_code || 'N/A',
            licenseNumber: data.license_number || 'N/A',
            bankType: data.bank_type || 'N/A',
            ownershipType: data.ownership_type || 'N/A',
            rating: data.rating || 'N/A',
            totalAssets: data.total_assets || 0,
            netWorth: data.net_worth || 0,
            branchesCount: data.branches_count || 0,
            atmCount: data.atm_count || 0,
            hasMobileApp: data.has_mobile_app || false,
            hasOnlineBanking: data.has_online_banking || false,
            hasAtmServices: data.has_atm_services || false,
            hasForeignExchange: data.has_foreign_exchange || false,
            services: data.services || [],
            previousNames: data.previous_names || [],
            isVerified: data.is_verified || false,
            verificationDate: data.verification_date ? new Date(data.verification_date).toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            }) : 'N/A',
            verificationNotes: data.verification_notes || 'N/A',
            searchCount: data.search_count || 0,
            lastSearched: data.last_searched ? new Date(data.last_searched).toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            }) : 'N/A',
            status: data.status || 'Active',
            createdAt: data.created_at ? new Date(data.created_at).toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            }) : 'N/A',
            updatedAt: data.updated_at ? new Date(data.updated_at).toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            }) : 'N/A',
            // Mock data for cases - would come from separate API
            totalCases: 0,
            activeCases: 0,
            resolvedCases: 0,
            riskLevel: 'Low',
            riskScore: 0,
            lastActivity: data.updated_at ? new Date(data.updated_at).toISOString().split('T')[0] : 'N/A',
            numberOfBranches: data.branches_count || 0,
            previousNames: data.previous_names || [],
            managers: [],
            branches: [],
            cases: []
          };
          setBankData(transformedData);
        } else {
          console.error('No bank data found');
          setError('Bank not found');
        }
      } else {
        console.error('Failed to fetch bank data:', response.status);
        setError(`Failed to load bank data: ${response.status}`);
      }
    } catch (error) {
      console.error('Error loading bank data:', error);
      setError('Error loading bank data');
    } finally {
      setIsLoading(false);
    }
  };

  // Load bank analytics
  const loadBankAnalytics = async (bankId) => {
    try {
      setAnalyticsLoading(true);
      const response = await fetch(`/api/banks/${bankId}/analytics`, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAnalytics(data);
      } else {
        console.error('Failed to load bank analytics:', response.status);
        setAnalytics(null);
      }
    } catch (error) {
      console.error('Error loading bank analytics:', error);
      setAnalytics(null);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  // Load bank case statistics
  const loadBankCaseStats = async (bankId) => {
    try {
      setCaseStatsLoading(true);
      const response = await fetch(`/api/banks/${bankId}/case-statistics`, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setCaseStats(data);
      } else {
        console.error('Failed to load bank case stats:', response.status);
        setCaseStats(null);
      }
    } catch (error) {
      console.error('Error loading bank case stats:', error);
      setCaseStats(null);
    } finally {
      setCaseStatsLoading(false);
    }
  };

  // Load employees for this bank
  const loadBankEmployees = async (bankName) => {
    try {
      setEmployeesLoading(true);
      const data = await apiGet(`/employees/by-employer/bank/${encodeURIComponent(bankName)}`);
      setEmployees(data.employees || []);
      
      // Calculate statistics
      const total = data.total || 0;
      const active = data.employees?.filter(emp => emp.employment_status === 'active').length || 0;
      const onLeave = data.employees?.filter(emp => emp.employment_status === 'inactive').length || 0;
      const departments = new Set(data.employees?.map(emp => emp.department).filter(Boolean)).size || 0;
        
      setEmployeeStats({
        total,
        active,
        onLeave,
        departments
      });
    } catch (error) {
      console.error('Error loading bank employees:', error);
      setEmployees([]);
      setEmployeeStats({ total: 0, active: 0, onLeave: 0, departments: 0 });
    } finally {
      setEmployeesLoading(false);
    }
  };

  // Load management data
  const loadManagementData = async (bankId) => {
    // Sample management data - in real implementation, this would come from an API
    const sampleManagement = [
      {
        id: 1,
        name: "Dr. Ernest Kwamina Yedu Addison",
        position: "Governor",
        tenure: "2017 - Present",
        qualifications: "PhD Economics, University of Manchester",
        experience: "25+ years in banking and finance",
        profileId: 1,
        email: "governor@bog.gov.gh",
        phone: "+233 302 666 902",
        bio: "Experienced economist with extensive background in monetary policy and banking supervision."
      },
      {
        id: 2,
        name: "Mrs. Elsie Addo Awadzi",
        position: "First Deputy Governor",
        tenure: "2017 - Present", 
        qualifications: "LLM International Law, Harvard University",
        experience: "20+ years in legal and regulatory affairs",
        profileId: 2,
        email: "first.deputy@bog.gov.gh",
        phone: "+233 302 666 903",
        bio: "Legal expert with extensive experience in financial regulation and international law."
      },
      {
        id: 3,
        name: "Dr. Maxwell Opoku-Afari",
        position: "Second Deputy Governor",
        tenure: "2019 - Present",
        qualifications: "PhD Economics, University of Ghana",
        experience: "18+ years in economic research and policy",
        profileId: 3,
        email: "second.deputy@bog.gov.gh",
        phone: "+233 302 666 904",
        bio: "Economic policy expert with strong background in research and analysis."
      }
    ];
    
    setManagementData(sampleManagement);
  };

  // Load related cases
  const loadRelatedCases = async (bankId) => {
    try {
      setCasesLoading(true);

      const url = `/api/banks/${bankId}/related-cases?limit=100`;
      
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      
      if (response.ok) {
        const data = await response.json();
        
        if (data.related_cases && data.related_cases.length > 0) {
          setRelatedCases(data.related_cases);
        } else {
          setRelatedCases([]);
        }
      } else {
        console.error('Failed to fetch related cases:', response.status);
        const errorText = await response.text();
        console.error('Error response:', errorText);
        setRelatedCases([]);
      }
    } catch (error) {
      console.error('Error loading related cases:', error);
      setRelatedCases([]);
    } finally {
      setCasesLoading(false);
    }
  };

  // Filter and sort cases
  const filterAndSortCases = (cases, searchQuery, sortBy, sortOrder) => {
    let filtered = cases;

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(caseItem =>
        caseItem.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        caseItem.suit_reference_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        caseItem.court_type?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        caseItem.area_of_law?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Sort cases
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'title':
          aValue = a.title || '';
          bValue = b.title || '';
          break;
        case 'court':
          aValue = a.court_type || '';
          bValue = b.court_type || '';
          break;
        case 'date':
        default:
          aValue = new Date(a.date || 0);
          bValue = new Date(b.date || 0);
          break;
      }

      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    return filtered;
  };

  // Handle request details modal
  const handleRequestDetails = (caseItem) => {
    setSelectedCase(caseItem);
    setShowRequestModal(true);
  };

  // Handle profile request modal
  const handleProfileRequest = () => {
    setShowProfileRequestModal(true);
  };

  // Update filtered cases when search query, sort options, or related cases change
  useEffect(() => {
    const filtered = filterAndSortCases(relatedCases, caseSearchQuery, caseSortBy, caseSortOrder);
    setFilteredCases(filtered);
    setCurrentPage(1); // Reset to first page when filtering
  }, [relatedCases, caseSearchQuery, caseSortBy, caseSortOrder]);

  const getRiskColor = (level) => {
    switch (level) {
      case 'Low':
        return 'bg-emerald-50 text-emerald-600 ring-emerald-200';
      case 'Medium':
        return 'bg-amber-50 text-amber-600 ring-amber-200';
      case 'High':
        return 'bg-red-50 text-red-600 ring-red-200';
      default:
        return 'bg-slate-50 text-slate-600 ring-slate-200';
    }
  };

  const getRiskScoreColor = (score) => {
    if (score <= 30) return 'text-emerald-600';
    if (score <= 70) return 'text-amber-600';
    return 'text-red-600';
  };

  const getProgressBarColor = (score) => {
    if (score <= 30) return 'bg-emerald-500';
    if (score <= 70) return 'bg-amber-500';
    return 'bg-red-500';
  };

  if (isLoading) {
  return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-sky-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading bank details...</p>
        </div>
      </div>
    );
  }

  if (error && !bankData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Error Loading Bank</h2>
          <p className="text-slate-600 mb-4">{error}</p>
            <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700 transition-colors"
            >
            <ArrowLeft className="h-4 w-4" />
            Go Back
            </button>
        </div>
      </div>
    );
  }

  if (!bankData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Building2 className="h-16 w-16 text-slate-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Bank Not Found</h2>
          <p className="text-slate-600 mb-4">The requested bank could not be found.</p>
            <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700 transition-colors"
            >
            <ArrowLeft className="h-4 w-4" />
            Go Back
            </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Fixed Header */}
      <div className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
            <button
                onClick={() => navigate(-1)}
                className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors"
            >
                <ArrowLeft className="h-5 w-5" />
                Back
            </button>
              <div className="h-6 w-px bg-slate-300" />
              <div className="flex items-center gap-3">
                  <img
                    src={bankData.logo}
                    alt={`${bankData.name} logo`}
                  className="h-8 w-8 rounded object-contain"
                    onError={(e) => {
                    e.target.src = '/banks/default-bank.jpeg';
                    }}
                  />
                <div>
                  <h1 className="text-lg font-semibold text-slate-900">{bankData.name}</h1>
                  <p className="text-sm text-slate-500">{bankData.status}</p>
      </div>
            </div>
            <div className="flex items-center gap-3">
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
            {/* Bank Information */}
            <div className="bg-white rounded-lg border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-blue-600" />
                  Bank Information
                </h2>
                <button className="text-slate-400 hover:text-slate-600">
                  <RefreshCw className="h-5 w-5" />
                </button>
                </div>
              
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div className="space-y-4">
                    <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
                      <div className="flex items-center space-x-2 mb-1">
                        <Building2 className="w-4 h-4 text-blue-600" />
                        <span className="text-xs font-medium text-blue-800 uppercase tracking-wide">Bank Name</span>
                      </div>
                      <p className="text-sm font-semibold text-blue-900">{bankData.name}</p>
                      {bankData.shortName && bankData.shortName !== bankData.name && (
                        <p className="text-xs text-blue-700">Short: {bankData.shortName}</p>
                      )}
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center space-x-2 mb-1">
                        <Calendar className="w-4 h-4 text-gray-600" />
                        <span className="text-xs font-medium text-gray-700 uppercase tracking-wide">Established</span>
                      </div>
                      <p className="text-sm font-semibold text-gray-900">{bankData.established}</p>
                      <p className="text-xs text-gray-600">{bankData.incorporated}</p>
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center space-x-2 mb-1">
                        <Shield className="w-4 h-4 text-gray-600" />
                        <span className="text-xs font-medium text-gray-700 uppercase tracking-wide">Bank Code</span>
                      </div>
                      <p className="text-sm font-semibold text-gray-900">{bankData.bankCode}</p>
                    <p className="text-xs text-gray-600">SWIFT: {bankData.swiftCode}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
                      <div className="flex items-center space-x-2 mb-1">
                        <MapPin className="w-4 h-4 text-green-600" />
                      <span className="text-xs font-medium text-green-800 uppercase tracking-wide">Headquarters</span>
                      </div>
                    <p className="text-sm font-semibold text-green-900">{bankData.headquarters}</p>
                    <p className="text-xs text-green-700">{bankData.address}</p>
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center space-x-2 mb-1">
                      <Phone className="w-4 h-4 text-gray-600" />
                      <span className="text-xs font-medium text-gray-700 uppercase tracking-wide">Contact</span>
                      </div>
                    <p className="text-sm font-semibold text-gray-900">{bankData.phone}</p>
                    <p className="text-xs text-gray-600">{bankData.email}</p>
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center space-x-2 mb-1">
                      <Globe className="w-4 h-4 text-gray-600" />
                      <span className="text-xs font-medium text-gray-700 uppercase tracking-wide">Website</span>
                </div>
                    <a href={bankData.website} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-blue-600 hover:text-blue-800">
                      {bankData.website}
                    </a>
                </div>
                </div>
                </div>
                </div>

            {/* Previous Names */}
            {bankData.previousNames && bankData.previousNames.length > 0 && (
              <div className="bg-white rounded-lg border border-slate-200 p-6">
                <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2 mb-4">
                  <History className="h-5 w-5 text-purple-600" />
                    Previous Names
                </h3>
                <div className="flex flex-wrap gap-2">
                  {bankData.previousNames.map((name, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800"
                    >
                      {name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Affiliations */}
            <div className="bg-white rounded-lg border border-slate-200 p-6">
              <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2 mb-4">
                <Building2 className="h-5 w-5 text-green-600" />
                Affiliations
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <Building2 className="w-4 h-4 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900">Ghana Association of Bankers</p>
                        <p className="text-xs text-slate-600">Member since 2010</p>
                          </div>
                      </div>
                    <span className="text-xs text-green-600 font-medium">Active</span>
                    </div>
                  
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <Shield className="w-4 h-4 text-blue-600" />
              </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900">Bank of Ghana</p>
                        <p className="text-xs text-slate-600">Licensed Commercial Bank</p>
                      </div>
                    </div>
                    <span className="text-xs text-blue-600 font-medium">Licensed</span>
                  </div>
                    </div>
                    
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
                        <Star className="w-4 h-4 text-amber-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900">Ghana Stock Exchange</p>
                        <p className="text-xs text-slate-600">Listed Company</p>
                      </div>
                    </div>
                    <span className="text-xs text-amber-600 font-medium">Listed</span>
                    </div>
                    
                  <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                        <Users className="w-4 h-4 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900">International Banking Association</p>
                        <p className="text-xs text-slate-600">Member since 2015</p>
                      </div>
                    </div>
                    <span className="text-xs text-purple-600 font-medium">Member</span>
                  </div>
                </div>
                    </div>
                  </div>
                  
            {/* Financial Risk Profile */}
            {analytics && (
              <div className="bg-white rounded-lg border border-slate-200 p-6">
                <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2 mb-4">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                  Financial Risk Profile
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="relative w-32 h-32 mx-auto mb-4">
                        <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
                          <circle
                            cx="50"
                            cy="50"
                            r="40"
                            stroke="#e5e7eb"
                            strokeWidth="8"
                            fill="none"
                          />
                          <circle
                            cx="50"
                            cy="50"
                            r="40"
                            stroke={analytics.risk_score <= 30 ? '#10b981' : analytics.risk_score <= 70 ? '#f59e0b' : '#ef4444'}
                            strokeWidth="8"
                            fill="none"
                            strokeDasharray={`${(analytics.risk_score / 100) * 251.2} 251.2`}
                            className="transition-all duration-1000 ease-out"
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className={`text-3xl font-bold ${getRiskScoreColor(analytics.risk_score)}`}>
                            {analytics.risk_score}
                          </span>
                      </div>
                      </div>
                      <div className="space-y-1">
                        <p className={`text-xl font-semibold ${getRiskScoreColor(analytics.risk_score)}`}>
                          {analytics.risk_level} Risk
                        </p>
                        <p className="text-sm text-slate-600">Financial Risk Score</p>
                      </div>
                    </div>
                    </div>
                    
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium text-slate-700 mb-3">Risk Assessment Details</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-600">Credit Risk:</span>
                          <span className="font-semibold text-slate-900">{analytics.credit_risk || 'N/A'}</span>
                      </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-600">Market Risk:</span>
                          <span className="font-semibold text-slate-900">{analytics.market_risk || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-600">Operational Risk:</span>
                          <span className="font-semibold text-slate-900">{analytics.operational_risk || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-600">Liquidity Risk:</span>
                          <span className="font-semibold text-slate-900">{analytics.liquidity_risk || 'N/A'}</span>
                        </div>
                      </div>
                    </div>
                    
                    {analytics.risk_factors && analytics.risk_factors.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-slate-700 mb-2">Key Risk Factors</h4>
                        <div className="flex flex-wrap gap-1">
                          {analytics.risk_factors.slice(0, 6).map((factor, index) => (
                            <span key={index} className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded">
                              {factor}
                            </span>
                          ))}
                          {analytics.risk_factors.length > 6 && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                              +{analytics.risk_factors.length - 6} more
                            </span>
                          )}
                      </div>
                      </div>
                    )}
                    </div>
                  </div>
                </div>
              )}
                    
            {/* Tabs */}
            <div className="bg-white rounded-lg border border-slate-200">
              <div className="border-b border-slate-200">
                <nav className="flex space-x-8 px-6" aria-label="Tabs">
                  {['manager', 'board', 'secretaries', 'auditors', 'capital', 'shareholders', 'employees'].map((tab) => (
                <button
                      key={tab}
                      className={`py-4 px-1 border-b-2 font-medium text-sm capitalize ${
                        activeTab === tab
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                      }`}
                      onClick={() => setActiveTab(tab)}
                    >
                      {tab === 'board' ? 'Board of Directors' : 
                       tab === 'secretaries' ? 'Secretaries' :
                       tab === 'auditors' ? 'Auditors' :
                       tab === 'capital' ? 'Capital Details' :
                       tab === 'shareholders' ? 'Shareholders' : tab}
                </button>
                  ))}
                </nav>
              </div>
              
              <div className="p-6">
                {activeTab === 'manager' && (
                <div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-4">Management Team</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {managementData.map((member) => (
                        <div key={member.id} className="border border-slate-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                          <div className="flex items-start space-x-4">
                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                              <span className="text-blue-600 font-semibold text-xs">
                                {member.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                              </span>
                </div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-slate-900 mb-1">{member.name}</h4>
                              <p className="text-sm font-medium text-blue-600 mb-2">{member.position}</p>
                              <div className="space-y-1 text-xs text-slate-600">
                                <p><span className="font-medium">Tenure:</span> {member.tenure}</p>
                                <p><span className="font-medium">Qualifications:</span> {member.qualifications}</p>
                                <p><span className="font-medium">Experience:</span> {member.experience}</p>
                        </div>
                      </div>
                </div>
                      </div>
                      ))}
                    </div>
                </div>
              )}

                {activeTab === 'employees' && (
                  <div>
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-lg font-semibold text-slate-900">Employees</h3>
                      <button
                        onClick={() => window.open('/admin/employees', '_blank')}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Manage Employees
                      </button>
                    </div>
                    
                    {/* Employee Statistics */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                      <div className="bg-blue-50 rounded-lg p-4">
                        <div className="flex items-center">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                          </div>
                          <div className="ml-3">
                            <p className="text-sm font-medium text-slate-600">Total Employees</p>
                            <p className="text-2xl font-semibold text-slate-900">{employeesLoading ? '...' : employeeStats.total}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-green-50 rounded-lg p-4">
                        <div className="flex items-center">
                          <div className="p-2 bg-green-100 rounded-lg">
                            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <div className="ml-3">
                            <p className="text-sm font-medium text-slate-600">Active</p>
                            <p className="text-2xl font-semibold text-slate-900">{employeesLoading ? '...' : employeeStats.active}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-yellow-50 rounded-lg p-4">
                        <div className="flex items-center">
                          <div className="p-2 bg-yellow-100 rounded-lg">
                            <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <div className="ml-3">
                            <p className="text-sm font-medium text-slate-600">On Leave</p>
                            <p className="text-2xl font-semibold text-slate-900">{employeesLoading ? '...' : employeeStats.onLeave}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-purple-50 rounded-lg p-4">
                        <div className="flex items-center">
                          <div className="p-2 bg-purple-100 rounded-lg">
                            <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                          </div>
                          <div className="ml-3">
                            <p className="text-sm font-medium text-slate-600">Departments</p>
                            <p className="text-2xl font-semibold text-slate-900">{employeesLoading ? '...' : employeeStats.departments}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Employee List */}
                    <div className="bg-white rounded-lg border border-slate-200">
                      <div className="px-6 py-4 border-b border-slate-200">
                        <h4 className="text-lg font-medium text-slate-900">Current Employees</h4>
                      </div>
                      <div className="p-6">
                        {employeesLoading ? (
                          <div className="text-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                            <p className="mt-2 text-sm text-slate-500">Loading employees...</p>
                          </div>
                        ) : employees.length === 0 ? (
                          <div className="text-center py-12">
                            <svg className="mx-auto h-12 w-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            <h3 className="mt-2 text-sm font-medium text-slate-900">No employees found</h3>
                            <p className="mt-1 text-sm text-slate-500">Get started by adding employees to this bank.</p>
                            <div className="mt-6">
                              <button
                                onClick={() => window.open('/admin/employees', '_blank')}
                                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                              >
                                <svg className="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                                Add Employee
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {employees.map((employee) => (
                              <div key={employee.id} className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                                <div className="flex items-center space-x-4">
                                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                    <span className="text-blue-600 font-medium text-sm">
                                      {employee.first_name?.[0]}{employee.last_name?.[0]}
                                    </span>
                                  </div>
                                  <div>
                                    <h4 className="text-sm font-medium text-slate-900">
                                      {employee.first_name} {employee.last_name}
                                    </h4>
                                    <p className="text-sm text-slate-500">{employee.job_title || 'Employee'}</p>
                                    <p className="text-xs text-slate-400">{employee.department || 'No department'}</p>
                                  </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                    employee.employment_status === 'active' 
                                      ? 'bg-green-100 text-green-800' 
                                      : 'bg-yellow-100 text-yellow-800'
                                  }`}>
                                    {employee.employment_status || 'Unknown'}
                                  </span>
                                  <button
                                    onClick={() => window.open(`/employee/${employee.id}`, '_blank')}
                                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                  >
                                    View Profile
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
                      
                {activeTab === 'board' && (
                      <div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-4">Board of Directors</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {managementData.map((member) => (
                        <div key={member.id} className="border border-slate-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                          <div className="flex items-start space-x-4">
                            <div className="w-12 h-12 bg-sky-100 rounded-full flex items-center justify-center">
                              <span className="text-sky-600 font-semibold text-xs">
                                {member.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                              </span>
                </div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-slate-900 mb-1">{member.name}</h4>
                              <p className="text-sm font-medium text-sky-600 mb-2">{member.position}</p>
                              <div className="space-y-1 text-xs text-slate-600">
                                <p><span className="font-medium">Tenure:</span> {member.tenure}</p>
                                <p><span className="font-medium">Qualifications:</span> {member.qualifications}</p>
                                <p><span className="font-medium">Experience:</span> {member.experience}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                        ))}
                      </div>
                      
                    {/* Board Committees */}
                    <div className="mt-8">
                      <h4 className="text-lg font-semibold text-slate-900 mb-4">Board Committees</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="bg-white rounded-lg p-4">
                          <h5 className="font-medium text-slate-900 mb-2">Audit Committee</h5>
                          <p className="text-sm text-slate-600">Oversees financial reporting and internal controls</p>
                          <p className="text-xs text-slate-500 mt-2">Chair: Dr. Kwame Asante</p>
                </div>
                        <div className="bg-white rounded-lg p-4">
                          <h5 className="font-medium text-slate-900 mb-2">Risk Management Committee</h5>
                          <p className="text-sm text-slate-600">Monitors and manages operational and financial risks</p>
                          <p className="text-xs text-slate-500 mt-2">Chair: Mrs. Efua Adjei</p>
                      </div>
                        <div className="bg-white rounded-lg p-4">
                          <h5 className="font-medium text-slate-900 mb-2">Nominations Committee</h5>
                          <p className="text-sm text-slate-600">Reviews board composition and director appointments</p>
                          <p className="text-xs text-slate-500 mt-2">Chair: Dr. Kwame Asante</p>
              </div>
                        <div className="bg-white rounded-lg p-4">
                          <h5 className="font-medium text-slate-900 mb-2">Technology Committee</h5>
                          <p className="text-sm text-slate-600">Oversees digital transformation and IT strategy</p>
                          <p className="text-xs text-slate-500 mt-2">Chair: Mrs. Efua Adjei</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
                  
                {activeTab === 'secretaries' && (
                <div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-4">Secretaries</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {[
                        { 
                          name: 'Ms. Grace Adjei', 
                          position: 'Company Secretary', 
                          experience: '12 years in corporate governance',
                          background: 'Former Legal Counsel at Ghana Stock Exchange',
                          qualifications: 'LLB, ICSA, ACIS'
                        },
                        { 
                          name: 'Mr. Samuel Ofori', 
                          position: 'Assistant Secretary', 
                          experience: '8 years in corporate affairs',
                          background: 'Former Corporate Affairs Officer at Ecobank',
                          qualifications: 'BA Law, ICSA Part I'
                        },
                        { 
                          name: 'Mrs. Comfort Asante', 
                          position: 'Compliance Secretary', 
                          experience: '10 years in regulatory compliance',
                          background: 'Former Compliance Officer at Bank of Ghana',
                          qualifications: 'MSc Banking, CAMS, CCO'
                        }
                      ].map((secretary, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                          <div className="flex items-start space-x-4">
                            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                              <span className="text-green-600 font-semibold text-xs">
                                {secretary.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                              </span>
                </div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900 mb-1">{secretary.name}</h4>
                              <p className="text-sm font-medium text-green-600 mb-2">{secretary.position}</p>
                              <div className="space-y-1 text-xs text-gray-600">
                                <p><span className="font-medium">Experience:</span> {secretary.experience}</p>
                                <p><span className="font-medium">Background:</span> {secretary.background}</p>
                                <p><span className="font-medium">Qualifications:</span> {secretary.qualifications}</p>
                      </div>
                    </div>
              </div>
                              </div>
                  ))}
                    </div>
                    
                    {/* Secretary Responsibilities */}
                    <div className="mt-6 bg-green-50 rounded-lg p-6">
                      <h5 className="text-lg font-semibold text-gray-900 mb-4">Secretarial Functions</h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-white rounded-lg p-4">
                          <h6 className="font-medium text-gray-900 mb-2">Corporate Governance</h6>
                          <p className="text-sm text-gray-600">Maintains corporate records, ensures compliance with regulatory requirements, and manages board documentation</p>
                              </div>
                        <div className="bg-white rounded-lg p-4">
                          <h6 className="font-medium text-gray-900 mb-2">Regulatory Compliance</h6>
                          <p className="text-sm text-gray-600">Monitors regulatory changes, ensures timely filings, and maintains relationships with regulatory bodies</p>
                              </div>
                        <div className="bg-white rounded-lg p-4">
                          <h6 className="font-medium text-gray-900 mb-2">Board Support</h6>
                          <p className="text-sm text-gray-600">Coordinates board meetings, prepares agendas, and ensures proper documentation of board decisions</p>
                            </div>
                        <div className="bg-white rounded-lg p-4">
                          <h6 className="font-medium text-gray-900 mb-2">Shareholder Relations</h6>
                          <p className="text-sm text-gray-600">Manages shareholder communications, annual general meetings, and dividend distributions</p>
                          </div>
                            </div>
                          </div>
                    </div>
                  )}

                {activeTab === 'auditors' && (
                <div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-4">External Auditors</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {[
                        { 
                          name: 'PricewaterhouseCoopers', 
                          position: 'Principal Auditor', 
                          experience: '15 years with the bank',
                          background: 'Big 4 accounting firm with extensive banking experience',
                          qualifications: 'Chartered Accountant, ICAG',
                          tenure: '2015 - Present',
                          firm: 'PwC Ghana',
                          license: 'ICAG-001234'
                        },
                        { 
                          name: 'Ernst & Young', 
                          position: 'Secondary Auditor', 
                          experience: '8 years with the bank',
                          background: 'International accounting firm specializing in financial services',
                          qualifications: 'Chartered Accountant, ICAG',
                          tenure: '2018 - Present',
                          firm: 'EY Ghana',
                          license: 'ICAG-005678'
                        },
                        { 
                          name: 'KPMG', 
                          position: 'Tax Advisory Auditor', 
                          experience: '5 years with the bank',
                          background: 'Specialized in tax compliance and advisory services',
                          qualifications: 'Chartered Accountant, ICAG, CTA',
                          tenure: '2020 - Present',
                          firm: 'KPMG Ghana',
                          license: 'ICAG-009876'
                        }
                      ].map((auditor, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                          <div className="flex items-start space-x-4">
                            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                              <span className="text-green-600 font-semibold text-xs">
                                {auditor.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                              </span>
                </div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900 mb-1">{auditor.name}</h4>
                              <p className="text-sm font-medium text-green-600 mb-2">{auditor.position}</p>
                              <div className="space-y-1 text-xs text-gray-600">
                                <p><span className="font-medium">Experience:</span> {auditor.experience}</p>
                                <p><span className="font-medium">Background:</span> {auditor.background}</p>
                                <p><span className="font-medium">Qualifications:</span> {auditor.qualifications}</p>
                                <p><span className="font-medium">Tenure:</span> {auditor.tenure}</p>
                                <p><span className="font-medium">Firm:</span> {auditor.firm}</p>
                                <p><span className="font-medium">License:</span> {auditor.license}</p>
                        </div>
                            </div>
                          </div>
                        </div>
                      ))}
                      </div>
                      
                    {/* Audit Scope & Responsibilities */}
                    <div className="mt-6 bg-green-50 rounded-lg p-6">
                      <h5 className="text-lg font-semibold text-gray-900 mb-4">Audit Scope & Responsibilities</h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-white rounded-lg p-4">
                          <h6 className="font-medium text-gray-900 mb-2">Financial Audit</h6>
                          <p className="text-sm text-gray-600">Annual financial statement audit, internal control assessment, and regulatory compliance verification</p>
                        </div>
                        <div className="bg-white rounded-lg p-4">
                          <h6 className="font-medium text-gray-900 mb-2">Risk Assessment</h6>
                          <p className="text-sm text-gray-600">Evaluation of risk management frameworks, operational risk assessment, and compliance monitoring</p>
                        </div>
                        <div className="bg-white rounded-lg p-4">
                          <h6 className="font-medium text-gray-900 mb-2">Regulatory Reporting</h6>
                          <p className="text-sm text-gray-600">Preparation of regulatory reports, Bank of Ghana compliance verification, and statutory filings</p>
                        </div>
                        <div className="bg-white rounded-lg p-4">
                          <h6 className="font-medium text-gray-900 mb-2">Tax Compliance</h6>
                          <p className="text-sm text-gray-600">Tax return preparation, tax planning advisory, and GRA compliance verification</p>
                        </div>
                      </div>
                    </div>

                    {/* Recent Audit Reports */}
                    <div className="mt-6">
                      <h5 className="text-lg font-semibold text-gray-900 mb-4">Recent Audit Reports</h5>
                      <div className="space-y-3">
                        <div className="bg-white border border-gray-200 rounded-lg p-4">
                          <div className="flex items-center justify-between">
                <div>
                              <h6 className="font-medium text-gray-900">Annual Audit Report 2023</h6>
                              <p className="text-sm text-gray-600">Financial Year 2023 - Complete Audit</p>
                </div>
                            <div className="flex items-center space-x-2">
                              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full font-medium">
                                Clean Opinion
                              </span>
                              <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                                View Report
                              </button>
                        </div>
                          </div>
                        </div>
                        
                        <div className="bg-white border border-gray-200 rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h6 className="font-medium text-gray-900">Interim Review Q3 2024</h6>
                              <p className="text-sm text-gray-600">Third Quarter 2024 - Interim Review</p>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full font-medium">
                                Satisfactory
                              </span>
                              <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                                View Report
                              </button>
                      </div>
                    </div>
                  </div>
                  
                        <div className="bg-white border border-gray-200 rounded-lg p-4">
                          <div className="flex items-center justify-between">
                <div>
                              <h6 className="font-medium text-gray-900">Compliance Audit 2024</h6>
                              <p className="text-sm text-gray-600">Regulatory Compliance Assessment</p>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="px-2 py-1 bg-amber-100 text-amber-800 text-xs rounded-full font-medium">
                                Minor Issues
                          </span>
                              <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                                View Report
                              </button>
                </div>
              </div>
                        </div>
                      </div>
                    </div>
                </div>
              )}

                {activeTab === 'capital' && (
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-4">Capital Structure & Details</h3>
                    
                    {/* Capital Overview */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                      <div className="bg-blue-50 rounded-lg p-4">
                        <div className="flex items-center space-x-2 mb-2">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 font-semibold text-sm">AC</span>
                          </div>
                          <span className="text-sm font-medium text-blue-800">Authorized Capital</span>
                        </div>
                        <p className="text-2xl font-bold text-blue-900">GH₵ 2.5B</p>
                        <p className="text-xs text-blue-700">2,500,000,000 shares</p>
                </div>

                      <div className="bg-green-50 rounded-lg p-4">
                        <div className="flex items-center space-x-2 mb-2">
                          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                            <span className="text-green-600 font-semibold text-sm">IC</span>
                      </div>
                          <span className="text-sm font-medium text-green-800">Issued Capital</span>
                        </div>
                        <p className="text-2xl font-bold text-green-900">GH₵ 1.8B</p>
                        <p className="text-xs text-green-700">1,800,000,000 shares</p>
              </div>

                      <div className="bg-purple-50 rounded-lg p-4">
                        <div className="flex items-center space-x-2 mb-2">
                          <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                            <span className="text-purple-600 font-semibold text-sm">PC</span>
                      </div>
                          <span className="text-sm font-medium text-purple-800">Paid-up Capital</span>
                    </div>
                        <p className="text-2xl font-bold text-purple-900">GH₵ 1.2B</p>
                        <p className="text-xs text-purple-700">1,200,000,000 shares</p>
                  </div>
                  
                      <div className="bg-amber-50 rounded-lg p-4">
                        <div className="flex items-center space-x-2 mb-2">
                          <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
                            <span className="text-amber-600 font-semibold text-sm">RC</span>
                          </div>
                          <span className="text-sm font-medium text-amber-800">Reserve Capital</span>
                        </div>
                        <p className="text-2xl font-bold text-amber-900">GH₵ 600M</p>
                        <p className="text-xs text-amber-700">600,000,000 shares</p>
                      </div>
                    </div>

                    {/* Share Details */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                      <div className="bg-white border border-slate-200 rounded-lg p-6">
                        <h4 className="text-lg font-semibold text-slate-900 mb-4">Share Class Details</h4>
                  <div className="space-y-4">
                          <div className="flex justify-between items-center py-2 border-b border-slate-100">
                            <span className="text-sm font-medium text-slate-600">Ordinary Shares</span>
                            <span className="text-sm font-semibold text-slate-900">1,200,000,000</span>
                      </div>
                          <div className="flex justify-between items-center py-2 border-b border-slate-100">
                            <span className="text-sm font-medium text-slate-600">Preference Shares</span>
                            <span className="text-sm font-semibold text-slate-900">300,000,000</span>
                          </div>
                          <div className="flex justify-between items-center py-2 border-b border-slate-100">
                            <span className="text-sm font-medium text-slate-600">Treasury Shares</span>
                            <span className="text-sm font-semibold text-slate-900">50,000,000</span>
                          </div>
                          <div className="flex justify-between items-center py-2">
                            <span className="text-sm font-medium text-slate-600">Unissued Shares</span>
                            <span className="text-sm font-semibold text-slate-900">950,000,000</span>
                          </div>
                        </div>
                    </div>
                    
                      <div className="bg-white border border-slate-200 rounded-lg p-6">
                        <h4 className="text-lg font-semibold text-slate-900 mb-4">Financial Ratios</h4>
                        <div className="space-y-4">
                          <div className="flex justify-between items-center py-2 border-b border-slate-100">
                            <span className="text-sm font-medium text-slate-600">Capital Adequacy Ratio</span>
                            <span className="text-sm font-semibold text-green-600">18.5%</span>
                      </div>
                          <div className="flex justify-between items-center py-2 border-b border-slate-100">
                            <span className="text-sm font-medium text-slate-600">Tier 1 Capital Ratio</span>
                            <span className="text-sm font-semibold text-green-600">15.2%</span>
                    </div>
                          <div className="flex justify-between items-center py-2 border-b border-slate-100">
                            <span className="text-sm font-medium text-slate-600">Leverage Ratio</span>
                            <span className="text-sm font-semibold text-blue-600">8.3%</span>
                  </div>
                          <div className="flex justify-between items-center py-2">
                            <span className="text-sm font-medium text-slate-600">Return on Equity</span>
                            <span className="text-sm font-semibold text-purple-600">12.8%</span>
                </div>
                        </div>
                      </div>
                    </div>

                    {/* Capital History */}
                    <div className="bg-white border border-slate-200 rounded-lg p-6">
                      <h4 className="text-lg font-semibold text-slate-900 mb-4">Capital History & Changes</h4>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                          <div>
                            <p className="font-medium text-slate-900">Capital Increase</p>
                            <p className="text-sm text-slate-600">March 2023 - Rights Issue</p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-green-600">+GH₵ 200M</p>
                            <p className="text-xs text-slate-500">200M new shares</p>
                          </div>
              </div>
              
                        <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                          <div>
                            <p className="font-medium text-slate-900">Bonus Issue</p>
                            <p className="text-sm text-slate-600">September 2022 - 1:5 Bonus</p>
                        </div>
                          <div className="text-right">
                            <p className="font-semibold text-blue-600">+GH₵ 150M</p>
                            <p className="text-xs text-slate-500">150M bonus shares</p>
                              </div>
                            </div>
                        
                        <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                          <div>
                            <p className="font-medium text-slate-900">Share Buyback</p>
                            <p className="text-sm text-slate-600">December 2021 - Treasury Shares</p>
              </div>
                          <div className="text-right">
                            <p className="font-semibold text-purple-600">-GH₵ 50M</p>
                            <p className="text-xs text-slate-500">50M treasury shares</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'shareholders' && (
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-4">Major Shareholders</h3>
                    
                    {/* Shareholder Overview */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <div className="bg-blue-50 rounded-lg p-4">
                        <div className="flex items-center space-x-2 mb-2">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 font-semibold text-sm">TS</span>
                              </div>
                          <span className="text-sm font-medium text-blue-800">Total Shares</span>
                        </div>
                        <p className="text-2xl font-bold text-blue-900">1.8B</p>
                        <p className="text-xs text-blue-700">Outstanding shares</p>
                            </div>
                            
                      <div className="bg-green-50 rounded-lg p-4">
                        <div className="flex items-center space-x-2 mb-2">
                          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                            <span className="text-green-600 font-semibold text-sm">FS</span>
                              </div>
                          <span className="text-sm font-medium text-green-800">Free Float</span>
                              </div>
                        <p className="text-2xl font-bold text-green-900">65%</p>
                        <p className="text-xs text-green-700">Publicly traded</p>
                      </div>
                      
                      <div className="bg-purple-50 rounded-lg p-4">
                        <div className="flex items-center space-x-2 mb-2">
                          <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                            <span className="text-purple-600 font-semibold text-sm">IS</span>
                          </div>
                          <span className="text-sm font-medium text-purple-800">Institutional</span>
                        </div>
                        <p className="text-2xl font-bold text-purple-900">35%</p>
                        <p className="text-xs text-purple-700">Institutional holdings</p>
                            </div>
                          </div>
                          
                    {/* Major Shareholders List */}
                    <div className="space-y-4 mb-6">
                      <h4 className="text-lg font-semibold text-slate-900">Top 10 Shareholders</h4>
                      <div className="space-y-3">
                        {[
                          { name: 'Ghana Government', percentage: 25.5, shares: '459M', type: 'Government', change: '+2.1%' },
                          { name: 'Pension Fund Trustees', percentage: 18.2, shares: '328M', type: 'Institutional', change: '+0.8%' },
                          { name: 'International Finance Corp', percentage: 12.8, shares: '230M', type: 'International', change: '0.0%' },
                          { name: 'Ecobank Transnational', percentage: 8.5, shares: '153M', type: 'Corporate', change: '-1.2%' },
                          { name: 'Stanbic Investment', percentage: 6.2, shares: '112M', type: 'Institutional', change: '+0.5%' },
                          { name: 'Goldman Sachs', percentage: 4.8, shares: '86M', type: 'International', change: '+0.3%' },
                          { name: 'BlackRock Inc', percentage: 3.9, shares: '70M', type: 'International', change: '+0.7%' },
                          { name: 'Vanguard Group', percentage: 2.8, shares: '50M', type: 'International', change: '+0.2%' },
                          { name: 'Fidelity Investments', percentage: 2.1, shares: '38M', type: 'International', change: '-0.1%' },
                          { name: 'Other Shareholders', percentage: 15.2, shares: '274M', type: 'Retail', change: '-2.3%' }
                        ].map((shareholder, index) => (
                          <div key={index} className="bg-white border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-4">
                                <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center">
                                  <span className="text-slate-600 font-semibold text-sm">
                                    {shareholder.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                                  </span>
                            </div>
                                <div>
                                  <h5 className="font-semibold text-slate-900">{shareholder.name}</h5>
                                  <p className="text-sm text-slate-600">{shareholder.type} • {shareholder.shares} shares</p>
                          </div>
                        </div>
                              <div className="text-right">
                                <p className="text-lg font-bold text-slate-900">{shareholder.percentage}%</p>
                                <p className={`text-sm font-medium ${shareholder.change.startsWith('+') ? 'text-green-600' : shareholder.change.startsWith('-') ? 'text-red-600' : 'text-slate-600'}`}>
                                  {shareholder.change}
                                </p>
                              </div>
                            </div>
                            <div className="mt-3">
                              <div className="w-full bg-slate-200 rounded-full h-2">
                                <div 
                                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                  style={{ width: `${shareholder.percentage}%` }}
                                ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                      </div>
                    </div>

                    {/* Shareholder Categories */}
                    <div className="bg-white border border-slate-200 rounded-lg p-6">
                      <h4 className="text-lg font-semibold text-slate-900 mb-4">Shareholder Categories</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="text-center">
                          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                            <span className="text-blue-600 font-bold text-lg">25.5%</span>
                    </div>
                          <p className="font-medium text-slate-900">Government</p>
                          <p className="text-sm text-slate-600">459M shares</p>
                        </div>
                        <div className="text-center">
                          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                            <span className="text-green-600 font-bold text-lg">35.0%</span>
                          </div>
                          <p className="font-medium text-slate-900">Institutional</p>
                          <p className="text-sm text-slate-600">630M shares</p>
                        </div>
                        <div className="text-center">
                          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                            <span className="text-purple-600 font-bold text-lg">25.0%</span>
                          </div>
                          <p className="font-medium text-slate-900">International</p>
                          <p className="text-sm text-slate-600">450M shares</p>
                        </div>
                        <div className="text-center">
                          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-2">
                            <span className="text-amber-600 font-bold text-lg">14.5%</span>
                          </div>
                          <p className="font-medium text-slate-900">Retail</p>
                          <p className="text-sm text-slate-600">261M shares</p>
                        </div>
                      </div>
                    </div>
                </div>
              )}

              </div>
            </div>

            {/* Related Cases */}
            <div className="bg-white rounded-lg border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                  <Scale className="h-5 w-5 text-blue-600" />
                  Related Cases ({filteredCases.length} of {relatedCases.length})
                </h2>
                <button className="text-slate-400 hover:text-slate-600">
                  <RefreshCw className="h-5 w-5" />
                </button>
              </div>
              
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
                  <div className="flex gap-2">
                <select
                            value={caseSortBy}
                            onChange={(e) => setCaseSortBy(e.target.value)}
                      className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="date">Sort by Date</option>
                            <option value="title">Sort by Title</option>
                      <option value="court">Sort by Court</option>
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
                            onClick={() => {
                              setCaseSearchQuery('');
                              setCaseSortBy('date');
                              setCaseSortOrder('desc');
                            }}
                      className="px-4 py-2 text-slate-600 hover:text-slate-800 transition-colors"
                          >
                      Clear
                          </button>
                        </div>
                    </div>
              </div>

              {/* Cases List */}
                  {casesLoading ? (
                    <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-slate-600">Loading cases...</p>
                    </div>
                  ) : filteredCases.length > 0 ? (
              <div className="space-y-4">
                  {filteredCases.map((caseItem) => (
                    <div key={caseItem.id} className="bg-slate-50 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between">
                      <div className="flex-1">
                          <h4 className="font-semibold text-slate-900 mb-2">{caseItem.title}</h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-sm text-slate-600 mb-3">
                            <div>
                              <span className="font-medium">Suit Number:</span> {caseItem.suit_reference_number}
                      </div>
                      <div>
                              <span className="font-medium">Court:</span> {caseItem.court_type || 'N/A'}
                      </div>
                      <div>
                              <span className="font-medium">Date:</span> {caseItem.date ? new Date(caseItem.date).toLocaleDateString('en-US', { 
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric' 
                              }) : 'N/A'}
                      </div>
                      <div>
                              <span className="font-medium">Nature:</span> {caseItem.area_of_law || 'N/A'}
                      </div>
                      </div>
                          {caseItem.ai_case_outcome && (
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-slate-600">Outcome:</span>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                caseItem.ai_case_outcome === 'WON' ? 'bg-emerald-100 text-emerald-800' :
                                caseItem.ai_case_outcome === 'LOST' ? 'bg-red-100 text-red-800' :
                                'bg-amber-100 text-amber-800'
                              }`}>
                                {caseItem.ai_case_outcome}
                              </span>
                    </div>
                          )}
                        </div>
                        <div className="ml-4 flex gap-2">
                        <button 
                          onClick={() => handleRequestDetails(caseItem)}
                            className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                        >
                          Request Details
                        </button>
                        <button 
                            onClick={() => navigate(`/case-details/${caseItem.id}`)}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                        >
                            View Case
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Scale className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-500">No related cases found for this bank.</p>
                  {caseSearchQuery && (
                    <p className="text-sm text-slate-400 mt-2">Try adjusting your search criteria.</p>
                  )}
                    </div>
                  )}
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Risk Assessment */}
            {analytics && (
              <div className="bg-white rounded-lg border border-slate-200 p-6">
                <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2 mb-4">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                  Financial Risk Assessment
                  {analyticsLoading && <RefreshCw className="h-4 w-4 animate-spin text-red-600" />}
                </h3>
                {analyticsLoading ? (
                  <div className="space-y-3">
                    <div className="animate-pulse">
                      <div className="h-4 bg-gray-200 rounded mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  </div>
              </div>
                ) : (
                  <>
                    <div className="text-center mb-4">
                      <div className="relative w-24 h-24 mx-auto mb-2">
                        <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
                          <circle
                            cx="50"
                            cy="50"
                            r="40"
                            stroke="#e5e7eb"
                            strokeWidth="8"
                            fill="none"
                          />
                          <circle
                            cx="50"
                            cy="50"
                            r="40"
                            stroke={analytics.risk_score <= 30 ? '#10b981' : analytics.risk_score <= 70 ? '#f59e0b' : '#ef4444'}
                            strokeWidth="8"
                            fill="none"
                            strokeDasharray={`${(analytics.risk_score / 100) * 251.2} 251.2`}
                            className="transition-all duration-1000 ease-out"
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className={`text-2xl font-bold ${getRiskScoreColor(analytics.risk_score)}`}>
                            {analytics.risk_score}
                        </span>
                  </div>
                    </div>
                      <div className="space-y-1">
                        <p className={`text-lg font-semibold ${getRiskScoreColor(analytics.risk_score)}`}>
                          {analytics.risk_level} Risk
                        </p>
                        <p className="text-sm text-slate-600">Financial Risk Score</p>
                </div>
          </div>

                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600">Resolved:</span>
                        <span className="font-semibold text-green-600">{caseStats?.resolved_cases || 0}</span>
                </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600">Unresolved:</span>
                        <span className="font-semibold text-orange-600">{caseStats?.unresolved_cases || 0}</span>
                </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600">Mixed:</span>
                        <span className="font-semibold text-yellow-600">{caseStats?.mixed_cases || 0}</span>
              </div>
                    </div>
                    
                    {analytics.risk_factors && analytics.risk_factors.length > 0 && (
                      <div className="text-left mt-4">
                        <p className="text-xs font-medium text-slate-700 mb-2">Key Risk Factors:</p>
                        <div className="flex flex-wrap gap-1">
                          {analytics.risk_factors.slice(0, 4).map((factor, index) => (
                            <span key={index} className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded">
                              {factor}
                  </span>
                          ))}
                          {analytics.risk_factors.length > 4 && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                              +{analytics.risk_factors.length - 4} more
                            </span>
                          )}
                </div>
                  </div>
                )}
                  </>
                )}
              </div>
            )}

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

      {/* Request Details Modal */}
      <RequestDetailsModal
        isOpen={showRequestModal}
        onClose={() => setShowRequestModal(false)}
        caseData={selectedCase}
        entityType="Bank"
        entityName={bankData?.name}
      />

      {/* Profile Request Modal */}
      <RequestDetailsModal
        isOpen={showProfileRequestModal}
        onClose={() => setShowProfileRequestModal(false)}
        caseData={null}
        entityType="Bank"
        entityName={bankData?.name}
        isProfileRequest={true}
              />
            </div>
            </div>
          </div>
        </div>
    </div>
  );
};

export default BankDetail;
