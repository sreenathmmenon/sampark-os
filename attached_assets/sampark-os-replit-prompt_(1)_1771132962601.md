# SAMPARK-OS: Replit Build Prompt (Hackathon-Optimized)

## Paste this into Replit to scaffold the project:

---

Build a mobile-first, full-stack application called **"Sampark-OS (Matsya Edition)"** — an autonomous multi-agent AI broker for Indian fishermen. Use **React (Vite) + Tailwind CSS** frontend and **Python FastAPI** backend.

---

### DESIGN SYSTEM & AESTHETIC:

- **Theme:** Dark "Live Trading Floor" — inspired by Bloomberg Terminal meets Indian fishing harbor at dawn.
- **Background:** `#0a0f1a` (deep navy-black). NOT pure black.
- **Primary accent:** Neon green `#00ff88` for profit/success states.
- **Danger accent:** Crimson `#ff3b5c` for rejected bids, alerts, liquidation mode.
- **Warning accent:** Amber `#ffb800` for pending/in-progress states.
- **Text:** `#e2e8f0` (slate-100) primary, `#94a3b8` (slate-400) secondary.
- **Font:** Use `"JetBrains Mono"` for the terminal/monospace sections (import from Google Fonts). Use `"Plus Jakarta Sans"` for headings and UI (import from Google Fonts).
- **Cards:** `bg-slate-800/60` with `backdrop-blur-sm` and subtle `border border-slate-700/50`. Rounded corners `rounded-xl`.
- **Glow effects:** Neon green glow `shadow-[0_0_15px_rgba(0,255,136,0.3)]` on active/success elements.
- **Touch targets:** Minimum 48px height for all interactive elements. 56px for primary actions.
- **Sunlight readable:** High contrast ratio. No thin/light font weights below 16px.

### SPACING & LAYOUT (CRITICAL — Production Quality):

This must look like a real production SaaS dashboard, NOT a hackathon toy project. Follow these rules strictly:

- **Page padding:** `p-4` on mobile, `p-5` on desktop. Never `p-1` or `p-2` for page-level containers.
- **Card internal padding:** `p-5` minimum for all cards. `p-6` for primary content cards. Never cram content edge-to-edge inside a card.
- **Gap between cards/sections:** `gap-4` minimum on mobile, `gap-4` on desktop grid. Consistent spacing everywhere.
- **Section headers:** Always have `mb-3` or `mb-4` spacing below headings before content starts. Headers should breathe.
- **Text line-height:** Use `leading-relaxed` (1.625) for any body/paragraph text. `leading-normal` (1.5) minimum for all text.
- **Font sizes:** Body text minimum `text-sm` (14px). Labels/captions minimum `text-xs` (12px). NEVER use text smaller than 12px.
- **Vertical rhythm:** Consistent spacing between repeating elements (bid cards, log entries, list items). Use `space-y-3` for lists.
- **NO CONTENT OVERLAP:** Every section must have defined boundaries. Use `overflow-hidden` on cards. Use `overflow-y-auto` with proper `max-h-[value]` on scrollable areas (terminal, bid feed) so they never overflow into adjacent sections.
- **Desktop grid:** Each panel must have `overflow-y-auto` so content scrolls within its panel, never bleeds into neighboring panels. Set `h-screen` on the grid container and `min-h-0` on grid children to enable proper flex/grid overflow behavior.
- **Mobile scrolling:** The page should scroll naturally on mobile. The bottom APPROVE button section should be `sticky bottom-0` with a `bg-gradient-to-t from-[#0a0f1a] via-[#0a0f1a] to-transparent` fade so content scrolls underneath it cleanly.
- **Z-index discipline:** Sticky bottom bar: `z-30`. Floating action buttons: `z-20`. Modals/overlays: `z-50`. No random z-index values.
- **Empty states:** Every section should have a clean empty/idle state (e.g., "No active bids" centered in the bid feed, "Awaiting catch photo..." in the analysis card). Never show a blank white/black void.
- **Responsive breakpoints:** Use `lg:` (1024px) as the single breakpoint between mobile and desktop. Test that NOTHING overlaps or breaks at exactly 1024px width.
- **Max-widths:** On very large screens (1920px+), the dashboard should NOT stretch infinitely. Add `max-w-[1920px] mx-auto` on the outermost container to keep it contained.
- **Border separators:** Use `border-b border-slate-700/30` between repeating items in lists instead of heavy dividers. Subtle, not heavy.
- **Scrollbar styling:** Style scrollbars to match the dark theme: thin, slate-600 thumb, transparent track. Use `scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-transparent` (install `tailwind-scrollbar` plugin) or CSS `::-webkit-scrollbar` styles.

---

### PAGE STRUCTURE (Single Page App with Responsive Layout):

#### A) MOBILE VIEW (default on small screens — "Fisherman's Phone"):
This simulates what the fisherman sees on his phone at sea.

1. **Top Bar:** App name "SAMPARK" with a small green pulse dot (system active indicator) and current time in IST.

2. **Catch Card:** A rounded card showing:
   - Placeholder for camera photo (a dashed border upload area with camera icon)
   - When photo is "analyzed": Show species name (e.g., "Karimeen / Pearl Spot"), estimated weight "~40 kg", quality grade badge (e.g., "Grade A · 94%") with green glow
   - A small "Catch Certificate #" hash string for trust

3. **Auction Status Banner:** 
   - States: "IDLE" (gray) → "SCANNING CATCH" (amber pulse) → "AUCTION LIVE" (green pulse) → "DEAL SECURED" (solid green) → "LIQUIDATION MODE" (red pulse)
   - Show a countdown timer when auction is live (e.g., "6:42 remaining")

4. **Live Bid Feed:** A vertical scrolling list of incoming bids:
   - Each bid card shows: Buyer name, channel icon (WhatsApp green / Telegram blue), bid amount (₹/kg), and status pill ("ACTIVE" / "REJECTED" / "COUNTERED" / "ACCEPTED")
   - Rejected bids have a strikethrough and red tint
   - The highest current bid is highlighted with green border

5. **Bottom Section (sticky):**
   - **Net Profit Summary:** "Gross: ₹18,400 → Fuel: -₹2,100 → Net: ₹16,300" in a horizontal bar
   - **Big Green "APPROVE DEAL ✓" Button:** Full width, 56px tall, neon green background, bold white text. This is the Human-in-the-Loop confirmation.
   - Below button: small text "Route to: Kochi Harbor · 12km · ~45 min"

6. **Floating Action Buttons (bottom-right, above APPROVE):**
   - Microphone icon button (voice command trigger) — amber accent
   - Camera icon button (take photo) — slate accent

#### B) DESKTOP VIEW (on `lg:` screens — "Command Center / God Mode"):
This is what the judges see during the demo. A 4-panel grid.

**Layout:** `grid grid-cols-12 gap-3 h-screen p-3`

1. **Left Panel (col-span-3) — "Catch Intelligence":**
   - The fish photo analysis card (same data as mobile but expanded)
   - Below it: A "Quality Certificate" card showing the immutable hash, timestamp, GPS coordinates (mock), and freshness score with a progress bar
   - Below that: A "Logistics Calculator" card showing distance to 3 harbors with fuel cost and ETA for each

2. **Center Panel (col-span-6) — "Swarm Trading Floor":**
   - **Header:** "LIVE AUCTION" with green pulse dot + countdown timer + "5 Active Threads" badge
   - **Bid Table:** A data table with columns: Buyer | Channel (WhatsApp/Telegram icon) | Bid (₹/kg) | Gross Value | Net After Fuel | Agent Action | Status
   - Rows should animate in (fade + slide from left)
   - Rejected rows: red tint + strikethrough on bid amount
   - Counter-offers: show original → countered amount with arrow
   - **The "winning" row** has a green left border glow
   - Below table: A horizontal "Negotiation Timeline" — small dots connected by lines showing the sequence: "Photo Analyzed → 5 Buyers Contacted → 3 Bids Received → 1 Rejected → Counter Sent → Deal Locked"

3. **Right Panel (col-span-3) — "Transparency Terminal":**
   - **Header:** "AI REASONING LOG" with a blinking cursor icon
   - A scrolling monospace terminal (JetBrains Mono, 13px, green-on-dark)
   - Each log entry has a timestamp `[14:32:07]` and agent tag `[NEGOTIATOR]`, `[SCOUT]`, `[AUDITOR]`, `[NAVIGATOR]`
   - Color-code by agent: Scout=cyan, Negotiator=green, Auditor=red, Navigator=amber
   - Example entries:
     ```
     [14:32:01] [SCOUT] Catch identified: Karimeen (Pearl Spot), ~40kg, Grade A (94%)
     [14:32:03] [NAVIGATOR] Calculating fuel ROI for 3 harbors...
     [14:32:05] [NEGOTIATOR] Initiating WhatsApp auction with 3 premium buyers
     [14:32:12] [NEGOTIATOR] Buyer "Kochi Fresh Exports" bid ₹410/kg — BELOW MCP average ₹440
     [14:32:12] [NEGOTIATOR] → Tool Call: reject_and_counter(buyer_id=KFE, counter=₹435)
     [14:32:18] [AUDITOR] 3:30 PM deadline in 58 min. Premium auction proceeds.
     [14:32:25] [NEGOTIATOR] Buyer "Marina Wholesale" bid ₹445/kg — ABOVE MCP average ✓
     [14:32:25] [NEGOTIATOR] → Tool Call: calculate_net_margin(bid=445, harbor=kochi)
     [14:32:26] [NAVIGATOR] Net margin: ₹445 - ₹52.50 fuel = ₹392.50/kg effective
     [14:32:28] [NEGOTIATOR] Recommending ACCEPT. Best net margin across all bids.
     ```
   - Auto-scroll to bottom. New entries animate in with a subtle flash.

4. **Bottom Strip (col-span-12) — "Economic Engine Summary":**
   - A horizontal bar with large numbers: 
     - "GROSS BID: ₹17,800" (white) 
     - " minus FUEL: ₹2,100" (red) 
     - " minus RISK BUFFER: ₹500" (amber) 
     - " = NET PROFIT: ₹15,200" (large, neon green, glowing)
   - Right side: "Route: Kochi Harbor" with a small map placeholder (static image or colored div)
   - Far right: The big "APPROVE DEAL ✓" button (same as mobile)

---

### BACKEND (FastAPI — Python):

Create a `server/main.py` with:

1. **`POST /api/analyze-catch`**: 
   - Accepts an image (base64) and optional voice transcript text
   - Calls Claude API (claude-sonnet-4-5-20250929) with vision to analyze the fish photo
   - System prompt tells Claude to identify species, estimate weight, assess quality, and return structured JSON
   - Returns: `{ species, weight_kg, quality_grade, quality_score, catch_certificate_hash, freshness_hours }`

2. **`POST /api/start-auction`**: 
   - Accepts the catch analysis data
   - Triggers the multi-agent negotiation simulation
   - This is the CORE agentic endpoint: 
     - Uses Claude with tool-calling (function calling) to simulate the Negotiation Agent
     - Define tools: `check_mandi_price(species, region)`, `calculate_fuel_cost(origin_lat, origin_lng, harbor)`, `place_bid(buyer_id, amount)`, `reject_and_counter(buyer_id, counter_amount)`, `accept_deal(buyer_id)`, `trigger_liquidation()`
     - Claude reasons through which tools to call based on incoming "bids" (simulated data)
     - Stream the agent's reasoning steps back via Server-Sent Events (SSE) so the Transparency Terminal updates in real-time
   - Returns: SSE stream of agent reasoning + final deal recommendation

3. **`POST /api/approve-deal`**:
   - The Human-in-the-Loop confirmation endpoint
   - Logs the approved deal and returns confirmation

4. **`GET /api/auction-status`**:
   - Returns current auction state for UI polling

**Environment variables needed:** `ANTHROPIC_API_KEY`

**Python dependencies:** `fastapi`, `uvicorn`, `anthropic`, `python-multipart`

---

### DEMO MODE (Critical for Hackathon):

Add a hidden keyboard shortcut `Ctrl+Shift+D` or a small "DEMO" button in the top-right corner that triggers a scripted end-to-end flow:

1. Auto-loads a pre-set fish photo (bundle a karimeen photo in `/public/demo/`)
2. Fires the analyze-catch API
3. Auto-starts the auction
4. Streams realistic agent reasoning into the terminal over ~30 seconds
5. Shows bids appearing one by one (with one dramatic rejection)
6. Culminates in "DEAL SECURED" state with confetti or green screen flash
7. Waits for the human "APPROVE" click

This lets me run a clean, unbreakable demo during the 2-minute pitch without fumbling.

---

### IMPORTANT CONSTRAINTS:
- Do NOT use framer-motion. Use Tailwind CSS transitions and `@keyframes` animations only.
- Do NOT set up actual Twilio, WhatsApp, or Telegram integrations. The multi-channel concept is shown via UI icons and the agent's reasoning log mentioning these channels.
- The Claude API integration must be REAL — not mocked. The vision analysis and tool-calling negotiation must actually call the Anthropic API.
- Use `lucide-react` for all icons.
- All monetary values in Indian Rupees (₹). All times in IST.
- Include a `README.md` explaining the project concept and the Robert Jensen 2007 Kerala fisheries study that inspired it.

---

### PRODUCTION QUALITY CHECKLIST (Non-Negotiable):

This app will be demoed to senior leadership from Anthropic, Replit, and Lightspeed Venture Partners. It must look and feel like a funded startup's MVP, not a weekend hackathon project.

1. **No visual bugs:** No text clipping, no horizontal scrollbars, no elements jumping on load, no flash of unstyled content.
2. **Loading states:** Every API call must show a loading skeleton or spinner. Use subtle pulse animations (`animate-pulse`) on skeleton placeholders that match the card dimensions.
3. **Error states:** If an API call fails, show a clean inline error message (not a browser alert or console error). Red border on the relevant card + retry button.
4. **Transitions:** State changes should animate. Bid status changes: fade + color transition (200ms). New bid appearing: slide-in from left (300ms). Auction status banner: smooth color transition.
5. **Consistent border radius:** `rounded-xl` (12px) on all cards. `rounded-lg` (8px) on buttons and badges. `rounded-full` on status dots and avatars. Never mix `rounded-md` and `rounded-xl` randomly.
6. **Icon consistency:** All icons from `lucide-react`. Size `w-4 h-4` for inline icons, `w-5 h-5` for button icons, `w-6 h-6` for feature icons. Always paired with `flex items-center gap-2` for alignment.
7. **Typography hierarchy:** Only 4 sizes used consistently: `text-2xl font-bold` (section titles), `text-lg font-semibold` (card headers), `text-sm` (body/data), `text-xs` (labels/timestamps). No random sizing.
8. **Hover states on all interactive elements:** Cards: `hover:border-slate-600`. Buttons: `hover:brightness-110`. Table rows: `hover:bg-slate-700/30`.
9. **Focus rings:** All buttons and inputs must have visible focus rings for accessibility: `focus:ring-2 focus:ring-green-400/50 focus:outline-none`.
10. **No orphaned elements:** Every section has a header. Every data point has a label. No floating numbers without context.
