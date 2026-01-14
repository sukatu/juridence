import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Shield, Calendar, MapPin, Phone, Mail, TrendingUp, AlertTriangle, CheckCircle, Clock, User, Scale, FileText, Send, ChevronLeft, ChevronRight, Eye, EyeOff, Globe, CreditCard, Smartphone, DollarSign, Star, Award, ExternalLink, Download, XCircle, Users, Briefcase, GraduationCap, Search, Filter, ArrowUpDown, Building2, Heart, Car, Home, Briefcase as BriefcaseIcon, UserCheck, Zap, Globe as GlobeIcon, Shield as ShieldIcon } from 'lucide-react';

const InsuranceDetail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [companyData, setCompanyData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedSections, setExpandedSections] = useState({
    basicInfo: true,
    contactInfo: true,
    services: true,
    financialInfo: true,
    management: true,
    cases: true,
    previousNames: true
  });
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectedCase, setSelectedCase] = useState(null);
  const [requestType, setRequestType] = useState('case_details');
  const [requestMessage, setRequestMessage] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [managementData, setManagementData] = useState([]);
  const [relatedCases, setRelatedCases] = useState([]);
  const [filteredCases, setFilteredCases] = useState([]);
  const [casesLoading, setCasesLoading] = useState(false);
  const [totalCases, setTotalCases] = useState(0);
  const [caseSearchQuery, setCaseSearchQuery] = useState('');
  const [caseSortBy, setCaseSortBy] = useState('date');
  const [caseSortOrder, setCaseSortOrder] = useState('desc');

  // Insurance logo mapping
  const insuranceLogoMap = {
    'ACACIA Insurance': '/insurances/ACACIA.jpeg',
    'ACE Insurance': '/insurances/ACE.png',
    'ACTVA Insurance': '/insurances/ACTVA.jpeg',
    'APEX Insurance': '/insurances/APEX.png',
    'ASTERLIFE Insurance': '/insurances/ASTERLIFE.htm',
    'BEDROCK Insurance': '/insurances/BEDROCK.png',
    'BEIGE ASSURE Insurance': '/insurances/BEIGE ASSURE.png',
    'BEST Insurance': '/insurances/BEST.jpeg',
    'CORONATION Insurance': '/insurances/CORONATION.png',
    'COSMOPOLITAN Insurance': '/insurances/COSMOPOLITAN.png',
    'DONEWELL Insurance': '/insurances/DONEWELL.png',
    'DOSH Insurance': '/insurances/DOSH.jpeg',
    'ENTERPRISE LIFE Insurance': '/insurances/ENTERPRISE LIFE.png',
    'ENTERPRISE Insurance': '/insurances/ENTERPRISE.png',
    'EQUITY Insurance': '/insurances/EQUITY.jpeg',
    'ESICH LIFE Insurance': '/insurances/ESICH LIFE.jpeg',
    'FIRST Insurance': '/insurances/FIRST INSURANCE.jpeg',
    'GHANA LIFE INSURANCE': '/insurances/GHANA LIFE INSURANCE.png',
    'GHANA UNION ASSURANCE': '/insurances/GHANA UNION ASSURANCE.png',
    'GHIC Insurance': '/insurances/GHIC.png',
    'GLICO Insurance': '/insurances/GLICO.png',
    'GLICO GENERAL Insurance': '/insurances/GLICO GENERAL.png',
    'HERITAGE ENERGY Insurance': '/insurances/HERITAGE ENERGY INSURANCE.png',
    'HOLLARD Insurance': '/insurances/HOLLARD.jpeg',
    'IMPACT LIFE Insurance': '/insurances/IMPACT LIFE INSURANCE.jpeg',
    'IMPERIAL Insurance': '/insurances/IMPERIAL.jpeg',
    'LOYALTY Insurance': '/insurances/LOYALTY.jpeg',
    'METROPOLITAN Insurance': '/insurances/METROPOLITAN.jpeg',
    'MILLENNIUM Insurance': '/insurances/MILLENNIUM.png',
    'NATIONAWIDE MEDICAL Insurance': '/insurances/NATIONAWIDE MEDICAL.png',
    'NSIA Insurance': '/insurances/NSIA.jpeg',
    'OLD MUTUAL Insurance': '/insurances/OLD MUTUAL.jpeg',
    'Phoenix Insurance': '/insurances/Phoenix.jpeg',
    'PHOENIX Insurance': '/insurances/PHOENIX.png',
    'PREMIER Insurance': '/insurances/PREMIER.png',
    'PRUDENTIAL Insurance': '/insurances/PRUDENTIAL.png',
    'QUALITY Insurance': '/insurances/Quality.png',
    'SANLAM ALLIANZ Insurance': '/insurances/SANLAM ALLIANZ.jpeg',
    'SERENE Insurance': '/insurances/SERENE.png',
    'SIC Insurance': '/insurances/SIC.jpeg',
    'STAR Insurance': '/insurances/STAR.jpeg',
    'STAR HEALTH Insurance': '/insurances/STAR HEALTH.png',
    'SUNU Insurance': '/insurances/SUNU.png',
    'UNIQUE Insurance': '/insurances/UNIQUE.png',
    'VANGUARD Insurance': '/insurances/VANGUARD.jpeg',
    'VITALITY Insurance': '/insurances/VITALITY.jpeg'
  };

  // Load company data
  useEffect(() => {
    const companyId = searchParams.get('id');
    const companyName = searchParams.get('name');
    
    
    if (companyId || companyName) {
      setCurrentPage(1); // Reset pagination when insurance changes
      loadInsuranceData(companyId, companyName);
      loadManagementData(companyId, companyName);
      loadRelatedCases(companyId, companyName);
    }
  }, [searchParams]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadInsuranceData = async (companyId, companyName) => {
    try {
      setIsLoading(true);
      setError(null);
      const token = localStorage.getItem('accessToken') || 'test-token-123';

      let url;
      if (companyId) {
        url = `/api/insurance/${companyId}`;
      } else if (companyName) {
        // Search for insurance company by name
        url = `/api/insurance/search?name=${encodeURIComponent(companyName)}&limit=1`;
      }


      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        let data;
        if (companyId) {
          data = await response.json();
        } else {
          const searchResult = await response.json();
          data = searchResult.insurance && searchResult.insurance.length > 0 ? searchResult.insurance[0] : null;
        }

        if (data) {
          // Transform API data to match expected format
          const companyData = {
            id: data.id,
            name: data.name,
            logo: data.logo_url || insuranceLogoMap[data.name] || '/insurances/default.png',
            established: data.established_date ? new Date(data.established_date).getFullYear().toString() : 'N/A',
            headquarters: data.address || `${data.city || 'Accra'}, ${data.region || 'Greater Accra Region'}`,
            phone: data.phone || 'N/A',
            email: data.email || 'N/A',
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
            specializesIn: data.specializes_in || [],
            targetMarket: data.target_market || 'N/A',
            coverageAreas: data.coverage_areas || [],
            services: data.services || [],
            description: data.description || 'No description available',
            totalCases: 0, // This would come from a separate cases API
            activeCases: 0,
            resolvedCases: 0,
            riskLevel: 'Low', // This would be calculated based on cases
            riskScore: 0,
            lastActivity: data.updated_at ? new Date(data.updated_at).toISOString().split('T')[0] : 'N/A',
            cases: [], // This would come from a separate cases API
            previousNames: data.previous_names || []
          };
          setCompanyData(companyData);
        } else {
          console.error('No insurance company found');
          setError('Insurance company not found');
        }
      } else {
        const errorText = await response.text();
        console.error('API Error:', errorText);
        setError(`Failed to load insurance data: ${response.status} - ${errorText}`);
      }
    } catch (err) {
      console.error('Error loading insurance data:', err);
      setError('Error loading insurance data');
    } finally {
      setIsLoading(false);
    }
  };

  const loadManagementData = async (companyId, companyName) => {
    // Sample management data - would come from API in real implementation
    setManagementData([
      {
        id: 1,
        name: "John Doe",
        position: "Chief Executive Officer",
        experience: "15 years",
        qualifications: "MBA, Insurance Management",
        email: "john.doe@insurance.com",
        phone: "+233 30 123 4567"
      },
      {
        id: 2,
        name: "Jane Smith",
        position: "Chief Financial Officer",
        experience: "12 years",
        qualifications: "CPA, Finance",
        email: "jane.smith@insurance.com",
        phone: "+233 30 123 4568"
      }
    ]);
  };

  const loadRelatedCases = async (companyId, companyName) => {
    setCasesLoading(true);
    try {
      // Sample cases data - would come from API in real implementation
      const sampleCases = [
        {
          id: 1,
          title: "INSURANCE COMPANY vs. CLAIMANT",
          suit_reference_number: "SUIT NO.: INS/001/2023",
          date: "2023-01-15",
          court: "High Court",
          status: "Resolved",
          amount: "GHS 50,000"
        }
      ];
      setRelatedCases(sampleCases);
      setFilteredCases(sampleCases);
      setTotalCases(sampleCases.length);
    } catch (error) {
      console.error('Error loading related cases:', error);
    } finally {
      setCasesLoading(false);
    }
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-GH', {
      style: 'currency',
      currency: 'GHS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-GH').format(num);
  };

  const getRiskColor = (level) => {
    switch (level) {
      case 'Low':
        return 'bg-emerald-50 text-emerald-600 ring-emerald-200';
      case 'Medium':
        return 'bg-yellow-50 text-yellow-600 ring-yellow-200';
      case 'High':
        return 'bg-red-50 text-red-600 ring-red-200';
      default:
        return 'bg-gray-50 text-gray-600 ring-gray-200';
    }
  };

  // Early return for loading state - must be after all hooks
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

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Error Loading Insurance Details</h2>
          <p className="text-slate-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!companyData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-sky-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading insurance company details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-slate-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-3">
          <nav className="flex items-center space-x-2 text-sm text-slate-600">
            <button
              onClick={() => navigate('/')}
              className="hover:text-slate-900 transition-colors"
            >
              Home
            </button>
            <span>/</span>
            <button
              onClick={() => navigate('/insurance')}
              className="hover:text-slate-900 transition-colors"
            >
              Insurance Companies
            </button>
            <span>/</span>
            <span className="text-slate-900">{companyData.name}</span>
          </nav>
        </div>
      </div>

      {/* Company Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-6">
            <div className="h-20 w-20 rounded-full bg-sky-100 flex items-center justify-center overflow-hidden">
              {companyData.logo && companyData.logo.startsWith('/') ? (
                <img 
                  src={companyData.logo} 
                  alt={`${companyData.name} logo`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              <div className="w-full h-full flex items-center justify-center text-3xl" style={{ display: companyData.logo && companyData.logo.startsWith('/') ? 'none' : 'flex' }}>
                🛡️
              </div>
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-slate-900">{companyData.name}</h1>
              <p className="text-lg text-slate-600">
                Established {companyData.established} • {companyData.headquarters}
              </p>
              <div className="flex items-center gap-4 mt-2">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRiskColor(companyData.riskLevel)}`}>
                  {companyData.riskLevel} Risk
                </span>
                <span className="text-sm text-slate-500">
                  {companyData.totalCases} cases • Last activity: {companyData.lastActivity}
                </span>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => navigate('/insurance')}
                className="px-4 py-2 text-slate-600 hover:text-slate-800 transition-colors"
              >
                <ArrowLeft className="h-4 w-4 mr-2 inline" />
                Back to Insurance
              </button>
              <button
                onClick={() => setShowRequestModal(true)}
                className="px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors"
              >
                <Send className="h-4 w-4 mr-2 inline" />
                Request Service
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Basic Information Section */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900 flex items-center">
                <Building2 className="h-5 w-5 mr-2 text-sky-600" />
                Basic Information
              </h2>
              <button
                onClick={() => toggleSection('basicInfo')}
                className="p-1 text-slate-400 hover:text-slate-600 transition-colors"
              >
                {expandedSections.basicInfo ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            
            {expandedSections.basicInfo && (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 p-6">
                <div className="space-y-4">
                  <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
                    <div className="flex items-center space-x-2 mb-2">
                      <Shield className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-semibold text-blue-800 uppercase tracking-wide">Company Details</span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-slate-600">Insurance Type:</span>
                        <span className="text-sm font-medium text-slate-900">{companyData.insuranceType}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-slate-600">Ownership Type:</span>
                        <span className="text-sm font-medium text-slate-900">{companyData.ownershipType}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-slate-600">License Number:</span>
                        <span className="text-sm font-medium text-slate-900">{companyData.licenseNumber}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-slate-600">Registration Number:</span>
                        <span className="text-sm font-medium text-slate-900">{companyData.registrationNumber}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
                    <div className="flex items-center space-x-2 mb-2">
                      <Calendar className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-semibold text-green-800 uppercase tracking-wide">Establishment</span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-slate-600">Established:</span>
                        <span className="text-sm font-medium text-slate-900">{companyData.established}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-slate-600">Headquarters:</span>
                        <span className="text-sm font-medium text-slate-900">{companyData.headquarters}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-slate-600">Target Market:</span>
                        <span className="text-sm font-medium text-slate-900">{companyData.targetMarket}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Contact Information Section */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900 flex items-center">
                <Phone className="h-5 w-5 mr-2 text-sky-600" />
                Contact Information
              </h2>
              <button
                onClick={() => toggleSection('contactInfo')}
                className="p-1 text-slate-400 hover:text-slate-600 transition-colors"
              >
                {expandedSections.contactInfo ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            
            {expandedSections.contactInfo && (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 p-6">
                <div className="space-y-4">
                  <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
                    <div className="flex items-center space-x-2 mb-2">
                      <Phone className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-semibold text-blue-800 uppercase tracking-wide">Contact Details</span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-slate-600">Phone:</span>
                        <span className="text-sm font-medium text-slate-900">{companyData.phone}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-slate-600">Email:</span>
                        <span className="text-sm font-medium text-slate-900">{companyData.email}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-slate-600">Website:</span>
                        <a href={companyData.website} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-sky-600 hover:text-sky-800">
                          {companyData.website}
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
                    <div className="flex items-center space-x-2 mb-2">
                      <MapPin className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-semibold text-green-800 uppercase tracking-wide">Location</span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-slate-600">Address:</span>
                        <span className="text-sm font-medium text-slate-900">{companyData.headquarters}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-slate-600">Branches:</span>
                        <span className="text-sm font-medium text-slate-900">{companyData.branchesCount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-slate-600">Agents:</span>
                        <span className="text-sm font-medium text-slate-900">{companyData.agentsCount}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Services Section */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900 flex items-center">
                <Shield className="h-5 w-5 mr-2 text-sky-600" />
                Insurance Services
              </h2>
              <button
                onClick={() => toggleSection('services')}
                className="p-1 text-slate-400 hover:text-slate-600 transition-colors"
              >
                {expandedSections.services ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            
            {expandedSections.services && (
              <div className="p-6 space-y-6">
                {/* Digital Services */}
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 mb-3 flex items-center">
                    <Smartphone className="w-4 h-4 mr-2 text-sky-600" />
                    Digital Services
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className={`p-3 rounded-lg border ${companyData.hasMobileApp ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
                      <div className="flex items-center space-x-2">
                        <Smartphone className={`w-4 h-4 ${companyData.hasMobileApp ? 'text-green-600' : 'text-gray-400'}`} />
                        <span className={`text-sm font-medium ${companyData.hasMobileApp ? 'text-green-800' : 'text-gray-500'}`}>
                          Mobile App
                        </span>
                      </div>
                    </div>
                    <div className={`p-3 rounded-lg border ${companyData.hasOnlinePortal ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
                      <div className="flex items-center space-x-2">
                        <Globe className={`w-4 h-4 ${companyData.hasOnlinePortal ? 'text-green-600' : 'text-gray-400'}`} />
                        <span className={`text-sm font-medium ${companyData.hasOnlinePortal ? 'text-green-800' : 'text-gray-500'}`}>
                          Online Portal
                        </span>
                      </div>
                    </div>
                    <div className={`p-3 rounded-lg border ${companyData.hasOnlineClaims ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
                      <div className="flex items-center space-x-2">
                        <FileText className={`w-4 h-4 ${companyData.hasOnlineClaims ? 'text-green-600' : 'text-gray-400'}`} />
                        <span className={`text-sm font-medium ${companyData.hasOnlineClaims ? 'text-green-800' : 'text-gray-500'}`}>
                          Online Claims
                        </span>
                      </div>
                    </div>
                    <div className={`p-3 rounded-lg border ${companyData.has24_7Support ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
                      <div className="flex items-center space-x-2">
                        <Clock className={`w-4 h-4 ${companyData.has24_7Support ? 'text-green-600' : 'text-gray-400'}`} />
                        <span className={`text-sm font-medium ${companyData.has24_7Support ? 'text-green-800' : 'text-gray-500'}`}>
                          24/7 Support
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Insurance Services */}
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 mb-3 flex items-center">
                    <Shield className="w-4 h-4 mr-2 text-sky-600" />
                    Insurance Products
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {companyData.services && companyData.services.map((service, index) => (
                      <div key={index} className="p-3 bg-sky-50 rounded-lg border border-sky-200">
                        <div className="flex items-center space-x-2">
                          <Shield className="w-4 h-4 text-sky-600" />
                          <span className="text-sm font-medium text-sky-800">{service}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Coverage Areas */}
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 mb-3 flex items-center">
                    <MapPin className="w-4 h-4 mr-2 text-sky-600" />
                    Coverage Areas
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {companyData.coverageAreas && companyData.coverageAreas.map((area, index) => (
                      <span key={index} className="px-3 py-1 bg-slate-100 text-slate-700 text-sm rounded-full">
                        {area}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Financial Information Section */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900 flex items-center">
                <DollarSign className="h-5 w-5 mr-2 text-sky-600" />
                Financial Information
              </h2>
              <button
                onClick={() => toggleSection('financialInfo')}
                className="p-1 text-slate-400 hover:text-slate-600 transition-colors"
              >
                {expandedSections.financialInfo ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            
            {expandedSections.financialInfo && (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 p-6">
                <div className="space-y-4">
                  <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
                    <div className="flex items-center space-x-2 mb-2">
                      <TrendingUp className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-semibold text-blue-800 uppercase tracking-wide">Assets & Capital</span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-slate-600">Total Assets:</span>
                        <span className="text-sm font-medium text-slate-900">{formatCurrency(companyData.totalAssets)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-slate-600">Net Worth:</span>
                        <span className="text-sm font-medium text-slate-900">{formatCurrency(companyData.netWorth)}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
                    <div className="flex items-center space-x-2 mb-2">
                      <Shield className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-semibold text-green-800 uppercase tracking-wide">Revenue & Claims</span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-slate-600">Premium Income:</span>
                        <span className="text-sm font-medium text-slate-900">{formatCurrency(companyData.premiumIncome)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-slate-600">Claims Paid:</span>
                        <span className="text-sm font-medium text-slate-900">{formatCurrency(companyData.claimsPaid)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Management Team Section */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900 flex items-center">
                <Users className="h-5 w-5 mr-2 text-sky-600" />
                Management Team
              </h2>
              <button
                onClick={() => toggleSection('management')}
                className="p-1 text-slate-400 hover:text-slate-600 transition-colors"
              >
                {expandedSections.management ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            
            {expandedSections.management && (
              <div className="p-6 space-y-6">
                {managementData.map((executive) => (
                  <div key={executive.id} className="bg-slate-50 rounded-lg p-6 border border-slate-200 hover:border-sky-300 transition-colors">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-sky-100 rounded-full flex items-center justify-center">
                        <User className="w-6 h-6 text-sky-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-slate-900">{executive.name}</h3>
                        <p className="text-sky-600 font-medium">{executive.position}</p>
                        <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-slate-600">Experience: <span className="font-medium text-slate-900">{executive.experience}</span></p>
                            <p className="text-sm text-slate-600">Qualifications: <span className="font-medium text-slate-900">{executive.qualifications}</span></p>
                          </div>
                          <div>
                            <p className="text-sm text-slate-600">Email: <span className="font-medium text-slate-900">{executive.email}</span></p>
                            <p className="text-sm text-slate-600">Phone: <span className="font-medium text-slate-900">{executive.phone}</span></p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Previous Names Section */}
          {companyData.previousNames && companyData.previousNames.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900 flex items-center">
                  <FileText className="h-5 w-5 mr-2 text-purple-600" />
                  Previous Names
                </h2>
                <button
                  onClick={() => toggleSection('previousNames')}
                  className="p-1 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {expandedSections.previousNames ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              
              {expandedSections.previousNames && (
                <div className="p-6">
                  <div className="bg-purple-50 p-4 rounded-lg border-l-4 border-purple-500">
                    <div className="flex items-center space-x-2 mb-2">
                      <FileText className="w-4 h-4 text-purple-600" />
                      <span className="text-sm font-semibold text-purple-800 uppercase tracking-wide">Historical Names</span>
                    </div>
                    <div className="space-y-2">
                      {companyData.previousNames.map((name, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                          <span className="text-sm text-slate-700">{name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Related Cases Section */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900 flex items-center">
                <Scale className="h-5 w-5 mr-2 text-sky-600" />
                Related Cases
              </h2>
              <button
                onClick={() => toggleSection('cases')}
                className="p-1 text-slate-400 hover:text-slate-600 transition-colors"
              >
                {expandedSections.cases ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            
            {expandedSections.cases && (
              <div className="p-6 space-y-4">
                {casesLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600 mx-auto"></div>
                    <p className="mt-2 text-slate-600">Loading cases...</p>
                  </div>
                ) : filteredCases.length > 0 ? (
                  <div className="space-y-4">
                    {filteredCases.map((caseItem) => (
                      <div key={caseItem.id} className="bg-slate-50 rounded-lg p-4 border border-slate-200 hover:border-sky-300 transition-colors">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="text-sm font-semibold text-slate-900 mb-1">{caseItem.title}</h3>
                            <div className="flex items-center space-x-4 text-xs text-slate-600">
                              <span>{caseItem.suit_reference_number}</span>
                              <span>{caseItem.date}</span>
                              <span>{caseItem.court}</span>
                              <span className={`px-2 py-1 rounded-full ${
                                caseItem.status === 'Resolved' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {caseItem.status}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => {
                                setSelectedCase(caseItem);
                                setShowRequestModal(true);
                              }}
                              className="px-3 py-1 bg-sky-600 text-white text-xs rounded-lg hover:bg-sky-700 transition-colors"
                            >
                              View Details
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Scale className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                    <p className="text-slate-600">No related cases found</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Request Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowRequestModal(false)}></div>
            <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Request Service</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Request Type</label>
                    <select
                      value={requestType}
                      onChange={(e) => setRequestType(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                    >
                      <option value="case_details">Case Details</option>
                      <option value="document_request">Document Request</option>
                      <option value="consultation">Legal Consultation</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Message</label>
                    <textarea
                      value={requestMessage}
                      onChange={(e) => setRequestMessage(e.target.value)}
                      rows={4}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                      placeholder="Describe your request..."
                    />
                  </div>
                </div>
                <div className="flex gap-3 justify-end mt-6">
                  <button
                    onClick={() => setShowRequestModal(false)}
                    className="px-4 py-2 text-slate-600 hover:text-slate-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      // Handle request submission
                      setShowRequestModal(false);
                      setRequestMessage('');
                    }}
                    className="px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors"
                  >
                    Submit Request
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InsuranceDetail;
