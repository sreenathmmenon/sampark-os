import { useState, useEffect } from "react";
import { Fish } from "lucide-react";
import { LanguageSelector } from "@/components/language-selector";

interface TopBarProps {
  onDemoToggle?: () => void;
  currentLang: string;
  onLangChange: (lang: string) => void;
}

export function TopBar({ onDemoToggle, currentLang, onLangChange }: TopBarProps) {
  const [time, setTime] = useState(getISTTime());

  useEffect(() => {
    const interval = setInterval(() => setTime(getISTTime()), 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="flex items-center justify-between gap-2 px-4 py-3 border-b border-[#1e293b]/50 bg-[#0a0f1a]" style={{ minHeight: 52 }}>
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-md bg-[#00ff88]/10 flex items-center justify-center">
          <Fish className="w-4.5 h-4.5 text-[#00ff88]" />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-semibold tracking-wide text-[#e2e8f0] leading-tight" data-testid="text-app-title">SAMPARK-OS</span>
          <span className="text-[11px] text-[#94a3b8] tracking-widest leading-tight">MATSYA EDITION</span>
        </div>
        <div className="ml-2 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#00ff88] animate-pulse-glow" />
          <span className="text-[11px] text-[#94a3b8] font-mono">ONLINE</span>
        </div>
      </div>
      <div className="flex items-center gap-3">
        {onDemoToggle && (
          <button
            onClick={onDemoToggle}
            className="px-2.5 py-1 text-[11px] font-mono tracking-wider text-[#ffb800] border border-[#ffb800]/30 rounded-md bg-[#ffb800]/5 transition-colors"
            style={{ minHeight: 30 }}
            data-testid="button-demo"
          >
            DEMO
          </button>
        )}
        <LanguageSelector currentLang={currentLang} onLangChange={onLangChange} />
        <span className="text-xs font-mono text-[#94a3b8]" data-testid="text-time">{time}</span>
      </div>
    </header>
  );
}

function getISTTime(): string {
  return new Date().toLocaleTimeString("en-IN", {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}
