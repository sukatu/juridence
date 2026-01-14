import React, { useState, useEffect, useRef } from 'react';
import UploadGazetteForm from './UploadGazetteForm';
import AdminHeader from './AdminHeader';
import { apiGet, apiDelete, apiPut } from '../../utils/api';
import { showSuccess, handleApiError, confirmAction } from '../../utils/errorHandler';
import { Search, Filter, ChevronDown, X, Eye, Edit, Trash2, MoreVertical, Download } from 'lucide-react';
import * as XLSX from 'xlsx';

const GazetteUploadPage = ({ userInfo, onNavigate, onLogout }) => {
  const [activeFilter, setActiveFilter] = useState('all');
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [gazettes, setGazettes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [showSortMenu, setShowSortMenu] = useState(false);
  const filterMenuRef = useRef(null);
  const sortMenuRef = useRef(null);
  
  // Filters state
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    date_from: '',
    date_to: ''
  });
  
  // Sorting state
  const [sortBy, setSortBy] = useState('publication_date');
  const [sortOrder, setSortOrder] = useState('desc');
  
  // Pagination state
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    total_pages: 0
  });
  
  // Stats state
  const [totalGazettes, setTotalGazettes] = useState(0);
  
  // Action menu state
  const [activeActionMenu, setActiveActionMenu] = useState(null);
  const [selectedGazette, setSelectedGazette] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [gazetteToDelete, setGazetteToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const actionMenuRefs = useRef({});
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const exportMenuRef = useRef(null);

  // Map backend status to frontend display
  const getStatusInfo = (status) => {
    switch (status) {
      case 'PUBLISHED':
        return { label: 'Published', color: 'blue', bg: 'bg-[#30AB931A]', text: 'text-blue-500' };
      case 'DRAFT':
        return { label: 'Draft', color: 'gray', bg: 'bg-[#D4E1EA66]', text: 'text-[#525866]' };
      case 'ARCHIVED':
        return { label: 'Archived', color: 'gray', bg: 'bg-[#D4E1EA66]', text: 'text-[#525866]' };
      case 'CANCELLED':
        return { label: 'Cancelled', color: 'red', bg: 'bg-[#F359261A]', text: 'text-red-500' };
      default:
        return { label: status || 'Unknown', color: 'gray', bg: 'bg-gray-100', text: 'text-gray-600' };
    }
  };

  // Map backend gazette type to display name
  const getGazetteTypeLabel = (type) => {
    const typeMap = {
      'CHANGE_OF_NAME': 'Change of name',
      'CHANGE_OF_DATE_OF_BIRTH': 'Date of birth correction',
      'CHANGE_OF_PLACE_OF_BIRTH': 'Place of birth correction',
      'APPOINTMENT_OF_MARRIAGE_OFFICERS': 'Marriage officer appointment',
      'LEGAL_NOTICE': 'Legal Notice',
      'BUSINESS_NOTICE': 'Business Notice',
      'PERSONAL_NOTICE': 'Personal Notice',
      'OTHER': 'Other'
    };
    return typeMap[type] || type;
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
    } catch (e) {
      return dateString;
    }
  };

  // Filter tabs mapping
  const filterTabs = [
    { id: 'all', label: 'All', gazette_type: null },
    { id: 'change-name', label: 'Change of name', gazette_type: 'CHANGE_OF_NAME' },
    { id: 'dob-correction', label: 'Date of birth correction', gazette_type: 'CHANGE_OF_DATE_OF_BIRTH' },
    { id: 'pob-correction', label: 'Place of birth correction', gazette_type: 'CHANGE_OF_PLACE_OF_BIRTH' },
    { id: 'marriage-officer', label: 'Marriage officer appointment', gazette_type: 'APPOINTMENT_OF_MARRIAGE_OFFICERS' }
  ];

  // Load gazettes from API
  useEffect(() => {
    loadGazettes();
  }, [pagination.page, activeFilter, searchTerm, filters, sortBy, sortOrder]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterMenuRef.current && !filterMenuRef.current.contains(event.target)) {
        setShowFilterMenu(false);
      }
      if (sortMenuRef.current && !sortMenuRef.current.contains(event.target)) {
        setShowSortMenu(false);
      }
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target)) {
        setShowExportMenu(false);
      }
      // Close action menus
      Object.keys(actionMenuRefs.current).forEach(id => {
        if (actionMenuRefs.current[id] && !actionMenuRefs.current[id].contains(event.target)) {
          setActiveActionMenu(null);
        }
      });
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Load full gazette details for view
  const handleView = async (gazette) => {
    try {
      const fullGazette = await apiGet(`/gazette/${gazette.id}`);
      setSelectedGazette(fullGazette);
      setShowViewModal(true);
      setActiveActionMenu(null);
    } catch (error) {
      console.error('Error loading gazette details:', error);
      alert('Failed to load gazette details');
    }
  };

  // Handle edit - redirect to upload form with edit mode
  const handleEdit = (gazette) => {
    setSelectedGazette(gazette);
    setShowUploadForm(true);
    setActiveActionMenu(null);
  };

  // Handle delete confirmation
  const handleDeleteClick = (gazette) => {
    if (!gazette || !gazette.id) {
      handleApiError({ message: 'Invalid gazette entry' }, 'delete gazette');
      return;
    }
    setGazetteToDelete(gazette);
    setShowDeleteConfirm(true);
    setActiveActionMenu(null);
  };

  // Confirm and execute delete
  const confirmDelete = async () => {
    if (!gazetteToDelete) {
      handleApiError({ message: 'No gazette selected for deletion' }, 'delete gazette');
      return;
    }
    
    try {
      setIsDeleting(true);
      await apiDelete(`/gazette/${gazetteToDelete.id}`);
      showSuccess('Gazette entry deleted successfully');
      setShowDeleteConfirm(false);
      setGazetteToDelete(null);
      // Refresh the list
      loadGazettes();
      // Refresh stats
      try {
        const response = await apiGet('/gazette/stats/overview');
        if (response) {
          setTotalGazettes(response.total_gazettes || 0);
        }
      } catch (statsError) {
        console.error('Error refreshing stats:', statsError);
        // Don't show error for stats refresh failure
      }
    } catch (error) {
      handleApiError(error, 'delete gazette');
    } finally {
      setIsDeleting(false);
    }
  };

  // Fetch all gazettes matching current filters for export
  const fetchAllGazettesForExport = async () => {
    const params = new URLSearchParams({
      page: '1',
      limit: '10000', // Large limit to get all records
      sort_by: sortBy,
      sort_order: sortOrder
    });

    // Add active filter (gazette type)
    const activeFilterTab = filterTabs.find(tab => tab.id === activeFilter);
    if (activeFilterTab && activeFilterTab.gazette_type) {
      params.append('gazette_type', activeFilterTab.gazette_type);
    }

    // Add search term
    if (searchTerm) {
      params.append('search', searchTerm);
    }

    // Add filters
    if (filters.status) params.append('status', filters.status);
    if (filters.priority) params.append('priority', filters.priority);
    if (filters.date_from) params.append('date_from', filters.date_from);
    if (filters.date_to) params.append('date_to', filters.date_to);

    const response = await apiGet(`/gazette?${params.toString()}`);
    return response.gazettes || [];
  };

  // Prepare data for export
  const prepareExportData = (gazettesList) => {
    return gazettesList.map(gazette => ({
      'ID': gazette.id,
      'Date of Gazette': formatDate(gazette.publication_date),
      'Notice Type': getGazetteTypeLabel(gazette.gazette_type),
      'Title': gazette.title || '',
      'Gazette Number': gazette.gazette_number || '',
      'Reference Number': gazette.reference_number || '',
      'Status': getStatusInfo(gazette.status).label,
      'Priority': gazette.priority || '',
      'New Name': gazette.new_name || '',
      'Old Name': gazette.old_name || '',
      'Alias Names': Array.isArray(gazette.alias_names) ? gazette.alias_names.join('; ') : '',
      'Old Date of Birth': gazette.old_date_of_birth ? formatDate(gazette.old_date_of_birth) : '',
      'New Date of Birth': gazette.new_date_of_birth ? formatDate(gazette.new_date_of_birth) : '',
      'Old Place of Birth': gazette.old_place_of_birth || '',
      'New Place of Birth': gazette.new_place_of_birth || '',
      'Profession': gazette.profession || '',
      'Effective Date': gazette.effective_date ? formatDate(gazette.effective_date) : '',
      'Effective Date of Change': gazette.effective_date_of_change ? formatDate(gazette.effective_date_of_change) : '',
      'Description': gazette.description || '',
      'Content': gazette.content ? gazette.content.substring(0, 200) : '',
      'Summary': gazette.summary || '',
      'Remarks': gazette.remarks || '',
      'Source': gazette.source || '',
      'Jurisdiction': gazette.jurisdiction || '',
      'Court Location': gazette.court_location || '',
      'Created At': formatDate(gazette.created_at),
      'Updated At': gazette.updated_at ? formatDate(gazette.updated_at) : '',
      'Person ID': gazette.person_id || ''
    }));
  };

  // Export to CSV
  const exportToCSV = async () => {
    try {
      setIsExporting(true);
      setShowExportMenu(false);
      
      const allGazettes = await fetchAllGazettesForExport();
      
      if (allGazettes.length === 0) {
        alert('No data to export');
        return;
      }

      const exportData = prepareExportData(allGazettes);
      
      // Get headers
      const headers = Object.keys(exportData[0]);
      
      // Create CSV content
      let csvContent = headers.join(',') + '\n';
      
      exportData.forEach(row => {
        const values = headers.map(header => {
          const value = row[header] || '';
          // Escape commas and quotes in values
          if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value;
        });
        csvContent += values.join(',') + '\n';
      });
      
      // Create blob and download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      
      // Generate filename with current date
      const dateStr = new Date().toISOString().split('T')[0];
      const filterStr = activeFilter !== 'all' ? `_${activeFilter}` : '';
      link.setAttribute('download', `gazettes_export${filterStr}_${dateStr}.csv`);
      
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
    } catch (error) {
      console.error('Error exporting to CSV:', error);
      alert('Failed to export to CSV. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  // Export to Excel
  const exportToExcel = async () => {
    try {
      setIsExporting(true);
      setShowExportMenu(false);
      
      const allGazettes = await fetchAllGazettesForExport();
      
      if (allGazettes.length === 0) {
        alert('No data to export');
        return;
      }

      const exportData = prepareExportData(allGazettes);
      
      // Create workbook and worksheet
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(exportData);
      
      // Set column widths
      const columnWidths = [
        { wch: 8 },  // ID
        { wch: 12 }, // Date of Gazette
        { wch: 25 }, // Notice Type
        { wch: 30 }, // Title
        { wch: 15 }, // Gazette Number
        { wch: 15 }, // Reference Number
        { wch: 12 }, // Status
        { wch: 10 }, // Priority
        { wch: 25 }, // New Name
        { wch: 25 }, // Old Name
        { wch: 30 }, // Alias Names
        { wch: 15 }, // Old Date of Birth
        { wch: 15 }, // New Date of Birth
        { wch: 20 }, // Old Place of Birth
        { wch: 20 }, // New Place of Birth
        { wch: 20 }, // Profession
        { wch: 15 }, // Effective Date
        { wch: 20 }, // Effective Date of Change
        { wch: 30 }, // Description
        { wch: 50 }, // Content
        { wch: 50 }, // Summary
        { wch: 30 }, // Remarks
        { wch: 20 }, // Source
        { wch: 15 }, // Jurisdiction
        { wch: 20 }, // Court Location
        { wch: 15 }, // Created At
        { wch: 15 }, // Updated At
        { wch: 10 }  // Person ID
      ];
      ws['!cols'] = columnWidths;
      
      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(wb, ws, 'Gazettes');
      
      // Generate filename with current date
      const dateStr = new Date().toISOString().split('T')[0];
      const filterStr = activeFilter !== 'all' ? `_${activeFilter}` : '';
      const filename = `gazettes_export${filterStr}_${dateStr}.xlsx`;
      
      // Write and download
      XLSX.writeFile(wb, filename);
      
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      alert('Failed to export to Excel. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const loadGazettes = async () => {
    try {
      setLoading(true);
      
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        sort_by: sortBy,
        sort_order: sortOrder
      });

      // Add active filter (gazette type)
      const activeFilterTab = filterTabs.find(tab => tab.id === activeFilter);
      if (activeFilterTab && activeFilterTab.gazette_type) {
        params.append('gazette_type', activeFilterTab.gazette_type);
      }

      // Add search term
      if (searchTerm) {
        params.append('search', searchTerm);
      }

      // Add filters
      if (filters.status) params.append('status', filters.status);
      if (filters.priority) params.append('priority', filters.priority);
      if (filters.date_from) params.append('date_from', filters.date_from);
      if (filters.date_to) params.append('date_to', filters.date_to);

      const response = await apiGet(`/gazette?${params.toString()}`);
      setGazettes(response.gazettes || []);
      setPagination(prev => ({
        ...prev,
        total: response.total || 0,
        total_pages: response.total_pages || 0
      }));
      
      // Update total count for stats
      if (activeFilter === 'all' && !searchTerm && !filters.status && !filters.priority && !filters.date_from && !filters.date_to) {
        setTotalGazettes(response.total || 0);
      }
    } catch (error) {
      console.error('Error loading gazettes:', error);
      setGazettes([]);
    } finally {
      setLoading(false);
    }
  };

  // Load total stats
  useEffect(() => {
    const loadStats = async () => {
      try {
        const response = await apiGet('/gazette/stats/overview');
        if (response) {
          setTotalGazettes(response.total_gazettes || 0);
        }
      } catch (error) {
        console.error('Error loading stats:', error);
      }
    };
    loadStats();
  }, []);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
    setShowFilterMenu(false);
  };

  const handleSortChange = (sortField, order) => {
    setSortBy(sortField);
    setSortOrder(order);
    setPagination(prev => ({ ...prev, page: 1 }));
    setShowSortMenu(false);
  };

  const clearFilters = () => {
    setFilters({
      status: '',
      priority: '',
      date_from: '',
      date_to: ''
    });
    setSearchTerm('');
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.total_pages) {
      setPagination(prev => ({ ...prev, page: newPage }));
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPagination(prev => ({ ...prev, page: 1 }));
    loadGazettes();
  };

  // Show upload form if requested (for new or edit)
  if (showUploadForm) {
    return (
      <UploadGazetteForm 
        onBack={() => {
          setShowUploadForm(false);
          setSelectedGazette(null);
          loadGazettes(); // Refresh list when returning
        }} 
        userInfo={userInfo} 
        onNavigate={onNavigate} 
        onLogout={onLogout}
        editMode={!!selectedGazette}
        initialGazette={selectedGazette}
      />
    );
  }

  return (
    <div className="bg-[#F7F8FA] min-h-screen w-full">
      {/* Header */}
      <AdminHeader userInfo={userInfo} onNavigate={onNavigate} onLogout={onLogout} />

      {/* Main Content */}
      <div className="px-6 w-full">
        <div className="flex flex-col items-start w-full bg-white py-[13px] gap-6 rounded-lg">
          {/* Breadcrumb */}
          <span className="text-[#525866] text-xs whitespace-nowrap px-6">GAZETTE</span>

          {/* Title */}
          <div className="flex flex-col items-start px-6 gap-2">
            <div className="flex items-center gap-1">
              <img
                src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Iq8V0MifpP/fv7hkc9g_expires_30_days.png"
                className="w-4 h-4 object-fill flex-shrink-0"
              />
              <img
                src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Iq8V0MifpP/ab40f5uh_expires_30_days.png"
                className="w-4 h-4 object-fill flex-shrink-0"
              />
              <span className="text-[#040E1B] text-xl font-bold whitespace-nowrap">Gazettes</span>
            </div>
            <span className="text-[#070810] text-sm whitespace-nowrap">Search through all the gazettes in our database</span>
          </div>

          {/* Stats and Action Buttons */}
          <div className="flex justify-between items-start w-full px-6">
            <div className="flex items-center bg-white w-[271px] p-2 gap-3 rounded-lg border border-solid border-[#D4E1EA]">
              <img
                src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Iq8V0MifpP/l3t3mzhj_expires_30_days.png"
                className="w-10 h-10 rounded-lg object-fill flex-shrink-0"
              />
              <div className="flex flex-col items-start gap-1">
                <span className="text-[#868C98] text-xs whitespace-nowrap">Total amount of Gazettes</span>
                <span className="text-[#F59E0B] text-base whitespace-nowrap">{totalGazettes.toLocaleString()}</span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <button
                className="flex flex-col items-center py-[18px] px-[61px] rounded-lg border-2 border-solid border-[#022658] hover:bg-gray-50 transition-colors"
                style={{ boxShadow: '0px 4px 4px #050F1C1A' }}
              >
                <span className="text-[#022658] text-base font-bold whitespace-nowrap" style={{ fontFamily: 'Satoshi' }}>Download Template</span>
              </button>
              <button
                onClick={() => setShowUploadForm(true)}
                className="flex flex-col items-center py-[18px] px-[62px] rounded-lg border-4 border-solid border-[#0F284726] hover:opacity-90 transition-opacity"
                style={{ background: 'linear-gradient(180deg, #022658, #1A4983)' }}
              >
                <span className="text-white text-base font-bold whitespace-nowrap" style={{ fontFamily: 'Satoshi' }}>Upload New Gazette</span>
              </button>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex flex-col items-start w-full px-6">
            <div className="flex items-start p-1 gap-4">
              {filterTabs.map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => {
                    setActiveFilter(filter.id);
                    setPagination(prev => ({ ...prev, page: 1 }));
                  }}
                  className={`flex flex-col items-start pb-2 ${
                    activeFilter === filter.id ? 'border-b-2 border-[#022658]' : ''
                  }`}
                >
                  <span
                    className={`text-base whitespace-nowrap ${
                      activeFilter === filter.id ? 'text-[#022658] font-bold' : 'text-[#525866]'
                    }`}
                  >
                    {filter.label}
                  </span>
                </button>
              ))}
            </div>

            {/* Table and Pagination */}
            <div className="flex flex-col items-start w-full gap-4 px-6">
              <div className="flex flex-col w-full bg-white py-4 gap-4 rounded-3xl">
                {/* Search, Filter and Export */}
                <div className="flex justify-between items-start w-full px-4">
                  <form onSubmit={handleSearch} className="flex-1 pb-0.5 mr-4">
                    <div className="flex items-center self-stretch bg-[#F7F8FA] py-[7px] px-2 gap-1.5 rounded-[5px] border border-solid border-[#F7F8FA]">
                      <Search className="w-[11px] h-[11px] text-[#868C98]" />
                      <input
                        type="text"
                        placeholder="Search here"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="flex-1 text-[#868C98] bg-transparent text-[10px] border-0 outline-none"
                      />
                    </div>
                  </form>
                  <div className="flex items-start gap-[7px] mr-4 relative">
                    <div 
                      ref={filterMenuRef}
                      className="relative"
                    >
                      <button
                        onClick={() => setShowFilterMenu(!showFilterMenu)}
                        className="flex items-center py-[7px] px-[9px] gap-1.5 rounded border border-solid border-[#D4E1EA] cursor-pointer hover:bg-gray-50"
                      >
                        <Filter className="w-[11px] h-[11px] text-[#525866]" />
                        <span className="text-[#525866] text-xs whitespace-nowrap">Filter</span>
                        {(filters.status || filters.priority || filters.date_from || filters.date_to) && (
                          <span className="ml-1 w-2 h-2 bg-red-500 rounded-full"></span>
                        )}
                      </button>
                      {showFilterMenu && (
                        <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-10 p-4">
                          <div className="flex justify-between items-center mb-3">
                            <span className="text-sm font-semibold">Filters</span>
                            {(filters.status || filters.priority || filters.date_from || filters.date_to) && (
                              <button
                                onClick={clearFilters}
                                className="text-xs text-red-500 hover:underline"
                              >
                                Clear All
                              </button>
                            )}
                          </div>
                          <div className="space-y-3">
                            <div>
                              <label className="block text-xs text-gray-600 mb-1">Status</label>
                              <select
                                value={filters.status}
                                onChange={(e) => handleFilterChange('status', e.target.value)}
                                className="w-full text-xs px-2 py-1 border border-gray-300 rounded"
                              >
                                <option value="">All Statuses</option>
                                <option value="DRAFT">Draft</option>
                                <option value="PUBLISHED">Published</option>
                                <option value="ARCHIVED">Archived</option>
                                <option value="CANCELLED">Cancelled</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-xs text-gray-600 mb-1">Priority</label>
                              <select
                                value={filters.priority}
                                onChange={(e) => handleFilterChange('priority', e.target.value)}
                                className="w-full text-xs px-2 py-1 border border-gray-300 rounded"
                              >
                                <option value="">All Priorities</option>
                                <option value="LOW">Low</option>
                                <option value="MEDIUM">Medium</option>
                                <option value="HIGH">High</option>
                                <option value="URGENT">Urgent</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-xs text-gray-600 mb-1">Date From</label>
                              <input
                                type="date"
                                value={filters.date_from}
                                onChange={(e) => handleFilterChange('date_from', e.target.value)}
                                className="w-full text-xs px-2 py-1 border border-gray-300 rounded"
                              />
                  </div>
                            <div>
                              <label className="block text-xs text-gray-600 mb-1">Date To</label>
                              <input
                                type="date"
                                value={filters.date_to}
                                onChange={(e) => handleFilterChange('date_to', e.target.value)}
                                className="w-full text-xs px-2 py-1 border border-gray-300 rounded"
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    <div 
                      ref={sortMenuRef}
                      className="relative"
                    >
                      <button
                        onClick={() => setShowSortMenu(!showSortMenu)}
                        className="flex items-center py-[7px] px-[9px] gap-[5px] rounded border border-solid border-[#D4E1EA] cursor-pointer hover:bg-gray-50"
                      >
                        <ChevronDown className="w-[11px] h-[11px] text-[#525866]" />
                      <span className="text-[#525866] text-xs whitespace-nowrap">Sort</span>
                      </button>
                      {showSortMenu && (
                        <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-10 p-3">
                          <div className="space-y-2">
                            <button
                              onClick={() => handleSortChange('publication_date', 'desc')}
                              className={`w-full text-left text-xs px-2 py-1 rounded hover:bg-gray-100 ${
                                sortBy === 'publication_date' && sortOrder === 'desc' ? 'bg-blue-50 text-blue-600' : ''
                              }`}
                            >
                              Date (Newest First)
                            </button>
                            <button
                              onClick={() => handleSortChange('publication_date', 'asc')}
                              className={`w-full text-left text-xs px-2 py-1 rounded hover:bg-gray-100 ${
                                sortBy === 'publication_date' && sortOrder === 'asc' ? 'bg-blue-50 text-blue-600' : ''
                              }`}
                            >
                              Date (Oldest First)
                            </button>
                            <button
                              onClick={() => handleSortChange('title', 'asc')}
                              className={`w-full text-left text-xs px-2 py-1 rounded hover:bg-gray-100 ${
                                sortBy === 'title' && sortOrder === 'asc' ? 'bg-blue-50 text-blue-600' : ''
                              }`}
                            >
                              Title (A-Z)
                            </button>
                            <button
                              onClick={() => handleSortChange('title', 'desc')}
                              className={`w-full text-left text-xs px-2 py-1 rounded hover:bg-gray-100 ${
                                sortBy === 'title' && sortOrder === 'desc' ? 'bg-blue-50 text-blue-600' : ''
                              }`}
                            >
                              Title (Z-A)
                            </button>
                            <button
                              onClick={() => handleSortChange('priority', 'desc')}
                              className={`w-full text-left text-xs px-2 py-1 rounded hover:bg-gray-100 ${
                                sortBy === 'priority' && sortOrder === 'desc' ? 'bg-blue-50 text-blue-600' : ''
                              }`}
                            >
                              Priority (High to Low)
                            </button>
                            <button
                              onClick={() => handleSortChange('priority', 'asc')}
                              className={`w-full text-left text-xs px-2 py-1 rounded hover:bg-gray-100 ${
                                sortBy === 'priority' && sortOrder === 'asc' ? 'bg-blue-50 text-blue-600' : ''
                              }`}
                            >
                              Priority (Low to High)
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <div ref={exportMenuRef} className="relative">
                    <button 
                      onClick={() => setShowExportMenu(!showExportMenu)}
                      disabled={isExporting}
                      className="flex items-center bg-transparent text-left py-1 px-4 gap-[7px] rounded-lg border border-solid border-[#F59E0B] hover:bg-orange-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="text-[#F59E0B] text-base whitespace-nowrap" style={{ fontFamily: 'Satoshi' }}>
                        {isExporting ? 'Exporting...' : 'Export List'}
                      </span>
                      <Download className="w-4 h-4 text-[#F59E0B]" />
                    </button>
                    {showExportMenu && (
                      <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                        <button
                          onClick={exportToCSV}
                          disabled={isExporting}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 disabled:opacity-50"
                        >
                          <Download className="w-4 h-4" />
                          Export to CSV
                        </button>
                        <button
                          onClick={exportToExcel}
                          disabled={isExporting}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 disabled:opacity-50"
                        >
                          <Download className="w-4 h-4" />
                          Export to Excel
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Gazette Table */}
                <div className="flex flex-col w-full gap-1 rounded-[14px] border border-solid border-[#E5E8EC] overflow-hidden">
                  {/* Table Header */}
                  <div className="flex items-start w-full bg-[#F4F6F9] py-4 px-4 gap-3">
                    <div className="flex flex-col items-start w-[15%] py-[7px]">
                      <span className="text-[#070810] text-sm font-bold whitespace-nowrap">Date of Gazette</span>
                    </div>
                    <div className="flex flex-col items-start w-[20%] py-[7px]">
                      <span className="text-[#070810] text-sm font-bold whitespace-nowrap">Notice Type</span>
                    </div>
                    <div className="flex flex-col items-start w-[15%] py-[7px]">
                      <span className="text-[#070810] text-sm font-bold whitespace-nowrap">Gazette No.</span>
                    </div>
                    <div className="flex flex-col items-start w-[15%] py-[7px]">
                      <span className="text-[#070810] text-sm font-bold whitespace-nowrap">Uploaded By</span>
                    </div>
                    <div className="flex flex-col items-start w-[15%] py-[7px]">
                      <span className="text-[#070810] text-sm font-bold whitespace-nowrap">Upload date</span>
                    </div>
                    <div className="flex flex-col items-start w-[15%] py-[7px]">
                      <span className="text-[#070810] text-sm font-bold whitespace-nowrap">Status</span>
                    </div>
                    <div className="w-[5%] flex-shrink-0 py-[7px] flex justify-center">
                      <span className="text-[#040E1B] text-sm font-bold whitespace-nowrap">Actions</span>
                    </div>
                  </div>

                  {/* Table Rows */}
                  {loading ? (
                    <div className="flex items-center justify-center w-full py-8">
                      <span className="text-gray-500">Loading gazettes...</span>
                    </div>
                  ) : gazettes.length === 0 ? (
                    <div className="flex items-center justify-center w-full py-8">
                      <span className="text-gray-500">No gazettes found</span>
                    </div>
                  ) : (
                    gazettes.map((gazette) => {
                      const statusInfo = getStatusInfo(gazette.status);
                      const creatorName = gazette.creator ? `${gazette.creator.first_name || ''} ${gazette.creator.last_name || ''}`.trim() : 'System';
                    return (
                        <div key={gazette.id} className="flex items-center w-full py-3 px-4 gap-3 hover:bg-gray-50 transition-colors">
                        <div className="flex flex-col items-start w-[15%] py-[7px]">
                            <span className="text-[#070810] text-sm whitespace-nowrap overflow-hidden text-ellipsis w-full">
                              {formatDate(gazette.publication_date || gazette.gazette_date)}
                            </span>
                        </div>
                        <div className="flex flex-col items-start w-[20%] py-[7px]">
                            <span className="text-[#070810] text-sm whitespace-nowrap overflow-hidden text-ellipsis w-full">
                              {getGazetteTypeLabel(gazette.gazette_type)}
                            </span>
                        </div>
                        <div className="flex flex-col items-start w-[15%] py-[7px]">
                            <span className="text-[#070810] text-sm whitespace-nowrap overflow-hidden text-ellipsis w-full">
                              {gazette.gazette_number || gazette.reference_number || 'N/A'}
                            </span>
                        </div>
                        <div className="flex flex-col items-start w-[15%] py-[7px]">
                            <span className="text-[#070810] text-sm whitespace-nowrap overflow-hidden text-ellipsis w-full">
                              {creatorName}
                            </span>
                        </div>
                        <div className="flex flex-col items-start w-[15%] py-[7px]">
                            <span className="text-[#070810] text-sm whitespace-nowrap overflow-hidden text-ellipsis w-full">
                              {formatDate(gazette.created_at)}
                            </span>
                        </div>
                        <div className="flex flex-col w-[15%] py-2 px-4">
                            <button className={`flex flex-col items-center self-stretch ${statusInfo.bg} text-left py-[3px] rounded-lg border-0`}>
                              <span className={`${statusInfo.text} text-xs whitespace-nowrap`}>{statusInfo.label}</span>
                            </button>
                          </div>
                        <div className="w-[5%] flex-shrink-0 flex items-center justify-center py-[7px] relative">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveActionMenu(activeActionMenu === gazette.id ? null : gazette.id);
                            }}
                            className="p-1 hover:bg-gray-100 rounded"
                          >
                            <MoreVertical className="w-4 h-4 text-gray-600" />
                          </button>
                          {activeActionMenu === gazette.id && (
                            <div
                              ref={el => actionMenuRefs.current[gazette.id] = el}
                              className="absolute right-0 top-full mt-1 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-20"
                            >
                              <button
                                onClick={() => handleView(gazette)}
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                              >
                                <Eye className="w-4 h-4" />
                                View
                              </button>
                              <button
                                onClick={() => handleEdit(gazette)}
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                              >
                                <Edit className="w-4 h-4" />
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteClick(gazette)}
                                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                              >
                                <Trash2 className="w-4 h-4" />
                                Delete
                          </button>
                        </div>
                          )}
                        </div>
                      </div>
                    );
                    })
                  )}
                </div>
              </div>

              {/* Pagination */}
              {pagination.total_pages > 0 && (
              <div className="flex items-center justify-start w-full">
                  <span className="text-[#525866] text-sm mr-[42px] whitespace-nowrap">
                    {((pagination.page - 1) * pagination.limit + 1)}-{Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total.toLocaleString()}
                  </span>
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1}
                    className="flex items-start bg-white text-left w-[70px] py-2 px-3 mr-1.5 gap-1 rounded border border-solid border-[#D4E1EA] hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                  <img
                    src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Iq8V0MifpP/tnkiy92u_expires_30_days.png"
                    className="w-4 h-4 rounded object-fill"
                  />
                  <span className="text-[#525866] text-xs whitespace-nowrap">Back</span>
                </button>
                  
                  {/* Page Numbers */}
                  {(() => {
                    const pages = [];
                    const totalPages = pagination.total_pages;
                    const currentPage = pagination.page;
                    
                    // Show first page
                    if (currentPage > 3) {
                      pages.push(
                        <button
                          key={1}
                          onClick={() => handlePageChange(1)}
                          className="flex flex-col items-start bg-white w-[29px] py-[7px] px-3 mr-1.5 rounded border border-solid border-[#D4E1EA] hover:bg-gray-50"
                        >
                  <span className="text-[#525866] text-xs whitespace-nowrap">1</span>
                        </button>
                      );
                      if (currentPage > 4) {
                        pages.push(
                <img
                            key="ellipsis1"
                  src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Iq8V0MifpP/ypkm4zjn_expires_30_days.png"
                  className="w-[31px] h-[31px] mr-1.5 object-fill"
                />
                        );
                      }
                    }
                    
                    // Show pages around current
                    for (let i = Math.max(1, currentPage - 2); i <= Math.min(totalPages, currentPage + 2); i++) {
                      pages.push(
                        <button
                          key={i}
                          onClick={() => handlePageChange(i)}
                          className={`flex flex-col items-start w-[31px] py-[7px] px-2 mr-1.5 rounded ${
                            i === currentPage
                              ? 'bg-[#022658]'
                              : 'bg-white border border-solid border-[#D4E1EA] hover:bg-gray-50'
                          }`}
                        >
                          <span className={`text-xs whitespace-nowrap ${i === currentPage ? 'text-white font-bold' : 'text-[#525866]'}`}>
                            {i}
                          </span>
                        </button>
                      );
                    }
                    
                    // Show last page
                    if (currentPage < totalPages - 2) {
                      if (currentPage < totalPages - 3) {
                        pages.push(
                          <img
                            key="ellipsis2"
                  src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Iq8V0MifpP/odb64hum_expires_30_days.png"
                  className="w-[31px] h-[31px] mr-1.5 object-fill"
                />
                        );
                      }
                      pages.push(
                        <button
                          key={totalPages}
                          onClick={() => handlePageChange(totalPages)}
                          className="flex flex-col items-start bg-white w-[34px] py-[7px] px-2 mr-1.5 rounded border border-solid border-[#D4E1EA] hover:bg-gray-50"
                        >
                          <span className="text-[#525866] text-xs whitespace-nowrap">{totalPages}</span>
                        </button>
                      );
                    }
                    
                    return pages;
                  })()}
                  
                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page >= pagination.total_pages}
                    className="flex items-start bg-white text-left w-[68px] py-2 px-3 mr-10 gap-1.5 rounded border border-solid border-[#D4E1EA] hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                  <span className="text-[#525866] text-xs whitespace-nowrap">Next</span>
                  <img
                    src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Iq8V0MifpP/7u7m1yxn_expires_30_days.png"
                    className="w-4 h-4 rounded object-fill"
                  />
                </button>
                <div className="flex items-center w-[119px]">
                  <span className="text-[#040E1B] text-sm mr-[11px] whitespace-nowrap">Page</span>
                    <input
                      type="number"
                      min="1"
                      max={pagination.total_pages}
                      value={pagination.page}
                      onChange={(e) => {
                        const page = parseInt(e.target.value);
                        if (page >= 1 && page <= pagination.total_pages) {
                          handlePageChange(page);
                        }
                      }}
                      className="flex flex-col items-start bg-white w-[51px] py-[5px] pl-2 mr-2 rounded border border-solid border-[#F59E0B] text-sm outline-none"
                    />
                    <button
                      onClick={() => handlePageChange(pagination.page)}
                      className="text-[#F59E0B] text-sm font-bold cursor-pointer hover:underline whitespace-nowrap"
                    >
                      Go
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* View Modal */}
      {showViewModal && selectedGazette && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowViewModal(false)}></div>
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-900">Gazette Details</h2>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="p-6 space-y-6">
                {/* Person Information */}
                {selectedGazette.person && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Person Information</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-500">Name</label>
                        <p className="text-sm text-gray-900 mt-1">{selectedGazette.person.full_name || selectedGazette.person.name}</p>
                      </div>
                      {selectedGazette.person.id_number && (
                        <div>
                          <label className="text-sm font-medium text-gray-500">ID Number</label>
                          <p className="text-sm text-gray-900 mt-1">{selectedGazette.person.id_number}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Basic Information */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <label className="text-sm font-medium text-gray-500">Title</label>
                      <p className="text-sm text-gray-900 mt-1">{selectedGazette.title}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Type</label>
                      <p className="text-sm text-gray-900 mt-1">{getGazetteTypeLabel(selectedGazette.gazette_type)}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Status</label>
                      <div className="mt-1">
                        {(() => {
                          const statusInfo = getStatusInfo(selectedGazette.status);
                          return (
                            <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${statusInfo.bg} ${statusInfo.text}`}>
                              {statusInfo.label}
                            </span>
                          );
                        })()}
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Priority</label>
                      <p className="text-sm text-gray-900 mt-1">{selectedGazette.priority}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Publication Date</label>
                      <p className="text-sm text-gray-900 mt-1">{formatDate(selectedGazette.publication_date)}</p>
                    </div>
                    {selectedGazette.effective_date && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">Effective Date</label>
                        <p className="text-sm text-gray-900 mt-1">{formatDate(selectedGazette.effective_date)}</p>
                      </div>
                    )}
                    {selectedGazette.gazette_number && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">Gazette Number</label>
                        <p className="text-sm text-gray-900 mt-1">{selectedGazette.gazette_number}</p>
                      </div>
                    )}
                    {selectedGazette.reference_number && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">Reference Number</label>
                        <p className="text-sm text-gray-900 mt-1">{selectedGazette.reference_number}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Description */}
                {selectedGazette.description && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
                    <p className="text-sm text-gray-700">{selectedGazette.description}</p>
                  </div>
                )}

                {/* Content */}
                {selectedGazette.content && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Content</h3>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{selectedGazette.content}</p>
                  </div>
                )}

                {/* Summary */}
                {selectedGazette.summary && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Summary</h3>
                    <p className="text-sm text-gray-700">{selectedGazette.summary}</p>
                  </div>
                )}

                {/* Gazette-specific fields */}
                {(selectedGazette.new_name || selectedGazette.old_name || selectedGazette.alias_names) && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Name Information</h3>
                    <div className="grid grid-cols-2 gap-4">
                      {selectedGazette.old_name && (
                        <div>
                          <label className="text-sm font-medium text-gray-500">Old Name</label>
                          <p className="text-sm text-gray-900 mt-1">{selectedGazette.old_name}</p>
                        </div>
                      )}
                      {selectedGazette.new_name && (
                        <div>
                          <label className="text-sm font-medium text-gray-500">New Name</label>
                          <p className="text-sm text-gray-900 mt-1">{selectedGazette.new_name}</p>
                        </div>
                      )}
                      {selectedGazette.alias_names && selectedGazette.alias_names.length > 0 && (
                        <div className="col-span-2">
                          <label className="text-sm font-medium text-gray-500">Alias Names</label>
                          <p className="text-sm text-gray-900 mt-1">{selectedGazette.alias_names.join(', ')}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Additional Details */}
                {(selectedGazette.profession || selectedGazette.jurisdiction || selectedGazette.source) && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Details</h3>
                    <div className="grid grid-cols-2 gap-4">
                      {selectedGazette.profession && (
                        <div>
                          <label className="text-sm font-medium text-gray-500">Profession</label>
                          <p className="text-sm text-gray-900 mt-1">{selectedGazette.profession}</p>
                        </div>
                      )}
                      {selectedGazette.jurisdiction && (
                        <div>
                          <label className="text-sm font-medium text-gray-500">Jurisdiction</label>
                          <p className="text-sm text-gray-900 mt-1">{selectedGazette.jurisdiction}</p>
                        </div>
                      )}
                      {selectedGazette.source && (
                        <div>
                          <label className="text-sm font-medium text-gray-500">Source</label>
                          <p className="text-sm text-gray-900 mt-1">{selectedGazette.source}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Remarks */}
                {selectedGazette.remarks && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Remarks</h3>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{selectedGazette.remarks}</p>
                  </div>
                )}

                {/* System Information */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">System Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Created At</label>
                      <p className="text-sm text-gray-900 mt-1">{formatDate(selectedGazette.created_at)}</p>
                    </div>
                    {selectedGazette.updated_at && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">Updated At</label>
                        <p className="text-sm text-gray-900 mt-1">{formatDate(selectedGazette.updated_at)}</p>
                      </div>
                    )}
                    {selectedGazette.creator && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">Created By</label>
                        <p className="text-sm text-gray-900 mt-1">
                          {selectedGazette.creator.first_name} {selectedGazette.creator.last_name}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
                <button
                  onClick={() => setShowViewModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setShowViewModal(false);
                    handleEdit(selectedGazette);
                  }}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                >
                  Edit
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && gazetteToDelete && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowDeleteConfirm(false)}></div>
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full">
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                    <Trash2 className="w-6 h-6 text-red-600" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-gray-900">Delete Gazette Entry</h3>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  Are you sure you want to delete this gazette entry? This action cannot be undone.
                </p>
                {gazetteToDelete.title && (
                  <div className="bg-gray-50 p-3 rounded mb-4">
                    <p className="text-sm font-medium text-gray-900">{gazetteToDelete.title}</p>
                    <p className="text-xs text-gray-500 mt-1">{getGazetteTypeLabel(gazetteToDelete.gazette_type)}</p>
                  </div>
                )}
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => {
                      setShowDeleteConfirm(false);
                      setGazetteToDelete(null);
                    }}
                    disabled={isDeleting}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmDelete}
                    disabled={isDeleting}
                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50"
                  >
                    {isDeleting ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GazetteUploadPage;

