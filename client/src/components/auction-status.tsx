import { type AuctionState } from "@/lib/types";

interface AuctionStatusProps {
  state: AuctionState;
  countdown: number;
}

const STATE_CONFIG: Record<AuctionState, { label: string; color: string; pulse: boolean }> = {
  IDLE: { label: "IDLE", color: "#94a3b8", pulse: false },
  SCANNING: { label: "SCANNING CATCH", color: "#ffb800", pulse: true },
  AUCTION_LIVE: { label: "AUCTION LIVE", color: "#00ff88", pulse: true },
  AWAITING_APPROVAL: { label: "AWAITING APPROVAL", color: "#ffb800", pulse: true },
  DEAL_SECURED: { label: "DEAL SECURED", color: "#00ff88", pulse: false },
  LIQUIDATION: { label: "LIQUIDATION MODE", color: "#ff3b5c", pulse: true },
};

export function AuctionStatus({ state, countdown }: AuctionStatusProps) {
  const config = STATE_CONFIG[state] || { label: "PROCESSING", color: "#94a3b8", pulse: false };
  const minutes = Math.floor(countdown / 60);
  const seconds = countdown % 60;

  return (
    <div
      className="flex items-center justify-between gap-3 flex-wrap px-4 py-3 rounded-xl border"
      style={{
        backgroundColor: `${config.color}08`,
        borderColor: `${config.color}30`,
      }}
      data-testid="status-auction"
    >
      <div className="flex items-center gap-2.5">
        <span
          className="w-2.5 h-2.5 rounded-full"
          style={{
            backgroundColor: config.color,
            boxShadow: config.pulse ? `0 0 8px ${config.color}60` : "none",
            animation: config.pulse ? "pulse-glow 2s ease-in-out infinite" : "none",
          }}
        />
        <span
          className="text-sm font-semibold tracking-wider font-mono"
          style={{ color: config.color }}
          data-testid="text-auction-state"
        >
          {config.label}
        </span>
      </div>
      {state === "AUCTION_LIVE" && countdown > 0 && (
        <span
          className={`font-mono font-bold ${countdown < 120 ? 'text-2xl' : 'text-xl'}`}
          style={{
            color: countdown < 120 ? '#ffb800' : '#e2e8f0',
            textShadow: countdown < 120
              ? '0 0 20px rgba(255, 184, 0, 0.6), 0 0 10px rgba(255, 184, 0, 0.4)'
              : 'none',
            animation: countdown < 120 ? 'countdown-pulse 1s ease-in-out infinite' : 'none',
          }}
          data-testid="text-countdown"
        >
          {minutes}:{seconds.toString().padStart(2, "0")} remaining
        </span>
      )}
    </div>
  );
}
