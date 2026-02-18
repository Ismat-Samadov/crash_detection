import { generateAllReadings } from "@/lib/simulator";

export const runtime = "nodejs";
export const dynamic = "force-dynamic"; // never cache — always fresh readings

export async function GET() {
  const data = generateAllReadings();
  return Response.json(data, {
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate",
    },
  });
}
