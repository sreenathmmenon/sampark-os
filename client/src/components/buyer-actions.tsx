import { useAuctionSubscription } from "@/lib/auction-store";
import { CheckCircle, X, TrendingUp } from "lucide-react";
import { useState } from "react";
import { apiRequest } from "@/lib/queryClient";

export function BuyerActions() {
  const auction = useAuctionSubscription();
  const [counterAmount, setCounterAmount] = useState("");
  const [showCounterInput, setShowCounterInput] = useState(false);
  const [isPlacingBid, setIsPlacingBid] = useState(false);

  const catchAnalysis = auction.catch_analysis;
  const hasActiveDeal = auction.state === "DEAL_SECURED" || auction.deal_approved;

  if (!catchAnalysis || hasActiveDeal) {
    return null;
  }

  const handleAccept = () => {
    // In real implementation, this would send acceptance to the backend
    console.log("Buyer accepted the deal");
  };

  const handleReject = () => {
    // In real implementation, this would send rejection to the backend
    console.log("Buyer rejected the deal");
    setShowCounterInput(false);
  };

  const handleCounter = async () => {
    if (!showCounterInput) {
      setShowCounterInput(true);
      return;
    }

    if (counterAmount) {
      setIsPlacingBid(true);
      try {
        await apiRequest("POST", "/api/place-bid", {
          buyer_id: "GGE",
          buyer_name: "Great Global Exports",
          bid_amount: parseInt(counterAmount, 10),
        });
        console.log("Bid placed successfully:", counterAmount);
        setCounterAmount("");
        setShowCounterInput(false);
      } catch (error) {
        console.error("Failed to place bid:", error);
      } finally {
        setIsPlacingBid(false);
      }
    }
  };

  return (
    <div className="rounded-xl bg-[#1e293b]/60 backdrop-blur-sm border border-[#334155]/50 p-6">
      <div className="flex flex-col gap-4">
        {/* Counter Input (if active) */}
        {showCounterInput && (
          <div className="p-4 rounded-lg bg-[#0f172a]/60 border border-[#ffb800]/30">
            <label className="block text-[10px] font-mono tracking-wider text-[#94a3b8] mb-2">
              COUNTER OFFER (₹/kg)
            </label>
            <input
              type="number"
              value={counterAmount}
              onChange={(e) => setCounterAmount(e.target.value)}
              placeholder="Enter price per kg"
              className="w-full px-4 py-2 bg-[#0a0f1a] border border-[#334155]/50 rounded-lg text-[#e2e8f0] font-mono focus:outline-none focus:border-[#ffb800]/50"
            />
          </div>
        )}

        {/* Action Buttons */}
        <div className="grid grid-cols-3 gap-3">
          {/* Reject Button */}
          <button
            onClick={handleReject}
            className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl bg-[#ff3b5c]/10 border-2 border-[#ff3b5c]/30 hover:bg-[#ff3b5c]/20 hover:border-[#ff3b5c]/50 transition-all group"
          >
            <X className="w-6 h-6 text-[#ff3b5c] group-hover:scale-110 transition-transform" />
            <span className="text-sm font-semibold text-[#ff3b5c]">Reject</span>
          </button>

          {/* Counter Button */}
          <button
            onClick={handleCounter}
            className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all group ${
              showCounterInput
                ? "bg-[#ffb800]/20 border-[#ffb800]/50"
                : "bg-[#ffb800]/10 border-[#ffb800]/30 hover:bg-[#ffb800]/20 hover:border-[#ffb800]/50"
            }`}
          >
            <TrendingUp className="w-6 h-6 text-[#ffb800] group-hover:scale-110 transition-transform" />
            <span className="text-sm font-semibold text-[#ffb800]">
              {showCounterInput ? "Submit" : "Counter"}
            </span>
          </button>

          {/* Accept Button */}
          <button
            onClick={handleAccept}
            className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl bg-[#00ff88]/10 border-2 border-[#00ff88]/30 hover:bg-[#00ff88]/20 hover:border-[#00ff88]/50 transition-all group"
            style={{ boxShadow: "0 0 20px rgba(0,255,136,0.2)" }}
          >
            <CheckCircle className="w-6 h-6 text-[#00ff88] group-hover:scale-110 transition-transform" />
            <span className="text-sm font-semibold text-[#00ff88]">Accept Deal</span>
          </button>
        </div>

        {/* Info Text */}
        <p className="text-center text-xs text-[#64748b] font-mono">
          {auction.state === "AUCTION_LIVE"
            ? "Review the offer and economics before deciding"
            : "Waiting for auction to start..."}
        </p>
      </div>
    </div>
  );
}
