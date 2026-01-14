import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Trash2, 
  Calendar,
  Scale,
  User,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Download,
  ExternalLink,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  X,
  Save,
  Upload,
  File
} from 'lucide-react';

// Case Form Component
const CaseForm = ({ caseData, onSave, onCancel, saving = false }) => {
  const [formData, setFormData] = useState({
    title: '',
    suit_reference_number: '',
    date: '',
    presiding_judge: '',
    protagonist: '',
    antagonist: '',
    court_type: '',
    court_division: '',
    status: '',
    statutes_cited: '',
    cases_cited: '',
    lawyers: '',
    commentary: '',
    headnotes: '',
    town: '',
    region: '',
    dl_citation_no: '',
    file_url: '',
    judgement: '',
    year: '',
    type: '',
    firebase_url: '',
    summernote: '',
    detail_content: '',
    decision: '',
    citation: '',
    file_name: '',
    c_t: '',
    judgement_by: '',
    case_summary: '',
    area_of_law: '',
    keywords_phrases: '',
    published: false,
    dl_type: '',
    academic_programme_id: '',
    opinion_by: '',
    conclusion: ''
  });

  useEffect(() => {
    if (caseData) {
      setFormData({
        title: caseData.title || '',
        suit_reference_number: caseData.suit_reference_number || '',
        date: caseData.date ? caseData.date.split('T')[0] : '',
        presiding_judge: caseData.presiding_judge || '',
        protagonist: caseData.protagonist || '',
        antagonist: caseData.antagonist || '',
        court_type: caseData.court_type || '',
        court_division: caseData.court_division || '',
        status: caseData.status || '',
        statutes_cited: caseData.statutes_cited || '',
        cases_cited: caseData.cases_cited || '',
        lawyers: caseData.lawyers || '',
        commentary: caseData.commentary || '',
        headnotes: caseData.headnotes || '',
        town: caseData.town || '',
        region: caseData.region || '',
        dl_citation_no: caseData.dl_citation_no || '',
        file_url: caseData.file_url || '',
        judgement: caseData.judgement || '',
        year: caseData.year || '',
        type: caseData.type || '',
        firebase_url: caseData.firebase_url || '',
        summernote: caseData.summernote || '',
        detail_content: caseData.detail_content || '',
        decision: caseData.decision || '',
        citation: caseData.citation || '',
        file_name: caseData.file_name || '',
        c_t: caseData.c_t || '',
        judgement_by: caseData.judgement_by || '',
        case_summary: caseData.case_summary || '',
        area_of_law: caseData.area_of_law || '',
        keywords_phrases: caseData.keywords_phrases || '',
        published: caseData.published || false,
        dl_type: caseData.dl_type || '',
        academic_programme_id: caseData.academic_programme_id || '',
        opinion_by: caseData.opinion_by || '',
        conclusion: caseData.conclusion || ''
      });
    }
  }, [caseData]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Basic Information */}
        <div className="space-y-4">
          <h4 className="text-md font-semibold text-slate-900 border-b pb-2">Basic Information</h4>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Title *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Suit Reference Number</label>
            <input
              type="text"
              name="suit_reference_number"
              value={formData.suit_reference_number}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Presiding Judge</label>
            <input
              type="text"
              name="presiding_judge"
              value={formData.presiding_judge}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Protagonist</label>
            <input
              type="text"
              name="protagonist"
              value={formData.protagonist}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Antagonist</label>
            <input
              type="text"
              name="antagonist"
              value={formData.antagonist}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
            />
          </div>
        </div>

        {/* Court Information */}
        <div className="space-y-4">
          <h4 className="text-md font-semibold text-slate-900 border-b pb-2">Court Information</h4>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Court Type</label>
            <select
              name="court_type"
              value={formData.court_type}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
            >
              <option value="">Select Court Type</option>
              <option value="supreme">Supreme Court</option>
              <option value="appeal">Appeal Court</option>
              <option value="high">High Court</option>
              <option value="circuit">Circuit Court</option>
              <option value="district">District Court</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Court Division</label>
            <input
              type="text"
              name="court_division"
              value={formData.court_division}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
            >
              <option value="">Select Status</option>
              <option value="active">Active</option>
              <option value="closed">Closed</option>
              <option value="pending">Pending</option>
              <option value="dismissed">Dismissed</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Town</label>
            <input
              type="text"
              name="town"
              value={formData.town}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Region</label>
            <input
              type="text"
              name="region"
              value={formData.region}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Year</label>
            <input
              type="number"
              name="year"
              value={formData.year}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
            />
          </div>
        </div>
      </div>

      {/* Additional Information */}
      <div className="space-y-4">
        <h4 className="text-md font-semibold text-slate-900 border-b pb-2">Additional Information</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Statutes Cited</label>
            <textarea
              name="statutes_cited"
              value={formData.statutes_cited}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Cases Cited</label>
            <textarea
              name="cases_cited"
              value={formData.cases_cited}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Lawyers</label>
            <textarea
              name="lawyers"
              value={formData.lawyers}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Commentary</label>
            <textarea
              name="commentary"
              value={formData.commentary}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Case Summary</label>
          <textarea
            name="case_summary"
            value={formData.case_summary}
            onChange={handleInputChange}
            rows={4}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Keywords/Phrases</label>
          <textarea
            name="keywords_phrases"
            value={formData.keywords_phrases}
            onChange={handleInputChange}
            rows={2}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
          />
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            name="published"
            checked={formData.published}
            onChange={handleInputChange}
            className="h-4 w-4 text-sky-600 focus:ring-sky-500 border-slate-300 rounded"
          />
          <label className="ml-2 block text-sm text-slate-700">
            Published
          </label>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-3 pt-4 border-t">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
        >
          <span style={{ fontFamily: 'Satoshi' }}>Cancel</span>
        </button>
        <button
          type="submit"
          disabled={saving}
          className="px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span style={{ fontFamily: 'Satoshi' }}>{caseData ? 'Updating...' : 'Creating...'}</span>
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              <span style={{ fontFamily: 'Satoshi' }}>{caseData ? 'Update Case' : 'Create Case'}</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
};

const CaseManagement = () => {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [courtTypeFilter, setCourtTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCases, setTotalCases] = useState(0);
  const [selectedCase, setSelectedCase] = useState(null);
  const [showCaseModal, setShowCaseModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [editingCase, setEditingCase] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [extractedData, setExtractedData] = useState(null);
  const [notification, setNotification] = useState(null);
  const [caseStats, setCaseStats] = useState({
    totalCases: 0,
    activeCases: 0,
    closedCases: 0,
    pendingCases: 0,
    dismissedCases: 0,
    recentCases: 0,
    courtTypeDistribution: {},
    statusDistribution: {},
    yearDistribution: {},
    regionDistribution: {}
  });

  useEffect(() => {
    loadCases();
    loadCaseStats();
  }, [currentPage, searchTerm, courtTypeFilter, statusFilter]);

  useEffect(() => {
    loadCaseStats();
  }, []);

  const loadCases = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10'
      });

      if (searchTerm) params.append('search', searchTerm);
      if (courtTypeFilter) params.append('court_type', courtTypeFilter);
      if (statusFilter) params.append('status', statusFilter);

      const response = await fetch(`/api/admin/cases?${params}`);
      const data = await response.json();

      if (response.ok) {
        setCases(data.cases || []);
        setTotalPages(data.total_pages || 1);
        setTotalCases(data.total || 0);
      } else {
        console.error('Error loading cases:', data.detail);
      }
    } catch (error) {
      console.error('Error loading cases:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCaseStats = async () => {
    try {
      const response = await fetch('/api/admin/cases/stats');
      const data = await response.json();

      if (response.ok) {
        setCaseStats(data);
      } else {
        console.error('Error loading case stats:', data.detail);
      }
    } catch (error) {
      console.error('Error loading case stats:', error);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleFilterChange = (filterType, value) => {
    if (filterType === 'court_type') {
      setCourtTypeFilter(value);
    } else if (filterType === 'status') {
      setStatusFilter(value);
    }
    setCurrentPage(1);
  };

  const handleViewCase = (caseItem) => {
    setSelectedCase(caseItem);
    setShowCaseModal(true);
  };

  const handleDeleteCase = (caseItem) => {
    setSelectedCase(caseItem);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/admin/cases/${selectedCase.id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setShowDeleteModal(false);
        setSelectedCase(null);
        loadCases();
      } else {
        const data = await response.json();
        console.error('Error deleting case:', data.detail);
      }
    } catch (error) {
      console.error('Error deleting case:', error);
    }
  };

  const handleCreateCase = () => {
    setEditingCase(null);
    setShowCreateModal(true);
  };

  const handleUploadCase = () => {
    setUploadedFile(null);
    setExtractedData(null);
    setShowUploadModal(true);
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Check file type
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(file.type)) {
        setNotification({
          type: 'error',
          message: 'Please upload a PDF or Word document (.pdf, .doc, .docx)'
        });
        return;
      }
      
      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setNotification({
          type: 'error',
          message: 'File size must be less than 10MB'
        });
        return;
      }
      
      setUploadedFile(file);
    }
  };

  const handleUploadSubmit = async () => {
    if (!uploadedFile) {
      setNotification({
        type: 'error',
        message: 'Please select a file to upload'
      });
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', uploadedFile);
      
      const response = await fetch('/admin/cases/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        setExtractedData(result.extracted_data);
        setNotification({
          type: 'success',
          message: `Case uploaded and analyzed successfully! Case ID: ${result.case_id}`
        });
        // Don't close modal immediately, show extracted data first
        loadCases(); // Refresh the cases list
      } else {
        const error = await response.json();
        setNotification({
          type: 'error',
          message: error.detail || 'Failed to upload case'
        });
      }
    } catch (error) {
      console.error('Error uploading case:', error);
      setNotification({
        type: 'error',
        message: 'Failed to upload case'
      });
    } finally {
      setUploading(false);
    }
  };

  const handleEditCase = (caseItem) => {
    setEditingCase(caseItem);
    setShowEditModal(true);
  };

  const handleSaveCase = async (caseData) => {
    try {
      setSaving(true);
      
      // Validate required fields
      if (!caseData.title || caseData.title.trim() === '') {
        setNotification({ type: 'error', message: 'Title is required' });
        setTimeout(() => setNotification(null), 3000);
        setSaving(false);
        return;
      }

      // Validate year if provided
      if (caseData.year && (isNaN(parseInt(caseData.year)) || parseInt(caseData.year) < 1900 || parseInt(caseData.year) > 2030)) {
        setNotification({ type: 'error', message: 'Year must be a valid number between 1900 and 2030' });
        setTimeout(() => setNotification(null), 3000);
        setSaving(false);
        return;
      }

      // Transform form data for backend
      const transformedData = {
        ...caseData,
        // Convert date string to ISO format
        date: caseData.date ? new Date(caseData.date).toISOString() : null,
        // Convert year to integer
        year: caseData.year ? parseInt(caseData.year) : null,
        // Convert academic_programme_id to integer
        academic_programme_id: caseData.academic_programme_id ? parseInt(caseData.academic_programme_id) : null,
        // Convert published to boolean
        published: Boolean(caseData.published),
        // Remove empty strings and convert to null
        ...Object.fromEntries(
          Object.entries(caseData).map(([key, value]) => [
            key, 
            value === '' ? null : value
          ])
        )
      };


      const url = editingCase 
        ? `/api/admin/cases/${editingCase.id}`
        : '/api/admin/cases';
      
      const method = editingCase ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(transformedData)
      });

      if (response.ok) {
        const result = await response.json();
        setShowCreateModal(false);
        setShowEditModal(false);
        setEditingCase(null);
        loadCases();
        setNotification({ type: 'success', message: 'Case saved successfully!' });
        setTimeout(() => setNotification(null), 3000);
      } else {
        const errorData = await response.json();
        console.error('Error saving case:', errorData);
        setNotification({ type: 'error', message: `Error saving case: ${errorData.detail || 'Unknown error'}` });
        setTimeout(() => setNotification(null), 5000);
      }
    } catch (error) {
      console.error('Error saving case:', error);
      setNotification({ type: 'error', message: `Error saving case: ${error.message}` });
      setTimeout(() => setNotification(null), 5000);
    } finally {
      setSaving(false);
    }
  };

  const getCourtTypeBadgeColor = (courtType) => {
    switch (courtType?.toLowerCase()) {
      case 'supreme': return 'bg-purple-100 text-purple-800';
      case 'appeal': return 'bg-blue-100 text-blue-800';
      case 'high': return 'bg-green-100 text-green-800';
      case 'circuit': return 'bg-yellow-100 text-yellow-800';
      case 'district': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusBadgeColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'dismissed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const truncateText = (text, maxLength = 100) => {
    if (!text) return 'N/A';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  return (
    <div className="space-y-6 bg-white dark:bg-slate-900 min-h-screen transition-colors duration-200">
      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg ${
          notification.type === 'success' 
            ? 'bg-green-100 dark:bg-green-900/20 border border-green-400 dark:border-green-600 text-green-700 dark:text-green-300' 
            : 'bg-red-100 dark:bg-red-900/20 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-300'
        }`}>
          <div className="flex items-center">
            {notification.type === 'success' ? (
              <CheckCircle className="h-5 w-5 mr-2" />
            ) : (
              <XCircle className="h-5 w-5 mr-2" />
            )}
            <span>{notification.message}</span>
            <button
              onClick={() => setNotification(null)}
              className="ml-4 text-current hover:opacity-70"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Case Management</h2>
          <p className="text-slate-600 dark:text-slate-300">Manage cases, metadata, analytics and statistics</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleCreateCase}
            className="bg-sky-600 hover:bg-sky-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <FileText className="h-4 w-4" />
            <span style={{ fontFamily: 'Satoshi' }}>Create Case</span>
          </button>
          <button
            onClick={handleUploadCase}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Upload className="h-4 w-4" />
            <span style={{ fontFamily: 'Satoshi' }}>Upload Case</span>
          </button>
        </div>
      </div>

      {/* Case Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {/* Total Cases */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow border border-slate-200 dark:border-slate-700 transition-colors duration-200">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Cases</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{caseStats.totalCases.toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* Active Cases */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow border border-slate-200 dark:border-slate-700 transition-colors duration-200">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Active Cases</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{caseStats.activeCases.toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* Recent Cases */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow border border-slate-200 dark:border-slate-700 transition-colors duration-200">
          <div className="flex items-center">
            <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
              <Clock className="h-6 w-6 text-amber-600 dark:text-amber-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Recent (30 days)</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{caseStats.recentCases.toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* Pending Cases */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow border border-slate-200 dark:border-slate-700 transition-colors duration-200">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
              <AlertCircle className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Pending Cases</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{caseStats.pendingCases.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {/* Closed Cases */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-gray-100 rounded-lg">
              <X className="h-6 w-6 text-gray-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-slate-600">Closed Cases</p>
              <p className="text-2xl font-bold text-slate-900">{caseStats.closedCases.toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* Dismissed Cases */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <X className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-slate-600">Dismissed Cases</p>
              <p className="text-2xl font-bold text-slate-900">{caseStats.dismissedCases.toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* Court Types Count */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Scale className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-slate-600">Court Types</p>
              <p className="text-2xl font-bold text-slate-900">{Object.keys(caseStats.courtTypeDistribution).length}</p>
            </div>
          </div>
        </div>

        {/* Regions Count */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <MapPin className="h-6 w-6 text-indigo-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-slate-600">Regions</p>
              <p className="text-2xl font-bold text-slate-900">{Object.keys(caseStats.regionDistribution).length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Case Distribution Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Court Type Distribution */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Cases by Court Type</h3>
          <div className="space-y-3">
            {Object.entries(caseStats.courtTypeDistribution).map(([courtType, count]) => {
              const percentage = caseStats.totalCases > 0 ? (count / caseStats.totalCases) * 100 : 0;
              return (
                <div key={courtType} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-sky-500 mr-3"></div>
                    <span className="text-sm font-medium text-slate-700">{courtType}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-sm text-slate-600 mr-2">{count.toLocaleString()}</span>
                    <span className="text-xs text-slate-500">({percentage.toFixed(1)}%)</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Status Distribution */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Cases by Status</h3>
          <div className="space-y-3">
            {Object.entries(caseStats.statusDistribution).map(([status, count]) => {
              const percentage = caseStats.totalCases > 0 ? (count / caseStats.totalCases) * 100 : 0;
              const statusColors = {
                active: 'bg-green-500',
                closed: 'bg-gray-500',
                pending: 'bg-yellow-500',
                dismissed: 'bg-red-500'
              };
              return (
                <div key={status} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={`w-3 h-3 rounded-full ${statusColors[status] || 'bg-sky-500'} mr-3`}></div>
                    <span className="text-sm font-medium text-slate-700 capitalize">{status}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-sm text-slate-600 mr-2">{count.toLocaleString()}</span>
                    <span className="text-xs text-slate-500">({percentage.toFixed(1)}%)</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Year Distribution */}
      {Object.keys(caseStats.yearDistribution).length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Cases by Year (Last 10 Years)</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {Object.entries(caseStats.yearDistribution)
              .sort(([a], [b]) => parseInt(b) - parseInt(a))
              .map(([year, count]) => {
                const percentage = caseStats.totalCases > 0 ? (count / caseStats.totalCases) * 100 : 0;
                return (
                  <div key={year} className="text-center">
                    <div className="text-2xl font-bold text-slate-900">{count.toLocaleString()}</div>
                    <div className="text-sm text-slate-600">{year}</div>
                    <div className="text-xs text-slate-500">({percentage.toFixed(1)}%)</div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search cases..."
              value={searchTerm}
              onChange={handleSearch}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
            />
          </div>
          
          <select
            value={courtTypeFilter}
            onChange={(e) => handleFilterChange('court_type', e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
          >
            <option value="">All Court Types</option>
            <option value="supreme">Supreme Court</option>
            <option value="appeal">Appeal Court</option>
            <option value="high">High Court</option>
            <option value="circuit">Circuit Court</option>
            <option value="district">District Court</option>
          </select>
          
          <select
            value={statusFilter}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="closed">Closed</option>
            <option value="pending">Pending</option>
            <option value="dismissed">Dismissed</option>
          </select>
          
          <div className="text-sm text-slate-600 flex items-center">
            <FileText className="h-4 w-4 mr-2" />
            {totalCases} total cases
          </div>
        </div>
      </div>

      {/* Cases Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600 mx-auto"></div>
            <p className="mt-2 text-slate-600">Loading cases...</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto w-full">
              <table className="min-w-full divide-y divide-slate-200 w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Case Title
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Court Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Judge
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {cases.map((caseItem) => (
                    <tr key={caseItem.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4">
                        <div className="flex items-start">
                          <FileText className="h-4 w-4 text-slate-400 mr-2 mt-1 flex-shrink-0" />
                          <div className="min-w-0 flex-1">
                            <div className="text-sm font-medium text-slate-900">
                              {truncateText(caseItem.title, 60)}
                            </div>
                            <div className="text-sm text-slate-500">
                              {caseItem.suit_reference_number && (
                                <span className="inline-flex items-center">
                                  <Scale className="h-3 w-3 mr-1" />
                                  {caseItem.suit_reference_number}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getCourtTypeBadgeColor(caseItem.court_type)}`}>
                          {caseItem.court_type || 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(caseItem.status)}`}>
                          {caseItem.status || 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                        {formatDate(caseItem.date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                        {truncateText(caseItem.presiding_judge, 20)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleViewCase(caseItem)}
                            className="text-slate-600 hover:text-slate-900 p-1"
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleEditCase(caseItem)}
                            className="text-amber-600 hover:text-amber-900 p-1"
                            title="Edit Case"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteCase(caseItem)}
                            className="text-red-600 hover:text-red-900 p-1"
                            title="Delete Case"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-slate-200">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-4 py-2 border border-slate-300 text-sm font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-slate-300 text-sm font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-slate-700">
                      Showing page <span className="font-medium">{currentPage}</span> of{' '}
                      <span className="font-medium">{totalPages}</span>
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-slate-300 bg-white text-sm font-medium text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-slate-300 bg-white text-sm font-medium text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronRight className="h-5 w-5" />
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Case Detail Modal */}
      {showCaseModal && selectedCase && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-slate-900">Case Details</h3>
              <button
                onClick={() => setShowCaseModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-medium text-slate-500 mb-2">Case Title</h4>
                  <p className="text-sm text-slate-900">{selectedCase.title || 'N/A'}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-slate-500 mb-2">Suit Reference Number</h4>
                  <p className="text-sm text-slate-900">{selectedCase.suit_reference_number || 'N/A'}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-slate-500 mb-2">Court Type</h4>
                  <p className="text-sm text-slate-900">{selectedCase.court_type || 'N/A'}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-slate-500 mb-2">Court Division</h4>
                  <p className="text-sm text-slate-900">{selectedCase.court_division || 'N/A'}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-slate-500 mb-2">Date</h4>
                  <p className="text-sm text-slate-900">{formatDate(selectedCase.date)}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-slate-500 mb-2">Status</h4>
                  <p className="text-sm text-slate-900">{selectedCase.status || 'N/A'}</p>
                </div>
              </div>

              {/* Parties */}
              <div>
                <h4 className="text-sm font-medium text-slate-500 mb-2">Parties</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-slate-500">Protagonist</p>
                    <p className="text-sm text-slate-900">{selectedCase.protagonist || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Antagonist</p>
                    <p className="text-sm text-slate-900">{selectedCase.antagonist || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Judge and Lawyers */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-medium text-slate-500 mb-2">Presiding Judge</h4>
                  <p className="text-sm text-slate-900">{selectedCase.presiding_judge || 'N/A'}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-slate-500 mb-2">Lawyers</h4>
                  <p className="text-sm text-slate-900">{selectedCase.lawyers || 'N/A'}</p>
                </div>
              </div>

              {/* Location */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-medium text-slate-500 mb-2">Town</h4>
                  <p className="text-sm text-slate-900">{selectedCase.town || 'N/A'}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-slate-500 mb-2">Region</h4>
                  <p className="text-sm text-slate-900">{selectedCase.region || 'N/A'}</p>
                </div>
              </div>

              {/* Case Content */}
              {selectedCase.decision && (
                <div>
                  <h4 className="text-sm font-medium text-slate-500 mb-2">Decision</h4>
                  <div className="bg-slate-50 rounded-lg p-4 max-h-40 overflow-y-auto">
                    <p className="text-sm text-slate-900 whitespace-pre-wrap">{selectedCase.decision}</p>
                  </div>
                </div>
              )}

              {/* AI Summary */}
              {selectedCase.ai_case_outcome && (
                <div>
                  <h4 className="text-sm font-medium text-slate-500 mb-2">AI Case Outcome</h4>
                  <div className="bg-blue-50 rounded-lg p-4">
                    <p className="text-sm text-slate-900">{selectedCase.ai_case_outcome}</p>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200">
                {selectedCase.file_url && (
                  <a
                    href={selectedCase.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-3 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View File
                  </a>
                )}
                <button
                  onClick={() => setShowCaseModal(false)}
                  className="px-4 py-2 text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedCase && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center space-x-3 mb-4">
              <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                <Trash2 className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Delete Case</h3>
                <p className="text-sm text-slate-600">This action cannot be undone.</p>
              </div>
            </div>
            
            <p className="text-slate-700 mb-6">
              Are you sure you want to delete this case? This will permanently remove the case and all associated data.
            </p>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete Case
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create/Edit Case Modal */}
      {(showCreateModal || showEditModal) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-slate-900">
                {editingCase ? 'Edit Case' : 'Create New Case'}
              </h3>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setShowEditModal(false);
                  setEditingCase(null);
                }}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <CaseForm
              caseData={editingCase}
              onSave={handleSaveCase}
              onCancel={() => {
                setShowCreateModal(false);
                setShowEditModal(false);
                setEditingCase(null);
              }}
              saving={saving}
            />
          </div>
        </div>
      )}

      {/* Upload Case Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-slate-900">
                Upload Case Document
              </h3>
              <button
                onClick={() => {
                  setShowUploadModal(false);
                  setUploadedFile(null);
                  setExtractedData(null);
                }}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Select Document
                </label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed border-slate-300 rounded-lg hover:border-slate-400 transition-colors">
                  <div className="space-y-1 text-center">
                    <Upload className="mx-auto h-12 w-12 text-slate-400" />
                    <div className="flex text-sm text-slate-600">
                      <label
                        htmlFor="file-upload"
                        className="relative cursor-pointer bg-white rounded-md font-medium text-sky-600 hover:text-sky-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-sky-500"
                      >
                        <span>Upload a file</span>
                        <input
                          id="file-upload"
                          name="file-upload"
                          type="file"
                          className="sr-only"
                          accept=".pdf,.doc,.docx"
                          onChange={handleFileUpload}
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-slate-500">
                      PDF, DOC, DOCX up to 10MB
                    </p>
                  </div>
                </div>
              </div>

              {uploadedFile && (
                <div className="flex items-center p-3 bg-slate-50 rounded-lg">
                  <File className="h-5 w-5 text-slate-400 mr-3" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">
                      {uploadedFile.name}
                    </p>
                    <p className="text-sm text-slate-500">
                      {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
              )}

              {extractedData && (
                <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h4 className="text-sm font-medium text-green-800 mb-3">📊 Extracted Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="font-medium text-slate-700">Title:</span>
                      <p className="text-slate-600 truncate">{extractedData.title || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="font-medium text-slate-700">Suit Number:</span>
                      <p className="text-slate-600">{extractedData.suit_reference_number || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="font-medium text-slate-700">Parties:</span>
                      <p className="text-slate-600 truncate">{extractedData.parties || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="font-medium text-slate-700">Court:</span>
                      <p className="text-slate-600">{extractedData.court || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="font-medium text-slate-700">Judge:</span>
                      <p className="text-slate-600 truncate">{extractedData.judge || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="font-medium text-slate-700">Area of Law:</span>
                      <p className="text-slate-600">{extractedData.area_of_law || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  onClick={() => {
                    setShowUploadModal(false);
                    setUploadedFile(null);
                    setExtractedData(null);
                  }}
                  className="px-4 py-2 text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
                >
                  {extractedData ? 'Close' : 'Cancel'}
                </button>
                {!extractedData ? (
                  <button
                    onClick={handleUploadSubmit}
                    disabled={!uploadedFile || uploading}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                  >
                    {uploading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4" />
                        Upload Case
                      </>
                    )}
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setShowUploadModal(false);
                      setUploadedFile(null);
                      setExtractedData(null);
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                  >
                    <CheckCircle className="h-4 w-4" />
                    Done
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CaseManagement;
