import { Building2, Handshake, Target, BookOpen } from "lucide-react";

const differentiators = [
  {
    icon: Building2,
    title: "We Start in Phase Zero (Everyone Else Starts at Launch)",
    description: "Most advisors work with you to execute change decisions already made. We partner with you BEFORE the decision, in that critical Phase Zero moment when you're determining what change you could credibly lead.",
    contrast: "We architect foundations. They implement initiatives.",
  },
  {
    icon: Handshake,
    title: "We Partner, Not Consult (You're the Expert of You)",
    description: "Most consultants deliver solutions for you. We co-design them with you. You're the expert of your organizational context, your culture, your constraints. We're experts in transformation architecture.",
    contrast: "Together, we build what actually works in YOUR reality.",
  },
  {
    icon: Target,
    title: "We Architect Capacity, Not Implement Projects",
    description: "Most advisors focus on making THIS change successful. We focus on building the capacity to lead ANY change, now and in the future. We don't make you dependent on us.",
    contrast: "When we're done, you've become transformation architects yourselves.",
  },
  {
    icon: BookOpen,
    title: "We're Grounded in 2,300 Years of Wisdom",
    description: "Most leadership development is built on trendy frameworks. We're built on Stoic philosophy, the 2,300-year-old principles of strategic preparation, resilience, and conscious design.",
    contrast: "Premeditatio Malorum: Prepare for adversity before pressure demands it. That's the original Phase Zero.",
  },
];

export function DifferentiatorsSection() {
  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="container max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-navy mb-4">
            Why Partner With Painted Porch Strategies?
          </h2>
          <p className="text-body text-foreground">
            Because we do transformation architecture differently than anyone else in the space.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {differentiators.map((item, index) => (
            <div key={index} className="bg-muted p-8 rounded-xl">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <item.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl md:text-2xl font-poppins font-bold text-navy mb-3">
                {item.title}
              </h3>
              <p className="text-body text-foreground -sm leading-relaxed mb-4">
                {item.description}
              </p>
              <p className="text-body text-primary font-medium -sm italic">
                {item.contrast}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
