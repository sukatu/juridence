import React, { useState } from 'react';
import Button from './Button';
import { ResponsiveFeatureGrid } from './ResponsiveFeatureCard';
import {
  Search,
  ArrowRight,
  Download,
  CheckCircle,
  X,
  Heart,
  Share2,
  Settings
} from 'lucide-react';

/**
 * Button Examples Component
 * Demonstrates all Button component variants and the ResponsiveFeatureCard component
 */
const ButtonExamples = () => {
  const [loading, setLoading] = useState(false);

  const handleLoading = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-4">
            Button Component Examples
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Responsive React components built with Tailwind CSS and our custom Button component
          </p>
        </div>

        {/* Button Variants Section */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Button Variants</h2>
          <div className="bg-white rounded-xl border-2 border-slate-200 p-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-3">
                <p className="text-sm font-semibold text-slate-600 uppercase">Primary</p>
                <Button variant="primary" icon={<Search className="h-4 w-4" />}>
                  Primary Button
                </Button>
              </div>

              <div className="space-y-3">
                <p className="text-sm font-semibold text-slate-600 uppercase">Secondary</p>
                <Button variant="secondary" icon={<CheckCircle className="h-4 w-4" />}>
                  Secondary Button
                </Button>
              </div>

              <div className="space-y-3">
                <p className="text-sm font-semibold text-slate-600 uppercase">Outline</p>
                <Button variant="outline" icon={<Download className="h-4 w-4" />}>
                  Outline Button
                </Button>
              </div>

              <div className="space-y-3">
                <p className="text-sm font-semibold text-slate-600 uppercase">Ghost</p>
                <Button variant="ghost" icon={<Heart className="h-4 w-4" />}>
                  Ghost Button
                </Button>
              </div>

              <div className="space-y-3">
                <p className="text-sm font-semibold text-slate-600 uppercase">Danger</p>
                <Button variant="danger" icon={<X className="h-4 w-4" />}>
                  Danger Button
                </Button>
              </div>

              <div className="space-y-3">
                <p className="text-sm font-semibold text-slate-600 uppercase">White</p>
                <Button variant="white" icon={<Share2 className="h-4 w-4" />}>
                  White Button
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Button Sizes Section */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Button Sizes</h2>
          <div className="bg-white rounded-xl border-2 border-slate-200 p-8">
            <div className="flex flex-wrap items-center gap-4">
              <Button size="sm" variant="primary">Small</Button>
              <Button size="md" variant="primary">Medium</Button>
              <Button size="lg" variant="primary">Large</Button>
              <Button size="xl" variant="primary">Extra Large</Button>
            </div>
          </div>
        </section>

        {/* Button States Section */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Button States</h2>
          <div className="bg-white rounded-xl border-2 border-slate-200 p-8">
            <div className="flex flex-wrap items-center gap-4">
              <Button variant="primary" icon={<ArrowRight className="h-4 w-4" />} iconPosition="right">
                With Icon Right
              </Button>
              <Button variant="primary" icon={<Settings className="h-4 w-4" />}>
                With Icon Left
              </Button>
              <Button variant="primary" loading={loading} onClick={handleLoading}>
                {loading ? 'Loading...' : 'Click to Load'}
              </Button>
              <Button variant="primary" disabled>
                Disabled Button
              </Button>
              <Button variant="primary" fullWidth className="max-w-xs">
                Full Width
              </Button>
            </div>
          </div>
        </section>

        {/* Responsive Feature Grid Section */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Responsive Feature Cards</h2>
          <ResponsiveFeatureGrid variant="default" />
        </section>

        {/* Usage Example */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Usage Example</h2>
          <div className="bg-white rounded-xl border-2 border-slate-200 p-8">
            <pre className="bg-slate-900 text-slate-100 p-6 rounded-lg overflow-x-auto text-sm">
              <code>{`import Button from './components/Button';
import { ArrowRight } from 'lucide-react';

<Button
  variant="primary"
  size="lg"
  icon={<ArrowRight className="h-4 w-4" />}
  iconPosition="right"
  onClick={() => console.log('Clicked!')}
>
  Get Started
</Button>`}</code>
            </pre>
          </div>
        </section>
      </div>
    </div>
  );
};

export default ButtonExamples;

