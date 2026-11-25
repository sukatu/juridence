import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Building2,
  Check,
  Database,
  FileCheck2,
  FileSearch,
  Menu,
  ShieldCheck,
  X,
} from 'lucide-react';

const coverage = [
  ['2,253', 'Pending court cases'],
  ['4,760', 'Indexed party records'],
  ['19', 'Bank data sources'],
  ['Official', 'Gazette and registry data'],
];

const capabilities = [
  ['Entity enquiry', 'Search a company, individual or suit number across the available Juridence databases.', FileSearch],
  ['Due diligence reports', 'Review structured findings with the case title, court, suit number, status and source.', FileCheck2],
  ['Source intelligence', 'Keep every result traceable to its originating court export or official publication.', Database],
  ['Compliance controls', 'Support controlled access, auditable searches and consistent review workflows.', ShieldCheck],
  ['Organisation records', 'Connect people, companies, banks and legal proceedings in one operational workspace.', Building2],
  ['Verified decisions', 'Give legal and risk teams evidence they can inspect before making a decision.', Check],
];

const Home = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="dd-public-site">
      <header className="dd-public-nav">
        <Link to="/" className="dd-public-logo" aria-label="Juridence home">
          <img src="/logos/main-logo.png" alt="Juridence" />
        </Link>
        <button type="button" className="dd-public-menu" onClick={() => setMenuOpen((open) => !open)} aria-label="Toggle navigation">
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
        <nav className={menuOpen ? 'is-open' : ''}>
          <a href="#platform">Platform</a>
          <a href="#coverage">Data coverage</a>
          <a href="#solutions">Solutions</a>
          <a href="#security">Security & compliance</a>
        </nav>
        <div className="dd-public-actions">
          <a href="#contact" className="dd-button dd-button-outline">Request a demo</a>
          <Link to="/login" className="dd-button">Go to workspace</Link>
        </div>
      </header>

      <main>
        <section className="dd-hero">
          <div className="dd-public-wrap dd-hero-grid">
            <div className="dd-hero-copy">
              <p className="dd-kicker">Counterparty due diligence · Ghana</p>
              <h1>Court and registry intelligence for credit, compliance and legal teams.</h1>
              <p className="dd-hero-lead">Juridence brings pending cases, people, companies and gazette records into one enquiry. Confirm the subject, review the source record and make decisions with evidence in view.</p>
              <div className="dd-hero-actions">
                <a href="#contact" className="dd-button dd-button-light">Request a demo</a>
                <Link to="/login" className="dd-button dd-button-hero">Open Juridence <ArrowRight size={15} /></Link>
              </div>
              <ul className="dd-proof-list">
                <li>Every case finding carries its suit number and court</li>
                <li>Search by any part of a party name or case title</li>
                <li>Built for repeatable due diligence workflows</li>
              </ul>
            </div>

            <div className="dd-product-preview" aria-label="Juridence search preview">
              <div className="dd-preview-bar"><strong>juridence</strong><span>Entity enquiry - name</span><b>LIVE</b></div>
              <div className="dd-preview-title"><strong>PHILLIP OFORI-ASANTE</strong><span>Entity record</span></div>
              <div className="dd-preview-meta">
                <div><span>Record type</span><b>Individual</b></div>
                <div><span>Pending cases</span><b>1</b></div>
                <div><span>Source</span><b>Access Bank</b></div>
              </div>
              <div className="dd-preview-tabs"><b>Pending cases 1</b><span>People</span><span>Companies</span><span>Gazette</span></div>
              <table>
                <thead><tr><th>Suit no.</th><th>Case title</th><th>Court</th><th>Status</th></tr></thead>
                <tbody><tr><td>INDL/43/2013</td><td>PHILLIP OFORI-ASANTE VS ACCESS BANK (GHANA) LIMITED</td><td>High Court</td><td><em>Process Service</em></td></tr></tbody>
              </table>
            </div>
          </div>
        </section>

        <section id="coverage" className="dd-coverage-band">
          <div className="dd-public-wrap dd-public-stats">
            {coverage.map(([value, label]) => <div key={label}><strong>{value}</strong><span>{label}</span></div>)}
          </div>
        </section>

        <section id="platform" className="dd-public-section">
          <div className="dd-public-wrap">
            <p className="dd-kicker dd-kicker-blue">Platform</p>
            <h2>One enquiry. Every relevant record. A result your team can review.</h2>
            <div className="dd-steps">
              <article><span>1</span><h3>Enquire</h3><p>Enter a company, individual, party name or suit number using the same reliable search controls across the platform.</p></article>
              <article><span>2</span><h3>Confirm the record</h3><p>Review the correct result with its source bank, matched party, court, status and creation date.</p></article>
              <article><span>3</span><h3>Decide with evidence</h3><p>Move from a name to the underlying legal and registry information without losing source context.</p></article>
            </div>
          </div>
        </section>

        <section id="solutions" className="dd-public-section dd-public-section-alt">
          <div className="dd-public-wrap">
            <p className="dd-kicker dd-kicker-blue">Capabilities</p>
            <h2>Built for practical legal and risk work.</h2>
            <div className="dd-capability-grid">
              {capabilities.map(([title, text, Icon]) => (
                <article key={title}><Icon size={19} /><h3>{title}</h3><p>{text}</p></article>
              ))}
            </div>
          </div>
        </section>

        <section id="security" className="dd-public-section">
          <div className="dd-public-wrap dd-security-grid">
            <div><p className="dd-kicker dd-kicker-blue">Security & compliance</p><h2>Controls that support accountable research.</h2><p>Juridence is designed for authorised teams working with sensitive legal and corporate information. Access, search and review workflows stay inside a clear operational workspace.</p></div>
            <dl>
              <div><dt>Access control</dt><dd>Role-aware workspaces for administrators, registrars and corporate teams.</dd></div>
              <div><dt>Auditability</dt><dd>Dedicated audit, search-request and reporting views.</dd></div>
              <div><dt>Data accuracy</dt><dd>Source labels, suit numbers, dates and matched-party context remain visible.</dd></div>
            </dl>
          </div>
        </section>

        <section id="contact" className="dd-cta">
          <div className="dd-public-wrap"><div><p className="dd-kicker">Juridence workspace</p><h2>See the complete due diligence workflow.</h2><p>Review the platform with the names, institutions and legal records relevant to your organisation.</p></div><Link to="/login" className="dd-button dd-button-light">Go to workspace</Link></div>
        </section>
      </main>

      <footer className="dd-public-footer"><div className="dd-public-wrap"><img src="/logos/logo-white.png" alt="Juridence" /><p>Legal intelligence for better-informed decisions.</p><span>© 2026 Juridence. All rights reserved.</span></div></footer>
    </div>
  );
};

export default Home;
