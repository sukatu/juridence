import React, { useState } from 'react';
import { Bell, ChevronRight, Building2, Heart, Hammer, GraduationCap, Zap, Monitor, Home, Users, Truck, HeartHandshake, Radio, MoreHorizontal } from 'lucide-react';
import CorporateClientPersonsEntitySelector from './CorporateClientPersonsEntitySelector';
import CorporateClientHeader from './CorporateClientHeader';

const CorporateClientPersonsPage = ({ onSelectIndustry, userInfo, onNavigate, onLogout }) => {
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

  const handleEntitySelect = (entity) => {
    // Handle entity selection - can navigate to persons list
    console.log('Selected entity:', entity);
  };

  const handleBack = () => {
    setSelectedIndustry(null);
  };

  // If an industry is selected, show the entity selector
  if (selectedIndustry) {
    return (
      <CorporateClientPersonsEntitySelector
        userInfo={displayUserInfo}
        industry={selectedIndustry}
        onSelectEntity={handleEntitySelect}
        onBack={handleBack}
      />
    );
  }

  const industries = [
    {
      id: 'banking',
      name: 'Banking & Finance',
      description: 'View and track system activities of this industry/sector.',
      iconBg: '#3B82F6',
      Icon: Building2
    },
    {
      id: 'healthcare',
      name: 'Healthcare',
      description: 'View and track system activities of this industry/sector.',
      iconBg: '#EF4444',
      Icon: Heart
    },
    {
      id: 'construction',
      name: 'Construction',
      description: 'View and track system activities of this industry/sector.',
      iconBg: '#050F1C',
      Icon: Hammer
    },
    {
      id: 'education',
      name: 'Education',
      description: 'View and track system activities of this industry/sector.',
      iconBg: '#F59E0B',
      Icon: GraduationCap
    },
    {
      id: 'energy',
      name: 'Energy',
      description: 'View and track system activities of this industry/sector.',
      iconBg: '#DEBB0C',
      Icon: Zap
    },
    {
      id: 'technology',
      name: 'Technology',
      description: 'View and track system activities of this industry/sector.',
      iconBg: '#022658',
      Icon: Monitor
    },
    {
      id: 'realestate',
      name: 'Real Estate',
      description: 'View and track system activities of this industry/sector.',
      iconBg: '#10B981',
      Icon: Home
    },
    {
      id: 'hr',
      name: 'HR',
      description: 'View and track system activities of this industry/sector.',
      iconBg: '#3B82F6',
      Icon: Users
    },
    {
      id: 'transport',
      name: 'Transport',
      description: 'View and track system activities of this industry/sector.',
      iconBg: '#10B981',
      Icon: Truck
    },
    {
      id: 'ngos',
      name: 'NGOs',
      description: 'View and track system activities of this industry/sector.',
      iconBg: '#3B82F6',
      Icon: HeartHandshake
    },
    {
      id: 'media',
      name: 'Media',
      description: 'View and track system activities of this industry/sector.',
      iconBg: '#DEBB0C',
      Icon: Radio
    },
    {
      id: 'others',
      name: 'Others',
      description: 'View and track system activities of other industries/sectors.',
      iconBg: '#050F1C',
      Icon: MoreHorizontal
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
          <span className="text-[#525866] text-xs">PERSONS</span>
          
          <div className="flex flex-col items-start gap-2">
            <span className="text-[#040E1B] text-xl">Persons</span>
            <span className="text-[#040E1B] text-base">
              Browse through all the Persons in our database
            </span>
          </div>

          {/* Industry Cards - First Row */}
          <div className="flex items-start self-stretch gap-6">
            {industries.slice(0, 4).map((industry) => (
              <button
                key={industry.id}
                onClick={() => handleIndustrySelect(industry)}
                className="flex flex-col items-center bg-white text-left flex-1 py-[26px] px-[21px] gap-2 rounded-lg border border-solid border-[#D4E1EA] hover:border-[#022658] transition-colors"
                style={{ boxShadow: '4px 4px 4px #0708101A' }}
              >
                <div
                  className="p-3 rounded-xl flex justify-center items-center"
                  style={{ background: industry.iconBg }}
                >
                  <industry.Icon className="w-9 h-9 text-white" />
                </div>
                <span className="text-[#040E1B] text-lg">{industry.name}</span>
                <span className="text-[#525866] text-base text-center">
                  {industry.description}
                </span>
              </button>
            ))}
          </div>

          {/* Industry Cards - Second Row */}
          <div className="flex items-start self-stretch gap-6">
            {industries.slice(4, 8).map((industry) => (
              <button
                key={industry.id}
                onClick={() => handleIndustrySelect(industry)}
                className="flex flex-col items-center bg-white text-left flex-1 py-[26px] px-[21px] gap-2 rounded-lg border border-solid border-[#D4E1EA] hover:border-[#022658] transition-colors"
                style={{ boxShadow: '4px 4px 4px #0708101A' }}
              >
                <div
                  className="p-3 rounded-xl flex justify-center items-center"
                  style={{ background: industry.iconBg }}
                >
                  <industry.Icon className="w-9 h-9 text-white" />
                </div>
                <span className="text-[#040E1B] text-lg">{industry.name}</span>
                <span className="text-[#525866] text-base text-center">
                  {industry.description}
                </span>
              </button>
            ))}
          </div>

          {/* Industry Cards - Third Row */}
          <div className="flex items-start self-stretch gap-6">
            {industries.slice(8).map((industry) => (
              <button
                key={industry.id}
                onClick={() => handleIndustrySelect(industry)}
                className="flex flex-col items-center bg-white text-left flex-1 py-[26px] px-[21px] gap-2 rounded-lg border border-solid border-[#D4E1EA] hover:border-[#022658] transition-colors"
                style={{ boxShadow: '4px 4px 4px #0708101A' }}
              >
                <div
                  className="p-3 rounded-xl flex justify-center items-center"
                  style={{ background: industry.iconBg }}
                >
                  <industry.Icon className="w-9 h-9 text-white" />
                </div>
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

export default CorporateClientPersonsPage;

