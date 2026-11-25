import React from 'react';

const screenCodes = {
  'Database Search': 'JUR.ENQ.001',
  'Entity Enquiry': 'JUR.ENQ.001',
  'Batch Screening': 'JUR.ENQ.002',
  Watchlist: 'JUR.MON.001',
  'Due Diligence Reports': 'JUR.RPT.002',
  'Dashboard Overview': 'JUR.DSH.001',
  'Clients & Registrars': 'JUR.ADM.001',
  'User Management': 'JUR.ADM.002',
  'Person Search': 'JUR.PER.001',
  'People Records': 'JUR.PER.002',
  Companies: 'JUR.ENT.001',
  'Cause List': 'JUR.CAS.001',
  'Case Profiles': 'JUR.CAS.002',
  Gazette: 'JUR.GAZ.001',
  'Search Requests': 'JUR.REQ.001',
  'Reports & Logs': 'JUR.RPT.001',
  'Data Sources': 'JUR.DAT.001',
  'Data Ingestion': 'JUR.DAT.002',
  'Billing & Plan': 'JUR.ADM.006',
  'Revenue & Billing': 'JUR.ADM.006',
  Subscriptions: 'JUR.ADM.007',
  'API & Integrations': 'JUR.ADM.003',
  'Audit Log': 'JUR.ADM.004',
  'Roles & Permissions': 'JUR.ADM.008',
  'Team & Roles': 'JUR.ORG.001',
  Organisations: 'JUR.ADM.009',
  Courts: 'JUR.DAT.003',
  Settings: 'JUR.ADM.005',
  Documentation: 'JUR.DOC.001',
  'System Logs': 'JUR.ADM.010',
  'Legal Centre': 'JUR.LEG.001',
};

const AdminHeader = ({ contextLabel = 'Juridence Workspace' }) => (
  <header className="dd-page-header">
    <div>
      <h1>{contextLabel}</h1>
      <span className="dd-screen-code">{screenCodes[contextLabel] || 'JUR.APP.001'}</span>
    </div>
    <p>Juridence operations workspace</p>
  </header>
);

export default AdminHeader;
