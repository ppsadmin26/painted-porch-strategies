import { cn } from "@/lib/utils";

/**
 * Animated cluster of 6 gears (W.I.D.G.E.T.) that slowly rotate in
 * alternating directions. Uses pure CSS via Tailwind's arbitrary
 * properties so it stays lightweight and accessibility-friendly
 * (respects prefers-reduced-motion).
 */

interface GearProps {
  cx: number;
  cy: number;
  r: number;
  letter: string;
  duration: number;
  reverse?: boolean;
  fill?: string;
  textFill?: string;
}

const Gear = ({ cx, cy, r, letter, duration, reverse, fill = "#fff", textFill = "#00006B" }: GearProps) => {
  const teeth = 12;
  const toothDepth = r * 0.22;
  const inner = r;
  const outer = r + toothDepth;
  // Build gear outline path
  const points: string[] = [];
  const segments = teeth * 2;
  for (let i = 0; i < segments; i++) {
    const angle = (i / segments) * Math.PI * 2;
    const radius = i % 2 === 0 ? outer : inner;
    const x = cx + Math.cos(angle) * radius;
    const y = cy + Math.sin(angle) * radius;
    points.push(`${x.toFixed(2)},${y.toFixed(2)}`);
  }
  const animName = reverse ? "wg-spin-reverse" : "wg-spin";
  return (
    <g>
      <g
        style={{
          transformOrigin: `${cx}px ${cy}px`,
          animation: `${animName} ${duration}s linear infinite`,
        }}
        className="motion-reduce:[animation:none]"
      >
        <polygon points={points.join(" ")} fill={fill} />
        <circle cx={cx} cy={cy} r={r * 0.55} fill="#fff" />
      </g>
      {/* Letter stays upright, not affected by the gear rotation */}
      <text
        x={cx}
        y={cy}
        textAnchor="middle"
        dominantBaseline="central"
        fontFamily="Poppins, system-ui, sans-serif"
        fontWeight={700}
        fontSize={r * 0.85}
        fill={textFill}
      >
        {letter}
      </text>
    </g>
  );
};


interface RotatingGearsProps {
  className?: string;
}

export const RotatingGears = ({ className }: RotatingGearsProps) => {
  // Cluster of 6 gears – top row W I D, bottom row G E T (offset)
  // Coordinates designed to interlock visually.
  const gearColor = "rgba(255,255,255,0.95)";
  const altColor = "rgba(232,162,49,0.95)"; // gold accent on a couple gears

  return (
    <div className={cn("relative w-full max-w-[460px] mx-auto", className)} aria-hidden="true">
      <style>{`
        @keyframes wg-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes wg-spin-reverse { from { transform: rotate(0deg); } to { transform: rotate(-360deg); } }
      `}</style>
      <svg viewBox="0 0 400 320" className="w-full h-auto drop-shadow-[0_8px_24px_rgba(0,0,0,0.25)]">
        {/* Top row */}
        <Gear cx={75}  cy={95}  r={48} letter="W" duration={22} fill={gearColor} />
        <Gear cx={200} cy={95}  r={48} letter="D" duration={18} reverse fill={gearColor} />
        <Gear cx={325} cy={95}  r={48} letter="E" duration={24} fill={altColor} />
        {/* Bottom row, offset between top gears */}
        <Gear cx={137} cy={210} r={48} letter="I" duration={20} reverse fill={altColor} />
        <Gear cx={262} cy={210} r={48} letter="G" duration={26} fill={gearColor} />
        <Gear cx={365} cy={250} r={38} letter="T" duration={16} reverse fill={gearColor} />
      </svg>
    </div>
  );
};

export default RotatingGears;
