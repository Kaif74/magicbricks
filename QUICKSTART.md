# Quick Start Guide

## Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Windows PowerShell (already available)

## Installation Steps

### 1. Install Dependencies

Open a terminal in the project directory and run:

```bash
npm install
```

This will install:

- Next.js and React
- TypeScript
- Tailwind CSS
- Puppeteer (for web scraping)
- Cheerio (for HTML parsing)
- Leaflet & React Leaflet (for maps)
- Lucide React (for icons)

### 2. Get PositionStack API Key (Optional but Recommended)

1. Visit https://positionstack.com
2. Sign up for a free account
3. Copy your API access key
4. You'll enter this in the app's UI when you visit a city dashboard

### 3. Start Development Server

```bash
npm run dev
```

The application will start at `http://localhost:3000`

## First-Time Usage

1. Open http://localhost:3000 in your browser
2. Select a city (e.g., Hyderabad) or enter a custom city name
3. Click "Explore [City] Projects"
4. Watch as properties are scraped in real-time
5. Click the "Add API Key" button in the header to add your PositionStack key
6. Properties will be plotted on the map as they're geocoded

## Troubleshooting

### Port Already in Use

If port 3000 is busy:

```bash
npm run dev -- -p 3001
```

### Puppeteer Installation Issues

If Puppeteer fails to install:

```bash
npm install puppeteer --ignore-scripts
```

Then manually download Chrome:

```bash
npx puppeteer browsers install chrome
```

### Build Errors

Clear the Next.js cache:

```bash
rm -rf .next
npm run dev
```

## Production Deployment

### Build for Production

```bash
npm run build
npm start
```

### Deploy to Vercel

```bash
npm install -g vercel
vercel
```

Note: Puppeteer may not work on Vercel's free tier. Consider using:

- AWS Lambda with Puppeteer layers
- Railway.app
- DigitalOcean App Platform
- Your own VPS

## Key Features to Test

✅ **Home Page**

- City selection grid
- Custom city input
- Navigation to city dashboard

✅ **City Dashboard**

- Real-time scraping with progress indicator
- Incremental property loading
- Interactive map with markers
- Project card selection
- API key management

✅ **API Routes**

- `/api/scrape?cityName=Hyderabad` - Batch scraping
- `/api/stream-scrape?cityName=Hyderabad` - Streaming scraping
- `/api/geocode` - Location geocoding

## Next Steps

1. Customize the cities in `src/config/cities.ts`
2. Adjust the Tailwind theme in `tailwind.config.js`
3. Modify scraping selectors in `src/pages/api/scrape.ts` if MagicBricks changes their HTML structure
4. Add caching with Redis or a database
5. Implement user authentication for saved searches

Enjoy exploring real estate data! 🏠
