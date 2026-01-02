# AI-Sentinel Setup Guide

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **npm** (comes with Node.js)
- **MongoDB Atlas Account** (free M0 cluster)
- **Google Cloud Console Project** (for OAuth)
- **Gemini API Key** (from Google AI Studio)

---

## Step 1: MongoDB Atlas Setup

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and create a free account
2. Create a new **M0 (Free) cluster**
3. Configure **Network Access**:
   - Click "Network Access" in the left sidebar
   - Click "Add IP Address"
   - Select "Allow Access from Anywhere" (0.0.0.0/0) for development
4. Create **Database User**:
   - Click "Database Access" in the left sidebar
   - Click "Add New Database User"
   - Create username and password (save these!)
   - Grant "Read and write to any database" role
5. Get **Connection String**:
   - Click "Database" and then "Connect"
   - Choose "Connect your application"
   - Copy the connection string (looks like: `mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/...`)
   - Replace `<username>` and `<password>` with your credentials

---

## Step 2: Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable **Google+ API**:
   - Go to "APIs & Services" > "Library"
   - Search for "Google+ API" and enable it
4. Create **OAuth Credentials**:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth client ID"
   - Choose "Web application"
   - Add authorized redirect URIs:
     - `http://localhost:5000/api/auth/google/callback` (for development)
     - Add your production URL later
   - Save the **Client ID** and **Client Secret**

---

## Step 3: Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Click "Create API Key"
3. Copy the API key (keep it secure!)

---

## Step 4: Backend Setup

1. Navigate to the backend directory:
   ```powershell
   cd backend
   ```

2. Install dependencies:
   ```powershell
   npm install
   ```

3. Create `.env` file:
   ```powershell
   Copy-Item .env.example .env
   ```

4. Edit `.env` file with your credentials:
   ```env
   PORT=5000
   NODE_ENV=development

   # MongoDB Atlas
   MONGODB_URI=mongodb+srv://your_username:your_password@cluster0.xxxxx.mongodb.net/ai-sentinel?retryWrites=true&w=majority

   # JWT Secret (generate a random string)
   JWT_SECRET=your_super_secret_jwt_key_here_use_random_string
   SESSION_SECRET=your_super_secret_session_key_here_use_random_string

   # Google OAuth
   GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback

   # Gemini API
   GEMINI_API_KEY=your_gemini_api_key_here

   # Frontend URL
   FRONTEND_URL=http://localhost:3000

   # Limits
   MAX_FILE_SIZE=10485760
   MAX_TEXT_LENGTH=500000
   RATE_LIMIT_WINDOW_MS=60000
   RATE_LIMIT_MAX_REQUESTS=10
   DAILY_ANALYSIS_LIMIT=50
   ```

5. Start the backend server:
   ```powershell
   npm run dev
   ```

   You should see:
   ```
   ✅ MongoDB Connected: cluster0.xxxxx.mongodb.net
   🚀 AI-Sentinel Backend running on port 5000
   ```

---

## Step 5: Frontend Setup

1. Open a **new PowerShell window** and navigate to the frontend directory:
   ```powershell
   cd frontend
   ```

2. Install dependencies:
   ```powershell
   npm install
   ```

3. Create `.env` file:
   ```powershell
   Copy-Item .env.example .env
   ```

4. Edit `.env` file:
   ```env
   VITE_API_BASE_URL=http://localhost:5000/api
   VITE_GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
   ```

5. Start the frontend development server:
   ```powershell
   npm run dev
   ```

   You should see:
   ```
   VITE v5.x.x  ready in xxx ms

   ➜  Local:   http://localhost:3000/
   ```

---

## Step 6: Test the Application

1. Open your browser and go to `http://localhost:3000`
2. You should see the AI-Sentinel login page
3. Create a new account or sign in with Google
4. Try analyzing a sample document:
   - Click "Analyze" in the navigation
   - Paste some terms of service text
   - Click "Analyze Text"
   - Wait for the AI analysis to complete

---

## Common Issues & Solutions

### MongoDB Connection Issues
- **Error: "MongoServerError: bad auth"**
  - Double-check your username and password in the connection string
  - Make sure to URL-encode special characters in password

- **Error: "MongooseServerSelectionError"**
  - Check that your IP is whitelisted in MongoDB Atlas Network Access
  - Try allowing access from anywhere (0.0.0.0/0)

### Google OAuth Issues
- **Error: "redirect_uri_mismatch"**
  - Verify the callback URL in Google Cloud Console matches exactly
  - Should be: `http://localhost:5000/api/auth/google/callback`

### Gemini API Issues
- **Error: "API key not valid"**
  - Double-check you copied the complete API key
  - Make sure there are no extra spaces

### PDF Upload Issues
- **OCR not working**
  - Tesseract.js downloads language data on first use (can take time)
  - Check browser console for errors

### Port Already in Use
- **Error: "EADDRINUSE"**
  - Change the PORT in backend `.env` file
  - Kill the process using the port

---

## Production Deployment Notes

### Backend Deployment (Render/Railway)
1. Set all environment variables in the platform dashboard
2. For Puppeteer, you may need to add a buildpack or use `puppeteer-core`
3. Update `GOOGLE_CALLBACK_URL` to your production URL
4. Update `FRONTEND_URL` to your production frontend URL

### Frontend Deployment (Vercel/Netlify)
1. Set `VITE_API_BASE_URL` to your production backend URL
2. Set `VITE_GOOGLE_CLIENT_ID` to your Google OAuth Client ID
3. Add production OAuth redirect URL in Google Cloud Console

---

## Development Tips

- Backend runs on: `http://localhost:5000`
- Frontend runs on: `http://localhost:3000`
- Backend auto-reloads with nodemon
- Frontend auto-reloads with Vite HMR
- Check backend logs in the terminal for API requests
- Check browser console for frontend errors

---

## Useful Commands

### Backend
```powershell
npm run dev      # Start development server with auto-reload
npm start        # Start production server
npm test         # Run tests (if configured)
```

### Frontend
```powershell
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
```

---

## Support

If you encounter issues:
1. Check the console logs (both backend terminal and browser console)
2. Verify all environment variables are set correctly
3. Ensure MongoDB Atlas is accessible
4. Check that all API keys are valid

---

**You're all set! Start analyzing legal documents! 🚀**
