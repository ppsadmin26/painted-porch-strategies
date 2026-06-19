import { useEffect, useState } from "react";
import { Link, Navigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Download, ArrowLeft, BookOpen } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import porchHero from "@/assets/stoic-field-guide-porch.jpg";
import { Eyebrow } from "@/components/pps/Eyebrow";

const FIELD_GUIDE_URL = "/downloads/Stoic_Leader_Field_Guide_Painted_Porch_Strategies.pdf";
const SLOT_KEY = "stoic-field-guide";
const STORAGE_KEY = "stoic_field_guide_access";

export default function StoicFieldGuideAccess() {
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
    return <Navigate to="/stoic-field-guide" replace />;
  }

  return (
    <div>
      {/* Hero */}
      <section className="relative py-20 md:py-28 text-center overflow-hidden">
        {/* Background image */}
        <img
          src={porchHero}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Overlay for legibility */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-b from-navy/80 via-navy/70 to-navy/85"
        />
        <div className="container max-w-4xl mx-auto px-6 relative">
          <Eyebrow tone="lime">Instant Access</Eyebrow>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-4">
            The <span className="text-gold italic">Stoic Leader's</span> Field Guide
          </h1>
          <p className="text-body text-white/90 max-w-2xl mx-auto mb-3">
            Your free field guide is ready. Download it below and keep it close as you put these practices to work.
          </p>
          <p className="text-body text-white/80 max-w-2xl mx-auto mb-8">
            We've also sent a copy to your inbox so you can come back to it any time.
          </p>
          <a href={FIELD_GUIDE_URL} target="_blank" rel="noopener noreferrer">
            <Button className="bg-gold border-2 border-gold text-navy hover:bg-transparent hover:text-gold transition-colors px-8 py-6 text-base font-semibold">
              <Download className="mr-2 w-5 h-5" /> Download the Field Guide
            </Button>
          </a>
        </div>
      </section>

      {/* What's inside + Download card */}
      <section className="py-16 md:py-20 bg-white">
        <div className="container max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-10 md:gap-12 items-start">
            {/* What's inside */}
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-navy mb-6">
                What you'll find inside...
              </h2>
              <ul className="space-y-3 text-foreground">
                {[
                  "Core Stoic principles applied to modern leadership",
                  "Daily practices for resilience, focus, and steadiness",
                  "Reflection prompts to sharpen judgment and self-awareness",
                  "A simple framework for what you can (and can't) control",
                  "A repeatable rhythm for thoughtful, grounded leadership",
                  "And more!",
                ].map((item) => (
                  <li key={item} className="text-body flex items-start gap-3">
                    <span className="w-2 h-2 rounded-full bg-gold mt-2 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Download card */}
            <div className="bg-muted/30 rounded-xl p-8 md:p-10">
              <div className="inline-flex p-3 rounded-lg bg-gold/10 text-gold mb-4">
                <BookOpen className="w-6 h-6" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-navy mb-4">
                Download Your Field Guide
              </h2>
              <p className="text-body text-foreground mb-6">
                Save it, print it, mark it up. Use this field guide as your daily companion for leading with steadiness through change.
              </p>
              <a href={FIELD_GUIDE_URL} target="_blank" rel="noopener noreferrer">
                <Button className="bg-gold border-2 border-gold text-navy hover:bg-transparent hover:text-gold transition-colors px-8 py-6 text-base font-semibold">
                  <Download className="mr-2 w-5 h-5" /> Download the Field Guide
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
            Explore more free tools, frameworks, and downloads to put what you've learned into action.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/resources/free">
              <Button className="bg-navy border-2 border-navy text-white hover:bg-transparent hover:text-navy transition-colors px-6 py-5">
                <Download className="mr-2 w-4 h-4" /> Browse Free Resources
              </Button>
            </Link>
            <Link to="/contact">
              <Button className="bg-gold border-2 border-gold text-navy hover:bg-transparent hover:text-gold transition-colors px-6 py-5 font-semibold">
                Contact Us
              </Button>
            </Link>
          </div>
          <Link to="/stoic-field-guide" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-navy mt-8">
            <ArrowLeft className="w-4 h-4" /> Back to opt-in page
          </Link>
        </div>
      </section>
    </div>
  );
}
