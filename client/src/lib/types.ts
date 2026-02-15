export type AuctionState = "IDLE" | "SCANNING" | "AUCTION_LIVE" | "DEAL_SECURED" | "LIQUIDATION";

export interface CatchAnalysis {
  species: string;
  species_local: string;
  weight_kg: number;
  quality_grade: string;
  quality_score: number;
  catch_certificate_hash: string;
  freshness_hours: number;
}

export type BidStatus = "ACTIVE" | "REJECTED" | "COUNTERED" | "ACCEPTED";
export type BidChannel = "whatsapp" | "telegram";

export interface Bid {
  id: string;
  buyer_name: string;
  channel: BidChannel;
  bid_amount: number;
  original_amount?: number;
  gross_value: number;
  net_after_fuel: number;
  agent_action: string;
  status: BidStatus;
  timestamp: string;
}

export type AgentType = "SCOUT" | "NEGOTIATOR" | "AUDITOR" | "NAVIGATOR";

export interface LogEntry {
  id: string;
  timestamp: string;
  agent: AgentType;
  message: string;
}

export interface HarborOption {
  name: string;
  distance_km: number;
  fuel_cost: number;
  eta_minutes: number;
}

export interface AuctionData {
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

export const INITIAL_AUCTION_DATA: AuctionData = {
  state: "IDLE",
  catch_analysis: null,
  bids: [],
  log_entries: [],
  countdown_seconds: 0,
  active_threads: 0,
  recommended_harbor: null,
  harbors: [],
  gross_bid: 0,
  fuel_cost: 0,
  risk_buffer: 0,
  net_profit: 0,
  deal_approved: false,
};
