"use client";

import { clsx } from "clsx";
import type { StationReading } from "@/types";
import { SENSOR_CONFIGS } from "@/lib/config";
import { SensorRow } from "./SensorRow";

interface StationCardProps {
  name: string;
  data: StationReading | null;
}

const LOCATION_META: Record<
  string,
  { coords: string; region: string; color: string }
> = {
  Mardakan: {
    coords: "40.5072° N, 50.1944° E",
    region: "Absheron Peninsula",
    color: "from-sky-500/10",
  },
  Sumqayit: {
    coords: "40.5855° N, 49.6317° E",
    region: "Caspian Corridor",
    color: "from-violet-500/10",
  },
  Turkan: {
    coords: "40.3167° N, 50.0667° E",
    region: "Southern Zone",
    color: "from-emerald-500/10",
  },
};

export function StationCard({ name, data }: StationCardProps) {
  const isAnomaly = data?.is_anomaly ?? false;
  const isLoading = !data;
  const meta = LOCATION_META[name] ?? {
    coords: "—",
    region: "—",
    color: "from-cyan-500/10",
  };

  return (
    <div
      className={clsx(
        "relative rounded-xl border bg-[#09132180] backdrop-blur-sm overflow-hidden",
        "transition-all duration-500 flex flex-col",
        isAnomaly
          ? "border-red-500/60 shadow-glow-red"
          : "border-[#1a2d4a] hover:border-cyan-500/30 hover:shadow-glow-cyan"
      )}
    >
      {/* Anomaly overlay */}
      {isAnomaly && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-red-500/5 animate-pulse-slow" />
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-red-500/80 to-transparent" />
        </div>
      )}

      {/* Top accent gradient */}
      {!isAnomaly && (
        <div
          className={clsx(
            "absolute top-0 left-0 right-0 h-px bg-gradient-to-r to-transparent",
            meta.color
          )}
        />
      )}

      {/* ── Card Header ── */}
      <div
        className={clsx(
          "flex items-start justify-between px-4 pt-4 pb-3 border-b",
          isAnomaly ? "border-red-500/30" : "border-[#1a2d4a]"
        )}
      >
        <div className="flex items-start gap-2.5 min-w-0">
          {/* Status dot */}
          <div className="mt-1 flex-shrink-0 relative">
            <div
              className={clsx(
                "w-2.5 h-2.5 rounded-full",
                isLoading
                  ? "bg-slate-600"
                  : isAnomaly
                    ? "bg-red-400"
                    : "bg-emerald-400"
              )}
            />
            {!isLoading && (
              <div
                className={clsx(
                  "absolute inset-0 rounded-full animate-ping opacity-60",
                  isAnomaly ? "bg-red-400" : "bg-emerald-400"
                )}
              />
            )}
          </div>

          <div className="min-w-0">
            <h2 className="text-white font-bold text-base tracking-wider uppercase">
              {name}
            </h2>
            <p className="text-[#475569] text-[10px] tracking-wide mt-0.5">
              {meta.region}
            </p>
          </div>
        </div>

        {/* Status badge */}
        <div
          className={clsx(
            "flex-shrink-0 px-2.5 py-1 rounded-md text-[11px] font-mono font-bold tracking-widest border",
            isLoading
              ? "bg-[#1a2d4a] text-[#475569] border-[#1a2d4a]"
              : isAnomaly
                ? "bg-red-500/15 text-red-400 border-red-500/40"
                : "bg-emerald-500/10 text-emerald-400 border-emerald-500/25"
          )}
        >
          {isLoading ? "INIT" : isAnomaly ? "⚠ ANOMALY" : "● NORMAL"}
        </div>
      </div>

      {/* ── Sensors ── */}
      <div className="px-4 py-3 flex-1">
        {isLoading ? (
          <div className="space-y-1">
            {Object.keys(SENSOR_CONFIGS).map((k) => (
              <div key={k} className="flex items-center gap-3 py-[5px]">
                <div className="w-4 h-3 bg-[#1a2d4a] rounded animate-pulse" />
                <div className="w-[100px] h-2.5 bg-[#1a2d4a] rounded animate-pulse" />
                <div className="flex-1 h-[5px] bg-[#1a2d4a] rounded-full animate-pulse" />
                <div className="w-[90px] h-2.5 bg-[#1a2d4a] rounded animate-pulse" />
              </div>
            ))}
          </div>
        ) : (
          <div>
            {Object.keys(SENSOR_CONFIGS).map((key) => (
              <SensorRow
                key={key}
                sensorKey={key}
                value={data!.sensors[key as keyof typeof data.sensors]}
                isAnomaly={isAnomaly}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Card Footer ── */}
      <div
        className={clsx(
          "flex items-center justify-between px-4 py-2.5 border-t text-[10px] font-mono",
          isAnomaly ? "border-red-500/30" : "border-[#1a2d4a]"
        )}
      >
        <div className="text-[#475569] truncate">
          <span className="text-[#475569]/60">coords </span>
          <span className="text-[#94a3b8]/70">{meta.coords}</span>
        </div>
        {data && (
          <div
            className={clsx(
              "flex items-center gap-1.5 flex-shrink-0 ml-2",
              isAnomaly ? "text-red-400/70" : "text-[#475569]"
            )}
          >
            <span>score</span>
            <span
              className={clsx(
                "font-bold",
                isAnomaly ? "text-red-400" : "text-[#94a3b8]"
              )}
            >
              {data.anomaly_score.toFixed(4)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
