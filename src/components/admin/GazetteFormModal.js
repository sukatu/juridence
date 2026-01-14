import React, { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { apiGet, apiPost } from '../../utils/api';

const GazetteFormModal = ({ isOpen, onClose, onSave, personId, isSaving }) => {
  const [formData, setFormData] = useState({
    gazette_type: 'CHANGE_OF_NAME',
    entity_type: 'Individual',
    // Change of Name fields
    current_name: '',
    old_name: '',
    alias_names: '',
    profession: '',
    address: '',
    effective_date_of_change: '',
    remarks: '',
    // Change of Date of Birth fields
    name: '',
    new_date_of_birth: '',
    old_date_of_birth: '',
    // Change of Place of Birth fields
    mistake_place: '',
    correct_place: '',
    // Common fields
    national_id: '',
    reason_for_change: '',
    change_effective_from: '',
    // Source fields
    gazette_number: '',
    gazette_date: '',
    item_number: '',
    page_number: '',
    // Person linking
    linked_person_id: null,
    linked_person_name: '',
    // Company linking
    company_id: null,
    company_name: ''
  });

  const [personSearchQuery, setPersonSearchQuery] = useState('');
  const [personSearchResults, setPersonSearchResults] = useState([]);
  const [showPersonDropdown, setShowPersonDropdown] = useState(false);
  const [companySearchQuery, setCompanySearchQuery] = useState('');
  const [companySearchResults, setCompanySearchResults] = useState([]);
  const [showCompanyDropdown, setShowCompanyDropdown] = useState(false);
  const [showAddCompanyModal, setShowAddCompanyModal] = useState(false);
  const [newCompanyData, setNewCompanyData] = useState({ name: '', industry: '', city: '', region: '' });
  const [searchLoading, setSearchLoading] = useState(false);
  const [companySearchLoading, setCompanySearchLoading] = useState(false);
  const dropdownRef = useRef(null);
  const companyDropdownRef = useRef(null);
  const searchTimeoutRef = useRef(null);
  const companySearchTimeoutRef = useRef(null);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      // Reset form data
      setFormData({
        gazette_type: 'CHANGE_OF_NAME',
        entity_type: 'Individual',
        current_name: '',
        old_name: '',
        alias_names: '',
        profession: '',
        address: '',
        effective_date_of_change: '',
        remarks: '',
        name: '',
        new_date_of_birth: '',
        old_date_of_birth: '',
        mistake_place: '',
        correct_place: '',
        national_id: '',
        reason_for_change: '',
        change_effective_from: '',
        gazette_number: '',
        gazette_date: '',
        item_number: '',
        page_number: '',
        linked_person_id: personId || null,
        linked_person_name: '',
        company_id: null,
        company_name: ''
      });
      setPersonSearchQuery('');
      setPersonSearchResults([]);
      setShowPersonDropdown(false);
      setCompanySearchQuery('');
      setCompanySearchResults([]);
      setShowCompanyDropdown(false);
      setShowAddCompanyModal(false);
      setNewCompanyData({ name: '', industry: '', city: '', region: '' });
    }
  }, [isOpen, personId]);

  // Debounced person search
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (personSearchQuery && personSearchQuery.length >= 2) {
      setSearchLoading(true);
      searchTimeoutRef.current = setTimeout(async () => {
        try {
          console.log('[GazetteFormModal] Searching for people:', personSearchQuery);
          const response = await apiGet(`/people/search?query=${encodeURIComponent(personSearchQuery)}&limit=10&page=1`);
          console.log('[GazetteFormModal] Search response:', response);
          
          // Handle different response structures
          const results = response.results || response.people || response.data || (Array.isArray(response) ? response : []);
          console.log('[GazetteFormModal] Parsed results:', results);
          
          setPersonSearchResults(results);
          setShowPersonDropdown(results.length > 0);
        } catch (error) {
          console.error('[GazetteFormModal] Error searching people:', error);
          setPersonSearchResults([]);
          setShowPersonDropdown(false);
        } finally {
          setSearchLoading(false);
        }
      }, 300);
    } else {
      setPersonSearchResults([]);
      setShowPersonDropdown(false);
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [personSearchQuery]);

  // Handle click outside dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowPersonDropdown(false);
      }
      if (companyDropdownRef.current && !companyDropdownRef.current.contains(event.target)) {
        setShowCompanyDropdown(false);
      }
    };

    if (showPersonDropdown || showCompanyDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showPersonDropdown, showCompanyDropdown]);

  // Debounced company search
  useEffect(() => {
    if (companySearchTimeoutRef.current) {
      clearTimeout(companySearchTimeoutRef.current);
    }

    if (companySearchQuery && companySearchQuery.length >= 2) {
      setCompanySearchLoading(true);
      companySearchTimeoutRef.current = setTimeout(async () => {
        try {
          console.log('[GazetteFormModal] Searching for companies:', companySearchQuery);
          const response = await apiGet(`/companies/search?query=${encodeURIComponent(companySearchQuery)}&limit=10&page=1`);
          console.log('[GazetteFormModal] Company search response:', response);
          
          // Handle different response structures
          const results = response.results || response.companies || response.data || (Array.isArray(response) ? response : []);
          console.log('[GazetteFormModal] Parsed company results:', results);
          
          setCompanySearchResults(results);
          setShowCompanyDropdown(results.length > 0);
        } catch (error) {
          console.error('[GazetteFormModal] Error searching companies:', error);
          setCompanySearchResults([]);
          setShowCompanyDropdown(false);
        } finally {
          setCompanySearchLoading(false);
        }
      }, 300);
    } else {
      setCompanySearchResults([]);
      setShowCompanyDropdown(false);
    }

    return () => {
      if (companySearchTimeoutRef.current) {
        clearTimeout(companySearchTimeoutRef.current);
      }
    };
  }, [companySearchQuery]);

  const handlePersonSelect = (person) => {
    setFormData(prev => ({
      ...prev,
      linked_person_id: person.id,
      linked_person_name: person.full_name || `${person.first_name} ${person.last_name}`,
      name: person.full_name || `${person.first_name} ${person.last_name}`,
      current_name: person.full_name || `${person.first_name} ${person.last_name}`,
      national_id: person.id_number || prev.national_id
    }));
    setPersonSearchQuery(person.full_name || `${person.first_name} ${person.last_name}`);
    setShowPersonDropdown(false);
    setPersonSearchResults([]);
  };

  const handleCompanySelect = (company) => {
    setFormData(prev => ({
      ...prev,
      company_id: company.id,
      company_name: company.name || company.short_name
    }));
    setCompanySearchQuery(company.name || company.short_name);
    setShowCompanyDropdown(false);
    setCompanySearchResults([]);
  };

  const handleCreateCompany = async () => {
    if (!newCompanyData.name) {
      alert('Please enter a company name');
      return;
    }

    try {
      setCompanySearchLoading(true);
      const companyData = {
        name: newCompanyData.name,
        industry: newCompanyData.industry || null,
        city: newCompanyData.city || null,
        region: newCompanyData.region || null,
        is_active: true
      };

      console.log('[GazetteFormModal] Creating company:', companyData);
      const response = await apiPost('/companies/', companyData);
      console.log('[GazetteFormModal] Company created:', response);

      // Select the newly created company
      handleCompanySelect(response);
      setShowAddCompanyModal(false);
      setNewCompanyData({ name: '', industry: '', city: '', region: '' });
    } catch (error) {
      console.error('[GazetteFormModal] Error creating company:', error);
      alert(error.message || 'Failed to create company. Please try again.');
    } finally {
      setCompanySearchLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Build gazette data based on type
    const gazetteData = {
      gazette_type: formData.gazette_type,
      publication_date: formData.gazette_date || new Date().toISOString(),
      effective_date: formData.change_effective_from || formData.effective_date_of_change,
      person_id: formData.entity_type === 'Individual' ? (formData.linked_person_id || personId || null) : null,
      company_id: formData.entity_type === 'Company' ? (formData.company_id || null) : null,
      gazette_number: formData.gazette_number || null,
      gazette_date: formData.gazette_date || null,
      item_number: formData.item_number || null,
      page_number: formData.page_number ? parseInt(formData.page_number) : null,
      source: 'Manual Entry',
      remarks: formData.remarks || null
    };

    // Add type-specific fields
    if (formData.gazette_type === 'CHANGE_OF_NAME') {
      gazetteData.title = `Change of Name: ${formData.current_name || formData.name}`;
      gazetteData.content = `Name changed from ${formData.old_name || 'N/A'} to ${formData.current_name || formData.name || 'N/A'}`;
      gazetteData.description = formData.reason_for_change || gazetteData.content;
      gazetteData.old_name = formData.old_name || null;
      gazetteData.new_name = formData.current_name || formData.name || null;
      gazetteData.alias_names = formData.alias_names ? formData.alias_names.split(',').map(a => a.trim()).filter(a => a) : null;
      gazetteData.profession = formData.profession || null;
      gazetteData.effective_date_of_change = formData.effective_date_of_change || null;
    } else if (formData.gazette_type === 'CHANGE_OF_DATE_OF_BIRTH') {
      gazetteData.title = `Change of Date of Birth: ${formData.name || 'N/A'}`;
      gazetteData.content = `Date of birth corrected from ${formData.old_date_of_birth || 'N/A'} to ${formData.new_date_of_birth || 'N/A'}`;
      gazetteData.description = formData.reason_for_change || gazetteData.content;
      gazetteData.old_date_of_birth = formData.old_date_of_birth || null;
      gazetteData.new_date_of_birth = formData.new_date_of_birth || null;
      gazetteData.profession = formData.profession || null;
      gazetteData.effective_date_of_change = formData.change_effective_from || formData.effective_date_of_change || null;
    } else if (formData.gazette_type === 'CHANGE_OF_PLACE_OF_BIRTH') {
      gazetteData.title = `Change of Place of Birth: ${formData.name || 'N/A'}`;
      gazetteData.content = `Place of birth corrected from ${formData.mistake_place || 'N/A'} to ${formData.correct_place || 'N/A'}`;
      gazetteData.description = formData.reason_for_change || gazetteData.content;
      gazetteData.old_place_of_birth = formData.mistake_place || null;
      gazetteData.new_place_of_birth = formData.correct_place || null;
      gazetteData.profession = formData.profession || null;
      gazetteData.effective_date_of_change = formData.change_effective_from || formData.effective_date_of_change || null;
    }

    // Remove null/empty values
    Object.keys(gazetteData).forEach(key => {
      if (gazetteData[key] === null || gazetteData[key] === '' || (Array.isArray(gazetteData[key]) && gazetteData[key].length === 0)) {
        delete gazetteData[key];
      }
    });

    console.log('[GazetteFormModal] Submitting gazette data:', gazetteData);
    onSave(gazetteData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-[#040E1B]">Add New Gazette Notice</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
            disabled={isSaving}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Gazette Type */}
          <div>
            <label className="block text-sm font-medium text-[#070810] mb-2">
              Gazette Notice Type <span className="text-red-500">*</span>
            </label>
            <select
              name="gazette_type"
              value={formData.gazette_type}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#022658] focus:border-transparent"
            >
              <option value="CHANGE_OF_NAME">Change of Name</option>
              <option value="CHANGE_OF_DATE_OF_BIRTH">Change of Date of Birth</option>
              <option value="CHANGE_OF_PLACE_OF_BIRTH">Change of Place of Birth</option>
            </select>
          </div>

          {/* Entity Type */}
          <div>
            <label className="block text-sm font-medium text-[#070810] mb-2">
              Entity Type <span className="text-red-500">*</span>
            </label>
            <select
              name="entity_type"
              value={formData.entity_type}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#022658] focus:border-transparent"
            >
              <option value="Individual">Individual</option>
              <option value="Company">Company</option>
            </select>
          </div>

          {/* Link to Existing Profile (for Individual) */}
          {formData.entity_type === 'Individual' && (
            <div>
              <label className="block text-sm font-medium text-[#070810] mb-2">
                Link to Existing Profile
              </label>
            <div className="relative" ref={dropdownRef}>
              <input
                type="text"
                value={personSearchQuery || formData.linked_person_name}
                onChange={(e) => {
                  const value = e.target.value;
                  setPersonSearchQuery(value);
                  if (!value) {
                    setFormData(prev => ({
                      ...prev,
                      linked_person_id: null,
                      linked_person_name: ''
                    }));
                    setShowPersonDropdown(false);
                  }
                }}
                onFocus={() => {
                  if (personSearchResults.length > 0) {
                    setShowPersonDropdown(true);
                  }
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#022658] focus:border-transparent"
                placeholder="Search existing person (type at least 2 characters)"
              />
              {searchLoading && (
                <div className="absolute right-3 top-2.5">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#022658]"></div>
                </div>
              )}
              {showPersonDropdown && personSearchResults.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {personSearchResults.map((person) => (
                    <div
                      key={person.id}
                      onClick={() => handlePersonSelect(person)}
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
                    >
                      <div className="font-medium text-[#070810]">
                        {person.full_name || `${person.first_name || ''} ${person.last_name || ''}`.trim() || 'N/A'}
                      </div>
                      {person.id_number && (
                        <div className="text-sm text-gray-500">ID: {person.id_number}</div>
                      )}
                      {person.occupation && (
                        <div className="text-sm text-gray-500">{person.occupation}</div>
                      )}
                    </div>
                  ))}
                </div>
              )}
              {showPersonDropdown && !searchLoading && personSearchResults.length === 0 && personSearchQuery.length >= 2 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
                  <div className="px-4 py-2 text-sm text-gray-500">No persons found</div>
                </div>
              )}
            </div>
          </div>
          )}

          {/* Company Name (for Company) */}
          {formData.entity_type === 'Company' && (
            <div>
              <label className="block text-sm font-medium text-[#070810] mb-2">
                Company Name <span className="text-red-500">*</span>
              </label>
              <div className="relative" ref={companyDropdownRef}>
                <input
                  type="text"
                  value={companySearchQuery || formData.company_name}
                  onChange={(e) => {
                    const value = e.target.value;
                    setCompanySearchQuery(value);
                    if (!value) {
                      setFormData(prev => ({
                        ...prev,
                        company_id: null,
                        company_name: ''
                      }));
                      setShowCompanyDropdown(false);
                    }
                  }}
                  onFocus={() => {
                    if (companySearchResults.length > 0) {
                      setShowCompanyDropdown(true);
                    }
                  }}
                  required={formData.entity_type === 'Company'}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#022658] focus:border-transparent"
                  placeholder="Search existing company (type at least 2 characters)"
                />
                {companySearchLoading && (
                  <div className="absolute right-3 top-2.5">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#022658]"></div>
                  </div>
                )}
                {showCompanyDropdown && companySearchResults.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {companySearchResults.map((company) => (
                      <div
                        key={company.id}
                        onClick={() => handleCompanySelect(company)}
                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
                      >
                        <div className="font-medium text-[#070810]">
                          {company.name || company.short_name || 'N/A'}
                        </div>
                        {company.industry && (
                          <div className="text-sm text-gray-500">{company.industry}</div>
                        )}
                        {(company.city || company.region) && (
                          <div className="text-sm text-gray-500">
                            {[company.city, company.region].filter(Boolean).join(', ')}
                          </div>
                        )}
                      </div>
                    ))}
                    <div
                      onClick={() => setShowAddCompanyModal(true)}
                      className="px-4 py-2 hover:bg-blue-50 cursor-pointer border-t border-gray-200 bg-gray-50"
                    >
                      <div className="font-medium text-[#022658] flex items-center gap-2">
                        <span>+</span>
                        <span>Add New Company</span>
                      </div>
                    </div>
                  </div>
                )}
                {showCompanyDropdown && !companySearchLoading && companySearchResults.length === 0 && companySearchQuery.length >= 2 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
                    <div className="px-4 py-2 text-sm text-gray-500">No companies found</div>
                    <div
                      onClick={() => setShowAddCompanyModal(true)}
                      className="px-4 py-2 hover:bg-blue-50 cursor-pointer border-t border-gray-200"
                    >
                      <div className="font-medium text-[#022658] flex items-center gap-2">
                        <span>+</span>
                        <span>Add New Company</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Change of Name Fields */}
          {formData.gazette_type === 'CHANGE_OF_NAME' && (
            <>
              <div>
                <label className="block text-sm font-medium text-[#070810] mb-2">
                  Current Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="current_name"
                  value={formData.current_name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#022658] focus:border-transparent"
                  placeholder="Enter current name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#070810] mb-2">
                  Previous Name
                </label>
                <input
                  type="text"
                  name="old_name"
                  value={formData.old_name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#022658] focus:border-transparent"
                  placeholder="Enter previous name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#070810] mb-2">
                  Alias Name(s)
                </label>
                <input
                  type="text"
                  name="alias_names"
                  value={formData.alias_names}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#022658] focus:border-transparent"
                  placeholder="Enter alias names (comma-separated)"
                />
              </div>
            </>
          )}

          {/* Change of Date of Birth Fields */}
          {formData.gazette_type === 'CHANGE_OF_DATE_OF_BIRTH' && (
            <>
              <div>
                <label className="block text-sm font-medium text-[#070810] mb-2">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#022658] focus:border-transparent"
                  placeholder="Enter name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#070810] mb-2">
                  New Date of Birth <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="new_date_of_birth"
                  value={formData.new_date_of_birth}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#022658] focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#070810] mb-2">
                  Old Date of Birth
                </label>
                <input
                  type="date"
                  name="old_date_of_birth"
                  value={formData.old_date_of_birth}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#022658] focus:border-transparent"
                />
              </div>
            </>
          )}

          {/* Change of Place of Birth Fields */}
          {formData.gazette_type === 'CHANGE_OF_PLACE_OF_BIRTH' && (
            <>
              <div>
                <label className="block text-sm font-medium text-[#070810] mb-2">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#022658] focus:border-transparent"
                  placeholder="Enter name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#070810] mb-2">
                  Mistake Place
                </label>
                <input
                  type="text"
                  name="mistake_place"
                  value={formData.mistake_place}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#022658] focus:border-transparent"
                  placeholder="Enter mistake place"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#070810] mb-2">
                  Correct Place <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="correct_place"
                  value={formData.correct_place}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#022658] focus:border-transparent"
                  placeholder="Enter correct place"
                />
              </div>
            </>
          )}

          {/* Common Fields */}
          <div>
            <label className="block text-sm font-medium text-[#070810] mb-2">
              Date of Birth
            </label>
            <input
              type="date"
              name="date_of_birth"
              value={formData.new_date_of_birth || formData.old_date_of_birth || ''}
              onChange={(e) => {
                if (formData.gazette_type === 'CHANGE_OF_DATE_OF_BIRTH') {
                  setFormData(prev => ({
                    ...prev,
                    new_date_of_birth: e.target.value
                  }));
                } else {
                  setFormData(prev => ({
                    ...prev,
                    old_date_of_birth: e.target.value
                  }));
                }
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#022658] focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#070810] mb-2">
              National ID
            </label>
            <input
              type="text"
              name="national_id"
              value={formData.national_id}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#022658] focus:border-transparent"
              placeholder="Enter National ID"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#070810] mb-2">
              Profession
            </label>
            <input
              type="text"
              name="profession"
              value={formData.profession}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#022658] focus:border-transparent"
              placeholder="Enter profession"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#070810] mb-2">
              Address
            </label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#022658] focus:border-transparent"
              placeholder="Enter address"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#070810] mb-2">
              Reason for Change
            </label>
            <textarea
              name="reason_for_change"
              value={formData.reason_for_change}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#022658] focus:border-transparent"
              placeholder="Enter reason for change"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#070810] mb-2">
              Change Effective From <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="change_effective_from"
              value={formData.change_effective_from}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#022658] focus:border-transparent"
            />
          </div>

          {/* Source Information */}
          <div className="border-t border-gray-200 pt-4">
            <h3 className="text-lg font-semibold text-[#040E1B] mb-4">Source Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#070810] mb-2">
                  Gazette Number
                </label>
                <input
                  type="text"
                  name="gazette_number"
                  value={formData.gazette_number}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#022658] focus:border-transparent"
                  placeholder="Enter gazette number"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#070810] mb-2">
                  Gazette Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="gazette_date"
                  value={formData.gazette_date}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#022658] focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#070810] mb-2">
                  Item No.
                </label>
                <input
                  type="text"
                  name="item_number"
                  value={formData.item_number}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#022658] focus:border-transparent"
                  placeholder="Enter item number"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#070810] mb-2">
                  Page No.
                </label>
                <input
                  type="number"
                  name="page_number"
                  value={formData.page_number}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#022658] focus:border-transparent"
                  placeholder="Enter page number"
                />
              </div>
            </div>
          </div>

          {/* Remarks */}
          <div>
            <label className="block text-sm font-medium text-[#070810] mb-2">
              Remarks
            </label>
            <textarea
              name="remarks"
              value={formData.remarks}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#022658] focus:border-transparent"
              placeholder="Enter remarks"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-4 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2 bg-[#022658] text-white rounded-lg hover:bg-[#033a7a] transition-colors disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : 'Save Gazette Notice'}
            </button>
          </div>
        </form>
      </div>

      {/* Add Company Modal */}
      {showAddCompanyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-[#040E1B]">Add New Company</h3>
              <button
                onClick={() => {
                  setShowAddCompanyModal(false);
                  setNewCompanyData({ name: '', industry: '', city: '', region: '' });
                }}
                className="text-gray-500 hover:text-gray-700 transition-colors"
                disabled={companySearchLoading}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#070810] mb-2">
                  Company Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newCompanyData.name}
                  onChange={(e) => setNewCompanyData(prev => ({ ...prev, name: e.target.value }))}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#022658] focus:border-transparent"
                  placeholder="Enter company name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#070810] mb-2">
                  Industry
                </label>
                <input
                  type="text"
                  value={newCompanyData.industry}
                  onChange={(e) => setNewCompanyData(prev => ({ ...prev, industry: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#022658] focus:border-transparent"
                  placeholder="Enter industry"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#070810] mb-2">
                    City
                  </label>
                  <input
                    type="text"
                    value={newCompanyData.city}
                    onChange={(e) => setNewCompanyData(prev => ({ ...prev, city: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#022658] focus:border-transparent"
                    placeholder="Enter city"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#070810] mb-2">
                    Region
                  </label>
                  <input
                    type="text"
                    value={newCompanyData.region}
                    onChange={(e) => setNewCompanyData(prev => ({ ...prev, region: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#022658] focus:border-transparent"
                    placeholder="Enter region"
                  />
                </div>
              </div>
              <div className="flex items-center justify-end gap-4 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddCompanyModal(false);
                    setNewCompanyData({ name: '', industry: '', city: '', region: '' });
                  }}
                  disabled={companySearchLoading}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleCreateCompany}
                  disabled={companySearchLoading || !newCompanyData.name}
                  className="px-4 py-2 bg-[#022658] text-white rounded-lg hover:bg-[#033a7a] transition-colors disabled:opacity-50"
                >
                  {companySearchLoading ? 'Creating...' : 'Create Company'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GazetteFormModal;
