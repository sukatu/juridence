import React, { useState, useEffect } from 'react';
import { ArrowLeft, ChevronRight } from 'lucide-react';
import AdminHeader from './AdminHeader';

const MarriageVenueDetails = ({ venue, onBack, userInfo, onNavigate, onLogout }) => {
  const [venueData, setVenueData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const venueId = venue?.id;

  // Fetch venue details from API
  useEffect(() => {
    const fetchVenueDetails = async () => {
      if (!venueId) {
        if (venue) {
          setVenueData(venue);
          setLoading(false);
        } else {
          setError('Venue ID not found');
          setLoading(false);
        }
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(`/api/marriage-venues/${venueId}`, {
          headers: { 'Content-Type': 'application/json' }
        });

        if (response.ok) {
          const data = await response.json();
          setVenueData(data);
        } else {
          throw new Error('Failed to fetch venue details');
        }
      } catch (err) {
        console.error('Error fetching venue details:', err);
        setError('Failed to load venue details. Please try again.');
        if (venue) {
          setVenueData(venue);
        } else {
          setVenueData(null);
        }
      } finally {
        setLoading(false);
      }
    };

    setVenueData(null);
    setLoading(true);
    setError(null);
    
    fetchVenueDetails();
  }, [venueId, venue]);

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

  const venueName = venueData?.name_of_licensed_place || 'UNNAMED VENUE';

  if (loading) {
    return (
      <div className="bg-[#F7F8FA] min-h-screen pt-2">
        <AdminHeader userInfo={userInfo} onNavigate={onNavigate} onLogout={onLogout} />
        <div className="flex justify-center items-center py-12">
          <span className="text-[#525866] text-sm uppercase">LOADING VENUE DETAILS...</span>
        </div>
      </div>
    );
  }

  if (error && !venueData) {
    return (
      <div className="bg-[#F7F8FA] min-h-screen pt-2">
        <AdminHeader userInfo={userInfo} onNavigate={onNavigate} onLogout={onLogout} />
        <div className="flex justify-center items-center py-12">
          <span className="text-red-500 text-sm uppercase">{error}</span>
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
            <span className="text-[#525866] text-xs mr-1.5 uppercase">COMPANIES</span>
            <ChevronRight className="w-4 h-4 text-[#525866] mr-1 flex-shrink-0" />
            <span className="text-[#525866] text-xs mr-1.5 uppercase">CHURCHES</span>
            <ChevronRight className="w-4 h-4 text-[#525866] mr-1 flex-shrink-0" />
            <span className="text-[#070810] text-sm">{venueName.toUpperCase()}</span>
          </div>

          {/* Venue Header */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <button onClick={onBack} className="cursor-pointer hover:opacity-70">
                <ArrowLeft className="w-4 h-4 text-[#040E1B]" />
              </button>
              <img
                src="/category-icons/churches.png"
                alt={venueName}
                className="w-12 h-12 rounded-lg object-contain flex-shrink-0 bg-white border border-[#D4E1EA]"
                onError={(e) => {
                  if (e.target.src !== '/category-icons/churches.png') {
                    e.target.src = '/category-icons/churches.png';
                  }
                }}
              />
              <div className="flex flex-col items-start gap-1">
                <span className="text-[#040E1B] text-xl font-bold uppercase">{venueName}</span>
              </div>
            </div>
          </div>

          {/* Details Section */}
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-[#040E1B] uppercase">VENUE DETAILS</h3>
            {venueData ? (
              <div className="space-y-6">
                {/* Logo Section */}
                <div className="flex items-center gap-4 pb-4 border-b border-[#E4E7EB]">
                  <img
                    src="/category-icons/churches.png"
                    alt={venueName}
                    className="w-20 h-20 rounded-lg object-contain flex-shrink-0 bg-white border border-[#D4E1EA] p-2"
                    onError={(e) => {
                      if (e.target.src !== '/category-icons/churches.png') {
                        e.target.src = '/category-icons/churches.png';
                      }
                    }}
                  />
                  <div className="flex flex-col gap-1">
                    <span className="text-[#040E1B] text-xl font-bold uppercase">{venueData.name_of_licensed_place || 'UNNAMED VENUE'}</span>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-[#868C98] text-xs uppercase">NAME OF LICENSED PLACE</span>
                    <p className="text-[#040E1B] text-sm uppercase">{venueData.name_of_licensed_place || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-[#868C98] text-xs uppercase">DENOMINATION</span>
                    <p className="text-[#040E1B] text-sm uppercase">{venueData.denomination || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-[#868C98] text-xs uppercase">GAZETTE NUMBER</span>
                    <p className="text-[#040E1B] text-sm uppercase">{venueData.gazette_number || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-[#868C98] text-xs uppercase">PAGE NUMBER</span>
                    <p className="text-[#040E1B] text-sm">{venueData.page_number || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-[#868C98] text-xs uppercase">DATE OF GAZETTE</span>
                    <p className="text-[#040E1B] text-sm">{formatDate(venueData.date_of_gazette) || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-[#868C98] text-xs uppercase">DATE OF LICENSE</span>
                    <p className="text-[#040E1B] text-sm">{formatDate(venueData.date_of_license) || 'N/A'}</p>
                  </div>
                  <div className="col-span-2">
                    <span className="text-[#868C98] text-xs uppercase">BRANCH LOCATION / ADDRESS / REGION</span>
                    <p className="text-[#040E1B] text-sm uppercase">{venueData.branch_location_address_region || 'N/A'}</p>
                  </div>
                  <div className="col-span-2">
                    <span className="text-[#868C98] text-xs uppercase">METROPOLITAN ASSEMBLY OR REGIONAL COORDINATING COUNCIL</span>
                    <p className="text-[#040E1B] text-sm uppercase">{venueData.metropolitan_assembly_or_regional_coordinating_council || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-[#868C98] text-xs uppercase">NAME OF LICENSE OFFICER</span>
                    <p className="text-[#040E1B] text-sm uppercase">{venueData.name_of_license_officer || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-[#868C98] text-xs uppercase">DESIGNATION OF LICENSE OFFICER</span>
                    <p className="text-[#040E1B] text-sm uppercase">{venueData.designation_of_license_officer || 'N/A'}</p>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-[#525866] text-sm uppercase">NO VENUE DATA AVAILABLE</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarriageVenueDetails;
