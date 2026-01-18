import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Search, ChevronDown, Bell, ChevronRight, ChevronLeft, Filter, ArrowUpDown, FileText, Edit, Trash2, Plus } from 'lucide-react';
import RegistrarCaseDetailsPage from '../RegistrarCaseDetailsPage';
import AddNewCaseForm from '../AddNewCaseForm';
import AdminHeader from './AdminHeader';
import RegistrarHeader from '../RegistrarHeader';
import NotificationContainer from '../NotificationContainer';
import useNotifications from '../../hooks/useNotifications';
import { apiGet, apiPost, apiPut, apiDelete } from '../../utils/api';
import ConfirmDialog from './ConfirmDialog';

const CaseProfilePage = ({ userInfo, onNavigate, onLogout, isRegistrar }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [activeTab, setActiveTab] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [goToPage, setGoToPage] = useState('1');
  const [showCaseDetails, setShowCaseDetails] = useState(false);
  const [selectedCase, setSelectedCase] = useState(null);
  const [showAddCaseForm, setShowAddCaseForm] = useState(false);
  const [editingCase, setEditingCase] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [caseToDelete, setCaseToDelete] = useState(null);
  const filterDropdownRef = useRef(null);
  const sortDropdownRef = useRef(null);
  
  // Filter states
  const [filterCourtType, setFilterCourtType] = useState('');
  const [filterRegion, setFilterRegion] = useState('');
  const [filterYear, setFilterYear] = useState('');
  
  // Sort states
  const [sortBy, setSortBy] = useState('date'); // date, title, status, suit_reference_number
  const [sortOrder, setSortOrder] = useState('desc'); // asc, desc
  const { notifications, showSuccess, showError, removeNotification } = useNotifications();
  
  // Data states
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalCases, setTotalCases] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Handle click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterDropdownRef.current && !filterDropdownRef.current.contains(event.target)) {
        setShowFilterDropdown(false);
      }
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(event.target)) {
        setShowSortDropdown(false);
      }
    };

    if (showFilterDropdown || showSortDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showFilterDropdown, showSortDropdown]);

  // Check for case data in sessionStorage on mount (for navigation from other pages)
  useEffect(() => {
    const storedCaseData = sessionStorage.getItem('selectedCaseData');
    if (storedCaseData) {
      try {
        const caseData = JSON.parse(storedCaseData);
        setSelectedCase(caseData);
        setShowCaseDetails(true);
        sessionStorage.removeItem('selectedCaseData'); // Clear after use
      } catch (err) {
        console.error('Error parsing stored case data:', err);
        sessionStorage.removeItem('selectedCaseData');
      }
    }
  }, []);

  // Fetch cases from API
  useEffect(() => {
    fetchCases();
  }, [currentPage, activeTab, searchQuery, filterCourtType, filterRegion, filterYear, sortBy, sortOrder]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
    setGoToPage('1');
  }, [activeTab, searchQuery]);

  // Update goToPage when currentPage changes
  useEffect(() => {
    setGoToPage(currentPage.toString());
  }, [currentPage]);

  const fetchCases = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20'
      });
      
      if (searchQuery.trim()) {
        params.append('query', searchQuery.trim());
      }
      
      // Map activeTab to status filter
      if (activeTab === 'Open') {
        params.append('status', 'active');
      } else if (activeTab === 'Pending') {
        params.append('status', 'pending');
      } else if (activeTab === 'Adjourned') {
        params.append('status', 'adjourned');
      } else if (activeTab === 'Heard') {
        params.append('status', 'heard');
      }
      
      // Add filter parameters
      if (filterCourtType) {
        params.append('court_type', filterCourtType);
      }
      if (filterRegion) {
        params.append('region', filterRegion);
      }
      if (filterYear) {
        params.append('year', filterYear);
      }
      
      // Add sort parameters
      if (sortBy) {
        params.append('sort_by', sortBy);
      }
      if (sortOrder) {
        params.append('sort_order', sortOrder);
      }
      
      console.log('Fetching cases from:', `/cases?${params.toString()}`);
      const response = await apiGet(`/cases?${params.toString()}`);
      console.log('Cases response:', response);
      
      if (response && response.cases) {
        console.log('Setting cases:', response.cases.length);
        setCases(response.cases);
        setTotalCases(response.total || 0);
        setTotalPages(response.total_pages || 1);
      } else {
        console.log('No cases in response');
        setCases([]);
        setTotalCases(0);
        setTotalPages(1);
      }
    } catch (err) {
      console.error('Error fetching cases:', err);
      setCases([]);
      setTotalCases(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  // Format date helper
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
    } catch {
      return dateString;
    }
  };

  // Format date for display
  const formatDateLong = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    } catch {
      return dateString;
    }
  };

  // Handle edit case
  const handleEditCase = (caseItem) => {
    setEditingCase(caseItem);
    setShowAddCaseForm(true);
  };

  // Handle delete case
  const handleDeleteCase = (caseItem) => {
    setCaseToDelete(caseItem);
    setShowDeleteConfirm(true);
  };

  // Confirm delete
  const handleConfirmDelete = async () => {
    if (!caseToDelete || !caseToDelete.id) {
      setShowDeleteConfirm(false);
      setCaseToDelete(null);
      return;
    }

    try {
      await apiDelete(`/admin/cases/${caseToDelete.id}`);
      showSuccess('Success', 'Case deleted successfully');
      await fetchCases(); // Refresh list
      setShowDeleteConfirm(false);
      setCaseToDelete(null);
    } catch (err) {
      console.error('Error deleting case:', err);
      showError('Error', `Error deleting case: ${err.detail || err.message || 'Unknown error'}`);
      setShowDeleteConfirm(false);
      setCaseToDelete(null);
    }
  };

  // Handle save case (create or update)
  const handleSaveCase = async (caseData) => {
    try {
      if (editingCase) {
        await apiPut(`/admin/cases/${editingCase.id}`, caseData);
        showSuccess('Success', 'Case updated successfully');
      } else {
        await apiPost('/admin/cases', caseData);
        showSuccess('Success', 'Case created successfully');
      }
      setShowAddCaseForm(false);
      setEditingCase(null);
      await fetchCases(); // Refresh list
    } catch (err) {
      console.error('Error saving case:', err);
      showError('Error', `Error saving case: ${err.detail || err.message || 'Unknown error'}`);
    }
  };

  const handleCaseClick = async (caseItem) => {
    try {
      // Fetch full case details from API
      const fullCaseData = await apiGet(`/cases/${caseItem.id}`);
      setSelectedCase(fullCaseData);
      setShowCaseDetails(true);
    } catch (err) {
      console.error('Error fetching case details:', err);
      // Fallback to basic case data if API fails
      setSelectedCase(caseItem);
      setShowCaseDetails(true);
    }
  };

  // Use userInfo from props or localStorage
  const displayUserInfo = userInfo || JSON.parse(localStorage.getItem('userData') || '{}');

  // If add case form is shown
  if (showAddCaseForm) {
    return (
      <AddNewCaseForm
        onBack={() => {
          setShowAddCaseForm(false);
          setEditingCase(null);
        }}
        onSave={handleSaveCase}
        userInfo={displayUserInfo}
        onNavigate={onNavigate}
        onLogout={onLogout}
        isRegistrar={isRegistrar}
        initialData={editingCase}
        isEditMode={!!editingCase}
      />
    );
  }

  // If case details page is shown
  if (showCaseDetails) {
    return (
      <RegistrarCaseDetailsPage
        caseData={selectedCase}
        onBack={() => {
          const backTargetRaw = sessionStorage.getItem('caseBackTarget');
          if (backTargetRaw) {
            try {
              const backTarget = JSON.parse(backTargetRaw);
              if (backTarget?.type === 'bank' && backTarget?.bankId) {
                sessionStorage.setItem('selectedBankData', JSON.stringify({
                  id: backTarget.bankId,
                  name: backTarget.bankName || 'Bank'
                }));
                sessionStorage.removeItem('caseBackTarget');
                onNavigate('companies');
                return;
              }
            } catch (err) {
              console.error('Failed to parse caseBackTarget:', err);
            }
            sessionStorage.removeItem('caseBackTarget');
          }
          setShowCaseDetails(false);
          setSelectedCase(null);
        }}
        userInfo={displayUserInfo}
        onNavigate={onNavigate}
        onLogout={onLogout}
        isRegistrar={isRegistrar}
      />
    );
  }

  // Determine which header to use based on isRegistrar prop or user role
  const HeaderComponent = isRegistrar ? RegistrarHeader : AdminHeader;

  // Calculate pagination display
  const startItem = (currentPage - 1) * 20 + 1;
  const endItem = Math.min(currentPage * 20, totalCases);

  return (
    <div className="bg-[#F7F8FA] min-h-screen">
      {/* Full Width Header */}
      <HeaderComponent userInfo={displayUserInfo} onNavigate={onNavigate} onLogout={onLogout} />
      
      {/* Page Title Section - Only show for registrar */}
      {isRegistrar && (
        <div className="px-6 mb-4">
          <div className="flex flex-col items-start gap-1">
            <span className="text-[#050F1C] text-xl font-medium">High Court (Commercial),</span>
            <span className="text-[#050F1C] text-base opacity-75">Track all your activities here.</span>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="px-6 w-full">
        <div className="flex flex-col bg-white p-4 gap-6 rounded-lg w-full">
          {/* Header Section */}
          <div className="flex flex-col gap-6">
            <span className="text-[#525866] text-xs opacity-75">CASE PROFILE</span>
            
            <div className="flex items-center gap-1">
              <ChevronRight className="w-4 h-4 text-[#050F1C] rotate-180" />
              <FileText className="w-4 h-4 text-[#050F1C]" />
              <span className="text-[#050F1C] text-xl font-semibold">Cases</span>
            </div>
            <span className="text-[#070810] text-sm opacity-75">
              All cases in the High Court (Commercial) database.
            </span>
          </div>

          {/* Stats Card and Action Buttons */}
          <div className="flex justify-between items-center gap-4">
            {/* Stats Card */}
            <div className="w-[271.5px] p-2 bg-white rounded-lg border border-[#D4E1EA] flex items-center gap-3">
              <div className="p-2 bg-[#F7F8FA] rounded-lg">
                <FileText className="w-6 h-6 text-[#868C98]" />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[#868C98] text-xs">Total number of Cases</span>
                <span className="text-[#F59E0B] text-base font-medium">{totalCases.toLocaleString()}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => onNavigate('case-hearings')}
                className="w-[271.5px] h-[42px] px-2.5 rounded-lg border-2 border-[#0F2847] text-[#022658] text-base font-bold hover:opacity-90 transition-opacity"
                style={{ boxShadow: '0px 4px 4px rgba(5, 15, 28, 0.10)' }}
              >
                View Cause List
              </button>
              <button
                onClick={() => setShowAddCaseForm(true)}
                className="w-[271.5px] h-[42px] px-2.5 rounded-lg border-4 border-[#0F284726] text-white text-base font-bold hover:opacity-90 transition-opacity"
                style={{ 
                  background: 'linear-gradient(180deg, #022658 43%, #1A4983 100%)', 
                  boxShadow: '0px 4px 4px rgba(5, 15, 28, 0.10)' 
                }}
              >
                Add New Case
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-4 border-b border-transparent">
            <button
              onClick={() => setActiveTab('All')}
              className={`pb-2 px-0 text-base transition-colors ${
                activeTab === 'All'
                  ? 'text-[#022658] border-b-4 border-[#022658] font-bold'
                  : 'text-[#525866] font-normal'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setActiveTab('Open')}
              className={`pb-2 px-0 text-base transition-colors ${
                activeTab === 'Open'
                  ? 'text-[#022658] border-b-4 border-[#022658] font-bold'
                  : 'text-[#525866] font-normal'
              }`}
            >
              Open
            </button>
            <button
              onClick={() => setActiveTab('Pending')}
              className={`pb-2 px-0 text-base transition-colors ${
                activeTab === 'Pending'
                  ? 'text-[#022658] border-b-4 border-[#022658] font-bold'
                  : 'text-[#525866] font-normal'
              }`}
            >
              Pending
            </button>
            <button
              onClick={() => setActiveTab('Adjourned')}
              className={`pb-2 px-0 text-base transition-colors ${
                activeTab === 'Adjourned'
                  ? 'text-[#022658] border-b-4 border-[#022658] font-bold'
                  : 'text-[#525866] font-normal'
              }`}
            >
              Adjourned
            </button>
            <button
              onClick={() => setActiveTab('Heard')}
              className={`pb-2 px-0 text-base transition-colors ${
                activeTab === 'Heard'
                  ? 'text-[#022658] border-b-4 border-[#022658] font-bold'
                  : 'text-[#525866] font-normal'
              }`}
            >
              Heard
            </button>
          </div>

          {/* Search and Filter Section */}
          <div className="flex flex-col gap-4 w-full">
            <div className="flex justify-between items-start gap-2 w-full">
              {/* Search Bar */}
              <div className="relative flex-1 max-w-[490px]">
                <Search className="absolute left-2.5 top-2.5 w-3 h-3 text-[#868C98]" />
                <input
                  type="text"
                  placeholder="Search Case"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-[31px] pl-8 pr-3 py-2 bg-[#F7F8FA] rounded-[5.8px] border border-[#F7F8FA] text-[#868C98] text-[10px] font-normal outline-none focus:border-[#022658]"
                />
              </div>

              {/* Filter and Sort */}
              <div className="flex items-center gap-1.5 flex-shrink-0">
                {/* Filter Button */}
                <div className="relative" ref={filterDropdownRef}>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowFilterDropdown(!showFilterDropdown);
                      setShowSortDropdown(false);
                    }}
                    className={`flex items-center gap-1.5 px-2.5 py-2 rounded border transition-colors ${
                      (filterCourtType || filterRegion || filterYear) 
                        ? 'border-[#022658] bg-[#022658] text-white' 
                        : 'border-[#D4E1EA] hover:bg-gray-50'
                    }`}
                  >
                    <Filter className={`w-3 h-3 ${(filterCourtType || filterRegion || filterYear) ? 'text-white' : 'text-[#868C98]'}`} />
                    <span className={`text-xs font-normal ${(filterCourtType || filterRegion || filterYear) ? 'text-white' : 'text-[#525866]'}`}>
                      Filter
                      {(filterCourtType || filterRegion || filterYear) && (
                        <span className="ml-1 bg-white text-[#022658] rounded-full px-1 text-[10px]">
                          {(filterCourtType ? 1 : 0) + (filterRegion ? 1 : 0) + (filterYear ? 1 : 0)}
                        </span>
                      )}
                    </span>
                    <ChevronDown className={`w-3 h-3 transition-transform ${showFilterDropdown ? 'rotate-180' : ''} ${(filterCourtType || filterRegion || filterYear) ? 'text-white' : 'text-[#868C98]'}`} />
                  </button>
                  
                  {showFilterDropdown && (
                    <div className="absolute right-0 mt-2 bg-white border border-[#D4E1EA] rounded-lg shadow-lg z-[100] min-w-[200px] p-3">
                      <div className="flex flex-col gap-3">
                        <div>
                          <label className="text-[#050F1C] text-xs font-medium mb-1 block">Court Type</label>
                          <select
                            value={filterCourtType}
                            onChange={(e) => {
                              setFilterCourtType(e.target.value);
                              setCurrentPage(1);
                              setShowFilterDropdown(false);
                            }}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full h-8 px-2 rounded border border-[#B1B9C6] text-[#525866] text-xs outline-none focus:border-[#022658]"
                          >
                            <option value="">All Court Types</option>
                            <option value="SC">Supreme Court</option>
                            <option value="CA">Court of Appeal</option>
                            <option value="HC">High Court</option>
                            <option value="CC">Circuit Court</option>
                            <option value="DC">District Court</option>
                          </select>
                        </div>
                        
                        <div>
                          <label className="text-[#050F1C] text-xs font-medium mb-1 block">Region</label>
                          <select
                            value={filterRegion}
                            onChange={(e) => {
                              setFilterRegion(e.target.value);
                              setCurrentPage(1);
                              setShowFilterDropdown(false);
                            }}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full h-8 px-2 rounded border border-[#B1B9C6] text-[#525866] text-xs outline-none focus:border-[#022658]"
                          >
                            <option value="">All Regions</option>
                            <option value="Greater Accra Region">Greater Accra Region</option>
                            <option value="Ashanti Region">Ashanti Region</option>
                            <option value="Western Region">Western Region</option>
                            <option value="Western North Region">Western North Region</option>
                            <option value="Eastern Region">Eastern Region</option>
                            <option value="Central Region">Central Region</option>
                            <option value="Northern Region">Northern Region</option>
                            <option value="Volta Region">Volta Region</option>
                            <option value="Upper East Region">Upper East Region</option>
                            <option value="Upper West Region">Upper West Region</option>
                            <option value="Bono Region">Bono Region</option>
                            <option value="Ahafo Region">Ahafo Region</option>
                            <option value="Bono East Region">Bono East Region</option>
                            <option value="Oti Region">Oti Region</option>
                            <option value="Savannah Region">Savannah Region</option>
                            <option value="North East Region">North East Region</option>
                          </select>
                        </div>
                        
                        <div>
                          <label className="text-[#050F1C] text-xs font-medium mb-1 block">Year</label>
                          <input
                            type="text"
                            placeholder="YYYY"
                            value={filterYear}
                            onChange={(e) => {
                              setFilterYear(e.target.value);
                              setCurrentPage(1);
                            }}
                            onClick={(e) => e.stopPropagation()}
                            maxLength="4"
                            className="w-full h-8 px-2 rounded border border-[#B1B9C6] text-[#525866] text-xs outline-none focus:border-[#022658]"
                          />
                        </div>
                        
                        {(filterCourtType || filterRegion || filterYear) && (
                          <button
                            onClick={() => {
                              setFilterCourtType('');
                              setFilterRegion('');
                              setFilterYear('');
                              setCurrentPage(1);
                            }}
                            className="w-full h-8 px-2 rounded border border-red-300 text-red-600 text-xs hover:bg-red-50 transition-colors"
                          >
                            Clear Filters
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Sort Button */}
                <div className="relative" ref={sortDropdownRef}>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowSortDropdown(!showSortDropdown);
                      setShowFilterDropdown(false);
                    }}
                    className="flex items-center gap-1.5 px-2.5 py-2 rounded border border-[#D4E1EA] hover:bg-gray-50 transition-colors"
                  >
                    <ArrowUpDown className="w-3 h-3 text-[#868C98]" />
                    <span className="text-[#525866] text-xs font-normal">Sort</span>
                    <ChevronDown className={`w-3 h-3 text-[#868C98] transition-transform ${showSortDropdown ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {showSortDropdown && (
                    <div className="absolute right-0 mt-2 bg-white border border-[#D4E1EA] rounded-lg shadow-lg z-[100] min-w-[200px] p-3">
                      <div className="flex flex-col gap-3">
                        <div>
                          <label className="text-[#050F1C] text-xs font-medium mb-1 block">Sort By</label>
                          <select
                            value={sortBy}
                            onChange={(e) => {
                              setSortBy(e.target.value);
                              setCurrentPage(1);
                              setShowSortDropdown(false);
                            }}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full h-8 px-2 rounded border border-[#B1B9C6] text-[#525866] text-xs outline-none focus:border-[#022658]"
                          >
                            <option value="date">Date Filed</option>
                            <option value="title">Title</option>
                            <option value="suit_reference_number">Suit Number</option>
                            <option value="status">Status</option>
                            <option value="updated_at">Last Updated</option>
                          </select>
                        </div>
                        
                        <div>
                          <label className="text-[#050F1C] text-xs font-medium mb-1 block">Order</label>
                          <select
                            value={sortOrder}
                            onChange={(e) => {
                              setSortOrder(e.target.value);
                              setCurrentPage(1);
                              setShowSortDropdown(false);
                            }}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full h-8 px-2 rounded border border-[#B1B9C6] text-[#525866] text-xs outline-none focus:border-[#022658]"
                          >
                            <option value="desc">Descending</option>
                            <option value="asc">Ascending</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-hidden rounded-[14px] border border-[#E5E8EC] w-full">
              {/* Table Header */}
              <div className="bg-[#F4F6F9] py-4 px-2">
                <div className="flex items-center gap-3 w-full">
                  <div className="flex-[2.8] min-w-[280px] px-2">
                    <span className="text-[#070810] text-sm font-bold">Title</span>
                  </div>
                  <div className="flex-[1.2] min-w-[120px] px-2">
                    <span className="text-[#070810] text-sm font-bold">Suit No.</span>
                  </div>
                  <div className="flex-1 min-w-[110px] px-2">
                    <span className="text-[#070810] text-sm font-bold">Filed on</span>
                  </div>
                  <div className="flex-[1.4] min-w-[140px] px-2">
                    <span className="text-[#070810] text-sm font-bold">Last updated</span>
                  </div>
                  <div className="flex-[1.6] min-w-[160px] px-2">
                    <span className="text-[#070810] text-sm font-bold">Judge</span>
                  </div>
                  <div className="flex-1 min-w-[110px] px-2 flex justify-center">
                    <span className="text-[#070810] text-sm font-bold">Status</span>
                  </div>
                  <div className="flex-[0.8] min-w-[80px] px-2 flex justify-center">
                    <span className="text-[#070810] text-sm font-bold">Actions</span>
                  </div>
                </div>
              </div>

              {/* Table Body */}
              <div className="bg-white w-full">
                {loading ? (
                  <div className="py-12 text-center">
                    <span className="text-[#525866] text-sm">Loading cases...</span>
                  </div>
                ) : cases.length === 0 ? (
                  <div className="py-12 text-center">
                    <span className="text-[#525866] text-sm">No cases found</span>
                  </div>
                ) : (
                  cases.map((caseItem, index) => (
                    <div
                      key={caseItem.id}
                      className={`flex items-center gap-3 py-3 px-2 w-full hover:bg-gray-50 transition-colors ${
                        index < cases.length - 1 ? 'border-b border-[#E5E8EC]' : ''
                      }`}
                    >
                      <div 
                        className="flex-[2.8] min-w-[280px] px-2 cursor-pointer"
                        onClick={() => handleCaseClick(caseItem)}
                      >
                        <span className="text-[#070810] text-sm font-normal">{caseItem.title || 'N/A'}</span>
                      </div>
                      <div 
                        className="flex-[1.2] min-w-[120px] px-2 cursor-pointer"
                        onClick={() => handleCaseClick(caseItem)}
                      >
                        <span className="text-[#070810] text-sm font-normal">{caseItem.suit_reference_number || 'N/A'}</span>
                      </div>
                      <div 
                        className="flex-1 min-w-[110px] px-2 cursor-pointer"
                        onClick={() => handleCaseClick(caseItem)}
                      >
                        <span className="text-[#070810] text-sm font-normal">{formatDate(caseItem.date)}</span>
                      </div>
                      <div 
                        className="flex-[1.4] min-w-[140px] px-2 cursor-pointer"
                        onClick={() => handleCaseClick(caseItem)}
                      >
                        <span className="text-[#070810] text-sm font-normal">{formatDate(caseItem.updated_at)}</span>
                      </div>
                      <div 
                        className="flex-[1.6] min-w-[160px] px-2 cursor-pointer"
                        onClick={() => handleCaseClick(caseItem)}
                      >
                        <span className="text-[#070810] text-sm font-normal">{caseItem.presiding_judge || 'N/A'}</span>
                      </div>
                      <div className="flex-1 min-w-[110px] px-2 flex justify-center">
                        {(() => {
                          const status = caseItem.status?.toLowerCase() || '';
                          let bgColor = '';
                          let textColor = '';
                          let displayStatus = caseItem.status || 'N/A';
                          
                          // Map status to color codes
                          if (status === 'active' || status === '1' || status === 'open' || status === 'ongoing') {
                            bgColor = 'bg-blue-50';
                            textColor = 'text-blue-600';
                            displayStatus = 'Active';
                          } else if (status === 'heard' || status === 'completed' || status === 'closed') {
                            bgColor = 'bg-green-50';
                            textColor = 'text-green-600';
                            displayStatus = status === 'closed' ? 'Closed' : 'Heard';
                          } else if (status === 'adjourned') {
                            bgColor = 'bg-yellow-50';
                            textColor = 'text-yellow-600';
                            displayStatus = 'Adjourned';
                          } else if (status === 'pending') {
                            bgColor = 'bg-orange-50';
                            textColor = 'text-orange-600';
                            displayStatus = 'Pending';
                          } else if (status === 'dismissed' || status === 'rejected') {
                            bgColor = 'bg-red-50';
                            textColor = 'text-red-600';
                            displayStatus = 'Dismissed';
                          } else {
                            bgColor = 'bg-gray-50';
                            textColor = 'text-gray-600';
                          }
                          
                          return (
                            <span className={`text-xs font-medium px-2 py-1 rounded whitespace-nowrap ${bgColor} ${textColor}`}>
                              {displayStatus}
                            </span>
                          );
                        })()}
                      </div>
                      <div className="flex-[0.8] min-w-[80px] px-2 flex justify-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditCase(caseItem);
                          }}
                          className="p-1.5 rounded hover:bg-gray-200 transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4 text-[#022658]" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteCase(caseItem);
                          }}
                          className="p-1.5 rounded hover:bg-red-100 transition-colors"
                          title="Delete"
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
            <div className="flex justify-between items-center">
              <span className="text-[#525866] text-sm text-right">
                {cases.length > 0 ? `${startItem}-${endItem} of ${totalCases.toLocaleString()}` : '0-0 of 0'}
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
                        className={`px-2 py-2 rounded border border-[#D4E1EA] text-xs font-normal ${
                          currentPage === pageNum
                            ? 'bg-[#022658] text-white'
                            : 'bg-white text-[#525866] hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}

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
          </div>
        </div>
      </div>

      {/* Toast Notifications */}
      <NotificationContainer
        notifications={notifications}
        onRemove={removeNotification}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false);
          setCaseToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Case"
        message={`Are you sure you want to delete "${caseToDelete?.title || 'this case'}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
      />
    </div>
  );
};

export default CaseProfilePage;

