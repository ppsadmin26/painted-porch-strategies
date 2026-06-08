import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Bell, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface CourseLaunchListDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  courseName: string;
  /** Tag suffix used in GHL, e.g. "master-your-message" */
  courseSlug: string;
}

export function CourseLaunchListDialog({
  open,
  onOpenChange,
  courseName,
  courseSlug,
}: CourseLaunchListDialogProps) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [newsletter, setNewsletter] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !email.trim() || !consent) return;
    setLoading(true);

    try {
      const { error } = await supabase.functions.invoke("submit-ghl-lead", {
        body: {
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: email.trim(),
          tags: ["course-launch-list", `course-launch-${courseSlug}`],
          newsletter,
          skipOpportunity: true,
        },
      });
      if (error) throw error;

      // Fire confirmation + admin alert via single fn that respects per-program toggles
      supabase.functions
        .invoke("notify-launch-signup", {
          body: {
            slug: courseSlug,
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            email: email.trim(),
            newsletter,
          },
        })
        .catch((err) => console.error("Launch signup notify error:", err));

      setSubmitted(true);
    } catch (err) {
      console.error("Launch list submission error:", err);
      toast({
        title: "Something went wrong",
        description: "Please try again or contact us directly.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = (val: boolean) => {
    if (!val) {
      setSubmitted(false);
      setFirstName("");
      setLastName("");
      setEmail("");
      setConsent(false);
      setNewsletter(false);
    }
    onOpenChange(val);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        {!submitted ? (
          <>
            <DialogHeader>
              <DialogTitle className="font-poppins text-2xl text-pps-navy">
                Join the Launch List
              </DialogTitle>
              <DialogDescription className="text-foreground/80">
                Be the first to know when <strong>{courseName}</strong> is
                ready on our new course platform.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-2">
              <div className="grid grid-cols-2 gap-3">
                <Input
                  placeholder="First Name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  maxLength={100}
                  className="h-12"
                />
                <Input
                  placeholder="Last Name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  maxLength={100}
                  className="h-12"
                />
              </div>
              <Input
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                maxLength={255}
                className="h-12"
              />
              <div className="flex items-start gap-2">
                <Checkbox
                  id={`launch-consent-${courseSlug}`}
                  checked={consent}
                  onCheckedChange={(v) => setConsent(v === true)}
                  className="mt-0.5"
                  required
                />
                <label
                  htmlFor={`launch-consent-${courseSlug}`}
                  className="text-sm text-foreground/70 cursor-pointer leading-tight"
                >
                  Yes, notify me when <strong>{courseName}</strong> launches and send me other relevant invitations to join us on the Painted Porch. I can unsubscribe anytime.

                </label>
              </div>
              <Button
                type="submit"
                disabled={loading || !consent}
                className="w-full bg-gold border-2 border-gold text-pps-navy font-poppins font-semibold text-base h-12 hover:bg-transparent hover:text-gold transition-colors"
              >
                {loading ? "Signing Up..." : "JOIN THE LAUNCH LIST"}
                {!loading && <Bell className="ml-2 w-4 h-4" />}
              </Button>
            </form>

            <p className="text-xs text-foreground/60 text-center leading-relaxed mt-4">
              You can unsubscribe anytime using the link at the bottom of any email. We never share or sell your information. See our{" "}
              <Link to="/terms?tab=privacy" className="underline hover:text-foreground">
                Privacy Policy
              </Link>.
            </p>
          </>

        ) : (
          <div className="text-center py-6">
            <CheckCircle2 className="w-16 h-16 text-pps-lime mx-auto mb-4" />
            <h3 className="text-xl md:text-2xl font-poppins font-bold text-pps-navy mb-2">
              You're on the List!
            </h3>
            <p className="text-foreground/80">
              We'll email you as soon as <strong>{courseName}</strong> is
              available on our new course platform.
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
