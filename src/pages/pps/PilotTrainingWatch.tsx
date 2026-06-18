import { useEffect, useState } from "react";
import { useSearchParams, Navigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Eyebrow } from "@/components/pps/Eyebrow";

const SLOT_KEY = "pilot-training";
const STORAGE_KEY = "pilot_training_access";

export default function PilotTrainingWatch() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tokenParam = searchParams.get("token");

  const [status, setStatus] = useState<"checking" | "granted" | "denied">(() => {
    if (typeof window === "undefined") return "checking";
    if (tokenParam) return "checking";
    const has =
      sessionStorage.getItem(STORAGE_KEY) || localStorage.getItem(STORAGE_KEY);
    return has ? "granted" : "denied";
  });

  useEffect(() => {
    if (!tokenParam) return;
    let cancelled = false;
    (async () => {
      try {
        const { data, error } = await supabase.functions.invoke(
          "validate-access-token",
          { body: { token: tokenParam, slot_key: SLOT_KEY } }
        );
        if (cancelled) return;
        if (!error && data?.valid) {
          sessionStorage.setItem(STORAGE_KEY, "1");
          localStorage.setItem(STORAGE_KEY, "1");
          // Strip token from URL so it isn't shared accidentally
          searchParams.delete("token");
          setSearchParams(searchParams, { replace: true });
          setStatus("granted");
        } else {
          // Token invalid: fall back to existing session/local access if any
          const has =
            sessionStorage.getItem(STORAGE_KEY) || localStorage.getItem(STORAGE_KEY);
          setStatus(has ? "granted" : "denied");
        }
      } catch {
        if (cancelled) return;
        const has =
          sessionStorage.getItem(STORAGE_KEY) || localStorage.getItem(STORAGE_KEY);
        setStatus(has ? "granted" : "denied");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [tokenParam, searchParams, setSearchParams]);

  if (status === "checking") {
    return (
      <div className="min-h-[50vh] flex items-center justify-center text-muted-foreground">
        Verifying your access link...
      </div>
    );
  }

  if (status === "denied") {
    return <Navigate to="/pilot-training" replace />;
  }

  return (
    <div>
      {/* Hero */}
      <section className="bg-white py-12 md:py-16 text-center">
        <div className="container max-w-4xl mx-auto px-6">
          <Eyebrow variant="pill" tone="lime">Instant Access</Eyebrow>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-navy leading-tight mb-4">
            <span className="text-primary italic">From Passenger to Pilot</span> Training Replay
          </h1>
          <p className="text-body text-foreground max-w-2xl mx-auto mb-3">
            Here's the replay of Sierra Ramm Cantrell's 'Grow on the Porch' training session.
          </p>
        </div>
      </section>

      {/* Video */}
      <section className="bg-navy py-12">
        <div className="container max-w-4xl mx-auto px-6">
          <div className="aspect-video bg-black rounded-xl overflow-hidden shadow-2xl">
            <iframe
              src="https://www.youtube.com/embed/v0KyojePRLc"
              title="From Passenger to Pilot Training Replay"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              className="w-full h-full"
            />
          </div>
        </div>
      </section>

      {/* Action Guide download */}
      <section className="py-12 bg-cream">
        <div className="container max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-navy mb-3">
            📄 Download Your Action Guide
          </h2>
          <p className="text-body text-foreground mb-6 max-w-xl mx-auto">
            Use this companion guide to design your new "flight plan" and put what you learned into action.
          </p>
          <a
            href="/downloads/From_Passenger_to_Pilot_Flight_Plan.pdf"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button className="bg-gold border-2 border-gold text-navy hover:bg-transparent hover:text-navy transition-colors px-6 py-5 inline-flex items-center gap-2">
              <Download className="w-4 h-4" /> Download the Flight Plan
            </Button>
          </a>
        </div>
      </section>

      {/* Next steps */}
      <section className="py-16 md:py-20 bg-white">
        <div className="container max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-navy mb-4">
            Ready to keep the momentum going?
          </h2>
          <p className="text-body text-foreground mb-8 max-w-2xl mx-auto">
            Explore more free tools, frameworks, and downloads to put what you learned into action.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/resources/free">
              <Button className="bg-navy border-2 border-navy text-white hover:bg-transparent hover:text-navy transition-colors px-6 py-5">
                Browse Free Resources
              </Button>
            </Link>
            <Link to="/contact">
              <Button className="bg-primary border-2 border-primary text-white hover:bg-transparent hover:text-primary transition-colors px-6 py-5">
                Contact Us
              </Button>
            </Link>
          </div>
          <Link to="/pilot-training" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-navy mt-8">
            <ArrowLeft className="w-4 h-4" /> Back to opt-in page
          </Link>
        </div>
      </section>
    </div>
  );
}
