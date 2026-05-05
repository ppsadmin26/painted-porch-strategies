import { useScrollAnimation } from "@/hooks/useScrollAnimation";

export default function CostOfGapSection() {
  const { ref, isVisible } = useScrollAnimation<HTMLDivElement>({ threshold: 0.3 });

  return (
    <section className="py-16 md:py-20 bg-gradient-to-b from-navy to-navy/95">
      <div 
        ref={ref}
        className={`container max-w-5xl mx-auto px-6 text-center transition-all duration-700 ease-out ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
        }`}
      >
        <p className="font-poppins font-medium text-lg md:text-xl text-white leading-relaxed">
          Most organizational shift doesn't fail because leaders chased the wrong thing. It fails because they learned too late that their organization wasn't built to carry it.
        </p>
      </div>
    </section>
  );
}
