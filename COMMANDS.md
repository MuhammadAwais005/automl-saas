# ⚡ COMMAND REFERENCE - Copy & Paste

## 🔥 FASTEST START (Copy these commands)

### Terminal 1 - BACKEND
```powershell
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

### Terminal 2 - FRONTEND (after backend starts)
```powershell
cd frontend
npm install
npm run dev
```

### Then Open Browser
```
http://localhost:5173
```

---

## 📌 Common Commands

### Backend Management
```powershell
# Activate venv
.\venv\Scripts\Activate.ps1

# Deactivate venv
deactivate

# Run migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Start server
python manage.py runserver

# Start on different port
python manage.py runserver 8001

# Open Django shell
python manage.py shell

# Run tests
python manage.py test

# Collect static files
python manage.py collectstatic --noinput
```

### Frontend Management
```powershell
# Install dependencies
npm install

# Start dev server
npm run dev

# Start on different port
npm run dev -- --port 5174

# Build for production
npm build

# Preview build
npm run preview

# Lint code
npm run lint
```

---

## 🗄️ Database Commands

### Using SQLite (Default)
```powershell
# No setup needed! Just run migrations:
python manage.py migrate

# View database (optional - needs sqlite3)
sqlite3 db.sqlite3
.tables
.quit
```

### Using Neon PostgreSQL
```powershell
# Set connection string (Windows)
$env:DATABASE_URL = "postgresql://neondb_owner:npg_e2vln0jRhCpg@ep-shy-cake-aiqq913s-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"

# On Linux/Mac
export DATABASE_URL="postgresql://neondb_owner:npg_e2vln0jRhCpg@ep-shy-cache-aiqq913s-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"

# Then run migrations
python manage.py migrate

# Test connection
python manage.py dbshell
```

---

## 🔑 Environment Variables

### Backend (.env or System)
```
# Neon PostgreSQL
DATABASE_URL=postgresql://user:password@host/database?sslmode=require

# Django
SECRET_KEY=your-secret-key-here
DEBUG=True  # Set to False in production
```

### Frontend (.env or vite.config.js)
```
# Local development
VITE_API_URL=http://localhost:8000

# Production
VITE_API_URL=https://your-backend.com
```

---

## 🧪 Testing Endpoints

### With PowerShell

#### Signup
```powershell
$body = @{
    username = "testuser"
    email = "test@example.com"
    password = "password123"
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:8000/api/register/" `
  -Method POST `
  -ContentType "application/json" `
  -Body $body
```

#### Login (Get Token)
```powershell
$body = @{
    username = "testuser"
    password = "password123"
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:8000/api/token/" `
  -Method POST `
  -ContentType "application/json" `
  -Body $body
```

#### Get Projects (with token)
```powershell
$token = "your-access-token-here"

Invoke-WebRequest -Uri "http://localhost:8000/api/projects/" `
  -Method GET `
  -Headers @{ "Authorization" = "Bearer $token" }
```

---

## 🆎 With curl (if installed)

### Signup
```bash
curl -X POST http://localhost:8000/api/register/ \
  -H "Content-Type: application/json" \
  -d '{"username":"user1","email":"user@example.com","password":"pass123"}'
```

### Login
```bash
curl -X POST http://localhost:8000/api/token/ \
  -H "Content-Type: application/json" \
  -d '{"username":"user1","password":"pass123"}'
```

### Get Projects
```bash
TOKEN="your-access-token"
curl -H "Authorization: Bearer $TOKEN" http://localhost:8000/api/projects/
```

---

## 🛠️ Troubleshooting Commands

### Clear Database & Start Fresh
```powershell
# Delete SQLite database
Remove-Item -Force backend\db.sqlite3

# Re-run migrations
cd backend
python manage.py migrate
python manage.py createsuperuser  # Optional
```

### Clear Python Cache
```powershell
# Remove all __pycache__ directories
Get-ChildItem -Recurse -Filter __pycache__ | Remove-Item -Recurse

# Remove all .pyc files
Get-ChildItem -Recurse -Filter *.pyc | Remove-Item
```

### Clear npm Cache
```powershell
npm cache clean --force
```

### Check Ports in Use
```powershell
# See what's using port 8000
netstat -ano | findstr :8000

# See what's using port 5173
netstat -ano | findstr :5173

# Kill process by PID (replace XXXX)
taskkill /PID XXXX /F
```

### Reinstall Everything
```powershell
# Backend
cd backend
Remove-Item -Recurse -Force venv
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
python manage.py migrate

# Frontend
cd frontend
Remove-Item -Recurse node_modules
npm install
npm run dev
```

---

## 📊 Useful File Locations

```
Auto ML/
├── backend/
│   ├── db.sqlite3 ..................... Local database
│   ├── manage.py ...................... Django CLI
│   ├── requirements.txt ............... Python dependencies
│   ├── media/ ......................... User uploads & outputs
│   │   ├── uploads/ ................... CSV files
│   │   ├── plots/ .................... Heatmaps & graphs
│   │   └── models/ ................... Trained models
│   ├── core/
│   │   └── settings.py ............... Configuration here
│   └── processor/
│       ├── views.py .................. API endpoints
│       ├── models.py ................. Database schemas
│       └── engine.py ................. ML processing logic
│
├── frontend/
│   └── src/
│       ├── App.jsx ................... Main React component
│       ├── main.jsx .................. Entry point
│       └── index.css ................. Tailwind imports
│
├── docs/
│   ├── QUICKSTART.md ................. Quick setup
│   ├── SETUP.md ...................... Detailed setup
│   ├── CHECKLIST.md .................. Pre-run checks
│   └── FIXES_SUMMARY.md .............. Fix details
```

---

## 🚀 Production Deployment

### Deploy Backend to Render

```bash
# 1. Push to GitHub
git push origin main

# 2. On Render.com:
# - Create new Web Service
# - Connect GitHub repo
# - Set Build Command: pip install -r requirements.txt
# - Set Start Command: gunicorn core.wsgi:application
# - Set Environment Variable:
#   DATABASE_URL = your-neon-connection-string
# - Deploy

# Backend URL: https://your-backend.onrender.com
```

### Deploy Frontend to Vercel

```bash
# 1. Push to GitHub

# 2. On Vercel.com:
# - Import GitHub project
# - Framework: Vite
# - Build Command: npm run build
# - Output Directory: dist
# - Environment Variable:
#   VITE_API_URL = https://your-backend.onrender.com
# - Deploy

# Frontend URL: https://your-frontend.vercel.app
```

### Environment Variables Checklist

Production apps need:
```
NEON DATABASE_URL = postgresql://...@....neon.tech/...
BACKEND RESULT = https://your-backend.onrender.com
FRONTEND VITE_API_URL = https://your-backend.onrender.com
FRONTEND CORS origin = https://your-frontend.vercel.app (in backend settings)
```

---

## 💡 Quick Tips

- **Lost in terminal?** Press `Ctrl+C` to stop server, then clear screen with `cls`
- **Port busy?** Use different ports (8001, 8002, etc.)
- **Stuck loading?** Check browser console (F12 → Console tab)
- **API not responding?** Backend running? Check `http://localhost:8000/api/`
- **CORS errors?** Backend not running or wrong base URL
- **Module not found?** Reinstall with `pip install -r requirements.txt` or `npm install`
- **Database locked?** Close other connections or restart server

---

## ✨ That's it!

You now have everything you need to run, test, and deploy your Auto ML project.

Copy-paste the quick start commands and you'll be running in minutes! 🚀
