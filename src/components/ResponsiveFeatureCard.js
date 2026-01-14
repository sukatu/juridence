import React from 'react';
import Button from './Button';
import { ArrowRight, CheckCircle, Shield, Zap, Database } from 'lucide-react';

/**
 * Responsive Feature Card Component
 * Displays feature information with icon, title, description, and action button
 * 
 * @param {Object} feature - Feature object with icon, title, description, and action
 * @param {string} variant - Card style variant: 'default', 'highlighted', 'outlined'
 */
const ResponsiveFeatureCard = ({
  feature = {
    icon: <Shield className="h-8 w-8" />,
    title: 'Feature Title',
    description: 'Feature description goes here. This component is fully responsive and adapts to different screen sizes.',
    action: {
      label: 'Learn More',
      variant: 'primary',
      onClick: () => console.log('Feature clicked')
    }
  },
  variant = 'default'
}) => {
  // Variant styles
  const variantClasses = {
    default: 'bg-white border-2 border-slate-200 hover:border-brand-500 hover:shadow-lg',
    highlighted: 'bg-gradient-to-br from-brand-50 to-accent-50 border-2 border-brand-200 hover:shadow-xl',
    outlined: 'bg-transparent border-2 border-slate-300 hover:border-brand-500'
  };

  return (
    <div
      className={`
        group rounded-xl p-6 lg:p-8
        transition-all duration-300 transform hover:-translate-y-1
        ${variantClasses[variant] || variantClasses.default}
      `}
    >
      {/* Icon Container */}
      <div className="mb-6 flex justify-center lg:justify-start">
        <div className={`
          flex items-center justify-center w-16 h-16 rounded-xl
          transition-colors duration-200
          ${variant === 'highlighted' 
            ? 'bg-brand-500 text-white group-hover:bg-brand-600' 
            : 'bg-brand-100 text-brand-500 group-hover:bg-brand-200'
          }
        `}>
          {feature.icon}
        </div>
      </div>

      {/* Content */}
      <div className="text-center lg:text-left">
        {/* Title */}
        <h3 className="text-xl lg:text-2xl font-bold text-slate-900 mb-3 group-hover:text-brand-500 transition-colors">
          {feature.title}
        </h3>

        {/* Description */}
        <p className="text-slate-600 mb-6 leading-relaxed">
          {feature.description}
        </p>

        {/* Action Button */}
        {feature.action && (
          <div className="flex justify-center lg:justify-start">
            <Button
              variant={feature.action.variant || 'outline'}
              size="md"
              onClick={feature.action.onClick}
              icon={<ArrowRight className="h-4 w-4" />}
              iconPosition="right"
              className="group-hover:scale-105 transition-transform"
            >
              {feature.action.label}
            </Button>
          </div>
        )}

        {/* Feature List (if provided) */}
        {feature.features && feature.features.length > 0 && (
          <ul className="mt-6 space-y-2">
            {feature.features.map((item, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-slate-600">
                <CheckCircle className="h-5 w-5 text-brand-500 flex-shrink-0 mt-0.5" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

/**
 * Responsive Feature Grid Component
 * Displays multiple feature cards in a responsive grid layout
 */
const ResponsiveFeatureGrid = ({ features = [], variant = 'default' }) => {
  const defaultFeatures = [
    {
      icon: <Shield className="h-8 w-8" />,
      title: 'Secure & Private',
      description: 'Enterprise-grade security with encryption to protect your data and searches.',
      action: {
        label: 'Learn More',
        variant: 'outline',
        onClick: () => console.log('Secure clicked')
      },
      features: ['End-to-end encryption', 'GDPR compliant', 'Regular security audits']
    },
    {
      icon: <Zap className="h-8 w-8" />,
      title: 'Real-time Updates',
      description: 'Database updated daily with the latest information from courts and legal sources.',
      action: {
        label: 'See Updates',
        variant: 'outline',
        onClick: () => console.log('Updates clicked')
      },
      features: ['Daily updates', 'Instant notifications', 'Live case tracking']
    },
    {
      icon: <Database className="h-8 w-8" />,
      title: 'Comprehensive Database',
      description: 'Access to thousands of legal cases, people, companies, and legal entities across Ghana.',
      action: {
        label: 'Explore Database',
        variant: 'outline',
        onClick: () => console.log('Database clicked')
      },
      features: ['11,000+ cases', '6,000+ people', '5,000+ companies']
    }
  ];

  const featuresToDisplay = features.length > 0 ? features : defaultFeatures;

  return (
    <div className="w-full">
      {/* Grid Container */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
        {featuresToDisplay.map((feature, index) => (
          <ResponsiveFeatureCard
            key={index}
            feature={feature}
            variant={variant}
          />
        ))}
      </div>
    </div>
  );
};

export default ResponsiveFeatureCard;
export { ResponsiveFeatureGrid };

