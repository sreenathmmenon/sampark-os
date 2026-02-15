import { useState, useRef, useEffect } from "react";
import { Globe } from "lucide-react";
import { LANGUAGES } from "@/data/marketData";

interface LanguageSelectorProps {
  currentLang: string;
  onLangChange: (code: string) => void;
}

export function LanguageSelector({
  currentLang,
  onLangChange,
}: LanguageSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const current = LANGUAGES.find((l) => l.code === currentLang) || LANGUAGES[0];

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-mono tracking-wider text-[#22d3ee] border border-[#22d3ee]/30 rounded-md bg-[#22d3ee]/5 hover:bg-[#22d3ee]/10 transition-colors"
        style={{ minHeight: 30 }}
      >
        <Globe className="w-3 h-3" />
        <span>{current.nativeName}</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-1 z-50 min-w-[180px] rounded-lg bg-[#1e293b] border border-[#334155]/50 shadow-xl shadow-black/30 overflow-hidden">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              onClick={() => {
                onLangChange(lang.code);
                setIsOpen(false);
              }}
              className={`w-full flex items-center justify-between gap-3 px-4 py-2.5 text-left text-sm transition-colors hover:bg-[#334155]/50 ${
                lang.code === currentLang
                  ? "text-[#00ff88] bg-[#00ff88]/5"
                  : "text-[#e2e8f0]"
              }`}
            >
              <span className="flex items-center gap-2">
                <span className="text-base">{lang.nativeName}</span>
                <span className="text-[10px] text-[#94a3b8]">
                  {lang.region}
                </span>
              </span>
              {lang.code === currentLang && (
                <span className="w-1.5 h-1.5 rounded-full bg-[#00ff88]" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
