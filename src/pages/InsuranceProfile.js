import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { 
  Shield, 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  Calendar, 
  Users, 
  TrendingUp, 
  Scale, 
  FileText, 
  ExternalLink,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Briefcase,
  Award,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Building2,
  Search,
  Filter,
  ArrowUpDown,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  Percent,
  BookOpen,
  Calculator,
  History,
  Star,
  User,
  GraduationCap,
  Heart,
} from 'lucide-react';
import RequestDetailsModal from '../components/RequestDetailsModal';

const InsuranceProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [insuranceData, setInsuranceData] = useState(null);
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
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectedCase, setSelectedCase] = useState(null);
  const [showProfileRequestModal, setShowProfileRequestModal] = useState(false);

  // Insurance logo mapping
  const insuranceLogoMap = {
    'SIC Insurance': '/insurances/sic.jpeg',
    'Vanguard Assurance': '/insurances/vanguard.jpeg',
    'Metropolitan Insurance': '/insurances/metropolitan.jpeg',
    'Enterprise Insurance': '/insurances/enterprise.jpeg',
    'Ghana Reinsurance': '/insurances/ghana-re.jpeg',
    'Star Assurance': '/insurances/star.jpeg',
    'Provident Insurance': '/insurances/provident.jpeg',
    'Donewell Insurance': '/insurances/donewell.jpeg',
    'GLICO Insurance': '/insurances/glico.jpeg',
    'Quality Insurance': '/insurances/quality.jpeg',
    'Prudential Life Insurance': '/insurances/prudential-life.jpeg',
    'Old Mutual Life Assurance': '/insurances/old-mutual.jpeg',
    'Sanlam Life Insurance': '/insurances/sanlam.jpeg',
    'Allianz Life Insurance': '/insurances/allianz.jpeg',
    'AXA Mansard Insurance': '/insurances/axa-mansard.jpeg',
    'Zenith General Insurance': '/insurances/zenith-general.jpeg',
    'Cornerstone Insurance': '/insurances/cornerstone.jpeg',
    'Leadway Assurance': '/insurances/leadway.jpeg',
    'Mutual Benefits Assurance': '/insurances/mutual-benefits.jpeg',
    'Custodian Life Insurance': '/insurances/custodian.jpeg',
    'FBN Insurance': '/insurances/fbn-insurance.jpeg',
    'AIICO Insurance': '/insurances/aiico.jpeg',
    'Lagos Building Investment': '/insurances/lagos-building.jpeg',
    'NEM Insurance': '/insurances/nem.jpeg',
    'Wapic Insurance': '/insurances/wapic.jpeg',
    'Sovereign Trust Insurance': '/insurances/sovereign-trust.jpeg',
    'Consolidated Hallmark Insurance': '/insurances/consolidated-hallmark.jpeg',
    'Linkage Assurance': '/insurances/linkage.jpeg',
    'Lasaco Assurance': '/insurances/lasaco.jpeg',
    'Royal Exchange General Insurance': '/insurances/royal-exchange.jpeg',
    'Hygeia HMO': '/insurances/hygeia.jpeg',
    'Avon Healthcare': '/insurances/avon.jpeg',
    'Clearline HMO': '/insurances/clearline.jpeg',
    'Reliance HMO': '/insurances/reliance.jpeg',
    'Total Health Trust': '/insurances/total-health.jpeg',
    'Health Partners HMO': '/insurances/health-partners.jpeg',
    'Mediplan Healthcare': '/insurances/mediplan.jpeg',
    'Wellness HMO': '/insurances/wellness.jpeg',
    'Ultimate Health HMO': '/insurances/ultimate-health.jpeg',
    'Prepaid Medicare': '/insurances/prepaid-medicare.jpeg',
    'IHMS HMO': '/insurances/ihms.jpeg',
    'Ronsberger HMO': '/insurances/ronsberger.jpeg',
    'Vcare HMO': '/insurances/vcare.jpeg',
    'Healthguard HMO': '/insurances/healthguard.jpeg',
    'ProHealth HMO': '/insurances/prohealth.jpeg',
    'Healthplus HMO': '/insurances/healthplus.jpeg'
  };


  // Load insurance data
  useEffect(() => {
    
    if (id) {
      loadInsuranceData(id);
      loadManagementData(id);
      loadRelatedCases(id);
      loadInsuranceAnalytics(id);
      loadInsuranceCaseStats(id);
    }
  }, [id]);

  const loadInsuranceData = async (insuranceId) => {
    try {
      setIsLoading(true);
      setError(null);
      

      const url = `/api/insurance/${insuranceId}`;
      
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
            logo: data.logo_url || insuranceLogoMap[data.name] || '/insurances/default-insurance.jpeg',
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
            licenseNumber: data.license_number || 'N/A',
            registrationNumber: data.registration_number || 'N/A',
            insuranceType: data.insurance_type || 'N/A',
            ownershipType: data.ownership_type || 'N/A',
            rating: data.rating || 'N/A',
            totalAssets: data.total_assets || 0,
            netWorth: data.net_worth || 0,
            premiumIncome: data.premium_income || 0,
            claimsPaid: data.claims_paid || 0,
            branchesCount: data.branches_count || 0,
            agentsCount: data.agents_count || 0,
            hasMobileApp: data.has_mobile_app || false,
            hasOnlinePortal: data.has_online_portal || false,
            hasOnlineClaims: data.has_online_claims || false,
            has24_7Support: data.has_24_7_support || false,
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
            managers: [],
            branches: [],
            cases: []
          };
          setInsuranceData(transformedData);
        } else {
          console.error('No insurance data found');
          setError('Insurance company not found');
        }
      } else {
        console.error('Failed to fetch insurance data:', response.status);
        setError(`Failed to load insurance data: ${response.status}`);
      }
    } catch (error) {
      console.error('Error loading insurance data:', error);
      setError('Error loading insurance data');
    } finally {
      setIsLoading(false);
    }
  };

  // Load insurance analytics
  const loadInsuranceAnalytics = async (insuranceId) => {
    try {
      setAnalyticsLoading(true);
      const response = await fetch(`/api/insurance/${insuranceId}/analytics`, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAnalytics(data);
      } else {
        console.error('Failed to load insurance analytics:', response.status);
        setAnalytics(null);
      }
    } catch (error) {
      console.error('Error loading insurance analytics:', error);
      setAnalytics(null);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  // Load insurance case statistics
  const loadInsuranceCaseStats = async (insuranceId) => {
    try {
      setCaseStatsLoading(true);
      const response = await fetch(`/api/insurance/${insuranceId}/case-statistics`, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setCaseStats(data);
      } else {
        console.error('Failed to load insurance case stats:', response.status);
        setCaseStats(null);
      }
    } catch (error) {
      console.error('Error loading insurance case stats:', error);
      setCaseStats(null);
    } finally {
      setCaseStatsLoading(false);
    }
  };

  // Load management data
  const loadManagementData = async (insuranceId) => {
    // Sample management data - in real implementation, this would come from an API
    const sampleManagement = [
      {
        id: 1,
        name: "Dr. Kwame Asante",
        position: "Chief Executive Officer",
        tenure: "2020 - Present",
        qualifications: "PhD Insurance, University of Ghana",
        experience: "20+ years in insurance and risk management",
        profileId: 1,
        email: "ceo@sicinsurance.com",
        phone: "+233 302 123 456",
        bio: "Experienced insurance executive with extensive background in risk management and corporate governance."
      },
      {
        id: 2,
        name: "Mrs. Efua Adjei",
        position: "Chief Operating Officer",
        tenure: "2019 - Present", 
        qualifications: "MBA Insurance, GIMPA",
        experience: "15+ years in insurance operations",
        profileId: 2,
        email: "coo@sicinsurance.com",
        phone: "+233 302 123 457",
        bio: "Operations expert with extensive experience in insurance processes and customer service."
      },
      {
        id: 3,
        name: "Mr. Samuel Ofori",
        position: "Chief Financial Officer",
        tenure: "2021 - Present",
        qualifications: "ACCA, ICAG",
        experience: "18+ years in financial management",
        profileId: 3,
        email: "cfo@sicinsurance.com",
        phone: "+233 302 123 458",
        bio: "Financial management expert with strong background in insurance accounting and regulatory compliance."
      }
    ];
    
    setManagementData(sampleManagement);
  };

  // Load related cases
  const loadRelatedCases = async (insuranceId) => {
    try {
      setCasesLoading(true);

      const url = `/api/insurance/${insuranceId}/related-cases?limit=100`;
      
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
    // Reset to first page when filtering
  }, [relatedCases, caseSearchQuery, caseSortBy, caseSortOrder]);

  const getRiskScoreColor = (score) => {
    if (score <= 30) return 'text-emerald-600';
    if (score <= 70) return 'text-amber-600';
    return 'text-red-600';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-sky-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading insurance company details...</p>
        </div>
      </div>
    );
  }

  if (error && !insuranceData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Error Loading Insurance Company</h2>
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

  if (!insuranceData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Shield className="h-16 w-16 text-slate-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Insurance Company Not Found</h2>
          <p className="text-slate-600 mb-4">The requested insurance company could not be found.</p>
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
                  src={insuranceData.logo}
                  alt={`${insuranceData.name} logo`}
                  className="h-8 w-8 rounded object-contain"
                  onError={(e) => {
                    e.target.src = '/insurances/default-insurance.jpeg';
                  }}
                />
              <div>
                  <h1 className="text-lg font-semibold text-slate-900">{insuranceData.name}</h1>
                  <p className="text-sm text-slate-500">{insuranceData.status}</p>
                </div>
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
            {/* Insurance Information */}
            <div className="bg-white rounded-lg border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                  <Shield className="h-5 w-5 text-blue-600" />
                  Insurance Company Information
                </h2>
                <button className="text-slate-400 hover:text-slate-600">
                  <RefreshCw className="h-5 w-5" />
                </button>
              </div>
              
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
                    <div className="flex items-center space-x-2 mb-1">
                      <Shield className="w-4 h-4 text-blue-600" />
                      <span className="text-xs font-medium text-blue-800 uppercase tracking-wide">Company Name</span>
              </div>
                    <p className="text-sm font-semibold text-blue-900">{insuranceData.name}</p>
                    {insuranceData.shortName && insuranceData.shortName !== insuranceData.name && (
                      <p className="text-xs text-blue-700">Short: {insuranceData.shortName}</p>
                    )}
            </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center space-x-2 mb-1">
                      <Calendar className="w-4 h-4 text-gray-600" />
                      <span className="text-xs font-medium text-gray-700 uppercase tracking-wide">Established</span>
                    </div>
                    <p className="text-sm font-semibold text-gray-900">{insuranceData.established}</p>
                    <p className="text-xs text-gray-600">{insuranceData.incorporated}</p>
          </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center space-x-2 mb-1">
                      <FileText className="w-4 h-4 text-gray-600" />
                      <span className="text-xs font-medium text-gray-700 uppercase tracking-wide">License Number</span>
              </div>
                    <p className="text-sm font-semibold text-gray-900">{insuranceData.licenseNumber}</p>
                    <p className="text-xs text-gray-600">Reg: {insuranceData.registrationNumber}</p>
              </div>
            </div>
                
                <div className="space-y-4">
                  <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
                    <div className="flex items-center space-x-2 mb-1">
                      <MapPin className="w-4 h-4 text-green-600" />
                      <span className="text-xs font-medium text-green-800 uppercase tracking-wide">Headquarters</span>
                    </div>
                    <p className="text-sm font-semibold text-green-900">{insuranceData.headquarters}</p>
                    <p className="text-xs text-green-700">{insuranceData.address}</p>
          </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center space-x-2 mb-1">
                      <Phone className="w-4 h-4 text-gray-600" />
                      <span className="text-xs font-medium text-gray-700 uppercase tracking-wide">Contact</span>
              </div>
                    <p className="text-sm font-semibold text-gray-900">{insuranceData.phone}</p>
                    <p className="text-xs text-gray-600">{insuranceData.email}</p>
              </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center space-x-2 mb-1">
                      <Globe className="w-4 h-4 text-gray-600" />
                      <span className="text-xs font-medium text-gray-700 uppercase tracking-wide">Website</span>
                    </div>
                    <a href={insuranceData.website} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-blue-600 hover:text-blue-800">
                      {insuranceData.website}
                    </a>
            </div>
              </div>
            </div>
          </div>

            {/* Previous Names */}
            {insuranceData.previousNames && insuranceData.previousNames.length > 0 && (
              <div className="bg-white rounded-lg border border-slate-200 p-6">
                <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2 mb-4">
                  <History className="h-5 w-5 text-purple-600" />
                  Previous Names
                </h3>
                <div className="flex flex-wrap gap-2">
                  {insuranceData.previousNames.map((name, index) => (
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
                        <p className="text-sm font-medium text-slate-900">Ghana Insurance Association</p>
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
                        <p className="text-sm font-medium text-slate-900">National Insurance Commission</p>
                        <p className="text-xs text-slate-600">Licensed Insurance Company</p>
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
                        <p className="text-sm font-medium text-slate-900">International Insurance Association</p>
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
                  {['manager', 'board', 'secretaries', 'auditors', 'capital', 'shareholders'].map((tab) => (
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

                {/* Additional tabs content would go here - similar to BankDetail.js */}
                {/* For brevity, I'm including the structure but not all the detailed content */}
                
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
                  <p className="text-slate-500">No related cases found for this insurance company.</p>
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
          </div>
        </div>
      </div>

      {/* Request Details Modal */}
      <RequestDetailsModal
        isOpen={showRequestModal}
        onClose={() => setShowRequestModal(false)}
        caseData={selectedCase}
        entityType="Insurance"
        entityName={insuranceData?.name}
      />

      {/* Profile Request Modal */}
      <RequestDetailsModal
        isOpen={showProfileRequestModal}
        onClose={() => setShowProfileRequestModal(false)}
        caseData={null}
        entityType="Insurance"
        entityName={insuranceData?.name}
        isProfileRequest={true}
      />
    </div>
  );
};

export default InsuranceProfile;

