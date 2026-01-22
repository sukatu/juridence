import React, { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown, Bell, ChevronRight, ChevronLeft, Filter, ArrowUpDown, Download, Edit, Trash2 } from 'lucide-react';
import AddJudgeForm from './AddJudgeForm';
import JudgeDetailsDrawer from './JudgeDetailsDrawer';
import ViewCauseListPage from './ViewCauseListPage';
import { apiGet, apiPost, apiPut, apiDelete } from '../utils/api';
import ConfirmDialog from './admin/ConfirmDialog';

const JudgesListView = ({ registry, onBack }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [selectedRegion, setSelectedRegion] = useState(
    registry?.region ? registry.region : 'All Regions'
  );
  const [showAddJudgeForm, setShowAddJudgeForm] = useState(false);
  const [showJudgeDrawer, setShowJudgeDrawer] = useState(false);
  const [showCauseListPage, setShowCauseListPage] = useState(false);
  const [selectedJudge, setSelectedJudge] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [goToPage, setGoToPage] = useState('1');
  const [judges, setJudges] = useState([]);
  const [loadingJudges, setLoadingJudges] = useState(false);
  const [editingJudge, setEditingJudge] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [judgeToDelete, setJudgeToDelete] = useState(null);
  const [totalJudges, setTotalJudges] = useState(0);
  const filterDropdownRef = useRef(null);

  const REGION_OPTIONS = [
    'All Regions',
    'Ahafo Region',
    'Ashanti Region',
    'Bono Region',
    'Bono East Region',
    'Central Region',
    'Eastern Region',
    'Greater Accra Region',
    'Northern Region',
    'North-East Region',
    'Oti Region',
    'Savannah Region',
    'Upper-East Region',
    'Upper-West Region',
    'Volta Region',
    'Western Region',
    'Western North Region'
  ];

  const buildJudgesParams = (courtType, division, region) => {
    const params = new URLSearchParams();
    params.append('court_type', courtType);
    params.append('limit', '100');
    if (division) {
      params.append('court_division', division);
    }
    if (region && region !== 'All Regions') {
      params.append('region', region);
    }
    return params;
  };

  // Sample judges data (fallback)
  const [sampleJudges] = useState([
    {
      id: 1,
      name: 'Justice Mary Freeman',
      judgeID: 'JUD_00023',
      title: 'Justice / Hon.',
      gender: 'Female',
      appointmentDate: '11-10-2024',
      dateOfBirth: '14 Aug 1972',
      status: 'Active',
      court: 'High Court (Commercial)',
      chamber: 'Justice of the High Court',
      assistantName: 'Ben Botang',
      assistantEmail: 'bbotanglaw@gmail.com',
      barMembershipID: 'GBA-02415',
      yearsOfExperience: '18',
      previousAppointment: 'Circuit Court (2010–2015)',
      legalBackground: 'Commercial & Contract Law',
      education: 'LL.B – Univ. of Ghana\nLL.M – UK',
      recentCaseTitle: 'EcoWind vs. SafeDrive',
      recentCaseID: 'HCCW/2345/025'
    },
    {
      id: 2,
      name: 'Justice Janet Botang',
      judgeID: 'JUD_00045',
      title: 'Justice / Hon.',
      gender: 'Female',
      appointmentDate: '11-10-2024',
      dateOfBirth: '12 Sept 1960',
      status: 'Retired',
      court: 'High Court (Commercial)',
      chamber: 'Justice of the High Court',
      assistantName: 'Sarah Mensah',
      assistantEmail: 'smensah@court.gov.gh',
      barMembershipID: 'GBA-01982',
      yearsOfExperience: '25',
      previousAppointment: 'District Court (2005–2010)',
      legalBackground: 'Criminal Law',
      education: 'LL.B – Univ. of Ghana',
      recentCaseTitle: 'State vs. Accused',
      recentCaseID: 'HCCR/1234/024'
    },
    {
      id: 3,
      name: 'Justice Gaius Frimpong',
      judgeID: 'JUD_00021',
      title: 'Justice / Hon.',
      gender: 'Male',
      appointmentDate: '11-10-2024',
      dateOfBirth: '9 Mar 1990',
      status: 'On Leave',
      court: 'High Court (Commercial)',
      chamber: 'Justice of the High Court',
      assistantName: 'Kwame Asante',
      assistantEmail: 'kasante@court.gov.gh',
      barMembershipID: 'GBA-02890',
      yearsOfExperience: '12',
      previousAppointment: 'Circuit Court (2018–2022)',
      legalBackground: 'Civil Law',
      education: 'LL.B – KNUST\nLL.M – Harvard',
      recentCaseTitle: 'Property Dispute Case',
      recentCaseID: 'HCCL/5678/025'
    },
    {
      id: 4,
      name: 'Justice Benitta Carson',
      judgeID: 'JUD_00066',
      title: 'Justice / Hon.',
      gender: 'Female',
      appointmentDate: '11-10-2024',
      dateOfBirth: '4 Oct 1972',
      status: 'Active',
      court: 'High Court (Commercial)',
      chamber: 'Justice of the High Court',
      assistantName: 'Ama Osei',
      assistantEmail: 'aosei@court.gov.gh',
      barMembershipID: 'GBA-02234',
      yearsOfExperience: '20',
      previousAppointment: 'Circuit Court (2012–2018)',
      legalBackground: 'Commercial & Contract Law',
      education: 'LL.B – Univ. of Ghana\nLL.M – UK',
      recentCaseTitle: 'Contract Breach Case',
      recentCaseID: 'HCCW/3456/025'
    },
    {
      id: 5,
      name: 'Justice Paul Joseph',
      judgeID: 'JUD_00020',
      title: 'Justice / Hon.',
      gender: 'Male',
      appointmentDate: '11-10-2024',
      dateOfBirth: '23 June 1972',
      status: 'On Leave',
      court: 'High Court (Commercial)',
      chamber: 'Justice of the High Court',
      assistantName: 'John Doe',
      assistantEmail: 'jdoe@court.gov.gh',
      barMembershipID: 'GBA-02156',
      yearsOfExperience: '22',
      previousAppointment: 'District Court (2008–2014)',
      legalBackground: 'Constitutional Law',
      education: 'LL.B – Univ. of Ghana\nLL.M – USA',
      recentCaseTitle: 'Constitutional Matter',
      recentCaseID: 'HCCC/7890/025'
    },
    {
      id: 6,
      name: 'Justice Elizabeth Osei',
      judgeID: 'JUD_00123',
      title: 'Justice / Hon.',
      gender: 'Female',
      appointmentDate: '11-10-2024',
      dateOfBirth: '19 Dec 1981',
      status: 'Retired',
      court: 'High Court (Commercial)',
      chamber: 'Justice of the High Court',
      assistantName: 'Mary Kwarteng',
      assistantEmail: 'mkwarteng@court.gov.gh',
      barMembershipID: 'GBA-01789',
      yearsOfExperience: '30',
      previousAppointment: 'Circuit Court (2000–2010)',
      legalBackground: 'Family Law',
      education: 'LL.B – Univ. of Ghana',
      recentCaseTitle: 'Family Dispute',
      recentCaseID: 'HCCF/1122/024'
    },
    {
      id: 7,
      name: 'Justice Jacob Ofori',
      judgeID: 'JUD_00197',
      title: 'Justice / Hon.',
      gender: 'Male',
      appointmentDate: '11-10-2024',
      dateOfBirth: '14 May 1972',
      status: 'Active',
      court: 'High Court (Commercial)',
      chamber: 'Justice of the High Court',
      assistantName: 'Peter Adjei',
      assistantEmail: 'padjei@court.gov.gh',
      barMembershipID: 'GBA-02345',
      yearsOfExperience: '19',
      previousAppointment: 'Circuit Court (2011–2017)',
      legalBackground: 'Commercial & Contract Law',
      education: 'LL.B – Univ. of Ghana\nLL.M – UK',
      recentCaseTitle: 'Business Dispute',
      recentCaseID: 'HCCW/9988/025'
    }
  ]);

  // Fetch judges when component mounts or registry changes
  useEffect(() => {
    const fetchJudges = async () => {
      if (!registry) return;

      try {
        setLoadingJudges(true);
        // Fetch judges filtered by court_type and court_division
        const courtType = registry.court_type || registry.name?.split('(')[0]?.trim() || 'High Court';
        const division = registry.division || registry.court_division || '';
        
        const params = buildJudgesParams(courtType, division, selectedRegion);
        const response = await apiGet(`/judges?${params.toString()}`);
        
        if (response && response.judges && Array.isArray(response.judges)) {
          setJudges(response.judges);
          setTotalJudges(response.total ?? response.judges.length);
        } else {
          setJudges([]);
          setTotalJudges(0);
        }
      } catch (err) {
        console.error('Error fetching judges:', err);
        setJudges([]);
      } finally {
        setLoadingJudges(false);
      }
    };

    fetchJudges();
  }, [registry, selectedRegion]);

  // Filter judges based on search query
  const searchFilteredJudges = judges.filter(judge => {
    if (!searchQuery.trim()) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      (judge.name && judge.name.toLowerCase().includes(query)) ||
      (judge.title && judge.title.toLowerCase().includes(query)) ||
      (judge.court_type && judge.court_type.toLowerCase().includes(query)) ||
      (judge.court_division && judge.court_division.toLowerCase().includes(query)) ||
      (judge.region && judge.region.toLowerCase().includes(query))
    );
  });


  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterDropdownRef.current && !filterDropdownRef.current.contains(event.target)) {
        setShowFilterDropdown(false);
      }
    };

    if (showFilterDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showFilterDropdown]);

  const userInfo = JSON.parse(localStorage.getItem('userData') || '{}');
  const userName = userInfo?.first_name && userInfo?.last_name 
    ? `${userInfo.first_name} ${userInfo.last_name}` 
    : 'Ben Frimpong';

  const handleSaveJudge = async (formData) => {
    try {
      // Prepare judge data for API
      const judgeData = {
        name: formData.judgeName || formData.name,
        title: formData.title || null,
        gender: formData.gender || null,
        court_type: registry?.court_type || registry?.name?.split('(')[0]?.trim() || 'High Court',
        court_division: registry?.division || registry?.court_division || null,
        region: registry?.region || null,
        status: formData.status?.toLowerCase() || 'active',
        date_of_birth: formData.dateOfBirth || null,
        appointment_date: formData.appointmentDate || null,
        contact_info: formData.email || formData.phoneNumber ? JSON.stringify({
          email: formData.email || null,
          phone: formData.phoneNumber || null,
          chamber_address: formData.chamberAddress || null,
          assistant_name: formData.assistantName || null,
          assistant_email: formData.assistantEmail || null
        }) : null,
        specializations: formData.legalBackground || null,
        bio: formData.bio || null,
        schools_attended: [
          formData.education1 ? { degree: formData.education1 } : null,
          formData.education2 ? { degree: formData.education2 } : null,
          formData.education3 ? { degree: formData.education3 } : null
        ].filter(Boolean),
        is_active: formData.status?.toLowerCase() !== 'retired'
      };

      if (editingJudge && editingJudge.id) {
        // Update existing judge
        await apiPut(`/admin/judges/${editingJudge.id}`, judgeData);
      } else {
        // Create new judge
        await apiPost('/admin/judges', judgeData);
      }

      // Refresh judges list
      const courtType = registry?.court_type || registry?.name?.split('(')[0]?.trim() || 'High Court';
      const division = registry?.division || registry?.court_division || '';
      
      const params = buildJudgesParams(courtType, division, selectedRegion);
      const response = await apiGet(`/judges?${params.toString()}`);
      
      if (response && response.judges) {
        setJudges(response.judges);
        setTotalJudges(response.total ?? response.judges.length);
      }

      setShowAddJudgeForm(false);
      setEditingJudge(null);
    } catch (err) {
      console.error('Error saving judge:', err);
      let errorMessage = 'Failed to save judge.';
      
      if (err.status === 403 || (err.detail && err.detail.includes('Admin access required'))) {
        errorMessage = 'Admin access required. You must be logged in as an administrator to create or update judges.';
      } else if (err.status === 401) {
        errorMessage = 'Authentication required. Please log in and try again.';
      } else if (err.detail) {
        errorMessage = err.detail;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      alert(`Error saving judge: ${errorMessage}`);
    }
  };

  const handleEditJudge = (judge) => {
    setEditingJudge(judge);
    setShowAddJudgeForm(true);
  };

  const handleDeleteJudge = (judge) => {
    setJudgeToDelete(judge);
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (!judgeToDelete || !judgeToDelete.id) {
      setShowDeleteConfirm(false);
      setJudgeToDelete(null);
      return;
    }

    try {
      await apiDelete(`/admin/judges/${judgeToDelete.id}`);
      
      // Refresh judges list
      const courtType = registry?.court_type || registry?.name?.split('(')[0]?.trim() || 'High Court';
      const division = registry?.division || registry?.court_division || '';
      
      const params = buildJudgesParams(courtType, division, selectedRegion);
      const response = await apiGet(`/judges?${params.toString()}`);
      
      if (response && response.judges) {
        setJudges(response.judges);
        setTotalJudges(response.total ?? response.judges.length);
      }

      setShowDeleteConfirm(false);
      setJudgeToDelete(null);
    } catch (err) {
      console.error('Error deleting judge:', err);
      let errorMessage = 'Failed to delete judge.';
      
      if (err.status === 403 || (err.detail && err.detail.includes('Admin access required'))) {
        errorMessage = 'Admin access required. You must be logged in as an administrator to delete judges.';
      } else if (err.status === 401) {
        errorMessage = 'Authentication required. Please log in and try again.';
      } else if (err.detail) {
        errorMessage = err.detail;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      alert(`Error deleting judge: ${errorMessage}`);
      setShowDeleteConfirm(false);
      setJudgeToDelete(null);
    }
  };

  const handleJudgeClick = (judge) => {
    setSelectedJudge(judge);
    setShowJudgeDrawer(true);
  };

  const handleSaveJudgeChanges = (updatedData) => {
    // Handle saving judge changes
    console.log('Saving judge changes:', updatedData);
    // TODO: Add API call to update judge
    setJudges(prev => prev.map(judge => 
      judge.id === selectedJudge.id ? { ...judge, ...updatedData } : judge
    ));
  };

  // Filter judges based on active tab and search
  const filteredJudges = searchFilteredJudges.filter(judge => {
    if (activeTab === 'past') {
      const status = typeof judge.status === 'string' ? judge.status.toLowerCase() : '';
      return status === 'retired' || status === 'deceased' || status === 'suspended' || !judge.is_active;
    }
    if (activeTab === 'present') {
      const status = typeof judge.status === 'string' ? judge.status.toLowerCase() : '';
      return status === 'active' && judge.is_active !== false;
    }
    return true; // 'all'
  });

  // Pagination calculations based on filtered judges
  const itemsPerPage = 10;
  const totalFilteredJudges = filteredJudges.length;
  const totalPages = Math.ceil(totalFilteredJudges / itemsPerPage) || 1;
  
  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
    setGoToPage('1');
  }, [activeTab, searchQuery]);

  // Reset to page 1 if current page is out of bounds
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
      setGoToPage('1');
    }
  }, [totalPages, currentPage]);

  // Update goToPage when currentPage changes
  useEffect(() => {
    setGoToPage(currentPage.toString());
  }, [currentPage]);

  // Get paginated judges
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedJudges = filteredJudges.slice(startIndex, endIndex);
  
  const startItem = totalFilteredJudges > 0 ? startIndex + 1 : 0;
  const endItem = Math.min(endIndex, totalFilteredJudges);

  // If cause list page is shown
  if (showCauseListPage) {
    return (
      <ViewCauseListPage
        registry={registry}
        judge={selectedJudge}
        onBack={() => setShowCauseListPage(false)}
      />
    );
  }

  // If add judge form is shown
  const courtLabel = (() => {
    const base = registry?.court_type || registry?.name || 'Court';
    const division = registry?.division || registry?.court_division;
    return division ? `${base} (${division})` : base;
  })();

  if (showAddJudgeForm) {
    return (
      <AddJudgeForm
        registry={registry}
        onBack={() => {
          setShowAddJudgeForm(false);
          setEditingJudge(null);
        }}
        onSave={handleSaveJudge}
        initialData={editingJudge}
        isEditMode={!!editingJudge}
      />
    );
  }

  return (
    <>
      {showJudgeDrawer && selectedJudge && (
        <JudgeDetailsDrawer
          judge={selectedJudge}
          registry={registry}
          onClose={() => {
            setShowJudgeDrawer(false);
            setSelectedJudge(null);
          }}
          onSave={handleSaveJudgeChanges}
        />
      )}
    <div className="bg-[#F7F8FA] min-h-screen">
      {/* Full Width Header */}
      <div className="w-full bg-white py-3.5 px-6 mb-4 border-b border-[#D4E1EA]">
        <div className="flex justify-between items-center">
          <div className="flex flex-col items-start gap-1">
            <span className="text-[#050F1C] text-xl font-medium">{courtLabel}</span>
            <span className="text-[#050F1C] text-base opacity-75">Track all your activities here.</span>
          </div>
          <div className="flex items-start gap-4">
            <div className="flex justify-between items-center w-[600px] pr-2 rounded-lg border border-solid border-[#D4E1EA] bg-white">
              <input
                type="text"
                placeholder="Search cases and gazette here"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 self-stretch text-[#525866] bg-transparent text-xs py-3.5 pl-2 mr-1 border-0 outline-none"
              />
              <div className="flex items-center w-[73px] gap-1.5">
                <Search className="w-[19px] h-[19px] text-[#525866]" />
                <div 
                  ref={filterDropdownRef}
                  className="flex items-center bg-white w-12 py-1 px-[9px] gap-1 rounded cursor-pointer relative"
                  onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                >
                  <span className="text-[#525866] text-xs font-bold">
                    {selectedFilter}
                  </span>
                  <ChevronDown className="w-3 h-3 text-[#525866]" />
                  {showFilterDropdown && (
                    <div className="absolute top-full right-0 mt-1 bg-white border border-[#D4E1EA] rounded-lg shadow-lg z-10 min-w-[120px]">
                      {['All', 'Cases', 'Gazette'].map((filter) => (
                        <div
                          key={filter}
                          onClick={() => {
                            setSelectedFilter(filter);
                            setShowFilterDropdown(false);
                          }}
                          className="px-3 py-2 text-xs text-[#525866] hover:bg-gray-50 cursor-pointer"
                        >
                          {filter}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
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
                  <div className="flex items-center gap-1">
                    <span className="text-[#050F1C] text-base font-bold whitespace-nowrap">
                      {userName}
                    </span>
                    <ChevronDown className="w-3 h-3 text-[#050F1C]" />
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-[#525866] text-xs">Online</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-6 w-full">
        <div className="flex flex-col bg-white p-4 gap-6 rounded-lg w-full">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-sm text-[#525866]">Region:</span>
              <select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="px-3 py-2 text-sm border border-[#D4E1EA] rounded-lg bg-white text-[#040E1B]"
              >
                {REGION_OPTIONS.map((region) => (
                  <option key={region} value={region}>
                    {region.replace(' Region', '')}
                  </option>
                ))}
              </select>
            </div>
          </div>
          {/* Breadcrumb */}
          <div className="flex items-center gap-1">
            <button
              onClick={onBack}
              className="cursor-pointer hover:opacity-70"
            >
              <ChevronRight className="w-4 h-4 text-[#525866] rotate-180" />
            </button>
            <span className="text-[#525866] text-xs opacity-75 mr-1 whitespace-nowrap">COURT REGISTRY</span>
            <ChevronRight className="w-4 h-4 text-[#525866] mr-1" />
            <span className="text-[#070810] text-sm font-normal whitespace-nowrap">
              {registry?.name || 'High Court (Commercial Division)'}
            </span>
            <ChevronRight className="w-4 h-4 text-[#525866] mr-1" />
            <span className="text-[#070810] text-sm font-normal whitespace-nowrap">Judges</span>
          </div>

          {/* Title Section */}
          <div className="flex flex-col items-start gap-2">
            <div className="flex items-start gap-1">
              <button
                onClick={onBack}
                className="cursor-pointer hover:opacity-70 mt-1"
              >
                <ChevronRight className="w-4 h-4 text-[#050F1C] rotate-180" />
              </button>
              <div className="flex flex-col items-start gap-0.5">
                <span className="text-[#050F1C] text-xl font-semibold">
                  {registry?.name?.split('(')[0]?.trim() || 'High Court'}
                </span>
                <span className="text-[#050F1C] text-sm font-normal">
                  {registry?.division || 'Commercial Division'}
                </span>
              </div>
            </div>
            <span className="text-[#070810] text-sm font-normal opacity-75">
              View all judges in this Division.
            </span>
          </div>

          {/* Stats Card and Action Buttons */}
          <div className="flex justify-between items-center self-stretch">
            {/* Stats Card */}
            <div className="flex items-center gap-3 w-[271.5px] p-2 bg-white rounded-lg border border-[#D4E1EA]">
              <div className="p-2 bg-[#F7F8FA] rounded-lg">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M2 2H22V22H2V2Z" stroke="#868C98" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M2 9H22" stroke="#868C98" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M9 2V22" stroke="#868C98" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[#868C98] text-xs font-normal">Total number of Judges</span>
                <span className="text-[#F59E0B] text-base font-medium">{totalJudges}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowCauseListPage(true)}
                className="flex-1 h-[42px] px-2.5 rounded-lg border-2 border-[#0F2847] text-[#022658] text-base font-bold hover:bg-gray-50 transition-colors whitespace-nowrap"
                style={{ boxShadow: '0px 4px 4px rgba(5, 15, 28, 0.10)' }}
              >
                View Cause List
              </button>
              <button
                onClick={() => {
                  setEditingJudge(null);
                  setShowAddJudgeForm(true);
                }}
                className="flex-1 h-[42px] px-2.5 rounded-lg border-4 border-[#0F284726] text-white text-base font-bold hover:opacity-90 transition-opacity whitespace-nowrap"
                style={{ 
                  background: 'linear-gradient(180deg, #022658 43%, #1A4983 100%)', 
                  boxShadow: '0px 4px 4px rgba(5, 15, 28, 0.10)' 
                }}
              >
                Add New Judge
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-4 border-b border-transparent">
            <button
              onClick={() => setActiveTab('all')}
              className={`pb-2 px-0 text-base font-bold transition-colors ${
                activeTab === 'all'
                  ? 'text-[#022658] border-b-4 border-[#022658]'
                  : 'text-[#525866] font-normal'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setActiveTab('past')}
              className={`pb-2 px-0 text-base transition-colors ${
                activeTab === 'past'
                  ? 'text-[#022658] border-b-4 border-[#022658] font-bold'
                  : 'text-[#525866] font-normal'
              }`}
            >
              Past
            </button>
            <button
              onClick={() => setActiveTab('present')}
              className={`pb-2 px-0 text-base transition-colors ${
                activeTab === 'present'
                  ? 'text-[#022658] border-b-4 border-[#022658] font-bold'
                  : 'text-[#525866] font-normal'
              }`}
            >
              Present
            </button>
          </div>

          {/* Search and Filter Section */}
          <div className="flex flex-col gap-4 w-full">
            <div className="flex justify-between items-start gap-8 w-full">
              {/* Search Bar */}
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-[#868C98]" />
                <input
                  type="text"
                  placeholder="Search here"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-[31px] pl-8 pr-3 py-2 bg-[#F7F8FA] rounded-[5.8px] border border-[#F7F8FA] text-[#868C98] text-[10px] font-normal outline-none focus:border-[#022658]"
                />
              </div>

              {/* Filter, Sort, Export */}
              <div className="flex items-center gap-8">
                <div className="flex items-center gap-1.5">
                  <button className="flex items-center gap-1.5 px-2.5 py-2 rounded border border-[#D4E1EA] hover:bg-gray-50 transition-colors">
                    <Filter className="w-3 h-3 text-[#868C98]" />
                    <span className="text-[#525866] text-xs font-normal">Filter</span>
                  </button>
                  <button className="flex items-center gap-1.5 px-2.5 py-2 rounded border border-[#D4E1EA] hover:bg-gray-50 transition-colors">
                    <ArrowUpDown className="w-3 h-3 text-[#868C98]" />
                    <span className="text-[#525866] text-xs font-normal">Sort</span>
                  </button>
                </div>
                <button className="flex items-center gap-1 px-4 py-2 rounded-lg border border-[#F59E0B] text-[#F59E0B] text-base font-medium hover:bg-orange-50 transition-colors">
                  <span>Export list</span>
                  <ChevronDown className="w-4 h-4 text-[#F59E0B]" />
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-hidden rounded-[14px] border border-[#E5E8EC] w-full">
              {/* Table Header */}
              <div className="bg-[#F4F6F9] py-4 px-2">
                <div className="flex items-center gap-3 w-full">
                  <div className="flex-[2] min-w-[230px] px-2">
                    <span className="text-[#070810] text-sm font-bold">Judge's name</span>
                  </div>
                  <div className="flex-1 min-w-[140px] px-2">
                    <span className="text-[#070810] text-sm font-bold">ID</span>
                  </div>
                  <div className="flex-1 min-w-[140px] px-2">
                    <span className="text-[#070810] text-sm font-bold">Title</span>
                  </div>
                  <div className="flex-1 min-w-[140px] px-2">
                    <span className="text-[#070810] text-sm font-bold">Gender</span>
                  </div>
                  <div className="flex-1 min-w-[140px] px-2">
                    <span className="text-[#070810] text-sm font-bold">Appointment date</span>
                  </div>
                  <div className="flex-1 min-w-[140px] px-2">
                    <span className="text-[#070810] text-sm font-bold">D-O-B</span>
                  </div>
                  <div className="flex-[0.8] min-w-[112px] px-2">
                    <span className="text-[#070810] text-sm font-bold">Status</span>
                  </div>
                </div>
              </div>

              {/* Table Body */}
              <div className="bg-white w-full">
                {loadingJudges ? (
                  <div className="flex items-center justify-center w-full py-8">
                    <span className="text-[#525866] text-sm">Loading judges...</span>
                  </div>
                ) : filteredJudges.length === 0 ? (
                  <div className="flex flex-col items-center justify-center w-full py-12 gap-4">
                    <span className="text-[#525866] text-sm">
                      {searchQuery.trim() 
                        ? `No judges found matching "${searchQuery}"`
                        : 'No judges found'
                      }
                    </span>
                    {!searchQuery.trim() && (
                      <button
                        onClick={() => {
                          setEditingJudge(null);
                          setShowAddJudgeForm(true);
                        }}
                        className="flex items-center gap-2 px-6 py-3 bg-[#022658] text-white rounded-lg hover:bg-[#033a7a] transition-colors"
                      >
                        <span>Add First Judge</span>
                      </button>
                    )}
                  </div>
                ) : (
                  paginatedJudges.map((judge, index) => {
                    const formatDate = (dateString) => {
                      if (!dateString) return 'N/A';
                      try {
                        if (typeof dateString === 'string') {
                          // Try to parse different date formats
                          const date = new Date(dateString);
                          if (!isNaN(date.getTime())) {
                            return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
                          }
                          return dateString;
                        }
                        const date = new Date(dateString);
                        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
                      } catch (e) {
                        return dateString || 'N/A';
                      }
                    };

                    const statusDisplay = judge.status || (judge.is_active === false ? 'Retired' : 'Active');
                    const statusValue = typeof judge.status === 'string' ? judge.status.toLowerCase() : (judge.is_active === false ? 'retired' : 'active');

                    return (
                      <div
                        key={judge.id}
                        className={`flex items-center gap-3 py-3 px-2 w-full hover:bg-gray-50 transition-colors ${
                          index < paginatedJudges.length - 1 ? 'border-b border-[#E5E8EC]' : ''
                        }`}
                      >
                        <div 
                          className="flex-[2] min-w-[230px] px-2 cursor-pointer"
                          onClick={() => handleJudgeClick(judge)}
                        >
                          <span className="text-[#070810] text-sm font-normal">{judge.name}</span>
                        </div>
                        <div 
                          className="flex-1 min-w-[140px] px-2 cursor-pointer"
                          onClick={() => handleJudgeClick(judge)}
                        >
                          <span className="text-[#070810] text-sm font-normal">{judge.id ? `JUD_${String(judge.id).padStart(5, '0')}` : 'N/A'}</span>
                        </div>
                        <div 
                          className="flex-1 min-w-[140px] px-2 cursor-pointer"
                          onClick={() => handleJudgeClick(judge)}
                        >
                          <span className="text-[#070810] text-sm font-normal">{judge.title || 'N/A'}</span>
                        </div>
                        <div 
                          className="flex-1 min-w-[140px] px-2 cursor-pointer"
                          onClick={() => handleJudgeClick(judge)}
                        >
                          <span className="text-[#070810] text-sm font-normal">{judge.gender || 'N/A'}</span>
                        </div>
                        <div 
                          className="flex-1 min-w-[140px] px-2 cursor-pointer"
                          onClick={() => handleJudgeClick(judge)}
                        >
                          <span className="text-[#070810] text-sm font-normal">{formatDate(judge.appointment_date)}</span>
                        </div>
                        <div 
                          className="flex-1 min-w-[140px] px-2 flex justify-center cursor-pointer"
                          onClick={() => handleJudgeClick(judge)}
                        >
                          <span className="text-[#070810] text-sm font-normal">{formatDate(judge.date_of_birth)}</span>
                        </div>
                        <div className="flex-[0.8] min-w-[112px] px-2 flex items-center gap-2">
                          <span
                            className={`text-xs font-normal px-2 py-1 rounded ${
                              statusValue === 'active'
                                ? 'bg-green-50 text-green-600'
                                : statusValue === 'retired'
                                ? 'bg-gray-50 text-gray-600'
                                : statusValue === 'suspended'
                                ? 'bg-yellow-50 text-yellow-600'
                                : 'bg-blue-50 text-blue-600'
                            }`}
                          >
                            {statusDisplay}
                          </span>
                          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditJudge(judge);
                              }}
                              className="p-1.5 rounded hover:bg-gray-100 transition-colors"
                              title="Edit judge"
                            >
                              <Edit className="w-4 h-4 text-[#022658]" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteJudge(judge);
                              }}
                              className="p-1.5 rounded hover:bg-red-50 transition-colors"
                              title="Delete judge"
                            >
                              <Trash2 className="w-4 h-4 text-red-600" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Pagination */}
            {totalFilteredJudges > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-[#525866] text-sm font-normal">
                  {startItem}-{endItem} of {totalFilteredJudges}
                </span>

                <div className="flex items-center gap-10">
                  {/* Page Numbers */}
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="flex items-center gap-1 h-8 px-3 py-2 bg-white rounded border border-[#D4E1EA] hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="w-4 h-4 text-[#868C98]" />
                      <span className="text-[#525866] text-xs font-normal">Back</span>
                    </button>

                    {/* Dynamic page numbers */}
                    {totalPages > 0 && (() => {
                      const pages = [];
                      const maxVisiblePages = 7;
                      
                      if (totalPages <= maxVisiblePages) {
                        // Show all pages if total pages is small
                        for (let i = 1; i <= totalPages; i++) {
                          pages.push(
                            <button
                              key={i}
                              onClick={() => setCurrentPage(i)}
                              className={`px-2 py-2 rounded text-xs font-normal ${
                                currentPage === i
                                  ? 'bg-[#022658] text-white font-bold'
                                  : 'bg-white border border-[#D4E1EA] text-[#525866] hover:bg-gray-50'
                              }`}
                            >
                              {i}
                            </button>
                          );
                        }
                      } else {
                        // Show first page, ellipsis, current page range, ellipsis, last page
                        if (currentPage <= 3) {
                          // Show first few pages
                          for (let i = 1; i <= 4; i++) {
                            pages.push(
                              <button
                                key={i}
                                onClick={() => setCurrentPage(i)}
                                className={`px-2 py-2 rounded text-xs font-normal ${
                                  currentPage === i
                                    ? 'bg-[#022658] text-white font-bold'
                                    : 'bg-white border border-[#D4E1EA] text-[#525866] hover:bg-gray-50'
                                }`}
                              >
                                {i}
                              </button>
                            );
                          }
                          pages.push(
                            <button key="ellipsis1" className="w-8 h-8 px-2 py-2 bg-white rounded border border-[#D4E1EA] flex items-center justify-center">
                              <span className="text-[#525866] text-xs">...</span>
                            </button>
                          );
                          pages.push(
                            <button
                              onClick={() => setCurrentPage(totalPages)}
                              className="px-2 py-2 bg-white rounded border border-[#D4E1EA] text-[#525866] text-xs font-normal hover:bg-gray-50"
                            >
                              {totalPages}
                            </button>
                          );
                        } else if (currentPage >= totalPages - 2) {
                          // Show last few pages
                          pages.push(
                            <button
                              onClick={() => setCurrentPage(1)}
                              className="px-2 py-2 bg-white rounded border border-[#D4E1EA] text-[#525866] text-xs font-normal hover:bg-gray-50"
                            >
                              1
                            </button>
                          );
                          pages.push(
                            <button key="ellipsis1" className="w-8 h-8 px-2 py-2 bg-white rounded border border-[#D4E1EA] flex items-center justify-center">
                              <span className="text-[#525866] text-xs">...</span>
                            </button>
                          );
                          for (let i = totalPages - 3; i <= totalPages; i++) {
                            pages.push(
                              <button
                                key={i}
                                onClick={() => setCurrentPage(i)}
                                className={`px-2 py-2 rounded text-xs font-normal ${
                                  currentPage === i
                                    ? 'bg-[#022658] text-white font-bold'
                                    : 'bg-white border border-[#D4E1EA] text-[#525866] hover:bg-gray-50'
                                }`}
                              >
                                {i}
                              </button>
                            );
                          }
                        } else {
                          // Show middle pages
                          pages.push(
                            <button
                              onClick={() => setCurrentPage(1)}
                              className="px-2 py-2 bg-white rounded border border-[#D4E1EA] text-[#525866] text-xs font-normal hover:bg-gray-50"
                            >
                              1
                            </button>
                          );
                          pages.push(
                            <button key="ellipsis1" className="w-8 h-8 px-2 py-2 bg-white rounded border border-[#D4E1EA] flex items-center justify-center">
                              <span className="text-[#525866] text-xs">...</span>
                            </button>
                          );
                          for (let i = currentPage - 1; i <= currentPage + 1; i++) {
                            pages.push(
                              <button
                                key={i}
                                onClick={() => setCurrentPage(i)}
                                className={`px-2 py-2 rounded text-xs font-normal ${
                                  currentPage === i
                                    ? 'bg-[#022658] text-white font-bold'
                                    : 'bg-white border border-[#D4E1EA] text-[#525866] hover:bg-gray-50'
                                }`}
                              >
                                {i}
                              </button>
                            );
                          }
                          pages.push(
                            <button key="ellipsis2" className="w-8 h-8 px-2 py-2 bg-white rounded border border-[#D4E1EA] flex items-center justify-center">
                              <span className="text-[#525866] text-xs">...</span>
                            </button>
                          );
                          pages.push(
                            <button
                              onClick={() => setCurrentPage(totalPages)}
                              className="px-2 py-2 bg-white rounded border border-[#D4E1EA] text-[#525866] text-xs font-normal hover:bg-gray-50"
                            >
                              {totalPages}
                            </button>
                          );
                        }
                      }
                      
                      return pages;
                    })()}

                    <button
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className="flex items-center gap-1 h-8 px-3 py-2 bg-white rounded border border-[#D4E1EA] hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="text-[#525866] text-xs font-normal">Next</span>
                      <ChevronRight className="w-4 h-4 text-[#868C98]" />
                    </button>
                  </div>

                  {/* Go to Page */}
                  <div className="flex items-center gap-2">
                    <span className="text-[#050F1C] text-sm font-normal">Page</span>
                    <input
                      type="text"
                      value={goToPage}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === '' || /^\d+$/.test(value)) {
                          setGoToPage(value);
                        }
                      }}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          const page = parseInt(goToPage);
                          if (page >= 1 && page <= totalPages) {
                            setCurrentPage(page);
                          } else {
                            setGoToPage(currentPage.toString());
                          }
                        }
                      }}
                      className="w-[51px] h-8 px-2 py-1 bg-white rounded border border-[#F59E0B] text-[#050F1C] text-sm font-normal outline-none text-center"
                    />
                    <button
                      onClick={() => {
                        const page = parseInt(goToPage);
                        if (page >= 1 && page <= totalPages) {
                          setCurrentPage(page);
                        } else {
                          setGoToPage(currentPage.toString());
                        }
                      }}
                      className="text-[#F59E0B] text-sm font-bold hover:underline"
                    >
                      Go
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false);
          setJudgeToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title={`Are you sure you want to delete this judge?`}
        message={`Judge: ${judgeToDelete?.name || 'N/A'}\nTitle: ${judgeToDelete?.title || 'N/A'}\nCourt: ${judgeToDelete?.court_type || 'N/A'}\n\nThis action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
      />
    </div>
    </>
  );
};

export default JudgesListView;

