import { useEffect, useMemo, useState, type SyntheticEvent } from "react";
import { useDocumentSeo } from "@/hooks/useDocumentSeo";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { CheckCircle, ArrowRight, Info } from "lucide-react";
import architectChangeThumb from "@/assets/workshops/architect-change-thumb.jpg";
import pillarsThumb from "@/assets/workshops/pillars-assessment-thumb.jpg";
import pathThumb from "@/assets/workshops/path-framework-thumb.jpg";
import resilienceThumb from "@/assets/workshops/change-resilience-thumb.jpg";
import leadershipOpThumb from "@/assets/workshops/leadership-operating-thumb.jpg";
import teamBuildingThumb from "@/assets/workshops/team-building-thumb.jpg";
import mindfulnessThumb from "@/assets/workshops/mindfulness-leadership-thumb.jpg";
import communicationThumb from "@/assets/workshops/communication-architecture-thumb.jpg";
import stoicThumb from "@/assets/workshops/stoic-leadership-thumb.jpg";
import { PPSBreadcrumb } from "@/components/pps/PPSBreadcrumb";
import { FAQSection, type FAQCategory } from "@/components/pps/FAQSection";
import { ParallaxCTA } from "@/components/pps/ParallaxCTA";
import { Eyebrow } from "@/components/pps/Eyebrow";
import { usePathFinderQuiz } from "@/components/pps/quiz/PathFinderQuizProvider";
import { BLUE_DOOR_PRICE_DISPLAY } from "@/config/blueDoor";


const workshopFaqCategories: FAQCategory[] = [
  {
    name: "Workshops",
    faqs: [
      {
        question: "Do we need the Blue Door Organizational Appraisal before a workshop?",
        answer: "The Blue Door Organizational Appraisal is required for all Phase Zero Strategic Workshops and Strategic Sprints. It's not required for our Leadership & Team Development Workshops, though many teams still find it valuable for context. Your Blue Door investment is credited toward any booked engagement.",
      },
      {
        question: "Can we do a workshop first, then decide on a Strategic Sprint?",
        answer: "Absolutely. Many teams start with a workshop to test fit, then progress to sprint if deeper partnership makes sense.",
      },
      {
        question: "What if our team is geographically distributed?",
        answer: "We facilitate virtual workshops effectively. In-person is ideal when possible, but not required.",
      },
    ],
  },
  {
    name: "General",
    faqs: [
      {
        question: "How is AMPLIFY different from IGNITE?",
        answer: "IGNITE is self-paced individual development. AMPLIFY is team-based learning (workshops, sprints, cohorts). IGNITE builds your capacity. AMPLIFY builds team or organizational capacity.",
      },
      {
        question: "What's included in the investment?",
        answer: "Pre-work, facilitation, frameworks/tools, post-workshop resources, and ongoing advisory sessions for questions and continued guidance.",
      },
    ],
  },
];

/**
 * Fallback thumbnails for every offering that can appear in either section.
 * Keyed by offering_key first; a keyword-based matcher covers rows whose key
 * isn't explicitly listed so newly-included workshops still get a themed image.
 */
const FALLBACK_THUMB: Record<string, string> = {
  // Phase Zero Strategic Workshops
  architectChange: architectChangeThumb,
  architectureOfOrganizationalShift: pillarsThumb,
  pathToLastingChange: pathThumb,
  cultivatingChangeResilience: resilienceThumb,
  leadershipOM: leadershipOpThumb,
  // Leadership & Team Development Workshops
  workshopCreateExtraordinaryTeams: teamBuildingThumb,
  radicalMindfulnessB2B: mindfulnessThumb,
  masterYourMessageB2B: communicationThumb,
  stoicismB2B: stoicThumb,
  // Additional workshop offerings (mapped to closest themed thumb)
  fromConflictToConnection: teamBuildingThumb,
  fromDysfunctionToDynamic: teamBuildingThumb,
  geniusAtWork: teamBuildingThumb,
  workingGenius: teamBuildingThumb,
  moveShakeInnovate: teamBuildingThumb,
  leadAtSpeed: leadershipOpThumb,
  goldilocks: leadershipOpThumb,
  fromPassengerToPilot: leadershipOpThumb,
  aiEiOh: leadershipOpThumb,
  changeForGood: resilienceThumb,
  drivingChange3Shifts: resilienceThumb,
  reignitingResilience: resilienceThumb,
  findingJoyAtWork: mindfulnessThumb,
  communicateWithStyle: communicationThumb,
  powerOfStory: communicationThumb,
  highFidelityCommunication: communicationThumb,
};

/** Keyword → thumbnail matcher used when offering_key isn't in FALLBACK_THUMB. */
const KEYWORD_THUMB: Array<[RegExp, string]> = [
  [/mindful/i, mindfulnessThumb],
  [/joy|wellbeing|well-being/i, mindfulnessThumb],
  [/resilien/i, resilienceThumb],
  [/communicat|message|story|voice/i, communicationThumb],
  [/stoic/i, stoicThumb],
  [/genius|team|dysfunction|conflict|connection|innovate/i, teamBuildingThumb],
  [/leader|pilot|operating|goldilocks|speed/i, leadershipOpThumb],
  [/p\.a\.t\.h|pathway|lasting change/i, pathThumb],
  [/pillar|architecture|foundation/i, pillarsThumb],
  [/architect|phase zero|strategic design/i, architectChangeThumb],
];

interface WorkshopCardRow {
  offering_key: string;
  name: string;
  anchor_id: string | null;
  image_url: string | null;
  blue_door_required: boolean;
  sort_order: number;
  workshop_card_challenge: string | null;
  workshop_card_description: string | null;
  workshop_card_format: string | null;
  workshop_card_investment: string | null;
  workshop_card_bullets: string[] | null;
}

/** Pick the best local fallback thumb for a row, ignoring image_url. */
function fallbackThumb(row: WorkshopCardRow): string {
  const byKey = FALLBACK_THUMB[row.offering_key];
  if (byKey) return byKey;
  const haystack = `${row.offering_key} ${row.name ?? ""}`;
  for (const [pattern, thumb] of KEYWORD_THUMB) {
    if (pattern.test(haystack)) return thumb;
  }
  return architectChangeThumb;
}

/**
 * Prefer image_url when present and non-empty (after trimming); otherwise use
 * the best-fit local fallback. Broken remote URLs are handled at render time
 * via <img onError> which swaps in the same fallback.
 */
function cardImage(row: WorkshopCardRow): string {
  const remote = row.image_url?.trim();
  return remote && remote.length > 0 ? remote : fallbackThumb(row);
}

function cardAnchor(row: WorkshopCardRow): string {
  return row.anchor_id || row.offering_key;
}

function handleImgError(
  event: SyntheticEvent<HTMLImageElement>,
  row: WorkshopCardRow,
) {
  const img = event.currentTarget;
  const fallback = fallbackThumb(row);
  if (img.src !== fallback && !img.dataset.fallbackApplied) {
    img.dataset.fallbackApplied = "true";
    img.src = fallback;
  }
}

export default function AmplifyWorkshops() {
  useDocumentSeo({
    title: "AMPLIFY Workshops | Painted Porch Strategies",
    description: "AMPLIFY workshops from Painted Porch Strategies: Architect Change, P.A.T.H.™ framework, leadership development, and team building — 1–3 day team engagements.",
    canonical: "/partner/amplify/workshops",
  });

  const { open: openQuiz } = usePathFinderQuiz();
  const [rows, setRows] = useState<WorkshopCardRow[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase
        .from("path_finder_offerings")
        .select(
          "offering_key, name, anchor_id, image_url, blue_door_required, sort_order, workshop_card_challenge, workshop_card_description, workshop_card_format, workshop_card_investment, workshop_card_bullets",
        )
        .eq("include_in_workshops", true)
        .order("sort_order", { ascending: true })
        .order("name", { ascending: true });
      if (cancelled) return;
      if (!error && data) setRows(data as WorkshopCardRow[]);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const phaseZero = useMemo(() => rows.filter((r) => r.blue_door_required), [rows]);
  const teamDev = useMemo(() => rows.filter((r) => !r.blue_door_required), [rows]);

  return (
    <div>
      <PPSBreadcrumb
        segments={[
          { label: "Partner", href: "/partner" },
          { label: "AMPLIFY", href: "/partner/amplify" },
          { label: "Team Workshops" },
        ]}
      />

      <section className="py-16 md:py-24 bg-white">
        <div className="container max-w-7xl mx-auto px-6">
          <Link
            to="/partner/amplify"
            className="inline-flex items-center gap-2 text-sm text-strategic hover:underline mb-8"
          >
            <ArrowRight className="w-4 h-4 rotate-180" /> Back to AMPLIFY Overview
          </Link>

          <div className="text-center mb-12">
            <Eyebrow variant="plain" tone="primary" as="p">AMPLIFY · Team Workshops</Eyebrow>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-navy mb-4">
              Workshops That Architect Your Next Sh<span className="text-strategic font-bold">IF</span>t
            </h1>
            <p className="text-body text-foreground max-w-2xl mx-auto">
              From Phase Zero strategy sessions to leadership and team development, our workshops align teams and build the capacity to lead change well.
            </p>
          </div>

          {/* Phase Zero Strategic Workshops */}
          {phaseZero.length > 0 && (
            <>
              <div className="text-center mb-8">
                <span className="inline-block bg-bluedoor/10 text-bluedoor font-poppins font-semibold text-sm px-4 py-1.5 rounded-full mb-4">
                  Blue Door Required
                </span>
                <h2 className="text-3xl md:text-4xl font-bold text-navy mb-3">
                  Phase Zero&trade; Strategic Workshops
                </h2>
                <p className="text-body text-foreground max-w-2xl mx-auto">
                  Design the architecture of your next transformation before you build it. These workshops align your leadership team around what you're authoring and why.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mb-8">
                {phaseZero.map((workshop) => {
                  const anchor = cardAnchor(workshop);
                  return (
                    <div key={workshop.offering_key} id={anchor} className="rounded-xl flex flex-col overflow-hidden border border-border scroll-mt-24">
                      <div className="p-6 flex flex-col flex-grow">
                        <div className="flex flex-col sm:flex-row sm:items-start gap-4 mb-3">
                          <img
                            src={cardImage(workshop)}
                            alt={workshop.name}
                            loading="lazy"
                            onError={(e) => handleImgError(e, workshop)}
                            className="w-full h-40 sm:w-28 sm:h-20 rounded-lg object-cover flex-shrink-0"
                          />
                          <div>
                            <h3 className="text-xl md:text-2xl font-poppins font-bold text-navy leading-tight mb-1">{workshop.name}</h3>
                            <div className="flex flex-wrap gap-2 text-sm">
                              {workshop.workshop_card_format && (
                                <>
                                  <span className="text-foreground font-medium">{workshop.workshop_card_format}</span>
                                  <span className="text-foreground">|</span>
                                </>
                              )}
                              {workshop.workshop_card_investment && (
                                <span className="text-lime font-semibold">{workshop.workshop_card_investment}</span>
                              )}
                            </div>
                          </div>
                        </div>
                        {workshop.workshop_card_challenge && (
                          <div className="mb-4 bg-raspberry/5 border border-raspberry/20 rounded-lg p-4">
                            <p className="text-base font-semibold text-raspberry mb-1">The Challenge:</p>
                            <p className="text-base text-foreground">{workshop.workshop_card_challenge}</p>
                          </div>
                        )}
                        {(workshop.workshop_card_bullets?.length ?? 0) > 0 && (
                          <div className="flex-grow">
                            <p className="text-base font-semibold text-navy mb-2">What You'll Walk Away With:</p>
                            <ul className="space-y-1">
                              {workshop.workshop_card_bullets!.map((item, i) => (
                                <li key={i} className="flex items-start gap-2">
                                  <CheckCircle className="w-3 h-3 text-lime flex-shrink-0 mt-1" />
                                  <span className="text-base text-foreground">{item}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Blue Door Callout */}
              <div className="bg-primary/5 border border-primary/20 rounded-xl p-6 md:pr-12 flex flex-col md:flex-row items-start md:items-center gap-6 mb-12">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Info className="w-5 h-5 text-bluedoor" />
                    <h3 className="text-xl md:text-2xl font-poppins font-semibold text-navy">Authoring Your Next Sh<span className="text-strategic font-bold">IF</span>t Begins At the <span className="text-bluedoor">Blue Door</span></h3>
                  </div>
                  <p className="text-body -sm text-foreground mb-2 mt-4">
                    The <span className="font-bold text-bluedoor">Blue Door</span> is our organizational appraisal (less than 30 minutes) that reveals where your business and leadership stands on the path to transformation so that you can lead with clarity and build with confidence.
                  </p>
                  <p className="text-body -sm text-foreground/70 italic mb-3">
                    Required for Phase Zero Strategic Workshops and all Strategic Sprints. Not required for Leadership &amp; Team Development Workshops.
                  </p>
                  <p className="text-body -sm text-foreground/70 italic mb-3">
                    The Blue Door investment will be credited toward any booked engagement.
                  </p>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="font-semibold text-navy">{BLUE_DOOR_PRICE_DISPLAY}</span>
                    <span className="text-foreground/70">|</span>
                    <span className="text-foreground/70">Less than 30 minutes</span>
                  </div>
                </div>
                <Link to="/blue-door">
                  <Button variant="outline" className="bg-transparent border-2 border-bluedoor text-bluedoor hover:bg-bluedoor hover:text-white transition-colors">
                    Get Started <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </>
          )}

          {/* Leadership & Team Development Workshops */}
          {teamDev.length > 0 && (
            <div id="leadership-team-development" className="mb-12 scroll-mt-24">
              <div className="text-center mb-8">
                <span className="inline-block bg-gold/10 text-gold font-poppins font-semibold text-sm px-4 py-1.5 rounded-full mb-4">
                  Ready to Book
                </span>
                <h2 className="text-3xl md:text-4xl font-bold text-navy mb-3">
                  Leadership & Team Development Workshops
                </h2>
                <p className="text-body text-foreground max-w-2xl mx-auto">
                  Build the capacity your organization needs to lead and adapt to change. These workshops strengthen the foundational skills that make transformation possible and the extraordinary achievable.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {teamDev.map((workshop) => {
                  const anchor = cardAnchor(workshop);
                  return (
                    <div
                      key={workshop.offering_key}
                      id={anchor}
                      className="rounded-xl border border-border p-6 flex flex-col scroll-mt-24"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start gap-4 mb-3">
                        <img
                          src={cardImage(workshop)}
                          alt={workshop.name}
                          loading="lazy"
                          onError={(e) => handleImgError(e, workshop)}
                          className="w-full h-40 sm:w-28 sm:h-20 rounded-lg object-cover flex-shrink-0"
                        />
                        <div>
                          <h3 className="text-xl md:text-2xl font-poppins font-bold text-navy leading-tight mb-1">{workshop.name}</h3>
                          <div className="flex flex-wrap gap-2 text-sm">
                            {workshop.workshop_card_format && (
                              <>
                                <span className="text-foreground font-medium">{workshop.workshop_card_format}</span>
                                <span className="text-foreground">|</span>
                              </>
                            )}
                            {workshop.workshop_card_investment && (
                              <span className="text-lime font-semibold">{workshop.workshop_card_investment}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      {workshop.workshop_card_description && (
                        <p className="text-base text-foreground mb-4">{workshop.workshop_card_description}</p>
                      )}
                      {(workshop.workshop_card_bullets?.length ?? 0) > 0 && (
                        <div className="flex-grow">
                          <p className="text-base font-semibold text-navy mb-2">What You'll Walk Away With:</p>
                          <ul className="space-y-1">
                            {workshop.workshop_card_bullets!.map((item, i) => (
                              <li key={i} className="flex items-start gap-2">
                                <CheckCircle className="w-3 h-3 text-lime flex-shrink-0 mt-1" />
                                <span className="text-base text-foreground">{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      <p className="text-body text-foreground/70 italic mt-4">No <span className="font-bold text-bluedoor">Blue Door</span> required</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="text-center mt-12 bg-navy text-white rounded-2xl p-6 md:p-8">
            <h3 className="text-xl md:text-2xl font-poppins font-bold text-white mb-3">
              Don&rsquo;t see exactly what you&rsquo;re looking for?
            </h3>
            <p className="text-body text-white/90 max-w-2xl mx-auto mb-3">
              The workshops above are a sample of what we run most often. We also offer other sessions across our core topic areas, and most can be delivered as a <Link to="/speaking" className="font-semibold text-gold hover:text-gold/80 underline underline-offset-2">keynote or speaking session</Link> or expanded into a <Link to="/speaking/topics" className="font-semibold text-gold hover:text-gold/80 underline underline-offset-2">workshop</Link>:
            </p>
            <p className="text-body text-white/90 max-w-2xl mx-auto mb-6">
              <span className="font-semibold text-gold">Change &amp; Innovation</span>
              <span className="text-white/50"> &middot; </span>
              <span className="font-semibold text-gold">Leadership &amp; Culture</span>
              <span className="text-white/50"> &middot; </span>
              <span className="font-semibold text-gold">Team Dynamics</span>
              <span className="text-white/50"> &middot; </span>
              <span className="font-semibold text-gold">Resilience &amp; Wellbeing</span>
              <span className="text-white/50"> &middot; </span>
              <span className="font-semibold text-gold">Stoicism &amp; Philosophy</span>
            </p>

            <p className="text-body text-white/90 max-w-2xl mx-auto mb-6">
              Take the P.A.T.H.way quiz so we can recommend the workshop or speaking session that best fits where you&rsquo;re headed, or contact us to talk through your topic.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                onClick={openQuiz}
                className="bg-gold text-navy hover:bg-gold/90 h-auto min-h-12 px-4 sm:px-8 py-3 text-base font-semibold whitespace-normal"
              >
                Take the P.A.T.H.way Quiz <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button
                asChild
                variant="outline"
                className="bg-transparent border-white text-white hover:bg-white hover:text-navy h-auto min-h-12 px-4 sm:px-8 py-3 text-base font-semibold whitespace-normal"
              >
                <Link to="/contact?scope=organization&interest=workshops&message=I'd like to discuss a workshop or speaking topic for our team.">
                  Contact Us to Talk It Through
                </Link>
              </Button>
            </div>
          </div>

        </div>
      </section>

      <FAQSection
        tierName="AMPLIFY"
        categories={workshopFaqCategories}
        subheadline="Common questions about AMPLIFY workshops"
      />

      {/* Final CTA */}
      <ParallaxCTA
        backgroundImage={architectChangeThumb}
        overlayTone="purple"
        headline={<>Ready to AMPLIFY Your Team&rsquo;s Next Sh<span className="text-white font-bold">IF</span>t?</>}
        description={
          <>
            Our workshops are co-designed around your context, your challenges, and your transformation goals.
            <br />
            <span className="font-semibold">Let&rsquo;s design the right experience for your team.</span>
          </>
        }
        actions={[
          {
            label: "Contact Us to Get Started",
            to: "/contact?scope=organization&interest=workshops&message=I'm interested in AMPLIFY workshops for our team.",
            variant: "primary",
          },
          { label: "Discover Your P.A.T.H.way", to: "/start-here", variant: "secondary" },
        ]}
        footnote={
          <Link to="/partner" className="text-white/80 hover:text-white underline">
            Explore All Partnership Options
          </Link>
        }
      />
    </div>
  );
}
