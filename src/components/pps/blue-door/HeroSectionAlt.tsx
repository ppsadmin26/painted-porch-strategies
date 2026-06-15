import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { isBlueDoorPreLaunch } from "@/config/blueDoor";
import blueDoorHero from "@/assets/blue-door-hero.jpg";

export default function HeroSectionAlt() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden pb-12 md:pb-20">
      <div 
        className="absolute inset-0 bg-cover bg-no-repeat" 
        style={{
          backgroundImage: `url(${blueDoorHero})`,
          backgroundPosition: '0% center',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-navy/85 via-navy/70 to-transparent" />
      </div>
      
      <div className="container max-w-7xl mx-auto px-6 relative z-10">
        <div className="max-w-3xl">
          <div className="bg-navy/30 backdrop-blur-sm p-8 md:p-10 rounded-lg">
            <span className={`inline-block bg-gold/90 text-navy font-poppins font-semibold text-sm px-4 py-1.5 rounded-full mb-6 transition-all duration-700 ease-out ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
              Phase Zero Organizational Appraisal
            </span>
            
            <h1 className={`text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-normal transition-all duration-700 ease-out delay-150 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
              Is Your Organization Built to Make Your Next Sh<span className="text-raspberry font-bold">IF</span>t Happen?
            </h1>
            
            <p className={`font-poppins font-normal text-lg md:text-xl text-gold mb-8 transition-all duration-700 ease-out delay-300 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
              Before you commit direction, resources, and credibility, the Blue Door surfaces what your organization can carry so you can lead with clarity and build with confidence.
            </p>
            
            <div className={`transition-all duration-700 ease-out delay-500 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
              <Link to="/blue-door/purchase">
                <Button className="bg-bluedoor text-white border-2 border-bluedoor text-base sm:text-lg md:text-xl py-4 sm:py-5 px-6 sm:px-12 shadow-lg hover:shadow-xl hover:bg-white hover:text-bluedoor transition-all max-w-full whitespace-normal h-auto">
                  {isBlueDoorPreLaunch() ? "Reserve your Blue Door →" : "Open your Blue Door →"}
                </Button>
              </Link>
              {isBlueDoorPreLaunch() && (
                <p className="mt-4 text-sm md:text-base text-white/90 font-poppins">
                  <span className="inline-block bg-gold/90 text-navy font-semibold px-2 py-0.5 rounded mr-2">Launching June 29th</span>
                  Purchase now and we'll email your assessment access link on launch day.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
