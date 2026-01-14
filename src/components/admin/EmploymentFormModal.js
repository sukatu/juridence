import React, { useState, useEffect, useRef } from 'react';
import { X, Calendar } from 'lucide-react';
import { apiGet } from '../../utils/api';

const EmploymentFormModal = ({ isOpen, onClose, onSave, employment = null, isSaving = false }) => {
  const [formData, setFormData] = useState({
    company_name: '',
    position: '',
    department: '',
    start_date: '',
    end_date: '',
    is_current: false,
    reason_for_leaving: '',
    address: ''
  });

  const [companySearchQuery, setCompanySearchQuery] = useState('');
  const [companySearchResults, setCompanySearchResults] = useState([]);
  const [showCompanyDropdown, setShowCompanyDropdown] = useState(false);
  const [companySearchLoading, setCompanySearchLoading] = useState(false);
  const companyDropdownRef = useRef(null);
  const companySearchTimeoutRef = useRef(null);

  useEffect(() => {
    if (employment) {
      setFormData({
        company_name: employment.company_name || '',
        position: employment.position || '',
        department: employment.department || '',
        start_date: employment.start_date ? new Date(employment.start_date).toISOString().split('T')[0] : '',
        end_date: employment.end_date ? new Date(employment.end_date).toISOString().split('T')[0] : '',
        is_current: employment.is_current || false,
        reason_for_leaving: employment.reason_for_leaving || '',
        address: employment.address || ''
      });
      setCompanySearchQuery(employment.company_name || '');
    } else {
      setFormData({
        company_name: '',
        position: '',
        department: '',
        start_date: '',
        end_date: '',
        is_current: false,
        reason_for_leaving: '',
        address: ''
      });
      setCompanySearchQuery('');
    }
    setCompanySearchResults([]);
    setShowCompanyDropdown(false);
  }, [employment, isOpen]);

  // Debounced company/bank search
  useEffect(() => {
    if (companySearchTimeoutRef.current) {
      clearTimeout(companySearchTimeoutRef.current);
    }

    if (companySearchQuery && companySearchQuery.length >= 2) {
      setCompanySearchLoading(true);
      companySearchTimeoutRef.current = setTimeout(async () => {
        try {
          console.log('[EmploymentFormModal] Searching for companies/banks:', companySearchQuery);
          
          // Search both companies and banks in parallel
          let companiesResponse, banksResponse;
          try {
            companiesResponse = await apiGet(`/companies/search?query=${encodeURIComponent(companySearchQuery)}&limit=10&page=1`);
            console.log('[EmploymentFormModal] Companies response:', companiesResponse);
          } catch (err) {
            console.error('[EmploymentFormModal] Companies search error:', err);
            companiesResponse = { results: [] };
          }

          try {
            banksResponse = await apiGet(`/banks/search?query=${encodeURIComponent(companySearchQuery)}&limit=10&page=1`);
            console.log('[EmploymentFormModal] Banks response:', banksResponse);
          } catch (err) {
            console.error('[EmploymentFormModal] Banks search error:', err);
            banksResponse = { banks: [] };
          }

          // Combine results - check all possible response structures
          const companies = companiesResponse?.results || companiesResponse?.companies || companiesResponse?.data || (Array.isArray(companiesResponse) ? companiesResponse : []);
          const banks = banksResponse?.banks || banksResponse?.results || banksResponse?.data || (Array.isArray(banksResponse) ? banksResponse : []);
          
          console.log('[EmploymentFormModal] Parsed companies:', companies);
          console.log('[EmploymentFormModal] Parsed banks:', banks);

          // Format and combine results
          const combinedResults = [
            ...companies.map(company => ({
              id: company.id,
              name: company.name || company.short_name,
              type: 'company',
              industry: company.industry,
              city: company.city,
              region: company.region
            })),
            ...banks.map(bank => ({
              id: bank.id,
              name: bank.name || bank.short_name,
              type: 'bank',
              industry: 'Banking',
              city: bank.city,
              region: bank.region
            }))
          ];

          console.log('[EmploymentFormModal] Combined results:', combinedResults);
          console.log('[EmploymentFormModal] Companies found:', companies.length, 'Banks found:', banks.length);
          setCompanySearchResults(combinedResults);
          setShowCompanyDropdown(combinedResults.length > 0);
          console.log('[EmploymentFormModal] Dropdown should be visible:', combinedResults.length > 0);
        } catch (error) {
          console.error('[EmploymentFormModal] Error searching companies/banks:', error);
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

  // Handle click outside dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (companyDropdownRef.current && !companyDropdownRef.current.contains(event.target)) {
        setShowCompanyDropdown(false);
      }
    };

    if (showCompanyDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showCompanyDropdown]);

  const handleCompanySelect = (entity) => {
    setFormData(prev => ({
      ...prev,
      company_name: entity.name
    }));
    setCompanySearchQuery(entity.name);
    setShowCompanyDropdown(false);
    setCompanySearchResults([]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[10000] bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-[#040E1B]">
            {employment ? 'Edit Employment Record' : 'Add Employment Record'}
          </h2>
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
              Company Name <span className="text-red-500">*</span>
            </label>
            <div className="relative" ref={companyDropdownRef}>
              <input
                type="text"
                required
                value={companySearchQuery || formData.company_name}
                onChange={(e) => {
                  const value = e.target.value;
                  setCompanySearchQuery(value);
                  setFormData(prev => ({ ...prev, company_name: value }));
                  if (!value) {
                    setShowCompanyDropdown(false);
                    setCompanySearchResults([]);
                  }
                }}
                onFocus={() => {
                  // If we have results, show dropdown
                  if (companySearchResults.length > 0) {
                    setShowCompanyDropdown(true);
                  }
                  // If query is long enough but no results yet, trigger search
                  else if (companySearchQuery.length >= 2 && !companySearchLoading) {
                    // The useEffect will handle the search
                  }
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#022658] focus:border-transparent"
                placeholder="Search company or bank (type at least 2 characters)"
              />
              {companySearchLoading && (
                <div className="absolute right-3 top-2.5">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#022658]"></div>
                </div>
              )}
              {showCompanyDropdown && companySearchResults.length > 0 && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {companySearchResults.map((entity) => (
                    <div
                      key={`${entity.type}-${entity.id}`}
                      onClick={() => handleCompanySelect(entity)}
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
                    >
                      <div className="font-medium text-[#070810] flex items-center gap-2">
                        <span>{entity.name}</span>
                        <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded">
                          {entity.type === 'bank' ? 'Bank' : 'Company'}
                        </span>
                      </div>
                      {entity.industry && (
                        <div className="text-sm text-gray-500">{entity.industry}</div>
                      )}
                      {(entity.city || entity.region) && (
                        <div className="text-sm text-gray-500">
                          {[entity.city, entity.region].filter(Boolean).join(', ')}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
              {showCompanyDropdown && !companySearchLoading && companySearchResults.length === 0 && companySearchQuery.length >= 2 && (
                <div className="absolute z-[10001] w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
                  <div className="px-4 py-2 text-sm text-gray-500">No companies or banks found</div>
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Position <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.position}
              onChange={(e) => setFormData({...formData, position: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#022658] focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
            <input
              type="text"
              value={formData.department}
              onChange={(e) => setFormData({...formData, department: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#022658] focus:border-transparent"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <div className="relative">
                <input
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData({...formData, start_date: e.target.value})}
                  max={formData.end_date || new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#022658] focus:border-transparent"
                />
                <Calendar className="absolute right-3 top-2.5 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <div className="relative">
                <input
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => setFormData({...formData, end_date: e.target.value})}
                  min={formData.start_date}
                  max={new Date().toISOString().split('T')[0]}
                  disabled={formData.is_current}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#022658] focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
                <Calendar className="absolute right-3 top-2.5 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="is_current"
              checked={formData.is_current}
              onChange={(e) => {
                setFormData({
                  ...formData,
                  is_current: e.target.checked,
                  end_date: e.target.checked ? '' : formData.end_date
                });
              }}
              className="w-4 h-4 text-[#022658] border-gray-300 rounded focus:ring-[#022658]"
            />
            <label htmlFor="is_current" className="ml-2 text-sm text-gray-700">
              Current Employment
            </label>
          </div>

          {!formData.is_current && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Reason for Leaving</label>
              <input
                type="text"
                value={formData.reason_for_leaving}
                onChange={(e) => setFormData({...formData, reason_for_leaving: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#022658] focus:border-transparent"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({...formData, address: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#022658] focus:border-transparent"
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
              {isSaving ? 'Saving...' : (employment ? 'Update' : 'Add')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EmploymentFormModal;
