import React, { useState, useEffect } from 'react';
import { ArrowLeft, Calendar, GraduationCap, Briefcase, FileText, Book, Newspaper } from 'lucide-react';
import { apiGet } from '../utils/api';
import { useParams, useNavigate } from 'react-router-dom';

const JudgeDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [judge, setJudge] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadJudge = async () => {
      setLoading(true);
      try {
        const response = await apiGet(`/judges/${id}`);
        setJudge(response);
      } catch (error) {
        console.error('Error loading judge:', error);
      } finally {
        setLoading(false);
      }
    };

    loadJudge();
  }, [id]);

  const formatDate = (date) => {
    if (!date) return 'Not available';
    return new Date(date).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const groupByAreaOfLaw = (items) => {
    if (!items || !Array.isArray(items)) return {};
    
    const grouped = {};
    items.forEach(item => {
      const area = item.area_of_law || item.category || 'Uncategorized';
      if (!grouped[area]) {
        grouped[area] = [];
      }
      grouped[area].push(item);
    });
    
    return grouped;
  };

  const renderCasesSection = (title, cases, icon, options = {}) => {
    const { showGroupingNote = false } = options;
    if (!cases || !Array.isArray(cases) || cases.length === 0) return null;
    
    const grouped = groupByAreaOfLaw(cases);
    
    return (
      <div className="mb-8">
        <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          {icon}
          <span className="ml-2">{title}</span>
          <span className="ml-2 text-sm font-normal text-gray-600">({cases.length} total)</span>
        </h3>
        {showGroupingNote && (
          <p className="text-sm text-gray-500 mb-3">Grouped by area of law for quick scanning.</p>
        )}
        
        {Object.keys(grouped).sort().map(area => (
          <div key={area} className="mb-6">
            <h4 className="text-md font-medium text-blue-700 mb-2">{area}</h4>
            <div className="bg-gray-50 rounded-lg p-4">
              <ul className="space-y-2">
                {grouped[area].map((item, idx) => (
                  <li key={idx} className="flex items-start text-sm text-gray-700">
                    <span className="mr-2">•</span>
                    <div className="flex-1">
                      {item.case_title || item.title || item.name}
                      {item.date && (
                        <span className="ml-2 text-gray-500">
                          ({new Date(item.date).toLocaleDateString()})
                        </span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderListSection = (title, items, icon) => {
    if (!items || !Array.isArray(items) || items.length === 0) return null;
    
    return (
      <div className="mb-8">
        <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          {icon}
          <span className="ml-2">{title}</span>
          <span className="ml-2 text-sm font-normal text-gray-600">({items.length} total)</span>
        </h3>
        <div className="bg-gray-50 rounded-lg p-4">
          <ul className="space-y-2">
            {items.map((item, idx) => (
              <li key={idx} className="flex items-start text-sm text-gray-700">
                <span className="mr-2">•</span>
                <div className="flex-1">
                  {typeof item === 'string' ? item : (item.title || item.name || JSON.stringify(item))}
                  {item.year && (
                    <span className="ml-2 text-gray-500">({item.year})</span>
                  )}
                  {item.publisher && (
                    <span className="ml-2 text-gray-500">- {item.publisher}</span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading judge details...</p>
        </div>
      </div>
    );
  }

  if (!judge) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600">Judge not found</p>
          <button
            onClick={() => navigate('/judges')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Back to Judges
          </button>
        </div>
      </div>
    );
  }

  const profileHighlights = [
    { label: 'Date of Birth', value: formatDate(judge.date_of_birth) },
    { label: 'Date of Call to the Bar', value: formatDate(judge.date_of_call_to_bar) },
    { label: 'Status', value: judge.status ? judge.status.replace('_', ' ') : 'Not available' },
    { label: 'Region', value: judge.region || 'Not available' },
    { label: 'Specializations', value: judge.specializations || 'Not specified' }
  ];

  const appointmentTimeline = [
    judge.date_appointment_high_court && { label: 'High Court', value: formatDate(judge.date_appointment_high_court) },
    judge.date_appointment_court_appeal && { label: 'Court of Appeal', value: formatDate(judge.date_appointment_court_appeal) },
    judge.date_appointment_supreme_court && { label: 'Supreme Court', value: formatDate(judge.date_appointment_supreme_court) }
  ].filter(Boolean);

  const hasEducation = Array.isArray(judge.schools_attended) && judge.schools_attended.length > 0;
  const hasLawyerCases = Boolean(
    (judge.cases_as_lawyer_high_court && judge.cases_as_lawyer_high_court.length) ||
    (judge.cases_as_lawyer_court_appeal && judge.cases_as_lawyer_court_appeal.length) ||
    (judge.cases_as_lawyer_supreme_court && judge.cases_as_lawyer_supreme_court.length)
  );
  const hasJudgments = Boolean(
    (judge.judgments_high_court && judge.judgments_high_court.length) ||
    (judge.judgments_court_appeal && judge.judgments_court_appeal.length) ||
    (judge.judgments_supreme_court && judge.judgments_supreme_court.length)
  );

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <button
        onClick={() => navigate('/judges')}
        className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="h-5 w-5 mr-2" />
        Back to Judges
      </button>

      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-6 md:p-10 border border-slate-200 dark:border-slate-800">
        {/* Judge Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-slate-100 dark:border-slate-800 pb-6 mb-8">
          <div>
            <p className="text-sm uppercase tracking-wide text-brand-600 font-semibold">Judge profile</p>
            <h1 className="text-4xl font-bold text-slate-900 dark:text-white">
              {judge.title ? `${judge.title} ` : ''}{judge.name}
            </h1>
            <div className="flex flex-wrap gap-3 mt-4 text-sm text-slate-600 dark:text-slate-300">
              {judge.court_type && (
                <span className="inline-flex items-center px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800/70">
                  {judge.court_type}
                </span>
              )}
              {judge.court_division && (
                <span className="inline-flex items-center px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800/70">
                  {judge.court_division}
                </span>
              )}
              {judge.region && (
                <span className="inline-flex items-center px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800/70">
                  {judge.region}
                </span>
              )}
            </div>
          </div>
          {judge.status && (
            <span className="self-start px-4 py-2 rounded-full text-sm font-semibold bg-brand-100 text-brand-700 dark:bg-brand-900/40 dark:text-brand-200 capitalize">
              {judge.status.replace('_', ' ')}
            </span>
          )}
        </div>

        {/* Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
          <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-6">
            <div className="flex items-center gap-2 text-slate-700 dark:text-slate-100">
              <Calendar className="h-5 w-5" />
              <h2 className="text-xl font-semibold">Key personal details</h2>
            </div>
            <dl className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {profileHighlights.map((item) => (
                <div key={item.label}>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">{item.label}</dt>
                  <dd className="text-base text-slate-900 dark:text-slate-100">{item.value}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-6">
            <div className="flex items-center gap-2 text-slate-700 dark:text-slate-100">
              <Briefcase className="h-5 w-5" />
              <h2 className="text-xl font-semibold">Judicial appointments</h2>
            </div>
            {appointmentTimeline.length > 0 ? (
              <ol className="mt-4 space-y-3">
                {appointmentTimeline.map((item) => (
                  <li key={item.label} className="flex items-center justify-between bg-white/70 dark:bg-slate-900/50 rounded-lg px-4 py-3">
                    <span className="text-sm font-medium text-slate-600 dark:text-slate-300">{item.label}</span>
                    <span className="text-base font-semibold text-slate-900 dark:text-white">{item.value}</span>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="mt-4 text-sm text-slate-500">Appointment details not available.</p>
            )}
          </div>
        </div>

        {/* Education */}
        {hasEducation && (
          <div className="mb-10">
            <div className="flex items-center gap-2 mb-4 text-slate-900 dark:text-white">
              <GraduationCap className="h-5 w-5" />
              <h2 className="text-xl font-semibold">Schools attended</h2>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-6">
              <ul className="space-y-4">
                {judge.schools_attended.map((school, idx) => (
                  <li key={`${school.name || school.school_name || school}-${idx}`} className="flex items-start gap-3">
                    <span className="text-brand-600 font-semibold">•</span>
                    <div>
                      {typeof school === 'object' ? (
                        <>
                          <p className="text-base font-semibold text-slate-900 dark:text-white">{school.school_name || school.name}</p>
                          {school.degree && <p className="text-sm text-slate-600 dark:text-slate-400">{school.degree}</p>}
                          {school.year && <p className="text-xs uppercase tracking-wide text-slate-500 mt-1">Year: {school.year}</p>}
                        </>
                      ) : (
                        <p className="text-base text-slate-900 dark:text-white">{school}</p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Cases Conducted as Lawyer */}
        {hasLawyerCases && (
          <div className="mb-10">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-4">
              <div>
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Cases conducted as a lawyer</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">Coverage across High Court, Court of Appeal, and Supreme Court grouped by area of law.</p>
              </div>
            </div>
            {renderCasesSection('High Court', judge.cases_as_lawyer_high_court, <Briefcase className="h-5 w-5" />, { showGroupingNote: true })}
            {renderCasesSection('Court of Appeal', judge.cases_as_lawyer_court_appeal, <Briefcase className="h-5 w-5" />, { showGroupingNote: true })}
            {renderCasesSection('Supreme Court', judge.cases_as_lawyer_supreme_court, <Briefcase className="h-5 w-5" />, { showGroupingNote: true })}
          </div>
        )}

        {/* Judgments */}
        {hasJudgments && (
          <div className="mb-10">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">Judgments & rulings delivered</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Organized by court level and grouped by area of law.</p>
            {renderCasesSection('High Court', judge.judgments_high_court, <FileText className="h-5 w-5" />, { showGroupingNote: true })}
            {renderCasesSection('Court of Appeal', judge.judgments_court_appeal, <FileText className="h-5 w-5" />, { showGroupingNote: true })}
            {renderCasesSection('Supreme Court', judge.judgments_supreme_court, <FileText className="h-5 w-5" />, { showGroupingNote: true })}
          </div>
        )}

        {/* Articles */}
        {renderListSection('Articles Written', judge.articles_written, <Newspaper className="h-5 w-5" />)}

        {/* Books */}
        {renderListSection('Books Written', judge.books_written, <Book className="h-5 w-5" />)}

        {/* Biography */}
        {judge.bio && (
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">Biography</h2>
            <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-6">
              <p className="text-slate-700 dark:text-slate-200 leading-relaxed">{judge.bio}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default JudgeDetail;

