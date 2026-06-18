import { Link } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ClipboardCheck, Users, Lightbulb, Target } from "lucide-react";
import { ParallaxCTA } from "@/components/pps/ParallaxCTA";
import teamsCtaBg from "@/assets/heroes/teams-hero.jpg";

const ASSESSMENT_URL = "https://paintedporchstrategies.aidaform.com/change-ready-team";

export default function ChangeReadyTeamAssessment() {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  // Conservative default, small enough for mobile, grows via postMessage
  const [iframeHeight, setIframeHeight] = useState<number>(640);

  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      // AidaForm posts resize messages from its embed origin
      if (typeof event.origin !== "string" || !event.origin.includes("aidaform")) return;
      const data = event.data;
      let height: number | undefined;

      if (typeof data === "number") {
        height = data;
      } else if (typeof data === "string") {
        const match = data.match(/(\d+)/);
        if (match) height = parseInt(match[1], 10);
      } else if (data && typeof data === "object") {
        const candidate = data.height ?? data.scrollHeight ?? data.documentHeight ?? data.value;
        if (typeof candidate === "number") height = candidate;
        else if (typeof candidate === "string" && /^\d+$/.test(candidate)) height = parseInt(candidate, 10);
      }

      if (height && height > 200 && height < 10000) {
        setIframeHeight(height);
      }
    }

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="bg-white py-16 md:py-20">
        <div className="container max-w-5xl mx-auto px-6">
          <Link
            to="/resources/free"
            className="inline-flex items-center gap-2 text-sm text-primary hover:underline mb-8"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Free Resources
          </Link>

          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-lime/20 text-navy mb-4">
              <ClipboardCheck className="w-3.5 h-3.5" /> Free Assessment
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-navy leading-tight mb-6">
              Is Your Team{" "}
              <span className="text-primary">Change-Ready?</span>
            </h1>
            <p className="text-lead text-foreground mb-4">
              Take this quick, free assessment to find out. In less than 10 minutes, you'll spot where your team is steady, where it's stretched, and where a small shIFt could make a big difference before your next change kicks off.
            </p>
            <p className="text-body text-muted-foreground">
              No cost. No strings. Just clear answers about your team's readiness.
            </p>
          </div>
        </div>
      </section>

      {/* What you'll learn */}
      <section className="py-12 bg-muted">
        <div className="container max-w-5xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-navy mb-8 text-center">
            What you'll walk away with
          </h2>
          <div className="grid sm:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl p-6 text-center shadow-sm">
              <Target className="w-8 h-8 text-primary mx-auto mb-3" />
              <h3 className="text-xl md:text-2xl font-bold text-navy mb-2">A Clear Snapshot</h3>
              <p className="text-body-sm text-foreground">
                See where your team stands across the key dimensions of change-readiness.
              </p>
            </div>
            <div className="bg-white rounded-xl p-6 text-center shadow-sm">
              <Users className="w-8 h-8 text-primary mx-auto mb-3" />
              <h3 className="text-xl md:text-2xl font-bold text-navy mb-2">Team Blind Spots</h3>
              <p className="text-body-sm text-foreground">
                Spot the gaps and tension points that could trip up your next initiative.
              </p>
            </div>
            <div className="bg-white rounded-xl p-6 text-center shadow-sm">
              <Lightbulb className="w-8 h-8 text-primary mx-auto mb-3" />
              <h3 className="text-xl md:text-2xl font-bold text-navy mb-2">Practical Next Steps</h3>
              <p className="text-body-sm text-foreground">
                Get simple, doable ideas for building readiness before change hits.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Embedded Assessment */}
      <section id="assessment" className="py-16 bg-white">
        <div className="container max-w-4xl mx-auto px-6">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-navy mb-3">
              Take the Assessment
            </h2>
            <p className="text-body text-foreground">
              Takes less than 10 minutes. Your answers are private.
            </p>
          </div>

          <div className="bg-muted rounded-xl p-2 md:p-4 shadow-sm overflow-hidden">
            <iframe
              ref={iframeRef}
              src={ASSESSMENT_URL}
              title="Change-Ready Team Assessment"
              className="w-full rounded-lg bg-white block"
              style={{ height: `${iframeHeight}px`, border: "0", transition: "height 200ms ease-out" }}
              loading="lazy"
              allow="clipboard-write; fullscreen"
              scrolling="no"
            />
          </div>

          <p className="text-center text-body-sm text-muted-foreground mt-4">
            Trouble loading the form?{" "}
            <a
              href={ASSESSMENT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline hover:no-underline"
            >
              Open the assessment in a new tab
            </a>
            .
          </p>
        </div>
      </section>

      {/* Next step CTA */}
      <ParallaxCTA
        backgroundImage={teamsCtaBg}
        overlayClass="bg-gradient-to-b from-navy/65 via-navy/55 to-navy/65"
        headline="Ready to partner with us?"
        description="Now that you've seen where your team stands, let's architect what comes next. Explore the ways we can partner with you to build a change-ready team."
        actions={[
          {
            label: "Explore Partnership",
            to: "/partner",
            ariaLabel: "Explore partnership options with Painted Porch Strategies",
          },
        ]}
      />
    </div>
  );
}
