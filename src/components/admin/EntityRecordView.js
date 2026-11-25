import React, { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { apiGet } from '../../utils/api';

const DASH = '—';
const EMPTY_VALUE = '-';
const JUDGMENTS_PAGE_SIZE = 25;
const PENDING_PAGE_SIZE = 25;
const normalized = (value) => String(value || '').toUpperCase().replace(/[^A-Z0-9]+/g, ' ').trim();
const titleSides = (title) => String(title || '').split(/\s+(?:V(?:S|RS)?\.?|VERSUS)\s+/i).map((side) => side.trim()).filter(Boolean);

const courtName = (value) => ({
  SC: 'Supreme Court',
  CA: 'Court of Appeal',
  HC: 'High Court',
  DC: 'District Court',
  CC: 'Circuit Court',
}[String(value || '').toUpperCase()] || value || DASH);

const matchesRecordedName = (value, names) => {
  const candidate = normalized(value);
  return candidate && names.some((name) => name === candidate || name.includes(candidate) || candidate.includes(name));
};

const readableText = (value) => {
  if (!value) return EMPTY_VALUE;
  const text = String(value);
  if (!text.includes('<') || typeof DOMParser === 'undefined') return text;
  return new DOMParser().parseFromString(text, 'text/html').body.textContent?.trim() || EMPTY_VALUE;
};

const compactText = (value, maxCharacters = 520) => {
  const text = readableText(value).replace(/\s+/g, ' ').trim();
  if (!text || text === EMPTY_VALUE) return EMPTY_VALUE;
  const sentences = text.match(/[^.!?]+(?:[.!?]+|$)/g) || [text];
  let compact = sentences.slice(0, 2).join(' ').trim();
  if (compact.length <= maxCharacters) return compact;
  compact = compact.slice(0, maxCharacters + 1);
  const lastSpace = compact.lastIndexOf(' ');
  return `${compact.slice(0, lastSpace > 0 ? lastSpace : maxCharacters).trim()}…`;
};

const formatDate = (value) => {
  if (!value) return DASH;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return DASH;
  return new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).format(date);
};
const formatDateTime = (value) => {
  if (!value) return DASH;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return DASH;
  return new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(date);
};

const EmptyTab = ({ title, children }) => <div className="dd-empty-state"><strong>{title}</strong><p>{children}</p></div>;

const noticeText = (notice) => [
  notice.gazette_type,
  notice.title,
  notice.description,
  notice.summary,
  notice.content,
].filter(Boolean).join(' ').toUpperCase();

const noticeDate = (notice) => notice?.effective_date || notice?.publication_date || notice?.gazette_date || notice?.created_at;
const loadReportHistory = () => {
  try { return JSON.parse(localStorage.getItem('juridence_due_diligence_reports') || '[]'); } catch { return []; }
};

const EntityRecordView = ({ entity, data, loading, error, activeTab, setActiveTab, onBack, onCreateFullReport, onOpenReport, onOpenSavedReport, onToggleWatchlist, watchlist, watchlistBusy }) => {
  const [judgmentFilter, setJudgmentFilter] = useState('');
  const [judgmentPage, setJudgmentPage] = useState(1);
  const [expandedJudgmentId, setExpandedJudgmentId] = useState(null);
  const [judgmentDetails, setJudgmentDetails] = useState({});
  const [judgmentDetailLoading, setJudgmentDetailLoading] = useState(null);
  const [judgmentDetailError, setJudgmentDetailError] = useState('');
  const [judgmentReportLoading, setJudgmentReportLoading] = useState(null);
  const [pendingFilter, setPendingFilter] = useState('');
  const [pendingPage, setPendingPage] = useState(1);
  const [expandedPendingId, setExpandedPendingId] = useState(null);
  const [pendingDetails, setPendingDetails] = useState({});
  const [pendingDetailLoading, setPendingDetailLoading] = useState(null);
  const [pendingDetailError, setPendingDetailError] = useState('');
  const [pendingReportLoading, setPendingReportLoading] = useState(null);
  const [reportHistory, setReportHistory] = useState(loadReportHistory);
  const pendingCases = useMemo(() => data.pendingCases || [], [data.pendingCases]);
  const judgments = useMemo(() => data.judgments || [], [data.judgments]);
  const registryNotices = useMemo(() => data.registryNotices || [], [data.registryNotices]);
  const pendingCount = Number(data.pendingTotal ?? entity.pending ?? pendingCases.length);
  const judgmentCount = Number(data.judgmentTotal ?? judgments.length);
  const registryCount = Number(data.registryTotal ?? registryNotices.length);
  const totalRecords = pendingCount + judgmentCount + registryCount;
  const entityKey = normalized(entity.name);
  const entityNames = useMemo(() => [...new Set([entity.name, ...(entity.aliases || [])].map(normalized).filter(Boolean))], [entity.aliases, entity.name]);
  const entityReports = useMemo(() => reportHistory.filter((report) => {
    const subject = normalized(report.subject || report.entity?.name || report.payload?.entity?.name);
    return subject && entityNames.some((name) => name === subject || name.includes(subject) || subject.includes(name));
  }), [entityNames, reportHistory]);

  useEffect(() => {
    if (activeTab === 'reports') setReportHistory(loadReportHistory());
  }, [activeTab, entity.id]);

  useEffect(() => {
    setJudgmentFilter('');
    setJudgmentPage(1);
    setExpandedJudgmentId(null);
    setJudgmentDetails({});
    setJudgmentDetailError('');
    setPendingFilter('');
    setPendingPage(1);
    setExpandedPendingId(null);
    setPendingDetails({});
    setPendingDetailError('');
  }, [entity.id]);

  const pendingRecords = useMemo(() => pendingCases.map((item) => {
    const sides = titleSides(item.case_title);
    let position = 'Named party';
    if (matchesRecordedName(sides[0], entityNames)) position = 'Initiating';
    else if (matchesRecordedName(sides[1], entityNames)) position = 'Responding';
    const createdDate = item.created_on ? new Date(item.created_on) : null;
    return {
      ...item,
      position,
      courtLabel: courtName(item.court_type),
      year: createdDate && !Number.isNaN(createdDate.getTime()) ? createdDate.getFullYear() : EMPTY_VALUE,
    };
  }), [entityNames, pendingCases]);

  const filteredPending = useMemo(() => {
    const filter = normalized(pendingFilter);
    if (!filter) return pendingRecords;
    return pendingRecords.filter((item) => normalized([
      item.case_title,
      item.suit_number,
      item.courtLabel,
      item.location,
      item.position,
      item.status,
      item.source_bank,
    ].filter(Boolean).join(' ')).includes(filter));
  }, [pendingFilter, pendingRecords]);

  const pendingPages = Math.max(1, Math.ceil(filteredPending.length / PENDING_PAGE_SIZE));
  const pagedPending = filteredPending.slice((pendingPage - 1) * PENDING_PAGE_SIZE, pendingPage * PENDING_PAGE_SIZE);
  const firstPending = filteredPending.length ? ((pendingPage - 1) * PENDING_PAGE_SIZE) + 1 : 0;
  const lastPending = Math.min(pendingPage * PENDING_PAGE_SIZE, filteredPending.length);

  const loadPendingDetails = async (item) => {
    const details = pendingDetails[item.case_id] || await apiGet(`/cases/${item.case_id}`);
    setPendingDetails((current) => ({ ...current, [item.case_id]: details }));
    return details;
  };

  const openPendingReport = async (item) => {
    setPendingReportLoading(item.case_id);
    setPendingDetailError('');
    try {
      const details = await loadPendingDetails(item);
      onOpenReport(item, details, 'pending');
    } catch (requestError) {
      setPendingDetailError(requestError.message || 'The item report could not be prepared.');
    } finally {
      setPendingReportLoading(null);
    }
  };

  const togglePendingDetails = async (item) => {
    if (expandedPendingId === item.case_id) {
      setExpandedPendingId(null);
      return;
    }
    setExpandedPendingId(item.case_id);
    setPendingDetailError('');
    if (pendingDetails[item.case_id]) return;
    setPendingDetailLoading(item.case_id);
    try {
      await loadPendingDetails(item);
    } catch (requestError) {
      setPendingDetailError(requestError.message || 'The pending-case details could not be loaded.');
    } finally {
      setPendingDetailLoading(null);
    }
  };

  const renderPendingDetails = (item) => {
    const details = pendingDetails[item.case_id];
    if (pendingDetailLoading === item.case_id) return <div className="dd-judgment-detail-loading"><Loader2 size={18} className="dd-spin" /> Loading pending-case details</div>;
    if (!details) return <div className="dd-inline-alert is-error">{pendingDetailError || 'No additional pending-case detail is available.'}</div>;
    const sides = titleSides(details.title || item.case_title);
    const otherParties = sides.filter((side) => !matchesRecordedName(side, entityNames));
    const caseSummary = compactText(details.case_summary || details.headnotes || details.commentary || details.detail_content);

    return <article className="dd-judgment-detail">
      <h4>{details.title || item.case_title || 'Untitled case'}</h4>
      <dl className="dd-judgment-facts">
        <div><dt>Suit no.</dt><dd><code>{details.suit_reference_number || item.suit_number || EMPTY_VALUE}</code></dd></div>
        <div><dt>Status</dt><dd>{details.case_progress || details.status || item.status || 'Pending'}</dd></div>
        <div><dt>Court</dt><dd>{courtName(details.court_type || item.court_type)}</dd></div>
        <div><dt>Position</dt><dd>{item.position}</dd></div>
        <div><dt>Year</dt><dd>{details.year || item.year || EMPTY_VALUE}</dd></div>
        <div><dt>Location</dt><dd>{[details.town || item.location, details.region].filter(Boolean).join(', ') || EMPTY_VALUE}</dd></div>
      </dl>
      <section><h5>Summary of case</h5><p>{caseSummary}</p></section>
      <section><h5>Current case information</h5><p>{compactText(details.case_progress || details.status || item.status || EMPTY_VALUE)}</p></section>
      <div className="dd-other-parties"><span>Other parties:</span>{otherParties.length ? otherParties.map((party) => <strong key={party}>{party}</strong>) : EMPTY_VALUE}</div>
      <details className="dd-judgment-source"><summary>Source & dates</summary><dl>
        <div><dt>Source bank</dt><dd>{item.source_bank || EMPTY_VALUE}</dd></div>
        <div><dt>Record date</dt><dd>{formatDate(details.date || item.created_on)}</dd></div>
        <div><dt>Record source</dt><dd>{details.file_name || details.file_url || details.firebase_url || EMPTY_VALUE}</dd></div>
        <div><dt>Record updated</dt><dd>{formatDate(details.updated_at)}</dd></div>
      </dl></details>
    </article>;
  };

  const judgmentRecords = useMemo(() => judgments.map((item) => {
    const sides = titleSides(item.title);
    let role = DASH;
    if (matchesRecordedName(sides[0], entityNames)) role = 'Plaintiff / Appellant';
    else if (matchesRecordedName(sides[1], entityNames)) role = 'Defendant / Respondent';
    return {
      ...item,
      role,
      citationLabel: item.citation || item.suit_reference_number || DASH,
      courtLabel: courtName(item.court_type),
    };
  }), [entityNames, judgments]);

  const filteredJudgments = useMemo(() => {
    const filter = normalized(judgmentFilter);
    if (!filter) return judgmentRecords;
    return judgmentRecords.filter((item) => normalized([
      item.title,
      item.citationLabel,
      item.courtLabel,
      item.court_division,
      item.role,
      item.area_of_law,
    ].filter(Boolean).join(' ')).includes(filter));
  }, [judgmentFilter, judgmentRecords]);

  const judgmentPages = Math.max(1, Math.ceil(filteredJudgments.length / JUDGMENTS_PAGE_SIZE));
  const pagedJudgments = filteredJudgments.slice((judgmentPage - 1) * JUDGMENTS_PAGE_SIZE, judgmentPage * JUDGMENTS_PAGE_SIZE);
  const firstJudgment = filteredJudgments.length ? ((judgmentPage - 1) * JUDGMENTS_PAGE_SIZE) + 1 : 0;
  const lastJudgment = Math.min(judgmentPage * JUDGMENTS_PAGE_SIZE, filteredJudgments.length);

  const openJudgmentReport = async (item) => {
    setJudgmentReportLoading(item.id);
    setJudgmentDetailError('');
    try {
      const details = judgmentDetails[item.id] || await apiGet(`/cases/${item.id}`);
      setJudgmentDetails((current) => ({ ...current, [item.id]: details }));
      onOpenReport(item, details, 'judgment');
    } catch (requestError) {
      setJudgmentDetailError(requestError.message || 'The item report could not be prepared.');
    } finally {
      setJudgmentReportLoading(null);
    }
  };

  const toggleJudgmentDetails = async (item) => {
    if (expandedJudgmentId === item.id) {
      setExpandedJudgmentId(null);
      return;
    }

    setExpandedJudgmentId(item.id);
    setJudgmentDetailError('');
    if (judgmentDetails[item.id]) return;

    setJudgmentDetailLoading(item.id);
    try {
      const details = await apiGet(`/cases/${item.id}`);
      setJudgmentDetails((current) => ({ ...current, [item.id]: details }));
    } catch (requestError) {
      setJudgmentDetailError(requestError.message || 'The judgment details could not be loaded.');
    } finally {
      setJudgmentDetailLoading(null);
    }
  };

  const renderJudgmentDetails = (item) => {
    const details = judgmentDetails[item.id];
    if (judgmentDetailLoading === item.id) return <div className="dd-judgment-detail-loading"><Loader2 size={18} className="dd-spin" /> Loading judgment details</div>;
    if (!details) return <div className="dd-inline-alert is-error">{judgmentDetailError || 'No additional judgment detail is available.'}</div>;

    const sides = titleSides(details.title || item.title);
    const entityIsFirst = matchesRecordedName(sides[0], entityNames);
    const otherParties = sides.filter((side) => !matchesRecordedName(side, entityNames));
    const otherRole = entityIsFirst ? 'Defendant / Respondent' : 'Plaintiff / Appellant';
    const summaryText = compactText(details.case_summary || details.headnotes || details.commentary || details.detail_content);
    const rulingText = compactText(details.ai_case_outcome || details.ai_court_orders || details.conclusion || details.judgement || details.decision);
    const riskText = compactText(details.ai_detailed_outcome || details.ai_financial_impact);
    const judgmentStatus = details.judgement || details.decision || details.conclusion ? 'Judgment delivered' : (details.case_progress || details.status || 'Judgment');

    return <article className="dd-judgment-detail">
      <h4>{details.title || item.title || 'Untitled case'}</h4>
      <dl className="dd-judgment-facts">
        <div><dt>Suit no. / citation</dt><dd><code>{details.citation || details.dl_citation_no || details.suit_reference_number || item.citationLabel}</code></dd></div>
        <div><dt>Status</dt><dd className="is-positive">{judgmentStatus}</dd></div>
        <div><dt>Court</dt><dd>{courtName(details.court_type || item.court_type)}</dd></div>
        <div><dt>Role of this party</dt><dd>{item.role}</dd></div>
        <div><dt>Judge(s)</dt><dd>{details.presiding_judge || details.judgement_by || EMPTY_VALUE}</dd></div>
        <div><dt>Location</dt><dd>{[details.town, details.region].filter(Boolean).join(', ') || EMPTY_VALUE}</dd></div>
      </dl>
      <section><h5>Summary of case</h5><p>{summaryText}</p></section>
      <section><h5>Ruling, financial award & costs</h5><p>{rulingText}</p></section>
      <section><h5>Risk & financial analysis</h5><p>{riskText}</p></section>
      <div className="dd-other-parties"><span>Other parties:</span>{otherParties.length ? otherParties.map((party) => <strong key={party}>{party} · {otherRole}</strong>) : EMPTY_VALUE}</div>
      <details className="dd-judgment-source"><summary>Source & dates</summary><dl>
        <div><dt>Decision date</dt><dd>{formatDate(details.date)}</dd></div>
        <div><dt>Year</dt><dd>{details.year || EMPTY_VALUE}</dd></div>
        <div><dt>Record source</dt><dd>{details.dl_type || details.file_name || details.file_url || details.firebase_url || EMPTY_VALUE}</dd></div>
        <div><dt>Record updated</dt><dd>{formatDate(details.updated_at)}</dd></div>
      </dl></details>
    </article>;
  };

  const lifecycle = useMemo(() => {
    const noticesFor = (matcher) => registryNotices.filter((notice) => matcher(noticeText(notice)));
    const incorporationNotices = noticesFor((text) => text.includes('COMPANY_INCORPORATION') || text.includes('INCORPORATION OF A COMPANY'));
    const changeNotices = registryNotices.filter((notice) => {
      const text = noticeText(notice);
      const isEntityLinked = Boolean(notice.company_id || notice.bank_id || notice.insurance_id);
      return text.includes('CHANGE OF COMPANY NAME') || (isEntityLinked && text.includes('CHANGE_OF_NAME'));
    });
    const strikeOffNotices = noticesFor((text) => text.includes('STRIKE_OFF') || text.includes('STRIKE OFF'));
    const windingUpNotices = noticesFor((text) => text.includes('WINDING_UP') || text.includes('WINDING UP'));
    const dissolutionNotices = noticesFor((text) => text.includes('DISSOLUTION') || text.includes('DISSOLVED'));
    const liquidationNotices = noticesFor((text) => text.includes('LIQUIDAT'));
    const cessationNotices = noticesFor((text) => text.includes('EXTERNAL_COMPANY_CESSATION') || text.includes('CESSATION OF BUSINESS'));
    const profileNames = [data.profile?.former_name, ...(Array.isArray(data.profile?.previous_names) ? data.profile.previous_names : [])]
      .filter(Boolean);
    const changedNames = [...new Set([
      ...profileNames,
      ...changeNotices.flatMap((notice) => [notice.old_name, notice.new_name]).filter(Boolean),
    ])].filter((name) => normalized(name) !== entityKey);
    const valueFor = (notices) => notices.length
      ? `${formatDate(noticeDate(notices[0]))}${notices.length > 1 ? ` (${notices.length} notices)` : ''}`
      : EMPTY_VALUE;

    return {
      incorporation: data.profile?.date_of_incorporation ? formatDate(data.profile.date_of_incorporation) : valueFor(incorporationNotices),
      nameChange: changedNames.length ? changedNames.join('; ') : valueFor(changeNotices),
      strikeOff: valueFor(strikeOffNotices),
      windingUp: valueFor(windingUpNotices),
      dissolution: valueFor(dissolutionNotices),
      liquidation: valueFor(liquidationNotices),
      cessation: valueFor(cessationNotices),
      counts: {
        incorporation: incorporationNotices.length,
        nameChange: changeNotices.length,
        strikeOff: strikeOffNotices.length,
        windingUp: windingUpNotices.length,
        dissolution: dissolutionNotices.length,
        liquidation: liquidationNotices.length,
        cessation: cessationNotices.length,
      },
      dates: {
        incorporation: data.profile?.date_of_incorporation || noticeDate(incorporationNotices[0]),
        nameChange: noticeDate(changeNotices[0]),
        strikeOff: noticeDate(strikeOffNotices[0]),
        windingUp: noticeDate(windingUpNotices[0]),
        dissolution: noticeDate(dissolutionNotices[0]),
        liquidation: noticeDate(liquidationNotices[0]),
        cessation: noticeDate(cessationNotices[0]),
      },
    };
  }, [data.profile, entityKey, registryNotices]);

  const proceedings = useMemo(() => pendingCases.reduce((counts, item) => {
    const sides = titleSides(item.case_title);
    if (sides.length < 2) return counts;
    if (normalized(sides[0]).includes(entityKey) || entityKey.includes(normalized(sides[0]))) counts.initiating += 1;
    else if (normalized(sides[1]).includes(entityKey) || entityKey.includes(normalized(sides[1]))) counts.responding += 1;
    else counts.other += 1;
    return counts;
  }, { initiating: 0, responding: 0, other: 0 }), [entityKey, pendingCases]);

  const counterparties = useMemo(() => {
    const counts = new Map();
    pendingCases.forEach((item) => titleSides(item.case_title).forEach((party) => {
      const partyKey = normalized(party);
      if (!partyKey || partyKey.includes(entityKey) || entityKey.includes(partyKey)) return;
      counts.set(party, (counts.get(party) || 0) + 1);
    }));
    return [...counts.entries()].sort((left, right) => right[1] - left[1]).slice(0, 5);
  }, [entityKey, pendingCases]);

  const registryStatus = registryNotices.some((item) => String(item.gazette_type || '').includes('DISSOLUTION'))
    ? 'Dissolved'
    : registryNotices.some((item) => String(item.gazette_type || '').includes('STRIKE_OFF'))
      ? 'Strike-off pending'
      : entity.registryNotice || (entity.type === 'Individual' ? 'Not applicable' : 'No Registrar notice');
  const risk = entity.risk || (pendingCount ? 'Elevated' : 'Standard');
  const riskBasis = pendingCount
    ? `Party to ${pendingCount.toLocaleString()} pending case${pendingCount === 1 ? '' : 's'}. The volume of unresolved claims warrants detailed review before commitment.`
    : registryCount
      ? `Named in ${registryCount.toLocaleString()} Registrar notice${registryCount === 1 ? '' : 's'}. Review the published notices before commitment.`
      : 'No elevated indicators were found in the currently indexed records.';
  const tabs = [['summary', 'Summary', null], ['cases', 'Pending cases', pendingCount], ['judgments', 'Judgments', judgmentCount], ['registry', 'Registry notices', registryCount], ['reports', 'Reports', entityReports.length]];

  const summary = (
    <div className="dd-record-summary-grid">
      <section>
        <h3>Records by database</h3>
        <table className="dd-record-table"><thead><tr><th>Database</th><th className="dd-number">Records</th><th>Key date</th><th /></tr></thead><tbody>
          <tr><td>Pending cases</td><td className="dd-number">{pendingCount}</td><td>{DASH}</td><td>{pendingCount > 0 && <button type="button" onClick={() => setActiveTab('cases')}>View</button>}</td></tr>
          <tr><td>Judgments</td><td className="dd-number">{judgmentCount}</td><td>{formatDate(judgments[0]?.date)}</td><td>{judgmentCount > 0 && <button type="button" onClick={() => setActiveTab('judgments')}>View</button>}</td></tr>
          <tr><td>Incorporation</td><td className="dd-number">{lifecycle.counts.incorporation}</td><td>{formatDate(lifecycle.dates.incorporation)}</td><td>{lifecycle.counts.incorporation > 0 && <button type="button" onClick={() => setActiveTab('registry')}>View</button>}</td></tr>
          <tr><td>Change of company name</td><td className="dd-number">{lifecycle.counts.nameChange}</td><td>{formatDate(lifecycle.dates.nameChange)}</td><td>{lifecycle.counts.nameChange > 0 && <button type="button" onClick={() => setActiveTab('registry')}>View</button>}</td></tr>
          <tr><td>Intention to strike off</td><td className="dd-number">{lifecycle.counts.strikeOff}</td><td>{formatDate(lifecycle.dates.strikeOff)}</td><td>{lifecycle.counts.strikeOff > 0 && <button type="button" onClick={() => setActiveTab('registry')}>View</button>}</td></tr>
          <tr><td>Winding up</td><td className="dd-number">{lifecycle.counts.windingUp}</td><td>{formatDate(lifecycle.dates.windingUp)}</td><td>{lifecycle.counts.windingUp > 0 && <button type="button" onClick={() => setActiveTab('registry')}>View</button>}</td></tr>
          <tr><td>Dissolution</td><td className="dd-number">{lifecycle.counts.dissolution}</td><td>{formatDate(lifecycle.dates.dissolution)}</td><td>{lifecycle.counts.dissolution > 0 && <button type="button" onClick={() => setActiveTab('registry')}>View</button>}</td></tr>
          <tr><td>Liquidation</td><td className="dd-number">{lifecycle.counts.liquidation}</td><td>{formatDate(lifecycle.dates.liquidation)}</td><td>{lifecycle.counts.liquidation > 0 && <button type="button" onClick={() => setActiveTab('registry')}>View</button>}</td></tr>
          <tr><td>Cessation of business</td><td className="dd-number">{lifecycle.counts.cessation}</td><td>{formatDate(lifecycle.dates.cessation)}</td><td>{lifecycle.counts.cessation > 0 && <button type="button" onClick={() => setActiveTab('registry')}>View</button>}</td></tr>
          <tr className="is-total"><td><strong>Total</strong></td><td className="dd-number"><strong>{totalRecords}</strong></td><td colSpan="2" /></tr>
        </tbody></table>
      </section>
      <section>
        <h3>Indicators</h3>
        <dl className="dd-indicator-list">
          <div><dt>Risk rating</dt><dd><span className={`dd-risk-badge is-${String(risk).toLowerCase()}`}>{risk}</span></dd></div>
          <div><dt>Rating basis</dt><dd>{riskBasis}</dd></div>
          <div><dt>Corporate status</dt><dd>{registryStatus}</dd></div>
          <div><dt>Position in proceedings</dt><dd>{pendingCases.length ? `Initiating ${proceedings.initiating} · Responding ${proceedings.responding}${proceedings.other ? ` · Other ${proceedings.other}` : ''}` : DASH}</dd></div>
          <div><dt>Judgments</dt><dd>{judgmentCount ? `${judgmentCount} indexed judgment${judgmentCount === 1 ? '' : 's'}` : DASH}</dd></div>
          <div><dt>Main counterparties</dt><dd>{counterparties.length ? counterparties.map(([name, count]) => <span className="dd-counterparty" key={name}>{name} ({count})</span>) : DASH}</dd></div>
        </dl>
      </section>
    </div>
  );

  const cases = pendingCases.length ? <div className="dd-judgments-panel">
    <div className="dd-judgment-toolbar">
      <input type="search" value={pendingFilter} onChange={(event) => { setPendingFilter(event.target.value); setPendingPage(1); }} placeholder="Filter by title, reference, court or position" aria-label="Filter pending cases" />
      <div className="dd-judgment-pager"><span>Records {firstPending}–{lastPending} of {filteredPending.length}</span><button type="button" onClick={() => setPendingPage((page) => Math.max(1, page - 1))} disabled={pendingPage === 1}><ChevronLeft size={14} /> Prev</button><button type="button" onClick={() => setPendingPage((page) => Math.min(pendingPages, page + 1))} disabled={pendingPage === pendingPages}>Next <ChevronRight size={14} /></button></div>
    </div>
    {pagedPending.length ? <div className="dd-table-wrap"><table className="dd-record-table dd-record-items dd-judgment-table dd-pending-table"><thead><tr><th>#</th><th>Case title</th><th>Suit no.</th><th>Court</th><th>Position</th><th>Year</th><th>Status</th><th aria-label="Actions" /></tr></thead><tbody>{pagedPending.map((item, index) => <React.Fragment key={`${item.case_id}-${item.source_bank_id || index}`}><tr>
      <td className="dd-number">{firstPending + index}</td>
      <td><button type="button" className="dd-judgment-title" aria-expanded={expandedPendingId === item.case_id} aria-controls={`pending-detail-${item.case_id}`} onClick={() => togglePendingDetails(item)}>{item.case_title || 'Untitled case'}</button></td>
      <td><code>{item.suit_number || DASH}</code></td><td>{[item.courtLabel, item.location].filter(Boolean).join(' · ') || DASH}</td><td>{item.position}</td><td><code>{item.year}</code></td><td><span className="dd-record-status">{item.status || 'Pending'}</span></td>
      <td><div className="dd-judgment-actions"><button type="button" className={expandedPendingId === item.case_id ? 'is-expanded' : ''} aria-expanded={expandedPendingId === item.case_id} aria-controls={`pending-detail-${item.case_id}`} onClick={() => togglePendingDetails(item)}>{expandedPendingId === item.case_id ? 'Hide' : 'Details'}</button><button type="button" className="is-primary" disabled={pendingReportLoading === item.case_id} onClick={() => openPendingReport(item)}>{pendingReportLoading === item.case_id ? 'Preparing…' : 'Item report'}</button></div></td>
    </tr>{expandedPendingId === item.case_id && <tr id={`pending-detail-${item.case_id}`} className="dd-judgment-detail-row"><td colSpan="8">{renderPendingDetails(item)}</td></tr>}</React.Fragment>)}</tbody></table></div> : <div className="dd-empty-inline">No pending cases match this filter.</div>}
  </div> : <EmptyTab title="No pending cases">No pending-case records are indexed for this entity.</EmptyTab>;
  const judgmentRows = judgments.length ? <div className="dd-judgments-panel">
    <div className="dd-judgment-toolbar">
      <input
        type="search"
        value={judgmentFilter}
        onChange={(event) => { setJudgmentFilter(event.target.value); setJudgmentPage(1); }}
        placeholder="Filter by title, reference, court or role"
        aria-label="Filter judgments"
      />
      <div className="dd-judgment-pager">
        <span>Records {firstJudgment}–{lastJudgment} of {filteredJudgments.length}</span>
        <button type="button" onClick={() => setJudgmentPage((page) => Math.max(1, page - 1))} disabled={judgmentPage === 1}><ChevronLeft size={14} /> Prev</button>
        <button type="button" onClick={() => setJudgmentPage((page) => Math.min(judgmentPages, page + 1))} disabled={judgmentPage === judgmentPages}>Next <ChevronRight size={14} /></button>
      </div>
    </div>
    {pagedJudgments.length ? <div className="dd-table-wrap"><table className="dd-record-table dd-record-items dd-judgment-table"><thead><tr><th>#</th><th>Case title</th><th>Citation</th><th>Court</th><th>Role</th><th>Level</th><th>Status</th><th aria-label="Actions" /></tr></thead><tbody>{pagedJudgments.map((item, index) => <React.Fragment key={item.id}><tr>
      <td className="dd-number">{firstJudgment + index}</td>
      <td><button type="button" className="dd-judgment-title" aria-expanded={expandedJudgmentId === item.id} aria-controls={`judgment-detail-${item.id}`} onClick={() => toggleJudgmentDetails(item)}>{item.title || 'Untitled case'}</button></td>
      <td><code>{item.citationLabel}</code></td>
      <td>{item.courtLabel}</td>
      <td>{item.role}</td>
      <td><code>{courtName(item.court_division || item.court_type)}</code></td>
      <td><span className="dd-judgment-status">Judgment</span></td>
      <td><div className="dd-judgment-actions"><button type="button" className={expandedJudgmentId === item.id ? 'is-expanded' : ''} aria-expanded={expandedJudgmentId === item.id} aria-controls={`judgment-detail-${item.id}`} onClick={() => toggleJudgmentDetails(item)}>{expandedJudgmentId === item.id ? 'Hide' : 'Details'}</button><button type="button" className="is-primary" disabled={judgmentReportLoading === item.id} onClick={() => openJudgmentReport(item)}>{judgmentReportLoading === item.id ? 'Preparing…' : 'Item report'}</button></div></td>
    </tr>{expandedJudgmentId === item.id && <tr id={`judgment-detail-${item.id}`} className="dd-judgment-detail-row"><td colSpan="8">{renderJudgmentDetails(item)}</td></tr>}</React.Fragment>)}</tbody></table></div> : <div className="dd-empty-inline">No judgments match this filter.</div>}
  </div> : <EmptyTab title="No judgments">No reported judgment titles match this entity or its recorded aliases.</EmptyTab>;
  const registry = registryNotices.length ? <div className="dd-table-wrap"><table className="dd-record-table dd-record-items"><thead><tr><th>#</th><th>Name as published</th><th>Notice type</th><th>Source</th><th>Published</th></tr></thead><tbody>{registryNotices.map((item, index) => <tr key={`${item.source_kind || 'gazette'}-${item.id}`}><td className="dd-number">{index + 1}</td><td><strong>{item.current_name || item.name_value || item.title}</strong>{item.registration_number && <small>{item.registration_number}</small>}</td><td><span className="dd-registry-badge">{String(item.gazette_type || 'Registrar notice').replaceAll('_', ' ')}</span></td><td><code>{item.gazette_number || DASH}{item.source_page ? ` · p. ${item.source_page}` : ''}</code></td><td>{formatDate(item.publication_date || item.gazette_date)}</td></tr>)}</tbody></table></div> : <EmptyTab title="No Registrar notices">No matching Registrar notices are currently indexed.</EmptyTab>;
  const reports = entityReports.length ? <div className="dd-table-wrap"><table className="dd-record-table dd-record-items dd-reports-table"><thead><tr><th>Reference</th><th>Scope</th><th>Risk</th><th>Generated</th><th aria-label="Actions" /></tr></thead><tbody>{entityReports.map((report) => {
    const payload = report.payload || (report.entity && report.item ? report : null);
    const reportItem = payload?.item || {};
    const recordType = payload?.recordType || report.recordType;
    const citation = reportItem.citationLabel || reportItem.suit_number || payload?.details?.citation || payload?.details?.suit_reference_number || EMPTY_VALUE;
    const scope = report.scope || (payload ? `Single item — ${recordType === 'pending' ? 'Pending case' : 'Judgment'}: ${citation}` : 'Full entity profile');
    const riskLabel = report.risk || (payload ? 'Moderate' : Number(report.total || 0) > 5 ? 'Elevated' : 'Moderate');
    return <tr key={report.reference || report.id}><td><code>{report.reference || report.id}</code></td><td>{scope}</td><td>{riskLabel} risk</td><td><code>{formatDateTime(report.createdAt)}</code></td><td><button type="button" className="dd-report-open" onClick={() => onOpenSavedReport(report)}>Open</button></td></tr>;
  })}</tbody></table></div> : <EmptyTab title="No generated reports">Generate an item report or a full entity report to see it here.</EmptyTab>;

  const tabContent = activeTab === 'cases' ? cases
    : activeTab === 'registry' ? registry
      : activeTab === 'judgments' ? judgmentRows
        : activeTab === 'reports' ? reports
          : summary;

  return (
    <main className="dd-entity-record">
      <nav className="dd-record-crumb" aria-label="Breadcrumb"><button type="button" onClick={onBack}>Entity enquiry</button><span>›</span><code>{entity.id}</code></nav>
      <section className="dd-record-heading"><div><h1>{entity.name} <span>JUR.ENQ.002</span></h1><p>Step 2 of 2 · Confirmed subject and database summary</p></div><div className="dd-record-actions"><button type="button" className="is-primary" onClick={onCreateFullReport} disabled={loading}>Full entity report</button><button type="button" onClick={onToggleWatchlist} disabled={!entity.rawId || watchlistBusy}>{watchlistBusy ? 'Updating…' : watchlist.isIn ? 'Remove from watchlist' : 'Add to watchlist'}</button><button type="button" onClick={onBack}>Back to results</button></div></section>
      {error && <div className="dd-inline-alert is-error">{error}</div>}
      <section className="dd-record-details"><h2>Entity details</h2><div className="dd-record-facts">
        <div><span>Entity ID</span><code>{entity.id}</code></div><div><span>Entity type</span><strong>{entity.type === 'Individual' ? 'Individual' : 'Company / institution'}</strong></div><div><span>Risk rating</span><strong><span className={`dd-risk-badge is-${String(risk).toLowerCase()}`}>{risk}</span></strong></div>
        <div><span>Total records</span><strong>{totalRecords}</strong></div><div><span>Corporate status</span><strong>{registryStatus}</strong></div><div><span>Watchlist</span><strong>{watchlist.isIn ? 'Monitored' : 'Not monitored'}</strong></div>
        {entity.type !== 'Individual' && <>
          <div><span>Incorporation</span><strong>{lifecycle.incorporation}</strong></div>
          <div><span>Change of company name</span><strong>{lifecycle.nameChange}</strong></div>
          <div><span>Intention to strike off</span><strong>{lifecycle.strikeOff}</strong></div>
          <div><span>Winding up</span><strong>{lifecycle.windingUp}</strong></div>
          <div><span>Dissolution</span><strong>{lifecycle.dissolution}</strong></div>
          <div><span>Liquidation</span><strong>{lifecycle.liquidation}</strong></div>
          <div><span>Cessation of business</span><strong>{lifecycle.cessation}</strong></div>
        </>}
        <div className="is-wide"><span>Also recorded as</span><strong>{entity.aliases?.length ? entity.aliases.join('; ') : DASH}</strong></div>
      </div></section>
      <div className="dd-record-tabs" role="tablist">{tabs.map(([key, label, count]) => <button type="button" role="tab" aria-selected={activeTab === key} className={activeTab === key ? 'is-active' : ''} onClick={() => setActiveTab(key)} key={key}>{label}{count !== null && <span>{count}</span>}</button>)}</div>
      <section className="dd-record-content">{loading ? <div className="dd-loading-state"><Loader2 size={22} className="dd-spin" /> Loading entity records</div> : tabContent}</section>
    </main>
  );
};

export default EntityRecordView;
