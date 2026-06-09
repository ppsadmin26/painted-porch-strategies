import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useDocumentSeo } from "@/hooks/useDocumentSeo";
import { ArrowRight, Flame, Mic, Heart } from "lucide-react";
import ClientLogoMarquee, { type LogoItem } from "@/components/pps/ClientLogoMarquee";
import { TierHeroSection } from "@/components/pps/TierHeroSection";
import speakingHero from "@/assets/heroes/speaking-hero.jpg";
import amyPhoto from "@/assets/team/amy-speaking-portrait.jpg";
import robPhoto from "@/assets/team/rob-hunter.jpg";
import sierraPhoto from "@/assets/team/sierra-ramm-cantrell.jpg";

const speakingLogos: LogoItem[] = [
  { name: "ProjectWorld", src: "/logos/projectworld.png", href: "https://www.pmbaconferences.com/" },
  { name: "Project Summit", src: "/logos/project-summit.png", href: "https://www.pmbaconferences.com/" },
  { name: "PMBA Global", src: "/logos/pmba-global.png", href: "https://www.pmbaconferences.com/" },
  { name: "Petra Coach", src: "/logos/petra.png", href: "https://petracoach.com/" },
  { name: "AtWork", src: "/logos/atwork.jpg", href: "https://www.atwork.com/" },
  { name: "Newbury Partners", src: "/logos/newbury-partners.jpg", href: "https://newburypartners.com/" },
  { name: "American Staffing Association", src: "/logos/asa.png", href: "https://americanstaffing.net/" },
  { name: "WIIN", src: "/logos/wiin.jpg", href: "https://www.linkedin.com/feed/update/urn:li:activity:6785998694400565248/" },
  { name: "NextUp Phoenix", src: "/logos/nextup-phoenix.png", href: "https://www.nextupisnow.org/regions/phoenix/" },
  { name: "Junior League of Phoenix", src: "/logos/junior-league-phoenix.png", href: "https://www.jlp.org/" },
  { name: "ASA Thrive Live", src: "/logos/asa-thrive-live.png", href: "https://learn.americanstaffing.net/products/thrivex" },
  { name: "Toastmasters International", src: "/logos/toastmasters.png", href: "https://www.toastmasters.org/" },
  { name: "Apex Systems", src: "/logos/apex-systems.png", href: "https://www.apexsystems.com/" },
  { name: "Staffing Industry Analysts", src: "/logos/sia.png", href: "https://www.staffingindustry.com/" },
  { name: "City of Chandler", src: "/logos/city-of-chandler.png", href: "https://www.chandleraz.gov" },
  { name: "AZ Tech Week", src: "/logos/az-tech-week.jpg", href: "https://www.azcommerce.com/az-tech-week/" },
  { name: "Co+Hoots", src: "/logos/co-hoots.png", href: "https://cohoots.com/" },
];

const speakers = [
  {
    name: "Amy Yackowski",
    badge: "Change Leadership",
    tagline: "When change feels chaotic, Amy brings calm, clarity, and courage.",
    description:
      "With her Stoic-infused leadership strategies, she partners with teams to align around purpose, lead through uncertainty, and create change that actually sticks.",
    photo: amyPhoto,
    specialties: ["Change Readiness", "Team Alignment", "Emotional Intelligence", "Organizational Transformation", "Operational Excellence", "Stoicism at Work"],
    href: "/speaking/amy",
    badgeColor: "bg-primary text-white",
    borderColor: "border-primary",
    icon: Flame,
  },
  {
    name: "Rob Hunter",
    badge: "Communication Mastery",
    tagline: "A #1-rated radio host turned communication strategist.",
    description:
      "Rob teaches leaders how to cut through the noise. His sessions equip you to say more with less, captivate your audience, and lead with crystal-clear messaging.",
    photo: robPhoto,
    specialties: ["Speaking with Impact", "Storytelling", "Executive Presence"],
    href: "/speaking/rob",
    badgeColor: "bg-muted-foreground text-white",
    borderColor: "border-muted-foreground",
    icon: Mic,
  },
  {
    name: "Sierra Cantrell",
    badge: "Mindful Resilience",
    tagline: "Sierra guides burnt-out teams back to balance with grace.",
    description:
      "With humor, heart, and science-backed tools, she guides people to reclaim their energy, focus, and joy, even in the midst of constant change.",
    photo: sierraPhoto,
    specialties: ["Burnout Recovery", "Mindfulness", "Team Well-being"],
    href: "/speaking/sierra",
    badgeColor: "bg-gold text-navy",
    borderColor: "border-gold",
    icon: Heart,
  },
];

export default function Speaking() {
  useDocumentSeo({
    title: "Speaking | Book Amy, Rob & Sierra | Painted Porch Strategies",
    description: "Three dynamic speakers. One Stoic mission. Book Amy, Rob, and Sierra for keynotes and workshops on change, leadership, and epic shIFt.",
    ogImage: speakingHero,
  });
  return (
    <div>
      {/* Hero */}
      <TierHeroSection
        customBadge={
          <span className="inline-block bg-gold/90 text-navy font-poppins font-semibold text-sm px-4 py-1.5 rounded-full mb-6 uppercase tracking-wider">
            Three Dynamic Speakers. One Stoic Mission.
          </span>
        }
        headline="Meet the Voices of Change"
        description="Empowering leaders and teams to navigate change, communicate with clarity, and stay resilient through it all."
        ctas={[
          { label: "Contact Us", href: "/contact?interest=speaking&message=I'm interested in booking a speaker for our event.", isPrimary: true },
        ]}
        background={{ type: "image", src: speakingHero }}
        overlayClass="bg-navy/50"
        minHeightClass="min-h-[60vh]"
      />

      {/* Philosophy Strip */}
      <section className="relative py-16 md:py-20 bg-navy/90 overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=1920&q=60')] bg-cover bg-center opacity-20" />
        <div className="container max-w-4xl mx-auto px-6 text-center relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Grounded in Stoicism. Built for Change.
          </h2>
          <p className="text-white/90 text-lg leading-relaxed">
            At Painted Porch Strategies, we partner with leaders to become change-ready, not just on paper, but in practice. Grounded in Stoic wisdom and driven by emotional intelligence, our speakers bring clarity, energy, and actionable strategies to every audience. Whether you're addressing burnout, navigating organizational transformation, or aligning your team, we design speaking experiences that create lasting impact.
          </p>
        </div>
      </section>

      {/* Speakers */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container max-w-6xl mx-auto px-6">
          <div className="space-y-20">
            {speakers.map((speaker, index) => {
              const isEven = index % 2 === 1;
              return (
                <div
                  key={speaker.name}
                  className={`flex flex-col ${isEven ? "md:flex-row-reverse" : "md:flex-row"} gap-10 items-center`}
                >
                  {/* Photo */}
                  <div className="md:w-2/5 flex-shrink-0">
                    <div className={`relative rounded-2xl overflow-hidden border-4 ${speaker.borderColor} shadow-xl`}>
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

                  {/* Content */}
                  <div className="md:w-3/5">
                    <span className={`inline-block ${speaker.badgeColor} font-poppins font-semibold text-xs px-3 py-1 rounded-full uppercase tracking-wider mb-4`}>
                      {speaker.badge}
                    </span>
                    <h2 className="text-3xl md:text-4xl font-bold text-navy mb-3">
                      {speaker.name}
                    </h2>
                    <p className="text-lg font-medium text-foreground mb-3 italic">
                      {speaker.tagline}
                    </p>
                    <p className="text-foreground leading-relaxed mb-6">
                      {speaker.description}
                    </p>

                    {/* Specialties */}
                    <div className="flex flex-wrap gap-3 mb-6">
                      {speaker.specialties.map((s) => (
                        <div
                          key={s}
                          className="flex items-center gap-2 bg-muted rounded-lg px-4 py-2.5"
                        >
                          <speaker.icon className="w-4 h-4 text-primary flex-shrink-0" />
                          <span className="text-sm font-medium text-navy">{s}</span>
                        </div>
                      ))}
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Combined Trust Signals */}
      <ClientLogoMarquee
        heading={<>Where We've Spoken</>}
        logos={speakingLogos}
        testimonials={[
          { quote: "[Combined testimonial placeholder #1]", name: "[Name]", title: "[Title]", organization: "[Organization]" },
          { quote: "[Combined testimonial placeholder #2]", name: "[Name]", title: "[Title]", organization: "[Organization]" },
          { quote: "[Combined testimonial placeholder #3]", name: "[Name]", title: "[Title]", organization: "[Organization]" },
        ]}
        showTestimonials={true}
      />

      {/* CTA */}
      <section className="py-16 md:py-24 bg-gradient-strategic text-white">
        <div className="container max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Bring Our Porch to Your Next Event
          </h2>
          <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
            Let's discuss how we can bring transformative content to your audience. Every keynote can be expanded into a hands-on workshop for lasting team impact.
          </p>
          <Link to="/contact?interest=speaking&message=I'm interested in booking a speaker for our event.">
            <Button className="bg-primary border-2 border-primary text-white hover:bg-white hover:text-primary text-lg py-5 px-8 transition-colors">
              Inquire About Speaking
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
