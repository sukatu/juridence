import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, CheckCircle, ArrowRight, ArrowLeft } from 'lucide-react';
import TenantSetup from '../components/TenantSetup';
import SubscriptionPlans from '../components/SubscriptionPlans';

const Subscribe = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [tenantData, setTenantData] = useState(null);
  const [subscriptionRequest, setSubscriptionRequest] = useState(null);
  const [selectedBilling, setSelectedBilling] = useState('monthly');
  const navigate = useNavigate();

  const steps = [
    { id: 1, title: 'Organization Setup', description: 'Tell us about your organization' },
    { id: 2, title: 'Choose Plan', description: 'Select your subscription plan' },
    { id: 3, title: 'Request Submitted', description: 'Awaiting admin approval' }
  ];

  const handleTenantSetupComplete = async (data) => {
    try {
      setIsLoading(true);
      
      // Create tenant
      const tenantResponse = await fetch('/api/tenant/tenants', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });

      if (!tenantResponse.ok) {
        throw new Error('Failed to create tenant');
      }

      const tenant = await tenantResponse.json();
      setTenantData(tenant);
      setCurrentStep(2);
    } catch (error) {
      console.error('Error creating tenant:', error);
      alert('Failed to create organization. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlanSelection = async (plan) => {
    if (!tenantData) return;

    try {
      setIsLoading(true);
      
      // Create subscription request
      const requestData = {
        tenant_id: tenantData.id,
        plan_id: plan.id,
        billing_cycle: selectedBilling || 'monthly', // Use selected billing cycle
        notes: `Subscription request for ${tenantData.name}`
      };

      const response = await fetch('/api/tenant/subscription-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData)
      });

      if (!response.ok) {
        throw new Error('Failed to create subscription request');
      }

      const request = await response.json();
      setSubscriptionRequest(request);
      setCurrentStep(3);
    } catch (error) {
      console.error('Error creating subscription request:', error);
      // Show a more user-friendly error message
      const errorMessage = error.message || 'Failed to submit subscription request. Please try again.';
      alert(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-8">
      <div className="text-center">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/30 mb-4">
          <Building2 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
        </div>
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
          Set Up Your Organization
        </h2>
        <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
          Create your organization account and customize your legal search platform. 
          This process takes just a few minutes.
        </p>
      </div>

      <TenantSetup
        onComplete={handleTenantSetupComplete}
        isLoading={isLoading}
      />
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-8">
      <div className="text-center">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/30 mb-4">
          <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
        </div>
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
          Choose Your Plan
        </h2>
        <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
          Select the subscription plan that best fits your organization's needs. 
          You can upgrade or downgrade at any time.
        </p>
      </div>

      <SubscriptionPlans
        onSelectPlan={handlePlanSelection}
        isLoading={isLoading}
      />

      <div className="flex justify-center">
        <button
          onClick={() => setCurrentStep(1)}
          className="flex items-center gap-2 px-6 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Organization Setup
        </button>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="text-center space-y-8">
      <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/30">
        <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
      </div>
      
      <div>
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
          Request Submitted Successfully!
        </h2>
        <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto mb-6">
          Your subscription request has been submitted and is awaiting admin approval. 
          You'll receive an email notification once your request is reviewed.
        </p>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-8 max-w-2xl mx-auto">
        <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
          Request Details
        </h3>
        <div className="space-y-3 text-left">
          <div className="flex justify-between">
            <span className="text-slate-600 dark:text-slate-400">Organization:</span>
            <span className="font-medium text-slate-900 dark:text-white">{tenantData?.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600 dark:text-slate-400">Plan:</span>
            <span className="font-medium text-slate-900 dark:text-white">{subscriptionRequest?.plan_name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600 dark:text-slate-400">Billing:</span>
            <span className="font-medium text-slate-900 dark:text-white capitalize">{subscriptionRequest?.billing_cycle}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600 dark:text-slate-400">Status:</span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300">
              Pending Approval
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <p className="text-slate-600 dark:text-slate-300">
          What happens next?
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 mb-3">
              <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">1</span>
            </div>
            <h4 className="font-medium text-slate-900 dark:text-white mb-2">Review</h4>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Our admin team will review your request within 24 hours
            </p>
          </div>
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 mb-3">
              <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">2</span>
            </div>
            <h4 className="font-medium text-slate-900 dark:text-white mb-2">Approval</h4>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              You'll receive an email notification when approved
            </p>
          </div>
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 mb-3">
              <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">3</span>
            </div>
            <h4 className="font-medium text-slate-900 dark:text-white mb-2">Access</h4>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Start using your customized legal search platform
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <button
          onClick={() => navigate('/')}
          className="px-6 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
        >
          Return to Home
        </button>
        <button
          onClick={() => {
            setCurrentStep(1);
            setTenantData(null);
            setSubscriptionRequest(null);
          }}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          Create Another Organization
        </button>
      </div>
    </div>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return renderStep1();
      case 2:
        return renderStep2();
      case 3:
        return renderStep3();
      default:
        return renderStep1();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-700 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-6">
            <Building2 className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-5xl font-bold text-slate-900 dark:text-white mb-6">
            Subscribe to Legal Search
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto leading-relaxed">
            Get access to our comprehensive legal database and advanced search capabilities. 
            Start your free trial today and experience the power of AI-driven legal research.
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-16">
          <div className="flex items-center justify-center">
            <div className="flex items-center space-x-8">
              {steps.map((step, index) => {
                const isActive = currentStep === step.id;
                const isCompleted = currentStep > step.id;
                
                return (
                  <div key={step.id} className="flex items-center">
                    <div className="flex flex-col items-center">
                      <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                        isCompleted
                          ? 'bg-green-500 border-green-500 text-white'
                          : isActive
                          ? 'bg-blue-500 border-blue-500 text-white'
                          : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-500 dark:text-slate-400'
                      }`}>
                        {isCompleted ? (
                          <CheckCircle className="h-5 w-5" />
                        ) : (
                          <span className="text-sm font-semibold">{step.id}</span>
                        )}
                      </div>
                      <div className="mt-2 text-center">
                        <p className={`text-sm font-medium ${
                          isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400'
                        }`}>
                          {step.title}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          {step.description}
                        </p>
                      </div>
                    </div>
                    {index < steps.length - 1 && (
                      <div className={`hidden sm:block w-16 h-0.5 mx-4 ${
                        isCompleted ? 'bg-green-500' : 'bg-slate-300 dark:bg-slate-600'
                      }`} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Step Content */}
        {renderCurrentStep()}
      </div>
    </div>
  );
};

export default Subscribe;
