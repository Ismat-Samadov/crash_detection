import { MODEL_META } from "@/lib/config";

export function ModelInfo() {
  const rows = [
    { label: "Model", value: MODEL_META.type },
    { label: "Version", value: `v${MODEL_META.version}` },
    { label: "Training Period", value: MODEL_META.trainingPeriod },
    {
      label: "Training Samples",
      value: MODEL_META.trainingSamples.toLocaleString(),
    },
    { label: "Features", value: `${MODEL_META.features} (sensors + temporal + location)` },
    {
      label: "Expected Anomaly Rate",
      value: `${MODEL_META.expectedAnomalyRate}%`,
    },
  ];

  return (
    <section className="rounded-xl border border-[#1a2d4a] bg-[#060d1a] overflow-hidden">
      <div className="px-4 py-3 border-b border-[#1a2d4a] flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-cyan-500" />
        <h3 className="text-[#94a3b8] text-xs font-semibold tracking-widest uppercase">
          ML Model Information
        </h3>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-px bg-[#1a2d4a]">
        {rows.map((r) => (
          <div key={r.label} className="bg-[#060d1a] px-4 py-3">
            <p className="text-[#475569] text-[10px] uppercase tracking-widest mb-1">
              {r.label}
            </p>
            <p className="text-[#94a3b8] font-mono text-xs">{r.value}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
