# AI-Sentinel 🛡️

An Intelligent Real-time Auditor for Terms, Conditions, and Legal Contracts.

![AI-Sentinel](https://img.shields.io/badge/AI-Sentinel-blue)
![Node.js](https://img.shields.io/badge/Node.js-18+-green)
![React](https://img.shields.io/badge/React-18-blue)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green)
![Gemini](https://img.shields.io/badge/Gemini-1.5%20Flash-orange)

---

## 🎯 Overview

AI-Sentinel empowers users to analyze legal documents, terms of service, and privacy policies to identify hidden risks, unfair clauses, and privacy-invasive terms. Using advanced AI analysis powered by Google's Gemini 1.5 Flash, the platform provides:

- 🚩 **Red Flag Detection**: Identifies 5 critical categories of risks
- 📊 **Risk Scoring**: Rates documents on a 0-100 scale
- 📄 **Multi-Format Support**: Text, PDF (with OCR), and URL scraping
- 🔒 **Secure Authentication**: Google OAuth + traditional login
- 📚 **Document History**: Save and compare previous analyses

---

## 🌟 Key Features

### 1. Multi-Modal Input
- ✍️ **Direct Text Paste**: Copy and paste any legal text
- 📄 **PDF Upload**: Upload documents with automatic OCR for scanned PDFs
- 🌐 **URL Scraping**: Extract terms directly from websites (respects robots.txt)

### 2. AI-Powered Analysis
Detects **5 Critical Red Flags**:
1. **Data Sovereignty** - Does the company own your content forever?
2. **Hidden Billing** - Automatic renewals, hidden fees, zombie subscriptions
3. **Jurisdiction** - Unfavorable legal jurisdiction requirements
4. **Liability Shift** - Company takes zero responsibility for mistakes
5. **Unilateral Changes** - Can change terms without notice

### 3. Comprehensive Risk Assessment
- Risk categorization: Privacy, Financial, Rights, Termination, Jurisdiction, Liability
- Severity levels: LOW, MEDIUM, HIGH, CRITICAL
- Overall risk score (0-100)
- Plain-language explanations for each clause

### 4. Interactive Dashboard
- **Summary View**: Quick overview of findings
- **Highlight View**: Original text with color-coded risk overlays
- **Document History**: Access all previous analyses
- **Comparison Tool**: Compare two document versions side-by-side

### 5. Security & Rate Limiting
- JWT-based authentication
- 50 free analyses per day per user
- Encrypted storage
- Rate limiting to prevent abuse

---

## 🛠️ Tech Stack

### Backend
| Technology | Purpose |
|------------|---------|
| **Node.js + Express** | Server framework |
| **MongoDB Atlas** | Cloud database (M0 Free Tier) |
| **Passport.js** | Authentication (OAuth + Local) |
| **Gemini 1.5 Flash** | AI document analysis |
| **pdf-parse + Tesseract.js** | PDF text extraction with OCR |
| **Puppeteer + Cheerio** | URL scraping (static + dynamic) |
| **JWT** | Token-based authentication |
| **Helmet + Express Rate Limit** | Security |

### Frontend
| Technology | Purpose |
|------------|---------|
| **React 18** | UI framework |
| **Material-UI (MUI)** | Component library |
| **Zustand** | State management |
| **React Router v6** | Navigation |
| **React Dropzone** | File uploads |
| **React PDF** | PDF viewing |
| **React Highlight Words** | Text highlighting |
| **Axios** | API requests |
| **Vite** | Build tool |

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18+ ([Download](https://nodejs.org/))
- **MongoDB Atlas** account ([Sign up](https://www.mongodb.com/cloud/atlas))
- **Google OAuth** credentials ([Google Cloud Console](https://console.cloud.google.com/))
- **Gemini API** key ([Get key](https://makersuite.google.com/app/apikey))

### Installation

#### Option 1: Automated Installation (Windows)
```powershell
# Clone the repository
git clone <your-repo-url>
cd AI-Sentinel

# Run the installation script
.\install.ps1
```

#### Option 2: Manual Installation
```powershell
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### Configuration

1. **Set up MongoDB Atlas** (see [SETUP.md](SETUP.md))
   - Create M0 free cluster
   - Configure network access
   - Get connection string

2. **Set up Google OAuth** (see [SETUP.md](SETUP.md))
   - Create OAuth client ID
   - Add authorized redirect URI: `http://localhost:5000/api/auth/google/callback`

3. **Get Gemini API Key** (see [SETUP.md](SETUP.md))
   - Visit Google AI Studio
   - Generate API key

4. **Configure Backend**
   ```powershell
   cd backend
   Copy-Item .env.example .env
   # Edit .env with your credentials
   ```

5. **Configure Frontend**
   ```powershell
   cd frontend
   Copy-Item .env.example .env
   # Edit .env with your API URL and Google Client ID
   ```

### Running the Application

#### Option 1: Using Scripts (Windows)
```powershell
# Terminal 1: Start backend
.\start-backend.ps1

# Terminal 2: Start frontend
.\start-frontend.ps1
```

#### Option 2: Manual Start
```powershell
# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: Frontend
cd frontend
npm run dev
```

### Access the Application
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:5000
- **API Health Check**: http://localhost:5000/health

---

## 📖 Detailed Setup Guide

For step-by-step configuration instructions, see **[SETUP.md](SETUP.md)**

---

## 🎨 Project Structure

```
AI-Sentinel/
├── backend/
│   ├── config/           # Database & passport configuration
│   ├── middleware/       # Auth & rate limiting middleware
│   ├── models/           # Mongoose schemas
│   ├── routes/           # API endpoints
│   ├── services/         # Business logic (AI, PDF, scraping)
│   ├── server.js         # Express server
│   ├── package.json
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── components/   # Reusable React components
│   │   ├── pages/        # Page components
│   │   ├── store/        # Zustand state management
│   │   ├── utils/        # API & helper functions
│   │   ├── App.jsx       # Main app component
│   │   └── main.jsx      # Entry point
│   ├── package.json
│   ├── vite.config.js
│   └── .env.example
│
├── README.md             # This file
├── SETUP.md              # Detailed setup instructions
├── install.ps1           # Automated installation script
├── start-backend.ps1     # Backend startup script
└── start-frontend.ps1    # Frontend startup script
```

---

## 🔑 Key API Endpoints

### Authentication
- `POST /api/auth/register` - Create new account
- `POST /api/auth/login` - Login with email/password
- `GET /api/auth/google` - Google OAuth login
- `GET /api/auth/me` - Get current user

### Documents
- `POST /api/documents/analyze/text` - Analyze pasted text
- `POST /api/documents/analyze/pdf` - Analyze uploaded PDF
- `POST /api/documents/analyze/url` - Analyze URL
- `GET /api/documents` - Get document history
- `GET /api/documents/:id` - Get specific document
- `DELETE /api/documents/:id` - Delete document

---

## 🧪 Usage Example

### 1. Register/Login
- Create account with email/password or sign in with Google

### 2. Analyze a Document
- **Text**: Paste terms of service text → Click "Analyze Text"
- **PDF**: Drag & drop PDF → Click "Analyze PDF"
- **URL**: Enter website URL → Click "Scrape & Analyze"

### 3. Review Results
- **Summary**: See overall risk score and key findings
- **Risks**: Detailed breakdown of each risky clause
- **Highlight**: View original text with color-coded highlights

### 4. Compare Documents
- Select two documents from history
- View side-by-side comparison of risk scores

---

## 🔒 Security Features

- ✅ Password hashing with bcrypt
- ✅ JWT authentication tokens
- ✅ Rate limiting (10 req/min per IP)
- ✅ Daily analysis limit (50/day per user)
- ✅ Input validation & sanitization
- ✅ Helmet security headers
- ✅ CORS protection
- ✅ MongoDB Atlas encryption at rest

---

## 🌐 Deployment

### Backend (Render/Railway)
1. Create new web service
2. Connect GitHub repository
3. Set environment variables
4. Deploy with Puppeteer support

### Frontend (Vercel/Netlify)
1. Connect GitHub repository
2. Set build command: `npm run build`
3. Set output directory: `dist`
4. Add environment variables

See [SETUP.md](SETUP.md) for detailed deployment instructions.

---

## 🐛 Troubleshooting

### Common Issues

**MongoDB Connection Failed**
- Check connection string format
- Verify IP whitelist in Atlas
- Ensure correct username/password

**Google OAuth Error**
- Verify redirect URI matches exactly
- Check client ID and secret
- Ensure Google+ API is enabled

**PDF Upload Not Working**
- Check file size (max 10MB)
- Verify file is valid PDF
- OCR may take 5-10s for scanned PDFs

**Port Already in Use**
- Change PORT in `.env` file
- Kill existing process using the port

For more solutions, see [SETUP.md](SETUP.md)

---

## 📊 Performance

- **Analysis Time**: 5-15 seconds per document
- **Supported Document Size**: Up to 500,000 characters
- **PDF Size Limit**: 10MB
- **Concurrent Users**: Scales with MongoDB Atlas
- **Daily Limit**: 50 analyses per user (free tier)

---

## 🤝 Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a pull request

---

## 📝 License

MIT License - feel free to use this project for personal or commercial purposes.

---

## 🙏 Acknowledgments

- **Google Gemini AI** for powerful document analysis
- **MongoDB Atlas** for free cloud database
- **Material-UI** for beautiful React components
- **Tesseract.js** for OCR capabilities

---

## 📧 Support

Need help? Check these resources:
1. [SETUP.md](SETUP.md) - Detailed setup guide
2. GitHub Issues - Report bugs
3. Documentation - API references

---

**Built with ❤️ for protecting user rights in the digital age**

🚀 **Start analyzing legal documents now!**
