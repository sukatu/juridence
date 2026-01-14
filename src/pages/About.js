import React from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink, Search, FileCheck, FileText, Clock, Shield, CreditCard, MessageCircle, Phone, Mail, MapPin } from 'lucide-react';

const About = () => {
  return (
    <div>
      {/* Hero Section */}
      <section className="bg-slate-900 text-white py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-6">
            Revolutionizing KYC Processes with Innovative Legal Analytics
          </h1>
          <p className="text-2xl text-slate-300 max-w-4xl mx-auto mb-8">
            Empowering businesses with advanced legal analytics and KYC solutions for trust, compliance, and informed decision-making.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-6 py-3 text-lg font-medium text-white hover:bg-brand-600 transition-colors">
              Request For Service
            </button>
            <button className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-6 py-3 text-lg font-medium text-white hover:bg-slate-800 transition-colors">
              View Pricing
            </button>
          </div>
        </div>
      </section>

      {/* Our Services */}
      <section className="py-16 bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Our Services</h2>
            <p className="text-lg text-slate-600 max-w-3xl mx-auto">
              We offer a Subscription-Based and On-Demand Due Diligence Search at the Ghanaian courts, Document Verification, and Document Request services to enable corporations and individuals access, verify, and request for documents and cases efficiently in Ghana.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl p-8 shadow-sm border border-slate-200 text-center">
              <div className="w-16 h-16 bg-accent-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="h-8 w-8 text-accent-300" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">Court Search</h3>
              <p className="text-slate-600">Comprehensive search across Ghanaian courts for case information and legal records.</p>
            </div>
            
            <div className="bg-white rounded-xl p-8 shadow-sm border border-slate-200 text-center">
              <div className="w-16 h-16 bg-accent-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileCheck className="h-8 w-8 text-accent-300" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">Verify of Court Documents</h3>
              <p className="text-slate-600">Authenticate and verify the validity of court documents and legal papers.</p>
            </div>
            
            <div className="bg-white rounded-xl p-8 shadow-sm border border-slate-200 text-center">
              <div className="w-16 h-16 bg-accent-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="h-8 w-8 text-accent-300" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">Request for Court Documents</h3>
              <p className="text-slate-600">Request and obtain official court documents and legal records efficiently.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose juridence */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Why Choose juridence</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="h-8 w-8 text-emerald-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">Efficiency</h3>
              <p className="text-slate-600">We simplify the process of searching, verifying, and retrieving court documents, saving you time.</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-emerald-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">Accuracy</h3>
              <p className="text-slate-600">Our direct access to court records ensures reliable and verified information.</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="h-8 w-8 text-emerald-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">Convenience</h3>
              <p className="text-slate-600">Request services via WhatsApp, email, phone call, or SMS.</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-emerald-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">Secure Digital Access</h3>
              <p className="text-slate-600">Easily track and receive documents via our secured online portal.</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CreditCard className="h-8 w-8 text-emerald-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">Flexible Payment Options</h3>
              <p className="text-slate-600">Choose between subscription plans, pay-as-you-go, and expedited processing.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">How It Works</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-sky-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">1</div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">Make a Request</h3>
              <ul className="text-slate-600 text-sm space-y-1">
                <li>• Contact us via WhatsApp, phone call, email, or SMS.</li>
                <li>• Provide details of your search, document request, or verification need.</li>
              </ul>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-sky-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">2</div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">Evaluation & Invoice Generation</h3>
              <p className="text-slate-600 text-sm">Our team will assess your request and provide an invoice for payment.</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-sky-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">3</div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">Payment & Processing</h3>
              <p className="text-slate-600 text-sm">Complete payment and our team processes your request efficiently.</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-sky-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">4</div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">Receive Your Results</h3>
              <p className="text-slate-600 text-sm">Get your verified court documents or search results via email, WhatsApp, or our online platform.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Who Can Benefit */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Who Can Benefit?</h2>
            <p className="text-lg text-slate-600 max-w-3xl mx-auto">
              We offer a Subscription-Based and On-Demand Search, Document, and Verification service to help businesses, individuals, law firms, litigators, banks and corporations to access, verify, and request court-related documents efficiently.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl p-8 shadow-sm border border-slate-200 text-center">
              <h3 className="text-xl font-semibold text-slate-900 mb-3">Banks & Financial Institutions</h3>
              <p className="text-slate-600">Due diligence and background verification for loans and financial services.</p>
            </div>
            
            <div className="bg-white rounded-xl p-8 shadow-sm border border-slate-200 text-center">
              <h3 className="text-xl font-semibold text-slate-900 mb-3">Law Firms & Legal Department</h3>
              <p className="text-slate-600">Access to comprehensive legal research and case information.</p>
            </div>
            
            <div className="bg-white rounded-xl p-8 shadow-sm border border-slate-200 text-center">
              <h3 className="text-xl font-semibold text-slate-900 mb-3">Insurance Companies</h3>
              <p className="text-slate-600">Risk assessment and claims verification through court records.</p>
            </div>
            
            <div className="bg-white rounded-xl p-8 shadow-sm border border-slate-200 text-center">
              <h3 className="text-xl font-semibold text-slate-900 mb-3">Researchers & Academics</h3>
              <p className="text-slate-600">Access to legal data for research and academic purposes.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Commitment to Excellence */}
      <section className="py-16 bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Our Commitment to Excellence</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white rounded-xl p-8 shadow-sm border border-slate-200">
              <h3 className="text-xl font-semibold text-slate-900 mb-4">Direct Court Access & Legal Expertise</h3>
              <p className="text-slate-600">We work closely with the court registrars and the judicial service of Ghana, ensuring legitimate and certified access to court-related information.</p>
            </div>
            
            <div className="bg-white rounded-xl p-8 shadow-sm border border-slate-200">
              <h3 className="text-xl font-semibold text-slate-900 mb-4">Fast Turnaround & Priority Processing</h3>
              <p className="text-slate-600">We understand urgency in legal matters—which is why we prioritize timely delivery and provide same-day service for urgent requests.</p>
            </div>
            
            <div className="bg-white rounded-xl p-8 shadow-sm border border-slate-200">
              <h3 className="text-xl font-semibold text-slate-900 mb-4">Technology-Driven Efficiency</h3>
              <p className="text-slate-600">Our digital-first approach ensures seamless, lightning-fast processes, allowing companies to request, access, and manage court documents efficiently.</p>
            </div>
            
            <div className="bg-white rounded-xl p-8 shadow-sm border border-slate-200">
              <h3 className="text-xl font-semibold text-slate-900 mb-4">Data Security & Confidentiality</h3>
              <p className="text-slate-600">All requests and documents are securely processed to guarantee confidentiality and data protection laws.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Information */}
      <section className="py-16 bg-slate-900 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Contact Us</h2>
            <p className="text-slate-300 max-w-2xl mx-auto">
              juridence - Your trusted partner for comprehensive legal intelligence, court search, document verification, and document request across Ghana.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-sky-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Address</h3>
              <p className="text-slate-300">No. 15 Netflix Street,<br />Madina Estate, Off-UPSA Road</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-sky-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Phone className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Phone</h3>
              <p className="text-slate-300">+233 596 252 127</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-sky-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Email</h3>
              <p className="text-slate-300">info@juridence.com</p>
            </div>
          </div>
          
          <div className="text-center mt-8">
            <p className="text-slate-300">Mon - Fri: 9:00 AM - 5:00 PM</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
