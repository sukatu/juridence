import React, { useState } from 'react';
import { Search, RotateCcw } from 'lucide-react';

const AdvancedSearch = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    idNumber: '',
    phone: '',
    email: '',
    address: '',
    caseType: '',
    court: '',
    caseStatus: '',
    dateRange: '',
    region: '',
    city: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle search logic here
  };

  const handleReset = () => {
    setFormData({
      firstName: '',
      lastName: '',
      dateOfBirth: '',
      idNumber: '',
      phone: '',
      email: '',
      address: '',
      caseType: '',
      court: '',
      caseStatus: '',
      dateRange: '',
      region: '',
      city: ''
    });
  };

  const recentSearches = [
    { name: 'Albert Kweku Obeng', time: '2 hours ago' },
    { name: 'Sarah Mensah', time: '1 day ago' },
    { name: 'Kwame Asante', time: '3 days ago' }
  ];

  return (
    <div>
      {/* Page Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Advanced Search</h1>
            <p className="text-lg text-slate-600">Search people, banks, and insurance companies with detailed criteria</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Search Form */}
          <div className="lg:col-span-2">
            <div className="rounded-xl border border-slate-200 bg-white p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-6">Search Criteria</h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Personal Information */}
                <div>
                  <h3 className="text-md font-medium text-slate-900 mb-4">Personal Information</h3>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">First Name</label>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                        placeholder="Enter first name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Last Name</label>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                        placeholder="Enter last name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Date of Birth</label>
                      <input
                        type="date"
                        name="dateOfBirth"
                        value={formData.dateOfBirth}
                        onChange={handleInputChange}
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">ID Number</label>
                      <input
                        type="text"
                        name="idNumber"
                        value={formData.idNumber}
                        onChange={handleInputChange}
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                        placeholder="Enter ID number"
                      />
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div>
                  <h3 className="text-md font-medium text-slate-900 mb-4">Contact Information</h3>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Phone Number</label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                        placeholder="Enter phone number"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Email Address</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                        placeholder="Enter email address"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-slate-700 mb-2">Address</label>
                      <textarea
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        rows="3"
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                        placeholder="Enter full address"
                      />
                    </div>
                  </div>
                </div>

                {/* Legal Information */}
                <div>
                  <h3 className="text-md font-medium text-slate-900 mb-4">Legal Information</h3>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Case Type</label>
                      <select
                        name="caseType"
                        value={formData.caseType}
                        onChange={handleInputChange}
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                      >
                        <option value="">Select case type</option>
                        <option value="criminal">Criminal</option>
                        <option value="civil">Civil</option>
                        <option value="family">Family</option>
                        <option value="business">Business</option>
                        <option value="property">Property</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Court</label>
                      <select
                        name="court"
                        value={formData.court}
                        onChange={handleInputChange}
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                      >
                        <option value="">Select court</option>
                        <option value="high-court">High Court</option>
                        <option value="circuit-court">Circuit Court</option>
                        <option value="district-court">District Court</option>
                        <option value="magistrate-court">Magistrate Court</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Case Status</label>
                      <select
                        name="caseStatus"
                        value={formData.caseStatus}
                        onChange={handleInputChange}
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                      >
                        <option value="">Select status</option>
                        <option value="active">Active</option>
                        <option value="resolved">Resolved</option>
                        <option value="pending">Pending</option>
                        <option value="dismissed">Dismissed</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Date Range</label>
                      <input
                        type="date"
                        name="dateRange"
                        value={formData.dateRange}
                        onChange={handleInputChange}
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Location */}
                <div>
                  <h3 className="text-md font-medium text-slate-900 mb-4">Location</h3>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Region</label>
                      <select
                        name="region"
                        value={formData.region}
                        onChange={handleInputChange}
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                      >
                        <option value="">Select region</option>
                        <option value="greater-accra">Greater Accra</option>
                        <option value="ashanti">Ashanti</option>
                        <option value="western">Western</option>
                        <option value="eastern">Eastern</option>
                        <option value="central">Central</option>
                        <option value="volta">Volta</option>
                        <option value="northern">Northern</option>
                        <option value="upper-east">Upper East</option>
                        <option value="upper-west">Upper West</option>
                        <option value="brong-ahafo">Brong Ahafo</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">City/Town</label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                        placeholder="Enter city or town"
                      />
                    </div>
                  </div>
                </div>

                {/* Search Buttons */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 rounded-lg bg-sky-600 px-6 py-3 text-sm font-medium text-white hover:bg-sky-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <Search className="h-4 w-4" />
                    Search
                  </button>
                  <button
                    type="button"
                    onClick={handleReset}
                    className="px-6 py-3 text-sm font-medium text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-2"
                  >
                    <RotateCcw className="h-4 w-4" />
                    Reset
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Search */}
            <div className="rounded-xl border border-slate-200 bg-white p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Quick Search</h3>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Search by name..."
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                />
                <input
                  type="text"
                  placeholder="Search by ID..."
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                />
                <button className="w-full rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700 transition-colors">
                  Quick Search
                </button>
              </div>
            </div>

            {/* Recent Searches */}
            <div className="rounded-xl border border-slate-200 bg-white p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Recent Searches</h3>
              <div className="space-y-2">
                {recentSearches.map((search, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">{search.name}</span>
                    <span className="text-slate-400">{search.time}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Search Tips */}
            <div className="rounded-xl border border-slate-200 bg-white p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Search Tips</h3>
              <ul className="space-y-2 text-sm text-slate-600">
                <li>• Use partial names for broader results</li>
                <li>• Include middle names for better accuracy</li>
                <li>• Try different spellings if no results</li>
                <li>• Use date ranges for specific periods</li>
                <li>• Combine multiple criteria for precision</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedSearch;
