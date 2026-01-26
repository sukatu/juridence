import React, { useState, useRef, useEffect } from 'react';
import { X, ChevronDown, Edit2 } from 'lucide-react';
import JudgeCasesPage from './JudgeCasesPage';
import ViewCauseListPage from './ViewCauseListPage';

const JudgeDetailsDrawer = ({ judge, registry, onClose, onSave }) => {
  const [showCasesPage, setShowCasesPage] = useState(false);
  const [showCauseListPage, setShowCauseListPage] = useState(false);
  const [formData, setFormData] = useState({
    judgeName: judge?.name || '',
    judgeID: judge?.judgeID || '',
    gender: judge?.gender || '',
    title: judge?.title || '',
    appointmentDate: judge?.appointmentDate || '',
    status: judge?.status || '',
    court: judge?.court || 'High Court (Commercial)',
    chamber: judge?.chamber || 'Justice of the High Court',
    assistantName: judge?.assistantName || 'Ben Botang',
    assistantEmail: judge?.assistantEmail || 'bbotanglaw@gmail.com',
    barMembershipID: judge?.barMembershipID || 'GBA-02415',
    yearsOfExperience: judge?.yearsOfExperience || '18',
    previousAppointment: judge?.previousAppointment || 'Circuit Court (2010–2015)',
    legalBackground: judge?.legalBackground || 'Commercial & Contract Law',
    education: judge?.education || 'LL.B – Univ. of Ghana\nLL.M – UK',
    recentCaseTitle: judge?.recentCaseTitle || 'EcoWind vs. SafeDrive',
    recentCaseID: judge?.recentCaseID || 'HCCW/2345/025'
  });

  const [showGenderDropdown, setShowGenderDropdown] = useState(false);
  const [showTitleDropdown, setShowTitleDropdown] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showLegalBackgroundDropdown, setShowLegalBackgroundDropdown] = useState(false);

  const genderDropdownRef = useRef(null);
  const titleDropdownRef = useRef(null);
  const statusDropdownRef = useRef(null);
  const legalBackgroundDropdownRef = useRef(null);

  // Handle click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (genderDropdownRef.current && !genderDropdownRef.current.contains(event.target)) {
        setShowGenderDropdown(false);
      }
      if (titleDropdownRef.current && !titleDropdownRef.current.contains(event.target)) {
        setShowTitleDropdown(false);
      }
      if (statusDropdownRef.current && !statusDropdownRef.current.contains(event.target)) {
        setShowStatusDropdown(false);
      }
      if (legalBackgroundDropdownRef.current && !legalBackgroundDropdownRef.current.contains(event.target)) {
        setShowLegalBackgroundDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = () => {
    if (onSave) {
      onSave(formData);
    }
    onClose();
  };

  const genders = ['Male', 'Female', 'Other'];
  const titles = ['Justice', 'Judge', 'Chief Justice', 'Senior Judge'];
  const statuses = ['Active', 'Inactive', 'Retired', 'On Leave'];
  const legalBackgrounds = ['Commercial & Contract Law', 'Criminal Law', 'Civil Law', 'Constitutional Law', 'Family Law'];

  const courtLabel = (() => {
    const base = registry?.court_type || judge?.court_type || registry?.name || 'Court';
    const division = registry?.division || registry?.court_division || judge?.court_division;
    return division ? `${base} (${division})` : base;
  })();

  if (!judge) return null;

  // If cause list page is shown
  if (showCauseListPage) {
    return (
      <ViewCauseListPage
        registry={registry}
        judge={judge}
        onBack={() => setShowCauseListPage(false)}
      />
    );
  }

  // If cases page is shown
  if (showCasesPage) {
    return (
      <JudgeCasesPage
        judge={judge}
        registry={registry}
        onBack={() => setShowCasesPage(false)}
      />
    );
  }

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className="fixed right-0 top-0 h-full w-[553px] bg-white shadow-2xl z-50 overflow-y-auto"
        style={{ boxShadow: '-5px 8px 4px 4px rgba(7, 8, 16, 0.10)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col p-6 gap-4">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="w-6 h-6 flex items-center justify-center cursor-pointer hover:opacity-70 self-start"
          >
            <X className="w-6 h-6 text-[#050F1C]" />
          </button>

          <div className="flex flex-col gap-10">
            {/* Header */}
            <div className="flex flex-col gap-6">
              <span className="text-[#525866] text-xs font-normal opacity-75">EDIT TASK</span>
              <span className="text-[#050F1C] text-lg font-bold">{courtLabel}</span>

              {/* Judge's name and ID */}
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-start">
                  <span className="text-[#050F1C] text-xs font-bold">Judge's name</span>
                  <Edit2 className="w-4 h-4 text-[#050F1C] cursor-pointer" />
                </div>
                <div className="p-4 bg-[#F7F8FA] rounded-lg">
                  <span className="text-[#050F1C] text-sm font-normal">
                    {formData.judgeName}
                  </span>
                  <span className="text-[#050F1C] text-xs font-normal ml-2">
                    {formData.judgeID}
                  </span>
                </div>
              </div>
            </div>

            {/* Form Fields */}
            <div className="flex flex-col gap-6">
              {/* Gender and Title */}
              <div className="flex gap-4">
                <div className="flex-1 flex flex-col gap-2">
                  <div className="flex justify-between items-start">
                    <span className="text-[#050F1C] text-xs font-bold">Gender</span>
                    <Edit2 className="w-4 h-4 text-[#050F1C] cursor-pointer" />
                  </div>
                  <div className="relative" ref={genderDropdownRef}>
                    <div
                      onClick={() => setShowGenderDropdown(!showGenderDropdown)}
                      className="p-4 bg-[#F7F8FA] rounded-lg flex justify-between items-center cursor-pointer"
                    >
                      <span className="text-[#050F1C] text-sm font-normal">{formData.gender}</span>
                      <ChevronDown className="w-3 h-3 text-[#141B34]" />
                    </div>
                    {showGenderDropdown && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#B1B9C6] rounded-lg shadow-lg z-10">
                        {genders.map((gender) => (
                          <div
                            key={gender}
                            onClick={() => {
                              setFormData(prev => ({ ...prev, gender }));
                              setShowGenderDropdown(false);
                            }}
                            className="px-4 py-2 text-sm text-[#525866] hover:bg-gray-50 cursor-pointer"
                          >
                            {gender}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex-1 flex flex-col gap-2">
                  <div className="flex justify-between items-start">
                    <span className="text-[#050F1C] text-xs font-bold">Title</span>
                    <Edit2 className="w-4 h-4 text-[#050F1C] cursor-pointer" />
                  </div>
                  <div className="relative" ref={titleDropdownRef}>
                    <div
                      onClick={() => setShowTitleDropdown(!showTitleDropdown)}
                      className="p-4 bg-[#F7F8FA] rounded-lg flex justify-between items-center cursor-pointer"
                    >
                      <span className="text-[#050F1C] text-sm font-normal">{formData.title}</span>
                      <ChevronDown className="w-3 h-3 text-[#141B34]" />
                    </div>
                    {showTitleDropdown && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#B1B9C6] rounded-lg shadow-lg z-10">
                        {titles.map((title) => (
                          <div
                            key={title}
                            onClick={() => {
                              setFormData(prev => ({ ...prev, title }));
                              setShowTitleDropdown(false);
                            }}
                            className="px-4 py-2 text-sm text-[#525866] hover:bg-gray-50 cursor-pointer"
                          >
                            {title}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Appointment date and Status */}
              <div className="flex gap-4">
                <div className="flex-1 flex flex-col gap-2">
                  <div className="flex justify-between items-start">
                    <span className="text-[#050F1C] text-xs font-bold">Appointment date</span>
                    <Edit2 className="w-4 h-4 text-[#050F1C] cursor-pointer" />
                  </div>
                  <div className="p-4 bg-[#F7F8FA] rounded-lg">
                    <span className="text-[#050F1C] text-sm font-normal">{formData.appointmentDate}</span>
                  </div>
                </div>
                <div className="flex-1 flex flex-col gap-2">
                  <div className="flex justify-between items-start">
                    <span className="text-[#050F1C] text-xs font-bold">Status</span>
                    <Edit2 className="w-4 h-4 text-[#050F1C] cursor-pointer" />
                  </div>
                  <div className="relative" ref={statusDropdownRef}>
                    <div
                      onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                      className="p-4 bg-[#F7F8FA] rounded-lg flex justify-between items-center cursor-pointer"
                    >
                      <span className="text-[#050F1C] text-sm font-normal">{formData.status}</span>
                      <ChevronDown className="w-3 h-3 text-[#141B34]" />
                    </div>
                    {showStatusDropdown && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#B1B9C6] rounded-lg shadow-lg z-10">
                        {statuses.map((status) => (
                          <div
                            key={status}
                            onClick={() => {
                              setFormData(prev => ({ ...prev, status }));
                              setShowStatusDropdown(false);
                            }}
                            className="px-4 py-2 text-sm text-[#525866] hover:bg-gray-50 cursor-pointer"
                          >
                            {status}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Court and Chamber */}
              <div className="flex gap-4">
                <div className="flex-1 flex flex-col gap-2">
                  <div className="flex justify-between items-start">
                    <span className="text-[#050F1C] text-xs font-bold">Court</span>
                    <Edit2 className="w-4 h-4 text-[#050F1C] cursor-pointer" />
                  </div>
                  <div className="p-4 bg-[#F7F8FA] rounded-lg">
                    <span className="text-[#050F1C] text-sm font-normal">{formData.court}</span>
                  </div>
                </div>
                <div className="flex-1 flex flex-col gap-2">
                  <div className="flex justify-between items-start">
                    <span className="text-[#050F1C] text-xs font-bold">Chamber</span>
                    <Edit2 className="w-4 h-4 text-[#050F1C] cursor-pointer" />
                  </div>
                  <div className="p-4 bg-[#F7F8FA] rounded-lg">
                    <span className="text-[#050F1C] text-sm font-normal">{formData.chamber}</span>
                  </div>
                </div>
              </div>

              {/* Assistant's name and Email */}
              <div className="flex gap-4">
                <div className="flex-1 flex flex-col gap-2">
                  <div className="flex justify-between items-start">
                    <span className="text-[#050F1C] text-xs font-bold">Assistant's name</span>
                    <Edit2 className="w-4 h-4 text-[#050F1C] cursor-pointer" />
                  </div>
                  <div className="p-4 bg-[#F7F8FA] rounded-lg">
                    <span className="text-[#050F1C] text-sm font-normal">{formData.assistantName}</span>
                  </div>
                </div>
                <div className="flex-1 flex flex-col gap-2">
                  <div className="flex justify-between items-start">
                    <span className="text-[#050F1C] text-xs font-bold">Assistant's Email</span>
                    <Edit2 className="w-4 h-4 text-[#050F1C] cursor-pointer" />
                  </div>
                  <div className="p-4 bg-[#F7F8FA] rounded-lg">
                    <span className="text-[#050F1C] text-sm font-normal">{formData.assistantEmail}</span>
                  </div>
                </div>
              </div>

              {/* Bar Membership ID and Years of Experience */}
              <div className="flex gap-4">
                <div className="flex-1 flex flex-col gap-2">
                  <div className="flex justify-between items-start">
                    <span className="text-[#050F1C] text-xs font-bold">Bar Membership ID</span>
                    <Edit2 className="w-4 h-4 text-[#050F1C] cursor-pointer" />
                  </div>
                  <div className="p-4 bg-[#F7F8FA] rounded-lg">
                    <span className="text-[#050F1C] text-sm font-normal">{formData.barMembershipID}</span>
                  </div>
                </div>
                <div className="flex-1 flex flex-col gap-2">
                  <div className="flex justify-between items-start">
                    <span className="text-[#050F1C] text-xs font-bold">Years of Experience</span>
                    <Edit2 className="w-4 h-4 text-[#050F1C] cursor-pointer" />
                  </div>
                  <div className="p-4 bg-[#F7F8FA] rounded-lg">
                    <span className="text-[#050F1C] text-sm font-normal">{formData.yearsOfExperience}</span>
                  </div>
                </div>
              </div>

              {/* Previous Appointment */}
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-start">
                  <span className="text-[#050F1C] text-xs font-bold">Previous Appointment</span>
                  <Edit2 className="w-4 h-4 text-[#050F1C] cursor-pointer" />
                </div>
                <div className="p-4 bg-[#F7F8FA] rounded-lg">
                  <span className="text-[#050F1C] text-sm font-normal">{formData.previousAppointment}</span>
                </div>
              </div>

              {/* Legal Background and Education */}
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-start">
                    <span className="text-[#050F1C] text-xs font-bold">Legal Background</span>
                    <Edit2 className="w-4 h-4 text-[#050F1C] cursor-pointer" />
                  </div>
                  <div className="relative" ref={legalBackgroundDropdownRef}>
                    <div
                      onClick={() => setShowLegalBackgroundDropdown(!showLegalBackgroundDropdown)}
                      className="p-4 bg-[#F7F8FA] rounded-lg flex justify-between items-center cursor-pointer"
                    >
                      <span className="text-[#050F1C] text-sm font-normal">{formData.legalBackground}</span>
                      <ChevronDown className="w-3 h-3 text-[#141B34]" />
                    </div>
                    {showLegalBackgroundDropdown && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#B1B9C6] rounded-lg shadow-lg z-10">
                        {legalBackgrounds.map((bg) => (
                          <div
                            key={bg}
                            onClick={() => {
                              setFormData(prev => ({ ...prev, legalBackground: bg }));
                              setShowLegalBackgroundDropdown(false);
                            }}
                            className="px-4 py-2 text-sm text-[#525866] hover:bg-gray-50 cursor-pointer"
                          >
                            {bg}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-start">
                    <span className="text-[#050F1C] text-xs font-bold">Education</span>
                    <Edit2 className="w-4 h-4 text-[#050F1C] cursor-pointer" />
                  </div>
                  <div className="p-4 bg-[#F7F8FA] rounded-lg">
                    <span className="text-[#050F1C] text-sm font-normal whitespace-pre-line">{formData.education}</span>
                  </div>
                </div>
              </div>

              {/* Recent Case */}
              <div className="flex flex-col gap-2">
                <span className="text-[#525866] text-sm font-normal">Recent Case</span>
                <div className="flex gap-4">
                  <div className="flex-1 flex flex-col gap-2">
                    <div className="flex justify-between items-start">
                      <span className="text-[#050F1C] text-xs font-bold">Case Title</span>
                      <Edit2 className="w-4 h-4 text-[#050F1C] cursor-pointer" />
                    </div>
                    <div className="p-4 bg-[#F7F8FA] rounded-lg">
                      <span className="text-[#050F1C] text-sm font-normal">{formData.recentCaseTitle}</span>
                    </div>
                  </div>
                  <div className="flex-1 flex flex-col gap-2">
                    <div className="flex justify-between items-start">
                      <span className="text-[#050F1C] text-xs font-bold">Case ID</span>
                      <Edit2 className="w-4 h-4 text-[#050F1C] cursor-pointer" />
                    </div>
                    <div className="p-4 bg-[#F7F8FA] rounded-lg">
                      <span className="text-[#050F1C] text-sm font-normal">{formData.recentCaseID}</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setShowCasesPage(true)}
                  className="text-[#F59E0B] text-xs font-bold hover:underline text-left"
                >
                  See all Cases
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-10 pt-4">
              <button
                onClick={onClose}
                className="flex-1 h-[58px] px-2.5 rounded-lg border-2 border-[#0F2847] text-[#022658] text-base font-bold hover:bg-gray-50 transition-colors"
                style={{ boxShadow: '0px 4px 4px rgba(5, 15, 28, 0.10)' }}
              >
                Close
              </button>
              <button
                onClick={handleSave}
                className="flex-1 h-[58px] px-2.5 rounded-lg border-4 border-[#0F284726] text-white text-base font-bold hover:opacity-90 transition-opacity"
                style={{ 
                  background: 'linear-gradient(180deg, #022658 43%, #1A4983 100%)', 
                  boxShadow: '0px 4px 4px rgba(5, 15, 28, 0.10)' 
                }}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default JudgeDetailsDrawer;

