import { Shield, Clock, MapPin } from "lucide-react";
import { type CatchAnalysis } from "@/lib/types";
import { Progress } from "@/components/ui/progress";

interface QualityCertificateProps {
  analysis: CatchAnalysis | null;
  isLoading: boolean;
}

export function QualityCertificate({ analysis, isLoading }: QualityCertificateProps) {
  if (isLoading) {
    return (
      <div className="rounded-xl bg-[#1e293b]/60 backdrop-blur-sm border border-[#334155]/50 p-5">
        <div className="space-y-3">
          <div className="h-4 w-36 bg-[#334155]/40 rounded animate-pulse" />
          <div className="h-4 w-full bg-[#334155]/40 rounded animate-pulse" />
          <div className="h-4 w-48 bg-[#334155]/40 rounded animate-pulse" />
          <div className="h-3 w-full bg-[#334155]/40 rounded animate-pulse" />
        </div>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="rounded-xl bg-[#1e293b]/60 backdrop-blur-sm border border-[#334155]/50 p-5">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="w-4 h-4 text-[#94a3b8]" />
          <h3 className="text-sm font-semibold text-[#e2e8f0] tracking-wide">QUALITY CERTIFICATE</h3>
        </div>
        <p className="text-sm text-[#475569] text-center py-4">Awaiting catch analysis...</p>
      </div>
    );
  }

  const freshnessPercent = Math.max(0, Math.min(100, 100 - (analysis.freshness_hours / 24) * 100));

  return (
    <div className="rounded-xl bg-[#1e293b]/60 backdrop-blur-sm border border-[#334155]/50 p-5 animate-fade-in" data-testid="card-certificate">
      <div className="flex items-center gap-2 mb-4">
        <Shield className="w-4 h-4 text-[#00ff88]" />
        <h3 className="text-sm font-semibold text-[#e2e8f0] tracking-wide">QUALITY CERTIFICATE</h3>
      </div>
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2 text-xs">
          <span className="text-[#94a3b8] font-mono">HASH</span>
          <span className="text-[#e2e8f0] font-mono truncate max-w-[180px]">{analysis.catch_certificate_hash}</span>
        </div>
        <div className="flex items-center justify-between gap-2 text-xs">
          <span className="text-[#94a3b8] font-mono flex items-center gap-1.5"><Clock className="w-3 h-3" /> TIMESTAMP</span>
          <span className="text-[#e2e8f0] font-mono">{new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}</span>
        </div>
        <div className="flex items-center justify-between gap-2 text-xs">
          <span className="text-[#94a3b8] font-mono flex items-center gap-1.5"><MapPin className="w-3 h-3" /> GPS</span>
          <span className="text-[#e2e8f0] font-mono">9.9312&deg;N, 76.2673&deg;E</span>
        </div>
        <div className="mt-3">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-[#94a3b8] font-mono">FRESHNESS SCORE</span>
            <span className="text-[#00ff88] font-mono font-semibold">{Math.round(freshnessPercent)}%</span>
          </div>
          <Progress value={freshnessPercent} className="h-2 bg-[#334155]/40" />
        </div>
      </div>
    </div>
  );
}
