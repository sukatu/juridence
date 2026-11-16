import React from 'react';
import {
  Bell,
  ClipboardList,
  CreditCard,
  FileText,
  LayoutDashboard,
  UsersRound,
} from 'lucide-react';
import WorkspaceSidebar from './ui/WorkspaceSidebar';

const sections = [
  {
    label: 'Workspace',
    items: [
      { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
      { id: 'billing', label: 'Billing', icon: CreditCard },
    ],
  },
  {
    label: 'Court records',
    items: [
      { id: 'cause-list', label: 'Cause list', icon: FileText },
      { id: 'case-profile', label: 'Case profiles', icon: FileText },
    ],
  },
  {
    label: 'Operations',
    items: [
      { id: 'registrars', label: 'Registrars', icon: UsersRound },
      { id: 'pending-tasks', label: 'Pending tasks', icon: ClipboardList },
      { id: 'notifications', label: 'Notifications', icon: Bell },
    ],
  },
];

const CourtRegistrarNavbar = ({ activeTab, setActiveTab, onLogout }) => (
  <WorkspaceSidebar
    sections={sections}
    activeTab={activeTab}
    onNavigate={setActiveTab}
    onLogout={onLogout}
    workspaceLabel="Court registry"
  />
);

export default CourtRegistrarNavbar;
