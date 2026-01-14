import React, { useState, useEffect } from 'react';
import { 
  UserCheck, 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Trash2, 
  Calendar,
  MapPin,
  Phone,
  Mail,
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  ChevronLeft,
  ChevronRight,
  X,
  BarChart3,
  TrendingUp,
  Users,
  DollarSign,
  Percent,
  BookOpen,
  Calculator,
  Clock,
  RefreshCw,
  Scale,
  History,
  Building2,
  Star,
  User
} from 'lucide-react';

// Person Form Component
const PersonForm = ({ personData, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    full_name: '',
    previous_names: '',
    date_of_birth: '',
    date_of_death: '',
    id_number: '',
    phone_number: '',
    email: '',
    address: '',
    city: '',
    region: '',
    country: '',
    postal_code: '',
    risk_level: '',
    risk_score: '',
    case_count: '',
    case_types: '',
    court_records: '',
    occupation: '',
    employer: '',
    organization: '',
    job_title: '',
    marital_status: '',
    spouse_name: '',
    children_count: '',
    emergency_contact: '',
    emergency_phone: '',
    nationality: '',
    gender: '',
    education_level: '',
    languages: '',
    is_verified: false,
    verification_notes: '',
    notes: ''
  });

  useEffect(() => {
    if (personData) {
      setFormData({
        first_name: personData.first_name || '',
        last_name: personData.last_name || '',
        full_name: personData.full_name || '',
        previous_names: personData.previous_names || '',
        date_of_birth: personData.date_of_birth ? personData.date_of_birth.split('T')[0] : '',
        date_of_death: personData.date_of_death ? personData.date_of_death.split('T')[0] : '',
        id_number: personData.id_number || '',
        phone_number: personData.phone_number || '',
        email: personData.email || '',
        address: personData.address || '',
        city: personData.city || '',
        region: personData.region || '',
        country: personData.country || '',
        postal_code: personData.postal_code || '',
        risk_level: personData.risk_level || '',
        risk_score: personData.risk_score || '',
        case_count: personData.case_count || '',
        case_types: personData.case_types || '',
        court_records: personData.court_records || '',
        occupation: personData.occupation || '',
        employer: personData.employer || '',
        organization: personData.organization || '',
        job_title: personData.job_title || '',
        marital_status: personData.marital_status || '',
        spouse_name: personData.spouse_name || '',
        children_count: personData.children_count || '',
        emergency_contact: personData.emergency_contact || '',
        emergency_phone: personData.emergency_phone || '',
        nationality: personData.nationality || '',
        gender: personData.gender || '',
        education_level: personData.education_level || '',
        languages: personData.languages || '',
        is_verified: personData.is_verified || false,
        verification_notes: personData.verification_notes || '',
        notes: personData.notes || ''
      });
    }
  }, [personData]);

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
            <label className="block text-sm font-medium text-slate-700 mb-1">First Name *</label>
            <input
              type="text"
              name="first_name"
              value={formData.first_name}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Last Name *</label>
            <input
              type="text"
              name="last_name"
              value={formData.last_name}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
            <input
              type="text"
              name="full_name"
              value={formData.full_name}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Previous Names</label>
            <input
              type="text"
              name="previous_names"
              value={formData.previous_names}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Date of Birth</label>
            <input
              type="date"
              name="date_of_birth"
              value={formData.date_of_birth}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Gender</label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
            >
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>

        {/* Contact Information */}
        <div className="space-y-4">
          <h4 className="text-md font-semibold text-slate-900 border-b pb-2">Contact Information</h4>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
            <input
              type="tel"
              name="phone_number"
              value={formData.phone_number}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Address</label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">City</label>
            <input
              type="text"
              name="city"
              value={formData.city}
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
            <label className="block text-sm font-medium text-slate-700 mb-1">Country</label>
            <input
              type="text"
              name="country"
              value={formData.country}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
            />
          </div>
        </div>
      </div>

      {/* Risk Assessment */}
      <div className="space-y-4">
        <h4 className="text-md font-semibold text-slate-900 border-b pb-2">Risk Assessment</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Risk Level</label>
            <select
              name="risk_level"
              value={formData.risk_level}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
            >
              <option value="">Select Risk Level</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="very high">Very High</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Risk Score</label>
            <input
              type="number"
              name="risk_score"
              value={formData.risk_score}
              onChange={handleInputChange}
              min="0"
              max="100"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Case Count</label>
            <input
              type="number"
              name="case_count"
              value={formData.case_count}
              onChange={handleInputChange}
              min="0"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Case Types</label>
            <input
              type="text"
              name="case_types"
              value={formData.case_types}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Court Records</label>
          <textarea
            name="court_records"
            value={formData.court_records}
            onChange={handleInputChange}
            rows={3}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
          />
        </div>
      </div>

      {/* Professional Information */}
      <div className="space-y-4">
        <h4 className="text-md font-semibold text-slate-900 border-b pb-2">Professional Information</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Occupation</label>
            <input
              type="text"
              name="occupation"
              value={formData.occupation}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Employer</label>
            <input
              type="text"
              name="employer"
              value={formData.employer}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Organization</label>
            <input
              type="text"
              name="organization"
              value={formData.organization}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Job Title</label>
            <input
              type="text"
              name="job_title"
              value={formData.job_title}
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
            <label className="block text-sm font-medium text-slate-700 mb-1">Nationality</label>
            <input
              type="text"
              name="nationality"
              value={formData.nationality}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Education Level</label>
            <select
              name="education_level"
              value={formData.education_level}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
            >
              <option value="">Select Education Level</option>
              <option value="primary">Primary</option>
              <option value="secondary">Secondary</option>
              <option value="diploma">Diploma</option>
              <option value="bachelor">Bachelor's Degree</option>
              <option value="master">Master's Degree</option>
              <option value="phd">PhD</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Languages</label>
            <input
              type="text"
              name="languages"
              value={formData.languages}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Marital Status</label>
            <select
              name="marital_status"
              value={formData.marital_status}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
            >
              <option value="">Select Marital Status</option>
              <option value="single">Single</option>
              <option value="married">Married</option>
              <option value="divorced">Divorced</option>
              <option value="widowed">Widowed</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleInputChange}
            rows={4}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
          />
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            name="is_verified"
            checked={formData.is_verified}
            onChange={handleInputChange}
            className="h-4 w-4 text-sky-600 focus:ring-sky-500 border-slate-300 rounded"
          />
          <label className="ml-2 block text-sm text-slate-700">
            Verified
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
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors flex items-center gap-2"
        >
          <UserCheck className="h-4 w-4" />
          {personData ? 'Update Person' : 'Create Person'}
        </button>
      </div>
    </form>
  );
};

const PeopleManagement = () => {
  const [people, setPeople] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [riskLevelFilter, setRiskLevelFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalPeople, setTotalPeople] = useState(0);
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [showPersonModal, setShowPersonModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingPerson, setEditingPerson] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [personAnalytics, setPersonAnalytics] = useState(null);
  const [personCaseStats, setPersonCaseStats] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);

  useEffect(() => {
    loadPeople();
    loadAnalytics();
  }, [currentPage, searchTerm, riskLevelFilter]);

  const loadPeople = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10'
      });

      if (searchTerm) params.append('search', searchTerm);
      if (riskLevelFilter) params.append('risk_level', riskLevelFilter);

      const url = `/api/admin/people?${params}`;
      
      const response = await fetch(url);
      const data = await response.json();

      if (response.ok) {
        setPeople(data.people || []);
        setTotalPages(data.total_pages || 1);
        setTotalPeople(data.total || 0);
      } else {
        console.error('Error loading people:', data.detail);
      }
    } catch (error) {
      console.error('Error loading people:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAnalytics = async () => {
    try {
      const response = await fetch('/api/admin/people/stats');
      const data = await response.json();
      if (response.ok) {
        setAnalytics(data);
      }
    } catch (error) {
      console.error('Error loading analytics:', error);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleRiskLevelFilter = (e) => {
    setRiskLevelFilter(e.target.value);
    setCurrentPage(1);
  };

  const handleViewPerson = async (person) => {
    setSelectedPerson(person);
    setShowPersonModal(true);
    
    // Load detailed analytics for this person
    await loadPersonAnalytics(person.id);
  };

  const loadPersonAnalytics = async (personId) => {
    try {
      setAnalyticsLoading(true);
      
      // Load person analytics
      const analyticsResponse = await fetch(`/api/person/${personId}/analytics`);
      if (analyticsResponse.ok) {
        const analyticsData = await analyticsResponse.json();
        setPersonAnalytics(analyticsData);
      } else {
        setPersonAnalytics(null);
      }
      
      // Load case statistics
      const statsResponse = await fetch(`/api/person-case-statistics/person/${personId}`);
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setPersonCaseStats(statsData);
      } else {
        setPersonCaseStats(null);
      }
    } catch (error) {
      console.error('Error loading person analytics:', error);
      setPersonAnalytics(null);
      setPersonCaseStats(null);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const handleDeletePerson = (person) => {
    setSelectedPerson(person);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/admin/people/${selectedPerson.id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setShowDeleteModal(false);
        setSelectedPerson(null);
        loadPeople();
      } else {
        const data = await response.json();
        console.error('Error deleting person:', data.detail);
      }
    } catch (error) {
      console.error('Error deleting person:', error);
    }
  };

  const handleCreatePerson = () => {
    setEditingPerson(null);
    setShowCreateModal(true);
  };

  const handleEditPerson = (person) => {
    setEditingPerson(person);
    setShowEditModal(true);
  };

  const handleSavePerson = async (personData) => {
    try {
      const url = editingPerson 
        ? `/api/admin/people/${editingPerson.id}`
        : '/api/admin/people';
      
      const method = editingPerson ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(personData)
      });

      if (response.ok) {
        setShowCreateModal(false);
        setShowEditModal(false);
        setEditingPerson(null);
        loadPeople();
        loadAnalytics();
      } else {
        const data = await response.json();
        console.error('Error saving person:', data.detail);
      }
    } catch (error) {
      console.error('Error saving person:', error);
    }
  };

  const getRiskBadgeColor = (riskLevel) => {
    switch (riskLevel?.toLowerCase()) {
      case 'very high': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRiskIcon = (riskLevel) => {
    switch (riskLevel?.toLowerCase()) {
      case 'very high': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'high': return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case 'medium': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'low': return <CheckCircle className="h-4 w-4 text-green-500" />;
      default: return <Shield className="h-4 w-4 text-gray-500" />;
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

  const truncateText = (text, maxLength = 50) => {
    if (!text) return 'N/A';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">People Management</h2>
          <p className="text-slate-600">Manage people records and analytics</p>
        </div>
        <button
          onClick={handleCreatePerson}
          className="bg-sky-600 hover:bg-sky-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <UserCheck className="h-4 w-4" />
          Create Person
        </button>
      </div>

      {/* Analytics Cards */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600">Total People</p>
                <p className="text-2xl font-bold text-slate-900">{analytics.total_people || 0}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600">High Risk</p>
                <p className="text-2xl font-bold text-slate-900">{analytics.high_risk_count || 0}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600">Verified</p>
                <p className="text-2xl font-bold text-slate-900">{analytics.verified_count || 0}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <BarChart3 className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600">Avg Risk Score</p>
                <p className="text-2xl font-bold text-slate-900">{analytics.avg_risk_score?.toFixed(1) || '0.0'}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search people..."
              value={searchTerm}
              onChange={handleSearch}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
            />
          </div>
          
          <select
            value={riskLevelFilter}
            onChange={handleRiskLevelFilter}
            className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
          >
            <option value="">All Risk Levels</option>
            <option value="very high">Very High</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          
          <div className="text-sm text-slate-600 flex items-center">
            <UserCheck className="h-4 w-4 mr-2" />
            {totalPeople} total people
          </div>
        </div>
      </div>

      {/* People Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600 mx-auto"></div>
            <p className="mt-2 text-slate-600">Loading people...</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto w-full">
              <table className="min-w-full divide-y divide-slate-200 w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Person
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Risk Level
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Location
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Cases
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {people.map((person) => (
                    <tr key={person.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-slate-200 flex items-center justify-center">
                            <span className="text-sm font-medium text-slate-600">
                              {person.first_name?.charAt(0)}{person.last_name?.charAt(0)}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-slate-900">
                              {person.full_name || `${person.first_name} ${person.last_name}`}
                            </div>
                            <div className="text-sm text-slate-500">
                              {person.occupation || 'N/A'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          {getRiskIcon(person.risk_level)}
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRiskBadgeColor(person.risk_level)}`}>
                            {person.risk_level || 'N/A'}
                          </span>
                          {person.risk_score && (
                            <span className="text-xs text-slate-500">
                              ({person.risk_score.toFixed(1)})
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-slate-900">
                          {person.email && (
                            <div className="flex items-center">
                              <Mail className="h-3 w-3 mr-1 text-slate-400" />
                              {truncateText(person.email, 25)}
                            </div>
                          )}
                          {person.phone_number && (
                            <div className="flex items-center mt-1">
                              <Phone className="h-3 w-3 mr-1 text-slate-400" />
                              {person.phone_number}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-slate-900">
                          {person.city && person.region ? (
                            <div className="flex items-center">
                              <MapPin className="h-3 w-3 mr-1 text-slate-400" />
                              {person.city}, {person.region}
                            </div>
                          ) : (
                            <span className="text-slate-400">N/A</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                        {person.case_count || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                        {formatDate(person.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleViewPerson(person)}
                            className="text-slate-600 hover:text-slate-900 p-1"
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleEditPerson(person)}
                            className="text-amber-600 hover:text-amber-900 p-1"
                            title="Edit Person"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeletePerson(person)}
                            className="text-red-600 hover:text-red-900 p-1"
                            title="Delete Person"
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

      {/* Person Detail Modal */}
      {showPersonModal && selectedPerson && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-6xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center space-x-3">
                <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <User className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-slate-900">{selectedPerson.full_name || 'N/A'}</h3>
                  <p className="text-sm text-slate-500">{selectedPerson.occupation || 'N/A'}</p>
                </div>
              </div>
              <button
                onClick={() => setShowPersonModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="space-y-6">
              {/* Financial Risk Assessment */}
              <div className="bg-white rounded-lg border border-slate-200 p-6">
                <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2 mb-4">
                  <Shield className="h-5 w-5 text-blue-600" />
                  Financial Risk Assessment
                  {analyticsLoading && <RefreshCw className="h-4 w-4 animate-spin text-blue-600" />}
                </h3>
                {analyticsLoading ? (
                  <div className="text-center py-4">
                    <div className="animate-pulse">
                      <div className="h-8 bg-gray-200 rounded mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded mb-4"></div>
                      <div className="h-2 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center">
                    {(() => {
                      // Calculate risk score based on case statistics and financial factors
                      let riskScore = selectedPerson.risk_score || 0;
                      let riskLevel = selectedPerson.risk_level || 'Low';
                      let riskFactors = [];
                      
                      if (personCaseStats) {
                        const totalCases = personCaseStats.total_cases || 0;
                        const unfavorableCases = personCaseStats.unfavorable_cases || 0;
                        const mixedCases = personCaseStats.mixed_cases || 0;
                        
                        if (unfavorableCases > 0) {
                          riskFactors.push(`${unfavorableCases} unfavorable case${unfavorableCases > 1 ? 's' : ''}`);
                        }
                        if (mixedCases > 0) {
                          riskFactors.push(`${mixedCases} mixed outcome case${mixedCases > 1 ? 's' : ''}`);
                        }
                        if (totalCases > 10) {
                          riskFactors.push('High case volume');
                        } else if (totalCases > 5) {
                          riskFactors.push('Moderate case volume');
                        }
                      }
                      
                      // Financial risk factors from analytics
                      if (personAnalytics) {
                        if (personAnalytics.financial_risk_level === 'Critical') {
                          riskScore += 30;
                          riskFactors.push('Critical financial risk');
                        } else if (personAnalytics.financial_risk_level === 'High') {
                          riskScore += 20;
                          riskFactors.push('High financial risk');
                        } else if (personAnalytics.financial_risk_level === 'Medium') {
                          riskScore += 10;
                          riskFactors.push('Moderate financial risk');
                        }
                        
                        if (personAnalytics.total_monetary_amount > 1000000) {
                          riskFactors.push('High monetary involvement');
                        }
                      }
                      
                      return (
                        <>
                          <div className={`text-2xl font-bold mb-2 ${
                            riskLevel === 'Critical' ? 'text-red-600' :
                            riskLevel === 'High' ? 'text-orange-600' :
                            riskLevel === 'Medium' ? 'text-yellow-600' :
                            'text-slate-600'
                          }`}>
                            {riskLevel} Financial Risk
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                            <div
                              className={`h-2 rounded-full transition-all duration-300 ${
                                riskLevel === 'Critical' ? 'bg-red-500' :
                                riskLevel === 'High' ? 'bg-orange-500' :
                                riskLevel === 'Medium' ? 'bg-yellow-500' :
                                'bg-green-500'
                              }`}
                              style={{ width: `${Math.min(riskScore, 100)}%` }}
                            ></div>
                          </div>
                          <p className="text-xs text-slate-500 mb-3">Based on legal history, case outcomes & financial factors</p>
                          
                          {/* Risk Assessment Summary */}
                          <div className="text-left bg-slate-50 rounded-lg p-3 mb-3">
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              <div className="flex justify-between">
                                <span>Risk Score:</span>
                                <span className="font-medium">{riskScore.toFixed(1)}/100</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Total Cases:</span>
                                <span className="font-medium">{personCaseStats?.total_cases || 0}</span>
                              </div>
                            </div>
                          </div>
                          
                          {riskFactors.length > 0 && (
                            <div className="text-left">
                              <p className="text-xs text-slate-500 mb-2">Key Risk Factors:</p>
                              <div className="flex flex-wrap gap-1">
                                {riskFactors.map((factor, index) => (
                                  <span key={index} className="inline-flex px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">
                                    {factor}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </>
                      );
                    })()}
                  </div>
                )}
              </div>

              {/* Quick Stats */}
              <div className="bg-white rounded-lg border border-slate-200 p-6">
                <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2 mb-4">
                  <Clock className="h-5 w-5 text-blue-600" />
                  Quick Stats
                  {analyticsLoading && <RefreshCw className="h-4 w-4 animate-spin text-blue-600" />}
                </h3>
                {analyticsLoading ? (
                  <div className="space-y-3">
                    <div className="animate-pulse">
                      <div className="h-4 bg-gray-200 rounded mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-3 bg-slate-50 rounded-lg">
                      <div className="text-2xl font-bold text-slate-900">{personCaseStats?.total_cases || 0}</div>
                      <div className="text-xs text-slate-500">Total Cases</div>
                    </div>
                    <div className="text-center p-3 bg-slate-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{personCaseStats?.resolved_cases || 0}</div>
                      <div className="text-xs text-slate-500">Resolved</div>
                    </div>
                    <div className="text-center p-3 bg-slate-50 rounded-lg">
                      <div className="text-2xl font-bold text-orange-600">{personCaseStats?.unresolved_cases || 0}</div>
                      <div className="text-xs text-slate-500">Unresolved</div>
                    </div>
                    <div className="text-center p-3 bg-slate-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{personCaseStats?.favorable_cases || 0}</div>
                      <div className="text-xs text-slate-500">Favorable</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Financial Risk Profile */}
              <div className="bg-white rounded-lg border border-slate-200 p-6">
                <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2 mb-4">
                  <DollarSign className="h-5 w-5 text-green-600" />
                  Financial Risk Profile
                  {analyticsLoading && <RefreshCw className="h-4 w-4 animate-spin text-green-600" />}
                </h3>
                {analyticsLoading ? (
                  <div className="space-y-4">
                    <div className="animate-pulse">
                      <div className="h-16 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        ${personAnalytics?.total_monetary_amount?.toLocaleString() || '0'}
                      </div>
                      <div className="text-xs text-slate-500">Total Monetary Amount</div>
                    </div>
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        ${personAnalytics?.average_case_value?.toLocaleString() || '0'}
                      </div>
                      <div className="text-xs text-slate-500">Average Case Value</div>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">
                        {personAnalytics?.case_complexity_score?.toFixed(1) || '0'}/10
                      </div>
                      <div className="text-xs text-slate-500">Case Complexity</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Basic Information */}
              <div className="bg-white rounded-lg border border-slate-200 p-6">
                <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2 mb-4">
                  <User className="h-5 w-5 text-blue-600" />
                  Personal Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-sm font-medium text-slate-500 mb-2">Full Name</h4>
                    <p className="text-sm text-slate-900">{selectedPerson.full_name || 'N/A'}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-slate-500 mb-2">Occupation</h4>
                    <p className="text-sm text-slate-900">{selectedPerson.occupation || 'N/A'}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-slate-500 mb-2">Email</h4>
                    <p className="text-sm text-slate-900">{selectedPerson.email || 'N/A'}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-slate-500 mb-2">Phone</h4>
                    <p className="text-sm text-slate-900">{selectedPerson.phone_number || 'N/A'}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-slate-500 mb-2">Nationality</h4>
                    <p className="text-sm text-slate-900">{selectedPerson.nationality || 'N/A'}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-slate-500 mb-2">Gender</h4>
                    <p className="text-sm text-slate-900">{selectedPerson.gender || 'N/A'}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-slate-500 mb-2">Education Level</h4>
                    <p className="text-sm text-slate-900">{selectedPerson.education_level || 'N/A'}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-slate-500 mb-2">Marital Status</h4>
                    <p className="text-sm text-slate-900">{selectedPerson.marital_status || 'N/A'}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-slate-500 mb-2">Languages</h4>
                    <p className="text-sm text-slate-900">{selectedPerson.languages || 'N/A'}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-slate-500 mb-2">Verified</h4>
                    <p className="text-sm text-slate-900">
                      {selectedPerson.is_verified ? (
                        <span className="text-green-600 flex items-center gap-1">
                          <CheckCircle className="h-4 w-4" />
                          Yes
                        </span>
                      ) : (
                        <span className="text-red-600 flex items-center gap-1">
                          <XCircle className="h-4 w-4" />
                          No
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {/* Location Information */}
              <div className="bg-white rounded-lg border border-slate-200 p-6">
                <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2 mb-4">
                  <MapPin className="h-5 w-5 text-blue-600" />
                  Location Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-slate-500">Address</p>
                    <p className="text-sm text-slate-900">{selectedPerson.address || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">City, Region</p>
                    <p className="text-sm text-slate-900">
                      {selectedPerson.city && selectedPerson.region 
                        ? `${selectedPerson.city}, ${selectedPerson.region}` 
                        : 'N/A'
                      }
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedPerson && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center space-x-3 mb-4">
              <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                <Trash2 className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Delete Person</h3>
                <p className="text-sm text-slate-600">This action cannot be undone.</p>
              </div>
            </div>
            
            <p className="text-slate-700 mb-6">
              Are you sure you want to delete <strong>{selectedPerson.full_name || `${selectedPerson.first_name} ${selectedPerson.last_name}`}</strong>? 
              This will permanently remove the person and all associated data.
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
                Delete Person
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create/Edit Person Modal */}
      {(showCreateModal || showEditModal) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-slate-900">
                {editingPerson ? 'Edit Person' : 'Create New Person'}
              </h3>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setShowEditModal(false);
                  setEditingPerson(null);
                }}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <PersonForm
              personData={editingPerson}
              onSave={handleSavePerson}
              onCancel={() => {
                setShowCreateModal(false);
                setShowEditModal(false);
                setEditingPerson(null);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default PeopleManagement;
