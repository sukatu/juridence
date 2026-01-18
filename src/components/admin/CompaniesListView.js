import React, { useState, useEffect, useRef } from 'react';
import { apiGet } from '../../utils/api';
import { ChevronRight, Filter, X, ArrowLeft, Building2, Search } from 'lucide-react';
import CompanyDetails from './CompanyDetails';
import BankDetails from './BankDetails';
import AddCompanyForm from './AddCompanyForm';
import AdminHeader from './AdminHeader';

const CompaniesListView = ({ userInfo, industry, onBack, onNavigate, onLogout, initialSelectedCompany = null }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchCompanyQuery, setSearchCompanyQuery] = useState('');
  const [companies, setCompanies] = useState([]); // Array of company name strings only
  const [companiesData, setCompaniesData] = useState([]); // Store full company objects
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [showAddCompanyForm, setShowAddCompanyForm] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filter states
  const [companyTypeFilter, setCompanyTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  
  // Debounce ref for search
  const searchTimeoutRef = useRef(null);

  // Check if this is Banking & Finance industry
  const isBankingFinance = industry?.id === 'banking' || industry?.name?.toLowerCase() === 'banking & finance' || industry?.name?.toLowerCase() === 'banking and finance';

  // Bank logo mapping - maps bank names to actual logo files
  const bankLogoMap = {
    'ABSA BANK GHANA LTD': '/banks/ABSA_BANK_GHANA_LTD.png',
    'ACCESS BANK (GHANA) PLC': '/banks/ACCESS_BANK_GHANA_PLC.png',
    'ACCESS BANK GHANA PLC': '/banks/ACCESS_BANK_GHANA_PLC.png',
    'ACCESS BANK GHANA LTD': '/banks/ACCESS_BANK_GHANA_PLC.png',
    'ACCESS BANK': '/banks/ACCESS_BANK_GHANA_PLC.png',
    'AGRICULTURAL DEVELOPMENT BANK': '/banks/AGRICULTURAL_DEVELOPMENT_BANK.png',
    'AGRICULTURAL DEVELOPMENT BANK PLC': '/banks/AGRICULTURAL_DEVELOPMENT_BANK.png',
    'ADB': '/banks/AGRICULTURAL_DEVELOPMENT_BANK.png',
    'BANK OF AFRICA GHANA LIMITED': '/banks/BANK_OF_AFRICA_GHANA_LTD.png',
    'BANK OF AFRICA GHANA LTD': '/banks/BANK_OF_AFRICA_GHANA_LTD.png',
    'BANK OF AFRICA': '/banks/BANK_OF_AFRICA_GHANA_LTD.png',
    'CONSOLIDATED BANK GHANA LIMITED': '/banks/CONSOLIDATED_BANK_GHANA_LTD.png',
    'CONSOLIDATED BANK GHANA LTD': '/banks/CONSOLIDATED_BANK_GHANA_LTD.png',
    'CONSOLIDATED BANK GHANA': '/banks/CONSOLIDATED_BANK_GHANA_LTD.png',
    'CBG': '/banks/CONSOLIDATED_BANK_GHANA_LTD.png',
    'CALBANK PLC': '/banks/CalBank_PLC.png',
    'CAL BANK PLC': '/banks/CalBank_PLC.png',
    'CALBANK': '/banks/CalBank_PLC.png',
    'CAL BANK': '/banks/CalBank_PLC.png',
    'ECOBANK GHANA PLC': '/banks/ECOBANK_GHANA_PLC.png',
    'ECOBANK GHANA': '/banks/ECOBANK_GHANA_PLC.png',
    'ECOBANK': '/banks/ECOBANK_GHANA_PLC.png',
    'FIDELITY BANK (GHANA) LTD': '/banks/FIDELITY_BANK_GHANA_LTD.png',
    'FIDELITY BANK GHANA LTD': '/banks/FIDELITY_BANK_GHANA_LTD.png',
    'FIDELITY BANK GHANA': '/banks/FIDELITY_BANK_GHANA_LTD.png',
    'FIDELITY BANK': '/banks/FIDELITY_BANK_GHANA_LTD.png',
    'FIRST ATLANTIC BANK LIMITED': '/banks/FIRST_ATLANTIC_BANK_LTD.png',
    'FIRST ATLANTIC BANK LTD': '/banks/FIRST_ATLANTIC_BANK_LTD.png',
    'FIRST ATLANTIC BANK': '/banks/FIRST_ATLANTIC_BANK_LTD.png',
    'FIRST BANK (GHANA) LTD': '/banks/FIRST_BANK_GHANA_LTD.png',
    'FIRST BANK GHANA LTD': '/banks/FIRST_BANK_GHANA_LTD.png',
    'FIRST BANK GHANA': '/banks/FIRST_BANK_GHANA_LTD.png',
    'FIRST BANK': '/banks/FIRST_BANK_GHANA_LTD.png',
    'FIRST NATIONAL BANK (GHANA) LIMITED': '/banks/FIRST_NATIONAL_BANK_GHANA_LTD.png',
    'FIRST NATIONAL BANK GHANA LTD': '/banks/FIRST_NATIONAL_BANK_GHANA_LTD.png',
    'FIRST NATIONAL BANK GHANA': '/banks/FIRST_NATIONAL_BANK_GHANA_LTD.png',
    'FIRST NATIONAL BANK': '/banks/FIRST_NATIONAL_BANK_GHANA_LTD.png',
    'GCB BANK PLC': '/banks/GCB_BANK_PLC.png',
    'GCB BANK': '/banks/GCB_BANK_PLC.png',
    'GUARANTY TRUST BANK (GHANA) LIMITED': '/banks/GUARANTY_TRUST_BANK_GHANA_LTD.png',
    'GUARANTY TRUST BANK GHANA LTD': '/banks/GUARANTY_TRUST_BANK_GHANA_LTD.png',
    'GUARANTY TRUST BANK GHANA': '/banks/GUARANTY_TRUST_BANK_GHANA_LTD.png',
    'GTBANK': '/banks/GUARANTY_TRUST_BANK_GHANA_LTD.png',
    'GTB': '/banks/GUARANTY_TRUST_BANK_GHANA_LTD.png',
    'NATIONAL INVESTMENT BANK PLC': '/banks/NATIONAL_INVESTMENT_BANK_PLC.png',
    'NATIONAL INVESTMENT BANK': '/banks/NATIONAL_INVESTMENT_BANK_PLC.png',
    'NIB': '/banks/NATIONAL_INVESTMENT_BANK_PLC.png',
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
    'BANK OF GHANA': '/banks/Bank of ghana.jpeg',
    'BOG': '/banks/Bank of ghana.jpeg',
  };

  useEffect(() => {
    if (initialSelectedCompany && !selectedCompany) {
      setSelectedCompany(initialSelectedCompany);
    }
  }, [initialSelectedCompany, selectedCompany]);

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

  // Fetch companies/banks function
  const fetchCompanies = async (searchTerm = '', companyType = '', status = '') => {
    try {
      setLoading(true);
      setError(null);
      
      if (isBankingFinance) {
        // Fetch banks from banks table
        const params = new URLSearchParams();
        params.append('page', '1');
        params.append('limit', '100');
        params.append('sort_by', 'name');
        params.append('sort_order', 'asc');
        
        if (searchTerm.trim()) {
          params.append('query', searchTerm.trim());
        }
        
        if (companyType) {
          params.append('bank_type', companyType);
        }
        
        const response = await fetch(`/api/banks/search?${params.toString()}`, {
          headers: { 'Content-Type': 'application/json' }
        });
        
        if (response.ok) {
          const data = await response.json();
          let banks = data.banks || [];
          
          // Filter by status if needed
          if (status) {
            banks = banks.filter(bank => {
              const bankStatus = bank.status || (bank.is_active ? 'Active' : 'Inactive');
              return bankStatus.toLowerCase() === status.toLowerCase();
            });
          }
          
          // Store full bank objects
          setCompaniesData(banks);
          // Extract bank names for display
          const bankNames = banks
            .map(bank => {
              if (typeof bank === 'string') return bank;
              if (bank && typeof bank === 'object') {
                return bank?.name || bank?.short_name || `Bank ${bank?.id || 'Unknown'}`;
              }
              return String(bank || 'Unknown');
            })
            .filter(name => typeof name === 'string');
          setCompanies(bankNames);
        } else {
          const errorData = await response.json();
          console.error('Error fetching banks:', errorData);
          setError('Failed to load banks. Please try again.');
          setCompanies([]);
          setCompaniesData([]);
        }
      } else {
        // Fetch companies from companies table (original logic)
      const params = new URLSearchParams();
      if (industry?.name) {
        params.append('industry', industry.name);
      }
      if (searchTerm.trim()) {
        params.append('search', searchTerm.trim());
      }
      if (companyType) {
        params.append('company_type', companyType);
      }
        params.append('limit', '100');
      
      const response = await apiGet(`/admin/companies/?${params.toString()}`);
      
      if (response && response.companies) {
        // Filter by status if needed (client-side since backend doesn't have status filter yet)
        let filtered = response.companies;
        if (status) {
          filtered = filtered.filter(company => {
            const companyStatus = company.status || (company.is_active ? 'Active' : 'Inactive');
            return companyStatus.toLowerCase() === status.toLowerCase();
          });
        }
        
        // Store full company objects
        setCompaniesData(filtered);
        // Extract company names for display - ensure we always get a string
        const companyNames = filtered
          .map(company => {
            if (typeof company === 'string') return company;
            if (company && typeof company === 'object') {
              return company?.name || company?.short_name || `Company ${company?.id || 'Unknown'}`;
            }
            return String(company || 'Unknown');
          })
          .filter(name => typeof name === 'string'); // Double-check: only keep strings
        setCompanies(companyNames);
      } else {
        setCompanies([]);
        setCompaniesData([]);
        }
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(`Failed to load ${isBankingFinance ? 'banks' : 'companies'}. Please try again.`);
      setCompanies([]);
      setCompaniesData([]);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch and when filters change
  useEffect(() => {
    if (industry) {
      fetchCompanies(searchCompanyQuery, companyTypeFilter, statusFilter);
    } else {
      setCompanies([]);
      setCompaniesData([]);
      setLoading(false);
    }
  }, [industry, companyTypeFilter, statusFilter]);

  // Debounced search
  useEffect(() => {
    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Set new timeout for debounced search
    searchTimeoutRef.current = setTimeout(() => {
      if (industry) {
        fetchCompanies(searchCompanyQuery, companyTypeFilter, statusFilter);
      }
    }, 500); // 500ms debounce

    // Cleanup
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchCompanyQuery]);

  // Clear all filters
  const clearFilters = () => {
    setSearchCompanyQuery('');
    setCompanyTypeFilter('');
    setStatusFilter('');
  };

  // Check if any filters are active
  const hasActiveFilters = searchCompanyQuery.trim() || companyTypeFilter || statusFilter;

  // Ensure companies array only contains strings - cleanup effect
  useEffect(() => {
    if (companies && companies.length > 0) {
      const hasObjects = companies.some(c => typeof c !== 'string' && c !== null && c !== undefined);
      if (hasObjects) {
        console.warn('Companies array contains non-string values, cleaning up...');
        const cleaned = companies
          .map(c => {
            if (typeof c === 'string') return c;
            if (c && typeof c === 'object') {
              return c?.name || c?.short_name || `Company ${c?.id || 'Unknown'}`;
            }
            return String(c || 'Unknown');
          })
          .filter(c => typeof c === 'string');
        setCompanies(cleaned);
      }
    }
  }, [companies]);

  // Split companies into two columns (no need for client-side filtering since we do it server-side)
  // Ensure all items are strings before splitting - defensive programming
  const companiesStrings = (companies || [])
    .map(c => {
      if (typeof c === 'string') return c;
      if (c && typeof c === 'object') {
        return c?.name || c?.short_name || `Company ${c?.id || 'Unknown'}`;
      }
      return String(c || 'Unknown');
    })
    .filter(c => typeof c === 'string'); // Only keep strings
    
  const leftColumn = companiesStrings.slice(0, Math.ceil(companiesStrings.length / 2));
  const rightColumn = companiesStrings.slice(Math.ceil(companiesStrings.length / 2));

  // If add company form is shown
  if (showAddCompanyForm) {
    return <AddCompanyForm onBack={() => setShowAddCompanyForm(false)} userInfo={userInfo} onNavigate={onNavigate} onLogout={onLogout} industry={industry} />;
  }

  // If a company is selected, show company details or bank details
  if (selectedCompany) {
    // Use BankDetails for Banking & Finance, CompanyDetails for others
    if (isBankingFinance) {
      return (
        <BankDetails
          bank={selectedCompany}
          industry={industry}
          onBack={() => setSelectedCompany(null)}
          userInfo={userInfo}
          onNavigate={onNavigate}
          onLogout={onLogout}
        />
      );
    }
    return (
      <CompanyDetails
        company={selectedCompany}
        industry={industry}
        onBack={() => setSelectedCompany(null)}
        userInfo={userInfo}
        onNavigate={onNavigate}
        onLogout={onLogout}
      />
    );
  }

  return (
    <div className="bg-[#F7F8FA] min-h-screen">
      {/* Full Width Header */}
      <AdminHeader userInfo={userInfo} onNavigate={onNavigate} onLogout={onLogout} />

      {/* Main Content */}
      <div className="px-6">
        <div className="flex flex-col bg-white pt-4 pb-[31px] px-3.5 gap-10 rounded-lg">
          <div className="flex flex-col items-start self-stretch gap-4">
            {/* Breadcrumb */}
            <div className="flex items-start">
              <span className="text-[#525866] text-xs mr-1.5">COMPANIES</span>
              <ChevronRight className="w-4 h-4 text-[#525866] mr-1 flex-shrink-0" />
              <span className="text-[#525866] text-xs">{industry.name.toUpperCase()}</span>
            </div>

            {/* Header Section */}
            <div className="flex justify-between items-start self-stretch">
              <div className="flex flex-col items-start w-[290px] gap-2">
                <div className="flex items-center gap-2">
                  <button onClick={onBack} className="cursor-pointer hover:opacity-70">
                    <ArrowLeft className="w-4 h-4 text-[#040E1B]" />
                  </button>
                  <div className="flex items-center w-[122px] gap-1">
                    <Building2 className="w-4 h-4 text-[#040E1B]" />
                    <span className="text-[#040E1B] text-xl font-bold">Banks</span>
                  </div>
                </div>
                <span className="text-[#070810] text-sm">
                  {isBankingFinance 
                    ? 'Browse through all banks in our database'
                    : 'Search through all the companies in our database'}
                </span>
              </div>

              {/* Add New Companies Button - Hidden for Banking & Finance */}
              {!isBankingFinance && (
              <button 
                onClick={() => setShowAddCompanyForm(true)}
                className="flex flex-col items-center w-[270px] py-3 rounded-lg border-4 border-solid border-[#0F284726] hover:opacity-90 transition-opacity"
                style={{background: 'linear-gradient(180deg, #022658, #1A4983)'}}
              >
                <span className="text-white text-base font-bold">Add New Companies</span>
              </button>
              )}
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col gap-3 self-stretch">
              <div className="flex justify-between items-center self-stretch gap-3">
                <div className="flex items-center flex-1 py-3.5 pl-2 gap-2.5 rounded-lg border border-solid border-[#D4E1EA]" style={{boxShadow: '4px 4px 4px #0708101A'}}>
                  <Search className="w-3 h-3 text-[#868C98]" />
                  <input
                    type="text"
                    placeholder={isBankingFinance ? "Search banks by name..." : "Search by name, registration number, or industry..."}
                    value={searchCompanyQuery}
                    onChange={(e) => setSearchCompanyQuery(e.target.value)}
                    className="flex-1 text-[#525866] bg-transparent text-xs border-0 outline-none"
                  />
                  {searchCompanyQuery && (
                    <button
                      onClick={() => setSearchCompanyQuery('')}
                      className="p-1 hover:bg-gray-100 rounded"
                    >
                      <X className="w-3 h-3 text-gray-400" />
                    </button>
                  )}
                </div>
                
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`flex items-center gap-2 px-4 py-3.5 rounded-lg border border-solid border-[#D4E1EA] transition-colors ${
                    showFilters || hasActiveFilters 
                      ? 'bg-[#022658] text-white border-[#022658]' 
                      : 'bg-white text-[#525866]'
                  }`}
                  style={{boxShadow: '4px 4px 4px #0708101A'}}
                >
                  <Filter className="w-4 h-4" />
                  <span className="text-xs font-medium">Filters</span>
                  {hasActiveFilters && (
                    <span className="ml-1 px-1.5 py-0.5 bg-white text-[#022658] text-xs rounded-full">
                      {[searchCompanyQuery && '1', companyTypeFilter && '1', statusFilter && '1'].filter(Boolean).length}
                    </span>
                  )}
                </button>
              </div>

              {/* Filter Panel */}
              {showFilters && (
                <div className="flex items-center gap-3 p-3 bg-[#F7F8FA] rounded-lg border border-solid border-[#D4E1EA]">
                  {isBankingFinance ? (
                    <>
                      <div className="flex items-center gap-2">
                        <label className="text-xs text-[#525866] font-medium whitespace-nowrap">Bank Type:</label>
                        <select
                          value={companyTypeFilter}
                          onChange={(e) => setCompanyTypeFilter(e.target.value)}
                          className="px-3 py-2 text-xs text-[#525866] bg-white border border-solid border-[#D4E1EA] rounded-lg outline-none focus:border-[#022658]"
                        >
                          <option value="">All Types</option>
                          <option value="Commercial">Commercial</option>
                          <option value="Development">Development</option>
                          <option value="Merchant">Merchant</option>
                          <option value="Rural">Rural</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                    </>
                  ) : (
                    <>
                  <div className="flex items-center gap-2">
                    <label className="text-xs text-[#525866] font-medium whitespace-nowrap">Company Type:</label>
                    <select
                      value={companyTypeFilter}
                      onChange={(e) => setCompanyTypeFilter(e.target.value)}
                      className="px-3 py-2 text-xs text-[#525866] bg-white border border-solid border-[#D4E1EA] rounded-lg outline-none focus:border-[#022658]"
                    >
                      <option value="">All Types</option>
                      <option value="Limited">Limited Company</option>
                      <option value="Public">Public Company</option>
                      <option value="Private">Private Company</option>
                      <option value="Partnership">Partnership</option>
                      <option value="Sole Proprietorship">Sole Proprietorship</option>
                      <option value="NGO">NGO</option>
                    </select>
                  </div>
                    </>
                  )}

                  <div className="flex items-center gap-2">
                    <label className="text-xs text-[#525866] font-medium whitespace-nowrap">Status:</label>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="px-3 py-2 text-xs text-[#525866] bg-white border border-solid border-[#D4E1EA] rounded-lg outline-none focus:border-[#022658]"
                    >
                      <option value="">All Status</option>
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>

                  {hasActiveFilters && (
                    <button
                      onClick={clearFilters}
                      className="ml-auto flex items-center gap-1 px-3 py-2 text-xs text-[#525866] bg-white border border-solid border-[#D4E1EA] rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <X className="w-3 h-3" />
                      Clear All
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Companies/Banks List - Two Columns */}
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <span className="text-[#525866] text-sm">Loading {isBankingFinance ? 'banks' : 'companies'}...</span>
            </div>
          ) : error ? (
            <div className="flex justify-center items-center py-12">
              <span className="text-red-500 text-sm">{error}</span>
            </div>
          ) : !companies || companies.length === 0 ? (
            <div className="flex justify-center items-center py-12">
              <span className="text-[#525866] text-sm">
                {hasActiveFilters 
                  ? `No ${isBankingFinance ? 'banks' : 'companies'} found matching your filters.` 
                  : `No ${isBankingFinance ? 'banks' : 'companies'} found for this industry.`}
              </span>
            </div>
          ) : (
            <div className="flex items-start self-stretch gap-6 w-full">
              {/* Left Column */}
              <div className="flex flex-col flex-1 gap-3 min-w-0">
              {leftColumn.map((companyName, idx) => {
                // Ensure companyName is a string
                const nameStr = typeof companyName === 'string' ? companyName : (companyName?.name || companyName?.short_name || 'Unknown');
                // Find the matching company object
                const companyObj = companiesData.find(c => {
                  const cName = c?.name || c?.short_name;
                  return cName === nameStr;
                });
                
                // Get logo for banks
                const logo = isBankingFinance && companyObj 
                  ? getBankLogo(companyObj.name || nameStr, companyObj.logo_url) 
                  : null;
                
                return (
                  <button
                    key={idx}
                    onClick={() => setSelectedCompany(companyObj || companiesData[idx])}
                    className="flex justify-between items-center self-stretch bg-white pr-4 rounded-lg hover:bg-blue-50 transition-colors cursor-pointer"
                    style={{boxShadow: '0px 2px 20px #0000000D'}}
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      {isBankingFinance && (
                        <img
                          src={logo || '/companies/default-company.svg'}
                          alt={nameStr}
                          className="w-10 h-10 rounded-lg object-contain flex-shrink-0 bg-white border border-[#D4E1EA]"
                          onError={(e) => {
                            if (e.target.src !== '/companies/default-company.svg') {
                              e.target.src = '/companies/default-company.svg';
                            }
                          }}
                        />
                      )}
                    <span className="flex-1 text-[#040E1B] bg-transparent text-lg py-[15px] pl-4 text-left truncate">
                      {nameStr}
                    </span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  </button>
                );
              })}
              </div>

              {/* Right Column */}
              <div className="flex flex-col flex-1 gap-3 min-w-0">
              {rightColumn.map((companyName, idx) => {
                // Ensure companyName is a string
                const nameStr = typeof companyName === 'string' ? companyName : (companyName?.name || companyName?.short_name || 'Unknown');
                // Find the matching company object - adjust index for right column
                const actualIdx = leftColumn.length + idx;
                const companyObj = companiesData.find(c => {
                  const cName = c?.name || c?.short_name;
                  return cName === nameStr;
                });
                
                // Get logo for banks
                const logo = isBankingFinance && companyObj 
                  ? getBankLogo(companyObj.name || nameStr, companyObj.logo_url) 
                  : null;
                
                return (
                  <button
                    key={idx}
                    onClick={() => setSelectedCompany(companyObj || companiesData[actualIdx])}
                    className="flex justify-between items-center self-stretch bg-white pr-4 rounded-lg hover:bg-blue-50 transition-colors cursor-pointer"
                    style={{boxShadow: '0px 2px 20px #0000000D'}}
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      {isBankingFinance && (
                        <img
                          src={logo || '/companies/default-company.svg'}
                          alt={nameStr}
                          className="w-10 h-10 rounded-lg object-contain flex-shrink-0 bg-white border border-[#D4E1EA]"
                          onError={(e) => {
                            if (e.target.src !== '/companies/default-company.svg') {
                              e.target.src = '/companies/default-company.svg';
                            }
                          }}
                        />
                      )}
                    <span className="flex-1 text-[#040E1B] bg-transparent text-lg py-[15px] pl-4 text-left truncate">
                      {nameStr}
                    </span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  </button>
                );
              })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CompaniesListView;

