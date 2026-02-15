# SAMPARK-OS (Matsya Edition) - Technical Architecture Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [Architecture & Code Structure](#architecture--code-structure)
4. [Features & Functionality](#features--functionality)
5. [Workflow & Data Flow](#workflow--data-flow)
6. [UI/UX Design System](#uiux-design-system)
7. [AI Integration](#ai-integration)
8. [Database Schema](#database-schema)
9. [API Endpoints](#api-endpoints)
10. [State Management](#state-management)
11. [Demo Mode](#demo-mode)
12. [Deployment & Build](#deployment--build)

---

## Project Overview

**SAMPARK-OS (Matsya Edition)** is an autonomous multi-agent AI broker platform designed specifically for Indian fishermen. The system uses Claude AI for fish catch analysis via computer vision and multi-agent tool-calling negotiation to maximize profit for fishermen.

### Purpose
- Analyze fish catches using AI vision
- Automate negotiations with buyers via WhatsApp/Telegram
- Calculate optimal harbor routes and fuel costs
- Maximize net profit for fishermen
- Provide transparency through real-time AI reasoning logs
- Enable human-in-the-loop final approval

### Target Users
- Indian fishermen (primary users on mobile)
- Fish market traders and exporters
- Demo/judges viewing on desktop

---

## Technology Stack

### Frontend
- **Framework**: React 18.3.1
- **Build Tool**: Vite 7.3.0
- **Routing**: Wouter 3.3.5
- **UI Library**: Radix UI (comprehensive component library)
- **Styling**:
  - Tailwind CSS 3.4.17
  - @tailwindcss/vite 4.1.18
  - tailwindcss-animate 1.0.7
- **State Management**: Custom reactive store (client-side)
- **Data Fetching**: TanStack React Query 5.60.5
- **Forms**: React Hook Form 7.55.0 + Zod validation
- **Icons**: Lucide React 0.453.0 + React Icons 5.4.0
- **Animations**: Framer Motion 11.13.1
- **Themes**: next-themes 0.4.6
- **Typography**: Plus Jakarta Sans (UI), JetBrains Mono (terminal)

### Backend
- **Runtime**: Node.js with TypeScript 5.6.3
- **Framework**: Express 5.0.1
- **Database**: PostgreSQL (via Drizzle ORM)
- **ORM**: Drizzle ORM 0.39.3
- **Authentication**: Passport.js 0.7.0 + Passport Local
- **Session Management**:
  - express-session 1.18.1
  - memorystore 1.6.7
  - connect-pg-simple 10.0.0
- **AI**: Anthropic SDK 0.74.0 (Claude Sonnet 4.5)
- **Real-time**: Server-Sent Events (SSE), WebSocket (ws 8.18.0)
- **Build Tool**: esbuild 0.25.0, tsx 4.20.5

### Development Tools
- **Type Checking**: TypeScript 5.6.3
- **Database Migrations**: drizzle-kit 0.31.8
- **Replit Plugins**:
  - @replit/vite-plugin-cartographer
  - @replit/vite-plugin-dev-banner
  - @replit/vite-plugin-runtime-error-modal

---

## Architecture & Code Structure

### Directory Structure
```
sampark-os/
├── client/                      # Frontend React application
│   ├── public/
│   │   ├── demo/               # Demo images (fish photos)
│   │   └── favicon.png
│   └── src/
│       ├── components/         # React components
│       │   ├── ui/            # Radix UI components (45+ components)
│       │   ├── approve-button.tsx
│       │   ├── auction-status.tsx
│       │   ├── bid-feed.tsx
│       │   ├── bid-table.tsx
│       │   ├── catch-card.tsx
│       │   ├── economics-bar.tsx
│       │   ├── floating-actions.tsx
│       │   ├── language-selector.tsx
│       │   ├── logistics-calculator.tsx
│       │   ├── negotiation-timeline.tsx
│       │   ├── quality-certificate.tsx
│       │   ├── top-bar.tsx
│       │   └── transparency-terminal.tsx
│       ├── data/
│       │   └── marketData.ts   # Kerala fish market data, harbors, buyers
│       ├── hooks/
│       │   └── use-mobile.tsx  # Mobile detection hook
│       ├── lib/
│       │   ├── auction-store.ts    # Reactive state management
│       │   ├── demo-mode.ts        # Demo mode orchestration
│       │   ├── queryClient.ts      # React Query config
│       │   ├── types.ts            # TypeScript interfaces
│       │   └── utils.ts            # Utility functions
│       ├── pages/
│       │   ├── dashboard.tsx       # Main dashboard (SPA)
│       │   └── not-found.tsx
│       ├── App.tsx
│       ├── main.tsx
│       └── index.css
│
├── server/                      # Backend Express application
│   ├── replit_integrations/    # Replit-specific integrations
│   │   ├── batch/
│   │   └── chat/
│   ├── index.ts                # Server entry point
│   ├── routes.ts               # API routes & Claude integration
│   ├── static.ts               # Static file serving
│   ├── storage.ts              # Database connection
│   └── vite.ts                 # Vite dev server integration
│
├── shared/                      # Shared types between client/server
│   ├── models/
│   │   └── chat.ts
│   └── schema.ts               # Drizzle database schema
│
├── script/
│   └── build.ts                # Production build script
│
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.ts
├── drizzle.config.ts
├── postcss.config.js
└── components.json             # shadcn/ui config
```

### Key Components

#### Frontend Components

1. **TopBar** (`top-bar.tsx`)
   - App branding "SAMPARK"
   - Live status indicator (green pulse)
   - Current IST time
   - Language selector

2. **CatchCard** (`catch-card.tsx`)
   - Photo upload/display
   - Species identification
   - Weight estimation
   - Quality grade badge
   - Catch certificate hash

3. **AuctionStatus** (`auction-status.tsx`)
   - State indicator (IDLE → SCANNING → AUCTION_LIVE → DEAL_SECURED → LIQUIDATION)
   - Countdown timer
   - Active threads counter

4. **BidFeed** (`bid-feed.tsx`)
   - Mobile view bid list
   - Bid cards with channel icons
   - Status pills (ACTIVE/REJECTED/ACCEPTED)
   - Auto-scroll to latest

5. **BidTable** (`bid-table.tsx`)
   - Desktop view data table
   - Columns: Buyer, Channel, Bid, Gross, Net, Action, Status
   - Row animations
   - Winning bid highlight

6. **TransparencyTerminal** (`transparency-terminal.tsx`)
   - AI reasoning log
   - Monospace font (JetBrains Mono)
   - Agent tags [SCOUT], [NEGOTIATOR], [AUDITOR], [NAVIGATOR]
   - Timestamps in IST
   - Auto-scroll

7. **EconomicsBar** (`economics-bar.tsx`)
   - Gross bid amount
   - Fuel cost deduction
   - Risk buffer
   - Net profit calculation

8. **ApproveButton** (`approve-button.tsx`)
   - Human-in-the-loop confirmation
   - Big green CTA button
   - Harbor route information

9. **QualityCertificate** (`quality-certificate.tsx`)
   - Immutable catch certificate
   - Hash verification
   - Freshness score
   - GPS coordinates (mock)

10. **LogisticsCalculator** (`logistics-calculator.tsx`)
    - Harbor distance comparison
    - Fuel cost calculation
    - ETA estimation

11. **NegotiationTimeline** (`negotiation-timeline.tsx`)
    - Visual timeline of auction stages
    - Connected dots showing progress

12. **FloatingActions** (`floating-actions.tsx`)
    - Camera button
    - Microphone button (voice command)

13. **LanguageSelector** (`language-selector.tsx`)
    - Multi-language support
    - Malayalam, Hindi, Tamil, Kannada, Bengali, English

#### State Management (`auction-store.ts`)

Custom reactive store pattern:
- Global state object
- Listener subscription system
- State update functions
- React hook for component subscription

**State Shape**:
```typescript
interface AuctionData {
  state: AuctionState;
  catch_analysis: CatchAnalysis | null;
  bids: Bid[];
  log_entries: LogEntry[];
  countdown_seconds: number;
  active_threads: number;
  recommended_harbor: HarborOption | null;
  harbors: HarborOption[];
  gross_bid: number;
  fuel_cost: number;
  risk_buffer: number;
  net_profit: number;
  deal_approved: boolean;
}
```

**State Functions**:
- `getAuctionState()`: Get current state
- `resetAuction()`: Reset to initial state
- `setAuctionState(state)`: Update auction state
- `setCatchAnalysis(analysis)`: Set catch data
- `addBid(bid)`: Add new bid
- `updateBid(bidId, updates)`: Update existing bid
- `addLogEntry(entry)`: Add log message
- `setCountdown(seconds)`: Update countdown
- `setActiveThreads(count)`: Update thread count
- `setEconomics(data)`: Update economics data
- `setHarbors(harbors, recommended)`: Set harbor options
- `setDealApproved(approved)`: Mark deal as approved
- `useAuctionSubscription()`: React hook for components

---

## Features & Functionality

### 1. AI-Powered Fish Analysis
- Upload fish photo via camera/file
- Claude Sonnet 4.5 vision API analyzes:
  - Species identification (English + 6 Indian languages)
  - Weight estimation
  - Quality grading (A/B/C)
  - Quality score (0-100)
  - Freshness estimation (hours since catch)
- Generates immutable catch certificate hash

### 2. Multi-Agent Auction System
Four specialized AI agents:

**SCOUT**
- Identifies and grades catch
- Validates quality metrics
- Generates certificates

**NEGOTIATOR**
- Manages buyer communications
- Places and tracks bids
- Handles counter-offers
- Accepts/rejects deals

**AUDITOR**
- Enforces fair pricing rules
- Monitors deadlines
- Triggers liquidation mode
- Validates market prices

**NAVIGATOR**
- Calculates logistics
- Compares harbor options
- Optimizes fuel costs
- Estimates ETAs

### 3. Real-Time Bidding
- Simulates bids from 5+ buyers
- WhatsApp and Telegram channels
- Live bid updates via SSE
- Bid statuses:
  - ACTIVE: Currently being evaluated
  - REJECTED: Below threshold
  - COUNTERED: Counter-offer sent
  - ACCEPTED: Deal secured

### 4. Economic Optimization
- Market price checking against mandi rates
- Fuel cost deduction
- Risk buffer calculation (3% of gross)
- Net profit maximization
- ROI comparison across harbors

### 5. Human-in-the-Loop Approval
- Final deal requires human confirmation
- Clear economics breakdown
- Route information display
- Single-click approval

### 6. Transparency & Trust
- Real-time AI reasoning log
- All agent decisions visible
- Timestamped actions (IST)
- Immutable catch certificates
- Hash-based verification

### 7. Multi-Language Support
Languages supported:
- English
- Malayalam (മലയാള)
- Hindi (हिंदी)
- Tamil (தமிழ்)
- Kannada (ಕನ್ನಡ)
- Bengali (বাংলা)
- Konkani

Fish species names in all languages:
- Karimeen / Pearl Spot
- Neymeen / Seer Fish
- Avoli / Mackerel
- Ayala / Pomfret
- And many more...

### 8. Responsive Design
**Mobile View** (Fisherman's Phone):
- Vertical scrolling layout
- Large touch targets (48px min)
- Sticky bottom approval section
- Floating action buttons
- Optimized for sunlight readability

**Desktop View** (Command Center):
- 4-panel grid layout
- Left: Catch intelligence
- Center: Auction table + timeline
- Right: Transparency terminal
- Synchronized state across panels

### 9. Demo Mode
- Triggered via Ctrl+Shift+D or DEMO button
- Scripted demo flow
- Pre-loaded fish photos
- Simulated auction with realistic timing
- Showcase all features automatically

---

## Workflow & Data Flow

### Complete User Journey

```
┌─────────────────────────────────────────────────────────────────┐
│                     1. PHOTO CAPTURE                             │
│  Fisherman uploads/captures fish photo via mobile camera        │
└───────────────────────┬─────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────────┐
│                  2. AI VISION ANALYSIS                           │
│  • Frontend converts image to base64                             │
│  • POST /api/analyze-catch with image data                       │
│  • Claude Sonnet 4.5 vision model analyzes                       │
│  • Returns: species, weight, grade, quality, freshness           │
│  • Generates catch certificate hash                              │
└───────────────────────┬─────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────────┐
│                3. STATE UPDATE: SCANNING → ANALYZED              │
│  • setCatchAnalysis() updates global state                       │
│  • All subscribed components re-render                           │
│  • CatchCard displays analysis results                           │
│  • QualityCertificate shows hash                                 │
└───────────────────────┬─────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────────┐
│                  4. AUCTION INITIATION                           │
│  • POST /api/start-auction with catch analysis                   │
│  • SSE connection established                                    │
│  • State changes to AUCTION_LIVE                                 │
│  • Countdown timer starts (420 seconds)                          │
│  • Active threads counter: 5                                     │
└───────────────────────┬─────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────────┐
│              5. MULTI-AGENT NEGOTIATION LOOP                     │
│                                                                   │
│  Agent Loop (8 iterations max):                                  │
│                                                                   │
│  A. NAVIGATOR: Calculate harbor logistics                        │
│     • check_mandi_price() - Get market rate                      │
│     • calculate_fuel_cost() - Compare 3 harbors                  │
│     • Recommend optimal harbor                                   │
│     • Send harbor data via SSE → setHarbors()                    │
│                                                                   │
│  B. NEGOTIATOR: Contact buyers                                   │
│     • place_bid() tool called for each buyer                     │
│     • Bids stream via SSE → addBid()                             │
│     • 4-5 buyers submit initial offers                           │
│                                                                   │
│  C. AUDITOR: Evaluate bids                                       │
│     • Compare against mandi price                                │
│     • Calculate net profit (gross - fuel)                        │
│     • Identify low bids                                          │
│                                                                   │
│  D. NEGOTIATOR: Counter low bids                                 │
│     • reject_and_counter() tool                                  │
│     • Send counter-offer                                         │
│     • Update bid status → updateBid()                            │
│                                                                   │
│  E. NEGOTIATOR: Accept best deal                                 │
│     • accept_deal() tool with buyer_id                           │
│     • Calculate final economics                                  │
│     • setEconomics() updates state                               │
│     • State → DEAL_SECURED                                       │
│     • Loop terminates                                            │
│                                                                   │
│  F. FALLBACK: Liquidation mode                                   │
│     • If max iterations reached without deal                     │
│     • trigger_liquidation() tool                                 │
│     • State → LIQUIDATION                                        │
│                                                                   │
└───────────────────────┬─────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────────┐
│               6. HUMAN-IN-THE-LOOP APPROVAL                      │
│  • Deal details displayed in EconomicsBar                        │
│  • ApproveButton becomes active (green)                          │
│  • Shows: Gross, Fuel, Risk Buffer, Net Profit                   │
│  • Shows: Route to harbor, distance, ETA                         │
│  • Fisherman clicks "APPROVE DEAL ✓"                             │
│  • POST /api/approve-deal                                        │
│  • Generates approval hash                                       │
│  • setDealApproved(true)                                         │
└───────────────────────┬─────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────────┐
│                    7. DEAL COMPLETION                            │
│  • All components show final state                               │
│  • Terminal log shows complete negotiation history               │
│  • Bid table highlights accepted bid (green border)              │
│  • Certificate shows approval hash                               │
│  • Ready for next auction (reset available)                      │
└─────────────────────────────────────────────────────────────────┘
```

### Data Flow Diagram

```
┌──────────────┐
│   Dashboard  │ (Main Component)
└──────┬───────┘
       │
       │ useAuctionSubscription()
       │
       ▼
┌──────────────────┐         ┌─────────────────┐
│  Auction Store   │◄────────│  State Updates  │
│  (Global State)  │         │  from SSE       │
└────────┬─────────┘         └─────────────────┘
         │
         │ notify()
         │
         ▼
┌─────────────────────────────────────────────┐
│         All Subscribed Components           │
│  • CatchCard                                │
│  • AuctionStatus                            │
│  • BidFeed / BidTable                       │
│  • TransparencyTerminal                     │
│  • EconomicsBar                             │
│  • ApproveButton                            │
│  • QualityCertificate                       │
│  • LogisticsCalculator                      │
└─────────────────────────────────────────────┘
```

### SSE Event Types

Server sends these event types to client:

1. **state**: Auction state change
   ```json
   { "type": "state", "state": "AUCTION_LIVE" }
   ```

2. **log**: Agent reasoning message
   ```json
   {
     "type": "log",
     "agent": "NEGOTIATOR",
     "message": "Initiating multi-channel auction...",
     "timestamp": "14:32:07"
   }
   ```

3. **bid**: New bid placed
   ```json
   {
     "type": "bid",
     "bid": {
       "id": "bid-1",
       "buyer_name": "Kerala Fish Exports",
       "channel": "whatsapp",
       "bid_amount": 450,
       "gross_value": 18000,
       "net_after_fuel": 15900,
       "agent_action": "Evaluating...",
       "status": "ACTIVE",
       "timestamp": "14:32:15"
     }
   }
   ```

4. **bid_update**: Update existing bid
   ```json
   {
     "type": "bid_update",
     "bid_id": "bid-1",
     "updates": {
       "status": "REJECTED",
       "agent_action": "Below mandi floor price"
     }
   }
   ```

5. **threads**: Active agent threads
   ```json
   { "type": "threads", "count": 5 }
   ```

6. **countdown**: Auction countdown
   ```json
   { "type": "countdown", "seconds": 420 }
   ```

7. **harbors**: Harbor options
   ```json
   {
     "type": "harbors",
     "harbors": [
       {
         "name": "Kochi Harbor",
         "distance_km": 12,
         "fuel_cost": 2100,
         "eta_minutes": 45
       }
     ],
     "recommended": { "name": "Kochi Harbor", ... }
   }
   ```

8. **economics**: Final deal economics
   ```json
   {
     "type": "economics",
     "data": {
       "gross_bid": 18000,
       "fuel_cost": 2100,
       "risk_buffer": 540,
       "net_profit": 15360
     }
   }
   ```

---

## UI/UX Design System

### Color Palette

**Background**:
- Primary: `#0a0f1a` (deep navy-black)
- Cards: `bg-slate-800/60` with `backdrop-blur-sm`
- Borders: `border-slate-700/50`

**Accents**:
- Success/Profit: `#00ff88` (neon green)
- Danger/Rejected: `#ff3b5c` (crimson)
- Warning/Pending: `#ffb800` (amber)
- Info/Navigator: `#00d4ff` (cyan)

**Text**:
- Primary: `#e2e8f0` (slate-100)
- Secondary: `#94a3b8` (slate-400)

**Effects**:
- Green glow: `shadow-[0_0_15px_rgba(0,255,136,0.3)]`
- Card shadows: Subtle blur and opacity

### Typography

**Fonts**:
- UI/Headings: Plus Jakarta Sans (sans-serif)
- Terminal/Mono: JetBrains Mono (monospace)

**Sizes**:
- Body: `text-sm` (14px) minimum
- Labels: `text-xs` (12px) minimum
- Headings: `text-lg`, `text-xl`, `text-2xl`
- Terminal: 13px monospace

**Line Heights**:
- Body text: `leading-relaxed` (1.625)
- Normal text: `leading-normal` (1.5)

### Spacing & Layout

**Page-level**:
- Mobile padding: `p-4`
- Desktop padding: `p-5`
- Max width: `max-w-[1920px]` on very large screens

**Cards**:
- Internal padding: `p-5` minimum, `p-6` for primary
- Border radius: `rounded-xl`
- Gap between cards: `gap-4`

**Sections**:
- Header margin: `mb-3` or `mb-4`
- Vertical rhythm: `space-y-3` for lists
- Grid gap: `gap-4`

**Touch Targets**:
- Minimum: 48px height
- Primary actions: 56px height
- Full-width buttons: `w-full`

### Responsive Breakpoints

Single breakpoint strategy:
- Mobile: < 1024px
- Desktop: ≥ 1024px (`lg:`)

**Mobile Layout**:
- Vertical scroll
- Sticky bottom section
- `z-30` for sticky elements
- Floating actions at `z-20`

**Desktop Layout**:
- `grid grid-cols-12 gap-4 h-screen`
- Left panel: `col-span-3`
- Center panel: `col-span-6`
- Right panel: `col-span-3`
- Each panel: `overflow-y-auto` with `min-h-0`

### Component States

**Auction States**:
1. IDLE: Gray, inactive
2. SCANNING: Amber pulse animation
3. AUCTION_LIVE: Green pulse
4. DEAL_SECURED: Solid green
5. LIQUIDATION: Red pulse

**Bid States**:
1. ACTIVE: Default
2. REJECTED: Red tint, strikethrough
3. COUNTERED: Amber, shows original → new amount
4. ACCEPTED: Green border glow, bold

### Animations

**Framer Motion**:
- Bid cards: Fade + slide from left
- State transitions: Smooth opacity changes
- Pulse effects: CSS keyframe animations

**CSS Animations** (via tailwindcss-animate):
- Pulse: For live status indicators
- Fade: For state transitions
- Slide: For new bids appearing

### Accessibility

**Readability**:
- High contrast ratios
- Minimum 14px font size
- Clear visual hierarchy
- Sunlight-readable (high contrast)

**Touch Targets**:
- 48px minimum for all interactive
- 56px for primary CTAs
- Adequate spacing between targets

**Color-blind Safe**:
- Not solely relying on color
- Status text labels
- Icons for channels
- Border/glow in addition to color

---

## AI Integration

### Anthropic Claude Integration

**Model**: `claude-sonnet-4-5-20250514`

**Configuration**:
```typescript
const anthropic = new Anthropic({
  apiKey: process.env.AI_INTEGRATIONS_ANTHROPIC_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_ANTHROPIC_BASE_URL,
});
```

### Vision API (Catch Analysis)

**Endpoint**: `/api/analyze-catch`

**Input**:
- Base64 encoded image
- Media type detection

**Prompt**:
```
You are an expert marine biologist and fish market analyst
specializing in Indian freshwater and marine species.

Analyze this fish photo and return a JSON object with these fields:
- species: Common English name
- species_local: Local Indian name (Malayalam/Hindi/Tamil)
- weight_kg: Estimated weight in kg
- quality_grade: Grade letter (A, B, or C)
- quality_score: Quality score 0-100
- freshness_hours: Estimated hours since catch
```

**Output**:
```json
{
  "species": "Pearl Spot",
  "species_local": "Karimeen",
  "weight_kg": 40,
  "quality_grade": "A",
  "quality_score": 94,
  "freshness_hours": 2,
  "catch_certificate_hash": "0xabc123..."
}
```

### Tool Calling (Multi-Agent Auction)

**Endpoint**: `/api/start-auction`

**Tools Defined**:

1. **check_mandi_price**
   - Get market price for species in region
   - Returns: avg, min, max prices

2. **calculate_fuel_cost**
   - Calculate fuel to reach harbor
   - Returns: cost, distance, ETA

3. **place_bid**
   - Record buyer's bid
   - Input: buyer_id, buyer_name, amount_per_kg, channel
   - Returns: bid_id, gross_value, net_after_fuel

4. **reject_and_counter**
   - Reject bid and send counter-offer
   - Input: buyer_id, counter_amount, reason
   - Returns: rejected status

5. **accept_deal**
   - Accept buyer's bid as final deal
   - Input: buyer_id, final_amount
   - Returns: deal_accepted

6. **trigger_liquidation**
   - Trigger liquidation when no bids
   - Input: reason
   - Returns: liquidation_triggered

**System Prompt**:
```
You are the SAMPARK-OS multi-agent negotiation system for Indian fishermen.
You manage a swarm of specialized AI agents:
- SCOUT: Identifies and grades catch
- NEGOTIATOR: Handles buyer communications and bidding
- AUDITOR: Enforces fair pricing rules and deadlines
- NAVIGATOR: Calculates logistics and fuel costs

Current catch: {species}, {weight}kg, Grade {grade}

SCENARIO: You have 5 buyers interested. Simulate a realistic auction where:
1. First check the mandi/market price
2. Receive bids from at least 4 buyers via WhatsApp/Telegram
3. Reject at least one low bid with counter-offer
4. Evaluate each bid against market price, deducting fuel
5. Accept the best deal that maximizes net profit

Price range: ₹350-500/kg for premium species
Always prioritize fisherman's net profit after fuel deduction.
```

**Iteration Loop**:
- Max 8 iterations
- Each iteration: Claude response → Tool calls → Tool results → Next iteration
- Terminates on: accept_deal() or trigger_liquidation() or max iterations

**Tool Execution**:
- Server simulates tool results
- Market price based on quality score
- Fuel costs from harbor database
- Bids tracked in `bidMap` object
- Economics calculated: gross - fuel - risk_buffer

---

## Database Schema

### Technology
- **Database**: PostgreSQL
- **ORM**: Drizzle ORM
- **Migrations**: drizzle-kit

### Schema Definition

**File**: `shared/schema.ts`

```typescript
import { sql } from "drizzle-orm";
import { pgTable, text, varchar } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});
```

### Tables

**users**:
- `id`: VARCHAR (UUID, auto-generated)
- `username`: TEXT (unique, not null)
- `password`: TEXT (hashed, not null)

### Authentication
- Passport.js with local strategy
- Session-based authentication
- Password hashing (assumed)
- User registration/login endpoints (not shown in current code)

### Session Storage
Two options configured:
1. **Development**: `memorystore` (in-memory)
2. **Production**: `connect-pg-simple` (PostgreSQL)

### Configuration

**File**: `drizzle.config.ts`

```typescript
export default {
  schema: "./shared/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
};
```

**Commands**:
- `npm run db:push`: Push schema to database

---

## API Endpoints

### POST /api/analyze-catch

**Purpose**: Analyze fish photo using Claude vision

**Request**:
```json
{
  "image": "data:image/jpeg;base64,/9j/4AAQSkZJRg..."
}
```

**Response**:
```json
{
  "species": "Pearl Spot",
  "species_local": "Karimeen",
  "weight_kg": 40,
  "quality_grade": "A",
  "quality_score": 94,
  "freshness_hours": 2,
  "catch_certificate_hash": "0x3f7b8a9c1e2d4f6a..."
}
```

**Error Response**:
```json
{
  "error": "No image provided"
}
```

**Flow**:
1. Extract base64 data and media type
2. Call Claude vision API with image
3. Parse JSON response from Claude
4. Generate catch certificate hash (random bytes)
5. Store in `currentAuction` in-memory state
6. Return analysis to client

---

### POST /api/start-auction

**Purpose**: Start multi-agent auction with SSE streaming

**Request**:
```json
{
  "catch_analysis": {
    "species": "Pearl Spot",
    "species_local": "Karimeen",
    "weight_kg": 40,
    "quality_grade": "A",
    "quality_score": 94
  }
}
```

**Response**: Server-Sent Events (SSE) stream

**Headers**:
- `Content-Type: text/event-stream`
- `Cache-Control: no-cache`
- `Connection: keep-alive`
- `X-Accel-Buffering: no`

**Event Stream**:
```
data: {"type":"state","state":"AUCTION_LIVE"}

data: {"type":"threads","count":5}

data: {"type":"countdown","seconds":420}

data: {"type":"log","agent":"NAVIGATOR","message":"Calculating fuel ROI...","timestamp":"14:32:07"}

data: {"type":"harbors","harbors":[...],"recommended":{...}}

data: {"type":"bid","bid":{...}}

data: [DONE]
```

**Flow**:
1. Validate catch_analysis
2. Set SSE headers
3. Send initial state events
4. Calculate harbor logistics
5. Stream harbor data
6. Enter Claude tool-calling loop (max 8 iterations)
7. For each Claude response:
   - Parse text for agent tags
   - Stream log entries
   - Execute tool calls
   - Stream bid updates
   - Update economics
8. On accept_deal: stream final economics, end
9. On liquidation: stream liquidation event, end
10. Send `[DONE]` and close stream

---

### POST /api/approve-deal

**Purpose**: Human confirms the final deal

**Request**:
```json
{
  "gross_bid": 18000,
  "net_profit": 15360,
  "harbor": "Kochi Harbor"
}
```

**Response**:
```json
{
  "approved": true,
  "approved_at": "2025-02-15T14:35:22.123Z",
  "gross_bid": 18000,
  "net_profit": 15360,
  "harbor": "Kochi Harbor",
  "approval_hash": "0x8f3a2b7c9d1e5f4a"
}
```

**Flow**:
1. Extract deal parameters
2. Generate approval hash (random bytes)
3. Store approval in `currentAuction`
4. Return approval confirmation

---

### GET /api/auction-status

**Purpose**: Get current auction state

**Response**:
```json
{
  "state": "DEAL_SECURED",
  "has_catch": true,
  "approved": true
}
```

**Flow**:
1. Check `currentAuction` in-memory state
2. Return state, catch presence, approval status

---

## State Management

### Pattern: Reactive Store

**File**: `client/src/lib/auction-store.ts`

**Concept**:
- Single global state object
- Set of listener callbacks
- State update functions trigger listeners
- React hook subscribes components to state

**Implementation**:

```typescript
let globalState: AuctionData = { ...INITIAL_AUCTION_DATA };
let listeners: Set<() => void> = new Set();

function notify() {
  listeners.forEach((l) => l());
}

export function setAuctionState(state: AuctionState) {
  globalState = { ...globalState, state };
  notify();
}

export function useAuctionSubscription(): AuctionData {
  const [state, setState] = useState<AuctionData>({ ...globalState });

  useEffect(() => {
    const cb = () => setState({ ...globalState });
    listeners.add(cb);
    return () => { listeners.delete(cb); };
  }, []);

  return state;
}
```

**Advantages**:
- Simple, lightweight (no external library)
- Predictable updates
- Easy debugging
- TypeScript typed
- Reactive to SSE events

**Usage in Components**:
```typescript
function Dashboard() {
  const auction = useAuctionSubscription();

  // auction.state, auction.bids, etc. automatically update
  // when any state update function is called
}
```

**State Update Flow**:
```
SSE Event
  ↓
handleSSEEvent()
  ↓
State Update Function (e.g., addBid())
  ↓
globalState mutation + notify()
  ↓
All listener callbacks fired
  ↓
All subscribed components re-render
  ↓
UI updates
```

---

## Demo Mode

### Purpose
- Showcase all features without backend
- Scripted realistic auction flow
- Pre-loaded demo data
- No AI API calls needed

### Activation
- Keyboard shortcut: `Ctrl+Shift+D`
- "DEMO" button in UI
- Automatically stops any running demo first

### Demo Flow

**File**: `client/src/lib/demo-mode.ts`

**Steps**:

1. **Reset State** (0ms)
   - `resetAuction()`
   - Clear all previous data

2. **Load Photo** (600ms)
   - Set demo fish photo: `/demo/demo-karimeen.jpg`
   - Update photo URL in dashboard

3. **Start Scanning** (1500ms)
   - State: IDLE → SCANNING
   - Log: "Initiating catch scan via Claude Vision API..."

4. **Analysis Complete** (2300ms)
   - State: SCANNING → ANALYZED
   - Set catch analysis (Karimeen, 40kg, Grade A, 94%)
   - Log: Species identified
   - Log: Variant detected (Sea Karimeen)

5. **Generate Certificate** (3100ms)
   - Add certificate hash
   - Log: Certificate generated

6. **Start Auction** (3900ms)
   - State: ANALYZED → AUCTION_LIVE
   - Set countdown: 420 seconds (7 minutes)
   - Set active threads: 5
   - Log: "Auction live - 5 agents negotiating..."

7. **Navigator Analysis** (5200ms)
   - Calculate harbor logistics
   - Set harbors: Kochi (recommended), Alappuzha, Munambam
   - Log: Fuel ROI calculated

8. **Mandi Price Check** (6800ms)
   - Log: Market price check (₹420/kg avg)

9. **Contact Buyers** (8100ms)
   - Log: Contacting 5 buyers via WhatsApp/Telegram

10. **Receive Bids** (9400ms - 16000ms)
    - Bid 1: Kerala Fish Exports, ₹450/kg (WhatsApp) - ACTIVE
    - Bid 2: Mumbai Wholesale Seafood, ₹380/kg (Telegram) - REJECTED
    - Bid 3: Gujarat Group Export, ₹465/kg (WhatsApp) - ACTIVE
    - Bid 4: Hyderabad Karimeen Central, ₹395/kg (Telegram) - COUNTERED
    - Bid 5: Pune K&F Trading, ₹475/kg (WhatsApp) - ACCEPTED

11. **Reject Low Bid** (13200ms)
    - Update Bid 2: Status → REJECTED
    - Log: Below mandi floor, rejected

12. **Counter Bid** (15600ms)
    - Update Bid 4: Status → COUNTERED
    - Show counter-offer ₹420/kg

13. **Accept Best Deal** (19000ms)
    - Update Bid 5: Status → ACCEPTED
    - State: AUCTION_LIVE → DEAL_SECURED
    - Set economics:
      - Gross: ₹19,000
      - Fuel: ₹2,100
      - Risk: ₹570
      - Net: ₹16,330
    - Set countdown: 0
    - Set threads: 0
    - Log: Deal secured

14. **Finalize** (20500ms)
    - Log: Route confirmed to Kochi Harbor

**Timing**:
- Total demo duration: ~20 seconds
- Realistic delays between events
- Smooth progression
- All features demonstrated

**Implementation**:
- Uses `setTimeout` for delays
- Timers stored in `demoTimers` array
- `stopDemo()` clears all timers
- Countdown interval managed separately

---

## Deployment & Build

### Development Mode

**Start Dev Server**:
```bash
npm run dev
```

**What Happens**:
- `tsx server/index.ts` runs in watch mode
- Vite dev server starts (frontend)
- Express server runs on configured port
- Hot module replacement (HMR) enabled
- TypeScript compilation on-the-fly

**Environment**:
- `NODE_ENV=development`
- Vite middleware integrated
- Source maps enabled

---

### Production Build

**Build Command**:
```bash
npm run build
```

**Build Script** (`script/build.ts`):
1. Runs Vite build (frontend)
2. Bundles server with esbuild
3. Outputs to `dist/` directory
4. Creates optimized, minified bundles

**Start Production**:
```bash
npm start
```

**What Happens**:
- `NODE_ENV=production`
- Runs `dist/index.cjs`
- Serves static files from `dist/public`
- No Vite middleware
- Optimized performance

---

### Type Checking

```bash
npm run check
```

Runs TypeScript compiler in check mode (no emit).

---

### Database Migrations

```bash
npm run db:push
```

Pushes Drizzle schema to PostgreSQL database.

---

### Environment Variables

**Required**:
- `AI_INTEGRATIONS_ANTHROPIC_API_KEY`: Anthropic API key
- `DATABASE_URL`: PostgreSQL connection string

**Optional**:
- `AI_INTEGRATIONS_ANTHROPIC_BASE_URL`: Custom Anthropic API endpoint
- `PORT`: Server port (default from Express config)

---

### Deployment Platforms

**Replit**:
- Native integration via `.replit` config
- Auto-deployment on commit
- Environment secrets managed in Replit UI

**Other Platforms** (Vercel, Railway, Render, etc.):
- Build command: `npm run build`
- Start command: `npm start`
- Node version: 20.x
- Set environment variables in platform UI
- Ensure PostgreSQL database provisioned

---

### File Serving

**Development**:
- Vite serves files from `client/`
- HMR websocket on Vite port

**Production**:
- Express serves static from `dist/public`
- SPA fallback to `index.html`
- Configured in `server/static.ts`

---

## Summary

**SAMPARK-OS** is a sophisticated full-stack application combining:
- Modern React frontend with Tailwind CSS
- Express backend with TypeScript
- Anthropic Claude AI (vision + tool-calling)
- Real-time SSE for live updates
- Custom reactive state management
- PostgreSQL database with Drizzle ORM
- Responsive mobile-first design
- Multi-language support
- Production-ready architecture

**Key Innovations**:
1. Multi-agent AI system for autonomous negotiation
2. Computer vision for fish species identification
3. Real-time transparent AI reasoning display
4. Economic optimization (fuel costs, market prices)
5. Human-in-the-loop final approval
6. Bloomberg Terminal-inspired UI
7. Fully functional demo mode
8. Localized for Indian languages and markets

**Target Impact**:
- Empower fishermen with AI-powered negotiation
- Maximize profits through logistics optimization
- Reduce information asymmetry in fish markets
- Build trust through transparency
- Enable mobile-first access for remote fishermen

---

*Last Updated: February 15, 2026*
*Version: 1.0.0 (Matsya Edition)*
