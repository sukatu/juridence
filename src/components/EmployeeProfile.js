import React, { useState, useEffect, useCallback } from 'react';
import { apiGet } from '../utils/api';

const EmployeeProfile = ({ employeeId, onClose }) => {
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  const fetchEmployeeProfile = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiGet(`/employees/${employeeId}`);
      setEmployee(response);
    } catch (error) {
      console.error('Error fetching employee profile:', error);
    } finally {
      setLoading(false);
    }
  }, [employeeId]);

  useEffect(() => {
    if (employeeId) {
      fetchEmployeeProfile();
    }
  }, [employeeId, fetchEmployeeProfile]);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
        <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
        <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
          <div className="text-center py-8">
            <p className="text-gray-500">Employee not found</p>
            <button
              onClick={onClose}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'Present';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-yellow-100 text-yellow-800';
      case 'terminated':
        return 'bg-red-100 text-red-800';
      case 'resigned':
        return 'bg-orange-100 text-orange-800';
      case 'retired':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-4 mx-auto p-5 border w-11/12 max-w-6xl shadow-lg rounded-md bg-white">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              {employee.profile_picture ? (
                <img
                  className="h-24 w-24 rounded-full object-cover"
                  src={employee.profile_picture}
                  alt={`${employee.first_name} ${employee.last_name}`}
                />
              ) : (
                <div className="h-24 w-24 rounded-full bg-gray-300 flex items-center justify-center">
                  <span className="text-2xl font-medium text-gray-700">
                    {employee.first_name[0]}{employee.last_name[0]}
                  </span>
                </div>
              )}
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900">
                {employee.first_name} {employee.middle_name} {employee.last_name}
              </h1>
              <p className="text-lg text-gray-600">{employee.job_title}</p>
              <p className="text-gray-500">{employee.current_employer_name}</p>
              <div className="flex items-center space-x-4 mt-2">
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(employee.employment_status)}`}>
                  {employee.employment_status}
                </span>
                <span className="text-sm text-gray-500">
                  {formatDate(employee.start_date)} - {formatDate(employee.end_date)}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            {['overview', 'experience', 'education', 'skills', 'legal'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-2 px-1 border-b-2 font-medium text-sm capitalize ${
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

        {/* Tab Content */}
        <div className="space-y-6">
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6">
                {/* About */}
                {employee.bio && (
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">About</h3>
                    <p className="text-gray-700">{employee.bio}</p>
                  </div>
                )}

                {/* Summary */}
                {employee.summary && (
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Professional Summary</h3>
                    <p className="text-gray-700">{employee.summary}</p>
                  </div>
                )}

                {/* Current Role */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Current Role</h3>
                  <div className="space-y-2">
                    <p className="text-lg font-medium text-gray-900">{employee.job_title}</p>
                    <p className="text-gray-600">{employee.current_employer_name}</p>
                    <p className="text-sm text-gray-500">
                      {formatDate(employee.start_date)} - {formatDate(employee.end_date)}
                    </p>
                    {employee.department && (
                      <p className="text-sm text-gray-500">Department: {employee.department}</p>
                    )}
                    {employee.salary && (
                      <p className="text-sm text-gray-500">
                        Salary: {employee.currency} {employee.salary.toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>

                {/* Contact Information */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Contact Information</h3>
                  <div className="space-y-2">
                    {employee.email && (
                      <p className="text-sm text-gray-700">
                        <span className="font-medium">Email:</span> {employee.email}
                      </p>
                    )}
                    {employee.phone_number && (
                      <p className="text-sm text-gray-700">
                        <span className="font-medium">Phone:</span> {employee.phone_number}
                      </p>
                    )}
                    {employee.address && (
                      <p className="text-sm text-gray-700">
                        <span className="font-medium">Address:</span> {employee.address}
                      </p>
                    )}
                    {employee.city && employee.region && (
                      <p className="text-sm text-gray-700">
                        <span className="font-medium">Location:</span> {employee.city}, {employee.region}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Skills */}
                {employee.skills && employee.skills.length > 0 && (
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
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
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Languages</h3>
                    <div className="space-y-2">
                      {employee.languages.map((lang, index) => (
                        <div key={index} className="flex justify-between">
                          <span className="text-sm text-gray-700">{lang.language}</span>
                          <span className="text-sm text-gray-500">{lang.proficiency}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Social Links */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Social Links</h3>
                  <div className="space-y-2">
                    {employee.linkedin_url && (
                      <a
                        href={employee.linkedin_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:text-blue-800"
                      >
                        LinkedIn Profile
                      </a>
                    )}
                    {employee.personal_website && (
                      <a
                        href={employee.personal_website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:text-blue-800"
                      >
                        Personal Website
                      </a>
                    )}
                    {employee.portfolio_url && (
                      <a
                        href={employee.portfolio_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:text-blue-800"
                      >
                        Portfolio
                      </a>
                    )}
                  </div>
                </div>

                {/* Documents */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Documents</h3>
                  <div className="space-y-2">
                    {employee.cv_file && (
                      <a
                        href={employee.cv_file}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:text-blue-800"
                      >
                        Download CV
                      </a>
                    )}
                    {employee.cover_letter && (
                      <a
                        href={employee.cover_letter}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:text-blue-800"
                      >
                        Cover Letter
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'experience' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Work Experience</h3>
              {employee.employment_history && employee.employment_history.length > 0 ? (
                <div className="space-y-4">
                  {employee.employment_history.map((job, index) => (
                    <div key={index} className="bg-white border border-gray-200 rounded-lg p-6">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="text-lg font-semibold text-gray-900">{job.job_title}</h4>
                          <p className="text-gray-600">{job.company_name}</p>
                          <p className="text-sm text-gray-500">
                            {formatDate(job.start_date)} - {formatDate(job.end_date)}
                            {job.is_current && <span className="ml-2 text-green-600">(Current)</span>}
                          </p>
                          {job.department && (
                            <p className="text-sm text-gray-500">Department: {job.department}</p>
                          )}
                          {job.description && (
                            <p className="mt-2 text-gray-700">{job.description}</p>
                          )}
                          {job.responsibilities && job.responsibilities.length > 0 && (
                            <div className="mt-3">
                              <h5 className="text-sm font-medium text-gray-900">Key Responsibilities:</h5>
                              <ul className="mt-1 list-disc list-inside text-sm text-gray-700">
                                {job.responsibilities.map((responsibility, idx) => (
                                  <li key={idx}>{responsibility}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {job.achievements && job.achievements.length > 0 && (
                            <div className="mt-3">
                              <h5 className="text-sm font-medium text-gray-900">Key Achievements:</h5>
                              <ul className="mt-1 list-disc list-inside text-sm text-gray-700">
                                {job.achievements.map((achievement, idx) => (
                                  <li key={idx}>{achievement}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                        {job.salary && (
                          <div className="text-right">
                            <p className="text-sm font-medium text-gray-900">
                              {job.currency} {job.salary.toLocaleString()}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No work experience recorded</p>
              )}
            </div>
          )}

          {activeTab === 'education' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Education</h3>
              {employee.education_history && employee.education_history.length > 0 ? (
                <div className="space-y-4">
                  {employee.education_history.map((education, index) => (
                    <div key={index} className="bg-white border border-gray-200 rounded-lg p-6">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="text-lg font-semibold text-gray-900">{education.degree}</h4>
                          <p className="text-gray-600">{education.institution_name}</p>
                          <p className="text-sm text-gray-500">
                            {formatDate(education.start_date)} - {formatDate(education.end_date)}
                            {education.is_current && <span className="ml-2 text-green-600">(Current)</span>}
                          </p>
                          {education.field_of_study && (
                            <p className="text-sm text-gray-500">Field: {education.field_of_study}</p>
                          )}
                          {education.grade && (
                            <p className="text-sm text-gray-500">Grade: {education.grade}</p>
                          )}
                          {education.gpa && (
                            <p className="text-sm text-gray-500">GPA: {education.gpa}</p>
                          )}
                          {education.description && (
                            <p className="mt-2 text-gray-700">{education.description}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No education history recorded</p>
              )}
            </div>
          )}

          {activeTab === 'skills' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Skills & Certifications</h3>
              {employee.skills_list && employee.skills_list.length > 0 ? (
                <div className="space-y-4">
                  {employee.skills_list.map((skill, index) => (
                    <div key={index} className="bg-white border border-gray-200 rounded-lg p-6">
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="text-lg font-semibold text-gray-900">{skill.skill_name}</h4>
                          <p className="text-sm text-gray-500 capitalize">{skill.proficiency_level}</p>
                          {skill.years_of_experience && (
                            <p className="text-sm text-gray-500">
                              {skill.years_of_experience} years of experience
                            </p>
                          )}
                        </div>
                        {skill.certification && (
                          <div className="text-right">
                            <p className="text-sm text-gray-600">{skill.certification}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No skills recorded</p>
              )}
            </div>
          )}

          {activeTab === 'legal' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Legal Information</h3>
              
              {/* Criminal Record */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-3">Criminal Record</h4>
                <div className="flex items-center space-x-2">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    employee.has_criminal_record ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                  }`}>
                    {employee.has_criminal_record ? 'Yes' : 'No'}
                  </span>
                  {employee.has_criminal_record && employee.criminal_record_details && (
                    <p className="text-sm text-gray-700">{employee.criminal_record_details}</p>
                  )}
                </div>
              </div>

              {/* Background Check */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-3">Background Check</h4>
                <div className="space-y-2">
                  {employee.background_check_status && (
                    <p className="text-sm text-gray-700">
                      <span className="font-medium">Status:</span> {employee.background_check_status}
                    </p>
                  )}
                  {employee.background_check_date && (
                    <p className="text-sm text-gray-700">
                      <span className="font-medium">Date:</span> {formatDate(employee.background_check_date)}
                    </p>
                  )}
                </div>
              </div>

              {/* Legal Cases */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-3">Legal Cases</h4>
                {employee.legal_cases_list && employee.legal_cases_list.length > 0 ? (
                  <div className="space-y-4">
                    {employee.legal_cases_list.map((case_item, index) => (
                      <div key={index} className="border-l-4 border-red-200 pl-4">
                        <h5 className="text-md font-semibold text-gray-900">{case_item.case_title}</h5>
                        <p className="text-sm text-gray-600">{case_item.case_number}</p>
                        <p className="text-sm text-gray-500">
                          Role: {case_item.role_in_case} | Status: {case_item.case_status}
                        </p>
                        <p className="text-sm text-gray-500">
                          {formatDate(case_item.case_start_date)} - {formatDate(case_item.case_end_date)}
                        </p>
                        {case_item.involvement_description && (
                          <p className="mt-2 text-sm text-gray-700">{case_item.involvement_description}</p>
                        )}
                        {case_item.outcome && (
                          <p className="mt-2 text-sm text-gray-700">
                            <span className="font-medium">Outcome:</span> {case_item.outcome}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No legal cases recorded</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmployeeProfile;
