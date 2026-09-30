import { comparePriority, normalizePhone, priorityRank } from "./execution.ts";

type Searchable = {
  contact_name?: string;
  name?: string;
  title?: string;
  organization: string | null;
  phone: string | null;
};
export function matchesSearch(row: Searchable, query: string): boolean {
  const text = query.trim().toLocaleLowerCase("pt-BR");
  if (!text) return true;
  if (
    `${row.contact_name || row.name || ""} ${row.title || ""} ${row.organization || ""} ${row.phone || ""}`
      .toLocaleLowerCase("pt-BR")
      .includes(text)
  )
    return true;
  const phone = normalizePhone(row.phone),
    full = normalizePhone(query),
    fragment = query.replace(/\D/g, "");
  return (
    !!phone &&
    (full === phone ||
      (/^[+\d\s().-]+$/.test(query) &&
        fragment.length >= 3 &&
        phone.includes(fragment)))
  );
}
export function pendingQueue<T extends Parameters<typeof comparePriority>[0]>(
  rows: T[],
  now = Date.now(),
): T[] {
  return rows
    .filter((r) => r.status === "open" && priorityRank(r, now) <= 3)
    .sort((a, b) => comparePriority(a, b, now));
}
export function elapsedDays(
  date: string | null,
  now = Date.now(),
): number | null {
  const value = date ? Date.parse(date) : NaN;
  return Number.isFinite(value)
    ? Math.max(0, Math.floor((now - value) / 86400000))
    : null;
}
