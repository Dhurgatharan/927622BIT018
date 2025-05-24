
import React from 'react';
import { 
  Container, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  CardActions, 
  Button, 
  Box,
  AppBar,
  Toolbar
} from '@mui/material';
import { TrendingUp, Assessment } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const navigate = useNavigate();

  return (
    <Box sx={{ flexGrow: 1, minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      <AppBar position="static" sx={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)' }}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, color: 'white', fontWeight: 600 }}>
            Stock Whisperer
          </Typography>
        </Toolbar>
      </AppBar>
      
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Box textAlign="center" mb={8}>
          <Typography 
            variant="h3" 
            component="h1" 
            sx={{ 
              color: 'white', 
              fontWeight: 700, 
              mb: 2,
              textShadow: '0 2px 4px rgba(0,0,0,0.3)'
            }}
          >
            Stock Market Analytics
          </Typography>
          <Typography 
            variant="h6" 
            sx={{ 
              color: 'rgba(255,255,255,0.9)', 
              maxWidth: 600, 
              mx: 'auto',
              textShadow: '0 1px 2px rgba(0,0,0,0.2)'
            }}
          >
            Analyze stock trends and correlations with real-time data and interactive visualizations
          </Typography>
        </Box>

        <Grid container spacing={4} justifyContent="center">
          <Grid item xs={12} md={6}>
            <Card 
              sx={{ 
                height: '100%', 
                background: 'rgba(255,255,255,0.95)',
                backdropFilter: 'blur(10px)',
                transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
                }
              }}
            >
              <CardContent sx={{ p: 4 }}>
                <Box display="flex" alignItems="center" mb={2}>
                  <TrendingUp sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
                  <Typography variant="h5" component="h2" fontWeight={600}>
                    Stock Analysis
                  </Typography>
                </Box>
                <Typography variant="body1" color="text.secondary" mb={3}>
                  View detailed stock price charts with time-based filtering. 
                  Analyze trends with average price lines and interactive data points.
                </Typography>
                <Box>
                  <Typography variant="body2" color="primary.main" fontWeight={500}>
                    • Interactive price charts
                  </Typography>
                  <Typography variant="body2" color="primary.main" fontWeight={500}>
                    • Multiple time intervals
                  </Typography>
                  <Typography variant="body2" color="primary.main" fontWeight={500}>
                    • Real-time data updates
                  </Typography>
                </Box>
              </CardContent>
              <CardActions sx={{ p: 4, pt: 0 }}>
                <Button 
                  variant="contained" 
                  size="large" 
                  fullWidth
                  onClick={() => navigate('/stocks')}
                  sx={{ 
                    py: 1.5,
                    background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                    '&:hover': {
                      background: 'linear-gradient(45deg, #1976d2 30%, #1976d2 90%)',
                    }
                  }}
                >
                  Analyze Stocks
                </Button>
              </CardActions>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card 
              sx={{ 
                height: '100%', 
                background: 'rgba(255,255,255,0.95)',
                backdropFilter: 'blur(10px)',
                transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
                }
              }}
            >
              <CardContent sx={{ p: 4 }}>
                <Box display="flex" alignItems="center" mb={2}>
                  <Assessment sx={{ fontSize: 40, color: 'secondary.main', mr: 2 }} />
                  <Typography variant="h5" component="h2" fontWeight={600}>
                    Correlation Matrix
                  </Typography>
                </Box>
                <Typography variant="body1" color="text.secondary" mb={3}>
                  Explore relationships between different stocks using correlation heatmaps. 
                  Discover patterns and statistical insights across multiple securities.
                </Typography>
                <Box>
                  <Typography variant="body2" color="secondary.main" fontWeight={500}>
                    • Interactive heatmap visualization
                  </Typography>
                  <Typography variant="body2" color="secondary.main" fontWeight={500}>
                    • Pearson correlation analysis
                  </Typography>
                  <Typography variant="body2" color="secondary.main" fontWeight={500}>
                    • Statistical insights on hover
                  </Typography>
                </Box>
              </CardContent>
              <CardActions sx={{ p: 4, pt: 0 }}>
                <Button 
                  variant="contained" 
                  size="large" 
                  fullWidth
                  onClick={() => navigate('/correlation')}
                  sx={{ 
                    py: 1.5,
                    background: 'linear-gradient(45deg, #dc004e 30%, #f50057 90%)',
                    '&:hover': {
                      background: 'linear-gradient(45deg, #c51162 30%, #c51162 90%)',
                    }
                  }}
                >
                  View Correlations
                </Button>
              </CardActions>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Index;
