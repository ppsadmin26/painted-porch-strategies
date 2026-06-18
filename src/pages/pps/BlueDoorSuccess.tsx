import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Check, ArrowRight, Mail, Clock, ClipboardList } from "lucide-react";
import { isBlueDoorPreLaunch } from "@/config/blueDoor";

const nextSteps = [
  {
    icon: Mail,
    title: "Check Your Inbox",
    description: "You'll receive a confirmation email with your receipt and next steps within a few minutes.",
  },
  {
    icon: ClipboardList,
    title: "Complete Your Blue Door Appraisal",
    description: "You'll receive a link to our organizational appraisal. It takes less than 30 minutes and gives our team the strategic context needed to craft your executive brief.",
  },
  {
    icon: Clock,
    title: "Executive Brief in 72 Hours",
    description: "Our team will analyze your responses and deliver a detailed executive brief within 72 business hours.",
  },
  {
    icon: ArrowRight,
    title: "Strategic Clarity Awaits",
    description: "Your brief will include 3-4 viable shift paths, structural assessments, and strategic recommendations.",
  },
];

export default function BlueDoorSuccess() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const isPreLaunch = isBlueDoorPreLaunch();

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-bluedoor/5 to-strategic/5 py-16 md:py-24">
      <div className="container max-w-3xl mx-auto px-6 text-center">
        {/* Success Icon */}
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-lime/20 mb-8">
          <Check className="w-10 h-10 text-lime" strokeWidth={3} />
        </div>

        <h1 className="text-4xl md:text-5xl lg:text-6xl font-poppins font-bold text-navy mb-4">
          You've Opened The Blue Door
        </h1>

        <p className="text-lead text-muted-foreground max-w-xl mx-auto mb-8">
          Your purchase is confirmed. Strategic clarity is on its way. Here's what happens next.
        </p>

        {/* Pre-launch notice */}
        {isPreLaunch && (
          <div className="bg-gold/15 border-l-4 border-gold rounded-r-lg p-5 mb-12 text-left">
            <p className="font-poppins font-bold text-navy text-body mb-1">
              🚪 Launching June 29th, 2026
            </p>
            <p className="text-foreground text-body-sm leading-relaxed">
              Your spot is reserved. On launch day, we'll email you a secure access link to begin your Blue Door appraisal.
            </p>
          </div>
        )}

        {/* Next Steps */}
        <div className="grid gap-6 text-left mb-12">
          {nextSteps.map((step, index) => (
            <div
              key={index}
              className="flex items-start gap-4 bg-white rounded-lg p-6 shadow-sm border border-border"
            >
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-bluedoor/10 flex items-center justify-center">
                <step.icon className="w-5 h-5 text-bluedoor" />
              </div>
              <div>
                <h3 className="text-xl md:text-2xl font-poppins font-semibold text-navy mb-1">
                  {step.title}
                </h3>
                <p className="text-body-sm text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Doing Good ShIFt */}
        <div className="bg-lime/10 border-l-4 border-lime rounded-r-lg p-6 text-left mb-12">
          <h4 className="text-base md:text-lg font-poppins font-bold text-navy mb-2">
            Let's Do Good Sh<span className="text-lime font-bold">IF</span>t
          </h4>
          <p className="text-body-sm text-foreground leading-relaxed">
            Thanks to your purchase, <span className="font-bold text-lime">5% has been donated to charity</span>. You've just made a strategic investment in your organization <em>and</em> in the world.
          </p>
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/partner">
            <Button className="btn-primary px-8 py-6 text-base">
              Explore Our Partnerships
            </Button>
          </Link>
          <Link to="/">
            <Button variant="outline" className="px-8 py-6 text-base border-bluedoor text-bluedoor hover:bg-bluedoor/5">
              Return Home
            </Button>
          </Link>
        </div>

        <p className="text-body-sm text-muted-foreground mt-8">
          Questions? Contact{" "}
          <a
            href="mailto:explore@onthepaintedporch.com"
            className="text-primary hover:underline"
          >
            explore@onthepaintedporch.com
          </a>
        </p>
      </div>
    </div>
  );
}
