import { useState, useEffect } from "react";
import { type AuctionData, type Bid, type LogEntry, type CatchAnalysis, type AuctionState, type HarborOption, INITIAL_AUCTION_DATA } from "./types";

let globalState: AuctionData = { ...INITIAL_AUCTION_DATA };
let listeners: Set<() => void> = new Set();

function notify() {
  listeners.forEach((l) => l());
}

export function getAuctionState(): AuctionData {
  return globalState;
}

export function resetAuction() {
  globalState = { ...INITIAL_AUCTION_DATA, log_entries: [], bids: [], harbors: [] };
  notify();
}

export function setAuctionState(state: AuctionState) {
  globalState = { ...globalState, state };
  notify();
}

export function setCatchAnalysis(analysis: CatchAnalysis) {
  globalState = { ...globalState, catch_analysis: analysis };
  notify();
}

export function addBid(bid: Bid) {
  globalState = { ...globalState, bids: [...globalState.bids, bid] };
  notify();
}

export function updateBid(bidId: string, updates: Partial<Bid>) {
  globalState = {
    ...globalState,
    bids: globalState.bids.map((b) => (b.id === bidId ? { ...b, ...updates } : b)),
  };
  notify();
}

export function addLogEntry(entry: LogEntry) {
  globalState = { ...globalState, log_entries: [...globalState.log_entries, entry] };
  notify();
}

export function setCountdown(seconds: number) {
  globalState = { ...globalState, countdown_seconds: seconds };
  notify();
}

export function setActiveThreads(count: number) {
  globalState = { ...globalState, active_threads: count };
  notify();
}

export function setEconomics(data: { gross_bid: number; fuel_cost: number; risk_buffer: number; net_profit: number }) {
  globalState = { ...globalState, ...data };
  notify();
}

export function setHarbors(harbors: HarborOption[], recommended: HarborOption | null) {
  globalState = { ...globalState, harbors, recommended_harbor: recommended };
  notify();
}

export function setDealApproved(approved: boolean) {
  globalState = { ...globalState, deal_approved: approved };
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
