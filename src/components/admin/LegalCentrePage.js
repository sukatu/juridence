import React, { useState } from 'react';
import {
  BookOpen,
  CheckCircle2,
  FileWarning,
  LockKeyhole,
  Printer,
  Scale,
  ShieldCheck,
} from 'lucide-react';

const policies = [
  {
    id: 'terms', title: 'Terms of Use', icon: Scale, summary: 'Rules governing authorised use of Juridence and its reports.', version: '1.1', owner: 'Legal & Compliance',
    sections: [
      ['Permitted purpose', 'Juridence is provided for lawful due diligence, legal research, credit, insurance, fraud-prevention and related professional risk review. A user must have a legitimate and permitted purpose before searching for a person or organisation.'],
      ['Report scope', 'A full entity report considers the records linked to the confirmed entity across the selected databases. A single-item report considers only the identified case, notice or record and must not be treated as a complete profile.'],
      ['Responsible decisions', 'Results are indicators for review. Users must verify identity, context, material facts and cited source records before making an adverse, credit, insurance, employment or legal decision.'],
      ['No legal advice', 'Summaries, ratings and risk commentary support screening and professional review. They are not legal advice, a court record, a credit score or a substitute for the original source.'],
      ['Account security', 'Users are responsible for protecting credentials, keeping access personal and promptly reporting suspected misuse. Activity performed through an account may be recorded for security and auditability.'],
    ],
  },
  {
    id: 'privacy', title: 'Privacy Notice', icon: ShieldCheck, summary: 'How account, search and public-record data is handled.', version: '1.1', owner: 'Data Protection',
    sections: [
      ['Information processed', 'Juridence processes account and organisation details, authentication and security events, search and report activity, user-provided material, and information drawn from official or public records.'],
      ['Purposes', 'Information is used to provide and secure the service, return relevant records, prepare reports, maintain audit trails, correct data, support users and meet applicable legal or contractual obligations.'],
      ['Identity and matching', 'Names may be normalised or associated with known aliases to improve retrieval. A name match alone does not establish identity; users must confirm identifiers and contextual evidence before relying on a record.'],
      ['Retention and access', 'Information is retained for the operational, security, contractual or legal period applicable to the record. Access is limited by account, organisation and role, with credential ownership and security events scoped to the signed-in user.'],
      ['Rights and requests', 'A request to access, correct or otherwise exercise an applicable data-protection right should identify the person, the relevant Juridence record and the evidence supporting the request.'],
    ],
  },
  {
    id: 'acceptable-use', title: 'Acceptable Use', icon: CheckCircle2, summary: 'Safeguards for lawful, fair and proportionate screening.', version: '1.0', owner: 'Trust & Safety',
    sections: [
      ['Prohibited activity', 'Do not use Juridence unlawfully, attempt unauthorised access, bypass technical controls, scrape at unreasonable volume, misrepresent a result, disclose credentials or use information to harass or discriminate.'],
      ['Human review', 'Automated, bulk or risk-rated results must remain subject to meaningful human review, appropriate escalation and the decision standards of the user’s organisation.'],
      ['Data handling', 'Reports and exported data must be shared only with authorised recipients, protected in transit and storage, and retained only while required for the permitted purpose.'],
      ['API use', 'API integrations must use credentials owned by the accountable user and follow published authentication, permission, rate-limit and data-security requirements. Revoked credentials must no longer be used.'],
    ],
  },
  {
    id: 'sources', title: 'Data Sources Notice', icon: BookOpen, summary: 'Source provenance, coverage dates and known limitations.', version: '1.2', owner: 'Data Operations',
    sections: [
      ['Court records', 'Coverage may include pending court cases, cause-list or case-management records, and published or digested judgments. Court, suit number, role, status, source name, publication or capture date, and judgment date are retained when the source provides them.'],
      ['Corporate lifecycle records', 'Companies Bulletin, Ghana Gazette and Registrar material may include incorporation, intended strike-off, dissolution, liquidation, winding up, change of company name and cessation of business. Each item retains the source publication, issue or notice reference, publication date, capture date and relevant effective date when available.'],
      ['Entity consolidation', 'Equivalent legal-name variants may be consolidated under one entity profile while the source spelling remains available as an alias. Records involving several distinct parties are not treated as one entity merely because they appear in the same case title or notice.'],
      ['Freshness and completeness', 'Coverage dates and update frequency vary by source. A record may be amended, discontinued, restored, appealed or superseded after capture. The absence of a result is not evidence of good standing, solvency or the absence of disputes.'],
      ['Verification', 'Material findings should be checked against the cited source, the relevant registry or court, and any later document that may change the position. Source & dates metadata in the record supports this review.'],
    ],
  },
  {
    id: 'correction', title: 'Correction & Complaints', icon: FileWarning, summary: 'How to challenge or correct information in a record.', version: '1.0', owner: 'Data Quality',
    sections: [
      ['What to provide', 'Identify the Juridence entity or record, explain the disputed field, state the requested correction and provide supporting evidence such as an order, registry extract, notice, certificate or identity document.'],
      ['How to submit', 'Send the request through the support route in the applicable customer agreement or to the organisation’s Juridence workspace administrator, who can preserve the report reference and escalation context.'],
      ['Review process', 'Requests are logged, assessed against the cited source and escalated where identity, legal status or source interpretation requires further verification. The original source value and correction evidence should remain traceable.'],
      ['Outcome', 'The requester is notified when the review is completed, when the source is confirmed, or when additional information is required. A correction to Juridence does not alter the originating court, registry or publication.'],
    ],
  },
  {
    id: 'security', title: 'Information Security', icon: LockKeyhole, summary: 'Administrative, technical and operational safeguards.', version: '1.1', owner: 'Security',
    sections: [
      ['Access control', 'Juridence uses authenticated sessions, organisation scoping, role-based access and user-owned API credentials to control access. Two-factor authentication is available for additional account protection.'],
      ['Auditability', 'Workspace activity, data changes and security events may be recorded with actor, time, resource, network and device context. Audit access is scoped to the signed-in organisation.'],
      ['Operational security', 'Source ingestion, entity consolidation, report generation and administrative changes should be validated, attributable and recoverable without removing the underlying audit history.'],
      ['Incident response', 'Suspected security incidents should be reported promptly so access can be contained, evidence preserved, impact assessed and affected parties or authorities notified where required.'],
    ],
  },
];

const LegalCentrePage = () => {
  const [activeId, setActiveId] = useState('terms');
  const active = policies.find((policy) => policy.id === activeId) || policies[0];
  const ActiveIcon = active.icon;

  return (
    <section className="dd-module-shell dd-legal-centre">
      <div className="dd-module-heading">
        <div><p className="dd-eyebrow">Governance</p><h2>Legal Centre</h2><p>Operational terms and policy notices for users and people named in Juridence records.</p></div>
        <button type="button" className="dd-button dd-button-secondary" onClick={() => window.print()}><Printer size={15} /> Print selected policy</button>
      </div>
      <div className="dd-legal-layout">
        <nav className="dd-policy-nav" aria-label="Legal policies">{policies.map((policy) => { const Icon = policy.icon; return <button type="button" key={policy.id} className={activeId === policy.id ? 'is-active' : ''} onClick={() => setActiveId(policy.id)}><Icon size={16} /><span><strong>{policy.title}</strong><small>{policy.summary}</small></span></button>; })}</nav>
        <article className="dd-policy-document">
          <header><span><ActiveIcon size={21} /></span><div><small>Juridence policy</small><h3>{active.title}</h3><p>{active.summary}</p></div></header>
          <div className="dd-policy-meta"><span>Version {active.version}</span><span>Effective 24 November 2026</span><span>Last reviewed 24 November 2026</span><span>Owner: {active.owner}</span></div>
          {active.sections.map(([title, copy], index) => <section key={title}><h4>{index + 1}. {title}</h4><p>{copy}</p></section>)}
          <footer>This is an operational policy draft for the Juridence workspace. Final publication should be approved against the customer agreement, actual processing practices and applicable Ghanaian law.</footer>
        </article>
      </div>
    </section>
  );
};

export default LegalCentrePage;
