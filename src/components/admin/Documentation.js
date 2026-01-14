import React, { useState } from 'react';
import { 
  BookOpen, 
  Code, 
  FileCode, 
  HelpCircle, 
  ExternalLink, 
  Copy, 
  Check,
  ChevronRight,
  ChevronDown,
  Globe,
  Key,
  Database,
  Users,
  Shield,
  Zap,
  Search,
  BarChart3,
  Settings,
  MoreHorizontal,
  AlertCircle,
  Info,
  CheckCircle,
  XCircle,
  Play,
  Download,
  Eye,
  Terminal,
  Server,
  Lock,
  Unlock,
  RefreshCw,
  Clock,
  TrendingUp,
  Activity,
  FolderOpen,
  MessageCircle
} from 'lucide-react';
import AIChat from '../AIChat';

const Documentation = () => {
  const [activeSection, setActiveSection] = useState('overview');
  const [expandedItems, setExpandedItems] = useState({});
  const [copiedCode, setCopiedCode] = useState('');
  
  // AI Chat state
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);

  const toggleExpanded = (itemId) => {
    setExpandedItems(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(''), 2000);
  };

  const sections = [
    {
      id: 'overview',
      title: 'System Overview',
      icon: BookOpen,
      content: (
        <div className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-3">Juridence Legal Database System</h3>
            <p className="text-blue-800 mb-4">
              A comprehensive legal database system providing access to case law, legal entities, and AI-powered legal assistance.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-lg p-4 border border-blue-200">
                <Database className="h-8 w-8 text-blue-600 mb-2" />
                <h4 className="font-semibold text-blue-900">Database</h4>
                <p className="text-sm text-blue-700">11,911+ Cases, 6,340+ People, 34 Banks, 49 Insurance Companies, 4,829+ Companies, 10+ Employees</p>
              </div>
              <div className="bg-white rounded-lg p-4 border border-blue-200">
                <Zap className="h-8 w-8 text-blue-600 mb-2" />
                <h4 className="font-semibold text-blue-900">AI Integration</h4>
                <p className="text-sm text-blue-700">GPT-4 powered legal analysis and case summaries</p>
              </div>
              <div className="bg-white rounded-lg p-4 border border-blue-200">
                <Shield className="h-8 w-8 text-blue-600 mb-2" />
                <h4 className="font-semibold text-blue-900">Security</h4>
                <p className="text-sm text-blue-700">Role-based access control and API key authentication</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg border border-slate-200 p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Key Features</h3>
              <ul className="space-y-2">
                <li className="flex items-center text-slate-700">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Unified search across all legal entities
                </li>
                <li className="flex items-center text-slate-700">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  AI-powered case analysis and summaries
                </li>
                <li className="flex items-center text-slate-700">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Comprehensive legal entity management
                </li>
                <li className="flex items-center text-slate-700">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Real-time analytics and reporting
                </li>
                <li className="flex items-center text-slate-700">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Employee management with LinkedIn-style profiles
                </li>
                <li className="flex items-center text-slate-700">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  File repository for document management
                </li>
                <li className="flex items-center text-slate-700">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  RESTful API for developers
                </li>
                <li className="flex items-center text-slate-700">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Multi-tenant architecture
                </li>
              </ul>
            </div>

            <div className="bg-white rounded-lg border border-slate-200 p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">System Architecture</h3>
              <div className="space-y-3">
                <div className="flex items-center text-slate-700">
                  <Server className="h-4 w-4 text-slate-500 mr-2" />
                  <span>Backend: FastAPI (Python)</span>
                </div>
                <div className="flex items-center text-slate-700">
                  <Globe className="h-4 w-4 text-slate-500 mr-2" />
                  <span>Frontend: React.js</span>
                </div>
                <div className="flex items-center text-slate-700">
                  <Database className="h-4 w-4 text-slate-500 mr-2" />
                  <span>Database: PostgreSQL</span>
                </div>
                <div className="flex items-center text-slate-700">
                  <Zap className="h-4 w-4 text-slate-500 mr-2" />
                  <span>AI: OpenAI GPT-4</span>
                </div>
                <div className="flex items-center text-slate-700">
                  <Shield className="h-4 w-4 text-slate-500 mr-2" />
                  <span>Authentication: JWT + API Keys</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'api-docs',
      title: 'API Documentation',
      icon: Code,
      content: (
        <div className="space-y-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-green-900 mb-3">REST API Endpoints</h3>
            <p className="text-green-800 mb-4">
              Complete REST API documentation for integrating with the Juridence Legal Database System.
            </p>
            <div className="bg-white rounded-lg p-4 border border-green-200">
              <h4 className="font-semibold text-green-900 mb-2">Base URL</h4>
              <code className="text-green-800 bg-green-100 px-2 py-1 rounded">https://api.juridence.com</code>
              <p className="text-sm text-green-700 mt-2">All API requests should be made to this base URL</p>
            </div>
          </div>

          <div className="space-y-6">
            {/* Authentication */}
            <div className="bg-white rounded-lg border border-slate-200 p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
                <Key className="h-5 w-5 mr-2 text-slate-600" />
                Authentication
              </h3>
              <div className="space-y-4">
                <div className="border border-slate-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-sm bg-red-100 text-red-800 px-2 py-1 rounded">POST</span>
                    <span className="font-mono text-sm text-slate-600">/auth/login</span>
                  </div>
                  <p className="text-sm text-slate-700 mb-3">Authenticate user and get access token</p>
                  <div className="bg-slate-50 rounded p-3">
                    <pre className="text-sm text-slate-800">
{`{
  "email": "user@example.com",
  "password": "password123"
}`}
                    </pre>
                  </div>
                </div>

                <div className="border border-slate-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-sm bg-green-100 text-green-800 px-2 py-1 rounded">POST</span>
                    <span className="font-mono text-sm text-slate-600">/auth/register</span>
                  </div>
                  <p className="text-sm text-slate-700 mb-3">Register new user account</p>
                  <div className="bg-slate-50 rounded p-3">
                    <pre className="text-sm text-slate-800">
{`{
  "email": "user@example.com",
  "password": "password123",
  "first_name": "John",
  "last_name": "Doe"
}`}
                    </pre>
                  </div>
                </div>

                <div className="border border-slate-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">GET</span>
                    <span className="font-mono text-sm text-slate-600">/auth/me</span>
                  </div>
                  <p className="text-sm text-slate-700 mb-3">Get current user information</p>
                  <div className="bg-slate-50 rounded p-3">
                    <pre className="text-sm text-slate-800">
{`Headers:
Authorization: Bearer <access_token>`}
                    </pre>
                  </div>
                </div>
              </div>
            </div>

            {/* Search Endpoints */}
            <div className="bg-white rounded-lg border border-slate-200 p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
                <Search className="h-5 w-5 mr-2 text-slate-600" />
                Search Endpoints (4 endpoints)
              </h3>
              <div className="space-y-4">
                <div className="border border-slate-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">GET</span>
                    <span className="font-mono text-sm text-slate-600">/api/search/unified</span>
                  </div>
                  <p className="text-sm text-slate-700 mb-3">Search across all entities (cases, people, banks, companies, insurance)</p>
                  <div className="bg-slate-50 rounded p-3">
                    <pre className="text-sm text-slate-800">
{`Query Parameters:
- query: string (required) - Search term
- limit: number (optional) - Results limit (default: 20)
- page: number (optional) - Page number (default: 1)

Example:
GET /api/search/unified?query=mahama&limit=10&page=1

Response:
{
  "results": [...],
  "total": 100,
  "page": 1,
  "limit": 10,
  "total_pages": 10,
  "has_next": true,
  "has_prev": false,
  "search_time_ms": 45.2
}`}
                    </pre>
                  </div>
                </div>

                <div className="border border-slate-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">GET</span>
                    <span className="font-mono text-sm text-slate-600">/api/search/quick</span>
                  </div>
                  <p className="text-sm text-slate-700 mb-3">Quick search for autocomplete suggestions</p>
                  <div className="bg-slate-50 rounded p-3">
                    <pre className="text-sm text-slate-800">
{`Query Parameters:
- query: string (required) - Search term
- limit: number (optional) - Results limit (default: 10)

Example:
GET /api/search/quick?query=mahama&limit=5`}
                    </pre>
                  </div>
                </div>

                <div className="border border-slate-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">POST</span>
                    <span className="font-mono text-sm text-slate-600">/api/search/advanced</span>
                  </div>
                  <p className="text-sm text-slate-700 mb-3">Advanced search with filters and complex queries</p>
                  <div className="bg-slate-50 rounded p-3">
                    <pre className="text-sm text-slate-800">
{`Request Body:
{
  "query": "mahama",
  "filters": {
    "entity_types": ["people", "cases"],
    "date_range": {
      "start": "2020-01-01",
      "end": "2024-12-31"
    }
  },
  "limit": 20,
  "page": 1
}`}
                    </pre>
                  </div>
                </div>

                <div className="border border-slate-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">GET</span>
                    <span className="font-mono text-sm text-slate-600">/api/search/stats</span>
                  </div>
                  <p className="text-sm text-slate-700 mb-3">Get search statistics and analytics</p>
                </div>
              </div>
            </div>

            {/* Complete API Reference */}
            <div className="bg-white rounded-lg border border-slate-200 p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
                <Database className="h-5 w-5 mr-2 text-slate-600" />
                Complete API Reference (303 endpoints)
              </h3>
              
              {/* Authentication Endpoints */}
              <div className="mb-8">
                <h4 className="text-md font-semibold text-slate-800 mb-3 flex items-center">
                  <Shield className="h-4 w-4 mr-2 text-green-600" />
                  Authentication (9 endpoints)
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
                  <div className="flex justify-between items-center p-2 bg-slate-50 rounded">
                    <span className="font-mono bg-green-100 text-green-800 px-2 py-1 rounded text-xs">POST</span>
                    <span className="font-mono text-slate-600">/auth/register</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-slate-50 rounded">
                    <span className="font-mono bg-green-100 text-green-800 px-2 py-1 rounded text-xs">POST</span>
                    <span className="font-mono text-slate-600">/auth/login</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-slate-50 rounded">
                    <span className="font-mono bg-green-100 text-green-800 px-2 py-1 rounded text-xs">POST</span>
                    <span className="font-mono text-slate-600">/auth/logout</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-slate-50 rounded">
                    <span className="font-mono bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">GET</span>
                    <span className="font-mono text-slate-600">/auth/me</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-slate-50 rounded">
                    <span className="font-mono bg-green-100 text-green-800 px-2 py-1 rounded text-xs">POST</span>
                    <span className="font-mono text-slate-600">/auth/forgot-password</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-slate-50 rounded">
                    <span className="font-mono bg-green-100 text-green-800 px-2 py-1 rounded text-xs">POST</span>
                    <span className="font-mono text-slate-600">/auth/reset-password</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-slate-50 rounded">
                    <span className="font-mono bg-green-100 text-green-800 px-2 py-1 rounded text-xs">POST</span>
                    <span className="font-mono text-slate-600">/auth/change-password</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-slate-50 rounded">
                    <span className="font-mono bg-green-100 text-green-800 px-2 py-1 rounded text-xs">POST</span>
                    <span className="font-mono text-slate-600">/auth/verify-email</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-slate-50 rounded">
                    <span className="font-mono bg-green-100 text-green-800 px-2 py-1 rounded text-xs">POST</span>
                    <span className="font-mono text-slate-600">/auth/google</span>
                  </div>
                </div>
              </div>

              {/* Core Entity Endpoints */}
              <div className="mb-8">
                <h4 className="text-md font-semibold text-slate-800 mb-3 flex items-center">
                  <Users className="h-4 w-4 mr-2 text-blue-600" />
                  Core Entities (47 endpoints)
                </h4>
                
                {/* People */}
                <div className="mb-4">
                  <h5 className="font-medium text-slate-700 mb-2">People (6 endpoints)</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 text-sm">
                    <div className="flex justify-between items-center p-2 bg-slate-50 rounded">
                      <span className="font-mono bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">GET</span>
                      <span className="font-mono text-slate-600">/api/people/search</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-slate-50 rounded">
                      <span className="font-mono bg-green-100 text-green-800 px-2 py-1 rounded text-xs">POST</span>
                      <span className="font-mono text-slate-600">/api/people</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-slate-50 rounded">
                      <span className="font-mono bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">GET</span>
                      <span className="font-mono text-slate-600">/api/people/&#123;id&#125;</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-slate-50 rounded">
                      <span className="font-mono bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs">PUT</span>
                      <span className="font-mono text-slate-600">/api/people/&#123;id&#125;</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-slate-50 rounded">
                      <span className="font-mono bg-red-100 text-red-800 px-2 py-1 rounded text-xs">DELETE</span>
                      <span className="font-mono text-slate-600">/api/people/&#123;id&#125;</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-slate-50 rounded">
                      <span className="font-mono bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">GET</span>
                      <span className="font-mono text-slate-600">/api/people/stats/overview</span>
                    </div>
                  </div>
                </div>

                {/* Banks */}
                <div className="mb-4">
                  <h5 className="font-medium text-slate-700 mb-2">Banks (11 endpoints)</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 text-sm">
                    <div className="flex justify-between items-center p-2 bg-slate-50 rounded">
                      <span className="font-mono bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">GET</span>
                      <span className="font-mono text-slate-600">/api/banks</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-slate-50 rounded">
                      <span className="font-mono bg-green-100 text-green-800 px-2 py-1 rounded text-xs">POST</span>
                      <span className="font-mono text-slate-600">/api/banks</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-slate-50 rounded">
                      <span className="font-mono bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">GET</span>
                      <span className="font-mono text-slate-600">/api/banks/search</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-slate-50 rounded">
                      <span className="font-mono bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">GET</span>
                      <span className="font-mono text-slate-600">/api/banks/&#123;id&#125;</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-slate-50 rounded">
                      <span className="font-mono bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs">PUT</span>
                      <span className="font-mono text-slate-600">/api/banks/&#123;id&#125;</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-slate-50 rounded">
                      <span className="font-mono bg-red-100 text-red-800 px-2 py-1 rounded text-xs">DELETE</span>
                      <span className="font-mono text-slate-600">/api/banks/&#123;id&#125;</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-slate-50 rounded">
                      <span className="font-mono bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">GET</span>
                      <span className="font-mono text-slate-600">/api/banks/stats/overview</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-slate-50 rounded">
                      <span className="font-mono bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">GET</span>
                      <span className="font-mono text-slate-600">/api/banks/&#123;id&#125;/analytics</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-slate-50 rounded">
                      <span className="font-mono bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">GET</span>
                      <span className="font-mono text-slate-600">/api/banks/&#123;id&#125;/case-statistics</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-slate-50 rounded">
                      <span className="font-mono bg-green-100 text-green-800 px-2 py-1 rounded text-xs">POST</span>
                      <span className="font-mono text-slate-600">/api/banks/&#123;id&#125;/generate-analytics</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-slate-50 rounded">
                      <span className="font-mono bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">GET</span>
                      <span className="font-mono text-slate-600">/api/banks/&#123;id&#125;/related-cases</span>
                    </div>
                  </div>
                </div>

                {/* Companies */}
                <div className="mb-4">
                  <h5 className="font-medium text-slate-700 mb-2">Companies (10 endpoints)</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 text-sm">
                    <div className="flex justify-between items-center p-2 bg-slate-50 rounded">
                      <span className="font-mono bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">GET</span>
                      <span className="font-mono text-slate-600">/api/companies</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-slate-50 rounded">
                      <span className="font-mono bg-green-100 text-green-800 px-2 py-1 rounded text-xs">POST</span>
                      <span className="font-mono text-slate-600">/api/companies</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-slate-50 rounded">
                      <span className="font-mono bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">GET</span>
                      <span className="font-mono text-slate-600">/api/companies/search</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-slate-50 rounded">
                      <span className="font-mono bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">GET</span>
                      <span className="font-mono text-slate-600">/api/companies/&#123;id&#125;</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-slate-50 rounded">
                      <span className="font-mono bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs">PUT</span>
                      <span className="font-mono text-slate-600">/api/companies/&#123;id&#125;</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-slate-50 rounded">
                      <span className="font-mono bg-red-100 text-red-800 px-2 py-1 rounded text-xs">DELETE</span>
                      <span className="font-mono text-slate-600">/api/companies/&#123;id&#125;</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-slate-50 rounded">
                      <span className="font-mono bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">GET</span>
                      <span className="font-mono text-slate-600">/api/companies/stats/overview</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-slate-50 rounded">
                      <span className="font-mono bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">GET</span>
                      <span className="font-mono text-slate-600">/api/companies/&#123;id&#125;/analytics</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-slate-50 rounded">
                      <span className="font-mono bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">GET</span>
                      <span className="font-mono text-slate-600">/api/companies/&#123;id&#125;/case-statistics</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-slate-50 rounded">
                      <span className="font-mono bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">GET</span>
                      <span className="font-mono text-slate-600">/api/companies/&#123;id&#125;/related-cases</span>
                    </div>
                  </div>
                </div>

                {/* Insurance */}
                <div className="mb-4">
                  <h5 className="font-medium text-slate-700 mb-2">Insurance (10 endpoints)</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 text-sm">
                    <div className="flex justify-between items-center p-2 bg-slate-50 rounded">
                      <span className="font-mono bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">GET</span>
                      <span className="font-mono text-slate-600">/api/insurance</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-slate-50 rounded">
                      <span className="font-mono bg-green-100 text-green-800 px-2 py-1 rounded text-xs">POST</span>
                      <span className="font-mono text-slate-600">/api/insurance</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-slate-50 rounded">
                      <span className="font-mono bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">GET</span>
                      <span className="font-mono text-slate-600">/api/insurance/search</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-slate-50 rounded">
                      <span className="font-mono bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">GET</span>
                      <span className="font-mono text-slate-600">/api/insurance/&#123;id&#125;</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-slate-50 rounded">
                      <span className="font-mono bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs">PUT</span>
                      <span className="font-mono text-slate-600">/api/insurance/&#123;id&#125;</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-slate-50 rounded">
                      <span className="font-mono bg-red-100 text-red-800 px-2 py-1 rounded text-xs">DELETE</span>
                      <span className="font-mono text-slate-600">/api/insurance/&#123;id&#125;</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-slate-50 rounded">
                      <span className="font-mono bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">GET</span>
                      <span className="font-mono text-slate-600">/api/insurance/stats/overview</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-slate-50 rounded">
                      <span className="font-mono bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">GET</span>
                      <span className="font-mono text-slate-600">/api/insurance/&#123;id&#125;/analytics</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-slate-50 rounded">
                      <span className="font-mono bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">GET</span>
                      <span className="font-mono text-slate-600">/api/insurance/&#123;id&#125;/case-statistics</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-slate-50 rounded">
                      <span className="font-mono bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">GET</span>
                      <span className="font-mono text-slate-600">/api/insurance/&#123;id&#125;/related-cases</span>
                    </div>
                  </div>
                </div>

                {/* Cases */}
                <div className="mb-4">
                  <h5 className="font-medium text-slate-700 mb-2">Cases (9 endpoints)</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 text-sm">
                    <div className="flex justify-between items-center p-2 bg-slate-50 rounded">
                      <span className="font-mono bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">GET</span>
                      <span className="font-mono text-slate-600">/api/cases</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-slate-50 rounded">
                      <span className="font-mono bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">GET</span>
                      <span className="font-mono text-slate-600">/api/cases/search</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-slate-50 rounded">
                      <span className="font-mono bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">GET</span>
                      <span className="font-mono text-slate-600">/api/cases/&#123;id&#125;</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-slate-50 rounded">
                      <span className="font-mono bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">GET</span>
                      <span className="font-mono text-slate-600">/api/cases/stats/overview</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-slate-50 rounded">
                      <span className="font-mono bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">GET</span>
                      <span className="font-mono text-slate-600">/api/case-search/search</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-slate-50 rounded">
                      <span className="font-mono bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">GET</span>
                      <span className="font-mono text-slate-600">/api/case-search/suggestions</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-slate-50 rounded">
                      <span className="font-mono bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">GET</span>
                      <span className="font-mono text-slate-600">/api/case-search/&#123;id&#125;/details</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-slate-50 rounded">
                      <span className="font-mono bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">GET</span>
                      <span className="font-mono text-slate-600">/api/case-search/&#123;id&#125;/related-cases</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-slate-50 rounded">
                      <span className="font-mono bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">GET</span>
                      <span className="font-mono text-slate-600">/api/case-search/person/&#123;name&#125;</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* AI Chat Endpoints */}
              <div className="mb-8">
                <h4 className="text-md font-semibold text-slate-800 mb-3 flex items-center">
                  <Zap className="h-4 w-4 mr-2 text-purple-600" />
                  AI Chat & Analytics (20 endpoints)
                </h4>
                
                {/* JuridenceAI Overview */}
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-4">
                  <h5 className="font-semibold text-purple-900 mb-2">🤖 JuridenceAI Features</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-purple-800">
                    <div>
                      <p><strong>Case Analysis:</strong> AI-powered legal case analysis and insights</p>
                      <p><strong>Chat Sessions:</strong> Interactive conversations about case details</p>
                    </div>
                    <div>
                      <p><strong>Case Summaries:</strong> Automated case summary generation</p>
                      <p><strong>Legal Research:</strong> Context-aware legal information</p>
                    </div>
                  </div>
                </div>

                {/* Billing & Usage Tracking */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                  <h5 className="font-semibold text-yellow-900 mb-2">💰 Billing & Usage Tracking</h5>
                  <div className="space-y-2 text-sm text-yellow-800">
                    <p><strong>Token-based Pricing:</strong> Charges based on AI model token usage</p>
                    <p><strong>Real-time Tracking:</strong> All AI interactions are logged and billed</p>
                    <p><strong>Usage Analytics:</strong> Detailed breakdown of costs per user/session</p>
                    <p><strong>Cost Estimation:</strong> Pre-calculated estimates before AI requests</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 text-sm">
                  <div className="flex justify-between items-center p-2 bg-slate-50 rounded">
                    <span className="font-mono bg-green-100 text-green-800 px-2 py-1 rounded text-xs">POST</span>
                    <span className="font-mono text-slate-600">/api/ai-chat/sessions</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-slate-50 rounded">
                    <span className="font-mono bg-green-100 text-green-800 px-2 py-1 rounded text-xs">POST</span>
                    <span className="font-mono text-slate-600">/api/ai-chat/message</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-slate-50 rounded">
                    <span className="font-mono bg-green-100 text-green-800 px-2 py-1 rounded text-xs">POST</span>
                    <span className="font-mono text-slate-600">/api/ai-chat/case-summary</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-slate-50 rounded">
                    <span className="font-mono bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">GET</span>
                    <span className="font-mono text-slate-600">/api/ai-chat/sessions/&#123;id&#125;</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-slate-50 rounded">
                    <span className="font-mono bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">GET</span>
                    <span className="font-mono text-slate-600">/api/ai-chat/analytics/usage</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-slate-50 rounded">
                    <span className="font-mono bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">GET</span>
                    <span className="font-mono text-slate-600">/api/ai-chat/analytics/users</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-slate-50 rounded">
                    <span className="font-mono bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">GET</span>
                    <span className="font-mono text-slate-600">/api/ai-chat/analytics/session/&#123;id&#125;</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-slate-50 rounded">
                    <span className="font-mono bg-red-100 text-red-800 px-2 py-1 rounded text-xs">DELETE</span>
                    <span className="font-mono text-slate-600">/api/ai-chat/sessions/&#123;id&#125;</span>
                  </div>
                </div>

                {/* JuridenceAI Usage Examples */}
                <div className="mt-4 space-y-4">
                  <div className="bg-slate-50 rounded-lg p-4">
                    <h5 className="font-semibold text-slate-900 mb-3">💬 AI Chat Session Example</h5>
                    <div className="bg-slate-800 rounded p-3">
                      <pre className="text-green-400 text-sm">
{`// Start a new AI chat session for a case
POST /api/ai-chat/sessions
{
  "case_id": 12345,
  "user_id": 67890,
  "title": "Contract Dispute Analysis"
}

// Send a message to the AI assistant
POST /api/ai-chat/message
{
  "session_id": "session_abc123",
  "message": "What are the key legal issues in this case?",
  "user_id": 67890
}

// Response includes AI analysis and cost tracking
{
  "response": "Based on the case details, the key legal issues are...",
  "tokens_used": 150,
  "cost_estimate": 0.003,
  "session_id": "session_abc123",
  "timestamp": "2024-01-15T10:30:00Z"
}`}
                      </pre>
                    </div>
                  </div>

                  <div className="bg-slate-50 rounded-lg p-4">
                    <h5 className="font-semibold text-slate-900 mb-3">📊 Usage Analytics & Billing</h5>
                    <div className="bg-slate-800 rounded p-3">
                      <pre className="text-green-400 text-sm">
{`// Get user's AI usage and billing summary
GET /api/ai-chat/analytics/users

// Response includes detailed usage breakdown
{
  "users": [
    {
      "user_id": 67890,
      "email": "user@example.com",
      "total_tokens_used": 15420,
      "total_cost": 0.3084,
      "ai_requests": 45,
      "sessions": 12,
      "last_activity": "2024-01-15T10:30:00Z",
      "subscription_plan": "Professional",
      "monthly_ai_allowance": 50000,
      "remaining_tokens": 34580
    }
  ],
  "total_users": 1,
  "total_revenue": 0.3084,
  "period": "2024-01"
}`}
                      </pre>
                    </div>
                  </div>

                  <div className="bg-slate-50 rounded-lg p-4">
                    <h5 className="font-semibold text-slate-900 mb-3">🔍 Case Summary Generation</h5>
                    <div className="bg-slate-800 rounded p-3">
                      <pre className="text-green-400 text-sm">
{`// Generate AI-powered case summary
POST /api/ai-chat/case-summary
{
  "case_id": 12345,
  "user_id": 67890,
  "summary_type": "comprehensive"
}

// Response with summary and cost
{
  "summary": "This case involves a contract dispute between...",
  "key_points": [
    "Contract validity under Ghanaian law",
    "Breach of contract allegations",
    "Damages calculation methodology"
  ],
  "tokens_used": 850,
  "cost_estimate": 0.017,
  "ai_model": "gpt-4",
  "generated_at": "2024-01-15T10:30:00Z"
}`}
                      </pre>
                    </div>
                  </div>
                </div>

                {/* Pricing Information */}
                <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h5 className="font-semibold text-blue-900 mb-3">💳 JuridenceAI Pricing</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
                    <div>
                      <h6 className="font-medium mb-2">Token Costs (USD):</h6>
                      <ul className="space-y-1">
                        <li><strong>GPT-3.5-turbo:</strong> $0.0015 per 1K tokens</li>
                        <li><strong>GPT-4:</strong> $0.03 per 1K tokens</li>
                        <li><strong>GPT-4-turbo:</strong> $0.01 per 1K tokens</li>
                      </ul>
                    </div>
                    <div>
                      <h6 className="font-medium mb-2">Subscription Tiers:</h6>
                      <ul className="space-y-1">
                        <li><strong>Free:</strong> 1,000 tokens/month</li>
                        <li><strong>Basic:</strong> 10,000 tokens/month</li>
                        <li><strong>Professional:</strong> 50,000 tokens/month</li>
                        <li><strong>Enterprise:</strong> Unlimited + custom pricing</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Admin Endpoints */}
              <div className="mb-8">
                <h4 className="text-md font-semibold text-slate-800 mb-3 flex items-center">
                  <Settings className="h-4 w-4 mr-2 text-orange-600" />
                  Admin Management (178 endpoints)
                </h4>
                <div className="text-sm text-slate-600 mb-3">
                  Complete admin interface for managing all system entities, users, roles, permissions, and system settings.
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 text-sm">
                  <div className="space-y-2">
                    <h6 className="font-medium text-slate-700">Banks (6)</h6>
                    <div className="space-y-1">
                      <div className="flex justify-between items-center p-1 bg-slate-50 rounded text-xs">
                        <span className="font-mono bg-blue-100 text-blue-800 px-1 py-0.5 rounded">GET</span>
                        <span className="font-mono text-slate-600">/api/admin/banks</span>
                      </div>
                      <div className="flex justify-between items-center p-1 bg-slate-50 rounded text-xs">
                        <span className="font-mono bg-green-100 text-green-800 px-1 py-0.5 rounded">POST</span>
                        <span className="font-mono text-slate-600">/api/admin/banks</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h6 className="font-medium text-slate-700">Companies (6)</h6>
                    <div className="space-y-1">
                      <div className="flex justify-between items-center p-1 bg-slate-50 rounded text-xs">
                        <span className="font-mono bg-blue-100 text-blue-800 px-1 py-0.5 rounded">GET</span>
                        <span className="font-mono text-slate-600">/api/admin/companies</span>
                      </div>
                      <div className="flex justify-between items-center p-1 bg-slate-50 rounded text-xs">
                        <span className="font-mono bg-green-100 text-green-800 px-1 py-0.5 rounded">POST</span>
                        <span className="font-mono text-slate-600">/api/admin/companies</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h6 className="font-medium text-slate-700">People (6)</h6>
                    <div className="space-y-1">
                      <div className="flex justify-between items-center p-1 bg-slate-50 rounded text-xs">
                        <span className="font-mono bg-blue-100 text-blue-800 px-1 py-0.5 rounded">GET</span>
                        <span className="font-mono text-slate-600">/api/admin/people</span>
                      </div>
                      <div className="flex justify-between items-center p-1 bg-slate-50 rounded text-xs">
                        <span className="font-mono bg-green-100 text-green-800 px-1 py-0.5 rounded">POST</span>
                        <span className="font-mono text-slate-600">/api/admin/people</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h6 className="font-medium text-slate-700">Users (15)</h6>
                    <div className="space-y-1">
                      <div className="flex justify-between items-center p-1 bg-slate-50 rounded text-xs">
                        <span className="font-mono bg-blue-100 text-blue-800 px-1 py-0.5 rounded">GET</span>
                        <span className="font-mono text-slate-600">/api/admin/users</span>
                      </div>
                      <div className="flex justify-between items-center p-1 bg-slate-50 rounded text-xs">
                        <span className="font-mono bg-green-100 text-green-800 px-1 py-0.5 rounded">POST</span>
                        <span className="font-mono text-slate-600">/api/admin/users</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional Endpoints */}
              <div className="mb-8">
                <h4 className="text-md font-semibold text-slate-800 mb-3 flex items-center">
                  <MoreHorizontal className="h-4 w-4 mr-2 text-gray-600" />
                  Additional Services (99 endpoints)
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                  <div className="space-y-2">
                    <h6 className="font-medium text-slate-700">Profile Management (24)</h6>
                    <div className="text-xs text-slate-600">User profiles, avatars, activity, security</div>
                  </div>
                  <div className="space-y-2">
                    <h6 className="font-medium text-slate-700">Notifications (10)</h6>
                    <div className="text-xs text-slate-600">System notifications, alerts, messaging</div>
                  </div>
                  <div className="space-y-2">
                    <h6 className="font-medium text-slate-700">Courts (10)</h6>
                    <div className="text-xs text-slate-600">Court management, locations, types</div>
                  </div>
                  <div className="space-y-2">
                    <h6 className="font-medium text-slate-700">Subscriptions (6)</h6>
                    <div className="text-xs text-slate-600">Plan management, billing, usage tracking</div>
                  </div>
                  <div className="space-y-2">
                    <h6 className="font-medium text-slate-700">Security (12)</h6>
                    <div className="text-xs text-slate-600">2FA, API keys, security events</div>
                  </div>
                  <div className="space-y-2">
                    <h6 className="font-medium text-slate-700">Analytics (37)</h6>
                    <div className="text-xs text-slate-600">Person analytics, case statistics, risk analysis</div>
                  </div>
                </div>
              </div>
            </div>

            {/* AI Endpoints */}
            <div className="bg-white rounded-lg border border-slate-200 p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
                <Zap className="h-5 w-5 mr-2 text-slate-600" />
                AI Integration
              </h3>
              <div className="space-y-4">
                <div className="border border-slate-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-sm bg-purple-100 text-purple-800 px-2 py-1 rounded">POST</span>
                    <span className="font-mono text-sm text-slate-600">/api/ai-chat/message</span>
                  </div>
                  <p className="text-sm text-slate-700 mb-3">Send message to AI chat for case analysis</p>
                  <div className="bg-slate-50 rounded p-3">
                    <pre className="text-sm text-slate-800">
{`{
  "message": "Analyze this case for me",
  "case_id": 12345,
  "session_id": "optional-session-id"
}`}
                    </pre>
                  </div>
                </div>

                <div className="border border-slate-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-sm bg-purple-100 text-purple-800 px-2 py-1 rounded">POST</span>
                    <span className="font-mono text-sm text-slate-600">/api/ai-chat/case-summary</span>
                  </div>
                  <p className="text-sm text-slate-700 mb-3">Generate AI-powered case summary</p>
                  <div className="bg-slate-50 rounded p-3">
                    <pre className="text-sm text-slate-800">
{`{
  "case_id": 12345,
  "user_id": 1
}`}
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'api-keys',
      title: 'API Key Management',
      icon: Key,
      content: (
        <div className="space-y-6">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-amber-900 mb-3">API Key Generation & Management</h3>
            <p className="text-amber-800 mb-4">
              Learn how to generate, manage, and use API keys for accessing the Juridence Legal Database System.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg border border-slate-200 p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Generating API Keys</h3>
              <div className="space-y-4">
                <div className="bg-slate-50 rounded-lg p-4">
                  <h4 className="font-semibold text-slate-900 mb-2">Step 1: Access Admin Dashboard</h4>
                  <p className="text-sm text-slate-700 mb-3">Navigate to the admin dashboard and go to the "API Keys" section.</p>
                </div>

                <div className="bg-slate-50 rounded-lg p-4">
                  <h4 className="font-semibold text-slate-900 mb-2">Step 2: Create New API Key</h4>
                  <p className="text-sm text-slate-700 mb-3">Click "Generate New Key" and provide the following information:</p>
                  <ul className="text-sm text-slate-700 space-y-1 ml-4">
                    <li>• Key Name (e.g., "Mobile App", "Web Integration")</li>
                    <li>• Description (optional)</li>
                    <li>• Permissions (Read, Write, Admin)</li>
                    <li>• Expiration Date (optional)</li>
                  </ul>
                </div>

                <div className="bg-slate-50 rounded-lg p-4">
                  <h4 className="font-semibold text-slate-900 mb-2">Step 3: Copy and Store Securely</h4>
                  <p className="text-sm text-slate-700 mb-3">Copy the generated API key and store it securely. The key will only be shown once.</p>
                  <div className="bg-red-50 border border-red-200 rounded p-3">
                    <div className="flex items-center mb-2">
                      <AlertCircle className="h-4 w-4 text-red-600 mr-2" />
                      <span className="text-sm font-semibold text-red-800">Important</span>
                    </div>
                    <p className="text-sm text-red-700">API keys are sensitive credentials. Store them securely and never expose them in client-side code.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-slate-200 p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Using API Keys</h3>
              <div className="space-y-4">
                <div className="bg-slate-50 rounded-lg p-4">
                  <h4 className="font-semibold text-slate-900 mb-2">Authentication Header</h4>
                  <p className="text-sm text-slate-700 mb-3">Include the API key in the Authorization header:</p>
                  <div className="bg-slate-800 text-green-400 rounded p-3 font-mono text-sm">
                    Authorization: Bearer your-api-key-here
                  </div>
                </div>

                <div className="bg-slate-50 rounded-lg p-4">
                  <h4 className="font-semibold text-slate-900 mb-2">Example Request</h4>
                  <div className="bg-slate-800 text-green-400 rounded p-3 font-mono text-sm">
{`curl -X GET "https://api.juridence.com/api/search/unified?query=mahama" \\
  -H "Authorization: Bearer your-api-key-here" \\
  -H "Content-Type: application/json"`}
                  </div>
                </div>

                <div className="bg-slate-50 rounded-lg p-4">
                  <h4 className="font-semibold text-slate-900 mb-2">Rate Limits</h4>
                  <div className="space-y-2 text-sm text-slate-700">
                    <div className="flex justify-between">
                      <span>Free Tier:</span>
                      <span>100 requests/hour</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Professional:</span>
                      <span>1,000 requests/hour</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Enterprise:</span>
                      <span>10,000 requests/hour</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
              <Key className="h-5 w-5 mr-2 text-slate-600" />
              API Key Management
            </h3>
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-3">Generating API Keys</h4>
                <ol className="list-decimal list-inside space-y-2 text-sm text-blue-800">
                  <li>Login to the admin dashboard at <code className="bg-blue-100 px-1 rounded">http://localhost:3000</code></li>
                  <li>Navigate to "API Keys" section in the admin panel</li>
                  <li>Click "Generate New Key" button</li>
                  <li>Set permissions and expiration date (optional)</li>
                  <li>Copy and securely store the generated key immediately</li>
                  <li>Keys are only shown once for security reasons</li>
                </ol>
              </div>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="font-semibold text-yellow-900 mb-3">Security Best Practices</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-yellow-800">
                  <li>Never expose API keys in client-side code or public repositories</li>
                  <li>Use environment variables for key storage</li>
                  <li>Rotate keys regularly (every 90 days recommended)</li>
                  <li>Set appropriate expiration dates</li>
                  <li>Monitor key usage and revoke unused keys</li>
                  <li>Use different keys for different environments (dev, staging, prod)</li>
                  <li>Implement rate limiting in your applications</li>
                </ul>
              </div>

              <div className="bg-slate-50 rounded-lg p-4">
                <h4 className="font-semibold text-slate-900 mb-3">Using API Keys</h4>
                <div className="space-y-3">
                  <div>
                    <h5 className="font-medium text-slate-700 mb-2">cURL Example:</h5>
                    <div className="bg-slate-800 rounded p-3">
                      <pre className="text-green-400 text-sm">
{`# Search for people
curl -H "Authorization: Bearer YOUR_API_KEY" \\
     -H "Content-Type: application/json" \\
     "https://api.juridence.com/api/people/search?query=mahama&limit=10"

# Get specific person details
curl -H "Authorization: Bearer YOUR_API_KEY" \\
     -H "Content-Type: application/json" \\
     "https://api.juridence.com/api/people/12345"

# Search cases
curl -H "Authorization: Bearer YOUR_API_KEY" \\
     -H "Content-Type: application/json" \\
     "https://api.juridence.com/api/case-search/search?query=contract&limit=5"`}
                      </pre>
                    </div>
                  </div>
                  
                  <div>
                    <h5 className="font-medium text-slate-700 mb-2">JavaScript/Node.js Example:</h5>
                    <div className="bg-slate-800 rounded p-3">
                      <pre className="text-green-400 text-sm">
{`const API_KEY = process.env.JURIDENCE_API_KEY;
const BASE_URL = 'https://api.juridence.com';

async function searchPeople(query) {
  const response = await fetch(\`\${BASE_URL}/api/people/search?query=\${query}\`, {
    headers: {
      'Authorization': \`Bearer \${API_KEY}\`,
      'Content-Type': 'application/json'
    }
  });
  
  if (!response.ok) {
    throw new Error(\`HTTP error! status: \${response.status}\`);
  }
  
  return await response.json();
}

// Usage
searchPeople('mahama')
  .then(data => console.log(data))
  .catch(error => console.error('Error:', error));`}
                      </pre>
                    </div>
                  </div>

                  <div>
                    <h5 className="font-medium text-slate-700 mb-2">Python Example:</h5>
                    <div className="bg-slate-800 rounded p-3">
                      <pre className="text-green-400 text-sm">
{`import requests
import os

API_KEY = os.getenv('JURIDENCE_API_KEY')
BASE_URL = 'https://api.juridence.com'

def search_people(query):
    headers = {
        'Authorization': f'Bearer {API_KEY}',
        'Content-Type': 'application/json'
    }
    
    response = requests.get(
        f'{BASE_URL}/api/people/search',
        headers=headers,
        params={'query': query, 'limit': 10}
    )
    
    response.raise_for_status()
    return response.json()

# Usage
try:
    results = search_people('mahama')
    print(results)
except requests.exceptions.RequestException as e:
    print(f'Error: {e}')`}
                      </pre>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h4 className="font-semibold text-red-900 mb-2">Rate Limits</h4>
                <div className="text-sm text-red-800 space-y-1">
                  <p><strong>Free Tier:</strong> 100 requests per hour</p>
                  <p><strong>Basic Tier:</strong> 1,000 requests per hour</p>
                  <p><strong>Professional Tier:</strong> 10,000 requests per hour</p>
                  <p><strong>Enterprise:</strong> Custom limits available</p>
                  <p className="text-xs mt-2">Rate limit headers are included in all responses: <code className="bg-red-100 px-1 rounded">X-RateLimit-Limit</code>, <code className="bg-red-100 px-1 rounded">X-RateLimit-Remaining</code>, <code className="bg-red-100 px-1 rounded">X-RateLimit-Reset</code></p>
                </div>
              </div>

              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <h4 className="font-semibold text-orange-900 mb-3">Error Handling</h4>
                <div className="space-y-3">
                  <div>
                    <h5 className="font-medium text-orange-800 mb-2">Common HTTP Status Codes:</h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                      <div className="space-y-1">
                        <p><code className="bg-orange-100 px-1 rounded">200</code> - Success</p>
                        <p><code className="bg-orange-100 px-1 rounded">201</code> - Created</p>
                        <p><code className="bg-orange-100 px-1 rounded">400</code> - Bad Request</p>
                        <p><code className="bg-orange-100 px-1 rounded">401</code> - Unauthorized</p>
                        <p><code className="bg-orange-100 px-1 rounded">403</code> - Forbidden</p>
                      </div>
                      <div className="space-y-1">
                        <p><code className="bg-orange-100 px-1 rounded">404</code> - Not Found</p>
                        <p><code className="bg-orange-100 px-1 rounded">422</code> - Validation Error</p>
                        <p><code className="bg-orange-100 px-1 rounded">429</code> - Rate Limited</p>
                        <p><code className="bg-orange-100 px-1 rounded">500</code> - Server Error</p>
                        <p><code className="bg-orange-100 px-1 rounded">503</code> - Service Unavailable</p>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h5 className="font-medium text-orange-800 mb-2">Error Response Format:</h5>
                    <div className="bg-slate-800 rounded p-3">
                      <pre className="text-orange-400 text-sm">
{`{
  "detail": "Error message description",
  "error_code": "SPECIFIC_ERROR_CODE",
  "timestamp": "2024-01-15T10:30:00Z",
  "request_id": "req_123456789"
}`}
                      </pre>
                    </div>
                  </div>

                  <div>
                    <h5 className="font-medium text-orange-800 mb-2">Retry Logic Example:</h5>
                    <div className="bg-slate-800 rounded p-3">
                      <pre className="text-orange-400 text-sm">
{`async function apiCallWithRetry(url, options, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url, options);
      
      if (response.status === 429) {
        // Rate limited - wait and retry
        const retryAfter = response.headers.get('Retry-After') || 60;
        await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
        continue;
      }
      
      if (response.status >= 500) {
        // Server error - retry with exponential backoff
        if (attempt < maxRetries) {
          await new Promise(resolve => 
            setTimeout(resolve, Math.pow(2, attempt) * 1000)
          );
          continue;
        }
      }
      
      return response;
    } catch (error) {
      if (attempt === maxRetries) throw error;
      await new Promise(resolve => 
        setTimeout(resolve, Math.pow(2, attempt) * 1000)
      );
    }
  }
}`}
                      </pre>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-semibold text-green-900 mb-2">Active Keys</h4>
                  <p className="text-sm text-green-700">View and manage all active API keys</p>
                </div>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h4 className="font-semibold text-yellow-900 mb-2">Regenerate</h4>
                  <p className="text-sm text-yellow-700">Generate new keys to replace old ones</p>
                </div>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h4 className="font-semibold text-red-900 mb-2">Revoke</h4>
                  <p className="text-sm text-red-700">Immediately disable compromised keys</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'developer-guide',
      title: 'Developer Integration Guide',
      icon: FileCode,
      content: (
        <div className="space-y-6">
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-purple-900 mb-3">Developer Integration Guide</h3>
            <p className="text-purple-800 mb-4">
              Complete guide for developers to integrate with the Juridence Legal Database System.
            </p>
          </div>

          <div className="space-y-6">
            {/* Quick Start */}
            <div className="bg-white rounded-lg border border-slate-200 p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Quick Start</h3>
              <div className="space-y-4">
                <div className="bg-slate-50 rounded-lg p-4">
                  <h4 className="font-semibold text-slate-900 mb-2">1. Get API Key</h4>
                  <p className="text-sm text-slate-700 mb-3">Contact admin to get your API key or generate one through the admin dashboard.</p>
                </div>

                <div className="bg-slate-50 rounded-lg p-4">
                  <h4 className="font-semibold text-slate-900 mb-2">2. Test Connection</h4>
                  <div className="bg-slate-800 text-green-400 rounded p-3 font-mono text-sm mb-3">
{`curl -X GET "https://api.juridence.com/api/search/quick?query=test" \\
  -H "Authorization: Bearer YOUR_API_KEY"`}
                  </div>
                  <p className="text-sm text-slate-700">Expected response: JSON with search results</p>
                </div>

                <div className="bg-slate-50 rounded-lg p-4">
                  <h4 className="font-semibold text-slate-900 mb-2">3. Start Building</h4>
                  <p className="text-sm text-slate-700">Use the API endpoints to build your application. See the API Documentation section for detailed endpoint information.</p>
                </div>
              </div>
            </div>

            {/* JuridenceAI Integration */}
            <div className="bg-white rounded-lg border border-slate-200 p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
                <Zap className="h-5 w-5 mr-2 text-purple-600" />
                JuridenceAI Integration
              </h3>
              
              <div className="space-y-4">
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <h4 className="font-semibold text-purple-900 mb-2">🤖 JuridenceAI Overview</h4>
                  <p className="text-sm text-purple-800 mb-3">
                    JuridenceAI provides intelligent case analysis, legal research, and interactive chat capabilities. 
                    All AI interactions are tracked and billed based on token usage.
                  </p>
                </div>

                <div className="bg-slate-50 rounded-lg p-4">
                  <h4 className="font-semibold text-slate-900 mb-3">💬 Starting an AI Chat Session</h4>
                  <div className="bg-slate-800 rounded p-3">
                    <pre className="text-green-400 text-sm">
{`// Start a new AI chat session for a specific case
const startAISession = async (caseId, userId) => {
  const response = await fetch('/api/ai-chat/sessions', {
    method: 'POST',
    headers: {
      'Authorization': \`Bearer \${API_KEY}\`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      case_id: caseId,
      user_id: userId,
      title: 'Legal Case Analysis'
    })
  });
  
  return await response.json();
};

// Usage
const session = await startAISession(12345, 67890);
console.log('Session ID:', session.session_id);`}
                    </pre>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-lg p-4">
                  <h4 className="font-semibold text-slate-900 mb-3">💭 Sending Messages to AI</h4>
                  <div className="bg-slate-800 rounded p-3">
                    <pre className="text-green-400 text-sm">
{`// Send a message to the AI assistant
const sendAIMessage = async (sessionId, message, userId) => {
  const response = await fetch('/api/ai-chat/message', {
    method: 'POST',
    headers: {
      'Authorization': \`Bearer \${API_KEY}\`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      session_id: sessionId,
      message: message,
      user_id: userId
    })
  });
  
  const result = await response.json();
  
  // Track usage and costs
  console.log('Tokens used:', result.tokens_used);
  console.log('Cost estimate:', result.cost_estimate);
  
  return result;
};

// Usage
const response = await sendAIMessage(
  'session_abc123', 
  'What are the key legal issues in this contract dispute?',
  67890
);`}
                    </pre>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-lg p-4">
                  <h4 className="font-semibold text-slate-900 mb-3">📊 Usage Tracking & Billing</h4>
                  <div className="bg-slate-800 rounded p-3">
                    <pre className="text-green-400 text-sm">
{`// Get user's AI usage and billing information
const getUserAIUsage = async (userId) => {
  const response = await fetch(\`/api/ai-chat/analytics/users?user_id=\${userId}\`, {
    headers: {
      'Authorization': \`Bearer \${API_KEY}\`
    }
  });
  
  return await response.json();
};

// Usage
const usage = await getUserAIUsage(67890);
console.log('Total tokens used:', usage.total_tokens_used);
console.log('Total cost:', usage.total_cost);
console.log('Remaining tokens:', usage.remaining_tokens);`}
                    </pre>
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h4 className="font-semibold text-yellow-900 mb-2">💰 Billing Considerations</h4>
                  <div className="text-sm text-yellow-800 space-y-2">
                    <p><strong>Token-based Pricing:</strong> Each AI request consumes tokens based on input and output length</p>
                    <p><strong>Real-time Tracking:</strong> All AI interactions are logged and billed immediately</p>
                    <p><strong>Cost Estimation:</strong> Pre-calculate costs before making AI requests</p>
                    <p><strong>Usage Limits:</strong> Monitor token usage against subscription limits</p>
                    <p><strong>Rate Limiting:</strong> Implement proper retry logic for rate-limited requests</p>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-900 mb-2">🔧 Best Practices</h4>
                  <div className="text-sm text-blue-800 space-y-1">
                    <p>• Always check user's remaining token allowance before AI requests</p>
                    <p>• Implement cost estimation before expensive operations</p>
                    <p>• Cache AI responses when appropriate to reduce costs</p>
                    <p>• Use appropriate AI models for different use cases (GPT-3.5 for simple tasks, GPT-4 for complex analysis)</p>
                    <p>• Monitor usage patterns and optimize prompts for efficiency</p>
                  </div>
                </div>
              </div>
            </div>

            {/* SDK Examples */}
            <div className="bg-white rounded-lg border border-slate-200 p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">SDK Examples</h3>
              <div className="space-y-4">
                <div className="border border-slate-200 rounded-lg p-4">
                  <h4 className="font-semibold text-slate-900 mb-2">JavaScript/Node.js</h4>
                  <div className="bg-slate-800 text-green-400 rounded p-3 font-mono text-sm">
{`const axios = require('axios');

const api = axios.create({
  baseURL: 'https://api.juridence.com',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
});

// Search for cases
async function searchCases(query) {
  try {
    const response = await api.get('/api/search/unified', {
      params: { query, limit: 10 }
    });
    return response.data;
  } catch (error) {
    console.error('Search failed:', error);
  }
}`}
                  </div>
                </div>

                <div className="border border-slate-200 rounded-lg p-4">
                  <h4 className="font-semibold text-slate-900 mb-2">Python</h4>
                  <div className="bg-slate-800 text-green-400 rounded p-3 font-mono text-sm">
{`import requests

class JuridenceAPI:
    def __init__(self, api_key):
        self.api_key = api_key
        self.base_url = 'https://api.juridence.com'
        self.headers = {
            'Authorization': f'Bearer {api_key}',
            'Content-Type': 'application/json'
        }
    
    def search(self, query, limit=20):
        response = requests.get(
            f'{self.base_url}/api/search/unified',
            headers=self.headers,
            params={'query': query, 'limit': limit}
        )
        return response.json()

# Usage
api = JuridenceAPI('YOUR_API_KEY')
results = api.search('mahama')`}
                  </div>
                </div>

                <div className="border border-slate-200 rounded-lg p-4">
                  <h4 className="font-semibold text-slate-900 mb-2">PHP</h4>
                  <div className="bg-slate-800 text-green-400 rounded p-3 font-mono text-sm">
{`<?php
class JuridenceAPI {
    private $apiKey;
    private $baseUrl = 'https://api.juridence.com';
    
    public function __construct($apiKey) {
        $this->apiKey = $apiKey;
    }
    
    public function search($query, $limit = 20) {
        $url = $this->baseUrl . '/api/search/unified?' . http_build_query([
            'query' => $query,
            'limit' => $limit
        ]);
        
        $headers = [
            'Authorization: Bearer ' . $this->apiKey,
            'Content-Type: application/json'
        ];
        
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        
        $response = curl_exec($ch);
        curl_close($ch);
        
        return json_decode($response, true);
    }
}

// Usage
$api = new JuridenceAPI('YOUR_API_KEY');
$results = $api->search('mahama');`}
                  </div>
                </div>
              </div>
            </div>

            {/* Error Handling */}
            <div className="bg-white rounded-lg border border-slate-200 p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Error Handling</h3>
              <div className="space-y-4">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h4 className="font-semibold text-red-900 mb-2">Common Error Codes</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="font-mono bg-red-100 text-red-800 px-2 py-1 rounded">401</span>
                      <span>Unauthorized - Invalid API key</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-mono bg-red-100 text-red-800 px-2 py-1 rounded">403</span>
                      <span>Forbidden - Insufficient permissions</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-mono bg-red-100 text-red-800 px-2 py-1 rounded">429</span>
                      <span>Too Many Requests - Rate limit exceeded</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-mono bg-red-100 text-red-800 px-2 py-1 rounded">500</span>
                      <span>Internal Server Error</span>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-lg p-4">
                  <h4 className="font-semibold text-slate-900 mb-2">Error Response Format</h4>
                  <div className="bg-slate-800 text-red-400 rounded p-3 font-mono text-sm">
{`{
  "detail": "Error message",
  "error_code": "ERROR_CODE",
  "timestamp": "2025-09-28T15:30:00Z"
}`}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'about',
      title: 'About & Developer',
      icon: Code,
      content: (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center">
              <Code className="h-5 w-5 mr-2 text-blue-600" />
              About the Juridence Legal Database System
            </h3>
            <p className="text-blue-800 mb-4">
              A comprehensive legal database system conceived and financed by <strong>Dennis Adjei Dwommoh</strong>, 
              Managing Partner at Lawplus and CEO of Adden Technology Limited. Built with modern technologies 
              to provide efficient case management, legal research, and AI-powered analysis for the Ghanaian legal system.
            </p>
          </div>

          {/* Founder & Legal Advisor */}
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
              <Shield className="h-5 w-5 mr-2 text-slate-600" />
              Founder & Legal Advisor
            </h3>
            <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6 border border-green-200 mb-6">
              <div className="flex items-start space-x-4">
                <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center">
                  <Shield className="h-8 w-8 text-green-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-green-900 text-xl mb-2">Dennis Adjei Dwommoh</h4>
                  <p className="text-green-800 font-medium text-lg mb-2">Mastermind & Legal Advisor</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-green-700">
                    <div>
                      <p><strong>Managing Partner:</strong> Lawplus - Attorney At Law</p>
                      <p><strong>CEO:</strong> Adden Technology Limited</p>
                    </div>
                    <div>
                      <p><strong>Role:</strong> Legal Advisor & Financier</p>
                      <p><strong>System:</strong> Developer of DennisLaw</p>
                    </div>
                  </div>
                  <p className="text-sm text-green-600 mt-3">
                    Provided legal expertise, strategic direction, and financial backing for the Juridence Legal Database System
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Developer Information */}
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
              <Code className="h-5 w-5 mr-2 text-slate-600" />
              Development Team
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <h4 className="font-semibold text-blue-900 mb-3">👨‍💻 Lead Developer</h4>
                <div className="space-y-2">
                  <p className="text-blue-800 font-medium text-lg">Issa Sukatu Abdullahi</p>
                  <p className="text-blue-600">Full-Stack Developer & System Architect</p>
                  <p className="text-sm text-blue-700">Specializing in modern web technologies, AI integration, and legal tech solutions</p>
                </div>
              </div>
              <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                <h4 className="font-semibold text-purple-900 mb-3">🏢 Development Company</h4>
                <div className="space-y-2">
                  <p className="text-purple-800 font-medium text-lg">Alpha Smacode Innovations</p>
                  <p className="text-purple-600">Block K Plot 5, Ashanti Region</p>
                  <p className="text-purple-600">Asokore Mampong, Asabi</p>
                  <p className="text-sm text-purple-700">Innovative software solutions for the African market</p>
                </div>
              </div>
            </div>
          </div>

          {/* Technical Stack */}
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">🛠️ Technical Stack</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-slate-50 rounded-lg p-4">
                <h4 className="font-semibold text-slate-900 mb-2">Backend</h4>
                <ul className="text-sm text-slate-700 space-y-1">
                  <li>• FastAPI (Python)</li>
                  <li>• PostgreSQL Database</li>
                  <li>• SQLAlchemy ORM</li>
                  <li>• Redis Caching</li>
                  <li>• OpenAI Integration</li>
                </ul>
              </div>
              <div className="bg-slate-50 rounded-lg p-4">
                <h4 className="font-semibold text-slate-900 mb-2">Frontend</h4>
                <ul className="text-sm text-slate-700 space-y-1">
                  <li>• React.js</li>
                  <li>• Tailwind CSS</li>
                  <li>• React Router</li>
                  <li>• Chart.js</li>
                  <li>• Lucide Icons</li>
                </ul>
              </div>
              <div className="bg-slate-50 rounded-lg p-4">
                <h4 className="font-semibold text-slate-900 mb-2">AI & Analytics</h4>
                <ul className="text-sm text-slate-700 space-y-1">
                  <li>• OpenAI GPT Models</li>
                  <li>• Token-based Billing</li>
                  <li>• Usage Analytics</li>
                  <li>• Real-time Tracking</li>
                  <li>• Cost Estimation</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Contact & Support */}
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">📧 Contact & Support</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                  <h4 className="font-semibold text-green-900 mb-2">Technical Support</h4>
                  <p className="text-sm text-green-800">Available for API integration assistance, troubleshooting, and custom development requests.</p>
                </div>
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <h4 className="font-semibold text-blue-900 mb-2">Custom Development</h4>
                  <p className="text-sm text-blue-800">Tailored solutions for enterprise clients, including custom features and integrations.</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                  <h4 className="font-semibold text-purple-900 mb-2">System Maintenance</h4>
                  <p className="text-sm text-purple-800">Ongoing updates, security patches, and performance improvements.</p>
                </div>
                <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                  <h4 className="font-semibold text-orange-900 mb-2">Training & Documentation</h4>
                  <p className="text-sm text-orange-800">Comprehensive developer resources, API documentation, and integration guides.</p>
                </div>
              </div>
            </div>
          </div>

          {/* System Features */}
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">✨ Key Features</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="text-center p-4">
                <div className="bg-blue-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                  <Search className="h-6 w-6 text-blue-600" />
                </div>
                <h4 className="font-semibold text-slate-900 mb-2">Advanced Search</h4>
                <p className="text-sm text-slate-700">Unified search across cases, people, banks, companies, and insurance</p>
              </div>
              <div className="text-center p-4">
                <div className="bg-purple-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                  <Zap className="h-6 w-6 text-purple-600" />
                </div>
                <h4 className="font-semibold text-slate-900 mb-2">JuridenceAI</h4>
                <p className="text-sm text-slate-700">AI-powered case analysis and legal research with billing tracking</p>
              </div>
              <div className="text-center p-4">
                <div className="bg-green-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                  <BarChart3 className="h-6 w-6 text-green-600" />
                </div>
                <h4 className="font-semibold text-slate-900 mb-2">Analytics</h4>
                <p className="text-sm text-slate-700">Comprehensive analytics and reporting for legal data insights</p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'user-guides',
      title: 'User Guides & Tutorials',
      icon: HelpCircle,
      content: (
        <div className="space-y-6">
          <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-indigo-900 mb-3">User Guides & Tutorials</h3>
            <p className="text-indigo-800 mb-4">
              Comprehensive guides for users to get the most out of the Juridence Legal Database System.
            </p>
          </div>

          {/* Founder & Development Team */}
          <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-green-900 mb-4 flex items-center">
              <Shield className="h-5 w-5 mr-2 text-green-600" />
              Founder & Development Team
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
              <div className="bg-white rounded-lg p-4 border border-green-100">
                <h4 className="font-semibold text-green-900 mb-2">🏛️ Founder & Legal Advisor</h4>
                <p className="text-green-800 font-medium text-lg">Dennis Adjei Dwommoh</p>
                <p className="text-sm text-green-600">Managing Partner, Lawplus - Attorney At Law</p>
                <p className="text-sm text-green-600">CEO, Adden Technology Limited</p>
                <p className="text-sm text-green-600">Developer of DennisLaw</p>
              </div>
              <div className="bg-white rounded-lg p-4 border border-blue-100">
                <h4 className="font-semibold text-blue-900 mb-2">👨‍💻 Lead Developer</h4>
                <p className="text-blue-800 font-medium text-lg">Issa Sukatu Abdullahi</p>
                <p className="text-sm text-blue-600">Full-Stack Developer & System Architect</p>
                <p className="text-sm text-blue-600">Alpha Smacode Innovations</p>
              </div>
            </div>
            <div className="bg-white rounded-lg p-4 border border-green-100">
              <h4 className="font-semibold text-green-900 mb-2">📧 Contact & Support</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-green-800">
                <div>
                  <p><strong>Legal Expertise:</strong> Dennis Adjei Dwommoh - Attorney At Law</p>
                  <p><strong>Technical Support:</strong> Issa Sukatu Abdullahi - Full-Stack Developer</p>
                </div>
                <div>
                  <p><strong>System Maintenance:</strong> Ongoing updates and improvements</p>
                  <p><strong>Training & Documentation:</strong> Comprehensive developer resources</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg border border-slate-200 p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Getting Started</h3>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold">1</div>
                  <div>
                    <h4 className="font-semibold text-slate-900">Account Setup</h4>
                    <p className="text-sm text-slate-700">Create your account and verify your email address</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold">2</div>
                  <div>
                    <h4 className="font-semibold text-slate-900">Profile Configuration</h4>
                    <p className="text-sm text-slate-700">Complete your profile and set preferences</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold">3</div>
                  <div>
                    <h4 className="font-semibold text-slate-900">First Search</h4>
                    <p className="text-sm text-slate-700">Try searching for cases, people, or companies</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-slate-200 p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Search Tips</h3>
              <div className="space-y-3">
                <div className="bg-green-50 border border-green-200 rounded p-3">
                  <h4 className="font-semibold text-green-900 text-sm">Use Specific Terms</h4>
                  <p className="text-sm text-green-800">Search for specific names, case numbers, or legal terms for better results</p>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded p-3">
                  <h4 className="font-semibold text-blue-900 text-sm">Filter Results</h4>
                  <p className="text-sm text-blue-800">Use filters to narrow down results by date, court, or entity type</p>
                </div>
                <div className="bg-purple-50 border border-purple-200 rounded p-3">
                  <h4 className="font-semibold text-purple-900 text-sm">Save Searches</h4>
                  <p className="text-sm text-purple-800">Save frequently used searches for quick access</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-slate-200 p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
                <Zap className="h-5 w-5 mr-2 text-purple-600" />
                JuridenceAI Tutorial
              </h3>
              <div className="space-y-4">
                <div className="bg-purple-50 border border-purple-200 rounded p-4">
                  <h4 className="font-semibold text-purple-900 mb-2">🤖 How to Use JuridenceAI</h4>
                  <div className="space-y-3 text-sm text-purple-800">
                    <div className="flex items-start space-x-3">
                      <div className="bg-purple-100 text-purple-800 rounded-full w-6 h-6 flex items-center justify-center text-xs font-semibold">1</div>
                      <div>
                        <p><strong>Access JuridenceAI:</strong> Click the floating AI icon on any case details page</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="bg-purple-100 text-purple-800 rounded-full w-6 h-6 flex items-center justify-center text-xs font-semibold">2</div>
                      <div>
                        <p><strong>Start Chat Session:</strong> The AI will automatically load case context</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="bg-purple-100 text-purple-800 rounded-full w-6 h-6 flex items-center justify-center text-xs font-semibold">3</div>
                      <div>
                        <p><strong>Ask Questions:</strong> Type your legal questions about the case</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="bg-purple-100 text-purple-800 rounded-full w-6 h-6 flex items-center justify-center text-xs font-semibold">4</div>
                      <div>
                        <p><strong>Get Analysis:</strong> Receive AI-powered legal insights and analysis</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded p-4">
                  <h4 className="font-semibold text-yellow-900 mb-2">💰 Understanding AI Billing</h4>
                  <div className="space-y-2 text-sm text-yellow-800">
                    <p><strong>Token-based Pricing:</strong> Each AI interaction costs tokens based on usage</p>
                    <p><strong>Real-time Tracking:</strong> See your usage and costs in the AI Analytics dashboard</p>
                    <p><strong>Subscription Limits:</strong> Check your monthly token allowance</p>
                    <p><strong>Cost Estimation:</strong> AI provides cost estimates before expensive operations</p>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded p-4">
                  <h4 className="font-semibold text-blue-900 mb-2">💡 Best Practices for JuridenceAI</h4>
                  <div className="space-y-2 text-sm text-blue-800">
                    <p>• Ask specific questions about case details, legal issues, or precedents</p>
                    <p>• Use the AI for case analysis, legal research, and document interpretation</p>
                    <p>• Monitor your token usage to stay within subscription limits</p>
                    <p>• Save important AI insights for future reference</p>
                    <p>• Use the case summary feature for quick overviews</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Feature Tutorials</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="border border-slate-200 rounded-lg p-4">
                <Search className="h-8 w-8 text-blue-600 mb-2" />
                <h4 className="font-semibold text-slate-900 mb-2">Advanced Search</h4>
                <p className="text-sm text-slate-700">Learn to use advanced search filters and operators</p>
              </div>
              <div className="border border-slate-200 rounded-lg p-4">
                <Zap className="h-8 w-8 text-purple-600 mb-2" />
                <h4 className="font-semibold text-slate-900 mb-2">JuridenceAI</h4>
                <p className="text-sm text-slate-700">Get help from AI for case analysis and summaries</p>
              </div>
              <div className="border border-slate-200 rounded-lg p-4">
                <BarChart3 className="h-8 w-8 text-green-600 mb-2" />
                <h4 className="font-semibold text-slate-900 mb-2">Analytics</h4>
                <p className="text-sm text-slate-700">Understand usage analytics and reporting features</p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'employee-management',
      title: 'Employee Management',
      icon: Users,
      content: (
        <div className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-3">Employee Management System</h3>
            <p className="text-blue-800 mb-4">
              LinkedIn-style employee profiles with comprehensive tracking of employment history, skills, education, and legal cases.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg border border-slate-200 p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Key Features</h3>
              <ul className="space-y-2">
                <li className="flex items-center text-slate-700">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  LinkedIn-style employee profiles
                </li>
                <li className="flex items-center text-slate-700">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Employment history tracking
                </li>
                <li className="flex items-center text-slate-700">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Skills and education management
                </li>
                <li className="flex items-center text-slate-700">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  CV upload and management
                </li>
                <li className="flex items-center text-slate-700">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Legal cases association
                </li>
                <li className="flex items-center text-slate-700">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Automatic people database sync
                </li>
              </ul>
            </div>

            <div className="bg-white rounded-lg border border-slate-200 p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">API Endpoints</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div>
                    <code className="text-sm font-mono text-slate-700">GET /api/employees/</code>
                    <p className="text-xs text-slate-500">List employees with pagination</p>
                  </div>
                  <Copy 
                    className="h-4 w-4 text-slate-400 cursor-pointer hover:text-slate-600" 
                    onClick={() => copyToClipboard('GET /api/employees/', 'employees-list')}
                  />
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div>
                    <code className="text-sm font-mono text-slate-700">POST /api/employees/</code>
                    <p className="text-xs text-slate-500">Create new employee</p>
                  </div>
                  <Copy 
                    className="h-4 w-4 text-slate-400 cursor-pointer hover:text-slate-600" 
                    onClick={() => copyToClipboard('POST /api/employees/', 'employees-create')}
                  />
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div>
                    <code className="text-sm font-mono text-slate-700">GET /api/employees/&#123;id&#125;</code>
                    <p className="text-xs text-slate-500">Get employee details</p>
                  </div>
                  <Copy 
                    className="h-4 w-4 text-slate-400 cursor-pointer hover:text-slate-600" 
                    onClick={() => copyToClipboard('GET /api/employees/{id}', 'employees-get')}
                  />
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div>
                    <code className="text-sm font-mono text-slate-700">PUT /api/employees/&#123;id&#125;</code>
                    <p className="text-xs text-slate-500">Update employee</p>
                  </div>
                  <Copy 
                    className="h-4 w-4 text-slate-400 cursor-pointer hover:text-slate-600" 
                    onClick={() => copyToClipboard('PUT /api/employees/{id}', 'employees-update')}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Data Synchronization</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <h4 className="font-semibold text-green-900">100% Sync Rate</h4>
                <p className="text-sm text-green-700">All employees automatically synced to people database</p>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <RefreshCw className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <h4 className="font-semibold text-blue-900">Real-time Updates</h4>
                <p className="text-sm text-blue-700">Changes sync immediately across systems</p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <Shield className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <h4 className="font-semibold text-purple-900">Data Integrity</h4>
                <p className="text-sm text-purple-700">Bidirectional updates maintain consistency</p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'file-repository',
      title: 'File Repository',
      icon: FolderOpen,
      content: (
        <div className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-3">File Repository System</h3>
            <p className="text-blue-800 mb-4">
              Comprehensive file management system for uploads, downloads, organization, and analytics across the entire application.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg border border-slate-200 p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">File Management</h3>
              <ul className="space-y-2">
                <li className="flex items-center text-slate-700">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Multi-format support (PDF, DOC, DOCX, TXT, images)
                </li>
                <li className="flex items-center text-slate-700">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Organized folder structure
                </li>
                <li className="flex items-center text-slate-700">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  File validation and size restrictions
                </li>
                <li className="flex items-center text-slate-700">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Secure authentication-based access
                </li>
                <li className="flex items-center text-slate-700">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Drag-and-drop upload interface
                </li>
                <li className="flex items-center text-slate-700">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  File search and filtering
                </li>
              </ul>
            </div>

            <div className="bg-white rounded-lg border border-slate-200 p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Repository Structure</h3>
              <div className="bg-slate-50 rounded-lg p-4">
                <pre className="text-sm text-slate-700 font-mono">
{`uploads/
├── cvs/                    # Employee CV files
├── cases/                  # Legal case documents
├── avatars/               # User profile pictures
└── general/               # General file uploads`}
                </pre>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">API Endpoints</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <h4 className="font-semibold text-slate-900">File Operations</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2 bg-slate-50 rounded">
                    <code className="text-sm font-mono text-slate-700">POST /api/files/upload</code>
                    <Copy 
                      className="h-4 w-4 text-slate-400 cursor-pointer hover:text-slate-600" 
                      onClick={() => copyToClipboard('POST /api/files/upload', 'files-upload')}
                    />
                  </div>
                  <div className="flex items-center justify-between p-2 bg-slate-50 rounded">
                    <code className="text-sm font-mono text-slate-700">GET /api/files/download/&#123;filename&#125;</code>
                    <Copy 
                      className="h-4 w-4 text-slate-400 cursor-pointer hover:text-slate-600" 
                      onClick={() => copyToClipboard('GET /api/files/download/{filename}', 'files-download')}
                    />
                  </div>
                  <div className="flex items-center justify-between p-2 bg-slate-50 rounded">
                    <code className="text-sm font-mono text-slate-700">DELETE /api/files/&#123;filename&#125;</code>
                    <Copy 
                      className="h-4 w-4 text-slate-400 cursor-pointer hover:text-slate-600" 
                      onClick={() => copyToClipboard('DELETE /api/files/{filename}', 'files-delete')}
                    />
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <h4 className="font-semibold text-slate-900">Repository Management</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2 bg-slate-50 rounded">
                    <code className="text-sm font-mono text-slate-700">GET /api/file-repository/</code>
                    <Copy 
                      className="h-4 w-4 text-slate-400 cursor-pointer hover:text-slate-600" 
                      onClick={() => copyToClipboard('GET /api/file-repository/', 'repo-list')}
                    />
                  </div>
                  <div className="flex items-center justify-between p-2 bg-slate-50 rounded">
                    <code className="text-sm font-mono text-slate-700">POST /api/file-repository/folder</code>
                    <Copy 
                      className="h-4 w-4 text-slate-400 cursor-pointer hover:text-slate-600" 
                      onClick={() => copyToClipboard('POST /api/file-repository/folder', 'repo-folder-create')}
                    />
                  </div>
                  <div className="flex items-center justify-between p-2 bg-slate-50 rounded">
                    <code className="text-sm font-mono text-slate-700">GET /api/file-repository/folder/&#123;path&#125;</code>
                    <Copy 
                      className="h-4 w-4 text-slate-400 cursor-pointer hover:text-slate-600" 
                      onClick={() => copyToClipboard('GET /api/file-repository/folder/{path}', 'repo-folder-get')}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">System Documentation</h1>
          <p className="text-slate-600">Comprehensive documentation for the Juridence Legal Database System</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 sticky top-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Documentation</h2>
              <nav className="space-y-2">
                {sections.map((section) => {
                  const Icon = section.icon;
                  return (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                        activeSection === section.id
                          ? 'bg-sky-100 text-sky-700'
                          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                      }`}
                    >
                      <Icon className="h-4 w-4 mr-3" />
                      {section.title}
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-sm border border-slate-200">
              <div className="p-6">
                {sections.find(section => section.id === activeSection)?.content}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 bg-slate-50 border-t border-slate-200 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <h4 className="font-semibold text-slate-900 mb-2">Juridence Legal Database System</h4>
              <p className="text-sm text-slate-600">
                A comprehensive legal database system for the Ghanaian legal system with AI-powered analysis and modern web technologies.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 mb-2">Founder & Legal Advisor</h4>
              <p className="text-sm text-slate-600">
                <strong>Dennis Adjei Dwommoh</strong><br />
                Managing Partner, Lawplus<br />
                CEO, Adden Technology Limited<br />
                Developer of DennisLaw
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 mb-2">Development Team</h4>
              <p className="text-sm text-slate-600">
                <strong>Issa Sukatu Abdullahi</strong><br />
                Full-Stack Developer & System Architect<br />
                Alpha Smacode Innovations
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 mb-2">Location</h4>
              <p className="text-sm text-slate-600">
                Block K Plot 5, Ashanti Region<br />
                Asokore Mampong, Asabi<br />
                Ghana
              </p>
            </div>
          </div>
          <div className="mt-6 pt-6 border-t border-slate-200 text-center">
            <p className="text-sm text-slate-500">
              © 2024 Adden Technology Limited & Alpha Smacode Innovations. All rights reserved. | Built with ❤️ for the Ghanaian Legal System
            </p>
          </div>
        </div>
      </div>
      
      {/* Floating JuridenceAI Button */}
      <button
        onClick={() => setIsAIChatOpen(true)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-300 flex items-center justify-center group"
        title="Open JuridenceAI Documentation Assistant"
      >
        <MessageCircle className="w-6 h-6 group-hover:scale-110 transition-transform duration-200" />
        <span className="sr-only">JuridenceAI Documentation Assistant</span>
      </button>

      {/* AI Chat Component */}
      <AIChat
        caseId={null} // No specific case for documentation
        caseTitle="Documentation Assistant"
        isOpen={isAIChatOpen}
        onClose={() => setIsAIChatOpen(false)}
        onMinimize={() => setIsAIChatOpen(false)}
      />
    </div>
  );
};

export default Documentation;
