type AetherMarkProps = { size?: number; className?: string };

export function AetherMark({ size = 36, className = "" }: AetherMarkProps) {
  return <svg className={`aether-mark ${className}`.trim()} width={size} height={size} viewBox="0 0 48 48" role="img" aria-label="Aether Flow" focusable="false">
    <defs>
      <linearGradient id="aether-mark-gradient" x1="8" y1="6" x2="42" y2="44" gradientUnits="userSpaceOnUse">
        <stop stopColor="#dff2ff" />
        <stop offset="1" stopColor="#b7e9dc" />
      </linearGradient>
    </defs>
    <rect x="2" y="2" width="44" height="44" rx="13" fill="url(#aether-mark-gradient)" />
    <path d="M13 34 22.5 13h3L35 34h-4.8l-2-4.8H19.8l-2 4.8H13Zm8.4-9h5.2L24 18.7 21.4 25Z" fill="#175a9b" />
    <path d="M8 24c4.6-9.5 12.7-14.3 24.4-14.3 2.7 0 5.2.3 7.6.9" fill="none" stroke="#1da879" strokeWidth="2.4" strokeLinecap="round" opacity=".9" />
    <circle cx="39.5" cy="10.7" r="2.4" fill="#f5b94c" />
  </svg>;
}
