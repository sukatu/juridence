import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Search, ChevronDown, Bell, ChevronRight, ChevronLeft, Filter, ArrowUpDown, Calendar, MoreVertical, Edit, Trash2 } from 'lucide-react';
import AddCasesToCauseListPage from './AddCasesToCauseListPage';
import ViewCauseListDrawer from './ViewCauseListDrawer';
import CauseListCalendar from './CauseListCalendar';
import { apiGet, apiPost, apiPut, apiDelete } from '../utils/api';
import ConfirmDialog from './admin/ConfirmDialog';

const ViewCauseListPage = ({ registry, judge, caseData, onBack }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [showAddCasesForm, setShowAddCasesForm] = useState(false);
  const [activeTab, setActiveTab] = useState('All');
  const [selectedPeriod, setSelectedPeriod] = useState('This Week');
  const [currentPage, setCurrentPage] = useState(1);
  const [goToPage, setGoToPage] = useState('1');
  const [showDrawer, setShowDrawer] = useState(false);
  const [selectedCase, setSelectedCase] = useState(null);
  const [causeLists, setCauseLists] = useState([]);
  const [loadingCauseLists, setLoadingCauseLists] = useState(false);
  const [totalCauseLists, setTotalCauseLists] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [editingCauseList, setEditingCauseList] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [causeListToDelete, setCauseListToDelete] = useState(null);
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'calendar'
  const [calendarDate, setCalendarDate] = useState(new Date());
  
  // Filter states
  const [showDateFilter, setShowDateFilter] = useState(false);
  const [showCaseTypeFilter, setShowCaseTypeFilter] = useState(false);
  const [showStatusFilter, setShowStatusFilter] = useState(false);
  const [selectedDateRange, setSelectedDateRange] = useState('This Week');
  const [selectedCaseType, setSelectedCaseType] = useState(null);
  const [selectedStatusFilter, setSelectedStatusFilter] = useState(null);
  const [dateFilterFrom, setDateFilterFrom] = useState(null);
  const [dateFilterTo, setDateFilterTo] = useState(null);
  
  const filterDropdownRef = useRef(null);
  const dateFilterRef = useRef(null);
  const caseTypeFilterRef = useRef(null);
  const statusFilterRef = useRef(null);

  // Handle click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Check if click is outside filter dropdown
      if (filterDropdownRef.current && !filterDropdownRef.current.contains(event.target)) {
        setShowFilterDropdown(false);
      }
      // Check if click is outside date filter
      if (dateFilterRef.current && !dateFilterRef.current.contains(event.target)) {
        setShowDateFilter(false);
      }
      // Check if click is outside case type filter
      if (caseTypeFilterRef.current && !caseTypeFilterRef.current.contains(event.target)) {
        setShowCaseTypeFilter(false);
      }
      // Check if click is outside status filter
      if (statusFilterRef.current && !statusFilterRef.current.contains(event.target)) {
        setShowStatusFilter(false);
      }
    };

    if (showDateFilter || showCaseTypeFilter || showStatusFilter || showFilterDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDateFilter, showCaseTypeFilter, showStatusFilter, showFilterDropdown]);
  
  // Calculate date ranges based on selected period
  useEffect(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset to start of day
    let fromDate = null;
    let toDate = null;
    
    // Default to "This Week" if nothing is selected
    const period = selectedPeriod || 'This Week';
    const dateRange = selectedDateRange || 'This Week';
    
    if (period === 'Today' || dateRange === 'Today') {
      fromDate = new Date(today);
      toDate = new Date(today);
    } else if (period === 'This Week' || dateRange === 'This Week') {
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay()); // Start of week (Sunday)
      fromDate = startOfWeek;
      toDate = new Date(startOfWeek);
      toDate.setDate(startOfWeek.getDate() + 6); // End of week (Saturday)
      toDate.setHours(23, 59, 59, 999);
    } else if (period === 'This Month' || dateRange === 'This Month') {
      fromDate = new Date(today.getFullYear(), today.getMonth(), 1);
      toDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      toDate.setHours(23, 59, 59, 999);
    } else if (dateRange === 'Last 7 days') {
      fromDate = new Date(today);
      fromDate.setDate(today.getDate() - 7);
      toDate = new Date(today);
      toDate.setHours(23, 59, 59, 999);
    } else if (dateRange === 'Last 30 days') {
      fromDate = new Date(today);
      fromDate.setDate(today.getDate() - 30);
      toDate = new Date(today);
      toDate.setHours(23, 59, 59, 999);
    }
    
    setDateFilterFrom(fromDate);
    setDateFilterTo(toDate);
  }, [selectedPeriod, selectedDateRange]);

  const userInfo = JSON.parse(localStorage.getItem('userData') || '{}');
  const userName = userInfo?.first_name && userInfo?.last_name 
    ? `${userInfo.first_name} ${userInfo.last_name}` 
    : 'Ben Frimpong';

  const handleAddCases = () => {
    setShowAddCasesForm(true);
  };

  // Fetch cause lists from API
  useEffect(() => {
    const fetchCauseLists = async () => {
      // Wait for date filters to be initialized
      if ((selectedPeriod === 'This Week' || selectedDateRange === 'This Week') && !dateFilterFrom) {
        return; // Wait for date filter initialization
      }
      
      try {
        setLoadingCauseLists(true);
        const params = new URLSearchParams({
          page: currentPage.toString(),
          limit: '20'
        });
        
        if (registry?.id) {
          params.append('registry_id', registry.id.toString());
        }
        if (judge?.id) {
          params.append('judge_id', judge.id.toString());
        }
        if (activeTab !== 'All') {
          params.append('status', activeTab);
        } else if (selectedStatusFilter) {
          params.append('status', selectedStatusFilter);
        }
        if (selectedCaseType) {
          params.append('case_type', selectedCaseType);
        }
        if (dateFilterFrom) {
          params.append('hearing_date_from', dateFilterFrom.toISOString().split('T')[0]);
        }
        if (dateFilterTo) {
          params.append('hearing_date_to', dateFilterTo.toISOString().split('T')[0]);
        }
        if (searchQuery.trim()) {
          params.append('search', searchQuery.trim());
        }
        
        console.log('Fetching cause lists with params:', params.toString());
        const response = await apiGet(`/admin/cause-lists?${params.toString()}`);
        
        if (response && response.cause_lists) {
          console.log('Fetched cause lists:', response.cause_lists.length);
          setCauseLists(response.cause_lists);
          setTotalCauseLists(response.total || 0);
          setTotalPages(response.total_pages || 1);
        } else {
          setCauseLists([]);
          setTotalCauseLists(0);
          setTotalPages(1);
        }
      } catch (err) {
        console.error('Error fetching cause lists:', err);
        setCauseLists([]);
        setTotalCauseLists(0);
        setTotalPages(1);
      } finally {
        setLoadingCauseLists(false);
      }
    };

    fetchCauseLists();
  }, [currentPage, activeTab, searchQuery, registry?.id, judge?.id, selectedCaseType, selectedStatusFilter, dateFilterFrom, dateFilterTo, selectedPeriod, selectedDateRange]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
    setGoToPage('1');
  }, [activeTab, searchQuery, selectedCaseType, selectedStatusFilter, dateFilterFrom, dateFilterTo, selectedPeriod]);

  // Update goToPage when currentPage changes
  useEffect(() => {
    setGoToPage(currentPage.toString());
  }, [currentPage]);

  const handleSaveCases = async (formData, isEdit = false) => {
    try {
      // Format data for API
      const causeListData = {
        case_type: formData.caseType || null,
        suit_no: formData.suitNo || null,
        case_title: formData.caseTitle || null,
        hearing_date: formData.dateOfHearing || null,
        hearing_time: formData.timeOfHearing || null,
        judge_name: formData.judgeName || null,
        first_party_title: formData.firstPartyTitle || null,
        first_party_name: formData.firstPartyName || null,
        second_party_title: formData.secondPartyTitle || null,
        second_party_name: formData.secondPartyName || null,
        first_party_counsel_title: formData.firstPartyCounselTitle || null,
        first_party_counsel_name: formData.firstPartyCounsel || null,
        first_party_counsel_contact: formData.firstPartyCounselContact || null,
        second_party_counsel_title: formData.secondPartyCounselTitle || null,
        second_party_counsel_name: formData.secondPartyCounsel || null,
        second_party_counsel_contact: formData.secondPartyCounselContact || null,
        remarks: formData.remarks || null,
        status: 'Active',
        registry_id: registry?.id || null,
        court_id: registry?.court_id || null
      };

      if (isEdit && editingCauseList?.id) {
        await apiPut(`/admin/cause-lists/${editingCauseList.id}`, causeListData);
      } else {
        await apiPost('/admin/cause-lists', causeListData);
      }

      // Refresh cause lists with current filters
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20'
      });
      if (registry?.id) params.append('registry_id', registry.id.toString());
      if (judge?.id) params.append('judge_id', judge.id.toString());
      if (activeTab !== 'All') {
        params.append('status', activeTab);
      } else if (selectedStatusFilter) {
        params.append('status', selectedStatusFilter);
      }
      if (selectedCaseType) params.append('case_type', selectedCaseType);
      if (dateFilterFrom) params.append('hearing_date_from', dateFilterFrom.toISOString().split('T')[0]);
      if (dateFilterTo) params.append('hearing_date_to', dateFilterTo.toISOString().split('T')[0]);
      
      const response = await apiGet(`/admin/cause-lists?${params.toString()}`);
      if (response && response.cause_lists) {
        setCauseLists(response.cause_lists);
        setTotalCauseLists(response.total || 0);
        setTotalPages(response.total_pages || 1);
      }

      setShowAddCasesForm(false);
      setEditingCauseList(null);
    } catch (err) {
      console.error('Error saving cause list:', err);
      alert(`Error saving cause list: ${err.message || 'Unknown error'}`);
    }
  };

  const handleEditCauseList = (causeList) => {
    setEditingCauseList(causeList);
    setShowAddCasesForm(true);
  };

  const handleDeleteCauseList = (causeList) => {
    setCauseListToDelete(causeList);
    setShowDeleteConfirm(true);
  };

  // Handle event drop in calendar (drag and drop)
  const handleEventDrop = async (event, newDateTime) => {
    try {
      const updateData = {
        hearing_date: newDateTime.hearing_date,
        hearing_time: newDateTime.hearing_time
      };
      
      await apiPut(`/admin/cause-lists/${event.rawData.id}`, updateData);
      
      // Refresh cause lists
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20'
      });
      if (registry?.id) params.append('registry_id', registry.id.toString());
      if (judge?.id) params.append('judge_id', judge.id.toString());
      if (activeTab !== 'All') {
        params.append('status', activeTab);
      } else if (selectedStatusFilter) {
        params.append('status', selectedStatusFilter);
      }
      if (selectedCaseType) params.append('case_type', selectedCaseType);
      if (dateFilterFrom) params.append('hearing_date_from', dateFilterFrom.toISOString().split('T')[0]);
      if (dateFilterTo) params.append('hearing_date_to', dateFilterTo.toISOString().split('T')[0]);
      
      const response = await apiGet(`/admin/cause-lists?${params.toString()}`);
      if (response && response.cause_lists) {
        setCauseLists(response.cause_lists);
        setTotalCauseLists(response.total || 0);
        setTotalPages(response.total_pages || 1);
      }
    } catch (err) {
      console.error('Error updating event date:', err);
      alert(`Error updating event: ${err.message || 'Unknown error'}`);
    }
  };

  // Handle calendar navigation
  const handleCalendarNavigate = (newDate) => {
    setCalendarDate(newDate);
  };

  // Handle event click in calendar
  const handleCalendarEventClick = (event) => {
    setSelectedCase(event);
    setShowDrawer(true);
  };

  const handleConfirmDelete = async () => {
    if (!causeListToDelete || !causeListToDelete.id) {
      setShowDeleteConfirm(false);
      setCauseListToDelete(null);
      return;
    }

    try {
      await apiDelete(`/admin/cause-lists/${causeListToDelete.id}`);
      
      // Refresh cause lists with current filters
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20'
      });
      if (registry?.id) params.append('registry_id', registry.id.toString());
      if (judge?.id) params.append('judge_id', judge.id.toString());
      if (activeTab !== 'All') {
        params.append('status', activeTab);
      } else if (selectedStatusFilter) {
        params.append('status', selectedStatusFilter);
      }
      if (selectedCaseType) params.append('case_type', selectedCaseType);
      if (dateFilterFrom) params.append('hearing_date_from', dateFilterFrom.toISOString().split('T')[0]);
      if (dateFilterTo) params.append('hearing_date_to', dateFilterTo.toISOString().split('T')[0]);
      
      const response = await apiGet(`/admin/cause-lists?${params.toString()}`);
      if (response && response.cause_lists) {
        setCauseLists(response.cause_lists);
        setTotalCauseLists(response.total || 0);
        setTotalPages(response.total_pages || 1);
      }

      setShowDeleteConfirm(false);
      setCauseListToDelete(null);
    } catch (err) {
      console.error('Error deleting cause list:', err);
      alert(`Error deleting cause list: ${err.message || 'Unknown error'}`);
      setShowDeleteConfirm(false);
      setCauseListToDelete(null);
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    } catch (e) {
      return dateString;
    }
  };

  // Format time for display
  const formatTime = (timeString) => {
    if (!timeString) return 'N/A';
    try {
      if (typeof timeString === 'string') {
        // Handle "HH:MM:SS" or "HH:MM" format
        const parts = timeString.split(':');
        if (parts.length >= 2) {
          const hours = parseInt(parts[0]);
          const minutes = parts[1];
          const ampm = hours >= 12 ? 'PM' : 'AM';
          const displayHours = hours % 12 || 12;
          return `${displayHours}:${minutes} ${ampm}`;
        }
      }
      return timeString;
    } catch (e) {
      return timeString;
    }
  };

  // Transform API data to display format
  const transformedCauseLists = useMemo(() => {
    return causeLists.map(cl => ({
      id: cl.id,
      title: cl.case_title || cl.suit_no || 'Untitled Case',
      caseNo: cl.suit_no || 'N/A',
      firstParty: cl.first_party_name || 'N/A',
      secondParty: cl.second_party_name || 'N/A',
      judgeName: cl.judge_name || 'N/A',
      hearingDate: formatDate(cl.hearing_date),
      hearingTime: formatTime(cl.hearing_time),
      fullTitle: cl.case_title,
      judge: cl.judge_name,
      recordOfDay: cl.remarks || '',
      outcome: cl.status || 'Active',
      fileDate: formatDate(cl.created_at),
      notableMentions: [],
      judgement: cl.status,
      status: cl.status,
      rawData: cl
    }));
  }, [causeLists]);

  // Use transformed cause lists from API
  const causeListData = transformedCauseLists;

  // If add cases form is shown
  if (showAddCasesForm) {
    return (
      <AddCasesToCauseListPage
        registry={registry}
        judge={judge}
        onBack={() => {
          setShowAddCasesForm(false);
          setEditingCauseList(null);
        }}
        onSave={(formData) => handleSaveCases(formData, !!editingCauseList)}
        initialData={editingCauseList}
        isEditMode={!!editingCauseList}
      />
    );
  }

  return (
    <div className="bg-[#F7F8FA] min-h-screen">
      {/* Full Width Header */}
      <div className="w-full bg-white py-3.5 px-6 mb-4 border-b border-[#D4E1EA]">
        <div className="flex justify-between items-center">
          <div className="flex flex-col items-start gap-1">
            <span className="text-[#050F1C] text-xl font-medium">High Court (Commercial),</span>
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
        <div className="flex flex-col bg-white p-4 gap-10 rounded-lg min-h-[930px] w-full">
          <div className="flex flex-col items-center gap-4">
            {/* Top Section with Breadcrumb and Filters */}
            <div className="w-full flex flex-col gap-4">
              <div className="w-full flex justify-between items-center">
                {/* Breadcrumb */}
                <div className="flex items-center gap-1">
                  <span className="text-[#525866] text-xs opacity-75 mr-1 whitespace-nowrap">CAUSE LIST</span>
                  <ChevronRight className="w-4 h-4 text-[#525866] mr-1" />
                  <span className="text-[#070810] text-sm font-normal whitespace-nowrap">
                    {registry?.name || 'High Court (Commercial)'}
                  </span>
                  <ChevronRight className="w-4 h-4 text-[#525866] mr-1" />
                  <span className="text-[#070810] text-sm font-normal whitespace-nowrap">View Cause list</span>
                </div>

                {/* Filter Controls and Add Button */}
                <div className="flex items-center gap-4">
                  {/* View Toggle */}
                  <div className="flex items-center gap-2 px-2 py-1 bg-[#F7F8FA] rounded-lg border border-[#D4E1EA]">
                    <button
                      onClick={() => setViewMode('table')}
                      className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                        viewMode === 'table'
                          ? 'bg-[#022658] text-white'
                          : 'text-[#525866] hover:bg-gray-100'
                      }`}
                    >
                      Table
                    </button>
                    <button
                      onClick={() => setViewMode('calendar')}
                      className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                        viewMode === 'calendar'
                          ? 'bg-[#022658] text-white'
                          : 'text-[#525866] hover:bg-gray-100'
                      }`}
                    >
                      <Calendar className="w-4 h-4 inline mr-1" />
                      Calendar
                    </button>
                  </div>
                  {/* Add Cases Button */}
                  <button
                    onClick={() => {
                      setEditingCauseList(null);
                      setShowAddCasesForm(true);
                    }}
                    className="h-[42px] px-4 rounded-lg border-4 border-[#0F284726] text-white text-base font-bold hover:opacity-90 transition-opacity whitespace-nowrap"
                    style={{ 
                      background: 'linear-gradient(180deg, #022658 43%, #1A4983 100%)', 
                      boxShadow: '0px 4px 4px rgba(5, 15, 28, 0.10)' 
                    }}
                  >
                    Add Cases to Cause list
                  </button>
                </div>
              </div>
              
              <div className="w-full flex justify-end">
                {/* Filter Controls */}
                <div className="flex items-center gap-6">
                  <span className="text-[#525866] text-xs opacity-75 whitespace-nowrap">Show data for</span>
                  <div 
                    ref={dateFilterRef}
                    className="relative px-2 py-2 bg-[#F7F8FA] rounded-lg border border-[#D4E1EA] flex items-center gap-1 cursor-pointer"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setShowDateFilter(!showDateFilter);
                    }}
                  >
                    <Calendar className="w-4 h-4 text-[#525866]" />
                    <span className="text-[#070810] text-sm whitespace-nowrap">
                      {selectedDateRange === 'Last 7 days' 
                        ? `Last 7 days (as of ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })})`
                        : selectedDateRange === 'This Week'
                        ? `This Week (${dateFilterFrom ? dateFilterFrom.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''} - ${dateFilterTo ? dateFilterTo.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : ''})`
                        : selectedDateRange || 'This Week'
                      }
                    </span>
                    <ChevronDown className="w-4 h-4 text-[#525866]" />
                    {showDateFilter && (
                      <div 
                        className="absolute top-full right-0 mt-1 bg-white border border-[#D4E1EA] rounded-lg shadow-lg z-[100] min-w-[180px]"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {['Today', 'Last 7 days', 'Last 30 days', 'This Week', 'This Month'].map((option) => (
                          <div
                            key={option}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedDateRange(option);
                              if (option === 'This Week' || option === 'This Month') {
                                setSelectedPeriod(option);
                              }
                              setShowDateFilter(false);
                            }}
                            className="px-3 py-2 text-xs text-[#525866] hover:bg-gray-50 cursor-pointer"
                          >
                            {option}
                  </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div 
                    ref={caseTypeFilterRef}
                    className="relative px-2 py-2 bg-[#F7F8FA] rounded-lg border border-[#D4E1EA] flex items-center gap-1 cursor-pointer"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setShowCaseTypeFilter(!showCaseTypeFilter);
                    }}
                  >
                    <span className="text-[#070810] text-sm whitespace-nowrap">
                      {selectedCaseType || 'Case type'}
                    </span>
                    <ChevronDown className="w-4 h-4 text-[#525866]" />
                    {showCaseTypeFilter && (
                      <div 
                        className="absolute top-full right-0 mt-1 bg-white border border-[#D4E1EA] rounded-lg shadow-lg z-[100] min-w-[150px]"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedCaseType(null);
                            setShowCaseTypeFilter(false);
                          }}
                          className="px-3 py-2 text-xs text-[#525866] hover:bg-gray-50 cursor-pointer"
                        >
                          All Types
                  </div>
                        {['Civil', 'Criminal', 'Commercial', 'Family', 'Land'].map((type) => (
                          <div
                            key={type}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedCaseType(type);
                              setShowCaseTypeFilter(false);
                            }}
                            className="px-3 py-2 text-xs text-[#525866] hover:bg-gray-50 cursor-pointer"
                          >
                            {type}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div 
                    ref={statusFilterRef}
                    className="relative px-2 py-2 bg-[#F7F8FA] rounded-lg border border-[#D4E1EA] flex items-center gap-1 cursor-pointer"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setShowStatusFilter(!showStatusFilter);
                    }}
                  >
                    <span className="text-[#070810] text-sm whitespace-nowrap">
                      {selectedStatusFilter || 'Status'}
                    </span>
                    <ChevronDown className="w-4 h-4 text-[#525866]" />
                    {showStatusFilter && (
                      <div 
                        className="absolute top-full right-0 mt-1 bg-white border border-[#D4E1EA] rounded-lg shadow-lg z-[100] min-w-[120px]"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedStatusFilter(null);
                            setShowStatusFilter(false);
                          }}
                          className="px-3 py-2 text-xs text-[#525866] hover:bg-gray-50 cursor-pointer"
                        >
                          All Status
                  </div>
                        {['Active', 'Closed', 'Adjourned'].map((status) => (
                          <div
                            key={status}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedStatusFilter(status);
                              setShowStatusFilter(false);
                            }}
                            className="px-3 py-2 text-xs text-[#525866] hover:bg-gray-50 cursor-pointer"
                          >
                            {status}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Back Button */}
              <button
                onClick={onBack}
                className="w-fit p-2 bg-[#F7F8FA] rounded-lg cursor-pointer hover:opacity-70"
              >
                <ChevronRight className="w-6 h-6 text-[#050F1C] rotate-180" />
              </button>
            </div>

            {/* Period Selector */}
            <div className="w-[386px] px-2 py-1 bg-white rounded-lg border border-[#D4E1EA] flex justify-between items-center">
              <button
                onClick={() => {
                  setSelectedPeriod('Today');
                  setSelectedDateRange('Today');
                }}
                className={`w-[120px] py-2 px-2 rounded ${selectedPeriod === 'Today' ? 'bg-[#022658] text-white font-bold' : 'text-[#050F1C] font-normal'}`}
              >
                Today
              </button>
              <button
                onClick={() => {
                  setSelectedPeriod('This Week');
                  setSelectedDateRange('This Week');
                }}
                className={`w-[120px] py-2 px-2 rounded ${selectedPeriod === 'This Week' ? 'bg-[#022658] text-white font-bold' : 'text-[#050F1C] font-normal'}`}
              >
                This Week
              </button>
              <button
                onClick={() => {
                  setSelectedPeriod('This Month');
                  setSelectedDateRange('This Month');
                }}
                className={`w-[120px] h-[41px] py-2 px-2 rounded ${selectedPeriod === 'This Month' ? 'bg-[#022658] text-white font-bold' : 'text-[#050F1C] font-normal'}`}
              >
                This Month
              </button>
            </div>

            {/* Tabs */}
            <div className="w-full flex items-center gap-4 px-1">
              <button
                onClick={() => setActiveTab('All')}
                className={`pb-2 ${activeTab === 'All' ? 'border-b-4 border-[#022658] text-[#022658] font-bold' : 'text-[#525866] font-normal'}`}
              >
                All
              </button>
              <button
                onClick={() => setActiveTab('Active')}
                className={`pb-2 ${activeTab === 'Active' ? 'border-b-4 border-[#022658] text-[#022658] font-bold' : 'text-[#525866] font-normal'}`}
              >
                Active
              </button>
              <button
                onClick={() => setActiveTab('Closed')}
                className={`pb-2 ${activeTab === 'Closed' ? 'border-b-4 border-[#022658] text-[#022658] font-bold' : 'text-[#525866] font-normal'}`}
              >
                Closed
              </button>
            </div>

            {/* Table or Calendar Section */}
            {viewMode === 'table' ? (
            <div className="w-full flex flex-col gap-4">
              {/* Search and Filter Controls */}
              <div className="w-full flex justify-between items-start gap-2">
                <div className="relative flex-1 max-w-[490px]">
                  <input
                    type="text"
                    placeholder="Search Case"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full py-2 pl-9 pr-3 bg-[#F7F8FA] rounded-lg border border-[#F7F8FA] text-[#868C98] text-[10px] outline-none"
                  />
                  <Search className="absolute left-2.5 top-2.5 w-3 h-3 text-[#868C98]" />
                </div>
                <div className="flex items-start gap-1.5 flex-shrink-0">
                  <button className="px-2.5 py-2 rounded border border-[#D4E1EA] flex items-center gap-1.5">
                    <Filter className="w-3 h-3 text-[#868C98]" />
                    <span className="text-[#525866] text-xs">Filter</span>
                  </button>
                  <button className="px-2.5 py-2 rounded border border-[#D4E1EA] flex items-center gap-1.5">
                    <ArrowUpDown className="w-3 h-3 text-[#868C98]" />
                    <span className="text-[#525866] text-xs">Sort</span>
                  </button>
                </div>
              </div>

              {/* Table */}
              <div className="w-full overflow-hidden rounded-[14px] border border-[#E5E8EC]">
                {/* Table Header */}
                <div className="w-full py-4 bg-[#F4F6F9] flex items-center gap-3 px-3">
                  <div className="flex-[2.3] min-w-[230px] px-2">
                    <span className="text-[#070810] text-sm font-bold">Title</span>
                  </div>
                  <div className="flex-1 min-w-[110px] px-2">
                    <span className="text-[#070810] text-sm font-bold">Case No.</span>
                  </div>
                  <div className="flex-1 min-w-[110px] px-2">
                    <span className="text-[#070810] text-sm font-bold">First Party</span>
                  </div>
                  <div className="flex-1 min-w-[110px] px-2">
                    <span className="text-[#070810] text-sm font-bold">Second Party</span>
                  </div>
                  <div className="flex-[1.4] min-w-[140px] px-2">
                    <span className="text-[#070810] text-sm font-bold">Judge's name</span>
                  </div>
                  <div className="flex-[1.4] min-w-[140px] px-2">
                    <span className="text-[#070810] text-sm font-bold">Hearing date</span>
                  </div>
                  <div className="flex-1 min-w-[110px] px-2 flex justify-center">
                    <span className="text-[#070810] text-sm font-bold">Hearing time</span>
                  </div>
                  <div className="w-20 px-2 flex justify-center">
                    <span className="text-[#070810] text-sm font-bold">Actions</span>
                  </div>
                </div>

                {/* Table Rows */}
                <div className="flex flex-col">
                  {loadingCauseLists ? (
                    <div className="flex items-center justify-center w-full py-8">
                      <span className="text-[#525866] text-sm">Loading cause lists...</span>
                    </div>
                  ) : causeListData.length === 0 ? (
                    <div className="flex flex-col items-center justify-center w-full py-12 gap-4">
                      <span className="text-[#525866] text-sm">
                        {searchQuery.trim() 
                          ? `No cause lists found matching "${searchQuery}"`
                          : 'No cause lists found'
                        }
                      </span>
                      {!searchQuery.trim() && (
                        <button
                          onClick={() => {
                            setEditingCauseList(null);
                            setShowAddCasesForm(true);
                          }}
                          className="flex items-center gap-2 px-6 py-3 bg-[#022658] text-white rounded-lg hover:bg-[#033a7a] transition-colors"
                        >
                          <span>Add First Cause List</span>
                        </button>
                      )}
                    </div>
                  ) : (
                    causeListData.map((caseItem, index) => (
                    <div
                        key={caseItem.id || index}
                        className={`w-full py-3 px-3 flex items-center gap-3 border-b border-[#E5E8EC] hover:bg-gray-50 transition-colors ${index === causeListData.length - 1 ? '' : 'border-b'}`}
                      >
                        <div 
                          className="flex-[2.3] min-w-[230px] px-2 cursor-pointer"
                      onClick={() => {
                        setSelectedCase(caseItem);
                        setShowDrawer(true);
                      }}
                    >
                        <span className="text-[#070810] text-sm">{caseItem.title}</span>
                      </div>
                        <div 
                          className="flex-1 min-w-[110px] px-2 cursor-pointer"
                          onClick={() => {
                            setSelectedCase(caseItem);
                            setShowDrawer(true);
                          }}
                        >
                        <span className="text-[#070810] text-sm">{caseItem.caseNo}</span>
                      </div>
                        <div 
                          className="flex-1 min-w-[110px] px-2 cursor-pointer"
                          onClick={() => {
                            setSelectedCase(caseItem);
                            setShowDrawer(true);
                          }}
                        >
                        <span className="text-[#070810] text-sm">{caseItem.firstParty}</span>
                      </div>
                        <div 
                          className="flex-1 min-w-[110px] px-2 cursor-pointer"
                          onClick={() => {
                            setSelectedCase(caseItem);
                            setShowDrawer(true);
                          }}
                        >
                        <span className="text-[#070810] text-sm">{caseItem.secondParty}</span>
                      </div>
                        <div 
                          className="flex-[1.4] min-w-[140px] px-2 cursor-pointer"
                          onClick={() => {
                            setSelectedCase(caseItem);
                            setShowDrawer(true);
                          }}
                        >
                        <span className="text-[#070810] text-sm">{caseItem.judgeName}</span>
                      </div>
                        <div 
                          className="flex-[1.4] min-w-[140px] px-2 cursor-pointer"
                          onClick={() => {
                            setSelectedCase(caseItem);
                            setShowDrawer(true);
                          }}
                        >
                        <span className="text-[#070810] text-sm">{caseItem.hearingDate}</span>
                      </div>
                        <div 
                          className="flex-1 min-w-[110px] px-2 flex justify-center cursor-pointer"
                          onClick={() => {
                            setSelectedCase(caseItem);
                            setShowDrawer(true);
                          }}
                        >
                        <span className="text-[#070810] text-sm">{caseItem.hearingTime}</span>
                      </div>
                        <div className="w-20 px-2 flex justify-center gap-2" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditCauseList(caseItem.rawData);
                            }}
                            className="p-1.5 rounded hover:bg-gray-100 transition-colors"
                            title="Edit cause list"
                          >
                            <Edit className="w-4 h-4 text-[#022658]" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteCauseList(caseItem.rawData);
                            }}
                            className="p-1.5 rounded hover:bg-red-50 transition-colors"
                            title="Delete cause list"
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </button>
                      </div>
                    </div>
                    ))
                  )}
                </div>
              </div>

              {/* Pagination */}
              {totalCauseLists > 0 && (
              <div className="w-full flex justify-between items-center">
                <div className="flex items-center gap-10">
                    <span className="text-[#525866] text-sm text-right">
                      {((currentPage - 1) * 20) + 1}-{Math.min(currentPage * 20, totalCauseLists)} of {totalCauseLists}
                    </span>
                  <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className="h-8 px-3 py-2 bg-white rounded border border-[#D4E1EA] flex items-center gap-1 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                      <ChevronLeft className="w-4 h-4 text-[#868C98]" />
                      <span className="text-[#525866] text-xs">Back</span>
                    </button>
                      
                      {/* Dynamic page numbers */}
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }
                        
                        return (
                          <button
                            key={pageNum}
                            onClick={() => setCurrentPage(pageNum)}
                            className={`px-2 py-2 rounded text-xs ${
                              currentPage === pageNum
                                ? 'bg-[#022658] text-white font-bold'
                                : 'bg-white border border-[#D4E1EA] text-[#525866] hover:bg-gray-50'
                            }`}
                          >
                            {pageNum}
                    </button>
                        );
                      })}
                      
                      <button
                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                        className="h-8 px-3 py-2 bg-white rounded border border-[#D4E1EA] flex items-center gap-1 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                      <span className="text-[#525866] text-xs">Next</span>
                      <ChevronRight className="w-4 h-4 text-[#868C98]" />
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[#050F1C] text-sm">Page</span>
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
                      className="w-[51px] h-8 px-2 py-1 bg-white rounded border border-[#F59E0B] text-[#050F1C] text-sm outline-none text-center"
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
              )}
            </div>
            ) : (
              /* Calendar View */
              <div className="w-full">
                <CauseListCalendar
                  events={causeListData}
                  onEventDrop={handleEventDrop}
                  onEventClick={handleCalendarEventClick}
                  onEventEdit={handleEditCauseList}
                  onEventDelete={handleDeleteCauseList}
                  onNavigate={handleCalendarNavigate}
                  currentDate={calendarDate}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Cause List Drawer */}
      {showDrawer && selectedCase && (
        <ViewCauseListDrawer
          caseData={{
            caseNo: selectedCase.caseNo,
            title: selectedCase.fullTitle || selectedCase.title,
            hearingDate: selectedCase.hearingDate,
            hearingTime: selectedCase.hearingTime,
            judge: selectedCase.judge || selectedCase.judgeName,
            recordOfDay: selectedCase.recordOfDay,
            outcome: selectedCase.outcome,
            fileDate: selectedCase.fileDate,
            notableMentions: selectedCase.notableMentions,
            judgement: selectedCase.judgement,
            rawData: selectedCase.rawData
          }}
          onClose={() => {
            setShowDrawer(false);
            setSelectedCase(null);
          }}
          onEdit={handleEditCauseList}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false);
          setCauseListToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Are you sure you want to delete this cause list entry?"
        message={`Case: ${causeListToDelete?.case_title || causeListToDelete?.suit_no || 'N/A'}\nHearing Date: ${causeListToDelete?.hearing_date || 'N/A'}\n\nThis action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
      />
    </div>
  );
};

export default ViewCauseListPage;

