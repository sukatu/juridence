import React, { useState, useRef, useEffect } from 'react';
import { ArrowUpDown, CalendarDays, ChevronLeft, ChevronRight, Edit, FileSearch, FileText, Filter, Landmark, Loader2, Plus, Search, Trash2, X } from 'lucide-react';
import RegistrarCaseDetailsPage from '../RegistrarCaseDetailsPage';
import AddNewCaseForm from '../AddNewCaseForm';
import AdminHeader from './AdminHeader';
import RegistrarHeader from '../RegistrarHeader';
import NotificationContainer from '../NotificationContainer';
import useNotifications from '../../hooks/useNotifications';
import { apiGet, apiPost, apiPut, apiDelete } from '../../utils/api';
import ConfirmDialog from './ConfirmDialog';
import { Badge, Button, IconButton, Input, PageHeader, Select } from '../ui';

const getStatusPresentation = (rawStatus) => {
  const status = String(rawStatus || '').toLowerCase();
  if (['active', '1', 'open', 'ongoing'].includes(status)) return { label: 'Active', variant: 'info' };
  if (['heard', 'completed', 'closed'].includes(status)) return { label: status === 'closed' ? 'Closed' : 'Heard', variant: 'success' };
  if (status === 'adjourned') return { label: 'Adjourned', variant: 'warning' };
  if (status === 'pending') return { label: 'Pending', variant: 'warning' };
  if (['dismissed', 'rejected'].includes(status)) return { label: 'Dismissed', variant: 'danger' };
  return { label: rawStatus || 'Not set', variant: 'neutral' };
};

const CaseProfilePage = ({ userInfo, onNavigate, onLogout, isRegistrar }) => {
  const [searchQuery, setSearchQuery] = useState('');
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
              if (backTarget?.type === 'person_search') {
                if (backTarget?.state) {
                  sessionStorage.setItem('personSearchState', JSON.stringify(backTarget.state));
                }
                sessionStorage.removeItem('caseBackTarget');
                onNavigate('person-search');
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
  const activeFilterCount = [filterCourtType, filterRegion, filterYear].filter(Boolean).length;
  const pageNumbers = Array.from({ length: Math.min(5, totalPages) }, (_, index) => {
    if (totalPages <= 5) return index + 1;
    if (currentPage <= 3) return index + 1;
    if (currentPage >= totalPages - 2) return totalPages - 4 + index;
    return currentPage - 2 + index;
  });

  const clearFilters = () => {
    setFilterCourtType('');
    setFilterRegion('');
    setFilterYear('');
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-[#f4f7f8]">
      <HeaderComponent userInfo={displayUserInfo} onNavigate={onNavigate} onLogout={onLogout} contextLabel="Case profiles" />

      <main className="mx-auto max-w-[1440px] px-4 py-7 sm:px-6 lg:px-8 lg:py-9">
        <PageHeader
          eyebrow={isRegistrar ? 'High Court (Commercial)' : 'Legal records'}
          title="Case profiles"
          description="Search, review, and maintain case records across the Juridence database."
          actions={(
            <>
              <Button variant="outline" icon={<CalendarDays size={16} />} onClick={() => onNavigate('case-hearings')}>View cause list</Button>
              <Button icon={<Plus size={16} />} onClick={() => setShowAddCaseForm(true)}>Add case</Button>
            </>
          )}
        />

        <section className="relative overflow-visible rounded-md border border-[#dce5e9] bg-white shadow-[0_3px_12px_rgba(10,35,53,0.04)]" aria-labelledby="case-records-heading">
          <div className="flex flex-col gap-4 border-b border-[#e3eaed] px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-md bg-[#e7f0f8] text-[#245b8f]"><FileText size={19} /></span>
              <div>
                <h2 id="case-records-heading" className="font-semibold text-[#17334a]">Case records</h2>
                <p className="mt-0.5 text-xs text-[#71818a]">{totalCases.toLocaleString()} records in the current view</p>
              </div>
            </div>
            <p className="text-xs text-[#71818a]">Showing {cases.length > 0 ? `${startItem}-${endItem}` : '0'} of {totalCases.toLocaleString()}</p>
          </div>

          <div className="overflow-x-auto border-b border-[#e3eaed] px-4 pt-2 sm:px-6" role="tablist" aria-label="Case status">
            <div className="flex min-w-max gap-1">
              {['All', 'Open', 'Pending', 'Adjourned', 'Heard'].map((tab) => (
                <button
                  key={tab}
                  type="button"
                  role="tab"
                  aria-selected={activeTab === tab}
                  onClick={() => setActiveTab(tab)}
                  className={`relative h-11 px-3 text-sm font-semibold transition-colors ${activeTab === tab ? 'text-[#0c6b4a]' : 'text-[#60737d] hover:text-[#17334a]'}`}
                >
                  {tab}
                  {activeTab === tab && <span className="absolute inset-x-2 bottom-0 h-0.5 bg-[#17875a]" />}
                </button>
              ))}
            </div>
          </div>

          <div className="border-b border-[#e3eaed] px-4 py-4 sm:px-6">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <Input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search by case title, suit number, or party"
                leadingIcon={<Search size={17} />}
                className="w-full lg:max-w-xl"
                aria-label="Search case profiles"
              />

              <div className="flex flex-wrap items-center gap-2">
                <div ref={filterDropdownRef} className="relative">
                  <Button
                    variant={activeFilterCount ? 'secondary' : 'outline'}
                    icon={<Filter size={16} />}
                    onClick={() => {
                      setShowFilterDropdown((open) => !open);
                      setShowSortDropdown(false);
                    }}
                  >
                    Filters{activeFilterCount ? ` (${activeFilterCount})` : ''}
                  </Button>
                  {showFilterDropdown && (
                    <div className="absolute left-0 z-40 mt-2 w-[300px] max-w-[calc(100vw-32px)] rounded-md border border-[#d7e1e5] bg-white p-4 shadow-[0_14px_36px_rgba(10,35,53,0.16)] sm:left-auto sm:right-0">
                      <div className="space-y-4">
                        <Select label="Court type" value={filterCourtType} onChange={(event) => { setFilterCourtType(event.target.value); setCurrentPage(1); }}>
                          <option value="">All court types</option>
                          <option value="SC">Supreme Court</option>
                          <option value="CA">Court of Appeal</option>
                          <option value="HC">High Court</option>
                          <option value="CC">Circuit Court</option>
                          <option value="DC">District Court</option>
                        </Select>
                        <Select label="Region" value={filterRegion} onChange={(event) => { setFilterRegion(event.target.value); setCurrentPage(1); }}>
                          <option value="">All regions</option>
                          {['Greater Accra Region', 'Ashanti Region', 'Western Region', 'Western North Region', 'Eastern Region', 'Central Region', 'Northern Region', 'Volta Region', 'Upper East Region', 'Upper West Region', 'Bono Region', 'Ahafo Region', 'Bono East Region', 'Oti Region', 'Savannah Region', 'North East Region'].map((region) => <option key={region} value={region}>{region}</option>)}
                        </Select>
                        <Input label="Year" value={filterYear} maxLength={4} inputMode="numeric" placeholder="YYYY" onChange={(event) => { setFilterYear(event.target.value.replace(/\D/g, '').slice(0, 4)); setCurrentPage(1); }} />
                      </div>
                      <div className="mt-4 flex items-center justify-between border-t border-[#e3eaed] pt-3">
                        <Button variant="ghost" size="sm" disabled={!activeFilterCount} onClick={clearFilters}>Clear</Button>
                        <Button size="sm" onClick={() => setShowFilterDropdown(false)}>Done</Button>
                      </div>
                    </div>
                  )}
                </div>

                <div ref={sortDropdownRef} className="relative">
                  <Button
                    variant="outline"
                    icon={<ArrowUpDown size={16} />}
                    onClick={() => {
                      setShowSortDropdown((open) => !open);
                      setShowFilterDropdown(false);
                    }}
                  >
                    Sort
                  </Button>
                  {showSortDropdown && (
                    <div className="absolute left-0 z-40 mt-2 w-60 max-w-[calc(100vw-32px)] rounded-md border border-[#d7e1e5] bg-white p-4 shadow-[0_14px_36px_rgba(10,35,53,0.16)] sm:left-auto sm:right-0">
                      <div className="space-y-4">
                        <Select label="Sort by" value={sortBy} onChange={(event) => { setSortBy(event.target.value); setCurrentPage(1); }}>
                          <option value="date">Date filed</option>
                          <option value="title">Case title</option>
                          <option value="suit_reference_number">Suit number</option>
                          <option value="status">Status</option>
                          <option value="updated_at">Last updated</option>
                        </Select>
                        <Select label="Order" value={sortOrder} onChange={(event) => { setSortOrder(event.target.value); setCurrentPage(1); }}>
                          <option value="desc">Descending</option>
                          <option value="asc">Ascending</option>
                        </Select>
                      </div>
                      <div className="mt-4 flex justify-end border-t border-[#e3eaed] pt-3"><Button size="sm" onClick={() => setShowSortDropdown(false)}>Done</Button></div>
                    </div>
                  )}
                </div>

                {(searchQuery || activeFilterCount > 0) && (
                  <Button variant="ghost" icon={<X size={15} />} onClick={() => { setSearchQuery(''); clearFilters(); }}>Clear</Button>
                )}
              </div>
            </div>

            {activeFilterCount > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {filterCourtType && <button type="button" onClick={() => setFilterCourtType('')} className="flex min-h-8 items-center gap-1.5 rounded-md bg-[#eef4f5] px-2.5 text-xs font-medium text-[#405867]">Court: {filterCourtType}<X size={13} /></button>}
                {filterRegion && <button type="button" onClick={() => setFilterRegion('')} className="flex min-h-8 items-center gap-1.5 rounded-md bg-[#eef4f5] px-2.5 text-xs font-medium text-[#405867]">{filterRegion}<X size={13} /></button>}
                {filterYear && <button type="button" onClick={() => setFilterYear('')} className="flex min-h-8 items-center gap-1.5 rounded-md bg-[#eef4f5] px-2.5 text-xs font-medium text-[#405867]">Year: {filterYear}<X size={13} /></button>}
              </div>
            )}
          </div>

          {loading ? (
            <div className="flex min-h-[320px] items-center justify-center gap-3 text-sm text-[#60737d]"><Loader2 size={20} className="animate-spin text-[#17875a]" /> Loading case records</div>
          ) : cases.length === 0 ? (
            <div className="flex min-h-[320px] flex-col items-center justify-center px-6 text-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#eef4f5] text-[#607985]"><FileSearch size={22} /></span>
              <h3 className="mt-4 font-semibold text-[#17334a]">No cases found</h3>
              <p className="mt-1 max-w-md text-sm leading-6 text-[#71818a]">Adjust the search or filters to broaden the case list.</p>
            </div>
          ) : (
            <>
              <div className="hidden overflow-x-auto lg:block">
                <table className="w-full min-w-[1040px] table-fixed">
                  <thead className="bg-[#f5f8f9]">
                    <tr>
                      <th className="w-[30%] px-5 py-3 text-left">Case title</th>
                      <th className="w-[13%] px-4 py-3 text-left">Suit number</th>
                      <th className="w-[10%] px-4 py-3 text-left">Filed</th>
                      <th className="w-[11%] px-4 py-3 text-left">Updated</th>
                      <th className="w-[16%] px-4 py-3 text-left">Judge</th>
                      <th className="w-[10%] px-4 py-3 text-left">Status</th>
                      <th className="w-[10%] px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e7edef]">
                    {cases.map((caseItem) => {
                      const status = getStatusPresentation(caseItem.status);
                      return (
                        <tr key={caseItem.id} className="transition-colors hover:bg-[#f8faf9]">
                          <td className="px-5 py-4 align-top">
                            <button type="button" onClick={() => handleCaseClick(caseItem)} className="min-h-0 text-left text-sm font-semibold leading-5 text-[#17334a] hover:text-[#0c6b4a]">{caseItem.title || 'Untitled case'}</button>
                            {(caseItem.court_type || caseItem.town) && <p className="mt-1 text-xs text-[#829099]">{[caseItem.court_type, caseItem.town].filter(Boolean).join(' · ')}</p>}
                          </td>
                          <td className="px-4 py-4 align-top text-sm font-medium text-[#405867]">{caseItem.suit_reference_number || 'Not recorded'}</td>
                          <td className="px-4 py-4 align-top text-sm text-[#526773]">{formatDate(caseItem.date)}</td>
                          <td className="px-4 py-4 align-top text-sm text-[#526773]">{formatDate(caseItem.updated_at)}</td>
                          <td className="px-4 py-4 align-top text-sm text-[#526773]">{caseItem.presiding_judge || 'Not assigned'}</td>
                          <td className="px-4 py-4 align-top"><Badge variant={status.variant}>{status.label}</Badge></td>
                          <td className="px-4 py-3 align-top">
                            <div className="flex justify-end gap-1">
                              <IconButton label="Edit case" variant="ghost" size="sm" onClick={() => handleEditCase(caseItem)}><Edit size={16} /></IconButton>
                              <IconButton label="Delete case" variant="ghost" size="sm" className="text-[#b52f3f] hover:!bg-[#fff0f1]" onClick={() => handleDeleteCase(caseItem)}><Trash2 size={16} /></IconButton>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="divide-y divide-[#e7edef] lg:hidden">
                {cases.map((caseItem) => {
                  const status = getStatusPresentation(caseItem.status);
                  return (
                    <article key={caseItem.id} className="px-4 py-5 sm:px-6">
                      <div className="flex items-start justify-between gap-3">
                        <Badge variant={status.variant}>{status.label}</Badge>
                        <div className="flex gap-1">
                          <IconButton label="Edit case" variant="ghost" size="sm" onClick={() => handleEditCase(caseItem)}><Edit size={16} /></IconButton>
                          <IconButton label="Delete case" variant="ghost" size="sm" className="text-[#b52f3f]" onClick={() => handleDeleteCase(caseItem)}><Trash2 size={16} /></IconButton>
                        </div>
                      </div>
                      <button type="button" onClick={() => handleCaseClick(caseItem)} className="mt-3 min-h-0 w-full text-left text-[15px] font-semibold leading-6 text-[#17334a]">{caseItem.title || 'Untitled case'}</button>
                      <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-4 text-sm">
                        <div><dt className="text-xs text-[#7a8991]">Suit number</dt><dd className="mt-1 break-words font-semibold text-[#405867]">{caseItem.suit_reference_number || 'Not recorded'}</dd></div>
                        <div><dt className="flex items-center gap-1 text-xs text-[#7a8991]"><CalendarDays size={13} /> Filed</dt><dd className="mt-1 font-medium text-[#405867]">{formatDate(caseItem.date)}</dd></div>
                        <div><dt className="text-xs text-[#7a8991]">Last updated</dt><dd className="mt-1 font-medium text-[#405867]">{formatDate(caseItem.updated_at)}</dd></div>
                        <div><dt className="flex items-center gap-1 text-xs text-[#7a8991]"><Landmark size={13} /> Judge</dt><dd className="mt-1 font-medium text-[#405867]">{caseItem.presiding_judge || 'Not assigned'}</dd></div>
                      </dl>
                    </article>
                  );
                })}
              </div>
            </>
          )}

          <div className="flex flex-col gap-4 border-t border-[#e3eaed] px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
            <p className="text-xs text-[#71818a]">{cases.length > 0 ? `${startItem}-${endItem} of ${totalCases.toLocaleString()}` : '0 records'}</p>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="flex items-center gap-1.5">
                <IconButton label="Previous page" variant="outline" size="sm" disabled={currentPage === 1} onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}><ChevronLeft size={16} /></IconButton>
                <div className="hidden items-center gap-1 sm:flex">
                  {pageNumbers.map((pageNumber) => (
                    <button key={pageNumber} type="button" onClick={() => setCurrentPage(pageNumber)} className={`flex h-9 min-w-9 items-center justify-center rounded-md border px-2 text-xs font-semibold ${currentPage === pageNumber ? 'border-[#0c6b4a] bg-[#0c6b4a] text-white' : 'border-[#d4dfe3] bg-white text-[#526773] hover:bg-[#f2f6f6]'}`}>{pageNumber}</button>
                  ))}
                </div>
                <span className="px-2 text-xs font-medium text-[#526773] sm:hidden">Page {currentPage} of {totalPages}</span>
                <IconButton label="Next page" variant="outline" size="sm" disabled={currentPage === totalPages} onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}><ChevronRight size={16} /></IconButton>
              </div>
              <div className="flex items-center gap-2 text-sm text-[#526773]">
                <span>Go to</span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={goToPage}
                  onChange={(event) => { if (event.target.value === '' || /^\d+$/.test(event.target.value)) setGoToPage(event.target.value); }}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      const targetPage = parseInt(goToPage, 10);
                      if (targetPage >= 1 && targetPage <= totalPages) setCurrentPage(targetPage);
                      else setGoToPage(currentPage.toString());
                    }
                  }}
                  className="ui-control !min-h-9 h-9 w-14 px-2 text-center"
                  aria-label="Go to page"
                />
                <Button size="sm" variant="outline" onClick={() => {
                  const targetPage = parseInt(goToPage, 10);
                  if (targetPage >= 1 && targetPage <= totalPages) setCurrentPage(targetPage);
                  else setGoToPage(currentPage.toString());
                }}>Go</Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <NotificationContainer
        notifications={notifications}
        onRemove={removeNotification}
      />

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

