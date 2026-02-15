import { type CatchAnalysis } from "@/lib/types";
import { Snowflake, Clock, IndianRupee } from "lucide-react";

interface ColdStorageCalculatorProps {
  analysis: CatchAnalysis | null;
  isLoading: boolean;
}

// Hardcoded storage options based on duration
const STORAGE_OPTIONS = [
  { duration: "6 hours", cost_per_kg: 2, hours: 6 },
  { duration: "12 hours", cost_per_kg: 3.5, hours: 12 },
  { duration: "24 hours", cost_per_kg: 6, hours: 24 },
  { duration: "48 hours", cost_per_kg: 10, hours: 48 },
];

export function ColdStorageCalculator({ analysis, isLoading }: ColdStorageCalculatorProps) {
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

  const weight = analysis?.weight_kg || 0;

  return (
    <div className="rounded-xl bg-[#1e293b]/60 backdrop-blur-sm border border-[#334155]/50 p-5" data-testid="card-cold-storage">
      <div className="flex items-center gap-2 mb-4">
        <Snowflake className="w-4 h-4 text-[#94a3b8]" />
        <h3 className="text-sm font-semibold text-[#e2e8f0] tracking-wide">COLD STORAGE</h3>
      </div>

      {!analysis ? (
        <p className="text-sm text-[#475569] text-center py-4">Storage costs will appear after catch scan</p>
      ) : (
        <div className="space-y-2">
          {STORAGE_OPTIONS.map((option) => {
            const totalCost = Math.round(option.cost_per_kg * weight);
            const isRecommended = option.hours === 12; // Recommend 12 hours as standard

            return (
              <div
                key={option.duration}
                className="flex items-center justify-between gap-3 p-3 rounded-lg border flex-wrap"
                style={{
                  borderColor: isRecommended ? "#00ff8830" : "#334155/30",
                  backgroundColor: isRecommended ? "#00ff8808" : "transparent",
                }}
                data-testid={`storage-${option.hours}h`}
              >
                <div className="flex items-center gap-2.5">
                  {isRecommended && <span className="w-1.5 h-1.5 rounded-full bg-[#00ff88]" />}
                  <span className="text-sm font-medium text-[#e2e8f0]">{option.duration}</span>
                </div>
                <div className="flex items-center gap-4 text-xs font-mono text-[#94a3b8]">
                  <span className="flex items-center gap-1">
                    <IndianRupee className="w-3 h-3" />
                    {totalCost.toLocaleString("en-IN")}
                  </span>
                  <span className="text-[10px]">({option.cost_per_kg}/kg)</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {option.hours}h
                  </span>
                </div>
              </div>
            );
          })}

          {/* Quality-based recommendation note */}
          {analysis.quality_grade && (
            <div className="mt-3 p-2.5 rounded-lg bg-[#334155]/20 border border-[#334155]/30">
              <p className="text-[10px] font-mono text-[#94a3b8]">
                {analysis.quality_grade === "A" ? (
                  <span>⭐ Grade A: Recommended 12-24h for premium buyers</span>
                ) : analysis.quality_grade === "B" ? (
                  <span>📦 Grade B: Recommended 6-12h for quick sale</span>
                ) : (
                  <span>⚡ Grade C: Recommended 6h max, liquidate quickly</span>
                )}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
