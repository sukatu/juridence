import React, { useState, useEffect } from 'react';
import { Check, Star, Zap, Crown, Clock, ArrowRight } from 'lucide-react';

const SubscriptionPlans = ({ onSelectPlan, currentPlan, isLoading = false }) => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBilling, setSelectedBilling] = useState('monthly');

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const response = await fetch('/api/tenant/plans?is_active=true');
      const data = await response.json();
      setPlans(data.plans || []);
    } catch (error) {
      console.error('Error fetching plans:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPlanIcon = (slug) => {
    switch (slug) {
      case 'trial':
        return <Clock className="h-8 w-8" />;
      case 'starter':
        return <Zap className="h-8 w-8" />;
      case 'professional':
        return <Star className="h-8 w-8" />;
      case 'enterprise':
        return <Crown className="h-8 w-8" />;
      default:
        return <Check className="h-8 w-8" />;
    }
  };

  const getPlanGradient = (slug) => {
    switch (slug) {
      case 'trial':
        return 'from-slate-500 to-slate-600';
      case 'starter':
        return 'from-blue-500 to-blue-600';
      case 'professional':
        return 'from-purple-500 to-purple-600';
      case 'enterprise':
        return 'from-emerald-500 to-emerald-600';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  const getPlanBadge = (slug) => {
    switch (slug) {
      case 'trial':
        return { text: 'Free Trial', color: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200' };
      case 'professional':
        return { text: 'Most Popular', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' };
      case 'enterprise':
        return { text: 'Enterprise', color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200' };
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
          Choose Your Perfect Plan
        </h2>
        <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
          Select the ideal subscription plan for your organization's legal research needs
        </p>
      </div>

      {/* Billing Toggle */}
      <div className="flex justify-center mb-12">
        <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-1 flex">
          <button
            onClick={() => setSelectedBilling('monthly')}
            className={`px-6 py-3 rounded-md font-medium transition-all duration-200 ${
              selectedBilling === 'monthly'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setSelectedBilling('yearly')}
            className={`px-6 py-3 rounded-md font-medium transition-all duration-200 relative ${
              selectedBilling === 'yearly'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Yearly
            <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
              Save 20%
            </span>
          </button>
        </div>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
        {plans.map((plan) => {
          const price = selectedBilling === 'monthly' ? plan.price_monthly : plan.price_yearly;
          const isCurrentPlan = currentPlan && currentPlan.id === plan.id;
          const isPopular = plan.is_popular;
          const badge = getPlanBadge(plan.slug);
          const savings = selectedBilling === 'yearly' && plan.price_monthly > 0 
            ? Math.round(((plan.price_monthly * 12 - plan.price_yearly) / (plan.price_monthly * 12)) * 100)
            : 0;

          return (
            <div
              key={plan.id}
              className={`relative bg-white dark:bg-slate-800 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 ${
                isPopular 
                  ? 'ring-2 ring-purple-500 dark:ring-purple-400 scale-105' 
                  : 'ring-1 ring-slate-200 dark:ring-slate-700'
              } ${isCurrentPlan ? 'opacity-75' : ''}`}
            >
              {/* Badge */}
              {badge && (
                <div className={`absolute -top-3 left-1/2 transform -translate-x-1/2 px-4 py-1 rounded-full text-sm font-medium ${badge.color}`}>
                  {badge.text}
                </div>
              )}

              {/* Header */}
              <div className={`p-8 rounded-t-2xl bg-gradient-to-r ${getPlanGradient(plan.slug)} text-white`}>
                <div className="flex items-center justify-center mb-4">
                  {getPlanIcon(plan.slug)}
                </div>
                <h3 className="text-2xl font-bold text-center mb-2">{plan.name}</h3>
                <p className="text-center text-white/80 text-sm">{plan.description}</p>
              </div>

              {/* Pricing */}
              <div className="p-8">
                <div className="text-center mb-6">
                  <div className="flex items-baseline justify-center">
                    <span className="text-5xl font-bold text-slate-900 dark:text-white">
                      {plan.currency === 'GHS' ? '₵' : '$'}{price}
                    </span>
                    <span className="text-lg text-slate-600 dark:text-slate-400 ml-2">
                      /{selectedBilling === 'monthly' ? 'month' : 'year'}
                    </span>
                  </div>
                  {savings > 0 && (
                    <p className="text-sm text-green-600 dark:text-green-400 mt-2 font-medium">
                      Save {savings}% with yearly billing
                    </p>
                  )}
                </div>

                {/* Features */}
                <div className="space-y-4 mb-8">
                  {plan.features && plan.features.map((feature, index) => (
                    <div key={index} className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-slate-700 dark:text-slate-300 text-sm">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* Plan Limits */}
                <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4 mb-6">
                  <h4 className="font-semibold text-slate-900 dark:text-white mb-3 text-sm">Plan Limits</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-600 dark:text-slate-400">Users:</span>
                      <span className="font-medium text-slate-900 dark:text-white">{plan.max_users}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600 dark:text-slate-400">Cases/month:</span>
                      <span className="font-medium text-slate-900 dark:text-white">{plan.max_cases_per_month.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600 dark:text-slate-400">Storage:</span>
                      <span className="font-medium text-slate-900 dark:text-white">{plan.max_storage_gb} GB</span>
                    </div>
                  </div>
                </div>

                {/* Action Button */}
                <button
                  onClick={() => {
                    onSelectPlan(plan);
                  }}
                  disabled={isCurrentPlan || isLoading}
                  className={`w-full py-4 px-6 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center ${
                    isCurrentPlan
                      ? 'bg-slate-100 dark:bg-slate-600 text-slate-500 dark:text-slate-400 cursor-not-allowed'
                      : isPopular
                      ? 'bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white shadow-lg hover:shadow-xl'
                      : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl'
                  }`}
                >
                  {isCurrentPlan ? (
                    'Current Plan'
                  ) : isLoading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  ) : (
                    <>
                      Select Plan
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Additional Info */}
      <div className="text-center space-y-4">
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 max-w-2xl mx-auto">
          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
            🎉 14-Day Free Trial
          </h3>
          <p className="text-blue-700 dark:text-blue-300">
            Start with any plan risk-free. Cancel anytime during your trial period.
          </p>
        </div>
        
        <div className="text-sm text-slate-600 dark:text-slate-400">
          <p>Need a custom plan for your organization?</p>
          <a 
            href="/contact" 
            className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium hover:underline ml-1"
          >
            Contact our sales team
          </a>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPlans;