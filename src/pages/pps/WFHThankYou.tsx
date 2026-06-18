import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Mail, CheckCircle } from "lucide-react";

// TODO: Update this URL when the new course platform link is ready
const COURSE_ACCESS_URL = "https://www.paintedporchstrategies.com/products/work-from-home-success-mini-course";

export default function WFHThankYou() {
  return (
    <div className="min-h-screen bg-background">
      <section className="bg-gradient-to-br from-navy via-navy to-purple text-white py-24 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-lime-green/20 mb-6">
            <CheckCircle className="w-12 h-12 text-lime-green" />
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-poppins font-bold mb-4">
            Congratulations,
            <br />
            <span className="text-gold">Work From Home Pro-in-Training!</span>
          </h1>
          <p className="text-lead text-white/90 mt-6">
            You're officially on the list. Time to don your cape.
          </p>
        </div>
      </section>

      <section className="py-16 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <div className="bg-white border-2 border-border rounded-2xl shadow-lg p-8 md:p-12">
            <Mail className="w-12 h-12 text-teal mx-auto mb-4" />
            <h2 className="text-3xl md:text-4xl font-poppins font-bold text-navy mb-4">
              Check Your Email
            </h2>
            <p className="text-lead text-charcoal mb-2">
              We just sent information on how to access your{" "}
              <strong className="text-raspberry">FREE</strong> Work From Home Mini-Course.
            </p>
            <p className="text-body-sm text-muted-foreground mb-8">
              (If you don't see it within a few minutes, check your spam or promotions folder.)
            </p>

            <div className="border-t border-border pt-6">
              <p className="text-charcoal mb-4">
                Already have a login? Jump straight in:
              </p>
              <a href={COURSE_ACCESS_URL} target="_blank" rel="noopener noreferrer">
                <Button className="bg-raspberry hover:bg-raspberry/90 text-white text-lg py-6 px-8 rounded-full">
                  Access Course
                </Button>
              </a>
            </div>
          </div>

          <div className="mt-12 text-center">
            <p className="text-charcoal mb-4">
              While you wait, explore more free resources:
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Link to="/resources/free">
                <Button variant="outline" className="rounded-full">Free Downloads</Button>
              </Link>
              <Link to="/resources/insights">
                <Button variant="outline" className="rounded-full">Read Insights</Button>
              </Link>
              <Link to="/">
                <Button variant="outline" className="rounded-full">Back to Home</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
