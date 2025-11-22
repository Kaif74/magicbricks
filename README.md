# MagicBricks Real Estate Scraper - Next.js Application

A Next.js application that scrapes real estate project listings from MagicBricks in real-time and displays them on an interactive map using the PositionStack API for geocoding.

## Features

- **Dynamic Routing**: `/city/[cityName]` pattern for accessing different cities
- **Real-Time Scraping**: Server-Sent Events (SSE) for incremental data loading
- **Interactive Map**: Leaflet.js integration with real-time marker updates
- **Geocoding**: PositionStack API integration with fallback mock coordinates
- **Responsive Design**: Mobile-friendly UI with Tailwind CSS
- **Type-Safe**: Built with TypeScript for better development experience

## Tech Stack

- **Framework**: Next.js 14
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Scraping**: Puppeteer + Cheerio
- **Maps**: React Leaflet
- **Icons**: Lucide React

## Project Structure

```
magicbricks/
├── src/
│   ├── components/
│   │   ├── Map.tsx              # Interactive map component
│   │   └── ProjectCard.tsx      # Project listing card
│   ├── config/
│   │   └── cities.ts            # City configurations
│   ├── pages/
│   │   ├── api/
│   │   │   ├── scrape.ts        # One-time scraping endpoint
│   │   │   ├── stream-scrape.ts # Real-time streaming endpoint
│   │   │   └── geocode.ts       # Geocoding endpoint
│   │   ├── city/
│   │   │   └── [cityName].tsx   # Dynamic city dashboard
│   │   ├── _app.tsx             # Next.js app wrapper
│   │   ├── _document.tsx        # HTML document structure
│   │   └── index.tsx            # Home page
│   ├── styles/
│   │   └── globals.css          # Global styles
│   └── types/
│       └── index.ts             # TypeScript type definitions
├── scraper.js                   # Original Express scraper (legacy)
├── next.config.js
├── tailwind.config.js
├── tsconfig.json
└── package.json
```

## Installation

1. **Clone the repository** (if applicable) or ensure you're in the project directory:

   ```bash
   cd c:\Users\Kaifa\JS\magicbricks
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Set up PositionStack API** (Optional but recommended):
   - Sign up at [PositionStack](https://positionstack.com)
   - Get your free API key
   - The app will prompt you to enter the key when you visit a city dashboard

## Running the Application

### Development Mode

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

### Production Build

```bash
npm run build
npm start
```

## Usage

1. **Home Page** (`/`):

   - Select a popular city from the grid
   - Or enter a custom city name
   - Click "Explore" to navigate to the city dashboard

2. **City Dashboard** (`/city/[cityName]`):

   - Watch as properties are scraped in real-time
   - Properties appear incrementally on the left panel
   - Each property is automatically geocoded and added to the map
   - Click on a project card to highlight it on the map
   - Click on a map marker to scroll to the corresponding project card

3. **API Key Management**:
   - Click the "Add API Key" button in the header
   - Enter your PositionStack API key
   - Key is stored in localStorage for future use
   - Without a key, coordinates are mocked near the city center

## API Routes

### GET `/api/scrape?cityName=[city]`

Returns all scraped properties at once.

**Response**:

```json
[
  {
    "projectName": "Example Project",
    "location": "Example Location",
    "priceRange": "₹ 50L - 1Cr",
    "bhkPossession": "2, 3 BHK",
    "imageUrl": "https://...",
    "amenitiesCount": "25"
  }
]
```

### GET `/api/stream-scrape?cityName=[city]`

Streams scraped properties incrementally using Server-Sent Events.

**Response** (SSE):

```
data: {"id":"project-123","name":"Example","location":"...","status":"Scraped",...}

data: {"id":"project-124","name":"Example 2",...}

data: [DONE]
```

### POST `/api/geocode`

Geocodes a location using PositionStack API.

**Request**:

```json
{
  "location": "Gachibowli",
  "cityName": "Hyderabad",
  "apiKey": "your_api_key"
}
```

**Response**:

```json
{
  "lat": 17.4399,
  "lng": 78.3489,
  "mocked": false
}
```

## Configuration

### Supported Cities

Default cities are configured in `src/config/cities.ts`:

- Hyderabad
- Bangalore
- Mumbai
- Delhi
- Pune
- Chennai
- Kolkata
- Ahmedabad
- Gurgaon
- Noida

You can add more cities or enter custom city names directly.

### Tailwind Configuration

Customize colors and styles in `tailwind.config.js`. The default brand color is blue (brand-600).

## Environment Variables

While the app doesn't require environment variables, you can optionally set:

```env
NEXT_PUBLIC_POSITIONSTACK_API_KEY=your_api_key_here
```

Then modify the code to read from `process.env.NEXT_PUBLIC_POSITIONSTACK_API_KEY`.

## Troubleshooting

### Puppeteer Issues

If Puppeteer fails to launch:

- Ensure you have the required dependencies for headless Chrome
- On Windows, it should work out of the box
- On Linux, you may need: `apt-get install -y chromium-browser`

### Map Not Loading

- Ensure Leaflet CSS is properly loaded
- Check browser console for errors
- The map component is dynamically imported (client-side only)

### Scraping Failures

- MagicBricks may block requests if too many are made
- The site structure may change (update selectors in API routes)
- Check network connectivity

## Future Enhancements

- [ ] Add filtering and sorting options
- [ ] Implement property comparison feature
- [ ] Add user authentication for saving favorites
- [ ] Export data to CSV/Excel
- [ ] Add more detailed property information
- [ ] Implement caching for scraped data
- [ ] Add error boundaries for better error handling

## License

This project is for educational purposes only. Please respect MagicBricks' terms of service and robots.txt when scraping.

## Contributing

Feel free to submit issues and enhancement requests!

---

**Note**: This application scrapes data from MagicBricks.com. Please ensure you comply with their terms of service and use this responsibly.
