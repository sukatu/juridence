import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  CalendarDays,
  Check,
  ChevronDown,
  Database,
  FileSearch,
  Landmark,
  Loader2,
  Search,
  UserRound,
  X,
} from 'lucide-react';

import { apiGet } from '../../utils/api';
import { Badge, Button } from '../ui';
import AdminHeader from './AdminHeader';


const formatNumber = (value) => Number(value || 0).toLocaleString();

const formatDate = (value) => {
  if (!value) return 'Date unavailable';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Date unavailable';
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
};

const formatCourtType = (value) => {
  const courtTypes = { H: 'High Court', HC: 'High Court', CA: 'Court of Appeal', SC: 'Supreme Court' };
  return courtTypes[String(value || '').toUpperCase()] || value || 'Court not specified';
};

const statusVariant = (status) => {
  const normalized = String(status || '').toLowerCase();
  if (normalized.includes('closed') || normalized.includes('granted') || normalized.includes('judgment')) return 'success';
  if (normalized.includes('denied') || normalized.includes('dismissed') || normalized.includes('struck')) return 'danger';
  if (normalized.includes('hearing') || normalized.includes('process')) return 'warning';
  return 'info';
};

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const getHighlightPatterns = (query) => {
  const variants = new Set();
  String(query || '').trim().split(/\s+/).filter(Boolean).forEach((token) => {
    variants.add(token);
    variants.add(token.replace(/(.)\1+/gi, '$1'));
    if (token.length >= 4) {
      [...token].forEach((character, index) => {
        variants.add(`${token.slice(0, index)}${character}${token.slice(index)}`);
      });
    }
  });
  return [...variants].filter(Boolean).sort((left, right) => right.length - left.length).map(escapeRegExp);
};

const HighlightedText = ({ text, query }) => {
  const value = String(text || '');
  const patterns = getHighlightPatterns(query);
  if (!value || patterns.length === 0) return value;

  const source = patterns.join('|');
  const splitPattern = new RegExp(`(${source})`, 'gi');
  const matchPattern = new RegExp(`^(?:${source})$`, 'i');

  return value.split(splitPattern).map((part, index) => (
    matchPattern.test(part)
      ? <mark key={`${part}-${index}`} className="rounded-sm bg-[#ffe59a] px-0.5 text-[#17334a]">{part}</mark>
      : <React.Fragment key={`${part}-${index}`}>{part}</React.Fragment>
  ));
};

const BankFilterCombobox = ({ sources = [], value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filterQuery, setFilterQuery] = useState('');
  const containerRef = useRef(null);
  const searchRef = useRef(null);
  const selectedSource = sources.find((source) => String(source.id) === String(value));
  const normalizedFilter = filterQuery.trim().toLowerCase();
  const filteredSources = normalizedFilter
    ? sources.filter((source) => source.name.toLowerCase().includes(normalizedFilter))
    : sources;

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  useEffect(() => {
    if (isOpen) window.setTimeout(() => searchRef.current?.focus(), 0);
    else setFilterQuery('');
  }, [isOpen]);

  const selectBank = (nextValue) => {
    onChange(nextValue);
    setIsOpen(false);
    setFilterQuery('');
  };

  return (
    <div ref={containerRef} className="relative w-full sm:w-72">
      <div className="ui-control flex items-center overflow-hidden p-0">
        <button
          type="button"
          onClick={() => setIsOpen((open) => !open)}
          className="flex min-w-0 flex-1 items-center gap-2 border-0 bg-transparent px-3.5 text-left text-sm font-medium text-[#20384c]"
          aria-haspopup="listbox"
          aria-expanded={isOpen}
        >
          <Building2 size={16} className="shrink-0 text-[#71838d]" />
          <span className="min-w-0 flex-1 truncate">{selectedSource?.name || 'All indexed banks'}</span>
          <ChevronDown size={16} className={`shrink-0 text-[#71838d] transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>
        {selectedSource && (
          <button
            type="button"
            onClick={() => selectBank('')}
            className="mr-1 flex h-8 w-8 shrink-0 items-center justify-center text-[#71838d] hover:bg-[#eef3f4] hover:text-[#17334a]"
            aria-label="Clear bank filter"
            title="Clear bank filter"
          >
            <X size={15} />
          </button>
        )}
      </div>

      {isOpen && (
        <div className="absolute right-0 z-40 mt-2 w-full min-w-[280px] overflow-hidden rounded-md border border-[#d7e1e5] bg-white shadow-[0_14px_36px_rgba(10,35,53,0.16)]">
          <div className="border-b border-[#e3eaed] p-3">
            <div className="flex h-10 items-center gap-2 rounded-md border border-[#bdcbd1] bg-white px-3 focus-within:border-[#17875a]">
              <Search size={15} className="shrink-0 text-[#71838d]" />
              <input
                ref={searchRef}
                type="search"
                value={filterQuery}
                onChange={(event) => setFilterQuery(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Escape') setIsOpen(false);
                  if (event.key === 'Enter' && filteredSources.length > 0) selectBank(String(filteredSources[0].id));
                }}
                placeholder="Search banks"
                className="h-full min-w-0 flex-1 border-0 bg-transparent p-0 text-sm outline-none focus:shadow-none focus-visible:outline-none"
                aria-label="Search bank filters"
              />
            </div>
          </div>

          <div className="max-h-64 overflow-y-auto p-1.5" role="listbox" aria-label="Bank filters">
            <button
              type="button"
              onClick={() => selectBank('')}
              className="flex min-h-10 w-full items-center gap-3 px-3 py-2 text-left text-sm text-[#405867] hover:bg-[#f2f6f6]"
              role="option"
              aria-selected={!selectedSource}
            >
              <span className="flex h-5 w-5 shrink-0 items-center justify-center text-[#17875a]">{!selectedSource && <Check size={15} />}</span>
              <span className="flex-1">All indexed banks</span>
            </button>

            {filteredSources.map((source) => {
              const selected = String(source.id) === String(value);
              return (
                <button
                  key={source.id}
                  type="button"
                  onClick={() => selectBank(String(source.id))}
                  className={`flex min-h-10 w-full items-center gap-3 px-3 py-2 text-left text-sm hover:bg-[#f2f6f6] ${selected ? 'bg-[#eef8f3] text-[#0c6b4a]' : 'text-[#405867]'}`}
                  role="option"
                  aria-selected={selected}
                >
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center text-[#17875a]">{selected && <Check size={15} />}</span>
                  <span className="min-w-0 flex-1 truncate">{source.name}</span>
                  <span className="text-xs text-[#829099]">{formatNumber(source.case_count)}</span>
                </button>
              );
            })}

            {filteredSources.length === 0 && (
              <p className="px-3 py-5 text-center text-sm text-[#71818a]">No bank matches “{filterQuery}”</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const DashboardSearchHome = ({ userInfo, onNavigate, onLogout }) => {
  const [query, setQuery] = useState('');
  const [submittedQuery, setSubmittedQuery] = useState('');
  const [bankId, setBankId] = useState('');
  const [stats, setStats] = useState({ indexed_parties: 0, pending_cases: 0, source_banks: 0, sources: [] });
  const [results, setResults] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState('');

  const runSearch = useCallback(async (searchQuery, nextPage = 1, sourceBank = '') => {
    setLoading(true);
    setError('');
    try {
      const data = await apiGet('/dashboard-search/pending-cases', {
        q: searchQuery,
        page: nextPage,
        limit: 10,
        bank_id: sourceBank,
      });
      setResults(data.results || []);
      setPage(data.page || nextPage);
      setTotal(data.total || 0);
      setTotalPages(data.total_pages || 0);
    } catch (requestError) {
      setResults([]);
      setError(requestError.message || 'The case index could not be searched.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const loadLandingData = async () => {
      try {
        const statsData = await apiGet('/dashboard-search/stats');
        setStats(statsData);
      } catch (requestError) {
        setError(requestError.message || 'Search coverage is unavailable.');
      }
    };
    loadLandingData();
  }, []);

  const clearSearch = () => {
    setQuery('');
    setSubmittedQuery('');
    setResults([]);
    setPage(1);
    setTotal(0);
    setTotalPages(0);
    setBankId('');
    setError('');
    setHasSearched(false);
  };

  const handleQueryChange = (event) => {
    const nextQuery = event.target.value;
    setQuery(nextQuery);
    if (!nextQuery.trim()) clearSearch();
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const cleanedQuery = query.trim();
    if (!cleanedQuery) return;
    setSubmittedQuery(cleanedQuery);
    setHasSearched(true);
    runSearch(cleanedQuery, 1, bankId);
  };

  const handleBankChange = (nextBankId) => {
    setBankId(nextBankId);
    runSearch(submittedQuery, 1, nextBankId);
  };

  const changePage = (nextPage) => {
    runSearch(submittedQuery, nextPage, bankId);
    window.scrollTo({ top: 250, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#f4f7f8]">
      <AdminHeader userInfo={userInfo} onNavigate={onNavigate} onLogout={onLogout} contextLabel="Database search" />

      <main className={`mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8 ${hasSearched ? 'py-7 lg:py-9' : 'flex min-h-[calc(100vh-72px)] items-center py-8'}`}>
        <section className={`w-full overflow-hidden rounded-md bg-[#0b2942] text-white shadow-[0_10px_28px_rgba(7,27,47,0.14)] ${hasSearched ? '' : 'mx-auto max-w-[1120px]'}`}>
          <div className="px-5 py-7 sm:px-8 sm:py-9 lg:px-10">
            <div className="flex max-w-3xl items-center gap-2 text-sm font-semibold text-[#86e4bd]">
              <Database size={16} /> Juridence database search
            </div>
            <h1 className="mt-3 text-2xl font-semibold leading-tight sm:text-3xl">Find the case behind a name</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#c6d5dd]">
              Search pending bank cases by any part of a party name, case title, or suit number.
            </p>

            <form onSubmit={handleSubmit} className="mt-6 flex max-w-4xl flex-col gap-3 sm:flex-row">
              <label htmlFor="dashboard-case-search" className="sr-only">Search pending cases</label>
              <div className="flex min-h-[50px] min-w-0 flex-1 items-center gap-3 rounded-md bg-white px-4 text-[#17334a] shadow-sm">
                <Search size={20} className="shrink-0 text-[#607985]" />
                <input
                  id="dashboard-case-search"
                  type="search"
                  value={query}
                  onChange={handleQueryChange}
                  placeholder="Try Philip Ofori, OFORI Asante, or GJ/0622/2020"
                  className="dashboard-search-input h-12 min-w-0 flex-1 border-0 bg-transparent p-0 text-sm outline-none focus:shadow-none focus-visible:outline-none placeholder:text-[#8b989f]"
                />
              </div>
              <Button type="submit" size="lg" loading={loading} disabled={!query.trim()} icon={<Search size={17} />} className="min-h-[50px] border border-[#56d39f] !bg-[#17875a] px-6 hover:!bg-[#0c6b4a] disabled:opacity-50">
                Search cases
              </Button>
            </form>
          </div>

          <div className="grid border-t border-white/10 bg-[#071f34] sm:grid-cols-3">
            {[
              ['Indexed party records', stats.indexed_parties, UserRound],
              ['Pending cases', stats.pending_cases, FileSearch],
              ['Bank sources', stats.source_banks, Building2],
            ].map(([label, value, Icon], index) => (
              <div key={label} className={`flex items-center gap-3 px-5 py-4 sm:px-8 ${index > 0 ? 'border-t border-white/10 sm:border-l sm:border-t-0' : ''}`}>
                <Icon size={18} className="text-[#86e4bd]" />
                <div>
                  <p className="text-lg font-semibold">{formatNumber(value)}</p>
                  <p className="text-xs text-[#aebfc8]">{label}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {hasSearched && <section className="relative mt-7 rounded-md border border-[#dce5e9] bg-white shadow-[0_3px_12px_rgba(10,35,53,0.04)]" aria-labelledby="search-results-heading">
          <div className="flex flex-col gap-4 border-b border-[#e3eaed] px-5 py-4 sm:flex-row sm:items-end sm:justify-between sm:px-6">
            <div>
              <h2 id="search-results-heading" className="font-semibold text-[#17334a]">
                {submittedQuery ? `Results for “${submittedQuery}”` : 'Recently created pending cases'}
              </h2>
              <p className="mt-1 text-xs text-[#7a8991]">
                {loading ? 'Searching the party index' : `${formatNumber(total)} ${total === 1 ? 'case' : 'cases'} found`}
              </p>
            </div>
            <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
              <BankFilterCombobox sources={stats.sources || []} value={bankId} onChange={handleBankChange} />
              <Button variant="outline" icon={<X size={15} />} onClick={clearSearch} className="shrink-0">Clear results</Button>
            </div>
          </div>

          {error && (
            <div className="border-b border-[#f1c7cd] bg-[#fff5f6] px-5 py-4 text-sm text-[#a82e3d] sm:px-6" role="alert">{error}</div>
          )}

          {loading ? (
            <div className="flex min-h-[300px] items-center justify-center gap-3 text-sm text-[#60737d]">
              <Loader2 size={20} className="animate-spin text-[#17875a]" /> Searching case records
            </div>
          ) : results.length === 0 ? (
            <div className="flex min-h-[300px] flex-col items-center justify-center px-6 text-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#eef4f5] text-[#607985]"><FileSearch size={22} /></span>
              <h3 className="mt-4 font-semibold text-[#17334a]">No matching pending case</h3>
              <p className="mt-1 max-w-md text-sm leading-6 text-[#71818a]">Try one name at a time, another part of the party name, or the suit number.</p>
            </div>
          ) : (
            <div className="divide-y divide-[#e7edef]">
              {results.map((result) => (
                <article key={`${result.source_bank_id}-${result.case_id}`} className="px-5 py-5 transition-colors hover:bg-[#f8faf9] sm:px-6">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant={statusVariant(result.status)}>{result.status || 'Pending'}</Badge>
                        <span className="text-xs font-medium text-[#71818a]"><HighlightedText text={result.source_bank} query={submittedQuery} /></span>
                      </div>
                      <h3 className="mt-3 text-[15px] font-semibold leading-6 text-[#17334a]"><HighlightedText text={result.case_title || 'Untitled case'} query={submittedQuery} /></h3>
                      {result.matched_party && (
                        <p className="mt-2 flex items-center gap-2 text-sm text-[#405867]">
                          <UserRound size={15} className="shrink-0 text-[#17875a]" />
                          <span><span className="text-[#71818a]">Matched party:</span> <strong className="font-semibold"><HighlightedText text={result.matched_party} query={submittedQuery} /></strong></span>
                        </p>
                      )}
                    </div>

                    <dl className="grid shrink-0 gap-x-6 gap-y-3 text-sm sm:grid-cols-3 lg:w-[570px]">
                      <div>
                        <dt className="flex items-center gap-1.5 text-xs font-medium text-[#7a8991]"><FileSearch size={14} /> Suit number</dt>
                        <dd className="mt-1 font-semibold text-[#20384c]"><HighlightedText text={result.suit_number || 'Not recorded'} query={submittedQuery} /></dd>
                      </div>
                      <div>
                        <dt className="flex items-center gap-1.5 text-xs font-medium text-[#7a8991]"><Landmark size={14} /> Court</dt>
                        <dd className="mt-1 font-semibold text-[#20384c]">{formatCourtType(result.court_type)}</dd>
                      </div>
                      <div>
                        <dt className="flex items-center gap-1.5 text-xs font-medium text-[#7a8991]"><CalendarDays size={14} /> Created</dt>
                        <dd className="mt-1 font-semibold text-[#20384c]">{formatDate(result.created_on)}</dd>
                      </div>
                    </dl>
                  </div>
                </article>
              ))}
            </div>
          )}

          {totalPages > 1 && !loading && (
            <div className="flex items-center justify-between border-t border-[#e3eaed] px-5 py-4 sm:px-6">
              <p className="text-xs text-[#71818a]">Page {page} of {totalPages}</p>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" icon={<ArrowLeft size={15} />} disabled={page <= 1} onClick={() => changePage(page - 1)}>Previous</Button>
                <Button variant="outline" size="sm" icon={<ArrowRight size={15} />} iconPosition="right" disabled={page >= totalPages} onClick={() => changePage(page + 1)}>Next</Button>
              </div>
            </div>
          )}
        </section>}
      </main>
    </div>
  );
};

export default DashboardSearchHome;
