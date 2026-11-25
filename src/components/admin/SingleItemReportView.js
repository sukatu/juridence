import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Check, Clipboard, Download, Eye, Loader2 } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const EMPTY = '-';
const cleanText = (value) => {
  if (!value) return EMPTY;
  const text = String(value);
  if (!text.includes('<') || typeof DOMParser === 'undefined') return text.replace(/\s+/g, ' ').trim() || EMPTY;
  return new DOMParser().parseFromString(text, 'text/html').body.textContent?.replace(/\s+/g, ' ').trim() || EMPTY;
};

const conciseText = (value, maxCharacters = 760) => {
  const text = cleanText(value);
  if (text === EMPTY) return EMPTY;
  const sentences = text.match(/[^.!?]+(?:[.!?]+|$)/g) || [text];
  let result = sentences.slice(0, 3).join(' ').trim();
  if (result.length <= maxCharacters) return result;
  result = result.slice(0, maxCharacters + 1);
  const lastSpace = result.lastIndexOf(' ');
  return `${result.slice(0, lastSpace > 0 ? lastSpace : maxCharacters).trim()}…`;
};

const formatDate = (value, withTime = false) => {
  const date = value ? new Date(value) : null;
  if (!date || Number.isNaN(date.getTime())) return EMPTY;
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
    ...(withTime ? { hour: '2-digit', minute: '2-digit' } : {}),
  }).format(date);
};

const titleSides = (title) => String(title || '').split(/\s+(?:V(?:S|RS)?\.?|VERSUS)\s+/i).map((side) => side.trim()).filter(Boolean);
const normalize = (value) => String(value || '').toUpperCase().replace(/[^A-Z0-9]+/g, ' ').trim();
const courtName = (value) => ({ SC: 'Supreme Court', CA: 'Court of Appeal', HC: 'High Court', DC: 'District Court', CC: 'Circuit Court' }[String(value || '').toUpperCase()] || value || EMPTY);

const buildReportFacts = (report) => {
  const { entity, item, details = {} } = report;
  const isPending = report.recordType === 'pending';
  const entityNames = [entity.name, ...(entity.aliases || [])].map(normalize).filter(Boolean);
  const sides = titleSides(details.title || item.title || item.case_title);
  const isEntity = (value) => {
    const candidate = normalize(value);
    return entityNames.some((name) => name === candidate || name.includes(candidate) || candidate.includes(name));
  };
  const entityIsFirst = isEntity(sides[0]);
  const role = item.position || (item.role && item.role !== '—' ? item.role : entityIsFirst ? 'Plaintiff / Appellant' : 'Defendant / Respondent');
  return {
    title: details.title || item.title || item.case_title || 'Untitled case',
    citation: details.citation || details.dl_citation_no || details.suit_reference_number || item.citationLabel || item.suit_number || EMPTY,
    court: courtName(details.court_type || item.court_type),
    level: courtName(details.court_division || details.court_type || item.court_division || item.court_type),
    role,
    status: isPending ? (details.case_progress || details.status || item.status || 'Pending') : (details.judgement || details.decision || details.conclusion ? 'Judgment delivered' : (details.case_progress || details.status || 'Judgment')),
    judges: details.presiding_judge || details.judgement_by || EMPTY,
    location: [details.town, details.region].filter(Boolean).join(', ') || EMPTY,
    summary: conciseText(details.case_summary || details.headnotes || details.commentary || details.detail_content),
    ruling: conciseText(details.ai_case_outcome || details.ai_court_orders || details.conclusion || details.judgement || details.decision),
    risk: conciseText(details.ai_detailed_outcome || details.ai_financial_impact),
    otherParties: sides.filter((side) => !isEntity(side)),
    otherRole: entityIsFirst ? 'Defendant / Respondent' : 'Plaintiff / Appellant',
    source: details.dl_type || details.file_name || details.file_url || details.firebase_url || item.source_bank || EMPTY,
    decisionDate: formatDate(details.date || item.created_on),
    updatedDate: formatDate(details.updated_at),
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

const downloadPdf = (report, facts) => {
  const isPending = report.recordType === 'pending';
  const rating = 'Moderate';
  const recordLabel = isPending ? 'pending case' : 'judgment';
  const total = Number(isPending ? report.pendingTotal : report.judgmentTotal) || 1;
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const contentWidth = pageWidth - 84;
  doc.setFillColor(2, 38, 88);
  doc.rect(0, 0, pageWidth, 86, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.text('JURIDENCE', 42, 40);
  doc.setFontSize(10);
  doc.text('Single-item Due Diligence Report', 42, 61);
  doc.text(report.reference, pageWidth - 42, 40, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  doc.text(`${formatDate(report.createdAt, true)}  |  Confidential`, pageWidth - 42, 61, { align: 'right' });

  let y = 116;
  y = addWrappedText(doc, report.entity.name, 42, y, contentWidth, { size: 17, bold: true, color: [2, 38, 88], lineHeight: 19 }) + 8;
  y = addWrappedText(doc, `Entity ID: ${report.entity.id}    Scope: Single item    Overall rating: ${rating}`, 42, y, contentWidth, { size: 9, color: [82, 95, 112] }) + 12;

  const sections = isPending ? [
    ['1. Executive summary', `This report assesses one pending case: ${facts.title} (${facts.citation}), ${facts.court}. The subject is recorded as ${facts.role}. The case remains unresolved in the indexed source.`],
    ['2. Risk scorecard', 'Pending proceedings: Elevated review priority. Identification confidence: source-name match. Overall rating: Elevated for this selected unresolved case.'],
    ['3. Implications for the transaction', 'An unresolved proceeding may create legal, financial, operational or reputational exposure. The case title and available extract do not establish liability or predict the outcome.'],
    ['4. Recommended actions', 'Confirm the current court status and the identity of the subject; obtain the pleadings and material orders; review the claim value and any interim relief; monitor the case where it is material to the transaction.'],
    ['5. Detailed findings and evidence', `Summary of case: ${facts.summary}\n\nCurrent case information: ${facts.status}\n\nRisk & financial analysis: ${facts.risk}`],
  ] : [
    ['1. Executive summary', `This report assesses one decided case: ${facts.title} (${facts.citation}), ${facts.court}. The subject appeared as ${facts.role}. ${facts.ruling !== EMPTY ? facts.ruling : 'The source does not contain a recorded ruling summary.'}`],
    ['2. Risk scorecard', `Judicial history: Moderate review priority. Identification confidence: source-name match. Overall rating: Moderate for this single-item report.`],
    ['3. Implications for the transaction', 'Review this judgment for relevance to the contemplated transaction, including the subject\'s role, the ruling and any recorded financial award or costs. The report does not determine creditworthiness or legal liability.'],
    ['4. Recommended actions', 'Verify the case against the original judgment; confirm whether any award, debt or costs remain outstanding; obtain legal advice where the matter is material to the proposed transaction.'],
    ['5. Detailed findings and evidence', `Summary of case: ${facts.summary}\n\nRuling, financial award & costs: ${facts.ruling}\n\nRisk & financial analysis: ${facts.risk}`],
  ];
  sections.forEach(([heading, body]) => {
    y = addWrappedText(doc, heading, 42, y, contentWidth, { size: 13, bold: true, color: [2, 38, 88], lineHeight: 16 }) + 5;
    y = addWrappedText(doc, body, 42, y, contentWidth, { size: 9, lineHeight: 13 }) + 15;
  });

  if (y > 610) { doc.addPage(); y = 48; }
  autoTable(doc, {
    startY: y,
    head: [['Field', 'Recorded value']],
    body: [
      ['Case title', facts.title], ['Suit no. / citation', facts.citation], ['Court', facts.court], ['Role of this party', facts.role],
      ['Judge(s)', facts.judges], ['Location', facts.location], ['Decision date', facts.decisionDate], ['Source', facts.source],
    ],
    styles: { fontSize: 8, cellPadding: 5, lineColor: [214, 222, 231], lineWidth: 0.4, textColor: [31, 42, 55] },
    headStyles: { fillColor: [238, 241, 245], textColor: [2, 38, 88], fontStyle: 'bold' },
    columnStyles: { 0: { cellWidth: 120, fontStyle: 'bold' }, 1: { cellWidth: contentWidth - 120 } },
    margin: { left: 42, right: 42 },
  });
  y = (doc.lastAutoTable?.finalY || y) + 22;
  y = addWrappedText(doc, '6. Scope, methodology and limitations', 42, y, contentWidth, { size: 13, bold: true, color: [2, 38, 88], lineHeight: 16 }) + 5;
  addWrappedText(doc, `Scope: this report covers only the selected ${recordLabel}; ${Math.max(0, total - 1)} other ${recordLabel} record(s) for the subject are not assessed. Names are compared after normalising case and punctuation and include recorded aliases. This is an information-screening aid, not legal advice. Verify findings against the original source before reliance.`, 42, y, contentWidth, { size: 9, lineHeight: 13 });
  doc.save(`${report.reference}-${report.entity.name.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}.pdf`);
};

const SingleItemReportView = ({ report, onBack, onToggleWatchlist, watchlist, watchlistBusy }) => {
  const [copied, setCopied] = useState(false);
  const [activeSection, setActiveSection] = useState('Cover and scope');
  const facts = useMemo(() => buildReportFacts(report), [report]);
  const isPending = report.recordType === 'pending';
  const total = Number(isPending ? report.pendingTotal : report.judgmentTotal) || 1;
  const otherCount = Math.max(0, total - 1);
  const recordLabel = isPending ? 'pending case' : 'judgment';
  const rating = 'Moderate';
  const reportText = useMemo(() => [
    'JURIDENCE SINGLE-ITEM DUE DILIGENCE REPORT', report.reference, report.entity.name,
    `Case: ${facts.title}`, `Citation: ${facts.citation}`, `Court: ${facts.court}`, `Role: ${facts.role}`,
    `Summary of case: ${facts.summary}`, `${isPending ? 'Current case information' : 'Ruling, financial award & costs'}: ${isPending ? facts.status : facts.ruling}`,
    `Risk & financial analysis: ${facts.risk}`,
    `Scope: This report assesses only the selected ${recordLabel} and must be verified against the original source.`,
  ].join('\n\n'), [facts, isPending, recordLabel, report]);

  const copyReport = async () => {
    await navigator.clipboard.writeText(reportText);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  useEffect(() => {
    let frame = 0;
    const updateSection = () => {
      frame = 0;
      const sections = [...document.querySelectorAll('[data-report-section]')];
      const current = sections
        .filter((section) => section.getBoundingClientRect().top <= 130)
        .at(-1);
      setActiveSection(current?.dataset.reportSection || 'Cover and scope');
    };
    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(updateSection);
    };
    updateSection();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [report.reference]);

  return <main className="dd-item-report">
    <nav className="dd-record-crumb" aria-label="Breadcrumb"><button type="button" onClick={onBack}>Reports</button><span>›</span><code>{report.reference}</code></nav>
    <section className="dd-item-report-heading">
      <div><h1>Due diligence report <span>JUR.RPT.002</span></h1><p>Single-item screening record</p></div>
      <div className="dd-item-report-actions">
        <button type="button" className="is-primary" onClick={() => downloadPdf(report, facts)}><Download size={15} /> Download PDF</button>
        <button type="button" onClick={copyReport}>{copied ? <Check size={15} /> : <Clipboard size={15} />}{copied ? 'Copied' : 'Copy text'}</button>
        <button type="button" onClick={onToggleWatchlist} disabled={!report.entity.rawId || watchlistBusy}>{watchlistBusy ? <Loader2 size={15} className="dd-spin" /> : <Eye size={15} />}{watchlist?.isIn ? 'Remove from watchlist' : 'Add to watchlist'}</button>
        <button type="button" onClick={onBack}><ArrowLeft size={15} /> Back to entity</button>
      </div>
    </section>

    <section className="dd-item-report-strip">
      <div className="is-subject"><small>Subject</small><strong>{report.entity.name}</strong><span>{report.entity.type || 'Entity'}</span></div>
      <div><small>Entity ID</small><code>{report.entity.id}</code></div>
      <div><small>Overall rating</small><b className="is-moderate">{rating}</b></div>
      <div><small>Scope</small><strong>Single item</strong></div>
      <div><small>Reference</small><code>{report.reference}</code></div>
      <div className="is-current-section"><small>Section</small><strong>{activeSection}</strong></div>
    </section>

    <article className="dd-item-report-paper">
      <header className="dd-item-report-cover"><img src="/logos/logo-white.png" alt="Juridence" /><div><span>Single-item Due Diligence Report</span><strong>{report.reference}</strong><small>{formatDate(report.createdAt, true)} · Confidential</small></div></header>
      <div className="dd-report-document-body">
        <p className="dd-report-kicker">Subject</p><h2>{report.entity.name}</h2><span className="dd-report-type">{report.entity.type || 'Entity'}</span>
        <div className="dd-report-scope-note"><strong>Single-item report</strong> · {isPending ? 'Pending case' : 'Judgment'}: {facts.citation} — {facts.title}<small>{otherCount} other {recordLabel} record{otherCount === 1 ? '' : 's'} on this subject {otherCount === 1 ? 'is' : 'are'} not covered.</small></div>
        <dl className="dd-report-prepared"><div><dt>Purpose of search</dt><dd>{report.purposeLabel || 'KYC / client onboarding'}</dd></div><div><dt>Prepared for</dt><dd>{report.preparedFor || EMPTY}</dd></div></dl>

        <ReportSection number="1" title="Executive summary">
          <div className="dd-report-bottom-line"><small>Bottom line · overall rating: {rating}</small><p>This report assesses one {isPending ? 'unresolved pending' : 'decided'} case: <strong>{facts.title}</strong> ({facts.citation}), {facts.court}. The subject appeared as {facts.role}. The recorded case information and risk commentary are set out below.</p></div>
          <h4>Key findings</h4><ol><li><strong>Case</strong> — {facts.title}; {facts.court}; {facts.citation}.</li><li><strong>Role</strong> — {report.entity.name} appeared as {facts.role}.</li><li><strong>{isPending ? 'Status' : 'Ruling'}</strong> — {isPending ? facts.status : facts.ruling}</li><li><strong>Scope</strong> — Single item. {otherCount} other {recordLabel} record{otherCount === 1 ? '' : 's'} are not covered.</li></ol>
        </ReportSection>

        <ReportSection number="2" title="Risk scorecard">
          <table className="dd-report-table"><thead><tr><th>Dimension</th><th>Rating</th><th>Basis</th></tr></thead><tbody><tr><th>{isPending ? 'Pending proceedings' : 'Judicial history'}</th><td><span className="is-moderate">{rating}</span></td><td>One selected {isPending ? 'unresolved' : 'decided'} case is assessed in this report.</td></tr><tr><th>Identification confidence</th><td><span className="is-low">Review</span></td><td>The case title matched the subject name or a recorded alias.</td></tr><tr><th>Overall rating</th><td><span className="is-moderate">{rating}</span></td><td>Screening priority for this single {recordLabel}, not an entity-wide conclusion.</td></tr></tbody></table>
        </ReportSection>

        <ReportSection number="3" title="Implications for the transaction"><p><strong>{isPending ? 'Unresolved proceeding.' : 'Conduct and precedent.'}</strong> {isPending ? 'Review the claim, the subject’s position and any interim orders for potential legal, financial, operational or reputational exposure. A pending case does not establish liability or predict the outcome.' : 'Review the subject’s role, the recorded ruling and any financial award or costs for relevance to the contemplated transaction. This screening result does not by itself establish present liability, creditworthiness or legal risk.'}</p></ReportSection>
        <ReportSection number="4" title="Recommended actions"><table className="dd-report-table"><thead><tr><th>#</th><th>Action</th><th>Owner</th><th>Timing</th></tr></thead><tbody><tr><td>1</td><td>{isPending ? 'Confirm the current court status and the identity of the subject.' : 'Verify the case against the original judgment and confirm the identity of the subject.'}</td><td>Legal</td><td>Before commitment</td></tr><tr><td>2</td><td>{isPending ? 'Obtain the pleadings, material orders and any recorded claim value.' : 'Confirm whether any recorded award, debt or costs remain outstanding.'}</td><td>Legal / Finance</td><td>Before commitment</td></tr><tr><td>3</td><td>{isPending ? 'Monitor the proceeding where it is material to the proposed transaction.' : 'Obtain legal advice if the judgment is material to the proposed transaction.'}</td><td>Legal</td><td>As required</td></tr></tbody></table></ReportSection>

        <ReportSection number="5" title="Detailed findings and evidence">
          <article className="dd-report-finding"><h4>{facts.title}</h4><dl><div><dt>Suit no. / citation</dt><dd><code>{facts.citation}</code></dd></div><div><dt>Status</dt><dd>{facts.status}</dd></div><div><dt>Court</dt><dd>{facts.court}</dd></div><div><dt>Role of this party</dt><dd>{facts.role}</dd></div><div><dt>Judge(s)</dt><dd>{facts.judges}</dd></div><div><dt>Location</dt><dd>{facts.location}</dd></div></dl><h5>Summary of case</h5><p>{facts.summary}</p><h5>{isPending ? 'Current case information' : 'Ruling, financial award & costs'}</h5><p>{isPending ? facts.status : facts.ruling}</p><h5>Risk & financial analysis</h5><p>{facts.risk}</p><div className="dd-other-parties"><span>Other parties:</span>{facts.otherParties.length ? facts.otherParties.map((party) => <strong key={party}>{party} · {facts.otherRole}</strong>) : EMPTY}</div><details className="dd-judgment-source"><summary>Source & dates</summary><dl><div><dt>Record source</dt><dd>{facts.source}</dd></div><div><dt>{isPending ? 'Record date' : 'Decision date'}</dt><dd>{facts.decisionDate}</dd></div><div><dt>Record updated</dt><dd>{facts.updatedDate}</dd></div><div><dt>Court level</dt><dd>{facts.level}</dd></div></dl></details></article>
        </ReportSection>

        <ReportSection number="6" title="Scope, methodology and limitations">
          <table className="dd-report-table dd-report-method"><tbody><tr><th>Report scope</th><td>Single item — {isPending ? 'Pending case' : 'Judgment'}: {facts.citation} — {facts.title}</td></tr><tr><th>Other records on file</th><td>{otherCount} other {recordLabel} record{otherCount === 1 ? '' : 's'} not covered ({total} total)</td></tr><tr><th>Search term</th><td>{report.entity.name}</td></tr><tr><th>Matched record</th><td>{report.entity.name} ({report.entity.type || 'entity'})</td></tr><tr><th>Purpose of search</th><td>{report.purposeLabel || 'KYC / client onboarding'}</td></tr><tr><th>Requested by</th><td>{report.preparedFor || EMPTY}</td></tr><tr><th>Date and time of search</th><td>{formatDate(report.createdAt, true)}</td></tr><tr><th>Matching approach</th><td>Names are compared after normalising letter case and punctuation. Recorded aliases are included in the comparison.</td></tr></tbody></table>
          <h4>Limitations</h4><ul className="dd-report-limitations"><li>This report assesses only the selected {recordLabel} and does not reflect every record held on the subject.</li><li>A name match does not establish identity. Verify the subject using registration numbers or identity documents.</li><li>Source summaries may omit context. Read the original {isPending ? 'case file and current court record' : 'judgment'} where the matter is material.</li><li>{isPending ? 'Pending status does not establish liability and may have changed since the source was captured.' : 'This report is a screening aid for risk assessment. It is not legal advice.'}</li><li>This report is a screening aid for risk assessment. It is not legal advice.</li></ul>
        </ReportSection>
      </div>
    </article>
  </main>;
};

const ReportSection = ({ number, title, children }) => <section className="dd-report-section" data-report-section={`${number}. ${title}`}><h3><span>{number}.</span> {title}</h3>{children}</section>;

export default SingleItemReportView;
