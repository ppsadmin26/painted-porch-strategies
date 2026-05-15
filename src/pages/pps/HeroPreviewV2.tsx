import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

/**
 * Hero Preview V2 — "Cinematic Stoic Dusk"
 * Inset rounded canvas, radial cobalt-to-navy dusk gradient with bottom shadow,
 * single-column architecture, gold pill button, glassy outline secondary.
 */
export default function HeroPreviewV2() {
  return (
    <section className="flex min-h-[90vh] w-full items-center justify-center bg-[#00002A] p-6 font-montserrat lg:p-12">
      <div className="relative w-full max-w-6xl overflow-hidden rounded-3xl">
        {/* Atmospheric dusk gradient */}
        <div
          aria-hidden
          className="absolute inset-0 opacity-50"
          style={{
            background:
              "radial-gradient(circle at top right, #0047AB 0%, #00006B 40%, #00002A 100%)",
          }}
        />
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, transparent 50%, rgba(0,0,0,0.6) 100%)",
          }}
        />

        <div className="relative z-10 flex flex-col items-start px-8 py-20 lg:px-20 lg:py-32">
          {/* Eyebrow */}
          <div className="mb-8 flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 backdrop-blur-md">
            <span className="font-poppins text-[10px] font-semibold uppercase tracking-[0.2em] text-gold">
              Phase Zero<sup>™</sup>
              <span className="mx-2 text-xs font-light text-white/30">|</span>
              The Work Before the Work
            </span>
          </div>

          {/* Headline */}
          <div className="max-w-4xl">
            <h1 className="font-poppins text-5xl font-bold leading-[0.95] tracking-tighter text-white md:text-7xl lg:text-8xl">
              It's Time to Do <br />
              Epic Sh<span className="text-raspberry">IF</span>t.
            </h1>
            <p className="mt-6 font-montserrat text-xl font-normal italic tracking-wide text-gold opacity-90 md:text-2xl">
              Before momentum outruns alignment.
            </p>
          </div>

          {/* Body */}
          <div className="mt-10 max-w-2xl">
            <p className="font-montserrat text-lg font-light leading-relaxed text-slate-300 md:text-xl">
              You aren't short on vision, resolve, or experience. What's harder to find is{" "}
              <span className="font-normal text-white">clarity</span>, the kind that comes before strategy hardens, before announcements activate, and before resources commit to what comes next. Painted Porch exists in the space before acceleration compounds complexity.
            </p>
          </div>

          {/* CTAs */}
          <div className="mt-12 flex w-full flex-col items-stretch gap-5 sm:w-auto sm:flex-row sm:items-center">
            <Link
              to="/blue-door"
              className="group flex items-center justify-center gap-3 rounded-sm border-2 border-bluedoor bg-bluedoor px-8 py-4 font-poppins text-sm font-bold uppercase tracking-widest text-white shadow-2xl transition-all hover:bg-white hover:text-bluedoor focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-navy"
            >
              Open the Blue Door
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              to="/start-here"
              className="flex items-center justify-center gap-3 rounded-sm border border-white/20 bg-white/5 px-8 py-4 font-poppins text-sm font-bold uppercase tracking-widest text-white backdrop-blur-sm transition-all hover:border-white/40 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-navy"
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
