import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-slate-900 dark:bg-slate-800 text-white transition-colors duration-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <img 
                src="/logos/main-logo.png" 
                alt="juridence logo" 
                className="h-8 w-auto object-contain"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "/logo.png";
                }}
              />
              <span className="font-semibold">juridence</span>
            </div>
            <p className="text-slate-300 text-sm">
              Your trusted partner for comprehensive legal intelligence and case history discovery.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm text-slate-300">
              <li><Link to="/" className="hover:text-white">Home</Link></li>
              <li><Link to="/people" className="hover:text-white">People</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-sm text-slate-300">
              <li><button className="hover:text-white text-left">Help Center</button></li>
              <li><Link to="/contact" className="hover:text-white">Contact Support</Link></li>
              <li><button className="hover:text-white text-left">Training Resources</button></li>
              <li><button className="hover:text-white text-left">FAQ</button></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Connect</h4>
            <ul className="space-y-2 text-sm text-slate-300">
              <li><button className="hover:text-white text-left">Twitter</button></li>
              <li><button className="hover:text-white text-left">LinkedIn</button></li>
              <li><button className="hover:text-white text-left">Facebook</button></li>
              <li><Link to="/contact" className="hover:text-white">Email</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t border-slate-700 text-center text-sm text-slate-400">
          <p>&copy; 2025 juridence. All rights reserved. | Privacy Policy | Terms of Service</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
