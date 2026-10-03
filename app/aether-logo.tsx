type AetherMarkProps = { size?: number; className?: string };

export function AetherMark({ size = 36, className = "" }: AetherMarkProps) {
  return <svg className={`aether-mark ${className}`.trim()} width={size} height={size} viewBox="0 0 48 48" role="img" aria-label="Aether Flow" focusable="false">
    <defs><linearGradient id="aether-mark-bg" x1="7" y1="5" x2="42" y2="44" gradientUnits="userSpaceOnUse"><stop stopColor="#173a68"/><stop offset="1" stopColor="#0b233f"/></linearGradient></defs>
    <rect x="2" y="2" width="44" height="44" rx="13" fill="url(#aether-mark-bg)" />
    <path d="M13 33.5 22.1 14h3.8L35 33.5M17.2 27h13.6" fill="none" stroke="#f4f8ff" strokeWidth="3.1" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M9.5 24c2.8-8.1 10.6-12.5 19.1-10.7 5.1 1.1 8.3 4.1 10 8.2" fill="none" stroke="#42d4b0" strokeWidth="2" strokeLinecap="round" opacity=".95" />
    <circle cx="38.6" cy="21.5" r="2.4" fill="#ffd166" />
  </svg>;
}
