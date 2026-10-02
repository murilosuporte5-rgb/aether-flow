type PendingOpportunity = {
  id: string;
  contact_id: string;
  status: string;
  next_action_at: string | null;
};

function localDay(value: string) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date(value));
  const part = (type: string) => parts.find((entry) => entry.type === type)?.value || "";
  return `${part("year")}-${part("month")}-${part("day")}`;
}

export function conflictOpportunityIds(rows: PendingOpportunity[]) {
  const grouped = new Map<string, string[]>();
  for (const row of rows) {
    if (row.status !== "open" || !row.next_action_at) continue;
    const key = `${row.contact_id}:${localDay(row.next_action_at)}`;
    grouped.set(key, [...(grouped.get(key) || []), row.id]);
  }
  return new Set([...grouped.values()].filter((ids) => ids.length > 1).flat());
}
