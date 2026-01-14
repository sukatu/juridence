import React, { useState, useEffect, useRef } from 'react';
import { ChevronRight, ChevronDown, Upload, Plus, X, Search } from 'lucide-react';
import AdminHeader from './admin/AdminHeader';
import RegistrarHeader from './RegistrarHeader';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { apiGet } from '../utils/api';

const AddNewCaseForm = ({ onBack, onSave, userInfo, onNavigate, onLogout, isRegistrar, initialData, isEditMode }) => {
  // Format date for input field
  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toISOString().split('T')[0];
    } catch {
      return '';
    }
  };

  // Quill editor configuration
  const quillModules = {
    toolbar: [
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'indent': '-1'}, { 'indent': '+1' }],
      [{ 'align': [] }],
      ['link', 'image'],
      ['clean']
    ],
  };

  const quillFormats = [
    'header', 'bold', 'italic', 'underline', 'strike',
    'color', 'background', 'list', 'bullet', 'indent',
    'align', 'link', 'image'
  ];

  const [formData, setFormData] = useState({
    title: '',
    suit_reference_number: '',
    date: '',
    year: '',
    case_summary: '',
    status: '',
    protagonist: '',
    antagonist: '',
    citation: '',
    court_type: '',
    region: '',
    area_of_law: '',
    summernote: '',
    files: null
  });

  // Lawyers state - array of {id, name, role}
  const [lawyers, setLawyers] = useState([]);
  const [lawyerSearchQuery, setLawyerSearchQuery] = useState('');
  const [lawyerSearchResults, setLawyerSearchResults] = useState([]);
  const [showLawyerDropdown, setShowLawyerDropdown] = useState(false);
  const [newLawyerRole, setNewLawyerRole] = useState('defendant'); // 'defendant' or 'appellant'
  const lawyerDropdownRef = useRef(null);

  // Presiding Judges state - array of judge objects {id, name}
  const [presidingJudges, setPresidingJudges] = useState([]);
  const [judgeSearchQuery, setJudgeSearchQuery] = useState('');
  const [judgeSearchResults, setJudgeSearchResults] = useState([]);
  const [showJudgeDropdown, setShowJudgeDropdown] = useState(false);
  const judgeDropdownRef = useRef(null);

  // Initialize form data when initialData is provided
  useEffect(() => {
    if (initialData && isEditMode) {
      console.log('Initializing form with data:', initialData);
      console.log('Case summary value:', initialData.case_summary);
      setFormData({
        title: initialData.title || '',
        suit_reference_number: initialData.suit_reference_number || '',
        date: formatDateForInput(initialData.date),
        year: initialData.year || (initialData.date ? new Date(initialData.date).getFullYear().toString() : ''),
        case_summary: initialData.case_summary || initialData.summary || '',
        status: initialData.status || '',
        protagonist: initialData.protagonist || '',
        antagonist: initialData.antagonist || '',
        citation: initialData.citation || '',
        court_type: initialData.court_type || '',
        region: initialData.region || '',
        area_of_law: initialData.area_of_law || '',
        summernote: initialData.summernote || '',
        files: null
      });
      
      // Load existing person links if case ID is available
      if (initialData.id) {
        const loadPersonLinks = async () => {
          try {
            // Fetch person links for this case
            const response = await apiGet(`/api/people/case/${initialData.id}/person-links`);
            if (response && Array.isArray(response)) {
              const links = response.map(link => ({
                personId: link.person_id,
                personName: link.person_full_name || link.person?.full_name || link.person_name || '',
                relationshipToCase: link.role_in_case || ''
              }));
              setLinkedPersons(links.length > 0 ? links : [{
                personId: null,
                personName: '',
                relationshipToCase: ''
              }]);
            }
          } catch (err) {
            console.error('Error loading person links:', err);
            // If endpoint doesn't exist yet, just initialize empty
            setLinkedPersons([{
              personId: null,
              personName: '',
              relationshipToCase: ''
            }]);
          }
        };
        loadPersonLinks();
      } else {
        // Initialize empty if not editing
        setLinkedPersons([{
          personId: null,
          personName: '',
          relationshipToCase: ''
        }]);
      }
      
      // Parse presiding judges from initialData
      if (initialData.presiding_judge) {
        try {
          // Try to parse as JSON first
          const parsed = JSON.parse(initialData.presiding_judge);
          if (Array.isArray(parsed)) {
            setPresidingJudges(parsed);
          } else {
            // If it's a string, treat as comma-separated
            const judgeList = initialData.presiding_judge.split(',').map(name => name.trim()).filter(name => name);
            setPresidingJudges(judgeList);
          }
        } catch {
          // If not JSON, treat as comma-separated string
          const judgeList = initialData.presiding_judge.split(',').map(name => name.trim()).filter(name => name);
          setPresidingJudges(judgeList);
        }
      } else {
        setPresidingJudges([]);
      }
      
      // Parse lawyers from initialData
      if (initialData.lawyers) {
        try {
          // Try to parse as JSON first
          const parsed = JSON.parse(initialData.lawyers);
          if (Array.isArray(parsed)) {
            // If array of objects or strings, normalize
            const lawyerList = parsed.map(lawyer => {
              if (typeof lawyer === 'string') {
                return { id: null, name: lawyer, role: 'defendant' };
              }
              return {
                id: lawyer.id || null,
                name: lawyer.name || lawyer,
                role: lawyer.role || 'defendant'
              };
            });
            setLawyers(lawyerList);
          } else {
            // If it's a string, try to parse as comma-separated
            const lawyerList = initialData.lawyers.split(',').map(name => ({
              id: null,
              name: name.trim(),
              role: 'defendant' // Default role
            })).filter(lawyer => lawyer.name);
            setLawyers(lawyerList);
          }
        } catch {
          // If not JSON, treat as comma-separated string
          const lawyerList = initialData.lawyers.split(',').map(name => ({
            id: null,
            name: name.trim(),
            role: 'defendant' // Default role
          })).filter(lawyer => lawyer.name);
          setLawyers(lawyerList);
        }
      } else {
        setLawyers([]);
      }
      
      console.log('Form data set, case_summary:', initialData.case_summary || initialData.summary || '');
    } else if (!isEditMode) {
      // Reset form for new case
      setFormData({
        title: '',
        suit_reference_number: '',
        date: '',
        year: '',
        case_summary: '',
        status: '',
        protagonist: '',
        antagonist: '',
        citation: '',
        court_type: '',
        region: '',
        area_of_law: '',
        summernote: '',
        files: null
      });
      setPresidingJudges([]);
      setJudgeSearchQuery('');
      setJudgeSearchResults([]);
      setLawyers([]);
      setLawyerSearchQuery('');
      setLawyerSearchResults([]);
      setNewLawyerRole('defendant');
    }
  }, [initialData, isEditMode]);

  const [linkedCases, setLinkedCases] = useState([{
    caseNumber: '',
    caseTitle: '',
    relationToCase: ''
  }]);

  const [linkedPersons, setLinkedPersons] = useState([{
    personId: null,
    personName: '',
    relationshipToCase: ''
  }]);
  
  // Person search state for each linked person
  const [personSearchQueries, setPersonSearchQueries] = useState({});
  const [personSearchResults, setPersonSearchResults] = useState({});
  const [showPersonDropdowns, setShowPersonDropdowns] = useState({});
  const personDropdownRefs = useRef({});
  
  // Validation state
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
    
    // Mark field as touched
    setTouched(prev => ({ ...prev, [field]: true }));
  };
  
  // Validation function
  const validateForm = () => {
    const newErrors = {};
    
    // Required fields
    if (!formData.title || formData.title.trim() === '') {
      newErrors.title = 'Case title is required';
    }
    
    if (!formData.suit_reference_number || formData.suit_reference_number.trim() === '') {
      newErrors.suit_reference_number = 'Suit/Reference number is required';
    }
    
    if (!formData.date) {
      newErrors.date = 'Date filed is required';
    } else {
      // Validate date is not in the future
      const selectedDate = new Date(formData.date);
      const today = new Date();
      today.setHours(23, 59, 59, 999);
      if (selectedDate > today) {
        newErrors.date = 'Date filed cannot be in the future';
      }
    }
    
    if (!formData.court_type) {
      newErrors.court_type = 'Court type is required';
    }
    
    if (!formData.status) {
      newErrors.status = 'Status is required';
    }
    
    // Validate year format (4 digits)
    if (formData.year && formData.year.trim() !== '') {
      const yearRegex = /^\d{4}$/;
      if (!yearRegex.test(formData.year)) {
        newErrors.year = 'Year must be 4 digits (e.g., 2024)';
      } else {
        const yearNum = parseInt(formData.year);
        const currentYear = new Date().getFullYear();
        if (yearNum < 1900 || yearNum > currentYear + 1) {
          newErrors.year = `Year must be between 1900 and ${currentYear + 1}`;
        }
      }
    }
    
    // At least one party (protagonist or antagonist) should be provided
    if (!formData.protagonist || formData.protagonist.trim() === '') {
      if (!formData.antagonist || formData.antagonist.trim() === '') {
        newErrors.parties = 'At least one party (Plaintiff or Defendant) is required';
      }
    }
    
    // Validate region if provided
    if (formData.region && formData.region.trim() !== '') {
      const validRegions = [
        'Greater Accra Region', 'Ashanti Region', 'Western Region', 'Western North Region',
        'Eastern Region', 'Central Region', 'Northern Region', 'Volta Region',
        'Upper East Region', 'Upper West Region', 'Bono Region', 'Ahafo Region',
        'Bono East Region', 'Oti Region', 'Savannah Region', 'North East Region'
      ];
      if (!validRegions.includes(formData.region)) {
        newErrors.region = 'Please select a valid region';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLinkedCaseChange = (index, field, value) => {
    const updated = [...linkedCases];
    updated[index][field] = value;
    setLinkedCases(updated);
  };

  const handleLinkedPersonChange = (index, field, value) => {
    const updated = [...linkedPersons];
    updated[index][field] = value;
    setLinkedPersons(updated);
  };

  const addLinkedCase = () => {
    setLinkedCases([...linkedCases, {
      caseNumber: '',
      caseTitle: '',
      relationToCase: ''
    }]);
  };

  const addLinkedPerson = () => {
    const newIndex = linkedPersons.length;
    setLinkedPersons([...linkedPersons, {
      personId: null,
      personName: '',
      relationshipToCase: ''
    }]);
    setPersonSearchQueries(prev => ({ ...prev, [newIndex]: '' }));
    setPersonSearchResults(prev => ({ ...prev, [newIndex]: [] }));
    setShowPersonDropdowns(prev => ({ ...prev, [newIndex]: false }));
  };
  
  // Search for people
  useEffect(() => {
    const searchPeople = async (index, query) => {
      if (!query || query.trim().length < 2) {
        setPersonSearchResults(prev => ({ ...prev, [index]: [] }));
        return;
      }

      try {
        const params = new URLSearchParams({
          query: query.trim(),
          limit: '10',
          page: '1'
        });
        const response = await apiGet(`/people/search?${params.toString()}`);
        if (response && response.people) {
          setPersonSearchResults(prev => ({ ...prev, [index]: response.people }));
          setShowPersonDropdowns(prev => ({ ...prev, [index]: true }));
        } else {
          setPersonSearchResults(prev => ({ ...prev, [index]: [] }));
        }
      } catch (err) {
        console.error('Error searching people:', err);
        setPersonSearchResults(prev => ({ ...prev, [index]: [] }));
      }
    };

    // Create debounce timers for each search query
    const timers = {};
    Object.keys(personSearchQueries).forEach(index => {
      const query = personSearchQueries[index];
      if (timers[index]) {
        clearTimeout(timers[index]);
      }
      timers[index] = setTimeout(() => searchPeople(index, query), 300);
    });

    // Cleanup function
    return () => {
      Object.values(timers).forEach(timer => clearTimeout(timer));
    };
  }, [personSearchQueries]);
  
  // Handle click outside for person dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      Object.keys(personDropdownRefs.current).forEach(index => {
        const ref = personDropdownRefs.current[index];
        if (ref && !ref.contains(event.target)) {
          setShowPersonDropdowns(prev => ({ ...prev, [index]: false }));
        }
      });
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  const selectPerson = (index, person) => {
    const updated = [...linkedPersons];
    updated[index] = {
      ...updated[index],
      personId: person.id,
      personName: person.full_name
    };
    setLinkedPersons(updated);
    setPersonSearchQueries(prev => ({ ...prev, [index]: '' }));
    setShowPersonDropdowns(prev => ({ ...prev, [index]: false }));
  };
  
  const removeLinkedPerson = (index) => {
    setLinkedPersons(linkedPersons.filter((_, i) => i !== index));
    // Clean up search state
    const newQueries = { ...personSearchQueries };
    const newResults = { ...personSearchResults };
    const newDropdowns = { ...showPersonDropdowns };
    delete newQueries[index];
    delete newResults[index];
    delete newDropdowns[index];
    setPersonSearchQueries(newQueries);
    setPersonSearchResults(newResults);
    setShowPersonDropdowns(newDropdowns);
  };
  
  // Relationship options
  const relationshipOptions = [
    'Plaintiff',
    'Defendant',
    'Appellant',
    'Respondent',
    'Witness',
    'Co-Defendant',
    'Co-Plaintiff',
    'Interested Party',
    'Third Party',
    'Other'
  ];

  const handleFileUpload = (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setFormData(prev => ({
        ...prev,
        files: files
      }));
    }
  };

  // Search for judges
  useEffect(() => {
    const searchJudges = async () => {
      if (judgeSearchQuery.trim().length < 2) {
        setJudgeSearchResults([]);
        return;
      }

      try {
        const params = new URLSearchParams({
          query: judgeSearchQuery.trim(),
          occupation: 'Judge',
          limit: '10',
          page: '1'
        });
        const response = await apiGet(`/people/search?${params.toString()}`);
        if (response && response.people) {
          setJudgeSearchResults(response.people);
          setShowJudgeDropdown(true);
        } else {
          setJudgeSearchResults([]);
        }
      } catch (err) {
        console.error('Error searching judges:', err);
        setJudgeSearchResults([]);
      }
    };

    const debounceTimer = setTimeout(searchJudges, 300);
    return () => clearTimeout(debounceTimer);
  }, [judgeSearchQuery]);

  // Search for lawyers
  useEffect(() => {
    const searchLawyers = async () => {
      if (lawyerSearchQuery.trim().length < 2) {
        setLawyerSearchResults([]);
        return;
      }

      try {
        const params = new URLSearchParams({
          query: lawyerSearchQuery.trim(),
          occupation: 'Lawyer',
          limit: '10',
          page: '1'
        });
        const response = await apiGet(`/people/search?${params.toString()}`);
        if (response && response.people) {
          setLawyerSearchResults(response.people);
          setShowLawyerDropdown(true);
        } else {
          setLawyerSearchResults([]);
        }
      } catch (err) {
        console.error('Error searching lawyers:', err);
        setLawyerSearchResults([]);
      }
    };

    const debounceTimer = setTimeout(searchLawyers, 300);
    return () => clearTimeout(debounceTimer);
  }, [lawyerSearchQuery]);

  // Handle click outside for dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (judgeDropdownRef.current && !judgeDropdownRef.current.contains(event.target)) {
        setShowJudgeDropdown(false);
      }
      if (lawyerDropdownRef.current && !lawyerDropdownRef.current.contains(event.target)) {
        setShowLawyerDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectJudge = (judge) => {
    if (!presidingJudges.find(j => j.id === judge.id || j.name === judge.full_name)) {
      setPresidingJudges([...presidingJudges, { id: judge.id, name: judge.full_name }]);
    }
    setJudgeSearchQuery('');
    setShowJudgeDropdown(false);
  };

  const removeJudge = (index) => {
    setPresidingJudges(presidingJudges.filter((_, i) => i !== index));
  };

  const selectLawyer = (lawyer) => {
    if (!lawyers.find(l => l.id === lawyer.id || l.name === lawyer.full_name)) {
      setLawyers([...lawyers, { id: lawyer.id, name: lawyer.full_name, role: newLawyerRole }]);
    }
    setLawyerSearchQuery('');
    setShowLawyerDropdown(false);
  };

  const removeLawyer = (index) => {
    setLawyers(lawyers.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    // Mark all fields as touched
    setTouched({
      title: true,
      suit_reference_number: true,
      date: true,
      court_type: true,
      status: true,
      year: true,
      region: true,
      protagonist: true,
      antagonist: true
    });
    
    // Validate form
    if (!validateForm()) {
      // Scroll to first error
      const firstErrorField = Object.keys(errors)[0];
      if (firstErrorField) {
        const errorElement = document.querySelector(`[name="${firstErrorField}"]`) || 
                            document.querySelector(`#${firstErrorField}`);
        if (errorElement) {
          errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
          errorElement.focus();
        }
      }
      return;
    }
    
    if (onSave) {
      // Convert presiding judges array to JSON string (array of names) for backend
      const presidingJudgesString = presidingJudges.length > 0 
        ? JSON.stringify(presidingJudges.map(j => j.name || j)) 
        : null;
      
      // Convert lawyers array to JSON string for backend
      const lawyersString = lawyers.length > 0 
        ? JSON.stringify(lawyers.map(l => ({ name: l.name || l, role: l.role || 'defendant' }))) 
        : null;
      
      // Prepare person links array (similar to how person form handles case links)
      const personLinks = linkedPersons
        .filter(lp => lp.personId && lp.relationshipToCase)
        .map(lp => ({
          person_id: lp.personId,
          role_in_case: lp.relationshipToCase
        }));
      
      // Map form data to backend schema
      const caseData = {
        title: formData.title.trim(),
        suit_reference_number: formData.suit_reference_number.trim(),
        date: formData.date ? new Date(formData.date).toISOString() : null,
        presiding_judge: presidingJudgesString,
        case_summary: formData.case_summary?.trim() || '',
        status: formData.status,
        protagonist: formData.protagonist?.trim() || '',
        antagonist: formData.antagonist?.trim() || '',
        citation: formData.citation?.trim() || '',
        court_type: formData.court_type,
        region: formData.region || '',
        area_of_law: formData.area_of_law?.trim() || '',
        year: formData.year || (formData.date ? new Date(formData.date).getFullYear().toString() : null),
        summernote: formData.summernote || '',
        lawyers: lawyersString,
        person_links: personLinks.length > 0 ? personLinks : undefined
      };
      onSave(caseData);
    }
  };

  const handleSaveAndAddAnother = () => {
    handleSave();
    // Reset form
    setFormData({
      caseTitle: '',
      caseNumber: '',
      dateFiled: '',
      nextHearing: '',
      presidingJudge: '',
      summary: '',
      status: '',
      files: null
    });
    setLinkedCases([{
      caseNumber: '',
      caseTitle: '',
      relationToCase: ''
    }]);
    setLinkedPersons([{
        personId: null,
      personName: '',
        relationshipToCase: ''
    }]);
      setPersonSearchQueries({});
      setPersonSearchResults({});
      setShowPersonDropdowns({});
  };

  // Use userInfo from props or localStorage
  const displayUserInfo = userInfo || JSON.parse(localStorage.getItem('userData') || '{}');

  return (
    <div className="bg-[#F7F8FA] min-h-screen w-full">
      {/* Full Width Header */}
      {isRegistrar ? (
        <RegistrarHeader userInfo={displayUserInfo} onNavigate={onNavigate} onLogout={onLogout} />
      ) : (
        <AdminHeader userInfo={displayUserInfo} onNavigate={onNavigate} onLogout={onLogout} />
      )}
      
      {/* Page Title Section */}
      <div className="px-6 mb-4">
        <div className="flex flex-col items-start gap-1">
          <span className="text-[#050F1C] text-xl font-medium">High Court (Commercial),</span>
          <span className="text-[#050F1C] text-base opacity-75">Track all your activities here.</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-6 w-full">
        <div className="flex flex-col bg-white p-4 gap-10 rounded-lg w-full">
          {/* Header Section */}
          <div className="flex flex-col gap-4">
            {/* Breadcrumb */}
            <div className="flex items-center gap-1">
              <span className="text-[#525866] text-xs opacity-75">CASE PROFILE</span>
              <ChevronRight className="w-4 h-4 text-[#525866]" />
              <span className="text-[#070810] text-sm">{isEditMode ? 'Edit case' : 'Add new case'}</span>
            </div>

            {/* Back Button */}
            <button
              onClick={onBack}
              className="w-fit p-2 bg-[#F7F8FA] rounded-lg cursor-pointer hover:opacity-70"
            >
              <ChevronRight className="w-6 h-6 text-[#050F1C] rotate-180" />
            </button>
          </div>

          {/* Form Fields */}
          <div className="flex flex-col gap-6">
            {/* First Row: Case Title and Suit/Reference Number */}
            <div className="flex gap-6">
              <div className="flex-1 flex flex-col gap-2">
                <label className="text-[#050F1C] text-sm font-bold">Case title <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  name="title"
                  placeholder="Enter here"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className={`h-12 px-4 rounded-lg border text-[#525866] text-sm outline-none focus:border-[#022658] ${
                    errors.title ? 'border-red-500' : 'border-[#B1B9C6]'
                  }`}
                />
                {errors.title && touched.title && (
                  <span className="text-red-500 text-xs mt-1">{errors.title}</span>
                )}
              </div>
              <div className="flex-1 flex flex-col gap-2">
                <label className="text-[#050F1C] text-sm font-bold">Suit/Reference Number <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  name="suit_reference_number"
                  placeholder="Enter suit/reference number"
                  value={formData.suit_reference_number}
                  onChange={(e) => handleInputChange('suit_reference_number', e.target.value)}
                  className={`h-12 px-4 rounded-lg border text-[#525866] text-sm outline-none focus:border-[#022658] ${
                    errors.suit_reference_number ? 'border-red-500' : 'border-[#B1B9C6]'
                  }`}
                />
                {errors.suit_reference_number && touched.suit_reference_number && (
                  <span className="text-red-500 text-xs mt-1">{errors.suit_reference_number}</span>
                )}
              </div>
            </div>

            {/* Second Row: Date Filed, Year, Court Type */}
            <div className="flex gap-6">
              <div className="flex-1 flex flex-col gap-2">
                <label className="text-[#050F1C] text-sm font-bold">Date filed <span className="text-red-500">*</span></label>
                <div className="relative">
                  <input
                    type="date"
                    name="date"
                    placeholder="Day/Month/Year"
                    value={formData.date}
                    onChange={(e) => {
                      handleInputChange('date', e.target.value);
                      // Auto-update year when date changes
                      if (e.target.value) {
                        const year = new Date(e.target.value).getFullYear().toString();
                        handleInputChange('year', year);
                      }
                    }}
                    className={`w-full h-12 px-4 pr-10 rounded-lg border text-[#525866] text-sm outline-none focus:border-[#022658] ${
                      errors.date ? 'border-red-500' : 'border-[#B1B9C6]'
                    }`}
                  />
                </div>
                {errors.date && touched.date && (
                  <span className="text-red-500 text-xs mt-1">{errors.date}</span>
                )}
              </div>
              <div className="flex-1 flex flex-col gap-2">
                <label className="text-[#050F1C] text-sm font-bold">Year</label>
                <input
                  type="text"
                  name="year"
                  placeholder="YYYY"
                  value={formData.year}
                  onChange={(e) => handleInputChange('year', e.target.value)}
                  maxLength="4"
                  className={`w-full h-12 px-4 rounded-lg border text-[#525866] text-sm outline-none focus:border-[#022658] ${
                    errors.year ? 'border-red-500' : 'border-[#B1B9C6]'
                  }`}
                />
                {errors.year && touched.year && (
                  <span className="text-red-500 text-xs mt-1">{errors.year}</span>
                )}
              </div>
              <div className="flex-1 flex flex-col gap-2">
                <label className="text-[#050F1C] text-sm font-bold">Court Type <span className="text-red-500">*</span></label>
                <div className="relative">
                  <select
                    name="court_type"
                    value={formData.court_type}
                    onChange={(e) => handleInputChange('court_type', e.target.value)}
                    className={`w-full h-12 px-4 pr-10 rounded-lg border text-[#525866] text-sm outline-none focus:border-[#022658] ${
                      errors.court_type ? 'border-red-500' : 'border-[#B1B9C6]'
                    }`}
                  >
                    <option value="">Select Court Type</option>
                    <option value="SC">SC - Supreme Court</option>
                    <option value="CA">CA - Court of Appeal</option>
                    <option value="HC">HC - High Court</option>
                    <option value="CC">CC - Circuit Court</option>
                    <option value="DC">DC - District Court</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#050F1C] pointer-events-none" />
                </div>
                {errors.court_type && touched.court_type && (
                  <span className="text-red-500 text-xs mt-1">{errors.court_type}</span>
                )}
              </div>
            </div>

            {/* Third Row: Presiding Judges */}
            <div className="flex flex-col gap-4">
              <label className="text-[#050F1C] text-sm font-bold">Presiding Judges</label>
              
              {/* Search Judge Input */}
              <div className="relative" ref={judgeDropdownRef}>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#868C98]" />
                  <input
                    type="text"
                    placeholder="Search for judge..."
                    value={judgeSearchQuery}
                    onChange={(e) => {
                      setJudgeSearchQuery(e.target.value);
                      setShowJudgeDropdown(true);
                    }}
                    onFocus={() => {
                      if (judgeSearchResults.length > 0) {
                        setShowJudgeDropdown(true);
                      }
                    }}
                    className="w-full h-12 pl-10 pr-4 rounded-lg border border-[#B1B9C6] text-[#525866] text-sm outline-none focus:border-[#022658]"
                  />
                </div>
                
                {/* Search Results Dropdown */}
                {showJudgeDropdown && judgeSearchResults.length > 0 && (
                  <div className="absolute z-[100] w-full mt-1 bg-white border border-[#D4E1EA] rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {judgeSearchResults.map((judge) => (
                      <div
                        key={judge.id}
                        onClick={() => selectJudge(judge)}
                        className="px-4 py-2 hover:bg-[#F7F8FA] cursor-pointer border-b border-[#E5E8EC] last:border-b-0"
                      >
                        <div className="text-[#050F1C] text-sm font-medium">{judge.full_name}</div>
                        {judge.occupation && (
                          <div className="text-[#868C98] text-xs">{judge.occupation}</div>
                        )}
              </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Judges List */}
              {presidingJudges.length > 0 && (
                <div className="flex flex-col gap-2">
                  <div className="flex flex-wrap gap-2">
                    {presidingJudges.map((judge, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 px-3 py-2 bg-[#F7F8FA] rounded-lg border border-[#D4E1EA]"
                      >
                        <span className="text-[#050F1C] text-sm font-medium">{judge.name || judge}</span>
                        <button
                          type="button"
                          onClick={() => removeJudge(index)}
                          className="ml-2 text-red-500 hover:text-red-700 transition-colors"
                          title="Remove judge"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Lawyers Section */}
            <div className="flex flex-col gap-4">
              <label className="text-[#050F1C] text-sm font-bold">Lawyers Involved</label>
              
              {/* Search Lawyer Input */}
              <div className="flex gap-4 items-end">
                <div className="flex-1 relative" ref={lawyerDropdownRef}>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#868C98]" />
                  <input
                    type="text"
                      placeholder="Search for lawyer..."
                      value={lawyerSearchQuery}
                      onChange={(e) => {
                        setLawyerSearchQuery(e.target.value);
                        setShowLawyerDropdown(true);
                      }}
                      onFocus={() => {
                        if (lawyerSearchResults.length > 0) {
                          setShowLawyerDropdown(true);
                        }
                      }}
                      className="w-full h-12 pl-10 pr-4 rounded-lg border border-[#B1B9C6] text-[#525866] text-sm outline-none focus:border-[#022658]"
                    />
                </div>
                  
                  {/* Search Results Dropdown */}
                  {showLawyerDropdown && lawyerSearchResults.length > 0 && (
                    <div className="absolute z-[100] w-full mt-1 bg-white border border-[#D4E1EA] rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      {lawyerSearchResults.map((lawyer) => (
                        <div
                          key={lawyer.id}
                          onClick={() => selectLawyer(lawyer)}
                          className="px-4 py-2 hover:bg-[#F7F8FA] cursor-pointer border-b border-[#E5E8EC] last:border-b-0"
                        >
                          <div className="text-[#050F1C] text-sm font-medium">{lawyer.full_name}</div>
                          {lawyer.occupation && (
                            <div className="text-[#868C98] text-xs">{lawyer.occupation}</div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="w-48 flex flex-col gap-2">
                  <select
                    value={newLawyerRole}
                    onChange={(e) => setNewLawyerRole(e.target.value)}
                    className="h-12 px-4 rounded-lg border border-[#B1B9C6] text-[#525866] text-sm outline-none focus:border-[#022658]"
                  >
                    <option value="defendant">For Defendant</option>
                    <option value="appellant">For Appellant</option>
                  </select>
              </div>
            </div>

              {/* Lawyers List */}
              {lawyers.length > 0 && (
                <div className="flex flex-col gap-2">
                  <div className="flex flex-wrap gap-2">
                    {lawyers.map((lawyer, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 px-3 py-2 bg-[#F7F8FA] rounded-lg border border-[#D4E1EA]"
                      >
                        <span className="text-[#050F1C] text-sm font-medium">{lawyer.name || lawyer}</span>
                        <span className={`text-xs px-2 py-1 rounded ${
                          lawyer.role === 'defendant' 
                            ? 'bg-blue-100 text-blue-700' 
                            : 'bg-green-100 text-green-700'
                        }`}>
                          {lawyer.role === 'defendant' ? 'Defendant' : 'Appellant'}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeLawyer(index)}
                          className="ml-2 text-red-500 hover:text-red-700 transition-colors"
                          title="Remove lawyer"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Fourth Row: Summary and Status/Upload */}
            <div className="flex gap-6">
              <div className="flex-1 flex flex-col gap-2">
                <label className="text-[#050F1C] text-sm font-bold">Case Summary</label>
                <textarea
                  placeholder="Type a summary"
                  value={formData.case_summary || ''}
                  onChange={(e) => handleInputChange('case_summary', e.target.value)}
                  className="flex-1 min-h-[120px] px-4 py-3 rounded-lg border border-[#B1B9C6] text-[#525866] text-sm outline-none focus:border-[#022658] resize-none"
                />
              </div>
              <div className="w-[358px] flex flex-col gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-[#050F1C] text-sm font-bold">Status <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <select
                      name="status"
                      value={formData.status}
                      onChange={(e) => handleInputChange('status', e.target.value)}
                      className={`w-full h-12 px-4 pr-10 rounded-lg border text-[#525866] text-sm outline-none focus:border-[#022658] ${
                        errors.status ? 'border-red-500' : 'border-[#B1B9C6]'
                      }`}
                    >
                      <option value="">Select status</option>
                      <option value="active">Active</option>
                      <option value="pending">Pending</option>
                      <option value="adjourned">Adjourned</option>
                      <option value="heard">Heard</option>
                      <option value="closed">Closed</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#050F1C] pointer-events-none" />
                  </div>
                  {errors.status && touched.status && (
                    <span className="text-red-500 text-xs mt-1">{errors.status}</span>
                  )}
                </div>
                <div className="p-4 rounded-lg border border-[#B1B9C6] flex flex-col items-center gap-3">
                  <div className="w-10 h-10 rounded-full border-2 border-[#D4E1EA] flex items-center justify-center">
                    <Upload className="w-4 h-4 text-[#050F1C]" />
                  </div>
                  <span className="text-[#050F1C] text-sm">Browse & choose files you want to upload</span>
                  <span className="text-[#525866] text-xs">Max file size 5MB</span>
                  <label className="h-8 px-2.5 rounded-lg border-4 border-[#0F284726] text-white text-xs font-bold cursor-pointer hover:opacity-90 transition-opacity flex items-center justify-center"
                    style={{ 
                      background: 'linear-gradient(180deg, #0F2847 43%, #1A4983 100%)', 
                      boxShadow: '0px 4px 4px rgba(5, 15, 28, 0.10)' 
                    }}
                  >
                    <input
                      type="file"
                      multiple
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    Upload here
                  </label>
                </div>
              </div>
            </div>

            {/* Additional Fields Row */}
            <div className="flex gap-6">
              <div className="flex-1 flex flex-col gap-2">
                <label className="text-[#050F1C] text-sm font-bold">Protagonist (Plaintiff)</label>
                <input
                  type="text"
                  name="protagonist"
                  placeholder="Enter here"
                  value={formData.protagonist}
                  onChange={(e) => handleInputChange('protagonist', e.target.value)}
                  className={`h-12 px-4 rounded-lg border text-[#525866] text-sm outline-none focus:border-[#022658] ${
                    errors.parties ? 'border-red-500' : 'border-[#B1B9C6]'
                  }`}
                />
              </div>
              <div className="flex-1 flex flex-col gap-2">
                <label className="text-[#050F1C] text-sm font-bold">Antagonist (Defendant)</label>
                <input
                  type="text"
                  name="antagonist"
                  placeholder="Enter here"
                  value={formData.antagonist}
                  onChange={(e) => handleInputChange('antagonist', e.target.value)}
                  className={`h-12 px-4 rounded-lg border text-[#525866] text-sm outline-none focus:border-[#022658] ${
                    errors.parties ? 'border-red-500' : 'border-[#B1B9C6]'
                  }`}
                />
              </div>
              <div className="flex-1 flex flex-col gap-2">
                <label className="text-[#050F1C] text-sm font-bold">Region</label>
                <select
                  name="region"
                  value={formData.region}
                  onChange={(e) => handleInputChange('region', e.target.value)}
                  className={`h-12 px-4 rounded-lg border text-[#525866] text-sm outline-none focus:border-[#022658] ${
                    errors.region ? 'border-red-500' : 'border-[#B1B9C6]'
                  }`}
                >
                  <option value="">Select Region</option>
                  <option value="Greater Accra Region">Greater Accra Region</option>
                  <option value="Ashanti Region">Ashanti Region</option>
                  <option value="Western Region">Western Region</option>
                  <option value="Western North Region">Western North Region</option>
                  <option value="Eastern Region">Eastern Region</option>
                  <option value="Central Region">Central Region</option>
                  <option value="Northern Region">Northern Region</option>
                  <option value="Volta Region">Volta Region</option>
                  <option value="Upper East Region">Upper East Region</option>
                  <option value="Upper West Region">Upper West Region</option>
                  <option value="Bono Region">Bono Region</option>
                  <option value="Ahafo Region">Ahafo Region</option>
                  <option value="Bono East Region">Bono East Region</option>
                  <option value="Oti Region">Oti Region</option>
                  <option value="Savannah Region">Savannah Region</option>
                  <option value="North East Region">North East Region</option>
                </select>
                {errors.region && touched.region && (
                  <span className="text-red-500 text-xs mt-1">{errors.region}</span>
                )}
                {errors.parties && (
                  <span className="text-red-500 text-xs mt-1">{errors.parties}</span>
                )}
              </div>
              <div className="flex-1 flex flex-col gap-2">
                <label className="text-[#050F1C] text-sm font-bold">Area of Law</label>
                <input
                  type="text"
                  placeholder="Enter here"
                  value={formData.area_of_law}
                  onChange={(e) => handleInputChange('area_of_law', e.target.value)}
                  className="h-12 px-4 rounded-lg border border-[#B1B9C6] text-[#525866] text-sm outline-none focus:border-[#022658]"
                />
              </div>
            </div>

            {/* Citation Field */}
            <div className="flex gap-6">
              <div className="flex-1 flex flex-col gap-2">
                <label className="text-[#050F1C] text-sm font-bold">Citation</label>
                <input
                  type="text"
                  placeholder="Enter citation"
                  value={formData.citation}
                  onChange={(e) => handleInputChange('citation', e.target.value)}
                  className="h-12 px-4 rounded-lg border border-[#B1B9C6] text-[#525866] text-sm outline-none focus:border-[#022658]"
                />
              </div>
            </div>

            {/* Summernote WYSIWYG Editor */}
            <div className="flex flex-col gap-2">
              <label className="text-[#050F1C] text-sm font-bold">Case Content (Summernote)</label>
              <div className="bg-white rounded-lg border border-[#B1B9C6]">
                <ReactQuill
                  value={formData.summernote}
                  onChange={(value) => handleInputChange('summernote', value)}
                  modules={quillModules}
                  formats={quillFormats}
                  theme="snow"
                  style={{ minHeight: '300px' }}
                  placeholder="Enter case content here..."
                />
              </div>
              <style>{`
                .ql-container {
                  min-height: 300px;
                  font-size: 14px;
                }
                .ql-editor {
                  min-height: 300px;
                }
              `}</style>
            </div>
          </div>

          {/* Link to case Section */}
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <span className="text-[#868C98] text-xl">Link to case</span>
              <button className="text-[#F59E0B] text-xs font-bold hover:underline">
                Search existing case
              </button>
            </div>
            <div className="flex flex-col gap-3">
              {linkedCases.map((linkedCase, index) => (
                <div key={index} className="flex gap-6">
                  <div className="flex-1 flex flex-col gap-2">
                    <label className="text-[#050F1C] text-sm font-bold">Case number</label>
                    <input
                      type="text"
                      placeholder="Enter here"
                      value={linkedCase.caseNumber}
                      onChange={(e) => handleLinkedCaseChange(index, 'caseNumber', e.target.value)}
                      className="h-12 px-4 rounded-lg border border-[#B1B9C6] text-[#525866] text-sm outline-none focus:border-[#022658]"
                    />
                  </div>
                  <div className="flex-1 flex flex-col gap-2">
                    <label className="text-[#050F1C] text-sm font-bold">Case title</label>
                    <input
                      type="text"
                      placeholder="Enter here"
                      value={linkedCase.caseTitle}
                      onChange={(e) => handleLinkedCaseChange(index, 'caseTitle', e.target.value)}
                      className="h-12 px-4 rounded-lg border border-[#B1B9C6] text-[#525866] text-sm outline-none focus:border-[#022658]"
                    />
                  </div>
                  <div className="flex-1 flex flex-col gap-2">
                    <label className="text-[#050F1C] text-sm font-bold">Relation to case</label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Choose relation"
                        value={linkedCase.relationToCase}
                        onChange={(e) => handleLinkedCaseChange(index, 'relationToCase', e.target.value)}
                        className="w-full h-12 px-4 pr-10 rounded-lg border border-[#B1B9C6] text-[#525866] text-sm outline-none focus:border-[#022658]"
                      />
                      <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#050F1C]" />
                    </div>
                  </div>
                </div>
              ))}
              <button
                onClick={addLinkedCase}
                className="text-[#F59E0B] text-xs font-bold hover:underline w-fit"
              >
                Add another case
              </button>
            </div>
          </div>

          {/* Link to another person Section */}
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <span className="text-[#868C98] text-xl">Link to another person</span>
            </div>
            <div className="flex flex-col gap-3">
              {linkedPersons.map((linkedPerson, index) => (
                <div key={index} className="flex gap-6 items-end">
                  <div className="flex-1 flex flex-col gap-2 relative" ref={el => {
                    if (el) personDropdownRefs.current[index] = el;
                  }}>
                    <label className="text-[#050F1C] text-sm font-bold">Person name</label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#868C98]" />
                    <input
                      type="text"
                        placeholder="Search for person..."
                        value={personSearchQueries[index] || linkedPerson.personName || ''}
                        onChange={(e) => {
                          const query = e.target.value;
                          setPersonSearchQueries(prev => ({ ...prev, [index]: query }));
                          if (query.length < 2) {
                            handleLinkedPersonChange(index, 'personName', query);
                          }
                        }}
                        onFocus={() => {
                          if (personSearchResults[index] && personSearchResults[index].length > 0) {
                            setShowPersonDropdowns(prev => ({ ...prev, [index]: true }));
                          }
                        }}
                        className="w-full h-12 pl-10 pr-4 rounded-lg border border-[#B1B9C6] text-[#525866] text-sm outline-none focus:border-[#022658]"
                      />
                    </div>
                    
                    {/* Search Results Dropdown */}
                    {showPersonDropdowns[index] && personSearchResults[index] && personSearchResults[index].length > 0 && (
                      <div className="absolute z-[100] w-full mt-1 bg-white border border-[#D4E1EA] rounded-lg shadow-lg max-h-60 overflow-y-auto top-full">
                        {personSearchResults[index].map((person) => (
                          <div
                            key={person.id}
                            onClick={() => selectPerson(index, person)}
                            className="px-4 py-2 hover:bg-[#F7F8FA] cursor-pointer border-b border-[#E5E8EC] last:border-b-0"
                          >
                            <div className="text-[#050F1C] text-sm font-medium">{person.full_name}</div>
                            {person.occupation && (
                              <div className="text-[#868C98] text-xs">{person.occupation}</div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 flex flex-col gap-2">
                    <label className="text-[#050F1C] text-sm font-bold">Relationship to case</label>
                    <div className="relative">
                      <select
                        value={linkedPerson.relationshipToCase}
                        onChange={(e) => handleLinkedPersonChange(index, 'relationshipToCase', e.target.value)}
                        className="w-full h-12 px-4 pr-10 rounded-lg border border-[#B1B9C6] text-[#525866] text-sm outline-none focus:border-[#022658]"
                      >
                        <option value="">Select relationship</option>
                        {relationshipOptions.map(option => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#050F1C] pointer-events-none" />
                    </div>
                  </div>
                  {linkedPersons.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeLinkedPerson(index)}
                      className="h-12 px-4 text-red-500 hover:text-red-700 transition-colors"
                      title="Remove person"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
              ))}
              <button
                onClick={addLinkedPerson}
                className="text-[#F59E0B] text-xs font-bold hover:underline w-fit"
              >
                Add another person
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-10">
            <button
              onClick={handleSaveAndAddAnother}
              className="flex-1 h-[58px] px-2.5 rounded-lg border-2 border-[#0F2847] text-[#022658] text-base font-bold hover:opacity-90 transition-opacity"
              style={{ boxShadow: '0px 4px 4px rgba(5, 15, 28, 0.10)' }}
            >
              Save & add another case
            </button>
            <button
              onClick={handleSave}
              className="flex-1 h-[58px] px-2.5 rounded-lg border-4 border-[#0F284726] text-white text-base font-bold hover:opacity-90 transition-opacity"
              style={{ 
                background: 'linear-gradient(180deg, #022658 43%, #1A4983 100%)', 
                boxShadow: '0px 4px 4px rgba(5, 15, 28, 0.10)' 
              }}
            >
              Save case
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddNewCaseForm;


