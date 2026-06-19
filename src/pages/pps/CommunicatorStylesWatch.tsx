import { useEffect, useState } from "react";
import { Link, useSearchParams, Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Download, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Eyebrow } from "@/components/pps/Eyebrow";

const REFERENCE_SHEET_URL = "/downloads/6-communicator-styles-summary.pdf";
const SLOT_KEY = "communicator-styles";
const STORAGE_KEY = "communicator_styles_access";

export default function CommunicatorStylesWatch() {
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
          searchParams.delete("token");
          setSearchParams(searchParams, { replace: true });
          setStatus("granted");
        } else {
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
    return <Navigate to="/6-communicator-styles" replace />;
  }

  return (
    <div>
      {/* Hero */}
      <section className="bg-white py-12 md:py-16 text-center">
        <div className="container max-w-4xl mx-auto px-6">
          <Eyebrow tone="lime">Instant Access</Eyebrow>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-navy leading-tight mb-4">
            <span className="text-raspberry italic">The 6 Communicator Styles</span> Training Replay
          </h1>
          <p className="text-body text-foreground max-w-2xl mx-auto mb-3">
            Here's the replay of our training on mastering your message.
          </p>
          <p className="text-body text-foreground max-w-2xl mx-auto mb-8">
            Make sure to download the one-page reference sheet to use as you watch and chart your own (and others') communicator styles.
          </p>
          <a href={REFERENCE_SHEET_URL} target="_blank" rel="noopener noreferrer">
            <Button className="bg-raspberry border-2 border-raspberry text-white hover:bg-transparent hover:text-raspberry transition-colors px-8 py-6 text-base">
              <Download className="mr-2 w-5 h-5" /> Download Reference Sheet
            </Button>
          </a>
        </div>
      </section>

      {/* Video */}
      <section className="bg-navy py-12">
        <div className="container max-w-4xl mx-auto px-6">
          <div className="aspect-video bg-black rounded-xl overflow-hidden shadow-2xl">
            <iframe
              src="https://www.youtube.com/embed/Yi4QrnXLeGc?rel=0"
              title="The 6 Communicator Styles to Master Your Message"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              className="w-full h-full"
            />
          </div>
        </div>
      </section>

      {/* Learnings + Reference Sheet side-by-side */}
      <section className="py-16 md:py-20 bg-white">
        <div className="container max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-10 md:gap-12 items-start">
            {/* Learnings */}
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-navy mb-6">
                During this training session, you will learn how...
              </h2>
              <ul className="space-y-3 text-foreground">
                {[
                  "Each of us communicates (speaks, listens, asks) differently",
                  "To spot each person's dominant Communicator Style (including your own!)",
                  "Simple ways you can start to know your \"audience\" and craft communication that is heard and understood",
                  "And more!",
                ].map((item) => (
                  <li key={item} className="text-body flex items-start gap-3">
                    <span className="w-2 h-2 rounded-full bg-raspberry mt-2 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Reference Sheet */}
            <div className="bg-muted/30 rounded-xl p-8 md:p-10">
              <h2 className="text-3xl md:text-4xl font-bold text-navy mb-4">
                Don't Forget Your One-Page Reference Sheet
              </h2>
              <p className="text-body text-foreground mb-6">
                Download the 6 Communicator Styles summary to use as a quick reference as you begin to chart your own, as well as others', styles to master your message and communicate with clarity, influence, and impact.
              </p>
              <a href={REFERENCE_SHEET_URL} target="_blank" rel="noopener noreferrer">
                <Button className="bg-raspberry border-2 border-raspberry text-white hover:bg-transparent hover:text-raspberry transition-colors px-8 py-6 text-base">
                  <Download className="mr-2 w-5 h-5" /> Download Reference Sheet
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Next Steps */}
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
                <Download className="mr-2 w-4 h-4" /> Browse Free Resources
              </Button>
            </Link>
            <Link to="/contact">
              <Button className="bg-raspberry border-2 border-raspberry text-white hover:bg-transparent hover:text-raspberry transition-colors px-6 py-5">
                Contact Us
              </Button>
            </Link>
          </div>
          <Link to="/6-communicator-styles" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-navy mt-8">
            <ArrowLeft className="w-4 h-4" /> Back to opt-in page
          </Link>
        </div>
      </section>
    </div>
  );
}
