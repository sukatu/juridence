import React, { useState } from 'react';
import { Search, ChevronLeft, ChevronRight, Filter, ArrowUpDown, Bell, Users } from 'lucide-react';
import RegistrarDetailsPage from './RegistrarDetailsPage';
import RegistrarHeader from './RegistrarHeader';

const RegistrarsPage = ({ userInfo, onNavigate, onLogout }) => {
  const [selectedRegistrar, setSelectedRegistrar] = useState(null);
  const [currentPage, setCurrentPage] = useState(101);
  const [pageInput, setPageInput] = useState('101');

  const registrarsData = [
    {
      name: 'Mrs. Ama Ofori',
      id: 'REG_00013',
      email: 'ama.ofori@judiciary.gov.gh',
      contact: '+2334455666',
      dob: '02 July 1980',
      gender: 'Female',
      title: 'Deputy Registrar',
      appointmentDate: '12/07/2001',
      yearsOfService: '23 years',
      status: 'Active',
      totalCases: 120,
      totalCauseLists: 48,
      totalPendingTasks: 4
    },
    {
      name: 'Mr. James Oli',
      id: 'REG_00071',
      contact: '+2334455666',
      dob: '02 May 1981',
      gender: 'Male',
      title: 'Registrar',
      appointmentDate: '12/07/2002',
      yearsOfService: '22 years',
      status: 'Active'
    },
    {
      name: 'Ms. Linda Mensah',
      id: 'REG_00045',
      contact: '+2334455667',
      dob: '15 March 1985',
      gender: 'Female',
      title: 'Assistant Registrar',
      appointmentDate: '12/07/2005',
      yearsOfService: '18 years',
      status: 'Active'
    },
    {
      name: 'Mrs. Esi Agyeman',
      id: 'REG_00052',
      contact: '+2334455669',
      dob: '22 September 1990',
      gender: 'Female',
      title: 'Registrar',
      appointmentDate: '12/07/2020',
      yearsOfService: '3 years',
      status: 'Active'
    },
    {
      name: 'Mr. Samuel Baffoe',
      id: 'REG_00110',
      contact: '+2334455670',
      dob: '05 January 1982',
      gender: 'Male',
      title: 'Deputy Registrar',
      appointmentDate: '12/07/2010',
      yearsOfService: '13 years',
      status: 'Active'
    },
    {
      name: 'Mrs. Esi Agyeman',
      id: 'REG_00052',
      contact: '+2334455669',
      dob: '22 September 1990',
      gender: 'Female',
      title: 'Registrar',
      appointmentDate: '12/07/2020',
      yearsOfService: '3 years',
      status: 'Active'
    }
  ];

  // Use userInfo from props or localStorage
  const displayUserInfo = userInfo || JSON.parse(localStorage.getItem('userData') || '{}');

  const totalRegistrars = 87;
  const totalPages = 125;
  const startRange = 110;
  const endRange = 120;
  const totalItems = 1250;

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
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    } else {
      setPageInput(currentPage.toString());
    }
  };

  // If a registrar is selected, show the details page
  if (selectedRegistrar) {
    return <RegistrarDetailsPage registrar={selectedRegistrar} onBack={() => setSelectedRegistrar(null)} />;
  }

  return (
    <div className="flex-1 bg-[#F7F8FA] pr-6 rounded-lg">
      <div className="flex items-start gap-6">
        {/* Main Content */}
        <div className="flex-1 flex flex-col bg-[#F7F8FA] pt-2 pb-[52px] gap-4">
          {/* Header */}
          <RegistrarHeader userInfo={displayUserInfo} onNavigate={onNavigate} onLogout={onLogout} />
          
          {/* Page Title Section */}
          <div className="px-1.5 pb-2 border-b border-[#D4E1EA]">
            <div className="flex flex-col items-start w-[263px] gap-1">
              <span className="text-[#050F1C] text-xl font-medium">
                High Court (Commercial),
              </span>
              <span className="text-[#050F1C] text-base font-normal opacity-75">
                Track all your activities here.
              </span>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex flex-col self-stretch bg-white py-4 px-4 gap-6 rounded-lg">
            {/* Page Header */}
            <div className="flex flex-col items-start self-stretch gap-2">
              <span className="text-[#525866] text-xs font-normal opacity-75">
                REGISTRARS
              </span>
              <div className="flex items-center gap-1">
                <ChevronRight className="w-4 h-4 text-[#050F1C] rotate-180" />
                <Users className="w-4 h-4 text-[#050F1C]" />
                <span className="text-[#050F1C] text-xl font-semibold" style={{ fontFamily: 'Roboto' }}>
                  Registrars
                </span>
              </div>
              <span className="text-[#070810] text-sm font-normal opacity-75" style={{ fontFamily: 'Roboto' }}>
                Search through all the persons in our database
              </span>
            </div>

            {/* Stats Card and Add Button */}
            <div className="flex items-center self-stretch gap-4">
              {/* Stats Card */}
              <div className="w-[272px] p-2 bg-white rounded-lg border border-[#D4E1EA] flex items-center gap-3">
                <div className="p-2 bg-[#F7F8FA] rounded-lg">
                  <Users className="w-6 h-6 text-[#868C98]" />
                </div>
                <div className="flex flex-col justify-center items-start gap-1">
                  <span className="text-[#868C98] text-xs font-normal">
                    Total number of Registrars
                  </span>
                  <span className="text-[#F59E0B] text-base font-medium">
                    {totalRegistrars}
                  </span>
                </div>
              </div>

              {/* Add new Registrar Button */}
              <button
                className="flex-1 h-[58px] px-2.5 rounded-lg border-4 border-[#0F284726] hover:opacity-90 transition-opacity"
                style={{
                  background: 'linear-gradient(180deg, #022658 43%, #1A4983 100%)',
                  boxShadow: '0px 4px 4px rgba(5, 15, 28, 0.10)',
                  outline: '4px solid rgba(15, 40, 71, 0.15)',
                  maxWidth: '272px'
                }}
              >
                <span className="text-white text-base font-bold">Add new Registrar</span>
              </button>
            </div>

            {/* Search and Filter Controls */}
            <div className="flex flex-col items-end self-stretch gap-4 bg-white rounded-3xl p-4">
              <div className="flex items-start self-stretch gap-1.5">
                {/* Search Input */}
                <div className="flex-1 relative">
                  <input
                    type="text"
                    placeholder="Search Registrar"
                    className="w-full py-2 px-7 bg-[#F7F8FA] rounded text-[#868C98] text-xs font-normal border border-[#F7F8FA] outline-none"
                  />
                  <Search className="absolute left-2.5 top-2.5 w-3 h-3 text-[#868C98]" />
                </div>

                {/* Filter and Sort Buttons */}
                <div className="flex items-start gap-1.5">
                  <button className="px-2.5 py-2 rounded border border-[#D4E1EA] flex items-center gap-1.5">
                    <Filter className="w-3 h-3 text-[#868C98]" />
                    <span className="text-[#525866] text-xs font-normal">Filter</span>
                  </button>
                  <button className="px-2.5 py-2 rounded border border-[#D4E1EA] flex items-center gap-1.5">
                    <ArrowUpDown className="w-3 h-3 text-[#868C98]" />
                    <span className="text-[#525866] text-xs font-normal">Sort</span>
                  </button>
                </div>
              </div>

              {/* Table */}
              <div className="flex flex-col self-stretch gap-1 rounded-[14px] border border-[#E5E8EC] overflow-hidden">
                {/* Table Header */}
                <div className="flex items-center self-stretch bg-[#F4F6F9] py-4 gap-3">
                  <div className="flex-1 min-w-[110px] px-2">
                    <span className="text-[#070810] text-sm font-bold">Name</span>
                  </div>
                  <div className="flex-1 min-w-[110px] px-2">
                    <span className="text-[#070810] text-sm font-bold">I.D</span>
                  </div>
                  <div className="flex-1 min-w-[110px] px-2">
                    <span className="text-[#070810] text-sm font-bold">Contact</span>
                  </div>
                  <div className="flex-1 min-w-[110px] px-2">
                    <span className="text-[#070810] text-sm font-bold">D-O-B</span>
                  </div>
                  <div className="flex-1 min-w-[110px] px-2">
                    <span className="text-[#070810] text-sm font-bold">Gender</span>
                  </div>
                  <div className="flex-1 min-w-[110px] px-2">
                    <span className="text-[#070810] text-sm font-bold">Title</span>
                  </div>
                  <div className="flex-1 min-w-[110px] px-2">
                    <span className="text-[#070810] text-sm font-bold">Appointment date</span>
                  </div>
                  <div className="flex-1 min-w-[110px] px-2">
                    <span className="text-[#070810] text-sm font-bold">Years of service</span>
                  </div>
                  <div className="flex-1 min-w-[110px] px-2 flex justify-center">
                    <span className="text-[#070810] text-sm font-bold">Status</span>
                  </div>
                </div>

                {/* Table Rows */}
                {registrarsData.map((registrar, index) => (
                  <div
                    key={index}
                    onClick={() => setSelectedRegistrar(registrar)}
                    className="flex items-center self-stretch py-3 gap-3 cursor-pointer hover:bg-gray-50 transition-colors"
                    style={{
                      borderBottom: index < registrarsData.length - 1 ? '0.40px solid #E5E8EC' : 'none'
                    }}
                  >
                    <div className="flex-1 min-w-[110px] px-2">
                      <span className="text-[#070810] text-sm font-normal">{registrar.name}</span>
                    </div>
                    <div className="flex-1 min-w-[110px] px-2">
                      <span className="text-[#070810] text-sm font-normal">{registrar.id}</span>
                    </div>
                    <div className="flex-1 min-w-[110px] px-2">
                      <span className="text-[#070810] text-sm font-normal">{registrar.contact}</span>
                    </div>
                    <div className="flex-1 min-w-[110px] px-2">
                      <span className="text-[#070810] text-sm font-normal">{registrar.dob}</span>
                    </div>
                    <div className="flex-1 min-w-[110px] px-2">
                      <span className="text-[#070810] text-sm font-normal">{registrar.gender}</span>
                    </div>
                    <div className="flex-1 min-w-[110px] px-2">
                      <span className="text-[#070810] text-sm font-normal">{registrar.title}</span>
                    </div>
                    <div className="flex-1 min-w-[110px] px-2">
                      <span className="text-[#070810] text-sm font-normal">{registrar.appointmentDate}</span>
                    </div>
                    <div className="flex-1 min-w-[110px] px-2">
                      <span className="text-[#070810] text-sm font-normal">{registrar.yearsOfService}</span>
                    </div>
                    <div className="flex-1 min-w-[110px] px-2 flex justify-center">
                      <span className="text-[#070810] text-sm font-normal">{registrar.status}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              <div className="flex items-center self-stretch justify-between">
                <div className="flex items-center gap-10">
                  <span className="text-[#525866] text-sm font-normal">
                    {startRange}-{endRange} of {totalItems}
                  </span>
                  <div className="flex items-center gap-1.5">
                    {/* Back Button */}
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      className="h-8 px-3 py-2 bg-white rounded border border-[#D4E1EA] flex items-center gap-1"
                    >
                      <ChevronLeft className="w-4 h-4 text-[#868C98]" />
                      <span className="text-[#525866] text-xs font-normal">Back</span>
                    </button>

                    {/* Page Numbers */}
                    <button
                      onClick={() => handlePageChange(1)}
                      className={`px-2 py-2 rounded border border-[#D4E1EA] ${currentPage === 1 ? 'bg-[#022658]' : 'bg-white'}`}
                    >
                      <span className={`text-xs font-normal ${currentPage === 1 ? 'text-white' : 'text-[#525866]'}`}>1</span>
                    </button>

                    {/* Ellipsis */}
                    <div className="w-8 h-8 px-3 py-2 bg-white rounded border border-[#D4E1EA] flex items-center justify-center">
                      <div className="flex items-center gap-1">
                        <div className="w-1 h-1 bg-[#525866] rounded-full"></div>
                        <div className="w-1 h-1 bg-[#525866] rounded-full"></div>
                        <div className="w-1 h-1 bg-[#525866] rounded-full"></div>
                      </div>
                    </div>

                    {/* Page Numbers around current */}
                    {[98, 99, 100].map((page) => (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className="px-2 py-2 bg-white rounded border border-[#D4E1EA]"
                      >
                        <span className="text-[#525866] text-xs font-normal">{page}</span>
                      </button>
                    ))}

                    {/* Current Page */}
                    <button className="px-2 py-2 bg-[#022658] rounded">
                      <span className="text-white text-xs font-bold">{currentPage}</span>
                    </button>

                    {/* Page Numbers after current */}
                    {[102, 103].map((page) => (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className="px-2 py-2 bg-white rounded border border-[#D4E1EA]"
                      >
                        <span className="text-[#525866] text-xs font-normal">{page}</span>
                      </button>
                    ))}

                    {/* Ellipsis */}
                    <div className="w-8 h-8 px-3 py-2 bg-white rounded border border-[#D4E1EA] flex items-center justify-center">
                      <div className="flex items-center gap-1">
                        <div className="w-1 h-1 bg-[#525866] rounded-full"></div>
                        <div className="w-1 h-1 bg-[#525866] rounded-full"></div>
                        <div className="w-1 h-1 bg-[#525866] rounded-full"></div>
                      </div>
                    </div>

                    {/* Last Page */}
                    <button
                      onClick={() => handlePageChange(totalPages)}
                      className="px-2 py-2 bg-white rounded border border-[#D4E1EA]"
                    >
                      <span className="text-[#525866] text-xs font-normal">{totalPages}</span>
                    </button>

                    {/* Next Button */}
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      className="h-8 px-3 py-2 bg-white rounded border border-[#D4E1EA] flex items-center gap-1"
                    >
                      <span className="text-[#525866] text-xs font-normal">Next</span>
                      <ChevronRight className="w-4 h-4 text-[#868C98]" />
                    </button>
                  </div>
                </div>

                {/* Go to Page */}
                <div className="flex items-center gap-2">
                  <span className="text-[#050F1C] text-sm font-normal">Page</span>
                  <input
                    type="text"
                    value={pageInput}
                    onChange={handlePageInputChange}
                    onKeyPress={(e) => e.key === 'Enter' && handleGoToPage()}
                    className="w-[51px] h-8 px-2 py-1 bg-white rounded border border-[#F59E0B] text-[#050F1C] text-sm font-normal outline-none"
                  />
                  <button
                    onClick={handleGoToPage}
                    className="text-[#F59E0B] text-sm font-bold cursor-pointer hover:opacity-70"
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

export default RegistrarsPage;

