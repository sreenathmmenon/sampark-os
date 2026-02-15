import { Mic, Camera } from "lucide-react";

interface FloatingActionsProps {
  onCamera: () => void;
  onVoice: () => void;
}

export function FloatingActions({ onCamera, onVoice }: FloatingActionsProps) {
  return (
    <div className="fixed bottom-28 right-4 z-20 flex flex-col gap-3 lg:hidden">
      <button
        onClick={onVoice}
        className="w-12 h-12 rounded-full flex items-center justify-center border border-[#ffb800]/30 transition-colors"
        style={{ backgroundColor: "#ffb80015" }}
        data-testid="button-voice"
      >
        <Mic className="w-5 h-5 text-[#ffb800]" />
      </button>
      <button
        onClick={onCamera}
        className="w-12 h-12 rounded-full flex items-center justify-center border border-[#94a3b8]/30 transition-colors"
        style={{ backgroundColor: "#94a3b815" }}
        data-testid="button-camera"
      >
        <Camera className="w-5 h-5 text-[#94a3b8]" />
      </button>
    </div>
  );
}
