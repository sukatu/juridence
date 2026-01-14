import React from 'react';
import { 
  Search, 
  Database, 
  MapPin, 
  Shield, 
  Users, 
  Building2, 
  FileText, 
  Globe,
  CheckCircle,
  ArrowRight
} from 'lucide-react';

const Services = () => {
  const services = [
    {
      icon: <Search className="h-8 w-8 text-brand-500" />,
      title: "Customer Due Diligence",
      description: "Comprehensive KYC verification and risk assessment for individuals across Ghana's legal system.",
      features: [
        "Identity verification",
        "Legal history analysis",
        "Risk scoring & profiling",
        "Compliance monitoring"
      ]
    },
    {
      icon: <Building2 className="h-8 w-8 text-accent-300" />,
      title: "Corporate KYC Solutions",
      description: "Advanced due diligence and compliance verification for corporate entities and business relationships.",
      features: [
        "Corporate identity verification",
        "Legal standing analysis",
        "Financial risk assessment",
        "Regulatory compliance tracking"
      ]
    },
    {
      icon: <Shield className="h-8 w-8 text-light-500" />,
      title: "Risk Mitigation Analytics",
      description: "Comprehensive risk assessment and mitigation strategies based on legal analytics and compliance data.",
      features: [
        "Risk scoring algorithms",
        "Compliance monitoring",
        "Automated reporting",
        "Predictive analytics"
      ]
    },
    {
      icon: <Database className="h-8 w-8 text-brand-600" />,
      title: "Regulatory Compliance Automation",
      description: "Automated compliance monitoring and reporting solutions for regulatory requirements and KYC obligations.",
      features: [
        "Automated compliance checks",
        "Regulatory reporting",
        "Audit trail management",
        "Policy enforcement"
      ]
    },
    {
      icon: <MapPin className="h-8 w-8 text-red-600" />,
      title: "Court Locator",
      description: "Find and locate courts and legal institutions across Ghana with interactive maps.",
      features: [
        "Interactive court maps",
        "Location-based search",
        "Court type filtering",
        "Contact information"
      ]
    },
    {
      icon: <FileText className="h-8 w-8 text-indigo-600" />,
      title: "Case Management",
      description: "Comprehensive case tracking and management system for legal professionals.",
      features: [
        "Case timeline tracking",
        "Document management",
        "Hearing schedules",
        "Status updates"
      ]
    }
  ];

  const features = [
    {
      icon: <CheckCircle className="h-6 w-6 text-green-500" />,
      title: "Real-time Data",
      description: "Access the most up-to-date legal information with real-time database updates."
    },
    {
      icon: <CheckCircle className="h-6 w-6 text-green-500" />,
      title: "Advanced Search",
      description: "Powerful search capabilities with multiple filters and criteria options."
    },
    {
      icon: <CheckCircle className="h-6 w-6 text-green-500" />,
      title: "Secure Access",
      description: "Enterprise-grade security with role-based access control and data encryption."
    },
    {
      icon: <CheckCircle className="h-6 w-6 text-green-500" />,
      title: "Mobile Responsive",
      description: "Access your data anywhere with our fully responsive mobile interface."
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
            KYC & Due Diligence Solutions
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
            Revolutionary software solutions for comprehensive KYC processes, risk mitigation, and regulatory compliance across Ghana's legal landscape.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {services.map((service, index) => (
            <div
              key={index}
              className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center mb-4">
                {service.icon}
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white ml-3">
                  {service.title}
                </h3>
              </div>
              <p className="text-slate-600 dark:text-slate-300 mb-4">
                {service.description}
              </p>
              <ul className="space-y-2">
                {service.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-center text-sm text-slate-500 dark:text-slate-400">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Features Section */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-8 mb-16">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-8 text-center">
            Why Choose juridence?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div key={index} className="text-center">
                <div className="flex justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-slate-600 dark:text-slate-300 text-sm">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-brand-500 to-accent-300 rounded-lg p-8 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-xl mb-6 opacity-90">
            Join thousands of legal professionals who trust juridence for their research needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-brand-500 px-6 py-3 rounded-lg font-semibold hover:bg-slate-100 transition-colors flex items-center justify-center">
              Start Free Trial
              <ArrowRight className="h-4 w-4 ml-2" />
            </button>
            <button className="border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-brand-500 transition-colors">
              Contact Sales
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Services;
