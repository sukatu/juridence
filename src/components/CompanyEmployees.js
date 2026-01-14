import React, { useState, useEffect, useCallback } from 'react';
import { apiGet } from '../utils/api';
import EmployeeProfile from './EmployeeProfile';

const CompanyEmployees = ({ companyId, companyType, companyName }) => {
  const [currentEmployees, setCurrentEmployees] = useState([]);
  const [formerEmployees, setFormerEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('current');
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchEmployees = useCallback(async () => {
    try {
      setLoading(true);
      const [currentResponse, formerResponse] = await Promise.all([
        apiGet(`/employees/company/${companyId}/current?company_type=${companyType}`),
        apiGet(`/employees/company/${companyId}/former?company_type=${companyType}`)
      ]);
      setCurrentEmployees(currentResponse);
      setFormerEmployees(formerResponse);
    } catch (error) {
      console.error('Error fetching employees:', error);
    } finally {
      setLoading(false);
    }
  }, [companyId, companyType]);

  useEffect(() => {
    if (companyId) {
      fetchEmployees();
    }
  }, [companyId, fetchEmployees]);

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

  const formatDate = (dateString) => {
    if (!dateString) return 'Present';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short'
    });
  };

  const filteredEmployees = (employees) => {
    if (!searchQuery) return employees;
    return employees.filter(employee =>
      `${employee.first_name} ${employee.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employee.job_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employee.department?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employee.email.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const currentFiltered = filteredEmployees(currentEmployees);
  const formerFiltered = filteredEmployees(formerEmployees);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Employees at {companyName}
            </h3>
            <p className="text-sm text-gray-500">
              {currentEmployees.length} current, {formerEmployees.length} former employees
            </p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search employees..."
            className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-6 py-2 border-b border-gray-200">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('current')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'current'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Current Employees ({currentFiltered.length})
          </button>
          <button
            onClick={() => setActiveTab('former')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'former'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Former Employees ({formerFiltered.length})
          </button>
        </nav>
      </div>

      {/* Employee List */}
      <div className="p-6">
        {activeTab === 'current' ? (
          currentFiltered.length === 0 ? (
            <div className="text-center py-8">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No current employees</h3>
              <p className="mt-1 text-sm text-gray-500">No employees are currently working at this {companyType}.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentFiltered.map((employee) => (
                <div
                  key={employee.id}
                  className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors cursor-pointer"
                  onClick={() => setSelectedEmployee(employee)}
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      {employee.profile_picture ? (
                        <img
                          className="h-12 w-12 rounded-full object-cover"
                          src={employee.profile_picture}
                          alt={`${employee.first_name} ${employee.last_name}`}
                        />
                      ) : (
                        <div className="h-12 w-12 rounded-full bg-gray-300 flex items-center justify-center">
                          <span className="text-sm font-medium text-gray-700">
                            {employee.first_name[0]}{employee.last_name[0]}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-gray-900 truncate">
                        {employee.first_name} {employee.last_name}
                      </h4>
                      <p className="text-sm text-gray-600 truncate">{employee.job_title}</p>
                      {employee.department && (
                        <p className="text-xs text-gray-500 truncate">{employee.department}</p>
                      )}
                      <div className="mt-2 flex items-center space-x-2">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(employee.employment_status)}`}>
                          {employee.employment_status}
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatDate(employee.start_date)} - {formatDate(employee.end_date)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          formerFiltered.length === 0 ? (
            <div className="text-center py-8">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No former employees</h3>
              <p className="mt-1 text-sm text-gray-500">No former employees are recorded for this {companyType}.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {formerFiltered.map((employee) => (
                <div
                  key={employee.id}
                  className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors cursor-pointer"
                  onClick={() => setSelectedEmployee(employee)}
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      {employee.profile_picture ? (
                        <img
                          className="h-12 w-12 rounded-full object-cover"
                          src={employee.profile_picture}
                          alt={`${employee.first_name} ${employee.last_name}`}
                        />
                      ) : (
                        <div className="h-12 w-12 rounded-full bg-gray-300 flex items-center justify-center">
                          <span className="text-sm font-medium text-gray-700">
                            {employee.first_name[0]}{employee.last_name[0]}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-gray-900 truncate">
                        {employee.first_name} {employee.last_name}
                      </h4>
                      <p className="text-sm text-gray-600 truncate">{employee.job_title}</p>
                      {employee.department && (
                        <p className="text-xs text-gray-500 truncate">{employee.department}</p>
                      )}
                      <div className="mt-2 flex items-center space-x-2">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(employee.employment_status)}`}>
                          {employee.employment_status}
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatDate(employee.start_date)} - {formatDate(employee.end_date)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </div>

      {/* Employee Profile Modal */}
      {selectedEmployee && (
        <EmployeeProfile
          employeeId={selectedEmployee.id}
          onClose={() => setSelectedEmployee(null)}
        />
      )}
    </div>
  );
};

export default CompanyEmployees;
