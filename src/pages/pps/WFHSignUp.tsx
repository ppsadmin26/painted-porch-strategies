import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Home, Users, Video, Sparkles } from "lucide-react";

export default function WFHSignUp() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [newsletter, setNewsletter] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!firstName.trim() || !email.trim()) {
      toast({ title: "Missing info", description: "Please add your name and email.", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      const { error } = await supabase.functions.invoke("submit-ghl-lead", {
        body: {
          firstName: firstName.trim(),
          lastName: lastName.trim() || "Unknown",
          email: email.trim(),
          newsletter,
          tags: ["WFH Mini Course"],
          message: "Signed up for Work From Home Mini-Course",
        },
      });
      if (error) throw error;
      navigate("/wfh-thank-you");
    } catch (err) {
      console.error(err);
      toast({
        title: "Something went wrong",
        description: "Please try again or contact us directly.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="bg-gradient-to-br from-navy via-navy to-purple text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-gold/20 text-gold px-4 py-2 rounded-full text-sm font-semibold mb-6">
            <Sparkles className="w-4 h-4" />
            FREE MINI-COURSE
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-poppins font-bold mb-6">
            Become a <span className="text-gold">Work From Home Hero!</span>
          </h1>
          <p className="text-lead md:text-2xl text-white/90 max-w-3xl mx-auto">
            Get ready to don your cape and defeat Work From Home fatigue, overwhelm, and disconnect.
          </p>
        </div>
      </section>

      {/* Content + Form */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-start">
          {/* Left: What you'll learn */}
          <div>
            <h2 className="text-3xl md:text-4xl font-poppins font-bold text-navy mb-4">
              MISSION #WFH: Accomplished
            </h2>
            <p className="text-lead text-charcoal mb-8">
              Sign up for access to our <strong>FREE Mini-Course</strong> focused on tackling your Work From Home day , 
              with your family, your colleagues, and yourself.
            </p>

            <h3 className="text-xl md:text-2xl font-poppins font-semibold text-navy mb-4">You'll learn how to:</h3>
            <ul className="space-y-4">
              <li className="flex gap-3">
                <Home className="w-6 h-6 text-teal flex-shrink-0 mt-1" />
                <span className="text-charcoal">
                  <strong className="text-navy">Navigate</strong> your new <strong className="text-navy">Remote Work Dynamic</strong>
                </span>
              </li>
              <li className="flex gap-3">
                <Sparkles className="w-6 h-6 text-lime-green flex-shrink-0 mt-1" />
                <span className="text-charcoal">
                  Successfully <strong className="text-navy">manage your workday</strong> with best practices from a 15-year remote work expert
                </span>
              </li>
              <li className="flex gap-3">
                <Users className="w-6 h-6 text-purple flex-shrink-0 mt-1" />
                <span className="text-charcoal">
                  Discover <strong className="text-navy">creative ways to stay connected</strong> and aligned with your colleagues
                </span>
              </li>
              <li className="flex gap-3">
                <Video className="w-6 h-6 text-raspberry flex-shrink-0 mt-1" />
                <span className="text-charcoal">
                  <strong className="text-navy">Overcome "Zoom Fatigue"</strong>
                </span>
              </li>
            </ul>
          </div>

          {/* Right: Form */}
          <div className="bg-white border-2 border-border rounded-2xl shadow-lg p-8 md:sticky md:top-8">
            <h3 className="text-xl md:text-2xl font-poppins font-bold text-navy mb-2">Get My Cape Ready!</h3>
            <p className="text-body-sm text-muted-foreground mb-6">
              Drop your info below and we'll email you access details.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="mt-1"
                />
              </div>

              <div className="flex items-start gap-2 pt-2">
                <Checkbox
                  id="newsletter"
                  checked={newsletter}
                  onCheckedChange={(v) => setNewsletter(v === true)}
                  className="mt-1"
                />
                <Label htmlFor="newsletter" className="text-sm font-normal text-charcoal cursor-pointer">
                  Yes, send me the occasional Painted Porch newsletter with tips and resources.
                </Label>
              </div>

              <Button
                type="submit"
                disabled={submitting}
                className="w-full bg-raspberry hover:bg-raspberry/90 text-white text-lg py-6 rounded-full"
              >
                {submitting ? "Sending..." : "Get My Cape Ready!"}
              </Button>

              <p className="text-caption text-muted-foreground text-center">
                We won't send spam. Unsubscribe at any time.
              </p>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
