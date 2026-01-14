import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, Zap, Shield, Users, MessageCircle } from 'lucide-react';

const Contact = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    organization: '',
    message: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission here
    alert('Message sent successfully!');
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      organization: '',
      message: ''
    });
  };

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-slate-900 text-white py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6">
            Ready to Streamline Your Legal Document Process More Effectively?
          </h1>
          <p className="text-xl text-slate-300 max-w-4xl mx-auto mb-8">
            Access Ghana's court system with ease. Our comprehensive document search, verification, and request services helps law firms, litigators, banks, businesses as well as individuals and corporations navigate legal documentation efficiently.
          </p>
          
          {/* Features */}
          <div className="flex flex-col sm:flex-row gap-8 justify-center items-center mt-12">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-sky-600 rounded-full flex items-center justify-center">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <span className="text-lg font-semibold">Fast & Reliable Service</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-sky-600 rounded-full flex items-center justify-center">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <span className="text-lg font-semibold">Secure & Confidential</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-sky-600 rounded-full flex items-center justify-center">
                <Users className="h-6 w-6 text-white" />
              </div>
              <span className="text-lg font-semibold">Professional legal team ready to help</span>
            </div>
          </div>
        </div>
      </section>

      {/* Expert Legal Document Team */}
      <section className="py-16 bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">Expert Legal Document Team</h2>
          <p className="text-lg text-slate-600 max-w-3xl mx-auto mb-8">
            Our dedicated professionals provide reliable court document services across Ghana
          </p>
        </div>
      </section>

      {/* Contact Form Section */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Get in Touch</h2>
            <p className="text-lg text-slate-600">Contact us for court document services, consultations, or inquiries</p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div className="bg-white rounded-xl border border-slate-200 p-8 shadow-sm">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Send us a Message</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">First Name</label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                      placeholder="Enter your first name"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Last Name</label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                      placeholder="Enter your last name"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                    placeholder="john.doe@company.com"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                    placeholder="+233 XXX XXX XXX"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Organization/Company</label>
                  <input
                    type="text"
                    name="organization"
                    value={formData.organization}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                    placeholder="Your Company"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Tell us about your needs</label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    rows="4"
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                    placeholder="Describe the type of court document service you need (search, verification, or request)..."
                    required
                  />
                </div>
                
                <button
                  type="submit"
                  className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-sky-600 px-4 py-2.5 font-semibold text-white hover:bg-sky-700 transition"
                >
                  <Send className="h-5 w-5" />
                  Send Message
                </button>
              </form>
            </div>
            
            {/* Contact Information */}
            <div className="space-y-8">
              <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Get in Touch with juridence</h3>
                <p className="text-slate-600 mb-6">
                  We are strategically positioned to serve clients across the country. Reach out for consultations, urgent requests, or to learn more about our court document services.
                </p>
                
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-sky-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Phone className="h-6 w-6 text-sky-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900 mb-1">Phone & WhatsApp</h4>
                      <p className="text-slate-600 text-sm mb-2">Available 24/7 for urgent requests</p>
                      <p className="text-slate-900 font-medium">+233 596 252 127</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-sky-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Mail className="h-6 w-6 text-sky-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900 mb-1">Email</h4>
                      <p className="text-slate-600 text-sm mb-2">For detailed inquiries and follow-ups</p>
                      <p className="text-slate-900 font-medium">info@juridence.com</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-sky-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <MessageCircle className="h-6 w-6 text-sky-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900 mb-1">Instant Support</h4>
                      <p className="text-slate-600 text-sm mb-2">Instant support during business hours</p>
                      <p className="text-slate-900 font-medium">Available on website</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-sky-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <MapPin className="h-6 w-6 text-sky-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900 mb-1">juridence Headquarters</h4>
                      <p className="text-slate-900 font-medium">No. 15 Netflix Street,<br />Madina Estate, Off-UPSA Road</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Business Hours</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Monday - Friday</span>
                    <span className="font-semibold text-slate-900">9:00 AM - 5:00 PM</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
