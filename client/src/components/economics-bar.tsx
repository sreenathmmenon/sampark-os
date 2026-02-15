import { type HarborOption } from "@/lib/types";
import { MapPin, Navigation, TrendingUp } from "lucide-react";
import { FISH_SPECIES } from "@/data/marketData";

interface EconomicsBarProps {
  grossBid: number;
  fuelCost: number;
  riskBuffer: number;
  netProfit: number;
  recommendedHarbor: HarborOption | null;
  isLoading: boolean;
  species?: string | null;
  weight_kg?: number | null;
}

export function EconomicsBar({ grossBid, fuelCost, riskBuffer, netProfit, recommendedHarbor, isLoading, species, weight_kg }: EconomicsBarProps) {
  if (isLoading) {
    return (
      <div className="rounded-xl bg-[#1e293b]/60 backdrop-blur-sm border border-[#334155]/50 p-5">
        <div className="flex items-center gap-4 flex-wrap">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-8 w-36 bg-[#334155]/40 rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const hasData = grossBid > 0;

  // Calculate farmgate baseline for comparison
  // Find fish by English name or ID
  const fishData = species
    ? Object.values(FISH_SPECIES).find(fish =>
        fish.english.toLowerCase() === species.toLowerCase() ||
        fish.id === species.toLowerCase()
      )
    : null;

  const farmgateBaseline = (fishData && weight_kg)
    ? fishData.farmgatePrice * weight_kg
    : null;

  const gainPercent = (farmgateBaseline && netProfit > 0)
    ? Math.round(((netProfit - farmgateBaseline) / farmgateBaseline) * 100)
    : null;

  return (
    <div className="rounded-xl bg-[#1e293b]/60 backdrop-blur-sm border border-[#334155]/50 p-5" data-testid="card-economics">
      {!hasData ? (
        <div className="flex items-center justify-center py-4">
          <p className="text-sm text-[#475569]">Economics will calculate during auction</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Farmgate baseline comparison */}
          {farmgateBaseline !== null && gainPercent !== null && (
            <div className="flex items-center gap-3 p-2.5 rounded-lg bg-[#0f172a]/40 border border-[#334155]/20">
              <div className="flex items-center gap-2 text-xs text-[#64748b] font-mono">
                <span className="text-[#475569]">WITHOUT SAMPARK (FARMGATE):</span>
                <span className="text-[#94a3b8]">₹{farmgateBaseline.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-mono text-[#00ff88]">
                <TrendingUp className="w-3.5 h-3.5" />
                <span className="font-semibold">+{gainPercent}% GAIN</span>
              </div>
            </div>
          )}

          {/* Main economics breakdown */}
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-4 lg:gap-6 flex-wrap">
              <EconStat label="GROSS BID" value={grossBid} color="#e2e8f0" prefix={"\u20B9"} />
              <span className="text-[#475569] text-lg hidden sm:inline">&minus;</span>
              <EconStat label="FUEL" value={fuelCost} color="#ff3b5c" prefix={"-\u20B9"} />
              <span className="text-[#475569] text-lg hidden sm:inline">&minus;</span>
              <EconStat label="RISK BUFFER" value={riskBuffer} color="#ffb800" prefix={"-\u20B9"} />
              <span className="text-[#475569] text-lg hidden sm:inline">=</span>
              <div data-testid="text-net-profit">
                <p className="text-[10px] font-mono tracking-wider text-[#94a3b8] mb-0.5">NET PROFIT</p>
                <p className="text-xl font-bold font-mono text-[#00ff88]" style={{ textShadow: "0 0 20px rgba(0,255,136,0.4)" }}>
                  {"\u20B9"}{netProfit.toLocaleString("en-IN")}
                </p>
              </div>
            </div>

            {recommendedHarbor && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-[#0f172a]/60 border border-[#334155]/30">
                <div className="w-10 h-10 rounded-lg bg-[#00d4ff]/10 flex items-center justify-center">
                  <Navigation className="w-5 h-5 text-[#00d4ff]" />
                </div>
                <div>
                  <p className="text-xs text-[#94a3b8] font-mono">ROUTE</p>
                  <p className="text-sm font-medium text-[#e2e8f0]" data-testid="text-harbor">{recommendedHarbor.name}</p>
                  <div className="flex items-center gap-2 text-xs text-[#64748b] font-mono">
                    <MapPin className="w-3 h-3" />
                    <span>{recommendedHarbor.distance_km}km &middot; ~{recommendedHarbor.eta_minutes} min</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function EconStat({ label, value, color, prefix }: { label: string; value: number; color: string; prefix: string }) {
  return (
    <div>
      <p className="text-[10px] font-mono tracking-wider text-[#94a3b8] mb-0.5">{label}</p>
      <p className="text-lg font-semibold font-mono" style={{ color }}>
        {prefix}{value.toLocaleString("en-IN")}
      </p>
    </div>
  );
}
