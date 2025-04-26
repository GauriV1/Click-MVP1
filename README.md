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
3. Add your Grok API key (server-side only):
   ```
   GROK_API_KEY=your_grok_api_key_here
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

## API Keys
- `REACT_APP_GROK_API_KEY`: API key for Grok AI services (Get from x.ai)
- `REACT_APP_GROK_API_URL`: Base URL for Grok API (defaults to https://api.x.ai/v1)

## Feature Flags
- `REACT_APP_USE_FALLBACK_DATA`: Whether to use fallback data when API calls fail (true/false)

To set up your environment:
1. Copy `.env.template` to `.env`
2. Fill in your API keys
3. Never commit `.env` to version control

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

## API Proxy for Grok

To avoid CORS issues when calling the Grok API, we use a Vercel serverless function:

1. The frontend makes requests to `/api/grok` instead of directly to the Grok API
2. The Vercel serverless function (`/api/grok.js`) forwards these requests to the Grok API
3. The API key is stored server-side as `GROK_API_KEY` (without the REACT_APP_ prefix)
4. This approach prevents CORS errors and keeps the API key secure

### Deployment

When deploying to Vercel:

1. Set the `GROK_API_KEY` environment variable (without the REACT_APP_ prefix):
   ```
   vercel env add GROK_API_KEY production
   # → paste your Grok key
   
   vercel env add GROK_API_KEY preview
   # → paste your Grok key
   ```

2. Deploy your project:
   ```
   vercel --prod --force
   ```

3. The frontend will automatically use the serverless function endpoint
4. No changes to the frontend code are needed 