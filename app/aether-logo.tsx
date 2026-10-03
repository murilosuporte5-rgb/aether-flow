type AetherMarkProps = { size?: number; className?: string };

export function AetherMark({ size = 36, className = "" }: AetherMarkProps) {
  return <img className={`aether-mark ${className}`.trim()} src="/brand/aether-mark.png" width={size} height={size} alt="Aether Flow" />;
}
