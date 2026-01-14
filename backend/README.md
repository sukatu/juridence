# Dennislaw SVD Backend

A Python FastAPI backend for Dennislaw SVD Services - Court Search, Document Verification & Document Request platform.

## Features

- **User Authentication**: Registration, login, password reset, Google OAuth
- **MySQL Database**: Robust data storage with SQLAlchemy ORM
- **JWT Security**: Secure token-based authentication
- **AI/ML Ready**: Prepared for AI components integration
- **RESTful API**: Clean, documented API endpoints
- **Email Services**: Password reset and verification emails
- **Role-based Access**: Admin, user, and premium user roles

## Tech Stack

- **Framework**: FastAPI
- **Database**: MySQL with SQLAlchemy ORM
- **Authentication**: JWT with bcrypt password hashing
- **AI/ML**: OpenAI, LangChain, Transformers, PyTorch
- **Email**: FastAPI-Mail
- **Validation**: Pydantic
- **Security**: Passlib, python-jose

## Setup Instructions

### 1. Prerequisites

- Python 3.8+
- MySQL 8.0+
- pip (Python package manager)

### 2. Installation

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 3. Database Setup

1. **Create MySQL Database**:
   ```sql
   CREATE DATABASE dennislaw_svd;
   ```

2. **Update Configuration**:
   - Copy `.env.example` to `.env`
   - Update database credentials in `.env`:
   ```
   MYSQL_HOST=localhost
   MYSQL_PORT=3306
   MYSQL_USER=your_username
   MYSQL_PASSWORD=your_password
   MYSQL_DATABASE=dennislaw_svd
   ```

### 4. Environment Variables

Create a `.env` file with the following variables:

```env
# Database Configuration
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=your_username
MYSQL_PASSWORD=your_password
MYSQL_DATABASE=dennislaw_svd

# JWT Configuration
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Email Configuration
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password
MAIL_FROM=your-email@gmail.com
MAIL_PORT=587
MAIL_SERVER=smtp.gmail.com

# OpenAI Configuration
OPENAI_API_KEY=your-openai-api-key

# Application Configuration
DEBUG=True
HOST=0.0.0.0
PORT=8000
```

### 5. Run the Application

```bash
# Development mode
python main.py

# Or using uvicorn directly
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at:
- **API**: http://localhost:8000
- **Documentation**: http://localhost:8000/docs
- **Health Check**: http://localhost:8000/health

## API Endpoints

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user
- `POST /auth/google` - Google OAuth login
- `POST /auth/forgot-password` - Request password reset
- `POST /auth/reset-password` - Reset password with token
- `POST /auth/change-password` - Change password
- `GET /auth/me` - Get current user info
- `POST /auth/verify-email` - Verify email address
- `POST /auth/logout` - Logout user

### Health Check
- `GET /` - API information
- `GET /health` - Health status

## Database Schema

### Users Table
- `id` - Primary key
- `email` - Unique email address
- `username` - Optional username
- `first_name`, `last_name` - User names
- `phone_number` - Contact number
- `hashed_password` - Bcrypt hashed password
- `google_id` - Google OAuth ID
- `role` - User role (admin, user, premium)
- `status` - Account status (active, inactive, suspended, pending)
- `is_verified` - Email verification status
- `created_at`, `updated_at` - Timestamps
- And more...

## Development

### Code Style
```bash
# Format code
black .

# Sort imports
isort .

# Lint code
flake8 .
```

### Testing
```bash
# Run tests
pytest
```

## AI/ML Integration

The backend is prepared for AI components:

- **OpenAI Integration**: Ready for GPT models
- **LangChain**: For advanced language processing
- **Transformers**: For custom ML models
- **PyTorch**: For deep learning tasks
- **Scikit-learn**: For traditional ML algorithms

## Security Features

- JWT token authentication
- Bcrypt password hashing
- CORS protection
- Input validation with Pydantic
- SQL injection prevention with SQLAlchemy
- Rate limiting (can be added)
- HTTPS support (production)

## Production Deployment

1. Set `DEBUG=False` in environment
2. Use production database credentials
3. Set strong `SECRET_KEY`
4. Configure proper CORS origins
5. Use HTTPS
6. Set up proper logging
7. Use environment-specific configurations

## Support

For issues and questions, please contact the development team.
