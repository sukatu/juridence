import React, { useState, useEffect, useRef } from 'react';
import { X, ChevronDown } from 'lucide-react';

const AddTaskDrawer = ({ isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    title: '',
    type: '',
    linkedCase: '',
    priority: '',
    dueDate: '',
    status: '',
    additionalNote: ''
  });

  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const [showPriorityDropdown, setShowPriorityDropdown] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const typeDropdownRef = useRef(null);
  const priorityDropdownRef = useRef(null);
  const statusDropdownRef = useRef(null);

  // Reset form when drawer opens
  useEffect(() => {
    if (isOpen) {
      setFormData({
        title: '',
        type: '',
        linkedCase: '',
        priority: '',
        dueDate: '',
        status: '',
        additionalNote: ''
      });
    }
  }, [isOpen]);

  // Handle click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (typeDropdownRef.current && !typeDropdownRef.current.contains(event.target)) {
        setShowTypeDropdown(false);
      }
      if (priorityDropdownRef.current && !priorityDropdownRef.current.contains(event.target)) {
        setShowPriorityDropdown(false);
      }
      if (statusDropdownRef.current && !statusDropdownRef.current.contains(event.target)) {
        setShowStatusDropdown(false);
      }
    };

    if (showTypeDropdown || showPriorityDropdown || showStatusDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showTypeDropdown, showPriorityDropdown, showStatusDropdown]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (onSave) {
      onSave(formData);
    }
    onClose();
  };

  const typeOptions = ['Cause List', 'Case', 'Gazette'];
  const priorityOptions = ['High', 'Medium', 'Low'];
  const statusOptions = ['Pending', 'In Progress', 'Completed', 'Cancelled'];

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      ></div>

      {/* Drawer */}
      <div
        className="fixed right-0 top-0 h-full w-[553px] bg-white shadow-2xl z-50 overflow-y-auto"
        style={{
          boxShadow: '-5px 8px 4px 4px rgba(7, 8, 16, 0.10)',
          borderRadius: '8px'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-10 flex flex-col gap-4">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="w-6 h-6 flex items-center justify-center self-start hover:opacity-70 transition-opacity"
          >
            <X className="w-6 h-6 text-[#050F1C]" />
          </button>

          <div className="flex flex-col gap-10">
            <div className="flex flex-col gap-6">
              {/* Header */}
              <div className="flex flex-col gap-6">
                <span className="text-[#525866] text-xs opacity-75">ADD NEW TASK</span>

                {/* Task Title */}
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-start">
                    <span className="text-[#050F1C] text-xs font-bold">Task title</span>
                    <div className="w-4 h-4 border border-[#050F1C] rounded"></div>
                  </div>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full h-[51px] px-4 py-4 bg-[#F7F8FA] rounded-lg text-[#050F1C] text-sm font-normal outline-none focus:ring-2 focus:ring-[#022658]"
                    placeholder="Enter task title"
                  />
                </div>
              </div>

              {/* Form Fields */}
              <div className="flex flex-col gap-4">
                {/* Type */}
                <div className="flex flex-col gap-2 relative">
                  <div className="flex justify-between items-start">
                    <span className="text-[#050F1C] text-xs font-bold">Type</span>
                    <div className="w-4 h-4 border border-[#050F1C] rounded"></div>
                  </div>
                  <div className="relative" ref={typeDropdownRef}>
                    <button
                      onClick={() => {
                        setShowTypeDropdown(!showTypeDropdown);
                        setShowPriorityDropdown(false);
                        setShowStatusDropdown(false);
                      }}
                      className="w-full h-[51px] px-4 py-4 bg-[#F7F8FA] rounded-lg flex justify-between items-center text-[#050F1C] text-sm font-normal"
                    >
                      <span>{formData.type || ''}</span>
                      <ChevronDown className="w-3 h-3 text-[#141B34]" />
                    </button>
                    {showTypeDropdown && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#D4E1EA] rounded-lg shadow-lg z-10">
                        {typeOptions.map((option) => (
                          <div
                            key={option}
                            onClick={() => {
                              setFormData({ ...formData, type: option });
                              setShowTypeDropdown(false);
                            }}
                            className="px-4 py-2 text-sm text-[#525866] hover:bg-gray-50 cursor-pointer"
                          >
                            {option}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Linked case */}
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-start">
                    <span className="text-[#050F1C] text-xs font-bold">Linked case</span>
                    <div className="w-4 h-4 border border-[#050F1C] rounded"></div>
                  </div>
                  <input
                    type="text"
                    value={formData.linkedCase}
                    onChange={(e) => setFormData({ ...formData, linkedCase: e.target.value })}
                    className="w-full h-[51px] px-4 py-4 bg-[#F7F8FA] rounded-lg text-[#050F1C] text-sm font-normal outline-none focus:ring-2 focus:ring-[#022658]"
                    placeholder="Enter case number or -"
                  />
                </div>

                {/* Priority */}
                <div className="flex flex-col gap-2 relative">
                  <div className="flex justify-between items-start">
                    <span className="text-[#050F1C] text-xs font-bold">Priority</span>
                    <div className="w-4 h-4 border border-[#050F1C] rounded"></div>
                  </div>
                  <div className="relative" ref={priorityDropdownRef}>
                    <button
                      onClick={() => {
                        setShowPriorityDropdown(!showPriorityDropdown);
                        setShowTypeDropdown(false);
                        setShowStatusDropdown(false);
                      }}
                      className="w-full h-[51px] px-4 py-4 bg-[#F7F8FA] rounded-lg flex justify-between items-center text-[#050F1C] text-sm font-normal"
                    >
                      <span>{formData.priority || ''}</span>
                      <ChevronDown className="w-3 h-3 text-[#141B34]" />
                    </button>
                    {showPriorityDropdown && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#D4E1EA] rounded-lg shadow-lg z-10">
                        {priorityOptions.map((option) => (
                          <div
                            key={option}
                            onClick={() => {
                              setFormData({ ...formData, priority: option });
                              setShowPriorityDropdown(false);
                            }}
                            className="px-4 py-2 text-sm text-[#525866] hover:bg-gray-50 cursor-pointer"
                          >
                            {option}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Due date */}
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-start">
                    <span className="text-[#050F1C] text-xs font-bold">Due date</span>
                    <div className="w-4 h-4 border border-[#050F1C] rounded"></div>
                  </div>
                  <input
                    type="text"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    className="w-full h-[51px] px-4 py-4 bg-[#F7F8FA] rounded-lg text-[#050F1C] text-sm font-normal outline-none focus:ring-2 focus:ring-[#022658]"
                    placeholder="Enter due date"
                  />
                </div>

                {/* Status */}
                <div className="flex flex-col gap-2 relative">
                  <div className="flex justify-between items-start">
                    <span className="text-[#050F1C] text-xs font-bold">Status</span>
                    <div className="w-4 h-4 border border-[#050F1C] rounded"></div>
                  </div>
                  <div className="relative" ref={statusDropdownRef}>
                    <button
                      onClick={() => {
                        setShowStatusDropdown(!showStatusDropdown);
                        setShowTypeDropdown(false);
                        setShowPriorityDropdown(false);
                      }}
                      className="w-full h-[51px] px-4 py-4 bg-[#F7F8FA] rounded-lg flex justify-between items-center text-[#050F1C] text-sm font-normal"
                    >
                      <span>{formData.status || ''}</span>
                      <ChevronDown className="w-3 h-3 text-[#141B34]" />
                    </button>
                    {showStatusDropdown && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#D4E1EA] rounded-lg shadow-lg z-10">
                        {statusOptions.map((option) => (
                          <div
                            key={option}
                            onClick={() => {
                              setFormData({ ...formData, status: option });
                              setShowStatusDropdown(false);
                            }}
                            className="px-4 py-2 text-sm text-[#525866] hover:bg-gray-50 cursor-pointer"
                          >
                            {option}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Additional note */}
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-start">
                    <span className="text-[#050F1C] text-xs font-bold">Additional note</span>
                    <div className="w-4 h-4 border border-[#050F1C] rounded"></div>
                  </div>
                  <textarea
                    value={formData.additionalNote}
                    onChange={(e) => setFormData({ ...formData, additionalNote: e.target.value })}
                    className="w-full h-[80px] px-4 py-4 bg-[#F7F8FA] rounded-lg text-[#050F1C] text-sm font-normal outline-none focus:ring-2 focus:ring-[#022658] resize-none"
                    placeholder="Enter additional notes"
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-10">
              <button
                onClick={onClose}
                className="flex-1 h-[58px] px-2.5 rounded-lg border-2 border-[#0F2847] text-[#022658] text-base font-bold hover:opacity-90 transition-opacity"
                style={{ boxShadow: '0px 4px 4px rgba(5, 15, 28, 0.10)' }}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="flex-1 h-[58px] px-2.5 rounded-lg border-4 border-[#0F284726] text-white text-base font-bold hover:opacity-90 transition-opacity"
                style={{
                  background: 'linear-gradient(180deg, #022658 43%, #1A4983 100%)',
                  boxShadow: '0px 4px 4px rgba(5, 15, 28, 0.10)',
                  outline: '4px solid rgba(15, 40, 71, 0.15)'
                }}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AddTaskDrawer;

