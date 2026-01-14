import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  Gavel, 
  Scale, 
  Users, 
  MapPin, 
  Building2, 
  FileText, 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Trash2, 
  Plus,
  Save,
  X,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

const CaseHearingManagement = () => {
  const [hearings, setHearings] = useState([]);
  const [cases, setCases] = useState([]);
  const [courts, setCourts] = useState([]);
  const [judges, setJudges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingHearing, setEditingHearing] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCourt, setFilterCourt] = useState('');
  const [filterRemark, setFilterRemark] = useState('');
  const [showCaseDropdown, setShowCaseDropdown] = useState(false);
  const [showTitleDropdown, setShowTitleDropdown] = useState(false);
  const [showCourtDropdown, setShowCourtDropdown] = useState(false);
  const [showJudgeDropdown, setShowJudgeDropdown] = useState(false);
  const [groupByCase, setGroupByCase] = useState(true);
  const [totalCases, setTotalCases] = useState(0);

  // Modal-specific search state (separate from main page search)
  const [modalCases, setModalCases] = useState([]);
  const [modalCourts, setModalCourts] = useState([]);
  const [modalJudges, setModalJudges] = useState([]);
  const [modalCaseSearchTerm, setModalCaseSearchTerm] = useState('');
  const [modalTitleSearchTerm, setModalTitleSearchTerm] = useState('');

  // Form data state
  const [formData, setFormData] = useState({
    suit_reference_number: '',
    title: '',
    remark: 'fh',
    hearing_time: '',
    coram: '',
    attendance: '',
    representation: '',
    court_type: '',
    court_name: '',
    proceedings: ''
  });

  const remarkOptions = [
    { value: 'fh', label: 'For Hearing', color: 'bg-blue-100 text-blue-800' },
    { value: 'fr', label: 'For Ruling', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'fj', label: 'For Judgement', color: 'bg-purple-100 text-purple-800' }
  ];

  const courtTypes = [
    'Supreme Court',
    'Court of Appeal',
    'High Court',
    'Circuit Court',
    'District Court',
    'Commercial Court',
    'Family Court',
    'Land Court',
    'Labour Court'
  ];

  useEffect(() => {
    fetchHearings();
    fetchCourts();
    fetchJudges();
    // Fetch modal data separately
    fetchModalCourts();
    fetchModalJudges();
    // Don't fetch cases on mount - only when user types 3+ characters
  }, [currentPage, searchTerm, filterCourt, filterRemark, groupByCase]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.relative')) {
        setShowCaseDropdown(false);
        setShowTitleDropdown(false);
        setShowCourtDropdown(false);
        setShowJudgeDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const fetchHearings = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20'
      });
      
      if (searchTerm) params.append('search', searchTerm);
      if (filterCourt) params.append('court_type', filterCourt);
      if (filterRemark) params.append('remark', filterRemark);
      if (groupByCase) params.append('group_by_case', 'true');
      
      const response = await fetch(`/api/admin/case-hearings?${params}`, {
        headers: {
          // 'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        
        if (data.grouped) {
          setCases(data.cases || []);
          setTotalCases(data.total_cases || 0);
          setHearings([]); // Clear hearings when grouped
        } else {
          setHearings(data.hearings || []);
          setCases([]); // Clear cases when not grouped
        }
        
        // Calculate total pages based on response
        const totalPagesCount = Math.ceil((data.total_count || 0) / 20);
        setTotalPages(Math.max(1, totalPagesCount));
      } else {
        console.error('Failed to fetch hearings:', response.statusText);
        // Fallback to empty arrays
        setHearings([]);
        setCases([]);
      }
    } catch (error) {
      console.error('Error fetching hearings:', error);
      setHearings([]);
      setCases([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCases = async (searchTerm = '') => {
    try {
      const token = localStorage.getItem('token');
      
      // Only search if search term is 3+ characters, otherwise return empty
      if (searchTerm.length < 3) {
        setCases([]);
        return;
      }

      const response = await fetch(`/api/admin/case-hearings/search/cases?q=${encodeURIComponent(searchTerm)}&limit=100`, {
        headers: {
          // 'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setCases(data);
      } else {
        console.error('❌ FAILED to fetch cases:', response.status, response.statusText);
        setCases([]);
      }
    } catch (error) {
      console.error('❌ ERROR: Failed to fetch cases:', error);
      setCases([]);
    }
  };

  const fetchCourts = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/court-types/search/active?query=&limit=100`, {
        headers: {
          // 'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setCourts(data);
      } else {
        console.error('Failed to fetch court types:', response.statusText);
        setCourts([]);
      }
    } catch (error) {
      console.error('Error fetching court types:', error);
      setCourts([]);
    }
  };

  const fetchJudges = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/judges/search/active?query=&limit=100`, {
        headers: {
          // 'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setJudges(data);
      } else {
        console.error('Failed to fetch judges:', response.statusText);
        setJudges([]);
      }
    } catch (error) {
      console.error('Error fetching judges:', error);
      setJudges([]);
    }
  };

  // Modal-specific fetch functions
  const fetchModalCourts = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/court-types/search/active?query=&limit=100`, {
        headers: {
          // 'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setModalCourts(data);
      } else {
        console.error('Failed to fetch modal court types:', response.statusText);
        setModalCourts([]);
      }
    } catch (error) {
      console.error('Error fetching modal court types:', error);
      setModalCourts([]);
    }
  };

  const fetchModalJudges = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/judges/search/active?query=&limit=100`, {
        headers: {
          // 'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setModalJudges(data);
      } else {
        console.error('Failed to fetch modal judges:', response.statusText);
        setModalJudges([]);
      }
    } catch (error) {
      console.error('Error fetching modal judges:', error);
      setModalJudges([]);
    }
  };

  const fetchModalCases = async (searchTerm) => {
    if (!searchTerm || searchTerm.length < 3) {
      setModalCases([]);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/case-hearings/search/cases?q=${encodeURIComponent(searchTerm)}&limit=100`, {
        headers: {
          // 'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setModalCases(data);
      } else {
        console.error('Failed to fetch modal cases:', response.statusText);
        setModalCases([]);
      }
    } catch (error) {
      console.error('Error fetching modal cases:', error);
      setModalCases([]);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Show dropdowns based on field focus and content
    if (name === 'suit_reference_number') {
      setShowCaseDropdown(value.length > 0);
      setModalCaseSearchTerm(value);
    } else if (name === 'title') {
      setShowTitleDropdown(true);
      setModalTitleSearchTerm(value);
      // Trigger search when user types 3+ characters
      if (value.length >= 3) {
        fetchModalCases(value);
      } else {
        setModalCases([]); // Clear cases if less than 3 characters
      }
    } else if (name === 'court_name') {
      setShowCourtDropdown(value.length > 0);
    } else if (name === 'coram') {
      setShowJudgeDropdown(value.length > 0);
    }
  };

  const handleCaseSelection = (selectedCase) => {
    setFormData(prev => ({
      ...prev,
      suit_reference_number: selectedCase.suit_reference_number,
      title: selectedCase.title
    }));
    setShowCaseDropdown(false);
  };

  const handleTitleSelection = (selectedCase) => {
    setFormData(prev => ({
      ...prev,
      suit_reference_number: selectedCase.suit_reference_number,
      title: selectedCase.title
    }));
    setShowTitleDropdown(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const token = localStorage.getItem('token');
      
      // Prepare the data for API
      const hearingData = {
        suit_reference_number: formData.suit_reference_number,
        hearing_date: new Date().toISOString(), // Full ISO datetime format
        hearing_time: formData.hearing_time,
        coram: formData.coram,
        remark: formData.remark,
        proceedings: formData.proceedings
      };
      
      const url = editingHearing 
        ? `/api/admin/case-hearings/${editingHearing.id}`
        : `/api/admin/case-hearings`;
      
      const method = editingHearing ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          // 'Authorization': `Bearer ${token}`, // Temporarily disabled for testing
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(hearingData)
      });
      
      if (response.ok) {
        // Reset form and close modal
        setFormData({
          suit_reference_number: '',
          title: '',
          remark: 'fh',
          hearing_time: '',
          coram: '',
          attendance: '',
          representation: '',
          court_type: '',
          court_name: '',
          proceedings: ''
        });
        // Clear modal search terms
        setModalCaseSearchTerm('');
        setModalTitleSearchTerm('');
        setModalCases([]);
        setShowCaseDropdown(false);
        setShowTitleDropdown(false);
        setShowCourtDropdown(false);
        setShowJudgeDropdown(false);
        setShowForm(false);
        setEditingHearing(null);
        
        // Refresh hearings list
        fetchHearings();
      } else {
        console.error('Failed to save hearing:', response.statusText);
        alert('Failed to save hearing. Please try again.');
      }
      
    } catch (error) {
      console.error('Error saving hearing:', error);
      alert('Error saving hearing. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (hearing) => {
    setEditingHearing(hearing);
    setFormData({
      suit_reference_number: hearing.suit_reference_number || '',
      title: hearing.title || '',
      remark: hearing.remark || '',
      hearing_time: hearing.hearing_time || '',
      coram: hearing.coram || '',
      attendance: hearing.attendance || '',
      representation: hearing.representation || '',
      court_type: hearing.court_type || '',
      court_name: hearing.court_name || '',
      proceedings: hearing.proceedings || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (hearingId) => {
    if (window.confirm('Are you sure you want to delete this hearing record?')) {
      try {
        const token = localStorage.getItem('token');
        
        const response = await fetch(`/api/admin/case-hearings/${hearingId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          // Refresh hearings list
          fetchHearings();
        } else {
          console.error('Failed to delete hearing:', response.statusText);
          alert('Failed to delete hearing. Please try again.');
        }
      } catch (error) {
        console.error('Error deleting hearing:', error);
        alert('Error deleting hearing. Please try again.');
      }
    }
  };

  const getRemarkInfo = (remark) => {
    return remarkOptions.find(option => option.value === remark) || remarkOptions[0];
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const filteredHearings = (hearings || []).filter(hearing => {
    const searchLower = searchTerm?.toLowerCase() || '';
    const matchesSearch = (hearing.title?.toLowerCase().includes(searchLower) || false) ||
                         (hearing.suit_reference_number?.toLowerCase().includes(searchLower) || false);
    const matchesCourt = !filterCourt || hearing.court_type === filterCourt;
    const matchesRemark = !filterRemark || hearing.remark === filterRemark;
    
    return matchesSearch && matchesCourt && matchesRemark;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200">
        <div className="px-6 py-4 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">Case Hearing Details</h2>
              <p className="text-sm text-slate-600">Manage case hearing records, schedules, and proceedings</p>
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Create Hearing Record
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="px-6 py-4 border-b border-slate-200">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search cases..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
              />
            </div>
            <select
              value={filterCourt}
              onChange={(e) => setFilterCourt(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
            >
              <option value="">All Courts</option>
              {courtTypes?.map(type => (
                <option key={type} value={type}>{type}</option>
              )) || []}
            </select>
            <select
              value={filterRemark}
              onChange={(e) => setFilterRemark(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
            >
              <option value="">All Types</option>
              {remarkOptions?.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              )) || []}
            </select>
            <button
              onClick={() => {
                setSearchTerm('');
                setFilterCourt('');
                setFilterRemark('');
              }}
              className="px-4 py-2 text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Clear Filters
            </button>
          </div>
          
          {/* View Toggle */}
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-slate-700">View:</span>
              <button
                onClick={() => setGroupByCase(true)}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                  groupByCase 
                    ? 'bg-sky-100 text-sky-700 border border-sky-200' 
                    : 'bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200'
                }`}
              >
                Grouped by Case
              </button>
              <button
                onClick={() => setGroupByCase(false)}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                  !groupByCase 
                    ? 'bg-sky-100 text-sky-700 border border-sky-200' 
                    : 'bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200'
                }`}
              >
                All Hearings
              </button>
            </div>
            <div className="text-sm text-slate-500">
              {groupByCase ? `${totalCases} cases` : `${hearings.length} hearings`}
            </div>
          </div>
        </div>

        {/* Hearings List */}
        <div className="divide-y divide-slate-200">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600 mx-auto"></div>
              <p className="mt-2 text-slate-600">Loading hearings...</p>
            </div>
          ) : groupByCase ? (
            // Grouped by Case View
            (cases || []).length === 0 ? (
              <div className="p-8 text-center text-slate-500">
                <Calendar className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                <p>No cases with hearings found</p>
              </div>
            ) : (
              (cases || []).map((caseItem) => (
                <div key={caseItem.case_id} className="p-6 border-b border-slate-200 last:border-b-0">
                  <div className="mb-4">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-sm font-medium text-slate-900">
                        {caseItem.suit_reference_number || 'No suit number'}
                      </span>
                      <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-full">
                        {caseItem.court_type || 'N/A'}
                      </span>
                    </div>
                    <h3 className="text-lg font-medium text-slate-900 mb-2">
                      {caseItem.title || 'No title available'}
                    </h3>
                  </div>
                  
                  {/* Case Timeline */}
                  <div className="ml-4">
                    <div className="relative">
                      <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-slate-200"></div>
                      <div className="space-y-4">
                        {(caseItem.hearings || []).map((hearing, index) => {
                          const remarkInfo = getRemarkInfo(hearing.remark);
                          return (
                            <div key={hearing.id} className="relative flex space-x-4">
                              <div className="relative">
                                <div className={`h-8 w-8 rounded-full flex items-center justify-center ring-4 ring-white ${
                                  hearing.remark === 'fj' ? 'bg-purple-500' :
                                  hearing.remark === 'fr' ? 'bg-yellow-500' :
                                  'bg-blue-500'
                                }`}>
                                  {hearing.remark === 'fj' ? <Gavel className="h-4 w-4 text-white" /> :
                                   hearing.remark === 'fr' ? <Scale className="h-4 w-4 text-white" /> :
                                   <Clock className="h-4 w-4 text-white" />}
                                </div>
                                {index < caseItem.hearings.length - 1 && (
                                  <div className="absolute top-8 left-1/2 transform -translate-x-1/2 w-0.5 h-4 bg-slate-200"></div>
                                )}
                              </div>
                              <div className="flex-1 pb-4">
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center gap-2">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${remarkInfo.color}`}>
                                      {remarkInfo.label}
                                    </span>
                                    <span className="text-xs text-slate-500">
                                      {hearing.hearing_time}
                                    </span>
                                  </div>
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    hearing.remark === 'fj' ? 'bg-purple-100 text-purple-800' :
                                    hearing.remark === 'fr' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-blue-100 text-blue-800'
                                  }`}>
                                    {hearing.remark?.toUpperCase()}
                                  </span>
                                </div>
                                <p className="text-sm text-slate-600 mb-2">
                                  {formatDate(hearing.hearing_date)}
                                </p>
                                {hearing.coram && (
                                  <p className="text-xs text-slate-500 mb-2">
                                    <span className="font-medium">Coram:</span> {hearing.coram}
                                  </p>
                                )}
                                {hearing.proceedings && (
                                  <div className="mt-2 p-3 bg-slate-50 rounded-lg">
                                    <p className="text-sm text-slate-700">
                                      <span className="font-medium">Proceedings:</span> {hearing.proceedings}
                                    </p>
                                  </div>
                                )}
                                <div className="flex items-center gap-2 mt-3">
                                  <button
                                    onClick={() => handleEdit(hearing)}
                                    className="p-1 text-slate-400 hover:text-sky-600 transition-colors"
                                  >
                                    <Edit className="h-4 w-4" />
                                  </button>
                                  <button
                                    onClick={() => handleDelete(hearing.id)}
                                    className="p-1 text-slate-400 hover:text-red-600 transition-colors"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )
          ) : (
            // Flat List View
            (filteredHearings || []).length === 0 ? (
              <div className="p-8 text-center text-slate-500">
                <Calendar className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                <p>No hearing records found</p>
              </div>
            ) : (
              (filteredHearings || []).map((hearing) => {
              const remarkInfo = getRemarkInfo(hearing.remark);
              return (
                <div key={hearing.id} className="p-6 hover:bg-slate-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${remarkInfo.color}`}>
                          {remarkInfo.label}
                        </span>
                        <span className="text-sm font-medium text-slate-900">{hearing.suit_reference_number || 'No suit number'}</span>
                      </div>
                      <h3 className="text-lg font-medium text-slate-900 mb-2">{hearing.title || 'No title available'}</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm text-slate-600">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <span>{formatDate(hearing.hearing_date)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          <span>{hearing.hearing_time}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Gavel className="h-4 w-4" />
                          <span>{hearing.coram}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4" />
                          <span>{hearing.court_name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          <span>{hearing.attendance}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Scale className="h-4 w-4" />
                          <span>{hearing.representation}</span>
                        </div>
                      </div>
                      {hearing.proceedings && (
                        <div className="mt-3 p-3 bg-slate-50 rounded-lg">
                          <p className="text-sm text-slate-700">
                            <span className="font-medium">Proceedings:</span> {hearing.proceedings}
                          </p>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={() => handleEdit(hearing)}
                        className="p-2 text-slate-400 hover:text-sky-600 transition-colors"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(hearing.id)}
                        className="p-2 text-slate-400 hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-slate-200">
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-600">
                {groupByCase 
                  ? `Showing ${(cases || []).length} cases on page ${currentPage} of ${totalPages}`
                  : `Showing ${(hearings || []).length} hearings on page ${currentPage} of ${totalPages}`
                }
              </p>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="p-2 text-slate-400 hover:text-slate-600 disabled:opacity-50"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <span className="text-sm text-slate-600">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="p-2 text-slate-400 hover:text-slate-600 disabled:opacity-50"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
                <button
                  onClick={() => setCurrentPage(1)}
                  className="px-3 py-1 text-sm text-sky-600 hover:text-sky-700 border border-sky-200 rounded-lg hover:bg-sky-50 transition-colors"
                >
                  First Page
                </button>
                <button
                  onClick={() => setCurrentPage(totalPages)}
                  className="px-3 py-1 text-sm text-sky-600 hover:text-sky-700 border border-sky-200 rounded-lg hover:bg-sky-50 transition-colors"
                >
                  Last Page
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Create/Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-900">
                  {editingHearing ? 'Edit Hearing Record' : 'Create Hearing Record'}
                </h3>
                <button
                  onClick={() => {
                    setShowForm(false);
                    setEditingHearing(null);
                    // Clear modal search terms
                    setModalCaseSearchTerm('');
                    setModalTitleSearchTerm('');
                    setModalCases([]);
                    setShowCaseDropdown(false);
                    setShowTitleDropdown(false);
                    setShowCourtDropdown(false);
                    setShowJudgeDropdown(false);
                    setFormData({
                      suit_reference_number: '',
                      title: '',
                      remark: 'fh',
                      hearing_time: '',
                      coram: '',
                      attendance: '',
                      representation: '',
                      court_type: '',
                      court_name: '',
                      proceedings: ''
                    });
                  }}
                  className="p-2 text-slate-400 hover:text-slate-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Suit Number */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Suit Number *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="suit_reference_number"
                      value={formData.suit_reference_number}
                      onChange={handleInputChange}
                      placeholder="Select or type suit number"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                      required
                    />
                    {(modalCases || []).length > 0 && showCaseDropdown && (
                      <div className="absolute top-full left-0 right-0 bg-white border border-slate-300 rounded-lg shadow-lg z-[60] max-h-48 overflow-y-auto">
                        {(modalCases || [])
                          .filter(caseItem => 
                            caseItem.suit_reference_number?.toLowerCase().includes(formData.suit_reference_number?.toLowerCase() || '') || false
                          )
                          .map(caseItem => (
                            <div
                              key={caseItem.id}
                              onClick={() => handleCaseSelection(caseItem)}
                              className="p-3 hover:bg-slate-50 cursor-pointer border-b border-slate-100 last:border-b-0"
                            >
                              <div className="font-medium text-slate-900">{caseItem.suit_reference_number}</div>
                              <div className="text-sm text-slate-600">{caseItem.title}</div>
                            </div>
                          ))
                        }
                      </div>
                    )}
                  </div>
                </div>

                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Title of Case *
                    <span className="text-xs text-gray-500 ml-2">
                      (Type 3+ characters to search)
                    </span>
                  </label>
                  <div className="relative">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        onFocus={() => setShowTitleDropdown(true)}
                        placeholder="Select or type case title"
                        className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                        required
                      />
                      <div className="flex gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            setShowTitleDropdown(!showTitleDropdown);
                          }}
                          className="px-3 py-2 bg-sky-100 text-sky-600 rounded-lg hover:bg-sky-200 text-sm"
                        >
                          {showTitleDropdown ? 'Hide' : 'Show'} Search
                        </button>
                      </div>
                    </div>
                        {showTitleDropdown && (
                          <div className="absolute top-full left-0 right-0 bg-white border border-slate-300 rounded-lg shadow-lg z-[60] max-h-96 overflow-y-auto mt-1">
                            {formData.title.length < 3 ? (
                              <div className="p-3 text-slate-500 text-sm">
                                Type at least 3 characters to search cases...
                              </div>
                            ) : (modalCases || []).length === 0 ? (
                              <div className="p-3 text-slate-500 text-sm">
                                No cases found for "{formData.title}"
                              </div>
                            ) : (
                              <>
                                <div className="p-2 text-xs text-slate-400 border-b border-slate-100">
                                  Found {(modalCases || []).length} cases for "{formData.title}"
                                </div>
                            {(modalCases || [])
                              .slice(0, 50) // Limit to first 50 results for performance
                              .map(caseItem => (
                                <div
                                  key={caseItem.id}
                                  onClick={() => handleTitleSelection(caseItem)}
                                  className="p-3 hover:bg-slate-50 cursor-pointer border-b border-slate-100 last:border-b-0"
                                >
                                  <div className="font-medium text-slate-900 text-sm leading-tight">
                                    {caseItem.title}
                                  </div>
                                  <div className="text-xs text-slate-500 mt-1">
                                    {caseItem.suit_reference_number || 'No suit number'} • {caseItem.court_type}
                                  </div>
                                </div>
                              ))
                            }
                            {cases.length > 50 && (
                              <div className="p-3 text-slate-500 text-sm bg-slate-50 border-t border-slate-200">
                                Showing first 50 results. Refine your search for more specific results.
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Remarks */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Remarks *
                  </label>
                  <select
                    name="remark"
                    value={formData.remark}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                    required
                  >
                    {remarkOptions?.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    )) || []}
                  </select>
                </div>

                {/* Time */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Time *
                  </label>
                  <input
                    type="time"
                    name="hearing_time"
                    value={formData.hearing_time}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                    required
                  />
                </div>

                {/* Coram */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Coram *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="coram"
                      value={formData.coram}
                      onChange={handleInputChange}
                      placeholder="Select or type judge name"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                      required
                    />
                    {(modalJudges || []).length > 0 && showJudgeDropdown && (
                      <div className="absolute top-full left-0 right-0 bg-white border border-slate-300 rounded-lg shadow-lg z-[60] max-h-32 overflow-y-auto">
                        {(modalJudges || [])
                          .filter(judge => 
                            (judge.name?.toLowerCase().includes(formData.coram?.toLowerCase() || '') || false) ||
                            (judge.title?.toLowerCase().includes(formData.coram?.toLowerCase() || '') || false)
                          )
                          .map(judge => (
                            <div
                              key={judge.id}
                              onClick={() => {
                                setFormData(prev => ({ ...prev, coram: judge.name }));
                                setShowJudgeDropdown(false);
                              }}
                              className="p-2 hover:bg-slate-50 cursor-pointer border-b border-slate-100 last:border-b-0"
                            >
                              <div className="font-medium text-slate-900">{judge.name}</div>
                              {judge.title && (
                                <div className="text-sm text-slate-600">{judge.title}</div>
                              )}
                              {judge.court_type && (
                                <div className="text-xs text-slate-500">{judge.court_type}</div>
                              )}
                            </div>
                          ))
                        }
                      </div>
                    )}
                  </div>
                </div>

                {/* Attendance */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Attendance
                  </label>
                  <input
                    type="text"
                    name="attendance"
                    value={formData.attendance}
                    onChange={handleInputChange}
                    placeholder="Who attended the hearing"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                  />
                </div>

                {/* Representation */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Representation
                  </label>
                  <input
                    type="text"
                    name="representation"
                    value={formData.representation}
                    onChange={handleInputChange}
                    placeholder="Names of lawyers present"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                  />
                </div>

                {/* Court Type */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Court Type *
                  </label>
                  <select
                    name="court_type"
                    value={formData.court_type}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                    required
                  >
                    <option value="">Select court type</option>
                    {courtTypes?.map(type => (
                      <option key={type} value={type}>{type}</option>
                    )) || []}
                  </select>
                </div>

                {/* Court Name */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Court Name *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="court_name"
                      value={formData.court_name}
                      onChange={handleInputChange}
                      placeholder="Select or type court name"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                      required
                    />
                    {(modalCourts || []).length > 0 && showCourtDropdown && (
                      <div className="absolute top-full left-0 right-0 bg-white border border-slate-300 rounded-lg shadow-lg z-[60] max-h-32 overflow-y-auto">
                        {(modalCourts || [])
                          .filter(courtItem => 
                            (courtItem.name?.toLowerCase().includes(formData.court_name?.toLowerCase() || '') || false) ||
                            (courtItem.code?.toLowerCase().includes(formData.court_name?.toLowerCase() || '') || false) ||
                            (formData.court_type && courtItem.level === formData.court_type)
                          )
                          .map(courtItem => (
                            <div
                              key={courtItem.id}
                              onClick={() => {
                                setFormData(prev => ({ ...prev, court_name: courtItem.name }));
                                setShowCourtDropdown(false);
                              }}
                              className="p-2 hover:bg-slate-50 cursor-pointer border-b border-slate-100 last:border-b-0"
                            >
                              <div className="font-medium text-slate-900">{courtItem.name}</div>
                              <div className="text-sm text-slate-600">{courtItem.code} • {courtItem.level} • {courtItem.region || 'N/A'}</div>
                            </div>
                          ))
                        }
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Summary of Proceedings */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Summary of Proceedings
                </label>
                <textarea
                  name="proceedings"
                  value={formData.proceedings}
                  onChange={handleInputChange}
                  rows={4}
                  placeholder="Describe what happened during the hearing"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                />
              </div>

              {/* Form Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingHearing(null);
                    // Clear modal search terms
                    setModalCaseSearchTerm('');
                    setModalTitleSearchTerm('');
                    setModalCases([]);
                    setShowCaseDropdown(false);
                    setShowTitleDropdown(false);
                    setShowCourtDropdown(false);
                    setShowJudgeDropdown(false);
                  }}
                  className="px-4 py-2 text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 disabled:opacity-50 transition-colors"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      {editingHearing ? 'Update Hearing' : 'Create Hearing'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CaseHearingManagement;
