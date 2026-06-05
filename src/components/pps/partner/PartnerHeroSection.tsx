import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import LazyHeroVideo from "@/components/pps/LazyHeroVideo";
import colorfulPath from "@/assets/colorful-path.jpg";

export function PartnerHeroSection() {
  return (
    <section className="relative isolate min-h-[60vh] flex items-center overflow-hidden">
      {/* Admin-managed hero video with instant poster fallback */}
      <LazyHeroVideo
        slotKey="partner-hub-hero"
        posterUrl={colorfulPath}
        className="absolute inset-0 w-full h-full"
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-navy/30" />

      <div className="container max-w-6xl mx-auto px-6 relative z-10 py-16 md:py-24">
        <div className="md:w-4/5">
          <div className="bg-black/65 backdrop-blur-sm p-8 md:p-12 rounded-xl">
            {/* Badge */}
            <span className="inline-block bg-primary/90 text-white font-poppins font-semibold text-sm px-4 py-1.5 rounded-full mb-6">
              Join Us on the Porch
            </span>

            {/* Headline */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              Three Ways to Partner.<br />
              One Philosophy:<br />
              <span className="text-primary">You Architect Your Next Sh<span className="text-raspberry">IF</span>t.</span>
            </h1>

            {/* Description */}
            <div className="text-lg md:text-xl text-white/90 leading-relaxed mb-8 max-w-3xl">
              <p className="mb-4">
                We partner with you to co-architect transformation, whether you're exploring Phase Zero concepts on your own, aligning your team, or building permanent organizational capacity.
              </p>
              <p className="text-white/80 italic text-base">
                Your commitment level and current capacity determine your P.A.T.H.way, not your title or organization size.
              </p>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild className="bg-primary border-2 border-primary text-white hover:bg-white hover:text-primary text-lg py-6 px-8 transition-colors w-full sm:w-auto">
                  <Link to="/start-here">Discover Your P.A.T.H.way</Link>
                </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
