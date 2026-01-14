import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';
import Services from './pages/Services';
import People from './pages/People';
import PersonProfile from './pages/PersonProfile';
import CaseDetail from './pages/CaseDetail';
import CaseDetails from './pages/CaseDetails';
import CaseSearchResults from './pages/CaseSearchResults';
import Results from './pages/Results';
import PeopleResults from './pages/PeopleResults';
import BanksResults from './pages/BanksResults';
import InsuranceResults from './pages/InsuranceResults';
import CompaniesResults from './pages/CompaniesResults';
import SearchResults from './pages/SearchResults';
import Signup from './pages/Signup';
import Onboarding from './pages/Onboarding';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Banks from './pages/Banks';
import BankDetail from './pages/BankDetail';
import Insurance from './pages/Insurance';
import InsuranceDetail from './pages/InsuranceDetail';
import InsuranceProfile from './pages/InsuranceProfile';
import Companies from './pages/Companies';
import CompanyDetail from './pages/CompanyDetail';
import CompanyProfile from './pages/CompanyProfile';
import Settings from './pages/Settings';
import Notifications from './pages/Notifications';
import EnhancedSearchResults from './pages/EnhancedSearchResults';
import AdminDashboard from './pages/AdminDashboard';
import CourtRegistrarDashboard from './pages/CourtRegistrarDashboard';
import CorporateClientDashboard from './pages/CorporateClientDashboard';
import EmployeeManagement from './pages/EmployeeManagement';
import EmployeeProfile from './pages/EmployeeProfile';
import PublicEmployeeProfile from './pages/PublicEmployeeProfile';
import GazetteManagement from './pages/GazetteManagement';
import GazetteAISearchPage from './pages/GazetteAISearchPage';
import Subscribe from './pages/Subscribe';
import SimpleSubscribe from './pages/SimpleSubscribe';
import JusticeLocator from './pages/JusticeLocator';
import Judges from './pages/Judges';
import JudgeDetail from './pages/JudgeDetail';
import ButtonExamples from './pages/ButtonExamples';
import SelectRole from './pages/SelectRole';
import CreateAccountOnboard from './pages/CreateAccountOnboard';
import VerifyAccount from './pages/VerifyAccount';
import VerifySuccess from './pages/VerifySuccess';

function AppContent() {
  const location = useLocation();
  const isHomePage = location.pathname === '/';
  
  // Pages that should not show header or footer
  const onboardingPages = [
    '/select-role',
    '/create-account',
    '/verify-account',
    '/verify-success',
    '/login',
    '/signup',
    '/forgot-password'
  ];
  
  // Pages without header and footer (full-screen pages)
  const fullScreenPages = [
    '/gazette-ai-search'
  ];
  
  // Check if current route is an admin, registrar, or corporate client route
  const isAdminRoute = location.pathname.startsWith('/admin');
  const isRegistrarRoute = location.pathname.startsWith('/registrar');
  const isCorporateRoute = location.pathname.startsWith('/corporate');
  
  const shouldShowHeaderFooter = !isHomePage && !onboardingPages.includes(location.pathname) && !fullScreenPages.includes(location.pathname) && !isAdminRoute && !isRegistrarRoute && !isCorporateRoute;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      {shouldShowHeaderFooter && <Header />}
      <main>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/services" element={<Services />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/people-results" element={<PeopleResults />} />
              <Route path="/banks-results" element={<BanksResults />} />
              <Route path="/insurance-results" element={<InsuranceResults />} />
              <Route path="/companies-results" element={<CompaniesResults />} />
              <Route path="/search-results" element={<SearchResults />} />
              <Route path="/people" element={<People />} />
              <Route path="/person-profile/:id" element={<PersonProfile />} />
              <Route path="/case-detail" element={<CaseDetail />} />
              <Route path="/case-details/:caseId" element={<CaseDetails />} />
              <Route path="/case-search" element={<CaseSearchResults />} />
              <Route path="/enhanced-search" element={<EnhancedSearchResults />} />
              <Route path="/results" element={<Results />} />
              <Route path="/signup" element={<SelectRole />} />
              <Route path="/login" element={<Login />} />
              <Route path="/select-role" element={<SelectRole />} />
              <Route path="/create-account" element={<CreateAccountOnboard />} />
              <Route path="/verify-account" element={<VerifyAccount />} />
              <Route path="/verify-success" element={<VerifySuccess />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/banks" element={<Banks />} />
              <Route path="/bank-detail/:id" element={<BankDetail />} />
              <Route path="/insurance" element={<Insurance />} />
              <Route path="/insurance-detail" element={<InsuranceDetail />} />
              <Route path="/insurance-profile/:id" element={<InsuranceProfile />} />
              <Route path="/companies" element={<Companies />} />
              <Route path="/company-details/:id" element={<CompanyDetail />} />
              <Route path="/company-profile/:id" element={<CompanyProfile />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/registrar" element={<CourtRegistrarDashboard />} />
              <Route path="/corporate" element={<CorporateClientDashboard />} />
              <Route path="/admin/employees" element={<EmployeeManagement />} />
              <Route path="/admin/employees/:id" element={<EmployeeProfile />} />
              <Route path="/employee/:id" element={<PublicEmployeeProfile />} />
              <Route path="/gazette" element={<GazetteManagement />} />
              <Route path="/gazette-ai-search" element={<GazetteAISearchPage />} />
              <Route path="/subscribe" element={<SimpleSubscribe />} />
              <Route path="/subscribe-full" element={<Subscribe />} />
              <Route path="/justice-locator" element={<JusticeLocator />} />
              <Route path="/judges" element={<Judges />} />
              <Route path="/judges/:id" element={<JudgeDetail />} />
              <Route path="/button-examples" element={<ButtonExamples />} />
            </Routes>
      </main>
      {shouldShowHeaderFooter && <Footer />}
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <Router>
        <AppContent />
      </Router>
    </ThemeProvider>
  );
}

export default App;
