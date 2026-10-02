type AetherMarkProps = { size?: number; className?: string };

export function AetherMark({ size = 36, className = "" }: AetherMarkProps) {
  return <svg className={`aether-mark ${className}`.trim()} width={size} height={size} viewBox="0 0 48 48" role="img" aria-label="Aether Flow" focusable="false">
    <defs>
      <linearGradient id="aether-mark-gradient" x1="5" y1="4" x2="44" y2="46" gradientUnits="userSpaceOnUse">
        <stop stopColor="#123458" />
        <stop offset="1" stopColor="#0d6a83" />
      </linearGradient>
      <linearGradient id="aether-flow-line" x1="10" y1="13" x2="38" y2="37" gradientUnits="userSpaceOnUse">
        <stop stopColor="#8fe8c1" />
        <stop offset="1" stopColor="#d9f4ff" />
      </linearGradient>
    </defs>
    <rect x="2" y="2" width="44" height="44" rx="13" fill="url(#aether-mark-gradient)" />
    <circle cx="24" cy="24" r="13.5" fill="none" stroke="#a9d9eb" strokeOpacity=".28" strokeWidth="1.4" />
    <path d="M11 30c4.1-11.6 11.1-17.5 19.1-15.8 5.8 1.2 8.3 6.9 5.1 11.4-3 4.3-10.9 5.5-15.3 2.1-3.7-2.8-2.9-8.4 1.5-10.5" fill="none" stroke="url(#aether-flow-line)" strokeWidth="3.2" strokeLinecap="round" />
    <path d="M9.5 36c7.1 4.2 18.3 4.1 26.9-2.2" fill="none" stroke="#66d5a6" strokeWidth="2.2" strokeLinecap="round" />
    <circle cx="21.5" cy="17.2" r="3.1" fill="#ffd071" stroke="#123458" strokeWidth="1.5" />
  </svg>;
}
