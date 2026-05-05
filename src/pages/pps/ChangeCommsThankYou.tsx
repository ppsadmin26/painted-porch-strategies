import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Download, BookOpen, Home } from "lucide-react";
import guidePreview from "@/assets/change-comms-guide-preview.jpg";
import heroBg from "@/assets/change-comms-hero-bg.jpg";

const PDF_URL = "/downloads/Critical_Steps_for_Effective_Change_Communication_Painted_Porch_Strategies.pdf";

export default function ChangeCommsThankYou() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section
        className="relative text-white py-20 px-4 bg-cover bg-center"
        style={{ backgroundImage: `url(${heroBg})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-navy/85 via-navy/80 to-teal/80" aria-hidden="true" />
        <div className="relative max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-lime-green/20 rounded-full mb-6">
            <CheckCircle2 className="w-12 h-12 text-lime-green" />
          </div>
          <h1 className="font-poppins font-bold text-4xl md:text-5xl mb-4">
            📑 Here's Your Guide
          </h1>
          <p className="text-xl text-white/90">
            Thank you for downloading our <strong className="text-gold">4 Critical Steps for Effective Change Communication</strong> guide.
          </p>
        </div>
      </section>

      {/* Download */}
      <section className="py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white border-2 border-border rounded-2xl shadow-lg p-8 md:p-12 text-center">
            <h2 className="font-poppins font-bold text-2xl md:text-3xl text-navy mb-4">
              Download Your Guide
            </h2>
            <p className="text-lg text-charcoal mb-6 max-w-xl mx-auto">
              Click the button below 👇 to download the guide and start planning messaging that drives understanding, clarity, confidence, and adoption. We've also sent a copy to your inbox.
            </p>
            <a
              href={PDF_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="block max-w-md mx-auto mb-8 rounded-xl overflow-hidden border-2 border-border shadow-md hover:shadow-xl transition-shadow"
              aria-label="Preview the 4 Critical Steps guide"
            >
              <img src={guidePreview} alt="Cover of the 4 Critical Steps for Effective Change Communication guide" className="w-full h-auto block" />
            </a>
            <a href={PDF_URL} target="_blank" rel="noopener noreferrer" download>
              <Button className="bg-teal hover:bg-teal/90 text-white text-lg py-6 px-8 rounded-full">
                <Download className="mr-2 w-5 h-5" />
                Download Now
              </Button>
            </a>
            <p className="text-xs text-muted-foreground mt-4">
              PDF · Painted Porch Strategies
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
              <Link to="/blue-door" className="group">
                <div className="bg-white border-2 border-border hover:border-cobalt rounded-xl p-6 h-full transition-colors">
                  <Home className="w-10 h-10 text-cobalt mb-3" />
                  <h4 className="font-poppins font-semibold text-lg text-navy mb-2">
                    Open <span className="text-cobalt font-bold">The Blue Door</span>
                  </h4>
                  <p className="text-sm text-charcoal">
                    Ready to go deeper? Our organizational appraisal is the next step.
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
