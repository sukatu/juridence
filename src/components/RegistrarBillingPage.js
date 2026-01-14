import React, { useState } from 'react';
import { Search, ChevronDown, Bell, ChevronRight, ChevronLeft, Home, Check } from 'lucide-react';
import RegistrarBillingHistoryPage from './RegistrarBillingHistoryPage';
import RegistrarHeader from './RegistrarHeader';

const RegistrarBillingPage = ({ userInfo, onNavigate, onLogout }) => {
  const [billingPeriod, setBillingPeriod] = useState('Yearly');
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [showBillingHistory, setShowBillingHistory] = useState(false);

  const plans = [
    {
      name: 'Standard Plan',
      description: 'Perfect for small organisations with advanced needs',
      features: [
        'Manage up to 50 active cases',
        'View published cause lists only',
        '5 GB secure storage',
        'Basic case reports',
        'Email support, single user'
      ]
    },
    {
      name: 'Pro Plan',
      description: 'Perfect for larger organizations with advanced needs',
      features: [
        'Unlimited case access across all divisions',
        'Full automation with smart linking and schedule analytics',
        '100 GB + advanced file indexing & search',
        'Advanced analytics with custom exports & API access',
        '24/7 support, multi-user roles, and dedicated account manager'
      ]
    },
    {
      name: 'Advanced Plan',
      description: 'Ideal for growing startups and mid-sized companies',
      features: [
        'Manage up to 250 active cases',
        'Upload & manage cause lists and gazette entries',
        '25 GB storage with version control',
        'Detailed reports with trend charts',
        'Priority email + 3 team seats'
      ]
    }
  ];

  // Show billing history if requested
  if (showBillingHistory) {
    return (
      <RegistrarBillingHistoryPage
        onBack={() => setShowBillingHistory(false)}
      />
    );
  }

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
        <div className="flex flex-col bg-white p-4 gap-6 rounded-lg w-full" style={{ minHeight: '917px' }}>
          {/* Breadcrumb */}
          <span className="text-[#525866] text-xs opacity-75">BILLING</span>

          {/* Header Section */}
          <div className="flex justify-between items-center">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-1">
                <ChevronRight className="w-4 h-4 text-[#050F1C] rotate-180" />
                <Home className="w-4 h-4 text-[#050F1C]" />
                <span className="text-[#050F1C] text-xl font-semibold">Billing</span>
              </div>
              <span className="text-[#070810] text-sm opacity-75">
                All billing information and history are here.
              </span>
            </div>
            <button
              onClick={() => setShowBillingHistory(true)}
              className="px-4 py-2 rounded-lg border border-[#F59E0B] text-[#F59E0B] text-base font-medium hover:opacity-90 transition-opacity"
            >
              View Billing history
            </button>
          </div>

          {/* Billing Period Toggle */}
          <div className="w-[386px] px-2 py-1 bg-white rounded-lg border border-[#D4E1EA] flex justify-between items-center">
            <button
              onClick={() => setBillingPeriod('Monthly')}
              className={`flex-1 px-2 py-2 rounded text-base font-bold transition-colors ${
                billingPeriod === 'Monthly'
                  ? 'bg-[#022658] text-white'
                  : 'text-[#050F1C] font-normal'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingPeriod('Yearly')}
              className={`flex-1 px-2 py-2 rounded text-base font-bold transition-colors ${
                billingPeriod === 'Yearly'
                  ? 'bg-[#022658] text-white'
                  : 'text-[#050F1C] font-normal'
              }`}
            >
              Yearly
            </button>
          </div>

          {/* Pricing Plans */}
          <div className="flex gap-5" style={{ gap: '20px' }}>
            {plans.map((plan, index) => (
              <div
                key={index}
                className="flex-1 p-6 bg-white rounded-lg border border-[#D4E1EA] flex flex-col gap-6"
                style={{ borderWidth: '1.5px' }}
              >
                {/* Plan Header */}
                <div className="flex flex-col gap-6">
                  <div className="flex flex-col gap-2">
                    <span className="text-[#050F1C] text-2xl font-medium">{plan.name}</span>
                    <span className="text-[#525866] text-base">{plan.description}</span>
                  </div>

                  {/* Features List */}
                  <div className="px-4 py-5 bg-white rounded-3xl border border-[#D4E1EA] flex flex-col gap-5">
                    {plan.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-start gap-3 w-full">
                        <div className="w-5 h-5 bg-[#022658] rounded-full flex items-center justify-center flex-shrink-0">
                          <Check className="w-3.5 h-3.5 text-white" />
                        </div>
                        <span className="text-[#050F1C] text-base flex-1">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Contact Button */}
                <button
                  className="w-full h-[58px] px-2.5 rounded-lg border-4 border-[#0F284726] text-white text-base font-bold hover:opacity-90 transition-opacity"
                  style={{ 
                    background: 'linear-gradient(180deg, #022658 43%, #1A4983 100%)', 
                    boxShadow: '0px 4px 4px rgba(5, 15, 28, 0.10)',
                    outline: '4px solid rgba(15, 40, 71, 0.15)'
                  }}
                >
                  Contact us for this Plan billing
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegistrarBillingPage;

