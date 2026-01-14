# Juridence Legal Database System

[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://github.com/juridence/legal-database)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Python](https://img.shields.io/badge/python-3.9+-blue.svg)](https://python.org)
[![React](https://img.shields.io/badge/react-18+-blue.svg)](https://reactjs.org)
[![FastAPI](https://img.shields.io/badge/fastapi-0.100+-green.svg)](https://fastapi.tiangolo.com)

A comprehensive legal database system providing access to case law, legal entities, and AI-powered legal assistance for Ghana's legal system.

## 🚀 Features

### 📊 **Comprehensive Legal Database**
- **11,911+ Legal Cases** with detailed information
- **6,340+ People** with case statistics and risk analysis  
- **34 Banks** with financial data and services
- **49 Insurance Companies** with coverage information
- **4,829+ Companies** with corporate data and directors
- **10+ Employees** with LinkedIn-style profiles and employment history

### 🔍 **Advanced Search & Discovery**
- **Unified Search** across all legal entities
- **Quick Search** with autocomplete suggestions
- **Advanced Filters** by date, court, entity type
- **Real-time Results** with pagination support

### 👥 **Employee Management System**
- **LinkedIn-style Profiles** with comprehensive employee data
- **Employment History** tracking across organizations
- **CV Upload & Management** with file repository system
- **Skills & Education** tracking with dynamic forms
- **Legal Cases** associated with employees
- **Automatic People Sync** - employees automatically added to people database

### 🤖 **AI-Powered Analysis**
- **GPT-4 Integration** for case analysis
- **AI Chat Assistant** for legal discussions
- **Case Summaries** generated automatically
- **Legal Insights** and recommendations

### 📈 **Analytics & Reporting**
- **Real-time Dashboards** for admins and users
- **Usage Analytics** and performance metrics
- **AI Usage Tracking** with cost analysis
- **Custom Reports** and data exports
- **Employee Analytics** with employment statistics
- **File Repository Analytics** with upload/download tracking

### 🔐 **Enterprise Security**
- **Role-based Access Control** (RBAC)
- **API Key Authentication** for developers
- **JWT Token Security** for web sessions
- **Audit Logging** for all operations

## 🏗️ Architecture

### Technology Stack

#### Frontend
- **React.js 18+** - Modern UI framework
- **Tailwind CSS** - Utility-first styling
- **Chart.js** - Data visualization
- **React Router** - Client-side routing

#### Backend
- **FastAPI** - High-performance Python web framework
- **PostgreSQL** - Robust relational database
- **SQLAlchemy** - Python ORM
- **Pydantic** - Data validation and serialization

#### AI & Analytics
- **OpenAI GPT-4** - Advanced language model
- **Custom Analytics Engine** - Usage tracking and reporting
- **Real-time Monitoring** - System performance metrics

## 📚 Documentation

### 📖 **System Documentation**
- **[System Overview](SYSTEM_OVERVIEW.md)** - Complete system architecture
- **[Developer Guide](DEVELOPER_GUIDE.md)** - Integration and API usage
- **[API Documentation](backend/API_DOCUMENTATION.md)** - Complete API reference
- **[Admin Dashboard Docs](src/components/admin/Documentation.js)** - Built-in documentation

### 🔧 **Quick Start Guides**

#### For Developers
1. **[API Integration](DEVELOPER_GUIDE.md#getting-started)** - Get started with the API
2. **[SDK Examples](DEVELOPER_GUIDE.md#sdk-examples)** - Code examples in multiple languages
3. **[Authentication](DEVELOPER_GUIDE.md#authentication)** - API key management
4. **[Error Handling](DEVELOPER_GUIDE.md#error-handling)** - Best practices

#### For Administrators
1. **[Admin Dashboard](src/components/admin/Documentation.js)** - Built-in admin documentation
2. **[User Management](src/components/admin/UserManagement.js)** - User administration
3. **[API Key Management](src/components/admin/ApiKeyManagement.js)** - Developer access
4. **[Analytics Dashboard](src/components/admin/AIAnalytics.js)** - Usage analytics

## 🚀 Getting Started

### Prerequisites
- **Python 3.9+**
- **Node.js 16+**
- **PostgreSQL 13+**
- **OpenAI API Key** (for AI features)

### Installation

#### 1. Clone the Repository
```bash
git clone https://github.com/juridence/legal-database.git
cd legal-database
```

#### 2. Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

#### 3. Database Setup
```bash
# Create PostgreSQL database
createdb juridence_db

# Run migrations
python -m alembic upgrade head
```

#### 4. Frontend Setup
```bash
cd frontend
npm install
```

#### 5. Environment Configuration
```bash
# Copy environment template
cp backend/.env.example backend/.env

# Edit configuration
nano backend/.env
```

#### 6. Start Development Servers
```bash
# Terminal 1: Backend
cd backend
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Terminal 2: Frontend  
cd frontend
npm start
```

### 🎯 **Quick API Test**
```bash
# Test API connection
curl -X GET "http://localhost:8000/api/search/quick?query=test" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

## 📊 API Overview

### Base URL
```
https://api.juridence.com
```

### Authentication
```http
Authorization: Bearer your-api-key-here
```

### Core Endpoints

| Category | Endpoint | Description |
|----------|----------|-------------|
| **Search** | `/api/search/unified` | Search across all entities |
| **Cases** | `/api/case-search/search` | Search legal cases |
| **People** | `/api/people/search` | Search people |
| **Banks** | `/api/banks/search` | Search banks |
| **Companies** | `/api/companies/search` | Search companies |
| **Insurance** | `/api/insurance/search` | Search insurance |
| **Employees** | `/api/employees/` | Employee management |
| **File Repository** | `/api/files/` | File upload and management |
| **AI** | `/api/ai-chat/message` | AI chat interface |

### Example Usage

#### JavaScript/Node.js
```javascript
const api = new JuridenceAPI('your-api-key');

// Search for cases
const cases = await api.searchCases('mahama', 10);
console.log(cases);

// Get case details
const caseDetails = await api.getCase(6490);
console.log(caseDetails);

// AI analysis
const aiResponse = await api.sendAIMessage('Analyze this case', 6490);
console.log(aiResponse);
```

#### Python
```python
from juridence_api import JuridenceAPI

api = JuridenceAPI('your-api-key')

# Search for cases
cases = api.search_cases('mahama', 10)
print(cases)

# Get case details
case_details = api.get_case(6490)
print(case_details)

# AI analysis
ai_response = api.send_ai_message('Analyze this case', 6490)
print(ai_response)
```

## 🔑 API Key Management

### Generating API Keys

#### Admin Dashboard Method
1. Login to admin dashboard
2. Navigate to "API Keys" section
3. Click "Generate New Key"
4. Provide key name and permissions
5. Copy and store securely

#### Programmatic Method (Admin only)
```python
from backend.services.api_key_service import ApiKeyService

service = ApiKeyService(db)
api_key = service.generate_api_key(
    name="My App",
    permissions=["read", "write"],
    user_id=1
)
```

### Rate Limits
- **Free Tier**: 100 requests/hour
- **Professional**: 1,000 requests/hour  
- **Enterprise**: 10,000 requests/hour

## 🎨 Admin Dashboard

### Features
- **📊 Analytics Dashboard** - System overview and metrics
- **👥 User Management** - User administration and permissions
- **🔑 API Key Management** - Developer access control
- **📁 Content Management** - Cases, people, banks, companies
- **👨‍💼 Employee Management** - LinkedIn-style employee profiles
- **📂 File Repository** - File upload and management system
- **🤖 AI Analytics** - AI usage and performance tracking
- **📚 Documentation** - Built-in system documentation
- **⚙️ System Settings** - Configuration and preferences

### Access
```
https://admin.juridence.com
```

## 🔒 Security Features

### Authentication & Authorization
- **JWT Tokens** - Secure session management
- **API Keys** - Developer authentication
- **Role-based Access** - Granular permissions
- **Password Security** - bcrypt hashing

### Data Protection
- **HTTPS Encryption** - Secure data transmission
- **Input Validation** - Pydantic model validation
- **SQL Injection Protection** - SQLAlchemy ORM
- **Audit Logging** - Complete operation tracking

## 📈 Performance & Scalability

### Performance Metrics
- **API Response Time**: < 200ms average
- **Search Performance**: < 100ms average
- **Database Queries**: < 50ms average
- **AI Response Time**: < 5s average

### Scalability Features
- **Horizontal Scaling** - Multiple app instances
- **Database Optimization** - Strategic indexing
- **Caching Strategy** - Query result caching
- **Load Balancing** - Nginx upstream configuration

## 🧪 Testing

### Running Tests
```bash
# Backend tests
cd backend
python -m pytest tests/

# Frontend tests
cd frontend
npm test
```

### Test Coverage
- **Unit Tests** - Individual component testing
- **Integration Tests** - API endpoint testing
- **End-to-End Tests** - Full workflow testing
- **Performance Tests** - Load and stress testing

## 🚀 Deployment

### Production Deployment
```bash
# Build frontend
cd frontend
npm run build

# Deploy backend
cd backend
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker
```

### Docker Deployment
```bash
# Build and run with Docker Compose
docker-compose up -d
```

### Environment Variables
```bash
# Required
DATABASE_URL=postgresql://user:pass@localhost/juridence_db
OPENAI_API_KEY=your-openai-key
SECRET_KEY=your-secret-key

# Optional
REDIS_URL=redis://localhost:6379
SENTRY_DSN=your-sentry-dsn
```

## 🤝 Contributing

### Development Setup
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

### Code Standards
- **Python**: Follow PEP 8
- **JavaScript**: ESLint configuration
- **Documentation**: Comprehensive docstrings
- **Testing**: Maintain test coverage

## 📞 Support

### Getting Help
- **📚 Documentation**: Check the comprehensive docs
- **💬 Admin Dashboard**: Built-in help system
- **📧 Support Email**: support@juridence.com
- **🐛 Bug Reports**: GitHub Issues

### Community
- **GitHub Discussions**: Community support
- **Discord Server**: Real-time chat
- **Stack Overflow**: Tag `juridence-legal-database`

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **OpenAI** for GPT-4 AI capabilities
- **FastAPI** for the excellent Python framework
- **React** for the powerful frontend library
- **PostgreSQL** for the robust database system
- **Ghana Legal System** for the legal data

---

**Built with ❤️ for the Ghana Legal System**

**Version**: 1.0.0  
**Last Updated**: September 28, 2025  
**Documentation**: [Complete Guide](DEVELOPER_GUIDE.md)