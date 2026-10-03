type AetherMarkProps = { size?: number; className?: string };

export function AetherMark({ size = 36, className = "" }: AetherMarkProps) {
  return <svg className={`aether-mark ${className}`.trim()} width={size} height={size} viewBox="0 0 48 48" role="img" aria-label="Aether Flow" focusable="false">
    <rect x="2" y="2" width="44" height="44" rx="12" fill="#f2f7ff" />
    <text x="24" y="29" textAnchor="middle" fill="#102b50" fontFamily="Manrope, Arial, sans-serif" fontSize="17" fontWeight="800" letterSpacing="-1.5">AF</text>
    <path d="M12 36h24" stroke="#36c79c" strokeWidth="3" strokeLinecap="round" />
  </svg>;
}
