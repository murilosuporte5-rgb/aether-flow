type AetherMarkProps = { size?: number; className?: string };

export function AetherMark({ size = 36, className = "" }: AetherMarkProps) {
  return <svg className={`aether-mark ${className}`.trim()} width={size} height={size} viewBox="0 0 48 48" role="img" aria-label="Aether Flow" focusable="false">
    <rect x="2" y="2" width="44" height="44" rx="12" fill="#0b1729" />
    <circle cx="24" cy="24" r="12.5" fill="none" stroke="#55dfb3" strokeWidth="2.6" />
    <circle cx="24" cy="24" r="4" fill="#fff" />
    <path d="M24 8.5v5M39.5 24h-5M24 39.5v-5M8.5 24h5" stroke="#8bc8ff" strokeWidth="2.4" strokeLinecap="round" />
    <path d="m29.5 18.5 4.5 5.5-6 1.8" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>;
}
