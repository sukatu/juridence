import React, { useEffect, useState } from 'react';
import { ArrowLeft, ChevronRight } from 'lucide-react';
import { apiGet } from '../../utils/api';
import AdminHeader from './AdminHeader';

const InsuranceDetails = ({ insurance, industry, onBack, userInfo, onNavigate, onLogout }) => {
  const [insuranceData, setInsuranceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const insuranceId = typeof insurance === 'object' && insurance?.id ? insurance.id : null;
  const insuranceName = typeof insurance === 'string'
    ? insurance
    : (insurance?.name || insurance?.short_name || 'Unknown Insurance');

  useEffect(() => {
    const fetchInsurance = async () => {
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
        const response = await apiGet(`/insurance/${insuranceId}`);
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
    fetchInsurance();
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

  const getInsuranceLogo = (logoUrl) => {
    if (logoUrl) return logoUrl;
    return '/category-icons/insurance.png';
  };

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

  const insuranceInfo = insuranceData?.insurance || insuranceData || null;
  if (!insuranceInfo) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#F7F8FA]">
        <p className="text-[#525866] text-lg mb-4">Insurance not found.</p>
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
        <div className="flex flex-col bg-white p-4 gap-6 rounded-lg w-full min-h-[800px]">
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-1">
              <span className="text-[#525866] text-xs opacity-75 mr-1 whitespace-nowrap">COMPANIES</span>
              <ChevronRight className="w-4 h-4 text-[#525866] mr-1" />
              <span className="text-[#070810] text-sm font-normal whitespace-nowrap">{insuranceName}</span>
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
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-bold text-[#040E1B]">Insurance Details</h3>
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
              <div>
                <span className="text-[#868C98] text-xs">Has Mobile App</span>
                <p className="text-[#040E1B] text-sm">{insuranceInfo.has_mobile_app ? 'Yes' : 'No'}</p>
              </div>
              <div>
                <span className="text-[#868C98] text-xs">Has Online Portal</span>
                <p className="text-[#040E1B] text-sm">{insuranceInfo.has_online_portal ? 'Yes' : 'No'}</p>
              </div>
              <div>
                <span className="text-[#868C98] text-xs">Has Online Claims</span>
                <p className="text-[#040E1B] text-sm">{insuranceInfo.has_online_claims ? 'Yes' : 'No'}</p>
              </div>
              <div>
                <span className="text-[#868C98] text-xs">Has 24/7 Support</span>
                <p className="text-[#040E1B] text-sm">{insuranceInfo.has_24_7_support ? 'Yes' : 'No'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InsuranceDetails;
