import { type AuctionState } from "@/lib/types";

interface NegotiationTimelineProps {
  state: AuctionState;
  bidCount: number;
  rejectedCount: number;
  counterCount: number;
}

interface TimelineStep {
  label: string;
  active: boolean;
  completed: boolean;
}

export function NegotiationTimeline({ state, bidCount, rejectedCount, counterCount }: NegotiationTimelineProps) {
  const steps: TimelineStep[] = [
    {
      label: "Photo Analyzed",
      active: state !== "IDLE",
      completed: state !== "IDLE" && state !== "SCANNING",
    },
    {
      label: `${bidCount > 0 ? bidCount : "?"} Buyers Contacted`,
      active: state === "AUCTION_LIVE" || state === "DEAL_SECURED" || state === "LIQUIDATION",
      completed: state === "DEAL_SECURED" || state === "LIQUIDATION",
    },
    {
      label: `${bidCount} Bids Received`,
      active: bidCount > 0,
      completed: state === "DEAL_SECURED" || state === "LIQUIDATION",
    },
    {
      label: rejectedCount > 0 ? `${rejectedCount} Rejected` : "Evaluating",
      active: rejectedCount > 0,
      completed: state === "DEAL_SECURED",
    },
    {
      label: counterCount > 0 ? `Counter Sent` : "Negotiating",
      active: counterCount > 0,
      completed: state === "DEAL_SECURED",
    },
    {
      label: "Deal Locked",
      active: state === "DEAL_SECURED",
      completed: state === "DEAL_SECURED",
    },
  ];

  return (
    <div className="px-2 py-3" data-testid="timeline-negotiation">
      <div className="flex items-center gap-0 overflow-x-auto pb-1">
        {steps.map((step, i) => (
          <div key={i} className="flex items-center shrink-0">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className="w-3 h-3 rounded-full border-2 transition-all"
                style={{
                  borderColor: step.completed ? "#00ff88" : step.active ? "#ffb800" : "#334155",
                  backgroundColor: step.completed ? "#00ff88" : "transparent",
                  boxShadow: step.completed ? "0 0 8px rgba(0,255,136,0.4)" : "none",
                }}
              />
              <span className="text-[10px] font-mono text-[#94a3b8] whitespace-nowrap max-w-[80px] text-center truncate">
                {step.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                className="w-8 h-0.5 mt-[-14px] mx-0.5"
                style={{
                  backgroundColor: step.completed ? "#00ff8860" : "#334155",
                }}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
