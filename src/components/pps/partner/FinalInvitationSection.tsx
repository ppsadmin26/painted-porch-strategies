import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { TIER_LIST } from "@/config/tiers";
import { ParallaxBackground } from "@/components/pps/ParallaxBackground";
import finalInvitationBg from "@/assets/final-invitation-bg.jpg";

export function FinalInvitationSection() {
  return (
    <section className="relative py-16 md:py-24 text-white overflow-hidden">
      <ParallaxBackground image={finalInvitationBg} />
      <div className="container max-w-4xl mx-auto px-6 text-center relative z-10">
        <h2 className="text-3xl md:text-4xl font-bold mb-6">
          Start With the Next Step
        </h2>
        <div className="text-lg text-white/90 mb-8 max-w-2xl mx-auto space-y-4">
          <p className="font-semibold text-white">
            You don't need the entire path today. You only need the next step.
          </p>
          <p>
            Whether that begins with a course, an assessment, a workshop, a strategic conversation, or a long-term partnership, the goal remains the same:
            <br /><br />
            <strong>Creating meaningful progress with intention, clarity, and purpose.</strong>
          </p>
        </div>

        
        <div className="mb-8 flex justify-center px-4">
          <Link to="/start-here" className="w-full max-w-[20rem] sm:w-auto sm:max-w-full">
            <Button className="bg-primary border-2 border-primary text-white hover:bg-white hover:text-primary text-sm sm:text-lg py-4 sm:py-5 px-4 sm:px-8 transition-colors font-semibold w-full sm:w-auto max-w-full whitespace-normal h-auto leading-tight text-center">
              <span className="min-w-0 whitespace-normal">Discover Your P.A.T.H.way</span>
            </Button>
          </Link>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-6 px-4">
          {TIER_LIST.map((tier) => (
            <Link key={tier.name} to={tier.href} className="w-full max-w-[20rem] sm:w-auto sm:max-w-full">
              <Button 
                className={`bg-transparent border-2 border-white text-white transition-colors w-full sm:w-auto max-w-full whitespace-normal h-auto
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
