import { Link } from "react-router-dom";

interface ExploreBeforeDecideSectionProps {
  /** Outer section background. "white" pairs with muted cards; "muted" pairs with white cards. */
  background?: "white" | "muted";
  /** Optional override for the Free Resources card description. */
  freeResourcesDescription?: string;
}

/**
 * Shared "Explore Before You Decide" resources section.
 *
 * Single source of truth — used on partner tier pages, the Blue Door landing,
 * the Start Here page, and anywhere else this trio of resource cards appears.
 * Do NOT duplicate this markup; import this component instead.
 */
export function ExploreBeforeDecideSection({
  background = "white",
  freeResourcesDescription = "Get a peek of our Porch frameworks and tools with our free resources.",
}: ExploreBeforeDecideSectionProps = {}) {
  const sectionBg = background === "muted" ? "bg-muted" : "bg-white";
  const cardBg = background === "muted" ? "bg-white" : "bg-muted";

  const cards = [
    {
      to: "/resources/free",
      title: "Free Resources",
      description: freeResourcesDescription,
      cta: "Browse Resources →",
    },
    {
      to: "/resources/insights",
      title: "Read Insights",
      description: "Explore our thinking on change, leadership, and transformation.",
      cta: "Read Insights →",
    },
    {
      to: "/resources/youtube",
      title: "Watch Videos",
      description: "See our approach in action through our video content.",
      cta: "Watch Videos →",
    },
  ];

  return (
    <section className={`py-16 md:py-24 ${sectionBg}`}>
      <div className="container max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-navy mb-4">
            Explore Before You Decide
          </h2>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {cards.map((card) => (
            <Link
              key={card.to}
              to={card.to}
              className={`${cardBg} p-6 rounded-xl hover:shadow-lg transition-all group flex flex-col`}
            >
              <h3 className="text-xl md:text-2xl font-poppins font-semibold text-navy mb-2 group-hover:text-primary">
                {card.title}
              </h3>
              <p className="text-sm text-foreground mb-4">{card.description}</p>
              <span className="text-primary font-semibold text-sm mt-auto">
                {card.cta}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export default ExploreBeforeDecideSection;
