import React, { useState } from 'react';
import CorporateClientCompaniesListView from './CorporateClientCompaniesListView';
import CorporateClientChurchesPage from './CorporateClientChurchesPage';
import CorporateClientHeader from './CorporateClientHeader';

const CorporateClientCompaniesPage = ({ onSelectIndustry, userInfo, onNavigate, onLogout }) => {
  const [selectedIndustry, setSelectedIndustry] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  // Use userInfo from props or localStorage
  const displayUserInfo = userInfo || JSON.parse(localStorage.getItem('userData') || '{}');
  const organizationName = displayUserInfo?.organization || 'Access Bank';

  const handleIndustrySelect = (industry) => {
    setSelectedIndustry(industry);
    if (onSelectIndustry) {
      onSelectIndustry(industry);
    }
  };

  const handleBack = () => {
    setSelectedIndustry(null);
  };

  // Check if churches is selected
  const isChurches = selectedIndustry?.id === 'churches' || selectedIndustry?.name?.toLowerCase() === 'churches';

  // If churches is selected, show the dedicated churches page
  if (isChurches) {
    return (
      <CorporateClientChurchesPage
        userInfo={displayUserInfo}
        onBack={handleBack}
        onNavigate={onNavigate}
        onLogout={onLogout}
      />
    );
  }

  // If an industry is selected, show the companies list view
  if (selectedIndustry) {
    return (
      <CorporateClientCompaniesListView
        userInfo={displayUserInfo}
        industry={selectedIndustry}
        onBack={handleBack}
      />
    );
  }

  const industries = [
    {
      id: 'banking',
      name: 'Banking & Finance',
      description: 'View and track system activities of this industry/sector.',
      icon: '/category-icons/banking-finance.png'
    }
  ];

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
          <span className="text-[#525866] text-xs">COMPANIES</span>
          
          <div className="flex flex-col items-start gap-2">
            <span className="text-[#040E1B] text-xl">Companies</span>
            <span className="text-[#040E1B] text-base">
              Browse through all the companies in our database
            </span>
          </div>

          {/* Industry Cards - Only Banking & Finance */}
          <div className="flex items-start self-stretch gap-6">
            {industries.map((industry) => (
              <button
                key={industry.id}
                onClick={() => handleIndustrySelect(industry)}
                className="flex flex-col items-center bg-white text-left flex-1 py-[26px] px-[21px] gap-2 rounded-lg border border-solid border-[#D4E1EA] hover:border-[#022658] transition-colors"
                style={{ boxShadow: '4px 4px 4px #0708101A' }}
              >
                <img
                  src={industry.icon}
                  className="w-[60px] h-[60px] object-contain"
                  alt={industry.name}
                  onError={(e) => {
                    e.target.src = '/companies/default-company.svg';
                  }}
                />
                <span className="text-[#040E1B] text-lg">{industry.name}</span>
                <span className="text-[#525866] text-base text-center">
                  {industry.description}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CorporateClientCompaniesPage;

