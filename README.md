# Howl's Moving Parses

A personal static web dashboard that aggregates WoW character performance data and spec-level meta from Raider.IO and WarcraftLogs. Supports multiple tracked characters and all 39 playable specs. Data is fetched at build time via GitHub Actions, baked into the static site, and deployed to GitHub Pages.

## Features

- Character M+ score, realm/region/world ranks, and EU title cutoff comparison
- Recent M+ runs and best run per dungeon
- Log performance from WarcraftLogs (raid parses and M+ dungeon logs)
- Damage breakdown from most recent raid log
- Gear snapshot and talent snapshot from Raider.IO
- Global spec meta: M+ EU leaderboard (Raider.IO) and Raid EU leaderboard (WarcraftLogs)
- Multi-spec tracking per character: main spec + offspecs with a spec toggle in the header
- Service worker notifies you when new data is available — no page refresh required to check
- Static build: no API keys in the browser, no runtime network calls, instant tab switching

## Tech Stack

| Concern | Choice |
|---|---|
| Language | TypeScript (strict mode) |
| Framework | React 18 |
| Styling | PicoCSS (classless, semantic HTML) |
| Build tool | Vite |
| Data fetching | Node.js scripts at build time via `tsx` |
| Deployment | GitHub Pages |
| CI/CD | GitHub Actions |
| Offline/staleness | Service Worker |
| Testing | Vitest + React Testing Library |
| Formatting & linting | Biome |
| Git hooks | Lefthook |

## Prerequisites

- Node.js 22+
- pnpm 9.15.0

## Local Setup

```bash
git clone https://github.com/<your-username>/hxwl-dashboard
cd hxwl-dashboard
pnpm install
```

Copy the environment file and fill in your WarcraftLogs credentials:

```bash
cp .env.example .env
# Edit .env and add your WCL_CLIENT_ID and WCL_CLIENT_SECRET
```

To get WarcraftLogs credentials:

1. Go to [warcraftlogs.com/api/docs](https://www.warcraftlogs.com/api/docs)
2. Create a client under **Manage Clients**. Leave the "Public Client" checkbox **unchecked** — the build script uses the `client_credentials` OAuth grant (confidential client). Use any valid HTTPS URL for "Redirect URLs".
3. Copy your **Client ID** and **Client Secret** into `.env`

## Running Locally

Fetch live data (requires `.env` to be set up):

```bash
pnpm tsx scripts/fetch-data.ts
```

Start the dev server:

```bash
pnpm dev
```

Build for production:

```bash
pnpm build
pnpm dlx serve dist -l 3000
```

## Running Tests

```bash
pnpm test              # Unit and component tests
pnpm test:snapshot     # Snapshot schema validation (requires fetch-data to have run first)
```

## Configuration

Edit `characters.config.json` at the repo root to control which characters are tracked.

### Example

```json
{
  "characters": [
    {
      "name": "Hxwl",
      "realm": "Draenor",
      "region": "eu",
      "class": "Shaman",
      "default": true,
      "specs": [
        { "spec": "Elemental",   "role": "main" },
        { "spec": "Enhancement", "role": "offspec" },
        { "spec": "Restoration", "role": "inactive" }
      ]
    }
  ]
}
```

### Field Reference

| Field | Type | Description |
|---|---|---|
| `name` | string | Character name (exact, case-sensitive) |
| `realm` | string | Realm display name (e.g. `"Draenor"`, `"Twisting Nether"`) |
| `region` | `"eu"` | Only EU is supported |
| `class` | string | WoW class name as WarcraftLogs expects it (e.g. `"Shaman"`, `"DeathKnight"`) |
| `default` | boolean | Exactly one character must have `true` — shown on page load |
| `specs` | array | One or more spec entries |
| `specs[].spec` | string | Spec name (e.g. `"Elemental"`, `"Beast Mastery"`) |
| `specs[].role` | `"main"` \| `"offspec"` \| `"inactive"` | Role for this spec |

### Tracking Multiple Specs Per Character

Each character can declare multiple specs with a `role` per entry:

- **`"main"`** — the primary spec. Exactly one per character. Pre-selected on page load, and the spec used for the M+ score in the Characters Summary table.
- **`"offspec"`** — a secondary spec. Data is fetched and shown when the user toggles to it using the spec toggle in the header.
- **`"inactive"`** — not fetched, not displayed. Useful as a placeholder to re-activate later by changing the role.

A character must have exactly one `"main"` spec. Inactive specs cost nothing at build time.

### Adding a Second Character

```json
{
  "characters": [
    {
      "name": "Hxwl",
      "realm": "Draenor",
      "region": "eu",
      "class": "Shaman",
      "default": true,
      "specs": [
        { "spec": "Elemental", "role": "main" },
        { "spec": "Enhancement", "role": "offspec" }
      ]
    },
    {
      "name": "Howlbear",
      "realm": "Twisting Nether",
      "region": "eu",
      "class": "Druid",
      "default": false,
      "specs": [
        { "spec": "Guardian", "role": "main" },
        { "spec": "Restoration", "role": "offspec" }
      ]
    }
  ]
}
```

## GitHub Actions Deployment

The workflow in `.github/workflows/refresh.yml` runs on a schedule and on demand. It:

1. Runs unit tests
2. Fetches live data from Raider.IO and WarcraftLogs
3. Validates the generated `snapshot.json`
4. Builds the static site
5. Runs Lighthouse CI (95 Performance, 100 Accessibility/Best Practices/SEO)
6. Deploys to the `gh-pages` branch

### Required GitHub Secrets

| Secret | Description |
|---|---|
| `WCL_CLIENT_ID` | WarcraftLogs OAuth client ID |
| `WCL_CLIENT_SECRET` | WarcraftLogs OAuth client secret |
| `WCL_CURRENT_RAID_HINT` | Optional: current raid tier name substring (e.g. `VS / DR / MQD`) |
| `WCL_CURRENT_MPLUS_HINT` | Optional: current M+ season name substring (e.g. `Mythic+ Season 1`) |

The hint env vars let you pin the current tier without a code change when a new patch drops.

### GitHub Pages Setup

1. In your repo settings, go to **Pages**
2. Set source to **Deploy from a branch**, branch `gh-pages`, folder `/`
3. The site will be available at `https://<username>.github.io/hxwl-dashboard/`

## Rate Limits

A full build (1 character, 39 specs) consumes approximately 30–50 out of 3,600 WarcraftLogs API points per hour. Well within budget.

## Out of Scope (v1)

- Meta talent builds and meta gear (deferred — WarcraftLogs `characterRankings` does not include talent or gear data)
- Damage breakdown for characters with no raid logs
- Historical trend charts
- In-page character adding (config file only)
- Multi-region support (EU only)
- Blizzard API / Armory integration

## Licence

MIT
