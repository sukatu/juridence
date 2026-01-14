import React, { useState, useEffect, useCallback } from 'react';
import { ChevronRight, ChevronLeft, Search, Filter, X, ArrowLeft } from 'lucide-react';
import AdminHeader from './AdminHeader';
import MarriageVenueDetails from './MarriageVenueDetails';

const MarriageVenuesListView = ({ userInfo, onBack, onNavigate, onLogout }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [venues, setVenues] = useState([]);
  const [selectedVenue, setSelectedVenue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalVenues, setTotalVenues] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [filterRegion, setFilterRegion] = useState('');
  const [filterDenomination, setFilterDenomination] = useState('');
  const itemsPerPage = 50;

  const fetchVenues = useCallback(async (page = 1) => {
    try {
      setLoading(true);

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
      const response = await fetch(apiUrl, {
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.ok) {
        const data = await response.json();
        const newVenues = (data.venues || []).map(venue => ({
          ...venue,
          id: venue.id,
          name: (venue.name_of_licensed_place || 'UNNAMED VENUE').toUpperCase(),
          logo: '/category-icons/churches.png',
          denomination: venue.denomination,
          region: venue.branch_location_address_region,
          gazette_number: venue.gazette_number,
          date_of_license: venue.date_of_license,
          name_of_license_officer: venue.name_of_license_officer
        }));

        setVenues(newVenues);
        setTotalVenues(data.total || 0);
        setTotalPages(data.total_pages || 0);
        setCurrentPage(page);
      } else {
        const errorText = await response.text();
        console.error('Failed to fetch marriage venues:', response.status, errorText);
        setVenues([]);
        setTotalVenues(0);
        setTotalPages(0);
      }
    } catch (error) {
      console.error('Error fetching marriage venues:', error);
      setVenues([]);
      setTotalVenues(0);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, filterRegion, filterDenomination, itemsPerPage]);

  // Initial load and page changes
  useEffect(() => {
    fetchVenues(currentPage);
  }, [currentPage, fetchVenues]);

  // Debounced search and filter changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setCurrentPage(1);
      fetchVenues(1);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, filterRegion, filterDenomination]);

  // Get unique regions and denominations for filters (from all loaded data)
  const uniqueRegions = [...new Set(venues.map(v => v.region).filter(Boolean))].sort();
  const uniqueDenominations = [...new Set(venues.map(v => v.denomination).filter(Boolean))].sort();

  // Split venues into two columns
  const leftColumn = venues.slice(0, Math.ceil(venues.length / 2));
  const rightColumn = venues.slice(Math.ceil(venues.length / 2));

  // If a venue is selected, show details
  if (selectedVenue) {
    return (
      <MarriageVenueDetails
        venue={selectedVenue}
        onBack={() => setSelectedVenue(null)}
        userInfo={userInfo}
        onNavigate={onNavigate}
        onLogout={onLogout}
      />
    );
  }

  return (
    <div className="bg-[#F7F8FA] min-h-screen">
      {/* Header */}
      <AdminHeader userInfo={userInfo} onNavigate={onNavigate} onLogout={onLogout} />

      {/* Main Content */}
      <div className="px-6">
        <div className="flex flex-col items-start bg-white pt-4 pb-[158px] px-3.5 gap-4 rounded-lg">
          {/* Breadcrumb and Title */}
          <div className="flex justify-between items-start self-stretch">
            <div className="flex flex-col items-start gap-2">
              <div className="flex items-center gap-2">
                {onBack && (
                  <button
                    onClick={onBack}
                    className="text-[#022658] hover:text-[#1A4983]"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                )}
                <span className="text-[#525866] text-xs uppercase">COMPANIES</span>
              </div>
              <span className="text-[#050F1C] text-xl font-semibold uppercase" style={{ fontFamily: 'Roboto' }}>
                MARRIAGE VENUES
              </span>
              <span className="text-[#070810] text-sm font-normal opacity-75 uppercase" style={{ fontFamily: 'Roboto' }}>
                BROWSE THROUGH ALL MARRIAGE VENUES AND CHURCHES IN OUR DATABASE
              </span>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex justify-between items-center self-stretch gap-4">
            <div className="flex items-center w-[554px] py-3.5 pl-2 gap-2.5 rounded-lg border border-solid border-[#D4E1EA]" style={{boxShadow: '4px 4px 4px #0708101A'}}>
              <Search className="w-3 h-3 text-[#868C98]" />
              <input
                type="text"
                placeholder="SEARCH MARRIAGE VENUES HERE..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 text-[#525866] bg-transparent text-xs border-0 outline-none uppercase"
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
                <span className="text-xs font-medium uppercase">FILTERS</span>
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
                  className="px-4 py-3.5 text-[#525866] text-xs font-medium hover:text-[#022658] uppercase"
                >
                  CLEAR
                </button>
              )}
            </div>
          </div>

          {/* Filter Options Panel */}
          {showFilters && (
            <div className="flex flex-col self-stretch gap-4 p-4 bg-[#F7F8FA] rounded-lg border border-[#D4E1EA]">
              {/* Region Filter */}
              <div className="flex flex-col gap-2">
                <label className="text-[#050F1C] text-sm font-medium uppercase">REGION</label>
                <select
                  value={filterRegion}
                  onChange={(e) => setFilterRegion(e.target.value)}
                  className="px-3 py-2 border border-[#D4E1EA] rounded-lg text-[#525866] text-sm bg-white"
                >
                  <option value="">ALL REGIONS</option>
                  {uniqueRegions.map(region => (
                    <option key={region} value={region}>{region.toUpperCase()}</option>
                  ))}
                </select>
              </div>

              {/* Denomination Filter */}
              <div className="flex flex-col gap-2">
                <label className="text-[#050F1C] text-sm font-medium uppercase">DENOMINATION</label>
                <select
                  value={filterDenomination}
                  onChange={(e) => setFilterDenomination(e.target.value)}
                  className="px-3 py-2 border border-[#D4E1EA] rounded-lg text-[#525866] text-sm bg-white"
                >
                  <option value="">ALL DENOMINATIONS</option>
                  {uniqueDenominations.map(denomination => (
                    <option key={denomination} value={denomination}>{denomination.toUpperCase()}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Venues List - Two Columns */}
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#022658]"></div>
              <span className="ml-3 text-[#525866] text-sm uppercase">LOADING MARRIAGE VENUES...</span>
            </div>
          ) : venues.length === 0 ? (
            <div className="flex justify-center items-center py-12">
              <span className="text-[#525866] text-sm uppercase">NO MARRIAGE VENUES FOUND</span>
            </div>
          ) : (
            <>
              <div className="flex items-start self-stretch gap-6 w-full">
                {/* Left Column */}
                <div className="flex flex-col flex-1 gap-3 min-w-0">
                  {leftColumn.map((venue, idx) => (
                    <button
                      key={`left-${venue.id}-${idx}`}
                      onClick={() => setSelectedVenue(venue)}
                      className="flex justify-between items-center self-stretch bg-white h-[58px] px-4 rounded-lg hover:bg-blue-50 transition-colors cursor-pointer border-l-2 border-[#3B82F6]"
                      style={{boxShadow: '0px 2px 20px rgba(0, 0, 0, 0.06)'}}
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <img
                          src={venue.logo || '/category-icons/churches.png'}
                          alt={venue.name}
                          className="w-10 h-10 rounded-lg object-contain flex-shrink-0 bg-white border border-[#D4E1EA]"
                          onError={(e) => {
                            if (e.target.src !== '/category-icons/churches.png') {
                              e.target.src = '/category-icons/churches.png';
                            }
                          }}
                        />
                        <span className="flex-1 text-[#050F1C] text-lg font-medium text-left truncate">
                          {venue.name}
                        </span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-[#022658] rotate-180 flex-shrink-0" />
                    </button>
                  ))}
                </div>

                {/* Right Column */}
                <div className="flex flex-col flex-1 gap-3 min-w-0">
                  {rightColumn.map((venue, idx) => (
                    <button
                      key={`right-${venue.id}-${idx}`}
                      onClick={() => setSelectedVenue(venue)}
                      className="flex justify-between items-center self-stretch bg-white h-[58px] px-4 rounded-lg hover:bg-blue-50 transition-colors cursor-pointer border-l-2 border-[#3B82F6]"
                      style={{boxShadow: '0px 2px 20px rgba(0, 0, 0, 0.06)'}}
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <img
                          src={venue.logo || '/category-icons/churches.png'}
                          alt={venue.name}
                          className="w-10 h-10 rounded-lg object-contain flex-shrink-0 bg-white border border-[#D4E1EA]"
                          onError={(e) => {
                            if (e.target.src !== '/category-icons/churches.png') {
                              e.target.src = '/category-icons/churches.png';
                            }
                          }}
                        />
                        <span className="flex-1 text-[#050F1C] text-lg font-medium text-left truncate">
                          {venue.name}
                        </span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-[#022658] rotate-180 flex-shrink-0" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between self-stretch pt-4 border-t border-[#D4E1EA]">
                  <div className="text-sm text-[#525866] uppercase">
                    SHOWING {((currentPage - 1) * itemsPerPage) + 1} TO {Math.min(currentPage * itemsPerPage, totalVenues)} OF {totalVenues} MARRIAGE VENUES
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="flex items-center px-3 py-2 border border-[#D4E1EA] rounded-lg bg-white text-sm font-medium text-[#525866] hover:bg-[#F7F8FA] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="w-4 h-4 mr-1" />
                      <span className="uppercase">PREVIOUS</span>
                    </button>
                    <span className="px-3 py-2 text-sm text-[#525866] uppercase">
                      PAGE {currentPage} OF {totalPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      className="flex items-center px-3 py-2 border border-[#D4E1EA] rounded-lg bg-white text-sm font-medium text-[#525866] hover:bg-[#F7F8FA] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="uppercase">NEXT</span>
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default MarriageVenuesListView;
