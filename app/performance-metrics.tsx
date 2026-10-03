"use client";

import { useEffect } from "react";

type MetricState = { lcp?: number; cls?: number; inp?: number };

export default function PerformanceMetrics() {
  useEffect(() => {
    const state: MetricState = {};
    const publish = () => document.documentElement.dataset.aetherPerformance = JSON.stringify(state);
    const observers: PerformanceObserver[] = [];
    const interactionDurations = new Map<number, number>();
    let clsSessionValue = 0;
    let clsSessionStart = 0;
    let clsLastEntry = 0;
    let maxCls = 0;
    if ("PerformanceObserver" in window) {
      try {
        const lcp = new PerformanceObserver((list) => { const entry = list.getEntries().at(-1); if (entry) state.lcp = Math.round(entry.startTime); publish(); });
        lcp.observe({ type: "largest-contentful-paint", buffered: true }); observers.push(lcp);
      } catch { /* unsupported browser */ }
      try {
        const cls = new PerformanceObserver((list) => {
          for (const entry of list.getEntries() as Array<PerformanceEntry & { value?: number; hadRecentInput?: boolean }>) {
            if (entry.hadRecentInput) continue;
            const startsNewSession = !clsSessionStart || entry.startTime - clsLastEntry > 1000 || entry.startTime - clsSessionStart > 5000;
            if (startsNewSession) {
              clsSessionStart = entry.startTime;
              clsSessionValue = entry.value || 0;
            } else clsSessionValue += entry.value || 0;
            clsLastEntry = entry.startTime;
            maxCls = Math.max(maxCls, clsSessionValue);
          }
          state.cls = Number(maxCls.toFixed(3));
          publish();
        });
        cls.observe({ type: "layout-shift", buffered: true }); observers.push(cls);
      } catch { /* unsupported browser */ }
      try {
        const inp = new PerformanceObserver((list) => {
          for (const entry of list.getEntries() as Array<PerformanceEntry & { duration?: number; interactionId?: number }>) {
            if (!entry.interactionId) continue;
            interactionDurations.set(entry.interactionId, Math.max(interactionDurations.get(entry.interactionId) || 0, entry.duration || 0));
          }
          const durations = [...interactionDurations.values()].sort((a, b) => b - a);
          if (durations.length) state.inp = Math.round(durations[Math.min(Math.floor(durations.length / 50), durations.length - 1)]);
          publish();
        });
        inp.observe({ type: "event", buffered: true, durationThreshold: 40 } as PerformanceObserverInit & { durationThreshold: number }); observers.push(inp);
      } catch { /* unsupported browser */ }
    }
    publish();
    return () => observers.forEach((observer) => observer.disconnect());
  }, []);
  return null;
}
