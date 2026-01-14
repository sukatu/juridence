import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Search, User } from 'lucide-react';
import { apiGet } from '../utils/api';
import { useNavigate } from 'react-router-dom';

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
const FALLBACK_LETTER = '#';
const LETTER_SEGMENTS = [...ALPHABET, FALLBACK_LETTER];

const Judges = () => {
  const [judges, setJudges] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [pagination, setPagination] = useState({ page: 1, limit: 50, total: 0, totalPages: 0 });
  const navigate = useNavigate();
  const debounceTimer = useRef(null);

  const getInitial = useCallback((name = '') => {
    const firstLetter = name.trim().charAt(0).toUpperCase();
    return firstLetter && /[A-Z]/.test(firstLetter) ? firstLetter : FALLBACK_LETTER;
  }, []);

  const groupedJudges = useMemo(() => {
    if (!judges || judges.length === 0) return {};

    return judges
      .slice()
      .sort((a, b) => (a.name || '').localeCompare(b.name || ''))
      .reduce((acc, judge) => {
        const letter = getInitial(judge.name || '');
        if (!acc[letter]) {
          acc[letter] = [];
        }
        acc[letter].push(judge);
        return acc;
      }, {});
  }, [judges, getInitial]);

  const handleLetterNavigation = useCallback((letter) => {
    const target = document.getElementById(`judge-group-${letter}`);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  const loadJudges = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page,
        limit: pagination.limit,
        ...(searchQuery && { search: searchQuery })
      });

      const response = await apiGet(`/judges?${params}`);
      setJudges(response.judges || []);
      setPagination(response);
    } catch (error) {
      console.error('Error loading judges:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Clear existing timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    // Set new timer for debouncing
    debounceTimer.current = setTimeout(() => {
      loadJudges();
    }, 300); // Wait 300ms after user stops typing

    // Cleanup function
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.page, searchQuery]);

  const handleJudgeClick = (judgeId) => {
    navigate(`/judges/${judgeId}`);
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="bg-white dark:bg-slate-900 transition-colors duration-200">
      {/* Hero Section */}
      <section className="bg-white dark:bg-slate-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">
              Judges & Special Prosecutors
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
              Comprehensive database of judges and special prosecutors in Ghana's legal system
            </p>
          </div>

          {/* Search Form */}
          <div className="max-w-2xl mx-auto mb-12">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search judges by name, title, court type..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPagination(prev => ({ ...prev, page: 1 }));
                }}
                className="w-full pl-12 pr-4 py-4 text-lg border-2 border-slate-300 dark:border-slate-600 rounded-xl focus:ring-4 focus:ring-brand-500/20 focus:border-brand-500 dark:bg-slate-800 dark:text-white transition-all duration-200"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Results Section */}
      <section className="bg-slate-50 dark:bg-slate-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-slate-600 dark:text-slate-300">Loading judges...</p>
            </div>
          ) : judges.length === 0 ? (
            <div className="text-center py-12">
              <User className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-600 dark:text-slate-300">No judges match your search yet.</p>
            </div>
          ) : (
            <>
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm mb-10">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                  <div>
                    <p className="text-sm uppercase tracking-wide text-brand-600 font-semibold">Alphabetical directory</p>
                    <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">Browse judges by last name</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Select a letter to jump to that section.</p>
                  </div>
                  <div className="text-sm text-slate-500 dark:text-slate-400">
                    <p>
                      Showing <span className="font-medium text-slate-700 dark:text-slate-300">
                        {((pagination.page - 1) * pagination.limit) + 1}
                      </span> to{' '}
                      <span className="font-medium text-slate-700 dark:text-slate-300">
                        {Math.min(pagination.page * pagination.limit, pagination.total)}
                      </span>{' '}
                      of <span className="font-medium text-slate-700 dark:text-slate-300">
                        {pagination.total.toLocaleString()}
                      </span> judges
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {LETTER_SEGMENTS.map((letter) => {
                    const isAvailable = groupedJudges[letter]?.length;
                    return (
                      <button
                        key={letter}
                        onClick={() => isAvailable && handleLetterNavigation(letter)}
                        className={`px-3 py-2 text-sm font-semibold rounded-full border transition-colors ${
                          isAvailable
                            ? 'border-brand-200 text-brand-700 dark:border-brand-800 dark:text-brand-300 hover:bg-brand-50 dark:hover:bg-brand-900/30'
                            : 'border-slate-200 text-slate-400 cursor-not-allowed dark:border-slate-700'
                        }`}
                        disabled={!isAvailable}
                      >
                        {letter === FALLBACK_LETTER ? 'Others' : letter}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-12">
                {LETTER_SEGMENTS.map((letter) => {
                  const letterGroup = groupedJudges[letter];
                  if (!letterGroup || letterGroup.length === 0) {
                    return null;
                  }

                  return (
                    <div key={letter} id={`judge-group-${letter}`}>
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 rounded-full bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300 flex items-center justify-center text-xl font-bold">
                          {letter === FALLBACK_LETTER ? '#' : letter}
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
                            {letter === FALLBACK_LETTER ? 'Other Characters' : `Judges starting with "${letter}"`}
                          </h3>
                          <p className="text-sm text-slate-500 dark:text-slate-400">{letterGroup.length} profile{letterGroup.length > 1 ? 's' : ''}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {letterGroup.map((judge) => (
                          <button
                            key={judge.id}
                            onClick={() => handleJudgeClick(judge.id)}
                            className="flex items-center justify-between w-full text-left px-5 py-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 hover:border-brand-400 dark:hover:border-brand-500 hover:shadow-md transition-all"
                          >
                            <div className="flex items-start gap-4">
                              <div className="w-12 h-12 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-300 flex items-center justify-center">
                                <User className="h-5 w-5" />
                              </div>
                              <div>
                                <p className="text-lg font-semibold text-slate-900 dark:text-white">
                                  {judge.title ? `${judge.title} ` : ''}{judge.name}
                                </p>
                                {judge.court_type && (
                                  <p className="text-sm text-slate-600 dark:text-slate-400">{judge.court_type}</p>
                                )}
                                {judge.court_division && (
                                  <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">{judge.court_division}</p>
                                )}
                              </div>
                            </div>
                            <span className="text-sm font-medium text-brand-600 dark:text-brand-300">View Profile →</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pagination Controls */}
              {pagination.totalPages > 1 && (
                <div className="mt-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    {/* Mobile Pagination */}
                    <div className="flex-1 flex justify-between sm:hidden w-full">
                      <button
                        onClick={() => handlePageChange(pagination.page - 1)}
                        disabled={pagination.page === 1}
                        className="relative inline-flex items-center px-4 py-2 border border-slate-300 dark:border-slate-600 text-sm font-medium rounded-md text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        Previous
                      </button>
                      <button
                        onClick={() => handlePageChange(pagination.page + 1)}
                        disabled={pagination.page === pagination.totalPages}
                        className="ml-3 relative inline-flex items-center px-4 py-2 border border-slate-300 dark:border-slate-600 text-sm font-medium rounded-md text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        Next
                      </button>
                    </div>

                    {/* Desktop Pagination */}
                    <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between w-full">
                      <div>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          Showing <span className="font-medium text-slate-900 dark:text-white">
                            {((pagination.page - 1) * pagination.limit) + 1}
                          </span> to{' '}
                          <span className="font-medium text-slate-900 dark:text-white">
                            {Math.min(pagination.page * pagination.limit, pagination.total)}
                          </span>{' '}
                          of <span className="font-medium text-slate-900 dark:text-white">
                            {pagination.total.toLocaleString()}
                          </span> results
                        </p>
                      </div>
                      <div>
                        <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                          <button
                            onClick={() => handlePageChange(pagination.page - 1)}
                            disabled={pagination.page === 1}
                            className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm font-medium text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            <span className="sr-only">Previous</span>
                            ← Previous
                          </button>
                          {Array.from({ length: Math.min(pagination.totalPages, 10) }, (_, i) => {
                            let pageNum;
                            if (pagination.totalPages <= 10) {
                              pageNum = i + 1;
                            } else if (pagination.page <= 5) {
                              pageNum = i + 1;
                            } else if (pagination.page >= pagination.totalPages - 4) {
                              pageNum = pagination.totalPages - 9 + i;
                            } else {
                              pageNum = pagination.page - 5 + i;
                            }
                            return (
                              <button
                                key={pageNum}
                                onClick={() => handlePageChange(pageNum)}
                                className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium transition-colors ${
                                  pageNum === pagination.page
                                    ? 'z-10 bg-brand-50 dark:bg-brand-900/30 border-brand-500 dark:border-brand-500 text-brand-600 dark:text-brand-400'
                                    : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'
                                }`}
                              >
                                {pageNum}
                              </button>
                            );
                          })}
                          <button
                            onClick={() => handlePageChange(pagination.page + 1)}
                            disabled={pagination.page === pagination.totalPages}
                            className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm font-medium text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            <span className="sr-only">Next</span>
                            Next →
                          </button>
                        </nav>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
};

export default Judges;

