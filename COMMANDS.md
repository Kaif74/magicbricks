# Development Commands

# Install dependencies

npm install

# Development mode (with hot reload)

npm run dev

# Build for production

npm run build

# Start production server

npm start

# Run linting

npm run lint

# Clean build

rm -rf .next
npm run dev

# Install Puppeteer separately (if issues)

npm install puppeteer --ignore-scripts
npx puppeteer browsers install chrome

# Run on different port

npm run dev -- -p 3001

# Check for outdated packages

npm outdated

# Update packages

npm update
