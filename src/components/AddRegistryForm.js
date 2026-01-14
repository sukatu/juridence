import React, { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown, Bell, ChevronRight, X, Upload } from 'lucide-react';

const AddRegistryForm = ({ selectedCourt, onBack, onSave }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const filterDropdownRef = useRef(null);

  // Form state
  const [formData, setFormData] = useState({
    courtType: '',
    courtDivision: '',
    region: '',
    courtName: '',
    address: '',
    registryCode: '',
    registryContact: '',
    establishedDate: '',
    status: ''
  });

  // Upload states
  const [registrarUploadType, setRegistrarUploadType] = useState('bulk');
  const [judgeUploadType, setJudgeUploadType] = useState('bulk');
  const [showCourtTypeDropdown, setShowCourtTypeDropdown] = useState(false);
  const [showDivisionDropdown, setShowDivisionDropdown] = useState(false);
  const [showRegionDropdown, setShowRegionDropdown] = useState(false);
  const [showCourtNameDropdown, setShowCourtNameDropdown] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);

  const courtTypeDropdownRef = useRef(null);
  const divisionDropdownRef = useRef(null);
  const regionDropdownRef = useRef(null);
  const courtNameDropdownRef = useRef(null);
  const statusDropdownRef = useRef(null);

  // Handle click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterDropdownRef.current && !filterDropdownRef.current.contains(event.target)) {
        setShowFilterDropdown(false);
      }
      if (courtTypeDropdownRef.current && !courtTypeDropdownRef.current.contains(event.target)) {
        setShowCourtTypeDropdown(false);
      }
      if (divisionDropdownRef.current && !divisionDropdownRef.current.contains(event.target)) {
        setShowDivisionDropdown(false);
      }
      if (regionDropdownRef.current && !regionDropdownRef.current.contains(event.target)) {
        setShowRegionDropdown(false);
      }
      if (courtNameDropdownRef.current && !courtNameDropdownRef.current.contains(event.target)) {
        setShowCourtNameDropdown(false);
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

  // Sample dropdown options
  const courtTypes = ['Supreme Court', 'Court of Appeal', 'High Court', 'Circuit Court', 'District Court'];
  const divisions = ['General', 'Commercial', 'Criminal', 'Family', 'Land'];
  const regions = ['Greater Accra', 'Ashanti', 'Western', 'Eastern', 'Central', 'Northern', 'Upper East', 'Upper West', 'Volta', 'Brong Ahafo'];
  const statuses = ['Active', 'Inactive', 'Pending'];

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
    if (onBack) {
      onBack();
    }
  };

  return (
    <div className="bg-[#F7F8FA] min-h-screen">
      {/* Full Width Header */}
      <div className="w-full bg-white py-3.5 px-6 mb-4">
        <div className="flex justify-between items-center">
          <div className="flex justify-between items-center w-[700px] pr-2 rounded-lg border border-solid border-[#D4E1EA] bg-white">
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
            <Bell className="w-9 h-9 text-[#525866]" />
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
                <span className="text-[#040E1B] text-base font-bold whitespace-nowrap">
                  {userName}
                </span>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-[#525866] text-xs">Online</span>
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
              <span className="text-[#525866] text-xs mr-[5px] whitespace-nowrap">COURT REGISTRY</span>
              <ChevronRight className="w-4 h-4 text-[#525866] mr-1" />
              <span className="text-[#070810] text-sm font-normal whitespace-nowrap">Add new Court Registry</span>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex flex-col items-start self-stretch gap-6">
              <div className="flex flex-col items-start self-stretch gap-6">
                {/* Row 1: Court type, Court Division, Region */}
                <div className="flex items-start self-stretch gap-6">
                  {/* Court type */}
                  <div className="flex flex-col items-start flex-1 gap-2">
                    <label className="text-[#050F1C] text-sm font-bold">Court type</label>
                    <div className="relative w-full" ref={courtTypeDropdownRef}>
                      <div
                        onClick={() => setShowCourtTypeDropdown(!showCourtTypeDropdown)}
                        className="flex items-center justify-between h-12 px-4 rounded-lg border border-[#B1B9C6] cursor-pointer"
                      >
                        <span className="text-[#525866] text-sm font-normal">
                          {formData.courtType || 'Select'}
                        </span>
                        <ChevronDown className="w-4 h-4 text-[#050F1C]" />
                      </div>
                      {showCourtTypeDropdown && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#B1B9C6] rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
                          {courtTypes.map((type) => (
                            <div
                              key={type}
                              onClick={() => {
                                setFormData(prev => ({ ...prev, courtType: type }));
                                setShowCourtTypeDropdown(false);
                              }}
                              className="px-4 py-2 text-sm text-[#525866] hover:bg-gray-50 cursor-pointer"
                            >
                              {type}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Court Division */}
                  <div className="flex flex-col items-start flex-1 gap-2">
                    <label className="text-[#050F1C] text-sm font-bold">Court Division</label>
                    <div className="relative w-full" ref={divisionDropdownRef}>
                      <div
                        onClick={() => setShowDivisionDropdown(!showDivisionDropdown)}
                        className="flex items-center justify-between h-12 px-4 rounded-lg border border-[#B1B9C6] cursor-pointer"
                      >
                        <span className="text-[#525866] text-sm font-normal">
                          {formData.courtDivision || 'Select'}
                        </span>
                        <ChevronDown className="w-4 h-4 text-[#050F1C]" />
                      </div>
                      {showDivisionDropdown && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#B1B9C6] rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
                          {divisions.map((division) => (
                            <div
                              key={division}
                              onClick={() => {
                                setFormData(prev => ({ ...prev, courtDivision: division }));
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

                  {/* Region */}
                  <div className="flex flex-col items-start flex-1 gap-2">
                    <label className="text-[#050F1C] text-sm font-bold">Region</label>
                    <div className="relative w-full" ref={regionDropdownRef}>
                      <div
                        onClick={() => setShowRegionDropdown(!showRegionDropdown)}
                        className="flex items-center justify-between h-12 px-4 rounded-lg border border-[#B1B9C6] cursor-pointer"
                      >
                        <span className="text-[#525866] text-sm font-normal">
                          {formData.region || 'Select'}
                        </span>
                        <ChevronDown className="w-4 h-4 text-[#050F1C]" />
                      </div>
                      {showRegionDropdown && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#B1B9C6] rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
                          {regions.map((region) => (
                            <div
                              key={region}
                              onClick={() => {
                                setFormData(prev => ({ ...prev, region }));
                                setShowRegionDropdown(false);
                              }}
                              className="px-4 py-2 text-sm text-[#525866] hover:bg-gray-50 cursor-pointer"
                            >
                              {region}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Row 2: Court name, Address */}
                <div className="flex items-start self-stretch gap-6">
                  {/* Court name */}
                  <div className="flex flex-col items-start flex-1 gap-2">
                    <label className="text-[#050F1C] text-sm font-bold">Court name</label>
                    <div className="relative w-full" ref={courtNameDropdownRef}>
                      <div
                        onClick={() => setShowCourtNameDropdown(!showCourtNameDropdown)}
                        className="flex items-center justify-between h-12 px-4 rounded-lg border border-[#B1B9C6] cursor-pointer"
                      >
                        <span className="text-[#525866] text-sm font-normal">
                          {formData.courtName || 'Select'}
                        </span>
                        <ChevronDown className="w-4 h-4 text-[#050F1C]" />
                      </div>
                      {showCourtNameDropdown && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#B1B9C6] rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
                          {courtTypes.map((type) => (
                            <div
                              key={type}
                              onClick={() => {
                                setFormData(prev => ({ ...prev, courtName: type }));
                                setShowCourtNameDropdown(false);
                              }}
                              className="px-4 py-2 text-sm text-[#525866] hover:bg-gray-50 cursor-pointer"
                            >
                              {type}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Address */}
                  <div className="flex flex-col items-start flex-1 gap-2">
                    <label className="text-[#050F1C] text-sm font-bold">Address</label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      placeholder="Enter here"
                      className="w-full h-12 px-4 rounded-lg border border-[#B1B9C6] text-[#525866] text-sm font-normal outline-none focus:border-[#022658]"
                    />
                  </div>
                </div>

                {/* Row 3: Registry Code, Registry contact */}
                <div className="flex items-start self-stretch gap-6">
                  {/* Registry Code */}
                  <div className="flex flex-col items-start flex-1 gap-2">
                    <label className="text-[#050F1C] text-sm font-bold">Registry Code</label>
                    <input
                      type="text"
                      name="registryCode"
                      value={formData.registryCode}
                      onChange={handleInputChange}
                      placeholder="Enter here"
                      className="w-full h-12 px-4 rounded-lg border border-[#B1B9C6] text-[#525866] text-sm font-normal outline-none focus:border-[#022658]"
                    />
                  </div>

                  {/* Registry contact */}
                  <div className="flex flex-col items-start flex-1 gap-2">
                    <label className="text-[#050F1C] text-sm font-bold">Registry contact</label>
                    <input
                      type="text"
                      name="registryContact"
                      value={formData.registryContact}
                      onChange={handleInputChange}
                      placeholder="Enter here"
                      className="w-full h-12 px-4 rounded-lg border border-[#B1B9C6] text-[#525866] text-sm font-normal outline-none focus:border-[#022658]"
                    />
                  </div>
                </div>

                {/* Row 4: Established date, Status */}
                <div className="flex items-start self-stretch gap-6">
                  {/* Established date */}
                  <div className="flex flex-col items-start flex-1 gap-2">
                    <label className="text-[#050F1C] text-sm font-bold">Established date</label>
                    <input
                      type="date"
                      name="establishedDate"
                      value={formData.establishedDate}
                      onChange={handleInputChange}
                      placeholder="Enter here"
                      className="w-full h-12 px-4 rounded-lg border border-[#B1B9C6] text-[#525866] text-sm font-normal outline-none focus:border-[#022658]"
                    />
                  </div>

                  {/* Status */}
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

                {/* Add Registrar Section */}
                <div className="flex flex-col items-start self-stretch gap-6">
                  <div className="flex flex-col items-start self-stretch gap-3">
                    <span className="text-[#525866] text-sm font-normal">Add Registrar</span>
                    
                    {/* Radio buttons */}
                    <div className="flex items-start gap-6">
                      <div className="flex items-center gap-1">
                        <span className="text-[#050F1C] text-base font-normal">Manual upload</span>
                        <button
                          type="button"
                          onClick={() => setRegistrarUploadType('manual')}
                          className="w-6 h-6 rounded-full border-2 border-[#B1B9C6] flex items-center justify-center"
                        >
                          {registrarUploadType === 'manual' && (
                            <div className="w-3.5 h-3.5 rounded-full bg-[#022658]"></div>
                          )}
                        </button>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-[#050F1C] text-base font-normal">Bulk upload</span>
                        <button
                          type="button"
                          onClick={() => setRegistrarUploadType('bulk')}
                          className="w-6 h-6 rounded-full border-2 border-[#022658] flex items-center justify-center"
                        >
                          {registrarUploadType === 'bulk' && (
                            <div className="w-3.5 h-3.5 rounded-full bg-[#022658]"></div>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Upload area */}
                    <div className="flex flex-col items-center justify-center self-stretch p-4 gap-3 rounded-lg border border-[#B1B9C6]">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-10 h-10 rounded-full border-2 border-[#D4E1EA] flex items-center justify-center">
                          <Upload className="w-4 h-4 text-[#050F1C]" />
                        </div>
                        <span className="text-[#050F1C] text-sm font-normal">Browse & choose files you want to upload</span>
                        <div className="text-center">
                          <span className="text-[#525866] text-xs font-normal">Accepted formats: CSV, Excel (.xlsx, .xls) </span>
                          <span className="text-[#525866] text-[10px] font-normal">Max file size </span>
                          <span className="text-[#050F1C] text-[10px] font-medium">10MB</span>
                        </div>
                        <button
                          type="button"
                          className="h-8 px-2.5 rounded-lg border-4 border-[#0F284726] text-white text-xs font-bold"
                          style={{ background: 'linear-gradient(180deg, #0F2847 43%, #1A4983 100%)', boxShadow: '0px 4px 4px rgba(5, 15, 28, 0.10)' }}
                        >
                          Upload here
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Add Judge Section */}
                <div className="flex flex-col items-start self-stretch gap-6">
                  <div className="flex flex-col items-start self-stretch gap-3">
                    <span className="text-[#525866] text-sm font-normal">Add Judge</span>
                    
                    {/* Radio buttons */}
                    <div className="flex items-start gap-6">
                      <div className="flex items-center gap-1">
                        <span className="text-[#050F1C] text-base font-normal">Manual upload</span>
                        <button
                          type="button"
                          onClick={() => setJudgeUploadType('manual')}
                          className="w-6 h-6 rounded-full border-2 border-[#B1B9C6] flex items-center justify-center"
                        >
                          {judgeUploadType === 'manual' && (
                            <div className="w-3.5 h-3.5 rounded-full bg-[#022658]"></div>
                          )}
                        </button>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-[#050F1C] text-base font-normal">Bulk upload</span>
                        <button
                          type="button"
                          onClick={() => setJudgeUploadType('bulk')}
                          className="w-6 h-6 rounded-full border-2 border-[#022658] flex items-center justify-center"
                        >
                          {judgeUploadType === 'bulk' && (
                            <div className="w-3.5 h-3.5 rounded-full bg-[#022658]"></div>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Upload area */}
                    <div className="flex flex-col items-center justify-center self-stretch p-4 gap-3 rounded-lg border border-[#B1B9C6]">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-10 h-10 rounded-full border-2 border-[#D4E1EA] flex items-center justify-center">
                          <Upload className="w-4 h-4 text-[#050F1C]" />
                        </div>
                        <span className="text-[#050F1C] text-sm font-normal">Browse & choose files you want to upload</span>
                        <div className="text-center">
                          <span className="text-[#525866] text-xs font-normal">Accepted formats: CSV, Excel (.xlsx, .xls) </span>
                          <span className="text-[#525866] text-[10px] font-normal">Max file size </span>
                          <span className="text-[#050F1C] text-[10px] font-medium">10MB</span>
                        </div>
                        <button
                          type="button"
                          className="h-8 px-2.5 rounded-lg border-4 border-[#0F284726] text-white text-xs font-bold"
                          style={{ background: 'linear-gradient(180deg, #0F2847 43%, #1A4983 100%)', boxShadow: '0px 4px 4px rgba(5, 15, 28, 0.10)' }}
                        >
                          Upload here
                        </button>
                      </div>
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
                  Save Registry
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddRegistryForm;

