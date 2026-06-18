import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

/**
 * Hero Preview V3, "Painted Color-Block"
 * Split canvas: warm ivory left for content, vibrant teal panel right
 * with concentric gold porch rings. Navy headline, raspberry IF, purple subline.
 */
export default function HeroPreviewV3() {
  return (
    <section className="relative min-h-[90vh] w-full overflow-hidden bg-[#FBF7EE]">
      <div className="grid min-h-[90vh] grid-cols-1 lg:grid-cols-12">
        {/* Left content */}
        <div className="relative z-10 flex items-center px-6 py-20 lg:col-span-8 lg:px-20 lg:py-28">
          {/* soft accents */}
          <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute -bottom-40 -left-40 h-[500px] w-[500px] rounded-full bg-gold/15 blur-[120px]" />
            <div className="absolute top-10 right-0 h-[300px] w-[300px] rounded-full bg-[#70A300]/10 blur-[100px]" />
          </div>

          <div className="relative w-full max-w-2xl space-y-10">
            {/* Eyebrow */}
            <div className="inline-flex items-center gap-3">
              <div className="h-px w-8 bg-gold" />
              <span className="font-poppins text-xs font-semibold uppercase tracking-[0.25em] text-primary">
                Phase Zero<sup>™</sup>
                <span className="mx-2 text-charcoal/40">·</span>
                <span className="text-charcoal/70">The Work Before the Work</span>
              </span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-poppins font-bold leading-[1.05] tracking-tight text-navy">
              It's Time to Do <br />
              Epic Sh<span className="text-raspberry font-bold">IF</span>t.
            </h1>

            <p className="font-montserrat text-lead font-medium italic tracking-wide text-[#523387]">
              Before momentum outruns alignment.
            </p>

            <p className="font-montserrat text-lead font-normal leading-relaxed text-charcoal">
              You aren't short on vision, resolve, or experience. What's harder to find is{" "}
              <span className="font-semibold text-primary">clarity</span>, the kind that comes before strategy hardens, before announcements activate, and before resources commit to what comes next. Painted Porch exists in the space before acceleration compounds complexity.
            </p>

            <div className="flex flex-wrap gap-5 pt-2">
              <Link
                to="/blue-door"
                className="group inline-flex items-center gap-2 rounded-sm border-2 border-bluedoor bg-bluedoor px-8 py-4 font-poppins font-semibold text-white transition-all duration-300 hover:bg-white hover:text-bluedoor focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2"
              >
                Open the Blue Door
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                to="/start-here"
                className="inline-flex items-center gap-2 rounded-sm border-2 border-navy/30 bg-transparent px-8 py-4 font-poppins font-semibold text-navy transition-all duration-300 hover:border-navy hover:bg-navy/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2"
              >
                Discover Your P.A.T.H.way
                <ArrowRight className="h-4 w-4 opacity-70" />
              </Link>
            </div>
          </div>
        </div>

        {/* Right vibrant teal painted-porch panel */}
        <div className="relative hidden lg:col-span-4 lg:block">
          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(160deg, #007697 0%, #005f7a 60%, #523387 100%)",
            }}
          />
          {/* Painted brushstrokes */}
          <div aria-hidden className="absolute inset-0">
            <div className="absolute -top-20 -right-20 h-[400px] w-[400px] rounded-full bg-gold/25 blur-[100px]" />
            <div className="absolute bottom-0 left-0 h-[300px] w-[300px] rounded-full bg-[#70A300]/20 blur-[100px]" />
            <div className="absolute top-1/3 left-1/4 h-[200px] w-[200px] rounded-full bg-raspberry/15 blur-[80px]" />
          </div>
          {/* Concentric porch rings */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div
              className="absolute h-48 w-48 rounded-full border-2 border-gold/40"
              style={{ animation: "pulse 8s ease-in-out infinite" }}
            />
            <div
              className="absolute h-72 w-72 rounded-full border border-gold/25"
              style={{ animation: "pulse 12s ease-in-out infinite" }}
            />
            <div
              className="absolute h-96 w-96 rounded-full border border-gold/15"
              style={{ animation: "pulse 16s ease-in-out infinite" }}
            />
            <div className="relative h-3 w-3 rounded-full bg-gold shadow-[0_0_24px_rgba(232,162,49,0.8)]" />
          </div>
        </div>
      </div>
    </section>
  );
}
