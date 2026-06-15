# Via Travels 🇷🇼

**A smart Rwanda tourism mobile app powered by AI — generating personalized, day-by-day travel itineraries using RAG (Retrieval-Augmented Generation).**

Capstone Project — BSc Software Engineering, African Leadership University
**Student:** Alain Quentin Rurangirwa

---

## GitHub Repository

🔗 [https://github.com/MaxKrypton/via-travels](https://github.com/MaxKrypton/via-travels)

---

## Description

Rwanda's tourism sector is fragmented. Travelers must consult multiple websites (Visit Rwanda, Google Maps, TripAdvisor, RDB) just to plan a single trip — with no unified, locally-aware platform to guide them.

**Via Travels** solves this by combining a curated database of Rwanda tourism entries with Claude AI to generate complete, personalized itineraries in under 60 seconds. Each itinerary includes:

- Day-by-day schedules with timing
- Real prices in both **USD and RWF**
- Verified phone numbers and contacts
- Transport recommendations
- Accommodation suggestions matched to the user's budget

The app also lets users browse 26 verified Rwanda attractions, activities, permits, and accommodations — all filterable by category.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Mobile Frontend | React Native + Expo |
| Backend | Node.js + Express + TypeScript |
| Database | Neon PostgreSQL (via Drizzle ORM) |
| AI Engine | Anthropic Claude API (RAG pattern) |
| Auth | JWT + bcrypt + expo-secure-store |
| Navigation | React Navigation v7 (Stack + Bottom Tabs) |

---

## Setting Up the Environment

### Prerequisites

- Node.js v18+
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- A Neon PostgreSQL database
- An Anthropic API key

---

### Backend Setup

```bash
# 1. Clone the repo
git clone https://github.com/MaxKrypton/via-travels.git
cd via-travels/Backend

# 2. Install dependencies
npm install

# 3. Create your .env file
cp .env.example .env
```

Fill in your `.env`:

```env
NEON_DATABASE_URL=your_neon_connection_string
ANTHROPIC_API_KEY=your_anthropic_api_key
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d
ACCESS_TOKEN_SECRET=your_access_token_secret
PORT=8000
```

```bash
# 4. Run database migrations
npm run dbMigrate

# 5. Seed the Rwanda tourism data (26 entries)
node scripts/seed-tourism.js

# 6. Start the development server
npm run dev
```

The backend will be running at `http://localhost:8000`.

> **Note:** New user accounts require email verification. For development, manually set `email_verified = true` in the Neon dashboard SQL editor after registering.

---

### Frontend Setup

```bash
cd via-travels/Frontend

# 1. Install dependencies
npm install

# 2. Create your .env file
touch .env
```

Add to `.env`:

```env
EXPO_PUBLIC_API_URL=http://YOUR_LOCAL_IP:8000/api/v1
EXPO_PUBLIC_ITINERARY_TIMEOUT_MS=120000
```

> Find your local IP with `ipconfig getifaddr en0` (Mac) or `ipconfig` (Windows).
> On Android emulator use `10.0.2.2` instead of your IP.

```bash
# 3. Start Expo
npx expo start --clear
```

Scan the QR code with the **Expo Go** app on your phone, or press `a` for Android emulator / `i` for iOS simulator.

---

## Database Schema

Via Travels adds two tables on top of the existing backend schema:

### `tourism_entries`

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| name | VARCHAR | Place/service name |
| category | ENUM | accommodation, attraction, activity, transport, permit |
| description | TEXT | Full description |
| location | VARCHAR | Location in Rwanda |
| price_usd | INTEGER | Price in USD |
| price_rwf | INTEGER | Price in Rwandan Francs |
| contact | VARCHAR | Phone number or email |
| created_by | UUID | FK → users table |
| created_at | TIMESTAMP | Auto-set on insert |

### `itineraries`

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | FK → users table |
| itinerary | TEXT | Full AI-generated markdown itinerary |
| created_at | TIMESTAMP | Auto-set on insert |

---

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/register` | Register new user |
| POST | `/api/v1/auth/login` | Login, returns JWT |

### Tourism (Via Travels Core)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/v1/tourism/entries` | Public | Get all Rwanda tourism entries |
| GET | `/api/v1/tourism/entries?category=attraction` | Public | Filter by category |
| POST | `/api/v1/tourism/itinerary/generate` | Required | Generate AI itinerary |
| GET | `/api/v1/tourism/itinerary/saved` | Required | Get user's saved itineraries |
| POST | `/api/v1/tourism/entries` | Admin | Create a tourism entry |
| PATCH | `/api/v1/tourism/entries/:id` | Admin | Update a tourism entry |
| DELETE | `/api/v1/tourism/entries/:id` | Admin | Delete a tourism entry |

### Generate Itinerary — Request Body
```json
{
  "travelDates": "July 10 - July 13 2025",
  "budget": "500 USD",
  "groupSize": 2,
  "durationDays": 3,
  "interests": ["wildlife", "culture", "nature"]
}
```

---

## Backend Code Highlights

### RAG Itinerary Generation (`Tourism.entries.ts`)

The core AI feature — fetches all tourism entries from the database, builds them into a context block, and sends them to Claude along with the user's preferences:

```typescript
async generateItinerary(req: Request): Promise<DataResponse> {
  const { travelDates, budget, groupSize, durationDays, interests } = req.body;
  const userId = req.user?.id;

  // Step 1: Retrieve — fetch all verified Rwanda tourism data
  const entries = await database.select().from(tourismEntries);

  // Step 2: Build context for the AI
  const context = entries.map(e =>
    `[${e.category.toUpperCase()}] ${e.name} | ${e.location} | $${e.price_usd} / ${e.price_rwf} RWF | ${e.description} | Contact: ${e.contact}`
  ).join('\n');

  // Step 3: Augment — inject into Claude prompt
  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 4000,
    messages: [{
      role: 'user',
      content: `You are a Rwanda tourism expert. Using ONLY the verified entries below, 
      create a ${durationDays}-day itinerary for ${groupSize} travelers in ${travelDates} 
      with a ${budget} budget, interested in: ${interests.join(', ')}.
      
      VERIFIED RWANDA TOURISM DATA:
      ${context}
      
      Include real prices in both USD and RWF, phone numbers, and transport tips.`,
    }],
  });

  // Step 4: Save to database
  const itineraryText = message.content[0].text;
  const [saved] = await database.insert(itineraries)
    .values({ userId, itinerary: itineraryText })
    .returning();

  return { data: saved, status: 201, message: 'Itinerary generated successfully' };
}
```

---

## Frontend Code Highlights

### Dynamic API URL Resolution (`services/config.js`)

Automatically resolves the correct backend URL depending on whether the app is running on a physical device, Android emulator, or iOS simulator:

```javascript
const getExpoHost = () => {
  const hostUri =
    Constants.expoConfig?.hostUri ||
    Constants.manifest2?.extra?.expoClient?.hostUri;
  return hostUri ? hostUri.split(':')[0] : null;
};

const getDevelopmentApiUrl = () => {
  if (Platform.OS === 'android') return buildApiUrl('10.0.2.2');
  if (Constants.isDevice && expoHost) return buildApiUrl(expoHost);
  return buildApiUrl('localhost');
};
```

### Itinerary Markdown Renderer (`screens/ItineraryScreen.js`)

Parses and renders the AI-generated markdown itinerary into native React Native components:

```javascript
const ItineraryText = ({ text }) => {
  const lines = text.split('\n');
  return (
    <View>
      {lines.map((line, i) => {
        const trimmed = line.trim();
        if (trimmed.startsWith('## '))
          return <Text key={i} style={styles.itH2}>{trimmed.replace(/^## /, '')}</Text>;
        if (trimmed.startsWith('> '))
          return (
            <View key={i} style={styles.itQuote}>
              <Text style={styles.itQuoteText}>{trimmed.replace(/^> /, '')}</Text>
            </View>
          );
        // ... handles headings, bullets, tables, dividers
      })}
    </View>
  );
};
```

---

## App Screens

| Screen | Description |
|--------|-------------|
| Welcome / Sign In / Sign Up | Auth flow with JWT |
| Home | Hotel listings and sponsored posts |
| Plan (Itinerary) | AI trip planner — the core feature |
| Saved Itineraries | Previously generated itineraries |
| Explore Rwanda | Browse 26 tourism entries with filters |
| Profile | User settings and account management |

---

## Deployment Plan

### Current (Development)
- Backend running locally via `npm run dev` (nodemon + TypeScript)
- Frontend on Expo Go via local network
- Database hosted on **Neon** (cloud PostgreSQL — already live)

### Production Plan
| Service | Platform | Notes |
|---------|----------|-------|
| Backend API | Render.com | Free tier, auto-deploy from GitHub |
| Database | Neon PostgreSQL | Already deployed |
| Mobile App | Expo EAS Build | `.apk` for Android, TestFlight for iOS |
| Environment vars | Render dashboard | Injected at build time |

**Render deployment steps:**
1. Connect GitHub repo to Render
2. Set root directory to `Backend/`
3. Build command: `npm install && npm run build`
4. Start command: `npm start`
5. Add all environment variables in Render dashboard

---

## Project Structure

```
via-travels/
├── Backend/
│   ├── src/
│   │   ├── middleware/        # Auth middleware (JWT verification)
│   │   ├── repository/        # Database logic
│   │   │   └── Tourism.entries.ts   # RAG itinerary generation
│   │   ├── routes/
│   │   │   └── Tourism.ts     # Tourism API routes
│   │   └── utils/
│   │       └── config/
│   │           └── schema.ts  # Drizzle ORM schema
│   ├── scripts/
│   │   └── seed-tourism.js    # Seeds 26 Rwanda tourism entries
│   └── index.ts               # Express app entry point
│
└── Frontend/
    ├── Navigation/
    │   └── AppNavigation.js   # Stack + Tab navigation
    ├── screens/
    │   ├── ItineraryScreen.js       # AI trip planner (core feature)
    │   ├── AttractionsScreen.js     # Browse Rwanda entries
    │   ├── SavedItinerariesScreen.js
    │   ├── HomeScreen.js
    │   ├── SigninScreen.js
    │   └── SignUpScreen.js
    ├── services/
    │   ├── api.js             # Axios API client with auth interceptors
    │   └── config.js          # Dynamic API URL resolution
    └── context/
        └── AuthContextProvider.js   # Global auth state
```

---

## Video Demo

https://youtu.be/uUif-K2Fqhg

---

## Author

**Alain Quentin Rurangirwa**
BSc Software Engineering — African Leadership University
q.rurangirw@alustudent.com