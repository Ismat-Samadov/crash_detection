"use client";

import { usePolling } from "@/hooks/usePolling";
import { Header } from "@/components/Header";
import { SystemStats } from "@/components/SystemStats";
import { StationCard } from "@/components/StationCard";
import { AnomalyLog } from "@/components/AnomalyLog";
import { ModelInfo } from "@/components/ModelInfo";
import { STATION_NAMES } from "@/lib/config";
import { clsx } from "clsx";

export default function DashboardPage() {
  const {
    stations,
    connectionStatus,
    anomalyLog,
    lastUpdate,
    totalAnomaliesSession,
    activeStations,
    anomalyStations,
  } = usePolling();

  const hasAnomalies = anomalyStations > 0;

  return (
    <div className="min-h-screen bg-[#030a14] bg-dot-grid flex flex-col">
      {/* ── Header ── */}
      <Header
        connectionStatus={connectionStatus}
        lastUpdate={lastUpdate}
        anomalyStations={anomalyStations}
      />

      {/* ── Active anomaly banner ── */}
      {hasAnomalies && (
        <div className="bg-red-500/10 border-b border-red-500/30 px-4 py-2 flex items-center justify-center gap-3 animate-fade-in">
          <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse-fast flex-shrink-0" />
          <p className="text-red-300 text-sm font-mono tracking-wide text-center">
            ⚠ ANOMALY DETECTED — {anomalyStations} station
            {anomalyStations !== 1 ? "s" : ""} require attention
          </p>
          <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse-fast flex-shrink-0" />
        </div>
      )}

      {/* ── Main content ── */}
      <main className="flex-1 max-w-[1800px] mx-auto w-full px-4 sm:px-6 py-6 space-y-6">
        {/* ── System stats bar ── */}
        <SystemStats
          activeStations={activeStations}
          anomalyStations={anomalyStations}
          totalAnomaliesSession={totalAnomaliesSession}
          connectionStatus={connectionStatus}
        />

        {/* ── Section label ── */}
        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-gradient-to-r from-[#1a2d4a] to-transparent" />
          <span className="text-[#475569] text-[10px] tracking-[0.3em] uppercase font-mono flex-shrink-0">
            Monitoring Stations
          </span>
          <div className="h-px flex-1 bg-gradient-to-l from-[#1a2d4a] to-transparent" />
        </div>

        {/* ── Station cards grid ── */}
        <div
          className={clsx(
            "grid gap-4 sm:gap-5",
            "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
          )}
        >
          {STATION_NAMES.map((name) => (
            <StationCard
              key={name}
              name={name}
              data={stations[name] ?? null}
            />
          ))}
        </div>

        {/* ── Divider ── */}
        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-gradient-to-r from-[#1a2d4a] to-transparent" />
          <span className="text-[#475569] text-[10px] tracking-[0.3em] uppercase font-mono flex-shrink-0">
            Session Events & Model
          </span>
          <div className="h-px flex-1 bg-gradient-to-l from-[#1a2d4a] to-transparent" />
        </div>

        {/* ── Lower panels ── */}
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-5">
          {/* Anomaly log — takes 3/5 on large screens */}
          <div className="xl:col-span-3">
            <AnomalyLog events={anomalyLog} />
          </div>

          {/* Model info — takes 2/5 on large screens */}
          <div className="xl:col-span-2">
            <ModelInfo />
          </div>
        </div>

        {/* ── Footer ── */}
        <footer className="border-t border-[#1a2d4a] pt-4 pb-2 flex flex-col sm:flex-row items-center justify-between gap-2 text-[#475569] text-[10px] font-mono tracking-wide">
          <span>
            AZERBAIJAN GAS PIPELINE SCADA · ANOMALY DETECTION SYSTEM v2.0
          </span>
          <span className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-500/60" />
            One-Class SVM · 170,289 training samples · 2018–2024
          </span>
        </footer>
      </main>
    </div>
  );
}
