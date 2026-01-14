import React, { useState, useEffect } from 'react';
import { ArrowLeft, Edit, Save, X, CheckCircle, Calendar, Plus, Trash2, ExternalLink, Building2, User, Users, FileText, Database, Bookmark } from 'lucide-react';
import CaseDetails from './CaseDetails';
import AdminHeader from './AdminHeader';
import EmploymentFormModal from './EmploymentFormModal';
import RelationshipFormModal from './RelationshipFormModal';
import GazetteFormModal from './GazetteFormModal';
import { apiGet, apiPut, apiPost, apiDelete } from '../../utils/api';

const PersonDetails = ({ person, onBack, userInfo, onNavigate, onLogout, onViewRelatedPerson }) => {
  const [activeTab, setActiveTab] = useState('personal');
  const [selectedCase, setSelectedCase] = useState(null);
  const [personData, setPersonData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    companiesAffiliated: 0,
    personsAffiliated: 0,
    gazetteNotices: 0,
    totalData: 0
  });
  const [relatedCases, setRelatedCases] = useState([]);
  const [casesLoading, setCasesLoading] = useState(false);
  const [casesError, setCasesError] = useState(null);
  const [gazetteNotices, setGazetteNotices] = useState([]);
  const [gazettesLoading, setGazettesLoading] = useState(false);
  const [gazettesError, setGazettesError] = useState(null);
  const [riskBreakdown, setRiskBreakdown] = useState(null);
  const [riskLoading, setRiskLoading] = useState(false);
  const [riskError, setRiskError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [updateError, setUpdateError] = useState(null);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [employmentRecords, setEmploymentRecords] = useState([]);
  const [employmentLoading, setEmploymentLoading] = useState(false);
  const [relationships, setRelationships] = useState([]);
  const [relationshipsLoading, setRelationshipsLoading] = useState(false);
  const [allRelationships, setAllRelationships] = useState(null);
  const [allRelationshipsLoading, setAllRelationshipsLoading] = useState(false);
  const [showAddEmployment, setShowAddEmployment] = useState(false);
  const [editingEmployment, setEditingEmployment] = useState(null);
  const [showAddCase, setShowAddCase] = useState(false);
  const [showAddRelationship, setShowAddRelationship] = useState(false);
  const [showAddGazette, setShowAddGazette] = useState(false);
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const [watchlistId, setWatchlistId] = useState(null);
  const [watchlistLoading, setWatchlistLoading] = useState(false);

  const tabs = [
    { id: 'personal', label: 'Personal Information' },
    { id: 'employment', label: 'Employment Records' },
    { id: 'affiliated', label: 'Affiliated Persons' },
    { id: 'cases', label: 'Case List' },
    { id: 'gazettes', label: 'Gazette Notices' },
    { id: 'risk', label: 'Risk Score' }
  ];

  // Fetch full person data from API
  useEffect(() => {
    const fetchPersonData = async () => {
      if (!person?.id && !person?.fullData?.id) {
        // If we have fullData, use it directly
        if (person?.fullData) {
          setPersonData(person.fullData);
          setIsLoading(false);
          return;
        }
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const personId = person.id || person.fullData?.id;
        const data = await apiGet(`/people/${personId}`);
        setPersonData(data);
        
        // Fetch employment records
        try {
          setEmploymentLoading(true);
          const employmentData = await apiGet(`/people/${personId}/employment`);
          setEmploymentRecords(Array.isArray(employmentData) ? employmentData : (employmentData.employment || []));
        } catch (empError) {
          console.error('Error fetching employment records:', empError);
          setEmploymentRecords([]);
        } finally {
          setEmploymentLoading(false);
        }
        
        // Fetch relationships (person-to-person)
        try {
          setRelationshipsLoading(true);
          console.log('[PersonDetails] Fetching relationships for person:', personId);
          const relationshipsData = await apiGet(`/people/${personId}/relationships`);
          console.log('[PersonDetails] Relationships API response:', relationshipsData);
          
          // Backend already includes related_person data, so use it directly
          const relationshipsArray = Array.isArray(relationshipsData) ? relationshipsData : (relationshipsData.relationships || []);
          console.log('[PersonDetails] Relationships array:', relationshipsArray);
          
          // Backend already includes related_person in the response, so we can use it directly
          setRelationships(relationshipsArray);
        } catch (relError) {
          console.error('Error fetching relationships:', relError);
          console.error('Error details:', relError.message, relError.stack);
          setRelationships([]);
        } finally {
          setRelationshipsLoading(false);
        }
        
        // Fetch all relationships (banks, companies, name changes, etc.)
        try {
          setAllRelationshipsLoading(true);
          const allRelationshipsData = await apiGet(`/api/people/${personId}/all-relationships`);
          console.log('[PersonDetails] All relationships data:', allRelationshipsData);
          setAllRelationships(allRelationshipsData);
        } catch (allRelError) {
          console.error('Error fetching all relationships:', allRelError);
          setAllRelationships(null);
        } finally {
          setAllRelationshipsLoading(false);
        }
        
        // Initialize edit form data
        setEditFormData({
          first_name: data.first_name || '',
          last_name: data.last_name || '',
          full_name: data.full_name || '',
          date_of_birth: data.date_of_birth ? new Date(data.date_of_birth).toISOString().split('T')[0] : '',
          place_of_birth: data.place_of_birth || '',
          gender: data.gender || '',
          phone_number: data.phone_number || '',
          email: data.email || '',
          address: data.address || '',
          city: data.city || '',
          region: data.region || '',
          country: data.country || 'Ghana',
          nationality: data.nationality || 'Ghanaian',
          id_number: data.id_number || '',
          occupation: data.occupation || '',
          employer: data.employer || '',
          job_title: data.job_title || '',
          marital_status: data.marital_status || '',
          spouse_name: data.spouse_name || '',
          children_count: data.children_count || 0,
          emergency_contact: data.emergency_contact || '',
          emergency_phone: data.emergency_phone || '',
          education_level: data.education_level || '',
          languages: data.languages || [],
          is_verified: data.is_verified || false,
          status: data.status || 'active',
          notes: data.notes || ''
        });
        
        // Fetch additional stats
        try {
          // Get gazette count
          const gazettesResponse = await apiGet(`/gazette/person/${personId}?limit=1`);
          const gazetteCount = gazettesResponse?.total || 0;
          
          // Get relationships count for personsAffiliated (already fetched above)
          const relationshipsCount = relationships.length;
          
          setStats({
            companiesAffiliated: 0, // TODO: Get from API when available
            personsAffiliated: relationshipsCount,
            gazetteNotices: gazetteCount,
            totalData: gazetteCount + (data.case_count || 0) + relationshipsCount
          });
        } catch (statsError) {
          console.error('Error fetching stats:', statsError);
          // Set defaults if stats fail
          setStats({
            companiesAffiliated: 0,
            personsAffiliated: 0,
            gazetteNotices: 0,
            totalData: data.case_count || 0
          });
        }

        // Fetch related cases using person's full name
        if (data.full_name) {
          loadRelatedCases(data.full_name);
        } else {
          setCasesLoading(false);
          setRelatedCases([]);
        }
        
        // Fetch gazette notices
        loadGazetteNotices(personId);
        
        // Fetch risk breakdown
        loadRiskBreakdown(personId);
      } catch (error) {
        console.error('Error fetching person data:', error);
        // Fallback to passed person data
        if (person?.fullData) {
          setPersonData(person.fullData);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchPersonData();
  }, [person]);

  // Check watchlist status when person data is loaded
  useEffect(() => {
    const checkWatchlistStatus = async () => {
      if (!personData?.id) return;
      
      try {
        const response = await apiGet(`/watchlist/check/person/${personData.id}`);
        setIsInWatchlist(response.is_in_watchlist || false);
        setWatchlistId(response.watchlist_id || null);
      } catch (error) {
        console.error('Error checking watchlist status:', error);
        setIsInWatchlist(false);
      }
    };

    if (personData?.id) {
      checkWatchlistStatus();
    }
  }, [personData]);

  // Handle add/remove from watchlist
  const handleWatchlistToggle = async () => {
    if (!personData?.id) return;
    
    try {
      setWatchlistLoading(true);
      
      if (isInWatchlist) {
        // Remove from watchlist
        await apiDelete(`/watchlist/entity/person/${personData.id}`);
        setIsInWatchlist(false);
        setWatchlistId(null);
      } else {
        // Add to watchlist
        const response = await apiPost('/watchlist/', {
          entity_type: 'person',
          entity_id: personData.id,
          notify_on_new_cases: true,
          notify_on_risk_change: true,
          notify_on_regulatory_updates: false
        });
        setIsInWatchlist(true);
        setWatchlistId(response.id);
      }
    } catch (error) {
      console.error('Error toggling watchlist:', error);
      alert(error.message || 'Failed to update watchlist');
    } finally {
      setWatchlistLoading(false);
    }
  };

  // Helper function to calculate age from date of birth
  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return null;
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  // Helper function to format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-GB', { 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric' 
      });
    } catch (e) {
      return 'N/A';
    }
  };

  // Helper function to format date short
  const formatDateShort = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-GB', { 
        day: '2-digit', 
        month: 'short', 
        year: 'numeric' 
      });
    } catch (e) {
      return 'N/A';
    }
  };

  // Get region display name
  const getRegionDisplayName = (abbreviation) => {
    if (!abbreviation) return 'N/A';
    const regionMap = {
      'GAR': 'Greater Accra',
      'ASR': 'Ashanti',
      'AR': 'Ashanti',
      'CR': 'Central',
      'ER': 'Eastern',
      'NR': 'Northern',
      'WR': 'Western',
      'VR': 'Volta',
      'UER': 'Upper East',
      'UWR': 'Upper West',
      'BR': 'Bono',
      'BER': 'Bono East',
      'AHR': 'Ahafo',
      'SR': 'Savannah',
      'NER': 'North East',
      'OR': 'Oti',
      'WNR': 'Western North'
    };
    return regionMap[abbreviation.toUpperCase()] || abbreviation;
  };

  // Load related cases for the person
  const loadRelatedCases = async (personName) => {
    if (!personName) {
      setCasesLoading(false);
      return;
    }
    
    try {
      setCasesLoading(true);
      setCasesError(null);
      
      console.log('[PersonDetails] Loading cases for person name:', personName);
      
      // First, try to get cases from PersonCaseLink if we have person ID
      const personId = personData?.id || person?.id || person?.fullData?.id;
      
      // Try the person-specific endpoint with person_id if available
      try {
        let endpoint = `/case-search/person/${encodeURIComponent(personName)}?limit=100`;
        if (personId) {
          endpoint += `&person_id=${personId}`;
        }
        const response = await apiGet(endpoint);
        console.log('[PersonDetails] Person cases API response:', response);
        
        if (response && response.cases && Array.isArray(response.cases) && response.cases.length > 0) {
          console.log('[PersonDetails] Found cases:', response.cases.length);
          setRelatedCases(response.cases);
          setCasesLoading(false);
          return;
        } else if (response && response.cases && Array.isArray(response.cases)) {
          // Empty array is valid
          console.log('[PersonDetails] No cases found for person');
          setRelatedCases([]);
          setCasesLoading(false);
          return;
        }
      } catch (personEndpointError) {
        console.log('[PersonDetails] Person endpoint failed, trying search endpoint:', personEndpointError);
      }
      
      // Final fallback: search endpoint
      try {
        const searchResponse = await apiGet(`/case-search/search?query=${encodeURIComponent(personName)}&limit=100`);
        console.log('[PersonDetails] Search cases API response:', searchResponse);
        
        if (searchResponse && searchResponse.results && Array.isArray(searchResponse.results)) {
          console.log('[PersonDetails] Found cases from search:', searchResponse.results.length);
          setRelatedCases(searchResponse.results);
        } else {
          console.log('[PersonDetails] No cases found in search results');
          setRelatedCases([]);
        }
      } catch (searchError) {
        console.error('[PersonDetails] Search endpoint also failed:', searchError);
        setCasesError('Failed to load related cases. Please try again.');
        setRelatedCases([]);
      }
    } catch (error) {
      console.error('[PersonDetails] Error loading related cases:', error);
      setCasesError(error.message || 'Failed to load related cases');
      setRelatedCases([]);
    } finally {
      setCasesLoading(false);
    }
  };

  // Load risk breakdown for the person
  const loadRiskBreakdown = async (personId) => {
    if (!personId) {
      setRiskLoading(false);
      setRiskBreakdown(null);
      return;
    }
    
    try {
      setRiskLoading(true);
      setRiskError(null);
      
      console.log('[PersonDetails] Loading risk breakdown for person ID:', personId);
      const response = await apiGet(`/person/${personId}/risk-breakdown`);
      console.log('[PersonDetails] Risk breakdown API response:', response);
      
      setRiskBreakdown(response);
    } catch (error) {
      console.error('[PersonDetails] Error loading risk breakdown:', error);
      setRiskError(error.message || 'Failed to load risk breakdown');
      setRiskBreakdown(null);
    } finally {
      setRiskLoading(false);
    }
  };

  // Load gazette notices for the person
  const loadGazetteNotices = async (personId) => {
    if (!personId) {
      console.warn('[PersonDetails] No person ID provided for loading gazette notices');
      setGazettesLoading(false);
      setGazetteNotices([]);
      return;
    }
    
    try {
      setGazettesLoading(true);
      setGazettesError(null);
      
      console.log('[PersonDetails] Loading gazette notices for person ID:', personId);
      const response = await apiGet(`/gazette/person/${personId}?limit=100`);
      console.log('[PersonDetails] Gazette notices API response:', response);
      
      if (response && response.gazettes && Array.isArray(response.gazettes)) {
        console.log('[PersonDetails] Found gazette notices:', response.gazettes.length);
        // Sort by publication date descending (newest first)
        const sortedGazettes = [...response.gazettes].sort((a, b) => {
          const dateA = a.publication_date || a.created_at || '';
          const dateB = b.publication_date || b.created_at || '';
          return new Date(dateB) - new Date(dateA);
        });
        setGazetteNotices(sortedGazettes);
      } else if (response && Array.isArray(response)) {
        // Handle case where API returns array directly
        console.log('[PersonDetails] Found gazette notices (array format):', response.length);
        const sortedGazettes = [...response].sort((a, b) => {
          const dateA = a.publication_date || a.created_at || '';
          const dateB = b.publication_date || b.created_at || '';
          return new Date(dateB) - new Date(dateA);
        });
        setGazetteNotices(sortedGazettes);
      } else {
        console.log('[PersonDetails] No gazette notices found');
        setGazetteNotices([]);
      }
    } catch (error) {
      console.error('[PersonDetails] Error loading gazette notices:', error);
      setGazettesError(error.message || 'Failed to load gazette notices');
      setGazetteNotices([]);
    } finally {
      setGazettesLoading(false);
    }
  };

  // Format gazette type for display
  const formatGazetteType = (gazetteType) => {
    if (!gazetteType) return 'N/A';
    
    // Convert enum values to readable format
    const typeMap = {
      'CHANGE_OF_NAME': 'Change of Name',
      'CHANGE_OF_DATE_OF_BIRTH': 'Correction of Date of Birth',
      'CHANGE_OF_PLACE_OF_BIRTH': 'Correction of Place of Birth',
      'APPOINTMENT_OF_MARRIAGE_OFFICERS': 'Appointment of Marriage Officers',
      'LEGAL_NOTICE': 'Legal Notice',
      'BUSINESS_NOTICE': 'Business Notice',
      'PROPERTY_NOTICE': 'Property Notice',
      'PERSONAL_NOTICE': 'Personal Notice',
      'REGULATORY_NOTICE': 'Regulatory Notice',
      'COURT_NOTICE': 'Court Notice',
      'BANKRUPTCY_NOTICE': 'Bankruptcy Notice',
      'PROBATE_NOTICE': 'Probate Notice',
      'OTHER': 'Other'
    };
    
    return typeMap[gazetteType] || gazetteType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  // Format gazette description based on type
  const formatGazetteDescription = (gazette) => {
    if (!gazette) return 'N/A';
    
    const type = gazette.gazette_type;
    
    if (type === 'CHANGE_OF_NAME') {
      const oldName = gazette.old_name || 'N/A';
      const newName = gazette.new_name || 'N/A';
      const alias = gazette.alias_names && gazette.alias_names.length > 0 
        ? ` (A.K.A ${gazette.alias_names.join(', ')})` 
        : '';
      return `Name changed from ${oldName}${alias} to ${newName}`;
    } else if (type === 'CHANGE_OF_DATE_OF_BIRTH') {
      const oldDob = gazette.old_date_of_birth 
        ? formatDate(gazette.old_date_of_birth) 
        : 'N/A';
      const newDob = gazette.new_date_of_birth 
        ? formatDate(gazette.new_date_of_birth) 
        : 'N/A';
      return `Date of birth corrected from ${oldDob} to ${newDob}`;
    } else if (type === 'CHANGE_OF_PLACE_OF_BIRTH') {
      const oldPlace = gazette.old_place_of_birth || 'N/A';
      const newPlace = gazette.new_place_of_birth || 'N/A';
      return `Place of birth corrected from ${oldPlace} to ${newPlace}`;
    } else {
      return gazette.description || gazette.summary || gazette.title || 'N/A';
    }
  };

  // Format gazette issue number
  const formatGazetteIssue = (gazette) => {
    if (!gazette) return 'N/A';
    
    const gazetteNumber = gazette.gazette_number || '';
    const gazetteDate = gazette.gazette_date || gazette.publication_date;
    
    if (gazetteNumber && gazetteDate) {
      const year = new Date(gazetteDate).getFullYear();
      return `Ghana Gazette<br/>${gazetteNumber}, ${year}`;
    } else if (gazetteNumber) {
      return `Ghana Gazette<br/>${gazetteNumber}`;
    } else if (gazetteDate) {
      const year = new Date(gazetteDate).getFullYear();
      return `Ghana Gazette<br/>${year}`;
    }
    
    return 'N/A';
  };

  // Determine person's role in case
  const getPersonRole = (caseItem) => {
    const personName = displayPerson?.full_name || displayPerson?.name || '';
    if (!personName) return 'N/A';
    
    const nameLower = personName.toLowerCase();
    const protagonist = (caseItem.protagonist || '').toLowerCase();
    const antagonist = (caseItem.antagonist || '').toLowerCase();
    
    if (protagonist.includes(nameLower)) {
      return 'Plaintiff';
    } else if (antagonist.includes(nameLower)) {
      return 'Defendant';
    } else {
      return 'Related Party';
    }
  };

  // Format case date
  const formatCaseDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-GB', { 
        day: 'numeric', 
        month: 'short', 
        year: 'numeric' 
      });
    } catch (e) {
      return dateString;
    }
  };

  // Get case outcome badge color based on case_metadata.outcome
  const getOutcomeBadgeColor = (outcome) => {
    if (!outcome) return 'bg-gray-100 text-gray-600';
    const outcomeLower = outcome.toLowerCase();
    
    // Favorable outcomes - green
    if (outcomeLower.includes('favorable') || outcomeLower.includes('won') || outcomeLower.includes('successful') || outcomeLower.includes('granted')) {
      return 'bg-green-100 text-green-600';
    }
    // Unfavorable outcomes - red
    else if (outcomeLower.includes('unfavorable') || outcomeLower.includes('lost') || outcomeLower.includes('dismissed') || outcomeLower.includes('rejected') || outcomeLower.includes('denied')) {
      return 'bg-red-100 text-red-600';
    }
    // Mixed/partial outcomes - yellow/orange
    else if (outcomeLower.includes('mixed') || outcomeLower.includes('partial') || outcomeLower.includes('settled')) {
      return 'bg-yellow-100 text-yellow-600';
    }
    // Pending/ongoing - orange
    else if (outcomeLower.includes('pending') || outcomeLower.includes('ongoing') || outcomeLower.includes('in progress')) {
      return 'bg-[#F36F261A] text-[#F59E0B]';
    }
    // Resolved/closed - blue
    else if (outcomeLower.includes('resolved') || outcomeLower.includes('closed') || outcomeLower.includes('completed')) {
      return 'bg-blue-100 text-blue-600';
    }
    // Default - gray
    else {
      return 'bg-gray-100 text-gray-600';
    }
  };

  // Get case status badge color (fallback for status field)
  const getStatusBadgeColor = (status) => {
    if (!status) return 'bg-gray-100 text-gray-600';
    const statusLower = status.toLowerCase();
    if (statusLower.includes('ongoing') || statusLower.includes('pending')) {
      return 'bg-[#F36F261A] text-[#F59E0B]';
    } else if (statusLower.includes('resolved') || statusLower.includes('closed') || statusLower.includes('judgment')) {
      return 'bg-green-100 text-green-600';
    } else {
      return 'bg-gray-100 text-gray-600';
    }
  };

  // Use personData if available, otherwise fallback to person prop
  const displayPerson = personData || person?.fullData || person;

  // Handle cancel edit
  const handleCancelEdit = () => {
    setIsEditing(false);
    setUpdateError(null);
    // Reset form data to original
    if (personData) {
      setEditFormData({
        first_name: personData.first_name || '',
        last_name: personData.last_name || '',
        full_name: personData.full_name || '',
        date_of_birth: personData.date_of_birth ? new Date(personData.date_of_birth).toISOString().split('T')[0] : '',
        place_of_birth: personData.place_of_birth || '',
        gender: personData.gender || '',
        phone_number: personData.phone_number || '',
        email: personData.email || '',
        address: personData.address || '',
        city: personData.city || '',
        region: personData.region || '',
        country: personData.country || 'Ghana',
        nationality: personData.nationality || 'Ghanaian',
        id_number: personData.id_number || '',
        occupation: personData.occupation || '',
        employer: personData.employer || '',
        job_title: personData.job_title || '',
        marital_status: personData.marital_status || '',
        spouse_name: personData.spouse_name || '',
        children_count: personData.children_count || 0,
        emergency_contact: personData.emergency_contact || '',
        emergency_phone: personData.emergency_phone || '',
        education_level: personData.education_level || '',
        languages: personData.languages || [],
        is_verified: personData.is_verified || false,
        status: personData.status || 'active',
        notes: personData.notes || ''
      });
    }
  };

  // Handle add/edit employment
  const handleSaveEmployment = async (employmentData) => {
    if (!personData?.id && !person?.id && !person?.fullData?.id) {
      setUpdateError('Person ID not found');
      return;
    }

    try {
      setIsSaving(true);
      setUpdateError(null);
      const personId = personData?.id || person?.id || person?.fullData?.id;

      // Prepare data with person_id
      const dataToSend = {
        ...employmentData,
        person_id: personId
      };

      if (editingEmployment && editingEmployment.id) {
        // Update existing employment
        await apiPut(`/people/${personId}/employment/${editingEmployment.id}`, dataToSend);
      } else {
        // Create new employment
        await apiPost(`/people/${personId}/employment`, dataToSend);
      }

      // Refresh employment records
      const employmentDataResponse = await apiGet(`/people/${personId}/employment`);
      setEmploymentRecords(Array.isArray(employmentDataResponse) ? employmentDataResponse : (employmentDataResponse.employment || []));
      
      setShowAddEmployment(false);
      setEditingEmployment(null);
      setUpdateSuccess(true);
      setTimeout(() => setUpdateSuccess(false), 5000);
    } catch (err) {
      console.error('Error saving employment:', err);
      setUpdateError(err.message || err.detail || 'Failed to save employment record');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle delete employment
  const handleDeleteEmployment = async (employmentId) => {
    if (!window.confirm('Are you sure you want to delete this employment record?')) {
      return;
    }

    if (!personData?.id && !person?.id && !person?.fullData?.id) {
      setUpdateError('Person ID not found');
      return;
    }

    try {
      const personId = personData?.id || person?.id || person?.fullData?.id;
      await apiDelete(`/people/${personId}/employment/${employmentId}`);
      
      // Refresh employment records
      const employmentDataResponse = await apiGet(`/people/${personId}/employment`);
      setEmploymentRecords(Array.isArray(employmentDataResponse) ? employmentDataResponse : (employmentDataResponse.employment || []));
      
      setUpdateSuccess(true);
      setTimeout(() => setUpdateSuccess(false), 5000);
    } catch (err) {
      console.error('Error deleting employment:', err);
      setUpdateError(err.message || err.detail || 'Failed to delete employment record');
    }
  };

  // Handle add/edit relationship
  const handleSaveRelationship = async (relationshipData) => {
    if (!personData?.id && !person?.id && !person?.fullData?.id) {
      setUpdateError('Person ID not found');
      return;
    }

    try {
      setIsSaving(true);
      setUpdateError(null);
      const personId = personData?.id || person?.id || person?.fullData?.id;

      // Backend schema requires person_id in body (even though route uses URL param)
      const dataToSend = {
        ...relationshipData,
        person_id: personId
      };

      console.log('[PersonDetails] Saving relationship:', dataToSend);
      const response = await apiPost(`/people/${personId}/relationships`, dataToSend);
      console.log('[PersonDetails] Relationship saved successfully:', response);

      // Refresh relationships (backend already includes related_person data)
      const relationshipsData = await apiGet(`/people/${personId}/relationships`);
      const relationshipsArray = Array.isArray(relationshipsData) ? relationshipsData : (relationshipsData.relationships || []);
      setRelationships(relationshipsArray);
      setShowAddRelationship(false);
      setUpdateSuccess(true);
      setTimeout(() => setUpdateSuccess(false), 5000);
    } catch (err) {
      console.error('Error saving relationship:', err);
      setUpdateError(err.message || err.detail || 'Failed to save relationship');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle save gazette notice
  const handleSaveGazette = async (gazetteData) => {
    try {
      setIsSaving(true);
      setUpdateError(null);

      // Ensure person_id is set correctly
      const personId = personData?.id || person?.id || person?.fullData?.id;
      if (!personId) {
        throw new Error('Person ID is required to save gazette notice');
      }

      // Ensure the gazette data has the person_id
      if (!gazetteData.person_id && gazetteData.entity_type === 'Individual') {
        gazetteData.person_id = personId;
      }

      console.log('[PersonDetails] Saving gazette notice:', gazetteData);
      const response = await apiPost('/gazette/', gazetteData);
      console.log('[PersonDetails] Gazette notice saved successfully:', response);

      // Close modal first
      setShowAddGazette(false);
      
      // Wait a brief moment to ensure database commit is complete
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Refresh gazette notices
      await loadGazetteNotices(personId);
      
      // Also refresh stats
      try {
        const statsResponse = await apiGet(`/people/${personId}/stats`);
        if (statsResponse) {
          setStats(prevStats => ({
            ...prevStats,
            gazetteNotices: statsResponse.gazette_notices || statsResponse.gazetteNotices || 0
          }));
        }
      } catch (statsError) {
        console.error('[PersonDetails] Error refreshing stats:', statsError);
      }

      setUpdateSuccess(true);
      setTimeout(() => setUpdateSuccess(false), 5000);
    } catch (error) {
      console.error('[PersonDetails] Error saving gazette notice:', error);
      setUpdateError(error.message || 'Failed to save gazette notice. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle delete relationship
  const handleDeleteRelationship = async (relationshipId) => {
    if (!window.confirm('Are you sure you want to delete this relationship?')) {
      return;
    }

    if (!personData?.id && !person?.id && !person?.fullData?.id) {
      setUpdateError('Person ID not found');
      return;
    }

    try {
      const personId = personData?.id || person?.id || person?.fullData?.id;
      await apiDelete(`/people/${personId}/relationships/${relationshipId}`);
      
      // Refresh relationships (backend already includes related_person data)
      const relationshipsData = await apiGet(`/people/${personId}/relationships`);
      const relationshipsArray = Array.isArray(relationshipsData) ? relationshipsData : (relationshipsData.relationships || []);
      setRelationships(relationshipsArray);
      setUpdateSuccess(true);
      setTimeout(() => setUpdateSuccess(false), 5000);
    } catch (err) {
      console.error('Error deleting relationship:', err);
      setUpdateError(err.message || err.detail || 'Failed to delete relationship');
    }
  };

  // Handle save edit
  const handleSaveEdit = async () => {
    if (!personData?.id && !person?.id && !person?.fullData?.id) {
      setUpdateError('Person ID not found');
      return;
    }

    try {
      setIsSaving(true);
      setUpdateError(null);
      setUpdateSuccess(false);

      const personId = personData?.id || person?.id || person?.fullData?.id;
      
      // Prepare update data - only include fields that have changed
      const updateData = {};
      Object.keys(editFormData).forEach(key => {
        const originalValue = personData?.[key];
        const newValue = editFormData[key];
        
        // Handle date comparison
        if (key === 'date_of_birth' && newValue) {
          const originalDate = originalValue ? new Date(originalValue).toISOString().split('T')[0] : null;
          if (originalDate !== newValue) {
            updateData[key] = newValue; // Send as YYYY-MM-DD string, backend will convert
          }
        } else if (key === 'languages' && Array.isArray(newValue)) {
          // Handle languages array
          const originalLangs = Array.isArray(originalValue) ? originalValue : (originalValue ? [originalValue] : []);
          const newLangs = newValue.filter(l => l && l.trim());
          if (JSON.stringify(originalLangs.sort()) !== JSON.stringify(newLangs.sort())) {
            updateData[key] = newLangs.length > 0 ? newLangs : null;
          }
        } else if (originalValue !== newValue) {
          // For other fields, include if changed
          // Convert empty strings to null for optional fields
          if (newValue === '' && (key !== 'first_name' && key !== 'last_name' && key !== 'full_name')) {
            updateData[key] = null;
          } else {
            updateData[key] = newValue;
          }
        }
      });

      // Ensure full_name is updated if first_name or last_name changed
      if (updateData.first_name || updateData.last_name) {
        const firstName = updateData.first_name || personData.first_name || '';
        const lastName = updateData.last_name || personData.last_name || '';
        updateData.full_name = `${firstName} ${lastName}`.trim();
      }

      // Filter out computed fields
      const computedFields = ['total_cases', 'resolved_cases', 'unresolved_cases', 'favorable_cases', 'unfavorable_cases', 'mixed_cases', 'case_outcome'];
      computedFields.forEach(field => {
        delete updateData[field];
      });

      console.log('Updating person with data:', updateData);

      const updatedPerson = await apiPut(`/people/${personId}`, updateData);
      
      // Update local state
      setPersonData(updatedPerson);
      setIsEditing(false);
      setUpdateSuccess(true);
      
      // Refresh cases if person name changed
      if (updatedPerson.full_name) {
        loadRelatedCases(updatedPerson.full_name);
      }
      
      // Refresh employment and relationships data
      try {
        const employmentData = await apiGet(`/people/${personId}/employment`);
        setEmploymentRecords(Array.isArray(employmentData) ? employmentData : (employmentData.employment || []));
      } catch (empError) {
        console.error('Error refreshing employment records:', empError);
      }
      
      try {
        const relationshipsData = await apiGet(`/people/${personId}/relationships`);
        const relationshipsArray = Array.isArray(relationshipsData) ? relationshipsData : (relationshipsData.relationships || []);
        
        // For each relationship, fetch related person details if related_person_id exists
        const relationshipsWithDetails = await Promise.all(
          relationshipsArray.map(async (rel) => {
            if (rel.related_person_id) {
              try {
                const relatedPersonData = await apiGet(`/people/${rel.related_person_id}`);
                return { ...rel, related_person: relatedPersonData };
              } catch (err) {
                console.error(`Error fetching related person ${rel.related_person_id}:`, err);
                return rel;
              }
            }
            return rel;
          })
        );
        
        setRelationships(relationshipsWithDetails);
      } catch (relError) {
        console.error('Error refreshing relationships:', relError);
      }
      
      // Auto-dismiss success notification after 5 seconds
      setTimeout(() => {
        setUpdateSuccess(false);
      }, 5000);

    } catch (err) {
      console.error('Error updating person:', err);
      setUpdateError(err.message || err.detail || 'Failed to update person. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // If a case is selected, show case details
  if (selectedCase) {
    return (
      <CaseDetails
        caseData={selectedCase}
        person={displayPerson || person}
        onBack={() => setSelectedCase(null)}
        userInfo={userInfo}
      />
    );
  }

  return (
    <div className="bg-[#F7F8FA] min-h-screen">
      {/* Success Notification (Fixed) */}
      {updateSuccess && (
        <div 
          className="fixed top-4 right-4 z-[9999] bg-green-500 text-white px-6 py-4 rounded-lg shadow-xl flex items-center gap-3 min-w-[300px] max-w-[500px]"
          style={{
            animation: 'slideInRight 0.3s ease-out',
          }}
        >
          <CheckCircle className="h-6 w-6 flex-shrink-0" />
          <div className="flex-1">
            <p className="font-bold text-base">Success!</p>
            <p className="text-sm mt-1">Person profile updated successfully!</p>
          </div>
          <button 
            onClick={() => setUpdateSuccess(false)} 
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
      
      {/* Header with Search and User */}
      <AdminHeader userInfo={userInfo} onNavigate={onNavigate} onLogout={onLogout} />

      {/* Main Content */}
      <div className="px-6">
        <div className="flex flex-col bg-white py-4 px-4 rounded-lg gap-6">
          {/* Breadcrumb */}
          <div className="flex items-center gap-1">
            <span className="text-[#525866] text-xs">PERSONS</span>
            <img src="/logo.png" className="w-4 h-4 object-fill" alt="" onError={(e) => { e.target.style.display = 'none'; }} />
            <span className="text-[#040E1B] text-xs">{person?.industry?.name?.toUpperCase() || 'BANKING & FINANCE'}</span>
            <img src="/logo.png" className="w-4 h-4 object-fill" alt="" onError={(e) => { e.target.style.display = 'none'; }} />
            <span className="text-[#070810] text-sm">{displayPerson?.full_name || displayPerson?.name || 'N/A'}</span>
          </div>

          {/* Person Header */}
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <button onClick={onBack} className="flex items-center gap-1 text-[#525866] hover:text-[#022658]">
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="w-12 h-12 rounded-full bg-[#022658] flex items-center justify-center flex-shrink-0">
                {displayPerson?.full_name || displayPerson?.first_name || displayPerson?.last_name ? (
                  <span className="text-white text-lg font-medium">
                    {((displayPerson?.first_name?.charAt(0) || '') + (displayPerson?.last_name?.charAt(0) || '') || displayPerson?.full_name?.charAt(0) || 'U').toUpperCase()}
                  </span>
                ) : (
                  <User className="w-6 h-6 text-white" />
                )}
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[#040E1B] text-xl font-bold">
                  {displayPerson?.full_name || displayPerson?.name || 'N/A'}
                </span>
                <span className={`${person?.riskColor || 'text-emerald-500'} text-xs font-bold`}>
                  {person?.riskScore || (displayPerson?.risk_score ? `${Math.round(displayPerson.risk_score)} - ${displayPerson.risk_level || 'Low'}` : 'N/A')}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {!isEditing ? (
                <button 
                  onClick={() => setIsEditing(true)}
                  className="flex items-center px-4 py-2 gap-2 rounded-lg border border-solid border-[#022658] hover:bg-blue-50"
                >
                  <Edit className="w-4 h-4 text-[#022658]" />
                  <span className="text-[#022658] text-base" style={{ fontFamily: 'Satoshi' }}>Edit Profile</span>
                </button>
              ) : (
                <>
                  <button 
                    onClick={handleCancelEdit}
                    className="flex items-center px-4 py-2 gap-2 rounded-lg border border-solid border-gray-300 hover:bg-gray-50"
                  >
                    <X className="w-4 h-4 text-gray-600" />
                    <span className="text-gray-600 text-base" style={{ fontFamily: 'Satoshi' }}>Cancel</span>
                  </button>
                  <button 
                    onClick={handleSaveEdit}
                    disabled={isSaving}
                    className="flex items-center px-4 py-2 gap-2 rounded-lg border border-solid border-[#022658] bg-[#022658] hover:bg-[#033a7a] text-white disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    <span className="text-base" style={{ fontFamily: 'Satoshi' }}>{isSaving ? 'Saving...' : 'Save Changes'}</span>
                  </button>
                </>
              )}
              <button 
                onClick={handleWatchlistToggle}
                disabled={watchlistLoading}
                className={`flex items-center px-4 py-2 gap-2 rounded-lg border border-solid ${
                  isInWatchlist 
                    ? 'border-green-500 bg-green-50 hover:bg-green-100' 
                    : 'border-[#F59E0B] hover:bg-orange-50'
                } transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <Bookmark className={`w-4 h-4 ${isInWatchlist ? 'text-green-600' : 'text-[#F59E0B]'}`} />
                <span className={`text-base ${isInWatchlist ? 'text-green-600' : 'text-[#F59E0B]'}`} style={{ fontFamily: 'Satoshi' }}>
                  {watchlistLoading 
                    ? 'Loading...' 
                    : isInWatchlist 
                      ? 'In Watchlist' 
                      : 'Add To Watchlist'
                  }
                </span>
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="flex items-center gap-3">
            <div className="flex items-center bg-white flex-1 p-3 gap-3 rounded-lg border border-solid border-[#D4E1EA] shadow-sm">
              <div className="w-10 h-10 rounded-lg bg-[#022658]/10 flex items-center justify-center">
                <Building2 className="w-6 h-6 text-[#022658]" />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[#868C98] text-xs">Companies Affiliated With</span>
                <span className="text-[#F59E0B] text-lg font-bold">{stats.companiesAffiliated}</span>
              </div>
            </div>
            <div className="flex items-center bg-white flex-1 p-3 gap-3 rounded-lg border border-solid border-[#D4E1EA] shadow-sm">
              <div className="w-10 h-10 rounded-lg bg-[#022658]/10 flex items-center justify-center">
                <Users className="w-6 h-6 text-[#022658]" />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[#868C98] text-xs">Persons Affiliated With</span>
                <span className="text-[#F59E0B] text-lg font-bold">{stats.personsAffiliated}</span>
              </div>
            </div>
            <div className="flex items-center bg-white flex-1 p-3 gap-3 rounded-lg border border-solid border-[#D4E1EA] shadow-sm">
              <div className="w-10 h-10 rounded-lg bg-[#022658]/10 flex items-center justify-center">
                <FileText className="w-6 h-6 text-[#022658]" />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[#868C98] text-xs">Gazette Notices</span>
                <span className="text-[#F59E0B] text-lg font-bold">{stats.gazetteNotices}</span>
              </div>
            </div>
            <div className="flex items-center bg-white flex-1 p-3 gap-3 rounded-lg border border-solid border-[#D4E1EA] shadow-sm">
              <div className="w-10 h-10 rounded-lg bg-[#022658]/10 flex items-center justify-center">
                <Database className="w-6 h-6 text-[#022658]" />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[#868C98] text-xs">Total Amount Of Data</span>
                <span className="text-[#F59E0B] text-lg font-bold">{stats.totalData}</span>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex flex-col bg-white gap-4">
            <div className="flex items-center gap-4 border-b border-[#E5E8EC]">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`pb-2 ${
                    activeTab === tab.id
                      ? 'text-[#022658] font-bold border-b-2 border-[#022658]'
                      : 'text-[#525866]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Error/Success Messages */}
            {updateError && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                <X className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-red-800 font-medium text-sm">Error</p>
                  <p className="text-red-700 text-sm mt-1">{updateError}</p>
                </div>
                <button 
                  onClick={() => setUpdateError(null)} 
                  className="text-red-400 hover:text-red-600 flex-shrink-0"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
            {updateSuccess && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-green-800 font-medium text-sm">Success</p>
                  <p className="text-green-700 text-sm mt-1">Person profile updated successfully!</p>
                </div>
                <button 
                  onClick={() => setUpdateSuccess(false)} 
                  className="text-green-400 hover:text-green-600 flex-shrink-0"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}

            {/* Tab Content - Personal Information */}
            {activeTab === 'personal' && (
              <div className="flex flex-col self-stretch gap-4">
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#022658]"></div>
                    <span className="ml-3 text-[#525866] text-sm">Loading person details...</span>
                  </div>
                ) : (
                  <>
                    <span className="text-[#868C98] text-xs">BIO</span>
                    
                    {/* Bio Section */}
                    <div className="flex flex-col self-stretch gap-2">
                      <div className="flex items-start gap-1">
                        <div className="w-20 text-[#525866] text-xs">Gender</div>
                        {isEditing ? (
                          <div className="flex-1">
                            <select
                              value={editFormData.gender || ''}
                              onChange={(e) => setEditFormData({...editFormData, gender: e.target.value})}
                              className="text-[#050F1C] text-base leading-[22px] px-2 py-1 border border-[#B0B8C5] rounded"
                            >
                              <option value="">Select Gender</option>
                              <option value="Male">Male</option>
                              <option value="Female">Female</option>
                              <option value="Other">Other</option>
                              <option value="Non-binary">Non-binary</option>
                            </select>
                          </div>
                        ) : (
                          <div className="text-[#050F1C] text-base leading-[22px]">
                            {displayPerson?.gender || 'N/A'}
                          </div>
                        )}
                      </div>
                      <div className="flex items-start gap-1">
                        <div className="w-20 text-[#525866] text-xs">Age</div>
                        <div className="text-[#050F1C] text-base leading-[22px]">
                          {displayPerson?.date_of_birth ? calculateAge(displayPerson.date_of_birth) : 'N/A'}
                        </div>
                      </div>
                      <div className="flex self-stretch items-center gap-2">
                        <div className="w-20 text-[#050F1C] text-[10px] font-medium">Occupation</div>
                        {isEditing ? (
                          <input
                            type="text"
                            value={editFormData.occupation || ''}
                            onChange={(e) => setEditFormData({...editFormData, occupation: e.target.value})}
                            className="flex-1 text-[#050F1C] text-base px-2 py-1 border border-[#B0B8C5] rounded"
                            placeholder="Enter occupation"
                          />
                        ) : (
                          <div className="flex-1 text-[#050F1C] text-base">
                            {displayPerson?.occupation || displayPerson?.job_title || 'N/A'}
                          </div>
                        )}
                      </div>
                      <div className="flex self-stretch items-center gap-2">
                        <div className="w-20 text-[#050F1C] text-[10px] font-medium">Nationality</div>
                        {isEditing ? (
                          <input
                            type="text"
                            value={editFormData.nationality || ''}
                            onChange={(e) => setEditFormData({...editFormData, nationality: e.target.value})}
                            className="flex-1 text-[#050F1C] text-base px-2 py-1 border border-[#B0B8C5] rounded"
                            placeholder="Enter nationality"
                          />
                        ) : (
                          <div className="flex-1 text-[#050F1C] text-base">
                            {displayPerson?.nationality || 'N/A'}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Birth Data Section */}
                    <div className="flex flex-col self-stretch gap-1">
                      <div className="text-[#525866] text-xs">Birth data</div>
                      <div className="flex flex-col self-stretch gap-2">
                        <div className="flex self-stretch items-center gap-2">
                          <div className="w-20 text-[#050F1C] text-[10px] font-medium">Date</div>
                          {isEditing ? (
                            <div className="flex-1 relative">
                              <input
                                type="date"
                                value={editFormData.date_of_birth || ''}
                                onChange={(e) => setEditFormData({...editFormData, date_of_birth: e.target.value})}
                                max={new Date().toISOString().split('T')[0]}
                                className="flex-1 text-[#050F1C] text-base px-2 py-1 border border-[#B0B8C5] rounded"
                              />
                              <Calendar className="absolute right-2 top-2 w-4 h-4 text-gray-400 pointer-events-none" />
                            </div>
                          ) : (
                            <div className="flex-1 text-[#050F1C] text-base">
                              {displayPerson?.date_of_birth ? formatDate(displayPerson.date_of_birth) : 'N/A'}
                            </div>
                          )}
                        </div>
                        <div className="flex self-stretch items-center gap-2">
                          <div className="w-20 text-[#050F1C] text-[10px] font-medium">Location</div>
                          {isEditing ? (
                            <input
                              type="text"
                              value={editFormData.place_of_birth || ''}
                              onChange={(e) => setEditFormData({...editFormData, place_of_birth: e.target.value})}
                              className="flex-1 text-[#050F1C] text-base px-2 py-1 border border-[#B0B8C5] rounded"
                              placeholder="Enter place of birth"
                            />
                          ) : (
                            <div className="flex-1 text-[#050F1C] text-base">
                              {displayPerson?.place_of_birth || displayPerson?.city || 'N/A'}
                              {displayPerson?.region && `, ${getRegionDisplayName(displayPerson.region)}`}
                            </div>
                          )}
                        </div>
                        <div className="flex self-stretch items-center gap-2">
                          <div className="w-20 text-[#050F1C] text-[10px] font-medium">ID Number</div>
                          {isEditing ? (
                            <input
                              type="text"
                              value={editFormData.id_number || ''}
                              onChange={(e) => setEditFormData({...editFormData, id_number: e.target.value})}
                              className="flex-1 text-[#050F1C] text-base px-2 py-1 border border-[#B0B8C5] rounded"
                              placeholder="Enter ID number"
                            />
                          ) : (
                            <div className="flex-1 text-[#050F1C] text-base">
                              {displayPerson?.id_number || 'N/A'}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Contact Section */}
                    <div className="flex flex-col self-stretch gap-1">
                      <div className="text-[#525866] text-xs">Contact</div>
                      <div className="flex flex-col self-stretch gap-2">
                        <div className="flex self-stretch items-center gap-2">
                          <div className="w-20 text-[#050F1C] text-[10px] font-medium">Phone</div>
                          {isEditing ? (
                            <input
                              type="tel"
                              value={editFormData.phone_number || ''}
                              onChange={(e) => setEditFormData({...editFormData, phone_number: e.target.value})}
                              className="flex-1 text-[#050F1C] text-base px-2 py-1 border border-[#B0B8C5] rounded"
                              placeholder="Enter phone number"
                            />
                          ) : (
                            <div className="flex-1 text-[#050F1C] text-base">
                              {displayPerson?.phone_number || 'Not publicly available'}
                            </div>
                          )}
                        </div>
                        <div className="flex self-stretch items-center gap-2">
                          <div className="w-20 text-[#050F1C] text-[10px] font-medium">Email</div>
                          {isEditing ? (
                            <input
                              type="email"
                              value={editFormData.email || ''}
                              onChange={(e) => setEditFormData({...editFormData, email: e.target.value})}
                              className="flex-1 text-[#050F1C] text-base px-2 py-1 border border-[#B0B8C5] rounded"
                              placeholder="Enter email"
                            />
                          ) : (
                            <div className="flex-1 text-[#050F1C] text-base">
                              {displayPerson?.email || 'N/A'}
                            </div>
                          )}
                        </div>
                        <div className="flex self-stretch items-center gap-2">
                          <div className="w-20 text-[#050F1C] text-[10px] font-medium">Address</div>
                          {isEditing ? (
                            <input
                              type="text"
                              value={editFormData.address || ''}
                              onChange={(e) => setEditFormData({...editFormData, address: e.target.value})}
                              className="flex-1 text-[#050F1C] text-base px-2 py-1 border border-[#B0B8C5] rounded"
                              placeholder="Enter address"
                            />
                          ) : (
                            <div className="flex-1 text-[#050F1C] text-base">
                              {displayPerson?.address || 'N/A'}
                              {displayPerson?.city && `, ${displayPerson.city}`}
                              {displayPerson?.region && `, ${getRegionDisplayName(displayPerson.region)}`}
                            </div>
                          )}
                        </div>
                        {isEditing && (
                          <>
                            <div className="flex self-stretch items-center gap-2">
                              <div className="w-20 text-[#050F1C] text-[10px] font-medium">City</div>
                              <input
                                type="text"
                                value={editFormData.city || ''}
                                onChange={(e) => setEditFormData({...editFormData, city: e.target.value})}
                                className="flex-1 text-[#050F1C] text-base px-2 py-1 border border-[#B0B8C5] rounded"
                                placeholder="Enter city"
                              />
                            </div>
                            <div className="flex self-stretch items-center gap-2">
                              <div className="w-20 text-[#050F1C] text-[10px] font-medium">Region</div>
                              <input
                                type="text"
                                value={editFormData.region || ''}
                                onChange={(e) => setEditFormData({...editFormData, region: e.target.value})}
                                className="flex-1 text-[#050F1C] text-base px-2 py-1 border border-[#B0B8C5] rounded"
                                placeholder="Enter region"
                              />
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Profile Section */}
                    <div className="flex flex-col self-stretch gap-1">
                      <div className="text-[#525866] text-xs">Profile</div>
                      <div className="flex flex-col self-stretch gap-2">
                        <div className="flex self-stretch items-center gap-2">
                          <div className="w-20 text-[#050F1C] text-[10px] font-medium">Status</div>
                          {isEditing ? (
                            <select
                              value={editFormData.status || 'active'}
                              onChange={(e) => setEditFormData({...editFormData, status: e.target.value})}
                              className="flex-1 text-[#050F1C] text-base px-2 py-1 border border-[#B0B8C5] rounded"
                            >
                              <option value="active">Active</option>
                              <option value="inactive">Inactive</option>
                              <option value="archived">Archived</option>
                            </select>
                          ) : (
                            <div className="flex-1 text-[#050F1C] text-base">
                              {displayPerson?.status ? displayPerson.status.charAt(0).toUpperCase() + displayPerson.status.slice(1) : 'Active'}
                            </div>
                          )}
                        </div>
                        <div className="flex self-stretch items-center gap-2">
                          <div className="w-20 text-[#050F1C] text-[10px] font-medium">Last updated</div>
                          <div className="flex-1 text-[#050F1C] text-base">
                            {displayPerson?.updated_at ? formatDate(displayPerson.updated_at) : 'N/A'}
                          </div>
                        </div>
                        <div className="flex self-stretch items-center gap-2">
                          <div className="w-20 text-[#050F1C] text-[10px] font-medium">Verified</div>
                          {isEditing ? (
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={editFormData.is_verified || false}
                                onChange={(e) => setEditFormData({...editFormData, is_verified: e.target.checked})}
                                className="w-4 h-4"
                              />
                              <span className="text-[#050F1C] text-base">{editFormData.is_verified ? 'Yes' : 'No'}</span>
                            </label>
                          ) : (
                            <div className="flex-1 text-[#050F1C] text-base">
                              {displayPerson?.is_verified ? 'Yes' : 'No'}
                            </div>
                          )}
                        </div>
                        <div className="flex self-stretch items-center gap-2">
                          <div className="w-20 text-[#050F1C] text-[10px] font-medium">Marital Status</div>
                          {isEditing ? (
                            <select
                              value={editFormData.marital_status || ''}
                              onChange={(e) => setEditFormData({...editFormData, marital_status: e.target.value})}
                              className="flex-1 text-[#050F1C] text-base px-2 py-1 border border-[#B0B8C5] rounded"
                            >
                              <option value="">Select Marital Status</option>
                              <option value="Single">Single</option>
                              <option value="Married">Married</option>
                              <option value="Divorced">Divorced</option>
                              <option value="Widowed">Widowed</option>
                              <option value="Separated">Separated</option>
                              <option value="Domestic Partnership">Domestic Partnership</option>
                            </select>
                          ) : (
                            <div className="flex-1 text-[#050F1C] text-base">
                              {displayPerson?.marital_status || 'N/A'}
                            </div>
                          )}
                        </div>
                        <div className="flex self-stretch items-center gap-2">
                          <div className="w-20 text-[#050F1C] text-[10px] font-medium">Education</div>
                          {isEditing ? (
                            <input
                              type="text"
                              value={editFormData.education_level || ''}
                              onChange={(e) => setEditFormData({...editFormData, education_level: e.target.value})}
                              className="flex-1 text-[#050F1C] text-base px-2 py-1 border border-[#B0B8C5] rounded"
                              placeholder="Enter education level"
                            />
                          ) : (
                            <div className="flex-1 text-[#050F1C] text-base">
                              {displayPerson?.education_level || 'N/A'}
                            </div>
                          )}
                        </div>
                        {isEditing && (
                          <>
                            <div className="flex self-stretch items-center gap-2">
                              <div className="w-20 text-[#050F1C] text-[10px] font-medium">First Name</div>
                              <input
                                type="text"
                                value={editFormData.first_name || ''}
                                onChange={(e) => setEditFormData({...editFormData, first_name: e.target.value})}
                                className="flex-1 text-[#050F1C] text-base px-2 py-1 border border-[#B0B8C5] rounded"
                                placeholder="Enter first name"
                              />
                            </div>
                            <div className="flex self-stretch items-center gap-2">
                              <div className="w-20 text-[#050F1C] text-[10px] font-medium">Last Name</div>
                              <input
                                type="text"
                                value={editFormData.last_name || ''}
                                onChange={(e) => setEditFormData({...editFormData, last_name: e.target.value})}
                                className="flex-1 text-[#050F1C] text-base px-2 py-1 border border-[#B0B8C5] rounded"
                                placeholder="Enter last name"
                              />
                            </div>
                            <div className="flex self-stretch items-center gap-2">
                              <div className="w-20 text-[#050F1C] text-[10px] font-medium">Employer</div>
                              <input
                                type="text"
                                value={editFormData.employer || ''}
                                onChange={(e) => setEditFormData({...editFormData, employer: e.target.value})}
                                className="flex-1 text-[#050F1C] text-base px-2 py-1 border border-[#B0B8C5] rounded"
                                placeholder="Enter employer"
                              />
                            </div>
                            <div className="flex self-stretch items-center gap-2">
                              <div className="w-20 text-[#050F1C] text-[10px] font-medium">Job Title</div>
                              <input
                                type="text"
                                value={editFormData.job_title || ''}
                                onChange={(e) => setEditFormData({...editFormData, job_title: e.target.value})}
                                className="flex-1 text-[#050F1C] text-base px-2 py-1 border border-[#B0B8C5] rounded"
                                placeholder="Enter job title"
                              />
                            </div>
                            <div className="flex self-stretch items-center gap-2">
                              <div className="w-20 text-[#050F1C] text-[10px] font-medium">Spouse Name</div>
                              <input
                                type="text"
                                value={editFormData.spouse_name || ''}
                                onChange={(e) => setEditFormData({...editFormData, spouse_name: e.target.value})}
                                className="flex-1 text-[#050F1C] text-base px-2 py-1 border border-[#B0B8C5] rounded"
                                placeholder="Enter spouse name"
                              />
                            </div>
                            <div className="flex self-stretch items-center gap-2">
                              <div className="w-20 text-[#050F1C] text-[10px] font-medium">Children Count</div>
                              <input
                                type="number"
                                min="0"
                                value={editFormData.children_count || 0}
                                onChange={(e) => setEditFormData({...editFormData, children_count: parseInt(e.target.value) || 0})}
                                className="flex-1 text-[#050F1C] text-base px-2 py-1 border border-[#B0B8C5] rounded"
                                placeholder="Enter number of children"
                              />
                            </div>
                            <div className="flex self-stretch items-center gap-2">
                              <div className="w-20 text-[#050F1C] text-[10px] font-medium">Emergency Contact</div>
                              <input
                                type="text"
                                value={editFormData.emergency_contact || ''}
                                onChange={(e) => setEditFormData({...editFormData, emergency_contact: e.target.value})}
                                className="flex-1 text-[#050F1C] text-base px-2 py-1 border border-[#B0B8C5] rounded"
                                placeholder="Enter emergency contact"
                              />
                            </div>
                            <div className="flex self-stretch items-center gap-2">
                              <div className="w-20 text-[#050F1C] text-[10px] font-medium">Emergency Phone</div>
                              <input
                                type="tel"
                                value={editFormData.emergency_phone || ''}
                                onChange={(e) => setEditFormData({...editFormData, emergency_phone: e.target.value})}
                                className="flex-1 text-[#050F1C] text-base px-2 py-1 border border-[#B0B8C5] rounded"
                                placeholder="Enter emergency phone"
                              />
                            </div>
                            <div className="flex self-stretch items-center gap-2">
                              <div className="w-20 text-[#050F1C] text-[10px] font-medium">Notes</div>
                              <textarea
                                value={editFormData.notes || ''}
                                onChange={(e) => setEditFormData({...editFormData, notes: e.target.value})}
                                className="flex-1 text-[#050F1C] text-base px-2 py-1 border border-[#B0B8C5] rounded min-h-[80px]"
                                placeholder="Enter notes"
                              />
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </>
                )}

                {/* Error/Success Messages */}
                {updateError && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                    <X className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-red-800 font-medium text-sm">Error</p>
                      <p className="text-red-700 text-sm mt-1">{updateError}</p>
                    </div>
                    <button 
                      onClick={() => setUpdateError(null)} 
                      className="text-red-400 hover:text-red-600 flex-shrink-0"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}
                {updateSuccess && (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-green-800 font-medium text-sm">Success</p>
                      <p className="text-green-700 text-sm mt-1">Person profile updated successfully!</p>
                    </div>
                    <button 
                      onClick={() => setUpdateSuccess(false)} 
                      className="text-green-400 hover:text-green-600 flex-shrink-0"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}

                {/* Cases Section */}
                {relatedCases.length > 0 && (
                  <div className="flex flex-col self-stretch p-6 bg-white rounded-lg border border-solid border-[#E4E7EB] gap-8">
                    {/* Ongoing Cases */}
                    {relatedCases.filter(c => {
                      const status = (c.status || c.resolution_status || '').toLowerCase();
                      return status.includes('ongoing') || status.includes('pending') || (!status.includes('resolved') && !status.includes('closed'));
                    }).length > 0 && (
                      <div className="flex flex-col self-stretch gap-2">
                        <div className="text-[#3B82F6] text-xs">ONGOING CASES</div>
                        <div className="flex flex-col self-stretch overflow-hidden rounded-[14px] border border-solid border-[#E5E8EC] gap-1 w-full">
                          {/* Table Header */}
                          <div className="flex self-stretch py-4 bg-[#F4F6F9] items-center gap-3 w-full">
                            <div className="flex-1 min-w-[200px] p-2 pl-4"><span className="text-[#070810] text-sm font-bold">Case Title</span></div>
                            <div className="w-[140px] p-2"><span className="text-[#070810] text-sm font-bold">Suit No.</span></div>
                            <div className="w-[120px] p-2"><span className="text-[#070810] text-sm font-bold">Role</span></div>
                            <div className="w-[120px] p-2"><span className="text-[#070810] text-sm font-bold">Court</span></div>
                            <div className="w-[130px] p-2"><span className="text-[#070810] text-sm font-bold">Date Filed</span></div>
                            <div className="w-[140px] p-2"><span className="text-[#070810] text-sm font-bold">Status</span></div>
                            <div className="w-[100px] p-2 pr-4 text-right"><span className="text-[#070810] text-sm font-bold">Action</span></div>
                          </div>
                          {/* Table Rows */}
                          {relatedCases.filter(c => {
                            const outcome = c.outcome || (c.case_metadata?.outcome) || c.resolution_status || c.status || '';
                            const outcomeLower = outcome.toLowerCase();
                            return outcomeLower.includes('pending') || outcomeLower.includes('ongoing') || outcomeLower.includes('in progress') || (!outcomeLower.includes('resolved') && !outcomeLower.includes('closed') && !outcomeLower.includes('favorable') && !outcomeLower.includes('unfavorable'));
                          }).map((caseItem, index) => {
                            const role = getPersonRole(caseItem);
                            const outcome = caseItem.outcome || (caseItem.case_metadata?.outcome) || caseItem.resolution_status || caseItem.status || 'Unknown';
                            const courtName = caseItem.court_type 
                              ? `${caseItem.court_type}${caseItem.court_division ? `, ${caseItem.court_division}` : ''}`
                              : 'N/A';
                            
                            return (
                              <div key={caseItem.id || `ongoing-${index}`} className="flex self-stretch min-h-[70px] py-3 border-b border-[#E5E8EC] items-start w-full">
                                <div className="flex self-stretch items-start gap-3 flex-1 w-full">
                                  <div className="flex-1 min-w-[200px] p-2 pl-4">
                                    <span className="text-[#070810] text-sm leading-relaxed break-words block text-left">{caseItem.title || 'N/A'}</span>
                                  </div>
                                  <div className="w-[140px] p-2 flex items-start">
                                    <span className="text-[#070810] text-sm break-words text-left">{caseItem.suit_reference_number || 'N/A'}</span>
                                  </div>
                                  <div className="w-[120px] p-2 flex items-start">
                                    <span className="text-[#070810] text-sm text-left">{role}</span>
                                  </div>
                                  <div className="w-[120px] p-2 flex items-start">
                                    <span className="text-[#070810] text-sm text-left">{courtName}</span>
                                  </div>
                                  <div className="w-[130px] p-2 flex items-start">
                                    <span className="text-[#070810] text-sm text-left">{formatCaseDate(caseItem.date)}</span>
                                  </div>
                                  <div className="w-[140px] p-2 flex items-start">
                                    <div className={`px-2 py-1 rounded-lg ${getOutcomeBadgeColor(outcome)}`}>
                                      <span className="text-xs font-medium">{outcome}</span>
                                    </div>
                                  </div>
                                  <div className="w-[100px] p-2 pr-4 flex items-end justify-end">
                                    <button 
                                      onClick={() => setSelectedCase({
                                        id: caseItem.id,
                                        title: caseItem.title,
                                        suitNo: caseItem.suit_reference_number,
                                        status: outcome,
                                        date: caseItem.date,
                                        court: courtName,
                                        role: role
                                      })}
                                      className="flex items-center text-[#022658] text-sm font-bold hover:underline cursor-pointer whitespace-nowrap"
                                    >
                                      View
                                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                        <path d="M6 4L10 8L6 12" stroke="#050F1C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                      </svg>
                                    </button>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Closed Cases */}
                    {relatedCases.filter(c => {
                      const status = (c.status || c.resolution_status || '').toLowerCase();
                      return status.includes('resolved') || status.includes('closed') || status.includes('judgment');
                    }).length > 0 && (
                      <div className="flex flex-col self-stretch gap-2">
                        <div className="text-[#050F1C] text-xs">CLOSED CASES</div>
                        <div className="flex flex-col self-stretch overflow-hidden rounded-[14px] border border-solid border-[#E5E8EC] gap-1 w-full">
                          {/* Table Header */}
                          <div className="flex self-stretch py-4 bg-[#F4F6F9] items-center gap-3 w-full">
                            <div className="flex-1 min-w-[200px] p-2 pl-4"><span className="text-[#070810] text-sm font-bold">Case Title</span></div>
                            <div className="w-[140px] p-2"><span className="text-[#070810] text-sm font-bold">Suit No.</span></div>
                            <div className="w-[120px] p-2"><span className="text-[#070810] text-sm font-bold">Role</span></div>
                            <div className="w-[120px] p-2"><span className="text-[#070810] text-sm font-bold">Court</span></div>
                            <div className="w-[130px] p-2"><span className="text-[#070810] text-sm font-bold">Date Filed</span></div>
                            <div className="w-[140px] p-2"><span className="text-[#070810] text-sm font-bold">Status</span></div>
                            <div className="w-[100px] p-2 pr-4 text-right"><span className="text-[#070810] text-sm font-bold">Action</span></div>
                          </div>
                          {/* Table Rows */}
                          {relatedCases.filter(c => {
                            const outcome = c.outcome || (c.case_metadata?.outcome) || c.resolution_status || c.status || '';
                            const outcomeLower = outcome.toLowerCase();
                            return outcomeLower.includes('resolved') || outcomeLower.includes('closed') || outcomeLower.includes('favorable') || outcomeLower.includes('unfavorable') || outcomeLower.includes('mixed') || outcomeLower.includes('judgment');
                          }).map((caseItem, index) => {
                            const role = getPersonRole(caseItem);
                            const outcome = caseItem.outcome || (caseItem.case_metadata?.outcome) || caseItem.resolution_status || caseItem.status || 'Unknown';
                            const courtName = caseItem.court_type 
                              ? `${caseItem.court_type}${caseItem.court_division ? `, ${caseItem.court_division}` : ''}`
                              : 'N/A';
                            
                            return (
                              <div key={caseItem.id || `closed-${index}`} className="flex self-stretch min-h-[70px] py-3 border-b border-[#E5E8EC] items-start w-full">
                                <div className="flex self-stretch items-start gap-3 flex-1 w-full">
                                  <div className="flex-1 min-w-[200px] p-2 pl-4">
                                    <span className="text-[#070810] text-sm leading-relaxed break-words block text-left">{caseItem.title || 'N/A'}</span>
                                  </div>
                                  <div className="w-[140px] p-2 flex items-start">
                                    <span className="text-[#070810] text-sm break-words text-left">{caseItem.suit_reference_number || 'N/A'}</span>
                                  </div>
                                  <div className="w-[120px] p-2 flex items-start">
                                    <span className="text-[#070810] text-sm text-left">{role}</span>
                                  </div>
                                  <div className="w-[120px] p-2 flex items-start">
                                    <span className="text-[#070810] text-sm text-left">{courtName}</span>
                                  </div>
                                  <div className="w-[130px] p-2 flex items-start">
                                    <span className="text-[#070810] text-sm text-left">{formatCaseDate(caseItem.date)}</span>
                                  </div>
                                  <div className="w-[140px] p-2 flex items-start">
                                    <div className={`px-2 py-1 rounded-lg ${getOutcomeBadgeColor(outcome)}`}>
                                      <span className="text-xs font-medium">{outcome}</span>
                                    </div>
                                  </div>
                                  <div className="w-[100px] p-2 pr-4 flex items-end justify-end">
                                    <button 
                                      onClick={() => setSelectedCase({
                                        id: caseItem.id,
                                        title: caseItem.title,
                                        suitNo: caseItem.suit_reference_number,
                                        status: outcome,
                                        date: caseItem.date,
                                        court: courtName,
                                        role: role
                                      })}
                                      className="flex items-center text-[#022658] text-sm font-bold hover:underline cursor-pointer whitespace-nowrap"
                                    >
                                      View
                                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                        <path d="M6 4L10 8L6 12" stroke="#050F1C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                      </svg>
                                    </button>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Employment Records Tab */}
            {activeTab === 'employment' && (
              <div className="flex flex-col self-stretch bg-white p-6 gap-8 rounded-lg border border-solid border-[#E4E7EB]" style={{ boxShadow: '4px 4px 4px #0708101A' }}>
                {/* Header with Add Button */}
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-[#040E1B]">Employment Records</h3>
                  <button
                    onClick={() => {
                      setEditingEmployment(null);
                      setShowAddEmployment(true);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-[#022658] text-white rounded-lg hover:bg-[#033a7a] transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Employment</span>
                  </button>
                </div>

                {/* Current Employment */}
                <div className="flex flex-col items-start self-stretch gap-2">
                  <span className="text-blue-500 text-xs">CURRENT EMPLOYMENT</span>
                  <div className="flex flex-col self-stretch gap-1 rounded-[14px] border border-solid border-[#E5E8EC] w-full">
                    {/* Table Header */}
                    <div className="flex items-center self-stretch bg-[#F4F6F9] py-4 gap-3 w-full">
                      <div className="flex-1 min-w-[150px] p-2 pl-4">
                        <span className="text-[#070810] text-sm font-bold">Company</span>
                      </div>
                      <div className="w-[150px] p-2">
                        <span className="text-[#070810] text-sm font-bold">Position(s)</span>
                      </div>
                      <div className="w-[150px] p-2">
                        <span className="text-[#070810] text-sm font-bold">Department</span>
                      </div>
                      <div className="w-[130px] p-2">
                        <span className="text-[#070810] text-sm font-bold">Start date</span>
                      </div>
                      <div className="w-[130px] p-2">
                        <span className="text-[#070810] text-sm font-bold">End date</span>
                      </div>
                      <div className="w-[120px] p-2">
                        <span className="text-[#070810] text-sm font-bold">Status</span>
                      </div>
                      <div className="flex-1 min-w-[150px] p-2 pr-4">
                        <span className="text-[#070810] text-sm font-bold">Address</span>
                      </div>
                      <div className="w-[100px] p-2">
                        <span className="text-[#070810] text-sm font-bold">Actions</span>
                      </div>
                    </div>
                    {/* Table Rows - Dynamic from database */}
                    {employmentLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#022658]"></div>
                        <span className="ml-3 text-[#525866] text-sm">Loading employment records...</span>
                      </div>
                    ) : employmentRecords.filter(emp => emp.is_current).length > 0 ? (
                      employmentRecords.filter(emp => emp.is_current).map((employment, idx) => (
                        <div key={employment.id || idx} className="flex items-start self-stretch py-3 border-b border-[#E5E8EC] w-full">
                          <div className="flex-1 min-w-[150px] p-2 pl-4">
                            <span className="text-[#070810] text-sm text-left">{employment.company_name || 'N/A'}</span>
                          </div>
                          <div className="w-[150px] p-2">
                            <span className="text-[#070810] text-sm text-left">{employment.position || 'N/A'}</span>
                          </div>
                          <div className="w-[150px] p-2">
                            <span className="text-[#070810] text-sm text-left">{employment.department || 'N/A'}</span>
                          </div>
                          <div className="w-[130px] p-2">
                            <span className="text-[#070810] text-sm text-left">
                              {employment.start_date ? formatDateShort(employment.start_date) : 'N/A'}
                            </span>
                          </div>
                          <div className="w-[130px] p-2">
                            <span className="text-[#070810] text-sm text-left">
                              {employment.end_date ? formatDateShort(employment.end_date) : 'Present'}
                            </span>
                          </div>
                          <div className="w-[120px] p-2">
                            <span className="text-[#070810] text-sm text-left">{employment.is_current ? 'Active' : 'Inactive'}</span>
                          </div>
                          <div className="flex-1 min-w-[150px] p-2 pr-4">
                            <span className="text-[#070810] text-sm text-left">{employment.address || 'N/A'}</span>
                          </div>
                          <div className="w-[100px] p-2 flex items-center gap-2">
                            <button
                              onClick={() => {
                                setEditingEmployment(employment);
                                setShowAddEmployment(true);
                              }}
                              className="text-blue-600 hover:text-blue-800 text-sm"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteEmployment(employment.id)}
                              className="text-red-600 hover:text-red-800 text-sm"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="flex items-center justify-center py-8">
                        <span className="text-[#868C98] text-sm">No current employment records found</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Previous Employments */}
                <div className="flex flex-col items-start self-stretch gap-2">
                  <span className="text-[#040E1B] text-xs">PREVIOUS EMPLOYMENTS</span>
                  <div className="flex flex-col self-stretch gap-1 rounded-[14px] border border-solid border-[#E5E8EC] w-full">
                    {/* Table Header */}
                    <div className="flex items-center self-stretch bg-[#F4F6F9] py-4 gap-3 w-full">
                      <div className="flex-1 min-w-[150px] p-2 pl-4">
                        <span className="text-[#070810] text-sm font-bold">Company</span>
                      </div>
                      <div className="w-[150px] p-2">
                        <span className="text-[#070810] text-sm font-bold">Position(s)</span>
                      </div>
                      <div className="w-[150px] p-2">
                        <span className="text-[#070810] text-sm font-bold">Department</span>
                      </div>
                      <div className="w-[130px] p-2">
                        <span className="text-[#070810] text-sm font-bold">Start date</span>
                      </div>
                      <div className="w-[130px] p-2">
                        <span className="text-[#070810] text-sm font-bold">End date</span>
                      </div>
                      <div className="w-[180px] p-2">
                        <span className="text-[#070810] text-sm font-bold">Reason for Leaving</span>
                      </div>
                      <div className="flex-1 min-w-[150px] p-2 pr-4">
                        <span className="text-[#070810] text-sm font-bold">Address</span>
                      </div>
                    </div>
                    {/* Table Rows - Dynamic from database */}
                    {employmentLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#022658]"></div>
                        <span className="ml-3 text-[#525866] text-sm">Loading previous employment...</span>
                      </div>
                    ) : employmentRecords.filter(emp => !emp.is_current).length > 0 ? (
                      employmentRecords.filter(emp => !emp.is_current).map((employment, idx) => (
                        <div key={employment.id || idx} className="flex items-start self-stretch py-3 border-b border-[#E5E8EC] w-full">
                          <div className="flex-1 min-w-[150px] p-2 pl-4">
                            <span className="text-[#070810] text-sm text-left">{employment.company_name || 'N/A'}</span>
                          </div>
                          <div className="w-[150px] p-2">
                            <span className="text-[#070810] text-sm text-left">{employment.position || 'N/A'}</span>
                          </div>
                          <div className="w-[150px] p-2">
                            <span className="text-[#070810] text-sm text-left">{employment.department || 'N/A'}</span>
                          </div>
                          <div className="w-[130px] p-2">
                            <span className="text-[#070810] text-sm text-left">
                              {employment.start_date ? formatDateShort(employment.start_date) : 'N/A'}
                            </span>
                          </div>
                          <div className="w-[130px] p-2">
                            <span className="text-[#070810] text-sm text-left">
                              {employment.end_date ? formatDateShort(employment.end_date) : 'N/A'}
                            </span>
                          </div>
                          <div className="w-[180px] p-2">
                            <span className="text-[#070810] text-sm text-left">{employment.reason_for_leaving || 'N/A'}</span>
                          </div>
                          <div className="flex-1 min-w-[150px] p-2 pr-4">
                            <span className="text-[#070810] text-sm text-left">{employment.address || 'N/A'}</span>
                          </div>
                          <div className="w-[100px] p-2 flex items-center gap-2">
                            <button
                              onClick={() => {
                                setEditingEmployment(employment);
                                setShowAddEmployment(true);
                              }}
                              className="text-blue-600 hover:text-blue-800 text-sm"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteEmployment(employment.id)}
                              className="text-red-600 hover:text-red-800 text-sm"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="flex items-center justify-center py-8">
                        <span className="text-[#868C98] text-sm">No previous employment records found</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Affiliated Persons Tab */}
            {activeTab === 'affiliated' && (
              <div className="flex flex-col self-stretch p-4 bg-white rounded-3xl gap-4">
                {/* Header with Add Button */}
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-[#040E1B]">Affiliated Persons</h3>
                  <button
                    onClick={() => setShowAddRelationship(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-[#022658] text-white rounded-lg hover:bg-[#033a7a] transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Relationship</span>
                  </button>
                </div>

                {/* Search and Filter Controls */}
                <div className="flex self-stretch justify-between items-start">
                  <div className="w-[284px] relative flex flex-col items-start">
                    <div className="w-[490px] py-2 px-7 bg-[#F7F8FA] overflow-hidden rounded-[5.80px] border border-solid border-[#F7F8FA] flex items-center justify-center">
                      <div className="flex-1 overflow-hidden flex flex-col items-start justify-start">
                        <div className="self-stretch flex flex-col justify-center text-[#868C98] text-[10px]">
                          Search Person
                        </div>
                      </div>
                    </div>
                    <div className="w-[11.61px] h-[11.61px] absolute left-2 top-[10px]">
                      <div className="w-[7.74px] h-[7.74px] absolute left-[1.45px] top-[1.45px] border border-[#868C98] rounded-full"></div>
                      <div className="w-[2.08px] h-[2.08px] absolute left-[8.08px] top-[8.08px] border border-[#868C98]"></div>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-[5.80px]">
                    <div className="px-[9.16px] py-[7.70px] rounded border border-solid border-[#D4E1EA] flex items-center gap-[5.80px]">
                      <div className="w-[11.61px] h-[11.61px] relative">
                        <div className="w-[9.67px] h-[8.71px] absolute left-[0.97px] top-[1.45px] border border-[#868C98]"></div>
                      </div>
                      <div className="flex flex-col items-center">
                        <div className="text-center text-[#525866] text-xs">Filter</div>
                      </div>
                    </div>
                    <div className="px-[9.16px] py-[7.70px] rounded border border-solid border-[#D4E1EA] flex items-center gap-[5.80px]">
                      <div className="w-[11.61px] h-[11.61px] relative">
                        <div className="w-[6.77px] h-[3.39px] absolute left-[2.42px] top-[5.80px] border border-[#868C98]"></div>
                      </div>
                      <div className="flex flex-col items-center">
                        <div className="text-center text-[#525866] text-xs">Sort</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Affiliated Persons Table */}
                <div className="flex flex-col self-stretch overflow-hidden rounded-[14px] border border-solid border-[#E5E8EC] gap-1 w-full">
                  {/* Table Header */}
                  <div className="flex self-stretch py-4 bg-[#F4F6F9] items-center gap-3 w-full">
                    <div className="w-[120px] p-2 pl-4">
                      <span className="text-[#070810] text-sm font-bold">Relationship</span>
                    </div>
                    <div className="flex-1 min-w-[150px] p-2">
                      <span className="text-[#070810] text-sm font-bold">Name</span>
                    </div>
                    <div className="w-[140px] p-2">
                      <span className="text-[#070810] text-sm font-bold">Contact</span>
                    </div>
                    <div className="w-[120px] p-2">
                      <span className="text-[#070810] text-sm font-bold">D-O-B</span>
                    </div>
                    <div className="w-[140px] p-2">
                      <span className="text-[#070810] text-sm font-bold">Birth place</span>
                    </div>
                    <div className="flex-1 min-w-[150px] p-2">
                      <span className="text-[#070810] text-sm font-bold">Company</span>
                    </div>
                    <div className="w-[120px] p-2">
                      <span className="text-[#070810] text-sm font-bold">Position</span>
                    </div>
                    <div className="w-[100px] p-2">
                      <span className="text-[#070810] text-sm font-bold">Cases</span>
                    </div>
                      <div className="w-[140px] p-2 pr-4">
                        <span className="text-[#070810] text-sm font-bold">Risk score</span>
                      </div>
                      <div className="w-[100px] p-2">
                        <span className="text-[#070810] text-sm font-bold">Actions</span>
                      </div>
                    </div>

                  {/* Table Rows - Dynamic from database */}
                  {relationshipsLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#022658]"></div>
                      <span className="ml-3 text-[#525866] text-sm">Loading relationships...</span>
                    </div>
                  ) : relationships.length > 0 ? (
                    relationships.map((relationship, idx) => {
                      // If related_person_id exists, fetch full person details
                      const relatedPerson = relationship.related_person || null;
                      const personId = relatedPerson?.id || relationship.related_person_id;
                      const hasPersonId = !!personId;
                      console.log('[PersonDetails] Rendering relationship:', {
                        idx,
                        relationship_id: relationship.id,
                        related_person_id: relationship.related_person_id,
                        relatedPerson: relatedPerson,
                        personId: personId,
                        hasPersonId: hasPersonId
                      });
                      return (
                        <div 
                          key={relationship.id || idx} 
                          className="flex self-stretch py-3 border-b border-[#E5E8EC] items-start w-full"
                          style={{ position: 'relative' }}
                        >
                          <div className="w-[120px] p-2 pl-4">
                            <span className="text-[#070810] text-sm text-left">{relationship.relationship_type || 'N/A'}</span>
                          </div>
                          <div className="flex-1 min-w-[150px] p-2" style={{ position: 'relative', zIndex: 10 }}>
                            {hasPersonId ? (
                              <a
                                href="#"
                                onClick={async (e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  console.log('[PersonDetails] Clicked on related person name:', {
                                    relatedPerson,
                                    relationship,
                                    personId,
                                    hasPersonId
                                  });
                                  
                                  // Navigate to the related person's profile
                                  if (onViewRelatedPerson) {
                                    // Fetch full person data if needed
                                    try {
                                      console.log('[PersonDetails] Fetching full person data for ID:', personId);
                                      const fullPersonData = await apiGet(`/people/${personId}`);
                                      console.log('[PersonDetails] Fetched person data:', fullPersonData);
                                      onViewRelatedPerson({ id: personId, fullData: fullPersonData });
                                    } catch (error) {
                                      console.error('Error fetching related person data:', error);
                                      // Fallback to using available data
                                      onViewRelatedPerson({ id: personId, fullData: relatedPerson || {} });
                                    }
                                  } else if (onNavigate) {
                                    // Fallback to onNavigate if onViewRelatedPerson is not provided
                                    onNavigate('persons', { person: { id: personId, fullData: relatedPerson || {} } });
                                  }
                                }}
                                className="text-[#022658] hover:text-[#033a7a] hover:underline text-sm text-left font-medium cursor-pointer"
                                style={{ 
                                  display: 'block',
                                  width: '100%',
                                  pointerEvents: 'auto',
                                  cursor: 'pointer',
                                  textDecoration: 'none'
                                }}
                                title="Click to view person profile"
                              >
                                {relationship.related_person_name || relatedPerson?.full_name || 'N/A'}
                              </a>
                            ) : (
                              <span className="text-[#070810] text-sm text-left">{relationship.related_person_name || (relatedPerson?.full_name) || 'N/A'}</span>
                            )}
                          </div>
                          <div className="w-[140px] p-2">
                            <span className="text-[#070810] text-sm text-left">{relationship.phone || (relatedPerson?.phone_number) || 'N/A'}</span>
                          </div>
                          <div className="w-[120px] p-2">
                            <span className="text-[#070810] text-sm text-left">
                              {relatedPerson?.date_of_birth ? formatDateShort(relatedPerson.date_of_birth) : 'N/A'}
                            </span>
                          </div>
                          <div className="w-[140px] p-2">
                            <span className="text-[#070810] text-sm text-left">
                              {relatedPerson?.place_of_birth || relatedPerson?.city || 'N/A'}
                            </span>
                          </div>
                          <div className="flex-1 min-w-[150px] p-2">
                            <span className="text-[#070810] text-sm text-left">{relatedPerson?.employer || relatedPerson?.organization || 'N/A'}</span>
                          </div>
                          <div className="w-[120px] p-2">
                            <span className="text-[#070810] text-sm text-left">{relatedPerson?.job_title || relatedPerson?.occupation || 'N/A'}</span>
                          </div>
                          <div className="w-[100px] p-2">
                            <span className="text-[#070810] text-sm text-left">{relatedPerson?.case_count || 0}</span>
                          </div>
                          <div className="w-[140px] p-2 pr-4 flex items-start">
                            {relatedPerson?.risk_score !== undefined && relatedPerson?.risk_level ? (
                              <div className={`px-2 py-1 rounded-lg ${
                                (relatedPerson.risk_score >= 70) ? 'bg-red-100' :
                                (relatedPerson.risk_score >= 40) ? 'bg-yellow-100' :
                                'bg-[#30AB401A]'
                              }`}>
                                <span className={`text-xs font-medium ${
                                  (relatedPerson.risk_score >= 70) ? 'text-red-600' :
                                  (relatedPerson.risk_score >= 40) ? 'text-yellow-600' :
                                  'text-[#10B981]'
                                }`}>
                                  {Math.round(relatedPerson.risk_score)} - {relatedPerson.risk_level}
                                </span>
                              </div>
                            ) : (
                              <span className="text-[#868C98] text-xs">N/A</span>
                            )}
                          </div>
                          <div className="w-[100px] p-2 flex items-center gap-2">
                            <button
                              onClick={() => handleDeleteRelationship(relationship.id)}
                              className="text-red-600 hover:text-red-800 text-sm"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="flex items-center justify-center py-8">
                      <span className="text-[#868C98] text-sm">No affiliated persons found</span>
                    </div>
                  )}
                </div>

                {/* All Relationships Section */}
                {allRelationshipsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#022658]"></div>
                    <span className="ml-3 text-[#525866] text-sm">Loading all relationships...</span>
                  </div>
                ) : allRelationships && (
                  <div className="flex flex-col gap-6 mt-6">
                    {/* Bank Relationships */}
                    {(allRelationships.banks?.directors?.length > 0 || 
                      allRelationships.banks?.secretaries?.length > 0 || 
                      allRelationships.banks?.auditors?.length > 0 || 
                      allRelationships.banks?.shareholders?.length > 0 || 
                      allRelationships.banks?.beneficial_owners?.length > 0) && (
                      <div className="flex flex-col gap-4">
                        <h4 className="text-base font-semibold text-[#040E1B] flex items-center gap-2">
                          <Building2 className="w-5 h-5" />
                          Bank Relationships
                        </h4>
                        
                        {/* Directors */}
                        {allRelationships.banks.directors?.length > 0 && (
                          <div className="border border-[#E5E8EC] rounded-lg overflow-hidden">
                            <div className="bg-[#F4F6F9] px-4 py-2">
                              <span className="text-sm font-semibold text-[#070810]">Directors ({allRelationships.banks.directors.length})</span>
                            </div>
                            <div className="divide-y divide-[#E5E8EC]">
                              {allRelationships.banks.directors.map((director, idx) => (
                                <div key={idx} className="px-4 py-3 flex items-center justify-between">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                      <span className="text-sm text-[#070810] font-medium">{director.bank_name}</span>
                                      {director.position && (
                                        <span className="text-xs text-[#868C98]">({director.position})</span>
                                      )}
                                    </div>
                                    {director.appointment_date && (
                                      <span className="text-xs text-[#868C98]">Appointed: {formatDateShort(director.appointment_date)}</span>
                                    )}
                                  </div>
                                  <button
                                    onClick={async () => {
                                      try {
                                        const bankData = await apiGet(`/api/admin/banks/${director.bank_id}`);
                                        if (onNavigate) {
                                          sessionStorage.setItem('selectedBankData', JSON.stringify(bankData));
                                          onNavigate('companies', { bank: bankData, industry: { id: 'banking', name: 'Banking & Finance' } });
                                        }
                                      } catch (err) {
                                        console.error('Error fetching bank details:', err);
                                      }
                                    }}
                                    className="flex items-center gap-1 text-[#022658] hover:text-[#033a7a] text-sm font-medium"
                                  >
                                    <span>View Bank</span>
                                    <ExternalLink className="w-4 h-4" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Secretaries */}
                        {allRelationships.banks.secretaries?.length > 0 && (
                          <div className="border border-[#E5E8EC] rounded-lg overflow-hidden">
                            <div className="bg-[#F4F6F9] px-4 py-2">
                              <span className="text-sm font-semibold text-[#070810]">Secretaries ({allRelationships.banks.secretaries.length})</span>
                            </div>
                            <div className="divide-y divide-[#E5E8EC]">
                              {allRelationships.banks.secretaries.map((secretary, idx) => (
                                <div key={idx} className="px-4 py-3 flex items-center justify-between">
                                  <div className="flex-1">
                                    <span className="text-sm text-[#070810] font-medium">{secretary.bank_name}</span>
                                    {secretary.appointment_date && (
                                      <span className="text-xs text-[#868C98] block">Appointed: {formatDateShort(secretary.appointment_date)}</span>
                                    )}
                                  </div>
                                  <button
                                    onClick={async () => {
                                      try {
                                        const bankData = await apiGet(`/api/admin/banks/${secretary.bank_id}`);
                                        if (onNavigate) {
                                          sessionStorage.setItem('selectedBankData', JSON.stringify(bankData));
                                          onNavigate('companies', { bank: bankData, industry: { id: 'banking', name: 'Banking & Finance' } });
                                        }
                                      } catch (err) {
                                        console.error('Error fetching bank details:', err);
                                      }
                                    }}
                                    className="flex items-center gap-1 text-[#022658] hover:text-[#033a7a] text-sm font-medium"
                                  >
                                    <span>View Bank</span>
                                    <ExternalLink className="w-4 h-4" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Auditors */}
                        {allRelationships.banks.auditors?.length > 0 && (
                          <div className="border border-[#E5E8EC] rounded-lg overflow-hidden">
                            <div className="bg-[#F4F6F9] px-4 py-2">
                              <span className="text-sm font-semibold text-[#070810]">Auditors ({allRelationships.banks.auditors.length})</span>
                            </div>
                            <div className="divide-y divide-[#E5E8EC]">
                              {allRelationships.banks.auditors.map((auditor, idx) => (
                                <div key={idx} className="px-4 py-3 flex items-center justify-between">
                                  <div className="flex-1">
                                    <span className="text-sm text-[#070810] font-medium">{auditor.bank_name}</span>
                                    {auditor.appointment_date && (
                                      <span className="text-xs text-[#868C98] block">Appointed: {formatDateShort(auditor.appointment_date)}</span>
                                    )}
                                  </div>
                                  <button
                                    onClick={async () => {
                                      try {
                                        const bankData = await apiGet(`/api/admin/banks/${auditor.bank_id}`);
                                        if (onNavigate) {
                                          sessionStorage.setItem('selectedBankData', JSON.stringify(bankData));
                                          onNavigate('companies', { bank: bankData, industry: { id: 'banking', name: 'Banking & Finance' } });
                                        }
                                      } catch (err) {
                                        console.error('Error fetching bank details:', err);
                                      }
                                    }}
                                    className="flex items-center gap-1 text-[#022658] hover:text-[#033a7a] text-sm font-medium"
                                  >
                                    <span>View Bank</span>
                                    <ExternalLink className="w-4 h-4" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Shareholders */}
                        {allRelationships.banks.shareholders?.length > 0 && (
                          <div className="border border-[#E5E8EC] rounded-lg overflow-hidden">
                            <div className="bg-[#F4F6F9] px-4 py-2">
                              <span className="text-sm font-semibold text-[#070810]">Shareholders ({allRelationships.banks.shareholders.length})</span>
                            </div>
                            <div className="divide-y divide-[#E5E8EC]">
                              {allRelationships.banks.shareholders.map((shareholder, idx) => (
                                <div key={idx} className="px-4 py-3 flex items-center justify-between">
                                  <div className="flex-1">
                                    <span className="text-sm text-[#070810] font-medium">{shareholder.bank_name}</span>
                                    {shareholder.number_of_shares && (
                                      <span className="text-xs text-[#868C98] block">Shares: {shareholder.number_of_shares.toLocaleString()}</span>
                                    )}
                                  </div>
                                  <button
                                    onClick={async () => {
                                      try {
                                        const bankData = await apiGet(`/api/admin/banks/${shareholder.bank_id}`);
                                        if (onNavigate) {
                                          sessionStorage.setItem('selectedBankData', JSON.stringify(bankData));
                                          onNavigate('companies', { bank: bankData, industry: { id: 'banking', name: 'Banking & Finance' } });
                                        }
                                      } catch (err) {
                                        console.error('Error fetching bank details:', err);
                                      }
                                    }}
                                    className="flex items-center gap-1 text-[#022658] hover:text-[#033a7a] text-sm font-medium"
                                  >
                                    <span>View Bank</span>
                                    <ExternalLink className="w-4 h-4" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Beneficial Owners */}
                        {allRelationships.banks.beneficial_owners?.length > 0 && (
                          <div className="border border-[#E5E8EC] rounded-lg overflow-hidden">
                            <div className="bg-[#F4F6F9] px-4 py-2">
                              <span className="text-sm font-semibold text-[#070810]">Beneficial Owners ({allRelationships.banks.beneficial_owners.length})</span>
                            </div>
                            <div className="divide-y divide-[#E5E8EC]">
                              {allRelationships.banks.beneficial_owners.map((owner, idx) => (
                                <div key={idx} className="px-4 py-3 flex items-center justify-between">
                                  <div className="flex-1">
                                    <span className="text-sm text-[#070810] font-medium">{owner.bank_name}</span>
                                    {owner.percentage_ownership && (
                                      <span className="text-xs text-[#868C98] block">Ownership: {owner.percentage_ownership}%</span>
                                    )}
                                  </div>
                                  <button
                                    onClick={async () => {
                                      try {
                                        const bankData = await apiGet(`/api/admin/banks/${owner.bank_id}`);
                                        if (onNavigate) {
                                          sessionStorage.setItem('selectedBankData', JSON.stringify(bankData));
                                          onNavigate('companies', { bank: bankData, industry: { id: 'banking', name: 'Banking & Finance' } });
                                        }
                                      } catch (err) {
                                        console.error('Error fetching bank details:', err);
                                      }
                                    }}
                                    className="flex items-center gap-1 text-[#022658] hover:text-[#033a7a] text-sm font-medium"
                                  >
                                    <span>View Bank</span>
                                    <ExternalLink className="w-4 h-4" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Marriage Officers */}
                    {allRelationships.marriage_officers?.length > 0 && (
                      <div className="flex flex-col gap-4">
                        <h4 className="text-base font-semibold text-[#040E1B]">Marriage Officers ({allRelationships.marriage_officers.length})</h4>
                        <div className="border border-[#E5E8EC] rounded-lg overflow-hidden">
                          <div className="divide-y divide-[#E5E8EC]">
                            {allRelationships.marriage_officers.map((officer, idx) => (
                              <div key={idx} className="px-4 py-3">
                                <div className="text-sm text-[#070810] font-medium">{officer.officer_name}</div>
                                {officer.church && <div className="text-xs text-[#868C98]">Church: {officer.church}</div>}
                                {officer.location && <div className="text-xs text-[#868C98]">Location: {officer.location}</div>}
                                {officer.appointment_date && <div className="text-xs text-[#868C98]">Appointed: {formatDateShort(officer.appointment_date)}</div>}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Change of Name Records */}
                    {allRelationships.change_of_name?.length > 0 && (
                      <div className="flex flex-col gap-4">
                        <h4 className="text-base font-semibold text-[#040E1B]">Name Changes ({allRelationships.change_of_name.length})</h4>
                        <div className="border border-[#E5E8EC] rounded-lg overflow-hidden">
                          <div className="divide-y divide-[#E5E8EC]">
                            {allRelationships.change_of_name.map((change, idx) => (
                              <div key={idx} className="px-4 py-3">
                                <div className="flex items-center justify-between">
                                  <div className="flex-1">
                                    <div className="text-sm text-[#070810]">
                                      <span className="font-medium">{change.old_name}</span>
                                      <span className="mx-2 text-[#868C98]">→</span>
                                      <span className="font-medium">{change.new_name}</span>
                                    </div>
                                    {change.effective_date && (
                                      <div className="text-xs text-[#868C98]">Effective: {formatDateShort(change.effective_date)}</div>
                                    )}
                                    {change.gazette_number && (
                                      <div className="text-xs text-[#868C98]">Gazette: {change.gazette_number}</div>
                                    )}
                                  </div>
                                  <button
                                    onClick={async () => {
                                      // Navigate to view name change details - you can implement a name change details view
                                      console.log('View name change details:', change);
                                    }}
                                    className="flex items-center gap-1 text-[#022658] hover:text-[#033a7a] text-sm font-medium"
                                  >
                                    <span>View Details</span>
                                    <ExternalLink className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Corrections of Place of Birth */}
                    {allRelationships.correction_of_place_of_birth?.length > 0 && (
                      <div className="flex flex-col gap-4">
                        <h4 className="text-base font-semibold text-[#040E1B]">Place of Birth Corrections ({allRelationships.correction_of_place_of_birth.length})</h4>
                        <div className="border border-[#E5E8EC] rounded-lg overflow-hidden">
                          <div className="divide-y divide-[#E5E8EC]">
                            {allRelationships.correction_of_place_of_birth.map((correction, idx) => (
                              <div key={idx} className="px-4 py-3">
                                <div className="text-sm text-[#070810]">
                                  <span className="font-medium">{correction.old_place_of_birth}</span>
                                  <span className="mx-2 text-[#868C98]">→</span>
                                  <span className="font-medium">{correction.new_place_of_birth}</span>
                                </div>
                                {correction.effective_date && (
                                  <div className="text-xs text-[#868C98]">Effective: {formatDateShort(correction.effective_date)}</div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Corrections of Date of Birth */}
                    {allRelationships.correction_of_date_of_birth?.length > 0 && (
                      <div className="flex flex-col gap-4">
                        <h4 className="text-base font-semibold text-[#040E1B]">Date of Birth Corrections ({allRelationships.correction_of_date_of_birth.length})</h4>
                        <div className="border border-[#E5E8EC] rounded-lg overflow-hidden">
                          <div className="divide-y divide-[#E5E8EC]">
                            {allRelationships.correction_of_date_of_birth.map((correction, idx) => (
                              <div key={idx} className="px-4 py-3">
                                <div className="text-sm text-[#070810]">
                                  <span className="font-medium">{correction.old_date_of_birth ? formatDateShort(correction.old_date_of_birth) : 'N/A'}</span>
                                  <span className="mx-2 text-[#868C98]">→</span>
                                  <span className="font-medium">{correction.new_date_of_birth ? formatDateShort(correction.new_date_of_birth) : 'N/A'}</span>
                                </div>
                                {correction.effective_date && (
                                  <div className="text-xs text-[#868C98]">Effective: {formatDateShort(correction.effective_date)}</div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Case List Tab */}
            {activeTab === 'cases' && (
              <div className="flex flex-col self-stretch bg-white p-6 gap-8 rounded-lg border border-solid border-[#E4E7EB]" style={{ boxShadow: '4px 4px 4px #0708101A' }}>
                {casesLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#022658]"></div>
                    <span className="ml-3 text-[#525866] text-sm">Loading cases...</span>
                  </div>
                ) : casesError ? (
                  <div className="flex items-center justify-center py-8">
                    <span className="text-red-500 text-sm">{casesError}</span>
                  </div>
                ) : relatedCases.length === 0 ? (
                  <div className="flex items-center justify-center py-8">
                    <span className="text-[#525866] text-sm">No cases found for this person</span>
                  </div>
                ) : (
                  <>
                    {/* Cases Summary */}
                    <div className="flex items-center gap-4 mb-4">
                      <span className="text-[#040E1B] text-sm font-bold">
                        Total Cases: {relatedCases.length}
                      </span>
                    </div>

                    {/* Cases Table */}
                    <div className="flex flex-col self-stretch gap-1 rounded-[14px] border border-solid border-[#E5E8EC] w-full">
                      {/* Table Header */}
                      <div className="flex items-center self-stretch bg-[#F4F6F9] py-4 gap-3 w-full">
                        <div className="flex flex-col items-start flex-1 min-w-[200px] py-2 pl-4">
                          <span className="text-[#070810] text-sm font-bold">Case Title</span>
                        </div>
                        <div className="flex flex-col items-start w-[140px] py-2 pl-2">
                          <span className="text-[#070810] text-sm font-bold">Suit No.</span>
                        </div>
                        <div className="flex flex-col items-start w-[120px] py-2 pl-2">
                          <span className="text-[#070810] text-sm font-bold">Role</span>
                        </div>
                        <div className="flex flex-col items-start w-[120px] py-2 pl-2">
                          <span className="text-[#070810] text-sm font-bold">Court</span>
                        </div>
                        <div className="flex flex-col items-start w-[130px] py-2 pl-2">
                          <span className="text-[#070810] text-sm font-bold">Date Filed</span>
                        </div>
                        <div className="flex flex-col items-start w-[140px] py-2 pl-2">
                          <span className="text-[#070810] text-sm font-bold">Status</span>
                        </div>
                        <div className="flex flex-col items-end w-[100px] py-2 pr-4">
                          <span className="text-[#070810] text-sm font-bold">Action</span>
                        </div>
                      </div>

                      {/* Table Rows */}
                      {relatedCases.map((caseItem, index) => {
                        const role = getPersonRole(caseItem);
                        // Use outcome from case_metadata, fallback to resolution_status, then status
                        const outcome = caseItem.outcome || (caseItem.case_metadata?.outcome) || caseItem.resolution_status || caseItem.status || 'Unknown';
                        const courtName = caseItem.court_type 
                          ? `${caseItem.court_type}${caseItem.court_division ? `, ${caseItem.court_division}` : ''}`
                          : 'N/A';
                        
                        return (
                          <div key={caseItem.id || index} className="flex items-start self-stretch py-3 border-b border-[#E5E8EC] min-h-[70px] w-full">
                            <div className="flex items-start flex-1 gap-3 w-full">
                              <div className="flex flex-col items-start flex-1 min-w-[200px] py-1 px-4">
                                <span className="text-[#070810] text-sm leading-relaxed break-words text-left">{caseItem.title || 'N/A'}</span>
                              </div>
                              <div className="flex flex-col items-start w-[140px] py-[13px] pl-2">
                                <span className="text-[#070810] text-sm break-words text-left">{caseItem.suit_reference_number || 'N/A'}</span>
                              </div>
                              <div className="flex flex-col items-start w-[120px] py-1 px-2">
                                <span className="text-[#070810] text-sm text-left">{role}</span>
                              </div>
                              <div className="flex flex-col items-start w-[120px] py-[13px] pl-2">
                                <span className="text-[#070810] text-sm text-left">{courtName}</span>
                              </div>
                              <div className="flex flex-col items-start w-[130px] py-[13px] pl-2">
                                <span className="text-[#070810] text-sm text-left">{formatCaseDate(caseItem.date)}</span>
                              </div>
                              <div className="flex flex-col items-start w-[140px] py-[11px] pl-2">
                                <div className={`px-2 py-1 rounded-lg ${getOutcomeBadgeColor(outcome)}`}>
                                  <span className="text-xs font-medium">{outcome}</span>
                                </div>
                              </div>
                              <div className="flex flex-col items-end w-[100px] py-[11px] pr-4">
                                <button 
                                  onClick={async () => {
                                    try {
                                      // Fetch full case details from API
                                      const fullCaseData = await apiGet(`/case-search/${caseItem.id}/details`);
                                      console.log('[PersonDetails] Fetched case details:', fullCaseData);
                                      setSelectedCase(fullCaseData);
                                    } catch (error) {
                                      console.error('Error fetching case details:', error);
                                      // Fallback to basic data if API call fails
                                      setSelectedCase({
                                        id: caseItem.id,
                                        title: caseItem.title,
                                        suit_reference_number: caseItem.suit_reference_number,
                                        status: outcome,
                                        date: caseItem.date,
                                        court_type: caseItem.court_type,
                                        court_division: caseItem.court_division,
                                        role: role,
                                        protagonist: caseItem.protagonist,
                                        antagonist: caseItem.antagonist,
                                        presiding_judge: caseItem.presiding_judge,
                                        area_of_law: caseItem.area_of_law,
                                        case_summary: caseItem.case_summary || caseItem.case_metadata?.case_summary
                                      });
                                    }
                                  }}
                                  className="flex items-center gap-1 text-[#022658] text-sm font-bold hover:underline cursor-pointer whitespace-nowrap"
                                >
                                  View
                                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                    <path d="M6 4L10 8L6 12" stroke="#050F1C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                  </svg>
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Gazzette Notices Tab */}
            {activeTab === 'gazettes' && (
              <div className="flex flex-col self-stretch p-6 bg-white rounded-lg border border-solid border-[#E4E7EB] gap-8" style={{ boxShadow: '4px 4px 4px rgba(7, 8, 16, 0.10)' }}>
                {/* Header with Add Button */}
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-[#040E1B]">Gazette Notices</h3>
                  <button
                    onClick={() => setShowAddGazette(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-[#022658] text-white rounded-lg hover:bg-[#033a7a] transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add New Gazette Notice</span>
                  </button>
                </div>

                {gazettesLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#022658]"></div>
                    <span className="ml-3 text-[#525866] text-sm">Loading gazette notices...</span>
                  </div>
                ) : gazettesError ? (
                  <div className="flex items-center justify-center py-8">
                    <span className="text-red-500 text-sm">{gazettesError}</span>
                  </div>
                ) : gazetteNotices.length === 0 ? (
                  <div className="flex items-center justify-center py-8">
                    <span className="text-[#525866] text-sm">No gazette notices found for this person</span>
                  </div>
                ) : (
                  <div className="flex flex-col self-stretch overflow-hidden rounded-[14px] border border-solid border-[#E5E8EC] gap-1 w-full">
                    {/* Table Header */}
                    <div className="flex self-stretch py-4 bg-[#F4F6F9] items-center gap-3 w-full">
                      <div className="w-[150px] p-2 pl-4">
                        <span className="text-[#070810] text-sm font-bold">Notice type</span>
                      </div>
                      <div className="flex-1 min-w-[250px] p-2">
                        <span className="text-[#070810] text-sm font-bold">Description</span>
                      </div>
                      <div className="w-[140px] p-2">
                        <span className="text-[#070810] text-sm font-bold">Effective date</span>
                      </div>
                      <div className="w-[150px] p-2">
                        <span className="text-[#070810] text-sm font-bold">Gazette issue</span>
                      </div>
                      <div className="w-[150px] p-2">
                        <span className="text-[#070810] text-sm font-bold">Publication Date</span>
                      </div>
                      <div className="w-[100px] p-2 pr-4 text-right">
                        <span className="text-[#070810] text-sm font-bold">Action</span>
                      </div>
                    </div>

                    {/* Table Rows */}
                    {gazetteNotices.map((gazette, index) => {
                      const effectiveDate = gazette.effective_date || gazette.effective_date_of_change;
                      const publicationDate = gazette.publication_date;
                      
                      return (
                        <div key={gazette.id || index} className="flex self-stretch min-h-[80px] py-3 border-b border-[#E5E8EC] items-start w-full">
                          <div className="w-[150px] p-2 pl-4">
                            <span className="text-[#070810] text-sm text-left">{formatGazetteType(gazette.gazette_type)}</span>
                          </div>
                          <div className="flex-1 min-w-[250px] p-2">
                            <span className="text-[#070810] text-sm text-left leading-relaxed break-words">{formatGazetteDescription(gazette)}</span>
                          </div>
                          <div className="w-[140px] p-2">
                            <span className="text-[#070810] text-sm text-left">{effectiveDate ? formatDate(effectiveDate) : 'N/A'}</span>
                          </div>
                          <div className="w-[150px] p-2">
                            <span className="text-[#070810] text-sm text-left" dangerouslySetInnerHTML={{ __html: formatGazetteIssue(gazette) }}></span>
                          </div>
                          <div className="w-[150px] p-2">
                            <span className="text-[#070810] text-sm text-left">{publicationDate ? formatDate(publicationDate) : 'N/A'}</span>
                          </div>
                          <div className="w-[100px] p-2 pr-4 flex items-end justify-end">
                            <button 
                              onClick={() => {
                                // TODO: Implement view gazette details functionality
                                console.log('View gazette:', gazette);
                              }}
                              className="flex items-center text-[#022658] text-sm font-bold hover:underline whitespace-nowrap"
                            >
                              View
                              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="overflow-hidden">
                                <path d="M6 4L10 8L6 12" stroke="#050F1C" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Risk Score Tab */}
            {activeTab === 'risk' && (
              <div className="flex flex-col self-stretch p-4 bg-white rounded-lg gap-4">
                {/* Breadcrumb */}
                <div className="flex items-center gap-1">
                  <div className="flex items-center gap-1">
                    <span className="opacity-75 text-[#525866] text-xs">PERSONS</span>
                    <svg width="16" height="16" viewBox="0 0 16 16" className="overflow-hidden">
                      <path d="M6 4L10 8L6 12" stroke="#7B8794" strokeWidth="1"/>
                    </svg>
                    <span className="text-[#050F1C] text-xs">{person?.industry?.name?.toUpperCase() || 'BANKING & FINANCE'}</span>
                  </div>
                  <svg width="16" height="16" viewBox="0 0 16 16" className="overflow-hidden">
                    <path d="M6 4L10 8L6 12" stroke="#7B8794" strokeWidth="1"/>
                  </svg>
                  <span className="text-[#070810] text-sm">{person.name}</span>
                </div>

                {/* Header with buttons */}
                <div className="flex self-stretch justify-between items-start">
                  <div className="flex items-center gap-1">
                    <button onClick={onBack} className="w-4 h-4">
                      <svg viewBox="0 0 16 16" className="overflow-hidden">
                        <path d="M10 4L6 8L10 12" stroke="#050F1C" strokeWidth="1"/>
                      </svg>
                    </button>
                    <div className="flex items-start gap-1">
                      <div className="w-9 h-9 rounded-full bg-[#022658] flex items-center justify-center flex-shrink-0">
                        {displayPerson?.full_name || displayPerson?.first_name || displayPerson?.last_name ? (
                          <span className="text-white text-sm font-medium">
                            {((displayPerson?.first_name?.charAt(0) || '') + (displayPerson?.last_name?.charAt(0) || '') || displayPerson?.full_name?.charAt(0) || 'U').toUpperCase()}
                          </span>
                        ) : (
                          <User className="w-5 h-5 text-white" />
                        )}
                      </div>
                      <div className="flex flex-col gap-1">
                    <span className="text-[#050F1C] text-xl font-semibold">{displayPerson?.full_name || displayPerson?.name || 'N/A'}</span>
                    <span className={`opacity-75 text-xs font-bold ${
                      (riskBreakdown?.risk_level || displayPerson?.risk_level || 'Low').toLowerCase() === 'critical' ? 'text-[#EF4444]' :
                      (riskBreakdown?.risk_level || displayPerson?.risk_level || 'Low').toLowerCase() === 'high' ? 'text-[#EF4444]' :
                      (riskBreakdown?.risk_level || displayPerson?.risk_level || 'Low').toLowerCase() === 'medium' ? 'text-[#F59E0B]' :
                      'text-[#10B981]'
                    }`}>
                      {riskBreakdown?.risk_level || displayPerson?.risk_level || 'Low'} risk [{Math.round(riskBreakdown?.risk_score || displayPerson?.risk_score || 0)}/100]
                    </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <button 
                      onClick={handleWatchlistToggle}
                      disabled={watchlistLoading}
                      className={`flex items-center px-4 py-2 gap-1 rounded-lg border border-solid ${
                        isInWatchlist 
                          ? 'border-green-500 bg-green-50 hover:bg-green-100' 
                          : 'border-[#F59E0B] hover:bg-orange-50'
                      } transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      <svg width="16" height="16" viewBox="0 0 16 16" className="overflow-hidden">
                        <circle cx="8" cy="8" r="3" stroke={isInWatchlist ? "#10B981" : "#F59E0B"} fill="none"/>
                      </svg>
                      <span className={`text-base font-medium ${isInWatchlist ? 'text-green-600' : 'text-[#F59E0B]'}`} style={{ fontFamily: 'Satoshi' }}>
                        {watchlistLoading 
                          ? 'Loading...' 
                          : isInWatchlist 
                            ? 'In Watchlist' 
                            : 'Add To Watchlist'
                        }
                      </span>
                    </button>
                    <button className="px-4 py-2 rounded-lg" style={{background: 'linear-gradient(180deg, #022658 43%, #1A4983 100%)', boxShadow: '0px 4px 4px rgba(5, 15, 28, 0.10)', border: '4px solid rgba(15, 40, 71, 0.15)'}}>
                      <span className="text-white text-base font-bold" style={{ fontFamily: 'Satoshi' }}>Recalculate Risk Score</span>
                    </button>
                  </div>
                </div>

                {/* Info Cards */}
                <div className="flex self-stretch py-4 px-8 bg-[#F4F6F9] rounded-lg justify-between items-center">
                  <div className="w-[200px] p-2 border-r border-[#D4E1EA]">
                    <div className="flex flex-col gap-2">
                      <span className="text-[#868C98] text-xs">Person ID</span>
                      <span className="text-[#022658] text-base font-medium">{displayPerson?.id || 'N/A'}</span>
                    </div>
                  </div>
                  <div className="w-[200px] p-2 border-r border-[#D4E1EA]">
                    <div className="flex flex-col gap-2">
                      <span className="text-[#868C98] text-xs">Industry</span>
                      <span className="text-[#022658] text-base font-medium">{displayPerson?.industry?.name || 'N/A'}</span>
                    </div>
                  </div>
                  <div className="w-[200px] p-2 border-r border-[#D4E1EA]">
                    <div className="flex flex-col gap-2">
                      <span className="text-[#868C98] text-xs">Address</span>
                      <span className="text-[#022658] text-base font-medium">{displayPerson?.address || displayPerson?.city || 'N/A'}</span>
                    </div>
                  </div>
                  <div className="w-[200px] p-2 border-r border-[#D4E1EA]">
                    <div className="flex flex-col gap-2">
                      <span className="text-[#868C98] text-xs">Last updated</span>
                      <span className="text-[#022658] text-base font-medium">
                        {riskBreakdown?.last_updated ? formatDate(riskBreakdown.last_updated) : 'N/A'}
                      </span>
                    </div>
                  </div>
                  <div className="w-[200px] p-2">
                    <div className="flex flex-col gap-2">
                      <span className="text-[#868C98] text-xs">Risk score</span>
                      <span className={`text-base font-medium ${
                        (riskBreakdown?.risk_score || displayPerson?.risk_score || 0) >= 70 ? 'text-[#EF4444]' :
                        (riskBreakdown?.risk_score || displayPerson?.risk_score || 0) >= 40 ? 'text-[#F59E0B]' :
                        'text-[#10B981]'
                      }`}>
                        {riskBreakdown?.risk_score || displayPerson?.risk_score || 0}/100
                      </span>
                    </div>
                  </div>
                </div>

                {/* Stats Row */}
                <div className="flex self-stretch items-center gap-3">
                  {[
                    { label: 'Companies affiliated with', value: '4' },
                    { label: 'Persons affiliated with', value: '2' },
                    { label: 'Gazettes notices', value: '3' },
                    { label: 'Total amount of Data', value: '7' }
                  ].map((stat, idx) => (
                    <div key={idx} className="flex-1 flex p-2 bg-white rounded-lg border border-solid border-[#D4E1EA] items-center gap-3">
                      <div className="p-2 bg-[#F7F8FA] rounded-lg">
                        <div className="w-6 h-6"></div>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-[#868C98] text-xs">{stat.label}</span>
                        <span className="text-[#F59E0B] text-base font-medium">{stat.value}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Risk Score Chart Visualization */}
                <div className="flex items-start self-stretch bg-white rounded-lg border border-solid border-[#E4E7EB] py-8 px-4" style={{boxShadow: '4px 4px 4px #0708101A'}}>
                  {/* Left side - Points with connector lines */}
                  <div className="flex flex-col items-end w-[248px] mt-[34px] ml-[50px] mr-8 relative">
                    <div className="flex flex-col items-end mb-[66px]">
                      <span className="text-emerald-500 text-lg font-bold mb-0.5">+8 points</span>
                      <span className="text-[#040E1B] text-base text-right">GHS 185,000 total exposure (moderate)</span>
                    </div>
                    <div className="flex flex-col items-end mb-28">
                      <span className="text-blue-500 text-lg font-bold mb-0.5">+10 points</span>
                      <span className="text-[#040E1B] text-base text-right">2 cases total (minimal)</span>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-blue-500 text-lg font-bold mb-0.5">+10 points</span>
                      <span className="text-[#040E1B] text-base text-right w-[143px]">1 active case (ongoing risk)</span>
                    </div>
                    
                    {/* Connector lines */}
                    <div className="absolute right-0 top-8 w-[126px] h-[29px] border-b-2 border-l-2 border-[#B1B9C6] border-dotted"></div>
                    <div className="absolute right-0 top-[146px] w-24 h-px border-t-2 border-[#B1B9C6] border-dotted"></div>
                    <div className="absolute right-0 bottom-7 w-[152px] h-[23px] border-t-2 border-l-2 border-[#B1B9C6] border-dotted"></div>
                  </div>

                  {/* Center - Chart with target icon */}
                  <div className="flex flex-col items-center justify-center w-[340px] h-[380px] relative">
                    <div className="w-[340px] h-[340px] rounded-full bg-white flex items-center justify-center" style={{boxShadow: '0px 3px 38px rgba(0, 0, 0, 0.08)'}}>
                      {(() => {
                        const riskScore = riskBreakdown?.risk_score || displayPerson?.risk_score || 0;
                        const percentage = (riskScore / 100) * 360;
                        const lowEnd = 0;
                        const mediumEnd = (40 / 100) * 360;
                        const highEnd = (70 / 100) * 360;
                        
                        // Determine colors based on risk score
                        let color1 = '#10B981'; // Low (green)
                        let color2 = '#3B82F6'; // Medium (blue)
                        let color3 = '#F59E0B'; // Medium-High (yellow)
                        let color4 = '#EF4444'; // High (red)
                        
                        if (riskScore >= 70) {
                          color1 = '#EF4444';
                          color2 = '#EF4444';
                          color3 = '#EF4444';
                          color4 = '#EF4444';
                        } else if (riskScore >= 40) {
                          color1 = '#10B981';
                          color2 = '#3B82F6';
                          color3 = '#F59E0B';
                          color4 = '#D4E1EA';
                        } else {
                          color1 = '#10B981';
                          color2 = '#10B981';
                          color3 = '#D4E1EA';
                          color4 = '#D4E1EA';
                        }
                        
                        return (
                          <div className="w-[300px] h-[300px] rounded-full relative" style={{
                            background: `conic-gradient(
                              from -90deg,
                              ${color1} 0deg ${Math.min(percentage, lowEnd + mediumEnd)}deg,
                              ${color2} ${Math.min(percentage, lowEnd + mediumEnd)}deg ${Math.min(percentage, highEnd)}deg,
                              ${color3} ${Math.min(percentage, highEnd)}deg ${Math.min(percentage, 360)}deg,
                              #D4E1EA ${Math.min(percentage, 360)}deg 360deg
                            )`
                          }}>
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="w-[200px] h-[200px] rounded-full bg-white flex items-center justify-center">
                                <div className="flex flex-col items-center">
                                  <span className="text-[#040E1B] text-3xl font-bold">{riskScore}</span>
                                  <span className="text-[#868C98] text-sm">Risk Score</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  </div>

                  {/* Right side - Points (no connector lines) */}
                  <div className="flex flex-col items-start w-[240px] mt-[82px] ml-8">
                    <span className="text-[#B0B8C5] text-lg font-bold mb-[5px]">+5 points</span>
                    <span className="text-[#040E1B] text-base mb-[30px]">Plaintiff in both (not defendant)</span>
                    <span className="text-[#B0B8C5] text-lg font-bold mb-[5px]">-5 points</span>
                    <span className="text-[#040E1B] text-base mb-[30px]">1 won case (favorable outcome)</span>
                    <span className="text-[#B0B8C5] text-lg font-bold mb-[7px]">+0 points</span>
                    <span className="text-[#040E1B] text-base mb-[35px]">Civil disputes (not criminal)</span>
                    <span className="text-[#B0B8C5] text-lg font-bold mb-1.5">0 points</span>
                    <span className="text-[#040E1B] text-base">No adverse judgments</span>
                  </div>
                </div>

                {/* Risk Legend */}
                <div className="flex self-stretch p-4 rounded-lg border border-solid border-[#D4E1EA] items-center gap-2">
                  <span className="flex-1 text-[#040E1B] text-base font-medium">
                    Calculated based on case history, dispute frequency, and unresolved matters
                  </span>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <div className="w-4 h-4 bg-[#10B981] rounded-full"></div>
                      <span className="opacity-75 text-[#040E1B] text-sm">Low risk: 0-40</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-4 h-4 bg-[#DEBB0C] rounded-full"></div>
                      <span className="opacity-75 text-[#040E1B] text-sm">Moderate risk: 41-70</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-4 h-4 bg-[#EF4444] rounded-full"></div>
                      <span className="opacity-75 text-[#040E1B] text-sm">High risk: 71-100</span>
                    </div>
                  </div>
                </div>

                {/* Comparison Stats */}
                <div className="flex self-stretch py-4 px-10 bg-white rounded-lg border border-solid border-[#D4E1EA] justify-between items-center" style={{boxShadow: '4px 4px 4px rgba(7, 8, 16, 0.10)'}}>
                  <div className="flex flex-col items-center gap-2">
                    <span className="text-center text-[#525866] text-base">{displayPerson?.full_name || displayPerson?.name || 'Person'} Risk Score</span>
                    <span className={`text-lg font-medium ${
                      (riskBreakdown?.risk_score || displayPerson?.risk_score || 0) >= 70 ? 'text-[#EF4444]' :
                      (riskBreakdown?.risk_score || displayPerson?.risk_score || 0) >= 40 ? 'text-[#F59E0B]' :
                      'text-[#10B981]'
                    }`}>
                      {riskBreakdown?.risk_score || displayPerson?.risk_score || 0}
                    </span>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <span className="text-center text-[#525866] text-base">Industry Average</span>
                    <span className="text-[#10B981] text-lg font-medium">40</span>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <span className="text-center text-[#525866] text-base">Top Quartile</span>
                    <span className="text-[#F59E0B] text-lg font-medium">20</span>
                  </div>
                </div>

                {/* Score Breakdown Table */}
                <div className="flex flex-col self-stretch gap-2">
                  <span className="text-[#040E1B] text-xs">SCORE BREAKDOWN</span>
                  <div className="flex flex-col self-stretch gap-1 rounded-[14px] border border-solid border-[#E5E8EC]">
                    {/* Table Header */}
                    <div className="flex items-start self-stretch bg-[#F4F6F9] py-4">
                      <div className="flex flex-col items-start w-[180px] py-2 pl-4 mr-3">
                        <span className="text-[#070810] text-sm font-bold">Factor</span>
                      </div>
                      <div className="flex flex-col items-start w-[150px] py-2 pl-4 mr-3">
                        <span className="text-[#070810] text-sm font-bold">Weight</span>
                      </div>
                      <div className="flex flex-col items-start w-[400px] py-2 pl-4 mr-3">
                        <span className="text-[#070810] text-sm font-bold">Description</span>
                      </div>
                      <div className="flex flex-col items-start w-[150px] py-2 pl-4 mr-3">
                        <span className="text-[#070810] text-sm font-bold">Entity value</span>
                      </div>
                      <div className="flex flex-col items-start w-[150px] py-2 pl-4">
                        <span className="text-[#070810] text-sm font-bold">Risk point</span>
                      </div>
                    </div>
                    {/* Table Rows */}
                    {riskLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#022658]"></div>
                        <span className="ml-3 text-[#525866] text-sm">Loading risk breakdown...</span>
                      </div>
                    ) : riskError ? (
                      <div className="flex items-center justify-center py-8">
                        <span className="text-red-500 text-sm">{riskError}</span>
                      </div>
                    ) : riskBreakdown?.score_breakdown ? (
                      riskBreakdown.score_breakdown.map((row, idx) => (
                      <div key={idx} className="flex items-start self-stretch py-3">
                        <div className="flex flex-col items-start w-[180px] py-2 pl-4 mr-3">
                          <span className="text-[#070810] text-sm">{row.factor}</span>
                        </div>
                        <div className="flex flex-col items-start w-[150px] py-2 pl-4 mr-3">
                          <span className="text-[#070810] text-sm">{row.weight}</span>
                        </div>
                        <div className="flex flex-col items-start w-[400px] py-2 pl-4 mr-3">
                          <span className="text-[#070810] text-sm">{row.description || row.desc || '-'}</span>
                        </div>
                        <div className="flex flex-col items-start w-[150px] py-2 pl-4 mr-3">
                          <span className="text-[#070810] text-sm">{row.value}</span>
                        </div>
                        <div className="flex flex-col items-start w-[150px] py-2 pl-4">
                          <span className="text-[#070810] text-sm">{row.points !== undefined ? row.points : '-'}</span>
                        </div>
                      </div>
                      ))
                    ) : (
                      <div className="flex items-center justify-center py-8">
                        <span className="text-[#525866] text-sm">No risk breakdown data available</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Risk Indicator Table */}
                <div className="flex flex-col self-stretch gap-2">
                  <span className="text-[#040E1B] text-xs">RISK INDICATOR</span>
                  <div className="flex flex-col self-stretch gap-1 rounded-[14px] border border-solid border-[#E5E8EC]">
                    {/* Table Header */}
                    <div className="flex items-start self-stretch bg-[#F4F6F9] py-4">
                      <div className="flex flex-col items-start w-[300px] py-2 pl-4 mr-8">
                        <span className="text-[#070810] text-sm font-bold">Indicator</span>
                      </div>
                      <div className="flex flex-col items-start w-[200px] py-2 pl-4 mr-8">
                        <span className="text-[#070810] text-sm font-bold">Status</span>
                      </div>
                      <div className="flex flex-col items-start w-[500px] py-2 pl-4">
                        <span className="text-[#070810] text-sm font-bold">Description</span>
                      </div>
                    </div>
                    {/* Table Rows */}
                    {riskLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#022658]"></div>
                        <span className="ml-3 text-[#525866] text-sm">Loading risk indicators...</span>
                      </div>
                    ) : riskError ? (
                      <div className="flex items-center justify-center py-8">
                        <span className="text-red-500 text-sm">{riskError}</span>
                      </div>
                    ) : riskBreakdown?.risk_indicators ? (
                      riskBreakdown.risk_indicators.map((row, idx) => (
                      <div key={idx} className="flex items-start self-stretch py-3">
                        <div className="flex flex-col items-start w-[300px] py-2 pl-4 mr-8">
                          <span className="text-[#070810] text-sm">{row.indicator}</span>
                        </div>
                        <div className="flex flex-col items-start w-[200px] py-2 pl-4 mr-8">
                          <span className="text-[#070810] text-sm">{row.status}</span>
                        </div>
                        <div className="flex flex-col items-start w-[500px] py-2 pl-4">
                          <span className="text-[#070810] text-sm">{row.description || row.desc || '-'}</span>
                        </div>
                      </div>
                      ))
                    ) : (
                      <div className="flex items-center justify-center py-8">
                        <span className="text-[#525866] text-sm">No risk indicators available</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Risk Explanation */}
                <div className="flex flex-col self-stretch gap-2">
                  <span className="text-[#050F1C] text-lg">Risk Score Explanation</span>
                  <div className="text-[#050F1C] text-base">
                    {riskBreakdown ? (
                      <>
                        <span className="font-medium">Why {riskBreakdown.risk_level} Risk:</span>
                        <span>
                          {riskBreakdown.total_cases > 0 ? (
                            <>
                              {riskBreakdown.total_cases} court case{riskBreakdown.total_cases !== 1 ? 's' : ''} in total
                              {riskBreakdown.total_cases <= 2 ? ' (low litigation frequency)' : riskBreakdown.total_cases <= 5 ? ' (moderate litigation frequency)' : ' (high litigation frequency)'}.
                              {riskBreakdown.won_cases > 0 && ` Won ${riskBreakdown.won_cases} case${riskBreakdown.won_cases !== 1 ? 's' : ''} with judgment${riskBreakdown.won_cases !== 1 ? 's' : ''} in ${riskBreakdown.won_cases === 1 ? 'his' : 'his'} favor.`}
                              {riskBreakdown.lost_cases > 0 && ` Lost ${riskBreakdown.lost_cases} case${riskBreakdown.lost_cases !== 1 ? 's' : ''} with unfavorable outcome${riskBreakdown.lost_cases !== 1 ? 's' : ''}.`}
                              {riskBreakdown.active_cases > 0 && ` ${riskBreakdown.active_cases} active case${riskBreakdown.active_cases !== 1 ? 's' : ''} currently ongoing.`}
                              {riskBreakdown.total_exposure > 0 && ` Total dispute value of GHS ${riskBreakdown.total_exposure.toLocaleString()}.`}
                              {riskBreakdown.gazette_count > 0 && ` ${riskBreakdown.gazette_count} gazette notice${riskBreakdown.gazette_count !== 1 ? 's' : ''} on record.`}
                              {riskBreakdown.risk_factors && riskBreakdown.risk_factors.length > 0 && ` Key risk factors: ${riskBreakdown.risk_factors.slice(0, 3).join(', ')}.`}
                            </>
                          ) : (
                            ' No court cases recorded. Low litigation history.'
                          )}
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="font-medium">Risk Assessment:</span>
                        <span> Risk score calculation is based on case history, dispute frequency, financial exposure, and unresolved matters. Generate analytics to see detailed breakdown.</span>
                      </>
                    )}
                    <br/><br/>
                    <span className="font-medium">Contributing Factors:</span>
                    <span> One ongoing commercial dispute (adds minor uncertainty), Total claim exposure of GHS 185,000 (manageable).</span>
                  </div>
                </div>

                {/* Recommendation */}
                <div className="text-base">
                  <span className="text-[#10B981] font-medium">Recommendation:</span>
                  <span className="text-[#050F1C]"> Suitable for credit facilities and business partnerships. Minimal legal risk profile.</span>
                </div>
              </div>
            )}

            {/* Other tabs - placeholder content */}
            {activeTab !== 'personal' && activeTab !== 'employment' && activeTab !== 'affiliated' && activeTab !== 'cases' && activeTab !== 'gazettes' && activeTab !== 'risk' && (
              <div className="flex flex-col bg-white p-6 gap-4 rounded-lg border border-solid border-[#E4E7EB]" style={{ boxShadow: '4px 4px 4px #0708101A' }}>
                <span className="text-[#525866] text-sm">
                  {tabs.find(t => t.id === activeTab)?.label} content coming soon...
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Employment Form Modal */}
      <EmploymentFormModal
        isOpen={showAddEmployment}
        onClose={() => {
          setShowAddEmployment(false);
          setEditingEmployment(null);
        }}
        onSave={handleSaveEmployment}
        employment={editingEmployment}
        isSaving={isSaving}
      />

      {/* Relationship Form Modal */}
      <RelationshipFormModal
        isOpen={showAddRelationship}
        onClose={() => setShowAddRelationship(false)}
        onSave={handleSaveRelationship}
        personId={personData?.id || person?.id || person?.fullData?.id}
        isSaving={isSaving}
      />

      {/* Gazette Form Modal */}
      <GazetteFormModal
        isOpen={showAddGazette}
        onClose={() => setShowAddGazette(false)}
        onSave={handleSaveGazette}
        personId={personData?.id || person?.id || person?.fullData?.id}
        isSaving={isSaving}
      />
    </div>
  );
};

export default PersonDetails;

