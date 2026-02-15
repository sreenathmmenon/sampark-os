import { Camera, Upload, Shield } from "lucide-react";
import { type CatchAnalysis } from "@/lib/types";
import { Badge } from "@/components/ui/badge";

interface CatchCardProps {
  analysis: CatchAnalysis | null;
  isLoading: boolean;
  error: string | null;
  onUpload: (file: File) => void;
  onRetry?: () => void;
  photoUrl: string | null;
}

export function CatchCard({ analysis, isLoading, error, onUpload, onRetry, photoUrl }: CatchCardProps) {
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) onUpload(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onUpload(file);
  };

  return (
    <div className="rounded-xl bg-[#1e293b]/60 backdrop-blur-sm border border-[#334155]/50 p-5" data-testid="card-catch">
      <div className="flex items-center gap-2 mb-4">
        <Camera className="w-4 h-4 text-[#94a3b8]" />
        <h3 className="text-sm font-semibold text-[#e2e8f0] tracking-wide">CATCH ANALYSIS</h3>
      </div>

      {isLoading ? (
        <CatchSkeleton />
      ) : error ? (
        <div className="flex flex-col items-center gap-3 py-6">
          <p className="text-sm text-[#ff3b5c]">{error}</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="px-4 py-2 text-sm font-medium text-[#e2e8f0] bg-[#334155]/60 rounded-md border border-[#334155]/50 transition-colors"
              style={{ minHeight: 40 }}
              data-testid="button-retry-analysis"
            >
              Retry Analysis
            </button>
          )}
        </div>
      ) : analysis ? (
        <AnalysisResult analysis={analysis} photoUrl={photoUrl} />
      ) : (
        <UploadArea onDrop={handleDrop} onFileChange={handleFileChange} photoUrl={photoUrl} />
      )}
    </div>
  );
}

function UploadArea({ onDrop, onFileChange, photoUrl }: { onDrop: (e: React.DragEvent) => void; onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void; photoUrl: string | null }) {
  return (
    <label
      onDrop={onDrop}
      onDragOver={(e) => e.preventDefault()}
      className="flex flex-col items-center justify-center gap-3 py-8 border-2 border-dashed border-[#334155]/60 rounded-lg cursor-pointer transition-colors"
      data-testid="area-upload"
    >
      {photoUrl ? (
        <img src={photoUrl} alt="Catch" className="w-full max-h-40 object-cover rounded-md" />
      ) : (
        <>
          <div className="w-12 h-12 rounded-full bg-[#334155]/40 flex items-center justify-center">
            <Upload className="w-5 h-5 text-[#94a3b8]" />
          </div>
          <p className="text-sm text-[#94a3b8]">Awaiting catch photo...</p>
          <p className="text-xs text-[#64748b]">Tap to capture or drop image</p>
        </>
      )}
      <input type="file" accept="image/*" capture="environment" className="hidden" onChange={onFileChange} data-testid="input-photo" />
    </label>
  );
}

function AnalysisResult({ analysis, photoUrl }: { analysis: CatchAnalysis; photoUrl: string | null }) {
  const gradeColor = analysis.quality_score >= 90 ? "#00ff88" : analysis.quality_score >= 70 ? "#ffb800" : "#ff3b5c";

  return (
    <div className="space-y-4 animate-fade-in">
      {photoUrl && (
        <img src={photoUrl} alt="Catch" className="w-full h-36 object-cover rounded-lg" />
      )}
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-2 flex-wrap">
          <div>
            <p className="text-lg font-semibold text-[#e2e8f0]" data-testid="text-species">{analysis.species_local} / {analysis.species}</p>
            <p className="text-sm text-[#94a3b8]">~{analysis.weight_kg} kg estimated</p>
          </div>
          <Badge
            className="no-default-hover-elevate no-default-active-elevate text-xs font-mono px-2.5 py-1 border-0"
            style={{ backgroundColor: `${gradeColor}20`, color: gradeColor, boxShadow: `0 0 12px ${gradeColor}30` }}
            data-testid="badge-quality"
          >
            Grade {analysis.quality_grade} &middot; {analysis.quality_score}%
          </Badge>
        </div>
        <div className="flex items-center gap-2 text-xs text-[#64748b] font-mono">
          <Shield className="w-3.5 h-3.5" />
          <span data-testid="text-certificate">Certificate #{analysis.catch_certificate_hash.slice(0, 12)}...</span>
        </div>
        <div className="text-xs text-[#94a3b8]">
          Freshness: {analysis.freshness_hours}h post-catch
        </div>
      </div>
    </div>
  );
}

function CatchSkeleton() {
  return (
    <div className="space-y-4">
      <div className="w-full h-36 rounded-lg bg-[#334155]/40 animate-pulse" />
      <div className="space-y-2">
        <div className="h-5 w-48 bg-[#334155]/40 rounded animate-pulse" />
        <div className="h-4 w-32 bg-[#334155]/40 rounded animate-pulse" />
        <div className="h-4 w-56 bg-[#334155]/40 rounded animate-pulse" />
      </div>
    </div>
  );
}
