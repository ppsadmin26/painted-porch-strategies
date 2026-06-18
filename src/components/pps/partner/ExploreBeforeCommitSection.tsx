import { Link } from "react-router-dom";

export function ExploreBeforeCommitSection() {
  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="container max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-navy mb-4">
            Explore Before You Decide
          </h2>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          <Link to="/resources/free" className="bg-muted p-6 rounded-xl hover:shadow-lg transition-all group flex flex-col">
            <h3 className="text-xl md:text-2xl font-poppins font-semibold text-navy mb-2 group-hover:text-primary">
              Free Resources
            </h3>
            <p className="text-sm text-foreground mb-4">
              Get a peek of our Porch frameworks and tools with our free resources.
            </p>
            <span className="text-primary font-semibold text-sm mt-auto">
              Browse Resources →
            </span>
          </Link>
          <Link to="/resources/insights" className="bg-muted p-6 rounded-xl hover:shadow-lg transition-all group flex flex-col">
            <h3 className="text-xl md:text-2xl font-poppins font-semibold text-navy mb-2 group-hover:text-primary">
              Read Insights
            </h3>
            <p className="text-sm text-foreground mb-4">
              Explore our thinking on change, leadership, and transformation.
            </p>
            <span className="text-primary font-semibold text-sm mt-auto">
              Read Insights →
            </span>
          </Link>
          <Link to="/resources/youtube" className="bg-muted p-6 rounded-xl hover:shadow-lg transition-all group flex flex-col">
            <h3 className="text-xl md:text-2xl font-poppins font-semibold text-navy mb-2 group-hover:text-primary">
              Watch Videos
            </h3>
            <p className="text-sm text-foreground mb-4">
              See our approach in action through our video content.
            </p>
            <span className="text-primary font-semibold text-sm mt-auto">
              Watch Videos →
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}
