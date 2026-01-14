import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Bell, ChevronRight, ChevronLeft, Search, Building2, Filter, X } from 'lucide-react';
import CorporateClientCompanyDetails from './CorporateClientCompanyDetails';

const CorporateClientCompaniesListView = ({ userInfo, industry, onBack }) => {
  const [searchCompanyQuery, setSearchCompanyQuery] = useState('');
  const [companies, setCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCompanies, setTotalCompanies] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [filterBankType, setFilterBankType] = useState('');
  const [filterRegion, setFilterRegion] = useState('');
  const [filterOwnership, setFilterOwnership] = useState('');
  const [filterDenomination, setFilterDenomination] = useState('');
  const observerTarget = useRef(null);
  const itemsPerPage = 50; // Increased for banks
  const isBankingFinance = industry?.id === 'banking' || industry?.name?.toLowerCase() === 'banking & finance' || industry?.name?.toLowerCase() === 'banking and finance';
  const isChurches = industry?.id === 'churches' || industry?.name?.toLowerCase() === 'churches';
  
  // Debug logging
  useEffect(() => {
    console.log('Industry object:', industry);
    console.log('isChurches:', isChurches);
    console.log('isBankingFinance:', isBankingFinance);
  }, [industry, isChurches, isBankingFinance]);

  // Map industry name/id to API industry filter
  const getIndustryFilter = () => {
    if (!industry) return null;
    const industryMap = {
      'banking': 'Banking & Finance',
      'Banking & Finance': 'Banking & Finance',
      'healthcare': 'Healthcare',
      'energy': 'Energy',
      'technology': 'Technology',
      'telecommunications': 'Telecommunications',
      'real-estate': 'Real Estate',
      'manufacturing': 'Manufacturing',
      'retail': 'Retail',
      'transportation': 'Transportation',
      'media': 'Media',
      'education': 'Education'
    };
    return industryMap[industry.id] || industryMap[industry.name] || industry.name || industry.id;
  };

  // Bank logo mapping - maps bank names to actual logo files (case-insensitive matching)
  const bankLogoMap = {
    // Major banks with various name formats
    'GCB BANK': '/banks/GCB_BANK_PLC.png',
    'GCB BANK PLC': '/banks/GCB_BANK_PLC.png',
    'GHANA COMMERCIAL BANK': '/banks/GCB_BANK_PLC.png',
    'ECOBANK': '/banks/ECOBANK_GHANA_PLC.png',
    'ECOBANK GHANA': '/banks/ECOBANK_GHANA_PLC.png',
    'ECOBANK GHANA PLC': '/banks/ECOBANK_GHANA_PLC.png',
    'STANDARD CHARTERED': '/banks/STANDARD_CHARTERED_BANK_GHANA.png',
    'STANDARD CHARTERED BANK': '/banks/STANDARD_CHARTERED_BANK_GHANA.png',
    'STANDARD CHARTERED BANK GHANA': '/banks/STANDARD_CHARTERED_BANK_GHANA.png',
    'ABSA': '/banks/ABSA_BANK_GHANA_LTD.png',
    'ABSA BANK': '/banks/ABSA_BANK_GHANA_LTD.png',
    'ABSA BANK GHANA': '/banks/ABSA_BANK_GHANA_LTD.png',
    'ABSA BANK GHANA LTD': '/banks/ABSA_BANK_GHANA_LTD.png',
    'FIDELITY': '/banks/FIDELITY_BANK_GHANA_LTD.png',
    'FIDELITY BANK': '/banks/FIDELITY_BANK_GHANA_LTD.png',
    'FIDELITY BANK GHANA': '/banks/FIDELITY_BANK_GHANA_LTD.png',
    'FIDELITY BANK GHANA LTD': '/banks/FIDELITY_BANK_GHANA_LTD.png',
    'ZENITH': '/banks/ZENITH_BANK_GHANA_LTD.png',
    'ZENITH BANK': '/banks/ZENITH_BANK_GHANA_LTD.png',
    'ZENITH BANK GHANA': '/banks/ZENITH_BANK_GHANA_LTD.png',
    'ZENITH BANK GHANA LTD': '/banks/ZENITH_BANK_GHANA_LTD.png',
    'FIRST ATLANTIC': '/banks/FIRST_ATLANTIC_BANK_LTD.png',
    'FIRST ATLANTIC BANK': '/banks/FIRST_ATLANTIC_BANK_LTD.png',
    'FIRST ATLANTIC BANK LTD': '/banks/FIRST_ATLANTIC_BANK_LTD.png',
    'GTB': '/banks/GUARANTY_TRUST_BANK_GHANA_LTD.png',
    'GTBANK': '/banks/GUARANTY_TRUST_BANK_GHANA_LTD.png',
    'GUARANTY TRUST BANK': '/banks/GUARANTY_TRUST_BANK_GHANA_LTD.png',
    'GUARANTY TRUST BANK GHANA': '/banks/GUARANTY_TRUST_BANK_GHANA_LTD.png',
    'NIB': '/banks/NATIONAL_INVESTMENT_BANK_PLC.png',
    'NATIONAL INVESTMENT BANK': '/banks/NATIONAL_INVESTMENT_BANK_PLC.png',
    'NATIONAL INVESTMENT BANK PLC': '/banks/NATIONAL_INVESTMENT_BANK_PLC.png',
    'PRUDENTIAL': '/banks/PRUDENTIAL_BANK_LTD.png',
    'PRUDENTIAL BANK': '/banks/PRUDENTIAL_BANK_LTD.png',
    'REPUBLIC BANK': '/banks/REPUBLIC_BANK_GHANA_PLC.png',
    'REPUBLIC BANK GHANA': '/banks/REPUBLIC_BANK_GHANA_PLC.png',
    'SOCIETE GENERALE': '/banks/SOCIETE_GENERALE_GHANA_PLC.png',
    'SOCIETE GENERALE GHANA': '/banks/SOCIETE_GENERALE_GHANA_PLC.png',
    'UMB': '/banks/UNIVERSAL_MERCHANT_BANK_LTD.png',
    'UNIVERSAL MERCHANT BANK': '/banks/UNIVERSAL_MERCHANT_BANK_LTD.png',
    'UNIVERSAL MERCHANT BANK LTD': '/banks/UNIVERSAL_MERCHANT_BANK_LTD.png',
    'FIRST BANK': '/banks/FIRST_BANK_GHANA_LTD.png',
    'FIRST BANK GHANA': '/banks/FIRST_BANK_GHANA_LTD.png',
    'FIRST NATIONAL BANK': '/banks/FIRST_NATIONAL_BANK_GHANA_LTD.png',
    'ACCESS BANK': '/banks/ACCESS_BANK_GHANA_PLC.png',
    'ACCESS BANK GHANA': '/banks/ACCESS_BANK_GHANA_PLC.png',
    'ACCESS BANK GHANA PLC': '/banks/ACCESS_BANK_GHANA_PLC.png',
    'ADB': '/banks/AGRICULTURAL_DEVELOPMENT_BANK.png',
    'AGRICULTURAL DEVELOPMENT BANK': '/banks/AGRICULTURAL_DEVELOPMENT_BANK.png',
    'AGRICULTURAL DEVELOPMENT BANK PLC': '/banks/AGRICULTURAL_DEVELOPMENT_BANK.png',
    'BANK OF AFRICA': '/banks/BANK_OF_AFRICA_GHANA_LTD.png',
    'BANK OF GHANA': '/banks/Bank of ghana.jpeg',
    'CAL BANK': '/banks/CalBank_PLC.png',
    'CALBANK': '/banks/CalBank_PLC.png',
    'CBG': '/banks/CONSOLIDATED_BANK_GHANA_LTD.png',
    'CONSOLIDATED BANK': '/banks/CONSOLIDATED_BANK_GHANA_LTD.png',
    'CONSOLIDATED BANK GHANA': '/banks/CONSOLIDATED_BANK_GHANA_LTD.png',
    'OMNIBSIC': '/banks/OMNIBSIC_BANK_GHANA_LTD.png',
    'OMNIBSIC BANK': '/banks/OMNIBSIC_BANK_GHANA_LTD.png',
    'STANBIC': '/banks/STANBIC_BANK_GHANA_LTD.png',
    'STANBIC BANK': '/banks/STANBIC_BANK_GHANA_LTD.png',
    'STANBIC BANK GHANA': '/banks/STANBIC_BANK_GHANA_LTD.png',
    'UBA': '/banks/UNITED_BANK_FOR_AFRICA_GHANA_LTD.png',
    'UNITED BANK FOR AFRICA': '/banks/UNITED_BANK_FOR_AFRICA_GHANA_LTD.png',
    'UNITED BANK FOR AFRICA GHANA': '/banks/UNITED_BANK_FOR_AFRICA_GHANA_LTD.png',
    'ARB APEX': '/banks/ARB_APEX_BANK_LTD.png',
    'ARB APEX BANK': '/banks/ARB_APEX_BANK_LTD.png',
    'AMALGAMATED BANK': '/banks/AMALGAMATED_BANK_GHANA_LTD.png',
    'AMALGAMATED BANK GHANA': '/banks/AMALGAMATED_BANK_GHANA_LTD.png',
  };

  const getBankLogo = (bankName, logoUrl) => {
    // First, use logo_url from database if available
    if (logoUrl) {
      return logoUrl;
    }
    
    if (!bankName) return '/companies/default-company.svg';
    
    // Normalize bank name to uppercase for matching
    const nameUpper = bankName.toUpperCase().trim();
    
    // Try exact match first (case-insensitive)
    const exactMatch = Object.keys(bankLogoMap).find(
      key => key === nameUpper
    );
    if (exactMatch) {
      return bankLogoMap[exactMatch];
    }
    
    // Try partial match - check if any key is contained in the bank name or vice versa
    const partialMatch = Object.keys(bankLogoMap).find(key => {
      const keyUpper = key.toUpperCase();
      // Check if bank name contains the key words or key contains bank name words
      return nameUpper.includes(keyUpper) || keyUpper.includes(nameUpper) ||
             nameUpper.split(/\s+/).some(word => word.length > 3 && keyUpper.includes(word)) ||
             keyUpper.split(/\s+/).some(word => word.length > 3 && nameUpper.includes(word));
    });
    
    if (partialMatch) {
      return bankLogoMap[partialMatch];
    }
    
    // Try to match by extracting key words (e.g., "ACCESS", "ATLANTIC", "ZENITH")
    const keyWords = nameUpper.split(/[\s()]+/).filter(w => 
      w.length > 3 && 
      !['LTD', 'LIMITED', 'PLC', 'BANK', 'GHANA', 'GH', 'THE', 'OF', 'AND', 'FOR'].includes(w)
    );
    
    const wordMatch = Object.keys(bankLogoMap).find(key => {
      const keyUpper = key.toUpperCase();
      // Match if at least one key word appears in the mapping key
      return keyWords.some(word => keyUpper.includes(word));
    });
    
    if (wordMatch) {
      return bankLogoMap[wordMatch];
    }
    
    // Return default logo (will always show a logo placeholder)
    return '/companies/default-company.svg';
  };

  const fetchCompanies = useCallback(async (page = 1, reset = false) => {
    try {
      if (page === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      let response;
      let data;

      if (isBankingFinance) {
        // Fetch banks
        const params = new URLSearchParams({
          page: page.toString(),
          limit: itemsPerPage.toString(),
          sort_by: 'name',
          sort_order: 'asc' // Alphabetical order
        });

        if (searchCompanyQuery.trim()) {
          params.append('query', searchCompanyQuery.trim());
        }

        if (filterBankType) {
          params.append('bank_type', filterBankType);
        }

        if (filterRegion) {
          params.append('region', filterRegion);
        }

        if (filterOwnership) {
          params.append('ownership_type', filterOwnership);
        }

        response = await fetch(`/api/banks/search?${params.toString()}`, {
          headers: { 'Content-Type': 'application/json' }
        });

        if (response.ok) {
          data = await response.json();
          const newBanks = (data.banks || []).map(bank => ({
            ...bank,
            name: bank.name,
            logo: getBankLogo(bank.name, bank.logo_url)
          }));

          if (reset) {
            setCompanies(newBanks);
          } else {
            setCompanies(prev => [...prev, ...newBanks]);
          }

          setTotalCompanies(data.total || 0);
          setHasMore(data.has_next || false);
          setCurrentPage(page);
        } else {
          console.error('Failed to fetch banks');
          setHasMore(false);
        }
      } else if (isChurches) {
        // Fetch marriage venues (churches)
        console.log('Fetching marriage venues for churches...');
        const params = new URLSearchParams({
          page: page.toString(),
          limit: itemsPerPage.toString(),
          sort_by: 'name_of_licensed_place',
          sort_order: 'asc' // Alphabetical order
        });

        if (searchCompanyQuery.trim()) {
          params.append('query', searchCompanyQuery.trim());
        }

        if (filterRegion) {
          params.append('region', filterRegion);
        }

        if (filterDenomination) {
          params.append('denomination', filterDenomination);
        }

        const apiUrl = `/api/marriage-venues/search?${params.toString()}`;
        console.log('Fetching from:', apiUrl);
        
        try {
          response = await fetch(apiUrl, {
            headers: { 'Content-Type': 'application/json' }
          });

          if (response.ok) {
            data = await response.json();
            console.log('Marriage venues API response:', data);
            const newVenues = (data.venues || []).map(venue => ({
              ...venue,
              id: venue.id,
              name: venue.name_of_licensed_place || 'Unnamed Venue',
              logo: '/category-icons/churches.png', // Default church icon
              denomination: venue.denomination,
              region: venue.branch_location_address_region,
              gazette_number: venue.gazette_number,
              date_of_license: venue.date_of_license
            }));
            console.log('Mapped venues:', newVenues);
            console.log('Total venues:', newVenues.length);

            if (reset) {
              setCompanies(newVenues);
            } else {
              setCompanies(prev => [...prev, ...newVenues]);
            }

            setTotalCompanies(data.total || 0);
            setHasMore(data.has_next || false);
            setCurrentPage(page);
          } else {
            const errorText = await response.text();
            console.error('Failed to fetch marriage venues:', response.status, errorText);
            if (reset) {
              setCompanies([]);
            }
            setHasMore(false);
            setTotalCompanies(0);
          }
        } catch (fetchError) {
          console.error('Error fetching marriage venues:', fetchError);
          if (reset) {
            setCompanies([]);
          }
          setHasMore(false);
          setTotalCompanies(0);
        }
      } else {
        // Fetch companies (original logic)
      const industryFilter = getIndustryFilter();
      const params = new URLSearchParams({
        page: page.toString(),
        limit: itemsPerPage.toString()
      });

      if (industryFilter) {
        params.append('industry', industryFilter);
      }

      if (searchCompanyQuery.trim()) {
        params.append('query', searchCompanyQuery.trim());
      }

        response = await fetch(`/api/companies/search?${params.toString()}`, {
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.ok) {
          data = await response.json();
        const newCompanies = data.results || [];

        if (reset) {
          setCompanies(newCompanies);
        } else {
          setCompanies(prev => [...prev, ...newCompanies]);
        }

        setTotalCompanies(data.total || 0);
        setHasMore(data.has_next || false);
        setCurrentPage(page);
      } else {
        console.error('Failed to fetch companies');
        setHasMore(false);
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setHasMore(false);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [industry, searchCompanyQuery, itemsPerPage, isBankingFinance, isChurches, filterBankType, filterRegion, filterOwnership, filterDenomination]);

  // Initial load and when industry changes
  useEffect(() => {
    setCompanies([]);
    setCurrentPage(1);
    setHasMore(true);
    fetchCompanies(1, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [industry?.id, industry?.name]);

  // Debounced search and filter changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setCompanies([]);
      setCurrentPage(1);
      setHasMore(true);
      fetchCompanies(1, true);
    }, 500);

    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchCompanyQuery, filterBankType, filterRegion, filterOwnership, filterDenomination]);

  // Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore && !loadingMore && !loading) {
          fetchCompanies(currentPage + 1, false);
        }
      },
      { threshold: 0.1 }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasMore, loadingMore, loading, currentPage]);

  // Sort companies alphabetically by name (for banks, already sorted by API, but double-check)
  const sortedCompanies = [...companies].sort((a, b) => {
    const nameA = (a.name || '').toLowerCase();
    const nameB = (b.name || '').toLowerCase();
    return nameA.localeCompare(nameB);
  });

  // Split companies into two columns
  const leftColumn = sortedCompanies.slice(0, Math.ceil(sortedCompanies.length / 2));
  const rightColumn = sortedCompanies.slice(Math.ceil(sortedCompanies.length / 2));

  const userName = userInfo?.first_name && userInfo?.last_name 
    ? `${userInfo.first_name} ${userInfo.last_name}` 
    : 'Tonia Martins';
  const organizationName = userInfo?.organization || 'Access Bank';

  // If a company is selected, show company details
  if (selectedCompany) {
    return (
      <CorporateClientCompanyDetails
        company={selectedCompany}
        industry={industry}
        onBack={() => setSelectedCompany(null)}
        userInfo={userInfo}
      />
    );
  }

  return (
    <div className="bg-[#F7F8FA] min-h-screen">
      {/* Full Width Header */}
      <div className="w-full bg-white py-3.5 px-6 mb-4">
        <div className="flex justify-between items-center">
          <div className="flex flex-col items-start gap-1">
            <span className="text-[#050F1C] text-xl font-medium">
              {organizationName},
            </span>
            <span className="text-[#050F1C] text-base font-normal opacity-75">
              Track all your activities here.
            </span>
          </div>
          <div className="flex items-start flex-1 gap-4 justify-end">
            {/* Notification and User Profile */}
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#F7F8FA] rounded-full border border-[#D4E1EA]">
                <Bell className="w-5 h-5 text-[#022658]" />
              </div>
              <div className="flex items-center gap-1.5">
                <img
                  src={userInfo?.profile_picture || '/images/image.png'}
                  alt="User"
                  className="w-9 h-9 rounded-full object-cover"
                  onError={(e) => {
                    e.target.src = '/images/image.png';
                  }}
                />
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-0.5">
                    <span className="text-[#050F1C] text-base font-bold whitespace-nowrap">
                      {userName}
                    </span>
                    <ChevronRight className="w-3 h-3 text-[#141B34] rotate-90" />
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-[#10B981] rounded-full"></div>
                    <span className="text-[#525866] text-xs">Online</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-6">
        <div className="flex flex-col bg-white pt-4 pb-[31px] px-4 gap-6 rounded-lg">
          {/* Breadcrumb */}
          <div className="flex items-center gap-1">
            <span className="text-[#525866] text-xs opacity-75">COMPANIES</span>
            <ChevronRight className="w-4 h-4 text-[#7B8794]" />
            <span className="text-[#050F1C] text-xs opacity-75">{industry?.name?.toUpperCase() || 'ENERGY'}</span>
          </div>

          {/* Header Section */}
          <div className="flex justify-between items-start self-stretch">
            <div className="flex flex-col items-start gap-2">
              <div className="flex items-center gap-2">
                <button 
                  onClick={onBack} 
                  className="p-2 bg-[#F7F8FA] rounded-lg hover:opacity-70 transition-opacity"
                >
                  <ChevronLeft className="w-6 h-6 text-[#050F1C]" />
                </button>
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-[#050F1C]" />
                  <span className="text-[#050F1C] text-xl font-semibold" style={{ fontFamily: 'Roboto' }}>
                    Companies
                  </span>
                </div>
              </div>
              <span className="text-[#070810] text-sm font-normal opacity-75" style={{ fontFamily: 'Roboto' }}>
                {isBankingFinance 
                  ? 'Browse through all banks in our database' 
                  : isChurches
                  ? 'Browse through all churches and marriage venues in our database'
                  : 'Search through all the companies in our database'}
              </span>
            </div>

            {/* Add New Companies Button - Hidden for Banking & Finance and Churches */}
            {!isBankingFinance && !isChurches && (
            <button 
              className="w-[270px] py-3 rounded-lg hover:opacity-90 transition-opacity"
              style={{
                background: 'linear-gradient(180deg, #022658 43%, #1A4983 100%)',
                boxShadow: '0px 4px 4px rgba(5, 15, 28, 0.10)',
                outline: '4px solid rgba(15, 40, 71, 0.15)'
              }}
            >
              <span className="text-white text-base font-bold">Add New Companies</span>
            </button>
            )}
          </div>

          {/* Search and Filters */}
          <div className="flex justify-between items-center self-stretch gap-4">
            <div className="flex items-center w-[554px] py-3.5 pl-2 gap-2.5 rounded-lg border border-solid border-[#D4E1EA]" style={{boxShadow: '4px 4px 4px #0708101A'}}>
              <Search className="w-3 h-3 text-[#868C98]" />
              <input
                type="text"
                placeholder={isBankingFinance ? "Search banks here..." : isChurches ? "Search churches and venues here..." : "Search Companies here"}
                value={searchCompanyQuery}
                onChange={(e) => setSearchCompanyQuery(e.target.value)}
                className="flex-1 text-[#525866] bg-transparent text-xs border-0 outline-none"
              />
            </div>

            {/* Filter Button for Banks and Churches */}
            {(isBankingFinance || isChurches) && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`flex items-center gap-2 px-4 py-3.5 rounded-lg border border-solid transition-colors ${
                    showFilters || filterBankType || filterRegion || filterOwnership || filterDenomination
                      ? 'bg-[#022658] text-white border-[#022658]'
                      : 'bg-white text-[#525866] border-[#D4E1EA]'
                  }`}
                  style={{boxShadow: '4px 4px 4px #0708101A'}}
                >
                  <Filter className="w-4 h-4" />
                  <span className="text-xs font-medium">Filters</span>
                  {(filterBankType || filterRegion || filterOwnership || filterDenomination) && (
                    <span className="bg-white text-[#022658] rounded-full px-2 py-0.5 text-xs font-bold">
                      {[filterBankType, filterRegion, filterOwnership, filterDenomination].filter(Boolean).length}
                    </span>
                  )}
                </button>

                {/* Clear Filters */}
                {(filterBankType || filterRegion || filterOwnership || filterDenomination) && (
                  <button
                    onClick={() => {
                      setFilterBankType('');
                      setFilterRegion('');
                      setFilterOwnership('');
                      setFilterDenomination('');
                    }}
                    className="flex items-center gap-1 px-3 py-3.5 rounded-lg border border-solid border-[#D4E1EA] bg-white text-[#525866] hover:bg-[#F7F8FA] transition-colors"
                  >
                    <X className="w-4 h-4" />
                    <span className="text-xs">Clear</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Filter Options Panel for Banks and Churches */}
          {(isBankingFinance || isChurches) && showFilters && (
            <div className="flex flex-wrap items-center gap-4 p-4 bg-[#F7F8FA] rounded-lg border border-solid border-[#D4E1EA]">
              {isBankingFinance && (
                <>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-[#525866] font-medium">Bank Type</label>
                    <select
                      value={filterBankType}
                      onChange={(e) => setFilterBankType(e.target.value)}
                      className="px-3 py-2 text-xs border border-solid border-[#D4E1EA] rounded-lg bg-white text-[#050F1C] focus:outline-none focus:border-[#022658]"
                    >
                      <option value="">All Types</option>
                      <option value="Commercial">Commercial</option>
                      <option value="Development">Development</option>
                      <option value="Merchant">Merchant</option>
                      <option value="Rural">Rural</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-[#525866] font-medium">Ownership</label>
                    <select
                      value={filterOwnership}
                      onChange={(e) => setFilterOwnership(e.target.value)}
                      className="px-3 py-2 text-xs border border-solid border-[#D4E1EA] rounded-lg bg-white text-[#050F1C] focus:outline-none focus:border-[#022658]"
                    >
                      <option value="">All Ownership</option>
                      <option value="Local">Local</option>
                      <option value="Foreign">Foreign</option>
                      <option value="Mixed">Mixed</option>
                    </select>
                  </div>
                </>
              )}

              {isChurches && (
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-[#525866] font-medium">Denomination</label>
                  <input
                    type="text"
                    value={filterDenomination}
                    onChange={(e) => setFilterDenomination(e.target.value)}
                    placeholder="Filter by denomination..."
                    className="px-3 py-2 text-xs border border-solid border-[#D4E1EA] rounded-lg bg-white text-[#050F1C] focus:outline-none focus:border-[#022658]"
                  />
                </div>
              )}

              <div className="flex flex-col gap-1">
                <label className="text-xs text-[#525866] font-medium">Region</label>
                <select
                  value={filterRegion}
                  onChange={(e) => setFilterRegion(e.target.value)}
                  className="px-3 py-2 text-xs border border-solid border-[#D4E1EA] rounded-lg bg-white text-[#050F1C] focus:outline-none focus:border-[#022658]"
                >
                  <option value="">All Regions</option>
                  <option value="Greater Accra">Greater Accra</option>
                  <option value="Ashanti">Ashanti</option>
                  <option value="Western">Western</option>
                  <option value="Eastern">Eastern</option>
                  <option value="Central">Central</option>
                  <option value="Northern">Northern</option>
                  <option value="Volta">Volta</option>
                  <option value="Upper East">Upper East</option>
                  <option value="Upper West">Upper West</option>
                  <option value="Brong Ahafo">Brong Ahafo</option>
                </select>
              </div>
            </div>
          )}

          {/* Companies/Banks List - Two Columns */}
          {loading && sortedCompanies.length === 0 ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#022658]"></div>
              <span className="ml-3 text-[#525866] text-sm">{isBankingFinance ? 'Loading banks...' : isChurches ? 'Loading churches...' : 'Loading companies...'}</span>
            </div>
          ) : sortedCompanies.length === 0 ? (
            <div className="flex justify-center items-center py-12">
              <span className="text-[#525866] text-sm">{isBankingFinance ? 'No banks found' : isChurches ? 'No churches found' : 'No companies found'}</span>
            </div>
          ) : (
            <>
          <div className="flex items-start self-stretch gap-6 w-full">
            {/* Left Column */}
            <div className="flex flex-col flex-1 gap-3 min-w-0">
                  {leftColumn.map((company, idx) => {
                    const companyName = typeof company === 'string' ? company : (company.name || company.short_name || 'Unknown');
                    const companyId = company.id || idx;
                    const companyLogo = isBankingFinance ? (company.logo || getBankLogo(companyName, company.logo_url)) : isChurches ? '/category-icons/churches.png' : null;
                    return (
                <button
                        key={`left-${companyId}-${idx}`}
                  onClick={() => setSelectedCompany(company)}
                  className="flex justify-between items-center self-stretch bg-white h-[58px] px-4 rounded-lg hover:bg-blue-50 transition-colors cursor-pointer border-l-2 border-[#3B82F6]"
                  style={{boxShadow: '0px 2px 20px rgba(0, 0, 0, 0.06)'}}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {(isBankingFinance || isChurches) && (
                      <img
                        src={companyLogo || '/companies/default-company.svg'}
                        alt={companyName}
                        className="w-10 h-10 rounded-lg object-contain flex-shrink-0 bg-white border border-[#D4E1EA]"
                        onError={(e) => {
                          if (e.target.src !== '/companies/default-company.svg') {
                            e.target.src = '/companies/default-company.svg';
                          }
                        }}
                      />
                    )}
                  <span className="flex-1 text-[#050F1C] text-lg font-medium text-left truncate">
                          {companyName}
                  </span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#022658] rotate-180 flex-shrink-0" />
                </button>
                    );
                  })}
            </div>

            {/* Right Column */}
            <div className="flex flex-col flex-1 gap-3 min-w-0">
                  {rightColumn.map((company, idx) => {
                    const companyName = typeof company === 'string' ? company : (company.name || company.short_name || 'Unknown');
                    const companyId = company.id || (leftColumn.length + idx);
                    const companyLogo = isBankingFinance ? (company.logo || getBankLogo(companyName, company.logo_url)) : isChurches ? '/category-icons/churches.png' : null;
                    return (
                <button
                        key={`right-${companyId}-${idx}`}
                  onClick={() => setSelectedCompany(company)}
                  className="flex justify-between items-center self-stretch bg-white h-[58px] px-4 rounded-lg hover:bg-blue-50 transition-colors cursor-pointer border-l-2 border-[#3B82F6]"
                  style={{boxShadow: '0px 2px 20px rgba(0, 0, 0, 0.06)'}}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {(isBankingFinance || isChurches) && (
                      <img
                        src={companyLogo || '/companies/default-company.svg'}
                        alt={companyName}
                        className="w-10 h-10 rounded-lg object-contain flex-shrink-0 bg-white border border-[#D4E1EA]"
                        onError={(e) => {
                          if (e.target.src !== '/companies/default-company.svg') {
                            e.target.src = '/companies/default-company.svg';
                          }
                        }}
                      />
                    )}
                  <span className="flex-1 text-[#050F1C] text-lg font-medium text-left truncate">
                          {companyName}
                  </span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#022658] rotate-180 flex-shrink-0" />
                </button>
                    );
                  })}
            </div>
          </div>

              {/* Infinite Scroll Trigger & Loading More Indicator */}
              {hasMore && (
                <div ref={observerTarget} className="flex justify-center items-center py-6">
                  {loadingMore && (
                    <>
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#022658]"></div>
                      <span className="ml-2 text-[#525866] text-sm">{isBankingFinance ? 'Loading more banks...' : isChurches ? 'Loading more churches...' : 'Loading more companies...'}</span>
                    </>
                  )}
                </div>
              )}

              {/* Results Count */}
              {totalCompanies > 0 && (
                <div className="flex justify-center items-center py-2">
                  <span className="text-[#525866] text-xs">
                    Showing {sortedCompanies.length} of {totalCompanies} {isBankingFinance ? 'banks' : isChurches ? 'churches' : 'companies'}
                  </span>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CorporateClientCompaniesListView;

