import React, { useState } from 'react';
import AdminHeader from './AdminHeader';

const PersonsIndustrySelector = ({ userInfo, onSelectIndustry, onNavigate, onLogout }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const industries = [
    { id: 'banking', name: 'Banking & Finance', icon: 'https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Iq8V0MifpP/m902a4hv_expires_30_days.png' },
    { id: 'healthcare', name: 'Healthcare', icon: 'https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Iq8V0MifpP/w2ytahuo_expires_30_days.png' },
    { id: 'construction', name: 'Construction', icon: 'https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Iq8V0MifpP/n50awlak_expires_30_days.png' },
    { id: 'education', name: 'Education', icon: 'https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Iq8V0MifpP/txlvgiro_expires_30_days.png' },
    { id: 'energy', name: 'Energy', icon: 'https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Iq8V0MifpP/t6pt3uen_expires_30_days.png' },
    { id: 'technology', name: 'Technology', icon: 'https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Iq8V0MifpP/fvltxsyo_expires_30_days.png' },
    { id: 'realestate', name: 'Real Estate', icon: 'https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Iq8V0MifpP/1dhltgdd_expires_30_days.png' },
    { id: 'hr', name: 'HR', icon: 'https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Iq8V0MifpP/atg7vx05_expires_30_days.png' },
    { id: 'transport', name: 'Transport', icon: 'https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Iq8V0MifpP/isk1b7jf_expires_30_days.png' },
    { id: 'ngos', name: 'NGOs', icon: 'https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Iq8V0MifpP/nhjclzuh_expires_30_days.png' },
    { id: 'media', name: 'Media', icon: 'https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Iq8V0MifpP/r8dw6ncm_expires_30_days.png' },
    { id: 'others', name: 'Others', icon: 'https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Iq8V0MifpP/2zmx786p_expires_30_days.png' }
  ];

  return (
    <div className="bg-[#F7F8FA] min-h-screen">
      {/* Full Width Header */}
      <AdminHeader userInfo={userInfo} onNavigate={onNavigate} onLogout={onLogout} />

      {/* Main Content */}
      <div className="px-6">
        <div className="flex flex-col items-start bg-white pt-4 pb-[158px] px-4 gap-4 rounded-lg">
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
                onClick={() => onSelectIndustry(industry)}
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
                  View and track system activities of this industry/sector.
                </span>
              </button>
            ))}
          </div>

          {/* Industry Cards - Second Row */}
          <div className="flex items-start self-stretch gap-6">
            {industries.slice(4, 8).map((industry, idx) => (
              <button
                key={industry.id}
                onClick={() => onSelectIndustry(industry)}
                className={`flex flex-col items-center bg-white text-left flex-1 gap-2 rounded-lg border border-solid border-[#D4E1EA] hover:border-[#022658] transition-colors ${
                  idx === 0 ? 'py-[31px]' : 'py-[26px]'
                } px-[21px]`}
                style={{ boxShadow: '4px 4px 4px #0708101A' }}
              >
                <img
                  src={industry.icon}
                  className={idx === 0 ? 'w-[50px] h-[50px]' : 'w-[60px] h-[60px]'}
                  alt={industry.name}
                />
                <span className="text-[#040E1B] text-lg">{industry.name}</span>
                <span className="text-[#525866] text-base text-center">
                  View and track system activities of this industry/sector.
                </span>
              </button>
            ))}
          </div>

          {/* Industry Cards - Third Row */}
          <div className="flex items-start self-stretch gap-6">
            {industries.slice(8).map((industry) => (
              <button
                key={industry.id}
                onClick={() => onSelectIndustry(industry)}
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
                  {industry.id === 'others' 
                    ? 'View and track system activities of other industries/sectors.'
                    : 'View and track system activities of this industry/sector.'}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonsIndustrySelector;

