import React, { useState, useEffect } from 'react';
import { apiGet } from '../../utils/api';
import PersonDetails from './PersonDetails';
import AdminHeader from './AdminHeader';
import { Search, User, ArrowLeft } from 'lucide-react';

const PeopleRelationshipsPage = ({ userInfo, onNavigate, onLogout }) => {
  const [people, setPeople] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalPeople, setTotalPeople] = useState(0);
  const itemsPerPage = 20;

  // Load people on mount and when page changes
  useEffect(() => {
    loadPeople();
  }, [currentPage]);

  const loadPeople = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString()
      });

      if (searchTerm.trim()) {
        params.append('query', searchTerm.trim());
      }

      const data = await apiGet(`/api/people/search?${params.toString()}`);
      
      setPeople(data.people || []);
      setTotalPages(data.total_pages || 1);
      setTotalPeople(data.total || 0);
    } catch (error) {
      console.error('Error loading people:', error);
      setPeople([]);
      setTotalPages(1);
      setTotalPeople(0);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    loadPeople();
  };

  const handlePersonClick = (person) => {
    setSelectedPerson(person);
  };

  const handleBack = () => {
    setSelectedPerson(null);
  };

  // If a person is selected, show their details
  if (selectedPerson) {
    return (
      <PersonDetails
        person={selectedPerson}
        onBack={handleBack}
        userInfo={userInfo}
        onNavigate={onNavigate}
        onLogout={onLogout}
        onViewRelatedPerson={(personData) => setSelectedPerson(personData)}
      />
    );
  }

  return (
    <div className="bg-[#F7F8FA] min-h-screen">
      <AdminHeader userInfo={userInfo} onNavigate={onNavigate} onLogout={onLogout} />
      
      <div className="px-6 py-6">
        <div className="bg-white rounded-lg p-6">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-[#040E1B] mb-2">People Relationships</h1>
            <p className="text-[#525866] text-sm">
              View and manage relationships for people including bank directors, secretaries, auditors, shareholders, beneficial owners, marriage officers, and name changes.
            </p>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="mb-6">
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#868C98] w-5 h-5" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by name..."
                  className="w-full pl-10 pr-4 py-3 border border-[#D4E1EA] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#022658] focus:border-transparent"
                />
              </div>
              <button
                type="submit"
                className="px-6 py-3 bg-[#022658] text-white rounded-lg hover:bg-[#033a7a] transition-colors font-medium"
              >
                Search
              </button>
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchTerm('');
                    setCurrentPage(1);
                  }}
                  className="px-6 py-3 bg-[#F7F8FA] text-[#525866] rounded-lg hover:bg-[#E5E8EC] transition-colors border border-[#D4E1EA]"
                >
                  Clear
                </button>
              )}
            </div>
          </form>

          {/* Results Count */}
          <div className="mb-4 text-sm text-[#525866]">
            {loading ? (
              'Loading...'
            ) : (
              <>
                Showing {people.length > 0 ? ((currentPage - 1) * itemsPerPage) + 1 : 0} to{' '}
                {Math.min(currentPage * itemsPerPage, totalPeople)} of {totalPeople} people
              </>
            )}
          </div>

          {/* People List */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#022658]"></div>
              <span className="ml-3 text-[#525866]">Loading people...</span>
            </div>
          ) : people.length === 0 ? (
            <div className="text-center py-12">
              <User className="w-16 h-16 text-[#868C98] mx-auto mb-4" />
              <p className="text-[#525866] text-lg mb-2">No people found</p>
              <p className="text-[#868C98] text-sm">
                {searchTerm ? 'Try a different search term' : 'No people in the database'}
              </p>
            </div>
          ) : (
            <>
              <div className="border border-[#E5E8EC] rounded-lg overflow-hidden">
                {/* Table Header */}
                <div className="bg-[#F4F6F9] grid grid-cols-12 gap-4 px-4 py-3 border-b border-[#E5E8EC]">
                  <div className="col-span-4">
                    <span className="text-sm font-bold text-[#070810]">Name</span>
                  </div>
                  <div className="col-span-3">
                    <span className="text-sm font-bold text-[#070810]">Contact</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-sm font-bold text-[#070810]">Location</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-sm font-bold text-[#070810]">Risk Score</span>
                  </div>
                  <div className="col-span-1">
                    <span className="text-sm font-bold text-[#070810]">Actions</span>
                  </div>
                </div>

                {/* Table Rows */}
                <div className="divide-y divide-[#E5E8EC]">
                  {people.map((person) => (
                    <div
                      key={person.id}
                      className="grid grid-cols-12 gap-4 px-4 py-4 hover:bg-[#F7F8FA] transition-colors cursor-pointer"
                      onClick={() => handlePersonClick(person)}
                    >
                      <div className="col-span-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-[#022658] flex items-center justify-center flex-shrink-0">
                            {person.full_name || person.first_name || person.last_name ? (
                              <span className="text-sm font-medium text-white">
                                {(person.first_name?.charAt(0) || '').toUpperCase()}{(person.last_name?.charAt(0) || '').toUpperCase() || (person.full_name?.charAt(0) || '').toUpperCase()}
                              </span>
                            ) : (
                              <User className="w-5 h-5 text-white" />
                            )}
                          </div>
                          <div>
                            <div className="font-medium text-[#040E1B]">
                              {person.full_name || `${person.first_name || ''} ${person.last_name || ''}`.trim() || 'N/A'}
                            </div>
                            {person.occupation && (
                              <div className="text-sm text-[#868C98] mt-1">{person.occupation}</div>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="col-span-3">
                        <div className="text-sm text-[#070810]">
                          {person.phone_number || person.email || 'N/A'}
                        </div>
                      </div>
                      <div className="col-span-2">
                        <div className="text-sm text-[#070810]">
                          {person.city || person.region || 'N/A'}
                        </div>
                      </div>
                      <div className="col-span-2">
                        {person.risk_score !== undefined && person.risk_level ? (
                          <div className={`inline-flex px-2 py-1 rounded-lg text-xs font-medium ${
                            person.risk_score >= 70 ? 'bg-red-100 text-red-600' :
                            person.risk_score >= 40 ? 'bg-yellow-100 text-yellow-600' :
                            'bg-green-100 text-green-600'
                          }`}>
                            {Math.round(person.risk_score)} - {person.risk_level}
                          </div>
                        ) : (
                          <span className="text-sm text-[#868C98]">N/A</span>
                        )}
                      </div>
                      <div className="col-span-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePersonClick(person);
                          }}
                          className="text-[#022658] hover:text-[#033a7a] font-medium text-sm"
                        >
                          View
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 border border-[#D4E1EA] rounded-lg hover:bg-[#F7F8FA] disabled:opacity-50 disabled:cursor-not-allowed text-sm text-[#525866]"
                  >
                    Previous
                  </button>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-[#525866]">
                      Page {currentPage} of {totalPages}
                    </span>
                  </div>

                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 border border-[#D4E1EA] rounded-lg hover:bg-[#F7F8FA] disabled:opacity-50 disabled:cursor-not-allowed text-sm text-[#525866]"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PeopleRelationshipsPage;
