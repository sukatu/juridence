import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Save, 
  X, 
  Filter,
  Building2,
  MapPin,
  Calendar,
  Hash,
  Scale,
  Phone,
  Mail,
  Clock,
  Layers
} from 'lucide-react';
import { apiGet, apiPost, apiPut, apiDelete } from '../../utils/api';

const CourtTypeManagement = () => {
  const [courtTypes, setCourtTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingCourtType, setEditingCourtType] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLevel, setFilterLevel] = useState('');
  const [filterRegion, setFilterRegion] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [courtTypeToDelete, setCourtTypeToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    level: 'high_court',
    description: '',
    jurisdiction: '',
    region: '',
    address: '',
    contact_info: '',
    presiding_judge: '',
    established_date: ''
  });

  const levelOptions = [
    { value: 'supreme_court', label: 'Supreme Court' },
    { value: 'court_of_appeal', label: 'Court of Appeal' },
    { value: 'high_court', label: 'High Court' },
    { value: 'circuit_court', label: 'Circuit Court' },
    { value: 'district_court', label: 'District Court' },
    { value: 'magistrate_court', label: 'Magistrate Court' }
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

  const fetchCourtTypes = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20'
      });

      if (searchTerm) params.append('search', searchTerm);
      if (filterLevel) params.append('level', filterLevel);
      if (filterRegion) params.append('region', filterRegion);

      const data = await apiGet(`/admin/court-types?${params}`);
      setCourtTypes(data.court_types || []);
      setTotalPages(data.total_pages || 1);
      setTotalCount(data.total || 0);
    } catch (error) {
      console.error('Error fetching court types:', error);
      alert(`Failed to load court types: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourtTypes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, searchTerm, filterLevel, filterRegion]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (editingCourtType) {
        await apiPut(`/admin/court-types/${editingCourtType.id}`, formData);
      } else {
        await apiPost('/admin/court-types', formData);
      }
      
      resetForm();
      fetchCourtTypes();
    } catch (error) {
      console.error('Error saving court type:', error);
      alert(`Failed to save court type: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (courtType) => {
    setEditingCourtType(courtType);
    setFormData({
      name: courtType.name || '',
      code: courtType.code || '',
      level: courtType.level || 'high_court',
      description: courtType.description || '',
      jurisdiction: courtType.jurisdiction || '',
      region: courtType.region || '',
      address: courtType.address || '',
      contact_info: courtType.contact_info || '',
      presiding_judge: courtType.presiding_judge || '',
      established_date: courtType.established_date ? courtType.established_date.split('T')[0] : ''
    });
    setShowForm(true);
  };

  const handleDeleteClick = (courtType) => {
    setCourtTypeToDelete(courtType);
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (!courtTypeToDelete) return;

    setDeleting(true);
    try {
      await apiDelete(`/admin/court-types/${courtTypeToDelete.id}`);
      fetchCourtTypes();
      setShowDeleteConfirm(false);
      setCourtTypeToDelete(null);
    } catch (error) {
      console.error('Error deleting court type:', error);
      alert(`Failed to delete court type: ${error.message}`);
    } finally {
      setDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
    setCourtTypeToDelete(null);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      code: '',
      level: 'high_court',
      description: '',
      jurisdiction: '',
      region: '',
      address: '',
      contact_info: '',
      presiding_judge: '',
      established_date: ''
    });
    setEditingCourtType(null);
    setShowForm(false);
  };

  const getLevelColor = (level) => {
    switch (level) {
      case 'supreme_court': return 'bg-purple-100 text-purple-800';
      case 'court_of_appeal': return 'bg-blue-100 text-blue-800';
      case 'high_court': return 'bg-green-100 text-green-800';
      case 'circuit_court': return 'bg-yellow-100 text-yellow-800';
      case 'district_court': return 'bg-orange-100 text-orange-800';
      case 'magistrate_court': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Building2 className="h-8 w-8 text-sky-600" />
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Court Types Management</h1>
            <p className="text-slate-600">Manage court types and jurisdictions</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="inline-flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <Filter className="h-4 w-4" />
            <span style={{ fontFamily: 'Satoshi' }}>Filters</span>
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span style={{ fontFamily: 'Satoshi' }}>Add Court Type</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-white p-4 rounded-lg border border-slate-200 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Court Level</label>
              <select
                value={filterLevel}
                onChange={(e) => setFilterLevel(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
              >
                <option value="">All Levels</option>
                {levelOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
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
                  setFilterLevel('');
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
            placeholder="Search court types by name, code, or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
          />
        </div>
      </div>

      {/* Court Types List */}
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900">
              Court Types ({totalCount})
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
              Loading court types...
            </div>
          </div>
        ) : courtTypes.length === 0 ? (
          <div className="p-8 text-center">
            <Building2 className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">No court types found</h3>
            <p className="text-slate-600 mb-4">
              {searchTerm || filterLevel || filterRegion
                ? 'Try adjusting your search or filters'
                : 'Get started by adding your first court type'}
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Add Court Type
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-200">
            {courtTypes.map((courtType) => (
              <div key={courtType.id} className="p-6 hover:bg-slate-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-medium text-slate-900">
                        {courtType.name}
                      </h3>
                      <span className="px-2 py-1 bg-slate-100 text-slate-800 rounded-full text-xs font-medium">
                        {courtType.code}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLevelColor(courtType.level)}`}>
                        {levelOptions.find(opt => opt.value === courtType.level)?.label || courtType.level}
                      </span>
                    </div>
                    
                    {courtType.description && (
                      <p className="text-sm text-slate-600 mb-3">
                        {courtType.description}
                      </p>
                    )}
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-600">
                      {courtType.jurisdiction && (
                        <div className="flex items-center gap-2">
                          <Scale className="h-4 w-4" />
                          <span>{courtType.jurisdiction}</span>
                        </div>
                      )}
                      {courtType.region && (
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          <span>{courtType.region}</span>
                        </div>
                      )}
                      {courtType.presiding_judge && (
                        <div className="flex items-center gap-2">
                          <Layers className="h-4 w-4" />
                          <span>{courtType.presiding_judge}</span>
                        </div>
                      )}
                      {courtType.established_date && (
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <span>Est. {new Date(courtType.established_date).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>

                    {courtType.address && (
                      <div className="mt-2 text-sm text-slate-600">
                        <strong>Address:</strong> {courtType.address}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => handleEdit(courtType)}
                      className="p-2 text-slate-600 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors"
                      title="Edit court type"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(courtType)}
                      className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete court type"
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
            Page {currentPage} of {totalPages} ({totalCount} total court types)
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

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && courtTypeToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="px-6 py-4 border-b border-slate-200">
              <h3 className="text-lg font-semibold text-slate-900">Confirm Delete</h3>
            </div>
            <div className="p-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                  <Trash2 className="h-6 w-6 text-red-600" />
                </div>
                <div className="flex-1">
                  <p className="text-slate-900 font-medium mb-2">
                    Delete Court Type?
                  </p>
                  <p className="text-sm text-slate-600">
                    Are you sure you want to delete <strong>{courtTypeToDelete.name}</strong>? 
                    This action cannot be undone.
                  </p>
                </div>
              </div>
            </div>
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3">
              <button
                onClick={handleCancelDelete}
                disabled={deleting}
                className="px-4 py-2 text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={deleting}
                className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {deleting ? (
                  <>
                    <Clock className="h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </>
                )}
              </button>
            </div>
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
                  {editingCourtType ? 'Edit Court Type' : 'Add New Court Type'}
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
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Court Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                    placeholder="e.g., Supreme Court, High Court"
                  />
                </div>

                {/* Code */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Court Code *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                    placeholder="e.g., SC, HC, CC"
                  />
                </div>

                {/* Level */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Court Level *
                  </label>
                  <select
                    required
                    value={formData.level}
                    onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                  >
                    {levelOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
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

                {/* Jurisdiction */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Jurisdiction
                  </label>
                  <input
                    type="text"
                    value={formData.jurisdiction}
                    onChange={(e) => setFormData({ ...formData, jurisdiction: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                    placeholder="e.g., Commercial matters, Criminal cases"
                  />
                </div>

                {/* Description */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                    placeholder="Brief description of the court type"
                  />
                </div>

                {/* Address */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Address
                  </label>
                  <textarea
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    rows={2}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                    placeholder="Physical address of the court"
                  />
                </div>

                {/* Presiding Judge */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Presiding Judge
                  </label>
                  <input
                    type="text"
                    value={formData.presiding_judge}
                    onChange={(e) => setFormData({ ...formData, presiding_judge: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                    placeholder="Name of presiding judge"
                  />
                </div>

                {/* Established Date */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Established Date
                  </label>
                  <input
                    type="date"
                    value={formData.established_date}
                    onChange={(e) => setFormData({ ...formData, established_date: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
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
                    rows={2}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                    placeholder="Phone, email, or other contact details"
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
                      {editingCourtType ? 'Update Court Type' : 'Add Court Type'}
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

export default CourtTypeManagement;
