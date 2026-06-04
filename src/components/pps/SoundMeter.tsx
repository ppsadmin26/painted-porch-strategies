import { useMemo } from "react";

interface SoundMeterProps {
  barCount?: number;
  segmentCount?: number;
  className?: string;
}

/**
 * LED-style equalizer / VU meter. Pure CSS animation, no audio.
 * Each bar layers a dim full-height segment stack with a bright stack
 * revealed bottom-up via animated clip-path inset — so segments stay
 * pixel-aligned. Colors ramp green → yellow → orange → red.
 */
export const SoundMeter = ({
  barCount = 56,
  segmentCount = 18,
  className = "",
}: SoundMeterProps) => {
  const bars = useMemo(
    () =>
      Array.from({ length: barCount }, (_, i) => {
        const a = Math.sin(i * 12.9898) * 43758.5453;
        const b = Math.sin(i * 78.233) * 12345.6789;
        const r1 = a - Math.floor(a);
        const r2 = b - Math.floor(b);
        return {
          i,
          duration: 0.7 + r1 * 1.6,
          delay: -r2 * 2.5,
          // clip-path inset from the top: high = mostly hidden (low bar)
          insetMax: 75 - r1 * 20, // 55-75% covered → bar at 25-45%
          insetMin: 10 + r2 * 25, // 10-35% covered → bar at 65-90%
        };
      }),
    [barCount]
  );

  const segments = Array.from({ length: segmentCount }, (_, s) => {
    const t = s / (segmentCount - 1);
    if (t < 0.4) return "#70A300";
    if (t < 0.65) return "#FFB900";
    if (t < 0.85) return "#FF8000";
    return "#DB0043";
  });

  return (
    <div
      className={`pointer-events-none flex items-end justify-center gap-[3px] sm:gap-1 h-40 sm:h-56 px-4 ${className}`}
      aria-hidden="true"
      style={{
        WebkitMaskImage:
          "linear-gradient(to right, transparent 0%, black 12%, black 88%, transparent 100%)",
        maskImage:
          "linear-gradient(to right, transparent 0%, black 12%, black 88%, transparent 100%)",
      }}
    >
      <style>{`
        @keyframes sm-clip {
          0%   { clip-path: inset(var(--ins-max) 0 0 0); }
          50%  { clip-path: inset(var(--ins-min) 0 0 0); }
          100% { clip-path: inset(var(--ins-max) 0 0 0); }
        }
        @media (prefers-reduced-motion: reduce) {
          .sm-lit { animation: none !important; clip-path: inset(50% 0 0 0) !important; }
        }
        .sm-seg {
          flex: 1 1 0;
          min-height: 2px;
          margin-bottom: 1px;
          border-radius: 1px;
          background: currentColor;
        }
        .sm-lit {
          animation: sm-clip var(--dur) ease-in-out infinite;
          animation-delay: var(--delay);
        }
      `}</style>
      {bars.map((b) => (
        <div key={b.i} className="relative h-full w-[6px] sm:w-[8px]">
          {/* Dim ghost stack — full height, low opacity */}
          <div className="absolute inset-0 flex flex-col-reverse">
            {segments.map((c, s) => (
              <span
                key={s}
                className="sm-seg"
                style={{ color: c, opacity: 0.16 }}
              />
            ))}
          </div>
          {/* Bright lit stack — same full-height layout, clipped from top */}
          <div
            className="sm-lit absolute inset-0 flex flex-col-reverse"
            style={
              {
                "--ins-max": `${b.insetMax}%`,
                "--ins-min": `${b.insetMin}%`,
                "--dur": `${b.duration}s`,
                "--delay": `${b.delay}s`,
                clipPath: `inset(${b.insetMax}% 0 0 0)`,
              } as React.CSSProperties
            }
          >
            {segments.map((c, s) => (
              <span
                key={s}
                className="sm-seg"
                style={{ color: c, boxShadow: `0 0 3px ${c}` }}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default SoundMeter;
