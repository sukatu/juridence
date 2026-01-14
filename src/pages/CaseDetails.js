import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { 
  ArrowLeft, 
  Calendar, 
  User, 
  Building2, 
  Scale, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  AlertTriangle,
  FileText,
  Users,
  Banknote,
  Gavel,
  BookOpen,
  MapPin,
  Tag,
  ExternalLink,
  Download,
  Copy,
  ChevronDown,
  ChevronUp,
  Shield,
  Eye,
  X,
  TrendingUp,
  DollarSign,
  Percent,
  Calculator,
  History,
  Search,
  ChevronLeft,
  ChevronRight,
  Share2,
  Maximize,
  Minimize,
  Facebook,
  Twitter,
  MessageCircle,
  Check
} from 'lucide-react';
import AIChat from '../components/AIChat';

const CaseDetails = () => {
  const { caseId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [caseData, setCaseData] = useState(null);
  const [relatedCases, setRelatedCases] = useState([]);
  const [originalPersonCases, setOriginalPersonCases] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalClosing, setIsModalClosing] = useState(false);
  const [modalSearchQuery, setModalSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0);
  const [isSearching, setIsSearching] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    basicInfo: true,
    caseSummary: true,
    people: false,
    riskAssessment: true,
    financialImpact: true,
    caseTimeline: true,
    caseDocuments: true,
    subjectMatter: true
  });
  
  // AI Chat state
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);

  // Document modal state
  const [isDocumentModalOpen, setIsDocumentModalOpen] = useState(false);
  const [isDocumentFullscreen, setIsDocumentFullscreen] = useState(false);

  // Get search query from URL params
  const searchParams = new URLSearchParams(location.search);
  const searchQuery = searchParams.get('q') || ''; // Full person name
  const originalSearch = searchParams.get('search') || searchQuery; // Original search term

  useEffect(() => {
    if (caseId) {
      // Check if we have original person cases from navigation state
      const state = location.state;
      if (state && state.originalPersonCases) {
        setOriginalPersonCases(state.originalPersonCases);
      }
      loadCaseDetails();
    } else {
      console.error('No caseId provided');
      setError('No case ID provided');
      setLoading(false);
    }
  }, [caseId, location.state]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadCaseDetails = async () => {
    try {
      setLoading(true);
      
      const token = localStorage.getItem('accessToken') || 'test-token-123';
      
      // Load case details first
      const caseResponse = await fetch(`/api/case-search/${caseId}/details`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      
      if (caseResponse.ok) {
        const data = await caseResponse.json();
        setCaseData(data);
        
        // After loading case data, determine if this is an insurance-related case
        const isInsuranceCase = checkIfInsuranceCase(data);
        
        if (isInsuranceCase) {
          // Load insurance-related cases
          await loadInsuranceRelatedCases(data);
        } else {
          // Load person-related cases as before
          await loadPersonRelatedCases();
        }
      } else {
        const errorText = await caseResponse.text();
        console.error('API Error:', errorText);
        setError(`Failed to load case details: ${caseResponse.status} - ${errorText}`);
      }
    } catch (err) {
      setError('Error loading case details');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const checkIfInsuranceCase = (caseData) => {
    const insuranceNames = [
      'SIC Insurance', 'Vanguard Assurance', 'Metropolitan Insurance', 'Enterprise Insurance',
      'Ghana Reinsurance', 'Star Assurance', 'Provident Insurance', 'Donewell Insurance',
      'GLICO Insurance', 'Quality Insurance', 'Prudential Life Insurance', 'Old Mutual Life Assurance',
      'Sanlam Life Insurance', 'Allianz Life Insurance', 'AXA Mansard Insurance', 'Zenith General Insurance',
      'Cornerstone Insurance', 'Leadway Assurance', 'Mutual Benefits Assurance', 'Custodian Life Insurance',
      'FBN Insurance', 'AIICO Insurance', 'Lagos Building Investment', 'NEM Insurance',
      'Wapic Insurance', 'Sovereign Trust Insurance', 'Consolidated Hallmark Insurance', 'Linkage Assurance',
      'Lasaco Assurance', 'Royal Exchange General Insurance', 'Hygeia HMO', 'Avon Healthcare',
      'Clearline HMO', 'Reliance HMO', 'Total Health Trust', 'Health Partners HMO',
      'Mediplan Healthcare', 'Wellness HMO', 'Ultimate Health HMO', 'Prepaid Medicare',
      'IHMS HMO', 'Ronsberger HMO', 'Vcare HMO', 'Healthguard HMO',
      'ProHealth HMO', 'Healthplus HMO', 'SIC Insurance Company', 'Vanguard Assurance Company',
      'Metropolitan Insurance Company', 'Enterprise Insurance Company', 'Ghana Reinsurance Company',
      'Star Assurance Company', 'Provident Insurance Company', 'Donewell Insurance Company',
      'GLICO General Insurance', 'Quality Insurance Company', 'Prudential Life Insurance Company',
      'Old Mutual Life Assurance Company', 'Sanlam Life Insurance Company', 'Allianz Life Insurance Company',
      'AXA Mansard Insurance Company', 'Zenith General Insurance Company', 'Cornerstone Insurance Company',
      'Leadway Assurance Company', 'Mutual Benefits Assurance Company', 'Custodian Life Insurance Company',
      'FBN Insurance Company', 'AIICO Insurance Company', 'Lagos Building Investment Company',
      'NEM Insurance Company', 'Wapic Insurance Company', 'Sovereign Trust Insurance Company',
      'Consolidated Hallmark Insurance Company', 'Linkage Assurance Company', 'Lasaco Assurance Company',
      'Royal Exchange General Insurance Company', 'Hygeia HMO Company', 'Avon Healthcare Company',
      'Clearline HMO Company', 'Reliance HMO Company', 'Total Health Trust Company',
      'Health Partners HMO Company', 'Mediplan Healthcare Company', 'Wellness HMO Company',
      'Ultimate Health HMO Company', 'Prepaid Medicare Company', 'IHMS HMO Company',
      'Ronsberger HMO Company', 'Vcare HMO Company', 'Healthguard HMO Company',
      'ProHealth HMO Company', 'Healthplus HMO Company'
    ];
    
    const protagonist = caseData?.protagonist || '';
    const antagonist = caseData?.antagonist || '';
    const title = caseData?.title || '';
    
    return insuranceNames.some(insurance => 
      protagonist.toLowerCase().includes(insurance.toLowerCase()) ||
      antagonist.toLowerCase().includes(insurance.toLowerCase()) ||
      title.toLowerCase().includes(insurance.toLowerCase())
    );
  };

  const loadInsuranceRelatedCases = async (caseData) => {
    try {
      // Find the insurance company name from the case data
      const insuranceNames = [
        'SIC Insurance', 'Vanguard Assurance', 'Metropolitan Insurance', 'Enterprise Insurance',
        'Ghana Reinsurance', 'Star Assurance', 'Provident Insurance', 'Donewell Insurance',
        'GLICO Insurance', 'Quality Insurance', 'Prudential Life Insurance', 'Old Mutual Life Assurance',
        'Sanlam Life Insurance', 'Allianz Life Insurance', 'AXA Mansard Insurance', 'Zenith General Insurance',
        'Cornerstone Insurance', 'Leadway Assurance', 'Mutual Benefits Assurance', 'Custodian Life Insurance',
        'FBN Insurance', 'AIICO Insurance', 'Lagos Building Investment', 'NEM Insurance',
        'Wapic Insurance', 'Sovereign Trust Insurance', 'Consolidated Hallmark Insurance', 'Linkage Assurance',
        'Lasaco Assurance', 'Royal Exchange General Insurance', 'Hygeia HMO', 'Avon Healthcare',
        'Clearline HMO', 'Reliance HMO', 'Total Health Trust', 'Health Partners HMO',
        'Mediplan Healthcare', 'Wellness HMO', 'Ultimate Health HMO', 'Prepaid Medicare',
        'IHMS HMO', 'Ronsberger HMO', 'Vcare HMO', 'Healthguard HMO',
        'ProHealth HMO', 'Healthplus HMO', 'SIC Insurance Company', 'Vanguard Assurance Company',
        'Metropolitan Insurance Company', 'Enterprise Insurance Company', 'Ghana Reinsurance Company',
        'Star Assurance Company', 'Provident Insurance Company', 'Donewell Insurance Company',
        'GLICO General Insurance', 'Quality Insurance Company', 'Prudential Life Insurance Company',
        'Old Mutual Life Assurance Company', 'Sanlam Life Insurance Company', 'Allianz Life Insurance Company',
        'AXA Mansard Insurance Company', 'Zenith General Insurance Company', 'Cornerstone Insurance Company',
        'Leadway Assurance Company', 'Mutual Benefits Assurance Company', 'Custodian Life Insurance Company',
        'FBN Insurance Company', 'AIICO Insurance Company', 'Lagos Building Investment Company',
        'NEM Insurance Company', 'Wapic Insurance Company', 'Sovereign Trust Insurance Company',
        'Consolidated Hallmark Insurance Company', 'Linkage Assurance Company', 'Lasaco Assurance Company',
        'Royal Exchange General Insurance Company', 'Hygeia HMO Company', 'Avon Healthcare Company',
        'Clearline HMO Company', 'Reliance HMO Company', 'Total Health Trust Company',
        'Health Partners HMO Company', 'Mediplan Healthcare Company', 'Wellness HMO Company',
        'Ultimate Health HMO Company', 'Prepaid Medicare Company', 'IHMS HMO Company',
        'Ronsberger HMO Company', 'Vcare HMO Company', 'Healthguard HMO Company',
        'ProHealth HMO Company', 'Healthplus HMO Company'
      ];
      
      const protagonist = caseData?.protagonist || '';
      const antagonist = caseData?.antagonist || '';
      const title = caseData?.title || '';
      
      const foundInsurance = insuranceNames.find(insurance => 
        protagonist.toLowerCase().includes(insurance.toLowerCase()) ||
        antagonist.toLowerCase().includes(insurance.toLowerCase()) ||
        title.toLowerCase().includes(insurance.toLowerCase())
      );
      
      if (foundInsurance) {
        
        // Search for cases related to this insurance company
        const searchResponse = await fetch(`/api/case-search/search?query=${encodeURIComponent(foundInsurance)}&limit=8`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken') || 'test-token-123'}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (searchResponse.ok) {
          const searchData = await searchResponse.json();
          
          // Filter out the current case and format the results
          const relatedCases = (searchData.results || []).filter(caseItem => caseItem.id !== parseInt(caseId));
          setRelatedCases(relatedCases);
        } else {
          setRelatedCases([]);
        }
      } else {
        setRelatedCases([]);
      }
    } catch (err) {
      console.error('Error loading insurance-related cases:', err);
      setRelatedCases([]);
    }
  };

  const loadPersonRelatedCases = async () => {
    try {
      const token = localStorage.getItem('accessToken') || 'test-token-123';
      
      const relatedResponse = await fetch(`/api/case-search/${caseId}/related-cases?limit=8`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (relatedResponse.ok) {
        const relatedData = await relatedResponse.json();
        
        // If we have original person cases, filter to only show those
        if (originalPersonCases) {
          const originalCaseIds = originalPersonCases.map(caseItem => caseItem.id);
          const filteredCases = relatedData.related_cases.filter(relatedCase => 
            originalCaseIds.includes(relatedCase.id)
          );
          setRelatedCases(filteredCases);
        } else {
          setRelatedCases(relatedData.related_cases || []);
        }
      } else {
        setRelatedCases([]);
      }
    } catch (err) {
      console.error('Error loading person-related cases:', err);
      setRelatedCases([]);
    }
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const closeModal = () => {
    setIsModalClosing(true);
    setTimeout(() => {
      setIsModalOpen(false);
      setIsModalClosing(false);
      // Reset search when closing modal
      setModalSearchQuery('');
      setSearchResults([]);
      setCurrentMatchIndex(0);
    }, 300);
  };

  // Search functionality within modal
  const searchInContent = (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      setCurrentMatchIndex(0);
      return;
    }

    setIsSearching(true);
    const content = caseData?.summernote_content || caseData?.summernote || caseData?.summarnote || caseData?.metadata?.case_summary || caseData?.case_summary || '';
    
    // Remove HTML tags for searching
    const textContent = content.replace(/<[^>]*>/g, '');
    const regex = new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
    const matches = [];
    let match;

    while ((match = regex.exec(textContent)) !== null) {
      matches.push({
        index: match.index,
        text: match[0],
        start: match.index,
        end: match.index + match[0].length
      });
    }

    setSearchResults(matches);
    setCurrentMatchIndex(0);
    setIsSearching(false);
  };

  const highlightSearchResults = (content, query) => {
    if (!query.trim()) return content;
    
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    return content.replace(regex, '<mark class="bg-yellow-300 px-1 rounded">$1</mark>');
  };

  const goToNextMatch = () => {
    if (searchResults.length > 0) {
      const nextIndex = (currentMatchIndex + 1) % searchResults.length;
      setCurrentMatchIndex(nextIndex);
      scrollToMatch(nextIndex);
    }
  };

  const goToPreviousMatch = () => {
    if (searchResults.length > 0) {
      const prevIndex = currentMatchIndex === 0 ? searchResults.length - 1 : currentMatchIndex - 1;
      setCurrentMatchIndex(prevIndex);
      scrollToMatch(prevIndex);
    }
  };

  const scrollToMatch = (index) => {
    const marks = document.querySelectorAll('.bg-yellow-300');
    if (marks[index]) {
      marks[index].scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center' 
      });
      // Add a temporary highlight effect
      marks[index].classList.add('bg-yellow-400');
      setTimeout(() => {
        marks[index].classList.remove('bg-yellow-400');
      }, 1000);
    }
  };

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setModalSearchQuery(query);
    searchInContent(query);
  };

  // Sharing and download functionality
  const getCaseContent = () => {
    return caseData?.summernote_content || caseData?.summernote || caseData?.summarnote || caseData?.metadata?.case_summary || caseData?.case_summary || '';
  };

  const getPlainTextContent = () => {
    return getCaseContent().replace(/<[^>]*>/g, '');
  };

  const copyModalContent = async () => {
    try {
      await navigator.clipboard.writeText(getPlainTextContent());
      // Show success feedback
      const button = document.querySelector('[data-copy-button]');
      if (button) {
        const originalText = button.innerHTML;
        button.innerHTML = '<Check className="w-4 h-4" /><span>Copied!</span>';
        setTimeout(() => {
          button.innerHTML = originalText;
        }, 2000);
      }
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  const shareToTwitter = () => {
    const text = `Check out this case: ${caseData?.title || 'Case Details'}`;
    const url = window.location.href;
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
    window.open(twitterUrl, '_blank', 'width=600,height=400');
  };

  const shareToFacebook = () => {
    const url = window.location.href;
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
    window.open(facebookUrl, '_blank', 'width=600,height=400');
  };

  const shareToWhatsApp = () => {
    const text = `Check out this case: ${caseData?.title || 'Case Details'}`;
    const url = window.location.href;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`;
    window.open(whatsappUrl, '_blank');
  };

  const downloadCase = () => {
    const content = getPlainTextContent();
    const title = caseData?.title || 'Case Details';
    const filename = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.txt`;
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const getShareUrl = () => {
    return window.location.href;
  };

  // Keyboard shortcuts for search navigation and actions
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isModalOpen) return;
      
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'f':
            e.preventDefault();
            document.querySelector('input[placeholder*="Search within case content"]')?.focus();
            break;
          case 'g':
            e.preventDefault();
            if (e.shiftKey) {
              goToPreviousMatch();
            } else {
              goToNextMatch();
            }
            break;
          case 'c':
            e.preventDefault();
            copyModalContent();
            break;
          case 's':
            e.preventDefault();
            downloadCase();
            break;
          case 'Enter':
            if (e.shiftKey) {
              e.preventDefault();
              toggleFullscreen();
            }
            break;
        }
      }
      
      // ESC key to close modal or exit fullscreen
      if (e.key === 'Escape') {
        if (isFullscreen) {
          setIsFullscreen(false);
        } else {
          closeModal();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isModalOpen, searchResults, currentMatchIndex, isFullscreen]);

  // Close share menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showShareMenu && !event.target.closest('[data-share-menu]')) {
        setShowShareMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showShareMenu]);

  // Handle keyboard events for document modal
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && isDocumentModalOpen) {
        setIsDocumentModalOpen(false);
        setIsDocumentFullscreen(false);
      }
    };

    if (isDocumentModalOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isDocumentModalOpen]);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const formatRegion = (regionCode) => {
    if (!regionCode) return 'N/A';
    
    const regionMappings = {
      'GAR': 'Greater Accra Region',
      'ASR': 'Ashanti Region', 
      'UWR': 'Upper West Region',
      'UER': 'Upper East Region',
      'NR': 'Northern Region',
      'BR': 'Brong-Ahafo Region',
      'VR': 'Volta Region',
      'ER': 'Eastern Region',
      'CR': 'Central Region',
      'WR': 'Western Region',
      'WNR': 'Western North Region',
      'AHA': 'Ahafo Region',
      'BON': 'Bono Region',
      'BON': 'Bono East Region',
      'OTI': 'Oti Region',
      'SAV': 'Savannah Region',
      'NEA': 'North East Region'
    };
    
    return regionMappings[regionCode.toUpperCase()] || regionCode;
  };

  const formatArray = (arr) => {
    if (!arr || !Array.isArray(arr)) return [];
    return arr;
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
  };

  // Court type mapping function
  const getCourtTypeName = (courtType) => {
    if (!courtType) return 'N/A';
    
    const courtTypeMap = {
      'SC': 'Supreme Court',
      'HC': 'High Court', 
      'CA': 'Court of Appeal',
      'supreme court': 'Supreme Court',
      'high court': 'High Court',
      'court of appeal': 'Court of Appeal',
      'SUPREME COURT': 'Supreme Court',
      'HIGH COURT': 'High Court',
      'COURT OF APPEAL': 'Court of Appeal'
    };
    
    return courtTypeMap[courtType] || courtType;
  };

  const getOutcomeIcon = (outcome) => {
    switch (outcome?.toLowerCase()) {
      case 'favorable':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'unfavorable':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'mixed':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const SectionHeader = ({ title, icon: Icon, isExpanded, onToggle }) => (
    <button
      onClick={onToggle}
      className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
    >
      <div className="flex items-center space-x-3">
        <Icon className="w-5 h-5 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      </div>
      {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
    </button>
  );

  const InfoRow = ({ label, value, icon: Icon, copyable = false }) => {
    if (!value) return null;
    
    return (
      <div className="flex items-start space-x-3 py-2">
        {Icon && <Icon className="w-4 h-4 text-gray-500 mt-1 flex-shrink-0" />}
        <div className="flex-1">
          <span className="text-sm font-medium text-gray-600">{label}:</span>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-900">{value}</span>
            {copyable && (
              <button
                onClick={() => copyToClipboard(value)}
                className="p-1 hover:bg-gray-200 rounded"
                title="Copy to clipboard"
              >
                <Copy className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  const ArrayDisplay = ({ label, items, icon: Icon }) => {
    if (!items || !Array.isArray(items) || items.length === 0) return null;
    
    return (
      <div className="py-2">
        <div className="flex items-center space-x-2 mb-2">
          {Icon && <Icon className="w-4 h-4 text-gray-500" />}
          <span className="text-sm font-medium text-gray-600">{label}:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {items.map((item, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
            >
              {item}
            </span>
          ))}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading case details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!caseData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Case not found</p>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Fixed Header */}
      <div className="fixed top-0 left-0 right-0 bg-white shadow-sm border-b z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate(-1)}
                className="flex items-center justify-center p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-700 hover:text-gray-900 border border-gray-200 hover:border-gray-300"
                title="Go back"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="flex-1 min-w-0">
                {/* Person Name - Prominently displayed */}
                {searchQuery && (
                  <div className="mb-2">
                    <h1 className="text-2xl font-bold text-blue-900 break-words leading-tight">
                      {searchQuery}
                    </h1>
                    <div className="flex items-center space-x-2 text-sm text-blue-600">
                      <User className="w-4 h-4" />
                      <span>Person Profile</span>
                    </div>
                  </div>
                )}

                {/* Bank Name - Display if bank is involved in the case */}
                {(() => {
                  // List of known bank names to check against
                  const bankNames = [
                    'Access Bank', 'Ghana Commercial Bank', 'Ecobank', 'Standard Chartered Bank',
                    'Absa Bank', 'Fidelity Bank', 'Agricultural Development Bank', 'Bank of Africa',
                    'Bank of Ghana', 'Consolidated Bank Ghana', 'First Atlantic Bank', 'Guaranty Trust Bank',
                    'National Investment Bank', 'Omnibsic Bank', 'Prudential Bank', 'Societe Generale',
                    'Stanbic Bank', 'The Royal Bank', 'Universal Merchant Bank', 'Zenith Bank',
                    'ABII National Bank', 'CalBank', 'CBG Bank', 'First Bank of Nigeria',
                    'Ghana Exim Bank', 'NIB Bank', 'Republic Bank', 'Societe Generale Bank'
                  ];
                  
                  // Check protagonist and antagonist fields for bank names
                  const protagonist = caseData?.protagonist || '';
                  const antagonist = caseData?.antagonist || '';
                  const title = caseData?.title || '';
                  
                  // Find bank name in any of these fields
                  const foundBank = bankNames.find(bank => 
                    protagonist.toLowerCase().includes(bank.toLowerCase()) ||
                    antagonist.toLowerCase().includes(bank.toLowerCase()) ||
                    title.toLowerCase().includes(bank.toLowerCase())
                  );
                  
                  return foundBank ? (
                    <div className="mb-2">
                      <h1 className="text-2xl font-bold text-green-900 break-words leading-tight">
                        {foundBank}
                      </h1>
                      <div className="flex items-center space-x-2 text-sm text-green-600">
                        <Building2 className="w-4 h-4" />
                        <span>Bank Profile</span>
                      </div>
                    </div>
                  ) : null;
                })()}

                {/* Insurance Company Name - Display if insurance company is involved in the case */}
                {(() => {
                  // List of known insurance company names to check against
                  const insuranceNames = [
                    'SIC Insurance', 'Vanguard Assurance', 'Metropolitan Insurance', 'Enterprise Insurance',
                    'Ghana Reinsurance', 'Star Assurance', 'Provident Insurance', 'Donewell Insurance',
                    'GLICO Insurance', 'Quality Insurance', 'Prudential Life Insurance', 'Old Mutual Life Assurance',
                    'Sanlam Life Insurance', 'Allianz Life Insurance', 'AXA Mansard Insurance', 'Zenith General Insurance',
                    'Cornerstone Insurance', 'Leadway Assurance', 'Mutual Benefits Assurance', 'Custodian Life Insurance',
                    'FBN Insurance', 'AIICO Insurance', 'Lagos Building Investment', 'NEM Insurance',
                    'Wapic Insurance', 'Sovereign Trust Insurance', 'Consolidated Hallmark Insurance', 'Linkage Assurance',
                    'Lasaco Assurance', 'Royal Exchange General Insurance', 'Hygeia HMO', 'Avon Healthcare',
                    'Clearline HMO', 'Reliance HMO', 'Total Health Trust', 'Health Partners HMO',
                    'Mediplan Healthcare', 'Wellness HMO', 'Ultimate Health HMO', 'Prepaid Medicare',
                    'IHMS HMO', 'Ronsberger HMO', 'Vcare HMO', 'Healthguard HMO',
                    'ProHealth HMO', 'Healthplus HMO', 'SIC Insurance Company', 'Vanguard Assurance Company',
                    'Metropolitan Insurance Company', 'Enterprise Insurance Company', 'Ghana Reinsurance Company',
                    'Star Assurance Company', 'Provident Insurance Company', 'Donewell Insurance Company',
                    'GLICO General Insurance', 'Quality Insurance Company', 'Prudential Life Insurance Company',
                    'Old Mutual Life Assurance Company', 'Sanlam Life Insurance Company', 'Allianz Life Insurance Company',
                    'AXA Mansard Insurance Company', 'Zenith General Insurance Company', 'Cornerstone Insurance Company',
                    'Leadway Assurance Company', 'Mutual Benefits Assurance Company', 'Custodian Life Insurance Company',
                    'FBN Insurance Company', 'AIICO Insurance Company', 'Lagos Building Investment Company',
                    'NEM Insurance Company', 'Wapic Insurance Company', 'Sovereign Trust Insurance Company',
                    'Consolidated Hallmark Insurance Company', 'Linkage Assurance Company', 'Lasaco Assurance Company',
                    'Royal Exchange General Insurance Company', 'Hygeia HMO Company', 'Avon Healthcare Company',
                    'Clearline HMO Company', 'Reliance HMO Company', 'Total Health Trust Company',
                    'Health Partners HMO Company', 'Mediplan Healthcare Company', 'Wellness HMO Company',
                    'Ultimate Health HMO Company', 'Prepaid Medicare Company', 'IHMS HMO Company',
                    'Ronsberger HMO Company', 'Vcare HMO Company', 'Healthguard HMO Company',
                    'ProHealth HMO Company', 'Healthplus HMO Company'
                  ];
                  
                  // Check protagonist and antagonist fields for insurance company names
                  const protagonist = caseData?.protagonist || '';
                  const antagonist = caseData?.antagonist || '';
                  const title = caseData?.title || '';
                  
                  // Find insurance company name in any of these fields
                  const foundInsurance = insuranceNames.find(insurance => 
                    protagonist.toLowerCase().includes(insurance.toLowerCase()) ||
                    antagonist.toLowerCase().includes(insurance.toLowerCase()) ||
                    title.toLowerCase().includes(insurance.toLowerCase())
                  );
                  
                  return foundInsurance ? (
                    <div className="mb-2">
                      <h1 className="text-2xl font-bold text-blue-900 break-words leading-tight">
                        {foundInsurance}
                      </h1>
                      <div className="flex items-center space-x-2 text-sm text-blue-600">
                        <Shield className="w-4 h-4" />
                        <span>Insurance Profile</span>
                      </div>
                    </div>
                  ) : null;
                })()}
                
                {/* Case Title */}
                <h2 className="text-xl font-bold text-gray-900 break-words leading-tight">
                  {caseData?.title || 'Case Details'}
                </h2>
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  {originalSearch && (
                    <span className="flex items-center space-x-1">
                      <span className="font-medium">Searched for:</span>
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                        "{originalSearch}"
                      </span>
                    </span>
                  )}
                  {caseData?.suit_reference_number && (
                    <span className="flex items-center space-x-1">
                      <Scale className="w-4 h-4" />
                      <span>{caseData.suit_reference_number}</span>
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                {getOutcomeIcon(caseData?.metadata?.outcome)}
                <span className="text-sm text-gray-600">
                  {caseData?.metadata?.outcome || 'Unknown'}
                </span>
              </div>
              
            </div>
          </div>
        </div>
      </div>

      {/* Spacer for fixed header */}
      <div className="h-24"></div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Main Content */}
          <div className="flex-1 space-y-6">
          {/* Basic Information */}
          <div className="bg-white rounded-lg shadow-sm border">
            <SectionHeader
              title="Basic Information"
              icon={FileText}
              isExpanded={expandedSections.basicInfo}
              onToggle={() => toggleSection('basicInfo')}
            />
            {expandedSections.basicInfo && (
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  
                  {/* Case Details Grid */}
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2 mb-4">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Case Details</h3>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
                        <div className="flex items-center space-x-2 mb-1">
                          <Scale className="w-4 h-4 text-blue-600" />
                          <span className="text-xs font-medium text-blue-800 uppercase tracking-wide">Suit Reference</span>
                        </div>
                        <p className="text-sm font-semibold text-blue-900 break-all">{caseData.suit_reference_number || 'N/A'}</p>
                      </div>
                      
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex items-center space-x-2 mb-1">
                          <Calendar className="w-4 h-4 text-gray-600" />
                          <span className="text-xs font-medium text-gray-700 uppercase tracking-wide">Date</span>
                        </div>
                        <p className="text-sm font-semibold text-gray-900">{formatDate(caseData.date)}</p>
                      </div>
                      
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex items-center space-x-2 mb-1">
                          <Calendar className="w-4 h-4 text-gray-600" />
                          <span className="text-xs font-medium text-gray-700 uppercase tracking-wide">Year</span>
                        </div>
                        <p className="text-sm font-semibold text-gray-900">{caseData.year || 'N/A'}</p>
                      </div>
                      
                    </div>
                  </div>

                  {/* Court Information Grid */}
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2 mb-4">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Court Information</h3>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
                        <div className="flex items-center space-x-2 mb-1">
                          <Building2 className="w-4 h-4 text-green-600" />
                          <span className="text-xs font-medium text-green-800 uppercase tracking-wide">Court Type</span>
                        </div>
                        <p className="text-sm font-semibold text-green-900">{getCourtTypeName(caseData.court_type)}</p>
                      </div>
                    </div>
                  </div> 

                  {/* Publication & Location Grid */}
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2 mb-4">
                      <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                      <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Publication & Location</h3>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="bg-purple-50 p-4 rounded-lg border-l-4 border-purple-500">
                        <div className="flex items-center space-x-2 mb-1">
                          <BookOpen className="w-4 h-4 text-purple-600" />
                          <span className="text-xs font-medium text-purple-800 uppercase tracking-wide">Citation</span>
                        </div>
                        <p className="text-sm font-semibold text-purple-900 break-all">{caseData.citation || 'N/A'}</p>
                      </div>
                      
                      
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex items-center space-x-2 mb-1">
                          <MapPin className="w-4 h-4 text-gray-600" />
                          <span className="text-xs font-medium text-gray-700 uppercase tracking-wide">Town</span>
                        </div>
                        <p className="text-sm font-semibold text-gray-900">{caseData.town || 'N/A'}</p>
                      </div>
                      
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex items-center space-x-2 mb-1">
                          <MapPin className="w-4 h-4 text-gray-600" />
                          <span className="text-xs font-medium text-gray-700 uppercase tracking-wide">Region</span>
                        </div>
                        <p className="text-sm font-semibold text-gray-900">{formatRegion(caseData.region)}</p>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            )}
          </div>

          {/* Case Summary */}
          <div className="bg-white rounded-lg shadow-sm border">
            <SectionHeader
              title="Case Outcome Summary"
              icon={FileText}
              isExpanded={expandedSections.caseSummary}
              onToggle={() => toggleSection('caseSummary')}
            />
            {expandedSections.caseSummary && (
              <div className="p-6">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 p-6 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <FileText className="w-5 h-5 text-blue-600" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-3">
                        <h3 className="text-lg font-semibold text-blue-900">Banking-Focused Case Summary</h3>
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                          AI Generated
                        </span>
                      </div>
                      <div className="text-gray-800 leading-relaxed">
                        {(() => {
                          // Use the actual AI analysis data from the database
                          const aiDetailedOutcome = caseData?.ai_detailed_outcome;
                          const aiCaseOutcome = caseData?.ai_case_outcome;
                          const aiFinancialImpact = caseData?.ai_financial_impact;
                          const aiCourtOrders = caseData?.ai_court_orders;
                          
                          if (!aiDetailedOutcome || aiDetailedOutcome.trim() === '') {
                            return <div className="text-gray-500 italic">No AI-generated summary available for this case.</div>;
                          }
                          
                          // Display the actual AI analysis data from the database
                          return (
                            <div className="space-y-4">
                              <div className="bg-white p-4 rounded-lg border-l-4 border-purple-500">
                                <h4 className="font-semibold text-purple-900 mb-2 flex items-center">
                                  <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                                  SUMMARY
                                </h4>
                                <p className="text-gray-700 leading-relaxed">{aiDetailedOutcome}</p>
                              </div>
                              
                              <div className="bg-white p-4 rounded-lg border-l-4 border-blue-500">
                                <h4 className="font-semibold text-blue-900 mb-2 flex items-center">
                                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                                  CASE OUTCOME
                                </h4>
                                <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                                  aiCaseOutcome === 'WON' ? 'bg-green-100 text-green-800' :
                                  aiCaseOutcome === 'PARTIALLY_WON' ? 'bg-green-50 text-green-700 border border-green-200' :
                                  aiCaseOutcome === 'LOST' ? 'bg-red-100 text-red-800' :
                                  aiCaseOutcome === 'PARTIALLY_LOST' ? 'bg-red-50 text-red-700 border border-red-200' :
                                  'bg-yellow-100 text-yellow-800'
                                }`}>
                                  {aiCaseOutcome === 'WON' ? '✓ WON' : 
                                   aiCaseOutcome === 'PARTIALLY_WON' ? '◐ PARTIALLY WON' :
                                   aiCaseOutcome === 'LOST' ? '✗ LOST' : 
                                   aiCaseOutcome === 'PARTIALLY_LOST' ? '◑ PARTIALLY LOST' :
                                   '⏳ UNRESOLVED'}
                                </div>
                                <p className="text-gray-700 mt-2">
                                  {aiCaseOutcome === 'WON' ? 'The person was fully successful in this case.' :
                                   aiCaseOutcome === 'PARTIALLY_WON' ? 'The person achieved partial success in this case.' :
                                   aiCaseOutcome === 'LOST' ? 'The person was unsuccessful in this case.' :
                                   aiCaseOutcome === 'PARTIALLY_LOST' ? 'The person had partial setbacks in this case.' :
                                   'The case outcome is not clearly determined from available information.'}
                                </p>
                              </div>
                              
                              <div className="bg-white p-4 rounded-lg border-l-4 border-orange-500">
                                <h4 className="font-semibold text-orange-900 mb-2 flex items-center">
                                  <span className="w-2 h-2 bg-orange-500 rounded-full mr-2"></span>
                                  COURT ORDERS
                                </h4>
                                <p className="text-gray-700 leading-relaxed">{aiCourtOrders || 'No specific court orders identified'}</p>
                              </div>
                              
                              <div className="bg-white p-4 rounded-lg border-l-4 border-green-500">
                                <h4 className="font-semibold text-green-900 mb-2 flex items-center">
                                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                                  FINANCIAL IMPACT
                                </h4>
                                <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium mb-2 ${
                                  aiFinancialImpact?.includes('HIGH') ? 'bg-red-100 text-red-800' :
                                  aiFinancialImpact?.includes('MODERATE') ? 'bg-yellow-100 text-yellow-800' :
                                  aiFinancialImpact?.includes('LOW') ? 'bg-green-100 text-green-800' :
                                  'bg-gray-100 text-gray-800'
                                }`}>
                                  {aiFinancialImpact?.split(' - ')[0] || 'UNRESOLVED'}
                                </div>
                                <p className="text-gray-700 leading-relaxed mb-3">{aiFinancialImpact || 'Financial impact not determined'}</p>
                                
                                {/* Extract and display monetary amounts from case data */}
                                {(() => {
                                  const caseText = (caseData?.decision || '') + ' ' + (caseData?.judgement || '') + ' ' + (caseData?.conclusion || '');
                                  const monetaryPatterns = [
                                    /(?:GHS|GH¢|¢|GHC)\s*[\d,]+(?:\.\d{2})?/gi,
                                    /\$\s*[\d,]+(?:\.\d{2})?/gi,
                                    /£\s*[\d,]+(?:\.\d{2})?/gi,
                                    /€\s*[\d,]+(?:\.\d{2})?/gi,
                                    /(?:amount|sum|value|cost|damages?|compensation|fine|penalty|award|settlement|payment|refund|restitution|reimbursement)\s*(?:of\s*)?(?:GHS|GH¢|¢|GHC|USD|\$|£|€)?\s*[\d,]+(?:\.\d{2})?/gi,
                                    /[\d,]+(?:\.\d{2})?\s*(?:GHS|GH¢|¢|GHC|USD|\$|£|€)/gi
                                  ];
                                  
                                  const amounts = [];
                                  monetaryPatterns.forEach(pattern => {
                                    const matches = caseText.match(pattern);
                                    if (matches) {
                                      amounts.push(...matches);
                                    }
                                  });
                                  
                                  // Remove duplicates and sort by amount
                                  const uniqueAmounts = [...new Set(amounts)].sort((a, b) => {
                                    const numA = parseFloat(a.replace(/[^\d.]/g, ''));
                                    const numB = parseFloat(b.replace(/[^\d.]/g, ''));
                                    return numB - numA;
                                  });
                                  
                                  if (uniqueAmounts.length > 0) {
                                    return (
                                      <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-200">
                                        <h5 className="font-semibold text-green-800 mb-2 flex items-center">
                                          <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2"></span>
                                          MONETARY AMOUNTS IDENTIFIED:
                                        </h5>
                                        <div className="space-y-1">
                                          {uniqueAmounts.slice(0, 5).map((amount, index) => (
                                            <div key={index} className="text-sm text-green-700 font-medium">
                                              • {amount}
                                            </div>
                                          ))}
                                          {uniqueAmounts.length > 5 && (
                                            <div className="text-xs text-green-600 italic">
                                              ... and {uniqueAmounts.length - 5} more amounts
                                  </div>
                                )}
                                        </div>
                                      </div>
                                    );
                                  }
                                  return null;
                                })()}
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                      <div className="mt-4 text-xs text-gray-500 italic">
                        This summary focuses on case outcomes and financial implications relevant for banking and credit assessment purposes.
                        {caseData?.ai_summary_generated_at && (
                          <div className="mt-1">
                            AI Analysis generated on: {new Date(caseData.ai_summary_generated_at).toLocaleString()}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* People Involved */}
          <div className="bg-white rounded-lg shadow-sm border">
            <SectionHeader
              title="People Involved"
              icon={Users}
              isExpanded={expandedSections.people}
              onToggle={() => toggleSection('people')}
            />
            {expandedSections.people && (
              <div className="p-6 space-y-4">
                <InfoRow label="Judgement By" value={caseData.judgement_by} icon={Gavel} />
                <InfoRow label="Opinion By" value={caseData.opinion_by} icon={Gavel} />
                <InfoRow label="Protagonist" value={caseData.protagonist} icon={User} />
                
                {/* Show lawyers from metadata if available, otherwise from main case data */}
                {caseData.metadata?.lawyers && formatArray(caseData.metadata.lawyers).length > 0 ? (
                  <ArrayDisplay label="Lawyers" items={formatArray(caseData.metadata.lawyers)} icon={User} />
                ) : (
                  <InfoRow label="Lawyers" value={caseData.lawyers} icon={User} />
                )}
                
                {/* Additional metadata people */}
                {caseData.metadata && (
                  <>
                    <ArrayDisplay label="Coram" items={formatArray(caseData.metadata.judges)} icon={Gavel} />
                  </>
                )}
              </div>
            )}
          </div>

          {/* Case Document */}
          <div className="bg-white rounded-lg shadow-sm border">
            <SectionHeader
              title="Case Document"
              icon={FileText}
              isExpanded={expandedSections.caseDocuments}
              onToggle={() => toggleSection('caseDocuments')}
            />
            {expandedSections.caseDocuments && (
              <div className="p-6">
                {/* Document Table */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-4">
                    <FileText className="w-5 h-5 text-gray-600" />
                    <span className="text-sm font-semibold text-gray-800 uppercase tracking-wide">Document Information</span>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 uppercase tracking-wide">Date</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 uppercase tracking-wide">Nature of Doc</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 uppercase tracking-wide">Doc. By</th>
                          <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700 uppercase tracking-wide">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b border-gray-100 hover:bg-white transition-colors">
                          <td className="py-3 px-4 text-sm text-gray-900">
                            {caseData?.date ? formatDate(caseData.date) : 'N/A'}
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-900">
                            <div className="flex items-center space-x-2">
                              <BookOpen className="w-4 h-4 text-blue-500" />
                              <span className="font-medium">
                                {caseData?.area_of_law || caseData?.type || 'Judgement'}
                              </span>
                            </div>
                            {caseData?.dl_type && (
                              <div className="text-xs text-gray-500 mt-1">
                                Type: {caseData.dl_type}
                              </div>
                            )}
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-900">
                            <div className="flex items-center space-x-2">
                              <Scale className="w-4 h-4 text-green-500" />
                              <span className="font-medium">
                                Court
                              </span>
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              Court Document
                            </div>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <div className="flex items-center justify-center">
                    <button
                                onClick={() => setIsDocumentModalOpen(true)}
                                className="inline-flex items-center space-x-1 px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200"
                                title="View document content"
                    >
                                <Eye className="w-3 h-3" />
                                <span>View</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
                
                {/* Additional Document Details */}
                {(caseData?.file_name || caseData?.dl_citation_no || caseData?.citation) && (
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h4 className="text-sm font-medium text-blue-900 mb-3 flex items-center space-x-2">
                      <FileText className="w-4 h-4" />
                      <span>Document Details</span>
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      {caseData?.file_name && (
                        <div className="flex items-center space-x-2 text-blue-800">
                          <FileText className="w-4 h-4" />
                          <div>
                            <div className="font-medium">File Name</div>
                            <div className="text-xs text-blue-600 truncate">{caseData.file_name}</div>
                    </div>
                  </div>
                      )}
                      {caseData?.dl_citation_no && (
                        <div className="flex items-center space-x-2 text-blue-800">
                          <BookOpen className="w-4 h-4" />
                          <div>
                            <div className="font-medium">Citation No</div>
                            <div className="text-xs text-blue-600">{caseData.dl_citation_no}</div>
                </div>
                        </div>
                      )}
                      {caseData?.citation && (
                        <div className="flex items-center space-x-2 text-blue-800">
                          <Scale className="w-4 h-4" />
                          <div>
                            <div className="font-medium">Citation</div>
                            <div className="text-xs text-blue-600">{caseData.citation}</div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Case Timeline */}
          <div className="bg-white rounded-lg shadow-sm border">
            <SectionHeader
              title="Case Timeline"
              icon={History}
              isExpanded={expandedSections.caseTimeline}
              onToggle={() => toggleSection('caseTimeline')}
            />
            {expandedSections.caseTimeline && (
              <div className="p-6">
                {caseData?.hearings && caseData.hearings.length > 0 ? (
                  <div className="flow-root">
                    <ul className="-mb-8">
                      {caseData.hearings.map((hearing, index) => (
                        <li key={hearing.id}>
                          <div className={`relative ${index < caseData.hearings.length - 1 ? 'pb-8' : ''}`}>
                            {index < caseData.hearings.length - 1 && (
                              <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true"></span>
                            )}
                            <div className="relative flex space-x-3">
                              <div>
                                <span className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${
                                  hearing.remark === 'fj' ? 'bg-purple-500' :
                                  hearing.remark === 'fr' ? 'bg-yellow-500' :
                                  'bg-blue-500'
                                }`}>
                                  {hearing.remark === 'fj' ? <Gavel className="h-4 w-4 text-white" /> :
                                   hearing.remark === 'fr' ? <Scale className="h-4 w-4 text-white" /> :
                                   <Clock className="h-4 w-4 text-white" />}
                                </span>
                              </div>
                              <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                                <div className="flex-1">
                                  <div className="flex items-center space-x-2 mb-1">
                                    <p className="text-sm font-medium text-gray-900">
                                      {hearing.remark === 'fj' ? 'For Judgement' :
                                       hearing.remark === 'fr' ? 'For Ruling' :
                                       'For Hearing'}
                                    </p>
                                    {hearing.hearing_time && (
                                      <span className="text-xs text-gray-500">• {hearing.hearing_time}</span>
                                    )}
                                  </div>
                                  <p className="text-sm text-gray-500 mb-2">
                                    {formatDate(hearing.hearing_date)}
                                  </p>
                                  {hearing.coram && (
                                    <p className="text-xs text-gray-600 mb-2">
                                      <span className="font-medium">Coram:</span> {hearing.coram}
                                    </p>
                                  )}
                                  {hearing.proceedings && (
                                    <p className="text-xs text-gray-700 bg-gray-50 p-2 rounded">
                                      <span className="font-medium">Proceedings:</span> {hearing.proceedings}
                                    </p>
                                  )}
                                </div>
                                <div className="text-right text-sm whitespace-nowrap text-gray-500">
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    hearing.remark === 'fj' ? 'bg-purple-100 text-purple-800' :
                                    hearing.remark === 'fr' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-blue-100 text-blue-800'
                                  }`}>
                                    {hearing.remark?.toUpperCase()}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <div className="flow-root">
                    <ul className="-mb-8">
                      {/* Case Filing */}
                      <li>
                        <div className="relative pb-8">
                          <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true"></span>
                          <div className="relative flex space-x-3">
                            <div>
                              <span className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center ring-8 ring-white">
                                <FileText className="h-4 w-4 text-white" />
                              </span>
                            </div>
                            <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                              <div>
                                <p className="text-sm font-medium text-gray-900">Case Filed</p>
                                <p className="text-sm text-gray-500">
                                  {caseData?.date ? formatDate(caseData.date) : 'N/A'}
                                </p>
                              </div>
                              <div className="text-right text-sm whitespace-nowrap text-gray-500">
                                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                                  Initial Filing
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </li>

                      {/* Court Assignment */}
                      <li>
                        <div className="relative pb-8">
                          <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true"></span>
                          <div className="relative flex space-x-3">
                            <div>
                              <span className="h-8 w-8 rounded-full bg-green-500 flex items-center justify-center ring-8 ring-white">
                                <Scale className="h-4 w-4 text-white" />
                              </span>
                            </div>
                            <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                              <div>
                                <p className="text-sm font-medium text-gray-900">Court Assignment</p>
                                <p className="text-sm text-gray-500">
                                  {getCourtTypeName(caseData?.court_type)} • {caseData?.region || 'N/A'}
                                </p>
                              </div>
                              <div className="text-right text-sm whitespace-nowrap text-gray-500">
                                <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                                  Court Process
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </li>

                      {/* Case Processing */}
                      <li>
                        <div className="relative pb-8">
                          <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true"></span>
                          <div className="relative flex space-x-3">
                            <div>
                              <span className="h-8 w-8 rounded-full bg-yellow-500 flex items-center justify-center ring-8 ring-white">
                                <Clock className="h-4 w-4 text-white" />
                              </span>
                            </div>
                            <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                              <div>
                                <p className="text-sm font-medium text-gray-900">Case Processing</p>
                                <p className="text-sm text-gray-500">
                                  {caseData?.metadata?.processed_at ? formatDate(caseData.metadata.processed_at) : 'In Progress'}
                                </p>
                              </div>
                              <div className="text-right text-sm whitespace-nowrap text-gray-500">
                                <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">
                                  {caseData?.metadata?.is_processed ? 'Processed' : 'Processing'}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </li>

                      {/* Judgment/Resolution */}
                      <li>
                        <div className="relative">
                          <div className="relative flex space-x-3">
                            <div>
                              <span className="h-8 w-8 rounded-full bg-purple-500 flex items-center justify-center ring-8 ring-white">
                                <Gavel className="h-4 w-4 text-white" />
                              </span>
                            </div>
                            <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                              <div>
                                <p className="text-sm font-medium text-gray-900">Judgment/Resolution</p>
                                <p className="text-sm text-gray-500">
                                  {caseData?.status === 1 ? 'Judgment Delivered' : 'Case Resolved'}
                                  {caseData?.updated_at && ` • ${formatDate(caseData.updated_at)}`}
                                </p>
                              </div>
                              <div className="text-right text-sm whitespace-nowrap text-gray-500">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  caseData?.status === 1
                                    ? 'bg-red-100 text-red-800'
                                    : 'bg-green-100 text-green-800'
                                }`}>
                                  {caseData?.status === 1 ? 'Judgment' : 'Resolved'}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </li>
                    </ul>
                  </div>
                )}

                {/* Additional Timeline Information */}
                <div className="mt-6 bg-gray-50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Timeline Summary</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Total Hearings:</span>
                      <span className="ml-2 font-medium text-gray-900">
                        {caseData?.hearings ? caseData.hearings.length : 0}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">Case Duration:</span>
                      <span className="ml-2 font-medium text-gray-900">
                        {caseData?.date && caseData?.updated_at ?
                          `${Math.ceil((new Date(caseData.updated_at) - new Date(caseData.date)) / (1000 * 60 * 60 * 24))} days` :
                          'N/A'
                        }
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">Current Status:</span>
                      <span className="ml-2 font-medium text-gray-900">
                        {caseData?.status === 1 ? 'Judgment Delivered' : 'Case Resolved'}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">Court Type:</span>
                      <span className="ml-2 font-medium text-gray-900">
                        {getCourtTypeName(caseData?.court_type)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>



          {/* Standalone Fields */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                
                {/* Outcome */}
                <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
                  <div className="flex items-center space-x-2 mb-1">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-xs font-medium text-green-800 uppercase tracking-wide">Outcome</span>
                  </div>
                  <p className="text-sm font-semibold text-green-900">
                    {caseData?.metadata?.outcome || 'Unknown'}
                  </p>
                </div>

                {/* Relevance Score */}
                <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
                  <div className="flex items-center space-x-2 mb-1">
                    <Tag className="w-4 h-4 text-blue-600" />
                    <span className="text-xs font-medium text-blue-800 uppercase tracking-wide">Relevance Score</span>
                  </div>
                  <p className="text-sm font-semibold text-blue-900">
                    {caseData?.metadata?.relevance_score ? caseData.metadata.relevance_score.toFixed(2) : 'N/A'}
                  </p>
                </div>

                {/* Processed */}
                <div className="bg-purple-50 p-4 rounded-lg border-l-4 border-purple-500">
                  <div className="flex items-center space-x-2 mb-1">
                    <CheckCircle className="w-4 h-4 text-purple-600" />
                    <span className="text-xs font-medium text-purple-800 uppercase tracking-wide">Processed</span>
                  </div>
                  <p className="text-sm font-semibold text-purple-900">
                    {caseData?.metadata?.is_processed ? 'Yes' : 'No'}
                  </p>
                </div>

                {/* Processed At */}
                <div className="bg-orange-50 p-4 rounded-lg border-l-4 border-orange-500">
                  <div className="flex items-center space-x-2 mb-1">
                    <Calendar className="w-4 h-4 text-orange-600" />
                    <span className="text-xs font-medium text-orange-800 uppercase tracking-wide">Processed At</span>
                  </div>
                  <p className="text-sm font-semibold text-orange-900">
                    {caseData?.metadata?.processed_at ? formatDate(caseData.metadata.processed_at) : 'N/A'}
                  </p>
                </div>

              </div>
            </div>
          </div>



          {/* Subject Matter */}
          <div className="bg-white rounded-lg shadow-sm border">
            <SectionHeader
              title="Subject Matter"
              icon={BookOpen}
              isExpanded={expandedSections.subjectMatter}
              onToggle={() => toggleSection('subjectMatter')}
            />
            {expandedSections.subjectMatter && (
              <div className="p-6 border-t border-gray-200">
                <div className="space-y-4">
                  <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
                    <div className="flex items-center space-x-2 mb-2">
                      <BookOpen className="w-4 h-4 text-blue-600" />
                      <span className="text-xs font-medium text-blue-800 uppercase tracking-wide">Primary Subject</span>
                    </div>
                    <p className="text-sm font-semibold text-blue-900">
                      {caseData?.area_of_law || caseData?.type || 'N/A'}
                    </p>
                  </div>
                  
                  {caseData?.keywords_phrases && (
                    <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
                      <div className="flex items-center space-x-2 mb-2">
                        <Tag className="w-4 h-4 text-green-600" />
                        <span className="text-xs font-medium text-green-800 uppercase tracking-wide">Key Terms</span>
                      </div>
                      <p className="text-sm text-green-900">
                        {caseData.keywords_phrases}
                      </p>
                    </div>
                  )}
                  
                  <div className="bg-purple-50 p-4 rounded-lg border-l-4 border-purple-500">
                    <div className="flex items-center space-x-2 mb-2">
                      <Scale className="w-4 h-4 text-purple-600" />
                      <span className="text-xs font-medium text-purple-800 uppercase tracking-wide">Legal Category</span>
                    </div>
                    <p className="text-sm font-semibold text-purple-900">
                      {caseData?.area_of_law || 'N/A'}
                    </p>
                    {caseData?.type && (
                      <p className="text-xs text-purple-700 mt-1">
                        Type: {caseData.type}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
          </div>

          {/* Right Sidebar - Related Cases */}
          {(relatedCases.length > 0 || true) && (
            <div className="lg:w-80 space-y-6">
              <div className="bg-white rounded-lg shadow-sm border">
                <div className="p-4 border-b border-gray-200">
                  <div className="flex items-center space-x-2">
                    <Users className="w-5 h-5 text-blue-600" />
                    <h3 className="text-lg font-semibold text-gray-900">Related Cases</h3>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    {(() => {
                      // Check if this is an insurance case
                      const isInsuranceCase = caseData && checkIfInsuranceCase(caseData);
                      
                      if (isInsuranceCase) {
                        return `Cases involving the same insurance company (${relatedCases.length})`;
                      } else if (originalPersonCases) {
                        return `Cases from original search (${relatedCases.length} of ${originalPersonCases.length})`;
                      } else {
                        return `Cases involving the same people (${relatedCases.length})`;
                      }
                    })()}
                  </p>
                </div>
                <div className="p-4">
                  {relatedCases.length > 0 ? (
                    <div className="space-y-3">
                      {relatedCases.map((relatedCase, index) => (
                      <div
                        key={relatedCase.id}
                        onClick={() => navigate(`/case-details/${relatedCase.id}${searchQuery ? `?q=${encodeURIComponent(searchQuery)}` : ''}`, {
                          state: { originalPersonCases: originalPersonCases || relatedCases }
                        })}
                        className="p-3 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 cursor-pointer transition-colors duration-200 group"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="text-sm font-medium text-gray-900 group-hover:text-blue-900 line-clamp-2">
                            {relatedCase.title}
                          </h4>
                          <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-blue-500 flex-shrink-0 ml-2" />
                        </div>
                        
                        <div className="space-y-1 text-xs text-gray-600">
                          <div className="flex items-center space-x-2">
                            <Calendar className="w-3 h-3" />
                            <span>{formatDate(relatedCase.date)}</span>
                          </div>
                          
                          {relatedCase.suit_reference_number && (
                            <div className="flex items-center space-x-2">
                              <Scale className="w-3 h-3" />
                              <span className="truncate">{relatedCase.suit_reference_number}</span>
                            </div>
                          )}
                          
                          {relatedCase.area_of_law && (
                            <div className="flex items-center space-x-2">
                              <BookOpen className="w-3 h-3" />
                              <span className="truncate">{relatedCase.area_of_law}</span>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center space-x-2">
                            {relatedCase.ai_case_outcome && (
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                relatedCase.ai_case_outcome === 'WON' ? 'bg-green-100 text-green-800' :
                                relatedCase.ai_case_outcome === 'LOST' ? 'bg-red-100 text-red-800' :
                                relatedCase.ai_case_outcome === 'PARTIALLY_WON' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {relatedCase.ai_case_outcome}
                              </span>
                            )}
                            {relatedCase.ai_financial_impact && (
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                relatedCase.ai_financial_impact.includes('HIGH') ? 'bg-red-100 text-red-800' :
                                relatedCase.ai_financial_impact.includes('MODERATE') ? 'bg-yellow-100 text-yellow-800' :
                                relatedCase.ai_financial_impact.includes('LOW') ? 'bg-green-100 text-green-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {relatedCase.ai_financial_impact.split(' - ')[0]}
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <div className="mt-2 text-xs text-blue-600 group-hover:text-blue-700">
                          <span className="font-medium">Matched:</span> {relatedCase.matched_person}
                        </div>
                      </div>
                      ))}
                      
                      {relatedCases.length >= 8 && (
                        <div className="mt-4 p-3 bg-gray-50 rounded-lg text-center">
                          <p className="text-xs text-gray-500">
                            Showing 8 of many related cases
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500 text-sm">
                        {originalPersonCases ? 
                          'No related cases found from original search' :
                          'No related cases found'
                        }
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Full Case Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          {/* Backdrop */}
          <div 
            className={`fixed inset-0 bg-black transition-all duration-300 ease-out ${
              isModalClosing ? 'bg-opacity-0' : 'bg-opacity-50'
            }`}
            onClick={closeModal}
          />
          
          {/* Modal */}
          <div className="flex min-h-full items-center justify-center p-4">
            <div 
              className={`relative bg-white rounded-lg shadow-xl flex flex-col transform transition-all duration-300 ease-out ${
                isFullscreen ? 'fixed inset-4 z-50 max-w-none w-auto h-auto' : 'max-w-6xl w-full max-h-[90vh]'
              } ${
                isModalClosing ? 'translate-y-4 scale-95 opacity-0' : 'translate-y-0 scale-100 opacity-100'
              }`}
              style={{
                animation: isModalClosing ? 'none' : 'slideInUp 0.5s ease-out forwards, zoomIn 0.5s ease-out forwards'
              }}
            >
              {/* Modal Header */}
              <div 
                className="p-6 border-b border-gray-200 transform transition-all duration-700 ease-out"
                style={{
                  animation: isModalClosing ? 'none' : 'slideInDown 0.7s ease-out 0.1s forwards',
                  transform: isModalClosing ? 'translateY(-20px)' : 'translateY(0)',
                  opacity: isModalClosing ? 0 : 1
                }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center transform transition-all duration-500 ease-out"
                         style={{
                           animation: isModalClosing ? 'none' : 'bounceIn 0.6s ease-out 0.2s forwards',
                           transform: isModalClosing ? 'scale(0)' : 'scale(1)',
                           opacity: isModalClosing ? 0 : 1
                         }}>
                      <FileText className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="transform transition-all duration-500 ease-out"
                         style={{
                           animation: isModalClosing ? 'none' : 'slideInLeft 0.6s ease-out 0.3s forwards',
                           transform: isModalClosing ? 'translateX(-20px)' : 'translateX(0)',
                           opacity: isModalClosing ? 0 : 1
                         }}>
                      <h3 className="text-lg font-semibold text-gray-900">Full Case Content</h3>
                      <p className="text-sm text-gray-500 break-words leading-tight">
                        {caseData?.title || 'Case Details'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {/* Action Buttons */}
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={copyModalContent}
                        data-copy-button
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-300 ease-out transform hover:scale-110"
                        title="Copy content"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      
                      <button
                        onClick={downloadCase}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-300 ease-out transform hover:scale-110"
                        title="Download case"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      
                      <div className="relative" data-share-menu>
                        <button
                          onClick={() => setShowShareMenu(!showShareMenu)}
                          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-300 ease-out transform hover:scale-110"
                          title="Share case"
                        >
                          <Share2 className="w-4 h-4" />
                        </button>
                        
                        {/* Share Menu Dropdown */}
                        {showShareMenu && (
                          <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                            <button
                              onClick={() => {
                                shareToTwitter();
                                setShowShareMenu(false);
                              }}
                              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                            >
                              <Twitter className="w-4 h-4 text-blue-400" />
                              <span>Share on Twitter</span>
                            </button>
                            <button
                              onClick={() => {
                                shareToFacebook();
                                setShowShareMenu(false);
                              }}
                              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                            >
                              <Facebook className="w-4 h-4 text-blue-600" />
                              <span>Share on Facebook</span>
                            </button>
                            <button
                              onClick={() => {
                                shareToWhatsApp();
                                setShowShareMenu(false);
                              }}
                              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                            >
                              <MessageCircle className="w-4 h-4 text-green-500" />
                              <span>Share on WhatsApp</span>
                            </button>
                            <div className="border-t border-gray-200 my-1"></div>
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(getShareUrl());
                                setShowShareMenu(false);
                              }}
                              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                            >
                              <ExternalLink className="w-4 h-4 text-gray-500" />
                              <span>Copy link</span>
                            </button>
                          </div>
                        )}
                      </div>
                      
                      <button
                        onClick={toggleFullscreen}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-300 ease-out transform hover:scale-110"
                        title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
                      >
                        {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
                      </button>
                    </div>
                    
                    <button
                      onClick={closeModal}
                      className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-300 ease-out transform hover:scale-110"
                      style={{
                        animation: isModalClosing ? 'none' : 'fadeIn 0.5s ease-out 0.4s forwards',
                        opacity: isModalClosing ? 0 : 1
                      }}
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>
                </div>

                {/* Search Bar */}
                <div className="flex items-center space-x-3">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search within case content (e.g., 'Mahama', 'Writ of Summons')..."
                      value={modalSearchQuery}
                      onChange={handleSearchChange}
                      className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    />
                    {modalSearchQuery && (
                      <button
                        onClick={() => {
                          setModalSearchQuery('');
                          setSearchResults([]);
                          setCurrentMatchIndex(0);
                        }}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                        title="Clear search"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  
                  {searchResults.length > 0 && (
                    <div className="flex items-center space-x-2 bg-blue-50 px-3 py-2 rounded-lg">
                      <button
                        onClick={goToPreviousMatch}
                        className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded transition-colors"
                        title="Previous match (Ctrl+Shift+G)"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <span className="text-sm text-blue-700 font-medium">
                        {currentMatchIndex + 1} of {searchResults.length}
                      </span>
                      <button
                        onClick={goToNextMatch}
                        className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded transition-colors"
                        title="Next match (Ctrl+G)"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                  
                  {isSearching && (
                    <div className="flex items-center space-x-2 text-gray-500">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                      <span className="text-sm">Searching...</span>
                    </div>
                  )}
                  
                  {modalSearchQuery && searchResults.length === 0 && !isSearching && (
                    <div className="flex items-center space-x-2 text-red-500">
                      <X className="w-4 h-4" />
                      <span className="text-sm">No matches found</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Modal Content */}
              <div 
                className="flex-1 overflow-y-auto p-6 transform transition-all duration-500 ease-out"
                style={{
                  animation: isModalClosing ? 'none' : 'fadeInUp 0.6s ease-out 0.2s forwards',
                  transform: isModalClosing ? 'translateY(20px)' : 'translateY(0)',
                  opacity: isModalClosing ? 0 : 1
                }}
              >
                <div className="prose prose-lg max-w-none">
                  <div 
                    className="text-gray-900 leading-relaxed"
                    dangerouslySetInnerHTML={{
                      __html: highlightSearchResults(
                        caseData?.summernote_content || caseData?.summernote || caseData?.summarnote || caseData?.metadata?.case_summary || caseData?.case_summary || 'No case content available',
                        modalSearchQuery
                      )
                    }}
                  />
                </div>
              </div>

              {/* Modal Footer */}
              <div 
                className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50 transform transition-all duration-500 ease-out"
                style={{
                  animation: isModalClosing ? 'none' : 'slideInUp 0.6s ease-out 0.3s forwards',
                  transform: isModalClosing ? 'translateY(20px)' : 'translateY(0)',
                  opacity: isModalClosing ? 0 : 1
                }}
              >
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4" />
                    <span>Last updated: {caseData?.updated_at ? formatDate(caseData.updated_at) : 'N/A'}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-400">
                    <Search className="w-4 h-4" />
                    <span>Ctrl+F search • Ctrl+G next • Ctrl+C copy • Ctrl+S download • Shift+Enter fullscreen • ESC close</span>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={closeModal}
                    className="inline-flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-all duration-300 ease-out transform hover:scale-105 hover:shadow-lg"
                    style={{
                      animation: isModalClosing ? 'none' : 'fadeIn 0.5s ease-out 0.5s forwards',
                      opacity: isModalClosing ? 0 : 1
                    }}
                  >
                    <X className="w-4 h-4" />
                    <span>Close</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Custom CSS for animations */}
      <style jsx="true">{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideInUp {
          from { 
            transform: translateY(20px) scale(0.95);
            opacity: 0;
          }
          to { 
            transform: translateY(0) scale(1);
            opacity: 1;
          }
        }
        
        @keyframes slideInDown {
          from { 
            transform: translateY(-20px);
            opacity: 0;
          }
          to { 
            transform: translateY(0);
            opacity: 1;
          }
        }
        
        @keyframes slideInLeft {
          from { 
            transform: translateX(-20px);
            opacity: 0;
          }
          to { 
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        @keyframes slideInUp {
          from { 
            transform: translateY(20px);
            opacity: 0;
          }
          to { 
            transform: translateY(0);
            opacity: 1;
          }
        }
        
        @keyframes bounceIn {
          0% { 
            transform: scale(0);
            opacity: 0;
          }
          50% { 
            transform: scale(1.1);
            opacity: 1;
          }
          100% { 
            transform: scale(1);
            opacity: 1;
          }
        }
        
        /* Summernote content styling */
        .summernote-content {
          font-family: 'Book Antiqua', serif !important;
          font-size: 12pt !important;
          line-height: 1.15 !important;
          color: #000 !important;
        }
        
        .summernote-content p {
          margin-bottom: 8pt !important;
          text-align: justify !important;
        }
        
        .summernote-content .MsoNormal {
          margin-bottom: 8pt !important;
          text-align: justify !important;
        }
        
        .summernote-content .MsoListParagraphCxSpFirst,
        .summernote-content .MsoListParagraphCxSpMiddle,
        .summernote-content .MsoListParagraphCxSpLast {
          margin-bottom: 8pt !important;
          text-align: justify !important;
        }
        
        .summernote-content .MsoNoSpacing {
          margin-bottom: 0 !important;
        }
        
        .summernote-content b,
        .summernote-content strong {
          font-weight: bold !important;
        }
        
        .summernote-content i,
        .summernote-content em {
          font-style: italic !important;
        }
        
        .summernote-content u {
          text-decoration: underline !important;
        }
        
        .summernote-content sup {
          vertical-align: super !important;
          font-size: smaller !important;
        }
        
        .summernote-content .MsoListParagraphCxSpFirst,
        .summernote-content .MsoListParagraphCxSpMiddle,
        .summernote-content .MsoListParagraphCxSpLast {
          margin-left: 49.5pt !important;
          text-indent: -31.5pt !important;
        }
        
        @keyframes zoomIn {
          from { 
            transform: scale(0.95);
            opacity: 0;
          }
          to { 
            transform: scale(1);
            opacity: 1;
          }
        }
      `}</style>
      
      {/* Floating AI Assistant Button */}
      <button
        onClick={() => setIsAIChatOpen(true)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-300 flex items-center justify-center group"
        title="Open JuridenceAI"
      >
        <MessageCircle className="w-6 h-6 group-hover:scale-110 transition-transform duration-200" />
        <span className="sr-only">JuridenceAI</span>
      </button>

      {/* AI Chat Component */}
      <AIChat
        caseId={parseInt(caseId)}
        caseTitle={caseData?.title}
        isOpen={isAIChatOpen}
        onClose={() => setIsAIChatOpen(false)}
        onMinimize={() => setIsAIChatOpen(false)}
      />

      {/* Document Content Modal */}
      {isDocumentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className={`bg-white rounded-lg shadow-xl transition-all duration-300 ${
            isDocumentFullscreen 
              ? 'w-full h-full max-w-none max-h-none m-0 rounded-none' 
              : 'w-full max-w-4xl max-h-[90vh]'
          }`}>
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <FileText className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Document Content
                </h3>
                {caseData?.title && (
                  <span className="text-sm text-gray-500 truncate max-w-md">
                    - {caseData.title}
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setIsDocumentFullscreen(!isDocumentFullscreen)}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  title={isDocumentFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
                >
                  {isDocumentFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => setIsDocumentModalOpen(false)}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="overflow-y-auto" style={{ maxHeight: isDocumentFullscreen ? 'calc(100vh - 80px)' : 'calc(90vh - 80px)' }}>
              <div className="p-6">
                {caseData?.summernote ? (
                  <div 
                    className="prose prose-lg max-w-none summernote-content"
                    dangerouslySetInnerHTML={{ __html: caseData.summernote }}
                    style={{
                      fontFamily: 'Book Antiqua, serif',
                      fontSize: '12pt',
                      lineHeight: '1.15',
                      color: '#000'
                    }}
                  />
                ) : (
                  <div className="text-center py-12">
                    <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h4 className="text-lg font-medium text-gray-900 mb-2">No Document Content Available</h4>
                    <p className="text-gray-500">
                      This case doesn't have any document content to display.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between p-4 border-t border-gray-200 bg-gray-50">
              <div className="text-sm text-gray-500">
                {caseData?.summernote ? 'Document content loaded successfully' : 'No content available'}
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setIsDocumentModalOpen(false)}
                  className="px-4 py-2 bg-gray-600 text-white text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CaseDetails;
