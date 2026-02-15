import { BUYERS } from "@/data/marketData";
import { Building2, MapPin } from "lucide-react";

interface BuyerHeaderProps {
  buyerId?: string;
}

export function BuyerHeader({ buyerId = "GGE" }: BuyerHeaderProps) {
  const buyer = BUYERS.find((b) => b.id === buyerId);

  if (!buyer) return null;

  return (
    <div className="rounded-xl bg-[#1e293b]/60 backdrop-blur-sm border border-[#334155]/50 p-6">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-xl bg-[#00ff88]/10 flex items-center justify-center text-3xl">
          {buyer.avatar}
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-[#e2e8f0] mb-1">
            {buyer.name}
          </h1>
          <p className="text-sm text-[#94a3b8] font-mono mb-2">{buyer.localName}</p>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-[#64748b]" />
              <span className="text-xs text-[#94a3b8]">{buyer.type.toUpperCase()}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#64748b]" />
              <span className="text-xs text-[#94a3b8]">{buyer.location}</span>
            </div>
          </div>
        </div>
        <div className="px-4 py-3 rounded-lg bg-[#0f172a]/60 border border-[#334155]/30">
          <p className="text-[10px] font-mono tracking-wider text-[#94a3b8] mb-1">SPECIALTY</p>
          <p className="text-sm font-medium text-[#00ff88]">{buyer.specialty}</p>
        </div>
      </div>
    </div>
  );
}
