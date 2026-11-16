import React from 'react';
import {
  Bell,
  Building2,
  CreditCard,
  Eye,
  FileText,
  HelpCircle,
  LayoutDashboard,
  Search,
  UserRound,
  UsersRound,
} from 'lucide-react';
import WorkspaceSidebar from './ui/WorkspaceSidebar';

const sections = [
  {
    label: 'Workspace',
    items: [
      { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
      { id: 'billing', label: 'Billing', icon: CreditCard },
      { id: 'team', label: 'Team members', icon: UsersRound },
    ],
  },
  {
    label: 'Intelligence',
    items: [
      { id: 'search', label: 'Search', icon: Search },
      { id: 'persons', label: 'People', icon: UserRound },
      { id: 'companies', label: 'Companies', icon: Building2 },
      { id: 'watchlist', label: 'Watchlist', icon: Eye },
    ],
  },
  {
    label: 'Activity',
    items: [
      { id: 'requests-exports', label: 'Requests & exports', icon: FileText },
      { id: 'notifications', label: 'Notifications', icon: Bell },
      { id: 'help-support', label: 'Help & support', icon: HelpCircle },
    ],
  },
];

const CorporateClientNavbar = ({ activeTab, setActiveTab, onLogout }) => (
  <WorkspaceSidebar
    sections={sections}
    activeTab={activeTab}
    onNavigate={setActiveTab}
    onLogout={onLogout}
    workspaceLabel="Corporate"
  />
);

export default CorporateClientNavbar;
