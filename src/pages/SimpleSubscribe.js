import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, CheckCircle, ArrowLeft } from 'lucide-react';
import SimpleSubscriptionForm from '../components/SimpleSubscriptionForm';

const SimpleSubscribe = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const navigate = useNavigate();

  const handleFormComplete = (result) => {
    console.log('Contact request submitted:', result);
    setIsSubmitted(true);
  };

  const handleBackToHome = () => {
    navigate('/');
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl w-full">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/30 mb-6">
              <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
              Request Submitted Successfully!
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-300 mb-8">
              Thank you for your interest in our legal search platform. We'll contact you within 24 hours to set up your account and discuss your requirements.
            </p>
            
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6 mb-8">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">What happens next?</h3>
              <div className="space-y-3 text-left">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                      <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">1</span>
                    </div>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-slate-700 dark:text-slate-300">
                      <strong>Review & Contact</strong> - We'll review your requirements and contact you within 24 hours
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                      <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">2</span>
                    </div>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-slate-700 dark:text-slate-300">
                      <strong>Requirements Discussion</strong> - We'll discuss your specific needs and customize the platform
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                      <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">3</span>
                    </div>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-slate-700 dark:text-slate-300">
                      <strong>Platform Setup</strong> - We'll create your customized legal search platform
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                      <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">4</span>
                    </div>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-slate-700 dark:text-slate-300">
                      <strong>Training & Support</strong> - We'll provide training and ongoing support
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleBackToHome}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
              >
                Return to Home
              </button>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-3 bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 transition-colors"
              >
                Submit Another Request
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 shadow-sm border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <button
                onClick={handleBackToHome}
                className="flex items-center text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Back to Home
              </button>
            </div>
            <div className="flex items-center">
              <Building2 className="h-8 w-8 text-blue-600 dark:text-blue-400 mr-3" />
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                Legal Search Platform
              </h1>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="py-12 px-4 sm:px-6 lg:px-8">
        <SimpleSubscriptionForm 
          onComplete={handleFormComplete}
          isLoading={isLoading}
        />
      </div>

      {/* Features Section */}
      <div className="bg-white dark:bg-slate-800 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
              Why Choose Our Legal Search Platform?
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-300">
              Comprehensive legal research tools designed for modern law practices
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-lg bg-blue-100 dark:bg-blue-900/30 mb-4">
                <Building2 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                Comprehensive Database
              </h3>
              <p className="text-slate-600 dark:text-slate-300">
                Access to extensive legal cases, judgments, and legal precedents from Ghana's courts
              </p>
            </div>
            
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-lg bg-green-100 dark:bg-green-900/30 mb-4">
                <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                AI-Powered Search
              </h3>
              <p className="text-slate-600 dark:text-slate-300">
                Advanced search capabilities with AI assistance for faster and more accurate results
              </p>
            </div>
            
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-lg bg-purple-100 dark:bg-purple-900/30 mb-4">
                <Building2 className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                Customized Setup
              </h3>
              <p className="text-slate-600 dark:text-slate-300">
                Personalized platform configuration tailored to your organization's specific needs
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimpleSubscribe;
