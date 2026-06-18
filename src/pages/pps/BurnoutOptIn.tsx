import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Flame } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Eyebrow } from "@/components/pps/Eyebrow";

export default function BurnoutOptIn() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();

  // If user already opted in this session, skip the form and send them
  // straight to the gated resources. Honor ?invalid=1 (token failed) so
  // they can re-submit instead of being bounced in a loop.
  useEffect(() => {
    if (searchParams.get("invalid") === "1") return;
    if (sessionStorage.getItem("burnout_access")) {
      navigate("/burnout-access", { replace: true });
    }
  }, [navigate, searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!firstName.trim() || !lastName.trim() || !email.trim()) {
      toast({ title: "Please fill in all fields.", variant: "destructive" });
      return;
    }
    if (!consent) {
      toast({ title: "Please check the consent box to continue.", variant: "destructive" });
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase.functions.invoke("submit-burnout-optin", {
        body: { name: `${firstName.trim()} ${lastName.trim()}`, email: email.trim() },
      });
      if (error) throw error;

      sessionStorage.setItem("burnout_access", "1");
      navigate("/burnout-access");
    } catch (err) {
      console.error("Burnout opt-in error:", err);
      toast({ title: "Something went wrong. Please try again.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-200px)] bg-gradient-to-br from-raspberry/10 via-purple/10 to-navy/20 py-16 md:py-24">
      <div className="container max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-10 lg:gap-16 items-center">
          {/* Left: Headline & description */}
          <div>
            <Eyebrow variant="pill" tone="raspberry">Access Resources To</Eyebrow>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-poppins font-bold text-navy mb-6 leading-tight">
              <Flame className="inline-block w-10 h-10 md:w-12 md:h-12 text-raspberry mb-2 mr-2" />
              Bust Burnout
            </h1>
            <p className="text-lead text-foreground leading-relaxed">
              You've started to spot the signs of burnout. We've put together resources to help you
              bust burnout in yourself, plus tools to support and empower your team to take the
              reins of resilience.
            </p>
          </div>

          {/* Right: Sign-up form */}
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-10 border border-border">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <Input
                  aria-label="First name" placeholder="First Name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="h-12"
                  required
                />
                <Input
                  aria-label="Last name" placeholder="Last Name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="h-12"
                  required
                />
              </div>
              <Input
                type="email"
                aria-label="Email address" placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12"
                required
              />
              <div className="flex items-start gap-3 pt-2">
                <Checkbox
                  id="burnout-consent"
                  checked={consent}
                  onCheckedChange={(checked) => setConsent(checked === true)}
                  className="mt-0.5"
                />
                <label
                  htmlFor="burnout-consent"
                  className="text-xs text-muted-foreground leading-relaxed cursor-pointer"
                >
                  I agree to receive periodic updates and insights from Painted Porch Strategies. We
                  respect your privacy and comply with CAN-SPAM regulations. You can unsubscribe at
                  any time, though we hope you won't. 😊
                </label>
              </div>
              <Button
                type="submit"
                disabled={submitting || !consent}
                className="w-full h-12 font-poppins font-semibold text-base bg-primary border-2 border-primary text-primary-foreground hover:bg-transparent hover:text-primary transition-colors disabled:opacity-50"
              >
                {submitting ? "Submitting..." : "ACCESS RESOURCES"}
              </Button>
              <p className="text-caption text-muted-foreground leading-relaxed text-center pt-2">
                By signing up, you'll get immediate access to our Burnout-Busting resource page,
                plus our newsletter with the latest insights, free resources, and upcoming learning
                opportunities. <strong>We will NOT spam you. Unsubscribe at any time.</strong>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
