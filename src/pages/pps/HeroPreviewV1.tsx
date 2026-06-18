import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

/**
 * Hero Preview V1, "Painted Porch Editorial"
 * Warm cream canvas, navy headline, teal + gold + purple accents,
 * 8/4 asymmetric grid, vertical gold rule on right column.
 */
export default function HeroPreviewV1() {
  return (
    <section className="relative min-h-[90vh] w-full flex items-center justify-center overflow-hidden bg-[#FBF7EE] px-6 py-20 lg:py-28">
      {/* Soft painted blooms */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/4 -right-1/4 h-[700px] w-[700px] rounded-full bg-primary/15 blur-[120px]" />
        <div className="absolute -bottom-1/4 -left-1/4 h-[600px] w-[600px] rounded-full bg-[#523387]/10 blur-[100px]" />
        <div className="absolute top-1/3 left-1/2 h-[400px] w-[400px] rounded-full bg-gold/15 blur-[120px]" />
      </div>

      <div className="relative z-10 grid w-full max-w-7xl grid-cols-1 items-center gap-12 lg:grid-cols-12">
        <div className="lg:col-span-9">
          {/* Eyebrow */}
          <div className="mb-10 inline-flex items-center space-x-2 rounded-full border border-primary/30 bg-white/70 px-3 py-1 backdrop-blur-sm">
            <span className="font-poppins text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
              Phase Zero<sup>™</sup>
            </span>
            <span className="h-1 w-1 rounded-full bg-gold" />
            <span className="font-montserrat text-[10px] uppercase tracking-wider text-charcoal/70">
              The Work Before the Work
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl mb-6 font-poppins font-extrabold leading-[0.9] tracking-tight text-navy">
            It's Time to <br />
            Do Epic Sh<span className="text-raspberry font-bold">IF</span>t.
          </h1>

          {/* Subline */}
          <p className="mb-8 font-montserrat text-lead font-medium italic text-[#523387]">
            Before momentum outruns alignment.
          </p>

          {/* Body */}
          <p className="mb-12 max-w-2xl font-montserrat text-lead leading-relaxed text-charcoal">
            You aren't short on vision, resolve, or experience. What's harder to find is{" "}
            <span className="font-semibold text-primary">clarity</span>, the kind that comes before strategy hardens, before announcements activate, and before resources commit to what comes next. Painted Porch exists in the space before acceleration compounds complexity.
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap gap-5">
            <Link
              to="/blue-door"
              className="group inline-flex items-center rounded-sm border-2 border-bluedoor bg-bluedoor px-8 py-4 font-poppins font-semibold text-white transition-all hover:bg-white hover:text-bluedoor focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2"
            >
              Open the Blue Door
              <ArrowRight className="ml-3 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              to="/start-here"
              className="group inline-flex items-center rounded-sm border-2 border-navy/30 bg-transparent px-8 py-4 font-poppins font-semibold text-navy transition-all hover:border-navy hover:bg-navy/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2"
            >
              Discover Your P.A.T.H.way
              <ArrowRight className="ml-3 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>

        {/* Right column gold hairline + porch dot stack */}
        <div className="relative hidden h-full lg:col-span-3 lg:block">
          <div className="absolute right-0 top-1/2 h-72 w-px -translate-y-1/2 bg-gradient-to-b from-transparent via-gold to-transparent" />
          <div className="absolute right-[-4px] top-1/2 flex -translate-y-1/2 flex-col gap-6">
            <span className="h-2 w-2 rounded-full bg-primary" />
            <span className="h-2 w-2 rounded-full bg-gold" />
            <span className="h-2 w-2 rounded-full bg-[#70A300]" />
            <span className="h-2 w-2 rounded-full bg-[#523387]" />
            <span className="h-2 w-2 rounded-full bg-raspberry" />
          </div>
        </div>
      </div>
    </section>
  );
}
