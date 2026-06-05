import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, BookOpen, Lightbulb, Target, ArrowRight } from "lucide-react";

const insideBullets = [
  {
    icon: Target,
    title: "The Manager's Paradox",
    description: "Why you have critical insights but limited strategic influence",
    color: "text-raspberry",
    bg: "bg-raspberry/10",
  },
  {
    icon: Lightbulb,
    title: 'The "Just a Manager" Trap',
    description: "The common patterns keeping you stuck in execution mode",
    color: "text-gold",
    bg: "bg-gold/10",
  },
  {
    icon: BookOpen,
    title: "The Stractical Leader Blueprint",
    description: "How to master both strategic vision and tactical execution simultaneously",
    color: "text-bluedoor",
    bg: "bg-bluedoor/10",
  },
  {
    icon: ArrowRight,
    title: "Concrete Next Steps",
    description: "Practical application you can use immediately",
    color: "text-lime",
    bg: "bg-lime/10",
  },
];

export default function StracticalLeaderGuide() {
  return (
    <div>
      {/* HERO */}
      <section className="bg-navy py-20 md:py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-navy via-navy to-strategic/30 opacity-80" />
        <div className="container max-w-5xl mx-auto px-6 relative z-10">
          <div className="max-w-3xl">
            <span className="inline-block bg-gold text-navy font-poppins font-semibold text-sm px-4 py-1.5 rounded-full mb-6">
              Free Download
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-poppins font-bold text-white mb-6 leading-tight">
              Stop Feeling Like{" "}
              <span className="text-gold">"Just a Manager"</span>
            </h1>
            <div className="space-y-4 text-lg md:text-xl text-white/90 leading-relaxed mb-8">
              <p>
                You sit in strategic meetings thinking{" "}
                <em>"I'm just a manager."</em>
              </p>
              <p>
                Your team has the deepest operational knowledge.
                <br />
                You see which strategies will work and which will crash.
                <br />
                You spot the gaps everyone else misses.
              </p>
              <p className="text-white/70">
                Yet your insights rarely shape the decisions.
              </p>
              <p>
                Download this guide to learn how to operate in the{" "}
                <span className="font-semibold text-gold">
                  integration zone between strategy and execution
                </span>
                {" "}where your unique position creates the most impact.
              </p>
            </div>
            <a href="#get-guide">
              <Button className="bg-gold border-2 border-gold text-navy font-poppins font-bold text-lg py-6 px-10 rounded-lg hover:bg-transparent hover:text-gold transition-colors">
                <Download className="mr-2 w-5 h-5" /> GET THE FREE GUIDE
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* WHAT'S INSIDE */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container max-w-5xl mx-auto px-6">
          <div className="text-center mb-12">
            <span className="inline-block bg-primary/10 text-primary font-poppins font-semibold text-sm px-4 py-1.5 rounded-full mb-4">
              What You'll Learn
            </span>
            <h2 className="text-3xl md:text-4xl font-poppins font-bold text-navy">
              What's Inside
            </h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {insideBullets.map((item, i) => (
              <div
                key={i}
                className={`${item.bg} p-8 rounded-xl border border-border/30`}
              >
                <item.icon className={`w-10 h-10 ${item.color} mb-4`} />
                <h3 className="text-xl md:text-2xl font-poppins font-semibold text-navy mb-2">
                  {item.title}
                </h3>
                <p className="text-foreground leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <a href="#get-guide">
              <Button className="bg-navy border-2 border-navy text-white font-poppins font-bold text-lg py-6 px-10 rounded-lg hover:bg-transparent hover:text-navy transition-colors">
                <Download className="mr-2 w-5 h-5" /> DOWNLOAD NOW
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* GHL FORM EMBED */}
      <section id="get-guide" className="py-16 md:py-24 bg-muted scroll-mt-24">
        <div className="container max-w-xl mx-auto px-6">
          <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 border border-border/40">
            <div className="text-center mb-8">
              <Download className="w-12 h-12 text-gold mx-auto mb-4" />
              <h2 className="text-3xl md:text-4xl font-poppins font-bold text-navy mb-2">
                Get Your Free Guide
              </h2>
              <p className="text-foreground/70">
                The Stractical Leader Guide, delivered straight to your inbox.
              </p>
            </div>
            <iframe
              src="https://via.growseamlessly.com/widget/form/pKEP5hulsK5nQJzu45Oh"
              style={{ width: "100%", height: "712px", border: "none", borderRadius: "3px" }}
              id="inline-pKEP5hulsK5nQJzu45Oh"
              data-layout='{"id":"INLINE"}'
              data-trigger-type="alwaysShow"
              data-trigger-value=""
              data-activation-type="alwaysActivated"
              data-activation-value=""
              data-deactivation-type="neverDeactivate"
              data-deactivation-value=""
              data-form-name="Stractical Leader Guide Download Form"
              data-height="712"
              data-layout-iframe-id="inline-pKEP5hulsK5nQJzu45Oh"
              data-form-id="pKEP5hulsK5nQJzu45Oh"
              title="Stractical Leader Guide Download Form"
            />
          </div>
        </div>
      </section>
    </div>
  );
}
