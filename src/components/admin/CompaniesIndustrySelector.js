import React, { useState } from 'react';
import CompaniesListView from './CompaniesListView';
import MarriageVenuesListView from './MarriageVenuesListView';
import AdminHeader from './AdminHeader';

const CompaniesIndustrySelector = ({ userInfo, onNavigate, onLogout }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState(null);

  // Check if Marriage Venues is selected
  const isMarriageVenues = selectedIndustry?.id === 'marriage-venues';

  // If Marriage Venues is selected, show marriage venues list
  if (isMarriageVenues) {
    return (
      <MarriageVenuesListView
        userInfo={userInfo}
        onBack={() => setSelectedIndustry(null)}
        onNavigate={onNavigate}
        onLogout={onLogout}
      />
    );
  }

  // If industry is selected, show companies list
  if (selectedIndustry) {
    return (
      <CompaniesListView
        userInfo={userInfo}
        industry={selectedIndustry}
        onBack={() => setSelectedIndustry(null)}
        onNavigate={onNavigate}
        onLogout={onLogout}
      />
    );
  }

  const industries = [
    { id: 'banking', name: 'Banking & Finance', icon: '/category-icons/banking-finance.png', desc: 'View and track system activities of this industry/sector.' },
    { id: 'marriage-venues', name: 'Marriage Venues', icon: '/category-icons/churches.png', desc: 'View and track system activities of this industry/sector.' }
  ];

  const handleIndustrySelect = (industry) => {
    setSelectedIndustry(industry);
  };

  return (
    <div className="bg-[#F7F8FA] min-h-screen">
      {/* Full Width Header */}
      <AdminHeader userInfo={userInfo} onNavigate={onNavigate} onLogout={onLogout} />

      {/* Main Content */}
      <div className="px-6">
        <div className="flex flex-col items-start bg-white pt-4 pb-[158px] px-3.5 gap-4 rounded-lg">
          <span className="text-[#525866] text-xs">COMPANIES</span>
          
          <div className="flex flex-col items-start gap-2">
            <span className="text-[#040E1B] text-xl">Companies</span>
            <span className="text-[#040E1B] text-base">
              Browse through all the companies in our database
            </span>
          </div>

          {/* Industry Cards */}
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
                  className="w-[60px] h-[60px] object-fill"
                  alt={industry.name}
                />
                <span className="text-[#040E1B] text-lg">{industry.name}</span>
                <span className="text-[#525866] text-base text-center">
                  {industry.desc}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompaniesIndustrySelector;

