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
        <p className="text-body font-poppins font-medium text-white text-[18px] lg:text-[20px]">
          Most organizational sh<span className="text-raspberry font-bold">IF</span>t doesn't fail because leaders chose the wrong direction. It fails because they discover too late that their organization wasn't built for what the direction required.
        </p>
      </div>
    </section>
  );
}
