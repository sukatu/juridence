import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Building2, MapPin, Phone, Mail, Globe, Users, TrendingUp, Award, Star, Clock, Eye, EyeOff, AlertCircle, ExternalLink, Download, FileText, Briefcase, DollarSign, User } from 'lucide-react';

const CompanyDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [companyData, setCompanyData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedSections, setExpandedSections] = useState({
    basicInfo: true,
    contactInfo: true,
    businessInfo: true,
    financialInfo: true,
    management: true,
    previousNames: true,
    subsidiaries: true,
    activities: true
  });

  // Load company data
  useEffect(() => {
    const loadCompanyData = async () => {
      if (!id) {
        setError('Company ID not provided');
        setIsLoading(false);
        return;
      }

      try {
        const token = localStorage.getItem('accessToken') || 'test-token-123';
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
        setIsLoading(false);
      }
    };

    loadCompanyData();
  }, [id]);

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
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

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const formatRegion = (regionCode) => {
    if (!regionCode) return 'N/A';

    const regionMappings = {
      'GAR': 'Greater Accra Region',
      'ASR': 'Ashanti Region',
      'UWR': 'Upper West Region',
      'UER': 'Upper East Region',
      'NR': 'Northern Region',
      'BR': 'Brong-Ahafo Region',
      'VR': 'Volta Region',
      'ER': 'Eastern Region',
      'CR': 'Central Region',
      'WR': 'Western Region',
      'WNR': 'Western North Region',
      'AHA': 'Ahafo Region',
      'BON': 'Bono Region',
      'BON_E': 'Bono East Region',
      'OTI': 'Oti Region',
      'SAV': 'Savannah Region',
      'NEA': 'North East Region'
    };

    return regionMappings[regionCode.toUpperCase()] || regionCode;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading company details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!companyData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Company not found</p>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate(-1)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{companyData.name}</h1>
                <p className="text-gray-600">
                  {companyData.short_name && `${companyData.short_name} • `}
                  {companyData.industry || 'N/A'} • {formatRegion(companyData.region)}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {companyData.rating && (
                <div className="flex items-center space-x-1">
                  <Star className="w-5 h-5 text-yellow-400 fill-current" />
                  <span className="text-sm font-medium text-gray-900">{companyData.rating}</span>
                </div>
              )}
              <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                companyData.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}>
                {companyData.is_active ? 'Active' : 'Inactive'}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <section className="rounded-xl border border-slate-200 bg-white p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-blue-600" />
                  Basic Information
                </h2>
                <button
                  onClick={() => toggleSection('basicInfo')}
                  className="text-slate-400 hover:text-slate-600"
                >
                  {expandedSections.basicInfo ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>

              {expandedSections.basicInfo && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wide">Company Name</h3>
                      <p className="mt-1 text-lg font-semibold text-slate-900">{companyData.name}</p>
                    </div>
                    
                    {companyData.short_name && (
                      <div>
                        <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wide">Short Name</h3>
                        <p className="mt-1 text-slate-900">{companyData.short_name}</p>
                      </div>
                    )}
                    
                    <div>
                      <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wide">Company Type</h3>
                      <p className="mt-1 text-slate-900">{companyData.company_type || 'N/A'}</p>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wide">Industry</h3>
                      <p className="mt-1 text-slate-900">{companyData.industry || 'N/A'}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wide">Registration Number</h3>
                      <p className="mt-1 text-slate-900">{companyData.registration_number || 'N/A'}</p>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wide">TIN Number</h3>
                      <p className="mt-1 text-slate-900">{companyData.tin_number || 'N/A'}</p>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wide">Established Date</h3>
                      <p className="mt-1 text-slate-900">{formatDate(companyData.established_date)}</p>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wide">Ownership Type</h3>
                      <p className="mt-1 text-slate-900">{companyData.ownership_type || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              )}
            </section>

            {/* Contact Information */}
            <section className="rounded-xl border border-slate-200 bg-white p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                  <Phone className="h-5 w-5 text-green-600" />
                  Contact Information
                </h2>
                <button
                  onClick={() => toggleSection('contactInfo')}
                  className="text-slate-400 hover:text-slate-600"
                >
                  {expandedSections.contactInfo ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>

              {expandedSections.contactInfo && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    {companyData.phone && (
                      <div className="flex items-center space-x-3">
                        <Phone className="h-5 w-5 text-green-600" />
                        <div>
                          <h3 className="text-sm font-medium text-slate-500">Phone</h3>
                          <p className="text-slate-900">{companyData.phone}</p>
                        </div>
                      </div>
                    )}
                    
                    {companyData.email && (
                      <div className="flex items-center space-x-3">
                        <Mail className="h-5 w-5 text-green-600" />
                        <div>
                          <h3 className="text-sm font-medium text-slate-500">Email</h3>
                          <p className="text-slate-900">{companyData.email}</p>
                        </div>
                      </div>
                    )}
                    
                    {companyData.website && (
                      <div className="flex items-center space-x-3">
                        <Globe className="h-5 w-5 text-green-600" />
                        <div>
                          <h3 className="text-sm font-medium text-slate-500">Website</h3>
                          <a href={companyData.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
                            {companyData.website}
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-4">
                    {companyData.address && (
                      <div className="flex items-start space-x-3">
                        <MapPin className="h-5 w-5 text-green-600 mt-1" />
                        <div>
                          <h3 className="text-sm font-medium text-slate-500">Address</h3>
                          <p className="text-slate-900">{companyData.address}</p>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-center space-x-3">
                      <MapPin className="h-5 w-5 text-green-600" />
                      <div>
                        <h3 className="text-sm font-medium text-slate-500">Location</h3>
                        <p className="text-slate-900">
                          {companyData.city || 'N/A'}, {formatRegion(companyData.region)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </section>

            {/* Business Information */}
            <section className="rounded-xl border border-slate-200 bg-white p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-purple-600" />
                  Business Information
                </h2>
                <button
                  onClick={() => toggleSection('businessInfo')}
                  className="text-slate-400 hover:text-slate-600"
                >
                  {expandedSections.businessInfo ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>

              {expandedSections.businessInfo && (
                <div className="space-y-6">
                  {companyData.description && (
                    <div>
                      <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wide mb-2">Description</h3>
                      <p className="text-slate-700 leading-relaxed">{companyData.description}</p>
                    </div>
                  )}
                  
                  {companyData.business_activities && companyData.business_activities.length > 0 && (
                    <div>
                      <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wide mb-3">Business Activities</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {companyData.business_activities.map((activity, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                            <span className="text-sm text-slate-700">{activity}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </section>

            {/* Financial Information */}
            <section className="rounded-xl border border-slate-200 bg-white p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-yellow-600" />
                  Financial Information
                </h2>
                <button
                  onClick={() => toggleSection('financialInfo')}
                  className="text-slate-400 hover:text-slate-600"
                >
                  {expandedSections.financialInfo ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>

              {expandedSections.financialInfo && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      <TrendingUp className="h-6 w-6 text-yellow-600" />
                    </div>
                    <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wide">Annual Revenue</h3>
                    <p className="mt-1 text-lg font-semibold text-slate-900">
                      {formatCurrency(companyData.annual_revenue)}
                    </p>
                  </div>
                  
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      <Award className="h-6 w-6 text-yellow-600" />
                    </div>
                    <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wide">Net Worth</h3>
                    <p className="mt-1 text-lg font-semibold text-slate-900">
                      {formatCurrency(companyData.net_worth)}
                    </p>
                  </div>
                  
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      <Users className="h-6 w-6 text-yellow-600" />
                    </div>
                    <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wide">Employees</h3>
                    <p className="mt-1 text-lg font-semibold text-slate-900">
                      {companyData.employee_count || 0}
                    </p>
                  </div>
                </div>
              )}
            </section>

            {/* Management Team */}
            {companyData.board_of_directors && companyData.board_of_directors.length > 0 && (
              <section className="rounded-xl border border-slate-200 bg-white p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                    <User className="h-5 w-5 text-indigo-600" />
                    Management Team
                  </h2>
                  <button
                    onClick={() => toggleSection('management')}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    {expandedSections.management ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>

                {expandedSections.management && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {companyData.board_of_directors.map((member, index) => (
                      <div key={index} className="bg-slate-50 p-4 rounded-lg">
                        <h3 className="font-medium text-slate-900">{member.name}</h3>
                        <p className="text-sm text-slate-600">{member.position}</p>
                        {member.nationality && (
                          <p className="text-xs text-slate-500">{member.nationality}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </section>
            )}

            {/* Previous Names */}
            {companyData.previous_names && companyData.previous_names.length > 0 && (
              <section className="rounded-xl border border-slate-200 bg-white p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                    <Clock className="h-5 w-5 text-purple-600" />
                    Previous Names
                  </h2>
                  <button
                    onClick={() => toggleSection('previousNames')}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    {expandedSections.previousNames ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>

                {expandedSections.previousNames && (
                  <div className="space-y-3">
                    <div className="bg-purple-50 p-4 rounded-lg border-l-4 border-purple-500">
                      <div className="flex items-center space-x-2 mb-2">
                        <Clock className="w-4 h-4 text-purple-600" />
                        <span className="text-xs font-medium text-purple-800 uppercase tracking-wide">Historical Names</span>
                      </div>
                      <div className="space-y-2">
                        {companyData.previous_names.map((name, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                            <span className="text-sm text-purple-900">{name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </section>
            )}

            {/* Subsidiaries */}
            {companyData.subsidiaries && companyData.subsidiaries.length > 0 && (
              <section className="rounded-xl border border-slate-200 bg-white p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-orange-600" />
                    Subsidiaries
                  </h2>
                  <button
                    onClick={() => toggleSection('subsidiaries')}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    {expandedSections.subsidiaries ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>

                {expandedSections.subsidiaries && (
                  <div className="space-y-2">
                    {companyData.subsidiaries.map((subsidiary, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                        <span className="text-sm text-slate-700">{subsidiary}</span>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Company Status */}
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Company Status</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Status</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    companyData.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {companyData.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Verified</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    companyData.is_verified ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                  }`}>
                    {companyData.is_verified ? 'Verified' : 'Unverified'}
                  </span>
                </div>
                
                {companyData.rating && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Rating</span>
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="text-sm font-medium text-slate-900">{companyData.rating}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Digital Presence */}
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Digital Presence</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Website</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    companyData.has_website ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                  }`}>
                    {companyData.has_website ? 'Yes' : 'No'}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Social Media</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    companyData.has_social_media ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                  }`}>
                    {companyData.has_social_media ? 'Yes' : 'No'}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Mobile App</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    companyData.has_mobile_app ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                  }`}>
                    {companyData.has_mobile_app ? 'Yes' : 'No'}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  <FileText className="w-4 h-4" />
                  <span>Request Information</span>
                </button>
                
                <button className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                  <Download className="w-4 h-4" />
                  <span>Download Report</span>
                </button>
                
                {companyData.website && (
                  <a
                    href={companyData.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>Visit Website</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyDetail;
