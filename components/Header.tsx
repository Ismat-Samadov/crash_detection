"use client";

import { useEffect, useState } from "react";
import type { ConnectionStatus } from "@/types";
import { MODEL_META } from "@/lib/config";

interface HeaderProps {
  connectionStatus: ConnectionStatus;
  lastUpdate: string | null;
  anomalyStations: number;
}

const STATUS_CFG = {
  connected: {
    dot: "bg-emerald-400",
    text: "text-emerald-400",
    label: "LIVE",
    pulse: true,
  },
  connecting: {
    dot: "bg-amber-400",
    text: "text-amber-400",
    label: "CONNECTING",
    pulse: true,
  },
  disconnected: {
    dot: "bg-slate-500",
    text: "text-slate-400",
    label: "OFFLINE",
    pulse: false,
  },
  error: {
    dot: "bg-red-500",
    text: "text-red-400",
    label: "ERROR",
    pulse: false,
  },
} as const;

export function Header({
  connectionStatus,
  lastUpdate,
  anomalyStations,
}: HeaderProps) {
  const [time, setTime] = useState(new Date());
  const sc = STATUS_CFG[connectionStatus];

  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <header className="relative border-b border-[#1a2d4a] bg-[#060d1a] overflow-hidden">
      {/* Subtle scanline shimmer */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-30">
        <div className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent animate-scanline" />
      </div>

      {/* Top accent bar */}
      <div className="h-px bg-gradient-to-r from-transparent via-cyan-500/60 to-transparent" />

      <div className="max-w-[1800px] mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
        {/* ── Brand ── */}
        <div className="flex items-center gap-3 min-w-0">
          {/* Pipeline icon */}
          <div className="relative flex-shrink-0 w-9 h-9 rounded-md bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center">
            <svg
              viewBox="0 0 24 24"
              className="w-5 h-5 text-cyan-400"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              strokeLinecap="round"
            >
              <path d="M3 12h2M19 12h2M7 12a5 5 0 0 1 10 0" />
              <circle cx="12" cy="12" r="2" fill="currentColor" />
              <path d="M12 7V5M12 19v-2M7.5 16.5l-1 1M16.5 7.5l1-1M7.5 7.5l-1-1M16.5 16.5l1 1" />
            </svg>
            {anomalyStations > 0 && (
              <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-red-500 border border-[#060d1a] animate-pulse" />
            )}
          </div>

          <div className="min-w-0">
            <h1 className="text-white font-semibold text-sm sm:text-base tracking-widest uppercase truncate">
              Azerbaijan Gas Pipeline
            </h1>
            <p className="text-[#475569] text-[10px] tracking-[0.2em] uppercase">
              SCADA · Anomaly Detection System · v{MODEL_META.version}
            </p>
          </div>
        </div>

        {/* ── Center clock (hidden on small) ── */}
        <div className="hidden md:flex flex-col items-center gap-0.5 flex-shrink-0">
          <time className="text-cyan-400 font-mono text-2xl font-bold tracking-widest tabular-nums">
            {time.toLocaleTimeString("en-US", { hour12: false })}
          </time>
          <span className="text-[#475569] font-mono text-[10px] tracking-widest">
            {time
              .toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "2-digit",
              })
              .toUpperCase()}
          </span>
        </div>

        {/* ── Right: status + last update ── */}
        <div className="flex items-center gap-3 sm:gap-5 flex-shrink-0">
          {lastUpdate && (
            <div className="hidden sm:block text-right">
              <p className="text-[#475569] text-[10px] tracking-widest uppercase">
                Last Update
              </p>
              <p className="text-[#94a3b8] font-mono text-xs tabular-nums">
                {new Date(lastUpdate).toLocaleTimeString("en-US", {
                  hour12: false,
                })}
              </p>
            </div>
          )}

          <div
            className={`flex items-center gap-2 ${sc.text} border border-current/20 rounded px-2.5 py-1`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${sc.dot} ${sc.pulse ? "animate-pulse" : ""}`}
            />
            <span className="text-[11px] font-mono tracking-widest">
              {sc.label}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
