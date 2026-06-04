import { useMemo } from "react";

interface SoundMeterProps {
  barCount?: number;
  segmentCount?: number;
  className?: string;
}

/**
 * LED-style equalizer / VU meter. Pure CSS animation, no audio input.
 * Each bar has a dim full-height "ghost" stack of segments, with a
 * colored stack clipped from the bottom by an animated height variable —
 * so segments appear to light up green → yellow → orange → red.
 */
export const SoundMeter = ({
  barCount = 56,
  segmentCount = 18,
  className = "",
}: SoundMeterProps) => {
  const bars = useMemo(() => {
    return Array.from({ length: barCount }, (_, i) => {
      const a = Math.sin(i * 12.9898) * 43758.5453;
      const b = Math.sin(i * 78.233) * 12345.6789;
      const r1 = a - Math.floor(a);
      const r2 = b - Math.floor(b);
      return {
        i,
        duration: 0.7 + r1 * 1.6,
        delay: -r2 * 2.5,
        minPct: 12 + r1 * 18,
        maxPct: 55 + r2 * 45,
      };
    });
  }, [barCount]);

  const segments = Array.from({ length: segmentCount }, (_, s) => {
    const t = s / (segmentCount - 1);
    let color: string;
    if (t < 0.4) color = "#70A300";
    else if (t < 0.65) color = "#FFB900";
    else if (t < 0.85) color = "#FF8000";
    else color = "#DB0043";
    return color;
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
        @keyframes sm-rise {
          0%   { height: var(--min); }
          50%  { height: var(--max); }
          100% { height: var(--min); }
        }
        @media (prefers-reduced-motion: reduce) {
          .sm-fill { animation: none !important; height: 50% !important; }
        }
        .sm-seg {
          flex: 1 1 0;
          min-height: 2px;
          margin-bottom: 1px;
          border-radius: 1px;
          background: currentColor;
        }
        .sm-fill {
          animation: sm-rise var(--dur) ease-in-out infinite;
          animation-delay: var(--delay);
        }
      `}</style>
      {bars.map((b) => (
        <div
          key={b.i}
          className="relative h-full w-[6px] sm:w-[8px]"
        >
          {/* Dim ghost stack — always shows the meter shape */}
          <div className="absolute inset-0 flex flex-col-reverse">
            {segments.map((c, s) => (
              <span key={s} className="sm-seg" style={{ color: c, opacity: 0.12 }} />
            ))}
          </div>
          {/* Lit stack — clipped by animated height, anchored at bottom */}
          <div
            className="sm-fill absolute bottom-0 left-0 right-0 overflow-hidden"
            style={
              {
                "--min": `${b.minPct}%`,
                "--max": `${b.maxPct}%`,
                "--dur": `${b.duration}s`,
                "--delay": `${b.delay}s`,
                height: `${b.minPct}%`,
              } as React.CSSProperties
            }
          >
            {/* Full-height colored stack, positioned so bottom segments align with bar bottom */}
            <div
              className="absolute bottom-0 left-0 right-0 flex flex-col-reverse"
              style={{ height: `calc(100% * ${segmentCount} / ${segmentCount})` }}
            >
              {segments.map((c, s) => (
                <span
                  key={s}
                  className="sm-seg"
                  style={{ color: c, opacity: 0.98, boxShadow: `0 0 4px ${c}80` }}
                />
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SoundMeter;
