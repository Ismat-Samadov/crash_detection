import { SENSOR_CONFIGS } from "@/lib/config";
import { clsx } from "clsx";

interface SensorRowProps {
  sensorKey: string;
  value: number;
  isAnomaly: boolean;
}

function getBarPercent(value: number, min: number, max: number) {
  return Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100));
}

export function SensorRow({ sensorKey, value, isAnomaly }: SensorRowProps) {
  const cfg = SENSOR_CONFIGS[sensorKey];
  if (!cfg) return null;

  const pct = getBarPercent(value, cfg.min, cfg.max);
  const isOutOfRange = value < cfg.normalMin || value > cfg.normalMax;

  const severity = isAnomaly ? "anomaly" : isOutOfRange ? "warn" : "normal";

  const barColor = {
    anomaly: "bg-red-500",
    warn: "bg-amber-500",
    normal: "bg-cyan-500",
  }[severity];

  const valueColor = {
    anomaly: "text-red-400",
    warn: "text-amber-400",
    normal: "text-cyan-300",
  }[severity];

  const glowClass = {
    anomaly: "shadow-[0_0_8px_rgba(255,61,87,0.5)]",
    warn: "shadow-[0_0_8px_rgba(245,158,11,0.4)]",
    normal: "",
  }[severity];

  return (
    <div className="flex items-center gap-2 sm:gap-3 py-[5px] group">
      {/* Icon */}
      <span className="text-[#475569] text-[11px] font-mono w-4 flex-shrink-0 select-none">
        {cfg.icon}
      </span>

      {/* Label */}
      <div className="w-[88px] sm:w-[100px] text-[#94a3b8] text-[11px] uppercase tracking-wide truncate flex-shrink-0">
        {cfg.label}
      </div>

      {/* Bar */}
      <div className="flex-1 relative h-[5px] bg-[#0d1e35] rounded-full overflow-hidden min-w-0">
        {/* Normal range indicator */}
        <div
          className="absolute top-0 bottom-0 bg-white/5 rounded-full"
          style={{
            left: `${getBarPercent(cfg.normalMin, cfg.min, cfg.max)}%`,
            width: `${getBarPercent(cfg.normalMax, cfg.min, cfg.max) - getBarPercent(cfg.normalMin, cfg.min, cfg.max)}%`,
          }}
        />
        {/* Value bar */}
        <div
          className={clsx(
            "absolute inset-y-0 left-0 rounded-full transition-all duration-700",
            barColor,
            glowClass
          )}
          style={{ width: `${pct}%` }}
        />
      </div>

      {/* Value */}
      <div
        className={clsx(
          "w-[76px] sm:w-[90px] text-right font-mono text-[12px] tabular-nums transition-colors duration-300 flex-shrink-0",
          valueColor
        )}
      >
        {value.toFixed(cfg.precision)}
        <span className="text-[#475569] text-[10px] ml-0.5">{cfg.unit}</span>
      </div>
    </div>
  );
}
