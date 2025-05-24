
import { StockData } from '../services/stockApi';

export interface CorrelationData {
  stock1: string;
  stock2: string;
  correlation: number;
}

export interface StockStats {
  ticker: string;
  average: number;
  standardDeviation: number;
  count: number;
}

export function calculatePearsonCorrelation(x: number[], y: number[]): number {
  if (x.length !== y.length || x.length === 0) return 0;
  
  const n = x.length;
  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = y.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((acc, xi, i) => acc + xi * y[i], 0);
  const sumXX = x.reduce((acc, xi) => acc + xi * xi, 0);
  const sumYY = y.reduce((acc, yi) => acc + yi * yi, 0);

  const numerator = n * sumXY - sumX * sumY;
  const denominator = Math.sqrt((n * sumXX - sumX * sumX) * (n * sumYY - sumY * sumY));

  if (denominator === 0) return 0;
  return numerator / denominator;
}

export function alignStockData(stockDataMap: Map<string, StockData[]>): Map<string, number[]> {
  const allTickers = Array.from(stockDataMap.keys());
  const alignedData = new Map<string, number[]>();

  // Get all unique timestamps
  const allTimestamps = new Set<string>();
  stockDataMap.forEach(data => {
    data.forEach(point => allTimestamps.add(point.timestamp));
  });

  const sortedTimestamps = Array.from(allTimestamps).sort();

  // Align data for each stock
  allTickers.forEach(ticker => {
    const stockData = stockDataMap.get(ticker) || [];
    const dataMap = new Map(stockData.map(point => [point.timestamp, point.price]));
    
    const alignedPrices: number[] = [];
    sortedTimestamps.forEach(timestamp => {
      const price = dataMap.get(timestamp);
      if (price !== undefined) {
        alignedPrices.push(price);
      }
    });

    if (alignedPrices.length > 0) {
      alignedData.set(ticker, alignedPrices);
    }
  });

  return alignedData;
}

export function calculateCorrelationMatrix(alignedData: Map<string, number[]>): CorrelationData[] {
  const tickers = Array.from(alignedData.keys());
  const correlations: CorrelationData[] = [];

  for (let i = 0; i < tickers.length; i++) {
    for (let j = 0; j < tickers.length; j++) {
      const stock1 = tickers[i];
      const stock2 = tickers[j];
      const data1 = alignedData.get(stock1) || [];
      const data2 = alignedData.get(stock2) || [];

      const correlation = i === j ? 1 : calculatePearsonCorrelation(data1, data2);
      
      correlations.push({
        stock1,
        stock2,
        correlation
      });
    }
  }

  return correlations;
}

export function calculateStockStats(stockData: StockData[]): StockStats {
  if (stockData.length === 0) {
    return {
      ticker: '',
      average: 0,
      standardDeviation: 0,
      count: 0
    };
  }

  const prices = stockData.map(d => d.price);
  const average = prices.reduce((a, b) => a + b, 0) / prices.length;
  
  const variance = prices.reduce((acc, price) => acc + Math.pow(price - average, 2), 0) / prices.length;
  const standardDeviation = Math.sqrt(variance);

  return {
    ticker: stockData[0].ticker,
    average,
    standardDeviation,
    count: prices.length
  };
}

export function getCorrelationColor(correlation: number): string {
  if (correlation > 0.7) return '#1565C0'; // Strong positive - dark blue
  if (correlation > 0.3) return '#42A5F5'; // Moderate positive - light blue
  if (correlation > -0.3) return '#FFFFFF'; // Near zero - white
  if (correlation > -0.7) return '#EF5350'; // Moderate negative - light red
  return '#C62828'; // Strong negative - dark red
}

export function getCorrelationTextColor(correlation: number): string {
  const absCorr = Math.abs(correlation);
  return absCorr > 0.5 ? '#FFFFFF' : '#000000';
}
