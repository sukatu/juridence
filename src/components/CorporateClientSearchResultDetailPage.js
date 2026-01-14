import React, { useState } from 'react';
import { ChevronRight, ChevronLeft, Building2, Users, FileText, Database, ArrowRight, Download } from 'lucide-react';
import CorporateClientRequestAdditionalSearchPage from './CorporateClientRequestAdditionalSearchPage';

const CorporateClientSearchResultDetailPage = ({ person, onBack }) => {
  const [showRequestSearch, setShowRequestSearch] = useState(false);

  const userInfo = JSON.parse(localStorage.getItem('userData') || '{}');
  const organizationName = userInfo?.organization || 'Access Bank';

  // Default person data
  const personData = {
    name: person?.name || 'Atta Annan',
    riskScore: 4,
    riskLevel: 'Low risk',
    status: 'Active',
    age: 49,
    occupation: 'Corporate Communications Manager',
    dob: '05/05/1976',
    placeOfBirth: 'Kumasi, Ghana',
    phone: '+233445556666',
    email: 'atannan21@gmail.com',
    tin: 'B009372287278',
    maritalStatus: 'Married',
    education: 'MBA, University of Lagon\nMSc, KNUST, BSc, UG',
    placeOfBusiness: 'Zephyr Energy Group',
    buildingNumber: '45, Greenway Avenue',
    landmark: 'Behind Excellence Hotel',
    city: 'Accra',
    district: 'Accra',
    region: 'Greater Accra',
    country: 'Ghana',
    poBox: 'GA-183-8164',
    businessPhone: '+233445556666',
    businessEmail: 'ecowindcorp@gmail.com',
    lastUpdated: 'Friday, August 06, 2025',
    affiliations: [
      {
        relationship: 'Wife',
        affiliate: 'Mary Annan',
        entity: 'Individual',
        tin: 'D109372287278',
        status: 'Married',
        riskLevel: '0 - Low'
      },
      {
        relationship: 'Brother',
        affiliate: 'Elijah Annan',
        entity: 'Individual',
        tin: 'D109372287278',
        status: 'Family',
        riskLevel: '0 - Low'
      },
      {
        relationship: 'Director',
        affiliate: 'Volta Group',
        entity: 'Company',
        tin: 'D216372287278',
        status: 'Active',
        riskLevel: '04 - Low'
      }
    ],
    closedCases: [
      {
        caseTitle: 'Atta Annan vs. John Quaye',
        suitNo: 'CV/1089/2021',
        role: 'Plaintiff',
        court: 'District Court, Accra',
        dateFiled: 'November 8, 2021',
        outcome: 'In favor'
      }
    ],
    gazetteNotices: [
      {
        noticeType: 'Correction of Date of Birth',
        description: 'Date of birth corrected from May 5, 1975 to May 5, 1976',
        effectiveDate: 'June 20, 2008',
        gazetteIssue: 'Ghana Gazette\nNo. 25, 2008',
        publicationDate: 'June 27, 2008'
      }
    ],
    riskBreakdown: [
      {
        factor: 'Case Frequency',
        weight: '30%',
        description: 'Number of legal disputes in the past 3 years',
        entityValue: '1 cases',
        riskPoint: '2'
      },
      {
        factor: 'Case Outcomes',
        weight: '20%',
        description: 'Ratio of lost to won cases',
        entityValue: '100% won',
        riskPoint: '-'
      },
      {
        factor: 'Financial Exposure',
        weight: '20%',
        description: 'Total quantum (amount in dispute)',
        entityValue: 'GHS 1,200,000',
        riskPoint: '-'
      },
      {
        factor: 'Case Recency',
        weight: '10%',
        description: 'Time since last recorded case',
        entityValue: '4 years ago',
        riskPoint: '1'
      },
      {
        factor: 'Data Completeness',
        weight: '10%',
        description: 'Accuracy & profile completeness',
        entityValue: '90%',
        riskPoint: '1'
      },
      {
        factor: 'Total Weighted Score',
        weight: '100%',
        description: '-',
        entityValue: '-',
        riskPoint: '4'
      }
    ],
    riskIndicators: [
      {
        indicator: '🏢 Gazette Mentions',
        status: '1',
        description: 'Date of birth corrected from May 5, 1975 to May 5, 1976'
      },
      {
        indicator: '🕒 Last Legal Activity',
        status: 'Nov. 2021',
        description: 'Closed lease dispute'
      },
      {
        indicator: '💰 Total Dispute Value',
        status: 'GHS 1.2M',
        description: 'On closed case'
      }
    ],
    caseSummary: [
      {
        caseNumber: 'CM/0245/2023',
        caseType: 'Lease Dispute',
        court: 'District Court',
        status: 'Closed',
        outcome: 'Won',
        quantum: 'GHS 1.2M',
        weight: '15%'
      }
    ]
  };

  if (showRequestSearch) {
    return (
      <CorporateClientRequestAdditionalSearchPage
        person={personData}
        onBack={() => setShowRequestSearch(false)}
      />
    );
  }

  return (
    <div className="bg-[#F7F8FA] min-h-screen">
      {/* Header */}
      <div className="w-full bg-white py-3.5 px-6 mb-4">
        <div className="flex justify-between items-center">
          <div className="flex flex-col items-start gap-1">
            <span className="text-[#525866] text-xl font-medium" style={{ fontFamily: 'Poppins' }}>
              {organizationName},
            </span>
            <span className="text-[#050F1C] text-base font-normal opacity-75" style={{ fontFamily: 'Satoshi' }}>
              Track all your activities here.
            </span>
          </div>
          <div className="flex items-start flex-1 gap-4 justify-end">
            {/* Search Bar */}
            <div className="flex justify-between items-center w-[600px] pr-2 rounded-lg border border-solid border-[#050F1C] bg-white h-11">
              <input
                type="text"
                placeholder="Search companies and persons here"
                className="flex-1 self-stretch text-[#050F1C] bg-transparent text-xs py-3.5 pl-2 mr-1 border-0 outline-none"
                style={{ fontFamily: 'Satoshi' }}
              />
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 border border-[#868C98] rounded"></div>
                <span className="text-[#868C98] text-sm">|</span>
                <div className="flex items-center bg-white w-12 py-1 px-1 gap-0.5 rounded">
                  <span className="text-[#525866] text-xs font-bold" style={{ fontFamily: 'Satoshi' }}>All</span>
                  <ChevronRight className="w-3 h-3 text-[#141B34] rotate-90" />
                </div>
              </div>
            </div>
            
            {/* Notification and User Profile */}
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#F7F8FA] rounded-full border border-[#D4E1EA]">
                <div className="w-5 h-5 bg-[#022658] rounded"></div>
              </div>
              <div className="flex items-center gap-1.5">
                <img 
                  src="https://placehold.co/36x36" 
                  alt="User" 
                  className="w-9 h-9 rounded-full"
                />
                <div className="flex flex-col items-start gap-1">
                  <div className="flex items-center gap-0.5">
                    <span className="text-[#050F1C] text-base font-bold" style={{ fontFamily: 'Satoshi' }}>
                      Tonia Martins
                    </span>
                    <ChevronRight className="w-3 h-3 text-[#141B34] rotate-90" />
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-[#10B981] rounded-full"></div>
                    <span className="text-[#525866] text-xs font-normal" style={{ fontFamily: 'Satoshi' }}>Online</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 py-4 bg-white rounded-lg mx-4 mb-4">
        <div className="flex flex-col gap-6">
          {/* Breadcrumb */}
          <div className="flex items-center gap-1">
            <span className="text-[#525866] text-xs font-normal opacity-75" style={{ fontFamily: 'Satoshi' }}>
              SEARCH RESULT
            </span>
            <ChevronRight className="w-4 h-4 text-[#7B8794]" />
            <span className="text-[#070810] text-sm font-normal" style={{ fontFamily: 'Roboto' }}>
              {personData.name}
            </span>
          </div>

          {/* Profile Header */}
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-1">
              <button
                onClick={onBack}
                className="p-2 bg-[#F7F8FA] rounded-lg"
              >
                <ChevronLeft className="w-4 h-4 text-[#050F1C]" />
              </button>
              <div className="flex items-start gap-1">
                <img 
                  src="https://placehold.co/36x36" 
                  alt={personData.name}
                  className="w-9 h-9 rounded-full"
                />
                <div className="flex flex-col justify-center items-start gap-1">
                  <span className="text-[#050F1C] text-xl font-semibold" style={{ fontFamily: 'Roboto' }}>
                    {personData.name}
                  </span>
                  <span className="text-[#10B981] text-xs font-bold opacity-75" style={{ fontFamily: 'Satoshi' }}>
                    {personData.riskLevel} [{personData.riskScore}/100]
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <button
                className="w-[240px] h-[58px] px-2.5 shadow-md rounded-lg border-2 border-[#0F2847] flex items-center justify-center gap-2.5 hover:bg-gray-50"
              >
                <span className="text-[#022658] text-base font-bold" style={{ fontFamily: 'Satoshi' }}>
                  Add To Watchlist
                </span>
              </button>
              <button
                onClick={() => setShowRequestSearch(true)}
                className="w-[240px] h-[58px] px-2.5 bg-gradient-to-b from-[#022658] to-[#1A4983] shadow-md rounded-lg border-4 border-[rgba(15,40,71,0.15)] flex items-center justify-center gap-2.5 hover:opacity-90"
              >
                <span className="text-white text-base font-bold" style={{ fontFamily: 'Satoshi' }}>
                  Request Additional Search
                </span>
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="flex items-center gap-3">
            {[
              { icon: Building2, label: 'Companies affiliated with', value: '1' },
              { icon: Users, label: 'Persons affiliated with', value: '2' },
              { icon: FileText, label: 'Gazette notices', value: '1' },
              { icon: Database, label: 'Total amount of related data', value: '4' }
            ].map((stat, index) => (
              <div key={index} className="flex-1 p-2 bg-white rounded-lg border border-[#D4E1EA] flex items-center gap-3">
                <div className="p-2 bg-[#F7F8FA] rounded-lg">
                  <stat.icon className="w-6 h-6 text-[#868C98]" />
                </div>
                <div className="flex flex-col justify-center items-start gap-1">
                  <span className="text-[#868C98] text-xs font-normal" style={{ fontFamily: 'Satoshi' }}>
                    {stat.label}
                  </span>
                  <span className="text-[#F59E0B] text-base font-medium" style={{ fontFamily: 'Satoshi' }}>
                    {stat.value}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Personal Information Section */}
          <div className="p-4 bg-white rounded-lg border border-[#E4E7EB] shadow-[4px_4px_4px_rgba(7,8,16,0.10)] flex flex-col gap-4">
            <div className="pb-2 border-b border-[#D4E1EA]">
              <span className="text-[#868C98] text-xs font-normal" style={{ fontFamily: 'Satoshi' }}>
                PERSONAL INFORMATION
              </span>
            </div>
            <div className="flex flex-col gap-2">
              {[
                { label: 'Status', value: personData.status, color: '#10B981' },
                { label: 'Name', value: personData.name },
                { label: 'Age', value: personData.age },
                { label: 'Occupation', value: personData.occupation },
                { label: 'Date of birth', value: personData.dob },
                { label: 'Place of birth', value: personData.placeOfBirth },
                { label: 'Phone', value: personData.phone },
                { label: 'Email', value: personData.email },
                { label: 'TIN', value: personData.tin, isLink: true },
                { label: 'Marital status', value: personData.maritalStatus },
                { label: 'Education', value: personData.education }
              ].map((field, index) => (
                <div key={index} className="flex items-center gap-1">
                  <div className="w-[200px] text-[#050F1C] text-[10px] font-medium" style={{ fontFamily: 'Satoshi' }}>
                    {field.label}
                  </div>
                  {field.isLink ? (
                    <div className="border-b border-[#3B82F6]">
                      <span className="text-[#3B82F6] text-sm font-normal" style={{ fontFamily: 'Satoshi' }}>
                        {field.value}
                      </span>
                    </div>
                  ) : (
                    <div className="flex-1 text-[#050F1C] text-sm font-normal" style={{ fontFamily: 'Satoshi', color: field.color }}>
                      {field.value}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Place of Business & Contact */}
            <div className="flex flex-col gap-1">
              <div className="pb-2 border-b border-[#D4E1EA]">
                <span className="text-[#868C98] text-xs font-normal" style={{ fontFamily: 'Satoshi' }}>
                  PLACE OF BUSINESS & CONTACT
                </span>
              </div>
              <div className="flex flex-col gap-2">
                {[
                  { label: 'Place of Business', value: personData.placeOfBusiness },
                  { label: 'Building Number', value: personData.buildingNumber },
                  { label: 'Landmark', value: personData.landmark },
                  { label: 'City', value: personData.city },
                  { label: 'District', value: personData.district },
                  { label: 'Region', value: personData.region },
                  { label: 'Country', value: personData.country },
                  { label: 'P.O Box', value: personData.poBox },
                  { label: 'Phone', value: personData.businessPhone },
                  { label: 'Email', value: personData.businessEmail }
                ].map((field, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="w-[200px] text-[#050F1C] text-[10px] font-medium" style={{ fontFamily: 'Satoshi' }}>
                      {field.label}
                    </div>
                    <div className="flex-1 text-[#050F1C] text-sm font-normal" style={{ fontFamily: 'Satoshi' }}>
                      {field.value}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Profile */}
            <div className="flex flex-col gap-1">
              <div className="pb-2 border-b border-[#D4E1EA]">
                <span className="text-[#868C98] text-xs font-normal" style={{ fontFamily: 'Satoshi' }}>
                  PROFILE
                </span>
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-[200px] text-[#050F1C] text-[10px] font-medium" style={{ fontFamily: 'Satoshi' }}>
                    Status
                  </div>
                  <div className="flex-1 text-[#050F1C] text-sm font-normal" style={{ fontFamily: 'Satoshi' }}>
                    {personData.status}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-[200px] text-[#050F1C] text-[10px] font-medium" style={{ fontFamily: 'Satoshi' }}>
                    Last updated
                  </div>
                  <div className="flex-1 text-[#050F1C] text-sm font-normal" style={{ fontFamily: 'Satoshi' }}>
                    {personData.lastUpdated}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Affiliations Table */}
          <div className="flex flex-col gap-2">
            <span className="text-[#868C98] text-xs font-normal" style={{ fontFamily: 'Satoshi' }}>
              AFFILIATIONS
            </span>
            <div className="overflow-hidden rounded-[14px] border border-[#E5E8EC] flex flex-col">
              {/* Table Header */}
              <div className="py-4 px-4 bg-[#F4F6F9] flex items-center gap-3">
                {['Relationship', 'Affiliate', 'Entity', 'TIN', 'Status', 'Risk level'].map((header, index) => (
                  <div key={index} className={index === 0 ? 'w-[174px]' : index === 1 ? 'w-[174px]' : index === 2 ? 'w-[174px]' : index === 3 ? 'w-[174px]' : index === 4 ? 'w-[174px]' : 'w-[140px]'}>
                    <span className="text-[#070810] text-sm font-bold" style={{ fontFamily: 'Satoshi' }}>
                      {header}
                    </span>
                  </div>
                ))}
              </div>
              {/* Table Rows */}
              {personData.affiliations.map((affiliation, index) => (
                <div key={index} className="h-[70px] py-3 px-4 border-b border-[#E5E8EC] flex items-center gap-3">
                  <div className="w-[174px]">
                    <span className="text-[#070810] text-sm font-normal" style={{ fontFamily: 'Satoshi' }}>
                      {affiliation.relationship}
                    </span>
                  </div>
                  <div className="w-[174px]">
                    <span className="text-[#070810] text-sm font-normal" style={{ fontFamily: 'Satoshi' }}>
                      {affiliation.affiliate}
                    </span>
                  </div>
                  <div className="w-[174px]">
                    <span className="text-[#070810] text-sm font-normal" style={{ fontFamily: 'Satoshi' }}>
                      {affiliation.entity}
                    </span>
                  </div>
                  <div className="w-[174px]">
                    <div className="border-b border-[#3B82F6]">
                      <span className="text-[#3B82F6] text-sm font-normal" style={{ fontFamily: 'Satoshi' }}>
                        {affiliation.tin}
                      </span>
                    </div>
                  </div>
                  <div className="w-[174px]">
                    <span className="text-[#070810] text-sm font-normal" style={{ fontFamily: 'Satoshi' }}>
                      {affiliation.status}
                    </span>
                  </div>
                  <div className="w-[140px]">
                    <div className="px-2 py-1 bg-[rgba(48.52,171.63,64.94,0.10)] rounded-lg">
                      <span className="text-[#10B981] text-xs font-medium" style={{ fontFamily: 'Satoshi' }}>
                        {affiliation.riskLevel}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Cases Section */}
          <div className="flex flex-col gap-2">
            <span className="text-[#868C98] text-xs font-normal" style={{ fontFamily: 'Satoshi' }}>
              CASES
            </span>
            <div className="p-6 bg-white rounded-lg border border-[#E4E7EB] flex flex-col gap-8">
              <div className="flex flex-col gap-2">
                <span className="text-[#050F1C] text-xs font-normal" style={{ fontFamily: 'Satoshi' }}>
                  CLOSED CASES
                </span>
                <div className="overflow-hidden rounded-[14px] border border-[#E5E8EC] flex flex-col">
                  {/* Table Header */}
                  <div className="py-4 px-3 bg-[#F4F6F9] flex items-center gap-3">
                    {['Case Title', 'Suit No.', 'Role', 'Court', 'Date Filed', 'Outcome'].map((header) => (
                      <div key={header} className={header === 'Case Title' ? 'w-[200px]' : 'w-[136px]'}>
                        <span className="text-[#070810] text-sm font-bold" style={{ fontFamily: 'Satoshi' }}>
                          {header}
                        </span>
                      </div>
                    ))}
                  </div>
                  {/* Table Rows */}
                  {personData.closedCases.map((caseItem, index) => (
                    <div key={index} className="h-[70px] py-3 px-3 pr-3 border-b border-[#E5E8EC] flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-[200px]">
                          <span className="text-[#070810] text-sm font-normal" style={{ fontFamily: 'Satoshi' }}>
                            {caseItem.caseTitle}
                          </span>
                        </div>
                        <div className="w-[136px]">
                          <span className="text-[#070810] text-sm font-normal" style={{ fontFamily: 'Satoshi' }}>
                            {caseItem.suitNo}
                          </span>
                        </div>
                        <div className="w-[136px]">
                          <span className="text-[#070810] text-sm font-normal" style={{ fontFamily: 'Satoshi' }}>
                            {caseItem.role}
                          </span>
                        </div>
                        <div className="w-[136px]">
                          <span className="text-[#070810] text-sm font-normal" style={{ fontFamily: 'Satoshi' }}>
                            {caseItem.court}
                          </span>
                        </div>
                        <div className="w-[136px]">
                          <span className="text-[#070810] text-sm font-normal" style={{ fontFamily: 'Satoshi' }}>
                            {caseItem.dateFiled}
                          </span>
                        </div>
                        <div className="w-[136px]">
                          <span className="text-[#10B981] text-sm font-bold" style={{ fontFamily: 'Satoshi' }}>
                            {caseItem.outcome}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-[#022658] text-sm font-bold" style={{ fontFamily: 'Satoshi' }}>
                          View
                        </span>
                        <ArrowRight className="w-4 h-4 text-[#050F1C]" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Gazette Notices */}
          <div className="flex flex-col gap-2">
            <span className="text-[#868C98] text-xs font-normal" style={{ fontFamily: 'Satoshi' }}>
              GAZETTE NOTICES
            </span>
            <div className="overflow-hidden rounded-[14px] border border-[#E5E8EC] flex flex-col">
              {/* Table Header */}
              <div className="py-4 px-3 bg-[#F4F6F9] flex items-center gap-3">
                {['Notice type', 'Description', 'Effective date', 'Gazette issue', 'Publication Date'].map((header, index) => (
                  <div key={header} className={index === 0 ? 'w-[136px]' : index === 1 ? 'w-[280px]' : 'w-[136px]'}>
                    <span className="text-[#070810] text-sm font-bold" style={{ fontFamily: 'Satoshi' }}>
                      {header}
                    </span>
                  </div>
                ))}
              </div>
              {/* Table Rows */}
              {personData.gazetteNotices.map((notice, index) => (
                <div key={index} className="h-[80px] py-3 px-3 pr-3 border-b border-[#E5E8EC] flex items-center justify-between">
                  <div className="flex items-start gap-3">
                    <div className="w-[136px]">
                      <span className="text-[#070810] text-sm font-normal" style={{ fontFamily: 'Satoshi' }}>
                        {notice.noticeType}
                      </span>
                    </div>
                    <div className="w-[280px]">
                      <span className="text-[#070810] text-sm font-normal" style={{ fontFamily: 'Satoshi' }}>
                        {notice.description}
                      </span>
                    </div>
                    <div className="w-[136px]">
                      <span className="text-[#070810] text-sm font-normal" style={{ fontFamily: 'Satoshi' }}>
                        {notice.effectiveDate}
                      </span>
                    </div>
                    <div className="w-[136px]">
                      <span className="text-[#070810] text-sm font-normal whitespace-pre-line" style={{ fontFamily: 'Satoshi' }}>
                        {notice.gazetteIssue}
                      </span>
                    </div>
                    <div className="w-[136px]">
                      <span className="text-[#070810] text-sm font-normal" style={{ fontFamily: 'Satoshi' }}>
                        {notice.publicationDate}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-[#022658] text-sm font-bold" style={{ fontFamily: 'Satoshi' }}>
                      View
                    </span>
                    <ArrowRight className="w-4 h-4 text-[#050F1C]" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Risk Score Section */}
          <div className="flex flex-col gap-4">
            <span className="text-[#868C98] text-xs font-normal" style={{ fontFamily: 'Satoshi' }}>
              RISK SCORE
            </span>
            
            {/* Risk Score Chart and Breakdown */}
            <div className="px-6 py-6 bg-white rounded-lg border border-[#E4E7EB] shadow-[4px_4px_4px_rgba(7,8,16,0.10)] flex flex-col gap-8">
              {/* Circular Chart Placeholder */}
              <div className="relative w-full h-[439px] flex items-center justify-center">
                <div className="relative w-[340px] h-[340px] bg-white rounded-full shadow-[0px_3.1px_38.72px_rgba(0,0,0,0.08)]">
                  <div className="absolute inset-[20px] rounded-full bg-[#10B981]"></div>
                  <div className="absolute inset-[30px] rounded-full bg-white flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-[#10B981] text-lg font-bold" style={{ fontFamily: 'Poppins' }}>
                        {personData.riskScore}
                      </div>
                    </div>
                  </div>
                </div>
                {/* Risk breakdown labels */}
                <div className="absolute right-0 top-[77px] flex flex-col gap-6">
                  {[
                    { label: 'Plaintiff in case', points: '+5 points' },
                    { label: '1 won case (favorable outcome)', points: '-5 points' },
                    { label: 'Civil disputes (not criminal)', points: '+0 points' },
                    { label: 'No adverse judgments', points: '0 points' }
                  ].map((item, index) => (
                    <div key={index} className="w-[240px]">
                      <div className="text-[#050F1C] text-base font-normal" style={{ fontFamily: 'Satoshi' }}>
                        {item.label}
                      </div>
                      <div className="text-[#B1B9C6] text-lg font-bold" style={{ fontFamily: 'Poppins' }}>
                        {item.points}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="absolute left-[-45px] top-[41px] flex flex-col gap-0.5">
                  <div className="text-right text-[#10B981] text-lg font-bold" style={{ fontFamily: 'Poppins' }}>
                    +2 points
                  </div>
                  <div className="text-right text-[#050F1C] text-base font-normal" style={{ fontFamily: 'Satoshi' }}>
                    1 cases total (minimal)
                  </div>
                </div>
              </div>

              {/* Risk Score Explanation */}
              <div className="p-4 rounded-lg border border-[#D4E1EA] flex items-center gap-2">
                <div className="flex-1 flex justify-between items-center">
                  <span className="text-[#050F1C] text-base font-medium" style={{ fontFamily: 'Satoshi' }}>
                    Calculated based on case history, dispute frequency, and unresolved matters
                  </span>
                  <div className="flex items-center gap-4">
                    {[
                      { color: '#10B981', label: 'Low risk: 0-40' },
                      { color: '#DEBB0C', label: 'Moderate risk: 41-70' },
                      { color: '#EF4444', label: 'High risk: 71-100' }
                    ].map((risk, index) => (
                      <div key={index} className="flex items-center gap-1">
                        <div className="w-4 h-4 rounded-full" style={{ background: risk.color }}></div>
                        <span className="text-[#050F1C] text-sm font-normal opacity-75" style={{ fontFamily: 'Satoshi' }}>
                          {risk.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Score Breakdown Table */}
              <div className="flex flex-col gap-2">
                <span className="text-[#050F1C] text-xs font-normal" style={{ fontFamily: 'Satoshi' }}>
                  SCORE BREAKDOWN
                </span>
                <div className="overflow-hidden rounded-[14px] border border-[#E5E8EC] flex flex-col">
                  {/* Table Header */}
                  <div className="py-4 px-4 bg-[#F4F6F9] flex items-center gap-3">
                    {['Factor', 'Weight', 'Description', 'Entity value', 'Risk point'].map((header, index) => (
                      <div key={header} className={index === 0 ? 'w-[180px]' : index === 1 ? 'w-[150px]' : index === 2 ? 'w-[400px]' : 'w-[150px]'}>
                        <span className="text-[#070810] text-sm font-bold" style={{ fontFamily: 'Satoshi' }}>
                          {header}
                        </span>
                      </div>
                    ))}
                  </div>
                  {/* Table Rows */}
                  {personData.riskBreakdown.map((item, index) => (
                    <div key={index} className="py-3 px-4 border-b border-[#E5E8EC] flex items-center gap-3">
                      <div className="w-[180px]">
                        <span className="text-[#070810] text-sm font-normal" style={{ fontFamily: 'Satoshi' }}>
                          {item.factor}
                        </span>
                      </div>
                      <div className="w-[150px]">
                        <span className="text-[#070810] text-sm font-normal" style={{ fontFamily: 'Satoshi' }}>
                          {item.weight}
                        </span>
                      </div>
                      <div className="w-[400px]">
                        <span className="text-[#070810] text-sm font-normal" style={{ fontFamily: 'Satoshi' }}>
                          {item.description}
                        </span>
                      </div>
                      <div className="w-[150px]">
                        <span className="text-[#070810] text-sm font-normal" style={{ fontFamily: 'Satoshi' }}>
                          {item.entityValue}
                        </span>
                      </div>
                      <div className="w-[150px]">
                        <span className="text-[#070810] text-sm font-normal" style={{ fontFamily: 'Satoshi' }}>
                          {item.riskPoint}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Risk Indicator Table */}
              <div className="flex flex-col gap-2">
                <span className="text-[#050F1C] text-xs font-normal" style={{ fontFamily: 'Satoshi' }}>
                  RISK INDICATOR
                </span>
                <div className="overflow-hidden rounded-[14px] border border-[#E5E8EC] flex flex-col">
                  {/* Table Header */}
                  <div className="py-4 px-4 bg-[#F4F6F9] flex items-center gap-8">
                    {['Indicator', 'Status', 'Description'].map((header, index) => (
                      <div key={header} className={index === 0 ? 'w-[300px]' : index === 1 ? 'w-[200px]' : 'w-[500px]'}>
                        <span className="text-[#070810] text-sm font-bold" style={{ fontFamily: 'Satoshi' }}>
                          {header}
                        </span>
                      </div>
                    ))}
                  </div>
                  {/* Table Rows */}
                  {personData.riskIndicators.map((indicator, index) => (
                    <div key={index} className="py-3 px-4 border-b border-[#E5E8EC] flex items-center gap-8">
                      <div className="w-[300px]">
                        <span className="text-[#070810] text-sm font-normal" style={{ fontFamily: 'Satoshi' }}>
                          {indicator.indicator}
                        </span>
                      </div>
                      <div className="w-[200px]">
                        <span className="text-[#070810] text-sm font-normal" style={{ fontFamily: 'Satoshi' }}>
                          {indicator.status}
                        </span>
                      </div>
                      <div className="w-[500px]">
                        <span className="text-[#070810] text-sm font-normal" style={{ fontFamily: 'Satoshi' }}>
                          {indicator.description}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Case & Dispute Summary */}
              <div className="flex flex-col gap-2">
                <span className="text-[#050F1C] text-xs font-normal" style={{ fontFamily: 'Satoshi' }}>
                  CASE & DISPUTE SUMMARY
                </span>
                <div className="overflow-hidden rounded-[14px] border border-[#E5E8EC] flex flex-col">
                  {/* Table Header */}
                  <div className="py-4 px-3 bg-[#F4F6F9] flex items-center gap-3">
                    {['Case Number', 'Case type', 'Court', 'Status', 'Outcome', 'Quantum (GHS)', 'Weight in Risk'].map((header) => (
                      <div key={header} className="w-[136px]">
                        <span className="text-[#070810] text-sm font-bold" style={{ fontFamily: 'Satoshi' }}>
                          {header}
                        </span>
                      </div>
                    ))}
                  </div>
                  {/* Table Rows */}
                  {personData.caseSummary.map((caseItem, index) => (
                    <div key={index} className="h-[70px] py-3 px-3 flex items-center gap-3">
                      <div className="w-[136px]">
                        <span className="text-[#070810] text-sm font-normal" style={{ fontFamily: 'Satoshi' }}>
                          {caseItem.caseNumber}
                        </span>
                      </div>
                      <div className="w-[136px]">
                        <span className="text-[#070810] text-sm font-normal" style={{ fontFamily: 'Satoshi' }}>
                          {caseItem.caseType}
                        </span>
                      </div>
                      <div className="w-[136px]">
                        <span className="text-[#070810] text-sm font-normal" style={{ fontFamily: 'Satoshi' }}>
                          {caseItem.court}
                        </span>
                      </div>
                      <div className="w-[136px]">
                        <span className="text-[#070810] text-sm font-normal" style={{ fontFamily: 'Satoshi' }}>
                          {caseItem.status}
                        </span>
                      </div>
                      <div className="w-[136px]">
                        <span className="text-[#10B981] text-sm font-bold" style={{ fontFamily: 'Satoshi' }}>
                          {caseItem.outcome}
                        </span>
                      </div>
                      <div className="w-[136px]">
                        <span className="text-[#070810] text-sm font-normal" style={{ fontFamily: 'Satoshi' }}>
                          {caseItem.quantum}
                        </span>
                      </div>
                      <div className="w-[136px]">
                        <span className="text-[#050F1C] text-sm font-normal" style={{ fontFamily: 'Satoshi' }}>
                          {caseItem.weight}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Risk Score Comparison */}
              <div className="h-[100px] px-10 py-4 bg-white rounded-lg border border-[#D4E1EA] shadow-[4px_4px_4px_rgba(7,8,16,0.10)] flex justify-between items-center">
                {[
                  { label: 'Atta Annan Risk Score', value: '04', color: '#10B981' },
                  { label: 'Industry Average (Energy)', value: '40', color: '#10B981' },
                  { label: 'Top Quartile', value: '05', color: '#F59E0B' }
                ].map((item, index) => (
                  <div key={index} className="flex flex-col items-center gap-2">
                    <span className="text-center text-[#525866] text-base font-normal" style={{ fontFamily: 'Satoshi' }}>
                      {item.label}
                    </span>
                    <span className="text-lg font-medium" style={{ fontFamily: 'Poppins', color: item.color }}>
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>

              {/* Risk Score Explanation */}
              <div className="flex flex-col gap-2">
                <span className="text-[#050F1C] text-lg font-normal" style={{ fontFamily: 'Poppins' }}>
                  Risk Score Explanation
                </span>
                <div>
                  <span className="text-[#050F1C] text-base font-medium" style={{ fontFamily: 'Satoshi' }}>
                    Why Low Risk:{' '}
                  </span>
                  <span className="text-[#050F1C] text-base font-normal" style={{ fontFamily: 'Satoshi' }}>
                    Only 1 court case (low litigation frequency), Won the concluded case with judgment in his favor, Acting as plaintiff (seeking remedy, not being sued for wrongdoing), No criminal cases or regulatory violations, No pattern of losing cases or adverse judgments, Total claim values are moderate for his professional level, Long stable employment history in reputable Energy institutions
                  </span>
                </div>
                <div>
                  <span className="text-[#10B981] text-base font-medium" style={{ fontFamily: 'Satoshi' }}>
                    Recommendation:{' '}
                  </span>
                  <span className="text-[#050F1C] text-base font-normal" style={{ fontFamily: 'Satoshi' }}>
                    Suitable for credit facilities and business partnerships. Minimal legal risk profile.
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Export Report Button */}
          <div className="px-4 py-2 rounded-lg border border-[#F59E0B] flex items-center gap-1 w-fit">
            <span className="text-[#F59E0B] text-base font-medium" style={{ fontFamily: 'Satoshi' }}>
              Export Report
            </span>
            <Download className="w-4 h-4 text-[#F59E0B]" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CorporateClientSearchResultDetailPage;

