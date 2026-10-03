type AetherMarkProps = { size?: number; className?: string };

export function AetherMark({ size = 36, className = "" }: AetherMarkProps) {
  return <svg className={`aether-mark ${className}`.trim()} width={size} height={size} viewBox="0 0 48 48" role="img" aria-label="Aether Flow" focusable="false">
    <rect x="2" y="2" width="44" height="44" rx="12" fill="#10233d" />
    <path d="M12 35 21.8 13.8a2.4 2.4 0 0 1 4.4 0L36 35" fill="none" stroke="#fff" strokeWidth="4.2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M16.5 27h15" fill="none" stroke="#fff" strokeWidth="3.4" strokeLinecap="round" />
    <path d="M10.5 38.2h27" fill="none" stroke="#54d6b0" strokeWidth="2.8" strokeLinecap="round" />
  </svg>;
}
