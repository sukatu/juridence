import React, { useState, useEffect } from 'react';
import { apiGet } from '../../utils/api';
import AdminHeader from './AdminHeader';

const PersonsEntitySelector = ({ userInfo, industry, onSelectEntity, onBack, onNavigate, onLogout }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [entities, setEntities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchEntities = async () => {
      try {
        setIsLoading(true);
        // Fetch banks from the API with high limit to get all banks
        const result = await apiGet('/admin/banks?limit=100');
        console.log('Banks API result:', result);
        
        // Handle both direct array and paginated response
        let banksData = [];
        
        // Check for paginated response format
        if (result && result.banks && Array.isArray(result.banks)) {
          banksData = result.banks;
          console.log(`API returned ${result.total} banks in paginated format`);
        } else if (result && result.data && result.data.banks) {
          banksData = result.data.banks;
        } else if (result && result.data && Array.isArray(result.data)) {
          banksData = result.data;
        } else if (Array.isArray(result)) {
          banksData = result;
        }

        if (banksData && banksData.length > 0) {
          // Map banks to entity format with fallback icons
          const mappedEntities = banksData.map((bank, idx) => ({
            id: bank._id || bank.id || `bank-${idx}`,
            name: bank.name || bank.bank_name || bank.bankName || `Bank ${idx + 1}`,
            icon: bank.logo_url || bank.logo || getDefaultBankIcon(idx),
            type: 'bank',
            data: bank // Keep full bank data for reference
          }));
          console.log(`✅ Loaded ${mappedEntities.length} banks from database`);
          console.log('Sample bank data:', banksData[0]);
          setEntities(mappedEntities);
        } else {
          console.log('⚠️ API returned no banks, using sample banks');
          // Fallback to sample data if API fails
          setEntities(getSampleBanks());
        }
      } catch (error) {
        console.error('Error fetching banks:', error);
        // Use sample data on error
        setEntities(getSampleBanks());
      } finally {
        setIsLoading(false);
      }
    };

    if (industry.id === 'banking') {
      fetchEntities();
    } else {
      // For other industries, use placeholder data
      setEntities([]);
      setIsLoading(false);
    }
  }, [industry]);

  const getDefaultBankIcon = (index) => {
    const defaultIcons = [
      'https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Iq8V0MifpP/ar8e9m9q_expires_30_days.png',
      'https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Iq8V0MifpP/hdj7rnnw_expires_30_days.png',
      'https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Iq8V0MifpP/ky8x48dl_expires_30_days.png',
      'https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Iq8V0MifpP/kaj4ncl7_expires_30_days.png'
    ];
    return defaultIcons[index % defaultIcons.length];
  };

  const getSampleBanks = () => [
    { id: 'access', name: 'Access Bank', icon: 'https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Iq8V0MifpP/ar8e9m9q_expires_30_days.png' },
    { id: 'absa', name: 'Absa Bank', icon: 'https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Iq8V0MifpP/hdj7rnnw_expires_30_days.png' },
    { id: 'bog', name: 'Bank of Ghana', icon: 'https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Iq8V0MifpP/ky8x48dl_expires_30_days.png' },
    { id: 'calbank', name: 'Cal Bank', icon: 'https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Iq8V0MifpP/kaj4ncl7_expires_30_days.png' },
    { id: 'ecobank', name: 'Eco Bank', icon: 'https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Iq8V0MifpP/bnx90j2o_expires_30_days.png' },
    { id: 'fbn', name: 'FBN Bank', icon: 'https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Iq8V0MifpP/3i4a32gg_expires_30_days.png' },
    { id: 'fidelity', name: 'Fidelity Bank', icon: 'https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Iq8V0MifpP/ifzhc3zs_expires_30_days.png' },
    { id: 'firstatlantic', name: 'First Atlantic Bank', icon: 'https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Iq8V0MifpP/fb8e2z1n_expires_30_days.png' },
    { id: 'gcb', name: 'GCB Bank', icon: 'https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Iq8V0MifpP/uukxrid6_expires_30_days.png' },
    { id: 'gtb', name: 'GTB Bank', icon: 'https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Iq8V0MifpP/xibcknnv_expires_30_days.png' },
    { id: 'nib', name: 'National Investment Bank', icon: 'https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Iq8V0MifpP/du3it564_expires_30_days.png' },
    { id: 'omnibsic', name: 'OmniBSIC Bank', icon: 'https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Iq8V0MifpP/d1b2ovpv_expires_30_days.png' },
    { id: 'heritage', name: 'Heritage Bank', icon: 'https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Iq8V0MifpP/1rl2ml56_expires_30_days.png' },
    { id: 'stanchart', name: 'Standard Chartered Bank', icon: 'https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Iq8V0MifpP/3xtz3w41_expires_30_days.png' },
    { id: 'uba', name: 'UBA Bank', icon: 'https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Iq8V0MifpP/qg0h4tsw_expires_30_days.png' },
    { id: 'zenith', name: 'Zenith Bank', icon: 'https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Iq8V0MifpP/dq97o34k_expires_30_days.png' }
  ];

  if (isLoading) {
    return (
      <div className="bg-[#F7F8FA] min-h-screen flex items-center justify-center">
        <div className="text-[#525866] text-lg">Loading banks...</div>
      </div>
    );
  }

  return (
    <div className="bg-[#F7F8FA] min-h-screen">
      {/* Full Width Header */}
      <AdminHeader userInfo={userInfo} onNavigate={onNavigate} onLogout={onLogout} />

      {/* Main Content */}
      <div className="px-6">
        <div className="flex flex-col items-start bg-white py-4 pr-4 gap-6 rounded-lg">
          {/* Breadcrumb */}
          <div className="flex items-start ml-4">
            <span className="text-[#525866] text-xs mr-[7px]">PERSONS</span>
            <img
              src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Iq8V0MifpP/8a5g6trk_expires_30_days.png"
              className="w-4 h-4 mr-1 object-fill"
            />
            <span className="text-[#040E1B] text-xs">{industry.name.toUpperCase()}</span>
          </div>

          {/* Header with Filter */}
          <div className="flex justify-between items-start self-stretch ml-4">
            <div className="flex flex-col items-start gap-2">
              <div className="flex items-center gap-1">
                <button onClick={onBack} className="cursor-pointer hover:opacity-70">
                  <img
                    src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Iq8V0MifpP/s5gimnel_expires_30_days.png"
                    className="w-8 h-8 object-fill"
                  />
                </button>
                <img
                  src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Iq8V0MifpP/3ne0aogy_expires_30_days.png"
                  className="w-4 h-4 object-fill"
                />
                <span className="text-[#040E1B] text-xl font-bold">Persons</span>
              </div>
              <span className="text-[#070810] text-sm whitespace-nowrap">
                Search through all the persons in our database
              </span>
            </div>

          </div>

          {/* Bank Cards - All Banks in Grid */}
          <div className="grid grid-cols-4 gap-6 self-stretch ml-4 mb-6">
            {entities.map((entity, idx) => (
              <button
                key={entity.id}
                onClick={() => onSelectEntity(entity)}
                className="flex flex-col items-center bg-white text-center py-9 px-[21px] gap-2 rounded-lg border border-solid border-[#D4E1EA] hover:border-[#022658] transition-colors h-[200px]"
                style={{ boxShadow: '4px 4px 4px #0708101A' }}
              >
                {entity.icon ? (
                  <img
                    src={entity.icon}
                    className="w-10 h-10 object-contain flex-shrink-0"
                    alt={entity.name}
                    onError={(e) => {
                      // Hide failed image and show initials instead
                      e.target.style.display = 'none';
                      const initialsDiv = e.target.nextSibling;
                      if (initialsDiv) initialsDiv.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div 
                  className="w-10 h-10 rounded-lg bg-[#022658] flex items-center justify-center flex-shrink-0"
                  style={{ display: entity.icon ? 'none' : 'flex' }}
                >
                  <span className="text-white text-sm font-bold">
                    {entity.name.split(' ').map(word => word[0]).join('').slice(0, 2).toUpperCase()}
                  </span>
                </div>
                <span className="text-[#040E1B] text-lg whitespace-nowrap overflow-hidden text-ellipsis w-full">
                  {entity.name}
                </span>
                <span className="text-[#525866] text-base text-center leading-tight">
                  View and track system activities of this Bank.
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonsEntitySelector;

