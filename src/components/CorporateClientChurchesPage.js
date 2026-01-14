import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronRight, Search, Filter, X } from 'lucide-react';
import CorporateClientHeader from './CorporateClientHeader';

const CorporateClientChurchesPage = ({ userInfo, onBack, onNavigate, onLogout }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [churches, setChurches] = useState([]);
  const [selectedChurch, setSelectedChurch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalChurches, setTotalChurches] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [filterRegion, setFilterRegion] = useState('');
  const [filterDenomination, setFilterDenomination] = useState('');
  const observerTarget = useRef(null);
  const itemsPerPage = 50;

  const displayUserInfo = userInfo || JSON.parse(localStorage.getItem('userData') || '{}');
  const organizationName = displayUserInfo?.organization || 'Access Bank';

  const fetchChurches = useCallback(async (page = 1, reset = false) => {
    try {
      if (page === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      const params = new URLSearchParams({
        page: page.toString(),
        limit: itemsPerPage.toString(),
        sort_by: 'name_of_licensed_place',
        sort_order: 'asc'
      });

      if (searchQuery.trim()) {
        params.append('query', searchQuery.trim());
      }

      if (filterRegion) {
        params.append('region', filterRegion);
      }

      if (filterDenomination) {
        params.append('denomination', filterDenomination);
      }

      const apiUrl = `/api/marriage-venues/search?${params.toString()}`;
      console.log('Fetching churches from:', apiUrl);

      const response = await fetch(apiUrl, {
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Churches API response:', data);
        const newChurches = (data.venues || []).map(venue => ({
          ...venue,
          id: venue.id,
          name: venue.name_of_licensed_place || 'Unnamed Venue',
          logo: '/category-icons/churches.png',
          denomination: venue.denomination,
          region: venue.branch_location_address_region,
          gazette_number: venue.gazette_number,
          date_of_license: venue.date_of_license,
          name_of_license_officer: venue.name_of_license_officer,
          date_of_gazette: venue.date_of_gazette
        }));

        if (reset) {
          setChurches(newChurches);
        } else {
          setChurches(prev => [...prev, ...newChurches]);
        }

        setTotalChurches(data.total || 0);
        setHasMore(data.has_next || false);
        setCurrentPage(page);
      } else {
        const errorText = await response.text();
        console.error('Failed to fetch churches:', response.status, errorText);
        if (reset) {
          setChurches([]);
        }
        setHasMore(false);
        setTotalChurches(0);
      }
    } catch (error) {
      console.error('Error fetching churches:', error);
      if (reset) {
        setChurches([]);
      }
      setHasMore(false);
      setTotalChurches(0);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [searchQuery, filterRegion, filterDenomination, itemsPerPage]);

  // Initial load
  useEffect(() => {
    setChurches([]);
    setCurrentPage(1);
    setHasMore(true);
    fetchChurches(1, true);
  }, []);

  // Debounced search and filter changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setChurches([]);
      setCurrentPage(1);
      setHasMore(true);
      fetchChurches(1, true);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, filterRegion, filterDenomination, fetchChurches]);

  // Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore && !loadingMore && !loading) {
          fetchChurches(currentPage + 1, false);
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
  }, [hasMore, loadingMore, loading, currentPage, fetchChurches]);

  // Get unique regions and denominations for filters
  const uniqueRegions = [...new Set(churches.map(c => c.region).filter(Boolean))].sort();
  const uniqueDenominations = [...new Set(churches.map(c => c.denomination).filter(Boolean))].sort();

  // Sort churches alphabetically
  const sortedChurches = [...churches].sort((a, b) => {
    const nameA = (a.name || '').toLowerCase();
    const nameB = (b.name || '').toLowerCase();
    return nameA.localeCompare(nameB);
  });

  // Split churches into two columns
  const leftColumn = sortedChurches.slice(0, Math.ceil(sortedChurches.length / 2));
  const rightColumn = sortedChurches.slice(Math.ceil(sortedChurches.length / 2));

  if (selectedChurch) {
    // Show church details (you can create a separate component for this)
    return (
      <div className="bg-[#F7F8FA] min-h-screen">
        <CorporateClientHeader userInfo={displayUserInfo} onNavigate={onNavigate} onLogout={onLogout} />
        <div className="px-6 py-4">
          <button
            onClick={() => setSelectedChurch(null)}
            className="mb-4 text-[#022658] hover:text-[#1A4983] flex items-center gap-2"
          >
            <ChevronRight className="w-4 h-4 rotate-180" />
            Back to Churches
          </button>
          <div className="bg-white rounded-lg p-6">
            <h2 className="text-2xl font-semibold text-[#050F1C] mb-4">{selectedChurch.name}</h2>
            <div className="space-y-3">
              {selectedChurch.denomination && (
                <div>
                  <span className="text-[#525866] text-sm font-medium">Denomination: </span>
                  <span className="text-[#050F1C]">{selectedChurch.denomination}</span>
                </div>
              )}
              {selectedChurch.region && (
                <div>
                  <span className="text-[#525866] text-sm font-medium">Region: </span>
                  <span className="text-[#050F1C]">{selectedChurch.region}</span>
                </div>
              )}
              {selectedChurch.gazette_number && (
                <div>
                  <span className="text-[#525866] text-sm font-medium">Gazette Number: </span>
                  <span className="text-[#050F1C]">{selectedChurch.gazette_number}</span>
                </div>
              )}
              {selectedChurch.name_of_license_officer && (
                <div>
                  <span className="text-[#525866] text-sm font-medium">License Officer: </span>
                  <span className="text-[#050F1C]">{selectedChurch.name_of_license_officer}</span>
                </div>
              )}
              {selectedChurch.date_of_license && (
                <div>
                  <span className="text-[#525866] text-sm font-medium">Date of License: </span>
                  <span className="text-[#050F1C]">{selectedChurch.date_of_license}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#F7F8FA] min-h-screen">
      {/* Header */}
      <CorporateClientHeader userInfo={displayUserInfo} onNavigate={onNavigate} onLogout={onLogout} />

      {/* Main Content */}
      <div className="px-6">
        {/* Page Title */}
        <div className="flex flex-col items-start w-full gap-2 mb-4">
          <span className="text-[#050F1C] text-xl font-medium">
            {organizationName},
          </span>
          <span className="text-[#050F1C] text-base opacity-75">
            Track all your activities here.
          </span>
        </div>

        <div className="flex flex-col items-start bg-white pt-4 pb-[158px] px-3.5 gap-4 rounded-lg">
          {/* Breadcrumb and Title */}
          <div className="flex justify-between items-start self-stretch">
            <div className="flex flex-col items-start gap-2">
              <span className="text-[#525866] text-xs">CHURCHES</span>
              <div className="flex items-center gap-2">
                {onBack && (
                  <button
                    onClick={onBack}
                    className="text-[#022658] hover:text-[#1A4983]"
                  >
                    <ChevronRight className="w-5 h-5 rotate-180" />
                  </button>
                )}
                <span className="text-[#050F1C] text-xl font-semibold" style={{ fontFamily: 'Roboto' }}>
                  Churches
                </span>
              </div>
              <span className="text-[#070810] text-sm font-normal opacity-75" style={{ fontFamily: 'Roboto' }}>
                Browse through all churches and marriage venues in our database
              </span>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex justify-between items-center self-stretch gap-4">
            <div className="flex items-center w-[554px] py-3.5 pl-2 gap-2.5 rounded-lg border border-solid border-[#D4E1EA]" style={{boxShadow: '4px 4px 4px #0708101A'}}>
              <Search className="w-3 h-3 text-[#868C98]" />
              <input
                type="text"
                placeholder="Search churches and venues here..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 text-[#525866] bg-transparent text-xs border-0 outline-none"
              />
            </div>

            {/* Filter Button */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-4 py-3.5 rounded-lg border border-solid transition-colors ${
                  showFilters || filterRegion || filterDenomination
                    ? 'bg-[#022658] text-white border-[#022658]'
                    : 'bg-white text-[#525866] border-[#D4E1EA]'
                }`}
                style={{boxShadow: '4px 4px 4px #0708101A'}}
              >
                <Filter className="w-4 h-4" />
                <span className="text-xs font-medium">Filters</span>
                {(filterRegion || filterDenomination) && (
                  <span className="bg-white text-[#022658] rounded-full px-2 py-0.5 text-xs font-bold">
                    {[filterRegion, filterDenomination].filter(Boolean).length}
                  </span>
                )}
              </button>

              {/* Clear Filters */}
              {(filterRegion || filterDenomination) && (
                <button
                  onClick={() => {
                    setFilterRegion('');
                    setFilterDenomination('');
                  }}
                  className="px-4 py-3.5 text-[#525866] text-xs font-medium hover:text-[#022658]"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Filter Options Panel */}
          {showFilters && (
            <div className="flex flex-col self-stretch gap-4 p-4 bg-[#F7F8FA] rounded-lg border border-[#D4E1EA]">
              {/* Region Filter */}
              <div className="flex flex-col gap-2">
                <label className="text-[#050F1C] text-sm font-medium">Region</label>
                <select
                  value={filterRegion}
                  onChange={(e) => setFilterRegion(e.target.value)}
                  className="px-3 py-2 border border-[#D4E1EA] rounded-lg text-[#525866] text-sm bg-white"
                >
                  <option value="">All Regions</option>
                  {uniqueRegions.map(region => (
                    <option key={region} value={region}>{region}</option>
                  ))}
                </select>
              </div>

              {/* Denomination Filter */}
              <div className="flex flex-col gap-2">
                <label className="text-[#050F1C] text-sm font-medium">Denomination</label>
                <select
                  value={filterDenomination}
                  onChange={(e) => setFilterDenomination(e.target.value)}
                  className="px-3 py-2 border border-[#D4E1EA] rounded-lg text-[#525866] text-sm bg-white"
                >
                  <option value="">All Denominations</option>
                  {uniqueDenominations.map(denomination => (
                    <option key={denomination} value={denomination}>{denomination}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Churches List - Two Columns */}
          {loading && sortedChurches.length === 0 ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#022658]"></div>
              <span className="ml-3 text-[#525866] text-sm">Loading churches...</span>
            </div>
          ) : sortedChurches.length === 0 ? (
            <div className="flex justify-center items-center py-12">
              <span className="text-[#525866] text-sm">No churches found</span>
            </div>
          ) : (
            <>
              <div className="flex items-start self-stretch gap-6 w-full">
                {/* Left Column */}
                <div className="flex flex-col flex-1 gap-3 min-w-0">
                  {leftColumn.map((church, idx) => (
                    <button
                      key={`left-${church.id}-${idx}`}
                      onClick={() => setSelectedChurch(church)}
                      className="flex justify-between items-center self-stretch bg-white h-[58px] px-4 rounded-lg hover:bg-blue-50 transition-colors cursor-pointer border-l-2 border-[#3B82F6]"
                      style={{boxShadow: '0px 2px 20px rgba(0, 0, 0, 0.06)'}}
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <img
                          src={church.logo || '/category-icons/churches.png'}
                          alt={church.name}
                          className="w-10 h-10 rounded-lg object-contain flex-shrink-0 bg-white border border-[#D4E1EA]"
                          onError={(e) => {
                            if (e.target.src !== '/category-icons/churches.png') {
                              e.target.src = '/category-icons/churches.png';
                            }
                          }}
                        />
                        <span className="flex-1 text-[#050F1C] text-lg font-medium text-left truncate">
                          {church.name}
                        </span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-[#022658] rotate-180 flex-shrink-0" />
                    </button>
                  ))}
                </div>

                {/* Right Column */}
                <div className="flex flex-col flex-1 gap-3 min-w-0">
                  {rightColumn.map((church, idx) => (
                    <button
                      key={`right-${church.id}-${idx}`}
                      onClick={() => setSelectedChurch(church)}
                      className="flex justify-between items-center self-stretch bg-white h-[58px] px-4 rounded-lg hover:bg-blue-50 transition-colors cursor-pointer border-l-2 border-[#3B82F6]"
                      style={{boxShadow: '0px 2px 20px rgba(0, 0, 0, 0.06)'}}
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <img
                          src={church.logo || '/category-icons/churches.png'}
                          alt={church.name}
                          className="w-10 h-10 rounded-lg object-contain flex-shrink-0 bg-white border border-[#D4E1EA]"
                          onError={(e) => {
                            if (e.target.src !== '/category-icons/churches.png') {
                              e.target.src = '/category-icons/churches.png';
                            }
                          }}
                        />
                        <span className="flex-1 text-[#050F1C] text-lg font-medium text-left truncate">
                          {church.name}
                        </span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-[#022658] rotate-180 flex-shrink-0" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Load More / Infinite Scroll */}
              {hasMore && (
                <div ref={observerTarget} className="flex justify-center items-center py-4">
                  {loadingMore && (
                    <>
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#022658]"></div>
                      <span className="ml-2 text-[#525866] text-sm">Loading more churches...</span>
                    </>
                  )}
                </div>
              )}

              {/* Results Count */}
              {sortedChurches.length > 0 && (
                <div className="flex justify-center items-center py-2">
                  <span className="text-[#525866] text-xs">
                    Showing {sortedChurches.length} of {totalChurches} churches
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

export default CorporateClientChurchesPage;
