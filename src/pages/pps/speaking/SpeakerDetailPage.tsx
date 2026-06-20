import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { PPSBreadcrumb } from "@/components/pps/PPSBreadcrumb";
import { TierHeroSection } from "@/components/pps/TierHeroSection";
import ClientLogoMarquee from "@/components/pps/ClientLogoMarquee";
import { useSpeakerTopics } from "@/hooks/useSpeakerTopics";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

export interface SpeakingTopic {
  title: string;
  description: string;
  image?: string;
  /** Optional kebab-case slug for deep-linking via #topic-{slug}. */
  slug?: string;
}

export interface SpeakerData {
  /** Optional. When set, topics are read from path_finder_offerings for this
   *  facilitator (Amy / Rob / Sierra) so admin edits in /admin/offerings
   *  propagate here automatically. The hardcoded `topics` array is used as a
   *  fallback while the query loads or if the DB returns nothing. */
  facilitatorKey?: string;
  name: string;
  firstName: string;
  title: string;
  seriesName: string;
  heroBadgeLabel?: string;
  seriesIntro: string;
  bio: string[];
  closingLine: string;
  photo: string;
  topics: SpeakingTopic[];
  outcomesHeading: string;
  outcomesIntro: string;
  outcomes: string[];
  outcomesClosing: string;
  workshopHeading: string;
  workshopIntro: string;
  workshopDetails: string[];
  workshopClosing: string;
  themeColor: string; // tailwind border/accent class
  badgeColor: string; // pill bg class
  icon: LucideIcon;
  trustSignals?: {
    heading?: ReactNode;
    logos?: { name: string; src: string; href?: string }[];
    testimonials?: { quote: string; name: string; title: string; organization: string }[];
  };
}

export default function SpeakerDetailPage({ speaker }: { speaker: SpeakerData }) {
  const dbTopics = useSpeakerTopics(speaker.facilitatorKey ?? "");
  const topics =
    speaker.facilitatorKey && dbTopics && dbTopics.length > 0
      ? dbTopics
      : speaker.topics;
  return (
    <div>
      {/* Breadcrumb */}
      <PPSBreadcrumb
        segments={[
          { label: "Speaking", href: "/speaking" },
          { label: speaker.firstName },
        ]}
      />

      {/* Hero */}
      <TierHeroSection
        customBadge={
          <span className={`inline-block ${speaker.badgeColor} font-poppins font-semibold text-xs px-4 py-1.5 rounded-full uppercase tracking-wider mb-6`}>
            {speaker.heroBadgeLabel || "From Static to Signal"}
          </span>
        }
        headline={speaker.seriesName}
        description={speaker.seriesIntro}
        ctas={[
          { label: "Inquire About Speaking", href: "/contact?interest=speaking&message=I'm interested in booking a speaker for our event.", isPrimary: true },
          { label: "All Speakers", href: "/speaking" },
        ]}
        background={{ type: "image", src: speaker.photo }}
        overlayClass="bg-navy/50"
        minHeightClass="min-h-[60vh]"
      />

      {/* Outcomes Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container max-w-4xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-navy mb-6 text-center">
            {speaker.outcomesHeading}
          </h2>
          <p className="text-body text-foreground leading-relaxed text-center mb-8 max-w-3xl mx-auto">
            {speaker.outcomesIntro}
          </p>
          <div className="space-y-4 max-w-2xl mx-auto mb-8">
            {speaker.outcomes.map((outcome, i) => (
              <div key={i} className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <p className="text-body text-foreground">{outcome}</p>
              </div>
            ))}
          </div>
          <p className="text-body text-center font-semibold text-navy italic">
            {speaker.outcomesClosing}
          </p>
        </div>
      </section>

      {/* Bio Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row gap-12 items-center">
            {/* Photo */}
            <div className="md:w-2/5 flex-shrink-0">
              <div className={`rounded-2xl overflow-hidden border-4 ${speaker.themeColor} shadow-xl`}>
                <img
                  src={speaker.photo}
                  alt={speaker.name}
                  className="w-full h-auto object-cover aspect-[4/5]"
                  loading="lazy"
                  width={640}
                  height={800}
                />
              </div>
            </div>

            {/* Bio */}
            <div className="md:w-3/5">
              <span className="text-sm text-muted-foreground font-medium uppercase tracking-wider">
                {speaker.title}
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-navy mt-2 mb-6">
                Meet {speaker.name}
              </h2>
              {speaker.bio.map((paragraph, i) => (
                <p key={i} className="text-body text-foreground leading-relaxed mb-4">
                  {paragraph}
                </p>
              ))}
              <p className="text-body font-semibold text-navy italic">{speaker.closingLine}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Speaking Topics Grid */}
      <section className="py-16 md:py-24 bg-muted">
        <div className="container max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-navy mb-4">
              What {speaker.firstName} Loves to Speak About
            </h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {speaker.topics.map((topic, i) => (
              <div
                key={i}
                id={topic.slug ? `topic-${topic.slug}` : undefined}
                className={`bg-white rounded-xl border-l-4 ${speaker.themeColor} hover:shadow-lg transition-shadow overflow-hidden flex flex-col scroll-mt-24`}
              >
                {/* Image placeholder */}
                <div className="w-full aspect-[16/9] bg-muted flex items-center justify-center">
                  {topic.image ? (
                    <img src={topic.image} alt={topic.title} className="w-full h-full object-cover" loading="lazy" />
                  ) : (
                    <div className="text-muted-foreground/40 text-sm font-medium">Image Placeholder</div>
                  )}
                </div>
                <div className="p-6">
                  <h3 className="text-xl md:text-2xl font-poppins font-semibold text-navy mb-3 uppercase">
                    {topic.title}
                  </h3>
                  <p className="text-body -sm text-foreground leading-relaxed">
                    {topic.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Signals / Where They've Spoken */}
      {speaker.trustSignals && (
        <ClientLogoMarquee
          heading={speaker.trustSignals.heading || <>Where {speaker.firstName} Has Spoken</>}
          logos={speaker.trustSignals.logos}
          testimonials={speaker.trustSignals.testimonials}
          showTestimonials={!!speaker.trustSignals.testimonials?.length}
        />
      )}

      {/* Workshop Follow-Up */}
      <section className="py-16 md:py-24 bg-muted">
        <div className="container max-w-4xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-navy mb-4 text-center">
            {speaker.workshopHeading}
          </h2>
          <p className="text-body text-foreground leading-relaxed text-center mb-8 max-w-3xl mx-auto">
            {speaker.workshopIntro}
          </p>
          <div className="bg-white rounded-xl p-8 shadow-sm mb-8">
            <p className="text-body font-semibold text-navy mb-4">Each session includes:</p>
            <div className="space-y-3">
              {speaker.workshopDetails.map((detail, i) => (
                <div key={i} className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-lime mt-0.5 flex-shrink-0" />
                  <p className="text-body text-foreground -sm">{detail}</p>
                </div>
              ))}
            </div>
          </div>
          <p className="text-body text-center font-semibold text-navy italic">
            {speaker.workshopClosing}
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-24 bg-gradient-strategic text-white">
        <div className="container max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Book {speaker.firstName} for Your Event
          </h2>
          <p className="text-body text-white/90 mb-8 max-w-2xl mx-auto">
            Every keynote can be expanded into a half-day or full-day workshop for deeper, lasting team impact.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/contact?interest=speaking&message=I'm interested in booking a speaker for our event.">
              <Button className="bg-primary border-2 border-primary text-white hover:bg-white hover:text-primary text-lg py-5 px-8 transition-colors">
                Inquire About Speaking
              </Button>
            </Link>
            <Link to="/speaking">
              <Button variant="outline" className="bg-transparent border-white text-white hover:bg-white hover:text-navy text-lg py-5 px-8 transition-colors">
                All Speakers <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
