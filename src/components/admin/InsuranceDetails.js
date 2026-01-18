import React, { useMemo, useRef, useEffect, useState } from 'react';
import { ArrowLeft, ChevronRight, Search, Filter, ChevronLeft, ChevronDown, X, ExternalLink } from 'lucide-react';
import { apiGet } from '../../utils/api';
import AdminHeader from './AdminHeader';

const InsuranceDetails = ({ insurance, industry, onBack, userInfo, onNavigate, onLogout }) => {
  const [activeTab, setActiveTab] = useState('personal');
  const [insuranceData, setInsuranceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cases state
  const [casesSearchQuery, setCasesSearchQuery] = useState('');
  const [casesFilter, setCasesFilter] = useState({
    court_type: '',
    status: '',
    area_of_law: '',
    year: ''
  });
  const [showCasesFilters, setShowCasesFilters] = useState(false);
  const [casesPage, setCasesPage] = useState(1);
  const [casesLimit] = useState(10);
  const [casesTotal, setCasesTotal] = useState(0);
  const [casesTotalPages, setCasesTotalPages] = useState(0);
  const [casesLoading, setCasesLoading] = useState(false);
  const [casesData, setCasesData] = useState([]);
  const casesFilterRef = useRef(null);

  // Pending cases state
  const [pendingSearchQuery, setPendingSearchQuery] = useState('');
  const [pendingFilter, setPendingFilter] = useState({
    court_type: '',
    area_of_law: '',
    year: ''
  });
  const [showPendingFilters, setShowPendingFilters] = useState(false);
  const [pendingPage, setPendingPage] = useState(1);
  const [pendingLimit] = useState(10);
  const [pendingTotal, setPendingTotal] = useState(0);
  const [pendingTotalPages, setPendingTotalPages] = useState(0);
  const [pendingLoading, setPendingLoading] = useState(false);
  const [pendingData, setPendingData] = useState([]);
  const pendingFilterRef = useRef(null);

  const insuranceId = typeof insurance === 'object' && insurance?.id ? insurance.id : null;
  const insuranceName = typeof insurance === 'string'
    ? insurance
    : (insurance?.name || insurance?.short_name || 'Unknown Insurance');

  useEffect(() => {
    const fetchInsuranceDetails = async () => {
      if (!insuranceId) {
        if (typeof insurance === 'object' && insurance) {
          setInsuranceData(insurance);
          setLoading(false);
        } else {
          setError('Insurance ID not found');
          setLoading(false);
        }
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const response = await apiGet(`/admin/insurance/${insuranceId}`);
        setInsuranceData(response);
      } catch (err) {
        console.error('Error fetching insurance details:', err);
        setError('Failed to load insurance details. Please try again.');
        setInsuranceData(typeof insurance === 'object' ? insurance : null);
      } finally {
        setLoading(false);
      }
    };

    setInsuranceData(null);
    setLoading(true);
    setError(null);
    fetchInsuranceDetails();
  }, [insuranceId, insurance]);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    } catch (e) {
      return dateString;
    }
  };

  const getCourtTypeName = (courtType) => {
    if (!courtType) return 'N/A';
    const courtTypeMap = {
      'SC': 'Supreme Court',
      'CA': 'Court of Appeal',
      'HC': 'High Court',
      'DC': 'District Court',
      'CC': 'Circuit Court',
      'FC': 'Family Court',
      'LC': 'Land Court',
      'COM': 'Commercial Court',
      'H': 'High Court',
      'high_court': 'High Court',
      'supreme_court': 'Supreme Court',
      'court_of_appeal': 'Court of Appeal',
      'circuit_court': 'Circuit Court',
      'district_court': 'District Court',
      'commercial_court': 'Commercial Court',
      'family_court': 'Family Court',
      'land_court': 'Land Court'
    };
    return courtTypeMap[courtType] || courtType;
  };

  const getCaseProgressBadge = (progress) => {
    const lowerProgress = progress?.toLowerCase();
    if (!lowerProgress) return { text: 'N/A', className: 'bg-gray-100 text-gray-600' };

    if (['closed', 'judgment', 'judgement', 'ruling', 'motion - completed', 'pre-trial - completed', 'concluded', 'resolved'].includes(lowerProgress)) {
      return { text: progress, className: 'bg-green-100 text-green-600' };
    }
    if (['process service', 'case filed', 'ongoing', 'in progress', 'new', 'pending', 'hearing'].includes(lowerProgress)) {
      return { text: progress, className: 'bg-yellow-100 text-yellow-600' };
    }
    if (['motion - struck out'].includes(lowerProgress)) {
      return { text: progress, className: 'bg-red-100 text-red-600' };
    }
    return { text: progress, className: 'bg-gray-100 text-gray-600' };
  };

  const getInsuranceLogo = (logoUrl) => {
    if (logoUrl) return logoUrl;
    return '/category-icons/insurance.png';
  };

  const tabs = [
    { id: 'personal', label: 'Personal details' },
    { id: 'directors', label: 'Directors' },
    { id: 'secretaries', label: 'Secretaries' },
    { id: 'auditors', label: 'Auditors' },
    { id: 'regulatory', label: 'Regulatory and Compliance' },
    { id: 'shareholders', label: 'Shareholder' },
    { id: 'judgements', label: 'Judgements and Rulings' },
    { id: 'pending_cases', label: 'Pending Cases' },
    { id: 'beneficial', label: 'Beneficial Owners' }
  ];

  const insuranceInfo = insuranceData?.insurance || insuranceData;
  const directors = insuranceData?.directors || [];
  const secretaries = insuranceData?.secretaries || [];
  const auditors = insuranceData?.auditors || [];
  const shareholders = insuranceData?.shareholders || [];
  const beneficialOwners = insuranceData?.beneficial_owners || [];
  const relatedCases = insuranceData?.related_cases || [];

  const combinedCases = useMemo(() => relatedCases, [relatedCases]);

  const filteredCases = useMemo(() => {
    let filtered = combinedCases;
    if (casesSearchQuery) {
      const query = casesSearchQuery.toLowerCase();
      filtered = filtered.filter(caseItem =>
        caseItem?.title?.toLowerCase().includes(query) ||
        caseItem?.suit_reference_number?.toLowerCase().includes(query) ||
        caseItem?.protagonist?.toLowerCase().includes(query) ||
        caseItem?.antagonist?.toLowerCase().includes(query)
      );
    }
    if (casesFilter.court_type) {
      filtered = filtered.filter(caseItem => caseItem?.court_type === casesFilter.court_type);
    }
    if (casesFilter.status) {
      filtered = filtered.filter(caseItem => (caseItem?.status || '').toLowerCase() === casesFilter.status.toLowerCase());
    }
    if (casesFilter.area_of_law) {
      filtered = filtered.filter(caseItem => caseItem?.area_of_law?.toLowerCase().includes(casesFilter.area_of_law.toLowerCase()));
    }
    if (casesFilter.year) {
      filtered = filtered.filter(caseItem => {
        if (!caseItem?.date) return false;
        const year = new Date(caseItem.date).getFullYear().toString();
        return year === casesFilter.year;
      });
    }
    return filtered;
  }, [combinedCases, casesSearchQuery, casesFilter]);

  const paginatedCases = useMemo(() => {
    const startIndex = (casesPage - 1) * casesLimit;
    return filteredCases.slice(startIndex, startIndex + casesLimit);
  }, [filteredCases, casesPage, casesLimit]);

  const pendingCases = useMemo(() => {
    return combinedCases.filter(caseItem =>
      (caseItem?.status || '').toLowerCase() === 'pending' ||
      (caseItem?.case_progress || '').toLowerCase() === 'pending'
    );
  }, [combinedCases]);

  const filteredPendingCases = useMemo(() => {
    let filtered = pendingCases;
    if (pendingSearchQuery) {
      const query = pendingSearchQuery.toLowerCase();
      filtered = filtered.filter(caseItem =>
        caseItem?.title?.toLowerCase().includes(query) ||
        caseItem?.suit_reference_number?.toLowerCase().includes(query) ||
        caseItem?.protagonist?.toLowerCase().includes(query) ||
        caseItem?.antagonist?.toLowerCase().includes(query)
      );
    }
    if (pendingFilter.court_type) {
      filtered = filtered.filter(caseItem => caseItem?.court_type === pendingFilter.court_type);
    }
    if (pendingFilter.area_of_law) {
      filtered = filtered.filter(caseItem => caseItem?.area_of_law?.toLowerCase().includes(pendingFilter.area_of_law.toLowerCase()));
    }
    if (pendingFilter.year) {
      filtered = filtered.filter(caseItem => {
        if (!caseItem?.date) return false;
        const year = new Date(caseItem.date).getFullYear().toString();
        return year === pendingFilter.year;
      });
    }
    return filtered;
  }, [pendingCases, pendingSearchQuery, pendingFilter]);

  const paginatedPendingCases = useMemo(() => {
    const startIndex = (pendingPage - 1) * pendingLimit;
    return filteredPendingCases.slice(startIndex, startIndex + pendingLimit);
  }, [filteredPendingCases, pendingPage, pendingLimit]);

  useEffect(() => {
    if (activeTab === 'judgements') {
      setCasesLoading(true);
      setCasesData(paginatedCases);
      setCasesTotal(filteredCases.length);
      setCasesTotalPages(Math.ceil(filteredCases.length / casesLimit) || 0);
      setCasesLoading(false);
    }
  }, [activeTab, paginatedCases, filteredCases.length, casesLimit]);

  useEffect(() => {
    if (activeTab === 'pending_cases') {
      setPendingLoading(true);
      setPendingData(paginatedPendingCases);
      setPendingTotal(filteredPendingCases.length);
      setPendingTotalPages(Math.ceil(filteredPendingCases.length / pendingLimit) || 0);
      setPendingLoading(false);
    }
  }, [activeTab, paginatedPendingCases, filteredPendingCases.length, pendingLimit]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (casesFilterRef.current && !casesFilterRef.current.contains(event.target)) {
        setShowCasesFilters(false);
      }
      if (pendingFilterRef.current && !pendingFilterRef.current.contains(event.target)) {
        setShowPendingFilters(false);
      }
    };

    if (showCasesFilters || showPendingFilters) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showCasesFilters, showPendingFilters]);

  useEffect(() => {
    setCasesPage(1);
  }, [casesSearchQuery, casesFilter]);

  useEffect(() => {
    setPendingPage(1);
  }, [pendingSearchQuery, pendingFilter]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#F7F8FA]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#022658]"></div>
        <span className="ml-3 text-[#525866]">Loading insurance details...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#F7F8FA]">
        <p className="text-red-600 text-lg mb-4">{error}</p>
        <button
          onClick={onBack}
          className="px-4 py-2 bg-[#022658] text-white rounded-lg hover:bg-[#033a7a] transition-colors"
        >
          Go Back
        </button>
      </div>
    );
  }

  if (!insuranceInfo) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#F7F8FA]">
        <p className="text-[#525866] text-lg mb-4">Insurance company not found.</p>
        <button
          onClick={onBack}
          className="px-4 py-2 bg-[#022658] text-white rounded-lg hover:bg-[#033a7a] transition-colors"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="bg-[#F7F8FA] min-h-screen">
      <AdminHeader userInfo={userInfo} onNavigate={onNavigate} onLogout={onLogout} />
      <div className="px-6 w-full">
        <div className="flex flex-col bg-white p-4 gap-6 rounded-lg w-full min-h-[1116px]">
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-1">
              <span className="text-[#525866] text-xs opacity-75 mr-1 whitespace-nowrap">COMPANIES</span>
              <ChevronRight className="w-4 h-4 text-[#525866] mr-1" />
              <span className="text-[#070810] text-sm font-normal whitespace-nowrap">{insuranceInfo.name || insuranceName}</span>
            </div>

            <div className="flex items-start gap-3">
              <button
                onClick={onBack}
                className="p-2 bg-[#F7F8FA] rounded-lg cursor-pointer hover:opacity-70 flex-shrink-0"
              >
                <ArrowLeft className="w-6 h-6 text-[#050F1C]" />
              </button>
              <div className="flex items-center gap-3">
                <img
                  src={getInsuranceLogo(insuranceInfo.logo_url)}
                  alt={`${insuranceInfo.name} logo`}
                  className="w-10 h-10 object-contain rounded-full"
                />
                <span className="text-[#050F1C] text-2xl font-medium flex-1">
                  {insuranceInfo.name || insuranceName}
                </span>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <div className="flex items-start p-1 gap-4 border-b border-[#E4E7EB]">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex flex-col items-start pb-2 ${activeTab === tab.id ? 'border-b-2 border-[#022658]' : ''}`}
                  >
                    <span className={`text-base ${activeTab === tab.id ? 'text-[#022658] font-bold' : 'text-[#525866]'}`}>
                      {tab.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex-1">
            {activeTab === 'personal' && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-[#040E1B]">Personal Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-[#868C98] text-xs">Short Name</span>
                    <p className="text-[#040E1B] text-sm">{insuranceInfo.short_name || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-[#868C98] text-xs">Website</span>
                    <p className="text-[#040E1B] text-sm">{insuranceInfo.website || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-[#868C98] text-xs">Phone</span>
                    <p className="text-[#040E1B] text-sm">{insuranceInfo.phone || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-[#868C98] text-xs">Email</span>
                    <p className="text-[#040E1B] text-sm">{insuranceInfo.email || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-[#868C98] text-xs">Address</span>
                    <p className="text-[#040E1B] text-sm">{insuranceInfo.address || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-[#868C98] text-xs">City</span>
                    <p className="text-[#040E1B] text-sm">{insuranceInfo.city || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-[#868C98] text-xs">Region</span>
                    <p className="text-[#040E1B] text-sm">{insuranceInfo.region || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-[#868C98] text-xs">Country</span>
                    <p className="text-[#040E1B] text-sm">{insuranceInfo.country || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-[#868C98] text-xs">Postal Code</span>
                    <p className="text-[#040E1B] text-sm">{insuranceInfo.postal_code || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-[#868C98] text-xs">License Number</span>
                    <p className="text-[#040E1B] text-sm">{insuranceInfo.license_number || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-[#868C98] text-xs">Established Date</span>
                    <p className="text-[#040E1B] text-sm">{formatDate(insuranceInfo.established_date)}</p>
                  </div>
                  <div>
                    <span className="text-[#868C98] text-xs">Insurance Type</span>
                    <p className="text-[#040E1B] text-sm">{insuranceInfo.insurance_type || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-[#868C98] text-xs">Ownership Type</span>
                    <p className="text-[#040E1B] text-sm">{insuranceInfo.ownership_type || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-[#868C98] text-xs">Services</span>
                    <p className="text-[#040E1B] text-sm">{insuranceInfo.services || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-[#868C98] text-xs">Previous Names</span>
                    <p className="text-[#040E1B] text-sm">{insuranceInfo.previous_names || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-[#868C98] text-xs">Branches Count</span>
                    <p className="text-[#040E1B] text-sm">{insuranceInfo.branches_count || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-[#868C98] text-xs">Total Assets</span>
                    <p className="text-[#040E1B] text-sm">{insuranceInfo.total_assets || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-[#868C98] text-xs">Net Worth</span>
                    <p className="text-[#040E1B] text-sm">{insuranceInfo.net_worth || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-[#868C98] text-xs">Rating</span>
                    <p className="text-[#040E1B] text-sm">{insuranceInfo.rating || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-[#868C98] text-xs">Head Office Address</span>
                    <p className="text-[#040E1B] text-sm">{insuranceInfo.head_office_address || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-[#868C98] text-xs">Customer Service Phone</span>
                    <p className="text-[#040E1B] text-sm">{insuranceInfo.customer_service_phone || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-[#868C98] text-xs">Customer Service Email</span>
                    <p className="text-[#040E1B] text-sm">{insuranceInfo.customer_service_email || 'N/A'}</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'directors' && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-[#040E1B]">Directors</h3>
                {directors.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {directors.map((director, idx) => (
                      <div key={idx} className="border border-[#E4E7EB] rounded-lg p-4">
                        <p className="text-[#040E1B] text-sm font-medium">{director.full_name || director.name || 'N/A'}</p>
                        <p className="text-[#525866] text-xs">{director.position || director.title || 'N/A'}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[#525866] text-sm">No directors found</p>
                )}
              </div>
            )}

            {activeTab === 'secretaries' && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-[#040E1B]">Secretaries</h3>
                {secretaries.length > 0 ? (
                  <div className="space-y-2">
                    {secretaries.map((secretary, idx) => (
                      <div key={idx} className="border border-[#E4E7EB] rounded-lg p-4">
                        <p className="text-[#040E1B] text-sm">{secretary.name || 'N/A'}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[#525866] text-sm">No secretaries found</p>
                )}
              </div>
            )}

            {activeTab === 'auditors' && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-[#040E1B]">Auditors</h3>
                {auditors.length > 0 ? (
                  <div className="space-y-2">
                    {auditors.map((auditor, idx) => (
                      <div key={idx} className="border border-[#E4E7EB] rounded-lg p-4">
                        <p className="text-[#040E1B] text-sm">{auditor.name || 'N/A'}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[#525866] text-sm">No auditors found</p>
                )}
              </div>
            )}

            {activeTab === 'regulatory' && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-[#040E1B]">Regulatory and Compliance</h3>
                <p className="text-[#525866] text-sm">Regulatory and compliance information will be displayed here.</p>
              </div>
            )}

            {activeTab === 'shareholders' && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-[#040E1B]">Shareholders</h3>
                {shareholders.length > 0 ? (
                  <div className="space-y-4">
                    {shareholders.map((shareholder, idx) => (
                      <div key={idx} className="border border-[#E4E7EB] rounded-lg p-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <span className="text-[#868C98] text-xs">Name</span>
                            <p className="text-[#040E1B] text-sm">{shareholder.name || 'N/A'}</p>
                          </div>
                          <div>
                            <span className="text-[#868C98] text-xs">Number of Shares</span>
                            <p className="text-[#040E1B] text-sm">{shareholder.number_of_shares || 'N/A'}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[#525866] text-sm">No shareholders found</p>
                )}
              </div>
            )}

            {activeTab === 'judgements' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-bold text-[#040E1B]">
                    {insuranceInfo.name ? `${insuranceInfo.name} — ` : ''}Judgements and Rulings
                  </h3>
                </div>

                <div className="flex flex-col gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#868C98] w-5 h-5" />
                    <input
                      type="text"
                      value={casesSearchQuery}
                      onChange={(e) => setCasesSearchQuery(e.target.value)}
                      placeholder="Search judgements and rulings..."
                      className="w-full pl-10 pr-4 py-2.5 border border-[#D4E1EA] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#022658] focus:border-transparent"
                    />
                    {casesSearchQuery && (
                      <button
                        type="button"
                        onClick={() => setCasesSearchQuery('')}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#868C98] hover:text-[#040E1B]"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    )}
                  </div>

                  <div className="relative" ref={casesFilterRef}>
                    <button
                      type="button"
                      onClick={() => setShowCasesFilters(!showCasesFilters)}
                      className="flex items-center gap-2 px-4 py-2.5 border border-[#D4E1EA] rounded-lg text-[#525866] hover:bg-[#F7F8FA]"
                    >
                      <Filter className="w-5 h-5" />
                      Filters
                      {showCasesFilters ? <ChevronDown className="w-4 h-4 rotate-180" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                    {showCasesFilters && (
                      <div className="absolute z-10 mt-2 w-64 p-4 bg-white rounded-lg shadow-lg border border-[#E4E7EB] space-y-3">
                        <div>
                          <label htmlFor="cases-court-type" className="block text-xs font-medium text-[#525866] mb-1">Court Type</label>
                          <select
                            id="cases-court-type"
                            value={casesFilter.court_type}
                            onChange={(e) => setCasesFilter(prev => ({ ...prev, court_type: e.target.value }))}
                            className="w-full px-3 py-2 bg-[#F7F8FA] rounded-lg border border-[#E4E7EB] text-[#040E1B] text-sm outline-none focus:border-[#022658]"
                          >
                            <option value="">All Court Types</option>
                            <option value="SC">Supreme Court</option>
                            <option value="CA">Court of Appeal</option>
                            <option value="HC">High Court</option>
                            <option value="DC">District Court</option>
                            <option value="CC">Circuit Court</option>
                            <option value="FC">Family Court</option>
                            <option value="LC">Land Court</option>
                            <option value="COM">Commercial Court</option>
                          </select>
                        </div>
                        <div>
                          <label htmlFor="cases-status" className="block text-xs font-medium text-[#525866] mb-1">Status</label>
                          <select
                            id="cases-status"
                            value={casesFilter.status}
                            onChange={(e) => setCasesFilter(prev => ({ ...prev, status: e.target.value }))}
                            className="w-full px-3 py-2 bg-[#F7F8FA] rounded-lg border border-[#E4E7EB] text-[#040E1B] text-sm outline-none focus:border-[#022658]"
                          >
                            <option value="">All Statuses</option>
                            <option value="active">Active</option>
                            <option value="pending">Pending</option>
                            <option value="closed">Closed</option>
                            <option value="adjourned">Adjourned</option>
                            <option value="heard">Heard</option>
                          </select>
                        </div>
                        <div>
                          <label htmlFor="cases-area-of-law" className="block text-xs font-medium text-[#525866] mb-1">Area of Law</label>
                          <input
                            type="text"
                            id="cases-area-of-law"
                            value={casesFilter.area_of_law}
                            onChange={(e) => setCasesFilter(prev => ({ ...prev, area_of_law: e.target.value }))}
                            placeholder="e.g., Commercial, Criminal"
                            className="w-full px-3 py-2 bg-[#F7F8FA] rounded-lg border border-[#E4E7EB] text-[#040E1B] text-sm outline-none focus:border-[#022658]"
                          />
                        </div>
                        <div>
                          <label htmlFor="cases-year" className="block text-xs font-medium text-[#525866] mb-1">Year</label>
                          <input
                            type="number"
                            id="cases-year"
                            value={casesFilter.year}
                            onChange={(e) => setCasesFilter(prev => ({ ...prev, year: e.target.value }))}
                            placeholder="e.g., 2023"
                            className="w-full px-3 py-2 bg-[#F7F8FA] rounded-lg border border-[#E4E7EB] text-[#040E1B] text-sm outline-none focus:border-[#022658]"
                          />
                        </div>
                        {Object.values(casesFilter).some(v => v) && (
                          <button
                            onClick={() => setCasesFilter({ court_type: '', status: '', area_of_law: '', year: '' })}
                            className="w-full px-4 py-2 bg-[#F7F8FA] rounded-lg border border-[#E4E7EB] text-[#525866] text-sm hover:bg-[#E4E7EB] transition-colors"
                          >
                            Clear Filters
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {casesLoading ? (
                  <div className="flex justify-center items-center py-12">
                    <span className="text-[#525866] text-sm">Loading judgements and rulings...</span>
                  </div>
                ) : casesData.length > 0 ? (
                  <>
                    <div className="space-y-4">
                      {casesData.map((caseItem) => (
                        <div key={caseItem.id} className="border border-[#E4E7EB] rounded-lg p-4">
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <span className="text-[#868C98] text-xs">Case Title</span>
                                <p className="text-[#040E1B] text-sm">{caseItem.title || 'N/A'}</p>
                              </div>
                              <div>
                                <span className="text-[#868C98] text-xs">Suit Reference Number</span>
                                <p className="text-[#040E1B] text-sm">{caseItem.suit_reference_number || 'N/A'}</p>
                              </div>
                              <div>
                                <span className="text-[#868C98] text-xs">Court Name</span>
                                <p className="text-[#040E1B] text-sm">{getCourtTypeName(caseItem.court_type)}</p>
                              </div>
                              <div>
                                <span className="text-[#868C98] text-xs">Date</span>
                                <p className="text-[#040E1B] text-sm">{formatDate(caseItem.date) || 'N/A'}</p>
                              </div>
                            </div>
                            <div className="flex justify-end pt-2 border-t border-[#E4E7EB]">
                              <button
                                onClick={async () => {
                                  try {
                                    const fullCaseData = await apiGet(`/cases/${caseItem.id}`);
                                    sessionStorage.setItem('selectedCaseData', JSON.stringify(fullCaseData));
                                    if (onNavigate) {
                                      onNavigate('case-profile');
                                    }
                                  } catch (err) {
                                    console.error('Error fetching case details:', err);
                                    sessionStorage.setItem('selectedCaseData', JSON.stringify(caseItem));
                                    if (onNavigate) {
                                      onNavigate('case-profile');
                                    }
                                  }
                                }}
                                className="flex items-center gap-2 px-4 py-2 bg-[#022658] text-white rounded-lg hover:bg-[#1A4983] transition-colors text-sm font-medium"
                              >
                                <ExternalLink className="w-4 h-4" />
                                View Case Details
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {casesTotalPages > 1 && (
                      <div className="flex items-center justify-between pt-4 border-t border-[#E4E7EB]">
                        <div className="text-[#525866] text-sm">
                          Showing {(casesPage - 1) * casesLimit + 1} to {Math.min(casesPage * casesLimit, casesTotal)} of {casesTotal} results
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setCasesPage(prev => Math.max(1, prev - 1))}
                            disabled={casesPage === 1}
                            className={`px-3 py-2 rounded-lg border ${casesPage === 1 ? 'border-[#E4E7EB] text-[#868C98] cursor-not-allowed' : 'border-[#E4E7EB] text-[#040E1B] hover:bg-[#F7F8FA]'}`}
                          >
                            <ChevronLeft className="w-4 h-4" />
                          </button>
                          <div className="text-[#040E1B] text-sm">Page {casesPage} of {casesTotalPages}</div>
                          <button
                            onClick={() => setCasesPage(prev => Math.min(casesTotalPages, prev + 1))}
                            disabled={casesPage === casesTotalPages}
                            className={`px-3 py-2 rounded-lg border ${casesPage === casesTotalPages ? 'border-[#E4E7EB] text-[#868C98] cursor-not-allowed' : 'border-[#E4E7EB] text-[#040E1B] hover:bg-[#F7F8FA]'}`}
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-[#525866] text-sm">No judgements and rulings found</p>
                )}
              </div>
            )}

            {activeTab === 'pending_cases' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-bold text-[#040E1B]">
                    {insuranceInfo.name ? `${insuranceInfo.name} — ` : ''}Pending Cases
                  </h3>
                </div>

                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#868C98] w-5 h-5" />
                  <input
                    type="text"
                    value={pendingSearchQuery}
                    onChange={(e) => setPendingSearchQuery(e.target.value)}
                    placeholder="Search pending cases..."
                    className="w-full pl-10 pr-4 py-2.5 border border-[#D4E1EA] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#022658] focus:border-transparent"
                  />
                  {pendingSearchQuery && (
                    <button
                      type="button"
                      onClick={() => setPendingSearchQuery('')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#868C98] hover:text-[#040E1B]"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>

                {pendingLoading ? (
                  <div className="flex justify-center items-center py-12">
                    <span className="text-[#525866] text-sm">Loading pending cases...</span>
                  </div>
                ) : pendingData.length > 0 ? (
                  <>
                    <div className="space-y-4">
                      {pendingData.map((caseItem) => (
                        <div key={caseItem.id} className="border border-[#E4E7EB] rounded-lg p-4">
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <span className="text-[#868C98] text-xs">Case Title</span>
                                <p className="text-[#040E1B] text-sm">{caseItem.title || 'N/A'}</p>
                              </div>
                              <div>
                                <span className="text-[#868C98] text-xs">Suit Reference Number</span>
                                <p className="text-[#040E1B] text-sm">{caseItem.suit_reference_number || 'N/A'}</p>
                              </div>
                              <div>
                                <span className="text-[#868C98] text-xs">Court Name</span>
                                <p className="text-[#040E1B] text-sm">{getCourtTypeName(caseItem.court_type)}</p>
                              </div>
                              <div>
                                <span className="text-[#868C98] text-xs">Edited by</span>
                                <p className="text-[#040E1B] text-sm">{caseItem.presiding_judge || 'N/A'}</p>
                              </div>
                              <div>
                                <span className="text-[#868C98] text-xs">Date</span>
                                <p className="text-[#040E1B] text-sm">{formatDate(caseItem.date) || 'N/A'}</p>
                              </div>
                              <div>
                                <span className="text-[#868C98] text-xs">Case Progress</span>
                                {(() => {
                                  const badge = getCaseProgressBadge(caseItem.case_progress);
                                  return (
                                    <span className={`inline-flex px-2 py-1 rounded-lg text-xs font-medium ${badge.className}`}>
                                      {badge.text}
                                    </span>
                                  );
                                })()}
                              </div>
                            </div>
                            <div className="flex justify-end pt-2 border-t border-[#E4E7EB]">
                              <button
                                onClick={async () => {
                                  try {
                                    const fullCaseData = await apiGet(`/cases/${caseItem.id}`);
                                    sessionStorage.setItem('selectedCaseData', JSON.stringify(fullCaseData));
                                    if (onNavigate) {
                                      onNavigate('case-profile');
                                    }
                                  } catch (err) {
                                    console.error('Error fetching case details:', err);
                                    sessionStorage.setItem('selectedCaseData', JSON.stringify(caseItem));
                                    if (onNavigate) {
                                      onNavigate('case-profile');
                                    }
                                  }
                                }}
                                className="flex items-center gap-2 px-4 py-2 bg-[#022658] text-white rounded-lg hover:bg-[#1A4983] transition-colors text-sm font-medium"
                              >
                                <ExternalLink className="w-4 h-4" />
                                View Case Details
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {pendingTotalPages > 1 && (
                      <div className="flex items-center justify-between pt-4 border-t border-[#E4E7EB]">
                        <div className="text-[#525866] text-sm">
                          Showing {(pendingPage - 1) * pendingLimit + 1} to {Math.min(pendingPage * pendingLimit, pendingTotal)} of {pendingTotal} results
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setPendingPage(prev => Math.max(1, prev - 1))}
                            disabled={pendingPage === 1}
                            className={`px-3 py-1 rounded border ${pendingPage === 1 ? 'text-[#9AA1AB] border-[#E4E7EB] cursor-not-allowed' : 'text-[#022658] border-[#022658] hover:bg-[#F7F8FA]'}`}
                          >
                            <ChevronLeft className="w-4 h-4" />
                          </button>
                          <span className="text-[#525866] text-sm">Page {pendingPage} of {pendingTotalPages}</span>
                          <button
                            onClick={() => setPendingPage(prev => Math.min(pendingTotalPages, prev + 1))}
                            disabled={pendingPage === pendingTotalPages}
                            className={`px-3 py-1 rounded border ${pendingPage === pendingTotalPages ? 'text-[#9AA1AB] border-[#E4E7EB] cursor-not-allowed' : 'text-[#022658] border-[#022658] hover:bg-[#F7F8FA]'}`}
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-[#525866] text-sm">No pending cases found</p>
                )}
              </div>
            )}

            {activeTab === 'beneficial' && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-[#040E1B]">Beneficial Owners</h3>
                {beneficialOwners.length > 0 ? (
                  <div className="space-y-4">
                    {beneficialOwners.map((owner, idx) => (
                      <div key={idx} className="border border-[#E4E7EB] rounded-lg p-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <span className="text-[#868C98] text-xs">Full Name</span>
                            <p className="text-[#040E1B] text-sm">{owner.full_name || owner.name || 'N/A'}</p>
                          </div>
                          <div>
                            <span className="text-[#868C98] text-xs">Ownership (%)</span>
                            <p className="text-[#040E1B] text-sm">{owner.percentage_ownership || 'N/A'}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[#525866] text-sm">No beneficial owners found</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InsuranceDetails;
