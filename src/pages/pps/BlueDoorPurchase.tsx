import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Check, Clock, ArrowLeft, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { z } from "zod";

const checkoutSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(100, "Name is too long"),
  email: z.string().trim().email("Please enter a valid email address").max(255, "Email is too long"),
  company: z.string().trim().max(200, "Company name is too long").optional(),
});

const includedItems = [
  "Strategic questions assessing opportunity + capability (less than 30 minutes)",
  "AI-powered pattern recognition analysis",
  "20+ years change architecture experience review",
  "Detailed executive brief",
  "3-4 viable change paths identified",
  "Structural assessment across The Painted Porch Pillars™",
  "Prerequisites for each potential change path",
  "Strategic recommendations for next steps",
  "Investment credited toward your partnership engagement"
];

export default function BlueDoorPurchase() {
  const { toast } = useToast();
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: ""
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = checkoutSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach(err => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as string] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: {
          email: formData.email.trim(),
          name: formData.name.trim(),
          company: formData.company?.trim() || ""
        }
      });

      if (error) throw error;
      
      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error("No checkout URL returned");
      }
    } catch (error: any) {
      console.error("Checkout error:", error);
      toast({
        title: "Checkout Error",
        description: error.message || "Unable to start checkout. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-gold/5 to-strategic/5 py-12 md:py-20">
      <div className="container max-w-5xl mx-auto px-6">
        <Link 
          to="/blue-door" 
          className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Blue Door Details
        </Link>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Left: Order Summary */}
          <div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-navy mb-4">
              Complete Your Purchase
            </h1>
            
            <div className="bg-gold/15 border-l-4 border-gold rounded-r-lg p-4 mb-6">
              <p className="font-poppins font-bold text-navy text-base mb-1">
                🚪 Launching June 29th, 2026
              </p>
              <p className="text-foreground text-sm">
                Reserve your Blue Door now. On launch day, we'll email you a secure link to access and complete your assessment.
              </p>
            </div>

            <div className="bg-bluedoor/5 border-2 border-bluedoor rounded-lg p-6 mb-8 shadow-lg">
              <span className="inline-block bg-bluedoor text-white font-poppins font-semibold text-sm px-4 py-1.5 rounded-full mb-3">
                Blue Door Strategic Organizational Appraisal
              </span>
              <p className="font-poppins font-bold text-4xl text-bluedoor mb-4">$1,500</p>
              
              <div className="flex items-center gap-2 text-foreground mb-4">
                <Clock className="w-5 h-5 text-bluedoor" />
                <span>Executive brief delivered within 72 business hours of assessment completion</span>
              </div>
            </div>

            <div className="bg-gradient-to-br from-strategic/5 to-primary/5 rounded-lg p-6">
              <h3 className="text-xl md:text-2xl font-poppins font-semibold text-navy mb-4">
                What's Included:
              </h3>
              <ul className="space-y-3">
                {includedItems.map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-lime flex-shrink-0 mt-0.5" />
                    <span className="text-foreground text-sm">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-8 p-6 bg-raspberry/10 border-l-4 border-raspberry rounded-r-lg">
              <p className="font-bold text-raspberry text-sm">
                100% Clarity Guarantee
              </p>
              <p className="text-foreground text-sm mt-2">
                If the diagnostic doesn't provide a clear strategic path for you to pursue, contact us for a full refund.
              </p>
            </div>

            {/* Do Good ShIFt */}
            <div className="mt-8 p-6 bg-lime/10 border-l-4 border-lime rounded-r-lg">
              <h4 className="text-base md:text-lg font-poppins font-bold text-navy mb-2">
                Let's Do Good Sh<span className="text-lime font-bold">IF</span>t
              </h4>
              <p className="text-foreground text-sm leading-relaxed">
                Painted Porch Strategies was created to model the Stoic principles of <em>Reason, Logic, Purpose, and Virtue</em>. Since we intend to live by the Stoic philosopher Seneca's advice of "<em>works not words</em>", we believe that in order <strong>to do <em>well</em></strong>, we must also <strong>do <em>good</em></strong>. That's why <span className="font-bold text-lime">5% of your purchase will be donated to charity</span>.
              </p>
              <p className="text-foreground text-sm mt-3">
                Visit our Doing Good ShIFt page to see all the charities we've supported over the years.
              </p>
              <a 
                href="https://onthepaintedporch.com/doing-good-shift" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-block mt-2 text-sm font-bold text-primary hover:text-primary/80 transition-colors"
              >
                See our Doing Good ShIFt page →
              </a>
            </div>
          </div>

          {/* Right: Checkout Form */}
          <div>
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-3xl md:text-4xl font-poppins font-bold text-navy mb-6">
                Your Information
              </h2>
              
              <form onSubmit={handleCheckout} className="space-y-6">
                <div>
                  <Label htmlFor="name" className="text-foreground font-medium">
                    Full Name *
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Jane Smith"
                    className={`mt-1.5 ${errors.name ? "border-raspberry" : ""}`}
                    required
                  />
                  {errors.name && (
                    <p className="text-raspberry text-sm mt-1">{errors.name}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="email" className="text-foreground font-medium">
                    Email Address *
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="jane@company.com"
                    className={`mt-1.5 ${errors.email ? "border-raspberry" : ""}`}
                    required
                  />
                  {errors.email && (
                    <p className="text-raspberry text-sm mt-1">{errors.email}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="company" className="text-foreground font-medium">
                    Company Name
                  </Label>
                  <Input
                    id="company"
                    name="company"
                    type="text"
                    value={formData.company}
                    onChange={handleInputChange}
                    placeholder="Acme Corporation"
                    className={`mt-1.5 ${errors.company ? "border-raspberry" : ""}`}
                  />
                  {errors.company && (
                    <p className="text-raspberry text-sm mt-1">{errors.company}</p>
                  )}
                </div>

                <Button 
                  type="submit" 
                  className="btn-primary w-full text-lg py-6"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin mr-2" />
                      Processing...
                    </>
                  ) : (
                    "Reserve My Blue Door →"
                  )}
                </Button>

                <p className="text-center text-muted-foreground text-sm">
                  You'll be redirected to Stripe for secure payment
                </p>
              </form>
            </div>

            <p className="text-center text-muted-foreground text-sm mt-6">
              Questions? Contact{" "}
              <a 
                href="mailto:explore@onthepaintedporch.com"
                className="text-primary hover:underline"
              >
                explore@onthepaintedporch.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
