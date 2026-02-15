import { type HarborOption } from "@/lib/types";
import { Fuel, Clock, Navigation } from "lucide-react";

interface LogisticsCalculatorProps {
  harbors: HarborOption[];
  recommendedHarbor: HarborOption | null;
  isLoading: boolean;
}

export function LogisticsCalculator({ harbors, recommendedHarbor, isLoading }: LogisticsCalculatorProps) {
  if (isLoading) {
    return (
      <div className="rounded-xl bg-[#1e293b]/60 backdrop-blur-sm border border-[#334155]/50 p-5">
        <div className="space-y-3">
          <div className="h-4 w-40 bg-[#334155]/40 rounded animate-pulse" />
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 w-full bg-[#334155]/40 rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-[#1e293b]/60 backdrop-blur-sm border border-[#334155]/50 p-5" data-testid="card-logistics">
      <div className="flex items-center gap-2 mb-4">
        <Navigation className="w-4 h-4 text-[#94a3b8]" />
        <h3 className="text-sm font-semibold text-[#e2e8f0] tracking-wide">LOGISTICS CALCULATOR</h3>
      </div>

      {harbors.length === 0 ? (
        <p className="text-sm text-[#475569] text-center py-4">Harbor routes will calculate during auction</p>
      ) : (
        <div className="space-y-2">
          {harbors.map((harbor) => {
            const isRecommended = recommendedHarbor?.name === harbor.name;
            return (
              <div
                key={harbor.name}
                className="flex items-center justify-between gap-3 p-3 rounded-lg border flex-wrap"
                style={{
                  borderColor: isRecommended ? "#00ff8830" : "#334155/30",
                  backgroundColor: isRecommended ? "#00ff8808" : "transparent",
                }}
                data-testid={`harbor-${harbor.name.toLowerCase().replace(/\s+/g, "-")}`}
              >
                <div className="flex items-center gap-2.5">
                  {isRecommended && <span className="w-1.5 h-1.5 rounded-full bg-[#00ff88]" />}
                  <span className="text-sm font-medium text-[#e2e8f0]">{harbor.name}</span>
                </div>
                <div className="flex items-center gap-4 text-xs font-mono text-[#94a3b8]">
                  <span className="flex items-center gap-1"><Fuel className="w-3 h-3" />{"\u20B9"}{harbor.fuel_cost.toLocaleString("en-IN")}</span>
                  <span>{harbor.distance_km}km</span>
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{harbor.eta_minutes}m</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
