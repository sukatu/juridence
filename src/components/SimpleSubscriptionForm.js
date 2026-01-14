import React, { useState } from 'react';
import { User, Mail, Building2, MessageSquare, CheckCircle } from 'lucide-react';

const SimpleSubscriptionForm = ({ onComplete, isLoading = false }) => {
  const [formData, setFormData] = useState({
    // Contact Information
    full_name: '',
    email: '',
    phone: '',
    organization: '',
    position: '',
    message: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.full_name.trim()) {
      newErrors.full_name = 'Full name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    }
    
    if (!formData.organization.trim()) {
      newErrors.organization = 'Organization name is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      // Create a simple subscription request with contact details
      const requestData = {
        full_name: formData.full_name,
        email: formData.email,
        phone: formData.phone,
        organization: formData.organization,
        position: formData.position,
        message: formData.message,
        type: 'contact_request',
        status: 'pending'
      };

      const response = await fetch('/api/subscription/contact-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData)
      });

      if (!response.ok) {
        throw new Error('Failed to submit contact request');
      }

      const result = await response.json();
      setIsSubmitted(true);
      
      // Call the completion handler with the result
      if (onComplete) {
        onComplete(result);
      }
    } catch (error) {
      console.error('Error submitting contact request:', error);
      alert('Failed to submit your request. Please try again.');
    }
  };

  if (isSubmitted) {
    return (
      <div className="max-w-md mx-auto text-center py-12">
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/30 mb-6">
          <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Request Submitted Successfully!
        </h2>
        <p className="text-slate-600 dark:text-slate-300 mb-6">
          Thank you for your interest in our legal search platform. We'll contact you within 24 hours to set up your account and discuss your requirements.
        </p>
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            <strong>What happens next?</strong><br />
            • We'll review your requirements<br />
            • Contact you to discuss setup options<br />
            • Create your customized platform<br />
            • Provide training and support
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/30 mb-4">
          <Building2 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
        </div>
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
          Get Started with Legal Search
        </h2>
        <p className="text-lg text-slate-600 dark:text-slate-300">
          Provide your contact details and we'll set up your personalized legal search platform for you.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center">
            <User className="h-5 w-5 mr-2 text-blue-600" />
            Contact Information
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Full Name *
              </label>
              <input
                type="text"
                value={formData.full_name}
                onChange={(e) => handleInputChange('full_name', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.full_name ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'
                } bg-white dark:bg-slate-700 text-slate-900 dark:text-white`}
                placeholder="Your full name"
              />
              {errors.full_name && <p className="text-red-500 text-sm mt-1">{errors.full_name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Email Address *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.email ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'
                } bg-white dark:bg-slate-700 text-slate-900 dark:text-white`}
                placeholder="your.email@company.com"
              />
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Phone Number *
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.phone ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'
                } bg-white dark:bg-slate-700 text-slate-900 dark:text-white`}
                placeholder="+233 XX XXX XXXX"
              />
              {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Organization *
              </label>
              <input
                type="text"
                value={formData.organization}
                onChange={(e) => handleInputChange('organization', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.organization ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'
                } bg-white dark:bg-slate-700 text-slate-900 dark:text-white`}
                placeholder="Your organization name"
              />
              {errors.organization && <p className="text-red-500 text-sm mt-1">{errors.organization}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Position/Title
              </label>
              <input
                type="text"
                value={formData.position}
                onChange={(e) => handleInputChange('position', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                placeholder="e.g., Legal Counsel, Partner"
              />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center">
            <MessageSquare className="h-5 w-5 mr-2 text-blue-600" />
            Additional Information
          </h3>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Tell us about your requirements
            </label>
            <textarea
              value={formData.message}
              onChange={(e) => handleInputChange('message', e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
              placeholder="Please describe your legal research needs, expected usage, team size, or any specific requirements..."
            />
          </div>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">What happens next?</h4>
          <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
            <li>• We'll contact you within 24 hours</li>
            <li>• Discuss your specific requirements</li>
            <li>• Set up your customized platform</li>
            <li>• Provide training and ongoing support</li>
          </ul>
        </div>

        <div className="flex justify-center">
          <button
            type="submit"
            disabled={isLoading}
            className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Submitting...
              </>
            ) : (
              <>
                <Mail className="h-4 w-4 mr-2" />
                Submit Contact Request
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SimpleSubscriptionForm;
