import { useEffect, useState } from "react";
import { Link, Navigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Download, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Eyebrow } from "@/components/pps/Eyebrow";

const ACTION_GUIDE_URL = "/downloads/kick-the-habit-action-guide.pdf";
const SLOT_KEY = "kick-the-habit";
const STORAGE_KEY = "kick_habit_access";

export default function KickTheHabitWatch() {
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
    return <Navigate to="/kick-the-habit" replace />;
  }

  return (
    <div>
      {/* Hero */}
      <section className="bg-white py-12 md:py-16 text-center">
        <div className="container max-w-4xl mx-auto px-6">
          <Eyebrow tone="lime">Instant Access</Eyebrow>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-navy leading-tight mb-4">
            <span className="text-raspberry italic">Kick the Habit</span> Training Replay
          </h1>
          <p className="text-body text-foreground max-w-2xl mx-auto mb-3">
            Here's the replay of our webinar from June 28th, 2022.
          </p>
          <p className="text-body text-foreground max-w-2xl mx-auto mb-8">
            Make sure to download the Action Guide to use as you watch and then begin to implement the strategies shared during the training.
          </p>
          <a href={ACTION_GUIDE_URL} target="_blank" rel="noopener noreferrer">
            <Button className="bg-raspberry border-2 border-raspberry text-white hover:bg-transparent hover:text-raspberry transition-colors px-8 py-6 text-base">
              <Download className="mr-2 w-5 h-5" /> Download Action Guide
            </Button>
          </a>
        </div>
      </section>

      {/* Video */}
      <section className="bg-navy py-12">
        <div className="container max-w-4xl mx-auto px-6">
          <div className="aspect-video bg-black rounded-xl overflow-hidden shadow-2xl">
            <iframe
              src="https://www.youtube.com/embed/wcr0yj7Qybk?rel=0"
              title="Kick the Habit: Develop a Change-Ready Mindset"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              className="w-full h-full"
            />
          </div>
        </div>
      </section>

      {/* Learnings + Action Guide side-by-side */}
      <section className="py-16 md:py-20 bg-white">
        <div className="container max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-10 md:gap-12 items-start">
            {/* Learnings */}
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-navy mb-6">
                During this training session, you will learn to...
              </h2>
              <ul className="space-y-3 text-foreground">
                {[
                  "Understand what's impacting well-intended change efforts",
                  "Spot negative thinking patterns",
                  "Challenge habitual ways of doing",
                  "Use curiosity and play to spot innovative ideas",
                  "Develop a Change-ready mindset",
                  "And more!",
                ].map((item) => (
                  <li key={item} className="text-body flex items-start gap-3">
                    <span className="w-2 h-2 rounded-full bg-raspberry mt-2 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Action Guide */}
            <div className="bg-muted/30 rounded-xl p-8 md:p-10">
              <h2 className="text-3xl md:text-4xl font-bold text-navy mb-4">
                Don't Forget Your Action Guide
              </h2>
              <p className="text-body text-foreground mb-6">
                Download the Kick the Habit Action Guide to help you plot a path toward developing a change-ready mindset and innovative solutions that will propel your growth and create lasting change.
              </p>
              <a href={ACTION_GUIDE_URL} target="_blank" rel="noopener noreferrer">
                <Button className="bg-raspberry border-2 border-raspberry text-white hover:bg-transparent hover:text-raspberry transition-colors px-8 py-6 text-base">
                  <Download className="mr-2 w-5 h-5" /> Download Action Guide
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
          <Link to="/kick-the-habit" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-navy mt-8">
            <ArrowLeft className="w-4 h-4" /> Back to opt-in page
          </Link>
        </div>
      </section>
    </div>
  );
}
