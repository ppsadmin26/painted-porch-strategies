import { useState } from "react";

const VARIANTS = [
  { id: "v1", label: "V1 — Editorial Asymmetric" },
  { id: "v2", label: "V2 — Cinematic Stoic Dusk" },
  { id: "v3", label: "V3 — Stoic Concentric" },
];

export default function HeroPreviewCompare() {
  const [width, setWidth] = useState<number>(1280);
  const [scale, setScale] = useState<number>(0.4);

  return (
    <div className="min-h-screen bg-neutral-100">
      <div className="sticky top-0 z-10 bg-white border-b border-neutral-200 px-4 py-3 flex flex-wrap items-center gap-4">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-poppins font-semibold text-navy">Hero Preview Comparison</h1>
        <label className="flex items-center gap-2 text-sm text-charcoal">
          Frame width
          <select
            value={width}
            onChange={(e) => setWidth(Number(e.target.value))}
            className="border border-neutral-300 rounded px-2 py-1 text-sm"
          >
            <option value={1920}>1920 (Desktop XL)</option>
            <option value={1440}>1440 (Desktop)</option>
            <option value={1280}>1280 (Laptop)</option>
            <option value={1024}>1024 (Tablet L)</option>
            <option value={768}>768 (Tablet)</option>
            <option value={414}>414 (Mobile)</option>
          </select>
        </label>
        <label className="flex items-center gap-2 text-sm text-charcoal">
          Zoom
          <input
            type="range"
            min={0.2}
            max={1}
            step={0.05}
            value={scale}
            onChange={(e) => setScale(Number(e.target.value))}
          />
          <span className="tabular-nums">{Math.round(scale * 100)}%</span>
        </label>
        <div className="flex gap-2 ml-auto text-xs">
          {VARIANTS.map((v) => (
            <a
              key={v.id}
              href={`/hero-preview/${v.id}`}
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 rounded border border-navy text-navy hover:bg-navy hover:text-white transition"
            >
              Open {v.id.toUpperCase()} ↗
            </a>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 p-4">
        {VARIANTS.map((v) => {
          const scaledW = width * scale;
          const scaledH = 900 * scale;
          return (
            <div key={v.id} className="flex flex-col gap-2">
              <div className="text-sm font-poppins font-semibold text-navy">{v.label}</div>
              <div
                className="bg-white border border-neutral-300 rounded-lg overflow-hidden shadow-sm mx-auto"
                style={{ width: scaledW, height: scaledH }}
              >
                <iframe
                  src={`/hero-preview/${v.id}`}
                  title={v.label}
                  style={{
                    width: width,
                    height: 900,
                    border: 0,
                    transform: `scale(${scale})`,
                    transformOrigin: "top left",
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
