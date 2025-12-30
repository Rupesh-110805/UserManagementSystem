# User Management System

A full-stack web application for managing user accounts with role-based access control (RBAC), built with Django REST Framework backend and React frontend.

## 📋 Project Overview

This User Management System provides a complete authentication and authorization solution with:
- User registration and login with JWT authentication
- Role-based access control (Admin and User roles)
- Admin dashboard for managing users (activate/deactivate accounts)
- User profile management with password change functionality
- Responsive design for desktop and mobile devices

## 🛠️ Tech Stack

### Backend
- **Framework**: Django 5.0
- **API**: Django REST Framework 3.14
- **Authentication**: djangorestframework-simplejwt (JWT)
- **Database**: PostgreSQL (Cloud-hosted on Neon/Render)
- **Password Hashing**: Argon2
- **Testing**: pytest, pytest-django
- **Deployment**: Render

### Frontend
- **Framework**: React 18 with Vite
- **Routing**: React Router v6
- **Styling**: Tailwind CSS
- **HTTP Client**: Axios
- **State Management**: Context API
- **Notifications**: react-hot-toast
- **Icons**: react-icons
- **Deployment**: Vercel

## 🚀 Features

### Authentication
- ✅ User signup with email validation and password strength requirements
- ✅ User login with JWT token generation
- ✅ Token refresh mechanism
- ✅ Logout with token blacklisting
- ✅ Protected routes requiring authentication

### User Management (Admin)
- ✅ View all users with pagination (10 users per page)
- ✅ Activate user accounts
- ✅ Deactivate user accounts
- ✅ Role-based access control (admin-only features)

### User Profile
- ✅ View own profile information
- ✅ Update full name and email
- ✅ Change password with old password verification

### Security
- ✅ Password hashing with Argon2
- ✅ JWT token authentication
- ✅ Role-based access control
- ✅ Input validation on frontend and backend
- ✅ CORS configuration
- ✅ Environment variables for sensitive data

## 📦 Project Structure

```
user-management-system/
├── backend/
│   ├── config/
│   │   ├── settings.py
│   │   ├── urls.py
│   │   └── wsgi.py
│   ├── apps/
│   │   └── users/
│   │       ├── models.py
│   │       ├── serializers.py
│   │       ├── views.py
│   │       ├── urls/
│   │       ├── permissions.py
│   │       ├── managers.py
│   │       ├── admin.py
│   │       └── tests/
│   ├── manage.py
│   ├── requirements.txt
│   ├── .env
│   └── Procfile
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/
│   │   │   └── layout/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── contexts/
│   │   ├── utils/
│   │   └── App.jsx
│   ├── package.json
│   ├── .env
│   └── vercel.json
└── README.md
```

## 🔧 Setup Instructions

### Prerequisites
- Python 3.11+
- Node.js 18+
- PostgreSQL (or use cloud-hosted database)

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd user-management-system/backend
   ```

2. **Create virtual environment**
   ```bash
   python -m venv venv
   
   # Windows
   venv\Scripts\activate
   
   # macOS/Linux
   source venv/bin/activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure environment variables**
   
   Create `.env` file in backend directory:
   ```env
   SECRET_KEY=your-secret-key-here
   DEBUG=True
   DATABASE_URL=postgresql://user:password@localhost:5432/dbname
   ALLOWED_HOSTS=localhost,127.0.0.1
   CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
   ```

5. **Run migrations**
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```

6. **Create superuser (admin)**
   ```bash
   python manage.py createsuperuser
   ```

7. **Run development server**
   ```bash
   python manage.py runserver
   ```

   Backend will be available at `http://localhost:8000`

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   
   Create `.env` file in frontend directory:
   ```env
   VITE_API_URL=http://localhost:8000/api
   ```

4. **Run development server**
   ```bash
   npm run dev
   ```

   Frontend will be available at `http://localhost:5173`

## 🔐 Environment Variables

### Backend (.env)
| Variable | Description | Example |
|----------|-------------|---------|
| `SECRET_KEY` | Django secret key | `your-secret-key-here` |
| `DEBUG` | Debug mode | `True` or `False` |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host/db` |
| `ALLOWED_HOSTS` | Allowed host names | `localhost,yourdomain.com` |
| `CORS_ALLOWED_ORIGINS` | CORS allowed origins | `http://localhost:5173` |

### Frontend (.env)
| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API base URL | `http://localhost:8000/api` |

## 📡 API Documentation

### Base URL
- **Local**: `http://localhost:8000/api`
- **Production**: `https://your-backend-url.com/api`

### Authentication Endpoints

#### Register User
```http
POST /auth/register/
Content-Type: application/json

{
  "email": "user@example.com",
  "full_name": "John Doe",
  "password": "StrongPass123!@#",
  "confirm_password": "StrongPass123!@#"
}

Response: 201 Created
{
  "user": {
    "id": 1,
    "email": "user@example.com",
    "full_name": "John Doe",
    "role": "USER",
    "status": "ACTIVE"
  },
  "tokens": {
    "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
    "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
  }
}
```

#### Login
```http
POST /auth/login/
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "StrongPass123!@#"
}

Response: 200 OK
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "full_name": "John Doe",
    "role": "USER"
  }
}
```

#### Refresh Token
```http
POST /auth/token/refresh/
Content-Type: application/json

{
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}

Response: 200 OK
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

#### Logout
```http
POST /auth/logout/
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}

Response: 200 OK
{
  "message": "Logout successful"
}
```

### User Endpoints

#### Get Current User
```http
GET /users/me/
Authorization: Bearer <access_token>

Response: 200 OK
{
  "id": 1,
  "email": "user@example.com",
  "full_name": "John Doe",
  "role": "USER",
  "status": "ACTIVE",
  "created_at": "2025-01-01T00:00:00Z",
  "updated_at": "2025-01-01T00:00:00Z"
}
```

#### Update Profile
```http
PUT /users/update_profile/
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "full_name": "John Updated",
  "email": "newemail@example.com"
}

Response: 200 OK
{
  "id": 1,
  "email": "newemail@example.com",
  "full_name": "John Updated",
  "role": "USER",
  "status": "ACTIVE"
}
```

#### Change Password
```http
POST /users/change_password/
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "old_password": "OldPass123!@#",
  "new_password": "NewPass123!@#"
}

Response: 200 OK
{
  "message": "Password updated successfully"
}
```

### Admin Endpoints

#### List All Users (Paginated)
```http
GET /users/?page=1
Authorization: Bearer <admin_access_token>

Response: 200 OK
{
  "count": 25,
  "next": "http://api/users/?page=2",
  "previous": null,
  "results": [
    {
      "id": 1,
      "email": "user@example.com",
      "full_name": "John Doe",
      "role": "USER",
      "status": "ACTIVE",
      "created_at": "2025-01-01T00:00:00Z"
    }
  ]
}
```

#### Activate User
```http
POST /users/{id}/activate/
Authorization: Bearer <admin_access_token>

Response: 200 OK
{
  "message": "User user@example.com activated"
}
```

#### Deactivate User
```http
POST /users/{id}/deactivate/
Authorization: Bearer <admin_access_token>

Response: 200 OK
{
  "message": "User user@example.com deactivated"
}
```

## 🧪 Testing

### Backend Tests

Run all tests:
```bash
cd backend
pytest
```

Run with coverage:
```bash
pytest --cov=apps
```

### Test Coverage
- User model tests
- Authentication tests (register, login, token refresh)
- RBAC permission tests
- User CRUD operation tests
- Activation/deactivation tests

## 🚀 Deployment

### Backend Deployment (Render)

1. **Push code to GitHub**

2. **Create Render account and Web Service**
   - Connect GitHub repository
   - Select `backend` folder as root directory
   - Environment: Python 3
   - Build command: `pip install -r requirements.txt`
   - Start command: `gunicorn config.wsgi`

3. **Add environment variables in Render dashboard**
   ```
   SECRET_KEY=<your-production-secret>
   DEBUG=False
   DATABASE_URL=<render-postgresql-url>
   ALLOWED_HOSTS=.render.com
   CORS_ALLOWED_ORIGINS=https://your-frontend.vercel.app
   ```

4. **Create PostgreSQL database on Render**
   - Link to web service
   - Database URL automatically added to environment

5. **Deploy**
   - Render automatically runs migrations via Procfile
   - Backend available at: `https://your-app.onrender.com`

### Frontend Deployment (Vercel)

1. **Push code to GitHub**

2. **Import project in Vercel**
   - Select repository
   - Framework: Vite
   - Root directory: `frontend`
   - Build command: `npm run build`
   - Output directory: `dist`

3. **Add environment variables**
   ```
   VITE_API_URL=https://your-backend.onrender.com/api
   ```

4. **Deploy**
   - Vercel automatically builds and deploys
   - Frontend available at: `https://your-app.vercel.app`

## 📱 Live Demo

- **Frontend**: [https://your-frontend.vercel.app](https://your-frontend.vercel.app)
- **Backend API**: [https://your-backend.onrender.com](https://your-backend.onrender.com)
- **Walkthrough Video**: [Video Link]

### Test Credentials
- **Admin**: admin@example.com / AdminPass123!@#
- **User**: user@example.com / UserPass123!@#

## 📝 Development Notes

### Password Requirements
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character (!@#$%^&*)

### User Roles
- **ADMIN**: Full access to all features including user management
- **USER**: Can only view and edit their own profile

### User Status
- **ACTIVE**: Can log in and use the system
- **INACTIVE**: Cannot log in (deactivated by admin)

## 🐛 Troubleshooting

### CORS Errors
- Ensure `CORS_ALLOWED_ORIGINS` in backend includes your frontend URL
- Check that frontend is sending requests to correct API URL

### Token Refresh Issues
- Verify refresh token is stored in localStorage
- Check token expiration settings in backend

### Database Connection
- Verify `DATABASE_URL` format: `postgresql://user:pass@host:port/dbname`
- Ensure database is accessible from your deployment platform

## 🤝 Contributing

This project was created as part of the Purple Merit Backend Intern Assessment (December 2025).

## 📄 License

This project is created for assessment purposes.

## 👨‍💻 Author

[Your Name]

## 📧 Contact

For any questions or issues, please contact: [your-email@example.com]
