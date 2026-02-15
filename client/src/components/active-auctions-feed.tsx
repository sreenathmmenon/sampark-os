import { useAuctionSubscription } from "@/lib/auction-store";
import { Award, Clock, MapPin, Weight } from "lucide-react";
import { FISH_SPECIES } from "@/data/marketData";

export function ActiveAuctionsFeed() {
  const auction = useAuctionSubscription();
  const catchAnalysis = auction.catch_analysis;

  if (!catchAnalysis) {
    return (
      <div className="rounded-xl bg-[#1e293b]/60 backdrop-blur-sm border border-[#334155]/50 p-6">
        <h2 className="text-sm font-mono tracking-wider text-[#94a3b8] mb-4">ACTIVE AUCTIONS</h2>
        <div className="flex items-center justify-center py-12">
          <p className="text-sm text-[#475569]">Waiting for incoming offers...</p>
        </div>
      </div>
    );
  }

  // Find fish data
  const fishData = Object.values(FISH_SPECIES).find(
    (fish) =>
      fish.english.toLowerCase() === catchAnalysis.species.toLowerCase() ||
      fish.id === catchAnalysis.species.toLowerCase()
  );

  const askingPrice = fishData ? fishData.samparkTarget : 300;
  const harbors = auction.harbors;
  const closestHarbor = harbors.length > 0 ? harbors[0] : null;

  return (
    <div className="rounded-xl bg-[#1e293b]/60 backdrop-blur-sm border border-[#334155]/50 p-6">
      <h2 className="text-sm font-mono tracking-wider text-[#94a3b8] mb-4">ACTIVE AUCTIONS</h2>

      {/* Auction Card - WhatsApp style */}
      <div className="rounded-lg bg-[#0f172a]/60 border-l-4 border-l-[#00ff88] border-r border-r-[#334155]/30 border-t border-t-[#334155]/30 border-b border-b-[#334155]/30 p-4 hover:bg-[#0f172a]/80 transition-colors cursor-pointer">
        <div className="flex items-start gap-3">
          {/* Fish Photo Thumbnail */}
          <div className="w-16 h-16 rounded-lg bg-[#334155]/40 flex items-center justify-center flex-shrink-0">
            <span className="text-2xl">🐟</span>
          </div>

          <div className="flex-1 min-w-0">
            {/* Species & Quality */}
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-base font-semibold text-[#e2e8f0]">
                {catchAnalysis.species}
              </h3>
              <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-[#00ff88]/10 border border-[#00ff88]/30">
                <Award className="w-3 h-3 text-[#00ff88]" />
                <span className="text-xs font-mono font-semibold text-[#00ff88]">
                  {catchAnalysis.quality_grade}
                </span>
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-2 mb-3">
              <div className="flex items-center gap-1.5">
                <Weight className="w-3.5 h-3.5 text-[#64748b]" />
                <span className="text-xs text-[#94a3b8]">{catchAnalysis.weight_kg}kg</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#ffb800]" />
                <span className="text-xs text-[#ffb800] font-mono">
                  {catchAnalysis.freshness_hours}h fresh
                </span>
              </div>
            </div>

            {/* Harbor Proximity */}
            {closestHarbor && (
              <div className="flex items-center gap-1.5 mb-3">
                <MapPin className="w-3.5 h-3.5 text-[#64748b]" />
                <span className="text-xs text-[#94a3b8]">
                  {closestHarbor.name} · {closestHarbor.distance_km}km
                </span>
              </div>
            )}

            {/* Asking Price */}
            <div className="flex items-center justify-between pt-2 border-t border-[#334155]/30">
              <span className="text-[10px] font-mono tracking-wider text-[#94a3b8]">
                ASKING PRICE
              </span>
              <span className="text-lg font-bold font-mono text-[#00ff88]">
                ₹{askingPrice}/kg
              </span>
            </div>

            {/* Total Gross */}
            <div className="flex items-center justify-between mt-1">
              <span className="text-[10px] font-mono tracking-wider text-[#64748b]">TOTAL</span>
              <span className="text-sm font-mono text-[#e2e8f0]">
                ₹{(askingPrice * catchAnalysis.weight_kg).toLocaleString("en-IN")}
              </span>
            </div>
          </div>
        </div>

        {/* New Badge */}
        {auction.state === "SCANNING" || auction.state === "AUCTION_LIVE" ? (
          <div className="mt-3 flex items-center justify-center">
            <span className="px-2 py-1 text-[10px] font-mono tracking-wider text-[#00ff88] bg-[#00ff88]/10 rounded border border-[#00ff88]/30 animate-pulse">
              NEW OFFER
            </span>
          </div>
        ) : null}
      </div>
    </div>
  );
}
