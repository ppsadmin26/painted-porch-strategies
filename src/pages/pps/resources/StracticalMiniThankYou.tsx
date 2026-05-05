import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Mail, BookOpen, Home } from "lucide-react";

export default function StracticalMiniThankYou() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative text-white py-20 px-4 bg-gradient-to-br from-navy via-navy to-strategic/40">
        <div className="relative max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-lime-green/20 rounded-full mb-6">
            <CheckCircle2 className="w-12 h-12 text-lime-green" />
          </div>
          <h1 className="font-poppins font-bold text-4xl md:text-5xl mb-4">
            You're In, Stractical Leader!
          </h1>
          <p className="text-xl text-white/90">
            Your <strong className="text-gold">Stractical Leader Mini Guide</strong> is on its way to your inbox.
          </p>
        </div>
      </section>

      {/* Confirmation */}
      <section className="py-16 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white border-2 border-border rounded-2xl shadow-lg p-8 md:p-12 text-center">
            <Mail className="w-12 h-12 text-teal mx-auto mb-4" />
            <h2 className="font-poppins font-bold text-2xl text-navy mb-4">
              Check Your Email
            </h2>
            <p className="text-lg text-charcoal mb-2">
              We just sent your <strong className="text-raspberry">FREE</strong> Stractical Leader Mini Guide straight to your inbox.
            </p>
            <p className="text-sm text-muted-foreground mb-2">
              (If you don't see it within a few minutes, check your spam or promotions folder.)
            </p>
          </div>

          <div className="mt-12">
            <h3 className="font-poppins font-bold text-2xl text-navy text-center mb-8">
              While You're Here…
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              <Link to="/resources/free" className="group">
                <div className="bg-white border-2 border-border hover:border-teal rounded-xl p-6 h-full transition-colors">
                  <BookOpen className="w-10 h-10 text-teal mb-3" />
                  <h4 className="font-poppins font-semibold text-lg text-navy mb-2">
                    Explore More Free Resources
                  </h4>
                  <p className="text-sm text-charcoal">
                    Guides, templates, and tools to help you architect your next shIFt.
                  </p>
                </div>
              </Link>
              <Link to="/partner/amplify/stractical-leader" className="group">
                <div className="bg-white border-2 border-border hover:border-cobalt rounded-xl p-6 h-full transition-colors">
                  <Home className="w-10 h-10 text-cobalt mb-3" />
                  <h4 className="font-poppins font-semibold text-lg text-navy mb-2">
                    Go Deeper: <span className="text-cobalt font-bold">The Stractical Leader Workshop</span>
                  </h4>
                  <p className="text-sm text-charcoal">
                    Ready to put the guide into practice? Explore the 6-Week Intensive.
                  </p>
                </div>
              </Link>
            </div>
          </div>

          <div className="text-center mt-12">
            <Link to="/">
              <Button variant="outline" className="border-navy text-navy hover:bg-navy hover:text-white">
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
