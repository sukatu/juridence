import React, { useState, useEffect } from 'react';

const AddDirectorDrawer = ({ onClose, onSave, initialData = null, isEditMode = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  // Helper function to convert date string to YYYY-MM-DD format
  const formatDateForInput = (dateString) => {
    if (!dateString || dateString === 'N/A') return '';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '';
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    } catch (e) {
      return '';
    }
  };

  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    contact: initialData?.contact || '',
    dateOfBirth: initialData?.dob ? formatDateForInput(initialData.dob) : '',
    birthPlace: initialData?.birthPlace || '',
    appointmentDate: initialData?.appointmentDate ? formatDateForInput(initialData.appointmentDate) : '',
    endDate: initialData?.endDate ? formatDateForInput(initialData.endDate) : '',
    cases: initialData?.cases || '0',
    riskScore: initialData?.riskScore || 'N/A'
  });

  useEffect(() => {
    setTimeout(() => setIsOpen(true), 10);
  }, []);

  // Update form data when initialData changes
  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        contact: initialData.contact || '',
        dateOfBirth: initialData.dob ? formatDateForInput(initialData.dob) : '',
        birthPlace: initialData.birthPlace || '',
        appointmentDate: initialData.appointmentDate ? formatDateForInput(initialData.appointmentDate) : '',
        endDate: initialData.endDate ? formatDateForInput(initialData.endDate) : '',
        cases: initialData.cases || '0',
        riskScore: initialData.riskScore || 'N/A'
      });
    }
  }, [initialData]);

  const handleClose = () => {
    setIsOpen(false);
    setTimeout(onClose, 300);
  };

  const handleSave = () => {
    if (!formData.name.trim()) {
      alert('Name is required');
      return;
    }
    onSave(formData);
    handleClose();
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black transition-opacity duration-300 z-40 ${
          isOpen ? 'opacity-50' : 'opacity-0'
        }`}
        onClick={handleClose}
      />

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-[500px] bg-white shadow-lg transform transition-transform duration-300 ease-in-out z-50 overflow-y-auto ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{ boxShadow: '-5px 8px 4px #0708101A' }}
      >
        <div className="flex flex-col items-start px-10 mt-[25px] mb-[102px] gap-4">
          {/* Close Button */}
          <button onClick={handleClose} className="cursor-pointer hover:opacity-70">
            <img
              src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Iq8V0MifpP/lhfwnfgd_expires_30_days.png"
              className="w-6 h-6 object-fill"
              alt="Close"
            />
          </button>

          <div className="flex flex-col self-stretch gap-10">
            <div className="flex flex-col self-stretch gap-6">
              {/* ADD NEW / EDIT Header */}
              <div className="flex flex-col items-start self-stretch gap-6">
                <span className="text-[#525866] text-xs">{isEditMode ? 'EDIT DIRECTOR' : 'ADD NEW DIRECTOR'}</span>

                {/* Name */}
                <div className="flex flex-col self-stretch gap-2">
                  <div className="flex justify-between items-start self-stretch">
                    <span className="text-[#040E1B] text-xs font-bold">Name</span>
                    <img
                      src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Iq8V0MifpP/aa3asrnp_expires_30_days.png"
                      className="w-4 h-4 object-fill"
                      alt="Required"
                    />
                  </div>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    placeholder="Enter director name"
                    className="self-stretch bg-[#F7F8FA] h-[51px] px-4 rounded-lg border border-solid border-[#D4E1EA] text-[#040E1B] text-sm outline-none focus:border-[#022658]"
                  />
                </div>
              </div>

              {/* Form Fields */}
              <div className="flex flex-col self-stretch gap-4">
                {/* Contact */}
                <div className="flex flex-col self-stretch gap-2">
                  <div className="flex justify-between items-start self-stretch">
                    <span className="text-[#040E1B] text-xs font-bold">Contact</span>
                    <img
                      src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Iq8V0MifpP/v3ktwgle_expires_30_days.png"
                      className="w-4 h-4 object-fill"
                      alt="Optional"
                    />
                  </div>
                  <input
                    type="text"
                    value={formData.contact}
                    onChange={(e) => handleChange('contact', e.target.value)}
                    placeholder="Enter contact (phone/email)"
                    className="self-stretch bg-[#F7F8FA] h-[51px] px-4 rounded-lg border border-solid border-[#D4E1EA] text-[#040E1B] text-sm outline-none focus:border-[#022658]"
                  />
                </div>

                {/* Date of Birth */}
                <div className="flex flex-col self-stretch gap-2">
                  <div className="flex justify-between items-start self-stretch">
                    <span className="text-[#040E1B] text-xs font-bold">Date of Birth</span>
                    <img
                      src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Iq8V0MifpP/v3ktwgle_expires_30_days.png"
                      className="w-4 h-4 object-fill"
                      alt="Optional"
                    />
                  </div>
                  <input
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => handleChange('dateOfBirth', e.target.value)}
                    className="self-stretch bg-[#F7F8FA] h-[51px] px-4 rounded-lg border border-solid border-[#D4E1EA] text-[#040E1B] text-sm outline-none focus:border-[#022658]"
                  />
                </div>

                {/* Birth Place */}
                <div className="flex flex-col self-stretch gap-2">
                  <div className="flex justify-between items-start self-stretch">
                    <span className="text-[#040E1B] text-xs font-bold">Birth Place</span>
                    <img
                      src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Iq8V0MifpP/v3ktwgle_expires_30_days.png"
                      className="w-4 h-4 object-fill"
                      alt="Optional"
                    />
                  </div>
                  <input
                    type="text"
                    value={formData.birthPlace}
                    onChange={(e) => handleChange('birthPlace', e.target.value)}
                    placeholder="Enter birth place"
                    className="self-stretch bg-[#F7F8FA] h-[51px] px-4 rounded-lg border border-solid border-[#D4E1EA] text-[#040E1B] text-sm outline-none focus:border-[#022658]"
                  />
                </div>

                {/* Appointment Date */}
                <div className="flex flex-col self-stretch gap-2">
                  <div className="flex justify-between items-start self-stretch">
                    <span className="text-[#040E1B] text-xs font-bold">Appointment Date</span>
                    <img
                      src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Iq8V0MifpP/v3ktwgle_expires_30_days.png"
                      className="w-4 h-4 object-fill"
                      alt="Optional"
                    />
                  </div>
                  <input
                    type="date"
                    value={formData.appointmentDate}
                    onChange={(e) => handleChange('appointmentDate', e.target.value)}
                    className="self-stretch bg-[#F7F8FA] h-[51px] px-4 rounded-lg border border-solid border-[#D4E1EA] text-[#040E1B] text-sm outline-none focus:border-[#022658]"
                  />
                </div>

                {/* End Date */}
                <div className="flex flex-col self-stretch gap-2">
                  <div className="flex justify-between items-start self-stretch">
                    <span className="text-[#040E1B] text-xs font-bold">End Date (if past director)</span>
                    <img
                      src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Iq8V0MifpP/v3ktwgle_expires_30_days.png"
                      className="w-4 h-4 object-fill"
                      alt="Optional"
                    />
                  </div>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => handleChange('endDate', e.target.value)}
                    className="self-stretch bg-[#F7F8FA] h-[51px] px-4 rounded-lg border border-solid border-[#D4E1EA] text-[#040E1B] text-sm outline-none focus:border-[#022658]"
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-start self-stretch gap-10">
              <button
                onClick={handleClose}
                className="flex flex-1 flex-col items-center bg-transparent text-left py-[18px] rounded-lg border-2 border-solid border-transparent hover:bg-gray-50 transition-colors"
                style={{ boxShadow: '0px 4px 4px #050F1C1A' }}
              >
                <span className="text-[#022658] text-base font-bold">Cancel</span>
              </button>
              <button
                onClick={handleSave}
                className="flex flex-1 flex-col items-center text-left py-[18px] rounded-lg border-4 border-solid border-[#0F284726] hover:opacity-90 transition-opacity"
                style={{ background: 'linear-gradient(180deg, #022658, #1A4983)' }}
              >
                <span className="text-white text-base font-bold">Save</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AddDirectorDrawer;
