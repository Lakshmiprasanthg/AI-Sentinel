const express = require('express');
const router = express.Router();
const multer = require('multer');
const { body, validationResult } = require('express-validator');
const authMiddleware = require('../middleware/authMiddleware');
const { analysisLimiter } = require('../middleware/rateLimiter');
const Document = require('../models/Document');
const { analyzeDocument } = require('../services/geminiAnalyzer');
const { extractTextFromPDF } = require('../services/pdfProcessor');
const { scrapeURL } = require('../services/scraper');

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024, // 10MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  },
});

// Apply auth middleware to all routes
router.use(authMiddleware);

// @route   POST /api/documents/analyze/text
// @desc    Analyze pasted text
// @access  Private
router.post(
  '/analyze/text',
  analysisLimiter,
  [
    body('text').trim().isLength({ min: 100 }).withMessage('Text must be at least 100 characters'),
    body('title').optional().trim(),
  ],
  async (req, res) => {
    try {
      // Validate input
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      // Check daily limit
      if (!req.user.checkDailyLimit()) {
        return res.status(429).json({
          error: 'Daily analysis limit reached',
          limit: process.env.DAILY_ANALYSIS_LIMIT,
        });
      }

      const { text, title } = req.body;
      const documentTitle = title || 'Pasted Text Document';

      console.log(`📝 Analyzing text document for user ${req.user._id}`);

      // Analyze with Gemini
      const analysis = await analyzeDocument(text, documentTitle);

      // Check if analysis failed
      if (analysis.error) {
        return res.status(500).json({
          error: 'Analysis failed',
          message: analysis.message,
        });
      }

      // Save document
      const document = await Document.create({
        userId: req.user._id,
        title: documentTitle,
        sourceType: 'text',
        originalText: text,
        analysis,
        metadata: {
          wordCount: text.split(/\s+/).length,
        },
      });

      // Increment user's analysis count
      await req.user.incrementAnalysisCount();

      res.status(201).json({
        documentId: document._id,
        analysis: document.analysis,
        title: document.title,
        createdAt: document.createdAt,
      });
    } catch (error) {
      console.error('Text analysis error:', error);
      res.status(500).json({ error: 'Failed to analyze text document' });
    }
  }
);

// @route   POST /api/documents/analyze/pdf
// @desc    Analyze uploaded PDF
// @access  Private
router.post(
  '/analyze/pdf',
  analysisLimiter,
  upload.single('pdf'),
  [body('title').optional().trim()],
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No PDF file uploaded' });
      }

      // Check daily limit
      if (!req.user.checkDailyLimit()) {
        return res.status(429).json({
          error: 'Daily analysis limit reached',
          limit: process.env.DAILY_ANALYSIS_LIMIT,
        });
      }

      const { title } = req.body;
      const documentTitle = title || req.file.originalname || 'Uploaded PDF Document';

      console.log(`📄 Processing PDF for user ${req.user._id}`);

      // Extract text from PDF
      const { text, pageCount, method } = await extractTextFromPDF(req.file.buffer);

      if (!text || text.trim().length < 100) {
        return res.status(400).json({
          error: 'Could not extract sufficient text from PDF',
          suggestion: 'Please try pasting the text directly or uploading a different file',
        });
      }

      console.log(`✅ Text extracted (${method}): ${text.length} characters`);

      // Analyze with Gemini
      const analysis = await analyzeDocument(text, documentTitle);

      // Check if analysis failed
      if (analysis.error) {
        return res.status(500).json({
          error: 'Analysis failed',
          message: analysis.message,
        });
      }

      // Save document
      const document = await Document.create({
        userId: req.user._id,
        title: documentTitle,
        sourceType: 'pdf',
        originalText: text,
        analysis,
        metadata: {
          fileSize: req.file.size,
          pageCount,
          mimeType: req.file.mimetype,
          extractionMethod: method,
        },
      });

      // Increment user's analysis count
      await req.user.incrementAnalysisCount();

      res.status(201).json({
        documentId: document._id,
        analysis: document.analysis,
        title: document.title,
        createdAt: document.createdAt,
        metadata: {
          pageCount,
          extractionMethod: method,
        },
      });
    } catch (error) {
      console.error('PDF analysis error:', error);
      res.status(500).json({
        error: 'Failed to analyze PDF',
        message: error.message,
      });
    }
  }
);

// @route   POST /api/documents/analyze/url
// @desc    Analyze URL
// @access  Private
router.post(
  '/analyze/url',
  analysisLimiter,
  [
    body('url').isURL().withMessage('Invalid URL'),
    body('title').optional().trim(),
  ],
  async (req, res) => {
    try {
      // Validate input
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      // Check daily limit
      if (!req.user.checkDailyLimit()) {
        return res.status(429).json({
          error: 'Daily analysis limit reached',
          limit: process.env.DAILY_ANALYSIS_LIMIT,
        });
      }

      const { url, title } = req.body;

      console.log(`🌐 Scraping URL for user ${req.user._id}: ${url}`);

      // Scrape URL
      const { text, method } = await scrapeURL(url);

      if (!text || text.trim().length < 100) {
        return res.status(400).json({
          error: 'Could not extract sufficient text from URL',
          suggestion: 'The page may be protected or contain minimal content',
        });
      }

      const documentTitle = title || new URL(url).hostname || 'Scraped Document';

      console.log(`✅ URL scraped (${method}): ${text.length} characters`);

      // Analyze with Gemini
      const analysis = await analyzeDocument(text, documentTitle);

      // Check if analysis failed
      if (analysis.error) {
        return res.status(500).json({
          error: 'Analysis failed',
          message: analysis.message,
        });
      }

      // Save document
      const document = await Document.create({
        userId: req.user._id,
        title: documentTitle,
        sourceType: 'url',
        originalText: text,
        analysis,
        metadata: {
          url,
          scrapingMethod: method,
        },
      });

      // Increment user's analysis count
      await req.user.incrementAnalysisCount();

      res.status(201).json({
        documentId: document._id,
        analysis: document.analysis,
        title: document.title,
        createdAt: document.createdAt,
        metadata: {
          url,
          scrapingMethod: method,
        },
      });
    } catch (error) {
      console.error('URL analysis error:', error);
      res.status(500).json({
        error: 'Failed to analyze URL',
        message: error.message,
      });
    }
  }
);

// @route   GET /api/documents
// @desc    Get user's document history
// @access  Private
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, search, sortBy = 'createdAt', order = 'desc' } = req.query;

    const query = { userId: req.user._id };

    // Add search filter
    if (search) {
      query.$text = { $search: search };
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = order === 'asc' ? 1 : -1;

    // Execute query with pagination
    const documents = await Document.find(query)
      .select('-originalText') // Exclude large text field
      .sort(sort)
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Document.countDocuments(query);

    res.json({
      documents,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('Get documents error:', error);
    res.status(500).json({ error: 'Failed to fetch documents' });
  }
});

// @route   GET /api/documents/:id
// @desc    Get single document with full details
// @access  Private
router.get('/:id', async (req, res) => {
  try {
    const document = await Document.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    res.json(document);
  } catch (error) {
    console.error('Get document error:', error);
    res.status(500).json({ error: 'Failed to fetch document' });
  }
});

// @route   DELETE /api/documents/:id
// @desc    Delete document
// @access  Private
router.delete('/:id', async (req, res) => {
  try {
    const document = await Document.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    res.json({ message: 'Document deleted successfully' });
  } catch (error) {
    console.error('Delete document error:', error);
    res.status(500).json({ error: 'Failed to delete document' });
  }
});

module.exports = router;
