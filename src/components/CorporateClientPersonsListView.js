import React, { useState } from 'react';
import { Bell, ChevronRight, ChevronLeft, CreditCard, ChevronDown, Search, Filter, ArrowUpDown, Users, Building2, Database } from 'lucide-react';
import CorporateClientPersonDetails from './CorporateClientPersonDetails';

const CorporateClientPersonsListView = ({ userInfo, industry, entity, onBack, onSelectPerson }) => {
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [currentPage, setCurrentPage] = useState(101);
  const [pageInput, setPageInput] = useState('101');
  const [searchQuery, setSearchQuery] = useState('');

  const userName = userInfo?.first_name && userInfo?.last_name 
    ? `${userInfo.first_name} ${userInfo.last_name}` 
    : 'Tonia Martins';
  const organizationName = userInfo?.organization || 'Access Bank';

  const personsData = [
    {
      name: 'John Louis',
      contact: '+2334455666',
      dob: '10-10-1978',
      birthPlace: 'Ashanti',
      position: 'Manager',
      appointmentDate: '12/07/2001',
      cases: 2,
      riskScore: 5,
      riskLevel: 'Low',
      riskColor: 'rgba(48.52, 171.63, 64.94, 0.10)',
      riskTextColor: '#10B981'
    },
    {
      name: 'Esther James',
      contact: '+2334455666',
      dob: '03-11-2000',
      birthPlace: 'Accra',
      position: 'Floor Manager',
      appointmentDate: '23/06/2020',
      cases: 0,
      riskScore: 0,
      riskLevel: 'Low',
      riskColor: 'rgba(48.52, 171.63, 64.94, 0.10)',
      riskTextColor: '#10B981'
    },
    {
      name: 'Janet Benson',
      contact: '+2334455666',
      dob: '03-11-2000',
      birthPlace: 'Accra',
      position: 'Cashier',
      appointmentDate: '23/06/2020',
      cases: 0,
      riskScore: 0,
      riskLevel: 'Low',
      riskColor: 'rgba(48.52, 171.63, 64.94, 0.10)',
      riskTextColor: '#10B981'
    },
    {
      name: 'Fani Carl',
      contact: '+2334455666',
      dob: '15-11-1990',
      birthPlace: 'Kumasi',
      position: 'Cashier',
      appointmentDate: '15/01/2017',
      cases: 2,
      riskScore: 46,
      riskLevel: 'Medium',
      riskColor: 'rgba(243, 111, 38, 0.10)',
      riskTextColor: '#F59E0B'
    },
    {
      name: 'Cynthia Morgan',
      contact: '+2334455666',
      dob: '15-11-1990',
      birthPlace: 'Kumasi',
      position: 'Cashier',
      appointmentDate: '15/01/2017',
      cases: 1,
      riskScore: 46,
      riskLevel: 'Medium',
      riskColor: 'rgba(243, 111, 38, 0.10)',
      riskTextColor: '#F59E0B'
    },
    {
      name: 'Eli Brandon',
      contact: '+2334455666',
      dob: '03-11-2000',
      birthPlace: 'Greater Accra',
      position: 'Cashier',
      appointmentDate: '15/01/2017',
      cases: 4,
      riskScore: 10,
      riskLevel: 'Low',
      riskColor: 'rgba(48.52, 171.63, 64.94, 0.10)',
      riskTextColor: '#10B981'
    },
    {
      name: 'Elijah Brooks',
      contact: '+2334455666',
      dob: '03-11-2000',
      birthPlace: 'Greater Accra',
      position: 'Cashier',
      appointmentDate: '15/01/2017',
      cases: 4,
      riskScore: 10,
      riskLevel: 'Low',
      riskColor: 'rgba(48.52, 171.63, 64.94, 0.10)',
      riskTextColor: '#10B981'
    }
  ];

  const totalPages = 125;
  const itemsPerPage = 10;
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, 1250);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      setPageInput(page.toString());
    }
  };

  const handlePageInputChange = (e) => {
    setPageInput(e.target.value);
  };

  const handleGoToPage = () => {
    const page = parseInt(pageInput);
    if (!isNaN(page) && page >= 1 && page <= totalPages) {
      handlePageChange(page);
    } else {
      setPageInput(currentPage.toString());
    }
  };

  const handlePersonClick = (person) => {
    setSelectedPerson(person);
    if (onSelectPerson) {
      onSelectPerson(person);
    }
  };

  const handleBackToList = () => {
    setSelectedPerson(null);
  };

  // If a person is selected, show the person details
  if (selectedPerson) {
    return (
      <CorporateClientPersonDetails
        userInfo={userInfo}
        industry={industry}
        entity={entity}
        person={selectedPerson}
        onBack={handleBackToList}
      />
    );
  }

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
          <div className="flex flex-col self-stretch bg-white py-4 px-4 gap-6 rounded-lg">
            {/* Breadcrumb */}
            <span className="text-[#525866] text-xs font-normal opacity-75">
              PERSONS
            </span>

            {/* Title Section */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-1">
                <button
                  onClick={onBack}
                  className="p-2 bg-[#F7F8FA] rounded-lg hover:opacity-70"
                >
                  <ChevronLeft className="w-4 h-4 text-[#050F1C]" />
                </button>
                <CreditCard className="w-4 h-4 text-[#050F1C]" />
                <span className="text-[#050F1C] text-xl font-semibold" style={{ fontFamily: 'Roboto' }}>
                  Persons
                </span>
              </div>
              <span className="text-[#070810] text-sm font-normal opacity-75" style={{ fontFamily: 'Roboto' }}>
                Search through all the persons in our database
              </span>
            </div>

            {/* Stats Cards */}
            <div className="flex items-center self-stretch gap-3">
              <div className="flex-1 p-2 bg-white rounded-lg border border-[#D4E1EA] flex items-center gap-3">
                <div className="p-2 bg-[#F7F8FA] rounded-lg">
                  <Users className="w-6 h-6 text-[#868C98]" />
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[#868C98] text-xs font-normal">
                    Total number of Persons
                  </span>
                  <span className="text-[#F59E0B] text-base font-medium">
                    387,3456
                  </span>
                </div>
              </div>
              <div className="flex-1 p-2 bg-white rounded-lg border border-[#D4E1EA] flex items-center gap-3">
                <div className="p-2 bg-[#F7F8FA] rounded-lg">
                  <Building2 className="w-6 h-6 text-[#868C98]" />
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[#868C98] text-xs font-normal">
                    Total Companies linked to persons
                  </span>
                  <span className="text-[#F59E0B] text-base font-medium">
                    1,069
                  </span>
                </div>
              </div>
              <div className="flex-1 p-2 bg-white rounded-lg border border-[#D4E1EA] flex items-center gap-3">
                <div className="p-2 bg-[#F7F8FA] rounded-lg">
                  <Database className="w-6 h-6 text-[#868C98]" />
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[#868C98] text-xs font-normal">
                    Total amount of related data
                  </span>
                  <span className="text-[#F59E0B] text-base font-medium">
                    1,234,379
                  </span>
                </div>
              </div>
            </div>

            {/* Search and Filter Section */}
            <div className="flex flex-col self-stretch gap-4 p-4 bg-white rounded-3xl">
              <div className="flex justify-between items-start self-stretch">
                <div className="flex-1 relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                    <Search className="w-4 h-4 text-[#868C98]" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search Person"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
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
                    <div className="w-[125px] px-2">
                      <span className="text-[#070810] text-sm font-bold">Name</span>
                    </div>
                    <div className="w-[125px] px-2">
                      <span className="text-[#070810] text-sm font-bold">Contact</span>
                    </div>
                    <div className="w-[125px] px-2">
                      <span className="text-[#070810] text-sm font-bold">D-O-B</span>
                    </div>
                    <div className="w-[125px] px-2">
                      <span className="text-[#070810] text-sm font-bold">Birth place</span>
                    </div>
                    <div className="w-[125px] px-2">
                      <span className="text-[#070810] text-sm font-bold">Position</span>
                    </div>
                    <div className="w-[125px] px-2">
                      <span className="text-[#070810] text-sm font-bold">Appointment date</span>
                    </div>
                    <div className="w-[125px] px-2">
                      <span className="text-[#070810] text-sm font-bold">Cases</span>
                    </div>
                    <div className="w-[125px] px-2 flex justify-center">
                      <span className="text-[#070810] text-sm font-bold">Risk score</span>
                    </div>
                  </div>
                </div>

                {/* Table Body */}
                <div className="bg-white w-full">
                  {personsData.map((person, index, array) => (
                    <div
                      key={index}
                      onClick={() => handlePersonClick(person)}
                      className="flex items-center gap-3 py-3 px-3 w-full cursor-pointer hover:bg-gray-50 transition-colors"
                      style={{
                        borderBottom: index < array.length - 1 ? '0.40px solid #E5E8EC' : 'none'
                      }}
                    >
                      <div className="w-[125px] px-2">
                        <span className="text-[#070810] text-sm font-normal">{person.name}</span>
                      </div>
                      <div className="w-[125px] px-2">
                        <span className="text-[#070810] text-sm font-normal">{person.contact}</span>
                      </div>
                      <div className="w-[125px] px-2">
                        <span className="text-[#070810] text-sm font-normal">{person.dob}</span>
                      </div>
                      <div className="w-[125px] px-2">
                        <span className="text-[#070810] text-sm font-normal">{person.birthPlace}</span>
                      </div>
                      <div className="w-[125px] px-2">
                        <span className="text-[#070810] text-sm font-normal">{person.position}</span>
                      </div>
                      <div className="w-[125px] px-2">
                        <span className="text-[#070810] text-sm font-normal">{person.appointmentDate}</span>
                      </div>
                      <div className="w-[125px] px-2">
                        <span className="text-[#070810] text-sm font-normal">{person.cases}</span>
                      </div>
                      <div className="w-[125px] px-2 flex justify-center">
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

            {/* Pagination */}
            <div className="flex justify-between items-center self-stretch">
              <span className="text-[#525866] text-sm font-normal">
                {startItem}-{endItem} of 1,250
              </span>
              <div className="flex items-center gap-10">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="h-8 px-3 py-2 bg-white rounded border border-[#D4E1EA] flex items-center gap-1 hover:opacity-70 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-4 h-4 text-[#868C98]" />
                    <span className="text-[#525866] text-xs font-normal">Back</span>
                  </button>
                  {currentPage > 3 && (
                    <button
                      onClick={() => handlePageChange(1)}
                      className="px-2 py-2 bg-white rounded border border-[#D4E1EA] text-[#525866] text-xs font-normal hover:opacity-70"
                    >
                      1
                    </button>
                  )}
                  {currentPage > 4 && (
                    <div className="w-8 h-8 px-3 py-2 flex items-center justify-center">
                      <div className="flex gap-1">
                        <div className="w-1 h-1 bg-[#525866] rounded-full"></div>
                        <div className="w-1 h-1 bg-[#525866] rounded-full"></div>
                        <div className="w-1 h-1 bg-[#525866] rounded-full"></div>
                      </div>
                    </div>
                  )}
                  {[...Array(5)].map((_, i) => {
                    const page = currentPage - 2 + i;
                    if (page < 1 || page > totalPages) return null;
                    return (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`px-2 py-2 rounded ${
                          page === currentPage
                            ? 'bg-[#022658] text-white'
                            : 'bg-white border border-[#D4E1EA] text-[#525866]'
                        } text-xs font-normal hover:opacity-70`}
                      >
                        {page}
                      </button>
                    );
                  })}
                  {currentPage < totalPages - 3 && (
                    <div className="w-8 h-8 px-3 py-2 flex items-center justify-center">
                      <div className="flex gap-1">
                        <div className="w-1 h-1 bg-[#525866] rounded-full"></div>
                        <div className="w-1 h-1 bg-[#525866] rounded-full"></div>
                        <div className="w-1 h-1 bg-[#525866] rounded-full"></div>
                      </div>
                    </div>
                  )}
                  {currentPage < totalPages - 2 && (
                    <button
                      onClick={() => handlePageChange(totalPages)}
                      className="px-2 py-2 bg-white rounded border border-[#D4E1EA] text-[#525866] text-xs font-normal hover:opacity-70"
                    >
                      {totalPages}
                    </button>
                  )}
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="h-8 px-3 py-2 bg-white rounded border border-[#D4E1EA] flex items-center gap-1 hover:opacity-70 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="text-[#525866] text-xs font-normal">Next</span>
                    <ChevronRight className="w-4 h-4 text-[#868C98]" />
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[#050F1C] text-sm font-normal">Page</span>
                  <input
                    type="text"
                    value={pageInput}
                    onChange={handlePageInputChange}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleGoToPage();
                      }
                    }}
                    className="w-[51px] h-8 px-2 py-1 bg-white rounded border border-[#F59E0B] text-[#050F1C] text-sm font-normal outline-none text-center"
                  />
                  <button
                    onClick={handleGoToPage}
                    className="text-[#F59E0B] text-sm font-bold hover:opacity-70"
                  >
                    Go
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CorporateClientPersonsListView;

