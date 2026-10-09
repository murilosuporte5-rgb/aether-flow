export const brandColors = [
  { value: "#2457a5", label: "Azul" },
  { value: "#216f78", label: "Petróleo" },
  { value: "#216d51", label: "Verde" },
  { value: "#684c95", label: "Violeta" },
  { value: "#8f3e5c", label: "Vinho" },
] as const;

export const defaultBrandColor = brandColors[0].value;

export function isBrandColor(value: unknown): value is string {
  return typeof value === "string" && brandColors.some((color) => color.value === value);
}

export function brandColorOrDefault(value: unknown): string {
  return isBrandColor(value) ? value : defaultBrandColor;
}
