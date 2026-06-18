import { CheckCircle, DollarSign, Heart } from "lucide-react";

const includedItems = [
  {
    icon: CheckCircle,
    title: "Clear Scope & Timeline",
    description: "Detailed proposal with deliverables and milestones",
  },
  {
    icon: CheckCircle,
    title: "Stoic Principles Foundation",
    description: "All work grounded in reason, logic, purpose, and virtue",
  },
  {
    icon: DollarSign,
    title: "Transparent, Flat-Fee Pricing",
    description: "No surprise bills, no scope creep charges. You know exactly what you're investing.",
  },
  {
    icon: Heart,
    title: "5% Charitable Donation",
    description: "Every fee includes a donation to the charity of your choice",
  },
];

export function PartnerIncludedSection() {
  return (
    <section className="py-16 md:py-24 bg-muted">
      <div className="container max-w-3xl mx-auto px-6">
        <div className="bg-white p-8 rounded-xl shadow-sm">
          <h3 className="text-xl md:text-2xl font-poppins font-semibold text-navy mb-6 text-center">
            What's Included in Every Engagement
          </h3>
          <ul className="space-y-4">
            {includedItems.map((item, index) => (
              <li key={index} className="flex items-start gap-3">
                <item.icon className="w-6 h-6 text-lime flex-shrink-0" />
                <div>
                  <span className="font-semibold text-navy">{item.title}</span>
                  <p className="text-sm text-foreground">{item.description}</p>
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-8 p-6 bg-lime/10 border border-lime/30 rounded-lg">
            <p className="text-lime font-semibold text-lg mb-2">Our Partnership Promise</p>
            <p className="text-sm text-foreground">
              We only enter partnerships where we believe meaningful progress is possible - together. If we're not the right fit, we'll tell you and try to point you in the right direction.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
