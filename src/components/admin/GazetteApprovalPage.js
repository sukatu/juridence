import React, { useState, useEffect, useRef } from 'react';
import AdminHeader from './AdminHeader';
import { apiGet, apiPut, apiDelete } from '../../utils/api';
import { showSuccess, handleApiError, confirmAction } from '../../utils/errorHandler';
import { Search, Filter, ChevronDown, X, Eye, Edit, CheckCircle, XCircle, AlertCircle, MoreVertical, Download, User, Link2 } from 'lucide-react';
import * as XLSX from 'xlsx';

const GazetteApprovalPage = ({ userInfo, onNavigate, onLogout }) => {
  const [activeFilter, setActiveFilter] = useState('all');
  const [gazettes, setGazettes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [showActionMenu, setShowActionMenu] = useState(null);
  const [selectedGazette, setSelectedGazette] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [personSearchQuery, setPersonSearchQuery] = useState('');
  const [personSearchResults, setPersonSearchResults] = useState([]);
  const [isSearchingPerson, setIsSearchingPerson] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [stats, setStats] = useState({ total: 0, ready: 0, reviewNeeded: 0, createNew: 0, manualReview: 0 });
  
  const filterMenuRef = useRef(null);
  const sortMenuRef = useRef(null);
  const actionMenuRefs = useRef({});
  const [sortBy, setSortBy] = useState('publication_date');
  const [sortOrder, setSortOrder] = useState('desc');

  // Map backend status to approval status
  const getApprovalStatus = (gazette) => {
    // Check if person is linked
    if (!gazette.person_id) {
      return { status: 'Create new', color: 'red' };
    }
    
    // Check if person name matches gazette name
    const gazetteName = gazette.new_name || gazette.old_name || '';
    const personName = gazette.person?.full_name || '';
    
    if (personName && gazetteName) {
      // Simple name matching (can be enhanced)
      const normalizedGazette = gazetteName.toLowerCase().trim();
      const normalizedPerson = personName.toLowerCase().trim();
      
      if (normalizedGazette === normalizedPerson || normalizedPerson.includes(normalizedGazette) || normalizedGazette.includes(normalizedPerson)) {
        return { status: 'Ready', color: 'green' };
      } else {
        return { status: 'Review needed', color: 'blue' };
      }
    }
    
    // If data is incomplete or uncertain
    if (!gazette.new_name && !gazette.old_name) {
      return { status: 'Manual review', color: 'orange' };
    }
    
    return { status: 'Review needed', color: 'blue' };
  };

  const getStatusClasses = (color) => {
    switch (color) {
      case 'green':
        return 'text-emerald-500';
      case 'blue':
        return 'text-blue-500';
      case 'red':
        return 'text-red-500';
      case 'orange':
        return 'text-orange-500';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusBgClasses = (color) => {
    switch (color) {
      case 'green':
        return 'bg-emerald-50 text-emerald-700';
      case 'blue':
        return 'bg-blue-50 text-blue-700';
      case 'red':
        return 'bg-red-50 text-red-700';
      case 'orange':
        return 'bg-orange-50 text-orange-700';
      default:
        return 'bg-gray-50 text-gray-700';
    }
  };

  const filters = [
    { id: 'all', label: 'All', width: 'w-[19px]' },
    { id: 'ready', label: 'Ready', width: 'w-11' },
    { id: 'review-needed', label: 'Review needed', width: 'w-[107px]' },
    { id: 'create-new', label: 'Create new', width: 'w-[81px]' },
    { id: 'manual-review', label: 'Manual review', width: 'w-[101px]' }
  ];

  // Map notice types
  const getNoticeTypeLabel = (type) => {
    const typeMap = {
      'CHANGE_OF_NAME': 'Change of name',
      'CHANGE_OF_DATE_OF_BIRTH': 'Date of birth correction',
      'CHANGE_OF_PLACE_OF_BIRTH': 'Place of birth correction',
      'APPOINTMENT_OF_MARRIAGE_OFFICERS': 'Marriage officer appointment',
      'LEGAL_NOTICE': 'Company name change',
      'PERSONAL_NOTICE': 'Address change',
      'OTHER': 'Other'
    };
    return typeMap[type] || type;
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
    } catch (e) {
      return dateString;
    }
  };

  // Load gazettes for approval (DRAFT status)
  const loadGazettes = async () => {
    try {
      setLoading(true);
      
      const params = new URLSearchParams({
        page: '1',
        limit: '1000', // Get all for approval
        status: 'DRAFT',
        sort_by: sortBy,
        sort_order: sortOrder
      });

      if (searchTerm) {
        params.append('search', searchTerm);
      }

      const response = await apiGet(`/gazette?${params.toString()}`);
      const allGazettes = response.gazettes || [];
      
      // Fetch person details for each gazette
      const gazettesWithPersons = await Promise.all(
        allGazettes.map(async (gazette) => {
          if (gazette.person_id) {
            try {
              const person = await apiGet(`/people/${gazette.person_id}`);
              return { ...gazette, person: person.person || person };
            } catch (error) {
              return gazette;
            }
          }
          return gazette;
        })
      );

      // Calculate approval status for each
      const gazettesWithStatus = gazettesWithPersons.map(gazette => ({
        ...gazette,
        approvalStatus: getApprovalStatus(gazette)
      }));

      setGazettes(gazettesWithStatus);
      
      // Calculate stats
      const stats = {
        total: gazettesWithStatus.length,
        ready: gazettesWithStatus.filter(g => g.approvalStatus.status === 'Ready').length,
        reviewNeeded: gazettesWithStatus.filter(g => g.approvalStatus.status === 'Review needed').length,
        createNew: gazettesWithStatus.filter(g => g.approvalStatus.status === 'Create new').length,
        manualReview: gazettesWithStatus.filter(g => g.approvalStatus.status === 'Manual review').length
      };
      setStats(stats);
      
    } catch (error) {
      console.error('Error loading gazettes:', error);
      alert('Failed to load gazettes for approval');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGazettes();
  }, [searchTerm, sortBy, sortOrder]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterMenuRef.current && !filterMenuRef.current.contains(event.target)) {
        setShowFilterMenu(false);
      }
      if (sortMenuRef.current && !sortMenuRef.current.contains(event.target)) {
        setShowSortMenu(false);
      }
      Object.keys(actionMenuRefs.current).forEach(id => {
        if (actionMenuRefs.current[id] && !actionMenuRefs.current[id].contains(event.target)) {
          setShowActionMenu(null);
        }
      });
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter gazettes based on active filter
  const filteredGazettes = gazettes.filter(gazette => {
    if (activeFilter === 'all') return true;
    return gazette.approvalStatus.status.toLowerCase().replace(/\s+/g, '-') === activeFilter;
  });

  // Search for people
  useEffect(() => {
    const searchPeople = async () => {
      if (!personSearchQuery || personSearchQuery.trim().length < 2) {
        setPersonSearchResults([]);
        return;
      }

      try {
        setIsSearchingPerson(true);
        const params = new URLSearchParams({
          query: personSearchQuery.trim(),
          limit: '10',
          page: '1'
        });
        const response = await apiGet(`/people/search?${params.toString()}`);
        if (response && response.people) {
          setPersonSearchResults(response.people);
        } else {
          setPersonSearchResults([]);
        }
      } catch (err) {
        console.error('Error searching people:', err);
        setPersonSearchResults([]);
      } finally {
        setIsSearchingPerson(false);
      }
    };

    const timer = setTimeout(() => searchPeople(), 300);
    return () => clearTimeout(timer);
  }, [personSearchQuery]);

  // Handle approve
  const handleApprove = async (gazetteId, approveAll = false) => {
    try {
      setIsProcessing(true);
      
      if (approveAll) {
        // Approve all ready entries
        const readyGazettes = filteredGazettes.filter(g => g.approvalStatus.status === 'Ready');
        if (readyGazettes.length === 0) {
          handleApiError({ message: 'No ready entries to approve' }, 'approve gazettes');
          setIsProcessing(false);
          return;
        }
        
        let successCount = 0;
        const errors = [];
        
        for (const gazette of readyGazettes) {
          try {
            await apiPut(`/gazette/${gazette.id}`, { status: 'PUBLISHED' });
            successCount++;
          } catch (error) {
            console.error(`Error approving gazette ${gazette.id}:`, error);
            errors.push(`Gazette ${gazette.id}: ${error?.detail || error?.message || 'Failed to approve'}`);
          }
        }
        
        if (errors.length === 0) {
          showSuccess(`Successfully approved ${successCount} gazette entries`);
        } else {
          handleApiError({ message: `Approved ${successCount} entries. ${errors.length} failed.` }, 'approve gazettes');
        }
      } else {
        // Approve single entry
        if (!gazetteId) {
          handleApiError({ message: 'Gazette ID is missing' }, 'approve gazette');
          setIsProcessing(false);
          return;
        }
        
        await apiPut(`/gazette/${gazetteId}`, { status: 'PUBLISHED' });
        showSuccess('Gazette entry approved successfully');
      }
      
      setShowApproveModal(false);
      setSelectedGazette(null);
      loadGazettes();
    } catch (error) {
      handleApiError(error, 'approve gazette');
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle reject
  const handleReject = async (gazetteId, reason) => {
    if (!gazetteId) {
      handleApiError({ message: 'Gazette ID is missing' }, 'reject gazette');
      return;
    }
    
    try {
      setIsProcessing(true);
      await apiPut(`/gazette/${gazetteId}`, { 
        status: 'CANCELLED',
        remarks: reason ? `Rejected: ${reason}` : 'Rejected during approval process'
      });
      showSuccess('Gazette entry rejected successfully');
      setShowRejectModal(false);
      setSelectedGazette(null);
      loadGazettes();
    } catch (error) {
      handleApiError(error, 'reject gazette');
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle link person
  const handleLinkPerson = async (personId) => {
    if (!selectedGazette || !personId) {
      handleApiError({ message: 'Please select a person to link' }, 'link person');
      return;
    }
    
    try {
      setIsProcessing(true);
      await apiPut(`/gazette/${selectedGazette.id}`, { person_id: personId });
      showSuccess('Person linked successfully');
      setShowLinkModal(false);
      setSelectedGazette(null);
      setPersonSearchQuery('');
      setPersonSearchResults([]);
      loadGazettes();
    } catch (error) {
      handleApiError(error, 'link person');
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle flag for manual review
  const handleFlagForManualReview = async () => {
    try {
      setIsProcessing(true);
      const uncertainGazettes = filteredGazettes.filter(g => 
        g.approvalStatus.status === 'Review needed' || g.approvalStatus.status === 'Create new'
      );
      
      if (uncertainGazettes.length === 0) {
        handleApiError({ message: 'No uncertain entries to flag' }, 'flag gazettes');
        setIsProcessing(false);
        return;
      }
      
      let successCount = 0;
      const errors = [];
      
      for (const gazette of uncertainGazettes) {
        try {
          await apiPut(`/gazette/${gazette.id}`, { 
            priority: 'HIGH',
            remarks: gazette.remarks ? `${gazette.remarks}; Flagged for manual review` : 'Flagged for manual review'
          });
          successCount++;
        } catch (error) {
          console.error(`Error flagging gazette ${gazette.id}:`, error);
          errors.push(`Gazette ${gazette.id}: ${error?.detail || error?.message || 'Failed to flag'}`);
        }
      }
      
      if (errors.length === 0) {
        showSuccess(`Flagged ${successCount} entries for manual review`);
      } else {
        handleApiError({ message: `Flagged ${successCount} entries. ${errors.length} failed.` }, 'flag gazettes');
      }
      
      loadGazettes();
    } catch (error) {
      handleApiError(error, 'flag gazettes');
    } finally {
      setIsProcessing(false);
    }
  };

  // Export to CSV
  const exportToCSV = () => {
    const exportData = filteredGazettes.map(g => ({
      'Date of Gazette': formatDate(g.publication_date),
      'Notice Type': getNoticeTypeLabel(g.gazette_type),
      'Issue No.': g.gazette_number || '',
      'Entity Name': g.new_name || g.old_name || '',
      'Profile Link': g.person?.full_name || 'No match',
      'Status': g.approvalStatus.status,
      'Gazette ID': g.id
    }));

    const headers = Object.keys(exportData[0]);
    let csvContent = headers.join(',') + '\n';
    
    exportData.forEach(row => {
      const values = headers.map(header => {
        const value = row[header] || '';
        if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      });
      csvContent += values.join(',') + '\n';
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `gazette_approval_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export to Excel
  const exportToExcel = () => {
    const exportData = filteredGazettes.map(g => ({
      'Date of Gazette': formatDate(g.publication_date),
      'Notice Type': getNoticeTypeLabel(g.gazette_type),
      'Issue No.': g.gazette_number || '',
      'Entity Name': g.new_name || g.old_name || '',
      'Profile Link': g.person?.full_name || 'No match',
      'Status': g.approvalStatus.status,
      'Gazette ID': g.id
    }));

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(exportData);
    XLSX.utils.book_append_sheet(wb, ws, 'Approval List');
    XLSX.writeFile(wb, `gazette_approval_export_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <div className="bg-[#F7F8FA] min-h-screen w-full">
      {/* Header */}
      <AdminHeader userInfo={userInfo} onNavigate={onNavigate} onLogout={onLogout} />

      {/* Main Content */}
      <div className="px-6 w-full">
        <div className="flex flex-col w-full bg-white py-[18px] gap-10 rounded-lg">
          <div className="flex flex-col items-start w-full gap-4 px-6">
            {/* Breadcrumb */}
            <span className="text-[#525866] text-xs whitespace-nowrap">APPROVAL</span>

            {/* Title */}
            <div className="flex flex-col items-start gap-2">
              <div className="flex items-center gap-1">
                <img
                  src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Iq8V0MifpP/f2e6euih_expires_30_days.png"
                  className="w-4 h-4 object-fill flex-shrink-0"
                />
                <img
                  src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Iq8V0MifpP/oyue1zmq_expires_30_days.png"
                  className="w-4 h-4 object-fill flex-shrink-0"
                />
                <span className="text-[#040E1B] text-xl font-bold whitespace-nowrap">Gazettes review & approval</span>
              </div>
              <span className="text-[#070810] text-sm whitespace-nowrap">Review, edit and approve gazette here</span>
            </div>

            {/* Stats Card */}
            <div className="flex items-center bg-white py-2 rounded-lg border border-solid border-[#D4E1EA]">
              <img
                src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Iq8V0MifpP/5sj2vlpc_expires_30_days.png"
                className="w-10 h-10 ml-2 mr-3 rounded-lg object-fill flex-shrink-0"
              />
              <div className="flex flex-col items-start gap-1">
                <span className="text-[#868C98] text-xs whitespace-nowrap">Total amount of Reviews</span>
                <span className="text-[#F59E0B] text-base whitespace-nowrap">{stats.total}</span>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex flex-col items-start w-full">
              <div className="flex items-start p-1 gap-4">
                {filters.map((filter) => {
                  const count = filter.id === 'all' ? stats.total :
                               filter.id === 'ready' ? stats.ready :
                               filter.id === 'review-needed' ? stats.reviewNeeded :
                               filter.id === 'create-new' ? stats.createNew :
                               stats.manualReview;
                  
                  return (
                    <button
                      key={filter.id}
                      onClick={() => setActiveFilter(filter.id)}
                      className={`flex flex-col items-start pb-2 ${
                        activeFilter === filter.id ? 'border-b-2 border-[#022658]' : ''
                      }`}
                    >
                      <span
                        className={`text-base whitespace-nowrap ${
                          activeFilter === filter.id ? 'text-[#022658] font-bold' : 'text-[#525866]'
                        }`}
                      >
                        {filter.label} ({count})
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Table Section */}
              <div className="flex flex-col w-full bg-white py-4 gap-4 rounded-3xl">
                {/* Search, Filter and Export */}
                <div className="flex justify-between items-start w-full px-4">
                  <div className="flex-1 pb-0.5 mr-4">
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
                  </div>
                  <div className="flex items-start gap-[7px] mr-4">
                    <div ref={filterMenuRef} className="relative">
                      <button
                        onClick={() => setShowFilterMenu(!showFilterMenu)}
                        className="flex items-center py-[7px] px-[9px] gap-1.5 rounded border border-solid border-[#D4E1EA] cursor-pointer hover:bg-gray-50"
                      >
                        <Filter className="w-[11px] h-[11px] text-[#525866]" />
                        <span className="text-[#525866] text-xs whitespace-nowrap">Filter</span>
                      </button>
                      {showFilterMenu && (
                        <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10 p-3">
                          <div className="space-y-2">
                            <div>
                              <label className="block text-xs text-gray-600 mb-1">Notice Type</label>
                              <select className="w-full text-xs px-2 py-1 border border-gray-300 rounded">
                                <option value="">All Types</option>
                                <option value="CHANGE_OF_NAME">Change of name</option>
                                <option value="CHANGE_OF_DATE_OF_BIRTH">Date of birth correction</option>
                                <option value="CHANGE_OF_PLACE_OF_BIRTH">Place of birth correction</option>
                              </select>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    <div ref={sortMenuRef} className="relative">
                      <button
                        onClick={() => setShowSortMenu(!showSortMenu)}
                        className="flex items-center py-[7px] px-[9px] gap-[5px] rounded border border-solid border-[#D4E1EA] cursor-pointer hover:bg-gray-50"
                      >
                        <ChevronDown className="w-[11px] h-[11px] text-[#525866]" />
                        <span className="text-[#525866] text-xs whitespace-nowrap">Sort</span>
                      </button>
                      {showSortMenu && (
                        <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10 p-3">
                          <div className="space-y-2">
                            <button
                              onClick={() => { setSortBy('publication_date'); setSortOrder('desc'); setShowSortMenu(false); }}
                              className="w-full text-left text-xs px-2 py-1 rounded hover:bg-gray-100"
                            >
                              Date (Newest First)
                            </button>
                            <button
                              onClick={() => { setSortBy('publication_date'); setSortOrder('asc'); setShowSortMenu(false); }}
                              className="w-full text-left text-xs px-2 py-1 rounded hover:bg-gray-100"
                            >
                              Date (Oldest First)
                            </button>
                            <button
                              onClick={() => { setSortBy('title'); setSortOrder('asc'); setShowSortMenu(false); }}
                              className="w-full text-left text-xs px-2 py-1 rounded hover:bg-gray-100"
                            >
                              Title (A-Z)
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="relative">
                    <button
                      onClick={() => setShowActionMenu('export')}
                      className="flex items-center bg-transparent text-left py-1 px-4 gap-[7px] rounded-lg border border-solid border-[#F59E0B] hover:bg-orange-50 transition-colors"
                    >
                      <span className="text-[#F59E0B] text-base whitespace-nowrap" style={{ fontFamily: 'Satoshi' }}>Export List</span>
                      <Download className="w-4 h-4 text-[#F59E0B]" />
                    </button>
                    {showActionMenu === 'export' && (
                      <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                        <button
                          onClick={() => { exportToCSV(); setShowActionMenu(null); }}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                        >
                          <Download className="w-4 h-4" />
                          Export to CSV
                        </button>
                        <button
                          onClick={() => { exportToExcel(); setShowActionMenu(null); }}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                        >
                          <Download className="w-4 h-4" />
                          Export to Excel
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Approval Table */}
                {loading ? (
                  <div className="flex justify-center items-center py-12">
                    <span className="text-gray-500">Loading...</span>
                  </div>
                ) : filteredGazettes.length === 0 ? (
                  <div className="flex justify-center items-center py-12">
                    <span className="text-gray-500">No gazettes found for approval</span>
                  </div>
                ) : (
                  <div className="flex flex-col w-full gap-1 rounded-[14px] border border-solid border-[#E5E8EC] overflow-hidden">
                    {/* Table Header */}
                    <div className="flex items-start w-full bg-[#F4F6F9] py-4 px-4 gap-3">
                      <div className="flex flex-col items-start w-[14%] py-[7px]">
                        <span className="text-[#070810] text-sm font-bold whitespace-nowrap">Date of Gazette</span>
                      </div>
                      <div className="flex flex-col items-start w-[18%] py-[7px]">
                        <span className="text-[#070810] text-sm font-bold whitespace-nowrap">Notice Type</span>
                      </div>
                      <div className="flex flex-col items-start w-[13%] py-[7px]">
                        <span className="text-[#070810] text-sm font-bold whitespace-nowrap">Issue No.</span>
                      </div>
                      <div className="flex flex-col items-start w-[15%] py-[7px]">
                        <span className="text-[#070810] text-sm font-bold whitespace-nowrap">Entity name</span>
                      </div>
                      <div className="flex flex-col items-start w-[15%] py-[7px]">
                        <span className="text-[#070810] text-sm font-bold whitespace-nowrap">Profile link</span>
                      </div>
                      <div className="flex flex-col items-start w-[20%] py-[7px]">
                        <span className="text-[#070810] text-sm font-bold whitespace-nowrap">Status</span>
                      </div>
                      <div className="w-[5%] flex-shrink-0 py-[7px] flex justify-center">
                        <span className="text-[#040E1B] text-sm font-bold whitespace-nowrap">Actions</span>
                      </div>
                    </div>

                    {/* Table Rows */}
                    {filteredGazettes.map((item, idx) => {
                      const statusClass = getStatusClasses(item.approvalStatus.color);
                      const statusBgClass = getStatusBgClasses(item.approvalStatus.color);
                      const profileLink = item.person?.full_name || 'No match';
                      
                      return (
                        <div key={idx} className="flex items-center w-full py-3 px-4 gap-3 hover:bg-blue-50 transition-colors">
                          <div className="flex flex-col items-start w-[14%] py-[7px]">
                            <span className="text-[#070810] text-sm whitespace-nowrap overflow-hidden text-ellipsis w-full">
                              {formatDate(item.publication_date)}
                            </span>
                          </div>
                          <div className="flex flex-col items-start w-[18%] py-[7px]">
                            <span className="text-[#070810] text-sm whitespace-nowrap overflow-hidden text-ellipsis w-full">
                              {getNoticeTypeLabel(item.gazette_type)}
                            </span>
                          </div>
                          <div className="flex flex-col items-start w-[13%] py-[7px]">
                            <span className="text-[#070810] text-sm whitespace-nowrap overflow-hidden text-ellipsis w-full">
                              {item.gazette_number || 'N/A'}
                            </span>
                          </div>
                          <div className="flex flex-col items-start w-[15%] py-[7px]">
                            <span className="text-[#070810] text-sm whitespace-nowrap overflow-hidden text-ellipsis w-full">
                              {item.new_name || item.old_name || 'N/A'}
                            </span>
                          </div>
                          <div className="flex flex-col items-start w-[15%] py-[7px]">
                            <span className={`text-sm whitespace-nowrap overflow-hidden text-ellipsis w-full ${
                              profileLink === 'No match' ? 'text-red-500' : 'text-[#070810]'
                            }`}>
                              {profileLink}
                            </span>
                          </div>
                          <div className="flex flex-col items-start w-[20%] py-[7px]">
                            <span className={`text-sm font-bold whitespace-nowrap overflow-hidden text-ellipsis w-full px-2 py-1 rounded ${statusBgClass}`}>
                              {item.approvalStatus.status}
                            </span>
                          </div>
                          <div className="w-[5%] flex-shrink-0 flex items-center justify-center py-[7px] relative">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setShowActionMenu(showActionMenu === item.id ? null : item.id);
                                setSelectedGazette(item);
                              }}
                              className="p-1 hover:bg-gray-100 rounded"
                            >
                              <MoreVertical className="w-4 h-4 text-gray-600" />
                            </button>
                            {showActionMenu === item.id && (
                              <div
                                ref={el => actionMenuRefs.current[item.id] = el}
                                className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-20"
                              >
                                <button
                                  onClick={() => {
                                    setShowViewModal(true);
                                    setShowActionMenu(null);
                                  }}
                                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                >
                                  <Eye className="w-4 h-4" />
                                  View
                                </button>
                                {!item.person_id && (
                                  <button
                                    onClick={() => {
                                      setShowLinkModal(true);
                                      setShowActionMenu(null);
                                    }}
                                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                  >
                                    <Link2 className="w-4 h-4" />
                                    Link Profile
                                  </button>
                                )}
                                {item.approvalStatus.status === 'Ready' && (
                                  <button
                                    onClick={() => {
                                      setShowApproveModal(true);
                                      setShowActionMenu(null);
                                    }}
                                    className="w-full text-left px-4 py-2 text-sm text-green-600 hover:bg-green-50 flex items-center gap-2"
                                  >
                                    <CheckCircle className="w-4 h-4" />
                                    Approve
                                  </button>
                                )}
                                <button
                                  onClick={() => {
                                    setShowRejectModal(true);
                                    setShowActionMenu(null);
                                  }}
                                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                                >
                                  <XCircle className="w-4 h-4" />
                                  Reject
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-start w-full gap-10 px-6">
            <button
              onClick={handleFlagForManualReview}
              disabled={isProcessing}
              className="flex flex-col items-center flex-1 py-[17px] rounded-lg border-2 border-solid border-[#022658] hover:bg-gray-50 transition-colors disabled:opacity-50"
              style={{ boxShadow: '0px 4px 4px #050F1C1A' }}
            >
              <span className="text-[#022658] text-base font-bold whitespace-nowrap" style={{ fontFamily: 'Satoshi' }}>
                {isProcessing ? 'Processing...' : 'Flag All Uncertain For Manual Review'}
              </span>
            </button>
            <button
              onClick={() => handleApprove(null, true)}
              disabled={isProcessing || stats.ready === 0}
              className="flex flex-col items-center flex-1 py-[17px] rounded-lg border-4 border-solid border-[#0F284726] hover:opacity-90 transition-opacity disabled:opacity-50"
              style={{ background: 'linear-gradient(180deg, #022658, #1A4983)' }}
            >
              <span className="text-white text-base font-bold whitespace-nowrap" style={{ fontFamily: 'Satoshi' }}>
                {isProcessing ? 'Processing...' : `Approve All Ready Entries (${stats.ready})`}
              </span>
            </button>
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
                <button onClick={() => setShowViewModal(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Title</label>
                    <p className="text-sm text-gray-900 mt-1">{selectedGazette.title}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Notice Type</label>
                    <p className="text-sm text-gray-900 mt-1">{getNoticeTypeLabel(selectedGazette.gazette_type)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Publication Date</label>
                    <p className="text-sm text-gray-900 mt-1">{formatDate(selectedGazette.publication_date)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Status</label>
                    <p className="text-sm text-gray-900 mt-1">{selectedGazette.approvalStatus.status}</p>
                  </div>
                  {selectedGazette.new_name && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">New Name</label>
                      <p className="text-sm text-gray-900 mt-1">{selectedGazette.new_name}</p>
                    </div>
                  )}
                  {selectedGazette.old_name && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Old Name</label>
                      <p className="text-sm text-gray-900 mt-1">{selectedGazette.old_name}</p>
                    </div>
                  )}
                  {selectedGazette.person && (
                    <div className="col-span-2">
                      <label className="text-sm font-medium text-gray-500">Linked Person</label>
                      <p className="text-sm text-gray-900 mt-1">{selectedGazette.person.full_name}</p>
                    </div>
                  )}
                </div>
                {selectedGazette.content && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Content</label>
                    <p className="text-sm text-gray-700 mt-1 whitespace-pre-wrap">{selectedGazette.content}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Approve Modal */}
      {showApproveModal && selectedGazette && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowApproveModal(false)}></div>
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Approve Gazette Entry</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Are you sure you want to approve this gazette entry? It will be published.
                </p>
                <div className="bg-gray-50 p-3 rounded mb-4">
                  <p className="text-sm font-medium text-gray-900">{selectedGazette.title}</p>
                  <p className="text-xs text-gray-500 mt-1">{getNoticeTypeLabel(selectedGazette.gazette_type)}</p>
                </div>
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setShowApproveModal(false)}
                    disabled={isProcessing}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleApprove(selectedGazette.id)}
                    disabled={isProcessing}
                    className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700"
                  >
                    {isProcessing ? 'Approving...' : 'Approve'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && selectedGazette && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowRejectModal(false)}></div>
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Reject Gazette Entry</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Please provide a reason for rejecting this gazette entry.
                </p>
                <textarea
                  id="rejectReason"
                  rows="4"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-4"
                  placeholder="Enter rejection reason..."
                />
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setShowRejectModal(false)}
                    disabled={isProcessing}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      const reason = document.getElementById('rejectReason').value;
                      handleReject(selectedGazette.id, reason);
                    }}
                    disabled={isProcessing}
                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700"
                  >
                    {isProcessing ? 'Rejecting...' : 'Reject'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Link Person Modal */}
      {showLinkModal && selectedGazette && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowLinkModal(false)}></div>
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Link Person Profile</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Search and link a person profile to this gazette entry.
                </p>
                <div className="mb-4">
                  <input
                    type="text"
                    value={personSearchQuery}
                    onChange={(e) => setPersonSearchQuery(e.target.value)}
                    placeholder="Search for person..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                  {personSearchResults.length > 0 && (
                    <div className="mt-2 border border-gray-200 rounded-lg max-h-48 overflow-y-auto">
                      {personSearchResults.map((person) => (
                        <button
                          key={person.id}
                          onClick={() => handleLinkPerson(person.id)}
                          className="w-full text-left px-4 py-2 hover:bg-gray-50 border-b border-gray-100 last:border-0"
                        >
                          <p className="text-sm font-medium text-gray-900">{person.full_name}</p>
                          {person.id_number && (
                            <p className="text-xs text-gray-500">ID: {person.id_number}</p>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => {
                      setShowLinkModal(false);
                      setPersonSearchQuery('');
                      setPersonSearchResults([]);
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
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

export default GazetteApprovalPage;
