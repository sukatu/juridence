import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  Plus, 
  Upload,
  Filter, 
  Calendar, 
  FileText, 
  Eye, 
  Edit, 
  Trash2, 
  Download,
  AlertCircle,
  CheckCircle,
  Clock,
  Star,
  MapPin,
  Building,
  User,
  Banknote,
  Shield,
  FileSpreadsheet,
  X,
  Sparkles
} from 'lucide-react';
import { apiGet, apiPost, apiPut, apiDelete } from '../utils/api';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const GazetteManagement = () => {
  const navigate = useNavigate();
  const [gazettes, setGazettes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);

  // Quill editor configuration
  const quillModules = {
    toolbar: [
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'indent': '-1'}, { 'indent': '+1' }],
      [{ 'align': [] }],
      ['link', 'image'],
      ['clean']
    ],
  };

  const quillFormats = [
    'header', 'bold', 'italic', 'underline', 'strike',
    'color', 'background', 'list', 'bullet', 'indent',
    'align', 'link', 'image'
  ];
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    gazette_type: '',
    status: '',
    priority: '',
    jurisdiction: '',
    source: '',
    date_from: '',
    date_to: '',
    is_public: '',
    is_featured: ''
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    total_pages: 0
  });
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [selectedGazette, setSelectedGazette] = useState(null);
  const [importFile, setImportFile] = useState(null);
  const [importType, setImportType] = useState('CHANGE_OF_NAME');
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    content: '',
    summary: '',
    gazette_type: 'CHANGE_OF_NAME',
    priority: 'MEDIUM',
    publication_date: new Date().toISOString().split('T')[0],
    effective_date: '',
    expiry_date: '',
    source: '',
    reference_number: '',
    gazette_number: '',
    page_number: '',
    jurisdiction: '',
    court_location: '',
    person_id: '',
    company_id: '',
    bank_id: '',
    insurance_id: '',
    keywords: [],
    tags: [],
    is_public: true,
    is_featured: false,
    
    // Legal Notice Specific Fields
    item_number: '',
    old_name: '',
    alias_names: [],
    new_name: '',
    profession: '',
    effective_date_of_change: '',
    remarks: '',
    old_date_of_birth: '',
    new_date_of_birth: '',
    place_of_birth: '',
    old_place_of_birth: '',
    new_place_of_birth: '',
    officer_name: '',
    officer_title: '',
    appointment_authority: '',
    jurisdiction_area: '',
    gazette_date: '',
    gazette_page: '',
    source_item_number: ''
  });

  const gazetteTypes = [
    { value: 'CHANGE_OF_NAME', label: 'Change of Name', icon: User, color: 'blue' },
    { value: 'CHANGE_OF_DATE_OF_BIRTH', label: 'Correction of Date of Birth', icon: Calendar, color: 'green' },
    { value: 'CHANGE_OF_PLACE_OF_BIRTH', label: 'Correction of Place of Birth', icon: MapPin, color: 'orange' },
    { value: 'APPOINTMENT_OF_MARRIAGE_OFFICERS', label: 'Marriage Officers', icon: User, color: 'purple' }
  ];

  const statusOptions = [
    { value: 'DRAFT', label: 'Draft', icon: Clock, color: 'yellow' },
    { value: 'PUBLISHED', label: 'Published', icon: CheckCircle, color: 'green' },
    { value: 'ARCHIVED', label: 'Archived', icon: FileText, color: 'gray' },
    { value: 'CANCELLED', label: 'Cancelled', icon: AlertCircle, color: 'red' }
  ];

  const priorityOptions = [
    { value: 'LOW', label: 'Low', color: 'green' },
    { value: 'MEDIUM', label: 'Medium', color: 'yellow' },
    { value: 'HIGH', label: 'High', color: 'orange' },
    { value: 'URGENT', label: 'Urgent', color: 'red' }
  ];

  useEffect(() => {
    loadGazettes();
    loadStats();
  }, [pagination.page, filters]);

  const loadGazettes = async () => {
    try {
      setLoading(true);
      
      // Filter out empty values to avoid 422 errors
      const filteredFilters = Object.fromEntries(
        Object.entries(filters).filter(([key, value]) => value !== '' && value !== null && value !== undefined)
      );
      
      const params = new URLSearchParams({
        page: pagination.page,
        limit: pagination.limit
      });
      
      // Add search parameter if present
      if (searchTerm) {
        params.append('search', searchTerm);
      }
      
      // Determine which endpoint to use based on gazette_type filter
      let endpoint = '/gazette';
      let responseData;
      
      if (filters.gazette_type === 'CHANGE_OF_DATE_OF_BIRTH') {
        endpoint = '/correction-of-date-of-birth/';
        // Add other relevant filters for this endpoint
        if (filteredFilters.date_from) params.append('effective_date_from', filteredFilters.date_from);
        if (filteredFilters.date_to) params.append('effective_date_to', filteredFilters.date_to);
        responseData = await apiGet(`${endpoint}?${params}`);
        // Transform correction data to match gazette structure for display
        const normalizedGazettes = (responseData.results || []).map(item => ({
          ...item,
          title: item.person_name || 'Correction of Date of Birth',
          description: `${item.old_date_of_birth || 'N/A'} → ${item.new_date_of_birth || 'N/A'}`,
          gazette_type: 'CHANGE_OF_DATE_OF_BIRTH',
          status: 'PUBLISHED',
          priority: 'MEDIUM',
          publication_date: item.gazette_date || item.effective_date || item.created_at,
          source: item.source_details || item.gazette_number || '-'
        }));
        responseData = {
          gazettes: normalizedGazettes,
          total: responseData.total || 0,
          total_pages: responseData.total_pages || 0
        };
      } else if (filters.gazette_type === 'CHANGE_OF_PLACE_OF_BIRTH') {
        endpoint = '/correction-of-place-of-birth/';
        // Add other relevant filters for this endpoint
        if (filteredFilters.date_from) params.append('effective_date_from', filteredFilters.date_from);
        if (filteredFilters.date_to) params.append('effective_date_to', filteredFilters.date_to);
        responseData = await apiGet(`${endpoint}?${params}`);
        // Transform correction data to match gazette structure for display
        const normalizedGazettes = (responseData.results || []).map(item => ({
          ...item,
          title: item.person_name || 'Correction of Place of Birth',
          description: `${item.old_place_of_birth || 'N/A'} → ${item.new_place_of_birth || 'N/A'}`,
          gazette_type: 'CHANGE_OF_PLACE_OF_BIRTH',
          status: 'PUBLISHED',
          priority: 'MEDIUM',
          publication_date: item.gazette_date || item.effective_date || item.created_at,
          source: item.source_details || item.gazette_number || '-'
        }));
        responseData = {
          gazettes: normalizedGazettes,
          total: responseData.total || 0,
          total_pages: responseData.total_pages || 0
        };
      } else if (filters.gazette_type === 'APPOINTMENT_OF_MARRIAGE_OFFICERS') {
        endpoint = '/marriage-officers/';
        // Add other relevant filters for this endpoint
        if (filteredFilters.date_from) params.append('appointment_date_from', filteredFilters.date_from);
        if (filteredFilters.date_to) params.append('appointment_date_to', filteredFilters.date_to);
        responseData = await apiGet(`${endpoint}?${params}`);
        // Transform marriage officers data to match gazette structure for display
        const normalizedGazettes = (responseData.results || []).map(item => ({
          ...item,
          title: item.officer_name || 'Marriage Officer',
          description: `${item.church || ''} - ${item.location || ''}`.trim() || 'Marriage Officer Appointment',
          gazette_type: 'APPOINTMENT_OF_MARRIAGE_OFFICERS',
          status: 'PUBLISHED',
          priority: 'MEDIUM',
          publication_date: item.gazette_date || item.appointment_date || item.created_at,
          source: item.source_details || item.gazette_number || '-'
        }));
        responseData = {
          gazettes: normalizedGazettes,
          total: responseData.total || 0,
          total_pages: responseData.total_pages || 0
        };
      } else {
        // CHANGE_OF_NAME or no filter - use gazette endpoint
        // Add all filters for gazette endpoint
        Object.entries(filteredFilters).forEach(([key, value]) => {
          params.append(key, value);
        });
        responseData = await apiGet(`${endpoint}?${params}`);
      }

      setGazettes(responseData.gazettes || []);
      setPagination(prev => ({
        ...prev,
        total: responseData.total || 0,
        total_pages: responseData.total_pages || 0
      }));
    } catch (error) {
      console.error('Error loading gazettes:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await apiGet('/gazette/stats/overview');
      setStats(response);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPagination(prev => ({ ...prev, page: 1 }));
    loadGazettes();
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleCreateGazette = async (e) => {
    e.preventDefault();
    try {
      const response = await apiPost('/gazette', formData);
      setGazettes(prev => [response, ...prev]);
      setShowCreateModal(false);
      resetForm();
      loadStats();
    } catch (error) {
      console.error('Error creating gazette:', error);
    }
  };

  const handleEditGazette = async (e) => {
    e.preventDefault();
    try {
      const response = await apiPut(`/gazette/${selectedGazette.id}`, formData);
      setGazettes(prev => prev.map(g => g.id === selectedGazette.id ? response : g));
      setShowEditModal(false);
      setSelectedGazette(null);
      resetForm();
    } catch (error) {
      console.error('Error updating gazette:', error);
    }
  };

  const handleGazetteSelectFromAI = (gazette) => {
    // When a gazette is selected from AI search results, open it in edit modal
    // This should NOT navigate away - just open the modal
    if (gazette && gazette.id) {
      // Fetch full gazette details
      apiGet(`/gazette/${gazette.id}`)
        .then(fullGazette => {
          setSelectedGazette(fullGazette);
          // Populate form with gazette data
          setFormData({
            title: fullGazette.title || '',
            description: fullGazette.description || '',
            content: fullGazette.content || '',
            summary: fullGazette.summary || '',
            gazette_type: fullGazette.gazette_type || 'CHANGE_OF_NAME',
            priority: fullGazette.priority || 'MEDIUM',
            publication_date: fullGazette.publication_date ? fullGazette.publication_date.split('T')[0] : new Date().toISOString().split('T')[0],
            effective_date: fullGazette.effective_date ? fullGazette.effective_date.split('T')[0] : '',
            expiry_date: fullGazette.expiry_date ? fullGazette.expiry_date.split('T')[0] : '',
            source: fullGazette.source || '',
            reference_number: fullGazette.reference_number || '',
            gazette_number: fullGazette.gazette_number || '',
            page_number: fullGazette.page_number || '',
            jurisdiction: fullGazette.jurisdiction || '',
            court_location: fullGazette.court_location || '',
            person_id: fullGazette.person_id || '',
            company_id: fullGazette.company_id || '',
            bank_id: fullGazette.bank_id || '',
            insurance_id: fullGazette.insurance_id || '',
            keywords: fullGazette.keywords || [],
            tags: fullGazette.tags || [],
            is_public: fullGazette.is_public !== undefined ? fullGazette.is_public : true,
            is_featured: fullGazette.is_featured || false,
            item_number: fullGazette.item_number || '',
            old_name: fullGazette.old_name || '',
            alias_names: fullGazette.alias_names || [],
            new_name: fullGazette.new_name || '',
            profession: fullGazette.profession || '',
            effective_date_of_change: fullGazette.effective_date_of_change ? fullGazette.effective_date_of_change.split('T')[0] : '',
            remarks: fullGazette.remarks || '',
            old_date_of_birth: fullGazette.old_date_of_birth ? fullGazette.old_date_of_birth.split('T')[0] : '',
            new_date_of_birth: fullGazette.new_date_of_birth ? fullGazette.new_date_of_birth.split('T')[0] : '',
            place_of_birth: fullGazette.place_of_birth || '',
            old_place_of_birth: fullGazette.old_place_of_birth || '',
            new_place_of_birth: fullGazette.new_place_of_birth || '',
            officer_name: fullGazette.officer_name || '',
            officer_title: fullGazette.officer_title || '',
            appointment_authority: fullGazette.appointment_authority || '',
            jurisdiction_area: fullGazette.jurisdiction_area || '',
            gazette_date: fullGazette.gazette_date ? fullGazette.gazette_date.split('T')[0] : '',
            gazette_page: fullGazette.gazette_page || '',
            source_item_number: fullGazette.source_item_number || ''
          });
          setShowEditModal(true);
        })
        .catch(error => {
          console.error('Error fetching gazette details:', error);
        });
    }
  };

  const handleDeleteGazette = async (id) => {
    if (window.confirm('Are you sure you want to delete this gazette entry?')) {
      try {
        await apiDelete(`/gazette/${id}`);
        setGazettes(prev => prev.filter(g => g.id !== id));
        loadStats();
      } catch (error) {
        console.error('Error deleting gazette:', error);
      }
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || 
          file.type === 'application/vnd.ms-excel' ||
          file.name.endsWith('.xlsx') || 
          file.name.endsWith('.xls')) {
        setImportFile(file);
      } else {
        alert('Please select a valid Excel file (.xlsx or .xls)');
        e.target.value = '';
      }
    }
  };

  const handleImport = async (e) => {
    e.preventDefault();
    if (!importFile) {
      alert('Please select a file to import');
      return;
    }

    setImporting(true);
    setImportResult(null);

    try {
      const formData = new FormData();
      formData.append('file', importFile);
      formData.append('gazette_type', importType);

      const response = await fetch('/api/gazette/import-excel', {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });

      const result = await response.json();
      
      if (response.ok) {
        setImportResult({
          success: true,
          message: `Successfully imported ${result.imported_count} gazette entries`,
          details: result
        });
        setImportFile(null);
        setImportType('CHANGE_OF_NAME');
        loadGazettes();
        loadStats();
      } else {
        setImportResult({
          success: false,
          message: result.detail || 'Import failed',
          details: result
        });
      }
    } catch (error) {
      console.error('Error importing file:', error);
      setImportResult({
        success: false,
        message: 'Import failed: ' + error.message,
        details: null
      });
    } finally {
      setImporting(false);
    }
  };

  const resetImportForm = () => {
    setImportFile(null);
    setImportType('CHANGE_OF_NAME');
    setImportResult(null);
    setShowImportModal(false);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      content: '',
      summary: '',
      gazette_type: 'CHANGE_OF_NAME',
      priority: 'MEDIUM',
      publication_date: new Date().toISOString().split('T')[0],
      effective_date: '',
      expiry_date: '',
      source: '',
      reference_number: '',
      gazette_number: '',
      page_number: '',
      jurisdiction: '',
      court_location: '',
      person_id: '',
      company_id: '',
      bank_id: '',
      insurance_id: '',
      keywords: [],
      tags: [],
      is_public: true,
      is_featured: false,
      
      // Legal Notice Specific Fields
      item_number: '',
      old_name: '',
      alias_names: [],
      new_name: '',
      profession: '',
      effective_date_of_change: '',
      remarks: '',
      old_date_of_birth: '',
      new_date_of_birth: '',
      place_of_birth: '',
      old_place_of_birth: '',
      new_place_of_birth: '',
      officer_name: '',
      officer_title: '',
      appointment_authority: '',
      jurisdiction_area: '',
      gazette_date: '',
      gazette_page: '',
      source_item_number: ''
    });
  };

  const openEditModal = (gazette) => {
    setSelectedGazette(gazette);
    setFormData({
      title: gazette.title || '',
      description: gazette.description || '',
      content: gazette.content || '',
      summary: gazette.summary || '',
      gazette_type: gazette.gazette_type || 'CHANGE_OF_NAME',
      priority: gazette.priority || 'MEDIUM',
      publication_date: gazette.publication_date ? gazette.publication_date.split('T')[0] : '',
      effective_date: gazette.effective_date ? gazette.effective_date.split('T')[0] : '',
      expiry_date: gazette.expiry_date ? gazette.expiry_date.split('T')[0] : '',
      source: gazette.source || '',
      reference_number: gazette.reference_number || '',
      gazette_number: gazette.gazette_number || '',
      page_number: gazette.page_number || '',
      jurisdiction: gazette.jurisdiction || '',
      court_location: gazette.court_location || '',
      person_id: gazette.person_id || '',
      company_id: gazette.company_id || '',
      bank_id: gazette.bank_id || '',
      insurance_id: gazette.insurance_id || '',
      keywords: gazette.keywords || [],
      tags: gazette.tags || [],
      is_public: gazette.is_public !== undefined ? gazette.is_public : true,
      is_featured: gazette.is_featured || false,
      
      // Legal Notice Specific Fields
      item_number: gazette.item_number || '',
      old_name: gazette.old_name || '',
      alias_names: gazette.alias_names || [],
      new_name: gazette.new_name || '',
      profession: gazette.profession || '',
      effective_date_of_change: gazette.effective_date_of_change ? gazette.effective_date_of_change.split('T')[0] : '',
      remarks: gazette.remarks || '',
      old_date_of_birth: gazette.old_date_of_birth ? gazette.old_date_of_birth.split('T')[0] : '',
      new_date_of_birth: gazette.new_date_of_birth ? gazette.new_date_of_birth.split('T')[0] : '',
      place_of_birth: gazette.place_of_birth || '',
      old_place_of_birth: gazette.old_place_of_birth || '',
      new_place_of_birth: gazette.new_place_of_birth || '',
      officer_name: gazette.officer_name || '',
      officer_title: gazette.officer_title || '',
      appointment_authority: gazette.appointment_authority || '',
      jurisdiction_area: gazette.jurisdiction_area || '',
      gazette_date: gazette.gazette_date ? gazette.gazette_date.split('T')[0] : '',
      gazette_page: gazette.gazette_page || '',
      source_item_number: gazette.source_item_number || ''
    });
    setShowEditModal(true);
  };

  const getStatusIcon = (status) => {
    const statusOption = statusOptions.find(s => s.value === status);
    return statusOption ? statusOption.icon : Clock;
  };

  const getStatusColor = (status) => {
    const statusOption = statusOptions.find(s => s.value === status);
    return statusOption ? statusOption.color : 'gray';
  };

  const getTypeIcon = (type) => {
    const typeOption = gazetteTypes.find(t => t.value === type);
    return typeOption ? typeOption.icon : FileText;
  };

  const getTypeColor = (type) => {
    const typeOption = gazetteTypes.find(t => t.value === type);
    return typeOption ? typeOption.color : 'gray';
  };

  const getPriorityColor = (priority) => {
    const priorityOption = priorityOptions.find(p => p.value === priority);
    return priorityOption ? priorityOption.color : 'gray';
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="w-full">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Gazette</h1>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Gazette Management</h2>
              <p className="text-gray-600">Manage official notices and legal announcements</p>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Gazette Entry
              </button>
              <button
                onClick={() => setShowImportModal(true)}
                className="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
              >
                <Upload className="h-4 w-4 mr-2" />
                Import Excel
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  // Navigate to the new AI search page
                  navigate('/gazette-ai-search');
                }}
                className="inline-flex items-center px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-colors"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                AI Search
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <FileText className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Gazettes</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total_gazettes}</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <CheckCircle className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Published</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.published_gazettes}</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-yellow-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Drafts</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.draft_gazettes}</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <Star className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Featured</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.featured_gazettes}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Search and Filter Bar */}
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search gazettes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <select
              value={filters.gazette_type}
              onChange={(e) => handleFilterChange('gazette_type', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Types</option>
              {gazetteTypes.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>

            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Status</option>
              {statusOptions.map(status => (
                <option key={status.value} value={status.value}>{status.label}</option>
              ))}
            </select>

            <select
              value={filters.priority}
              onChange={(e) => handleFilterChange('priority', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Priorities</option>
              {priorityOptions.map(priority => (
                <option key={priority.value} value={priority.value}>{priority.label}</option>
              ))}
            </select>
            
            <div className="text-sm text-gray-600 flex items-center">
              <span>{pagination.total} total gazettes</span>
            </div>
          </div>
        </div>


        {/* Gazette List */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading gazettes...</p>
            </div>
          ) : gazettes.length === 0 ? (
            <div className="p-8 text-center">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No gazette entries found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Title
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Priority
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Publication Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Source
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {gazettes.map((gazette) => {
                    const StatusIcon = getStatusIcon(gazette.status);
                    const TypeIcon = getTypeIcon(gazette.gazette_type);
                    const statusColor = getStatusColor(gazette.status);
                    const typeColor = getTypeColor(gazette.gazette_type);
                    const priorityColor = getPriorityColor(gazette.priority);

                    return (
                      <tr key={gazette.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <TypeIcon className={`h-5 w-5 text-${typeColor}-600 mr-3`} />
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {gazette.title}
                              </div>
                              {gazette.description && (
                                <div className="text-sm text-gray-500 truncate max-w-xs">
                                  {gazette.description}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-${typeColor}-100 text-${typeColor}-800`}>
                            {gazetteTypes.find(t => t.value === gazette.gazette_type)?.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <StatusIcon className={`h-4 w-4 text-${statusColor}-600 mr-2`} />
                            <span className={`text-sm text-${statusColor}-600`}>
                              {statusOptions.find(s => s.value === gazette.status)?.label}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-${priorityColor}-100 text-${priorityColor}-800`}>
                            {priorityOptions.find(p => p.value === gazette.priority)?.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(gazette.publication_date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {gazette.source || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => openEditModal(gazette)}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteGazette(gazette.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        {pagination.total_pages > 1 && (
          <div className="flex items-center justify-between mt-6">
            <div className="text-sm text-gray-700">
              Showing page {pagination.page} of {pagination.total_pages}
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                disabled={pagination.page === 1}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                disabled={pagination.page === pagination.total_pages}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={() => {
            setShowCreateModal(false);
            resetForm();
          }}
        >
          <div 
            className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Create Gazette Entry</h2>
              <form onSubmit={handleCreateGazette} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
                    <select
                      required
                      value={formData.gazette_type}
                      onChange={(e) => setFormData(prev => ({ ...prev, gazette_type: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {gazetteTypes.map(type => (
                        <option key={type.value} value={type.value}>{type.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <ReactQuill
                    value={formData.description}
                    onChange={(value) => setFormData(prev => ({ ...prev, description: value }))}
                    modules={quillModules}
                    formats={quillFormats}
                    theme="snow"
                    style={{ height: '120px', marginBottom: '50px' }}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Content *</label>
                  <ReactQuill
                    value={formData.content}
                    onChange={(value) => setFormData(prev => ({ ...prev, content: value }))}
                    modules={quillModules}
                    formats={quillFormats}
                    theme="snow"
                    style={{ height: '200px', marginBottom: '50px' }}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                    <select
                      value={formData.priority}
                      onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {priorityOptions.map(priority => (
                        <option key={priority.value} value={priority.value}>{priority.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Publication Date *</label>
                    <input
                      type="date"
                      required
                      value={formData.publication_date}
                      onChange={(e) => setFormData(prev => ({ ...prev, publication_date: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Source</label>
                    <input
                      type="text"
                      value={formData.source}
                      onChange={(e) => setFormData(prev => ({ ...prev, source: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Dynamic Fields Based on Gazette Type */}
                {formData.gazette_type === 'CHANGE_OF_NAME' && (
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-blue-900 mb-4">Change of Name Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Item Number</label>
                        <input
                          type="text"
                          value={formData.item_number}
                          onChange={(e) => setFormData(prev => ({ ...prev, item_number: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="e.g., 24024"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Old Name</label>
                        <input
                          type="text"
                          value={formData.old_name}
                          onChange={(e) => setFormData(prev => ({ ...prev, old_name: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Name used prior to change"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">New Name</label>
                        <input
                          type="text"
                          value={formData.new_name}
                          onChange={(e) => setFormData(prev => ({ ...prev, new_name: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Name adopted or confirmed"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Profession</label>
                        <input
                          type="text"
                          value={formData.profession}
                          onChange={(e) => setFormData(prev => ({ ...prev, profession: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Current profession/occupation"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Effective Date of Change</label>
                        <input
                          type="date"
                          value={formData.effective_date_of_change}
                          onChange={(e) => setFormData(prev => ({ ...prev, effective_date_of_change: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Gazette Number</label>
                        <input
                          type="text"
                          value={formData.gazette_number}
                          onChange={(e) => setFormData(prev => ({ ...prev, gazette_number: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="e.g., No. 172"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Gazette Page</label>
                        <input
                          type="number"
                          value={formData.gazette_page}
                          onChange={(e) => setFormData(prev => ({ ...prev, gazette_page: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="e.g., 3507"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Source Item Number</label>
                        <input
                          type="text"
                          value={formData.source_item_number}
                          onChange={(e) => setFormData(prev => ({ ...prev, source_item_number: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="e.g., 24024"
                        />
                      </div>
                    </div>
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Remarks</label>
                      <ReactQuill
                        value={formData.remarks}
                        onChange={(value) => setFormData(prev => ({ ...prev, remarks: value }))}
                        modules={quillModules}
                        formats={quillFormats}
                        theme="snow"
                        style={{ height: '100px', marginBottom: '50px' }}
                        placeholder="Correction notices or confirmation details"
                      />
                    </div>
                  </div>
                )}

                {formData.gazette_type === 'CHANGE_OF_DATE_OF_BIRTH' && (
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-green-900 mb-4">Change of Date of Birth Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Old Date of Birth</label>
                        <input
                          type="date"
                          value={formData.old_date_of_birth}
                          onChange={(e) => setFormData(prev => ({ ...prev, old_date_of_birth: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">New Date of Birth</label>
                        <input
                          type="date"
                          value={formData.new_date_of_birth}
                          onChange={(e) => setFormData(prev => ({ ...prev, new_date_of_birth: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Place of Birth</label>
                        <input
                          type="text"
                          value={formData.place_of_birth}
                          onChange={(e) => setFormData(prev => ({ ...prev, place_of_birth: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Place of birth"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {formData.gazette_type === 'CHANGE_OF_PLACE_OF_BIRTH' && (
                  <div className="bg-orange-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-orange-900 mb-4">Change of Place of Birth Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Old Place of Birth</label>
                        <input
                          type="text"
                          value={formData.old_place_of_birth}
                          onChange={(e) => setFormData(prev => ({ ...prev, old_place_of_birth: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Original place of birth"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">New Place of Birth</label>
                        <input
                          type="text"
                          value={formData.new_place_of_birth}
                          onChange={(e) => setFormData(prev => ({ ...prev, new_place_of_birth: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="New place of birth"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {formData.gazette_type === 'APPOINTMENT_OF_MARRIAGE_OFFICERS' && (
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-purple-900 mb-4">Marriage Officer Appointment Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Officer Name</label>
                        <input
                          type="text"
                          value={formData.officer_name}
                          onChange={(e) => setFormData(prev => ({ ...prev, officer_name: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Name of appointed marriage officer"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Officer Title</label>
                        <input
                          type="text"
                          value={formData.officer_title}
                          onChange={(e) => setFormData(prev => ({ ...prev, officer_title: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Title/position"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Appointment Authority</label>
                        <input
                          type="text"
                          value={formData.appointment_authority}
                          onChange={(e) => setFormData(prev => ({ ...prev, appointment_authority: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Authority making the appointment"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Jurisdiction Area</label>
                        <input
                          type="text"
                          value={formData.jurisdiction_area}
                          onChange={(e) => setFormData(prev => ({ ...prev, jurisdiction_area: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Area of jurisdiction"
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateModal(false);
                      resetForm();
                    }}
                    className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Create Gazette Entry
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={() => {
            setShowEditModal(false);
            setSelectedGazette(null);
            resetForm();
          }}
        >
          <div 
            className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Edit Gazette Entry</h2>
              <form onSubmit={handleEditGazette} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
                    <select
                      required
                      value={formData.gazette_type}
                      onChange={(e) => setFormData(prev => ({ ...prev, gazette_type: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {gazetteTypes.map(type => (
                        <option key={type.value} value={type.value}>{type.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <ReactQuill
                    value={formData.description}
                    onChange={(value) => setFormData(prev => ({ ...prev, description: value }))}
                    modules={quillModules}
                    formats={quillFormats}
                    theme="snow"
                    style={{ height: '120px', marginBottom: '50px' }}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Content *</label>
                  <ReactQuill
                    value={formData.content}
                    onChange={(value) => setFormData(prev => ({ ...prev, content: value }))}
                    modules={quillModules}
                    formats={quillFormats}
                    theme="snow"
                    style={{ height: '200px', marginBottom: '50px' }}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                    <select
                      value={formData.priority}
                      onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {priorityOptions.map(priority => (
                        <option key={priority.value} value={priority.value}>{priority.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Publication Date *</label>
                    <input
                      type="date"
                      required
                      value={formData.publication_date}
                      onChange={(e) => setFormData(prev => ({ ...prev, publication_date: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Source</label>
                    <input
                      type="text"
                      value={formData.source}
                      onChange={(e) => setFormData(prev => ({ ...prev, source: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Dynamic Fields Based on Gazette Type */}
                {formData.gazette_type === 'CHANGE_OF_NAME' && (
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-blue-900 mb-4">Change of Name Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Item Number</label>
                        <input
                          type="text"
                          value={formData.item_number}
                          onChange={(e) => setFormData(prev => ({ ...prev, item_number: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="e.g., 24024"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Old Name</label>
                        <input
                          type="text"
                          value={formData.old_name}
                          onChange={(e) => setFormData(prev => ({ ...prev, old_name: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Name used prior to change"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">New Name</label>
                        <input
                          type="text"
                          value={formData.new_name}
                          onChange={(e) => setFormData(prev => ({ ...prev, new_name: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Name adopted or confirmed"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Profession</label>
                        <input
                          type="text"
                          value={formData.profession}
                          onChange={(e) => setFormData(prev => ({ ...prev, profession: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Current profession/occupation"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Effective Date of Change</label>
                        <input
                          type="date"
                          value={formData.effective_date_of_change}
                          onChange={(e) => setFormData(prev => ({ ...prev, effective_date_of_change: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Gazette Number</label>
                        <input
                          type="text"
                          value={formData.gazette_number}
                          onChange={(e) => setFormData(prev => ({ ...prev, gazette_number: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="e.g., No. 172"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Gazette Page</label>
                        <input
                          type="number"
                          value={formData.gazette_page}
                          onChange={(e) => setFormData(prev => ({ ...prev, gazette_page: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="e.g., 3507"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Source Item Number</label>
                        <input
                          type="text"
                          value={formData.source_item_number}
                          onChange={(e) => setFormData(prev => ({ ...prev, source_item_number: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="e.g., 24024"
                        />
                      </div>
                    </div>
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Remarks</label>
                      <ReactQuill
                        value={formData.remarks}
                        onChange={(value) => setFormData(prev => ({ ...prev, remarks: value }))}
                        modules={quillModules}
                        formats={quillFormats}
                        theme="snow"
                        style={{ height: '100px', marginBottom: '50px' }}
                        placeholder="Correction notices or confirmation details"
                      />
                    </div>
                  </div>
                )}

                {formData.gazette_type === 'CHANGE_OF_DATE_OF_BIRTH' && (
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-green-900 mb-4">Change of Date of Birth Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Old Date of Birth</label>
                        <input
                          type="date"
                          value={formData.old_date_of_birth}
                          onChange={(e) => setFormData(prev => ({ ...prev, old_date_of_birth: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">New Date of Birth</label>
                        <input
                          type="date"
                          value={formData.new_date_of_birth}
                          onChange={(e) => setFormData(prev => ({ ...prev, new_date_of_birth: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Place of Birth</label>
                        <input
                          type="text"
                          value={formData.place_of_birth}
                          onChange={(e) => setFormData(prev => ({ ...prev, place_of_birth: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Place of birth"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {formData.gazette_type === 'CHANGE_OF_PLACE_OF_BIRTH' && (
                  <div className="bg-orange-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-orange-900 mb-4">Change of Place of Birth Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Old Place of Birth</label>
                        <input
                          type="text"
                          value={formData.old_place_of_birth}
                          onChange={(e) => setFormData(prev => ({ ...prev, old_place_of_birth: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Original place of birth"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">New Place of Birth</label>
                        <input
                          type="text"
                          value={formData.new_place_of_birth}
                          onChange={(e) => setFormData(prev => ({ ...prev, new_place_of_birth: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="New place of birth"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {formData.gazette_type === 'APPOINTMENT_OF_MARRIAGE_OFFICERS' && (
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-purple-900 mb-4">Marriage Officer Appointment Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Officer Name</label>
                        <input
                          type="text"
                          value={formData.officer_name}
                          onChange={(e) => setFormData(prev => ({ ...prev, officer_name: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Name of appointed marriage officer"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Officer Title</label>
                        <input
                          type="text"
                          value={formData.officer_title}
                          onChange={(e) => setFormData(prev => ({ ...prev, officer_title: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Title/position"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Appointment Authority</label>
                        <input
                          type="text"
                          value={formData.appointment_authority}
                          onChange={(e) => setFormData(prev => ({ ...prev, appointment_authority: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Authority making the appointment"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Jurisdiction Area</label>
                        <input
                          type="text"
                          value={formData.jurisdiction_area}
                          onChange={(e) => setFormData(prev => ({ ...prev, jurisdiction_area: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Area of jurisdiction"
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditModal(false);
                      setSelectedGazette(null);
                      resetForm();
                    }}
                    className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Update Gazette Entry
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Import Modal */}
      {showImportModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={() => {
            setShowImportModal(false);
            resetImportForm();
          }}
        >
          <div 
            className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <FileSpreadsheet className="h-6 w-6 mr-2 text-green-600" />
                  Import Gazette Data
                </h2>
                <button
                  onClick={() => {
                    setShowImportModal(false);
                    resetImportForm();
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleImport} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Gazette Type
                  </label>
                  <select
                    value={importType}
                    onChange={(e) => setImportType(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="CHANGE_OF_NAME">Change of Name</option>
                    <option value="CHANGE_OF_DATE_OF_BIRTH">Change of Date of Birth</option>
                    <option value="CHANGE_OF_PLACE_OF_BIRTH">Change of Place of Birth</option>
                    <option value="APPOINTMENT_OF_MARRIAGE_OFFICERS">Appointment of Marriage Officers</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Excel File
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                    <input
                      type="file"
                      accept=".xlsx,.xls"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="file-upload"
                    />
                    <label
                      htmlFor="file-upload"
                      className="cursor-pointer flex flex-col items-center"
                    >
                      <Upload className="h-12 w-12 text-gray-400 mb-2" />
                      <span className="text-sm text-gray-600">
                        {importFile ? importFile.name : 'Click to select Excel file'}
                      </span>
                      <span className="text-xs text-gray-500 mt-1">
                        Supports .xlsx and .xls files
                      </span>
                    </label>
                  </div>
                </div>

                {importResult && (
                  <div className={`p-4 rounded-lg ${
                    importResult.success 
                      ? 'bg-green-50 border border-green-200' 
                      : 'bg-red-50 border border-red-200'
                  }`}>
                    <div className="flex items-center">
                      {importResult.success ? (
                        <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                      ) : (
                        <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
                      )}
                      <span className={`text-sm font-medium ${
                        importResult.success ? 'text-green-800' : 'text-red-800'
                      }`}>
                        {importResult.message}
                      </span>
                    </div>
                    {importResult.details && (
                      <div className="mt-2 text-xs text-gray-600">
                        <pre className="whitespace-pre-wrap">
                          {JSON.stringify(importResult.details, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowImportModal(false);
                      resetImportForm();
                    }}
                    className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                    disabled={importing}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!importFile || importing}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    {importing ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Importing...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        Import Data
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default GazetteManagement;
