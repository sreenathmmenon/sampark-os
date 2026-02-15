import { type Bid } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { SiWhatsapp, SiTelegram } from "react-icons/si";
import { ArrowRight } from "lucide-react";

interface BidTableProps {
  bids: Bid[];
  isLoading: boolean;
}

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  ACTIVE: { bg: "#00ff8815", text: "#00ff88" },
  REJECTED: { bg: "#ff3b5c15", text: "#ff3b5c" },
  COUNTERED: { bg: "#ffb80015", text: "#ffb800" },
  ACCEPTED: { bg: "#00ff8825", text: "#00ff88" },
};

export function BidTable({ bids, isLoading }: BidTableProps) {
  const highestBid = bids.filter((b) => b.status !== "REJECTED").reduce((max, b) => (b.bid_amount > (max?.bid_amount ?? 0) ? b : max), null as Bid | null);

  if (isLoading) {
    return <BidTableSkeleton />;
  }

  if (bids.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-sm text-[#475569]">No active bids</p>
        <p className="text-xs text-[#374151] mt-1">Bids will stream in during auction</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead>
          <tr className="text-[10px] font-mono tracking-wider text-[#94a3b8] border-b border-[#334155]/30">
            <th className="pb-2.5 px-3">BUYER</th>
            <th className="pb-2.5 px-3">CH</th>
            <th className="pb-2.5 px-3">BID ({"\u20B9"}/kg)</th>
            <th className="pb-2.5 px-3">GROSS</th>
            <th className="pb-2.5 px-3">NET</th>
            <th className="pb-2.5 px-3">STATUS</th>
          </tr>
        </thead>
        <tbody>
          {bids.map((bid, index) => {
            const isHighest = highestBid?.id === bid.id;
            const isRejected = bid.status === "REJECTED";
            const statusStyle = STATUS_COLORS[bid.status] ?? STATUS_COLORS.ACTIVE;

            return (
              <tr
                key={bid.id}
                className="text-sm border-b border-[#334155]/20 animate-slide-in-left transition-colors"
                style={{
                  backgroundColor: isHighest ? "#00ff8805" : isRejected ? "#ff3b5c03" : "transparent",
                  borderLeft: isHighest ? "3px solid #00ff88" : "3px solid transparent",
                  opacity: isRejected ? 0.55 : 1,
                  boxShadow: isHighest ? "inset 3px 0 12px rgba(0,255,136,0.08)" : "none",
                  animationDelay: `${index * 150}ms`,
                }}
                data-testid={`row-bid-${bid.id}`}
              >
                <td className="py-3 px-3">
                  <span className={`font-medium text-[#e2e8f0] ${isRejected ? "line-through" : ""}`}>
                    {bid.buyer_name}
                  </span>
                </td>
                <td className="py-3 px-3">
                  {bid.channel === "whatsapp" ? (
                    <SiWhatsapp className="w-4 h-4" style={{ color: "#25D366" }} />
                  ) : (
                    <SiTelegram className="w-4 h-4" style={{ color: "#229ED9" }} />
                  )}
                </td>
                <td className="py-3 px-3 font-mono">
                  {bid.status === "COUNTERED" && bid.original_amount ? (
                    <span className="flex items-center gap-1">
                      <span className="text-[#64748b] line-through">{bid.original_amount}</span>
                      <ArrowRight className="w-3 h-3 text-[#ffb800]" />
                      <span className="text-[#ffb800] font-semibold">{bid.bid_amount}</span>
                    </span>
                  ) : (
                    <span className={isRejected ? "line-through text-[#ff3b5c]/60" : "text-[#e2e8f0]"}>
                      {bid.bid_amount}
                    </span>
                  )}
                </td>
                <td className="py-3 px-3 font-mono text-[#94a3b8]">
                  {"\u20B9"}{bid.gross_value.toLocaleString("en-IN")}
                </td>
                <td className="py-3 px-3 font-mono text-[#94a3b8]">
                  {"\u20B9"}{bid.net_after_fuel.toLocaleString("en-IN")}
                </td>
                <td className="py-3 px-3">
                  <Badge
                    className="no-default-hover-elevate no-default-active-elevate text-[10px] font-mono tracking-wider px-2 py-0.5 border-0"
                    style={{ backgroundColor: statusStyle.bg, color: statusStyle.text }}
                  >
                    {bid.status}
                  </Badge>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function BidTableSkeleton() {
  return (
    <div className="space-y-3 py-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex items-center gap-4 px-3">
          <div className="h-4 w-28 bg-[#334155]/40 rounded animate-pulse" />
          <div className="h-4 w-8 bg-[#334155]/40 rounded animate-pulse" />
          <div className="h-4 w-16 bg-[#334155]/40 rounded animate-pulse" />
          <div className="h-4 w-20 bg-[#334155]/40 rounded animate-pulse" />
          <div className="h-4 w-20 bg-[#334155]/40 rounded animate-pulse" />
          <div className="h-4 w-16 bg-[#334155]/40 rounded animate-pulse" />
        </div>
      ))}
    </div>
  );
}
