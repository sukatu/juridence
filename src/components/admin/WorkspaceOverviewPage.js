import React from 'react';

import AdminDashboardOverview from '../AdminDashboardOverview';

const WorkspaceOverviewPage = ({ userInfo, onNavigate }) => (
  <AdminDashboardOverview userInfo={userInfo} onNavigate={onNavigate} />
);

export default WorkspaceOverviewPage;
