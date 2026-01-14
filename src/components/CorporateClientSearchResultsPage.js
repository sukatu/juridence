import React, { useState } from 'react';
import { ChevronRight } from 'lucide-react';
import CorporateClientSearchResultDetailPage from './CorporateClientSearchResultDetailPage';
import CorporateClientHeader from './CorporateClientHeader';

const CorporateClientSearchResultsPage = ({ userInfo, onNavigate, onLogout }) => {
  const [searchQuery, setSearchQuery] = useState('Atta Annan');
  const [selectedResult, setSelectedResult] = useState(null);

  // Use userInfo from props or localStorage
  const displayUserInfo = userInfo || JSON.parse(localStorage.getItem('userData') || '{}');
  const organizationName = displayUserInfo?.organization || 'Access Bank';

  const searchResults = [
    {
      id: 1,
      name: 'Atta Annan',
      age: 49,
      location: '12, Coconut Ave, Accra',
      affiliations: [
        { name: 'Mary Annan', relation: 'Wife' },
        { name: 'Elijah Annan', relation: 'Brother' },
        { name: 'Volta Group', relation: 'Director' }
      ],
      contactFound: true
    },
    {
      id: 2,
      name: 'Atta Annan Sarpong',
      age: 37,
      location: '8, Waters Rd, Tamale',
      affiliations: [
        { name: 'Kofi Sarpong', relation: 'Cousin' },
        { name: 'Ama Sarpong', relation: 'Sister' },
        { name: 'Kwame Ansel', relation: 'In-Law' }
      ],
      contactFound: true
    },
    {
      id: 3,
      name: 'Atta Annan Mensah',
      age: 52,
      location: '22, Beach Rd, Takoradi',
      affiliations: [
        { name: 'Samuel Mensah', relation: 'Brother' },
        { name: 'Linda Mensah', relation: 'Sister-in-law' },
        { name: 'David Mensah', relation: 'Cousin' }
      ],
      contactFound: true
    },
    {
      id: 4,
      name: 'Atta Annan Addo',
      age: 41,
      location: '1, Liberation Rd, Kumasi',
      affiliations: [
        { name: 'John Addo', relation: 'Brother' },
        { name: 'Sarah Addo', relation: 'Cousin' }
      ],
      contactFound: true
    },
    {
      id: 5,
      name: 'Atta Annan Quaye',
      age: 55,
      location: '17, Airport Rd, Tamale',
      affiliations: [
        { name: 'James Quaye', relation: 'Brother' },
        { name: 'John Quaye', relation: 'Brother' },
        { name: 'Linda Quaye', relation: 'Sister-in-law' },
        { name: 'Daniel Quaye', relation: 'Cousin' }
      ],
      contactFound: true
    }
  ];

  const handleOpenReport = (result) => {
    setSelectedResult(result);
  };

  const handleBackToResults = () => {
    setSelectedResult(null);
  };

  // If a result is selected, show the detail page
  if (selectedResult) {
    return (
      <CorporateClientSearchResultDetailPage
        person={selectedResult}
        onBack={handleBackToResults}
      />
    );
  }

  return (
    <div className="bg-[#F7F8FA] min-h-screen">
      {/* Header */}
      <CorporateClientHeader userInfo={displayUserInfo} onNavigate={onNavigate} onLogout={onLogout} />
      
      {/* Page Title Section */}
      <div className="px-6 mb-4">
        <div className="flex flex-col items-start gap-1">
          <span className="text-[#525866] text-xl font-medium" style={{ fontFamily: 'Poppins' }}>
            {organizationName},
          </span>
          <span className="text-[#050F1C] text-base font-normal opacity-75" style={{ fontFamily: 'Satoshi' }}>
            Track all your activities here.
          </span>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="px-6">

      {/* Search Results Content */}
      <div className="px-4 py-4 bg-white rounded-lg mx-4 mb-4">
        <div className="flex flex-col gap-8">
          {/* Results Count */}
          <div className="text-center">
            <span className="text-[#022658] text-xs font-medium" style={{ fontFamily: 'Satoshi' }}>
              {searchResults.length} RESULTS READY
            </span>
          </div>

          {/* Results Table */}
          <div className="flex flex-col gap-4">
            {/* Table Header */}
            <div className="py-4 px-3 bg-[#F4F6F9] rounded-lg flex items-center gap-3">
              <div className="w-[260px] px-2">
                <span className="text-[#070810] text-sm font-bold" style={{ fontFamily: 'Satoshi' }}>Name</span>
              </div>
              <div className="w-[100px] px-2">
                <span className="text-[#070810] text-sm font-bold" style={{ fontFamily: 'Satoshi' }}>Age</span>
              </div>
              <div className="w-[230px] px-2">
                <span className="text-[#070810] text-sm font-bold" style={{ fontFamily: 'Satoshi' }}>Location</span>
              </div>
              <div className="w-[260px] px-2">
                <span className="text-[#070810] text-sm font-bold" style={{ fontFamily: 'Satoshi' }}>Affiliation</span>
              </div>
              <div className="w-[210px] px-2">
                <span className="text-[#070810] text-sm font-bold" style={{ fontFamily: 'Satoshi' }}>Full Report</span>
              </div>
            </div>

            {/* Table Rows */}
            {searchResults.map((result) => (
              <div
                key={result.id}
                className="py-4 px-3 bg-white rounded-lg border border-[#F7F8FA] shadow-[4px_4px_4px_rgba(7,8,16,0.10)] flex items-start gap-3"
              >
                {/* Name Column */}
                <div className="w-[260px] min-h-[66px] px-2 flex flex-col gap-1.5">
                  <span className="text-[#050F1C] text-lg font-medium" style={{ fontFamily: 'Poppins' }}>
                    {result.name}
                  </span>
                  {result.contactFound && (
                    <span className="text-[#050F1C] text-base font-normal" style={{ fontFamily: 'Satoshi' }}>
                      Contact found!
                    </span>
                  )}
                </div>

                {/* Age Column */}
                <div className="w-[100px] px-2 flex flex-col gap-2">
                  <span className="text-[#050F1C] text-base font-medium" style={{ fontFamily: 'Satoshi' }}>
                    {result.age}
                  </span>
                </div>

                {/* Location Column */}
                <div className="w-[230px] px-2 flex flex-col gap-2">
                  <span className="text-[#050F1C] text-base font-normal" style={{ fontFamily: 'Satoshi' }}>
                    {result.location}
                  </span>
                </div>

                {/* Affiliation Column */}
                <div className="w-[260px] px-2 flex flex-col gap-2">
                  {result.affiliations.map((affiliation, index) => (
                    <div key={index} className="flex items-center gap-1">
                      <span className="text-[#050F1C] text-sm font-medium" style={{ fontFamily: 'Satoshi' }}>
                        {affiliation.name} -
                      </span>
                      <span className="text-[#050F1C] text-xs font-normal" style={{ fontFamily: 'Satoshi' }}>
                        {affiliation.relation}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Full Report Column */}
                <div className="w-[210px] px-2 flex flex-col gap-2">
                  <button
                    onClick={() => handleOpenReport(result)}
                    className="px-2 py-1 bg-[rgba(2,38,88,0.10)] rounded-lg flex items-center justify-center gap-1.5 hover:bg-[rgba(2,38,88,0.15)] transition-colors"
                  >
                    <span className="text-[#022658] text-xs font-medium" style={{ fontFamily: 'Satoshi' }}>
                      Open Report
                    </span>
                    <ChevronRight className="w-3 h-3 text-[#022658]" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      </div>
    </div>
  );
};

export default CorporateClientSearchResultsPage;

