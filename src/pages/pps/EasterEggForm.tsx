import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";


const formSchema = z.object({
  name: z.string().min(1, "We'd love to know who found this."),
  email: z.string().min(1, "We need a valid email to send your confirmation.").email("We need a valid email to send your confirmation."),
  explanation: z.string().min(10, "Just a line or two — we want to know you got it."),
  charity: z.string().min(1, "Name the organization and we'll take it from here."),
  charityWebsite: z
    .string()
    .trim()
    .url("Please enter a valid URL (include https://).")
    .optional()
    .or(z.literal("")),
  comments: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const EasterEggForm = () => {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [honeypot, setHoneypot] = useState("");

  useEffect(() => {
    document.title = "You Found Something | Painted Porch Strategies";
  }, []);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      
      explanation: "",
      charity: "",
      charityWebsite: "",
      comments: "",
    },
  });

  const onSubmit = async (data: FormValues) => {
    // Honeypot check
    if (honeypot) return;

    setSubmitting(true);
    try {
      const [firstName, ...rest] = data.name.trim().split(/\s+/);
      const lastName = rest.join(" ") || "—";

      const charityWebsite = data.charityWebsite?.trim() || "";

      const detailsMessage =
        `[Easter Egg Hunt — /found-it]\n\n` +
        `What they found:\n${data.explanation}\n\n` +
        `Charity to donate $25 to:\n${data.charity}` +
        (charityWebsite ? `\nWebsite: ${charityWebsite}` : "") +
        (data.comments ? `\n\nAdditional comments:\n${data.comments}` : "");

      // 1. Push to GHL (contact + opportunity, tagged for the Easter egg hunt)
      const { error: ghlError } = await supabase.functions.invoke("submit-ghl-lead", {
        body: {
          firstName,
          lastName,
          email: data.email.trim(),
          message: detailsMessage,
          tags: ["found it charity"],
          source: "Painted Porch Website - Easter Egg Hunt (/found-it)",
        },
      });

      if (ghlError) throw ghlError;

      // 2. Fire admin notification + submitter confirmation in parallel
      // (non-blocking — don't fail the form if emails fail)
      const submissionId = crypto.randomUUID();
      const emailData = {
        name: data.name.trim(),
        email: data.email.trim(),
        explanation: data.explanation.trim(),
        charity: data.charity.trim(),
        charityWebsite: charityWebsite || undefined,
        comments: data.comments?.trim() || undefined,
      };

      Promise.allSettled([
        supabase.functions.invoke("send-transactional-email", {
          body: {
            templateName: "easter-egg-notification",
            recipientEmail: "explore@onthepaintedporch.com",
            idempotencyKey: `easter-egg-notify-${submissionId}`,
            templateData: emailData,
          },
        }),
        supabase.functions.invoke("send-transactional-email", {
          body: {
            templateName: "easter-egg-confirmation",
            recipientEmail: data.email.trim(),
            idempotencyKey: `easter-egg-confirm-${submissionId}`,
            templateData: { name: firstName, charity: data.charity.trim() },
          },
        }),
      ]).catch((err) => console.error("Easter egg email error:", err));

      setSubmitted(true);
    } catch (error) {
      console.error("Easter egg submission error:", error);
      toast({
        title: "Something went sideways on our end.",
        description: "Try again or email us at explore@onthepaintedporch.com.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-[680px] mx-auto px-6 py-12 md:py-16">
        {!submitted ? (
          <div className="animate-in fade-in duration-300">
            {/* Header */}
            <div className="mb-10">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-poppins font-bold text-[28px] md:text-[40px] text-navy mb-3">
                🎉🐣 You Found Something.
              </h1>
              <p className="font-poppins text-base md:text-xl text-foreground mb-3">
                Most people don't make it this far. Tell us what you found and where — we'll donate $25 to a charity of your choice.
              </p>
              <p className="text-sm text-muted-foreground">
                There are five Easter eggs hidden in our Terms of The Porch. Find any one of them and we'll donate $25 to a cause you care about.
              </p>
            </div>

            {/* Form Card */}
            <div className="bg-white rounded-xl shadow-[0_2px_16px_rgba(0,0,0,0.08)] p-6 md:p-8">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  {/* Honeypot */}
                  <div className="absolute opacity-0 pointer-events-none" aria-hidden="true">
                    <input
                      type="text"
                      name="website"
                      tabIndex={-1}
                      autoComplete="off"
                      value={honeypot}
                      onChange={(e) => setHoneypot(e.target.value)}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-montserrat font-semibold text-sm text-foreground">Your Name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="First and last name"
                            className="h-12 rounded-lg border-[#CCCCCC] focus:border-primary focus-visible:ring-primary text-base"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="text-raspberry" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-montserrat font-semibold text-sm text-foreground">Your Email</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="we'll send you a confirmation"
                            className="h-12 rounded-lg border-[#CCCCCC] focus:border-primary focus-visible:ring-primary text-base"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="text-raspberry" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="explanation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-montserrat font-semibold text-sm text-foreground">Which egg did you find? Tell us what it means.</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="What did you find, and why does it matter?"
                            className="min-h-[100px] rounded-lg border-[#CCCCCC] focus:border-primary focus-visible:ring-primary text-base"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription className="text-xs text-muted-foreground">
                          No need to write an essay. Just enough for us to know you got it.
                        </FormDescription>
                        <FormMessage className="text-raspberry" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="charity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-montserrat font-semibold text-sm text-foreground">Charity of your choice</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Name of the organization you'd like us to donate to"
                            className="h-12 rounded-lg border-[#CCCCCC] focus:border-primary focus-visible:ring-primary text-base"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription className="text-xs text-muted-foreground">
                          We'll make a $25 donation on your behalf. We reserve the right to redirect donations away from organizations that conflict with our values — we'll let you know if that happens and ask for an alternative.
                        </FormDescription>
                        <FormMessage className="text-raspberry" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="charityWebsite"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-montserrat font-semibold text-sm text-foreground">Charity Website</FormLabel>
                        <FormControl>
                          <Input
                            type="url"
                            inputMode="url"
                            placeholder="https://example.org"
                            className="h-12 rounded-lg border-[#CCCCCC] focus:border-primary focus-visible:ring-primary text-base"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription className="text-xs text-muted-foreground">
                          Helps us find the right organization (especially when names overlap). Include https://.
                        </FormDescription>
                        <FormMessage className="text-raspberry" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="comments"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-montserrat font-semibold text-sm text-foreground">Anything else?</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Optional — but we do read every single one"
                            className="min-h-[100px] rounded-lg border-[#CCCCCC] focus:border-primary focus-visible:ring-primary text-base"
                            {...field}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    disabled={submitting}
                    className="w-full md:w-auto md:min-w-[200px] h-12 bg-gold hover:bg-primary text-white font-poppins font-bold text-base rounded-lg transition-colors"
                  >
                    {submitting ? "Sending..." : "Send It"}
                  </Button>
                </form>
              </Form>
            </div>
          </div>
        ) : (
          /* STATE 2: Confirmation */
          <div className="animate-in fade-in duration-400 flex flex-col items-center text-center py-12 md:py-20">
            <div className="w-16 h-1 bg-primary rounded-full mb-8" />
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-poppins font-bold text-[26px] md:text-[36px] text-navy mb-6">
              You're in good company.
            </h1>
            <p className="text-foreground text-base md:text-lg leading-relaxed max-w-md mb-4">
              We got it. Someone from the Porch will confirm your donation within 3–5 business days and send you a note when it's done.
            </p>
            <p className="text-foreground text-base md:text-lg leading-relaxed max-w-md mb-8">
              Thanks for actually reading the fine print. That's a more radical act than it sounds.
            </p>
            <p className="text-muted-foreground text-sm italic">
              — The Painted Porch
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EasterEggForm;
