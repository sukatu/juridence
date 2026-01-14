import React, { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown, Bell, ChevronRight, Edit, Trash2 } from 'lucide-react';
import AddCourtForm from './AddCourtForm';
import { apiGet, apiPost, apiPut, apiDelete } from '../utils/api';
import ConfirmDialog from './admin/ConfirmDialog';

const RegistryCourtsView = ({ registry, onBack }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [showAddCourtForm, setShowAddCourtForm] = useState(false);
  const [courtSearchQuery, setCourtSearchQuery] = useState('');
  const [courts, setCourts] = useState([]);
  const [loadingCourts, setLoadingCourts] = useState(false);
  const [editingCourt, setEditingCourt] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [courtToDelete, setCourtToDelete] = useState(null);
  const filterDropdownRef = useRef(null);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterDropdownRef.current && !filterDropdownRef.current.contains(event.target)) {
        setShowFilterDropdown(false);
      }
    };

    if (showFilterDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showFilterDropdown]);

  const userInfo = JSON.parse(localStorage.getItem('userData') || '{}');
  const userName = userInfo?.first_name && userInfo?.last_name 
    ? `${userInfo.first_name} ${userInfo.last_name}` 
    : 'Ben Frimpong';

  // Fetch courts when component mounts or registry changes
  useEffect(() => {
    const fetchCourts = async () => {
      if (!registry) return;

      try {
        setLoadingCourts(true);
        // Fetch courts filtered by registry_name using search query
        // First try searching by registry_name, then filter results
        const response = await apiGet(`/courts/search?query=${encodeURIComponent(registry.name)}&limit=100`);
        
        if (response && response.courts && Array.isArray(response.courts)) {
          // Filter courts that match the registry name
          const filtered = response.courts.filter(court => 
            court.registry_name === registry.name || 
            court.name?.toLowerCase().includes(registry.name.toLowerCase())
          );
          setCourts(filtered);
        } else {
          setCourts([]);
        }
      } catch (err) {
        console.error('Error fetching courts:', err);
        setCourts([]);
      } finally {
        setLoadingCourts(false);
      }
    };

    fetchCourts();
  }, [registry]);

  // Filter courts based on search query
  const filteredCourts = courts.filter(court => {
    if (!courtSearchQuery.trim()) return true;
    
    const query = courtSearchQuery.toLowerCase();
    return (
      (court.name && court.name.toLowerCase().includes(query)) ||
      (court.registry_name && court.registry_name.toLowerCase().includes(query)) ||
      (court.location && court.location.toLowerCase().includes(query)) ||
      (court.region && court.region.toLowerCase().includes(query)) ||
      (court.court_division && court.court_division.toLowerCase().includes(query))
    );
  });

  const handleSaveCourt = async (formData) => {
    try {
      // Check if user is authenticated
      const token = localStorage.getItem('accessToken');
      if (!token) {
        alert('You must be logged in to save a court. Please log in and try again.');
        return;
      }

      // Prepare court data for API
      const courtData = {
        name: formData.name || formData.courtName,
        registry_name: registry?.name || formData.registry_name,
        court_type: registry?.court_type || formData.court_type || 'High Court',
        region: formData.region || registry?.region || 'Greater Accra',
        location: formData.location || formData.address || '',
        address: formData.address || formData.location || '',
        city: formData.city || '',
        district: formData.district || '',
        court_division: formData.division || formData.court_division || '',
        is_active: formData.status === 'Active'
      };

      if (editingCourt && editingCourt.id) {
        // Update existing court
        await apiPut(`/courts/${editingCourt.id}`, courtData);
      } else {
        // Create new court
        await apiPost('/courts/', courtData);
      }

      // Refresh courts list
      const response = await apiGet(`/courts/search?query=${encodeURIComponent(registry.name)}&limit=100`);
      if (response && response.courts) {
        const filtered = response.courts.filter(court => 
          court.registry_name === registry.name || 
          court.name?.toLowerCase().includes(registry.name.toLowerCase())
        );
        setCourts(filtered);
      }

    setShowAddCourtForm(false);
      setEditingCourt(null);
    } catch (err) {
      console.error('Error saving court:', err);
      let errorMessage = 'Failed to save court.';
      
      if (err.status === 403 || (err.detail && err.detail.includes('Admin access required'))) {
        errorMessage = 'Admin access required. You must be logged in as an administrator to create or update courts.';
      } else if (err.status === 401) {
        errorMessage = 'Authentication required. Please log in and try again.';
      } else if (err.detail) {
        errorMessage = err.detail;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      alert(`Error saving court: ${errorMessage}`);
    }
  };

  const handleEditCourt = (court) => {
    setEditingCourt(court);
    setShowAddCourtForm(true);
  };

  const handleDeleteCourt = (court) => {
    setCourtToDelete(court);
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (!courtToDelete || !courtToDelete.id) {
      setShowDeleteConfirm(false);
      setCourtToDelete(null);
      return;
    }

    try {
      // Check if user is authenticated
      const token = localStorage.getItem('accessToken');
      if (!token) {
        alert('You must be logged in to delete a court. Please log in and try again.');
        setShowDeleteConfirm(false);
        setCourtToDelete(null);
        return;
      }

      await apiDelete(`/courts/${courtToDelete.id}`);
      
      // Refresh courts list
      const response = await apiGet(`/courts/search?query=${encodeURIComponent(registry.name)}&limit=100`);
      if (response && response.courts) {
        const filtered = response.courts.filter(court => 
          court.registry_name === registry.name || 
          court.name?.toLowerCase().includes(registry.name.toLowerCase())
        );
        setCourts(filtered);
      }

      setShowDeleteConfirm(false);
      setCourtToDelete(null);
    } catch (err) {
      console.error('Error deleting court:', err);
      let errorMessage = 'Failed to delete court.';
      
      if (err.status === 403 || (err.detail && err.detail.includes('Admin access required'))) {
        errorMessage = 'Admin access required. You must be logged in as an administrator to delete courts.';
      } else if (err.status === 401) {
        errorMessage = 'Authentication required. Please log in and try again.';
      } else if (err.detail) {
        errorMessage = err.detail;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      alert(`Error deleting court: ${errorMessage}`);
      setShowDeleteConfirm(false);
      setCourtToDelete(null);
    }
  };

  // If add court form is shown
  if (showAddCourtForm) {
    return (
      <AddCourtForm
        registry={registry}
        onBack={() => {
          setShowAddCourtForm(false);
          setEditingCourt(null);
        }}
        onSave={handleSaveCourt}
        initialData={editingCourt}
        isEditMode={!!editingCourt}
      />
    );
  }

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
          <div className="flex flex-col items-start self-stretch gap-4">
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
              <span className="text-[#525866] text-xs whitespace-nowrap">Courts</span>
            </div>

            {/* Header Section */}
            <div className="flex justify-between items-start self-stretch">
              <div className="flex flex-col items-start w-[290px] gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-[#040E1B] text-xl font-bold">Courts</span>
                </div>
                <span className="text-[#070810] text-sm">
                  Manage courts under this registry
                </span>
              </div>
              <button
                onClick={() => {
                  setEditingCourt(null);
                  setShowAddCourtForm(true);
                }}
                className="flex flex-col items-center w-[270px] py-3 rounded-lg border-4 border-solid border-[#0F284726] hover:opacity-90 transition-opacity"
                style={{background: 'linear-gradient(180deg, #022658, #1A4983)'}}
              >
                <span className="text-white text-base font-bold">Add New Court</span>
              </button>
            </div>

            {/* Search Courts */}
            <div className="flex items-center py-3.5 pl-2 gap-2.5 rounded-lg border border-solid border-[#D4E1EA] w-full" style={{ boxShadow: '4px 4px 4px #0708101A' }}>
              <Search className="w-3 h-3 text-[#525866]" />
              <input
                type="text"
                placeholder="Search Courts here"
                value={courtSearchQuery}
                onChange={(e) => setCourtSearchQuery(e.target.value)}
                className="flex-1 text-[#525866] bg-transparent text-xs border-0 outline-none"
              />
            </div>

            {/* Courts List */}
            <div className="flex flex-col items-start self-stretch gap-3">
              {loadingCourts ? (
                <div className="flex items-center justify-center w-full py-8">
                  <span className="text-[#525866] text-sm">Loading courts...</span>
                </div>
              ) : filteredCourts.length > 0 ? (
                filteredCourts.map((court) => (
                  <div
                    key={court.id}
                    className="flex justify-between items-center self-stretch bg-white pr-4 rounded-lg hover:bg-blue-50 transition-colors"
                    style={{boxShadow: '0px 2px 20px #0000000D'}}
                  >
                    <div className="flex flex-col items-start flex-1 py-[15px] pl-4 gap-1">
                      <span className="text-[#040E1B] text-lg font-normal">
                        {court.name}
                      </span>
                      <span className="text-[#525866] text-sm font-normal">
                        {court.court_division || court.division || 'General Division'} • {court.location || court.address || 'N/A'}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-xs font-normal px-2 py-1 rounded ${
                        court.is_active !== false
                          ? 'bg-green-50 text-green-600' 
                          : 'bg-gray-50 text-gray-600'
                      }`}>
                        {court.is_active !== false ? 'Active' : 'Inactive'}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditCourt(court);
                        }}
                        className="p-1.5 rounded hover:bg-gray-100 transition-colors"
                        title="Edit court"
                      >
                        <Edit className="w-4 h-4 text-[#022658]" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteCourt(court);
                        }}
                        className="p-1.5 rounded hover:bg-red-50 transition-colors"
                        title="Delete court"
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center self-stretch py-12 gap-4">
                  <span className="text-[#525866] text-sm font-normal">
                    {courtSearchQuery.trim() 
                      ? `No courts found matching "${courtSearchQuery}"`
                      : 'No courts added yet'
                    }
                  </span>
                  {!courtSearchQuery.trim() && (
                  <button
                      onClick={() => {
                        setEditingCourt(null);
                        setShowAddCourtForm(true);
                      }}
                    className="flex items-center justify-center bg-[#022658] text-white text-sm font-bold py-2 px-4 rounded-lg hover:bg-[#033a7a] transition-colors"
                  >
                    Add First Court
                  </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false);
          setCourtToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title={`Are you sure you want to delete this court?`}
        message={`Court: ${courtToDelete?.name || 'N/A'}\nLocation: ${courtToDelete?.location || courtToDelete?.address || 'N/A'}\n\nThis action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
      />
    </div>
  );
};

export default RegistryCourtsView;

