import { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Autocomplete,
  TextField,
  Alert,
  Chip,
  Divider,
} from '@mui/material';
import { Compare as CompareIcon } from '@mui/icons-material';
import { documentsAPI } from '../utils/api';

function ComparePage() {
  const [documents, setDocuments] = useState([]);
  const [doc1, setDoc1] = useState(null);
  const [doc2, setDoc2] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const response = await documentsAPI.getDocuments({ limit: 100 });
        setDocuments(response.data.documents);
      } catch (error) {
        console.error('Failed to fetch documents:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();
  }, []);

  const renderDocumentCard = (doc) => {
    if (!doc) return null;

    return (
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            {doc.title}
          </Typography>

          <Box sx={{ mb: 2 }}>
            <Chip label={doc.sourceType.toUpperCase()} size="small" sx={{ mr: 1 }} />
            <Chip
              label={`Risk: ${doc.analysis?.overallScore || 0}`}
              color={
                doc.analysis?.overallScore > 70
                  ? 'error'
                  : doc.analysis?.overallScore > 40
                  ? 'warning'
                  : 'success'
              }
              size="small"
            />
          </Box>

          <Divider sx={{ my: 2 }} />

          <Typography variant="subtitle2" gutterBottom>
            Summary
          </Typography>
          <Typography variant="body2" paragraph>
            {doc.analysis?.summary}
          </Typography>

          <Typography variant="subtitle2" gutterBottom>
            Red Flags
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
            {doc.analysis?.redFlags.dataSovereignty && (
              <Chip label="Data Sovereignty" size="small" color="error" />
            )}
            {doc.analysis?.redFlags.hiddenBilling && (
              <Chip label="Hidden Billing" size="small" color="error" />
            )}
            {doc.analysis?.redFlags.jurisdiction && (
              <Chip label="Jurisdiction" size="small" color="error" />
            )}
            {doc.analysis?.redFlags.liabilityShift && (
              <Chip label="Liability Shift" size="small" color="error" />
            )}
            {doc.analysis?.redFlags.unilateralChanges && (
              <Chip label="Unilateral Changes" size="small" color="error" />
            )}
          </Box>

          <Typography variant="subtitle2" gutterBottom>
            Risk Breakdown
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map((level) => {
              const count = doc.analysis?.risks?.filter((r) => r.riskLevel === level).length || 0;
              if (count === 0) return null;
              return (
                <Chip
                  key={level}
                  label={`${level}: ${count}`}
                  size="small"
                  variant="outlined"
                />
              );
            })}
          </Box>

          <Divider sx={{ my: 2 }} />

          <Typography variant="caption" color="text.secondary">
            Analyzed on {new Date(doc.createdAt).toLocaleDateString()}
          </Typography>
        </CardContent>
      </Card>
    );
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Compare Documents
      </Typography>

      <Typography variant="body1" color="text.secondary" gutterBottom sx={{ mb: 3 }}>
        Compare two versions of a document to see how terms have changed
      </Typography>

      {documents.length < 2 ? (
        <Alert severity="info">
          You need at least 2 analyzed documents to use the comparison feature.
        </Alert>
      ) : (
        <>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={5}>
                <Autocomplete
                  options={documents}
                  getOptionLabel={(option) => option.title}
                  value={doc1}
                  onChange={(e, newValue) => setDoc1(newValue)}
                  renderInput={(params) => (
                    <TextField {...params} label="Select First Document" />
                  )}
                />
              </Grid>

              <Grid item xs={12} md={2} sx={{ textAlign: 'center' }}>
                <CompareIcon fontSize="large" color="primary" />
              </Grid>

              <Grid item xs={12} md={5}>
                <Autocomplete
                  options={documents.filter((d) => d._id !== doc1?._id)}
                  getOptionLabel={(option) => option.title}
                  value={doc2}
                  onChange={(e, newValue) => setDoc2(newValue)}
                  renderInput={(params) => (
                    <TextField {...params} label="Select Second Document" />
                  )}
                />
              </Grid>
            </Grid>
          </Paper>

          {doc1 && doc2 && (
            <>
              {/* Score Comparison */}
              <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Risk Score Comparison
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={6}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h3" color="primary">
                        {doc1.analysis?.overallScore || 0}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Document 1
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h3" color="secondary">
                        {doc2.analysis?.overallScore || 0}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Document 2
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>

                {Math.abs(
                  (doc1.analysis?.overallScore || 0) - (doc2.analysis?.overallScore || 0)
                ) > 10 && (
                  <Alert severity="warning" sx={{ mt: 2 }}>
                    Significant difference in risk scores detected!{' '}
                    {doc1.analysis?.overallScore > doc2.analysis?.overallScore
                      ? 'Document 1 has higher risk.'
                      : 'Document 2 has higher risk.'}
                  </Alert>
                )}
              </Paper>

              {/* Side-by-Side Comparison */}
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>
                    Document 1
                  </Typography>
                  {renderDocumentCard(doc1)}
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>
                    Document 2
                  </Typography>
                  {renderDocumentCard(doc2)}
                </Grid>
              </Grid>
            </>
          )}

          {!doc1 && !doc2 && (
            <Alert severity="info">
              Select two documents above to start comparing them.
            </Alert>
          )}
        </>
      )}
    </Box>
  );
}

export default ComparePage;
