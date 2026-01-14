import React, { useState, useEffect } from 'react';

const AddBulletinDrawer = ({ onClose, onSave, initialData = null, isEditMode = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  // Helper function to convert date string to YYYY-MM-DD format
  const formatDateForInput = (dateString) => {
    if (!dateString || dateString === 'N/A') return '';
    try {
      // Handle different date formats
      if (dateString.includes('/')) {
        // Handle MM/DD/YYYY format
        const parts = dateString.split('/');
        if (parts.length === 3) {
          const month = parts[0].padStart(2, '0');
          const day = parts[1].padStart(2, '0');
          const year = parts[2];
          return `${year}-${month}-${day}`;
        }
      }
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
    dateSigning: initialData?.effective_date ? formatDateForInput(initialData.effective_date) : (initialData?.publication_date ? formatDateForInput(initialData.publication_date) : ''),
    noticeType: initialData?.gazette_type || initialData?.noticeType || '',
    description: initialData?.description || initialData?.content || '',
    bulletinNo: initialData?.gazette_number || initialData?.bulletinNo || '',
    uploadDate: initialData?.created_at ? formatDateForInput(initialData.created_at) : (initialData?.publication_date ? formatDateForInput(initialData.publication_date) : ''),
    title: initialData?.title || '',
    content: initialData?.content || initialData?.description || ''
  });

  useEffect(() => {
    // Trigger animation after mount
    setTimeout(() => setIsOpen(true), 10);
  }, []);

  // Update form data when initialData changes
  useEffect(() => {
    if (initialData) {
      setFormData({
        dateSigning: initialData.effective_date ? formatDateForInput(initialData.effective_date) : (initialData.publication_date ? formatDateForInput(initialData.publication_date) : ''),
        noticeType: initialData.gazette_type || initialData.noticeType || '',
        description: initialData.description || initialData.content || '',
        bulletinNo: initialData.gazette_number || initialData.bulletinNo || '',
        uploadDate: initialData.created_at ? formatDateForInput(initialData.created_at) : (initialData.publication_date ? formatDateForInput(initialData.publication_date) : ''),
        title: initialData.title || '',
        content: initialData.content || initialData.description || ''
      });
    }
  }, [initialData]);

  const handleClose = () => {
    setIsOpen(false);
    setTimeout(onClose, 300); // Wait for animation to complete
  };

  const handleSave = () => {
    if (!formData.dateSigning || !formData.noticeType || !formData.description) {
      alert('Please fill in all required fields (Date of Signing, Notice type, and Description)');
      return;
    }
    onSave(formData);
    handleClose();
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const noticeTypes = [
    'CHANGE_OF_NAME',
    'CHANGE_OF_ADDRESS',
    'CHANGE_OF_STATUS',
    'DIRECTOR_APPOINTMENT',
    'DIRECTOR_RESIGNATION',
    'LEGAL_NOTICE',
    'BUSINESS_NOTICE',
    'PROPERTY_NOTICE',
    'REGULATORY_NOTICE',
    'COURT_NOTICE',
    'BANKRUPTCY_NOTICE',
    'PROBATE_NOTICE',
    'OTHER'
  ];

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
                <span className="text-[#525866] text-xs">{isEditMode ? 'EDIT BULLETIN ENTRY' : 'ADD NEW'}</span>

                {/* Date of Signing */}
                <div className="flex flex-col self-stretch gap-2">
                  <div className="flex justify-between items-start self-stretch">
                    <span className="text-[#040E1B] text-xs font-bold">Date of Signing</span>
                    <img
                      src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Iq8V0MifpP/aa3asrnp_expires_30_days.png"
                      className="w-4 h-4 object-fill"
                      alt="Required"
                    />
                  </div>
                  <input
                    type="date"
                    value={formData.dateSigning}
                    onChange={(e) => handleChange('dateSigning', e.target.value)}
                    className="self-stretch bg-[#F7F8FA] h-[51px] px-4 rounded-lg border border-solid border-[#D4E1EA] text-[#040E1B] text-sm outline-none focus:border-[#022658]"
                  />
                </div>
              </div>

              {/* Form Fields */}
              <div className="flex flex-col self-stretch gap-4">
                {/* Notice Type */}
                <div className="flex flex-col self-stretch gap-2">
                  <div className="flex justify-between items-start self-stretch">
                    <span className="text-[#040E1B] text-xs font-bold">Notice type</span>
                    <img
                      src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Iq8V0MifpP/aa3asrnp_expires_30_days.png"
                      className="w-4 h-4 object-fill"
                      alt="Required"
                    />
                  </div>
                  <select
                    value={formData.noticeType}
                    onChange={(e) => handleChange('noticeType', e.target.value)}
                    className="self-stretch bg-[#F7F8FA] h-[51px] px-4 rounded-lg border border-solid border-[#D4E1EA] text-[#040E1B] text-sm outline-none focus:border-[#022658]"
                  >
                    <option value="">Select notice type</option>
                    {noticeTypes.map(type => (
                      <option key={type} value={type}>
                        {type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Description */}
                <div className="flex flex-col self-stretch gap-2">
                  <div className="flex justify-between items-start self-stretch">
                    <span className="text-[#040E1B] text-xs font-bold">Description</span>
                    <img
                      src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Iq8V0MifpP/aa3asrnp_expires_30_days.png"
                      className="w-4 h-4 object-fill"
                      alt="Required"
                    />
                  </div>
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleChange('description', e.target.value)}
                    placeholder="Enter description"
                    className="self-stretch bg-[#F7F8FA] h-20 px-4 py-3 rounded-lg border border-solid border-[#D4E1EA] text-[#040E1B] text-sm outline-none focus:border-[#022658] resize-none"
                  />
                </div>

                {/* Bulletin Number */}
                <div className="flex flex-col self-stretch gap-2">
                  <div className="flex justify-between items-start self-stretch">
                    <span className="text-[#040E1B] text-xs font-bold">Bulletin no.</span>
                    <img
                      src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Iq8V0MifpP/07xoaqzf_expires_30_days.png"
                      className="w-4 h-4 object-fill"
                      alt="Required"
                    />
                  </div>
                  <input
                    type="text"
                    value={formData.bulletinNo}
                    onChange={(e) => handleChange('bulletinNo', e.target.value)}
                    placeholder="Enter bulletin number"
                    className="self-stretch bg-[#F7F8FA] h-[51px] px-4 rounded-lg border border-solid border-[#D4E1EA] text-[#040E1B] text-sm outline-none focus:border-[#022658]"
                  />
                </div>

                {/* Upload Date */}
                <div className="flex flex-col self-stretch gap-2">
                  <div className="flex justify-between items-start self-stretch">
                    <span className="text-[#040E1B] text-xs font-bold">Upload Date</span>
                    <img
                      src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Iq8V0MifpP/spqdqeu2_expires_30_days.png"
                      className="w-4 h-4 object-fill"
                      alt="Required"
                    />
                  </div>
                  <input
                    type="date"
                    value={formData.uploadDate}
                    onChange={(e) => handleChange('uploadDate', e.target.value)}
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

export default AddBulletinDrawer;

