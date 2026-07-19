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
  wrapped/page.tsx      # The animated recap — guarded, full-screen, no navbar/footer
  api/auth/
    steam/login/        # Redirects to Steam's OpenID login
    steam/callback/      # Verifies Steam's response, upserts the user, starts a session
    logout/              # Clears the session cookie
  api/library/sync/      # Re-pulls owned games for the signed-in user
components/
  landing/              # Hero, how-it-works, stats showcase, FAQ
  layout/               # Navbar, footer, auth error banner
  ui/                   # Button, LinkButton, logo, and inline SVG icon set
  wrapped/              # The recap slideshow: orchestrator, slides, progress bar, count-up
lib/                    # Prisma client, Steam helpers, session, auth, constants,
                        # library sync, and the Wrapped stat/archetype engine
prisma/                 # schema.prisma (User, Game, OwnedGame, PlaySnapshot, Recap)
public/                 # Static assets
types/                  # Shared TypeScript types (stat cards, wrapped recap shapes)
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

The landing page uses a light, lavender-to-violet theme built around a "recap card"
motif — a fanned stack of stat cards in the hero previews what a real Steam
year-in-review looks like. Type system pairs Space Grotesk (display) with Inter (body)
and IBM Plex Mono (stats/data, HUD-style). Accent palette: violet ("volt"), coral, and
ice blue.

The `/wrapped` recap itself is intentionally its own thing: a full-screen, near-black
slideshow with a different gradient per slide, independent of the landing page's theme —
closer to Spotify Wrapped's cinematic feel than to the rest of the site.

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
4. ~~Build an authenticated recap route with an animated, story-style reveal.~~ ✅ Done — see `/wrapped` below.
5. Use `PlaySnapshot` deltas to scope the recap to "this year" instead of all-time, persist a `Recap` row per year, and add a real share/export view (image or shareable link).
6. ~~Add achievement and genre data depth.~~ ✅ Done — see below. Both are intentionally scoped/bounded rather than full-coverage; see the caveats.
7. Add privacy controls, error states, tests, and analytics.

### Library sync

Signing in automatically pulls your owned-games list (`lib/library-sync.ts`) and writes it into `Game` and `OwnedGame`, plus a `PlaySnapshot` row per game for future year-over-year deltas. A "Refresh my library" link on the homepage re-runs the same sync (`POST /api/library/sync`) without requiring you to sign out and back in.

This requires your Steam **game details** privacy setting to be public — if it's private, sign-in still succeeds but `gameCount` comes back `0`.

### Achievements

Every sync also pulls achievement unlock state (`ISteamUserStats/GetPlayerAchievements`) for your **10 most-played games** and stores it in a new `Achievement` table, one row per achievement with an `unlockedAt` timestamp. That's a deliberate bound, not full coverage: fetching achievements for an entire library (some are 500+ games) would mean hundreds of sequential Steam API calls on every login, which doesn't scale and would make sign-in noticeably slow. Scoping to the most-played games covers the overwhelming majority of a person's actual achievement activity, since games with more playtime almost always have more unlocks. Re-synced every login, so newly unlocked achievements in those games show up next time you refresh.

Storing `unlockedAt` (not just a total count) is what lets the recap report "achievements unlocked **this year**" rather than only a lifetime total — see `getWrappedRawData` in `lib/wrapped.ts`.

### Genres

`Game.genres` is populated by calling Steam's storefront API (`store.steampowered.com/api/appdetails`) per app. This is an **unofficial, undocumented** endpoint with no published rate limits, so `lib/library-sync.ts` treats it carefully:

- **Cached forever once fetched.** Genres essentially never change, so a game is only queried once — subsequent syncs skip anything that already has genre data cached.
- **Backfilled gradually.** Each sync only fetches genres for up to **8** games that don't have them yet (prioritized by playtime), with a 350ms delay between requests. A large, never-before-synced library fills in its genre data across several logins rather than all at once on the first one.

Until a game has been backfilled, it just doesn't contribute to the "top genre" slide — `computeWrappedStats` in `lib/superlatives.ts` only counts games that have cached genre tags, and skips the slide entirely if none do yet.

### The Wrapped recap (`/wrapped`)

Signing in no longer dumps your stats straight onto the homepage. Instead the hero shows a
"Reveal my Wrapped" card, and clicking it opens a full-screen, Spotify-Wrapped-style
slideshow at `/wrapped`:

1. **Intro** — your avatar and library size.
2. **Total hours** — an animated count-up.
3. **Top game** — your most-played title over its own header art.
4. **Top 5** — a staggered, bar-chart-style ranked list.
5. **Top genre** — shown only once at least one owned game has cached genre data (see above).
6. **Achievements this year** — shown only if at least one has unlocked in your most-played games (see above).
7. **Your archetype** — a fun, rule-based "you are..." label (e.g. *The Marathoner*,
   *The Night Owl*, *The One True Game*), generated from your real numbers.
8. **Recap card** — a shareable-looking summary, with a "watch again" option and a downloadable PNG (`/api/wrapped/card`).

It behaves like Instagram/Snapchat stories: a segmented progress bar auto-advances each
slide, tapping the left/right edges of the screen (or the arrow keys) moves between
slides, holding down pauses the timer, and Escape (or the ✕ button) exits back home.

**How the archetype is picked:** `lib/superlatives.ts` runs a small rule engine —
things like how concentrated your hours are in one game, your backlog ratio, and what
time of day your sessions end — and returns the highest-priority match. It's pure,
dependency-free, and easy to extend with new rules. It runs client-side (in
`components/wrapped/WrappedExperience.tsx`) rather than on the server so time-of-day
stats reflect your actual local timezone.

If your library hasn't been synced yet, `/wrapped` shows a small prompt to sync instead
of an empty slideshow.

## Deployment on Vercel

1. Push the repository to GitHub and import it in Vercel.
2. Provision a PostgreSQL database (for example, Vercel Postgres or Neon).
3. Add `DATABASE_URL` to the Vercel project environment variables.
4. Deploy. The `postinstall` script generates Prisma Client during installation.

When authentication is added, configure Steam callback URLs and set the related secrets in Vercel rather than committing them to the repository.

## Notes

GameWrapped is an independent fan project and is not affiliated with Valve or Steam.
