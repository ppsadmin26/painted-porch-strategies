import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

/**
 * Hero Preview V1 — "Editorial Asymmetric"
 * Deep navy field with cobalt + teal atmospheric blooms, gold hairline accents,
 * 8/4 asymmetric grid, oversized Poppins display, vertical gold rule on right.
 */
export default function HeroPreviewV1() {
  return (
    <section className="relative min-h-[90vh] w-full flex items-center justify-center overflow-hidden bg-[#000033] px-6 py-20 lg:py-28">
      {/* Atmospheric blooms */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/4 -right-1/4 h-[800px] w-[800px] rounded-full bg-bluedoor opacity-10 blur-[120px]" />
        <div className="absolute -bottom-1/4 -left-1/4 h-[600px] w-[600px] rounded-full bg-primary opacity-[0.06] blur-[100px]" />
      </div>

      <div className="relative z-10 grid w-full max-w-6xl grid-cols-1 items-center gap-12 lg:grid-cols-12">
        <div className="lg:col-span-9">
          {/* Eyebrow */}
          <div className="mb-10 inline-flex items-center space-x-2 rounded-full border border-gold/30 bg-navy/40 px-3 py-1 backdrop-blur-sm">
            <span className="font-poppins text-[10px] font-bold uppercase tracking-[0.2em] text-gold">
              Phase Zero<sup>™</sup>
            </span>
            <span className="h-1 w-1 rounded-full bg-gold/40" />
            <span className="font-montserrat text-[10px] uppercase tracking-wider text-white/60">
              The Work Before the Work
            </span>
          </div>

          {/* Headline */}
          <h1 className="mb-6 font-poppins text-6xl font-extrabold leading-[0.9] tracking-tight text-white md:text-8xl">
            It's Time to <br />
            Do Epic Sh<span className="text-raspberry">IF</span>t.
          </h1>

          {/* Subline */}
          <p className="mb-8 font-montserrat text-xl font-light italic text-gold md:text-2xl">
            Before momentum outruns alignment.
          </p>

          {/* Body */}
          <p className="mb-12 max-w-2xl font-montserrat text-lg leading-relaxed text-white/70 md:text-xl">
            You aren't short on vision, resolve, or experience. What's harder to find is clarity, the kind that comes before strategy hardens, before announcements activate, and before resources commit to what comes next. Painted Porch exists in the space before acceleration compounds complexity.
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap gap-5">
            <Link
              to="/blue-door"
              className="group inline-flex items-center rounded-sm border-2 border-bluedoor bg-bluedoor px-8 py-4 font-poppins font-semibold text-white transition-all hover:bg-white hover:text-bluedoor focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-navy"
            >
              Open the Blue Door
              <ArrowRight className="ml-3 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              to="/start-here"
              className="group inline-flex items-center rounded-sm border-2 border-white/30 bg-transparent px-8 py-4 font-poppins font-semibold text-white transition-all hover:border-white/60 hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-navy"
            >
              Discover Your P.A.T.H.way
              <ArrowRight className="ml-3 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>

        {/* Right column gold hairline */}
        <div className="relative hidden h-full lg:col-span-3 lg:block">
          <div className="absolute right-0 top-1/2 h-64 w-px -translate-y-1/2 bg-gradient-to-b from-transparent via-gold/30 to-transparent" />
        </div>
      </div>
    </section>
  );
}
