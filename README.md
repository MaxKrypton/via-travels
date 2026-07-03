# Via Travels

Via Travels is a Rwanda travel and hotel booking mobile app. It includes a React Native Expo frontend and a Node.js/Express TypeScript backend with PostgreSQL, hotel booking, payments, tourism entries, AI itinerary generation, hotel media, room pricing, and Explore video reels.

Repository: https://github.com/MaxKrypton/via-travels

## Demo Video

Watch the Via Travels demo here: https://youtu.be/Evl1dWp0OTw

## Table Of Contents

- [Demo Video](#demo-video)
- [Project Structure](#project-structure)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [1. Clone The Repository](#1-clone-the-repository)
- [2. Backend Setup](#2-backend-setup)
- [3. Database Setup](#3-database-setup)
- [4. Seed Data](#4-seed-data)
- [5. Run The Backend](#5-run-the-backend)
- [6. Frontend Setup](#6-frontend-setup)
- [7. Run The Mobile App](#7-run-the-mobile-app)
- [8. Verify Everything Works](#8-verify-everything-works)
- [Useful Scripts](#useful-scripts)
- [Environment Variables](#environment-variables)
- [Common Problems](#common-problems)
- [Main API Routes](#main-api-routes)

## Project Structure

```text
via-travels/
  Backend/
    index.ts                         # Express server entrypoint
    package.json                     # Backend scripts and dependencies
    drizzle.config.ts                # Drizzle migration config
    scripts/                         # SQL and TypeScript seed scripts
    src/
      routes/                        # Express route definitions
      repository/                    # Database/business logic
      services/                      # Route service layer
      middleware/                    # Auth and role middleware
      utils/config/schema.ts         # Drizzle database schema
  Frontend/
    package.json                     # Expo app scripts and dependencies
    services/
      api.js                         # API client
      config.js                      # API URL resolution
    screens/                         # App screens
    components/                      # Reusable UI components
    context/                         # Auth context and app state
    assets/                          # Images, videos, reels
```

## Tech Stack

| Area | Technology |
| --- | --- |
| Mobile app | React Native, Expo |
| Navigation | React Navigation |
| Backend | Node.js, Express, TypeScript |
| Database | Neon PostgreSQL |
| ORM/migrations | Drizzle ORM, drizzle-kit |
| Auth | JWT, bcrypt, Expo SecureStore |
| File storage | AWS S3 |
| Payments | Flutterwave |
| Email | Mailjet, optional Gmail SMTP |
| AI itinerary generation | Anthropic Claude API |

## Prerequisites

Install these before starting:

1. Node.js 18 or newer
2. npm
3. Git
4. Expo Go on your phone, or Android Studio / Xcode simulator
5. A Neon PostgreSQL database
6. AWS S3 bucket and access keys if you want media/video uploads
7. Flutterwave keys if you want payment flows
8. Mailjet or email credentials if you want email verification flows
9. Anthropic API key if you want AI itinerary generation

Check your local versions:

```bash
node -v
npm -v
git --version
```

## 1. Clone The Repository

```bash
git clone https://github.com/MaxKrypton/via-travels.git
cd via-travels
```

This repository has two separate Node projects:

- `Backend`
- `Frontend`

Install and run them separately.

## 2. Backend Setup

Go into the backend folder:

```bash
cd Backend
```

Install backend dependencies:

```bash
npm install
```

Create the backend environment file:

```bash
touch .env
```

Add this template to `Backend/.env` and replace the placeholder values:

```env
NEON_DATABASE_URL=postgresql://USER:PASSWORD@HOST/DATABASE?sslmode=require
PORT=8000
NODE_ENV=development

SALT_ROUNDS=10
ACCESS_TOKEN_SECRET=replace_with_a_long_random_secret

AWS_ACCESS_KEY_ID=replace_with_aws_access_key
AWS_SECRET_ACCESS_KEY=replace_with_aws_secret_key
AWS_REGION=replace_with_bucket_region
AWS_BUCKET_NAME=replace_with_bucket_name

ANTHROPIC_API_KEY=replace_with_anthropic_api_key

FLW_PUBLIC_KEY=replace_with_flutterwave_public_key
FLW_SECRET_KEY=replace_with_flutterwave_secret_key
FLW_ENCRYPTION_KEY=replace_with_flutterwave_encryption_key
FLUTTERWAVE_API_URL=https://api.flutterwave.com/v3/payments
FLUTTERWAVE_PAYMENT_VERIFICATION_URL=https://api.flutterwave.com/v3/transactions

FROM_EMAIL=verified_sender@example.com
Node_MailJet_APIKEY_PUBLIC=replace_with_mailjet_public_key
Node_MailJet_APIKEY_PRIVATE=replace_with_mailjet_private_key
MAILJET_SENDER_NAME=Via Travels

EMAIL_USER=optional_gmail_address
EMAIL_PASSWORD=optional_gmail_app_password
COMPLAINTS_EMAIL=support@example.com
```

Notes:

- `NEON_DATABASE_URL` is required for migrations, seeds, and the API.
- `ACCESS_TOKEN_SECRET` is required for login sessions.
- `AWS_*` values are required for uploading hotel media and video reels.
- `ANTHROPIC_API_KEY` is required for AI itinerary generation.
- Flutterwave values are required for payment checkout.
- Mailjet values are used for email sending/verification.

## 3. Database Setup

From `Backend`, push the Drizzle schema to your Neon database:

```bash
npm run dbMigrate
```

This uses:

```text
Backend/drizzle.config.ts
Backend/src/utils/config/schema.ts
```

If the migration fails, check:

- `Backend/.env` exists
- `NEON_DATABASE_URL` is correct
- your Neon database is reachable
- SSL is enabled in the connection string

## 4. Seed Data

The app works best with hotels, rooms, prices, tourism entries, media, and video reels.

Run these from the `Backend` folder.

### Seed Hotels

```bash
npm run seed:hotels
```

Optional AHAIC hotel seed:

```bash
npm run seed:ahaic
```

### Seed Tourism Entries

```bash
npm run seed:tourism
```

This seeds Rwanda tourism entries used by browsing and AI itinerary generation.

### Seed Rooms And Prices

```bash
npm run seed:rooms
```

This creates room types and room prices for active hotels. It creates common room categories such as standard rooms, deluxe rooms, suites, lodge rooms, and apartments depending on hotel type.

### Seed Explore Reels

Put video files in:

```text
Frontend/assets/reels/
```

Then run:

```bash
npm run seed:reels
```

This uploads local reel videos to S3 and assigns them randomly to active hotels so they appear in the Explore tab.

AWS credentials must be configured before running this command.

## 5. Run The Backend

For development:

```bash
npm run dev
```

The API should start at:

```text
http://localhost:8000
```

Health check:

```bash
curl http://localhost:8000/health
```

API test route:

```bash
curl http://localhost:8000/api/v1/test
```

For production-style local run:

```bash
npm run build
npm start
```

## 6. Frontend Setup

Open a second terminal from the repository root:

```bash
cd Frontend
```

Install frontend dependencies:

```bash
npm install
```

Create the frontend environment file:

```bash
touch .env
```

Add:

```env
EXPO_PUBLIC_API_URL=http://YOUR_COMPUTER_IP:8000/api/v1
EXPO_PUBLIC_ITINERARY_TIMEOUT_MS=300000
```

Optional:

```env
EXPO_PUBLIC_API_TIMEOUT_MS=15000
```

### Choosing The Correct API URL

Use one of these:

```text
Physical phone on same Wi-Fi: http://YOUR_COMPUTER_IP:8000/api/v1
iOS simulator:              http://localhost:8000/api/v1
Android emulator:           http://10.0.2.2:8000/api/v1
```

Find your computer IP:

macOS:

```bash
ipconfig getifaddr en0
```

Windows:

```bash
ipconfig
```

Linux:

```bash
hostname -I
```

The frontend also has automatic development URL fallback in `Frontend/services/config.js`, but setting `EXPO_PUBLIC_API_URL` explicitly is clearer.

## 7. Run The Mobile App

From `Frontend`:

```bash
npm start
```

or:

```bash
npx expo start --clear
```

Then choose one:

- Scan the QR code with Expo Go on a physical phone.
- Press `a` for Android emulator.
- Press `i` for iOS simulator on macOS.
- Press `w` for web preview.

Native build commands are also available:

```bash
npm run android
npm run ios
npm run web
```

For most development work, use `npm start` / Expo Go first.

## 8. Verify Everything Works

### Backend

```bash
curl http://localhost:8000/health
curl http://localhost:8000/api/v1/test
curl http://localhost:8000/api/v1/tourism/entries
curl http://localhost:8000/api/v1/hotels/all-hotels
curl http://localhost:8000/api/v1/content/videos/all
```

### Frontend

1. Start the backend.
2. Start Expo.
3. Open the app.
4. Register or log in.
5. Check these screens:
   - Home: hotels and sponsored posts load
   - Search: hotel search works
   - Explore: video reels load
   - Plan: itinerary/tourism features load
   - Profile: account screens open

### Database

You can verify seeded room coverage with a query like:

```sql
SELECT
  COUNT(*) AS active_hotels,
  COALESCE(SUM(room_count), 0) AS rooms,
  COALESCE(SUM(price_count), 0) AS prices,
  COUNT(*) FILTER (WHERE room_count = 0) AS hotels_without_rooms
FROM (
  SELECT
    h.id,
    COUNT(DISTINCT r.id) AS room_count,
    COUNT(DISTINCT rp.id) AS price_count
  FROM hotels h
  LEFT JOIN room r ON r.hotel_id = h.id
  LEFT JOIN room_pricing rp ON rp."roomTypeId" = r.id
  WHERE h.hotel_status = 'active'
  GROUP BY h.id
) s;
```

## Useful Scripts

Run backend scripts from `Backend`.

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start backend in development mode |
| `npm run build` | Compile TypeScript to `dist` |
| `npm start` | Run compiled backend from `dist` |
| `npm run dbMigrate` | Push Drizzle schema to database |
| `npm run dbGenerate` | Generate Drizzle migrations |
| `npm run seed:hotels` | Seed hotel data from SQL |
| `npm run seed:ahaic` | Seed AHAIC hotel data |
| `npm run seed:tourism` | Seed tourism entries |
| `npm run seed:rooms` | Seed hotel room types and prices |
| `npm run seed:reels` | Upload local reels to S3 and create video rows |
| `npm run lint` | Run backend lint |
| `npm run test` | Run backend tests |

Run frontend scripts from `Frontend`.

| Command | Purpose |
| --- | --- |
| `npm start` | Start Expo dev server |
| `npm run android` | Build/run Android app |
| `npm run ios` | Build/run iOS app |
| `npm run web` | Start Expo web |

## Environment Variables

### Backend Variables

| Variable | Required | Used For |
| --- | --- | --- |
| `NEON_DATABASE_URL` | Yes | PostgreSQL connection |
| `PORT` | Yes | Backend port, usually `8000` |
| `NODE_ENV` | Recommended | Runtime environment |
| `SALT_ROUNDS` | Yes | Password hashing |
| `ACCESS_TOKEN_SECRET` | Yes | JWT auth |
| `AWS_ACCESS_KEY_ID` | For uploads | S3 upload/streaming |
| `AWS_SECRET_ACCESS_KEY` | For uploads | S3 upload/streaming |
| `AWS_REGION` | For uploads | S3 upload/streaming |
| `AWS_BUCKET_NAME` | For uploads | S3 upload/streaming |
| `ANTHROPIC_API_KEY` | For AI | Itinerary generation |
| `FLW_PUBLIC_KEY` | For payments | Flutterwave checkout |
| `FLW_SECRET_KEY` | For payments | Flutterwave checkout/verification |
| `FLW_ENCRYPTION_KEY` | For payments | Flutterwave payment support |
| `FLUTTERWAVE_API_URL` | For payments | Flutterwave API |
| `FLUTTERWAVE_PAYMENT_VERIFICATION_URL` | For payments | Payment verification |
| `FROM_EMAIL` | For email | Sender email |
| `Node_MailJet_APIKEY_PUBLIC` | For email | Mailjet |
| `Node_MailJet_APIKEY_PRIVATE` | For email | Mailjet |
| `MAILJET_SENDER_NAME` | For email | Sender display name |
| `EMAIL_USER` | Optional | Gmail SMTP fallback |
| `EMAIL_PASSWORD` | Optional | Gmail SMTP fallback |
| `COMPLAINTS_EMAIL` | Optional | Complaint/report emails |

### Frontend Variables

| Variable | Required | Used For |
| --- | --- | --- |
| `EXPO_PUBLIC_API_URL` | Recommended | Backend API base URL |
| `EXPO_PUBLIC_API_TIMEOUT_MS` | Optional | General API timeout |
| `EXPO_PUBLIC_ITINERARY_TIMEOUT_MS` | Optional | AI itinerary timeout |

## Common Problems

### Backend cannot connect to database

Check:

```bash
cd Backend
cat .env
```

Make sure `NEON_DATABASE_URL` exists and points to the right Neon database.

### Frontend cannot reach backend

Make sure the backend is running:

```bash
curl http://localhost:8000/health
```

If you are using a physical phone, `localhost` will not point to your computer. Use your computer's LAN IP:

```env
EXPO_PUBLIC_API_URL=http://192.168.x.x:8000/api/v1
```

Make sure phone and computer are on the same Wi-Fi.

### Android emulator cannot reach backend

Use:

```env
EXPO_PUBLIC_API_URL=http://10.0.2.2:8000/api/v1
```

### Explore videos do not load

Check:

1. Backend is running.
2. `GET /api/v1/content/videos/all` returns rows.
3. `video_url` values are reachable S3 URLs.
4. AWS bucket objects are public or streamable by your backend.
5. Run `npm run seed:reels` after adding files to `Frontend/assets/reels`.

### Hotel profile has no rooms or prices

Run:

```bash
cd Backend
npm run seed:rooms
```

Then check:

```bash
curl http://localhost:8000/api/v1/hotels/all-hotels
```

### Itinerary generation times out

Increase:

```env
EXPO_PUBLIC_ITINERARY_TIMEOUT_MS=300000
```

Also confirm `ANTHROPIC_API_KEY` exists in `Backend/.env`.

### Email verification blocks login

The backend expects verified emails. In development, you can verify from the email link if Mailjet is configured. If email is not configured, update the test user's `email_verified` value in the database manually.

### Port 8000 is already in use

Change `PORT` in `Backend/.env`, then update `EXPO_PUBLIC_API_URL` in `Frontend/.env` to match.

## Main API Routes

Base URL:

```text
http://localhost:8000/api/v1
```

### Health And Test

| Method | Route | Description |
| --- | --- | --- |
| `GET` | `/health` | Backend health check, no `/api/v1` prefix |
| `GET` | `/api/v1/test` | API test route |

### Auth

| Method | Route | Description |
| --- | --- | --- |
| `POST` | `/auth/register` | Register customer |
| `POST` | `/auth/register/via-admin` | Register admin |
| `POST` | `/auth/login` | Login |
| `POST` | `/auth/forgot-password` | Request password reset |
| `POST` | `/auth/reset-password/:resetToken` | Reset password |
| `POST` | `/auth/verify-email/:verifyToken` | Verify email |

### Hotels

| Method | Route | Description |
| --- | --- | --- |
| `GET` | `/hotels/all-hotels` | List hotels |
| `GET` | `/hotels/profile/:hotelId` | Get hotel profile |
| `POST` | `/hotels/register` | Register hotel |
| `PATCH` | `/hotels/update/:hotelId` | Update hotel |
| `DELETE` | `/hotels/delete/:hotelId` | Delete hotel |

### Rooms And Pricing

| Method | Route | Description |
| --- | --- | --- |
| `GET` | `/hotels/rooms/:hotelId` | Get room types for hotel |
| `POST` | `/hotels/rooms/register/:hotelId` | Create room type |
| `PATCH` | `/hotels/rooms/update/:hotelId/:roomTypeId` | Update room type |
| `DELETE` | `/hotels/rooms/delete/:hotelId/:roomTypeId` | Delete room type |
| `GET` | `/hotels/availability/roomPricing/:roomTypeId` | Get room price |
| `POST` | `/hotels/availability/roomPricing/:roomTypeId` | Create room price |
| `POST` | `/hotels/availability/roomAvailability/:roomTypeId` | Check room availability |

### Bookings

| Method | Route | Description |
| --- | --- | --- |
| `POST` | `/hotels/booking/create/:hotelId` | Create booking |
| `GET` | `/hotels/booking/:bookingId/verify-payment` | Verify booking payment |
| `GET` | `/my-bookings` | Get current user's bookings |

### Tourism And Itinerary

| Method | Route | Description |
| --- | --- | --- |
| `GET` | `/tourism/entries` | List tourism entries |
| `POST` | `/tourism/itinerary/generate` | Generate AI itinerary |
| `GET` | `/tourism/itinerary/saved` | Get saved itineraries |

### Content Videos

| Method | Route | Description |
| --- | --- | --- |
| `GET` | `/content/videos/all` | Get Explore feed videos |
| `POST` | `/content/videos/upload/:hotelId` | Upload hotel video |
| `GET` | `/content/videos/hotel/:hotelId` | Get videos for hotel |

## Recommended First-Time Setup Order

Use this exact order for a fresh machine:

```bash
git clone https://github.com/MaxKrypton/via-travels.git
cd via-travels

cd Backend
npm install
touch .env
# Fill Backend/.env
npm run dbMigrate
npm run seed:hotels
npm run seed:tourism
npm run seed:rooms
# Optional, requires AWS and local reels:
# npm run seed:reels
npm run dev
```

In another terminal:

```bash
cd via-travels/Frontend
npm install
touch .env
# Fill Frontend/.env
npm start
```

At this point, open the app in Expo Go or a simulator.
