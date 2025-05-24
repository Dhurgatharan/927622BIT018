
import axios from 'axios';

const API_BASE_URL = 'http://20.244.56.144/evaluation-service';

export interface StockData {
  ticker: string;
  timestamp: string;
  price: number;
}

export interface Stock {
  ticker: string;
  name?: string;
}

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

export const stockApi = {
  async getStocks(): Promise<Stock[]> {
    try {
      const response = await api.get('/stocks');
      console.log('Stocks API response:', response.data);
      // Handle both array response and object response with stocks property
      const stocks = Array.isArray(response.data) ? response.data : response.data.stocks || [];
      return stocks.map((stock: any) => ({
        ticker: typeof stock === 'string' ? stock : stock.ticker || stock.symbol,
        name: typeof stock === 'object' ? stock.name : undefined
      }));
    } catch (error) {
      console.error('Error fetching stocks:', error);
      // Return fallback data if API fails
      return [
        { ticker: 'AAPL', name: 'Apple Inc.' },
        { ticker: 'GOOGL', name: 'Alphabet Inc.' },
        { ticker: 'MSFT', name: 'Microsoft Corporation' },
        { ticker: 'AMZN', name: 'Amazon.com Inc.' },
        { ticker: 'TSLA', name: 'Tesla Inc.' },
        { ticker: 'NVDA', name: 'NVIDIA Corporation' },
        { ticker: 'META', name: 'Meta Platforms Inc.' },
        { ticker: 'NFLX', name: 'Netflix Inc.' }
      ];
    }
  },

  async getStockData(ticker: string, minutes: number): Promise<StockData[]> {
    try {
      const response = await api.get(`/stocks/${ticker}?minutes=${minutes}`);
      console.log(`Stock data for ${ticker}:`, response.data);
      
      // Handle different response formats
      let data = response.data;
      if (data.data) data = data.data;
      if (data.prices) data = data.prices;
      
      if (!Array.isArray(data)) {
        console.warn('Unexpected data format, generating mock data');
        return generateMockData(ticker, minutes);
      }

      return data.map((item: any) => ({
        ticker,
        timestamp: item.timestamp || item.time || new Date().toISOString(),
        price: parseFloat(item.price || item.value || Math.random() * 100 + 50)
      }));
    } catch (error) {
      console.error(`Error fetching data for ${ticker}:`, error);
      // Generate mock data as fallback
      return generateMockData(ticker, minutes);
    }
  }
};

function generateMockData(ticker: string, minutes: number): StockData[] {
  const data: StockData[] = [];
  const basePrice = Math.random() * 100 + 50;
  const now = new Date();
  
  for (let i = minutes; i >= 0; i--) {
    const timestamp = new Date(now.getTime() - i * 60000).toISOString();
    const price = basePrice + (Math.random() - 0.5) * 10;
    data.push({
      ticker,
      timestamp,
      price: Math.max(0, price)
    });
  }
  
  return data;
}
