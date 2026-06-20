import { Link } from "react-router-dom";
import { ArrowRight, Sparkles } from "lucide-react";

interface MoreTopicsCalloutProps {
  /** Speakers to pre-filter on the /topics page. Omit for unfiltered link. */
  speakers?: string[];
  /** Name to use in the heading, e.g. "Amy". Omit for the generic Painted Porch variant. */
  speakerName?: string;
}

export function MoreTopicsCallout({ speakers, speakerName }: MoreTopicsCalloutProps) {
  const href = speakers && speakers.length > 0
    ? `/speaking/topics?speakers=${encodeURIComponent(speakers.join(","))}`
    : "/speaking/topics";

  const heading = speakerName
    ? `${speakerName} speaks about several other topics.`
    : "Explore every topic we speak about.";

  const body = speakerName
    ? `The topics above are ${speakerName}'s most-requested keynotes and workshops, but the full lineup goes deeper. Browse the complete catalog to find the perfect fit for your team or event.`
    : "Every keynote, workshop, and breakout topic across our team — filterable by theme and speaker. Find the right shIFt for your audience.";

  const ctaLabel = speakerName
    ? `Browse all of ${speakerName}'s topics`
    : "Browse all topics";

  return (
    <section className="py-12 md:py-16 bg-white">
      <div className="container max-w-4xl mx-auto px-6">
        <div className="relative rounded-2xl bg-gradient-to-br from-navy to-navy/90 text-white p-8 md:p-10 shadow-xl overflow-hidden">
          <div className="absolute -top-6 -right-6 w-32 h-32 rounded-full bg-gold/15 blur-2xl pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-6">
            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gold/20 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-gold" aria-hidden />
            </div>
            <div className="flex-1">
              <h3 className="text-2xl md:text-3xl font-poppins font-bold text-white mb-3">
                {heading}
              </h3>
              <p className="text-body text-white/85 mb-5">
                {body}
              </p>
              <Link
                to={href}
                className="inline-flex items-center gap-2 bg-gold text-navy font-poppins font-semibold px-6 py-3 rounded-lg hover:bg-gold/90 transition-colors focus-ring-on-dark"
              >
                {ctaLabel}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default MoreTopicsCallout;
