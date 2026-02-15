import { type Bid } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { SiWhatsapp, SiTelegram } from "react-icons/si";
import { ArrowRight } from "lucide-react";

interface BidFeedProps {
  bids: Bid[];
  isLoading: boolean;
}

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  ACTIVE: { bg: "#00ff8815", text: "#00ff88" },
  REJECTED: { bg: "#ff3b5c15", text: "#ff3b5c" },
  COUNTERED: { bg: "#ffb80015", text: "#ffb800" },
  ACCEPTED: { bg: "#00ff8825", text: "#00ff88" },
};

export function BidFeed({ bids, isLoading }: BidFeedProps) {
  const highestBid = bids.filter((b) => b.status !== "REJECTED").reduce((max, b) => (b.bid_amount > (max?.bid_amount ?? 0) ? b : max), null as Bid | null);

  return (
    <div className="rounded-xl bg-[#1e293b]/60 backdrop-blur-sm border border-[#334155]/50 p-5" data-testid="card-bid-feed">
      <div className="flex items-center justify-between gap-2 mb-4">
        <h3 className="text-sm font-semibold text-[#e2e8f0] tracking-wide">LIVE BID FEED</h3>
        {bids.length > 0 && (
          <span className="text-xs font-mono text-[#94a3b8]">{bids.length} bid{bids.length !== 1 ? "s" : ""}</span>
        )}
      </div>

      {isLoading ? (
        <BidSkeleton />
      ) : bids.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <p className="text-sm text-[#64748b]">No active bids</p>
          <p className="text-xs text-[#475569] mt-1">Bids will appear here during auction</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1 lg:max-h-[500px]">
          {bids.map((bid) => (
            <BidCard key={bid.id} bid={bid} isHighest={highestBid?.id === bid.id} />
          ))}
        </div>
      )}
    </div>
  );
}

function BidCard({ bid, isHighest }: { bid: Bid; isHighest: boolean }) {
  const statusStyle = STATUS_COLORS[bid.status] ?? STATUS_COLORS.ACTIVE;
  const isRejected = bid.status === "REJECTED";

  return (
    <div
      className="flex items-center justify-between gap-3 flex-wrap p-3.5 rounded-lg border transition-all animate-slide-in-left"
      style={{
        borderColor: isHighest ? "#00ff8840" : isRejected ? "#ff3b5c20" : "#334155/30",
        backgroundColor: isHighest ? "#00ff8808" : isRejected ? "#ff3b5c05" : "#0f172a/40",
        boxShadow: isHighest ? "0 0 15px rgba(0,255,136,0.1)" : "none",
        opacity: isRejected ? 0.6 : 1,
      }}
      data-testid={`card-bid-${bid.id}`}
    >
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: bid.channel === "whatsapp" ? "#25D36610" : "#229ED910" }}>
          {bid.channel === "whatsapp" ? (
            <SiWhatsapp className="w-4 h-4" style={{ color: "#25D366" }} />
          ) : (
            <SiTelegram className="w-4 h-4" style={{ color: "#229ED9" }} />
          )}
        </div>
        <div>
          <p className={`text-sm font-medium text-[#e2e8f0] ${isRejected ? "line-through opacity-60" : ""}`}>{bid.buyer_name}</p>
          <p className="text-xs text-[#64748b] font-mono">{bid.timestamp}</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="text-right">
          {bid.status === "COUNTERED" && bid.original_amount ? (
            <div className="flex items-center gap-1.5 text-sm">
              <span className="text-[#64748b] line-through font-mono">{formatCurrency(bid.original_amount)}</span>
              <ArrowRight className="w-3 h-3 text-[#ffb800]" />
              <span className="text-[#ffb800] font-mono font-semibold">{formatCurrency(bid.bid_amount)}/kg</span>
            </div>
          ) : (
            <span className={`text-sm font-mono font-semibold ${isRejected ? "line-through text-[#ff3b5c]/60" : "text-[#e2e8f0]"}`}>
              {formatCurrency(bid.bid_amount)}/kg
            </span>
          )}
        </div>
        <Badge
          className="no-default-hover-elevate no-default-active-elevate text-[10px] font-mono tracking-wider px-2 py-0.5 border-0"
          style={{ backgroundColor: statusStyle.bg, color: statusStyle.text }}
          data-testid={`badge-status-${bid.id}`}
        >
          {bid.status}
        </Badge>
      </div>
    </div>
  );
}

function BidSkeleton() {
  return (
    <div className="space-y-2">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex items-center justify-between p-3.5 rounded-lg bg-[#0f172a]/40">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#334155]/40 animate-pulse" />
            <div className="space-y-1.5">
              <div className="h-4 w-28 bg-[#334155]/40 rounded animate-pulse" />
              <div className="h-3 w-16 bg-[#334155]/40 rounded animate-pulse" />
            </div>
          </div>
          <div className="h-5 w-20 bg-[#334155]/40 rounded animate-pulse" />
        </div>
      ))}
    </div>
  );
}

function formatCurrency(amount: number): string {
  return `\u20B9${amount.toLocaleString("en-IN")}`;
}
