import { clsx } from "clsx";
import type { ConnectionStatus } from "@/types";
import { MODEL_META, STATION_NAMES } from "@/lib/config";

interface SystemStatsProps {
  activeStations: number;
  anomalyStations: number;
  totalAnomaliesSession: number;
  connectionStatus: ConnectionStatus;
}

function StatCard({
  label,
  value,
  sub,
  accent,
  pulse,
}: {
  label: string;
  value: string | number;
  sub?: string;
  accent?: "cyan" | "red" | "green" | "amber";
  pulse?: boolean;
}) {
  const accentMap = {
    cyan: "text-cyan-400 border-cyan-500/20 bg-cyan-500/5",
    red: "text-red-400 border-red-500/20 bg-red-500/5",
    green: "text-emerald-400 border-emerald-500/20 bg-emerald-500/5",
    amber: "text-amber-400 border-amber-500/20 bg-amber-500/5",
  };
  const cls = accent ? accentMap[accent] : "text-white border-[#1a2d4a] bg-[#09132150]";

  return (
    <div
      className={clsx(
        "relative rounded-lg border px-4 py-3 flex flex-col gap-1 overflow-hidden",
        cls
      )}
    >
      <p className="text-[#475569] text-[10px] uppercase tracking-widest">
        {label}
      </p>
      <div className="flex items-end gap-2">
        <span
          className={clsx(
            "font-mono font-bold text-xl tabular-nums",
            pulse && "animate-pulse-fast"
          )}
        >
          {value}
        </span>
        {sub && (
          <span className="text-[#475569] text-[10px] mb-0.5 font-mono">
            {sub}
          </span>
        )}
      </div>
    </div>
  );
}

export function SystemStats({
  activeStations,
  anomalyStations,
  totalAnomaliesSession,
  connectionStatus,
}: SystemStatsProps) {
  const allOnline = activeStations === STATION_NAMES.length;
  const hasAnomalies = anomalyStations > 0;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <StatCard
        label="Active Stations"
        value={`${activeStations} / ${STATION_NAMES.length}`}
        accent={allOnline ? "green" : "amber"}
        sub="stations"
      />
      <StatCard
        label="Anomaly Alerts"
        value={anomalyStations}
        accent={hasAnomalies ? "red" : "green"}
        sub="current"
        pulse={hasAnomalies}
      />
      <StatCard
        label="Session Anomalies"
        value={totalAnomaliesSession}
        accent={totalAnomaliesSession > 0 ? "amber" : "cyan"}
        sub="detected"
      />
      <StatCard
        label="Model Status"
        value={connectionStatus === "connected" ? "ACTIVE" : "STANDBY"}
        accent={connectionStatus === "connected" ? "cyan" : "amber"}
        sub={`${(MODEL_META.trainingSamples / 1000).toFixed(0)}K samples`}
      />
    </div>
  );
}
