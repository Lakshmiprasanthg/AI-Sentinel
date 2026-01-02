import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  CircularProgress,
  Tabs,
  Tab,
  Chip,
  Alert,
  Button,
  Card,
  CardContent,
  Grid,
  LinearProgress,
  Collapse,
} from '@mui/material';
import {
  Warning as WarningIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  ArrowBack as ArrowBackIcon,
  Shield as ShieldIcon,
  AttachMoney as MoneyIcon,
  Gavel as GavelIcon,
  ExpandMore as ExpandMoreIcon,
} from '@mui/icons-material';
import Highlighter from 'react-highlight-words';
import { documentsAPI } from '../utils/api';

function TabPanel({ children, value, index }) {
  return (
    <div role="tabpanel" hidden={value !== index}>
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

function ResultsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [expandedRisks, setExpandedRisks] = useState({});

  const toggleRiskExpansion = (index) => {
    setExpandedRisks(prev => ({ ...prev, [index]: !prev[index] }));
  };

  useEffect(() => {
    const fetchDocument = async () => {
      try {
        const response = await documentsAPI.getDocument(id);
        setDocument(response.data);
      } catch (error) {
        console.error('Failed to fetch document:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDocument();
  }, [id]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <div className="scanning-container" style={{ width: '300px', height: '150px' }}>
          <div className="scanning-beam"></div>
          <Typography 
            variant="body1" 
            sx={{ 
              position: 'absolute', 
              top: '50%', 
              left: '50%', 
              transform: 'translate(-50%, -50%)',
              fontFamily: 'JetBrains Mono, monospace',
              zIndex: 10
            }}
          >
            Loading Analysis...
          </Typography>
        </div>
      </Box>
    );
  }

  if (!document) {
    return (
      <Alert severity="error">
        Document not found
      </Alert>
    );
  }

  const { analysis } = document;
  
  const getRiskBadgeClass = (score) => {
    if (score > 70) return 'risk-badge-high';
    if (score > 40) return 'risk-badge-medium';
    return 'risk-badge-low';
  };

  const getRiskTextColor = (score) => {
    if (score > 70) return '#991b1b';
    if (score > 40) return '#92400e';
    return '#166534';
  };

  const getRiskLevelColor = (level) => {
    switch (level) {
      case 'CRITICAL':
      case 'HIGH':
        return '#991b1b';
      case 'MEDIUM':
        return '#92400e';
      case 'LOW':
        return '#166534';
      default:
        return '#64748b';
    }
  };

  const getRiskIcon = (level) => {
    switch (level) {
      case 'CRITICAL':
      case 'HIGH':
        return <ErrorIcon sx={{ color: '#991b1b' }} />;
      case 'MEDIUM':
        return <WarningIcon sx={{ color: '#92400e' }} />;
      case 'LOW':
        return <CheckIcon sx={{ color: '#166534' }} />;
      default:
        return null;
    }
  };

  const getCategoryIcon = (category) => {
    switch (category?.toLowerCase()) {
      case 'privacy':
        return <ShieldIcon className="icon-privacy" />;
      case 'financial':
        return <MoneyIcon className="icon-financial" />;
      case 'rights':
      case 'jurisdiction':
      case 'liability':
        return <GavelIcon className="icon-legal" />;
      default:
        return <ShieldIcon />;
    }
  };

  // Get all clause texts for highlighting
  const clauseTexts = analysis.risks.map((risk) => risk.clauseText);

  return (
    <Box>
      {/* Sticky Summary Bar */}
      <Box className="sticky-summary">
        <Grid container alignItems="center" spacing={2}>
          <Grid item>
            <Button
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate('/history')}
              sx={{ fontWeight: 600 }}
            >
              Back
            </Button>
          </Grid>
          <Grid item xs>
            <Typography variant="h6" sx={{ color: '#0f172a', fontWeight: 700 }}>
              {document.title}
            </Typography>
          </Grid>
          <Grid item>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography className="audit-number" sx={{ color: getRiskTextColor(analysis.overallScore), fontSize: '2rem' }}>
                {analysis.overallScore}
              </Typography>
              <span className={getRiskBadgeClass(analysis.overallScore)}>
                OVERALL RISK
              </span>
            </Box>
          </Grid>
        </Grid>
      </Box>

      {/* Document Metadata */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, mt: 2 }}>
        <Chip 
          label={document.sourceType.toUpperCase()} 
          sx={{ 
            fontFamily: 'JetBrains Mono, monospace',
            fontWeight: 600,
            backgroundColor: '#f1f5f9',
            color: '#0f172a'
          }} 
        />
        <Chip 
          label={new Date(document.createdAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
          })}
          sx={{ 
            fontFamily: 'JetBrains Mono, monospace',
            fontWeight: 500,
            backgroundColor: '#f1f5f9',
            color: '#64748b'
          }}
        />
      </Box>

      {/* Red Flags Overview */}
      <Paper sx={{ p: 3, mb: 3, borderRadius: 3, border: '1px solid #e2e8f0' }}>
        <Typography variant="h6" gutterBottom sx={{ color: '#0f172a', fontWeight: 700, mb: 2 }}>
          Red Flags Detected
        </Typography>
        <Grid container spacing={2}>
          {analysis.redFlags.dataSovereignty && (
            <Grid item xs={12} sm={6} md={4}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 2, borderRadius: 2, backgroundColor: '#fef2f2', border: '1px solid #fecaca' }}>
                <ShieldIcon className="icon-privacy" />
                <Typography sx={{ fontWeight: 600, fontSize: '0.875rem', color: '#991b1b' }}>Data Sovereignty</Typography>
              </Box>
            </Grid>
          )}
          {analysis.redFlags.hiddenBilling && (
            <Grid item xs={12} sm={6} md={4}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 2, borderRadius: 2, backgroundColor: '#fef2f2', border: '1px solid #fecaca' }}>
                <MoneyIcon className="icon-financial" />
                <Typography sx={{ fontWeight: 600, fontSize: '0.875rem', color: '#991b1b' }}>Hidden Billing</Typography>
              </Box>
            </Grid>
          )}
          {analysis.redFlags.jurisdiction && (
            <Grid item xs={12} sm={6} md={4}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 2, borderRadius: 2, backgroundColor: '#fef2f2', border: '1px solid #fecaca' }}>
                <GavelIcon className="icon-legal" />
                <Typography sx={{ fontWeight: 600, fontSize: '0.875rem', color: '#991b1b' }}>Jurisdiction Issues</Typography>
              </Box>
            </Grid>
          )}
          {analysis.redFlags.liabilityShift && (
            <Grid item xs={12} sm={6} md={4}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 2, borderRadius: 2, backgroundColor: '#fef2f2', border: '1px solid #fecaca' }}>
                <GavelIcon className="icon-legal" />
                <Typography sx={{ fontWeight: 600, fontSize: '0.875rem', color: '#991b1b' }}>Liability Shift</Typography>
              </Box>
            </Grid>
          )}
          {analysis.redFlags.unilateralChanges && (
            <Grid item xs={12} sm={6} md={4}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 2, borderRadius: 2, backgroundColor: '#fef2f2', border: '1px solid #fecaca' }}>
                <WarningIcon sx={{ color: '#991b1b' }} />
                <Typography sx={{ fontWeight: 600, fontSize: '0.875rem', color: '#991b1b' }}>Unilateral Changes</Typography>
              </Box>
            </Grid>
          )}
          {!Object.values(analysis.redFlags).some((v) => v) && (
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 2, borderRadius: 2, backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0' }}>
                <CheckIcon sx={{ color: '#166534' }} />
                <Typography sx={{ fontWeight: 600, fontSize: '0.875rem', color: '#166534' }}>No Critical Red Flags Detected</Typography>
              </Box>
            </Grid>
          )}
        </Grid>
      </Paper>

      {/* Tabs */}
      <Paper sx={{ borderRadius: 3, border: '1px solid #e2e8f0' }}>
        <Tabs 
          value={tabValue} 
          onChange={(e, newValue) => setTabValue(newValue)}
          sx={{
            borderBottom: '2px solid #e2e8f0',
            '& .MuiTab-root': {
              fontWeight: 600,
              textTransform: 'none',
              fontSize: '1rem',
            }
          }}
        >
          <Tab label="Summary" />
          <Tab label={`Risks (${analysis.risks.length})`} />
          <Tab label="Full Document" />
        </Tabs>

        {/* Summary Tab */}
        <TabPanel value={tabValue} index={0}>
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ color: '#0f172a', fontWeight: 700 }}>
              Executive Summary
            </Typography>
            <Typography variant="body1" paragraph sx={{ color: '#475569', lineHeight: 1.8 }}>
              {analysis.summary}
            </Typography>

            <Typography variant="h6" gutterBottom sx={{ mt: 4, color: '#0f172a', fontWeight: 700 }}>
              Risk Distribution
            </Typography>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              {['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map((level) => {
                const count = analysis.risks.filter((r) => r.riskLevel === level).length;
                return (
                  <Grid item xs={6} md={3} key={level}>
                    <Card className="stat-card">
                      <CardContent sx={{ textAlign: 'center' }}>
                        <Typography 
                          className="audit-number" 
                          sx={{ color: getRiskLevelColor(level), fontSize: '2.5rem' }}
                        >
                          {count}
                        </Typography>
                        <Typography variant="body2" className="text-secondary" sx={{ fontWeight: 600 }}>
                          {level}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          </Box>
        </TabPanel>

        {/* Risks Tab - Progressive Disclosure */}
        <TabPanel value={tabValue} index={1}>
          <Box sx={{ p: 3 }}>
            {analysis.risks.map((risk, index) => (
              <Card 
                key={index} 
                className="audit-ledger-row"
                sx={{ 
                  mb: 2, 
                  borderRadius: 2,
                  border: '1px solid #e2e8f0',
                  overflow: 'hidden'
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
                      {getCategoryIcon(risk.category)}
                      <span 
                        className={
                          risk.riskLevel === 'CRITICAL' || risk.riskLevel === 'HIGH'
                            ? 'risk-badge-high'
                            : risk.riskLevel === 'MEDIUM'
                            ? 'risk-badge-medium'
                            : 'risk-badge-low'
                        }
                        style={{ fontSize: '0.75rem', padding: '4px 10px' }}
                      >
                        {risk.riskLevel}
                      </span>
                      <Chip 
                        label={risk.category} 
                        size="small" 
                        variant="outlined"
                        sx={{ 
                          fontWeight: 600,
                          borderColor: '#cbd5e1',
                          color: '#475569'
                        }}
                      />
                    </Box>
                    {risk.location && (
                      <Typography 
                        variant="caption" 
                        className="audit-timestamp"
                        sx={{ fontWeight: 600 }}
                      >
                        {risk.location}
                      </Typography>
                    )}
                  </Box>

                  <Paper 
                    sx={{ 
                      p: 2, 
                      bgcolor: '#f8fafc', 
                      mb: 2,
                      border: '1px solid #e2e8f0',
                      borderRadius: 2,
                      borderLeft: `4px solid ${getRiskLevelColor(risk.riskLevel)}`
                    }}
                  >
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        fontStyle: 'italic', 
                        color: '#334155',
                        lineHeight: 1.7
                      }}
                    >
                      "{risk.clauseText}"
                    </Typography>
                  </Paper>

                  <Typography variant="body1" paragraph sx={{ color: '#475569', lineHeight: 1.8 }}>
                    {risk.explanation}
                  </Typography>

                  {/* Progressive Disclosure Button */}
                  <Button
                    size="small"
                    className="disclosure-button"
                    onClick={() => toggleRiskExpansion(index)}
                    endIcon={<ExpandMoreIcon 
                      sx={{ 
                        transform: expandedRisks[index] ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 0.3s'
                      }} 
                    />}
                    sx={{ mt: 1 }}
                  >
                    {expandedRisks[index] ? 'Hide Details' : 'View Reasoning'}
                  </Button>

                  {/* Progressive Disclosure Content */}
                  <Collapse in={expandedRisks[index]} timeout="auto" unmountOnExit>
                    <Box 
                      sx={{ 
                        mt: 2, 
                        p: 2, 
                        borderRadius: 2,
                        backgroundColor: '#f0fdf4',
                        border: '1px solid #bbf7d0'
                      }}
                    >
                      {risk.suggestedFix && (
                        <>
                          <Typography 
                            variant="subtitle2" 
                            sx={{ 
                              color: '#166534', 
                              fontWeight: 700, 
                              mb: 1,
                              display: 'flex',
                              alignItems: 'center',
                              gap: 1
                            }}
                          >
                            <CheckIcon fontSize="small" />
                            Suggested Fairer Alternative:
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#166534', lineHeight: 1.7 }}>
                            {risk.suggestedFix}
                          </Typography>
                        </>
                      )}
                    </Box>
                  </Collapse>
                </CardContent>
              </Card>
            ))}
          </Box>
        </TabPanel>

        {/* Highlighted Text Tab */}
        <TabPanel value={tabValue} index={2}>
          <Box sx={{ p: 3 }}>
            <Alert severity="info" sx={{ mb: 2 }}>
              Risky clauses are highlighted. Click on any highlighted text to see details.
            </Alert>

            <Paper sx={{ p: 3, maxHeight: '600px', overflow: 'auto', bgcolor: 'grey.50' }}>
              <Highlighter
                highlightStyle={{
                  backgroundColor: '#ffeb3b',
                  padding: '2px 4px',
                  borderRadius: '2px',
                  cursor: 'pointer',
                }}
                searchWords={clauseTexts}
                autoEscape={true}
                textToHighlight={document.originalText}
              />
            </Paper>
          </Box>
        </TabPanel>
      </Paper>
    </Box>
  );
}

export default ResultsPage;
