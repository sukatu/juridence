import React, { useState } from 'react';
import { Bell, ChevronRight, ChevronLeft, MoreVertical, Upload, X } from 'lucide-react';
import CorporateClientHeader from './CorporateClientHeader';

const CorporateClientTeamPage = ({ userInfo, onNavigate, onLogout }) => {
  const [showAddHandlerDrawer, setShowAddHandlerDrawer] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: '',
    gender: '',
    status: '',
    photo: null
  });

  // Use userInfo from props or localStorage
  const displayUserInfo = userInfo || JSON.parse(localStorage.getItem('userData') || '{}');
  const organizationName = displayUserInfo?.organization || 'Access Bank';

  // Lead Handler data
  const leadHandler = {
    name: 'Tonia Martins',
    role: 'Lead Account Handler',
    email: 'toniamartins@gmail.com',
    gender: 'Female',
    status: 'Active',
    photo: displayUserInfo?.profile_picture || '/images/image.png'
  };

  // Secondary Handlers data
  const secondaryHandlers = [
    {
      id: 1,
      name: 'Sarah Mensah',
      role: 'Secondary Handler',
      email: 'sarah@firm.com',
      status: 'Active',
      gender: 'Female',
      photo: '/images/image.png'
    },
    {
      id: 2,
      name: 'John Doe',
      role: 'Secondary Handler',
      email: 'john@firm.com',
      status: 'Active',
      gender: 'Male',
      photo: '/images/image.png'
    },
    {
      id: 3,
      name: 'Kwaku Agyeman',
      role: 'Secondary Handler',
      email: 'kwaku@firm.com',
      status: 'Active',
      gender: 'Male',
      photo: '/images/image.png'
    },
    {
      id: 4,
      name: 'Miriam Ofori',
      role: 'Secondary Handler',
      email: 'sarahmensah@gmail.com',
      status: 'Active',
      gender: 'Female',
      photo: '/images/image.png'
    }
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        photo: file
      }));
    }
  };

  const handleSave = () => {
    // TODO: Save handler data to backend
    console.log('Saving handler:', formData);
    setShowAddHandlerDrawer(false);
    setFormData({
      name: '',
      email: '',
      role: '',
      gender: '',
      status: '',
      photo: null
    });
  };

  const handleCancel = () => {
    setShowAddHandlerDrawer(false);
    setFormData({
      name: '',
      email: '',
      role: '',
      gender: '',
      status: '',
      photo: null
    });
  };

  return (
    <>
      <div className="bg-[#F7F8FA] min-h-screen">
        {/* Header */}
        <CorporateClientHeader userInfo={displayUserInfo} onNavigate={onNavigate} onLogout={onLogout} />

        {/* Main Content */}
        <div className="px-6 pb-10">
          {/* Page Title */}
          <div className="flex flex-col items-start w-full gap-2 mb-4">
            <span className="text-[#050F1C] text-xl font-medium" style={{ fontFamily: 'Poppins' }}>
              {organizationName},
            </span>
            <span className="text-[#050F1C] text-base opacity-75" style={{ fontFamily: 'Satoshi' }}>
              Track all your activities here.
            </span>
          </div>

          {/* Card Container */}
          <div className="flex flex-col bg-white rounded-lg border border-[#E5E8EC] shadow-sm p-6 gap-10">
            {/* Breadcrumb and Back Button */}
            <div className="flex items-center justify-between">
              <span className="text-[#525866] text-xs opacity-75 font-normal" style={{ fontFamily: 'Satoshi' }}>TEAM</span>
              <button className="p-2 bg-[#F7F8FA] rounded-lg w-fit hover:opacity-80 transition-opacity">
                <ChevronLeft className="w-6 h-6 text-[#050F1C]" />
              </button>
            </div>

            {/* Title Section */}
            <div className="flex flex-col gap-1">
              <span className="text-[#050F1C] text-xl font-semibold" style={{ fontFamily: 'Poppins' }}>
                Team
              </span>
              <span className="text-[#070810] text-sm font-normal opacity-75" style={{ fontFamily: 'Satoshi' }}>
                Manage your lead and secondary account handlers.
              </span>
            </div>

            {/* Lead Handler Section */}
            <div className="flex flex-col gap-2">
              <span className="text-[#070810] text-sm font-bold" style={{ fontFamily: 'Satoshi' }}>Lead Handler</span>
              <div className="p-4 bg-[#F4F6F9] rounded-lg flex items-center gap-3">
                <div className="w-[220px] px-2 border-r border-[#D4E1EA] flex flex-col gap-2">
                  <span className="text-[#868C98] text-xs font-normal" style={{ fontFamily: 'Satoshi' }}>Name</span>
                  <div className="flex items-center gap-2">
                    <img
                      src={leadHandler.photo}
                      alt={leadHandler.name}
                      className="w-9 h-9 rounded-full object-cover"
                      onError={(e) => {
                        e.target.src = '/images/image.png';
                      }}
                    />
                    <span className="text-[#022658] text-base font-medium" style={{ fontFamily: 'Satoshi' }}>{leadHandler.name}</span>
                  </div>
                </div>
                <div className="w-[220px] px-2 border-r border-[#D4E1EA] flex flex-col gap-2">
                  <span className="text-[#868C98] text-xs font-normal" style={{ fontFamily: 'Satoshi' }}>Role</span>
                  <span className="text-[#022658] text-base font-medium" style={{ fontFamily: 'Satoshi' }}>{leadHandler.role}</span>
                </div>
                <div className="w-[220px] px-2 border-r border-[#D4E1EA] flex flex-col gap-2">
                  <span className="text-[#868C98] text-xs font-normal" style={{ fontFamily: 'Satoshi' }}>Email</span>
                  <span className="text-[#022658] text-base font-medium" style={{ fontFamily: 'Satoshi' }}>{leadHandler.email}</span>
                </div>
                <div className="w-[120px] px-2 border-r border-[#D4E1EA] flex flex-col gap-2">
                  <span className="text-[#868C98] text-xs font-normal" style={{ fontFamily: 'Satoshi' }}>Gender</span>
                  <span className="text-[#022658] text-base font-medium" style={{ fontFamily: 'Satoshi' }}>{leadHandler.gender}</span>
                </div>
                <div className="w-[120px] px-2 border-r border-[#D4E1EA] flex flex-col gap-2">
                  <span className="text-[#868C98] text-xs font-normal" style={{ fontFamily: 'Satoshi' }}>Status</span>
                  <span className="text-[#022658] text-base font-medium" style={{ fontFamily: 'Satoshi' }}>{leadHandler.status}</span>
                </div>
                <div className="w-[100px] px-2 flex flex-col gap-2">
                  <span className="text-[#868C98] text-xs font-normal" style={{ fontFamily: 'Satoshi' }}>Actions</span>
                  <button className="w-10 p-2 hover:bg-[#F7F8FA] rounded">
                    <MoreVertical className="w-4 h-4 text-[#050F1C] rotate-90" />
                  </button>
                </div>
              </div>
            </div>

            {/* Secondary Handler Section */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-[#070810] text-sm font-bold" style={{ fontFamily: 'Satoshi' }}>Secondary Handler</span>
                <button
                  onClick={() => setShowAddHandlerDrawer(true)}
                  className="px-4 py-2 bg-[#022658] text-white text-sm font-medium rounded-lg hover:opacity-90"
                  style={{ fontFamily: 'Satoshi' }}
                >
                  Add new handler
                </button>
              </div>
              <div className="overflow-hidden rounded-[14px] border border-[#E5E8EC]">
                <div className="bg-[#F4F6F9] py-4 px-3">
                  <div className="flex items-center gap-3">
                    <div className="w-[220px] px-2">
                      <span className="text-[#070810] text-sm font-bold" style={{ fontFamily: 'Satoshi' }}>Name</span>
                    </div>
                    <div className="w-[175px] px-2">
                      <span className="text-[#070810] text-sm font-bold" style={{ fontFamily: 'Satoshi' }}>Role</span>
                    </div>
                    <div className="w-[175px] px-2">
                      <span className="text-[#070810] text-sm font-bold" style={{ fontFamily: 'Satoshi' }}>Email</span>
                    </div>
                    <div className="w-[175px] px-2">
                      <span className="text-[#070810] text-sm font-bold" style={{ fontFamily: 'Satoshi' }}>Status</span>
                    </div>
                    <div className="w-[175px] px-2">
                      <span className="text-[#070810] text-sm font-bold" style={{ fontFamily: 'Satoshi' }}>Gender</span>
                    </div>
                    <div className="w-[120px] px-2">
                      <span className="text-[#070810] text-sm font-bold" style={{ fontFamily: 'Satoshi' }}>Action</span>
                    </div>
                  </div>
                </div>
                <div className="bg-white">
                  {secondaryHandlers.map((handler, index, array) => (
                    <div
                      key={handler.id}
                      className="flex items-center gap-3 py-3 px-3"
                      style={{
                        borderBottom: index < array.length - 1 ? '0.40px solid #E5E8EC' : 'none'
                      }}
                    >
                      <div className="w-[220px] px-2">
                        <div className="flex items-center gap-2">
                          <img
                            src={handler.photo}
                            alt={handler.name}
                            className="w-9 h-9 rounded-full object-cover"
                            onError={(e) => {
                              e.target.src = '/images/image.png';
                            }}
                          />
                          <span className="text-[#022658] text-base font-medium" style={{ fontFamily: 'Satoshi' }}>{handler.name}</span>
                        </div>
                      </div>
                      <div className="w-[175px] px-2">
                        <span className="text-[#070810] text-sm font-normal" style={{ fontFamily: 'Satoshi' }}>{handler.role}</span>
                      </div>
                      <div className="w-[175px] px-2">
                        <span className="text-[#070810] text-sm font-normal" style={{ fontFamily: 'Satoshi' }}>{handler.email}</span>
                      </div>
                      <div className="w-[175px] px-2">
                        <span className="text-[#070810] text-sm font-normal" style={{ fontFamily: 'Satoshi' }}>{handler.status}</span>
                      </div>
                      <div className="w-[175px] px-2">
                        <span className="text-[#070810] text-sm font-normal" style={{ fontFamily: 'Satoshi' }}>{handler.gender}</span>
                      </div>
                      <div className="w-[120px] px-2">
                        <button className="p-2 hover:bg-[#F7F8FA] rounded">
                          <MoreVertical className="w-4 h-4 text-[#050F1C] rotate-90" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add New Handler Drawer */}
      {showAddHandlerDrawer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-end">
          <div className="w-[553px] h-screen bg-white shadow-[-5px_8px_4px_4px_rgba(7,8,16,0.10)] overflow-y-auto">
            <div className="p-6 flex flex-col gap-4">
              {/* Close Button */}
              <button
                onClick={handleCancel}
                className="p-2 bg-[#F7F8FA] rounded-lg w-fit"
              >
                <ChevronLeft className="w-6 h-6 text-[#050F1C]" />
              </button>

              {/* Header */}
              <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-1">
                  <span className="text-[#525866] text-xs opacity-75 font-normal">TEAM</span>
                  <h2 className="text-[#050F1C] text-lg font-medium" style={{ fontFamily: 'Poppins' }}>Add new handler</h2>
                  <p className="text-[#050F1C] text-sm font-normal" style={{ fontFamily: 'Satoshi' }}>
                    Add a new handler to help support your activities.
                  </p>
                </div>

                {/* Form */}
                <div className="flex flex-col gap-10">
                  {/* Photo Upload */}
                  <div className="w-[358px] p-4 rounded-lg border border-[#B1B9C6] flex flex-col items-center gap-3">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-10 h-10 rounded-full border-2 border-[#D4E1EA] flex items-center justify-center">
                        <Upload className="w-4 h-4 text-[#050F1C]" />
                      </div>
                      <span className="text-[#050F1C] text-sm font-normal" style={{ fontFamily: 'Satoshi' }}>
                        Browse & choose files you want to upload
                      </span>
                      <span className="text-[#525866] text-xs font-normal" style={{ fontFamily: 'Satoshi' }}>
                        Max file size 5MB
                      </span>
                      <label className="h-8 px-2.5 bg-gradient-to-b from-[#0F2847] to-[#1A4983] shadow-md rounded-lg border-4 border-[rgba(15,40,71,0.15)] flex items-center justify-center gap-2.5 cursor-pointer">
                        <span className="text-white text-xs font-bold" style={{ fontFamily: 'Satoshi' }}>Upload here</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handlePhotoUpload}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>

                  {/* Name */}
                  <div className="flex flex-col gap-2">
                    <label className="text-[#050F1C] text-xs font-bold" style={{ fontFamily: 'Satoshi' }}>Name</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="Enter here"
                      className="w-full px-4 py-4 bg-[#F7F8FA] rounded-lg text-sm text-[#050F1C] font-normal outline-none focus:bg-white focus:border focus:border-[#022658]"
                      style={{ fontFamily: 'Satoshi' }}
                    />
                  </div>

                  {/* Email */}
                  <div className="flex flex-col gap-2">
                    <label className="text-[#050F1C] text-xs font-bold" style={{ fontFamily: 'Satoshi' }}>Email address</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="Enter here"
                      className="w-full px-4 py-4 bg-[#F7F8FA] rounded-lg text-sm text-[#050F1C] font-normal outline-none focus:bg-white focus:border focus:border-[#022658]"
                      style={{ fontFamily: 'Satoshi' }}
                    />
                  </div>

                  {/* Assign Role */}
                  <div className="flex flex-col gap-2">
                    <label className="text-[#050F1C] text-xs font-bold" style={{ fontFamily: 'Satoshi' }}>Assign role</label>
                    <div className="w-full px-4 py-4 bg-[#F7F8FA] rounded-lg flex items-center justify-between cursor-pointer">
                      <span className="text-sm text-[#050F1C] font-normal" style={{ fontFamily: 'Satoshi' }}>
                        {formData.role || 'Select'}
                      </span>
                      <ChevronRight className="w-4 h-4 text-[#141B34] rotate-90" />
                    </div>
                  </div>

                  {/* Gender */}
                  <div className="flex flex-col gap-2">
                    <label className="text-[#050F1C] text-xs font-bold" style={{ fontFamily: 'Satoshi' }}>Gender</label>
                    <div className="w-full px-4 py-4 bg-[#F7F8FA] rounded-lg flex items-center justify-between cursor-pointer">
                      <span className="text-sm text-[#050F1C] font-normal" style={{ fontFamily: 'Satoshi' }}>
                        {formData.gender || 'Select'}
                      </span>
                      <ChevronRight className="w-4 h-4 text-[#141B34] rotate-90" />
                    </div>
                  </div>

                  {/* Status */}
                  <div className="flex flex-col gap-2">
                    <label className="text-[#050F1C] text-xs font-bold" style={{ fontFamily: 'Satoshi' }}>Status</label>
                    <div className="w-full px-4 py-4 bg-[#F7F8FA] rounded-lg flex items-center justify-between cursor-pointer">
                      <span className="text-sm text-[#050F1C] font-normal" style={{ fontFamily: 'Satoshi' }}>
                        {formData.status || 'Select'}
                      </span>
                      <ChevronRight className="w-4 h-4 text-[#141B34] rotate-90" />
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-start gap-10">
                    <button
                      onClick={handleCancel}
                      className="flex-1 h-[58px] px-2.5 shadow-md rounded-lg border-2 border-[#0F2847] flex items-center justify-center gap-2.5"
                    >
                      <span className="text-[#022658] text-base font-bold" style={{ fontFamily: 'Satoshi' }}>Cancel</span>
                    </button>
                    <button
                      onClick={handleSave}
                      className="flex-1 h-[58px] px-2.5 bg-gradient-to-b from-[#022658] to-[#1A4983] shadow-md rounded-lg border-4 border-[rgba(15,40,71,0.15)] flex items-center justify-center gap-2.5"
                    >
                      <span className="text-white text-base font-bold" style={{ fontFamily: 'Satoshi' }}>Save</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CorporateClientTeamPage;

