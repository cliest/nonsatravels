# Nonsa Travels - Backend API

Backend server for the Nonsa Travels hotel booking platform built with Node.js, Express, PostgreSQL, and Prisma.

## Features

- ✅ RESTful API with Express.js
- ✅ PostgreSQL database with Prisma ORM
- ✅ Hotel management (CRUD operations)
- ✅ Booking system with status management
- ✅ Review and rating system
- ✅ Exclusive offers management
- ✅ Search and filtering
- ✅ CORS enabled for frontend integration
- ✅ Environment-based configuration

## Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (local or hosted)
- npm or yarn

## Installation

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file:
```bash
cp .env.example .env
```

3. Update `.env` with your configuration:
```env
PORT=5000
DATABASE_URL=postgresql://user:password@localhost:5432/nonsatravels
CLIENT_URL=http://localhost:5173
```

## Database Setup

1. Make sure PostgreSQL is running and `DATABASE_URL` in `.env` points to it.
2. Apply the Prisma schema:
```bash
npx prisma migrate deploy
# or, during development:
npx prisma db push
```

## Seeding the Database

Populate the database with sample data:
```bash
npm run seed
```

This will create:
- 5 sample hotels
- 3 exclusive offers

## Running the Server

### Development mode (with auto-reload):
```bash
npm run dev
```

### Production mode:
```bash
npm start
```

Server will run on `http://localhost:5000`

## API Endpoints

### Hotels
- `GET /api/hotels` - Get all hotels (with query filters)
- `GET /api/hotels/:id` - Get single hotel
- `GET /api/hotels/featured` - Get featured hotels
- `POST /api/hotels` - Create new hotel (Admin)
- `PUT /api/hotels/:id` - Update hotel (Admin)
- `DELETE /api/hotels/:id` - Delete hotel (Admin)
- `PATCH /api/hotels/:id/featured` - Toggle featured status (Admin)

### Bookings
- `GET /api/bookings` - Get all bookings
- `GET /api/bookings/:id` - Get single booking
- `GET /api/bookings/stats` - Get booking statistics (Admin)
- `POST /api/bookings` - Create new booking
- `PATCH /api/bookings/:id/status` - Update booking status (Admin)
- `DELETE /api/bookings/:id` - Cancel booking

### Reviews
- `GET /api/reviews/hotel/:hotelId` - Get hotel reviews
- `POST /api/reviews` - Create review
- `PUT /api/reviews/:id` - Update review
- `DELETE /api/reviews/:id` - Delete review
- `PATCH /api/reviews/:id/helpful` - Mark review as helpful

### Offers
- `GET /api/offers` - Get all active offers
- `POST /api/offers` - Create offer (Admin)
- `PUT /api/offers/:id` - Update offer (Admin)
- `DELETE /api/offers/:id` - Delete offer (Admin)

### Health Check
- `GET /api/health` - Server health status

## Query Parameters

### Hotels
- `city` - Filter by city
- `search` - Text search in name, city, address
- `roomType` - Filter by room type
- `minPrice` - Minimum price per night
- `maxPrice` - Maximum price per night
- `sortBy` - Sort options: `priceAsc`, `priceDesc`, `ratingDesc`

### Bookings
- `userId` - Filter by user ID
- `status` - Filter by status (pending, confirmed, completed, cancelled)

## Project Structure

```
server/
├── prisma/
│   └── schema.prisma         # Database schema
├── src/
│   ├── config/
│   │   └── database.js       # Prisma connection
│   ├── lib/
│   │   └── prisma.js          # Prisma client
│   ├── controllers/
│   │   ├── hotelController.js
│   │   ├── bookingController.js
│   │   ├── reviewController.js
│   │   └── offerController.js
│   ├── routes/
│   │   ├── hotelRoutes.js
│   │   ├── bookingRoutes.js
│   │   ├── reviewRoutes.js
│   │   └── offerRoutes.js
│   ├── server.js             # Main server file
│   └── seed.js               # Database seeder
├── .env                      # Environment variables
├── .env.example              # Environment template
├── package.json
└── README.md
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 5000 |
| `NODE_ENV` | Environment | development |
| `DATABASE_URL` | PostgreSQL connection string | postgresql://user:password@localhost:5432/nonsatravels |
| `CLIENT_URL` | Frontend URL for CORS | http://localhost:5173 |
| `CLERK_PUBLISHABLE_KEY` | Clerk publishable key | - |
| `CLERK_SECRET_KEY` | Clerk secret key | - |

## License

MIT
