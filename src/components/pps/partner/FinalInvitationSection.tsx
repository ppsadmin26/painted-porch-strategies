import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { TIER_LIST } from "@/config/tiers";
import finalInvitationBg from "@/assets/final-invitation-bg.jpg";

export function FinalInvitationSection() {
  return (
    <section className="relative py-16 md:py-24 text-white overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${finalInvitationBg})` }}
      />
      <div className="absolute inset-0 bg-navy/60" />
      <div className="container max-w-4xl mx-auto px-6 text-center relative z-10">
        <h2 className="text-3xl md:text-4xl font-bold mb-6">
          Ready to Move From Reactive to Architect?
        </h2>
        <div className="text-lg text-white/90 mb-8 max-w-2xl mx-auto space-y-4">
          <p>
            Change is coming. It always is. The question isn't whether you'll face transformation pressure.
          </p>
          <p className="font-semibold text-white">
            The question is: Will you be ready when it arrives?
          </p>
          <p>
            <strong>Most leaders wait until the next shift hits their plan.</strong> Then they scramble. They react. They implement tactical solutions to strategic problems.
          </p>
          <p>
            <strong>Extraordinary leaders do something different:</strong> They architect their capacity before pressure demands it.
          </p>
        </div>
        
        <div className="mb-8">
          <Link to="/start-here">
            <Button className="bg-primary border-2 border-primary text-white hover:bg-white hover:text-primary text-lg py-5 px-8 transition-colors font-semibold">
              Discover Your P.A.T.H.way
            </Button>
          </Link>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
          {TIER_LIST.map((tier) => (
            <Link key={tier.name} to={tier.href}>
              <Button 
                className={`bg-transparent border-2 border-white text-white transition-colors
                  ${tier.name === "IGNITE" ? "hover:bg-gold hover:border-gold hover:text-navy" : ""}
                  ${tier.name === "AMPLIFY" ? "hover:bg-strategic hover:border-strategic hover:text-white" : ""}
                  ${tier.name === "EMBODY" ? "hover:bg-navy hover:border-navy hover:text-white" : ""}
                `}
              >
                Explore {tier.name}
              </Button>
            </Link>
          ))}
        </div>

        <Link to="/contact?scope=organization&interest=organizational-advisory&message=I'm interested in organizational advisory." className="text-white/80 hover:text-white underline text-sm">
          Or Contact Us
        </Link>
      </div>
    </section>
  );
}
