import React, { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown, Bell, ChevronRight, Upload } from 'lucide-react';
import { apiGet } from '../utils/api';

const AddCasesToCauseListPage = ({ registry, judge, onBack, onSave, initialData, isEditMode }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [uploadType, setUploadType] = useState('manual'); // 'manual' or 'bulk'
  const [judges, setJudges] = useState([]);
  const [loadingJudges, setLoadingJudges] = useState(false);
  
  // Helper to format date for input
  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '';
      return date.toISOString().split('T')[0];
    } catch (e) {
      return '';
    }
  };

  // Helper to format time for input
  const formatTimeForInput = (timeString) => {
    if (!timeString) return '';
    try {
      if (typeof timeString === 'string') {
        // Handle "HH:MM:SS" or "HH:MM" format
        const parts = timeString.split(':');
        if (parts.length >= 2) {
          return `${parts[0]}:${parts[1]}`;
        }
      }
      return timeString;
    } catch (e) {
      return '';
    }
  };

  // Initialize form data
  const getInitialFormData = () => {
    if (isEditMode && initialData) {
      return {
        caseType: initialData.case_type || '',
        suitNo: initialData.suit_no || '',
        caseTitle: initialData.case_title || '',
        dateOfHearing: formatDateForInput(initialData.hearing_date),
        timeOfHearing: formatTimeForInput(initialData.hearing_time),
        judgeName: initialData.judge_name || '',
        firstPartyTitle: initialData.first_party_title || '',
        firstPartyName: initialData.first_party_name || '',
        secondPartyTitle: initialData.second_party_title || '',
        secondPartyName: initialData.second_party_name || '',
        firstPartyCounselTitle: initialData.first_party_counsel_title || '',
        firstPartyCounsel: initialData.first_party_counsel_name || '',
        firstPartyCounselContact: initialData.first_party_counsel_contact || '',
        secondPartyCounselTitle: initialData.second_party_counsel_title || '',
        secondPartyCounsel: initialData.second_party_counsel_name || '',
        secondPartyCounselContact: initialData.second_party_counsel_contact || '',
        remarks: initialData.remarks || '',
        documents: []
      };
    }
    
    return {
      caseType: '',
      suitNo: '',
      caseTitle: '',
      dateOfHearing: '',
      timeOfHearing: '',
      judgeName: judge?.name || '',
      firstPartyTitle: '',
      firstPartyName: '',
      secondPartyTitle: '',
      secondPartyName: '',
      firstPartyCounselTitle: '',
      firstPartyCounsel: '',
      firstPartyCounselContact: '',
      secondPartyCounselTitle: '',
      secondPartyCounsel: '',
      secondPartyCounselContact: '',
      remarks: '',
      documents: []
    };
  };

  const [formData, setFormData] = useState(getInitialFormData());
  const [showDropdowns, setShowDropdowns] = useState({});
  const filterDropdownRef = useRef(null);
  const dropdownRefs = useRef({});

  // Fetch judges for dropdown
  useEffect(() => {
    const fetchJudges = async () => {
      try {
        setLoadingJudges(true);
        const courtType = registry?.court_type || registry?.name?.split('(')[0]?.trim() || 'High Court';
        const division = registry?.division || registry?.court_division || '';
        
        let response;
        if (division) {
          response = await apiGet(`/admin/judges?court_type=${encodeURIComponent(courtType)}&court_division=${encodeURIComponent(division)}&limit=100`);
        } else {
          response = await apiGet(`/admin/judges?court_type=${encodeURIComponent(courtType)}&limit=100`);
        }
        
        if (response && response.judges) {
          setJudges(response.judges);
        }
      } catch (err) {
        console.error('Error fetching judges:', err);
        setJudges([]);
      } finally {
        setLoadingJudges(false);
      }
    };

    fetchJudges();
  }, [registry]);

  // Handle click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterDropdownRef.current && !filterDropdownRef.current.contains(event.target)) {
        setShowFilterDropdown(false);
      }
      Object.keys(dropdownRefs.current).forEach(key => {
        if (dropdownRefs.current[key] && !dropdownRefs.current[key].contains(event.target)) {
          setShowDropdowns(prev => ({ ...prev, [key]: false }));
        }
      });
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const userInfo = JSON.parse(localStorage.getItem('userData') || '{}');
  const userName = userInfo?.first_name && userInfo?.last_name 
    ? `${userInfo.first_name} ${userInfo.last_name}` 
    : 'Ben Frimpong';

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleDropdownToggle = (field) => {
    setShowDropdowns(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    setFormData(prev => ({ ...prev, documents: [...prev.documents, ...files] }));
  };

  const handleSave = () => {
    if (onSave) {
      onSave(formData);
    }
    // Navigate back after saving
    onBack();
  };

  const handleCancel = () => {
    onBack();
  };

  // Dropdown options
  const dropdownOptions = {
    caseType: ['Civil', 'Criminal', 'Commercial', 'Family', 'Land'],
    suitNo: ['CM/0245/2023', 'CM/0290/2023', 'CM/0312/2023', 'CM/0400/2023'],
    judgeName: judges.map(j => j.name || `${j.title || ''} ${j.name || ''}`.trim()).filter(Boolean),
    partyTitle: ['Plaintiff', 'Defendant', 'Applicant', 'Respondent', 'Petitioner']
  };

  return (
    <div className="bg-[#F7F8FA] min-h-screen">
      {/* Full Width Header */}
      <div className="w-full bg-white py-3.5 px-6 mb-4 border-b border-[#D4E1EA]">
        <div className="flex justify-between items-center">
          <div className="flex flex-col items-start gap-1">
            <span className="text-[#050F1C] text-xl font-medium">High Court (Commercial),</span>
            <span className="text-[#050F1C] text-base opacity-75">Track all your activities here.</span>
          </div>
          <div className="flex items-start gap-4">
            <div className="flex justify-between items-center w-[600px] pr-2 rounded-lg border border-solid border-[#D4E1EA] bg-white">
              <input
                type="text"
                placeholder="Search cases and gazette here"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 self-stretch text-[#525866] bg-transparent text-xs py-3.5 pl-2 mr-1 border-0 outline-none"
              />
              <div className="flex items-center w-[73px] gap-1.5">
                <Search className="w-[19px] h-[19px] text-[#525866]" />
                <div 
                  ref={filterDropdownRef}
                  className="flex items-center bg-white w-12 py-1 px-[9px] gap-1 rounded cursor-pointer relative"
                  onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                >
                  <span className="text-[#525866] text-xs font-bold">
                    {selectedFilter}
                  </span>
                  <ChevronDown className="w-3 h-3 text-[#525866]" />
                  {showFilterDropdown && (
                    <div className="absolute top-full right-0 mt-1 bg-white border border-[#D4E1EA] rounded-lg shadow-lg z-10 min-w-[120px]">
                      {['All', 'Cases', 'Gazette'].map((filter) => (
                        <div
                          key={filter}
                          onClick={() => {
                            setSelectedFilter(filter);
                            setShowFilterDropdown(false);
                          }}
                          className="px-3 py-2 text-xs text-[#525866] hover:bg-gray-50 cursor-pointer"
                        >
                          {filter}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#F7F8FA] rounded-full border border-[#D4E1EA]">
                <Bell className="w-5 h-5 text-[#022658]" />
              </div>
              <div className="flex items-center gap-1.5">
                <img
                  src={userInfo?.profile_picture || '/images/image.png'}
                  alt="User"
                  className="w-9 h-9 rounded-full object-cover"
                  onError={(e) => {
                    e.target.src = '/images/image.png';
                  }}
                />
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-1">
                    <span className="text-[#050F1C] text-base font-bold whitespace-nowrap">
                      {userName}
                    </span>
                    <ChevronDown className="w-3 h-3 text-[#050F1C]" />
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-[#525866] text-xs">Online</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-6">
        <div className="flex flex-col bg-white p-4 gap-[60px] rounded-lg min-h-[1220px]">
          <div className="flex flex-col gap-6">
            {/* Breadcrumb */}
            <div className="flex items-center gap-1">
              <span className="text-[#525866] text-xs opacity-75 mr-1 whitespace-nowrap">CAUSE LIST</span>
              <ChevronRight className="w-4 h-4 text-[#525866] mr-1" />
              <span className="text-[#070810] text-sm font-normal whitespace-nowrap">
                {registry?.name || 'High Court (Commercial)'}
              </span>
              <ChevronRight className="w-4 h-4 text-[#525866] mr-1" />
              <span className="text-[#070810] text-sm font-normal whitespace-nowrap">View Cause list</span>
            </div>

            {/* Back Button */}
            <button
              onClick={onBack}
              className="flex items-start gap-1 cursor-pointer hover:opacity-70 w-fit"
            >
              <ChevronRight className="w-4 h-4 text-[#050F1C] rotate-180" />
            </button>

            {/* Form Section */}
            <div className="flex flex-col gap-4">
              <span className="text-[#525866] text-sm">
                {isEditMode 
                  ? 'Edit Cause List Entry'
                  : uploadType === 'bulk' 
                    ? 'Add Cause List' 
                    : 'Add Cases to Cause list'
                }
              </span>

              {/* Upload Type Selection */}
              <div className="flex items-start gap-6">
                <div 
                  className="flex items-center gap-1 cursor-pointer pb-0.5"
                  onClick={() => setUploadType('manual')}
                >
                  <span className="text-[#050F1C] text-base">Manual upload</span>
                  <div className="relative w-6 h-6">
                    <div 
                      className={`absolute w-3.5 h-3.5 left-[5px] top-[5px] rounded-full ${
                        uploadType === 'manual' ? 'bg-[#022658]' : 'bg-[#B1B9C6]'
                      }`}
                    ></div>
                    <div 
                      className={`absolute w-6 h-6 left-0 top-0 rounded-full border ${
                        uploadType === 'manual' ? 'border-[#022658]' : 'border-[#B1B9C6]'
                      }`}
                    ></div>
                  </div>
                </div>
                <div 
                  className="flex items-center gap-1 cursor-pointer"
                  onClick={() => setUploadType('bulk')}
                >
                  <span className="text-[#050F1C] text-base">Bulk upload</span>
                  <div className="relative w-6 h-6">
                    <div 
                      className={`absolute w-3.5 h-3.5 left-[5px] top-[5px] rounded-full ${
                        uploadType === 'bulk' ? 'bg-[#022658]' : 'bg-[#B1B9C6]'
                      }`}
                    ></div>
                    <div 
                      className={`absolute w-6 h-6 left-0 top-0 rounded-full border ${
                        uploadType === 'bulk' ? 'border-[#022658]' : 'border-[#B1B9C6]'
                      }`}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Manual Upload Form */}
              {uploadType === 'manual' && (
                <>
                  {/* First Row */}
                  <div className="flex gap-6">
                    <div className="flex-1 flex flex-col gap-2">
                      <label className="text-[#050F1C] text-sm font-bold">Case type</label>
                      <div 
                        ref={el => dropdownRefs.current['caseType'] = el}
                        className="relative h-12 px-4 py-3 rounded-lg border border-[#B1B9C6] flex justify-between items-center cursor-pointer"
                        onClick={() => handleDropdownToggle('caseType')}
                      >
                        <span className="text-[#525866] text-sm">
                          {formData.caseType || 'Select'}
                        </span>
                        <ChevronDown className="w-4 h-4 text-[#050F1C]" />
                        {showDropdowns.caseType && (
                          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#B1B9C6] rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
                            {dropdownOptions.caseType.map((option) => (
                              <div
                                key={option}
                                onClick={() => {
                                  handleInputChange('caseType', option);
                                  handleDropdownToggle('caseType');
                                }}
                                className="px-4 py-2 text-sm text-[#525866] hover:bg-gray-50 cursor-pointer"
                              >
                                {option}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex-1 flex flex-col gap-2">
                      <label className="text-[#050F1C] text-sm font-bold">Suit No.</label>
                      <div 
                        ref={el => dropdownRefs.current['suitNo'] = el}
                        className="relative h-12 px-4 py-3 rounded-lg border border-[#B1B9C6] flex justify-between items-center cursor-pointer"
                        onClick={() => handleDropdownToggle('suitNo')}
                      >
                        <span className="text-[#525866] text-sm">
                          {formData.suitNo || 'Select'}
                        </span>
                        <ChevronDown className="w-4 h-4 text-[#050F1C]" />
                        {showDropdowns.suitNo && (
                          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#B1B9C6] rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
                            {dropdownOptions.suitNo.map((option) => (
                              <div
                                key={option}
                                onClick={() => {
                                  handleInputChange('suitNo', option);
                                  handleDropdownToggle('suitNo');
                                }}
                                className="px-4 py-2 text-sm text-[#525866] hover:bg-gray-50 cursor-pointer"
                              >
                                {option}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex-1 flex flex-col gap-2">
                      <label className="text-[#050F1C] text-sm font-bold">Case title</label>
                      <input
                        type="text"
                        value={formData.caseTitle}
                        onChange={(e) => handleInputChange('caseTitle', e.target.value)}
                        placeholder="Enter here"
                        className="h-12 px-4 py-3 rounded-lg border border-[#B1B9C6] text-[#525866] text-sm outline-none focus:border-[#022658]"
                      />
                    </div>
                  </div>

                  {/* Second Row */}
                  <div className="flex gap-6">
                    <div className="flex-1 flex flex-col gap-2">
                      <label className="text-[#050F1C] text-sm font-bold">Date of Hearing</label>
                      <input
                        type="date"
                        value={formData.dateOfHearing}
                        onChange={(e) => handleInputChange('dateOfHearing', e.target.value)}
                        className="h-12 px-4 py-3 rounded-lg border border-[#B1B9C6] text-[#525866] text-sm outline-none focus:border-[#022658]"
                      />
                    </div>
                    <div className="flex-1 flex flex-col gap-2">
                      <label className="text-[#050F1C] text-sm font-bold">Time of Hearing</label>
                      <input
                        type="time"
                        value={formData.timeOfHearing}
                        onChange={(e) => handleInputChange('timeOfHearing', e.target.value)}
                        placeholder="Enter here"
                        className="h-12 px-4 py-3 rounded-lg border border-[#B1B9C6] text-[#525866] text-sm outline-none focus:border-[#022658]"
                      />
                    </div>
                    <div className="flex-1 flex flex-col gap-2">
                      <label className="text-[#050F1C] text-sm font-bold">Judge's name</label>
                      <div 
                        ref={el => dropdownRefs.current['judgeName'] = el}
                        className="relative h-12 px-4 py-3 rounded-lg border border-[#B1B9C6] flex justify-between items-center cursor-pointer"
                        onClick={() => handleDropdownToggle('judgeName')}
                      >
                        <span className="text-[#525866] text-sm">
                          {formData.judgeName || 'Select'}
                        </span>
                        <ChevronDown className="w-4 h-4 text-[#050F1C]" />
                        {showDropdowns.judgeName && (
                          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#B1B9C6] rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
                            {loadingJudges ? (
                              <div className="px-4 py-2 text-sm text-[#525866]">Loading judges...</div>
                            ) : dropdownOptions.judgeName.length === 0 ? (
                              <div className="px-4 py-2 text-sm text-[#525866]">No judges available</div>
                            ) : (
                              dropdownOptions.judgeName.map((option) => (
                                <div
                                  key={option}
                                  onClick={() => {
                                    handleInputChange('judgeName', option);
                                    handleDropdownToggle('judgeName');
                                  }}
                                  className="px-4 py-2 text-sm text-[#525866] hover:bg-gray-50 cursor-pointer"
                                >
                                  {option}
                                </div>
                              ))
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Parties Involved Section */}
                  <div className="flex flex-col gap-3">
                    <span className="text-[#525866] text-sm">PARTIES INVOLVED</span>
                    
                    {/* First Party Row */}
                    <div className="flex gap-6">
                      <div className="flex-1 flex flex-col gap-2">
                        <label className="text-[#050F1C] text-sm font-bold">Party's title</label>
                        <div 
                          ref={el => dropdownRefs.current['firstPartyTitle'] = el}
                          className="relative h-12 px-4 py-3 rounded-lg border border-[#B1B9C6] flex justify-between items-center cursor-pointer"
                          onClick={() => handleDropdownToggle('firstPartyTitle')}
                        >
                          <span className="text-[#525866] text-sm">
                            {formData.firstPartyTitle || 'Select'}
                          </span>
                          <ChevronDown className="w-4 h-4 text-[#050F1C]" />
                          {showDropdowns.firstPartyTitle && (
                            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#B1B9C6] rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
                              {dropdownOptions.partyTitle.map((option) => (
                                <div
                                  key={option}
                                  onClick={() => {
                                    handleInputChange('firstPartyTitle', option);
                                    handleDropdownToggle('firstPartyTitle');
                                  }}
                                  className="px-4 py-2 text-sm text-[#525866] hover:bg-gray-50 cursor-pointer"
                                >
                                  {option}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex-1 flex flex-col gap-2">
                        <label className="text-[#050F1C] text-sm font-bold">First Party name</label>
                        <input
                          type="text"
                          value={formData.firstPartyName}
                          onChange={(e) => handleInputChange('firstPartyName', e.target.value)}
                          placeholder="Enter here"
                          className="h-12 px-4 py-3 rounded-lg border border-[#B1B9C6] text-[#525866] text-sm outline-none focus:border-[#022658]"
                        />
                      </div>
                    </div>

                    {/* Second Party Row */}
                    <div className="flex gap-6">
                      <div className="flex-1 flex flex-col gap-2">
                        <label className="text-[#050F1C] text-sm font-bold">Party's title</label>
                        <div 
                          ref={el => dropdownRefs.current['secondPartyTitle'] = el}
                          className="relative h-12 px-4 py-3 rounded-lg border border-[#B1B9C6] flex justify-between items-center cursor-pointer"
                          onClick={() => handleDropdownToggle('secondPartyTitle')}
                        >
                          <span className="text-[#525866] text-sm">
                            {formData.secondPartyTitle || 'Select'}
                          </span>
                          <ChevronDown className="w-4 h-4 text-[#050F1C]" />
                          {showDropdowns.secondPartyTitle && (
                            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#B1B9C6] rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
                              {dropdownOptions.partyTitle.map((option) => (
                                <div
                                  key={option}
                                  onClick={() => {
                                    handleInputChange('secondPartyTitle', option);
                                    handleDropdownToggle('secondPartyTitle');
                                  }}
                                  className="px-4 py-2 text-sm text-[#525866] hover:bg-gray-50 cursor-pointer"
                                >
                                  {option}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex-1 flex flex-col gap-2">
                        <label className="text-[#050F1C] text-sm font-bold">Second Party's name</label>
                        <input
                          type="text"
                          value={formData.secondPartyName}
                          onChange={(e) => handleInputChange('secondPartyName', e.target.value)}
                          placeholder="Enter here"
                          className="h-12 px-4 py-3 rounded-lg border border-[#B1B9C6] text-[#525866] text-sm outline-none focus:border-[#022658]"
                        />
                      </div>
                    </div>

                    {/* First Party Counsel Row */}
                    <div className="flex gap-6">
                      <div className="flex-1 flex flex-col gap-2">
                        <label className="text-[#050F1C] text-sm font-bold">Party's title</label>
                        <div 
                          ref={el => dropdownRefs.current['firstPartyCounselTitle'] = el}
                          className="relative h-12 px-4 py-3 rounded-lg border border-[#B1B9C6] flex justify-between items-center cursor-pointer"
                          onClick={() => handleDropdownToggle('firstPartyCounselTitle')}
                        >
                          <span className="text-[#525866] text-sm">
                            {formData.firstPartyCounselTitle || 'Select'}
                          </span>
                          <ChevronDown className="w-4 h-4 text-[#050F1C]" />
                          {showDropdowns.firstPartyCounselTitle && (
                            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#B1B9C6] rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
                              {dropdownOptions.partyTitle.map((option) => (
                                <div
                                  key={option}
                                  onClick={() => {
                                    handleInputChange('firstPartyCounselTitle', option);
                                    handleDropdownToggle('firstPartyCounselTitle');
                                  }}
                                  className="px-4 py-2 text-sm text-[#525866] hover:bg-gray-50 cursor-pointer"
                                >
                                  {option}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex-1 flex flex-col gap-2">
                        <label className="text-[#050F1C] text-sm font-bold">First Party's Counsel</label>
                        <input
                          type="text"
                          value={formData.firstPartyCounsel}
                          onChange={(e) => handleInputChange('firstPartyCounsel', e.target.value)}
                          placeholder="Enter here"
                          className="h-12 px-4 py-3 rounded-lg border border-[#B1B9C6] text-[#525866] text-sm outline-none focus:border-[#022658]"
                        />
                      </div>
                      <div className="flex-1 flex flex-col gap-2">
                        <label className="text-[#050F1C] text-sm font-bold">First Party's Counsel contact</label>
                        <input
                          type="text"
                          value={formData.firstPartyCounselContact}
                          onChange={(e) => handleInputChange('firstPartyCounselContact', e.target.value)}
                          placeholder="Enter here"
                          className="h-12 px-4 py-3 rounded-lg border border-[#B1B9C6] text-[#525866] text-sm outline-none focus:border-[#022658]"
                        />
                      </div>
                    </div>

                    {/* Second Party Counsel Row */}
                    <div className="flex gap-6">
                      <div className="flex-1 flex flex-col gap-2">
                        <label className="text-[#050F1C] text-sm font-bold">Party's title</label>
                        <div 
                          ref={el => dropdownRefs.current['secondPartyCounselTitle'] = el}
                          className="relative h-12 px-4 py-3 rounded-lg border border-[#B1B9C6] flex justify-between items-center cursor-pointer"
                          onClick={() => handleDropdownToggle('secondPartyCounselTitle')}
                        >
                          <span className="text-[#525866] text-sm">
                            {formData.secondPartyCounselTitle || 'Select'}
                          </span>
                          <ChevronDown className="w-4 h-4 text-[#050F1C]" />
                          {showDropdowns.secondPartyCounselTitle && (
                            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#B1B9C6] rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
                              {dropdownOptions.partyTitle.map((option) => (
                                <div
                                  key={option}
                                  onClick={() => {
                                    handleInputChange('secondPartyCounselTitle', option);
                                    handleDropdownToggle('secondPartyCounselTitle');
                                  }}
                                  className="px-4 py-2 text-sm text-[#525866] hover:bg-gray-50 cursor-pointer"
                                >
                                  {option}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex-1 flex flex-col gap-2">
                        <label className="text-[#050F1C] text-sm font-bold">Second Party's Counsel</label>
                        <input
                          type="text"
                          value={formData.secondPartyCounsel}
                          onChange={(e) => handleInputChange('secondPartyCounsel', e.target.value)}
                          placeholder="Enter here"
                          className="h-12 px-4 py-3 rounded-lg border border-[#B1B9C6] text-[#525866] text-sm outline-none focus:border-[#022658]"
                        />
                      </div>
                      <div className="flex-1 flex flex-col gap-2">
                        <label className="text-[#050F1C] text-sm font-bold">Second Party's Counsel contact</label>
                        <input
                          type="text"
                          value={formData.secondPartyCounselContact}
                          onChange={(e) => handleInputChange('secondPartyCounselContact', e.target.value)}
                          placeholder="Enter here"
                          className="h-12 px-4 py-3 rounded-lg border border-[#B1B9C6] text-[#525866] text-sm outline-none focus:border-[#022658]"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Remarks Section */}
                  <div className="flex flex-col gap-2">
                    <span className="text-[#525866] text-sm">REMARKS</span>
                    <input
                      type="text"
                      value={formData.remarks}
                      onChange={(e) => handleInputChange('remarks', e.target.value)}
                      placeholder="Enter here"
                      className="h-12 px-4 py-3 rounded-lg border border-[#B1B9C6] text-[#525866] text-sm outline-none focus:border-[#022658]"
                    />
                  </div>

                  {/* Add Documents Section */}
                  <div className="flex flex-col gap-2">
                    <span className="text-[#525866] text-sm">ADD DOCUMENTS</span>
                    <div className="p-4 rounded-lg border border-[#B1B9C6] flex justify-between items-center">
                      <div className="flex flex-col items-center gap-3 w-full">
                        <div className="flex flex-col items-center gap-3">
                          <div className="w-10 h-10 rounded-full border-2 border-[#D4E1EA] flex items-center justify-center">
                            <Upload className="w-4 h-4 text-[#050F1C]" />
                          </div>
                          <span className="text-[#050F1C] text-sm">Browse & choose files you want to upload</span>
                          <div className="text-center">
                            <span className="text-[#525866] text-xs">Accepted formats: CSV, Excel (.xlsx, .xls) </span>
                            <span className="text-[#525866] text-[10px]">Max file size </span>
                            <span className="text-[#050F1C] text-[10px] font-medium">10MB</span>
                          </div>
                          <label className="cursor-pointer">
                            <div 
                              className="h-8 px-2.5 rounded-lg border-4 border-[#0F284726] text-white text-xs font-bold hover:opacity-90 transition-opacity flex items-center justify-center"
                              style={{ 
                                background: 'linear-gradient(180deg, #0F2847 43%, #1A4983 100%)', 
                                boxShadow: '0px 4px 4px rgba(5, 15, 28, 0.10)' 
                              }}
                            >
                              Upload here
                            </div>
                            <input
                              type="file"
                              multiple
                              accept=".csv,.xlsx,.xls"
                              onChange={handleFileUpload}
                              className="hidden"
                            />
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Bulk Upload Form */}
              {uploadType === 'bulk' && (
                <div className="flex flex-col gap-6">
                  {/* File Upload Area */}
                  <div className="p-4 rounded-lg border border-[#B1B9C6] flex justify-between items-center">
                    <div className="flex flex-col items-center gap-3 w-full">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-10 h-10 rounded-full border-2 border-[#D4E1EA] flex items-center justify-center">
                          <Upload className="w-4 h-4 text-[#050F1C]" />
                        </div>
                        <span className="text-[#050F1C] text-sm">Browse & choose files you want to upload</span>
                        <div className="text-center">
                          <span className="text-[#525866] text-xs">Accepted formats: CSV, Excel (.xlsx, .xls) </span>
                          <span className="text-[#525866] text-[10px]">Max file size </span>
                          <span className="text-[#050F1C] text-[10px] font-medium">10MB</span>
                        </div>
                        <label className="cursor-pointer">
                          <div 
                            className="h-8 px-2.5 rounded-lg border-4 border-[#0F284726] text-white text-xs font-bold hover:opacity-90 transition-opacity flex items-center justify-center"
                            style={{ 
                              background: 'linear-gradient(180deg, #0F2847 43%, #1A4983 100%)', 
                              boxShadow: '0px 4px 4px rgba(5, 15, 28, 0.10)' 
                            }}
                          >
                            Upload here
                          </div>
                          <input
                            type="file"
                            multiple
                            accept=".csv,.xlsx,.xls"
                            onChange={handleFileUpload}
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-10">
            <button
              onClick={handleCancel}
              className="flex-1 h-[58px] px-2.5 rounded-lg border-2 border-[#0F2847] text-[#022658] text-base font-bold hover:opacity-90 transition-opacity"
              style={{ boxShadow: '0px 4px 4px rgba(5, 15, 28, 0.10)' }}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex-1 h-[58px] px-2.5 rounded-lg border-4 border-[#0F284726] text-white text-base font-bold hover:opacity-90 transition-opacity"
              style={{ 
                background: 'linear-gradient(180deg, #022658 43%, #1A4983 100%)', 
                boxShadow: '0px 4px 4px rgba(5, 15, 28, 0.10)' 
              }}
            >
              {isEditMode ? 'Update Cause List' : 'Save and continue'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddCasesToCauseListPage;

