import { useState } from 'react';
import {
  Box,
  Paper,
  Tabs,
  Tab,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Chip,
} from '@mui/material';
import {
  TextFields as TextIcon,
  PictureAsPdf as PdfIcon,
  Language as UrlIcon,
  Send as SendIcon,
} from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';
import { useNavigate } from 'react-router-dom';
import { documentsAPI } from '../utils/api';

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`upload-tabpanel-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

function UploadPage() {
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState('');

  // Text input state
  const [textInput, setTextInput] = useState('');
  const [textTitle, setTextTitle] = useState('');

  // PDF upload state
  const [pdfFile, setPdfFile] = useState(null);
  const [pdfTitle, setPdfTitle] = useState('');

  // URL scraping state
  const [urlInput, setUrlInput] = useState('');
  const [urlTitle, setUrlTitle] = useState('');

  const handleAnalyzeText = async () => {
    if (!textInput || textInput.length < 100) {
      setError('Please enter at least 100 characters of text');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setProgress('Analyzing document with AI...');

      const response = await documentsAPI.analyzeText({
        text: textInput,
        title: textTitle || 'Pasted Text Document',
      });

      navigate(`/results/${response.data.documentId}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Analysis failed. Please try again.');
    } finally {
      setLoading(false);
      setProgress('');
    }
  };

  const handleAnalyzePDF = async () => {
    if (!pdfFile) {
      setError('Please upload a PDF file');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setProgress('Extracting text from PDF...');

      const formData = new FormData();
      formData.append('pdf', pdfFile);
      if (pdfTitle) {
        formData.append('title', pdfTitle);
      }

      const response = await documentsAPI.analyzePDF(formData);

      navigate(`/results/${response.data.documentId}`);
    } catch (err) {
      setError(err.response?.data?.error || 'PDF analysis failed. Please try again.');
    } finally {
      setLoading(false);
      setProgress('');
    }
  };

  const handleAnalyzeURL = async () => {
    if (!urlInput) {
      setError('Please enter a URL');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setProgress('Scraping URL...');

      const response = await documentsAPI.analyzeURL({
        url: urlInput,
        title: urlTitle,
      });

      navigate(`/results/${response.data.documentId}`);
    } catch (err) {
      setError(err.response?.data?.error || 'URL scraping failed. Please try again.');
    } finally {
      setLoading(false);
      setProgress('');
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'application/pdf': ['.pdf'],
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10MB
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        setPdfFile(acceptedFiles[0]);
        setError('');
      }
    },
    onDropRejected: (rejections) => {
      setError(
        rejections[0]?.errors[0]?.message || 'File rejected. Please upload a valid PDF under 10MB.'
      );
    },
  });

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Analyze Document
      </Typography>

      <Typography variant="body1" color="text.secondary" gutterBottom sx={{ mb: 3 }}>
        Upload a document or paste text to identify risks and red flags
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {progress && (
        <Box sx={{ mb: 3 }}>
          <div className="scanning-container" style={{ height: '80px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="scanning-beam"></div>
            <Typography 
              variant="body1" 
              sx={{ 
                position: 'relative', 
                zIndex: 10,
                fontFamily: 'JetBrains Mono, monospace',
                color: '#0f172a',
                fontWeight: 600
              }}
            >
              {progress}
            </Typography>
          </div>
        </Box>
      )}

      <Paper sx={{ width: '100%' }}>
        <Tabs
          value={tabValue}
          onChange={(e, newValue) => setTabValue(newValue)}
          centered
        >
          <Tab icon={<TextIcon />} label="Paste Text" />
          <Tab icon={<PdfIcon />} label="Upload PDF" />
          <Tab icon={<UrlIcon />} label="Scrape URL" />
        </Tabs>

        {/* Text Input Panel */}
        <TabPanel value={tabValue} index={0}>
          <Box sx={{ p: 3 }}>
            <TextField
              fullWidth
              label="Document Title (Optional)"
              value={textTitle}
              onChange={(e) => setTextTitle(e.target.value)}
              sx={{ mb: 2 }}
            />

            <TextField
              fullWidth
              multiline
              rows={15}
              label="Paste your legal document here"
              placeholder="Paste terms of service, privacy policy, or legal contract..."
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              helperText={`${textInput.length} characters (minimum 100 required)`}
            />

            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="caption" color="text.secondary">
                Your text will be analyzed using AI to identify potential risks
              </Typography>
              <Button
                variant="contained"
                size="large"
                endIcon={<SendIcon />}
                onClick={handleAnalyzeText}
                disabled={loading || textInput.length < 100}
              >
                Analyze Text
              </Button>
            </Box>
          </Box>
        </TabPanel>

        {/* PDF Upload Panel */}
        <TabPanel value={tabValue} index={1}>
          <Box sx={{ p: 3 }}>
            <TextField
              fullWidth
              label="Document Title (Optional)"
              value={pdfTitle}
              onChange={(e) => setPdfTitle(e.target.value)}
              sx={{ mb: 3 }}
            />

            <Box
              {...getRootProps()}
              sx={{
                border: '2px dashed',
                borderColor: isDragActive ? 'primary.main' : 'grey.400',
                borderRadius: 2,
                p: 4,
                textAlign: 'center',
                cursor: 'pointer',
                bgcolor: isDragActive ? 'action.hover' : 'background.paper',
                transition: 'all 0.2s',
                '&:hover': {
                  bgcolor: 'action.hover',
                  borderColor: 'primary.main',
                },
              }}
            >
              <input {...getInputProps()} />
              <PdfIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
              {pdfFile ? (
                <Box>
                  <Chip
                    label={pdfFile.name}
                    onDelete={() => setPdfFile(null)}
                    color="primary"
                    sx={{ mb: 2 }}
                  />
                  <Typography variant="body2" color="text.secondary">
                    {(pdfFile.size / 1024 / 1024).toFixed(2)} MB
                  </Typography>
                </Box>
              ) : (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    {isDragActive
                      ? 'Drop your PDF here'
                      : 'Drag & drop a PDF here, or click to select'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Maximum file size: 10MB
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                    OCR supported for scanned documents
                  </Typography>
                </Box>
              )}
            </Box>

            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="contained"
                size="large"
                endIcon={<SendIcon />}
                onClick={handleAnalyzePDF}
                disabled={loading || !pdfFile}
              >
                Analyze PDF
              </Button>
            </Box>
          </Box>
        </TabPanel>

        {/* URL Scraping Panel */}
        <TabPanel value={tabValue} index={2}>
          <Box sx={{ p: 3 }}>
            <Alert severity="warning" sx={{ mb: 3 }}>
              Please ensure you have permission to scrape the website. Some sites may prohibit automated access.
            </Alert>

            <TextField
              fullWidth
              label="Document Title (Optional)"
              value={urlTitle}
              onChange={(e) => setUrlTitle(e.target.value)}
              sx={{ mb: 2 }}
            />

            <TextField
              fullWidth
              label="Website URL"
              placeholder="https://example.com/terms-of-service"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              helperText="Enter the full URL of the terms of service, privacy policy, or legal document"
            />

            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="caption" color="text.secondary">
                We'll extract text from the URL and analyze it for risks
              </Typography>
              <Button
                variant="contained"
                size="large"
                endIcon={<SendIcon />}
                onClick={handleAnalyzeURL}
                disabled={loading || !urlInput}
              >
                Scrape & Analyze
              </Button>
            </Box>
          </Box>
        </TabPanel>
      </Paper>

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      )}
    </Box>
  );
}

export default UploadPage;
