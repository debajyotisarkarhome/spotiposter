# SpotiPoster

A web application that generates downloadable album posters from Spotify. Search for any album, and SpotiPoster renders a high-quality poster featuring the album artwork, track listing, metadata, and a dynamically extracted color palette.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 19 + TypeScript 5.9 |
| Build | Vite 7.3 |
| Styling | TailwindCSS 4.2, shadcn/ui (Radix primitives + CVA) |
| Icons | Lucide React |
| Image Export | html-to-image |
| API | Spotify Web API (OAuth2 Client Credentials) |

## Project Structure

```
src/
├── App.tsx                   # Root component — search, results grid, poster view
├── main.tsx                  # React entry point
├── index.css                 # Tailwind imports + CSS variable theme (OKLCH)
├── components/
│   ├── Poster.tsx            # Poster renderer + PNG download logic
│   └── ui/                   # Reusable UI primitives (button, card, input)
├── hooks/
│   └── useColors.ts          # K-means color extraction from album art
└── lib/
    ├── spotify.ts            # Spotify API client (auth, search, album fetch)
    └── utils.ts              # cn() classname merge utility
```

## Architecture

### Application Flow

1. User submits a search query
2. `searchAlbums(query)` calls Spotify `/v1/search?type=album&limit=12`
3. Results render as a responsive grid (2–4 columns)
4. Clicking an album fetches full details via `getAlbum(id)` → `/v1/albums/{id}`
5. `Poster.tsx` renders a 640×900px poster with:
   - Album artwork with top-8 track listing overlay
   - Metadata block (album name, label, year, type, artists, copyright)
   - 5-color palette strip extracted via K-means clustering
   - Spotify barcode
6. Download button converts the poster DOM to a 3x resolution PNG

### Spotify Authentication

The app uses the **Client Credentials** flow — no user login required. Tokens are cached in memory with automatic refresh (expires 60s before actual expiry).

```
POST https://accounts.spotify.com/api/token
Authorization: Basic base64(CLIENT_ID:CLIENT_SECRET)
grant_type=client_credentials
```

API calls are proxied through Vite dev server to avoid CORS:
- `/api/spotify/*` → `https://api.spotify.com`
- `/api/auth/*` → `https://accounts.spotify.com`

### Color Extraction (`useColors`)

1. Album image is drawn onto a 100×100 canvas
2. Every 4th pixel is sampled as an RGB vector
3. K-means clustering (k=5, 10 iterations) groups pixels into 5 dominant colors
4. Colors are rendered as the poster's palette strip
5. Falls back to a default palette on CORS or processing errors

### Key Types

Defined in `src/lib/spotify.ts`:

```ts
SpotifyAlbum   // Full album: tracks, artists, images, label, copyrights
SpotifyTrack   // Track: id, name, track_number
SpotifyArtist  // Artist: id, name
SpotifyImage   // Image: url, height, width
```

## Setup

### Prerequisites

- Node.js 18+
- Spotify Developer account with a registered app

### Environment Variables

Create a `.env` file in the project root:

```env
VITE_SPOTIFY_CLIENT_ID=your_client_id
VITE_SPOTIFY_CLIENT_SECRET=your_client_secret
```

Get credentials from the [Spotify Developer Dashboard](https://developer.spotify.com/dashboard).

### Install & Run

```bash
npm install
npm run dev        # Development server with HMR
```

### Build

```bash
npm run build      # TypeScript check + Vite production build
npm run preview    # Preview the production build locally
```

### Lint

```bash
npm run lint
```

## Configuration

| File | Purpose |
|------|---------|
| `vite.config.ts` | Vite plugins (React, TailwindCSS), API proxy rules, `@/` path alias |
| `tsconfig.app.json` | Strict TypeScript config targeting ES2022, `@/*` → `./src/*` alias |
| `components.json` | shadcn/ui config (New York style, OKLCH CSS variables) |
| `eslint.config.js` | ESLint with TypeScript + React Hooks + React Refresh rules |

## Design

- Dark theme by default using OKLCH color space variables
- Primary accent: teal/cyan
- Poster output: 640×900px layout, exported at 3x pixel ratio (1920×2700px PNG)
- Responsive grid layout for search results
