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

let demoTimer: ReturnType<typeof setTimeout> | null = null;
let countdownInterval: ReturnType<typeof setInterval> | null = null;

export function stopDemo() {
  if (demoTimer) clearTimeout(demoTimer);
  if (countdownInterval) clearInterval(countdownInterval);
  demoTimer = null;
  countdownInterval = null;
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    demoTimer = setTimeout(resolve, ms);
  });
}

function makeLogEntry(agent: LogEntry["agent"], message: string): LogEntry {
  const now = new Date();
  const ts = now.toLocaleTimeString("en-IN", { timeZone: "Asia/Kolkata", hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });
  return { id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, timestamp: ts, agent, message };
}

function makeTime(): string {
  return new Date().toLocaleTimeString("en-IN", { timeZone: "Asia/Kolkata", hour: "2-digit", minute: "2-digit", hour12: false });
}

export async function runDemo(onPhotoSet: (url: string) => void) {
  stopDemo();
  resetAuction();

  onPhotoSet("/demo/karimeen.png");
  await delay(500);

  setAuctionState("SCANNING");
  addLogEntry(makeLogEntry("SCOUT", "Initiating catch scan via Claude Vision..."));
  await delay(1200);

  addLogEntry(makeLogEntry("SCOUT", "Catch identified: Karimeen (Pearl Spot), ~40kg, Grade A (94%)"));
  setCatchAnalysis({
    species: "Pearl Spot",
    species_local: "Karimeen",
    weight_kg: 40,
    quality_grade: "A",
    quality_score: 94,
    catch_certificate_hash: "0x7f3a9b2e1c4d8f6a0e5b3c7d9a2f4e6b8c1d3e5f",
    freshness_hours: 2,
  });
  await delay(800);

  addLogEntry(makeLogEntry("NAVIGATOR", "Calculating fuel ROI for 3 harbors..."));
  setHarbors(
    [
      { name: "Kochi Harbor", distance_km: 12, fuel_cost: 2100, eta_minutes: 45 },
      { name: "Alappuzha Port", distance_km: 28, fuel_cost: 4800, eta_minutes: 90 },
      { name: "Munambam Dock", distance_km: 18, fuel_cost: 3200, eta_minutes: 60 },
    ],
    { name: "Kochi Harbor", distance_km: 12, fuel_cost: 2100, eta_minutes: 45 },
  );
  await delay(600);

  addLogEntry(makeLogEntry("NAVIGATOR", "Kochi Harbor optimal: 12km, \u20B92,100 fuel, 45min ETA"));
  await delay(400);

  setAuctionState("AUCTION_LIVE");
  setActiveThreads(5);
  let countdown = 420;
  setCountdown(countdown);
  countdownInterval = setInterval(() => {
    countdown = Math.max(0, countdown - 1);
    setCountdown(countdown);
  }, 1000);

  addLogEntry(makeLogEntry("NEGOTIATOR", "Initiating WhatsApp auction with 3 premium buyers"));
  addLogEntry(makeLogEntry("NEGOTIATOR", "Initiating Telegram auction with 2 wholesale buyers"));
  await delay(2000);

  const bid1: Bid = {
    id: "bid-1",
    buyer_name: "Kochi Fresh Exports",
    channel: "whatsapp",
    bid_amount: 410,
    gross_value: 16400,
    net_after_fuel: 14300,
    agent_action: "Evaluating...",
    status: "ACTIVE",
    timestamp: makeTime(),
  };
  addBid(bid1);
  addLogEntry(makeLogEntry("NEGOTIATOR", 'Buyer "Kochi Fresh Exports" bid \u20B9410/kg \u2014 BELOW MCP average \u20B9440'));
  await delay(1500);

  addLogEntry(makeLogEntry("NEGOTIATOR", "\u2192 Tool Call: reject_and_counter(buyer_id=KFE, counter=\u20B9435)"));
  updateBid("bid-1", { status: "REJECTED", agent_action: "Rejected: below MCP" });
  addLogEntry(makeLogEntry("AUDITOR", "Bid \u20B9410/kg rejected. MCP floor is \u20B9430/kg for Grade A Karimeen"));
  await delay(2000);

  const bid2: Bid = {
    id: "bid-2",
    buyer_name: "Marina Wholesale",
    channel: "telegram",
    bid_amount: 445,
    gross_value: 17800,
    net_after_fuel: 15700,
    agent_action: "Evaluating...",
    status: "ACTIVE",
    timestamp: makeTime(),
  };
  addBid(bid2);
  addLogEntry(makeLogEntry("NEGOTIATOR", 'Buyer "Marina Wholesale" bid \u20B9445/kg \u2014 ABOVE MCP average'));
  await delay(1200);

  addLogEntry(makeLogEntry("NEGOTIATOR", "\u2192 Tool Call: calculate_net_margin(bid=445, harbor=kochi)"));
  addLogEntry(makeLogEntry("NAVIGATOR", "Net margin: \u20B9445 - \u20B952.50 fuel = \u20B9392.50/kg effective"));
  await delay(1500);

  const bid3: Bid = {
    id: "bid-3",
    buyer_name: "SeaFresh Trading Co",
    channel: "whatsapp",
    bid_amount: 420,
    original_amount: 420,
    gross_value: 16800,
    net_after_fuel: 14700,
    agent_action: "Counter offered",
    status: "COUNTERED",
    timestamp: makeTime(),
  };
  addBid(bid3);
  addLogEntry(makeLogEntry("NEGOTIATOR", 'Buyer "SeaFresh Trading" bid \u20B9420/kg. Counter-offering \u20B9440'));
  updateBid("bid-3", { bid_amount: 440, gross_value: 17600, net_after_fuel: 15500 });
  await delay(2000);

  const bid4: Bid = {
    id: "bid-4",
    buyer_name: "Premium Catch Kerala",
    channel: "telegram",
    bid_amount: 438,
    gross_value: 17520,
    net_after_fuel: 15420,
    agent_action: "Evaluating...",
    status: "ACTIVE",
    timestamp: makeTime(),
  };
  addBid(bid4);
  addLogEntry(makeLogEntry("NEGOTIATOR", 'Buyer "Premium Catch Kerala" bid \u20B9438/kg'));
  await delay(1500);

  addLogEntry(makeLogEntry("AUDITOR", "3:30 PM deadline in 58 min. Premium auction proceeds."));
  await delay(1000);

  addLogEntry(makeLogEntry("NEGOTIATOR", "Recommending ACCEPT for Marina Wholesale. Best net margin across all bids."));
  addLogEntry(makeLogEntry("NEGOTIATOR", "\u2192 Tool Call: accept_deal(buyer_id=MW, amount=445)"));
  updateBid("bid-2", { status: "ACCEPTED", agent_action: "ACCEPTED - Best net margin" });
  await delay(800);

  if (countdownInterval) clearInterval(countdownInterval);
  setAuctionState("DEAL_SECURED");
  setCountdown(0);
  setActiveThreads(0);

  setEconomics({
    gross_bid: 17800,
    fuel_cost: 2100,
    risk_buffer: 500,
    net_profit: 15200,
  });

  addLogEntry(makeLogEntry("AUDITOR", "Deal locked with Marina Wholesale at \u20B9445/kg. Net profit: \u20B915,200"));
  addLogEntry(makeLogEntry("NAVIGATOR", "Route confirmed: Kochi Harbor, 12km, ETA 45min"));
  addLogEntry(makeLogEntry("AUDITOR", "Awaiting human confirmation to finalize deal..."));
}
