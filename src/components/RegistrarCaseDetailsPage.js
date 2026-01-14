import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Search, ChevronDown, Bell, ChevronRight, MoreVertical, FileText, Calendar, Plus } from 'lucide-react';
import RegistrarCaseDiary from './RegistrarCaseDiary';
import AdminHeader from './admin/AdminHeader';
import RegistrarHeader from './RegistrarHeader';
import AddNewCaseForm from './AddNewCaseForm';
import ConfirmDialog from './admin/ConfirmDialog';
import NotificationContainer from './NotificationContainer';
import useNotifications from '../hooks/useNotifications';
import { apiGet, apiPut, apiDelete } from '../utils/api';

const RegistrarCaseDetailsPage = ({ caseData, onBack, userInfo, onNavigate, onLogout, isRegistrar }) => {
  const [activeTab, setActiveTab] = useState('Case details');
  const [showActionsDropdown, setShowActionsDropdown] = useState(false);
  const [documentType, setDocumentType] = useState('Parties Documents'); // 'Parties Documents' or 'Court Documents'
  const [notes, setNotes] = useState([]);
  const [showCaseDiary, setShowCaseDiary] = useState(false);
  const [selectedPartyIndex, setSelectedPartyIndex] = useState(null);
  const [linkedPersons, setLinkedPersons] = useState([]);
  const [linkedPersonsLoading, setLinkedPersonsLoading] = useState(false);
  const [fullCaseData, setFullCaseData] = useState(null);
  const [loadingCaseData, setLoadingCaseData] = useState(false);
  const [caseSummary, setCaseSummary] = useState(null);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const actionsDropdownRef = useRef(null);
  const partyActionRefs = useRef({});
  const { notifications, showSuccess, showError, removeNotification } = useNotifications();
  
  // Debug: Log notifications state changes
  useEffect(() => {
    console.log('Notifications state updated:', notifications);
  }, [notifications]);

  // Handle click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (actionsDropdownRef.current && !actionsDropdownRef.current.contains(event.target)) {
        setShowActionsDropdown(false);
      }
      // Check if click is outside any party action menu
      if (selectedPartyIndex !== null) {
        const ref = partyActionRefs.current[selectedPartyIndex];
        if (ref && !ref.contains(event.target)) {
          setSelectedPartyIndex(null);
        }
      }
    };

    if (showActionsDropdown || selectedPartyIndex !== null) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showActionsDropdown, selectedPartyIndex]);

  // Fetch full case data from API
  useEffect(() => {
    const fetchFullCaseData = async () => {
      if (!caseData?.id) {
        setFullCaseData(null);
        return;
      }
      
      try {
        setLoadingCaseData(true);
        // Fetch full case details from API (use admin endpoint)
        const response = await apiGet(`/api/admin/cases/${caseData.id}`);
        setFullCaseData(response);
        
        // If AI outcome doesn't exist, trigger AI analysis
        if (response && !response.ai_detailed_outcome && !response.ai_case_outcome) {
          try {
            // Trigger AI analysis (this will generate the expected outcome)
            await apiGet(`/case-summarization/${caseData.id}/summary`);
            // Refetch case data to get the AI-generated outcome
            const updatedResponse = await apiGet(`/api/admin/cases/${caseData.id}`);
            setFullCaseData(updatedResponse);
          } catch (aiErr) {
            console.error('Error triggering AI analysis:', aiErr);
            // Continue with existing data even if AI analysis fails
          }
        }
      } catch (err) {
        console.error('Error fetching full case data:', err);
        // Fallback to provided caseData
        setFullCaseData(caseData);
      } finally {
        setLoadingCaseData(false);
      }
    };
    
    fetchFullCaseData();
  }, [caseData?.id]);

  // Fetch linked persons from PersonCaseLink
  const fetchLinkedPersons = async (caseIdOverride = null) => {
    const caseId = caseIdOverride || fullCaseData?.id || caseData?.id;
    if (!caseId) {
      setLinkedPersons([]);
      return;
    }
    
    try {
      setLinkedPersonsLoading(true);
      console.log('Fetching linked persons for case:', caseId);
      const response = await apiGet(`/api/people/case/${caseId}/person-links`);
      console.log('Linked persons response:', response);
      
      if (response && Array.isArray(response)) {
        // Use person_full_name from the response if available, otherwise fetch person details
        const personsPromises = response.map(async (link) => {
          if (link.person_id) {
            // If person_full_name is already in the response, use it
            if (link.person_full_name) {
              return {
                id: link.person_id,
                full_name: link.person_full_name,
                role_in_case: link.role_in_case,
                link_id: link.id
              };
            }
            // Otherwise, fetch full person details
            try {
              const person = await apiGet(`/people/${link.person_id}`);
              return {
                ...person,
                role_in_case: link.role_in_case,
                link_id: link.id
              };
            } catch (err) {
              console.error(`Error fetching person ${link.person_id}:`, err);
              return {
                id: link.person_id,
                full_name: link.person?.full_name || 'Unknown Person',
                role_in_case: link.role_in_case,
                link_id: link.id
              };
            }
          }
          return null;
        });
        
        const persons = await Promise.all(personsPromises);
        const filteredPersons = persons.filter(p => p !== null);
        console.log('Filtered linked persons:', filteredPersons);
        setLinkedPersons(filteredPersons);
      } else {
        console.log('No linked persons found or invalid response');
        setLinkedPersons([]);
      }
    } catch (err) {
      console.error('Error fetching linked persons:', err);
      setLinkedPersons([]);
    } finally {
      setLinkedPersonsLoading(false);
    }
  };

  useEffect(() => {
    fetchLinkedPersons();
  }, [fullCaseData?.id, caseData?.id]);

  // Fetch case summary
  useEffect(() => {
    const fetchCaseSummary = async () => {
      const caseId = fullCaseData?.id || caseData?.id;
      if (!caseId) {
        setCaseSummary(null);
        return;
      }
      
      try {
        setLoadingSummary(true);
        console.log('Fetching case summary for case ID:', caseId);
        // Use apiGet to ensure authentication headers are included
        const summary = await apiGet(`/api/case-summaries/${caseId}/generate-or-get`);
        console.log('Case summary received:', summary);
        setCaseSummary(summary);
      } catch (err) {
        console.error('Error fetching case summary:', err);
        console.error('Error details:', err.message, err.response);
        // Don't set to null - let it show the placeholder message
        setCaseSummary(null);
      } finally {
        setLoadingSummary(false);
      }
    };
    
    if (fullCaseData || caseData) {
      fetchCaseSummary();
    }
  }, [fullCaseData?.id, caseData?.id]);

  // Format date helper
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    } catch (e) {
      return dateString;
    }
  };

  // Map court type abbreviations to full names
  const getCourtTypeName = (abbreviation) => {
    if (!abbreviation) return 'N/A';
    const courtTypeMap = {
      'CA': 'Court of Appeal',
      'HC': 'High Court',
      'SC': 'Supreme Court',
      'DC': 'District Court',
      'CC': 'Circuit Court',
      'MC': 'Magistrate Court'
    };
    return courtTypeMap[abbreviation.toUpperCase()] || abbreviation;
  };

  // Map region abbreviations to full names
  // GAR: Greater Accra Region, WR: Western Region, etc.
  const getRegionName = (abbreviation) => {
    if (!abbreviation) return 'N/A';
    const regionMap = {
      'GAR': 'Greater Accra Region',
      'ASR': 'Ashanti Region',
      'WR': 'Western Region',
      'WNR': 'Western North Region',
      'ER': 'Eastern Region',
      'CR': 'Central Region',
      'NR': 'Northern Region',
      'VR': 'Volta Region',
      'UER': 'Upper East Region',
      'UWR': 'Upper West Region',
      'BR': 'Bono Region',
      'AR': 'Ahafo Region',
      'BER': 'Bono East Region',
      'OR': 'Oti Region',
      'SR': 'Savannah Region',
      'NER': 'North East Region'
    };
    // Check if it's already a full name (contains "Region")
    if (abbreviation.includes('Region')) {
      return abbreviation;
    }
    // Convert abbreviation to uppercase and map
    const mapped = regionMap[abbreviation.toUpperCase()];
    return mapped || abbreviation;
  };

  // Map status to display format
  // 1: Active, 0: Inactive
  const getStatusDisplay = (status) => {
    if (status === null || status === undefined) return 'N/A';
    
    // Handle numeric status values
    if (status === 1 || status === '1') return 'Active';
    if (status === 0 || status === '0') return 'Inactive';
    
    // Handle string status values
    const statusStr = String(status).toLowerCase();
    const statusMap = {
      'active': 'Active',
      'inactive': 'Inactive',
      'pending': 'Pending',
      'adjourned': 'Adjourned',
      'heard': 'Heard',
      'closed': 'Closed',
      'dismissed': 'Dismissed',
      'ongoing': 'Ongoing'
    };
    return statusMap[statusStr] || status;
  };

  // Get status color coding
  // Always returns color for "COMPLETED"
  const getStatusColor = (status) => {
    // Always return green for COMPLETED
      return { bg: 'bg-green-50', text: 'text-green-600' };
  };

  // Parse presiding judge from JSON string or comma-separated string
  // Returns an array of judge names
  const parsePresidingJudges = (judgeData) => {
    if (!judgeData) return [];
    try {
      const parsed = JSON.parse(judgeData);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map(j => typeof j === 'string' ? j : j.name);
      }
      return [judgeData];
    } catch {
      // If not JSON, treat as comma-separated string
      if (typeof judgeData === 'string' && judgeData.includes(',')) {
        return judgeData.split(',').map(j => j.trim()).filter(j => j);
      }
      return [judgeData];
    }
  };

  // Helper function to determine party type
  const determinePartyType = (name) => {
    if (!name) return 'Individual';
    const nameUpper = name.toUpperCase();
    
    // Government indicators
    const governmentKeywords = ['REPUBLIC', 'ATTORNEY GENERAL', 'GOVERNMENT', 'MINISTER', 'MINISTRY', 'PUBLIC', 'STATE', 'NATIONAL', 'PARLIAMENT', 'SPEAKER', 'PRESIDENT'];
    if (governmentKeywords.some(keyword => nameUpper.includes(keyword))) {
      return 'Government';
    }
    
    // Company indicators (LTD, LIMITED, PLC, INC, CORPORATION, CORP)
    const companyKeywords = ['LTD', 'LIMITED', 'PLC', 'INC', 'CORPORATION', 'CORP', 'COMPANY', 'COMPANIES'];
    if (companyKeywords.some(keyword => nameUpper.includes(keyword))) {
      return 'Company';
    }
    
    // Industry indicators (BANK, INSURANCE, ASSOCIATION, SOCIETY, UNION, FOUNDATION, ORGANIZATION)
    const industryKeywords = ['BANK', 'INSURANCE', 'ASSOCIATION', 'SOCIETY', 'UNION', 'FOUNDATION', 'ORGANIZATION', 'ORGANISATION', 'INSTITUTE', 'INSTITUTION'];
    if (industryKeywords.some(keyword => nameUpper.includes(keyword))) {
      return 'Industry';
    }
    
    return 'Individual';
  };

  // Helper function to extract parties from title and judgment
  const extractPartiesAndRepresentatives = (title, judgmentText, protagonist, antagonist, lawyers) => {
    const partiesMap = new Map(); // Key: role, Value: { parties: [], representatives: [] }
    
    // Extract parties from title (plaintiff vs defendant pattern)
    if (title) {
      const vsPattern = /\s+vs?\.?\s+/i;
      if (vsPattern.test(title)) {
        const parts = title.split(vsPattern);
        if (parts.length >= 2) {
          // Clean and extract plaintiff parties (before vs)
          const plaintiffPart = parts[0].trim();
          // Remove text in parentheses like (PLAINTIFFS/APP/APPLICANTS)
          // Split by "&" or "AND" to get multiple parties
          const plaintiffParties = plaintiffPart.split(/\s+&\s+|\s+AND\s+/i)
            .map(p => p.replace(/\s*\([^)]*\)\s*/g, '').trim())
            .filter(p => p && !p.match(/^\(.*\)$/));
          
          plaintiffParties.forEach(partyName => {
            if (!partiesMap.has('Plaintiff')) {
              partiesMap.set('Plaintiff', { parties: [], representatives: [] });
            }
            const partyData = partiesMap.get('Plaintiff');
            if (!partyData.parties.includes(partyName)) {
              partyData.parties.push(partyName);
            }
          });
          
          // Clean and extract defendant parties (after vs)
          const defendantPart = parts[1].trim();
          // Remove text in parentheses like (DEFENDANT/RESP/RESPONDENT)
          const defendantParties = defendantPart.split(/\s+&\s+|\s+AND\s+/i)
            .map(p => p.replace(/\s*\([^)]*\)\s*/g, '').trim())
            .filter(p => p && !p.match(/^\(.*\)$/));
          
          defendantParties.forEach(partyName => {
            if (!partiesMap.has('Defendant')) {
              partiesMap.set('Defendant', { parties: [], representatives: [] });
            }
            const partyData = partiesMap.get('Defendant');
            if (!partyData.parties.includes(partyName)) {
              partyData.parties.push(partyName);
            }
          });
        }
      }
    }
    
    // Add protagonist/antagonist if available (from database)
    if (protagonist) {
      const names = protagonist.split(',').map(n => n.trim()).filter(n => n);
      names.forEach(name => {
        if (!partiesMap.has('Plaintiff')) {
          partiesMap.set('Plaintiff', { parties: [], representatives: [] });
        }
        const partyData = partiesMap.get('Plaintiff');
        if (!partyData.parties.includes(name)) {
          partyData.parties.push(name);
        }
      });
    }
    
    if (antagonist) {
      const names = antagonist.split(',').map(n => n.trim()).filter(n => n);
      names.forEach(name => {
        if (!partiesMap.has('Defendant')) {
          partiesMap.set('Defendant', { parties: [], representatives: [] });
        }
        const partyData = partiesMap.get('Defendant');
        if (!partyData.parties.includes(name)) {
          partyData.parties.push(name);
        }
      });
    }
    
    // Extract lawyers/representatives
    let lawyersList = [];
    if (lawyers) {
      try {
        const parsed = JSON.parse(lawyers);
        if (Array.isArray(parsed)) {
          lawyersList = parsed.map(l => typeof l === 'string' ? l : l.name).filter(Boolean);
        } else {
          lawyersList = [lawyers];
        }
      } catch {
        lawyersList = lawyers.split(',').map(n => n.trim()).filter(n => n);
      }
    }
    
    // Try to extract lawyers from judgment text if not found
    if (lawyersList.length === 0 && judgmentText) {
      // Look for patterns like "for the Plaintiff", "for the Defendant", "counsel for", etc.
      const counselPatterns = [
        /(?:counsel|counsel for|representing|for)\s+(?:the\s+)?(plaintiff|defendant|appellant|respondent)[:\s]+([A-Z][^.\n]+)/gi,
        /([A-Z][A-Za-z\s,]+)\s+(?:counsel|representing)\s+(?:for\s+)?(?:the\s+)?(plaintiff|defendant|appellant|respondent)/gi
      ];
      
      counselPatterns.forEach(pattern => {
        const matches = judgmentText.matchAll(pattern);
        for (const match of matches) {
          if (match[2]) {
            const role = match[2].toLowerCase().includes('plaintiff') || match[2].toLowerCase().includes('appellant') ? 'Plaintiff' : 'Defendant';
            const lawyerName = match[1]?.trim();
            if (lawyerName && lawyerName.length > 2) {
              lawyersList.push(lawyerName);
            }
          }
        }
      });
    }
    
    // Distribute lawyers to parties (split evenly or by context)
    if (lawyersList.length > 0) {
      const plaintiffLawyers = [];
      const defendantLawyers = [];
      
      // Simple heuristic: first half for plaintiff, second half for defendant
      const midPoint = Math.ceil(lawyersList.length / 2);
      lawyersList.slice(0, midPoint).forEach(lawyer => plaintiffLawyers.push(lawyer));
      lawyersList.slice(midPoint).forEach(lawyer => defendantLawyers.push(lawyer));
      
      if (partiesMap.has('Plaintiff')) {
        partiesMap.get('Plaintiff').representatives = plaintiffLawyers;
      }
      if (partiesMap.has('Defendant')) {
        partiesMap.get('Defendant').representatives = defendantLawyers;
      }
    }
    
    // Convert to array format for display
    const result = [];
    partiesMap.forEach((data, role) => {
      data.parties.forEach(partyName => {
        result.push({
          name: partyName,
          role: role,
          type: determinePartyType(partyName),
          representation: data.representatives.join(', ') || 'N/A'
        });
      });
    });
    
    return result;
  };

  // Compute parties list from title and judgment
  const parties = useMemo(() => {
    const caseInfo = fullCaseData || caseData || {};
    const title = caseInfo.title || '';
    const judgmentText = caseInfo.summernote || caseInfo.case_summary || caseInfo.summary || '';
    const protagonist = caseInfo.protagonist;
    const antagonist = caseInfo.antagonist;
    const lawyers = caseInfo.lawyers;
    
    return extractPartiesAndRepresentatives(title, judgmentText, protagonist, antagonist, lawyers);
  }, [fullCaseData, caseData]);

  // Helper function to extract court name from judgment text
  const extractCourtNameFromJudgment = (judgmentText) => {
    if (!judgmentText) return null;
    
    // Pattern to match [COURT NAME, LOCATION] or [COURT NAME]
    // Examples: [HIGH COURT, ACCRA], [SUPREME COURT, KUMASI], [COURT OF APPEAL]
    const pattern = /\[([^,\]]+)(?:\s*,\s*[^\]]+)?\]/;
    const match = judgmentText.match(pattern);
    
    if (match && match[1]) {
      // Extract the court name (first part before comma)
      const courtName = match[1].trim();
      return courtName;
    }
    
    return null;
  };

  // Helper function to extract areas of law from judgment text
  const extractAreasOfLaw = (judgmentText, existingAreaOfLaw) => {
    if (!judgmentText) {
      // If no judgment text, return existing area of law as array or empty array
      if (existingAreaOfLaw && existingAreaOfLaw !== 'N/A') {
        return [existingAreaOfLaw];
      }
      return [];
    }

    const textLower = judgmentText.toLowerCase();
    const areasFound = new Set();

    // Area of law keywords mapping
    const areaKeywords = {
      'Human Rights': ['human rights', 'fundamental rights', 'constitutional rights', 'bill of rights', 'civil rights', 'equality', 'discrimination', 'freedom of expression', 'freedom of assembly', 'right to life', 'right to property', 'due process'],
      'Contract': ['contract', 'agreement', 'breach of contract', 'specific performance', 'contractual obligation', 'contractual dispute', 'terms of contract', 'breach of agreement'],
      'Property': ['property', 'land', 'real estate', 'ownership', 'title', 'deed', 'boundary', 'possession', 'eviction', 'tenancy', 'landlord', 'tenant', 'lease', 'land dispute'],
      'Commercial': ['commercial', 'business', 'company', 'corporate', 'partnership', 'shareholder', 'director', 'liquidation', 'bankruptcy', 'insolvency', 'merger', 'acquisition'],
      'Employment': ['employment', 'workplace', 'dismissal', 'termination', 'unfair dismissal', 'discrimination', 'harassment', 'wages', 'salary', 'benefits', 'labor law', 'employment dispute'],
      'Family Law': ['divorce', 'custody', 'maintenance', 'alimony', 'child support', 'marriage', 'adoption', 'guardianship', 'domestic violence', 'family law'],
      'Criminal': ['criminal', 'offence', 'crime', 'assault', 'robbery', 'burglary', 'murder', 'manslaughter', 'drug', 'trafficking', 'possession', 'homicide'],
      'Tort': ['negligence', 'tort', 'damages', 'injury', 'accident', 'liability', 'compensation', 'personal injury', 'medical malpractice', 'defamation', 'slander', 'libel'],
      'Constitutional': ['constitution', 'constitutional', 'constitutional law', 'constitutional rights', 'election', 'electoral', 'public law'],
      'Administrative': ['administrative', 'public body', 'government', 'permit', 'license', 'administrative law', 'judicial review'],
      'Banking & Finance': ['banking', 'bank', 'financial', 'finance', 'loan', 'credit', 'mortgage', 'debt', 'banking law', 'financial services'],
      'Insurance': ['insurance', 'insurance claim', 'policy', 'coverage', 'premium', 'insurer', 'insurance dispute']
    };

    // Check for each area of law
    for (const [area, keywords] of Object.entries(areaKeywords)) {
      for (const keyword of keywords) {
        if (textLower.includes(keyword.toLowerCase())) {
          areasFound.add(area);
          break; // Found this area, move to next
        }
      }
    }

    // If we found areas, return them as array
    if (areasFound.size > 0) {
      return Array.from(areasFound);
    }

    // If no areas found but we have existing area of law, use that
    if (existingAreaOfLaw && existingAreaOfLaw !== 'N/A') {
      return [existingAreaOfLaw];
    }

    return [];
  };

  // Build data object from database fields
  const data = useMemo(() => {
    const caseInfo = fullCaseData || caseData || {};
    
    // Extract court name from judgment text if available
    const judgmentText = caseInfo.summernote || caseInfo.case_summary || caseInfo.summary || '';
    const extractedCourtName = extractCourtNameFromJudgment(judgmentText);
    
    // Extract areas of law from judgment text
    const extractedAreasOfLaw = extractAreasOfLaw(judgmentText, caseInfo.area_of_law);
    
    return {
      title: caseInfo.title || 'N/A',
      fullTitle: caseInfo.title || 'N/A',
      suitNo: caseInfo.suit_reference_number || 'N/A',
      dateFiled: formatDate(caseInfo.date),
      judges: parsePresidingJudges(caseInfo.presiding_judge),
      lastUpdated: formatDate(caseInfo.updated_at || caseInfo.created_at),
      status: 'COMPLETED',
      town: caseInfo.town || 'N/A',
      region: getRegionName(caseInfo.region) || 'N/A',
      courtType: getCourtTypeName(caseInfo.court_type),
      courtName: extractedCourtName || caseInfo.court_division || 'N/A',
      areasOfLaw: extractedAreasOfLaw.length > 0 ? extractedAreasOfLaw : ['N/A'],
      expectedOutcome: (() => {
        // Determine if outcome is favorable or not favorable
        // Check AI case outcome first (WON, LOST, PARTIALLY_WON, PARTIALLY_LOST, UNRESOLVED)
        const aiOutcome = (caseInfo.ai_case_outcome || caseInfo.ai_outcome || '').toUpperCase();
        if (aiOutcome === 'WON' || aiOutcome === 'PARTIALLY_WON') {
          return 'Favorable';
        }
        if (aiOutcome === 'LOST' || aiOutcome === 'PARTIALLY_LOST') {
          return 'Not Favorable';
        }
        
        // Check AI detailed outcome text
        const aiDetailed = (caseInfo.ai_detailed_outcome || '').toLowerCase();
        if (aiDetailed) {
          // Check for favorable indicators
          if (aiDetailed.includes('won') || aiDetailed.includes('favorable') || aiDetailed.includes('successful') || 
              aiDetailed.includes('granted') || aiDetailed.includes('allowed') || aiDetailed.includes('approved') ||
              aiDetailed.includes('upheld') || aiDetailed.includes('succeeded') || aiDetailed.includes('victory')) {
            return 'Favorable';
          }
          // Check for unfavorable indicators
          if (aiDetailed.includes('lost') || aiDetailed.includes('unfavorable') || aiDetailed.includes('dismissed') || 
              aiDetailed.includes('rejected') || aiDetailed.includes('denied') || aiDetailed.includes('refused') ||
              aiDetailed.includes('unsuccessful') || aiDetailed.includes('failed') || aiDetailed.includes('defeated')) {
            return 'Not Favorable';
          }
        }
        
        // Check decision/judgement fields
        const decision = (caseInfo.decision || caseInfo.judgement || '').toLowerCase();
        if (decision) {
          if (decision.includes('won') || decision.includes('favorable') || decision.includes('granted') ||
              decision.includes('allowed') || decision.includes('upheld')) {
            return 'Favorable';
          }
          if (decision.includes('lost') || decision.includes('dismissed') || decision.includes('rejected') ||
              decision.includes('denied') || decision.includes('unsuccessful')) {
            return 'Not Favorable';
          }
        }
        
        // Default if cannot determine
        return 'N/A';
      })(),
      caseContent: caseInfo.summernote || caseInfo.case_summary || caseInfo.summary || 'No content available.',
      documents: [], // Documents would be fetched separately if needed
      courtDocuments: [], // Court documents would be fetched separately if needed
      parties: parties,
      caseDiary: [], // Case diary would be fetched separately if needed
      auditHistory: [], // Audit history would be fetched separately if needed
      notes: notes,
      nextHearing: 'N/A', // Would be fetched from cause lists
      moreCasesThisWeek: 0
    };
  }, [fullCaseData, caseData, parties, notes]);

  // Combine all documents (since we removed the toggle)
  const allDocuments = [...(data.documents || []), ...(data.courtDocuments || [])];

  // Initialize notes state
  useEffect(() => {
    if (data.notes && data.notes.length > 0) {
      setNotes(data.notes);
    }
  }, [data.notes]);


  const handleViewCaseDiary = () => {
    setShowCaseDiary(true);
  };

  // Handle Edit Case
  const handleEditCase = () => {
    setShowActionsDropdown(false);
    setShowEditForm(true);
  };

  // Handle Delete Case
  const handleDeleteCase = () => {
    setShowActionsDropdown(false);
    setShowDeleteConfirm(true);
  };

  // Handle Confirm Delete
  const handleConfirmDelete = async () => {
    const caseId = fullCaseData?.id || caseData?.id;
    if (!caseId) {
      alert('Case ID not found');
      return;
    }

    try {
      setIsDeleting(true);
      await apiDelete(`/cases/${caseId}`);
      alert('Case deleted successfully');
      onBack(); // Go back to case list
    } catch (err) {
      console.error('Error deleting case:', err);
      alert(`Error deleting case: ${err.message || 'Unknown error'}`);
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  // Handle Save Case (from edit form)
  const handleSaveCase = async (caseData) => {
    const caseId = fullCaseData?.id || caseData?.id;
    if (!caseId) {
      showError('Error', 'Case ID not found');
      return;
    }

    try {
      console.log('Saving case with data:', caseData);
      console.log('Case ID:', caseId);
      console.log('Person links in data:', caseData.person_links);
      
      // Use the correct admin endpoint
      const response = await apiPut(`/admin/cases/${caseId}`, caseData);
      console.log('Save response:', response);
      
      // Wait a bit for database commit
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Refetch case data
      const updatedResponse = await apiGet(`/api/admin/cases/${caseId}`);
      setFullCaseData(updatedResponse);
      
      // Refetch linked persons to show newly added ones (use the caseId explicitly)
      console.log('Refetching linked persons after save...');
      await fetchLinkedPersons(caseId);
      
      // Wait a bit more to ensure state updates
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Show success notification BEFORE closing the form (with longer duration)
      console.log('About to show success notification...');
      try {
        showSuccess('Success', 'Case updated successfully', 5000);
        console.log('showSuccess called');
      } catch (err) {
        console.error('Error showing notification:', err);
        // Fallback to alert if notification system fails
        alert('Case updated successfully');
      }
      
      // Wait a moment for notification to render and be visible
      // Use requestAnimationFrame to ensure DOM update
      await new Promise(resolve => {
        requestAnimationFrame(() => {
          setTimeout(resolve, 500);
        });
      });
      
      // Close the edit form (this will show the case details page)
      // The notification will remain visible even after form closes
      setShowEditForm(false);
      
      // Log linked persons state after refetch
      setTimeout(() => {
        console.log('Linked persons after save:', linkedPersons);
      }, 1000);
    } catch (err) {
      console.error('Error updating case:', err);
      console.error('Error details:', err.response?.data || err.message);
      showError('Error', `Error updating case: ${err.response?.data?.detail || err.message || 'Unknown error'}`);
    }
  };

  // Handle Export Case
  const handleExportCase = () => {
    setShowActionsDropdown(false);
    const caseId = fullCaseData?.id || caseData?.id;
    if (!caseId) {
      alert('Case ID not found');
      return;
    }
    // TODO: Implement export functionality
    alert('Export functionality coming soon');
  };

  // Show case diary if requested
  if (showCaseDiary) {
    return (
      <RegistrarCaseDiary
        caseData={data}
        onBack={() => {
          setShowCaseDiary(false);
        }}
      />
    );
  }

  // Show edit form if requested
  if (showEditForm) {
    return (
      <>
        <AddNewCaseForm
          onBack={() => setShowEditForm(false)}
          onSave={handleSaveCase}
          userInfo={userInfo}
          onNavigate={onNavigate}
          onLogout={onLogout}
          isRegistrar={isRegistrar}
          initialData={fullCaseData || caseData}
          isEditMode={true}
        />
        {/* Toast Notifications - Also show in edit form view */}
        <NotificationContainer
          notifications={notifications}
          onRemove={removeNotification}
        />
      </>
    );
  }

  // Use userInfo from props or localStorage
  const displayUserInfo = userInfo || JSON.parse(localStorage.getItem('userData') || '{}');

  return (
    <div className="bg-[#F7F8FA] min-h-screen">
      {/* Full Width Header */}
      {isRegistrar ? (
        <RegistrarHeader userInfo={displayUserInfo} onNavigate={onNavigate} onLogout={onLogout} />
      ) : (
        <AdminHeader userInfo={displayUserInfo} onNavigate={onNavigate} onLogout={onLogout} />
      )}

      {/* Main Content */}
      <div className="px-6 w-full">
        {loadingCaseData ? (
          <div className="flex flex-col bg-white p-4 gap-6 rounded-lg w-full min-h-[1116px] items-center justify-center">
            <span className="text-[#525866] text-sm">Loading case details...</span>
          </div>
        ) : (
        <div className="flex flex-col bg-white p-4 gap-6 rounded-lg w-full min-h-[1116px]">
          {/* Header Section */}
          <div className="flex flex-col gap-6">
            {/* Breadcrumb */}
            <div className="flex items-center gap-1">
              <span className="text-[#525866] text-xs opacity-75 mr-1 whitespace-nowrap">CASE PROFILE</span>
              <ChevronRight className="w-4 h-4 text-[#525866] mr-1" />
              <span className="text-[#070810] text-sm font-normal whitespace-nowrap">{data.title}</span>
            </div>

            {/* Title Section */}
            <div className="flex items-start gap-3">
              <button
                onClick={onBack}
                className="p-2 bg-[#F7F8FA] rounded-lg cursor-pointer hover:opacity-70 flex-shrink-0"
              >
                <ChevronRight className="w-6 h-6 text-[#050F1C] rotate-180" />
              </button>
              <span className="text-[#050F1C] text-2xl font-medium flex-1">
                {data.fullTitle}
              </span>
            </div>

            {/* Tabs and Actions */}
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setActiveTab('Case details')}
                  className={`pb-2 px-0 text-base transition-colors ${
                    activeTab === 'Case details'
                      ? 'text-[#022658] border-b-4 border-[#022658] font-bold'
                      : 'text-[#525866] font-normal'
                  }`}
                >
                  Case details
                </button>
                <button
                  onClick={() => setActiveTab('Parties & Representatives')}
                  className={`pb-2 px-0 text-base transition-colors ${
                    activeTab === 'Parties & Representatives'
                      ? 'text-[#022658] border-b-4 border-[#022658] font-bold'
                      : 'text-[#525866] font-normal'
                  }`}
                >
                  Parties & Representatives
                </button>
                <button
                  onClick={() => setActiveTab('Documents')}
                  className={`pb-2 px-0 text-base transition-colors ${
                    activeTab === 'Documents'
                      ? 'text-[#022658] border-b-4 border-[#022658] font-bold'
                      : 'text-[#525866] font-normal'
                  }`}
                >
                  Documents
                </button>
              </div>

              {/* Actions Dropdown */}
              <div className="relative" ref={actionsDropdownRef}>
                <button
                  onClick={() => setShowActionsDropdown(!showActionsDropdown)}
                  className="flex items-center gap-1 text-[#022658] text-xs font-bold cursor-pointer"
                >
                  <span>Actions</span>
                  <MoreVertical className="w-4 h-4 text-[#022658] rotate-90" />
                </button>
                {showActionsDropdown && (
                  <div className="absolute right-0 mt-2 bg-white border border-[#D4E1EA] rounded-lg shadow-lg z-10 min-w-[150px]">
                    <div 
                      className="px-3 py-2 text-xs text-[#525866] hover:bg-gray-50 cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditCase();
                      }}
                    >
                      Edit Case
                    </div>
                    <div 
                      className="px-3 py-2 text-xs text-[#525866] hover:bg-gray-50 cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteCase();
                      }}
                    >
                      Delete Case
                    </div>
                    <div 
                      className="px-3 py-2 text-xs text-[#525866] hover:bg-gray-50 cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleExportCase();
                      }}
                    >
                      Export
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Case Details Tab Content */}
            {activeTab === 'Case details' && (
              <div className="flex flex-col gap-6">
                {/* Key Information Cards */}
                <div className="px-8 py-4 bg-[#F4F6F9] rounded-lg flex justify-between items-center">
                  <div className="w-[200px] px-2 border-r border-[#D4E1EA]">
                    <div className="flex flex-col gap-2">
                      <span className="text-[#868C98] text-xs">Suit No.</span>
                      <span className="text-[#022658] text-base font-medium">{data.suitNo}</span>
                    </div>
                  </div>
                  <div className="w-[200px] px-2 border-r border-[#D4E1EA]">
                    <div className="flex flex-col gap-2">
                      <span className="text-[#868C98] text-xs">Date Filed</span>
                      <span className="text-[#022658] text-base font-medium">{data.dateFiled}</span>
                    </div>
                  </div>
                  <div className="w-[200px] px-2 border-r border-[#D4E1EA]">
                    <div className="flex flex-col gap-2">
                      <span className="text-[#868C98] text-xs">{data.judges && data.judges.length > 1 ? 'Judges' : 'Judge'}</span>
                      {data.judges && data.judges.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                          {data.judges.map((judge, index) => (
                            <span
                              key={index}
                              className="inline-block px-2 py-1 bg-[#F7F8FA] border border-[#D4E1EA] rounded text-[#022658] text-sm font-medium"
                            >
                              {judge}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-[#022658] text-base font-medium">N/A</span>
                      )}
                    </div>
                  </div>
                  <div className="w-[200px] px-2 border-r border-[#D4E1EA]">
                    <div className="flex flex-col gap-2">
                      <span className="text-[#868C98] text-xs">Last Updated</span>
                      <span className="text-[#022658] text-base font-medium">{data.lastUpdated}</span>
                    </div>
                  </div>
                  <div className="w-[200px] px-2">
                    <div className="flex flex-col gap-2">
                      <span className="text-[#868C98] text-xs">Status</span>
                      <span className={`text-xs font-medium px-2 py-1 rounded whitespace-nowrap inline-block ${getStatusColor(data.status).bg} ${getStatusColor(data.status).text}`}>
                        {data.status}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Additional Information Cards */}
                <div className="px-8 py-4 rounded-lg border border-[#F4F6F9] flex justify-between items-center">
                  <div className="w-[200px] px-2 border-r border-[#D4E1EA]">
                    <div className="flex flex-col gap-2">
                      <span className="text-[#868C98] text-xs">Town</span>
                      <span className="text-[#050F1C] text-base font-medium">{data.town}</span>
                    </div>
                  </div>
                  <div className="w-[200px] px-2 border-r border-[#D4E1EA]">
                    <div className="flex flex-col gap-2">
                      <span className="text-[#868C98] text-xs">Region</span>
                      <span className="text-[#050F1C] text-base font-medium">{data.region}</span>
                    </div>
                  </div>
                  <div className="w-[200px] px-2 border-r border-[#D4E1EA]">
                    <div className="flex flex-col gap-2">
                      <span className="text-[#868C98] text-xs">Court type</span>
                      <span className="text-[#050F1C] text-base font-medium">{data.courtType}</span>
                    </div>
                  </div>
                  <div className="w-[200px] px-2 border-r border-[#D4E1EA]">
                    <div className="flex flex-col gap-2">
                      <span className="text-[#868C98] text-xs">Court name</span>
                      <span className="text-[#050F1C] text-base font-medium">{data.courtName}</span>
                    </div>
                  </div>
                  <div className="w-[200px] px-2">
                    <div className="flex flex-col gap-2">
                      <span className="text-[#868C98] text-xs">{data.areasOfLaw && data.areasOfLaw.length > 1 ? 'Areas of Law' : 'Area of Law'}</span>
                      {data.areasOfLaw && data.areasOfLaw.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                          {data.areasOfLaw.map((area, index) => (
                            <span
                              key={index}
                              className="inline-block px-2 py-1 bg-[#F7F8FA] border border-[#D4E1EA] rounded text-[#050F1C] text-sm font-medium"
                            >
                              {area}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-[#050F1C] text-base font-medium">N/A</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Expected Outcome */}
                <div className="flex flex-col gap-2">
                  <span className="text-[#050F1C] text-base font-medium">Expected Outcome</span>
                  <span className={`text-base font-medium px-2 py-1 rounded whitespace-nowrap inline-block ${
                    data.expectedOutcome === 'Favorable' 
                      ? 'bg-green-50 text-green-600' 
                      : data.expectedOutcome === 'Not Favorable'
                      ? 'bg-red-50 text-red-600'
                      : 'bg-gray-50 text-gray-600'
                  }`}>
                    {data.expectedOutcome}
                  </span>
                </div>

                {/* Case Summary */}
                <div className="flex flex-col gap-3">
                  <span className="text-[#050F1C] text-base font-medium">Case Summary</span>
                  {loadingSummary ? (
                    <div className="bg-white border border-[#E4E7EB] rounded-lg p-6 shadow-sm">
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#022658]"></div>
                        <span className="text-[#525866] text-sm">Loading summary...</span>
                      </div>
                    </div>
                  ) : caseSummary && caseSummary.summary ? (
                    <div className="bg-white border border-[#E4E7EB] rounded-lg p-6 shadow-sm">
                      <div className="flex flex-col gap-4">
                        <div className="text-[#050F1C] text-sm leading-relaxed whitespace-pre-line">
                          {caseSummary.summary}
                        </div>
                        {caseSummary.has_monetary_value && caseSummary.monetary_value && (
                          <div className="mt-2 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-[#022658] rounded-lg">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-[#022658] text-xs font-semibold uppercase tracking-wide">Monetary Value</span>
                            </div>
                            <span className="text-[#022658] text-lg font-bold">
                              {caseSummary.monetary_currency === 'GHS' ? '₵' : caseSummary.monetary_currency === 'USD' ? '$' : ''}
                              {caseSummary.monetary_value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              {caseSummary.monetary_currency && caseSummary.monetary_currency !== 'GHS' && caseSummary.monetary_currency !== 'USD' && ` ${caseSummary.monetary_currency}`}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="bg-white border border-[#E4E7EB] rounded-lg p-6 shadow-sm">
                      <div className="flex items-center gap-2 text-[#525866] text-sm italic">
                        <FileText className="w-4 h-4 text-[#868C98]" />
                        <span>Summary will be generated automatically...</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Quick Documents */}
                {data.documents && data.documents.length > 0 && (
                  <div className="flex items-start gap-6">
                    {data.documents.map((doc, index) => (
                      <div
                        key={index}
                        className="h-[60px] px-2 py-2 bg-[#F7F8FA] rounded-lg border border-[#E4E7EB] flex items-center gap-1 shadow-sm"
                        style={{ boxShadow: '4px 4px 4px rgba(7, 8, 16, 0.10)' }}
                      >
                        <FileText className="w-6 h-7 text-[#868C98]" />
                        <span className="text-[#050F1C] text-sm">{doc.name}</span>
                      </div>
                    ))}
                  </div>
                )}

              </div>
            )}

            {/* Parties & Representatives Tab Content */}
            {activeTab === 'Parties & Representatives' && (
              <div className="flex flex-col gap-6">
                {/* Parties Table */}
                <div className="overflow-hidden rounded-[14px] border border-[#E5E8EC] w-full">
                  {/* Table Header */}
                  <div className="bg-[#F4F6F9] py-4 px-4">
                    <div className="flex items-center gap-3 w-full">
                      <div className="flex-1 min-w-[200px] px-4">
                        <span className="text-[#070810] text-sm font-bold">Party Name</span>
                      </div>
                      <div className="flex-1 min-w-[150px] px-4">
                        <span className="text-[#070810] text-sm font-bold">Role</span>
                      </div>
                      <div className="flex-1 min-w-[150px] px-4">
                        <span className="text-[#070810] text-sm font-bold">Type</span>
                      </div>
                      <div className="flex-1 min-w-[200px] px-4">
                        <span className="text-[#070810] text-sm font-bold">Representation</span>
                      </div>
                    </div>
                  </div>

                  {/* Table Body */}
                  <div className="bg-white w-full">
                    {parties.length > 0 ? (
                      parties.map((party, index, array) => (
                      <div
                        key={index}
                        className={`flex items-center gap-3 py-3 px-4 w-full ${
                          index < array.length - 1 ? 'border-b border-[#E5E8EC]' : ''
                        }`}
                      >
                        <div className="flex-1 min-w-[200px] px-4">
                          <span className="text-[#070810] text-sm">{party.name}</span>
                        </div>
                          <div className="flex-1 min-w-[150px] px-4">
                          <span className="text-[#070810] text-sm">{party.role}</span>
                        </div>
                          <div className="flex-1 min-w-[150px] px-4">
                          <span className="text-[#070810] text-sm">{party.type}</span>
                        </div>
                        <div className="flex-1 min-w-[200px] px-4">
                            <span className="text-[#070810] text-sm">{party.representation}</span>
                        </div>
                        </div>
                      ))
                    ) : (
                      <div className="py-8 text-center text-[#525866] text-sm">
                        No parties found
                            </div>
                          )}
                  </div>
                </div>

              </div>
            )}

            {/* Documents Tab Content */}
            {activeTab === 'Documents' && (
              <div className="flex flex-col gap-6">
                {/* Case Content */}
                <div className="flex flex-col gap-2">
                  <div 
                    className="text-[#050F1C] text-base font-normal text-justify"
                    dangerouslySetInnerHTML={{ __html: data.caseContent }}
                  />
                </div>

                {/* Documents Table */}
                <div className="overflow-hidden rounded-[14px] border border-[#E5E8EC] w-full">
                  {/* Table Header */}
                  <div className="bg-[#F4F6F9] py-4 px-4">
                    <div className="flex items-center gap-3 w-full">
                      <div className="flex-1 min-w-[210px] px-4">
                        <span className="text-[#070810] text-sm font-bold">Date</span>
                      </div>
                      <div className="flex-1 min-w-[210px] px-4">
                        <span className="text-[#070810] text-sm font-bold">File name</span>
                      </div>
                      <div className="flex-1 min-w-[210px] px-4 flex justify-end"></div>
                    </div>
                  </div>

                  {/* Table Body */}
                  <div className="bg-white w-full">
                    {allDocuments.length > 0 ? (
                      allDocuments.map((doc, index, array) => (
                      <div
                        key={index}
                        className={`flex items-center gap-3 py-3 px-4 w-full ${
                          index < array.length - 1 ? 'border-b border-[#E5E8EC]' : ''
                        }`}
                      >
                        <div className="flex-1 min-w-[210px] px-4">
                          <span className="text-[#070810] text-sm">{doc.date || '-'}</span>
                        </div>
                        <div className="flex-1 min-w-[210px] px-4">
                            <span className="text-[#070810] text-sm">{doc.name || doc.fileName || '-'}</span>
                        </div>
                        <div className="flex-1 min-w-[210px] px-4 flex justify-end">
                          <button className="flex items-center gap-1 text-[#022658] text-sm font-bold hover:opacity-70">
                            <span>View</span>
                            <ChevronRight className="w-4 h-4 text-[#050F1C]" />
                          </button>
                        </div>
                      </div>
                      ))
                    ) : (
                      <div className="py-8 text-center text-[#525866] text-sm">
                        No documents available
                      </div>
                    )}
                  </div>
                </div>

                {/* Upload New Document Button */}
                <button className="w-fit px-4 py-2 rounded-lg border border-[#F59E0B] text-[#F59E0B] text-base font-medium hover:opacity-70 transition-opacity">
                  Upload New Document
                </button>

              </div>
            )}

            {/* Other Tabs - Placeholder */}
            {activeTab !== 'Case details' && activeTab !== 'Parties & Representatives' && activeTab !== 'Documents' && (
              <div className="py-8 text-center text-[#525866]">
                {activeTab} content coming soon...
              </div>
            )}
          </div>
        </div>
        )}
      </div>
      
      {/* Toast Notifications - Render at top level to persist across navigation */}
      <NotificationContainer
        notifications={notifications}
        onRemove={removeNotification}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleConfirmDelete}
        title="Confirm Delete"
        message={`Are you sure you want to delete case "${fullCaseData?.title || caseData?.title || 'this case'}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
      />
    </div>
  );
};

export default RegistrarCaseDetailsPage;

