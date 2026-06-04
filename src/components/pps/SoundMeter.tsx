import { useMemo } from "react";

interface SoundMeterProps {
  barCount?: number;
  segmentCount?: number;
  className?: string;
}

/**
 * LED-style equalizer / VU meter. Pure CSS animation, no audio.
 * Each bar: full-height colored segment stack, overlaid by an animated
 * black "shutter" from the top that hides the unlit upper portion.
 * Colors ramp green → yellow → orange → red, bottom to top.
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
          // shutter covers this much from the top (inverse of bar height)
          coverMax: 65 + r1 * 25, // dim peak height ~15-35%
          coverMin: 0 + r2 * 35, // bright peak height ~65-100%
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
        @keyframes sm-shutter {
          0%   { height: var(--cov-max); }
          50%  { height: var(--cov-min); }
          100% { height: var(--cov-max); }
        }
        @media (prefers-reduced-motion: reduce) {
          .sm-shutter { animation: none !important; height: 45% !important; }
        }
        .sm-seg {
          flex: 1 1 0;
          min-height: 2px;
          margin-bottom: 1px;
          border-radius: 1px;
          background: currentColor;
        }
        .sm-shutter {
          animation: sm-shutter var(--dur) ease-in-out infinite;
          animation-delay: var(--delay);
        }
      `}</style>
      {bars.map((b) => (
        <div key={b.i} className="relative h-full w-[6px] sm:w-[8px]">
          {/* Lit colored stack — full height of bar */}
          <div className="absolute inset-0 flex flex-col-reverse">
            {segments.map((c, s) => (
              <span
                key={s}
                className="sm-seg"
                style={{ color: c, boxShadow: `0 0 3px ${c}` }}
              />
            ))}
          </div>
          {/* Dim ghost overlay — replaces the lit colors above the shutter */}
          <div
            className="sm-shutter absolute top-0 left-0 right-0 flex flex-col overflow-hidden"
            style={
              {
                "--cov-max": `${b.coverMax}%`,
                "--cov-min": `${b.coverMin}%`,
                "--dur": `${b.duration}s`,
                "--delay": `${b.delay}s`,
                height: `${b.coverMax}%`,
              } as React.CSSProperties
            }
          >
            {/* Render the SAME stack from the top down, but very dim, so segments
                align perfectly with the lit stack below. */}
            <div
              className="absolute top-0 left-0 right-0 flex flex-col-reverse"
              style={{ height: `${(segmentCount / segmentCount) * 100}%` }}
            >
              {/* black backdrop so colored segs are hidden */}
              <span className="absolute inset-0 bg-black" />
            </div>
            {/* Dim segment outlines drawn on top of the black backdrop */}
            <div
              className="absolute left-0 right-0 flex flex-col-reverse"
              style={{
                bottom: `calc(-100% * (100 / var(--bar-cover, 100)))`,
              }}
            />
          </div>
          {/* Separate full-height dim ghost stack, behind everything */}
          <div className="absolute inset-0 flex flex-col-reverse -z-10">
            {segments.map((c, s) => (
              <span
                key={s}
                className="sm-seg"
                style={{ color: c, opacity: 0.15 }}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default SoundMeter;
