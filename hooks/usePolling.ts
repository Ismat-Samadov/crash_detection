"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import type {
  StationReading,
  StationsState,
  AnomalyEvent,
  ConnectionStatus,
} from "@/types";

const POLL_INTERVAL_MS = 2000;
const MAX_ANOMALY_LOG = 50;
const MAX_CONSECUTIVE_ERRORS = 5;

export function usePolling() {
  const [stations, setStations] = useState<StationsState>({
    Mardakan: null,
    Sumqayit: null,
    Turkan: null,
  });
  const [connectionStatus, setConnectionStatus] =
    useState<ConnectionStatus>("connecting");
  const [anomalyLog, setAnomalyLog] = useState<AnomalyEvent[]>([]);
  const [lastUpdate, setLastUpdate] = useState<string | null>(null);
  const [totalAnomaliesSession, setTotalAnomaliesSession] = useState(0);

  const consecutiveErrorsRef = useRef(0);
  const mountedRef = useRef(true);

  const poll = useCallback(async () => {
    if (!mountedRef.current) return;
    try {
      const res = await fetch("/api/readings", { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data: Record<string, StationReading> = await res.json();
      if (!mountedRef.current) return;

      consecutiveErrorsRef.current = 0;
      setConnectionStatus("connected");

      // Merge new readings into station state
      setStations((prev) => {
        const next = { ...prev };
        for (const [name, reading] of Object.entries(data)) {
          next[name as keyof StationsState] = reading;
        }
        return next;
      });

      // Capture timestamp from the first reading
      const firstReading = Object.values(data)[0];
      if (firstReading) setLastUpdate(firstReading.timestamp);

      // Add anomaly events to the log
      const newAnomalies = Object.values(data).filter((r) => r.is_anomaly);
      if (newAnomalies.length > 0) {
        const events: AnomalyEvent[] = newAnomalies.map((r) => ({
          id: `${r.timestamp}-${r.location}`,
          timestamp: r.timestamp,
          location: r.location,
          anomaly_score: r.anomaly_score,
          sensors: r.sensors,
        }));
        setAnomalyLog((prev) => [...events, ...prev].slice(0, MAX_ANOMALY_LOG));
        setTotalAnomaliesSession((n) => n + newAnomalies.length);
      }
    } catch {
      if (!mountedRef.current) return;
      consecutiveErrorsRef.current += 1;
      if (consecutiveErrorsRef.current >= MAX_CONSECUTIVE_ERRORS) {
        setConnectionStatus("disconnected");
      } else {
        setConnectionStatus("error");
      }
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;

    // Immediate first fetch
    poll();

    const id = setInterval(poll, POLL_INTERVAL_MS);
    return () => {
      mountedRef.current = false;
      clearInterval(id);
    };
  }, [poll]);

  const activeStations = Object.values(stations).filter(Boolean).length;
  const anomalyStations = Object.values(stations).filter(
    (s) => s?.is_anomaly
  ).length;

  return {
    stations,
    connectionStatus,
    anomalyLog,
    lastUpdate,
    totalAnomaliesSession,
    activeStations,
    anomalyStations,
  };
}
