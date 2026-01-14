import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Save, 
  X, 
  Filter,
  Users,
  Calendar,
  MapPin,
  Building2,
  Award,
  Phone,
  Mail,
  Clock
} from 'lucide-react';

const JudgeManagement = () => {
  const [judges, setJudges] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingJudge, setEditingJudge] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterCourtType, setFilterCourtType] = useState('');
  const [filterRegion, setFilterRegion] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [showFilters, setShowFilters] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    title: '',
    court_type: '',
    court_division: '',
    region: '',
    status: 'active',
    bio: '',
    appointment_date: '',
    retirement_date: '',
    contact_info: '',
    specializations: ''
  });

  const statusOptions = [
    { value: 'active', label: 'Active' },
    { value: 'retired', label: 'Retired' },
    { value: 'deceased', label: 'Deceased' },
    { value: 'suspended', label: 'Suspended' }
  ];

  const courtTypes = [
    'Supreme Court',
    'Court of Appeal', 
    'High Court',
    'Circuit Court',
    'District Court',
    'Magistrate Court'
  ];

  const regions = [
    'Greater Accra',
    'Ashanti',
    'Western',
    'Central',
    'Volta',
    'Eastern',
    'Northern',
    'Upper East',
    'Upper West',
    'Brong Ahafo',
    'Western North'
  ];

  useEffect(() => {
    fetchJudges();
  }, [currentPage, searchTerm, filterStatus, filterCourtType, filterRegion]);

  const fetchJudges = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20'
      });

      if (searchTerm) params.append('search', searchTerm);
      if (filterStatus) params.append('status', filterStatus);
      if (filterCourtType) params.append('court_type', filterCourtType);
      if (filterRegion) params.append('region', filterRegion);

      const response = await fetch(`/api/admin/judges?${params}`, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setJudges(data.judges);
        setTotalPages(data.total_pages);
        setTotalCount(data.total);
      } else {
        console.error('Failed to fetch judges:', response.statusText);
      }
    } catch (error) {
      console.error('Error fetching judges:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const url = editingJudge 
        ? `/api/admin/judges/${editingJudge.id}`
        : `/api/admin/judges`;
      
      const method = editingJudge ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      
      if (response.ok) {
        resetForm();
        fetchJudges();
      } else {
        const errorData = await response.json();
        alert(`Failed to save judge: ${errorData.detail || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error saving judge:', error);
      alert('Failed to save judge. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (judge) => {
    setEditingJudge(judge);
    setFormData({
      name: judge.name || '',
      title: judge.title || '',
      court_type: judge.court_type || '',
      court_division: judge.court_division || '',
      region: judge.region || '',
      status: judge.status || 'active',
      bio: judge.bio || '',
      appointment_date: judge.appointment_date ? judge.appointment_date.split('T')[0] : '',
      retirement_date: judge.retirement_date ? judge.retirement_date.split('T')[0] : '',
      contact_info: judge.contact_info || '',
      specializations: judge.specializations || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (judge) => {
    if (!window.confirm(`Are you sure you want to delete ${judge.name}?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/judges/${judge.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        fetchJudges();
      } else {
        alert('Failed to delete judge. Please try again.');
      }
    } catch (error) {
      console.error('Error deleting judge:', error);
      alert('Failed to delete judge. Please try again.');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      title: '',
      court_type: '',
      court_division: '',
      region: '',
      status: 'active',
      bio: '',
      appointment_date: '',
      retirement_date: '',
      contact_info: '',
      specializations: ''
    });
    setEditingJudge(null);
    setShowForm(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'retired': return 'bg-gray-100 text-gray-800';
      case 'deceased': return 'bg-red-100 text-red-800';
      case 'suspended': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredJudges = judges.filter(judge => {
    const matchesSearch = !searchTerm || 
      (judge.name?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      (judge.title?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      (judge.court_type?.toLowerCase().includes(searchTerm.toLowerCase()) || false);
    
    const matchesStatus = !filterStatus || judge.status === filterStatus;
    const matchesCourtType = !filterCourtType || 
      (judge.court_type?.toLowerCase().includes(filterCourtType.toLowerCase()) || false);
    const matchesRegion = !filterRegion || 
      (judge.region?.toLowerCase().includes(filterRegion.toLowerCase()) || false);
    
    return matchesSearch && matchesStatus && matchesCourtType && matchesRegion;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Users className="h-8 w-8 text-sky-600" />
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Judges Management</h1>
            <p className="text-slate-600">Manage judges and court officials</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="inline-flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <Filter className="h-4 w-4" />
            Filters
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add Judge
          </button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-white p-4 rounded-lg border border-slate-200 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
              >
                <option value="">All Statuses</option>
                {statusOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Court Type</label>
              <select
                value={filterCourtType}
                onChange={(e) => setFilterCourtType(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
              >
                <option value="">All Court Types</option>
                {courtTypes.map(type => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Region</label>
              <select
                value={filterRegion}
                onChange={(e) => setFilterRegion(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
              >
                <option value="">All Regions</option>
                {regions.map(region => (
                  <option key={region} value={region}>
                    {region}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => {
                  setFilterStatus('');
                  setFilterCourtType('');
                  setFilterRegion('');
                }}
                className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="bg-white p-4 rounded-lg border border-slate-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search judges by name, title, or court type..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
          />
        </div>
      </div>

      {/* Judges List */}
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900">
              Judges ({totalCount})
            </h3>
            {loading && (
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Clock className="h-4 w-4 animate-spin" />
                Loading...
              </div>
            )}
          </div>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <div className="inline-flex items-center gap-2 text-slate-600">
              <Clock className="h-5 w-5 animate-spin" />
              Loading judges...
            </div>
          </div>
        ) : filteredJudges.length === 0 ? (
          <div className="p-8 text-center">
            <Users className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">No judges found</h3>
            <p className="text-slate-600 mb-4">
              {searchTerm || filterStatus || filterCourtType || filterRegion
                ? 'Try adjusting your search or filters'
                : 'Get started by adding your first judge'}
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Add Judge
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-200">
            {filteredJudges.map((judge) => (
              <div key={judge.id} className="p-6 hover:bg-slate-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-medium text-slate-900">
                        {judge.name}
                      </h3>
                      {judge.title && (
                        <span className="text-sm text-slate-600">
                          {judge.title}
                        </span>
                      )}
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(judge.status)}`}>
                        {judge.status}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-slate-600">
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4" />
                        <span>{judge.court_type || 'No court type'}</span>
                      </div>
                      {judge.court_division && (
                        <div className="flex items-center gap-2">
                          <Award className="h-4 w-4" />
                          <span>{judge.court_division}</span>
                        </div>
                      )}
                      {judge.region && (
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          <span>{judge.region}</span>
                        </div>
                      )}
                    </div>

                    {judge.specializations && (
                      <div className="mt-2 text-sm text-slate-600">
                        <strong>Specializations:</strong> {judge.specializations}
                      </div>
                    )}

                    {judge.bio && (
                      <div className="mt-2 text-sm text-slate-600">
                        <strong>Bio:</strong> {judge.bio.substring(0, 100)}
                        {judge.bio.length > 100 && '...'}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => handleEdit(judge)}
                      className="p-2 text-slate-600 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors"
                      title="Edit judge"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(judge)}
                      className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete judge"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between bg-white px-6 py-3 border border-slate-200 rounded-lg">
          <div className="text-sm text-slate-700">
            Page {currentPage} of {totalPages} ({totalCount} total judges)
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 text-sm border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 text-sm border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-900">
                  {editingJudge ? 'Edit Judge' : 'Add New Judge'}
                </h3>
                <button
                  onClick={resetForm}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Name */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                    placeholder="Enter judge's full name"
                  />
                </div>

                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Title
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                    placeholder="e.g., Justice, Judge, Chief Justice"
                  />
                </div>

                {/* Status */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Status *
                  </label>
                  <select
                    required
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                  >
                    {statusOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Court Type */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Court Type
                  </label>
                  <select
                    value={formData.court_type}
                    onChange={(e) => setFormData({ ...formData, court_type: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                  >
                    <option value="">Select court type</option>
                    {courtTypes.map(type => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Court Division */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Court Division
                  </label>
                  <input
                    type="text"
                    value={formData.court_division}
                    onChange={(e) => setFormData({ ...formData, court_division: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                    placeholder="e.g., Commercial Division, Criminal Division"
                  />
                </div>

                {/* Region */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Region
                  </label>
                  <select
                    value={formData.region}
                    onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                  >
                    <option value="">Select region</option>
                    {regions.map(region => (
                      <option key={region} value={region}>
                        {region}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Appointment Date */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Appointment Date
                  </label>
                  <input
                    type="date"
                    value={formData.appointment_date}
                    onChange={(e) => setFormData({ ...formData, appointment_date: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                  />
                </div>

                {/* Retirement Date */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Retirement Date
                  </label>
                  <input
                    type="date"
                    value={formData.retirement_date}
                    onChange={(e) => setFormData({ ...formData, retirement_date: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                  />
                </div>

                {/* Specializations */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Specializations
                  </label>
                  <input
                    type="text"
                    value={formData.specializations}
                    onChange={(e) => setFormData({ ...formData, specializations: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                    placeholder="e.g., Commercial Law, Criminal Law, Constitutional Law"
                  />
                </div>

                {/* Contact Info */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Contact Information
                  </label>
                  <textarea
                    value={formData.contact_info}
                    onChange={(e) => setFormData({ ...formData, contact_info: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                    placeholder="Phone, email, or other contact details"
                  />
                </div>

                {/* Bio */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Biography
                  </label>
                  <textarea
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    rows={4}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                    placeholder="Brief biography or background information"
                  />
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-200">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {saving ? (
                    <>
                      <Clock className="h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      {editingJudge ? 'Update Judge' : 'Add Judge'}
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

export default JudgeManagement;
