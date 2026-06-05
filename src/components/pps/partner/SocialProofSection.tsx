import { Quote } from "lucide-react";
import { TIERS } from "@/config/tiers";

const testimonials = [
  {
    tier: TIERS.IGNITE,
    quote: "I thought I needed a team workshop. Turns out I needed to do my own Phase Zero work first. Radical Mindfulness changed how I show up as a leader, before I ever brought concepts to my team.",
    attribution: "IGNITE Program Graduate",
    context: "Started with IGNITE Radical Mindfulness, now exploring AMPLIFY",
  },
  {
    tier: TIERS.AMPLIFY,
    quote: "The strategic sprint gave our leadership team a shared language we'd been missing. We went from talking past each other to co-designing transformation. Worth every dollar.",
    attribution: "Leadership Team Lead",
    context: "6-month AMPLIFY strategic sprint",
  },
  {
    tier: TIERS.EMBODY,
    quote: "This wasn't consulting. Amy didn't tell us what to do, she partnered with us to architect what was possible for OUR organization. The Blue Door revealed gaps we didn't know existed. The 12-month partnership built capacity we'll have forever.",
    attribution: "Chief Executive Officer",
    context: "12-month EMBODY partnership, continuing with Leadership Summits",
  },
];

export function SocialProofSection() {
  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="container max-w-6xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-navy mb-4">
            Leaders Making Sh<span className="text-raspberry">IF</span>t Happen
          </h2>
          <p className="text-lg text-foreground">
            From individual exploration to full organizational transformation, here's what's possible at each P.A.T.H.way.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div 
              key={index} 
              className={`${testimonial.tier.bgColor} p-8 rounded-xl border-t-4 ${testimonial.tier.borderColor}`}
            >
              <Quote className={`w-8 h-8 ${testimonial.tier.textColor} mb-4 opacity-50`} />
              <blockquote className="text-foreground italic mb-6 leading-relaxed">
                "{testimonial.quote}"
              </blockquote>
              <div className="border-t border-border/30 pt-4">
                <p className={`font-semibold ${testimonial.tier.textColor}`}>
                 , {testimonial.attribution}
                </p>
                <p className="text-sm text-foreground/70 mt-1">
                  {testimonial.context}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
