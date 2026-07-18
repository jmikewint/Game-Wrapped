# GameWrapped

GameWrapped is a Steam recap experience inspired by the energy of end-of-year music summaries. It turns playtime, achievements, and favorite games into a polished personal story.

The current release is a front-end foundation: it includes the public landing experience, responsive navigation, reusable UI components, and a PostgreSQL/Prisma schema ready for Steam data. Steam OpenID authentication and live data fetching are intentionally not implemented yet — the "Sign in with Steam" button is a placeholder.

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
components/
  landing/              # Hero, how-it-works, stats showcase, FAQ
  layout/               # Navbar and footer
  ui/                   # Button, logo, and inline SVG icon set
lib/                    # Prisma client singleton and shared constants
prisma/                 # schema.prisma (User, Game, OwnedGame, PlaySnapshot, Recap)
public/                 # Static assets
types/                  # Shared TypeScript types (stat cards, featured games)
```

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

1. Add Steam OpenID authentication and secure session handling.
2. Fetch Steam profile and owned-game data through the Steam Web API.
3. Persist refreshable game snapshots through Prisma.
4. Build an authenticated recap route with shareable story cards.
5. Add privacy controls, error states, tests, and analytics.

## Deployment on Vercel

1. Push the repository to GitHub and import it in Vercel.
2. Provision a PostgreSQL database (for example, Vercel Postgres or Neon).
3. Add `DATABASE_URL` to the Vercel project environment variables.
4. Deploy. The `postinstall` script generates Prisma Client during installation.

When authentication is added, configure Steam callback URLs and set the related secrets in Vercel rather than committing them to the repository.

## Notes

GameWrapped is an independent fan project and is not affiliated with Valve or Steam.
