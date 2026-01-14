import React, { useState, useEffect, useRef } from 'react';
import { apiGet } from '../../utils/api';

const AddCaseDrawer = ({ onClose, onSave, initialData = null, isEditMode = false, companyId }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [caseSearchQuery, setCaseSearchQuery] = useState('');
  const [caseSearchResults, setCaseSearchResults] = useState([]);
  const [showCaseDropdown, setShowCaseDropdown] = useState(false);
  const [caseSearchLoading, setCaseSearchLoading] = useState(false);
  const caseSearchTimeoutRef = useRef(null);
  const caseDropdownRef = useRef(null);

  const [formData, setFormData] = useState({
    caseId: initialData?.case_id || initialData?.id || null,
    caseNumber: initialData?.case_number || initialData?.suit_reference_number || '',
    caseTitle: initialData?.case_title || initialData?.title || '',
    roleInCase: initialData?.role_in_case || initialData?.role || ''
  });

  useEffect(() => {
    // Trigger animation after mount
    setTimeout(() => setIsOpen(true), 10);
  }, []);

  // Update form data when initialData changes
  useEffect(() => {
    if (initialData) {
      setFormData({
        caseId: initialData.case_id || initialData.id || null,
        caseNumber: initialData.case_number || initialData.suit_reference_number || '',
        caseTitle: initialData.case_title || initialData.title || '',
        roleInCase: initialData.role_in_case || initialData.role || ''
      });
    }
  }, [initialData]);

  // Handle clicks outside dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (caseDropdownRef.current && !caseDropdownRef.current.contains(event.target)) {
        setShowCaseDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Search cases
  const searchCases = async (query) => {
    if (!query || query.trim().length < 2) {
      setCaseSearchResults([]);
      setShowCaseDropdown(false);
      return;
    }

    setCaseSearchLoading(true);
    setShowCaseDropdown(true);

    try {
      const response = await apiGet(`/admin/case-hearings/search/cases?q=${encodeURIComponent(query)}&limit=10`);
      console.log('[AddCaseDrawer] Case search results:', response);
      
      if (Array.isArray(response)) {
        setCaseSearchResults(response);
      } else {
        setCaseSearchResults([]);
      }
    } catch (err) {
      console.error('[AddCaseDrawer] Error searching cases:', err);
      setCaseSearchResults([]);
    } finally {
      setCaseSearchLoading(false);
    }
  };

  // Handle case search input change
  const handleCaseSearchChange = (value) => {
    setCaseSearchQuery(value);
    
    // Clear previous timeout
    if (caseSearchTimeoutRef.current) {
      clearTimeout(caseSearchTimeoutRef.current);
    }

    // Debounce search
    caseSearchTimeoutRef.current = setTimeout(() => {
      searchCases(value);
    }, 300);
  };

  // Handle case selection
  const handleSelectCase = (caseItem) => {
    setFormData(prev => ({
      ...prev,
      caseId: caseItem.id,
      caseNumber: caseItem.suit_reference_number || '',
      caseTitle: caseItem.title || ''
    }));
    setCaseSearchQuery(caseItem.suit_reference_number || caseItem.title || '');
    setShowCaseDropdown(false);
    setCaseSearchResults([]);
  };

  const handleClose = () => {
    setIsOpen(false);
    setTimeout(onClose, 300); // Wait for animation to complete
  };

  const handleSave = () => {
    if (!formData.caseId && !formData.caseNumber) {
      alert('Please select a case or enter a case number');
      return;
    }
    onSave(formData);
    handleClose();
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black transition-opacity duration-300 z-40 ${
          isOpen ? 'opacity-50' : 'opacity-0'
        }`}
        onClick={handleClose}
      />

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-[500px] bg-white shadow-lg transform transition-transform duration-300 ease-in-out z-50 overflow-y-auto ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{ boxShadow: '-5px 8px 4px #0708101A' }}
      >
        <div className="flex flex-col items-start px-10 mt-[25px] mb-[102px] gap-4">
          {/* Close Button */}
          <button onClick={handleClose} className="cursor-pointer hover:opacity-70">
            <img
              src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Iq8V0MifpP/lhfwnfgd_expires_30_days.png"
              className="w-6 h-6 object-fill"
              alt="Close"
            />
          </button>

          <div className="flex flex-col self-stretch gap-10">
            <div className="flex flex-col self-stretch gap-6">
              {/* ADD NEW / EDIT Header */}
              <div className="flex flex-col items-start self-stretch gap-6">
                <span className="text-[#525866] text-xs">{isEditMode ? 'EDIT CASE LINK' : 'ADD NEW'}</span>

                {/* Case Search */}
                <div className="flex flex-col self-stretch gap-2 relative" ref={caseDropdownRef}>
                  <div className="flex justify-between items-start self-stretch">
                    <span className="text-[#040E1B] text-xs font-bold">Case</span>
                    <img
                      src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Iq8V0MifpP/aa3asrnp_expires_30_days.png"
                      className="w-4 h-4 object-fill"
                      alt="Required"
                    />
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      value={caseSearchQuery}
                      onChange={(e) => handleCaseSearchChange(e.target.value)}
                      placeholder="Search by case number or title"
                      className="self-stretch bg-[#F7F8FA] h-[51px] px-4 rounded-lg border border-solid border-[#D4E1EA] text-[#040E1B] text-sm outline-none focus:border-[#022658] w-full"
                    />
                    {showCaseDropdown && (caseSearchResults.length > 0 || caseSearchLoading) && (
                      <div className="absolute z-50 w-full mt-1 bg-white border border-[#D4E1EA] rounded-lg shadow-lg max-h-60 overflow-y-auto">
                        {caseSearchLoading ? (
                          <div className="px-4 py-2 text-sm text-[#525866]">Searching...</div>
                        ) : caseSearchResults.length > 0 ? (
                          caseSearchResults.map((caseItem) => (
                            <button
                              key={caseItem.id}
                              onClick={() => handleSelectCase(caseItem)}
                              className="w-full text-left px-4 py-2 hover:bg-[#F7F8FA] border-b border-[#E5E8EC] last:border-b-0"
                            >
                              <div className="text-sm font-medium text-[#040E1B]">{caseItem.suit_reference_number || 'N/A'}</div>
                              <div className="text-xs text-[#525866] truncate">{caseItem.title || 'N/A'}</div>
                            </button>
                          ))
                        ) : (
                          <div className="px-4 py-2 text-sm text-[#525866]">No cases found</div>
                        )}
                      </div>
                    )}
                  </div>
                  {formData.caseTitle && (
                    <div className="text-xs text-[#525866] mt-1">
                      Selected: {formData.caseTitle}
                    </div>
                  )}
                </div>
              </div>

              {/* Form Fields */}
              <div className="flex flex-col self-stretch gap-4">
                {/* Case Number (read-only if case selected) */}
                <div className="flex flex-col self-stretch gap-2">
                  <div className="flex justify-between items-start self-stretch">
                    <span className="text-[#040E1B] text-xs font-bold">Case Number</span>
                    <img
                      src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Iq8V0MifpP/07xoaqzf_expires_30_days.png"
                      className="w-4 h-4 object-fill"
                      alt="Required"
                    />
                  </div>
                  <input
                    type="text"
                    value={formData.caseNumber}
                    onChange={(e) => {
                      handleChange('caseNumber', e.target.value);
                      if (!formData.caseId) {
                        setCaseSearchQuery(e.target.value);
                      }
                    }}
                    placeholder="Enter case number"
                    className="self-stretch bg-[#F7F8FA] h-[51px] px-4 rounded-lg border border-solid border-[#D4E1EA] text-[#040E1B] text-sm outline-none focus:border-[#022658]"
                    readOnly={!!formData.caseId}
                  />
                </div>

                {/* Case Title (read-only if case selected) */}
                <div className="flex flex-col self-stretch gap-2">
                  <div className="flex justify-between items-start self-stretch">
                    <span className="text-[#040E1B] text-xs font-bold">Case Title</span>
                    <img
                      src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Iq8V0MifpP/07xoaqzf_expires_30_days.png"
                      className="w-4 h-4 object-fill"
                      alt="Required"
                    />
                  </div>
                  <input
                    type="text"
                    value={formData.caseTitle}
                    onChange={(e) => {
                      handleChange('caseTitle', e.target.value);
                      if (!formData.caseId) {
                        setCaseSearchQuery(e.target.value);
                      }
                    }}
                    placeholder="Enter case title"
                    className="self-stretch bg-[#F7F8FA] h-[51px] px-4 rounded-lg border border-solid border-[#D4E1EA] text-[#040E1B] text-sm outline-none focus:border-[#022658]"
                    readOnly={!!formData.caseId}
                  />
                </div>

                {/* Role in Case */}
                <div className="flex flex-col self-stretch gap-2">
                  <div className="flex justify-between items-start self-stretch">
                    <span className="text-[#040E1B] text-xs font-bold">Role in Case</span>
                    <img
                      src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Iq8V0MifpP/spqdqeu2_expires_30_days.png"
                      className="w-4 h-4 object-fill"
                      alt="Required"
                    />
                  </div>
                  <select
                    value={formData.roleInCase}
                    onChange={(e) => handleChange('roleInCase', e.target.value)}
                    className="self-stretch bg-[#F7F8FA] h-[51px] px-4 rounded-lg border border-solid border-[#D4E1EA] text-[#040E1B] text-sm outline-none focus:border-[#022658]"
                  >
                    <option value="">Select role</option>
                    <option value="Plaintiff">Plaintiff</option>
                    <option value="Defendant">Defendant</option>
                    <option value="Third Party">Third Party</option>
                    <option value="Applicant">Applicant</option>
                    <option value="Respondent">Respondent</option>
                    <option value="Petitioner">Petitioner</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-start self-stretch gap-10">
              <button
                onClick={handleClose}
                className="flex flex-1 flex-col items-center bg-transparent text-left py-[18px] rounded-lg border-2 border-solid border-transparent hover:bg-gray-50 transition-colors"
                style={{ boxShadow: '0px 4px 4px #050F1C1A' }}
              >
                <span className="text-[#022658] text-base font-bold">Cancel</span>
              </button>
              <button
                onClick={handleSave}
                className="flex flex-1 flex-col items-center text-left py-[18px] rounded-lg border-4 border-solid border-[#0F284726] hover:opacity-90 transition-opacity"
                style={{ background: 'linear-gradient(180deg, #022658, #1A4983)' }}
              >
                <span className="text-white text-base font-bold">Save</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AddCaseDrawer;

