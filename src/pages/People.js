import React, { useState } from 'react';
import { Search, Phone, MapPin, Shield, Database, Zap, ArrowRight } from 'lucide-react';

const People = () => {
  const [searchType, setSearchType] = useState('name'); // 'name', 'phone', 'address'
  
  // Search form data
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    city: '',
    region: '',
    phone: '',
    address: ''
  });

  const ghanaRegions = [
    'All Regions',
    'Greater Accra',
    'Ashanti',
    'Central',
    'Eastern',
    'Northern',
    'Western',
    'Volta',
    'Upper East',
    'Upper West',
    'Bono',
    'Bono East',
    'Ahafo',
    'Savannah',
    'North East',
    'Oti',
    'Western North'
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    
    // TODO: Implement search functionality later
    // Search button click handler - navigation disabled for now
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800">
      {/* Hero Section */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-4xl md:text-5xl font-bold text-center text-slate-900 dark:text-white mb-8">
            Start Your People Search Today!
          </h1>

          {/* Search Type Tabs */}
          <div className="flex justify-center mb-6 border-b border-slate-200 dark:border-slate-700">
            <div className="flex gap-1">
              <button
                onClick={() => setSearchType('name')}
                className={`px-6 py-3 font-medium transition-colors ${
                  searchType === 'name'
                    ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Search by Name
              </button>
              <button
                onClick={() => setSearchType('phone')}
                className={`px-6 py-3 font-medium transition-colors ${
                  searchType === 'phone'
                    ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Search by Phone
              </button>
              <button
                onClick={() => setSearchType('address')}
                className={`px-6 py-3 font-medium transition-colors ${
                  searchType === 'address'
                    ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Search by Address
              </button>
            </div>
          </div>

          {/* Search Form */}
          <form onSubmit={handleSearch} className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 md:p-8">
            <div className="mb-6">
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-4">
                {searchType === 'name' && 'Search by Name'}
                {searchType === 'phone' && 'Search by Phone'}
                {searchType === 'address' && 'Search by Address'}
              </p>
              
              <div className="space-y-4">
                {searchType === 'name' && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                          First Name
                        </label>
                        <input
                          type="text"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleInputChange}
                          placeholder="Enter first name"
                          className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                          Last Name
                        </label>
                        <input
                          type="text"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleInputChange}
                          placeholder="Enter last name"
                          className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                          City
                        </label>
                        <input
                          type="text"
                          name="city"
                          value={formData.city}
                          onChange={handleInputChange}
                          placeholder="Enter city"
                          className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                          Region
                        </label>
                        <select
                          name="region"
                          value={formData.region}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          {ghanaRegions.map(region => (
                            <option key={region} value={region === 'All Regions' ? '' : region}>
                              {region}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </>
                )}

                {searchType === 'phone' && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="Enter phone number"
                      className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                )}

                {searchType === 'address' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Address
                      </label>
                      <input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        placeholder="Enter address"
                        className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                          City
                        </label>
                        <input
                          type="text"
                          name="city"
                          value={formData.city}
                          onChange={handleInputChange}
                          placeholder="Enter city"
                          className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                          Region
                        </label>
                        <select
                          name="region"
                          value={formData.region}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          {ghanaRegions.map(region => (
                            <option key={region} value={region === 'All Regions' ? '' : region}>
                              {region}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded-lg transition-colors shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
            >
              <Search className="h-5 w-5" />
              Search
            </button>
          </form>
        </div>
      </div>

      {/* What is People Search Section */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold text-center text-slate-900 dark:text-white mb-12">
          What is People Search?
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="text-center">
            <div className="bg-blue-100 dark:bg-blue-900/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
              Guaranteed Anonymous Searches
            </h3>
            <p className="text-slate-600 dark:text-slate-400">
              Search through billions of public records with complete privacy and anonymity
            </p>
          </div>
          
          <div className="text-center">
            <div className="bg-blue-100 dark:bg-blue-900/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Database className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
              Comprehensive Data
            </h3>
            <p className="text-slate-600 dark:text-slate-400">
              When available, data includes full name, phone number, addresses, age, date of birth, relatives, aliases, and more
            </p>
          </div>
          
          <div className="text-center">
            <div className="bg-blue-100 dark:bg-blue-900/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Zap className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
              Powerful Search Engine
            </h3>
            <p className="text-slate-600 dark:text-slate-400">
              Our data aggregation engine provides the most comprehensive search possible
            </p>
          </div>
        </div>
      </div>

      {/* Additional Information Section */}
      <div className="bg-slate-100 dark:bg-slate-800 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-slate-900 dark:text-white mb-6">
            Confidential searching. Fast and reliable results.
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 text-center mb-8 max-w-3xl mx-auto">
            You need a simple and straightforward way to locate people and quickly get information. 
            Our people search engine will help you find somebody from millions of available public records. 
            Our easy-to-use platform is a powerful tool for surfacing the data that you've been searching for, 
            all in one place. Whether you are looking for a phone number for an old co-worker, information on 
            a new neighbor, or verifying someone's address is accurate, Juridence can help.
          </p>
          <div className="text-center">
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors shadow-lg hover:shadow-xl"
            >
              Start Your Search Now
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Use Cases Section */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold text-center text-slate-900 dark:text-white mb-12">
          Learn more with a People Search
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-md">
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">
              Reconnect with old friends
            </h3>
            <p className="text-slate-600 dark:text-slate-400">
              You most likely have old friends with whom you've lost touch. Perform a People Search to find 
              individuals from your past, whether they're college schoolmates or old neighbors. Obtain current 
              addresses and phone numbers so that you can reconnect and catch up.
            </p>
          </div>
          
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-md">
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">
              Find long-lost family
            </h3>
            <p className="text-slate-600 dark:text-slate-400">
              If you're researching your family tree or trying to find long-lost family, you can run a People 
              Search to find someone's potential relatives. Juridence can help you find past and present addresses, 
              aliases they may go by, phone numbers, and other contact information.
            </p>
          </div>
          
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-md">
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">
              Update your contact list
            </h3>
            <p className="text-slate-600 dark:text-slate-400">
              If your address book looks like most, it's got plenty of entries that are lacking complete contact 
              information. People Search can help you to fill in missing addresses and phone numbers for your 
              friends, relatives, and professional connections.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default People;
