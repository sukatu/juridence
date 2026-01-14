import React, { useState } from 'react';
import { Bell, ChevronRight, ChevronLeft, Phone, Mail, ChevronDown, ChevronUp } from 'lucide-react';
import CorporateClientHeader from './CorporateClientHeader';

const CorporateClientHelpSupportPage = ({ userInfo, onNavigate, onLogout }) => {
  const [expandedFaqs, setExpandedFaqs] = useState({
    1: false,
    2: true,
    3: true
  });

  // Use userInfo from props or localStorage
  const displayUserInfo = userInfo || JSON.parse(localStorage.getItem('userData') || '{}');
  const organizationName = displayUserInfo?.organization || 'Access Bank';

  const faqs = [
    {
      id: 1,
      question: 'Do I have to pay before I can request additional search?',
      answer: ''
    },
    {
      id: 2,
      question: 'Why can\'t I search cases directly on the platform?',
      answer: 'The system is designed to keep the experience focused on people and companies.\nYou search the entity, and the platform pulls every linked case, gazette notice, and relationship behind the scenes.\nIt keeps things structured and avoids exposing raw court data without context.'
    },
    {
      id: 3,
      question: 'How do I search for a company or individual on Juridence?',
      answer: 'Type the name into the search bar on your dashboard.\nYou\'ll get a clean profile showing related cases, risk insights, and any connected companies or individuals.\nIf you want a deeper search, you can request an additional search right from the page.'
    }
  ];

  const toggleFaq = (id) => {
    setExpandedFaqs(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  return (
    <div className="flex-1 bg-[#F7F8FA] pr-6 rounded-lg">
      <div className="flex items-start gap-6">
        {/* Main Content */}
        <div className="flex-1 flex flex-col bg-[#F7F8FA] pt-2 pb-[52px] gap-4">
          {/* Header */}
          <CorporateClientHeader userInfo={displayUserInfo} onNavigate={onNavigate} onLogout={onLogout} />
          
          {/* Page Title Section */}
          <div className="px-1.5 pb-2 border-b border-[#D4E1EA]">
            <div className="flex flex-col items-start w-[263px] gap-1">
              <span className="text-[#050F1C] text-xl font-medium">
                {organizationName},
              </span>
              <span className="text-[#050F1C] text-base font-normal opacity-75">
                Track all your activities here.
              </span>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 p-4 bg-white rounded-lg flex flex-col gap-10">
            {/* Breadcrumb and Back Button */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-1">
                <span className="text-[#525866] text-xs opacity-75 font-normal">HELP & SUPPORT</span>
              </div>
              <button className="p-2 bg-[#F7F8FA] rounded-lg w-fit">
                <ChevronLeft className="w-6 h-6 text-[#050F1C]" />
              </button>
            </div>

            {/* FAQs Section */}
            <div className="flex flex-col gap-6">
              <span className="text-[#050F1C] text-xs font-normal" style={{ fontFamily: 'Satoshi' }}>FAQs</span>
              <div className="flex flex-col gap-2">
                {faqs.map((faq) => (
                  <div
                    key={faq.id}
                    className={`p-5 rounded-lg flex items-start gap-5 ${
                      expandedFaqs[faq.id] ? 'bg-[#F7F8FA]' : 'border border-[#F7F8FA]'
                    }`}
                  >
                    {/* FAQ Number */}
                    <div className="pt-2 pb-2 flex-shrink-0">
                      <span
                        className={`text-lg font-medium`}
                        style={{
                          fontFamily: 'Poppins',
                          color: expandedFaqs[faq.id] ? '#022658' : '#050F1C'
                        }}
                      >
                        {String(faq.id).padStart(2, '0')}
                      </span>
                    </div>

                    {/* FAQ Content */}
                    <div className="flex-1 flex flex-col gap-4">
                      <div className="flex items-center justify-between">
                        <span
                          className="text-lg font-medium flex-1"
                          style={{
                            fontFamily: 'Poppins',
                            color: expandedFaqs[faq.id] ? '#022658' : '#050F1C'
                          }}
                        >
                          {faq.question}
                        </span>
                        <button
                          onClick={() => toggleFaq(faq.id)}
                          className="p-1 hover:bg-gray-100 rounded"
                        >
                          {expandedFaqs[faq.id] ? (
                            <ChevronUp className="w-3.5 h-3.5 text-[#525866]" />
                          ) : (
                            <ChevronDown className="w-3.5 h-3.5 text-[#525866]" />
                          )}
                        </button>
                      </div>

                      {/* FAQ Answer */}
                      {expandedFaqs[faq.id] && faq.answer && (
                        <div className="pt-1">
                          <p
                            className="text-base text-[#525866] font-normal whitespace-pre-line"
                            style={{ fontFamily: 'Satoshi' }}
                          >
                            {faq.answer}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Contact Section */}
            <div className="w-[662px] flex flex-col gap-3">
              <span className="text-[#050F1C] text-xs font-normal" style={{ fontFamily: 'Satoshi' }}>
                NEED EXTRA SUPPORT, CONTACT US ON
              </span>
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-3">
                  <Phone className="w-6 h-6 text-[#141B34]" />
                  <span className="text-[#050F1C] text-lg font-medium" style={{ fontFamily: 'Poppins' }}>
                    +233-444-5555-6666
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="w-6 h-6 text-[#141B34]" />
                  <span className="text-[#050F1C] text-lg font-medium" style={{ fontFamily: 'Poppins' }}>
                    juridence@legal.com
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CorporateClientHelpSupportPage;

