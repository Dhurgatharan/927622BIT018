
import React, { useState, useMemo } from 'react';
import {
  Container,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Card,
  CardContent,
  Box,
  AppBar,
  Toolbar,
  Button,
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Chip
} from '@mui/material';
import { Home, Assessment } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { stockApi, StockData } from '../services/stockApi';
import {
  alignStockData,
  calculateCorrelationMatrix,
  calculateStockStats,
  getCorrelationColor,
  getCorrelationTextColor,
  CorrelationData
} from '../utils/correlationUtils';

const CorrelationPage = () => {
  const navigate = useNavigate();
  const [selectedInterval, setSelectedInterval] = useState(30);
  const [hoveredStock, setHoveredStock] = useState<string | null>(null);

  const { data: stocks = [], isLoading: stocksLoading } = useQuery({
    queryKey: ['stocks'],
    queryFn: stockApi.getStocks,
  });

  const stockDataQueries = useQuery({
    queryKey: ['allStockData', selectedInterval],
    queryFn: async () => {
      const promises = stocks.slice(0, 8).map(stock =>
        stockApi.getStockData(stock.ticker, selectedInterval)
      );
      const results = await Promise.all(promises);
      const stockDataMap = new Map<string, StockData[]>();
      
      results.forEach((data, index) => {
        const ticker = stocks[index].ticker;
        stockDataMap.set(ticker, data);
      });
      
      return stockDataMap;
    },
    enabled: stocks.length > 0,
  });

  const correlationData = useMemo(() => {
    if (!stockDataQueries.data) return [];
    
    const alignedData = alignStockData(stockDataQueries.data);
    return calculateCorrelationMatrix(alignedData);
  }, [stockDataQueries.data]);

  const stockStats = useMemo(() => {
    if (!stockDataQueries.data) return new Map();
    
    const stats = new Map();
    stockDataQueries.data.forEach((data, ticker) => {
      stats.set(ticker, calculateStockStats(data));
    });
    return stats;
  }, [stockDataQueries.data]);

  const tickers = stocks.slice(0, 8).map(s => s.ticker);

  const getCorrelationValue = (stock1: string, stock2: string): number => {
    const correlation = correlationData.find(
      c => c.stock1 === stock1 && c.stock2 === stock2
    );
    return correlation ? correlation.correlation : 0;
  };

  const StatsTooltip = ({ ticker }: { ticker: string }) => {
    const stats = stockStats.get(ticker);
    if (!stats) return null;

    return (
      <Paper sx={{ p: 2, maxWidth: 250 }}>
        <Typography variant="subtitle2" fontWeight={600} mb={1}>
          {ticker} Statistics
        </Typography>
        <Typography variant="body2">
          Average: <strong>${stats.average.toFixed(2)}</strong>
        </Typography>
        <Typography variant="body2">
          Std Dev: <strong>${stats.standardDeviation.toFixed(2)}</strong>
        </Typography>
        <Typography variant="body2">
          Data Points: <strong>{stats.count}</strong>
        </Typography>
      </Paper>
    );
  };

  return (
    <Box sx={{ flexGrow: 1, minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar position="static">
        <Toolbar>
          <Assessment sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Correlation Analysis
          </Typography>
          <Button color="inherit" startIcon={<Home />} onClick={() => navigate('/')}>
            Home
          </Button>
          <Button color="inherit" onClick={() => navigate('/stocks')}>
            Stock Analysis
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom fontWeight={600}>
          Stock Correlation Heatmap
        </Typography>

        <Grid container spacing={3} mb={4}>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Time Interval</InputLabel>
              <Select
                value={selectedInterval}
                label="Time Interval"
                onChange={(e) => setSelectedInterval(Number(e.target.value))}
              >
                <MenuItem value={15}>Last 15 minutes</MenuItem>
                <MenuItem value={30}>Last 30 minutes</MenuItem>
                <MenuItem value={60}>Last 60 minutes</MenuItem>
                <MenuItem value={120}>Last 2 hours</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box display="flex" alignItems="center" gap={2} height="100%">
              <Typography variant="body2" color="text.secondary">
                Color Legend:
              </Typography>
              <Box display="flex" alignItems="center" gap={1}>
                <Box sx={{ width: 20, height: 20, bgcolor: '#1565C0', borderRadius: 1 }} />
                <Typography variant="caption">Strong +</Typography>
                <Box sx={{ width: 20, height: 20, bgcolor: '#FFFFFF', border: '1px solid #ccc', borderRadius: 1 }} />
                <Typography variant="caption">Zero</Typography>
                <Box sx={{ width: 20, height: 20, bgcolor: '#C62828', borderRadius: 1 }} />
                <Typography variant="caption">Strong -</Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>

        <Card>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
              <Typography variant="h6" fontWeight={600}>
                Pearson Correlation Matrix
              </Typography>
              {stockDataQueries.isLoading && <CircularProgress size={24} />}
            </Box>

            {hoveredStock && (
              <Box mb={2}>
                <Tooltip title={<StatsTooltip ticker={hoveredStock} />} arrow placement="top">
                  <Chip 
                    label={`${hoveredStock} - Click for details`}
                    color="primary"
                    variant="outlined"
                  />
                </Tooltip>
              </Box>
            )}

            <TableContainer component={Paper} sx={{ border: '1px solid #e0e0e0' }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600, bgcolor: 'grey.100' }}>
                      Stock
                    </TableCell>
                    {tickers.map((ticker) => (
                      <TableCell 
                        key={ticker} 
                        align="center" 
                        sx={{ 
                          fontWeight: 600, 
                          bgcolor: 'grey.100',
                          cursor: 'pointer',
                          '&:hover': { bgcolor: 'grey.200' }
                        }}
                        onMouseEnter={() => setHoveredStock(ticker)}
                        onMouseLeave={() => setHoveredStock(null)}
                      >
                        <Tooltip title={<StatsTooltip ticker={ticker} />} arrow>
                          <span>{ticker}</span>
                        </Tooltip>
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {tickers.map((rowTicker) => (
                    <TableRow key={rowTicker}>
                      <TableCell 
                        sx={{ 
                          fontWeight: 600,
                          cursor: 'pointer',
                          '&:hover': { bgcolor: 'grey.100' }
                        }}
                        onMouseEnter={() => setHoveredStock(rowTicker)}
                        onMouseLeave={() => setHoveredStock(null)}
                      >
                        <Tooltip title={<StatsTooltip ticker={rowTicker} />} arrow>
                          <span>{rowTicker}</span>
                        </Tooltip>
                      </TableCell>
                      {tickers.map((colTicker) => {
                        const correlation = getCorrelationValue(rowTicker, colTicker);
                        const bgColor = getCorrelationColor(correlation);
                        const textColor = getCorrelationTextColor(correlation);
                        
                        return (
                          <TableCell
                            key={colTicker}
                            align="center"
                            sx={{
                              bgcolor: bgColor,
                              color: textColor,
                              fontWeight: 500,
                              cursor: 'pointer',
                              transition: 'all 0.2s ease',
                              '&:hover': {
                                transform: 'scale(1.05)',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                                zIndex: 1
                              }
                            }}
                          >
                            <Tooltip 
                              title={
                                <Box>
                                  <Typography variant="body2">
                                    {rowTicker} vs {colTicker}
                                  </Typography>
                                  <Typography variant="body2" fontWeight={600}>
                                    Correlation: {correlation.toFixed(3)}
                                  </Typography>
                                  <Typography variant="caption">
                                    {correlation > 0.7 ? 'Strong Positive' :
                                     correlation > 0.3 ? 'Moderate Positive' :
                                     correlation > -0.3 ? 'Weak/No Correlation' :
                                     correlation > -0.7 ? 'Moderate Negative' : 'Strong Negative'}
                                  </Typography>
                                </Box>
                              }
                              arrow
                            >
                              <span>{correlation.toFixed(2)}</span>
                            </Tooltip>
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {correlationData.length === 0 && !stockDataQueries.isLoading && (
              <Box textAlign="center" py={4}>
                <Typography color="text.secondary">
                  No correlation data available
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>

        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Typography variant="h6" fontWeight={600} mb={2}>
              How to Read the Correlation Matrix
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="body2" paragraph>
                  <strong>Correlation Values:</strong> Range from -1 to +1
                </Typography>
                <Typography variant="body2" paragraph>
                  <strong>+1:</strong> Perfect positive correlation (stocks move together)
                </Typography>
                <Typography variant="body2" paragraph>
                  <strong>0:</strong> No correlation (independent movement)
                </Typography>
                <Typography variant="body2">
                  <strong>-1:</strong> Perfect negative correlation (stocks move opposite)
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="body2" paragraph>
                  <strong>Color Coding:</strong>
                </Typography>
                <Typography variant="body2" paragraph>
                  🔵 Blue tones indicate positive correlation
                </Typography>
                <Typography variant="body2" paragraph>
                  ⚪ White indicates near-zero correlation
                </Typography>
                <Typography variant="body2">
                  🔴 Red tones indicate negative correlation
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default CorrelationPage;
