import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';

const defaultItems = [
  'Role-aware workspace access',
  'Search activity auditing',
  'Source-linked legal records',
];

const AuthShell = ({
  panelTitle,
  title,
  subtitle,
  children,
  asideTitle = 'Workspace controls',
  asideItems = defaultItems,
  meta = 'Juridence due diligence workspace · Production',
  wide = false,
}) => (
  <div className="dd-auth-page">
    <header className="dd-auth-topbar">
      <Link to="/" aria-label="Juridence home"><img src="/logos/main-logo.png" alt="Juridence" /></Link>
      <span className="dd-login-env">LIVE</span>
      <nav><Link to="/">Juridence website</Link><a href="mailto:support@dennislawgh.com">Support</a></nav>
    </header>

    <main className={`dd-auth-main${wide ? ' is-wide' : ''}`}>
      <section className="dd-auth-panel">
        <div className="dd-auth-panel-head">
          <span>{panelTitle}</span>
          <small><i /> Secure connection</small>
        </div>
        <div className="dd-auth-title">
          <h1>{title}</h1>
          {subtitle && <p>{subtitle}</p>}
        </div>
        <div className="dd-auth-body">{children}</div>
        <div className="dd-auth-meta">{meta}</div>
      </section>

      <aside className="dd-auth-aside">
        <div className="dd-auth-aside-head"><strong>Juridence account</strong><span>Live environment</span></div>
        <div className="dd-auth-aside-section">
          <strong>{asideTitle}</strong>
          <ul>{asideItems.map((item) => <li key={item}><ShieldCheck size={15} /> {item}</li>)}</ul>
        </div>
        <div className="dd-auth-support">
          <strong>Need help?</strong>
          <p>Contact your organisation administrator or the Juridence support team.</p>
          <a href="mailto:support@dennislawgh.com">support@dennislawgh.com</a>
        </div>
      </aside>
    </main>

    <footer className="dd-auth-footer"><span>© 2026 Juridence</span><Link to="/">Platform</Link><a href="mailto:support@dennislawgh.com">Support</a></footer>
  </div>
);

export default AuthShell;
