import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ArrowLeft, Check } from 'lucide-react';

const Onboarding = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    preferences: [],
    organization: '',
    jobTitle: '',
    notifications: true
  });

  const totalSteps = 3;

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    // Mark onboarding as complete
    localStorage.setItem('onboardingCompleted', 'true');
    // Navigate to home or dashboard
    navigate('/');
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-900">Welcome to Juridence</h2>
            <p className="text-slate-600">Let's get you set up with a few quick steps.</p>
            {/* Step 1 content will be updated based on Figma design */}
          </div>
        );
      case 2:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-900">Tell us about yourself</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Organization</label>
                <input
                  type="text"
                  name="organization"
                  value={formData.organization}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                  placeholder="Enter your organization"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Job Title</label>
                <input
                  type="text"
                  name="jobTitle"
                  value={formData.jobTitle}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                  placeholder="Enter your job title"
                />
              </div>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-900">Almost done!</h2>
            <p className="text-slate-600">Review your preferences and complete setup.</p>
            {/* Step 3 content will be updated based on Figma design */}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Progress Bar */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-600">Step {currentStep} of {totalSteps}</span>
            <span className="text-sm text-slate-600">{Math.round((currentStep / totalSteps) * 100)}%</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2">
            <div
              className="bg-sky-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="max-w-2xl w-full bg-white rounded-xl shadow-lg p-8">
          {renderStep()}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-200">
            <button
              onClick={handlePrevious}
              disabled={currentStep === 1}
              className="flex items-center px-4 py-2 text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Previous
            </button>

            <button
              onClick={handleNext}
              className="flex items-center px-6 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors"
            >
              {currentStep === totalSteps ? 'Complete' : 'Next'}
              {currentStep < totalSteps && <ArrowRight className="h-4 w-4 ml-2" />}
              {currentStep === totalSteps && <Check className="h-4 w-4 ml-2" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;

