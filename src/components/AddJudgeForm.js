import React, { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown, Bell, ChevronRight } from 'lucide-react';

const AddJudgeForm = ({ onBack, onSave, initialData, isEditMode }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [uploadType, setUploadType] = useState('manual');
  const filterDropdownRef = useRef(null);

  // Helper function to format date for input
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

  // Helper function to parse contact info
  const parseContactInfo = (contactInfo) => {
    if (!contactInfo) return { email: '', phoneNumber: '', chamberAddress: '', assistantName: '', assistantEmail: '' };
    try {
      if (typeof contactInfo === 'string') {
        return JSON.parse(contactInfo);
      }
      return contactInfo;
    } catch (e) {
      return { email: '', phoneNumber: '', chamberAddress: '', assistantName: '', assistantEmail: '' };
    }
  };

  // Helper function to parse schools attended
  const parseSchools = (schools) => {
    if (!schools || !Array.isArray(schools)) return { education1: '', education2: '', education3: '' };
    const result = { education1: '', education2: '', education3: '' };
    schools.forEach((school, index) => {
      if (index < 3) {
        const key = `education${index + 1}`;
        result[key] = school?.degree || school || '';
      }
    });
    return result;
  };

  // Initialize form data
  const getInitialFormData = () => {
    if (isEditMode && initialData) {
      const contactInfo = parseContactInfo(initialData.contact_info);
      const schools = parseSchools(initialData.schools_attended);
      
      return {
        judgeName: initialData.name || '',
        judgeID: initialData.id ? `JUD_${String(initialData.id).padStart(5, '0')}` : '',
        gender: initialData.gender || '',
        appointmentDate: formatDateForInput(initialData.appointment_date),
        dateOfBirth: formatDateForInput(initialData.date_of_birth),
        status: initialData.status || 'active',
        title: initialData.title || '',
        email: contactInfo.email || '',
        phoneNumber: contactInfo.phone || contactInfo.phoneNumber || '',
        chamberAddress: contactInfo.chamber_address || contactInfo.chamberAddress || '',
        assistantName: contactInfo.assistant_name || contactInfo.assistantName || '',
        assistantEmail: contactInfo.assistant_email || contactInfo.assistantEmail || '',
        legalBackground: initialData.specializations || '',
        yearsOfExperience: '', // Not in API schema
        barMembershipID: '', // Not in API schema
        education1: schools.education1 || '',
        education2: schools.education2 || '',
        education3: schools.education3 || '',
        bio: initialData.bio || '',
        cases: [{
          caseNumber: '',
          caseTitle: '',
          roleInCase: ''
        }]
      };
    }
    
    return {
      judgeName: '',
      judgeID: '',
      gender: '',
      appointmentDate: '',
      dateOfBirth: '',
      status: 'active',
      title: '',
      email: '',
      phoneNumber: '',
      chamberAddress: '',
      assistantName: '',
      assistantEmail: '',
      legalBackground: '',
      yearsOfExperience: '',
      barMembershipID: '',
      education1: '',
      education2: '',
      education3: '',
      bio: '',
      cases: [{
        caseNumber: '',
        caseTitle: '',
        roleInCase: ''
      }]
    };
  };

  // Form state
  const [formData, setFormData] = useState(getInitialFormData());

  // Dropdown states
  const [showGenderDropdown, setShowGenderDropdown] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showTitleDropdown, setShowTitleDropdown] = useState(false);
  const [showLegalBackgroundDropdown, setShowLegalBackgroundDropdown] = useState(false);
  const [showEducationDropdowns, setShowEducationDropdowns] = useState({ 1: false, 2: false, 3: false });
  const [showRoleDropdowns, setShowRoleDropdowns] = useState({});

  const genderDropdownRef = useRef(null);
  const statusDropdownRef = useRef(null);
  const titleDropdownRef = useRef(null);
  const legalBackgroundDropdownRef = useRef(null);
  const education1Ref = useRef(null);
  const education2Ref = useRef(null);
  const education3Ref = useRef(null);

  // Handle click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterDropdownRef.current && !filterDropdownRef.current.contains(event.target)) {
        setShowFilterDropdown(false);
      }
      if (genderDropdownRef.current && !genderDropdownRef.current.contains(event.target)) {
        setShowGenderDropdown(false);
      }
      if (statusDropdownRef.current && !statusDropdownRef.current.contains(event.target)) {
        setShowStatusDropdown(false);
      }
      if (titleDropdownRef.current && !titleDropdownRef.current.contains(event.target)) {
        setShowTitleDropdown(false);
      }
      if (legalBackgroundDropdownRef.current && !legalBackgroundDropdownRef.current.contains(event.target)) {
        setShowLegalBackgroundDropdown(false);
      }
      if (education1Ref.current && !education1Ref.current.contains(event.target)) {
        setShowEducationDropdowns(prev => ({ ...prev, 1: false }));
      }
      if (education2Ref.current && !education2Ref.current.contains(event.target)) {
        setShowEducationDropdowns(prev => ({ ...prev, 2: false }));
      }
      if (education3Ref.current && !education3Ref.current.contains(event.target)) {
        setShowEducationDropdowns(prev => ({ ...prev, 3: false }));
      }
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCaseChange = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      cases: prev.cases.map((caseItem, i) => 
        i === index ? { ...caseItem, [field]: value } : caseItem
      )
    }));
  };

  const addAnotherCase = () => {
    setFormData(prev => ({
      ...prev,
      cases: [...prev.cases, { caseNumber: '', caseTitle: '', roleInCase: '' }]
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSave) {
      onSave(formData);
    }
  };

  // Dropdown options
  const genders = ['Male', 'Female', 'Other'];
  const titles = ['Justice', 'Judge', 'Chief Justice', 'Senior Judge'];
  const statuses = ['active', 'retired', 'deceased', 'suspended', 'special_prosecutor'];
  const legalBackgrounds = ['Criminal Law', 'Civil Law', 'Commercial Law', 'Constitutional Law', 'Family Law'];
  const educations = ['LLB', 'LLM', 'JD', 'PhD in Law', 'Barrister at Law'];
  const roles = ['Presiding Judge', 'Associate Judge', 'Court Clerk', 'Court Reporter'];

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
        <div className="flex flex-col bg-white p-4 gap-10 rounded-lg">
          <div className="flex flex-col items-start self-stretch gap-6">
            {/* Breadcrumb */}
            <div className="flex items-center gap-1">
              <button
                onClick={onBack}
                className="cursor-pointer hover:opacity-70"
              >
                <ChevronRight className="w-4 h-4 text-[#050F1C] rotate-180" />
              </button>
              <span className="text-[#525866] text-xs opacity-75 mr-1 whitespace-nowrap">COURT REGISTRY</span>
              <ChevronRight className="w-4 h-4 text-[#525866] mr-1" />
              <span className="text-[#070810] text-sm font-normal whitespace-nowrap">
                {isEditMode ? 'Edit Judge' : 'Add New Judge'}
              </span>
            </div>

            {/* Manual/Bulk Upload Toggle */}
            <div className="flex items-start gap-6">
              <div className="flex items-center gap-1">
                <span className="text-[#050F1C] text-base font-normal">Manual upload</span>
                <button
                  type="button"
                  onClick={() => setUploadType('manual')}
                  className="w-6 h-6 rounded-full border-2 border-[#022658] flex items-center justify-center"
                >
                  {uploadType === 'manual' && (
                    <div className="w-3.5 h-3.5 rounded-full bg-[#022658]"></div>
                  )}
                </button>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-[#050F1C] text-base font-normal">Bulk upload</span>
                <button
                  type="button"
                  onClick={() => setUploadType('bulk')}
                  className="w-6 h-6 rounded-full border-2 border-[#B1B9C6] flex items-center justify-center"
                >
                  {uploadType === 'bulk' && (
                    <div className="w-3.5 h-3.5 rounded-full bg-[#B1B9C6]"></div>
                  )}
                </button>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex flex-col items-start self-stretch gap-6">
              {/* Add Judge Section */}
              <div className="flex flex-col items-start self-stretch gap-6">
                <span className="text-[#525866] text-sm font-normal">{isEditMode ? 'Edit Judge' : 'Add Judge'}</span>
                
                <div className="flex flex-col items-start self-stretch gap-3">
                  {/* Row 1: Judge name, Judge ID, Gender */}
                  <div className="flex items-start self-stretch gap-6">
                    <div className="flex flex-col items-start flex-1 gap-2">
                      <label className="text-[#050F1C] text-sm font-bold">Judge name</label>
                      <input
                        type="text"
                        name="judgeName"
                        value={formData.judgeName}
                        onChange={handleInputChange}
                        placeholder="Enter here"
                        className="w-full h-12 px-4 rounded-lg border border-[#B1B9C6] text-[#525866] text-sm font-normal outline-none focus:border-[#022658]"
                      />
                    </div>
                    <div className="flex flex-col items-start flex-1 gap-2">
                      <label className="text-[#050F1C] text-sm font-bold">Judge ID</label>
                      <input
                        type="text"
                        name="judgeID"
                        value={formData.judgeID}
                        onChange={handleInputChange}
                        placeholder="Enter here"
                        className="w-full h-12 px-4 rounded-lg border border-[#B1B9C6] text-[#525866] text-sm font-normal outline-none focus:border-[#022658]"
                      />
                    </div>
                    <div className="flex flex-col items-start flex-1 gap-2">
                      <label className="text-[#050F1C] text-sm font-bold">Gender</label>
                      <div className="relative w-full" ref={genderDropdownRef}>
                        <div
                          onClick={() => setShowGenderDropdown(!showGenderDropdown)}
                          className="flex items-center justify-between h-12 px-4 rounded-lg border border-[#B1B9C6] cursor-pointer"
                        >
                          <span className="text-[#525866] text-sm font-normal">
                            {formData.gender || 'Select'}
                          </span>
                          <ChevronDown className="w-4 h-4 text-[#050F1C]" />
                        </div>
                        {showGenderDropdown && (
                          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#B1B9C6] rounded-lg shadow-lg z-10">
                            {genders.map((gender) => (
                              <div
                                key={gender}
                                onClick={() => {
                                  setFormData(prev => ({ ...prev, gender }));
                                  setShowGenderDropdown(false);
                                }}
                                className="px-4 py-2 text-sm text-[#525866] hover:bg-gray-50 cursor-pointer"
                              >
                                {gender}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Row 2: Appointment date, Date of birth, Status */}
                  <div className="flex items-start self-stretch gap-6">
                    <div className="flex flex-col items-start flex-1 gap-2">
                      <label className="text-[#050F1C] text-sm font-bold">Appointment date</label>
                      <input
                        type="date"
                        name="appointmentDate"
                        value={formData.appointmentDate}
                        onChange={handleInputChange}
                        placeholder="Enter here"
                        className="w-full h-12 px-4 rounded-lg border border-[#B1B9C6] text-[#525866] text-sm font-normal outline-none focus:border-[#022658]"
                      />
                    </div>
                    <div className="flex flex-col items-start flex-1 gap-2">
                      <label className="text-[#050F1C] text-sm font-bold">Date of birth</label>
                      <input
                        type="date"
                        name="dateOfBirth"
                        value={formData.dateOfBirth}
                        onChange={handleInputChange}
                        placeholder="Enter here"
                        className="w-full h-12 px-4 rounded-lg border border-[#B1B9C6] text-[#525866] text-sm font-normal outline-none focus:border-[#022658]"
                      />
                    </div>
                    <div className="flex flex-col items-start flex-1 gap-2">
                      <label className="text-[#050F1C] text-sm font-bold">Status</label>
                      <div className="relative w-full" ref={statusDropdownRef}>
                        <div
                          onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                          className="flex items-center justify-between h-12 px-4 rounded-lg border border-[#B1B9C6] cursor-pointer"
                        >
                          <span className="text-[#525866] text-sm font-normal">
                            {formData.status ? formData.status.charAt(0).toUpperCase() + formData.status.slice(1).replace('_', ' ') : 'Select'}
                          </span>
                          <ChevronDown className="w-4 h-4 text-[#050F1C]" />
                        </div>
                        {showStatusDropdown && (
                          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#B1B9C6] rounded-lg shadow-lg z-10">
                            {statuses.map((status) => (
                              <div
                                key={status}
                                onClick={() => {
                                  setFormData(prev => ({ ...prev, status }));
                                  setShowStatusDropdown(false);
                                }}
                                className="px-4 py-2 text-sm text-[#525866] hover:bg-gray-50 cursor-pointer"
                              >
                                {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Row 3: Title, Email, Phone number */}
                  <div className="flex items-start self-stretch gap-6">
                    <div className="flex flex-col items-start flex-1 gap-2">
                      <label className="text-[#050F1C] text-sm font-bold">Title</label>
                      <div className="relative w-full" ref={titleDropdownRef}>
                        <div
                          onClick={() => setShowTitleDropdown(!showTitleDropdown)}
                          className="flex items-center justify-between h-12 px-4 rounded-lg border border-[#B1B9C6] cursor-pointer"
                        >
                          <span className="text-[#525866] text-sm font-normal">
                            {formData.title || 'Select'}
                          </span>
                          <ChevronDown className="w-4 h-4 text-[#050F1C]" />
                        </div>
                        {showTitleDropdown && (
                          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#B1B9C6] rounded-lg shadow-lg z-10">
                            {titles.map((title) => (
                              <div
                                key={title}
                                onClick={() => {
                                  setFormData(prev => ({ ...prev, title }));
                                  setShowTitleDropdown(false);
                                }}
                                className="px-4 py-2 text-sm text-[#525866] hover:bg-gray-50 cursor-pointer"
                              >
                                {title}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-start flex-1 gap-2">
                      <label className="text-[#050F1C] text-sm font-bold">Email</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="Enter here"
                        className="w-full h-12 px-4 rounded-lg border border-[#B1B9C6] text-[#525866] text-sm font-normal outline-none focus:border-[#022658]"
                      />
                    </div>
                    <div className="flex flex-col items-start flex-1 gap-2">
                      <label className="text-[#050F1C] text-sm font-bold">Phone number</label>
                      <input
                        type="tel"
                        name="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={handleInputChange}
                        placeholder="Enter here"
                        className="w-full h-12 px-4 rounded-lg border border-[#B1B9C6] text-[#525866] text-sm font-normal outline-none focus:border-[#022658]"
                      />
                    </div>
                  </div>

                  {/* Row 4: Chamber address, Assistant's name, Assistant's email */}
                  <div className="flex items-start self-stretch gap-6">
                    <div className="flex flex-col items-start flex-1 gap-2">
                      <label className="text-[#050F1C] text-sm font-bold">Chamber address</label>
                      <input
                        type="text"
                        name="chamberAddress"
                        value={formData.chamberAddress}
                        onChange={handleInputChange}
                        placeholder="Enter here"
                        className="w-full h-12 px-4 rounded-lg border border-[#B1B9C6] text-[#525866] text-sm font-normal outline-none focus:border-[#022658]"
                      />
                    </div>
                    <div className="flex flex-col items-start flex-1 gap-2">
                      <label className="text-[#050F1C] text-sm font-bold">Assistant's name</label>
                      <input
                        type="text"
                        name="assistantName"
                        value={formData.assistantName}
                        onChange={handleInputChange}
                        placeholder="Enter here"
                        className="w-full h-12 px-4 rounded-lg border border-[#B1B9C6] text-[#525866] text-sm font-normal outline-none focus:border-[#022658]"
                      />
                    </div>
                    <div className="flex flex-col items-start flex-1 gap-2">
                      <label className="text-[#050F1C] text-sm font-bold">Assistant's email</label>
                      <input
                        type="email"
                        name="assistantEmail"
                        value={formData.assistantEmail}
                        onChange={handleInputChange}
                        placeholder="Enter here"
                        className="w-full h-12 px-4 rounded-lg border border-[#B1B9C6] text-[#525866] text-sm font-normal outline-none focus:border-[#022658]"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Professional Background Section */}
              <div className="flex flex-col items-start self-stretch gap-6">
                <span className="text-[#525866] text-sm font-normal">Professional Background</span>
                
                <div className="flex flex-col items-start self-stretch gap-3">
                  {/* Row 1: Legal background, Years of experience, Bar Membership ID */}
                  <div className="flex items-start self-stretch gap-6">
                    <div className="flex flex-col items-start flex-1 gap-2">
                      <label className="text-[#050F1C] text-sm font-bold">Legal background</label>
                      <div className="relative w-full" ref={legalBackgroundDropdownRef}>
                        <div
                          onClick={() => setShowLegalBackgroundDropdown(!showLegalBackgroundDropdown)}
                          className="flex items-center justify-between h-12 px-4 rounded-lg border border-[#B1B9C6] cursor-pointer"
                        >
                          <span className="text-[#525866] text-sm font-normal">
                            {formData.legalBackground || 'Select'}
                          </span>
                          <ChevronDown className="w-4 h-4 text-[#050F1C]" />
                        </div>
                        {showLegalBackgroundDropdown && (
                          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#B1B9C6] rounded-lg shadow-lg z-10">
                            {legalBackgrounds.map((bg) => (
                              <div
                                key={bg}
                                onClick={() => {
                                  setFormData(prev => ({ ...prev, legalBackground: bg }));
                                  setShowLegalBackgroundDropdown(false);
                                }}
                                className="px-4 py-2 text-sm text-[#525866] hover:bg-gray-50 cursor-pointer"
                              >
                                {bg}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-start flex-1 gap-2">
                      <label className="text-[#050F1C] text-sm font-bold">Years of experience</label>
                      <input
                        type="number"
                        name="yearsOfExperience"
                        value={formData.yearsOfExperience}
                        onChange={handleInputChange}
                        placeholder="Enter here"
                        className="w-full h-12 px-4 rounded-lg border border-[#B1B9C6] text-[#525866] text-sm font-normal outline-none focus:border-[#022658]"
                      />
                    </div>
                    <div className="flex flex-col items-start flex-1 gap-2">
                      <label className="text-[#050F1C] text-sm font-bold">Bar Membership ID</label>
                      <input
                        type="text"
                        name="barMembershipID"
                        value={formData.barMembershipID}
                        onChange={handleInputChange}
                        placeholder="Enter here"
                        className="w-full h-12 px-4 rounded-lg border border-[#B1B9C6] text-[#525866] text-sm font-normal outline-none focus:border-[#022658]"
                      />
                    </div>
                  </div>

                  {/* Row 2: Three Education dropdowns */}
                  <div className="flex items-start self-stretch gap-6">
                    <div className="flex flex-col items-start flex-1 gap-2">
                      <label className="text-[#050F1C] text-sm font-bold">Education</label>
                      <div className="relative w-full" ref={education1Ref}>
                        <div
                          onClick={() => setShowEducationDropdowns(prev => ({ ...prev, 1: !prev[1] }))}
                          className="flex items-center justify-between h-12 px-4 rounded-lg border border-[#B1B9C6] cursor-pointer"
                        >
                          <span className="text-[#525866] text-sm font-normal">
                            {formData.education1 || 'Select'}
                          </span>
                          <ChevronDown className="w-4 h-4 text-[#050F1C]" />
                        </div>
                        {showEducationDropdowns[1] && (
                          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#B1B9C6] rounded-lg shadow-lg z-10">
                            {educations.map((edu) => (
                              <div
                                key={edu}
                                onClick={() => {
                                  setFormData(prev => ({ ...prev, education1: edu }));
                                  setShowEducationDropdowns(prev => ({ ...prev, 1: false }));
                                }}
                                className="px-4 py-2 text-sm text-[#525866] hover:bg-gray-50 cursor-pointer"
                              >
                                {edu}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-start flex-1 gap-2">
                      <label className="text-[#050F1C] text-sm font-bold">Education</label>
                      <div className="relative w-full" ref={education2Ref}>
                        <div
                          onClick={() => setShowEducationDropdowns(prev => ({ ...prev, 2: !prev[2] }))}
                          className="flex items-center justify-between h-12 px-4 rounded-lg border border-[#B1B9C6] cursor-pointer"
                        >
                          <span className="text-[#525866] text-sm font-normal">
                            {formData.education2 || 'Select'}
                          </span>
                          <ChevronDown className="w-4 h-4 text-[#050F1C]" />
                        </div>
                        {showEducationDropdowns[2] && (
                          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#B1B9C6] rounded-lg shadow-lg z-10">
                            {educations.map((edu) => (
                              <div
                                key={edu}
                                onClick={() => {
                                  setFormData(prev => ({ ...prev, education2: edu }));
                                  setShowEducationDropdowns(prev => ({ ...prev, 2: false }));
                                }}
                                className="px-4 py-2 text-sm text-[#525866] hover:bg-gray-50 cursor-pointer"
                              >
                                {edu}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-start flex-1 gap-2">
                      <label className="text-[#050F1C] text-sm font-bold">Education</label>
                      <div className="relative w-full" ref={education3Ref}>
                        <div
                          onClick={() => setShowEducationDropdowns(prev => ({ ...prev, 3: !prev[3] }))}
                          className="flex items-center justify-between h-12 px-4 rounded-lg border border-[#B1B9C6] cursor-pointer"
                        >
                          <span className="text-[#525866] text-sm font-normal">
                            {formData.education3 || 'Select'}
                          </span>
                          <ChevronDown className="w-4 h-4 text-[#050F1C]" />
                        </div>
                        {showEducationDropdowns[3] && (
                          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#B1B9C6] rounded-lg shadow-lg z-10">
                            {educations.map((edu) => (
                              <div
                                key={edu}
                                onClick={() => {
                                  setFormData(prev => ({ ...prev, education3: edu }));
                                  setShowEducationDropdowns(prev => ({ ...prev, 3: false }));
                                }}
                                className="px-4 py-2 text-sm text-[#525866] hover:bg-gray-50 cursor-pointer"
                              >
                                {edu}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Link to existing Case Section */}
              <div className="flex flex-col items-start self-stretch gap-2">
                <div className="flex items-center justify-between self-stretch">
                  <span className="text-[#525866] text-sm font-normal">Link to existing Case</span>
                  <button
                    type="button"
                    className="text-[#F59E0B] text-xs font-bold hover:underline"
                  >
                    Search existing case
                  </button>
                </div>
                
                <div className="flex flex-col items-start self-stretch gap-3">
                  {formData.cases.map((caseItem, index) => (
                    <div key={index} className="flex items-start self-stretch gap-6">
                      <div className="flex flex-col items-start flex-1 gap-2">
                        <label className="text-[#050F1C] text-sm font-bold">Case number</label>
                        <input
                          type="text"
                          value={caseItem.caseNumber}
                          onChange={(e) => handleCaseChange(index, 'caseNumber', e.target.value)}
                          placeholder="Enter here"
                          className="w-full h-12 px-4 rounded-lg border border-[#B1B9C6] text-[#525866] text-sm font-normal outline-none focus:border-[#022658]"
                        />
                      </div>
                      <div className="flex flex-col items-start flex-1 gap-2">
                        <label className="text-[#050F1C] text-sm font-bold">Case title</label>
                        <input
                          type="text"
                          value={caseItem.caseTitle}
                          onChange={(e) => handleCaseChange(index, 'caseTitle', e.target.value)}
                          placeholder="Enter here"
                          className="w-full h-12 px-4 rounded-lg border border-[#B1B9C6] text-[#525866] text-sm font-normal outline-none focus:border-[#022658]"
                        />
                      </div>
                      <div className="flex flex-col items-start flex-1 gap-2">
                        <label className="text-[#050F1C] text-sm font-bold">Role in case</label>
                        <div className="relative w-full">
                          <div
                            onClick={() => setShowRoleDropdowns(prev => ({ ...prev, [index]: !prev[index] }))}
                            className="flex items-center justify-between h-12 px-4 rounded-lg border border-[#B1B9C6] cursor-pointer"
                          >
                            <span className="text-[#525866] text-sm font-normal">
                              {caseItem.roleInCase || 'Choose role'}
                            </span>
                            <ChevronDown className="w-4 h-4 text-[#050F1C]" />
                          </div>
                          {showRoleDropdowns[index] && (
                            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#B1B9C6] rounded-lg shadow-lg z-10">
                              {roles.map((role) => (
                                <div
                                  key={role}
                                  onClick={() => {
                                    handleCaseChange(index, 'roleInCase', role);
                                    setShowRoleDropdowns(prev => ({ ...prev, [index]: false }));
                                  }}
                                  className="px-4 py-2 text-sm text-[#525866] hover:bg-gray-50 cursor-pointer"
                                >
                                  {role}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addAnotherCase}
                    className="text-[#F59E0B] text-xs font-bold hover:underline"
                  >
                    Add another case
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center self-stretch gap-10">
                <button
                  type="button"
                  className="flex-1 h-[58px] px-2.5 rounded-lg border-2 border-[#0F2847] text-[#022658] text-base font-bold hover:bg-gray-50 transition-colors"
                  style={{ boxShadow: '0px 4px 4px rgba(5, 15, 28, 0.10)' }}
                >
                  Add another Judge
                </button>
                  <button
                    type="submit"
                    className="flex-1 h-[58px] px-2.5 rounded-lg border-4 border-[#0F284726] text-white text-base font-bold hover:opacity-90 transition-opacity"
                    style={{ 
                      background: 'linear-gradient(180deg, #022658 43%, #1A4983 100%)', 
                      boxShadow: '0px 4px 4px rgba(5, 15, 28, 0.10)' 
                    }}
                  >
                    {isEditMode ? 'Update Judge' : 'Save and continue'}
                  </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddJudgeForm;

