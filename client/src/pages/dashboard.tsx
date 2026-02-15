import { useState, useEffect, useCallback, useRef } from "react";
import { TopBar } from "@/components/top-bar";
import { CatchCard } from "@/components/catch-card";
import { AuctionStatus } from "@/components/auction-status";
import { BidFeed } from "@/components/bid-feed";
import { BidTable } from "@/components/bid-table";
import { TransparencyTerminal } from "@/components/transparency-terminal";
import { EconomicsBar } from "@/components/economics-bar";
import { ApproveButton } from "@/components/approve-button";
import { QualityCertificate } from "@/components/quality-certificate";
import { LogisticsCalculator } from "@/components/logistics-calculator";
import { NegotiationTimeline } from "@/components/negotiation-timeline";
import { FloatingActions } from "@/components/floating-actions";
import { useAuctionSubscription } from "@/lib/auction-store";
import {
  resetAuction,
  setAuctionState,
  setCatchAnalysis,
  addLogEntry,
  setHarbors,
  addBid,
  updateBid,
  setEconomics,
  setCountdown,
  setActiveThreads,
  setDealApproved,
} from "@/lib/auction-store";
import { runDemo, stopDemo } from "@/lib/demo-mode";
import { apiRequest } from "@/lib/queryClient";

export default function Dashboard() {
  const auction = useAuctionSubscription();
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [isApproving, setIsApproving] = useState(false);
  const [isAuctionLoading, setIsAuctionLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === "D") {
        e.preventDefault();
        handleDemo();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const handleDemo = useCallback(() => {
    setIsAnalyzing(false);
    setAnalysisError(null);
    setIsApproving(false);
    setIsAuctionLoading(false);
    runDemo((url) => setPhotoUrl(url));
  }, []);

  const handleUpload = useCallback(async (file: File) => {
    setPhotoFile(file);
    const url = URL.createObjectURL(file);
    setPhotoUrl(url);
    setIsAnalyzing(true);
    setAnalysisError(null);
    resetAuction();
    setAuctionState("SCANNING");

    try {
      const reader = new FileReader();
      const base64 = await new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const res = await apiRequest("POST", "/api/analyze-catch", { image: base64 });
      const data = await res.json();

      setCatchAnalysis(data);
      setIsAnalyzing(false);

      addLogEntry({
        id: `log-${Date.now()}`,
        timestamp: getISTTime(),
        agent: "SCOUT",
        message: `Catch identified: ${data.species_local} (${data.species}), ~${data.weight_kg}kg, Grade ${data.quality_grade} (${data.quality_score}%)`,
      });

      await startAuction(data);
    } catch (err: any) {
      setIsAnalyzing(false);
      setAnalysisError(err.message || "Failed to analyze catch photo");
      setAuctionState("IDLE");
    }
  }, []);

  const startAuction = useCallback(async (catchData: any) => {
    setIsAuctionLoading(true);
    setAuctionState("AUCTION_LIVE");

    try {
      const response = await fetch("/api/start-auction", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ catch_analysis: catchData }),
      });

      if (!response.ok) throw new Error("Auction failed to start");

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No stream available");

      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const jsonStr = line.slice(6).trim();
          if (!jsonStr || jsonStr === "[DONE]") continue;

          try {
            const event = JSON.parse(jsonStr);
            handleSSEEvent(event);
          } catch {}
        }
      }
    } catch (err: any) {
      setAnalysisError(err.message || "Auction failed");
    } finally {
      setIsAuctionLoading(false);
    }
  }, []);

  const handleSSEEvent = useCallback((event: any) => {
    switch (event.type) {
      case "log":
        addLogEntry({
          id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          timestamp: event.timestamp || getISTTime(),
          agent: event.agent || "NEGOTIATOR",
          message: event.message,
        });
        break;
      case "bid":
        addBid(event.bid);
        break;
      case "bid_update":
        updateBid(event.bid_id, event.updates);
        break;
      case "harbors":
        setHarbors(event.harbors, event.recommended);
        break;
      case "economics":
        setEconomics(event.data);
        break;
      case "state":
        setAuctionState(event.state);
        break;
      case "countdown":
        setCountdown(event.seconds);
        break;
      case "threads":
        setActiveThreads(event.count);
        break;
    }
  }, []);

  const handleApprove = useCallback(async () => {
    setIsApproving(true);
    try {
      await apiRequest("POST", "/api/approve-deal", {
        gross_bid: auction.gross_bid,
        net_profit: auction.net_profit,
        harbor: auction.recommended_harbor?.name,
      });
      setDealApproved(true);
    } catch (err: any) {
      setAnalysisError("Failed to approve deal: " + (err.message || "Unknown error"));
    } finally {
      setIsApproving(false);
    }
  }, [auction.gross_bid, auction.net_profit, auction.recommended_harbor]);

  const handleRetry = useCallback(() => {
    setAnalysisError(null);
    if (photoFile) {
      handleUpload(photoFile);
    }
  }, [photoFile, handleUpload]);

  const handleCameraClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const rejectedCount = auction.bids.filter((b) => b.status === "REJECTED").length;
  const counterCount = auction.bids.filter((b) => b.status === "COUNTERED").length;

  return (
    <div className="min-h-screen bg-[#0a0f1a] text-[#e2e8f0]">
      <div className="max-w-[1920px] mx-auto">
        <TopBar onDemoToggle={handleDemo} />

        <div className="hidden lg:grid grid-cols-12 gap-3 h-[calc(100vh-52px)] p-3">
          <div className="col-span-3 overflow-y-auto space-y-3 min-h-0">
            <CatchCard
              analysis={auction.catch_analysis}
              isLoading={isAnalyzing}
              error={analysisError}
              onUpload={handleUpload}
              onRetry={handleRetry}
              photoUrl={photoUrl}
            />
            <QualityCertificate analysis={auction.catch_analysis} isLoading={isAnalyzing} />
            <LogisticsCalculator harbors={auction.harbors} recommendedHarbor={auction.recommended_harbor} isLoading={false} />
          </div>

          <div className="col-span-6 overflow-y-auto min-h-0 flex flex-col gap-3">
            <div className="rounded-xl bg-[#1e293b]/60 backdrop-blur-sm border border-[#334155]/50 flex flex-col flex-1 min-h-0">
              <div className="flex items-center justify-between gap-3 px-5 py-3 border-b border-[#334155]/30 flex-wrap">
                <div className="flex items-center gap-2.5">
                  <h3 className="text-sm font-semibold text-[#e2e8f0] tracking-wide">LIVE AUCTION</h3>
                  <span className="w-2 h-2 rounded-full bg-[#00ff88] animate-pulse-glow" style={{ visibility: auction.state === "AUCTION_LIVE" ? "visible" : "hidden" }} />
                </div>
                <div className="flex items-center gap-3">
                  {auction.countdown_seconds > 0 && (
                    <span className="text-xs font-mono text-[#ffb800]">
                      {Math.floor(auction.countdown_seconds / 60)}:{(auction.countdown_seconds % 60).toString().padStart(2, "0")}
                    </span>
                  )}
                  {auction.active_threads > 0 && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-[#00ff8810] text-[#00ff88] border border-[#00ff8820]">
                      {auction.active_threads} Active Threads
                    </span>
                  )}
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-3 min-h-0">
                <BidTable bids={auction.bids} isLoading={isAuctionLoading && auction.bids.length === 0} />
              </div>
              <div className="border-t border-[#334155]/30">
                <NegotiationTimeline
                  state={auction.state}
                  bidCount={auction.bids.length}
                  rejectedCount={rejectedCount}
                  counterCount={counterCount}
                />
              </div>
            </div>
          </div>

          <div className="col-span-3 overflow-y-auto min-h-0 flex flex-col gap-3">
            <div className="flex-1 min-h-0">
              <TransparencyTerminal entries={auction.log_entries} isLoading={false} />
            </div>
          </div>

          <div className="col-span-12">
            <div className="rounded-xl bg-[#1e293b]/60 backdrop-blur-sm border border-[#334155]/50 p-4">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div className="flex-1 min-w-[300px]">
                  <EconomicsBar
                    grossBid={auction.gross_bid}
                    fuelCost={auction.fuel_cost}
                    riskBuffer={auction.risk_buffer}
                    netProfit={auction.net_profit}
                    recommendedHarbor={auction.recommended_harbor}
                    isLoading={false}
                  />
                </div>
                <div className="w-full lg:w-auto lg:min-w-[220px]">
                  <ApproveButton
                    state={auction.state}
                    netProfit={auction.net_profit}
                    grossBid={auction.gross_bid}
                    fuelCost={auction.fuel_cost}
                    recommendedHarbor={auction.recommended_harbor}
                    onApprove={handleApprove}
                    isApproving={isApproving}
                    isApproved={auction.deal_approved}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:hidden p-4 pb-44 space-y-4">
          <AuctionStatus state={auction.state} countdown={auction.countdown_seconds} />
          <CatchCard
            analysis={auction.catch_analysis}
            isLoading={isAnalyzing}
            error={analysisError}
            onUpload={handleUpload}
            onRetry={handleRetry}
            photoUrl={photoUrl}
          />
          <BidFeed bids={auction.bids} isLoading={isAuctionLoading && auction.bids.length === 0} />
          <TransparencyTerminal entries={auction.log_entries} isLoading={false} />

          <div className="fixed bottom-0 left-0 right-0 z-30 p-4 bg-gradient-to-t from-[#0a0f1a] via-[#0a0f1a] to-transparent pt-8">
            <ApproveButton
              state={auction.state}
              netProfit={auction.net_profit}
              grossBid={auction.gross_bid}
              fuelCost={auction.fuel_cost}
              recommendedHarbor={auction.recommended_harbor}
              onApprove={handleApprove}
              isApproving={isApproving}
              isApproved={auction.deal_approved}
            />
          </div>
        </div>

        <FloatingActions onCamera={handleCameraClick} onVoice={() => {}} />
        <input ref={fileInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUpload(f); }} />
      </div>
    </div>
  );
}

function getISTTime(): string {
  return new Date().toLocaleTimeString("en-IN", { timeZone: "Asia/Kolkata", hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });
}
