import React, { useState, useRef, useEffect } from 'react';
import { X } from 'lucide-react';
import AdminHeader from './AdminHeader';
import { apiPost, apiGet } from '../../utils/api';

const AddCompanyForm = ({ onBack, userInfo, onNavigate, onLogout, industry }) => {
  // Main form data
  const [formData, setFormData] = useState({
    name: '',
    registration_number: '',
    date_of_incorporation: '',
    company_type: '',
    status: 'Active',
    industry: industry?.name || '',
    address: '',
    tax_identification_number: '',
    logo_url: null,
    authorized_capital: '',
    annual_turnover: '',
    total_assets: '',
    financial_year_end: '',
    auditor_firm_name: '',
    auditor_phone: '',
    auditor_start_date: '',
    auditor_end_date: ''
  });

  // Dynamic arrays
  const [shareholders, setShareholders] = useState([{
    name: '',
    type: '',
    number_of_shares: '',
    acquired_date: '',
    ownership_percentage: '',
    status: ''
  }]);
  const [employees, setEmployees] = useState([{
    name: '',
    position: '',
    department: '',
    start_date: '',
    end_date: '',
    reason_for_leaving: '',
    source: ''
  }]);
  const [regulatory, setRegulatory] = useState([{
    body: '',
    license_permit_number: '',
    license_permit_type: '',
    issue_date: '',
    expiry_date: '',
    status: ''
  }]);
  const [locations, setLocations] = useState([{
    location_type: '',
    address: '',
    phone: ''
  }]);
  const [cases, setCases] = useState([{
    case_id: null,
    case_number: '',
    case_title: '',
    role_in_case: ''
  }]);
  
  // Case search state for typeahead (per case index)
  const [caseSearchResults, setCaseSearchResults] = useState([[]]); // Array of arrays, one per case
  const [showCaseDropdown, setShowCaseDropdown] = useState([false]); // Array of booleans, one per case
  const [caseSearchLoading, setCaseSearchLoading] = useState([false]); // Array of booleans
  const caseSearchTimeoutRef = useRef([null]); // Array of timeout refs
  const caseDropdownRef = useRef([null]); // Array of refs for dropdowns
  const [linkedCompanies, setLinkedCompanies] = useState([{
    company_name: '',
    address: '',
    relationship: ''
  }]);
  const [sources, setSources] = useState([{
    source: '',
    source_reference: ''
  }]);

  // UI state
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showDropdowns, setShowDropdowns] = useState({});
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  
  // Dropdown options
  const companyTypes = ['Public Limited', 'Private Limited', 'Partnership', 'Sole Proprietorship', 'Limited Liability'];
  const companyStatuses = ['Active', 'Inactive', 'Dissolved', 'Struck Off', 'In Liquidation'];
  const sectors = ['Banking & Finance', 'Energy', 'Technology', 'Manufacturing', 'Services', 'Retail', 'Healthcare', 'Education', 'Real Estate', 'Agriculture'];
  const shareholderTypes = ['Individual', 'Company', 'Trust', 'Partnership'];
  const shareholderStatuses = ['Active', 'Transferred', 'Dissolved'];
  const locationTypes = ['Head Office', 'Branch', 'Warehouse', 'Factory', 'Other'];
  const caseRoles = ['Plaintiff', 'Defendant', 'Third Party', 'Witness', 'Interested Party'];
  const relationships = ['Subsidiary', 'Parent', 'Sister Company', 'Joint Venture', 'Partner', 'Supplier', 'Customer'];
  const sourceTypes = ['Registry', 'Gazette', 'Manual Entry', 'Court Records', 'Other'];
  
  const dropdownRefs = useRef({});

  // Handle click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Check if click is outside any dropdown
      let clickedInsideAnyDropdown = false;
      
      // Check regular dropdowns
      Object.keys(dropdownRefs.current).forEach(key => {
        const ref = dropdownRefs.current[key];
        if (ref && ref.current && typeof ref.current.contains === 'function') {
          if (ref.current.contains(event.target)) {
            clickedInsideAnyDropdown = true;
          }
        }
      });
      
      // Check case search dropdowns
      caseDropdownRef.current.forEach((ref, idx) => {
        if (ref && typeof ref.contains === 'function') {
          if (ref.contains(event.target)) {
            clickedInsideAnyDropdown = true;
          } else {
            // Close this specific case dropdown if click is outside
            setShowCaseDropdown(prev => {
              const newDropdowns = [...prev];
              if (newDropdowns[idx]) {
                newDropdowns[idx] = false;
              }
              return newDropdowns;
            });
          }
        }
      });

      // Only close regular dropdowns if click was outside all of them
      if (!clickedInsideAnyDropdown) {
        setShowDropdowns(prev => {
          // Only close if there are open dropdowns
          const hasOpenDropdowns = Object.values(prev).some(v => v === true);
          if (hasOpenDropdowns) {
            return {};
          }
          return prev;
        });
      }
    };

    // Use a small delay to ensure dropdown clicks are processed first
    const timeoutId = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Dropdown component
  const Dropdown = ({ options, value, onChange, placeholder, dropdownKey, className = '' }) => {
    const ref = useRef(null);
    
    useEffect(() => {
      if (ref.current) {
        dropdownRefs.current[dropdownKey] = ref;
      }
      return () => {
        delete dropdownRefs.current[dropdownKey];
      };
    }, [dropdownKey]);

    return (
      <div className={`relative ${className}`} ref={ref}>
        <div 
          className="flex justify-between items-center self-stretch pr-4 rounded-lg border border-solid border-[#B0B8C5] cursor-pointer"
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            setShowDropdowns(prev => ({ ...prev, [dropdownKey]: !prev[dropdownKey] }));
          }}
          onMouseDown={(e) => {
            e.stopPropagation();
          }}
        >
          <input
            type="text"
            placeholder={placeholder}
            value={value}
            readOnly
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              setShowDropdowns(prev => ({ ...prev, [dropdownKey]: !prev[dropdownKey] }));
            }}
            onMouseDown={(e) => {
              e.stopPropagation();
            }}
            className="flex-1 self-stretch text-[#525866] bg-transparent text-sm py-3.5 pl-4 mr-1 border-0 outline-none cursor-pointer"
          />
          <img
            src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Iq8V0MifpP/ptcb79mu_expires_30_days.png"
            className="w-4 h-4 rounded-lg object-fill"
          />
        </div>
        {showDropdowns[dropdownKey] && (
          <div 
            className="absolute z-[10001] w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            style={{ minWidth: '100%' }}
          >
            {options && Array.isArray(options) && options.length > 0 ? (
              options.map((option, idx) => (
                <div
                  key={idx}
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    onChange(option);
                    setShowDropdowns(prev => ({ ...prev, [dropdownKey]: false }));
                  }}
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                  }}
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm text-[#040E1B] whitespace-nowrap"
                >
                  {String(option)}
                </div>
              ))
            ) : (
              <div className="px-4 py-2 text-sm text-gray-500">
                {options && Array.isArray(options) ? 'No options available' : 'Loading options...'}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  // Search cases for typeahead
  const searchCases = async (query, caseIdx) => {
    if (!query || query.trim().length < 2) {
      return;
    }

    // Clear previous timeout
    if (caseSearchTimeoutRef.current[caseIdx]) {
      clearTimeout(caseSearchTimeoutRef.current[caseIdx]);
    }

    // Show dropdown and loading state immediately
    const newDropdowns = [...showCaseDropdown];
    newDropdowns[caseIdx] = true;
    setShowCaseDropdown(newDropdowns);

    const newLoading = [...caseSearchLoading];
    newLoading[caseIdx] = true;
    setCaseSearchLoading(newLoading);

    // Debounce search by 300ms
    caseSearchTimeoutRef.current[caseIdx] = setTimeout(async () => {
      try {
        console.log(`[Case Search] Searching for: "${query}" at index ${caseIdx}`);
        const results = await apiGet(`/case-search/search?query=${encodeURIComponent(query)}&limit=10`);
        console.log('[Case Search] Raw API response:', results);
        
        // Handle different response formats
        let casesArray = [];
        if (results) {
          if (results.results && Array.isArray(results.results)) {
            casesArray = results.results;
          } else if (results.cases && Array.isArray(results.cases)) {
            casesArray = results.cases;
          } else if (Array.isArray(results)) {
            casesArray = results;
          }
        }
        
        const newResults = [...caseSearchResults];
        newResults[caseIdx] = casesArray;
        setCaseSearchResults(newResults);
        
        const newDropdowns = [...showCaseDropdown];
        newDropdowns[caseIdx] = true;
        setShowCaseDropdown(newDropdowns);
        
      } catch (err) {
        console.error('[Case Search] Error searching cases:', err);
        const newResults = [...caseSearchResults];
        newResults[caseIdx] = [];
        setCaseSearchResults(newResults);
        
        const newDropdowns = [...showCaseDropdown];
        newDropdowns[caseIdx] = true;
        setShowCaseDropdown(newDropdowns);
      } finally {
        const newLoading = [...caseSearchLoading];
        newLoading[caseIdx] = false;
        setCaseSearchLoading(newLoading);
      }
    }, 300);
  };

  // Handle case selection from dropdown
  const handleCaseSelect = (caseResult, caseIdx) => {
    const newCases = [...cases];
    newCases[caseIdx] = {
      ...newCases[caseIdx],
      case_id: caseResult.id,
      case_title: caseResult.title || caseResult.case_title || '',
      case_number: caseResult.suit_reference_number || caseResult.dl_citation_no || caseResult.case_number || ''
    };
    setCases(newCases);
    
    // Close dropdown
    const newDropdowns = [...showCaseDropdown];
    newDropdowns[caseIdx] = false;
    setShowCaseDropdown(newDropdowns);
    
    // Clear search results
    const newResults = [...caseSearchResults];
    newResults[caseIdx] = [];
    setCaseSearchResults(newResults);
  };

  // Handle logo upload
  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setSaveError('Logo file size must be less than 10MB');
        return;
      }
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle form submission
  const handleSubmit = async (saveAndAddAnother = false) => {
    try {
      setIsSaving(true);
      setSaveError(null);
      setSaveSuccess(false);

      // Validate required fields
      const validationErrors = [];
      
      // Company name is required
      if (!formData.name || !formData.name.trim()) {
        validationErrors.push('Company name is required');
      }
      
      // Validate email format if provided
      if (formData.email && formData.email.trim()) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
          validationErrors.push('Please enter a valid email address');
        }
      }
      
      // Validate phone number format if provided
      if (formData.phone && formData.phone.trim()) {
        const phoneRegex = /^[\d\s\-\+\(\)]+$/;
        if (!phoneRegex.test(formData.phone)) {
          validationErrors.push('Please enter a valid phone number');
        }
      }
      
      // Validate registration number format if provided (alphanumeric)
      if (formData.registration_number && formData.registration_number.trim()) {
        const regNumberRegex = /^[A-Z0-9\-\/]+$/i;
        if (!regNumberRegex.test(formData.registration_number)) {
          validationErrors.push('Registration number should contain only letters, numbers, hyphens, and slashes');
        }
      }
      
      // Validate TIN format if provided
      if (formData.tax_identification_number && formData.tax_identification_number.trim()) {
        const tinRegex = /^[A-Z0-9\-\s]+$/i;
        if (!tinRegex.test(formData.tax_identification_number)) {
          validationErrors.push('TIN should contain only letters, numbers, hyphens, and spaces');
        }
      }
      
      // Validate numeric fields
      if (formData.authorized_capital && formData.authorized_capital.trim()) {
        const capitalStr = formData.authorized_capital.replace(/,/g, '').trim();
        const capital = parseFloat(capitalStr);
        if (isNaN(capital) || capital < 0 || !isFinite(capital)) {
          validationErrors.push('Authorized capital must be a valid positive number');
        }
      }
      
      if (formData.annual_turnover && formData.annual_turnover.trim()) {
        const turnoverStr = formData.annual_turnover.replace(/,/g, '').trim();
        const turnover = parseFloat(turnoverStr);
        if (isNaN(turnover) || turnover < 0 || !isFinite(turnover)) {
          validationErrors.push('Annual turnover must be a valid positive number');
        }
      }
      
      if (formData.total_assets && formData.total_assets.trim()) {
        const assetsStr = formData.total_assets.replace(/,/g, '').trim();
        const assets = parseFloat(assetsStr);
        if (isNaN(assets) || assets < 0 || !isFinite(assets)) {
          validationErrors.push('Total assets must be a valid positive number');
        }
      }
      
      // Validate dates
      if (formData.date_of_incorporation) {
        const incorpDate = new Date(formData.date_of_incorporation);
        if (isNaN(incorpDate.getTime())) {
          validationErrors.push('Date of incorporation must be a valid date');
        } else {
          const today = new Date();
          today.setHours(23, 59, 59, 999); // Set to end of today
          if (incorpDate > today) {
            validationErrors.push('Date of incorporation cannot be in the future');
          }
        }
      }
      
      if (formData.financial_year_end) {
        const fyEndDate = new Date(formData.financial_year_end);
        if (isNaN(fyEndDate.getTime())) {
          validationErrors.push('Financial year end must be a valid date');
        }
      }
      
      // Validate auditor dates
      if (formData.auditor_start_date && formData.auditor_end_date) {
        const startDate = new Date(formData.auditor_start_date);
        const endDate = new Date(formData.auditor_end_date);
        if (isNaN(startDate.getTime())) {
          validationErrors.push('Auditor start date must be a valid date');
        } else if (isNaN(endDate.getTime())) {
          validationErrors.push('Auditor end date must be a valid date');
        } else if (endDate < startDate) {
          validationErrors.push('Auditor end date must be after start date');
        }
      }
      
      // Validate shareholders - if any field is filled, name should be required
      shareholders.forEach((sh, idx) => {
        const hasAnyData = sh.name || sh.type || sh.number_of_shares || sh.acquired_date || sh.ownership_percentage || sh.status;
        if (hasAnyData && !sh.name?.trim()) {
          validationErrors.push(`Shareholder ${idx + 1}: Name is required when other fields are filled`);
        }
        if (sh.number_of_shares && sh.number_of_shares.trim()) {
          const shares = parseInt(sh.number_of_shares, 10);
          if (isNaN(shares) || shares < 0 || !isFinite(shares)) {
            validationErrors.push(`Shareholder ${idx + 1}: Number of shares must be a valid positive whole number`);
          }
        }
        if (sh.ownership_percentage && sh.ownership_percentage.trim()) {
          const percentage = parseFloat(sh.ownership_percentage);
          if (isNaN(percentage) || percentage < 0 || percentage > 100 || !isFinite(percentage)) {
            validationErrors.push(`Shareholder ${idx + 1}: Ownership percentage must be between 0 and 100`);
          }
        }
      });
      
      // Validate employees - if any field is filled, name should be required
      employees.forEach((emp, idx) => {
        const hasAnyData = emp.name || emp.position || emp.department || emp.start_date || emp.end_date || emp.reason_for_leaving || emp.source;
        if (hasAnyData && !emp.name?.trim()) {
          validationErrors.push(`Employee ${idx + 1}: Name is required when other fields are filled`);
        }
        if (emp.start_date && emp.end_date) {
          const startDate = new Date(emp.start_date);
          const endDate = new Date(emp.end_date);
          if (isNaN(startDate.getTime())) {
            validationErrors.push(`Employee ${idx + 1}: Start date must be a valid date`);
          } else if (isNaN(endDate.getTime())) {
            validationErrors.push(`Employee ${idx + 1}: End date must be a valid date`);
          } else if (endDate < startDate) {
            validationErrors.push(`Employee ${idx + 1}: End date must be after start date`);
          }
        }
      });
      
      // Validate regulatory compliance - if any field is filled, body should be required
      regulatory.forEach((reg, idx) => {
        const hasAnyData = reg.body || reg.license_permit_number || reg.license_permit_type || reg.issue_date || reg.expiry_date || reg.status;
        if (hasAnyData && !reg.body?.trim()) {
          validationErrors.push(`Regulatory record ${idx + 1}: Regulatory body is required when other fields are filled`);
        }
        if (reg.issue_date && reg.expiry_date) {
          const issueDate = new Date(reg.issue_date);
          const expiryDate = new Date(reg.expiry_date);
          if (isNaN(issueDate.getTime())) {
            validationErrors.push(`Regulatory record ${idx + 1}: Issue date must be a valid date`);
          } else if (isNaN(expiryDate.getTime())) {
            validationErrors.push(`Regulatory record ${idx + 1}: Expiry date must be a valid date`);
          } else if (expiryDate < issueDate) {
            validationErrors.push(`Regulatory record ${idx + 1}: Expiry date must be after issue date`);
          }
        }
      });
      
      // Validate locations - if any field is filled, address should be required
      locations.forEach((loc, idx) => {
        const hasAnyData = loc.location_type || loc.address || loc.phone;
        if (hasAnyData && !loc.address?.trim()) {
          validationErrors.push(`Location ${idx + 1}: Address is required when other fields are filled`);
        }
      });
      
      // Validate cases - if case title is filled, should be selected from dropdown (have case_id)
      cases.forEach((caseItem, idx) => {
        if (caseItem.case_title && caseItem.case_title.trim() && !caseItem.case_id) {
          validationErrors.push(`Case ${idx + 1}: Please select a case from the dropdown list`);
        }
        if (caseItem.case_id && !caseItem.role_in_case) {
          validationErrors.push(`Case ${idx + 1}: Role in case is required when a case is selected`);
        }
      });
      
      // Validate linked companies - if any field is filled, company name should be required
      linkedCompanies.forEach((comp, idx) => {
        const hasAnyData = comp.company_name || comp.address || comp.relationship;
        if (hasAnyData && !comp.company_name?.trim()) {
          validationErrors.push(`Linked company ${idx + 1}: Company name is required when other fields are filled`);
        }
      });
      
      // Validate sources - if any field is filled, source should be required
      sources.forEach((source, idx) => {
        const hasAnyData = source.source || source.source_reference;
        if (hasAnyData && !source.source?.trim()) {
          validationErrors.push(`Source ${idx + 1}: Source type is required when source reference is filled`);
        }
      });
      
      // Show validation errors
      if (validationErrors.length > 0) {
        setSaveError(validationErrors.join('. '));
        setIsSaving(false);
        return;
      }

      // Prepare company data with proper type conversions and null handling
      const companyData = {
        name: formData.name.trim(),
        registration_number: formData.registration_number?.trim() || null,
        date_of_incorporation: formData.date_of_incorporation || null,
        company_type: formData.company_type || null,
        status: formData.status || 'Active',
        industry: formData.industry || null,
        address: formData.address?.trim() || null,
        tax_identification_number: formData.tax_identification_number?.trim() || null,
        logo_url: logoPreview || null,
        type_of_company: formData.company_type || null,
        // Convert numeric fields safely - handle empty strings and invalid values
        authorized_capital: (() => {
          if (!formData.authorized_capital || !formData.authorized_capital.trim()) return null;
          const val = parseFloat(formData.authorized_capital.replace(/,/g, ''));
          return isNaN(val) || !isFinite(val) ? null : val;
        })(),
        authorized_shares: (() => {
          if (!formData.authorized_capital || !formData.authorized_capital.trim()) return null;
          const val = parseInt(formData.authorized_capital.replace(/,/g, ''), 10);
          return isNaN(val) || !isFinite(val) ? null : val;
        })(),
        annual_revenue: (() => {
          if (!formData.annual_turnover || !formData.annual_turnover.trim()) return null;
          const val = parseFloat(formData.annual_turnover.replace(/,/g, ''));
          return isNaN(val) || !isFinite(val) ? null : val;
        })(),
        annual_turnover: (() => {
          if (!formData.annual_turnover || !formData.annual_turnover.trim()) return null;
          const val = parseFloat(formData.annual_turnover.replace(/,/g, ''));
          return isNaN(val) || !isFinite(val) ? null : val;
        })(),
        net_worth: (() => {
          if (!formData.total_assets || !formData.total_assets.trim()) return null;
          const val = parseFloat(formData.total_assets.replace(/,/g, ''));
          return isNaN(val) || !isFinite(val) ? null : val;
        })(),
        total_assets: (() => {
          if (!formData.total_assets || !formData.total_assets.trim()) return null;
          const val = parseFloat(formData.total_assets.replace(/,/g, ''));
          return isNaN(val) || !isFinite(val) ? null : val;
        })(),
        financial_year_end: formData.financial_year_end || null,
        is_active: formData.status === 'Active',
        // Convert arrays to JSON - filter out empty entries and clean data
        shareholders: shareholders
          .filter(sh => sh.name && sh.name.trim())
          .map(sh => ({
            name: sh.name.trim(),
            type: sh.type?.trim() || null,
            number_of_shares: sh.number_of_shares && sh.number_of_shares.trim() 
              ? (() => {
                  const val = parseInt(sh.number_of_shares, 10);
                  return isNaN(val) || !isFinite(val) ? null : val;
                })()
              : null,
            acquired_date: sh.acquired_date || null,
            ownership_percentage: sh.ownership_percentage && sh.ownership_percentage.trim()
              ? (() => {
                  const val = parseFloat(sh.ownership_percentage);
                  return isNaN(val) || !isFinite(val) ? null : val;
                })()
              : null,
            status: sh.status?.trim() || null
          })),
        key_personnel: employees
          .filter(emp => emp.name && emp.name.trim())
          .map(emp => ({
            name: emp.name.trim(),
            position: emp.position?.trim() || null,
            department: emp.department?.trim() || null,
            start_date: emp.start_date || null,
            end_date: emp.end_date || null,
            reason_for_leaving: emp.reason_for_leaving?.trim() || null,
            source: emp.source?.trim() || null
          })),
        auditor: formData.auditor_firm_name && formData.auditor_firm_name.trim() ? {
          firm_name: formData.auditor_firm_name.trim(),
          phone: formData.auditor_phone?.trim() || null,
          start_date: formData.auditor_start_date || null,
          end_date: formData.auditor_end_date || null
        } : null,
        other_linked_companies: linkedCompanies
          .filter(comp => comp.company_name && comp.company_name.trim())
          .map(comp => ({
            name: comp.company_name.trim(),
            address: comp.address?.trim() || null,
            relationship: comp.relationship?.trim() || null
          }))
      };

      console.log('[AddCompanyForm] Submitting company data:', companyData);

      // Save company
      let response;
      try {
        response = await apiPost('/admin/companies/', companyData);
        console.log('[AddCompanyForm] Company saved successfully:', response);
      } catch (apiError) {
        console.error('[AddCompanyForm] API Error:', apiError);
        // Try to extract meaningful error message
        let errorMessage = 'Failed to save company. Please try again.';
        
        // Handle different error formats
        if (apiError.response) {
          const errorData = apiError.response.data;
          if (errorData) {
            if (typeof errorData === 'string') {
              errorMessage = errorData;
            } else if (errorData.detail) {
              if (typeof errorData.detail === 'string') {
                errorMessage = errorData.detail;
              } else if (Array.isArray(errorData.detail)) {
                const errorMessages = errorData.detail.map(err => {
                  if (typeof err === 'string') return err;
                  if (err.msg) return `${err.loc?.join('. ') || 'Field'}: ${err.msg}`;
                  return JSON.stringify(err);
                });
                errorMessage = errorMessages.join('. ');
              } else {
                errorMessage = JSON.stringify(errorData.detail);
              }
            } else if (errorData.message) {
              errorMessage = errorData.message;
            } else {
              errorMessage = JSON.stringify(errorData);
            }
          } else if (apiError.response.statusText) {
            errorMessage = `${apiError.response.status} ${apiError.response.statusText}`;
          }
        } else if (apiError.message) {
          errorMessage = apiError.message;
        }
        
        throw new Error(errorMessage);
      }

      const companyId = response?.company_id || response?.id || response?.data?.company_id || response?.data?.id;
      
      if (!companyId) {
        console.error('[AddCompanyForm] No company ID in response:', response);
        throw new Error('Company was created but no ID was returned. Please refresh and try again.');
      }

      // Save related data if company was created
      if (companyId) {
        // Save locations
        const locationsToSave = locations.filter(loc => loc.address?.trim() || loc.location_type);
        for (const location of locationsToSave) {
          try {
            await apiPost('/admin/companies/locations/', {
              company_id: companyId,
              location_type: location.location_type?.trim() || null,
              address: location.address?.trim() || null,
              phone: location.phone?.trim() || null
            });
          } catch (err) {
            console.error('Error saving location:', err);
            // Don't throw - continue saving other data
          }
        }

        // Save regulatory compliance
        const regulatoryToSave = regulatory.filter(r => r.body?.trim() || r.license_permit_number?.trim());
        for (const reg of regulatoryToSave) {
          try {
            await apiPost('/admin/companies/regulatory/', {
              company_id: companyId,
              regulatory_body: reg.body?.trim() || null,
              license_permit_number: reg.license_permit_number?.trim() || null,
              license_permit_type: reg.license_permit_type?.trim() || null,
              issue_date: reg.issue_date || null,
              expiry_date: reg.expiry_date || null,
              status: reg.status || null
            });
          } catch (err) {
            console.error('Error saving regulatory:', err);
            // Don't throw - continue saving other data
          }
        }

        // Save case links
        const casesToSave = cases.filter(c => c.case_id || (c.case_number?.trim() || c.case_title?.trim()));
        for (const caseItem of casesToSave) {
          try {
            await apiPost('/admin/companies/case-links/', {
              company_id: companyId,
              case_id: caseItem.case_id || null,
              case_number: caseItem.case_number?.trim() || null,
              case_title: caseItem.case_title?.trim() || null,
              role_in_case: caseItem.role_in_case || null
            });
          } catch (err) {
            console.error('Error saving case link:', err);
            // Don't throw - continue saving other data
          }
        }

        // Save sources
        const sourcesToSave = sources.filter(s => s.source?.trim());
        for (const source of sourcesToSave) {
          try {
            await apiPost('/admin/companies/sources/', {
              company_id: companyId,
              source: source.source?.trim() || null,
              source_reference: source.source_reference?.trim() || null
            });
          } catch (err) {
            console.error('Error saving source:', err);
            // Don't throw - continue saving other data
          }
        }
      }

      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
        if (saveAndAddAnother) {
          // Reset form
          setFormData({
            name: '',
            registration_number: '',
            date_of_incorporation: '',
            company_type: '',
            status: 'Active',
            industry: industry?.name || '',
            address: '',
            tax_identification_number: '',
            logo_url: null,
            authorized_capital: '',
            annual_turnover: '',
            total_assets: '',
            financial_year_end: '',
            auditor_firm_name: '',
            auditor_phone: '',
            auditor_start_date: '',
            auditor_end_date: ''
          });
          setShareholders([{ name: '', type: '', number_of_shares: '', acquired_date: '', ownership_percentage: '', status: '' }]);
          setEmployees([{ name: '', position: '', department: '', start_date: '', end_date: '', reason_for_leaving: '', source: '' }]);
          setRegulatory([{ body: '', license_permit_number: '', license_permit_type: '', issue_date: '', expiry_date: '', status: '' }]);
          setLocations([{ location_type: '', address: '', phone: '' }]);
          setCases([{ case_id: null, case_number: '', case_title: '', role_in_case: '' }]);
          setCaseSearchResults([[]]);
          setShowCaseDropdown([false]);
          setCaseSearchLoading([false]);
          caseSearchTimeoutRef.current = [null];
          setLinkedCompanies([{ company_name: '', address: '', relationship: '' }]);
          setSources([{ source: '', source_reference: '' }]);
          setLogoFile(null);
          setLogoPreview(null);
        } else {
          onBack();
        }
      }, 2000);
    } catch (error) {
      console.error('[AddCompanyForm] Error saving company:', error);
      let errorMessage = 'Failed to save company. Please try again.';
      
      if (error.message) {
        errorMessage = error.message;
      } else if (error.response?.data) {
        if (typeof error.response.data === 'string') {
          errorMessage = error.response.data;
        } else if (error.response.data.detail) {
          if (typeof error.response.data.detail === 'string') {
            errorMessage = error.response.data.detail;
          } else if (Array.isArray(error.response.data.detail)) {
            errorMessage = error.response.data.detail.map(err => err.msg || JSON.stringify(err)).join('. ');
          }
        } else {
          errorMessage = JSON.stringify(error.response.data);
        }
      }
      
      setSaveError(errorMessage);
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-[#F7F8FA] min-h-screen pt-2">
      {/* Full Width Header */}
      <AdminHeader userInfo={userInfo} onNavigate={onNavigate} onLogout={onLogout} />

      {/* Main Form */}
      <div className="px-6">
        <div className="flex flex-col self-stretch bg-white py-4 px-3.5 gap-10 rounded-lg">
          <div className="flex flex-col items-start self-stretch gap-6">
            {/* Breadcrumb */}
            <div className="flex items-start">
              <span className="text-[#525866] text-xs mr-1.5">COMPANIES</span>
              <img
                src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Iq8V0MifpP/melqey2j_expires_30_days.png"
                className="w-4 h-4 mr-1 object-fill"
              />
              <span className="text-[#525866] text-xs mr-1.5">{industry?.name?.toUpperCase() || 'ENERGY'}</span>
              <img
                src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Iq8V0MifpP/zzckzi5t_expires_30_days.png"
                className="w-4 h-4 mr-1 object-fill"
              />
              <span className="text-[#070810] text-sm">Add new company</span>
            </div>

            {/* Logo Upload */}
            <div className="flex items-center gap-1">
              <button onClick={onBack} className="cursor-pointer hover:opacity-70">
                <img
                  src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Iq8V0MifpP/hqppli3h_expires_30_days.png"
                  className="w-4 h-4 object-fill"
                />
              </button>
              <div className="flex items-start w-[111px] gap-1">
                {logoPreview ? (
                  <img src={logoPreview} alt="Company logo" className="w-9 h-9 object-cover rounded" />
                ) : (
                  <img
                    src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Iq8V0MifpP/8b8sljdg_expires_30_days.png"
                    className="w-9 h-9 object-fill"
                  />
                )}
                <div className="flex flex-col items-start w-[71px] gap-0.5">
                  <label className="text-blue-500 text-base cursor-pointer hover:underline">
                    Add Logo
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                    />
                  </label>
                  <span className="text-[#868C98] text-xs mr-[18px]">10mb max</span>
                </div>
              </div>
            </div>

            {/* Success/Error Messages */}
            {saveSuccess && (
              <div className="w-full p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
                Company saved successfully!
              </div>
            )}
            {saveError && (
              <div className="w-full p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                <div className="font-bold mb-2">Please fix the following errors:</div>
                <ul className="list-disc list-inside space-y-1">
                  {saveError.split('. ').filter(err => err.trim()).map((error, idx) => (
                    <li key={idx} className="text-sm">{error}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Personal Information Section */}
            <div className="flex flex-col items-start self-stretch gap-3">
              <span className="text-[#868C98] text-xl">Company Information</span>
              <div className="flex flex-col self-stretch gap-3">
                <div className="flex items-start self-stretch gap-6">
                  <div className="flex flex-col items-start flex-1 gap-2">
                    <span className="text-[#040E1B] text-sm font-bold">
                      Legal name <span className="text-red-500">*</span>
                    </span>
                    <input
                      type="text"
                      placeholder="Name goes here"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className={`flex-1 self-stretch text-[#525866] bg-transparent text-sm py-3.5 px-4 rounded-lg border border-solid outline-none ${
                        saveError && !formData.name?.trim() ? 'border-red-500 bg-red-50' : 'border-[#B0B8C5]'
                      }`}
                    />
                    {saveError && !formData.name?.trim() && (
                      <span className="text-red-500 text-xs mt-1">Company name is required</span>
                    )}
                  </div>
                  <div className="flex flex-col items-start flex-1 gap-2">
                    <span className="text-[#040E1B] text-sm font-bold">Registration number</span>
                    <input
                      type="text"
                      placeholder="Enter here"
                      value={formData.registration_number}
                      onChange={(e) => setFormData({ ...formData, registration_number: e.target.value })}
                      className="self-stretch text-[#525866] bg-transparent text-sm py-3.5 px-4 rounded-lg border border-solid border-[#B0B8C5] outline-none"
                    />
                  </div>
                  <div className="flex flex-col items-start flex-1 gap-2">
                    <span className="text-[#040E1B] text-sm font-bold">Date of incorporation</span>
                    <input
                      type="date"
                      value={formData.date_of_incorporation}
                      onChange={(e) => setFormData({ ...formData, date_of_incorporation: e.target.value })}
                      className="flex-1 self-stretch text-[#525866] bg-transparent text-sm py-3.5 px-4 rounded-lg border border-solid border-[#B0B8C5] outline-none"
                    />
                  </div>
                </div>
                <div className="flex items-start self-stretch gap-6">
                  <div className="flex flex-col items-start flex-1 gap-2">
                    <span className="text-[#040E1B] text-sm font-bold">Company type</span>
                    <Dropdown
                      options={companyTypes}
                      value={formData.company_type}
                      onChange={(value) => setFormData({ ...formData, company_type: value })}
                      placeholder="Choose type"
                      dropdownKey="company_type"
                    />
                  </div>
                  <div className="flex flex-col items-start flex-1 gap-2">
                    <span className="text-[#040E1B] text-sm font-bold">Company status</span>
                    <Dropdown
                      options={companyStatuses}
                      value={formData.status}
                      onChange={(value) => setFormData({ ...formData, status: value })}
                      placeholder="Choose status"
                      dropdownKey="status"
                    />
                  </div>
                  <div className="flex flex-col items-start flex-1 gap-2">
                    <span className="text-[#040E1B] text-sm font-bold">Company sector</span>
                    <Dropdown
                      options={sectors}
                      value={formData.industry}
                      onChange={(value) => setFormData({ ...formData, industry: value })}
                      placeholder="Choose sector"
                      dropdownKey="sector"
                    />
                  </div>
                </div>
                <div className="flex items-start self-stretch gap-6">
                  <div className="flex flex-col items-start flex-1 gap-2">
                    <span className="text-[#040E1B] text-sm font-bold">Address</span>
                    <input
                      type="text"
                      placeholder="Enter here"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="self-stretch text-[#525866] bg-transparent text-sm py-3.5 px-4 rounded-lg border border-solid border-[#B0B8C5] outline-none"
                    />
                  </div>
                  <div className="flex flex-col items-start flex-1 gap-2">
                    <span className="text-[#040E1B] text-sm font-bold">TIN</span>
                    <input
                      type="text"
                      placeholder="Enter here"
                      value={formData.tax_identification_number}
                      onChange={(e) => {
                        const value = e.target.value;
                        // Only allow alphanumeric, hyphens, and spaces
                        if (!value || /^[A-Z0-9\-\s]*$/i.test(value)) {
                          setFormData({ ...formData, tax_identification_number: value });
                        }
                      }}
                      className="self-stretch text-[#525866] bg-transparent text-sm py-3.5 px-4 rounded-lg border border-solid border-[#B0B8C5] outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Shareholder Information Section */}
            <div className="flex flex-col self-stretch gap-3">
              <div className="flex justify-between items-center self-stretch">
                <span className="text-[#868C98] text-xl">Shareholder information</span>
                <span
                  onClick={() => setShareholders([...shareholders, { name: '', type: '', number_of_shares: '', acquired_date: '', ownership_percentage: '', status: '' }])}
                  className="text-[#F59E0B] text-xs font-bold cursor-pointer hover:underline"
                >
                  Add another Shareholder
                </span>
              </div>
              {shareholders.map((shareholder, idx) => (
                <div key={idx} className="flex flex-col self-stretch gap-3">
                  <div className="flex items-start self-stretch gap-6">
                    <div className="flex flex-col items-start flex-1 gap-2">
                      <span className="text-[#040E1B] text-sm font-bold">Name</span>
                      <input
                        type="text"
                        placeholder="Enter here"
                        value={shareholder.name}
                        onChange={(e) => {
                          const newShareholders = [...shareholders];
                          newShareholders[idx].name = e.target.value;
                          setShareholders(newShareholders);
                        }}
                        className="self-stretch text-[#525866] bg-transparent text-sm py-3.5 px-4 rounded-lg border border-solid border-[#B0B8C5] outline-none"
                      />
                    </div>
                    <div className="flex flex-col items-start flex-1 gap-2">
                      <span className="text-[#040E1B] text-sm font-bold">Type</span>
                      <Dropdown
                        options={shareholderTypes}
                        value={shareholder.type}
                        onChange={(value) => {
                          const newShareholders = [...shareholders];
                          newShareholders[idx].type = value;
                          setShareholders(newShareholders);
                        }}
                        placeholder="Choose type"
                        dropdownKey={`shareholder_type_${idx}`}
                      />
                    </div>
                    <div className="flex flex-col items-start flex-1 gap-2">
                      <span className="text-[#040E1B] text-sm font-bold">Number of shares</span>
                      <input
                        type="text"
                        placeholder="Enter here"
                        value={shareholder.number_of_shares}
                        onChange={(e) => {
                          const value = e.target.value;
                          // Only allow whole numbers (no decimals, no commas)
                          if (value === '' || /^\d+$/.test(value)) {
                            const newShareholders = [...shareholders];
                            newShareholders[idx].number_of_shares = value;
                            setShareholders(newShareholders);
                          }
                        }}
                        onKeyPress={(e) => {
                          // Prevent non-numeric characters
                          if (!/[0-9]/.test(e.key) && e.key !== 'Backspace' && e.key !== 'Delete' && e.key !== 'Tab') {
                            e.preventDefault();
                          }
                        }}
                        className="self-stretch text-[#525866] bg-transparent text-sm py-3.5 px-4 rounded-lg border border-solid border-[#B0B8C5] outline-none"
                      />
                    </div>
                  </div>
                  <div className="flex items-start self-stretch gap-6">
                    <div className="flex flex-col items-start flex-1 gap-2">
                      <span className="text-[#040E1B] text-sm font-bold">Acquired date</span>
                      <input
                        type="date"
                        value={shareholder.acquired_date}
                        onChange={(e) => {
                          const newShareholders = [...shareholders];
                          newShareholders[idx].acquired_date = e.target.value;
                          setShareholders(newShareholders);
                        }}
                        className="flex-1 self-stretch text-[#525866] bg-transparent text-sm py-3.5 px-4 rounded-lg border border-solid border-[#B0B8C5] outline-none"
                      />
                    </div>
                    <div className="flex flex-col items-start flex-1 gap-2">
                      <span className="text-[#040E1B] text-sm font-bold">Ownership percentage</span>
                      <input
                        type="text"
                        placeholder="Enter here (0-100)"
                        value={shareholder.ownership_percentage}
                        onChange={(e) => {
                          const value = e.target.value;
                          // Only allow numbers and one decimal point, max 100
                          if (value === '' || (/^\d*\.?\d*$/.test(value) && (value === '' || parseFloat(value) <= 100))) {
                            const newShareholders = [...shareholders];
                            newShareholders[idx].ownership_percentage = value;
                            setShareholders(newShareholders);
                          }
                        }}
                        onKeyPress={(e) => {
                          // Allow numbers, decimal point (only one), and control keys
                          if (!/[0-9.]/.test(e.key) && e.key !== 'Backspace' && e.key !== 'Delete' && e.key !== 'Tab') {
                            e.preventDefault();
                          }
                          // Prevent multiple decimal points
                          if (e.key === '.' && shareholder.ownership_percentage.includes('.')) {
                            e.preventDefault();
                          }
                        }}
                        className="self-stretch text-[#525866] bg-transparent text-sm py-3.5 px-4 rounded-lg border border-solid border-[#B0B8C5] outline-none"
                      />
                    </div>
                    <div className="flex flex-col items-start flex-1 gap-2">
                      <span className="text-[#040E1B] text-sm font-bold">Status</span>
                      <Dropdown
                        options={shareholderStatuses}
                        value={shareholder.status}
                        onChange={(value) => {
                          const newShareholders = [...shareholders];
                          newShareholders[idx].status = value;
                          setShareholders(newShareholders);
                        }}
                        placeholder="Choose status"
                        dropdownKey={`shareholder_status_${idx}`}
                      />
                    </div>
                    {shareholders.length > 1 && (
                      <button
                        onClick={() => setShareholders(shareholders.filter((_, i) => i !== idx))}
                        className="mt-8 text-red-500 hover:text-red-700"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Director & Employees Section */}
            <div className="flex flex-col self-stretch gap-3">
              <div className="flex justify-between items-center self-stretch">
                <span className="text-[#868C98] text-xl">Director & Employees</span>
                <span
                  onClick={() => setEmployees([...employees, { name: '', position: '', department: '', start_date: '', end_date: '', reason_for_leaving: '', source: '' }])}
                  className="text-[#F59E0B] text-xs font-bold cursor-pointer hover:underline"
                >
                  Add another employee
                </span>
              </div>
              {employees.map((employee, idx) => (
                <div key={idx} className="flex flex-col self-stretch gap-3">
                  <div className="flex items-start self-stretch gap-6">
                    <div className="flex flex-col items-start flex-1 gap-2">
                      <span className="text-[#040E1B] text-sm font-bold">Name</span>
                      <input
                        type="text"
                        placeholder="Enter here"
                        value={employee.name}
                        onChange={(e) => {
                          const newEmployees = [...employees];
                          newEmployees[idx].name = e.target.value;
                          setEmployees(newEmployees);
                        }}
                        className="self-stretch text-[#525866] bg-transparent text-sm py-3.5 px-4 rounded-lg border border-solid border-[#B0B8C5] outline-none"
                      />
                    </div>
                    <div className="flex flex-col items-start flex-1 gap-2">
                      <span className="text-[#040E1B] text-sm font-bold">Position/Job title</span>
                      <input
                        type="text"
                        placeholder="Enter here"
                        value={employee.position}
                        onChange={(e) => {
                          const newEmployees = [...employees];
                          newEmployees[idx].position = e.target.value;
                          setEmployees(newEmployees);
                        }}
                        className="self-stretch text-[#525866] bg-transparent text-sm py-3.5 px-4 rounded-lg border border-solid border-[#B0B8C5] outline-none"
                      />
                    </div>
                    <div className="flex flex-col items-start flex-1 gap-2">
                      <span className="text-[#040E1B] text-sm font-bold">Department</span>
                      <input
                        type="text"
                        placeholder="Enter here"
                        value={employee.department}
                        onChange={(e) => {
                          const newEmployees = [...employees];
                          newEmployees[idx].department = e.target.value;
                          setEmployees(newEmployees);
                        }}
                        className="self-stretch text-[#525866] bg-transparent text-sm py-3.5 px-4 rounded-lg border border-solid border-[#B0B8C5] outline-none"
                      />
                    </div>
                  </div>
                  <div className="flex items-start self-stretch gap-6">
                    <div className="flex items-center flex-1">
                      <div className="flex flex-col items-start flex-1 mr-2 gap-2">
                        <span className="text-[#040E1B] text-sm font-bold">Start date</span>
                        <input
                          type="date"
                          value={employee.start_date}
                          onChange={(e) => {
                            const newEmployees = [...employees];
                            newEmployees[idx].start_date = e.target.value;
                            setEmployees(newEmployees);
                          }}
                          className="flex-1 self-stretch text-[#525866] bg-transparent text-sm py-3.5 px-4 rounded-lg border border-solid border-[#B0B8C5] outline-none"
                        />
                      </div>
                      <span className="text-[#040E1B] text-sm font-bold mr-2.5 mt-8">-</span>
                      <div className="flex flex-col items-start flex-1 gap-2">
                        <span className="text-[#040E1B] text-sm font-bold">End date</span>
                        <input
                          type="date"
                          value={employee.end_date}
                          onChange={(e) => {
                            const newEmployees = [...employees];
                            newEmployees[idx].end_date = e.target.value;
                            setEmployees(newEmployees);
                          }}
                          className="flex-1 self-stretch text-[#525866] bg-transparent text-sm py-3.5 px-4 rounded-lg border border-solid border-[#B0B8C5] outline-none"
                        />
                      </div>
                    </div>
                    <div className="flex flex-col items-start flex-1 gap-2">
                      <span className="text-[#040E1B] text-sm font-bold">Reason for leaving</span>
                      <input
                        type="text"
                        placeholder="Enter here"
                        value={employee.reason_for_leaving}
                        onChange={(e) => {
                          const newEmployees = [...employees];
                          newEmployees[idx].reason_for_leaving = e.target.value;
                          setEmployees(newEmployees);
                        }}
                        className="self-stretch text-[#525866] bg-transparent text-sm py-3.5 px-4 rounded-lg border border-solid border-[#B0B8C5] outline-none"
                      />
                    </div>
                    <div className="flex flex-col items-start flex-1 gap-2">
                      <span className="text-[#040E1B] text-sm font-bold">Source</span>
                      <Dropdown
                        options={sourceTypes}
                        value={employee.source}
                        onChange={(value) => {
                          const newEmployees = [...employees];
                          newEmployees[idx].source = value;
                          setEmployees(newEmployees);
                        }}
                        placeholder="Choose source"
                        dropdownKey={`employee_source_${idx}`}
                      />
                    </div>
                    {employees.length > 1 && (
                      <button
                        onClick={() => setEmployees(employees.filter((_, i) => i !== idx))}
                        className="mt-8 text-red-500 hover:text-red-700"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Auditors Section */}
            <div className="flex flex-col self-stretch gap-3">
              <div className="flex justify-between items-center self-stretch">
                <span className="text-[#868C98] text-xl">Auditors</span>
              </div>
              <div className="flex items-start self-stretch gap-6">
                <div className="flex flex-col items-start flex-1 gap-2">
                  <span className="text-[#040E1B] text-sm font-bold">Firm Name</span>
                  <input
                    type="text"
                    placeholder="Enter here"
                    value={formData.auditor_firm_name}
                    onChange={(e) => setFormData({ ...formData, auditor_firm_name: e.target.value })}
                    className="self-stretch text-[#525866] bg-transparent text-sm py-3.5 px-4 rounded-lg border border-solid border-[#B0B8C5] outline-none"
                  />
                </div>
                <div className="flex flex-col items-start flex-1 gap-2">
                  <span className="text-[#040E1B] text-sm font-bold">Phone</span>
                  <div className="flex items-center self-stretch py-3.5 rounded-lg border border-solid border-[#B0B8C5]">
                    <img
                      src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Iq8V0MifpP/a256468p_expires_30_days.png"
                      className="w-6 h-4 ml-4 object-fill"
                    />
                      <input
                        type="text"
                        placeholder="+233"
                        value={formData.auditor_phone}
                        onChange={(e) => {
                          const value = e.target.value;
                          // Only allow digits, +, -, spaces, and parentheses
                          if (value === '' || /^[\d\s\-\+\(\)]+$/.test(value)) {
                            setFormData({ ...formData, auditor_phone: value });
                          }
                        }}
                        onKeyPress={(e) => {
                          // Allow digits, +, -, space, parentheses, and control keys
                          if (!/[\d\s\-\+\(\)]/.test(e.key) && e.key !== 'Backspace' && e.key !== 'Delete' && e.key !== 'Tab') {
                            e.preventDefault();
                          }
                        }}
                        className="flex-1 text-[#525866] bg-transparent text-sm px-2 outline-none"
                      />
                  </div>
                </div>
                <div className="flex items-center flex-1">
                  <div className="flex flex-col items-start flex-1 mr-2 gap-2">
                    <span className="text-[#040E1B] text-sm font-bold">Start date</span>
                    <input
                      type="date"
                      value={formData.auditor_start_date}
                      onChange={(e) => setFormData({ ...formData, auditor_start_date: e.target.value })}
                      className="flex-1 self-stretch text-[#525866] bg-transparent text-sm py-3.5 px-4 rounded-lg border border-solid border-[#B0B8C5] outline-none"
                    />
                  </div>
                  <span className="text-[#040E1B] text-sm font-bold mr-2.5 mt-8">-</span>
                  <div className="flex flex-col items-start flex-1 gap-2">
                    <span className="text-[#040E1B] text-sm font-bold">End date</span>
                    <input
                      type="date"
                      value={formData.auditor_end_date}
                      onChange={(e) => setFormData({ ...formData, auditor_end_date: e.target.value })}
                      className="flex-1 self-stretch text-[#525866] bg-transparent text-sm py-3.5 px-4 rounded-lg border border-solid border-[#B0B8C5] outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Finance Data Section */}
            <div className="flex flex-col self-stretch gap-3">
              <div className="flex justify-between items-center self-stretch">
                <span className="text-[#868C98] text-xl">Finance data</span>
              </div>
              <div className="flex items-start self-stretch gap-6">
                <div className="flex flex-col items-start flex-1 gap-2">
                  <span className="text-[#040E1B] text-sm font-bold">Authorised capital</span>
                  <div className="flex items-center self-stretch py-3.5 rounded-lg border border-solid border-[#B0B8C5]">
                    <span className="text-[#525866] text-sm font-bold ml-4 mr-0.5">GHS</span>
                      <input
                        type="text"
                        placeholder="Enter amount"
                        value={formData.authorized_capital}
                        onChange={(e) => {
                          const value = e.target.value;
                          // Only allow numbers, commas, and one decimal point
                          if (value === '' || /^[\d,]*\.?\d*$/.test(value)) {
                            setFormData({ ...formData, authorized_capital: value });
                          }
                        }}
                        onKeyPress={(e) => {
                          // Allow numbers, comma, decimal point, and control keys
                          if (!/[0-9,.]/.test(e.key) && e.key !== 'Backspace' && e.key !== 'Delete' && e.key !== 'Tab') {
                            e.preventDefault();
                          }
                          // Prevent multiple decimal points
                          if (e.key === '.' && formData.authorized_capital.includes('.')) {
                            e.preventDefault();
                          }
                        }}
                        className="flex-1 text-[#525866] bg-transparent text-sm px-2 outline-none"
                      />
                  </div>
                </div>
                <div className="flex flex-col items-start flex-1 gap-2">
                  <span className="text-[#040E1B] text-sm font-bold">Annual turnover</span>
                    <input
                      type="text"
                      placeholder="Enter here"
                      value={formData.annual_turnover}
                      onChange={(e) => {
                        const value = e.target.value;
                        // Only allow numbers, commas, and decimal point
                        if (!value || /^[\d,\.]+$/.test(value)) {
                          setFormData({ ...formData, annual_turnover: value });
                        }
                      }}
                      className="self-stretch text-[#525866] bg-transparent text-sm py-3.5 px-4 rounded-lg border border-solid border-[#B0B8C5] outline-none"
                    />
                </div>
                <div className="flex flex-col items-start flex-1 gap-2">
                  <span className="text-[#040E1B] text-sm font-bold">Total assets</span>
                    <input
                      type="text"
                      placeholder="Enter here"
                      value={formData.total_assets}
                      onChange={(e) => {
                        const value = e.target.value;
                        // Only allow numbers, commas, and one decimal point
                        if (value === '' || /^[\d,]*\.?\d*$/.test(value)) {
                          setFormData({ ...formData, total_assets: value });
                        }
                      }}
                      onKeyPress={(e) => {
                        // Allow numbers, comma, decimal point, and control keys
                        if (!/[0-9,.]/.test(e.key) && e.key !== 'Backspace' && e.key !== 'Delete' && e.key !== 'Tab') {
                          e.preventDefault();
                        }
                        // Prevent multiple decimal points
                        if (e.key === '.' && formData.total_assets.includes('.')) {
                          e.preventDefault();
                        }
                      }}
                      className="self-stretch text-[#525866] bg-transparent text-sm py-3.5 px-4 rounded-lg border border-solid border-[#B0B8C5] outline-none"
                    />
                </div>
                <div className="flex flex-col items-start flex-1 gap-2">
                  <span className="text-[#040E1B] text-sm font-bold">Financial year end</span>
                  <input
                    type="date"
                    value={formData.financial_year_end}
                    onChange={(e) => setFormData({ ...formData, financial_year_end: e.target.value })}
                    className="flex-1 self-stretch text-[#525866] bg-transparent text-sm py-3.5 px-4 rounded-lg border border-solid border-[#B0B8C5] outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Regulatory & Compliance Section */}
            <div className="flex flex-col self-stretch gap-3">
              <div className="flex justify-between items-center self-stretch">
                <span className="text-[#868C98] text-xl">Regulatory & Compliance</span>
                <span
                  onClick={() => setRegulatory([...regulatory, { body: '', license_permit_number: '', license_permit_type: '', issue_date: '', expiry_date: '', status: '' }])}
                  className="text-[#F59E0B] text-xs font-bold cursor-pointer hover:underline"
                >
                  Add another
                </span>
              </div>
              {regulatory.map((reg, idx) => (
                <div key={idx} className="flex flex-col self-stretch gap-3">
                  <div className="flex items-start self-stretch gap-6">
                    <div className="flex flex-col items-start flex-1 gap-2">
                      <span className="text-[#040E1B] text-sm font-bold">Body</span>
                      <input
                        type="text"
                        placeholder="Enter regulatory body"
                        value={reg.body}
                        onChange={(e) => {
                          const newRegulatory = [...regulatory];
                          newRegulatory[idx].body = e.target.value;
                          setRegulatory(newRegulatory);
                        }}
                        className="self-stretch text-[#525866] bg-transparent text-sm py-3.5 px-4 rounded-lg border border-solid border-[#B0B8C5] outline-none"
                      />
                    </div>
                    <div className="flex flex-col items-start flex-1 gap-2">
                      <span className="text-[#040E1B] text-sm font-bold">License/Permit number</span>
                      <input
                        type="text"
                        placeholder="Enter here"
                        value={reg.license_permit_number}
                        onChange={(e) => {
                          const newRegulatory = [...regulatory];
                          newRegulatory[idx].license_permit_number = e.target.value;
                          setRegulatory(newRegulatory);
                        }}
                        className="self-stretch text-[#525866] bg-transparent text-sm py-3.5 px-4 rounded-lg border border-solid border-[#B0B8C5] outline-none"
                      />
                    </div>
                    <div className="flex flex-col items-start flex-1 gap-2">
                      <span className="text-[#040E1B] text-sm font-bold">License/Permit type</span>
                      <input
                        type="text"
                        placeholder="Enter here"
                        value={reg.license_permit_type}
                        onChange={(e) => {
                          const newRegulatory = [...regulatory];
                          newRegulatory[idx].license_permit_type = e.target.value;
                          setRegulatory(newRegulatory);
                        }}
                        className="self-stretch text-[#525866] bg-transparent text-sm py-3.5 px-4 rounded-lg border border-solid border-[#B0B8C5] outline-none"
                      />
                    </div>
                  </div>
                  <div className="flex items-start self-stretch gap-6">
                    <div className="flex items-center flex-1">
                      <div className="flex flex-col items-start flex-1 mr-2 gap-2">
                        <span className="text-[#040E1B] text-sm font-bold">Issue date</span>
                        <input
                          type="date"
                          value={reg.issue_date}
                          onChange={(e) => {
                            const newRegulatory = [...regulatory];
                            newRegulatory[idx].issue_date = e.target.value;
                            setRegulatory(newRegulatory);
                          }}
                          className="flex-1 self-stretch text-[#525866] bg-transparent text-sm py-3.5 px-4 rounded-lg border border-solid border-[#B0B8C5] outline-none"
                        />
                      </div>
                      <span className="text-[#040E1B] text-sm font-bold mr-2.5 mt-8">-</span>
                      <div className="flex flex-col items-start flex-1 gap-2">
                        <span className="text-[#040E1B] text-sm font-bold">Expiry date</span>
                        <input
                          type="date"
                          value={reg.expiry_date}
                          onChange={(e) => {
                            const newRegulatory = [...regulatory];
                            newRegulatory[idx].expiry_date = e.target.value;
                            setRegulatory(newRegulatory);
                          }}
                          className="flex-1 self-stretch text-[#525866] bg-transparent text-sm py-3.5 px-4 rounded-lg border border-solid border-[#B0B8C5] outline-none"
                        />
                      </div>
                    </div>
                    <div className="flex flex-col items-start flex-1 gap-2">
                      <span className="text-[#040E1B] text-sm font-bold">Status</span>
                      <Dropdown
                        options={['Active', 'Expired', 'Suspended', 'Revoked']}
                        value={reg.status}
                        onChange={(value) => {
                          const newRegulatory = [...regulatory];
                          newRegulatory[idx].status = value;
                          setRegulatory(newRegulatory);
                        }}
                        placeholder="Choose status"
                        dropdownKey={`regulatory_status_${idx}`}
                      />
                    </div>
                    {regulatory.length > 1 && (
                      <button
                        onClick={() => setRegulatory(regulatory.filter((_, i) => i !== idx))}
                        className="mt-8 text-red-500 hover:text-red-700"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Additional Location Section */}
            <div className="flex flex-col self-stretch gap-3">
              <div className="flex justify-between items-center self-stretch">
                <span className="text-[#868C98] text-xl">Additional location</span>
                <span
                  onClick={() => setLocations([...locations, { location_type: '', address: '', phone: '' }])}
                  className="text-[#F59E0B] text-xs font-bold cursor-pointer hover:underline"
                >
                  Add another location
                </span>
              </div>
              {locations.map((location, idx) => (
                <div key={idx} className="flex items-start self-stretch gap-6">
                  <div className="flex flex-col items-start flex-1 gap-2">
                    <span className="text-[#040E1B] text-sm font-bold">Location type</span>
                    <Dropdown
                      options={locationTypes}
                      value={location.location_type}
                      onChange={(value) => {
                        const newLocations = [...locations];
                        newLocations[idx].location_type = value;
                        setLocations(newLocations);
                      }}
                      placeholder="Choose type"
                      dropdownKey={`location_type_${idx}`}
                    />
                  </div>
                  <div className="flex flex-col items-start flex-1 gap-2">
                    <span className="text-[#040E1B] text-sm font-bold">Address</span>
                    <input
                      type="text"
                      placeholder="Enter here"
                      value={location.address}
                      onChange={(e) => {
                        const newLocations = [...locations];
                        newLocations[idx].address = e.target.value;
                        setLocations(newLocations);
                      }}
                      className="self-stretch text-[#525866] bg-transparent text-sm py-3.5 px-4 rounded-lg border border-solid border-[#B0B8C5] outline-none"
                    />
                  </div>
                  <div className="flex flex-col items-start flex-1 gap-2">
                    <span className="text-[#040E1B] text-sm font-bold">Phone</span>
                    <div className="flex items-center self-stretch py-3.5 rounded-lg border border-solid border-[#B0B8C5]">
                      <span className="text-[#525866] text-sm ml-4">+233</span>
                      <input
                        type="text"
                        placeholder="Enter phone"
                        value={location.phone}
                        onChange={(e) => {
                          const value = e.target.value;
                          // Only allow digits, +, -, spaces, and parentheses
                          if (value === '' || /^[\d\s\-\+\(\)]+$/.test(value)) {
                            const newLocations = [...locations];
                            newLocations[idx].phone = value;
                            setLocations(newLocations);
                          }
                        }}
                        onKeyPress={(e) => {
                          // Allow digits, +, -, space, parentheses, and control keys
                          if (!/[\d\s\-\+\(\)]/.test(e.key) && e.key !== 'Backspace' && e.key !== 'Delete' && e.key !== 'Tab') {
                            e.preventDefault();
                          }
                        }}
                        className="flex-1 text-[#525866] bg-transparent text-sm px-2 outline-none"
                      />
                    </div>
                  </div>
                  {locations.length > 1 && (
                    <button
                      onClick={() => setLocations(locations.filter((_, i) => i !== idx))}
                      className="mt-8 text-red-500 hover:text-red-700"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Link to Case Section */}
            <div className="flex flex-col self-stretch gap-3">
              <div className="flex justify-between items-center self-stretch">
                <span className="text-[#868C98] text-xl">Link to case</span>
                <span className="text-[#F59E0B] text-xs font-bold cursor-pointer hover:underline">
                  Search existing case
                </span>
              </div>
              <div className="flex flex-col items-start self-stretch gap-3">
                {cases.map((caseItem, idx) => (
                  <div key={idx} className="flex items-start self-stretch gap-6">
                    <div className="flex flex-col items-start flex-1 gap-2">
                      <span className="text-[#040E1B] text-sm font-bold">Case number</span>
                      <input
                        type="text"
                        placeholder="Enter here"
                        value={caseItem.case_number}
                        onChange={(e) => {
                          const newCases = [...cases];
                          newCases[idx].case_number = e.target.value;
                          setCases(newCases);
                        }}
                        className="self-stretch text-[#525866] bg-transparent text-sm py-3.5 px-4 rounded-lg border border-solid border-[#B0B8C5] outline-none"
                      />
                    </div>
                    <div className="flex flex-col items-start flex-1 gap-2 relative" ref={el => caseDropdownRef.current[idx] = el}>
                      <span className="text-[#040E1B] text-sm font-bold">Case title</span>
                      <input
                        type="text"
                        placeholder="Search and select case from dropdown..."
                        value={caseItem.case_title}
                        onChange={(e) => {
                          const value = e.target.value;
                          const newCases = [...cases];
                          newCases[idx].case_title = value;
                          newCases[idx].case_id = null; // Clear selection when typing
                          newCases[idx].case_number = ''; // Clear auto-filled number
                          setCases(newCases);
                          
                          // Trigger search after 2 characters
                          if (value.length >= 2) {
                            searchCases(value, idx);
                          } else {
                            const newDropdowns = [...showCaseDropdown];
                            newDropdowns[idx] = false;
                            setShowCaseDropdown(newDropdowns);
                            const newResults = [...caseSearchResults];
                            newResults[idx] = [];
                            setCaseSearchResults(newResults);
                          }
                        }}
                        onFocus={() => {
                          // Show dropdown if there are existing results
                          if (caseSearchResults[idx] && caseSearchResults[idx].length > 0) {
                            const newDropdowns = [...showCaseDropdown];
                            newDropdowns[idx] = true;
                            setShowCaseDropdown(newDropdowns);
                          } else if (caseItem.case_title && caseItem.case_title.length >= 2) {
                            // Re-trigger search if we have text
                            searchCases(caseItem.case_title, idx);
                          }
                        }}
                        className={`self-stretch text-[#525866] bg-transparent text-sm py-3.5 px-4 rounded-lg border border-solid outline-none ${
                          caseItem.case_title && caseItem.case_title.trim() && !caseItem.case_id 
                            ? 'border-red-300 bg-red-50' 
                            : 'border-[#B0B8C5]'
                        }`}
                      />
                      {caseItem.case_title && caseItem.case_title.trim() && !caseItem.case_id && (
                        <span className="text-red-500 text-xs mt-1">
                          ⚠ Please select a case from the dropdown list
                        </span>
                      )}
                      {/* Case Search Dropdown */}
                      {showCaseDropdown[idx] && (
                        <div 
                          className="absolute z-[10001] w-full mt-1 bg-white border border-solid border-[#B0B8C5] rounded-lg shadow-lg max-h-60 overflow-y-auto"
                          style={{ top: '100%', left: 0 }}
                        >
                          {caseSearchLoading[idx] ? (
                            <div className="p-3 text-center text-sm text-[#868C98]">Searching...</div>
                          ) : caseSearchResults[idx] && caseSearchResults[idx].length > 0 ? (
                            caseSearchResults[idx].map((caseResult, resultIdx) => (
                              <div
                                key={resultIdx}
                                onClick={() => handleCaseSelect(caseResult, idx)}
                                className="p-3 hover:bg-[#F4F6F9] cursor-pointer border-b border-[#E5E8EC] last:border-b-0"
                              >
                                <div className="text-[#040E1B] text-sm font-medium mb-1">{caseResult.title || caseResult.case_title || 'Untitled Case'}</div>
                                <div className="flex gap-4 text-xs text-[#868C98]">
                                  {caseResult.dl_citation_no && (
                                    <span>Citation: {caseResult.dl_citation_no}</span>
                                  )}
                                  {caseResult.suit_reference_number && (
                                    <span>Suit No: {caseResult.suit_reference_number}</span>
                                  )}
                                  {caseResult.case_number && (
                                    <span>Case No: {caseResult.case_number}</span>
                                  )}
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="p-3 text-center text-sm text-[#868C98]">
                              {caseItem.case_title && caseItem.case_title.length >= 2 
                                ? 'No cases found. Try a different search term.' 
                                : 'Type at least 2 characters to search'}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col items-start flex-1 gap-2">
                      <span className="text-[#040E1B] text-sm font-bold">Role in case</span>
                      <Dropdown
                        options={caseRoles}
                        value={caseItem.role_in_case}
                        onChange={(value) => {
                          const newCases = [...cases];
                          newCases[idx].role_in_case = value;
                          setCases(newCases);
                        }}
                        placeholder="Choose role"
                        dropdownKey={`case_role_${idx}`}
                      />
                    </div>
                    {cases.length > 1 && (
                      <button
                        onClick={() => {
                          const newCases = cases.filter((_, i) => i !== idx);
                          setCases(newCases);
                          // Clean up search state for removed case
                          const newResults = caseSearchResults.filter((_, i) => i !== idx);
                          const newDropdowns = showCaseDropdown.filter((_, i) => i !== idx);
                          const newLoading = caseSearchLoading.filter((_, i) => i !== idx);
                          setCaseSearchResults(newResults);
                          setShowCaseDropdown(newDropdowns);
                          setCaseSearchLoading(newLoading);
                          // Clear timeout if exists
                          if (caseSearchTimeoutRef.current[idx]) {
                            clearTimeout(caseSearchTimeoutRef.current[idx]);
                          }
                          caseSearchTimeoutRef.current = caseSearchTimeoutRef.current.filter((_, i) => i !== idx);
                        }}
                        className="mt-8 text-red-500 hover:text-red-700"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                ))}
                <span
                  onClick={() => {
                    setCases([...cases, { case_id: null, case_number: '', case_title: '', role_in_case: '' }]);
                    setCaseSearchResults([...caseSearchResults, []]);
                    setShowCaseDropdown([...showCaseDropdown, false]);
                    setCaseSearchLoading([...caseSearchLoading, false]);
                    caseSearchTimeoutRef.current.push(null);
                  }}
                  className="text-[#F59E0B] text-xs font-bold cursor-pointer hover:underline"
                >
                  Add another case
                </span>
              </div>
            </div>

            {/* Link to Another Company Section */}
            <div className="flex flex-col self-stretch gap-3">
              <div className="flex justify-between items-center self-stretch">
                <span className="text-[#868C98] text-xl">Link to another company</span>
                <span className="text-[#F59E0B] text-xs font-bold cursor-pointer hover:underline">
                  Search existing company
                </span>
              </div>
              <div className="flex flex-col items-start self-stretch gap-3">
                {linkedCompanies.map((company, idx) => (
                  <div key={idx} className="flex items-start self-stretch gap-6">
                    <div className="flex flex-col items-start flex-1 gap-2">
                      <span className="text-[#040E1B] text-sm font-bold">Company name</span>
                      <input
                        type="text"
                        placeholder="Enter here"
                        value={company.company_name}
                        onChange={(e) => {
                          const newCompanies = [...linkedCompanies];
                          newCompanies[idx].company_name = e.target.value;
                          setLinkedCompanies(newCompanies);
                        }}
                        className="self-stretch text-[#525866] bg-transparent text-sm py-3.5 px-4 rounded-lg border border-solid border-[#B0B8C5] outline-none"
                      />
                    </div>
                    <div className="flex flex-col items-start flex-1 gap-2">
                      <span className="text-[#040E1B] text-sm font-bold">Address</span>
                      <input
                        type="text"
                        placeholder="Enter here"
                        value={company.address}
                        onChange={(e) => {
                          const newCompanies = [...linkedCompanies];
                          newCompanies[idx].address = e.target.value;
                          setLinkedCompanies(newCompanies);
                        }}
                        className="self-stretch text-[#525866] bg-transparent text-sm py-3.5 px-4 rounded-lg border border-solid border-[#B0B8C5] outline-none"
                      />
                    </div>
                    <div className="flex flex-col items-start flex-1 gap-2">
                      <span className="text-[#040E1B] text-sm font-bold">Relationship</span>
                      <Dropdown
                        options={relationships}
                        value={company.relationship}
                        onChange={(value) => {
                          const newCompanies = [...linkedCompanies];
                          newCompanies[idx].relationship = value;
                          setLinkedCompanies(newCompanies);
                        }}
                        placeholder="Choose relationship"
                        dropdownKey={`company_relationship_${idx}`}
                      />
                    </div>
                    {linkedCompanies.length > 1 && (
                      <button
                        onClick={() => setLinkedCompanies(linkedCompanies.filter((_, i) => i !== idx))}
                        className="mt-8 text-red-500 hover:text-red-700"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                ))}
                <span
                  onClick={() => setLinkedCompanies([...linkedCompanies, { company_name: '', address: '', relationship: '' }])}
                  className="text-[#F59E0B] text-xs font-bold cursor-pointer hover:underline"
                >
                  Add another company
                </span>
              </div>
            </div>

            {/* Source Section */}
            <div className="flex flex-col self-stretch gap-3">
              <div className="flex justify-between items-center self-stretch">
                <span className="text-[#868C98] text-xl">Source</span>
                <span
                  onClick={() => setSources([...sources, { source: '', source_reference: '' }])}
                  className="text-[#F59E0B] text-xs font-bold cursor-pointer hover:underline"
                >
                  Add another source
                </span>
              </div>
              {sources.map((source, idx) => (
                <div key={idx} className="flex items-start self-stretch gap-6">
                  <div className="flex flex-col items-start flex-1 gap-2">
                    <span className="text-[#040E1B] text-sm font-bold">Source</span>
                    <Dropdown
                      options={sourceTypes}
                      value={source.source}
                      onChange={(value) => {
                        const newSources = [...sources];
                        newSources[idx].source = value;
                        setSources(newSources);
                      }}
                      placeholder="Choose source"
                      dropdownKey={`source_type_${idx}`}
                    />
                  </div>
                  <div className="flex flex-col items-start flex-1 gap-2">
                    <span className="text-[#040E1B] text-sm font-bold">Source reference</span>
                    <input
                      type="text"
                      placeholder="Enter here"
                      value={source.source_reference}
                      onChange={(e) => {
                        const newSources = [...sources];
                        newSources[idx].source_reference = e.target.value;
                        setSources(newSources);
                      }}
                      className="self-stretch text-[#525866] bg-transparent text-sm py-3.5 px-4 rounded-lg border border-solid border-[#B0B8C5] outline-none"
                    />
                  </div>
                  {sources.length > 1 && (
                    <button
                      onClick={() => setSources(sources.filter((_, i) => i !== idx))}
                      className="mt-8 text-red-500 hover:text-red-700"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-start self-stretch gap-10">
            <button
              onClick={() => handleSubmit(true)}
              disabled={isSaving}
              className="flex flex-col items-center justify-center flex-1 py-[18px] rounded-lg border-2 border-solid border-transparent hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ boxShadow: '0px 4px 4px #050F1C1A' }}
            >
              <span className="text-[#022658] text-base font-bold">
                {isSaving ? 'Saving...' : 'Save & add another company'}
              </span>
            </button>
            <button
              onClick={() => handleSubmit(false)}
              disabled={isSaving}
              className="flex flex-col items-center justify-center flex-1 py-[18px] rounded-lg border-4 border-solid border-[#0F284726] hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: 'linear-gradient(180deg, #022658, #1A4983)' }}
            >
              <span className="text-white text-base font-bold">
                {isSaving ? 'Saving...' : 'Save company'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddCompanyForm;
