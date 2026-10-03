export const TIME_ZONE = "America/Bahia";
/** Bahia is UTC-03:00 without seasonal clock changes. */
export const TIME_ZONE_OFFSET = "-03:00";
export const STALE_THRESHOLDS = { attention: 3, stale: 7 } as const;
export const LEAD_SOURCES = ["WhatsApp", "Instagram", "Google", "Site", "Indicação", "Ligação", "Evento", "Outro"] as const;
export const STAGE_STALE_DAYS = 7;
export const ACTION_TYPES = [
  "WhatsApp",
  "Ligação",
  "Reunião",
  "Enviar proposta",
  "Revisar proposta",
  "Aguardar cliente",
  "Follow-up",
] as const;
export const LOSS_REASONS = [
  "Preço",
  "Sem resposta",
  "Escolheu concorrente",
  "Adiado",
  "Sem orçamento",
  "Não qualificado",
  "Sem prioridade",
  "Outro",
] as const;
const DDDS = new Set(
  "11 12 13 14 15 16 17 18 19 21 22 24 27 28 31 32 33 34 35 37 38 41 42 43 44 45 46 47 48 49 51 53 54 55 61 62 63 64 65 66 67 68 69 71 73 74 75 77 79 81 82 83 84 85 86 87 88 89 91 92 93 94 95 96 97 98 99".split(
    " ",
  ),
);

/** E.164 digits without '+'. Never infer a missing DDD. */
export function normalizePhone(
  value: string | null | undefined,
): string | null {
  if (!value || !/^[+\d\s().-]+$/.test(value.trim())) return null;
  const digits = value.replace(/\D/g, "");
  const explicitInternational = value.trim().startsWith("+");
  let result = digits;
  if (!explicitInternational && (digits.length === 10 || digits.length === 11))
    result = `55${digits}`;
  else if (!explicitInternational && !digits.startsWith("55")) return null;
  if (!/^[1-9]\d{6,14}$/.test(result)) return null;
  if (result.startsWith("55")) {
    const local = result.slice(2);
    if (!DDDS.has(local.slice(0, 2))) return null;
    if (
      !(local.length === 11
        ? /^\d{2}9\d{8}$/.test(local)
        : local.length === 10 && /^\d{2}[2-5]\d{7}$/.test(local))
    )
      return null;
  }
  return result;
}
export function formatPhone(value: string | null): string {
  const phone = normalizePhone(value);
  if (!phone) return value || "Sem telefone";
  if (phone.startsWith("55")) {
    const local = phone.slice(2);
    return `(${local.slice(0, 2)}) ${local.slice(2, -4)}-${local.slice(-4)}`;
  }
  return `+${phone}`;
}
export function phoneForStorage(value: string): string | null {
  const normalized = normalizePhone(value);
  return normalized ? `+${normalized}` : null;
}
export function whatsappUrl(phone: string | null, message = ""): string | null {
  const normalized = normalizePhone(phone);
  return normalized
    ? `https://wa.me/${normalized}${message ? `?text=${encodeURIComponent(message)}` : ""}`
    : null;
}
export function messageTemplate(
  name: string,
  title: string,
  model: "follow-up" | "proposal" = "follow-up",
): string {
  const greeting = `Olá, ${name.split(" ")[0]}.`;
  return model === "proposal"
    ? `${greeting} Podemos conversar sobre a proposta de ${title}?`
    : `${greeting} Estou entrando em contato para dar continuidade à nossa conversa sobre ${title}.`;
}
export function daysSinceInteraction(
  date: string | null,
  now = Date.now(),
): number | null {
  const timestamp = date ? Date.parse(date) : NaN;
  return Number.isFinite(timestamp)
    ? Math.max(0, Math.floor((now - timestamp) / 86400000))
    : null;
}
export function staleLabel(date: string | null, now = Date.now()): string {
  const days = daysSinceInteraction(date, now);
  return days === null
    ? "Sem contato registrado"
    : `${days} ${days === 1 ? "dia" : "dias"} sem contato`;
}
export function dateKey(date: string | number): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(date));
}
export type Executable = {
  id: string;
  status: string;
  next_action_at: string | null;
  next_action_type: string | null;
  last_interaction_at: string | null;
  created_at: string;
};
export function priorityRank(row: Executable, now = Date.now()): number {
  if (row.status !== "open") return 6;
  if (row.next_action_at && Date.parse(row.next_action_at) < now) return 0;
  if (row.next_action_at && dateKey(row.next_action_at) === dateKey(now))
    return 1;
  if (!row.next_action_at) return 2;
  if (
    (daysSinceInteraction(row.last_interaction_at, now) ?? -1) >=
    STALE_THRESHOLDS.stale
  )
    return 3;
  if (row.next_action_type === "Aguardar cliente") return 4;
  return 5;
}
export function comparePriority(
  a: Executable,
  b: Executable,
  now = Date.now(),
): number {
  return (
    priorityRank(a, now) - priorityRank(b, now) ||
    (a.next_action_at || a.created_at).localeCompare(
      b.next_action_at || b.created_at,
    ) ||
    a.id.localeCompare(b.id)
  );
}
