import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Calendar, Gavel, User, MapPin, Building2, Shield, Clock, FileText } from 'lucide-react';
import { apiGet } from '../utils/api';
import AIAnalysisTrigger from '../components/AIAnalysisTrigger';

const CaseDetail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [caseData, setCaseData] = useState(null);

  // Enhanced mock data with multiple dates and comprehensive information
  const mockCaseData = {
    id: 1,
    title: 'Loan Default Case vs. John Smith',
    caseNumber: 'GCB/2024/001',
    status: 'Active',
    date: '2024-01-10',
    type: 'Commercial Law',
    outcome: 'Pending',
    court: 'Commercial Court, Accra',
    courtType: 'Commercial Court',
    region: 'Greater Accra',
    judge: 'Justice Sarah Mensah',
    plaintiff: 'Ghana Commercial Bank',
    defendant: 'John Smith',
    description: 'Default on business loan of GHS 500,000. Bank seeking recovery of outstanding amount plus interest. The case involves complex financial documentation and requires expert testimony on banking procedures and loan agreements.',
    amount: 'GHS 500,000',
    riskLevel: 'High',
    dates: [
      { type: 'Filing', date: '2024-01-10', description: 'Case filed with court' },
      { type: 'First Hearing', date: '2024-02-15', description: 'Initial hearing scheduled' },
      { type: 'Evidence Hearing', date: '2024-03-20', description: 'Evidence presentation' },
      { type: 'Expert Testimony', date: '2024-03-25', description: 'Banking expert testimony' },
      { type: 'Ruling', date: '2024-04-10', description: 'Court ruling expected' }
    ],
    documents: [
      { name: 'Loan Agreement', type: 'Contract', date: '2023-06-15' },
      { name: 'Default Notice', type: 'Legal Notice', date: '2023-12-01' },
      { name: 'Financial Statements', type: 'Evidence', date: '2024-01-05' },
      { name: 'Expert Report', type: 'Expert Opinion', date: '2024-03-20' }
    ],
    relatedCases: [
      { id: 2, title: 'Contract Dispute - XYZ Ltd', caseNumber: 'GCB/2024/002', status: 'Active' },
      { id: 3, title: 'Fraud Investigation - ABC Corp', caseNumber: 'GCB/2023/156', status: 'Resolved' }
    ]
  };

  useEffect(() => {
    const caseId = searchParams.get('caseId');
    const source = searchParams.get('source'); // 'bank', 'insurance', or 'search'
    const institutionId = searchParams.get('institutionId');
    
    if (caseId) {
      loadCaseData(caseId, source, institutionId);
    }
  }, [searchParams]);

  const loadCaseData = async (caseId, source, institutionId) => {
    try {
      const response = await apiGet(`/cases/${caseId}`);
      setCaseData({
        ...response,
        source: source || 'search',
        institutionId: institutionId,
        institutionName: source === 'bank' ? 'Ghana Commercial Bank' : 
                        source === 'insurance' ? 'SIC Insurance Company' : null
      });
    } catch (error) {
      console.error('Error loading case data:', error);
      // Fallback to mock data if API fails
      setCaseData({
        ...mockCaseData,
        source: source || 'search',
        institutionId: institutionId,
        institutionName: source === 'bank' ? 'Ghana Commercial Bank' : 
                        source === 'insurance' ? 'SIC Insurance Company' : null
      });
    }
  };

  if (!caseData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-sky-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading case details...</p>
        </div>
      </div>
    );
  }

  const getRiskColor = (level) => {
    switch (level) {
      case 'Low':
        return 'bg-emerald-50 text-emerald-600 ring-emerald-200';
      case 'Medium':
        return 'bg-amber-50 text-amber-600 ring-amber-200';
      case 'High':
        return 'bg-red-50 text-red-600 ring-red-200';
      default:
        return 'bg-slate-50 text-slate-600 ring-slate-200';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active':
        return 'bg-amber-100 text-amber-700';
      case 'Resolved':
        return 'bg-emerald-100 text-emerald-700';
      case 'Pending':
        return 'bg-slate-100 text-slate-700';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div>
      {/* Breadcrumb */}
      <div className="bg-white border-b border-slate-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-3">
          <nav className="flex items-center space-x-2 text-sm text-slate-600">
            <button
              onClick={() => navigate('/')}
              className="hover:text-slate-900 transition-colors"
            >
              Home
            </button>
            <span>/</span>
            
            {/* Dynamic breadcrumb based on source */}
            {caseData.source === 'bank' && (
              <>
                <button
                  onClick={() => navigate('/banks')}
                  className="hover:text-slate-900 transition-colors"
                >
                  Banks
                </button>
                <span>/</span>
                <button
                  onClick={() => navigate(`/bank-detail?bankId=${caseData.institutionId}`)}
                  className="hover:text-slate-900 transition-colors"
                >
                  {caseData.institutionName}
                </button>
                <span>/</span>
              </>
            )}
            
            {caseData.source === 'insurance' && (
              <>
                <button
                  onClick={() => navigate('/insurance')}
                  className="hover:text-slate-900 transition-colors"
                >
                  Insurance
                </button>
                <span>/</span>
                <button
                  onClick={() => navigate(`/insurance-detail?insuranceId=${caseData.institutionId}`)}
                  className="hover:text-slate-900 transition-colors"
                >
                  {caseData.institutionName}
                </button>
                <span>/</span>
              </>
            )}
            
            {caseData.source === 'search' && (
              <>
                <button
                  onClick={() => navigate('/results')}
                  className="hover:text-slate-900 transition-colors"
                >
                  Search Results
                </button>
                <span>/</span>
              </>
            )}
            
            <span className="text-slate-900">{caseData.title}</span>
          </nav>
        </div>
      </div>

      {/* Case Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-6">
            <div className="h-16 w-16 rounded-full bg-sky-100 flex items-center justify-center">
              <Gavel className="h-8 w-8 text-sky-600" />
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-slate-900">{caseData.title}</h1>
              <p className="text-lg text-slate-600">
                {caseData.caseNumber} • {caseData.court}
              </p>
              <div className="mt-2 flex items-center gap-4">
                <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-semibold ring-1 ${getRiskColor(caseData.riskLevel)}`}>
                  <span className={`inline-block h-2 w-2 rounded-full ${getRiskColor(caseData.riskLevel).split(' ')[1].replace('text-', 'bg-')}`}></span>
                  {caseData.riskLevel} Risk
                </span>
                <span className={`px-2 py-1 rounded-full text-sm font-medium ${getStatusColor(caseData.status)}`}>
                  {caseData.status}
                </span>
                <span className="text-sm text-slate-500">Amount: {caseData.amount}</span>
              </div>
            </div>
            <div className="flex gap-2">
              <button className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
                <Download className="h-4 w-4" />
                Export Case
              </button>
              <button className="inline-flex items-center gap-2 rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700 transition-colors">
                <FileText className="h-4 w-4" />
                View Documents
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Case Information */}
            <section className="rounded-xl border border-slate-200 bg-white p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Case Information</h2>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium text-slate-600">Case Number</label>
                  <p className="text-slate-900">{caseData.caseNumber}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600">Case Type</label>
                  <p className="text-slate-900">{caseData.type}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600">Court</label>
                  <p className="text-slate-900">{caseData.court}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600">Judge</label>
                  <p className="text-slate-900">{caseData.judge}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600">Plaintiff</label>
                  <p className="text-slate-900">{caseData.plaintiff}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600">Defendant</label>
                  <p className="text-slate-900">{caseData.defendant}</p>
                </div>
              </div>
            </section>

            {/* Case Description */}
            <section className="rounded-xl border border-slate-200 bg-white p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Case Description</h2>
              <div className="bg-slate-50 rounded-lg p-4">
                <p className="text-slate-700 leading-relaxed">{caseData.description}</p>
              </div>
            </section>

            {/* AI Banking-Focused Case Summary */}
            <AIAnalysisTrigger caseId={caseData.id}>
              <section className="rounded-xl border border-slate-200 bg-white p-6">
                <h2 className="text-lg font-semibold text-slate-900 mb-4">Banking-Focused Case Summary</h2>
                
                {/* Summary Section */}
                {caseData.ai_detailed_outcome && (
                  <div className="mb-6 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                    <h3 className="font-semibold text-purple-900 mb-2">Summary</h3>
                    <p className="text-purple-800 text-sm leading-relaxed">{caseData.ai_detailed_outcome}</p>
                  </div>
                )}

                {/* Case Outcome Section */}
                {caseData.ai_case_outcome && (
                  <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h3 className="font-semibold text-blue-900 mb-2">Case Outcome</h3>
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        caseData.ai_case_outcome === 'WON' ? 'bg-green-100 text-green-800' :
                        caseData.ai_case_outcome === 'LOST' ? 'bg-red-100 text-red-800' :
                        caseData.ai_case_outcome === 'PARTIALLY_WON' ? 'bg-yellow-100 text-yellow-800' :
                        caseData.ai_case_outcome === 'PARTIALLY_LOST' ? 'bg-orange-100 text-orange-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {caseData.ai_case_outcome.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                )}

                {/* Court Orders Section */}
                {caseData.ai_court_orders && (
                  <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                    <h3 className="font-semibold text-orange-900 mb-2">Court Orders</h3>
                    <p className="text-orange-800 text-sm leading-relaxed">{caseData.ai_court_orders}</p>
                  </div>
                )}

                {/* Financial Impact Section */}
                {caseData.ai_financial_impact && (
                  <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <h3 className="font-semibold text-green-900 mb-2">Financial Impact</h3>
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        caseData.ai_financial_impact.includes('HIGH') ? 'bg-red-100 text-red-800' :
                        caseData.ai_financial_impact.includes('MODERATE') ? 'bg-yellow-100 text-yellow-800' :
                        caseData.ai_financial_impact.includes('LOW') ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {caseData.ai_financial_impact.split(' - ')[0]}
                      </span>
                    </div>
                    {caseData.ai_financial_impact.includes(' - ') && (
                      <p className="text-green-800 text-sm mt-2">{caseData.ai_financial_impact.split(' - ')[1]}</p>
                    )}
                  </div>
                )}

                {/* No AI Analysis Message */}
                {!caseData.ai_detailed_outcome && !caseData.ai_case_outcome && !caseData.ai_court_orders && !caseData.ai_financial_impact && (
                  <div className="text-center py-8 text-gray-500">
                    <p>AI analysis will be generated when this case is first accessed.</p>
                  </div>
                )}
              </section>
            </AIAnalysisTrigger>

            {/* Case Timeline */}
            <section className="rounded-xl border border-slate-200 bg-white p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Case Timeline</h2>
              <div className="space-y-4">
                {caseData.dates.map((dateItem, index) => (
                  <div key={index} className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <div className="h-8 w-8 rounded-full bg-sky-100 flex items-center justify-center">
                        <Clock className="h-4 w-4 text-sky-600" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium text-slate-900">{dateItem.type}</h3>
                        <span className="text-sm text-slate-500">{dateItem.date}</span>
                      </div>
                      <p className="text-sm text-slate-600">{dateItem.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Documents */}
            <section className="rounded-xl border border-slate-200 bg-white p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Case Documents</h2>
              <div className="space-y-3">
                {caseData.documents.map((doc, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border border-slate-200 rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-slate-400" />
                      <div>
                        <p className="font-medium text-slate-900">{doc.name}</p>
                        <p className="text-sm text-slate-500">{doc.type} • {doc.date}</p>
                      </div>
                    </div>
                    <button className="text-sky-600 hover:text-sky-700 text-sm font-medium">
                      View
                    </button>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Case Status */}
            <section className="rounded-xl border border-slate-200 bg-white p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Case Status</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-slate-600">Status</span>
                  <span className={`px-2 py-1 rounded-full text-sm font-medium ${getStatusColor(caseData.status)}`}>
                    {caseData.status}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-600">Outcome</span>
                  <span className="text-sm font-medium text-slate-900">{caseData.outcome}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-600">Risk Level</span>
                  <span className={`px-2 py-1 rounded-full text-sm font-medium ${getRiskColor(caseData.riskLevel)}`}>
                    {caseData.riskLevel}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-600">Amount</span>
                  <span className="text-sm font-medium text-slate-900">{caseData.amount}</span>
                </div>
              </div>
            </section>

            {/* Court Information */}
            <section className="rounded-xl border border-slate-200 bg-white p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Court Information</h2>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-slate-400" />
                  <span className="text-sm text-slate-600">{caseData.courtType}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-slate-400" />
                  <span className="text-sm text-slate-600">{caseData.region}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Gavel className="h-4 w-4 text-slate-400" />
                  <span className="text-sm text-slate-600">{caseData.judge}</span>
                </div>
              </div>
            </section>

            {/* Related Cases */}
            <section className="rounded-xl border border-slate-200 bg-white p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Related Cases</h2>
              <div className="space-y-3">
                {caseData.relatedCases.map((relatedCase) => (
                  <div key={relatedCase.id} className="p-3 border border-slate-200 rounded-lg hover:border-sky-300 transition-colors">
                    <h3 className="font-medium text-slate-900 text-sm">{relatedCase.title}</h3>
                    <p className="text-xs text-slate-500 mb-1">{relatedCase.caseNumber}</p>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(relatedCase.status)}`}>
                      {relatedCase.status}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CaseDetail;
