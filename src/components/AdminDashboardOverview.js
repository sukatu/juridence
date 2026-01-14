import React, { useState, useRef, useEffect } from 'react';
import {
  Users,
  Database,
  Eye,
  FolderOpen,
  ArrowRight,
  Search,
  ChevronDown,
  Bell,
  X,
  User,
  Settings
} from 'lucide-react';
import AdminHeader from './admin/AdminHeader';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const AdminDashboardOverview = ({ stats, userInfo, onNavigate, onLogout }) => {

  const [selectedPeriod, setSelectedPeriod] = useState('Month');

  // Quick actions data with exact Figma values
  const quickActions = [
    {
      iconImage: '/images/total-person.png',
      title: 'Total Persons',
      value: stats?.totalPeople?.toLocaleString() || '388,983'
    },
    {
      iconImage: '/images/total-data.png',
      title: 'Total Data',
      value: stats?.totalCases?.toLocaleString() || '1,324,456'
    },
    {
      iconImage: '/images/watchlist.png',
      title: 'Watchlist',
      value: '12'
    },
    {
      iconImage: '/images/total-request.png',
      title: 'Total Requests',
      value: '31'
    }
  ];

  // Audit log data
  const auditLogs = [
    {
      user: 'Eric',
      action: 'Upload',
      item: 'Gazette 642',
      time: '1:34am 7/10',
      role: 'Admin',
      status: 'Success',
      statusBg: 'bg-[#30AB401A]',
      statusColor: 'text-emerald-500'
    },
    {
      user: 'Esther',
      action: 'Upload',
      item: 'Case 642',
      time: '1:34am 7/10',
      role: 'Registrar',
      status: 'Pending',
      statusBg: 'bg-[#F36F261A]',
      statusColor: 'text-[#F59E0B]'
    },
    {
      user: 'Esther',
      action: 'Upload',
      item: 'Case 642',
      time: '1:34am 7/10',
      role: 'Registrar',
      status: 'Success',
      statusBg: 'bg-[#30AB401A]',
      statusColor: 'text-emerald-500'
    }
  ];

  // Alerts data
  const alerts = [
    {
      title: 'New Search request',
      description: 'Elias Elton requested for search request on "Kofi Annan" with issue number SR/4321',
      time: 'Just now',
      iconUrl: 'https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Iq8V0MifpP/lhfdwlf4_expires_30_days.png'
    },
    {
      title: 'New Gazzette upload',
      description: 'Registrar Esther uploaded a gazette on "Law in Accra" with issue number G/4321',
      time: '3 hours ago',
      iconUrl: 'https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Iq8V0MifpP/ebionzlz_expires_30_days.png'
    }
  ];

  const periodFilters = ['Today', 'Yesterday', 'Week', 'Month', 'Quarter', 'Year'];

  // Generate chart data based on selected period
  const getChartData = () => {
    let labels, searchesData, exportsData;

    switch (selectedPeriod) {
      case 'Today':
        labels = ['12am', '3am', '6am', '9am', '12pm', '3pm', '6pm', '9pm'];
        searchesData = [5000, 8000, 12000, 18000, 22000, 25000, 20000, 15000];
        exportsData = [3000, 5000, 8000, 12000, 15000, 17000, 13000, 10000];
        break;
      
      case 'Yesterday':
        labels = ['12am', '3am', '6am', '9am', '12pm', '3pm', '6pm', '9pm'];
        searchesData = [4500, 7500, 11000, 17000, 21000, 24000, 19000, 14000];
        exportsData = [2800, 4800, 7500, 11500, 14500, 16500, 12500, 9500];
        break;
      
      case 'Week':
        labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        searchesData = [35000, 38000, 42000, 45000, 48000, 40000, 36000];
        exportsData = [24000, 26000, 28000, 30000, 33000, 28000, 25000];
        break;
      
      case 'Month':
        labels = [
          'Sept 15', 'Sept 17', 'Sept 19', 'Sept 21', 'Sept 23', 'Sept 25', 
          'Sept 27', 'Sept 29', 'Oct 1', 'Oct 3', 'Oct 5', 'Oct 7', 
          'Oct 9', 'Oct 11', 'Oct 13'
        ];
        searchesData = [
          32000, 35000, 38000, 42000, 45000, 48000, 54764, 52000, 
          50000, 48000, 46000, 44000, 42000, 40000, 38000
        ];
        exportsData = [
          22000, 24000, 26000, 28000, 30000, 33000, 35097, 34000, 
          32000, 30000, 28000, 26000, 24000, 22000, 20000
        ];
        break;
      
      case 'Quarter':
        labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        searchesData = [30000, 32000, 35000, 38000, 40000, 42000, 45000, 48000, 50000, 52000, 48000, 45000];
        exportsData = [20000, 22000, 24000, 26000, 28000, 30000, 32000, 34000, 36000, 38000, 35000, 32000];
        break;
      
      case 'Year':
        labels = ['2020', '2021', '2022', '2023', '2024'];
        searchesData = [25000, 30000, 38000, 45000, 52000];
        exportsData = [18000, 22000, 28000, 33000, 38000];
        break;
      
      default:
        labels = [
          'Sept 15', 'Sept 17', 'Sept 19', 'Sept 21', 'Sept 23', 'Sept 25', 
          'Sept 27', 'Sept 29', 'Oct 1', 'Oct 3', 'Oct 5', 'Oct 7', 
          'Oct 9', 'Oct 11', 'Oct 13'
        ];
        searchesData = [32000, 35000, 38000, 42000, 45000, 48000, 54764, 52000, 50000, 48000, 46000, 44000, 42000, 40000, 38000];
        exportsData = [22000, 24000, 26000, 28000, 30000, 33000, 35097, 34000, 32000, 30000, 28000, 26000, 24000, 22000, 20000];
    }

    return {
      labels,
      datasets: [
        {
          label: 'Searches',
          data: searchesData,
          borderColor: '#30AB40',
          backgroundColor: 'rgba(48, 171, 64, 0.2)',
          fill: true,
          tension: 0.4,
          pointRadius: 0,
          pointHoverRadius: 6,
          pointHoverBackgroundColor: '#30AB40',
          pointHoverBorderColor: '#fff',
          pointHoverBorderWidth: 2,
          borderWidth: 2
        },
        {
          label: 'Exports',
          data: exportsData,
          borderColor: '#3B82F6',
          backgroundColor: 'rgba(59, 130, 246, 0.2)',
          fill: true,
          tension: 0.4,
          pointRadius: 0,
          pointHoverRadius: 6,
          pointHoverBackgroundColor: '#3B82F6',
          pointHoverBorderColor: '#fff',
          pointHoverBorderWidth: 2,
          borderWidth: 2
        }
      ]
    };
  };

  const chartData = getChartData();

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: '#022658',
        titleColor: '#fff',
        bodyColor: '#fff',
        padding: 12,
        displayColors: true,
        callbacks: {
          title: (context) => {
            return 'Monday, Sep 26';
          },
          label: (context) => {
            const label = context.dataset.label || '';
            return `${label}: ${context.parsed.y.toLocaleString()}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: false,
        min: 10000,
        max: 60000,
        ticks: {
          stepSize: 10000,
          callback: (value) => value.toLocaleString(),
          color: '#868C98',
          font: {
            size: 11
          }
        },
        grid: {
          color: '#E5E8EC',
          drawBorder: false
        }
      },
      x: {
        ticks: {
          color: '#868C98',
          font: {
            size: 11
          }
        },
        grid: {
          display: false
        }
      }
    }
  };

  return (
    <div className="bg-[#F7F8FA] min-h-screen w-full">
      {/* Header */}
      <AdminHeader userInfo={userInfo} onNavigate={onNavigate} onLogout={onLogout} />
      
      {/* Welcome Message */}
      <div className="px-6 mb-6">
        <h1 className="text-2xl font-semibold text-[#050F1C]" style={{ fontFamily: 'Poppins' }}>Welcome Admin,</h1>
        <p className="text-sm text-[#868C98] mt-1" style={{ fontFamily: 'Satoshi' }}>Track all your activities here.</p>
      </div>

      {/* Main White Container */}
      <div className="bg-white rounded-lg p-4 flex flex-col gap-6">
        
        {/* Quick Actions Section */}
        <div className="flex flex-col gap-3">
          <h2 className="text-lg text-[#040E1B]">Quick actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => {
              return (
                <div
                  key={index}
                  className="bg-white rounded-2xl p-4 flex flex-col gap-3 border-l-2 border-b-2 border-[#FFD700]"
                  style={{ boxShadow: '0px 2px 20px #0000000D' }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex flex-col gap-2">
                      <img
                        src={action.iconImage}
                        alt={action.title}
                        className="w-6 h-6 object-contain"
                      />
                      <span className="text-base text-[#040E1B]">{action.title}</span>
                    </div>
                    <ArrowRight size={24} className="text-[#022658]" />
                  </div>
                  <div className="flex flex-col gap-[7px]">
                    <div className="h-[1px] bg-[#B0B8C5]"></div>
                    <span className="text-xl font-bold text-[#040E1B]">{action.value}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Chart Section - SEARCH VS. EXPORT */}
        <div className="bg-white rounded-lg p-6">
          {/* Chart Header */}
          <div className="flex items-center justify-between mb-6">
            {/* Left: Title */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-[#040E1B] uppercase tracking-wide">SEARCH VS. EXPORT</span>
              <ChevronDown size={16} className="text-[#868C98]" />
            </div>
            
            {/* Right: Period Filters */}
            <div className="flex items-center gap-2">
              {/* Period Buttons */}
              <div className="flex items-center bg-[#F7F8FA] rounded-lg p-1 gap-1">
                {periodFilters.map((period) => (
                  <button
                    key={period}
                    onClick={() => setSelectedPeriod(period)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                      selectedPeriod === period
                        ? 'bg-white text-[#040E1B] shadow-sm'
                        : 'text-[#868C98] hover:text-[#040E1B]'
                    }`}
                  >
                    {period}
                  </button>
                ))}
              </div>
              
              {/* Select Period Dropdown */}
              <select className="px-3 py-1.5 text-xs text-[#868C98] bg-white border border-gray-200 rounded-lg outline-none cursor-pointer hover:border-gray-300">
                <option>Select period</option>
                <option>Last 7 days</option>
                <option>Last 30 days</option>
                <option>Last 90 days</option>
                <option>Custom range</option>
              </select>
            </div>
          </div>

          {/* Chart and Stats Layout */}
          <div className="flex gap-6">
            {/* Left: Stats Panel */}
            <div className="flex flex-col gap-6 w-[200px] flex-shrink-0">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 rounded-full bg-[#30AB40]"></div>
                  <span className="text-xs text-[#868C98]">Total User search</span>
                </div>
                <div className="text-xl font-semibold text-[#040E1B]">356,928</div>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 rounded-full bg-[#3B82F6]"></div>
                  <span className="text-xs text-[#868C98]">Total User exports</span>
                </div>
                <div className="text-xl font-semibold text-[#040E1B]">275,588</div>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 rounded-full bg-[#868C98]"></div>
                  <span className="text-xs text-[#868C98]">Avg. time on page</span>
                </div>
                <div className="text-xl font-semibold text-[#040E1B]">00:03:51</div>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 rounded-full bg-[#868C98]"></div>
                  <span className="text-xs text-[#868C98]">Active users</span>
                </div>
                <div className="text-xl font-semibold text-[#040E1B]">295,983</div>
              </div>
            </div>

            {/* Right: Chart */}
            <div className="flex-1 bg-[#F7F8FA] rounded-lg p-4 h-[280px]">
              <Line data={chartData} options={chartOptions} />
            </div>
          </div>

          {/* Chart Footer Info */}
          <div className="mt-4 flex items-center justify-between text-sm">
            <div className="text-[#868C98]">
              <span className="font-medium">Searches:</span> <span className="text-[#040E1B] font-semibold">54,764</span>
            </div>
            <div className="text-[#040E1B] font-medium">Monday, Sep 26</div>
            <div className="text-[#868C98]">
              <span className="font-medium">Exports:</span> <span className="text-[#040E1B] font-semibold">35,097</span>
            </div>
          </div>
        </div>

        {/* Bottom Row - Audit Log and Alerts */}
        <div className="flex gap-6">
          {/* Audit Log Table */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg text-[#040E1B]">Audit Log</h3>
              <button className="text-xs font-bold text-[#022658] hover:underline">
                See all
              </button>
            </div>

            <div className="rounded-[14px] border border-[#E5E8EC] overflow-hidden">
              {/* Table Header */}
              <div className="flex items-start bg-[#F4F6F9] py-4">
                <div className="w-[110px] py-[7px] pl-4 mr-3">
                  <span className="text-sm font-bold text-[#070810]">User</span>
                </div>
                <div className="w-[110px] py-[7px] pl-4 mr-3">
                  <span className="text-sm font-bold text-[#070810]">Action</span>
                </div>
                <div className="w-[110px] py-[7px] pl-4 mr-3">
                  <span className="text-sm font-bold text-[#070810]">Item</span>
                </div>
                <div className="w-[110px] py-[7px] pl-4 mr-3">
                  <span className="text-sm font-bold text-[#070810]">Time</span>
                </div>
                <div className="w-[110px] py-[7px] pl-4 mr-3">
                  <span className="text-sm font-bold text-[#070810]">Role</span>
                </div>
                <div className="w-[110px] py-[7px] px-[35px]">
                  <span className="text-sm font-bold text-[#070810]">Status</span>
                </div>
              </div>

              {/* Table Rows */}
              {auditLogs.map((log, index) => (
                <div key={index} className="flex items-center py-3 hover:bg-gray-50 transition-colors">
                  <div className="w-[110px] py-[7px] pl-4 mr-3">
                    <span className="text-sm text-[#070810]">{log.user}</span>
                  </div>
                  <div className="w-[110px] py-[7px] pl-4 mr-3">
                    <span className="text-sm text-[#070810]">{log.action}</span>
                  </div>
                  <div className="w-[110px] py-[7px] px-4 mr-3">
                    <span className="text-sm text-[#070810]">{log.item}</span>
                  </div>
                  <div className="w-[110px] py-[7px] px-4 mr-3">
                    <span className="text-sm text-[#070810]">{log.time}</span>
                  </div>
                  <div className="w-[110px] py-[7px] pl-4 mr-3">
                    <span className="text-sm text-[#070810]">{log.role}</span>
                  </div>
                  <div className="w-[110px] py-2 px-5">
                    <div className={`${log.statusBg} py-[3px] rounded-lg text-center`}>
                      <span className={`text-xs ${log.statusColor}`}>{log.status}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Alerts Section */}
          <div className="w-[358px] flex-shrink-0">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg text-[#040E1B]">Alerts</h3>
              <button className="text-xs font-bold text-[#022658] hover:underline">
                See all
              </button>
            </div>

            <div className="bg-white py-[15px] rounded-3xl border border-[#D4E1EA]">
              {alerts.map((alert, index) => (
                <div key={index} className={`px-4 ${index === 0 ? 'mb-4' : ''}`}>
                  <div className="flex items-start gap-3 mb-3">
                    <img
                      src={alert.iconUrl}
                      alt={alert.title}
                      className="w-8 h-8 object-contain flex-shrink-0"
                    />
                    <div className="flex flex-col gap-2 flex-1">
                      <span className="text-base text-[#040E1B] font-medium">{alert.title}</span>
                      <span className="text-sm text-[#525866] leading-relaxed">{alert.description}</span>
                    </div>
                  </div>
                  <span className="text-xs text-[#525866] ml-11 block">{alert.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardOverview;
