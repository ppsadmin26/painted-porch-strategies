import { Check, ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { BLUE_DOOR_PRICE_DISPLAY } from "@/config/blueDoor";

export default function ValueEscalationSectionAlt() {
  const imagineRef = useRef<HTMLDivElement>(null);
  const decideRef = useRef<HTMLDivElement>(null);
  const buildRef = useRef<HTMLDivElement>(null);
  const [imagineVisible, setImagineVisible] = useState(false);
  const [decideVisible, setDecideVisible] = useState(false);
  const [buildVisible, setBuildVisible] = useState(false);

  useEffect(() => {
    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          if (entry.target === imagineRef.current) setImagineVisible(true);
          if (entry.target === decideRef.current) setDecideVisible(true);
          if (entry.target === buildRef.current) setBuildVisible(true);
        }
      });
    };
    const observer = new IntersectionObserver(observerCallback, { threshold: 0.2 });
    if (imagineRef.current) observer.observe(imagineRef.current);
    if (decideRef.current) observer.observe(decideRef.current);
    if (buildRef.current) observer.observe(buildRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section className="py-12 md:py-20 bg-white">
      <div className="container max-w-6xl mx-auto px-6">
        <h2 className="text-3xl md:text-4xl font-bold text-navy text-center mb-6">
          The Architecture of Strategic Clarity
        </h2>
        
        <p className="font-poppins font-semibold text-lg md:text-xl text-strategic text-center mb-6">
          How Value Escalates Through Your Transformation Journey
        </p>
        
        <p className="text-base md:text-lg text-foreground text-center max-w-3xl mx-auto mb-12">
          Strategic sh<span className="font-bold text-bluedoor">IF</span>t doesn't happen in a single conversation. It unfolds through increasing clarity:
        </p>
        
        <div 
          ref={imagineRef} 
          className={`bg-bluedoor/5 border-l-4 border-bluedoor p-6 md:p-8 rounded-r-lg mb-8 transition-all duration-700 ease-out ${imagineVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
        >
          <span className="inline-block bg-bluedoor text-white font-poppins font-bold text-sm px-4 py-1 rounded-full uppercase tracking-wider mb-3">
            IMAGINE
          </span>
          <p className="font-poppins font-bold text-2xl md:text-3xl text-bluedoor mb-2">
            The Blue Door
          </p>
          <p className="font-poppins font-bold text-2xl text-bluedoor mb-4">{BLUE_DOOR_PRICE_DISPLAY}</p>
          <p className="font-poppins font-semibold italic text-lg text-navy mb-4">
            "What sh<span className="font-bold text-bluedoor">IF</span>ts could we imagine and make happen next?"
          </p>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <p className="text-foreground text-base leading-relaxed mb-4">
                Strategic reality through evidence-based assessment. The diagnostic reveals 3-4 shifts you're positioned to imagine and lead, assessing your organizational capability across The Painted Porch Pillars.
              </p>
              <p className="font-bold text-bluedoor text-base">
                This is awareness, you now know what's possible.
              </p>
            </div>
            <div>
              <p className="font-poppins font-semibold text-bluedoor text-sm mb-2">Deliverables:</p>
              <ul className="space-y-1.5 text-sm text-foreground">
                {["Strategic appraisal in less than 30 minutes", "Executive P.A.T.H.way within 72 business hours", "3-4 viable shifts identified", "Structural capability appraisal", "Prerequisites for each potential path"].map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-bluedoor flex-shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <div 
            ref={decideRef} 
            className={`bg-strategic/5 border-l-4 border-strategic p-6 rounded-r-lg transition-all duration-700 ease-out delay-150 ${decideVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
          >
            <span className="inline-block bg-strategic text-white font-poppins font-bold text-sm px-4 py-1 rounded-full uppercase tracking-wider mb-2">
              DECIDE
            </span>
            <p className="font-poppins font-bold text-2xl md:text-3xl text-strategic mb-2">
              Architect Change Design Session
            </p>
            <p className="font-poppins font-bold text-2xl text-strategic mb-4">Starting at $36,000</p>
            <p className="font-poppins font-semibold italic text-lg text-navy mb-4">
              "Which sh<span className="font-bold text-bluedoor">IF</span>t will we design, and are we aligned enough to support it?"
            </p>
            <p className="text-foreground text-sm leading-relaxed mb-4">
              The workshop converts imagination into architectural design for your next organizational shift. One path is chosen, leadership aligns, and structural prerequisites are surfaced before building begins.
            </p>
            <p className="font-bold text-strategic text-base mb-4">
              This is commitment, you've decided what to build.
            </p>
            <p className="font-poppins font-semibold text-strategic text-sm mb-2">Investment Options:</p>
            <ul className="space-y-1.5 text-sm text-foreground">
              {["Full-day session: $36,000*", "2+ day intensive: $69,000*"].map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-strategic flex-shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <p className="italic text-xs text-foreground/70 mt-2">*Includes all travel-related expenses</p>
          </div>
          
          <div 
            ref={buildRef} 
            className={`bg-gold/5 border-l-4 border-gold p-6 rounded-r-lg transition-all duration-700 ease-out delay-300 ${buildVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
          >
            <span className="inline-block bg-gold text-white font-poppins font-bold text-sm px-4 py-1 rounded-full uppercase tracking-wider mb-2">
              BUILD
            </span>
            <p className="font-poppins font-bold text-2xl md:text-3xl text-gold mb-2">
              P.A.T.H.ways Partnership
            </p>
            <p className="font-poppins font-bold text-2xl text-gold mb-4">Investment varies by tier</p>
            <p className="font-poppins font-semibold italic text-lg text-navy mb-4">
              "How will we build this, what must change internally for this to succeed?"
            </p>
            <p className="text-foreground text-sm leading-relaxed mb-4">
              Partnership ensures what you've architected is executed. Capability development, strategic advisory, strategies for sustained, continuous success.
            </p>
            <p className="font-bold text-gold text-base mb-4">
              This is making shIFt happen, what was decided is delivered.
            </p>
            <p className="font-poppins font-semibold text-gold text-base mb-3">Three Engagement P.A.T.H.ways:</p>
            <div className="space-y-3 text-base">
              <div>
                <p className="font-bold text-foreground text-sm">🔥 <span className="text-gold">IGNITE</span> - Light the spark. Prove it works.</p>
                <p className="text-foreground text-xs mt-0.5">Self-led tools, frameworks, masterclasses.</p>
              </div>
              <div>
                <p className="font-bold text-foreground text-sm">🚀 <span className="text-strategic">AMPLIFY</span> - Boost momentum that compounds.</p>
                <p className="text-foreground text-xs mt-0.5">Workshops, team sprints, strategic cohorts.</p>
              </div>
              <div>
                <p className="font-bold text-foreground text-sm">🏛️ <span className="text-navy">EMBODY</span> - Build transformation that lasts.</p>
                <p className="text-foreground text-xs mt-0.5">6-12+ month embedded partnership.</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="text-center mt-12 mb-12 md:mb-20">
          <Link to="/blue-door/purchase">
            <Button className="bg-bluedoor text-white border-2 border-bluedoor text-lg md:text-xl py-5 px-12 shadow-lg hover:shadow-xl hover:bg-white hover:text-bluedoor transition-all">
              Open the Blue Door →
            </Button>
          </Link>
        </div>
        
        <div className="bg-navy/5 p-8 rounded-lg text-center">
          <h3 className="text-xl md:text-2xl font-poppins font-bold text-navy mb-4">
            The Progression:
          </h3>
          <div className="text-base md:text-lg text-foreground leading-relaxed mb-4 flex flex-col items-center gap-2">
            <span>The Blue Door reveals what you could <strong>imagine</strong> and lead next.</span>
            <ArrowDown className="w-6 h-6 text-bluedoor" />
            <span>The Architect Change strategic workshop determines what you will <strong>design</strong>.</span>
            <ArrowDown className="w-6 h-6 text-bluedoor" />
            <span>Only after this Phase Zero does the work to <strong>build</strong> and implement begin.</span>
          </div>
          <p className="italic text-navy mt-6">
            Each stage creates the conditions for the next. Diagnosis creates <span className="underline">clarity</span>. Clarity creates <span className="underline">commitment</span>. Commitment makes <span className="underline">execution</span> inevitable, not managed.
          </p>
        </div>
      </div>
    </section>
  );
}
