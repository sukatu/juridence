import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Edit, Save, X, ChevronDown, Trash2 } from 'lucide-react';
import { apiGet, apiPost, apiPut, apiDelete } from '../../utils/api';
import AddRegulatoryDrawer from './AddRegulatoryDrawer';
import AddDirectorDrawer from './AddDirectorDrawer';
import AddSecretaryDrawer from './AddSecretaryDrawer';
import AddEmployeeDrawer from './AddEmployeeDrawer';
import AddCaseDrawer from './AddCaseDrawer';
import AddBulletinDrawer from './AddBulletinDrawer';
import CompanyCaseDetails from './CompanyCaseDetails';
import SuccessNotification from './SuccessNotification';
import ConfirmDialog from './ConfirmDialog';

const CompanyDetails = ({ company, industry, onBack, userInfo, onNavigate, onLogout }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('personal');
  const [directorsPeriod, setDirectorsPeriod] = useState('present');
  const [searchDirectorQuery, setSearchDirectorQuery] = useState('');
  const [showRegulatoryDrawer, setShowRegulatoryDrawer] = useState(false);
  const [editingRegulatoryIndex, setEditingRegulatoryIndex] = useState(null);
  const [editingRegulatoryData, setEditingRegulatoryData] = useState(null);
  const [showDeleteRegulatoryConfirm, setShowDeleteRegulatoryConfirm] = useState(false);
  const [regulatoryToDelete, setRegulatoryToDelete] = useState(null);
  const [regulatoryDeleteId, setRegulatoryDeleteId] = useState(null);
  const [showCaseDrawer, setShowCaseDrawer] = useState(false);
  const [editingCaseIndex, setEditingCaseIndex] = useState(null);
  const [editingCaseData, setEditingCaseData] = useState(null);
  const [showDeleteCaseConfirm, setShowDeleteCaseConfirm] = useState(false);
  const [caseToDelete, setCaseToDelete] = useState(null);
  const [caseLinkDeleteId, setCaseLinkDeleteId] = useState(null);
  const [casesPeriod, setCasesPeriod] = useState('active');
  const [showBulletinDrawer, setShowBulletinDrawer] = useState(false);
  const [editingBulletinIndex, setEditingBulletinIndex] = useState(null);
  const [editingBulletinData, setEditingBulletinData] = useState(null);
  const [showDeleteBulletinConfirm, setShowDeleteBulletinConfirm] = useState(false);
  const [bulletinToDelete, setBulletinToDelete] = useState(null);
  const [bulletinDeleteId, setBulletinDeleteId] = useState(null);
  const [bulletinList, setBulletinList] = useState([]);
  const [loadingBulletin, setLoadingBulletin] = useState(false);
  const [searchCaseQuery, setSearchCaseQuery] = useState('');
  const [selectedCase, setSelectedCase] = useState(null);
  const [companyData, setCompanyData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [relatedCases, setRelatedCases] = useState([]);
  const [casesLoading, setCasesLoading] = useState(false);
  const [casesError, setCasesError] = useState(null);
  const [regulatoryList, setRegulatoryList] = useState([]);
  const [loadingRegulatory, setLoadingRegulatory] = useState(false);
  const [showDirectorDrawer, setShowDirectorDrawer] = useState(false);
  const [editingDirectorIndex, setEditingDirectorIndex] = useState(null);
  const [editingDirectorData, setEditingDirectorData] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [directorToDelete, setDirectorToDelete] = useState(null);
  const [directorDeleteIndex, setDirectorDeleteIndex] = useState(null);
  const [showSecretaryDrawer, setShowSecretaryDrawer] = useState(false);
  const [editingSecretaryData, setEditingSecretaryData] = useState(null);
  const [showDeleteSecretaryConfirm, setShowDeleteSecretaryConfirm] = useState(false);
  const [secretaryToDelete, setSecretaryToDelete] = useState(null);
  const [showEmployeeDrawer, setShowEmployeeDrawer] = useState(false);
  const [editingEmployeeIndex, setEditingEmployeeIndex] = useState(null);
  const [editingEmployeeData, setEditingEmployeeData] = useState(null);
  const [showDeleteEmployeeConfirm, setShowDeleteEmployeeConfirm] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState(null);
  const [employeeDeleteIndex, setEmployeeDeleteIndex] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [dataRefreshKey, setDataRefreshKey] = useState(0);
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const [watchlistId, setWatchlistId] = useState(null);
  const [watchlistLoading, setWatchlistLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [showRegionDropdown, setShowRegionDropdown] = useState(false);
  const regionDropdownRef = useRef(null);

  // Ghana regions list
  const regions = [
    'Greater Accra',
    'Ashanti',
    'Western',
    'Eastern',
    'Central',
    'Northern',
    'Upper East',
    'Upper West',
    'Volta',
    'Brong Ahafo',
    'Western North',
    'Ahafo',
    'Bono',
    'Bono East',
    'Oti',
    'Savannah',
    'North East'
  ];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (regionDropdownRef.current && !regionDropdownRef.current.contains(event.target)) {
        setShowRegionDropdown(false);
      }
    };

    if (showRegionDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showRegionDropdown]);

  // Derived stats for the header cards
  const companiesAffiliatedCount = useMemo(() => {
    if (!companyData) return 0;
    const linked = companyData.other_linked_companies;
    if (Array.isArray(linked)) return linked.length;
    if (typeof linked === 'string' && linked.trim()) return linked.split(',').length;
    return 0;
  }, [companyData]);

  const personsAffiliatedCount = useMemo(() => {
    if (!companyData) return 0;
    const directorsCount = Array.isArray(companyData.directors) ? companyData.directors.length : 0;
    const boardCount = Array.isArray(companyData.board_of_directors) ? companyData.board_of_directors.length : 0;
    const keyPersonnelCount = Array.isArray(companyData.key_personnel) ? companyData.key_personnel.length : 0;
    const secretaryCount = companyData.secretary ? 1 : 0;
    return directorsCount + boardCount + keyPersonnelCount + secretaryCount;
  }, [companyData]);

  const bulletinNoticesCount = useMemo(() => {
    return bulletinList?.length || 0;
  }, [bulletinList]);

  const totalRelatedDataCount = useMemo(() => {
    const casesCount = relatedCases?.length || 0;
    const regulatoryCount = regulatoryList?.length || 0;
    return companiesAffiliatedCount + personsAffiliatedCount + bulletinNoticesCount + casesCount + regulatoryCount;
  }, [companiesAffiliatedCount, personsAffiliatedCount, bulletinNoticesCount, relatedCases, regulatoryList]);
  
  // Safely extract company name and ID - handle both string and object
  const companyName = typeof company === 'string' 
    ? company 
    : (company?.name || company?.short_name || 'Unknown Company');
  const companyId = typeof company === 'object' && company?.id ? company.id : null;
  const entityType = typeof company === 'object' && company?.entity_type ? company.entity_type : 'company';
  
  // Helper function to format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    } catch (e) {
      return dateString;
    }
  };

  // Helper function to convert date to YYYY-MM-DD format for date inputs
  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '';
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    } catch (e) {
      return '';
    }
  };

  // Helper function to format currency
  const formatCurrency = (value) => {
    if (!value && value !== 0) return 'N/A';
    try {
      const num = typeof value === 'string' ? parseFloat(value.replace(/,/g, '')) : parseFloat(value);
      if (isNaN(num)) return 'N/A';
      if (num >= 1000000) {
        return `GHS ${(num / 1000000).toFixed(1)}m`;
      } else if (num >= 1000) {
        return `GHS ${(num / 1000).toFixed(1)}k`;
      }
      return `GHS ${num.toLocaleString()}`;
    } catch (e) {
      return String(value || 'N/A');
    }
  };

  // Helper function to extract CEO from key_personnel or directors
  const getCEO = () => {
    if (!companyData) return 'N/A';
    // Check if ceo field exists
    if (companyData.ceo) {
      const appointmentDate = companyData.ceo_appointment_date 
        ? formatDate(companyData.ceo_appointment_date)
        : '';
      return appointmentDate ? `${companyData.ceo} (${appointmentDate}-Present)` : companyData.ceo;
    }
    // Try to extract from key_personnel
    if (companyData.key_personnel && Array.isArray(companyData.key_personnel)) {
      const ceo = companyData.key_personnel.find(p => 
        p.position && (p.position.toLowerCase().includes('ceo') || p.position.toLowerCase().includes('chief executive'))
      );
      if (ceo) {
        const startDate = ceo.start_date ? formatDate(ceo.start_date) : '';
        return startDate ? `${ceo.name} (${startDate}-Present)` : ceo.name;
      }
    }
    return 'N/A';
  };

  // Helper function to format business activities
  const formatBusinessActivities = () => {
    if (!companyData) return 'N/A';
    if (companyData.business_activities) {
      if (Array.isArray(companyData.business_activities)) {
        return companyData.business_activities.join('\n');
      } else if (typeof companyData.business_activities === 'string') {
        return companyData.business_activities;
      }
    }
    if (companyData.nature_of_business) {
      return companyData.nature_of_business;
    }
    return 'N/A';
  };

  // Fetch company details from API
  useEffect(() => {
    const fetchCompanyDetails = async () => {
      if (!companyId) {
        // If no ID, use the company object directly if it's already an object
        if (typeof company === 'object' && company) {
          setCompanyData(company);
          setLoading(false);
        } else {
          setError('Company ID not found');
          setLoading(false);
        }
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        // Determine which endpoint to use based on entity type
        let endpoint = '';
        if (entityType === 'bank') {
          endpoint = `/admin/banks/${companyId}`;
        } else if (entityType === 'insurance') {
          endpoint = `/admin/insurance/${companyId}`;
        } else {
          endpoint = `/admin/companies/${companyId}`;
        }
        
        const response = await apiGet(endpoint);
        
        // Handle different response structures
        let data = null;
        if (response.company) {
          data = response.company;
        } else if (response.insurance) {
          data = response.insurance;
        } else if (response.bank) {
          data = response.bank;
        } else {
          data = response;
        }
        
        // Debug: Log the data structure to help identify issues
        console.log('[CompanyDetails] Fetched data structure:', {
          hasDirectors: !!data?.directors,
          directorsType: typeof data?.directors,
          directorsIsArray: Array.isArray(data?.directors),
          directorsLength: Array.isArray(data?.directors) ? data.directors.length : 'N/A',
          directorsValue: data?.directors,
          hasBoardOfDirectors: !!data?.board_of_directors,
          boardOfDirectorsType: typeof data?.board_of_directors,
          boardOfDirectorsIsArray: Array.isArray(data?.board_of_directors),
          boardOfDirectorsLength: Array.isArray(data?.board_of_directors) ? data.board_of_directors.length : 'N/A',
          boardOfDirectorsValue: data?.board_of_directors,
          hasSecretary: !!data?.secretary,
          secretaryType: typeof data?.secretary,
          secretaryValue: data?.secretary,
          hasKeyPersonnel: !!data?.key_personnel,
          keyPersonnelType: typeof data?.key_personnel,
          keyPersonnelIsArray: Array.isArray(data?.key_personnel),
          keyPersonnelLength: Array.isArray(data?.key_personnel) ? data.key_personnel.length : 'N/A',
          keyPersonnelValue: data?.key_personnel,
          allKeys: Object.keys(data || {})
        });
        
        console.log('[CompanyDetails] Setting companyData for companyId:', companyId, 'Data:', data);
        setCompanyData(data);
      } catch (err) {
        console.error('Error fetching company details:', err);
        setError('Failed to load company details. Please try again.');
        // Fallback to using the company object if available
        if (typeof company === 'object' && company) {
          setCompanyData(company);
        } else {
          // Reset to null on error if no fallback
          setCompanyData(null);
        }
      } finally {
        setLoading(false);
      }
    };

    // Reset companyData when company changes to prevent stale data
    setCompanyData(null);
    setLoading(true);
    setError(null);
    
    fetchCompanyDetails();
  }, [companyId, entityType, company]);

  // Check watchlist status when company data is loaded
  useEffect(() => {
    const checkWatchlistStatus = async () => {
      if (!companyId) return;
      
      try {
        const response = await apiGet(`/watchlist/check/${entityType}/${companyId}`);
        setIsInWatchlist(response.is_in_watchlist || false);
        setWatchlistId(response.watchlist_id || null);
      } catch (error) {
        console.error('Error checking watchlist status:', error);
        setIsInWatchlist(false);
      }
    };

    if (companyId) {
      checkWatchlistStatus();
    }
  }, [companyId, entityType]);

  // Handle add/remove from watchlist
  const handleWatchlistToggle = async () => {
    if (!companyId) return;
    
    try {
      setWatchlistLoading(true);
      
      if (isInWatchlist) {
        // Remove from watchlist
        await apiDelete(`/watchlist/entity/${entityType}/${companyId}`);
        setIsInWatchlist(false);
        setWatchlistId(null);
      } else {
        // Add to watchlist
        const response = await apiPost('/watchlist/', {
          entity_type: entityType,
          entity_id: companyId,
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

  // Initialize edit form data from companyData
  useEffect(() => {
    if (companyData && Object.keys(editFormData).length === 0) {
      const auditorName = companyData.auditor && typeof companyData.auditor === 'object' 
        ? (companyData.auditor.firm_name || companyData.auditor.name)
        : (typeof companyData.auditor === 'string' ? companyData.auditor : null);
      
      setEditFormData({
        status: companyData.status || (companyData.is_active ? 'Active' : 'Inactive'),
        ceo: getCEO() || 'N/A',
        businessType: companyData.type_of_company || companyData.company_type || companyData.business_type || 'N/A',
        companyType: companyData.company_type || companyData.type_of_company || companyData.entity_type || 'N/A',
        entityName: companyData.name || companyData.short_name || companyName,
        registrationNumber: companyData.registration_number || companyData.registration_no || 'N/A',
        principalActivity: companyData.principal_activity || formatBusinessActivities() || 'N/A',
        tin: companyData.tax_identification_number || companyData.tin_number || companyData.tin || 'N/A',
        incorporationDate: companyData.date_of_incorporation ? formatDateForInput(companyData.date_of_incorporation) : '',
        commencementDate: companyData.date_of_commencement ? formatDateForInput(companyData.date_of_commencement) : '',
        buildingNumber: companyData.address || companyData.head_office_address || companyData.building_number || 'N/A',
        landmark: companyData.landmark || 'N/A',
        city: companyData.city || 'N/A',
        district: companyData.district || 'N/A',
        region: companyData.region || '',
        country: companyData.country || 'Ghana',
        poBox: companyData.postal_code || companyData.po_box || 'N/A',
        phone: companyData.phone || companyData.phone_number || companyData.customer_service_phone || 'N/A',
        email: companyData.email || companyData.customer_service_email || companyData.email_address || 'N/A',
        authorizedCapital: companyData.authorized_capital || companyData.stated_capital ? formatCurrency(companyData.authorized_capital || companyData.stated_capital) : 'N/A',
        totalShares: companyData.authorized_shares ? companyData.authorized_shares.toLocaleString() : 'N/A',
        totalAssets: companyData.total_assets ? formatCurrency(companyData.total_assets) : 'N/A',
        annualTurnover: (companyData.annual_turnover || companyData.annual_revenue) ? formatCurrency(companyData.annual_turnover || companyData.annual_revenue) : 'N/A',
        auditingFirm: auditorName || companyData.auditing_firm || 'N/A',
        appointmentDate: (companyData.auditor && typeof companyData.auditor === 'object' && companyData.auditor.start_date) 
          ? formatDateForInput(companyData.auditor.start_date) 
          : '',
        auditorContact: (companyData.auditor && typeof companyData.auditor === 'object' && companyData.auditor.phone) 
          ? companyData.auditor.phone 
          : companyData.auditor_contact || 'N/A',
        lastUpdated: companyData.updated_at ? formatDate(companyData.updated_at) : 'N/A'
      });
    }
  }, [companyData, companyName]);

  // Handle cancel edit
  const handleCancelEdit = () => {
    setIsEditing(false);
    // Reset form data to original companyData values
    if (companyData) {
      const auditorName = companyData.auditor && typeof companyData.auditor === 'object' 
        ? (companyData.auditor.firm_name || companyData.auditor.name)
        : (typeof companyData.auditor === 'string' ? companyData.auditor : null);
      
      setEditFormData({
        status: companyData.status || (companyData.is_active ? 'Active' : 'Inactive'),
        ceo: getCEO() || 'N/A',
        businessType: companyData.type_of_company || companyData.company_type || companyData.business_type || 'N/A',
        companyType: companyData.company_type || companyData.type_of_company || companyData.entity_type || 'N/A',
        entityName: companyData.name || companyData.short_name || companyName,
        registrationNumber: companyData.registration_number || companyData.registration_no || 'N/A',
        principalActivity: companyData.principal_activity || formatBusinessActivities() || 'N/A',
        tin: companyData.tax_identification_number || companyData.tin_number || companyData.tin || 'N/A',
        incorporationDate: companyData.date_of_incorporation ? formatDateForInput(companyData.date_of_incorporation) : '',
        commencementDate: companyData.date_of_commencement ? formatDateForInput(companyData.date_of_commencement) : '',
        buildingNumber: companyData.address || companyData.head_office_address || companyData.building_number || 'N/A',
        landmark: companyData.landmark || 'N/A',
        city: companyData.city || 'N/A',
        district: companyData.district || 'N/A',
        region: companyData.region || '',
        country: companyData.country || 'Ghana',
        poBox: companyData.postal_code || companyData.po_box || 'N/A',
        phone: companyData.phone || companyData.phone_number || companyData.customer_service_phone || 'N/A',
        email: companyData.email || companyData.customer_service_email || companyData.email_address || 'N/A',
        authorizedCapital: companyData.authorized_capital || companyData.stated_capital ? formatCurrency(companyData.authorized_capital || companyData.stated_capital) : 'N/A',
        totalShares: companyData.authorized_shares ? companyData.authorized_shares.toLocaleString() : 'N/A',
        totalAssets: companyData.total_assets ? formatCurrency(companyData.total_assets) : 'N/A',
        annualTurnover: (companyData.annual_turnover || companyData.annual_revenue) ? formatCurrency(companyData.annual_turnover || companyData.annual_revenue) : 'N/A',
        auditingFirm: auditorName || companyData.auditing_firm || 'N/A',
        appointmentDate: (companyData.auditor && typeof companyData.auditor === 'object' && companyData.auditor.start_date) 
          ? formatDateForInput(companyData.auditor.start_date) 
          : '',
        auditorContact: (companyData.auditor && typeof companyData.auditor === 'object' && companyData.auditor.phone) 
          ? companyData.auditor.phone 
          : companyData.auditor_contact || 'N/A',
        lastUpdated: companyData.updated_at ? formatDate(companyData.updated_at) : 'N/A'
      });
    }
  };

  // Handle save edit
  const handleSaveEdit = async () => {
    if (!companyId) {
      alert('Company ID not available');
      return;
    }

    try {
      setIsSaving(true);
      
      // Prepare data for API (convert back from display format if needed)
      const updateData = {
        status: editFormData.status,
        ceo: editFormData.ceo,
        business_type: editFormData.businessType,
        company_type: editFormData.companyType,
        name: editFormData.entityName,
        registration_number: editFormData.registrationNumber,
        principal_activity: editFormData.principalActivity,
        tin: editFormData.tin,
        building_number: editFormData.buildingNumber,
        landmark: editFormData.landmark,
        city: editFormData.city,
        district: editFormData.district,
        region: editFormData.region,
        country: editFormData.country,
        postal_code: editFormData.poBox,
        phone_number: editFormData.phone,
        email: editFormData.email,
        auditing_firm: editFormData.auditingFirm,
        auditor_contact: editFormData.auditorContact
      };

      await apiPut(`/companies/${companyId}`, updateData);
      
      // Refresh company data
      const updatedData = await apiGet(`/companies/${companyId}`);
      setCompanyData(updatedData);
      
      setIsEditing(false);
      setShowSuccess(true);
      setSuccessMessage('Company details updated successfully');
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error('Error saving company details:', error);
      alert(error.message || 'Failed to update company details');
    } finally {
      setIsSaving(false);
    }
  };

  // Fetch regulatory data when companyId changes
  useEffect(() => {
    const fetchRegulatoryData = async () => {
      if (!companyId) {
        setRegulatoryList([]);
        return;
      }

      try {
        setLoadingRegulatory(true);
        const response = await apiGet(`/admin/companies/regulatory/${companyId}`);
        
        if (response && response.regulatory) {
          console.log('[CompanyDetails] Fetched regulatory data:', response.regulatory);
          setRegulatoryList(response.regulatory);
        } else {
          setRegulatoryList([]);
        }
      } catch (err) {
        console.error('Error fetching regulatory data:', err);
        setRegulatoryList([]);
      } finally {
        setLoadingRegulatory(false);
      }
    };

    fetchRegulatoryData();
  }, [companyId, dataRefreshKey]);

  // Load related cases for the company
  const loadRelatedCases = async (companyName) => {
    if (!companyId) {
      setCasesLoading(false);
      setRelatedCases([]);
      return;
    }
    
    try {
      setCasesLoading(true);
      setCasesError(null);
      
      console.log('[CompanyDetails] Loading cases for:', companyName, 'ID:', companyId, 'Entity Type:', entityType);
      
      // Determine the correct endpoint based on entity type
      let endpoint = '';
      let responseKey = 'cases';
      
      if (entityType === 'bank') {
        endpoint = `/banks/${companyId}/related-cases?limit=100`;
        responseKey = 'related_cases';
      } else if (entityType === 'insurance') {
        endpoint = `/insurance/${companyId}/related-cases?limit=100`;
        responseKey = 'related_cases';
      } else {
        endpoint = `/companies/${companyId}/related-cases?limit=100`;
        responseKey = 'cases';
      }
      
      // Try entity-specific endpoint first (this now includes case links)
      try {
        const response = await apiGet(endpoint);
        console.log('[CompanyDetails] Entity cases API response:', response);
        
        // Handle different response structures
        let cases = [];
        if (response && response[responseKey] && Array.isArray(response[responseKey])) {
          cases = response[responseKey];
        } else if (response && response.cases && Array.isArray(response.cases)) {
          cases = response.cases;
        } else if (response && response.related_cases && Array.isArray(response.related_cases)) {
          cases = response.related_cases;
        }
        
          console.log('[CompanyDetails] Found cases:', cases.length);
          setRelatedCases(cases);
          setCasesLoading(false);
        return; // Always return here, even if empty, to show the "Add new case" button
      } catch (entityEndpointError) {
        console.log('[CompanyDetails] Entity endpoint failed, trying search endpoint:', entityEndpointError);
      }
      
      // Fallback to search endpoint only if entity endpoint fails
      if (companyName) {
      try {
        const searchResponse = await apiGet(`/case-search/search?query=${encodeURIComponent(companyName)}&limit=100`);
        console.log('[CompanyDetails] Search cases API response:', searchResponse);
        
        if (searchResponse && searchResponse.results && Array.isArray(searchResponse.results)) {
          console.log('[CompanyDetails] Found cases from search:', searchResponse.results.length);
          setRelatedCases(searchResponse.results);
        } else {
          console.log('[CompanyDetails] No cases found in search results');
          setRelatedCases([]);
        }
      } catch (searchError) {
        console.error('[CompanyDetails] Search endpoint also failed:', searchError);
        setCasesError('Failed to load related cases. Please try again.');
          setRelatedCases([]);
        }
      } else {
        setRelatedCases([]);
      }
    } catch (error) {
      console.error('[CompanyDetails] Error loading related cases:', error);
      setCasesError(error.message || 'Failed to load related cases');
      setRelatedCases([]);
    } finally {
      setCasesLoading(false);
    }
  };

  // Fetch cases when company data is loaded
  useEffect(() => {
    if (companyData && companyData.name) {
      loadRelatedCases(companyData.name);
    } else if (companyName) {
      loadRelatedCases(companyName);
    }
  }, [companyData, companyName, companyId, entityType]);

  // Helper function to get company role in case
  const getCompanyRole = (caseItem) => {
    const companyNameLower = companyName.toLowerCase();
    const companyDataNameLower = companyData?.name?.toLowerCase() || '';
    
    if (caseItem.protagonist && caseItem.protagonist.toLowerCase().includes(companyNameLower)) {
      return 'Plaintiff';
    }
    if (caseItem.protagonist && companyDataNameLower && caseItem.protagonist.toLowerCase().includes(companyDataNameLower)) {
      return 'Plaintiff';
    }
    if (caseItem.antagonist && caseItem.antagonist.toLowerCase().includes(companyNameLower)) {
      return 'Defendant';
    }
    if (caseItem.antagonist && companyDataNameLower && caseItem.antagonist.toLowerCase().includes(companyDataNameLower)) {
      return 'Defendant';
    }
    // Check title for role indicators
    if (caseItem.title) {
      const titleLower = caseItem.title.toLowerCase();
      if (titleLower.includes('vs') || titleLower.includes('v.')) {
        const parts = titleLower.split(/vs|v\./);
        if (parts[0] && (parts[0].includes(companyNameLower) || (companyDataNameLower && parts[0].includes(companyDataNameLower)))) {
          return 'Plaintiff';
        }
        if (parts[1] && (parts[1].includes(companyNameLower) || (companyDataNameLower && parts[1].includes(companyDataNameLower)))) {
          return 'Defendant';
        }
      }
    }
    return 'Unknown';
  };

  // Helper function to format case date
  const formatCaseDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-GB', { 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric' 
      });
    } catch (e) {
      return dateString;
    }
  };

  // Helper function to get outcome badge color
  const getOutcomeBadgeColor = (outcome) => {
    if (!outcome) return 'bg-gray-100 text-gray-600';
    const outcomeLower = outcome.toLowerCase();
    if (outcomeLower.includes('won') || outcomeLower.includes('favorable') || outcomeLower === 'active') {
      return 'bg-[#30AB401A] text-emerald-500';
    }
    if (outcomeLower.includes('lost') || outcomeLower.includes('unfavorable') || outcomeLower === 'closed') {
      return 'bg-[#F36F261A] text-[#F59E0B]';
    }
    if (outcomeLower.includes('pending') || outcomeLower.includes('ongoing')) {
      return 'bg-blue-100 text-blue-600';
    }
    return 'bg-gray-100 text-gray-600';
  };

  // Filter cases by period (active/closed)
  const filteredCases = useMemo(() => {
    if (!relatedCases || relatedCases.length === 0) return [];
    
    console.log('[CompanyDetails] Filtering cases. Total cases:', relatedCases.length, 'Period:', casesPeriod);
    
    return relatedCases.filter(caseItem => {
      // Determine if case is active or closed based on status/outcome
      const status = caseItem.status || caseItem.ai_case_outcome || caseItem.outcome || '';
      const statusLower = (status || '').toLowerCase();
      
      // Default to active if status is empty, "N/A", or undefined
      const isActive = statusLower === 'active' || 
                      statusLower === 'ongoing' || 
                      statusLower === 'pending' ||
                      statusLower === '' ||
                      statusLower === 'n/a' ||
                      (!statusLower.includes('closed') && !statusLower.includes('won') && !statusLower.includes('lost') && !statusLower.includes('dismissed'));
      
      const matchesPeriod = casesPeriod === 'active' ? isActive : !isActive;
      
      if (!matchesPeriod) {
        console.log('[CompanyDetails] Case filtered out:', caseItem.title, 'Status:', status, 'isActive:', isActive, 'Period:', casesPeriod);
      }
      
      return matchesPeriod;
    }).filter(caseItem => {
      // Apply search filter
      if (!searchCaseQuery) return true;
      const query = searchCaseQuery.toLowerCase();
      return (
        caseItem.title?.toLowerCase().includes(query) ||
        caseItem.suit_reference_number?.toLowerCase().includes(query) ||
        caseItem.court_type?.toLowerCase().includes(query) ||
        getCompanyRole(caseItem).toLowerCase().includes(query)
      );
    });
  }, [relatedCases, casesPeriod, searchCaseQuery, companyName]);

  const tabs = [
    { id: 'personal', label: 'Personal information' },
    { id: 'directors', label: 'Directors' },
    { id: 'secretaries', label: 'Secretaries' },
    { id: 'employees', label: 'Employees' },
    { id: 'regulatory', label: 'Regulatory & Compliance' },
    { id: 'cases', label: 'Case list' },
    { id: 'bulletin', label: 'Commercial Bulletin' },
    { id: 'risk', label: 'Risk score' }
  ];

  // Extract beneficial owners from shareholders data
  const getBeneficialOwners = () => {
    if (!companyData || !companyData.shareholders) return [];
    
    try {
      let shareholders = companyData.shareholders;
      // Handle string JSON
      if (typeof shareholders === 'string') {
        shareholders = JSON.parse(shareholders);
      }
      
      if (Array.isArray(shareholders)) {
        return shareholders.map(sh => ({
          name: sh.name || 'Unknown',
          position: sh.type || 'Shareholder',
          tin: sh.tin || sh.tax_id || 'N/A',
          ownership: sh.ownership_percentage ? `${sh.ownership_percentage}%` : 'N/A',
          acquisitionDate: sh.acquired_date ? formatDate(sh.acquired_date) : 'N/A',
          riskLevel: '04 - Low' // Default, can be enhanced later
        }));
      }
    } catch (e) {
      console.error('Error parsing shareholders:', e);
    }
    
    return [];
  };
  
  const beneficialOwners = getBeneficialOwners();

  const registrationDocuments = [
    { file: 'ECOWIND_2015_.pdf', type: 'Registration document', date: 'Oct. 10, 2015' }
  ];

  // Extract directors from company data - memoized to re-evaluate when companyData changes
  const presentDirectors = useMemo(() => {
    console.log('[CompanyDetails] ===== COMPUTING presentDirectors =====');
    console.log('[CompanyDetails] companyData exists:', !!companyData);
    console.log('[CompanyDetails] companyId:', companyId);
    console.log('[CompanyDetails] dataRefreshKey:', dataRefreshKey);
    
    if (!companyData) {
      console.log('[CompanyDetails] No companyData, returning empty array');
      return [];
    }
    
    try {
      // Try directors field first, then board_of_directors
      let directors = companyData.directors || companyData.board_of_directors || [];
      
      console.log('[CompanyDetails] Raw directors data:', {
        hasDirectors: !!companyData.directors,
        directorsType: typeof companyData.directors,
        directorsIsArray: Array.isArray(companyData.directors),
        directorsLength: Array.isArray(companyData.directors) ? companyData.directors.length : 'N/A',
        hasBoardOfDirectors: !!companyData.board_of_directors,
        boardOfDirectorsType: typeof companyData.board_of_directors,
        boardOfDirectorsIsArray: Array.isArray(companyData.board_of_directors),
        boardOfDirectorsLength: Array.isArray(companyData.board_of_directors) ? companyData.board_of_directors.length : 'N/A',
        selected: directors,
        selectedType: typeof directors,
        selectedIsArray: Array.isArray(directors)
      });
      
      // If empty or null, return empty array
      if (!directors || (Array.isArray(directors) && directors.length === 0)) {
        console.log('[CompanyDetails] No directors data found or empty array');
        return [];
      }
      
      // Handle string JSON
      if (typeof directors === 'string') {
        console.log('[CompanyDetails] Directors is a string, attempting to parse...');
        try {
          directors = JSON.parse(directors);
          console.log('[CompanyDetails] Successfully parsed JSON, result:', directors);
        } catch (e) {
          console.warn('[CompanyDetails] Failed to parse as JSON:', e);
          // If it's a comma-separated string, convert to array
          if (directors.includes(',')) {
            directors = directors.split(',').map(name => ({ name: name.trim() }));
          } else if (directors.trim()) {
            directors = [{ name: directors.trim() }];
          } else {
            directors = [];
          }
        }
      }
      
      // Ensure it's an array
      if (!Array.isArray(directors)) {
        console.warn('[CompanyDetails] Directors is not an array after parsing:', directors, 'type:', typeof directors);
        return [];
      }
      
      if (directors.length > 0) {
        console.log('[CompanyDetails] Processing directors array, length:', directors.length);
        const result = directors.map((dir, idx) => {
          // Handle both object and string formats
          const director = typeof dir === 'string' ? { name: dir } : dir;
          
          console.log(`[CompanyDetails] Processing director ${idx}:`, {
            raw: dir,
            parsed: director,
            hasName: !!director?.name,
            name: director?.name,
            nameType: typeof director?.name,
            isObject: typeof director === 'object',
            allKeys: director ? Object.keys(director) : []
          });
          
          // Skip if no name (invalid data) - but be more lenient
          if (!director) {
            console.log(`[CompanyDetails] Skipping director ${idx} - director is null/undefined`);
            return null;
          }
          
          // Check name - handle various formats (be very lenient)
          const directorName = director.name || director.Name || director.NAME || director.full_name || director.fullName || '';
          
          // If still no name, check if director itself is a string
          if (!directorName && typeof director === 'string') {
            directorName = director;
            console.log(`[CompanyDetails] Director ${idx} is a string, using as name: "${directorName}"`);
          }
          
          // If still no name, try to find any string field that looks like a name
          if (!directorName && typeof director === 'object') {
            for (const key of Object.keys(director)) {
              const value = director[key];
              if (typeof value === 'string' && value.trim().length > 0) {
                // Skip common non-name fields
                const lowerValue = value.trim().toLowerCase();
                if (!['contact', 'phone', 'email', 'address', 'n/a', '0', 'null', 'undefined', 
                      'na', 'none', '', ' ', 'n/a', 'n/a'].includes(lowerValue)) {
                  // If it's a reasonable length for a name, use it
                  if (value.trim().length > 1 && value.trim().length < 200) {
                    directorName = value.trim();
                    console.warn(`[CompanyDetails] ⚠️ Using field "${key}" as name for director ${idx}: "${directorName}"`);
                    break;
                  }
                }
              }
            }
          }
          
          // Use fallback if no name found (for debugging - so we can see the director)
          let finalName = directorName;
          if (!directorName || directorName === 'Unknown' || (typeof directorName === 'string' && directorName.trim() === '')) {
            console.error(`[CompanyDetails] ❌ CRITICAL: Director ${idx} has no valid name!`, {
              name: directorName,
              allFields: Object.keys(director),
              fullObject: JSON.stringify(director, null, 2),
              directorType: typeof director,
              directorValue: director
            });
            // TEMPORARY: Create a fallback name so we can see the director and debug
            finalName = `Director ${idx + 1} (Check Console)`;
            console.error(`[CompanyDetails] ⚠️ TEMPORARY FIX: Using fallback name "${finalName}" - CHECK CONSOLE FOR ACTUAL DATA`);
          } else {
            console.log(`[CompanyDetails] ✅ Director ${idx} has valid name: "${directorName}"`);
            finalName = directorName;
          }
          
          // Format date of birth
          const dob = director.date_of_birth || director.dob || director.birth_date || '';
          const formattedDob = dob ? formatDate(dob) : 'N/A';
          
          // Format appointment date
          const appointmentDate = director.appointment_date || director.start_date || director.date_appointed || '';
          const formattedAppointmentDate = appointmentDate ? formatDate(appointmentDate) : 'N/A';
          
          // Determine if director is past or present based on end_date
          let endDate = director.end_date || director.termination_date || director.endDate || null;
          if (endDate === '' || endDate === 'null' || endDate === 'undefined') {
            endDate = null;
          }
          
          // If endDate is null, empty, or invalid, consider as present (no end date = still active)
          let isPresent = true;
          if (endDate && endDate !== null && endDate !== '') {
            try {
              const endDateObj = new Date(endDate);
              const now = new Date();
              // If end date is valid and in the past, director is past
              if (!isNaN(endDateObj.getTime()) && endDateObj < now) {
                isPresent = false;
                console.log(`[CompanyDetails] Director ${idx} (${directorName}) has past end_date: ${endDate}`);
              } else if (!isNaN(endDateObj.getTime()) && endDateObj >= now) {
                // Future end date means still present
                isPresent = true;
                console.log(`[CompanyDetails] Director ${idx} (${directorName}) has future end_date: ${endDate}`);
              }
            } catch (e) {
              // If date parsing fails, treat as present (assume active)
              console.log(`[CompanyDetails] Error parsing end_date for director ${idx}:`, endDate, e);
              isPresent = true;
            }
          } else {
            console.log(`[CompanyDetails] Director ${idx} (${directorName}) has no end_date, treating as present`);
          }
          
          // Filter by period - only return present directors
          // TEMPORARY DEBUG: Show all directors in present tab to debug
          if (!isPresent && directorsPeriod === 'present') {
            console.warn(`[CompanyDetails] ⚠️ Director ${idx} (${finalName}) has past end_date (${endDate}) but showing in present tab for debugging`);
            // Don't filter out - show it anyway for now
            // return null; // Commented out for debugging
          } else if (!isPresent) {
            console.log(`[CompanyDetails] Director ${idx} (${finalName}) is past, filtering out`);
            return null;
          }
          
          const resultObj = {
            name: finalName,
            contact: director.contact || director.phone || director.phone_number || director.email || 'N/A',
            dob: formattedDob,
            birthPlace: director.birth_place || director.place_of_birth || director.address || director.nationality || 'N/A',
            appointmentDate: formattedAppointmentDate,
            cases: director.cases || director.case_count || '0',
            riskScore: director.risk_score || director.risk_level || 'N/A',
            endDate: endDate ? formatDate(endDate) : null
          };
          
          console.log(`[CompanyDetails] ✅ Director ${idx} (${finalName}) will be included in result`);
          return resultObj;
        }).filter(dir => {
          // More lenient filtering with detailed logging
          if (!dir) {
            console.warn('[CompanyDetails] Filtering out null director');
            return false;
          }
          if (!dir.name) {
            console.warn('[CompanyDetails] Filtering out director with no name:', dir);
            console.warn('[CompanyDetails] Director object keys:', Object.keys(dir));
            return false;
          }
          if (dir.name === 'Unknown') {
            console.warn('[CompanyDetails] Filtering out director with Unknown name:', dir);
            return false;
          }
          if (typeof dir.name === 'string' && dir.name.trim() === '') {
            console.warn('[CompanyDetails] Filtering out director with empty name:', dir);
            return false;
          }
          console.log('[CompanyDetails] ✅ Director passed filter:', dir.name);
          return true;
        });
        
        console.log('[CompanyDetails] ===== PRESENT DIRECTORS RESULT =====');
        console.log('[CompanyDetails] Input directors count:', directors.length);
        console.log('[CompanyDetails] Output present directors count:', result.length);
        console.log('[CompanyDetails] Present directors:', result.map(d => d.name));
        
        if (result.length === 0 && directors.length > 0) {
          console.warn('[CompanyDetails] ⚠️ WARNING: Directors array has', directors.length, 'items but parsed result is empty!');
          console.warn('[CompanyDetails] All directors (full):', JSON.stringify(directors, null, 2));
          // Debug: show why each director was filtered out
          directors.forEach((dir, idx) => {
            const director = typeof dir === 'string' ? { name: dir } : dir;
            const directorName = director?.name || director?.Name || director?.NAME || '';
            
            console.warn(`[CompanyDetails] ===== DEBUGGING DIRECTOR ${idx} =====`);
            console.warn(`[CompanyDetails] Raw director:`, dir);
            console.warn(`[CompanyDetails] Parsed director:`, director);
            console.warn(`[CompanyDetails] Director name check:`, {
              hasName: !!director?.name,
              name: director?.name,
              Name: director?.Name,
              NAME: director?.NAME,
              selectedName: directorName,
              nameType: typeof directorName,
              nameTrimmed: typeof directorName === 'string' ? directorName.trim() : 'N/A',
              isEmpty: typeof directorName === 'string' && directorName.trim() === '',
              isUnknown: directorName === 'Unknown',
              allKeys: director ? Object.keys(director) : [],
              fullObject: JSON.stringify(director, null, 2)
            });
            
            const endDate = director?.end_date || director?.termination_date || director?.endDate || null;
            let isPresent = true;
            if (endDate && endDate !== null && endDate !== '') {
              try {
                const endDateObj = new Date(endDate);
                const now = new Date();
                if (!isNaN(endDateObj.getTime()) && endDateObj < now) {
                  isPresent = false;
                  console.warn(`[CompanyDetails]   Director ${idx} has PAST end_date: ${endDate}`);
                } else {
                  console.warn(`[CompanyDetails]   Director ${idx} has FUTURE/PRESENT end_date: ${endDate}`);
                }
              } catch (e) {
                console.warn(`[CompanyDetails]   Director ${idx} end_date parsing error:`, e);
                isPresent = true;
              }
            } else {
              console.warn(`[CompanyDetails]   Director ${idx} has NO end_date, should be PRESENT`);
            }
            
            console.warn(`[CompanyDetails]   Director ${idx} final status: name="${directorName}", endDate=${endDate}, isPresent=${isPresent}, willShow=${isPresent && directorName && directorName !== 'Unknown' && directorName.trim() !== ''}`);
            console.warn(`[CompanyDetails] ===== END DEBUG DIRECTOR ${idx} =====`);
          });
        }
        
        return result;
      } else {
        console.log('[CompanyDetails] Directors array is empty');
      }
    } catch (e) {
      console.error('[CompanyDetails] ❌ Error parsing directors:', e);
      console.error('[CompanyDetails] Error stack:', e.stack);
    }
    
    return [];
  }, [companyData, companyId, dataRefreshKey]);
  
  const pastDirectors = useMemo(() => {
    if (!companyData) return [];
    
    try {
      let directors = companyData.directors || companyData.board_of_directors || [];
      
      if (!directors || (Array.isArray(directors) && directors.length === 0)) {
        return [];
      }
      
      if (typeof directors === 'string') {
        try {
          directors = JSON.parse(directors);
        } catch (e) {
          if (directors.includes(',')) {
            directors = directors.split(',').map(name => ({ name: name.trim() }));
          } else if (directors.trim()) {
            directors = [{ name: directors.trim() }];
          } else {
            directors = [];
          }
        }
      }
      
      if (Array.isArray(directors) && directors.length > 0) {
        return directors.map(dir => {
          const director = typeof dir === 'string' ? { name: dir } : dir;
          
          // Skip if no name (invalid data)
          if (!director.name || director.name === 'Unknown' || director.name.trim() === '') {
            return null;
          }
          
          const dob = director.date_of_birth || director.dob || director.birth_date || '';
          const formattedDob = dob ? formatDate(dob) : 'N/A';
          
          const appointmentDate = director.appointment_date || director.start_date || director.date_appointed || '';
          const formattedAppointmentDate = appointmentDate ? formatDate(appointmentDate) : 'N/A';
          
          const endDate = director.end_date || director.termination_date || director.endDate || null;
          
          // If endDate is null, empty string, or invalid, consider as past (opposite of present logic)
          let isPresent = true;
          if (endDate) {
            try {
              const endDateObj = new Date(endDate);
              const now = new Date();
              // If end date is valid and in the past, director is past
              if (!isNaN(endDateObj.getTime()) && endDateObj < now) {
                isPresent = false;
              }
            } catch (e) {
              // If date parsing fails, treat as present (so it won't show in past)
              console.log('[CompanyDetails] Error parsing end_date for past directors:', endDate, e);
              isPresent = true;
            }
          }
          
          // Filter by period - only return past directors (isPresent = false)
          if (isPresent) return null;
          
          return {
            name: director.name,
            contact: director.contact || director.phone || director.phone_number || director.email || 'N/A',
            dob: formattedDob,
            birthPlace: director.birth_place || director.place_of_birth || director.address || director.nationality || 'N/A',
            appointmentDate: formattedAppointmentDate,
            cases: director.cases || director.case_count || '0',
            riskScore: director.risk_score || director.risk_level || 'N/A',
            endDate: endDate ? formatDate(endDate) : null
          };
        }).filter(dir => dir !== null && dir.name && dir.name !== 'Unknown');
      }
    } catch (e) {
      console.error('Error parsing directors:', e);
    }
    
    return [];
  }, [companyData, companyId, dataRefreshKey]);
  
  // Extract secretaries from company data - memoized to re-evaluate when companyData changes
  const presentSecretaries = useMemo(() => {
    if (!companyData) {
      console.log('[CompanyDetails] No companyData for secretaries, companyId:', companyId);
      return [];
    }
    
    try {
      // Secretary is typically a single object, not an array
      let secretary = companyData.secretary;
      
      console.log('[CompanyDetails] Raw secretary data for companyId:', companyId, 'Secretary:', secretary, 'Type:', typeof secretary);
      
      // If empty or null, return empty array
      if (!secretary || (typeof secretary === 'string' && secretary.trim() === '')) {
        console.log('[CompanyDetails] No secretary data found');
        return [];
      }
      
      // Handle string JSON
      if (typeof secretary === 'string') {
        try {
          secretary = JSON.parse(secretary);
        } catch (e) {
          if (secretary.trim()) {
            secretary = { name: secretary.trim() };
          } else {
            return [];
          }
        }
      }
      
      // If secretary is an object, convert to array for consistency
      if (secretary && typeof secretary === 'object' && !Array.isArray(secretary)) {
        const secretaryObj = secretary;
        
        // Skip if no name (invalid data)
        if (!secretaryObj.name || secretaryObj.name === 'Unknown' || secretaryObj.name.trim() === '') {
          return [];
        }
        
        const appointmentDate = secretaryObj.appointment_date || secretaryObj.start_date || secretaryObj.date_appointed || '';
        const formattedAppointmentDate = appointmentDate ? formatDate(appointmentDate) : 'N/A';
        
        // Get end_date, but treat empty strings as null
        let endDate = secretaryObj.end_date || secretaryObj.termination_date || secretaryObj.endDate || null;
        if (endDate === '' || endDate === 'null' || endDate === 'undefined') {
          endDate = null;
        }
        
        // If endDate is null, empty, or invalid, consider as present (no end date = still active)
        let isPresent = true;
        if (endDate && endDate !== null && endDate !== '') {
          try {
            const endDateObj = new Date(endDate);
            const now = new Date();
            // If end date is valid and in the past, secretary is past
            if (!isNaN(endDateObj.getTime()) && endDateObj < now) {
              isPresent = false;
            } else if (!isNaN(endDateObj.getTime()) && endDateObj >= now) {
              // Future end date means still present
              isPresent = true;
            }
          } catch (e) {
            // If date parsing fails, treat as present (assume active)
            console.log('[CompanyDetails] Error parsing secretary end_date:', endDate, e);
            isPresent = true;
          }
        }
        
        console.log('[CompanyDetails] Secretary:', secretaryObj.name, 'endDate:', endDate, 'isPresent:', isPresent);
        
        // Only return present secretaries
        if (!isPresent) return [];
        
        const result = [{
          name: secretaryObj.name,
          contact: secretaryObj.contact || secretaryObj.phone || secretaryObj.phone_number || secretaryObj.email || 'N/A',
          appointmentDate: formattedAppointmentDate,
          tin: secretaryObj.tax_identification_number || secretaryObj.tin || secretaryObj.tin_number || 'N/A',
          incorporationDate: secretaryObj.incorporation_date || secretaryObj.date_of_incorporation ? formatDate(secretaryObj.incorporation_date || secretaryObj.date_of_incorporation) : 'N/A',
          riskScore: secretaryObj.risk_score || secretaryObj.risk_level || 'N/A',
          endDate: endDate ? formatDate(endDate) : null
        }];
        
        console.log('[CompanyDetails] Parsed present secretaries:', result);
        return result;
      }
      
      // If secretary is an array (unlikely but handle it)
      if (Array.isArray(secretary) && secretary.length > 0) {
        const result = secretary.map(sec => {
          const secretaryObj = typeof sec === 'string' ? { name: sec } : sec;
          
          // Skip if no name (invalid data)
          if (!secretaryObj.name || secretaryObj.name === 'Unknown' || secretaryObj.name.trim() === '') {
            return null;
          }
          
          const appointmentDate = secretaryObj.appointment_date || secretaryObj.start_date || secretaryObj.date_appointed || '';
          const formattedAppointmentDate = appointmentDate ? formatDate(appointmentDate) : 'N/A';
          
          const endDate = secretaryObj.end_date || secretaryObj.termination_date || null;
          const isPresent = !endDate || (new Date(endDate) > new Date());
          
          if (!isPresent) return null;
          
          return {
            name: secretaryObj.name,
            contact: secretaryObj.contact || secretaryObj.phone || secretaryObj.phone_number || secretaryObj.email || 'N/A',
            appointmentDate: formattedAppointmentDate,
            tin: secretaryObj.tax_identification_number || secretaryObj.tin || secretaryObj.tin_number || 'N/A',
            incorporationDate: secretaryObj.incorporation_date || secretaryObj.date_of_incorporation ? formatDate(secretaryObj.incorporation_date || secretaryObj.date_of_incorporation) : 'N/A',
            riskScore: secretaryObj.risk_score || secretaryObj.risk_level || 'N/A',
            endDate: endDate ? formatDate(endDate) : null
          };
        }).filter(sec => sec !== null && sec.name && sec.name !== 'Unknown');
        
        console.log('[CompanyDetails] Parsed present secretaries (array) for companyId:', companyId, 'Result:', result);
        return result;
      }
    } catch (e) {
      console.error('[CompanyDetails] Error parsing secretaries:', e);
    }
    
    return [];
  }, [companyData, companyId, dataRefreshKey]);
  
  const pastSecretaries = useMemo(() => {
    if (!companyData) return [];
    
    try {
      let secretary = companyData.secretary;
      
      if (typeof secretary === 'string') {
        try {
          secretary = JSON.parse(secretary);
        } catch (e) {
          if (secretary.trim()) {
            secretary = { name: secretary.trim() };
          } else {
            return [];
          }
        }
      }
      
      if (secretary && typeof secretary === 'object' && !Array.isArray(secretary)) {
        const secretaryObj = secretary;
        
        const appointmentDate = secretaryObj.appointment_date || secretaryObj.start_date || secretaryObj.date_appointed || '';
        const formattedAppointmentDate = appointmentDate ? formatDate(appointmentDate) : 'N/A';
        
        const endDate = secretaryObj.end_date || secretaryObj.termination_date || secretaryObj.endDate || null;
        const isPresent = !endDate || (new Date(endDate) > new Date());
        
        // Only return past secretaries
        if (isPresent) return [];
        
        return [{
          name: secretaryObj.name || 'Unknown',
          contact: secretaryObj.contact || secretaryObj.phone || secretaryObj.phone_number || secretaryObj.email || 'N/A',
          appointmentDate: formattedAppointmentDate,
          tin: secretaryObj.tax_identification_number || secretaryObj.tin || secretaryObj.tin_number || 'N/A',
          incorporationDate: secretaryObj.incorporation_date || secretaryObj.date_of_incorporation ? formatDate(secretaryObj.incorporation_date || secretaryObj.date_of_incorporation) : 'N/A',
          riskScore: secretaryObj.risk_score || secretaryObj.risk_level || 'N/A',
          endDate: endDate ? formatDate(endDate) : null
        }];
      }
      
      if (Array.isArray(secretary)) {
        return secretary.map(sec => {
          const secretaryObj = typeof sec === 'string' ? { name: sec } : sec;
          
          const appointmentDate = secretaryObj.appointment_date || secretaryObj.start_date || secretaryObj.date_appointed || '';
          const formattedAppointmentDate = appointmentDate ? formatDate(appointmentDate) : 'N/A';
          
          // Get end_date, but treat empty strings as null
          let endDate = secretaryObj.end_date || secretaryObj.termination_date || secretaryObj.endDate || null;
          if (endDate === '' || endDate === 'null' || endDate === 'undefined') {
            endDate = null;
          }
          
          // If endDate is null, empty, or invalid, consider as past (opposite of present logic)
          let isPresent = true;
          if (endDate && endDate !== null && endDate !== '') {
            try {
              const endDateObj = new Date(endDate);
              const now = new Date();
              // If end date is valid and in the past, secretary is past
              if (!isNaN(endDateObj.getTime()) && endDateObj < now) {
                isPresent = false;
              }
            } catch (e) {
              // If date parsing fails, treat as present (so it won't show in past)
              console.log('[CompanyDetails] Error parsing end_date for past secretaries:', endDate, e);
              isPresent = true;
            }
          }
          
          // Filter by period - only return past secretaries (isPresent = false)
          if (isPresent) return null;
          
          return {
            name: secretaryObj.name || 'Unknown',
            contact: secretaryObj.contact || secretaryObj.phone || secretaryObj.phone_number || secretaryObj.email || 'N/A',
            appointmentDate: formattedAppointmentDate,
            tin: secretaryObj.tax_identification_number || secretaryObj.tin || secretaryObj.tin_number || 'N/A',
            incorporationDate: secretaryObj.incorporation_date || secretaryObj.date_of_incorporation ? formatDate(secretaryObj.incorporation_date || secretaryObj.date_of_incorporation) : 'N/A',
            riskScore: secretaryObj.risk_score || secretaryObj.risk_level || 'N/A',
            endDate: endDate ? formatDate(endDate) : null
          };
        }).filter(sec => sec !== null);
      }
    } catch (e) {
      console.error('Error parsing secretaries:', e);
    }
    
    return [];
  }, [companyData, companyId, dataRefreshKey]);
  
  // Extract employees from company data (stored in key_personnel) - memoized to re-evaluate when companyData changes
  const presentEmployees = useMemo(() => {
    if (!companyData) {
      console.log('[CompanyDetails] No companyData for employees');
      return [];
    }
    
    try {
      // Employees are stored in key_personnel field
      let employees = companyData.key_personnel || [];
      
      console.log('[CompanyDetails] Raw employees (key_personnel) data:', employees, 'Type:', typeof employees);
      
      // If empty or null, return empty array
      if (!employees || (Array.isArray(employees) && employees.length === 0)) {
        console.log('[CompanyDetails] No employees data found');
        return [];
      }
      
      // Handle string JSON
      if (typeof employees === 'string') {
        try {
          employees = JSON.parse(employees);
        } catch (e) {
          if (employees.includes(',')) {
            employees = employees.split(',').map(name => ({ name: name.trim() }));
          } else if (employees.trim()) {
            employees = [{ name: employees.trim() }];
          } else {
            employees = [];
          }
        }
      }
      
      if (Array.isArray(employees) && employees.length > 0) {
        console.log('[CompanyDetails] Processing employees array, length:', employees.length);
        const result = employees.map((emp, idx) => {
          const employee = typeof emp === 'string' ? { name: emp } : emp;
          
          console.log(`[CompanyDetails] Processing employee ${idx}:`, {
            raw: emp,
            parsed: employee,
            hasName: !!employee?.name,
            name: employee?.name,
            nameType: typeof employee?.name,
            isObject: typeof employee === 'object',
            allKeys: employee ? Object.keys(employee) : []
          });
          
          // Skip if no name (invalid data) - but be more lenient
          if (!employee || !employee.name || employee.name === 'Unknown' || (typeof employee.name === 'string' && employee.name.trim() === '')) {
            console.log(`[CompanyDetails] Skipping employee ${idx} - no valid name`);
            return null;
          }
          
          const dob = employee.date_of_birth || employee.dob || employee.birth_date || '';
          const formattedDob = dob ? formatDate(dob) : 'N/A';
          
          const appointmentDate = employee.start_date || employee.appointment_date || employee.date_appointed || '';
          const formattedAppointmentDate = appointmentDate ? formatDate(appointmentDate) : 'N/A';
          
          // Get end_date, but treat empty strings as null
          let endDate = employee.end_date || employee.termination_date || null;
          if (endDate === '' || endDate === 'null' || endDate === 'undefined') {
            endDate = null;
          }
          
          // If endDate is null, empty, or invalid, consider as present (no end date = still active)
          let isPresent = true;
          if (endDate && endDate !== null && endDate !== '') {
            try {
              const endDateObj = new Date(endDate);
              const now = new Date();
              // If end date is valid and in the past, employee is past
              if (!isNaN(endDateObj.getTime()) && endDateObj < now) {
                isPresent = false;
                console.log(`[CompanyDetails] Employee ${idx} (${employee.name}) has past end_date: ${endDate}`);
              } else if (!isNaN(endDateObj.getTime()) && endDateObj >= now) {
                // Future end date means still present
                isPresent = true;
                console.log(`[CompanyDetails] Employee ${idx} (${employee.name}) has future end_date: ${endDate}`);
              }
            } catch (e) {
              // If date parsing fails, treat as present (assume active)
              console.log(`[CompanyDetails] Error parsing end_date for employee ${idx}:`, endDate, e);
              isPresent = true;
            }
          } else {
            // No end date means still present
            console.log(`[CompanyDetails] Employee ${idx} (${employee.name}) has no end_date, treating as present`);
            isPresent = true;
          }
          
          // Only return present employees
          if (!isPresent) {
            console.log(`[CompanyDetails] Employee ${idx} (${employee.name}) is past, filtering out`);
            return null;
          }
          
          const resultObj = {
            name: employee.name,
            contact: employee.contact || employee.phone || employee.phone_number || employee.email || 'N/A',
            dob: formattedDob,
            birthPlace: employee.birth_place || employee.place_of_birth || employee.address || employee.department || 'N/A',
            position: employee.position || employee.job_title || employee.department || 'N/A',
            appointmentDate: formattedAppointmentDate,
            cases: employee.cases || employee.case_count || employee.legal_cases?.length || '0',
            riskScore: employee.risk_score || employee.risk_level || 'N/A',
            endDate: endDate ? formatDate(endDate) : null,
            reasonForLeaving: employee.reason_for_leaving || employee.reason || null,
            source: employee.source || null
          };
          
          console.log(`[CompanyDetails] ✅ Employee ${idx} (${employee.name}) will be included in result`);
          return resultObj;
        }).filter(emp => {
          // More lenient filtering with detailed logging
          if (!emp) {
            console.warn('[CompanyDetails] Filtering out null employee');
            return false;
          }
          if (!emp.name || emp.name === 'Unknown' || (typeof emp.name === 'string' && emp.name.trim() === '')) {
            console.warn('[CompanyDetails] Filtering out employee with invalid name:', emp);
            return false;
          }
          return true;
        });
        
        console.log('[CompanyDetails] ✅ Parsed present employees for companyId:', companyId, 'Result count:', result.length);
        if (result.length > 0) {
          console.log('[CompanyDetails] Present employees:', result.map(e => e.name));
        } else {
          console.warn('[CompanyDetails] ⚠️ No present employees found after filtering!');
        }
        return result;
      }
    } catch (e) {
      console.error('[CompanyDetails] Error parsing employees:', e);
    }
    
    return [];
  }, [companyData, companyId, dataRefreshKey]);
  
  const pastEmployees = useMemo(() => {
    if (!companyData) return [];
    
    try {
      let employees = companyData.key_personnel || [];
      
      if (typeof employees === 'string') {
        try {
          employees = JSON.parse(employees);
        } catch (e) {
          if (employees.includes(',')) {
            employees = employees.split(',').map(name => ({ name: name.trim() }));
          } else if (employees.trim()) {
            employees = [{ name: employees.trim() }];
          } else {
            employees = [];
          }
        }
      }
      
      if (Array.isArray(employees)) {
        return employees.map(emp => {
          const employee = typeof emp === 'string' ? { name: emp } : emp;
          
          const dob = employee.date_of_birth || employee.dob || employee.birth_date || '';
          const formattedDob = dob ? formatDate(dob) : 'N/A';
          
          const appointmentDate = employee.start_date || employee.appointment_date || employee.date_appointed || '';
          const formattedAppointmentDate = appointmentDate ? formatDate(appointmentDate) : 'N/A';
          
          // Get end_date, but treat empty strings as null
          let endDate = employee.end_date || employee.termination_date || null;
          if (endDate === '' || endDate === 'null' || endDate === 'undefined' || endDate === null) {
            endDate = null;
          }
          
          // Only return past employees - must have a valid past end_date
          // If endDate is null, empty, or invalid, it's a present employee (don't include in past)
          if (!endDate || endDate === null || endDate === '') {
            return null; // No end date = present employee, skip
          }
          
          // Check if end_date is in the past
          try {
            const endDateObj = new Date(endDate);
            const now = new Date();
            // Only include if end date is valid and in the past
            if (isNaN(endDateObj.getTime()) || endDateObj >= now) {
              return null; // Invalid date or future date = present employee, skip
            }
          } catch (e) {
            // If date parsing fails, treat as present (so it won't show in past)
            console.log('[CompanyDetails] Error parsing end_date for past employees:', endDate, e);
            return null; // Can't parse = assume present, skip
          }
          
          return {
            name: employee.name || 'Unknown',
            contact: employee.contact || employee.phone || employee.phone_number || employee.email || 'N/A',
            dob: formattedDob,
            birthPlace: employee.birth_place || employee.place_of_birth || employee.address || employee.department || 'N/A',
            position: employee.position || employee.job_title || employee.department || 'N/A',
            appointmentDate: formattedAppointmentDate,
            cases: employee.cases || employee.case_count || employee.legal_cases?.length || '0',
            riskScore: employee.risk_score || employee.risk_level || 'N/A',
            endDate: endDate ? formatDate(endDate) : null,
            reasonForLeaving: employee.reason_for_leaving || employee.reason || null,
            source: employee.source || null
          };
        }).filter(emp => emp !== null);
      }
    } catch (e) {
      console.error('Error parsing employees:', e);
    }
    
    return [];
  }, [companyData, companyId, dataRefreshKey]);


  // Fetch bulletin data when companyId changes
  useEffect(() => {
    const fetchBulletinData = async () => {
      if (!companyId) {
        setBulletinList([]);
        return;
      }

      try {
        setLoadingBulletin(true);
        const response = await apiGet(`/gazette/company/${companyId}?limit=100`);
        
        if (response && response.gazettes && Array.isArray(response.gazettes)) {
          console.log('[CompanyDetails] Fetched bulletin data:', response.gazettes);
          setBulletinList(response.gazettes);
        } else {
          setBulletinList([]);
        }
      } catch (err) {
        console.error('Error fetching bulletin data:', err);
        setBulletinList([]);
      } finally {
        setLoadingBulletin(false);
      }
    };

    fetchBulletinData();
  }, [companyId, dataRefreshKey]);

  const riskIndicators = [
    { indicator: '🧾 Pending Cases', status: '3', description: 'Active in High Court and Commercial Division' },
    { indicator: '⚖️ Judgments Lost', status: '2', description: 'Breach of Contract, Rent Dispute' },
    { indicator: '🏢 Commercial bulletin Mentions', status: '2', description: 'Revocation notice (2023), Penalty listing (2024)' },
    { indicator: '🕒 Last Legal Activity', status: 'July 2025', description: 'Ongoing lease dispute' },
    { indicator: '💰 Total Dispute Value', status: 'GHS 1.2M', description: 'Across all open cases' }
  ];

  const caseDisputeSummary = [
    { caseNumber: 'CM/0245/2023', caseType: 'Contract Dispute', court: 'High Court', status: 'Ongoing', outcome: '-', quantum: '150,000', weight: '15%' },
    { caseNumber: 'CM/0190/2022', caseType: 'Rent Dispute', court: 'District Court', status: 'Closed', outcome: 'Lost', quantum: '80,000', weight: '10%' },
    { caseNumber: 'CM/0111/2021', caseType: 'Regulatory Action', court: 'Tribunal', status: 'Closed', outcome: 'Won', quantum: '0', weight: '5%' },
    { caseNumber: 'CM/0088/2020', caseType: 'Breach of Contract', court: 'High Court', status: 'Closed', outcome: 'Lost', quantum: '100,000', weight: '12%' }
  ];

  // Handle edit regulatory
  const handleEditRegulatory = (regulatory, index) => {
    setEditingRegulatoryIndex(index);
    setEditingRegulatoryData(regulatory);
    setShowRegulatoryDrawer(true);
  };

  // Handle delete regulatory - show confirmation dialog
  const handleDeleteRegulatory = (regulatory, index) => {
    setRegulatoryToDelete(regulatory);
    setRegulatoryDeleteId(regulatory.id);
    setShowDeleteRegulatoryConfirm(true);
  };

  // Confirm delete regulatory
  const handleConfirmDeleteRegulatory = async () => {
    if (!companyId) {
      alert('Error: Missing company ID. Please refresh the page and try again.');
      setShowDeleteRegulatoryConfirm(false);
      setRegulatoryToDelete(null);
      setRegulatoryDeleteId(null);
      return;
    }

    const regulatory = regulatoryToDelete;
    const regulatoryId = regulatoryDeleteId;

    try {
      // Try to delete via API if ID exists
      if (regulatoryId) {
        try {
          await apiDelete(`/admin/companies/regulatory/${regulatoryId}`);
        } catch (deleteErr) {
          // If DELETE endpoint doesn't exist, remove from local state
          console.warn('Delete endpoint not available, removing from local state:', deleteErr);
        }
      }

      // Remove from local state
      const updatedList = regulatoryList.filter((item, idx) => {
        if (regulatoryId && item.id) {
          return item.id !== regulatoryId;
        }
        // Fallback: remove by index if no ID
        return idx !== regulatoryList.findIndex(r => 
          r.body === regulatory.body && 
          r.licenseNumber === regulatory.licenseNumber &&
          r.status === regulatory.status
        );
      });

      setRegulatoryList(updatedList);

      // Refresh from API to ensure consistency
      try {
        const response = await apiGet(`/admin/companies/regulatory/${companyId}`);
        if (response && response.regulatory) {
          setRegulatoryList(response.regulatory);
          setDataRefreshKey(prev => prev + 1);
        }
      } catch (fetchErr) {
        console.warn('Error refreshing regulatory list:', fetchErr);
      }

      setSuccessMessage(`Regulatory record has been deleted successfully!`);
      setShowSuccess(true);

      // Close confirmation dialog
      setShowDeleteRegulatoryConfirm(false);
      setRegulatoryToDelete(null);
      setRegulatoryDeleteId(null);
    } catch (err) {
      console.error('Error deleting regulatory record:', err);
      alert(`Error deleting regulatory record: ${err.detail || err.message || 'Failed to delete regulatory record. Please try again.'}`);
      setShowDeleteRegulatoryConfirm(false);
      setRegulatoryToDelete(null);
      setRegulatoryDeleteId(null);
    }
  };

  // Handle save regulatory (create or update)
  const handleSaveRegulatory = async (newData) => {
    if (!companyId) {
      console.error('Cannot save regulatory data: companyId is missing');
      alert('Error: Missing company ID. Please refresh the page and try again.');
      return;
    }

    const isUpdate = editingRegulatoryIndex !== null && editingRegulatoryData !== null;

    try {
      // Prepare data for API
      const regulatoryData = {
        company_id: companyId,
        regulatory_body: newData.regulatoryBody || null,
        license_permit_number: newData.licenseNumber || null,
        status: newData.licenseStatus || null,
        issue_date: newData.date || null,
        compliance_violations: newData.complianceViolations || null,
        regulatory_actions: newData.regulatoryActions || null,
        notes: newData.additionalNote || null
      };

      if (isUpdate && editingRegulatoryData?.id) {
        // Update existing record
        try {
          await apiPut(`/admin/companies/regulatory/${editingRegulatoryData.id}`, regulatoryData);
        } catch (updateErr) {
          // If PUT endpoint doesn't exist, we'll handle it by deleting and recreating
          console.warn('Update endpoint not available, will recreate:', updateErr);
          // Delete old record if possible
          if (editingRegulatoryData.id) {
            try {
              await apiDelete(`/admin/companies/regulatory/${editingRegulatoryData.id}`);
            } catch (deleteErr) {
              console.warn('Delete endpoint not available:', deleteErr);
            }
          }
          // Create new record
          await apiPost('/admin/companies/regulatory/', regulatoryData);
        }
      } else {
        // Create new record
        await apiPost('/admin/companies/regulatory/', regulatoryData);
      }

      // Wait a moment to ensure database commit is complete
      await new Promise(resolve => setTimeout(resolve, 300));

        // Refresh regulatory list
        const updatedResponse = await apiGet(`/admin/companies/regulatory/${companyId}`);
        if (updatedResponse && updatedResponse.regulatory) {
          setRegulatoryList(updatedResponse.regulatory);
        setDataRefreshKey(prev => prev + 1);
        setSuccessMessage(`Regulatory record has been ${isUpdate ? 'updated' : 'created'} successfully!`);
        setShowSuccess(true);
        }

      // Reset edit state
      setEditingRegulatoryIndex(null);
      setEditingRegulatoryData(null);
    } catch (err) {
      console.error('Error saving regulatory data:', err);
      const errorMsg = err.detail || err.message || 'Failed to save regulatory record. Please try again.';
      alert(`Error: ${errorMsg}`);
    }
  };

  // Handle edit case link
  const handleEditCase = (caseItem, index) => {
    // Extract case link data from the case item
    // Note: case_link_id might not be in the response, so we'll try to find it
    const caseLinkData = {
      id: caseItem.case_link_id || caseItem.link_id || caseItem.case_link_id,
      case_id: caseItem.id || caseItem.case_id,
      case_number: caseItem.suit_reference_number || caseItem.case_number,
      case_title: caseItem.title || caseItem.case_title,
      role_in_case: caseItem.role_in_case || getCompanyRole(caseItem) || ''
    };
    setEditingCaseIndex(index);
    setEditingCaseData(caseLinkData);
    setShowCaseDrawer(true);
  };

  // Handle delete case link - show confirmation dialog
  const handleDeleteCase = (caseItem, index) => {
    const caseLinkId = caseItem.case_link_id || caseItem.link_id;
    setCaseToDelete(caseItem);
    setCaseLinkDeleteId(caseLinkId);
    setShowDeleteCaseConfirm(true);
  };

  // Confirm delete case link
  const handleConfirmDeleteCase = async () => {
    if (!companyId) {
      alert('Error: Missing company ID. Please refresh the page and try again.');
      setShowDeleteCaseConfirm(false);
      setCaseToDelete(null);
      setCaseLinkDeleteId(null);
      return;
    }

    const caseItem = caseToDelete;
    const caseLinkId = caseLinkDeleteId;

    try {
      // Try to delete via API if ID exists
      if (caseLinkId) {
        try {
          await apiDelete(`/admin/companies/case-links/${caseLinkId}`);
        } catch (deleteErr) {
          // If DELETE endpoint doesn't exist, remove from local state
          console.warn('Delete endpoint not available, removing from local state:', deleteErr);
        }
      }

      // Remove from local state
      const updatedCases = relatedCases.filter((item, idx) => {
        if (caseLinkId && (item.case_link_id || item.link_id)) {
          return (item.case_link_id || item.link_id) !== caseLinkId;
        }
        // Fallback: remove by case ID if no link ID
        return item.id !== caseItem.id;
      });

      setRelatedCases(updatedCases);

      // Refresh from API to ensure consistency
      try {
        await loadRelatedCases(companyData?.name || company?.name);
      } catch (fetchErr) {
        console.warn('Error refreshing case list:', fetchErr);
      }

      setSuccessMessage(`Case link has been deleted successfully!`);
      setShowSuccess(true);

      // Close confirmation dialog
      setShowDeleteCaseConfirm(false);
      setCaseToDelete(null);
      setCaseLinkDeleteId(null);
    } catch (err) {
      console.error('Error deleting case link:', err);
      alert(`Error deleting case link: ${err.detail || err.message || 'Failed to delete case link. Please try again.'}`);
      setShowDeleteCaseConfirm(false);
      setCaseToDelete(null);
      setCaseLinkDeleteId(null);
    }
  };

  // Handle save case link (create or update)
  const handleSaveCase = async (newData) => {
    if (!companyId) {
      console.error('Cannot save case link: companyId is missing');
      alert('Error: Missing company ID. Please refresh the page and try again.');
      return;
    }

    const isUpdate = editingCaseIndex !== null && editingCaseData !== null;

    try {
      // Prepare data for API
      const caseLinkData = {
        company_id: companyId,
        case_id: newData.caseId || null,
        case_number: newData.caseNumber || null,
        case_title: newData.caseTitle || null,
        role_in_case: newData.roleInCase || null
      };

      if (isUpdate && editingCaseData?.id) {
        // Update existing case link
        try {
          await apiPut(`/admin/companies/case-links/${editingCaseData.id}`, caseLinkData);
        } catch (updateErr) {
          // If PUT endpoint doesn't exist, we'll handle it by deleting and recreating
          console.warn('Update endpoint not available, will recreate:', updateErr);
          // Delete old link if possible
          if (editingCaseData.id) {
            try {
              await apiDelete(`/admin/companies/case-links/${editingCaseData.id}`);
            } catch (deleteErr) {
              console.warn('Delete endpoint not available:', deleteErr);
            }
          }
          // Create new link
          await apiPost('/admin/companies/case-links/', caseLinkData);
        }
      } else {
        // Create new case link
        await apiPost('/admin/companies/case-links/', caseLinkData);
      }

      // Wait a moment to ensure database commit is complete
      await new Promise(resolve => setTimeout(resolve, 800));

      // Refresh case list - use companyId directly to fetch from case links
      if (companyId) {
        try {
          // Fetch directly using company ID to get case links
          const endpoint = entityType === 'bank' 
            ? `/banks/${companyId}/related-cases?limit=100`
            : entityType === 'insurance'
            ? `/insurance/${companyId}/related-cases?limit=100`
            : `/companies/${companyId}/related-cases?limit=100`;
          
          console.log('[CompanyDetails] Refreshing cases from endpoint:', endpoint);
          const response = await apiGet(endpoint);
          console.log('[CompanyDetails] Refreshed cases after save - full response:', response);
          
          const responseKey = entityType === 'bank' || entityType === 'insurance' ? 'related_cases' : 'cases';
          let cases = [];
          if (response && response[responseKey] && Array.isArray(response[responseKey])) {
            cases = response[responseKey];
          } else if (response && response.cases && Array.isArray(response.cases)) {
            cases = response.cases;
          } else if (response && response.related_cases && Array.isArray(response.related_cases)) {
            cases = response.related_cases;
          }
          
          console.log('[CompanyDetails] Parsed cases after save:', cases.length, cases);
          setRelatedCases(cases);
          setDataRefreshKey(prev => prev + 1);
        } catch (refreshErr) {
          console.error('Error refreshing cases:', refreshErr);
          // Fallback to original method
          await loadRelatedCases(companyData?.name || company?.name);
        }
      } else {
        await loadRelatedCases(companyData?.name || company?.name);
      }
      
      setSuccessMessage(`Case link has been ${isUpdate ? 'updated' : 'created'} successfully!`);
      setShowSuccess(true);

      // Reset edit state
      setEditingCaseIndex(null);
      setEditingCaseData(null);
    } catch (err) {
      console.error('Error saving case link:', err);
      const errorMsg = err.detail || err.message || 'Failed to save case link. Please try again.';
      alert(`Error: ${errorMsg}`);
    }
  };

  // Handle edit bulletin
  const handleEditBulletin = (bulletin, index) => {
    setEditingBulletinIndex(index);
    setEditingBulletinData(bulletin);
    setShowBulletinDrawer(true);
  };

  // Handle delete bulletin - show confirmation dialog
  const handleDeleteBulletin = (bulletin, index) => {
    setBulletinToDelete(bulletin);
    setBulletinDeleteId(bulletin.id);
    setShowDeleteBulletinConfirm(true);
  };

  // Confirm delete bulletin
  const handleConfirmDeleteBulletin = async () => {
    if (!companyId) {
      alert('Error: Missing company ID. Please refresh the page and try again.');
      setShowDeleteBulletinConfirm(false);
      setBulletinToDelete(null);
      setBulletinDeleteId(null);
      return;
    }

    const bulletin = bulletinToDelete;
    const bulletinId = bulletinDeleteId;

    try {
      // Try to delete via API if ID exists
      if (bulletinId) {
        try {
          await apiDelete(`/gazette/${bulletinId}`);
        } catch (deleteErr) {
          console.warn('Delete endpoint not available, removing from local state:', deleteErr);
        }
      }

      // Remove from local state
      const updatedList = bulletinList.filter((item, idx) => {
        if (bulletinId && item.id) {
          return item.id !== bulletinId;
        }
        return idx !== bulletinList.findIndex(b => 
          b.gazette_number === bulletin.gazette_number && 
          b.title === bulletin.title
        );
      });

      setBulletinList(updatedList);

      // Refresh from API to ensure consistency
      try {
        const response = await apiGet(`/gazette/company/${companyId}?limit=100`);
        if (response && response.gazettes) {
          setBulletinList(response.gazettes);
          setDataRefreshKey(prev => prev + 1);
        }
      } catch (fetchErr) {
        console.warn('Error refreshing bulletin list:', fetchErr);
      }

      setSuccessMessage(`Bulletin entry has been deleted successfully!`);
      setShowSuccess(true);

      // Close confirmation dialog
      setShowDeleteBulletinConfirm(false);
      setBulletinToDelete(null);
      setBulletinDeleteId(null);
    } catch (err) {
      console.error('Error deleting bulletin entry:', err);
      alert(`Error deleting bulletin entry: ${err.detail || err.message || 'Failed to delete bulletin entry. Please try again.'}`);
      setShowDeleteBulletinConfirm(false);
      setBulletinToDelete(null);
      setBulletinDeleteId(null);
    }
  };

  // Handle save bulletin (create or update)
  const handleSaveBulletin = async (newData) => {
    if (!companyId) {
      console.error('Cannot save bulletin data: companyId is missing');
      alert('Error: Missing company ID. Please refresh the page and try again.');
      return;
    }

    const isUpdate = editingBulletinIndex !== null && editingBulletinData !== null;

    try {
      // Prepare data for API
      const bulletinData = {
        title: newData.title || `${newData.noticeType} - ${companyData?.name || company?.name || 'Company'}`,
        description: newData.description || '',
        content: newData.description || newData.content || '',
        gazette_type: newData.noticeType || 'OTHER',
        publication_date: newData.uploadDate || new Date().toISOString(),
        effective_date: newData.dateSigning || null,
        gazette_number: newData.bulletinNo || null,
        company_id: companyId,
        status: 'PUBLISHED'
      };

      if (isUpdate && editingBulletinData?.id) {
        // Update existing bulletin
        try {
          await apiPut(`/gazette/${editingBulletinData.id}`, bulletinData);
        } catch (updateErr) {
          console.warn('Update endpoint not available, will recreate:', updateErr);
          // Delete old record if possible
          if (editingBulletinData.id) {
            try {
              await apiDelete(`/gazette/${editingBulletinData.id}`);
            } catch (deleteErr) {
              console.warn('Delete endpoint not available:', deleteErr);
            }
          }
          // Create new record
          await apiPost('/gazette/', bulletinData);
        }
      } else {
        // Create new bulletin
        await apiPost('/gazette/', bulletinData);
      }

      // Wait a moment to ensure database commit is complete
      await new Promise(resolve => setTimeout(resolve, 500));

      // Refresh bulletin list
      const response = await apiGet(`/gazette/company/${companyId}?limit=100`);
      if (response && response.gazettes) {
        setBulletinList(response.gazettes);
        setDataRefreshKey(prev => prev + 1);
        setSuccessMessage(`Bulletin entry has been ${isUpdate ? 'updated' : 'created'} successfully!`);
        setShowSuccess(true);
      }

      // Reset edit state
      setEditingBulletinIndex(null);
      setEditingBulletinData(null);
    } catch (err) {
      console.error('Error saving bulletin data:', err);
      const errorMsg = err.detail || err.message || 'Failed to save bulletin entry. Please try again.';
      alert(`Error: ${errorMsg}`);
    }
  };

  // Handle edit director
  const handleEditDirector = (director, index) => {
    // Get the original director data from companyData
    let currentDirectors = [];
    if (companyData) {
      currentDirectors = companyData.directors || companyData.board_of_directors || [];
      if (typeof currentDirectors === 'string') {
        try {
          currentDirectors = JSON.parse(currentDirectors);
        } catch (e) {
          currentDirectors = [];
        }
      }
      if (!Array.isArray(currentDirectors)) {
        currentDirectors = [];
      }
    }
    
    // Find the actual director in the full directors array by name
    const actualDirector = currentDirectors.find((dir, idx) => {
      const dirName = dir.name || dir.Name || dir.NAME || dir.full_name || dir.fullName || '';
      return dirName === director.name;
    });
    
    const actualIndex = currentDirectors.findIndex((dir, idx) => {
      const dirName = dir.name || dir.Name || dir.NAME || dir.full_name || dir.fullName || '';
      return dirName === director.name;
    });
    
    // Prepare director data with original dates (not formatted)
    const directorData = actualDirector ? {
      name: actualDirector.name || director.name,
      contact: actualDirector.contact || director.contact,
      dob: actualDirector.date_of_birth || actualDirector.dob || director.dob,
      birthPlace: actualDirector.birth_place || actualDirector.birthPlace || director.birthPlace,
      appointmentDate: actualDirector.appointment_date || actualDirector.appointmentDate || director.appointmentDate,
      endDate: actualDirector.end_date || actualDirector.endDate || director.endDate,
      cases: actualDirector.cases || director.cases,
      riskScore: actualDirector.risk_score || actualDirector.riskScore || director.riskScore
    } : director;
    
    setEditingDirectorIndex(actualIndex >= 0 ? actualIndex : index);
    setEditingDirectorData(directorData);
    setShowDirectorDrawer(true);
  };

  // Handle delete director - show confirmation dialog
  const handleDeleteDirector = (director, index) => {
    setDirectorToDelete(director);
    setDirectorDeleteIndex(index);
    setShowDeleteConfirm(true);
  };

  // Confirm delete director
  const handleConfirmDeleteDirector = async () => {
    if (!companyId) {
      alert('Error: Missing company ID. Please refresh the page and try again.');
      setShowDeleteConfirm(false);
      setDirectorToDelete(null);
      setDirectorDeleteIndex(null);
      return;
    }

    const director = directorToDelete;
    const index = directorDeleteIndex;

    try {
      // Get current directors array
      let currentDirectors = [];
      if (companyData) {
        currentDirectors = companyData.directors || companyData.board_of_directors || [];
        if (typeof currentDirectors === 'string') {
          try {
            currentDirectors = JSON.parse(currentDirectors);
          } catch (e) {
            currentDirectors = [];
          }
        }
        if (!Array.isArray(currentDirectors)) {
          currentDirectors = [];
        }
      }

      // Find and remove the director by name (more reliable than index)
      const updatedDirectors = currentDirectors.filter((dir, idx) => {
        const dirName = dir.name || dir.Name || dir.NAME || dir.full_name || dir.fullName || '';
        return dirName !== director.name;
      });

      // Prepare update data
      const updateData = {
        directors: JSON.stringify(updatedDirectors),
        board_of_directors: JSON.stringify(updatedDirectors)
      };

      // Use correct endpoint based on entity type
      const updateEndpoint = entityType === 'bank' 
        ? `/admin/banks/${companyId}`
        : entityType === 'insurance'
        ? `/admin/insurance/${companyId}`
        : `/admin/companies/${companyId}`;
      
      await apiPut(updateEndpoint, updateData);
      await new Promise(resolve => setTimeout(resolve, 500));

      // Refresh company data
      const getEndpoint = entityType === 'bank' 
        ? `/admin/banks/${companyId}`
        : entityType === 'insurance'
        ? `/admin/insurance/${companyId}`
        : `/admin/companies/${companyId}`;
      
      const response = await apiGet(getEndpoint);
      const data = response.company || response.insurance || response.bank || response;
      
      if (!data) {
        throw new Error('Failed to fetch updated company data');
      }
      
      setCompanyData({ ...data });
      setDataRefreshKey(prev => prev + 1);
      
      setSuccessMessage(`Director "${director.name}" has been deleted successfully!`);
      setShowSuccess(true);
      
      // Close confirmation dialog
      setShowDeleteConfirm(false);
      setDirectorToDelete(null);
      setDirectorDeleteIndex(null);
    } catch (err) {
      console.error('Error deleting director:', err);
      alert(`Error deleting director: ${err.detail || err.message || 'Failed to delete director. Please try again.'}`);
      setShowDeleteConfirm(false);
      setDirectorToDelete(null);
      setDirectorDeleteIndex(null);
    }
  };

  // Handle save director (create or update)
  const handleSaveDirector = async (newData) => {
    if (!companyId) {
      console.error('[CompanyDetails] Cannot save director: companyId is missing');
      alert('Error: Missing company ID. Please refresh the page and try again.');
      return;
    }

    if (!newData || !newData.name || !newData.name.trim()) {
      console.error('[CompanyDetails] Cannot save director: name is required');
      alert('Error: Director name is required.');
      return;
    }

    try {
      const isUpdate = editingDirectorIndex !== null;
      console.log('[CompanyDetails] ===== STARTING DIRECTOR ' + (isUpdate ? 'UPDATE' : 'SAVE') + ' =====');
      console.log('[CompanyDetails] Company ID:', companyId, 'Entity Type:', entityType);
      console.log('[CompanyDetails] Director data:', newData);
      console.log('[CompanyDetails] Is update:', isUpdate, 'Index:', editingDirectorIndex);
      
      // Get current directors array - check both fields
      let currentDirectors = [];
      
      if (companyData) {
        currentDirectors = companyData.directors || companyData.board_of_directors || [];
        
        // Parse if string
        if (typeof currentDirectors === 'string') {
          try {
            currentDirectors = JSON.parse(currentDirectors);
          } catch (e) {
            console.warn('[CompanyDetails] Failed to parse directors as JSON, treating as comma-separated:', e);
            // If not JSON, treat as comma-separated
            if (currentDirectors.includes(',')) {
              currentDirectors = currentDirectors.split(',').map(name => ({ name: name.trim() }));
            } else if (currentDirectors.trim()) {
              currentDirectors = [{ name: currentDirectors.trim() }];
            } else {
              currentDirectors = [];
            }
          }
        }
      }
      
      // Ensure it's an array
      if (!Array.isArray(currentDirectors)) {
        console.warn('[CompanyDetails] Current directors is not an array, converting:', currentDirectors);
        currentDirectors = [];
      }

      console.log('[CompanyDetails] Current directors count:', currentDirectors.length);

      // Create director object with proper field names
      const directorData = {
        name: newData.name.trim(),
        contact: newData.contact?.trim() || null,
        date_of_birth: newData.dateOfBirth?.trim() || null,
        birth_place: newData.birthPlace?.trim() || null,
        appointment_date: newData.appointmentDate?.trim() || null,
        end_date: newData.endDate?.trim() || null, // null means present director
        cases: newData.cases || '0',
        risk_score: newData.riskScore || 'N/A'
      };
      
      console.log('[CompanyDetails] Director object created:', directorData);

      // Update or add to array
      let updatedDirectors;
      if (isUpdate && editingDirectorIndex >= 0 && editingDirectorIndex < currentDirectors.length) {
        // Update existing director
        updatedDirectors = [...currentDirectors];
        updatedDirectors[editingDirectorIndex] = directorData;
        console.log('[CompanyDetails] Updated director at index:', editingDirectorIndex);
      } else {
        // Add new director
        updatedDirectors = [...currentDirectors, directorData];
        console.log('[CompanyDetails] Added new director');
      }
      console.log('[CompanyDetails] Updated directors count:', updatedDirectors.length);

      // Prepare update data - send as JSON string
      const updateData = {
        directors: JSON.stringify(updatedDirectors),
        board_of_directors: JSON.stringify(updatedDirectors)
      };

      console.log('[CompanyDetails] Update data prepared:', {
        directorsLength: updatedDirectors.length,
        directorsString: updateData.directors.substring(0, 100) + '...'
      });
      
      // Use correct endpoint based on entity type
      const updateEndpoint = entityType === 'bank' 
        ? `/admin/banks/${companyId}`
        : entityType === 'insurance'
        ? `/admin/insurance/${companyId}`
        : `/admin/companies/${companyId}`;
      
      console.log('[CompanyDetails] Sending PUT request to:', updateEndpoint);
      const updateResponse = await apiPut(updateEndpoint, updateData);
      console.log('[CompanyDetails] Update response received:', updateResponse);
      
      // Wait a moment to ensure database commit is complete
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Refresh company data from API
      const getEndpoint = entityType === 'bank' 
        ? `/admin/banks/${companyId}`
        : entityType === 'insurance'
        ? `/admin/insurance/${companyId}`
        : `/admin/companies/${companyId}`;
      
      console.log('[CompanyDetails] Fetching updated data from:', getEndpoint);
      const response = await apiGet(getEndpoint);
      const data = response.company || response.insurance || response.bank || response;
      
      if (!data) {
        throw new Error('Failed to fetch updated company data');
      }
      
      console.log('[CompanyDetails] ===== REFRESHED DATA AFTER SAVE =====');
      console.log('[CompanyDetails] Directors field:', {
        exists: !!data.directors,
        type: typeof data.directors,
        isArray: Array.isArray(data.directors),
        length: Array.isArray(data.directors) ? data.directors.length : 'N/A',
        value: data.directors
      });
      
      console.log('[CompanyDetails] Board_of_directors field:', {
        exists: !!data.board_of_directors,
        type: typeof data.board_of_directors,
        isArray: Array.isArray(data.board_of_directors),
        length: Array.isArray(data.board_of_directors) ? data.board_of_directors.length : 'N/A',
        value: data.board_of_directors
      });
      
      // Log each director in the response
      const directorsArray = Array.isArray(data.directors) ? data.directors : 
                            (Array.isArray(data.board_of_directors) ? data.board_of_directors : []);
      
      if (directorsArray.length > 0) {
        console.log('[CompanyDetails] ✅ Directors found in response:', directorsArray.length);
        directorsArray.forEach((dir, idx) => {
          console.log(`  [${idx}] ${dir.name || 'No name'}`, {
            hasEndDate: !!dir.end_date,
            endDate: dir.end_date,
            allFields: Object.keys(dir)
          });
        });
      } else {
        console.warn('[CompanyDetails] ⚠️ NO DIRECTORS FOUND IN RESPONSE!');
        console.warn('[CompanyDetails] Full response keys:', Object.keys(data));
      }
      
      // Update state with fresh data
      setCompanyData({ ...data });
      setDataRefreshKey(prev => prev + 1);
      
      console.log('[CompanyDetails] State updated, dataRefreshKey incremented');
      
      // Show success notification
      setSuccessMessage(`Director "${newData.name}" has been ${isUpdate ? 'updated' : 'added'} successfully!`);
      setShowSuccess(true);
      
      // Reset edit state
      setEditingDirectorIndex(null);
      setEditingDirectorData(null);
      
      console.log('[CompanyDetails] ✅ Director save process completed successfully');
    } catch (err) {
      console.error('[CompanyDetails] ❌ Error saving director:', err);
      console.error('[CompanyDetails] Error details:', {
        message: err.message,
        detail: err.detail,
        status: err.status,
        stack: err.stack
      });
      const errorMsg = err.detail || err.message || 'Failed to save director. Please try again.';
      alert(`Error saving director: ${errorMsg}\n\nCheck the browser console for more details.`);
    }
  };

  // Handle save secretary
  // Handle edit secretary
  const handleEditSecretary = (secretary) => {
    // Get the original secretary data from companyData
    let currentSecretary = companyData?.secretary || {};
      if (typeof currentSecretary === 'string') {
        try {
          currentSecretary = JSON.parse(currentSecretary);
        } catch (e) {
          currentSecretary = { name: currentSecretary };
        }
      }
      
    // Prepare secretary data with original dates (not formatted)
    const secretaryData = {
      name: currentSecretary.name || secretary.name,
      contact: currentSecretary.contact || secretary.contact,
      appointmentDate: currentSecretary.appointment_date || currentSecretary.appointmentDate || secretary.appointmentDate,
      tin: currentSecretary.tax_identification_number || currentSecretary.tin || secretary.tin,
      incorporationDate: currentSecretary.incorporation_date || currentSecretary.incorporationDate || secretary.incorporationDate,
      endDate: currentSecretary.end_date || currentSecretary.endDate || secretary.endDate,
      riskScore: currentSecretary.risk_score || currentSecretary.riskScore || secretary.riskScore
    };
    
    setEditingSecretaryData(secretaryData);
    setShowSecretaryDrawer(true);
  };

  // Handle delete secretary - show confirmation dialog
  const handleDeleteSecretary = (secretary) => {
    setSecretaryToDelete(secretary);
    setShowDeleteSecretaryConfirm(true);
  };

  // Confirm delete secretary
  const handleConfirmDeleteSecretary = async () => {
    if (!companyId) {
      alert('Error: Missing company ID. Please refresh the page and try again.');
      setShowDeleteSecretaryConfirm(false);
      setSecretaryToDelete(null);
      return;
    }

    const secretary = secretaryToDelete;

    try {
      // Delete secretary by setting it to null
      const updateData = {
        secretary: null
      };

      // Use correct endpoint based on entity type
      const updateEndpoint = entityType === 'bank' 
        ? `/admin/banks/${companyId}`
        : entityType === 'insurance'
        ? `/admin/insurance/${companyId}`
        : `/admin/companies/${companyId}`;
      
      await apiPut(updateEndpoint, updateData);
      await new Promise(resolve => setTimeout(resolve, 500));

      // Refresh company data
      const getEndpoint = entityType === 'bank' 
        ? `/admin/banks/${companyId}`
        : entityType === 'insurance'
        ? `/admin/insurance/${companyId}`
        : `/admin/companies/${companyId}`;
      
      const response = await apiGet(getEndpoint);
      const data = response.company || response.insurance || response.bank || response;
      
      if (!data) {
        throw new Error('Failed to fetch updated company data');
      }
      
      setCompanyData({ ...data });
      setDataRefreshKey(prev => prev + 1);
      
      setSuccessMessage(`Secretary "${secretary.name}" has been deleted successfully!`);
      setShowSuccess(true);
      
      // Close confirmation dialog
      setShowDeleteSecretaryConfirm(false);
      setSecretaryToDelete(null);
    } catch (err) {
      console.error('Error deleting secretary:', err);
      alert(`Error deleting secretary: ${err.detail || err.message || 'Failed to delete secretary. Please try again.'}`);
      setShowDeleteSecretaryConfirm(false);
      setSecretaryToDelete(null);
    }
  };

  const handleSaveSecretary = async (newData) => {
    if (!companyId || !companyData) {
      console.error('Cannot save secretary: companyId or companyData is missing');
      alert('Error: Missing company information. Please refresh the page and try again.');
      return;
    }

    const isUpdate = editingSecretaryData !== null;

    try {
      // Create new secretary object
      const newSecretary = {
        name: newData.name,
        contact: newData.contact || null,
        appointment_date: newData.appointmentDate || null,
        tax_identification_number: newData.tin || null,
        incorporation_date: newData.incorporationDate || null,
        end_date: newData.endDate || null
      };

      // Update company via API
      const updateData = {
        secretary: JSON.stringify(newSecretary)
      };

      console.log('Saving secretary:', newSecretary);
      console.log('Update data:', updateData);
      
      // Use correct endpoint based on entity type
      const updateEndpoint = entityType === 'bank' 
        ? `/admin/banks/${companyId}`
        : entityType === 'insurance'
        ? `/admin/insurance/${companyId}`
        : `/admin/companies/${companyId}`;
      
      console.log('[CompanyDetails] Using update endpoint:', updateEndpoint, 'for entityType:', entityType);
      const updateResponse = await apiPut(updateEndpoint, updateData);
      console.log('Update response:', updateResponse);
      
      // Wait a brief moment to ensure database commit is complete
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Refresh company data
      const endpoint = entityType === 'bank' 
        ? `/admin/banks/${companyId}`
        : entityType === 'insurance'
        ? `/admin/insurance/${companyId}`
        : `/admin/companies/${companyId}`;
      
      const response = await apiGet(endpoint);
      const data = response.company || response.insurance || response.bank || response;
      
      console.log('[CompanyDetails] Refreshed company data after secretary save:', {
        hasSecretary: !!data?.secretary,
        secretaryType: typeof data?.secretary,
        secretaryValue: data?.secretary
      });
      
      // Force update by creating a new object reference
      setCompanyData({ ...data });
      setDataRefreshKey(prev => prev + 1);
      
      // Show success notification
      setSuccessMessage(`Secretary "${newData.name}" has been ${isUpdate ? 'updated' : 'saved'} successfully!`);
      setShowSuccess(true);
      
      // Reset edit state
      setEditingSecretaryData(null);
    } catch (err) {
      console.error('Error saving secretary:', err);
      const errorMsg = err.detail || err.message || 'Failed to save secretary. Please try again.';
      alert(`Error: ${errorMsg}`);
    }
  };

  // Handle edit employee
  const handleEditEmployee = (employee, index) => {
    // Get the original employee data from companyData
    let currentEmployees = [];
    if (companyData) {
      currentEmployees = companyData.key_personnel || [];
      if (typeof currentEmployees === 'string') {
        try {
          currentEmployees = JSON.parse(currentEmployees);
        } catch (e) {
          currentEmployees = [];
        }
      }
      if (!Array.isArray(currentEmployees)) {
        currentEmployees = [];
      }
    }
    
    // Find the actual employee in the full employees array by name
    const actualEmployee = currentEmployees.find((emp, idx) => {
      const empName = emp.name || emp.Name || emp.NAME || emp.full_name || emp.fullName || '';
      return empName === employee.name;
    });
    
    const actualIndex = currentEmployees.findIndex((emp, idx) => {
      const empName = emp.name || emp.Name || emp.NAME || emp.full_name || emp.fullName || '';
      return empName === employee.name;
    });
    
    // Prepare employee data with original dates (not formatted)
    const employeeData = actualEmployee ? {
      name: actualEmployee.name || employee.name,
      position: actualEmployee.position || employee.position,
      department: actualEmployee.department || employee.department,
      contact: actualEmployee.contact || employee.contact,
      dob: actualEmployee.date_of_birth || actualEmployee.dob || employee.dob,
      birthPlace: actualEmployee.birth_place || actualEmployee.birthPlace || employee.birthPlace,
      appointmentDate: actualEmployee.start_date || actualEmployee.appointmentDate || employee.appointmentDate,
      endDate: actualEmployee.end_date || actualEmployee.endDate || employee.endDate,
      reasonForLeaving: actualEmployee.reason_for_leaving || actualEmployee.reasonForLeaving || employee.reasonForLeaving,
      source: actualEmployee.source || employee.source,
      cases: actualEmployee.cases || employee.cases,
      riskScore: actualEmployee.risk_score || actualEmployee.riskScore || employee.riskScore
    } : employee;
    
    setEditingEmployeeIndex(actualIndex >= 0 ? actualIndex : index);
    setEditingEmployeeData(employeeData);
    setShowEmployeeDrawer(true);
  };

  // Handle delete employee - show confirmation dialog
  const handleDeleteEmployee = (employee, index) => {
    setEmployeeToDelete(employee);
    setEmployeeDeleteIndex(index);
    setShowDeleteEmployeeConfirm(true);
  };

  // Confirm delete employee
  const handleConfirmDeleteEmployee = async () => {
    if (!companyId) {
      alert('Error: Missing company ID. Please refresh the page and try again.');
      setShowDeleteEmployeeConfirm(false);
      setEmployeeToDelete(null);
      setEmployeeDeleteIndex(null);
      return;
    }

    const employee = employeeToDelete;
    const index = employeeDeleteIndex;

    try {
      // Get current employees array
      let currentEmployees = [];
      if (companyData) {
        currentEmployees = companyData.key_personnel || [];
        if (typeof currentEmployees === 'string') {
          try {
            currentEmployees = JSON.parse(currentEmployees);
          } catch (e) {
            currentEmployees = [];
          }
        }
        if (!Array.isArray(currentEmployees)) {
          currentEmployees = [];
        }
      }

      // Find and remove the employee by name (more reliable than index)
      const updatedEmployees = currentEmployees.filter((emp, idx) => {
        const empName = emp.name || emp.Name || emp.NAME || emp.full_name || emp.fullName || '';
        return empName !== employee.name;
      });

      // Prepare update data
      const updateData = {
        key_personnel: JSON.stringify(updatedEmployees)
      };

      // Use correct endpoint based on entity type
      const updateEndpoint = entityType === 'bank' 
        ? `/admin/banks/${companyId}`
        : entityType === 'insurance'
        ? `/admin/insurance/${companyId}`
        : `/admin/companies/${companyId}`;
      
      await apiPut(updateEndpoint, updateData);
      await new Promise(resolve => setTimeout(resolve, 500));

      // Refresh company data
      const getEndpoint = entityType === 'bank' 
        ? `/admin/banks/${companyId}`
        : entityType === 'insurance'
        ? `/admin/insurance/${companyId}`
        : `/admin/companies/${companyId}`;
      
      const response = await apiGet(getEndpoint);
      const data = response.company || response.insurance || response.bank || response;
      
      if (!data) {
        throw new Error('Failed to fetch updated company data');
      }
      
      setCompanyData({ ...data });
      setDataRefreshKey(prev => prev + 1);
      
      setSuccessMessage(`Employee "${employee.name}" has been deleted successfully!`);
      setShowSuccess(true);
      
      // Close confirmation dialog
      setShowDeleteEmployeeConfirm(false);
      setEmployeeToDelete(null);
      setEmployeeDeleteIndex(null);
    } catch (err) {
      console.error('Error deleting employee:', err);
      alert(`Error deleting employee: ${err.detail || err.message || 'Failed to delete employee. Please try again.'}`);
      setShowDeleteEmployeeConfirm(false);
      setEmployeeToDelete(null);
      setEmployeeDeleteIndex(null);
    }
  };

  // Handle save employee (create or update)
  const handleSaveEmployee = async (newData) => {
    if (!companyId || !companyData) {
      console.error('Cannot save employee: companyId or companyData is missing');
      alert('Error: Missing company information. Please refresh the page and try again.');
      return;
    }

    const isUpdate = editingEmployeeIndex !== null;

    try {
      // Get current key_personnel array
      let currentEmployees = companyData.key_personnel || [];
      
      // Parse if string
      if (typeof currentEmployees === 'string') {
        try {
          currentEmployees = JSON.parse(currentEmployees);
        } catch (e) {
          currentEmployees = [];
        }
      }
      
      if (!Array.isArray(currentEmployees)) {
        currentEmployees = [];
      }

      // Create employee object
      // Ensure end_date is null (not empty string) if not provided
      const endDateValue = newData.endDate && newData.endDate.trim() !== '' ? newData.endDate : null;
      
      const employeeData = {
        name: newData.name,
        position: newData.position || null,
        department: newData.department || null,
        contact: newData.contact || null,
        date_of_birth: newData.dateOfBirth && newData.dateOfBirth.trim() !== '' ? newData.dateOfBirth : null,
        birth_place: newData.birthPlace || null,
        start_date: newData.startDate && newData.startDate.trim() !== '' ? newData.startDate : null,
        end_date: endDateValue, // This will be null if not provided or empty
        reason_for_leaving: newData.reasonForLeaving || null,
        source: newData.source || null
      };

      console.log('[CompanyDetails] Employee data being saved:', {
        name: employeeData.name,
        hasEndDate: !!employeeData.end_date,
        endDate: employeeData.end_date,
        endDateType: typeof employeeData.end_date
      });

      // Update or add to array
      let updatedEmployees;
      if (isUpdate && editingEmployeeIndex >= 0 && editingEmployeeIndex < currentEmployees.length) {
        // Update existing employee
        updatedEmployees = [...currentEmployees];
        updatedEmployees[editingEmployeeIndex] = employeeData;
        console.log('[CompanyDetails] Updated employee at index:', editingEmployeeIndex);
      } else {
        // Add new employee
        updatedEmployees = [...currentEmployees, employeeData];
        console.log('[CompanyDetails] Added new employee');
      }

      // Update company via API
      const updateData = {
        key_personnel: JSON.stringify(updatedEmployees)
      };

      console.log('Saving employee:', employeeData);
      console.log('Update data:', updateData);
      
      // Use correct endpoint based on entity type
      const updateEndpoint = entityType === 'bank' 
        ? `/admin/banks/${companyId}`
        : entityType === 'insurance'
        ? `/admin/insurance/${companyId}`
        : `/admin/companies/${companyId}`;
      
      console.log('[CompanyDetails] Using update endpoint:', updateEndpoint, 'for entityType:', entityType);
      const updateResponse = await apiPut(updateEndpoint, updateData);
      console.log('Update response:', updateResponse);
      
      // Wait a brief moment to ensure database commit is complete
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Refresh company data from API
      const endpoint = entityType === 'bank' 
        ? `/admin/banks/${companyId}`
        : entityType === 'insurance'
        ? `/admin/insurance/${companyId}`
        : `/admin/companies/${companyId}`;
      
      console.log('[CompanyDetails] Fetching updated data from:', endpoint);
      const response = await apiGet(endpoint);
      const data = response.company || response.insurance || response.bank || response;
      
      if (!data) {
        throw new Error('Failed to fetch updated company data');
      }
      
      console.log('[CompanyDetails] ===== REFRESHED DATA AFTER EMPLOYEE SAVE =====');
      console.log('[CompanyDetails] Key_personnel field:', {
        exists: !!data.key_personnel,
        type: typeof data.key_personnel,
        isArray: Array.isArray(data.key_personnel),
        length: Array.isArray(data.key_personnel) ? data.key_personnel.length : 'N/A',
        value: data.key_personnel
      });
      
      // Log each employee in the response
      const employeesArray = Array.isArray(data.key_personnel) ? data.key_personnel : [];
      
      if (employeesArray.length > 0) {
        console.log('[CompanyDetails] ✅ Employees found in response:', employeesArray.length);
        employeesArray.forEach((emp, idx) => {
          console.log(`  [${idx}] ${emp.name || 'No name'}`, {
            hasEndDate: !!emp.end_date,
            endDate: emp.end_date,
            allFields: Object.keys(emp)
          });
        });
      } else {
        console.warn('[CompanyDetails] ⚠️ NO EMPLOYEES FOUND IN RESPONSE!');
        console.warn('[CompanyDetails] Full response keys:', Object.keys(data));
      }
      
      // Update state with fresh data
      setCompanyData({ ...data });
      setDataRefreshKey(prev => prev + 1);
      
      console.log('[CompanyDetails] State updated, dataRefreshKey incremented');
      
      // Show success notification
      setSuccessMessage(`Employee "${newData.name}" has been ${isUpdate ? 'updated' : 'added'} successfully!`);
      setShowSuccess(true);
      
      // Reset edit state
      setEditingEmployeeIndex(null);
      setEditingEmployeeData(null);
    } catch (err) {
      console.error('Error saving employee:', err);
      const errorMsg = err.detail || err.message || 'Failed to save employee. Please try again.';
      alert(`Error: ${errorMsg}`);
    }
  };

  // Show case details if a case is selected
  if (selectedCase) {
    return (
      <CompanyCaseDetails
        caseData={selectedCase}
        onBack={() => setSelectedCase(null)}
        userInfo={userInfo}
        company={company}
      />
    );
  }

  return (
    <div className="bg-[#F7F8FA] min-h-screen pt-2">
      <div className="flex flex-col gap-4">
        {/* Header */}
        <div className="flex justify-between items-start py-3.5 px-1.5 rounded">
          <div className="flex justify-between items-center w-[700px] pr-2 rounded-lg border border-solid border-[#D4E1EA] bg-white">
            <input
              type="text"
              placeholder="Search persons, companies and cases here"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 text-[#525866] bg-transparent text-xs py-3.5 pl-2 mr-1 border-0 outline-none"
            />
            <div className="flex items-center w-[73px] gap-1.5">
              <img src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Iq8V0MifpP/xv3115ru_expires_30_days.png" className="w-[19px] h-[19px] object-fill" />
              <div className="flex items-center bg-white w-12 py-1 px-[9px] gap-1 rounded">
                <span className="text-[#525866] text-xs font-bold">All</span>
                <img src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Iq8V0MifpP/6d8d4w7q_expires_30_days.png" className="w-3 h-3 rounded object-fill" />
              </div>
            </div>
          </div>
          <div className="flex items-center w-[173px] py-[1px] gap-3">
            <img src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Iq8V0MifpP/3idz4s6u_expires_30_days.png" className="w-9 h-9 object-fill" />
            <div className="flex items-center w-[125px] gap-1.5">
              <img src={userInfo?.avatar || "/images/image.png"} className="w-9 h-9 rounded-full object-cover" />
              <div className="flex flex-col items-start w-[83px] gap-1">
                <span className="text-[#040E1B] text-base font-bold">{userInfo?.name || 'Eric Kwaah'}</span>
                <div className="flex items-center gap-1">
                  <img src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Iq8V0MifpP/6aa44xax_expires_30_days.png" className="w-2 h-2 object-fill" />
                  <span className="text-[#525866] text-xs">Online</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex flex-col items-start bg-white pr-3.5 rounded-lg">
          {/* Breadcrumb */}
          <div className="flex items-start mt-4 mb-6 ml-3.5">
            <span className="text-[#525866] text-xs mr-1.5">COMPANIES</span>
            <img src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Iq8V0MifpP/me9huclu_expires_30_days.png" className="w-4 h-4 mr-1 object-fill" />
            <span className="text-[#525866] text-xs mr-1.5">{industry?.name?.toUpperCase() || 'ENERGY'}</span>
            <img src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Iq8V0MifpP/4mw2o4qc_expires_30_days.png" className="w-4 h-4 mr-1 object-fill" />
            <span className="text-[#070810] text-sm">{companyName}</span>
          </div>

          {/* Company Header */}
          <div className="flex justify-between items-center self-stretch mb-6 ml-3.5 gap-4">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <button onClick={onBack} className="cursor-pointer hover:opacity-70 flex-shrink-0">
                <img src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Iq8V0MifpP/6h14mydk_expires_30_days.png" className="w-4 h-4 object-fill" />
              </button>
              <div className="flex flex-col items-start gap-1 min-w-0 flex-1">
                <span className="text-[#040E1B] text-xl font-bold truncate w-full">{companyName}</span>
                <span className="text-red-500 text-xs font-bold">High risk [90/100]</span>
              </div>
            </div>

            <div className="flex items-center gap-3 flex-shrink-0">
              {!isEditing ? (
                <button 
                  onClick={() => setIsEditing(true)}
                  className="flex items-center px-4 py-2 gap-2 rounded-lg border border-solid border-[#022658] hover:bg-blue-50 whitespace-nowrap"
                >
                  <Edit className="w-4 h-4 text-[#022658]" />
                  <span className="text-[#022658] text-base font-bold" style={{ fontFamily: 'Satoshi' }}>Edit Details</span>
                </button>
              ) : (
                <>
                  <button 
                    onClick={handleCancelEdit}
                    className="flex items-center px-4 py-2 gap-2 rounded-lg border border-solid border-gray-300 hover:bg-gray-50 whitespace-nowrap"
                  >
                    <X className="w-4 h-4 text-gray-600" />
                    <span className="text-gray-600 text-base font-bold" style={{ fontFamily: 'Satoshi' }}>Cancel</span>
                  </button>
                  <button 
                    onClick={handleSaveEdit}
                    disabled={isSaving}
                    className="flex items-center px-4 py-2 gap-2 rounded-lg border border-solid border-[#022658] bg-[#022658] hover:bg-[#033a7a] text-white disabled:opacity-50 whitespace-nowrap"
                  >
                    <Save className="w-4 h-4" />
                    <span className="text-base font-bold" style={{ fontFamily: 'Satoshi' }}>{isSaving ? 'Saving...' : 'Save Changes'}</span>
                  </button>
                </>
              )}
            <button 
              onClick={handleWatchlistToggle}
              disabled={watchlistLoading}
              className={`flex items-center bg-transparent text-left w-[168px] py-2 px-4 gap-1 rounded-lg border border-solid ${
                isInWatchlist 
                  ? 'border-green-500 bg-green-50 hover:bg-green-100' 
                  : 'border-[#F59E0B] hover:bg-orange-50'
              } transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <img src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Iq8V0MifpP/6m4v5flc_expires_30_days.png" className="w-4 h-4 rounded-lg object-fill" />
              <span className={`text-base whitespace-nowrap ${isInWatchlist ? 'text-green-600' : 'text-[#F59E0B]'}`} style={{ fontFamily: 'Satoshi' }}>
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
          <div className="flex items-start self-stretch mb-6 ml-3.5 gap-3">
            <div className="flex items-center bg-white flex-1 p-2 gap-3 rounded-lg border border-solid border-[#D4E1EA]">
              <img src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Iq8V0MifpP/acu5m2ms_expires_30_days.png" className="w-10 h-10 rounded-lg object-fill" />
              <div className="flex flex-col items-start gap-1">
                <span className="text-[#868C98] text-xs">Companies affiliated with</span>
                <span className="text-[#F59E0B] text-base">{companiesAffiliatedCount}</span>
              </div>
            </div>
            <div className="flex items-center bg-white flex-1 p-2 gap-[11px] rounded-lg border border-solid border-[#D4E1EA]">
              <img src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Iq8V0MifpP/ozya58hb_expires_30_days.png" className="w-10 h-10 rounded-lg object-fill" />
              <div className="flex flex-col items-start gap-1">
                <span className="text-[#868C98] text-xs">Persons affiliated with</span>
                <span className="text-[#F59E0B] text-base">{personsAffiliatedCount}</span>
              </div>
            </div>
            <div className="flex items-center bg-white flex-1 p-2 gap-3 rounded-lg border border-solid border-[#D4E1EA]">
              <img src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Iq8V0MifpP/d4xyin4j_expires_30_days.png" className="w-10 h-10 rounded-lg object-fill" />
              <div className="flex flex-col items-start gap-1">
                <span className="text-[#868C98] text-xs">Bulletin notices</span>
                <span className="text-[#F59E0B] text-base">{bulletinNoticesCount}</span>
              </div>
            </div>
            <div className="flex items-center bg-white flex-1 p-2 gap-[11px] rounded-lg border border-solid border-[#D4E1EA]">
              <img src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Iq8V0MifpP/bi92jidy_expires_30_days.png" className="w-10 h-10 rounded-lg object-fill" />
              <div className="flex flex-col items-start gap-1">
                <span className="text-[#868C98] text-xs">Total amount of related data</span>
                <span className="text-[#F59E0B] text-base">{totalRelatedDataCount}</span>
              </div>
            </div>
          </div>

          {/* Tabs and Content */}
          <div className="flex flex-col items-start self-stretch bg-white py-4 mb-[109px] ml-3.5 gap-4 rounded-3xl">
            {/* Tabs */}
            <div className="flex items-start p-1 gap-4">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex flex-col items-start pb-2 ${
                    activeTab === tab.id ? 'border-b-2 border-[#022658]' : ''
                  }`}
                >
                  <span className={`text-base ${
                    activeTab === tab.id ? 'text-[#022658] font-bold' : 'text-[#525866]'
                  }`}>
                    {tab.label}
                  </span>
                </button>
              ))}
            </div>

            {/* Personal Information Tab */}
            {activeTab === 'personal' && (
              <div className="flex flex-col items-start self-stretch bg-white py-4 px-6 gap-4 rounded-lg border border-solid border-[#E4E7EB]" style={{boxShadow: '4px 4px 4px #0708101A'}}>
                {loading ? (
                  <div className="flex justify-center items-center py-12 w-full">
                    <span className="text-[#525866] text-sm">Loading company details...</span>
                  </div>
                ) : error ? (
                  <div className="flex justify-center items-center py-12 w-full">
                    <span className="text-red-500 text-sm">{error}</span>
                  </div>
                ) : !companyData ? (
                  <div className="flex justify-center items-center py-12 w-full">
                    <span className="text-[#525866] text-sm">No company data available</span>
                  </div>
                ) : (
                  <>
                    {/* Edit Mode Indicator */}
                    {isEditing && (
                      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg mb-4">
                        <span className="text-blue-800 text-sm font-medium">✏️ Edit Mode: You can now modify the company details below</span>
                      </div>
                    )}
                    <span className="text-[#868C98] text-xs">BIO</span>
                    
                    {/* Bio Fields */}
                    <div className="flex flex-col self-stretch gap-2">
                      {/* Status */}
                      <div className="flex items-center self-stretch">
                        <span className="text-[#040E1B] text-[10px] w-[200px]">Status</span>
                        {isEditing ? (
                          <select
                            value={editFormData.status || 'Active'}
                            onChange={(e) => setEditFormData({...editFormData, status: e.target.value})}
                            className="px-2 py-1 border border-[#D4E1EA] rounded text-sm text-[#040E1B] flex-1"
                          >
                            <option value="Active">Active</option>
                            <option value="Inactive">Inactive</option>
                          </select>
                        ) : (
                          <span className={`${companyData.is_active ? 'text-emerald-500' : 'text-red-500'} text-sm`}>
                            {editFormData.status || companyData.status || (companyData.is_active ? 'Active' : 'Inactive')}
                          </span>
                        )}
                        </div>
                      {/* CEO */}
                      <div className="flex items-center self-stretch">
                        <span className="text-[#040E1B] text-[10px] w-[200px]">CEO</span>
                        {isEditing ? (
                          <input
                            type="text"
                            value={editFormData.ceo || ''}
                            onChange={(e) => setEditFormData({...editFormData, ceo: e.target.value})}
                            className="px-2 py-1 border border-[#D4E1EA] rounded text-sm text-[#040E1B] flex-1"
                          />
                        ) : (
                          <span className="text-[#040E1B] text-sm">{editFormData.ceo || getCEO() || 'N/A'}</span>
                        )}
                      </div>
                      {/* Business type */}
                      <div className="flex items-center self-stretch">
                        <span className="text-[#040E1B] text-[10px] w-[200px]">Business type</span>
                        {isEditing ? (
                          <input
                            type="text"
                            value={editFormData.businessType || ''}
                            onChange={(e) => setEditFormData({...editFormData, businessType: e.target.value})}
                            className="px-2 py-1 border border-[#D4E1EA] rounded text-sm text-[#040E1B] flex-1"
                          />
                        ) : (
                          <span className="text-[#040E1B] text-sm">{editFormData.businessType || companyData.type_of_company || companyData.company_type || 'N/A'}</span>
                        )}
                      </div>
                      {/* Company type */}
                      <div className="flex items-center self-stretch">
                        <span className="text-[#040E1B] text-[10px] w-[200px]">Company type</span>
                        {isEditing ? (
                          <input
                            type="text"
                            value={editFormData.companyType || ''}
                            onChange={(e) => setEditFormData({...editFormData, companyType: e.target.value})}
                            className="px-2 py-1 border border-[#D4E1EA] rounded text-sm text-[#040E1B] flex-1"
                          />
                        ) : (
                          <span className="text-[#040E1B] text-sm">{editFormData.companyType || companyData.company_type || companyData.type_of_company || 'N/A'}</span>
                        )}
                      </div>
                      {/* Entity name */}
                      <div className="flex items-center self-stretch">
                        <span className="text-[#040E1B] text-[10px] w-[200px]">Entity name</span>
                        {isEditing ? (
                          <input
                            type="text"
                            value={editFormData.entityName || ''}
                            onChange={(e) => setEditFormData({...editFormData, entityName: e.target.value})}
                            className="px-2 py-1 border border-[#D4E1EA] rounded text-sm text-[#040E1B] flex-1"
                          />
                        ) : (
                          <span className="text-[#040E1B] text-sm">{editFormData.entityName || companyData.name || companyName}</span>
                        )}
                      </div>
                      {/* Registration number */}
                      <div className="flex items-center self-stretch">
                        <span className="text-[#040E1B] text-[10px] w-[200px]">Registration number</span>
                        {isEditing ? (
                          <input
                            type="text"
                            value={editFormData.registrationNumber || ''}
                            onChange={(e) => setEditFormData({...editFormData, registrationNumber: e.target.value})}
                            className="px-2 py-1 border border-[#D4E1EA] rounded text-sm text-[#040E1B] flex-1"
                          />
                        ) : (
                          <span className="text-[#040E1B] text-sm">{editFormData.registrationNumber || companyData.registration_number || 'N/A'}</span>
                        )}
                      </div>
                      {/* Principal activity */}
                      <div className="flex items-start self-stretch">
                        <span className="text-[#040E1B] text-[10px] w-[200px]">Principal activity</span>
                        {isEditing ? (
                          <textarea
                            value={editFormData.principalActivity || ''}
                            onChange={(e) => setEditFormData({...editFormData, principalActivity: e.target.value})}
                            className="px-2 py-1 border border-[#D4E1EA] rounded text-sm text-[#040E1B] flex-1 min-h-[60px]"
                            rows={3}
                          />
                        ) : (
                        <span className="text-[#040E1B] text-sm w-[519px] whitespace-pre-line">
                            {editFormData.principalActivity || formatBusinessActivities() || 'N/A'}
                        </span>
                        )}
                      </div>
                      {/* TIN */}
                      <div className="flex items-center self-stretch">
                        <span className="text-[#040E1B] text-[10px] w-[200px]">TIN</span>
                        {isEditing ? (
                          <input
                            type="text"
                            value={editFormData.tin || ''}
                            onChange={(e) => setEditFormData({...editFormData, tin: e.target.value})}
                            className="px-2 py-1 border border-blue-500 rounded text-sm text-blue-500 flex-1"
                          />
                        ) : (
                          <span className="text-blue-500 text-sm">{editFormData.tin || companyData.tax_identification_number || companyData.tin_number || 'N/A'}</span>
                        )}
                      </div>
                      {/* Incorporation date */}
                      <div className="flex items-center self-stretch">
                        <span className="text-[#040E1B] text-[10px] w-[200px]">Incorporation date</span>
                        {isEditing ? (
                          <input
                            type="date"
                            value={editFormData.incorporationDate || ''}
                            onChange={(e) => setEditFormData({...editFormData, incorporationDate: e.target.value})}
                            className="px-2 py-1 border border-[#D4E1EA] rounded text-sm text-[#040E1B] flex-1"
                          />
                        ) : (
                          <span className="text-[#040E1B] text-sm">{editFormData.incorporationDate || formatDate(companyData.date_of_incorporation) || 'N/A'}</span>
                        )}
                      </div>
                      {/* Commencement date */}
                      <div className="flex items-center self-stretch">
                        <span className="text-[#040E1B] text-[10px] w-[200px]">Commencement date</span>
                        {isEditing ? (
                          <input
                            type="date"
                            value={editFormData.commencementDate || ''}
                            onChange={(e) => setEditFormData({...editFormData, commencementDate: e.target.value})}
                            className="px-2 py-1 border border-[#D4E1EA] rounded text-sm text-[#040E1B] flex-1"
                          />
                        ) : (
                          <span className="text-[#040E1B] text-sm">{editFormData.commencementDate || formatDate(companyData.date_of_commencement) || 'N/A'}</span>
                        )}
                      </div>
                    </div>

                    {/* Place of Business & Contact */}
                    <div className="flex flex-col items-start self-stretch gap-1">
                      <span className="text-[#525866] text-xs">Place of Business & Contact</span>
                      <div className="flex flex-col self-stretch gap-2">
                        {/* Building Number */}
                        <div className="flex items-center self-stretch">
                          <span className="text-[#040E1B] text-[10px] w-[200px]">Building Number</span>
                          {isEditing ? (
                            <input
                              type="text"
                              value={editFormData.buildingNumber || ''}
                              onChange={(e) => setEditFormData({...editFormData, buildingNumber: e.target.value})}
                              className="px-2 py-1 border border-[#D4E1EA] rounded text-sm text-[#040E1B] flex-1"
                            />
                          ) : (
                            <span className="text-[#040E1B] text-sm">{editFormData.buildingNumber || companyData.address || companyData.head_office_address || 'N/A'}</span>
                          )}
                          </div>
                        {/* Landmark */}
                        <div className="flex items-center self-stretch">
                          <span className="text-[#040E1B] text-[10px] w-[200px]">Landmark</span>
                          {isEditing ? (
                            <input
                              type="text"
                              value={editFormData.landmark || ''}
                              onChange={(e) => setEditFormData({...editFormData, landmark: e.target.value})}
                              className="px-2 py-1 border border-[#D4E1EA] rounded text-sm text-[#040E1B] flex-1"
                            />
                          ) : (
                            <span className="text-[#040E1B] text-sm">{editFormData.landmark || companyData.landmark || 'N/A'}</span>
                          )}
                        </div>
                        {/* City */}
                        <div className="flex items-center self-stretch">
                          <span className="text-[#040E1B] text-[10px] w-[200px]">City</span>
                          {isEditing ? (
                            <input
                              type="text"
                              value={editFormData.city || ''}
                              onChange={(e) => setEditFormData({...editFormData, city: e.target.value})}
                              className="px-2 py-1 border border-[#D4E1EA] rounded text-sm text-[#040E1B] flex-1"
                            />
                          ) : (
                            <span className="text-[#040E1B] text-sm">{editFormData.city || companyData.city || 'N/A'}</span>
                          )}
                        </div>
                        {/* District */}
                        <div className="flex items-center self-stretch">
                          <span className="text-[#040E1B] text-[10px] w-[200px]">District</span>
                          {isEditing ? (
                            <input
                              type="text"
                              value={editFormData.district || ''}
                              onChange={(e) => setEditFormData({...editFormData, district: e.target.value})}
                              className="px-2 py-1 border border-[#D4E1EA] rounded text-sm text-[#040E1B] flex-1"
                            />
                          ) : (
                            <span className="text-[#040E1B] text-sm">{editFormData.district || companyData.district || 'N/A'}</span>
                          )}
                        </div>
                        {/* Region */}
                        <div className="flex items-center self-stretch">
                          <span className="text-[#040E1B] text-[10px] w-[200px]">Region</span>
                          {isEditing ? (
                            <div className="relative flex-1" ref={regionDropdownRef}>
                              <button
                                type="button"
                                onClick={() => setShowRegionDropdown(!showRegionDropdown)}
                                className="w-full px-2 py-1 border border-[#D4E1EA] rounded text-sm text-[#040E1B] flex items-center justify-between bg-white"
                              >
                                <span>{editFormData.region || 'Select Region'}</span>
                                <ChevronDown className="w-4 h-4 text-[#040E1B]" />
                              </button>
                              {showRegionDropdown && (
                                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#D4E1EA] rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
                                  {regions.map((region) => (
                                    <button
                                      key={region}
                                      type="button"
                                      onClick={() => {
                                        setEditFormData({...editFormData, region});
                                        setShowRegionDropdown(false);
                                      }}
                                      className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm text-[#040E1B]"
                                    >
                                      {region}
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-[#040E1B] text-sm">{editFormData.region || companyData.region || 'N/A'}</span>
                          )}
                        </div>
                        {/* Country */}
                        <div className="flex items-center self-stretch">
                          <span className="text-[#040E1B] text-[10px] w-[200px]">Country</span>
                          {isEditing ? (
                            <input
                              type="text"
                              value={editFormData.country || ''}
                              onChange={(e) => setEditFormData({...editFormData, country: e.target.value})}
                              className="px-2 py-1 border border-[#D4E1EA] rounded text-sm text-[#040E1B] flex-1"
                            />
                          ) : (
                            <span className="text-[#040E1B] text-sm">{editFormData.country || companyData.country || 'Ghana'}</span>
                          )}
                        </div>
                        {/* P.O Box */}
                        <div className="flex items-center self-stretch">
                          <span className="text-[#040E1B] text-[10px] w-[200px]">P.O Box</span>
                          {isEditing ? (
                            <input
                              type="text"
                              value={editFormData.poBox || ''}
                              onChange={(e) => setEditFormData({...editFormData, poBox: e.target.value})}
                              className="px-2 py-1 border border-[#D4E1EA] rounded text-sm text-[#040E1B] flex-1"
                            />
                          ) : (
                            <span className="text-[#040E1B] text-sm">{editFormData.poBox || companyData.postal_code || 'N/A'}</span>
                          )}
                        </div>
                        {/* Phone */}
                        <div className="flex items-center self-stretch">
                          <span className="text-[#040E1B] text-[10px] w-[200px]">Phone</span>
                          {isEditing ? (
                            <input
                              type="text"
                              value={editFormData.phone || ''}
                              onChange={(e) => setEditFormData({...editFormData, phone: e.target.value})}
                              className="px-2 py-1 border border-[#D4E1EA] rounded text-sm text-[#040E1B] flex-1"
                            />
                          ) : (
                            <span className="text-[#040E1B] text-sm">{editFormData.phone || companyData.phone || companyData.phone_number || companyData.customer_service_phone || 'N/A'}</span>
                          )}
                        </div>
                        {/* Email */}
                        <div className="flex items-center self-stretch">
                          <span className="text-[#040E1B] text-[10px] w-[200px]">Email</span>
                          {isEditing ? (
                            <input
                              type="email"
                              value={editFormData.email || ''}
                              onChange={(e) => setEditFormData({...editFormData, email: e.target.value})}
                              className="px-2 py-1 border border-[#D4E1EA] rounded text-sm text-[#040E1B] flex-1"
                            />
                          ) : (
                            <span className="text-[#040E1B] text-sm">{editFormData.email || companyData.email || companyData.customer_service_email || 'N/A'}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Financial Data */}
                    <div className="flex flex-col items-start self-stretch gap-1">
                      <span className="text-[#525866] text-xs">Financial Data</span>
                      <div className="flex flex-col self-stretch gap-2">
                        {/* Authorized capital */}
                        <div className="flex items-center self-stretch">
                          <span className="text-[#040E1B] text-[10px] w-[200px]">Authorized capital</span>
                          {isEditing ? (
                            <input
                              type="text"
                              value={editFormData.authorizedCapital || ''}
                              onChange={(e) => setEditFormData({...editFormData, authorizedCapital: e.target.value})}
                              className="px-2 py-1 border border-[#D4E1EA] rounded text-sm text-[#040E1B] flex-1"
                            />
                          ) : (
                            <span className="text-[#040E1B] text-sm">{editFormData.authorizedCapital || formatCurrency(companyData.authorized_capital || companyData.stated_capital) || 'N/A'}</span>
                          )}
                          </div>
                        {/* Total shares */}
                        <div className="flex items-center self-stretch">
                          <span className="text-[#040E1B] text-[10px] w-[200px]">Total shares</span>
                          {isEditing ? (
                            <input
                              type="text"
                              value={editFormData.totalShares || ''}
                              onChange={(e) => setEditFormData({...editFormData, totalShares: e.target.value})}
                              className="px-2 py-1 border border-[#D4E1EA] rounded text-sm text-[#040E1B] flex-1"
                            />
                          ) : (
                            <span className="text-[#040E1B] text-sm">{editFormData.totalShares || (companyData.authorized_shares ? companyData.authorized_shares.toLocaleString() : 'N/A')}</span>
                          )}
                        </div>
                        {/* Total assets */}
                        <div className="flex items-center self-stretch">
                          <span className="text-[#040E1B] text-[10px] w-[200px]">Total assets</span>
                          {isEditing ? (
                            <input
                              type="text"
                              value={editFormData.totalAssets || ''}
                              onChange={(e) => setEditFormData({...editFormData, totalAssets: e.target.value})}
                              className="px-2 py-1 border border-[#D4E1EA] rounded text-sm text-[#040E1B] flex-1"
                            />
                          ) : (
                            <span className="text-[#040E1B] text-sm">{editFormData.totalAssets || formatCurrency(companyData.total_assets) || 'N/A'}</span>
                          )}
                        </div>
                        {/* Annual turnover */}
                        <div className="flex items-center self-stretch">
                          <span className="text-[#040E1B] text-[10px] w-[200px]">Annual turnover</span>
                          {isEditing ? (
                            <input
                              type="text"
                              value={editFormData.annualTurnover || ''}
                              onChange={(e) => setEditFormData({...editFormData, annualTurnover: e.target.value})}
                              className="px-2 py-1 border border-[#D4E1EA] rounded text-sm text-[#040E1B] flex-1"
                            />
                          ) : (
                            <span className="text-[#040E1B] text-sm">{editFormData.annualTurnover || formatCurrency(companyData.annual_turnover || companyData.annual_revenue) || 'N/A'}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Auditors */}
                    <div className="flex flex-col items-start self-stretch gap-1">
                      <span className="text-[#525866] text-xs">Auditors</span>
                      <div className="flex flex-col self-stretch gap-2">
                        {companyData.auditor && typeof companyData.auditor === 'object' ? (
                          <>
                            <div className="flex items-center self-stretch">
                              <span className="text-[#040E1B] text-[10px] w-[200px]">Auditing firm</span>
                              {isEditing ? (
                                <input
                                  type="text"
                                  value={editFormData.auditingFirm || ''}
                                  onChange={(e) => setEditFormData({...editFormData, auditingFirm: e.target.value})}
                                  className="px-2 py-1 border border-[#D4E1EA] rounded text-sm text-[#040E1B] flex-1"
                                />
                              ) : (
                                <span className="text-[#040E1B] text-sm">{editFormData.auditingFirm || companyData.auditor.firm_name || companyData.auditor.name || 'N/A'}</span>
                              )}
                            </div>
                            <div className="flex items-center self-stretch">
                              <span className="text-[#040E1B] text-[10px] w-[200px]">Appointment date</span>
                              {isEditing ? (
                                <input
                                  type="date"
                                  value={editFormData.appointmentDate || ''}
                                  onChange={(e) => setEditFormData({...editFormData, appointmentDate: e.target.value})}
                                  className="px-2 py-1 border border-[#D4E1EA] rounded text-sm text-[#040E1B] flex-1"
                                />
                              ) : (
                                <span className="text-[#040E1B] text-sm">{editFormData.appointmentDate || formatDate(companyData.auditor.start_date) || 'N/A'}</span>
                              )}
                            </div>
                            <div className="flex items-center self-stretch">
                              <span className="text-[#040E1B] text-[10px] w-[200px]">Contact</span>
                              {isEditing ? (
                                <input
                                  type="text"
                                  value={editFormData.auditorContact || ''}
                                  onChange={(e) => setEditFormData({...editFormData, auditorContact: e.target.value})}
                                  className="px-2 py-1 border border-[#D4E1EA] rounded text-sm text-[#040E1B] flex-1"
                                />
                              ) : (
                                <span className="text-[#040E1B] text-sm">{editFormData.auditorContact || companyData.auditor.phone || 'N/A'}</span>
                              )}
                            </div>
                          </>
                        ) : companyData.auditor && typeof companyData.auditor === 'string' ? (
                          <div className="flex items-center self-stretch">
                            <span className="text-[#040E1B] text-[10px] w-[200px]">Auditing firm</span>
                            {isEditing ? (
                              <input
                                type="text"
                                value={editFormData.auditingFirm || ''}
                                onChange={(e) => setEditFormData({...editFormData, auditingFirm: e.target.value})}
                                className="px-2 py-1 border border-[#D4E1EA] rounded text-sm text-[#040E1B] flex-1"
                              />
                            ) : (
                              <span className="text-[#040E1B] text-sm">{editFormData.auditingFirm || companyData.auditor || 'N/A'}</span>
                            )}
                          </div>
                        ) : (
                          <div className="flex items-center self-stretch">
                            <span className="text-[#040E1B] text-[10px] w-[200px]">Auditing firm</span>
                            {isEditing ? (
                              <input
                                type="text"
                                value={editFormData.auditingFirm || ''}
                                onChange={(e) => setEditFormData({...editFormData, auditingFirm: e.target.value})}
                                className="px-2 py-1 border border-[#D4E1EA] rounded text-sm text-[#040E1B] flex-1"
                              />
                            ) : (
                              <span className="text-[#040E1B] text-sm">{editFormData.auditingFirm || 'N/A'}</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Profile */}
                    <div className="flex flex-col items-start self-stretch gap-1">
                      <span className="text-[#525866] text-xs">Profile</span>
                      <div className="flex flex-col self-stretch gap-2">
                        <div className="flex items-center self-stretch">
                          <span className="text-[#040E1B] text-[10px] w-[200px]">Status</span>
                          <span className={`text-sm ${companyData.is_active ? 'text-emerald-500' : 'text-red-500'}`}>
                            {companyData.status || (companyData.is_active ? 'Active' : 'Inactive')}
                          </span>
                        </div>
                        <div className="flex items-center self-stretch">
                          <span className="text-[#040E1B] text-[10px] w-[200px]">Last updated</span>
                          <span className="text-[#040E1B] text-sm">{formatDate(companyData.updated_at)}</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Beneficial Ownership Details Table */}
                    {beneficialOwners.length > 0 && (
                      <div className="flex flex-col items-start self-stretch gap-1">
                        <span className="text-[#525866] text-xs">Beneficial Ownership details</span>
                        <div className="flex flex-col w-full self-stretch gap-1 rounded-[14px] border border-solid border-[#E5E8EC]">
                          {/* Table Header */}
                          <div className="flex items-start w-full self-stretch bg-[#F4F6F9] py-4 gap-3">
                            <div className="flex flex-col items-start flex-1 min-w-0 p-2">
                              <span className="text-[#070810] text-sm font-bold">Beneficial Owner,s name</span>
                            </div>
                            <div className="flex flex-col items-start flex-1 min-w-0 py-2 pl-2">
                              <span className="text-[#070810] text-sm font-bold">Position held</span>
                            </div>
                            <div className="flex flex-col items-start flex-1 min-w-0 py-2 pl-2">
                              <span className="text-[#070810] text-sm font-bold">TIN</span>
                            </div>
                            <div className="flex flex-col items-start flex-1 min-w-0 py-2 pl-2">
                              <span className="text-[#070810] text-sm font-bold">Ownership percent</span>
                            </div>
                            <div className="flex flex-col items-start flex-1 min-w-0 py-2 pl-2">
                              <span className="text-[#070810] text-sm font-bold">Acquisition date</span>
                            </div>
                            <div className="flex flex-col items-start flex-1 min-w-0 py-2 pl-2">
                              <span className="text-[#070810] text-sm font-bold">Risk level</span>
                            </div>
                          </div>
                          {/* Table Rows */}
                          {beneficialOwners.map((owner, idx) => (
                            <div key={idx} className="flex items-start w-full self-stretch py-3 gap-3">
                              <div className="flex flex-col items-start flex-1 min-w-0 py-[13px] pl-2">
                                <span className="text-[#070810] text-sm truncate">{owner.name}</span>
                              </div>
                              <div className="flex flex-col items-start flex-1 min-w-0 py-[13px] pl-2">
                                <span className="text-[#070810] text-sm truncate">{owner.position}</span>
                              </div>
                              <div className="flex flex-col items-start flex-1 min-w-0 py-[13px] pl-2">
                                <span className="text-blue-500 text-sm truncate">{owner.tin}</span>
                              </div>
                              <div className="flex flex-col items-start flex-1 min-w-0 py-[13px] pl-2">
                                <span className="text-[#070810] text-sm truncate">{owner.ownership}</span>
                              </div>
                              <div className="flex flex-col items-start flex-1 min-w-0 py-[13px] pl-2">
                                <span className="text-[#070810] text-sm truncate">{owner.acquisitionDate}</span>
                              </div>
                              <div className="flex flex-col flex-1 min-w-0 py-[11px] px-2">
                                <button className="flex flex-col items-center self-stretch bg-[#30AB401A] text-left py-1 rounded-lg border-0">
                                  <span className="text-emerald-500 text-xs">{owner.riskLevel}</span>
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {/* Registration Documents Table - Only show if not in personal tab or if needed */}
            {activeTab !== 'personal' && (
              <div className="flex flex-col items-start self-stretch gap-1">
                <div className="flex flex-col items-start self-stretch gap-1">
                  <span className="text-[#525866] text-xs">Registration documents</span>
                  <div className="flex flex-col self-stretch gap-1 rounded-[14px] border border-solid border-[#E5E8EC]">
                    {/* Table Header */}
                    <div className="flex items-start self-stretch bg-[#F4F6F9] py-4 gap-3">
                      <div className="flex flex-col items-start w-[250px] py-2 pl-2">
                        <span className="text-[#070810] text-sm font-bold">File</span>
                      </div>
                      <div className="flex flex-col items-start w-[250px] py-2 pl-2">
                        <span className="text-[#070810] text-sm font-bold">Document type</span>
                      </div>
                      <div className="flex flex-col items-start w-[250px] py-2 pl-2">
                        <span className="text-[#070810] text-sm font-bold">Document date</span>
                      </div>
                    </div>
                    {/* Table Rows */}
                    {registrationDocuments.map((doc, idx) => (
                      <div key={idx} className="flex items-start self-stretch py-3 gap-3">
                        <div className="flex flex-col items-start w-[250px] py-[13px] pl-2">
                          <span className="text-blue-500 text-sm">{doc.file}</span>
                        </div>
                        <div className="flex flex-col items-start w-[250px] py-[13px] pl-2">
                          <span className="text-[#070810] text-sm">{doc.type}</span>
                        </div>
                        <div className="flex flex-col items-start w-[250px] py-[13px] pl-2">
                          <span className="text-[#070810] text-sm">{doc.date}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Directors Tab */}
            {activeTab === 'directors' && (
              <div className="flex flex-col items-center self-stretch gap-4">
                {/* Past/Present Toggle */}
                <div className="flex items-center bg-white py-1 px-2 gap-[50px] rounded-lg border border-solid border-[#D4E1EA]">
                  <button
                    onClick={() => setDirectorsPeriod('past')}
                    className={`flex flex-col items-start w-40 py-[9px] px-[65px] rounded ${
                      directorsPeriod === 'past' ? 'bg-[#022658]' : 'bg-transparent'
                    }`}
                  >
                    <span className={`text-base ${directorsPeriod === 'past' ? 'text-white font-bold' : 'text-[#040E1B]'}`}>
                      Past
                    </span>
                  </button>
                  <button
                    onClick={() => setDirectorsPeriod('present')}
                    className={`flex flex-col items-start w-40 py-[7px] px-[53px] rounded ${
                      directorsPeriod === 'present' ? 'bg-[#022658]' : 'bg-transparent'
                    }`}
                  >
                    <span className={`text-base ${directorsPeriod === 'present' ? 'text-white font-bold' : 'text-[#040E1B]'}`}>
                      Present
                    </span>
                  </button>
                </div>

                {/* Search and Filter */}
                <div className="flex flex-col self-stretch gap-4">
                  <div className="flex justify-between items-start self-stretch">
                    <div className="flex items-center bg-[#F7F8FA] w-[284px] px-2 rounded-[5px] border border-solid border-[#F7F8FA]">
                      <img src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Iq8V0MifpP/fvxt594j_expires_30_days.png" className="w-[11px] h-[11px] mr-1.5 object-fill" />
                      <input
                        type="text"
                        placeholder="Search Person"
                        value={searchDirectorQuery}
                        onChange={(e) => setSearchDirectorQuery(e.target.value)}
                        className="flex-1 text-[#868C98] bg-transparent text-[10px] py-2 mr-1 border-0 outline-none"
                      />
                    </div>
                    <div className="flex items-start w-[125px] gap-[7px]">
                      <div className="flex items-center w-[61px] py-[7px] px-[9px] gap-1.5 rounded border border-solid border-[#D4E1EA] cursor-pointer hover:bg-gray-50">
                        <img src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Iq8V0MifpP/hz2mi201_expires_30_days.png" className="w-[11px] h-[11px] rounded object-fill" />
                        <span className="text-[#525866] text-xs">Filter</span>
                      </div>
                      <div className="flex items-center w-[57px] py-[7px] px-[9px] gap-[5px] rounded border border-solid border-[#D4E1EA] cursor-pointer hover:bg-gray-50">
                        <img src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Iq8V0MifpP/f36w5u34_expires_30_days.png" className="w-[11px] h-[11px] rounded object-fill" />
                        <span className="text-[#525866] text-xs">Sort</span>
                      </div>
                    </div>
                  </div>

                  {/* Directors Table */}
                  <div className="flex flex-col w-full self-stretch gap-1 rounded-[14px] border border-solid border-[#E5E8EC]">
                    <div className="flex items-start w-full self-stretch bg-[#F4F6F9] py-4">
                      <div className="flex flex-col items-start flex-1 min-w-0 py-[7px] pl-2">
                        <span className="text-[#070810] text-sm font-bold">Name</span>
                      </div>
                      <div className="flex flex-col items-start flex-1 min-w-0 py-[7px] pl-2">
                        <span className="text-[#070810] text-sm font-bold">Contact</span>
                      </div>
                      <div className="flex flex-col items-start flex-1 min-w-0 py-[7px] pl-2">
                        <span className="text-[#070810] text-sm font-bold">D-O-B</span>
                      </div>
                      <div className="flex flex-col items-start flex-1 min-w-0 py-[7px] pl-2">
                        <span className="text-[#070810] text-sm font-bold">Birth place</span>
                      </div>
                      <div className="flex flex-col items-start flex-1 min-w-0 py-[7px] pl-2">
                        <span className="text-[#070810] text-sm font-bold">Appointment date</span>
                      </div>
                      <div className="flex flex-col items-start flex-1 min-w-0 py-[7px] pl-2">
                        <span className="text-[#070810] text-sm font-bold">Cases</span>
                      </div>
                      <div className="flex flex-col items-start flex-1 min-w-0 py-[7px] pl-2">
                        <span className="text-[#070810] text-sm font-bold">Risk score</span>
                      </div>
                      <div className="flex flex-col items-start w-[100px] min-w-[100px] py-[7px] pl-2">
                        <span className="text-[#070810] text-sm font-bold">Actions</span>
                      </div>
                    </div>
                    {(directorsPeriod === 'present' ? presentDirectors : pastDirectors)
                      .filter(director => {
                        if (!searchDirectorQuery) return true;
                        const query = searchDirectorQuery.toLowerCase();
                        return (
                          director.name?.toLowerCase().includes(query) ||
                          director.contact?.toLowerCase().includes(query) ||
                          director.birthPlace?.toLowerCase().includes(query)
                        );
                      })
                      .map((director, idx) => (
                        <div key={idx} className="flex items-center w-full self-stretch py-3">
                          <div className="flex flex-col items-start flex-1 min-w-0 py-[7px] pl-2">
                            <span className="text-[#070810] text-sm truncate">{director.name}</span>
                          </div>
                          <div className="flex flex-col items-start flex-1 min-w-0 py-[7px] pl-2">
                            <span className="text-[#070810] text-sm truncate">{director.contact}</span>
                          </div>
                          <div className="flex flex-col items-start flex-1 min-w-0 py-[7px] pl-2">
                            <span className="text-[#070810] text-sm truncate">{director.dob}</span>
                          </div>
                          <div className="flex flex-col items-start flex-1 min-w-0 py-[7px] pl-2">
                            <span className="text-[#070810] text-sm truncate">{director.birthPlace}</span>
                          </div>
                          <div className="flex flex-col items-start flex-1 min-w-0 py-[7px] pl-2">
                            <span className="text-[#070810] text-sm truncate">{director.appointmentDate}</span>
                          </div>
                          <div className="flex flex-col items-start flex-1 min-w-0 py-[7px] pl-2">
                            <span className="text-[#070810] text-sm truncate">{director.cases}</span>
                          </div>
                          <div className="flex flex-col flex-1 min-w-0 p-2">
                            <button className="flex flex-col items-center self-stretch bg-[#30AB401A] text-left py-[3px] rounded-lg border-0">
                              <span className="text-emerald-500 text-xs">{director.riskScore}</span>
                            </button>
                          </div>
                          <div className="flex flex-col items-start w-[100px] min-w-[100px] py-[7px] pl-2 gap-2">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleEditDirector(director, idx)}
                                className="p-1.5 rounded hover:bg-gray-100 transition-colors"
                                title="Edit director"
                              >
                                <Edit className="w-4 h-4 text-[#022658]" />
                              </button>
                              <button
                                onClick={() => handleDeleteDirector(director, idx)}
                                className="p-1.5 rounded hover:bg-red-50 transition-colors"
                                title="Delete director"
                              >
                                <Trash2 className="w-4 h-4 text-red-600" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    {(() => {
                      const filteredDirectors = (directorsPeriod === 'present' ? presentDirectors : pastDirectors)
                        .filter(director => {
                          if (!searchDirectorQuery) return true;
                          const query = searchDirectorQuery.toLowerCase();
                          return (
                            director.name?.toLowerCase().includes(query) ||
                            director.contact?.toLowerCase().includes(query) ||
                            director.birthPlace?.toLowerCase().includes(query)
                          );
                        });
                      
                      console.log('[CompanyDetails] Directors table render:', {
                        period: directorsPeriod,
                        presentDirectorsCount: presentDirectors.length,
                        pastDirectorsCount: pastDirectors.length,
                        filteredCount: filteredDirectors.length,
                        searchQuery: searchDirectorQuery
                      });
                      
                      if (filteredDirectors.length === 0) {
                        return (
                          <div className="flex items-center justify-center w-full py-8">
                            <span className="text-[#525866] text-sm">
                              {directorsPeriod === 'present' 
                                ? `No present directors found (${presentDirectors.length} total directors, ${pastDirectors.length} past)` 
                                : `No past directors found (${pastDirectors.length} total past directors, ${presentDirectors.length} present)`}
                            </span>
                          </div>
                        );
                      }
                      return null;
                    })()}

                    {/* Add Director Button */}
                    <div className="flex flex-col items-start self-stretch py-[25px] pl-2">
                      <span 
                        onClick={() => setShowDirectorDrawer(true)}
                        className="text-[#F59E0B] text-sm cursor-pointer hover:underline"
                      >
                        Add new director
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Secretaries Tab */}
            {activeTab === 'secretaries' && (
              <div className="flex flex-col items-center self-stretch gap-4">
                {/* Past/Present Toggle */}
                <div className="flex items-center bg-white py-1 px-2 gap-[50px] rounded-lg border border-solid border-[#D4E1EA]">
                  <button
                    onClick={() => setDirectorsPeriod('past')}
                    className={`flex flex-col items-start w-40 py-[9px] px-[65px] rounded ${
                      directorsPeriod === 'past' ? 'bg-[#022658]' : 'bg-transparent'
                    }`}
                  >
                    <span className={`text-base ${directorsPeriod === 'past' ? 'text-white font-bold' : 'text-[#040E1B]'}`}>
                      Past
                    </span>
                  </button>
                  <button
                    onClick={() => setDirectorsPeriod('present')}
                    className={`flex flex-col items-start w-40 py-[7px] px-[53px] rounded ${
                      directorsPeriod === 'present' ? 'bg-[#022658]' : 'bg-transparent'
                    }`}
                  >
                    <span className={`text-base ${directorsPeriod === 'present' ? 'text-white font-bold' : 'text-[#040E1B]'}`}>
                      Present
                    </span>
                  </button>
                </div>

                {/* Secretaries Table */}
                <div className="flex flex-col w-full self-stretch gap-1 rounded-[14px] border border-solid border-[#E5E8EC]">
                  <div className="flex items-start w-full self-stretch bg-[#F4F6F9] py-4">
                    <div className="flex flex-col items-start flex-1 min-w-0 py-2 pl-2">
                      <span className="text-[#070810] text-sm font-bold">Name</span>
                    </div>
                    <div className="flex flex-col items-start flex-1 min-w-0 py-2 pl-2">
                      <span className="text-[#070810] text-sm font-bold">Contact</span>
                    </div>
                    <div className="flex flex-col items-start flex-1 min-w-0 py-2 pl-2">
                      <span className="text-[#070810] text-sm font-bold">Appointment date</span>
                    </div>
                    <div className="flex flex-col items-start flex-1 min-w-0 py-2 pl-2">
                      <span className="text-[#070810] text-sm font-bold">TIN</span>
                    </div>
                    <div className="flex flex-col items-start flex-1 min-w-0 py-2 pl-2">
                      <span className="text-[#070810] text-sm font-bold">Incorporation date</span>
                    </div>
                    <div className="flex flex-col items-start flex-1 min-w-0 py-2 pl-2">
                      <span className="text-[#070810] text-sm font-bold">Risk score</span>
                    </div>
                    <div className="flex flex-col items-start w-[100px] min-w-[100px] py-2 pl-2">
                      <span className="text-[#070810] text-sm font-bold">Actions</span>
                    </div>
                  </div>
                  {(directorsPeriod === 'present' ? presentSecretaries : pastSecretaries).map((secretary, idx) => (
                    <div key={idx} className="flex items-center w-full self-stretch py-3">
                      <div className="flex flex-col items-start flex-1 min-w-0 py-[7px] px-2">
                        <span className="text-[#070810] text-sm truncate">{secretary.name}</span>
                      </div>
                      <div className="flex flex-col items-start flex-1 min-w-0 py-[7px] pl-2">
                        <span className="text-[#070810] text-sm truncate">{secretary.contact}</span>
                      </div>
                      <div className="flex flex-col items-start flex-1 min-w-0 py-[7px] pl-2">
                        <span className="text-[#070810] text-sm truncate">{secretary.appointmentDate}</span>
                      </div>
                      <div className="flex flex-col items-start flex-1 min-w-0 py-2 pl-2">
                        <span className="text-blue-500 text-sm truncate">{secretary.tin}</span>
                      </div>
                      <div className="flex flex-col items-start flex-1 min-w-0 py-[7px] pl-2">
                        <span className="text-[#070810] text-sm truncate">{secretary.incorporationDate}</span>
                      </div>
                      <div className="flex flex-col flex-1 min-w-0 p-2">
                        <button className="flex flex-col items-center self-stretch bg-[#30AB401A] text-left py-1 rounded-lg border-0">
                          <span className="text-emerald-500 text-xs">{secretary.riskScore}</span>
                        </button>
                      </div>
                      <div className="flex flex-col items-start w-[100px] min-w-[100px] py-[7px] pl-2 gap-2">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEditSecretary(secretary)}
                            className="p-1.5 rounded hover:bg-gray-100 transition-colors"
                            title="Edit secretary"
                          >
                            <Edit className="w-4 h-4 text-[#022658]" />
                          </button>
                          <button
                            onClick={() => handleDeleteSecretary(secretary)}
                            className="p-1.5 rounded hover:bg-red-50 transition-colors"
                            title="Delete secretary"
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {((directorsPeriod === 'present' ? presentSecretaries : pastSecretaries).length === 0) && (
                    <div className="flex items-center justify-center w-full py-8">
                      <span className="text-[#525866] text-sm">
                        {directorsPeriod === 'present' ? 'No present secretaries found' : 'No past secretaries found'}
                      </span>
                    </div>
                  )}

                  {/* Add Secretary Button */}
                  <div className="flex flex-col items-start self-stretch py-[25px] pl-2">
                    <span 
                      onClick={() => setShowSecretaryDrawer(true)}
                      className="text-[#F59E0B] text-sm cursor-pointer hover:underline"
                    >
                      Add new secretary
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Employees Tab */}
            {activeTab === 'employees' && (
              <div className="flex flex-col items-center self-stretch gap-4">
                {/* Past/Present Toggle */}
                <div className="flex items-center bg-white py-1 px-2 gap-[50px] rounded-lg border border-solid border-[#D4E1EA]">
                  <button
                    onClick={() => setDirectorsPeriod('past')}
                    className={`flex flex-col items-start w-40 py-[9px] px-[65px] rounded ${
                      directorsPeriod === 'past' ? 'bg-[#022658]' : 'bg-transparent'
                    }`}
                  >
                    <span className={`text-base ${directorsPeriod === 'past' ? 'text-white font-bold' : 'text-[#040E1B]'}`}>
                      Past
                    </span>
                  </button>
                  <button
                    onClick={() => setDirectorsPeriod('present')}
                    className={`flex flex-col items-start w-40 py-[7px] px-[53px] rounded ${
                      directorsPeriod === 'present' ? 'bg-[#022658]' : 'bg-transparent'
                    }`}
                  >
                    <span className={`text-base ${directorsPeriod === 'present' ? 'text-white font-bold' : 'text-[#040E1B]'}`}>
                      Present
                    </span>
                  </button>
                </div>

                {/* Search and Filter */}
                <div className="flex flex-col self-stretch gap-4">
                  <div className="flex justify-between items-start self-stretch">
                    <div className="flex items-center bg-[#F7F8FA] w-[284px] px-2 rounded-[5px] border border-solid border-[#F7F8FA]">
                      <img src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Iq8V0MifpP/g8sawwa0_expires_30_days.png" className="w-[11px] h-[11px] mr-1.5 object-fill" />
                      <input
                        type="text"
                        placeholder="Search Person"
                        value={searchDirectorQuery}
                        onChange={(e) => setSearchDirectorQuery(e.target.value)}
                        className="flex-1 text-[#868C98] bg-transparent text-[10px] py-2 mr-1 border-0 outline-none"
                      />
                    </div>
                    <div className="flex items-start w-[125px] gap-[7px]">
                      <div className="flex items-center w-[61px] py-[7px] px-[9px] gap-1.5 rounded border border-solid border-[#D4E1EA] cursor-pointer hover:bg-gray-50">
                        <img src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Iq8V0MifpP/9teulrt9_expires_30_days.png" className="w-[11px] h-[11px] rounded object-fill" />
                        <span className="text-[#525866] text-xs">Filter</span>
                      </div>
                      <div className="flex items-center w-[57px] py-[7px] px-[9px] gap-[5px] rounded border border-solid border-[#D4E1EA] cursor-pointer hover:bg-gray-50">
                        <img src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Iq8V0MifpP/w3dkshs8_expires_30_days.png" className="w-[11px] h-[11px] rounded object-fill" />
                        <span className="text-[#525866] text-xs">Sort</span>
                      </div>
                    </div>
                  </div>

                  {/* Employees Table */}
                  <div className="flex flex-col w-full self-stretch gap-1 rounded-[14px] border border-solid border-[#E5E8EC]">
                    <div className="flex items-center w-full self-stretch bg-[#F4F6F9] py-4">
                      <div className="flex flex-col items-start flex-1 min-w-0 py-[7px] pl-2">
                        <span className="text-[#070810] text-sm font-bold">Name</span>
                      </div>
                      <div className="flex flex-col items-start flex-1 min-w-0 py-[7px] pl-2">
                        <span className="text-[#070810] text-sm font-bold">Contact</span>
                      </div>
                      <div className="flex flex-col items-start flex-1 min-w-0 py-[7px] pl-2">
                        <span className="text-[#070810] text-sm font-bold">D-O-B</span>
                      </div>
                      <div className="flex flex-col items-start flex-1 min-w-0 py-[7px] pl-2">
                        <span className="text-[#070810] text-sm font-bold">Birth place</span>
                      </div>
                      <div className="flex flex-col items-start flex-1 min-w-0 py-[7px] pl-2">
                        <span className="text-[#070810] text-sm font-bold">Position</span>
                      </div>
                      <div className="flex flex-col items-start flex-1 min-w-0 py-[7px] pl-2">
                        <span className="text-[#070810] text-sm font-bold">Appointment date</span>
                      </div>
                      <div className="flex flex-col items-start flex-1 min-w-0 py-[7px] pl-2">
                        <span className="text-[#070810] text-sm font-bold">Cases</span>
                      </div>
                      <div className="flex flex-col items-start flex-1 min-w-0 py-[7px] pl-2">
                        <span className="text-[#070810] text-sm font-bold">Risk score</span>
                      </div>
                      <div className="flex flex-col items-start w-[100px] min-w-[100px] py-[7px] pl-2">
                        <span className="text-[#070810] text-sm font-bold">Actions</span>
                      </div>
                    </div>
                    {(directorsPeriod === 'present' ? presentEmployees : pastEmployees)
                      .filter(employee => {
                        if (!searchDirectorQuery) return true;
                        const query = searchDirectorQuery.toLowerCase();
                        return (
                          employee.name?.toLowerCase().includes(query) ||
                          employee.contact?.toLowerCase().includes(query) ||
                          employee.birthPlace?.toLowerCase().includes(query) ||
                          employee.position?.toLowerCase().includes(query)
                        );
                      })
                      .map((employee, idx) => (
                        <div key={idx} className="flex items-center w-full self-stretch py-3">
                          <div className="flex flex-col items-start flex-1 min-w-0 py-[7px] pl-2">
                            <span className="text-[#070810] text-sm truncate">{employee.name}</span>
                          </div>
                          <div className="flex flex-col items-start flex-1 min-w-0 py-[7px] pl-2">
                            <span className="text-[#070810] text-sm truncate">{employee.contact}</span>
                          </div>
                          <div className="flex flex-col items-start flex-1 min-w-0 py-[7px] pl-2">
                            <span className="text-[#070810] text-sm truncate">{employee.dob}</span>
                          </div>
                          <div className="flex flex-col items-start flex-1 min-w-0 py-[7px] pl-2">
                            <span className="text-[#070810] text-sm truncate">{employee.birthPlace}</span>
                          </div>
                          <div className="flex flex-col items-start flex-1 min-w-0 py-[7px] pl-2">
                            <span className="text-[#070810] text-sm truncate">{employee.position}</span>
                          </div>
                          <div className="flex flex-col items-start flex-1 min-w-0 py-[7px] pl-2">
                            <span className="text-[#070810] text-sm truncate">{employee.appointmentDate}</span>
                          </div>
                          <div className="flex flex-col items-start flex-1 min-w-0 py-[7px] pl-2">
                            <span className="text-[#070810] text-sm truncate">{employee.cases}</span>
                          </div>
                          <div className="flex flex-col flex-1 min-w-0 p-2">
                            <button className="flex flex-col items-center self-stretch bg-[#30AB401A] text-left py-[3px] rounded-lg border-0">
                              <span className="text-emerald-500 text-xs">{employee.riskScore}</span>
                            </button>
                          </div>
                          <div className="flex flex-col items-start w-[100px] min-w-[100px] py-[7px] pl-2 gap-2">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleEditEmployee(employee, idx)}
                                className="p-1.5 rounded hover:bg-gray-100 transition-colors"
                                title="Edit employee"
                              >
                                <Edit className="w-4 h-4 text-[#022658]" />
                              </button>
                              <button
                                onClick={() => handleDeleteEmployee(employee, idx)}
                                className="p-1.5 rounded hover:bg-red-50 transition-colors"
                                title="Delete employee"
                              >
                                <Trash2 className="w-4 h-4 text-red-600" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    {((directorsPeriod === 'present' ? presentEmployees : pastEmployees)
                      .filter(employee => {
                        if (!searchDirectorQuery) return true;
                        const query = searchDirectorQuery.toLowerCase();
                        return (
                          employee.name?.toLowerCase().includes(query) ||
                          employee.contact?.toLowerCase().includes(query) ||
                          employee.birthPlace?.toLowerCase().includes(query) ||
                          employee.position?.toLowerCase().includes(query)
                        );
                      }).length === 0) && (
                      <div className="flex items-center justify-center w-full py-8">
                        <span className="text-[#525866] text-sm">
                          {directorsPeriod === 'present' ? 'No present employees found' : 'No past employees found'}
                        </span>
                      </div>
                    )}

                    {/* Add Employee Button */}
                    <div className="flex flex-col items-start self-stretch py-[25px] pl-2">
                      <span 
                        onClick={() => setShowEmployeeDrawer(true)}
                        className="text-[#F59E0B] text-sm cursor-pointer hover:underline"
                      >
                        Add new employee
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Regulatory & Compliance Tab */}
            {activeTab === 'regulatory' && (
              <div className="flex flex-col self-stretch bg-white py-4 gap-4 rounded-3xl">
                {/* Search and Filter */}
                <div className="flex justify-between items-start self-stretch">
                  <div className="flex items-center bg-[#F7F8FA] w-[284px] px-2 rounded-[5px] border border-solid border-[#F7F8FA]">
                    <img src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Iq8V0MifpP/u31a47bh_expires_30_days.png" className="w-[11px] h-[11px] mr-1.5 object-fill" />
                    <input
                      type="text"
                      placeholder="Search here"
                      value={searchDirectorQuery}
                      onChange={(e) => setSearchDirectorQuery(e.target.value)}
                      className="flex-1 text-[#868C98] bg-transparent text-[10px] py-2 mr-1 border-0 outline-none"
                    />
                  </div>
                  <div className="flex items-start w-[125px] gap-[7px]">
                    <div className="flex items-center w-[61px] py-[7px] px-[9px] gap-1.5 rounded border border-solid border-[#D4E1EA] cursor-pointer hover:bg-gray-50">
                      <img src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Iq8V0MifpP/gbma5gb1_expires_30_days.png" className="w-[11px] h-[11px] rounded object-fill" />
                      <span className="text-[#525866] text-xs">Filter</span>
                    </div>
                    <div className="flex items-center w-[57px] py-[7px] px-[9px] gap-[5px] rounded border border-solid border-[#D4E1EA] cursor-pointer hover:bg-gray-50">
                      <img src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Iq8V0MifpP/69xnicyv_expires_30_days.png" className="w-[11px] h-[11px] rounded object-fill" />
                      <span className="text-[#525866] text-xs">Sort</span>
                    </div>
                  </div>
                </div>

                {/* Regulatory Table */}
                <div className="flex flex-col w-full self-stretch gap-1 rounded-[14px] border border-solid border-[#E5E8EC]">
                  {/* Table Header */}
                  <div className="flex items-start w-full self-stretch bg-[#F4F6F9] py-4">
                    <div className="flex flex-col items-start flex-1 min-w-0 py-[7px] pl-2">
                      <span className="text-[#070810] text-sm font-bold">Regulatory body</span>
                    </div>
                    <div className="flex flex-col items-start flex-1 min-w-0 py-[7px] px-2">
                      <span className="text-[#070810] text-sm font-bold">License/Permit numbers</span>
                    </div>
                    <div className="flex flex-col items-start flex-1 min-w-0 py-[7px] pl-2">
                      <span className="text-[#070810] text-sm font-bold">License status</span>
                    </div>
                    <div className="flex flex-col items-start flex-1 min-w-0 py-[7px] pl-2">
                      <span className="text-[#070810] text-sm font-bold">Compliance violations</span>
                    </div>
                    <div className="flex flex-col items-start flex-1 min-w-0 py-[7px] pl-2">
                      <span className="text-[#070810] text-sm font-bold">Regulatory actions</span>
                    </div>
                    <div className="flex flex-col items-start flex-1 min-w-0 py-[7px] pl-2">
                      <span className="text-[#070810] text-sm font-bold">Date</span>
                    </div>
                    <div className="flex flex-col items-start w-[100px] min-w-[100px] py-[7px] pl-2">
                      <span className="text-[#070810] text-sm font-bold">Actions</span>
                    </div>
                  </div>

                  {/* Table Rows */}
                  {loadingRegulatory ? (
                    <div className="flex items-center justify-center w-full py-8">
                      <span className="text-[#525866] text-sm">Loading regulatory data...</span>
                    </div>
                  ) : regulatoryList.length === 0 ? (
                    <div className="flex items-center justify-center w-full py-8">
                      <span className="text-[#525866] text-sm">No regulatory records found</span>
                    </div>
                  ) : (
                    regulatoryList
                      .filter(item => {
                        if (!searchDirectorQuery) return true;
                        const query = searchDirectorQuery.toLowerCase();
                        return (
                          item.body?.toLowerCase().includes(query) ||
                          item.licenseNumber?.toLowerCase().includes(query) ||
                          item.status?.toLowerCase().includes(query) ||
                          item.violations?.toLowerCase().includes(query) ||
                          item.actions?.toLowerCase().includes(query)
                        );
                      })
                      .map((item, idx) => (
                    <div key={item.id || idx} className="flex items-start w-full self-stretch py-3">
                      <div className="flex flex-col items-start flex-1 min-w-0 py-[13px] px-2">
                        <span className="text-[#070810] text-sm truncate">{item.body || item.regulatory_body || 'N/A'}</span>
                      </div>
                      <div className="flex flex-col items-start flex-1 min-w-0 py-[13px] pl-2">
                        <span className="text-[#070810] text-sm truncate">{item.licenseNumber || item.license_permit_number || 'N/A'}</span>
                      </div>
                      <div className="flex flex-col items-start flex-1 min-w-0 py-[13px] pl-2">
                        <span className="text-[#070810] text-sm truncate">{item.status || 'N/A'}</span>
                      </div>
                      <div className="flex flex-col items-start flex-1 min-w-0 py-[13px] pl-2">
                        <span className="text-[#070810] text-sm truncate">{item.violations || item.compliance_violations || 'N/A'}</span>
                      </div>
                      <div className="flex flex-col items-start flex-1 min-w-0 py-[13px] pl-2">
                        <span className="text-[#070810] text-sm truncate">{item.actions || item.regulatory_actions || 'N/A'}</span>
                      </div>
                      <div className="flex flex-col items-start flex-1 min-w-0 py-[13px] pl-2">
                        <span className="text-[#070810] text-sm truncate">{item.date || (item.issue_date ? formatDate(item.issue_date) : 'N/A')}</span>
                      </div>
                      <div className="flex flex-col items-start w-[100px] min-w-[100px] py-[13px] pl-2 gap-2">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEditRegulatory(item, idx)}
                            className="p-1.5 rounded hover:bg-gray-100 transition-colors"
                            title="Edit regulatory record"
                          >
                            <Edit className="w-4 h-4 text-[#022658]" />
                          </button>
                          <button
                            onClick={() => handleDeleteRegulatory(item, idx)}
                            className="p-1.5 rounded hover:bg-red-50 transition-colors"
                            title="Delete regulatory record"
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </button>
                        </div>
                      </div>
                    </div>
                      ))
                  )}

                  {/* Upload New Link */}
                  <div className="flex flex-col items-start self-stretch py-[25px] pl-2">
                    <span 
                      onClick={() => setShowRegulatoryDrawer(true)}
                      className="text-[#F59E0B] text-sm cursor-pointer hover:underline"
                    >
                      Upload new
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Case List Tab */}
            {activeTab === 'cases' && (
              <div className="flex flex-col self-stretch bg-white p-6 gap-8 rounded-lg border border-solid border-[#E4E7EB]" style={{ boxShadow: '4px 4px 4px #0708101A' }}>
                {/* Header with Add Button - Always visible */}
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-[#040E1B]">Case List</h3>
                  <button
                    onClick={() => {
                      setEditingCaseIndex(null);
                      setEditingCaseData(null);
                      setShowCaseDrawer(true);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-[#022658] text-white rounded-lg hover:bg-[#033a7a] transition-colors"
                  >
                    <span>Add New Case</span>
                  </button>
                </div>

                {casesLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#022658]"></div>
                    <span className="ml-3 text-[#525866] text-sm">Loading cases...</span>
                  </div>
                ) : casesError ? (
                  <div className="flex items-center justify-center py-8">
                    <span className="text-red-500 text-sm">{casesError}</span>
                  </div>
                ) : filteredCases.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 gap-4">
                    <span className="text-[#525866] text-sm">
                      {casesPeriod === 'active' ? 'No active cases found for this company' : 'No closed cases found for this company'}
                    </span>
                    {/* Add Case Button - Always visible even when no cases */}
                    <div className="flex flex-col items-start self-stretch py-[25px] pl-2">
                      <span 
                        onClick={() => {
                          setEditingCaseIndex(null);
                          setEditingCaseData(null);
                          setShowCaseDrawer(true);
                        }}
                        className="text-[#F59E0B] text-sm cursor-pointer hover:underline"
                      >
                        Add new case
                    </span>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Cases Summary */}
                    <div className="flex items-center justify-between">
                      <span className="text-[#040E1B] text-sm font-bold">
                        Total {casesPeriod === 'active' ? 'Active' : 'Closed'} Cases: {filteredCases.length}
                      </span>
                      
                      {/* Active/Closed Toggle */}
                      <div className="flex items-center bg-white py-1 px-2 gap-6 rounded-lg border border-solid border-[#D4E1EA]">
                        <button
                          onClick={() => setCasesPeriod('active')}
                          className={`flex flex-col items-start w-40 rounded ${
                            casesPeriod === 'active' ? 'bg-[#022658] py-[7px] px-[57px]' : 'bg-transparent py-[9px] px-[55px]'
                          }`}
                        >
                          <span className={`text-base ${casesPeriod === 'active' ? 'text-white font-bold' : 'text-[#040E1B]'}`}>
                            Active
                          </span>
                        </button>
                        <button
                          onClick={() => setCasesPeriod('closed')}
                          className={`flex flex-col items-start w-40 rounded ${
                            casesPeriod === 'closed' ? 'bg-[#022658] py-[7px] px-[54px]' : 'bg-transparent py-[9px] px-[55px]'
                          }`}
                        >
                          <span className={`text-base ${casesPeriod === 'closed' ? 'text-white font-bold' : 'text-[#040E1B]'}`}>
                            Closed
                          </span>
                        </button>
                      </div>
                    </div>

                    {/* Search and Filter */}
                    <div className="flex justify-between items-start self-stretch">
                    <div className="w-[490px] pb-0.5">
                      <div className="flex items-center self-stretch bg-[#F7F8FA] py-[7px] px-2 gap-1.5 rounded-[5px] border border-solid border-[#F7F8FA]">
                        <img
                          src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Iq8V0MifpP/y0mbgfrp_expires_30_days.png"
                          className="w-[11px] h-[11px] object-fill"
                        />
                        <input
                          type="text"
                          placeholder="Search here"
                          value={searchCaseQuery}
                          onChange={(e) => setSearchCaseQuery(e.target.value)}
                          className="flex-1 text-[#868C98] bg-transparent text-[10px] border-0 outline-none"
                        />
                      </div>
                    </div>
                    <div className="flex items-start w-[125px] gap-[7px]">
                      <div className="flex items-center w-[61px] py-[7px] px-[9px] gap-1.5 rounded border border-solid border-[#D4E1EA] cursor-pointer hover:bg-gray-50">
                        <img
                          src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Iq8V0MifpP/fge63447_expires_30_days.png"
                          className="w-[11px] h-[11px] rounded object-fill"
                        />
                        <span className="text-[#525866] text-xs">Filter</span>
                      </div>
                      <div className="flex items-center w-[57px] py-[7px] px-[9px] gap-[5px] rounded border border-solid border-[#D4E1EA] cursor-pointer hover:bg-gray-50">
                        <img
                          src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Iq8V0MifpP/dirrnxg4_expires_30_days.png"
                          className="w-[11px] h-[11px] rounded object-fill"
                        />
                        <span className="text-[#525866] text-xs">Sort</span>
                      </div>
                    </div>
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
                        <div className="flex flex-col items-start w-[100px] min-w-[100px] py-2 pl-2">
                          <span className="text-[#070810] text-sm font-bold">Actions</span>
                        </div>
                      </div>

                      {/* Table Rows */}
                      {filteredCases.map((caseItem, index) => {
                        const role = getCompanyRole(caseItem);
                        // Use outcome from case_metadata, fallback to resolution_status, then status
                        const outcome = caseItem.outcome || (caseItem.case_metadata?.outcome) || caseItem.resolution_status || caseItem.status || caseItem.ai_case_outcome || 'Unknown';
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
                                      console.log('[CompanyDetails] Fetched case details:', fullCaseData);
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
                              <div className="flex flex-col items-start w-[100px] min-w-[100px] py-[11px] pl-2 gap-2">
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => handleEditCase(caseItem, index)}
                                    className="p-1.5 rounded hover:bg-gray-100 transition-colors"
                                    title="Edit case link"
                                  >
                                    <Edit className="w-4 h-4 text-[#022658]" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteCase(caseItem, index)}
                                    className="p-1.5 rounded hover:bg-red-50 transition-colors"
                                    title="Delete case link"
                                  >
                                    <Trash2 className="w-4 h-4 text-red-600" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                      
                      {/* Add Case Button */}
                      <div className="flex flex-col items-start self-stretch py-[25px] pl-2">
                        <span 
                          onClick={() => {
                            setEditingCaseIndex(null);
                            setEditingCaseData(null);
                            setShowCaseDrawer(true);
                          }}
                          className="text-[#F59E0B] text-sm cursor-pointer hover:underline"
                        >
                          Add new case
                        </span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Commercial Bulletin Tab */}
            {activeTab === 'bulletin' && (
              <div className="w-full self-stretch bg-white p-6 rounded-lg border border-solid border-[#E4E7EB]" style={{boxShadow: '4px 4px 4px #0708101A'}}>
                {/* Header with Add Button */}
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-[#040E1B]">Commercial Bulletin</h3>
                  <button
                    onClick={() => {
                      setEditingBulletinIndex(null);
                      setEditingBulletinData(null);
                      setShowBulletinDrawer(true);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-[#022658] text-white rounded-lg hover:bg-[#033a7a] transition-colors"
                  >
                    <span>Add New Bulletin</span>
                  </button>
                </div>

                <div className="flex flex-col w-full self-stretch gap-1 rounded-[14px] border border-solid border-[#E5E8EC]">
                  {/* Table Header */}
                  <div className="flex items-start w-full self-stretch bg-[#F4F6F9] py-4 gap-3">
                    <div className="flex flex-col items-start flex-1 min-w-0 py-2 pl-2">
                      <span className="text-[#070810] text-sm font-bold">Date of Signing</span>
                    </div>
                    <div className="flex flex-col items-start flex-1 min-w-0 py-2 pl-2">
                      <span className="text-[#070810] text-sm font-bold">Notice type</span>
                    </div>
                    <div className="flex flex-col items-start flex-[2] min-w-0 py-2 pl-2">
                      <span className="text-[#070810] text-sm font-bold">Description</span>
                    </div>
                    <div className="flex flex-col items-start flex-1 min-w-0 py-2 pl-2">
                      <span className="text-[#070810] text-sm font-bold">Bulletin no.</span>
                    </div>
                    <div className="flex flex-col items-start flex-1 min-w-0 py-2 pl-2">
                      <span className="text-[#070810] text-sm font-bold">Upload Date</span>
                    </div>
                    <div className="flex flex-col items-start w-[100px] min-w-[100px] py-2 pl-2">
                      <span className="text-[#070810] text-sm font-bold">Actions</span>
                    </div>
                  </div>

                  {/* Table Rows */}
                  {loadingBulletin ? (
                    <div className="flex items-center justify-center w-full py-8">
                      <span className="text-[#525866] text-sm">Loading bulletin data...</span>
                    </div>
                  ) : bulletinList.length === 0 ? (
                    <div className="flex flex-col items-center justify-center w-full py-8 gap-4">
                      <span className="text-[#525866] text-sm">No bulletin entries found</span>
                      <div className="flex flex-col items-start self-stretch py-[25px] pl-2">
                        <span 
                          onClick={() => {
                            setEditingBulletinIndex(null);
                            setEditingBulletinData(null);
                            setShowBulletinDrawer(true);
                          }}
                          className="text-[#F59E0B] text-sm cursor-pointer hover:underline"
                        >
                          Add new bulletin
                        </span>
                      </div>
                    </div>
                  ) : (
                    <>
                      {bulletinList.map((item, idx) => {
                        const formatDate = (dateString) => {
                          if (!dateString) return 'N/A';
                          try {
                            const date = new Date(dateString);
                            return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
                          } catch (e) {
                            return dateString;
                          }
                        };

                        const formatNoticeType = (type) => {
                          if (!type) return 'N/A';
                          return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                        };

                        return (
                          <div key={item.id || idx} className="flex justify-between items-center w-full self-stretch py-3 border-b border-[#E5E8EC]">
                      <div className="flex items-start flex-1 gap-3">
                        <div className="flex flex-col items-start flex-1 min-w-0 pl-2">
                                <span className="text-[#070810] text-sm">{formatDate(item.effective_date || item.publication_date)}</span>
                        </div>
                        <div className="flex flex-col items-start flex-1 min-w-0 pl-2">
                                <span className="text-[#070810] text-sm truncate">{formatNoticeType(item.gazette_type)}</span>
                        </div>
                        <div className="flex flex-col items-start flex-[2] min-w-0 pl-2">
                                <span className="text-[#070810] text-sm">{item.description || item.content || 'N/A'}</span>
                        </div>
                        <div className="flex flex-col items-start flex-1 min-w-0 py-[9px] pl-2">
                                <span className="text-[#070810] text-sm whitespace-pre-line">{item.gazette_number || 'N/A'}</span>
                        </div>
                        <div className="flex flex-col items-start flex-1 min-w-0 pl-2">
                                <span className="text-[#070810] text-sm">{formatDate(item.created_at || item.publication_date)}</span>
                        </div>
                      </div>
                            <div className="flex items-center w-[100px] min-w-[100px] mr-3 gap-2">
                              <button
                                onClick={() => handleEditBulletin(item, idx)}
                                className="p-1.5 rounded hover:bg-gray-100 transition-colors"
                                title="Edit bulletin entry"
                              >
                                <Edit className="w-4 h-4 text-[#022658]" />
                              </button>
                              <button
                                onClick={() => handleDeleteBulletin(item, idx)}
                                className="p-1.5 rounded hover:bg-red-50 transition-colors"
                                title="Delete bulletin entry"
                              >
                                <Trash2 className="w-4 h-4 text-red-600" />
                              </button>
                      </div>
                    </div>
                        );
                      })}
                      {/* Add Bulletin Button */}
                      <div className="flex flex-col items-start self-stretch py-[25px] pl-2">
                        <span 
                          onClick={() => {
                            setEditingBulletinIndex(null);
                            setEditingBulletinData(null);
                            setShowBulletinDrawer(true);
                          }}
                          className="text-[#F59E0B] text-sm cursor-pointer hover:underline"
                        >
                          Add new bulletin
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Risk Score Tab */}
            {activeTab === 'risk' && (
              <div className="flex flex-col items-start self-stretch bg-white rounded-lg">
                <div className="flex flex-col items-start self-stretch m-4 gap-6">
                  {/* Key Information with Recalculate Button */}
                  <div className="flex justify-between items-start self-stretch">
                    <div className="flex items-start w-[156px] gap-2">
                      <img
                        src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Iq8V0MifpP/wu3zk261_expires_30_days.png"
                        className="w-4 h-4 object-fill"
                      />
                      <div className="flex flex-col items-start w-[132px] gap-1">
                        <span className="text-[#040E1B] text-xl font-bold">EcoWind Corp.</span>
                        <span className="text-red-500 text-xs font-bold mr-8">High risk [90/100]</span>
                      </div>
                    </div>
                    <div className="flex items-center w-[444px] gap-4">
                      <button 
                        onClick={handleWatchlistToggle}
                        disabled={watchlistLoading}
                        className={`flex items-center bg-transparent text-left w-[168px] py-2 px-4 gap-1 rounded-lg border border-solid ${
                          isInWatchlist 
                            ? 'border-green-500 bg-green-50 hover:bg-green-100' 
                            : 'border-[#F59E0B] hover:bg-orange-50'
                        } transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        <img
                          src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Iq8V0MifpP/mjli27du_expires_30_days.png"
                          className="w-4 h-4 rounded-lg object-fill"
                        />
                        <span className={`text-base whitespace-nowrap ${isInWatchlist ? 'text-green-600' : 'text-[#F59E0B]'}`} style={{ fontFamily: 'Satoshi' }}>
                          {watchlistLoading 
                            ? 'Loading...' 
                            : isInWatchlist 
                              ? 'In Watchlist' 
                              : 'Add To Watchlist'
                          }
                        </span>
                      </button>
                      <button 
                        className="flex flex-col items-start w-[260px] py-[7px] px-[47px] rounded-lg border-4 border-solid border-[#0F284726] hover:opacity-90 transition-opacity"
                        style={{ background: 'linear-gradient(180deg, #022658, #1A4983)' }}
                      >
                        <span className="text-white text-base font-bold">Recalculate Risk score</span>
                      </button>
                    </div>
                  </div>

                  {/* Company Info Cards */}
                  <div className="flex items-start self-stretch bg-[#F4F6F9] py-4 px-8 rounded-lg">
                    <div className="flex flex-col items-start w-[200px] py-2 pl-2 mr-3.5 gap-2">
                      <span className="text-[#868C98] text-xs mr-[27px]">Company ID</span>
                      <span className="text-[#022658] text-base">CMP_00215</span>
                    </div>
                    <div className="flex flex-col items-start w-[200px] py-2 pl-2 mr-[15px] gap-2">
                      <span className="text-[#868C98] text-xs mr-[92px]">Industry</span>
                      <span className="text-[#022658] text-base">Renewable energy</span>
                    </div>
                    <div className="flex flex-col items-start w-[200px] py-2 pl-2 mr-3.5 gap-2">
                      <span className="text-[#868C98] text-xs">Registered Address</span>
                      <span className="text-[#022658] text-base">Accra, Ghana</span>
                    </div>
                    <div className="flex flex-col items-start w-[200px] py-2 pl-2 mr-[15px] gap-2">
                      <span className="text-[#868C98] text-xs mr-[46px]">Last updated</span>
                      <span className="text-[#022658] text-base">Oct 30th, 2025</span>
                    </div>
                    <div className="flex flex-col items-start w-[200px] py-2 pl-2 gap-2">
                      <span className="text-[#868C98] text-xs">Risk score</span>
                      <span className="text-red-500 text-base">90/100</span>
                    </div>
                  </div>

                  {/* Stats Cards */}
                  <div className="flex items-start self-stretch">
                    <div className="flex items-center bg-white w-[271px] p-2 mr-3 gap-3 rounded-lg border border-solid border-[#D4E1EA]">
                      <img
                        src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Iq8V0MifpP/5upxb4o3_expires_30_days.png"
                        className="w-10 h-10 rounded-lg object-fill"
                      />
                      <div className="flex flex-col items-start w-[133px] gap-1">
                        <span className="text-[#868C98] text-xs">Companies affiliated with</span>
                        <span className="text-[#F59E0B] text-base mr-[125px]">4</span>
                      </div>
                    </div>
                    <div className="flex items-center bg-white w-[271px] p-2 mr-[13px] gap-[11px] rounded-lg border border-solid border-[#D4E1EA]">
                      <img
                        src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Iq8V0MifpP/6h7hbakv_expires_30_days.png"
                        className="w-10 h-10 rounded-lg object-fill"
                      />
                      <div className="flex flex-col items-start w-[115px] gap-1">
                        <span className="text-[#868C98] text-xs">Persons affiliated with</span>
                        <span className="text-[#F59E0B] text-base mr-[87px]">563</span>
                      </div>
                    </div>
                    <div className="flex items-center bg-white w-[271px] p-2 mr-3 gap-3 rounded-lg border border-solid border-[#D4E1EA]">
                      <img
                        src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Iq8V0MifpP/sioslghy_expires_30_days.png"
                        className="w-10 h-10 rounded-lg object-fill"
                      />
                      <div className="flex flex-col items-start w-[87px] gap-1">
                        <span className="text-[#868C98] text-xs">Gazettes notices</span>
                        <span className="text-[#F59E0B] text-base mr-[69px]">45</span>
                      </div>
                    </div>
                    <div className="flex items-center bg-white w-[271px] p-2 gap-[11px] rounded-lg border border-solid border-[#D4E1EA]">
                      <img
                        src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Iq8V0MifpP/luthmc8r_expires_30_days.png"
                        className="w-10 h-10 rounded-lg object-fill"
                      />
                      <div className="flex flex-col items-start w-[110px] gap-1">
                        <span className="text-[#868C98] text-xs">Total amount of Data</span>
                        <span className="text-[#F59E0B] text-base mr-[41px]">1,345,765</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Risk Score Circular Chart */}
                <div className="flex items-start self-stretch bg-white mt-4 mx-4 rounded-lg border border-solid border-[#E4E7EB]" style={{ boxShadow: '4px 4px 4px #0708101A' }}>
                  <div className="flex flex-col items-start w-[198px] my-[34px] ml-[99px] mr-14">
                    <span className="text-emerald-500 text-lg font-bold mb-0.5 ml-28">+8 points</span>
                    <span className="text-[#040E1B] text-base text-right mb-[55px]">
                      GHS 185,000 total exposure (moderate)
                    </span>
                    <span className="text-blue-500 text-lg font-bold mb-0.5 ml-[67px]">+40 points</span>
                    <span className="text-[#040E1B] text-base text-right w-[156px] mb-[101px] ml-1.5">
                      20 cases won (Plaintiff in most)
                    </span>
                    <span className="text-blue-500 text-lg font-bold mb-0.5 ml-16">+10 points</span>
                    <span className="text-[#040E1B] text-base text-right w-[92px] ml-[62px]">
                      1 active case (ongoing risk)
                    </span>
                  </div>

                  {/* Circular Chart with Connector Lines */}
                  <div className="flex flex-col items-start w-[340px] relative mt-[41px] mr-[83px]">
                    <img
                      src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Iq8V0MifpP/pwxpx4ca_expires_30_days.png"
                      className="w-[340px] h-[340px] object-fill"
                    />
                    <img
                      src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Iq8V0MifpP/i2p2w31w_expires_30_days.png"
                      className="w-[126px] h-[29px] absolute top-[13px] left-[-56px] object-fill"
                    />
                    <img
                      src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Iq8V0MifpP/ghqi4dv8_expires_30_days.png"
                      className="w-[126px] h-[29px] absolute top-[37px] right-[-75px] object-fill"
                    />
                    <img
                      src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Iq8V0MifpP/ccw2uc0t_expires_30_days.png"
                      className="w-[98px] h-[1px] absolute top-[146px] left-[-82px] object-fill"
                    />
                    <img
                      src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Iq8V0MifpP/1dbtadpo_expires_30_days.png"
                      className="w-[152px] h-[23px] absolute bottom-10 right-[-101px] object-fill"
                    />
                    <img
                      src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Iq8V0MifpP/okgzze7y_expires_30_days.png"
                      className="w-[152px] h-[23px] absolute bottom-7 left-[-88px] object-fill"
                    />
                  </div>

                  <div className="flex flex-col items-start w-[188px] mt-[63px]">
                    <span className="text-red-500 text-lg font-bold mb-0.5">+35 points</span>
                    <span className="text-[#040E1B] text-base mb-[51px]">Lost 12 cases (unfavourable outcome)</span>
                    <span className="text-[#B0B8C5] text-lg font-bold mb-0.5">+0 points</span>
                    <span className="text-[#040E1B] text-base mb-[92px]">Civil disputes (not criminal)</span>
                    <div className="flex flex-col items-start self-stretch mx-[19px] gap-0.5">
                      <span className="text-red-500 text-lg font-bold">+33 points</span>
                      <span className="text-[#040E1B] text-base">Defendant in 14 cases</span>
                    </div>
                  </div>
                </div>

                {/* Risk Legend */}
                <div className="flex items-center self-stretch p-4 mb-4 mx-4 rounded-lg border border-solid border-[#D4E1EA]">
                  <span className="text-[#040E1B] text-base">
                    Calculated based on case history, dispute frequency, and unresolved matters
                  </span>
                  <div className="flex-1 self-stretch"></div>
                  <img
                    src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Iq8V0MifpP/u2sraeoe_expires_30_days.png"
                    className="w-4 h-4 mr-1 object-fill"
                  />
                  <span className="text-[#040E1B] text-sm mr-[19px]">Low risk: 0-40</span>
                  <img
                    src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Iq8V0MifpP/esvleva7_expires_30_days.png"
                    className="w-4 h-4 mr-1 object-fill"
                  />
                  <span className="text-[#040E1B] text-sm mr-[19px]">Moderate risk: 41-70</span>
                  <img
                    src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Iq8V0MifpP/2jn4brj2_expires_30_days.png"
                    className="w-4 h-4 mr-1 object-fill"
                  />
                  <span className="text-[#040E1B] text-sm">High risk: 71-100</span>
                </div>

                {/* Score Breakdown Table */}
                <span className="text-[#040E1B] text-xs mb-2 ml-4">SCORE BREAKDOWN</span>
                <div className="flex flex-col w-full self-stretch mb-4 mx-4 gap-1 rounded-[14px] border border-solid border-[#E5E8EC]">
                  <div className="flex items-start w-full self-stretch bg-[#F4F6F9] py-4">
                    <div className="flex flex-col items-start flex-1 min-w-0 py-2 pl-4">
                      <span className="text-[#070810] text-sm font-bold">Factor</span>
                    </div>
                    <div className="flex flex-col items-start flex-1 min-w-0 py-2 pl-4">
                      <span className="text-[#070810] text-sm font-bold">Weight</span>
                    </div>
                    <div className="flex flex-col items-start flex-[2] min-w-0 py-2 pl-4">
                      <span className="text-[#070810] text-sm font-bold">Description</span>
                    </div>
                    <div className="flex flex-col items-start flex-1 min-w-0 py-2 pl-4">
                      <span className="text-[#070810] text-sm font-bold">Entity value</span>
                    </div>
                    <div className="flex flex-col items-start flex-1 min-w-0 py-2 pl-4">
                      <span className="text-[#070810] text-sm font-bold">Risk point</span>
                    </div>
                  </div>
                  <div className="flex items-start w-full self-stretch py-3">
                    <div className="flex flex-col items-start flex-1 min-w-0 py-2 pl-4">
                      <span className="text-[#070810] text-sm truncate">Case Frequency</span>
                    </div>
                    <div className="flex flex-col items-start flex-1 min-w-0 py-2 pl-4">
                      <span className="text-[#070810] text-sm">30%</span>
                    </div>
                    <div className="flex flex-col items-start flex-[2] min-w-0 py-2 pl-4">
                      <span className="text-[#070810] text-sm">Number of legal disputes in the past 3 years</span>
                    </div>
                    <div className="flex flex-col items-start flex-1 min-w-0 py-2 pl-4">
                      <span className="text-[#070810] text-sm">5 cases</span>
                    </div>
                    <div className="flex flex-col items-start flex-1 min-w-0 py-2 pl-4">
                      <span className="text-[#070810] text-sm">30</span>
                    </div>
                  </div>
                  <div className="flex items-start w-full self-stretch py-3">
                    <div className="flex flex-col items-start flex-1 min-w-0 py-2 pl-4">
                      <span className="text-[#070810] text-sm truncate">Case Outcomes</span>
                    </div>
                    <div className="flex flex-col items-start flex-1 min-w-0 py-2 pl-4">
                      <span className="text-[#070810] text-sm">20%</span>
                    </div>
                    <div className="flex flex-col items-start flex-[2] min-w-0 py-2 pl-4">
                      <span className="text-[#070810] text-sm">Ratio of lost to won cases</span>
                    </div>
                    <div className="flex flex-col items-start flex-1 min-w-0 py-2 pl-4">
                      <span className="text-[#070810] text-sm">60% lost</span>
                    </div>
                    <div className="flex flex-col items-start flex-1 min-w-0 py-2 pl-4">
                      <span className="text-[#070810] text-sm">20</span>
                    </div>
                  </div>
                  <div className="flex items-start w-full self-stretch py-3">
                    <div className="flex flex-col items-start flex-1 min-w-0 py-2 pl-4">
                      <span className="text-[#070810] text-sm truncate">Financial Exposure</span>
                    </div>
                    <div className="flex flex-col items-start flex-1 min-w-0 py-2 pl-4">
                      <span className="text-[#070810] text-sm">20%</span>
                    </div>
                    <div className="flex flex-col items-start flex-[2] min-w-0 py-2 pl-4">
                      <span className="text-[#070810] text-sm">Total quantum (amount in dispute)</span>
                    </div>
                    <div className="flex flex-col items-start flex-1 min-w-0 py-2 pl-4">
                      <span className="text-[#070810] text-sm">GHS 1,200,000</span>
                    </div>
                    <div className="flex flex-col items-start flex-1 min-w-0 py-2 pl-4">
                      <span className="text-[#070810] text-sm">20</span>
                    </div>
                  </div>
                  <div className="flex items-start w-full self-stretch py-3">
                    <div className="flex flex-col items-start flex-1 min-w-0 py-2 pl-4">
                      <span className="text-[#070810] text-sm truncate">Regulatory Actions</span>
                    </div>
                    <div className="flex flex-col items-start flex-1 min-w-0 py-2 pl-4">
                      <span className="text-[#070810] text-sm">10%</span>
                    </div>
                    <div className="flex flex-col items-start flex-[2] min-w-0 py-2 pl-4">
                      <span className="text-[#070810] text-sm">Gazette notices / penalties</span>
                    </div>
                    <div className="flex flex-col items-start flex-1 min-w-0 py-2 pl-4">
                      <span className="text-[#070810] text-sm">2 recorded</span>
                    </div>
                    <div className="flex flex-col items-start flex-1 min-w-0 py-2 pl-4">
                      <span className="text-[#070810] text-sm">8</span>
                    </div>
                  </div>
                  <div className="flex items-start w-full self-stretch py-3">
                    <div className="flex flex-col items-start flex-1 min-w-0 py-2 pl-4">
                      <span className="text-[#070810] text-sm truncate">Case Recency</span>
                    </div>
                    <div className="flex flex-col items-start flex-1 min-w-0 py-2 pl-4">
                      <span className="text-[#070810] text-sm">10%</span>
                    </div>
                    <div className="flex flex-col items-start flex-[2] min-w-0 py-2 pl-4">
                      <span className="text-[#070810] text-sm">Time since last recorded case</span>
                    </div>
                    <div className="flex flex-col items-start flex-1 min-w-0 py-2 pl-4">
                      <span className="text-[#070810] text-sm">4 months ago</span>
                    </div>
                    <div className="flex flex-col items-start flex-1 min-w-0 py-2 pl-4">
                      <span className="text-[#070810] text-sm">8</span>
                    </div>
                  </div>
                  <div className="flex items-start w-full self-stretch py-3">
                    <div className="flex flex-col items-start flex-1 min-w-0 py-2 pl-4">
                      <span className="text-[#070810] text-sm truncate">Data Completeness</span>
                    </div>
                    <div className="flex flex-col items-start flex-1 min-w-0 py-2 pl-4">
                      <span className="text-[#070810] text-sm">10%</span>
                    </div>
                    <div className="flex flex-col items-start flex-[2] min-w-0 py-2 pl-4">
                      <span className="text-[#070810] text-sm">Accuracy & profile completeness</span>
                    </div>
                    <div className="flex flex-col items-start flex-1 min-w-0 py-2 pl-4">
                      <span className="text-[#070810] text-sm">85%</span>
                    </div>
                    <div className="flex flex-col items-start flex-1 min-w-0 py-2 pl-4">
                      <span className="text-[#070810] text-sm">7</span>
                    </div>
                  </div>
                  <div className="flex items-start w-full self-stretch py-3">
                    <div className="flex flex-col items-start flex-1 min-w-0 py-2 pl-4">
                      <span className="text-[#070810] text-sm truncate">Total Weighted Score</span>
                    </div>
                    <div className="flex flex-col items-start flex-1 min-w-0 py-2 pl-4">
                      <span className="text-[#070810] text-sm">100%</span>
                    </div>
                    <div className="flex flex-col items-start flex-[2] min-w-0 py-2 pl-4">
                      <span className="text-[#070810] text-sm">-</span>
                    </div>
                    <div className="flex flex-col items-start flex-1 min-w-0 py-2 pl-4">
                      <span className="text-[#070810] text-sm">-</span>
                    </div>
                    <div className="flex flex-col items-start flex-1 min-w-0 py-2 pl-4">
                      <span className="text-[#070810] text-sm">90</span>
                    </div>
                  </div>
                </div>

                {/* Risk Indicator Table */}
                <span className="text-[#040E1B] text-xs mb-2 ml-4">RISK INDICATOR</span>
                <div className="flex flex-col w-full self-stretch mb-4 mx-4 gap-1 rounded-[14px] border border-solid border-[#E5E8EC]">
                  <div className="flex items-start w-full self-stretch bg-[#F4F6F9] py-4">
                    <div className="flex flex-col items-start flex-1 min-w-0 py-2 pl-4">
                      <span className="text-[#070810] text-sm font-bold">Indicator</span>
                    </div>
                    <div className="flex flex-col items-start flex-1 min-w-0 py-2 pl-4">
                      <span className="text-[#070810] text-sm font-bold">Status</span>
                    </div>
                    <div className="flex flex-col items-start flex-[2] min-w-0 py-2 pl-4">
                      <span className="text-[#070810] text-sm font-bold">Description</span>
                    </div>
                  </div>
                  {riskIndicators.map((item, idx) => (
                    <div key={idx} className="flex items-start w-full self-stretch py-3">
                      <div className="flex flex-col items-start flex-1 min-w-0 py-2 pl-4">
                        <span className="text-[#070810] text-sm truncate">{item.indicator}</span>
                      </div>
                      <div className="flex flex-col items-start flex-1 min-w-0 py-2 pl-4">
                        <span className="text-[#070810] text-sm truncate">{item.status}</span>
                      </div>
                      <div className="flex flex-col items-start flex-[2] min-w-0 py-2 pl-4">
                        <span className="text-[#070810] text-sm">{item.description}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Case Filed Graph */}
                <div className="flex items-center self-stretch py-0.5 mb-[22px] mx-[43px]">
                  <div className="flex items-center w-[148px] gap-[7px]">
                    <span className="text-[#040E1B] text-2xl">CASE FILED</span>
                    <img
                      src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Iq8V0MifpP/glwkrvpk_expires_30_days.png"
                      className="w-4 h-4 object-fill"
                    />
                  </div>
                  <div className="flex-1 self-stretch"></div>
                  <span className="text-[#040E1B] text-lg mr-[7px]">This year</span>
                  <img
                    src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Iq8V0MifpP/td3h86e9_expires_30_days.png"
                    className="w-[15px] h-4 object-fill"
                  />
                </div>

                {/* Graph Grid Lines */}
                <div className="self-stretch mb-[47px] mx-4">
                  <div className="self-stretch h-0.5"></div>
                  <div className="self-stretch bg-[#D4E1EA] h-0.5"></div>
                </div>

                {/* Graph Y-Axis and Chart */}
                <div className="flex items-start self-stretch mb-[1px] ml-12 mr-[67px] gap-[25px]">
                  <div className="flex flex-col items-center w-[35px] gap-10">
                    <span className="text-[#040E1B] text-2xl">100</span>
                    <span className="text-[#040E1B] text-2xl">80</span>
                    <span className="text-[#040E1B] text-2xl">60</span>
                    <span className="text-[#040E1B] text-2xl">40</span>
                  </div>
                  <div className="w-[978px] mt-3.5">
                    <div className="self-stretch bg-[#D4E1EA] h-0.5"></div>
                    <div className="flex flex-col items-start self-stretch relative ml-[58px] mr-[1px]">
                      <img
                        src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Iq8V0MifpP/n8nwy5kx_expires_30_days.png"
                        className="self-stretch h-[281px] object-fill"
                      />
                      <div className="bg-[#D4E1EA] w-[978px] h-0.5 absolute top-[69px] right-[-1px]"></div>
                      <div className="bg-[#D4E1EA] w-[978px] h-0.5 absolute bottom-[139px] right-[-1px]"></div>
                      <div className="bg-[#D4E1EA] w-[978px] h-0.5 absolute bottom-[68px] right-[-1px]"></div>
                    </div>
                  </div>
                </div>

                {/* Graph X-Axis */}
                <div className="flex flex-col items-end self-stretch mb-1">
                  <div className="items-start mr-[67px]">
                    <div className="w-[978px] h-0.5"></div>
                    <div className="bg-[#D4E1EA] w-[978px] h-0.5"></div>
                  </div>
                </div>
                <span className="text-[#040E1B] text-2xl mb-1 ml-[57px]">20</span>
                <div className="flex flex-col items-end self-stretch mb-[42px]">
                  <div className="flex items-start mr-[90px]">
                    <span className="text-[#040E1B] text-2xl mr-16">Jan 2</span>
                    <span className="text-[#040E1B] text-2xl mr-[55px]">March 7</span>
                    <span className="text-[#040E1B] text-2xl mr-[60px]">April 12</span>
                    <span className="text-[#040E1B] text-2xl mr-[59px]">June 17</span>
                    <span className="text-[#040E1B] text-2xl mr-[65px]">Aug 22</span>
                    <span className="text-[#040E1B] text-2xl mr-[73px]">Oct 27</span>
                    <span className="text-[#040E1B] text-2xl">Dec 2</span>
                  </div>
                </div>

                {/* Case & Dispute Summary Table */}
                <div className="flex flex-col self-stretch mb-4 mx-4 gap-2">
                  <div className="flex justify-between items-start self-stretch">
                    <span className="text-[#040E1B] text-xs">CASE & DISPUTE SUMMARY</span>
                    <span className="text-[#022658] text-xs font-bold cursor-pointer hover:underline">View all</span>
                  </div>
                  <div className="flex flex-col self-stretch gap-1 rounded-[14px] border border-solid border-[#E5E8EC]">
                    <div className="flex items-start self-stretch bg-[#F4F6F9] py-4">
                      <div className="flex flex-col items-start w-[136px] py-2 pl-2 mr-3">
                        <span className="text-[#070810] text-sm font-bold">Case Number</span>
                      </div>
                      <div className="flex flex-col items-start w-[200px] py-2 pl-2 mr-3">
                        <span className="text-[#070810] text-sm font-bold">Case type</span>
                      </div>
                      <div className="flex flex-col items-start w-[136px] py-2 pl-2 mr-3">
                        <span className="text-[#070810] text-sm font-bold">Court</span>
                      </div>
                      <div className="flex flex-col items-start w-[136px] py-2 pl-2 mr-3">
                        <span className="text-[#070810] text-sm font-bold">Status</span>
                      </div>
                      <div className="flex flex-col items-start w-[136px] py-2 pl-2 mr-3">
                        <span className="text-[#070810] text-sm font-bold">Outcome</span>
                      </div>
                      <div className="flex flex-col items-start w-[136px] py-2 pl-2 mr-3">
                        <span className="text-[#070810] text-sm font-bold">Quantum (GHS)</span>
                      </div>
                      <div className="flex flex-col items-start w-[136px] py-2 pl-2 mr-[34px]">
                        <span className="text-[#070810] text-sm font-bold">Weight in Risk</span>
                      </div>
                    </div>
                    {caseDisputeSummary.map((caseItem, idx) => (
                      <div key={idx} className="flex items-start self-stretch py-3">
                        <div className="flex flex-col items-start w-[136px] py-[13px] pl-2 mr-3">
                          <span className="text-[#070810] text-sm">{caseItem.caseNumber}</span>
                        </div>
                        <div className="flex flex-col items-start w-[200px] py-[13px] pl-2 mr-3">
                          <span className="text-[#070810] text-sm">{caseItem.caseType}</span>
                        </div>
                        <div className="flex flex-col items-start w-[136px] py-[13px] pl-2 mr-3">
                          <span className="text-[#070810] text-sm">{caseItem.court}</span>
                        </div>
                        <div className="flex flex-col items-start w-[136px] py-[13px] pl-2 mr-3">
                          <span className="text-[#070810] text-sm">{caseItem.status}</span>
                        </div>
                        <div className="flex flex-col items-start w-[136px] py-[13px] pl-2 mr-3">
                          <span className={`text-sm font-bold ${
                            caseItem.outcome === 'Lost' ? 'text-red-500' : 
                            caseItem.outcome === 'Won' ? 'text-emerald-500' : 
                            'text-[#040E1B]'
                          }`}>
                            {caseItem.outcome}
                          </span>
                        </div>
                        <div className="flex flex-col items-start w-[136px] py-[13px] pl-2 mr-3">
                          <span className="text-[#070810] text-sm">{caseItem.quantum}</span>
                        </div>
                        <div className="flex flex-col items-start w-[136px] py-[13px] pl-2 mr-[34px]">
                          <span className="text-[#040E1B] text-sm">{caseItem.weight}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Risk Comparison */}
                <div className="flex flex-col self-stretch bg-white py-[21px] mb-4 mx-4 gap-2 rounded-lg border border-solid border-[#D4E1EA]" style={{ boxShadow: '4px 4px 4px #0708101A' }}>
                  <div className="flex justify-between items-start self-stretch mx-10">
                    <span className="text-[#525866] text-base">EcoWind Risk Score</span>
                    <span className="text-[#525866] text-base">Industry Average (Renewable Energy)</span>
                    <span className="text-[#525866] text-base">Bottom Quartile</span>
                  </div>
                  <div className="flex flex-col items-end self-stretch">
                    <div className="flex items-start mr-[88px]">
                      <span className="text-red-500 text-lg mr-[445px]">92</span>
                      <span className="text-emerald-500 text-lg mr-[429px]">54</span>
                      <span className="text-[#F59E0B] text-lg">60</span>
                    </div>
                  </div>
                </div>

                {/* Risk Score Explanation */}
                <div className="flex flex-col items-start self-stretch pr-3 mb-[119px] mx-4 gap-2">
                  <span className="text-[#040E1B] text-lg">Risk Score Explanation</span>
                  <span className="text-[#040E1B] text-base">
                    Why High Risk: 32 court cases in total (high litigation frequency), Lost the concluded case with
                    judgment in opponents favour, Acting as Defendant (being sued for wrongdoing), a number of regulatory
                    violations, losing a number of cases or adverse judgments, Total claim values are high for
                    professional level.
                    <br />
                    <br />
                    Contributing Factors: One ongoing commercial dispute (adds minor uncertainty), Total claim exposure
                    of GHS 1,185,000 (not so manageable).
                  </span>
                </div>
              </div>
            )}

            {/* Other Tabs */}
            {activeTab !== 'personal' && activeTab !== 'directors' && activeTab !== 'secretaries' && activeTab !== 'employees' && activeTab !== 'regulatory' && activeTab !== 'cases' && activeTab !== 'bulletin' && activeTab !== 'risk' && (
              <div className="flex flex-col bg-white p-6 gap-4 rounded-lg border border-solid border-[#E4E7EB]" style={{boxShadow: '4px 4px 4px #0708101A'}}>
                <span className="text-[#525866] text-sm">
                  {tabs.find(t => t.id === activeTab)?.label} content coming soon...
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Regulatory Drawer */}
      {showRegulatoryDrawer && (
        <AddRegulatoryDrawer
          onClose={() => {
            setShowRegulatoryDrawer(false);
            setEditingRegulatoryIndex(null);
            setEditingRegulatoryData(null);
          }}
          onSave={handleSaveRegulatory}
          initialData={editingRegulatoryData}
          isEditMode={editingRegulatoryIndex !== null}
        />
      )}

      {showDirectorDrawer && (
        <AddDirectorDrawer
          onClose={() => {
            setShowDirectorDrawer(false);
            setEditingDirectorIndex(null);
            setEditingDirectorData(null);
          }}
          onSave={handleSaveDirector}
          initialData={editingDirectorData}
          isEditMode={editingDirectorIndex !== null}
        />
      )}

      {showSecretaryDrawer && (
        <AddSecretaryDrawer
          onClose={() => {
            setShowSecretaryDrawer(false);
            setEditingSecretaryData(null);
          }}
          onSave={handleSaveSecretary}
          initialData={editingSecretaryData}
          isEditMode={editingSecretaryData !== null}
        />
      )}

      {showEmployeeDrawer && (
        <AddEmployeeDrawer
          onClose={() => {
            setShowEmployeeDrawer(false);
            setEditingEmployeeIndex(null);
            setEditingEmployeeData(null);
          }}
          onSave={handleSaveEmployee}
          initialData={editingEmployeeData}
          isEditMode={editingEmployeeIndex !== null}
        />
      )}

      {/* Add Case Drawer */}
      {showCaseDrawer && (
        <AddCaseDrawer
          onClose={() => {
            setShowCaseDrawer(false);
            setEditingCaseIndex(null);
            setEditingCaseData(null);
          }}
          onSave={handleSaveCase}
          initialData={editingCaseData}
          isEditMode={editingCaseIndex !== null}
          companyId={companyId}
        />
      )}

      {/* Add Bulletin Drawer */}
      {showBulletinDrawer && (
        <AddBulletinDrawer
          onClose={() => {
            setShowBulletinDrawer(false);
            setEditingBulletinIndex(null);
            setEditingBulletinData(null);
          }}
          onSave={handleSaveBulletin}
          initialData={editingBulletinData}
          isEditMode={editingBulletinIndex !== null}
        />
      )}

      {/* Success Notification */}
      {showSuccess && (
        <SuccessNotification
          message={successMessage}
          onClose={() => setShowSuccess(false)}
        />
      )}

      {/* Delete Director Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false);
          setDirectorToDelete(null);
          setDirectorDeleteIndex(null);
        }}
        onConfirm={handleConfirmDeleteDirector}
        title={`Are you sure you want to delete director "${directorToDelete?.name}"?`}
        message="This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
      />

      {/* Delete Secretary Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteSecretaryConfirm}
        onClose={() => {
          setShowDeleteSecretaryConfirm(false);
          setSecretaryToDelete(null);
        }}
        onConfirm={handleConfirmDeleteSecretary}
        title={`Are you sure you want to delete secretary "${secretaryToDelete?.name}"?`}
        message="This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
      />

      {/* Delete Employee Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteEmployeeConfirm}
        onClose={() => {
          setShowDeleteEmployeeConfirm(false);
          setEmployeeToDelete(null);
          setEmployeeDeleteIndex(null);
        }}
        onConfirm={handleConfirmDeleteEmployee}
        title={`Are you sure you want to delete employee "${employeeToDelete?.name}"?`}
        message="This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
      />

      {/* Delete Regulatory Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteRegulatoryConfirm}
        onClose={() => {
          setShowDeleteRegulatoryConfirm(false);
          setRegulatoryToDelete(null);
          setRegulatoryDeleteId(null);
        }}
        onConfirm={handleConfirmDeleteRegulatory}
        title={`Are you sure you want to delete this regulatory record?`}
        message={`Regulatory Body: ${regulatoryToDelete?.body || regulatoryToDelete?.regulatory_body || 'N/A'}\n\nThis action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
      />

      {/* Delete Case Link Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteCaseConfirm}
        onClose={() => {
          setShowDeleteCaseConfirm(false);
          setCaseToDelete(null);
          setCaseLinkDeleteId(null);
        }}
        onConfirm={handleConfirmDeleteCase}
        title={`Are you sure you want to delete this case link?`}
        message={`Case: ${caseToDelete?.title || caseToDelete?.case_title || 'N/A'}\nCase Number: ${caseToDelete?.suit_reference_number || caseToDelete?.case_number || 'N/A'}\n\nThis action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
      />

      {/* Delete Bulletin Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteBulletinConfirm}
        onClose={() => {
          setShowDeleteBulletinConfirm(false);
          setBulletinToDelete(null);
          setBulletinDeleteId(null);
        }}
        onConfirm={handleConfirmDeleteBulletin}
        title={`Are you sure you want to delete this bulletin entry?`}
        message={`Notice Type: ${bulletinToDelete?.gazette_type ? bulletinToDelete.gazette_type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'N/A'}\nBulletin Number: ${bulletinToDelete?.gazette_number || 'N/A'}\n\nThis action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
      />
    </div>
  );
};

export default CompanyDetails;


