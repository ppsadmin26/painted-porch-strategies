/**
 * Animated color convergence/splash background using brand colors.
 * Uses absolute positioning with top/left instead of transforms to avoid
 * conflicts with animation keyframe transforms.
 */
export default function ColorSplashBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden bg-navy" aria-hidden="true">
      {/* Base gradient shift */}
      <div className="absolute inset-0 animate-color-shift-base" />

      {/* Primary (Teal) blob */}
      <div
        className="absolute rounded-full pointer-events-none blur-[56px] animate-blob-1"
        style={{
          width: "min(90vw, 1200px)",
          height: "min(90vw, 1200px)",
          top: "-10%",
          left: "-10%",
          background: "radial-gradient(circle, hsl(var(--primary)) 0%, hsl(var(--primary) / 0.45) 45%, transparent 72%)",
        }}
      />

      {/* Lime blob */}
      <div
        className="absolute rounded-full pointer-events-none blur-[52px] animate-blob-2"
        style={{
          width: "min(78vw, 1000px)",
          height: "min(78vw, 1000px)",
          top: "5%",
          left: "20%",
          background: "radial-gradient(circle, hsl(var(--lime)) 0%, hsl(var(--lime) / 0.35) 45%, transparent 72%)",
        }}
      />

      {/* Purple blob */}
      <div
        className="absolute rounded-full pointer-events-none blur-[54px] animate-blob-3"
        style={{
          width: "min(82vw, 1100px)",
          height: "min(82vw, 1100px)",
          top: "-5%",
          left: "30%",
          background: "radial-gradient(circle, hsl(var(--purple)) 0%, hsl(var(--purple) / 0.4) 45%, transparent 72%)",
        }}
      />

      {/* Gold blob */}
      <div
        className="absolute rounded-full pointer-events-none blur-[48px] animate-blob-4"
        style={{
          width: "min(65vw, 850px)",
          height: "min(65vw, 850px)",
          top: "15%",
          left: "10%",
          background: "radial-gradient(circle, hsl(var(--gold)) 0%, hsl(var(--gold) / 0.35) 45%, transparent 72%)",
        }}
      />

      {/* Raspberry blob */}
      <div
        className="absolute rounded-full pointer-events-none blur-[50px] animate-blob-5"
        style={{
          width: "min(60vw, 800px)",
          height: "min(60vw, 800px)",
          top: "10%",
          left: "40%",
          background: "radial-gradient(circle, hsl(var(--raspberry)) 0%, hsl(var(--raspberry) / 0.35) 45%, transparent 72%)",
        }}
      />

      {/* Center pulse glow */}
      <div
        className="absolute rounded-full pointer-events-none blur-[40px] animate-pulse-center"
        style={{
          width: "min(35vw, 500px)",
          height: "min(35vw, 500px)",
          top: "50%",
          left: "50%",
          marginTop: "min(-17.5vw, -250px)",
          marginLeft: "min(-17.5vw, -250px)",
          background: "radial-gradient(circle, white 0%, hsl(var(--primary) / 0.3) 50%, transparent 75%)",
          opacity: 0.5,
        }}
      />
    </div>
  );
}
