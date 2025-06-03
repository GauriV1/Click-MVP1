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

# Click - AI-Powered Investment Intelligence Platform

Click is an innovative investment platform that leverages advanced AI to provide personalized investment strategies and portfolio management. Built by Gauri Vaidya as part of YC W25 batch, Click aims to democratize access to sophisticated investment tools.

## Features

- AI-powered investment strategy generation
- Real-time market data integration
- Personalized risk assessment
- Interactive portfolio visualization
- Secure data handling with GDPR compliance

## Tech Stack

- React 18
- Node.js
- Grok AI API
- Finnhub Market Data API
- Chart.js for visualizations
- Material-UI components

## Getting Started

### Prerequisites

- Node.js 16.x or later
- npm 7.x or later
- Grok API key (for production)
- Finnhub API key (for production)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/click.git
cd click
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file in the root directory with the following variables:
```
REACT_APP_GROK_API_KEY=your_grok_api_key
REACT_APP_FINNHUB_API_KEY=your_finnhub_api_key
REACT_APP_USE_FALLBACK_DATA=true  # Set to false in production
```

4. Start the development server:
```bash
npm start
```

The app will be available at http://localhost:3000 (or http://localhost:3001 if port 3000 is in use).

### Development

- `npm start` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues
- `npm run clean` - Clear build cache

## Deployment

Click is configured for deployment on Vercel. Each push to the main branch will trigger an automatic deployment.

### Manual Deployment

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Deploy:
```bash
vercel
```

For production deployment:
```bash
vercel --prod
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| REACT_APP_GROK_API_KEY | Grok AI API key | Yes (prod) |
| REACT_APP_FINNHUB_API_KEY | Finnhub API key | Yes (prod) |
| REACT_APP_USE_FALLBACK_DATA | Use mock data | No |

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is proprietary and confidential. All rights reserved.

## Contact

Gauri Vaidya - [@gaurivaidya](https://twitter.com/gaurivaidya)

Project Link: [https://github.com/yourusername/click](https://github.com/yourusername/click) 