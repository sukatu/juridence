import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Building2,
  Check,
  FileSearch,
  Menu,
  Network,
  Search,
  ShieldCheck,
  Sparkles,
  X,
} from 'lucide-react';

const capabilities = [
  {
    icon: FileSearch,
    label: 'Litigation intelligence',
    title: 'See the complete case picture',
    description: 'Review pending and concluded matters, suit numbers, parties, courts and outcomes in one structured record.',
  },
  {
    icon: Network,
    label: 'Entity relationships',
    title: 'Understand who is connected',
    description: 'Trace associations across people, businesses, financial institutions and legal proceedings before you engage.',
  },
  {
    icon: ShieldCheck,
    label: 'Due diligence signals',
    title: 'Turn records into risk context',
    description: 'Surface relevant legal exposure early with consistent profiles designed for compliance and decision teams.',
  },
  {
    icon: Sparkles,
    label: 'AI-assisted review',
    title: 'Move from research to insight',
    description: 'Summarise complex histories and focus your team on the evidence that matters to the decision at hand.',
  },
];

const workflow = [
  ['01', 'Search', 'Start with a person or organisation and find matching verified records.'],
  ['02', 'Investigate', 'Review case timelines, parties, relationships and available source documents.'],
  ['03', 'Decide', 'Export a clear due diligence view your team can discuss and act on.'],
];

const Home = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);

  const handleSearch = (event) => {
    event?.preventDefault();
    const query = searchQuery.trim();
    if (query) navigate(`/search?q=${encodeURIComponent(query)}`);
  };

  return (
    <main className="min-h-screen bg-white text-[#102033]">
      <section className="relative min-h-[690px] overflow-hidden bg-[#071b2f] text-white">
        <img
          src="/previews/dashboard-preview.png"
          alt="Juridence legal intelligence case workspace"
          className="absolute inset-y-0 right-0 h-full w-full object-cover object-[72%_center] opacity-35 lg:w-[66%] lg:opacity-75"
        />
        <div className="absolute inset-0 bg-[rgba(7,27,47,0.64)] lg:bg-[rgba(7,27,47,0.28)]" />
        <div className="absolute inset-y-0 left-0 w-full bg-[#071b2f] opacity-90 lg:w-[58%]" />

        <header className="relative z-20 mx-auto flex h-20 max-w-[1240px] items-center justify-between px-5 sm:px-8">
          <Link to="/" aria-label="Juridence home" className="shrink-0">
            <img src="/logos/logo-white.png" alt="Juridence" className="h-8 w-auto sm:h-9" />
          </Link>

          <nav className="hidden items-center gap-7 text-sm font-medium text-white/80 lg:flex" aria-label="Primary navigation">
            <a href="#platform" className="transition-colors hover:text-white">Platform</a>
            <a href="#workflow" className="transition-colors hover:text-white">How it works</a>
            <a href="#coverage" className="transition-colors hover:text-white">Data coverage</a>
          </nav>

          <div className="hidden items-center gap-3 lg:flex">
            <Link to="/login" className="px-4 py-2 text-sm font-semibold text-white hover:text-[#9ce0c4]">Log in</Link>
            <Link to="/select-role" className="inline-flex h-10 items-center gap-2 rounded-md bg-[#f2b84b] px-4 text-sm font-bold text-[#172234] transition-colors hover:bg-[#ffd16f]">
              Request access <ArrowRight size={16} />
            </Link>
          </div>

          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-white/20 lg:hidden"
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </header>

        {menuOpen && (
          <nav className="relative z-30 mx-5 border-t border-white/15 bg-[#071b2f] px-5 py-5 lg:hidden" aria-label="Mobile navigation">
            <div className="flex flex-col gap-4 text-sm font-medium">
              <a href="#platform" onClick={() => setMenuOpen(false)}>Platform</a>
              <a href="#workflow" onClick={() => setMenuOpen(false)}>How it works</a>
              <a href="#coverage" onClick={() => setMenuOpen(false)}>Data coverage</a>
              <div className="mt-2 flex items-center gap-3 border-t border-white/15 pt-4">
                <Link to="/login" className="flex-1 py-2 text-center">Log in</Link>
                <Link to="/select-role" className="flex-1 rounded-md bg-[#f2b84b] px-4 py-2.5 text-center font-bold text-[#172234]">Request access</Link>
              </div>
            </div>
          </nav>
        )}

        <div className="relative z-10 mx-auto flex max-w-[1240px] px-5 pb-24 pt-16 sm:px-8 sm:pt-24 lg:pt-28">
          <div className="max-w-[670px]">
            <p className="mb-5 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-[#9ce0c4]">
              <ShieldCheck size={17} /> Ghana&apos;s legal intelligence workspace
            </p>
            <h1 className="max-w-[650px] text-[42px] font-semibold leading-[1.08] tracking-normal sm:text-[56px] lg:text-[64px]">
              Know the legal history behind every decision.
            </h1>
            <p className="mt-6 max-w-[570px] text-base leading-7 text-white/75 sm:text-lg">
              Juridence brings litigation records, corporate relationships and due diligence signals into one dependable workspace.
            </p>

            <form onSubmit={handleSearch} className="mt-9 flex max-w-[620px] flex-col gap-3 sm:flex-row">
              <label className="flex h-14 flex-1 items-center gap-3 rounded-md border border-white/20 bg-white px-4 text-[#102033] shadow-[0_12px_36px_rgba(0,0,0,0.18)]">
                <Search size={20} className="shrink-0 text-[#477087]" />
                <span className="sr-only">Search people or companies</span>
                <input
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search a person or company"
                  className="min-w-0 flex-1 bg-transparent text-[15px] outline-none placeholder:text-[#6b7b88]"
                />
              </label>
              <button type="submit" className="inline-flex h-14 items-center justify-center gap-2 rounded-md bg-[#23a36d] px-6 text-sm font-bold text-white transition-colors hover:bg-[#17875a]">
                Search records <ArrowRight size={17} />
              </button>
            </form>

            <div className="mt-6 flex flex-wrap gap-x-6 gap-y-3 text-sm text-white/70">
              {['Court-linked records', 'Structured profiles', 'Decision-ready reports'].map((item) => (
                <span key={item} className="flex items-center gap-2"><Check size={15} className="text-[#9ce0c4]" />{item}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="coverage" className="border-b border-[#dce5e9] bg-[#f5f8f8]">
        <div className="mx-auto grid max-w-[1240px] grid-cols-2 gap-px px-5 py-7 sm:px-8 lg:grid-cols-4">
          {[
            ['11,900+', 'case records'],
            ['6,300+', 'people profiled'],
            ['4,800+', 'companies covered'],
            ['80+', 'banks and insurers'],
          ].map(([value, label]) => (
            <div key={label} className="border-l border-[#cfdbdf] px-4 py-3 first:border-l-0 lg:px-7">
              <p className="text-2xl font-semibold text-[#0c3150] sm:text-3xl">{value}</p>
              <p className="mt-1 text-sm text-[#60717c]">{label}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="platform" className="px-5 py-20 sm:px-8 lg:py-28">
        <div className="mx-auto max-w-[1240px]">
          <div className="max-w-[700px]">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#17875a]">One connected view</p>
            <h2 className="mt-4 text-3xl font-semibold leading-tight text-[#0b2942] sm:text-4xl">Legal research built for real decisions</h2>
            <p className="mt-4 max-w-[620px] text-base leading-7 text-[#60717c]">
              Move beyond scattered searches. Juridence organises fragmented legal information into a consistent, reviewable record.
            </p>
          </div>

          <div className="mt-12 grid border-y border-[#dce5e9] md:grid-cols-2">
            {capabilities.map(({ icon: Icon, label, title, description }, index) => (
              <article
                key={title}
                className={`px-1 py-8 md:p-9 ${index % 2 === 0 ? 'md:border-r md:border-[#dce5e9]' : ''} ${index < 2 ? 'border-b border-[#dce5e9]' : index === 2 ? 'border-b border-[#dce5e9] md:border-b-0' : ''}`}
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-[#e7f5ef] text-[#17875a]"><Icon size={20} /></div>
                <p className="mt-6 text-xs font-bold uppercase tracking-[0.12em] text-[#73828c]">{label}</p>
                <h3 className="mt-2 text-xl font-semibold text-[#102f49]">{title}</h3>
                <p className="mt-3 max-w-[480px] text-[15px] leading-6 text-[#60717c]">{description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#eef3f4] px-5 py-20 sm:px-8 lg:py-28">
        <div className="mx-auto grid max-w-[1240px] items-center gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#17875a]">Evidence, in context</p>
            <h2 className="mt-4 text-3xl font-semibold leading-tight text-[#0b2942] sm:text-4xl">From a name to a defensible view</h2>
            <p className="mt-5 text-base leading-7 text-[#60717c]">
              Open a profile and understand the matter without losing the thread: case status, suit number, court, parties, timeline and related entities stay together.
            </p>
            <Link to="/select-role" className="mt-7 inline-flex items-center gap-2 text-sm font-bold text-[#0c6b4a] hover:text-[#084b36]">
              Explore the platform <ArrowRight size={17} />
            </Link>
          </div>
          <figure className="overflow-hidden rounded-md border border-[#c8d6db] bg-white shadow-[0_22px_60px_rgba(10,35,53,0.14)]">
            <div className="flex h-10 items-center gap-1.5 border-b border-[#dce5e9] bg-white px-4">
              <span className="h-2 w-2 rounded-full bg-[#cfd9dd]" />
              <span className="h-2 w-2 rounded-full bg-[#cfd9dd]" />
              <span className="h-2 w-2 rounded-full bg-[#23a36d]" />
              <span className="ml-3 text-xs font-medium text-[#6a7b85]">Juridence case workspace</span>
            </div>
            <img src="/previews/dashboard-preview.png" alt="Detailed case record in Juridence" className="block w-full" />
          </figure>
        </div>
      </section>

      <section id="workflow" className="px-5 py-20 sm:px-8 lg:py-28">
        <div className="mx-auto max-w-[1240px]">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#17875a]">A clear workflow</p>
              <h2 className="mt-4 text-3xl font-semibold text-[#0b2942] sm:text-4xl">Research with confidence</h2>
            </div>
            <p className="max-w-[470px] text-base leading-7 text-[#60717c]">Designed for repeated, high-stakes review without adding unnecessary complexity to your team&apos;s process.</p>
          </div>
          <div className="mt-12 grid gap-8 border-t border-[#dce5e9] pt-9 md:grid-cols-3">
            {workflow.map(([number, title, description]) => (
              <article key={number} className="pr-6">
                <p className="text-sm font-bold text-[#d49218]">{number}</p>
                <h3 className="mt-5 text-xl font-semibold text-[#102f49]">{title}</h3>
                <p className="mt-3 text-[15px] leading-6 text-[#60717c]">{description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#0b2942] px-5 py-16 text-white sm:px-8">
        <div className="mx-auto flex max-w-[1240px] flex-col justify-between gap-8 md:flex-row md:items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#9ce0c4]">Built for trusted decisions</p>
            <h2 className="mt-3 max-w-[680px] text-3xl font-semibold leading-tight sm:text-4xl">Give your team a clearer view of legal risk.</h2>
          </div>
          <Link to="/select-role" className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-md bg-[#f2b84b] px-6 text-sm font-bold text-[#172234] hover:bg-[#ffd16f]">
            Request access <ArrowRight size={17} />
          </Link>
        </div>
      </section>

      <footer className="border-t border-[#dce5e9] px-5 py-10 sm:px-8">
        <div className="mx-auto flex max-w-[1240px] flex-col justify-between gap-7 sm:flex-row sm:items-center">
          <div>
            <img src="/logos/main-logo.png" alt="Juridence" className="h-8 w-auto" />
            <p className="mt-3 text-sm text-[#687983]">Legal intelligence for better decisions.</p>
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-3 text-sm font-medium text-[#526773]">
            <Link to="/login" className="hover:text-[#0b2942]">Log in</Link>
            <a href="#platform" className="hover:text-[#0b2942]">Platform</a>
            <a href="mailto:info@juridence.com" className="hover:text-[#0b2942]">Contact</a>
          </div>
        </div>
        <div className="mx-auto mt-8 flex max-w-[1240px] items-center justify-between border-t border-[#e3eaed] pt-6 text-xs text-[#7a8991]">
          <p>© {new Date().getFullYear()} Juridence.</p>
          <div className="flex items-center gap-2"><Building2 size={14} /> Built for Ghana&apos;s legal ecosystem</div>
        </div>
      </footer>
    </main>
  );
};

export default Home;
