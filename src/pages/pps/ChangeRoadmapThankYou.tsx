import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Download, BookOpen, Home } from "lucide-react";
import roadmapPreview from "@/assets/change-readiness-roadmap-preview.png";
import heroBg from "@/assets/change-roadmap-hero-bg.png";

const PDF_URL = "/downloads/Change_Readiness_Roadmap_Painted_Porch_Strategies.pdf";

export default function ChangeRoadmapThankYou() {
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
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-poppins font-bold mb-4">
            📑 Here's Your Worksheet
          </h1>
          <p className="text-lead text-white/90">
            Thank you for downloading our <strong className="text-gold">Change Readiness Roadmap</strong> planner.
          </p>
        </div>
      </section>

      {/* Download */}
      <section className="py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white border-2 border-border rounded-2xl shadow-lg p-8 md:p-12 text-center">
            <h2 className="text-3xl md:text-4xl font-poppins font-bold text-navy mb-4">
              Download Your Worksheet
            </h2>
            <p className="text-lead text-charcoal mb-6 max-w-xl mx-auto">
              Click the button below 👇 to download the worksheet and start mapping out your P.A.T.H. toward achieving change success. We've also sent a copy to your inbox.
            </p>
            <a
              href={PDF_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="block max-w-md mx-auto mb-8 rounded-xl overflow-hidden border-2 border-border shadow-md hover:shadow-xl transition-shadow"
              aria-label="Preview the Change Readiness Roadmap worksheet"
            >
              <img
                src={roadmapPreview}
                alt="Preview of the Change Readiness Roadmap planning worksheet"
                className="w-full h-auto block"
              />
            </a>
            <a href={PDF_URL} target="_blank" rel="noopener noreferrer" download>
              <Button className="bg-teal hover:bg-teal/90 text-white text-lg py-6 px-8 rounded-full">
                <Download className="mr-2 w-5 h-5" />
                Download Now
              </Button>
            </a>
            <p className="text-caption text-muted-foreground mt-4">
              PDF · Painted Porch Strategies
            </p>
          </div>

          {/* Next steps */}
          <div className="mt-12">
            <h3 className="text-xl md:text-2xl font-poppins font-bold text-navy text-center mb-8">
              While You're Here…
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              <Link to="/resources/free" className="group">
                <div className="bg-white border-2 border-border hover:border-teal rounded-xl p-6 h-full transition-colors">
                  <BookOpen className="w-10 h-10 text-teal mb-3" />
                  <h4 className="text-base md:text-lg font-poppins font-semibold text-navy mb-2">
                    Explore More Free Resources
                  </h4>
                  <p className="text-body-sm text-charcoal">
                    Guides, templates, and tools to help you architect your next shIFt.
                  </p>
                </div>
              </Link>
              <Link to="/blue-door" className="group">
                <div className="bg-white border-2 border-border hover:border-bluedoor rounded-xl p-6 h-full transition-colors">
                  <Home className="w-10 h-10 text-bluedoor mb-3" />
                  <h4 className="text-base md:text-lg font-poppins font-semibold text-navy mb-2">
                    Open <span className="text-bluedoor font-bold">The Blue Door</span>
                  </h4>
                  <p className="text-body-sm text-charcoal">
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
