import React, { useState, useMemo, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import CaseDiary from './CaseDiary';
import { apiGet, apiPost } from '../../utils/api';

const CaseDetails = ({ caseData, person, onBack, userInfo }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeDocTab, setActiveDocTab] = useState('parties');
  const [showCaseDiary, setShowCaseDiary] = useState(false);
  const [aiSummary, setAiSummary] = useState(null);
  const [aiOutcome, setAiOutcome] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryError, setSummaryError] = useState(null);
  const [linkedPersons, setLinkedPersons] = useState([]);
  const [linkedPersonsLoading, setLinkedPersonsLoading] = useState(false);

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
  const getRegionName = (abbreviation) => {
    if (!abbreviation) return 'N/A';
    const regionMap = {
      'GAR': 'Greater Accra',
      'ASR': 'Ashanti Region',
      'CR': 'Central Region',
      'ER': 'Eastern Region',
      'NR': 'Northern Region',
      'WR': 'Western Region',
      'VR': 'Volta Region',
      'UER': 'Upper East Region',
      'UWR': 'Upper West Region',
      'BR': 'Bono Region',
      'BER': 'Bono East Region',
      'AR': 'Ahafo Region',
      'SR': 'Savannah Region',
      'NER': 'North East Region',
      'OR': 'Oti Region',
      'WNR': 'Western North Region'
    };
    return regionMap[abbreviation.toUpperCase()] || abbreviation;
  };

  // Helper function to validate if a string is likely a name vs a statement
  const isValidName = (text) => {
    if (!text || typeof text !== 'string') return false;
    
    const trimmed = text.trim();
    
    // Too short or too long (names are usually 2-100 characters)
    if (trimmed.length < 2 || trimmed.length > 100) return false;
    
    // Contains common statement indicators (strong signals)
    const strongStatementIndicators = [
      /\b(court|judge|plaintiff|defendant|appellant|respondent)\s+(ordered|ruled|decided|held|found|stated|said|granted|dismissed)\b/i,
      /\b(ordered|ruled|decided|held|found|stated|said|granted|dismissed|allowed|denied)\s+(that|the|a|an)\b/i,
      /\.\s+[A-Z]/g, // Multiple sentences (period followed by capital letter)
      /\b(amount|sum|money|payment|damages|award|compensation)\s+(of|in|is|was)\s+/i,
      /\d+\s*(million|thousand|hundred|cedis|dollars|ghc|usd)\b/i, // Contains monetary amounts
      /\b(judgment|judgement|decision|order|ruling)\s+(is|was|states|stated)\b/i,
      /\b(in|on|at|for|with|by)\s+(the|a|an)\s+(case|matter|proceeding|action|suit|litigation)\b/i,
      /^the\s+(court|judge|plaintiff|defendant|case|matter)\s+/i, // Starts with "the court/judge/etc"
    ];
    
    // Check if it matches strong statement patterns
    for (const pattern of strongStatementIndicators) {
      if (pattern.test(trimmed)) {
        return false;
      }
    }
    
    // Too many words (names usually have 1-5 words, but allow up to 6 for complex names)
    const wordCount = trimmed.split(/\s+/).length;
    if (wordCount > 6) return false;
    
    // Contains too many special characters (names usually have minimal punctuation)
    // Allow common punctuation like periods, commas, hyphens, apostrophes
    const specialCharCount = (trimmed.match(/[^\w\s\-.,']/g) || []).length;
    if (specialCharCount > 2) return false;
    
    // Check for sentence-like patterns (contains verbs in common positions)
    const verbPatterns = [
      /\b(is|was|are|were|has|have|had|will|would|should|could|may|might|must|can)\s+\w+/i,
      /\w+\s+(is|was|are|were|has|have|had|will|would|should|could|may|might|must|can)\s+/i,
    ];
    let hasVerbPattern = false;
    for (const pattern of verbPatterns) {
      if (pattern.test(trimmed)) {
        hasVerbPattern = true;
        break;
      }
    }
    
    // If it has verb patterns and is longer than typical name, likely a statement
    if (hasVerbPattern && trimmed.length > 50) return false;
    
    // All lowercase or all uppercase (names usually have proper capitalization)
    // But allow if it's a short acronym (2-4 chars)
    if (wordCount > 1) {
      if (trimmed === trimmed.toLowerCase() && trimmed.length > 4) return false;
      if (trimmed === trimmed.toUpperCase() && trimmed.length > 4) return false;
    }
    
    // Contains numbers (names rarely contain numbers unless it's a company)
    if (/\d/.test(trimmed)) {
      // Allow numbers only if it's clearly a company name pattern or Roman numerals
      const isCompanyPattern = trimmed.match(/^[A-Z][a-z]+(\s+[A-Z][a-z]+)*\s+(Ltd|Limited|Inc|Incorporated|Corp|Corporation|LLC|PLC|GmbH)\.?$/i);
      const isRomanNumeral = /^[IVXLCDM]+$/i.test(trimmed.replace(/\s+/g, ''));
      if (!isCompanyPattern && !isRomanNumeral) {
        return false;
      }
    }
    
    return true;
  };

  // Helper function to extract names from text (handles comma-separated lists)
  const extractNames = (text) => {
    if (!text) return [];
    
    if (Array.isArray(text)) {
      return text.filter(item => isValidName(item));
    }
    
    if (typeof text !== 'string') return [];
    
    // Split by common delimiters
    const candidates = text.split(/[,;|]/).map(s => s.trim()).filter(s => s.length > 0);
    
    const validNames = [];
    for (const candidate of candidates) {
      if (isValidName(candidate)) {
        validNames.push(candidate);
      } else {
        // Try to extract names from the candidate (e.g., "John Doe vs. Jane Smith" -> ["John Doe", "Jane Smith"])
        const vsPattern = /\bvs\.?\s+/i;
        if (vsPattern.test(candidate)) {
          const parts = candidate.split(vsPattern);
          parts.forEach(part => {
            const trimmed = part.trim();
            if (isValidName(trimmed)) {
              validNames.push(trimmed);
            }
          });
        }
      }
    }
    
    return validNames;
  };

  // Fetch linked persons from PersonCaseLink
  useEffect(() => {
    const fetchLinkedPersons = async () => {
      if (!caseData?.id) {
        setLinkedPersons([]);
        return;
      }
      
      try {
        setLinkedPersonsLoading(true);
        const response = await apiGet(`/people/case/${caseData.id}/person-links`);
        if (response && Array.isArray(response)) {
          // Fetch full person details for each linked person
          const personsPromises = response.map(link => {
            if (link.person_id) {
              return apiGet(`/people/${link.person_id}`)
                .then(person => ({
                  ...person,
                  role_in_case: link.role_in_case,
                  link_id: link.id
                }))
                .catch(err => {
                  console.error(`Error fetching person ${link.person_id}:`, err);
                  // Return basic info from link if person fetch fails
                  return {
                    id: link.person_id,
                    full_name: link.person?.full_name || 'Unknown Person',
                    role_in_case: link.role_in_case,
                    link_id: link.id
                  };
                });
            }
            return null;
          });
          
          const persons = await Promise.all(personsPromises);
          setLinkedPersons(persons.filter(p => p !== null));
        } else {
          setLinkedPersons([]);
        }
      } catch (err) {
        console.error('Error fetching linked persons:', err);
        setLinkedPersons([]);
      } finally {
        setLinkedPersonsLoading(false);
      }
    };
    
    fetchLinkedPersons();
  }, [caseData?.id]);

  // Extract parties from case data dynamically
  const parties = useMemo(() => {
    const partiesList = [];
    
    // Helper to add party if valid and not duplicate
    const addPartyIfValid = (name, role, type = 'Individual', personId = null) => {
      if (name && isValidName(name) && !partiesList.some(p => 
        p.name.toLowerCase() === name.toLowerCase() || 
        (personId && p.personId === personId)
      )) {
        partiesList.push({
          name: name.trim(),
          role: role,
          type: type,
          contact: 'N/A',
          status: 'Active',
          personId: personId
        });
        return true;
      }
      return false;
    };
    
    // First, add persons from PersonCaseLink (these are explicitly linked)
    linkedPersons.forEach((linkedPerson) => {
      if (linkedPerson.full_name) {
        addPartyIfValid(
          linkedPerson.full_name,
          linkedPerson.role_in_case || 'Related Party',
          'Individual',
          linkedPerson.id
        );
      }
    });
    
    // Prioritize metadata fields first (they might be more structured)
    // Add protagonist as Plaintiff (check metadata first, then main data)
    const protagonist = caseData?.metadata?.protagonist || caseData?.protagonist;
    if (protagonist) {
      const protagonistNames = extractNames(protagonist);
      protagonistNames.forEach((name) => {
        addPartyIfValid(name, 'Plaintiff');
      });
    }
    
    // Add antagonist as Defendant (check metadata first, then main data)
    const antagonist = caseData?.metadata?.antagonist || caseData?.antagonist;
    if (antagonist) {
      const antagonistNames = extractNames(antagonist);
      antagonistNames.forEach((name) => {
        addPartyIfValid(name, 'Defendant');
      });
    }
    
    // Add lawyers from metadata or main data
    const lawyers = caseData?.metadata?.lawyers || caseData?.lawyers;
    if (lawyers) {
      const lawyersList = Array.isArray(lawyers) ? lawyers : [lawyers];
      let counselIndex = 0;
      lawyersList.forEach((lawyer) => {
        const lawyerNames = extractNames(lawyer);
        lawyerNames.forEach((name) => {
          if (addPartyIfValid(name, counselIndex === 0 ? "Plaintiff's Counsel" : "Defendant's Counsel")) {
            counselIndex++;
          }
        });
      });
    }
    
    // Add related people from metadata if available
    if (caseData?.metadata?.related_people) {
      const relatedPeople = Array.isArray(caseData.metadata.related_people) 
        ? caseData.metadata.related_people 
        : [caseData.metadata.related_people];
      relatedPeople.forEach((person) => {
        const personNames = extractNames(person);
        personNames.forEach((name) => {
          addPartyIfValid(name, 'Related Party');
        });
      });
    }
    
    // Add organizations from metadata if available
    if (caseData?.metadata?.organizations) {
      const organizations = Array.isArray(caseData.metadata.organizations) 
        ? caseData.metadata.organizations 
        : [caseData.metadata.organizations];
      organizations.forEach((org) => {
        const orgNames = extractNames(org);
        orgNames.forEach((name) => {
          addPartyIfValid(name, 'Organization', 'Organization');
        });
      });
    }
    
    // Only return parties if we have valid names, otherwise return empty array
    return partiesList;
  }, [caseData, linkedPersons]);

  // Extract documents from case data (if available in future)
  const partiesDocuments = useMemo(() => {
    // For now, return empty array as documents might be stored separately
    // This can be extended when document storage is implemented
    return [];
  }, [caseData]);

  // Fetch AI-generated summary when case data is available
  useEffect(() => {
    const fetchAISummary = async () => {
      if (!caseData?.id) return;
      
      try {
        setSummaryLoading(true);
        setSummaryError(null);
        
        // Try to get existing summary first, or generate new one
        const response = await apiGet(`/case-summarization/${caseData.id}/summary`);
        
        console.log('[CaseDetails] AI Summary Response:', response);
        
        if (response && response.summary) {
          setAiSummary(response.summary);
        } else {
          // If no summary in response, use fallback from caseData
          console.warn('[CaseDetails] No summary in response, using caseData');
        }
        
        if (response && response.outcome) {
          setAiOutcome(response.outcome);
        } else {
          // Use decision column as fallback
          const fallbackOutcome = caseData?.decision || caseData?.judgement || caseData?.metadata?.outcome;
          if (fallbackOutcome) {
            setAiOutcome(`From a financial law perspective: ${fallbackOutcome}`);
          }
        }
        
        // Show note if using fallback
        if (response && response.fallback) {
          setSummaryError(null); // Don't show error, just note it's from decision column
        }
      } catch (error) {
        console.error('Error fetching AI summary:', error);
        // Use decision column as fallback - create concise summary
        if (caseData?.decision) {
          const decisionText = caseData.decision;
          // Create concise summary (first 500 chars max)
          const conciseDecision = decisionText.length > 500 
            ? decisionText.substring(0, 500) + '...' 
            : decisionText;
          
          setAiSummary(`This case involves ${caseData.protagonist || 'plaintiff'} and ${caseData.antagonist || 'defendant'} in ${caseData.area_of_law || 'legal'} matters.\n\nCourt Decision: ${conciseDecision}`);
          
          // Determine outcome classification
          const decisionLower = decisionText.toLowerCase();
          let outcomeClass = 'OTHER';
          if (decisionLower.includes('won') || decisionLower.includes('successful') || decisionLower.includes('granted') || decisionLower.includes('awarded') || decisionLower.includes('favor')) {
            outcomeClass = 'FAVORABLE';
          } else if (decisionLower.includes('dismissed') || decisionLower.includes('rejected') || decisionLower.includes('denied') || decisionLower.includes('lost') || decisionLower.includes('against')) {
            outcomeClass = 'NOT FAVORABLE';
          }
          
          setAiOutcome(`${outcomeClass} - ${conciseDecision.substring(0, 200)}...`);
          setSummaryError(null); // Don't show error if we have decision data
        } else if (caseData?.judgement) {
          const judgementText = caseData.judgement;
          const conciseJudgement = judgementText.length > 500 
            ? judgementText.substring(0, 500) + '...' 
            : judgementText;
          
          setAiSummary(`This case involves ${caseData.protagonist || 'plaintiff'} and ${caseData.antagonist || 'defendant'} in ${caseData.area_of_law || 'legal'} matters.\n\nCourt Judgement: ${conciseJudgement}`);
          setAiOutcome(`OTHER - ${conciseJudgement.substring(0, 200)}...`);
          setSummaryError(null);
        } else {
          setSummaryError('AI summary unavailable. Using available case information from database.');
        }
      } finally {
        setSummaryLoading(false);
      }
    };

    fetchAISummary();
  }, [caseData?.id]);

  // Show case diary if clicked
  if (showCaseDiary) {
    return (
      <CaseDiary
        caseData={caseData}
        person={person}
        onBack={() => setShowCaseDiary(false)}
        userInfo={userInfo}
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
              <img src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Iq8V0MifpP/fualutdq_expires_30_days.png" className="w-[19px] h-[19px] object-fill" />
              <div className="flex items-center bg-white w-12 py-1 px-[9px] gap-1 rounded">
                <span className="text-[#525866] text-xs font-bold">All</span>
                <img src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Iq8V0MifpP/h83ji1cu_expires_30_days.png" className="w-3 h-3 rounded object-fill" />
              </div>
            </div>
          </div>
          <div className="flex items-center w-[173px] py-[1px] gap-3">
            <img src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Iq8V0MifpP/1fpzoj0z_expires_30_days.png" className="w-9 h-9 object-fill" />
            <div className="flex items-center w-[125px] gap-1.5">
              <img src={userInfo?.avatar || "/images/image.png"} className="w-9 h-9 rounded-full object-cover" />
              <div className="flex flex-col items-start w-[83px] gap-1">
                <span className="text-[#040E1B] text-base font-bold">{userInfo?.name || 'Eric Kwaah'}</span>
                <div className="flex items-center gap-1">
                  <img src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Iq8V0MifpP/wht3rh4e_expires_30_days.png" className="w-2 h-2 object-fill" />
                  <span className="text-[#525866] text-xs">Online</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white px-3.5 rounded-lg">
          <div className="flex flex-col items-start mt-4 mb-[60px] gap-6">
            {/* Breadcrumb */}
            <div className="flex items-center gap-1 flex-wrap">
              <span className="text-[#525866] text-xs whitespace-nowrap">PERSONS</span>
              <img src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Iq8V0MifpP/dx6k9j51_expires_30_days.png" className="w-4 h-4 object-fill" />
              <span className="text-[#040E1B] text-xs whitespace-nowrap">{person?.industry?.name?.toUpperCase() || 'BANKING & FINANCE'}</span>
              <img src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Iq8V0MifpP/h6s7rcvp_expires_30_days.png" className="w-4 h-4 object-fill" />
              <span className="text-[#070810] text-sm whitespace-nowrap">{person?.full_name || person?.name || 'N/A'}</span>
              <img src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Iq8V0MifpP/rrkpqehq_expires_30_days.png" className="w-4 h-4 object-fill" />
              <span className="text-[#070810] text-sm whitespace-nowrap">{caseData?.title || 'Case Details'}</span>
            </div>

            {/* Case Title */}
            <div className="flex items-start">
              <button onClick={onBack} className="mr-3 cursor-pointer hover:opacity-70">
                <img src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Iq8V0MifpP/q3ggnhck_expires_30_days.png" className="w-10 h-10 object-fill" />
              </button>
              <span className="text-[#040E1B] text-2xl w-[1025px]">
                {caseData?.title || 'Case Title Not Available'}
              </span>
            </div>

            {/* Case Info Cards */}
            <div className="flex items-center self-stretch bg-[#F4F6F9] py-4 px-8 rounded-lg">
              <div className="flex flex-col items-start w-[200px] p-2 mr-3.5 gap-2">
                <span className="text-[#868C98] text-xs">Role</span>
                <span className="text-[#022658] text-base">
                  {caseData?.role || (caseData?.protagonist && person?.full_name && caseData.protagonist.includes(person.full_name) ? 'Plaintiff' : 'N/A')}
                </span>
              </div>
              <div className="flex flex-col items-start w-[200px] py-2 pl-2 mr-[15px] gap-2">
                <span className="text-[#868C98] text-xs">Date Filed</span>
                <span className="text-[#022658] text-base">{formatDate(caseData?.date)}</span>
              </div>
              <div className="flex flex-col items-start w-[200px] py-2 pl-2 mr-3.5 gap-2">
                <span className="text-[#868C98] text-xs">Suit No.</span>
                <span className="text-[#022658] text-base">{caseData?.suit_reference_number || 'N/A'}</span>
              </div>
              <div className="flex flex-col items-start w-[200px] py-2 pl-2 mr-[15px] gap-2">
                <span className="text-[#868C98] text-xs">Court</span>
                <span className="text-[#022658] text-base">
                  {getCourtTypeName(caseData?.court_type)}{caseData?.court_division ? `, ${caseData.court_division}` : ''}
                </span>
              </div>
              <div className="flex flex-col items-start w-[200px] py-2 pl-2 gap-2">
                <span className="text-[#868C98] text-xs">Judge</span>
                <span className="text-[#022658] text-base">{caseData?.presiding_judge || caseData?.judgement_by || 'N/A'}</span>
              </div>
            </div>

            {/* Additional Info */}
            <div className="flex items-start self-stretch py-4 px-8 rounded-lg border border-solid border-[#F4F6F9]">
              <div className="flex flex-col items-start w-[200px] py-2 pl-2 mr-3.5 gap-2">
                <span className="text-[#868C98] text-xs">Town</span>
                <span className="text-[#040E1B] text-base">{caseData?.town || 'N/A'}</span>
              </div>
              <div className="flex flex-col items-start w-[200px] py-2 pl-2 mr-[15px] gap-2">
                <span className="text-[#868C98] text-xs">Region</span>
                <span className="text-[#040E1B] text-base">{getRegionName(caseData?.region)}</span>
              </div>
              <div className="flex flex-col items-start w-[200px] py-2 pl-2 mr-3.5 gap-2">
                <span className="text-[#868C98] text-xs">Court type</span>
                <span className="text-[#040E1B] text-base">{getCourtTypeName(caseData?.court_type)}</span>
              </div>
              <div className="flex flex-col items-start w-[200px] py-2 pl-2 mr-[15px] gap-2">
                <span className="text-[#868C98] text-xs">Court Division</span>
                <span className="text-[#040E1B] text-base">{caseData?.court_division || 'N/A'}</span>
              </div>
              <div className="flex flex-col items-start w-[200px] py-2 pl-2 gap-2">
                <span className="text-[#868C98] text-xs">Area of Law</span>
                <span className="text-[#040E1B] text-base">{caseData?.area_of_law || caseData?.metadata?.area_of_law || 'N/A'}</span>
              </div>
            </div>

            {/* Case Summary */}
            <div className="flex flex-col items-start self-stretch gap-2">
              <div className="flex items-center justify-between w-full">
                <span className="text-[#040E1B] text-base">Case Summary</span>
                {summaryLoading && (
                  <span className="text-[#868C98] text-xs">Generating AI summary...</span>
                )}
              </div>
              {summaryLoading ? (
                <div className="flex items-center gap-2 py-4">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#022658]"></div>
                  <span className="text-[#868C98] text-sm">AI is analyzing the case...</span>
                </div>
              ) : summaryError ? (
                <div className="text-[#F59E0B] text-sm py-2">{summaryError}</div>
              ) : (
                <div className="text-[#040E1B] text-base leading-relaxed" style={{ whiteSpace: 'pre-wrap', textAlign: 'justify', maxWidth: '100%' }}>
                  {aiSummary || caseData?.case_summary || caseData?.metadata?.case_summary || caseData?.detail_content || 'No case summary available.'}
                </div>
              )}
            </div>

            {/* Expected Outcome / Decision */}
            <div className="flex flex-col items-start self-stretch pr-[41px] gap-2">
              <span className="text-[#040E1B] text-base">Outcome / Decision</span>
              {summaryLoading ? (
                <span className="text-[#868C98] text-sm">Analyzing outcome...</span>
              ) : (
                <div className="text-[#040E1B] text-base leading-relaxed" style={{ textAlign: 'justify' }}>
                  {(() => {
                    const outcome = aiOutcome || caseData?.decision || caseData?.metadata?.outcome || caseData?.judgement || 'Outcome not available';
                    // Check if outcome follows FAVORABLE/NOT FAVORABLE/MIXED/OTHER format
                    const upperOutcome = outcome.toUpperCase();
                    if (upperOutcome.startsWith('FAVORABLE')) {
                      return (
                        <div>
                          <span className="inline-flex items-center px-3 py-1 rounded-lg bg-green-100 text-green-700 font-semibold text-sm mr-2">
                            FAVORABLE
                          </span>
                          <span>{outcome.replace(/^FAVORABLE\s*-\s*/i, '')}</span>
                        </div>
                      );
                    } else if (upperOutcome.startsWith('NOT FAVORABLE') || upperOutcome.startsWith('UNFAVORABLE')) {
                      return (
                        <div>
                          <span className="inline-flex items-center px-3 py-1 rounded-lg bg-red-100 text-red-700 font-semibold text-sm mr-2">
                            NOT FAVORABLE
                          </span>
                          <span>{outcome.replace(/^(NOT FAVORABLE|UNFAVORABLE)\s*-\s*/i, '')}</span>
                        </div>
                      );
                    } else if (upperOutcome.startsWith('MIXED')) {
                      return (
                        <div>
                          <span className="inline-flex items-center px-3 py-1 rounded-lg bg-yellow-100 text-yellow-700 font-semibold text-sm mr-2">
                            MIXED
                          </span>
                          <span>{outcome.replace(/^MIXED\s*-\s*/i, '')}</span>
                        </div>
                      );
                    } else if (upperOutcome.startsWith('OTHER')) {
                      return (
                        <div>
                          <span className="inline-flex items-center px-3 py-1 rounded-lg bg-gray-100 text-gray-700 font-semibold text-sm mr-2">
                            OTHER
                          </span>
                          <span>{outcome.replace(/^OTHER\s*-\s*/i, '')}</span>
                        </div>
                      );
                    }
                    return <span>{outcome}</span>;
                  })()}
                </div>
              )}
            </div>

            {/* Quick Documents */}
            {(caseData?.file_name || caseData?.file_url || caseData?.firebase_url) && (
              <div className="flex flex-col items-start self-stretch gap-2">
                <span className="text-[#040E1B] text-base">Case Documents</span>
                <div className="flex items-start gap-6">
                  {caseData?.file_name && (
                    <a 
                      href={caseData?.file_url || caseData?.firebase_url || '#'} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center bg-[#F7F8FA] text-left w-[179px] py-[15px] px-2 gap-1 rounded-lg border border-solid border-[#E4E7EB] hover:bg-gray-100 transition-colors" 
                      style={{boxShadow: '4px 4px 4px #0708101A'}}
                    >
                      <img src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Iq8V0MifpP/ajocwyie_expires_30_days.png" className="w-[25px] h-[30px] rounded-lg object-fill" />
                      <span className="text-[#040E1B] text-sm truncate">{caseData.file_name}</span>
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Parties Involved */}
            <div className="flex flex-col items-start self-stretch gap-2">
              <span className="text-[#040E1B] text-base">Parties involved</span>
              <div className="flex flex-col self-stretch w-full gap-1 rounded-[14px] border border-solid border-[#E5E8EC] overflow-x-auto">
                {/* Table Header */}
                <div className="flex items-center self-stretch bg-[#F4F6F9] py-4 min-w-full">
                  <div className="flex items-center flex-1 min-w-[150px] py-2 pl-4 pr-2">
                    <span className="text-[#070810] text-sm font-bold">Party name</span>
                  </div>
                  <div className="flex items-center flex-1 min-w-[120px] py-2 pl-2 pr-2">
                    <span className="text-[#070810] text-sm font-bold">Role</span>
                  </div>
                  <div className="flex items-center flex-1 min-w-[100px] py-2 pl-2 pr-2">
                    <span className="text-[#070810] text-sm font-bold">Type</span>
                  </div>
                  <div className="flex items-center flex-1 min-w-[150px] py-2 pl-2 pr-2">
                    <span className="text-[#070810] text-sm font-bold">Contact</span>
                  </div>
                  <div className="flex items-center flex-1 min-w-[100px] py-2 pl-2 pr-2">
                    <span className="text-[#070810] text-sm font-bold">Status</span>
                  </div>
                  <div className="w-10 h-[35px] flex-shrink-0"></div>
                </div>
                {/* Table Rows */}
                {parties.length > 0 ? (
                  parties.map((party, idx) => (
                    <div key={idx} className="flex items-center self-stretch py-3 min-w-full">
                      <div className="flex items-center flex-1 min-w-[150px] py-2 pl-4 pr-2">
                        <span className="text-[#070810] text-sm break-words">{party.name}</span>
                      </div>
                      <div className="flex items-center flex-1 min-w-[120px] py-2 pl-2 pr-2">
                        <span className="text-[#070810] text-sm break-words">{party.role}</span>
                      </div>
                      <div className="flex items-center flex-1 min-w-[100px] py-2 pl-2 pr-2">
                        <span className="text-[#070810] text-sm break-words">{party.type}</span>
                      </div>
                      <div className="flex items-center flex-1 min-w-[150px] py-2 pl-2 pr-2">
                        <span className="text-blue-500 text-sm break-words">{party.contact}</span>
                      </div>
                      <div className="flex items-center flex-1 min-w-[100px] py-2 pl-2 pr-2">
                        <span className="text-[#070810] text-sm break-words">{party.status}</span>
                      </div>
                      <img src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Iq8V0MifpP/di4dv3h7_expires_30_days.png" className="w-10 h-8 flex-shrink-0 object-fill" />
                    </div>
                  ))
                ) : (
                  <div className="flex items-center justify-center self-stretch py-8">
                    <span className="text-[#868C98] text-sm">No valid party names found in case data</span>
                  </div>
                )}
              </div>
            </div>

            {/* Case Documents */}
            <div className="flex flex-col items-start self-stretch gap-2">
              <span className="text-[#040E1B] text-base">Case Documents</span>
              <div className="flex flex-col items-center self-stretch gap-3">
                {/* Document Tabs */}
                <div className="flex items-center bg-white py-1 px-2 gap-[50px] rounded-lg border border-solid border-[#D4E1EA]">
                  <button
                    onClick={() => setActiveDocTab('parties')}
                    className={`flex items-center justify-center w-40 py-[7px] px-[11px] rounded whitespace-nowrap ${
                      activeDocTab === 'parties' ? 'bg-[#022658]' : 'bg-transparent'
                    }`}
                  >
                    <span className={`text-base font-bold ${activeDocTab === 'parties' ? 'text-white' : 'text-[#040E1B]'}`}>
                      Parties Documents
                    </span>
                  </button>
                  <button
                    onClick={() => setActiveDocTab('court')}
                    className={`flex items-center justify-center w-40 py-[9px] px-[17px] rounded whitespace-nowrap ${
                      activeDocTab === 'court' ? 'bg-[#022658]' : 'bg-transparent'
                    }`}
                  >
                    <span className={`text-base ${activeDocTab === 'court' ? 'text-white font-bold' : 'text-[#040E1B]'}`}>
                      Court Documents
                    </span>
                  </button>
                </div>

                {/* Documents Table */}
                {activeDocTab === 'parties' && (
                  <div className="flex flex-col items-start self-stretch gap-4">
                    <div className="flex flex-col self-stretch w-full gap-1 rounded-[14px] border border-solid border-[#E5E8EC] overflow-x-auto">
                      {/* Table Header */}
                      <div className="flex items-center self-stretch bg-[#F4F6F9] py-4 min-w-full">
                        <div className="flex items-center flex-1 min-w-[150px] py-2 pl-4 pr-2">
                          <span className="text-[#070810] text-sm font-bold">Date</span>
                        </div>
                        <div className="flex items-center flex-1 min-w-[200px] py-2 pl-2 pr-2">
                          <span className="text-[#070810] text-sm font-bold">File name</span>
                        </div>
                        <div className="flex items-center flex-1 min-w-[120px] py-2 pl-2 pr-2">
                          <span className="text-[#070810] text-sm font-bold">Type</span>
                        </div>
                        <div className="flex items-center flex-1 min-w-[150px] py-2 pl-2 pr-2">
                          <span className="text-[#070810] text-sm font-bold">Submitted by</span>
                        </div>
                        <div className="flex items-center justify-end flex-1 min-w-[100px] py-2 pr-4 pl-2">
                          <span className="text-[#070810] text-sm font-bold">Action</span>
                        </div>
                      </div>
                      {/* Table Rows */}
                      {partiesDocuments.length > 0 ? (
                        partiesDocuments.map((doc, idx) => (
                          <div key={idx} className="flex items-center self-stretch py-3 min-w-full">
                            <div className="flex items-center flex-1 min-w-[150px] py-2 pl-4 pr-2">
                              <span className="text-[#070810] text-sm break-words">{doc.date}</span>
                            </div>
                            <div className="flex items-center flex-1 min-w-[200px] py-2 pl-2 pr-2">
                              <span className="text-[#070810] text-sm break-words">{doc.fileName}</span>
                            </div>
                            <div className="flex items-center flex-1 min-w-[120px] py-2 pl-2 pr-2">
                              <span className="text-[#070810] text-sm break-words">{doc.type}</span>
                            </div>
                            <div className="flex items-center flex-1 min-w-[150px] py-2 pl-2 pr-2">
                              <span className="text-[#070810] text-sm break-words">{doc.submittedBy}</span>
                            </div>
                            <div className="flex items-center justify-end flex-1 min-w-[100px] py-2 pr-4 pl-2 gap-[1px]">
                              <span className="text-[#022658] text-sm font-bold cursor-pointer hover:underline">View</span>
                              <img src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Iq8V0MifpP/4rxlh6i4_expires_30_days.png" className="w-4 h-4 object-fill" />
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="flex items-center justify-center py-8">
                          <span className="text-[#868C98] text-sm">No documents available</span>
                        </div>
                      )}
                    </div>
                    <button className="flex flex-col items-start bg-transparent text-left py-2 px-4 rounded-lg border border-solid border-[#F59E0B] hover:bg-orange-50 transition-colors">
                      <span className="text-[#F59E0B] text-base">Upload New Document</span>
                    </button>
                  </div>
                )}

                {activeDocTab === 'court' && (
                  <div className="flex items-center justify-center py-12">
                    <span className="text-[#525866] text-base">Court documents coming soon...</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Case Diary Footer */}
          <div className="flex justify-between items-center pr-4 mb-[109px] rounded-lg border border-solid border-[#D4E1EA]">
            <input
              type="text"
              placeholder="5 more cases scheduled for this week"
              className="flex-1 text-[#040E1B] bg-transparent text-base py-4 pl-4 mr-1 border-0 outline-none"
            />
            <button 
              onClick={() => setShowCaseDiary(true)}
              className="flex items-center gap-[1px] cursor-pointer hover:underline whitespace-nowrap"
            >
              <span className="text-[#022658] text-base font-bold">View case diary</span>
              <img src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Iq8V0MifpP/6t5c6u68_expires_30_days.png" className="w-4 h-4 object-fill flex-shrink-0" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CaseDetails;

