import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Clock, ExternalLink, ArrowLeft } from "lucide-react";
import { PPSBreadcrumb } from "@/components/pps/PPSBreadcrumb";
import { FAQSection } from "@/components/pps/FAQSection";
import { LaunchListCTA } from "@/components/pps/LaunchListCTA";
import { igniteFaqCategories } from "./igniteFaqs";

import courseRadicalMindfulness from "@/assets/courses/radical-mindfulness.jpg";
import courseMasterYourMessage from "@/assets/courses/master-your-message.jpg";
import courseExtraordinaryTeams from "@/assets/courses/extraordinary-teams.jpg";
import courseLeadingChange from "@/assets/courses/leading-change.jpg";

const courses = [
  {
    title: "Radical Mindfulness",
    tagline: "Ground Preparation for Strategic Leadership",
    description: "Leaders can't architect transformation while constantly reactive. This 8-module program builds mindfulness practices that create strategic capacity and present-moment leadership under pressure.",
    format: "8 modules | Video lessons + guided practices | Lifetime access",
    investment: "$697",
    link: "/radical-mindfulness",
    color: "bg-gold/10",
    borderColor: "border-gold",
    pillColor: "bg-gold text-white",
    pill: "Resilience & Wellbeing",
    textColor: "text-gold",
    buttonClasses: "border-gold text-gold hover:bg-gold hover:text-white",
    image: courseRadicalMindfulness,
    internal: true,
  },
  {
    title: "Master Your Message",
    tagline: "Communication & Influence for Transformation Leaders",
    description: "Great ideas don't land without clear communication. This 8-module program teaches strategic communication frameworks that create clarity, alignment, and stakeholder buy-in across organizational boundaries.",
    format: "8 modules | Video lessons + communication templates | Lifetime access",
    investment: "$697",
    link: "/communication",
    color: "bg-foreground/10",
    borderColor: "border-foreground",
    pillColor: "bg-foreground text-white",
    pill: "Communication",
    textColor: "text-foreground",
    buttonClasses: "border-foreground text-foreground hover:bg-foreground hover:text-white",
    image: courseMasterYourMessage,
    internal: true,
  },
  {
    title: "Create Extraordinary Teams",
    tagline: "Team Collaboration & High-Performance Dynamics",
    description: "Skilled individuals don't automatically function as cohesive units. This 12-module program teaches the anatomy of high-performing teams, conflict navigation, and coalition-building for transformation.",
    format: "12 modules | Video lessons + team exercises | Lifetime access",
    investment: "$997",
    link: "/extraordinary-teams",
    color: "bg-primary/10",
    borderColor: "border-primary",
    pillColor: "bg-primary text-white",
    pill: "Team Dynamics",
    textColor: "text-primary",
    buttonClasses: "border-primary text-primary hover:bg-primary hover:text-white",
    image: courseExtraordinaryTeams,
    internal: true,
  },
  {
    title: "Leading Change",
    tagline: "Change Architecture & Phase Zero™ Strategic Foundations",
    description: "Change initiatives fail long before implementation when strategic architecture is missing. This 8-module program teaches P.A.T.H. framework, Phase Zero principles, and how to architect change.",
    format: "8 modules | Video lessons + strategic frameworks | Lifetime access",
    investment: "$697",
    link: "#",
    color: "bg-strategic/10",
    borderColor: "border-strategic",
    pillColor: "bg-strategic text-white",
    pill: "Change Leadership",
    textColor: "text-strategic",
    buttonClasses: "border-strategic text-strategic hover:bg-strategic hover:text-white",
    image: courseLeadingChange,
    comingSoon: true,
    launchSlug: "leading-change-course",
  },
];

const bundles = [
  {
    name: "Foundation Bundle",
    courses: "Radical Mindfulness + Master Your Message",
    price: "$1,197",
    savings: "Save $197",
  },
  {
    name: "Leadership Bundle",
    courses: "Create Extraordinary Teams + Leading Change",
    price: "$1,497",
    savings: "Save $297",
  },
  {
    name: "Complete IGNITE",
    courses: "All 4 Programs",
    price: "$2,497",
    savings: "Save $594",
  },
];

export default function IgniteCourses() {
  return (
    <div>
      <PPSBreadcrumb
        segments={[
          { label: "Partner", href: "/partner" },
          { label: "IGNITE", href: "/partner/ignite" },
          { label: "Self-Led Courses" },
        ]}
      />

      <section className="py-16 md:py-24 bg-white">
        <div className="container max-w-6xl mx-auto px-6">
          <Link
            to="/partner/ignite"
            className="inline-flex items-center gap-2 text-sm text-primary hover:underline mb-8"
          >
            <ArrowLeft className="w-4 h-4" /> Back to IGNITE Overview
          </Link>

          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-navy mb-4">
              Ignite New Capabilities...at Your Own Pace
            </h1>
            <p className="text-lg text-foreground max-w-3xl mx-auto">
              Transform how you lead with Phase Zero capacity on your schedule through our on-demand, self-paced courses. Learn frameworks and practices that teach you to architect change, communicate with clarity, cultivate resilience, and develop teams where everyone shines.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {courses.map((course, index) => (
              <div
                key={index}
                className={`${course.color} rounded-xl border-l-4 ${course.borderColor} transition-all hover:shadow-lg flex flex-col h-full overflow-hidden`}
              >
                <img src={course.image} alt={course.title} className="w-full h-48 object-cover" />
                <div className="p-8 flex flex-col flex-1">
                  <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${course.pillColor} self-start`}>
                    {course.pill}
                  </span>
                  <h2 className={`text-3xl md:text-4xl font-poppins font-bold ${course.textColor} mt-2 mb-2`}>
                    {course.title}
                  </h2>
                  <p className="text-sm font-semibold text-foreground/80 mb-4">{course.tagline}</p>
                  <p className="text-foreground mb-6 leading-relaxed flex-grow">{course.description}</p>
                  <div className="mt-auto">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                      <Clock className="w-4 h-4" />
                      {course.format}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className={`text-2xl font-bold ${course.textColor}`}>{course.investment}</span>
                      {course.comingSoon ? (
                        <div className="flex flex-col items-end gap-1">
                          <Button variant="outline" className={`${course.buttonClasses} transition-colors opacity-50 cursor-not-allowed`} disabled>
                            Coming Soon
                          </Button>
                          <Link to="/contact?scope=Yourself&interest=self-paced&message=I'm interested in joining the waitlist for an IGNITE course." className={`text-xs ${course.textColor} hover:underline`}>
                            Join the Waitlist →
                          </Link>
                        </div>
                      ) : course.internal ? (
                        <Link to={course.link}>
                          <Button variant="outline" className={`${course.buttonClasses} transition-colors`}>
                            Explore
                          </Button>
                        </Link>
                      ) : (
                        <a href={course.link} target="_blank" rel="noopener noreferrer">
                          <Button variant="outline" className={`${course.buttonClasses} transition-colors`}>
                            Explore <ExternalLink className="ml-2 w-4 h-4" />
                          </Button>
                        </a>
                      )}

                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Bundle Options */}
          <div className="bg-gold/10 p-8 rounded-xl">
            <h2 className="text-3xl md:text-4xl font-poppins font-bold text-navy mb-6 text-center">
              Bundle Options
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              {bundles.map((bundle, index) => (
                <div key={index} className="bg-white p-6 rounded-lg text-center">
                  <h3 className="text-xl md:text-2xl font-semibold text-navy mb-2">{bundle.name}</h3>
                  <p className="text-sm text-foreground mb-3">{bundle.courses}</p>
                  <p className="text-2xl font-bold text-navy mb-1">{bundle.price}</p>
                  <p className="text-sm text-lime font-medium">{bundle.savings}</p>
                </div>
              ))}
            </div>
            <div className="text-center mt-6">
              <Link to="/contact?scope=Yourself&interest=self-paced&message=I'm interested in IGNITE course bundles.">
                <Button className="bg-gold border-2 border-gold text-navy hover:bg-transparent hover:text-gold transition-colors">
                  Explore Bundles
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <FAQSection
        tierName="IGNITE"
        categories={igniteFaqCategories.filter(c => c.name === "Courses" || c.name === "General")}
      />
    </div>
  );
}
