import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { useParallax } from "@/hooks/useParallax";
import blueDoorHero from "@/assets/blue-door-hero.jpg";

export default function HeroSectionAlt() {
  const [isLoaded, setIsLoaded] = useState(false);
  const {
    ref: sectionRef,
    parallaxOffset
  } = useParallax<HTMLElement>({
    mode: "scroll",
    speed: 0.4
  });

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section ref={sectionRef} className="relative min-h-[90vh] flex items-center overflow-hidden pb-12 md:pb-20">
      <div 
        className="absolute inset-0 bg-cover bg-no-repeat will-change-transform" 
        style={{
          backgroundImage: `url(${blueDoorHero})`,
          backgroundPosition: '0% center',
          transform: `translateY(${parallaxOffset}px) scale(1.1)`
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-navy/85 via-navy/70 to-transparent" />
      </div>
      
      <div className="container max-w-5xl mx-auto px-6 relative z-10">
        <div className="max-w-3xl">
          <div className="bg-navy/30 backdrop-blur-sm p-8 md:p-10 rounded-lg">
            <span className={`inline-block bg-gold/90 text-navy font-poppins font-semibold text-sm px-4 py-1.5 rounded-full mb-6 transition-all duration-700 ease-out ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
              Phase Zero™ Strategic Appraisal
            </span>
            
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-6 leading-normal">
              What Epic Sh<span className="text-raspberry">IF</span>t Could Your Organization Explore Next — and Are You Built to Lead It?
            </h1>
            
            <p className={`font-poppins font-semibold text-lg md:text-xl text-gold mb-6 transition-all duration-700 ease-out delay-300 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
              Before committing direction, resources, energy, or credibility to your next big operational sh<span className="text-raspberry">IF</span>t, know what your organization can actually make happen.
            </p>
            
            <p className={`text-base md:text-lg text-white/90 leading-relaxed mb-8 max-w-xl transition-all duration-700 ease-out delay-500 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
              The Blue Door is for leaders on the edge of transformation—who want clarity and confidence before decisions get made and momentum takes over.
            </p>
            
            <div className={`transition-all duration-700 ease-out delay-700 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
              <Link to="/blue-door/purchase">
                <Button className="bg-bluedoor text-white border-2 border-bluedoor text-lg md:text-xl py-5 px-12 shadow-lg hover:shadow-xl hover:bg-white hover:text-bluedoor transition-all">
                  Open The Blue Door →
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
