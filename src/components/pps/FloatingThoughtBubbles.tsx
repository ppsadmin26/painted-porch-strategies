import { useMemo } from "react";

interface Bubble {
  id: number;
  width: number;
  height: number;
  left: string;
  top: string;
  color: string;
  opacity: number;
  animDuration: string;
  animDelay: string;
  tailDir: "left" | "right" | "center";
}

const COLORS = [
  "hsl(var(--primary))",       // teal
  "hsl(var(--gold))",          // gold
  "hsl(var(--strategic))",     // purple
  "hsl(var(--lime))",          // lime
  "hsl(var(--raspberry))",     // raspberry
];

function ThoughtBubbleSVG({ width, height, color, opacity, tailDir }: { width: number; height: number; color: string; opacity: number; tailDir: string }) {
  const rx = width / 2;
  const ry = height / 2;
  const cx = rx;
  const cy = ry;

  // Tail position
  const tailX = tailDir === "left" ? width * 0.25 : tailDir === "right" ? width * 0.75 : width * 0.5;
  const tailY = height;

  return (
    <svg width={width} height={height + 16} viewBox={`0 0 ${width} ${height + 16}`} fill="none">
      <ellipse cx={cx} cy={cy} rx={rx - 2} ry={ry - 2} fill={color} fillOpacity={opacity} />
      {/* Tail */}
      <path
        d={`M${tailX - 8},${tailY - 8} Q${tailX + 4},${tailY + 10} ${tailX + 12},${tailY + 2} Q${tailX + 2},${tailY - 2} ${tailX - 8},${tailY - 8}Z`}
        fill={color}
        fillOpacity={opacity}
      />
    </svg>
  );
}

export default function FloatingThoughtBubbles() {
  const bubbles = useMemo<Bubble[]>(() => {
    const configs: Omit<Bubble, "id">[] = [
      { width: 160, height: 100, left: "5%", top: "10%", color: COLORS[0], opacity: 0.55, animDuration: "18s", animDelay: "0s", tailDir: "left" },
      { width: 120, height: 76, left: "22%", top: "55%", color: COLORS[3], opacity: 0.5, animDuration: "22s", animDelay: "-4s", tailDir: "right" },
      { width: 200, height: 120, left: "40%", top: "15%", color: COLORS[1], opacity: 0.45, animDuration: "20s", animDelay: "-8s", tailDir: "center" },
      { width: 100, height: 64, left: "60%", top: "60%", color: COLORS[4], opacity: 0.55, animDuration: "16s", animDelay: "-2s", tailDir: "left" },
      { width: 180, height: 110, left: "75%", top: "8%", color: COLORS[2], opacity: 0.5, animDuration: "24s", animDelay: "-6s", tailDir: "right" },
      { width: 90, height: 58, left: "88%", top: "50%", color: COLORS[0], opacity: 0.4, animDuration: "19s", animDelay: "-10s", tailDir: "center" },
      { width: 140, height: 88, left: "12%", top: "30%", color: COLORS[2], opacity: 0.35, animDuration: "21s", animDelay: "-12s", tailDir: "right" },
      { width: 110, height: 70, left: "50%", top: "45%", color: COLORS[3], opacity: 0.45, animDuration: "17s", animDelay: "-3s", tailDir: "left" },
      { width: 70, height: 46, left: "35%", top: "72%", color: COLORS[1], opacity: 0.5, animDuration: "23s", animDelay: "-7s", tailDir: "center" },
      { width: 130, height: 82, left: "68%", top: "35%", color: COLORS[4], opacity: 0.4, animDuration: "25s", animDelay: "-5s", tailDir: "right" },
      { width: 60, height: 40, left: "92%", top: "25%", color: COLORS[1], opacity: 0.5, animDuration: "15s", animDelay: "-9s", tailDir: "left" },
      { width: 80, height: 52, left: "3%", top: "70%", color: COLORS[4], opacity: 0.45, animDuration: "20s", animDelay: "-11s", tailDir: "center" },
    ];
    return configs.map((c, i) => ({ ...c, id: i }));
  }, []);

  return (
    <>
      <style>{`
        @keyframes bubble-float {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(15px, -20px) scale(1.05); }
          50% { transform: translate(-10px, -35px) scale(0.97); }
          75% { transform: translate(20px, -12px) scale(1.03); }
        }
      `}</style>
      <div className="absolute inset-0 overflow-hidden bg-navy">
        {bubbles.map((b) => (
          <div
            key={b.id}
            className="absolute"
            style={{
              left: b.left,
              top: b.top,
              animation: `bubble-float ${b.animDuration} ease-in-out ${b.animDelay} infinite`,
              willChange: "transform",
            }}
          >
            <ThoughtBubbleSVG
              width={b.width}
              height={b.height}
              color={b.color}
              opacity={b.opacity}
              tailDir={b.tailDir}
            />
          </div>
        ))}
      </div>
    </>
  );
}
