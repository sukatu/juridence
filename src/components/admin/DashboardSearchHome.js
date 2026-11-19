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
import Button from '../Button';
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

const badgeClasses = {
  success: 'bg-[#30AB401A] text-[#188A27]',
  danger: 'bg-[#EF44441A] text-[#DC2626]',
  warning: 'bg-[#F36F261A] text-[#B45309]',
  info: 'bg-[#3B82F61A] text-[#2563EB]',
};

const Badge = ({ variant = 'info', children }) => (
  <span className={`inline-flex min-h-6 items-center rounded-full px-2.5 py-1 text-xs font-medium ${badgeClasses[variant] || badgeClasses.info}`}>
    {children}
  </span>
);

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
      <div className="flex min-h-11 items-center overflow-hidden rounded-lg border border-[#DDE1E6] bg-white p-0 transition-colors focus-within:border-[#022658]">
        <button
          type="button"
          onClick={() => setIsOpen((open) => !open)}
          className="flex min-w-0 flex-1 items-center gap-2 border-0 bg-transparent px-3.5 text-left text-sm font-medium text-[#050F1C]"
          aria-haspopup="listbox"
          aria-expanded={isOpen}
        >
          <Building2 size={16} className="shrink-0 text-[#525866]" />
          <span className="min-w-0 flex-1 truncate">{selectedSource?.name || 'All indexed banks'}</span>
          <ChevronDown size={16} className={`shrink-0 text-[#525866] transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>
        {selectedSource && (
          <button
            type="button"
            onClick={() => selectBank('')}
            className="mr-1 flex h-8 w-8 shrink-0 items-center justify-center rounded text-[#525866] hover:bg-[#F2F4F7] hover:text-[#050F1C]"
            aria-label="Clear bank filter"
            title="Clear bank filter"
          >
            <X size={15} />
          </button>
        )}
      </div>

      {isOpen && (
        <div className="absolute right-0 z-40 mt-2 w-full min-w-[280px] overflow-hidden rounded-lg border border-[#DDE1E6] bg-white shadow-lg">
          <div className="border-b border-[#E5E8EC] p-3">
            <div className="flex h-10 items-center gap-2 rounded-lg border border-[#DDE1E6] bg-white px-3 focus-within:border-[#022658]">
              <Search size={15} className="shrink-0 text-[#525866]" />
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
              className="flex min-h-10 w-full items-center gap-3 rounded px-3 py-2 text-left text-sm text-[#050F1C] hover:bg-[#F7F9FC]"
              role="option"
              aria-selected={!selectedSource}
            >
              <span className="flex h-5 w-5 shrink-0 items-center justify-center text-[#022658]">{!selectedSource && <Check size={15} />}</span>
              <span className="flex-1">All indexed banks</span>
            </button>

            {filteredSources.map((source) => {
              const selected = String(source.id) === String(value);
              return (
                <button
                  key={source.id}
                  type="button"
                  onClick={() => selectBank(String(source.id))}
                  className={`flex min-h-10 w-full items-center gap-3 rounded px-3 py-2 text-left text-sm hover:bg-[#F7F9FC] ${selected ? 'bg-[#EAF2FF] text-[#022658]' : 'text-[#050F1C]'}`}
                  role="option"
                  aria-selected={selected}
                >
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center text-[#022658]">{selected && <Check size={15} />}</span>
                  <span className="min-w-0 flex-1 truncate">{source.name}</span>
                  <span className="text-xs text-[#829099]">{formatNumber(source.case_count)}</span>
                </button>
              );
            })}

            {filteredSources.length === 0 && (
              <p className="px-3 py-5 text-center text-sm text-[#525866]">No bank matches “{filterQuery}”</p>
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
    <div className="min-h-screen bg-[#F7F9FC]" style={{ fontFamily: 'Satoshi' }}>
      <AdminHeader userInfo={userInfo} onNavigate={onNavigate} onLogout={onLogout} contextLabel="Database Search" />

      <main className={`mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8 ${hasSearched ? 'pb-10 pt-4' : 'flex min-h-[calc(100vh-92px)] items-center pb-10 pt-4'}`}>
        <section className={`w-full overflow-hidden rounded-xl border border-[#E5E8EC] bg-white shadow-sm ${hasSearched ? '' : 'mx-auto max-w-[1120px]'}`}>
          <div className="px-5 py-7 sm:px-8 sm:py-9 lg:px-10">
            <div className="flex max-w-3xl items-center gap-2 text-sm font-medium text-[#525866]">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#EAF2FF] text-[#022658]"><Database size={16} /></span>
              Juridence database search
            </div>
            <h1 className="mt-4 text-2xl font-bold leading-tight text-[#050F1C] sm:text-3xl">Find the case behind a name</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#525866]">
              Search pending bank cases by any part of a party name, case title, or suit number.
            </p>

            <form onSubmit={handleSubmit} className="mt-6 flex max-w-4xl flex-col gap-3 sm:flex-row">
              <label htmlFor="dashboard-case-search" className="sr-only">Search pending cases</label>
              <div className="flex min-h-[50px] min-w-0 flex-1 items-center gap-3 rounded-lg border border-[#DDE1E6] bg-white px-4 text-[#050F1C] transition-colors focus-within:border-[#022658] focus-within:ring-2 focus-within:ring-[#022658]/10">
                <Search size={20} className="shrink-0 text-[#525866]" />
                <input
                  id="dashboard-case-search"
                  type="search"
                  value={query}
                  onChange={handleQueryChange}
                  placeholder="Try Philip Ofori, OFORI Asante, or GJ/0622/2020"
                  className="dashboard-search-input h-12 min-w-0 flex-1 border-0 bg-transparent p-0 text-sm outline-none focus:shadow-none focus-visible:outline-none placeholder:text-[#868C98]"
                />
              </div>
              <Button type="submit" size="lg" loading={loading} disabled={!query.trim()} icon={<Search size={17} />} className="min-h-[50px] !rounded-lg !bg-[#022658] px-6 text-base hover:!bg-[#033B82] disabled:opacity-50">
                Search cases
              </Button>
            </form>
          </div>

          <div className="grid border-t border-[#E5E8EC] bg-[#FAFBFC] sm:grid-cols-3">
            {[
              ['Indexed party records', stats.indexed_parties, UserRound],
              ['Pending cases', stats.pending_cases, FileSearch],
              ['Bank sources', stats.source_banks, Building2],
            ].map(([label, value, Icon], index) => (
              <div key={label} className={`flex items-center gap-3 px-5 py-4 sm:px-8 ${index > 0 ? 'border-t border-[#E5E8EC] sm:border-l sm:border-t-0' : ''}`}>
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#EAF2FF] text-[#022658]"><Icon size={18} /></span>
                <div>
                  <p className="text-lg font-bold text-[#050F1C]">{formatNumber(value)}</p>
                  <p className="text-xs text-[#525866]">{label}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {hasSearched && <section className="relative mt-6 overflow-visible rounded-xl border border-[#E5E8EC] bg-white shadow-sm" aria-labelledby="search-results-heading">
          <div className="flex flex-col gap-4 border-b border-[#E5E8EC] px-5 py-4 sm:flex-row sm:items-end sm:justify-between sm:px-6">
            <div>
              <h2 id="search-results-heading" className="font-bold text-[#050F1C]">
                {submittedQuery ? `Results for “${submittedQuery}”` : 'Recently created pending cases'}
              </h2>
              <p className="mt-1 text-xs text-[#868C98]">
                {loading ? 'Searching the party index' : `${formatNumber(total)} ${total === 1 ? 'case' : 'cases'} found`}
              </p>
            </div>
            <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
              <BankFilterCombobox sources={stats.sources || []} value={bankId} onChange={handleBankChange} />
              <Button variant="white" icon={<X size={15} />} onClick={clearSearch} className="shrink-0 !rounded-lg !border !border-[#DDE1E6] text-sm">Clear results</Button>
            </div>
          </div>

          {error && (
            <div className="border-b border-[#f1c7cd] bg-[#fff5f6] px-5 py-4 text-sm text-[#a82e3d] sm:px-6" role="alert">{error}</div>
          )}

          {loading ? (
            <div className="flex min-h-[300px] items-center justify-center gap-3 text-sm text-[#60737d]">
              <Loader2 size={20} className="animate-spin text-[#022658]" /> Searching case records
            </div>
          ) : results.length === 0 ? (
            <div className="flex min-h-[300px] flex-col items-center justify-center px-6 text-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#EAF2FF] text-[#022658]"><FileSearch size={22} /></span>
              <h3 className="mt-4 font-semibold text-[#050F1C]">No matching pending case</h3>
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
                        <UserRound size={15} className="shrink-0 text-[#022658]" />
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
                <Button variant="white" size="sm" icon={<ArrowLeft size={15} />} disabled={page <= 1} onClick={() => changePage(page - 1)} className="!border !border-[#DDE1E6]">Previous</Button>
                <Button variant="white" size="sm" icon={<ArrowRight size={15} />} iconPosition="right" disabled={page >= totalPages} onClick={() => changePage(page + 1)} className="!border !border-[#DDE1E6]">Next</Button>
              </div>
            </div>
          )}
        </section>}
      </main>
    </div>
  );
};

export default DashboardSearchHome;
