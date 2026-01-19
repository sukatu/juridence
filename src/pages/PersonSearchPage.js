import React, { useEffect, useState } from 'react';
import AdminHeader from '../components/admin/AdminHeader';
import { Search, X, ChevronDown, ChevronUp, Database, User, Calendar, MapPin, ArrowLeft, ArrowRight, ArrowUp, ArrowDown, FileText, Eye, Download, Printer, Flag, ChevronLeft, ChevronRight } from 'lucide-react';
import { apiGet } from '../utils/api';

const PersonSearchPage = ({ userInfo, onNavigate, onLogout }) => {
  const [searchData, setSearchData] = useState({
    name: '',
    location: '',
    profession: '',
    databaseType: 'all' // 'all', 'change_of_name', 'change_of_pob', 'change_of_dob', 'marriage_officers', 'judgements_rulings'
  });
  const [isDatabaseSectionOpen, setIsDatabaseSectionOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [searchProgress, setSearchProgress] = useState(0);
  const [searchResults, setSearchResults] = useState(null);
  const [searchError, setSearchError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('change_of_name');
  const [sortOrder, setSortOrder] = useState('asc'); // 'asc' or 'desc'
  const [categoryFilter, setCategoryFilter] = useState(''); // Filter/search within category
  const [categoryCurrentPage, setCategoryCurrentPage] = useState(1); // Current page for category results
  const [itemsPerPage] = useState(20); // Items per page for category pagination
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [recordDetails, setRecordDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [showReportIssueModal, setShowReportIssueModal] = useState(false);
  const [issueReport, setIssueReport] = useState({ subject: '', description: '' });
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [summaryRecord, setSummaryRecord] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [pageLimit] = useState(100); // Items per page

  useEffect(() => {
    const storedState = sessionStorage.getItem('personSearchState');
    if (!storedState) return;
    try {
      const parsed = JSON.parse(storedState);
      if (parsed.searchData) setSearchData(parsed.searchData);
      if (parsed.searchResults) setSearchResults(parsed.searchResults);
      if (parsed.searchQuery) setSearchQuery(parsed.searchQuery);
      if (parsed.activeTab) setActiveTab(parsed.activeTab);
      if (typeof parsed.categoryFilter === 'string') setCategoryFilter(parsed.categoryFilter);
      if (typeof parsed.categoryCurrentPage === 'number') setCategoryCurrentPage(parsed.categoryCurrentPage);
      if (typeof parsed.sortOrder === 'string') setSortOrder(parsed.sortOrder);
      if (typeof parsed.totalResults === 'number') setTotalResults(parsed.totalResults);
      if (typeof parsed.totalPages === 'number') setTotalPages(parsed.totalPages);
      if (typeof parsed.currentPage === 'number') setCurrentPage(parsed.currentPage);
      setShowResults(true);
      setIsSearching(false);
      setSearchProgress(100);
      setSearchError(null);
    } catch (error) {
      console.error('Error restoring person search state:', error);
    } finally {
      sessionStorage.removeItem('personSearchState');
    }
  }, []);

  const databaseOptions = [
    {
      id: 'all',
      label: 'All database',
      description: 'Search across all available databases and records'
    },
    {
      id: 'change_of_name',
      label: 'Change of name',
      description: 'Search records of legal name changes and name amendments'
    },
    {
      id: 'change_of_pob',
      label: 'Correction of place of birth',
      description: 'Search records of place of birth corrections and amendments'
    },
    {
      id: 'change_of_dob',
      label: 'Correction of date of birth',
      description: 'Search records of date of birth corrections and amendments'
    },
    {
      id: 'marriage_officers',
      label: 'Marriage officers',
      description: 'Search for registered marriage officers and officiants'
    },
    {
      id: 'judgements_rulings',
      label: 'Judgements & Rulings',
      description: 'Search court judgements and rulings by case title'
    }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSearchData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDatabaseTypeChange = (databaseType) => {
    setSearchData(prev => ({
      ...prev,
      databaseType
    }));
  };

  const handleClear = () => {
    setSearchData({
      name: '',
      location: '',
      profession: '',
      databaseType: 'all'
    });
    setSearchResults(null);
    setSearchError(null);
    setSearchProgress(0);
    setCurrentPage(1);
    setTotalPages(1);
    setTotalResults(0);
  };

  const handleSearch = async (page = 1) => {
    // Handle case where handleSearch is called with event object from button click
    if (page && typeof page !== 'number' && typeof page.preventDefault === 'function') {
      page = 1; // Reset to default page if event object is passed
    }
    
    // Ensure page is a number
    page = typeof page === 'number' ? page : 1;
    
    if (!searchData.name.trim()) {
      setSearchError('Please enter a name to search');
      return;
    }

    // Hide form and show results view
    setShowResults(true);
    setIsSearching(true);
    setSearchProgress(0);
    setSearchResults(null);
    setSearchError(null);
    setSearchQuery(searchData.name);
    setCurrentPage(page);

    let progressInterval = null;

    try {
      // Simulate progress for better UX
      progressInterval = setInterval(() => {
        setSearchProgress(prev => {
          if (prev >= 90) {
            if (progressInterval) clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 100);

      let response = null;
      const shouldSearchPersons = searchData.databaseType !== 'judgements_rulings';
      if (shouldSearchPersons) {
        // Call the unified search API - fetch all results (no limit)
        // The backend will return all results from all categories
        response = await apiGet(`/persons-unified-search/?query=${encodeURIComponent(searchData.name)}&page=1&limit=10000`);
      }
      
      if (progressInterval) {
        clearInterval(progressInterval);
        progressInterval = null;
      }
      setSearchProgress(100);

      // Group results by source type
      const groupedResults = {
        change_of_name: [],
        correction_of_date_of_birth: [],
        correction_of_place_of_birth: [],
        marriage_officer: [],
        judgements_rulings: []
      };

      if (response && response.results) {
        response.results.forEach(result => {
          if (result.source_type === 'change_of_name') {
            groupedResults.change_of_name.push(result);
          } else if (result.source_type === 'correction_of_date_of_birth') {
            groupedResults.correction_of_date_of_birth.push(result);
          } else if (result.source_type === 'correction_of_place_of_birth') {
            groupedResults.correction_of_place_of_birth.push(result);
          } else if (result.source_type === 'marriage_officer') {
            groupedResults.marriage_officer.push(result);
          }
        });
      }

      if (searchData.databaseType === 'all' || searchData.databaseType === 'judgements_rulings') {
        const caseResponse = await apiGet(`/case-search/search?query=${encodeURIComponent(searchData.name)}&page=1&limit=100`);
        groupedResults.judgements_rulings = caseResponse?.results || [];
      }

      const databaseTypeToTab = {
        all: null,
        change_of_name: 'change_of_name',
        change_of_pob: 'correction_of_place_of_birth',
        change_of_dob: 'correction_of_date_of_birth',
        marriage_officers: 'marriage_officer',
        judgements_rulings: 'judgements_rulings'
      };
      const selectedTab = databaseTypeToTab[searchData.databaseType] || null;
      if (selectedTab) {
        Object.keys(groupedResults).forEach((key) => {
          if (key !== selectedTab) {
            groupedResults[key] = [];
          }
        });
        setActiveTab(selectedTab);
      }

      const totalCount = Object.values(groupedResults).reduce((sum, arr) => sum + (arr?.length || 0), 0);
      setTotalResults(totalCount);
      setTotalPages(1);

      setSearchResults(groupedResults);
      
      // Debug logging
      console.log('Search response:', response);
      console.log('Grouped results:', groupedResults);
      console.log('Total results:', Object.values(groupedResults).reduce((sum, arr) => sum + arr.length, 0));
    } catch (error) {
      console.error('Search error:', error);
      console.error('Error details:', error.data || error.response || error);
      
      // Extract error message from response if available
      let errorMessage = 'An error occurred while searching';
      if (error.data) {
        const errorData = error.data;
        if (errorData.detail) {
          errorMessage = Array.isArray(errorData.detail) 
            ? errorData.detail.map(d => d.msg || d).join(', ')
            : errorData.detail;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        } else if (typeof errorData === 'string') {
          errorMessage = errorData;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setSearchError(errorMessage);
      setSearchProgress(0);
      if (progressInterval) {
        clearInterval(progressInterval);
      }
    } finally {
      setIsSearching(false);
    }
  };

  const handleBackToForm = () => {
    setShowResults(false);
    setSearchResults(null);
    setSearchError(null);
    setSearchProgress(0);
    setSearchQuery('');
    setActiveTab('change_of_name');
    setSortOrder('asc');
    setCategoryFilter('');
    setCategoryCurrentPage(1);
    setCurrentPage(1);
    setTotalPages(1);
    setTotalResults(0);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages && newPage !== currentPage) {
      handleSearch(newPage);
      // Scroll to top when page changes
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const sortResults = (results, sortBy = 'name') => {
    if (!results || results.length === 0) return results;
    
    return [...results].sort((a, b) => {
      let aValue = '';
      let bValue = '';
      
      if (sortBy === 'name') {
        aValue = (a.current_name || a.name || a.person_name || a.officer_name || '').toLowerCase();
        bValue = (b.current_name || b.name || b.person_name || b.officer_name || '').toLowerCase();
      }
      
      if (sortOrder === 'asc') {
        return aValue.localeCompare(bValue);
      } else {
        return bValue.localeCompare(aValue);
      }
    });
  };

  const getCurrentTabResults = () => {
    if (!searchResults) return [];
    
    let results = [];
    switch (activeTab) {
      case 'change_of_name':
        results = searchResults.change_of_name || [];
        break;
      case 'correction_of_place_of_birth':
        results = searchResults.correction_of_place_of_birth || [];
        break;
      case 'correction_of_date_of_birth':
        results = searchResults.correction_of_date_of_birth || [];
        break;
      case 'marriage_officer':
        results = searchResults.marriage_officer || [];
        break;
      case 'judgements_rulings':
        results = searchResults.judgements_rulings || [];
        break;
      default:
        results = [];
    }
    
    // Filter results based on categoryFilter
    if (categoryFilter.trim()) {
      const filterLower = categoryFilter.toLowerCase().trim();
      results = results.filter(result => {
        if (activeTab === 'change_of_name') {
          const name = (result.name || '').toLowerCase();
          const currentName = (result.current_name || '').toLowerCase();
          const oldName = (result.old_name || '').toLowerCase();
          const aliasNames = (result.alias_names || []).join(' ').toLowerCase();
          return name.includes(filterLower) || currentName.includes(filterLower) || oldName.includes(filterLower) || aliasNames.includes(filterLower);
        } else if (activeTab === 'marriage_officer') {
          const officerName = (result.officer_name || result.name || '').toLowerCase();
          const church = (result.church || '').toLowerCase();
          const location = (result.location || '').toLowerCase();
          const region = (result.region || '').toLowerCase();
          return officerName.includes(filterLower) || church.includes(filterLower) || location.includes(filterLower) || region.includes(filterLower);
        } else if (activeTab === 'judgements_rulings') {
          const title = (result.title || '').toLowerCase();
          const suit = (result.suit_reference_number || '').toLowerCase();
          const protagonist = (result.protagonist || '').toLowerCase();
          const antagonist = (result.antagonist || '').toLowerCase();
          return title.includes(filterLower) || suit.includes(filterLower) || protagonist.includes(filterLower) || antagonist.includes(filterLower);
        } else {
          const personName = (result.person_name || result.name || '').toLowerCase();
          return personName.includes(filterLower);
        }
      });
    }
    
    // Sort results
    return sortResults(results);
  };

  const getPaginatedResults = (results) => {
    const startIndex = (categoryCurrentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return results.slice(startIndex, endIndex);
  };

  const getTotalCategoryPages = () => {
    const results = getCurrentTabResults();
    return Math.ceil(results.length / itemsPerPage) || 1;
  };

  const handleCategoryPageChange = (newPage) => {
    const totalCategoryPages = getTotalCategoryPages();
    if (newPage >= 1 && newPage <= totalCategoryPages && newPage !== categoryCurrentPage) {
      setCategoryCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleCategoryFilterChange = (e) => {
    setCategoryFilter(e.target.value);
    setCategoryCurrentPage(1); // Reset to first page when filter changes
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setCategoryFilter(''); // Reset filter when tab changes
    setCategoryCurrentPage(1); // Reset to first page when tab changes
  };

  const getTabCount = (tabKey) => {
    if (!searchResults) return 0;
    switch (tabKey) {
      case 'change_of_name':
        return (searchResults.change_of_name || []).length;
      case 'correction_of_place_of_birth':
        return (searchResults.correction_of_place_of_birth || []).length;
      case 'correction_of_date_of_birth':
        return (searchResults.correction_of_date_of_birth || []).length;
      case 'marriage_officer':
        return (searchResults.marriage_officer || []).length;
      case 'judgements_rulings':
        return (searchResults.judgements_rulings || []).length;
      default:
        return 0;
    }
  };

  const handleViewReport = async (result) => {
    setSelectedRecord(result);
    setShowDetailsModal(true);
    setLoadingDetails(true);
    setRecordDetails(null);

    try {
      const details = await apiGet(`/persons-unified-search/${result.source_type}/${result.id}`);
      setRecordDetails(details);
    } catch (error) {
      console.error('Error fetching details:', error);
      setSearchError('Failed to load record details');
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleViewSummary = (result) => {
    setSummaryRecord(result);
    setShowSummaryModal(true);
  };

  const handleCloseSummary = () => {
    setShowSummaryModal(false);
    setSummaryRecord(null);
  };

  const handleViewCase = async (caseItem) => {
    const personSearchState = {
      searchData,
      searchResults,
      searchQuery,
      activeTab,
      categoryFilter,
      categoryCurrentPage,
      sortOrder,
      totalResults,
      totalPages,
      currentPage
    };
    try {
      const fullCaseData = await apiGet(`/cases/${caseItem.id}`);
      sessionStorage.setItem('personSearchState', JSON.stringify(personSearchState));
      sessionStorage.setItem('caseBackTarget', JSON.stringify({
        type: 'person_search',
        state: personSearchState
      }));
      sessionStorage.setItem('selectedCaseData', JSON.stringify({
        ...fullCaseData
      }));
      if (onNavigate) {
        onNavigate('case-profile');
      }
    } catch (error) {
      console.error('Error fetching case details:', error);
      sessionStorage.setItem('personSearchState', JSON.stringify(personSearchState));
      sessionStorage.setItem('caseBackTarget', JSON.stringify({
        type: 'person_search',
        state: personSearchState
      }));
      sessionStorage.setItem('selectedCaseData', JSON.stringify({
        ...caseItem
      }));
      if (onNavigate) {
        onNavigate('case-profile');
      }
    }
  };

  const handleCloseModal = () => {
    setShowDetailsModal(false);
    setSelectedRecord(null);
    setRecordDetails(null);
    setShowReportIssueModal(false);
    setIssueReport({ subject: '', description: '' });
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExport = () => {
    if (!recordDetails) return;
    
    // Create a formatted text version of the record
    let content = `RECORD DETAILS\n`;
    content += `================\n\n`;
    content += `Data Source: ${selectedRecord?.data_source || 'N/A'}\n`;
    content += `Record ID: ${recordDetails.id || 'N/A'}\n\n`;
    
    if (recordDetails.source_type === 'change_of_name') {
      content += `New Name: ${recordDetails.current_name || 'N/A'}\n`;
      content += `Old Name: ${recordDetails.old_name || 'N/A'}\n`;
      if (recordDetails.alias_names && recordDetails.alias_names.length > 0) {
        content += `Aliases: ${recordDetails.alias_names.join(', ')}\n`;
      }
      content += `Profession: ${recordDetails.profession || 'N/A'}\n`;
      content += `Gender: ${recordDetails.gender || 'N/A'}\n`;
      content += `Address: ${recordDetails.address || 'N/A'}\n`;
      content += `Town/City: ${recordDetails.town_city || 'N/A'}\n`;
      content += `Region: ${recordDetails.region || 'N/A'}\n`;
      content += `Gazette Number: ${recordDetails.gazette_number || 'N/A'}\n`;
      content += `Gazette Date: ${recordDetails.gazette_date ? formatDate(recordDetails.gazette_date) : 'N/A'}\n`;
    } else if (recordDetails.source_type === 'correction_of_date_of_birth') {
      content += `Person Name: ${recordDetails.person_name || 'N/A'}\n`;
      content += `Old Date of Birth: ${recordDetails.old_date_of_birth ? formatDate(recordDetails.old_date_of_birth) : 'N/A'}\n`;
      content += `New Date of Birth: ${recordDetails.new_date_of_birth ? formatDate(recordDetails.new_date_of_birth) : 'N/A'}\n`;
    } else if (recordDetails.source_type === 'correction_of_place_of_birth') {
      content += `Person Name: ${recordDetails.person_name || 'N/A'}\n`;
      content += `Old Place of Birth: ${recordDetails.old_place_of_birth || 'N/A'}\n`;
      content += `New Place of Birth: ${recordDetails.new_place_of_birth || 'N/A'}\n`;
    } else if (recordDetails.source_type === 'marriage_officer') {
      content += `Officer Name: ${recordDetails.officer_name || 'N/A'}\n`;
      content += `Church: ${recordDetails.church || 'N/A'}\n`;
      content += `Location: ${recordDetails.location || 'N/A'}\n`;
      content += `Region: ${recordDetails.region || 'N/A'}\n`;
    }
    
    // Create and download the file
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedRecord?.data_source || 'record'}_${recordDetails.id || 'unknown'}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleReportIssue = () => {
    setShowReportIssueModal(true);
  };

  const handleIssueSubmit = async (e) => {
    e.preventDefault();
    // TODO: Implement API call to submit issue report
    console.log('Issue Report:', {
      recordId: selectedRecord?.id,
      sourceType: selectedRecord?.source_type,
      subject: issueReport.subject,
      description: issueReport.description
    });
    
    // For now, just close the modal and show success
    alert('Issue reported successfully. Thank you for your feedback!');
    setShowReportIssueModal(false);
    setIssueReport({ subject: '', description: '' });
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    } catch {
      return dateString;
    }
  };

  const getCourtTypeName = (courtType) => {
    if (!courtType) return 'N/A';
    const courtTypeMap = {
      'SC': 'Supreme Court',
      'CA': 'Court of Appeal',
      'HC': 'High Court',
      'DC': 'District Court',
      'CC': 'Circuit Court',
      'FC': 'Family Court',
      'LC': 'Land Court',
      'COM': 'Commercial Court',
      'H': 'High Court',
      'high_court': 'High Court',
      'supreme_court': 'Supreme Court',
      'court_of_appeal': 'Court of Appeal',
      'circuit_court': 'Circuit Court',
      'district_court': 'District Court',
      'commercial_court': 'Commercial Court',
      'family_court': 'Family Court',
      'land_court': 'Land Court',
    };
    return courtTypeMap[courtType] || courtType;
  };

  const getCaseProgressBadge = (progress) => {
    const lowerProgress = progress?.toLowerCase();
    if (!lowerProgress) return { text: 'N/A', className: 'bg-gray-100 text-gray-600' };

    if (['closed', 'judgment', 'judgement', 'ruling', 'motion - completed', 'pre-trial - completed', 'concluded', 'resolved'].includes(lowerProgress)) {
      return { text: progress, className: 'bg-green-100 text-green-600' };
    }
    if (['process service', 'case filed', 'ongoing', 'in progress', 'new', 'pending', 'hearing'].includes(lowerProgress)) {
      return { text: progress, className: 'bg-yellow-100 text-yellow-600' };
    }
    if (['motion - struck out'].includes(lowerProgress)) {
      return { text: progress, className: 'bg-red-100 text-red-600' };
    }
    return { text: progress, className: 'bg-gray-100 text-gray-600' };
  };

  // Render search form
  const renderSearchForm = () => (
    <div className="bg-[#F7F8FA] min-h-screen">
      <AdminHeader userInfo={userInfo} onNavigate={onNavigate} onLogout={onLogout} />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-md border border-slate-200 p-6">
          <h1 className="text-2xl font-bold text-slate-900 mb-6">Person Search</h1>
          
          <div className="space-y-6">
            {/* Name Field */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-2">
                Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={searchData.name}
                onChange={handleInputChange}
                placeholder="Enter name"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#022658] focus:border-[#022658] outline-none"
              />
            </div>

            {/* Location and Profession Fields hidden */}

            {/* Database Type Selection - Collapsible Radio Buttons */}
            <div>
              <button
                type="button"
                onClick={() => setIsDatabaseSectionOpen(!isDatabaseSectionOpen)}
                className="w-full flex items-center justify-between text-sm font-medium text-slate-700 mb-3 p-2 hover:bg-slate-50 rounded-lg transition-colors"
              >
                <span>Select Database</span>
                {isDatabaseSectionOpen ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>
              {isDatabaseSectionOpen && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {databaseOptions.map((option) => (
                    <label
                      key={option.id}
                      className="flex items-start p-4 border border-slate-300 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors"
                    >
                      <input
                        type="radio"
                        name="databaseType"
                        value={option.id}
                        checked={searchData.databaseType === option.id}
                        onChange={() => handleDatabaseTypeChange(option.id)}
                        className="mt-1 mr-3 h-4 w-4 text-[#022658] focus:ring-[#022658] focus:ring-2 border-slate-300"
                      />
                      <div className="flex-1">
                        <div className="text-sm font-medium text-slate-900">
                          {option.label}
                        </div>
                        {option.description && (
                          <div className="text-xs text-slate-500 mt-1">
                            {option.description}
                          </div>
                        )}
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={handleClear}
                className="flex items-center gap-2 px-6 py-2.5 border border-[#D4E1EA] text-[#525866] rounded-lg hover:bg-[#F7F8FA] transition-colors font-medium"
              >
                <X className="w-4 h-4" />
                Clear
              </button>
              <button
                type="button"
                onClick={() => handleSearch()}
                disabled={!searchData.name.trim()}
                className="flex items-center gap-2 px-6 py-2.5 bg-[#022658] text-white rounded-lg hover:bg-[#033a7a] transition-colors font-medium flex-1 justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Search className="w-4 h-4" />
                Search
              </button>
            </div>

            {/* Error Message */}
            {searchError && (
              <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="text-sm font-medium text-red-800">{searchError}</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  // Render search results view
  const renderResultsView = () => (
    <div className="bg-[#F7F8FA] min-h-screen">
      <AdminHeader userInfo={userInfo} onNavigate={onNavigate} onLogout={onLogout} />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button and Title */}
        <div className="mb-6">
          <button
            onClick={handleBackToForm}
            className="flex items-center gap-2 text-slate-700 hover:text-slate-900 mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back to Search</span>
          </button>
          <h1 className="text-2xl font-bold text-slate-900">Search Results</h1>
          {searchQuery && (
            <p className="text-slate-600 mt-2">Searching for: <span className="font-semibold">"{searchQuery}"</span></p>
          )}
        </div>

        {/* Progress Bar and Database Cards */}
        {isSearching && (
          <div className="bg-white rounded-lg shadow-md border border-slate-200 p-6 mb-6">
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-700">Searching databases...</span>
                <span className="text-sm font-medium text-[#022658]">{searchProgress}%</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2.5">
                <div 
                  className="bg-[#022658] h-2.5 rounded-full transition-all duration-300"
                  style={{ width: `${searchProgress}%` }}
                />
              </div>
            </div>

            {/* Database Search Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="flex items-center gap-3 p-3 bg-[#F4F6F9] rounded-lg border border-[#D4E1EA]">
                <User className="w-5 h-5 text-[#022658]" />
                <div>
                  <div className="text-sm font-medium text-slate-900">Change of Name</div>
                  <div className="text-xs text-slate-600">Searching...</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-[#F4F6F9] rounded-lg border border-[#D4E1EA]">
                <Calendar className="w-5 h-5 text-[#022658]" />
                <div>
                  <div className="text-sm font-medium text-slate-900">Correction of Date of Birth</div>
                  <div className="text-xs text-slate-600">Searching...</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-[#F4F6F9] rounded-lg border border-[#D4E1EA]">
                <MapPin className="w-5 h-5 text-[#022658]" />
                <div>
                  <div className="text-sm font-medium text-slate-900">Correction of Place of Birth</div>
                  <div className="text-xs text-slate-600">Searching...</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-[#F4F6F9] rounded-lg border border-[#D4E1EA]">
                <Database className="w-5 h-5 text-[#022658]" />
                <div>
                  <div className="text-sm font-medium text-slate-900">Marriage Officers</div>
                  <div className="text-xs text-slate-600">Searching...</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {searchError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="text-sm font-medium text-red-800">{searchError}</div>
          </div>
        )}

        {/* Tabs and Search Results */}
        {!isSearching && searchResults && Object.keys(searchResults).some(key => searchResults[key] && searchResults[key].length > 0) && (
          <div className="bg-white rounded-lg shadow-md border border-slate-200 overflow-hidden">
            {/* Tabs Navigation */}
            <div className="border-b border-slate-200">
              <div className="flex items-center gap-1 px-4">
                <button
                  onClick={() => handleTabChange('change_of_name')}
                  className={`px-6 py-3 text-sm font-medium transition-colors border-b-2 ${
                    activeTab === 'change_of_name'
                      ? 'border-[#022658] text-[#022658]'
                      : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    <span>Change of Name</span>
                    {getTabCount('change_of_name') > 0 && (
                      <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                        activeTab === 'change_of_name'
                          ? 'bg-[#E6ECF3] text-[#022658]'
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                        {getTabCount('change_of_name')}
                      </span>
                    )}
                  </div>
                </button>
                <button
                  onClick={() => handleTabChange('correction_of_place_of_birth')}
                  className={`px-6 py-3 text-sm font-medium transition-colors border-b-2 ${
                    activeTab === 'correction_of_place_of_birth'
                      ? 'border-[#022658] text-[#022658]'
                      : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    <span>Correction of Place of Birth</span>
                    {getTabCount('correction_of_place_of_birth') > 0 && (
                      <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                        activeTab === 'correction_of_place_of_birth'
                          ? 'bg-[#E6ECF3] text-[#022658]'
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                        {getTabCount('correction_of_place_of_birth')}
                      </span>
                    )}
                  </div>
                </button>
                <button
                  onClick={() => handleTabChange('correction_of_date_of_birth')}
                  className={`px-6 py-3 text-sm font-medium transition-colors border-b-2 ${
                    activeTab === 'correction_of_date_of_birth'
                      ? 'border-[#022658] text-[#022658]'
                      : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>Correction of Date of Birth</span>
                    {getTabCount('correction_of_date_of_birth') > 0 && (
                      <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                        activeTab === 'correction_of_date_of_birth'
                          ? 'bg-[#E6ECF3] text-[#022658]'
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                        {getTabCount('correction_of_date_of_birth')}
                      </span>
                    )}
                  </div>
                </button>
                <button
                  onClick={() => handleTabChange('marriage_officer')}
                  className={`px-6 py-3 text-sm font-medium transition-colors border-b-2 ${
                    activeTab === 'marriage_officer'
                      ? 'border-[#022658] text-[#022658]'
                      : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Database className="w-4 h-4" />
                    <span>Marriage Officers</span>
                    {getTabCount('marriage_officer') > 0 && (
                      <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                        activeTab === 'marriage_officer'
                          ? 'bg-[#E6ECF3] text-[#022658]'
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                        {getTabCount('marriage_officer')}
                      </span>
                    )}
                  </div>
                </button>
                <button
                  onClick={() => handleTabChange('judgements_rulings')}
                  className={`px-6 py-3 text-sm font-medium transition-colors border-b-2 ${
                    activeTab === 'judgements_rulings'
                      ? 'border-[#022658] text-[#022658]'
                      : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    <span>Judgements &amp; Rulings</span>
                    {getTabCount('judgements_rulings') > 0 && (
                      <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                        activeTab === 'judgements_rulings'
                          ? 'bg-[#E6ECF3] text-[#022658]'
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                        {getTabCount('judgements_rulings')}
                      </span>
                    )}
                  </div>
                </button>
              </div>
            </div>

            {/* Tab Content */}
            <div className="p-6">
              {/* Search/Filter Input */}
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    value={categoryFilter}
                    onChange={handleCategoryFilterChange}
                    placeholder={`Search within ${activeTab === 'change_of_name' ? 'Change of Name' : activeTab === 'correction_of_place_of_birth' ? 'Correction of Place of Birth' : activeTab === 'correction_of_date_of_birth' ? 'Correction of Date of Birth' : activeTab === 'marriage_officer' ? 'Marriage Officers' : 'Judgements & Rulings'} results...`}
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#022658] focus:border-[#022658] outline-none transition-colors"
                  />
                  {categoryFilter && (
                    <button
                      onClick={() => {
                        setCategoryFilter('');
                        setCategoryCurrentPage(1);
                      }}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Sort Controls and Results Count */}
              {(() => {
                const filteredResults = getCurrentTabResults();
                const paginatedResults = getPaginatedResults(filteredResults);
                const totalCategoryPages = getTotalCategoryPages();
                
                return (
                  <>
                    {filteredResults.length > 0 && (
                      <div className="flex items-center justify-between mb-4">
                        <p className="text-sm text-slate-600">
                          Showing <span className="font-semibold">{paginatedResults.length}</span> of <span className="font-semibold">{filteredResults.length}</span> result{filteredResults.length !== 1 ? 's' : ''}
                          {categoryFilter && (
                            <span className="ml-2 text-slate-500">
                              (filtered from {getTabCount(activeTab)} total)
                            </span>
                          )}
                        </p>
                        <button
                          onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                          title={`Sort ${sortOrder === 'asc' ? 'descending' : 'ascending'}`}
                        >
                          {sortOrder === 'asc' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
                          <span>Sort {sortOrder === 'asc' ? 'A-Z' : 'Z-A'}</span>
                        </button>
                      </div>
                    )}

                    {/* Results for Active Tab */}
                    {(() => {
                      const currentResults = paginatedResults;
                
                if (currentResults.length === 0) {
                  return (
                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-6 text-center">
                      <p className="text-slate-600">No results found in this category</p>
                    </div>
                  );
                }
                
                if (activeTab === 'change_of_name') {
                  return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      {currentResults.map((result) => (
                        <div key={`change_of_name-${result.id}`} className="group bg-white rounded-xl shadow-sm border border-slate-100 hover:shadow-xl hover:border-[#D4E1EA] transition-all duration-300 overflow-hidden">
                          <div className="p-5">
                            <div className="flex items-start justify-between gap-3 mb-4">
                              <h3 className="text-lg font-bold text-slate-900 leading-tight">{result.name}</h3>
                              {result.match_type === 'current_name' && (
                                <span className="px-3 py-1 text-xs font-semibold text-white bg-gradient-to-r from-green-500 to-green-600 rounded-full shadow-sm whitespace-nowrap">New Name</span>
                              )}
                              {result.match_type === 'old_name' && (
                                <span className="px-3 py-1 text-xs font-semibold text-white bg-gradient-to-r from-red-500 to-red-600 rounded-full shadow-sm whitespace-nowrap">Old Name</span>
                              )}
                              {result.match_type === 'alias' && (
                                <span className="px-3 py-1 text-xs font-semibold text-white bg-gradient-to-r from-orange-500 to-orange-600 rounded-full shadow-sm whitespace-nowrap">Alias Name</span>
                              )}
                            </div>
                            <div className="space-y-2.5 mb-4">
                              {result.current_name && result.current_name !== result.name && (
                                <div className="flex items-center gap-2.5">
                                  <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">New Name:</span>
                                  <span className="px-2.5 py-1 text-xs font-semibold text-white bg-gradient-to-r from-green-500 to-green-600 rounded-md">{result.current_name}</span>
                                </div>
                              )}
                              {result.old_name && result.old_name !== result.name && result.old_name !== result.current_name && (
                                <div className="flex items-center gap-2.5">
                                  <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Old Name:</span>
                                  <span className="px-2.5 py-1 text-xs font-semibold text-white bg-gradient-to-r from-red-500 to-red-600 rounded-md">{result.old_name}</span>
                                </div>
                              )}
                            </div>
                            {result.alias_names && result.alias_names.length > 0 && (
                              <div className="mb-4 pt-3 border-t border-slate-100">
                                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2.5">Aliases</p>
                                <div className="flex flex-wrap gap-2">
                                  {result.alias_names.map((alias, idx) => (
                                    <span key={idx} className="px-2.5 py-1 text-xs font-semibold text-white bg-gradient-to-r from-orange-500 to-orange-600 rounded-md shadow-sm">
                                      {alias}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                            <button
                              onClick={() => handleViewReport(result)}
                              className="mt-5 w-full px-4 py-2.5 bg-[#022658] text-white text-sm font-semibold rounded-lg hover:bg-[#033a7a] active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
                            >
                              <Eye className="w-4 h-4" />
                              View Report
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                }
                
                if (activeTab === 'correction_of_date_of_birth') {
                  return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      {currentResults.map((result) => (
                        <div key={`correction_of_date_of_birth-${result.id}`} className="group bg-white rounded-xl shadow-sm border border-slate-100 hover:shadow-xl hover:border-[#D4E1EA] transition-all duration-300 overflow-hidden">
                          <div className="p-5">
                            <div className="mb-4">
                              <h3 className="text-lg font-bold text-slate-900 leading-tight">{result.person_name || result.name}</h3>
                            </div>
                            <div className="space-y-2.5 mb-4">
                              {result.old_date_of_birth && (
                                <div className="flex items-center gap-2.5">
                                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide w-20">Old Date:</span>
                                  <span className="text-sm font-medium text-slate-700">{formatDate(result.old_date_of_birth)}</span>
                                </div>
                              )}
                              {result.new_date_of_birth && (
                                <div className="flex items-center gap-2.5">
                                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide w-20">New Date:</span>
                                  <span className="text-sm font-medium text-slate-700">{formatDate(result.new_date_of_birth)}</span>
                                </div>
                              )}
                            </div>
                            <button
                              onClick={() => handleViewReport(result)}
                              className="mt-5 w-full px-4 py-2.5 bg-[#022658] text-white text-sm font-semibold rounded-lg hover:bg-[#033a7a] active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
                            >
                              <Eye className="w-4 h-4" />
                              View Report
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                }
                
                if (activeTab === 'correction_of_place_of_birth') {
                  return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      {currentResults.map((result) => (
                        <div key={`correction_of_place_of_birth-${result.id}`} className="group bg-white rounded-xl shadow-sm border border-slate-100 hover:shadow-xl hover:border-[#D4E1EA] transition-all duration-300 overflow-hidden">
                          <div className="p-5">
                            <div className="mb-4">
                              <h3 className="text-lg font-bold text-slate-900 leading-tight">{result.person_name || result.name}</h3>
                            </div>
                            <div className="space-y-2.5 mb-4">
                              {result.old_place_of_birth && (
                                <div className="flex items-center gap-2.5">
                                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide w-20">Old Place:</span>
                                  <span className="text-sm font-medium text-slate-700">{result.old_place_of_birth}</span>
                                </div>
                              )}
                              {result.new_place_of_birth && (
                                <div className="flex items-center gap-2.5">
                                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide w-20">New Place:</span>
                                  <span className="text-sm font-medium text-slate-700">{result.new_place_of_birth}</span>
                                </div>
                              )}
                            </div>
                            <button
                              onClick={() => handleViewReport(result)}
                              className="mt-5 w-full px-4 py-2.5 bg-[#022658] text-white text-sm font-semibold rounded-lg hover:bg-[#033a7a] active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
                            >
                              <Eye className="w-4 h-4" />
                              View Report
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                }
                
                if (activeTab === 'marriage_officer') {
                  return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      {currentResults.map((result) => (
                        <div key={`marriage_officer-${result.id}`} className="group bg-white rounded-xl shadow-sm border border-slate-100 hover:shadow-xl hover:border-[#D4E1EA] transition-all duration-300 overflow-hidden">
                          <div className="p-5">
                            <div className="mb-4">
                              <h3 className="text-lg font-bold text-slate-900 leading-tight">{result.officer_name || result.name}</h3>
                            </div>
                            <div className="space-y-2.5 mb-4">
                              {result.church && (
                                <div className="flex items-center gap-2.5">
                                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide w-20">Church:</span>
                                  <span className="text-sm font-medium text-slate-700">{result.church}</span>
                                </div>
                              )}
                              {result.location && (
                                <div className="flex items-center gap-2.5">
                                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide w-20">Location:</span>
                                  <span className="text-sm font-medium text-slate-700">{result.location}</span>
                                </div>
                              )}
                              {result.region && (
                                <div className="flex items-center gap-2.5">
                                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide w-20">Region:</span>
                                  <span className="text-sm font-medium text-slate-700">{result.region}</span>
                                </div>
                              )}
                            </div>
                            <button
                              onClick={() => handleViewReport(result)}
                              className="mt-5 w-full px-4 py-2.5 bg-[#022658] text-white text-sm font-semibold rounded-lg hover:bg-[#033a7a] active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
                            >
                              <Eye className="w-4 h-4" />
                              View Report
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                }

                if (activeTab === 'judgements_rulings') {
                  return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      {currentResults.map((result) => (
                        <div key={`judgements_rulings-${result.id}`} className="group bg-white rounded-xl shadow-sm border border-slate-100 hover:shadow-xl hover:border-[#D4E1EA] transition-all duration-300 overflow-hidden">
                          <div className="p-5">
                            <div className="mb-4">
                              <h3 className="text-lg font-bold text-slate-900 leading-tight">{result.title || 'N/A'}</h3>
                            </div>
                            <div className="space-y-2.5 mb-4">
                              <div className="flex items-center gap-2.5">
                                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide w-24">Suit Ref:</span>
                                <span className="text-sm font-medium text-slate-700">{result.suit_reference_number || 'N/A'}</span>
                              </div>
                              <div className="flex items-center gap-2.5">
                                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide w-24">Court:</span>
                                <span className="text-sm font-medium text-slate-700">{getCourtTypeName(result.court_type)}</span>
                              </div>
                              <div className="flex items-center gap-2.5">
                                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide w-24">Date:</span>
                                <span className="text-sm font-medium text-slate-700">{formatDate(result.date)}</span>
                              </div>
                              <div className="flex items-center gap-2.5">
                                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide w-24">Progress:</span>
                                {(() => {
                                  const badge = getCaseProgressBadge(result.case_progress);
                                  return (
                                    <span className={`inline-flex px-2 py-1 rounded-lg text-xs font-medium ${badge.className}`}>
                                      {badge.text}
                                    </span>
                                  );
                                })()}
                              </div>
                            </div>
                            <div className="mt-5 flex flex-col gap-3">
                              <button
                                onClick={() => handleViewSummary(result)}
                                className="w-full px-4 py-2.5 bg-[#E6ECF3] text-[#022658] text-sm font-semibold rounded-lg hover:bg-[#D9E3F0] active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 shadow-sm hover:shadow-md"
                              >
                                <FileText className="w-4 h-4" />
                                View Summary
                              </button>
                              <button
                                onClick={() => handleViewCase(result)}
                                className="w-full px-4 py-2.5 bg-[#022658] text-white text-sm font-semibold rounded-lg hover:bg-[#033a7a] active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
                              >
                                <Eye className="w-4 h-4" />
                                View Case
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                }
                
                      return null;
                    })()}

                    {/* Category Pagination Controls */}
                    {totalCategoryPages > 1 && (
                      <div className="mt-6 flex items-center justify-between border-t border-slate-200 pt-6">
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <span>
                            Page <span className="font-semibold">{categoryCurrentPage}</span> of <span className="font-semibold">{totalCategoryPages}</span>
                          </span>
                          <span className="text-slate-400">•</span>
                          <span>
                            Showing <span className="font-semibold">{paginatedResults.length}</span> of <span className="font-semibold">{filteredResults.length}</span> result{filteredResults.length !== 1 ? 's' : ''}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleCategoryPageChange(categoryCurrentPage - 1)}
                            disabled={categoryCurrentPage === 1}
                            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-2 ${
                              categoryCurrentPage === 1
                                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-300 hover:border-slate-400'
                            }`}
                          >
                            <ChevronLeft className="w-4 h-4" />
                            Previous
                          </button>
                          <div className="flex items-center gap-1">
                            {Array.from({ length: Math.min(5, totalCategoryPages) }, (_, i) => {
                              let pageNum;
                              if (totalCategoryPages <= 5) {
                                pageNum = i + 1;
                              } else if (categoryCurrentPage <= 3) {
                                pageNum = i + 1;
                              } else if (categoryCurrentPage >= totalCategoryPages - 2) {
                                pageNum = totalCategoryPages - 4 + i;
                              } else {
                                pageNum = categoryCurrentPage - 2 + i;
                              }
                              return (
                                <button
                                  key={pageNum}
                                  onClick={() => handleCategoryPageChange(pageNum)}
                                  className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                                    categoryCurrentPage === pageNum
                                      ? 'bg-[#022658] text-white'
                                      : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-300 hover:border-slate-400'
                                  }`}
                                >
                                  {pageNum}
                                </button>
                              );
                            })}
                          </div>
                          <button
                            onClick={() => handleCategoryPageChange(categoryCurrentPage + 1)}
                            disabled={categoryCurrentPage === totalCategoryPages}
                            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-2 ${
                              categoryCurrentPage === totalCategoryPages
                                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-300 hover:border-slate-400'
                            }`}
                          >
                            Next
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                );
              })()}
            </div>
          </div>
        )}

{/* No Results Message */}
        {!isSearching && searchResults && Object.keys(searchResults).every(key => !searchResults[key] || searchResults[key].length === 0) && (
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-6 text-center">
            <p className="text-slate-600">No results found for "<span className="font-semibold">{searchQuery}</span>"</p>
          </div>
        )}

        {/* Details Modal */}
        {showDetailsModal && (
          <>
            {/* Overlay */}
            <div
              className="fixed inset-0 bg-black bg-opacity-50 z-50 backdrop-blur-sm"
              onClick={handleCloseModal}
            ></div>

            {/* Modal */}
            <div
              className="fixed left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-2xl z-50 p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={handleCloseModal}
                className="absolute top-6 right-6 w-6 h-6 flex items-center justify-center hover:opacity-70 transition-opacity"
              >
                <X className="w-6 h-6 text-slate-700" />
              </button>

              {/* Modal Content */}
              <div className="pr-8">
                {/* Action Buttons */}
                <div className="flex items-center gap-3 mb-4 justify-end">
                  <button
                    onClick={handlePrint}
                    className="flex items-center gap-2 px-4 py-2 bg-[#E6ECF3] hover:bg-[#D9E3F0] text-[#022658] text-sm font-medium rounded-lg transition-colors"
                    title="Print record"
                  >
                    <Printer className="w-4 h-4" />
                    Print
                  </button>
                  <button
                    onClick={handleExport}
                    className="flex items-center gap-2 px-4 py-2 bg-[#E6ECF3] hover:bg-[#D9E3F0] text-[#022658] text-sm font-medium rounded-lg transition-colors"
                    title="Export record"
                  >
                    <Download className="w-4 h-4" />
                    Export
                  </button>
                  <button
                    onClick={handleReportIssue}
                    className="flex items-center gap-2 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 text-sm font-medium rounded-lg transition-colors"
                    title="Report an issue"
                  >
                    <Flag className="w-4 h-4" />
                    Report Issue
                  </button>
                </div>
                
                <h2 className="text-2xl font-bold text-slate-900 mb-6">
                  {(() => {
                    const dataSource = selectedRecord?.data_source || 'Record Details';
                    let personName = '';
                    
                    if (recordDetails) {
                      if (recordDetails.source_type === 'change_of_name') {
                        personName = recordDetails.current_name || recordDetails.old_name || '';
                      } else if (recordDetails.source_type === 'correction_of_date_of_birth' || recordDetails.source_type === 'correction_of_place_of_birth') {
                        personName = recordDetails.person_name || '';
                      } else if (recordDetails.source_type === 'marriage_officer') {
                        personName = recordDetails.officer_name || '';
                      }
                    } else if (selectedRecord) {
                      // Fallback to selectedRecord if recordDetails not loaded yet
                      personName = selectedRecord.current_name || selectedRecord.name || selectedRecord.person_name || selectedRecord.officer_name || '';
                    }
                    
                    if (personName) {
                      if (dataSource === 'Change of Name') {
                        return `${dataSource} for ${personName}`;
                      } else if (dataSource === 'Correction of Date of Birth') {
                        return `${dataSource} for ${personName}`;
                      } else if (dataSource === 'Correction of Place of Birth') {
                        return `${dataSource} for ${personName}`;
                      } else if (dataSource === 'Marriage Officer') {
                        return `${dataSource}: ${personName}`;
                      }
                      return `${dataSource} for ${personName}`;
                    }
                    
                    return dataSource;
                  })()}
                </h2>

                {loadingDetails ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#022658]"></div>
                  </div>
                ) : recordDetails ? (
                  <div className="space-y-6">
                    {/* Change of Name Details */}
                    {recordDetails.source_type === 'change_of_name' && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {recordDetails.current_name && (
                          <div>
                            <label className="block text-sm font-medium text-slate-500 mb-1">New Name</label>
                            <p className="text-base text-slate-900 font-semibold">{recordDetails.current_name}</p>
                          </div>
                        )}
                        {recordDetails.old_name && (
                          <div>
                            <label className="block text-sm font-medium text-slate-500 mb-1">Old Name</label>
                            <p className="text-base text-slate-900 font-semibold">{recordDetails.old_name}</p>
                          </div>
                        )}
                        {recordDetails.alias_names && recordDetails.alias_names.length > 0 && (
                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-slate-500 mb-2">Aliases</label>
                            <div className="flex flex-wrap gap-2">
                              {recordDetails.alias_names.map((alias, idx) => (
                                <span key={idx} className="px-3 py-1 text-sm font-medium text-white bg-orange-600 rounded">
                                  {alias}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        {recordDetails.profession && (
                          <div>
                            <label className="block text-sm font-medium text-slate-500 mb-1">Profession</label>
                            <p className="text-base text-slate-900">{recordDetails.profession}</p>
                          </div>
                        )}
                        {recordDetails.gender && (
                          <div>
                            <label className="block text-sm font-medium text-slate-500 mb-1">Gender</label>
                            <p className="text-base text-slate-900">{recordDetails.gender}</p>
                          </div>
                        )}
                        {recordDetails.address && (
                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-slate-500 mb-1">Address</label>
                            <p className="text-base text-slate-900">{recordDetails.address}</p>
                          </div>
                        )}
                        {recordDetails.town_city && (
                          <div>
                            <label className="block text-sm font-medium text-slate-500 mb-1">Town/City</label>
                            <p className="text-base text-slate-900">{recordDetails.town_city}</p>
                          </div>
                        )}
                        {recordDetails.region && (
                          <div>
                            <label className="block text-sm font-medium text-slate-500 mb-1">Region</label>
                            <p className="text-base text-slate-900">{recordDetails.region}</p>
                          </div>
                        )}
                        {recordDetails.gazette_number && (
                          <div>
                            <label className="block text-sm font-medium text-slate-500 mb-1">Gazette Number</label>
                            <p className="text-base text-slate-900">{recordDetails.gazette_number}</p>
                          </div>
                        )}
                        {recordDetails.gazette_date && (
                          <div>
                            <label className="block text-sm font-medium text-slate-500 mb-1">Gazette Date</label>
                            <p className="text-base text-slate-900">{formatDate(recordDetails.gazette_date)}</p>
                          </div>
                        )}
                        {recordDetails.page_number && (
                          <div>
                            <label className="block text-sm font-medium text-slate-500 mb-1">Page Number</label>
                            <p className="text-base text-slate-900">{recordDetails.page_number}</p>
                          </div>
                        )}
                        {recordDetails.effective_date && (
                          <div>
                            <label className="block text-sm font-medium text-slate-500 mb-1">Effective Date</label>
                            <p className="text-base text-slate-900">{formatDate(recordDetails.effective_date)}</p>
                          </div>
                        )}
                        {recordDetails.source && (
                          <div>
                            <label className="block text-sm font-medium text-slate-500 mb-1">Source</label>
                            <p className="text-base text-slate-900">{recordDetails.source}</p>
                          </div>
                        )}
                        {recordDetails.source_details && (
                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-slate-500 mb-1">Source Details</label>
                            <p className="text-base text-slate-900">{recordDetails.source_details}</p>
                          </div>
                        )}
                        {recordDetails.remarks && (
                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-slate-500 mb-1">Remarks</label>
                            <p className="text-base text-slate-900">{recordDetails.remarks}</p>
                          </div>
                        )}
                        {recordDetails.item_number && (
                          <div>
                            <label className="block text-sm font-medium text-slate-500 mb-1">Item Number</label>
                            <p className="text-base text-slate-900">{recordDetails.item_number}</p>
                          </div>
                        )}
                        {recordDetails.document_filename && (
                          <div>
                            <label className="block text-sm font-medium text-slate-500 mb-1">Document Filename</label>
                            <p className="text-base text-slate-900">{recordDetails.document_filename}</p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Correction of Date of Birth Details */}
                    {recordDetails.source_type === 'correction_of_date_of_birth' && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {recordDetails.person_name && (
                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-slate-500 mb-1">Person Name</label>
                            <p className="text-base text-slate-900 font-semibold">{recordDetails.person_name}</p>
                          </div>
                        )}
                        {recordDetails.old_date_of_birth && (
                          <div>
                            <label className="block text-sm font-medium text-slate-500 mb-1">Old Date of Birth</label>
                            <p className="text-base text-slate-900">{formatDate(recordDetails.old_date_of_birth)}</p>
                          </div>
                        )}
                        {recordDetails.new_date_of_birth && (
                          <div>
                            <label className="block text-sm font-medium text-slate-500 mb-1">New Date of Birth</label>
                            <p className="text-base text-slate-900">{formatDate(recordDetails.new_date_of_birth)}</p>
                          </div>
                        )}
                        {recordDetails.effective_date && (
                          <div>
                            <label className="block text-sm font-medium text-slate-500 mb-1">Effective Date</label>
                            <p className="text-base text-slate-900">{formatDate(recordDetails.effective_date)}</p>
                          </div>
                        )}
                        {recordDetails.gazette_number && (
                          <div>
                            <label className="block text-sm font-medium text-slate-500 mb-1">Gazette Number</label>
                            <p className="text-base text-slate-900">{recordDetails.gazette_number}</p>
                          </div>
                        )}
                        {recordDetails.gazette_date && (
                          <div>
                            <label className="block text-sm font-medium text-slate-500 mb-1">Gazette Date</label>
                            <p className="text-base text-slate-900">{formatDate(recordDetails.gazette_date)}</p>
                          </div>
                        )}
                        {recordDetails.page_number && (
                          <div>
                            <label className="block text-sm font-medium text-slate-500 mb-1">Page Number</label>
                            <p className="text-base text-slate-900">{recordDetails.page_number}</p>
                          </div>
                        )}
                        {recordDetails.source_details && (
                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-slate-500 mb-1">Source Details</label>
                            <p className="text-base text-slate-900">{recordDetails.source_details}</p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Correction of Place of Birth Details */}
                    {recordDetails.source_type === 'correction_of_place_of_birth' && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {recordDetails.person_name && (
                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-slate-500 mb-1">Person Name</label>
                            <p className="text-base text-slate-900 font-semibold">{recordDetails.person_name}</p>
                          </div>
                        )}
                        {recordDetails.alias && (
                          <div>
                            <label className="block text-sm font-medium text-slate-500 mb-1">Alias</label>
                            <p className="text-base text-slate-900">{recordDetails.alias}</p>
                          </div>
                        )}
                        {recordDetails.old_place_of_birth && (
                          <div>
                            <label className="block text-sm font-medium text-slate-500 mb-1">Old Place of Birth</label>
                            <p className="text-base text-slate-900">{recordDetails.old_place_of_birth}</p>
                          </div>
                        )}
                        {recordDetails.new_place_of_birth && (
                          <div>
                            <label className="block text-sm font-medium text-slate-500 mb-1">New Place of Birth</label>
                            <p className="text-base text-slate-900">{recordDetails.new_place_of_birth}</p>
                          </div>
                        )}
                        {recordDetails.effective_date && (
                          <div>
                            <label className="block text-sm font-medium text-slate-500 mb-1">Effective Date</label>
                            <p className="text-base text-slate-900">{formatDate(recordDetails.effective_date)}</p>
                          </div>
                        )}
                        {recordDetails.gazette_number && (
                          <div>
                            <label className="block text-sm font-medium text-slate-500 mb-1">Gazette Number</label>
                            <p className="text-base text-slate-900">{recordDetails.gazette_number}</p>
                          </div>
                        )}
                        {recordDetails.gazette_date && (
                          <div>
                            <label className="block text-sm font-medium text-slate-500 mb-1">Gazette Date</label>
                            <p className="text-base text-slate-900">{formatDate(recordDetails.gazette_date)}</p>
                          </div>
                        )}
                        {recordDetails.page_number && (
                          <div>
                            <label className="block text-sm font-medium text-slate-500 mb-1">Page Number</label>
                            <p className="text-base text-slate-900">{recordDetails.page_number}</p>
                          </div>
                        )}
                        {recordDetails.source_details && (
                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-slate-500 mb-1">Source Details</label>
                            <p className="text-base text-slate-900">{recordDetails.source_details}</p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Marriage Officer Details */}
                    {recordDetails.source_type === 'marriage_officer' && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {recordDetails.officer_name && (
                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-slate-500 mb-1">Officer Name</label>
                            <p className="text-base text-slate-900 font-semibold">{recordDetails.officer_name}</p>
                          </div>
                        )}
                        {recordDetails.church && (
                          <div>
                            <label className="block text-sm font-medium text-slate-500 mb-1">Church</label>
                            <p className="text-base text-slate-900">{recordDetails.church}</p>
                          </div>
                        )}
                        {recordDetails.location && (
                          <div>
                            <label className="block text-sm font-medium text-slate-500 mb-1">Location</label>
                            <p className="text-base text-slate-900">{recordDetails.location}</p>
                          </div>
                        )}
                        {recordDetails.region && (
                          <div>
                            <label className="block text-sm font-medium text-slate-500 mb-1">Region</label>
                            <p className="text-base text-slate-900">{recordDetails.region}</p>
                          </div>
                        )}
                        {recordDetails.appointing_authority && (
                          <div>
                            <label className="block text-sm font-medium text-slate-500 mb-1">Appointing Authority</label>
                            <p className="text-base text-slate-900">{recordDetails.appointing_authority}</p>
                          </div>
                        )}
                        {recordDetails.appointing_authority_title && (
                          <div>
                            <label className="block text-sm font-medium text-slate-500 mb-1">Appointing Authority Title</label>
                            <p className="text-base text-slate-900">{recordDetails.appointing_authority_title}</p>
                          </div>
                        )}
                        {recordDetails.appointment_date && (
                          <div>
                            <label className="block text-sm font-medium text-slate-500 mb-1">Appointment Date</label>
                            <p className="text-base text-slate-900">{formatDate(recordDetails.appointment_date)}</p>
                          </div>
                        )}
                        {recordDetails.gazette_number && (
                          <div>
                            <label className="block text-sm font-medium text-slate-500 mb-1">Gazette Number</label>
                            <p className="text-base text-slate-900">{recordDetails.gazette_number}</p>
                          </div>
                        )}
                        {recordDetails.gazette_date && (
                          <div>
                            <label className="block text-sm font-medium text-slate-500 mb-1">Gazette Date</label>
                            <p className="text-base text-slate-900">{formatDate(recordDetails.gazette_date)}</p>
                          </div>
                        )}
                        {recordDetails.page_number && (
                          <div>
                            <label className="block text-sm font-medium text-slate-500 mb-1">Page Number</label>
                            <p className="text-base text-slate-900">{recordDetails.page_number}</p>
                          </div>
                        )}
                        {recordDetails.source_details && (
                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-slate-500 mb-1">Source Details</label>
                            <p className="text-base text-slate-900">{recordDetails.source_details}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-slate-600">Failed to load record details</p>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* Summary Modal */}
        {showSummaryModal && (
          <>
            <div
              className="fixed inset-0 bg-black bg-opacity-50 z-50 backdrop-blur-sm"
              onClick={handleCloseSummary}
            ></div>

            <div
              className="fixed left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-2xl z-50 p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={handleCloseSummary}
                className="absolute top-6 right-6 w-6 h-6 flex items-center justify-center hover:opacity-70 transition-opacity"
              >
                <X className="w-6 h-6 text-slate-700" />
              </button>

              <div className="pr-8">
                <div className="mb-4">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Summary</span>
                  <h3 className="text-xl font-bold text-slate-900 mt-2">
                    {summaryRecord?.title || 'Case Summary'}
                  </h3>
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-sm text-slate-700 whitespace-pre-wrap">
                  {summaryRecord?.case_summary || 'Summary not available for this case yet.'}
                </div>
              </div>
            </div>
          </>
        )}

        {/* Report Issue Modal */}
        {showReportIssueModal && (
          <>
            {/* Overlay */}
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
              onClick={() => setShowReportIssueModal(false)}
            ></div>

            {/* Modal */}
            <div
              className="fixed left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-2xl z-[60] max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
              style={{ boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}
            >
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-red-600 to-red-700 px-6 py-4 border-b border-red-800/20 rounded-t-2xl">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <Flag className="w-5 h-5" />
                    Report an Issue
                  </h3>
                  <button
                    onClick={() => setShowReportIssueModal(false)}
                    className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/20 transition-colors text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Modal Content */}
              <form onSubmit={handleIssueSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Subject <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={issueReport.subject}
                    onChange={(e) => setIssueReport({ ...issueReport, subject: e.target.value })}
                    placeholder="Brief description of the issue"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    required
                    value={issueReport.description}
                    onChange={(e) => setIssueReport({ ...issueReport, description: e.target.value })}
                    placeholder="Please provide detailed information about the issue..."
                    rows={5}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-colors resize-none"
                  />
                </div>
                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowReportIssueModal(false)}
                    className="flex-1 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white text-sm font-semibold rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
                  >
                    Submit Report
                  </button>
                </div>
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  );

  // Render based on current view
  return showResults ? renderResultsView() : renderSearchForm();
};

export default PersonSearchPage;
