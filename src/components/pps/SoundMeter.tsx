import { useMemo } from "react";

interface SoundMeterProps {
  barCount?: number;
  segmentCount?: number;
  className?: string;
}

/**
 * LED-style equalizer / VU meter. Pure CSS animation, no audio input.
 * Bars rise and fall on independent loops; segments light up from
 * green (bottom) → yellow → orange → red (top), like a broadcast meter.
 */
export const SoundMeter = ({
  barCount = 56,
  segmentCount = 18,
  className = "",
}: SoundMeterProps) => {
  // Deterministic pseudo-random offsets so bars look choreographed but distinct.
  const bars = useMemo(() => {
    return Array.from({ length: barCount }, (_, i) => {
      const a = Math.sin(i * 12.9898) * 43758.5453;
      const b = Math.sin(i * 78.233) * 12345.6789;
      const rand1 = a - Math.floor(a); // 0..1
      const rand2 = b - Math.floor(b); // 0..1
      const duration = 0.7 + rand1 * 1.6; // 0.7s – 2.3s
      const delay = -rand2 * 2.5; // negative so bars start mid-cycle
      const minPct = 15 + rand1 * 20; // 15–35%
      const maxPct = 60 + rand2 * 40; // 60–100%
      return { i, duration, delay, minPct, maxPct };
    });
  }, [barCount]);

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
          .sm-bar { animation: none !important; height: 50% !important; }
        }
        .sm-seg {
          flex: 1 1 0;
          min-height: 2px;
          margin-bottom: 1px;
          border-radius: 1px;
          opacity: 0.18;
          background: currentColor;
          transition: opacity 120ms linear;
        }
        .sm-bar { animation: sm-rise var(--dur) ease-in-out infinite; animation-delay: var(--delay); }
      `}</style>
      {bars.map((b) => (
        <div
          key={b.i}
          className="sm-bar relative flex flex-col-reverse w-[6px] sm:w-[8px]"
          style={
            {
              "--min": `${b.minPct}%`,
              "--max": `${b.maxPct}%`,
              "--dur": `${b.duration}s`,
              "--delay": `${b.delay}s`,
            } as React.CSSProperties
          }
        >
          {Array.from({ length: segmentCount }).map((_, s) => {
            // s = 0 is bottom segment. Color ramp green → yellow → orange → red.
            const t = s / (segmentCount - 1);
            let color: string;
            if (t < 0.4) color = "#70A300"; // lime green
            else if (t < 0.65) color = "#FFB900"; // golden yellow
            else if (t < 0.85) color = "#FF8000"; // bright orange
            else color = "#DB0043"; // raspberry red
            return (
              <span
                key={s}
                className="sm-seg"
                style={{ color, opacity: 0.95 }}
              />
            );
          })}
          {/* dim backdrop showing unlit meter shape */}
          <span
            className="absolute inset-0 -z-10 flex flex-col-reverse"
            aria-hidden="true"
          >
            {Array.from({ length: segmentCount }).map((_, s) => (
              <span
                key={s}
                className="sm-seg"
                style={{ color: "#1a1a1a", opacity: 0.35 }}
              />
            ))}
          </span>
        </div>
      ))}
    </div>
  );
};

export default SoundMeter;
