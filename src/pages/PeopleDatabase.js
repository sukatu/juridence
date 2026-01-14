import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Download, Plus, User, ChevronLeft, ChevronRight } from 'lucide-react';

const PeopleDatabase = () => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRiskLevels, setSelectedRiskLevels] = useState(['Low', 'Medium', 'High']);
  const [selectedCaseTypes, setSelectedCaseTypes] = useState(['Criminal', 'Civil', 'Family', 'Business']);
  const [selectedRegion, setSelectedRegion] = useState('All Regions');

  // Mock data
  const mockData = [
    {
      id: 1,
      name: 'Albert Kweku Obeng',
      dob: '7 March 1962 – 9 March 2004',
      idNumber: 'KL1K-DXP',
      riskLevel: 'Low',
      cases: 2,
      location: 'Greater Accra',
      lastUpdated: '2 hours ago'
    },
    {
      id: 2,
      name: 'Sarah Mensah',
      dob: '15 June 1975',
      idNumber: 'GH-123456789',
      riskLevel: 'Medium',
      cases: 5,
      location: 'Ashanti',
      lastUpdated: '1 day ago'
    },
    {
      id: 3,
      name: 'Kwame Asante',
      dob: '22 September 1980',
      idNumber: 'GH-987654321',
      riskLevel: 'High',
      cases: 12,
      location: 'Western',
      lastUpdated: '3 days ago'
    },
    {
      id: 4,
      name: 'Ama Serwaa',
      dob: '3 January 1990',
      idNumber: 'GH-456789123',
      riskLevel: 'Low',
      cases: 1,
      location: 'Central',
      lastUpdated: '1 week ago'
    }
  ];

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

  const handleRiskLevelChange = (level) => {
    setSelectedRiskLevels(prev =>
      prev.includes(level)
        ? prev.filter(l => l !== level)
        : [...prev, level]
    );
  };

  const handleCaseTypeChange = (type) => {
    setSelectedCaseTypes(prev =>
      prev.includes(type)
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  const handleExport = () => {
    const csvData = [
      ['Name', 'ID Number', 'Risk Level', 'Cases', 'Location', 'Last Updated'],
      ...mockData.map(person => [
        person.name,
        person.idNumber,
        person.riskLevel,
        person.cases,
        person.location,
        person.lastUpdated
      ])
    ];

    const csvString = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvString], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'people_database.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const totalPages = Math.ceil(12847 / 10); // Mock total records

  return (
    <div>
      {/* Page Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">People Database</h1>
            <p className="text-lg text-slate-600">Browse our comprehensive database of people and legal cases</p>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-slate-50 border-b border-slate-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-slate-900">12,847</div>
              <div className="text-sm text-slate-600">Total People</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-slate-900">8,432</div>
              <div className="text-sm text-slate-600">Active Cases</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-slate-900">464</div>
              <div className="text-sm text-slate-600">Courts Connected</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-slate-900">16</div>
              <div className="text-sm text-slate-600">Regions Covered</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
          {/* Filters */}
          <div className="lg:col-span-1">
            <div className="rounded-xl border border-slate-200 bg-white p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Filters</h3>
              
              {/* Search */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-700 mb-2">Search</label>
                <input
                  type="text"
                  placeholder="Search people..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                />
              </div>
              
              {/* Risk Level */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-slate-900 mb-3">Risk Level</h4>
                <div className="space-y-2">
                  {['Low', 'Medium', 'High'].map((level) => (
                    <label key={level} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedRiskLevels.includes(level)}
                        onChange={() => handleRiskLevelChange(level)}
                        className="rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                      />
                      <span className="ml-2 text-sm text-slate-700">{level} Risk</span>
                    </label>
                  ))}
                </div>
              </div>
              
              {/* Case Type */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-slate-900 mb-3">Case Type</h4>
                <div className="space-y-2">
                  {['Criminal', 'Civil', 'Family', 'Business'].map((type) => (
                    <label key={type} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedCaseTypes.includes(type)}
                        onChange={() => handleCaseTypeChange(type)}
                        className="rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                      />
                      <span className="ml-2 text-sm text-slate-700">{type}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              {/* Location */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-slate-900 mb-3">Location</h4>
                <select
                  value={selectedRegion}
                  onChange={(e) => setSelectedRegion(e.target.value)}
                  className="w-full rounded border border-slate-300 px-3 py-2 text-sm focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                >
                  <option>All Regions</option>
                  <option>Greater Accra</option>
                  <option>Ashanti</option>
                  <option>Western</option>
                  <option>Eastern</option>
                  <option>Central</option>
                  <option>Volta</option>
                  <option>Northern</option>
                  <option>Upper East</option>
                  <option>Upper West</option>
                  <option>Brong Ahafo</option>
                </select>
              </div>
              
              {/* Date Range */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-slate-900 mb-3">Date Range</h4>
                <div className="space-y-2">
                  <input
                    type="date"
                    className="w-full rounded border border-slate-300 px-3 py-2 text-sm focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                  />
                  <input
                    type="date"
                    className="w-full rounded border border-slate-300 px-3 py-2 text-sm focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                  />
                </div>
              </div>
              
              <button className="w-full rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700 transition-colors">
                Apply Filters
              </button>
            </div>
          </div>
          
          {/* Database Table */}
          <div className="lg:col-span-3">
            <div className="rounded-xl border border-slate-200 bg-white">
              {/* Table Header */}
              <div className="px-6 py-4 border-b border-slate-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-slate-900">People Database</h3>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleExport}
                      className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      <Download className="h-4 w-4" />
                      Export
                    </button>
                    <button className="inline-flex items-center gap-2 rounded-lg bg-sky-600 px-3 py-2 text-sm font-medium text-white hover:bg-sky-700 transition-colors">
                      <Plus className="h-4 w-4" />
                      Add Person
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">ID Number</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Risk Level</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Cases</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Location</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Last Updated</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-200">
                    {mockData.map((person) => (
                      <tr key={person.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-10 w-10 rounded-full bg-sky-100 flex items-center justify-center">
                              <User className="h-5 w-5 text-sky-600" />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-slate-900">{person.name}</div>
                              <div className="text-sm text-slate-500">{person.dob}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">{person.idNumber}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold ring-1 ${getRiskColor(person.riskLevel)}`}>
                            <span className={`inline-block h-1.5 w-1.5 rounded-full ${getRiskColor(person.riskLevel).split(' ')[1].replace('text-', 'bg-')}`}></span>
                            {person.riskLevel} Risk
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">{person.cases}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">{person.location}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{person.lastUpdated}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => navigate(`/person-profile/${person.id}?source=search`)}
                            className="text-sky-600 hover:text-sky-900 transition-colors"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Pagination */}
              <div className="px-6 py-4 border-t border-slate-200">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-slate-700">
                    Showing <span className="font-medium">1</span> to <span className="font-medium">10</span> of <span className="font-medium">12,847</span> results
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-2 text-sm font-medium text-slate-500 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <button className="px-3 py-2 text-sm font-medium text-white bg-sky-600 border border-sky-600 rounded-lg hover:bg-sky-700 transition-colors">
                      {currentPage}
                    </button>
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      className="px-3 py-2 text-sm font-medium text-slate-500 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PeopleDatabase;
