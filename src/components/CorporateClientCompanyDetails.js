import React, { useState } from 'react';
import { Bell, ChevronRight, ChevronLeft, Building2, Download, Users, FileText, AlertCircle, ChevronDown, Edit, Save, X } from 'lucide-react';
import CorporateClientCaseDetails from './CorporateClientCaseDetails';
import CorporateClientRequestAdditionalSearchPage from './CorporateClientRequestAdditionalSearchPage';
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

const CorporateClientCompanyDetails = ({ company, industry, onBack, userInfo }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showRequestSearch, setShowRequestSearch] = useState(false);
  const [activeTab, setActiveTab] = useState('personal');
  const [directorsPeriod, setDirectorsPeriod] = useState('present');
  const [secretariesPeriod, setSecretariesPeriod] = useState('present');
  const [employeesPeriod, setEmployeesPeriod] = useState('present');
  const [casesPeriod, setCasesPeriod] = useState('active');
  const [selectedCase, setSelectedCase] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  const tabs = [
    { id: 'personal', label: 'Personal information' },
    { id: 'directors', label: 'Directors' },
    { id: 'secretaries', label: 'Secretaries' },
    { id: 'employees', label: 'Employees' },
    { id: 'regulatory', label: 'Regulatory & Compliance' },
    { id: 'cases', label: 'Case list' },
    { id: 'bulletin', label: 'Commercial Bulletin' },
    { id: 'risk', label: 'Risk score' }
  ];

  const beneficialOwners = [
    { name: 'ABC Holdings', position: 'Beneficial Owner', tin: 'D109372287278', ownership: '60%', acquisitionDate: 'Oct. 20, 2015', riskLevel: '04 - Low' },
    { name: 'Jane Doe', position: 'C.E.O', tin: 'D216372287278', ownership: '40%', acquisitionDate: 'Oct. 15, 2015', riskLevel: '04 - Low' }
  ];

  const registrationDocuments = [
    { file: 'ECOWIND_2015_.pdf', type: 'Registration document', date: 'Oct. 10, 2015' }
  ];

  const presentDirectors = [
    { name: 'Jane Smith', contact: '+2337788990', dob: '15-03-1985', birthPlace: 'Accra', appointmentDate: '05/14/2010', cases: '3', riskScore: '04 - Low' },
    { name: 'Kwame Nkrumah', contact: '+2331234567', dob: '20-01-1990', birthPlace: 'Kumasi', appointmentDate: '11/11/2015', cases: '1', riskScore: '03 - Low' },
    { name: 'Ama Serwah', contact: '+2339988776', dob: '25-12-1992', birthPlace: 'Tamale', appointmentDate: '02/20/2018', cases: '5', riskScore: '12 - Low' }
  ];

  const presentSecretaries = [
    { name: 'Auxiliary Admin Services', contact: '+2337788990', appointmentDate: '15-03-2022', tin: 'B009372287278', incorporationDate: '15-03-2019', riskScore: '12 - Low' }
  ];

  const pastSecretaries = [
    { name: 'Previous Admin Services', contact: '+2337788991', appointmentDate: '15-03-2020', tin: 'B009372287279', incorporationDate: '15-03-2018', riskScore: '10 - Low' }
  ];

  const presentEmployees = [
    { name: 'Peter Smith', contact: '+2337788990', dob: '15-03-1985', birthPlace: 'Accra', position: 'Floor staff', appointmentDate: '05/14/2010', cases: '3', riskScore: '4 - Low' },
    { name: 'Steve Mendes', contact: '+2331234567', dob: '20-01-1990', birthPlace: 'Kumasi', position: 'Cleaner', appointmentDate: '11/11/2015', cases: '1', riskScore: '0 - Low' },
    { name: 'Ayo Kensas', contact: '+2339988776', dob: '25-12-1992', birthPlace: 'Tamale', position: 'Floor staff', appointmentDate: '02/20/2018', cases: '5', riskScore: '0 - Low' }
  ];

  const regulatoryList = [
    { body: 'Bank of Ghana', licenseNumber: '112233', status: 'Valid', violations: 'Bank returns', actions: 'Fines', date: '10/09/2025' },
    { body: 'SEC', licenseNumber: '445566', status: 'Expired', violations: 'Tax', actions: 'Sanctions', date: '10/09/2025' }
  ];

  const activeCases = [
    {
      title: 'EcoWind Corp. vs. Meridian Properties - Dispute over breach of lease agreement for commercial property',
      suitNo: 'CM/0245/2023',
      role: 'Plaintiff',
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
      expectedOutcome: 'The expected outcome of this case is a favorable judgment for EcoWind Corp., where the court directs Meridian Properties to compensate the plaintiff for breach of the lease agreement and to either restore the original lease terms or provide financial restitution for the loss suffered.',
      caseSummary: 'This case revolves around a contractual dispute concerning a lease agreement for a commercial property located in Accra. EcoWind Corp. contends that Meridian Properties breached the terms of the agreement by prematurely terminating the lease and failing to fulfill specific maintenance and renewal obligations stipulated in the contract. As a result, EcoWind Corp. claims to have suffered operational and financial setbacks due to the sudden loss of the leased premises.\n\nThe plaintiff is seeking damages amounting to GHS 150,000 and an order compelling the defendant to either honor the original lease terms or compensate for the loss incurred. The case, filed on March 15, 2023, is currently ongoing before the High Court (Commercial Division) in Accra, where preliminary hearings have focused on validating the contract and assessing the extent of the alleged breach.',
      quickDocuments: [
        { name: 'Lease_Agreement.pdf', type: 'pdf' },
        { name: 'Court_Order_0245.pdf', type: 'pdf' },
        { name: 'Gazette_1093.pdf', type: 'pdf' }
      ],
      parties: [
        {
          name: 'EcoWind Corp.',
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
          documentType: 'parties'
        },
        {
          date: 'Oct 28, 2025',
          fileName: 'Gazette_1093.pdf',
          type: 'Gazette notice',
          submittedBy: 'Defendant\'s Counsel',
          documentType: 'parties'
        },
        {
          date: 'Oct 17, 2025',
          fileName: 'Court_Order_0245.pdf',
          judge: 'Justice A. Mensah',
          citation: 'Reported in the System',
          documentType: 'court'
        },
        {
          date: 'Oct 28, 2025',
          fileName: 'Gazette_1093.pdf',
          judge: 'Justice A. Mensah',
          citation: 'Reported in the System',
          documentType: 'court'
        }
      ],
      caseDiary: [],
      auditHistory: [],
      notes: []
    }
  ];

  const closedCases = [
    {
      title: 'EcoWind Corp. vs. SafeDrive Insurance',
      suitNo: 'CV/1089/2021',
      dateFiled: 'November 8, 2021',
      filedOn: '10-10-1978',
      court: 'Circuit Court, Accra',
      courtName: 'Business Court',
      location: 'Accra',
      judge: 'Sam Chris',
      status: 'Judgement in favor',
      statusColor: 'transparent',
      statusTextColor: '#10B981',
      town: 'Accra',
      region: 'Greater Accra',
      courtType: 'Circuit Court',
      areaOfLaw: 'Insurance Law',
      expectedOutcome: 'Case resolved in favor of EcoWind Corp.',
      caseSummary: 'This case involved a dispute with SafeDrive Insurance regarding coverage and claims processing.',
      quickDocuments: [],
      parties: [],
      documents: [],
      caseDiary: [],
      auditHistory: [],
      notes: []
    },
    {
      title: 'EcoWind Corp. vs. SafeDrive Insurance',
      suitNo: 'CV/1089/2021',
      dateFiled: 'March 11, 2000',
      filedOn: '03-11-2000',
      court: 'Civil Court, Kumasi',
      courtName: 'Civil Court',
      location: 'Kumasi',
      judge: 'Kwame Louis',
      status: 'Closed',
      statusColor: 'transparent',
      statusTextColor: '#10B981',
      town: 'Kumasi',
      region: 'Ashanti',
      courtType: 'Civil Court',
      areaOfLaw: 'Commercial Law',
      expectedOutcome: 'Case closed',
      caseSummary: 'This case involved a commercial dispute that was resolved.',
      quickDocuments: [],
      parties: [],
      documents: [],
      caseDiary: [],
      auditHistory: [],
      notes: []
    }
  ];

  const bulletinData = [
    { dateSigning: 'January 5, 2005', noticeType: 'Change of Name', description: 'Name changed from Eco Corp. to EcoWind Corp.', bulletinNo: 'Ghana Gazette No. 2, 2005', uploadDate: 'January 14, 2005' },
    { dateSigning: 'June 20, 2008', noticeType: 'Change of Address', description: 'Name changed from Tempah to Kumasi', bulletinNo: 'Ghana Gazette No. 25, 2008', uploadDate: 'June 27, 2008' }
  ];

  const userName = userInfo?.first_name && userInfo?.last_name 
    ? `${userInfo.first_name} ${userInfo.last_name}` 
    : 'Tonia Martins';
  const organizationName = userInfo?.organization || 'Access Bank';
  const companyName = company || 'EcoWind Corp.';
  const industryName = industry?.name || 'ENERGY';

  // Initialize edit form data on mount
  React.useEffect(() => {
    // Initialize with default values if form data is empty
    if (Object.keys(editFormData).length === 0) {
      setEditFormData({
        status: 'Active',
        ceo: 'Jane Smith (2018-Present)',
        businessType: 'Company with Shares',
        companyType: 'Corporation',
        entityName: companyName,
        registrationNumber: 'RW987654',
        principalActivity: 'Generating & selling electricity from renewable sources\nOperating a wind farm\nProviding consulting, engineering and supply chain services for wind energy industry.',
        tin: 'B009372287278',
        incorporationDate: 'October 10, 2015',
        commencementDate: 'October 11, 2015',
        buildingNumber: '45, Greenway Avenue',
        landmark: 'Behind Excellence Hotel',
        city: 'Accra',
        district: 'Accra',
        region: 'Greater Accra',
        country: 'Ghana',
        poBox: 'GA-183-8164',
        phone: '+233445556666',
        email: 'ecowindcorp@gmail.com',
        authorizedCapital: 'GHS 20m',
        totalShares: '200,000,000',
        totalAssets: '2,123',
        annualTurnover: 'GHS 30m',
        auditingFirm: 'Benjamin Franklin Accounting Consultancy',
        appointmentDate: 'Friday, August 06, 2025',
        auditorContact: '+233445556666',
        auditorTin: 'B009372287278',
        lastUpdated: 'Friday, August 06, 2025'
      });
    }
  }, [companyName]);

  // Handle cancel edit
  const handleCancelEdit = () => {
    setIsEditing(false);
    // Reset form data to original values (re-initialize)
    const originalData = {
      status: 'Active',
      ceo: 'Jane Smith (2018-Present)',
      businessType: 'Company with Shares',
      companyType: 'Corporation',
      entityName: companyName,
      registrationNumber: 'RW987654',
      principalActivity: 'Generating & selling electricity from renewable sources\nOperating a wind farm\nProviding consulting, engineering and supply chain services for wind energy industry.',
      tin: 'B009372287278',
      incorporationDate: 'October 10, 2015',
      commencementDate: 'October 11, 2015',
      buildingNumber: '45, Greenway Avenue',
      landmark: 'Behind Excellence Hotel',
      city: 'Accra',
      district: 'Accra',
      region: 'Greater Accra',
      country: 'Ghana',
      poBox: 'GA-183-8164',
      phone: '+233445556666',
      email: 'ecowindcorp@gmail.com',
      authorizedCapital: 'GHS 20m',
      totalShares: '200,000,000',
      totalAssets: '2,123',
      annualTurnover: 'GHS 30m',
      auditingFirm: 'Benjamin Franklin Accounting Consultancy',
      appointmentDate: 'Friday, August 06, 2025',
      auditorContact: '+233445556666',
      auditorTin: 'B009372287278',
      lastUpdated: 'Friday, August 06, 2025'
    };
    setEditFormData(originalData);
  };

  // Handle save edit
  const handleSaveEdit = async () => {
    try {
      setIsSaving(true);
      // TODO: Implement API call to save company details
      // const token = localStorage.getItem('accessToken');
      // const response = await fetch(`/api/companies/${companyId}`, {
      //   method: 'PUT',
      //   headers: {
      //     'Authorization': `Bearer ${token}`,
      //     'Content-Type': 'application/json'
      //   },
      //   body: JSON.stringify(editFormData)
      // });
      
      // For now, just simulate a save
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setIsEditing(false);
      // Show success message or update UI
    } catch (error) {
      console.error('Error saving company details:', error);
      // Show error message
    } finally {
      setIsSaving(false);
    }
  };

  // If request search is shown, show request page
  if (showRequestSearch) {
    return (
      <CorporateClientRequestAdditionalSearchPage
        company={company}
        onBack={() => setShowRequestSearch(false)}
      />
    );
  }

  // If a case is selected, show case details
  if (selectedCase) {
    return (
      <CorporateClientCaseDetails
        caseData={selectedCase}
        company={company}
        industry={industry}
        onBack={() => setSelectedCase(null)}
        userInfo={userInfo}
      />
    );
  }

  return (
    <div className="bg-[#F7F8FA] min-h-screen">
      {/* Full Width Header */}
      <div className="w-full bg-white py-3.5 px-6 mb-4">
        <div className="flex justify-between items-center">
          <div className="flex flex-col items-start gap-1">
            <span className="text-[#050F1C] text-xl font-medium">
              {organizationName},
            </span>
            <span className="text-[#050F1C] text-base font-normal opacity-75">
              Track all your activities here.
            </span>
          </div>
          <div className="flex items-start flex-1 gap-4 justify-end">
            {/* Search Bar */}
            <div className="flex justify-between items-center w-[600px] pr-2 rounded-lg border border-solid border-[#D4E1EA] bg-white h-11">
              <input
                type="text"
                placeholder="Search companies and persons here"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
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
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-0.5">
                    <span className="text-[#050F1C] text-base font-bold whitespace-nowrap">
                      {userName}
                    </span>
                    <ChevronRight className="w-3 h-3 text-[#141B34] rotate-90" />
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-[#10B981] rounded-full"></div>
                    <span className="text-[#525866] text-xs">Online</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-6">
        <div className="p-4 bg-white rounded-lg flex flex-col gap-4">
          {/* First Section: Breadcrumb, Header, Stats */}
          <div className="flex flex-col gap-6" style={{ gap: '24px' }}>
            {/* Breadcrumb */}
            <div className="flex items-center gap-1">
              <span className="text-[#525866] text-xs opacity-75 font-normal">COMPANIES</span>
              <ChevronRight className="w-4 h-4 text-[#7B8794]" />
              <span className="text-[#525866] text-xs opacity-75 font-normal">{industryName}</span>
              <ChevronRight className="w-4 h-4 text-[#7B8794]" />
              <span className="text-[#070810] text-sm font-normal" style={{ fontFamily: 'Roboto' }}>{companyName}</span>
            </div>

            {/* Company Header */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center self-stretch gap-4">
              <div className="flex items-start gap-2">
                <button 
                  onClick={onBack} 
                  className="p-2 bg-[#F7F8FA] rounded-lg hover:opacity-70 transition-opacity"
                >
                  <ChevronLeft className="w-6 h-6 text-[#050F1C]" />
                </button>
                <div className="flex flex-col gap-1">
                  <span className="text-[#050F1C] text-xl font-semibold" style={{ fontFamily: 'Roboto' }}>
                    {companyName}
                  </span>
                  <span className="text-[#EF4444] text-xs font-bold opacity-75">High risk [90/100]</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                {!isEditing ? (
                <button 
                    onClick={() => {
                      // Ensure form data is initialized before entering edit mode
                      if (Object.keys(editFormData).length === 0) {
                        setEditFormData({
                          status: 'Active',
                          ceo: 'Jane Smith (2018-Present)',
                          businessType: 'Company with Shares',
                          companyType: 'Corporation',
                          entityName: companyName,
                          registrationNumber: 'RW987654',
                          principalActivity: 'Generating & selling electricity from renewable sources\nOperating a wind farm\nProviding consulting, engineering and supply chain services for wind energy industry.',
                          tin: 'B009372287278',
                          incorporationDate: 'October 10, 2015',
                          commencementDate: 'October 11, 2015',
                          buildingNumber: '45, Greenway Avenue',
                          landmark: 'Behind Excellence Hotel',
                          city: 'Accra',
                          district: 'Accra',
                          region: 'Greater Accra',
                          country: 'Ghana',
                          poBox: 'GA-183-8164',
                          phone: '+233445556666',
                          email: 'ecowindcorp@gmail.com',
                          authorizedCapital: 'GHS 20m',
                          totalShares: '200,000,000',
                          totalAssets: '2,123',
                          annualTurnover: 'GHS 30m',
                          auditingFirm: 'Benjamin Franklin Accounting Consultancy',
                          appointmentDate: 'Friday, August 06, 2025',
                          auditorContact: '+233445556666',
                          auditorTin: 'B009372287278',
                          lastUpdated: 'Friday, August 06, 2025'
                        });
                      }
                      setIsEditing(true);
                    }}
                    className="flex items-center px-4 py-2 gap-2 rounded-lg border border-solid border-[#022658] hover:bg-blue-50 whitespace-nowrap"
                  >
                    <Edit className="w-4 h-4 text-[#022658]" />
                    <span className="text-[#022658] text-base font-bold" style={{ fontFamily: 'Satoshi' }}>Edit Details</span>
                  </button>
                ) : (
                  <>
                    <button 
                      onClick={handleCancelEdit}
                      className="flex items-center px-4 py-2 gap-2 rounded-lg border border-solid border-gray-300 hover:bg-gray-50 whitespace-nowrap"
                    >
                      <X className="w-4 h-4 text-gray-600" />
                      <span className="text-gray-600 text-base font-bold" style={{ fontFamily: 'Satoshi' }}>Cancel</span>
                    </button>
                    <button 
                      onClick={handleSaveEdit}
                      disabled={isSaving}
                      className="flex items-center px-4 py-2 gap-2 rounded-lg border border-solid border-[#022658] bg-[#022658] hover:bg-[#033a7a] text-white disabled:opacity-50 whitespace-nowrap"
                    >
                      <Save className="w-4 h-4" />
                      <span className="text-base font-bold" style={{ fontFamily: 'Satoshi' }}>{isSaving ? 'Saving...' : 'Save Changes'}</span>
                    </button>
                  </>
                )}
                <button 
                  className="px-4 py-3 rounded-lg border-2 border-[#0F2847] hover:opacity-90 transition-opacity whitespace-nowrap"
                  style={{boxShadow: '0px 4px 4px rgba(5, 15, 28, 0.10)'}}
                >
                  <span className="text-[#022658] text-base font-bold" style={{ fontFamily: 'Satoshi' }}>Add To Watchlist</span>
                </button>
                <button 
                  onClick={() => setShowRequestSearch(true)}
                  className="px-4 py-3 rounded-lg hover:opacity-90 transition-opacity whitespace-nowrap"
                  style={{
                    background: 'linear-gradient(180deg, #022658 43%, #1A4983 100%)',
                    boxShadow: '0px 4px 4px rgba(5, 15, 28, 0.10)',
                    outline: '4px solid rgba(15, 40, 71, 0.15)'
                  }}
                >
                  <span className="text-white text-base font-bold" style={{ fontFamily: 'Satoshi' }}>Request Additional Search</span>
                </button>
              </div>
            </div>

            {/* Company Info Stats Bar */}
            <div className="px-8 py-4 bg-[#F4F6F9] rounded-lg flex justify-between items-center self-stretch">
              <div className="w-[200px] px-2 border-r border-[#D4E1EA] flex flex-col gap-2">
                <span className="text-[#868C98] text-xs font-normal">Company ID</span>
                <span className="text-[#022658] text-base font-medium">CMP_00215</span>
              </div>
              <div className="w-[200px] px-2 border-r border-[#D4E1EA] flex flex-col gap-2">
                <span className="text-[#868C98] text-xs font-normal">Industry</span>
                <span className="text-[#022658] text-base font-medium">Renewable energy</span>
              </div>
              <div className="w-[200px] px-2 border-r border-[#D4E1EA] flex flex-col gap-2">
                <span className="text-[#868C98] text-xs font-normal">Registered Address</span>
                <span className="text-[#022658] text-base font-medium">Accra, Ghana</span>
              </div>
              <div className="w-[200px] px-2 border-r border-[#D4E1EA] flex flex-col gap-2">
                <span className="text-[#868C98] text-xs font-normal">Last updated</span>
                <span className="text-[#022658] text-base font-medium">Oct 30th, 2025</span>
              </div>
              <div className="w-[200px] px-2 flex flex-col gap-2">
                <span className="text-[#868C98] text-xs font-normal">Risk score</span>
                <span className="text-[#EF4444] text-base font-medium">90/100</span>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="flex items-start self-stretch gap-3" style={{ gap: '12px' }}>
              <div className="flex-1 p-2 bg-white rounded-lg border border-[#D4E1EA] flex items-center gap-3">
                <div className="p-2 bg-[#F7F8FA] rounded-lg">
                  <Building2 className="w-6 h-6 text-[#868C98]" />
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[#868C98] text-xs">Companies affiliated with</span>
                  <span className="text-[#F59E0B] text-base font-medium">4</span>
                </div>
              </div>
              <div className="flex-1 p-2 bg-white rounded-lg border border-[#D4E1EA] flex items-center gap-3">
                <div className="p-2 bg-[#F7F8FA] rounded-lg">
                  <Users className="w-6 h-6 text-[#868C98]" />
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[#868C98] text-xs">Persons affiliated with</span>
                  <span className="text-[#F59E0B] text-base font-medium">563</span>
                </div>
              </div>
              <div className="flex-1 p-2 bg-white rounded-lg border border-[#D4E1EA] flex items-center gap-3">
                <div className="p-2 bg-[#F7F8FA] rounded-lg">
                  <FileText className="w-6 h-6 text-[#868C98]" />
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[#868C98] text-xs">Gazettes notices</span>
                  <span className="text-[#F59E0B] text-base font-medium">45</span>
                </div>
              </div>
              <div className="flex-1 p-2 bg-white rounded-lg border border-[#D4E1EA] flex items-center gap-3">
                <div className="p-2 bg-[#F7F8FA] rounded-lg">
                  <AlertCircle className="w-6 h-6 text-[#868C98]" />
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[#868C98] text-xs">Total amount of Data</span>
                  <span className="text-[#F59E0B] text-base font-medium">1,345,765</span>
                </div>
              </div>
            </div>

            {/* Recalculate Risk Score Button */}
            <div className="flex justify-end">
              <button 
                className="w-[260px] h-9 px-4 py-2.5 rounded-lg hover:opacity-90 transition-opacity"
                style={{
                  background: 'linear-gradient(180deg, #022658 43%, #1A4983 100%)',
                  boxShadow: '0px 4px 4px rgba(5, 15, 28, 0.10)',
                  outline: '4px solid rgba(15, 40, 71, 0.15)'
                }}
              >
                <span className="text-white text-base font-bold">Recalculate Risk score</span>
              </button>
            </div>
          </div>

          {/* Second Section: Tabs */}
          <div className="p-4 bg-white rounded-3xl flex flex-col gap-4">
            <div className="p-1 overflow-hidden flex items-center gap-4">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`pb-2 flex justify-center items-center gap-2.5 ${activeTab === tab.id ? 'border-b-4 border-[#022658]' : ''}`}
                >
                  <span className={`text-base ${activeTab === tab.id ? 'text-[#022658] font-bold' : 'text-[#525866] font-normal'}`}>
                    {tab.label}
                  </span>
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="p-6 bg-white rounded-lg border border-[#E4E7EB] flex flex-col gap-8" style={{ boxShadow: '4px 4px 4px rgba(7, 8, 16, 0.10)' }}>
              {activeTab === 'personal' && (
                <div className="flex flex-col gap-6">
                  {/* Edit Mode Indicator */}
                  {isEditing && (
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <span className="text-blue-800 text-sm font-medium">✏️ Edit Mode: You can now modify the company details below</span>
                    </div>
                  )}
                  {/* BIO Section */}
                  <div className="flex flex-col gap-4">
                    <span className="text-[#868C98] text-xs">BIO</span>
                    <div className="flex flex-col gap-2 p-4 bg-white rounded-lg border border-[#E4E7EB]" style={{boxShadow: '4px 4px 4px rgba(7, 8, 16, 0.10)'}}>
                      <div className="flex items-center gap-4">
                        <span className="w-[200px] text-[#050F1C] text-[10px] font-medium">Status</span>
                        {isEditing ? (
                          <input
                            type="text"
                            value={editFormData.status || 'Active'}
                            onChange={(e) => setEditFormData({...editFormData, status: e.target.value})}
                            className="flex-1 px-2 py-1 border border-[#D4E1EA] rounded text-sm text-[#050F1C]"
                          />
                        ) : (
                          <span className="flex-1 text-[#10B981] text-sm">{editFormData.status || 'Active'}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="w-[200px] text-[#050F1C] text-[10px] font-medium">CEO</span>
                        {isEditing ? (
                          <input
                            type="text"
                            value={editFormData.ceo || ''}
                            onChange={(e) => setEditFormData({...editFormData, ceo: e.target.value})}
                            className="flex-1 px-2 py-1 border border-[#D4E1EA] rounded text-sm text-[#050F1C]"
                          />
                        ) : (
                          <span className="flex-1 text-[#050F1C] text-sm">{editFormData.ceo || 'Jane Smith (2018-Present)'}</span>
                        )}
                      </div>
                      <div className="flex items-start gap-4">
                        <span className="w-[200px] text-[#050F1C] text-[10px] font-medium">Business type</span>
                        {isEditing ? (
                          <input
                            type="text"
                            value={editFormData.businessType || ''}
                            onChange={(e) => setEditFormData({...editFormData, businessType: e.target.value})}
                            className="flex-1 px-2 py-1 border border-[#D4E1EA] rounded text-sm text-[#050F1C]"
                          />
                        ) : (
                          <span className="flex-1 text-[#050F1C] text-sm">{editFormData.businessType || 'Company with Shares'}</span>
                        )}
                      </div>
                      <div className="flex items-start gap-4">
                        <span className="w-[200px] text-[#050F1C] text-[10px] font-medium">Company type</span>
                        {isEditing ? (
                          <input
                            type="text"
                            value={editFormData.companyType || ''}
                            onChange={(e) => setEditFormData({...editFormData, companyType: e.target.value})}
                            className="flex-1 px-2 py-1 border border-[#D4E1EA] rounded text-sm text-[#050F1C]"
                          />
                        ) : (
                          <span className="flex-1 text-[#050F1C] text-sm">{editFormData.companyType || 'Corporation'}</span>
                        )}
                      </div>
                      <div className="flex items-start gap-4">
                        <span className="w-[200px] text-[#050F1C] text-[10px] font-medium">Entity name</span>
                        {isEditing ? (
                          <input
                            type="text"
                            value={editFormData.entityName || companyName}
                            onChange={(e) => setEditFormData({...editFormData, entityName: e.target.value})}
                            className="flex-1 px-2 py-1 border border-[#D4E1EA] rounded text-sm text-[#050F1C]"
                          />
                        ) : (
                          <span className="flex-1 text-[#050F1C] text-sm">{editFormData.entityName || companyName}</span>
                        )}
                      </div>
                      <div className="flex items-start gap-4">
                        <span className="w-[200px] text-[#050F1C] text-[10px] font-medium">Registration number</span>
                        {isEditing ? (
                          <input
                            type="text"
                            value={editFormData.registrationNumber || ''}
                            onChange={(e) => setEditFormData({...editFormData, registrationNumber: e.target.value})}
                            className="flex-1 px-2 py-1 border border-[#D4E1EA] rounded text-sm text-[#050F1C]"
                          />
                        ) : (
                          <span className="flex-1 text-[#050F1C] text-sm">{editFormData.registrationNumber || 'RW987654'}</span>
                        )}
                      </div>
                      <div className="flex items-start gap-4">
                        <span className="w-[200px] text-[#050F1C] text-[10px] font-medium">Principal activity</span>
                        {isEditing ? (
                          <textarea
                            value={editFormData.principalActivity || ''}
                            onChange={(e) => setEditFormData({...editFormData, principalActivity: e.target.value})}
                            className="flex-1 px-2 py-1 border border-[#D4E1EA] rounded text-sm text-[#050F1C] min-h-[80px]"
                            rows={3}
                          />
                        ) : (
                          <span className="flex-1 text-[#050F1C] text-sm whitespace-pre-line">
                            {editFormData.principalActivity || 'Generating & selling electricity from renewable sources\nOperating a wind farm\nProviding consulting, engineering and supply chain services for wind energy industry.'}
                        </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="w-[200px] text-[#050F1C] text-[10px] font-medium">TIN</span>
                        {isEditing ? (
                          <input
                            type="text"
                            value={editFormData.tin || ''}
                            onChange={(e) => setEditFormData({...editFormData, tin: e.target.value})}
                            className="flex-1 px-2 py-1 border border-[#3B82F6] rounded text-sm text-[#3B82F6]"
                          />
                        ) : (
                          <span className="border-b border-[#3B82F6] text-[#3B82F6] text-sm">{editFormData.tin || 'B009372287278'}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="w-[200px] text-[#050F1C] text-[10px] font-medium">Incorporation date</span>
                        {isEditing ? (
                          <input
                            type="text"
                            value={editFormData.incorporationDate || ''}
                            onChange={(e) => setEditFormData({...editFormData, incorporationDate: e.target.value})}
                            className="flex-1 px-2 py-1 border border-[#D4E1EA] rounded text-sm text-[#050F1C]"
                          />
                        ) : (
                          <span className="flex-1 text-[#050F1C] text-sm">{editFormData.incorporationDate || 'October 10, 2015'}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="w-[200px] text-[#050F1C] text-[10px] font-medium">Commencement date</span>
                        {isEditing ? (
                          <input
                            type="text"
                            value={editFormData.commencementDate || ''}
                            onChange={(e) => setEditFormData({...editFormData, commencementDate: e.target.value})}
                            className="flex-1 px-2 py-1 border border-[#D4E1EA] rounded text-sm text-[#050F1C]"
                          />
                        ) : (
                          <span className="flex-1 text-[#050F1C] text-sm">{editFormData.commencementDate || 'October 11, 2015'}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Place of Business & Contact */}
                  <div className="flex flex-col gap-4">
                    <span className="text-[#525866] text-xs">Place of Business & Contact</span>
                    <div className="flex flex-col gap-2 p-4 bg-white rounded-lg border border-[#E4E7EB]" style={{boxShadow: '4px 4px 4px rgba(7, 8, 16, 0.10)'}}>
                      <div className="flex items-center gap-4">
                        <span className="w-[200px] text-[#050F1C] text-[10px] font-medium">Building Number</span>
                        {isEditing ? (
                          <input
                            type="text"
                            value={editFormData.buildingNumber || ''}
                            onChange={(e) => setEditFormData({...editFormData, buildingNumber: e.target.value})}
                            className="flex-1 px-2 py-1 border border-[#D4E1EA] rounded text-sm text-[#050F1C]"
                          />
                        ) : (
                          <span className="flex-1 text-[#050F1C] text-sm">{editFormData.buildingNumber || '45, Greenway Avenue'}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="w-[200px] text-[#050F1C] text-[10px] font-medium">Landmark</span>
                        {isEditing ? (
                          <input
                            type="text"
                            value={editFormData.landmark || ''}
                            onChange={(e) => setEditFormData({...editFormData, landmark: e.target.value})}
                            className="flex-1 px-2 py-1 border border-[#D4E1EA] rounded text-sm text-[#050F1C]"
                          />
                        ) : (
                          <span className="flex-1 text-[#050F1C] text-sm">{editFormData.landmark || 'Behind Excellence Hotel'}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="w-[200px] text-[#050F1C] text-[10px] font-medium">City</span>
                        {isEditing ? (
                          <input
                            type="text"
                            value={editFormData.city || ''}
                            onChange={(e) => setEditFormData({...editFormData, city: e.target.value})}
                            className="flex-1 px-2 py-1 border border-[#D4E1EA] rounded text-sm text-[#050F1C]"
                          />
                        ) : (
                          <span className="flex-1 text-[#050F1C] text-sm">{editFormData.city || 'Accra'}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="w-[200px] text-[#050F1C] text-[10px] font-medium">District</span>
                        {isEditing ? (
                          <input
                            type="text"
                            value={editFormData.district || ''}
                            onChange={(e) => setEditFormData({...editFormData, district: e.target.value})}
                            className="flex-1 px-2 py-1 border border-[#D4E1EA] rounded text-sm text-[#050F1C]"
                          />
                        ) : (
                          <span className="flex-1 text-[#050F1C] text-sm">{editFormData.district || 'Accra'}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="w-[200px] text-[#050F1C] text-[10px] font-medium">Region</span>
                        {isEditing ? (
                          <input
                            type="text"
                            value={editFormData.region || ''}
                            onChange={(e) => setEditFormData({...editFormData, region: e.target.value})}
                            className="flex-1 px-2 py-1 border border-[#D4E1EA] rounded text-sm text-[#050F1C]"
                          />
                        ) : (
                          <span className="flex-1 text-[#050F1C] text-sm">{editFormData.region || 'Greater Accra'}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="w-[200px] text-[#050F1C] text-[10px] font-medium">Country</span>
                        {isEditing ? (
                          <input
                            type="text"
                            value={editFormData.country || ''}
                            onChange={(e) => setEditFormData({...editFormData, country: e.target.value})}
                            className="flex-1 px-2 py-1 border border-[#D4E1EA] rounded text-sm text-[#050F1C]"
                          />
                        ) : (
                          <span className="flex-1 text-[#050F1C] text-sm">{editFormData.country || 'Ghana'}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="w-[200px] text-[#050F1C] text-[10px] font-medium">P.O Box</span>
                        {isEditing ? (
                          <input
                            type="text"
                            value={editFormData.poBox || ''}
                            onChange={(e) => setEditFormData({...editFormData, poBox: e.target.value})}
                            className="flex-1 px-2 py-1 border border-[#D4E1EA] rounded text-sm text-[#050F1C]"
                          />
                        ) : (
                          <span className="flex-1 text-[#050F1C] text-sm">{editFormData.poBox || 'GA-183-8164'}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="w-[200px] text-[#050F1C] text-[10px] font-medium">Phone</span>
                        {isEditing ? (
                          <input
                            type="text"
                            value={editFormData.phone || ''}
                            onChange={(e) => setEditFormData({...editFormData, phone: e.target.value})}
                            className="flex-1 px-2 py-1 border border-[#D4E1EA] rounded text-sm text-[#050F1C]"
                          />
                        ) : (
                          <span className="flex-1 text-[#050F1C] text-sm">{editFormData.phone || '+233445556666'}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="w-[200px] text-[#050F1C] text-[10px] font-medium">Email</span>
                        {isEditing ? (
                          <input
                            type="email"
                            value={editFormData.email || ''}
                            onChange={(e) => setEditFormData({...editFormData, email: e.target.value})}
                            className="flex-1 px-2 py-1 border border-[#D4E1EA] rounded text-sm text-[#050F1C]"
                          />
                        ) : (
                          <span className="flex-1 text-[#050F1C] text-sm">{editFormData.email || 'ecowindcorp@gmail.com'}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Financial Data */}
                  <div className="flex flex-col gap-4">
                    <span className="text-[#525866] text-xs">Financial Data</span>
                    <div className="flex flex-col gap-2 p-4 bg-white rounded-lg border border-[#E4E7EB]" style={{boxShadow: '4px 4px 4px rgba(7, 8, 16, 0.10)'}}>
                      <div className="flex items-center gap-4">
                        <span className="w-[200px] text-[#050F1C] text-[10px] font-medium">Authorized capital</span>
                        {isEditing ? (
                          <input
                            type="text"
                            value={editFormData.authorizedCapital || ''}
                            onChange={(e) => setEditFormData({...editFormData, authorizedCapital: e.target.value})}
                            className="flex-1 px-2 py-1 border border-[#D4E1EA] rounded text-sm text-[#050F1C]"
                          />
                        ) : (
                          <span className="flex-1 text-[#050F1C] text-sm">{editFormData.authorizedCapital || 'GHS 20m'}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="w-[200px] text-[#050F1C] text-[10px] font-medium">Total shares</span>
                        {isEditing ? (
                          <input
                            type="text"
                            value={editFormData.totalShares || ''}
                            onChange={(e) => setEditFormData({...editFormData, totalShares: e.target.value})}
                            className="flex-1 px-2 py-1 border border-[#D4E1EA] rounded text-sm text-[#050F1C]"
                          />
                        ) : (
                          <span className="flex-1 text-[#050F1C] text-sm">{editFormData.totalShares || '200,000,000'}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="w-[200px] text-[#050F1C] text-[10px] font-medium">Total assets</span>
                        {isEditing ? (
                          <input
                            type="text"
                            value={editFormData.totalAssets || ''}
                            onChange={(e) => setEditFormData({...editFormData, totalAssets: e.target.value})}
                            className="flex-1 px-2 py-1 border border-[#D4E1EA] rounded text-sm text-[#050F1C]"
                          />
                        ) : (
                          <span className="flex-1 text-[#050F1C] text-sm">{editFormData.totalAssets || '2,123'}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="w-[200px] text-[#050F1C] text-[10px] font-medium">Annual turnover</span>
                        {isEditing ? (
                          <input
                            type="text"
                            value={editFormData.annualTurnover || ''}
                            onChange={(e) => setEditFormData({...editFormData, annualTurnover: e.target.value})}
                            className="flex-1 px-2 py-1 border border-[#D4E1EA] rounded text-sm text-[#050F1C]"
                          />
                        ) : (
                          <span className="flex-1 text-[#050F1C] text-sm">{editFormData.annualTurnover || 'GHS 30m'}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Auditors */}
                  <div className="flex flex-col gap-4">
                    <span className="text-[#525866] text-xs">Auditors</span>
                    <div className="flex flex-col gap-2 p-4 bg-white rounded-lg border border-[#E4E7EB]" style={{boxShadow: '4px 4px 4px rgba(7, 8, 16, 0.10)'}}>
                      <div className="flex items-center gap-4">
                        <span className="w-[200px] text-[#050F1C] text-[10px] font-medium">Auditing firm</span>
                        {isEditing ? (
                          <input
                            type="text"
                            value={editFormData.auditingFirm || ''}
                            onChange={(e) => setEditFormData({...editFormData, auditingFirm: e.target.value})}
                            className="flex-1 px-2 py-1 border border-[#D4E1EA] rounded text-sm text-[#050F1C]"
                          />
                        ) : (
                          <span className="flex-1 text-[#050F1C] text-sm">{editFormData.auditingFirm || 'Benjamin Franklin Accounting Consultancy'}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="w-[200px] text-[#050F1C] text-[10px] font-medium">Appointment date</span>
                        {isEditing ? (
                          <input
                            type="text"
                            value={editFormData.appointmentDate || ''}
                            onChange={(e) => setEditFormData({...editFormData, appointmentDate: e.target.value})}
                            className="flex-1 px-2 py-1 border border-[#D4E1EA] rounded text-sm text-[#050F1C]"
                          />
                        ) : (
                          <span className="flex-1 text-[#050F1C] text-sm">{editFormData.appointmentDate || 'Friday, August 06, 2025'}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="w-[200px] text-[#050F1C] text-[10px] font-medium">Contact</span>
                        {isEditing ? (
                          <input
                            type="text"
                            value={editFormData.auditorContact || ''}
                            onChange={(e) => setEditFormData({...editFormData, auditorContact: e.target.value})}
                            className="flex-1 px-2 py-1 border border-[#D4E1EA] rounded text-sm text-[#050F1C]"
                          />
                        ) : (
                          <span className="flex-1 text-[#050F1C] text-sm">{editFormData.auditorContact || '+233445556666'}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="w-[200px] text-[#050F1C] text-[10px] font-medium">TIN</span>
                        {isEditing ? (
                          <input
                            type="text"
                            value={editFormData.auditorTin || ''}
                            onChange={(e) => setEditFormData({...editFormData, auditorTin: e.target.value})}
                            className="flex-1 px-2 py-1 border border-[#3B82F6] rounded text-sm text-[#3B82F6]"
                          />
                        ) : (
                          <span className="border-b border-[#3B82F6] text-[#3B82F6] text-sm">{editFormData.auditorTin || 'B009372287278'}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Profile */}
                  <div className="flex flex-col gap-4">
                    <span className="text-[#525866] text-xs">Profile</span>
                    <div className="flex flex-col gap-2 p-4 bg-white rounded-lg border border-[#E4E7EB]" style={{boxShadow: '4px 4px 4px rgba(7, 8, 16, 0.10)'}}>
                      <div className="flex items-center gap-4">
                        <span className="w-[200px] text-[#050F1C] text-[10px] font-medium">Status</span>
                        {isEditing ? (
                          <input
                            type="text"
                            value={editFormData.status || 'Active'}
                            onChange={(e) => setEditFormData({...editFormData, status: e.target.value})}
                            className="flex-1 px-2 py-1 border border-[#D4E1EA] rounded text-sm text-[#050F1C]"
                          />
                        ) : (
                          <span className="flex-1 text-[#050F1C] text-sm">{editFormData.status || 'Active'}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="w-[200px] text-[#050F1C] text-[10px] font-medium">Last updated</span>
                        {isEditing ? (
                          <input
                            type="text"
                            value={editFormData.lastUpdated || ''}
                            onChange={(e) => setEditFormData({...editFormData, lastUpdated: e.target.value})}
                            className="flex-1 px-2 py-1 border border-[#D4E1EA] rounded text-sm text-[#050F1C]"
                          />
                        ) : (
                          <span className="flex-1 text-[#050F1C] text-sm">{editFormData.lastUpdated || 'Friday, August 06, 2025'}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Beneficial Ownership */}
                  <div className="flex flex-col gap-4">
                    <span className="text-[#525866] text-xs">Beneficial Ownership details</span>
                    <div className="overflow-hidden rounded-2xl border border-[#E5E8EC]">
                      <div className="bg-[#F4F6F9] py-4 px-2">
                        <div className="flex items-center gap-3">
                          <div className="flex-1 min-w-[174px] px-2">
                            <span className="text-[#070810] text-sm font-bold">Beneficial Owner's name</span>
                          </div>
                          <div className="flex-1 min-w-[174px] px-2">
                            <span className="text-[#070810] text-sm font-bold">Position held</span>
                          </div>
                          <div className="flex-1 min-w-[174px] px-2">
                            <span className="text-[#070810] text-sm font-bold">TIN</span>
                          </div>
                          <div className="flex-1 min-w-[174px] px-2">
                            <span className="text-[#070810] text-sm font-bold">Ownership percent</span>
                          </div>
                          <div className="flex-1 min-w-[174px] px-2">
                            <span className="text-[#070810] text-sm font-bold">Acquisition date</span>
                          </div>
                          <div className="w-[140px] px-2">
                            <span className="text-[#070810] text-sm font-bold">Risk level</span>
                          </div>
                        </div>
                      </div>
                      <div className="bg-white">
                        {beneficialOwners.map((owner, idx) => (
                          <div key={idx} className={`flex items-center gap-3 py-3 px-2 ${idx < beneficialOwners.length - 1 ? 'border-b border-[#E5E8EC]' : ''}`}>
                            <div className="flex-1 min-w-[174px] px-2">
                              <span className="text-[#070810] text-sm">{owner.name}</span>
                            </div>
                            <div className="flex-1 min-w-[174px] px-2">
                              <span className="text-[#070810] text-sm">{owner.position}</span>
                            </div>
                            <div className="flex-1 min-w-[174px] px-2">
                              <span className="border-b border-[#3B82F6] text-[#3B82F6] text-sm">{owner.tin}</span>
                            </div>
                            <div className="flex-1 min-w-[174px] px-2">
                              <span className="text-[#070810] text-sm">{owner.ownership}</span>
                            </div>
                            <div className="flex-1 min-w-[174px] px-2">
                              <span className="text-[#070810] text-sm">{owner.acquisitionDate}</span>
                            </div>
                            <div className="w-[140px] px-2">
                              <div className="px-2 py-1 bg-[rgba(48.52,171.63,64.94,0.10)] rounded-lg">
                                <span className="text-[#10B981] text-xs font-medium">{owner.riskLevel}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Registration Documents */}
                  <div className="flex flex-col gap-4">
                    <span className="text-[#525866] text-xs">Registration documents</span>
                    <div className="overflow-hidden rounded-2xl border border-[#E5E8EC]">
                      <div className="bg-[#F4F6F9] py-4 px-2">
                        <div className="flex items-center gap-3">
                          <div className="flex-1 min-w-[250px] px-2">
                            <span className="text-[#070810] text-sm font-bold">File</span>
                          </div>
                          <div className="flex-1 min-w-[250px] px-2">
                            <span className="text-[#070810] text-sm font-bold">Document type</span>
                          </div>
                          <div className="flex-1 min-w-[250px] px-2">
                            <span className="text-[#070810] text-sm font-bold">Document date</span>
                          </div>
                        </div>
                      </div>
                      <div className="bg-white">
                        {registrationDocuments.map((doc, idx) => (
                          <div key={idx} className={`flex items-center gap-3 py-3 px-2 ${idx < registrationDocuments.length - 1 ? 'border-b border-[#E5E8EC]' : ''}`}>
                            <div className="flex-1 min-w-[250px] px-2">
                              <span className="border-b border-[#3B82F6] text-[#3B82F6] text-sm">{doc.file}</span>
                            </div>
                            <div className="flex-1 min-w-[250px] px-2">
                              <span className="text-[#070810] text-sm">{doc.type}</span>
                            </div>
                            <div className="flex-1 min-w-[250px] px-2">
                              <span className="text-[#070810] text-sm">{doc.date}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Export Button */}
                  <button className="self-start px-4 py-2 rounded-lg border border-[#F59E0B] flex items-center gap-1">
                    <span className="text-[#F59E0B] text-base font-medium">Export</span>
                    <ChevronRight className="w-4 h-4 text-[#F59E0B] rotate-90" />
                  </button>
                </div>
              )}

              {activeTab === 'directors' && (
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => setDirectorsPeriod('present')}
                        className={`px-4 py-2 rounded-lg ${directorsPeriod === 'present' ? 'bg-[#022658] text-white' : 'bg-[#F7F8FA] text-[#050F1C]'}`}
                      >
                        Present
                      </button>
                      <button
                        onClick={() => setDirectorsPeriod('past')}
                        className={`px-4 py-2 rounded-lg ${directorsPeriod === 'past' ? 'bg-[#022658] text-white' : 'bg-[#F7F8FA] text-[#050F1C]'}`}
                      >
                        Past
                      </button>
                    </div>
                  </div>
                  <div className="overflow-hidden rounded-2xl border border-[#E5E8EC]">
                    <div className="bg-[#F4F6F9] py-4 px-2">
                      <div className="flex items-center gap-3">
                        <div className="flex-1 min-w-[200px] px-2">
                          <span className="text-[#070810] text-sm font-bold">Name</span>
                        </div>
                        <div className="flex-1 min-w-[150px] px-2">
                          <span className="text-[#070810] text-sm font-bold">Contact</span>
                        </div>
                        <div className="flex-1 min-w-[120px] px-2">
                          <span className="text-[#070810] text-sm font-bold">Date of Birth</span>
                        </div>
                        <div className="flex-1 min-w-[120px] px-2">
                          <span className="text-[#070810] text-sm font-bold">Birth Place</span>
                        </div>
                        <div className="flex-1 min-w-[150px] px-2">
                          <span className="text-[#070810] text-sm font-bold">Appointment Date</span>
                        </div>
                        <div className="flex-1 min-w-[100px] px-2">
                          <span className="text-[#070810] text-sm font-bold">Cases</span>
                        </div>
                        <div className="w-[120px] px-2">
                          <span className="text-[#070810] text-sm font-bold">Risk Score</span>
                        </div>
                      </div>
                    </div>
                    <div className="bg-white">
                      {presentDirectors.map((director, idx) => (
                        <div key={idx} className={`flex items-center gap-3 py-3 px-2 ${idx < presentDirectors.length - 1 ? 'border-b border-[#E5E8EC]' : ''}`}>
                          <div className="flex-1 min-w-[200px] px-2">
                            <span className="text-[#070810] text-sm">{director.name}</span>
                          </div>
                          <div className="flex-1 min-w-[150px] px-2">
                            <span className="text-[#070810] text-sm">{director.contact}</span>
                          </div>
                          <div className="flex-1 min-w-[120px] px-2">
                            <span className="text-[#070810] text-sm">{director.dob}</span>
                          </div>
                          <div className="flex-1 min-w-[120px] px-2">
                            <span className="text-[#070810] text-sm">{director.birthPlace}</span>
                          </div>
                          <div className="flex-1 min-w-[150px] px-2">
                            <span className="text-[#070810] text-sm">{director.appointmentDate}</span>
                          </div>
                          <div className="flex-1 min-w-[100px] px-2">
                            <span className="text-[#070810] text-sm">{director.cases}</span>
                          </div>
                          <div className="w-[120px] px-2">
                            <div className="px-2 py-1 bg-[rgba(48.52,171.63,64.94,0.10)] rounded-lg">
                              <span className="text-[#10B981] text-xs font-medium">{director.riskScore}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'secretaries' && (
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <div className="w-[386px] px-2 py-1 bg-white rounded-lg border border-[#D4E1EA] flex justify-between items-center">
                      <button
                        onClick={() => setSecretariesPeriod('past')}
                        className={`w-[160px] h-[41px] px-2 py-2 rounded ${secretariesPeriod === 'past' ? 'bg-[#022658] text-white font-bold' : 'bg-transparent text-[#050F1C] font-normal'}`}
                      >
                        Past
                      </button>
                      <button
                        onClick={() => setSecretariesPeriod('present')}
                        className={`w-[160px] px-2 py-2 rounded ${secretariesPeriod === 'present' ? 'bg-[#022658] text-white font-bold' : 'bg-transparent text-[#050F1C] font-normal'}`}
                      >
                        Present
                      </button>
                    </div>
                  </div>
                  <div className="overflow-hidden rounded-2xl border border-[#E5E8EC]">
                    <div className="bg-[#F4F6F9] py-4 px-2">
                      <div className="flex items-center gap-3">
                        <div className="flex-1 min-w-[170px] px-2">
                          <span className="text-[#070810] text-sm font-bold">Name</span>
                        </div>
                        <div className="flex-1 min-w-[170px] px-2">
                          <span className="text-[#070810] text-sm font-bold">Contact</span>
                        </div>
                        <div className="flex-1 min-w-[170px] px-2">
                          <span className="text-[#070810] text-sm font-bold">Appointment date</span>
                        </div>
                        <div className="flex-1 min-w-[170px] px-2">
                          <span className="text-[#070810] text-sm font-bold">TIN</span>
                        </div>
                        <div className="flex-1 min-w-[170px] px-2">
                          <span className="text-[#070810] text-sm font-bold">Incorporation date</span>
                        </div>
                        <div className="flex-1 min-w-[170px] px-2">
                          <span className="text-[#070810] text-sm font-bold">Risk score</span>
                        </div>
                      </div>
                    </div>
                    <div className="bg-white">
                      {(secretariesPeriod === 'present' ? presentSecretaries : pastSecretaries).map((secretary, idx, array) => (
                        <div key={idx} className={`flex items-center gap-3 py-3 px-2 ${idx < array.length - 1 ? 'border-b border-[#E5E8EC]' : ''}`}>
                          <div className="flex-1 min-w-[170px] px-2">
                            <span className="text-[#070810] text-sm">{secretary.name}</span>
                          </div>
                          <div className="flex-1 min-w-[170px] px-2">
                            <span className="text-[#070810] text-sm">{secretary.contact}</span>
                          </div>
                          <div className="flex-1 min-w-[170px] px-2">
                            <span className="text-[#070810] text-sm">{secretary.appointmentDate}</span>
                          </div>
                          <div className="flex-1 min-w-[170px] px-2">
                            <span className="border-b border-[#3B82F6] text-[#3B82F6] text-sm">{secretary.tin}</span>
                          </div>
                          <div className="flex-1 min-w-[170px] px-2">
                            <span className="text-[#070810] text-sm">{secretary.incorporationDate}</span>
                          </div>
                          <div className="flex-1 min-w-[170px] px-2">
                            <div className="px-2 py-1 bg-[rgba(48.52,171.63,64.94,0.10)] rounded-lg">
                              <span className="text-[#10B981] text-xs font-medium">{secretary.riskScore}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'employees' && (
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => setEmployeesPeriod('present')}
                        className={`px-4 py-2 rounded-lg ${employeesPeriod === 'present' ? 'bg-[#022658] text-white' : 'bg-[#F7F8FA] text-[#050F1C]'}`}
                      >
                        Present
                      </button>
                      <button
                        onClick={() => setEmployeesPeriod('past')}
                        className={`px-4 py-2 rounded-lg ${employeesPeriod === 'past' ? 'bg-[#022658] text-white' : 'bg-[#F7F8FA] text-[#050F1C]'}`}
                      >
                        Past
                      </button>
                    </div>
                  </div>
                  <div className="overflow-hidden rounded-2xl border border-[#E5E8EC]">
                    <div className="bg-[#F4F6F9] py-4 px-2">
                      <div className="flex items-center gap-3">
                        <div className="flex-1 min-w-[200px] px-2">
                          <span className="text-[#070810] text-sm font-bold">Name</span>
                        </div>
                        <div className="flex-1 min-w-[150px] px-2">
                          <span className="text-[#070810] text-sm font-bold">Contact</span>
                        </div>
                        <div className="flex-1 min-w-[120px] px-2">
                          <span className="text-[#070810] text-sm font-bold">Position</span>
                        </div>
                        <div className="flex-1 min-w-[150px] px-2">
                          <span className="text-[#070810] text-sm font-bold">Appointment Date</span>
                        </div>
                        <div className="flex-1 min-w-[100px] px-2">
                          <span className="text-[#070810] text-sm font-bold">Cases</span>
                        </div>
                        <div className="w-[120px] px-2">
                          <span className="text-[#070810] text-sm font-bold">Risk Score</span>
                        </div>
                      </div>
                    </div>
                    <div className="bg-white">
                      {presentEmployees.map((employee, idx) => (
                        <div key={idx} className={`flex items-center gap-3 py-3 px-2 ${idx < presentEmployees.length - 1 ? 'border-b border-[#E5E8EC]' : ''}`}>
                          <div className="flex-1 min-w-[200px] px-2">
                            <span className="text-[#070810] text-sm">{employee.name}</span>
                          </div>
                          <div className="flex-1 min-w-[150px] px-2">
                            <span className="text-[#070810] text-sm">{employee.contact}</span>
                          </div>
                          <div className="flex-1 min-w-[120px] px-2">
                            <span className="text-[#070810] text-sm">{employee.position}</span>
                          </div>
                          <div className="flex-1 min-w-[150px] px-2">
                            <span className="text-[#070810] text-sm">{employee.appointmentDate}</span>
                          </div>
                          <div className="flex-1 min-w-[100px] px-2">
                            <span className="text-[#070810] text-sm">{employee.cases}</span>
                          </div>
                          <div className="w-[120px] px-2">
                            <div className="px-2 py-1 bg-[rgba(48.52,171.63,64.94,0.10)] rounded-lg">
                              <span className="text-[#10B981] text-xs font-medium">{employee.riskScore}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'regulatory' && (
                <div className="flex flex-col gap-4">
                  <div className="overflow-hidden rounded-2xl border border-[#E5E8EC]">
                    <div className="bg-[#F4F6F9] py-4 px-2">
                      <div className="flex items-center gap-3">
                        <div className="flex-1 min-w-[200px] px-2">
                          <span className="text-[#070810] text-sm font-bold">Regulatory Body</span>
                        </div>
                        <div className="flex-1 min-w-[150px] px-2">
                          <span className="text-[#070810] text-sm font-bold">License/Permit Number</span>
                        </div>
                        <div className="flex-1 min-w-[120px] px-2">
                          <span className="text-[#070810] text-sm font-bold">Status</span>
                        </div>
                        <div className="flex-1 min-w-[150px] px-2">
                          <span className="text-[#070810] text-sm font-bold">Violations</span>
                        </div>
                        <div className="flex-1 min-w-[120px] px-2">
                          <span className="text-[#070810] text-sm font-bold">Actions</span>
                        </div>
                        <div className="flex-1 min-w-[120px] px-2">
                          <span className="text-[#070810] text-sm font-bold">Date</span>
                        </div>
                      </div>
                    </div>
                    <div className="bg-white">
                      {regulatoryList.map((item, idx) => (
                        <div key={idx} className={`flex items-center gap-3 py-3 px-2 ${idx < regulatoryList.length - 1 ? 'border-b border-[#E5E8EC]' : ''}`}>
                          <div className="flex-1 min-w-[200px] px-2">
                            <span className="text-[#070810] text-sm">{item.body}</span>
                          </div>
                          <div className="flex-1 min-w-[150px] px-2">
                            <span className="text-[#070810] text-sm">{item.licenseNumber}</span>
                          </div>
                          <div className="flex-1 min-w-[120px] px-2">
                            <div className={`px-2 py-1 rounded-lg ${
                              item.status === 'Valid' ? 'bg-[rgba(48.52,171.63,64.94,0.10)] text-[#10B981]' :
                              item.status === 'Expired' ? 'bg-[rgba(243,111,38,0.10)] text-[#F59E0B]' :
                              'bg-[rgba(243,89.25,38,0.10)] text-[#EF4444]'
                            }`}>
                              <span className="text-xs font-medium">{item.status}</span>
                            </div>
                          </div>
                          <div className="flex-1 min-w-[150px] px-2">
                            <span className="text-[#070810] text-sm">{item.violations}</span>
                          </div>
                          <div className="flex-1 min-w-[120px] px-2">
                            <span className="text-[#070810] text-sm">{item.actions}</span>
                          </div>
                          <div className="flex-1 min-w-[120px] px-2">
                            <span className="text-[#070810] text-sm">{item.date}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'cases' && (
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => setCasesPeriod('active')}
                        className={`px-4 py-2 rounded-lg ${casesPeriod === 'active' ? 'bg-[#022658] text-white' : 'bg-[#F7F8FA] text-[#050F1C]'}`}
                      >
                        Active
                      </button>
                      <button
                        onClick={() => setCasesPeriod('closed')}
                        className={`px-4 py-2 rounded-lg ${casesPeriod === 'closed' ? 'bg-[#022658] text-white' : 'bg-[#F7F8FA] text-[#050F1C]'}`}
                      >
                        Closed
                      </button>
                    </div>
                  </div>
                  <div className="overflow-hidden rounded-2xl border border-[#E5E8EC]">
                    <div className="bg-[#F4F6F9] py-4 px-2">
                      <div className="flex items-center gap-3">
                        <div className="flex-1 min-w-[250px] px-2">
                          <span className="text-[#070810] text-sm font-bold">Case Title</span>
                        </div>
                        <div className="flex-1 min-w-[150px] px-2">
                          <span className="text-[#070810] text-sm font-bold">Suit No.</span>
                        </div>
                        <div className="flex-1 min-w-[150px] px-2">
                          <span className="text-[#070810] text-sm font-bold">{casesPeriod === 'active' ? 'Date Filed' : 'Filed On'}</span>
                        </div>
                        <div className="flex-1 min-w-[150px] px-2">
                          <span className="text-[#070810] text-sm font-bold">Court</span>
                        </div>
                        <div className="flex-1 min-w-[120px] px-2">
                          <span className="text-[#070810] text-sm font-bold">Status</span>
                        </div>
                        <div className="w-[100px] px-2">
                          <span className="text-[#070810] text-sm font-bold">Action</span>
                        </div>
                      </div>
                    </div>
                    <div className="bg-white">
                      {(casesPeriod === 'active' ? activeCases : closedCases).map((caseItem, idx, array) => (
                        <div key={idx} className={`flex items-center gap-3 py-3 px-2 ${idx < array.length - 1 ? 'border-b border-[#E5E8EC]' : ''}`}>
                          <div className="flex-1 min-w-[250px] px-2">
                            <span className="text-[#070810] text-sm">{caseItem.title}</span>
                          </div>
                          <div className="flex-1 min-w-[150px] px-2">
                            <span className="text-[#070810] text-sm">{caseItem.suitNo}</span>
                          </div>
                          <div className="flex-1 min-w-[150px] px-2">
                            <span className="text-[#070810] text-sm">{caseItem.dateFiled || caseItem.filedOn}</span>
                          </div>
                          <div className="flex-1 min-w-[150px] px-2">
                            <span className="text-[#070810] text-sm">{caseItem.court || caseItem.courtName}</span>
                          </div>
                          <div className="flex-1 min-w-[120px] px-2">
                            <div className={`px-2 py-1 rounded-lg ${
                              caseItem.status === 'Ongoing' ? 'bg-[rgba(48.52,171.63,64.94,0.10)] text-[#10B981]' :
                              'bg-[rgba(243,89.25,38,0.10)] text-[#EF4444]'
                            }`}>
                              <span className="text-xs font-medium">{caseItem.status}</span>
                            </div>
                          </div>
                          <div className="w-[100px] px-2">
                            <button 
                              onClick={() => setSelectedCase(caseItem)}
                              className="flex items-center gap-1 text-[#022658] text-sm font-bold hover:opacity-70"
                            >
                              <span>View</span>
                              <ChevronRight className="w-4 h-4 text-[#050F1C]" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'bulletin' && (
                <div className="flex flex-col gap-4">
                  <div className="overflow-hidden rounded-2xl border border-[#E5E8EC]">
                    <div className="bg-[#F4F6F9] py-4 px-2">
                      <div className="flex items-center gap-3">
                        <div className="flex-1 min-w-[150px] px-2">
                          <span className="text-[#070810] text-sm font-bold">Date Signing</span>
                        </div>
                        <div className="flex-1 min-w-[150px] px-2">
                          <span className="text-[#070810] text-sm font-bold">Notice Type</span>
                        </div>
                        <div className="flex-1 min-w-[250px] px-2">
                          <span className="text-[#070810] text-sm font-bold">Description</span>
                        </div>
                        <div className="flex-1 min-w-[200px] px-2">
                          <span className="text-[#070810] text-sm font-bold">Bulletin No.</span>
                        </div>
                        <div className="flex-1 min-w-[150px] px-2">
                          <span className="text-[#070810] text-sm font-bold">Upload Date</span>
                        </div>
                      </div>
                    </div>
                    <div className="bg-white">
                      {bulletinData.map((item, idx) => (
                        <div key={idx} className={`flex items-center gap-3 py-3 px-2 ${idx < bulletinData.length - 1 ? 'border-b border-[#E5E8EC]' : ''}`}>
                          <div className="flex-1 min-w-[150px] px-2">
                            <span className="text-[#070810] text-sm">{item.dateSigning}</span>
                          </div>
                          <div className="flex-1 min-w-[150px] px-2">
                            <span className="text-[#070810] text-sm">{item.noticeType}</span>
                          </div>
                          <div className="flex-1 min-w-[250px] px-2">
                            <span className="text-[#070810] text-sm">{item.description}</span>
                          </div>
                          <div className="flex-1 min-w-[200px] px-2">
                            <span className="text-[#070810] text-sm">{item.bulletinNo}</span>
                          </div>
                          <div className="flex-1 min-w-[150px] px-2">
                            <span className="text-[#070810] text-sm">{item.uploadDate}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'risk' && (
                <div className="flex flex-col gap-4">
                  {/* Circular Chart Section */}
                  <div className="p-6 bg-white rounded-2xl border border-[#E4E7EB] flex flex-col gap-4"
                    style={{ boxShadow: '4px 4px 4px rgba(7, 8, 16, 0.10)' }}
                  >
                    <div className="relative w-full h-[439px] flex items-center justify-center">
                      {/* Left Labels with Connector Lines */}
                      <div className="absolute left-0 top-[34px] flex flex-col gap-6 w-[248px] relative">
                        <div className="flex flex-col items-end gap-0.5">
                          <span className="text-[#10B981] text-lg font-bold">+8 points</span>
                          <span className="text-[#050F1C] text-base text-right">GHS 185,000 total exposure (moderate)</span>
                        </div>
                        <div className="flex flex-col items-end gap-0.5">
                          <span className="text-[#3B82F6] text-lg font-bold">+40 points</span>
                          <span className="text-[#050F1C] text-base text-right">20 cases won (Plaintiff in most)</span>
                        </div>
                        <div className="flex flex-col items-end gap-0.5">
                          <span className="text-[#3B82F6] text-lg font-bold">+10 points</span>
                          <span className="text-[#050F1C] text-base text-right">1 active case (ongoing risk)</span>
                        </div>
                        {/* Connector Lines */}
                        <div className="absolute right-0 top-[34px] w-[126px] h-[29px] border-b-2 border-l-2 border-[#B1B9C6]" style={{ borderStyle: 'dashed' }}></div>
                        <div className="absolute right-0 top-[162px] w-[152px] h-[23px] border-t-2 border-l-2 border-[#B1B9C6]" style={{ borderStyle: 'dashed' }}></div>
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
                                  #10B981 0deg 8deg,
                                  #3B82F6 8deg 48deg,
                                  #3B82F6 48deg 58deg,
                                  #EF4444 58deg 91deg,
                                  #EF4444 91deg 360deg
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
                      <div className="absolute right-0 top-[63px] flex flex-col gap-6 w-[204px]">
                        <div className="flex flex-col gap-1">
                          <span className="text-[#EF4444] text-lg font-bold">+35 points</span>
                          <span className="text-[#050F1C] text-base font-normal">Lost 12 cases (unfavourable outcome)</span>
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="text-[#B1B9C6] text-lg font-bold">+0 points</span>
                          <span className="text-[#050F1C] text-base font-normal">Civil disputes (not criminal)</span>
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="text-[#EF4444] text-lg font-bold">+33 points</span>
                          <span className="text-[#050F1C] text-base font-normal">Defendant in 14 cases</span>
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
                          { factor: 'Case Frequency', weight: '30%', desc: 'Number of legal disputes in the past 3 years', value: '5 cases', points: '30' },
                          { factor: 'Case Outcomes', weight: '20%', desc: 'Ratio of lost to won cases', value: '60% lost', points: '20' },
                          { factor: 'Financial Exposure', weight: '20%', desc: 'Total quantum (amount in dispute)', value: 'GHS 1,200,000', points: '20' },
                          { factor: 'Regulatory Actions', weight: '10%', desc: 'Gazette notices / penalties', value: '2 recorded', points: '8' },
                          { factor: 'Case Recency', weight: '10%', desc: 'Time since last recorded case', value: '4 months ago', points: '8' },
                          { factor: 'Data Completeness', weight: '10%', desc: 'Accuracy & profile completeness', value: '85%', points: '7' },
                          { factor: 'Total Weighted Score', weight: '100%', desc: '-', value: '-', points: '90' }
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
                          { indicator: '🧾 Pending Cases', status: '3', desc: 'Active in High Court and Commercial Division' },
                          { indicator: '⚖️ Judgments Lost', status: '2', desc: 'Breach of Contract, Rent Dispute' },
                          { indicator: '🏢 Commercial bulletin Mentions', status: '2', desc: 'Revocation notice (2023), Penalty listing (2024)' },
                          { indicator: '🕒 Last Legal Activity', status: 'July 2025', desc: 'Ongoing lease dispute' },
                          { indicator: '💰 Total Dispute Value', status: 'GHS 1.2M', desc: 'Across all open cases' }
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
                          { caseNo: 'CM/0190/2022', type: 'Rent Dispute', court: 'District Court', status: 'Closed', outcome: 'Lost', quantum: '80,000', weight: '10%' },
                          { caseNo: 'CM/0111/2021', type: 'Regulatory Action', court: 'Tribunal', status: 'Closed', outcome: 'Won', quantum: '0', weight: '5%' },
                          { caseNo: 'CM/0088/2020', type: 'Breach of Contract', court: 'High Court', status: 'Closed', outcome: 'Lost', quantum: '100,000', weight: '12%' }
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
                              <span className={`text-sm font-bold ${row.outcome === 'Won' ? 'text-[#10B981]' : row.outcome === 'Lost' ? 'text-[#EF4444]' : 'text-[#050F1C]'}`}>{row.outcome}</span>
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
                      <span className="text-center text-[#525866] text-base font-normal">EcoWind Risk Score</span>
                      <span className="text-[#EF4444] text-lg font-medium">92</span>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                      <span className="text-center text-[#525866] text-base font-normal">Industry Average (Renewable Energy)</span>
                      <span className="text-[#10B981] text-lg font-medium">54</span>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                      <span className="text-center text-[#525866] text-base font-normal">Bottom Quartile</span>
                      <span className="text-[#F59E0B] text-lg font-medium">60</span>
                    </div>
                  </div>

                  {/* Risk Score Explanation */}
                  <div className="flex flex-col gap-2">
                    <span className="text-[#050F1C] text-lg font-normal">Risk Score Explanation</span>
                    <div className="text-[#050F1C] text-base">
                      <span className="font-medium">Why High Risk:</span>
                      <span> 32 court cases in total (high litigation frequency), Lost the concluded case with judgment in opponents favour, Acting as Defendant (being sued for wrongdoing), a number of regulatory violations, losing a number of cases or adverse judgments, Total claim values are high for professional level.</span>
                      <br/><br/>
                      <span className="font-medium">Contributing Factors:</span>
                      <span> One ongoing commercial dispute (adds minor uncertainty), Total claim exposure of GHS 1,185,000 (not so manageable).</span>
                    </div>
                  </div>

                  {/* Recommendation */}
                  <div className="w-full">
                    <span className="text-[#10B981] text-base font-medium">Recommendation:</span>
                    <span className="text-[#050F1C] text-base font-normal"> Not suitable for credit facilities and business partnerships. High legal risk profile.</span>
                  </div>

                  {/* Export Button */}
                  <button className="h-8 px-4 py-2 rounded-lg border border-[#F59E0B] text-[#F59E0B] text-base font-medium flex items-center gap-1 hover:opacity-70 w-fit">
                    <span>Export</span>
                    <ChevronDown className="w-4 h-4 text-[#F59E0B]" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CorporateClientCompanyDetails;

