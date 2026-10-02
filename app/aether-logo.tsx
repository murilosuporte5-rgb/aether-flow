import { useId } from "react";

type AetherMarkProps = { size?: number; className?: string };

export function AetherMark({ size = 36, className = "" }: AetherMarkProps) {
  const id = useId().replace(/:/g, "");
  const gradientId = `aether-mark-gradient-${id}`;
  const lightId = `aether-mark-light-${id}`;

  return <svg className={`aether-mark ${className}`.trim()} width={size} height={size} viewBox="0 0 48 48" role="img" aria-label="Aether Flow" focusable="false">
    <defs>
      <linearGradient id={gradientId} x1="6" y1="4" x2="43" y2="46" gradientUnits="userSpaceOnUse">
        <stop stopColor="#2563EB" />
        <stop offset=".55" stopColor="#4F46E5" />
        <stop offset="1" stopColor="#7C3AED" />
      </linearGradient>
      <radialGradient id={lightId} cx="0" cy="0" r="1" gradientTransform="translate(13 9) rotate(48) scale(38)">
        <stop stopColor="#FFFFFF" stopOpacity=".28" />
        <stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
      </radialGradient>
    </defs>
    <rect x="2" y="2" width="44" height="44" rx="13" fill={`url(#${gradientId})`} />
    <rect x="2" y="2" width="44" height="44" rx="13" fill={`url(#${lightId})`} />
    <path d="M12.5 35.5 22 14.7a2.2 2.2 0 0 1 4 0l9.5 20.8M17.3 27.6h13.4" fill="none" stroke="#fff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M10.8 36.2c5.8 0 8.8-2.5 12.4-6 4-4 7.3-5.7 13.8-6.8" fill="none" stroke="#79F2C0" strokeWidth="2.8" strokeLinecap="round" />
    <path d="m33.2 20.3 4.3 2.8-3.1 4" fill="none" stroke="#79F2C0" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>;
}
