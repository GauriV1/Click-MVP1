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

# Click MVP1

An AI-powered investment platform that democratizes trading and empowers investors.

## Setup

1. Clone the repository:
```bash
git clone https://github.com/GauriV1/Click-MVP1.git
cd Click-MVP1
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
# Copy the environment template
cp .env.template .env

# Edit .env and add your API keys
# Required API keys:
# - REACT_APP_GROK_API_KEY: Get from x.ai
# - REACT_APP_FINNHUB_API_KEY: Get from finnhub.io
```

4. Start the development server:
```bash
npm start
```

## Environment Variables

The following environment variables are required:

- `REACT_APP_GROK_API_KEY`: API key for Grok AI services
- `REACT_APP_FINNHUB_API_KEY`: API key for Finnhub financial data

You can obtain these API keys from:
- Grok API key: [x.ai](https://x.ai)
- Finnhub API key: [finnhub.io](https://finnhub.io)

⚠️ **IMPORTANT**: Never commit your `.env` file or expose your API keys. The `.env` file is already added to `.gitignore`.

## Features

- AI-powered investment recommendations
- Real-time market data
- Personalized portfolio management
- Risk assessment and adjustments
- Educational resources

## Contributing

1. Create a new branch for your feature
2. Make your changes
3. Submit a pull request

## Security

- All API keys should be stored in environment variables
- Never commit sensitive credentials
- Use environment variables for all configuration
- Keep dependencies updated 