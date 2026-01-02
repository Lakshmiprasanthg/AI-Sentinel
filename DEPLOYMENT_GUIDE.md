# =====================================================
# AI-SENTINEL DEPLOYMENT GUIDE
# =====================================================

## 🚀 Deployment Overview

**Frontend**: Vercel (Recommended for Vite/React apps)
**Backend**: Render.com (Free tier with Puppeteer support)
**Database**: MongoDB Atlas (Already configured)

---

## 📋 PRE-DEPLOYMENT CHECKLIST

### ✅ 1. Prerequisites Setup

#### A. MongoDB Atlas (Database)
- [ ] Create MongoDB Atlas account at https://cloud.mongodb.com
- [ ] Create a new cluster (M0 Free tier is sufficient)
- [ ] Create database user with read/write permissions
- [ ] Whitelist IP addresses:
  - For Render: Add `0.0.0.0/0` (allows all IPs)
  - For production: Whitelist specific Render IPs
- [ ] Get connection string (should look like: `mongodb+srv://username:password@cluster.mongodb.net/`)

#### B. Google Cloud Console (OAuth & API)
1. **Create Project**
   - Go to https://console.cloud.google.com
   - Create new project or select existing one

2. **Enable APIs**
   - Enable "Google+ API"
   - Enable "Google Identity Toolkit API"

3. **Create OAuth 2.0 Credentials**
   - Go to "APIs & Services" > "Credentials"
   - Create "OAuth 2.0 Client ID"
   - Application type: "Web application"
   - Add Authorized JavaScript origins:
     - `http://localhost:3000` (development)
     - `https://your-app.vercel.app` (production - add after deployment)
   - Add Authorized redirect URIs:
     - `http://localhost:5000/api/auth/google/callback` (development)
     - `https://your-backend.onrender.com/api/auth/google/callback` (production)
   - Save Client ID and Client Secret

4. **Configure OAuth Consent Screen**
   - Add app name, user support email
   - Add authorized domains
   - Add test users if in testing mode

#### C. Google Gemini API
- [ ] Go to https://makersuite.google.com/app/apikey
- [ ] Create new API key
- [ ] Save the key securely

#### D. Generate Secure Secrets
Run these commands to generate secure secrets:

```powershell
# JWT Secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Session Secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## 🔧 STEP 1: DEPLOY BACKEND TO RENDER

### A. Prepare Backend for Deployment

1. **Verify package.json scripts**
   - Ensure `start` script exists: `"start": "node server.js"`
   - Already configured ✅

2. **Test locally one more time**
   ```powershell
   cd backend
   npm install
   npm start
   ```

### B. Deploy to Render

1. **Create Render Account**
   - Go to https://render.com
   - Sign up with GitHub

2. **Create New Web Service**
   - Click "New +" > "Web Service"
   - Connect your GitHub repository
   - Select the repository: `AI-Sentinel`

3. **Configure Web Service**
   - **Name**: `ai-sentinel-backend`
   - **Region**: Choose closest to your users
   - **Branch**: `main` or `master`
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free

4. **Add Environment Variables** (CRITICAL!)
   Click "Advanced" > "Add Environment Variable" and add all of these:

   ```
   NODE_ENV=production
   PORT=10000
   
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ai-sentinel?retryWrites=true&w=majority
   
   JWT_SECRET=<your-generated-secret-from-above>
   SESSION_SECRET=<your-generated-secret-from-above>
   
   GOOGLE_CLIENT_ID=<your-client-id>.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=<your-client-secret>
   GOOGLE_CALLBACK_URL=https://ai-sentinel-backend.onrender.com/api/auth/google/callback
   
   GEMINI_API_KEY=<your-gemini-api-key>
   
   FRONTEND_URL=https://your-app.vercel.app
   
   MAX_FILE_SIZE=10485760
   MAX_TEXT_LENGTH=500000
   RATE_LIMIT_WINDOW_MS=60000
   RATE_LIMIT_MAX_REQUESTS=10
   DAILY_ANALYSIS_LIMIT=50
   ```

   **IMPORTANT**: 
   - Replace `<placeholders>` with actual values
   - `FRONTEND_URL` will be updated after frontend deployment
   - `GOOGLE_CALLBACK_URL` should match your Render app URL

5. **Create Web Service**
   - Click "Create Web Service"
   - Wait 5-10 minutes for deployment
   - Note your backend URL: `https://ai-sentinel-backend.onrender.com`

6. **Verify Backend Deployment**
   - Visit: `https://ai-sentinel-backend.onrender.com/health`
   - Should return: `{ "status": "OK", "message": "Server is running" }`

---

## 🎨 STEP 2: DEPLOY FRONTEND TO VERCEL

### A. Prepare Frontend for Deployment

1. **Update environment variables template**
   - Already created `.env.example` ✅

2. **Test production build locally**
   ```powershell
   cd frontend
   npm run build
   npm run preview
   ```

### B. Deploy to Vercel

1. **Create Vercel Account**
   - Go to https://vercel.com
   - Sign up with GitHub

2. **Import Project**
   - Click "Add New" > "Project"
   - Import your GitHub repository: `AI-Sentinel`
   - Vercel will auto-detect it's a Vite app

3. **Configure Project**
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build` (auto-detected)
   - **Output Directory**: `dist` (auto-detected)
   - **Install Command**: `npm install` (auto-detected)

4. **Add Environment Variables**
   In the "Environment Variables" section, add:

   ```
   VITE_API_BASE_URL=https://ai-sentinel-backend.onrender.com/api
   VITE_GOOGLE_CLIENT_ID=<your-client-id>.apps.googleusercontent.com
   ```

   **IMPORTANT**: Use your actual Render backend URL from Step 1

5. **Deploy**
   - Click "Deploy"
   - Wait 2-3 minutes for deployment
   - Note your frontend URL: `https://your-app.vercel.app`

---

## 🔄 STEP 3: UPDATE CONFIGURATIONS

### A. Update Backend Environment Variables

1. **Go to Render Dashboard**
   - Select your backend service
   - Go to "Environment" tab
   - Update `FRONTEND_URL` to your Vercel URL:
     ```
     FRONTEND_URL=https://your-app.vercel.app
     ```
   - Click "Save Changes"
   - Service will auto-redeploy

### B. Update Google OAuth Redirect URIs

1. **Go to Google Cloud Console**
   - Navigate to "APIs & Services" > "Credentials"
   - Edit your OAuth 2.0 Client ID

2. **Add Production URLs**
   - Authorized JavaScript origins:
     - Add: `https://your-app.vercel.app`
   - Authorized redirect URIs:
     - Add: `https://ai-sentinel-backend.onrender.com/api/auth/google/callback`

3. **Save Changes**

---

## ✅ STEP 4: TEST PRODUCTION DEPLOYMENT

### Test Checklist:

1. **Health Check**
   - [ ] Visit: `https://ai-sentinel-backend.onrender.com/health`
   - [ ] Should return OK status

2. **Frontend Access**
   - [ ] Visit: `https://your-app.vercel.app`
   - [ ] All pages load correctly
   - [ ] No console errors

3. **User Registration**
   - [ ] Register new account with email/password
   - [ ] Verify login works
   - [ ] Check JWT token is stored

4. **Google OAuth**
   - [ ] Click "Sign in with Google"
   - [ ] Complete OAuth flow
   - [ ] Verify redirect back to dashboard

5. **Document Analysis**
   - [ ] Upload a PDF file
   - [ ] Verify upload progress
   - [ ] Check analysis results display
   - [ ] Verify history page shows analysis

6. **URL Analysis**
   - [ ] Submit a URL for analysis
   - [ ] Verify scraping works
   - [ ] Check results display

---

## 🔒 SECURITY CHECKLIST

- [ ] All environment variables are set correctly
- [ ] JWT_SECRET and SESSION_SECRET are strong and unique
- [ ] MongoDB Atlas has IP whitelist configured
- [ ] Google OAuth redirect URIs match production URLs
- [ ] HTTPS is enforced (automatic on Vercel/Render)
- [ ] CORS is configured to allow only production frontend
- [ ] Sensitive data is not in Git repository
- [ ] `.env` files are in `.gitignore`

---

## 📊 POST-DEPLOYMENT MONITORING

### A. Monitor Render Backend
- Check logs in Render dashboard for errors
- Monitor memory usage (free tier: 512MB)
- Check for cold starts (free tier sleeps after inactivity)

### B. Monitor Vercel Frontend
- Check deployment logs
- Monitor function execution (if any)
- Check analytics dashboard

### C. Monitor MongoDB Atlas
- Check connection count
- Monitor storage usage (free tier: 512MB)
- Review slow queries

### D. Monitor Gemini API Usage
- Check quota usage at https://makersuite.google.com
- Monitor daily analysis limits per user
- Track API errors

---

## 🐛 COMMON ISSUES & SOLUTIONS

### Issue 1: "Cannot connect to MongoDB"
**Solution**: 
- Verify MongoDB URI is correct
- Check IP whitelist in MongoDB Atlas
- Ensure username/password are URL-encoded

### Issue 2: "Google OAuth redirect mismatch"
**Solution**:
- Verify redirect URIs in Google Console match exactly
- Check `GOOGLE_CALLBACK_URL` environment variable
- Ensure no trailing slashes

### Issue 3: "CORS error on API requests"
**Solution**:
- Verify `FRONTEND_URL` in backend matches Vercel URL exactly
- Check CORS configuration in server.js
- Clear browser cache

### Issue 4: "Gemini API key invalid"
**Solution**:
- Verify API key is copied correctly (no spaces)
- Check API key is enabled in Google AI Studio
- Verify billing is set up (if required)

### Issue 5: "Backend service sleeping (Render free tier)"
**Solution**:
- Free tier sleeps after 15 minutes of inactivity
- First request after sleep takes 30-60 seconds to wake up
- Consider using UptimeRobot to ping health endpoint every 10 minutes
- Or upgrade to paid plan for always-on service

### Issue 6: "File upload fails"
**Solution**:
- Check file size is under 10MB
- Verify request body size limits in backend
- Check Render disk space limits

---

## 💰 COST BREAKDOWN

### Free Tier Limits:
- **Render**: 750 hours/month free, 512MB RAM, sleeps after inactivity
- **Vercel**: 100GB bandwidth/month, unlimited builds
- **MongoDB Atlas**: 512MB storage, shared cluster
- **Gemini API**: Free tier with quotas (check current limits)

### When to Upgrade:
- Render: When you need 24/7 uptime without cold starts
- MongoDB: When storage exceeds 512MB
- Gemini: When you exceed free quota or need higher rate limits

---

## 🎉 DEPLOYMENT COMPLETE!

Your AI-Sentinel application is now live at:
- **Frontend**: https://your-app.vercel.app
- **Backend**: https://ai-sentinel-backend.onrender.com

Share it with users and start analyzing documents! 🚀

---

## 📝 MAINTENANCE TIPS

1. **Regular Updates**
   - Keep dependencies updated: `npm audit fix`
   - Monitor security advisories
   - Update Node.js version as needed

2. **Backup Strategy**
   - MongoDB Atlas provides automated backups
   - Export important data regularly
   - Keep configuration documented

3. **Monitoring**
   - Set up uptime monitoring (UptimeRobot, Pingdom)
   - Configure error tracking (Sentry)
   - Monitor API quotas

4. **Performance Optimization**
   - Implement caching if needed
   - Optimize large PDF processing
   - Consider CDN for static assets

---

For support or issues, refer to:
- Render Docs: https://render.com/docs
- Vercel Docs: https://vercel.com/docs
- MongoDB Atlas Docs: https://docs.atlas.mongodb.com
