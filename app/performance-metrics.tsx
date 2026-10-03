"use client";

import { useEffect } from "react";

type MetricState = { lcp?: number; cls?: number; inp?: number };

export default function PerformanceMetrics() {
  useEffect(() => {
    const state: MetricState = {};
    const publish = () => document.documentElement.dataset.aetherPerformance = JSON.stringify(state);
    const observers: PerformanceObserver[] = [];
    if ("PerformanceObserver" in window) {
      try {
        const lcp = new PerformanceObserver((list) => { const entry = list.getEntries().at(-1); if (entry) state.lcp = Math.round(entry.startTime); publish(); });
        lcp.observe({ type: "largest-contentful-paint", buffered: true }); observers.push(lcp);
      } catch { /* unsupported browser */ }
      try {
        const cls = new PerformanceObserver((list) => { state.cls = Number((list.getEntries() as Array<PerformanceEntry & { value?: number }>).reduce((sum, entry) => sum + (entry.value || 0), 0).toFixed(3)); publish(); });
        cls.observe({ type: "layout-shift", buffered: true }); observers.push(cls);
      } catch { /* unsupported browser */ }
      try {
        const inp = new PerformanceObserver((list) => { const entry = list.getEntries().at(-1) as (PerformanceEntry & { duration?: number }) | undefined; if (entry) state.inp = Math.round(entry.duration || 0); publish(); });
        inp.observe({ type: "event", buffered: true }); observers.push(inp);
      } catch { /* unsupported browser */ }
    }
    publish();
    return () => observers.forEach((observer) => observer.disconnect());
  }, []);
  return null;
}
