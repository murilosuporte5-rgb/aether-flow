import {
  daysSinceInteraction,
  staleLabel,
  STALE_THRESHOLDS,
} from "@/lib/execution";
export default function StaleIndicator({ date }: { date: string | null }) {
  const days = daysSinceInteraction(date);
  const state =
    days === null
      ? "unknown"
      : days >= STALE_THRESHOLDS.stale
        ? "stale"
        : days >= STALE_THRESHOLDS.attention
          ? "attention"
          : "normal";
  return (
    <small className={`stale-indicator ${state}`}>{staleLabel(date)}</small>
  );
}
