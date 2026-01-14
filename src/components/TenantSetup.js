import React, { useState } from 'react';
import { Building2, Upload, Palette, Settings, Check } from 'lucide-react';
import SubscriptionPlans from './SubscriptionPlans';

const TenantSetup = ({ onComplete, isLoading = false }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Basic Information
    name: '',
    slug: '',
    description: '',
    website: '',
    email: '',
    phone: '',
    
    // Address
    address_line_1: '',
    address_line_2: '',
    city: '',
    state: '',
    country: '',
    postal_code: '',
    
    // Contact Person
    contact_person_name: '',
    contact_person_email: '',
    contact_person_phone: '',
    
    // Branding
    app_name: 'Legal Search Engine',
    app_tagline: 'Advanced Legal Research Platform',
    primary_color: '#3B82F6',
    secondary_color: '#1E40AF',
    accent_color: '#F59E0B',
    font_family: 'Inter',
    
    // Files
    logo_file: null,
    favicon_file: null,
    
    // Subscription
    selected_plan_id: null
  });

  const [errors, setErrors] = useState({});
  const [logoPreview, setLogoPreview] = useState(null);
  const [faviconPreview, setFaviconPreview] = useState(null);

  const steps = [
    { id: 1, title: 'Organization Info', icon: Building2 },
    { id: 2, title: 'Contact Details', icon: Settings },
    { id: 3, title: 'Branding', icon: Palette },
    { id: 4, title: 'Subscription', icon: Check }
  ];

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

  const handleFileUpload = (field, file) => {
    if (file) {
      setFormData(prev => ({
        ...prev,
        [field]: file
      }));
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        if (field === 'logo_file') {
          setLogoPreview(e.target.result);
        } else if (field === 'favicon_file') {
          setFaviconPreview(e.target.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const generateSlug = (name) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-');
  };

  const validateStep = (step) => {
    const newErrors = {};
    
    switch (step) {
      case 1:
        if (!formData.name.trim()) newErrors.name = 'Organization name is required';
        if (!formData.email.trim()) newErrors.email = 'Email is required';
        if (!formData.contact_person_name.trim()) newErrors.contact_person_name = 'Contact person name is required';
        if (!formData.contact_person_email.trim()) newErrors.contact_person_email = 'Contact person email is required';
        break;
      case 2:
        if (!formData.address_line_1.trim()) newErrors.address_line_1 = 'Address is required';
        if (!formData.city.trim()) newErrors.city = 'City is required';
        if (!formData.country.trim()) newErrors.country = 'Country is required';
        break;
      case 3:
        if (!formData.app_name.trim()) newErrors.app_name = 'App name is required';
        break;
      case 4:
        if (!formData.selected_plan_id) {
          newErrors.selected_plan_id = 'Please select a subscription plan';
        }
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < steps.length) {
        setCurrentStep(currentStep + 1);
      } else {
        handleSubmit();
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (validateStep(4)) {
      // Auto-generate slug if not provided
      if (!formData.slug) {
        formData.slug = generateSlug(formData.name);
      }
      
      onComplete(formData);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
          Organization Information
        </h3>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
          Tell us about your organization and how we can contact you.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Organization Name *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => {
              handleInputChange('name', e.target.value);
              if (!formData.slug) {
                handleInputChange('slug', generateSlug(e.target.value));
              }
            }}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.name ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'
            } bg-white dark:bg-slate-800 text-slate-900 dark:text-white`}
            placeholder="Your Organization Name"
          />
          {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Organization Slug
          </label>
          <input
            type="text"
            value={formData.slug}
            onChange={(e) => handleInputChange('slug', e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            placeholder="organization-slug"
          />
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Used in URLs. Only lowercase letters, numbers, and hyphens.
          </p>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            placeholder="Brief description of your organization"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Organization Email *
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.email ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'
            } bg-white dark:bg-slate-800 text-slate-900 dark:text-white`}
            placeholder="admin@organization.com"
          />
          {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Phone Number
          </label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            placeholder="+1-555-0123"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Website
          </label>
          <input
            type="url"
            value={formData.website}
            onChange={(e) => handleInputChange('website', e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            placeholder="https://your-organization.com"
          />
        </div>
      </div>

      <div className="border-t border-slate-200 dark:border-slate-700 pt-6">
        <h4 className="text-md font-semibold text-slate-900 dark:text-white mb-4">
          Primary Contact Person
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Contact Person Name *
            </label>
            <input
              type="text"
              value={formData.contact_person_name}
              onChange={(e) => handleInputChange('contact_person_name', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.contact_person_name ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'
              } bg-white dark:bg-slate-800 text-slate-900 dark:text-white`}
              placeholder="John Doe"
            />
            {errors.contact_person_name && <p className="text-red-500 text-sm mt-1">{errors.contact_person_name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Contact Person Email *
            </label>
            <input
              type="email"
              value={formData.contact_person_email}
              onChange={(e) => handleInputChange('contact_person_email', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.contact_person_email ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'
              } bg-white dark:bg-slate-800 text-slate-900 dark:text-white`}
              placeholder="john@organization.com"
            />
            {errors.contact_person_email && <p className="text-red-500 text-sm mt-1">{errors.contact_person_email}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Contact Person Phone
            </label>
            <input
              type="tel"
              value={formData.contact_person_phone}
              onChange={(e) => handleInputChange('contact_person_phone', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              placeholder="+1-555-0123"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
          Organization Address
        </h3>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
          Provide your organization's physical address.
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Address Line 1 *
          </label>
          <input
            type="text"
            value={formData.address_line_1}
            onChange={(e) => handleInputChange('address_line_1', e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.address_line_1 ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'
            } bg-white dark:bg-slate-800 text-slate-900 dark:text-white`}
            placeholder="123 Main Street"
          />
          {errors.address_line_1 && <p className="text-red-500 text-sm mt-1">{errors.address_line_1}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Address Line 2
          </label>
          <input
            type="text"
            value={formData.address_line_2}
            onChange={(e) => handleInputChange('address_line_2', e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            placeholder="Suite 100"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              City *
            </label>
            <input
              type="text"
              value={formData.city}
              onChange={(e) => handleInputChange('city', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.city ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'
              } bg-white dark:bg-slate-800 text-slate-900 dark:text-white`}
              placeholder="New York"
            />
            {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              State/Province
            </label>
            <input
              type="text"
              value={formData.state}
              onChange={(e) => handleInputChange('state', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              placeholder="NY"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Country *
            </label>
            <input
              type="text"
              value={formData.country}
              onChange={(e) => handleInputChange('country', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.country ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'
              } bg-white dark:bg-slate-800 text-slate-900 dark:text-white`}
              placeholder="United States"
            />
            {errors.country && <p className="text-red-500 text-sm mt-1">{errors.country}</p>}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Postal Code
          </label>
          <input
            type="text"
            value={formData.postal_code}
            onChange={(e) => handleInputChange('postal_code', e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            placeholder="10001"
          />
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
          Customize Your App
        </h3>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
          Personalize the appearance and branding of your legal search platform.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            App Name *
          </label>
          <input
            type="text"
            value={formData.app_name}
            onChange={(e) => handleInputChange('app_name', e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.app_name ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'
            } bg-white dark:bg-slate-800 text-slate-900 dark:text-white`}
            placeholder="Your Legal Search Engine"
          />
          {errors.app_name && <p className="text-red-500 text-sm mt-1">{errors.app_name}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            App Tagline
          </label>
          <input
            type="text"
            value={formData.app_tagline}
            onChange={(e) => handleInputChange('app_tagline', e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            placeholder="Advanced Legal Research Platform"
          />
        </div>
      </div>

      {/* Color Scheme */}
      <div>
        <h4 className="text-md font-semibold text-slate-900 dark:text-white mb-4">
          Color Scheme
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Primary Color
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="color"
                value={formData.primary_color}
                onChange={(e) => handleInputChange('primary_color', e.target.value)}
                className="w-12 h-10 border border-slate-300 dark:border-slate-600 rounded-lg cursor-pointer"
              />
              <input
                type="text"
                value={formData.primary_color}
                onChange={(e) => handleInputChange('primary_color', e.target.value)}
                className="flex-1 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                placeholder="#3B82F6"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Secondary Color
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="color"
                value={formData.secondary_color}
                onChange={(e) => handleInputChange('secondary_color', e.target.value)}
                className="w-12 h-10 border border-slate-300 dark:border-slate-600 rounded-lg cursor-pointer"
              />
              <input
                type="text"
                value={formData.secondary_color}
                onChange={(e) => handleInputChange('secondary_color', e.target.value)}
                className="flex-1 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                placeholder="#1E40AF"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Accent Color
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="color"
                value={formData.accent_color}
                onChange={(e) => handleInputChange('accent_color', e.target.value)}
                className="w-12 h-10 border border-slate-300 dark:border-slate-600 rounded-lg cursor-pointer"
              />
              <input
                type="text"
                value={formData.accent_color}
                onChange={(e) => handleInputChange('accent_color', e.target.value)}
                className="flex-1 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                placeholder="#F59E0B"
              />
            </div>
          </div>
        </div>
      </div>

      {/* File Uploads */}
      <div>
        <h4 className="text-md font-semibold text-slate-900 dark:text-white mb-4">
          Branding Assets
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Organization Logo
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg hover:border-slate-400 dark:hover:border-slate-500 transition-colors">
              <div className="space-y-1 text-center">
                <Upload className="mx-auto h-12 w-12 text-slate-400" />
                <div className="flex text-sm text-slate-600 dark:text-slate-400">
                  <label className="relative cursor-pointer bg-white dark:bg-slate-800 rounded-md font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                    <span>Upload logo</span>
                    <input
                      type="file"
                      className="sr-only"
                      accept="image/*"
                      onChange={(e) => handleFileUpload('logo_file', e.target.files[0])}
                    />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">PNG, JPG up to 2MB</p>
              </div>
            </div>
            {logoPreview && (
              <div className="mt-2">
                <img src={logoPreview} alt="Logo preview" className="h-16 w-auto mx-auto" />
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Favicon
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg hover:border-slate-400 dark:hover:border-slate-500 transition-colors">
              <div className="space-y-1 text-center">
                <Upload className="mx-auto h-12 w-12 text-slate-400" />
                <div className="flex text-sm text-slate-600 dark:text-slate-400">
                  <label className="relative cursor-pointer bg-white dark:bg-slate-800 rounded-md font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                    <span>Upload favicon</span>
                    <input
                      type="file"
                      className="sr-only"
                      accept="image/*"
                      onChange={(e) => handleFileUpload('favicon_file', e.target.files[0])}
                    />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">ICO, PNG up to 1MB</p>
              </div>
            </div>
            {faviconPreview && (
              <div className="mt-2">
                <img src={faviconPreview} alt="Favicon preview" className="h-8 w-8 mx-auto" />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
          Choose Your Subscription Plan
        </h3>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
          Select the plan that best fits your organization's needs. You can upgrade or downgrade at any time.
        </p>
      </div>

      <SubscriptionPlans
        onSelectPlan={(plan) => {
          handleInputChange('selected_plan_id', plan.id);
        }}
        currentPlan={formData.selected_plan_id ? { id: formData.selected_plan_id } : null}
        isLoading={isLoading}
      />

      {errors.selected_plan_id && (
        <p className="text-red-500 text-sm mt-2">{errors.selected_plan_id}</p>
      )}
      
      {/* Debug info */}
      <div className="mt-4 p-3 bg-slate-100 dark:bg-slate-700 rounded-lg">
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Debug: Selected Plan ID: {formData.selected_plan_id || 'None'}
        </p>
      </div>
    </div>
  );

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return renderStep1();
      case 2:
        return renderStep2();
      case 3:
        return renderStep3();
      case 4:
        return renderStep4();
      default:
        return renderStep1();
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = currentStep === step.id;
            const isCompleted = currentStep > step.id;
            
            return (
              <div key={step.id} className="flex items-center">
                <div className="flex items-center">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                    isCompleted
                      ? 'bg-green-500 border-green-500 text-white'
                      : isActive
                      ? 'bg-blue-500 border-blue-500 text-white'
                      : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-500 dark:text-slate-400'
                  }`}>
                    {isCompleted ? (
                      <Check className="h-5 w-5" />
                    ) : (
                      <Icon className="h-5 w-5" />
                    )}
                  </div>
                  <div className="ml-3 hidden sm:block">
                    <p className={`text-sm font-medium ${
                      isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400'
                    }`}>
                      {step.title}
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

      {/* Step Content */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-8">
        {renderStep()}
      </div>

      {/* Navigation */}
      <div className="flex justify-between mt-8">
        <button
          onClick={handlePrevious}
          disabled={currentStep === 1}
          className="px-6 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Previous
        </button>
        
        <button
          onClick={handleNext}
          disabled={isLoading}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {currentStep === steps.length ? (isLoading ? 'Creating...' : 'Create Organization') : 'Next'}
        </button>
      </div>
    </div>
  );
};

export default TenantSetup;
