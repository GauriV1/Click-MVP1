import React, { useState, useEffect } from 'react';
import { onMarketDataReady, onMarketDataLoading, onMarketDataError } from '../../services/marketDataLoader';
import '../../styles/MarketViews/MarketDataStatus.css';

const MarketDataStatus = () => {
  const [status, setStatus] = useState('idle');
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Subscribe to market data events
    onMarketDataLoading(() => {
      setStatus('loading');
      setError(null);
    });

    onMarketDataReady((detail) => {
      setStatus('ready');
      setStats(detail);
      setError(null);
    });

    onMarketDataError((detail) => {
      setStatus('error');
      setError(detail.error);
    });
  }, []);

  const renderStatus = () => {
    switch (status) {
      case 'loading':
        return (
          <div className="market-data-status loading">
            <div className="spinner"></div>
            <p>Loading market data...</p>
          </div>
        );
      
      case 'ready':
        return (
          <div className="market-data-status ready">
            <div className="success-icon">✓</div>
            <p>Market data ready!</p>
            {stats && (
              <div className="stats">
                <p>Total symbols: {stats.total}</p>
                <p>Successfully loaded: {stats.loaded}</p>
                {stats.failed > 0 && (
                  <p className="failures">Failed to load: {stats.failed}</p>
                )}
                <p className="timestamp">
                  Last updated: {new Date(stats.timestamp).toLocaleString()}
                </p>
              </div>
            )}
          </div>
        );
      
      case 'error':
        return (
          <div className="market-data-status error">
            <div className="error-icon">!</div>
            <p>Error loading market data</p>
            {error && <p className="error-message">{error}</p>}
          </div>
        );
      
      default:
        return (
          <div className="market-data-status idle">
            <p>Waiting for market data update...</p>
          </div>
        );
    }
  };

  return (
    <div className="market-data-status-container">
      {renderStatus()}
    </div>
  );
};

export default MarketDataStatus; 