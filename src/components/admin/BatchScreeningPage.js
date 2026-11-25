import React, { useMemo, useRef, useState } from 'react';
import { Download, FileUp, Loader2, Play, RotateCcw, SearchCheck } from 'lucide-react';
import * as XLSX from 'xlsx';
import { apiGet } from '../../utils/api';

const normaliseNames = (value) => Array.from(new Set(
  value
    .split(/[\n,;]+/)
    .map((name) => name.trim())
    .filter(Boolean)
));

const csvCell = (value) => `"${String(value ?? '').replace(/"/g, '""')}"`;

const BatchScreeningPage = ({ onNavigate }) => {
  const [input, setInput] = useState('');
  const [results, setResults] = useState([]);
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const runRef = useRef(0);
  const names = useMemo(() => normaliseNames(input), [input]);

  const loadFile = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const workbook = XLSX.read(await file.arrayBuffer(), { type: 'array' });
      const rows = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]], { header: 1, blankrows: false });
      const values = rows
        .map((row) => row.find((cell) => typeof cell === 'string' && cell.trim()))
        .filter(Boolean)
        .filter((value, index) => !(index === 0 && /^(name|entity|party|customer)$/i.test(value.trim())));
      setInput(values.join('\n'));
      setResults([]);
      setError('');
    } catch (fileError) {
      setError(`Could not read ${file.name}. Please use a CSV, XLS, XLSX or text file.`);
    } finally {
      event.target.value = '';
    }
  };

  const runScreening = async () => {
    if (!names.length || running) return;
    const currentRun = runRef.current + 1;
    runRef.current = currentRun;
    setRunning(true);
    setResults([]);
    setProgress(0);
    setError('');

    const completed = [];
    for (let index = 0; index < names.length; index += 5) {
      const batch = names.slice(index, index + 5);
      const batchResults = await Promise.all(batch.map(async (name) => {
        try {
          const response = await apiGet('/dashboard-search/pending-cases', { q: name, page: 1, limit: 5 });
          return { name, total: response.total || 0, matches: response.results || [], status: 'complete' };
        } catch (requestError) {
          return { name, total: 0, matches: [], status: 'error', error: requestError.message };
        }
      }));
      if (runRef.current !== currentRun) return;
      completed.push(...batchResults);
      setResults([...completed]);
      setProgress(Math.round((completed.length / names.length) * 100));
    }
    setRunning(false);
  };

  const reset = () => {
    runRef.current += 1;
    setInput('');
    setResults([]);
    setRunning(false);
    setProgress(0);
    setError('');
  };

  const exportResults = () => {
    const rows = [['Screened name', 'Status', 'Matches', 'Case title', 'Suit number', 'Court', 'Source bank']];
    results.forEach((result) => {
      if (!result.matches.length) rows.push([result.name, result.status === 'error' ? 'Error' : 'No match', 0, '', '', '', '']);
      result.matches.forEach((match) => rows.push([
        result.name,
        'Potential match',
        result.total,
        match.case_title,
        match.suit_number,
        match.court_type,
        match.source_bank,
      ]));
    });
    const blob = new Blob([rows.map((row) => row.map(csvCell).join(',')).join('\n')], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `juridence-batch-screening-${new Date().toISOString().slice(0, 10)}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const matchedCount = results.filter((result) => result.total > 0).length;

  return (
    <section className="dd-module-shell">
      <div className="dd-module-heading">
        <div><p className="dd-eyebrow">Bulk enquiry</p><h2>Batch Screening</h2><p>Screen a list of counterparties against indexed pending court cases.</p></div>
        <div className="dd-heading-actions">
          <label className="dd-button dd-button-secondary"><FileUp size={15} /> Import file<input type="file" accept=".csv,.txt,.xls,.xlsx" onChange={loadFile} hidden /></label>
          <button className="dd-button dd-button-secondary" type="button" onClick={reset}><RotateCcw size={15} /> Reset</button>
        </div>
      </div>

      <div className="dd-module-grid dd-module-grid-wide">
        <div className="dd-panel">
          <div className="dd-panel-header"><div><h3>Names to screen</h3><p>Enter one name per line, or separate names with commas.</p></div><span className="dd-count-badge">{names.length} names</span></div>
          <div className="dd-panel-body">
            <textarea className="dd-textarea" rows="13" value={input} onChange={(event) => setInput(event.target.value)} placeholder={'PHILLIP OFORI-ASANTE\nACME TRADING LIMITED\nAMA MENSAH'} />
            {error && <div className="dd-inline-alert is-error">{error}</div>}
            <button className="dd-button dd-button-primary dd-button-block" type="button" disabled={!names.length || running} onClick={runScreening}>
              {running ? <Loader2 size={16} className="dd-spin" /> : <Play size={16} />}{running ? `Screening ${progress}%` : 'Run batch screening'}
            </button>
          </div>
        </div>

        <div className="dd-panel">
          <div className="dd-panel-header"><div><h3>Screening results</h3><p>Matches require human review before a decision is made.</p></div>{results.length > 0 && <button type="button" className="dd-icon-text-button" onClick={exportResults}><Download size={15} /> Export CSV</button>}</div>
          {running && <div className="dd-progress"><span style={{ width: `${progress}%` }} /></div>}
          {!results.length && !running ? (
            <div className="dd-empty-state"><SearchCheck size={28} /><h3>No screening run yet</h3><p>Your completed results will appear here.</p></div>
          ) : (
            <div className="dd-results-list">
              <div className="dd-summary-strip"><span><strong>{results.length}</strong> screened</span><span><strong>{matchedCount}</strong> potential matches</span><span><strong>{results.length - matchedCount}</strong> no matches</span></div>
              {results.map((result) => (
                <article className="dd-screening-row" key={result.name}>
                  <div><strong>{result.name}</strong><span>{result.status === 'error' ? result.error : result.total ? `${result.total} indexed case${result.total === 1 ? '' : 's'}` : 'No indexed pending case found'}</span></div>
                  <span className={`dd-status-pill ${result.status === 'error' ? 'is-error' : result.total ? 'is-review' : 'is-clear'}`}>{result.status === 'error' ? 'Error' : result.total ? 'Review' : 'Clear'}</span>
                  {result.matches[0] && <button type="button" className="dd-link-button" onClick={() => onNavigate?.('dashboard-search')}>Open search</button>}
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default BatchScreeningPage;
