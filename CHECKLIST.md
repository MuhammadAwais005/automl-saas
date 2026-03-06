# ✅ PRE-RUN CHECKLIST

Before running your Auto ML project, verify these items:

## 📦 Prerequisites
- [ ] Python 3.12+ installed
- [ ] Node.js 18+ installed  
- [ ] Git (optional, for version control)

## 🔧 Backend Checklist

### Setup
- [ ] Navigate to `backend` directory
- [ ] Create virtual environment: `python -m venv venv`
- [ ] Activate venv: `.\venv\Scripts\Activate.ps1`
- [ ] Install packages: `pip install -r requirements.txt`

### Database Configuration
- [ ] For LOCAL development: No action needed (uses SQLite)
- [ ] For NEON setup: Set environment variable:
  ```powershell
  $env:DATABASE_URL = "postgresql://neondb_owner:npg_e2vln0jRhCpg@ep-shy-cake-aiqq913s-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
  ```

### Migration
- [ ] Run migrations: `python manage.py migrate`
  - ✅ You should see: "Applying auth.0001_initial..." etc.
  - ✅ Should complete without errors

### Verification
- [ ] Start server: `python manage.py runserver`
  - ✅ You should see: "Starting development server at http://127.0.0.1:8000/"
  - ✅ No connection errors
- [ ] Keep terminal running, open NEW terminal for frontend

---

## 🎨 Frontend Checklist

### Setup (NEW TERMINAL)
- [ ] Navigate to `frontend` directory
- [ ] Install packages: `npm install`
  - ✅ Should complete without critical errors
  - ⚠️ Warnings are OK

### Configuration
- [ ] Check API URL setup (.env or vite auto-detect)
  - ✅ Should default to `http://localhost:8000`
  - ✅ Editable via `VITE_API_URL` env var

### Verification
- [ ] Start dev server: `npm run dev`
  - ✅ You should see: "Local: http://localhost:5173"
  - ✅ No connection errors

---

## 🧪 Functionality Checklist

### Authentication
- [ ] Open browser to `http://localhost:5173`
- [ ] Click "Create Account"
- [ ] Fill in username, email, password
- [ ] Click "Sign Up"
  - ✅ Should show success message
  - ✅ Should redirect to dashboard
- [ ] If redirected to login, login with new credentials
  - ✅ Should show dashboard

### Data Processing
- [ ] Create a test CSV file (or download sample from internet)
- [ ] Upload CSV to dashboard
- [ ] Click "Start Process"
- [ ] Wait for processing
  - ✅ Should show initial and final scores
  - ✅ Should show heatmap and distributions
  - ✅ Should show processing log

### ML Training
- [ ] On the processed data, select a target column
- [ ] Click "Train Model"
- [ ] Wait for training
  - ✅ Should show accuracy/R2 score
  - ✅ Should provide download link for .pkl model

### Profile & Download
- [ ] Click profile tab (top left sidebar)
- [ ] Update profile info
- [ ] Upload profile photo
- [ ] Save changes
  - ✅ Should show success message
- [ ] Go back to analytics tab
- [ ] Click "Download CSV"
  - ✅ File should download

---

## 🐛 If Something Goes Wrong

### Error: "Address already in use"
```powershell
# Use different port
python manage.py runserver 8001
# OR
npm run dev -- --port 5174
```

### Error: "psycopg2.OperationalError"
```powershell
# Make sure you set DATABASE_URL OR let it use SQLite
# Delete if exists: backend/db.sqlite3
python manage.py migrate
```

### Error: Database table doesn't exist
```powershell
# Re-run migrations
python manage.py migrate
# If still fails, try reset (WARNING: deletes all data)
python manage.py migrate processor zero
python manage.py migrate
```

### Error: CORS/Connection refused
- [ ] Backend running on http://localhost:8000?
- [ ] Frontend can access it? Check browser console (F12)
- [ ] Check API_URL in App.jsx is correct

### Frontend shows blank page
- [ ] Check browser console for errors (F12)
- [ ] Check Network tab for failed requests
- [ ] Make sure backend is running
- [ ] Try clearing localStorage: `localStorage.clear()` in console

---

## 📊 Expected Behavior

✅ **On Signup:**
- User created in database
- JWT token generated
- Redirect to dashboard

✅ **On CSV Upload:**
- File saved to `backend/media/uploads/`
- Data processed (nulls filled, duplicates removed)
- Quality score calculated
- Processed file saved to `backend/media/`
- Heatmap generated to `backend/media/plots/`
- Report saved to database

✅ **On Model Training:**
- RandomForest trained
- Model saved to `backend/media/models/`
- Accuracy/R2 score displayed
- Download link provided

---

## 🎎 File Locations

### Backend
- Settings: `backend/core/settings.py`
- DB: `backend/db.sqlite3` (SQLite) or Neon (if configured)
- Uploads: `backend/media/uploads/`
- Processed: `backend/media/` (various files)
- Models: `backend/media/models/`
- Plots: `backend/media/plots/`

### Frontend
- Main app: `frontend/src/App.jsx`
- Config: `frontend/vite.config.js`
- Styles: `frontend/src/index.css`

---

## ✨ Ready to Go!

If all checkboxes are checked, your project is ready!

**Next Steps:**
1. Keep both terminals running (backend + frontend)
2. Open http://localhost:5173
3. Sign up/login
4. Upload a CSV and explore features
5. Check console/terminal for any errors

---

## 📞 Quick Support

| Problem | Check |
|---------|-------|
| Can't login | Backend running? Database exists? |
| Upload fails | Backend has write access? File is CSV? |
| No visualizations | Numeric columns in CSV? |
| Training fails | Target column selected? Enough data? |
| Slow processing | Large file? Check browser console |

---

**Enjoy your Auto ML project!** 🚀
