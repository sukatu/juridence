import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Check, Clipboard, Download, Eye, Loader2 } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const EMPTY = '-';
const normalize = (value) => String(value || '').toUpperCase().replace(/[^A-Z0-9]+/g, ' ').trim();
const titleSides = (title) => String(title || '').split(/\s+(?:V(?:S|RS)?\.?|VERSUS)\s+/i).map((side) => side.trim()).filter(Boolean);
const noticeLabel = (notice) => String(notice.gazette_type || notice.notice_type || 'Registrar notice').replaceAll('_', ' ');
const noticeDate = (notice) => notice.effective_date || notice.event_date || notice.publication_date || notice.gazette_date || notice.created_at;

const formatDate = (value, withTime = false) => {
  if (!value) return EMPTY;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return EMPTY;
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
    ...(withTime ? { hour: '2-digit', minute: '2-digit' } : {}),
  }).format(date);
};

const analyseReport = (report) => {
  const data = report.data || {};
  const pending = data.pendingCases || [];
  const judgments = data.judgments || [];
  const registry = data.registryNotices || [];
  const aliases = [report.entity.name, ...(report.entity.aliases || [])].map(normalize).filter(Boolean);
  const isIndividual = report.entity.type === 'Individual';
  const isSubject = (value) => {
    const candidate = normalize(value);
    return aliases.some((name) => name === candidate || name.includes(candidate) || candidate.includes(name));
  };
  const positions = pending.reduce((result, item) => {
    const sides = titleSides(item.case_title);
    if (isSubject(sides[0])) result.initiating += 1;
    else if (isSubject(sides[1])) result.responding += 1;
    else result.other += 1;
    return result;
  }, { initiating: 0, responding: 0, other: 0 });
  const typeCounts = registry.reduce((counts, notice) => {
    const type = String(notice.gazette_type || notice.notice_type || 'OTHER').toUpperCase();
    counts[type] = (counts[type] || 0) + 1;
    return counts;
  }, {});
  const countMatching = (fragment) => Object.entries(typeCounts)
    .filter(([type]) => type.includes(fragment))
    .reduce((sum, [, count]) => sum + count, 0);
  const lifecycle = {
    incorporation: countMatching('INCORPORATION'),
    nameChange: countMatching('CHANGE_OF_NAME'),
    strikeOff: countMatching('STRIKE_OFF'),
    windingUp: countMatching('WINDING_UP'),
    dissolution: countMatching('DISSOLUTION'),
    liquidation: countMatching('LIQUIDATION'),
    cessation: countMatching('CESSATION'),
  };
  const severeRegistry = lifecycle.dissolution + lifecycle.liquidation + lifecycle.windingUp;
  const adverseRegistry = severeRegistry + lifecycle.strikeOff + lifecycle.cessation;
  const pendingTotal = Number(data.pendingTotal ?? pending.length);
  const judgmentTotal = Number(data.judgmentTotal ?? judgments.length);
  const registryTotal = Number(data.registryTotal ?? registry.length);
  const rating = !isIndividual && severeRegistry > 0 ? 'High'
    : pendingTotal >= 3 || adverseRegistry > 0 ? 'Elevated'
      : pendingTotal > 0 || judgmentTotal > 0 || registryTotal > 0 ? 'Moderate' : 'Low';
  const registryStatus = isIndividual ? `${registryTotal} personal Gazette notice${registryTotal === 1 ? '' : 's'} identified`
    : lifecycle.dissolution ? 'Dissolution notice identified'
    : lifecycle.liquidation ? 'Liquidation notice identified'
      : lifecycle.windingUp ? 'Winding-up notice identified'
        : lifecycle.strikeOff ? 'Intended strike-off notice identified'
          : 'No adverse corporate lifecycle notice identified';
  return {
    pending, judgments, registry, positions, lifecycle, pendingTotal, judgmentTotal, registryTotal,
    total: pendingTotal + judgmentTotal + registryTotal, rating, registryStatus, isIndividual,
  };
};

const addWrappedText = (doc, text, x, y, width, options = {}) => {
  const { size = 9, bold = false, color = [31, 42, 55], lineHeight = 13 } = options;
  doc.setFont('helvetica', bold ? 'bold' : 'normal');
  doc.setFontSize(size);
  doc.setTextColor(...color);
  const lines = doc.splitTextToSize(String(text || EMPTY), width);
  const pageHeight = doc.internal.pageSize.getHeight();
  lines.forEach((line) => {
    if (y > pageHeight - 48) { doc.addPage(); y = 48; }
    doc.text(line, x, y);
    y += lineHeight;
  });
  return y;
};

const addPdfHeading = (doc, title, y) => {
  if (y > 730) { doc.addPage(); y = 48; }
  doc.setDrawColor(2, 38, 88);
  doc.setLineWidth(3);
  doc.line(42, y - 11, 42, y + 4);
  return addWrappedText(doc, title, 51, y, 500, { size: 13, bold: true, color: [2, 38, 88], lineHeight: 16 }) + 7;
};

const downloadPdf = (report, analysis) => {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const contentWidth = pageWidth - 84;
  doc.setFillColor(2, 38, 88);
  doc.rect(0, 0, pageWidth, 88, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.text('JURIDENCE', 42, 40);
  doc.setFontSize(10);
  doc.text('Full Entity Due Diligence Report', 42, 62);
  doc.text(report.reference, pageWidth - 42, 40, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  doc.text(`${formatDate(report.createdAt, true)}  |  Confidential`, pageWidth - 42, 62, { align: 'right' });

  let y = 118;
  y = addWrappedText(doc, report.entity.name, 42, y, contentWidth, { size: 18, bold: true, color: [2, 38, 88], lineHeight: 21 }) + 7;
  y = addWrappedText(doc, `Entity ID: ${report.entity.id}    Scope: Full entity    Overall rating: ${analysis.rating}`, 42, y, contentWidth, { size: 9, color: [82, 95, 112] }) + 16;
  y = addPdfHeading(doc, '1. Executive summary', y);
  y = addWrappedText(doc, `This report consolidates ${analysis.total} indexed records for ${report.entity.name}: ${analysis.pendingTotal} pending cases, ${analysis.judgmentTotal} judgments and ${analysis.registryTotal} Registrar or Companies Bulletin notices. Overall review priority is ${analysis.rating}. ${analysis.registryStatus}.`, 42, y, contentWidth, { lineHeight: 14 }) + 14;

  y = addPdfHeading(doc, '2. Risk scorecard', y);
  autoTable(doc, {
    startY: y,
    head: [['Dimension', 'Rating', 'Basis']],
    body: [
      ['Pending proceedings', analysis.pendingTotal ? (analysis.pendingTotal >= 3 ? 'Elevated' : 'Moderate') : 'Low', `${analysis.pendingTotal} unresolved matter(s)`],
      ['Judicial history', analysis.judgmentTotal ? 'Moderate' : 'Low', `${analysis.judgmentTotal} decided matter(s)`],
      [analysis.isIndividual ? 'Gazette identity notices' : 'Corporate lifecycle', !analysis.isIndividual && (analysis.lifecycle.dissolution || analysis.lifecycle.liquidation) ? 'High' : !analysis.isIndividual && (analysis.lifecycle.strikeOff || analysis.lifecycle.windingUp || analysis.lifecycle.cessation) ? 'Elevated' : analysis.registryTotal ? 'Moderate' : 'Low', analysis.registryStatus],
      ['Identification confidence', 'Review', 'Name and recorded aliases matched; identifiers must be independently confirmed'],
      ['Overall rating', analysis.rating, 'Highest material indicator across the indexed sources'],
    ],
    styles: { fontSize: 8, cellPadding: 5, lineColor: [214, 222, 231], lineWidth: 0.4 },
    headStyles: { fillColor: [238, 241, 245], textColor: [2, 38, 88], fontStyle: 'bold' },
    margin: { left: 42, right: 42 },
  });
  y = (doc.lastAutoTable?.finalY || y) + 18;
  y = addPdfHeading(doc, '3. Transaction implications', y);
  y = addWrappedText(doc, `Credit: unresolved claims, adverse awards and corporate-status events may affect repayment capacity, enforceability and collateral recovery. Insurance: the record may affect underwriting, disclosure, claims history, conduct and moral-hazard assessment. Legal and operational teams should verify material records before commitment.`, 42, y, contentWidth, { lineHeight: 14 }) + 14;
  y = addPdfHeading(doc, '4. Recommended actions', y);
  autoTable(doc, {
    startY: y,
    head: [['#', 'Action', 'Owner', 'Timing']],
    body: [
      ['1', 'Confirm the subject using registration or identity documents and reconcile all aliases.', 'Compliance', 'Before reliance'],
      ['2', 'Obtain current court records, pleadings and judgments for every material proceeding.', 'Legal', 'Before commitment'],
      ['3', 'Confirm whether awards, costs, debts, insolvency events or Registrar notices remain current.', 'Legal / Finance', 'Before commitment'],
      ['4', 'Assess effects on credit structure, collateral, policy terms, exclusions and monitoring.', 'Credit / Underwriting', 'Before approval'],
    ],
    styles: { fontSize: 8, cellPadding: 5, lineColor: [214, 222, 231], lineWidth: 0.4 },
    headStyles: { fillColor: [238, 241, 245], textColor: [2, 38, 88], fontStyle: 'bold' },
    margin: { left: 42, right: 42 },
  });

  doc.addPage();
  y = addPdfHeading(doc, '5. Detailed findings and evidence', 54);
  autoTable(doc, {
    startY: y,
    head: [['Pending case', 'Suit no.', 'Court', 'Status', 'Source']],
    body: analysis.pending.length ? analysis.pending.map((item) => [item.case_title || EMPTY, item.suit_number || EMPTY, item.court_type || EMPTY, item.status || 'Pending', item.source_bank || EMPTY]) : [['No indexed pending cases', EMPTY, EMPTY, EMPTY, EMPTY]],
    styles: { fontSize: 7, cellPadding: 4, lineColor: [220, 227, 234], lineWidth: 0.35 },
    headStyles: { fillColor: [2, 38, 88], textColor: [255, 255, 255] },
    margin: { left: 42, right: 42 },
  });
  y = (doc.lastAutoTable?.finalY || y) + 18;
  y = addPdfHeading(doc, 'Judgments', y);
  autoTable(doc, {
    startY: y,
    head: [['Case', 'Citation', 'Court', 'Status', 'Date']],
    body: analysis.judgments.length ? analysis.judgments.map((item) => [item.title || EMPTY, item.citation || item.suit_reference_number || EMPTY, item.court_type || EMPTY, item.status || 'Judgment', formatDate(item.date)]) : [['No indexed judgments', EMPTY, EMPTY, EMPTY, EMPTY]],
    styles: { fontSize: 7, cellPadding: 4, lineColor: [220, 227, 234], lineWidth: 0.35 },
    headStyles: { fillColor: [2, 38, 88], textColor: [255, 255, 255] },
    margin: { left: 42, right: 42 },
  });
  y = (doc.lastAutoTable?.finalY || y) + 18;
  y = addPdfHeading(doc, 'Registrar and Companies Bulletin notices', y);
  autoTable(doc, {
    startY: y,
    head: [['Name as published', 'Notice type', 'Reference', 'Published', 'Page']],
    body: analysis.registry.length ? analysis.registry.map((item) => [item.current_name || item.company_name || item.name_value || item.title || EMPTY, noticeLabel(item), item.gazette_number || item.notice_reference || EMPTY, formatDate(noticeDate(item)), item.source_page || EMPTY]) : [['No indexed notices', EMPTY, EMPTY, EMPTY, EMPTY]],
    styles: { fontSize: 7, cellPadding: 4, lineColor: [220, 227, 234], lineWidth: 0.35 },
    headStyles: { fillColor: [2, 38, 88], textColor: [255, 255, 255] },
    margin: { left: 42, right: 42 },
  });
  y = (doc.lastAutoTable?.finalY || y) + 18;
  y = addPdfHeading(doc, '6. Scope, methodology and limitations', y);
  addWrappedText(doc, `Scope: full entity screening across the indexed pending-case, judgment, Gazette and Companies Bulletin datasets available when the report was generated. Search term: ${report.entity.name}. Recorded aliases were included. Name matching does not establish identity; source records may be incomplete or later superseded. Verify registration numbers, identity documents, current court status and original publications before reliance. This is a risk-screening aid and not legal, credit or insurance advice.`, 42, y, contentWidth, { lineHeight: 14 });
  doc.save(`${report.reference}-${report.entity.name.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}.pdf`);
};

const ReportSection = ({ number, title, children }) => <section className="dd-report-section" data-report-section={`${number}. ${title}`}><h3><span>{number}.</span> {title}</h3>{children}</section>;

const FullEntityReportView = ({ report, onBack, onToggleWatchlist, watchlist, watchlistBusy }) => {
  const [copied, setCopied] = useState(false);
  const [activeSection, setActiveSection] = useState('Cover and scope');
  const analysis = useMemo(() => analyseReport(report), [report]);
  const lifecycleRows = [
    ['Incorporation', analysis.lifecycle.incorporation], ['Change of company name', analysis.lifecycle.nameChange],
    ['Intended strike-off', analysis.lifecycle.strikeOff], ['Winding up', analysis.lifecycle.windingUp],
    ['Dissolution', analysis.lifecycle.dissolution], ['Liquidation', analysis.lifecycle.liquidation],
    ['Cessation of business', analysis.lifecycle.cessation],
  ];
  const reportText = useMemo(() => [
    'JURIDENCE FULL ENTITY DUE DILIGENCE REPORT', report.reference, report.entity.name,
    `Overall rating: ${analysis.rating}`,
    `Scope: ${analysis.pendingTotal} pending cases; ${analysis.judgmentTotal} judgments; ${analysis.registryTotal} Registrar notices.`,
    `Corporate status: ${analysis.registryStatus}`,
    'Required action: verify identity, current court status, awards and corporate lifecycle events before reliance.',
  ].join('\n\n'), [analysis, report]);

  useEffect(() => {
    let frame = 0;
    const updateSection = () => {
      frame = 0;
      const current = [...document.querySelectorAll('[data-report-section]')]
        .filter((section) => section.getBoundingClientRect().top <= 130).at(-1);
      setActiveSection(current?.dataset.reportSection || 'Cover and scope');
    };
    const onScroll = () => { if (!frame) frame = window.requestAnimationFrame(updateSection); };
    updateSection();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => { window.removeEventListener('scroll', onScroll); if (frame) window.cancelAnimationFrame(frame); };
  }, [report.reference]);

  const copyReport = async () => {
    await navigator.clipboard.writeText(reportText);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  return <main className="dd-item-report dd-full-report">
    <nav className="dd-record-crumb" aria-label="Breadcrumb"><button type="button" onClick={onBack}>Entity record</button><span>›</span><code>{report.reference}</code></nav>
    <section className="dd-item-report-heading">
      <div><h1>Due diligence report <span>JUR.RPT.001</span></h1><p>Full entity screening record</p></div>
      <div className="dd-item-report-actions">
        <button type="button" className="is-primary" onClick={() => downloadPdf(report, analysis)}><Download size={15} /> Download PDF</button>
        <button type="button" onClick={copyReport}>{copied ? <Check size={15} /> : <Clipboard size={15} />}{copied ? 'Copied' : 'Copy summary'}</button>
        <button type="button" onClick={onToggleWatchlist} disabled={!report.entity.rawId || watchlistBusy}>{watchlistBusy ? <Loader2 size={15} className="dd-spin" /> : <Eye size={15} />}{watchlist?.isIn ? 'Remove from watchlist' : 'Add to watchlist'}</button>
        <button type="button" onClick={onBack}><ArrowLeft size={15} /> Back to entity</button>
      </div>
    </section>
    <section className="dd-item-report-strip">
      <div className="is-subject"><small>Subject</small><strong>{report.entity.name}</strong><span>{report.entity.type || 'Entity'}</span></div>
      <div><small>Entity ID</small><code>{report.entity.id}</code></div>
      <div><small>Overall rating</small><b className={`is-${analysis.rating.toLowerCase()}`}>{analysis.rating}</b></div>
      <div><small>Scope</small><strong>Full entity</strong></div>
      <div><small>Reference</small><code>{report.reference}</code></div>
      <div className="is-current-section"><small>Section</small><strong>{activeSection}</strong></div>
    </section>

    <article className="dd-item-report-paper">
      <header className="dd-item-report-cover"><img src="/logos/logo-white.png" alt="Juridence" /><div><span>Full Entity Due Diligence Report</span><strong>{report.reference}</strong><small>{formatDate(report.createdAt, true)} · Confidential</small></div></header>
      <div className="dd-report-document-body">
        <p className="dd-report-kicker">Subject</p><h2>{report.entity.name}</h2><span className="dd-report-type">{report.entity.type || 'Entity'}</span>
        <div className="dd-report-scope-note"><strong>Full entity report</strong> · All matching records available across the indexed databases at the time of search.<small>{analysis.total} records assessed across pending cases, judgments and corporate registry sources.</small></div>
        <dl className="dd-report-prepared"><div><dt>Purpose of search</dt><dd>{report.purposeLabel || 'KYC / client onboarding'}</dd></div><div><dt>Prepared for</dt><dd>{report.preparedFor || EMPTY}</dd></div></dl>

        <ReportSection number="1" title="Executive summary">
          <div className="dd-report-bottom-line"><small>Bottom line · overall rating: {analysis.rating}</small><p>{report.entity.name} has {analysis.total} matching indexed records: {analysis.pendingTotal} pending cases, {analysis.judgmentTotal} judgments and {analysis.registryTotal} Registrar or Companies Bulletin notices. {analysis.registryStatus}.</p></div>
          <div className="dd-report-metrics"><div><span>Pending cases</span><strong>{analysis.pendingTotal}</strong></div><div><span>Judgments</span><strong>{analysis.judgmentTotal}</strong></div><div><span>Registry notices</span><strong>{analysis.registryTotal}</strong></div><div><span>Total records</span><strong>{analysis.total}</strong></div></div>
          <h4>Key findings</h4><ol><li><strong>Proceedings</strong> — Initiating party in {analysis.positions.initiating}; responding party in {analysis.positions.responding}; other or undetermined in {analysis.positions.other}.</li><li><strong>{analysis.isIndividual ? 'Gazette notices' : 'Corporate lifecycle'}</strong> — {analysis.registryStatus}.</li><li><strong>Identity</strong> — Matched against the confirmed {analysis.isIndividual ? 'individual' : 'entity'} name and {report.entity.aliases?.length || 0} recorded alias{report.entity.aliases?.length === 1 ? '' : 'es'}.</li><li><strong>Decision use</strong> — Material records require source verification before credit, underwriting or onboarding approval.</li></ol>
        </ReportSection>

        <ReportSection number="2" title="Risk scorecard">
          <table className="dd-report-table"><thead><tr><th>Dimension</th><th>Rating</th><th>Basis</th></tr></thead><tbody>
            <tr><th>Pending proceedings</th><td><span className={analysis.pendingTotal ? 'is-elevated' : 'is-low'}>{analysis.pendingTotal ? (analysis.pendingTotal >= 3 ? 'Elevated' : 'Moderate') : 'Low'}</span></td><td>{analysis.pendingTotal} unresolved matter{analysis.pendingTotal === 1 ? '' : 's'} identified.</td></tr>
            <tr><th>Judicial history</th><td><span className={analysis.judgmentTotal ? 'is-moderate' : 'is-low'}>{analysis.judgmentTotal ? 'Moderate' : 'Low'}</span></td><td>{analysis.judgmentTotal} decided matter{analysis.judgmentTotal === 1 ? '' : 's'} identified.</td></tr>
            <tr><th>{analysis.isIndividual ? 'Gazette identity notices' : 'Corporate lifecycle'}</th><td><span className={!analysis.isIndividual && (analysis.lifecycle.dissolution || analysis.lifecycle.liquidation) ? 'is-high' : !analysis.isIndividual && (analysis.lifecycle.strikeOff || analysis.lifecycle.windingUp || analysis.lifecycle.cessation) ? 'is-elevated' : analysis.registryTotal ? 'is-moderate' : 'is-low'}>{!analysis.isIndividual && (analysis.lifecycle.dissolution || analysis.lifecycle.liquidation) ? 'High' : !analysis.isIndividual && (analysis.lifecycle.strikeOff || analysis.lifecycle.windingUp || analysis.lifecycle.cessation) ? 'Elevated' : analysis.registryTotal ? 'Moderate' : 'Low'}</span></td><td>{analysis.registryStatus}.</td></tr>
            <tr><th>Identification confidence</th><td><span className="is-moderate">Review</span></td><td>Name and alias matching supports screening; independent identifiers are still required.</td></tr>
            <tr><th>Overall rating</th><td><span className={`is-${analysis.rating.toLowerCase()}`}>{analysis.rating}</span></td><td>Highest material indicator across the indexed sources.</td></tr>
          </tbody></table>
        </ReportSection>

        <ReportSection number="3" title="Implications for the transaction">
          <div className="dd-report-implications"><p><strong>Credit and lending.</strong> Review unresolved claims, judgments, awards and corporate-status events for effects on repayment capacity, enforceability, collateral value and recovery strategy.</p><p><strong>Insurance and underwriting.</strong> Consider disclosure, conduct, claims history, litigation frequency, governance and moral-hazard implications when setting terms, exclusions, limits and monitoring.</p><p><strong>Compliance and operations.</strong> Confirm legal identity and current corporate standing. Reconcile aliases, registration numbers and source dates before onboarding or relying on an apparent match.</p></div>
        </ReportSection>

        <ReportSection number="4" title="Recommended actions"><table className="dd-report-table"><thead><tr><th>#</th><th>Action</th><th>Owner</th><th>Timing</th><th>Priority</th></tr></thead><tbody><tr><td>1</td><td>Confirm the subject using registration or identity documents and reconcile all recorded aliases.</td><td>Compliance</td><td>Before reliance</td><td><span className="is-elevated">High</span></td></tr><tr><td>2</td><td>Obtain current court records, pleadings and full judgments for every material proceeding.</td><td>Legal</td><td>Before commitment</td><td><span className="is-elevated">High</span></td></tr><tr><td>3</td><td>Confirm whether awards, costs, debts, insolvency events and Registrar notices remain current.</td><td>Legal / Finance</td><td>Before commitment</td><td><span className="is-moderate">Medium</span></td></tr><tr><td>4</td><td>Reflect verified findings in credit structure, collateral, policy terms, exclusions and monitoring.</td><td>Credit / Underwriting</td><td>Before approval</td><td><span className="is-moderate">Medium</span></td></tr></tbody></table></ReportSection>

        <ReportSection number="5" title="Detailed findings and evidence">
          <h4>Pending cases ({analysis.pendingTotal})</h4><div className="dd-table-wrap"><table className="dd-report-table dd-report-evidence-table"><thead><tr><th>#</th><th>Case title</th><th>Suit no.</th><th>Court</th><th>Status</th><th>Source</th></tr></thead><tbody>{analysis.pending.length ? analysis.pending.map((item, index) => <tr key={`${item.case_id}-${item.source_bank_id || index}`}><td>{index + 1}</td><td>{item.case_title || EMPTY}</td><td><code>{item.suit_number || EMPTY}</code></td><td>{item.court_type || EMPTY}</td><td>{item.status || 'Pending'}</td><td>{item.source_bank || EMPTY}</td></tr>) : <tr><td colSpan="6">No indexed pending cases.</td></tr>}</tbody></table></div>
          <h4>Judgments ({analysis.judgmentTotal})</h4><div className="dd-table-wrap"><table className="dd-report-table dd-report-evidence-table"><thead><tr><th>#</th><th>Case title</th><th>Citation</th><th>Court</th><th>Status</th><th>Date</th></tr></thead><tbody>{analysis.judgments.length ? analysis.judgments.map((item, index) => <tr key={item.id || index}><td>{index + 1}</td><td>{item.title || EMPTY}</td><td><code>{item.citation || item.suit_reference_number || EMPTY}</code></td><td>{item.court_type || EMPTY}</td><td>{item.status || 'Judgment'}</td><td>{formatDate(item.date)}</td></tr>) : <tr><td colSpan="6">No indexed judgments.</td></tr>}</tbody></table></div>
          {!analysis.isIndividual && <><h4>Corporate lifecycle summary</h4><table className="dd-report-table dd-report-lifecycle-table"><thead><tr><th>Database</th><th>Records</th></tr></thead><tbody>{lifecycleRows.map(([label, count]) => <tr key={label}><th>{label}</th><td>{count}</td></tr>)}</tbody></table></>}
          <h4>Registrar and Companies Bulletin notices ({analysis.registryTotal})</h4><div className="dd-table-wrap"><table className="dd-report-table dd-report-evidence-table"><thead><tr><th>#</th><th>Name as published</th><th>Notice type</th><th>Source</th><th>Published</th></tr></thead><tbody>{analysis.registry.length ? analysis.registry.map((item, index) => <tr key={`${item.source_kind || 'notice'}-${item.id || index}`}><td>{index + 1}</td><td>{item.current_name || item.company_name || item.name_value || item.title || EMPTY}</td><td>{noticeLabel(item)}</td><td>{item.gazette_number || item.notice_reference || EMPTY}{item.source_page ? ` · p. ${item.source_page}` : ''}</td><td>{formatDate(noticeDate(item))}</td></tr>) : <tr><td colSpan="5">No indexed Registrar notices.</td></tr>}</tbody></table></div>
        </ReportSection>

        <ReportSection number="6" title="Scope, methodology and limitations">
          <table className="dd-report-table dd-report-method"><tbody><tr><th>Report scope</th><td>Full entity screening across all indexed databases available at generation time.</td></tr><tr><th>Search term</th><td>{report.entity.name}</td></tr><tr><th>Recorded aliases</th><td>{report.entity.aliases?.join('; ') || EMPTY}</td></tr><tr><th>Purpose of search</th><td>{report.purposeLabel || 'KYC / client onboarding'}</td></tr><tr><th>Requested by</th><td>{report.preparedFor || EMPTY}</td></tr><tr><th>Date and time</th><td>{formatDate(report.createdAt, true)}</td></tr><tr><th>Datasets</th><td>Pending cases; judgments; Gazette records; Companies Bulletin lifecycle notices.</td></tr><tr><th>Matching approach</th><td>Confirmed entity name and recorded aliases, normalised for letter case and punctuation.</td></tr></tbody></table>
          <h4>Limitations</h4><ul className="dd-report-limitations"><li>A name match does not establish identity. Confirm registration numbers or identity documents.</li><li>Source records may be incomplete, contain OCR errors or have been superseded after capture.</li><li>Pending proceedings do not establish liability and their status may have changed.</li><li>Read original court and Registrar sources where a finding is material.</li><li>This report is a screening aid for risk assessment. It is not legal, credit or insurance advice.</li></ul>
        </ReportSection>
      </div>
    </article>
  </main>;
};

export default FullEntityReportView;
