import { useEffect, useRef } from "react";
import { type LogEntry, type AgentType } from "@/lib/types";
import { Terminal } from "lucide-react";

interface TransparencyTerminalProps {
  entries: LogEntry[];
  isLoading: boolean;
}

const AGENT_COLORS: Record<AgentType, string> = {
  SCOUT: "#00d4ff",
  NEGOTIATOR: "#00ff88",
  AUDITOR: "#ff3b5c",
  NAVIGATOR: "#ffb800",
};

export function TransparencyTerminal({ entries, isLoading }: TransparencyTerminalProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [entries.length]);

  return (
    <div className="rounded-xl bg-[#0a0f1a] border border-[#334155]/50 flex flex-col" data-testid="card-terminal">
      <div className="flex items-center gap-2 px-5 py-3 border-b border-[#334155]/30">
        <Terminal className="w-4 h-4 text-[#94a3b8]" />
        <h3 className="text-sm font-semibold text-[#e2e8f0] tracking-wide">AI REASONING LOG</h3>
        <span className="w-2 h-2 ml-1 bg-[#00ff88] rounded-sm animate-terminal-blink" />
      </div>

      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 font-mono text-[13px] leading-relaxed space-y-1"
        style={{ maxHeight: 400 }}
      >
        {isLoading ? (
          <TerminalSkeleton />
        ) : entries.length === 0 ? (
          <div className="flex items-center justify-center h-full min-h-[120px]">
            <p className="text-[#475569] text-sm">System ready... awaiting instructions</p>
          </div>
        ) : (
          entries.map((entry) => (
            <LogLine key={entry.id} entry={entry} />
          ))
        )}
      </div>
    </div>
  );
}

function LogLine({ entry }: { entry: LogEntry }) {
  const agentColor = AGENT_COLORS[entry.agent];
  const isToolCall = entry.message.includes("Tool Call:");

  return (
    <div className="animate-flash-in rounded px-1 py-0.5" data-testid={`log-${entry.id}`}>
      <span className="text-[#475569]">[{entry.timestamp}]</span>{" "}
      <span style={{ color: agentColor }}>[{entry.agent}]</span>{" "}
      <span className={isToolCall ? "text-[#94a3b8] italic" : "text-[#cbd5e1]"}>
        {entry.message}
      </span>
    </div>
  );
}

function TerminalSkeleton() {
  return (
    <div className="space-y-2">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex gap-2">
          <div className="h-4 w-20 bg-[#334155]/30 rounded animate-pulse" />
          <div className="h-4 w-24 bg-[#334155]/30 rounded animate-pulse" />
          <div className="h-4 flex-1 bg-[#334155]/30 rounded animate-pulse" />
        </div>
      ))}
    </div>
  );
}
