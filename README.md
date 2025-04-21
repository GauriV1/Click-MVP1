# Market Data Loader Service

This service handles automated market data loading for stocks, ETFs, and bonds at market open/close times and on weekends.

## Features

- Loads market data at US market open (9:30 AM EST) and close (4:00 PM EST)
- Weekend updates every 12 hours (12 AM and 12 PM EST)
- Batch processing with rate limiting
- Automatic retries for failed requests
- Detailed logging and error handling

## Setup

1. Create a `.env` file in the root directory
2. Add your Finnhub API key:
   ```
   REACT_APP_FINNHUB_API_KEY=your_api_key_here
   ```

## Market Data Loading Schedule

- **Weekdays**:
  - Market Open (9:30 AM EST): Full data refresh
  - Market Close (4:00 PM EST): Full data refresh

- **Weekends**:
  - 12:00 AM EST: Full data refresh
  - 12:00 PM EST: Full data refresh

## Error Handling

- Failed requests are automatically retried up to 3 times
- Batch processing ensures API rate limits are respected
- Detailed logs are maintained for monitoring and debugging

## Dependencies

- Node.js
- Finnhub API
- Moment.js for time calculations
- Node-schedule for task scheduling 