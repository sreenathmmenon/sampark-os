import { Check, Loader2 } from "lucide-react";
import { type AuctionState, type HarborOption } from "@/lib/types";

interface ApproveButtonProps {
  state: AuctionState;
  netProfit: number;
  grossBid: number;
  fuelCost: number;
  recommendedHarbor: HarborOption | null;
  onApprove: () => void;
  isApproving: boolean;
  isApproved: boolean;
}

export function ApproveButton({ state, netProfit, grossBid, fuelCost, recommendedHarbor, onApprove, isApproving, isApproved }: ApproveButtonProps) {
  const canApprove = (state === "DEAL_SECURED" || state === "AWAITING_APPROVAL") && !isApproved;

  return (
    <div className="space-y-3">
      {netProfit > 0 && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#0f172a]/60 border border-[#334155]/30 text-xs font-mono text-[#94a3b8] flex-wrap">
          <span>Gross: {"\u20B9"}{grossBid.toLocaleString("en-IN")}</span>
          <span className="text-[#475569]">&rarr;</span>
          <span className="text-[#ff3b5c]">Fuel: -{"\u20B9"}{fuelCost.toLocaleString("en-IN")}</span>
          <span className="text-[#475569]">&rarr;</span>
          <span className="text-[#00ff88] font-semibold">Net: {"\u20B9"}{netProfit.toLocaleString("en-IN")}</span>
        </div>
      )}

      <button
        onClick={onApprove}
        disabled={!canApprove || isApproving}
        className="w-full flex items-center justify-center gap-2 font-semibold text-base tracking-wide rounded-xl transition-all disabled:cursor-not-allowed"
        style={{
          minHeight: 56,
          backgroundColor: isApproved ? "#00ff8830" : canApprove ? "#00ff88" : "#334155",
          color: isApproved ? "#00ff88" : canApprove ? "#0a0f1a" : "#94a3b8",
          boxShadow: canApprove ? "0 0 25px rgba(0,255,136,0.3)" : "none",
          opacity: !canApprove && !isApproved ? 0.7 : 1,
        }}
        data-testid="button-approve"
      >
        {isApproving ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : isApproved ? (
          <>
            <Check className="w-5 h-5" />
            DEAL APPROVED
          </>
        ) : (
          <>
            <Check className="w-5 h-5" />
            APPROVE DEAL
          </>
        )}
      </button>

      {recommendedHarbor && (
        <p className="text-xs text-[#64748b] text-center font-mono">
          Route to: {recommendedHarbor.name} &middot; {recommendedHarbor.distance_km}km &middot; ~{recommendedHarbor.eta_minutes} min
        </p>
      )}
    </div>
  );
}
