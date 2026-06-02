import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useParallax } from "@/hooks/useParallax";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import compassDirection from "@/assets/compass-direction-cta.jpg";

export default function FinalCTASectionAlt() {
  const { ref: contentRef, isVisible } = useScrollAnimation<HTMLDivElement>({ threshold: 0.3 });
  const { ref: sectionRef, parallaxOffset } = useParallax<HTMLElement>({ mode: "viewport", range: 80, offset: 40 });

  return (
    <section ref={sectionRef} className="relative py-20 md:py-28 overflow-hidden">
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat will-change-transform"
        style={{ 
          backgroundImage: `url(${compassDirection})`,
          transform: `translateY(${parallaxOffset}px) scale(1.15)`,
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-navy/65 via-navy/55 to-navy/65" />
      </div>
      
      <div ref={contentRef} className="container max-w-5xl mx-auto px-6 text-center relative z-10">
        <span 
          className={`inline-block bg-gold/90 text-navy font-poppins font-semibold text-sm px-4 py-1.5 rounded-full mb-6 transition-all duration-700 ease-out ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
          }`}
        >
          Your Strategic Clarity Moment Awaits
        </span>
        
        <h2 
          className={`text-3xl md:text-4xl font-bold text-white mb-8 max-w-[700px] mx-auto transition-all duration-700 ease-out delay-150 ${ isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6' }`}
        >
          The sh<span className="text-raspberry">IF</span>t you're considering might be exactly right. Now find out if your organization is built to make it happen.
        </h2>
        
        <div
          className={`transition-all duration-700 ease-out delay-300 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
        >
          <Link to="/blue-door/purchase">
            <Button className="bg-bluedoor text-white border-2 border-bluedoor text-lg md:text-xl py-5 px-12 shadow-lg hover:shadow-xl hover:bg-white hover:text-bluedoor transition-all font-semibold">
              Open your Blue Door →
            </Button>
          </Link>
        </div>
        
        <p 
          className={`text-white/80 mt-8 transition-all duration-700 ease-out delay-500 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
        >
          Questions?{" "}
          <a 
            href="/contact?scope=organization&interest=blue-door&message=I have questions about The Blue Door Organizational Appraisal." 
            className="text-gold underline hover:text-lime transition-colors"
          >
            Contact Us
          </a>
        </p>
      </div>
    </section>
  );
}
