import React, { useEffect, useState } from 'react';
import { ArrowRight, Download, FileText } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { apiDelete, apiPost } from '../../utils/api';
import FullEntityReportView from './FullEntityReportView';
import SingleItemReportView from './SingleItemReportView';

const STORAGE_KEY = 'juridence_due_diligence_reports';
const loadHistory = () => {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch { return []; }
};
const loadSingleItemReport = () => {
  try { return JSON.parse(sessionStorage.getItem('juridence_single_item_report') || 'null'); } catch { return null; }
};
const loadFullEntityReport = () => {
  try { return JSON.parse(sessionStorage.getItem('juridence_full_entity_report') || 'null'); } catch { return null; }
};
const compactSingleItemReport = (report) => {
  const detailKeys = [
    'id', 'title', 'citation', 'dl_citation_no', 'suit_reference_number', 'court_type', 'court_division',
    'case_progress', 'status', 'presiding_judge', 'judgement_by', 'town', 'region', 'case_summary',
    'headnotes', 'commentary', 'detail_content', 'ai_case_outcome', 'ai_court_orders', 'conclusion',
    'judgement', 'decision', 'ai_detailed_outcome', 'ai_financial_impact', 'dl_type', 'file_name',
    'file_url', 'firebase_url', 'date', 'updated_at', 'year',
  ];
  const details = Object.fromEntries(detailKeys.filter((key) => report.details?.[key] !== undefined).map((key) => [key, report.details[key]]));
  return { ...report, details };
};

const buildPdf = (report) => {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  doc.setFillColor(2, 38, 88);
  doc.rect(0, 0, pageWidth, 92, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(19);
  doc.text('JURIDENCE', 42, 42);
  doc.setFontSize(11);
  doc.text('Due Diligence Report', 42, 65);
  doc.setTextColor(21, 35, 51);
  doc.setFontSize(18);
  doc.text(report.subject, 42, 128, { maxWidth: pageWidth - 84 });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(91, 107, 126);
  doc.text(`Reference: ${report.reference}`, 42, 156);
  doc.text(`Generated: ${new Date(report.createdAt).toLocaleString('en-GB')}`, 42, 172);

  doc.setFillColor(244, 247, 250);
  doc.roundedRect(42, 194, pageWidth - 84, 70, 3, 3, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(21, 35, 51);
  doc.setFontSize(10);
  doc.text('SCREENING OUTCOME', 58, 217);
  doc.setFontSize(15);
  doc.text(report.total > 5 ? 'High review priority' : report.total > 0 ? 'Review required' : 'No pending-case match', 58, 241);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(`${report.total} indexed pending case match${report.total === 1 ? '' : 'es'} identified.`, 300, 241);

  autoTable(doc, {
    startY: 288,
    head: [['Case title', 'Suit number', 'Court', 'Status', 'Source']],
    body: report.cases.length ? report.cases.map((item) => [item.case_title || '-', item.suit_number || '-', item.court_type || '-', item.status || '-', item.source_bank || '-']) : [['No matching pending cases were identified.', '-', '-', '-', '-']],
    styles: { fontSize: 7.5, cellPadding: 5, textColor: [38, 51, 65], lineColor: [220, 227, 234], lineWidth: 0.4 },
    headStyles: { fillColor: [2, 38, 88], textColor: [255, 255, 255], fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    columnStyles: { 0: { cellWidth: 190 }, 1: { cellWidth: 82 }, 2: { cellWidth: 72 }, 3: { cellWidth: 58 }, 4: { cellWidth: 78 } },
    margin: { left: 42, right: 42 },
  });
  const finalY = doc.lastAutoTable?.finalY || 330;
  doc.setFontSize(8);
  doc.setTextColor(91, 107, 126);
  doc.text('Important: This report is an information-screening aid, not legal advice. Potential matches must be verified against the source record before making a decision.', 42, finalY + 28, { maxWidth: pageWidth - 84 });
  doc.text('Source coverage: Juridence indexed pending bank cases. Search results may change as source data is updated.', 42, finalY + 52, { maxWidth: pageWidth - 84 });
  return doc;
};

const DueDiligenceReportsPage = ({ onNavigate }) => {
  const [history, setHistory] = useState(loadHistory);
  const [error, setError] = useState('');
  const [singleItemReport, setSingleItemReport] = useState(loadSingleItemReport);
  const [fullEntityReport, setFullEntityReport] = useState(loadFullEntityReport);
  const [reportWatchlist, setReportWatchlist] = useState(() => loadFullEntityReport()?.watchlist || loadSingleItemReport()?.watchlist || { isIn: false, id: null });
  const [reportWatchlistBusy, setReportWatchlistBusy] = useState(false);

  useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(history.slice(0, 30))); }, [history]);

  useEffect(() => {
    if (!singleItemReport) return;
    setHistory((current) => {
      if (current.some((report) => report.reference === singleItemReport.reference)) return current;
      const payload = compactSingleItemReport(singleItemReport);
      const item = payload.item || {};
      const citation = item.citationLabel || item.suit_number || payload.details?.citation || payload.details?.suit_reference_number || '-';
      return [{
        id: payload.reference,
        kind: 'single-item',
        reference: payload.reference,
        subject: payload.entity.name,
        total: 1,
        createdAt: payload.createdAt,
        recordType: payload.recordType,
        scope: `Single item — ${payload.recordType === 'pending' ? 'Pending case' : 'Judgment'}: ${citation}`,
        risk: 'Moderate',
        payload,
      }, ...current].slice(0, 30);
    });
  }, [singleItemReport]);

  const downloadReport = (report) => buildPdf(report).save(`${report.reference}-${report.subject.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}.pdf`);

  const toggleReportWatchlist = async () => {
    const entity = fullEntityReport?.entity || singleItemReport?.entity;
    if (!entity?.rawId || reportWatchlistBusy) return;
    setReportWatchlistBusy(true);
    try {
      if (reportWatchlist.isIn) {
        await apiDelete(`/watchlist/${reportWatchlist.id}`);
        setReportWatchlist({ isIn: false, id: null });
      } else {
        const item = await apiPost('/watchlist/', {
          entity_type: entity.watchlistType,
          entity_id: entity.rawId,
          notify_on_new_cases: true,
          notify_on_risk_change: true,
          notify_on_regulatory_updates: false,
        });
        setReportWatchlist({ isIn: true, id: item.id });
      }
    } catch (requestError) {
      setError(requestError.message || 'The watchlist could not be updated.');
    } finally {
      setReportWatchlistBusy(false);
    }
  };

  if (fullEntityReport) return <FullEntityReportView report={fullEntityReport} onBack={() => { sessionStorage.setItem('juridence_return_entity', JSON.stringify({ entity: fullEntityReport.entity, tab: fullEntityReport.returnTab || 'summary' })); setFullEntityReport(null); sessionStorage.removeItem('juridence_full_entity_report'); onNavigate?.('dashboard-search'); }} onToggleWatchlist={toggleReportWatchlist} watchlist={reportWatchlist} watchlistBusy={reportWatchlistBusy} />;

  if (singleItemReport) return <SingleItemReportView report={singleItemReport} onBack={() => { sessionStorage.setItem('juridence_return_entity', JSON.stringify({ entity: singleItemReport.entity, tab: singleItemReport.returnTab || 'judgments' })); setSingleItemReport(null); sessionStorage.removeItem('juridence_single_item_report'); onNavigate?.('dashboard-search'); }} onToggleWatchlist={toggleReportWatchlist} watchlist={reportWatchlist} watchlistBusy={reportWatchlistBusy} />;

  return (
    <section className="dd-module-shell">
      <div className="dd-module-heading"><div><p className="dd-eyebrow">Documented screening</p><h2>Due Diligence Reports</h2><p>Create full entity reports or focused single-item reports after confirming the subject.</p></div><span className="dd-count-badge"><FileText size={14} /> {history.length} generated</span></div>
      <div className="dd-module-grid">
        <div className="dd-panel">
          <div className="dd-panel-header"><div><h3>New report</h3><p>Reports begin with a confirmed entity or individual.</p></div></div>
          <div className="dd-panel-body">
            {error && <div className="dd-inline-alert is-error">{error}</div>}
            <div className="dd-report-start"><ol><li>Search and confirm the subject.</li><li>Review record counts across every database.</li><li>Create a full entity report or select one item.</li></ol><button type="button" className="dd-button dd-button-primary" onClick={() => onNavigate?.('dashboard-search')}>Begin entity enquiry <ArrowRight size={15} /></button></div>
          </div>
        </div>

        <div className="dd-panel">
          <div className="dd-panel-header"><div><h3>Report history</h3><p>Recent reports generated in this browser.</p></div></div>
          {!history.length ? <div className="dd-empty-state"><FileText size={28} /><h3>No reports generated</h3><p>Completed reports will be retained here for quick reference.</p></div> : <div className="dd-results-list">{history.map((report) => <article className="dd-history-row" key={report.id}><span className="dd-document-icon"><FileText size={17} /></span><div><strong>{report.subject}</strong><span>{report.reference} · {new Date(report.createdAt).toLocaleString('en-GB')}</span></div><span className={`dd-status-pill ${report.total ? 'is-review' : 'is-clear'}`}>{report.kind === 'single-item' ? 'Single item' : report.kind === 'full-entity' ? 'Full entity' : `${report.total} match${report.total === 1 ? '' : 'es'}`}</span>{!report.kind && <button type="button" className="dd-icon-button" onClick={() => downloadReport(report)} aria-label={`Download report for ${report.subject}`}><Download size={15} /></button>}</article>)}</div>}
        </div>
      </div>
    </section>
  );
};

export default DueDiligenceReportsPage;
