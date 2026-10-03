type AetherMarkProps = { size?: number; className?: string };

export function AetherMark({ size = 36, className = "" }: AetherMarkProps) {
  return <svg className={`aether-mark ${className}`.trim()} width={size} height={size} viewBox="0 0 48 48" role="img" aria-label="Aether Flow" focusable="false">
    <defs>
      <linearGradient id="aether-mark-bg" x1="8" y1="6" x2="40" y2="43" gradientUnits="userSpaceOnUse"><stop stopColor="#152943"/><stop offset="1" stopColor="#071421"/></linearGradient>
      <linearGradient id="aether-mark-accent" x1="13" y1="35" x2="37" y2="13" gradientUnits="userSpaceOnUse"><stop stopColor="#57d6bd"/><stop offset="1" stopColor="#73b6ff"/></linearGradient>
    </defs>
    <rect x="2" y="2" width="44" height="44" rx="14" fill="url(#aether-mark-bg)" />
    <path d="M12.5 34 21.7 14h4.5L35.5 34M16.5 27.1h14.8" fill="none" stroke="#f8fbff" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M9.5 24.8c2.3-7.6 9.2-12.2 16.8-11.6 5.9.5 10.1 3.4 12.2 8.1" fill="none" stroke="url(#aether-mark-accent)" strokeWidth="2.4" strokeLinecap="round" />
    <circle cx="38.2" cy="21.8" r="2.2" fill="#72e3ca" />
  </svg>;
}
