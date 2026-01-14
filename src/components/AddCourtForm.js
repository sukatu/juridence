import React, { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown, Bell, ChevronRight } from 'lucide-react';

const AddCourtForm = ({ registry, onBack, onSave, initialData = null, isEditMode = false }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const filterDropdownRef = useRef(null);

  // Form state
  const [formData, setFormData] = useState({
    courtName: initialData?.name || initialData?.courtName || '',
    division: initialData?.court_division || initialData?.division || '',
    location: initialData?.location || initialData?.address || '',
    status: initialData?.is_active !== false ? 'Active' : 'Inactive'
  });

  // Update form data when initialData changes
  useEffect(() => {
    if (initialData) {
      setFormData({
        courtName: initialData.name || initialData.courtName || '',
        division: initialData.court_division || initialData.division || '',
        location: initialData.location || initialData.address || '',
        status: initialData.is_active !== false ? 'Active' : 'Inactive'
      });
    }
  }, [initialData]);

  // Dropdown states
  const [showDivisionDropdown, setShowDivisionDropdown] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const divisionDropdownRef = useRef(null);
  const statusDropdownRef = useRef(null);

  // Handle click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterDropdownRef.current && !filterDropdownRef.current.contains(event.target)) {
        setShowFilterDropdown(false);
      }
      if (divisionDropdownRef.current && !divisionDropdownRef.current.contains(event.target)) {
        setShowDivisionDropdown(false);
      }
      if (statusDropdownRef.current && !statusDropdownRef.current.contains(event.target)) {
        setShowStatusDropdown(false);
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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSave) {
      onSave(formData);
    }
  };

  // Dropdown options
  const divisions = ['General', 'Commercial', 'Criminal', 'Family', 'Land', 'Probate'];
  const statuses = ['Active', 'Inactive', 'Under Maintenance'];

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
        <div className="flex flex-col bg-white pt-4 pb-[31px] px-3.5 gap-10 rounded-lg">
          <div className="flex flex-col items-start self-stretch gap-6">
            {/* Breadcrumb */}
            <div className="flex items-start gap-2">
              <button
                onClick={onBack}
                className="cursor-pointer hover:opacity-70"
              >
                <ChevronRight className="w-4 h-4 text-[#525866] rotate-180" />
              </button>
              <span className="text-[#525866] text-xs mr-1.5 whitespace-nowrap">COURT REGISTRY</span>
              <span className="text-[#525866] text-xs mr-1.5 whitespace-nowrap">/</span>
              <span className="text-[#525866] text-xs whitespace-nowrap">{registry?.name || 'Registry'}</span>
              <span className="text-[#525866] text-xs mr-1.5 whitespace-nowrap">/</span>
              <span className="text-[#070810] text-sm font-normal whitespace-nowrap">{isEditMode ? 'Edit Court' : 'Add New Court'}</span>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex flex-col items-start self-stretch gap-6">
              <div className="flex flex-col items-start self-stretch gap-6">
                {/* Row 1: Court name, Division */}
                <div className="flex items-start self-stretch gap-6">
                  <div className="flex flex-col items-start flex-1 gap-2">
                    <label className="text-[#050F1C] text-sm font-bold">Court name</label>
                    <input
                      type="text"
                      name="courtName"
                      value={formData.courtName}
                      onChange={handleInputChange}
                      placeholder="Enter court name"
                      required
                      className="w-full h-12 px-4 rounded-lg border border-[#B1B9C6] text-[#525866] text-sm font-normal outline-none focus:border-[#022658]"
                    />
                  </div>
                  <div className="flex flex-col items-start flex-1 gap-2">
                    <label className="text-[#050F1C] text-sm font-bold">Division</label>
                    <div className="relative w-full" ref={divisionDropdownRef}>
                      <div
                        onClick={() => setShowDivisionDropdown(!showDivisionDropdown)}
                        className="flex items-center justify-between h-12 px-4 rounded-lg border border-[#B1B9C6] cursor-pointer"
                      >
                        <span className="text-[#525866] text-sm font-normal">
                          {formData.division || 'Select'}
                        </span>
                        <ChevronDown className="w-4 h-4 text-[#050F1C]" />
                      </div>
                      {showDivisionDropdown && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#B1B9C6] rounded-lg shadow-lg z-10">
                          {divisions.map((division) => (
                            <div
                              key={division}
                              onClick={() => {
                                setFormData(prev => ({ ...prev, division }));
                                setShowDivisionDropdown(false);
                              }}
                              className="px-4 py-2 text-sm text-[#525866] hover:bg-gray-50 cursor-pointer"
                            >
                              {division}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Row 2: Location, Status */}
                <div className="flex items-start self-stretch gap-6">
                  <div className="flex flex-col items-start flex-1 gap-2">
                    <label className="text-[#050F1C] text-sm font-bold">Location</label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      placeholder="Enter location"
                      required
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
                          {formData.status || 'Select'}
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
                              {status}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center self-stretch gap-4 justify-end">
                <button
                  type="button"
                  onClick={onBack}
                  className="flex items-center justify-center bg-white text-[#525866] text-sm font-normal py-3 px-6 rounded-lg border border-solid border-[#D4E1EA] hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                  <button
                  type="submit"
                  className="flex items-center justify-center bg-[#022658] text-white text-sm font-bold py-3 px-6 rounded-lg hover:bg-[#033a7a] transition-colors"
                >
                  {isEditMode ? 'Update Court' : 'Save Court'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddCourtForm;

