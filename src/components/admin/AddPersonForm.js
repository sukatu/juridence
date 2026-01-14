import React, { useState, useRef, useEffect } from 'react';
import { X, Calendar, ChevronDown, CheckCircle } from 'lucide-react';
import AdminHeader from './AdminHeader';
import { apiPost, apiGet } from '../../utils/api';

const AddPersonForm = ({ onClose, onSave, userInfo, onNavigate, onLogout, industry }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);
  const [formData, setFormData] = useState({
    name: '',
    dob: '',
    birthPlace: '',
    gender: '',
    phone: '+233',
    email: '',
    address: '',
    idNumber: ''
  });

  const [employments, setEmployments] = useState([{
    companyName: '',
    position: '',
    department: '',
    startDate: '',
    endDate: '',
    reasonForLeaving: '',
    source: ''
  }]);

  const [cases, setCases] = useState([{
    caseId: null,
    caseNumber: '',
    caseTitle: '',
    roleInCase: '',
    roleNumber: '' // For cases like "Plaintiff 1", "Defendant 2", etc.
  }]);
  
  // Case search state for typeahead (per case index)
  const [caseSearchResults, setCaseSearchResults] = useState([[]]); // Array of arrays, one per case
  const [showCaseDropdown, setShowCaseDropdown] = useState([false]); // Array of booleans, one per case
  const [caseSearchLoading, setCaseSearchLoading] = useState([false]); // Array of booleans
  const caseSearchTimeoutRef = useRef([null]); // Array of timeout refs
  const caseDropdownRef = useRef([null]); // Array of refs for dropdowns

  const [relatedPersons, setRelatedPersons] = useState([{
    relatedPersonId: null, // ID if person exists in DB
    personName: '',
    phone: '+233',
    relationship: ''
  }]);
  
  // Person search state for typeahead (per person index)
  const [personSearchResults, setPersonSearchResults] = useState([[]]); // Array of arrays, one per person
  const [showPersonDropdown, setShowPersonDropdown] = useState([false]); // Array of booleans, one per person
  const [personSearchLoading, setPersonSearchLoading] = useState([false]); // Array of booleans
  const personSearchTimeoutRef = useRef([null]); // Array of timeout refs
  const personDropdownRef = useRef([null]); // Array of refs for dropdowns

  // Company/Bank search state for typeahead (per employment index)
  const [companySearchQueries, setCompanySearchQueries] = useState(['']); // Array of search queries, one per employment
  const [companySearchResults, setCompanySearchResults] = useState([[]]); // Array of arrays, one per employment
  const [showCompanyDropdown, setShowCompanyDropdown] = useState([false]); // Array of booleans, one per employment
  const [companySearchLoading, setCompanySearchLoading] = useState([false]); // Array of booleans
  const companySearchTimeoutRef = useRef([null]); // Array of timeout refs
  const companyDropdownRef = useRef([null]); // Array of refs for dropdowns

  const handleAddEmployment = () => {
    setEmployments([...employments, {
      companyName: '',
      position: '',
      department: '',
      startDate: '',
      endDate: '',
      reasonForLeaving: '',
      source: ''
    }]);
    // Initialize company search state for new employment
    setCompanySearchQueries([...companySearchQueries, '']);
    setCompanySearchResults([...companySearchResults, []]);
    setShowCompanyDropdown([...showCompanyDropdown, false]);
    setCompanySearchLoading([...companySearchLoading, false]);
    companySearchTimeoutRef.current.push(null);
    companyDropdownRef.current.push(null);
  };

  const handleAddCase = () => {
    setCases([...cases, {
      caseId: null,
      caseNumber: '',
      caseTitle: '',
      roleInCase: '',
      roleNumber: ''
    }]);
    setShowCaseDropdown([...showCaseDropdown, false]);
    setCaseSearchLoading([...caseSearchLoading, false]);
    setCaseSearchResults([...caseSearchResults, []]);
    caseSearchTimeoutRef.current.push(null);
    caseDropdownRef.current.push(null);
  };

  const handleAddPerson = () => {
    setRelatedPersons([...relatedPersons, {
      relatedPersonId: null,
      personName: '',
      phone: '+233',
      relationship: ''
    }]);
    setShowPersonDropdown([...showPersonDropdown, false]);
    setPersonSearchLoading([...personSearchLoading, false]);
    setPersonSearchResults([...personSearchResults, []]);
    personSearchTimeoutRef.current.push(null);
    personDropdownRef.current.push(null);
  };

  // Reset form to initial state
  const resetForm = () => {
    setFormData({
      name: '',
      dob: '',
      birthPlace: '',
      gender: '',
      phone: '+233',
      email: '',
      address: '',
      idNumber: ''
    });
    setEmployments([{
      companyName: '',
      position: '',
      department: '',
      startDate: '',
      endDate: '',
      reasonForLeaving: '',
      source: ''
    }]);
    setCases([{ caseId: null, caseNumber: '', caseTitle: '', roleInCase: '', roleNumber: '' }]);
    setRelatedPersons([{ relatedPersonId: null, personName: '', phone: '+233', relationship: '' }]);
    setShowCaseDropdown([false]);
    setCaseSearchLoading([false]);
    setCaseSearchResults([[]]);
    caseSearchTimeoutRef.current = [null];
    caseDropdownRef.current = [null];
    setShowPersonDropdown([false]);
    setPersonSearchLoading([false]);
    setPersonSearchResults([[]]);
    personSearchTimeoutRef.current = [null];
    personDropdownRef.current = [null];
    setCompanySearchQueries(['']);
    setCompanySearchResults([[]]);
    setShowCompanyDropdown([false]);
    setCompanySearchLoading([false]);
    companySearchTimeoutRef.current = [null];
    companyDropdownRef.current = [null];
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setSuccess(false);
    setSuccessMessage('');
    setError(null);
    setIsSaving(false);
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
        // Use case-search endpoint (more comprehensive and works better)
        const results = await apiGet(`/case-search/search?query=${encodeURIComponent(query)}&limit=10`);
        console.log('[Case Search] Using /case-search/search endpoint');
        console.log('[Case Search] Raw API response:', results);
        console.log('[Case Search] Response type:', typeof results);
        console.log('[Case Search] Is array?', Array.isArray(results));
        
        // Handle different response formats
        let casesArray = [];
        if (results) {
          // Check for 'results' field (from /api/case-search/search) - this is the primary format
          if (results.results && Array.isArray(results.results)) {
            casesArray = results.results;
            console.log('[Case Search] Found cases in results.results:', casesArray.length);
          }
          // Check for 'cases' field (from /api/cases/search) - fallback
          else if (results.cases && Array.isArray(results.cases)) {
            casesArray = results.cases;
            console.log('[Case Search] Found cases in results.cases:', casesArray.length);
          }
          // If results is directly an array
          else if (Array.isArray(results)) {
            casesArray = results;
            console.log('[Case Search] Results is directly an array:', casesArray.length);
          } else {
            console.warn('[Case Search] Unexpected response format:', Object.keys(results));
            console.warn('[Case Search] Full response:', results);
          }
        }
        
        console.log('[Case Search] Final cases array:', casesArray);
        console.log('[Case Search] Cases array length:', casesArray.length);
        
        const newResults = [...caseSearchResults];
        newResults[caseIdx] = casesArray;
        setCaseSearchResults(newResults);
        
        // Always show dropdown if we have results or if we want to show "no results" message
        const newDropdowns = [...showCaseDropdown];
        newDropdowns[caseIdx] = true;
        setShowCaseDropdown(newDropdowns);
        
      } catch (err) {
        console.error('[Case Search] Error searching cases:', err);
        console.error('[Case Search] Error message:', err.message);
        console.error('[Case Search] Error stack:', err.stack);
        
        const newResults = [...caseSearchResults];
        newResults[caseIdx] = [];
        setCaseSearchResults(newResults);
        
        // Still show dropdown to display error message
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
  const handleCaseSelect = (selectedCase, caseIdx) => {
    console.log('[Case Select] Selected case object:', selectedCase);
    console.log('[Case Select] All case properties:', Object.keys(selectedCase));
    console.log('[Case Select] suit_reference_number:', selectedCase.suit_reference_number);
    console.log('[Case Select] suitReferenceNumber (camelCase):', selectedCase.suitReferenceNumber);
    
    // Try multiple possible field names for suite number
    const suiteNumber = selectedCase.suit_reference_number 
      || selectedCase.suitReferenceNumber 
      || selectedCase.suit_number
      || selectedCase.suitNumber
      || '';
    
    console.log('[Case Select] Resolved suite number:', suiteNumber);
    
    const newCases = [...cases];
    newCases[caseIdx] = {
      ...newCases[caseIdx],
      caseId: selectedCase.id,
      caseTitle: selectedCase.title || '',
      caseNumber: suiteNumber, // Auto-populate suite number from selected case
      roleInCase: newCases[caseIdx].roleInCase || '', // Preserve existing role
      roleNumber: newCases[caseIdx].roleNumber || '' // Preserve existing role number
    };
    setCases(newCases);
    
    console.log('[Case Select] Updated case data:', newCases[caseIdx]);
    console.log('[Case Select] caseNumber value:', newCases[caseIdx].caseNumber);
    
    const newDropdowns = [...showCaseDropdown];
    newDropdowns[caseIdx] = false;
    setShowCaseDropdown(newDropdowns);
    
    const newResults = [...caseSearchResults];
    newResults[caseIdx] = [];
    setCaseSearchResults(newResults);
  };

  // Search people for typeahead
  const searchPeople = async (query, personIdx) => {
    if (!query || query.trim().length < 2) {
      return;
    }

    // Clear previous timeout
    if (personSearchTimeoutRef.current[personIdx]) {
      clearTimeout(personSearchTimeoutRef.current[personIdx]);
    }

    // Show dropdown and loading state immediately
    const newDropdowns = [...showPersonDropdown];
    newDropdowns[personIdx] = true;
    setShowPersonDropdown(newDropdowns);

    const newLoading = [...personSearchLoading];
    newLoading[personIdx] = true;
    setPersonSearchLoading(newLoading);

    // Debounce search by 300ms
    personSearchTimeoutRef.current[personIdx] = setTimeout(async () => {
      try {
        console.log(`[Person Search] Searching for: "${query}" at index ${personIdx}`);
        const results = await apiGet(`/people/search?query=${encodeURIComponent(query)}&limit=10`);
        console.log('[Person Search] Raw API response:', results);
        
        // Handle response format - people endpoint returns { people: [...] }
        let peopleArray = [];
        if (results) {
          if (results.people && Array.isArray(results.people)) {
            peopleArray = results.people;
            console.log('[Person Search] Found people in results.people:', peopleArray.length);
          } else if (Array.isArray(results)) {
            peopleArray = results;
            console.log('[Person Search] Results is directly an array:', peopleArray.length);
          }
        }
        
        console.log('[Person Search] Final people array:', peopleArray);
        
        const newResults = [...personSearchResults];
        newResults[personIdx] = peopleArray;
        setPersonSearchResults(newResults);
        
        // Always show dropdown if we have results or if we want to show "no results" message
        const newDropdowns = [...showPersonDropdown];
        newDropdowns[personIdx] = true;
        setShowPersonDropdown(newDropdowns);
        
      } catch (err) {
        console.error('[Person Search] Error searching people:', err);
        const newResults = [...personSearchResults];
        newResults[personIdx] = [];
        setPersonSearchResults(newResults);
        const newDropdowns = [...showPersonDropdown];
        newDropdowns[personIdx] = true;
        setShowPersonDropdown(newDropdowns);
      } finally {
        const newLoading = [...personSearchLoading];
        newLoading[personIdx] = false;
        setPersonSearchLoading(newLoading);
      }
    }, 300);
  };

  // Handle person selection from dropdown
  const handlePersonSelect = (selectedPerson, personIdx) => {
    console.log('[Person Select] Selected person object:', selectedPerson);
    
    const newPersons = [...relatedPersons];
    newPersons[personIdx] = {
      ...newPersons[personIdx],
      relatedPersonId: selectedPerson.id, // Store the person ID
      personName: selectedPerson.full_name || selectedPerson.name || '',
      phone: selectedPerson.phone_number || newPersons[personIdx].phone || '+233', // Auto-populate phone if available
      relationship: newPersons[personIdx].relationship || '' // Preserve existing relationship
    };
    setRelatedPersons(newPersons);
    
    console.log('[Person Select] Updated person data:', newPersons[personIdx]);
    
    const newDropdowns = [...showPersonDropdown];
    newDropdowns[personIdx] = false;
    setShowPersonDropdown(newDropdowns);
    
    const newResults = [...personSearchResults];
    newResults[personIdx] = [];
    setPersonSearchResults(newResults);
  };

  // Search companies/banks for typeahead
  const searchCompanies = async (query, empIdx) => {
    if (!query || query.trim().length < 2) {
      const newResults = [...companySearchResults];
      newResults[empIdx] = [];
      setCompanySearchResults(newResults);
      const newDropdowns = [...showCompanyDropdown];
      newDropdowns[empIdx] = false;
      setShowCompanyDropdown(newDropdowns);
      return;
    }

    // Clear previous timeout
    if (companySearchTimeoutRef.current[empIdx]) {
      clearTimeout(companySearchTimeoutRef.current[empIdx]);
    }

    // Show dropdown and loading state immediately
    const newDropdowns = [...showCompanyDropdown];
    newDropdowns[empIdx] = true;
    setShowCompanyDropdown(newDropdowns);

    const newLoading = [...companySearchLoading];
    newLoading[empIdx] = true;
    setCompanySearchLoading(newLoading);

    // Debounce search by 300ms
    companySearchTimeoutRef.current[empIdx] = setTimeout(async () => {
      try {
        console.log(`[Company Search] Searching for: "${query}" at index ${empIdx}`);
        
        // Search both companies and banks in parallel
        let companiesResponse, banksResponse;
        try {
          companiesResponse = await apiGet(`/companies/search?query=${encodeURIComponent(query)}&limit=10&page=1`);
          console.log('[Company Search] Companies response:', companiesResponse);
        } catch (err) {
          console.error('[Company Search] Companies search error:', err);
          companiesResponse = { results: [] };
        }

        try {
          banksResponse = await apiGet(`/banks/search?query=${encodeURIComponent(query)}&limit=10&page=1`);
          console.log('[Company Search] Banks response:', banksResponse);
        } catch (err) {
          console.error('[Company Search] Banks search error:', err);
          banksResponse = { banks: [] };
        }

        // Combine results
        const companies = companiesResponse?.results || companiesResponse?.companies || companiesResponse?.data || (Array.isArray(companiesResponse) ? companiesResponse : []);
        const banks = banksResponse?.banks || banksResponse?.results || banksResponse?.data || (Array.isArray(banksResponse) ? banksResponse : []);
        
        console.log('[Company Search] Parsed companies:', companies);
        console.log('[Company Search] Parsed banks:', banks);

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

        console.log('[Company Search] Combined results:', combinedResults);
        
        const newResults = [...companySearchResults];
        newResults[empIdx] = combinedResults;
        setCompanySearchResults(newResults);
        
        // Always show dropdown if we have results or if we want to show "no results" message
        const newDropdowns = [...showCompanyDropdown];
        newDropdowns[empIdx] = true;
        setShowCompanyDropdown(newDropdowns);
        
      } catch (err) {
        console.error('[Company Search] Error searching companies/banks:', err);
        const newResults = [...companySearchResults];
        newResults[empIdx] = [];
        setCompanySearchResults(newResults);
        const newDropdowns = [...showCompanyDropdown];
        newDropdowns[empIdx] = true;
        setShowCompanyDropdown(newDropdowns);
      } finally {
        const newLoading = [...companySearchLoading];
        newLoading[empIdx] = false;
        setCompanySearchLoading(newLoading);
      }
    }, 300);
  };

  // Handle company/bank selection from dropdown
  const handleCompanySelect = (selectedEntity, empIdx) => {
    console.log('[Company Select] Selected entity:', selectedEntity);
    
    const newEmployments = [...employments];
    newEmployments[empIdx] = {
      ...newEmployments[empIdx],
      companyName: selectedEntity.name
    };
    setEmployments(newEmployments);
    
    // Update search query
    const newQueries = [...companySearchQueries];
    newQueries[empIdx] = selectedEntity.name;
    setCompanySearchQueries(newQueries);
    
    const newDropdowns = [...showCompanyDropdown];
    newDropdowns[empIdx] = false;
    setShowCompanyDropdown(newDropdowns);
    
    const newResults = [...companySearchResults];
    newResults[empIdx] = [];
    setCompanySearchResults(newResults);
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Handle case dropdowns
      caseDropdownRef.current.forEach((ref, idx) => {
        if (ref && !ref.contains(event.target)) {
          const input = ref?.querySelector('input');
          if (input && input.contains(event.target)) {
            return;
          }
          const newDropdowns = [...showCaseDropdown];
          newDropdowns[idx] = false;
          setShowCaseDropdown(newDropdowns);
        }
      });
      
      // Handle person dropdowns
      personDropdownRef.current.forEach((ref, idx) => {
        if (ref && !ref.contains(event.target)) {
          const input = ref?.querySelector('input');
          if (input && input.contains(event.target)) {
            return;
          }
          const newDropdowns = [...showPersonDropdown];
          newDropdowns[idx] = false;
          setShowPersonDropdown(newDropdowns);
        }
      });
      
      // Handle company dropdowns
      companyDropdownRef.current.forEach((ref, idx) => {
        if (ref && !ref.contains(event.target)) {
          const input = ref?.querySelector('input');
          if (input && input.contains(event.target)) {
            return;
          }
          const newDropdowns = [...showCompanyDropdown];
          newDropdowns[idx] = false;
          setShowCompanyDropdown(newDropdowns);
        }
      });
    };

    if (showCaseDropdown.some(show => show) || showPersonDropdown.some(show => show) || showCompanyDropdown.some(show => show)) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [showCaseDropdown, showPersonDropdown, showCompanyDropdown]);

  // Parse name into first_name, last_name, and full_name
  const parseName = (fullName) => {
    if (!fullName || !fullName.trim()) {
      return { first_name: '', last_name: '', full_name: '' };
    }
    
    const nameParts = fullName.trim().split(/\s+/);
    if (nameParts.length === 1) {
      return {
        first_name: nameParts[0],
        last_name: '',
        full_name: nameParts[0]
      };
    } else {
      return {
        first_name: nameParts[0],
        last_name: nameParts.slice(1).join(' '),
        full_name: fullName.trim()
      };
    }
  };

  // Parse date string to Date object
  const parseDate = (dateString) => {
    if (!dateString || !dateString.trim()) return null;
    
    // Try different date formats
    const formats = [
      /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/, // DD/MM/YYYY
      /^(\d{4})-(\d{1,2})-(\d{1,2})$/, // YYYY-MM-DD
      /^(\d{1,2})-(\d{1,2})-(\d{4})$/, // DD-MM-YYYY
    ];
    
    for (const format of formats) {
      const match = dateString.match(format);
      if (match) {
        if (format === formats[0] || format === formats[2]) {
          // DD/MM/YYYY or DD-MM-YYYY
          const day = parseInt(match[1], 10);
          const month = parseInt(match[2], 10) - 1;
          const year = parseInt(match[3], 10);
          return new Date(year, month, day);
        } else {
          // YYYY-MM-DD
          const year = parseInt(match[1], 10);
          const month = parseInt(match[2], 10) - 1;
          const day = parseInt(match[3], 10);
          return new Date(year, month, day);
        }
      }
    }
    
    // Try parsing as ISO string
    const parsed = new Date(dateString);
    if (!isNaN(parsed.getTime())) {
      return parsed;
    }
    
    return null;
  };

  // Prepare person data for API
  const preparePersonData = () => {
    const nameParts = parseName(formData.name);
    const dob = parseDate(formData.dob);
    
    // Extract city and region from address if possible
    let city = '';
    let region = '';
    if (formData.address) {
      // Try to extract city from address (basic parsing)
      const addressParts = formData.address.split(',');
      if (addressParts.length > 1) {
        city = addressParts[addressParts.length - 2]?.trim() || '';
        region = addressParts[addressParts.length - 1]?.trim() || '';
      } else {
        city = formData.address.trim();
      }
    }

    const personData = {
      first_name: nameParts.first_name || 'Unknown',
      last_name: nameParts.last_name || '',
      full_name: nameParts.full_name || formData.name || 'Unknown',
      date_of_birth: dob ? dob.toISOString() : null,
      place_of_birth: formData.birthPlace || null,
      gender: formData.gender && formData.gender.length <= 10 ? formData.gender : (formData.gender ? formData.gender.substring(0, 10) : null),
      phone_number: formData.phone && formData.phone !== '+233' ? formData.phone : null,
      email: formData.email || null,
      address: formData.address || null,
      city: city || null,
      region: region || null,
      country: 'Ghana',
      nationality: 'Ghanaian',
      id_number: formData.idNumber || null,
      status: 'active',
      is_verified: false,
      case_count: 0,
      search_count: 0,
      children_count: 0
    };

    // Add employment information if available (for backward compatibility)
    if (employments.length > 0 && employments[0].companyName) {
      const currentEmployment = employments[0];
      personData.employer = currentEmployment.companyName;
      personData.job_title = currentEmployment.position;
      personData.occupation = currentEmployment.position;
    }

    // Prepare employment history array
    const employmentHistory = employments
      .filter(emp => emp.companyName && emp.companyName.trim())
      .map(emp => {
        const employment = {
          company_name: emp.companyName,
          position: emp.position || '',
          department: emp.department || null,
          startDate: emp.startDate || null,
          endDate: emp.endDate || null,
          reasonForLeaving: emp.reasonForLeaving || null,
          source: emp.source || null,
          address: null
        };
        console.log('[Prepare Data] Employment:', employment);
        return employment;
      });

    // Prepare case links array
    // Only include cases that have been properly selected (have caseId) or have manual case_number
    const caseLinks = cases
      .filter(c => {
        // Must have caseId (selected from dropdown) OR have case_number (manual entry)
        // If caseTitle exists without caseId, it's invalid manual entry - exclude it
        if (c.caseTitle && c.caseTitle.trim() && !c.caseId && (!c.caseNumber || !c.caseNumber.trim())) {
          return false; // Invalid: has title but no caseId and no case_number
        }
        return c.caseId || (c.caseNumber && c.caseNumber.trim());
      })
      .map(c => {
        // Combine role and number (e.g., "Plaintiff 1", "Defendant 2")
        let roleInCase = c.roleInCase || 'Related Party';
        if (c.roleNumber && c.roleNumber.trim()) {
          roleInCase = `${roleInCase} ${c.roleNumber.trim()}`;
        }
        const caseLink = {
          case_id: c.caseId || null,
          case_number: c.caseNumber || null,
          case_title: c.caseTitle || null,
          role_in_case: roleInCase
        };
        console.log('[Prepare Data] Case link:', caseLink);
        return caseLink;
      });

    // Prepare relationships array
    const relationships = relatedPersons
      .filter(rp => rp.personName && rp.personName.trim())
      .map(rp => {
        const relationship = {
          related_person_id: rp.relatedPersonId || null, // ID if person exists in DB
          personName: rp.personName,
          relationship_type: rp.relationship || '',
          phone: rp.phone && rp.phone !== '+233' ? rp.phone : null
        };
        console.log('[Prepare Data] Relationship:', relationship);
        return relationship;
      });

    return {
      ...personData,
      employment_history: employmentHistory.length > 0 ? employmentHistory : undefined,
      case_links: caseLinks.length > 0 ? caseLinks : undefined,
      relationships: relationships.length > 0 ? relationships : undefined
    };
  };

  // Validation function
  const validateForm = () => {
    const errors = [];

    // Required fields
    if (!formData.name || !formData.name.trim()) {
      errors.push('Name is required');
    }

    // Phone number validation (if provided)
    if (formData.phone && formData.phone.trim() && formData.phone !== '+233') {
      // Remove country code and spaces for validation
      const phoneNumber = formData.phone.replace(/^\+233\s*/, '').replace(/\s+/g, '').replace(/-/g, '');
      // Should be digits only, 9-10 digits for Ghana numbers
      if (!/^[0-9]{9,10}$/.test(phoneNumber)) {
        errors.push('Phone number must be a valid Ghana number (9-10 digits after +233, digits only)');
      }
    } else if (formData.phone && formData.phone.trim() && formData.phone === '+233') {
      errors.push('Please enter a phone number after the country code');
    }

    // Email validation (if provided)
    if (formData.email && formData.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        errors.push('Please enter a valid email address');
      }
    }

    // Validate case links - case title can only be set by selecting from dropdown
    cases.forEach((caseItem, idx) => {
      // If case title exists but no caseId, it means user typed manually - not allowed
      if (caseItem.caseTitle && caseItem.caseTitle.trim() && !caseItem.caseId) {
        errors.push(`Case ${idx + 1}: Please select a case from the dropdown list. Manual entry is not allowed.`);
      }
      // If caseId exists, case title should match (validated selection)
      if (caseItem.caseId && !caseItem.caseTitle) {
        errors.push(`Case ${idx + 1}: Invalid case selection. Please select again from the dropdown.`);
      }
    });

    // Validate employment history - if company name is provided, position should be provided
    employments.forEach((emp, idx) => {
      if (emp.companyName && emp.companyName.trim() && !emp.position || !emp.position.trim()) {
        errors.push(`Employment ${idx + 1}: Position is required when company name is provided`);
      }
    });

    // Validate relationships - if person name is provided, relationship type should be provided
    relatedPersons.forEach((rel, idx) => {
      if (rel.personName && rel.personName.trim() && !rel.relationship || !rel.relationship.trim()) {
        errors.push(`Relationship ${idx + 1}: Relationship type is required when person name is provided`);
      }
    });

    return errors;
  };

  const handleSave = async () => {
    // Validate form
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      setError(validationErrors.join('. '));
      return;
    }

    try {
      setIsSaving(true);
      setError(null);
      setSuccess(false);
      
      const personData = preparePersonData();
      console.log('=== CREATING PERSON ===');
      console.log('Full person data:', JSON.stringify(personData, null, 2));
      console.log('Employment history count:', personData.employment_history?.length || 0);
      console.log('Case links count:', personData.case_links?.length || 0);
      console.log('Relationships count:', personData.relationships?.length || 0);
      
      // Call API to create person
      const response = await apiPost('/people/', personData);
      console.log('=== PERSON CREATED SUCCESSFULLY ===');
      console.log('Response:', response);
      console.log('Person ID:', response?.id);
      
      // Set success message with person details
      const personName = response?.full_name || formData.name || 'Person';
      setSuccessMessage(`Person "${personName}" has been created successfully!`);
      setSuccess(true);
      
      // Call the onSave callback if provided
      if (onSave) {
        await onSave({ ...formData, employments, cases, relatedPersons, createdPerson: response });
      }
      
      // Auto-dismiss success notification after 5 seconds
      setTimeout(() => {
        setSuccess(false);
        setSuccessMessage('');
      }, 5000);
      
      // Close form after a short delay
      setTimeout(() => {
        onClose();
      }, 2000);
      
    } catch (err) {
      console.error('Error creating person:', err);
      let errorMessage = err.message || err.detail || 'Failed to create person. Please try again.';
      
      // Handle authentication errors
      if (err.status === 401 || err.status === 403) {
        errorMessage = 'Your session has expired. Please log in again.';
      } else if (err.status === 404 && errorMessage.includes('not found')) {
        errorMessage = 'Authentication error. Please log out and log in again.';
      }
      
      setError(errorMessage);
      setIsSaving(false);
      setSuccess(false);
    }
  };

  const handleSaveAndAddAnother = async () => {
    // Validate form
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      setError(validationErrors.join('. '));
      return;
    }

    try {
      setIsSaving(true);
      setError(null);
      setSuccess(false);
      
      const personData = preparePersonData();
      console.log('=== CREATING PERSON ===');
      console.log('Full person data:', JSON.stringify(personData, null, 2));
      console.log('Employment history count:', personData.employment_history?.length || 0);
      console.log('Case links count:', personData.case_links?.length || 0);
      console.log('Relationships count:', personData.relationships?.length || 0);
      
      // Call API to create person
      const response = await apiPost('/people/', personData);
      console.log('=== PERSON CREATED SUCCESSFULLY ===');
      console.log('Response:', response);
      console.log('Person ID:', response?.id);
      
      setSuccess(true);
      
      // Call the onSave callback if provided
      if (onSave) {
        await onSave({ ...formData, employments, cases, relatedPersons, createdPerson: response });
      }
      
      // Reset form after a brief delay to show success message
      setTimeout(() => {
        resetForm();
      }, 1500);
      
    } catch (err) {
      console.error('Error creating person:', err);
      let errorMessage = err.message || err.detail || 'Failed to create person. Please try again.';
      
      // Handle authentication errors
      if (err.status === 401 || err.status === 403) {
        errorMessage = 'Your session has expired. Please log in again.';
      } else if (err.status === 404 && errorMessage.includes('not found')) {
        errorMessage = 'Authentication error. Please log out and log in again.';
      }
      
      setError(errorMessage);
      setIsSaving(false);
      setSuccess(false);
    }
  };

  return (
    <div className="bg-[#F7F8FA] min-h-screen">
      {/* Full Width Header - Same as Persons Page */}
      <AdminHeader userInfo={userInfo} onNavigate={onNavigate} onLogout={onLogout} />

      {/* Main Content - Same padding as Persons Page */}
      <div className="px-6">
        <div className="flex flex-col bg-white py-4 px-3.5 gap-10 rounded-lg">
          <div className="flex flex-col items-start self-stretch gap-4">
            {/* Breadcrumb */}
            <div className="flex items-start ml-3.5 gap-1">
              <span className="text-[#525866] text-xs mr-[7px]">PERSONS</span>
              <img src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Iq8V0MifpP/c3p15ar8_expires_30_days.png" className="w-4 h-4 mr-1 object-fill" />
              <span className="text-[#040E1B] text-xs">{industry?.name?.toUpperCase() || 'BANKING & FINANCE'}</span>
              <img src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Iq8V0MifpP/99ve7yss_expires_30_days.png" className="w-4 h-4 object-fill" />
              <span className="text-[#070810] text-sm">Add New Person</span>
            </div>

            {/* Image Upload */}
            <div className="flex items-center ml-3.5 gap-4">
              <button onClick={onClose} className="w-4 h-4">
                <svg viewBox="0 0 16 16">
                  <path d="M10 4L6 8L10 12" stroke="#050F1C" strokeWidth="1.5"/>
                </svg>
              </button>
              
              {/* Image Preview or Upload Button */}
              {imagePreview ? (
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img 
                      src={imagePreview} 
                      alt="Person preview" 
                      className="w-16 h-16 rounded-full object-cover border-2 border-[#D4E1EA]"
                    />
                    <button
                      onClick={() => {
                        setSelectedImage(null);
                        setImagePreview(null);
                        if (fileInputRef.current) {
                          fileInputRef.current.value = '';
                        }
                      }}
                      className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs hover:bg-red-600"
                      title="Remove image"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[#525866] text-sm">Image selected</span>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="text-blue-500 text-xs cursor-pointer hover:underline"
                    >
                      Change image
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-1">
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center border border-[#D4E1EA] cursor-pointer hover:bg-gray-200 transition-colors"
                  >
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <path d="M10 5V15M5 10H15" stroke="#868C98" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  </div>
                  <div className="flex flex-col items-start w-[79px] gap-0.5">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="text-blue-500 text-base cursor-pointer hover:underline"
                    >
                      Add image
                    </button>
                    <span className="text-[#868C98] text-xs">10mb max</span>
                  </div>
                </div>
              )}
              
              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    // Check file size (10MB max)
                    if (file.size > 10 * 1024 * 1024) {
                      setError('Image size must be less than 10MB');
                      return;
                    }
                    
                    // Check file type
                    if (!file.type.startsWith('image/')) {
                      setError('Please select a valid image file');
                      return;
                    }
                    
                    setSelectedImage(file);
                    
                    // Create preview
                    const reader = new FileReader();
                    reader.onloadend = () => {
                      setImagePreview(reader.result);
                    };
                    reader.readAsDataURL(file);
                    setError(null);
                  }
                }}
              />
            </div>

            {/* Personal Information */}
            <div className="flex flex-col items-start self-stretch ml-3.5 gap-2">
              <span className="text-[#868C98] text-xl">Personal Information</span>
              <div className="flex flex-col self-stretch gap-3">
                <div className="flex items-start self-stretch gap-6">
                  <div className="flex flex-col items-start flex-1 gap-2">
                    <span className="text-[#040E1B] text-sm font-bold">Name</span>
                    <div className="flex justify-between items-center self-stretch pr-4 rounded-lg border border-solid border-[#B0B8C5]">
                      <input
                        type="text"
                        placeholder="Name goes here"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="flex-1 text-[#525866] bg-transparent text-sm py-3.5 pl-4 mr-1 border-0 outline-none"
                      />
                      <svg width="16" height="16" viewBox="0 0 16 16">
                        <circle cx="8" cy="5" r="2.5" stroke="#868C98" fill="none"/>
                        <path d="M3 14C3 11.5 5 10 8 10C11 10 13 11.5 13 14" stroke="#868C98" fill="none"/>
                      </svg>
                    </div>
                  </div>
                  <div className="flex flex-col items-start flex-1 gap-2">
                    <span className="text-[#040E1B] text-sm font-bold">Date Of Birth</span>
                    <div className="flex justify-between items-center self-stretch pr-4 rounded-lg border border-solid border-[#B0B8C5]">
                      <input
                        type="date"
                        value={formData.dob}
                        onChange={(e) => setFormData({...formData, dob: e.target.value})}
                        className="flex-1 text-[#525866] bg-transparent text-sm py-3.5 pl-4 mr-1 border-0 outline-none"
                        max={new Date().toISOString().split('T')[0]}
                      />
                      <Calendar className="w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                  <div className="flex flex-col items-start flex-1 gap-2">
                    <span className="text-[#040E1B] text-sm font-bold">Place Of Birth</span>
                    <input
                      type="text"
                      placeholder="Enter here"
                      value={formData.birthPlace}
                      onChange={(e) => setFormData({...formData, birthPlace: e.target.value})}
                      className="self-stretch text-[#525866] bg-transparent text-sm py-3.5 px-4 rounded-lg border border-solid border-[#B0B8C5] outline-none"
                    />
                  </div>
                </div>

                <div className="flex items-start self-stretch gap-6">
                  <div className="flex flex-col items-start flex-1 gap-2">
                    <span className="text-[#040E1B] text-sm font-bold">Gender</span>
                    <div className="flex justify-between items-center self-stretch pr-4 rounded-lg border border-solid border-[#B0B8C5]">
                      <select
                        value={formData.gender}
                        onChange={(e) => setFormData({...formData, gender: e.target.value})}
                        className="flex-1 text-[#525866] bg-transparent text-sm py-3.5 pl-4 mr-1 border-0 outline-none appearance-none cursor-pointer"
                      >
                        <option value="">Choose gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                        <option value="Non-binary">Non-binary</option>
                      </select>
                      <ChevronDown className="w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                  <div className="flex flex-col items-start flex-1 gap-2">
                    <span className="text-[#040E1B] text-sm font-bold">Phone</span>
                    <div className="flex items-center self-stretch py-3.5 px-4 rounded-lg border border-solid border-[#B0B8C5]">
                      <span className="text-[#525866] text-sm">🇬🇭</span>
                      <ChevronDown className="w-4 h-4 text-gray-400 ml-1" />
                      <span className="text-[#022658] text-sm mx-2">|</span>
                      <input
                        type="text"
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        className="flex-1 text-[#525866] bg-transparent text-sm border-0 outline-none"
                      />
                    </div>
                  </div>
                  <div className="flex flex-col items-start flex-1 gap-2">
                    <span className="text-[#040E1B] text-sm font-bold">Email</span>
                    <div className="flex justify-between items-center self-stretch pr-4 rounded-lg border border-solid border-[#B0B8C5]">
                      <input
                        type="email"
                        placeholder="E-mail goes here"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        className="flex-1 text-[#525866] bg-transparent text-sm py-3.5 pl-4 mr-1 border-0 outline-none"
                      />
                      <svg width="16" height="16" viewBox="0 0 16 16">
                        <rect x="2" y="4" width="12" height="8" rx="1" stroke="#868C98" fill="none"/>
                        <path d="M2 5L8 9L14 5" stroke="#868C98" fill="none"/>
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="flex items-start self-stretch gap-6">
                  <div className="flex flex-col items-start flex-1 gap-2">
                    <span className="text-[#040E1B] text-sm font-bold">Address</span>
                    <input
                      type="text"
                      placeholder="Enter here"
                      value={formData.address}
                      onChange={(e) => setFormData({...formData, address: e.target.value})}
                      className="self-stretch text-[#525866] bg-transparent text-sm py-3.5 px-4 rounded-lg border border-solid border-[#B0B8C5] outline-none"
                    />
                  </div>
                  <div className="flex flex-col items-start flex-1 gap-2">
                    <span className="text-[#040E1B] text-sm font-bold">ID Number</span>
                    <input
                      type="text"
                      placeholder="Enter here"
                      value={formData.idNumber}
                      onChange={(e) => setFormData({...formData, idNumber: e.target.value})}
                      className="self-stretch text-[#525866] bg-transparent text-sm py-3.5 px-4 rounded-lg border border-solid border-[#B0B8C5] outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Employment Information */}
            <div className="flex flex-col self-stretch gap-2 ml-3.5">
              <div className="flex justify-between items-center self-stretch">
                <span className="text-[#868C98] text-xl">Employment Information</span>
                <button onClick={handleAddEmployment} className="text-[#F59E0B] text-xs font-bold cursor-pointer hover:underline">
                  Add another employment
                </button>
              </div>
              {employments.map((employment, empIdx) => (
                <div key={empIdx} className="flex flex-col self-stretch gap-3">
                  <div className="flex items-start self-stretch gap-6">
                    <div className="flex flex-col items-start flex-1 gap-2">
                      <span className="text-[#040E1B] text-sm font-bold">Company Name</span>
                      <div className="relative self-stretch" ref={el => companyDropdownRef.current[empIdx] = el}>
                        <input
                          type="text"
                          placeholder="Search company or bank (type at least 2 characters)"
                          value={companySearchQueries[empIdx] || employment.companyName}
                          onChange={(e) => {
                            const value = e.target.value;
                            const newQueries = [...companySearchQueries];
                            newQueries[empIdx] = value;
                            setCompanySearchQueries(newQueries);
                            
                            const newEmployments = [...employments];
                            newEmployments[empIdx].companyName = value;
                            setEmployments(newEmployments);
                            
                            // Trigger search
                            searchCompanies(value, empIdx);
                          }}
                          onFocus={() => {
                            if (companySearchResults[empIdx] && companySearchResults[empIdx].length > 0) {
                              const newDropdowns = [...showCompanyDropdown];
                              newDropdowns[empIdx] = true;
                              setShowCompanyDropdown(newDropdowns);
                            }
                          }}
                          className="w-full text-[#525866] bg-transparent text-sm py-3.5 px-4 rounded-lg border border-solid border-[#B0B8C5] outline-none"
                        />
                        {companySearchLoading[empIdx] && (
                          <div className="absolute right-3 top-3.5">
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#022658]"></div>
                          </div>
                        )}
                        {showCompanyDropdown[empIdx] && companySearchResults[empIdx] && companySearchResults[empIdx].length > 0 && (
                          <div className="absolute z-[10001] w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                            {companySearchResults[empIdx].map((entity) => (
                              <div
                                key={`${entity.type}-${entity.id}`}
                                onClick={() => handleCompanySelect(entity, empIdx)}
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
                        {showCompanyDropdown[empIdx] && !companySearchLoading[empIdx] && companySearchResults[empIdx] && companySearchResults[empIdx].length === 0 && companySearchQueries[empIdx] && companySearchQueries[empIdx].length >= 2 && (
                          <div className="absolute z-[10001] w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
                            <div className="px-4 py-2 text-sm text-gray-500">No companies or banks found</div>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-start flex-1 gap-2">
                      <span className="text-[#040E1B] text-sm font-bold">Position/Job Title</span>
                      <input
                        type="text"
                        placeholder="Enter here"
                        value={employment.position}
                        onChange={(e) => {
                          const newEmployments = [...employments];
                          newEmployments[empIdx].position = e.target.value;
                          setEmployments(newEmployments);
                        }}
                        className="self-stretch text-[#525866] bg-transparent text-sm py-3.5 px-4 rounded-lg border border-solid border-[#B0B8C5] outline-none"
                      />
                    </div>
                    <div className="flex flex-col items-start flex-1 gap-2">
                      <span className="text-[#040E1B] text-sm font-bold">Department</span>
                      <input
                        type="text"
                        placeholder="Enter here"
                        value={employment.department}
                        onChange={(e) => {
                          const newEmployments = [...employments];
                          newEmployments[empIdx].department = e.target.value;
                          setEmployments(newEmployments);
                        }}
                        className="self-stretch text-[#525866] bg-transparent text-sm py-3.5 px-4 rounded-lg border border-solid border-[#B0B8C5] outline-none"
                      />
                    </div>
                  </div>
                  <div className="flex items-start self-stretch gap-6">
                    <div className="flex items-center flex-1 gap-2">
                      <div className="flex flex-col items-start w-[167px] gap-2">
                        <span className="text-[#040E1B] text-sm font-bold">Start Date</span>
                        <div className="flex justify-between items-center self-stretch pr-4 rounded-lg border border-solid border-[#B0B8C5] relative">
                          <input
                            type="date"
                            value={employment.startDate}
                            onChange={(e) => {
                              const newEmployments = [...employments];
                              newEmployments[empIdx].startDate = e.target.value;
                              setEmployments(newEmployments);
                            }}
                            max={employment.endDate || new Date().toISOString().split('T')[0]}
                            className="flex-1 text-[#525866] bg-transparent text-sm py-3.5 pl-4 mr-1 border-0 outline-none"
                          />
                          <Calendar className="w-4 h-4 text-gray-400 pointer-events-none absolute right-3" />
                        </div>
                      </div>
                      <span className="text-[#040E1B] text-sm font-bold mt-8">-</span>
                      <div className="flex flex-col items-start w-[167px] gap-2">
                        <span className="text-[#040E1B] text-sm font-bold">End Date</span>
                        <div className="flex justify-between items-center self-stretch pr-4 rounded-lg border border-solid border-[#B0B8C5] relative">
                          <input
                            type="date"
                            value={employment.endDate}
                            onChange={(e) => {
                              const newEmployments = [...employments];
                              newEmployments[empIdx].endDate = e.target.value;
                              setEmployments(newEmployments);
                            }}
                            min={employment.startDate || undefined}
                            max={new Date().toISOString().split('T')[0]}
                            className="flex-1 text-[#525866] bg-transparent text-sm py-3.5 pl-4 mr-1 border-0 outline-none"
                          />
                          <Calendar className="w-4 h-4 text-gray-400 pointer-events-none absolute right-3" />
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-start flex-1 gap-2">
                      <span className="text-[#040E1B] text-sm font-bold">Reason For Leaving</span>
                      <input
                        type="text"
                        placeholder="Enter here"
                        value={employment.reasonForLeaving}
                        onChange={(e) => {
                          const newEmployments = [...employments];
                          newEmployments[empIdx].reasonForLeaving = e.target.value;
                          setEmployments(newEmployments);
                        }}
                        className="self-stretch text-[#525866] bg-transparent text-sm py-3.5 px-4 rounded-lg border border-solid border-[#B0B8C5] outline-none"
                      />
                    </div>
                    <div className="flex flex-col items-start flex-1 gap-2">
                      <span className="text-[#040E1B] text-sm font-bold">Source</span>
                      <div className="flex justify-between items-center self-stretch pr-4 rounded-lg border border-solid border-[#B0B8C5]">
                        <input
                          type="text"
                          placeholder="Choose source"
                          value={employment.source}
                          onChange={(e) => {
                            const newEmployments = [...employments];
                            newEmployments[empIdx].source = e.target.value;
                            setEmployments(newEmployments);
                          }}
                          className="flex-1 text-[#525866] bg-transparent text-sm py-3.5 pl-4 mr-1 border-0 outline-none"
                        />
                        <ChevronDown className="w-4 h-4 text-gray-400" />
                      </div>
                    </div>
                  </div>
                  {empIdx < employments.length - 1 && <div className="h-4"></div>}
                </div>
              ))}
            </div>

            {/* Link to Case */}
            <div className="flex flex-col self-stretch gap-2 ml-3.5">
              <div className="flex justify-between items-center self-stretch">
                <span className="text-[#868C98] text-xl">Link To Case</span>
                <span className="text-[#F59E0B] text-xs font-bold cursor-pointer hover:underline">
                  Search existing case
                </span>
              </div>
              {cases.map((caseItem, caseIdx) => (
                <div key={caseIdx} className="flex flex-col items-start self-stretch gap-3">
                  <div className="flex items-start self-stretch gap-6">
                    <div className="flex flex-col items-start flex-1 gap-2">
                      <div className="flex items-center justify-between w-full">
                        <span className="text-[#040E1B] text-sm font-bold">Suite Number</span>
                        {caseItem.caseId && (
                          <button
                            type="button"
                            onClick={() => {
                              const newCases = [...cases];
                              newCases[caseIdx] = {
                                ...newCases[caseIdx],
                                caseId: null,
                                caseTitle: '',
                                // Keep the caseNumber as it might have been auto-filled
                              };
                              setCases(newCases);
                            }}
                            className="text-[#F59E0B] text-xs font-bold cursor-pointer hover:underline"
                            title="Clear case selection to edit suite number manually"
                          >
                            Clear Case
                          </button>
                        )}
                      </div>
                      <input
                        type="text"
                        placeholder={caseItem.caseId && !caseItem.caseNumber ? "Auto-filled from selected case" : caseItem.caseId ? "" : "Enter here or select a case"}
                        value={caseItem.caseNumber || ''}
                        onChange={(e) => {
                          const newCases = [...cases];
                          newCases[caseIdx].caseNumber = e.target.value;
                          setCases(newCases);
                        }}
                        className={`self-stretch text-[#525866] bg-transparent text-sm py-3.5 px-4 rounded-lg border border-solid border-[#B0B8C5] outline-none ${caseItem.caseId ? 'bg-gray-50' : ''}`}
                        readOnly={!!caseItem.caseId} // Make read-only if case is selected from dropdown
                        title={caseItem.caseId ? "Suite number is auto-filled from the selected case. Click 'Clear Case' to edit manually." : ""}
                      />
                      {/* Debug info - remove in production */}
                      {process.env.NODE_ENV === 'development' && caseItem.caseId && (
                        <div className="text-xs text-gray-400 mt-1">
                          Debug: caseNumber="{caseItem.caseNumber}", caseId={caseItem.caseId}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col items-start flex-1 gap-2 relative" ref={el => caseDropdownRef.current[caseIdx] = el}>
                      <span className="text-[#040E1B] text-sm font-bold">Case Title</span>
                      <input
                        type="text"
                        placeholder="Search and select case from dropdown..."
                        value={caseItem.caseTitle}
                        onChange={(e) => {
                          const value = e.target.value;
                          const newCases = [...cases];
                          // Clear caseId and caseNumber when user types manually (not selecting from dropdown)
                          newCases[caseIdx].caseTitle = value;
                          newCases[caseIdx].caseId = null; // Clear selection when typing
                          newCases[caseIdx].caseNumber = ''; // Clear auto-filled number
                          setCases(newCases);
                          
                          // Trigger search after 2 characters
                          if (value.length >= 2) {
                            console.log(`[Case Title Input] Triggering search for: "${value}"`);
                            searchCases(value, caseIdx);
                          } else {
                            console.log(`[Case Title Input] Clearing dropdown (length: ${value.length})`);
                            const newDropdowns = [...showCaseDropdown];
                            newDropdowns[caseIdx] = false;
                            setShowCaseDropdown(newDropdowns);
                            const newResults = [...caseSearchResults];
                            newResults[caseIdx] = [];
                            setCaseSearchResults(newResults);
                          }
                        }}
                        onFocus={() => {
                          // Show dropdown if there are existing results
                          if (caseSearchResults[caseIdx] && caseSearchResults[caseIdx].length > 0) {
                            const newDropdowns = [...showCaseDropdown];
                            newDropdowns[caseIdx] = true;
                            setShowCaseDropdown(newDropdowns);
                          } else if (caseItem.caseTitle && caseItem.caseTitle.length >= 2) {
                            // Re-trigger search if we have text
                            searchCases(caseItem.caseTitle, caseIdx);
                          }
                        }}
                        className={`self-stretch text-[#525866] bg-transparent text-sm py-3.5 px-4 rounded-lg border border-solid outline-none ${
                          caseItem.caseTitle && caseItem.caseTitle.trim() && !caseItem.caseId 
                            ? 'border-red-300 bg-red-50' 
                            : 'border-[#B0B8C5]'
                        }`}
                      />
                      {caseItem.caseTitle && caseItem.caseTitle.trim() && !caseItem.caseId && (
                        <span className="text-red-500 text-xs mt-1">
                          ⚠ Please select a case from the dropdown list
                        </span>
                      )}
                      {/* Case Search Dropdown */}
                      {showCaseDropdown[caseIdx] && (
                        <div 
                          className="absolute z-[9999] w-full mt-1 bg-white border border-solid border-[#B0B8C5] rounded-lg shadow-lg max-h-60 overflow-y-auto"
                          style={{ top: '100%', left: 0 }}
                        >
                          {caseSearchLoading[caseIdx] ? (
                            <div className="p-3 text-center text-sm text-[#868C98]">Searching...</div>
                          ) : caseSearchResults[caseIdx] && caseSearchResults[caseIdx].length > 0 ? (
                            caseSearchResults[caseIdx].map((caseResult, idx) => (
                              <div
                                key={idx}
                                onClick={() => handleCaseSelect(caseResult, caseIdx)}
                                className="p-3 hover:bg-[#F4F6F9] cursor-pointer border-b border-[#E5E8EC] last:border-b-0"
                              >
                                <div className="text-[#040E1B] text-sm font-medium mb-1">{caseResult.title || 'Untitled Case'}</div>
                                <div className="flex gap-4 text-xs text-[#868C98]">
                                  {caseResult.dl_citation_no && (
                                    <span>Citation: {caseResult.dl_citation_no}</span>
                                  )}
                                  {caseResult.suit_reference_number && (
                                    <span>Suit No: {caseResult.suit_reference_number}</span>
                                  )}
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="p-3 text-center text-sm text-[#868C98]">
                              {caseItem.caseTitle && caseItem.caseTitle.length >= 2 
                                ? 'No cases found. Try a different search term.' 
                                : 'Type at least 2 characters to search'}
                            </div>
                          )}
                        </div>
                      )}
                      {/* Debug info - remove in production */}
                      {process.env.NODE_ENV === 'development' && (
                        <div className="text-xs text-gray-400 mt-1">
                          Debug: Dropdown={showCaseDropdown[caseIdx] ? 'show' : 'hide'}, 
                          Loading={caseSearchLoading[caseIdx] ? 'yes' : 'no'}, 
                          Results={caseSearchResults[caseIdx]?.length || 0}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col items-start flex-1 gap-2">
                      <span className="text-[#040E1B] text-sm font-bold">Role In Case</span>
                      <div className="flex items-center self-stretch gap-2">
                        <div className="flex-1 flex justify-between items-center pr-4 rounded-lg border border-solid border-[#B0B8C5]">
                          <select
                            value={caseItem.roleInCase}
                            onChange={(e) => {
                              const newCases = [...cases];
                              newCases[caseIdx].roleInCase = e.target.value;
                              setCases(newCases);
                            }}
                            className="flex-1 text-[#525866] bg-transparent text-sm py-3.5 pl-4 mr-1 border-0 outline-none appearance-none cursor-pointer"
                          >
                            <option value="">Choose role</option>
                            <option value="Plaintiff">Plaintiff</option>
                            <option value="Defendant">Defendant</option>
                            <option value="Petitioner">Petitioner</option>
                            <option value="Respondent">Respondent</option>
                            <option value="Appellant">Appellant</option>
                            <option value="Appellee">Appellee</option>
                            <option value="Applicant">Applicant</option>
                            <option value="Claimant">Claimant</option>
                            <option value="Counter-Claimant">Counter-Claimant</option>
                            <option value="Witness">Witness</option>
                            <option value="Interested Party">Interested Party</option>
                            <option value="Third Party">Third Party</option>
                            <option value="Amicus Curiae">Amicus Curiae</option>
                            <option value="Related Party">Related Party</option>
                            <option value="Other">Other</option>
                          </select>
                          <ChevronDown className="w-4 h-4 text-gray-400 pointer-events-none" />
                        </div>
                        {caseItem.roleInCase && (
                          <div className="w-20">
                            <input
                              type="number"
                              min="1"
                              placeholder="No."
                              value={caseItem.roleNumber}
                              onChange={(e) => {
                                const newCases = [...cases];
                                newCases[caseIdx].roleNumber = e.target.value;
                                setCases(newCases);
                              }}
                              className="w-full text-[#525866] bg-transparent text-sm py-3.5 px-3 rounded-lg border border-solid border-[#B0B8C5] outline-none"
                            />
                          </div>
                        )}
                      </div>
                      {caseItem.roleInCase && caseItem.roleNumber && (
                        <span className="text-[#868C98] text-xs mt-1">
                          Role: {caseItem.roleInCase} {caseItem.roleNumber}
                        </span>
                      )}
                    </div>
                  </div>
                  {caseIdx < cases.length - 1 && <div className="h-4"></div>}
                </div>
              ))}
              <button onClick={handleAddCase} className="text-[#F59E0B] text-xs font-bold cursor-pointer hover:underline self-start">
                Add another case
              </button>
            </div>

            {/* Link to Another Person */}
            <div className="flex flex-col self-stretch gap-2 ml-3.5">
              <div className="flex justify-between items-center self-stretch">
                <span className="text-[#868C98] text-xl">Link To Another Person</span>
                <span className="text-[#F59E0B] text-xs font-bold cursor-pointer hover:underline">
                  Search existing person
                </span>
              </div>
              {relatedPersons.map((relPerson, personIdx) => (
                <div key={personIdx} className="flex flex-col items-start self-stretch gap-3">
                  <div className="flex items-start self-stretch gap-6">
                    <div className="flex flex-col items-start flex-1 gap-2 relative" ref={el => personDropdownRef.current[personIdx] = el}>
                      <div className="flex items-center justify-between w-full">
                        <span className="text-[#040E1B] text-sm font-bold">Person Name</span>
                        {relPerson.relatedPersonId && (
                          <button
                            type="button"
                            onClick={() => {
                              const newPersons = [...relatedPersons];
                              newPersons[personIdx] = {
                                ...newPersons[personIdx],
                                relatedPersonId: null,
                                personName: '',
                                phone: '+233'
                              };
                              setRelatedPersons(newPersons);
                            }}
                            className="text-[#F59E0B] text-xs font-bold cursor-pointer hover:underline"
                            title="Clear person selection to enter manually"
                          >
                            Clear Person
                          </button>
                        )}
                      </div>
                      <input
                        type="text"
                        placeholder={relPerson.relatedPersonId ? "Selected from database" : "Search or enter person name"}
                        value={relPerson.personName}
                        onChange={(e) => {
                          const value = e.target.value;
                          const newPersons = [...relatedPersons];
                          newPersons[personIdx].personName = value;
                          // Clear relatedPersonId if user types manually
                          if (newPersons[personIdx].relatedPersonId) {
                            newPersons[personIdx].relatedPersonId = null;
                          }
                          setRelatedPersons(newPersons);
                          
                          // Trigger search after 2 characters
                          if (value.length >= 2) {
                            console.log(`[Person Name Input] Triggering search for: "${value}"`);
                            searchPeople(value, personIdx);
                          } else {
                            const newDropdowns = [...showPersonDropdown];
                            newDropdowns[personIdx] = false;
                            setShowPersonDropdown(newDropdowns);
                            const newResults = [...personSearchResults];
                            newResults[personIdx] = [];
                            setPersonSearchResults(newResults);
                          }
                        }}
                        onFocus={() => {
                          // Show dropdown if there are existing results
                          if (personSearchResults[personIdx] && personSearchResults[personIdx].length > 0) {
                            const newDropdowns = [...showPersonDropdown];
                            newDropdowns[personIdx] = true;
                            setShowPersonDropdown(newDropdowns);
                          } else if (relPerson.personName && relPerson.personName.length >= 2) {
                            // Re-trigger search if we have text
                            searchPeople(relPerson.personName, personIdx);
                          }
                        }}
                        className={`self-stretch text-[#525866] bg-transparent text-sm py-3.5 px-4 rounded-lg border border-solid border-[#B0B8C5] outline-none ${relPerson.relatedPersonId ? 'bg-gray-50' : ''}`}
                        readOnly={!!relPerson.relatedPersonId} // Make read-only if person is selected from dropdown
                        title={relPerson.relatedPersonId ? "Person is selected from database. Click 'Clear Person' to edit manually." : ""}
                      />
                      {/* Person Search Dropdown */}
                      {showPersonDropdown[personIdx] && (
                        <div 
                          className="absolute z-[9999] w-full mt-1 bg-white border border-solid border-[#B0B8C5] rounded-lg shadow-lg max-h-60 overflow-y-auto"
                          style={{ top: '100%', left: 0 }}
                        >
                          {personSearchLoading[personIdx] ? (
                            <div className="p-3 text-center text-sm text-[#868C98]">Searching...</div>
                          ) : personSearchResults[personIdx] && personSearchResults[personIdx].length > 0 ? (
                            personSearchResults[personIdx].map((personResult, idx) => (
                              <div
                                key={idx}
                                onClick={() => handlePersonSelect(personResult, personIdx)}
                                className="p-3 hover:bg-[#F4F6F9] cursor-pointer border-b border-[#E5E8EC] last:border-b-0"
                              >
                                <div className="text-[#040E1B] text-sm font-medium mb-1">{personResult.full_name || personResult.name || 'Unknown Person'}</div>
                                <div className="flex gap-4 text-xs text-[#868C98]">
                                  {personResult.phone_number && (
                                    <span>Phone: {personResult.phone_number}</span>
                                  )}
                                  {personResult.city && (
                                    <span>City: {personResult.city}</span>
                                  )}
                                  {personResult.region && (
                                    <span>Region: {personResult.region}</span>
                                  )}
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="p-3 text-center text-sm text-[#868C98]">
                              {relPerson.personName && relPerson.personName.length >= 2 
                                ? 'No people found. Try a different search term.' 
                                : 'Type at least 2 characters to search'}
                            </div>
                          )}
                        </div>
                      )}
                      {/* Debug info - remove in production */}
                      {process.env.NODE_ENV === 'development' && relPerson.relatedPersonId && (
                        <div className="text-xs text-gray-400 mt-1">
                          Debug: relatedPersonId={relPerson.relatedPersonId}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col items-start flex-1 gap-2">
                      <span className="text-[#040E1B] text-sm font-bold">Phone</span>
                      <div className="flex items-center self-stretch py-3.5 px-4 rounded-lg border border-solid border-[#B0B8C5]">
                        <span className="text-[#525866] text-sm">🇬🇭</span>
                        <ChevronDown className="w-4 h-4 text-gray-400 ml-1" />
                        <span className="text-[#022658] text-sm mx-2">|</span>
                        <input
                          type="text"
                          value={relPerson.phone}
                          onChange={(e) => {
                            const newPersons = [...relatedPersons];
                            newPersons[personIdx].phone = e.target.value;
                            setRelatedPersons(newPersons);
                          }}
                          className={`flex-1 text-[#525866] bg-transparent text-sm border-0 outline-none ${relPerson.relatedPersonId ? 'bg-gray-50' : ''}`}
                          readOnly={!!relPerson.relatedPersonId} // Make read-only if person is selected from dropdown
                          title={relPerson.relatedPersonId ? "Phone is auto-filled from selected person. Click 'Clear Person' to edit manually." : ""}
                        />
                      </div>
                    </div>
                    <div className="flex flex-col items-start flex-1 gap-2">
                      <span className="text-[#040E1B] text-sm font-bold">Relationship</span>
                      <div className="flex justify-between items-center self-stretch pr-4 rounded-lg border border-solid border-[#B0B8C5]">
                        <select
                          value={relPerson.relationship}
                          onChange={(e) => {
                            const newPersons = [...relatedPersons];
                            newPersons[personIdx].relationship = e.target.value;
                            setRelatedPersons(newPersons);
                          }}
                          className="flex-1 text-[#525866] bg-transparent text-sm py-3.5 pl-4 mr-1 border-0 outline-none appearance-none cursor-pointer"
                        >
                          <option value="">Choose relationship</option>
                          {/* Family Relationships */}
                          <optgroup label="Family">
                            <option value="Spouse">Spouse</option>
                            <option value="Wife">Wife</option>
                            <option value="Husband">Husband</option>
                            <option value="Son">Son</option>
                            <option value="Daughter">Daughter</option>
                            <option value="Father">Father</option>
                            <option value="Mother">Mother</option>
                            <option value="Brother">Brother</option>
                            <option value="Sister">Sister</option>
                            <option value="Uncle">Uncle</option>
                            <option value="Aunt">Aunt</option>
                            <option value="Nephew">Nephew</option>
                            <option value="Niece">Niece</option>
                            <option value="Cousin">Cousin</option>
                            <option value="Grandfather">Grandfather</option>
                            <option value="Grandmother">Grandmother</option>
                            <option value="Grandson">Grandson</option>
                            <option value="Granddaughter">Granddaughter</option>
                            <option value="Father-in-law">Father-in-law</option>
                            <option value="Mother-in-law">Mother-in-law</option>
                            <option value="Son-in-law">Son-in-law</option>
                            <option value="Daughter-in-law">Daughter-in-law</option>
                            <option value="Brother-in-law">Brother-in-law</option>
                            <option value="Sister-in-law">Sister-in-law</option>
                            <option value="Stepfather">Stepfather</option>
                            <option value="Stepmother">Stepmother</option>
                            <option value="Stepson">Stepson</option>
                            <option value="Stepdaughter">Stepdaughter</option>
                            <option value="Half-brother">Half-brother</option>
                            <option value="Half-sister">Half-sister</option>
                          </optgroup>
                          {/* Business/Professional Relationships */}
                          <optgroup label="Business & Professional">
                            <option value="Business Partner">Business Partner</option>
                            <option value="Partner">Partner</option>
                            <option value="Associate">Associate</option>
                            <option value="Colleague">Colleague</option>
                            <option value="Co-worker">Co-worker</option>
                            <option value="Employer">Employer</option>
                            <option value="Employee">Employee</option>
                            <option value="Supervisor">Supervisor</option>
                            <option value="Subordinate">Subordinate</option>
                            <option value="Client">Client</option>
                            <option value="Customer">Customer</option>
                            <option value="Vendor">Vendor</option>
                            <option value="Supplier">Supplier</option>
                            <option value="Contractor">Contractor</option>
                            <option value="Consultant">Consultant</option>
                            <option value="Advisor">Advisor</option>
                            <option value="Director">Director</option>
                            <option value="Shareholder">Shareholder</option>
                            <option value="Board Member">Board Member</option>
                          </optgroup>
                          {/* Legal Relationships */}
                          <optgroup label="Legal">
                            <option value="Co-defendant">Co-defendant</option>
                            <option value="Co-plaintiff">Co-plaintiff</option>
                            <option value="Witness">Witness</option>
                            <option value="Accomplice">Accomplice</option>
                            <option value="Co-accused">Co-accused</option>
                            <option value="Legal Representative">Legal Representative</option>
                            <option value="Power of Attorney">Power of Attorney</option>
                            <option value="Guardian">Guardian</option>
                            <option value="Ward">Ward</option>
                            <option value="Beneficiary">Beneficiary</option>
                            <option value="Executor">Executor</option>
                            <option value="Trustee">Trustee</option>
                          </optgroup>
                          {/* Financial Relationships */}
                          <optgroup label="Financial">
                            <option value="Creditor">Creditor</option>
                            <option value="Debtor">Debtor</option>
                            <option value="Guarantor">Guarantor</option>
                            <option value="Co-signer">Co-signer</option>
                            <option value="Joint Account Holder">Joint Account Holder</option>
                            <option value="Authorized Signatory">Authorized Signatory</option>
                            <option value="Financial Advisor">Financial Advisor</option>
                            <option value="Accountant">Accountant</option>
                            <option value="Auditor">Auditor</option>
                          </optgroup>
                          {/* Other Relationships */}
                          <optgroup label="Other">
                            <option value="Friend">Friend</option>
                            <option value="Acquaintance">Acquaintance</option>
                            <option value="Neighbor">Neighbor</option>
                            <option value="Roommate">Roommate</option>
                            <option value="Landlord">Landlord</option>
                            <option value="Tenant">Tenant</option>
                            <option value="Roommate">Roommate</option>
                            <option value="Former Spouse">Former Spouse</option>
                            <option value="Ex-partner">Ex-partner</option>
                            <option value="Other">Other</option>
                          </optgroup>
                        </select>
                        <ChevronDown className="w-4 h-4 text-gray-400 pointer-events-none" />
                      </div>
                    </div>
                  </div>
                  {personIdx < relatedPersons.length - 1 && <div className="h-4"></div>}
                </div>
              ))}
              <button onClick={handleAddPerson} className="text-[#F59E0B] text-xs font-bold cursor-pointer hover:underline self-start">
                Add another person
              </button>
            </div>
          </div>

          {/* Error/Success Messages */}
          {error && (
            <div className="ml-3.5 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <X className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-red-800 font-medium text-sm">Error</p>
                <p className="text-red-700 text-sm mt-1">{error}</p>
              </div>
              <button 
                onClick={() => setError(null)} 
                className="text-red-400 hover:text-red-600 flex-shrink-0"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}
          {success && (
            <div className="ml-3.5 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3 animate-fade-in">
              <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-green-800 font-medium text-sm">Success</p>
                <p className="text-green-700 text-sm mt-1">{successMessage || 'Person created successfully!'}</p>
              </div>
              <button 
                onClick={() => {
                  setSuccess(false);
                  setSuccessMessage('');
                }} 
                className="text-green-400 hover:text-green-600 flex-shrink-0"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}
          
          {/* Fixed Success Notification (Top Right) */}
          {success && (
            <div 
              className="fixed top-4 right-4 z-[9999] bg-green-500 text-white px-6 py-4 rounded-lg shadow-xl flex items-center gap-3 min-w-[300px] max-w-[500px]"
              style={{
                animation: 'slideInRight 0.3s ease-out',
              }}
            >
              <CheckCircle className="h-6 w-6 flex-shrink-0" />
              <div className="flex-1">
                <p className="font-bold text-base">Success!</p>
                <p className="text-sm mt-1">{successMessage || 'Person created successfully!'}</p>
              </div>
              <button 
                onClick={() => {
                  setSuccess(false);
                  setSuccessMessage('');
                }} 
                className="text-white hover:text-green-100 flex-shrink-0 transition-colors"
                aria-label="Close notification"
              >
                <X className="h-5 w-5" />
              </button>
              <style>{`
                @keyframes slideInRight {
                  from {
                    transform: translateX(100%);
                    opacity: 0;
                  }
                  to {
                    transform: translateX(0);
                    opacity: 1;
                  }
                }
              `}</style>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-start self-stretch gap-10 ml-3.5">
            <button
              onClick={handleSaveAndAddAnother}
              disabled={isSaving}
              className="flex items-center justify-center flex-1 py-[18px] rounded-lg border-2 border-transparent hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              style={{boxShadow: '0px 4px 4px #050F1C1A'}}
            >
              <span className="text-[#022658] text-base font-bold">
                {isSaving ? 'Saving...' : 'Save & add another person'}
              </span>
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center justify-center flex-1 py-[18px] rounded-lg border-4 border-solid border-[#0F284726] hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              style={{background: 'linear-gradient(180deg, #022658, #1A4983)'}}
            >
              <span className="text-white text-base font-bold">
                {isSaving ? 'Saving...' : 'Save person'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddPersonForm;
