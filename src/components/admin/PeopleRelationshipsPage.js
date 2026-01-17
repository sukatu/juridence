import React, { useState, useEffect } from 'react';
import { apiGet, apiPost, apiPut, apiDelete } from '../../utils/api';
import PersonDetails from './PersonDetails';
import AdminHeader from './AdminHeader';
import { Search, User, Plus, Edit, Trash2, X } from 'lucide-react';

const PeopleRelationshipsPage = ({ userInfo, onNavigate, onLogout }) => {
  const [people, setPeople] = useState([]);
  const [changeOfName, setChangeOfName] = useState([]);
  const [correctionPlace, setCorrectionPlace] = useState([]);
  const [correctionDate, setCorrectionDate] = useState([]);
  const [marriageOfficers, setMarriageOfficers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('people');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 20;
  const [showForm, setShowForm] = useState(false);
  const [formMode, setFormMode] = useState('create');
  const [formTab, setFormTab] = useState('people');
  const [formData, setFormData] = useState({});
  const [formError, setFormError] = useState(null);
  const [formSubmitting, setFormSubmitting] = useState(false);

  const tabs = [
    { id: 'people', label: 'People' },
    { id: 'change_of_name', label: 'Change of Name' },
    { id: 'correction_of_place_of_birth', label: 'Change of Place of Birth' },
    { id: 'correction_of_date_of_birth', label: 'Change of Date of Birth' },
    { id: 'marriage_officers', label: 'Marriage Officers' }
  ];

  const fieldConfigs = {
    people: {
      title: 'Person',
      endpoint: '/api/people',
      fields: [
        { name: 'first_name', label: 'First Name', required: true },
        { name: 'last_name', label: 'Last Name', required: true },
        { name: 'full_name', label: 'Full Name' },
        { name: 'phone_number', label: 'Phone' },
        { name: 'email', label: 'Email', type: 'email' },
        { name: 'city', label: 'City' },
        { name: 'region', label: 'Region' },
        { name: 'gender', label: 'Gender' },
        { name: 'occupation', label: 'Occupation' },
        { name: 'address', label: 'Address' }
      ],
      numericFields: ['person_id']
    },
    change_of_name: {
      title: 'Change of Name',
      endpoint: '/api/change-of-name',
      fields: [
        { name: 'item_number', label: 'Item Number', required: true },
        { name: 'old_name', label: 'Old Name', required: true },
        { name: 'new_name', label: 'New Name', required: true },
        { name: 'alias_name', label: 'Alias' },
        { name: 'profession', label: 'Profession' },
        { name: 'gender', label: 'Gender' },
        { name: 'address', label: 'Address' },
        { name: 'town_city', label: 'Town/City' },
        { name: 'region', label: 'Region' },
        { name: 'effective_date', label: 'Effective Date', type: 'date' },
        { name: 'gazette_number', label: 'Gazette Number', required: true },
        { name: 'gazette_date', label: 'Gazette Date', type: 'date', required: true },
        { name: 'page_number', label: 'Page Number', type: 'number' },
        { name: 'document_filename', label: 'Document Filename', required: true },
        { name: 'source_details', label: 'Source Details' },
        { name: 'source', label: 'Source' },
        { name: 'remarks', label: 'Remarks' },
        { name: 'person_id', label: 'Person ID', type: 'number' }
      ],
      numericFields: ['page_number', 'person_id']
    },
    correction_of_place_of_birth: {
      title: 'Correction of Place of Birth',
      endpoint: '/api/correction-of-place-of-birth',
      fields: [
        { name: 'item_number', label: 'Item Number', type: 'number', required: true },
        { name: 'person_name', label: 'Person Name', required: true },
        { name: 'alias', label: 'Alias' },
        { name: 'profession', label: 'Profession' },
        { name: 'address', label: 'Address' },
        { name: 'gender', label: 'Gender' },
        { name: 'old_place_of_birth', label: 'Old Place of Birth' },
        { name: 'new_place_of_birth', label: 'New Place of Birth' },
        { name: 'effective_date', label: 'Effective Date', type: 'date' },
        { name: 'remarks', label: 'Remarks' },
        { name: 'gazette_number', label: 'Gazette Number', type: 'number' },
        { name: 'gazette_date', label: 'Gazette Date', type: 'date' },
        { name: 'page', label: 'Page', type: 'number' },
        { name: 'document_filename', label: 'Document Filename', required: true },
        { name: 'source_details', label: 'Source Details' },
        { name: 'person_id', label: 'Person ID', type: 'number' }
      ],
      numericFields: ['item_number', 'gazette_number', 'page', 'person_id']
    },
    correction_of_date_of_birth: {
      title: 'Correction of Date of Birth',
      endpoint: '/api/correction-of-date-of-birth',
      fields: [
        { name: 'item_number', label: 'Item Number', required: true },
        { name: 'person_name', label: 'Person Name', required: true },
        { name: 'alias', label: 'Alias' },
        { name: 'profession', label: 'Profession' },
        { name: 'address', label: 'Address' },
        { name: 'gender', label: 'Gender' },
        { name: 'old_date_of_birth', label: 'Old Date of Birth', type: 'date' },
        { name: 'new_date_of_birth', label: 'New Date of Birth', type: 'date' },
        { name: 'effective_date', label: 'Effective Date', type: 'date' },
        { name: 'remarks', label: 'Remarks' },
        { name: 'gazette_number', label: 'Gazette Number' },
        { name: 'gazette_date', label: 'Gazette Date', type: 'date' },
        { name: 'page', label: 'Page', type: 'number' },
        { name: 'document_filename', label: 'Document Filename', required: true },
        { name: 'source_details', label: 'Source Details' },
        { name: 'person_id', label: 'Person ID', type: 'number' }
      ],
      numericFields: ['page', 'person_id']
    },
    marriage_officers: {
      title: 'Marriage Officer',
      endpoint: '/api/marriage-officers',
      fields: [
        { name: 'officer_name', label: 'Officer Name', required: true },
        { name: 'church', label: 'Church' },
        { name: 'location', label: 'Location' },
        { name: 'appointing_authority', label: 'Appointing Authority' },
        { name: 'appointment_date', label: 'Appointment Date', type: 'date' },
        { name: 'gazette_number', label: 'Gazette Number' },
        { name: 'gazette_date', label: 'Gazette Date', type: 'date' },
        { name: 'page_number', label: 'Page Number', type: 'number' },
        { name: 'source_details', label: 'Source Details' },
        { name: 'document_filename', label: 'Document Filename' },
        { name: 'person_id', label: 'Person ID', type: 'number' }
      ],
      numericFields: ['page_number', 'person_id']
    }
  };

  const formatDateInput = (value) => {
    if (!value) return '';
    if (typeof value === 'string') {
      return value.split('T')[0];
    }
    try {
      return new Date(value).toISOString().split('T')[0];
    } catch {
      return '';
    }
  };

  const getInitialFormData = (tabId, record = null) => {
    const config = fieldConfigs[tabId];
    if (!config) return {};
    const data = {};
    config.fields.forEach((field) => {
      const value = record ? record[field.name] : '';
      data[field.name] = field.type === 'date' ? formatDateInput(value) : (value ?? '');
    });
    if (record?.id) {
      data.id = record.id;
    }
    return data;
  };

  const normalizeFormData = (tabId, data) => {
    const config = fieldConfigs[tabId];
    if (!config) return data;
    const normalized = { ...data };
    config.fields.forEach((field) => {
      if (normalized[field.name] === '') {
        normalized[field.name] = null;
      }
    });
    config.numericFields?.forEach((fieldName) => {
      if (normalized[fieldName] !== null && normalized[fieldName] !== undefined && normalized[fieldName] !== '') {
        const parsed = parseInt(normalized[fieldName], 10);
        normalized[fieldName] = Number.isNaN(parsed) ? normalized[fieldName] : parsed;
      }
    });
    if (tabId === 'people') {
      if (!normalized.full_name && (normalized.first_name || normalized.last_name)) {
        normalized.full_name = `${normalized.first_name || ''} ${normalized.last_name || ''}`.trim();
      }
    }
    return normalized;
  };

  const openCreate = (tabId) => {
    setFormTab(tabId);
    setFormMode('create');
    setFormData(getInitialFormData(tabId));
    setFormError(null);
    setShowForm(true);
  };

  const openEdit = (tabId, record) => {
    setFormTab(tabId);
    setFormMode('edit');
    setFormData(getInitialFormData(tabId, record));
    setFormError(null);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setFormError(null);
    setFormSubmitting(false);
  };

  const handleFormSubmit = async (event) => {
    event.preventDefault();
    const config = fieldConfigs[formTab];
    if (!config) return;
    const missingRequired = config.fields.filter(
      (field) => field.required && !formData[field.name]
    );
    if (missingRequired.length) {
      setFormError(`Please fill required fields: ${missingRequired.map((f) => f.label).join(', ')}`);
      return;
    }

    try {
      setFormSubmitting(true);
      setFormError(null);
      const payload = normalizeFormData(formTab, formData);
      if (formMode === 'create') {
        await apiPost(config.endpoint, payload);
      } else {
        await apiPut(`${config.endpoint}/${formData.id}`, payload);
      }
      closeForm();
      await loadList();
    } catch (error) {
      console.error('Error saving record:', error);
      setFormError(error?.message || 'Failed to save record.');
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleDelete = async (tabId, recordId) => {
    const config = fieldConfigs[tabId];
    if (!config) return;
    const confirmed = window.confirm('Are you sure you want to delete this record?');
    if (!confirmed) return;
    try {
      await apiDelete(`${config.endpoint}/${recordId}`);
      await loadList();
    } catch (error) {
      console.error('Error deleting record:', error);
    }
  };

  // Load list on mount and when page/tab changes
  useEffect(() => {
    loadList();
  }, [currentPage, activeTab]);

  // Reset paging on tab/search change
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchTerm]);

  const loadList = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString()
      });

      const trimmedSearch = searchTerm.trim();

      if (activeTab === 'people') {
        if (trimmedSearch) {
          params.append('query', trimmedSearch);
        }
      const data = await apiGet(`/api/people/search?${params.toString()}`);
      setPeople(data.people || []);
      setTotalPages(data.total_pages || 1);
        setTotalItems(data.total || 0);
        setChangeOfName([]);
        setCorrectionPlace([]);
        setCorrectionDate([]);
        setMarriageOfficers([]);
      } else if (activeTab === 'correction_of_place_of_birth') {
        if (trimmedSearch) {
          params.append('search', trimmedSearch);
        }
        const data = await apiGet(`/api/correction-of-place-of-birth?${params.toString()}`);
        setCorrectionPlace(data.results || []);
        setTotalPages(data.total_pages || 1);
        setTotalItems(data.total || 0);
        setPeople([]);
        setChangeOfName([]);
        setCorrectionDate([]);
        setMarriageOfficers([]);
      } else if (activeTab === 'correction_of_date_of_birth') {
        if (trimmedSearch) {
          params.append('search', trimmedSearch);
        }
        const data = await apiGet(`/api/correction-of-date-of-birth?${params.toString()}`);
        setCorrectionDate(data.results || []);
        setTotalPages(data.total_pages || 1);
        setTotalItems(data.total || 0);
        setPeople([]);
        setChangeOfName([]);
        setCorrectionPlace([]);
        setMarriageOfficers([]);
      } else if (activeTab === 'marriage_officers') {
        if (trimmedSearch) {
          params.append('search', trimmedSearch);
        }
        const data = await apiGet(`/api/marriage-officers?${params.toString()}`);
        setMarriageOfficers(data.results || []);
        setTotalPages(data.total_pages || 1);
        setTotalItems(data.total || 0);
        setPeople([]);
        setChangeOfName([]);
        setCorrectionPlace([]);
        setCorrectionDate([]);
      } else if (activeTab === 'change_of_name') {
        if (trimmedSearch) {
          params.append('search', trimmedSearch);
        }
        const data = await apiGet(`/api/change-of-name?${params.toString()}`);
        setChangeOfName(data.results || []);
        setTotalPages(data.total_pages || 1);
        setTotalItems(data.total || 0);
        setPeople([]);
        setCorrectionPlace([]);
        setCorrectionDate([]);
        setMarriageOfficers([]);
      }
    } catch (error) {
      console.error('Error loading people:', error);
      setPeople([]);
      setChangeOfName([]);
      setCorrectionPlace([]);
      setCorrectionDate([]);
      setMarriageOfficers([]);
      setTotalPages(1);
      setTotalItems(0);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    loadList();
  };

  const handlePersonClick = (person) => {
    setSelectedPerson(person);
  };

  const handleBack = () => {
    setSelectedPerson(null);
  };

  // If a person is selected, show their details
  if (selectedPerson) {
    return (
      <PersonDetails
        person={selectedPerson}
        onBack={handleBack}
        userInfo={userInfo}
        onNavigate={onNavigate}
        onLogout={onLogout}
        onViewRelatedPerson={(personData) => setSelectedPerson(personData)}
      />
    );
  }

  return (
    <div className="bg-[#F7F8FA] min-h-screen">
      <AdminHeader userInfo={userInfo} onNavigate={onNavigate} onLogout={onLogout} />
      
      <div className="px-6 py-6">
        <div className="bg-white rounded-lg p-6">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-[#040E1B] mb-2">People Relationships</h1>
            <p className="text-[#525866] text-sm">
              View and manage relationships for people including bank directors, secretaries, auditors, shareholders, beneficial owners, marriage officers, and name changes.
            </p>
          </div>

          {/* Tabs */}
          <div className="flex items-start p-1 gap-4 mb-6 border-b border-[#E4E7EB]">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-start pb-2 ${
                  activeTab === tab.id ? 'border-b-2 border-[#022658]' : ''
                }`}
              >
                <span className={`text-base ${
                  activeTab === tab.id ? 'text-[#022658] font-bold' : 'text-[#525866]'
                }`}>
                  {tab.label}
                </span>
              </button>
            ))}
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="mb-6">
            <div className="flex gap-3 items-center">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#868C98] w-5 h-5" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={
                    activeTab === 'people'
                      ? 'Search by name...'
                      : activeTab === 'change_of_name'
                        ? 'Search change of name records...'
                        : activeTab === 'correction_of_place_of_birth'
                          ? 'Search by person name...'
                          : activeTab === 'correction_of_date_of_birth'
                            ? 'Search by person name...'
                            : 'Search by officer name...'
                  }
                  className="w-full pl-10 pr-4 py-3 border border-[#D4E1EA] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#022658] focus:border-transparent"
                />
              </div>
              <button
                type="submit"
                className="px-6 py-3 bg-[#022658] text-white rounded-lg hover:bg-[#033a7a] transition-colors font-medium"
              >
                Search
              </button>
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchTerm('');
                    setCurrentPage(1);
                  }}
                  className="px-6 py-3 bg-[#F7F8FA] text-[#525866] rounded-lg hover:bg-[#E5E8EC] transition-colors border border-[#D4E1EA]"
                >
                  Clear
                </button>
              )}
              <button
                type="button"
                onClick={() => openCreate(activeTab)}
                className="px-4 py-3 bg-[#022658] text-white rounded-lg hover:bg-[#033a7a] transition-colors font-medium flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add
              </button>
            </div>
          </form>

          {/* Results Count */}
          <div className="mb-4 text-sm text-[#525866]">
            {loading ? (
              'Loading...'
            ) : (
              <>
                Showing {totalItems > 0 ? ((currentPage - 1) * itemsPerPage) + 1 : 0} to{' '}
                {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} records
              </>
            )}
          </div>

          {/* List */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#022658]"></div>
              <span className="ml-3 text-[#525866]">Loading...</span>
            </div>
          ) : activeTab === 'people' && people.length === 0 ? (
            <div className="text-center py-12">
              <User className="w-16 h-16 text-[#868C98] mx-auto mb-4" />
              <p className="text-[#525866] text-lg mb-2">No people found</p>
              <p className="text-[#868C98] text-sm">
                {searchTerm ? 'Try a different search term' : 'No people in the database'}
              </p>
            </div>
          ) : activeTab === 'change_of_name' && changeOfName.length === 0 ? (
            <div className="text-center py-12">
              <User className="w-16 h-16 text-[#868C98] mx-auto mb-4" />
              <p className="text-[#525866] text-lg mb-2">No change of name records</p>
              <p className="text-[#868C98] text-sm">
                {searchTerm ? 'Try a different search term' : 'Enter a search term to view records'}
              </p>
            </div>
          ) : activeTab === 'correction_of_place_of_birth' && correctionPlace.length === 0 ? (
            <div className="text-center py-12">
              <User className="w-16 h-16 text-[#868C98] mx-auto mb-4" />
              <p className="text-[#525866] text-lg mb-2">No place of birth corrections</p>
              <p className="text-[#868C98] text-sm">
                {searchTerm ? 'Try a different search term' : 'No records in the database'}
              </p>
            </div>
          ) : activeTab === 'correction_of_date_of_birth' && correctionDate.length === 0 ? (
            <div className="text-center py-12">
              <User className="w-16 h-16 text-[#868C98] mx-auto mb-4" />
              <p className="text-[#525866] text-lg mb-2">No date of birth corrections</p>
              <p className="text-[#868C98] text-sm">
                {searchTerm ? 'Try a different search term' : 'No records in the database'}
              </p>
            </div>
          ) : activeTab === 'marriage_officers' && marriageOfficers.length === 0 ? (
            <div className="text-center py-12">
              <User className="w-16 h-16 text-[#868C98] mx-auto mb-4" />
              <p className="text-[#525866] text-lg mb-2">No marriage officers found</p>
              <p className="text-[#868C98] text-sm">
                {searchTerm ? 'Try a different search term' : 'No records in the database'}
              </p>
            </div>
          ) : (
            <>
              <div className="border border-[#E5E8EC] rounded-lg overflow-hidden">
                {/* Table Header */}
                {activeTab === 'people' && (
                <div className="bg-[#F4F6F9] grid grid-cols-12 gap-4 px-4 py-3 border-b border-[#E5E8EC]">
                  <div className="col-span-4">
                    <span className="text-sm font-bold text-[#070810]">Name</span>
                  </div>
                  <div className="col-span-3">
                    <span className="text-sm font-bold text-[#070810]">Contact</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-sm font-bold text-[#070810]">Location</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-sm font-bold text-[#070810]">Risk Score</span>
                  </div>
                  <div className="col-span-1">
                    <span className="text-sm font-bold text-[#070810]">Actions</span>
                  </div>
                </div>
                )}
                {activeTab === 'change_of_name' && (
                  <div className="bg-[#F4F6F9] grid grid-cols-12 gap-4 px-4 py-3 border-b border-[#E5E8EC]">
                    <div className="col-span-2">
                      <span className="text-sm font-bold text-[#070810]">Item No.</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-sm font-bold text-[#070810]">Old Name</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-sm font-bold text-[#070810]">New Name</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-sm font-bold text-[#070810]">Alias</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-sm font-bold text-[#070810]">Effective Date</span>
                    </div>
                    <div className="col-span-1">
                      <span className="text-sm font-bold text-[#070810]">Gazette No.</span>
                    </div>
                    <div className="col-span-1">
                      <span className="text-sm font-bold text-[#070810]">Actions</span>
                    </div>
                  </div>
                )}
                {(activeTab === 'correction_of_place_of_birth' || activeTab === 'correction_of_date_of_birth') && (
                  <div className="bg-[#F4F6F9] grid grid-cols-12 gap-4 px-4 py-3 border-b border-[#E5E8EC]">
                    <div className="col-span-2">
                      <span className="text-sm font-bold text-[#070810]">Item No.</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-sm font-bold text-[#070810]">Person</span>
                    </div>
                    <div className="col-span-3">
                      <span className="text-sm font-bold text-[#070810]">Old</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-sm font-bold text-[#070810]">New</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-sm font-bold text-[#070810]">Gazette No.</span>
                    </div>
                    <div className="col-span-1">
                      <span className="text-sm font-bold text-[#070810]">Actions</span>
                    </div>
                  </div>
                )}
                {activeTab === 'marriage_officers' && (
                  <div className="bg-[#F4F6F9] grid grid-cols-12 gap-4 px-4 py-3 border-b border-[#E5E8EC]">
                    <div className="col-span-4">
                      <span className="text-sm font-bold text-[#070810]">Officer</span>
                    </div>
                    <div className="col-span-3">
                      <span className="text-sm font-bold text-[#070810]">Church</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-sm font-bold text-[#070810]">Location</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-sm font-bold text-[#070810]">Gazette</span>
                    </div>
                    <div className="col-span-1">
                      <span className="text-sm font-bold text-[#070810]">Actions</span>
                    </div>
                  </div>
                )}

                {/* Table Rows */}
                <div className="divide-y divide-[#E5E8EC]">
                  {activeTab === 'people' && people.map((person) => (
                    <div
                      key={person.id}
                      className="grid grid-cols-12 gap-4 px-4 py-4 hover:bg-[#F7F8FA] transition-colors cursor-pointer"
                      onClick={() => handlePersonClick(person)}
                    >
                      <div className="col-span-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-[#022658] flex items-center justify-center flex-shrink-0">
                            {person.full_name || person.first_name || person.last_name ? (
                              <span className="text-sm font-medium text-white">
                                {(person.first_name?.charAt(0) || '').toUpperCase()}{(person.last_name?.charAt(0) || '').toUpperCase() || (person.full_name?.charAt(0) || '').toUpperCase()}
                              </span>
                            ) : (
                              <User className="w-5 h-5 text-white" />
                            )}
                          </div>
                          <div>
                            <div className="font-medium text-[#040E1B]">
                              {person.full_name || `${person.first_name || ''} ${person.last_name || ''}`.trim() || 'N/A'}
                            </div>
                            {person.occupation && (
                              <div className="text-sm text-[#868C98] mt-1">{person.occupation}</div>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="col-span-3">
                        <div className="text-sm text-[#070810]">
                          {person.phone_number || person.email || 'N/A'}
                        </div>
                      </div>
                      <div className="col-span-2">
                        <div className="text-sm text-[#070810]">
                          {person.city || person.region || 'N/A'}
                        </div>
                      </div>
                      <div className="col-span-2">
                        {person.risk_score !== undefined && person.risk_level ? (
                          <div className={`inline-flex px-2 py-1 rounded-lg text-xs font-medium ${
                            person.risk_score >= 70 ? 'bg-red-100 text-red-600' :
                            person.risk_score >= 40 ? 'bg-yellow-100 text-yellow-600' :
                            'bg-green-100 text-green-600'
                          }`}>
                            {Math.round(person.risk_score)} - {person.risk_level}
                          </div>
                        ) : (
                          <span className="text-sm text-[#868C98]">N/A</span>
                        )}
                      </div>
                      <div className="col-span-1">
                        <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePersonClick(person);
                          }}
                          className="text-[#022658] hover:text-[#033a7a] font-medium text-sm"
                        >
                          View
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openEdit('people', person);
                            }}
                            className="text-[#022658] hover:text-[#033a7a]"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete('people', person.id);
                            }}
                            className="text-red-600 hover:text-red-700"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {activeTab === 'change_of_name' && changeOfName.map((entry) => (
                    <div key={entry.id} className="grid grid-cols-12 gap-4 px-4 py-4">
                      <div className="col-span-2 text-sm text-[#040E1B]">{entry.item_number || 'N/A'}</div>
                      <div className="col-span-2 text-sm text-[#040E1B]">{entry.old_name || 'N/A'}</div>
                      <div className="col-span-2 text-sm text-[#040E1B]">{entry.new_name || 'N/A'}</div>
                      <div className="col-span-2 text-sm text-[#040E1B]">{entry.alias_name || 'N/A'}</div>
                      <div className="col-span-2 text-sm text-[#040E1B]">{entry.effective_date || 'N/A'}</div>
                      <div className="col-span-1 text-sm text-[#040E1B]">{entry.gazette_number || 'N/A'}</div>
                      <div className="col-span-1 flex items-center gap-2">
                        <button
                          onClick={() => openEdit('change_of_name', entry)}
                          className="text-[#022658] hover:text-[#033a7a]"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete('change_of_name', entry.id)}
                          className="text-red-600 hover:text-red-700"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                  {activeTab === 'correction_of_place_of_birth' && correctionPlace.map((entry) => (
                    <div key={entry.id} className="grid grid-cols-12 gap-4 px-4 py-4">
                      <div className="col-span-2 text-sm text-[#040E1B]">{entry.item_number || 'N/A'}</div>
                      <div className="col-span-2 text-sm text-[#040E1B]">{entry.person_name || 'N/A'}</div>
                      <div className="col-span-3 text-sm text-[#040E1B]">{entry.old_place_of_birth || 'N/A'}</div>
                      <div className="col-span-2 text-sm text-[#040E1B]">{entry.new_place_of_birth || 'N/A'}</div>
                      <div className="col-span-2 text-sm text-[#040E1B]">{entry.gazette_number || 'N/A'}</div>
                      <div className="col-span-1 flex items-center gap-2">
                        <button
                          onClick={() => openEdit('correction_of_place_of_birth', entry)}
                          className="text-[#022658] hover:text-[#033a7a]"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete('correction_of_place_of_birth', entry.id)}
                          className="text-red-600 hover:text-red-700"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                  {activeTab === 'correction_of_date_of_birth' && correctionDate.map((entry) => (
                    <div key={entry.id} className="grid grid-cols-12 gap-4 px-4 py-4">
                      <div className="col-span-2 text-sm text-[#040E1B]">{entry.item_number || 'N/A'}</div>
                      <div className="col-span-2 text-sm text-[#040E1B]">{entry.person_name || 'N/A'}</div>
                      <div className="col-span-3 text-sm text-[#040E1B]">{entry.old_date_of_birth || 'N/A'}</div>
                      <div className="col-span-2 text-sm text-[#040E1B]">{entry.new_date_of_birth || 'N/A'}</div>
                      <div className="col-span-2 text-sm text-[#040E1B]">{entry.gazette_number || 'N/A'}</div>
                      <div className="col-span-1 flex items-center gap-2">
                        <button
                          onClick={() => openEdit('correction_of_date_of_birth', entry)}
                          className="text-[#022658] hover:text-[#033a7a]"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete('correction_of_date_of_birth', entry.id)}
                          className="text-red-600 hover:text-red-700"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                  {activeTab === 'marriage_officers' && marriageOfficers.map((entry) => (
                    <div key={entry.id} className="grid grid-cols-12 gap-4 px-4 py-4">
                      <div className="col-span-4 text-sm text-[#040E1B]">{entry.officer_name || 'N/A'}</div>
                      <div className="col-span-3 text-sm text-[#040E1B]">{entry.church || 'N/A'}</div>
                      <div className="col-span-2 text-sm text-[#040E1B]">{entry.location || 'N/A'}</div>
                      <div className="col-span-2 text-sm text-[#040E1B]">{entry.gazette_number || 'N/A'}</div>
                      <div className="col-span-1 flex items-center gap-2">
                        <button
                          onClick={() => openEdit('marriage_officers', entry)}
                          className="text-[#022658] hover:text-[#033a7a]"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete('marriage_officers', entry.id)}
                          className="text-red-600 hover:text-red-700"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 border border-[#D4E1EA] rounded-lg hover:bg-[#F7F8FA] disabled:opacity-50 disabled:cursor-not-allowed text-sm text-[#525866]"
                  >
                    Previous
                  </button>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-[#525866]">
                      Page {currentPage} of {totalPages}
                    </span>
                  </div>

                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 border border-[#D4E1EA] rounded-lg hover:bg-[#F7F8FA] disabled:opacity-50 disabled:cursor-not-allowed text-sm text-[#525866]"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-lg w-full max-w-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-[#040E1B]">
                {formMode === 'create' ? 'Add' : 'Edit'} {fieldConfigs[formTab]?.title}
              </h2>
              <button onClick={closeForm} className="text-[#525866] hover:text-[#040E1B]">
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                {formError}
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
              {fieldConfigs[formTab]?.fields.map((field) => {
                const isTextarea = ['address', 'remarks', 'source_details'].includes(field.name);
                return (
                  <div key={field.name}>
                    <label className="block text-sm font-medium text-[#070810] mb-1">
                      {field.label}{field.required ? ' *' : ''}
                    </label>
                    {isTextarea ? (
                      <textarea
                        value={formData[field.name] ?? ''}
                        onChange={(event) => setFormData((prev) => ({ ...prev, [field.name]: event.target.value }))}
                        rows={3}
                        className="w-full px-3 py-2 border border-[#D4E1EA] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#022658] focus:border-transparent"
                      />
                    ) : (
                      <input
                        type={field.type || 'text'}
                        value={formData[field.name] ?? ''}
                        onChange={(event) => setFormData((prev) => ({ ...prev, [field.name]: event.target.value }))}
                        className="w-full px-3 py-2 border border-[#D4E1EA] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#022658] focus:border-transparent"
                      />
                    )}
                  </div>
                );
              })}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeForm}
                  className="px-4 py-2 border border-[#D4E1EA] rounded-lg text-[#525866] hover:bg-[#F7F8FA]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="px-4 py-2 bg-[#022658] text-white rounded-lg hover:bg-[#033a7a] disabled:opacity-60"
                >
                  {formSubmitting ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PeopleRelationshipsPage;
