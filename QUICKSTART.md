# Quick Start Guide - Auto ML Project

## ⚡ Fastest Way to Get Running (5 minutes)

### 1️⃣ Backend Setup
```powershell
# In PowerShell, navigate to backend
cd backend

# Create virtual environment
python -m venv venv

# Activate it
.\venv\Scripts\Activate.ps1

# Install packages
pip install -r requirements.txt

# Run migrations (creates database tables)
python manage.py migrate

# Start server
python manage.py runserver
```
✅ Backend running on `http://localhost:8000`

---

### 2️⃣ Frontend Setup (New Terminal)
```powershell
# Navigate to frontend
cd frontend

# Install packages
npm install

# Start dev server
npm run dev
```
✅ Frontend running on `http://localhost:5173`

---

### 3️⃣ Test It!
1. Open `http://localhost:5173` in browser
2. Sign up with any username/email/password
3. Login with your credentials
4. Upload a CSV file for processing
5. See the magic! ✨

---

## 🔑 Important: Database Configuration

### Option 1: SQLite (Easiest for Local Development) ✅
- No setup needed
- Just run migrations
- Data stored in `backend/db.sqlite3`

### Option 2: Neon PostgreSQL (Production)
```powershell
# Before running backend:
$env:DATABASE_URL = "postgresql://neondb_owner:npg_e2vln0jRhCpg@ep-shy-cake-aiqq913s-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"

python manage.py migrate
python manage.py runserver
```

---

## 🚨 Common Issues & Fixes

### ❌ "Address already in use"
```powershell
# Run on different port
python manage.py runserver 8001
# or
npm run dev -- --port 5174
```

### ❌ "Module not found"
```powershell
pip install -r requirements.txt --force-reinstall
# or
npm install --legacy-peer-deps
```

### ❌ "CORS error in console"
- Backend not running? Start it with `python manage.py runserver`
- Check API_URL in frontend/src/App.jsx matches backend port

### ❌ Signup fails
- Check database is running (migrations completed)
- Check backend is accessible from frontend
- Check browser console for error details

---

## 📁 Project Structure

```
Auto ML/
├── backend/          # Django REST API
│   ├── core/        # Django settings & config
│   ├── processor/   # ML processing app
│   ├── media/       # Uploaded files & outputs
│   └── manage.py    # Django management
│
├── frontend/        # React + Vite UI
│   ├── src/
│   │   └── App.jsx  # Main component
│   └── package.json
```

---

## 🎯 What This Project Does

1. **Upload CSV** → System analyzes data
2. **Data Cleaning** → Removes duplicates, fills missing values
3. **Quality Score** → Before/after data quality rating
4. **Visualizations** → Heatmaps, distributions, correlations
5. **ML Training** → Train RandomForest model on any column
6. **Download Results** → Get processed CSV + trained model

---

## 📊 API Endpoints (All prefixed with `/api/`)

**Auth:**
- `POST /token/` - Login
- `POST /register/` - Signup

**Data:**
- `POST /process/` - Upload & process CSV
- `GET /projects/` - Get history

**ML:**
- `POST /train/` - Train model

**Profile:**
- `GET /profile/` - Get user profile
- `PATCH /profile/` - Update profile

---

## 🚀 Deployment

### Frontend (Vercel)
1. Push to GitHub
2. Connect repo on vercel.com
3. Set `VITE_API_URL` to your backend URL
4. Deploy ✅

### Backend (Render)
1. Push to GitHub
2. Create service on render.com
3. Set `DATABASE_URL` to Neon connection
4. Deploy ✅

---

## 💡 Tips

- Token stored in localStorage - logout clears it
- Images stored with UUID to avoid conflicts
- Models stored as `.pkl` files
- Reports saved as JSON in database

Enjoy! 🎉
