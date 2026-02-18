export const dynamic = "force-dynamic";

export async function GET() {
  return Response.json({
    status: "healthy",
    model_loaded: true,
    simulator_active: true,
    timestamp: new Date().toISOString(),
    version: "2.0",
    stations: ["Mardakan", "Sumqayit", "Turkan"],
    model_type: "One-Class SVM (RBF) — Mahalanobis approximation",
    training_samples: 170289,
    expected_anomaly_rate: "1.0%",
  });
}
