import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { 
  Building2, 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  Calendar, 
  Users, 
  TrendingUp, 
  Scale, 
  FileText, 
  ExternalLink,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Briefcase,
  Shield,
  Award,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Search,
  ArrowUpDown,
  RefreshCw,
  BookOpen
} from 'lucide-react';
import RequestDetailsModal from '../components/RequestDetailsModal';
import CompanyEmployees from '../components/CompanyEmployees';

const CompanyProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [companyData, setCompanyData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedSections, setExpandedSections] = useState({
    overview: true,
    contact: true,
    management: true,
    employees: true,
    cases: true,
    analytics: true
  });
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectedCase, setSelectedCase] = useState(null);
  const [showProfileRequestModal, setShowProfileRequestModal] = useState(false);
  const [relatedCases, setRelatedCases] = useState([]);
  const [casesLoading, setCasesLoading] = useState(false);
  const [filteredCases, setFilteredCases] = useState([]);
  const [caseSearchQuery, setCaseSearchQuery] = useState('');
  const [caseSortBy, setCaseSortBy] = useState('date');
  const [caseSortOrder, setCaseSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [casesPerPage] = useState(100);

  const searchQuery = new URLSearchParams(location.search).get('q') || '';

  useEffect(() => {
    if (id) {
      loadCompanyData();
      loadRelatedCases(id);
    } else {
      setError('No company ID provided');
      setLoading(false);
    }
  }, [id]);

  const loadCompanyData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      
      if (!token) {
        setError('Authentication required');
        setLoading(false);
        return;
      }

      const response = await fetch(`/api/companies/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setCompanyData(data);
      } else {
        const errorData = await response.json();
        setError(errorData.detail || 'Failed to load company data');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Load related cases
  const loadRelatedCases = async (companyId) => {
    try {
      setCasesLoading(true);

      const url = `/api/companies/${companyId}/related-cases?limit=100`;
      
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        
        if (data.cases && data.cases.length > 0) {
          setRelatedCases(data.cases);
        } else {
          setRelatedCases([]);
        }
      } else {
        console.error('Failed to fetch related cases:', response.status);
        setRelatedCases([]);
      }
    } catch (error) {
      console.error('Error loading related cases:', error);
      setRelatedCases([]);
    } finally {
      setCasesLoading(false);
    }
  };

  // Filter and sort cases
  const filterAndSortCases = (cases, searchQuery, sortBy, sortOrder) => {
    let filtered = cases;

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(case_ => 
        case_.title?.toLowerCase().includes(query) ||
        case_.suit_reference_number?.toLowerCase().includes(query) ||
        case_.area_of_law?.toLowerCase().includes(query) ||
        case_.protagonist?.toLowerCase().includes(query) ||
        case_.antagonist?.toLowerCase().includes(query)
      );
    }

    // Sort cases
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'title':
          aValue = a.title || '';
          bValue = b.title || '';
          break;
        case 'date':
          aValue = new Date(a.date || 0);
          bValue = new Date(b.date || 0);
          break;
        case 'court':
          aValue = a.court_type || '';
          bValue = b.court_type || '';
          break;
        default:
          aValue = a.title || '';
          bValue = b.title || '';
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  };

  // Update filtered cases when search query, sort options, or related cases change
  useEffect(() => {
    const filtered = filterAndSortCases(relatedCases, caseSearchQuery, caseSortBy, caseSortOrder);
    setFilteredCases(filtered);
  }, [relatedCases, caseSearchQuery, caseSortBy, caseSortOrder]);

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return 'N/A';
    }
  };

  const formatCurrency = (amount) => {
    if (!amount || amount === 0) return 'N/A';
    return new Intl.NumberFormat('en-GH', {
      style: 'currency',
      currency: 'GHS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatArray = (array) => {
    if (!array) return [];
    if (Array.isArray(array)) return array;
    if (typeof array === 'string') return array.split(',').map(item => item.trim());
    return [];
  };

  const InfoRow = ({ label, value, icon: Icon }) => (
    <div className="flex items-center justify-between py-2">
      <div className="flex items-center space-x-2">
        <Icon className="w-4 h-4 text-gray-500" />
        <span className="text-sm font-medium text-gray-700">{label}</span>
      </div>
      <span className="text-sm text-gray-900">{value || 'N/A'}</span>
    </div>
  );

  // Handle request details modal
  const handleRequestDetails = (caseItem) => {
    setSelectedCase(caseItem);
    setShowRequestModal(true);
  };

  // Handle profile request modal
  const handleProfileRequest = () => {
    setShowProfileRequestModal(true);
  };

  const ArrayDisplay = ({ label, items, icon: Icon }) => (
    <div className="py-2">
      <div className="flex items-center space-x-2 mb-2">
        <Icon className="w-4 h-4 text-gray-500" />
        <span className="text-sm font-medium text-gray-700">{label}</span>
      </div>
      <div className="space-y-1">
        {items.map((item, index) => (
          <div key={index} className="text-sm text-gray-900 bg-gray-50 px-3 py-1 rounded">
            {typeof item === 'object' ? (
              <div className="space-y-1">
                {item.name && <div className="font-medium">{item.name}</div>}
                {item.position && <div className="text-xs text-gray-600">{item.position}</div>}
                {item.nationality && <div className="text-xs text-gray-500">{item.nationality}</div>}
                {item.occupation && <div className="text-xs text-gray-500">{item.occupation}</div>}
                {item.email && <div className="text-xs text-blue-600">{item.email}</div>}
                {item.contact && <div className="text-xs text-gray-500">{item.contact}</div>}
                {item.address && <div className="text-xs text-gray-500">{item.address}</div>}
                {item.tax_identification_number && <div className="text-xs text-gray-500">TIN: {item.tax_identification_number}</div>}
                {item.other_directorship && Array.isArray(item.other_directorship) && item.other_directorship.length > 0 && (
                  <div className="text-xs text-gray-500">
                    Other Directorships: {item.other_directorship.join(', ')}
                  </div>
                )}
              </div>
            ) : (
              item
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const SectionHeader = ({ title, icon: Icon, isExpanded, onToggle }) => (
    <button
      onClick={onToggle}
      className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
    >
      <div className="flex items-center space-x-2">
        <Icon className="w-5 h-5 text-gray-600" />
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
      </div>
      {isExpanded ? (
        <ChevronUp className="w-5 h-5 text-gray-400" />
      ) : (
        <ChevronDown className="w-5 h-5 text-gray-400" />
      )}
    </button>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-sky-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading company profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-4">
            <AlertTriangle className="h-16 w-16 mx-auto mb-4" />
            <h2 className="text-2xl font-bold">Error Loading Company</h2>
            <p className="text-gray-600 mt-2">{error}</p>
          </div>
          <button
            onClick={() => navigate('/companies')}
            className="bg-sky-600 text-white px-6 py-2 rounded-lg hover:bg-sky-700 transition-colors"
          >
            Back to Companies
          </button>
        </div>
      </div>
    );
  }

  if (!companyData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-600 mb-4">
            <Building2 className="h-16 w-16 mx-auto mb-4" />
            <h2 className="text-2xl font-bold">Company Not Found</h2>
            <p className="text-gray-600 mt-2">The requested company could not be found</p>
          </div>
          <button
            onClick={() => navigate('/companies')}
            className="bg-sky-600 text-white px-6 py-2 rounded-lg hover:bg-sky-700 transition-colors"
          >
            Back to Companies
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/companies')}
                className="flex items-center text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-5 w-5 mr-1" />
                Back to Companies
              </button>
              <div className="h-8 w-px bg-gray-300"></div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{companyData.name}</h1>
                <p className="text-gray-600 mt-1">
                  {companyData.short_name && `${companyData.short_name} • `}
                  {companyData.industry || 'Company Profile'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleProfileRequest}
                className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Request Profile Information
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Cases</p>
                <p className="text-2xl font-bold text-gray-900">0</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Resolved Cases</p>
                <p className="text-2xl font-bold text-gray-900">0</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Cases</p>
                <p className="text-2xl font-bold text-gray-900">0</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Award className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Risk Level</p>
                <p className="text-2xl font-bold text-gray-900">Low</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Company Overview */}
            <div className="bg-white rounded-lg shadow-sm border">
              <SectionHeader
                title="Company Overview"
                icon={Building2}
                isExpanded={expandedSections.overview}
                onToggle={() => toggleSection('overview')}
              />
              {expandedSections.overview && (
                <div className="p-6 border-t border-gray-200 space-y-4">
                  <InfoRow label="Company Name" value={companyData.name} icon={Building2} />
                  <InfoRow label="Short Name" value={companyData.short_name} icon={Building2} />
                  <InfoRow label="Industry" value={companyData.industry} icon={Briefcase} />
                  <InfoRow label="Company Type" value={companyData.company_type} icon={Shield} />
                  <InfoRow label="Established" value={formatDate(companyData.established_date)} icon={Calendar} />
                  <InfoRow label="Registration Number" value={companyData.registration_number} icon={FileText} />
                  <InfoRow label="Tax ID" value={companyData.tax_id} icon={FileText} />
                  
                  {companyData.description && (
                    <div className="pt-4 border-t border-gray-200">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Description</h4>
                      <p className="text-sm text-gray-900">{companyData.description}</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Contact Information */}
            <div className="bg-white rounded-lg shadow-sm border">
              <SectionHeader
                title="Contact Information"
                icon={Phone}
                isExpanded={expandedSections.contact}
                onToggle={() => toggleSection('contact')}
              />
              {expandedSections.contact && (
                <div className="p-6 border-t border-gray-200 space-y-4">
                  <InfoRow label="Phone" value={companyData.phone} icon={Phone} />
                  <InfoRow label="Email" value={companyData.email} icon={Mail} />
                  <InfoRow label="Website" value={companyData.website} icon={Globe} />
                  <InfoRow label="Address" value={companyData.address} icon={MapPin} />
                  <InfoRow label="City" value={companyData.city} icon={MapPin} />
                  <InfoRow label="Region" value={companyData.region} icon={MapPin} />
                  <InfoRow label="Postal Code" value={companyData.postal_code} icon={MapPin} />
                </div>
              )}
            </div>

            {/* Management & Key Personnel */}
            <div className="bg-white rounded-lg shadow-sm border">
              <SectionHeader
                title="Management & Key Personnel"
                icon={Users}
                isExpanded={expandedSections.management}
                onToggle={() => toggleSection('management')}
              />
              {expandedSections.management && (
                <div className="p-6 border-t border-gray-200 space-y-4">
                  <ArrayDisplay 
                    label="Directors" 
                    items={formatArray(companyData.directors)} 
                    icon={Users} 
                  />
                  <ArrayDisplay 
                    label="Managers" 
                    items={formatArray(companyData.managers)} 
                    icon={Users} 
                  />
                  <ArrayDisplay 
                    label="Secretaries" 
                    items={formatArray(companyData.secretaries)} 
                    icon={Users} 
                  />
                  <ArrayDisplay 
                    label="Shareholders" 
                    items={formatArray(companyData.shareholders)} 
                    icon={Users} 
                  />
                  <InfoRow label="Employee Count" value={companyData.employee_count} icon={Users} />
                  <InfoRow label="Annual Revenue" value={formatCurrency(companyData.annual_revenue)} icon={TrendingUp} />
                </div>
              )}
            </div>

            {/* Employees */}
            <div className="bg-white rounded-lg shadow-sm border">
              <SectionHeader
                title="Employees"
                icon={Users}
                isExpanded={expandedSections.employees}
                onToggle={() => toggleSection('employees')}
              />
              {expandedSections.employees && (
                <div className="border-t border-gray-200">
                  <CompanyEmployees
                    companyId={parseInt(id)}
                    companyType="company"
                    companyName={companyData.name}
                  />
                </div>
              )}
            </div>

            {/* Business Activities */}
            {companyData.business_activities && formatArray(companyData.business_activities).length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border">
                <SectionHeader
                  title="Business Activities"
                  icon={Briefcase}
                  isExpanded={expandedSections.activities}
                  onToggle={() => toggleSection('activities')}
                />
                {expandedSections.activities && (
                  <div className="p-6 border-t border-gray-200">
                    <ArrayDisplay 
                      label="Activities" 
                      items={formatArray(companyData.business_activities)} 
                      icon={Briefcase} 
                    />
                  </div>
                )}
              </div>
            )}

            {/* Legal Cases */}
            <div className="bg-white rounded-lg shadow-sm border">
              <SectionHeader
                title="Legal Cases"
                icon={Scale}
                isExpanded={expandedSections.cases}
                onToggle={() => toggleSection('cases')}
              />
              {expandedSections.cases && (
                <div className="p-6 border-t border-gray-200">
                  {/* Cases Header */}
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Related Cases ({filteredCases.length} of {relatedCases.length})
                    </h3>
                    <div className="flex items-center space-x-2">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Search cases..."
                          value={caseSearchQuery}
                          onChange={(e) => setCaseSearchQuery(e.target.value)}
                          className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
                        />
                      </div>
                      <select
                        value={caseSortBy}
                        onChange={(e) => setCaseSortBy(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="date">Sort by Date</option>
                        <option value="title">Sort by Title</option>
                        <option value="court">Sort by Court</option>
                      </select>
                      <button
                        onClick={() => setCaseSortOrder(caseSortOrder === 'asc' ? 'desc' : 'asc')}
                        className="p-2 text-gray-500 hover:text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                      >
                        <ArrowUpDown className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Cases Loading */}
                  {casesLoading && (
                    <div className="flex items-center justify-center py-8">
                      <RefreshCw className="h-6 w-6 animate-spin text-blue-500" />
                      <span className="ml-2 text-gray-600">Loading cases...</span>
                    </div>
                  )}

                  {/* Cases List */}
                  {!casesLoading && filteredCases.length > 0 && (
                    <div className="space-y-3">
                      {filteredCases.map((case_, index) => (
                        <div
                          key={case_.id || index}
                          className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors cursor-pointer"
                          onClick={() => {
                            setSelectedCase(case_);
                            setShowRequestModal(true);
                          }}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900 mb-1">
                                {case_.title || 'Untitled Case'}
                              </h4>
                              <div className="flex items-center space-x-4 text-sm text-gray-600">
                                <span className="flex items-center">
                                  <FileText className="h-4 w-4 mr-1" />
                                  {case_.suit_reference_number || 'N/A'}
                                </span>
                                <span className="flex items-center">
                                  <Calendar className="h-4 w-4 mr-1" />
                                  {formatDate(case_.date)}
                                </span>
                                <span className="flex items-center">
                                  <Scale className="h-4 w-4 mr-1" />
                                  {case_.court_type || 'N/A'}
                                </span>
                                <span className="flex items-center">
                                  <BookOpen className="h-4 w-4 mr-1" />
                                  {case_.area_of_law || 'N/A'}
                                </span>
                              </div>
                              <div className="mt-2 text-sm text-gray-600">
                                <p><strong>Protagonist:</strong> {case_.protagonist || 'N/A'}</p>
                                <p><strong>Antagonist:</strong> {case_.antagonist || 'N/A'}</p>
                                {case_.presiding_judge && (
                                  <p><strong>Judge:</strong> {case_.presiding_judge}</p>
                                )}
                              </div>
                            </div>
                            <ExternalLink className="h-5 w-5 text-gray-400" />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* No Cases Found */}
                  {!casesLoading && filteredCases.length === 0 && (
                    <div className="text-center py-8">
                      <Scale className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No Cases Found</h3>
                      <p className="text-gray-600">
                        {relatedCases.length === 0 
                          ? "This company has no legal cases in the database"
                          : "No cases match your search criteria"
                        }
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Analytics */}
          <div className="space-y-6">
            {/* Analytics */}
            <div className="bg-white rounded-lg shadow-sm border">
              <SectionHeader
                title="Analytics"
                icon={TrendingUp}
                isExpanded={expandedSections.analytics}
                onToggle={() => toggleSection('analytics')}
              />
              {expandedSections.analytics && (
                <div className="p-6 border-t border-gray-200 space-y-4">
                  <div className="text-center py-8">
                    <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Analytics Available</h3>
                    <p className="text-gray-600">Analytics will be available once cases are added</p>
                  </div>
                </div>
              )}
            </div>

            {/* Company Status */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Company Status</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Active Status</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    companyData.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {companyData.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Last Updated</span>
                  <span className="text-sm text-gray-900">{formatDate(companyData.updated_at)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Created</span>
                  <span className="text-sm text-gray-900">{formatDate(companyData.created_at)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Request Details Modal */}
      <RequestDetailsModal
        isOpen={showRequestModal}
        onClose={() => setShowRequestModal(false)}
        caseData={selectedCase}
        entityType="Company"
        entityName={companyData?.name}
      />

      {/* Profile Request Modal */}
      <RequestDetailsModal
        isOpen={showProfileRequestModal}
        onClose={() => setShowProfileRequestModal(false)}
        caseData={null}
        entityType="Company"
        entityName={companyData?.name}
        isProfileRequest={true}
      />
    </div>
  );
};

export default CompanyProfile;