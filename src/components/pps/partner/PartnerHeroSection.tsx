import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import LazyHeroVideo from "@/components/pps/LazyHeroVideo";
import { useParallax } from "@/hooks/useParallax";
import colorfulPath from "@/assets/colorful-path.jpg";

export function PartnerHeroSection() {
  const [isLoaded, setIsLoaded] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setIsLoaded(true), 80);
    return () => clearTimeout(t);
  }, []);
  const { ref: sectionRef, parallaxOffset } = useParallax<HTMLElement>({
    mode: "scroll",
    speed: 0.25,
  });

  return (
    <section ref={sectionRef} className="relative isolate min-h-[60vh] flex items-center overflow-hidden">
      {/* Admin-managed hero video with instant poster fallback (parallax wrapper) */}
      <div
        className="absolute inset-0 will-change-transform"
        style={{ transform: `translateY(${parallaxOffset}px) scale(1.08)` }}
      >
        <LazyHeroVideo
          slotKey="partner-hub-hero"
          posterUrl={colorfulPath}
          className="absolute inset-0 w-full h-full"
        />
      </div>

      {/* Overlay */}
      <div className="absolute inset-0 bg-navy/30" />

      <div className="container max-w-7xl mx-auto px-6 relative z-10 py-16 md:py-24">
        <div className="md:w-4/5">
          <div className="bg-black/65 backdrop-blur-sm p-8 md:p-12 rounded-xl">
            {/* Badge */}
            <span
              className={`inline-block bg-primary/90 text-white font-poppins font-semibold text-sm px-4 py-1.5 rounded-full mb-6 transition-all duration-700 ease-out ${
                isLoaded ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"
              }`}
            >
              Join Us on the Porch
            </span>

            {/* Headline */}
            <h1
              className={`text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight transition-all duration-700 ease-out delay-150 ${
                isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              }`}
            >
              Your P.A.T.H.way to&nbsp;<br />
              <span className="text-primary">Extraordinary Sh<span className="text-raspberry font-bold">IF</span>t.</span>
            </h1>

            {/* Description */}
            <div
              className={`text-lg md:text-xl text-white/90 leading-relaxed mb-8 max-w-3xl transition-all duration-700 ease-out delay-300 ${
                isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              }`}
            >
              <p className="mb-4">
                Every leader, team, and organization stands at a different point on their journey to what's next.
              </p>
              <p className="mb-4">
                Some are exploring change for themselves.<br />
                Some are aligning a team around what matters most.<br />
                Some are building the capacity to lead transformation across an entire organization.
              </p>
              <p className="mb-4">
                Our P.A.T.H.ways help you identify the right starting point.
              </p>
              <p className="text-white/80 italic text-base">
                Your next step isn't determined by your title. It's determined by where you are and what you're ready to lead.
              </p>
            </div>

            {/* CTAs */}
            <div
              className={`flex flex-col sm:flex-row gap-4 max-w-full transition-all duration-700 ease-out delay-500 ${
                isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              }`}
            >
              <Button asChild className="bg-primary border-2 border-primary text-white hover:bg-white hover:text-primary text-base sm:text-lg py-4 sm:py-6 px-4 sm:px-8 transition-colors w-full max-w-[20rem] sm:w-auto sm:max-w-full whitespace-normal h-auto leading-tight text-center">
                <Link to="/start-here">Discover Your P.A.T.H.way</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
