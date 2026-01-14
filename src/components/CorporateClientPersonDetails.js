import React, { useState } from 'react';
import { Bell, ChevronRight, ChevronLeft, Building2, Users, FileText, Database, ChevronDown, Search, Filter, ArrowUpDown } from 'lucide-react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import CorporateClientCaseDetails from './CorporateClientCaseDetails';
import CorporateClientRequestAdditionalSearchPage from './CorporateClientRequestAdditionalSearchPage';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const CorporateClientPersonDetails = ({ userInfo, industry, entity, person, onBack }) => {
  const [activeTab, setActiveTab] = useState('Personal information');
  const [selectedCase, setSelectedCase] = useState(null);
  const [showRequestSearch, setShowRequestSearch] = useState(false);

  const userName = userInfo?.first_name && userInfo?.last_name 
    ? `${userInfo.first_name} ${userInfo.last_name}` 
    : 'Tonia Martins';
  const organizationName = userInfo?.organization || 'Access Bank';

  // If request search is shown, show request page
  if (showRequestSearch) {
    return (
      <CorporateClientRequestAdditionalSearchPage
        person={person}
        onBack={() => setShowRequestSearch(false)}
      />
    );
  }

  // If a case is selected, show case details
  if (selectedCase) {
    return (
      <CorporateClientCaseDetails
        caseData={selectedCase}
        person={person}
        industry={industry}
        entity={entity}
        onBack={() => setSelectedCase(null)}
        userInfo={userInfo}
      />
    );
  }

  // Sample person data - in real app, this would come from props or API
  // Merge person prop with defaults to ensure all required properties exist
  const defaultPersonData = {
    name: 'John Kwame Louis',
    riskScore: 28,
    riskLevel: 'Low',
    companiesAffiliated: 4,
    personsAffiliated: 2,
    gazetteNotices: 3,
    totalData: 7,
    bio: {
      gender: 'Male',
      age: 47,
      occupation: 'Banker'
    },
    gazetteNoticesData: [
      {
        noticeType: 'Change of Name',
        description: 'Name changed from John Kwame Mensah (A.K.A Johnny) to John Kwame Louis',
        effectiveDate: 'January 5, 2005',
        gazetteIssue: 'Ghana Gazette\nNo. 2, 2005',
        publicationDate: 'January 14, 2005'
      },
      {
        noticeType: 'Correction of Date of Birth',
        description: 'Date of birth corrected from October 10, 1977 to October 10, 1978',
        effectiveDate: 'June 20, 2008',
        gazetteIssue: 'Ghana Gazette\nNo. 25, 2008',
        publicationDate: 'June 27, 2008'
      },
      {
        noticeType: 'Correction of Date of Birth',
        description: 'Date of birth corrected from October 10, 1977 to October 10, 1978',
        effectiveDate: 'June 20, 2008',
        gazetteIssue: 'Ghana Gazette\nNo. 25, 2008',
        publicationDate: 'June 27, 2008'
      }
    ],
    bio: {
      gender: 'Male',
      age: 47,
      occupation: 'Banker'
    },
    birthData: {
      date: 'October 10, 1978',
      location: 'Accra, Greater Accra Region'
    },
    contact: {
      phone: 'Not publicly available',
      email: 'jkwame@gmail.com'
    },
    profile: {
      status: 'Active',
      lastUpdated: 'Friday, August 06, 2025'
    },
    ongoingCases: [
      {
        title: 'JKL Ventures Ltd vs. Meridian Properties - Dispute over breach of lease agreement for commercial property',
        suitNo: 'CM/0245/2023',
        role: 'Plaintiff (as Director of JKL Ventures)',
        court: 'High Court, Accra',
        dateFiled: 'March 15, 2023',
        status: 'Ongoing',
        statusColor: 'rgba(243, 111, 38, 0.10)',
        statusTextColor: '#F59E0B',
        judge: 'Ben Carson (SAN)',
        town: 'Accra',
        region: 'Greater Accra',
        courtType: 'High Court',
        courtName: 'Domestic Jurisdiction 1',
        areaOfLaw: 'Land Law',
        expectedOutcome: 'The expected outcome of this case is a favorable judgment for JKL Ventures Ltd, where the court directs Meridian Properties to compensate the plaintiff for breach of the lease agreement and to either restore the original lease terms or provide financial restitution for the loss suffered.',
        caseSummary: 'This case revolves around a contractual dispute concerning a lease agreement for a commercial property located in Accra. JKL Ventures Ltd, through its director, contends that Meridian Properties breached the terms of the agreement by prematurely terminating the lease and failing to fulfill specific maintenance and renewal obligations stipulated in the contract. As a result, JKL Ventures claims to have suffered operational and financial setbacks due to the sudden loss of the leased premises.\n\nThe plaintiff is seeking damages amounting to GHS 150,000 and an order compelling the defendant to either honor the original lease terms or compensate for the loss incurred. The case, filed on March 15, 2023, is currently ongoing before the High Court (Commercial Division) in Accra, where preliminary hearings have focused on validating the contract and assessing the extent of the alleged breach.',
        quickDocuments: [
          { name: 'Lease_Agreement.pdf', type: 'pdf' },
          { name: 'Court_Order_0245.pdf', type: 'pdf' },
          { name: 'Gazette_1093.pdf', type: 'pdf' }
        ],
        parties: [
          {
            name: 'John Kwame Louis',
            role: 'Plaintiff',
            type: 'Company',
            contact: 'info@ecowindcorp.com',
            status: 'Active'
          },
          {
            name: 'Meridian Properties',
            role: 'Defendant',
            type: 'Company',
            contact: 'legal@meridianprops.com',
            status: 'Active'
          },
          {
            name: 'K. Owusu',
            role: 'Plaintiff\'s Counsel',
            type: 'Individual',
            contact: 'owusu@lawfirm.com',
            status: 'Active'
          },
          {
            name: 'S. Baffoe',
            role: 'Defendant\'s Counsel',
            type: 'Individual',
            contact: 'sbaffoe@firm.com',
            status: 'Active'
          }
        ],
        documents: [
          {
            date: 'Mar 15, 2023',
            fileName: 'Lease_Agreement.pdf',
            type: 'Evidence',
            submittedBy: 'Plaintiff\'s Counsel',
            documentType: 'parties'
          },
          {
            date: 'Oct 17, 2025',
            fileName: 'Court_Order_0245.pdf',
            type: 'Ruling',
            submittedBy: 'Defendant\'s Counsel',
            documentType: 'court'
          },
          {
            date: 'Oct 28, 2025',
            fileName: 'Gazette_1093.pdf',
            type: 'Gazette notice',
            submittedBy: 'Defendant\'s Counsel',
            documentType: 'court'
          }
        ]
      }
    ],
    closedCases: [
      {
        title: 'John Kwame Louis vs. SafeDrive Insurance',
        suitNo: 'CV/1089/2021',
        role: 'Plaintiff',
        court: 'Circuit Court, Accra',
        dateFiled: 'November 8, 2021',
        status: 'Judgement in favor',
        statusColor: 'transparent',
        statusTextColor: '#10B981'
      }
    ],
    currentEmployment: [
      {
        company: 'Access Bank Ghana',
        position: 'Branch Manager',
        department: 'Retail Banking Operations',
        startDate: 'March 2020',
        endDate: 'Present',
        status: 'Active',
        address: 'High Street, Accra'
      },
      {
        company: 'Access Bank Ghana',
        position: 'Snr. Relations Manager',
        department: 'Corporate banking',
        startDate: 'May 2017',
        endDate: 'March 2020',
        status: 'Inactive',
        address: 'High Street, Accra'
      }
    ],
    previousEmployment: [
      {
        company: 'Ecobank',
        position: 'Snr. Relations Manager',
        department: 'Corporate banking',
        startDate: 'June 2015',
        endDate: 'Feb. 2020',
        reasonForLeaving: 'Career advancement',
        address: 'Independence Avenue, Accra'
      },
      {
        company: 'Stanbic Bank Ghana',
        position: 'Relationship Manager',
        department: 'Commercial Banking',
        startDate: 'January 2010',
        endDate: 'May 2015',
        reasonForLeaving: 'Better compensation',
        address: 'Airport City, Accra'
      },
      {
        company: 'CalBank Limited',
        position: 'Banking Officer',
        department: 'Customer Service',
        startDate: 'August 2005',
        endDate: 'December 2009',
        reasonForLeaving: 'Promotion at new organisation',
        address: 'Osu, Accra'
      }
    ],
    affiliatedPersons: [
      {
        relationship: 'Wife',
        name: 'Esther James',
        contact: '+2334455666',
        dob: '03-11-2000',
        birthPlace: 'Accra',
        company: 'Premier college',
        position: 'Teacher',
        cases: 0,
        riskScore: 0,
        riskLevel: 'Low',
        riskColor: 'rgba(48.52, 171.63, 64.94, 0.10)',
        riskTextColor: '#10B981'
      },
      {
        relationship: 'Cousin',
        name: 'Elijah Brooks',
        contact: '+2334455666',
        dob: '03-11-2000',
        birthPlace: 'Greater Accra',
        company: 'University of Ac.',
        position: 'Lecturer',
        cases: 4,
        riskScore: 10,
        riskLevel: 'Low',
        riskColor: 'rgba(48.52, 171.63, 64.94, 0.10)',
        riskTextColor: '#10B981'
      }
    ]
  };

  // Merge person prop with defaults, ensuring all arrays and objects exist
  const personData = {
    ...defaultPersonData,
    ...person,
    bio: { ...defaultPersonData.bio, ...(person?.bio || {}) },
    birthData: { ...defaultPersonData.birthData, ...(person?.birthData || {}) },
    contact: { ...defaultPersonData.contact, ...(person?.contact || {}) },
    profile: { ...defaultPersonData.profile, ...(person?.profile || {}) },
    ongoingCases: person?.ongoingCases || defaultPersonData.ongoingCases,
    closedCases: person?.closedCases || defaultPersonData.closedCases,
    currentEmployment: person?.currentEmployment || defaultPersonData.currentEmployment,
    previousEmployment: person?.previousEmployment || defaultPersonData.previousEmployment,
    affiliatedPersons: person?.affiliatedPersons || defaultPersonData.affiliatedPersons,
    gazetteNoticesData: person?.gazetteNoticesData || defaultPersonData.gazetteNoticesData
  };

  const tabs = [
    'Personal information',
    'Employment records',
    'Affiliated persons',
    'Case list',
    'Gazzette notices',
    'Risk score'
  ];

  return (
    <div className="flex-1 bg-[#F7F8FA] pr-6 rounded-lg">
      <div className="flex items-start gap-6">
        {/* Main Content */}
        <div className="flex-1 flex flex-col bg-[#F7F8FA] pt-2 pb-[52px] gap-4">
          {/* Header */}
          <div className="flex items-center self-stretch py-2 px-1.5 gap-[50px] rounded border-b border-[#D4E1EA]">
            <div className="flex flex-col items-start w-[263px] gap-1">
              <span className="text-[#050F1C] text-xl font-medium">
                {organizationName},
              </span>
              <span className="text-[#050F1C] text-base font-normal opacity-75">
                Track all your activities here.
              </span>
            </div>
            <div className="flex items-start flex-1 gap-4">
              {/* Search Bar */}
              <div className="flex justify-between items-center flex-1 pr-2 rounded-lg border border-solid border-[#D4E1EA] bg-white h-11">
                <input
                  type="text"
                  placeholder="Search companies and persons here"
                  className="flex-1 self-stretch text-[#525866] bg-transparent text-xs py-3.5 pl-2 mr-1 border-0 outline-none"
                />
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 border border-[#868C98] rounded"></div>
                  <span className="text-[#868C98] text-sm">|</span>
                  <div className="flex items-center bg-white w-12 py-1 px-1 gap-0.5 rounded">
                    <span className="text-[#525866] text-xs font-bold">All</span>
                    <ChevronRight className="w-3 h-3 text-[#141B34] rotate-90" />
                  </div>
                </div>
              </div>
              
              {/* Notification and User Profile */}
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#F7F8FA] rounded-full border border-[#D4E1EA]">
                  <Bell className="w-5 h-5 text-[#022658]" />
                </div>
                <div className="flex items-center gap-1.5">
                  <img
                    src={userInfo?.profile_picture || '/images/image.png'}
                    alt="User"
                    className="w-9 h-9 rounded-full object-cover"
                    onError={(e) => {
                      e.target.src = '/images/image.png';
                    }}
                  />
                  <div className="flex flex-col items-start gap-1">
                    <div className="flex items-center gap-0.5">
                      <span className="text-[#050F1C] text-base font-bold whitespace-nowrap">
                        {userName}
                      </span>
                      <ChevronRight className="w-3 h-3 text-[#141B34] rotate-90" />
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-[#10B981] rounded-full"></div>
                      <span className="text-[#525866] text-xs">
                        Online
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex flex-col self-stretch flex-1 bg-white py-4 px-4 gap-6 rounded-lg">
            {/* Breadcrumb */}
            <div className="flex items-center gap-1">
              <span className="text-[#525866] text-xs font-normal opacity-75">
                PERSONS
              </span>
              <ChevronRight className="w-4 h-4 text-[#7B8794]" />
              <span className="text-[#050F1C] text-xs font-normal">
                {industry?.name?.toUpperCase() || 'BANKING & FINANCE'}
              </span>
              <ChevronRight className="w-4 h-4 text-[#7B8794]" />
              <span className="text-[#070810] text-sm font-normal" style={{ fontFamily: 'Roboto' }}>
                {entity?.name || 'Access Bank'}
              </span>
              <ChevronRight className="w-4 h-4 text-[#7B8794]" />
              <span className="text-[#070810] text-sm font-normal" style={{ fontFamily: 'Roboto' }}>
                {personData.name}
              </span>
            </div>

            {/* Person Header */}
            <div className="flex justify-between items-start self-stretch">
              <div className="flex items-center gap-1">
                <button
                  onClick={onBack}
                  className="p-2 bg-[#F7F8FA] rounded-lg hover:opacity-70"
                >
                  <ChevronLeft className="w-4 h-4 text-[#050F1C]" />
                </button>
                <img
                  src="/images/image.png"
                  alt={personData.name}
                  className="w-9 h-9 rounded-full object-cover"
                />
                <div className="flex flex-col gap-1">
                  <span className="text-[#050F1C] text-xl font-semibold" style={{ fontFamily: 'Roboto' }}>
                    {personData.name}
                  </span>
                  <span className="text-[#10B981] text-xs font-bold opacity-75">
                    {personData.riskLevel} risk [{personData.riskScore}/100]
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <button className="w-[240px] h-[58px] px-2.5 py-2.5 rounded-lg border-2 border-[#0F2847] text-[#022658] text-base font-bold hover:opacity-90 transition-opacity"
                  style={{ boxShadow: '0px 4px 4px rgba(5, 15, 28, 0.10)' }}
                >
                  Add To Watchlist
                </button>
                <button 
                  onClick={() => setShowRequestSearch(true)}
                  className="w-[240px] h-[58px] px-2.5 py-2.5 rounded-lg text-white text-base font-bold hover:opacity-90 transition-opacity"
                  style={{
                    background: 'linear-gradient(180deg, #022658 43%, #1A4983 100%)',
                    boxShadow: '0px 4px 4px rgba(5, 15, 28, 0.10)',
                    outline: '4px solid rgba(15, 40, 71, 0.15)'
                  }}
                >
                  Request Additional Search
                </button>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="flex items-center self-stretch gap-3">
              <div className="flex-1 p-2 bg-white rounded-lg border border-[#D4E1EA] flex items-center gap-3">
                <div className="p-2 bg-[#F7F8FA] rounded-lg">
                  <Building2 className="w-6 h-6 text-[#868C98]" />
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[#868C98] text-xs font-normal">
                    Companies affiliated with
                  </span>
                  <span className="text-[#F59E0B] text-base font-medium">
                    {personData.companiesAffiliated}
                  </span>
                </div>
              </div>
              <div className="flex-1 p-2 bg-white rounded-lg border border-[#D4E1EA] flex items-center gap-3">
                <div className="p-2 bg-[#F7F8FA] rounded-lg">
                  <Users className="w-6 h-6 text-[#868C98]" />
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[#868C98] text-xs font-normal">
                    Persons affiliated with
                  </span>
                  <span className="text-[#F59E0B] text-base font-medium">
                    {personData.personsAffiliated}
                  </span>
                </div>
              </div>
              <div className="flex-1 p-2 bg-white rounded-lg border border-[#D4E1EA] flex items-center gap-3">
                <div className="p-2 bg-[#F7F8FA] rounded-lg">
                  <FileText className="w-6 h-6 text-[#868C98]" />
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[#868C98] text-xs font-normal">
                    Gazettes notices
                  </span>
                  <span className="text-[#F59E0B] text-base font-medium">
                    {personData.gazetteNotices}
                  </span>
                </div>
              </div>
              <div className="flex-1 p-2 bg-white rounded-lg border border-[#D4E1EA] flex items-center gap-3">
                <div className="p-2 bg-[#F7F8FA] rounded-lg">
                  <Database className="w-6 h-6 text-[#868C98]" />
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[#868C98] text-xs font-normal">
                    Total amount of Data
                  </span>
                  <span className="text-[#F59E0B] text-base font-medium">
                    {personData.totalData}
                  </span>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex flex-col self-stretch gap-4 p-4 bg-white rounded-3xl">
              <div className="flex items-center gap-4 pb-2">
                {tabs.map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`pb-2 px-2 ${activeTab === tab ? 'border-b-4 border-[#022658]' : ''}`}
                  >
                    <span className={`text-base font-normal ${activeTab === tab ? 'text-[#022658] font-bold' : 'text-[#525866]'}`}>
                      {tab}
                    </span>
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              {activeTab === 'Personal information' && (
                <div className="flex flex-col gap-8 p-6 bg-white rounded-lg border border-[#E4E7EB]"
                  style={{ boxShadow: '4px 4px 4px rgba(7, 8, 16, 0.10)' }}
                >
                  {/* BIO Section */}
                  <div className="flex flex-col gap-4">
                    <span className="text-[#868C98] text-xs font-normal">BIO</span>
                    <div className="flex flex-col gap-2">
                      <div className="flex items-start gap-1">
                        <span className="w-20 text-[#050F1C] text-xs font-normal">Gender</span>
                        <span className="text-[#050F1C] text-base font-normal" style={{ fontFamily: 'Roboto', lineHeight: '22px' }}>
                          {personData.bio?.gender || 'N/A'}
                        </span>
                      </div>
                      <div className="flex items-start gap-1">
                        <span className="w-20 text-[#050F1C] text-xs font-normal">Age</span>
                        <span className="text-[#050F1C] text-base font-normal" style={{ fontFamily: 'Roboto', lineHeight: '22px' }}>
                          {personData.bio?.age || 'N/A'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-20 text-[#050F1C] text-[10px] font-medium">Occupation</span>
                        <span className="flex-1 text-[#050F1C] text-base font-normal">
                          {personData.bio?.occupation || 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Birth Data Section */}
                  <div className="flex flex-col gap-1">
                    <span className="text-[#525866] text-xs font-normal">Birth data</span>
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <span className="w-20 text-[#050F1C] text-[10px] font-medium">Date</span>
                        <span className="flex-1 text-[#050F1C] text-base font-normal">
                          {personData.birthData?.date || 'N/A'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-20 text-[#050F1C] text-[10px] font-medium">Location</span>
                        <span className="flex-1 text-[#050F1C] text-base font-normal">
                          {personData.birthData?.location || 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Contact Section */}
                  <div className="flex flex-col gap-1">
                    <span className="text-[#525866] text-xs font-normal">Contact</span>
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <span className="w-20 text-[#050F1C] text-[10px] font-medium">Phone</span>
                        <span className="flex-1 text-[#050F1C] text-base font-normal">
                          {personData.contact?.phone || 'N/A'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-20 text-[#050F1C] text-[10px] font-medium">Email</span>
                        <span className="flex-1 text-[#050F1C] text-base font-normal">
                          {personData.contact?.email || 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Profile Section */}
                  <div className="flex flex-col gap-1">
                    <span className="text-[#525866] text-xs font-normal">Profile</span>
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <span className="w-20 text-[#050F1C] text-[10px] font-medium">Status</span>
                        <span className="flex-1 text-[#050F1C] text-base font-normal">
                          {personData.profile?.status || 'N/A'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-20 text-[#050F1C] text-[10px] font-medium">Last updated</span>
                        <span className="flex-1 text-[#050F1C] text-base font-normal">
                          {personData.profile?.lastUpdated || 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Cases Section */}
                  <div className="flex flex-col gap-8 p-6 bg-white rounded-lg border border-[#E4E7EB]">
                    {/* Ongoing Cases */}
                    <div className="flex flex-col gap-2">
                      <span className="text-[#3B82F6] text-xs font-normal">ONGOING CASES</span>
                      <div className="overflow-hidden rounded-[14px] border border-[#E5E8EC]">
                        <div className="bg-[#F4F6F9] py-4 px-3">
                          <div className="flex items-center gap-3">
                            <div className="w-[200px] px-2">
                              <span className="text-[#070810] text-sm font-bold">Case Title</span>
                            </div>
                            <div className="w-[136px] px-2">
                              <span className="text-[#070810] text-sm font-bold">Suit No.</span>
                            </div>
                            <div className="w-[136px] px-2">
                              <span className="text-[#070810] text-sm font-bold">Role</span>
                            </div>
                            <div className="w-[136px] px-2">
                              <span className="text-[#070810] text-sm font-bold">Court</span>
                            </div>
                            <div className="w-[136px] px-2">
                              <span className="text-[#070810] text-sm font-bold">Date Filed</span>
                            </div>
                            <div className="w-[136px] px-2">
                              <span className="text-[#070810] text-sm font-bold">Status</span>
                            </div>
                          </div>
                        </div>
                        <div className="bg-white">
                          {(personData.ongoingCases || []).map((caseItem, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between gap-3 py-3 px-3 pr-3"
                              style={{
                                borderBottom: index < personData.ongoingCases.length - 1 ? '0.40px solid #E5E8EC' : 'none'
                              }}
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-[200px] px-2">
                                  <span className="text-[#070810] text-sm font-normal">{caseItem.title}</span>
                                </div>
                                <div className="w-[136px] px-2">
                                  <span className="text-[#070810] text-sm font-normal">{caseItem.suitNo}</span>
                                </div>
                                <div className="w-[136px] px-2">
                                  <span className="text-[#070810] text-sm font-normal">{caseItem.role}</span>
                                </div>
                                <div className="w-[136px] px-2">
                                  <span className="text-[#070810] text-sm font-normal">{caseItem.court}</span>
                                </div>
                                <div className="w-[136px] px-2">
                                  <span className="text-[#070810] text-sm font-normal">{caseItem.dateFiled}</span>
                                </div>
                                <div className="w-[136px] px-2">
                                  <div
                                    className="px-2 py-1 rounded-lg inline-block"
                                    style={{
                                      background: caseItem.statusColor,
                                      width: '90px'
                                    }}
                                  >
                                    <span
                                      className="text-xs font-medium"
                                      style={{ color: caseItem.statusTextColor }}
                                    >
                                      {caseItem.status}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <button 
                                onClick={() => setSelectedCase(caseItem)}
                                className="flex items-center gap-1 text-[#022658] text-sm font-bold hover:opacity-70"
                              >
                                <span>View</span>
                                <ChevronRight className="w-4 h-4 text-[#050F1C]" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Closed Cases */}
                    <div className="flex flex-col gap-2">
                      <span className="text-[#050F1C] text-xs font-normal">CLOSED CASES</span>
                      <div className="overflow-hidden rounded-[14px] border border-[#E5E8EC]">
                        <div className="bg-[#F4F6F9] py-4 px-3">
                          <div className="flex items-center gap-3">
                            <div className="w-[200px] px-2">
                              <span className="text-[#070810] text-sm font-bold">Case Title</span>
                            </div>
                            <div className="w-[136px] px-2">
                              <span className="text-[#070810] text-sm font-bold">Suit No.</span>
                            </div>
                            <div className="w-[136px] px-2">
                              <span className="text-[#070810] text-sm font-bold">Role</span>
                            </div>
                            <div className="w-[136px] px-2">
                              <span className="text-[#070810] text-sm font-bold">Court</span>
                            </div>
                            <div className="w-[136px] px-2">
                              <span className="text-[#070810] text-sm font-bold">Date Filed</span>
                            </div>
                            <div className="w-[136px] px-2">
                              <span className="text-[#070810] text-sm font-bold">Status</span>
                            </div>
                          </div>
                        </div>
                        <div className="bg-white">
                          {(personData.closedCases || []).map((caseItem, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between gap-3 py-3 px-3 pr-3"
                              style={{
                                borderBottom: index < personData.closedCases.length - 1 ? '0.40px solid #E5E8EC' : 'none'
                              }}
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-[200px] px-2">
                                  <span className="text-[#070810] text-sm font-normal">{caseItem.title}</span>
                                </div>
                                <div className="w-[136px] px-2">
                                  <span className="text-[#070810] text-sm font-normal">{caseItem.suitNo}</span>
                                </div>
                                <div className="w-[136px] px-2">
                                  <span className="text-[#070810] text-sm font-normal">{caseItem.role}</span>
                                </div>
                                <div className="w-[136px] px-2">
                                  <span className="text-[#070810] text-sm font-normal">{caseItem.court}</span>
                                </div>
                                <div className="w-[136px] px-2">
                                  <span className="text-[#070810] text-sm font-normal">{caseItem.dateFiled}</span>
                                </div>
                                <div className="w-[136px] px-2">
                                  <span
                                    className="text-sm font-bold"
                                    style={{ color: caseItem.statusTextColor }}
                                  >
                                    {caseItem.status}
                                  </span>
                                </div>
                              </div>
                              <button 
                                onClick={() => setSelectedCase(caseItem)}
                                className="flex items-center gap-1 text-[#022658] text-sm font-bold hover:opacity-70"
                              >
                                <span>View</span>
                                <ChevronRight className="w-4 h-4 text-[#050F1C]" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Export Button */}
                  <button className="h-8 px-4 py-2 rounded-lg border border-[#F59E0B] text-[#F59E0B] text-base font-medium flex items-center gap-1 hover:opacity-70 w-fit">
                    <span>Export</span>
                    <ChevronDown className="w-4 h-4 text-[#F59E0B]" />
                  </button>
                </div>
              )}

              {/* Employment records tab */}
              {activeTab === 'Employment records' && (
                <div className="flex flex-col gap-8 p-6 bg-white rounded-lg border border-[#E4E7EB]"
                  style={{ boxShadow: '4px 4px 4px rgba(7, 8, 16, 0.10)' }}
                >
                  {/* Current Employment Section */}
                  <div className="flex flex-col gap-2">
                    <span className="text-[#3B82F6] text-xs font-normal">CURRENT EMPLOYMENT</span>
                    <div className="overflow-hidden rounded-[14px] border border-[#E5E8EC]">
                      <div className="bg-[#F4F6F9] py-4 px-3">
                        <div className="flex items-center gap-3">
                          <div className="w-[136px] px-2">
                            <span className="text-[#070810] text-sm font-bold">Company</span>
                          </div>
                          <div className="w-[136px] px-2">
                            <span className="text-[#070810] text-sm font-bold">Position(s)</span>
                          </div>
                          <div className="w-[136px] px-2">
                            <span className="text-[#070810] text-sm font-bold">Department</span>
                          </div>
                          <div className="w-[136px] px-2">
                            <span className="text-[#070810] text-sm font-bold">Start date</span>
                          </div>
                          <div className="w-[136px] px-2">
                            <span className="text-[#070810] text-sm font-bold">End date</span>
                          </div>
                          <div className="w-[136px] px-2">
                            <span className="text-[#070810] text-sm font-bold">Status</span>
                          </div>
                          <div className="w-[136px] px-2">
                            <span className="text-[#070810] text-sm font-bold">Address</span>
                          </div>
                        </div>
                      </div>
                      <div className="bg-white">
                        {(personData.currentEmployment || []).map((employment, index, array) => (
                          <div
                            key={index}
                            className="flex items-center gap-3 py-3 px-3"
                            style={{
                              borderBottom: index < array.length - 1 ? '0.40px solid #E5E8EC' : 'none',
                              height: '70px'
                            }}
                          >
                            <div className="w-[136px] px-2">
                              <span className="text-[#070810] text-sm font-normal">{employment.company}</span>
                            </div>
                            <div className="w-[136px] px-2">
                              <span className="text-[#070810] text-sm font-normal">{employment.position}</span>
                            </div>
                            <div className="w-[136px] px-2">
                              <span className="text-[#070810] text-sm font-normal">{employment.department}</span>
                            </div>
                            <div className="w-[136px] px-2">
                              <span className="text-[#070810] text-sm font-normal">{employment.startDate}</span>
                            </div>
                            <div className="w-[136px] px-2">
                              <span className="text-[#070810] text-sm font-normal">{employment.endDate}</span>
                            </div>
                            <div className="w-[136px] px-2">
                              <span className="text-[#070810] text-sm font-normal">{employment.status}</span>
                            </div>
                            <div className="w-[120px] px-2">
                              <span className="text-[#070810] text-sm font-normal">{employment.address}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Previous Employment Section */}
                  <div className="flex flex-col gap-2">
                    <span className="text-[#050F1C] text-xs font-normal">PREVIOUS EMPLOYMENTS</span>
                    <div className="overflow-hidden rounded-[14px] border border-[#E5E8EC]">
                      <div className="bg-[#F4F6F9] py-4 px-3">
                        <div className="flex items-center gap-3">
                          <div className="w-[136px] px-2">
                            <span className="text-[#070810] text-sm font-bold">Company</span>
                          </div>
                          <div className="w-[136px] px-2">
                            <span className="text-[#070810] text-sm font-bold">Position(s)</span>
                          </div>
                          <div className="w-[136px] px-2">
                            <span className="text-[#070810] text-sm font-bold">Department</span>
                          </div>
                          <div className="w-[136px] px-2">
                            <span className="text-[#070810] text-sm font-bold">Start date</span>
                          </div>
                          <div className="w-[136px] px-2">
                            <span className="text-[#070810] text-sm font-bold">End date</span>
                          </div>
                          <div className="w-[136px] px-2">
                            <span className="text-[#070810] text-sm font-bold">Reason for Leaving</span>
                          </div>
                          <div className="w-[136px] px-2">
                            <span className="text-[#070810] text-sm font-bold">Address</span>
                          </div>
                        </div>
                      </div>
                      <div className="bg-white">
                        {(personData.previousEmployment || []).map((employment, index, array) => (
                          <div
                            key={index}
                            className="flex items-center gap-3 py-3 px-3"
                            style={{
                              borderBottom: index < array.length - 1 ? '0.40px solid #E5E8EC' : 'none',
                              height: '70px'
                            }}
                          >
                            <div className="w-[136px] px-2">
                              <span className="text-[#070810] text-sm font-normal">{employment.company}</span>
                            </div>
                            <div className="w-[136px] px-2">
                              <span className="text-[#070810] text-sm font-normal">{employment.position}</span>
                            </div>
                            <div className="w-[136px] px-2">
                              <span className="text-[#070810] text-sm font-normal">{employment.department}</span>
                            </div>
                            <div className="w-[136px] px-2">
                              <span className="text-[#070810] text-sm font-normal">{employment.startDate}</span>
                            </div>
                            <div className="w-[136px] px-2">
                              <span className="text-[#070810] text-sm font-normal">{employment.endDate}</span>
                            </div>
                            <div className="w-[136px] px-2">
                              <span className="text-[#070810] text-sm font-normal">{employment.reasonForLeaving}</span>
                            </div>
                            <div className="w-[120px] px-2">
                              <span className="text-[#070810] text-sm font-normal">{employment.address}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Export Button */}
                  <button className="h-8 px-4 py-2 rounded-lg border border-[#F59E0B] text-[#F59E0B] text-base font-medium flex items-center gap-1 hover:opacity-70 w-fit">
                    <span>Export</span>
                    <ChevronDown className="w-4 h-4 text-[#F59E0B]" />
                  </button>
                </div>
              )}

              {/* Affiliated persons tab */}
              {activeTab === 'Affiliated persons' && (
                <div className="flex flex-col gap-4 p-4 bg-white rounded-3xl">
                  {/* Search and Filter Section */}
                  <div className="flex justify-between items-start self-stretch">
                    <div className="flex-1 relative">
                      <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                        <Search className="w-3 h-3 text-[#868C98]" />
                      </div>
                      <input
                        type="text"
                        placeholder="Search Person"
                        className="w-full py-2 pl-10 pr-3 bg-[#F7F8FA] rounded-[5.80px] border border-[#F7F8FA] text-[#868C98] text-[10px] font-normal outline-none"
                      />
                    </div>
                    <div className="flex items-start gap-8">
                      <div className="flex items-center gap-1.5">
                        <button className="px-2.5 py-2 rounded border border-[#D4E1EA] flex items-center gap-1.5 hover:opacity-70">
                          <Filter className="w-3 h-3 text-[#868C98]" />
                          <span className="text-[#525866] text-xs font-normal">Filter</span>
                        </button>
                        <button className="px-2.5 py-2 rounded border border-[#D4E1EA] flex items-center gap-1.5 hover:opacity-70">
                          <ArrowUpDown className="w-3 h-3 text-[#868C98]" />
                          <span className="text-[#525866] text-xs font-normal">Sort</span>
                        </button>
                      </div>
                      <button className="h-8 px-4 py-2 rounded-lg border border-[#F59E0B] text-[#F59E0B] text-base font-medium flex items-center gap-1 hover:opacity-70">
                        <span>Export list</span>
                        <ChevronDown className="w-4 h-4 text-[#F59E0B]" />
                      </button>
                    </div>
                  </div>

                  {/* Table */}
                  <div className="overflow-hidden rounded-[14px] border border-[#E5E8EC] w-full">
                    {/* Table Header */}
                    <div className="bg-[#F4F6F9] py-4 px-3">
                      <div className="flex items-center gap-3 w-full">
                        <div className="w-[105px] px-2">
                          <span className="text-[#070810] text-sm font-bold">Relationship</span>
                        </div>
                        <div className="w-[105px] px-2">
                          <span className="text-[#070810] text-sm font-bold">Name</span>
                        </div>
                        <div className="w-[105px] px-2">
                          <span className="text-[#070810] text-sm font-bold">Contact</span>
                        </div>
                        <div className="w-[105px] px-2">
                          <span className="text-[#070810] text-sm font-bold">D-O-B</span>
                        </div>
                        <div className="w-[105px] px-2">
                          <span className="text-[#070810] text-sm font-bold">Birth place</span>
                        </div>
                        <div className="w-[105px] px-2">
                          <span className="text-[#070810] text-sm font-bold">Company</span>
                        </div>
                        <div className="w-[105px] px-2">
                          <span className="text-[#070810] text-sm font-bold">Position</span>
                        </div>
                        <div className="w-[105px] px-2">
                          <span className="text-[#070810] text-sm font-bold">Cases</span>
                        </div>
                        <div className="w-[105px] px-2 flex justify-center">
                          <span className="text-[#070810] text-sm font-bold">Risk score</span>
                        </div>
                      </div>
                    </div>

                    {/* Table Body */}
                    <div className="bg-white w-full">
                      {(personData.affiliatedPersons || []).map((person, index, array) => (
                        <div
                          key={index}
                          className="flex items-center gap-3 py-3 px-3 w-full"
                          style={{
                            borderBottom: index < array.length - 1 ? '0.40px solid #E5E8EC' : 'none'
                          }}
                        >
                          <div className="w-[105px] px-2">
                            <span className="text-[#070810] text-sm font-normal">{person.relationship}</span>
                          </div>
                          <div className="w-[105px] px-2">
                            <span className="text-[#070810] text-sm font-normal">{person.name}</span>
                          </div>
                          <div className="w-[105px] px-2">
                            <span className="text-[#070810] text-sm font-normal">{person.contact}</span>
                          </div>
                          <div className="w-[105px] px-2">
                            <span className="text-[#070810] text-sm font-normal">{person.dob}</span>
                          </div>
                          <div className="w-[105px] px-2">
                            <span className="text-[#070810] text-sm font-normal">{person.birthPlace}</span>
                          </div>
                          <div className="w-[105px] px-2">
                            <span className="text-[#070810] text-sm font-normal">{person.company}</span>
                          </div>
                          <div className="w-[105px] px-2">
                            <span className="text-[#070810] text-sm font-normal">{person.position}</span>
                          </div>
                          <div className="w-[105px] px-2">
                            <span className="text-[#070810] text-sm font-normal">{person.cases}</span>
                          </div>
                          <div className="w-[105px] px-2 flex justify-center">
                            <div
                              className="px-2 py-1 rounded-lg"
                              style={{
                                background: person.riskColor,
                                width: '90px'
                              }}
                            >
                              <span
                                className="text-xs font-medium"
                                style={{ color: person.riskTextColor }}
                              >
                                {person.riskScore} - {person.riskLevel}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Case list tab */}
              {activeTab === 'Case list' && (
                <div className="flex flex-col gap-8 p-6 bg-white rounded-lg border border-[#E4E7EB]"
                  style={{ boxShadow: '4px 4px 4px rgba(7, 8, 16, 0.10)' }}
                >
                  {/* Ongoing Cases Section */}
                  <div className="flex flex-col gap-2">
                    <span className="text-[#3B82F6] text-xs font-normal">ONGOING CASES</span>
                    <div className="overflow-hidden rounded-[14px] border border-[#E5E8EC]">
                      <div className="bg-[#F4F6F9] py-4 px-3">
                        <div className="flex items-center gap-3">
                          <div className="w-[200px] px-2">
                            <span className="text-[#070810] text-sm font-bold">Case Title</span>
                          </div>
                          <div className="w-[136px] px-2">
                            <span className="text-[#070810] text-sm font-bold">Suit No.</span>
                          </div>
                          <div className="w-[136px] px-2">
                            <span className="text-[#070810] text-sm font-bold">Role</span>
                          </div>
                          <div className="w-[136px] px-2">
                            <span className="text-[#070810] text-sm font-bold">Court</span>
                          </div>
                          <div className="w-[136px] px-2">
                            <span className="text-[#070810] text-sm font-bold">Date Filed</span>
                          </div>
                          <div className="w-[136px] px-2">
                            <span className="text-[#070810] text-sm font-bold">Status</span>
                          </div>
                        </div>
                      </div>
                      <div className="bg-white">
                        {(personData.ongoingCases || []).map((caseItem, index, array) => (
                          <div
                            key={index}
                            className="flex items-center justify-between gap-3 py-3 px-3 pr-3"
                            style={{
                              borderBottom: index < array.length - 1 ? '0.40px solid #E5E8EC' : 'none',
                              height: '70px'
                            }}
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-[200px] px-2">
                                <span className="text-[#070810] text-sm font-normal">{caseItem.title}</span>
                              </div>
                              <div className="w-[136px] px-2">
                                <span className="text-[#070810] text-sm font-normal">{caseItem.suitNo}</span>
                              </div>
                              <div className="w-[136px] px-2">
                                <span className="text-[#070810] text-sm font-normal">{caseItem.role}</span>
                              </div>
                              <div className="w-[136px] px-2">
                                <span className="text-[#070810] text-sm font-normal">{caseItem.court}</span>
                              </div>
                              <div className="w-[136px] px-2">
                                <span className="text-[#070810] text-sm font-normal">{caseItem.dateFiled}</span>
                              </div>
                              <div className="w-[136px] px-2">
                                <div
                                  className="px-2 py-1 rounded-lg inline-block"
                                  style={{
                                    background: caseItem.statusColor,
                                    width: '90px'
                                  }}
                                >
                                  <span
                                    className="text-xs font-medium"
                                    style={{ color: caseItem.statusTextColor }}
                                  >
                                    {caseItem.status}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <button 
                              onClick={() => setSelectedCase(caseItem)}
                              className="flex items-center gap-1 text-[#022658] text-sm font-bold hover:opacity-70"
                            >
                              <span>View</span>
                              <ChevronRight className="w-4 h-4 text-[#050F1C]" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Closed Cases Section */}
                  <div className="flex flex-col gap-2">
                    <span className="text-[#050F1C] text-xs font-normal">CLOSED CASES</span>
                    <div className="overflow-hidden rounded-[14px] border border-[#E5E8EC]">
                      <div className="bg-[#F4F6F9] py-4 px-3">
                        <div className="flex items-center gap-3">
                          <div className="w-[200px] px-2">
                            <span className="text-[#070810] text-sm font-bold">Case Title</span>
                          </div>
                          <div className="w-[136px] px-2">
                            <span className="text-[#070810] text-sm font-bold">Suit No.</span>
                          </div>
                          <div className="w-[136px] px-2">
                            <span className="text-[#070810] text-sm font-bold">Role</span>
                          </div>
                          <div className="w-[136px] px-2">
                            <span className="text-[#070810] text-sm font-bold">Court</span>
                          </div>
                          <div className="w-[136px] px-2">
                            <span className="text-[#070810] text-sm font-bold">Date Filed</span>
                          </div>
                          <div className="w-[136px] px-2">
                            <span className="text-[#070810] text-sm font-bold">Status</span>
                          </div>
                        </div>
                      </div>
                      <div className="bg-white">
                        {(personData.closedCases || []).map((caseItem, index, array) => (
                          <div
                            key={index}
                            className="flex items-center justify-between gap-3 py-3 px-3 pr-3"
                            style={{
                              borderBottom: index < array.length - 1 ? '0.40px solid #E5E8EC' : 'none',
                              height: '70px'
                            }}
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-[200px] px-2">
                                <span className="text-[#070810] text-sm font-normal">{caseItem.title}</span>
                              </div>
                              <div className="w-[136px] px-2">
                                <span className="text-[#070810] text-sm font-normal">{caseItem.suitNo}</span>
                              </div>
                              <div className="w-[136px] px-2">
                                <span className="text-[#070810] text-sm font-normal">{caseItem.role}</span>
                              </div>
                              <div className="w-[136px] px-2">
                                <span className="text-[#070810] text-sm font-normal">{caseItem.court}</span>
                              </div>
                              <div className="w-[136px] px-2">
                                <span className="text-[#070810] text-sm font-normal">{caseItem.dateFiled}</span>
                              </div>
                              <div className="w-[136px] px-2">
                                <span
                                  className="text-sm font-bold"
                                  style={{ color: caseItem.statusTextColor }}
                                >
                                  {caseItem.status}
                                </span>
                              </div>
                            </div>
                            <button 
                              onClick={() => setSelectedCase(caseItem)}
                              className="flex items-center gap-1 text-[#022658] text-sm font-bold hover:opacity-70"
                            >
                              <span>View</span>
                              <ChevronRight className="w-4 h-4 text-[#050F1C]" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Export Button */}
                  <button className="h-8 px-4 py-2 rounded-lg border border-[#F59E0B] text-[#F59E0B] text-base font-medium flex items-center gap-1 hover:opacity-70 w-fit">
                    <span>Export</span>
                    <ChevronDown className="w-4 h-4 text-[#F59E0B]" />
                  </button>
                </div>
              )}

              {/* Gazzette notices tab */}
              {activeTab === 'Gazzette notices' && (
                <div className="p-6 bg-white rounded-lg border border-[#E4E7EB]"
                  style={{ boxShadow: '4px 4px 4px rgba(7, 8, 16, 0.10)' }}
                >
                  <div className="overflow-hidden rounded-[14px] border border-[#E5E8EC]">
                    <div className="bg-[#F4F6F9] py-4 px-3">
                      <div className="flex items-center gap-3">
                        <div className="w-[136px] px-2">
                          <span className="text-[#070810] text-sm font-bold">Notice type</span>
                        </div>
                        <div className="w-[280px] px-2">
                          <span className="text-[#070810] text-sm font-bold">Description</span>
                        </div>
                        <div className="w-[136px] px-2">
                          <span className="text-[#070810] text-sm font-bold">Effective date</span>
                        </div>
                        <div className="w-[136px] px-2">
                          <span className="text-[#070810] text-sm font-bold">Gazette issue</span>
                        </div>
                        <div className="w-[136px] px-2">
                          <span className="text-[#070810] text-sm font-bold">Publication Date</span>
                        </div>
                      </div>
                    </div>
                    <div className="bg-white">
                      {(personData.gazetteNoticesData || []).map((notice, index, array) => (
                        <div
                          key={index}
                          className="flex items-center justify-between gap-3 py-3 px-3 pr-3"
                          style={{
                            borderBottom: index < array.length - 1 ? '0.40px solid #E5E8EC' : 'none',
                            height: '80px'
                          }}
                        >
                          <div className="flex items-start gap-3">
                            <div className="w-[136px] px-2">
                              <span className="text-[#070810] text-sm font-normal">{notice.noticeType}</span>
                            </div>
                            <div className="w-[280px] px-2 flex-1">
                              <span className="text-[#070810] text-sm font-normal">{notice.description}</span>
                            </div>
                            <div className="w-[136px] px-2">
                              <span className="text-[#070810] text-sm font-normal">{notice.effectiveDate}</span>
                            </div>
                            <div className="w-[136px] px-2">
                              <span className="text-[#070810] text-sm font-normal whitespace-pre-line">{notice.gazetteIssue}</span>
                            </div>
                            <div className="w-[136px] px-2">
                              <span className="text-[#070810] text-sm font-normal">{notice.publicationDate}</span>
                            </div>
                          </div>
                          <button className="flex items-center gap-1 text-[#022658] text-sm font-bold hover:opacity-70">
                            <span>View</span>
                            <ChevronRight className="w-4 h-4 text-[#050F1C]" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Risk score tab */}
              {activeTab === 'Risk score' && (
                <div className="p-4 bg-white rounded-3xl flex flex-col gap-4">
                  {/* Tab Header with Recalculate Button */}
                  <div className="flex justify-between items-center">
                    <div className="flex-1"></div>
                    <button className="w-[260px] h-9 px-2.5 py-2.5 bg-gradient-to-b from-[#022658] via-[#022658] to-[#1A4983] rounded-lg shadow-md border-4 border-[rgba(15,40,71,0.15)] flex items-center justify-center gap-2.5">
                      <span className="text-white text-base font-bold">Recalculate Risk score</span>
                    </button>
                  </div>

                  {/* Info Cards */}
                  <div className="px-8 py-4 bg-[#F4F6F9] rounded-lg flex items-center justify-between">
                    <div className="w-[200px] px-2 border-r border-[#D4E1EA]">
                      <div className="flex flex-col gap-2">
                        <span className="text-[#868C98] text-xs font-normal">Company ID</span>
                        <span className="text-[#022658] text-base font-medium">CMP_00215</span>
                      </div>
                    </div>
                    <div className="w-[200px] px-2 border-r border-[#D4E1EA]">
                      <div className="flex flex-col gap-2">
                        <span className="text-[#868C98] text-xs font-normal">Industry</span>
                        <span className="text-[#022658] text-base font-medium">Renewable energy</span>
                      </div>
                    </div>
                    <div className="w-[200px] px-2 border-r border-[#D4E1EA]">
                      <div className="flex flex-col gap-2">
                        <span className="text-[#868C98] text-xs font-normal">Registered Address</span>
                        <span className="text-[#022658] text-base font-medium">Accra, Ghana</span>
                      </div>
                    </div>
                    <div className="w-[200px] px-2 border-r border-[#D4E1EA]">
                      <div className="flex flex-col gap-2">
                        <span className="text-[#868C98] text-xs font-normal">Last updated</span>
                        <span className="text-[#022658] text-base font-medium">Oct 30th, 2025</span>
                      </div>
                    </div>
                    <div className="w-[200px] px-2">
                      <div className="flex flex-col gap-2">
                        <span className="text-[#868C98] text-xs font-normal">Risk score</span>
                        <span className="text-[#EF4444] text-base font-medium">90/100</span>
                      </div>
                    </div>
                  </div>

                  {/* Circular Chart Section */}
                  <div className="p-6 bg-white rounded-2xl border border-[#E4E7EB] flex flex-col gap-4"
                    style={{ boxShadow: '4px 4px 4px rgba(7, 8, 16, 0.10)' }}
                  >
                    <div className="relative w-full h-[439px] flex items-center justify-center">
                      {/* Left Labels with Connector Lines */}
                      <div className="absolute left-0 top-[77px] flex flex-col gap-6 w-[248px] relative">
                        <div className="flex flex-col items-end gap-0.5">
                          <span className="text-[#10B981] text-lg font-bold">+8 points</span>
                          <span className="text-[#050F1C] text-base text-right">GHS 185,000 total exposure (moderate)</span>
                        </div>
                        <div className="flex flex-col items-end gap-0.5">
                          <span className="text-[#3B82F6] text-lg font-bold">+10 points</span>
                          <span className="text-[#050F1C] text-base text-right">2 cases total (minimal)</span>
                        </div>
                        <div className="flex flex-col items-end gap-0.5">
                          <span className="text-[#3B82F6] text-lg font-bold">+10 points</span>
                          <span className="text-[#050F1C] text-base text-right">1 active case (ongoing risk)</span>
                        </div>
                        {/* Connector Lines - positioned relative to chart center */}
                        <div className="absolute right-0 top-[34px] w-[126px] h-[29px] border-b-2 border-l-2 border-[#B1B9C6]" style={{ borderStyle: 'dashed' }}></div>
                        <div className="absolute right-0 top-[173px] w-[159px] h-[23px] border-t-2 border-l-2 border-[#B1B9C6]" style={{ borderStyle: 'dashed' }}></div>
                        <div className="absolute right-0 top-[336px] w-[143px] h-[20px] border-t-2 border-l-2 border-[#B1B9C6]" style={{ borderStyle: 'dashed' }}></div>
                      </div>

                      {/* Center Circular Chart */}
                      <div className="relative w-[340px] h-[340px] flex items-center justify-center mx-auto">
                        <div className="w-[340px] h-[340px] rounded-full bg-white shadow-lg flex items-center justify-center"
                          style={{ boxShadow: '0px 3.10px 38.72px rgba(0, 0, 0, 0.08)' }}
                        >
                          <div className="w-[300px] h-[300px] rounded-full relative overflow-hidden">
                            {/* Chart segments using conic-gradient */}
                            <div 
                              className="w-full h-full rounded-full"
                              style={{
                                background: `conic-gradient(
                                  from -90deg,
                                  #10B981 0deg 32deg,
                                  #3B82F6 32deg 115deg,
                                  #D4E1EA 115deg 230deg,
                                  #D4E1EA 230deg 360deg
                                )`
                              }}
                            >
                              <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-[200px] h-[200px] rounded-full bg-white flex items-center justify-center">
                                  {/* Target icon */}
                                  <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                                    <circle cx="16" cy="16" r="14" stroke="#D4E1EA" strokeWidth="2"/>
                                    <circle cx="16" cy="16" r="8" stroke="#D4E1EA" strokeWidth="2"/>
                                    <circle cx="16" cy="16" r="3" fill="#D4E1EA"/>
                                  </svg>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Right Labels */}
                      <div className="absolute right-0 top-[77px] flex flex-col gap-6 w-[240px]">
                        <div className="flex flex-col gap-1">
                          <span className="text-[#050F1C] text-base font-normal">Plaintiff in both (not defendant)</span>
                          <span className="text-[#B1B9C6] text-lg font-bold">+5 points</span>
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="text-[#050F1C] text-base font-normal">1 won case (favorable outcome)</span>
                          <span className="text-[#B1B9C6] text-lg font-bold">-5 points</span>
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="text-[#050F1C] text-base font-normal">Civil disputes (not criminal)</span>
                          <span className="text-[#B1B9C6] text-lg font-bold">+0 points</span>
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="text-[#050F1C] text-base font-normal">No adverse judgments</span>
                          <span className="text-[#B1B9C6] text-lg font-bold">0 points</span>
                        </div>
                      </div>
                    </div>

                    {/* Legend */}
                    <div className="p-4 border border-[#D4E1EA] rounded-lg flex items-center justify-between">
                      <span className="text-[#050F1C] text-base font-medium">Calculated based on case history, dispute frequency, and unresolved matters</span>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <div className="w-4 h-4 bg-[#10B981] rounded-full"></div>
                          <span className="text-[#050F1C] text-sm font-normal opacity-75">Low risk: 0-40</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="w-4 h-4 bg-[#DEBB0C] rounded-full"></div>
                          <span className="text-[#050F1C] text-sm font-normal opacity-75">Moderate risk: 41-70</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="w-4 h-4 bg-[#EF4444] rounded-full"></div>
                          <span className="text-[#050F1C] text-sm font-normal opacity-75">High risk: 71-100</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Score Breakdown Table */}
                  <div className="flex flex-col gap-2">
                    <span className="text-[#050F1C] text-xs font-normal">SCORE BREAKDOWN</span>
                    <div className="overflow-hidden rounded-[14px] border border-[#E5E8EC]">
                      <div className="bg-[#F4F6F9] py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-[180px] px-4 py-2">
                            <span className="text-[#070810] text-sm font-bold">Factor</span>
                          </div>
                          <div className="w-[150px] px-4 py-2">
                            <span className="text-[#070810] text-sm font-bold">Weight</span>
                          </div>
                          <div className="w-[400px] px-4 py-2">
                            <span className="text-[#070810] text-sm font-bold">Description</span>
                          </div>
                          <div className="w-[150px] px-4 py-2">
                            <span className="text-[#070810] text-sm font-bold">Entity value</span>
                          </div>
                          <div className="w-[150px] px-4 py-2">
                            <span className="text-[#070810] text-sm font-bold">Risk point</span>
                          </div>
                        </div>
                      </div>
                      <div className="bg-white">
                        {[
                          { factor: 'Case Frequency', weight: '30%', desc: 'Number of legal disputes in the past 3 years', value: '2 cases', points: '10' },
                          { factor: 'Case Outcomes', weight: '20%', desc: 'Ratio of lost to won cases', value: '50% won', points: '-' },
                          { factor: 'Financial Exposure', weight: '20%', desc: 'Total quantum (amount in dispute)', value: 'GHS 1,200,000', points: '-' },
                          { factor: 'Case Recency', weight: '10%', desc: 'Time since last recorded case', value: '4 months ago', points: '8' },
                          { factor: 'Data Completeness', weight: '10%', desc: 'Accuracy & profile completeness', value: '85%', points: '7' },
                          { factor: 'Total Weighted Score', weight: '100%', desc: '-', value: '-', points: '25' }
                        ].map((row, index, array) => (
                          <div
                            key={index}
                            className="flex items-center gap-3 py-3 px-4"
                            style={{
                              borderBottom: index < array.length - 1 ? '0.40px solid #E5E8EC' : 'none'
                            }}
                          >
                            <div className="w-[180px] px-4 py-2">
                              <span className="text-[#070810] text-sm font-normal">{row.factor}</span>
                            </div>
                            <div className="w-[150px] px-4 py-2">
                              <span className="text-[#070810] text-sm font-normal">{row.weight}</span>
                            </div>
                            <div className="w-[400px] px-4 py-2">
                              <span className="text-[#070810] text-sm font-normal">{row.desc}</span>
                            </div>
                            <div className="w-[150px] px-4 py-2">
                              <span className="text-[#070810] text-sm font-normal">{row.value}</span>
                            </div>
                            <div className="w-[150px] px-4 py-2">
                              <span className="text-[#070810] text-sm font-normal">{row.points}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Risk Indicator Table */}
                  <div className="flex flex-col gap-2">
                    <span className="text-[#050F1C] text-xs font-normal">RISK INDICATOR</span>
                    <div className="overflow-hidden rounded-[14px] border border-[#E5E8EC]">
                      <div className="bg-[#F4F6F9] py-4 px-4">
                        <div className="flex items-center gap-8">
                          <div className="w-[300px] px-4 py-2">
                            <span className="text-[#070810] text-sm font-bold">Indicator</span>
                          </div>
                          <div className="w-[200px] px-4 py-2">
                            <span className="text-[#070810] text-sm font-bold">Status</span>
                          </div>
                          <div className="w-[500px] px-4 py-2">
                            <span className="text-[#070810] text-sm font-bold">Description</span>
                          </div>
                        </div>
                      </div>
                      <div className="bg-white">
                        {[
                          { indicator: '🧾 Pending Cases', status: '1', desc: 'Active in High Court and Commercial Division' },
                          { indicator: '⚖️ Judgments Lost', status: '0', desc: '-' },
                          { indicator: '🏢 Gazette Mentions', status: '3', desc: 'Revocation notice (2023), Penalty listing (2024)' },
                          { indicator: '🕒 Last Legal Activity', status: 'July 2025', desc: 'Ongoing lease dispute' },
                          { indicator: '💰 Total Dispute Value', status: 'GHS 1.2M', desc: 'On open case' }
                        ].map((row, index, array) => (
                          <div
                            key={index}
                            className="flex items-center gap-8 py-3 px-4"
                            style={{
                              borderBottom: index < array.length - 1 ? '0.40px solid #E5E8EC' : 'none'
                            }}
                          >
                            <div className="w-[300px] px-4 py-2">
                              <span className="text-[#070810] text-sm font-normal">{row.indicator}</span>
                            </div>
                            <div className="w-[200px] px-4 py-2">
                              <span className="text-[#070810] text-sm font-normal">{row.status}</span>
                            </div>
                            <div className="w-[500px] px-4 py-2">
                              <span className="text-[#070810] text-sm font-normal">{row.desc}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Case Filed Chart */}
                  <div className="w-full h-[550px] bg-[#F7F8FA] rounded-lg relative p-6">
                    <div className="flex justify-between items-center mb-8">
                      <div className="flex items-center gap-1">
                        <span className="text-[#050F1C] text-2xl font-medium">CASE FILED</span>
                        <ChevronDown className="w-4 h-4 text-[#050F1C]" />
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-[#050F1C] text-lg font-normal opacity-85">This year</span>
                        <ChevronDown className="w-4 h-4 text-[#050F1C]" />
                      </div>
                    </div>
                    <div className="relative w-full h-full">
                      {/* Y-axis labels */}
                      <div className="absolute left-0 top-[144px] flex flex-col gap-10 items-end w-[42px]">
                        {[100, 80, 60, 40, 20].map((val) => (
                          <span key={val} className="text-[#050F1C] text-2xl font-normal opacity-40">{val}</span>
                        ))}
                      </div>
                      {/* Chart area */}
                      <div className="ml-[93px] mr-[27px] h-[330px] relative">
                        {/* Grid lines */}
                        <div className="absolute inset-0 flex flex-col justify-between">
                          {[0, 1, 2, 3, 4].map((i) => (
                            <div key={i} className="h-[2px] bg-[#D4E1EA]"></div>
                          ))}
                        </div>
                        {/* Line chart */}
                        <div className="absolute inset-0">
                          <Line
                            data={{
                              labels: ['Jan 2', 'March 7', 'April 12', 'June 17', 'Aug 22', 'Oct 27', 'Dec 2'],
                              datasets: [{
                                label: 'Cases Filed',
                                data: [0, 2, 1, 3, 2, 1, 0],
                                borderColor: '#3B82F6',
                                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                                borderWidth: 4,
                                fill: true,
                                tension: 0.4
                              }]
                            }}
                            options={{
                              responsive: true,
                              maintainAspectRatio: false,
                              plugins: {
                                legend: { display: false },
                                tooltip: { enabled: true }
                              },
                              scales: {
                                y: {
                                  beginAtZero: true,
                                  max: 100,
                                  ticks: { display: false },
                                  grid: { display: false }
                                },
                                x: {
                                  ticks: {
                                    color: '#050F1C',
                                    font: { size: 24 },
                                    opacity: 0.4
                                  },
                                  grid: { display: false }
                                }
                              }
                            }}
                          />
                        </div>
                      </div>
                      {/* X-axis labels */}
                      <div className="absolute bottom-0 left-[113px] flex gap-[30px]">
                        {['Jan 2', 'March 7', 'April 12', 'June 17', 'Aug 22', 'Oct 27', 'Dec 2'].map((label, idx) => (
                          <div key={idx} className="w-[111px] text-center">
                            <span className="text-[#050F1C] text-2xl font-normal opacity-40">{label}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Case & Dispute Summary */}
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-start">
                      <span className="text-[#050F1C] text-xs font-normal">CASE & DISPUTE SUMMARY</span>
                      <button className="text-[#022658] text-xs font-bold hover:opacity-70">View all</button>
                    </div>
                    <div className="overflow-hidden rounded-[14px] border border-[#E5E8EC]">
                      <div className="bg-[#F4F6F9] py-4 px-3">
                        <div className="flex items-center gap-3">
                          <div className="w-[136px] px-2">
                            <span className="text-[#070810] text-sm font-bold">Case Number</span>
                          </div>
                          <div className="w-[200px] px-2">
                            <span className="text-[#070810] text-sm font-bold">Case type</span>
                          </div>
                          <div className="w-[136px] px-2">
                            <span className="text-[#070810] text-sm font-bold">Court</span>
                          </div>
                          <div className="w-[136px] px-2">
                            <span className="text-[#070810] text-sm font-bold">Status</span>
                          </div>
                          <div className="w-[136px] px-2">
                            <span className="text-[#070810] text-sm font-bold">Outcome</span>
                          </div>
                          <div className="w-[136px] px-2">
                            <span className="text-[#070810] text-sm font-bold">Quantum (GHS)</span>
                          </div>
                          <div className="w-[136px] px-2">
                            <span className="text-[#070810] text-sm font-bold">Weight in Risk</span>
                          </div>
                        </div>
                      </div>
                      <div className="bg-white">
                        {[
                          { caseNo: 'CM/0245/2023', type: 'Contract Dispute', court: 'High Court', status: 'Ongoing', outcome: '-', quantum: '150,000', weight: '15%' },
                          { caseNo: 'CM/0111/2021', type: 'Regulatory Action', court: 'Tribunal', status: 'Closed', outcome: 'Won', quantum: '0', weight: '5%' }
                        ].map((row, index, array) => (
                          <div
                            key={index}
                            className="flex items-center gap-3 py-3 px-3 pr-3"
                            style={{
                              borderBottom: index < array.length - 1 ? '0.40px solid #E5E8EC' : 'none',
                              height: '70px'
                            }}
                          >
                            <div className="w-[136px] px-2">
                              <span className="text-[#070810] text-sm font-normal">{row.caseNo}</span>
                            </div>
                            <div className="w-[200px] px-2">
                              <span className="text-[#070810] text-sm font-normal">{row.type}</span>
                            </div>
                            <div className="w-[136px] px-2">
                              <span className="text-[#070810] text-sm font-normal">{row.court}</span>
                            </div>
                            <div className="w-[136px] px-2">
                              <span className="text-[#070810] text-sm font-normal">{row.status}</span>
                            </div>
                            <div className="w-[136px] px-2">
                              <span className={`text-sm font-bold ${row.outcome === 'Won' ? 'text-[#10B981]' : 'text-[#050F1C]'}`}>{row.outcome}</span>
                            </div>
                            <div className="w-[136px] px-2">
                              <span className="text-[#070810] text-sm font-normal">{row.quantum}</span>
                            </div>
                            <div className="w-[136px] px-2">
                              <span className="text-[#050F1C] text-sm font-normal">{row.weight}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Comparison Stats */}
                  <div className="px-10 py-4 bg-white rounded-lg border border-[#D4E1EA] flex items-center justify-between"
                    style={{ boxShadow: '4px 4px 4px rgba(7, 8, 16, 0.10)' }}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <span className="text-center text-[#525866] text-base font-normal">John Kwame Louis Risk Score</span>
                      <span className="text-[#10B981] text-lg font-medium">28</span>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                      <span className="text-center text-[#525866] text-base font-normal">Industry Average (Banking)</span>
                      <span className="text-[#10B981] text-lg font-medium">40</span>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                      <span className="text-center text-[#525866] text-base font-normal">Top Quartile</span>
                      <span className="text-[#F59E0B] text-lg font-medium">20</span>
                    </div>
                  </div>

                  {/* Risk Score Explanation */}
                  <div className="flex flex-col gap-2">
                    <span className="text-[#050F1C] text-lg font-normal">Risk Score Explanation</span>
                    <div className="text-[#050F1C] text-base">
                      <span className="font-medium">Why Low Risk:</span>
                      <span> Only 2 court cases in total (low litigation frequency), Won the concluded case with judgment in his favor, Acting as plaintiff (seeking remedy, not being sued for wrongdoing), No criminal cases or regulatory violations, No pattern of losing cases or adverse judgments, Total claim values are moderate for his professional level, Long stable employment history in reputable banking institutions</span>
                      <br/><br/>
                      <span className="font-medium">Contributing Factors:</span>
                      <span> One ongoing commercial dispute (adds minor uncertainty), Total claim exposure of GHS 185,000 (manageable).</span>
                    </div>
                  </div>

                  {/* Recommendation */}
                  <div className="w-full">
                    <span className="text-[#10B981] text-base font-medium">Recommendation:</span>
                    <span className="text-[#050F1C] text-base font-normal"> Suitable for credit facilities and business partnerships. Minimal legal risk profile.</span>
                  </div>

                  {/* Export Button */}
                  <button className="h-8 px-4 py-2 rounded-lg border border-[#F59E0B] text-[#F59E0B] text-base font-medium flex items-center gap-1 hover:opacity-70 w-fit">
                    <span>Export</span>
                    <ChevronDown className="w-4 h-4 text-[#F59E0B]" />
                  </button>
                </div>
              )}

              {/* Other tabs placeholder */}
              {activeTab !== 'Personal information' && activeTab !== 'Employment records' && activeTab !== 'Affiliated persons' && activeTab !== 'Case list' && activeTab !== 'Gazzette notices' && activeTab !== 'Risk score' && (
                <div className="p-6 bg-white rounded-lg border border-[#E4E7EB]">
                  <span className="text-[#525866] text-sm">{activeTab} content coming soon...</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CorporateClientPersonDetails;

