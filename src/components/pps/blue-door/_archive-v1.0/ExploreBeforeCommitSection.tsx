import { Link } from "react-router-dom";

export default function ExploreBeforeCommitSection() {
  return (
    <section className="py-16 md:py-24 bg-muted">
      <div className="container max-w-6xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-navy mb-4">
            Explore Before You Commit
          </h2>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          <Link to="/resources/free" className="bg-white p-6 rounded-xl hover:shadow-lg transition-all group flex flex-col">
            <h3 className="font-poppins font-semibold text-lg text-navy mb-2 group-hover:text-primary">
              Free Resources
            </h3>
            <p className="text-sm text-foreground mb-4">
              Get a taste of our frameworks and tools with our free resources.
            </p>
            <span className="text-primary font-semibold text-sm mt-auto">
              Browse Resources →
            </span>
          </Link>
          <Link to="/resources/blog" className="bg-white p-6 rounded-xl hover:shadow-lg transition-all group flex flex-col">
            <h3 className="font-poppins font-semibold text-lg text-navy mb-2 group-hover:text-primary">
              Read the Blog
            </h3>
            <p className="text-sm text-foreground mb-4">
              Explore our thinking on change, leadership, and transformation.
            </p>
            <span className="text-primary font-semibold text-sm mt-auto">
              Read Articles →
            </span>
          </Link>
          <Link to="/resources/youtube" className="bg-white p-6 rounded-xl hover:shadow-lg transition-all group flex flex-col">
            <h3 className="font-poppins font-semibold text-lg text-navy mb-2 group-hover:text-primary">
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
