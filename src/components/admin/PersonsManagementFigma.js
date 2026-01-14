import React, { useState, useEffect, useRef } from 'react';
import { apiGet, apiPost } from '../../utils/api';
import PersonDetails from './PersonDetails';
import AddPersonForm from './AddPersonForm';
import PersonsIndustrySelector from './PersonsIndustrySelector';
import PersonsEntitySelector from './PersonsEntitySelector';
import AdminHeader from './AdminHeader';
import { ChevronDown, ChevronUp, CheckCircle, X, Search } from 'lucide-react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const PersonsManagementFigma = ({ userInfo, onNavigate, onLogout }) => {
  const [searchPersonQuery, setSearchPersonQuery] = useState('');
  const [persons, setPersons] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);
  const [totalResults, setTotalResults] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedIndustry, setSelectedIndustry] = useState(null);
  const [selectedEntity, setSelectedEntity] = useState(null);
  const [successNotification, setSuccessNotification] = useState(null);
  const [showSearchPage, setShowSearchPage] = useState(true); // Show search page by default
  const [showAiSearch, setShowAiSearch] = useState(false); // Hide AI search UI by default
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false); // Hide advanced options by default
  const [aiSearchQuery, setAiSearchQuery] = useState('');
  const [isAiSearching, setIsAiSearching] = useState(false);
  const [nameSuggestions, setNameSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestionsTimeout, setSuggestionsTimeout] = useState(null);
  
  // Processing page states
  const [isProcessing, setIsProcessing] = useState(false);
  const [searchProgress, setSearchProgress] = useState(0);
  const [currentDatabase, setCurrentDatabase] = useState('');
  const [searchStartTime, setSearchStartTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [searchedDatabases, setSearchedDatabases] = useState([]);
  const [showRefinementModal, setShowRefinementModal] = useState(false);
  const [refinementQuestion, setRefinementQuestion] = useState('');
  const [refinementAnswer, setRefinementAnswer] = useState('');
  const modalResolvedRef = useRef(false);
  const [showMultipleResultsModal, setShowMultipleResultsModal] = useState(false);
  const [showResultsPage, setShowResultsPage] = useState(false);
  const [selectedPersonForReport, setSelectedPersonForReport] = useState(null);
  const [personGazettes, setPersonGazettes] = useState([]);
  const [aiOverview, setAiOverview] = useState('');
  const [databaseResultCounts, setDatabaseResultCounts] = useState({});
  const [currentSearchQuery, setCurrentSearchQuery] = useState('');
  const [personNameStatuses, setPersonNameStatuses] = useState({}); // Map of personId -> {status: 'current'|'old'|'alias', label: string}
  const [personOldNames, setPersonOldNames] = useState({}); // Map of personId -> array of old names
  const [personAliases, setPersonAliases] = useState({}); // Map of personId -> array of alias names
  const [showAiOverview, setShowAiOverview] = useState(true); // Collapsible AI overview
  const [selectedDatabaseFilter, setSelectedDatabaseFilter] = useState(null); // Filter by database source
  const [allPersons, setAllPersons] = useState([]); // Store all persons before filtering
  const [personDatabaseMap, setPersonDatabaseMap] = useState({}); // Map personId -> array of database sources
  const [hasMore, setHasMore] = useState(true); // For infinite scroll
  const [isLoadingMore, setIsLoadingMore] = useState(false); // Loading more results
  const [gazetteEntries, setGazetteEntries] = useState([]); // Gazette entries in search results
  const [searchParams, setSearchParams] = useState(null); // Store search params for loading more
  
  // Feedback and complaint states
  const [showSearchResultReportModal, setShowSearchResultReportModal] = useState(false);
  const [searchResultReportMessage, setSearchResultReportMessage] = useState('');
  const [isSubmittingSearchReport, setIsSubmittingSearchReport] = useState(false);
  const [showComplaintModal, setShowComplaintModal] = useState(false);
  const [complaintMessage, setComplaintMessage] = useState('');
  const [complaintSubject, setComplaintSubject] = useState('');
  const [isSubmittingComplaint, setIsSubmittingComplaint] = useState(false);
  
  // Advanced search form data
  const [advancedSearchData, setAdvancedSearchData] = useState({
    name: '',
    location: '',
    profession: '',
    databaseType: 'all', // 'all', 'change_of_name', 'change_of_dob', 'change_of_pob', 'marriage_officers', 'company_officers', 'court'
    surnameLetter: '' // For browsing by surname starting with letter
  });

  const databaseOptions = [
    {
      id: 'all',
      label: 'All database',
      description: 'Search across all available databases and records',
      icon: '📊'
    },
    {
      id: 'change_of_name',
      label: 'Change of name',
      description: 'Search records of legal name changes and name amendments',
      icon: '📝'
    },
    {
      id: 'change_of_dob',
      label: 'Correction of date of birth',
      description: 'Search records of date of birth corrections and amendments',
      icon: '📅'
    },
    {
      id: 'change_of_pob',
      label: 'Correction of place of birth',
      description: 'Search records of place of birth corrections and amendments',
      icon: '📍'
    },
    {
      id: 'marriage_officers',
      label: 'Marriage officers',
      description: 'Search for registered marriage officers and officiants',
      icon: '💒'
    },
    {
      id: 'company_officers',
      label: 'Company officers',
      description: 'Search for directors, shareholders, and officers of companies',
      icon: '🏢'
    },
    {
      id: 'court',
      label: 'Court',
      description: 'Search court records, cases, and legal proceedings',
      icon: '⚖️'
    }
  ];

  // Filtered database options for search form (show all searchable databases)
  const searchableDatabaseOptions = databaseOptions.filter(db => 
    db.id === 'all' || db.id === 'change_of_name' || db.id === 'change_of_pob' || db.id === 'change_of_dob' || db.id === 'marriage_officers'
  );

  const alphabetLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  
  // Filters
  const [selectedRegion, setSelectedRegion] = useState('All Regions');
  const [selectedTown, setSelectedTown] = useState('All Towns');
  const [showRegionDropdown, setShowRegionDropdown] = useState(false);
  const [showTownDropdown, setShowTownDropdown] = useState(false);
  const [sortBy, setSortBy] = useState('full_name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [showExportDropdown, setShowExportDropdown] = useState(false);
  const [pageInputValue, setPageInputValue] = useState('1');
  
  // Filter states
  const [selectedRiskLevel, setSelectedRiskLevel] = useState('All');
  const [minRiskScore, setMinRiskScore] = useState('');
  const [maxRiskScore, setMaxRiskScore] = useState('');
  const [selectedCaseTypes, setSelectedCaseTypes] = useState([]);
  
  const exportDropdownRef = useRef(null);
  
  const riskLevels = ['All', 'Low', 'Medium', 'High'];
  const caseTypeOptions = [
    'Criminal',
    'Civil',
    'Commercial',
    'Family',
    'Land',
    'Labor',
    'Tax',
    'Constitutional',
    'Administrative',
    'Other'
  ];
  
  // Stats
  const [stats, setStats] = useState({
    totalPersons: 0,
    totalCompanies: 0,
    totalRelatedData: 0
  });

  const regionDropdownRef = useRef(null);
  const townDropdownRef = useRef(null);
  const sortDropdownRef = useRef(null);
  const filterDropdownRef = useRef(null);

  const regions = [
    'All Regions',
    'Greater Accra',
    'Ashanti',
    'Central',
    'Eastern',
    'Northern',
    'Western',
    'Volta',
    'Upper East',
    'Upper West',
    'Bono',
    'Bono East',
    'Ahafo',
    'Savannah',
    'North East',
    'Oti',
    'Western North'
  ];

  // Map display region names to database abbreviations
  const getRegionAbbreviation = (displayName) => {
    const regionMap = {
      'All Regions': null,
      'Greater Accra': 'GAR',
      'Ashanti': 'ASR',
      'Central': 'CR',
      'Eastern': 'ER',
      'Northern': 'NR',
      'Western': 'WR',
      'Volta': 'VR',
      'Upper East': 'UER',
      'Upper West': 'UWR',
      'Bono': 'BR', // Brong-Ahafo Region (legacy)
      'Bono East': 'BER',
      'Ahafo': 'AHR',
      'Savannah': 'SR',
      'North East': 'NER',
      'Oti': 'OR',
      'Western North': 'WNR'
    };
    return regionMap[displayName] || displayName;
  };

  // Map database abbreviations back to display names
  const getRegionDisplayName = (abbreviation) => {
    if (!abbreviation) return 'N/A';
    const regionMap = {
      'GAR': 'Greater Accra',
      'ASR': 'Ashanti',
      'AR': 'Ashanti', // Alternative abbreviation
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

  const towns = [
    'All Towns',
    'Accra',
    'Kumasi',
    'Tamale',
    'Takoradi',
    'Cape Coast',
    'Sunyani',
    'Ho',
    'Koforidua',
    'Wa',
    'Bolgatanga'
  ];

  const sortOptions = [
    { value: 'full_name', label: 'Name (A-Z)' },
    { value: 'full_name_desc', label: 'Name (Z-A)' },
    { value: 'risk_score', label: 'Risk Score (Low to High)' },
    { value: 'risk_score_desc', label: 'Risk Score (High to Low)' },
    { value: 'case_count', label: 'Cases (Low to High)' },
    { value: 'case_count_desc', label: 'Cases (High to Low)' },
    { value: 'created_at', label: 'Date Added (Newest)' },
    { value: 'created_at_desc', label: 'Date Added (Oldest)' }
  ];

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (regionDropdownRef.current && !regionDropdownRef.current.contains(event.target)) {
        setShowRegionDropdown(false);
      }
      if (townDropdownRef.current && !townDropdownRef.current.contains(event.target)) {
        setShowTownDropdown(false);
      }
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(event.target)) {
        setShowSortDropdown(false);
      }
      if (filterDropdownRef.current && !filterDropdownRef.current.contains(event.target)) {
        setShowFilterDropdown(false);
      }
      if (exportDropdownRef.current && !exportDropdownRef.current.contains(event.target)) {
        setShowExportDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Load persons data from API
  const loadPersons = async () => {
    // Allow loading even without entity to test if there's any data
    // if (!selectedEntity) return;
    
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
        sort_by: sortBy,
        sort_order: sortOrder
      });

      // Add search query
      if (searchPersonQuery.trim()) {
        params.append('query', searchPersonQuery.trim());
      }

      // Add region filter - convert display name to database abbreviation
      if (selectedRegion && selectedRegion !== 'All Regions') {
        const regionAbbr = getRegionAbbreviation(selectedRegion);
        if (regionAbbr) {
          params.append('region', regionAbbr);
          console.log(`Filtering by region: ${selectedRegion} -> ${regionAbbr}`);
        }
      }

      // Add city/town filter
      if (selectedTown && selectedTown !== 'All Towns') {
        params.append('city', selectedTown);
      }

      // Add risk level filter - capitalize first letter to match database format
      if (selectedRiskLevel && selectedRiskLevel !== 'All') {
        const riskLevelValue = selectedRiskLevel.charAt(0).toUpperCase() + selectedRiskLevel.slice(1).toLowerCase();
        params.append('risk_level', riskLevelValue);
        console.log(`Filtering by risk level: ${selectedRiskLevel} -> ${riskLevelValue}`);
      }

      // Add risk score range filters
      if (minRiskScore && minRiskScore.trim() !== '') {
        const minScore = parseFloat(minRiskScore);
        if (!isNaN(minScore) && minScore >= 0) {
          params.append('min_risk_score', minScore.toString());
        }
      }
      if (maxRiskScore && maxRiskScore.trim() !== '') {
        const maxScore = parseFloat(maxRiskScore);
        if (!isNaN(maxScore) && maxScore >= 0) {
          params.append('max_risk_score', maxScore.toString());
        }
      }

      // Add case types filter (if supported by API)
      // Note: The API might need case_types as a list, but we'll send as comma-separated for now
      if (selectedCaseTypes && selectedCaseTypes.length > 0) {
        // For now, we'll filter by case count if case types are selected
        // The backend might need to be updated to handle case_types filtering
        params.append('min_case_count', '1');
      }

      // Add entity filter (employer or organization based on entity type)
      // Note: This filter might be too strict if people don't have exact employer names
      // We'll make it optional for now to see if there's any data
      if (selectedEntity) {
        // For Banking & Finance industry, filter by employer (bank name)
        if (selectedIndustry.id === 'banking') {
          // Use partial match by not using exact filter - let the query handle it
          params.append('employer', selectedEntity.name);
          console.log('Filtering by employer (bank):', selectedEntity.name);
        } else {
          // For other industries, filter by organization
          params.append('organization', selectedEntity.name);
          console.log('Filtering by organization:', selectedEntity.name);
        }
      }

      const apiUrl = `/people/search?${params.toString()}`;
      console.log('Fetching people from:', apiUrl);
      console.log('Selected entity:', selectedEntity);
      console.log('Selected industry:', selectedIndustry);
      
      let data = await apiGet(apiUrl);
      console.log('API response:', data);
      console.log('Total people found:', data.total || 0);
      console.log('People array:', data.people || []);
      
      // If no results with entity filter and entity is selected, try without it to see if there's any data
      if ((data.total || 0) === 0 && selectedEntity) {
        console.log('No results with entity filter, trying without entity filter...');
        const paramsWithoutEntity = new URLSearchParams({
          page: currentPage.toString(),
          limit: itemsPerPage.toString(),
          sort_by: sortBy,
          sort_order: sortOrder
        });
        
        if (searchPersonQuery.trim()) {
          paramsWithoutEntity.append('query', searchPersonQuery.trim());
        }
        // Add region filter - convert display name to database abbreviation
        if (selectedRegion && selectedRegion !== 'All Regions') {
          const regionAbbr = getRegionAbbreviation(selectedRegion);
          if (regionAbbr) {
            paramsWithoutEntity.append('region', regionAbbr);
          }
        }
        if (selectedTown && selectedTown !== 'All Towns') {
          paramsWithoutEntity.append('city', selectedTown);
        }

        // Add risk filters - capitalize first letter to match database format
        if (selectedRiskLevel && selectedRiskLevel !== 'All') {
          const riskLevelValue = selectedRiskLevel.charAt(0).toUpperCase() + selectedRiskLevel.slice(1).toLowerCase();
          paramsWithoutEntity.append('risk_level', riskLevelValue);
        }
        if (minRiskScore && minRiskScore.trim() !== '') {
          const minScore = parseFloat(minRiskScore);
          if (!isNaN(minScore) && minScore >= 0) {
            paramsWithoutEntity.append('min_risk_score', minScore.toString());
          }
        }
        if (maxRiskScore && maxRiskScore.trim() !== '') {
          const maxScore = parseFloat(maxRiskScore);
          if (!isNaN(maxScore) && maxScore >= 0) {
            paramsWithoutEntity.append('max_risk_score', maxScore.toString());
          }
        }
        
        const fallbackUrl = `/people/search?${paramsWithoutEntity.toString()}`;
        console.log('Trying fallback URL:', fallbackUrl);
        try {
          const fallbackData = await apiGet(fallbackUrl);
          console.log('Fallback response - Total people:', fallbackData.total || 0);
          
          // If we have data without the filter, use it (but log a warning)
          if ((fallbackData.total || 0) > 0) {
            console.warn('Found people without entity filter. Entity filter may be too strict or people may not have employer/organization set.');
            data = fallbackData;
          }
        } catch (fallbackError) {
          console.error('Fallback also failed:', fallbackError);
        }
      }
      
      // If no entity is selected, load all people (for testing/debugging)
      if (!selectedEntity) {
        console.log('No entity selected, loading all people...');
        const paramsAll = new URLSearchParams({
          page: currentPage.toString(),
          limit: itemsPerPage.toString(),
          sort_by: sortBy,
          sort_order: sortOrder
        });
        
        if (searchPersonQuery.trim()) {
          paramsAll.append('query', searchPersonQuery.trim());
        }
        // Add region filter - convert display name to database abbreviation
        if (selectedRegion && selectedRegion !== 'All Regions') {
          const regionAbbr = getRegionAbbreviation(selectedRegion);
          if (regionAbbr) {
            paramsAll.append('region', regionAbbr);
          }
        }
        if (selectedTown && selectedTown !== 'All Towns') {
          paramsAll.append('city', selectedTown);
        }

        // Add risk filters - capitalize first letter to match database format
        if (selectedRiskLevel && selectedRiskLevel !== 'All') {
          const riskLevelValue = selectedRiskLevel.charAt(0).toUpperCase() + selectedRiskLevel.slice(1).toLowerCase();
          paramsAll.append('risk_level', riskLevelValue);
        }
        if (minRiskScore && minRiskScore.trim() !== '') {
          const minScore = parseFloat(minRiskScore);
          if (!isNaN(minScore) && minScore >= 0) {
            paramsAll.append('min_risk_score', minScore.toString());
          }
        }
        if (maxRiskScore && maxRiskScore.trim() !== '') {
          const maxScore = parseFloat(maxRiskScore);
          if (!isNaN(maxScore) && maxScore >= 0) {
            paramsAll.append('max_risk_score', maxScore.toString());
          }
        }
        
        const allUrl = `/people/search?${paramsAll.toString()}`;
        console.log('Loading all people from:', allUrl);
        data = await apiGet(allUrl);
        console.log('All people response - Total:', data.total || 0);
      }
      
      // Transform API data to match component format
      const transformedPersons = (data.people || []).map(person => {
        // Format date of birth
        const dob = person.date_of_birth 
          ? new Date(person.date_of_birth).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })
          : 'N/A';
        
        // Format risk score
        const riskScore = person.risk_score || 0;
        let riskLevel = 'Low';
        let riskColor = 'text-emerald-500';
        let riskBg = 'bg-[#30AB401A]';
        
        if (riskScore >= 70) {
          riskLevel = 'High';
          riskColor = 'text-red-500';
          riskBg = 'bg-[#EF44441A]';
        } else if (riskScore >= 40) {
          riskLevel = 'Medium';
          riskColor = 'text-[#F59E0B]';
          riskBg = 'bg-[#F36F261A]';
        }
        
        const riskScoreText = `${Math.round(riskScore)} - ${riskLevel}`;
        
        return {
          id: person.id,
          name: person.full_name || `${person.first_name || ''} ${person.last_name || ''}`.trim(),
          contact: person.phone_number || 'N/A',
          dob: dob,
          birthPlace: person.city || 'N/A',
          region: getRegionDisplayName(person.region),
          position: person.occupation || person.job_title || 'N/A',
          appointmentDate: person.date_of_birth 
            ? new Date(person.date_of_birth).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })
            : 'N/A',
          cases: person.total_cases || person.case_count || 0,
          riskScore: riskScoreText,
          riskColor: riskColor,
          riskBg: riskBg,
          // Store full person data for details view
          fullData: person
        };
      });

      setPersons(transformedPersons);
      setTotalResults(data.total || 0);
      setTotalPages(data.total_pages || 1);
      console.log('Transformed persons:', transformedPersons.length);
    } catch (error) {
      console.error('Error loading persons:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        selectedEntity,
        selectedIndustry
      });
      setPersons([]);
      setTotalResults(0);
      setTotalPages(1);
    } finally {
      setIsLoading(false);
    }
  };

  // Load stats
  const loadStats = async () => {
    try {
      // First, get overall total to see if there's any data in the database
      let overallTotal = 0;
      try {
        const overallStats = await apiGet('/people/search?limit=1');
        overallTotal = overallStats.total || 0;
        console.log('📊 Overall total people in database:', overallTotal);
      } catch (err) {
        console.warn('Could not fetch overall stats:', err);
      }
      
      // Get total persons count (filtered by entity if selected)
      const statsParams = new URLSearchParams();
      statsParams.append('limit', '1'); // Just need the count, not the data
      
      if (selectedEntity) {
        // For Banking & Finance industry, filter by employer (bank name)
        if (selectedIndustry?.id === 'banking') {
          statsParams.append('employer', selectedEntity.name);
        } else {
          // For other industries, filter by organization
          statsParams.append('organization', selectedEntity.name);
        }
      }
      // Add region filter - convert display name to database abbreviation
      if (selectedRegion && selectedRegion !== 'All Regions') {
        const regionAbbr = getRegionAbbreviation(selectedRegion);
        if (regionAbbr) {
          statsParams.append('region', regionAbbr);
          console.log(`Stats filtering by region: ${selectedRegion} -> ${regionAbbr}`);
        }
      }
      if (selectedTown && selectedTown !== 'All Towns') {
        statsParams.append('city', selectedTown);
      }

      // Add risk filters - capitalize first letter to match database format
      if (selectedRiskLevel && selectedRiskLevel !== 'All') {
        const riskLevelValue = selectedRiskLevel.charAt(0).toUpperCase() + selectedRiskLevel.slice(1).toLowerCase();
        statsParams.append('risk_level', riskLevelValue);
        console.log(`Stats filtering by risk level: ${selectedRiskLevel} -> ${riskLevelValue}`);
      }
      if (minRiskScore && minRiskScore.trim() !== '') {
        const minScore = parseFloat(minRiskScore);
        if (!isNaN(minScore) && minScore >= 0) {
          statsParams.append('min_risk_score', minScore.toString());
        }
      }
      if (maxRiskScore && maxRiskScore.trim() !== '') {
        const maxScore = parseFloat(maxRiskScore);
        if (!isNaN(maxScore) && maxScore >= 0) {
          statsParams.append('max_risk_score', maxScore.toString());
        }
      }

      console.log('Loading filtered stats with params:', statsParams.toString());
      const statsData = await apiGet(`/people/search?${statsParams.toString()}`);
      console.log('Filtered stats response:', statsData);
      
      const filteredTotal = statsData.total || 0;
      
      setStats({
        totalPersons: filteredTotal || overallTotal, // Show filtered if available, otherwise overall
        totalCompanies: 0, // TODO: Get from companies API
        totalRelatedData: filteredTotal || overallTotal // Use filtered if available, otherwise overall
      });
      
      // If filtered is 0 but overall is > 0, log a warning
      if (filteredTotal === 0 && overallTotal > 0 && selectedEntity) {
        console.warn(`⚠️ No people found with entity filter "${selectedEntity.name}". Overall database has ${overallTotal} people. Filter may be too restrictive or people may not have employer/organization set.`);
      } else if (overallTotal === 0) {
        console.warn('⚠️ Database appears to be empty - no people found at all.');
      }
    } catch (error) {
      console.error('Error loading stats:', error);
      // Try to get overall stats as fallback
      try {
        const overallStats = await apiGet('/people/search?limit=1');
        setStats({
          totalPersons: overallStats.total || 0,
          totalCompanies: 0,
          totalRelatedData: overallStats.total || 0
        });
      } catch (fallbackError) {
        console.error('Error loading fallback stats:', fallbackError);
        setStats({
          totalPersons: 0,
          totalCompanies: 0,
          totalRelatedData: 0
        });
      }
    }
  };

  // Handle AI-powered search
  const handleAiSearch = async () => {
    if (!aiSearchQuery.trim() || isAiSearching) return;

    setShowSearchPage(false);
    setIsAiSearching(true);
    setIsLoading(true);
    setCurrentPage(1);

    try {
      const response = await fetch('/api/people/ai-search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: aiSearchQuery.trim() }),
      });

      if (!response.ok) {
        throw new Error('AI search failed');
      }

      const data = await response.json();
      
      setPersons(data.people || []);
      setTotalResults(data.total || 0);
      setTotalPages(data.total_pages || 0);
      
      // Update search query for display
      if (aiSearchQuery.trim()) {
        setSearchPersonQuery(aiSearchQuery.trim());
      }
    } catch (error) {
      console.error('Error performing AI search:', error);
      setPersons([]);
      setTotalResults(0);
      setTotalPages(0);
    } finally {
      setIsAiSearching(false);
      setIsLoading(false);
    }
  };
  
  // Fetch name suggestions
  const fetchNameSuggestions = async (query) => {
    if (query.length < 2) {
      setNameSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    try {
      const response = await fetch(`/api/people/name-suggestions?query=${encodeURIComponent(query)}&limit=10`);
      if (response.ok) {
        const data = await response.json();
        setNameSuggestions(data.suggestions || []);
        setShowSuggestions(data.suggestions && data.suggestions.length > 0);
      } else {
        setNameSuggestions([]);
        setShowSuggestions(false);
      }
    } catch (error) {
      console.error('Error fetching name suggestions:', error);
      setNameSuggestions([]);
      setShowSuggestions(false);
    }
  };

  // Handle name input change with debounce
  const handleNameChange = (e) => {
    const value = e.target.value;
    setAdvancedSearchData({...advancedSearchData, name: value});

    // Clear existing timeout
    if (suggestionsTimeout) {
      clearTimeout(suggestionsTimeout);
    }

    // Set new timeout for debounce
    if (value.length >= 2) {
      const timeout = setTimeout(() => {
        fetchNameSuggestions(value);
      }, 300); // 300ms debounce
      setSuggestionsTimeout(timeout);
    } else {
      setNameSuggestions([]);
      setShowSuggestions(false);
    }
  };

  // Handle suggestion selection
  const handleSuggestionSelect = (suggestion) => {
    setAdvancedSearchData({...advancedSearchData, name: suggestion.name});
    setNameSuggestions([]);
    setShowSuggestions(false);
  };

  // Clear form
  const handleClearForm = () => {
    setAdvancedSearchData({
      name: '',
      location: '',
      profession: '',
      databaseType: 'all',
      surnameLetter: ''
    });
    setNameSuggestions([]);
    setShowSuggestions(false);
    if (suggestionsTimeout) {
      clearTimeout(suggestionsTimeout);
      setSuggestionsTimeout(null);
    }
  };

  // Timer effect for processing page
  useEffect(() => {
    let interval = null;
    if (isProcessing && searchStartTime) {
      interval = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - searchStartTime) / 1000));
      }, 1000);
    } else {
      setElapsedTime(0);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isProcessing, searchStartTime]);

  // Simulate database search progress
  const simulateDatabaseSearch = async (databasesToSearch) => {
    // Handle empty array case
    if (!databasesToSearch || databasesToSearch.length === 0) {
      setSearchProgress(50); // Set to 50% if no databases to simulate
      return [];
    }
    
    const totalDatabases = databasesToSearch.length;
    const progressPerDatabase = 100 / totalDatabases;
    let currentProgress = 0;
    const searched = [];

    for (let i = 0; i < databasesToSearch.length; i++) {
      const db = databasesToSearch[i];
      if (!db) continue; // Skip if database option is null/undefined
      
      setCurrentDatabase(db.label);
      
      // Simulate search time (random between 1-3 seconds per database)
      const searchDelay = Math.random() * 2000 + 1000;
      await new Promise(resolve => setTimeout(resolve, searchDelay));
      
      searched.push(db);
      setSearchedDatabases([...searched]);
      
      currentProgress += progressPerDatabase;
      const newProgress = Math.min(Math.round(currentProgress), 100);
      setSearchProgress(newProgress);
    }
    
    return searched;
  };

  // Helper function to highlight search query in text
  const highlightText = (text, query) => {
    if (!text || !query || !query.trim()) return text;
    const searchQuery = query.trim();
    const regex = new RegExp(`(${searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    return parts.map((part, index) => 
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-300 dark:bg-yellow-600 px-1 rounded font-semibold">{part}</mark>
      ) : (
        part
      )
    );
  };

  // Handle advanced search from Intelius-style form
  const handleAdvancedSearch = async () => {
    console.log('handleAdvancedSearch called with databaseType:', advancedSearchData.databaseType);
    console.log('Search data:', advancedSearchData);
    
    setShowSearchPage(false);
    setIsProcessing(true);
    setIsLoading(true);
    setCurrentPage(1);
    setSearchProgress(0);
    setSearchedDatabases([]);
    setCurrentDatabase('');
    setSearchStartTime(Date.now());
    setElapsedTime(0);
    setShowRefinementModal(false);
    setRefinementQuestion('');
    setRefinementAnswer('');

    try {
      // Determine which databases to search
      let databasesToSearch = [];
      if (advancedSearchData.databaseType === 'all') {
        databasesToSearch = databaseOptions.filter(db => db.id !== 'all');
      } else if (advancedSearchData.databaseType === 'change_of_name') {
        // When change_of_name is selected, only search gazettes
        const changeOfNameOption = databaseOptions.find(db => db.id === 'change_of_name');
        if (changeOfNameOption) {
          databasesToSearch = [changeOfNameOption];
        } else {
          console.error('Change of name database option not found');
          databasesToSearch = [];
        }
      } else {
        databasesToSearch = databaseOptions.filter(db => db.id === advancedSearchData.databaseType);
      }

      // Simulate searching through databases (only if we have databases to search)
      // For "change_of_name", we'll handle progress during actual search instead
      if (databasesToSearch.length > 0 && advancedSearchData.databaseType !== 'change_of_name') {
        console.log('Starting database simulation with', databasesToSearch.length, 'database(s)');
        await simulateDatabaseSearch(databasesToSearch);
      } else if (advancedSearchData.databaseType === 'change_of_name') {
        // For change_of_name, set initial progress and mark databases as searched
        setSearchProgress(10);
        setSearchedDatabases(databasesToSearch.length > 0 ? databasesToSearch : []);
        setCurrentDatabase('');
      } else {
        // If no databases to simulate, set progress to show we're processing
        console.log('No databases to simulate, setting progress to 10%');
        setSearchProgress(10);
        setSearchedDatabases([]);
      }
      
      console.log('Database simulation complete, starting actual search...');

      // Perform search using unified search endpoint
      let unifiedResults = [];
      let totalResultsCount = 0;
      let gazetteResults = [];

      // Use unified search endpoint for all database types
      if (advancedSearchData.name && advancedSearchData.name.trim()) {
        setSearchProgress(50);
        setCurrentDatabase('Searching...');
        
        try {
          const params = new URLSearchParams({
            query: advancedSearchData.name.trim(),
            page: '1',
            limit: itemsPerPage.toString()
          });

          const apiUrl = `/persons-unified-search?${params.toString()}`;
          console.log('Searching with unified endpoint:', apiUrl);
          const data = await apiGet(apiUrl);

          unifiedResults = data.results || [];
          totalResultsCount = data.total || 0;
          console.log('Unified search results:', unifiedResults.length, 'total:', totalResultsCount);
          
          // Transform unified results to match gazette format for display
          gazetteResults = unifiedResults.map(entry => {
            const baseEntry = {
              id: entry.id,
              gazette_type: entry.source_type === 'change_of_name' ? 'CHANGE_OF_NAME' :
                           entry.source_type === 'correction_of_place_of_birth' ? 'CHANGE_OF_PLACE_OF_BIRTH' :
                           entry.source_type === 'correction_of_date_of_birth' ? 'CHANGE_OF_DATE_OF_BIRTH' :
                           entry.source_type === 'marriage_officer' ? 'APPOINTMENT_OF_MARRIAGE_OFFICERS' : '',
              person_name: entry.name,
              current_name: entry.current_name || entry.person_name || entry.officer_name || entry.name,
              gazette_number: entry.gazette_number,
              gazette_date: entry.gazette_date,
              publication_date: entry.gazette_date,
              page_number: entry.page_number,
              _matchType: entry.match_type,
              _sourceType: entry.source_type
            };
            
            // Add source-specific fields
            if (entry.source_type === 'change_of_name') {
              baseEntry.old_name = entry.old_name;
              baseEntry.new_name = entry.current_name;
              baseEntry.alias_names = entry.alias_names || [];
              baseEntry.profession = entry.profession;
            } else if (entry.source_type === 'correction_of_place_of_birth') {
              baseEntry.old_place_of_birth = entry.old_place_of_birth;
              baseEntry.new_place_of_birth = entry.new_place_of_birth;
            } else if (entry.source_type === 'correction_of_date_of_birth') {
              baseEntry.old_date_of_birth = entry.old_date_of_birth;
              baseEntry.new_date_of_birth = entry.new_date_of_birth;
            } else if (entry.source_type === 'marriage_officer') {
              baseEntry.officer_name = entry.officer_name;
              baseEntry.church = entry.church;
              baseEntry.location = entry.location;
              baseEntry.region = entry.region;
              baseEntry.appointing_authority = entry.appointing_authority;
            }
            
            return baseEntry;
          });
          
        } catch (error) {
          console.error('Error in unified search:', error);
          gazetteResults = [];
        }
      }
      
      // Update progress - search complete, now processing results
      setSearchProgress(95);
      setCurrentDatabase('');
      
      // Note: All database types now use unified search endpoint which searches:
      // - change_of_name
      // - correction_of_place_of_birth
      // - correction_of_date_of_birth
      // - marriage_officers
      // People table is no longer used in search
      
      // Build current search query for display
      const searchQueryParts = [];
      if (advancedSearchData.name) searchQueryParts.push(`Name: ${advancedSearchData.name}`);
      if (advancedSearchData.location) searchQueryParts.push(`Location: ${advancedSearchData.location}`);
      if (advancedSearchData.profession) searchQueryParts.push(`Profession: ${advancedSearchData.profession}`);
      if (advancedSearchData.databaseType && advancedSearchData.databaseType !== 'all') {
        const dbOption = databaseOptions.find(db => db.id === advancedSearchData.databaseType);
        searchQueryParts.push(`Database: ${dbOption?.label || advancedSearchData.databaseType}`);
      }
      if (advancedSearchData.surnameLetter) searchQueryParts.push(`Surname starts with: ${advancedSearchData.surnameLetter}`);
      const searchQueryText = searchQueryParts.length > 0 ? searchQueryParts.join(' • ') : 'All persons';
      setCurrentSearchQuery(searchQueryText);
      
      // Process Change of Name gazette entries: split into separate entities for Current, Old, and Alias names
      // Each name type becomes a separate searchable entity, all linked back to the primary record ID
      const expandedGazetteEntries = [];
      const searchQuery = (advancedSearchData.name || '').trim().toLowerCase();
      
      for (const gazette of gazetteResults) {
        const gazetteType = gazette.gazette_type || gazette.gazetteType || '';
        const isChangeOfName = gazetteType === 'CHANGE_OF_NAME' || gazetteType === 'change_of_name' || gazetteType === 'Change of Name';
        
        if (isChangeOfName) {
          // For Change of Name entries, create separate entities for each name type
          // If a gazette entry is returned from backend search, it means at least one name matched the search
          // So we create entities for ALL name types (current, old, alias) to ensure they all appear in results
          
          const currentName = gazette.new_name || gazette.current_name || gazette.name_value;
          const oldName = gazette.old_name;
          
          // Parse alias_names - handle array, JSON string, and double-encoded JSON string formats
          // Format can be: ["Jemimah Amponsah Akrasi"] or "["Jemimah Amponsah Akrasi"]"
          let aliasNames = [];
          if (gazette.alias_names) {
            if (Array.isArray(gazette.alias_names)) {
              // Already an array
              aliasNames = gazette.alias_names;
            } else if (typeof gazette.alias_names === 'string') {
              try {
                // Try parsing the string - it might be double-encoded like "["Jemimah Amponsah Akrasi"]"
                let parsed = JSON.parse(gazette.alias_names);
                
                // If the parsed result is still a string that looks like JSON, parse again
                if (typeof parsed === 'string' && (parsed.startsWith('[') || parsed.startsWith('"'))) {
                  try {
                    parsed = JSON.parse(parsed);
                  } catch (e2) {
                    // If second parse fails, treat the first parsed string as a single alias
                    aliasNames = [parsed];
                  }
                }
                
                // Check if the result is an array
                if (Array.isArray(parsed)) {
                  aliasNames = parsed.filter(a => a && typeof a === 'string' && a.trim());
                } else if (typeof parsed === 'string' && parsed.trim()) {
                  // Single string value
                  aliasNames = [parsed.trim()];
                }
              } catch (e) {
                // If not valid JSON, check if it's a comma-separated string
                if (gazette.alias_names.includes(',')) {
                  aliasNames = gazette.alias_names.split(',').map(a => a.trim().replace(/^["\[\]]+|["\[\]]+$/g, '')).filter(a => a);
                } else {
                  // Single alias name, clean up any brackets/quotes
                  const cleaned = gazette.alias_names.trim().replace(/^["\[\]]+|["\[\]]+$/g, '');
                  if (cleaned) {
                    aliasNames = [cleaned];
                  }
                }
              }
            }
          }
          
          // Debug log for alias names
          if (aliasNames.length > 0) {
            console.log(`Gazette ${gazette.id} has ${aliasNames.length} alias names:`, aliasNames);
          } else if (gazette.alias_names) {
            console.log(`Gazette ${gazette.id} has alias_names but couldn't parse:`, gazette.alias_names, typeof gazette.alias_names);
          }
          
          // Since this gazette entry was returned by backend search, it means the search matched
          // at least one of its names (current, old, or alias). We'll show ALL name types so that
          // old names and aliases appear in search results when they match.
          
          // 1. Current Name entity (Primary color - blue)
          if (currentName) {
            expandedGazetteEntries.push({
              ...gazette,
              _nameType: 'current',
              _displayName: currentName,
              _primaryGazetteId: gazette.id,
              _nameStatus: 'current'
            });
          }
          
          // 2. Old Name entity (Red color) - Always include if old name exists
          if (oldName) {
            expandedGazetteEntries.push({
              ...gazette,
              _nameType: 'old',
              _displayName: oldName,
              _primaryGazetteId: gazette.id,
              _nameStatus: 'old'
            });
          }
          
          // 3. Alias Name entities - one per alias (Orange color) - Always include all aliases
          aliasNames.forEach((alias, index) => {
            const aliasStr = typeof alias === 'string' ? alias : (alias.name || alias);
            if (aliasStr && aliasStr.trim()) {
              // Create a separate entity for each alias name so it appears as a searchable result
              expandedGazetteEntries.push({
                ...gazette,
                _nameType: 'alias',
                _displayName: aliasStr,
                _primaryGazetteId: gazette.id,
                _aliasIndex: index,
                _nameStatus: 'alias'
              });
            }
          });
          
          // Debug: Log expanded entries for this gazette
          if (aliasNames.length > 0) {
            console.log(`Gazette ${gazette.id} - Created ${aliasNames.length} alias entities`);
          }
        } else {
          // For non-Change of Name entries, keep as is (no splitting needed)
          expandedGazetteEntries.push(gazette);
        }
      }
      
      // Debug: Log expanded gazette entries
      console.log('Total expanded gazette entries:', expandedGazetteEntries.length);
      const aliasEntities = expandedGazetteEntries.filter(e => e._nameStatus === 'alias');
      const oldEntities = expandedGazetteEntries.filter(e => e._nameStatus === 'old');
      const currentEntities = expandedGazetteEntries.filter(e => e._nameStatus === 'current');
      console.log(`Expanded entities - Current: ${currentEntities.length}, Old: ${oldEntities.length}, Alias: ${aliasEntities.length}`);
      
      if (aliasEntities.length > 0) {
        console.log('Sample alias entities:', aliasEntities.slice(0, 3).map(e => ({
          displayName: e._displayName,
          status: e._nameStatus,
          primaryId: e._primaryGazetteId
        })));
      }
      
      // People expansion removed - no longer using people table
      const expandedPersonEntries = [];
      
      // Store gazette entries (expanded for change of name)
      setAllPersons([]); // No longer using people table
      setPersons([]); // No longer using people table
      setGazetteEntries(expandedGazetteEntries);
      
      // Calculate total results - only from gazette entries
      const finalTotalResults = expandedGazetteEntries.length;
      
      setTotalResults(finalTotalResults);
      setHasMore(expandedGazetteEntries.length >= 50);
      
      // Track database result counts - updated after expandedGazetteEntries is created
      const dbCounts = {};
      if (advancedSearchData.databaseType === 'all') {
        // For "all" search, initialize counts (will be updated after mapping persons to databases)
        searchedDatabases.forEach(db => {
          dbCounts[db.id] = 0; // Will be updated after mapping
        });
        // Add gazette entries count to change_of_name
        if (expandedGazetteEntries.length > 0) {
          dbCounts['change_of_name'] = (dbCounts['change_of_name'] || 0) + expandedGazetteEntries.length;
        }
      } else if (advancedSearchData.databaseType === 'change_of_name') {
        // For "change_of_name" search, count includes both expanded people and expanded gazette entries
        dbCounts['change_of_name'] = expandedPersonEntries.length + expandedGazetteEntries.length;
      } else if (advancedSearchData.databaseType === 'change_of_pob') {
        // For "change_of_pob" search, count only expanded correction_of_place_of_birth entries
        dbCounts['change_of_pob'] = expandedGazetteEntries.length;
      } else if (advancedSearchData.databaseType === 'change_of_dob') {
        // For "change_of_dob" search, count only expanded correction_of_date_of_birth entries
        dbCounts['change_of_dob'] = expandedGazetteEntries.length;
      } else if (advancedSearchData.databaseType === 'marriage_officers') {
        // For "marriage_officers" search, count only expanded marriage_officers entries
        dbCounts['marriage_officers'] = expandedGazetteEntries.length;
      } else {
        const selectedDb = databaseOptions.find(db => db.id === advancedSearchData.databaseType);
        if (selectedDb) {
          dbCounts[selectedDb.id] = totalResultsCount;
        }
      }
      setDatabaseResultCounts(dbCounts);
      
      // Store search params for infinite scroll
      setSearchParams({
        name: advancedSearchData.name,
        location: advancedSearchData.location,
        profession: advancedSearchData.profession,
        databaseType: advancedSearchData.databaseType,
        surnameLetter: advancedSearchData.surnameLetter,
        sortBy: sortBy,
        sortOrder: sortOrder
      });
      
      // Generate AI overview (for gazette entries only)
      if (totalResultsCount > 0 && expandedGazetteEntries.length > 0) {
        const overview = `Found ${totalResultsCount} record${totalResultsCount !== 1 ? 's' : ''} matching your search in ${searchedDatabases.length > 0 ? searchedDatabases.join(', ') : 'gazette entries'}.`;
        setAiOverview(overview);
      } else {
        setAiOverview('');
      }

      // Name statuses are now determined from the gazette entries directly
      // No need for additional processing since all data comes from gazette entries
      setPersonNameStatuses({});
      setPersonOldNames({});
      setPersonAliases({});
      
      // Update searchedDatabases to include the searched database type
      if (advancedSearchData.databaseType && advancedSearchData.databaseType !== 'all') {
        const searchedDbOption = databaseOptions.find(db => db.id === advancedSearchData.databaseType);
        if (searchedDbOption && searchedDatabases.length === 0) {
          setSearchedDatabases([searchedDbOption]);
        }
      }
      
      // Complete progress - set to 100% after all processing is done
      setSearchProgress(100);
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Use finalTotalResults for the check (accounts for expanded gazette entries)
      setIsProcessing(false);
      setIsLoading(false);
      
      if (finalTotalResults === 0) {
        // No results - show refinement modal to help user refine their search
        setRefinementQuestion('No results found. Would you like to refine your search by adding more specific criteria? (e.g., location, profession, etc.)');
        setShowRefinementModal(true);
        setShowSearchPage(false);
      } else if (finalTotalResults > 1) {
        // Multiple results - show modal first
        setShowMultipleResultsModal(true);
        setShowSearchPage(false);
      } else {
        // Single result - show results page directly
        setShowResultsPage(true);
        setShowSearchPage(false);
      }
    } catch (error) {
      console.error('Error performing advanced search:', error);
      setPersons([]);
      setTotalResults(0);
      setTotalPages(0);
      setIsProcessing(false);
      setIsLoading(false);
    }
  };

  // Handle multiple results modal - refine search
  const handleRefineSearch = () => {
    setShowMultipleResultsModal(false);
    setShowResultsPage(false);
    setShowSearchPage(true);
    setIsProcessing(false);
    setIsLoading(false);
    // Clear results so form is the focus, but keep form data so user can refine
    setPersons([]);
    setTotalResults(0);
    // Scroll to top to show the search form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle multiple results modal - skip to results
  const handleSkipToResults = async () => {
    setShowMultipleResultsModal(false);
    setShowResultsPage(true);
    setShowSearchPage(false); // Hide search page when showing results
    setIsProcessing(false);
    setIsLoading(false);
    
    // Generate AI overview if not already generated
    if (persons.length > 0 && !aiOverview) {
      const searchQueryText = currentSearchQuery || 'All persons';
      await generateSearchOverview(persons, searchQueryText, searchedDatabases);
    }

    // Determine name statuses for change of name entries if not already done
    if ((advancedSearchData.databaseType === 'change_of_name' || advancedSearchData.databaseType === 'all') && Object.keys(personNameStatuses).length === 0) {
      const statuses = {};
      for (const person of persons) {
        const status = await getNameStatus(person);
        if (status) {
          statuses[person.id] = status;
        }
      }
      setPersonNameStatuses(statuses);
    }
  };

  // Generate AI overview of search results
  const generateSearchOverview = async (results, searchQuery, databases) => {
    try {
      // Create a summary of results for AI analysis
      const resultsSummary = results.slice(0, 10).map((person, idx) => {
        return `${idx + 1}. ${person.full_name || `${person.first_name || ''} ${person.last_name || ''}`.trim() || 'Unknown'} - ${person.occupation || 'N/A'} - ${person.city || person.region || 'Location not specified'}`;
      }).join('\n');
      
      const databasesList = databases.map(db => db.label).join(', ');
      
      const prompt = `Generate a brief, professional overview (2-3 sentences) of these search results:

Search Query: ${searchQuery}
Databases Searched: ${databasesList}
Number of Results: ${results.length}
Sample Results:
${resultsSummary}

Provide a concise summary highlighting:
1. What types of people were found
2. Key patterns or characteristics
3. Geographic or professional distribution if notable

Keep it brief and informative (maximum 150 words).`;

      try {
        const response = await fetch('/api/ai/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: prompt,
            case_id: null, // No specific case
          }),
        });

        if (response.ok) {
          const data = await response.json();
          const overview = data.response || data.message || data.ai_response || '';
          if (overview) {
            setAiOverview(overview);
            return;
          }
        }
      } catch (apiError) {
        console.log('AI overview API not available, using fallback');
      }
      
      // Fallback to a simple summary if AI fails or is not available
      const professions = [...new Set(results.map(p => p.occupation).filter(Boolean))];
      const locations = [...new Set(results.map(p => p.city || p.region).filter(Boolean))];
      let overview = `Found ${results.length} result${results.length !== 1 ? 's' : ''} matching your search criteria across ${databases.length} database${databases.length !== 1 ? 's' : ''}: ${databasesList}.`;
      if (professions.length > 0) {
        overview += ` Results include ${professions.slice(0, 3).join(', ')}${professions.length > 3 ? ` and ${professions.length - 3} more profession${professions.length - 3 > 1 ? 's' : ''}` : ''}.`;
      }
      if (locations.length > 0) {
        overview += ` Geographic distribution spans ${locations.slice(0, 3).join(', ')}${locations.length > 3 ? ` and ${locations.length - 3} more location${locations.length - 3 > 1 ? 's' : ''}` : ''}.`;
      }
      setAiOverview(overview);
    } catch (error) {
      console.error('Error generating AI overview:', error);
      // Fallback summary
      const databasesList = databases.map(db => db.label).join(', ');
      setAiOverview(`Found ${results.length} result${results.length !== 1 ? 's' : ''} matching your search criteria across ${databases.length} database${databases.length !== 1 ? 's' : ''}: ${databasesList}.`);
    }
  };

  // Fetch gazettes for a person
  const fetchPersonGazettes = async (personId) => {
    try {
      const response = await fetch(`/api/gazette/person/${personId}?limit=100`);
      if (response.ok) {
        const data = await response.json();
        return Array.isArray(data) ? data : (data.gazettes || data.results || []);
      }
      return [];
    } catch (error) {
      console.error('Error fetching gazettes:', error);
      return [];
    }
  };

  // Map persons to their database sources by checking linked gazette entries
  const mapPersonsToDatabases = async (persons) => {
    const personDbMap = {};
    
    // Database type mapping from gazette_type to database option id
    const gazetteTypeToDbId = {
      'CHANGE_OF_NAME': 'change_of_name',
      'change_of_name': 'change_of_name',
      'Change of Name': 'change_of_name',
      'CHANGE_OF_DOB': 'change_of_dob',
      'change_of_dob': 'change_of_dob',
      'Change of Date of Birth': 'change_of_dob',
      'CHANGE_OF_POB': 'change_of_pob',
      'change_of_pob': 'change_of_pob',
      'Change of Place of Birth': 'change_of_pob',
      'MARRIAGE_OFFICERS': 'marriage_officers',
      'marriage_officers': 'marriage_officers',
      'Marriage Officers': 'marriage_officers',
      'COMPANY_OFFICERS': 'company_officers',
      'company_officers': 'company_officers',
      'Company Officers': 'company_officers',
      'COURT': 'court',
      'court': 'court',
      'Court': 'court',
    };

    // Process persons to determine their database sources
    for (const person of persons) {
      const databases = new Set();
      
      // Fetch gazettes linked to this person via person_id foreign key
      const gazettes = await fetchPersonGazettes(person.id);
      
      // Map gazette types to database sources
      for (const gazette of gazettes) {
        const gazetteType = gazette.gazette_type || gazette.gazetteType || '';
        const dbId = gazetteTypeToDbId[gazetteType];
        if (dbId) {
          databases.add(dbId);
        }
      }
      
      // If person has no gazettes but we're searching specific database, assume they're from that database
      if (databases.size === 0 && advancedSearchData.databaseType && advancedSearchData.databaseType !== 'all') {
        databases.add(advancedSearchData.databaseType);
      }
      
      // If searching "all" and no specific database found, add all searched databases
      if (databases.size === 0 && advancedSearchData.databaseType === 'all') {
        searchedDatabases.forEach(db => databases.add(db.id));
      }
      
      personDbMap[person.id] = Array.from(databases);
    }
    
    setPersonDatabaseMap(personDbMap);
    
    // Update database result counts based on actual mapping (realtime stats)
    const realtimeCounts = {};
    searchedDatabases.forEach(db => {
      const count = persons.filter(p => {
        const personDatabases = personDbMap[p.id] || [];
        return personDatabases.includes(db.id);
      }).length;
      realtimeCounts[db.id] = count;
    });
    setDatabaseResultCounts(realtimeCounts);
  };

  // Filter persons by selected database source
  const handleDatabaseFilter = (databaseId) => {
    if (selectedDatabaseFilter === databaseId) {
      // If clicking the same database, clear the filter
      setSelectedDatabaseFilter(null);
      setPersons(allPersons);
      setTotalResults(allPersons.length + gazetteEntries.length);
      setHasMore(true);
    } else {
      // Filter persons by database source
      setSelectedDatabaseFilter(databaseId);
      const filtered = allPersons.filter(person => {
        const personDatabases = personDatabaseMap[person.id] || [];
        return personDatabases.includes(databaseId);
      });
      // Also filter gazette entries if filtering by change_of_name
      const filteredGazettes = databaseId === 'change_of_name' 
        ? gazetteEntries.filter(g => {
            const type = g.gazette_type || g.gazetteType || '';
            return type === 'CHANGE_OF_NAME' || type === 'change_of_name' || type === 'Change of Name';
          })
        : [];
      setPersons(filtered);
      setTotalResults(filtered.length + filteredGazettes.length);
      setHasMore(false); // Disable infinite scroll when filtering
    }
  };

  // Load more results (infinite scroll)
  const loadMoreResults = async () => {
    if (isLoadingMore || !hasMore || !searchParams) return;
    
    // If searching only change_of_name, don't load more people (only gazettes were searched)
    if (searchParams.databaseType === 'change_of_name') {
      setHasMore(false); // No more results to load for gazette-only searches
      return;
    }

    setIsLoadingMore(true);
    const nextPage = Math.floor(allPersons.length / itemsPerPage) + 1;

    try {
      // Load more people (only for "all" database searches)
      const params = new URLSearchParams({
        page: nextPage.toString(),
        limit: itemsPerPage.toString(),
        sort_by: searchParams.sortBy,
        sort_order: searchParams.sortOrder
      });

      if (searchParams.name) params.append('query', searchParams.name.trim());
      if (searchParams.location) params.append('city', searchParams.location);
      if (searchParams.profession) params.append('occupation', searchParams.profession);
      if (searchParams.databaseType && searchParams.databaseType !== 'all') {
        params.append('database_type', searchParams.databaseType);
      }
      if (searchParams.surnameLetter) {
        params.append('last_name', `${searchParams.surnameLetter}%`);
      }

      const apiUrl = `/people/search?${params.toString()}`;
      let data = await apiGet(apiUrl);
      const newPeopleResults = data.people || [];

      if (newPeopleResults.length > 0) {
        setAllPersons(prev => [...prev, ...newPeopleResults]);
        setPersons(prev => [...prev, ...newPeopleResults]);

        // Map new persons to databases
        await mapPersonsToDatabases(newPeopleResults);

        // Update name statuses for new persons
        if (searchParams.databaseType === 'change_of_name' || searchParams.databaseType === 'all') {
          const statuses = { ...personNameStatuses };
          for (const person of newPeopleResults) {
            const status = await getNameStatus(person);
            if (status) {
              statuses[person.id] = status;
            }
          }
          setPersonNameStatuses(statuses);
        }

        // Check if there are more results
        const totalLoaded = allPersons.length + newPeopleResults.length;
        const totalCount = data.total || 0;
        setHasMore(newPeopleResults.length >= itemsPerPage && totalLoaded < totalCount);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error('Error loading more results:', error);
      setHasMore(false);
    } finally {
      setIsLoadingMore(false);
    }
  };

  // Intersection Observer for infinite scroll
  useEffect(() => {
    if (!showResultsPage || !hasMore || isLoadingMore || selectedDatabaseFilter) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoadingMore && !selectedDatabaseFilter) {
          loadMoreResults();
        }
      },
      { threshold: 0.1 }
    );

    const sentinel = document.getElementById('infinite-scroll-sentinel');
    if (sentinel) {
      observer.observe(sentinel);
    }

    return () => {
      if (sentinel) {
        observer.unobserve(sentinel);
      }
    };
  }, [showResultsPage, hasMore, isLoadingMore, selectedDatabaseFilter]);

  // Determine name status for change of name entries from gazette_entries table
  // The gazette_entries table has person_id foreign key linking to people table
  const getNameStatus = async (person) => {
    // Only check for change_of_name database entries (gazettes_tries = CHANGE_OF_NAME type)
    if (advancedSearchData.databaseType !== 'change_of_name' && advancedSearchData.databaseType !== 'all') {
      return null;
    }

    try {
      // Fetch gazettes for this person using person_id foreign key
      const gazettes = await fetchPersonGazettes(person.id);
      
      // Filter for change of name gazettes (gazettes_tries where type = CHANGE_OF_NAME)
      const changeOfNameGazettes = gazettes.filter(g => {
        const type = g.gazette_type || g.gazetteType || '';
        return type === 'CHANGE_OF_NAME' || type === 'change_of_name' || type === 'Change of Name';
      });
      
      if (changeOfNameGazettes.length === 0) {
        return null;
      }

      const currentDisplayName = person.full_name || `${person.first_name || ''} ${person.last_name || ''}`.trim();
      if (!currentDisplayName) {
        return null;
      }
      
      // Get search query to check if it matches an alias
      const searchQuery = (advancedSearchData.name || '').trim().toLowerCase();
      
      // Check each gazette entry to determine name status
      for (const gazette of changeOfNameGazettes) {
        // Check if current name matches the new_name (current name) in gazette
        const newName = gazette.new_name || gazette.newName || '';
        if (newName && newName.toLowerCase().trim() === currentDisplayName.toLowerCase().trim()) {
          return { status: 'current', label: 'Current Name' };
        }
        
        // Check if current name matches the old_name in gazette
        const oldName = gazette.old_name || gazette.oldName || '';
        if (oldName && oldName.toLowerCase().trim() === currentDisplayName.toLowerCase().trim()) {
          return { status: 'old', label: 'Old Name' };
        }
        
        // Check if current name is in alias_names array OR if search query matches an alias
        const aliasNames = gazette.alias_names || gazette.aliasNames || [];
        if (Array.isArray(aliasNames) && aliasNames.length > 0) {
          const isAlias = aliasNames.some(alias => {
            const aliasStr = typeof alias === 'string' ? alias : (alias.name || alias);
            if (!aliasStr) return false;
            const aliasLower = aliasStr.toLowerCase().trim();
            // Check if current display name matches alias OR if search query matches alias
            return aliasLower === currentDisplayName.toLowerCase().trim() || 
                   (searchQuery && aliasLower.includes(searchQuery));
          });
          if (isAlias) {
            return { status: 'alias', label: 'Alias Name' };
          }
        }
      }

      // If name doesn't match any specific status but person has change of name gazettes
      // Check if it matches new_name (current name) across all gazettes
      const hasMatchingNewName = changeOfNameGazettes.some(g => {
        const newName = g.new_name || g.newName || '';
        return newName && newName.toLowerCase().trim() === currentDisplayName.toLowerCase().trim();
      });
      
      if (hasMatchingNewName) {
        return { status: 'current', label: 'Current Name' };
      }

      // Check if name is in person's previous_names (which might indicate it's an old name or alias)
      const previousNames = person.previous_names || [];
      if (Array.isArray(previousNames) && previousNames.length > 0) {
        const isInPreviousNames = previousNames.some(prevName => {
          const prevNameStr = typeof prevName === 'string' ? prevName : (prevName.name || prevName);
          return prevNameStr && prevNameStr.toLowerCase().trim() === currentDisplayName.toLowerCase().trim();
        });
        if (isInPreviousNames) {
          // It's likely an old name or alias
          return { status: 'old', label: 'Old Name' };
        }
      }

      // Default: if we can't determine from gazette entries, return null
      return null;
    } catch (error) {
      console.error('Error determining name status:', error);
      return null;
    }
  };

  // Open report for a person
  const handleOpenReport = async (person) => {
    setSelectedPersonForReport(person);
    // Only fetch gazettes if person has an id and is not a gazette-only entry
    if (person.id && !person._isGazetteEntry) {
      try {
    const gazettes = await fetchPersonGazettes(person.id);
    setPersonGazettes(gazettes);
      } catch (error) {
        console.error('Error fetching person gazettes:', error);
        // If fetching fails, set empty array
        setPersonGazettes([]);
      }
    } else {
      // For gazette-only entries, personGazettes should already be set
      // But if not, use empty array
      if (!personGazettes || personGazettes.length === 0) {
        setPersonGazettes([]);
      }
    }
  };

  // Handle opening report from gazette entry (when no person_id)
  const handleOpenReportFromGazette = (gazette) => {
    // Create a person-like object from the gazette entry for the report
    const gazettePerson = {
      id: gazette.id,
      full_name: gazette.person_name || gazette.current_name || gazette.officer_name || 'Unknown',
      first_name: (gazette.person_name || gazette.current_name || gazette.officer_name || '').split(' ')[0] || '',
      last_name: (gazette.person_name || gazette.current_name || gazette.officer_name || '').split(' ').slice(1).join(' ') || '',
      address: gazette.address || '',
      city: gazette.location || '',
      region: gazette.location || '',
      occupation: gazette.profession || '',
      profession: gazette.profession || '',
      gender: gazette.gender || '',
      _isGazetteEntry: true, // Flag to indicate this is a gazette-only entry
      _gazetteEntry: gazette // Store original gazette entry
    };
    
    setSelectedPersonForReport(gazettePerson);
    // For gazette-only entries, use the gazette entry itself as the "gazette" list
    setPersonGazettes([gazette]);
  };

  // Close report
  const handleCloseReport = () => {
    setSelectedPersonForReport(null);
    setPersonGazettes([]);
  };

  // Print report
  const handlePrintReport = () => {
    const printWindow = window.open('', '_blank');
    const reportContent = generateReportHTML(selectedPersonForReport, personGazettes);
    printWindow.document.write(reportContent);
    printWindow.document.close();
    printWindow.print();
  };

  // Generate report HTML with Juridence branding
  const generateReportHTML = (person, gazettes) => {
    if (!person) return '';
    
    const previousNames = person.previous_names || [];
    const aliases = Array.isArray(previousNames) ? previousNames : [];
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Person Report - ${person.full_name || 'Unknown'}</title>
        <style>
          @media print {
            @page { margin: 1cm; }
          }
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            color: #333;
            line-height: 1.6;
            margin: 0;
            padding: 20px;
          }
          .header {
            border-bottom: 3px solid #022658;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          .logo {
            font-size: 24px;
            font-weight: bold;
            color: #022658;
            margin-bottom: 10px;
          }
          .report-title {
            font-size: 28px;
            font-weight: bold;
            color: #022658;
            margin: 20px 0;
          }
          .section {
            margin-bottom: 30px;
            page-break-inside: avoid;
          }
          .section-title {
            font-size: 18px;
            font-weight: bold;
            color: #022658;
            border-bottom: 2px solid #022658;
            padding-bottom: 5px;
            margin-bottom: 15px;
          }
          .info-grid {
            display: grid;
            grid-template-columns: 200px 1fr;
            gap: 10px 20px;
            margin-bottom: 15px;
          }
          .info-label {
            font-weight: bold;
            font-size: 14px;
            color: #374151;
          }
          .info-value {
            color: #111827;
            font-size: 15px;
          }
          .name-current {
            color: #2563eb;
            font-weight: 600;
          }
          .name-alias {
            color: #0ea5e9;
            font-weight: 600;
          }
          .name-old {
            color: #dc2626;
            font-weight: 600;
          }
          .aliases-list {
            list-style: none;
            padding: 0;
            margin: 10px 0;
          }
          .aliases-list li {
            padding: 5px 0;
            border-bottom: 1px solid #eee;
          }
          .gazette-entry {
            border: 1px solid #ddd;
            border-radius: 5px;
            padding: 15px;
            margin-bottom: 15px;
            background: #f9f9f9;
          }
          .gazette-title {
            font-weight: bold;
            color: #022658;
            margin-bottom: 10px;
          }
          .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
            text-align: center;
            color: #666;
            font-size: 12px;
          }
          .print-button {
            display: none;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">JURIDENCE</div>
          <div class="report-title">Personal Report of ${person.full_name || `${person.first_name || ''} ${person.last_name || ''}`.trim() || 'Unknown Person'}</div>
          <div style="color: #666;">Generated: ${new Date().toLocaleString()}</div>
        </div>

        <div class="section">
          <div class="section-title">Personal Information</div>
          <div class="info-grid">
            <div class="info-label">Full Name:</div>
            <div class="info-value name-current">${person.full_name || 'N/A'}</div>
            
            ${person.first_name ? `<div class="info-label">First Name:</div><div class="info-value">${person.first_name}</div>` : ''}
            ${person.last_name ? `<div class="info-label">Last Name:</div><div class="info-value">${person.last_name}</div>` : ''}
            
            ${aliases.length > 0 ? `
              <div class="info-label">Previous Names / Aliases:</div>
              <div class="info-value">
                <ul class="aliases-list">
                  ${aliases.map(alias => `<li class="name-alias">${alias}</li>`).join('')}
                </ul>
              </div>
            ` : ''}
            
            ${person.id_number ? `<div class="info-label">ID Number:</div><div class="info-value">${person.id_number}</div>` : ''}
            ${person.date_of_birth ? `<div class="info-label">Date of Birth:</div><div class="info-value">${new Date(person.date_of_birth).toLocaleDateString()}</div>` : ''}
            ${person.gender ? `<div class="info-label">Gender:</div><div class="info-value">${person.gender}</div>` : ''}
            ${person.nationality ? `<div class="info-label">Nationality:</div><div class="info-value">${person.nationality}</div>` : ''}
          </div>
        </div>

        <div class="section">
          <div class="section-title">Contact & Location</div>
          <div class="info-grid">
            ${person.address ? `<div class="info-label">Address:</div><div class="info-value">${person.address}</div>` : ''}
            ${person.city ? `<div class="info-label">City:</div><div class="info-value">${person.city}</div>` : ''}
            ${person.region ? `<div class="info-label">Region:</div><div class="info-value">${person.region}</div>` : ''}
            ${person.phone_number ? `<div class="info-label">Phone:</div><div class="info-value">${person.phone_number}</div>` : ''}
            ${person.email ? `<div class="info-label">Email:</div><div class="info-value">${person.email}</div>` : ''}
          </div>
        </div>

        <div class="section">
          <div class="section-title">Professional Information</div>
          <div class="info-grid">
            ${(person.occupation || person.profession) ? `<div class="info-label">Profession:</div><div class="info-value">${person.profession || person.occupation}</div>` : ''}
            ${person.employer ? `<div class="info-label">Employer:</div><div class="info-value">${person.employer}</div>` : ''}
            ${person.organization ? `<div class="info-label">Organization:</div><div class="info-value">${person.organization}</div>` : ''}
          </div>
        </div>

        ${gazettes.length > 0 ? `
          <div class="section">
            <div class="section-title">Linked Gazette Entries (${gazettes.length})</div>
            ${gazettes.map(gazette => {
              const currentName = gazette.new_name || gazette.current_name || gazette.name_value;
              const oldName = gazette.old_name;
              const aliasNames = Array.isArray(gazette.alias_names) ? gazette.alias_names : [];
              
              return `
              <div class="gazette-entry">
                <div class="gazette-title">Gazette ${gazette.gazette_number || gazette.id || 'N/A'}</div>
                <div class="info-grid">
                  ${currentName ? `<div class="info-label">Current Name:</div><div class="info-value name-current">${currentName}</div>` : ''}
                  ${oldName ? `<div class="info-label">Old Name:</div><div class="info-value name-old">${oldName}</div>` : ''}
                  ${aliasNames.length > 0 ? `<div class="info-label">Alias Names:</div><div class="info-value">${aliasNames.map(a => `<span class="name-alias">${a}</span>`).join(', ')}</div>` : ''}
                  ${gazette.gazette_type ? `<div class="info-label">Type:</div><div class="info-value">${gazette.gazette_type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</div>` : ''}
                  ${gazette.gender ? `<div class="info-label">Gender:</div><div class="info-value">${gazette.gender}</div>` : ''}
                  ${gazette.profession ? `<div class="info-label">Profession:</div><div class="info-value">${gazette.profession}</div>` : ''}
                  ${gazette.address ? `<div class="info-label">Address:</div><div class="info-value">${gazette.address}</div>` : ''}
                  ${gazette.item_number ? `<div class="info-label">Item Number:</div><div class="info-value">${gazette.item_number}</div>` : ''}
                  ${gazette.gazette_number ? `<div class="info-label">Gazette Number:</div><div class="info-value">${gazette.gazette_number}</div>` : ''}
                  ${gazette.gazette_date ? `<div class="info-label">Gazette Date:</div><div class="info-value">${new Date(gazette.gazette_date).toLocaleDateString()}</div>` : ''}
                  ${(gazette.gazette_page || gazette.page_number) ? `<div class="info-label">Page Number:</div><div class="info-value">${gazette.gazette_page || gazette.page_number}</div>` : ''}
                  ${gazette.remarks ? `<div class="info-label">Remarks:</div><div class="info-value">${gazette.remarks}</div>` : ''}
                  ${gazette.source ? `<div class="info-label">Source:</div><div class="info-value">${gazette.source}</div>` : ''}
                  ${gazette.court_location ? `<div class="info-label">Court Location:</div><div class="info-value">${gazette.court_location}</div>` : ''}
                  ${gazette.jurisdiction ? `<div class="info-label">Jurisdiction:</div><div class="info-value">${gazette.jurisdiction}</div>` : ''}
                  ${(gazette.gazette_number || gazette.gazette_date || gazette.item_number) ? `
                    <div class="info-label">Source Details:</div>
                    <div class="info-value">
                      ${gazette.gazette_number ? `Gazette Number: ${gazette.gazette_number}` : ''}
                      ${gazette.gazette_date ? `${gazette.gazette_number ? ', ' : ''}Gazette Date: ${new Date(gazette.gazette_date).toLocaleDateString()}` : ''}
                      ${gazette.item_number ? `${gazette.gazette_number || gazette.gazette_date ? ', ' : ''}Item Number: ${gazette.item_number}` : ''}
                    </div>
                  ` : ''}
                </div>
              </div>
            `;
            }).join('')}
          </div>
        ` : ''}

        ${person.notes ? `
          <div class="section">
            <div class="section-title">Additional Notes</div>
            <div>${person.notes}</div>
          </div>
        ` : ''}

        <div class="footer">
          <div>Report generated by Juridence System</div>
          <div>© ${new Date().getFullYear()} Juridence. All rights reserved.</div>
        </div>
      </body>
      </html>
    `;
  };

  // Handle refinement modal response
  const handleRefinementSubmit = () => {
    modalResolvedRef.current = true;
    setShowRefinementModal(false);
    // Return to search page so user can refine their search
    setShowSearchPage(true);
    setShowResultsPage(false);
    // Refinement answer is stored in state and will be included in search
  };

  // Handle refinement modal skip
  const handleRefinementSkip = () => {
    modalResolvedRef.current = true;
    setRefinementAnswer('');
    setShowRefinementModal(false);
    // Return to search page so user can refine their search
    setShowSearchPage(true);
    setShowResultsPage(false);
  };

  // Handle search result report submission
  const handleSubmitSearchReport = async () => {
    if (!searchResultReportMessage.trim()) {
      alert('Please provide details about why you are not satisfied with the search results.');
      return;
    }

    setIsSubmittingSearchReport(true);
    try {
      const userData = JSON.parse(localStorage.getItem('userData') || '{}');
      const reportData = {
        full_name: userData.full_name || userData.name || 'Unknown User',
        email: userData.email || 'unknown@example.com',
        phone: userData.phone_number || userData.phone || '0000000000',
        organization: userData.organization || 'N/A',
        position: userData.position || null,
        message: `Search Results Report:\n\nSearch Query: ${currentSearchQuery || 'N/A'}\nResults Found: ${totalResults}\n\nIssue Description:\n${searchResultReportMessage}`,
        type: 'support_request',
        status: 'pending'
      };

      await apiPost('/contact-request', reportData, { includeAuth: false });
      setSuccessNotification('Your report has been submitted successfully. The admin will review it soon.');
      setShowSearchResultReportModal(false);
      setSearchResultReportMessage('');
    } catch (error) {
      console.error('Error submitting search report:', error);
      alert('Failed to submit report. Please try again later.');
    } finally {
      setIsSubmittingSearchReport(false);
    }
  };

  // Handle complaint/support request submission from report modal
  const handleSubmitComplaint = async () => {
    if (!complaintMessage.trim()) {
      alert('Please provide details about your complaint or support request.');
      return;
    }

    setIsSubmittingComplaint(true);
    try {
      const userData = JSON.parse(localStorage.getItem('userData') || '{}');
      const reportPerson = selectedPersonForReport;
      const complaintData = {
        full_name: userData.full_name || userData.name || 'Unknown User',
        email: userData.email || 'unknown@example.com',
        phone: userData.phone_number || userData.phone || '0000000000',
        organization: userData.organization || 'N/A',
        position: userData.position || null,
        message: `Complaint/Support Request${complaintSubject ? ` - ${complaintSubject}` : ''}:\n\nReport Details:\nPerson: ${reportPerson?.full_name || 'N/A'}\nPerson ID: ${reportPerson?.id || 'N/A'}\n\n${complaintMessage}`,
        type: 'support_request',
        status: 'pending'
      };

      await apiPost('/contact-request', complaintData, { includeAuth: false });
      setSuccessNotification('Your complaint/support request has been submitted successfully. The admin will review it soon.');
      setShowComplaintModal(false);
      setComplaintMessage('');
      setComplaintSubject('');
    } catch (error) {
      console.error('Error submitting complaint:', error);
      alert('Failed to submit complaint. Please try again later.');
    } finally {
      setIsSubmittingComplaint(false);
    }
  };

  // Cleanup suggestions timeout on unmount
  useEffect(() => {
    return () => {
      if (suggestionsTimeout) {
        clearTimeout(suggestionsTimeout);
      }
    };
  }, [suggestionsTimeout]);

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (selectedEntity) {
        setCurrentPage(1); // Reset to first page on search
        loadPersons();
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchPersonQuery, selectedRegion, selectedTown, sortBy, sortOrder, currentPage, selectedEntity, selectedRiskLevel, minRiskScore, maxRiskScore, selectedCaseTypes]);

  // Load data when entity is selected or filters change
  useEffect(() => {
    if (selectedEntity) {
      loadPersons();
      loadStats();
    } else {
      // If no entity selected, still load stats to show overall count
      loadStats();
    }
  }, [selectedEntity, currentPage]);

  const handleSavePerson = async (personData) => {
    console.log('Person saved:', personData);
    // Show success notification with person name
    const personName = personData?.createdPerson?.full_name || personData?.name || 'Person';
    setSuccessNotification(`Person "${personName}" has been created successfully!`);
    setShowAddForm(false);
    // Reload persons after saving
    await loadPersons();
    await loadStats();
    
    // Auto-dismiss notification after 5 seconds
    setTimeout(() => {
      setSuccessNotification(null);
    }, 5000);
  };

  const handleSelectIndustry = (industry) => {
    setSelectedIndustry(industry);
    setSelectedEntity(null);
    setCurrentPage(1);
  };

  const handleSelectEntity = (entity) => {
    setSelectedEntity(entity);
    setCurrentPage(1);
  };

  const handleSortChange = (sortValue) => {
    if (sortValue.endsWith('_desc')) {
      setSortBy(sortValue.replace('_desc', ''));
      setSortOrder('desc');
    } else {
      setSortBy(sortValue);
      setSortOrder('asc');
    }
    setShowSortDropdown(false);
    setCurrentPage(1);
  };

  const handleRegionChange = (region) => {
    setSelectedRegion(region);
    setShowRegionDropdown(false);
    setCurrentPage(1);
  };

  const handleTownChange = (town) => {
    setSelectedTown(town);
    setShowTownDropdown(false);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleGoToPage = () => {
    const page = parseInt(pageInputValue);
    if (page >= 1 && page <= totalPages) {
      handlePageChange(page);
    } else {
      setPageInputValue(currentPage.toString());
    }
  };

  // Update page input when current page changes
  useEffect(() => {
    setPageInputValue(currentPage.toString());
  }, [currentPage]);

  // Generate pagination buttons
  const getPaginationButtons = () => {
    const buttons = [];
    const maxVisible = 7;
    
    if (totalPages <= maxVisible) {
      // Show all pages if total is less than max visible
      for (let i = 1; i <= totalPages; i++) {
        buttons.push(i);
      }
    } else {
      // Show first page
      buttons.push(1);
      
      if (currentPage > 3) {
        buttons.push('...');
      }
      
      // Show pages around current page
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      
      for (let i = start; i <= end; i++) {
        buttons.push(i);
      }
      
      if (currentPage < totalPages - 2) {
        buttons.push('...');
      }
      
      // Show last page
      buttons.push(totalPages);
    }
    
    return buttons;
  };

  // Calculate display range
  const startIndex = (currentPage - 1) * itemsPerPage + 1;
  const endIndex = Math.min(currentPage * itemsPerPage, totalResults);

  // Fetch all data for export (with current filters)
  const fetchAllDataForExport = async () => {
    try {
      const params = new URLSearchParams({
        page: '1',
        limit: '10000', // Large limit to get all data
        sort_by: sortBy,
        sort_order: sortOrder
      });

      // Add search query
      if (searchPersonQuery.trim()) {
        params.append('query', searchPersonQuery.trim());
      }

      // Add region filter - convert display name to database abbreviation
      if (selectedRegion && selectedRegion !== 'All Regions') {
        const regionAbbr = getRegionAbbreviation(selectedRegion);
        if (regionAbbr) {
          params.append('region', regionAbbr);
          console.log(`Filtering by region: ${selectedRegion} -> ${regionAbbr}`);
        }
      }

      // Add city/town filter
      if (selectedTown && selectedTown !== 'All Towns') {
        params.append('city', selectedTown);
      }

      // Add risk filters - capitalize first letter to match database format
      if (selectedRiskLevel && selectedRiskLevel !== 'All') {
        const riskLevelValue = selectedRiskLevel.charAt(0).toUpperCase() + selectedRiskLevel.slice(1).toLowerCase();
        params.append('risk_level', riskLevelValue);
      }
      if (minRiskScore && minRiskScore.trim() !== '') {
        const minScore = parseFloat(minRiskScore);
        if (!isNaN(minScore) && minScore >= 0) {
          params.append('min_risk_score', minScore.toString());
        }
      }
      if (maxRiskScore && maxRiskScore.trim() !== '') {
        const maxScore = parseFloat(maxRiskScore);
        if (!isNaN(maxScore) && maxScore >= 0) {
          params.append('max_risk_score', maxScore.toString());
        }
      }

      // Add entity filter
      if (selectedEntity) {
        if (selectedIndustry.id === 'banking') {
          params.append('employer', selectedEntity.name);
        } else {
          params.append('organization', selectedEntity.name);
        }
      }

      const data = await apiGet(`/people/search?${params.toString()}`);
      
      // Transform API data
      return (data.people || []).map(person => {
        const dob = person.date_of_birth 
          ? new Date(person.date_of_birth).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })
          : 'N/A';
        
        const riskScore = person.risk_score || 0;
        let riskLevel = 'Low';
        if (riskScore >= 70) riskLevel = 'High';
        else if (riskScore >= 40) riskLevel = 'Medium';
        const riskScoreText = `${Math.round(riskScore)} - ${riskLevel}`;
        
        return {
          name: person.full_name || `${person.first_name || ''} ${person.last_name || ''}`.trim(),
          contact: person.phone_number || 'N/A',
          dob: dob,
          birthPlace: person.city || 'N/A',
          region: getRegionDisplayName(person.region),
          position: person.occupation || person.job_title || 'N/A',
          appointmentDate: dob,
          cases: person.total_cases || person.case_count || 0,
          riskScore: riskScoreText
        };
      });
    } catch (error) {
      console.error('Error fetching data for export:', error);
      alert('Error fetching data for export. Please try again.');
      return [];
    }
  };

  // Export functions
  const exportToCSV = async () => {
    setShowExportDropdown(false);
    const loadingMsg = alert('Preparing CSV export...');
    
    const allData = await fetchAllDataForExport();
    if (allData.length === 0) {
      alert('No data to export');
      return;
    }

    // Prepare CSV data
    const headers = ['Name', 'Contact', 'Date of Birth', 'Birth Place', 'Region', 'Position', 'Appointment Date', 'Cases', 'Risk Score'];
    const rows = allData.map(person => [
      person.name || '',
      person.contact || '',
      person.dob || '',
      person.birthPlace || '',
      person.region || 'N/A',
      person.position || '',
      person.appointmentDate || '',
      person.cases || 0,
      person.riskScore || ''
    ]);

    // Create CSV content
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `persons_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToExcel = async () => {
    setShowExportDropdown(false);
    const loadingMsg = alert('Preparing Excel export...');
    
    const allData = await fetchAllDataForExport();
    if (allData.length === 0) {
      alert('No data to export');
      return;
    }

    // Prepare Excel data
    const headers = ['Name', 'Contact', 'Date of Birth', 'Birth Place', 'Region', 'Position', 'Appointment Date', 'Cases', 'Risk Score'];
    const data = allData.map(person => [
      person.name || '',
      person.contact || '',
      person.dob || '',
      person.birthPlace || '',
      person.region || 'N/A',
      person.position || '',
      person.appointmentDate || '',
      person.cases || 0,
      person.riskScore || ''
    ]);

    // Create workbook
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet([headers, ...data]);
    
    // Set column widths
    ws['!cols'] = [
      { wch: 25 }, // Name
      { wch: 15 }, // Contact
      { wch: 12 }, // DOB
      { wch: 15 }, // Birth Place
      { wch: 15 }, // Region
      { wch: 20 }, // Position
      { wch: 15 }, // Appointment Date
      { wch: 8 },  // Cases
      { wch: 15 }  // Risk Score
    ];

    XLSX.utils.book_append_sheet(wb, ws, 'Persons');
    XLSX.writeFile(wb, `persons_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const exportToPDF = async () => {
    setShowExportDropdown(false);
    const loadingMsg = alert('Preparing PDF export...');
    
    const allData = await fetchAllDataForExport();
    if (allData.length === 0) {
      alert('No data to export');
      return;
    }

    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(16);
    doc.text('Persons List', 14, 15);
    
    // Add export date
    doc.setFontSize(10);
    doc.text(`Exported on: ${new Date().toLocaleDateString()}`, 14, 22);
    
    // Add filters info if any
    let yPos = 28;
    if (selectedEntity) {
      doc.text(`Entity: ${selectedEntity.name}`, 14, yPos);
      yPos += 6;
    }
    if (selectedRegion && selectedRegion !== 'All Regions') {
      doc.text(`Region: ${selectedRegion}`, 14, yPos);
      yPos += 6;
    }
    if (selectedTown && selectedTown !== 'All Towns') {
      doc.text(`Town: ${selectedTown}`, 14, yPos);
      yPos += 6;
    }
    if (searchPersonQuery.trim()) {
      doc.text(`Search: ${searchPersonQuery}`, 14, yPos);
      yPos += 6;
    }
    doc.text(`Total Records: ${allData.length}`, 14, yPos);
    yPos += 6;

    // Prepare table data (split into chunks for multiple pages if needed)
    const tableData = allData.map(person => [
      person.name || '',
      person.contact || '',
      person.dob || '',
      person.birthPlace || '',
      person.region || 'N/A',
      person.position || '',
      person.appointmentDate || '',
      String(person.cases || 0),
      person.riskScore || ''
    ]);

    // Add table
    doc.autoTable({
      startY: yPos + 5,
      head: [['Name', 'Contact', 'DOB', 'Birth Place', 'Region', 'Position', 'Appointment Date', 'Cases', 'Risk Score']],
      body: tableData,
      styles: { fontSize: 7 },
      headStyles: { fillColor: [2, 40, 88], textColor: 255 }, // Dark blue header with white text
      alternateRowStyles: { fillColor: [245, 245, 245] },
      margin: { top: yPos + 5 },
      pageBreak: 'auto',
      rowPageBreak: 'avoid'
    });

    // Save PDF
    doc.save(`persons_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  // If showing add form
  if (showAddForm) {
    return (
      <AddPersonForm
        onClose={() => setShowAddForm(false)}
        onSave={handleSavePerson}
        userInfo={userInfo}
        onNavigate={onNavigate}
        onLogout={onLogout}
        industry={selectedIndustry}
      />
    );
  }

  // If a person is selected, show their details
  if (selectedPerson) {
    // Use full data if available, otherwise use transformed data
    const personData = selectedPerson.fullData || selectedPerson;
    const personWithIndustry = { ...personData, industry: selectedIndustry };
    return (
      <PersonDetails
        person={personWithIndustry}
        onBack={() => setSelectedPerson(null)}
        userInfo={userInfo}
        onNavigate={onNavigate}
        onLogout={onLogout}
        onViewRelatedPerson={(personData) => setSelectedPerson(personData)}
      />
    );
  }

  // Show Intelius-style search page first - skip industry/entity selectors
  // Allow direct search without selecting industry/entity first
  // But don't show selectors if processing, showing results, or showing modals
  if (isProcessing) {
    // Don't show selectors during processing - processing page will be shown in main render
  } else if (showResultsPage || showMultipleResultsModal || showRefinementModal) {
    // Don't show selectors when results page or multiple results modal is active
  } else if (showSearchPage) {
    // Continue to render search page below - don't show selectors
  } else if (!selectedIndustry && !showSearchPage && !showResultsPage && !showMultipleResultsModal && !showRefinementModal) {
    // Only show industry selector if search page, results page, and modal are not active
    return (
      <PersonsIndustrySelector
        userInfo={userInfo}
        onSelectIndustry={handleSelectIndustry}
        onNavigate={onNavigate}
        onLogout={onLogout}
      />
    );
  } else if (selectedIndustry && !selectedEntity && !showSearchPage && !showResultsPage && !showMultipleResultsModal && !showRefinementModal) {
    // Only show entity selector if search page, results page, and modal are not active
    return (
      <PersonsEntitySelector
        userInfo={userInfo}
        industry={selectedIndustry}
        onSelectEntity={handleSelectEntity}
        onBack={() => setSelectedIndustry(null)}
        onNavigate={onNavigate}
        onLogout={onLogout}
      />
    );
  }

  return (
    <div className="bg-[#F7F8FA] min-h-screen">
      {/* Success Notification */}
      {successNotification && (
        <div 
          className="fixed top-4 right-4 z-[9999] bg-green-500 text-white px-6 py-4 rounded-lg shadow-xl flex items-center gap-3 min-w-[300px] max-w-[500px]"
          style={{
            animation: 'slideInRight 0.3s ease-out',
          }}
        >
          <CheckCircle className="h-6 w-6 flex-shrink-0" />
          <div className="flex-1">
            <p className="font-bold text-base">Success!</p>
            <p className="text-sm mt-1">{successNotification}</p>
          </div>
          <button 
            onClick={() => setSuccessNotification(null)} 
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
      
      {/* Full Width Header - Search and User */}
      <AdminHeader userInfo={userInfo} onNavigate={onNavigate} onLogout={onLogout} />

      {/* Processing Page - Show during search processing */}
      {isProcessing && (
        <div className="fixed inset-0 bg-white dark:bg-slate-900 z-[10000] flex flex-col items-start justify-start overflow-auto" style={{ top: '64px', left: 0, right: 0, bottom: 0 }}>
          <div className="w-full max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-center text-slate-900 dark:text-white mb-6">
                Searching Databases...
              </h2>

              {/* Progress Bar */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Progress: {searchProgress}%
                  </span>
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    {Math.floor(elapsedTime / 60)}:{(elapsedTime % 60).toString().padStart(2, '0')}
                  </span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-blue-600 h-full transition-all duration-300 ease-out rounded-full"
                    style={{ width: `${searchProgress}%` }}
                  ></div>
                </div>
              </div>

              {/* Current Database */}
              {currentDatabase && (
                <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center gap-2">
                    <svg className="animate-spin h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span className="text-sm font-medium text-blue-900 dark:text-blue-200">
                      Currently searching: {currentDatabase}
                    </span>
                  </div>
                </div>
              )}

              {/* All Databases List with Status */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                  Database Search Status:
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {databaseOptions.filter(db => db.id !== 'all').map((db) => {
                    const isCompleted = searchedDatabases.some(searched => searched.id === db.id);
                    const isCurrentlySearching = currentDatabase === db.label;
                    const isActive = isCompleted || isCurrentlySearching;
                    
                    return (
                      <div
                        key={db.id}
                        className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-all ${
                          isActive
                            ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-400 dark:border-blue-600'
                            : 'bg-slate-100 dark:bg-slate-700 border-slate-300 dark:border-slate-600'
                        }`}
                      >
                        {/* Database Icon */}
                        <div className={`text-3xl filter ${
                          isActive ? '' : 'grayscale opacity-50'
                        }`}>
                          {db.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className={`text-sm font-medium ${
                            isActive
                              ? 'text-blue-900 dark:text-blue-200'
                              : 'text-slate-600 dark:text-slate-400'
                          }`}>
                            {db.label}
                          </div>
                          {isCurrentlySearching && (
                            <div className="text-xs text-blue-600 dark:text-blue-400 mt-1 flex items-center gap-1">
                              <svg className="animate-spin h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Searching...
                            </div>
                          )}
                        </div>
                        {/* Status Icon */}
                        {isCompleted && (
                          <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                        {isCurrentlySearching && !isCompleted && (
                          <svg className="animate-spin w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Time Display */}
              <div className="text-center text-sm text-slate-600 dark:text-slate-400">
                Elapsed time: {Math.floor(elapsedTime / 60)}:{(elapsedTime % 60).toString().padStart(2, '0')}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Refinement Modal */}
      {showRefinementModal && isProcessing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[10001] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
              Refine Your Search
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
              {refinementQuestion}
            </p>
            <textarea
              value={refinementAnswer}
              onChange={(e) => setRefinementAnswer(e.target.value)}
              placeholder="Enter any additional search criteria..."
              className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-4"
              rows={3}
            />
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleRefinementSkip}
                className="flex-1 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-semibold py-2 px-4 rounded-lg transition-colors"
              >
                Skip
              </button>
              <button
                type="button"
                onClick={handleRefinementSubmit}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Multiple Results Modal */}
      {showMultipleResultsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[10001] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
              Multiple Results Found
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
              Your search returned <strong>{totalResults} results</strong>. Would you like to refine your search criteria to narrow down the results, or view all results?
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleRefineSearch}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
              >
                Refine Search
              </button>
              <button
                type="button"
                onClick={handleSkipToResults}
                className="flex-1 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-semibold py-2 px-4 rounded-lg transition-colors"
              >
                View All Results
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Results Page */}
      {showResultsPage && !isProcessing && (
        <div className="bg-white dark:bg-slate-900 min-h-screen pb-12">
          {/* Sticky Search Query Header */}
          <div className="sticky top-0 z-50 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 shadow-sm">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">Search Query:</span>
                    <span className="text-base font-bold text-slate-900 dark:text-white">{currentSearchQuery || 'All persons'}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowSearchResultReportModal(true)}
                    className="px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors border border-red-300 dark:border-red-700 flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    Report Issue
                  </button>
                  <button
                    onClick={() => {
                      setShowResultsPage(false);
                      setShowSearchPage(true);
                    }}
                    className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                  >
                    ← Back to Search
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Results Summary Header */}
            <div className="mb-6 text-center">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                Search Results
              </h2>
              <p className="text-3xl font-bold text-slate-900 dark:text-white">
                Found {totalResults} result{totalResults !== 1 ? 's' : ''}
              </p>
            </div>

            {/* Data Summary - Database Sources (Clickable Filters) */}
            {searchedDatabases.length > 0 && (
              <div className="mb-6 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                  Data Sources {selectedDatabaseFilter && <span className="text-xs font-normal text-blue-600 dark:text-blue-400">(Filtered)</span>}
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {searchedDatabases.map((db) => {
                    const dbOption = databaseOptions.find(opt => opt.id === db.id);
                    // Calculate realtime count based on actual person-database mapping
                    const count = selectedDatabaseFilter
                      ? persons.filter(p => (personDatabaseMap[p.id] || []).includes(db.id)).length
                      : allPersons.filter(p => (personDatabaseMap[p.id] || []).includes(db.id)).length;
                    const isSelected = selectedDatabaseFilter === db.id;
                    const hasResults = count > 0 || selectedDatabaseFilter === db.id;
                    
                    return (
                      <button
                        key={db.id}
                        onClick={() => handleDatabaseFilter(db.id)}
                        disabled={!hasResults && !selectedDatabaseFilter}
                        className={`flex items-center gap-2 p-2 rounded border-2 transition-all ${
                          isSelected
                            ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-400 dark:border-blue-600 shadow-md'
                            : hasResults
                            ? 'bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-sm cursor-pointer'
                            : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 opacity-50 cursor-not-allowed'
                        }`}
                      >
                        <div className={`text-2xl ${isSelected ? '' : 'filter grayscale opacity-70'}`}>
                          {dbOption?.icon || '📊'}
                        </div>
                        <div className="flex-1 min-w-0 text-left">
                          <div className={`text-xs font-medium truncate ${
                            isSelected 
                              ? 'text-blue-900 dark:text-blue-200' 
                              : 'text-slate-600 dark:text-slate-400'
                          }`}>
                            {db.label}
                          </div>
                          <div className={`text-sm font-bold ${
                            isSelected
                              ? 'text-blue-700 dark:text-blue-400'
                              : 'text-blue-600 dark:text-blue-400'
                          }`}>
                            {count} result{count !== 1 ? 's' : ''}
                          </div>
                        </div>
                        {isSelected && (
                          <svg className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </button>
                    );
                  })}
                </div>
                {selectedDatabaseFilter && (
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-xs text-slate-600 dark:text-slate-400">
                      Showing results from: <strong>{searchedDatabases.find(db => db.id === selectedDatabaseFilter)?.label}</strong>
                    </span>
                    <button
                      onClick={() => handleDatabaseFilter(selectedDatabaseFilter)}
                      className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
                    >
                      Clear Filter
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* AI Overview - Collapsible */}
            {aiOverview && (
              <div className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border border-blue-200 dark:border-blue-800 overflow-hidden">
                <button
                  onClick={() => setShowAiOverview(!showAiOverview)}
                  className="w-full flex items-center justify-between p-5 hover:bg-blue-100/50 dark:hover:bg-blue-900/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0">
                      <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                    </div>
                    <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-200">
                      AI Overview
                    </h3>
                  </div>
                  <svg 
                    className={`w-5 h-5 text-blue-600 dark:text-blue-400 transition-transform ${showAiOverview ? 'rotate-180' : ''}`}
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {showAiOverview && (
                  <div className="px-5 pb-5">
                    <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                      {aiOverview}
                    </p>
                  </div>
                )}
              </div>
            )}

            {(persons.length === 0 && gazetteEntries.length === 0) ? (
              <div className="flex flex-col items-center justify-center py-12 gap-4">
                <svg className="w-16 h-16 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white">No Results Found</h3>
                <p className="text-slate-600 dark:text-slate-400">Try refining your search criteria or browse different options.</p>
                <button
                  onClick={() => {
                    setShowResultsPage(false);
                    setShowSearchPage(true);
                  }}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
                >
                  Back to Search
                </button>
              </div>
            ) : (
              <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {persons.map((person, index) => {
                // Check if this is an expanded person entry (has _nameStatus)
                const nameStatus = person._nameStatus || null;
                const displayName = person._displayName || person.full_name || `${person.first_name || ''} ${person.last_name || ''}`.trim() || 'Unknown Name';
                const primaryPersonId = person._primaryPersonId || person.id;
                
                // Create unique key for expanded entries
                const uniqueKey = nameStatus 
                  ? `person-${primaryPersonId}-${nameStatus}-${person._aliasIndex !== undefined ? person._aliasIndex : person._oldNameIndex !== undefined ? person._oldNameIndex : ''}`
                  : `person-${person.id}-${index}`;
                
                return (
                  <div
                    key={uniqueKey}
                    className="bg-white dark:bg-slate-800 rounded-lg shadow-md border border-slate-200 dark:border-slate-700 p-6 hover:shadow-lg transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          {/* Display Name with color based on name status */}
                          <h3 className={`text-xl font-bold ${
                            nameStatus === 'current'
                              ? 'text-blue-600 dark:text-blue-400'
                              : nameStatus === 'old'
                              ? 'text-red-600 dark:text-red-400'
                              : nameStatus === 'alias'
                              ? 'text-orange-500 dark:text-orange-400'
                              : 'text-slate-900 dark:text-white'
                          }`}>
                            {displayName}
                          </h3>
                          
                          {/* Show "Change of Name Record" badge only (removed Personal Record) */}
                          {nameStatus && (
                            <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 text-xs font-semibold rounded">
                              Change of Name Record
                            </span>
                          )}
                          
                        </div>
                        
                        {/* Name Status Badge with colors - Always show for Change of Name records */}
                        {nameStatus && (
                          <div className="mb-2">
                            {nameStatus === 'current' && (
                              <span className="inline-flex items-center px-2 py-1 rounded text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                                Current Name
                              </span>
                            )}
                            {nameStatus === 'old' && (
                              <span className="inline-flex items-center px-2 py-1 rounded text-xs font-semibold bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
                                Old Name
                              </span>
                            )}
                            {nameStatus === 'alias' && (
                              <span className="inline-flex items-center px-2 py-1 rounded text-xs font-semibold bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400">
                                Alias Name
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => {
                          // Use the original person object (by primaryPersonId) for the report
                          const originalPerson = allPersons.find(p => p.id === primaryPersonId) || person;
                          handleOpenReport(originalPerson);
                        }}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors"
                      >
                        View Report
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        {person.employer && person.employer !== 'N/A' && (
                        <div>
                          <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Employer:</span>
                        <p className="text-sm text-slate-900 dark:text-white">{person.employer}</p>
                        </div>
                        )}
                      {person.gazette_number && person.gazette_number !== 'N/A' && (
                      <div>
                        <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Gazette Number:</span>
                        <p className="text-sm text-slate-900 dark:text-white">{person.gazette_number}</p>
                    </div>
                      )}
                      {(person.page_number || person.page || person.gazette_page) && (person.page_number || person.page || person.gazette_page) !== 'N/A' && (
                      <div>
                        <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Page Number:</span>
                        <p className="text-sm text-slate-900 dark:text-white">{person.page_number || person.page || person.gazette_page}</p>
                      </div>
                      )}
                    </div>

                  </div>
                );
              })}

              {/* Gazette Entries Results - Show all gazette entries including alias entities */}
              {gazetteEntries
                .filter(gazette => {
                  // If a database filter is selected, only show matching entries
                  if (selectedDatabaseFilter) {
                    const type = gazette.gazette_type || gazette.gazetteType || '';
                    
                    if (selectedDatabaseFilter === 'change_of_name') {
                    // Include if it's a change of name gazette OR if it's a split entity from a change of name gazette
                    return type === 'CHANGE_OF_NAME' || type === 'change_of_name' || type === 'Change of Name' || gazette._nameStatus;
                    } else if (selectedDatabaseFilter === 'change_of_pob') {
                      return type === 'CHANGE_OF_PLACE_OF_BIRTH' || type === 'change_of_place_of_birth';
                    } else if (selectedDatabaseFilter === 'change_of_dob') {
                      return type === 'CHANGE_OF_DATE_OF_BIRTH' || type === 'change_of_date_of_birth';
                    } else if (selectedDatabaseFilter === 'marriage_officers') {
                      return type === 'APPOINTMENT_OF_MARRIAGE_OFFICERS' || type === 'appointment_of_marriage_officers';
                    }
                  }
                  // No filter or other cases - show all
                  return true;
                })
                .map((gazette, index) => {
                const gazetteType = gazette.gazette_type || gazette.gazetteType || '';
                const isChangeOfName = gazetteType === 'CHANGE_OF_NAME' || gazetteType === 'change_of_name' || gazetteType === 'Change of Name';
                
                // For expanded Change of Name entries, use the pre-set name type and display name
                const nameStatus = gazette._nameStatus || null; // 'current', 'old', 'alias', or null
                // Get display name based on entry type
                let displayName = gazette._displayName;
                if (!displayName) {
                  if (isChangeOfName) {
                    displayName = gazette.new_name || gazette.current_name || gazette.old_name || gazette.name_value || 'Unknown';
                  } else if (gazetteType === 'APPOINTMENT_OF_MARRIAGE_OFFICERS' || gazetteType === 'appointment_of_marriage_officers') {
                    displayName = gazette.officer_name || gazette.person_name || 'Unknown';
                  } else {
                    displayName = gazette.person_name || gazette.current_name || gazette.new_name || gazette.officer_name || 'Unknown';
                  }
                }
                const primaryGazetteId = gazette._primaryGazetteId || gazette.id;
                
                // Create unique key that includes name type for Change of Name entries
                const uniqueKey = isChangeOfName && nameStatus 
                  ? `gazette-${primaryGazetteId}-${nameStatus}-${gazette._aliasIndex !== undefined ? gazette._aliasIndex : ''}`
                  : `gazette-${gazette.id}-${index}`;
                
                // Get old_name and alias_names from gazette for display
                const oldName = gazette.old_name || null;
                const aliasNames = Array.isArray(gazette.alias_names) ? gazette.alias_names : (gazette.alias_names ? [gazette.alias_names] : []);
                const currentName = gazette.new_name || gazette.current_name || null;
                
                return (
                  <div
                    key={uniqueKey}
                    className="bg-white dark:bg-slate-800 rounded-lg shadow-md border border-slate-200 dark:border-slate-700 p-6 hover:shadow-lg transition-shadow"
                  >
                    {/* Header: Change of Name Record badge and View Report button on same line */}
                    <div className="flex items-center justify-between mb-4">
                      {isChangeOfName && (
                        <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 text-xs font-semibold rounded">
                          Change of Name Record
                        </span>
                      )}
                      <button
                        onClick={async () => {
                          // If gazette has person_id, fetch person details; otherwise use gazette entry directly
                          if (gazette.person_id) {
                            try {
                              const personData = await apiGet(`/people/${gazette.person_id}`);
                              if (personData) {
                                handleOpenReport(personData);
                              }
                            } catch (error) {
                              console.error('Error fetching person data:', error);
                              // Fallback to gazette-only report
                              handleOpenReportFromGazette(gazette);
                            }
                          } else {
                            // For gazette entries without person_id (correction_of_place_of_birth, correction_of_date_of_birth, marriage_officers)
                            handleOpenReportFromGazette(gazette);
                          }
                        }}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors"
                      >
                        View Report
                      </button>
                    </div>
                    
                    {/* Old Name, New Name (Current Name), and Alias Names - ALL shown for change of name entries */}
                    {isChangeOfName && (
                      <div className="space-y-2 mb-4">
                        {/* Old Name */}
                        <div>
                          <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Old Name: </span>
                          <span className={`text-sm font-medium ${
                            nameStatus === 'old' 
                              ? 'text-red-600 dark:text-red-400 font-bold' 
                              : 'text-red-600 dark:text-red-400'
                          }`}>
                            {oldName ? highlightText(oldName, advancedSearchData.name) : 'N/A'}
                          </span>
                        </div>
                        
                        {/* New Name (Current Name) */}
                        <div>
                          <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">New Name (Current): </span>
                          <span className={`text-sm font-medium ${
                            nameStatus === 'current' 
                              ? 'text-blue-600 dark:text-blue-400 font-bold' 
                              : 'text-blue-600 dark:text-blue-400'
                          }`}>
                            {currentName ? highlightText(currentName, advancedSearchData.name) : 'N/A'}
                          </span>
                        </div>
                        
                        {/* Alias Names */}
                        <div>
                          <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Alias: </span>
                          <span className={`text-sm font-medium ${
                            nameStatus === 'alias' 
                              ? 'text-orange-500 dark:text-orange-400 font-bold' 
                              : 'text-orange-500 dark:text-orange-400'
                          }`}>
                            {aliasNames.length > 0 ? (
                              aliasNames.map((alias, idx) => (
                                <span key={idx}>
                                  {highlightText(alias, advancedSearchData.name)}
                                  {idx < aliasNames.length - 1 && ', '}
                                </span>
                              ))
                            ) : (
                              'N/A'
                            )}
                          </span>
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        {gazette.gazette_number && gazette.gazette_number !== 'N/A' && (
                        <div>
                          <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Gazette Number:</span>
                        <p className="text-sm text-slate-900 dark:text-white">{gazette.gazette_number}</p>
                        </div>
                        )}
                      {(gazette.gazette_page || gazette.page_number || gazette.page) && (gazette.gazette_page || gazette.page_number || gazette.page) !== 'N/A' && (
                      <div>
                        <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Page Number:</span>
                        <p className="text-sm text-slate-900 dark:text-white">{gazette.gazette_page || gazette.page_number || gazette.page}</p>
                      </div>
                      )}
                        {gazette.gazette_date && (
                        <div>
                          <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Gazette Date:</span>
                        <p className="text-sm text-slate-900 dark:text-white">{new Date(gazette.gazette_date).toLocaleDateString()}</p>
                        </div>
                        )}
                        {gazette.gazette_type && (
                        <div>
                          <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Type:</span>
                          <p className="text-sm text-slate-900 dark:text-white">
                          {String(gazette.gazette_type).replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </p>
                        </div>
                        )}
                        {gazette.source && gazette.source !== 'N/A' && (
                        <div>
                          <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Source:</span>
                        <p className="text-sm text-slate-900 dark:text-white">{gazette.source}</p>
                        </div>
                        )}
                    </div>

                    {/* Correction of Place of Birth specific fields */}
                    {(gazetteType === 'CHANGE_OF_PLACE_OF_BIRTH' || gazetteType === 'change_of_place_of_birth') && (
                      <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                        {gazette.old_place_of_birth && (
                          <div className="mb-2">
                            <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Old Place of Birth: </span>
                            <span className="text-sm text-red-600 dark:text-red-400">{gazette.old_place_of_birth}</span>
                          </div>
                        )}
                        {gazette.new_place_of_birth && (
                          <div className="mb-2">
                            <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">New Place of Birth: </span>
                            <span className="text-sm text-green-600 dark:text-green-400">{gazette.new_place_of_birth}</span>
                          </div>
                        )}
                        {gazette.alias && (
                          <div>
                            <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Alias: </span>
                            <span className="text-sm text-blue-600 dark:text-blue-400">{gazette.alias}</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Correction of Date of Birth specific fields */}
                    {(gazetteType === 'CHANGE_OF_DATE_OF_BIRTH' || gazetteType === 'change_of_date_of_birth') && (
                      <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                        {gazette.old_date_of_birth && (
                          <div className="mb-2">
                            <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Old Date of Birth: </span>
                            <span className="text-sm text-red-600 dark:text-red-400">{new Date(gazette.old_date_of_birth).toLocaleDateString()}</span>
                          </div>
                        )}
                        {gazette.new_date_of_birth && (
                          <div className="mb-2">
                            <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">New Date of Birth: </span>
                            <span className="text-sm text-green-600 dark:text-green-400">{new Date(gazette.new_date_of_birth).toLocaleDateString()}</span>
                          </div>
                        )}
                        {gazette.alias && (
                          <div>
                            <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Alias: </span>
                            <span className="text-sm text-blue-600 dark:text-blue-400">{gazette.alias}</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Marriage Officers specific fields */}
                    {(gazetteType === 'APPOINTMENT_OF_MARRIAGE_OFFICERS' || gazetteType === 'appointment_of_marriage_officers') && (
                      <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                        {gazette.church && (
                          <div className="mb-2">
                            <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Church: </span>
                            <span className="text-sm text-slate-900 dark:text-white">{gazette.church}</span>
                          </div>
                        )}
                        {gazette.location && (
                          <div className="mb-2">
                            <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Location: </span>
                            <span className="text-sm text-slate-900 dark:text-white">{gazette.location}</span>
                          </div>
                        )}
                        {gazette.appointing_authority && (
                          <div className="mb-2">
                            <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Appointing Authority: </span>
                            <span className="text-sm text-slate-900 dark:text-white">{gazette.appointing_authority}</span>
                          </div>
                        )}
                        {gazette.appointment_date && (
                          <div>
                            <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Appointment Date: </span>
                            <span className="text-sm text-slate-900 dark:text-white">{new Date(gazette.appointment_date).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Alias display for all types */}
                    {gazette.alias_names && Array.isArray(gazette.alias_names) && gazette.alias_names.length > 0 && !isChangeOfName && (
                      <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                        <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Alias Names: </span>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {gazette.alias_names.map((alias, idx) => (
                            <span key={idx} className="text-sm text-blue-600 dark:text-blue-400">{alias}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
              </div>

                {/* Infinite Scroll Loader */}
                {hasMore && !selectedDatabaseFilter && (
                  <div id="infinite-scroll-sentinel" className="flex justify-center items-center py-8">
                    {isLoadingMore ? (
                      <div className="flex items-center gap-3">
                        <svg className="animate-spin h-6 w-6 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span className="text-sm text-slate-600 dark:text-slate-400">Loading more results...</span>
                      </div>
                    ) : (
                      <button
                        onClick={loadMoreResults}
                        className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
                      >
                        Load More Results
                      </button>
                    )}
                  </div>
                )}

                {/* End of Results Message */}
                {!hasMore && !isLoadingMore && (persons.length > 0 || gazetteEntries.length > 0) && (
                  <div className="text-center py-8 text-sm text-slate-600 dark:text-slate-400">
                    {selectedDatabaseFilter ? 'All filtered results displayed' : 'No more results to load'}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* Report Modal */}
      {selectedPersonForReport && (() => {
        const reportPerson = selectedPersonForReport;
        const reportPreviousNames = reportPerson.previous_names || [];
        const reportAliases = Array.isArray(reportPreviousNames) ? reportPreviousNames : [];
        
        return (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-[10002] flex items-center justify-center p-4 overflow-auto">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-4xl w-full p-6 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  Personal Report of {reportPerson.full_name || `${reportPerson.first_name || ''} ${reportPerson.last_name || ''}`.trim() || 'Unknown Person'}
                </h3>
                <div className="flex gap-2">
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowComplaintModal(true)}
                      className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white text-sm font-semibold rounded-lg transition-colors flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                      Request Support
                    </button>
                    <button
                      onClick={handlePrintReport}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                      </svg>
                      Print Report
                    </button>
                    <button
                      onClick={handleCloseReport}
                      className="px-4 py-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Report Content */}
              <div className="space-y-6">
                {/* Personal Information */}
                <div>
                  <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-3 border-b border-slate-200 dark:border-slate-700 pb-2">
                    Personal Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Full Name:</span>
                      <p className={`text-base font-semibold mt-1 ${
                        personNameStatuses[reportPerson.id]?.status === 'current' 
                          ? 'text-blue-600 dark:text-blue-400'
                          : personNameStatuses[reportPerson.id]?.status === 'alias'
                          ? 'text-sky-400 dark:text-sky-300'
                          : personNameStatuses[reportPerson.id]?.status === 'old'
                          ? 'text-red-600 dark:text-red-400'
                          : 'text-slate-900 dark:text-white'
                      }`}>
                        {reportPerson.full_name || 'N/A'}
                      </p>
                    </div>
                    {reportPerson.first_name && (
                      <div>
                        <span className="text-sm font-bold text-slate-700 dark:text-slate-300">First Name:</span>
                        <p className="text-base text-slate-900 dark:text-white mt-1">{reportPerson.first_name}</p>
                      </div>
                    )}
                    {reportPerson.last_name && (
                      <div>
                        <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Last Name:</span>
                        <p className="text-base text-slate-900 dark:text-white mt-1">{reportPerson.last_name}</p>
                      </div>
                    )}
                    {reportAliases.length > 0 && (
                      <div className="md:col-span-2">
                        <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Previous Names / Aliases:</span>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {reportAliases.map((alias, idx) => (
                            <span key={idx} className="px-2 py-1 bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300 rounded text-sm">
                              {alias}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {reportPerson.id_number && (
                      <div>
                        <span className="text-sm font-bold text-slate-700 dark:text-slate-300">ID Number:</span>
                        <p className="text-base text-slate-900 dark:text-white mt-1">{reportPerson.id_number}</p>
                      </div>
                    )}
                    {reportPerson.date_of_birth && (
                      <div>
                        <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Date of Birth:</span>
                        <p className="text-base text-slate-900 dark:text-white mt-1">{new Date(reportPerson.date_of_birth).toLocaleDateString()}</p>
                      </div>
                    )}
                    {reportPerson.gender && (
                      <div>
                        <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Gender:</span>
                        <p className="text-base text-slate-900 dark:text-white mt-1">{reportPerson.gender}</p>
                      </div>
                    )}
                    {reportPerson.nationality && (
                      <div>
                        <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Nationality:</span>
                        <p className="text-base text-slate-900 dark:text-white mt-1">{reportPerson.nationality}</p>
                      </div>
                    )}
                </div>
              </div>

                {/* Address & Contact */}
                {(reportPerson.address || reportPerson.city || reportPerson.region || reportPerson.phone_number || reportPerson.email) && (
                  <div>
                    <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-3 border-b border-slate-200 dark:border-slate-700 pb-2">
                      Address & Contact
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {reportPerson.address && (
                        <div className="md:col-span-2">
                          <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Address:</span>
                          <p className="text-base text-slate-900 dark:text-white mt-1">{reportPerson.address}</p>
                        </div>
                      )}
                      {reportPerson.city && (
                        <div>
                          <span className="text-sm font-bold text-slate-700 dark:text-slate-300">City:</span>
                          <p className="text-base text-slate-900 dark:text-white mt-1">{reportPerson.city}</p>
                        </div>
                      )}
                      {reportPerson.region && (
                        <div>
                          <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Region:</span>
                          <p className="text-base text-slate-900 dark:text-white mt-1">{reportPerson.region}</p>
                        </div>
                      )}
                      {reportPerson.phone_number && (
                        <div>
                          <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Phone:</span>
                          <p className="text-base text-slate-900 dark:text-white mt-1">{reportPerson.phone_number}</p>
                        </div>
                      )}
                      {reportPerson.email && (
                        <div>
                          <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Email:</span>
                          <p className="text-base text-slate-900 dark:text-white mt-1">{reportPerson.email}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Professional Information */}
                {(reportPerson.occupation || reportPerson.profession || reportPerson.employer || reportPerson.organization) && (
                  <div>
                    <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-3 border-b border-slate-200 dark:border-slate-700 pb-2">
                      Professional Information
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {(reportPerson.occupation || reportPerson.profession) && (
                        <div>
                          <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Profession:</span>
                          <p className="text-base text-slate-900 dark:text-white mt-1">{reportPerson.profession || reportPerson.occupation}</p>
                        </div>
                      )}
                      {reportPerson.employer && (
                        <div>
                          <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Employer:</span>
                          <p className="text-base text-slate-900 dark:text-white mt-1">{reportPerson.employer}</p>
                        </div>
                      )}
                      {reportPerson.organization && (
                        <div>
                          <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Organization:</span>
                          <p className="text-base text-slate-900 dark:text-white mt-1">{reportPerson.organization}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

              {/* Linked Gazette Entries */}
              {personGazettes.length > 0 && (
                <div>
                  <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-3 border-b border-slate-200 dark:border-slate-700 pb-2">
                    Linked Gazette Entries ({personGazettes.length})
                  </h4>
                  <div className="space-y-3">
                    {personGazettes.map((gazette) => {
                      // Determine name status and color
                      const nameStatus = gazette.name_role || 
                        (gazette.new_name || gazette.current_name ? 'current' : 
                         gazette.old_name ? 'old' : 
                         (gazette.alias_names && Array.isArray(gazette.alias_names) && gazette.alias_names.length > 0) ? 'alias' : 'current');
                      
                      const currentName = gazette.new_name || gazette.current_name || gazette.name_value;
                      const oldName = gazette.old_name;
                      const aliasNames = Array.isArray(gazette.alias_names) ? gazette.alias_names : [];
                      
                      return (
                        <div key={gazette.id || Math.random()} className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 bg-slate-50 dark:bg-slate-900/50">
                          <div className="font-semibold text-slate-900 dark:text-white mb-3">
                            {gazette.title || `Gazette ${gazette.gazette_number || gazette.id || 'N/A'}`}
                          </div>
                          
                          {/* Name Information with Color Coding */}
                          <div className="mb-3 space-y-2">
                            {currentName && (
                              <div>
                                <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Current Name: </span>
                                <span className="text-base font-semibold text-blue-600 dark:text-blue-400">{currentName}</span>
                              </div>
                            )}
                            {oldName && (
                              <div>
                                <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Old Name: </span>
                                <span className="text-base font-semibold text-red-600 dark:text-red-400">{oldName}</span>
                              </div>
                            )}
                            {aliasNames.length > 0 && (
                              <div>
                                <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Alias Names: </span>
                                <div className="flex flex-wrap gap-2 mt-1">
                                  {aliasNames.map((alias, idx) => (
                                    <span key={idx} className="text-base font-semibold text-sky-400 dark:text-sky-300">{alias}</span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                          
                          {/* Show specific fields for Correction of Place of Birth */}
                          {(gazette.gazette_type === 'CHANGE_OF_PLACE_OF_BIRTH' || gazette.gazette_type === 'change_of_place_of_birth') && (
                            <div className="mb-3 space-y-2">
                              {gazette.old_place_of_birth && (
                                <div>
                                  <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Old Place of Birth: </span>
                                  <span className="text-base font-semibold text-red-600 dark:text-red-400">{gazette.old_place_of_birth}</span>
                                </div>
                              )}
                              {gazette.new_place_of_birth && (
                                <div>
                                  <span className="text-sm font-bold text-slate-700 dark:text-slate-300">New Place of Birth: </span>
                                  <span className="text-base font-semibold text-green-600 dark:text-green-400">{gazette.new_place_of_birth}</span>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Show specific fields for Correction of Date of Birth */}
                          {(gazette.gazette_type === 'CHANGE_OF_DATE_OF_BIRTH' || gazette.gazette_type === 'change_of_date_of_birth') && (
                            <div className="mb-3 space-y-2">
                              {gazette.old_date_of_birth && (
                                <div>
                                  <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Old Date of Birth: </span>
                                  <span className="text-base font-semibold text-red-600 dark:text-red-400">{new Date(gazette.old_date_of_birth).toLocaleDateString()}</span>
                                </div>
                              )}
                              {gazette.new_date_of_birth && (
                                <div>
                                  <span className="text-sm font-bold text-slate-700 dark:text-slate-300">New Date of Birth: </span>
                                  <span className="text-base font-semibold text-green-600 dark:text-green-400">{new Date(gazette.new_date_of_birth).toLocaleDateString()}</span>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Show specific fields for Marriage Officers */}
                          {(gazette.gazette_type === 'APPOINTMENT_OF_MARRIAGE_OFFICERS' || gazette.gazette_type === 'appointment_of_marriage_officers') && (
                            <div className="mb-3 space-y-2">
                              {gazette.officer_name && (
                                <div>
                                  <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Officer Name: </span>
                                  <span className="text-base font-semibold text-blue-600 dark:text-blue-400">{gazette.officer_name}</span>
                                </div>
                              )}
                              {gazette.church && (
                                <div>
                                  <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Church: </span>
                                  <span className="text-base text-slate-900 dark:text-white">{gazette.church}</span>
                                </div>
                              )}
                              {gazette.location && (
                                <div>
                                  <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Location: </span>
                                  <span className="text-base text-slate-900 dark:text-white">{gazette.location}</span>
                                </div>
                              )}
                              {gazette.appointing_authority && (
                                <div>
                                  <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Appointing Authority: </span>
                                  <span className="text-base text-slate-900 dark:text-white">{gazette.appointing_authority}</span>
                                </div>
                              )}
                              {gazette.appointment_date && (
                                <div>
                                  <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Appointment Date: </span>
                                  <span className="text-base text-slate-900 dark:text-white">{new Date(gazette.appointment_date).toLocaleDateString()}</span>
                                </div>
                              )}
                            </div>
                          )}
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                            {gazette.gazette_type && (
                              <div>
                                <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Type: </span>
                                <span className="text-base text-slate-900 dark:text-white">{gazette.gazette_type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                              </div>
                            )}
                            {gazette.gender && (
                              <div>
                                <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Gender: </span>
                                <span className="text-base text-slate-900 dark:text-white">{gazette.gender}</span>
                              </div>
                            )}
                            {gazette.profession && (
                              <div>
                                <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Profession: </span>
                                <span className="text-base text-slate-900 dark:text-white">{gazette.profession}</span>
                              </div>
                            )}
                            {gazette.address && (
                              <div className="md:col-span-2">
                                <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Address: </span>
                                <span className="text-base text-slate-900 dark:text-white">{gazette.address}</span>
                              </div>
                            )}
                            {gazette.item_number && (
                              <div>
                                <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Item Number: </span>
                                <span className="text-base text-slate-900 dark:text-white">{gazette.item_number}</span>
                              </div>
                            )}
                            {gazette.gazette_number && (
                              <div>
                                <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Gazette Number: </span>
                                <span className="text-base text-slate-900 dark:text-white">{gazette.gazette_number}</span>
                              </div>
                            )}
                            {gazette.gazette_date && (
                              <div>
                                <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Gazette Date: </span>
                                <span className="text-base text-slate-900 dark:text-white">{new Date(gazette.gazette_date).toLocaleDateString()}</span>
                              </div>
                            )}
                            {(gazette.gazette_page || gazette.page_number) && (
                              <div>
                                <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Page Number: </span>
                                <span className="text-base text-slate-900 dark:text-white">{gazette.gazette_page || gazette.page_number}</span>
                              </div>
                            )}
                            {gazette.remarks && (
                              <div className="md:col-span-2">
                                <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Remarks: </span>
                                <span className="text-base text-slate-900 dark:text-white">{gazette.remarks}</span>
                              </div>
                            )}
                            {gazette.source && (
                              <div>
                                <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Source: </span>
                                <span className="text-base text-slate-900 dark:text-white">{gazette.source}</span>
                              </div>
                            )}
                            {gazette.court_location && (
                              <div>
                                <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Court Location: </span>
                                <span className="text-base text-slate-900 dark:text-white">{gazette.court_location}</span>
                              </div>
                            )}
                            {gazette.jurisdiction && (
                              <div>
                                <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Jurisdiction: </span>
                                <span className="text-base text-slate-900 dark:text-white">{gazette.jurisdiction}</span>
                              </div>
                            )}
                          </div>
                          
                          {/* Source Details Section */}
                          <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                            <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Source Details: </span>
                            <div className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                              {gazette.gazette_number && <span>Gazette Number: {gazette.gazette_number}</span>}
                              {gazette.gazette_date && <span>{gazette.gazette_number ? ', ' : ''}Gazette Date: {new Date(gazette.gazette_date).toLocaleDateString()}</span>}
                              {gazette.item_number && <span>{gazette.gazette_number || gazette.gazette_date ? ', ' : ''}Item Number: {gazette.item_number}</span>}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              </div>
            </div>
          </div>
        );
      })()}

      {/* Search Result Report Modal */}
      {showSearchResultReportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[10003] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-2xl w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Report Unsatisfactory Search Results
              </h3>
              <button
                onClick={() => {
                  setShowSearchResultReportModal(false);
                  setSearchResultReportMessage('');
                }}
                className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
              Help us improve by letting us know why you're not satisfied with these search results. Your feedback will be reviewed by an admin.
            </p>
            <div className="mb-4">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Search Query:
              </label>
              <p className="text-sm text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-700 px-3 py-2 rounded-lg">
                {currentSearchQuery || 'N/A'}
              </p>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Results Found:
              </label>
              <p className="text-sm text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-700 px-3 py-2 rounded-lg">
                {totalResults} result{totalResults !== 1 ? 's' : ''}
              </p>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Issue Description: <span className="text-red-500">*</span>
              </label>
              <textarea
                value={searchResultReportMessage}
                onChange={(e) => setSearchResultReportMessage(e.target.value)}
                placeholder="Please describe why you're not satisfied with the search results (e.g., missing results, incorrect information, etc.)..."
                className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={5}
              />
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowSearchResultReportModal(false);
                  setSearchResultReportMessage('');
                }}
                className="flex-1 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-semibold py-2 px-4 rounded-lg transition-colors"
                disabled={isSubmittingSearchReport}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmitSearchReport}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isSubmittingSearchReport || !searchResultReportMessage.trim()}
              >
                {isSubmittingSearchReport ? (
                  <>
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Submitting...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    Submit Report
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Complaint/Support Request Modal */}
      {showComplaintModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[10003] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-2xl w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Request Support / Raise Complaint
              </h3>
              <button
                onClick={() => {
                  setShowComplaintModal(false);
                  setComplaintMessage('');
                  setComplaintSubject('');
                }}
                className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
              Need help with this report? Have a complaint? Request support or raise an issue, and our admin team will assist you.
            </p>
            {selectedPersonForReport && (
              <div className="mb-4">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Report For:
                </label>
                <p className="text-sm text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-700 px-3 py-2 rounded-lg">
                  {selectedPersonForReport.full_name || `${selectedPersonForReport.first_name || ''} ${selectedPersonForReport.last_name || ''}`.trim() || 'Unknown Person'} (ID: {selectedPersonForReport.id})
                </p>
              </div>
            )}
            <div className="mb-4">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Subject (Optional):
              </label>
              <input
                type="text"
                value={complaintSubject}
                onChange={(e) => setComplaintSubject(e.target.value)}
                placeholder="Brief description of your issue..."
                className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Message: <span className="text-red-500">*</span>
              </label>
              <textarea
                value={complaintMessage}
                onChange={(e) => setComplaintMessage(e.target.value)}
                placeholder="Describe your issue, request, or complaint in detail..."
                className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={5}
              />
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowComplaintModal(false);
                  setComplaintMessage('');
                  setComplaintSubject('');
                }}
                className="flex-1 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-semibold py-2 px-4 rounded-lg transition-colors"
                disabled={isSubmittingComplaint}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmitComplaint}
                className="flex-1 bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isSubmittingComplaint || !complaintMessage.trim()}
              >
                {isSubmittingComplaint ? (
                  <>
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Submitting...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    Submit Request
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Intelius-style Search Page */}
      {!isProcessing && showSearchPage && !showResultsPage && !isLoading && !selectedPerson && !showMultipleResultsModal ? (
        <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <h1 className="text-4xl md:text-5xl font-bold text-center text-slate-900 dark:text-white mb-8">
              Start Your People Search Today!
            </h1>

            {/* AI Search Toggle Button */}
            {!showAiSearch && (
              <div className="mb-8 flex justify-center">
                <button
                  type="button"
                  onClick={() => setShowAiSearch(true)}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-lg transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  Search with AI
                </button>
              </div>
            )}

            {/* AI-Powered Search Bar */}
            {showAiSearch && (
              <div className="mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-900 rounded-xl shadow-lg p-6 border border-blue-200 dark:border-slate-700">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                      AI-Powered Search
                    </h2>
                  </div>
                    <button
                      type="button"
                      onClick={() => {
                        setShowAiSearch(false);
                        setAiSearchQuery('');
                      }}
                      className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
                      aria-label="Close AI search"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                Ask in natural language: "Find John Smith in Accra", "Show me lawyers in Greater Accra", "People named Kwame who are doctors"
              </p>
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={aiSearchQuery}
                      onChange={(e) => setAiSearchQuery(e.target.value)}
                    placeholder="Ask me anything... (e.g., 'Find John Smith in Accra')"
                      className="flex-1 px-4 py-3 rounded-lg border border-blue-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-slate-400"
                      disabled={isAiSearching}
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={handleAiSearch}
                      disabled={!aiSearchQuery.trim() || isAiSearching}
                      className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors shadow-lg hover:shadow-xl flex items-center gap-2 whitespace-nowrap"
                    >
                      {isAiSearching ? (
                        <>
                          <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                      Searching...
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                          </svg>
                      Search
                        </>
                      )}
                    </button>
                </div>
              </div>
            )}

            {/* Separator - Only show if AI search is visible */}
            {showAiSearch && (
              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-300 dark:border-slate-600"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 font-medium">
                    OR
                  </span>
                </div>
              </div>
            )}

            {/* Search Form */}
            <form onSubmit={(e) => {
              e.preventDefault();
              handleAdvancedSearch();
            }} className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 md:p-8">
              <div className="mb-6">
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-4">
                  Search by Name
                </p>
                
                <div className="space-y-4">
                  <div className="relative">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={advancedSearchData.name}
                      onChange={handleNameChange}
                      onFocus={() => {
                        if (nameSuggestions.length > 0) {
                          setShowSuggestions(true);
                        }
                      }}
                      onBlur={() => {
                        // Delay hiding to allow click on suggestion
                        setTimeout(() => setShowSuggestions(false), 200);
                      }}
                      placeholder="Enter name"
                      className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    {/* Suggestions Dropdown */}
                    {showSuggestions && nameSuggestions.length > 0 && (
                      <div className="absolute z-50 w-full mt-1 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                        {nameSuggestions.map((suggestion, index) => (
                          <button
                            key={`${suggestion.id}-${index}`}
                            type="button"
                            onClick={() => handleSuggestionSelect(suggestion)}
                            className="w-full text-left px-4 py-3 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors border-b border-slate-200 dark:border-slate-700 last:border-b-0"
                          >
                            <div className="font-medium text-slate-900 dark:text-white">
                              {suggestion.name}
                            </div>
                            {(suggestion.first_name || suggestion.last_name) && (
                              <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                {suggestion.first_name && suggestion.last_name 
                                  ? `${suggestion.first_name} ${suggestion.last_name}`
                                  : suggestion.first_name || suggestion.last_name
                                }
                              </div>
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Location
                      </label>
                      <input
                        type="text"
                        name="location"
                        value={advancedSearchData.location}
                        onChange={(e) => setAdvancedSearchData({...advancedSearchData, location: e.target.value})}
                        placeholder="Enter location"
                        className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Profession
                      </label>
                      <input
                        type="text"
                        name="profession"
                        value={advancedSearchData.profession}
                        onChange={(e) => setAdvancedSearchData({...advancedSearchData, profession: e.target.value})}
                        placeholder="Enter profession"
                        className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  {/* Advanced Options - Collapsible at Bottom */}
                  <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
                      className="w-full flex items-center justify-between text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 hover:text-slate-900 dark:hover:text-white transition-colors"
                    >
                      <span>Advanced Options</span>
                      {showAdvancedOptions ? (
                        <ChevronUp className="w-5 h-5" />
                      ) : (
                        <ChevronDown className="w-5 h-5" />
                      )}
                    </button>
                    {showAdvancedOptions && (
                      <div className="space-y-4">
                        {/* Browse by Surname */}
                        <div>
                          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                            Browse by surname starting with
                          </label>
                          <div className="flex flex-wrap gap-2">
                            {alphabetLetters.map((letter) => (
                              <button
                                key={letter}
                                type="button"
                                onClick={() => {
                                  const newSurnameLetter = advancedSearchData.surnameLetter === letter ? '' : letter;
                                  setAdvancedSearchData({...advancedSearchData, surnameLetter: newSurnameLetter});
                                }}
                                className={`px-4 py-2 rounded-lg border-2 font-semibold transition-colors ${
                                  advancedSearchData.surnameLetter === letter
                                    ? 'bg-blue-600 text-white border-blue-600'
                                    : 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white border-slate-300 dark:border-slate-600 hover:bg-blue-50 dark:hover:bg-slate-800 hover:border-blue-500'
                                }`}
                              >
                                {letter}
                              </button>
                            ))}
                            {advancedSearchData.surnameLetter && (
                              <button
                                type="button"
                                onClick={() => setAdvancedSearchData({...advancedSearchData, surnameLetter: ''})}
                                className="px-4 py-2 rounded-lg border-2 border-red-300 text-red-600 hover:bg-red-50 font-semibold transition-colors"
                              >
                                Clear
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Database Type Selection */}
                        <div>
                          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                            Select Database
                          </label>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {searchableDatabaseOptions.map((option) => (
                              <label
                                key={option.id}
                                className="flex items-start gap-3 p-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-colors"
                              >
                                <input
                                  type="radio"
                                  name="databaseType"
                                  value={option.id}
                                  checked={advancedSearchData.databaseType === option.id}
                                  onChange={(e) => setAdvancedSearchData({...advancedSearchData, databaseType: e.target.value})}
                                  className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 flex-shrink-0"
                                />
                                <div className="flex-1 min-w-0">
                                  <div className="font-medium text-slate-900 dark:text-white text-sm">
                                    {option.label}
                                  </div>
                                  <div className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                                    {option.description}
                                  </div>
                                </div>
                              </label>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded-lg transition-colors shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                >
                  <Search className="h-5 w-5" />
                  Search
                </button>
                <button
                  type="button"
                  onClick={handleClearForm}
                  className="flex-1 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-semibold py-4 px-6 rounded-lg transition-colors shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                >
                  <X className="h-5 w-5" />
                  Clear
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {/* Main Content - Only show when search page is not active, results page is not active, and not during processing */}
      {!isProcessing && !showResultsPage && (!showSearchPage || persons.length > 0) && (
      <div className="px-6">
        {/* Main Content */}
        <div className="flex flex-col items-start self-stretch bg-white py-4 pr-4 gap-6 rounded-lg">
          {/* Breadcrumb */}
          <div className="flex items-start ml-4">
            <span className="text-[#525866] text-xs mr-[7px]">PERSONS</span>
            {selectedIndustry && (
              <>
            <img src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Iq8V0MifpP/8a5g6trk_expires_30_days.png" className="w-4 h-4 mr-1 object-fill" />
                <span className="text-[#040E1B] text-xs">{selectedIndustry.name?.toUpperCase() || 'SEARCH'}</span>
              </>
            )}
          </div>
          
          {/* Header with Title and Filters */}
          <div className="flex justify-between items-start self-stretch ml-4">
            <div className="flex flex-col items-start gap-2">
              <div className="flex items-center gap-1">
                <img src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Iq8V0MifpP/s5gimnel_expires_30_days.png" className="w-8 h-8 object-fill" />
                <img src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Iq8V0MifpP/3ne0aogy_expires_30_days.png" className="w-4 h-4 object-fill" />
                <span className="text-[#040E1B] text-xl font-bold">Persons</span>
              </div>
              <span className="text-[#070810] text-sm whitespace-nowrap">Search through all the persons in our database</span>
            </div>
            
            {/* Filter Section */}
            <div className="flex items-center">
              <span className="text-[#525866] text-xs mr-[25px] whitespace-nowrap">Show data for</span>
              
              {/* Region Dropdown */}
              <div className="relative mr-6" ref={regionDropdownRef}>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowRegionDropdown(!showRegionDropdown);
                    setShowTownDropdown(false);
                  }}
                  className="flex items-start bg-[#F7F8FA] text-left min-w-[120px] p-2 gap-1 rounded-lg border border-solid border-[#D4E1EA] hover:border-[#022658] transition-colors"
                >
                  <span className="text-[#070810] text-sm flex-1 truncate">{selectedRegion}</span>
                  {showRegionDropdown ? (
                    <ChevronUp className="w-4 h-4 text-[#525866] flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-[#525866] flex-shrink-0" />
                  )}
                </button>
                {showRegionDropdown && (
                  <div className="absolute top-full left-0 mt-1 w-[180px] bg-white rounded-lg border border-solid border-[#D4E1EA] shadow-lg z-50 max-h-[300px] overflow-y-auto">
                    {regions.map((region) => (
                      <button
                        key={region}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRegionChange(region);
                        }}
                        className={`w-full text-left px-4 py-2 hover:bg-[#F7F8FA] text-sm transition-colors ${
                          selectedRegion === region ? 'bg-[#F7F8FA] text-[#022658] font-semibold' : 'text-[#070810]'
                        }`}
                      >
                        {region}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Town Dropdown */}
              <div className="relative" ref={townDropdownRef}>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowTownDropdown(!showTownDropdown);
                    setShowRegionDropdown(false);
                  }}
                  className="flex items-start bg-[#F7F8FA] text-left min-w-[100px] p-2 gap-0.5 rounded-lg border border-solid border-[#D4E1EA] hover:border-[#022658] transition-colors"
                >
                  <span className="text-[#070810] text-sm flex-1 truncate">{selectedTown}</span>
                  {showTownDropdown ? (
                    <ChevronUp className="w-4 h-4 text-[#525866] flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-[#525866] flex-shrink-0" />
                  )}
                </button>
                {showTownDropdown && (
                  <div className="absolute top-full left-0 mt-1 w-[160px] bg-white rounded-lg border border-solid border-[#D4E1EA] shadow-lg z-50 max-h-[300px] overflow-y-auto">
                    {towns.map((town) => (
                      <button
                        key={town}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTownChange(town);
                        }}
                        className={`w-full text-left px-4 py-2 hover:bg-[#F7F8FA] text-sm transition-colors ${
                          selectedTown === town ? 'bg-[#F7F8FA] text-[#022658] font-semibold' : 'text-[#070810]'
                        }`}
                      >
                        {town}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center self-stretch mx-3.5 gap-4">
            {/* Stats Card 1 */}
            <div className="flex items-center bg-white flex-1 p-3 gap-3 rounded-lg border border-solid border-[#E5E8EC] shadow-sm">
              <img src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Iq8V0MifpP/fbxacd7r_expires_30_days.png" className="w-12 h-12 rounded-lg object-fill" />
              <div className="flex flex-col items-start gap-1">
                <span className="text-[#868C98] text-xs">Total number of Persons</span>
                <span className="text-[#F59E0B] text-lg font-bold">{stats.totalPersons.toLocaleString()}</span>
              </div>
            </div>
            
            {/* Stats Card 2 */}
            <div className="flex items-center bg-white flex-1 p-3 gap-3 rounded-lg border border-solid border-[#E5E8EC] shadow-sm">
              <img src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Iq8V0MifpP/gn289be3_expires_30_days.png" className="w-12 h-12 rounded-lg object-fill" />
              <div className="flex flex-col items-start gap-1">
                <span className="text-[#868C98] text-xs">Total Companies linked to persons</span>
                <span className="text-[#F59E0B] text-lg font-bold">{stats.totalCompanies.toLocaleString()}</span>
              </div>
            </div>
            
            {/* Stats Card 3 */}
            <div className="flex items-center bg-white flex-1 p-3 gap-3 rounded-lg border border-solid border-[#E5E8EC] shadow-sm">
              <img src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Iq8V0MifpP/9gnj90eb_expires_30_days.png" className="w-12 h-12 rounded-lg object-fill" />
              <div className="flex flex-col items-start gap-1">
                <span className="text-[#868C98] text-xs">Total amount of related data</span>
                <span className="text-[#F59E0B] text-lg font-bold">{stats.totalRelatedData.toLocaleString()}</span>
              </div>
            </div>
            
            {/* Add New Person Button */}
            <button 
              onClick={() => setShowAddForm(true)}
              className="flex items-center justify-center py-4 px-10 rounded-lg border-4 border-solid border-[#0F284726] cursor-pointer hover:opacity-90 transition-opacity whitespace-nowrap" 
              style={{ background: 'linear-gradient(180deg, #022658, #1A4983)' }}
            >
              <span className="text-white text-base font-bold">Add new person</span>
            </button>
          </div>

          <div className="flex flex-col self-stretch bg-white p-6 mx-3.5 gap-4 rounded-3xl">
            <div className="flex items-center justify-between self-stretch">
              {/* Search Person Input */}
              <div className="flex items-center bg-[#F7F8FA] px-3 py-2 gap-2 rounded-lg border border-solid border-[#E5E8EC]">
                <img 
                  src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Iq8V0MifpP/irj25gt8_expires_30_days.png" 
                  className="w-4 h-4 object-fill text-[#868C98]" 
                />
                <input
                  type="text"
                  placeholder="Search Person"
                  value={searchPersonQuery}
                  onChange={(e) => setSearchPersonQuery(e.target.value)}
                  className="text-[#868C98] bg-transparent text-sm py-1 border-0 outline-none w-[300px]"
                />
              </div>

              {/* Action Buttons Group */}
              <div className="flex items-center gap-3">
                {/* Filter Button */}
                <div className="relative" ref={filterDropdownRef}>
                  <button 
                    onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                    className="flex items-center px-4 py-2 gap-2 rounded-lg border border-solid border-[#D4E1EA] bg-white cursor-pointer hover:bg-gray-50 transition-colors"
                  >
                    <img 
                      src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Iq8V0MifpP/4oxe814z_expires_30_days.png" 
                      className="w-4 h-4 object-fill" 
                    />
                    <span className="text-[#525866] text-sm">Filter</span>
                    {showFilterDropdown ? (
                      <ChevronUp className="w-4 h-4 text-[#525866]" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-[#525866]" />
                    )}
                  </button>
                  {showFilterDropdown && (
                    <div className="absolute top-full right-0 mt-1 w-[320px] bg-white rounded-lg border border-solid border-[#D4E1EA] shadow-lg z-50 p-4">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-[#070810] text-sm font-bold">Filters</span>
                        <button
                          onClick={() => {
                            setSelectedRiskLevel('All');
                            setMinRiskScore('');
                            setMaxRiskScore('');
                            setSelectedCaseTypes([]);
                            setCurrentPage(1);
                          }}
                          className="text-[#F59E0B] text-xs hover:underline"
                        >
                          Clear All
                        </button>
                      </div>

                      {/* Risk Level Filter */}
                      <div className="mb-4">
                        <label className="text-[#525866] text-xs font-medium mb-2 block">Risk Level</label>
                        <div className="flex flex-wrap gap-2">
                          {riskLevels.map((level) => (
                            <button
                              key={level}
                              onClick={() => {
                                setSelectedRiskLevel(level);
                                setCurrentPage(1);
                              }}
                              className={`px-3 py-1.5 rounded-lg text-xs transition-colors ${
                                selectedRiskLevel === level
                                  ? 'bg-[#022658] text-white'
                                  : 'bg-[#F7F8FA] text-[#070810] hover:bg-[#E5E8EC]'
                              }`}
                            >
                              {level}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Risk Score Range Filter */}
                      <div className="mb-4">
                        <label className="text-[#525866] text-xs font-medium mb-2 block">Risk Score Range</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min="0"
                            max="200"
                            placeholder="Min"
                            value={minRiskScore}
                            onChange={(e) => {
                              setMinRiskScore(e.target.value);
                              setCurrentPage(1);
                            }}
                            className="flex-1 px-3 py-1.5 rounded-lg border border-solid border-[#D4E1EA] text-sm outline-none focus:border-[#022658]"
                          />
                          <span className="text-[#525866] text-xs">to</span>
                          <input
                            type="number"
                            min="0"
                            max="200"
                            placeholder="Max"
                            value={maxRiskScore}
                            onChange={(e) => {
                              setMaxRiskScore(e.target.value);
                              setCurrentPage(1);
                            }}
                            className="flex-1 px-3 py-1.5 rounded-lg border border-solid border-[#D4E1EA] text-sm outline-none focus:border-[#022658]"
                          />
                        </div>
                      </div>

                      {/* Case Types Filter */}
                      <div className="mb-4">
                        <label className="text-[#525866] text-xs font-medium mb-2 block">Case Types</label>
                        <div className="max-h-[120px] overflow-y-auto border border-solid border-[#D4E1EA] rounded-lg p-2">
                          {caseTypeOptions.map((type) => (
                            <label
                              key={type}
                              className="flex items-center py-1.5 px-2 hover:bg-[#F7F8FA] rounded cursor-pointer"
                            >
                              <input
                                type="checkbox"
                                checked={selectedCaseTypes.includes(type)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedCaseTypes([...selectedCaseTypes, type]);
                                  } else {
                                    setSelectedCaseTypes(selectedCaseTypes.filter(t => t !== type));
                                  }
                                  setCurrentPage(1);
                                }}
                                className="mr-2 w-4 h-4 text-[#022658] border-[#D4E1EA] rounded focus:ring-[#022658]"
                              />
                              <span className="text-[#070810] text-xs">{type}</span>
                            </label>
                          ))}
                        </div>
                        {selectedCaseTypes.length > 0 && (
                          <div className="mt-2 text-xs text-[#525866]">
                            {selectedCaseTypes.length} selected
                          </div>
                        )}
                      </div>

                      {/* Active Filters Summary */}
                      {(selectedRiskLevel !== 'All' || minRiskScore || maxRiskScore || selectedCaseTypes.length > 0) && (
                        <div className="pt-3 border-t border-[#E5E8EC]">
                          <div className="text-xs text-[#525866] mb-2">Active Filters:</div>
                          <div className="flex flex-wrap gap-1">
                            {selectedRiskLevel !== 'All' && (
                              <span className="px-2 py-1 bg-[#F7F8FA] text-[#070810] text-xs rounded">
                                Risk: {selectedRiskLevel}
                              </span>
                            )}
                            {(minRiskScore || maxRiskScore) && (
                              <span className="px-2 py-1 bg-[#F7F8FA] text-[#070810] text-xs rounded">
                                Score: {minRiskScore || '0'}-{maxRiskScore || '200'}
                              </span>
                            )}
                            {selectedCaseTypes.length > 0 && (
                              <span className="px-2 py-1 bg-[#F7F8FA] text-[#070810] text-xs rounded">
                                Cases: {selectedCaseTypes.length}
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Sort Button */}
                <div className="relative" ref={sortDropdownRef}>
                  <button 
                    onClick={() => setShowSortDropdown(!showSortDropdown)}
                    className="flex items-center px-4 py-2 gap-2 rounded-lg border border-solid border-[#D4E1EA] bg-white cursor-pointer hover:bg-gray-50 transition-colors"
                  >
                    <img 
                      src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Iq8V0MifpP/p2ou1r56_expires_30_days.png" 
                      className="w-4 h-4 object-fill" 
                    />
                    <span className="text-[#525866] text-sm">Sort</span>
                    {showSortDropdown ? (
                      <ChevronUp className="w-4 h-4 text-[#525866]" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-[#525866]" />
                    )}
                  </button>
                  {showSortDropdown && (
                    <div className="absolute top-full right-0 mt-1 w-[220px] bg-white rounded-lg border border-solid border-[#D4E1EA] shadow-lg z-50 max-h-[300px] overflow-y-auto">
                      {sortOptions.map((option) => {
                        const isSelected = (sortBy === option.value.replace('_desc', '') && 
                                          (option.value.endsWith('_desc') ? sortOrder === 'desc' : sortOrder === 'asc')) ||
                                          (sortBy === option.value && sortOrder === 'asc');
                        return (
                          <button
                            key={option.value}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSortChange(option.value);
                            }}
                            className={`w-full text-left px-4 py-2 hover:bg-[#F7F8FA] text-sm transition-colors ${
                              isSelected ? 'bg-[#F7F8FA] text-[#022658] font-semibold' : 'text-[#070810]'
                            }`}
                          >
                            {option.label}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Export List Button */}
                <div className="relative" ref={exportDropdownRef}>
                  <button 
                    onClick={() => {
                      setShowExportDropdown(!showExportDropdown);
                      setShowSortDropdown(false);
                      setShowFilterDropdown(false);
                    }}
                    className="flex items-center px-4 py-2 gap-2 rounded-lg border border-solid border-[#F59E0B] bg-white hover:bg-orange-50 transition-colors"
                  >
                    <span className="text-[#F59E0B] text-sm font-medium">Export list</span>
                    {showExportDropdown ? (
                      <ChevronUp className="w-4 h-4 text-[#F59E0B]" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-[#F59E0B]" />
                    )}
                  </button>
                  {showExportDropdown && (
                    <div className="absolute top-full right-0 mt-1 w-[180px] bg-white rounded-lg border border-solid border-[#D4E1EA] shadow-lg z-50">
                      <button
                        onClick={exportToCSV}
                        className="w-full text-left px-4 py-2 hover:bg-[#F7F8FA] text-sm transition-colors text-[#070810] border-b border-[#E5E8EC]"
                      >
                        📄 Export to CSV
                      </button>
                      <button
                        onClick={exportToExcel}
                        className="w-full text-left px-4 py-2 hover:bg-[#F7F8FA] text-sm transition-colors text-[#070810] border-b border-[#E5E8EC]"
                      >
                        📊 Export to Excel
                      </button>
                      <button
                        onClick={exportToPDF}
                        className="w-full text-left px-4 py-2 hover:bg-[#F7F8FA] text-sm transition-colors text-[#070810]"
                      >
                        📑 Export to PDF
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Loading State */}
            {isLoading && (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#022658]"></div>
                <span className="ml-3 text-[#525866] text-sm">Loading persons...</span>
              </div>
            )}

            {/* Table */}
            {!isLoading && (
              <div className="flex flex-col w-full gap-1 rounded-[14px] border border-solid border-[#E5E8EC] overflow-hidden">
                <div className="flex items-center bg-[#F4F6F9] py-4 px-3">
                  <div className="flex-1 min-w-[150px] py-[7px] px-2"><span className="text-[#070810] text-sm font-bold">Name</span></div>
                  <div className="flex-1 min-w-[120px] py-[7px] px-2"><span className="text-[#070810] text-sm font-bold">Contact</span></div>
                  <div className="flex-1 min-w-[100px] py-[7px] px-2"><span className="text-[#070810] text-sm font-bold">D-O-B</span></div>
                  <div className="flex-1 min-w-[120px] py-[7px] px-2"><span className="text-[#070810] text-sm font-bold">Birth place</span></div>
                  <div className="flex-1 min-w-[120px] py-[7px] px-2"><span className="text-[#070810] text-sm font-bold">Region</span></div>
                  <div className="flex-1 min-w-[120px] py-[7px] px-2"><span className="text-[#070810] text-sm font-bold">Position</span></div>
                  <div className="flex-1 min-w-[120px] py-[7px] px-2"><span className="text-[#070810] text-sm font-bold">Appointment date</span></div>
                  <div className="w-[80px] py-[7px] px-2 text-center"><span className="text-[#070810] text-sm font-bold">Cases</span></div>
                  <div className="w-[120px] py-[7px] px-2"><span className="text-[#070810] text-sm font-bold">Risk score</span></div>
                </div>

                {persons.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 gap-2">
                    <span className="text-[#868C98] text-sm">No persons found</span>
                    {selectedEntity && (
                      <span className="text-[#868C98] text-xs">
                        No people found for {selectedEntity.name}. 
                        {selectedIndustry.id === 'banking' 
                          ? ' People may not have this bank set as their employer.' 
                          : ' People may not have this organization linked.'}
                      </span>
                    )}
                    {!isLoading && (
                      <button
                        onClick={() => {
                          // Temporarily remove entity filter to test
                          const testParams = new URLSearchParams({
                            page: '1',
                            limit: itemsPerPage.toString(),
                            sort_by: sortBy,
                            sort_order: sortOrder
                          });
                          apiGet(`/people/search?${testParams.toString()}`)
                            .then(data => {
                              console.log('Test - Total people in database:', data.total || 0);
                              alert(`Total people in database: ${data.total || 0}`);
                            })
                            .catch(err => {
                              console.error('Test failed:', err);
                              alert('Error testing API: ' + err.message);
                            });
                        }}
                        className="mt-2 px-4 py-2 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                      >
                        Test: Check total people in database
                      </button>
                    )}
                  </div>
                ) : (
                  persons.map((person, index) => (
                    <div 
                      key={person.id || index} 
                      className="flex items-center py-3 px-3 hover:bg-blue-50 cursor-pointer border-t border-[#F4F6F9] transition-colors"
                      onClick={() => setSelectedPerson(person)}
                    >
                      <div className="flex-1 min-w-[150px] py-[7px] px-2"><span className="text-[#070810] text-sm">{person.name}</span></div>
                      <div className="flex-1 min-w-[120px] py-[7px] px-2"><span className="text-[#070810] text-sm">{person.contact}</span></div>
                      <div className="flex-1 min-w-[100px] py-[7px] px-2"><span className="text-[#070810] text-sm">{person.dob}</span></div>
                      <div className="flex-1 min-w-[120px] py-[7px] px-2"><span className="text-[#070810] text-sm">{person.birthPlace}</span></div>
                      <div className="flex-1 min-w-[120px] py-[7px] px-2"><span className="text-[#070810] text-sm">{person.region || 'N/A'}</span></div>
                      <div className="flex-1 min-w-[120px] py-[7px] px-2"><span className="text-[#070810] text-sm">{person.position}</span></div>
                      <div className="flex-1 min-w-[120px] py-[7px] px-2"><span className="text-[#070810] text-sm">{person.appointmentDate}</span></div>
                      <div className="w-[80px] py-[7px] px-2 text-center"><span className="text-[#070810] text-sm">{person.cases}</span></div>
                      <div className="w-[120px] py-2 px-2">
                        <button className={`flex items-center justify-center w-full ${person.riskBg} py-[6px] rounded-lg border-0`}>
                          <span className={`${person.riskColor} text-xs font-medium`}>{person.riskScore}</span>
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Pagination */}
          {!isLoading && totalPages > 0 ? (
            <div className="flex flex-col items-center self-stretch">
              <div className="flex items-center">
                <span className="text-[#525866] text-sm mr-[42px]">
                  {startIndex}-{endIndex} of {totalResults.toLocaleString()}
                </span>
                
                {/* Previous Button */}
                <button 
                  onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="flex items-start bg-white text-left w-[70px] py-2 px-3 mr-1.5 gap-1 rounded border border-solid border-[#D4E1EA] hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <img src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Iq8V0MifpP/1f8v09v3_expires_30_days.png" className="w-4 h-4 rounded object-fill" />
                  <span className="text-[#525866] text-xs">Back</span>
                </button>

                {/* Page Numbers */}
                {getPaginationButtons().map((page, index) => {
                  if (page === '...') {
                    return (
                      <img 
                        key={`ellipsis-${index}`}
                        src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Iq8V0MifpP/ys8451ey_expires_30_days.png" 
                        className="w-[31px] h-8 mr-1.5 object-fill" 
                        alt="..."
                      />
                    );
                  }
                  
                  const isActive = page === currentPage;
                  const width = page.toString().length === 1 ? 'w-[29px]' : page.toString().length === 2 ? 'w-[31px]' : 'w-[37px]';
                  
                  return (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`flex flex-col items-start ${width} py-[7px] px-2 mr-1.5 rounded border border-solid ${
                        isActive 
                          ? 'bg-[#022658] border-[#022658]' 
                          : 'bg-white border-[#D4E1EA] hover:bg-gray-50'
                      }`}
                    >
                      <span className={`text-xs ${isActive ? 'text-white font-bold' : 'text-[#525866]'}`}>
                        {page}
                      </span>
                    </button>
                  );
                })}

                {/* Next Button */}
                <button 
                  onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="flex items-start bg-white text-left w-[68px] py-2 px-3 mr-10 gap-1.5 rounded border border-solid border-[#D4E1EA] hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="text-[#525866] text-xs">Next</span>
                  <img src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Iq8V0MifpP/lv0g81i0_expires_30_days.png" className="w-4 h-4 rounded object-fill" alt="next" />
                </button>

                {/* Go to Page */}
                <div className="flex items-center w-[119px]">
                  <span className="text-[#040E1B] text-sm mr-[11px]">Page</span>
                  <input
                    type="number"
                    min="1"
                    max={totalPages}
                    value={pageInputValue}
                    onChange={(e) => setPageInputValue(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleGoToPage();
                      }
                    }}
                    className="flex flex-col items-start bg-white w-[51px] py-1.5 pl-2 mr-2 rounded border border-solid border-[#F59E0B] text-[#040E1B] text-sm outline-none"
                  />
                  <button 
                    onClick={handleGoToPage}
                    className="text-[#F59E0B] text-sm font-bold cursor-pointer hover:underline"
                  >
                    Go
                  </button>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
      )}
    </div>
  );
};

export default PersonsManagementFigma;
