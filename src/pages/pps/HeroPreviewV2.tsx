import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

/**
 * Hero Preview V2, "Painted Porch Sunrise"
 * Inset rounded canvas with warm cream → gold → soft teal gradient,
 * navy display headline, purple italic subline, raspberry IF.
 */
export default function HeroPreviewV2() {
  return (
    <section className="flex min-h-[90vh] w-full items-center justify-center bg-[#FAF5EA] p-6 font-montserrat lg:p-12">
      <div className="relative w-full max-w-6xl overflow-hidden rounded-3xl border border-gold/30 shadow-[0_30px_80px_-30px_rgba(0,0,107,0.25)]">
        {/* Sunrise gradient */}
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(135deg, #FFF8E7 0%, #FBE9C3 35%, #DDF1F0 75%, #C7E6E3 100%)",
          }}
        />
        {/* Painted glow accents */}
        <div aria-hidden className="absolute -top-32 -right-24 h-[500px] w-[500px] rounded-full bg-[#70A300]/15 blur-[120px]" />
        <div aria-hidden className="absolute -bottom-24 -left-24 h-[500px] w-[500px] rounded-full bg-[#523387]/15 blur-[120px]" />
        <div aria-hidden className="absolute top-1/3 right-1/4 h-[300px] w-[300px] rounded-full bg-primary/10 blur-[100px]" />

        <div className="relative z-10 flex flex-col items-start px-8 py-20 lg:px-20 lg:py-32">
          {/* Eyebrow */}
          <div className="mb-8 flex items-center gap-2 rounded-full border border-navy/15 bg-white/70 px-4 py-1.5 backdrop-blur-md">
            <span className="font-poppins text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">
              Phase Zero<sup>™</sup>
              <span className="mx-2 text-xs font-light text-navy/30">|</span>
              <span className="text-charcoal/70">The Work Before the Work</span>
            </span>
          </div>

          {/* Headline */}
          <div className="max-w-4xl">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-poppins font-bold leading-[0.95] tracking-tighter text-navy">
              It's Time to Do <br />
              Epic Sh<span className="text-raspberry font-bold">IF</span>t.
            </h1>
            <p className="mt-6 font-montserrat text-xl font-medium italic tracking-wide text-[#523387] md:text-2xl">
              Before momentum outruns alignment.
            </p>
          </div>

          {/* Body */}
          <div className="mt-10 max-w-2xl">
            <p className="font-montserrat text-lg font-normal leading-relaxed text-charcoal md:text-xl">
              You aren't short on vision, resolve, or experience. What's harder to find is{" "}
              <span className="font-semibold text-primary">clarity</span>, the kind that comes before strategy hardens, before announcements activate, and before resources commit to what comes next. Painted Porch exists in the space before acceleration compounds complexity.
            </p>
          </div>

          {/* CTAs */}
          <div className="mt-12 flex w-full flex-col items-stretch gap-5 sm:w-auto sm:flex-row sm:items-center">
            <Link
              to="/blue-door"
              className="group flex items-center justify-center gap-3 rounded-sm border-2 border-bluedoor bg-bluedoor px-8 py-4 font-poppins text-sm font-bold uppercase tracking-widest text-white shadow-xl transition-all hover:bg-white hover:text-bluedoor focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2"
            >
              Open the Blue Door
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              to="/start-here"
              className="flex items-center justify-center gap-3 rounded-sm border-2 border-navy/30 bg-white/40 px-8 py-4 font-poppins text-sm font-bold uppercase tracking-widest text-navy backdrop-blur-sm transition-all hover:border-navy hover:bg-white/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2"
            >
              Discover Your P.A.T.H.way
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
