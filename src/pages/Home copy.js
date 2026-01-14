import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Search, 
  ArrowRight,
  ChevronDown,
  Menu,
  X
} from 'lucide-react';

const Home = () => {
  const navigate = useNavigate();
  const [pricingToggle, setPricingToggle] = useState('Monthly');
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = () => {
      if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <div className="content-stretch flex flex-col items-start relative size-full">
      {/* Hero Section */}
      <div className="h-[1024px] overflow-clip relative shrink-0 w-full">
        <div aria-hidden="true" className="absolute inset-0 pointer-events-none">
          <div className="absolute bg-[#f7f8fa] inset-0" />
        </div>
        <div className="absolute content-stretch flex flex-col gap-[82px] items-center left-[100px] right-[100px] top-[24px]">
      {/* Header */}
          <div className="bg-white border border-[#d4e1ea] border-solid box-border content-stretch flex items-center justify-between p-[16px] relative rounded-[16px] shrink-0 w-[1000px]">
            <div className="h-[36px] relative shrink-0 w-[122.824px]">
              <img 
                src="/main-logo.png" 
                alt="juridence logo" 
                className="h-full w-auto object-contain"
              />
            </div>
            <div className="content-stretch flex gap-[24px] items-center relative shrink-0">
                <Link
                  to="/login"
                className="border-2 border-[#0f2847] border-solid box-border content-stretch flex gap-[10px] h-[40px] items-center justify-center px-[16px] py-[10px] relative rounded-[8px] shrink-0"
                >
                <p className="font-['Satoshi',sans-serif] font-bold leading-[normal] not-italic relative shrink-0 text-[#022658] text-[14px] text-nowrap whitespace-pre">
                  Log in
                </p>
                </Link>
                <Link
                  to="/select-role"
                className="bg-gradient-to-b border-4 border-[rgba(15,40,71,0.15)] border-solid box-border content-stretch flex from-[#022658] from-[42.563%] gap-[10px] h-[40px] items-center justify-center px-[16px] py-[10px] relative rounded-[8px] shrink-0 to-[#1a4983]"
                >
                <p className="font-['Satoshi',sans-serif] font-bold leading-[normal] not-italic relative shrink-0 text-[14px] text-nowrap text-white whitespace-pre">
                  Sign up
                </p>
                </Link>
              </div>
            </div>

          {/* Hero Content */}
          <div className="content-stretch flex flex-col gap-[24px] items-center relative shrink-0 w-[804px]">
            <div className="content-stretch flex flex-col gap-[16px] items-start not-italic relative shrink-0 text-[#070810] w-full">
              <p className="font-['Poppins',sans-serif] font-semibold leading-[72px] relative shrink-0 text-[60px] text-center w-full">
                <span>Reliable </span>
                <span className="text-blue-500">Legal Intelligence</span>
                <span> for Smarter Decisions</span>
              </p>
              <p className="font-['Poppins',sans-serif] font-normal leading-[normal] relative shrink-0 text-[18px] w-full">
                Instant access to litigation links, gazette records, risk insights, and corporate associations.
              </p>
            </div>

              {/* Search Bar */}
            <div className="content-stretch flex flex-col gap-[16px] items-center relative shrink-0 w-full">
              <div className="content-stretch flex gap-[16px] items-center justify-center relative shrink-0">
                <div className="bg-white border border-[#d4e1ea] border-solid box-border content-stretch flex h-[44px] items-center justify-between px-[8px] py-[10px] relative rounded-[8px] shrink-0 w-[600px]">
                    <input
                      type="text"
                      value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    placeholder="Search companies and persons here"
                    className="flex-1 font-['Satoshi',sans-serif] font-normal leading-[normal] not-italic relative shrink-0 text-[#525866] text-[12px] text-nowrap whitespace-pre outline-none border-none bg-transparent"
                  />
                  <div className="content-stretch flex gap-[6px] items-center relative shrink-0">
                    <div className="content-stretch flex gap-[2px] items-center relative shrink-0">
                      <X className="overflow-clip relative shrink-0 size-[12px] text-[#868c98]" />
                      <p className="font-['Satoshi',sans-serif] font-normal leading-[normal] not-italic relative shrink-0 text-[#868c98] text-[14px] text-nowrap whitespace-pre">
                        |
                      </p>
                      </div>
                    <div className="bg-[#f7f8fa] box-border content-stretch flex gap-[2px] items-end justify-center p-[4px] relative rounded-[4px] shrink-0 w-[60px]">
                      <p className="font-['Satoshi',sans-serif] font-bold leading-[normal] not-italic relative shrink-0 text-[#525866] text-[12px] text-nowrap whitespace-pre">
                        Region
                      </p>
                      <ChevronDown className="overflow-clip relative shrink-0 size-[12px] text-[#525866]" />
                  </div>
                    <div className="bg-[#f7f8fa] box-border content-stretch flex gap-[2px] items-end justify-center p-[4px] relative rounded-[4px] shrink-0 w-[60px]">
                      <p className="font-['Satoshi',sans-serif] font-bold leading-[normal] not-italic relative shrink-0 text-[#525866] text-[12px] text-nowrap whitespace-pre">
                        City
                      </p>
                      <ChevronDown className="overflow-clip relative shrink-0 size-[12px] text-[#525866]" />
                      </div>
                  </div>
                  </div>
                  <button
                  onClick={handleSearch}
                  className="bg-gradient-to-b border-4 border-[rgba(15,40,71,0.15)] border-solid box-border content-stretch flex from-[#022658] from-[42.563%] gap-[10px] h-[40px] items-center justify-center px-[16px] py-[10px] relative rounded-[8px] shrink-0 to-[#1a4983]"
                  >
                  <p className="font-['Satoshi',sans-serif] font-bold leading-[normal] not-italic relative shrink-0 text-[14px] text-nowrap text-white whitespace-pre">
                    Search
                  </p>
                  </button>
              </div>
              <p className="font-['Satoshi',sans-serif] font-normal leading-[normal] not-italic relative shrink-0 text-[#525866] text-[12px] text-nowrap whitespace-pre">
                No case search required. Juridence pulls all associated cases automatically.
              </p>
            </div>
              </div>

          {/* Dashboard Preview */}
          <div className="bg-[#ebf2ff] h-[1578.42px] overflow-clip relative rounded-[6.889px] shrink-0 w-full mt-8">
            {/* Sidebar */}
            <div className="absolute bg-white box-border content-stretch flex flex-col gap-[34.444px] h-[881.778px] items-start left-0 px-[17.222px] py-[20.667px] top-0 w-[206.667px]">
              <div className="h-[31px] relative shrink-0 w-[105.765px]">
                <img 
                  src="/main-logo.png" 
                  alt="juridence logo" 
                  className="h-full w-auto object-contain"
                />
              </div>
              <div className="content-stretch flex flex-col gap-[327.222px] items-start relative shrink-0 w-full">
                <div className="content-stretch flex flex-col gap-[20.667px] items-start relative shrink-0 w-full">
                  <div className="content-stretch flex flex-col gap-[6.889px] items-start relative shrink-0 w-full">
                    <p className="font-['Satoshi',sans-serif] font-normal leading-[normal] not-italic relative shrink-0 text-[#868c98] text-[8.61px] w-full">
                      CORE
                    </p>
                    <div className="box-border content-stretch flex flex-col gap-[6.889px] items-start px-[6.889px] py-0 relative shrink-0 w-full">
                      <div className="content-stretch flex gap-[6.889px] items-center relative shrink-0 w-full">
                        <div className="bg-[#d4e1ea] rounded w-[9.185px] h-[9.185px]"></div>
                        <p className="font-['Satoshi',sans-serif] font-normal leading-[normal] not-italic relative shrink-0 text-[#050f1c] text-[12.06px] text-nowrap whitespace-pre">
                          Dashboard
                        </p>
                      </div>
                      <div className="content-stretch flex gap-[6.889px] items-center relative shrink-0 w-full">
                        <div className="bg-[#d4e1ea] rounded w-[9.185px] h-[9.185px]"></div>
                        <p className="font-['Satoshi',sans-serif] font-normal leading-[normal] not-italic relative shrink-0 text-[#050f1c] text-[12.06px] text-nowrap whitespace-pre">
                          Billing
                        </p>
                      </div>
                      <div className="content-stretch flex gap-[6.889px] items-center relative shrink-0 w-full">
                        <div className="bg-[#d4e1ea] rounded w-[9.185px] h-[9.185px]"></div>
                        <p className="font-['Satoshi',sans-serif] font-normal leading-[normal] not-italic relative shrink-0 text-[#050f1c] text-[12.06px] text-nowrap whitespace-pre">
                          Team
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="content-stretch flex flex-col gap-[6.889px] items-start relative shrink-0 w-full">
                    <p className="font-['Satoshi',sans-serif] font-normal leading-[normal] not-italic relative shrink-0 text-[#868c98] text-[8.61px] w-full">
                      SEARCH
                    </p>
                    <div className="box-border content-stretch flex flex-col gap-[8.611px] items-start px-[6.889px] py-0 relative shrink-0 w-full">
                      <div className="content-stretch flex gap-[6.889px] items-center relative shrink-0 w-full">
                        <div className="bg-[#d4e1ea] rounded w-[16px] h-[16px]"></div>
                        <p className="font-['Satoshi',sans-serif] font-normal leading-[normal] not-italic relative shrink-0 text-[#050f1c] text-[12.06px] text-nowrap whitespace-pre">
                          Persons
                        </p>
                      </div>
                      <div className="bg-[#022658] box-border content-stretch flex gap-[6.889px] items-center p-[6.889px] relative rounded-[4px] shrink-0 w-full">
                        <div className="bg-white rounded w-[16px] h-[16px]"></div>
                        <p className="font-['Satoshi',sans-serif] font-bold leading-[normal] not-italic relative shrink-0 text-[12.06px] text-nowrap text-white whitespace-pre">
                          Companies
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="box-border content-stretch flex flex-col gap-[20.667px] items-start px-[6.889px] py-0 relative shrink-0 w-full">
                    <div className="content-stretch flex gap-[6.889px] items-center relative shrink-0 w-full">
                      <div className="bg-[#d4e1ea] rounded w-[9.185px] h-[9.185px]"></div>
                      <p className="font-['Satoshi',sans-serif] font-normal leading-[normal] not-italic relative shrink-0 text-[#050f1c] text-[12.06px] text-nowrap whitespace-pre">
                        Watchlist
                      </p>
                    </div>
                    <div className="content-stretch flex gap-[6.889px] items-center relative shrink-0 w-full">
                      <div className="bg-[#d4e1ea] rounded w-[9.185px] h-[9.185px]"></div>
                      <p className="font-['Satoshi',sans-serif] font-normal leading-[normal] not-italic relative shrink-0 text-[#050f1c] text-[12.06px] text-nowrap whitespace-pre">
                        Requests & Exports
                      </p>
                    </div>
                    <div className="content-stretch flex gap-[6.889px] items-center relative shrink-0 w-full">
                      <div className="bg-[#d4e1ea] rounded w-[9.185px] h-[9.185px]"></div>
                      <p className="font-['Satoshi',sans-serif] font-normal leading-[normal] not-italic relative shrink-0 text-[#050f1c] text-[12.06px] text-nowrap whitespace-pre">
                        Help & Support
                      </p>
                    </div>
                    <div className="content-stretch flex gap-[6.889px] items-center relative shrink-0 w-full">
                      <div className="bg-[#d4e1ea] rounded w-[9.185px] h-[9.185px]"></div>
                      <p className="font-['Satoshi',sans-serif] font-normal leading-[normal] not-italic relative shrink-0 text-[#050f1c] text-[12.06px] text-nowrap whitespace-pre">
                        Notifications
                      </p>
                    </div>
                  </div>
                </div>
                <div className="content-stretch flex flex-col gap-[20.667px] items-start relative shrink-0 w-full">
                  <div className="content-stretch flex gap-[6.889px] items-center relative shrink-0">
                    <div className="bg-[#d4e1ea] rounded w-[9.185px] h-[9.185px]"></div>
                    <p className="font-['Satoshi',sans-serif] font-normal leading-[normal] not-italic relative shrink-0 text-[#050f1c] text-[12.06px] text-nowrap whitespace-pre">
                      System settings
                    </p>
                  </div>
                  <div className="content-stretch flex gap-[6.889px] items-center relative shrink-0 w-full">
                    <div className="bg-[#ef4444] rounded w-[9.185px] h-[9.185px]"></div>
                    <p className="font-['Satoshi',sans-serif] font-normal leading-[normal] not-italic relative shrink-0 text-[12.06px] text-nowrap text-red-500 whitespace-pre">
                      Log out
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Body */}
            <div className="absolute bg-[#f7f8fa] h-[1578.42px] left-[227.33px] overflow-clip top-0 w-[992px]">
              <div className="absolute content-stretch flex flex-col gap-[13.778px] h-[1571.53px] items-start left-[-1.72px] top-[6.89px] w-[993.722px]">
                {/* Top Bar */}
                <div className="border-[#d4e1ea] border-[0px_0px_0.861px] border-solid box-border content-stretch flex h-[62px] items-center justify-between px-[6.889px] py-0 relative rounded-[3.444px] shrink-0 w-full">
                  <div className="content-stretch flex flex-col gap-[3.444px] items-start leading-[normal] not-italic relative shrink-0 text-[#050f1c] text-nowrap whitespace-pre">
                    <p className="font-['Poppins',sans-serif] font-medium relative shrink-0 text-[17.222px]">
                      Access Bank,
                    </p>
                    <p className="font-['Satoshi',sans-serif] font-normal opacity-75 relative shrink-0 text-[13.778px]">
                      Track all your activities here.
                    </p>
                </div>
                  <div className="content-stretch flex gap-[13.778px] items-center relative shrink-0">
                    <div className="border-[#d4e1ea] border-[0.861px] border-solid box-border content-stretch flex h-[37.889px] items-center justify-between px-[6.889px] py-[8.611px] relative rounded-[6.889px] shrink-0 w-[516.667px]">
                      <p className="font-['Satoshi',sans-serif] font-normal leading-[normal] not-italic relative shrink-0 text-[#525866] text-[10.333px] text-nowrap whitespace-pre">
                        Search companies and persons here
                      </p>
                      <div className="content-stretch flex gap-[5.167px] items-center relative shrink-0">
                        <div className="content-stretch flex gap-[1.722px] items-center relative shrink-0">
                          <X className="overflow-clip relative shrink-0 size-[10.333px] text-[#868c98]" />
                          <p className="font-['Satoshi',sans-serif] font-normal leading-[normal] not-italic relative shrink-0 text-[#868c98] text-[12.056px] text-nowrap whitespace-pre">
                            |
                          </p>
                  </div>
                        <div className="bg-white box-border content-stretch flex gap-[1.722px] items-end justify-center p-[3.444px] relative rounded-[3.444px] shrink-0 w-[41.333px]">
                          <p className="font-['Satoshi',sans-serif] font-bold leading-[normal] not-italic relative shrink-0 text-[#525866] text-[10.333px] text-nowrap whitespace-pre">
                            All
                          </p>
                          <ChevronDown className="overflow-clip relative shrink-0 size-[10.333px] text-[#525866]" />
                  </div>
                  </div>
                </div>
                    <div className="content-stretch flex gap-[10.333px] h-[37.889px] items-center relative shrink-0">
                      <div className="bg-[#f7f8fa] border-[#d4e1ea] border-[0.431px] border-solid box-border content-stretch flex gap-[7.045px] items-center p-[7.045px] relative rounded-[70.455px] shrink-0">
                        <div className="bg-[#022658] rounded-full w-[16.909px] h-[16.909px]"></div>
                  </div>
                      <div className="content-stretch flex gap-[5.167px] items-center relative shrink-0">
                        <div className="relative rounded-[70.455px] shrink-0 size-[31px] bg-[#d4e1ea]"></div>
                        <div className="content-stretch flex flex-col gap-[3.444px] items-start relative shrink-0">
                          <div className="content-stretch flex gap-[1.722px] items-center relative shrink-0">
                            <p className="font-['Satoshi',sans-serif] font-bold leading-[normal] not-italic relative shrink-0 text-[#050f1c] text-[13.778px] text-nowrap whitespace-pre">
                              Tonia Martins
                            </p>
                            <ChevronDown className="overflow-clip relative shrink-0 size-[10.333px] text-[#525866]" />
                </div>
                          <div className="content-stretch flex gap-[3.444px] items-center relative shrink-0">
                            <div className="relative shrink-0 size-[6.889px] bg-[#10b981] rounded-full"></div>
                            <p className="font-['Satoshi',sans-serif] font-normal leading-[normal] not-italic relative shrink-0 text-[#525866] text-[10.333px] text-nowrap whitespace-pre">
                              Online
                            </p>
              </div>
            </div>
          </div>
        </div>
                  </div>
                </div>

                {/* Main Content */}
                <div className="bg-white box-border content-stretch flex flex-col gap-[34.444px] h-[1495.75px] items-start p-[13.778px] relative rounded-[6.889px] shrink-0 w-full">
                  <div className="content-stretch flex flex-col gap-[20.667px] h-[1361.42px] items-start relative shrink-0 w-full">
                    {/* Breadcrumbs */}
                    <div className="content-stretch flex gap-[3.444px] items-center relative shrink-0">
                      <p className="font-['Satoshi',sans-serif] font-normal leading-[normal] not-italic opacity-75 relative shrink-0 text-[#525866] text-[10.333px] text-nowrap whitespace-pre">
                        COMPANIES
                      </p>
                      <ArrowRight className="overflow-clip relative shrink-0 size-[13.778px] text-[#7b8794]" />
                      <p className="font-['Satoshi',sans-serif] font-normal leading-[normal] not-italic opacity-75 relative shrink-0 text-[#525866] text-[10.333px] text-nowrap whitespace-pre">
                        ENERGY
                      </p>
                      <ArrowRight className="overflow-clip relative shrink-0 size-[13.778px] text-[#7b8794]" />
                      <p className="font-['Roboto',sans-serif] font-normal leading-[normal] relative shrink-0 text-[#070810] text-[12.056px] text-nowrap whitespace-pre">
                        EcoWind Corp.
                      </p>
                      <ArrowRight className="overflow-clip relative shrink-0 size-[13.778px] text-[#7b8794]" />
                      <p className="font-['Roboto',sans-serif] font-normal leading-[normal] relative shrink-0 text-[#070810] text-[12.056px] text-nowrap whitespace-pre">
                        EcoWind Corp. vs. Meridian Properties
                      </p>
                    </div>

                    {/* Case Title */}
                    <div className="content-stretch flex flex-col gap-[6.889px] items-start relative shrink-0 w-full">
                      <div className="content-stretch flex gap-[10.333px] items-start relative shrink-0 w-full">
                        <div className="bg-[#f7f8fa] box-border content-stretch flex gap-[8.611px] items-center p-[6.889px] relative rounded-[6.889px] shrink-0">
                          <ArrowRight className="overflow-clip relative shrink-0 size-[20.667px] text-[#070810] rotate-180" />
                        </div>
                        <p className="font-['Poppins',sans-serif] font-medium leading-[normal] not-italic relative shrink-0 text-[#050f1c] text-[20.667px] w-[948.944px]">
                          EcoWind Corp. vs. Meridian Properties - Dispute over breach of lease agreement for commercial property
                        </p>
                      </div>
                      {/* Blue Tag */}
                      <div className="bg-[#3B82F6] box-border content-stretch flex items-center justify-center px-[6.889px] py-[3.444px] relative rounded-[3.444px] shrink-0">
                        <p className="font-['Satoshi',sans-serif] font-normal leading-[normal] not-italic relative shrink-0 text-white text-[10.333px] text-nowrap whitespace-pre">
                          Frame 1000008414
                        </p>
                      </div>
                    </div>

                    {/* Case Details Row 1 */}
                    <div className="bg-[#f4f6f9] box-border content-stretch flex items-center justify-between px-[27.556px] py-[13.778px] relative rounded-[6.889px] shrink-0 mr-[100px]">
                      <div className="border-[#d4e1ea] border-[0px_0.861px_0px_0px] border-solid box-border content-stretch flex gap-[8.611px] items-center p-[6.889px] relative shrink-0 w-[172.222px]">
                        <div className="content-stretch flex flex-col gap-[6.889px] items-start justify-center leading-[normal] not-italic relative shrink-0">
                          <p className="font-['Satoshi',sans-serif] font-normal relative shrink-0 text-[#868c98] text-[10.333px] text-nowrap whitespace-pre">
                            Role
                          </p>
                          <p className="font-['Satoshi',sans-serif] font-medium relative shrink-0 text-[#022658] text-[13.778px] w-[149.833px]">
                            Plaintiff
                          </p>
                        </div>
                      </div>
                      <div className="border-[#d4e1ea] border-[0px_0.861px_0px_0px] border-solid box-border content-stretch flex gap-[8.611px] items-center p-[6.889px] relative shrink-0 w-[172.222px]">
                        <div className="content-stretch flex flex-col gap-[6.889px] items-start justify-center leading-[normal] not-italic relative shrink-0 text-nowrap whitespace-pre">
                          <p className="font-['Satoshi',sans-serif] font-normal relative shrink-0 text-[#868c98] text-[10.333px]">
                            Date Filed
                          </p>
                          <p className="font-['Satoshi',sans-serif] font-medium relative shrink-0 text-[#022658] text-[13.778px]">
                            March 15, 2023
                          </p>
                        </div>
                      </div>
                      <div className="border-[#d4e1ea] border-[0px_0.861px_0px_0px] border-solid box-border content-stretch flex gap-[8.611px] items-center p-[6.889px] relative shrink-0 w-[172.222px]">
                        <div className="content-stretch flex flex-col gap-[6.889px] items-start justify-center leading-[normal] not-italic relative shrink-0 text-nowrap whitespace-pre">
                          <p className="font-['Satoshi',sans-serif] font-normal relative shrink-0 text-[#868c98] text-[10.333px]">
                            Suit No.
                          </p>
                          <p className="font-['Satoshi',sans-serif] font-medium relative shrink-0 text-[#022658] text-[13.778px]">
                            CM/0245/2023
                          </p>
                        </div>
                      </div>
                      <div className="border-[#d4e1ea] border-[0px_0.861px_0px_0px] border-solid box-border content-stretch flex gap-[8.611px] items-center p-[6.889px] relative shrink-0 w-[172.222px]">
                        <div className="content-stretch flex flex-col gap-[6.889px] items-start justify-center leading-[normal] not-italic relative shrink-0 text-nowrap whitespace-pre">
                          <p className="font-['Satoshi',sans-serif] font-normal relative shrink-0 text-[#868c98] text-[10.333px]">
                            Court
                          </p>
                          <p className="font-['Satoshi',sans-serif] font-medium relative shrink-0 text-[#022658] text-[13.778px]">
                            High Court, Accra
                          </p>
                        </div>
                      </div>
                      <div className="box-border content-stretch flex gap-[8.611px] items-center p-[6.889px] relative shrink-0 w-[172.222px]">
                        <div className="content-stretch flex flex-col gap-[6.889px] items-start justify-center leading-[normal] not-italic relative shrink-0 text-nowrap whitespace-pre">
                          <p className="font-['Satoshi',sans-serif] font-normal relative shrink-0 text-[#868c98] text-[10.333px]">
                            Judge
                          </p>
                          <p className="font-['Satoshi',sans-serif] font-medium relative shrink-0 text-[#022658] text-[13.778px]">
                            Ben Carson (SAN)
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Case Details Row 2 */}
                    <div className="border-[#f4f6f9] border-[0.861px] border-solid box-border content-stretch flex items-center justify-between px-[27.556px] py-[13.778px] relative rounded-[6.889px] shrink-0 mr-[100px]">
                      <div className="border-[#d4e1ea] border-[0px_0.861px_0px_0px] border-solid box-border content-stretch flex gap-[8.611px] items-center p-[6.889px] relative shrink-0 w-[172.222px]">
                        <div className="content-stretch flex flex-col gap-[6.889px] items-start justify-center leading-[normal] not-italic relative shrink-0 text-nowrap whitespace-pre">
                          <p className="font-['Satoshi',sans-serif] font-normal relative shrink-0 text-[#868c98] text-[10.333px]">
                            Town
                          </p>
                          <p className="font-['Satoshi',sans-serif] font-medium relative shrink-0 text-[#050f1c] text-[13.778px]">
                            Accra
                          </p>
                        </div>
                      </div>
                      <div className="border-[#d4e1ea] border-[0px_0.861px_0px_0px] border-solid box-border content-stretch flex gap-[8.611px] items-center p-[6.889px] relative shrink-0 w-[172.222px]">
                        <div className="content-stretch flex flex-col gap-[6.889px] items-start justify-center leading-[normal] not-italic relative shrink-0 text-nowrap whitespace-pre">
                          <p className="font-['Satoshi',sans-serif] font-normal relative shrink-0 text-[#868c98] text-[10.333px]">
                            Region
                          </p>
                          <p className="font-['Satoshi',sans-serif] font-medium relative shrink-0 text-[#050f1c] text-[13.778px]">
                            Greater Accra
                          </p>
                        </div>
                      </div>
                      <div className="border-[#d4e1ea] border-[0px_0.861px_0px_0px] border-solid box-border content-stretch flex gap-[8.611px] items-center p-[6.889px] relative shrink-0 w-[172.222px]">
                        <div className="content-stretch flex flex-col gap-[6.889px] items-start justify-center leading-[normal] not-italic relative shrink-0 text-nowrap whitespace-pre">
                          <p className="font-['Satoshi',sans-serif] font-normal relative shrink-0 text-[#868c98] text-[10.333px]">
                            Court type
                          </p>
                          <p className="font-['Satoshi',sans-serif] font-medium relative shrink-0 text-[#050f1c] text-[13.778px]">
                            High Court
                          </p>
                        </div>
                      </div>
                      <div className="border-[#d4e1ea] border-[0px_0.861px_0px_0px] border-solid box-border content-stretch flex gap-[8.611px] items-center p-[6.889px] relative shrink-0 w-[172.222px]">
                        <div className="content-stretch flex flex-col gap-[6.889px] items-start justify-center leading-[normal] not-italic relative shrink-0 text-nowrap whitespace-pre">
                          <p className="font-['Satoshi',sans-serif] font-normal relative shrink-0 text-[#868c98] text-[10.333px]">
                            Court name
                          </p>
                          <p className="font-['Satoshi',sans-serif] font-medium relative shrink-0 text-[#050f1c] text-[13.778px]">
                            Domestic Jurisdiction 1
                          </p>
                        </div>
                      </div>
                      <div className="box-border content-stretch flex gap-[8.611px] items-center p-[6.889px] relative shrink-0 w-[172.222px]">
                        <div className="content-stretch flex flex-col gap-[6.889px] items-start justify-center leading-[normal] not-italic relative shrink-0 text-nowrap whitespace-pre">
                          <p className="font-['Satoshi',sans-serif] font-normal relative shrink-0 text-[#868c98] text-[10.333px]">
                            Area of Law
                          </p>
                          <p className="font-['Satoshi',sans-serif] font-medium relative shrink-0 text-[#050f1c] text-[13.778px]">
                            Land Law
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Expected Outcome */}
                    <div className="content-stretch flex flex-col gap-[6.889px] items-start relative shrink-0 w-full">
                      <p className="font-['Satoshi',sans-serif] font-medium leading-[normal] not-italic relative shrink-0 text-[#050f1c] text-[13.778px] w-full">
                        Expected Outcome
                      </p>
                      <div className="font-['Satoshi',sans-serif] font-normal leading-[normal] not-italic relative shrink-0 text-[#050f1c] text-[13.778px] w-full">
                        <p className="mb-0">
                          The expected outcome of this case is a favorable judgment for JKL Ventures Ltd, where the court directs Meridian Properties to compensate the plaintiff for breach of the lease agreement and to either restore the original lease terms or provide financial restitution for the loss suffered.
                        </p>
                      </div>
                    </div>

                    {/* Case Summary */}
                    <div className="content-stretch flex flex-col gap-[6.889px] items-start justify-center not-italic relative shrink-0 text-[#050f1c] text-[13.778px] w-full">
                      <p className="font-['Satoshi',sans-serif] font-medium leading-[normal] relative shrink-0 w-full">
                        Case Summary
                      </p>
                      <div className="font-['Satoshi',sans-serif] font-normal leading-[normal] relative shrink-0 w-full">
                        <p className="mb-0">This case revolves around a contractual dispute concerning a lease agreement for a commercial property located in Accra. JKL Ventures Ltd, through its director, contends that Meridian Properties breached the terms of the agreement by prematurely terminating the lease and failing to fulfill specific maintenance and renewal obligations stipulated in the contract. As a result, JKL Ventures claims to have suffered operational and financial setbacks due to the sudden loss of the leased premises.</p>
                        <p className="mb-0 text-[13.778px]">&nbsp;</p>
                        <p>The plaintiff is seeking damages amounting to GHS 150,000 and an order compelling the defendant to either honor the original lease terms or compensate for the loss incurred. The case, filed on March 15, 2023, is currently ongoing before the High Court (Commercial Division) in Accra, where preliminary hearings have focused on validating the contract and assessing the extent of the alleged breach.</p>
                      </div>
                    </div>

                    {/* Case Documents Preview */}
                    <div className="content-stretch flex flex-col gap-[6.889px] items-start justify-center relative shrink-0 w-full">
                      <p className="font-['Satoshi',sans-serif] font-medium leading-[normal] min-w-full not-italic relative shrink-0 text-[#050f1c] text-[13.778px] w-[min-content]">
                        3 Case Documents & 2 Court documents
                      </p>
                      <div className="content-stretch flex gap-[20.667px] items-start relative shrink-0">
                        <div className="bg-[#f7f8fa] border-[#e4e7eb] border-[0.861px] border-solid box-border content-stretch flex gap-[3.444px] h-[51.667px] items-center p-[6.889px] relative rounded-[6.889px] shrink-0">
                          <div className="h-[25.564px] relative rounded-[3.444px] shrink-0 w-[21.528px] bg-[#d4e1ea]"></div>
                          <p className="font-['Satoshi',sans-serif] font-normal leading-[normal] not-italic relative shrink-0 text-[#050f1c] text-[12.056px] text-nowrap whitespace-pre">
                            Lease_Agreement.pdf
                          </p>
                        </div>
                        <div className="bg-[#f7f8fa] border-[#e4e7eb] border-[0.861px] border-solid box-border content-stretch flex gap-[3.444px] h-[51.667px] items-center p-[6.889px] relative rounded-[6.889px] shrink-0">
                          <div className="h-[25.564px] relative rounded-[3.444px] shrink-0 w-[21.528px] bg-[#d4e1ea]"></div>
                          <p className="font-['Satoshi',sans-serif] font-normal leading-[normal] not-italic relative shrink-0 text-[#050f1c] text-[12.056px] text-nowrap whitespace-pre">
                            Court_Order_0245.pdf
                          </p>
                        </div>
                        <div className="bg-[#f7f8fa] border-[#e4e7eb] border-[0.861px] border-solid box-border content-stretch flex gap-[3.444px] h-[51.667px] items-center p-[6.889px] relative rounded-[6.889px] shrink-0">
                          <div className="h-[25.564px] relative rounded-[3.444px] shrink-0 w-[21.528px] bg-[#d4e1ea]"></div>
                          <p className="font-['Satoshi',sans-serif] font-normal leading-[normal] not-italic relative shrink-0 text-[#050f1c] text-[12.056px] text-nowrap whitespace-pre">
                            Gazette_1093.pdf
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Parties Involved Table */}
                    <div className="content-stretch flex flex-col gap-[6.889px] items-start justify-center relative shrink-0 w-full">
                      <p className="font-['Satoshi',sans-serif] font-medium leading-[normal] not-italic relative shrink-0 text-[#050f1c] text-[13.778px] w-full">
                        Parties involved
                      </p>
                      <div className="border-[#e5e8ec] border-[0.861px] border-solid relative rounded-[12.056px] shrink-0 w-full">
                        <div className="content-stretch flex flex-col gap-[3.444px] items-start overflow-clip relative rounded-[inherit] w-full">
                          <div className="bg-[#f4f6f9] box-border content-stretch flex gap-[10.333px] items-center px-0 py-[13.778px] relative shrink-0 w-full">
                            <div className="box-border content-stretch flex gap-[8.611px] items-center px-[13.778px] py-[6.889px] relative shrink-0 w-[172.222px]">
                              <p className="font-['Satoshi',sans-serif] font-bold leading-[normal] not-italic relative shrink-0 text-[#070810] text-[12.056px] text-nowrap whitespace-pre">
                                Party name
                              </p>
                            </div>
                            <div className="box-border content-stretch flex gap-[8.611px] items-center px-[13.778px] py-[6.889px] relative shrink-0 w-[172.222px]">
                              <p className="font-['Satoshi',sans-serif] font-bold leading-[normal] not-italic relative shrink-0 text-[#070810] text-[12.056px] text-nowrap whitespace-pre">
                                Role
                              </p>
                            </div>
                            <div className="box-border content-stretch flex gap-[8.611px] items-center px-[13.778px] py-[6.889px] relative shrink-0 w-[172.222px]">
                              <p className="font-['Satoshi',sans-serif] font-bold leading-[normal] not-italic relative shrink-0 text-[#070810] text-[12.056px] text-nowrap whitespace-pre">
                                Type
                              </p>
                            </div>
                            <div className="box-border content-stretch flex gap-[8.611px] items-center px-[13.778px] py-[6.889px] relative shrink-0 w-[172.222px]">
                              <p className="font-['Satoshi',sans-serif] font-bold leading-[normal] not-italic relative shrink-0 text-[#070810] text-[12.056px] text-nowrap whitespace-pre">
                                Contact
                              </p>
                            </div>
                            <div className="box-border content-stretch flex gap-[8.611px] items-center px-[13.778px] py-[6.889px] relative shrink-0 w-[172.222px]">
                              <p className="font-['Satoshi',sans-serif] font-bold leading-[normal] not-italic relative shrink-0 text-[#070810] text-[12.056px] text-nowrap whitespace-pre">
                                Status
                              </p>
                            </div>
                            <div className="h-[30.139px] shrink-0 w-[34.444px]" />
                          </div>
                          {[
                            { name: 'EcoWind Corp.', role: 'Plaintiff', type: 'Company', contact: 'info@ecowindcorp.com', status: 'Active' },
                            { name: 'Meridian Properties', role: 'Defendant', type: 'Company', contact: 'legal@meridianprops.com', status: 'Active' },
                            { name: 'K. Owusu', role: "Plaintiff's Counsel", type: 'Individual', contact: 'owusu@lawfirm.com', status: 'Active' },
                            { name: 'S. Baffoe', role: "Defendant's Counsel", type: 'Individual', contact: 'sbaffoe@firm.com', status: 'Active' }
                          ].map((party, idx) => (
                            <div key={idx} className="border-[#e5e8ec] border-[0px_0px_0.344px] border-solid box-border content-stretch flex gap-[10.333px] items-center px-0 py-[10.333px] relative shrink-0 w-full">
                              <div className="box-border content-stretch flex gap-[8.611px] items-center px-[13.778px] py-[6.889px] relative shrink-0 w-[172.222px]">
                                <p className="font-['Satoshi',sans-serif] font-normal leading-[normal] not-italic relative shrink-0 text-[#070810] text-[12.056px] text-nowrap whitespace-pre">
                                  {party.name}
                                </p>
                              </div>
                              <div className="box-border content-stretch flex gap-[8.611px] items-center px-[13.778px] py-[6.889px] relative shrink-0 w-[172.222px]">
                                <p className="font-['Satoshi',sans-serif] font-normal leading-[normal] not-italic relative shrink-0 text-[#070810] text-[12.056px] text-nowrap whitespace-pre">
                                  {party.role}
                                </p>
                              </div>
                              <div className="box-border content-stretch flex gap-[8.611px] items-center px-[13.778px] py-[6.889px] relative shrink-0 w-[172.222px]">
                                <p className="font-['Satoshi',sans-serif] font-normal leading-[normal] not-italic relative shrink-0 text-[#070810] text-[12.056px] text-nowrap whitespace-pre">
                                  {party.type}
                                </p>
                              </div>
                              <div className="box-border content-stretch flex gap-[8.611px] items-center px-[13.778px] py-[6.889px] relative shrink-0 w-[172.222px]">
                                <div className="border-[0px_0px_0.861px] border-blue-500 border-dashed box-border content-stretch flex gap-[8.611px] items-center justify-center relative shrink-0">
                                  <p className="font-['Satoshi',sans-serif] font-normal leading-[normal] not-italic relative shrink-0 text-[12.056px] text-blue-500 text-nowrap whitespace-pre">
                                    {party.contact}
                                  </p>
                                </div>
                              </div>
                              <div className="box-border content-stretch flex gap-[8.611px] items-center px-[13.778px] py-[6.889px] relative shrink-0 w-[172.222px]">
                                <p className="font-['Satoshi',sans-serif] font-normal leading-[normal] not-italic relative shrink-0 text-[#070810] text-[12.056px] text-nowrap whitespace-pre">
                                  {party.status}
                                </p>
                              </div>
                              <div className="box-border content-stretch flex gap-[8.611px] items-center p-[6.889px] relative shrink-0 w-[34.444px]">
                                <Menu className="flex items-center justify-center relative shrink-0 size-[13.778px] text-[#050f1c] rotate-90" />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Case Documents Table */}
                    <div className="content-stretch flex flex-col gap-[6.889px] items-start justify-center relative shrink-0 w-full">
                      <p className="font-['Satoshi',sans-serif] font-medium leading-[normal] not-italic relative shrink-0 text-[#050f1c] text-[13.778px] w-full">
                        Case Documents
                      </p>
                      <div className="content-stretch flex flex-col gap-[10.333px] items-center relative shrink-0 w-full">
                        <div className="bg-white border-[#d4e1ea] border-[0.861px] border-solid box-border content-stretch flex items-center justify-between px-[6.889px] py-[3.444px] relative rounded-[6.889px] shrink-0 w-[332.389px]">
                          <div className="bg-[#022658] box-border content-stretch flex gap-[6.889px] items-center justify-center p-[6.889px] relative rounded-[3.444px] shrink-0 w-[137.778px]">
                            <p className="font-['Satoshi',sans-serif] font-bold leading-[normal] not-italic relative shrink-0 text-[13.778px] text-center text-white">
                              Parties Documents
                            </p>
                          </div>
                          <div className="box-border content-stretch flex gap-[6.889px] h-[35.306px] items-center justify-center p-[6.889px] relative rounded-[3.444px] shrink-0 w-[137.778px]">
                            <p className="font-['Satoshi',sans-serif] font-normal leading-[normal] not-italic relative shrink-0 text-[#050f1c] text-[13.778px] text-nowrap">
                              Court Documents
                            </p>
                          </div>
                        </div>
                        <div className="content-stretch flex flex-col gap-[13.778px] items-start relative shrink-0 w-full">
                          <div className="border-[#e5e8ec] border-[0.861px] border-solid relative rounded-[12.056px] shrink-0 w-full">
                            <div className="content-stretch flex flex-col gap-[3.444px] items-start overflow-clip relative rounded-[inherit] w-full">
                              <div className="bg-[#f4f6f9] box-border content-stretch flex gap-[10.333px] items-center px-0 py-[13.778px] relative shrink-0 w-full">
                                <div className="box-border content-stretch flex gap-[8.611px] items-center px-[13.778px] py-[6.889px] relative shrink-0 w-[180.833px]">
                                  <p className="font-['Satoshi',sans-serif] font-bold leading-[normal] not-italic relative shrink-0 text-[#070810] text-[12.056px] text-nowrap whitespace-pre">
                                    Date
                                  </p>
                                </div>
                                <div className="box-border content-stretch flex gap-[8.611px] items-center px-[13.778px] py-[6.889px] relative shrink-0 w-[180.833px]">
                                  <p className="font-['Satoshi',sans-serif] font-bold leading-[normal] not-italic relative shrink-0 text-[#070810] text-[12.056px] text-nowrap whitespace-pre">
                                    File name
                                  </p>
                                </div>
                                <div className="box-border content-stretch flex gap-[8.611px] items-center px-[13.778px] py-[6.889px] relative shrink-0 w-[180.833px]">
                                  <p className="font-['Satoshi',sans-serif] font-bold leading-[normal] not-italic relative shrink-0 text-[#070810] text-[12.056px] text-nowrap whitespace-pre">
                                    Type
                                  </p>
                                </div>
                                <div className="box-border content-stretch flex gap-[8.611px] items-center px-[13.778px] py-[6.889px] relative shrink-0 w-[180.833px]">
                                  <p className="font-['Satoshi',sans-serif] font-bold leading-[normal] not-italic relative shrink-0 text-[#070810] text-[12.056px] text-nowrap whitespace-pre">
                                    Submitted by
                                  </p>
                                </div>
                                <div className="h-[30.139px] shrink-0 w-[180.833px]" />
                              </div>
                              {[
                                { date: 'Mar 15, 2023', filename: 'Lease_Agreement.pdf', type: 'Evidence', submitted: "Plaintiff's Counsel" },
                                { date: 'Oct 17, 2025', filename: 'Court_Order_0245.pdf', type: 'Ruling', submitted: "Defendant's Counsel" },
                                { date: 'Oct 28, 2025', filename: 'Gazette_1093.pdf', type: 'Gazette notice', submitted: "Defendant's Counsel" }
                              ].map((doc, idx) => (
                                <div key={idx} className="border-[#e5e8ec] border-[0px_0px_0.344px] border-solid box-border content-stretch flex gap-[10.333px] items-center px-0 py-[10.333px] relative shrink-0 w-full">
                                  <div className="box-border content-stretch flex gap-[8.611px] items-center px-[13.778px] py-[6.889px] relative shrink-0 w-[180.833px]">
                                    <p className="font-['Satoshi',sans-serif] font-normal leading-[normal] not-italic relative shrink-0 text-[#070810] text-[12.056px] text-nowrap whitespace-pre">
                                      {doc.date}
                                    </p>
                                  </div>
                                  <div className="box-border content-stretch flex gap-[8.611px] items-center px-[13.778px] py-[6.889px] relative shrink-0 w-[180.833px]">
                                    <p className="font-['Satoshi',sans-serif] font-normal leading-[normal] not-italic relative shrink-0 text-[#070810] text-[12.056px] text-nowrap whitespace-pre">
                                      {doc.filename}
                                    </p>
                                  </div>
                                  <div className="box-border content-stretch flex gap-[8.611px] items-center px-[13.778px] py-[6.889px] relative shrink-0 w-[180.833px]">
                                    <p className="font-['Satoshi',sans-serif] font-normal leading-[normal] not-italic relative shrink-0 text-[#070810] text-[12.056px] text-nowrap whitespace-pre">
                                      {doc.type}
                                    </p>
                                  </div>
                                  <div className="box-border content-stretch flex gap-[8.611px] items-center px-[13.778px] py-[6.889px] relative shrink-0 w-[180.833px]">
                                    <p className="font-['Satoshi',sans-serif] font-normal leading-[normal] not-italic relative shrink-0 text-[#070810] text-[12.056px] text-nowrap whitespace-pre">
                                      {doc.submitted}
                                    </p>
                                  </div>
                                  <div className="box-border content-stretch flex gap-[8.611px] items-center justify-end px-[13.778px] py-[6.889px] relative shrink-0 w-[180.833px]">
                                    <div className="content-stretch flex items-center relative shrink-0">
                                      <p className="font-['Satoshi',sans-serif] font-bold leading-[normal] not-italic relative shrink-0 text-[#022658] text-[12.056px] text-nowrap whitespace-pre">
                                        View
                                      </p>
                                      <ArrowRight className="overflow-clip relative shrink-0 size-[13.778px] text-[#050f1c]" />
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                          <div className="border-[0.861px] border-amber-500 border-solid box-border content-stretch flex gap-[3.444px] h-[26.694px] items-center px-[13.778px] py-[6.889px] relative rounded-[6.889px] shrink-0">
                            <p className="font-['Satoshi',sans-serif] font-medium leading-[normal] not-italic relative shrink-0 text-[13.778px] text-amber-500 text-nowrap whitespace-pre">
                              Export
                            </p>
                            <ChevronDown className="overflow-clip relative shrink-0 size-[13.778px] text-amber-500" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Banner */}
                  <div className="border-[#d4e1ea] border-[0.861px] border-solid box-border content-stretch flex items-center justify-between p-[13.778px] relative rounded-[6.889px] shrink-0 w-full">
                    <p className="font-['Satoshi',sans-serif] font-medium leading-[normal] not-italic relative shrink-0 text-[#050f1c] text-[13.778px] text-nowrap whitespace-pre">
                      5 more cases scheduled for this week
                    </p>
                    <div className="content-stretch flex items-center relative shrink-0">
                      <p className="font-['Satoshi',sans-serif] font-bold leading-[normal] not-italic relative shrink-0 text-[#022658] text-[13.778px] text-nowrap whitespace-pre">
                        View case diary
                      </p>
                      <ArrowRight className="overflow-clip relative shrink-0 size-[13.778px] text-[#050f1c]" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quality Assurance Section */}
      <div className="bg-[#f7f8fa] h-[1146px] overflow-clip relative shrink-0 w-full">
        <div className="absolute content-stretch flex flex-col gap-[80px] items-center left-[100px] right-[100px] top-[120px]">
          <div className="content-stretch flex flex-col gap-[16px] h-[249px] items-start not-italic relative shrink-0 text-center w-[804px]">
            <p className="font-['Satoshi',sans-serif] font-normal leading-[normal] relative shrink-0 text-[#525866] text-[14px] w-full">
              QUALITY ASSURANCE
            </p>
            <p className="font-['Poppins',sans-serif] font-semibold leading-[72px] relative shrink-0 text-[#070810] text-[48px] w-full">
              <span>Built on Verified Ghanaian Court and </span>
              <span className="text-blue-500">Registry Data</span>
            </p>
            <p className="font-['Poppins',sans-serif] font-normal leading-[normal] relative shrink-0 text-[#070810] text-[18px] w-full">
              Every search returns structured insights drawn from official case records and gazette publications.
            </p>
          </div>
          <div className="content-stretch flex flex-col gap-[40px] items-end relative shrink-0 w-full">
            <div className="content-stretch flex items-center justify-between relative shrink-0 w-full">
              {/* Card 1 - Gazette Sources */}
              <div className="content-stretch flex flex-col gap-[16px] items-start relative shrink-0 w-[402px]">
                <div className="bg-white border border-[#d4e1ea] border-solid overflow-clip relative rounded-[8px] size-full h-[402px] w-[400px]">
                  {/* Tabs */}
                  <div className="absolute box-border content-stretch flex gap-[16px] items-center left-[49px] overflow-auto p-[4px] top-[32px]">
                    <div className="border-[#022658] border-[0px_0px_4px] border-solid box-border content-stretch flex gap-[10px] items-center justify-center pb-[8px] pt-0 px-0 relative shrink-0">
                      <p className="font-['Satoshi',sans-serif] font-bold leading-[normal] not-italic relative shrink-0 text-[#022658] text-[16px] text-nowrap whitespace-pre">
                        Gazette notices
                      </p>
                    </div>
                    <div className="box-border content-stretch flex gap-[10px] items-center justify-center pb-[8px] pt-0 px-0 relative shrink-0">
                      <p className="font-['Satoshi',sans-serif] font-normal leading-[normal] not-italic relative shrink-0 text-[#525866] text-[16px] text-nowrap whitespace-pre">
                        Case list
                      </p>
                    </div>
                    <div className="box-border content-stretch flex gap-[10px] items-center justify-center pb-[8px] pt-0 px-0 relative shrink-0">
                      <p className="font-['Satoshi',sans-serif] font-normal leading-[normal] not-italic relative shrink-0 text-[#525866] text-[16px] text-nowrap whitespace-pre">
                        Risk score
                      </p>
                    </div>
                    <div className="box-border content-stretch flex gap-[10px] items-center justify-center pb-[8px] pt-0 px-0 relative shrink-0">
                      <p className="font-['Satoshi',sans-serif] font-normal leading-[normal] not-italic relative shrink-0 text-[#525866] text-[16px] text-nowrap whitespace-pre">
                        Employment records
                      </p>
                    </div>
          </div>

                  {/* Side Card */}
                  <div className="absolute bg-white border-[#e4e7eb] border-[0.696px] border-solid box-border content-stretch flex flex-col gap-[5.567px] items-center justify-center left-[49px] p-[11.133px] rounded-[5.567px] top-[102px]">
                    <p className="font-['Roboto',sans-serif] font-normal leading-[15.309px] relative shrink-0 text-[#050f1c] text-[11.133px] text-nowrap whitespace-pre">
                      Gazette issue
                    </p>
                    <div className="flex h-[0.527px] items-center justify-center relative shrink-0 w-full bg-[#e4e7eb]"></div>
                    <p className="font-['Roboto',sans-serif] font-normal leading-[15.309px] relative shrink-0 text-[#050f1c] text-[11.133px] text-nowrap whitespace-pre">
                      Publication date
                    </p>
                    <div className="flex h-[0.527px] items-center justify-center relative shrink-0 w-full bg-[#e4e7eb]"></div>
                    <p className="font-['Roboto',sans-serif] font-normal leading-[15.309px] relative shrink-0 text-[#050f1c] text-[11.133px] text-nowrap whitespace-pre">
                      Effective from
                    </p>
                  </div>

                  {/* Gazette Table */}
                  <div className="absolute bg-white border-[#e5e8ec] border-[0.851px] border-solid h-[271.704px] left-[176px] rounded-[11.91px] top-[102px] w-[886.435px]">
                    <div className="content-stretch flex flex-col gap-[3.403px] h-[271.704px] items-start overflow-clip relative rounded-[inherit] w-[886.435px]">
                      {/* Header */}
                      <div className="bg-[#f4f6f9] box-border content-stretch flex gap-[10.208px] items-center px-0 py-[13.611px] relative shrink-0 w-full">
                        <div className="box-border content-stretch flex gap-[8.507px] items-center p-[6.806px] relative shrink-0 w-[115.696px]">
                          <p className="font-['Satoshi',sans-serif] font-bold leading-[normal] not-italic relative shrink-0 text-[#070810] text-[11.91px] text-nowrap whitespace-pre">
                            Notice type
                          </p>
                        </div>
                        <div className="box-border content-stretch flex gap-[8.507px] items-center p-[6.806px] relative shrink-0 w-[238.197px]">
                          <p className="font-['Satoshi',sans-serif] font-bold leading-[normal] not-italic relative shrink-0 text-[#070810] text-[11.91px] text-nowrap whitespace-pre">
                            Description
                          </p>
                        </div>
                        <div className="box-border content-stretch flex gap-[8.507px] items-center p-[6.806px] relative shrink-0 w-[115.696px]">
                          <p className="font-['Satoshi',sans-serif] font-bold leading-[normal] not-italic relative shrink-0 text-[#070810] text-[11.91px] text-nowrap whitespace-pre">
                            Effective date
                          </p>
                        </div>
                        <div className="box-border content-stretch flex gap-[8.507px] items-center p-[6.806px] relative shrink-0 w-[115.696px]">
                          <p className="font-['Satoshi',sans-serif] font-bold leading-[normal] not-italic relative shrink-0 text-[#070810] text-[11.91px] text-nowrap whitespace-pre">
                            Gazette issue
                          </p>
                        </div>
                        <div className="box-border content-stretch flex gap-[8.507px] items-center p-[6.806px] relative shrink-0 w-[115.696px]">
                          <p className="font-['Satoshi',sans-serif] font-bold leading-[normal] not-italic relative shrink-0 text-[#070810] text-[11.91px] text-nowrap whitespace-pre">
                            Publication Date
                          </p>
                        </div>
                      </div>
                      {/* Rows */}
                      {[
                        { type: 'Change of Name', description: 'Name changed from John Kwame Mensah (A.K.A Johnny) to John Kwame Louis', date: 'January 5, 2005', issue: 'Ghana Gazette\nNo. 2, 2005', pubDate: 'January 14, 2005' },
                        { type: 'Correction of Date of Birth', description: 'Date of birth corrected from October 10, 1977 to October 10, 1978', date: 'June 20, 2008', issue: 'Ghana Gazette\nNo. 25, 2008', pubDate: 'June 27, 2008' },
                        { type: 'Correction of Place of Birth', description: 'Place of birth corrected from October 10, Kumasi to Accra', date: 'June 20, 2008', issue: 'Ghana Gazette\nNo. 25, 2008', pubDate: 'June 27, 2008' }
                      ].map((row, idx) => (
                        <div key={idx} className="border-[#e5e8ec] border-[0px_0px_0.34px] border-solid box-border content-stretch flex h-[68.056px] items-center justify-between pl-0 pr-[10.208px] py-[10.208px] relative shrink-0 w-full">
                          <div className="content-stretch flex gap-[10.208px] h-full items-start relative shrink-0">
                            <div className="box-border content-stretch flex gap-[6.806px] h-full items-start p-[6.806px] relative shrink-0 w-[115.696px]">
                              <p className="font-['Satoshi',sans-serif] font-normal leading-[normal] not-italic relative shrink-0 text-[#070810] text-[11.91px] w-[102.085px]">
                                {row.type}
                              </p>
                            </div>
                            <div className="box-border content-stretch flex gap-[8.507px] h-full items-start p-[6.806px] relative shrink-0 w-[238.197px]">
                              <p className="basis-0 font-['Satoshi',sans-serif] font-normal grow leading-[normal] min-h-px min-w-px not-italic relative shrink-0 text-[#070810] text-[11.91px]">
                                {row.description}
                              </p>
                            </div>
                            <div className="box-border content-stretch flex gap-[6.806px] h-full items-start p-[6.806px] relative shrink-0 w-[115.696px]">
                              <p className="font-['Satoshi',sans-serif] font-normal leading-[normal] not-italic relative shrink-0 text-[#070810] text-[11.91px] w-[102.085px]">
                                {row.date}
                              </p>
                            </div>
                            <div className="box-border content-stretch flex gap-[8.507px] h-full items-start p-[6.806px] relative shrink-0 w-[115.696px]">
                              <div className="font-['Satoshi',sans-serif] font-normal leading-[normal] not-italic relative shrink-0 text-[#070810] text-[11.91px] w-[102.085px]">
                                <p className="mb-0">{row.issue.split('\n')[0]}</p>
                                <p>{row.issue.split('\n')[1]}</p>
                              </div>
                            </div>
                            <div className="box-border content-stretch flex gap-[8.507px] h-full items-start p-[6.806px] relative shrink-0 w-[115.696px]">
                              <p className="font-['Satoshi',sans-serif] font-normal leading-[normal] not-italic relative shrink-0 text-[#070810] text-[11.91px] text-nowrap whitespace-pre">
                                {row.pubDate}
                              </p>
                            </div>
                          </div>
                          <div className="content-stretch flex items-center relative shrink-0">
                            <p className="font-['Satoshi',sans-serif] font-bold leading-[normal] not-italic relative shrink-0 text-[#022658] text-[11.91px] text-nowrap whitespace-pre">
                              View
                            </p>
                            <ArrowRight className="overflow-clip relative shrink-0 size-[13.611px] text-[#050f1c]" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="content-stretch flex flex-col gap-[8px] items-start leading-[normal] not-italic relative shrink-0 text-[#070810] w-[340px]">
                  <p className="font-['Poppins',sans-serif] font-medium relative shrink-0 text-[18px] w-full">Verified Court & Gazette Sources</p>
                  <p className="font-['Satoshi',sans-serif] font-normal relative shrink-0 text-[16px] w-full">
                    All information is pulled from official filings and public records you can rely on.
                  </p>
              </div>
            </div>

              {/* Card 2 - Risk Scoring */}
              <div className="content-stretch flex flex-col gap-[16px] items-start relative shrink-0 w-[402px]">
                <div className="bg-white border border-[#d4e1ea] border-solid overflow-clip relative rounded-[8px] size-full h-[402px] w-[400px]">
                  {/* Risk Chart */}
                  <div className="absolute h-[316px] left-0 top-[42px] w-full flex items-center justify-center">
                    <svg width="391" height="316" viewBox="0 0 391 316" fill="none" xmlns="http://www.w3.org/2000/svg" className="max-w-full h-auto">
                      <path d="M88.6498 252.375H86.3954V254.681H84.2964V252.375H82.0419V250.393H84.2964V248.073H86.3954V250.393H88.6498V252.375ZM89.7632 248.514V246.454H93.3522V255.912H91.0459V248.514H89.7632ZM94.8678 251.053C94.8678 249.568 95.1529 248.397 95.723 247.542C96.3017 246.687 97.2303 246.259 98.5087 246.259C99.7871 246.259 100.711 246.687 101.281 247.542C101.86 248.397 102.15 249.568 102.15 251.053C102.15 252.556 101.86 253.735 101.281 254.591C100.711 255.446 99.7871 255.873 98.5087 255.873C97.2303 255.873 96.3017 255.446 95.723 254.591C95.1529 253.735 94.8678 252.556 94.8678 251.053ZM99.9728 251.053C99.9728 250.181 99.8778 249.511 99.6877 249.045C99.4977 248.57 99.1047 248.332 98.5087 248.332C97.9127 248.332 97.5196 248.57 97.3296 249.045C97.1396 249.511 97.0446 250.181 97.0446 251.053C97.0446 251.641 97.0791 252.129 97.1482 252.517C97.2173 252.898 97.3555 253.208 97.5628 253.45C97.7788 253.684 98.0941 253.8 98.5087 253.8C98.9233 253.8 99.2342 253.684 99.4416 253.45C99.6575 253.208 99.8 252.898 99.8691 252.517C99.9382 252.129 99.9728 251.641 99.9728 251.053ZM108.502 249.706C108.718 249.369 109.016 249.097 109.396 248.89C109.776 248.682 110.221 248.579 110.73 248.579C111.326 248.579 111.866 248.73 112.35 249.032C112.834 249.334 113.214 249.766 113.49 250.328C113.775 250.889 113.918 251.541 113.918 252.284C113.918 253.027 113.775 253.684 113.49 254.254C113.214 254.815 112.834 255.251 112.35 255.562C111.866 255.865 111.326 256.016 110.73 256.016C110.229 256.016 109.784 255.912 109.396 255.705C109.016 255.497 108.718 255.23 108.502 254.901V259.359H106.286V248.682H108.502V249.706ZM111.663 252.284C111.663 251.731 111.508 251.3 111.197 250.989C110.894 250.669 110.519 250.509 110.069 250.509C109.629 250.509 109.253 250.669 108.942 250.989C108.64 251.308 108.489 251.744 108.489 252.297C108.489 252.85 108.64 253.286 108.942 253.606C109.253 253.925 109.629 254.085 110.069 254.085C110.51 254.085 110.886 253.925 111.197 253.606C111.508 253.278 111.663 252.837 111.663 252.284ZM118.371 256.016C117.663 256.016 117.023 255.865 116.453 255.562C115.892 255.26 115.447 254.828 115.119 254.267C114.799 253.705 114.639 253.049 114.639 252.297C114.639 251.554 114.804 250.902 115.132 250.341C115.46 249.771 115.909 249.334 116.479 249.032C117.049 248.73 117.689 248.579 118.397 248.579C119.105 248.579 119.744 248.73 120.314 249.032C120.885 249.334 121.334 249.771 121.662 250.341C121.99 250.902 122.154 251.554 122.154 252.297C122.154 253.04 121.986 253.697 121.649 254.267C121.321 254.828 120.867 255.26 120.289 255.562C119.718 255.865 119.079 256.016 118.371 256.016ZM118.371 254.098C118.794 254.098 119.153 253.943 119.446 253.632C119.749 253.321 119.9 252.876 119.9 252.297C119.9 251.718 119.753 251.274 119.459 250.963C119.174 250.652 118.82 250.496 118.397 250.496C117.965 250.496 117.606 250.652 117.321 250.963C117.036 251.265 116.894 251.71 116.894 252.297C116.894 252.876 117.032 253.321 117.308 253.632C117.594 253.943 117.948 254.098 118.371 254.098ZM124.444 247.931C124.055 247.931 123.736 247.818 123.485 247.594C123.243 247.361 123.122 247.076 123.122 246.739C123.122 246.393 123.243 246.108 123.485 245.884C123.736 245.65 124.055 245.534 124.444 245.534C124.824 245.534 125.135 245.65 125.377 245.884C125.627 246.108 125.753 246.393 125.753 246.739C125.753 247.076 125.627 247.361 125.377 247.594C125.135 247.818 124.824 247.931 124.444 247.931ZM125.545 248.682V255.912H123.33V248.682H125.545ZM131.556 248.605C132.403 248.605 133.076 248.881 133.577 249.434C134.087 249.978 134.342 250.729 134.342 251.688V255.912H132.139V251.986C132.139 251.503 132.014 251.127 131.764 250.859C131.513 250.591 131.176 250.457 130.753 250.457C130.33 250.457 129.993 250.591 129.742 250.859C129.492 251.127 129.367 251.503 129.367 251.986V255.912H127.151V248.682H129.367V249.641C129.591 249.321 129.893 249.071 130.273 248.89C130.654 248.7 131.081 248.605 131.556 248.605ZM139.911 254.033V255.912H138.784C137.981 255.912 137.354 255.718 136.905 255.329C136.456 254.932 136.231 254.288 136.231 253.399V250.522H135.35V248.682H136.231V246.92H138.447V248.682H139.898V250.522H138.447V253.424C138.447 253.64 138.499 253.796 138.602 253.891C138.706 253.986 138.879 254.033 139.121 254.033H139.911ZM144.086 256.016C143.456 256.016 142.894 255.908 142.402 255.692C141.91 255.476 141.521 255.182 141.236 254.811C140.951 254.431 140.791 254.007 140.756 253.541H142.946C142.972 253.792 143.089 253.995 143.296 254.15C143.503 254.305 143.758 254.383 144.06 254.383C144.337 254.383 144.548 254.331 144.695 254.228C144.851 254.115 144.929 253.973 144.929 253.8C144.929 253.593 144.821 253.442 144.605 253.347C144.389 253.243 144.039 253.131 143.555 253.01C143.037 252.889 142.605 252.764 142.259 252.634C141.914 252.496 141.616 252.284 141.365 251.999C141.115 251.705 140.99 251.312 140.99 250.82C140.99 250.406 141.102 250.03 141.327 249.693C141.56 249.347 141.897 249.075 142.337 248.877C142.786 248.678 143.318 248.579 143.931 248.579C144.838 248.579 145.55 248.803 146.069 249.252C146.596 249.702 146.898 250.298 146.976 251.04H144.929C144.894 250.79 144.782 250.591 144.592 250.444C144.41 250.298 144.168 250.224 143.866 250.224C143.607 250.224 143.408 250.276 143.27 250.38C143.132 250.475 143.063 250.608 143.063 250.781C143.063 250.989 143.171 251.144 143.387 251.248C143.611 251.351 143.957 251.455 144.423 251.559C144.959 251.697 145.395 251.835 145.732 251.973C146.069 252.103 146.362 252.319 146.613 252.621C146.872 252.915 147.006 253.312 147.015 253.813C147.015 254.236 146.894 254.616 146.652 254.953C146.419 255.282 146.077 255.541 145.628 255.731C145.188 255.921 144.674 256.016 144.086 256.016Z" fill="#3B82F6"/>
                      <path d="M87.016 266.854H85.3345V266.105H87.8106V274.352H87.016V266.854ZM94.4022 274.49C93.2159 274.49 92.5134 273.822 92.5134 272.843C92.5134 271.818 93.2965 271.173 94.598 271.069L96.4407 270.919V270.735C96.4407 269.641 95.7842 269.296 94.9665 269.296C93.9991 269.296 93.4232 269.733 93.4232 270.482H92.6977C92.6977 269.353 93.619 268.628 94.9896 268.628C96.2795 268.628 97.2239 269.273 97.2239 270.747V274.352H96.5559L96.4522 273.373C96.1067 274.075 95.3466 274.49 94.4022 274.49ZM94.5865 273.845C95.7612 273.845 96.4407 273.027 96.4407 271.818V271.518L94.7938 271.645C93.7457 271.737 93.3196 272.198 93.3196 272.82C93.3196 273.499 93.8263 273.845 94.5865 273.845ZM98.427 271.576C98.427 269.825 99.498 268.628 101.122 268.628C102.412 268.628 103.356 269.376 103.575 270.528H102.78C102.573 269.756 101.905 269.33 101.133 269.33C100.005 269.33 99.2101 270.194 99.2101 271.564C99.2101 272.889 99.9472 273.776 101.076 273.776C101.905 273.776 102.573 273.315 102.792 272.601H103.598C103.333 273.741 102.343 274.49 101.076 274.49C99.498 274.49 98.427 273.327 98.427 271.576ZM106.08 274.352H105.297V269.445H104.18V268.777H105.297V267.015H106.08V268.777H107.198V269.445H106.08V274.352ZM108.624 267.246C108.302 267.246 108.037 266.981 108.037 266.658C108.037 266.336 108.302 266.059 108.624 266.059C108.946 266.059 109.223 266.336 109.223 266.658C109.223 266.981 108.946 267.246 108.624 267.246ZM108.232 274.352V268.777H109.027V274.352H108.232ZM112.239 274.352L109.959 268.777H110.811L112.251 272.371C112.4 272.774 112.55 273.154 112.654 273.522C112.757 273.142 112.907 272.774 113.068 272.371L114.531 268.777H115.349L113.034 274.352H112.239ZM118.376 274.49C116.74 274.49 115.646 273.315 115.646 271.564C115.646 269.825 116.729 268.628 118.318 268.628C119.827 268.628 120.852 269.699 120.852 271.277V271.668H116.418C116.476 273.027 117.19 273.81 118.387 273.81C119.297 273.81 119.885 273.419 120.092 272.682H120.852C120.553 273.856 119.689 274.49 118.376 274.49ZM118.318 269.307C117.27 269.307 116.579 269.998 116.441 271.092H120.057C120.057 270.021 119.366 269.307 118.318 269.307ZM124.925 271.576C124.925 269.825 125.996 268.628 127.62 268.628C128.91 268.628 129.855 269.376 130.073 270.528H129.279C129.071 269.756 128.403 269.33 127.632 269.33C126.503 269.33 125.708 270.194 125.708 271.564C125.708 272.889 126.446 273.776 127.574 273.776C128.403 273.776 129.071 273.315 129.29 272.601H130.096C129.832 273.741 128.841 274.49 127.574 274.49C125.996 274.49 124.925 273.327 124.925 271.576ZM132.901 274.49C131.715 274.49 131.012 273.822 131.012 272.843C131.012 271.818 131.796 271.173 133.097 271.069L134.94 270.919V270.735C134.94 269.641 134.283 269.296 133.466 269.296C132.498 269.296 131.922 269.733 131.922 270.482H131.197C131.197 269.353 132.118 268.628 133.489 268.628C134.778 268.628 135.723 269.273 135.723 270.747V274.352H135.055L134.951 273.373C134.606 274.075 133.846 274.49 132.901 274.49ZM133.085 273.845C134.26 273.845 134.94 273.027 134.94 271.818V271.518L133.293 271.645C132.245 271.737 131.819 272.198 131.819 272.82C131.819 273.499 132.325 273.845 133.085 273.845ZM136.845 272.785H137.605C137.605 273.43 138.089 273.833 138.872 273.833C139.736 273.833 140.243 273.465 140.243 272.866C140.243 272.405 140.013 272.14 139.356 271.979L138.4 271.737C137.433 271.495 136.961 270.989 136.961 270.228C136.961 269.249 137.778 268.628 138.976 268.628C140.151 268.628 140.911 269.273 140.945 270.309H140.174C140.151 269.664 139.702 269.284 138.953 269.284C138.17 269.284 137.732 269.618 137.732 270.217C137.732 270.643 138.032 270.943 138.642 271.092L139.598 271.334C140.565 271.576 141.003 272.025 141.003 272.831C141.003 273.833 140.151 274.49 138.884 274.49C137.629 274.49 136.845 273.822 136.845 272.785ZM144.649 274.49C143.014 274.49 141.92 273.315 141.92 271.564C141.92 269.825 143.002 268.628 144.592 268.628C146.1 268.628 147.125 269.699 147.125 271.277V271.668H142.691C142.749 273.027 143.463 273.81 144.661 273.81C145.571 273.81 146.158 273.419 146.365 272.682H147.125C146.826 273.856 145.962 274.49 144.649 274.49ZM144.592 269.307C143.544 269.307 142.853 269.998 142.714 271.092H146.331C146.331 270.021 145.64 269.307 144.592 269.307ZM82.5481 292.16H81.8225C80.855 290.835 80.2216 288.877 80.2216 286.896C80.2216 284.996 80.832 283.015 81.8225 281.645H82.5481C81.6612 282.888 81.0393 284.823 81.0393 286.896C81.0393 288.923 81.6382 290.893 82.5481 292.16ZM82.9846 287.564C82.9846 285.86 84.1824 284.628 85.8178 284.628C87.4532 284.628 88.651 285.86 88.651 287.564C88.651 289.257 87.4532 290.49 85.8178 290.49C84.1824 290.49 82.9846 289.257 82.9846 287.564ZM83.7908 287.553C83.7908 288.866 84.62 289.776 85.8178 289.776C87.0041 289.776 87.8448 288.866 87.8448 287.553C87.8448 286.263 87.0041 285.342 85.8178 285.342C84.62 285.342 83.7908 286.263 83.7908 287.553ZM90.7167 290.352H89.922V284.777H90.6131L90.7282 285.745C91.0968 285.031 91.8339 284.628 92.6401 284.628C94.1718 284.628 94.8053 285.537 94.8053 286.943V290.352H94.0106V287.115C94.0106 285.814 93.4232 285.353 92.5019 285.353C91.3617 285.353 90.7167 286.182 90.7167 287.438V290.352ZM96.0091 287.403C96.0091 285.883 96.988 284.628 98.6235 284.628C99.5909 284.628 100.328 285.077 100.685 285.894L100.766 284.777H101.457V290.179C101.457 291.837 100.397 292.92 98.7617 292.92C97.3336 292.92 96.3316 292.114 96.1127 290.766H96.9074C97.0802 291.665 97.7712 292.194 98.7732 292.194C99.9134 292.194 100.674 291.423 100.674 290.259V288.935C100.293 289.718 99.5218 290.179 98.5659 290.179C96.9765 290.179 96.0091 288.923 96.0091 287.403ZM96.8038 287.392C96.8038 288.532 97.5063 289.465 98.6811 289.465C99.8903 289.465 100.604 288.589 100.604 287.392C100.604 286.205 99.9134 285.33 98.6926 285.33C97.4948 285.33 96.8038 286.263 96.8038 287.392ZM102.723 287.564C102.723 285.86 103.921 284.628 105.557 284.628C107.192 284.628 108.39 285.86 108.39 287.564C108.39 289.257 107.192 290.49 105.557 290.49C103.921 290.49 102.723 289.257 102.723 287.564ZM103.53 287.553C103.53 288.866 104.359 289.776 105.557 289.776C106.743 289.776 107.584 288.866 107.584 287.553C107.584 286.263 106.743 285.342 105.557 285.342C104.359 285.342 103.53 286.263 103.53 287.553ZM110.052 283.246C109.73 283.246 109.465 282.981 109.465 282.658C109.465 282.336 109.73 282.059 110.052 282.059C110.375 282.059 110.651 282.336 110.651 282.658C110.651 282.981 110.375 283.246 110.052 283.246ZM109.661 290.352V284.777H110.455V290.352H109.661ZM112.907 290.352H112.113V284.777H112.804L112.919 285.745C113.287 285.031 114.025 284.628 114.831 284.628C116.362 284.628 116.996 285.537 116.996 286.943V290.352H116.201V287.115C116.201 285.814 115.614 285.353 114.693 285.353C113.552 285.353 112.907 286.182 112.907 287.438V290.352ZM118.2 287.403C118.2 285.883 119.179 284.628 120.814 284.628C121.782 284.628 122.519 285.077 122.876 285.894L122.956 284.777H123.647V290.179C123.647 291.837 122.588 292.92 120.952 292.92C119.524 292.92 118.522 292.114 118.303 290.766H119.098C119.271 291.665 119.962 292.194 120.964 292.194C122.104 292.194 122.864 291.423 122.864 290.259V288.935C122.484 289.718 121.712 290.179 120.757 290.179C119.167 290.179 118.2 288.923 118.2 287.403ZM118.994 287.392C118.994 288.532 119.697 289.465 120.872 289.465C122.081 289.465 122.795 288.589 122.795 287.392C122.795 286.205 122.104 285.33 120.883 285.33C119.685 285.33 118.994 286.263 118.994 287.392ZM131.414 284.708V285.422H130.976C129.951 285.422 129.294 286.113 129.294 287.173V290.352H128.5V284.777H129.248L129.306 285.641C129.525 285.042 130.112 284.651 130.895 284.651C131.068 284.651 131.218 284.662 131.414 284.708ZM132.862 283.246C132.539 283.246 132.274 282.981 132.274 282.658C132.274 282.336 132.539 282.059 132.862 282.059C133.184 282.059 133.46 282.336 133.46 282.658C133.46 282.981 133.184 283.246 132.862 283.246ZM132.47 290.352V284.777H133.265V290.352H132.47ZM134.45 288.785H135.21C135.21 289.43 135.694 289.833 136.477 289.833C137.34 289.833 137.847 289.465 137.847 288.866C137.847 288.405 137.617 288.14 136.96 287.979L136.005 287.737C135.037 287.495 134.565 286.989 134.565 286.228C134.565 285.249 135.383 284.628 136.58 284.628C137.755 284.628 138.515 285.273 138.55 286.309H137.778C137.755 285.664 137.306 285.284 136.557 285.284C135.774 285.284 135.337 285.618 135.337 286.217C135.337 286.643 135.636 286.943 136.246 287.092L137.202 287.334C138.17 287.576 138.607 288.025 138.607 288.831C138.607 289.833 137.755 290.49 136.488 290.49C135.233 290.49 134.45 289.822 134.45 288.785ZM140.745 290.352H139.95V281.956H140.745V287.657L143.509 284.777H144.511L142.369 287L144.522 290.352H143.601L141.827 287.564L140.745 288.682V290.352ZM145.368 292.16H144.643C145.552 290.893 146.163 288.923 146.163 286.896C146.163 284.823 145.529 282.888 144.643 281.645H145.368C146.37 283.015 146.969 284.996 146.969 286.896C146.969 288.877 146.336 290.835 145.368 292.16Z" fill="#050F1C"/>
                      <path d="M94.4013 135.127H92.1468V137.433H90.0478V135.127H87.7934V133.144H90.0478V130.825H92.1468V133.144H94.4013V135.127ZM95.5146 131.266V129.206H99.1037V138.664H96.7974V131.266H95.5146ZM100.619 133.805C100.619 132.32 100.904 131.149 101.474 130.294C102.053 129.439 102.982 129.011 104.26 129.011C105.539 129.011 106.463 129.439 107.033 130.294C107.612 131.149 107.901 132.32 107.901 133.805C107.901 135.308 107.612 136.487 107.033 137.342C106.463 138.198 105.539 138.625 104.26 138.625C102.982 138.625 102.053 138.198 101.474 137.342C100.904 136.487 100.619 135.308 100.619 133.805ZM105.724 133.805C105.724 132.933 105.629 132.263 105.439 131.797C105.249 131.322 104.856 131.084 104.26 131.084C103.664 131.084 103.271 131.322 103.081 131.797C102.891 132.263 102.796 132.933 102.796 133.805C102.796 134.393 102.831 134.881 102.9 135.269C102.969 135.649 103.107 135.96 103.314 136.202C103.53 136.436 103.846 136.552 104.26 136.552C104.675 136.552 104.986 136.436 105.193 136.202C105.409 135.96 105.551 135.649 105.621 135.269C105.69 134.881 105.724 134.393 105.724 133.805ZM114.253 132.458C114.469 132.121 114.767 131.849 115.147 131.642C115.527 131.434 115.972 131.331 116.482 131.331C117.078 131.331 117.618 131.482 118.101 131.784C118.585 132.086 118.965 132.518 119.241 133.08C119.526 133.641 119.669 134.293 119.669 135.036C119.669 135.779 119.526 136.436 119.241 137.006C118.965 137.567 118.585 138.003 118.101 138.314C117.618 138.617 117.078 138.768 116.482 138.768C115.981 138.768 115.536 138.664 115.147 138.457C114.767 138.249 114.469 137.982 114.253 137.653V142.111H112.038V131.434H114.253V132.458ZM117.415 135.036C117.415 134.483 117.259 134.051 116.948 133.741C116.646 133.421 116.27 133.261 115.821 133.261C115.38 133.261 115.005 133.421 114.694 133.741C114.391 134.06 114.24 134.496 114.24 135.049C114.24 135.602 114.391 136.038 114.694 136.358C115.005 136.677 115.38 136.837 115.821 136.837C116.261 136.837 116.637 136.677 116.948 136.358C117.259 136.03 117.415 135.589 117.415 135.036ZM124.122 138.768C123.414 138.768 122.775 138.617 122.205 138.314C121.643 138.012 121.198 137.58 120.87 137.019C120.551 136.457 120.391 135.801 120.391 135.049C120.391 134.306 120.555 133.654 120.883 133.093C121.211 132.523 121.661 132.086 122.231 131.784C122.801 131.482 123.44 131.331 124.148 131.331C124.857 131.331 125.496 131.482 126.066 131.784C126.636 132.086 127.085 132.523 127.413 133.093C127.742 133.654 127.906 134.306 127.906 135.049C127.906 135.792 127.737 136.448 127.4 137.019C127.072 137.58 126.619 138.012 126.04 138.314C125.47 138.617 124.831 138.768 124.122 138.768ZM124.122 136.85C124.546 136.85 124.904 136.695 125.198 136.384C125.5 136.073 125.651 135.628 125.651 135.049C125.651 134.47 125.504 134.026 125.211 133.715C124.926 133.404 124.572 133.248 124.148 133.248C123.716 133.248 123.358 133.404 123.073 133.715C122.788 134.017 122.645 134.462 122.645 135.049C122.645 135.628 122.784 136.073 123.06 136.384C123.345 136.695 123.699 136.85 124.122 136.85ZM130.195 130.683C129.807 130.683 129.487 130.57 129.237 130.346C128.995 130.113 128.874 129.828 128.874 129.491C128.874 129.145 128.995 128.86 129.237 128.636C129.487 128.402 129.807 128.286 130.195 128.286C130.575 128.286 130.886 128.402 131.128 128.636C131.379 128.86 131.504 129.145 131.504 129.491C131.504 129.828 131.379 130.113 131.128 130.346C130.886 130.57 130.575 130.683 130.195 130.683ZM131.297 131.434V138.664H129.081V131.434H131.297ZM137.308 131.356C138.154 131.356 138.828 131.633 139.329 132.186C139.839 132.73 140.093 133.481 140.093 134.44V138.664H137.891V134.738C137.891 134.254 137.765 133.879 137.515 133.611C137.264 133.343 136.928 133.209 136.504 133.209C136.081 133.209 135.744 133.343 135.494 133.611C135.243 133.879 135.118 134.254 135.118 134.738V138.664H132.902V131.434H135.118V132.393C135.343 132.073 135.645 131.823 136.025 131.642C136.405 131.451 136.833 131.356 137.308 131.356ZM145.663 136.785V138.664H144.535C143.732 138.664 143.106 138.47 142.657 138.081C142.207 137.684 141.983 137.04 141.983 136.15V133.274H141.102V131.434H141.983V129.672H144.198V131.434H145.65V133.274H144.198V136.176C144.198 136.392 144.25 136.548 144.354 136.643C144.458 136.738 144.63 136.785 144.872 136.785H145.663ZM149.838 138.768C149.207 138.768 148.646 138.66 148.153 138.444C147.661 138.228 147.272 137.934 146.987 137.563C146.702 137.183 146.542 136.759 146.508 136.293H148.698C148.724 136.543 148.84 136.746 149.047 136.902C149.255 137.057 149.51 137.135 149.812 137.135C150.088 137.135 150.3 137.083 150.447 136.98C150.602 136.867 150.68 136.725 150.68 136.552C150.68 136.345 150.572 136.194 150.356 136.099C150.14 135.995 149.79 135.883 149.307 135.762C148.788 135.641 148.356 135.516 148.011 135.386C147.665 135.248 147.367 135.036 147.117 134.751C146.866 134.457 146.741 134.064 146.741 133.572C146.741 133.157 146.853 132.782 147.078 132.445C147.311 132.099 147.648 131.827 148.089 131.629C148.538 131.43 149.069 131.331 149.682 131.331C150.589 131.331 151.302 131.555 151.82 132.004C152.347 132.453 152.649 133.049 152.727 133.792H150.68C150.645 133.542 150.533 133.343 150.343 133.196C150.162 133.049 149.92 132.976 149.618 132.976C149.358 132.976 149.16 133.028 149.022 133.132C148.883 133.227 148.814 133.36 148.814 133.533C148.814 133.741 148.922 133.896 149.138 134C149.363 134.103 149.708 134.207 150.175 134.311C150.71 134.449 151.146 134.587 151.483 134.725C151.82 134.855 152.114 135.071 152.364 135.373C152.624 135.667 152.757 136.064 152.766 136.565C152.766 136.988 152.645 137.368 152.403 137.705C152.17 138.034 151.829 138.293 151.38 138.483C150.939 138.673 150.425 138.768 149.838 138.768Z" fill="#10B981"/>
                      <path d="M39.447 49.3655C37.5467 49.3655 36.3489 50.7706 36.3489 52.8782C36.3489 55.0204 37.6158 56.3218 39.47 56.3218C40.8521 56.3218 42.1996 55.6538 42.1996 53.6729V53.2468H39.2167V52.5097H42.9827V56.9783H42.3263L42.2456 55.6654C41.808 56.4831 40.7715 57.105 39.4355 57.105C37.0975 57.105 35.4851 55.4235 35.4851 52.8782C35.4851 50.356 37.0975 48.5824 39.4585 48.5824C41.1976 48.5824 42.5451 49.5728 42.8676 51.07H41.9692C41.6237 49.9414 40.6563 49.3655 39.447 49.3655ZM45.4589 56.9668H44.6297V48.7206H45.4589V52.3945H49.916V48.7206H50.7337V56.9668H49.916V53.1662H45.4589V56.9668ZM52.2549 50.8627C52.2549 49.4807 53.3605 48.5708 55.019 48.5708C56.5047 48.5708 57.4837 49.4001 57.6103 50.7821H56.7696C56.6775 49.8492 56.044 49.3195 55.0075 49.3195C53.8443 49.3195 53.0841 49.9183 53.0841 50.8512C53.0841 51.5768 53.5103 52.0375 54.374 52.2563L55.7906 52.6018C57.0806 52.9128 57.7485 53.6499 57.7485 54.767C57.7485 56.1952 56.6429 57.105 54.9384 57.105C53.3375 57.105 52.2549 56.2643 52.1512 54.9168H53.0035C53.0496 55.7805 53.8097 56.3449 54.9384 56.3449C56.1477 56.3449 56.9193 55.7575 56.9193 54.8131C56.9193 54.076 56.5047 53.5923 55.6179 53.385L54.2243 53.0395C52.9344 52.7285 52.2549 51.9914 52.2549 50.8627ZM63.5165 49.4692H61.835V48.7206H64.3112V56.9668H63.5165V49.4692ZM65.8433 54.721C65.8433 53.7075 66.4538 52.9013 67.4327 52.5673C66.6035 52.2333 66.1313 51.5538 66.1313 50.7015C66.1313 49.4346 67.2139 48.5708 68.7917 48.5708C70.358 48.5708 71.4061 49.4346 71.4061 50.713C71.4061 51.5768 70.9454 52.2563 70.1277 52.5673C71.0836 52.8667 71.7171 53.6959 71.7171 54.7325C71.7171 56.1376 70.5308 57.105 68.7802 57.105C67.0296 57.105 65.8433 56.1376 65.8433 54.721ZM66.9144 50.7245C66.9144 51.6344 67.6515 52.2448 68.7802 52.2448C69.8974 52.2448 70.6229 51.6574 70.6229 50.7476C70.6229 49.8608 69.8974 49.3079 68.7802 49.3079C67.6515 49.3079 66.9144 49.8608 66.9144 50.7245ZM66.6611 54.6519C66.6611 55.6769 67.5133 56.3564 68.7917 56.3564C70.0471 56.3564 70.8993 55.6769 70.8993 54.6519C70.8993 53.6384 70.0701 52.9819 68.7687 52.9819C67.4903 52.9819 66.6611 53.6384 66.6611 54.6519ZM75.6366 57.105C73.9782 57.105 72.9186 56.0685 72.9186 54.4446H73.7478C73.7478 55.6308 74.4734 56.3449 75.6482 56.3449C76.892 56.3449 77.6982 55.5156 77.6982 54.2948C77.6982 53.1431 76.9496 52.2333 75.6482 52.2333C74.888 52.2333 74.197 52.5788 73.7478 53.074L73.0914 52.8667L74.0818 48.7206H78.0668V49.4807H74.6807L74.0588 52.072C74.5195 51.7035 75.1184 51.4962 75.7633 51.4962C77.4794 51.4962 78.539 52.7285 78.539 54.2718C78.539 55.9303 77.3642 57.105 75.6366 57.105ZM80.9419 56.5752C80.9419 57.2893 80.3891 57.9112 79.675 58.0149V57.5887C80.0896 57.5196 80.3891 57.2202 80.3891 56.8977C80.32 56.9438 80.2278 56.9783 80.0896 56.9783C79.7671 56.9783 79.4907 56.748 79.4907 56.3564C79.4907 55.9533 79.7671 55.6654 80.1702 55.6654C80.5849 55.6654 80.9419 55.9994 80.9419 56.5752ZM81.8266 52.8437C81.8266 50.2869 83.082 48.5593 85.132 48.5593C87.1706 48.5593 88.4259 50.2869 88.4259 52.8437C88.4259 55.412 87.1936 57.1165 85.132 57.1165C83.059 57.1165 81.8266 55.412 81.8266 52.8437ZM82.6443 52.8437C82.6443 54.9859 83.5542 56.3679 85.132 56.3679C86.7099 56.3679 87.6197 54.9859 87.6197 52.8437C87.6197 50.69 86.7099 49.3195 85.132 49.3195C83.5542 49.3195 82.6443 50.69 82.6443 52.8437ZM89.6884 52.8437C89.6884 50.2869 90.9437 48.5593 92.9938 48.5593C95.0323 48.5593 96.2877 50.2869 96.2877 52.8437C96.2877 55.412 95.0553 57.1165 92.9938 57.1165C90.9207 57.1165 89.6884 55.412 89.6884 52.8437ZM90.5061 52.8437C90.5061 54.9859 91.4159 56.3679 92.9938 56.3679C94.5716 56.3679 95.4815 54.9859 95.4815 52.8437C95.4815 50.69 94.5716 49.3195 92.9938 49.3195C91.4159 49.3195 90.5061 50.69 90.5061 52.8437ZM97.5501 52.8437C97.5501 50.2869 98.8055 48.5593 100.856 48.5593C102.894 48.5593 104.149 50.2869 104.149 52.8437C104.149 55.412 102.917 57.1165 100.856 57.1165C98.7825 57.1165 97.5501 55.412 97.5501 52.8437ZM98.3679 52.8437C98.3679 54.9859 99.2777 56.3679 100.856 56.3679C102.433 56.3679 103.343 54.9859 103.343 52.8437C103.343 50.69 102.433 49.3195 100.856 49.3195C99.2777 49.3195 98.3679 50.69 98.3679 52.8437ZM110.08 56.9668H109.297V52.0605H108.18V51.3925H109.297V49.6304H110.08V51.3925H111.197V52.0605H110.08V56.9668ZM111.784 54.1797C111.784 52.4751 112.982 51.2428 114.618 51.2428C116.253 51.2428 117.451 52.4751 117.451 54.1797C117.451 55.8727 116.253 57.105 114.618 57.105C112.982 57.105 111.784 55.8727 111.784 54.1797ZM112.591 54.1681C112.591 55.4811 113.42 56.3909 114.618 56.3909C115.804 56.3909 116.645 55.4811 116.645 54.1681C116.645 52.8782 115.804 51.9569 114.618 51.9569C113.42 51.9569 112.591 52.8782 112.591 54.1681ZM119.944 56.9668H119.161V52.0605H118.044V51.3925H119.161V49.6304H119.944V51.3925H121.061V52.0605H119.944V56.9668ZM123.607 57.105C122.421 57.105 121.718 56.437 121.718 55.4581C121.718 54.433 122.501 53.7881 123.803 53.6844L125.645 53.5347V53.3504C125.645 52.2563 124.989 51.9108 124.171 51.9108C123.204 51.9108 122.628 52.3484 122.628 53.0971H121.902C121.902 51.9684 122.824 51.2428 124.194 51.2428C125.484 51.2428 126.429 51.8878 126.429 53.3619V56.9668H125.761L125.657 55.9878C125.311 56.6904 124.551 57.105 123.607 57.105ZM123.791 56.46C124.966 56.46 125.645 55.6423 125.645 54.433V54.1336L123.998 54.2603C122.95 54.3524 122.524 54.8131 122.524 55.435C122.524 56.1145 123.031 56.46 123.791 56.46ZM128.852 56.9668H128.058V48.5708H128.852V56.9668ZM136.075 57.105C134.439 57.105 133.345 55.9303 133.345 54.1797C133.345 52.4406 134.428 51.2428 136.017 51.2428C137.526 51.2428 138.551 52.3139 138.551 53.8917V54.2833H134.117C134.174 55.6423 134.889 56.4255 136.086 56.4255C136.996 56.4255 137.584 56.0339 137.791 55.2968H138.551C138.252 56.4716 137.388 57.105 136.075 57.105ZM136.017 51.9223C134.969 51.9223 134.278 52.6133 134.14 53.7075H137.756C137.756 52.6364 137.065 51.9223 136.017 51.9223ZM139.849 56.9668H138.916L140.909 54.1797L138.928 51.3925H139.861L141.439 53.6268L143.005 51.3925H143.926L141.945 54.1912L143.915 56.9668H142.97L141.404 54.7325L139.849 56.9668ZM144.871 59.3969V51.3925H145.563L145.643 52.5212C146.035 51.6574 146.818 51.2428 147.751 51.2428C149.363 51.2428 150.331 52.4751 150.331 54.1566C150.331 55.8381 149.398 57.105 147.751 57.105C146.806 57.105 146.058 56.7019 145.666 55.8957V59.3969H144.871ZM145.678 54.1797C145.678 55.4581 146.392 56.3909 147.613 56.3909C148.822 56.3909 149.524 55.4581 149.524 54.1797C149.524 52.8897 148.822 51.9684 147.613 51.9684C146.392 51.9684 145.678 52.8897 145.678 54.1797ZM151.206 54.1797C151.206 52.4751 152.403 51.2428 154.039 51.2428C155.674 51.2428 156.872 52.4751 156.872 54.1797C156.872 55.8727 155.674 57.105 154.039 57.105C152.403 57.105 151.206 55.8727 151.206 54.1797ZM152.012 54.1681C152.012 55.4811 152.841 56.3909 154.039 56.3909C155.225 56.3909 156.066 55.4811 156.066 54.1681C156.066 52.8782 155.225 51.9569 154.039 51.9569C152.841 51.9569 152.012 52.8782 152.012 54.1681ZM157.671 55.4005H158.431C158.431 56.0454 158.915 56.4485 159.698 56.4485C160.562 56.4485 161.068 56.08 161.068 55.4811C161.068 55.0204 160.838 54.7555 160.182 54.5943L159.226 54.3524C158.258 54.1106 157.786 53.6038 157.786 52.8437C157.786 51.8647 158.604 51.2428 159.802 51.2428C160.976 51.2428 161.736 51.8878 161.771 52.9243H160.999C160.976 52.2793 160.527 51.8993 159.779 51.8993C158.995 51.8993 158.558 52.2333 158.558 52.8322C158.558 53.2583 158.857 53.5577 159.468 53.7075L160.424 53.9493C161.391 54.1912 161.829 54.6403 161.829 55.4465C161.829 56.4485 160.976 57.105 159.709 57.105C158.454 57.105 157.671 56.437 157.671 55.4005ZM167.053 51.3925H167.847V56.9668H167.156L167.053 56.0224C166.742 56.6674 165.97 57.105 165.095 57.105C163.782 57.105 163.068 56.2067 163.068 54.8477V51.381H163.874V54.5943C163.874 55.9187 164.461 56.3909 165.348 56.3909C166.419 56.3909 167.053 55.6769 167.053 54.3524V51.3925ZM172.417 51.3234V52.0375H171.979C170.954 52.0375 170.297 52.7285 170.297 53.7881V56.9668H169.503V51.3925H170.251L170.309 52.2563C170.528 51.6574 171.115 51.2658 171.898 51.2658C172.071 51.2658 172.221 51.2774 172.417 51.3234ZM175.597 57.105C173.962 57.105 172.868 55.9303 172.868 54.1797C172.868 52.4406 173.95 51.2428 175.54 51.2428C177.048 51.2428 178.073 52.3139 178.073 53.8917V54.2833H173.639C173.697 55.6423 174.411 56.4255 175.609 56.4255C176.519 56.4255 177.106 56.0339 177.313 55.2968H178.073C177.774 56.4716 176.91 57.105 175.597 57.105ZM175.54 51.9223C174.492 51.9223 173.801 52.6133 173.662 53.7075H177.279C177.279 52.6364 176.588 51.9223 175.54 51.9223ZM176.316 74.775H175.591C176.5 73.5081 177.111 71.5387 177.111 69.5117C177.111 67.4386 176.477 65.5037 175.591 64.2599H176.316C177.318 65.6304 177.917 67.6114 177.917 69.5117C177.917 71.4926 177.284 73.4505 176.316 74.775Z" fill="#050F1C"/>
                      <g filter="url(#filter0_d_412_33412)">
                        <circle cx="341.189" cy="151.883" r="122.369" fill="white"/>
                      </g>
                      <g clipPath="url(#clip0_412_33412)">
                        <path d="M438.273 152.163C444.28 152.163 449.206 147.281 448.601 141.305C447.291 128.38 443.649 115.768 437.823 104.09C430.374 89.1604 419.557 76.1657 406.226 66.1319C392.895 56.098 377.414 49.2995 361.006 46.2728C348.172 43.9054 335.045 43.8962 322.262 46.2139C316.352 47.2856 313.024 53.3705 314.686 59.1428L321.896 84.1785C323.558 89.9507 329.595 93.1756 335.573 92.5836C341.147 92.0315 346.79 92.2627 352.334 93.2854C361.457 94.9683 370.065 98.7485 377.477 104.328C384.889 109.907 390.904 117.132 395.046 125.433C397.563 130.478 399.346 135.836 400.358 141.346C401.444 147.254 406.213 152.163 412.22 152.163H438.273Z" fill="#D4E1EA"/>
                        <path d="M308.688 61.0837C306.654 55.4318 300.392 52.45 294.974 55.044C283.064 60.7463 272.303 68.592 263.231 78.1873C259.104 82.5521 260.028 89.426 264.787 93.0916L285.426 108.99C290.185 112.656 296.959 111.677 301.424 107.659C304.476 104.913 307.803 102.487 311.352 100.421C316.543 97.3989 319.547 91.2488 317.512 85.5969L308.688 61.0837Z" fill="#10B981"/>
                        <path d="M261.163 98.121C256.179 94.7675 249.367 96.0674 246.533 101.364C240.842 112 236.966 123.541 235.092 135.51C233.219 147.479 233.382 159.652 235.551 171.518C236.631 177.427 242.72 180.747 248.49 179.077L273.516 171.833C279.286 170.163 282.502 164.122 281.902 158.145C281.394 153.082 281.531 147.96 282.323 142.903C283.115 137.847 284.549 132.928 286.58 128.262C288.978 122.755 287.762 116.019 282.778 112.666L261.163 98.121Z" fill="#3B82F6"/>
                        <path d="M250.437 185.066C244.788 187.108 241.814 193.374 244.415 198.789C252.08 214.745 263.589 228.618 277.975 239.123C292.361 249.628 309.08 256.365 326.612 258.809C332.561 259.638 337.625 254.897 337.849 248.895L338.825 222.86C339.05 216.857 334.323 211.907 328.459 210.602C320.451 208.818 312.855 205.399 306.167 200.515C299.478 195.631 293.908 189.437 289.771 182.351C286.742 177.164 280.588 174.169 274.939 176.211L250.437 185.066Z" fill="#3B82F6"/>
                        <path d="M343.829 248.934C343.975 254.939 348.976 259.745 354.936 258.994C378.088 256.077 399.777 245.696 416.628 229.272C433.48 212.848 444.414 191.432 447.924 168.362C448.828 162.424 444.151 157.301 438.152 157.001L412.132 155.699C406.132 155.399 401.124 160.063 399.744 165.909C397.148 176.916 391.466 187.041 383.261 195.037C375.057 203.034 364.79 208.454 353.72 210.767C347.84 211.996 343.049 216.883 343.195 222.889L343.829 248.934Z" fill="#D4E1EA"/>
                      </g>
                      <path d="M178.508 38.8691H242.484L269.205 59.7439" stroke="#B1B9C6" strokeWidth="1.43964" strokeDasharray="1.44 1.44"/>
                      <path d="M155.477 254.096H224.939L265.249 237.54" stroke="#B1B9C6" strokeWidth="1.43964" strokeDasharray="1.44 1.44"/>
                      <path d="M159.797 134.605H197.754H230.339" stroke="#B1B9C6" strokeWidth="1.43964" strokeDasharray="1.44 1.44"/>
                      <defs>
                        <filter id="filter0_d_412_33412" x="190.946" y="3.86914" width="300.483" height="300.487" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                          <feFlood floodOpacity="0" result="BackgroundImageFix"/>
                          <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
                          <feOffset dy="2.22996"/>
                          <feGaussianBlur stdDeviation="13.9372"/>
                          <feComposite in2="hardAlpha" operator="out"/>
                          <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.08 0"/>
                          <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_412_33412"/>
                          <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_412_33412" result="shape"/>
                        </filter>
                        <clipPath id="clip0_412_33412">
                          <rect width="215.945" height="215.945" fill="white" transform="translate(233.25 43.9414)"/>
                        </clipPath>
                      </defs>
                  </svg>
                </div>
              </div>
                <div className="content-stretch flex flex-col gap-[8px] items-start leading-[normal] not-italic relative shrink-0 text-[#070810] w-[340px]">
                  <p className="font-['Poppins',sans-serif] font-medium relative shrink-0 text-[18px] w-full">Risk Scoring & Insight Reports</p>
                  <p className="font-['Satoshi',sans-serif] font-normal relative shrink-0 text-[16px] w-full">
                    Get a clear read on exposure, patterns, and potential red flags in one structured report.
                  </p>
                </div>
            </div>

              {/* Card 3 - Case Connections */}
              <div className="content-stretch flex flex-col gap-[16px] items-start relative shrink-0 w-[402px]">
                <div className="bg-white border border-[#d4e1ea] border-solid overflow-clip relative rounded-[8px] size-full h-[402px] w-[400px]">
                  {/* Tabs */}
                  <div className="absolute box-border content-stretch flex gap-[16px] items-center left-[49px] overflow-auto p-[4px] top-[32px]">
                    <div className="border-[#022658] border-[0px_0px_4px] border-solid box-border content-stretch flex gap-[10px] items-center justify-center pb-[8px] pt-0 px-0 relative shrink-0">
                      <p className="font-['Satoshi',sans-serif] font-bold leading-[normal] not-italic relative shrink-0 text-[#022658] text-[16px] text-nowrap whitespace-pre">
                        Gazette notices
                      </p>
              </div>
                    <div className="box-border content-stretch flex gap-[10px] items-center justify-center pb-[8px] pt-0 px-0 relative shrink-0">
                      <p className="font-['Satoshi',sans-serif] font-normal leading-[normal] not-italic relative shrink-0 text-[#525866] text-[16px] text-nowrap whitespace-pre">
                        Case list
                      </p>
                    </div>
                    <div className="box-border content-stretch flex gap-[10px] items-center justify-center pb-[8px] pt-0 px-0 relative shrink-0">
                      <p className="font-['Satoshi',sans-serif] font-normal leading-[normal] not-italic relative shrink-0 text-[#525866] text-[16px] text-nowrap whitespace-pre">
                        Risk score
                      </p>
                    </div>
                    <div className="box-border content-stretch flex gap-[10px] items-center justify-center pb-[8px] pt-0 px-0 relative shrink-0">
                      <p className="font-['Satoshi',sans-serif] font-normal leading-[normal] not-italic relative shrink-0 text-[#525866] text-[16px] text-nowrap whitespace-pre">
                        Employment records
                      </p>
                    </div>
                  </div>

                  {/* Pending Cases Banner */}
                  <div className="absolute bg-white border border-[#d4e1ea] border-solid box-border content-stretch flex gap-[32px] items-center left-[49px] px-0 py-[12px] rounded-[8px] top-[85px] w-[1122px]">
                    <div className="box-border content-stretch flex gap-[10px] items-center px-[16px] py-[8px] relative shrink-0 w-[260px]">
                      <p className="font-['Satoshi',sans-serif] font-normal leading-[normal] not-italic relative shrink-0 text-[#070810] text-[14px] text-nowrap whitespace-pre">
                        🧾 Pending Cases
                      </p>
                    </div>
                    <div className="box-border content-stretch flex gap-[10px] items-center px-[16px] py-[8px] relative shrink-0 w-[200px]">
                      <p className="font-['Satoshi',sans-serif] font-normal leading-[normal] not-italic relative shrink-0 text-[#070810] text-[14px] text-nowrap whitespace-pre">
                        1
                      </p>
                    </div>
                    <div className="box-border content-stretch flex gap-[10px] items-center px-[16px] py-[8px] relative shrink-0 w-[500px]">
                      <p className="font-['Satoshi',sans-serif] font-normal leading-[normal] not-italic relative shrink-0 text-[#070810] text-[14px] text-nowrap whitespace-pre">
                        Active in High Court and Commercial Division
                      </p>
                    </div>
                  </div>

                  {/* Side Card */}
                  <div className="absolute bg-white border-[#e4e7eb] border-[0.696px] border-solid box-border content-stretch flex flex-col gap-[5.567px] items-center justify-center left-[49px] p-[11.133px] rounded-[5.567px] top-[160px]">
                    <p className="font-['Roboto',sans-serif] font-normal leading-[15.309px] relative shrink-0 text-[#050f1c] text-[11.133px] text-nowrap whitespace-pre">
                      Court
                    </p>
                    <div className="flex h-[0.521px] items-center justify-center relative shrink-0 w-full bg-[#e4e7eb]"></div>
                    <p className="font-['Roboto',sans-serif] font-normal leading-[15.309px] relative shrink-0 text-[#050f1c] text-[11.133px] text-nowrap whitespace-pre">
                      Documents
                    </p>
                    <div className="flex h-[0.521px] items-center justify-center relative shrink-0 w-full bg-[#e4e7eb]"></div>
                    <p className="font-['Roboto',sans-serif] font-normal leading-[15.309px] relative shrink-0 text-[#050f1c] text-[11.133px] text-nowrap whitespace-pre">
                      Assigned Judge
                    </p>
                    <div className="flex h-[0.521px] items-center justify-center relative shrink-0 w-full bg-[#e4e7eb]"></div>
                    <p className="font-['Roboto',sans-serif] font-normal leading-[15.309px] relative shrink-0 text-[#050f1c] text-[11.133px] text-nowrap whitespace-pre">
                      Case summary
                    </p>
                  </div>

                  {/* Case Table */}
                  <div className="absolute bg-white border border-[#e5e8ec] border-solid left-[175px] rounded-[14px] top-[160px] w-[1122px]">
                    <div className="content-stretch flex flex-col gap-[4px] items-start overflow-clip relative rounded-[inherit] w-[1122px]">
                      {/* Header */}
                      <div className="bg-[#f4f6f9] box-border content-stretch flex gap-[12px] items-center px-0 py-[16px] relative shrink-0 w-full">
                        <div className="box-border content-stretch flex gap-[10px] items-center p-[8px] relative shrink-0 w-[136px]">
                          <p className="font-['Satoshi',sans-serif] font-bold leading-[normal] not-italic relative shrink-0 text-[#070810] text-[14px] text-nowrap whitespace-pre">
                            Case Number
                          </p>
                        </div>
                        <div className="box-border content-stretch flex gap-[10px] items-center p-[8px] relative shrink-0 w-[200px]">
                          <p className="font-['Satoshi',sans-serif] font-bold leading-[normal] not-italic relative shrink-0 text-[#070810] text-[14px] text-nowrap whitespace-pre">
                            Case type
                          </p>
                        </div>
                        <div className="box-border content-stretch flex gap-[10px] items-center p-[8px] relative shrink-0 w-[136px]">
                          <p className="font-['Satoshi',sans-serif] font-bold leading-[normal] not-italic relative shrink-0 text-[#070810] text-[14px] text-nowrap whitespace-pre">
                            Court
                          </p>
                        </div>
                        <div className="box-border content-stretch flex gap-[10px] items-center p-[8px] relative shrink-0 w-[136px]">
                          <p className="font-['Satoshi',sans-serif] font-bold leading-[normal] not-italic relative shrink-0 text-[#070810] text-[14px] text-nowrap whitespace-pre">
                            Status
                          </p>
                        </div>
                        <div className="box-border content-stretch flex gap-[10px] items-center p-[8px] relative shrink-0 w-[136px]">
                          <p className="font-['Satoshi',sans-serif] font-bold leading-[normal] not-italic relative shrink-0 text-[#070810] text-[14px] text-nowrap whitespace-pre">
                            Outcome
                          </p>
                        </div>
                        <div className="box-border content-stretch flex gap-[10px] items-center p-[8px] relative shrink-0 w-[136px]">
                          <p className="font-['Satoshi',sans-serif] font-bold leading-[normal] not-italic relative shrink-0 text-[#070810] text-[14px] text-nowrap whitespace-pre">
                            Quantum (GHS)
                          </p>
                        </div>
                        <div className="box-border content-stretch flex gap-[10px] items-center p-[8px] relative shrink-0 w-[136px]">
                          <p className="font-['Satoshi',sans-serif] font-bold leading-[normal] not-italic relative shrink-0 text-[#070810] text-[14px] text-nowrap whitespace-pre">
                            Weight in Risk
                          </p>
                        </div>
                      </div>
                      {/* Rows */}
                      {[
                        { number: 'CM/0245/2023', type: 'Contract Dispute', court: 'High Court', status: 'Ongoing', outcome: '-', quantum: '150,000', weight: '15%' },
                        { number: 'CM/0111/2021', type: 'Land lease Dispute', court: 'District Court', status: 'Closed', outcome: 'Won', quantum: '0', weight: '5%' }
                      ].map((caseItem, idx) => (
                        <div key={idx} className="border-[#e5e8ec] border-[0px_0px_0.4px] border-solid box-border content-stretch flex gap-[12px] h-[70px] items-center pl-0 pr-[12px] py-[12px] relative shrink-0 w-full">
                          <div className="box-border content-stretch flex gap-[8px] h-[46px] items-center p-[8px] relative shrink-0 w-[136px]">
                            <p className="font-['Satoshi',sans-serif] font-normal leading-[normal] not-italic relative shrink-0 text-[#070810] text-[14px] w-[120px]">
                              {caseItem.number}
                            </p>
                          </div>
                          <div className="box-border content-stretch flex gap-[10px] h-[46px] items-center p-[8px] relative shrink-0 w-[200px]">
                            <p className="font-['Satoshi',sans-serif] font-normal leading-[normal] not-italic relative shrink-0 text-[#070810] text-[14px] w-[184px]">
                              {caseItem.type}
                            </p>
                          </div>
                          <div className="box-border content-stretch flex gap-[10px] h-[46px] items-center p-[8px] relative shrink-0 w-[136px]">
                            <p className="font-['Satoshi',sans-serif] font-normal leading-[normal] not-italic relative shrink-0 text-[#070810] text-[14px] w-[120px]">
                              {caseItem.court}
                            </p>
                          </div>
                          <div className="box-border content-stretch flex gap-[10px] h-[46px] items-center p-[8px] relative shrink-0 w-[136px]">
                            <p className="font-['Satoshi',sans-serif] font-normal leading-[normal] not-italic relative shrink-0 text-[#070810] text-[14px] text-nowrap whitespace-pre">
                              {caseItem.status}
                            </p>
                          </div>
                          <div className="box-border content-stretch flex gap-[8px] h-[46px] items-center p-[8px] relative shrink-0 w-[136px]">
                            <p className={`font-['Satoshi',sans-serif] font-bold leading-[normal] not-italic relative shrink-0 text-[14px] text-nowrap whitespace-pre ${caseItem.outcome === 'Won' ? 'text-emerald-500' : 'text-[#050f1c]'}`}>
                              {caseItem.outcome}
                            </p>
                          </div>
                          <div className="box-border content-stretch flex gap-[8px] h-[46px] items-center p-[8px] relative shrink-0 w-[136px]">
                            <p className="font-['Satoshi',sans-serif] font-normal leading-[normal] not-italic relative shrink-0 text-[#070810] text-[14px] w-[120px]">
                              {caseItem.quantum}
                            </p>
                          </div>
                          <div className="box-border content-stretch flex gap-[8px] h-[46px] items-center p-[8px] relative shrink-0 w-[136px]">
                            <p className="font-['Satoshi',sans-serif] font-normal leading-[normal] not-italic relative shrink-0 text-[#050f1c] text-[14px] text-nowrap whitespace-pre">
                              {caseItem.weight}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="content-stretch flex flex-col gap-[8px] items-start leading-[normal] not-italic relative shrink-0 text-[#070810] w-[340px]">
                  <p className="font-['Poppins',sans-serif] font-medium relative shrink-0 text-[18px] w-[392px]">
                    Real-time Case Connections
                  </p>
                  <p className="font-['Satoshi',sans-serif] font-normal relative shrink-0 text-[16px] w-[392px]">
                See every case linked to a company or individual as soon as the data becomes available.
              </p>
                </div>
              </div>
            </div>
            <button className="bg-gradient-to-b border-4 border-[rgba(15,40,71,0.15)] border-solid box-border content-stretch flex from-[#022658] from-[42.563%] gap-[10px] h-[40px] items-center justify-center px-[16px] py-[10px] relative rounded-[8px] shrink-0 to-[#1a4983]">
              <p className="font-['Satoshi',sans-serif] font-bold leading-[normal] not-italic relative shrink-0 text-[14px] text-nowrap text-white whitespace-pre">
                Start free trial
              </p>
              </button>
            </div>
          </div>
        </div>

      {/* How Juridence Works Section */}
      <div className="bg-[#f7f8fa] h-[854px] overflow-clip relative shrink-0 w-full">
        <div className="absolute content-stretch flex flex-col gap-[80px] h-[798px] items-start left-[100px] right-[100px] top-0">
          <div className="content-stretch flex flex-col gap-[10px] items-center relative shrink-0 w-full">
            <div className="content-stretch flex flex-col gap-[24px] items-center relative shrink-0 w-[804px]">
              <div className="content-stretch flex flex-col gap-[16px] items-start not-italic relative shrink-0 text-center w-full">
                <p className="font-['Satoshi',sans-serif] font-normal leading-[normal] relative shrink-0 text-[#525866] text-[14px] w-full">
                  HOW JURIDENCE WORKS
                </p>
                <p className="font-['Poppins',sans-serif] font-semibold leading-[72px] relative shrink-0 text-[#070810] text-[48px] w-full">
                  <span>From </span>
                  <span className="text-amber-500">Search</span>
                  <span> to </span>
                  <span className="text-blue-500">Insight</span>
                  <span> in Seconds</span>
                </p>
                <p className="font-['Poppins',sans-serif] font-normal leading-[normal] relative shrink-0 text-[#070810] text-[18px] w-full">
                Type a name, and the system pulls every relevant case, gazette record, and association into one view.
              </p>
              </div>
              <button className="bg-gradient-to-b border-4 border-[rgba(15,40,71,0.15)] border-solid box-border content-stretch flex from-[#022658] from-[42.563%] gap-[10px] h-[40px] items-center justify-center px-[16px] py-[10px] relative rounded-[8px] shrink-0 to-[#1a4983]">
                <p className="font-['Satoshi',sans-serif] font-bold leading-[normal] not-italic relative shrink-0 text-[14px] text-nowrap text-white whitespace-pre">
                  Start Free Due Diligence Here
                </p>
              </button>
                  </div>
                  </div>
          <div className="content-stretch flex gap-[24px] h-[469px] items-start overflow-clip relative shrink-0">
            {/* Left Side - Steps */}
            <div className="content-stretch flex flex-col gap-[40px] items-start relative shrink-0">
              <div className="content-stretch flex flex-col gap-[16px] items-start relative shrink-0 w-[540px]">
                <div className="bg-[#d4e1ea] box-border content-stretch flex gap-[10px] items-center p-[8px] relative rounded-[8px] shrink-0">
                  <Search className="overflow-clip relative shrink-0 size-[16px] text-[#525866]" />
                </div>
                <div className="content-stretch flex flex-col gap-[8px] items-start leading-[normal] not-italic relative shrink-0 text-[#070810] w-full">
                  <p className="font-['Poppins',sans-serif] font-medium relative shrink-0 text-[18px] w-full">
                    Search an Entity
                  </p>
                  <p className="font-['Satoshi',sans-serif] font-normal relative shrink-0 text-[16px] w-full">
                    Enter a name. The system starts the intelligence process.
                  </p>
                  </div>
                  </div>
              <div className="content-stretch flex flex-col gap-[16px] items-start relative shrink-0 w-[540px]">
                <div className="bg-[#d4e1ea] box-border content-stretch flex gap-[10px] items-center p-[8px] relative rounded-[8px] shrink-0">
                  <Search className="overflow-clip relative shrink-0 size-[16px] text-[#525866]" />
                </div>
                <div className="content-stretch flex flex-col gap-[8px] items-start leading-[normal] not-italic relative shrink-0 text-[#070810] w-full">
                  <p className="font-['Poppins',sans-serif] font-medium relative shrink-0 text-[18px] w-full">View Linked Cases & Records</p>
                  <p className="font-['Satoshi',sans-serif] font-normal relative shrink-0 text-[16px] w-full">
                    You see litigation history, gazette mentions, and associations instantly.
                  </p>
                  </div>
                  </div>
              <div className="content-stretch flex flex-col gap-[16px] items-start relative shrink-0 w-[540px]">
                <div className="bg-[#d4e1ea] box-border content-stretch flex gap-[10px] items-center p-[8px] relative rounded-[8px] shrink-0">
                  <Search className="overflow-clip relative shrink-0 size-[16px] text-[#525866]" />
                  </div>
                <div className="content-stretch flex flex-col gap-[8px] items-start leading-[normal] not-italic relative shrink-0 text-[#070810] w-full">
                  <p className="font-['Poppins',sans-serif] font-medium relative shrink-0 text-[18px] w-[392px]">
                    Generate a Full Report
                  </p>
                  <p className="font-['Satoshi',sans-serif] font-normal relative shrink-0 text-[16px] w-full">
                    Download analysis or risk assessments for deeper checks.
                  </p>
                </div>
              </div>
            </div>

            {/* Right Side - Search Results Table */}
            <div className="bg-white box-border content-stretch flex flex-col gap-[20.589px] h-[696.603px] items-start p-[13.726px] relative rounded-[16px] shadow-[-4px_4px_8px_0px_rgba(0,0,0,0.25)] shrink-0 w-[990px]">
              <p className="font-['Satoshi',sans-serif] font-medium leading-[normal] not-italic relative shrink-0 text-[#022658] text-[10.295px] text-center text-nowrap whitespace-pre">
                5 RESULTS READY
              </p>
              <div className="content-stretch flex flex-col gap-[27.452px] items-start relative shrink-0 w-full">
                <div className="content-stretch flex flex-col gap-[13.726px] items-start relative shrink-0 w-full">
                  {/* Table Header */}
                  <div className="bg-[#f4f6f9] box-border content-stretch flex gap-[10.295px] items-center px-0 py-[13.726px] relative shrink-0 w-full">
                    <div className="box-border content-stretch flex gap-[8.579px] items-center p-[6.863px] relative shrink-0 w-[223.05px]">
                      <p className="font-['Satoshi',sans-serif] font-bold leading-[normal] not-italic relative shrink-0 text-[#070810] text-[12.01px] text-nowrap whitespace-pre">
                        Name
                      </p>
              </div>
                    <div className="box-border content-stretch flex gap-[8.579px] items-center p-[6.863px] relative shrink-0 w-[85.789px]">
                      <p className="font-['Satoshi',sans-serif] font-bold leading-[normal] not-italic relative shrink-0 text-[#070810] text-[12.01px] text-nowrap whitespace-pre">
                        Age
                      </p>
            </div>
                    <div className="box-border content-stretch flex gap-[8.579px] items-center p-[6.863px] relative shrink-0 w-[197.314px]">
                      <p className="font-['Satoshi',sans-serif] font-bold leading-[normal] not-italic relative shrink-0 text-[#070810] text-[12.01px] text-nowrap whitespace-pre">
                        Location
                      </p>
          </div>
                    <div className="box-border content-stretch flex gap-[8.579px] items-center p-[6.863px] relative shrink-0 w-[223.05px]">
                      <p className="font-['Satoshi',sans-serif] font-bold leading-[normal] not-italic relative shrink-0 text-[#070810] text-[12.01px] text-nowrap whitespace-pre">
                        Affiliation
                      </p>
        </div>
                    <div className="box-border content-stretch flex gap-[8.579px] items-center p-[6.863px] relative shrink-0 w-[180.156px]">
                      <p className="font-['Satoshi',sans-serif] font-bold leading-[normal] not-italic relative shrink-0 text-[#070810] text-[12.01px] text-nowrap whitespace-pre">
                        Full Report
                      </p>
                    </div>
                  </div>
                  {/* Sample Rows */}
                  {[
                    { name: 'Atta Annan', age: 49, location: '12, Coconut Ave, Accra', affiliations: ['Mary Annan - Wife', 'Elijah Annan - Brother', 'Volta Group - Director'] },
                    { name: 'Atta Annan Sarpong', age: 37, location: '8, Waters Rd, Tamale', affiliations: ['Kofi Sarpong - Cousin', 'Ama Sarpong - Sister', 'Kwame Ansel - In-Law'] },
                    { name: 'Atta Annan Mensah', age: 52, location: '22, Beach Rd, Takoradi', affiliations: ['Samuel Mensah - Brother', 'Linda Mensah - Sister-in-law', 'David Mensah - Cousin'] },
                    { name: 'Atta Annan Addo', age: 41, location: '1, Liberation Rd, Kumasi', affiliations: ['John Addo - Brother', 'Sarah Addo - Cousin'] },
                    { name: 'Atta Annan Quaye', age: 55, location: '17, Airport Rd, Tamale', affiliations: ['James Quaye - Brother', 'John Quaye - Brother', 'Linda Quaye - Sister-in-law', 'Daniel Quaye - Cousin'] }
                  ].map((person, idx) => (
                    <div key={idx} className="bg-white border-[#f7f8fa] border-[0.858px] border-solid box-border content-stretch flex gap-[10.295px] items-start px-0 py-[13.726px] relative rounded-[6.863px] shrink-0 w-full">
                      <div className="box-border content-stretch flex flex-col gap-[5.147px] h-[56.62px] items-start leading-[normal] not-italic p-[6.863px] relative shrink-0 text-[#050f1c] w-[223.05px]">
                        <p className="font-['Poppins',sans-serif] font-medium relative shrink-0 text-[15.442px] w-full">
                          {person.name}
                        </p>
                        <p className="font-['Satoshi',sans-serif] font-normal relative shrink-0 text-[13.726px] text-emerald-500 w-full">
                          Contact found!
                        </p>
                      </div>
                      <div className="box-border content-stretch flex flex-col gap-[6.863px] items-start p-[6.863px] relative shrink-0 w-[85.789px]">
                        <p className="font-['Satoshi',sans-serif] font-medium leading-[normal] not-italic relative shrink-0 text-[#050f1c] text-[13.726px] w-full">
                          {person.age}
                        </p>
                      </div>
                      <div className="box-border content-stretch flex flex-col gap-[6.863px] items-start p-[6.863px] relative shrink-0 w-[197.314px]">
                        <p className="font-['Satoshi',sans-serif] font-normal leading-[normal] not-italic relative shrink-0 text-[#050f1c] text-[13.726px] w-full">
                          {person.location}
                        </p>
                      </div>
                      <div className="box-border content-stretch flex flex-col gap-[6.863px] items-start p-[6.863px] relative shrink-0 w-[223.05px]">
                        {person.affiliations.map((aff, i) => (
                          <div key={i} className="content-stretch flex gap-[3.432px] items-center leading-[normal] not-italic relative shrink-0 text-[#050f1c] text-nowrap whitespace-pre">
                            <p className="font-['Satoshi',sans-serif] font-medium relative shrink-0 text-[12.01px]">
                              {aff.split(' - ')[0]} -
                            </p>
                            <p className="font-['Satoshi',sans-serif] font-normal relative shrink-0 text-[10.295px]">
                              {aff.split(' - ')[1]}
                            </p>
                          </div>
                        ))}
                      </div>
                      <div className="box-border content-stretch flex flex-col gap-[6.863px] items-start p-[6.863px] relative shrink-0 w-[180.156px]">
                        <div className="bg-[rgba(2,38,88,0.1)] box-border content-stretch flex gap-[5.147px] items-center justify-center px-[6.863px] py-[3.432px] relative rounded-[6.863px] shrink-0">
                          <p className="font-['Satoshi',sans-serif] font-medium leading-[normal] not-italic relative shrink-0 text-[#022658] text-[10.295px] text-nowrap whitespace-pre">
                            Open Report
                          </p>
                          <ArrowRight className="overflow-clip relative shrink-0 size-[10.295px] text-[#022658]" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Why Juridence Section */}
      <div className="bg-[#1a365d] h-[797px] overflow-clip relative shrink-0 w-full">
        <div className="absolute content-stretch flex flex-col gap-[40px] h-[557px] items-center left-1/2 top-[120px] translate-x-[-50%] w-[1240px] max-w-[calc(100%-200px)]">
          <div className="content-stretch flex flex-col gap-[16px] items-start not-italic relative shrink-0 text-center w-[804px]">
            <p className="font-['Satoshi',sans-serif] font-normal leading-[normal] relative shrink-0 text-[#f7f8fa] text-[14px] w-full">
              WHY JURIDENCE?
            </p>
            <p className="font-['Poppins',sans-serif] font-semibold leading-[72px] relative shrink-0 text-[48px] text-white w-full">
            A Smarter Way to Understand Legal Risk
            </p>
          </div>
          <div className="content-stretch flex flex-col gap-[12px] items-center justify-center relative shrink-0 w-[804px]">
            {[
              'Verified court and registry data',
              'Clean profiles with all linked cases',
              'Smart cross-entity connections',
              'Fast analysis reports',
              'Built for due diligence and corporate checks'
            ].map((benefit, idx) => (
              <div key={idx} className="bg-white box-border content-stretch flex gap-[12px] h-[58px] items-center justify-center px-[8px] py-[16px] relative rounded-[8px] shadow-[0px_2px_20px_0px_rgba(0,0,0,0.06)] shrink-0 w-full">
                <p className="font-['Satoshi',sans-serif] font-normal leading-[normal] not-italic relative shrink-0 text-[#050f1c] text-[16px] text-nowrap whitespace-pre">
                  {benefit}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pricing Section */}
      <div className="bg-[#f7f8fa] h-[775px] overflow-clip relative shrink-0 w-full">
        <div className="absolute content-stretch flex flex-col gap-[24px] items-center left-[100px] right-[100px] top-[60px]">
          <div className="bg-white border border-[#d4e1ea] border-solid box-border content-stretch flex items-center justify-between px-[8px] py-[4px] relative rounded-[8px] shrink-0 w-[386px]">
              <button
                onClick={() => setPricingToggle('Monthly')}
              className={`box-border content-stretch flex gap-[8px] items-center justify-center p-[8px] relative rounded-[4px] shrink-0 w-[160px] ${
                pricingToggle === 'Monthly' ? 'bg-[#022658]' : ''
              }`}
            >
              <p className={`font-['Satoshi',sans-serif] ${pricingToggle === 'Monthly' ? 'font-bold text-white' : 'font-normal text-[#050f1c]'} leading-[normal] not-italic relative shrink-0 text-[16px] text-center`}>
                Monthly
              </p>
              </button>
              <button
                onClick={() => setPricingToggle('Yearly')}
              className={`box-border content-stretch flex gap-[8px] h-[41px] items-center justify-center p-[8px] relative rounded-[4px] shrink-0 w-[160px] ${
                pricingToggle === 'Yearly' ? 'bg-[#022658]' : ''
              }`}
            >
              <p className={`font-['Satoshi',sans-serif] ${pricingToggle === 'Yearly' ? 'font-bold text-white' : 'font-normal text-[#050f1c]'} leading-[normal] not-italic relative shrink-0 text-[16px] text-nowrap`}>
                Yearly
              </p>
              </button>
            </div>
          <div className="content-stretch flex gap-[24px] items-start relative shrink-0 w-full">
            {[
              {
                name: 'Standard Plan',
                description: 'Perfect for small organisations with advanced needs',
                features: [
                  'Manage up to 50 active cases',
                  'View published cause lists only',
                  '5 GB secure storage',
                  'Basic case reports',
                  'Email support, single user'
                ]
              },
              {
                name: 'Pro Plan',
                description: 'Perfect for larger organizations with advanced needs',
                features: [
                  'Unlimited case access across all divisions',
                  'Full automation with smart linking and schedule analytics',
                  '100 GB + advanced file indexing & search',
                  'Advanced analytics with custom exports & API access',
                  '24/7 support, multi-user roles, and dedicated account manager'
                ]
              },
              {
                name: 'Advanced Plan',
                description: 'Ideal for growing startups and mid-sized companies',
                features: [
                  'Manage up to 250 active cases',
                  'Upload & manage cause lists and gazette entries',
                  '25 GB storage with version control',
                  'Detailed reports with trend charts',
                  'Priority email + 3 team seats'
                ]
              }
            ].map((plan, idx) => (
              <div key={idx} className="backdrop-blur-[2.65px] backdrop-filter basis-0 bg-white border-[#d4e1ea] border-[1.5px] border-solid box-border content-stretch flex flex-col gap-[24px] grow items-center min-h-px min-w-px p-[24px] relative rounded-[8px] shrink-0">
                <div className="content-stretch flex flex-col gap-[24px] items-start relative shrink-0 w-full">
                  <div className="content-stretch flex flex-col gap-[8px] items-start leading-[normal] not-italic relative shrink-0 w-full">
                    <p className="font-['Poppins',sans-serif] font-medium relative shrink-0 text-[#050f1c] text-[24px] w-full">
                      {plan.name}
                    </p>
                    <p className="font-['Satoshi',sans-serif] font-normal relative shrink-0 text-[#525866] text-[16px] w-full">
                      {plan.description}
                    </p>
          </div>
                  <div className="content-stretch flex flex-col gap-[24px] items-start relative shrink-0 w-full">
                    <div className="bg-white border border-[#d4e1ea] border-solid box-border content-stretch flex flex-col gap-[20px] items-start px-[16px] py-[20px] relative rounded-[24px] shrink-0 w-full">
                      {plan.features.map((feature, i) => (
                        <div key={i} className="content-stretch flex gap-[12px] items-start relative shrink-0 w-full">
                          <div className="bg-[#022658] content-stretch flex gap-[7.692px] items-center justify-center relative rounded-[76.923px] shrink-0 size-[20px]">
                            <div className="text-white text-xs">✓</div>
                          </div>
                          <p className="basis-0 font-['Satoshi',sans-serif] font-normal grow leading-[normal] min-h-px min-w-px not-italic relative shrink-0 text-[#050f1c] text-[16px]">
                            {feature}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <button className="bg-gradient-to-b border-4 border-[rgba(15,40,71,0.15)] border-solid box-border content-stretch flex from-[#022658] from-[42.563%] gap-[10px] h-[58px] items-center justify-center p-[10px] relative rounded-[8px] shrink-0 to-[#1a4983] w-full">
                  <p className="font-['Satoshi',sans-serif] font-bold leading-[normal] not-italic relative shrink-0 text-[16px] text-nowrap text-white whitespace-pre">
                    Contact us for this Plan billing
                  </p>
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="bg-[#f7f8fa] h-[918px] overflow-clip relative shrink-0 w-full">
        <div className="absolute content-stretch flex flex-col gap-[40px] h-[798px] items-start left-[100px] right-[100px] top-[60px]">
          <div className="content-stretch flex flex-col gap-[10px] items-center relative shrink-0 w-full">
            <div className="content-stretch flex flex-col gap-[16px] h-[249px] items-start not-italic relative shrink-0 text-center w-[804px]">
              <p className="font-['Satoshi',sans-serif] font-normal leading-[normal] relative shrink-0 text-[#525866] text-[14px] w-full">
                TESTIMONIALS
              </p>
              <p className="font-['Poppins',sans-serif] font-semibold leading-[72px] relative shrink-0 text-[#070810] text-[48px] w-full">
                <span>Why Professionals Choose </span>
                <span className="text-amber-500">Juridence</span>
              </p>
              <p className="font-['Poppins',sans-serif] font-normal leading-[normal] relative shrink-0 text-[#070810] text-[18px] w-full">
              From risk checks to complex reviews, Juridence helps users stay informed.
            </p>
          </div>
                </div>
          <div className="content-stretch flex flex-col gap-[40px] items-start relative shrink-0 w-full">
            <div className="content-stretch flex gap-[40px] items-start relative shrink-0 w-full">
              <div className="basis-0 bg-white border-[0px_0px_0px_2px] border-blue-500 border-solid box-border content-stretch flex flex-col gap-[12px] grow items-start min-h-px min-w-px p-[24px] relative rounded-[8px] shrink-0">
                <p className="font-['Poppins',sans-serif] font-normal leading-[normal] not-italic relative shrink-0 text-[#070810] text-[18px] w-full">
                  "<br aria-hidden="true" />
                  Juridence gives us a clear view of any company we're dealing with. The case connections save us hours, and the reports help us back up decisions internally.
                </p>
                <div className="content-stretch flex flex-col gap-[4px] items-start relative shrink-0 w-full">
                  <div className="content-stretch flex gap-[4px] items-center relative shrink-0">
                    <div className="border-2 border-solid border-white relative rounded-[81.818px] shrink-0 size-[32px] bg-[#d4e1ea]"></div>
                    <p className="font-['Satoshi',sans-serif] font-medium leading-[normal] not-italic relative shrink-0 text-[#070810] text-[16px] text-nowrap whitespace-pre">
                      Ama Tetteh
                    </p>
              </div>
                  <p className="font-['Satoshi',sans-serif] font-normal leading-[normal] not-italic relative shrink-0 text-[#070810] text-[16px] w-full">
                    Compliance Lead, Horizon Capital
                  </p>
          </div>
        </div>
              <div className="basis-0 bg-white border-[0px_0px_0px_2px] border-blue-500 border-solid box-border content-stretch flex flex-col gap-[12px] grow items-start min-h-px min-w-px p-[24px] relative rounded-[8px] shrink-0">
                <p className="font-['Poppins',sans-serif] font-normal leading-[normal] not-italic relative shrink-0 text-[#070810] text-[18px] w-full">
                  "<br aria-hidden="true" />
                  The entity profiles are clean and easy to work with. Seeing all linked cases and gazette notices in one place has changed how we run background checks.
                </p>
                <div className="content-stretch flex flex-col gap-[4px] items-start relative shrink-0 w-full">
                  <div className="content-stretch flex gap-[4px] items-center relative shrink-0">
                    <div className="border-2 border-solid border-white relative rounded-[81.818px] shrink-0 size-[32px] bg-[#d4e1ea]"></div>
                    <p className="font-['Satoshi',sans-serif] font-medium leading-[normal] not-italic relative shrink-0 text-[#070810] text-[16px] text-nowrap whitespace-pre">
                      Richard Owusu
                    </p>
                  </div>
                  <p className="font-['Satoshi',sans-serif] font-normal leading-[normal] not-italic relative shrink-0 text-[#070810] text-[16px] w-full">
                    Legal Officer, Horizon Holdings
                  </p>
                </div>
              </div>
            </div>
            <div className="content-stretch flex gap-[40px] items-start relative shrink-0 w-full">
              <div className="basis-0 bg-white border-[0px_0px_0px_2px] border-blue-500 border-solid box-border content-stretch flex flex-col gap-[12px] grow items-start min-h-px min-w-px p-[24px] relative rounded-[8px] shrink-0">
                <p className="font-['Poppins',sans-serif] font-normal leading-[normal] not-italic relative shrink-0 text-[#070810] text-[18px] w-full">
                  "<br aria-hidden="true" />
                  The risk insight reports help us flag issues early. It's straightforward, reliable, and fits naturally into our review process.
                </p>
                <div className="content-stretch flex flex-col gap-[4px] items-start relative shrink-0 w-full">
                  <div className="content-stretch flex gap-[4px] items-center relative shrink-0">
                    <div className="border-2 border-solid border-white relative rounded-[81.818px] shrink-0 size-[32px] bg-[#d4e1ea]"></div>
                    <p className="font-['Satoshi',sans-serif] font-medium leading-[normal] not-italic relative shrink-0 text-[#070810] text-[16px] text-nowrap whitespace-pre">
                      Kweku Mensah
                    </p>
                  </div>
                  <p className="font-['Satoshi',sans-serif] font-normal leading-[normal] not-italic relative shrink-0 text-[#070810] text-[16px] w-full">
                    Due Diligence Analyst, Nova Energy
                  </p>
                </div>
              </div>
              <div className="basis-0 bg-white border-[0px_0px_0px_2px] border-blue-500 border-solid box-border content-stretch flex flex-col gap-[12px] grow items-start min-h-px min-w-px p-[24px] relative rounded-[8px] shrink-0">
                <p className="font-['Poppins',sans-serif] font-normal leading-[normal] not-italic relative shrink-0 text-[#070810] text-[18px] w-full">
                  "<br aria-hidden="true" />
                  Juridence gives me a complete picture without the usual back-and-forth. The entity checks are quick, the reports are clear, and the data feels dependable every time."
                </p>
                <div className="content-stretch flex flex-col gap-[4px] items-start relative shrink-0 w-full">
                  <div className="content-stretch flex gap-[4px] items-center relative shrink-0">
                    <div className="border-2 border-solid border-white relative rounded-[81.818px] shrink-0 size-[32px] bg-[#d4e1ea]"></div>
                    <p className="font-['Satoshi',sans-serif] font-medium leading-[normal] not-italic relative shrink-0 text-[#070810] text-[16px] text-nowrap whitespace-pre">
                      Nana Adjoa Serwaa
                    </p>
                  </div>
                  <p className="font-['Satoshi',sans-serif] font-normal leading-[normal] not-italic relative shrink-0 text-[#070810] text-[16px] w-full">
                    Senior Risk Manager, Crestline Insurance
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-[#f7f8fa] py-[60px] relative overflow-hidden w-full">
        <div className="relative left-1/2 top-[60px] translate-x-[-50%] w-[1240px]">
          {/* Background Watermark Logo - positioned exactly as in Figma */}
          <div className="absolute h-[300px] left-[calc(62.5%+70.76px)] top-[244px] translate-x-[-50%] w-[1023.53px] opacity-[0.08] pointer-events-none">
            <img
              src="/footer-watermark.png"
              alt="juridence logo watermark"
              className="block max-w-none size-full object-contain"
            />
          </div>

          <div className="relative flex items-start justify-between z-10 w-full">
            <div className="flex flex-col gap-10 items-start">
              <div className="h-12 w-[163.765px]">
                <img 
                  src="/main-logo.png" 
                  alt="juridence logo" 
                  className="h-full w-auto object-contain"
                />
              </div>
              <div className="flex flex-col gap-2 items-start text-xs">
                <p className="font-['Satoshi',sans-serif] font-medium text-[#525866]">info@juridencegh.com</p>
                <p className="font-['Satoshi',sans-serif] text-[#070810]">P. O. Box 347 Osu - Accra.</p>
              </div>
              <p className="font-['Satoshi',sans-serif] text-xs text-[#070810]">
                +233 30 291 4988 or +233 57 750 5670
              </p>
              </div>
            <div className="flex gap-10 items-start">
              <div className="flex flex-col gap-2 items-start">
                <p className="font-['Satoshi',sans-serif] font-medium text-xs text-[#525866]">PRODUCT</p>
                <div className="flex flex-col gap-1.5 items-start text-xs">
                  <p className="font-['Satoshi',sans-serif] text-[#070810]">Overview</p>
                  <p className="font-['Satoshi',sans-serif] text-[#070810]">Legal Research</p>
            </div>
            </div>
              <div className="flex flex-col gap-2 items-start text-xs">
                <p className="font-['Satoshi',sans-serif] font-medium text-xs text-[#525866]">JOIN US</p>
                <p className="font-['Satoshi',sans-serif] text-xs text-[#070810]">Careers</p>
            </div>
              <div className="flex flex-col gap-2 items-start">
                <p className="font-['Satoshi',sans-serif] font-medium text-xs text-[#525866]">COMPANY</p>
                <div className="flex flex-col gap-1.5 items-start text-xs">
                  <p className="font-['Satoshi',sans-serif] text-[#070810]">About Us</p>
                  <p className="font-['Satoshi',sans-serif] text-[#070810]">Contact Us</p>
                  <p className="font-['Satoshi',sans-serif] text-[#070810]">LinkedIn</p>
            </div>
          </div>
              <div className="flex flex-col gap-2 items-start">
                <p className="font-['Satoshi',sans-serif] font-medium text-xs text-[#525866]">LEGAL</p>
                <div className="flex flex-col gap-1.5 items-start text-xs">
                  <p className="font-['Satoshi',sans-serif] text-[#070810]">Terms of Service</p>
                  <p className="font-['Satoshi',sans-serif] text-[#070810]">Privacy Policy</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
