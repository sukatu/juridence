import React, { useEffect, useMemo, useState } from 'react';
import { Bell, BellRing, Building2, ChevronRight, Loader2, Plus, RefreshCw, Search, Trash2, UserRound, X } from 'lucide-react';
import { apiDelete, apiGet, apiPost, apiPut } from '../../utils/api';

const ENTITY_TYPES = {
  people: 'person',
  banks: 'bank',
  insurance: 'insurance',
  companies: 'company',
};

const ENTITY_SOURCE_TYPES = {
  person: 'people',
  bank: 'banks',
  insurance: 'insurance',
  company: 'companies',
};

const formatDate = (value) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'Not recorded' : date.toLocaleDateString('en-GB');
};

const WatchlistPage = ({ onNavigate }) => {
  const [items, setItems] = useState([]);
  const [query, setQuery] = useState('');
  const [candidates, setCandidates] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [watchlistFilter, setWatchlistFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [busyId, setBusyId] = useState('');
  const [loadError, setLoadError] = useState('');
  const [searchError, setSearchError] = useState('');
  const [actionError, setActionError] = useState('');

  const loadItems = async () => {
    try {
      setLoading(true);
      setItems(await apiGet('/watchlist/'));
      setLoadError('');
    } catch (requestError) {
      setLoadError(requestError.message || 'The watchlist could not be loaded.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadItems(); }, []);

  const searchEntities = async (event) => {
    event.preventDefault();
    const cleaned = query.trim();
    if (cleaned.length < 3) return;
    setSearching(true);
    setHasSearched(true);
    setCandidates([]);
    setSearchError('');
    try {
      const response = await apiGet('/search/unified', {
        query: cleaned,
        search_type: 'all',
        identity_only: true,
        page: 1,
        limit: 24,
      });
      const results = (response.results || [])
        .map((entity) => ({
          ...entity,
          entity_type: ENTITY_TYPES[entity.type],
          display_name: entity.name,
          detail: entity.description,
        }))
        .filter((entity) => entity.id && entity.entity_type && entity.display_name);
      const unique = new Map(results.map((entity) => [`${entity.entity_type}-${entity.id}`, entity]));
      setCandidates(Array.from(unique.values()).filter((entity) => !items.some((item) => item.entity_type === entity.entity_type && item.entity_id === entity.id)));
    } catch (requestError) {
      setSearchError(requestError.message || 'The entity index could not be searched.');
    } finally {
      setSearching(false);
    }
  };

  const addItem = async (entity) => {
    const key = `${entity.entity_type}-${entity.id}`;
    setBusyId(key);
    setActionError('');
    try {
      const created = await apiPost('/watchlist/', { entity_type: entity.entity_type, entity_id: entity.id, notify_on_new_cases: true, notify_on_risk_change: true, notify_on_regulatory_updates: false });
      setCandidates((current) => current.filter((candidate) => `${candidate.entity_type}-${candidate.id}` !== key));
      setItems((current) => [created, ...current]);
    } catch (requestError) {
      setActionError(requestError.message || 'The entity could not be added to the watchlist.');
    } finally {
      setBusyId('');
    }
  };

  const updateItem = async (item, field) => {
    setBusyId(`watch-${item.id}`);
    setActionError('');
    try {
      const updated = await apiPut(`/watchlist/${item.id}`, { [field]: !item[field] });
      setItems((current) => current.map((entry) => entry.id === item.id ? updated : entry));
    } catch (requestError) {
      setActionError(requestError.message || 'The notification preference could not be saved.');
    } finally {
      setBusyId('');
    }
  };

  const removeItem = async (item) => {
    if (!window.confirm(`Stop monitoring ${item.entity_name}?`)) return;
    setBusyId(`watch-${item.id}`);
    setActionError('');
    try {
      await apiDelete(`/watchlist/${item.id}`);
      setItems((current) => current.filter((entry) => entry.id !== item.id));
    } catch (requestError) {
      setActionError(requestError.message || 'The entity could not be removed from the watchlist.');
    } finally {
      setBusyId('');
    }
  };

  const openItem = (item) => {
    if (!onNavigate) return;
    const isPerson = item.entity_type === 'person';
    const entity = {
      id: `${isPerson ? 'PE' : 'EN'}-${String(item.entity_id).padStart(6, '0')}`,
      rawId: item.entity_id,
      name: item.entity_name,
      type: isPerson ? 'Individual' : 'Company',
      sourceType: ENTITY_SOURCE_TYPES[item.entity_type] || 'companies',
      watchlistType: item.entity_type,
      aliases: [],
      pending: 0,
      judgments: 0,
      registryNotice: null,
      risk: 'Standard',
    };
    sessionStorage.setItem('juridence_return_entity', JSON.stringify({ entity, tab: 'summary' }));
    onNavigate('dashboard-search');
  };

  const filteredItems = useMemo(() => {
    const filter = watchlistFilter.trim().toLowerCase();
    if (!filter) return items;
    return items.filter((item) => [item.entity_name, item.entity_type, item.notes]
      .some((value) => String(value || '').toLowerCase().includes(filter)));
  }, [items, watchlistFilter]);

  return (
    <section className="dd-module-shell">
      <div className="dd-module-heading"><div><p className="dd-eyebrow">Continuous monitoring</p><h2>Watchlist</h2><p>Monitor counterparties for new cases, risk changes and regulatory updates.</p></div><span className="dd-count-badge"><BellRing size={14} /> {items.length} monitored</span></div>
      {actionError && <div className="dd-inline-alert is-error"><span>{actionError}</span><button type="button" onClick={() => setActionError('')} aria-label="Dismiss"><X size={14} /></button></div>}
      <div className="dd-panel dd-watch-search">
        <div className="dd-panel-header"><div><h3>Add an entity</h3><p>Search the canonical people, company, bank and insurer index.</p></div></div>
        <form className="dd-inline-form" onSubmit={searchEntities}><label className="dd-search-control"><Search size={16} /><input value={query} onChange={(event) => { setQuery(event.target.value); setCandidates([]); setHasSearched(false); setSearchError(''); }} placeholder="Search by person or organisation name" /></label><button className="dd-button dd-button-primary" disabled={searching || query.trim().length < 3}>{searching ? <Loader2 size={15} className="dd-spin" /> : <Search size={15} />} Search</button></form>
        {searchError && <div className="dd-inline-alert is-error dd-watch-search-error"><span>{searchError}</span><button type="button" onClick={() => setSearchError('')} aria-label="Dismiss search error"><X size={14} /></button></div>}
        {candidates.length > 0 && <div className="dd-candidate-grid">{candidates.map((entity) => {
          const key = `${entity.entity_type}-${entity.id}`;
          return <article key={key} className="dd-candidate"><span className="dd-entity-icon">{entity.entity_type === 'person' ? <UserRound size={16} /> : <Building2 size={16} />}</span><div><strong>{entity.display_name || 'Unnamed entity'}</strong><span>{entity.entity_type}{entity.detail ? ` · ${entity.detail}` : ''}</span></div><button type="button" className="dd-icon-button" onClick={() => addItem(entity)} disabled={busyId === key} aria-label={`Monitor ${entity.display_name}`}>{busyId === key ? <Loader2 size={15} className="dd-spin" /> : <Plus size={15} />}</button></article>;
        })}</div>}
        {!searching && hasSearched && !searchError && !candidates.length && <p className="dd-form-note">No unmonitored entities matched this search.</p>}
      </div>

      <div className="dd-panel">
        <div className="dd-panel-header dd-watchlist-header"><div><h3>Monitoring rules</h3><p>Notification preferences are saved separately for each entity.</p></div>{items.length > 0 && <label className="dd-search-control dd-watch-filter"><Search size={14} /><input value={watchlistFilter} onChange={(event) => setWatchlistFilter(event.target.value)} placeholder="Filter monitored entities" aria-label="Filter monitored entities" /></label>}</div>
        {loading ? <div className="dd-loading-state"><Loader2 size={22} className="dd-spin" /> Loading watchlist</div> : loadError ? <div className="dd-empty-state"><Bell size={28} /><h3>Watchlist unavailable</h3><p>{loadError}</p><button type="button" className="dd-button dd-button-secondary" onClick={loadItems}><RefreshCw size={14} /> Retry</button></div> : !items.length ? <div className="dd-empty-state"><Bell size={28} /><h3>Your watchlist is empty</h3><p>Search above to start monitoring a counterparty.</p></div> : !filteredItems.length ? <div className="dd-empty-state"><Search size={28} /><h3>No monitored entities found</h3><p>Try a different name or entity type.</p></div> : <div className="dd-table-wrap dd-watch-table"><table className="dd-data-table"><thead><tr><th>Entity</th><th>Type</th><th>New cases</th><th>Risk changes</th><th>Regulatory</th><th>Added</th><th aria-label="Actions" /></tr></thead><tbody>{filteredItems.map((item) => <tr key={item.id}><td><button type="button" className="dd-entity-link" onClick={() => openItem(item)} disabled={!onNavigate}><strong>{item.entity_name || 'Unnamed entity'}</strong><ChevronRight size={14} /></button>{item.notes && <small>{item.notes}</small>}</td><td><span className="dd-type-label">{item.entity_type}</span></td>{[['notify_on_new_cases', 'new cases'], ['notify_on_risk_change', 'risk changes'], ['notify_on_regulatory_updates', 'regulatory updates']].map(([field, label]) => <td key={field}><label className="dd-switch"><input type="checkbox" checked={Boolean(item[field])} onChange={() => updateItem(item, field)} disabled={busyId === `watch-${item.id}`} aria-label={`Notify on ${label} for ${item.entity_name}`} /><span /></label></td>)}<td>{formatDate(item.created_at)}</td><td><button type="button" className="dd-icon-button is-danger" onClick={() => removeItem(item)} disabled={busyId === `watch-${item.id}`} aria-label={`Remove ${item.entity_name}`} title="Remove from watchlist">{busyId === `watch-${item.id}` ? <Loader2 size={15} className="dd-spin" /> : <Trash2 size={15} />}</button></td></tr>)}</tbody></table></div>}
      </div>
    </section>
  );
};

export default WatchlistPage;
