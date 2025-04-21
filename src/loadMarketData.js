const { scheduleMarketDataLoads } = require('./services/marketDataLoader');

console.log('Starting market data loader...');

// Start the market data loader
scheduleMarketDataLoads();

// Keep the process running
process.stdin.resume(); 