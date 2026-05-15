import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

/**
 * Hero Preview V3 — "Stoic Concentric"
 * Off-center radial dusk, gold hairline + dot eyebrow rule, large display headline,
 * concentric gold-rim porch motif on right column hinting at the painted porch.
 */
export default function HeroPreviewV3() {
  return (
    <section className="relative flex min-h-[90vh] w-full items-center justify-center overflow-hidden bg-[#000033] p-6 md:p-12">
      {/* Background atmosphere */}
      <div aria-hidden className="absolute inset-0 z-0">
        <div
          className="absolute inset-0 opacity-80"
          style={{
            background:
              "radial-gradient(at 20% 30%, #00006B 0%, #000044 50%, #000022 100%)",
          }}
        />
        <div className="absolute -mr-48 -mt-48 right-0 top-0 h-[600px] w-[600px] rounded-full bg-gold opacity-[0.04] blur-[120px]" />
      </div>

      <div className="relative z-10 w-full max-w-6xl">
        <div className="grid items-center gap-12 lg:grid-cols-12">
          <div className="space-y-10 lg:col-span-8">
            <div className="space-y-6">
              {/* Eyebrow with hairline */}
              <div className="inline-flex items-center gap-3">
                <div className="h-px w-8 bg-gold" />
                <span className="font-poppins text-xs font-semibold uppercase tracking-[0.25em] text-gold">
                  Phase Zero<sup>™</sup>
                  <span className="mx-2 opacity-50">·</span>
                  The Work Before the Work
                </span>
              </div>

              {/* Headline */}
              <h1 className="font-poppins text-5xl font-bold leading-[1.05] tracking-tight text-white md:text-7xl lg:text-8xl">
                It's Time to Do <br />
                Epic Sh<span className="text-raspberry">IF</span>t.
              </h1>

              <p className="font-montserrat text-xl font-normal italic tracking-wide text-gold md:text-2xl">
                Before momentum outruns alignment.
              </p>
            </div>

            <div className="max-w-2xl">
              <p className="font-montserrat text-lg font-light leading-relaxed text-blue-100/80">
                You aren't short on vision, resolve, or experience. What's harder to find is{" "}
                <span className="font-medium italic text-white">clarity</span>, the kind that comes before strategy hardens, before announcements activate, and before resources commit to what comes next. Painted Porch exists in the space before acceleration compounds complexity.
              </p>
            </div>

            <div className="flex flex-wrap gap-5 pt-4">
              <Link
                to="/blue-door"
                className="group inline-flex items-center gap-2 rounded-sm border-2 border-bluedoor bg-bluedoor px-8 py-4 font-poppins font-semibold text-white transition-all duration-300 hover:bg-white hover:text-bluedoor focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-navy"
              >
                Open the Blue Door
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                to="/start-here"
                className="inline-flex items-center gap-2 rounded-sm border-2 border-white/30 bg-transparent px-8 py-4 font-poppins font-semibold text-white transition-all duration-300 hover:border-white/60 hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-navy"
              >
                Discover Your P.A.T.H.way
                <ArrowRight className="h-4 w-4 opacity-70" />
              </Link>
            </div>
          </div>

          {/* Right concentric porch motif */}
          <div className="relative hidden h-full lg:col-span-4 lg:block">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-64 w-px bg-gradient-to-b from-transparent via-gold/30 to-transparent" />
              <div
                className="absolute h-64 w-64 rounded-full border border-gold/15"
                style={{ animation: "pulse 8s ease-in-out infinite" }}
              />
              <div
                className="absolute h-96 w-96 rounded-full border border-gold/10"
                style={{ animation: "pulse 12s ease-in-out infinite" }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
