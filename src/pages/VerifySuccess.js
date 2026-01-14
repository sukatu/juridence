import React, { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';

const VerifySuccess = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to home after 3 seconds
    const timer = setTimeout(() => {
      navigate('/');
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-[#f7f8fa] flex items-center justify-center px-4">
      <div className="bg-white rounded-[16px] p-12 max-w-md w-full text-center shadow-lg">
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
        </div>
        
        <h2 className="font-['Poppins',sans-serif] font-bold text-[32px] text-[#050f1c] mb-4">
          Account Verified!
        </h2>
        
        <p className="font-['Satoshi',sans-serif] text-[16px] text-[#525866] mb-8">
          Your account has been successfully verified. You can now access all features.
        </p>

        <Link
          to="/"
          className="inline-block bg-gradient-to-b from-[#022658] from-[42.563%] to-[#1a4983] border-4 border-[rgba(15,40,71,0.15)] border-solid px-8 py-3 rounded-[8px] text-white font-['Satoshi',sans-serif] font-bold text-[16px] hover:opacity-90 transition-opacity"
        >
          Continue to Home
        </Link>
        
        <p className="mt-4 font-['Satoshi',sans-serif] text-[12px] text-[#525866]">
          Redirecting automatically in 3 seconds...
        </p>
      </div>
    </div>
  );
};

export default VerifySuccess;

