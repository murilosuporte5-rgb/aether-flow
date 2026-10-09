export const contactFieldTypes = ["text", "number", "date"] as const;
export type ContactFieldType = typeof contactFieldTypes[number];
export type ContactField = { id: string; field_key: string; label: string; field_type: ContactFieldType; active: boolean };

export function fieldKeyFromLabel(label: string) {
  return label.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
    .replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "").slice(0, 32);
}

export function validContactFieldValue(kind: ContactFieldType, value: unknown) {
  if (kind === "text") return typeof value === "string" && value.trim().length >= 1 && value.trim().length <= 200;
  if (kind === "number") return typeof value === "number" && Number.isFinite(value) && Math.abs(value) <= 1_000_000_000_000;
  if (kind === "date") return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)
    && !Number.isNaN(Date.parse(`${value}T00:00:00.000Z`))
    && new Date(`${value}T00:00:00.000Z`).toISOString().slice(0, 10) === value;
  return false;
}
