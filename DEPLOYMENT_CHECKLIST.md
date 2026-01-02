# AI-Sentinel Deployment Quick Reference

## 🎯 QUICK START DEPLOYMENT STEPS

### 1. Prerequisites (Get These Ready First)
- [ ] MongoDB Atlas connection string
- [ ] Google OAuth Client ID & Secret
- [ ] Gemini API key
- [ ] Two secure random secrets (for JWT & Session)

### 2. Deploy Backend to Render (15 minutes)
1. Go to render.com → New Web Service
2. Connect GitHub repo → Select `AI-Sentinel`
3. Configure:
   - Root Directory: `backend`
   - Build: `npm install`
   - Start: `npm start`
4. Add 14 environment variables (see .env.example)
5. Deploy and copy backend URL

### 3. Deploy Frontend to Vercel (10 minutes)
1. Go to vercel.com → New Project
2. Import `AI-Sentinel` from GitHub
3. Configure:
   - Root Directory: `frontend`
   - Framework: Vite
4. Add 2 environment variables:
   - `VITE_API_BASE_URL`: Your Render backend URL + /api
   - `VITE_GOOGLE_CLIENT_ID`: Your Google Client ID
5. Deploy and copy frontend URL

### 4. Update Configurations (5 minutes)
1. Render: Update `FRONTEND_URL` to your Vercel URL
2. Google Console: Add production URLs to OAuth settings
3. Test everything works!

---

## 📝 ENVIRONMENT VARIABLES CHECKLIST

### Backend (14 variables)
```
✅ NODE_ENV=production
✅ PORT=10000
✅ MONGODB_URI=<from-atlas>
✅ JWT_SECRET=<generate-secure>
✅ SESSION_SECRET=<generate-secure>
✅ GOOGLE_CLIENT_ID=<from-google-console>
✅ GOOGLE_CLIENT_SECRET=<from-google-console>
✅ GOOGLE_CALLBACK_URL=<your-render-url>/api/auth/google/callback
✅ GEMINI_API_KEY=<from-google-ai-studio>
✅ FRONTEND_URL=<your-vercel-url>
✅ MAX_FILE_SIZE=10485760
✅ MAX_TEXT_LENGTH=500000
✅ RATE_LIMIT_WINDOW_MS=60000
✅ RATE_LIMIT_MAX_REQUESTS=10
✅ DAILY_ANALYSIS_LIMIT=50
```

### Frontend (2 variables)
```
✅ VITE_API_BASE_URL=<your-render-url>/api
✅ VITE_GOOGLE_CLIENT_ID=<from-google-console>
```

---

## 🔗 IMPORTANT LINKS

- **MongoDB Atlas**: https://cloud.mongodb.com
- **Google Cloud Console**: https://console.cloud.google.com/apis/credentials
- **Gemini API Key**: https://makersuite.google.com/app/apikey
- **Render Dashboard**: https://dashboard.render.com
- **Vercel Dashboard**: https://vercel.com/dashboard
- **Generate Secrets**: Run `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

---

## ✅ POST-DEPLOYMENT TESTS

1. Backend health: `https://your-backend.onrender.com/health`
2. Frontend loads: `https://your-app.vercel.app`
3. Register new user (email/password)
4. Login with Google OAuth
5. Upload PDF and analyze
6. Check history page

---

## 🐛 COMMON ISSUES

| Issue | Solution |
|-------|----------|
| MongoDB connection fails | Check IP whitelist (0.0.0.0/0) and URI encoding |
| OAuth redirect mismatch | Verify exact URLs in Google Console |
| CORS errors | Update FRONTEND_URL in backend |
| Backend sleeping | Normal on free tier, first request takes 30-60s |
| API key invalid | Check no spaces, verify billing enabled |

---

## 💡 PRO TIPS

- **Cold Starts**: Render free tier sleeps after 15 min → First request slow
- **Secrets**: Generate with crypto.randomBytes(32).toString('hex')
- **MongoDB**: URL-encode password if it has special characters
- **OAuth**: Test with incognito window to verify full flow
- **Logs**: Check Render & Vercel dashboards for detailed errors

---

See DEPLOYMENT_GUIDE.md for detailed step-by-step instructions!
