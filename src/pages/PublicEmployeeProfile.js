import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, Phone, MapPin, Calendar, Briefcase, GraduationCap, Award, FileText, User, Building2, Globe, Linkedin, Twitter, Facebook, Download, Star, Clock, Shield, AlertCircle } from 'lucide-react';
import { apiGet } from '../utils/api';

const PublicEmployeeProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (id) {
      loadEmployeeProfile(id);
    }
  }, [id]);

  const loadEmployeeProfile = async (employeeId) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const data = await apiGet(`/employees/${employeeId}`);
      setEmployee(data);
    } catch (error) {
      console.error('Error loading employee profile:', error);
      setError('Employee Not Found');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-yellow-100 text-yellow-800';
      case 'terminated': return 'bg-red-100 text-red-800';
      case 'resigned': return 'bg-gray-100 text-gray-800';
      case 'retired': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getEmploymentTypeColor = (type) => {
    switch (type) {
      case 'full_time': return 'bg-blue-100 text-blue-800';
      case 'part_time': return 'bg-purple-100 text-purple-800';
      case 'contract': return 'bg-orange-100 text-orange-800';
      case 'intern': return 'bg-pink-100 text-pink-800';
      case 'consultant': return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading employee profile...</p>
        </div>
      </div>
    );
  }

  if (error || !employee) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Employee Not Found</h2>
          <p className="text-gray-600 mb-4">{error || 'The employee you are looking for does not exist.'}</p>
          <button
            onClick={() => navigate(-1)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
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
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate(-1)}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Employee Profile</h1>
                <p className="text-sm text-gray-500">Professional profile and information</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Sidebar - Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              {/* Profile Header */}
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-8 text-center">
                <div className="w-24 h-24 bg-white rounded-full mx-auto mb-4 flex items-center justify-center">
                  <span className="text-2xl font-bold text-blue-600">
                    {employee.first_name?.[0]}{employee.last_name?.[0]}
                  </span>
                </div>
                <h2 className="text-xl font-bold text-white">
                  {employee.first_name} {employee.last_name}
                </h2>
                <p className="text-blue-100 mt-1">{employee.job_title || 'Employee'}</p>
                <p className="text-blue-200 text-sm mt-1">{employee.department || 'No Department'}</p>
              </div>

              {/* Profile Details */}
              <div className="p-6 space-y-4">
                {/* Contact Information */}
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-3">Contact Information</h3>
                  <div className="space-y-2">
                    {employee.email && (
                      <div className="flex items-center space-x-3 text-sm">
                        <Mail className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600">{employee.email}</span>
                      </div>
                    )}
                    {employee.phone_number && (
                      <div className="flex items-center space-x-3 text-sm">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600">{employee.phone_number}</span>
                      </div>
                    )}
                    {employee.city && employee.country && (
                      <div className="flex items-center space-x-3 text-sm">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600">{employee.city}, {employee.country}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Employment Status */}
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-3">Employment Status</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Status</span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(employee.employment_status)}`}>
                        {employee.employment_status || 'Unknown'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Type</span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getEmploymentTypeColor(employee.employee_type)}`}>
                        {employee.employee_type?.replace('_', ' ').toUpperCase() || 'Unknown'}
                      </span>
                    </div>
                    {employee.start_date && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Start Date</span>
                        <span className="text-sm text-gray-900">{formatDate(employee.start_date)}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Social Links */}
                {(employee.linkedin_url || employee.twitter_url || employee.facebook_url || employee.personal_website) && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-3">Social Links</h3>
                    <div className="space-y-2">
                      {employee.linkedin_url && (
                        <a href={employee.linkedin_url} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-3 text-sm text-blue-600 hover:text-blue-800">
                          <Linkedin className="h-4 w-4" />
                          <span>LinkedIn Profile</span>
                        </a>
                      )}
                      {employee.twitter_url && (
                        <a href={employee.twitter_url} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-3 text-sm text-blue-600 hover:text-blue-800">
                          <Twitter className="h-4 w-4" />
                          <span>Twitter Profile</span>
                        </a>
                      )}
                      {employee.facebook_url && (
                        <a href={employee.facebook_url} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-3 text-sm text-blue-600 hover:text-blue-800">
                          <Facebook className="h-4 w-4" />
                          <span>Facebook Profile</span>
                        </a>
                      )}
                      {employee.personal_website && (
                        <a href={employee.personal_website} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-3 text-sm text-blue-600 hover:text-blue-800">
                          <Globe className="h-4 w-4" />
                          <span>Personal Website</span>
                        </a>
                      )}
                    </div>
                  </div>
                )}

                {/* CV Download */}
                {employee.cv_file && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-3">Documents</h3>
                    <a
                      href={employee.cv_file}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-2 text-sm text-blue-600 hover:text-blue-800"
                    >
                      <Download className="h-4 w-4" />
                      <span>Download CV</span>
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Content - Main Profile */}
          <div className="lg:col-span-2">
            {/* Tabs */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
              <div className="border-b border-gray-200">
                <nav className="flex space-x-8 px-6">
                  {['overview', 'experience', 'education', 'skills'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`py-4 px-1 border-b-2 font-medium text-sm capitalize ${
                        activeTab === tab
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </nav>
              </div>

              <div className="p-6">
                {/* Overview Tab */}
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    {/* Bio */}
                    {employee.bio && (
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">About</h3>
                        <p className="text-gray-700 leading-relaxed">{employee.bio}</p>
                      </div>
                    )}

                    {/* Current Employment */}
                    {employee.current_employer_name && (
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Current Employment</h3>
                        <div className="bg-gray-50 rounded-lg p-4">
                          <div className="flex items-start space-x-3">
                            <Building2 className="h-5 w-5 text-gray-400 mt-1" />
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900">{employee.job_title || 'Employee'}</h4>
                              <p className="text-gray-600">{employee.current_employer_name}</p>
                              <p className="text-sm text-gray-500">{employee.department || 'No Department'}</p>
                              {employee.start_date && (
                                <p className="text-sm text-gray-500 mt-1">
                                  Since {formatDate(employee.start_date)}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Skills */}
                    {employee.skills && employee.skills.length > 0 && (
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Skills</h3>
                        <div className="flex flex-wrap gap-2">
                          {employee.skills.map((skill, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Languages */}
                    {employee.languages && employee.languages.length > 0 && (
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Languages</h3>
                        <div className="space-y-2">
                          {employee.languages.map((lang, index) => (
                            <div key={index} className="flex items-center justify-between">
                              <span className="text-gray-700">{lang.language}</span>
                              <span className="text-sm text-gray-500 capitalize">{lang.proficiency}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Experience Tab */}
                {activeTab === 'experience' && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-gray-900">Work Experience</h3>

                    {/* Current Employment */}
                    {employee.current_employer_name && (
                      <div className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">{employee.job_title || 'Employee'}</h4>
                            <p className="text-gray-600">{employee.current_employer_name}</p>
                            <p className="text-sm text-gray-500">{employee.department || 'No Department'}</p>
                            <p className="text-sm text-gray-500">
                              {employee.start_date ? formatDate(employee.start_date) : 'Start date not specified'}
                              {employee.end_date ? ` - ${formatDate(employee.end_date)}` : ' - Present'}
                            </p>
                            {employee.bio && (
                              <p className="text-gray-700 mt-2 text-sm">{employee.bio}</p>
                            )}
                          </div>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(employee.employment_status)}`}>
                            {employee.employment_status || 'Unknown'}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Employment History */}
                    {employee.employment_history && employee.employment_history.length > 0 ? (
                      <div className="space-y-4">
                        {employee.employment_history.map((job, index) => (
                          <div key={index} className="border border-gray-200 rounded-lg p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h4 className="font-medium text-gray-900">{job.position || 'Position'}</h4>
                                <p className="text-gray-600">{job.company || 'Company'}</p>
                                <p className="text-sm text-gray-500">{job.department || 'Department'}</p>
                                <p className="text-sm text-gray-500">
                                  {job.start_date ? formatDate(job.start_date) : 'Start date not specified'}
                                  {job.end_date ? ` - ${formatDate(job.end_date)}` : ' - Present'}
                                </p>
                                {job.description && (
                                  <p className="text-gray-700 mt-2 text-sm">{job.description}</p>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <Briefcase className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                        <p>No employment history available</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Education Tab */}
                {activeTab === 'education' && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-gray-900">Education</h3>

                    {employee.education && employee.education.length > 0 ? (
                      <div className="space-y-4">
                        {employee.education.map((edu, index) => (
                          <div key={index} className="border border-gray-200 rounded-lg p-4">
                            <div className="flex items-start space-x-3">
                              <GraduationCap className="h-5 w-5 text-gray-400 mt-1" />
                              <div className="flex-1">
                                <h4 className="font-medium text-gray-900">{edu.degree || 'Degree'}</h4>
                                <p className="text-gray-600">{edu.institution || 'Institution'}</p>
                                <p className="text-sm text-gray-500">
                                  {edu.start_date ? formatDate(edu.start_date) : 'Start date not specified'}
                                  {edu.end_date ? ` - ${formatDate(edu.end_date)}` : ' - Present'}
                                </p>
                                {edu.description && (
                                  <p className="text-gray-700 mt-2 text-sm">{edu.description}</p>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <GraduationCap className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                        <p>No education history available</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Skills Tab */}
                {activeTab === 'skills' && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-gray-900">Skills & Certifications</h3>

                    {/* Skills */}
                    {employee.skills && employee.skills.length > 0 && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-3">Skills</h4>
                        <div className="flex flex-wrap gap-2">
                          {employee.skills.map((skill, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Certifications */}
                    {employee.certifications && employee.certifications.length > 0 && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-3">Certifications</h4>
                        <div className="space-y-3">
                          {employee.certifications.map((cert, index) => (
                            <div key={index} className="border border-gray-200 rounded-lg p-4">
                              <div className="flex items-start space-x-3">
                                <Award className="h-5 w-5 text-gray-400 mt-1" />
                                <div className="flex-1">
                                  <h5 className="font-medium text-gray-900">{cert.name || 'Certification'}</h5>
                                  <p className="text-gray-600">{cert.issuer || 'Issuer'}</p>
                                  {cert.date && (
                                    <p className="text-sm text-gray-500">{formatDate(cert.date)}</p>
                                  )}
                                  {cert.description && (
                                    <p className="text-gray-700 mt-2 text-sm">{cert.description}</p>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Languages */}
                    {employee.languages && employee.languages.length > 0 && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-3">Languages</h4>
                        <div className="space-y-2">
                          {employee.languages.map((lang, index) => (
                            <div key={index} className="flex items-center justify-between">
                              <span className="text-gray-700">{lang.language}</span>
                              <span className="text-sm text-gray-500 capitalize">{lang.proficiency}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {(!employee.skills || employee.skills.length === 0) && 
                     (!employee.certifications || employee.certifications.length === 0) && 
                     (!employee.languages || employee.languages.length === 0) && (
                      <div className="text-center py-8 text-gray-500">
                        <Award className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                        <p>No skills or certifications available</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicEmployeeProfile;
