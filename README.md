# Windsurf Project - Music Card Game

A music-themed card game with a marketplace where players can buy and sell cards.

## Features

- User authentication
- Card management system
- Marketplace for buying and selling cards
- Music-themed cards with unique attributes

## Test Accounts

- Email: rockstar@test.com / Password: test123
- Email: jazz@test.com / Password: test123
- Email: beats@test.com / Password: test123

Each account starts with 20,000 gold and several cards.

## Development Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file with:
```
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
PORT=8080
```

3. Start the server:
```bash
npm start
```

4. Visit http://localhost:8080

## Deployment

This application is configured for deployment on Railway:

1. Required environment variables:
   - MONGODB_URI: MongoDB connection string
   - JWT_SECRET: Secret for JWT token generation
   - PORT: Provided by Railway

2. The application will automatically:
   - Serve static files from the public directory
   - Handle SPA routing
   - Connect to MongoDB
   - Start the Express server

## Scripts

- `npm start`: Start the production server
- `npm run dev`: Start development server with nodemon
- `node scripts/create_test_accounts.js`: Create test accounts and cards
- `node scripts/add_more_cards.js`: Add more cards to the marketplace
- `node scripts/discount_listings.js`: Apply 50% discount to all listings
