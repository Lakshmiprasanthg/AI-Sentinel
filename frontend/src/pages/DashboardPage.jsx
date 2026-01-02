import { useEffect, useState } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Button,
  Card,
  CardContent,
  LinearProgress,
} from '@mui/material';
import {
  Upload as UploadIcon,
  History as HistoryIcon,
  TrendingUp as TrendingUpIcon,
  Assessment as AssessmentIcon,
  Shield as ShieldIcon,
  AttachMoney as MoneyIcon,
  Gavel as GavelIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import useStore from '../store/useStore';
import { authAPI, documentsAPI } from '../utils/api';

function DashboardPage() {
  const navigate = useNavigate();
  const { user, updateUser, documents, setDocuments } = useStore();
  const [stats, setStats] = useState({
    totalAnalyses: 0,
    recentDocuments: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch user data to get latest analysis count
        const userResponse = await authAPI.getMe();
        updateUser(userResponse.data.user);

        // Fetch recent documents
        const docsResponse = await documentsAPI.getDocuments({ limit: 5 });
        setDocuments(docsResponse.data.documents);
        setStats({
          totalAnalyses: docsResponse.data.pagination.total,
          recentDocuments: docsResponse.data.documents,
        });
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [updateUser, setDocuments]);

  const dailyLimit = user?.dailyLimit || 50;
  const dailyUsage = user?.dailyAnalysisCount || 0;
  const usagePercentage = (dailyUsage / dailyLimit) * 100;

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

  const getCategoryIcon = (category) => {
    switch (category?.toLowerCase()) {
      case 'privacy':
      case 'data':
        return <ShieldIcon className="icon-privacy" />;
      case 'financial':
      case 'billing':
        return <MoneyIcon className="icon-financial" />;
      case 'legal':
      case 'rights':
      case 'jurisdiction':
        return <GavelIcon className="icon-legal" />;
      default:
        return <ShieldIcon />;
    }
  };

  return (
    <Box>
      {/* Header with Deep Slate Typography */}
      <Typography variant="h4" gutterBottom sx={{ color: '#0f172a', fontWeight: 800, letterSpacing: '-0.02em' }}>
        Command Center
      </Typography>

      <Typography variant="body1" className="text-secondary" gutterBottom sx={{ mb: 4 }}>
        Intelligent legal document auditing powered by AI
      </Typography>

      {/* Stats Cards with Interactive Borders */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6} lg={3}>
          <Card className="stat-card">
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <AssessmentIcon sx={{ fontSize: 40, color: '#3b82f6' }} />
                <Box>
                  <Typography className="text-secondary" variant="body2" sx={{ fontSize: '0.875rem' }}>
                    Total Analyses
                  </Typography>
                  <Typography variant="h4" className="audit-number">{stats.totalAnalyses}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6} lg={3}>
          <Card className="stat-card">
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <TrendingUpIcon sx={{ fontSize: 40, color: '#10b981' }} />
                <Box>
                  <Typography className="text-secondary" variant="body2" sx={{ fontSize: '0.875rem' }}>
                    Daily Usage
                  </Typography>
                  <Typography variant="h4" className="audit-number">
                    {dailyUsage}/{dailyLimit}
                  </Typography>
                </Box>
              </Box>
              <LinearProgress
                variant="determinate"
                value={usagePercentage}
                sx={{ 
                  mt: 2,
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: '#e2e8f0',
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: usagePercentage > 80 ? '#f59e0b' : '#10b981',
                  }
                }}
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Quick Actions with Gradient */}
      <Paper sx={{ p: 3, mb: 4, borderRadius: 3, border: '1px solid #e2e8f0' }}>
        <Typography variant="h6" gutterBottom sx={{ color: '#0f172a', fontWeight: 700 }}>
          Quick Actions
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, mt: 2, flexWrap: 'wrap' }}>
          <Button
            variant="contained"
            startIcon={<UploadIcon />}
            onClick={() => navigate('/upload')}
            size="large"
            sx={{
              background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
              fontWeight: 600,
              textTransform: 'none',
              px: 3,
              py: 1.5,
              borderRadius: 2,
              boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
              '&:hover': {
                background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                boxShadow: '0 6px 16px rgba(59, 130, 246, 0.4)',
              }
            }}
          >
            Analyze New Document
          </Button>
          <Button
            variant="outlined"
            startIcon={<HistoryIcon />}
            onClick={() => navigate('/history')}
            size="large"
            sx={{
              borderColor: '#3b82f6',
              color: '#3b82f6',
              fontWeight: 600,
              textTransform: 'none',
              px: 3,
              py: 1.5,
              borderRadius: 2,
              '&:hover': {
                borderColor: '#2563eb',
                backgroundColor: 'rgba(59, 130, 246, 0.05)',
              }
            }}
          >
            View History
          </Button>
        </Box>
      </Paper>

      {/* Recent Documents - Audit Ledger Style */}
      <Paper sx={{ p: 3, borderRadius: 3, border: '1px solid #e2e8f0' }}>
        <Typography variant="h6" gutterBottom sx={{ color: '#0f172a', fontWeight: 700 }}>
          Recent Analyses
        </Typography>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <div className="scanning-container" style={{ width: '60%', height: '120px', position: 'relative' }}>
              <div className="scanning-beam"></div>
              <Typography 
                variant="body2" 
                className="text-secondary" 
                sx={{ 
                  position: 'absolute', 
                  top: '50%', 
                  left: '50%', 
                  transform: 'translate(-50%, -50%)',
                  fontFamily: 'JetBrains Mono, monospace'
                }}
              >
                Scanning Documents...
              </Typography>
            </div>
          </Box>
        ) : stats.recentDocuments.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography className="text-secondary">
              No documents analyzed yet. Start by uploading a document!
            </Typography>
            <Button
              variant="contained"
              startIcon={<UploadIcon />}
              onClick={() => navigate('/upload')}
              sx={{ 
                mt: 2,
                background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                fontWeight: 600,
                textTransform: 'none',
              }}
            >
              Analyze Your First Document
            </Button>
          </Box>
        ) : (
          <Box sx={{ mt: 2 }}>
            {stats.recentDocuments.map((doc) => (
              <Card
                key={doc._id}
                className="audit-ledger-row"
                sx={{ 
                  mb: 2, 
                  cursor: 'pointer', 
                  borderRadius: 2,
                  border: '1px solid #e2e8f0',
                  '&:hover': { 
                    bgcolor: '#f8fafc'
                  } 
                }}
                onClick={() => navigate(`/results/${doc._id}`)}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <Box sx={{ flex: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        {getCategoryIcon(doc.analysis?.risks?.[0]?.category)}
                        <Typography variant="h6" sx={{ color: '#0f172a', fontWeight: 600 }}>
                          {doc.title}
                        </Typography>
                      </Box>
                      <Typography variant="body2" className="audit-timestamp">
                        {new Date(doc.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit',
                          hour12: false
                        })} • {doc.sourceType.toUpperCase()}
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 1 }}>
                      <Typography
                        className="audit-number"
                        sx={{
                          color: getRiskTextColor(doc.analysis?.overallScore || 0),
                          fontSize: '2rem',
                        }}
                      >
                        {doc.analysis?.overallScore || 0}
                      </Typography>
                      <span className={getRiskBadgeClass(doc.analysis?.overallScore || 0)}>
                        RISK SCORE
                      </span>
                    </Box>
                  </Box>
                  {doc.analysis?.summary && (
                    <Typography variant="body2" className="text-secondary" sx={{ mt: 2, lineHeight: 1.6 }}>
                      {doc.analysis.summary.substring(0, 180)}
                      {doc.analysis.summary.length > 180 && '...'}
                    </Typography>
                  )}
                </CardContent>
              </Card>
            ))}
          </Box>
        )}
      </Paper>
    </Box>
  );
}

export default DashboardPage;
