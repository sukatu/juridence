import React, { useState } from 'react';
import { ArrowLeft, ChevronRight, ChevronDown, MoreVertical, Bell } from 'lucide-react';
import CorporateClientCaseDiary from './CorporateClientCaseDiary';

const CorporateClientCaseDetails = ({ caseData, person, company, industry, entity, onBack, userInfo }) => {
  const [documentType, setDocumentType] = useState('parties'); // 'parties' or 'court'
  const [showCaseDiary, setShowCaseDiary] = useState(false);

  const userName = userInfo?.first_name && userInfo?.last_name 
    ? `${userInfo.first_name} ${userInfo.last_name}` 
    : 'Eric Kwaah';
  const organizationName = userInfo?.organization || 'Access Bank';

  // Sample case data - in real app, this would come from props or API
  const defaultCaseData = {
    title: 'JKL Ventures Ltd vs. Meridian Properties - Dispute over breach of lease agreement for commercial property',
    suitNo: 'CM/0245/2023',
    role: 'Plaintiff (as Director of JKL Ventures)',
    dateFiled: 'March 15, 2023',
    court: 'High Court, Accra',
    judge: 'Ben Carson (SAN)',
    town: 'Accra',
    region: 'Greater Accra',
    courtType: 'High Court',
    courtName: 'Domestic Jurisdiction 1',
    areaOfLaw: 'Land Law',
    expectedOutcome: 'The expected outcome of this case is a favorable judgment for JKL Ventures Ltd, where the court directs Meridian Properties to compensate the plaintiff for breach of the lease agreement and to either restore the original lease terms or provide financial restitution for the loss suffered.',
    caseSummary: 'This case revolves around a contractual dispute concerning a lease agreement for a commercial property located in Accra. JKL Ventures Ltd, through its director, contends that Meridian Properties breached the terms of the agreement by prematurely terminating the lease and failing to fulfill specific maintenance and renewal obligations stipulated in the contract. As a result, JKL Ventures claims to have suffered operational and financial setbacks due to the sudden loss of the leased premises.\n\nThe plaintiff is seeking damages amounting to GHS 150,000 and an order compelling the defendant to either honor the original lease terms or compensate for the loss incurred. The case, filed on March 15, 2023, is currently ongoing before the High Court (Commercial Division) in Accra, where preliminary hearings have focused on validating the contract and assessing the extent of the alleged breach.',
    quickDocuments: [
      { name: 'Lease_Agreement.pdf', type: 'pdf' },
      { name: 'Court_Order_0245.pdf', type: 'pdf' },
      { name: 'Gazette_1093.pdf', type: 'pdf' }
    ],
    parties: [
      {
        name: 'John Kwame Louis',
        role: 'Plaintiff',
        type: 'Company',
        contact: 'info@ecowindcorp.com',
        status: 'Active'
      },
      {
        name: 'Meridian Properties',
        role: 'Defendant',
        type: 'Company',
        contact: 'legal@meridianprops.com',
        status: 'Active'
      },
      {
        name: 'K. Owusu',
        role: 'Plaintiff\'s Counsel',
        type: 'Individual',
        contact: 'owusu@lawfirm.com',
        status: 'Active'
      },
      {
        name: 'S. Baffoe',
        role: 'Defendant\'s Counsel',
        type: 'Individual',
        contact: 'sbaffoe@firm.com',
        status: 'Active'
      }
    ],
    documents: [
      {
        date: 'Mar 15, 2023',
        fileName: 'Lease_Agreement.pdf',
        type: 'Evidence',
        submittedBy: 'Plaintiff\'s Counsel',
        documentType: 'parties'
      },
      {
        date: 'Oct 17, 2025',
        fileName: 'Court_Order_0245.pdf',
        type: 'Ruling',
        submittedBy: 'Defendant\'s Counsel',
        documentType: 'parties'
      },
      {
        date: 'Oct 28, 2025',
        fileName: 'Gazette_1093.pdf',
        type: 'Gazette notice',
        submittedBy: 'Defendant\'s Counsel',
        documentType: 'parties'
      },
      {
        date: 'Oct 17, 2025',
        fileName: 'Court_Order_0245.pdf',
        judge: 'Justice A. Mensah',
        citation: 'Reported in the System',
        documentType: 'court'
      },
      {
        date: 'Oct 28, 2025',
        fileName: 'Gazette_1093.pdf',
        judge: 'Justice A. Mensah',
        citation: 'Reported in the System',
        documentType: 'court'
      }
    ]
  };

  // Merge caseData with defaults, ensuring all arrays exist
  const data = {
    ...defaultCaseData,
    ...caseData,
    quickDocuments: caseData?.quickDocuments || defaultCaseData.quickDocuments,
    parties: caseData?.parties || defaultCaseData.parties,
    documents: caseData?.documents || defaultCaseData.documents
  };

  const filteredDocuments = (data.documents || []).filter(doc => 
    documentType === 'parties' ? doc.documentType === 'parties' : doc.documentType === 'court'
  );

  const personName = person?.name || 'John Kwame Louis';
  const companyName = company || 'EcoWind Corp.';
  const entityName = entity?.name || 'Access Bank';
  const industryName = industry?.name || (typeof industry === 'string' ? industry : 'BANKING & FINANCE');
  const isCompany = !!company;

  // If case diary is shown
  if (showCaseDiary) {
    return (
      <CorporateClientCaseDiary
        caseData={data}
        person={person}
        company={company}
        industry={industry}
        entity={entity}
        onBack={() => setShowCaseDiary(false)}
        userInfo={userInfo}
      />
    );
  }

  return (
    <div className="flex-1 bg-[#F7F8FA] pr-6 rounded-lg">
      <div className="flex items-start gap-6">
        {/* Main Content */}
        <div className="flex-1 flex flex-col bg-[#F7F8FA] pt-2 pb-[52px] gap-4">
          {/* Header */}
          <div className="flex items-center self-stretch py-2 px-1.5 gap-[50px] rounded border-b border-[#D4E1EA]">
            <div className="flex flex-col items-start w-[700px] gap-1">
              <div className="flex items-center gap-2 w-full">
                <div className="w-[600px] h-11 px-2 py-2.5 rounded-lg border border-[#D4E1EA] flex items-center justify-between">
                  <span className="text-[#525866] text-xs font-normal">Search persons, companies and cases here</span>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 relative">
                      <div className="w-1.75 h-1.75 left-[2.5px] top-[2.5px] absolute border border-[#868C98]"></div>
                    </div>
                    <span className="text-[#868C98] text-sm font-normal">|</span>
                    <div className="w-12 px-1 py-1 bg-white rounded flex items-center justify-end gap-0.5">
                      <span className="text-[#525866] text-xs font-bold">All</span>
                      <div className="w-3 h-3 relative">
                        <div className="w-1.5 h-0.75 left-[3px] top-[4.5px] absolute border border-[#141B34]"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#F7F8FA] rounded-full border border-[#D4E1EA]">
                <Bell className="w-5 h-5 text-[#022658]" />
              </div>
              <div className="flex items-center gap-1.5">
                <img 
                  src="https://placehold.co/36x36" 
                  alt="Avatar" 
                  className="w-9 h-9 rounded-full"
                />
                <div className="flex flex-col items-start gap-1">
                  <span className="text-[#050F1C] text-base font-bold">{userName}</span>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-[#10B981] rounded-full"></div>
                    <span className="text-[#525866] text-xs font-normal">Online</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 p-4 bg-white rounded-lg flex flex-col gap-[60px]">
            {/* Breadcrumb */}
            <div className="flex items-center gap-1">
              <div className="flex items-center gap-1">
                <span className="text-[#525866] text-xs font-normal opacity-75">{isCompany ? 'COMPANIES' : 'PERSONS'}</span>
                <ChevronRight className="w-4 h-4 text-[#7B8794]" />
                <span className="text-[#050F1C] text-xs font-normal">{industryName}</span>
              </div>
              {!isCompany && (
                <>
                  <ChevronRight className="w-4 h-4 text-[#7B8794]" />
                  <span className="text-[#070810] text-sm font-normal">{entityName}</span>
                </>
              )}
              <ChevronRight className="w-4 h-4 text-[#7B8794]" />
              <span className="text-[#070810] text-sm font-normal">{isCompany ? companyName : personName}</span>
              <ChevronRight className="w-4 h-4 text-[#7B8794]" />
              <span className="text-[#070810] text-sm font-normal whitespace-nowrap">{data.title.split(' - ')[0]}</span>
            </div>

            {/* Case Title Section */}
            <div className="flex items-start gap-3">
              <button 
                onClick={onBack}
                className="p-2 bg-[#F7F8FA] rounded-lg flex items-center justify-center"
              >
                <ArrowLeft className="w-6 h-6 text-[#050F1C]" />
              </button>
              <h1 className="flex-1 text-[#050F1C] text-2xl font-medium">{data.title}</h1>
            </div>

            {/* Key Information Cards */}
            <div className="px-8 py-4 bg-[#F4F6F9] rounded-lg flex items-center justify-between">
              <div className="w-[200px] px-2 border-r border-[#D4E1EA]">
                <div className="flex flex-col justify-center items-start gap-2">
                  <span className="text-[#868C98] text-xs font-normal">Role</span>
                  <span className="text-[#022658] text-base font-medium">{data.role}</span>
                </div>
              </div>
              <div className="w-[200px] px-2 border-r border-[#D4E1EA]">
                <div className="flex flex-col justify-center items-start gap-2">
                  <span className="text-[#868C98] text-xs font-normal">Date Filed</span>
                  <span className="text-[#022658] text-base font-medium">{data.dateFiled}</span>
                </div>
              </div>
              <div className="w-[200px] px-2 border-r border-[#D4E1EA]">
                <div className="flex flex-col justify-center items-start gap-2">
                  <span className="text-[#868C98] text-xs font-normal">Suit No.</span>
                  <span className="text-[#022658] text-base font-medium">{data.suitNo}</span>
                </div>
              </div>
              <div className="w-[200px] px-2 border-r border-[#D4E1EA]">
                <div className="flex flex-col justify-center items-start gap-2">
                  <span className="text-[#868C98] text-xs font-normal">Court</span>
                  <span className="text-[#022658] text-base font-medium">{data.court}</span>
                </div>
              </div>
              <div className="w-[200px] px-2">
                <div className="flex flex-col justify-center items-start gap-2">
                  <span className="text-[#868C98] text-xs font-normal">Judge</span>
                  <span className="text-[#022658] text-base font-medium">{data.judge}</span>
                </div>
              </div>
            </div>

            {/* Additional Information Cards */}
            <div className="px-8 py-4 border border-[#F4F6F9] rounded-lg flex items-center justify-between">
              <div className="w-[200px] px-2 border-r border-[#D4E1EA]">
                <div className="flex flex-col justify-center items-start gap-2">
                  <span className="text-[#868C98] text-xs font-normal">Town</span>
                  <span className="text-[#050F1C] text-base font-medium">{data.town}</span>
                </div>
              </div>
              <div className="w-[200px] px-2 border-r border-[#D4E1EA]">
                <div className="flex flex-col justify-center items-start gap-2">
                  <span className="text-[#868C98] text-xs font-normal">Region</span>
                  <span className="text-[#050F1C] text-base font-medium">{data.region}</span>
                </div>
              </div>
              <div className="w-[200px] px-2 border-r border-[#D4E1EA]">
                <div className="flex flex-col justify-center items-start gap-2">
                  <span className="text-[#868C98] text-xs font-normal">Court type</span>
                  <span className="text-[#050F1C] text-base font-medium">{data.courtType}</span>
                </div>
              </div>
              <div className="w-[200px] px-2 border-r border-[#D4E1EA]">
                <div className="flex flex-col justify-center items-start gap-2">
                  <span className="text-[#868C98] text-xs font-normal">Court name</span>
                  <span className="text-[#050F1C] text-base font-medium">{data.courtName}</span>
                </div>
              </div>
              <div className="w-[200px] px-2">
                <div className="flex flex-col justify-center items-start gap-2">
                  <span className="text-[#868C98] text-xs font-normal">Area of Law</span>
                  <span className="text-[#050F1C] text-base font-medium">{data.areaOfLaw}</span>
                </div>
              </div>
            </div>

            {/* Expected Outcome */}
            <div className="flex flex-col gap-2">
              <h3 className="text-[#050F1C] text-base font-medium">Expected Outcome</h3>
              <p className="text-[#050F1C] text-base font-normal whitespace-pre-line">{data.expectedOutcome}</p>
            </div>

            {/* Case Summary */}
            <div className="flex flex-col gap-2">
              <h3 className="text-[#050F1C] text-base font-medium">Case Summary</h3>
              <p className="text-[#050F1C] text-base font-normal whitespace-pre-line">{data.caseSummary}</p>
            </div>

            {/* Quick Documents */}
            <div className="flex flex-col gap-2">
              <h3 className="text-[#050F1C] text-base font-medium">3 Case Documents & 2 Court documents</h3>
              <div className="flex items-start gap-6">
                {data.quickDocuments.map((doc, index) => (
                  <div 
                    key={index}
                    className="h-[60px] px-2 py-2 bg-[#F7F8FA] rounded-lg border border-[#E4E7EB] flex items-center gap-1"
                    style={{ boxShadow: '4px 4px 4px rgba(7, 8, 16, 0.10)' }}
                  >
                    <img 
                      src="https://placehold.co/25x30" 
                      alt="Document" 
                      className="w-[25px] h-[30px] rounded"
                    />
                    <span className="text-[#050F1C] text-sm font-normal">{doc.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Parties Involved */}
            <div className="flex flex-col gap-2">
              <h3 className="text-[#050F1C] text-base font-medium">Parties involved</h3>
              <div className="overflow-hidden rounded-[14px] border border-[#E5E8EC]">
                <div className="bg-[#F4F6F9] py-4 px-4">
                  <div className="flex items-center gap-3">
                    <div className="w-[200px] px-4 py-2">
                      <span className="text-[#070810] text-sm font-bold">Party name</span>
                    </div>
                    <div className="w-[200px] px-4 py-2">
                      <span className="text-[#070810] text-sm font-bold">Role</span>
                    </div>
                    <div className="w-[200px] px-4 py-2">
                      <span className="text-[#070810] text-sm font-bold">Type</span>
                    </div>
                    <div className="w-[200px] px-4 py-2">
                      <span className="text-[#070810] text-sm font-bold">Contact</span>
                    </div>
                    <div className="w-[200px] px-4 py-2">
                      <span className="text-[#070810] text-sm font-bold">Status</span>
                    </div>
                    <div className="w-10 h-9 px-4 py-2"></div>
                  </div>
                </div>
                <div className="bg-white">
                  {data.parties.map((party, index, array) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 py-3 px-4"
                      style={{
                        borderBottom: index < array.length - 1 ? '0.40px solid #E5E8EC' : 'none'
                      }}
                    >
                      <div className="w-[200px] px-4 py-2">
                        <span className="text-[#070810] text-sm font-normal">{party.name}</span>
                      </div>
                      <div className="w-[200px] px-4 py-2">
                        <span className="text-[#070810] text-sm font-normal">{party.role}</span>
                      </div>
                      <div className="w-[200px] px-4 py-2">
                        <span className="text-[#070810] text-sm font-normal">{party.type}</span>
                      </div>
                      <div className="w-[200px] px-4 py-2">
                        <div className="border-b border-[#3B82F6] flex items-center justify-center">
                          <span className="text-[#3B82F6] text-sm font-normal">{party.contact}</span>
                        </div>
                      </div>
                      <div className="w-[200px] px-4 py-2">
                        <span className="text-[#070810] text-sm font-normal">{party.status}</span>
                      </div>
                      <div className="w-10 px-2 py-2">
                        <MoreVertical className="w-4 h-4 text-[#050F1C] transform -rotate-90" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Case Documents */}
            <div className="flex flex-col gap-2">
              <h3 className="text-[#050F1C] text-base font-medium">Case Documents</h3>
              <div className="flex flex-col gap-3">
                {/* Toggle Buttons */}
                <div className="w-[386px] px-2 py-1 bg-white rounded-lg border border-[#D4E1EA] flex items-center justify-between">
                  <button
                    onClick={() => setDocumentType('parties')}
                    className={`w-[160px] h-[41px] px-2 py-2 rounded flex items-center justify-center ${
                      documentType === 'parties' 
                        ? 'bg-[#022658] text-white' 
                        : 'text-[#050F1C]'
                    }`}
                  >
                    <span className={`text-base font-${documentType === 'parties' ? 'bold' : 'normal'}`}>
                      Parties Documents
                    </span>
                  </button>
                  <button
                    onClick={() => setDocumentType('court')}
                    className={`w-[160px] px-2 py-2 rounded flex items-center justify-center ${
                      documentType === 'court' 
                        ? 'bg-[#022658] text-white' 
                        : 'text-[#050F1C]'
                    }`}
                  >
                    <span className={`text-base font-${documentType === 'court' ? 'bold' : 'normal'}`}>
                      Court Documents
                    </span>
                  </button>
                </div>

                {/* Documents Table */}
                <div className="flex flex-col gap-4">
                  <div className="overflow-hidden rounded-[14px] border border-[#E5E8EC]">
                    <div className="bg-[#F4F6F9] py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-[210px] px-4 py-2">
                          <span className="text-[#070810] text-sm font-bold">Date</span>
                        </div>
                        <div className="w-[210px] px-4 py-2">
                          <span className="text-[#070810] text-sm font-bold">File name</span>
                        </div>
                        {documentType === 'court' ? (
                          <>
                            <div className="w-[210px] px-4 py-2">
                              <span className="text-[#070810] text-sm font-bold">Name of Judge</span>
                            </div>
                            <div className="w-[210px] px-4 py-2">
                              <span className="text-[#070810] text-sm font-bold">Citation</span>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="w-[210px] px-4 py-2">
                              <span className="text-[#070810] text-sm font-bold">Type</span>
                            </div>
                            <div className="w-[210px] px-4 py-2">
                              <span className="text-[#070810] text-sm font-bold">Submitted by</span>
                            </div>
                          </>
                        )}
                        <div className="w-[210px] h-9 px-4 py-2"></div>
                      </div>
                    </div>
                    <div className="bg-white">
                      {filteredDocuments.map((doc, index, array) => (
                        <div
                          key={index}
                          className="flex items-center gap-3 py-3 px-4"
                          style={{
                            borderBottom: index < array.length - 1 ? '0.40px solid #E5E8EC' : 'none'
                          }}
                        >
                          <div className="w-[210px] px-4 py-2">
                            <span className="text-[#070810] text-sm font-normal">{doc.date}</span>
                          </div>
                          <div className="w-[210px] px-4 py-2">
                            <span className="text-[#070810] text-sm font-normal">{doc.fileName}</span>
                          </div>
                          {documentType === 'court' ? (
                            <>
                              <div className="w-[210px] px-4 py-2">
                                <span className="text-[#070810] text-sm font-normal">{doc.judge || '-'}</span>
                              </div>
                              <div className="w-[210px] px-4 py-2">
                                <span className="text-[#070810] text-sm font-normal">{doc.citation || '-'}</span>
                              </div>
                            </>
                          ) : (
                            <>
                              <div className="w-[210px] px-4 py-2">
                                <span className="text-[#070810] text-sm font-normal">{doc.type || '-'}</span>
                              </div>
                              <div className="w-[210px] px-4 py-2">
                                <span className="text-[#070810] text-sm font-normal">{doc.submittedBy || '-'}</span>
                              </div>
                            </>
                          )}
                          <div className="w-[210px] px-4 py-2 flex justify-end">
                            <button className="flex items-center gap-1 text-[#022658] text-sm font-bold hover:opacity-70">
                              <span>View</span>
                              <ChevronRight className="w-4 h-4 text-[#050F1C]" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Export Button */}
                  <button className="h-8 px-4 py-2 rounded-lg border border-[#F59E0B] text-[#F59E0B] text-base font-medium flex items-center gap-1 hover:opacity-70 w-fit">
                    <span>Export</span>
                    <ChevronDown className="w-4 h-4 text-[#F59E0B]" />
                  </button>
                </div>
              </div>
            </div>

            {/* Footer Section */}
            <div className="p-4 border border-[#D4E1EA] rounded-lg flex items-center justify-between">
              <span className="text-[#050F1C] text-base font-medium">5 more cases scheduled for this week</span>
              <button 
                onClick={() => setShowCaseDiary(true)}
                className="flex items-center gap-1 text-[#022658] text-base font-bold hover:opacity-70"
              >
                <span>View case diary</span>
                <ChevronRight className="w-4 h-4 text-[#050F1C]" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CorporateClientCaseDetails;

