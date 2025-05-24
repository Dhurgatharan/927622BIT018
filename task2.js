const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const port = 3000;


app.use(cors());


const accessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiZXhwIjoxNzQ4MDY5NDUxLCJpYXQiOjE3NDgwNjkxNTEsImlzcyI6IkFmZm9yZG1lZCIsImp0aSI6IjcwYTI4YmUxLTIyZDgtNDEzNi04NmM3LWZhYWFlNDY2MGYxMSIsInN1YiI6InZhcnNoaW5pa2FuYWdhcmFqMjAwNEBnbWFpbC5jb20ifSwiZW1haWwiOiJ2YXJzaGluaWthbmFnYXJhajIwMDRAZ21haWwuY29tIiwibmFtZSI6InZhcnNoaW5pIGsiLCJyb2xsTm8iOiI5Mjc2MjJiaXQxMTkiLCJhY2Nlc3NDb2RlIjoid2hlUVV5IiwiY2xpZW50SUQiOiI3MGEyOGJlMS0yMmQ4LTQxMzYtODZjNy1mYWFhZTQ2NjBmMTEiLCJjbGllbnRTZWNyZXQiOiJRY3BZa012aE5VeHhlbU5RIn0.ohJLFHB4UTUb5YiUvX2r8h0N8hrhYXp1-anZWIVcBIU';


const fetchStockPrices = async (ticker, minutes) => {
  const url = `http://20.244.56.144/evaluation-service/stocks/${ticker}?minutes=${minutes}`;
  const headers = {
    Authorization: `Bearer ${accessToken}`, 
  };
  const response = await axios.get(url, { headers });
  return response.data;
};


const calculateAveragePrice = (priceHistory) => {
  const total = priceHistory.reduce((sum, entry) => sum + entry.price, 0);
  return total / priceHistory.length;
};


const calculateCorrelation = (x, y) => {

  const minLength = Math.min(x.length, y.length);
  x = x.slice(0, minLength);
  y = y.slice(0, minLength);

  const n = x.length;
  if (n !== y.length) return null;  

  const avgX = x.reduce((sum, xi) => sum + xi, 0) / n;
  const avgY = y.reduce((sum, yi) => sum + yi, 0) / n;

  const numerator = x.reduce((sum, xi, i) => sum + (xi - avgX) * (y[i] - avgY), 0);
  const denominatorX = Math.sqrt(x.reduce((sum, xi) => sum + Math.pow(xi - avgX, 2), 0));
  const denominatorY = Math.sqrt(y.reduce((sum, yi) => sum + Math.pow(yi - avgY, 2), 0));

  return numerator / (denominatorX * denominatorY);
};


// API to get average stock price in the last "m" minutes
app.get('/stocks/:ticker', async (req, res) => {
  const ticker = req.params.ticker;
  const minutes = parseInt(req.query.minutes);
  const aggregation = req.query.aggregation;

  if (aggregation !== 'average') {
    return res.status(400).json({ error: 'Invalid aggregation type. Only "average" is supported.' });
  }

  try {
    const priceHistory = await fetchStockPrices(ticker, minutes);
    const averageStockPrice = calculateAveragePrice(priceHistory);
    res.json({ averageStockPrice, priceHistory });
  } catch (error) {
    res.status(500).json({ error: 'Error fetching stock prices' });
  }
});

// API to get the correlation between two stocks in the last "m" minutes
app.get('/stockcorrelation', async (req, res) => {
  const minutes = parseInt(req.query.minutes);
  const ticker1 = req.query.ticker1;
  const ticker2 = req.query.ticker2;

  if (!ticker1 || !ticker2) {
    return res.status(400).json({ error: 'Both tickers must be provided' });
  }

  if (req.query.ticker) {
    return res.status(400).json({ error: 'More than 2 tickers are not supported' });
  }

  try {
    const priceHistory1 = await fetchStockPrices(ticker1, minutes);
    const priceHistory2 = await fetchStockPrices(ticker2, minutes);

    // Extract prices for correlation calculation
    const prices1 = priceHistory1.map(entry => entry.price);
    const prices2 = priceHistory2.map(entry => entry.price);

    // Calculate correlation between the two stocks
    const correlation = calculateCorrelation(prices1, prices2);
    if (correlation === null) {
      return res.status(400).json({ error: 'The data for the two stocks must have the same length' });
    }

    // Prepare response with stock details and correlation
    res.json({
      correlation,
      stocks: {
        [ticker1]: {
          averagePrice: calculateAveragePrice(priceHistory1),
          priceHistory: priceHistory1,
        },
        [ticker2]: {
          averagePrice: calculateAveragePrice(priceHistory2),
          priceHistory: priceHistory2,
        },
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Error fetching stock prices' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Stock Price Aggregation microservice running at http://localhost:${port}`);
});
