import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import ClientLogoMarquee from "@/components/pps/ClientLogoMarquee";
import { Button } from "@/components/ui/button";

// Team photos
import amyPhoto from "@/assets/team/amy-yackowski.png";
import sierraPhoto from "@/assets/team/sierra-ramm-cantrell.jpg";
import robPhoto from "@/assets/team/rob-hunter.jpg";

import teamHero from "@/assets/team/team-hero.jpg";
import teamCtaPuzzles from "@/assets/team/team-cta-puzzles.jpg";

// Certification badges
import workingGeniusBadge from "@/assets/certifications/working-genius.png";
import prosciChangeBadge from "@/assets/certifications/prosci-change-practitioner.png";
import scrumPsdBadge from "@/assets/certifications/scrum-psd.png";
import csiBadge from "@/assets/certifications/csi.png";
import changeNavigatorBadge from "@/assets/certifications/change-navigator.png";
import leanChangeAgentBadge from "@/assets/certifications/lean-change-agent.png";
import leanChangeAiBadge from "@/assets/certifications/lean-change-ai.png";
import mawFacilitatorBadge from "@/assets/certifications/maw-facilitator.png";
import discFacilitatorBadge from "@/assets/certifications/disc-facilitator.png";
import eq360Badge from "@/assets/certifications/eq360.png";
import emotionallyEffectiveBadge from "@/assets/certifications/emotionally-effective-leader.png";
import wpcRecommendedBadge from "@/assets/certifications/wpc-recommended.png";
import acmpMemberBadge from "@/assets/certifications/acmp-member.png";
import asaMemberBadge from "@/assets/certifications/asa-member.png";

const team = [
  {
    name: "Amy Yackowski",
    title: "Founder | Chief Evolution Officer | Organizational Shift Strategist",
    experience: "Over 20 Years Experience",
    description: "Amy has spent nearly two decades designing programs that connect people and processes to purpose. Her expertise spans organizational development, change management, and strategic transformation.",
    specialties: ["Organizational Design", "Change Management", "Strategic Planning", "Team Development"],
    color: "bg-purple-100",
    accent: "text-purple-700",
    photo: amyPhoto,
  },
  {
    name: "Sierra Ramm Cantrell",
    title: "Chief Joy Officer | M.B.A. - Mind-Body Architect | Mindfulness Sherpa",
    experience: "Over 15 Years Experience",
    description: "Sierra brings over a decade of experience teaching yoga and meditation, focused on authentic living and energy balance. She helps leaders develop the mindfulness practices essential for resilient leadership.",
    specialties: ["Mindfulness Training", "Yoga & Meditation", "Authentic Leadership", "Energy Management"],
    color: "bg-gold/10",
    accent: "text-gold",
    photo: sierraPhoto,
  },
  {
    name: "Rob Hunter",
    title: "Chief Storytelling Officer | M.C. - Master of Communication",
    experience: "Over 25 Years Experience",
    description: "As a 27-year award-winning radio broadcaster and #1 rated talk show host, Rob is a specialist in effective messaging and influence. He helps leaders craft compelling narratives that inspire action and drive change.",
    specialties: ["Strategic Messaging", "Public Speaking", "Influence & Persuasion", "Brand Voice"],
    color: "bg-muted",
    accent: "text-muted-foreground",
    photo: robPhoto,
  },
];

const certifications = [
  { name: "Working Genius Certified", badge: workingGeniusBadge },
  { name: "Prosci Change Practitioner", badge: prosciChangeBadge },
  { name: "Scrum.org PSD", badge: scrumPsdBadge },
  { name: "CSI Certified", badge: csiBadge },
  { name: "Change Navigator", badge: changeNavigatorBadge },
  { name: "Lean Change Agent", badge: leanChangeAgentBadge },
  { name: "Lean Change AI", badge: leanChangeAiBadge },
  { name: "MAW Facilitator", badge: mawFacilitatorBadge },
  { name: "DiSC Facilitator", badge: discFacilitatorBadge },
  { name: "EQ-360 Certified", badge: eq360Badge },
  { name: "Emotionally Effective Leader", badge: emotionallyEffectiveBadge },
  { name: "WPC Recommended", badge: wpcRecommendedBadge },
  { name: "ACMP Member", badge: acmpMemberBadge },
  { name: "ASA Member", badge: asaMemberBadge },
];

export default function OurTeam() {
  return (
    <div>
      {/* Hero */}
      <section className="relative isolate min-h-[70vh] flex items-center overflow-hidden bg-navy">
        <img
          src={teamHero}
          alt="Colorful threads converging into a unified braid, symbolizing teamwork"
          className="absolute inset-0 w-full h-full object-cover"
          width={1920}
          height={800}
        />
        <div className="absolute inset-0 z-[1] bg-navy/40" />
        <div className="container max-w-7xl mx-auto px-6 relative z-10 py-16 md:py-24">
          <div className="md:w-4/5">
            <div className="rounded-xl border border-white/10 bg-navy/35 p-8 backdrop-blur-sm md:p-12">
              <span className="inline-block bg-gold/90 text-navy font-poppins font-semibold text-sm px-4 py-1.5 rounded-full mb-6">
                Meet the Experts
              </span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                Our Team
              </h1>
              <p className="text-lead text-white/90 leading-relaxed max-w-3xl">
                Our experts bring decades of combined experience in leadership development, organizational change, and strategic communication.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Transformation Partners Intro */}
      <section className="py-16 md:py-20 bg-white">
        <div className="container max-w-4xl mx-auto px-6 text-center">
          <span className="inline-block bg-primary/10 text-primary font-poppins font-semibold text-sm px-4 py-1.5 rounded-full mb-6">
            Your Transformation Partners
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-navy mb-6">
            Meet the Painted Porch Team.
          </h2>
          <p className="text-lead text-foreground leading-relaxed italic">
            Many think of the Stoics as a bunch of boring old men, with stiff upper lips and no sense of fun. <span className="not-italic font-semibold">Not us.</span> We created Painted Porch Strategies because we believe <span className="font-semibold text-navy">work done right</span>, and <span className="font-semibold text-navy">for the right reasons, can be fun</span>. We'll show you how leaning on <span className="font-semibold text-navy">the principles of Stoicism</span> can not only <span className="font-semibold text-navy">be very rewarding</span>, but you'll discover simple ways to <span className="font-semibold text-navy">shift your mindset</span> from business and life as usual to one that is <span className="font-semibold text-navy">incredible</span> and <span className="font-semibold text-navy">expansive</span>. We'll show you just how <span className="font-semibold text-navy">freeing the concept of control can truly be</span>.
          </p>
        </div>
      </section>

      {/* Team */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8">
            {team.map((member, index) => {
              const isAmy = member.name === "Amy Yackowski";

              return (
                <div
                  key={index}
                  className={`flex flex-col ${isAmy ? "bg-purple/10 p-8 rounded-xl" : `${member.color} p-8 rounded-xl`}`}
                >
                  <div className="w-24 h-24 rounded-full mb-4 overflow-hidden">
                    <img
                      src={member.photo}
                      alt={member.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h3 className={`text-xl md:text-2xl font-poppins font-semibold mb-1 ${isAmy ? "text-purple" : "text-navy"}`}>
                    {member.name}
                  </h3>
                  <p className={`text-body-sm font-medium mb-1 ${isAmy ? "text-purple" : member.accent}`}>
                    {member.title}
                  </p>
                  <p className="text-caption text-muted-foreground mb-4">
                    {member.experience}
                  </p>
                  <p className="text-foreground text-body-sm leading-relaxed mb-4">
                    {member.description}
                  </p>
                  <div className="mt-auto">
                    <div className="flex flex-wrap gap-2 mb-4">
                      {member.specialties.map((specialty, i) => (
                        <span key={i} className="text-xs bg-white/60 px-2 py-1 rounded">
                          {specialty}
                        </span>
                      ))}
                    </div>
                    {member.name === "Amy Yackowski" && (
                      <Link
                        to="/amy"
                        className="text-sm font-semibold text-purple hover:underline flex items-center gap-1"
                      >
                        About Amy <ArrowRight className="w-4 h-4" />
                      </Link>
                    )}
                    {member.name === "Rob Hunter" && (
                      <Link
                        to="/rob"
                        className="text-sm font-semibold text-muted-foreground hover:underline flex items-center gap-1"
                      >
                        About Rob <ArrowRight className="w-4 h-4" />
                      </Link>
                    )}
                    {member.name === "Sierra Ramm Cantrell" && (
                      <Link
                        to="/sierra"
                        className="text-sm font-semibold text-gold hover:underline flex items-center gap-1"
                      >
                        About Sierra <ArrowRight className="w-4 h-4" />
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Trust Signals */}
      <ClientLogoMarquee />

      {/* Certifications */}
      <section className="py-12 md:py-16 bg-muted">
        <div className="container max-w-7xl mx-auto px-6">
          <div className="text-center mb-8">
            <h3 className="text-xl md:text-2xl font-bold text-navy">Certifications & Credentials</h3>
          </div>
          <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-7 gap-4 md:gap-6">
            {certifications.map((cert, index) => (
              <div
                key={index}
                className="bg-white rounded-lg p-3 flex items-center justify-center shadow-sm hover:shadow-md transition-shadow h-20 md:h-24"
                title={cert.name}
              >
                <img
                  src={cert.badge}
                  alt={cert.name}
                  className="max-h-14 md:max-h-18 max-w-full object-contain"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative isolate py-16 md:py-24 text-white overflow-hidden">
        <img
          src={teamCtaPuzzles}
          alt="Colorful puzzle pieces interlocking, symbolizing collaboration"
          className="absolute inset-0 w-full h-full object-cover"
          loading="lazy"
          width={1920}
          height={800}
        />
        <div className="absolute inset-0 bg-navy/60" />
        <div className="container max-w-4xl mx-auto px-6 text-center relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Work With Our Team
          </h2>
          <p className="text-lead text-white/90 mb-8 max-w-2xl mx-auto">
            Ready to start your transformation journey with experienced guides?
          </p>
          <Link to="/contact?interest=general&message=I'm interested in working with your team.">
            <Button className="bg-primary border-2 border-primary text-white hover:bg-white hover:text-primary text-lg py-5 px-8 transition-colors">
              Contact Us
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
