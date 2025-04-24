import React, { useState, useEffect } from 'react';
import { getMultipleStockData, getAllTickers } from '../../services/finnhubService';
import './StocksView.css';

const StocksView = () => {
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeCategory, setActiveCategory] = useState('stocks');
  const [lastUpdated, setLastUpdated] = useState(null);
  const tickers = getAllTickers();

  useEffect(() => {
    const fetchStockData = async () => {
      try {
        setLoading(true);
        const data = await getMultipleStockData(tickers[activeCategory]);
        setStocks(data);
        setLastUpdated(new Date());
        setError(null);
      } catch (err) {
        setError('Failed to fetch stock data. Please try again later.');
        console.error('Error fetching stock data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStockData();
    // Set up periodic updates
    const interval = setInterval(fetchStockData, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [activeCategory]);

  if (loading) {
    return <div className="loading">Loading stock data...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="stocks-view">
      <div className="category-tabs">
        <button 
          className={`tab ${activeCategory === 'stocks' ? 'active' : ''}`}
          onClick={() => setActiveCategory('stocks')}
        >
          Stocks
        </button>
        <button 
          className={`tab ${activeCategory === 'etfs' ? 'active' : ''}`}
          onClick={() => setActiveCategory('etfs')}
        >
          ETFs
        </button>
        <button 
          className={`tab ${activeCategory === 'bonds' ? 'active' : ''}`}
          onClick={() => setActiveCategory('bonds')}
        >
          Bonds
        </button>
      </div>
      <div className="stocks-grid">
        {stocks.map((stock) => (
          <div key={stock.symbol} className="stock-card">
            <h2>{stock.symbol}</h2>
            <div className="stock-price">${stock.price?.toFixed(2) || 'N/A'}</div>
            <div className={`stock-change ${stock.change >= 0 ? 'positive' : 'negative'}`}>
              {stock.change?.toFixed(2) || 'N/A'} ({stock.changePercent?.toFixed(2) || 'N/A'}%)
            </div>
            <div className="stock-volume">
              Volume: {stock.volume?.toLocaleString() || 'N/A'}
            </div>
          </div>
        ))}
      </div>
      {lastUpdated && (
        <div className="last-updated">
          Last updated: {lastUpdated.toLocaleTimeString()}
        </div>
      )}
    </div>
  );
};

export default StocksView; 