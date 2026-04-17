# 🚀 Complete Render Deployment Guide

Deploy your Zoom video app so anyone can access it from any laptop!

## Overview

We'll deploy:
- **Backend** on Render (Node.js)
- **Frontend** on Render (React)
- **Database** on Render (MySQL)

---

## Prerequisites

1. **GitHub Account** - Create at https://github.com
2. **Render Account** - Create at https://render.com
3. **Your code on GitHub** - Push this project to GitHub

---

## Step 1: Prepare Your Code for Deployment

### 1.1 Create `.gitignore` entries for sensitive files

Ensure these are in `.gitignore` (already added):

```
# Security keys and certificates
/backend/keys/
/backend/certs/
.env
node_modules/
```

**Verify:**
```bash
git status
# Should NOT show:
# - backend/keys/
# - backend/certs/
# - .env files
```

### 1.2 Create `.env.production` for production environment

Create file: `backend/.env.production`

```env
# Server Configuration
PORT=3000
NODE_ENV=production

# Database (will be set by Render, but include for reference)
DB_HOST=your-mysql-db-host
DB_PORT=3306
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=zoom_video_app

# Frontend URL (important: update after frontend deployment)
FRONTEND_URL=https://your-frontend-url.onrender.com

# Render will provide these automatically
# RSA_KEY_PATH and other config will be loaded from environment
```

### 1.3 Create `.env.example` (already done, verify):

```bash
cat backend/.env.example
# Should show all environment variables needed
```

---

## Step 2: Push Code to GitHub

### 2.1 Initialize Git Repository

```bash
cd D:\CSB cp\zoom-video-app

# Initialize if not already initialized
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit: Zoom video app with JWT security"
```

### 2.2 Create GitHub Repository

1. Go to https://github.com/new
2. **Repository name**: `zoom-video-app`
3. **Description**: "Zoom-like video meeting app with JWT security"
4. **Public** (so you can deploy on free Render)
5. Click "Create repository"

### 2.3 Push to GitHub

```bash
# Add remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/zoom-video-app.git
git branch -M main
git push -u origin main

# Verify
# Go to https://github.com/YOUR_USERNAME/zoom-video-app
# Should show your code
```

---

## Step 3: Deploy Backend on Render

### 3.1 Create MySQL Database on Render

1. Go to https://dashboard.render.com
2. Click **"New +"** → **"MySQL"**
3. **Instance Name**: `zoom-video-app-db`
4. **Database Name**: `zoom_video_app`
5. Region: Choose closest to you
6. Click **"Create Database"**
7. Wait 5-10 minutes for database to be ready

**Save these credentials** (visible on database page):
```
Host: (something-like).render.com
Port: 3306
User: (provided)
Password: (provided)
Database: zoom_video_app
```

### 3.2 Create Backend Service on Render

1. Go to https://dashboard.render.com
2. Click **"New +"** → **"Web Service"**
3. **Connect to Repository**:
   - Click "Public Git Repository"
   - Paste: `https://github.com/YOUR_USERNAME/zoom-video-app.git`
   - Click "Deploy Public Repository"

4. **Configuration**:
   - **Name**: `zoom-video-app-backend`
   - **Region**: Same as database
   - **Branch**: `main`
   - **Runtime**: `Node`
   - **Build Command**: `cd backend && npm install`
   - **Start Command**: `cd backend && npm start`

5. **Environment Variables** - Click "Advanced" → "Add Environment Variable":

```
MYSQL_HOST = (your database host)
MYSQL_PORT = 3306
MYSQL_USER = (your database user)
MYSQL_PASSWORD = (your database password)
MYSQL_DATABASE = zoom_video_app
NODE_ENV = production
FRONTEND_URL = https://your-frontend-url.onrender.com (set this after frontend)
```

6. **Plan**: Free or Paid (Free tier works for learning)
7. Click **"Create Web Service"**
8. Wait for deployment (should take 5-10 minutes)

**Save your backend URL** from the Render dashboard:
```
https://zoom-video-app-backend.onrender.com
```

### 3.3 Generate RSA Keys on Render Backend

1. Go to Render dashboard
2. Click your backend service
3. Go to **"Shell"** tab
4. Run:
```bash
apt-get update && apt-get install -y openssl
cd backend
npm run generate-keys
```

5. Verify keys created:
```bash
ls -la keys/
# Should show: private.key, public.key
```

**⚠️ Note**: Keys will be regenerated on every Render restart. To persist them, see "Advanced: Persistent Keys" section below.

---

## Step 4: Deploy Frontend on Render

### 4.1 Create Frontend Service on Render

1. Go to https://dashboard.render.com
2. Click **"New +"** → **"Static Site"**
3. **Connect to Repository**:
   - Click "Public Git Repository"
   - Paste: `https://github.com/YOUR_USERNAME/zoom-video-app.git`
   - Click "Deploy"

4. **Configuration**:
   - **Name**: `zoom-video-app-frontend`
   - **Region**: Same as backend
   - **Branch**: `main`
   - **Build Command**: `cd frontend && npm install && npm run build`
   - **Publish Directory**: `frontend/build`

5. **Environment Variables**:
   - Click "Advanced" → "Add Environment Variable":
   ```
   REACT_APP_BACKEND_URL = https://zoom-video-app-backend.onrender.com
   ```

6. Click **"Create Static Site"**
7. Wait for deployment (should take 5-10 minutes)

**Save your frontend URL** from the Render dashboard:
```
https://zoom-video-app-frontend.onrender.com
```

---

## Step 5: Connect Frontend and Backend

### 5.1 Update Backend FRONTEND_URL

1. Go to Render dashboard
2. Click backend service
3. Click **"Environment"**
4. Edit `FRONTEND_URL`:
   - Old: `https://your-frontend-url.onrender.com`
   - New: `https://zoom-video-app-frontend.onrender.com`
5. Click "Save" (service will redeploy)

### 5.2 Verify Connection

1. Go to https://zoom-video-app-frontend.onrender.com
2. You should see the login page
3. Try to sign up with test credentials:
   - Name: Test User
   - Username: testuser
   - Password: password123
4. If signup successful, you'll see "User registered" ✅

---

## Step 6: Test Complete Deployment

### 6.1 Test Sign Up

```
Frontend: https://zoom-video-app-frontend.onrender.com
→ Click "Sign Up"
→ Enter:
  Name: Test User
  Username: testuser
  Password: password123
→ Click "Sign Up"
Expected: "User registered" ✅
```

### 6.2 Test Login

```
Frontend: https://zoom-video-app-frontend.onrender.com
→ Click "Sign In"
→ Enter:
  Username: testuser
  Password: password123
→ Click "Login"
Expected: Redirected to home page ✅
```

### 6.3 Test API Directly

```bash
# Set variables
BACKEND_URL="https://zoom-video-app-backend.onrender.com"

# Test login
curl -X POST $BACKEND_URL/api/v1/users/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"password123"}'

# Expected response:
# {
#   "accessToken": "eyJhbGc...",
#   "refreshToken": "eyJhbGc...",
#   "user": { "id": 1, "username": "testuser", "name": "Test User" }
# }
```

---

## Step 7: Share with Others

### 7.1 Give Access to Friends

Share this link with anyone:

```
https://zoom-video-app-frontend.onrender.com
```

They can:
1. Sign up with their own credentials
2. Log in
3. Use the app from any device

### 7.2 Access from Different Devices

**From another laptop:**
1. Open: `https://zoom-video-app-frontend.onrender.com`
2. Sign up or log in with credentials
3. Use the app normally

---

## Troubleshooting

### Problem: Backend showing 502 Bad Gateway

**Cause**: Backend failed to start or database not configured

**Solution**:
```bash
1. Check database credentials in Render environment
2. Verify MySQL database is running
3. Check backend logs:
   - Render Dashboard → Backend → Logs
   - Look for errors
```

### Problem: Frontend showing "Connection Refused"

**Cause**: Frontend can't connect to backend URL

**Solution**:
```bash
1. Verify REACT_APP_BACKEND_URL is correct
2. Check if backend is running
3. Open browser console (F12) → Network tab
4. Check if API calls are being made to correct URL
```

### Problem: Login fails with "Something went wrong"

**Cause**: RSA keys not generated or database issue

**Solution**:
```bash
1. SSH into Render backend
2. Run: npm run generate-keys
3. Check database is connected:
   - Verify MYSQL_* environment variables
   - Test database connection
4. Check logs: Render Dashboard → Backend → Logs
```

### Problem: Database connection timeout

**Cause**: Network connectivity or wrong credentials

**Solution**:
```bash
1. Verify MYSQL_HOST is correct (from Render MySQL page)
2. Verify MYSQL_USER and MYSQL_PASSWORD
3. Check if MySQL service is running on Render
4. Try connecting with MySQL client:
   mysql -h host -u user -p -D database
```

### Problem: "Port already in use"

**Cause**: Port 3000 is already used

**Solution**:
```bash
# Render automatically assigns PORT from environment
# Change Start Command to:
cd backend && PORT=$PORT npm start
```

---

## Advanced: Custom Domain (Optional)

### Setup Custom Domain

1. Register domain (GoDaddy, Namecheap, etc.)
2. Go to Render service
3. Click **"Settings"** → **"Custom Domain"**
4. Enter your domain
5. Update DNS records (instructions on Render page)
6. Wait for SSL certificate (5-10 minutes)

Example:
```
Your domain: myvideoapp.com
Frontend: myvideoapp.com → Points to Render frontend
Backend: api.myvideoapp.com → Points to Render backend
```

---

## Advanced: Persistent RSA Keys

Currently, RSA keys are regenerated on Render restart. To persist them:

### Option 1: Store Keys in Environment

```bash
cd backend
cat keys/private.key | base64

# Copy output, add to Render environment:
RSA_PRIVATE_KEY = (base64 encoded key)
RSA_PUBLIC_KEY = (base64 encoded key)
```

Update `backend/src/utils/jwt.js`:

```javascript
let privateKey, publicKey;

if (process.env.RSA_PRIVATE_KEY) {
    privateKey = Buffer.from(process.env.RSA_PRIVATE_KEY, 'base64').toString();
    publicKey = Buffer.from(process.env.RSA_PUBLIC_KEY, 'base64').toString();
} else {
    // Load from files (for local development)
    privateKey = fs.readFileSync(path.join(keysDir, "private.key"), "utf8");
    publicKey = fs.readFileSync(path.join(keysDir, "public.key"), "utf8");
}
```

### Option 2: Use Render Disks (Paid Feature)

1. Add persistent disk to Render service
2. Store keys there
3. Keys survive restarts

### Option 3: Generate Once, Never Change

Accept that keys change on restart. All old tokens become invalid (users need to log in again).

---

## Summary Checklist

### Deployment Steps:

- [ ] Code committed to GitHub
- [ ] Render MySQL database created
- [ ] Render backend deployed
- [ ] Render frontend deployed
- [ ] RSA keys generated on backend
- [ ] Environment variables configured
- [ ] FRONTEND_URL set on backend
- [ ] REACT_APP_BACKEND_URL set on frontend
- [ ] Test sign up works
- [ ] Test login works
- [ ] Share link with friends

### Post-Deployment:

- [ ] Monitor logs for errors
- [ ] Test from different devices
- [ ] Set custom domain (optional)
- [ ] Enable persistent key storage (optional)
- [ ] Setup HTTPS certificate (Render does this automatically)
- [ ] Monitor database usage
- [ ] Setup SSL/HTTPS (Render does this automatically)

---

## Final URLs

After deployment, you'll have:

```
Frontend URL:
https://zoom-video-app-frontend.onrender.com

Backend URL:
https://zoom-video-app-backend.onrender.com

Database:
your-mysql-database.render.com:3306

Share with friends:
https://zoom-video-app-frontend.onrender.com
```

---

## Cost Information

**Render Free Tier**:
- Web Services: FREE (with limitations)
  - Spins down after 15 minutes of inactivity
  - Slow startup (~30 seconds)
- Static Sites: FREE
- MySQL: Monthly cost (~$5-15)

**Render Paid Tier**:
- Web Services: $7+/month
  - Always running (no spin-down)
  - Faster startup
- MySQL: ~$5+/month

For learning/testing, free tier is sufficient!

---

## Next Steps

1. **Push code to GitHub** (if not already done)
2. **Create Render MySQL database**
3. **Deploy backend**
4. **Deploy frontend**
5. **Test deployment**
6. **Share with friends!**

Questions? Check the individual guide documents in your project:
- `QUICK_SECURITY_SETUP.md` - Security setup
- `SECURITY_EXPLAINED.md` - How security works
- `HTTPS_TLS_SETUP.md` - HTTPS configuration

---

**Your app is now accessible to anyone in the world! 🌍**
