import { useAuctionSubscription } from "@/lib/auction-store";
import { Award, CheckCheck, Shield } from "lucide-react";
import { useEffect, useRef } from "react";

export function NegotiationChat() {
  const auction = useAuctionSubscription();
  const scrollRef = useRef<HTMLDivElement>(null);
  const catchAnalysis = auction.catch_analysis;
  const bids = auction.bids;
  const logEntries = auction.log_entries;

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [bids, logEntries]);

  // Filter log entries for negotiator and auditor messages
  const negotiationMessages = logEntries.filter(
    (log) => log.agent === "NEGOTIATOR" || log.agent === "AUDITOR"
  );

  return (
    <div className="rounded-xl bg-[#1e293b]/60 backdrop-blur-sm border border-[#334155]/50 p-6 flex flex-col h-full">
      <h2 className="text-sm font-mono tracking-wider text-[#94a3b8] mb-4">
        NEGOTIATION CHAT
      </h2>

      {/* Chat Messages */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto space-y-3 pr-2"
        style={{ maxHeight: "calc(100vh - 400px)" }}
      >
        {!catchAnalysis ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-sm text-[#475569]">
              Chat will appear when auction starts...
            </p>
          </div>
        ) : (
          <>
            {/* Quality Certificate Message from Agent */}
            {catchAnalysis && (
              <div className="flex justify-start">
                <div className="max-w-[80%] bg-[#e2e8f0] rounded-lg rounded-tl-none p-3 shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="w-4 h-4 text-[#00ff88]" />
                    <span className="text-xs font-mono font-semibold text-[#0a0f1a]">
                      QUALITY CERTIFICATE
                    </span>
                  </div>
                  <div className="space-y-1.5 text-xs text-[#1e293b]">
                    <div className="flex justify-between">
                      <span className="text-[#64748b]">Species:</span>
                      <span className="font-medium">{catchAnalysis.species}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#64748b]">Weight:</span>
                      <span className="font-medium">{catchAnalysis.weight_kg} kg</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[#64748b]">Quality:</span>
                      <div className="flex items-center gap-1">
                        <Award className="w-3 h-3 text-[#00ff88]" />
                        <span className="font-semibold">
                          Grade {catchAnalysis.quality_grade}
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#64748b]">Freshness:</span>
                      <span className="font-medium">{catchAnalysis.freshness_hours}h</span>
                    </div>
                  </div>
                  <div className="mt-2 pt-2 border-t border-[#cbd5e1]">
                    <p className="text-[10px] font-mono text-[#64748b]">
                      Hash: {catchAnalysis.catch_certificate_hash.slice(0, 16)}...
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Negotiation Messages - Only show buyer's own bids (GGE) */}
            {bids.filter((b) => b.buyer_id === "GGE").map((bid) => (
              <div key={bid.id}>
                {/* Buyer's Bid (Green bubble - right aligned) */}
                <div className="flex justify-end mb-2">
                  <div className="max-w-[70%] bg-[#00ff88]/20 border border-[#00ff88]/30 rounded-lg rounded-tr-none p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-mono tracking-wider text-[#94a3b8]">
                        MY BID
                      </span>
                      {bid.status === "ACCEPTED" && (
                        <CheckCheck className="w-3.5 h-3.5 text-[#00ff88]" />
                      )}
                    </div>
                    <p className="text-lg font-bold font-mono text-[#00ff88]">
                      ₹{bid.bid_amount}/kg
                    </p>
                    <p className="text-xs text-[#94a3b8] mt-1">
                      Total: ₹{bid.gross_value?.toLocaleString("en-IN") || 0}
                    </p>
                    <p className="text-[9px] text-[#64748b] mt-1">
                      {new Date(bid.timestamp).toLocaleTimeString("en-IN", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>

                {/* Agent's Response (White bubble - left aligned) - Don't show for human bids */}
                {bid.agent_action && !bid.agent_action.includes("HUMAN BID") && (
                  <div className="flex justify-start">
                    <div className="max-w-[70%] bg-[#e2e8f0] rounded-lg rounded-tl-none p-3 shadow-sm">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-mono tracking-wider text-[#64748b]">
                          SAMPARK AGENT
                        </span>
                        {bid.status === "REJECTED" && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#ff3b5c]/20 text-[#ff3b5c] font-semibold">
                            REJECTED
                          </span>
                        )}
                        {bid.status === "COUNTERED" && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#ffb800]/20 text-[#ffb800] font-semibold">
                            COUNTERED
                          </span>
                        )}
                        {bid.status === "ACCEPTED" && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#00ff88]/20 text-[#00ff88] font-semibold">
                            ACCEPTED
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-[#1e293b]">{bid.agent_action}</p>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* Agent Log Messages (for context) */}
            {negotiationMessages.slice(-3).map((log) => (
              <div key={log.id} className="flex justify-start">
                <div className="max-w-[70%] bg-[#334155]/30 rounded-lg rounded-tl-none p-2.5">
                  <p className="text-xs text-[#94a3b8] font-mono">{log.message}</p>
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
