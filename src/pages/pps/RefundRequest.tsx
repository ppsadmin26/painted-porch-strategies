import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle2, ShieldCheck } from "lucide-react";
import { PPSBreadcrumb } from "@/components/pps/PPSBreadcrumb";

const PROGRAMS = [
  "Master Your Message",
  "Radical Mindfulness",
  "Create Extraordinary Teams",
  "Other",
];

export default function RefundRequest() {
  const { toast } = useToast();
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [program, setProgram] = useState("");
  const [otherProgram, setOtherProgram] = useState("");
  const [purchaseDate, setPurchaseDate] = useState("");
  const [reason, setReason] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !program || !purchaseDate) {
      toast({
        title: "Please complete the required fields.",
        description: "Name, email, program, and purchase date are required.",
        variant: "destructive",
      });
      return;
    }

    const finalProgram =
      program === "Other" ? otherProgram.trim() || "Other" : program;

    setLoading(true);
    try {
      const { error } = await supabase.functions.invoke(
        "submit-refund-request",
        {
          body: {
            name: name.trim(),
            email: email.trim(),
            program: finalProgram,
            purchaseDate,
            reason: reason.trim(),
          },
        },
      );
      if (error) throw error;
      setSubmitted(true);
    } catch (err) {
      console.error("Refund request submission error:", err);
      toast({
        title: "Something went wrong.",
        description: "Please try again or contact us directly.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <PPSBreadcrumb
        segments={[
          { label: "Home", href: "/" },
          { label: "Refund Request" },
        ]}
      />

      {/* Hero */}
      <section className="bg-gradient-to-b from-pps-teal/10 to-white py-12 md:py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-pps-teal/10 mb-5">
            <ShieldCheck className="w-7 h-7 text-pps-teal" aria-hidden="true" />
          </div>
          <h1 className="text-3xl md:text-4xl font-poppins font-bold text-pps-navy mb-3">
            Request a Refund
          </h1>
          <p className="text-body md:text-lg text-charcoal leading-relaxed max-w-2xl mx-auto">
            We stand behind our courses with a money-back guarantee. Submit the
            short form below and our team will process your refund promptly.
            You'll receive a confirmation email right away, and another email as
            soon as the refund has been issued.
          </p>
        </div>
      </section>

      {/* Form */}
      <section className="py-12 md:py-16 bg-white">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          {submitted ? (
            <div className="rounded-2xl border-2 border-pps-lime/40 bg-pps-lime/5 p-8 md:p-10 text-center">
              <CheckCircle2 className="w-14 h-14 text-pps-lime mx-auto mb-4" />
              <h2 className="text-2xl md:text-3xl font-poppins font-bold text-pps-navy mb-3">
                Request Received
              </h2>
              <p className="text-charcoal leading-relaxed mb-6">
                Thanks, {name.split(" ")[0] || "friend"}. We've received your
                refund request and our team will begin processing it promptly.
                Check your email for a confirmation, and we'll send another
                message once the refund has been issued.
              </p>
              <Button asChild className="bg-pps-teal hover:bg-pps-teal/90 text-white font-poppins font-semibold">
                <Link to="/">Back to Home</Link>
              </Button>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="space-y-6 rounded-2xl border border-border bg-white p-6 md:p-8 shadow-sm"
            >
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name <span className="text-pps-raspberry">*</span></Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="First and last name"
                    required
                    maxLength={200}
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email address <span className="text-pps-raspberry">*</span></Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="The email used to purchase the course"
                    required
                    maxLength={255}
                    className="h-11"
                  />
                  <p className="text-caption text-charcoal/70">
                    Use the email tied to your purchase or course access.
                  </p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="program">Program purchased <span className="text-pps-raspberry">*</span></Label>
                  <Select value={program} onValueChange={setProgram}>
                    <SelectTrigger id="program" className="h-11">
                      <SelectValue placeholder="Select a program" />
                    </SelectTrigger>
                    <SelectContent>
                      {PROGRAMS.map((p) => (
                        <SelectItem key={p} value={p}>{p}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {program === "Other" && (
                    <Input
                      value={otherProgram}
                      onChange={(e) => setOtherProgram(e.target.value)}
                      placeholder="Which program?"
                      maxLength={200}
                      className="h-11 mt-2"
                    />
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="purchase-date">Date of purchase <span className="text-pps-raspberry">*</span></Label>
                  <Input
                    id="purchase-date"
                    type="date"
                    value={purchaseDate}
                    onChange={(e) => setPurchaseDate(e.target.value)}
                    required
                    max={new Date().toISOString().split("T")[0]}
                    className="h-11"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reason">
                  Reason for requesting a refund{" "}
                  <span className="text-charcoal/60 font-normal">(optional)</span>
                </Label>
                <Textarea
                  id="reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Anything you'd like us to know? This helps us improve our courses."
                  maxLength={5000}
                  rows={5}
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between pt-2">
                <p className="text-caption text-charcoal/70">
                  By submitting, you'll get a confirmation email and our team
                  will be notified to process your refund.
                </p>
                <Button
                  type="submit"
                  disabled={loading}
                  className="bg-pps-teal hover:bg-pps-teal/90 text-white font-poppins font-semibold h-11 px-6"
                >
                  {loading ? "Submitting..." : "Submit Refund Request"}
                </Button>
              </div>
            </form>
          )}
        </div>
      </section>
    </div>
  );
}
