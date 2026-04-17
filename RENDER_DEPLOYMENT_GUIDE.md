# Complete Deployment Guide: Zoom Video App on Render

This guide walks you through deploying both the backend (Node.js) and frontend (React) to Render.

## Prerequisites

- GitHub account with your repository (zoom-video-app)
- Render account (free tier available at https://render.com)
- MySQL database (you can use Render's managed MySQL or an external provider)

---

## Part 1: Set Up MySQL Database

### Option A: Use a Free External MySQL Provider (Recommended for Free Tier)

1. Go to [Aiven](https://aiven.io) or [FreeSQLDatabase](https://www.freesqldatabase.com/)
2. Create a free MySQL database
3. Note down:
   - **Host/Server**: e.g., `mysql-123abc.a.aivencloud.com`
   - **Username**: e.g., `avnadmin`
   - **Password**: Your password
   - **Database Name**: e.g., `defaultdb`
   - **Port**: Usually `3306`

### Option B: Create MySQL Database on Render

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **"New +"** → **"MySQL"**
3. Configure:
   - **Name**: `zoom-video-db`
   - **MySQL Version**: Latest
   - **Region**: Same as your services (e.g., `Ohio`)
   - **Plan**: Free or Starter
4. Click **"Create Database"**
5. Wait for database to be ready
6. Copy the **Internal Database URL** (for backend service)

---

## Part 2: Deploy Backend Service

### Step 1: Create Backend Service on Render

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository:
   - Select **"zoom-video-app"** repository
   - Click **"Connect"**

### Step 2: Configure Backend Service

Fill in the following details:

| Field | Value |
|-------|-------|
| **Name** | `zoom-video-backend` (or your preferred name) |
| **Environment** | `Node` |
| **Region** | `Ohio` (or your closest region) |
| **Branch** | `main` |
| **Build Command** | `cd backend && npm install` |
| **Start Command** | `cd backend && npm start` |
| **Plan** | Free or Starter |

### Step 3: Add Environment Variables

Click **"Advanced"** and add the following environment variables:

```
DB_HOST=your-mysql-host
DB_USER=your-mysql-user
DB_PASSWORD=your-mysql-password
DB_NAME=your-database-name
DB_PORT=3306
PORT=3000
NODE_ENV=production
```

**Replace with your actual database credentials**

### Step 4: Deploy

1. Click **"Create Web Service"**
2. Render will automatically build and deploy your backend
3. Wait for deployment to complete (5-10 minutes)
4. Copy your backend URL (e.g., `https://zoom-video-backend.onrender.com`)

### Step 5: Initialize Database Tables

Once backend is deployed:

1. Execute the SQL schema on your database:
   - Go to your database provider's admin panel
   - Run the SQL commands from `backend/mysql-schema.sql`
   - This creates the necessary `users` and `meetings` tables

---

## Part 3: Deploy Frontend Service

### Step 1: Create Frontend Service on Render

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository:
   - Select **"zoom-video-app"** repository
   - Click **"Connect"**

### Step 2: Configure Frontend Service

Fill in the following details:

| Field | Value |
|-------|-------|
| **Name** | `zoom-video-frontend` (or your preferred name) |
| **Environment** | `Node` |
| **Region** | `Ohio` (same as backend) |
| **Branch** | `main` |
| **Build Command** | `cd frontend && npm install && npm run build` |
| **Start Command** | `cd frontend && npm start` |
| **Plan** | Free or Starter |

### Step 3: Add Environment Variables

Click **"Advanced"** and add:

```
REACT_APP_BACKEND_URL=https://zoom-video-backend.onrender.com
```

**Replace with your actual backend URL**

### Step 4: Deploy

1. Click **"Create Web Service"**
2. Render will build and deploy your frontend
3. Wait for deployment (10-15 minutes)
4. Your frontend URL will be something like: `https://zoom-video-frontend.onrender.com`

---

## Part 4: Configure CORS on Backend

After deployment, update the backend CORS configuration:

1. Go to your backend service on Render
2. Click **"Environment"**
3. Add or update:
   ```
   FRONTEND_URL=https://zoom-video-frontend.onrender.com
   ```

4. Click **"Manual Deploy"** to redeploy with the update

---

## Part 5: Test Your Deployment

### Test Backend

1. Open browser and visit:
   ```
   https://zoom-video-backend.onrender.com/api/v1/health
   ```
   (if your backend has a health check endpoint)

2. Check backend logs on Render dashboard

### Test Frontend

1. Visit: `https://zoom-video-frontend.onrender.com`
2. Try to **Sign Up** with a test account
3. Try to **Login**
4. Try to **Join/Start a Meeting**

### Troubleshooting Deployment Issues

| Issue | Solution |
|-------|----------|
| **Backend won't deploy** | Check build logs, ensure `cd backend` is in build command |
| **Frontend shows localhost errors** | Redeploy frontend after setting `REACT_APP_BACKEND_URL` |
| **Database connection fails** | Verify DB credentials in backend environment variables |
| **Socket.io connection fails** | Ensure frontend URL is set in backend CORS config |
| **Login/Registration doesn't work** | Check database is initialized with tables |
| **"Internal Server Error"** | Check backend logs on Render dashboard |

---

## Part 6: Monitor and Maintain

### View Logs

1. Go to your service on Render dashboard
2. Click **"Logs"** to see real-time logs
3. Check for errors and debug issues

### Auto-Redeploy on Push

By default, Render auto-deploys when you push to GitHub:
1. Push code to main branch
2. Render automatically rebuilds and deploys
3. No manual action needed

### Update Secrets

If you need to update credentials:
1. Go to service **"Environment"**
2. Modify variables
3. Click **"Manual Deploy"** to apply changes

---

## Common Commands

### Connect to Database (if needed)

Using MySQL client:
```bash
mysql -h your-host -u your-user -p your-database
```

### View Render Logs

From Render dashboard → Your Service → Logs tab

### Restart Service

In Render dashboard → Service Settings → Scroll down → "Restart Service"

---

## Performance Tips for Free Tier

1. **Cold Start**: Free tier services spin down after 15 mins of inactivity. First request will be slow.
2. **Database Limits**: Monitor database connections and queries
3. **Build Time**: Builds can take 5-10 minutes on free tier
4. **Upgrade When Needed**: Consider paid tier for production use

---

## Security Checklist

- [ ] Database password is strong (20+ characters, mixed case, numbers, symbols)
- [ ] Never commit `.env` files to GitHub
- [ ] Use `HTTPS` URLs (automatic with Render)
- [ ] Verify CORS allows only your frontend domain
- [ ] Enable rate limiting on login endpoints
- [ ] Regularly update dependencies
- [ ] Monitor logs for suspicious activity
- [ ] Keep credentials in Render Environment, never in code

---

## Next Steps

1. ✅ Deploy backend
2. ✅ Deploy frontend
3. ✅ Test all features
4. ✅ Set up monitoring
5. Monitor performance and logs
6. Plan upgrade path if traffic grows

---

## Additional Resources

- [Render Documentation](https://render.com/docs)
- [Socket.io Deployment Guide](https://socket.io/docs/v4/faq/)
- [CORS Debugging](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)
- Project Security: See `SECURITY.md` for detailed guidelines
