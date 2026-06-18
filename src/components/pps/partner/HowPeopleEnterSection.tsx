import { Link } from "react-router-dom";
import { TrendingUp } from "lucide-react";

export function HowPeopleEnterSection() {
  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="container max-w-7xl mx-auto px-6">
        <div className="text-center mb-12 max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-navy mb-4">
            Every Journey Begins with "What <span className="text-raspberry">IF</span>?"
          </h2>
        </div>

        <div className="max-w-3xl mx-auto text-center mb-12 space-y-6">
          <p className="text-lg text-foreground leading-relaxed">
            Sometimes it begins with a keynote, podcast, article, assessment, or course.
          </p>
          <p className="text-lg text-foreground leading-relaxed">
            Sometimes it begins with a leadership challenge that's difficult to solve alone.
          </p>
          <p className="text-lg text-foreground leading-relaxed">
            Sometimes it begins with a realization that the future you're trying to create will require something different from the people, systems, and structures you have today.
          </p>
          <p className="text-lg text-foreground leading-relaxed">
            No two journeys look exactly alike.
          </p>
          <p className="text-lg text-foreground leading-relaxed font-bold">
            What matters is finding the right place to begin asking "What <span className="text-raspberry">IF</span>".
          </p>
        </div>

        {/* Progression, Not Prescription callout */}
        <div className="bg-gradient-to-r from-primary/5 to-gold/10 border border-primary/20 p-8 md:p-10 rounded-xl text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl md:text-2xl font-poppins font-bold text-navy">
              Progression, Not Prescription
            </h3>
          </div>
          <p className="text-primary font-medium mb-4">
            Your journey through the Porch doesn't need to follow a predetermined sequence.
          </p>
          <p className="text-foreground leading-relaxed max-w-2xl mx-auto mb-4">
            You may begin with a course, an assessment, a workshop, a strategic conversation, or a long-term partnership.
            <br /><br />
            The right path is determined by your goals, your context, and what you're ready to explore next.
          </p>

          <p className="text-navy font-medium italic">
            Your starting point is yours to choose.&nbsp;What you do with it is yours to own.
          </p>
        </div>
      </div>
    </section>
  );
}
