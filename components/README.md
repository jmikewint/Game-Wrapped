# GameWrapped

GameWrapped is a Steam recap experience inspired by the energy of end-of-year music summaries. It turns playtime, achievements, and favorite games into a polished personal story.

The current release includes the public landing experience, responsive navigation, reusable UI components, a PostgreSQL/Prisma schema, and working **Steam OpenID sign-in**. Fetching and displaying real playtime/achievement data is the next milestone — right now sign-in gets you a stored profile (name, avatar, Steam ID) and a session, nothing more.

## Stack

- [Next.js](https://nextjs.org/) 16 with the App Router and TypeScript
- [Tailwind CSS](https://tailwindcss.com/) 4 (CSS-first config) for responsive styling
- [PostgreSQL](https://www.postgresql.org/) with [Prisma ORM](https://www.prisma.io/) 7
- Steam OpenID integration planned for the next milestone
- Vercel-ready deployment configuration

## Project structure

```text
app/                    # Routes, layout, metadata, and global styles
  layout.tsx
  page.tsx
  globals.css
  api/auth/
    steam/login/        # Redirects to Steam's OpenID login
    steam/callback/      # Verifies Steam's response, upserts the user, starts a session
    logout/              # Clears the session cookie
components/
  landing/              # Hero, how-it-works, stats showcase, FAQ
  layout/               # Navbar, footer, auth error banner
  ui/                   # Button, LinkButton, logo, and inline SVG icon set
lib/                    # Prisma client, Steam OpenID helpers, session, auth, constants
prisma/                 # schema.prisma (User, Game, OwnedGame, PlaySnapshot, Recap)
public/                 # Static assets
types/                  # Shared TypeScript types (stat cards, featured games)
```

## Setting up Steam sign-in

1. Get a Steam Web API key at [steamcommunity.com/dev/apikey](https://steamcommunity.com/dev/apikey). For local development, enter `localhost` as the domain.
2. Add it to `.env` as `STEAM_API_KEY`.
3. Set `NEXT_PUBLIC_APP_URL` to the exact URL you're running the app at (e.g. `http://localhost:3000`) — Steam checks this against where the sign-in started.
4. Generate a session secret and add it as `SESSION_SECRET`:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```
5. Restart the dev server. Clicking "Sign in with Steam" now redirects to Steam, verifies the response, looks up your public profile, and stores you as a `User` row with a signed session cookie.

Your Steam profile (or at least your game details) needs to be public for the profile lookup to succeed — a private profile will redirect back with an error banner explaining that.

## Design

Dark-only theme built around a "recap card" motif — a fanned stack of stat
cards in the hero previews what a real Steam year-in-review will look like.
Type system pairs Space Grotesk (display) with Inter (body) and IBM Plex
Mono (stats/data, HUD-style). Accent palette: volt green, coral, and ice
cyan, layered on a near-black ink background.

## Getting started

### Prerequisites

- Node.js 20.19+ (or 22.12+)
- PostgreSQL 14+

### Installation

1. Install dependencies.

   ```bash
   npm install
   ```

2. Copy the environment template and update the database connection string.

   ```bash
   cp .env.example .env
   ```

3. Create the initial database migration.

   ```bash
   npm run prisma:migrate -- --name init
   ```

4. Start the development server.

   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Useful commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Run the local Next.js server |
| `npm run build` | Create a production build |
| `npm run lint` | Run ESLint including Next.js checks |
| `npm run format` | Check code formatting |
| `npm run format:write` | Format the codebase with Prettier |
| `npm run prisma:generate` | Regenerate Prisma Client after schema changes |
| `npm run prisma:studio` | Explore the local database with Prisma Studio |

## Data model

`prisma/schema.prisma` models a Steam-linked `User`, the `Game`s they own
(`OwnedGame`, with all-time and two-week playtime), periodic `PlaySnapshot`s
so year-over-year deltas can be computed, and a `Recap` record per user per
year with a shareable slug.

## Planned implementation path

1. ~~Add Steam OpenID authentication and secure session handling.~~ ✅ Done.
2. ~~Fetch Steam profile and owned-game data through the Steam Web API.~~ ✅ Done.
3. Persist refreshable game snapshots through Prisma. *(Partially done — every sync writes a `PlaySnapshot`; nothing consumes them for a "this year" delta yet.)*
4. Build an authenticated recap route with shareable story cards.
5. Add privacy controls, error states, tests, and analytics.

### Library sync

Signing in automatically pulls your owned-games list (`lib/library-sync.ts`) and writes it into `Game` and `OwnedGame`, plus a `PlaySnapshot` row per game for future year-over-year deltas. A "Refresh my library" link on the homepage re-runs the same sync (`POST /api/library/sync`) without requiring you to sign out and back in.

This requires your Steam **game details** privacy setting to be public — if it's private, sign-in still succeeds but `gameCount` comes back `0`.

## Deployment on Vercel

1. Push the repository to GitHub and import it in Vercel.
2. Provision a PostgreSQL database (for example, Vercel Postgres or Neon).
3. Add `DATABASE_URL` to the Vercel project environment variables.
4. Deploy. The `postinstall` script generates Prisma Client during installation.

When authentication is added, configure Steam callback URLs and set the related secrets in Vercel rather than committing them to the repository.

## Notes

GameWrapped is an independent fan project and is not affiliated with Valve or Steam.
