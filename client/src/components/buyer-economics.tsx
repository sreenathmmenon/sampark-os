import { useAuctionSubscription } from "@/lib/auction-store";
import { FISH_SPECIES } from "@/data/marketData";
import { TrendingUp, Truck } from "lucide-react";

interface BuyerEconomicsProps {
  buyerId?: string;
}

export function BuyerEconomics({ buyerId = "GGE" }: BuyerEconomicsProps) {
  const auction = useAuctionSubscription();
  const catchAnalysis = auction.catch_analysis;

  if (!catchAnalysis) {
    return (
      <div className="rounded-xl bg-[#1e293b]/60 backdrop-blur-sm border border-[#334155]/50 p-6">
        <h2 className="text-sm font-mono tracking-wider text-[#94a3b8] mb-4">
          BUYER ECONOMICS
        </h2>
        <div className="flex items-center justify-center py-12">
          <p className="text-sm text-[#475569]">
            Margin calculator will appear during auction
          </p>
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

  // Get the highest accepted bid or latest bid
  const acceptedBid = auction.bids.find((b) => b.status === "ACCEPTED");
  const latestBid = auction.bids[auction.bids.length - 1];
  const activeBid = acceptedBid || latestBid;

  const purchasePrice = activeBid?.bid_amount || (fishData?.samparkTarget ?? 300);
  const retailPrice = fishData?.retailPrice || purchasePrice * 1.5;
  const transportCost = 15; // ₹15/kg for air freight
  const wastagePercent = 5; // 5% wastage
  const effectiveWeight = catchAnalysis.weight_kg * (1 - wastagePercent / 100);

  // Calculate economics
  const grossPurchase = purchasePrice * catchAnalysis.weight_kg;
  const grossRevenue = retailPrice * effectiveWeight;
  const totalTransport = transportCost * catchAnalysis.weight_kg;
  const netProfit = grossRevenue - grossPurchase - totalTransport;
  const marginPercent = grossPurchase > 0 ? ((netProfit / grossPurchase) * 100).toFixed(1) : "0";

  const hasData = activeBid !== undefined;

  return (
    <div className="rounded-xl bg-[#1e293b]/60 backdrop-blur-sm border border-[#334155]/50 p-6">
      <h2 className="text-sm font-mono tracking-wider text-[#94a3b8] mb-4">
        BUYER ECONOMICS
      </h2>

      {!hasData ? (
        <div className="flex items-center justify-center py-8">
          <p className="text-sm text-[#475569]">Place a bid to see calculations</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Revenue Section */}
          <div className="p-4 rounded-lg bg-[#0f172a]/60 border border-[#334155]/30">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-mono tracking-wider text-[#94a3b8]">
                PURCHASE PRICE
              </span>
              <span className="text-lg font-bold font-mono text-[#e2e8f0]">
                ₹{purchasePrice}/kg
              </span>
            </div>
            <div className="flex items-center justify-between text-xs text-[#64748b]">
              <span>Total Purchase</span>
              <span>₹{grossPurchase.toLocaleString("en-IN")}</span>
            </div>
          </div>

          {/* Retail Revenue */}
          <div className="p-4 rounded-lg bg-[#0f172a]/60 border border-[#334155]/30">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-mono tracking-wider text-[#94a3b8]">
                RETAIL PRICE (GULF)
              </span>
              <span className="text-lg font-bold font-mono text-[#00ff88]">
                ₹{retailPrice}/kg
              </span>
            </div>
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between text-[#64748b]">
                <span>Effective weight (after {wastagePercent}% wastage)</span>
                <span>{effectiveWeight.toFixed(1)} kg</span>
              </div>
              <div className="flex items-center justify-between text-[#94a3b8]">
                <span>Gross Revenue</span>
                <span className="font-semibold">
                  ₹{grossRevenue.toLocaleString("en-IN")}
                </span>
              </div>
            </div>
          </div>

          {/* Costs */}
          <div className="p-4 rounded-lg bg-[#0f172a]/60 border border-[#334155]/30">
            <div className="flex items-center gap-2 mb-3">
              <Truck className="w-4 h-4 text-[#ff3b5c]" />
              <span className="text-[10px] font-mono tracking-wider text-[#94a3b8]">
                TRANSPORT (AIR FREIGHT)
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#64748b]">₹{transportCost}/kg</span>
              <span className="text-sm font-mono text-[#ff3b5c]">
                -₹{totalTransport.toLocaleString("en-IN")}
              </span>
            </div>
          </div>

          {/* Net Margin */}
          <div className="p-5 rounded-lg bg-gradient-to-br from-[#00ff88]/10 to-[#00ff88]/5 border border-[#00ff88]/30">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-[#00ff88]" />
              <span className="text-[10px] font-mono tracking-wider text-[#94a3b8]">
                NET PROFIT
              </span>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-bold font-mono text-[#00ff88]">
                ₹{netProfit.toLocaleString("en-IN")}
              </span>
              <span className="text-lg font-semibold text-[#00ff88]">{marginPercent}%</span>
            </div>
            <div className="mt-2 text-[10px] text-[#64748b] font-mono">
              Margin on purchase cost
            </div>
          </div>

          {/* Calculation Breakdown */}
          <div className="p-3 rounded-lg bg-[#0f172a]/40 border border-[#334155]/20">
            <p className="text-[10px] font-mono text-[#64748b] mb-2">FORMULA:</p>
            <p className="text-[10px] font-mono text-[#94a3b8] leading-relaxed">
              Net = (₹{retailPrice} × {effectiveWeight.toFixed(1)}kg) - ₹
              {grossPurchase.toLocaleString("en-IN")} - ₹{totalTransport}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
