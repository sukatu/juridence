import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { apiGet, apiPost, apiPut, apiDelete } from '../utils/api';

const EmployeeManagement = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    company_type: '',
    department: '',
    employment_status: '',
    employee_type: ''
  });
  const [cvFile, setCvFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  
  // Dynamic forms state
  const [employmentHistory, setEmploymentHistory] = useState([]);
  const [educationHistory, setEducationHistory] = useState([]);
  const [skills, setSkills] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    total_pages: 0
  });

  // Form state
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    middle_name: '',
    email: '',
    phone_number: '',
    date_of_birth: '',
    gender: '',
    nationality: '',
    marital_status: '',
    professional_title: '',
    job_title: '',
    department: '',
    employee_id: '',
    employee_type: 'full_time',
    employment_status: 'active',
    current_employer_id: '',
    current_employer_type: '',
    current_employer_name: '',
    start_date: '',
    end_date: '',
    salary: '',
    currency: 'GHS',
    address: '',
    city: '',
    region: '',
    postal_code: '',
    country: 'Ghana',
    bio: '',
    summary: '',
    skills: [],
    languages: [],
    certifications: [],
    awards: [],
    linkedin_url: '',
    twitter_url: '',
    facebook_url: '',
    personal_website: '',
    portfolio_url: '',
    has_criminal_record: false,
    criminal_record_details: '',
    background_check_status: '',
    background_check_date: '',
    is_verified: false,
    is_public: true,
    is_active: true
  });

  useEffect(() => {
    fetchEmployees();
  }, [pagination.page, searchQuery, filters]);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.page,
        limit: pagination.limit,
        ...(searchQuery && { query: searchQuery }),
        ...(filters.company_type && { company_type: filters.company_type }),
        ...(filters.department && { department: filters.department }),
        ...(filters.employment_status && { employment_status: filters.employment_status }),
        ...(filters.employee_type && { employee_type: filters.employee_type })
      });

      const response = await apiGet(`/employees?${params}`);
      setEmployees(response.employees);
      setPagination({
        page: response.page,
        limit: response.limit,
        total: response.total,
        total_pages: response.total_pages
      });
    } catch (error) {
      console.error('Error fetching employees:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Clean up form data - convert empty strings to null for optional fields
      const cleanedFormData = { ...formData };
      
      // Convert empty strings to null for optional fields
      Object.keys(cleanedFormData).forEach(key => {
        if (cleanedFormData[key] === '') {
          cleanedFormData[key] = null;
        }
      });
      
      // Ensure arrays are properly formatted
      if (cleanedFormData.skills && typeof cleanedFormData.skills === 'string') {
        cleanedFormData.skills = cleanedFormData.skills.split(',').map(s => s.trim()).filter(s => s);
      }
      if (cleanedFormData.languages && typeof cleanedFormData.languages === 'string') {
        cleanedFormData.languages = cleanedFormData.languages.split(',').map(s => s.trim()).filter(s => s);
      }
      
      // Add dynamic form data
      cleanedFormData.employment_history = employmentHistory;
      cleanedFormData.education_history = educationHistory;
      cleanedFormData.skills = skills;
      cleanedFormData.languages = languages;
      
      // Handle date fields - convert empty strings to null
      if (cleanedFormData.date_of_birth === '') cleanedFormData.date_of_birth = null;
      if (cleanedFormData.start_date === '') cleanedFormData.start_date = null;
      if (cleanedFormData.end_date === '') cleanedFormData.end_date = null;
      if (cleanedFormData.background_check_date === '') cleanedFormData.background_check_date = null;
      
      // Handle numeric fields
      if (cleanedFormData.salary === '') cleanedFormData.salary = null;
      if (cleanedFormData.current_employer_id === '') cleanedFormData.current_employer_id = null;
      
      // Debug: Log the cleaned form data
      console.log('Cleaned form data being sent:', cleanedFormData);
      
      let employee;
      if (selectedEmployee) {
        employee = await apiPut(`/employees/${selectedEmployee.id}`, cleanedFormData);
      } else {
        employee = await apiPost('/employees', cleanedFormData);
      }
      
      // Upload CV if file is selected
      if (cvFile && employee) {
        try {
          await uploadCv(employee.id || employee.data?.id);
        } catch (uploadError) {
          console.error('Error uploading CV:', uploadError);
          // Don't fail the entire operation if CV upload fails
        }
      }
      
      setShowAddModal(false);
      setShowEditModal(false);
      setSelectedEmployee(null);
      resetForm();
      setCvFile(null);
      fetchEmployees();
    } catch (error) {
      console.error('Error saving employee:', error);
    }
  };

  const handleEdit = (employee) => {
    setSelectedEmployee(employee);
    setFormData({
      ...employee,
      skills: employee.skills || [],
      languages: employee.languages || [],
      certifications: employee.certifications || [],
      awards: employee.awards || []
    });
    setShowEditModal(true);
  };

  const handleDelete = async (employeeId) => {
    if (window.confirm('Are you sure you want to delete this employee?')) {
      try {
        await apiDelete(`/employees/${employeeId}`);
        fetchEmployees();
      } catch (error) {
        console.error('Error deleting employee:', error);
      }
    }
  };

  // Dynamic form management functions
  const addEmploymentHistory = () => {
    setEmploymentHistory([...employmentHistory, {
      company_name: '',
      position: '',
      start_date: '',
      end_date: '',
      is_current: false,
      description: '',
      location: '',
      salary: '',
      currency: 'GHS',
      supervisor_name: '',
      supervisor_contact: '',
      reason_for_leaving: ''
    }]);
  };

  const removeEmploymentHistory = (index) => {
    setEmploymentHistory(employmentHistory.filter((_, i) => i !== index));
  };

  const updateEmploymentHistory = (index, field, value) => {
    const updated = [...employmentHistory];
    updated[index][field] = value;
    setEmploymentHistory(updated);
  };

  const addEducationHistory = () => {
    setEducationHistory([...educationHistory, {
      institution: '',
      degree: '',
      field_of_study: '',
      start_date: '',
      end_date: '',
      is_current: false,
      gpa: '',
      description: '',
      location: '',
      activities: '',
      honors: ''
    }]);
  };

  const removeEducationHistory = (index) => {
    setEducationHistory(educationHistory.filter((_, i) => i !== index));
  };

  const updateEducationHistory = (index, field, value) => {
    const updated = [...educationHistory];
    updated[index][field] = value;
    setEducationHistory(updated);
  };

  const addSkill = () => {
    setSkills([...skills, { name: '', level: 'intermediate' }]);
  };

  const removeSkill = (index) => {
    setSkills(skills.filter((_, i) => i !== index));
  };

  const updateSkill = (index, field, value) => {
    const updated = [...skills];
    updated[index][field] = value;
    setSkills(updated);
  };

  const addLanguage = () => {
    setLanguages([...languages, { language: '', proficiency: 'intermediate' }]);
  };

  const removeLanguage = (index) => {
    setLanguages(languages.filter((_, i) => i !== index));
  };

  const updateLanguage = (index, field, value) => {
    const updated = [...languages];
    updated[index][field] = value;
    setLanguages(updated);
  };

  const resetForm = () => {
    setFormData({
      first_name: '',
      last_name: '',
      middle_name: '',
      email: '',
      phone_number: '',
      date_of_birth: '',
      gender: '',
      nationality: '',
      marital_status: '',
      professional_title: '',
      job_title: '',
      department: '',
      employee_id: '',
      employee_type: 'full_time',
      employment_status: 'active',
      current_employer_id: '',
      current_employer_type: '',
      current_employer_name: '',
      start_date: '',
      end_date: '',
      salary: '',
      currency: 'GHS',
      address: '',
      city: '',
      region: '',
      postal_code: '',
      country: 'Ghana',
      bio: '',
      summary: '',
      skills: [],
      languages: [],
      certifications: [],
      awards: [],
      linkedin_url: '',
      twitter_url: '',
      facebook_url: '',
      personal_website: '',
      portfolio_url: '',
      has_criminal_record: false,
      criminal_record_details: '',
      background_check_status: '',
      background_check_date: '',
      is_verified: false,
      is_public: true,
      is_active: true
    });
    setCvFile(null);
    setEmploymentHistory([]);
    setEducationHistory([]);
    setSkills([]);
    setLanguages([]);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
      if (!allowedTypes.includes(file.type)) {
        alert('Please select a valid file type (PDF, DOC, DOCX, or TXT)');
        return;
      }
      
      // Validate file size (10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert('File size must be less than 10MB');
        return;
      }
      
      setCvFile(file);
    }
  };

  const uploadCv = async (employeeId) => {
    if (!cvFile) return null;
    
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', cvFile);
      
      const response = await fetch(`/employees/${employeeId}/upload-cv`, {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to upload CV');
      }
      
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error uploading CV:', error);
      throw error;
    } finally {
      setUploading(false);
    }
  };

  const handleArrayInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value.split(',').map(item => item.trim()).filter(item => item)
    }));
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="w-full">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Employees</h1>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Employee Management</h2>
              <p className="text-gray-600">Manage employee profiles and information</p>
            </div>
            <button
              onClick={() => {
                resetForm();
                setShowAddModal(true);
              }}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            >
              Add Employee
            </button>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search employees..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <select
              value={filters.company_type}
              onChange={(e) => setFilters(prev => ({ ...prev, company_type: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Company Types</option>
              <option value="bank">Bank</option>
              <option value="company">Company</option>
              <option value="insurance">Insurance</option>
            </select>
            <select
              value={filters.employment_status}
              onChange={(e) => setFilters(prev => ({ ...prev, employment_status: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="terminated">Terminated</option>
              <option value="resigned">Resigned</option>
              <option value="retired">Retired</option>
            </select>
            
            <div className="text-sm text-gray-600 flex items-center">
              <span>{pagination.total} total employees</span>
            </div>
          </div>
        </div>

        {/* Employees Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Job Title</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-4 text-center text-gray-500">Loading...</td>
                  </tr>
                ) : employees.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-4 text-center text-gray-500">No employees found</td>
                  </tr>
                ) : (
                  employees.map((employee) => (
                    <tr key={employee.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            {employee.profile_picture ? (
                              <img
                                className="h-10 w-10 rounded-full"
                                src={employee.profile_picture}
                                alt={`${employee.first_name} ${employee.last_name}`}
                              />
                            ) : (
                              <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                                <span className="text-sm font-medium text-gray-700">
                                  {employee.first_name[0]}{employee.last_name[0]}
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {employee.first_name} {employee.last_name}
                            </div>
                            <div className="text-sm text-gray-500">{employee.employee_id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{employee.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{employee.job_title}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{employee.current_employer_name}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          employee.employment_status === 'active' ? 'bg-green-100 text-green-800' :
                          employee.employment_status === 'inactive' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {employee.employment_status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEdit(employee)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            Edit
                          </button>
                          {employee.cv_file && (
                            <button
                              onClick={() => window.open(`/files/download-cv/${employee.cv_file.split('/').pop()}`, '_blank')}
                              className="text-green-600 hover:text-green-900"
                              title="Download CV"
                            >
                              CV
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(employee.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.total_pages > 1 && (
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.total_pages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing <span className="font-medium">{((pagination.page - 1) * pagination.limit) + 1}</span> to{' '}
                    <span className="font-medium">
                      {Math.min(pagination.page * pagination.limit, pagination.total)}
                    </span>{' '}
                    of <span className="font-medium">{pagination.total}</span> results
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                    <button
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={pagination.page === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    {Array.from({ length: pagination.total_pages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          page === pagination.page
                            ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                    <button
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={pagination.page === pagination.total_pages}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Add/Edit Modal */}
        {(showAddModal || showEditModal) && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    {selectedEmployee ? 'Edit Employee' : 'Add New Employee'}
                  </h3>
                  <button
                    onClick={() => {
                      setShowAddModal(false);
                      setShowEditModal(false);
                      setSelectedEmployee(null);
                      resetForm();
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <span className="sr-only">Close</span>
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Basic Information */}
                    <div className="space-y-4">
                      <h4 className="text-md font-medium text-gray-900">Basic Information</h4>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">First Name *</label>
                        <input
                          type="text"
                          name="first_name"
                          value={formData.first_name}
                          onChange={handleInputChange}
                          required
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Last Name *</label>
                        <input
                          type="text"
                          name="last_name"
                          value={formData.last_name}
                          onChange={handleInputChange}
                          required
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Email *</label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          required
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                        <input
                          type="tel"
                          name="phone_number"
                          value={formData.phone_number}
                          onChange={handleInputChange}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>

                    {/* Professional Information */}
                    <div className="space-y-4">
                      <h4 className="text-md font-medium text-gray-900">Professional Information</h4>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Job Title</label>
                        <input
                          type="text"
                          name="job_title"
                          value={formData.job_title}
                          onChange={handleInputChange}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Department</label>
                        <input
                          type="text"
                          name="department"
                          value={formData.department}
                          onChange={handleInputChange}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Employee ID</label>
                        <input
                          type="text"
                          name="employee_id"
                          value={formData.employee_id}
                          onChange={handleInputChange}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Employment Status</label>
                        <select
                          name="employment_status"
                          value={formData.employment_status}
                          onChange={handleInputChange}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                          <option value="terminated">Terminated</option>
                          <option value="resigned">Resigned</option>
                          <option value="retired">Retired</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Skills */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Skills (comma-separated)</label>
                    <input
                      type="text"
                      value={formData.skills.join(', ')}
                      onChange={(e) => handleArrayInputChange('skills', e.target.value)}
                      placeholder="e.g., JavaScript, Python, Project Management"
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  {/* Bio */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Bio</label>
                    <textarea
                      name="bio"
                      value={formData.bio}
                      onChange={handleInputChange}
                      rows={3}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  {/* Employment History */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <label className="block text-sm font-medium text-gray-700">Employment History</label>
                      <button
                        type="button"
                        onClick={addEmploymentHistory}
                        className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        + Add Employment
                      </button>
                    </div>
                    <div className="space-y-4">
                      {employmentHistory.map((employment, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="text-sm font-medium text-gray-700">Employment #{index + 1}</h4>
                            <button
                              type="button"
                              onClick={() => removeEmploymentHistory(index)}
                              className="text-red-600 hover:text-red-800 text-sm"
                            >
                              Remove
                            </button>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700">Company Name</label>
                              <input
                                type="text"
                                value={employment.company_name}
                                onChange={(e) => updateEmploymentHistory(index, 'company_name', e.target.value)}
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700">Position</label>
                              <input
                                type="text"
                                value={employment.position}
                                onChange={(e) => updateEmploymentHistory(index, 'position', e.target.value)}
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700">Start Date</label>
                              <input
                                type="date"
                                value={employment.start_date}
                                onChange={(e) => updateEmploymentHistory(index, 'start_date', e.target.value)}
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700">End Date</label>
                              <input
                                type="date"
                                value={employment.end_date}
                                onChange={(e) => updateEmploymentHistory(index, 'end_date', e.target.value)}
                                disabled={employment.is_current}
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-100"
                              />
                            </div>
                            <div className="md:col-span-2">
                              <label className="flex items-center">
                                <input
                                  type="checkbox"
                                  checked={employment.is_current}
                                  onChange={(e) => updateEmploymentHistory(index, 'is_current', e.target.checked)}
                                  className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                                />
                                <span className="ml-2 text-sm text-gray-700">Current Position</span>
                              </label>
                            </div>
                            <div className="md:col-span-2">
                              <label className="block text-sm font-medium text-gray-700">Description</label>
                              <textarea
                                value={employment.description}
                                onChange={(e) => updateEmploymentHistory(index, 'description', e.target.value)}
                                rows={3}
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Education History */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <label className="block text-sm font-medium text-gray-700">Education History</label>
                      <button
                        type="button"
                        onClick={addEducationHistory}
                        className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        + Add Education
                      </button>
                    </div>
                    <div className="space-y-4">
                      {educationHistory.map((education, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="text-sm font-medium text-gray-700">Education #{index + 1}</h4>
                            <button
                              type="button"
                              onClick={() => removeEducationHistory(index)}
                              className="text-red-600 hover:text-red-800 text-sm"
                            >
                              Remove
                            </button>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700">Institution</label>
                              <input
                                type="text"
                                value={education.institution}
                                onChange={(e) => updateEducationHistory(index, 'institution', e.target.value)}
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700">Degree</label>
                              <input
                                type="text"
                                value={education.degree}
                                onChange={(e) => updateEducationHistory(index, 'degree', e.target.value)}
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700">Field of Study</label>
                              <input
                                type="text"
                                value={education.field_of_study}
                                onChange={(e) => updateEducationHistory(index, 'field_of_study', e.target.value)}
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700">GPA</label>
                              <input
                                type="text"
                                value={education.gpa}
                                onChange={(e) => updateEducationHistory(index, 'gpa', e.target.value)}
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700">Start Date</label>
                              <input
                                type="date"
                                value={education.start_date}
                                onChange={(e) => updateEducationHistory(index, 'start_date', e.target.value)}
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700">End Date</label>
                              <input
                                type="date"
                                value={education.end_date}
                                onChange={(e) => updateEducationHistory(index, 'end_date', e.target.value)}
                                disabled={education.is_current}
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-100"
                              />
                            </div>
                            <div className="md:col-span-2">
                              <label className="flex items-center">
                                <input
                                  type="checkbox"
                                  checked={education.is_current}
                                  onChange={(e) => updateEducationHistory(index, 'is_current', e.target.checked)}
                                  className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                                />
                                <span className="ml-2 text-sm text-gray-700">Currently Studying</span>
                              </label>
                            </div>
                            <div className="md:col-span-2">
                              <label className="block text-sm font-medium text-gray-700">Description</label>
                              <textarea
                                value={education.description}
                                onChange={(e) => updateEducationHistory(index, 'description', e.target.value)}
                                rows={3}
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Skills */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <label className="block text-sm font-medium text-gray-700">Skills</label>
                      <button
                        type="button"
                        onClick={addSkill}
                        className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        + Add Skill
                      </button>
                    </div>
                    <div className="space-y-3">
                      {skills.map((skill, index) => (
                        <div key={index} className="flex items-center space-x-3">
                          <div className="flex-1">
                            <input
                              type="text"
                              value={skill.name}
                              onChange={(e) => updateSkill(index, 'name', e.target.value)}
                              placeholder="Skill name"
                              className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            />
                          </div>
                          <div className="w-32">
                            <select
                              value={skill.level}
                              onChange={(e) => updateSkill(index, 'level', e.target.value)}
                              className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            >
                              <option value="beginner">Beginner</option>
                              <option value="intermediate">Intermediate</option>
                              <option value="advanced">Advanced</option>
                              <option value="expert">Expert</option>
                            </select>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeSkill(index)}
                            className="text-red-600 hover:text-red-800"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Languages */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <label className="block text-sm font-medium text-gray-700">Languages</label>
                      <button
                        type="button"
                        onClick={addLanguage}
                        className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        + Add Language
                      </button>
                    </div>
                    <div className="space-y-3">
                      {languages.map((language, index) => (
                        <div key={index} className="flex items-center space-x-3">
                          <div className="flex-1">
                            <input
                              type="text"
                              value={language.language}
                              onChange={(e) => updateLanguage(index, 'language', e.target.value)}
                              placeholder="Language name"
                              className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            />
                          </div>
                          <div className="w-32">
                            <select
                              value={language.proficiency}
                              onChange={(e) => updateLanguage(index, 'proficiency', e.target.value)}
                              className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            >
                              <option value="beginner">Beginner</option>
                              <option value="intermediate">Intermediate</option>
                              <option value="advanced">Advanced</option>
                              <option value="native">Native</option>
                            </select>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeLanguage(index)}
                            className="text-red-600 hover:text-red-800"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* CV Upload */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">CV/Resume</label>
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-gray-400 transition-colors">
                      <div className="space-y-1 text-center">
                        <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                          <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <div className="flex text-sm text-gray-600">
                          <label htmlFor="cv-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                            <span>Upload a file</span>
                            <input
                              id="cv-upload"
                              name="cv-upload"
                              type="file"
                              className="sr-only"
                              accept=".pdf,.doc,.docx,.txt"
                              onChange={handleFileChange}
                            />
                          </label>
                          <p className="pl-1">or drag and drop</p>
                        </div>
                        <p className="text-xs text-gray-500">PDF, DOC, DOCX, TXT up to 10MB</p>
                        {cvFile && (
                          <p className="text-sm text-green-600">Selected: {cvFile.name}</p>
                        )}
                        {selectedEmployee && selectedEmployee.cv_file && (
                          <p className="text-sm text-blue-600">Current CV: {selectedEmployee.cv_file.split('/').pop()}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddModal(false);
                        setShowEditModal(false);
                        setSelectedEmployee(null);
                        resetForm();
                      }}
                      className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      {selectedEmployee ? 'Update Employee' : 'Add Employee'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeManagement;
