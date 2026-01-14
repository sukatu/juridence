import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Edit, Save, X, ArrowLeft, ChevronRight, Search, Filter, ChevronLeft, ChevronDown, ExternalLink } from 'lucide-react';
import { apiGet } from '../../utils/api';
import AdminHeader from './AdminHeader';

const BankDetails = ({ bank, industry, onBack, userInfo, onNavigate, onLogout }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('personal');
  const [bankData, setBankData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Judgements & Rulings state
  const [rulingsSearchQuery, setRulingsSearchQuery] = useState('');
  const [rulingsFilter, setRulingsFilter] = useState({
    court_type: '',
    status: '',
    area_of_law: '',
    year: ''
  });
  const [showRulingsFilters, setShowRulingsFilters] = useState(false);
  const [rulingsPage, setRulingsPage] = useState(1);
  const [rulingsLimit] = useState(10);
  const [rulingsTotal, setRulingsTotal] = useState(0);
  const [rulingsTotalPages, setRulingsTotalPages] = useState(0);
  const [rulingsLoading, setRulingsLoading] = useState(false);
  const [rulingsData, setRulingsData] = useState([]);
  const rulingsFilterRef = useRef(null);

  // Extract bank ID and name
  const bankId = typeof bank === 'object' && bank?.id ? bank.id : null;
  const bankName = typeof bank === 'string' 
    ? bank 
    : (bank?.name || bank?.short_name || 'Unknown Bank');

  // Fetch bank details from API
  useEffect(() => {
    const fetchBankDetails = async () => {
      if (!bankId) {
        if (typeof bank === 'object' && bank) {
          setBankData(bank);
          setLoading(false);
        } else {
          setError('Bank ID not found');
          setLoading(false);
        }
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        const response = await apiGet(`/admin/banks/${bankId}`);
        
        // Handle response structure - API returns { bank: {...}, directors: [...], secretaries: [...], ... }
        setBankData(response);
      } catch (err) {
        console.error('Error fetching bank details:', err);
        setError('Failed to load bank details. Please try again.');
        if (typeof bank === 'object' && bank) {
          setBankData(bank);
        } else {
          setBankData(null);
        }
      } finally {
        setLoading(false);
      }
    };

    setBankData(null);
    setLoading(true);
    setError(null);
    
    fetchBankDetails();
  }, [bankId, bank]);

  // Helper function to format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    } catch (e) {
      return dateString;
    }
  };

  // Helper function to get full court type name
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
      'high_court': 'High Court',
      'supreme_court': 'Supreme Court',
      'court_of_appeal': 'Court of Appeal',
      'circuit_court': 'Circuit Court',
      'district_court': 'District Court',
      'commercial_court': 'Commercial Court',
      'family_court': 'Family Court',
      'land_court': 'Land Court',
    };
    return courtTypeMap[courtType] || courtType;
  };

  // Bank logo mapping (same as CompaniesListView)
  const bankLogoMap = {
    'ACCESS BANK (GHANA) PLC': '/banks/ACCESS_BANK_GHANA_PLC.png',
    'ACCESS BANK GHANA PLC': '/banks/ACCESS_BANK_GHANA_PLC.png',
    'ACCESS BANK GHANA': '/banks/ACCESS_BANK_GHANA_PLC.png',
    'ACCESS BANK': '/banks/ACCESS_BANK_GHANA_PLC.png',
    'ABSA BANK GHANA LIMITED': '/banks/ABSA_BANK_GHANA_LTD.png',
    'ABSA BANK GHANA LTD': '/banks/ABSA_BANK_GHANA_LTD.png',
    'ABSA BANK GHANA': '/banks/ABSA_BANK_GHANA_LTD.png',
    'ABSA BANK': '/banks/ABSA_BANK_GHANA_LTD.png',
    'BANK OF GHANA': '/banks/Bank of ghana.jpeg',
    'BOG': '/banks/Bank of ghana.jpeg',
    'CAL BANK LIMITED': '/banks/CAL_BANK_LTD.png',
    'CAL BANK LTD': '/banks/CAL_BANK_LTD.png',
    'CAL BANK': '/banks/CAL_BANK_LTD.png',
    'ECOBANK GHANA PLC': '/banks/ECOBANK_GHANA_PLC.png',
    'ECOBANK GHANA': '/banks/ECOBANK_GHANA_PLC.png',
    'ECOBANK': '/banks/ECOBANK_GHANA_PLC.png',
    'FBN BANK (GHANA) LIMITED': '/banks/FBN_BANK_GHANA_LTD.png',
    'FBN BANK GHANA LTD': '/banks/FBN_BANK_GHANA_LTD.png',
    'FBN BANK GHANA': '/banks/FBN_BANK_GHANA_LTD.png',
    'FBN BANK': '/banks/FBN_BANK_GHANA_LTD.png',
    'FIDELITY BANK GHANA LIMITED': '/banks/FIDELITY_BANK_GHANA_LTD.png',
    'FIDELITY BANK GHANA LTD': '/banks/FIDELITY_BANK_GHANA_LTD.png',
    'FIDELITY BANK GHANA': '/banks/FIDELITY_BANK_GHANA_LTD.png',
    'FIDELITY BANK': '/banks/FIDELITY_BANK_GHANA_LTD.png',
    'FIRST ATLANTIC BANK LIMITED': '/banks/FIRST_ATLANTIC_BANK_LTD.png',
    'FIRST ATLANTIC BANK LTD': '/banks/FIRST_ATLANTIC_BANK_LTD.png',
    'FIRST ATLANTIC BANK': '/banks/FIRST_ATLANTIC_BANK_LTD.png',
    'GCB BANK LIMITED': '/banks/GCB_BANK_LTD.png',
    'GCB BANK LTD': '/banks/GCB_BANK_LTD.png',
    'GCB BANK': '/banks/GCB_BANK_LTD.png',
    'GUARANTY TRUST BANK (GHANA) LIMITED': '/banks/GUARANTY_TRUST_BANK_GHANA_LTD.png',
    'GUARANTY TRUST BANK GHANA LTD': '/banks/GUARANTY_TRUST_BANK_GHANA_LTD.png',
    'GUARANTY TRUST BANK GHANA': '/banks/GUARANTY_TRUST_BANK_GHANA_LTD.png',
    'GTB BANK': '/banks/GUARANTY_TRUST_BANK_GHANA_LTD.png',
    'GTB': '/banks/GUARANTY_TRUST_BANK_GHANA_LTD.png',
    'NATIONAL INVESTMENT BANK LIMITED': '/banks/NATIONAL_INVESTMENT_BANK_LTD.png',
    'NATIONAL INVESTMENT BANK LTD': '/banks/NATIONAL_INVESTMENT_BANK_LTD.png',
    'NATIONAL INVESTMENT BANK': '/banks/NATIONAL_INVESTMENT_BANK_LTD.png',
    'NIB': '/banks/NATIONAL_INVESTMENT_BANK_LTD.png',
    'OMNIBSIC BANK GHANA LIMITED': '/banks/OMNIBSIC_BANK_GHANA_LTD.png',
    'OMNIBSIC BANK GHANA LTD': '/banks/OMNIBSIC_BANK_GHANA_LTD.png',
    'OMNIBSIC BANK': '/banks/OMNIBSIC_BANK_GHANA_LTD.png',
    'PRUDENTIAL BANK LIMITED': '/banks/PRUDENTIAL_BANK_LTD.png',
    'PRUDENTIAL BANK LTD': '/banks/PRUDENTIAL_BANK_LTD.png',
    'PRUDENTIAL BANK': '/banks/PRUDENTIAL_BANK_LTD.png',
    'REPUBLIC BANK (GHANA) PLC': '/banks/REPUBLIC_BANK_GHANA_PLC.png',
    'REPUBLIC BANK GHANA PLC': '/banks/REPUBLIC_BANK_GHANA_PLC.png',
    'REPUBLIC BANK GHANA': '/banks/REPUBLIC_BANK_GHANA_PLC.png',
    'REPUBLIC BANK': '/banks/REPUBLIC_BANK_GHANA_PLC.png',
    'SOCIETE GENERALE GHANA PLC': '/banks/SOCIETE_GENERALE_GHANA_PLC.png',
    'SOCIETE GENERALE GHANA': '/banks/SOCIETE_GENERALE_GHANA_PLC.png',
    'SOCIETE GENERALE': '/banks/SOCIETE_GENERALE_GHANA_PLC.png',
    'STANBIC BANK GHANA LIMITED': '/banks/STANBIC_BANK_GHANA_LTD.png',
    'STANBIC BANK GHANA LTD': '/banks/STANBIC_BANK_GHANA_LTD.png',
    'STANBIC BANK GHANA': '/banks/STANBIC_BANK_GHANA_LTD.png',
    'STANBIC BANK': '/banks/STANBIC_BANK_GHANA_LTD.png',
    'STANDARD CHARTERED BANK GHANA PLC': '/banks/STANDARD_CHARTERED_BANK_GHANA.png',
    'STANDARD CHARTERED BANK GHANA': '/banks/STANDARD_CHARTERED_BANK_GHANA.png',
    'STANDARD CHARTERED BANK': '/banks/STANDARD_CHARTERED_BANK_GHANA.png',
    'STANDARD CHARTERED': '/banks/STANDARD_CHARTERED_BANK_GHANA.png',
    'UNITED BANK FOR AFRICA (GHANA) LIMITED': '/banks/UNITED_BANK_FOR_AFRICA_GHANA_LTD.png',
    'UNITED BANK FOR AFRICA GHANA LTD': '/banks/UNITED_BANK_FOR_AFRICA_GHANA_LTD.png',
    'UNITED BANK FOR AFRICA GHANA': '/banks/UNITED_BANK_FOR_AFRICA_GHANA_LTD.png',
    'UNITED BANK FOR AFRICA': '/banks/UNITED_BANK_FOR_AFRICA_GHANA_LTD.png',
    'UBA': '/banks/UNITED_BANK_FOR_AFRICA_GHANA_LTD.png',
    'UNIVERSAL MERCHANT BANK LTD': '/banks/UNIVERSAL_MERCHANT_BANK_LTD.png',
    'UNIVERSAL MERCHANT BANK': '/banks/UNIVERSAL_MERCHANT_BANK_LTD.png',
    'UMB': '/banks/UNIVERSAL_MERCHANT_BANK_LTD.png',
    'ZENITH BANK (GHANA) LIMITED': '/banks/ZENITH_BANK_GHANA_LTD.png',
    'ZENITH BANK GHANA LTD': '/banks/ZENITH_BANK_GHANA_LTD.png',
    'ZENITH BANK GHANA': '/banks/ZENITH_BANK_GHANA_LTD.png',
    'ZENITH BANK': '/banks/ZENITH_BANK_GHANA_LTD.png',
  };

  const getBankLogo = (bankName, logoUrl) => {
    // First, use logo_url from database if available
    // But if it's bog.png, map it to the correct file
    if (logoUrl) {
      if (logoUrl.includes('bog.png')) {
        return '/banks/Bank of ghana.jpeg';
      }
      return logoUrl;
    }
    
    if (!bankName) return '/companies/default-company.svg';
    
    // Normalize bank name to uppercase for matching
    const nameUpper = bankName.toUpperCase().trim();
    
    // Remove common suffixes and parentheses for matching
    const normalized = nameUpper
      .replace(/\s*\(GHANA\)\s*/gi, ' ')
      .replace(/\s*PLC\s*/gi, ' ')
      .replace(/\s*LTD\s*/gi, ' ')
      .replace(/\s*LIMITED\s*/gi, ' ')
      .trim();
    
    // Try exact match first
    if (bankLogoMap[nameUpper]) {
      return bankLogoMap[nameUpper];
    }
    
    // Try normalized match
    if (bankLogoMap[normalized]) {
      return bankLogoMap[normalized];
    }
    
    // Try partial match
    const partialMatch = Object.keys(bankLogoMap).find(key => {
      const keyUpper = key.toUpperCase();
      return nameUpper.includes(keyUpper) || keyUpper.includes(nameUpper);
    });
    
    if (partialMatch) {
      return bankLogoMap[partialMatch];
    }
    
    // Try to match by extracting key words
    const keyWords = nameUpper.split(/[\s()]+/).filter(w => 
      w.length > 3 && 
      !['LTD', 'LIMITED', 'PLC', 'BANK', 'GHANA', 'GH', 'THE', 'OF', 'AND', 'FOR'].includes(w)
    );
    
    const wordMatch = Object.keys(bankLogoMap).find(key => {
      const keyUpper = key.toUpperCase();
      return keyWords.some(word => keyUpper.includes(word));
    });
    
    if (wordMatch) {
      return bankLogoMap[wordMatch];
    }
    
    // Return default logo
    return '/companies/default-company.svg';
  };

  const tabs = [
    { id: 'personal', label: 'Personal details' },
    { id: 'directors', label: 'Directors' },
    { id: 'secretaries', label: 'Secretaries' },
    { id: 'auditors', label: 'Auditors' },
    { id: 'regulatory', label: 'Regulatory and Compliance' },
    { id: 'shareholders', label: 'Shareholder' },
    { id: 'judgements', label: 'Judgements and Rulings' },
    { id: 'beneficial', label: 'Beneficial Owners' }
  ];

  // Get related data from API response
  // API returns { bank: {...}, directors: [...], secretaries: [...], ... }
  // But if bankData is the bank object directly, use it
  const bankInfo = bankData?.bank || bankData;
  const directors = bankData?.directors || [];
  const secretaries = bankData?.secretaries || [];
  const auditors = bankData?.auditors || [];
  const shareholders = bankData?.shareholders || [];
  const beneficialOwners = bankData?.beneficial_owners || [];
  const contactDetails = bankData?.contact_details || null;
  const phoneNumbers = bankData?.phone_numbers || [];
  const relatedCases = bankData?.related_cases || [];
  
  // Extract bank ID
  const bankIdForRulings = typeof bank === 'object' && bank?.id ? bank.id : null;
  
  // Fetch rulings when judgements tab is active
  useEffect(() => {
    const fetchRulings = async () => {
      if (activeTab !== 'judgements' || !bankIdForRulings) {
        return;
      }
      
      try {
        setRulingsLoading(true);
        
        const params = new URLSearchParams({
          page: rulingsPage.toString(),
          limit: rulingsLimit.toString()
        });
        
        if (rulingsSearchQuery) {
          params.append('search', rulingsSearchQuery);
        }
        if (rulingsFilter.court_type) {
          params.append('court_type', rulingsFilter.court_type);
        }
        if (rulingsFilter.status) {
          params.append('status', rulingsFilter.status);
        }
        if (rulingsFilter.area_of_law) {
          params.append('area_of_law', rulingsFilter.area_of_law);
        }
        if (rulingsFilter.year) {
          params.append('year', rulingsFilter.year);
        }
        
        const response = await apiGet(`/admin/banks/${bankIdForRulings}/rulings?${params}`);
        setRulingsData(response.rulings || []);
        setRulingsTotal(response.total || 0);
        setRulingsTotalPages(response.total_pages || 0);
      } catch (err) {
        console.error('Error fetching rulings:', err);
        setRulingsData([]);
        setRulingsTotal(0);
        setRulingsTotalPages(0);
      } finally {
        setRulingsLoading(false);
      }
    };
    
    fetchRulings();
  }, [activeTab, bankIdForRulings, rulingsPage, rulingsSearchQuery, rulingsFilter, rulingsLimit]);
  
  // Handle click outside to close filters
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (rulingsFilterRef.current && !rulingsFilterRef.current.contains(event.target)) {
        setShowRulingsFilters(false);
      }
    };
    
    if (showRulingsFilters) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showRulingsFilters]);
  
  // Reset page when search or filters change
  useEffect(() => {
    setRulingsPage(1);
  }, [rulingsSearchQuery, rulingsFilter]);

  if (loading) {
    return (
      <div className="bg-[#F7F8FA] min-h-screen pt-2">
        <AdminHeader userInfo={userInfo} onNavigate={onNavigate} onLogout={onLogout} />
        <div className="flex justify-center items-center py-12">
          <span className="text-[#525866] text-sm">Loading bank details...</span>
        </div>
      </div>
    );
  }

  if (error && !bankData) {
    return (
      <div className="bg-[#F7F8FA] min-h-screen pt-2">
        <AdminHeader userInfo={userInfo} onNavigate={onNavigate} onLogout={onLogout} />
        <div className="flex justify-center items-center py-12">
          <span className="text-red-500 text-sm">{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#F7F8FA] min-h-screen pt-2">
      <AdminHeader userInfo={userInfo} onNavigate={onNavigate} onLogout={onLogout} />
      
      <div className="px-6 py-4">
        <div className="bg-white rounded-lg p-6">
          {/* Breadcrumb */}
          <div className="flex items-start mb-6">
            <span className="text-[#525866] text-xs mr-1.5">BANKS</span>
            <ChevronRight className="w-4 h-4 text-[#525866] mr-1 flex-shrink-0" />
            <span className="text-[#525866] text-xs">{industry?.name?.toUpperCase() || 'BANKING & FINANCE'}</span>
            <ChevronRight className="w-4 h-4 text-[#525866] mr-1 flex-shrink-0" />
            <span className="text-[#070810] text-sm">{bankName}</span>
          </div>

          {/* Bank Header */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <button onClick={onBack} className="cursor-pointer hover:opacity-70">
                <ArrowLeft className="w-4 h-4 text-[#040E1B]" />
              </button>
              {bankInfo && (
                <img
                  src={getBankLogo(bankInfo.name || bankName, bankInfo.logo_url)}
                  alt={bankName}
                  className="w-12 h-12 rounded-lg object-contain flex-shrink-0 bg-white border border-[#D4E1EA]"
                  onError={(e) => {
                    if (e.target.src !== '/companies/default-company.svg') {
                      e.target.src = '/companies/default-company.svg';
                    }
                  }}
                />
              )}
              <div className="flex flex-col items-start gap-1">
                <span className="text-[#040E1B] text-xl font-bold">{bankName}</span>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex items-start p-1 gap-4 mb-6 border-b border-[#E4E7EB]">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-start pb-2 ${
                  activeTab === tab.id ? 'border-b-2 border-[#022658]' : ''
                }`}
              >
                <span className={`text-base ${
                  activeTab === tab.id ? 'text-[#022658] font-bold' : 'text-[#525866]'
                }`}>
                  {tab.label}
                </span>
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="py-4">
            {activeTab === 'personal' && (
              <div className="space-y-6">
                <h3 className="text-lg font-bold text-[#040E1B]">Personal Details</h3>
                {bankInfo ? (
                  <div className="space-y-6">
                    {/* Logo Section */}
                    <div className="flex items-center gap-4 pb-4 border-b border-[#E4E7EB]">
                      <img
                        src={getBankLogo(bankInfo.name || bankName, bankInfo.logo_url)}
                        alt={bankName}
                        className="w-20 h-20 rounded-lg object-contain flex-shrink-0 bg-white border border-[#D4E1EA] p-2"
                        onError={(e) => {
                          if (e.target.src !== '/companies/default-company.svg') {
                            e.target.src = '/companies/default-company.svg';
                          }
                        }}
                      />
                      <div className="flex flex-col gap-1">
                        <span className="text-[#040E1B] text-xl font-bold">{bankInfo.name || bankName}</span>
                        {bankInfo.short_name && bankInfo.short_name !== bankInfo.name && (
                          <span className="text-[#868C98] text-sm">{bankInfo.short_name}</span>
                        )}
                      </div>
                    </div>
                    {/* Details Grid */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-[#868C98] text-xs">Name</span>
                        <p className="text-[#040E1B] text-sm">{bankInfo.name || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="text-[#868C98] text-xs">Registration Number</span>
                        <p className="text-[#040E1B] text-sm">{bankInfo.registration_number || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="text-[#868C98] text-xs">Company Type</span>
                        <p className="text-[#040E1B] text-sm">{bankInfo.type_of_company || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="text-[#868C98] text-xs">Business Entity Type</span>
                        <p className="text-[#040E1B] text-sm">{bankInfo.business_entity_type || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="text-[#868C98] text-xs">Bank Type</span>
                        <p className="text-[#040E1B] text-sm">{bankInfo.bank_type || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="text-[#868C98] text-xs">Ownership Type</span>
                        <p className="text-[#040E1B] text-sm">{bankInfo.ownership_type || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="text-[#868C98] text-xs">GPS Address</span>
                        <p className="text-[#040E1B] text-sm">{bankInfo.head_office_address || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="text-[#868C98] text-xs">Landmark</span>
                        <p className="text-[#040E1B] text-sm">{bankInfo.landmark || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="text-[#868C98] text-xs">Region</span>
                        <p className="text-[#040E1B] text-sm">{bankInfo.region || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="text-[#868C98] text-xs">Town/City</span>
                        <p className="text-[#040E1B] text-sm">{bankInfo.city || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="text-[#868C98] text-xs">Country</span>
                        <p className="text-[#040E1B] text-sm">{bankInfo.country || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="text-[#868C98] text-xs">Date of Incorporation</span>
                        <p className="text-[#040E1B] text-sm">{formatDate(bankInfo.date_of_incorporation) || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="text-[#868C98] text-xs">Commencement Date</span>
                        <p className="text-[#040E1B] text-sm">{formatDate(bankInfo.commencement_date) || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="text-[#868C98] text-xs">ISIC Code</span>
                        <p className="text-[#040E1B] text-sm">{bankInfo.isic_code || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="text-[#868C98] text-xs">Constitution Option</span>
                        <p className="text-[#040E1B] text-sm">{bankInfo.constitution_option || 'N/A'}</p>
                      </div>
                      {(bankInfo.financial_year_end_month || bankInfo.financial_year_end_day) && (
                        <div>
                          <span className="text-[#868C98] text-xs">Financial Year End</span>
                          <p className="text-[#040E1B] text-sm">
                            {bankInfo.financial_year_end_month && bankInfo.financial_year_end_day
                              ? `${bankInfo.financial_year_end_month}/${bankInfo.financial_year_end_day}`
                              : bankInfo.financial_year_end_month || bankInfo.financial_year_end_day || 'N/A'}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Additional Business Information */}
                    {(bankInfo.principal_activity || bankInfo.objects_of_company) && (
                      <>
                        <h3 className="text-lg font-bold text-[#040E1B] mt-6">Business Information</h3>
                        <div className="space-y-4">
                          {bankInfo.principal_activity && (
                            <div>
                              <span className="text-[#868C98] text-xs">Principal Activity</span>
                              <p className="text-[#040E1B] text-sm mt-1 whitespace-pre-line">{bankInfo.principal_activity}</p>
                            </div>
                          )}
                          {bankInfo.objects_of_company && (
                            <div>
                              <span className="text-[#868C98] text-xs">Objects of the Company</span>
                              <p className="text-[#040E1B] text-sm mt-1 whitespace-pre-line">{bankInfo.objects_of_company}</p>
                            </div>
                          )}
                        </div>
                      </>
                    )}

                    {/* Contact Details Section */}
                    {contactDetails && (
                      <>
                        <h3 className="text-lg font-bold text-[#040E1B] mt-6">Contact Details</h3>
                        <div className="grid grid-cols-2 gap-4">
                          {contactDetails.phone && (
                            <div>
                              <span className="text-[#868C98] text-xs">Phone</span>
                              <p className="text-[#040E1B] text-sm">{contactDetails.phone}</p>
                            </div>
                          )}
                          {contactDetails.email && (
                            <div>
                              <span className="text-[#868C98] text-xs">Email</span>
                              <p className="text-[#040E1B] text-sm">{contactDetails.email}</p>
                            </div>
                          )}
                          {contactDetails.website && (
                            <div>
                              <span className="text-[#868C98] text-xs">Website</span>
                              <p className="text-[#040E1B] text-sm">
                                <a href={contactDetails.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                  {contactDetails.website}
                                </a>
                              </p>
                            </div>
                          )}
                          {contactDetails.fax && (
                            <div>
                              <span className="text-[#868C98] text-xs">Fax</span>
                              <p className="text-[#040E1B] text-sm">{contactDetails.fax}</p>
                            </div>
                          )}
                          {contactDetails.ghana_digital_address && (
                            <div>
                              <span className="text-[#868C98] text-xs">Ghana Digital Address</span>
                              <p className="text-[#040E1B] text-sm">{contactDetails.ghana_digital_address}</p>
                            </div>
                          )}
                          {contactDetails.house_building_flat_number && (
                            <div>
                              <span className="text-[#868C98] text-xs">House/Building/Flat Number</span>
                              <p className="text-[#040E1B] text-sm">{contactDetails.house_building_flat_number}</p>
                            </div>
                          )}
                          {contactDetails.street_name_landmark && (
                            <div>
                              <span className="text-[#868C98] text-xs">Street Name/Landmark</span>
                              <p className="text-[#040E1B] text-sm">{contactDetails.street_name_landmark}</p>
                            </div>
                          )}
                          {contactDetails.city && (
                            <div>
                              <span className="text-[#868C98] text-xs">City</span>
                              <p className="text-[#040E1B] text-sm">{contactDetails.city}</p>
                            </div>
                          )}
                          {contactDetails.region && (
                            <div>
                              <span className="text-[#868C98] text-xs">Region</span>
                              <p className="text-[#040E1B] text-sm">{contactDetails.region}</p>
                            </div>
                          )}
                          {contactDetails.district && (
                            <div>
                              <span className="text-[#868C98] text-xs">District</span>
                              <p className="text-[#040E1B] text-sm">{contactDetails.district}</p>
                            </div>
                          )}
                          {contactDetails.country && (
                            <div>
                              <span className="text-[#868C98] text-xs">Country</span>
                              <p className="text-[#040E1B] text-sm">{contactDetails.country}</p>
                            </div>
                          )}
                          {contactDetails.postal_address_type && (
                            <div>
                              <span className="text-[#868C98] text-xs">Postal Address Type</span>
                              <p className="text-[#040E1B] text-sm">{contactDetails.postal_address_type}</p>
                            </div>
                          )}
                          {contactDetails.postal_address && (
                            <div>
                              <span className="text-[#868C98] text-xs">Postal Address</span>
                              <p className="text-[#040E1B] text-sm">{contactDetails.postal_address}</p>
                            </div>
                          )}
                          {(contactDetails.latitude || contactDetails.longitude) && (
                            <div className="col-span-2">
                              <span className="text-[#868C98] text-xs">Coordinates</span>
                              <p className="text-[#040E1B] text-sm">
                                {contactDetails.latitude && contactDetails.longitude
                                  ? `${contactDetails.latitude}, ${contactDetails.longitude}`
                                  : contactDetails.latitude || contactDetails.longitude}
                              </p>
                            </div>
                          )}
                          {contactDetails.customer_service_phone && (
                            <div>
                              <span className="text-[#868C98] text-xs">Customer Service Phone</span>
                              <p className="text-[#040E1B] text-sm">{contactDetails.customer_service_phone}</p>
                            </div>
                          )}
                          {contactDetails.customer_service_email && (
                            <div>
                              <span className="text-[#868C98] text-xs">Customer Service Email</span>
                              <p className="text-[#040E1B] text-sm">{contactDetails.customer_service_email}</p>
                            </div>
                          )}
                        </div>

                        {/* Phone Numbers Table */}
                        <div className="mt-6">
                          <h4 className="text-base font-bold text-[#040E1B] mb-4">Phone Numbers</h4>
                          {phoneNumbers && phoneNumbers.length > 0 ? (
                            <div className="overflow-hidden rounded-lg border border-[#E5E8EC]">
                              {/* Table Header */}
                              <div className="bg-[#F4F6F9] py-3 px-4">
                                <div className="grid grid-cols-3 gap-4">
                                  <div>
                                    <span className="text-[#070810] text-sm font-bold">Phone Number</span>
                                  </div>
                                  <div>
                                    <span className="text-[#070810] text-sm font-bold">Type</span>
                                  </div>
                                  <div>
                                    <span className="text-[#070810] text-sm font-bold">Label</span>
                                  </div>
                                </div>
                              </div>

                              {/* Table Body */}
                              <div className="bg-white">
                                {phoneNumbers.map((phone, index) => (
                                  <div
                                    key={phone.id || index}
                                    className={`grid grid-cols-3 gap-4 py-3 px-4 ${
                                      index < phoneNumbers.length - 1 ? 'border-b border-[#E5E8EC]' : ''
                                    }`}
                                  >
                                    <div>
                                      <span className="text-[#070810] text-sm">{phone.phone_number || 'N/A'}</span>
                                    </div>
                                    <div>
                                      <span className="text-[#070810] text-sm">{phone.phone_type || 'N/A'}</span>
                                    </div>
                                    <div>
                                      <span className="text-[#070810] text-sm">{phone.label || 'N/A'}</span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ) : (
                            <p className="text-[#525866] text-sm">No phone numbers available</p>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                ) : (
                  <p className="text-[#525866] text-sm">No bank data available</p>
                )}
              </div>
            )}

            {activeTab === 'directors' && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-[#040E1B]">Directors</h3>
                {directors.length > 0 ? (
                  <div className="grid grid-cols-2 gap-4">
                    {directors.map((director, idx) => (
                      <div key={idx} className="border border-[#E4E7EB] rounded-lg p-4">
                        <p className="text-[#040E1B] text-sm">{director.full_name || director.name || 'N/A'}</p>
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
                  <h3 className="text-lg font-bold text-[#040E1B]">Judgements and Rulings</h3>
                </div>
                
                {/* Search and Filter Bar */}
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-4">
                    {/* Search Input */}
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#868C98]" />
                      <input
                        type="text"
                        placeholder="Search by case title, suit number, parties..."
                        value={rulingsSearchQuery}
                        onChange={(e) => setRulingsSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-[#F7F8FA] rounded-lg border border-[#E4E7EB] text-[#040E1B] text-sm outline-none focus:border-[#022658]"
                      />
                    </div>
                    
                    {/* Filter Button */}
                    <div className="relative" ref={rulingsFilterRef}>
                      <button
                        onClick={() => setShowRulingsFilters(!showRulingsFilters)}
                        className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg border border-[#E4E7EB] text-[#525866] text-sm hover:bg-[#F7F8FA] transition-colors"
                      >
                        <Filter className="w-4 h-4" />
                        <span>Filter</span>
                        {Object.values(rulingsFilter).some(v => v) && (
                          <span className="w-2 h-2 bg-[#022658] rounded-full"></span>
                        )}
                      </button>
                      
                      {/* Filter Dropdown */}
                      {showRulingsFilters && (
                        <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-lg border border-[#E4E7EB] shadow-lg z-10 p-4">
                          <div className="space-y-4">
                            {/* Court Type Filter */}
                            <div>
                              <label className="block text-[#525866] text-xs font-medium mb-2">Court Type</label>
                              <select
                                value={rulingsFilter.court_type}
                                onChange={(e) => setRulingsFilter(prev => ({ ...prev, court_type: e.target.value }))}
                                className="w-full px-3 py-2 bg-[#F7F8FA] rounded-lg border border-[#E4E7EB] text-[#040E1B] text-sm outline-none focus:border-[#022658]"
                              >
                                <option value="">All Court Types</option>
                                <option value="SC">Supreme Court</option>
                                <option value="CA">Court of Appeal</option>
                                <option value="HC">High Court</option>
                                <option value="DC">District Court</option>
                              </select>
                            </div>
                            
                            {/* Status Filter */}
                            <div>
                              <label className="block text-[#525866] text-xs font-medium mb-2">Status</label>
                              <select
                                value={rulingsFilter.status}
                                onChange={(e) => setRulingsFilter(prev => ({ ...prev, status: e.target.value }))}
                                className="w-full px-3 py-2 bg-[#F7F8FA] rounded-lg border border-[#E4E7EB] text-[#040E1B] text-sm outline-none focus:border-[#022658]"
                              >
                                <option value="">All Status</option>
                                <option value="active">Active</option>
                                <option value="closed">Closed</option>
                                <option value="pending">Pending</option>
                              </select>
                            </div>
                            
                            {/* Year Filter */}
                            <div>
                              <label className="block text-[#525866] text-xs font-medium mb-2">Year</label>
                              <input
                                type="number"
                                placeholder="e.g. 2024"
                                value={rulingsFilter.year}
                                onChange={(e) => setRulingsFilter(prev => ({ ...prev, year: e.target.value }))}
                                className="w-full px-3 py-2 bg-[#F7F8FA] rounded-lg border border-[#E4E7EB] text-[#040E1B] text-sm outline-none focus:border-[#022658]"
                              />
                            </div>
                            
                            {/* Area of Law Filter */}
                            <div>
                              <label className="block text-[#525866] text-xs font-medium mb-2">Area of Law</label>
                              <input
                                type="text"
                                placeholder="e.g. Contract, Commercial"
                                value={rulingsFilter.area_of_law}
                                onChange={(e) => setRulingsFilter(prev => ({ ...prev, area_of_law: e.target.value }))}
                                className="w-full px-3 py-2 bg-[#F7F8FA] rounded-lg border border-[#E4E7EB] text-[#040E1B] text-sm outline-none focus:border-[#022658]"
                              />
                            </div>
                            
                            {/* Clear Filters Button */}
                            {Object.values(rulingsFilter).some(v => v) && (
                              <button
                                onClick={() => setRulingsFilter({ court_type: '', status: '', area_of_law: '', year: '' })}
                                className="w-full px-4 py-2 bg-[#F7F8FA] rounded-lg border border-[#E4E7EB] text-[#525866] text-sm hover:bg-[#E4E7EB] transition-colors"
                              >
                                Clear Filters
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Rulings List */}
                {rulingsLoading ? (
                  <div className="flex justify-center items-center py-12">
                    <span className="text-[#525866] text-sm">Loading judgements and rulings...</span>
                  </div>
                ) : rulingsData.length > 0 ? (
                  <>
                    <div className="space-y-4">
                      {rulingsData.map((ruling) => (
                        <div key={ruling.id} className="border border-[#E4E7EB] rounded-lg p-4">
                          {ruling.case && (
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <span className="text-[#868C98] text-xs">Case Title</span>
                                  <p className="text-[#040E1B] text-sm">{ruling.case.title || 'N/A'}</p>
                                </div>
                                <div>
                                  <span className="text-[#868C98] text-xs">Suit Reference Number</span>
                                  <p className="text-[#040E1B] text-sm">{ruling.case.suit_reference_number || 'N/A'}</p>
                                </div>
                                <div>
                                  <span className="text-[#868C98] text-xs">Court Name</span>
                                  <p className="text-[#040E1B] text-sm">{getCourtTypeName(ruling.case.court_type) || 'N/A'}</p>
                                </div>
                                <div>
                                  <span className="text-[#868C98] text-xs">Date</span>
                                  <p className="text-[#040E1B] text-sm">{formatDate(ruling.case.date) || 'N/A'}</p>
                                </div>
                              </div>
                              <div className="flex justify-end pt-2 border-t border-[#E4E7EB]">
                                <button
                                  onClick={async () => {
                                    try {
                                      // Fetch full case details from API (using same endpoint as CaseProfilePage)
                                      const fullCaseData = await apiGet(`/cases/${ruling.case.id}`);
                                      
                                      // Navigate to admin dashboard with case-profile tab and pass case data via sessionStorage
                                      if (onNavigate) {
                                        // Store case data in sessionStorage to pass to CaseProfilePage
                                        sessionStorage.setItem('selectedCaseData', JSON.stringify(fullCaseData));
                                        onNavigate('case-profile');
                                      } else {
                                        // Fallback: navigate to admin route
                                        sessionStorage.setItem('selectedCaseData', JSON.stringify(fullCaseData));
                                        navigate('/admin?tab=case-profile');
                                      }
                                    } catch (err) {
                                      console.error('Error fetching case details:', err);
                                      // Fallback: navigate with basic case data
                                      sessionStorage.setItem('selectedCaseData', JSON.stringify(ruling.case));
                                      if (onNavigate) {
                                        onNavigate('case-profile');
                                      } else {
                                        navigate('/admin?tab=case-profile');
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
                          )}
                        </div>
                      ))}
                    </div>
                    
                    {/* Pagination */}
                    {rulingsTotalPages > 1 && (
                      <div className="flex items-center justify-between pt-4 border-t border-[#E4E7EB]">
                        <div className="text-[#525866] text-sm">
                          Showing {(rulingsPage - 1) * rulingsLimit + 1} to {Math.min(rulingsPage * rulingsLimit, rulingsTotal)} of {rulingsTotal} results
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setRulingsPage(prev => Math.max(1, prev - 1))}
                            disabled={rulingsPage === 1}
                            className={`px-3 py-2 rounded-lg border ${
                              rulingsPage === 1
                                ? 'border-[#E4E7EB] text-[#868C98] cursor-not-allowed'
                                : 'border-[#E4E7EB] text-[#040E1B] hover:bg-[#F7F8FA]'
                            } transition-colors`}
                          >
                            <ChevronLeft className="w-4 h-4" />
                          </button>
                          <div className="text-[#040E1B] text-sm">
                            Page {rulingsPage} of {rulingsTotalPages}
                          </div>
                          <button
                            onClick={() => setRulingsPage(prev => Math.min(rulingsTotalPages, prev + 1))}
                            disabled={rulingsPage === rulingsTotalPages}
                            className={`px-3 py-2 rounded-lg border ${
                              rulingsPage === rulingsTotalPages
                                ? 'border-[#E4E7EB] text-[#868C98] cursor-not-allowed'
                                : 'border-[#E4E7EB] text-[#040E1B] hover:bg-[#F7F8FA]'
                            } transition-colors`}
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
                            <p className="text-[#040E1B] text-sm">{owner.full_name || 'N/A'}</p>
                          </div>
                          <div>
                            <span className="text-[#868C98] text-xs">Percentage Ownership</span>
                            <p className="text-[#040E1B] text-sm">{owner.percentage_ownership ? `${owner.percentage_ownership}%` : 'N/A'}</p>
                          </div>
                          <div>
                            <span className="text-[#868C98] text-xs">Ownership Type</span>
                            <p className="text-[#040E1B] text-sm">{owner.ownership_type || 'N/A'}</p>
                          </div>
                          <div>
                            <span className="text-[#868C98] text-xs">Risk Level</span>
                            <p className="text-[#040E1B] text-sm">{owner.risk_level || 'N/A'}</p>
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

export default BankDetails;
