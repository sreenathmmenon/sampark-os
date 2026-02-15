# SAMPARK-OS (Matsya Edition)

## Overview
Autonomous multi-agent AI broker for Indian fishermen. Uses Claude AI for fish catch analysis (vision) and multi-agent tool-calling negotiation to maximize profit. Bloomberg Terminal-inspired dark trading floor UI.

## Architecture
- **Frontend**: React + Vite + Tailwind CSS (dark theme, `#0a0f1a` background)
- **Backend**: Express.js with Anthropic SDK (Claude claude-sonnet-4-5 for vision + tool-calling)
- **State**: Client-side reactive store (`client/src/lib/auction-store.ts`)
- **Streaming**: Server-Sent Events for real-time auction updates

## Key Files
- `client/src/pages/dashboard.tsx` - Main dashboard with mobile/desktop layouts
- `client/src/lib/auction-store.ts` - Reactive state management for auction data
- `client/src/lib/demo-mode.ts` - Scripted demo flow (Ctrl+Shift+D)
- `client/src/lib/types.ts` - TypeScript interfaces for all data types
- `server/routes.ts` - API endpoints (analyze-catch, start-auction, approve-deal)

## API Endpoints
- `POST /api/analyze-catch` - Claude vision analyzes fish photo (base64)
- `POST /api/start-auction` - Starts multi-agent negotiation with SSE streaming
- `POST /api/approve-deal` - Human-in-the-loop deal confirmation
- `GET /api/auction-status` - Current auction state

## Design System
- Background: `#0a0f1a` (deep navy-black)
- Neon green: `#00ff88` (success/profit)
- Crimson: `#ff3b5c` (danger/rejected)
- Amber: `#ffb800` (warning/pending)
- Cyan: `#00d4ff` (info/navigator)
- Font sans: Plus Jakarta Sans
- Font mono: JetBrains Mono

## User Preferences
- Dark theme only (no light mode toggle)
- Mobile-first responsive design
- All monetary values in INR (₹)
- All times in IST
- Demo mode via Ctrl+Shift+D or DEMO button
