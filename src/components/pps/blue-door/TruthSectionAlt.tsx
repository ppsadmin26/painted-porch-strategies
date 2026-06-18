import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import CostCalculatorDialog from "./CostCalculatorDialog";

export default function TruthSectionAlt() {
  const { ref, isVisible } = useScrollAnimation<HTMLDivElement>({ threshold: 0.2 });

  return (
    <section className="py-12 md:py-20 bg-white">
      <div className="container max-w-4xl mx-auto px-6">
        <div
          ref={ref}
          className={`text-center transition-all duration-700 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-navy mb-6">
            The Truth of Why Most Sh<span className="text-raspberry font-bold">IF</span>t Fails
          </h2>
          <p className="text-lead text-foreground mb-6">
            Most organizational changes don't fail because the pursuit was wrong. They fail because leaders discovered too late, often after 6+ months and $500K+ invested, that their organization wasn't structurally ready for the shift they were pursuing.
          </p>
          <p className="text-lead text-foreground mb-6">
            The <span className="font-bold text-bluedoor">Blue Door</span> surfaces that reality early, while you're still exploring and before direction gets locked in.
          </p>
          <p className="text-lead text-foreground mb-6">
            In less than 30 minutes, you'll learn what might otherwise take months to figure out: whether your organization can actually lead the shift you're considering, or where some groundwork would set you up for real success.
          </p>
          <div className="bg-raspberry/10 border-l-4 border-raspberry p-6 md:p-8 rounded-xl shadow-sm mb-6">
            <p className="font-bold text-raspberry text-center">
              Less than 30 minutes now could save months of effort and hundreds of thousands pursuing a shift you're not yet structured to lead.
            </p>
            <div className="flex justify-center mt-4">
              <CostCalculatorDialog />
            </div>
          </div>
          <p className="text-lead text-foreground mb-4">
            If you're standing at the edge of something new and want to understand what shift your organization can truly lead next, before you try to make it happen:
          </p>
          <p className="font-poppins font-bold text-pullquote text-bluedoor mb-6">
            This is where your next P.A.T.H. to Do Epic Sh<span className="text-raspberry font-bold">IF</span>t begins.
          </p>
          <Link to="/blue-door/purchase">
            <Button className="bg-bluedoor text-white border-2 border-bluedoor text-lg md:text-xl py-5 px-12 shadow-lg hover:shadow-xl hover:bg-white hover:text-bluedoor transition-all">
              Open the Blue Door →
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
