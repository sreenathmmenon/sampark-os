import {
  resetAuction,
  setAuctionState,
  setCatchAnalysis,
  addBid,
  updateBid,
  addLogEntry,
  setCountdown,
  setActiveThreads,
  setEconomics,
  setHarbors,
} from "./auction-store";
import { type LogEntry, type Bid } from "./types";
import { HARBORS, BUYERS, FISH_SPECIES } from "@/data/marketData";

let demoTimers: ReturnType<typeof setTimeout>[] = [];
let countdownInterval: ReturnType<typeof setInterval> | null = null;

export function stopDemo() {
  demoTimers.forEach(clearTimeout);
  demoTimers = [];
  if (countdownInterval) clearInterval(countdownInterval);
  countdownInterval = null;
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    const t = setTimeout(resolve, ms);
    demoTimers.push(t);
  });
}

function getIST(): string {
  return new Date().toLocaleTimeString("en-IN", {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}

function makeLog(agent: LogEntry["agent"], message: string): LogEntry {
  return {
    id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    timestamp: getIST(),
    agent,
    message,
  };
}

function makeTime(): string {
  return new Date().toLocaleTimeString("en-IN", {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

const kochi = HARBORS.find((h) => h.id === "kochi_harbor")!;
const munambam = HARBORS.find((h) => h.id === "munambam")!;
const vypin = HARBORS.find((h) => h.id === "vypin")!;
const fortKochi = HARBORS.find((h) => h.id === "fort_kochi")!;
const chellanam = HARBORS.find((h) => h.id === "chellanam")!;

const buyerKFE = BUYERS.find((b) => b.id === "KFE")!;
const buyerMWS = BUYERS.find((b) => b.id === "MWS")!;
const buyerGGE = BUYERS.find((b) => b.id === "GGE")!;
const buyerHKC = BUYERS.find((b) => b.id === "HKC")!;
const buyerPKF = BUYERS.find((b) => b.id === "PKF")!;

const karimeen = FISH_SPECIES.karimeen;

export async function runDemo(onPhotoSet: (url: string) => void) {
  stopDemo();
  resetAuction();

  onPhotoSet("/demo/demo-karimeen.jpg");
  await delay(600);

  setAuctionState("SCANNING");
  addLogEntry(
    makeLog("SCOUT", "Initiating catch scan via Claude Vision API..."),
  );
  await delay(1500);

  addLogEntry(
    makeLog(
      "SCOUT",
      `Catch identified: Karimeen / ${karimeen.malayalam} (Pearl Spot), ~40kg, Grade A (94%)`,
    ),
  );
  await delay(800);

  addLogEntry(
    makeLog(
      "SCOUT",
      `Variant detected: Sea Karimeen (കടൽ കരിമീൻ) — premium saltwater variety`,
    ),
  );
  await delay(600);

  setCatchAnalysis({
    species: "Pearl Spot",
    species_local: `${karimeen.malayalam} (Karimeen)`,
    weight_kg: 40,
    quality_grade: "A",
    quality_score: 94,
    catch_certificate_hash: "0x7f3a9b2e1c4d8f6a0e5b3c7d9a2f4e6b8c1d3e5f",
    freshness_hours: 2,
  });
  await delay(500);

  addLogEntry(
    makeLog(
      "SCOUT",
      `Immutable Catch Certificate generated: 0x7f3a...3e5f | Freshness: 8h remaining`,
    ),
  );
  await delay(1000);

  addLogEntry(
    makeLog(
      "NAVIGATOR",
      `Calculating fuel ROI for 5 harbors from Kadamakudy (9.99°N, 76.31°E)...`,
    ),
  );
  await delay(800);

  addLogEntry(
    makeLog(
      "NAVIGATOR",
      `→ Tool Call: calculate_fuel_cost(origin=kadamakudy, harbors=[kochi, vypin, munambam, fort_kochi, chellanam])`,
    ),
  );
  await delay(600);

  setHarbors(
    [
      {
        name: kochi.name,
        distance_km: kochi.distanceFromKadamakudy_km,
        fuel_cost: kochi.fuelCostOneWay,
        eta_minutes: kochi.transitTime_min,
      },
      {
        name: vypin.name,
        distance_km: vypin.distanceFromKadamakudy_km,
        fuel_cost: vypin.fuelCostOneWay,
        eta_minutes: vypin.transitTime_min,
      },
      {
        name: munambam.name,
        distance_km: munambam.distanceFromKadamakudy_km,
        fuel_cost: munambam.fuelCostOneWay,
        eta_minutes: munambam.transitTime_min,
      },
      {
        name: fortKochi.name,
        distance_km: fortKochi.distanceFromKadamakudy_km,
        fuel_cost: fortKochi.fuelCostOneWay,
        eta_minutes: fortKochi.transitTime_min,
      },
      {
        name: chellanam.name,
        distance_km: chellanam.distanceFromKadamakudy_km,
        fuel_cost: chellanam.fuelCostOneWay,
        eta_minutes: chellanam.transitTime_min,
      },
    ],
    {
      name: kochi.name,
      distance_km: kochi.distanceFromKadamakudy_km,
      fuel_cost: kochi.fuelCostOneWay,
      eta_minutes: kochi.transitTime_min,
    },
  );
  await delay(400);

  addLogEntry(
    makeLog(
      "NAVIGATOR",
      `Kochi: ₹${kochi.fuelCostOneWay} fuel, ${kochi.transitTime_min}min | Vypin: ₹${vypin.fuelCostOneWay}, ${vypin.transitTime_min}min | Munambam: ₹${munambam.fuelCostOneWay}, ${munambam.transitTime_min}min`,
    ),
  );
  await delay(500);

  addLogEntry(
    makeLog(
      "NAVIGATOR",
      `Optimal harbor: ${kochi.name} — best buyer density vs fuel cost ratio (diesel @ ₹92/L)`,
    ),
  );
  await delay(1200);

  setAuctionState("AUCTION_LIVE");
  setActiveThreads(5);

  let countdown = 420;
  setCountdown(countdown);
  countdownInterval = setInterval(() => {
    countdown = Math.max(0, countdown - 1);
    setCountdown(countdown);
  }, 1000);

  addLogEntry(
    makeLog(
      "NEGOTIATOR",
      `Initiating WhatsApp auction with 3 premium buyers (${buyerKFE.name}, ${buyerMWS.name}, ${buyerGGE.name})`,
    ),
  );
  await delay(600);

  addLogEntry(
    makeLog(
      "NEGOTIATOR",
      `Broadcasting Telegram flash-auction to 2 bulk buyers (${buyerHKC.name}, ${buyerPKF.name})`,
    ),
  );
  await delay(800);

  addLogEntry(
    makeLog(
      "NEGOTIATOR",
      `→ Tool Call: check_mandi_price(species=karimeen, region=kochi)`,
    ),
  );
  await delay(600);

  addLogEntry(
    makeLog(
      "AUDITOR",
      `MCP Data: Kochi wholesale avg ₹${karimeen.wholesalePrice}/kg (range ₹340–₹440). Setting reserve at ₹340/kg.`,
    ),
  );
  await delay(1500);

  // ── BID 1: Low-ball from Kochi Fresh Exports ─────────────
  const bid1: Bid = {
    id: "bid-1",
    buyer_name: buyerKFE.name,
    channel: "whatsapp",
    bid_amount: 310,
    gross_value: 12400,
    net_after_fuel: 11620,
    agent_action: "Evaluating...",
    status: "ACTIVE",
    timestamp: makeTime(),
  };
  addBid(bid1);
  addLogEntry(
    makeLog("NEGOTIATOR", `📱 WhatsApp bid from ${buyerKFE.name}: ₹310/kg`),
  );
  await delay(1000);

  addLogEntry(
    makeLog(
      "NEGOTIATOR",
      `⚠️ Bid ₹310 is BELOW reserve ₹340 and 18% under MCP avg ₹${karimeen.wholesalePrice}. PREDATORY BID.`,
    ),
  );
  await delay(800);

  addLogEntry(
    makeLog(
      "NEGOTIATOR",
      `→ Tool Call: reject_and_counter(buyer_id=KFE, counter=₹365/kg, reason="below MCP floor")`,
    ),
  );
  updateBid("bid-1", {
    status: "REJECTED",
    agent_action: "Rejected: predatory, below MCP floor",
  });
  addLogEntry(
    makeLog(
      "AUDITOR",
      `Bid ₹310/kg REJECTED. Counter-offer ₹365/kg sent to ${buyerKFE.name}`,
    ),
  );
  await delay(2000);

  // ── BID 2: Marina Wholesale ──────────────────────────────
  const bid2: Bid = {
    id: "bid-2",
    buyer_name: buyerMWS.name,
    channel: "whatsapp",
    bid_amount: 390,
    gross_value: 15600,
    net_after_fuel: 14820,
    agent_action: "Evaluating...",
    status: "ACTIVE",
    timestamp: makeTime(),
  };
  addBid(bid2);
  addLogEntry(
    makeLog("NEGOTIATOR", `📱 WhatsApp bid from ${buyerMWS.name}: ₹390/kg`),
  );
  await delay(800);

  addLogEntry(
    makeLog(
      "NEGOTIATOR",
      `✅ Bid ₹390 is ABOVE MCP avg ₹${karimeen.wholesalePrice}. Evaluating net margin...`,
    ),
  );
  await delay(600);

  addLogEntry(
    makeLog(
      "NEGOTIATOR",
      `→ Tool Call: calculate_net_margin(bid=390, weight=40, harbor=kochi)`,
    ),
  );
  await delay(400);

  addLogEntry(
    makeLog(
      "NAVIGATOR",
      `Gross: ₹15,600 | Fuel to Kochi: -₹${kochi.fuelCostOneWay} | Risk buffer: -₹500 | Net: ₹${15600 - kochi.fuelCostOneWay - 500}`,
    ),
  );
  await delay(1500);

  // ── BID 3: Telegram bulk (REJECT) ────────────────────────
  const bid3: Bid = {
    id: "bid-3",
    buyer_name: buyerHKC.name,
    channel: "telegram",
    bid_amount: 280,
    gross_value: 11200,
    net_after_fuel: 10420,
    agent_action: "Evaluating...",
    status: "ACTIVE",
    timestamp: makeTime(),
  };
  addBid(bid3);
  addLogEntry(
    makeLog(
      "NEGOTIATOR",
      `💬 Telegram bulk bid from ${buyerHKC.name}: ₹280/kg (full 40kg lot)`,
    ),
  );
  await delay(800);

  addLogEntry(
    makeLog(
      "NEGOTIATOR",
      `Telegram bid ₹280 rejected — premium WhatsApp bids are 39% higher`,
    ),
  );
  updateBid("bid-3", {
    status: "REJECTED",
    agent_action: "Rejected: below premium channel bids",
  });
  await delay(1500);

  // ── BID 4: Paravur Kadal Foods (COUNTER) ─────────────────
  const bid4: Bid = {
    id: "bid-4",
    buyer_name: buyerPKF.name,
    channel: "whatsapp",
    bid_amount: 360,
    original_amount: 360,
    gross_value: 14400,
    net_after_fuel: 13620,
    agent_action: "Counter offered",
    status: "COUNTERED",
    timestamp: makeTime(),
  };
  addBid(bid4);
  addLogEntry(
    makeLog(
      "NEGOTIATOR",
      `📱 WhatsApp bid from ${buyerPKF.name}: ₹360/kg — slightly below target`,
    ),
  );
  await delay(600);

  addLogEntry(
    makeLog(
      "NEGOTIATOR",
      `→ Tool Call: reject_and_counter(buyer_id=PKF, counter=₹400/kg)`,
    ),
  );
  updateBid("bid-4", {
    bid_amount: 400,
    gross_value: 16000,
    net_after_fuel: 15220,
  });
  await delay(1500);

  // ── BID 5: Gulf Gate Exports — THE WINNER ────────────────
  const bid5: Bid = {
    id: "bid-5",
    buyer_name: buyerGGE.name,
    channel: "whatsapp",
    bid_amount: 445,
    gross_value: 17800,
    net_after_fuel: 17020,
    agent_action: "Evaluating...",
    status: "ACTIVE",
    timestamp: makeTime(),
  };
  addBid(bid5);
  addLogEntry(
    makeLog(
      "NEGOTIATOR",
      `📱 WhatsApp bid from ${buyerGGE.name}: ₹445/kg (export-grade premium)`,
    ),
  );
  await delay(800);

  addLogEntry(
    makeLog(
      "NEGOTIATOR",
      `🔥 NEW HIGH BID. ₹445/kg from ${buyerGGE.name} — Gulf air-freight premium applied`,
    ),
  );
  await delay(600);

  addLogEntry(
    makeLog(
      "NEGOTIATOR",
      `→ Tool Call: calculate_net_margin(bid=445, weight=40, harbor=kochi)`,
    ),
  );
  await delay(400);

  const netProfit = 17800 - kochi.fuelCostOneWay - 500;
  addLogEntry(
    makeLog(
      "NAVIGATOR",
      `Gross: ₹17,800 | Fuel: -₹${kochi.fuelCostOneWay} | Risk buffer: -₹500 | Net: ₹${netProfit} 🟢 BEST`,
    ),
  );
  await delay(1000);

  addLogEntry(
    makeLog(
      "AUDITOR",
      `⏰ Deadline check: 58 min remaining until 3:30 PM. Premium auction on track.`,
    ),
  );
  await delay(600);

  addLogEntry(
    makeLog(
      "AUDITOR",
      `Liquidation mode NOT needed. Best bid (₹445) exceeds reserve by 30.8%.`,
    ),
  );
  await delay(1200);

  // ── DEAL SECURED ─────────────────────────────────────────
  addLogEntry(
    makeLog(
      "NEGOTIATOR",
      `Final evaluation: ${buyerGGE.name} ₹445/kg yields best net margin across all 5 bids.`,
    ),
  );
  await delay(600);

  addLogEntry(
    makeLog(
      "NEGOTIATOR",
      `→ Tool Call: accept_deal(buyer_id=GGE, price=445, harbor=kochi)`,
    ),
  );
  updateBid("bid-5", {
    status: "ACCEPTED",
    agent_action: "ACCEPTED — Best net margin",
  });
  await delay(800);

  if (countdownInterval) clearInterval(countdownInterval);
  setAuctionState("DEAL_SECURED");
  setCountdown(0);
  setActiveThreads(0);

  setEconomics({
    gross_bid: 17800,
    fuel_cost: kochi.fuelCostOneWay,
    risk_buffer: 500,
    net_profit: netProfit,
  });

  addLogEntry(
    makeLog(
      "AUDITOR",
      `🎉 CONTRACT SECURED via WhatsApp. Buyer: ${buyerGGE.name}. Price: ₹445/kg.`,
    ),
  );
  await delay(400);

  addLogEntry(
    makeLog(
      "NAVIGATOR",
      `📍 Route locked: Kadamakudy → ${kochi.name} (${kochi.distanceFromKadamakudy_km}km, ~${kochi.transitTime_min} min)`,
    ),
  );
  await delay(400);

  const withoutSampark = karimeen.farmgatePrice * 40;
  addLogEntry(
    makeLog(
      "AUDITOR",
      `Net profit: ₹${netProfit}. Without Sampark-OS: ~₹${withoutSampark}. Gain: +₹${netProfit - withoutSampark} (+${Math.round(((netProfit - withoutSampark) / withoutSampark) * 100)}%)`,
    ),
  );
  await delay(400);

  addLogEntry(
    makeLog("AUDITOR", `Awaiting human confirmation to finalize deal... 🟢`),
  );
}
