# Auto ML Project Setup Guide

## Prerequisites
- Python 3.12+
- Node.js 18+
- PostgreSQL (or use Neon for database)

## Step 1: Backend Setup

### 1.1 Navigate to backend directory
```powershell
cd backend
```

### 1.2 Create & Activate Virtual Environment
```powershell
# Create venv
python -m venv venv

# Activate (Windows)
.\venv\Scripts\Activate.ps1

# Or on Linux/Mac:
source venv/bin/activate
```

### 1.3 Install Dependencies
```powershell
pip install -r requirements.txt
```

### 1.4 Set Database Environment Variable (IMPORTANT!)
```powershell
# Option A: Use Neon PostgreSQL (Production/Cloud)
$env:DATABASE_URL = "postgresql://neondb_owner:npg_e2vln0jRhCpg@ep-shy-cake-aiqq913s-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"

# Option B: Use SQLite for Local Development (No setup needed)
# Just skip setting DATABASE_URL and the app will use db.sqlite3
```

### 1.5 Run Migrations
```powershell
python manage.py migrate
```

### 1.6 Create Superuser (Optional)
```powershell
python manage.py createsuperuser
```

### 1.7 Start Backend Server
```powershell
python manage.py runserver
```
Backend will run on: `http://localhost:8000`

---

## Step 2: Frontend Setup

### 2.1 Open New Terminal, Navigate to Frontend
```powershell
cd frontend
```

### 2.2 Install Dependencies
```powershell
npm install
```

### 2.3 Start Development Server
```powershell
npm run dev
```
Frontend will run on: `http://localhost:5173`

---

## Step 3: Test the Application

1. Open browser: `http://localhost:5173`
2. Click "Create Account" or "Sign Up"
3. Enter credentials (username, email, password)
4. After signup, login with your credentials
5. Upload a CSV file to test the ML pipeline

---

## API Endpoints

### Authentication
- `POST /api/token/` - Login (returns access token)
- `POST /api/token/refresh/` - Refresh token
- `POST /api/register/` - Register new user

### Data Processing
- `POST /api/process/` - Upload & process CSV file
- `GET /api/projects/` - Get user's project history
- `DELETE /api/projects/<id>/` - Delete a project

### Training & Profile
- `POST /api/train/` - Train ML model on processed data
- `GET /api/profile/` - Get user profile
- `PATCH /api/profile/` - Update user profile

---

## Environment Variables

Create a `.env` file in the backend directory:

```
DATABASE_URL=postgresql://user:password@host/database?sslmode=require
SECRET_KEY=your-secret-key
DEBUG=True
```

---

## Troubleshooting

### Database Connection Error
```
psycopg2.OperationalError: connection failed
```
**Solution:** Check that DATABASE_URL is set correctly or use SQLite (comment out DATABASE_URL).

### Port Already in Use
```
Address already in use
```
**Solution:** Change port:
```powershell
# Backend on different port
python manage.py runserver 8001

# Frontend on different port
npm run dev -- --port 5174
```

### Module Not Found Error
**Solution:** Reinstall requirements:
```powershell
pip install -r requirements.txt --force-reinstall
```

### Frontend can't reach backend
**Solution:** Update API URLs in `frontend/src/App.jsx`:
```javascript
// Change from production URL to local:
// FROM: 'https://automl-backend-z8zn.onrender.com/api/...'
// TO:   'http://localhost:8000/api/...'
```

---

## Production Deployment

### Backend (Render.com)
1. Push code to GitHub
2. Create new Render service
3. Set `DATABASE_URL` to your Neon connection string
4. Deploy

### Frontend (Vercel)
1. Push code to GitHub
2. Connect repository on Vercel
3. Set build command: `npm run build`
4. Deploy

---

## Notes
- On first load, migrations will create database tables
- For development, SQLite is used by default (no PostgreSQL needed)
- For production, use Neon PostgreSQL connection string
