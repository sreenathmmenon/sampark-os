# SAMPARK-OS (Matsya Edition)

## What This Is
Autonomous AI broker for India's informal maritime economy. Multi-agent swarm negotiation system that acts as a fisherman's "Digital CFO" — analyzing catch quality, running parallel buyer auctions across WhatsApp/Telegram, and optimizing for net profit after fuel & logistics.

**Core thesis:** Robert Jensen's 2007 study proved mobile phones reduced Kerala fish price dispersion by 8%. We go further — information is a commodity, **agency** is the multiplier. Sampark-OS doesn't just inform; it negotiates, rejects predatory bids, and locks deals autonomously.

**Platform vision:** Matsya (fisheries) is the first vertical. Architecture is designed to extend to Kisan (agriculture) and Chowk (gig labor).

## Architecture

```
┌─────────────────────────────────────────────┐
│              React + Vite Frontend           │
│    (Dark Bloomberg-terminal aesthetic)       │
│    Desktop: 4-panel command center           │
│    Mobile: Fisherman's phone view            │
├─────────────────────────────────────────────┤
│           Express.js + SSE Backend           │
│    POST /api/analyze-catch (Claude Vision)   │
│    POST /api/start-auction (Tool-calling)    │
│    POST /api/approve-deal (HITL)             │
├─────────────────────────────────────────────┤
│        Claude Sonnet 4.5 (Anthropic API)     │
│    Multi-agent tool-calling loop (8 iter)    │
│    Tools: check_mandi_price, place_bid,      │
│    reject_and_counter, accept_deal,          │
│    calculate_fuel_cost, trigger_liquidation   │
└─────────────────────────────────────────────┘
```

## Tech Stack
- **Frontend:** React 18 + Vite 7 + Tailwind CSS 3 + Radix UI + Lucide icons + Framer Motion
- **Backend:** Express 5 + TypeScript + tsx runner
- **AI:** `@anthropic-ai/sdk` — Claude Sonnet 4.5 with tool-calling
- **State:** Custom pub-sub store (`auction-store.ts`) — NO Redux/Zustand
- **Routing:** Wouter (lightweight)
- **Streaming:** Server-Sent Events (SSE) for real-time auction updates
- **Database:** None required for core functionality. Drizzle ORM schema exists but is unused currently.

## Project Structure

```
sampark-os/
├── client/
│   ├── public/
│   │   └── demo/                    # Demo fish photos
│   │       ├── demo-karimeen.jpg    # Primary: single Karimeen
│   │       └── demo-mixed-catch.jpg # Secondary: mixed catch
│   ├── src/
│   │   ├── components/
│   │   │   ├── top-bar.tsx          # Header: branding, demo btn, lang selector, IST clock
│   │   │   ├── catch-card.tsx       # Photo upload + analysis results
│   │   │   ├── bid-table.tsx        # Desktop: tabular bid view
│   │   │   ├── bid-feed.tsx         # Mobile: scrollable bid list
│   │   │   ├── transparency-terminal.tsx  # Agent reasoning log (terminal style)
│   │   │   ├── economics-bar.tsx    # Gross/fuel/risk/net breakdown
│   │   │   ├── approve-button.tsx   # HITL deal confirmation
│   │   │   ├── quality-certificate.tsx    # Catch certificate display
│   │   │   ├── logistics-calculator.tsx   # Harbor comparison
│   │   │   ├── negotiation-timeline.tsx   # Auction progress indicator
│   │   │   ├── auction-status.tsx   # Mobile state banner
│   │   │   ├── floating-actions.tsx # Mobile camera/voice FABs
│   │   │   ├── language-selector.tsx # 7-language dropdown
│   │   │   └── ui/                  # shadcn/ui primitives
│   │   ├── data/
│   │   │   └── marketData.ts        # ★ REAL Kerala market data
│   │   ├── lib/
│   │   │   ├── auction-store.ts     # Global state pub-sub
│   │   │   ├── demo-mode.ts        # ★ Scripted demo sequence
│   │   │   ├── types.ts            # All TypeScript interfaces
│   │   │   ├── queryClient.ts      # TanStack Query setup
│   │   │   └── utils.ts            # cn() helper
│   │   ├── pages/
│   │   │   ├── dashboard.tsx       # ★ Main page
│   │   │   └── not-found.tsx
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   └── index.html
├── server/
│   ├── index.ts                   # Express app bootstrap
│   ├── routes.ts                  # ★ API endpoints + Claude tool-calling loop
│   ├── vite.ts                    # Dev server integration
│   ├── static.ts                  # Production static serving
│   └── storage.ts                 # In-memory storage
├── shared/
│   ├── schema.ts                  # Drizzle schema (unused)
│   └── models/
├── package.json
├── tailwind.config.ts
├── vite.config.ts
└── tsconfig.json
```

## Key Files (Edit Priority)

1. **`server/routes.ts`** — Claude API integration. Tool-calling loop, SSE streaming, bid processing. Currently uses hardcoded harbors/buyers — needs to import from shared market data.
2. **`client/src/data/marketData.ts`** — Single source of truth for all Kerala market data. Fish species (8 types, 7 languages), harbors (5 with GPS), buyers (7), fuel prices.
3. **`client/src/lib/demo-mode.ts`** — Client-side scripted demo. Uses real data from marketData.ts. Works without API key.
4. **`client/src/pages/dashboard.tsx`** — Main UI layout. Desktop 4-panel grid + mobile view.
5. **`client/src/components/transparency-terminal.tsx`** — Agent reasoning log. Core trust/transparency feature.

## Design System

```
Background:     #0a0f1a (deep navy)
Surface:        #1e293b/60 with backdrop-blur
Border:         #334155/50
Text Primary:   #e2e8f0
Text Secondary: #94a3b8
Text Muted:     #475569

Accent Green:   #00ff88 (success, active, neon glow)
Accent Crimson: #ff3b5c (danger, rejected bids)
Accent Amber:   #ffb800 (warning, navigator, countdown)
Accent Cyan:    #22d3ee (info, scout agent)

Fonts:
  Terminal/Data: JetBrains Mono (monospace)
  UI Text:       Plus Jakarta Sans (via Tailwind sans)

Agent Colors (SACRED — never change):
  SCOUT:      #22d3ee (cyan)
  NEGOTIATOR: #00ff88 (green)
  AUDITOR:    #ff3b5c (red)
  NAVIGATOR:  #ffb800 (amber)
```

## Real Market Data (marketData.ts)

### Fish Species (Feb 2026 Kerala prices, INR)
| Fish | Malayalam | Retail | Wholesale | Farmgate | Sampark Target |
|------|----------|--------|-----------|----------|----------------|
| Pearl Spot (Karimeen) | കരിമീൻ | ₹600 | ₹380 | ₹220 | ₹340 |
| Tiger Prawns | ചെമ്മീൻ | ₹500 | ₹320 | ₹180 | ₹280 |
| King Mackerel | നെയ്‌മീൻ | ₹700 | ₹450 | ₹280 | ₹400 |
| Silver Pomfret | ആവോലി | ₹600 | ₹400 | ₹250 | ₹360 |
| Sardine | മത്തി | ₹200 | ₹120 | ₹60 | ₹95 |
| Red Snapper | ചെമ്പല്ലി | ₹350 | ₹200 | ₹110 | ₹175 |
| Indian Mackerel | അയല | ₹300 | ₹160 | ₹80 | ₹130 |
| Yellowfin Tuna | ചൂര | ₹500 | ₹350 | ₹200 | ₹310 |

### Harbors (from Kadamakudy origin, 9.99°N 76.31°E)
| Harbor | Distance | Fuel Cost | ETA | Buyer Density |
|--------|----------|-----------|-----|---------------|
| Kochi Fishing Harbor | 12km | ₹780 | 45min | Very High |
| Vypin Harbor | 8km | ₹520 | 30min | Medium |
| Fort Kochi Landing | 10km | ₹650 | 35min | Medium |
| Munambam Harbor | 28km | ₹1,820 | 90min | High |
| Chellanam Harbor | 15km | ₹975 | 55min | Low |

### Buyers
| ID | Name | Channel | Type | Specialty |
|----|------|---------|------|-----------|
| KFE | Kochi Fresh Exports | WhatsApp | Export | Gulf countries |
| MWS | Marina Wholesale Seafood | WhatsApp | Wholesale | Premium hotel supply |
| GGE | Gulf Gate Exports Pvt Ltd | WhatsApp | Export | Air-freight Dubai/Saudi |
| PKF | Paravur Kadal Foods | WhatsApp | Processor | Fish processing & packaging |
| HKC | Hotel Kerala Cafe Chain | Telegram | Hospitality | Restaurant chain, daily supply |
| SCM | Saravana Canteen & Mess | Telegram | Canteen | Bulk hostel supply |
| VFS | Vypeen Fresh Stall | Telegram | Retail | Local walk-in customers |

### Fuel Constants
- Marine diesel: ₹92/L (Kerala Feb 2026)
- Boat consumption: 0.65 L/km
- Formula: `fuel_cost = distance_km × 0.65 × 92`

## Multi-Agent System

Four specialized agents run inside Claude's tool-calling loop:

| Agent | Role | Color | Key Tools |
|-------|------|-------|-----------|
| **SCOUT** | Catch identification & grading via Claude Vision | Cyan #22d3ee | analyze image, generate certificate |
| **NEGOTIATOR** | Parallel buyer comms, bid management | Green #00ff88 | place_bid, reject_and_counter, accept_deal |
| **AUDITOR** | Fair pricing enforcement, deadline monitoring | Red #ff3b5c | check_mandi_price, trigger_liquidation |
| **NAVIGATOR** | Logistics optimization, fuel ROI | Amber #ffb800 | calculate_fuel_cost |

### Net Margin Formula
```
Net_Profit = (bid_per_kg × weight_kg) - fuel_cost - risk_buffer
```
Where `risk_buffer` = cold storage fee (₹500/day default) or 3% of gross, whichever applies.

### The Cold Storage Trap
If premium bids don't clear the reserve price by **3:30 PM deadline**, the fish goes to cold storage at ₹500/day. After 2 days, the fisherman has LOST money vs selling at farmgate price. The AUDITOR agent monitors this and triggers **Liquidation Mode** to accept the best available bid before the trap kicks in.

## API Endpoints

### POST /api/analyze-catch
- Input: `{ image: "data:image/jpeg;base64,..." }`
- Uses Claude Vision to analyze fish photo
- Returns: `{ species, species_local, weight_kg, quality_grade, quality_score, freshness_hours, catch_certificate_hash }`

### POST /api/start-auction
- Input: `{ catch_analysis: {...} }`
- Starts Claude tool-calling loop (up to 8 iterations)
- Returns: SSE stream with event types:
  - `log` — agent reasoning messages
  - `bid` — new bid received
  - `bid_update` — bid status change (rejected/countered/accepted)
  - `harbors` — harbor options with recommended
  - `economics` — gross/fuel/risk/net breakdown
  - `state` — auction state transitions
  - `countdown` — timer updates
  - `threads` — active negotiation thread count

### POST /api/approve-deal
- Input: `{ gross_bid, net_profit, harbor }`
- Human-in-the-loop confirmation
- Returns: `{ approved: true, approval_hash, approved_at }`

## Demo Mode (Ctrl+Shift+D)

Fully client-side scripted demo. **No API key needed.** Runs a realistic auction for 40kg Karimeen:

1. Scout scans catch → identifies Sea Karimeen, Grade A (94%)
2. Navigator calculates fuel ROI for 5 real harbors → picks Kochi
3. MCP check → wholesale avg ₹380/kg, reserve set at ₹340/kg
4. Five bids arrive sequentially:
   - **KFE ₹310/kg → REJECTED** (predatory, 18% below MCP)
   - **MWS ₹390/kg → Evaluated** (above MCP, strong)
   - **HKC ₹280/kg → REJECTED** (bulk telegram, too low)
   - **PKF ₹360/kg → COUNTERED** to ₹400/kg
   - **GGE ₹445/kg → ACCEPTED** (Gulf export premium, best net margin)
5. Deal secured: Net ₹16,520 vs ₹8,800 without Sampark (+88% gain)
6. Awaits human APPROVE confirmation

## Environment Variables
```
ANTHROPIC_API_KEY=sk-ant-...
# On Replit these map to:
# AI_INTEGRATIONS_ANTHROPIC_API_KEY
# AI_INTEGRATIONS_ANTHROPIC_BASE_URL
PORT=5000  # default
```
Note: DATABASE_URL is NOT required. PostgreSQL/Drizzle schema exists in the codebase but is unused by core functionality.

## Commands
```bash
npm install          # Install deps
npm run dev          # Start dev server (port 5000)
npm run build        # Production build
npm run start        # Start production server
npm run check        # TypeScript type check
```

## Languages Supported
Malayalam (മലയാളം), Tamil (தமிழ்), Kannada (ಕನ್ನಡ), Hindi (हिन्दी), Bengali (বাংলা), Konkani (कोंकणी), English

All fish species have names in all 7 languages. Language selector in top bar.

## Critical Rules

1. **All currency in INR (₹)**. All times in IST. No USD, no UTC.
2. **Never hardcode market data** — always import from `client/src/data/marketData.ts`. Backend should also use a shared data source (currently hardcoded in routes.ts — this needs fixing).
3. **Demo mode must work without API key** — fully client-side scripted.
4. **Real API mode needs ANTHROPIC_API_KEY** — uses Claude Sonnet 4.5 tool-calling.
5. **Agent colors are sacred** — Scout=cyan, Negotiator=green, Auditor=red, Navigator=amber. Never change.
6. **Human-in-the-loop** — NO deal finalizes without the green APPROVE button. This is a core trust feature for fishermen who don't trust automation.
7. **The ₹500/day cold storage trap** — drives the AUDITOR's liquidation logic. If bids don't clear by 3:30 PM, trigger liquidation.
8. **Express 5** — route params and `res.json()` behavior differs from Express 4.
9. **Replit Vite plugins** exist in devDependencies — safe to keep, won't break outside Replit.
10. **No PostgreSQL needed** — ignore DATABASE_URL, Drizzle schema, db:push. All state is in-memory.

## Known Issues & Roadmap

### Needs Immediate Fix
1. **Backend routes.ts uses hardcoded harbors/buyers** — should import from shared market data module
2. **Terminal logs appear too fast** — need typewriter effect or staggered line reveal
3. **Bids appear all at once** — should slide in one-by-one with entrance animation
4. **Language selector is wired but doesn't change fish names in catch-card/bid-table** — needs integration

### Short-Term Roadmap
5. **Countdown timer** — needs more dramatic visual treatment (larger, pulsing, color shift)
6. **"Without Sampark" comparison** — economics bar should show farmgate baseline vs Sampark net
7. **Mobile view polish** — test scrolling, bottom button overlap, bid feed spacing
8. **Sound design** — subtle bid arrival ping, deal confirmation chime

### Production Roadmap
9. **Real WhatsApp/Telegram integration** — WhatsApp Business API + Telegram Bot API for actual buyer comms
10. **GPS-based harbor selection** — browser geolocation instead of hardcoded Kadamakudy origin
11. **Offline-first PWA** — fishermen have intermittent connectivity at sea
12. **Voice interface** — fishermen can't type while steering boats. Whisper API or browser speech-to-text
13. **SMS fallback for buyers** — buyers without WhatsApp/Telegram get SMS notifications
14. **Historical auction analytics** — price trends, buyer reliability scores, seasonal patterns
15. **Multi-species auction** — mixed catch splitting (e.g., 30kg Karimeen + 10kg Red Snapper in separate lots)
16. **Cooperative mode** — multiple fishermen pool catches for better negotiating power
17. **Weather integration** — IMD data to predict catch quality and buyer demand patterns
