import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Check, ChevronDown, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { apiDelete, apiGet, apiPost } from '../../utils/api';
import EntityRecordView from './EntityRecordView';

const PAGE_SIZE = 10;
const ENTITY_TYPES = [
  ['all', 'All'],
  ['company', 'Company / institution'],
  ['individual', 'Individual'],
];
const DATABASES = [
  ['all', 'All databases'],
  ['cases', 'Pending cases'],
  ['judgments', 'Judgments'],
  ['strike', 'Intended strike-off'],
  ['dissolved', 'Dissolved companies'],
  ['winding', 'Winding up'],
  ['liquidation', 'Liquidation'],
  ['incorporation', 'Incorporation'],
  ['name-change', 'Company name changes'],
  ['cessation', 'Cessation of business'],
];
const LIFECYCLE_DATABASE_TYPES = {
  strike: 'COMPANY_STRIKE_OFF_INTENTION',
  dissolved: 'COMPANY_DISSOLUTION',
  winding: 'COMPANY_WINDING_UP',
  liquidation: 'COMPANY_LIQUIDATION',
  incorporation: 'COMPANY_INCORPORATION',
  'name-change': 'COMPANY_CHANGE_OF_NAME',
  cessation: 'COMPANY_CESSATION_OF_BUSINESS',
};
const PURPOSES = [
  ['kyc', 'KYC / client onboarding'],
  ['credit', 'Credit / lending assessment'],
  ['mergers', 'Mergers & acquisitions'],
  ['litigation', 'Litigation support'],
  ['procurement', 'Procurement / vendor vetting'],
  ['employment', 'Employment screening'],
  ['other', 'Other legitimate purpose'],
];
const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const normalizeName = (value) => String(value || '').toUpperCase().replace(/[^A-Z0-9]+/g, ' ').trim();
const compactName = (value) => normalizeName(value).replaceAll(' ', '');
const nameMatchesQuery = (value, query) => {
  const candidate = normalizeName(value);
  const tokens = normalizeName(query).split(' ').filter(Boolean);
  return Boolean(candidate) && tokens.length > 0 && tokens.every((token) => candidate.includes(token));
};
const plausibleBankAliases = (canonicalName, values) => {
  const canonicalTokens = new Set(normalizeName(canonicalName).split(' ').filter(Boolean));
  const allowedTokens = new Set([...canonicalTokens, 'BANK', 'GH', 'GHA', 'GHANA', 'LTD', 'LIMITED', 'PLC']);
  return [...new Set(values || [])].filter((value) => {
    const tokens = normalizeName(value).split(' ').filter(Boolean);
    return tokens.length > 1 && tokens.length <= 7 && tokens.every((token) => allowedTokens.has(token));
  });
};
const ORGANISATION_NAME = /\b(bank|insurance|assurance|limited|ltd|plc|company|enterprise|university|school|hospital|mining|mines|micro\s*finance|broadcasting|construction|properties)\b/i;
const splitPendingPartyList = (caseTitle) => {
  if (/\b(?:V|VS|VRS|VERSUS)\.?\s+/i.test(caseTitle)) return [caseTitle];
  if (caseTitle.includes(',')) {
    const parts = caseTitle.split(',').map((name) => name.trim()).filter(Boolean);
    const isShortPartyList = parts.length <= 10
      && parts.every((name) => name.length <= 120)
      && !/\b(?:IN THE MATTER|SECTION|ACT\s+\d|ARBITRATION|PETITION)\b/i.test(caseTitle);
    if (isShortPartyList) return parts;
  }
  for (const separator of [/\s+&\s+/, /\s*;\s*/]) {
    const parts = caseTitle.split(separator).map((name) => name.trim()).filter(Boolean);
    if (parts.length > 1 && parts.every((name) => name.length <= 120 && ORGANISATION_NAME.test(name))) return parts;
  }
  return [caseTitle];
};
const loadReturnEntity = () => {
  try {
    const stored = JSON.parse(sessionStorage.getItem('juridence_return_entity') || 'null');
    return stored?.entity || stored;
  } catch { return null; }
};
const loadReturnTab = () => {
  try {
    const stored = JSON.parse(sessionStorage.getItem('juridence_return_entity') || 'null');
    return stored?.tab || (stored ? 'judgments' : 'summary');
  } catch { return 'summary'; }
};

const fetchAllPages = async (path, params, collectionKey, pageSize) => {
  const firstPage = await apiGet(path, { ...params, page: 1, limit: pageSize });
  const totalPages = Number(firstPage.total_pages || 1);
  if (totalPages <= 1) return firstPage;
  const remaining = await Promise.all(
    Array.from({ length: totalPages - 1 }, (_, index) => apiGet(path, { ...params, page: index + 2, limit: pageSize })),
  );
  return {
    ...firstPage,
    [collectionKey]: [firstPage, ...remaining].flatMap((pageData) => pageData[collectionKey] || []),
  };
};

const CompactSelect = ({ id, label, options, value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);
  const selectedLabel = options.find(([optionValue]) => optionValue === value)?.[1] || options[0]?.[1];

  useEffect(() => {
    const closeOnOutsideClick = (event) => {
      if (!containerRef.current?.contains(event.target)) setIsOpen(false);
    };
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('mousedown', closeOnOutsideClick);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('mousedown', closeOnOutsideClick);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, []);

  return (
    <div ref={containerRef} className={`dd-compact-select${isOpen ? ' is-open' : ''}`}>
      <button
        id={id}
        type="button"
        className="dd-select-trigger"
        aria-label={label}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((open) => !open)}
      >
        <span>{selectedLabel}</span>
        <ChevronDown size={14} aria-hidden="true" />
      </button>
      {isOpen && (
        <div className="dd-select-menu" role="listbox" aria-label={label}>
          {options.map(([optionValue, optionLabel]) => (
            <button
              type="button"
              role="option"
              aria-selected={optionValue === value}
              className={optionValue === value ? 'is-selected' : ''}
              key={optionValue}
              onClick={() => {
                onChange(optionValue);
                setIsOpen(false);
              }}
            >
              <span>{optionLabel}</span>
              {optionValue === value && <Check size={14} aria-hidden="true" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const HighlightedText = ({ text, query }) => {
  const value = String(text || '');
  const tokens = String(query || '').trim().split(/\s+/).filter(Boolean).map(escapeRegExp);
  if (!value || tokens.length === 0) return value;
  const pattern = new RegExp(`(${tokens.join('|')})`, 'gi');
  return value.split(pattern).map((part, index) => (
    tokens.some((token) => new RegExp(`^${token}$`, 'i').test(part))
      ? <mark key={`${part}-${index}`}>{part}</mark>
      : <React.Fragment key={`${part}-${index}`}>{part}</React.Fragment>
  ));
};

const ResultAliases = ({ aliases, query }) => {
  const visible = (aliases || []).slice(0, 5);
  if (!visible.length) return null;
  return (
    <small className="dd-result-aliases">
      <b>Also:</b>{' '}
      {visible.map((alias, index) => <React.Fragment key={alias}>{index > 0 && '; '}<HighlightedText text={alias} query={query} /></React.Fragment>)}
      {(aliases || []).length > visible.length && ' …'}
    </small>
  );
};

const entityLabel = (type) => {
  if (type === 'people') return 'Individual';
  if (type === 'insurance') return 'Insurance';
  return 'Company';
};

const riskLabel = (result, pendingCount) => {
  const supplied = result.additional_info?.risk_level;
  if (supplied) return supplied;
  return pendingCount > 0 ? 'Elevated' : 'Standard';
};

const DashboardSearchHome = ({ userInfo, onNavigate }) => {
  const [query, setQuery] = useState('');
  const [submittedQuery, setSubmittedQuery] = useState('');
  const [entityType, setEntityType] = useState('all');
  const [database, setDatabase] = useState('all');
  const [purpose, setPurpose] = useState('kyc');
  const [sourceStats, setSourceStats] = useState({ sources: [] });
  const [allResults, setAllResults] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [showPurposeHelp, setShowPurposeHelp] = useState(false);
  const [error, setError] = useState('');
  const [selectedEntity, setSelectedEntity] = useState(loadReturnEntity);
  const [activeEntityTab, setActiveEntityTab] = useState(loadReturnTab);
  const [entityData, setEntityData] = useState({ pendingCases: [], pendingTotal: 0, judgments: [], judgmentTotal: 0, registryNotices: [], registryTotal: 0, profile: null });
  const [entityLoading, setEntityLoading] = useState(false);
  const [entityError, setEntityError] = useState('');
  const [watchlist, setWatchlist] = useState({ isIn: false, id: null });
  const [watchlistBusy, setWatchlistBusy] = useState(false);
  const requestSequence = useRef(0);
  const searchTimer = useRef(null);
  const previousCriteria = useRef({ database: 'all', entityType: 'all' });

  useEffect(() => {
    apiGet('/dashboard-search/stats')
      .then(setSourceStats)
      .catch(() => setSourceStats({ sources: [] }));
    sessionStorage.removeItem('juridence_return_entity');
  }, []);

  const sourceCountFor = useCallback((name) => {
    const normalized = normalizeName(name);
    const source = (sourceStats.sources || []).find((item) => {
      const candidate = normalizeName(item.name);
      return candidate === normalized || candidate.includes(normalized) || normalized.includes(candidate);
    });
    return Number(source?.case_count || 0);
  }, [sourceStats.sources]);

  const normalizeUnifiedResults = useCallback((items) => {
    const deduplicated = new Map();
    items.forEach((item) => {
      const key = normalizeName(item.name);
      const pending = item.type === 'people'
        ? Number(item.additional_info?.unresolved_cases ?? item.additional_info?.case_count ?? 0)
        : sourceCountFor(item.name);
      const normalized = {
        id: `${String(item.type || 'entity').slice(0, 2).toUpperCase()}-${String(item.id).padStart(6, '0')}`,
        rawId: item.id,
        name: item.name,
        type: entityLabel(item.type),
        sourceType: item.type,
        watchlistType: item.type === 'people' ? 'person' : item.type === 'banks' ? 'bank' : item.type === 'insurance' ? 'insurance' : 'company',
        detail: item.description,
        aliases: item.additional_info?.aliases || [],
        pending,
        judgments: Number(item.additional_info?.resolved_cases || 0),
        registryNotice: item.additional_info?.registry_notice || null,
        risk: riskLabel(item, pending),
      };
      const existing = deduplicated.get(key);
      if (!existing || (existing.sourceType === 'companies' && item.type === 'banks')) deduplicated.set(key, normalized);
    });
    return [...deduplicated.values()];
  }, [sourceCountFor]);

  const normalizePendingResults = useCallback((items, searchQuery) => {
    const grouped = new Map();
    items.forEach((item) => {
      const sourceBankMatched = Boolean(item.matched_is_source_bank && item.source_bank_id);
      const caseTitle = item.case_title || '';
      const splitTitle = splitPendingPartyList(caseTitle);
      const isPartyList = splitTitle.length > 1;
      let candidateNames = sourceBankMatched
        ? [item.source_bank]
        : item.matched_party
          ? [item.matched_party]
          : isPartyList
            ? splitTitle
            : [caseTitle || 'Unnamed party'];
      const queryMatchesSuit = compactName(item.suit_number).includes(compactName(searchQuery));
      if (isPartyList && !queryMatchesSuit) {
        candidateNames = candidateNames.filter((name) => nameMatchesQuery(name, searchQuery));
      }

      candidateNames.forEach((candidateName) => {
        const candidateIsSourceBank = sourceBankMatched && compactName(candidateName) === compactName(item.source_bank);
        const name = candidateIsSourceBank ? item.source_bank : candidateName;
        const key = normalizeName(name);
        if (!key) return;
        const isOrganisation = ORGANISATION_NAME.test(name);
        const existing = grouped.get(key) || {
          id: candidateIsSourceBank ? `BA-${String(item.source_bank_id).padStart(6, '0')}` : `PC-${String(item.case_id).padStart(6, '0')}-${compactName(name).slice(0, 12)}`,
          rawId: candidateIsSourceBank ? item.source_bank_id : undefined,
          name,
          type: candidateIsSourceBank || isOrganisation ? 'Company' : 'Individual',
          sourceType: candidateIsSourceBank ? 'banks' : isOrganisation ? 'companies' : 'people',
          watchlistType: candidateIsSourceBank ? 'bank' : isOrganisation ? 'company' : 'person',
          detail: item.case_title,
          aliases: candidateIsSourceBank ? plausibleBankAliases(item.source_bank, item.matched_parties) : [],
          pending: 0,
          judgments: 0,
          registryNotice: null,
          risk: 'Elevated',
          isPendingParty: !candidateIsSourceBank,
          sourceBankId: candidateIsSourceBank ? item.source_bank_id : undefined,
          caseIds: new Set(),
        };
        existing.caseIds.add(item.case_id);
        existing.pending = existing.caseIds.size;
        if (candidateIsSourceBank) existing.aliases = [...new Set([...(existing.aliases || []), ...plausibleBankAliases(item.source_bank, item.matched_parties)])];
        grouped.set(key, existing);
      });
    });
    return [...grouped.values()].map(({ caseIds, ...result }) => result);
  }, []);

  const normalizeGazetteResults = useCallback((items, searchQuery) => items.filter((item) => [
    item.current_name,
    item.name_value,
    item.old_name,
    item.new_name,
    item.title,
  ].some((name) => nameMatchesQuery(name, searchQuery))).map((item) => {
    const noticeType = String(item.gazette_type || '');
    const isCompany = Boolean(item.company_id) || noticeType.startsWith('COMPANY_') || noticeType.startsWith('EXTERNAL_COMPANY_');
    return {
      id: `GN-${String(item.id).padStart(6, '0')}`,
      name: item.current_name || item.name_value || item.title,
      type: isCompany ? 'Company' : 'Individual',
      sourceType: isCompany ? 'companies' : 'people',
      detail: item.title,
      pending: 0,
      judgments: 0,
      registryNotice: noticeType.replaceAll('_', ' '),
      risk: 'Elevated',
    };
  }), []);

  const normalizeLifecycleResults = useCallback((items) => items.map((item) => ({
    id: `CL-${String(item.id).padStart(6, '0')}`,
    name: item.company_name,
    type: 'Company',
    sourceType: 'companies',
    detail: [item.notice_type?.replaceAll('_', ' '), item.registration_number].filter(Boolean).join(' · '),
    aliases: [item.old_company_name, item.new_company_name].filter((name) => name && normalizeName(name) !== normalizeName(item.company_name)),
    pending: 0,
    judgments: 0,
    registryNotice: String(item.notice_type || '').replaceAll('_', ' '),
    risk: item.notice_type === 'COMPANY_INCORPORATION' || item.notice_type === 'COMPANY_CHANGE_OF_NAME' ? 'Standard' : 'Elevated',
  })), []);

  const mergeResults = useCallback((groups) => {
    const merged = new Map();
    const items = groups.flat();
    const canonicalEntities = items.filter((item) => ['banks', 'insurance', 'companies'].includes(item.sourceType) && item.rawId);
    const bankById = new Map(
      canonicalEntities
        .filter((item) => item.sourceType === 'banks')
        .map((item) => [Number(item.rawId), item]),
    );
    const entityByAlias = new Map();
    canonicalEntities.forEach((entity) => [entity.name, ...(entity.aliases || [])]
      .forEach((name) => {
        entityByAlias.set(normalizeName(name), entity);
        entityByAlias.set(compactName(name), entity);
      }));

    items.forEach((item) => {
      const key = normalizeName(item.name);
      const canonicalEntity = (item.isPendingParty || !item.rawId)
        ? (entityByAlias.get(key) || entityByAlias.get(compactName(item.name)) || bankById.get(Number(item.sourceBankId)))
        : null;
      if (canonicalEntity) {
        const canonicalKey = normalizeName(canonicalEntity.name);
        const existingEntity = merged.get(canonicalKey) || { ...canonicalEntity };
        existingEntity.pending = Math.max(existingEntity.pending || 0, item.pending || 0);
        existingEntity.detail = existingEntity.detail || item.detail;
        merged.set(canonicalKey, existingEntity);
        return;
      }
      const existing = merged.get(key);
      if (!existing) {
        merged.set(key, { ...item });
        return;
      }
      existing.pending = Math.max(existing.pending || 0, item.pending || 0);
      existing.judgments = Math.max(existing.judgments || 0, item.judgments || 0);
      existing.registryNotice = existing.registryNotice || item.registryNotice;
      existing.detail = existing.detail || item.detail;
      existing.aliases = [...new Set([...(existing.aliases || []), ...(item.aliases || [])])];
      if (item.risk === 'Elevated') existing.risk = 'Elevated';
    });
    return [...merged.values()];
  }, []);

  const runSearch = useCallback(async (searchQuery, selectedDatabase, selectedEntityType) => {
    const cleaned = searchQuery.trim();
    if (normalizeName(cleaned).replaceAll(' ', '').length < 3) return;
    const requestId = ++requestSequence.current;
    setLoading(true);
    setError('');
    setPage(1);
    try {
      let normalized = [];
      if (selectedDatabase === 'cases') {
        const [data, unified] = await Promise.all([
          apiGet('/dashboard-search/pending-cases', { q: cleaned, page: 1, limit: 50 }),
          apiGet('/search/unified', { query: cleaned, search_type: 'all', identity_only: true, page: 1, limit: 50 }),
        ]);
        normalized = mergeResults([
          normalizeUnifiedResults(unified.results || []),
          normalizePendingResults(data.results || [], cleaned),
        ]).filter((item) => Number(item.pending || 0) > 0);
      } else if (LIFECYCLE_DATABASE_TYPES[selectedDatabase]) {
        const data = await apiGet('/company-lifecycle/notices', {
          q: cleaned,
          notice_type: LIFECYCLE_DATABASE_TYPES[selectedDatabase],
          page: 1,
          limit: 50,
        });
        normalized = normalizeLifecycleResults(data.notices || []);
      } else {
        const unifiedRequest = apiGet('/search/unified', { query: cleaned, search_type: 'all', identity_only: true, page: 1, limit: 50 });
        if (selectedDatabase === 'judgments') {
          const data = await unifiedRequest;
          normalized = normalizeUnifiedResults(data.results || []).filter((item) => item.judgments > 0);
        } else {
          const [unified, pending, gazette, lifecycle] = await Promise.all([
            unifiedRequest,
            apiGet('/dashboard-search/pending-cases', { q: cleaned, page: 1, limit: 50 }),
            apiGet('/gazette/', { search: cleaned, page: 1, limit: 50 }),
            apiGet('/company-lifecycle/notices', { q: cleaned, page: 1, limit: 100 }),
          ]);
          normalized = mergeResults([
            normalizeUnifiedResults(unified.results || []),
            normalizePendingResults(pending.results || [], cleaned),
            normalizeGazetteResults(gazette.gazettes || [], cleaned),
            normalizeLifecycleResults(lifecycle.notices || []),
          ]);
        }
      }

      const filtered = normalized.filter((item) => {
        if (selectedEntityType === 'all') return true;
        if (selectedEntityType === 'individual') return item.type === 'Individual';
        if (selectedEntityType === 'company') return item.type !== 'Individual';
        return true;
      });
      if (requestId === requestSequence.current) setAllResults(filtered);
    } catch (requestError) {
      if (requestId === requestSequence.current) {
        setAllResults([]);
        setError(requestError.message || 'The entity index could not be searched.');
      }
    } finally {
      if (requestId === requestSequence.current) setLoading(false);
    }
  }, [mergeResults, normalizeGazetteResults, normalizeLifecycleResults, normalizePendingResults, normalizeUnifiedResults]);

  useEffect(() => {
    const cleaned = query.trim();
    const isValid = normalizeName(cleaned).replaceAll(' ', '').length >= 3 && Boolean(purpose);
    const filtersChanged = previousCriteria.current.database !== database
      || previousCriteria.current.entityType !== entityType;
    previousCriteria.current = { database, entityType };
    window.clearTimeout(searchTimer.current);

    if (!isValid) {
      requestSequence.current += 1;
      setSubmittedQuery('');
      setAllResults([]);
      setPage(1);
      setHasSearched(false);
      setLoading(false);
      setError('');
      return undefined;
    }

    searchTimer.current = window.setTimeout(() => {
      setSubmittedQuery(cleaned);
      setHasSearched(true);
      runSearch(cleaned, database, entityType);
    }, filtersChanged ? 0 : 250);

    return () => window.clearTimeout(searchTimer.current);
  }, [database, entityType, purpose, query, runSearch]);

  useEffect(() => {
    const handleGlobalSearch = (event) => {
      const nextQuery = String(event.detail?.query || '').trim();
      if (nextQuery.length < 3) return;
      setQuery(nextQuery);
      setDatabase('all');
      setEntityType('all');
    };
    window.addEventListener('juridence:global-search', handleGlobalSearch);
    return () => window.removeEventListener('juridence:global-search', handleGlobalSearch);
  }, []);

  const totalPages = Math.ceil(allResults.length / PAGE_SIZE);
  const results = useMemo(() => allResults.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE), [allResults, page]);
  const firstRecord = allResults.length ? ((page - 1) * PAGE_SIZE) + 1 : 0;
  const lastRecord = Math.min(page * PAGE_SIZE, allResults.length);

  const submitSearch = (event) => {
    event.preventDefault();
    const cleaned = query.trim();
    if (normalizeName(cleaned).replaceAll(' ', '').length < 3 || !purpose) return;
    window.clearTimeout(searchTimer.current);
    setSubmittedQuery(cleaned);
    setHasSearched(true);
    runSearch(cleaned, database, entityType);
  };

  const clearSearch = () => {
    window.clearTimeout(searchTimer.current);
    requestSequence.current += 1;
    setQuery('');
    setSubmittedQuery('');
    setEntityType('all');
    setDatabase('all');
    setPurpose('kyc');
    setAllResults([]);
    setPage(1);
    setHasSearched(false);
    setError('');
  };

  const openEntity = (entity) => {
    setSelectedEntity(entity);
    setActiveEntityTab('summary');
  };

  useEffect(() => {
    if (!selectedEntity) return undefined;
    let current = true;
    setEntityLoading(true);
    setEntityError('');
    setEntityData({ pendingCases: [], pendingTotal: 0, judgments: [], judgmentTotal: 0, registryNotices: [], registryTotal: 0, profile: null });
    const pendingParams = selectedEntity.watchlistType === 'bank' && selectedEntity.rawId
      ? { q: '', bank_id: selectedEntity.rawId, page: 1, limit: 500 }
      : { q: selectedEntity.name, page: 1, limit: 500 };
    const profilePath = selectedEntity.rawId && {
      bank: `/banks/${selectedEntity.rawId}`,
      company: `/companies/${selectedEntity.rawId}`,
      insurance: `/insurance/${selectedEntity.rawId}`,
    }[selectedEntity.watchlistType];
    const registryPath = selectedEntity.rawId && {
      bank: `/gazette/bank/${selectedEntity.rawId}`,
      company: `/gazette/company/${selectedEntity.rawId}`,
      insurance: `/gazette/insurance/${selectedEntity.rawId}`,
    }[selectedEntity.watchlistType];
    const registryRequest = Promise.all([
      fetchAllPages('/gazette/', { search: selectedEntity.name }, 'gazettes', 100),
      fetchAllPages('/company-lifecycle/notices', { q: selectedEntity.name }, 'notices', 500),
      registryPath
        ? fetchAllPages(registryPath, {}, 'gazettes', 100).catch(() => ({ gazettes: [] }))
        : Promise.resolve({ gazettes: [] }),
    ]).then(([searchMatches, lifecycleMatches, linkedMatches]) => ({
      gazettes: [...new Map([
        ...(searchMatches.gazettes || []).map((notice) => ({ ...notice, source_kind: 'gazette' })),
        ...(linkedMatches.gazettes || []).map((notice) => ({ ...notice, source_kind: 'gazette' })),
        ...(lifecycleMatches.notices || []).map((notice) => ({
          ...notice,
          source_kind: 'company-bulletin',
          gazette_type: notice.notice_type,
          current_name: notice.company_name,
          old_name: notice.old_company_name,
          new_name: notice.new_company_name,
          gazette_number: notice.source?.volume_number ? `Companies Bulletin Vol. ${notice.source.volume_number}` : 'Companies Bulletin',
          gazette_date: notice.publication_date,
          title: notice.company_name,
        })),
      ].map((notice) => [`${notice.source_kind}-${notice.id}`, notice])).values()],
    }));
    Promise.all([
      fetchAllPages('/dashboard-search/pending-cases', pendingParams, 'results', 500),
      fetchAllPages('/dashboard-search/judgments', {
        names: JSON.stringify([selectedEntity.name, ...(selectedEntity.aliases || [])]),
      }, 'results', 100),
      registryRequest,
      selectedEntity.rawId
        ? apiGet(`/watchlist/check/${selectedEntity.watchlistType}/${selectedEntity.rawId}`)
        : Promise.resolve({ is_in_watchlist: false, watchlist_id: null }),
      profilePath ? apiGet(profilePath).catch(() => null) : Promise.resolve(null),
    ])
      .then(([pending, judgments, registry, watch, profile]) => {
        if (!current) return;
        const registryMatches = registry.gazettes || [];
        const registryNotices = selectedEntity.type === 'Individual'
          ? registryMatches
          : registryMatches.filter((notice) => {
            const noticeType = String(notice.gazette_type || '').toUpperCase();
            const linkedId = selectedEntity.watchlistType === 'bank'
              ? notice.bank_id
              : selectedEntity.watchlistType === 'insurance'
                ? notice.insurance_id
                : notice.company_id;
            return noticeType.startsWith('COMPANY_')
              || noticeType.startsWith('EXTERNAL_COMPANY_')
              || (linkedId && Number(linkedId) === Number(selectedEntity.rawId));
          });
        setEntityData({
          pendingCases: pending.results || [],
          pendingTotal: pending.total || 0,
          judgments: judgments.results || [],
          judgmentTotal: judgments.total || 0,
          registryNotices,
          registryTotal: registryNotices.length,
          profile,
        });
        setWatchlist({ isIn: Boolean(watch.is_in_watchlist), id: watch.watchlist_id || null });
      })
      .catch((requestError) => {
        if (current) setEntityError(requestError.message || 'The entity record could not be loaded.');
      })
      .finally(() => { if (current) setEntityLoading(false); });
    return () => { current = false; };
  }, [selectedEntity]);

  const toggleWatchlist = async () => {
    if (!selectedEntity?.rawId || watchlistBusy) return;
    setWatchlistBusy(true);
    setEntityError('');
    try {
      if (watchlist.isIn) {
        await apiDelete(`/watchlist/${watchlist.id}`);
        setWatchlist({ isIn: false, id: null });
      } else {
        const item = await apiPost('/watchlist/', {
          entity_type: selectedEntity.watchlistType,
          entity_id: selectedEntity.rawId,
          notify_on_new_cases: true,
          notify_on_risk_change: true,
          notify_on_regulatory_updates: false,
        });
        setWatchlist({ isIn: true, id: item.id });
      }
    } catch (requestError) {
      setEntityError(requestError.message || 'The watchlist could not be updated.');
    } finally {
      setWatchlistBusy(false);
    }
  };

  const openItemReport = (item, details, recordType = 'judgment') => {
    const now = new Date();
    const datePart = now.toISOString().slice(0, 10).replaceAll('-', '');
    const suffix = Math.random().toString(36).slice(2, 6).toUpperCase().padEnd(4, '0');
    const reference = `JUR-${datePart}-${suffix}`;
    const displayName = userInfo?.full_name || userInfo?.name || userInfo?.username || 'Workspace user';
    const organisation = userInfo?.organization_name || userInfo?.organisation || userInfo?.company || 'Juridence';
    const report = {
      kind: 'single-item', recordType, reference, createdAt: now.toISOString(), entity: selectedEntity,
      item, details, judgmentTotal: entityData.judgmentTotal || entityData.judgments.length,
      pendingTotal: entityData.pendingTotal || entityData.pendingCases.length,
      returnTab: recordType === 'pending' ? 'cases' : 'judgments',
      purpose, purposeLabel: PURPOSES.find(([value]) => value === purpose)?.[1],
      preparedFor: `${displayName} · ${organisation}`,
      watchlist,
    };
    sessionStorage.removeItem('juridence_full_entity_report');
    sessionStorage.setItem('juridence_single_item_report', JSON.stringify(report));
    onNavigate?.('due-diligence-reports');
  };

  const createFullEntityReport = (existingReference, existingCreatedAt) => {
    const now = new Date();
    const datePart = now.toISOString().slice(0, 10).replaceAll('-', '');
    const suffix = Math.random().toString(36).slice(2, 6).toUpperCase().padEnd(4, '0');
    const reference = existingReference || `JUR-${datePart}-${suffix}`;
    const displayName = userInfo?.full_name || userInfo?.name || userInfo?.username || 'Workspace user';
    const organisation = userInfo?.organization_name || userInfo?.organisation || userInfo?.company || 'Juridence';
    const report = {
      id: reference,
      kind: 'full-entity',
      reference,
      subject: selectedEntity.name,
      entity: selectedEntity,
      data: entityData,
      total: Number(entityData.pendingTotal || 0) + Number(entityData.judgmentTotal || 0) + Number(entityData.registryTotal || 0),
      scope: 'Full entity profile',
      risk: selectedEntity.risk || (Number(entityData.pendingTotal || 0) ? 'Elevated' : 'Standard'),
      createdAt: existingCreatedAt || now.toISOString(),
      purpose,
      purposeLabel: PURPOSES.find(([value]) => value === purpose)?.[1],
      preparedFor: `${displayName} · ${organisation}`,
      watchlist,
      returnTab: 'summary',
    };
    try {
      const history = JSON.parse(localStorage.getItem('juridence_due_diligence_reports') || '[]');
      const historyEntry = { ...report };
      delete historyEntry.data;
      const withoutCurrent = history.filter((item) => item.reference !== reference);
      localStorage.setItem('juridence_due_diligence_reports', JSON.stringify([historyEntry, ...withoutCurrent].slice(0, 30)));
    } catch { /* The report remains available when browser storage is unavailable. */ }
    sessionStorage.removeItem('juridence_single_item_report');
    sessionStorage.setItem('juridence_full_entity_report', JSON.stringify(report));
    onNavigate?.('due-diligence-reports');
  };

  const openSavedReport = (savedReport) => {
    const payload = savedReport.payload || (savedReport.entity && savedReport.item ? savedReport : null);
    if (savedReport.kind === 'full-entity') {
      createFullEntityReport(savedReport.reference, savedReport.createdAt);
    } else if (payload) {
      sessionStorage.setItem('juridence_single_item_report', JSON.stringify(payload));
    }
    onNavigate?.('due-diligence-reports');
  };

  if (selectedEntity) {
    return (
      <EntityRecordView
        entity={selectedEntity}
        data={entityData}
        loading={entityLoading}
        error={entityError}
        activeTab={activeEntityTab}
        setActiveTab={setActiveEntityTab}
        onBack={() => setSelectedEntity(null)}
        onCreateFullReport={createFullEntityReport}
        onOpenReport={openItemReport}
        onOpenSavedReport={openSavedReport}
        onToggleWatchlist={toggleWatchlist}
        watchlist={watchlist}
        watchlistBusy={watchlistBusy}
      />
    );
  }

  return (
    <main className="dd-entity-enquiry">
      <section className="dd-enquiry-intro">
        <h1>Entity enquiry <span>JUR.ENQ.001</span></h1>
        <p>Step 1 of 2 · Enter search criteria and select the entity record.</p>
      </section>

      <section className="dd-enquiry-panel">
        <header>Search criteria</header>
        <form onSubmit={submitSearch} autoComplete="off">
          <div className="dd-enquiry-grid">
            <label><span>Name <b>*</b></span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Company or individual name" required /></label>
            <div className="dd-enquiry-field"><span>Entity type</span><CompactSelect id="entity-type" label="Entity type" options={ENTITY_TYPES} value={entityType} onChange={setEntityType} /></div>
            <div className="dd-enquiry-field"><span>Database</span><CompactSelect id="database" label="Database" options={DATABASES} value={database} onChange={setDatabase} /></div>
            <div className="dd-enquiry-field"><span>Purpose <b>*</b></span><CompactSelect id="purpose" label="Purpose" options={PURPOSES} value={purpose} onChange={setPurpose} /></div>
          </div>
          <div className="dd-enquiry-actions">
            <button type="submit" className="is-primary" disabled={loading || query.trim().length < 3}>{loading ? <Loader2 size={15} className="dd-spin" /> : null} Search</button>
            <button type="button" onClick={clearSearch}>Clear</button>
            <p>Minimum 3 characters. Matching ignores case and punctuation. <button type="button" className="dd-purpose-link" aria-expanded={showPurposeHelp} onClick={() => setShowPurposeHelp((visible) => !visible)}>Permissible purposes</button></p>
          </div>
          {showPurposeHelp && <div className="dd-purpose-help">Use Juridence only for authorised KYC, credit, legal, employment-screening or ongoing-monitoring work. Select the purpose that matches the enquiry before searching.</div>}
        </form>
      </section>

      {hasSearched && <section className="dd-enquiry-results" aria-live="polite">
        <header>
          <h2>Results <span>{allResults.length}</span></h2>
          <div><span>Records {firstRecord}–{lastRecord} of {allResults.length}</span><button type="button" disabled={page <= 1 || loading} onClick={() => setPage((value) => value - 1)}><ChevronLeft size={14} /> Prev</button><button type="button" disabled={page >= totalPages || loading} onClick={() => setPage((value) => value + 1)}>Next <ChevronRight size={14} /></button></div>
        </header>
        {error && <div className="dd-inline-alert is-error">{error}</div>}
        {loading ? <div className="dd-loading-state"><Loader2 size={22} className="dd-spin" /> Searching entity records</div> : results.length === 0 ? <div className="dd-empty-state"><strong>No matching entity</strong><p>Check the spelling, select another database, or try a shorter name.</p></div> : <div className="dd-table-wrap"><table className="dd-entity-table"><thead><tr><th>Entity ID</th><th>Name</th><th>Type</th><th>Pending</th><th>Judgments</th><th>Registry notice</th><th>Risk</th><th aria-label="Action" /></tr></thead><tbody>{results.map((result) => <tr key={result.id} className="dd-clickable-row" tabIndex="0" onClick={() => openEntity(result)} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); openEntity(result); } }}><td><code>{result.id}</code></td><td><strong><HighlightedText text={result.name} query={submittedQuery} /></strong><ResultAliases aliases={result.aliases} query={submittedQuery} />{!result.aliases?.length && result.detail && <small>{result.detail}</small>}</td><td>{result.type}</td><td className="dd-number">{result.pending || '—'}</td><td className="dd-number">{result.judgments || '—'}</td><td>{result.registryNotice ? <span className="dd-registry-badge">{result.registryNotice}</span> : '—'}</td><td><span className={`dd-risk-badge is-${String(result.risk).toLowerCase()}`}>{result.risk}</span></td><td><button type="button" className="dd-open-entity" onClick={(event) => { event.stopPropagation(); openEntity(result); }}>Open</button></td></tr>)}</tbody></table></div>}
      </section>}
    </main>
  );
};

export default DashboardSearchHome;
