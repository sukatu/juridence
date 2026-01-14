import React, { useState } from 'react';
import CompanyCaseDiary from './CompanyCaseDiary';

const CompanyCaseDetails = ({ caseData, onBack, userInfo, company }) => {
  const [documentsTab, setDocumentsTab] = useState('parties');
  const [showCaseDiary, setShowCaseDiary] = useState(false);

  const partiesData = [
    { name: 'EcoWind Corp.', role: 'Plaintiff', type: 'Company', contact: 'info@ecowindcorp.com', status: 'Active' },
    { name: 'Meridian Properties', role: 'Defendant', type: 'Company', contact: 'legal@meridianprops.com', status: 'Active' },
    { name: 'K. Owusu', role: "Plaintiff's Counsel", type: 'Individual', contact: 'owusu@lawfirm.com', status: 'Active' },
    { name: 'S. Baffoe', role: "Defendant's Counsel", type: 'Individual', contact: 'sbaffoe@firm.com', status: 'Active' }
  ];

  const partiesDocuments = [
    { date: 'Mar 15, 2023', fileName: 'Lease_Agreement.pdf', type: 'Evidence', submittedBy: "Plaintiff's Counsel" },
    { date: 'Oct 17, 2025', fileName: 'Court_Order_0245.pdf', type: 'Ruling', submittedBy: "Defendant's Counsel" },
    { date: 'Oct 28, 2025', fileName: 'Gazette_1093.pdf', type: 'Gazette notice', submittedBy: "Defendant's Counsel" }
  ];

  // Show case diary if requested
  if (showCaseDiary) {
    return <CompanyCaseDiary caseData={caseData} onBack={() => setShowCaseDiary(false)} userInfo={userInfo} />;
  }

  return (
    <div className="bg-[#F7F8FA] min-h-screen pt-2">
      <div className="flex flex-col self-stretch gap-4">
        {/* Header */}
        <div className="flex justify-between items-start self-stretch py-3.5 px-1.5 rounded">
          <div className="flex justify-between items-center w-[700px] pr-2 rounded-lg border border-solid border-[#D4E1EA]">
            <input
              type="text"
              placeholder="Search persons, companies and cases here"
              className="flex-1 self-stretch text-[#525866] bg-transparent text-xs py-3.5 pl-2 mr-1 border-0 outline-none"
            />
            <div className="flex items-center w-[73px] gap-1.5">
              <img
                src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Iq8V0MifpP/tsoduk9y_expires_30_days.png"
                className="w-[19px] h-[19px] object-fill"
              />
              <div className="flex items-center bg-white w-12 py-1 px-[9px] gap-1 rounded">
                <span className="text-[#525866] text-xs font-bold">All</span>
                <img
                  src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Iq8V0MifpP/iqrajjwb_expires_30_days.png"
                  className="w-3 h-3 rounded object-fill"
                />
              </div>
            </div>
          </div>
          <div className="flex items-center w-[173px] py-[1px] gap-3">
            <img
              src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Iq8V0MifpP/lrkh5euz_expires_30_days.png"
              className="w-9 h-9 object-fill"
            />
            <div className="flex items-center w-[125px] gap-1.5">
              <img
                src="/images/image.png"
                className="w-9 h-9 object-fill rounded-full"
                alt="User"
              />
              <div className="flex flex-col items-start w-[83px] gap-1">
                <span className="text-[#040E1B] text-base font-bold">Eric Kwaah</span>
                <div className="flex items-center self-stretch mr-9 gap-1">
                  <img
                    src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Iq8V0MifpP/dgcn6hpi_expires_30_days.png"
                    className="w-2 h-2 object-fill"
                  />
                  <span className="text-[#525866] text-xs">Online</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="self-stretch bg-white px-3.5 rounded-lg">
          <div className="flex flex-col items-start self-stretch mt-4 mb-[60px] gap-6">
            {/* Breadcrumb */}
            <div className="flex items-start flex-wrap">
              <span className="text-[#525866] text-xs mr-1.5 whitespace-nowrap">COMPANIES</span>
              <img
                src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Iq8V0MifpP/7psrhfy7_expires_30_days.png"
                className="w-4 h-4 mr-1 object-fill flex-shrink-0"
              />
              <span className="text-[#525866] text-xs mr-1.5 whitespace-nowrap">ENERGY</span>
              <img
                src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Iq8V0MifpP/yyb8l96l_expires_30_days.png"
                className="w-4 h-4 mr-1 object-fill flex-shrink-0"
              />
              <span className="text-[#070810] text-sm mr-[7px] whitespace-nowrap">EcoWind Corp.</span>
              <img
                src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Iq8V0MifpP/d63vvyoz_expires_30_days.png"
                className="w-4 h-4 mr-1 object-fill flex-shrink-0"
              />
              <span className="text-[#070810] text-sm whitespace-nowrap">EcoWind Corp. vs. Meridian Properties</span>
            </div>

            {/* Case Title */}
            <div className="flex items-start self-stretch">
              <button onClick={onBack} className="cursor-pointer hover:opacity-70">
                <img
                  src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Iq8V0MifpP/y8m2oo86_expires_30_days.png"
                  className="w-10 h-10 mr-3 object-fill"
                />
              </button>
              <span className="text-[#040E1B] text-2xl w-[1005px] mr-[65px]">
                EcoWind Corp. vs. Meridian Properties - Dispute over breach of lease agreement for commercial property
              </span>
            </div>

            {/* Key Information Cards */}
            <div className="flex items-start self-stretch bg-[#F4F6F9] py-4 px-8 rounded-lg">
              <div className="flex flex-col items-start w-[200px] p-2 mr-3.5 gap-2">
                <span className="text-[#868C98] text-xs">Role</span>
                <span className="text-[#022658] text-base">Plaintiff</span>
              </div>
              <div className="flex flex-col items-start w-[200px] py-2 pl-2 mr-[15px] gap-2">
                <span className="text-[#868C98] text-xs mr-[62px]">Date Filed</span>
                <span className="text-[#022658] text-base">March 15, 2023</span>
              </div>
              <div className="flex flex-col items-start w-[200px] py-2 pl-2 mr-3.5 gap-2">
                <span className="text-[#868C98] text-xs mr-[77px]">Suit No.</span>
                <span className="text-[#022658] text-base">CM/0245/2023</span>
              </div>
              <div className="flex flex-col items-start w-[200px] py-2 pl-2 mr-[15px] gap-2">
                <span className="text-[#868C98] text-xs mr-[100px]">Court</span>
                <span className="text-[#022658] text-base">High Court, Accra</span>
              </div>
              <div className="flex flex-col items-start w-[200px] py-2 pl-2 gap-2">
                <span className="text-[#868C98] text-xs mr-[98px]">Judge</span>
                <span className="text-[#022658] text-base">Ben Carson (SAN)</span>
              </div>
            </div>

            {/* Additional Details */}
            <div className="flex items-start self-stretch py-4 px-8 rounded-lg border border-solid border-[#F4F6F9]">
              <div className="flex flex-col items-start w-[200px] py-2 pl-2 mr-3.5 gap-2">
                <span className="text-[#868C98] text-xs mr-4">Town</span>
                <span className="text-[#040E1B] text-base">Accra</span>
              </div>
              <div className="flex flex-col items-start w-[200px] py-2 pl-2 mr-[15px] gap-2">
                <span className="text-[#868C98] text-xs mr-[66px]">Region</span>
                <span className="text-[#040E1B] text-base">Greater Accra</span>
              </div>
              <div className="flex flex-col items-start w-[200px] py-2 pl-2 mr-3.5 gap-2">
                <span className="text-[#868C98] text-xs mr-[26px]">Court type</span>
                <span className="text-[#040E1B] text-base">High Court</span>
              </div>
              <div className="flex flex-col items-start w-[200px] py-2 pl-2 mr-[15px] gap-2">
                <span className="text-[#868C98] text-xs">Court name</span>
                <span className="text-[#040E1B] text-base">Domestic Jurisdiction 1</span>
              </div>
              <div className="flex flex-col items-start w-[200px] py-2 pl-2 gap-2">
                <span className="text-[#868C98] text-xs">Area of Law</span>
                <span className="text-[#040E1B] text-base">Land Law</span>
              </div>
            </div>

            {/* Expected Outcome */}
            <div className="flex flex-col items-start self-stretch pr-[41px] gap-2">
              <span className="text-[#040E1B] text-base">Expected Outcome</span>
              <span className="text-[#040E1B] text-base">
                The expected outcome of this case is a favorable judgment for JKL Ventures Ltd, where the court directs
                Meridian Properties to compensate the plaintiff for breach of the lease agreement and to either restore the
                original lease terms or provide financial restitution for the loss suffered.
              </span>
            </div>

            {/* Case Summary */}
            <div className="flex flex-col items-start self-stretch gap-2">
              <span className="text-[#040E1B] text-base">Case Summary</span>
              <span className="text-[#040E1B] text-base">
                This case revolves around a contractual dispute concerning a lease agreement for a commercial property
                located in Accra. JKL Ventures Ltd, through its director, contends that Meridian Properties breached the
                terms of the agreement by prematurely terminating the lease and failing to fulfill specific maintenance and
                renewal obligations stipulated in the contract. As a result, JKL Ventures claims to have suffered
                operational and financial setbacks due to the sudden loss of the leased premises.
                <br />
                <br />
                The plaintiff is seeking damages amounting to GHS 150,000 and an order compelling the defendant to either
                honor the original lease terms or compensate for the loss incurred. The case, filed on March 15, 2023, is
                currently ongoing before the High Court (Commercial Division) in Accra, where preliminary hearings have
                focused on validating the contract and assessing the extent of the alleged breach.
              </span>
            </div>

            {/* Quick Documents */}
            <div className="flex flex-col items-start self-stretch gap-2">
              <span className="text-[#040E1B] text-base">3 Case Documents & 2 Court documents</span>
              <div className="flex items-start gap-6">
                <button
                  className="flex items-center bg-[#F7F8FA] text-left w-[179px] py-[15px] px-2 gap-1 rounded-lg border border-solid border-[#E4E7EB] hover:bg-gray-100 transition-colors"
                  style={{ boxShadow: '4px 4px 4px #0708101A' }}
                >
                  <img
                    src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Iq8V0MifpP/2j9kgd53_expires_30_days.png"
                    className="w-[25px] h-[30px] rounded-lg object-fill"
                  />
                  <span className="text-[#040E1B] text-sm">Lease_Agreement.pdf</span>
                </button>
                <button
                  className="flex items-center bg-[#F7F8FA] text-left w-[188px] py-[15px] px-2 gap-1 rounded-lg border border-solid border-[#E4E7EB] hover:bg-gray-100 transition-colors"
                  style={{ boxShadow: '4px 4px 4px #0708101A' }}
                >
                  <img
                    src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Iq8V0MifpP/2hj00jjt_expires_30_days.png"
                    className="w-[25px] h-[30px] rounded-lg object-fill"
                  />
                  <span className="text-[#040E1B] text-sm">Court_Order_0245.pdf</span>
                </button>
                <button
                  className="flex items-center bg-[#F7F8FA] text-left w-[154px] py-[15px] px-2 gap-1 rounded-lg border border-solid border-[#E4E7EB] hover:bg-gray-100 transition-colors"
                  style={{ boxShadow: '4px 4px 4px #0708101A' }}
                >
                  <img
                    src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Iq8V0MifpP/2gfdhde5_expires_30_days.png"
                    className="w-[25px] h-[30px] rounded-lg object-fill"
                  />
                  <span className="text-[#040E1B] text-sm">Gazette_1093.pdf</span>
                </button>
              </div>
            </div>

            {/* Parties Involved Table */}
            <div className="flex flex-col items-start self-stretch gap-2">
              <span className="text-[#040E1B] text-base">Parties involved</span>
              <div className="flex flex-col self-stretch gap-1 rounded-[14px] border border-solid border-[#E5E8EC]">
                <div className="flex items-start self-stretch bg-[#F4F6F9] py-4">
                  <div className="flex flex-col items-start w-[200px] py-2 pl-4 mr-3">
                    <span className="text-[#070810] text-sm font-bold">Party name</span>
                  </div>
                  <div className="flex flex-col items-start w-[200px] py-2 pl-4 mr-3">
                    <span className="text-[#070810] text-sm font-bold">Role</span>
                  </div>
                  <div className="flex flex-col items-start w-[200px] py-2 pl-4 mr-3">
                    <span className="text-[#070810] text-sm font-bold">Type</span>
                  </div>
                  <div className="flex flex-col items-start w-[200px] py-2 pl-4 mr-3">
                    <span className="text-[#070810] text-sm font-bold">Contact</span>
                  </div>
                  <div className="flex flex-col items-start w-[200px] py-2 pl-4 mr-3">
                    <span className="text-[#070810] text-sm font-bold">Status</span>
                  </div>
                  <div className="w-10 h-[35px] mr-[22px]"></div>
                </div>
                {partiesData.map((party, idx) => (
                  <div key={idx} className="flex items-center self-stretch py-3">
                    <div className="flex flex-col items-start w-[200px] py-2 pl-4 mr-3">
                      <span className="text-[#070810] text-sm">{party.name}</span>
                    </div>
                    <div className="flex flex-col items-start w-[200px] py-2 pl-4 mr-3">
                      <span className="text-[#070810] text-sm">{party.role}</span>
                    </div>
                    <div className="flex flex-col items-start w-[200px] py-2 pl-4 mr-3">
                      <span className="text-[#070810] text-sm">{party.type}</span>
                    </div>
                    <div className="flex flex-col items-center w-[200px] pt-2 pb-[9px] pl-4 mr-3">
                      <span className="text-blue-500 text-sm">{party.contact}</span>
                    </div>
                    <div className="flex flex-col items-start w-[200px] py-2 pl-4 mr-3">
                      <span className="text-[#070810] text-sm">{party.status}</span>
                    </div>
                    <img
                      src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Iq8V0MifpP/9m88dxwx_expires_30_days.png"
                      className="w-10 h-8 mr-[22px] object-fill cursor-pointer hover:opacity-70"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Case Documents Section */}
            <div className="flex flex-col items-start self-stretch gap-2">
              <span className="text-[#040E1B] text-base">Case Documents</span>
              <div className="flex flex-col items-center self-stretch gap-3">
                {/* Parties/Court Documents Toggle */}
                <div className="flex items-center bg-white py-1 px-2 gap-[50px] rounded-lg border border-solid border-[#D4E1EA]">
                  <button
                    onClick={() => setDocumentsTab('parties')}
                    className={`flex flex-col items-start w-40 py-[7px] px-[11px] rounded ${
                      documentsTab === 'parties' ? 'bg-[#022658]' : 'bg-transparent'
                    }`}
                  >
                    <span
                      className={`text-base ${
                        documentsTab === 'parties' ? 'text-white font-bold' : 'text-[#040E1B]'
                      }`}
                    >
                      Parties Documents
                    </span>
                  </button>
                  <button
                    onClick={() => setDocumentsTab('court')}
                    className={`flex flex-col items-start w-40 py-[9px] px-[17px] rounded ${
                      documentsTab === 'court' ? 'bg-[#022658]' : 'bg-transparent'
                    }`}
                  >
                    <span
                      className={`text-base ${documentsTab === 'court' ? 'text-white font-bold' : 'text-[#040E1B]'}`}
                    >
                      Court Documents
                    </span>
                  </button>
                </div>

                {/* Documents Table */}
                <div className="flex flex-col items-start self-stretch gap-4">
                  <div className="flex flex-col self-stretch gap-1 rounded-[14px] border border-solid border-[#E5E8EC]">
                    <div className="flex items-start self-stretch bg-[#F4F6F9] py-4">
                      <div className="flex flex-col items-start w-[210px] py-2 pl-4 mr-3">
                        <span className="text-[#070810] text-sm font-bold">Date</span>
                      </div>
                      <div className="flex flex-col items-start w-[210px] py-2 pl-4 mr-3">
                        <span className="text-[#070810] text-sm font-bold">File name</span>
                      </div>
                      <div className="flex flex-col items-start w-[210px] py-2 pl-4 mr-3">
                        <span className="text-[#070810] text-sm font-bold">Type</span>
                      </div>
                      <div className="flex flex-col items-start w-[210px] py-2 pl-4 mr-3">
                        <span className="text-[#070810] text-sm font-bold">Submitted by</span>
                      </div>
                      <div className="w-[210px] h-[35px] mr-6"></div>
                    </div>
                    {partiesDocuments.map((doc, idx) => (
                      <div key={idx} className="flex items-start self-stretch py-3">
                        <div className="flex flex-col items-start w-[210px] py-2 pl-4 mr-3">
                          <span className="text-[#070810] text-sm">{doc.date}</span>
                        </div>
                        <div className="flex flex-col items-start w-[210px] py-2 pl-4 mr-3">
                          <span className="text-[#070810] text-sm">{doc.fileName}</span>
                        </div>
                        <div className="flex flex-col items-start w-[210px] py-2 pl-4 mr-3">
                          <span className="text-[#070810] text-sm">{doc.type}</span>
                        </div>
                        <div className="flex flex-col items-start w-[210px] py-2 pl-4 mr-3">
                          <span className="text-[#070810] text-sm">{doc.submittedBy}</span>
                        </div>
                        <div className="flex items-center w-[210px] py-2 pl-[146px] mr-6 gap-[1px] cursor-pointer hover:opacity-70">
                          <span className="text-[#022658] text-sm font-bold">View</span>
                          <img
                            src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Iq8V0MifpP/ucehrjmw_expires_30_days.png"
                            className="w-4 h-4 object-fill"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                  <button className="flex flex-col items-start bg-transparent text-left py-2 px-4 rounded-lg border border-solid border-[#F59E0B] hover:bg-orange-50 transition-colors">
                    <span className="text-[#F59E0B] text-base">Upload New Document</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* View Case Diary */}
          <div className="flex justify-between items-center self-stretch pr-4 mb-[107px] rounded-lg border border-solid border-[#D4E1EA]">
            <input
              type="text"
              placeholder="5 more cases scheduled for this week"
              className="flex-1 self-stretch text-[#040E1B] bg-transparent text-base py-4 pl-4 mr-1 border-0 outline-none"
            />
            <div 
              onClick={() => setShowCaseDiary(true)}
              className="flex items-center w-[133px] gap-[1px] cursor-pointer hover:opacity-70"
            >
              <span className="text-[#022658] text-base font-bold whitespace-nowrap">View case diary</span>
              <img
                src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Iq8V0MifpP/kbom5gz3_expires_30_days.png"
                className="w-4 h-4 object-fill"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyCaseDetails;

