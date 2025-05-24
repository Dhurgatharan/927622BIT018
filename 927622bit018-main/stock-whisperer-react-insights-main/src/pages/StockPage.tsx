
import React, { useState } from 'react';
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
  Tooltip,
  Paper
} from '@mui/material';
import { Home, TrendingUp } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { stockApi, StockData } from '../services/stockApi';

const StockPage = () => {
  const navigate = useNavigate();
  const [selectedStock, setSelectedStock] = useState('AAPL');
  const [selectedInterval, setSelectedInterval] = useState(30);

  const { data: stocks = [], isLoading: stocksLoading } = useQuery({
    queryKey: ['stocks'],
    queryFn: stockApi.getStocks,
  });

  const { data: stockData = [], isLoading: dataLoading, error } = useQuery({
    queryKey: ['stockData', selectedStock, selectedInterval],
    queryFn: () => stockApi.getStockData(selectedStock, selectedInterval),
    enabled: !!selectedStock,
  });

  const chartData = stockData.map(item => ({
    ...item,
    time: new Date(item.timestamp).toLocaleTimeString(),
    fullTime: item.timestamp
  }));

  const averagePrice = stockData.length > 0 
    ? stockData.reduce((sum, item) => sum + item.price, 0) / stockData.length 
    : 0;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <Paper sx={{ p: 2, border: '1px solid #ccc', borderRadius: 2 }}>
          <Typography variant="body2" fontWeight={600}>
            Time: {data.time}
          </Typography>
          <Typography variant="body2" color="primary.main" fontWeight={600}>
            Price: ${data.price.toFixed(2)}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Ticker: {data.ticker}
          </Typography>
        </Paper>
      );
    }
    return null;
  };

  return (
    <Box sx={{ flexGrow: 1, minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar position="static">
        <Toolbar>
          <TrendingUp sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Stock Analysis
          </Typography>
          <Button color="inherit" startIcon={<Home />} onClick={() => navigate('/')}>
            Home
          </Button>
          <Button color="inherit" onClick={() => navigate('/correlation')}>
            Correlations
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom fontWeight={600}>
          Stock Price Analysis
        </Typography>

        <Grid container spacing={3} mb={4}>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Select Stock</InputLabel>
              <Select
                value={selectedStock}
                label="Select Stock"
                onChange={(e) => setSelectedStock(e.target.value)}
                disabled={stocksLoading}
              >
                {stocks.map((stock) => (
                  <MenuItem key={stock.ticker} value={stock.ticker}>
                    {stock.ticker} {stock.name && `- ${stock.name}`}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

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
        </Grid>

        {error && (
          <Card sx={{ mb: 3, border: '1px solid', borderColor: 'error.main' }}>
            <CardContent>
              <Typography color="error">
                Error loading data. Showing mock data for demonstration.
              </Typography>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
              <Typography variant="h6" fontWeight={600}>
                {selectedStock} - Price Chart
              </Typography>
              {dataLoading && <CircularProgress size={24} />}
            </Box>

            {stockData.length > 0 && (
              <Box mb={2}>
                <Typography variant="body2" color="text.secondary">
                  Average Price: <strong style={{ color: '#1976d2' }}>${averagePrice.toFixed(2)}</strong>
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Data Points: {stockData.length}
                </Typography>
              </Box>
            )}

            <Box sx={{ width: '100%', height: 400 }}>
              <ResponsiveContainer>
                <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="time" 
                    tick={{ fontSize: 12 }}
                    interval="preserveStartEnd"
                  />
                  <YAxis 
                    tick={{ fontSize: 12 }}
                    domain={['dataMin - 1', 'dataMax + 1']}
                    tickFormatter={(value) => `$${value.toFixed(2)}`}
                  />
                  <RechartsTooltip content={<CustomTooltip />} />
                  <Line 
                    type="monotone" 
                    dataKey="price" 
                    stroke="#1976d2" 
                    strokeWidth={2}
                    dot={{ fill: '#1976d2', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: '#1976d2', strokeWidth: 2 }}
                  />
                  {averagePrice > 0 && (
                    <ReferenceLine 
                      y={averagePrice} 
                      stroke="#dc004e" 
                      strokeDasharray="5 5"
                      strokeWidth={2}
                      label={{ value: `Avg: $${averagePrice.toFixed(2)}`, position: 'insideTopLeft' }}
                    />
                  )}
                </LineChart>
              </ResponsiveContainer>
            </Box>

            {stockData.length === 0 && !dataLoading && (
              <Box textAlign="center" py={4}>
                <Typography color="text.secondary">
                  No data available for the selected parameters
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default StockPage;
