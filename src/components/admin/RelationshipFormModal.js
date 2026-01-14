import React, { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { apiGet } from '../../utils/api';

const RelationshipFormModal = ({ isOpen, onClose, onSave, personId, isSaving = false }) => {
  const [formData, setFormData] = useState({
    related_person_name: '',
    relationship_type: '',
    phone: '',
    email: '',
    notes: '',
    related_person_id: null
  });

  const [personSearchQuery, setPersonSearchQuery] = useState('');
  const [personSearchResults, setPersonSearchResults] = useState([]);
  const [showPersonDropdown, setShowPersonDropdown] = useState(false);
  const [personSearchLoading, setPersonSearchLoading] = useState(false);
  const personSearchTimeoutRef = useRef(null);
  const personDropdownRef = useRef(null);

  const relationshipTypes = [
    'Spouse',
    'Wife',
    'Husband',
    'Child',
    'Parent',
    'Sibling',
    'Brother',
    'Sister',
    'Cousin',
    'Uncle',
    'Aunt',
    'Nephew',
    'Niece',
    'Grandparent',
    'Grandchild',
    'Business Partner',
    'Associate',
    'Friend',
    'Other'
  ];

  useEffect(() => {
    if (isOpen) {
      setFormData({
        related_person_name: '',
        relationship_type: '',
        phone: '',
        email: '',
        notes: '',
        related_person_id: null
      });
      setPersonSearchQuery('');
      setPersonSearchResults([]);
    }
  }, [isOpen]);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (personDropdownRef.current && !personDropdownRef.current.contains(event.target)) {
        setShowPersonDropdown(false);
      }
    };

    if (showPersonDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showPersonDropdown]);

  // Search for persons
  useEffect(() => {
    if (personSearchTimeoutRef.current) {
      clearTimeout(personSearchTimeoutRef.current);
    }

    if (personSearchQuery.length < 2) {
      setPersonSearchResults([]);
      setShowPersonDropdown(false);
      return;
    }

    personSearchTimeoutRef.current = setTimeout(async () => {
      try {
        setPersonSearchLoading(true);
        // Use the search endpoint
        const response = await apiGet(`/people/search?query=${encodeURIComponent(personSearchQuery)}&limit=10&page=1`);
        
        const results = response.results || response.people || response.data || [];
        setPersonSearchResults(results);
        setShowPersonDropdown(results.length > 0);
      } catch (error) {
        console.error('Error searching persons:', error);
        setPersonSearchResults([]);
      } finally {
        setPersonSearchLoading(false);
      }
    }, 300);
  }, [personSearchQuery]);

  const handlePersonSelect = (person) => {
    const personName = person.full_name || person.name || '';
    setFormData({
      ...formData,
      related_person_id: person.id,
      related_person_name: personName,
      phone: person.phone_number || formData.phone || '',
      email: person.email || formData.email || ''
    });
    setPersonSearchQuery(personName);
    setShowPersonDropdown(false);
    setPersonSearchResults([]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Ensure related_person_name is set from search query if not already set in formData
    const finalData = {
      ...formData,
      related_person_name: formData.related_person_name || personSearchQuery || ''
    };
    
    if (!finalData.related_person_name || !finalData.relationship_type) {
      alert('Please fill in required fields: Person Name and Relationship Type');
      return;
    }
    
    // Remove related_person_id if it's null (user typed name manually)
    if (!finalData.related_person_id) {
      delete finalData.related_person_id;
    }
    
    // Ensure phone and email are not empty strings
    if (finalData.phone === '') {
      delete finalData.phone;
    }
    if (finalData.email === '') {
      delete finalData.email;
    }
    if (finalData.notes === '') {
      delete finalData.notes;
    }
    
    console.log('[RelationshipFormModal] Submitting relationship data:', finalData);
    onSave(finalData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[10000] bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-[#040E1B]">Add Relationship</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Person Name <span className="text-red-500">*</span>
            </label>
            <div className="relative" ref={personDropdownRef}>
              <input
                type="text"
                required
                value={personSearchQuery || formData.related_person_name}
                onChange={(e) => {
                  const value = e.target.value;
                  setPersonSearchQuery(value);
                  // Update formData with the typed name
                  setFormData(prev => ({
                    ...prev, 
                    related_person_name: value,
                    // Clear related_person_id if user is typing manually (not from dropdown)
                    related_person_id: prev.related_person_id && value === prev.related_person_name ? prev.related_person_id : null
                  }));
                }}
                onFocus={() => {
                  if (personSearchResults.length > 0) {
                    setShowPersonDropdown(true);
                  }
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#022658] focus:border-transparent"
                placeholder="Search for person or enter name"
              />
              {showPersonDropdown && personSearchResults.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {personSearchLoading ? (
                    <div className="p-3 text-center text-gray-500">Searching...</div>
                  ) : (
                    personSearchResults.map((person) => (
                      <button
                        key={person.id}
                        type="button"
                        onClick={() => handlePersonSelect(person)}
                        className="w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors"
                      >
                        <div className="font-medium text-gray-900">{person.full_name || person.name}</div>
                        {person.phone_number && (
                          <div className="text-sm text-gray-500">{person.phone_number}</div>
                        )}
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
            {formData.related_person_id && (
              <p className="mt-1 text-xs text-green-600">✓ Person found in database</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Relationship Type <span className="text-red-500">*</span>
            </label>
            <select
              required
              value={formData.relationship_type}
              onChange={(e) => setFormData({...formData, relationship_type: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#022658] focus:border-transparent"
            >
              <option value="">Select Relationship Type</option>
              {relationshipTypes.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#022658] focus:border-transparent"
              placeholder="Enter phone number"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#022658] focus:border-transparent"
              placeholder="Enter email"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#022658] focus:border-transparent min-h-[80px]"
              placeholder="Enter any additional notes"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-4 py-2 bg-[#022658] text-white rounded-lg hover:bg-[#033a7a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? 'Saving...' : 'Add Relationship'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RelationshipFormModal;
