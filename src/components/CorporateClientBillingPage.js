import React, { useState } from 'react';
import { Bell, ChevronRight, ChevronLeft, Check, CreditCard } from 'lucide-react';
import CorporateClientBillingHistoryPage from './CorporateClientBillingHistoryPage';
import CorporateClientHeader from './CorporateClientHeader';

const CorporateClientBillingPage = ({ userInfo, onNavigate, onLogout }) => {
  const [billingPeriod, setBillingPeriod] = useState('yearly');
  const [showBillingHistory, setShowBillingHistory] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Use userInfo from props or localStorage
  const displayUserInfo = userInfo || JSON.parse(localStorage.getItem('userData') || '{}');
  const organizationName = displayUserInfo?.organization || 'Access Bank';

  const standardPlanFeatures = [
    'Manage up to 50 active cases',
    'View published cause lists only',
    '5 GB secure storage',
    'Basic case reports',
    'Email support, single user'
  ];

  const proPlanFeatures = [
    'Unlimited case access across all divisions',
    'Full automation with smart linking and schedule analytics',
    '100 GB + advanced file indexing & search',
    'Advanced analytics with custom exports & API access',
    '24/7 support, multi-user roles, and dedicated account manager'
  ];

  const advancedPlanFeatures = [
    'Manage up to 250 active cases',
    'Upload & manage cause lists and gazette entries',
    '25 GB storage with version control',
    'Detailed reports with trend charts',
    'Priority email + 3 team seats'
  ];

  // If billing history is shown, render that page
  if (showBillingHistory) {
    return <CorporateClientBillingHistoryPage onBack={() => setShowBillingHistory(false)} />;
  }

  return (
    <div className="bg-[#F7F8FA] min-h-screen">
      {/* Header */}
      <CorporateClientHeader userInfo={displayUserInfo} onNavigate={onNavigate} onLogout={onLogout} />

      {/* Main Content */}
      <div className="px-6">
        {/* Page Title */}
        <div className="flex flex-col items-start w-full gap-2 mb-4">
          <span className="text-[#050F1C] text-xl font-medium" style={{ fontFamily: 'Poppins' }}>
            {organizationName},
          </span>
          <span className="text-[#050F1C] text-base opacity-75" style={{ fontFamily: 'Satoshi' }}>
            Track all your activities here.
          </span>
        </div>

        <div className="flex flex-col self-stretch bg-white py-6 px-6 gap-6 rounded-lg border border-[#E5E8EC] shadow-sm">
          {/* Breadcrumb */}
          <span className="text-[#525866] text-xs font-normal opacity-75" style={{ fontFamily: 'Satoshi' }}>
            BILLING
          </span>

          {/* Title Section */}
          <div className="flex justify-between items-center self-stretch">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <ChevronLeft className="w-4 h-4 text-[#050F1C]" />
                <CreditCard className="w-4 h-4 text-[#050F1C]" />
                <span className="text-[#050F1C] text-xl font-semibold" style={{ fontFamily: 'Poppins' }}>
                  Billing
                </span>
              </div>
              <span className="text-[#070810] text-sm font-normal opacity-75" style={{ fontFamily: 'Satoshi' }}>
                All billing information and history are here.
              </span>
            </div>
            <button
              onClick={() => setShowBillingHistory(true)}
              className="px-4 py-2 rounded-lg border border-[#F59E0B] text-[#F59E0B] text-base font-semibold hover:opacity-80 transition-opacity"
              style={{ fontFamily: 'Satoshi' }}
            >
              View Billing History
            </button>
          </div>

          {/* Monthly/Yearly Toggle */}
          <div className="w-full sm:w-[386px] px-2 py-1 bg-white rounded-lg border border-[#D4E1EA] flex justify-between items-center">
            <button
              onClick={() => setBillingPeriod('monthly')}
              className={`w-1/2 sm:w-[160px] py-2 rounded ${billingPeriod === 'monthly' ? 'bg-[#022658]' : 'bg-transparent'}`}
              style={{ fontFamily: 'Satoshi' }}
            >
              <span className={`text-base ${billingPeriod === 'monthly' ? 'text-white font-bold' : 'text-[#050F1C] font-normal'}`}>
                Monthly
              </span>
            </button>
            <button
              onClick={() => setBillingPeriod('yearly')}
              className={`w-1/2 sm:w-[160px] py-2 rounded ${billingPeriod === 'yearly' ? 'bg-[#022658]' : 'bg-transparent'}`}
              style={{ fontFamily: 'Satoshi' }}
            >
              <span className={`text-base ${billingPeriod === 'yearly' ? 'text-white font-bold' : 'text-[#050F1C] font-normal'}`}>
                Yearly
              </span>
            </button>
          </div>

          {/* Pricing Plans */}
          <div className="flex items-start self-stretch gap-5 flex-col lg:flex-row">
            {/* Standard Plan */}
            <div className="flex-1 p-6 bg-white rounded-lg border border-[#D4E1EA] flex flex-col gap-6 shadow-sm">
              <div className="flex flex-col gap-2">
                <span className="text-[#050F1C] text-2xl font-semibold" style={{ fontFamily: 'Poppins' }}>
                  Standard Plan
                </span>
                <span className="text-[#525866] text-base font-normal" style={{ fontFamily: 'Satoshi' }}>
                  Perfect for small organisations with advanced needs
                </span>
              </div>

              {/* Features List */}
              <div className="px-4 py-5 bg-white rounded-3xl border border-[#D4E1EA] flex flex-col gap-5">
                {standardPlanFeatures.map((feature, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="w-5 h-5 bg-[#022658] rounded-full flex items-center justify-center flex-shrink-0">
                      <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
                    </div>
                    <span className="text-[#050F1C] text-base font-normal flex-1" style={{ fontFamily: 'Satoshi' }}>
                      {feature}
                    </span>
                  </div>
                ))}
              </div>

              {/* Contact Button */}
              <button
                className="self-stretch h-[58px] px-2.5 py-2.5 rounded-lg text-white text-base font-bold hover:opacity-90 transition-opacity"
                style={{
                  background: 'linear-gradient(180deg, #022658 43%, #1A4983 100%)',
                  boxShadow: '0px 4px 4px rgba(5, 15, 28, 0.10)',
                  outline: '4px solid rgba(15, 40, 71, 0.15)',
                  fontFamily: 'Satoshi'
                }}
              >
                Contact Us For This Plan Billing
              </button>
            </div>

            {/* Pro Plan */}
            <div className="flex-1 p-6 bg-white rounded-lg border border-[#D4E1EA] flex flex-col gap-6 shadow-sm">
              <div className="flex flex-col gap-2">
                <span className="text-[#050F1C] text-2xl font-semibold" style={{ fontFamily: 'Poppins' }}>
                  Pro Plan
                </span>
                <span className="text-[#525866] text-base font-normal" style={{ fontFamily: 'Satoshi' }}>
                  Perfect for larger organizations with advanced needs
                </span>
              </div>

              {/* Features List */}
              <div className="px-4 py-5 bg-white rounded-3xl border border-[#D4E1EA] flex flex-col gap-5">
                {proPlanFeatures.map((feature, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="w-5 h-5 bg-[#022658] rounded-full flex items-center justify-center flex-shrink-0">
                      <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
                    </div>
                    <span className="text-[#050F1C] text-base font-normal flex-1" style={{ fontFamily: 'Satoshi' }}>
                      {feature}
                    </span>
                  </div>
                ))}
              </div>

              {/* Contact Button */}
              <button
                className="self-stretch h-[58px] px-2.5 py-2.5 rounded-lg text-white text-base font-bold hover:opacity-90 transition-opacity"
                style={{
                  background: 'linear-gradient(180deg, #022658 43%, #1A4983 100%)',
                  boxShadow: '0px 4px 4px rgba(5, 15, 28, 0.10)',
                  outline: '4px solid rgba(15, 40, 71, 0.15)',
                  fontFamily: 'Satoshi'
                }}
              >
                Contact Us For This Plan Billing
              </button>
            </div>

            {/* Advanced Plan */}
            <div className="flex-1 p-6 bg-white rounded-lg border border-[#D4E1EA] flex flex-col gap-6 shadow-sm">
              <div className="flex flex-col gap-2">
                <span className="text-[#050F1C] text-2xl font-semibold" style={{ fontFamily: 'Poppins' }}>
                  Advanced Plan
                </span>
                <span className="text-[#525866] text-base font-normal" style={{ fontFamily: 'Satoshi' }}>
                  Ideal for growing startups and mid-sized companies
                </span>
              </div>

              {/* Features List */}
              <div className="px-4 py-5 bg-white rounded-3xl border border-[#D4E1EA] flex flex-col gap-5">
                {advancedPlanFeatures.map((feature, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="w-5 h-5 bg-[#022658] rounded-full flex items-center justify-center flex-shrink-0">
                      <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
                    </div>
                    <span className="text-[#050F1C] text-base font-normal flex-1" style={{ fontFamily: 'Satoshi' }}>
                      {feature}
                    </span>
                  </div>
                ))}
              </div>

              {/* Contact Button */}
              <button
                className="self-stretch h-[58px] px-2.5 py-2.5 rounded-lg text-white text-base font-bold hover:opacity-90 transition-opacity"
                style={{
                  background: 'linear-gradient(180deg, #022658 43%, #1A4983 100%)',
                  boxShadow: '0px 4px 4px rgba(5, 15, 28, 0.10)',
                  outline: '4px solid rgba(15, 40, 71, 0.15)',
                  fontFamily: 'Satoshi'
                }}
              >
                Contact Us For This Plan Billing
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CorporateClientBillingPage;

