import React, { useState } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Filler, Title, Tooltip, Legend } from 'chart.js';
import { Line } from 'react-chartjs-2';
import AdminHeader from './AdminHeader';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Title, Tooltip, Legend);

const RevenuePage = ({ userInfo, onNavigate, onLogout }) => {
  const [currentPage, setCurrentPage] = useState(101);

  // Sample payment data
  const paymentData = [
    { clientName: 'John Sam Chris', email: 'johnsamchris@gmail.com', paymentDate: '10-10-2025', subscriptionPlan: 'Lite plan - Ghc20', amountPaid: 'Ghc230', paymentMethod: 'MTN Mobile Money', transactionId: '01234567890', status: 'Completed', statusColor: 'blue' },
    { clientName: 'Kwame Louis', email: 'kwamelouis@icloud.com', paymentDate: '03-11-2000', subscriptionPlan: 'Standard plan - Ghc59', amountPaid: 'Ghc230', paymentMethod: 'Visa •••• 5678', transactionId: '01234567890', status: 'Pending', statusColor: 'green' },
    { clientName: 'Barimah John', email: 'barimah@yahoo.com', paymentDate: '03-11-2000', subscriptionPlan: 'Pro plan - Ghc100', amountPaid: 'Ghc230', paymentMethod: 'Vodafone Cash', transactionId: '01234567890', status: 'Failed', statusColor: 'red' },
    { clientName: 'Eric Nkrumah', email: 'nkrumah@outlook.com', paymentDate: '15-11-1990', subscriptionPlan: 'Lite plan - Ghc20', amountPaid: 'Ghc230', paymentMethod: 'MTN Mobile Money', transactionId: '01234567890', status: 'Failed', statusColor: 'red' },
    { clientName: 'Mark Solomon', email: 'marksolomon@gmail.com', paymentDate: '15-11-1990', subscriptionPlan: 'Standard plan - Ghc59', amountPaid: 'Ghc230', paymentMethod: 'Visa •••• 5678', transactionId: '01234567890', status: 'Completed', statusColor: 'blue' },
    { clientName: 'Joel Nkrumah', email: 'joelnkrumah@icloud.com', paymentDate: '03-11-2000', subscriptionPlan: 'Lite plan - Ghc20', amountPaid: 'Ghc230', paymentMethod: 'Vodafone Cash', transactionId: '01234567890', status: 'Pending', statusColor: 'green' },
    { clientName: 'Samuel Ofori', email: 'samuelofori@yahoo.com', paymentDate: '03-11-2000', subscriptionPlan: 'Pro plan - Ghc100', amountPaid: 'Ghc230', paymentMethod: 'Mastercard •••• 9012', transactionId: '01234567890', status: 'Completed', statusColor: 'blue' }
  ];

  const getStatusClasses = (color) => {
    switch (color) {
      case 'blue':
        return { bg: 'bg-[#30AB931A]', text: 'text-blue-500' };
      case 'green':
        return { bg: 'bg-[#30AB401A]', text: 'text-emerald-500' };
      case 'red':
        return { bg: 'bg-[#F359261A]', text: 'text-red-500' };
      default:
        return { bg: 'bg-gray-100', text: 'text-gray-600' };
    }
  };

  // Chart data and options
  const chartData = {
    labels: ['Sept 6', 'Sept 11', 'Sept 16', 'Sept 21', 'Sept 26', 'Oct 1', 'Oct 6'],
    datasets: [
      {
        label: 'Revenue',
        data: [20000, 35000, 28000, 42000, 38000, 45000, 40000],
        borderColor: '#022658',
        backgroundColor: 'rgba(2, 38, 88, 0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 6,
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        enabled: true,
        mode: 'index',
        intersect: false,
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 50000,
        ticks: {
          stepSize: 10000,
          callback: function(value) {
            return value.toLocaleString();
          }
        },
        grid: {
          color: '#D4E1EA',
          drawBorder: false,
        }
      },
      x: {
        grid: {
          display: false,
        }
      }
    }
  };

  return (
    <div className="bg-[#F7F8FA] min-h-screen w-full pt-2">
      {/* Header */}
      <AdminHeader userInfo={userInfo} onNavigate={onNavigate} onLogout={onLogout} />

      {/* Main Content */}
      <div className="px-6 w-full">
        <div className="flex flex-col w-full bg-white px-3.5 gap-6 rounded-lg">
          <div className="flex flex-col items-start w-full mt-4 mb-8 gap-6">
            {/* Breadcrumb */}
            <span className="text-[#525866] text-xs whitespace-nowrap">REVENUE</span>

            {/* Back Button */}
            <img
              src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Iq8V0MifpP/vzl7f2ee_expires_30_days.png"
              className="w-10 h-10 object-fill cursor-pointer hover:opacity-70"
            />

            {/* Stats Cards */}
            <div className="flex flex-col w-full gap-2">
              <div className="flex items-start w-full gap-6">
                <div className="flex flex-col items-center bg-white text-left flex-1 py-[21px] gap-2 rounded-lg border border-solid border-[#D4E1EA]" style={{ boxShadow: '2px 2px 2px #0708101A' }}>
                  <span className="text-[#040E1B] text-lg whitespace-nowrap">Gh¢150,967.64</span>
                  <span className="text-[#525866] text-base whitespace-nowrap">Total Revenue</span>
                </div>
                <div className="flex flex-col items-center bg-white text-left flex-1 py-[21px] gap-2 rounded-lg border border-solid border-[#D4E1EA]" style={{ boxShadow: '2px 2px 2px #0708101A' }}>
                  <span className="text-[#040E1B] text-lg whitespace-nowrap">653</span>
                  <span className="text-[#525866] text-base whitespace-nowrap">Total Corporate Clients</span>
                </div>
                <div className="flex flex-col items-center bg-white text-left flex-1 py-[21px] gap-2 rounded-lg border border-solid border-[#D4E1EA]" style={{ boxShadow: '2px 2px 2px #0708101A' }}>
                  <span className="text-[#040E1B] text-lg whitespace-nowrap">1,375</span>
                  <span className="text-[#525866] text-base whitespace-nowrap">Total Court Registrars</span>
                </div>
              </div>

              {/* Revenue Increase Card */}
              <div className="flex items-center w-full py-4 pl-4 gap-2.5 rounded-lg border border-solid border-[#D4E1EA]">
                <span className="text-emerald-500 text-base whitespace-nowrap">16% Higher than last month's revenue</span>
                <span className="text-[#525866] text-sm whitespace-nowrap">This result is from the statistics data</span>
              </div>
            </div>
          </div>

          {/* Chart Section */}
          <div className="w-full">
            {/* Chart Controls */}
            <div className="flex justify-end items-center w-full mb-2">
              <span className="text-[#525866] text-xs mr-[25px] whitespace-nowrap">Show data for</span>
              <div className="flex items-start bg-[#F7F8FA] w-[261px] p-2 mr-6 gap-1 rounded-lg border border-solid border-[#D4E1EA]">
                <img
                  src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Iq8V0MifpP/1y9di61a_expires_30_days.png"
                  className="w-4 h-4 rounded-lg object-fill flex-shrink-0"
                />
                <div className="flex items-start flex-1 gap-[3px]">
                  <span className="text-[#070810] text-sm whitespace-nowrap">Last 30 days (as of 29 Oct., 2025)</span>
                  <img
                    src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Iq8V0MifpP/b7pdu4z4_expires_30_days.png"
                    className="w-4 h-4 object-fill flex-shrink-0"
                  />
                </div>
              </div>
              <button className="flex items-start bg-[#F7F8FA] text-left w-[60px] p-2 gap-[3px] rounded-lg border border-solid border-[#D4E1EA] hover:bg-gray-100 transition-colors">
                <span className="text-[#070810] text-sm whitespace-nowrap">Role</span>
                <img
                  src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Iq8V0MifpP/2a5gxo6w_expires_30_days.png"
                  className="w-4 h-4 rounded-lg object-fill flex-shrink-0"
                />
              </button>
            </div>

            {/* Chart */}
            <div className="w-full mb-6" style={{ height: '300px' }}>
              <Line data={chartData} options={chartOptions} />
            </div>

            {/* Chart Stats */}
            <div className="self-stretch bg-[#D4E1EA] h-[1px] mb-6"></div>
            <div className="flex items-center w-full mb-12">
              <div className="flex flex-col items-center flex-1 gap-0.5">
                <span className="text-[#040E1B] text-lg whitespace-nowrap">Avg. new subscribers</span>
                <span className="text-[#040E1B] text-3xl font-bold whitespace-nowrap">608,762</span>
              </div>
              <div className="bg-[#D4E1EA] w-0.5 h-[84px]"></div>
              <div className="flex flex-col items-center flex-1 gap-0.5">
                <span className="text-[#040E1B] text-lg whitespace-nowrap">Avg. subscribers per month</span>
                <span className="text-[#040E1B] text-3xl font-bold whitespace-nowrap">242,928</span>
              </div>
              <div className="bg-[#D4E1EA] w-0.5 h-[84px]"></div>
              <div className="flex flex-col items-center flex-1 gap-0.5">
                <span className="text-[#040E1B] text-lg whitespace-nowrap">Avg. subscribers per year</span>
                <span className="text-[#040E1B] text-3xl font-bold whitespace-nowrap">30,817</span>
              </div>
            </div>
          </div>

          {/* Payment Transactions Table */}
          <div className="flex flex-col w-full gap-4 pb-8">
            <span className="text-[#040E1B] text-xl whitespace-nowrap">Payment Transactions</span>

            {/* Table */}
            <div className="flex flex-col w-full gap-1 rounded-[14px] border border-solid border-[#E5E8EC] overflow-hidden">
              {/* Table Header */}
              <div className="flex items-center w-full bg-[#F4F6F9] py-4 px-4">
                <div className="w-[12%] py-[7px] pr-2">
                  <span className="text-[#070810] text-sm font-bold whitespace-nowrap">Client name</span>
                </div>
                <div className="w-[15%] py-[7px] pr-2">
                  <span className="text-[#070810] text-sm font-bold whitespace-nowrap">Email Address</span>
                </div>
                <div className="w-[10%] py-[7px] pr-2">
                  <span className="text-[#070810] text-sm font-bold whitespace-nowrap">Payment date</span>
                </div>
                <div className="w-[15%] py-[7px] pr-2">
                  <span className="text-[#070810] text-sm font-bold whitespace-nowrap">Subscription plan</span>
                </div>
                <div className="w-[10%] py-[7px] pr-2">
                  <span className="text-[#070810] text-sm font-bold whitespace-nowrap">Amount Paid</span>
                </div>
                <div className="w-[12%] py-[7px] pr-2">
                  <span className="text-[#070810] text-sm font-bold whitespace-nowrap">Payment Method</span>
                </div>
                <div className="w-[12%] py-[7px] pr-2">
                  <span className="text-[#070810] text-sm font-bold whitespace-nowrap">Transaction ID</span>
                </div>
                <div className="w-[9%] py-[7px] pr-2">
                  <span className="text-[#070810] text-sm font-bold whitespace-nowrap">Status</span>
                </div>
                <div className="w-[5%] py-[7px] pr-2">
                  <span className="text-[#070810] text-sm font-bold whitespace-nowrap">Actions</span>
                </div>
              </div>

              {/* Table Rows */}
              {paymentData.map((payment, idx) => {
                const statusClasses = getStatusClasses(payment.statusColor);
                return (
                  <div key={idx} className="flex items-center w-full py-3 px-4 hover:bg-blue-50 cursor-pointer transition-colors">
                    <div className="w-[12%] py-[7px] pr-2">
                      <span className="text-[#070810] text-sm whitespace-nowrap overflow-hidden text-ellipsis">{payment.clientName}</span>
                    </div>
                    <div className="w-[15%] py-[7px] pr-2">
                      <span className="text-[#070810] text-sm whitespace-nowrap overflow-hidden text-ellipsis">{payment.email}</span>
                    </div>
                    <div className="w-[10%] py-[7px] pr-2">
                      <span className="text-[#070810] text-sm whitespace-nowrap">{payment.paymentDate}</span>
                    </div>
                    <div className="w-[15%] py-[7px] pr-2">
                      <span className="text-[#070810] text-sm whitespace-nowrap overflow-hidden text-ellipsis">{payment.subscriptionPlan}</span>
                    </div>
                    <div className="w-[10%] py-[7px] pr-2">
                      <span className="text-[#070810] text-sm whitespace-nowrap">{payment.amountPaid}</span>
                    </div>
                    <div className="w-[12%] py-[7px] pr-2">
                      <span className="text-[#070810] text-sm whitespace-nowrap overflow-hidden text-ellipsis">{payment.paymentMethod}</span>
                    </div>
                    <div className="w-[12%] py-[7px] pr-2">
                      <span className="text-[#070810] text-sm whitespace-nowrap">{payment.transactionId}</span>
                    </div>
                    <div className="w-[9%] py-[7px] pr-2">
                      <button className={`flex flex-col items-center w-full ${statusClasses.bg} text-left py-[3px] rounded-lg border-0`}>
                        <span className={`${statusClasses.text} text-xs whitespace-nowrap`}>{payment.status}</span>
                      </button>
                    </div>
                    <div className="w-[5%] py-[7px] pr-2 flex justify-center">
                      <img
                        src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Iq8V0MifpP/ybor38kf_expires_30_days.png"
                        className="w-4 h-4 object-fill flex-shrink-0 cursor-pointer hover:opacity-70"
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            <div className="flex justify-start items-center w-full mt-4">
              <span className="text-[#525866] text-sm mr-[42px] whitespace-nowrap">110-120 of 1,250</span>
              <button className="flex items-center bg-white text-left w-[70px] py-2 px-3 mr-1.5 gap-1 rounded border border-solid border-[#D4E1EA] hover:bg-gray-50">
                <img
                  src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Iq8V0MifpP/kkliohn7_expires_30_days.png"
                  className="w-4 h-4 rounded object-fill flex-shrink-0"
                />
                <span className="text-[#525866] text-xs whitespace-nowrap">Back</span>
              </button>
              <div className="flex flex-col items-center bg-[#022658] w-[21px] py-[7px] px-2 mr-1.5 rounded">
                <span className="text-white text-xs font-bold whitespace-nowrap">1</span>
              </div>
              <img
                src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Iq8V0MifpP/giw1vjiq_expires_30_days.png"
                className="w-[31px] h-[31px] mr-1.5 object-fill flex-shrink-0"
              />
              <div className="flex flex-col items-center bg-white w-[31px] py-[7px] px-2 mr-1.5 rounded border border-solid border-[#D4E1EA]">
                <span className="text-[#525866] text-xs whitespace-nowrap">98</span>
              </div>
              <div className="flex flex-col items-center bg-white w-[31px] py-[7px] px-2 mr-1.5 rounded border border-solid border-[#D4E1EA]">
                <span className="text-[#525866] text-xs whitespace-nowrap">99</span>
              </div>
              <div className="flex flex-col items-center bg-white w-[37px] py-[7px] px-2 mr-1.5 rounded border border-solid border-[#D4E1EA]">
                <span className="text-[#525866] text-xs whitespace-nowrap">100</span>
              </div>
              <div className="flex flex-col items-center bg-[#022658] w-[41px] py-[7px] px-3 mr-1.5 rounded">
                <span className="text-white text-xs font-bold whitespace-nowrap">101</span>
              </div>
              <div className="flex flex-col items-center bg-white w-[35px] py-[7px] px-2 mr-1.5 rounded border border-solid border-[#D4E1EA]">
                <span className="text-[#525866] text-xs whitespace-nowrap">102</span>
              </div>
              <div className="flex flex-col items-center bg-white w-[35px] py-[7px] px-2 mr-1.5 rounded border border-solid border-[#D4E1EA]">
                <span className="text-[#525866] text-xs whitespace-nowrap">103</span>
              </div>
              <img
                src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Iq8V0MifpP/5zukcpb5_expires_30_days.png"
                className="w-[31px] h-[31px] mr-1.5 object-fill flex-shrink-0"
              />
              <div className="flex flex-col items-center bg-white w-[34px] py-[7px] px-2 mr-1.5 rounded border border-solid border-[#D4E1EA]">
                <span className="text-[#525866] text-xs whitespace-nowrap">125</span>
              </div>
              <button className="flex items-center bg-white text-left w-[68px] py-2 px-3 mr-10 gap-1.5 rounded border border-solid border-[#D4E1EA] hover:bg-gray-50">
                <span className="text-[#525866] text-xs whitespace-nowrap">Next</span>
                <img
                  src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Iq8V0MifpP/4uzc12a6_expires_30_days.png"
                  className="w-4 h-4 rounded object-fill flex-shrink-0"
                />
              </button>
              <div className="flex items-center w-[119px]">
                <span className="text-[#040E1B] text-sm mr-[11px] whitespace-nowrap">Page</span>
                <div className="flex flex-col items-start bg-white w-[51px] py-[5px] pl-2 mr-2 rounded border border-solid border-[#F59E0B]">
                  <span className="text-[#040E1B] text-sm whitespace-nowrap">{currentPage}</span>
                </div>
                <span className="text-[#F59E0B] text-sm font-bold cursor-pointer hover:underline whitespace-nowrap">Go</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RevenuePage;
