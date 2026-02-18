"use client";

import { clsx } from "clsx";
import type { AnomalyEvent } from "@/types";
import { SENSOR_CONFIGS } from "@/lib/config";

interface AnomalyLogProps {
  events: AnomalyEvent[];
}

function timeAgo(isoString: string): string {
  const diff = (Date.now() - new Date(isoString).getTime()) / 1000;
  if (diff < 60) return `${Math.floor(diff)}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  return `${Math.floor(diff / 3600)}h ago`;
}

function formatTs(isoString: string): string {
  try {
    return new Date(isoString).toLocaleTimeString("en-US", { hour12: false });
  } catch {
    return isoString;
  }
}

const LOCATION_COLORS: Record<string, string> = {
  Mardakan: "text-sky-400 border-sky-500/30 bg-sky-500/10",
  Sumqayit: "text-violet-400 border-violet-500/30 bg-violet-500/10",
  Turkan: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10",
};

export function AnomalyLog({ events }: AnomalyLogProps) {
  return (
    <section className="rounded-xl border border-[#1a2d4a] bg-[#060d1a] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#1a2d4a]">
        <div className="flex items-center gap-2">
          <div
            className={clsx(
              "w-2 h-2 rounded-full",
              events.length > 0 ? "bg-red-400 animate-pulse" : "bg-[#1a2d4a]"
            )}
          />
          <h3 className="text-[#94a3b8] text-xs font-semibold tracking-widest uppercase">
            Anomaly Event Log
          </h3>
        </div>
        <span className="text-[#475569] font-mono text-xs">
          {events.length} event{events.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Empty state */}
      {events.length === 0 && (
        <div className="flex flex-col items-center justify-center py-10 gap-2">
          <div className="w-10 h-10 rounded-full border border-[#1a2d4a] flex items-center justify-center text-[#1a2d4a] text-lg">
            ✓
          </div>
          <p className="text-[#475569] text-sm">No anomalies detected this session</p>
          <p className="text-[#2d3f55] text-xs">All stations operating within normal parameters</p>
        </div>
      )}

      {/* Event list */}
      {events.length > 0 && (
        <div className="divide-y divide-[#0d1e35] max-h-72 overflow-y-auto scrollbar-thin">
          {events.map((ev, i) => {
            const locCls =
              LOCATION_COLORS[ev.location] ??
              "text-cyan-400 border-cyan-500/30 bg-cyan-500/10";

            // Pick 2 most extreme sensor deviations to highlight
            const highlights = Object.entries(ev.sensors)
              .map(([k, v]) => {
                const cfg = SENSOR_CONFIGS[k];
                if (!cfg) return null;
                const isOut = v < cfg.normalMin || v > cfg.normalMax;
                return isOut ? { key: k, value: v, cfg } : null;
              })
              .filter(Boolean)
              .slice(0, 3);

            return (
              <div
                key={ev.id}
                className={clsx(
                  "flex flex-col sm:flex-row sm:items-center gap-2 px-4 py-3",
                  "hover:bg-red-500/5 transition-colors duration-150",
                  i === 0 && "animate-slide-up"
                )}
              >
                {/* Time + Location */}
                <div className="flex items-center gap-2 sm:w-48 flex-shrink-0">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
                  <span className="text-[#94a3b8] font-mono text-xs tabular-nums">
                    {formatTs(ev.timestamp)}
                  </span>
                  <span
                    className={clsx(
                      "px-1.5 py-0.5 rounded text-[10px] font-mono font-bold border",
                      locCls
                    )}
                  >
                    {ev.location.toUpperCase()}
                  </span>
                </div>

                {/* Score */}
                <div className="hidden sm:block sm:w-28 flex-shrink-0">
                  <span className="text-[#475569] text-[10px] font-mono">
                    score{" "}
                  </span>
                  <span className="text-red-400 font-mono text-xs font-bold tabular-nums">
                    {ev.anomaly_score.toFixed(4)}
                  </span>
                </div>

                {/* Sensor highlights */}
                <div className="flex flex-wrap gap-1.5">
                  {highlights.length > 0
                    ? highlights.map((h) => (
                        <span
                          key={h!.key}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-red-500/10 border border-red-500/20 text-[10px] font-mono text-red-300"
                        >
                          {h!.cfg.label}
                          <span className="text-red-400 font-bold">
                            {h!.value.toFixed(h!.cfg.precision)} {h!.cfg.unit}
                          </span>
                        </span>
                      ))
                    : (
                      <span className="text-[#475569] text-[10px] font-mono">
                        Multi-sensor deviation detected
                      </span>
                    )}
                </div>

                {/* Time ago */}
                <div className="sm:ml-auto text-[#475569] text-[10px] font-mono flex-shrink-0">
                  {timeAgo(ev.timestamp)}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
