import React, { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown, Bell, ChevronRight, MoreVertical, Calendar, Filter, ChevronLeft } from 'lucide-react';
import EditTaskDrawer from './EditTaskDrawer';
import AddTaskDrawer from './AddTaskDrawer';
import RegistrarHeader from './RegistrarHeader';

const RegistrarPendingTasksPage = ({ userInfo, onNavigate, onLogout }) => {
  const [activeTab, setActiveTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('Due in 30 days (as of 29 Oct., 2025)');
  const [selectedPriority, setSelectedPriority] = useState('Priority');
  const [selectedTaskType, setSelectedTaskType] = useState('Task type');
  const [showPeriodDropdown, setShowPeriodDropdown] = useState(false);
  const [showPriorityDropdown, setShowPriorityDropdown] = useState(false);
  const [showTaskTypeDropdown, setShowTaskTypeDropdown] = useState(false);
  const [showEditDrawer, setShowEditDrawer] = useState(false);
  const [showAddDrawer, setShowAddDrawer] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [openActionMenuIndex, setOpenActionMenuIndex] = useState(null);
  const [showChangeStatusSubmenu, setShowChangeStatusSubmenu] = useState(false);
  const actionMenuRefs = useRef({});
  const [tasksData, setTasksData] = useState([
    {
      title: 'Upload cause list for Nov 4',
      type: 'Cause List',
      linkedCase: '-',
      priority: 'High',
      dueDate: 'Nov 2',
      status: 'Pending',
      statusColor: 'rgba(16, 185, 129, 0.10)',
      textColor: '#10B981'
    },
    {
      title: 'Review Case #CM/0245/2023 update',
      type: 'Case',
      linkedCase: 'CM/0245/2023',
      priority: 'High',
      dueDate: 'Nov 1',
      status: 'In Progress',
      statusColor: 'rgba(59, 130, 246, 0.10)',
      textColor: '#3B82F6'
    },
    {
      title: 'Upload Gazette #GZ-1093',
      type: 'Gazette',
      linkedCase: '-',
      priority: 'Medium',
      dueDate: 'Nov 3',
      status: 'Pending',
      statusColor: 'rgba(16, 185, 129, 0.10)',
      textColor: '#10B981'
    },
    {
      title: 'Update judge assignment',
      type: 'Case',
      linkedCase: 'CM/0312/2023',
      priority: 'Low',
      dueDate: 'Nov 5',
      status: 'Pending',
      statusColor: 'rgba(16, 185, 129, 0.10)',
      textColor: '#10B981'
    },
    {
      title: 'Upload Gazette #GZ-1093',
      type: 'Gazette',
      linkedCase: '-',
      priority: 'Medium',
      dueDate: 'Nov 3',
      status: 'Pending',
      statusColor: 'rgba(16, 185, 129, 0.10)',
      textColor: '#10B981'
    },
    {
      title: 'Update judge assignment',
      type: 'Case',
      linkedCase: 'CM/0312/2023',
      priority: 'Low',
      dueDate: 'Nov 5',
      status: 'Pending',
      statusColor: 'rgba(16, 185, 129, 0.10)',
      textColor: '#10B981'
    },
    {
      title: 'Update judge assignment',
      type: 'Case',
      linkedCase: 'CM/0312/2023',
      priority: 'Low',
      dueDate: 'Nov 5',
      status: 'Pending',
      statusColor: 'rgba(16, 185, 129, 0.10)',
      textColor: '#10B981'
    },
    {
      title: 'Review Case #CM/0245/2023 update',
      type: 'Case',
      linkedCase: 'CM/0245/2023',
      priority: 'High',
      dueDate: 'Nov 1',
      status: 'In Progress',
      statusColor: 'rgba(59, 130, 246, 0.10)',
      textColor: '#3B82F6'
    }
  ]);
  const periodDropdownRef = useRef(null);
  const priorityDropdownRef = useRef(null);
  const taskTypeDropdownRef = useRef(null);


  // Handle click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (periodDropdownRef.current && !periodDropdownRef.current.contains(event.target)) {
        setShowPeriodDropdown(false);
      }
      if (priorityDropdownRef.current && !priorityDropdownRef.current.contains(event.target)) {
        setShowPriorityDropdown(false);
      }
      if (taskTypeDropdownRef.current && !taskTypeDropdownRef.current.contains(event.target)) {
        setShowTaskTypeDropdown(false);
      }
      // Check if click is outside any action menu
      const clickedOutsideAllMenus = Object.values(actionMenuRefs.current).every(
        ref => ref && !ref.contains(event.target)
      );
      if (clickedOutsideAllMenus && openActionMenuIndex !== null) {
        setOpenActionMenuIndex(null);
        setShowChangeStatusSubmenu(false);
      }
    };

    if (showPeriodDropdown || showPriorityDropdown || showTaskTypeDropdown || openActionMenuIndex !== null) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showPeriodDropdown, showPriorityDropdown, showTaskTypeDropdown, openActionMenuIndex]);

  const handleTaskClick = (task) => {
    // Only open drawer if action menu is not open
    if (openActionMenuIndex === null) {
      setSelectedTask(task);
      setShowEditDrawer(true);
    }
  };

  const handleSaveTask = (updatedTask) => {
    // Update the task in the tasksData array
    setTasksData(prevTasks => 
      prevTasks.map(task => 
        task.title === selectedTask.title && task.dueDate === selectedTask.dueDate
          ? { ...task, ...updatedTask }
          : task
      )
    );
    setShowEditDrawer(false);
    setSelectedTask(null);
  };

  const handleActionMenuClick = (e, index) => {
    e.stopPropagation();
    setOpenActionMenuIndex(openActionMenuIndex === index ? null : index);
    setShowChangeStatusSubmenu(false);
  };

  const handleEditClick = (task) => {
    setSelectedTask(task);
    setShowEditDrawer(true);
    setOpenActionMenuIndex(null);
  };

  const handleRemoveClick = (task) => {
    setTasksData(prevTasks => prevTasks.filter(t => 
      !(t.title === task.title && t.dueDate === task.dueDate)
    ));
    setOpenActionMenuIndex(null);
  };

  const handleChangeStatus = (task, newStatus) => {
    const statusColors = {
      'Pending': { color: 'rgba(16, 185, 129, 0.10)', text: '#10B981' },
      'In Progress': { color: 'rgba(59, 130, 246, 0.10)', text: '#3B82F6' },
      'Completed': { color: 'rgba(16, 185, 129, 0.10)', text: '#10B981' },
      'Cancelled': { color: 'rgba(239, 68, 68, 0.10)', text: '#EF4444' }
    };
    
    setTasksData(prevTasks => 
      prevTasks.map(t => 
        t.title === task.title && t.dueDate === task.dueDate
          ? { 
              ...t, 
              status: newStatus,
              statusColor: statusColors[newStatus]?.color || t.statusColor,
              textColor: statusColors[newStatus]?.text || t.textColor
            }
          : t
      )
    );
    setOpenActionMenuIndex(null);
    setShowChangeStatusSubmenu(false);
  };

  const handleAddTask = (newTaskData) => {
    const statusColors = {
      'Pending': { color: 'rgba(16, 185, 129, 0.10)', text: '#10B981' },
      'In Progress': { color: 'rgba(59, 130, 246, 0.10)', text: '#3B82F6' },
      'Completed': { color: 'rgba(16, 185, 129, 0.10)', text: '#10B981' },
      'Cancelled': { color: 'rgba(239, 68, 68, 0.10)', text: '#EF4444' }
    };

    const newTask = {
      title: newTaskData.title,
      type: newTaskData.type,
      linkedCase: newTaskData.linkedCase || '-',
      priority: newTaskData.priority,
      dueDate: newTaskData.dueDate,
      status: newTaskData.status || 'Pending',
      statusColor: statusColors[newTaskData.status || 'Pending']?.color || 'rgba(16, 185, 129, 0.10)',
      textColor: statusColors[newTaskData.status || 'Pending']?.text || '#10B981'
    };

    setTasksData(prevTasks => [...prevTasks, newTask]);
    setShowAddDrawer(false);
  };

  // Filter tasks based on active tab
  const filteredTasks = tasksData.filter(task => {
    if (activeTab === 'Due this week') {
      // Filter logic for due this week
      return true; // Placeholder
    }
    if (activeTab === 'Pending') {
      return task.status === 'Pending';
    }
    if (activeTab === 'High priority') {
      return task.priority === 'High';
    }
    return true; // 'All'
  });

  const totalTasks = filteredTasks.length;
  const dueIn3Days = filteredTasks.filter(task => {
    // Simple check - in real app, would parse dates
    return task.dueDate === 'Nov 1' || task.dueDate === 'Nov 2';
  }).length;

  // Use userInfo from props or localStorage
  const displayUserInfo = userInfo || JSON.parse(localStorage.getItem('userData') || '{}');

  return (
    <div className="bg-[#F7F8FA] min-h-screen w-full">
      {/* Header */}
      <RegistrarHeader userInfo={displayUserInfo} onNavigate={onNavigate} onLogout={onLogout} />
      
      {/* Page Title Section */}
      <div className="px-6 mb-4 pb-2 border-b border-[#D4E1EA]">
        <div className="flex flex-col items-start gap-1">
          <span className="text-[#050F1C] text-xl font-medium">High Court (Commercial),</span>
          <span className="text-[#050F1C] text-base opacity-75">Track all your activities here.</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-6 w-full">
        <div className="flex flex-col bg-white p-4 gap-4 rounded-lg w-full">
          {/* Breadcrumb and Filters */}
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <span className="text-[#525866] text-xs opacity-75">PENDING TASKS</span>
              <div className="flex items-center gap-6">
                <span className="text-[#525866] text-xs opacity-75">Show data for</span>
                <div className="relative" ref={periodDropdownRef}>
                  <button
                    onClick={() => {
                      setShowPeriodDropdown(!showPeriodDropdown);
                      setShowPriorityDropdown(false);
                      setShowTaskTypeDropdown(false);
                    }}
                    className="px-2 py-2 bg-[#F7F8FA] rounded-lg border border-[#D4E1EA] flex items-center gap-1"
                  >
                    <Calendar className="w-4 h-4 text-[#7B8794]" />
                    <span className="text-[#070810] text-sm">{selectedPeriod}</span>
                    <ChevronDown className="w-4 h-4 text-[#525866]" />
                  </button>
                  {showPeriodDropdown && (
                    <div className="absolute right-0 mt-1 bg-white border border-[#D4E1EA] rounded-lg shadow-lg z-10 min-w-[250px]">
                      <div 
                        onClick={() => {
                          setSelectedPeriod('Due in 30 days (as of 29 Oct., 2025)');
                          setShowPeriodDropdown(false);
                        }}
                        className="px-3 py-2 text-xs text-[#525866] hover:bg-gray-50 cursor-pointer"
                      >
                        Due in 30 days (as of 29 Oct., 2025)
                      </div>
                      <div 
                        onClick={() => {
                          setSelectedPeriod('Due in 7 days');
                          setShowPeriodDropdown(false);
                        }}
                        className="px-3 py-2 text-xs text-[#525866] hover:bg-gray-50 cursor-pointer"
                      >
                        Due in 7 days
                      </div>
                      <div 
                        onClick={() => {
                          setSelectedPeriod('Due in 3 days');
                          setShowPeriodDropdown(false);
                        }}
                        className="px-3 py-2 text-xs text-[#525866] hover:bg-gray-50 cursor-pointer"
                      >
                        Due in 3 days
                      </div>
                    </div>
                  )}
                </div>
                <div className="relative" ref={priorityDropdownRef}>
                  <button
                    onClick={() => {
                      setShowPriorityDropdown(!showPriorityDropdown);
                      setShowPeriodDropdown(false);
                      setShowTaskTypeDropdown(false);
                    }}
                    className="px-2 py-2 bg-[#F7F8FA] rounded-lg border border-[#D4E1EA] flex items-center gap-1"
                  >
                    <span className="text-[#070810] text-sm">{selectedPriority}</span>
                    <ChevronDown className="w-4 h-4 text-[#525866]" />
                  </button>
                  {showPriorityDropdown && (
                    <div className="absolute right-0 mt-1 bg-white border border-[#D4E1EA] rounded-lg shadow-lg z-10 min-w-[150px]">
                      <div 
                        onClick={() => {
                          setSelectedPriority('All');
                          setShowPriorityDropdown(false);
                        }}
                        className="px-3 py-2 text-xs text-[#525866] hover:bg-gray-50 cursor-pointer"
                      >
                        All
                      </div>
                      <div 
                        onClick={() => {
                          setSelectedPriority('High');
                          setShowPriorityDropdown(false);
                        }}
                        className="px-3 py-2 text-xs text-[#525866] hover:bg-gray-50 cursor-pointer"
                      >
                        High
                      </div>
                      <div 
                        onClick={() => {
                          setSelectedPriority('Medium');
                          setShowPriorityDropdown(false);
                        }}
                        className="px-3 py-2 text-xs text-[#525866] hover:bg-gray-50 cursor-pointer"
                      >
                        Medium
                      </div>
                      <div 
                        onClick={() => {
                          setSelectedPriority('Low');
                          setShowPriorityDropdown(false);
                        }}
                        className="px-3 py-2 text-xs text-[#525866] hover:bg-gray-50 cursor-pointer"
                      >
                        Low
                      </div>
                    </div>
                  )}
                </div>
                <div className="relative" ref={taskTypeDropdownRef}>
                  <button
                    onClick={() => {
                      setShowTaskTypeDropdown(!showTaskTypeDropdown);
                      setShowPeriodDropdown(false);
                      setShowPriorityDropdown(false);
                    }}
                    className="px-2 py-2 bg-[#F7F8FA] rounded-lg border border-[#D4E1EA] flex items-center gap-1"
                  >
                    <span className="text-[#070810] text-sm">{selectedTaskType}</span>
                    <ChevronDown className="w-4 h-4 text-[#525866]" />
                  </button>
                  {showTaskTypeDropdown && (
                    <div className="absolute right-0 mt-1 bg-white border border-[#D4E1EA] rounded-lg shadow-lg z-10 min-w-[150px]">
                      <div 
                        onClick={() => {
                          setSelectedTaskType('All');
                          setShowTaskTypeDropdown(false);
                        }}
                        className="px-3 py-2 text-xs text-[#525866] hover:bg-gray-50 cursor-pointer"
                      >
                        All
                      </div>
                      <div 
                        onClick={() => {
                          setSelectedTaskType('Case');
                          setShowTaskTypeDropdown(false);
                        }}
                        className="px-3 py-2 text-xs text-[#525866] hover:bg-gray-50 cursor-pointer"
                      >
                        Case
                      </div>
                      <div 
                        onClick={() => {
                          setSelectedTaskType('Cause List');
                          setShowTaskTypeDropdown(false);
                        }}
                        className="px-3 py-2 text-xs text-[#525866] hover:bg-gray-50 cursor-pointer"
                      >
                        Cause List
                      </div>
                      <div 
                        onClick={() => {
                          setSelectedTaskType('Gazette');
                          setShowTaskTypeDropdown(false);
                        }}
                        className="px-3 py-2 text-xs text-[#525866] hover:bg-gray-50 cursor-pointer"
                      >
                        Gazette
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Back Button */}
            <button className="w-fit p-2 bg-[#F7F8FA] rounded-lg cursor-pointer hover:opacity-70">
              <ChevronRight className="w-6 h-6 text-[#050F1C] rotate-180" />
            </button>

            {/* Stats Cards and Add Button */}
            <div className="flex justify-between items-center">
              <div className="flex gap-6" style={{ width: '550px' }}>
                <div className="flex-1 h-[58px] px-4 py-4 bg-white rounded-lg border border-[#D4E1EA] flex flex-col justify-center items-center gap-1"
                  style={{ boxShadow: '2px 2px 2px rgba(7, 8, 16, 0.10)' }}
                >
                  <span className="text-[#050F1C] text-base font-medium">{totalTasks}</span>
                  <span className="text-[#525866] text-sm text-center">Total Tasks</span>
                </div>
                <div className="flex-1 h-[58px] px-4 py-4 bg-white rounded-lg border border-[#D4E1EA] flex flex-col justify-center items-center gap-1"
                  style={{ boxShadow: '2px 2px 2px rgba(7, 8, 16, 0.10)' }}
                >
                  <span className="text-[#EF4444] text-base font-medium">{dueIn3Days}</span>
                  <span className="text-[#525866] text-sm text-center">Due in 3 days</span>
                </div>
              </div>
              <button
                onClick={() => setShowAddDrawer(true)}
                className="w-[272px] h-[58px] px-2.5 rounded-lg border-4 border-[#0F284726] text-white text-base font-bold hover:opacity-90 transition-opacity"
                style={{ 
                  background: 'linear-gradient(180deg, #022658 43%, #1A4983 100%)', 
                  boxShadow: '0px 4px 4px rgba(5, 15, 28, 0.10)',
                  outline: '4px solid rgba(15, 40, 71, 0.15)'
                }}
              >
                Add New Task
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-4 px-1 pb-2 border-b border-transparent">
            <button
              onClick={() => setActiveTab('All')}
              className={`pb-2 px-0 text-base transition-colors ${
                activeTab === 'All'
                  ? 'text-[#022658] border-b-4 border-[#022658] font-bold'
                  : 'text-[#525866] font-normal'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setActiveTab('Due this week')}
              className={`pb-2 px-0 text-base transition-colors ${
                activeTab === 'Due this week'
                  ? 'text-[#022658] border-b-4 border-[#022658] font-bold'
                  : 'text-[#525866] font-normal'
              }`}
            >
              Due this week
            </button>
            <button
              onClick={() => setActiveTab('Pending')}
              className={`pb-2 px-0 text-base transition-colors ${
                activeTab === 'Pending'
                  ? 'text-[#022658] border-b-4 border-[#022658] font-bold'
                  : 'text-[#525866] font-normal'
              }`}
            >
              Pending
            </button>
            <button
              onClick={() => setActiveTab('High priority')}
              className={`pb-2 px-0 text-base transition-colors ${
                activeTab === 'High priority'
                  ? 'text-[#022658] border-b-4 border-[#022658] font-bold'
                  : 'text-[#525866] font-normal'
              }`}
            >
              High priority
            </button>
          </div>

          {/* Search and Sort */}
          <div className="flex justify-between items-center">
            <div className="relative w-[490px]">
              <Search className="absolute left-2.5 top-2.5 w-3 h-3 text-[#868C98]" />
              <input
                type="text"
                placeholder="Search here"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-[31px] pl-8 pr-3 py-2 bg-[#F7F8FA] rounded-[5.8px] border border-[#F7F8FA] text-[#868C98] text-[10px] font-normal outline-none focus:border-[#022658]"
              />
            </div>
            <button className="px-2.5 py-2 rounded border border-[#D4E1EA] flex items-center gap-1.5 hover:bg-gray-50 transition-colors">
              <Filter className="w-3 h-3 text-[#868C98]" />
              <span className="text-[#525866] text-xs">Sort</span>
            </button>
          </div>

          {/* Tasks Table */}
          <div className="pt-4 pb-4 bg-white rounded-3xl w-full">
            <div className="overflow-hidden rounded-[14px] border border-[#E5E8EC] w-full">
              {/* Table Header */}
              <div className="bg-[#F4F6F9] py-4 px-3 w-full">
                <div className="flex items-center gap-3 w-full">
                  <div className="flex-1 min-w-[200px] px-2">
                    <span className="text-[#070810] text-sm font-bold">Task Title</span>
                  </div>
                  <div className="flex-1 min-w-[120px] px-2">
                    <span className="text-[#070810] text-sm font-bold">Type</span>
                  </div>
                  <div className="flex-1 min-w-[120px] px-2">
                    <span className="text-[#070810] text-sm font-bold">Linked case</span>
                  </div>
                  <div className="flex-1 min-w-[120px] px-2">
                    <span className="text-[#070810] text-sm font-bold">Priority</span>
                  </div>
                  <div className="flex-1 min-w-[120px] px-2">
                    <span className="text-[#070810] text-sm font-bold">Due date</span>
                  </div>
                  <div className="flex-1 min-w-[120px] px-2 flex justify-center">
                    <span className="text-[#070810] text-sm font-bold">Status</span>
                  </div>
                  <div className="w-[80px] flex-shrink-0 px-2 flex justify-center">
                    <span className="text-[#050F1C] text-sm font-bold">Actions</span>
                  </div>
                </div>
              </div>

              {/* Table Body */}
              <div className="bg-white w-full">
                {filteredTasks.map((task, index, array) => (
                  <div
                    key={index}
                    className={`flex items-center gap-3 py-3 px-3 w-full cursor-pointer hover:bg-gray-50 transition-colors ${
                      index < array.length - 1 ? 'border-b border-[#E5E8EC]' : ''
                    }`}
                    style={{ borderBottomWidth: index < array.length - 1 ? '0.40px' : '0' }}
                    onClick={() => handleTaskClick(task)}
                  >
                    <div className="flex-1 min-w-[200px] px-2">
                      <span className="text-[#070810] text-sm">{task.title}</span>
                    </div>
                    <div className="flex-1 min-w-[120px] px-2">
                      <span className="text-[#070810] text-sm">{task.type}</span>
                    </div>
                    <div className="flex-1 min-w-[120px] px-2">
                      <span className="text-[#070810] text-sm">{task.linkedCase}</span>
                    </div>
                    <div className="flex-1 min-w-[120px] px-2">
                      <span className="text-[#070810] text-sm">{task.priority}</span>
                    </div>
                    <div className="flex-1 min-w-[120px] px-2">
                      <span className="text-[#070810] text-sm">{task.dueDate}</span>
                    </div>
                    <div className="flex-1 min-w-[120px] px-2 flex justify-center">
                      <div
                        className="px-2 py-1 rounded-lg"
                        style={{
                          background: task.statusColor,
                          width: '90px'
                        }}
                      >
                        <span
                          className="text-xs font-medium"
                          style={{ color: task.textColor }}
                        >
                          {task.status}
                        </span>
                      </div>
                    </div>
                    <div 
                      className="w-[80px] flex-shrink-0 px-2 flex justify-center relative"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={(e) => handleActionMenuClick(e, index)}
                        className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                      >
                        <MoreVertical className="w-4 h-4 text-[#050F1C] rotate-90" />
                      </button>
                      {openActionMenuIndex === index && (
                        <div
                          ref={el => actionMenuRefs.current[index] = el}
                          className="absolute right-0 top-8 bg-white shadow-lg rounded-lg border border-[#E4E7EB] z-50 flex flex-col items-center p-4 gap-2"
                          style={{ 
                            boxShadow: '4px 4px 4px rgba(7, 8, 16, 0.10)', 
                            width: '140px',
                            minHeight: '120px'
                          }}
                        >
                          {!showChangeStatusSubmenu ? (
                            <>
                              <button
                                onClick={() => handleEditClick(task)}
                                className="w-full text-center text-[#050F1C] text-base font-normal leading-[22px] hover:bg-gray-50 py-1 rounded transition-colors"
                              >
                                <span style={{ fontFamily: 'Satoshi' }}>Edit</span>
                              </button>
                              <div className="w-full h-px bg-[#D4E1EA]"></div>
                              <button
                                onClick={() => handleRemoveClick(task)}
                                className="w-full text-center text-[#050F1C] text-base font-normal leading-[22px] hover:bg-gray-50 py-1 rounded transition-colors"
                              >
                                <span style={{ fontFamily: 'Satoshi' }}>Remove</span>
                              </button>
                              <div className="w-full h-px bg-[#D4E1EA]"></div>
                              <button
                                onClick={() => setShowChangeStatusSubmenu(true)}
                                className="w-full flex items-center justify-center gap-0.5 text-[#050F1C] text-base font-normal leading-[22px] hover:bg-gray-50 py-1 rounded transition-colors"
                              >
                                <span style={{ fontFamily: 'Satoshi' }}>Change Status</span>
                                <ChevronLeft className="w-3.5 h-3 text-[#141B34] rotate-90" />
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => setShowChangeStatusSubmenu(false)}
                                className="w-full flex items-center justify-center gap-0.5 text-[#050F1C] text-base font-normal leading-[22px] hover:bg-gray-50 py-1 rounded transition-colors mb-2"
                              >
                                <ChevronLeft className="w-3.5 h-3 text-[#141B34] -rotate-90" />
                                <span>Back</span>
                              </button>
                              <div className="w-full h-px bg-[#D4E1EA] mb-2"></div>
                              <button
                                onClick={() => handleChangeStatus(task, 'Pending')}
                                className="w-full text-center text-[#050F1C] text-base font-normal leading-[22px] hover:bg-gray-50 py-1 rounded transition-colors"
                              >
                                Pending
                              </button>
                              <button
                                onClick={() => handleChangeStatus(task, 'In Progress')}
                                className="w-full text-center text-[#050F1C] text-base font-normal leading-[22px] hover:bg-gray-50 py-1 rounded transition-colors"
                              >
                                In Progress
                              </button>
                              <button
                                onClick={() => handleChangeStatus(task, 'Completed')}
                                className="w-full text-center text-[#050F1C] text-base font-normal leading-[22px] hover:bg-gray-50 py-1 rounded transition-colors"
                              >
                                Completed
                              </button>
                              <button
                                onClick={() => handleChangeStatus(task, 'Cancelled')}
                                className="w-full text-center text-[#050F1C] text-base font-normal leading-[22px] hover:bg-gray-50 py-1 rounded transition-colors"
                              >
                                Cancelled
                              </button>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Task Drawer */}
      <EditTaskDrawer
        isOpen={showEditDrawer}
        onClose={() => {
          setShowEditDrawer(false);
          setSelectedTask(null);
        }}
        task={selectedTask}
        onSave={handleSaveTask}
      />

      {/* Add Task Drawer */}
      <AddTaskDrawer
        isOpen={showAddDrawer}
        onClose={() => setShowAddDrawer(false)}
        onSave={handleAddTask}
      />
    </div>
  );
};

export default RegistrarPendingTasksPage;

