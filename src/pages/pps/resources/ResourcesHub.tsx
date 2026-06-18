import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Download, BookOpen, Youtube, Mic, HelpCircle, ArrowRight } from "lucide-react";
import { TierHeroSection } from "@/components/pps/TierHeroSection";
import resourcesHero from "@/assets/heroes/resources-hero.jpg";

const resourceCategories = [
  {
    icon: Download,
    title: "Free Resources",
    description: "Playbooks, templates, and frameworks to accelerate your change journey.",
    href: "/resources/free",
    color: "bg-lime/10",
    iconColor: "text-lime",
    cta: "Browse Resources",
  },
  {
    icon: BookOpen,
    title: "Insights",
    description: "Insights on change, leadership, and organizational transformation.",
    href: "/resources/insights",
    color: "bg-primary/10",
    iconColor: "text-primary",
    cta: "Read Insights",
  },
  {
    icon: Youtube,
    title: "YouTube",
    description: "Video content, tutorials, and conversations on leadership topics.",
    href: "/resources/youtube",
    color: "bg-raspberry/10",
    iconColor: "text-raspberry",
    cta: "Watch Videos",
  },
  {
    icon: HelpCircle,
    title: "FAQ",
    description: "Answers to common questions about our P.A.T.H.ways, partnerships, and approach.",
    href: "/resources/faq",
    color: "bg-gold/10",
    iconColor: "text-gold",
    cta: "Browse FAQ",
  },
];

export default function ResourcesHub() {
  return (
    <div>
      {/* Hero */}
      <TierHeroSection
        customBadge={
          <span className="inline-block bg-gold/90 text-navy font-poppins font-semibold text-sm px-4 py-1.5 rounded-full mb-6">
            Resources
          </span>
        }
        headline="Tools & Insights for Your Journey"
        description="Free resources, thought leadership, and media to support your transformation journey."
        ctas={[
          { label: "Browse Free Resources", href: "/resources/free", isPrimary: true },
        ]}
        background={{ type: "image", src: resourcesHero }}
        overlayClass="bg-navy/50"
        minHeightClass="min-h-[60vh]"
      />

      {/* Resource Categories */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-8">
            {resourceCategories.map((category, index) => (
              <Link key={index} to={category.href} className="group">
                <div className={`${category.color} p-8 rounded-xl transition-all hover:shadow-lg h-full`}>
                  <category.icon className={`w-12 h-12 ${category.iconColor} mb-4`} />
                  <h3 className="text-xl md:text-2xl font-poppins font-semibold text-navy mb-3">
                    {category.title}
                  </h3>
                  <p className="text-foreground mb-6 leading-relaxed">
                    {category.description}
                  </p>
                  <span className="inline-flex items-center text-primary font-semibold group-hover:underline">
                    {category.cta} <ArrowRight className="ml-2 w-4 h-4" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Content */}
      <section className="py-16 md:py-24 bg-muted">
        <div className="container max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-navy mb-4">
              Featured Content
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <span className="text-sm font-medium text-primary">Insights</span>
              <h3 className="text-xl md:text-2xl font-poppins font-semibold text-navy mt-2 mb-3">
                Implementation Comes Last
              </h3>
              <p className="text-body-sm text-foreground mb-4">
                The biggest mistake in organizational change? Jumping to implementation before building readiness.
              </p>
              <Link to="/resources/insights/implementation-comes-last" className="text-primary font-semibold text-sm hover:underline">
                Read More →
              </Link>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <span className="text-sm font-medium text-lime">Download</span>
              <h3 className="text-xl md:text-2xl font-poppins font-semibold text-navy mt-2 mb-3">
                Shift Readiness Playbook
              </h3>
              <p className="text-body-sm text-foreground mb-4">
                Our comprehensive guide to assessing and building organizational change-readiness.
              </p>
              <Link to="/resources/free" className="text-primary font-semibold text-sm hover:underline">
                Download Free →
              </Link>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <span className="text-sm font-medium text-raspberry">Video</span>
              <h3 className="text-xl md:text-2xl font-poppins font-semibold text-navy mt-2 mb-3">
                Stoic Leadership Principles
              </h3>
              <p className="text-body-sm text-foreground mb-4">
                Introduction to applying Stoic philosophy in modern business leadership.
              </p>
              <Link to="/resources/youtube" className="text-primary font-semibold text-sm hover:underline">
                Watch Now →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="py-16 md:py-24 bg-gradient-strategic text-white">
        <div className="container max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Get Insights Delivered
          </h2>
          <p className="text-lead text-white/90 mb-8 max-w-2xl mx-auto">
            Subscribe to receive our latest thinking on change-readiness, leadership development, and organizational transformation.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              aria-label="Email address for newsletter" placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-lg text-navy focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <Button className="bg-primary border-2 border-primary text-white hover:bg-white hover:text-primary py-3 px-6 transition-colors">
              Subscribe
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
