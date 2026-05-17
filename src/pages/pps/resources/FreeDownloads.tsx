import React from "react";
import { Link } from "react-router-dom";
import { Download, FileText, BarChart, Flame, BookOpen, Compass, Play, MessageCircle, Plane, Map, Megaphone, ClipboardCheck } from "lucide-react";
import { TierHeroSection } from "@/components/pps/TierHeroSection";
import { Button } from "@/components/ui/button";
import downloadsHero from "@/assets/heroes/downloads-hero.jpg";

const downloads = [
  {
    icon: Flame,
    title: "Burnout-Busting Resource Kit",
    description: "Spot the signs of burnout and take action — for yourself and your team. Includes videos, exercises, and practical tools for building resilience.",
    format: "Resource Page",
    color: "bg-raspberry/10",
    iconColor: "text-raspberry",
    href: "/burnout",
    ctaIcon: Flame,
    ctaLabel: "Access Now",
  },
  {
    icon: Play,
    title: "Kick the Habit Replay",
    description: "Free training replay with Amy Yackowski. Spot the thinking patterns holding change back and build a change-ready mindset.",
    format: "Video Replay",
    color: "bg-strategic/10",
    iconColor: "text-strategic",
    href: "/kick-the-habit",
    ctaIcon: Play,
    ctaLabel: "Access Now",
  },
  {
    icon: MessageCircle,
    title: "The 6 Communicator Styles Replay",
    description: "Free training replay with Amy Yackowski. Spot each person's dominant communicator style and craft messages that actually land.",
    format: "Video Replay",
    color: "bg-primary/10",
    iconColor: "text-primary",
    href: "/6-communicator-styles",
    ctaIcon: MessageCircle,
    ctaLabel: "Access Now",
  },
  {
    icon: Plane,
    title: "From Passenger to Pilot Replay",
    description: "Free training replay with Sierra Ramm Cantrell. Simple tools to shift from auto-pilot to seizing the controls of your life and work.",
    format: "Video Replay",
    color: "bg-gold/10",
    iconColor: "text-gold",
    href: "/pilot-training",
    ctaIcon: Plane,
    ctaLabel: "Access Now",
  },
  {
    icon: Compass,
    title: "The Strategic Change Canvas",
    description: "A one-page planning tool to architect your next shIFt — surface the questions that matter before kickoff.",
    format: "PDF",
    color: "bg-lime/10",
    iconColor: "text-lime",
    href: "/change-canvas",
    ctaIcon: BookOpen,
    ctaLabel: "View Guide",
  },
  {
    icon: Map,
    title: "Change Readiness Roadmap",
    description: "A must-use planning worksheet to map your P.A.T.H.™ — Prepare, Align, Take Off, and Habit — before your next change initiative kicks off.",
    format: "Worksheet",
    color: "bg-teal/10",
    iconColor: "text-teal",
    href: "/change-roadmap",
    ctaIcon: BookOpen,
    ctaLabel: "Get Worksheet",
  },
  {
    icon: Megaphone,
    title: "4 Critical Steps for Effective Change Communication",
    description: "A must-use planning and action guide for crafting messaging that drives change understanding, clarity, confidence, and adoption.",
    format: "Guide",
    color: "bg-purple/10",
    iconColor: "text-purple",
    href: "/change-comms",
    ctaIcon: BookOpen,
    ctaLabel: "Get Guide",
  },
  {
    icon: ClipboardCheck,
    title: "Change-Ready Team Assessment",
    description: "A free team assessment (less than 10 minutes) to spot where your team is steady, where it's stretched, and where a small shIFt could make a big difference before your next change kicks off.",
    format: "Assessment",
    color: "bg-lime/10",
    iconColor: "text-lime",
    href: "/change-ready-team-assessment",
    ctaIcon: ClipboardCheck,
    ctaLabel: "Take Assessment",
  },
  {
    icon: ClipboardCheck,
    title: "Change-Ready Leader Assessment",
    description: "A free leader assessment (less than 10 minutes) to spot where you're steady, where you're stretched, and where a small shIFt in your leadership could make a big difference before your next change kicks off.",
    format: "Assessment",
    color: "bg-lime/10",
    iconColor: "text-lime",
    href: "/change-ready-leader-assessment",
    ctaIcon: ClipboardCheck,
    ctaLabel: "Take Assessment",
  },
  {
    icon: ClipboardCheck,
    title: "Your Elemental Style Assessment",
    description: "A free, less-than-5-minute assessment to discover your natural communication and collaboration style: how you show up, where you shine, and how you connect best with others.",
    format: "Assessment",
    color: "bg-purple/10",
    iconColor: "text-purple",
    href: "/elemental-style-assessment",
    ctaIcon: ClipboardCheck,
    ctaLabel: "Take Assessment",
  },
  {
    icon: ClipboardCheck,
    title: "Team Health Assessment",
    description: "A free, quick pulse-check on the health of your team. See where your team is strong, where it's strained, and where small shIFts could unlock big improvements.",
    format: "Assessment",
    color: "bg-teal/10",
    iconColor: "text-teal",
    href: "/team-health-assessment",
    ctaIcon: ClipboardCheck,
    ctaLabel: "Take Assessment",
  },
  {
    icon: BookOpen,
    title: "The Stractical Leader Guide",
    description: "A quick-hit blueprint for managers ready to move beyond execution into the integration zone where strategy meets action.",
    format: "PDF",
    color: "bg-gold/10",
    iconColor: "text-gold",
    href: "/resources/stractical-mini",
    ctaIcon: BookOpen,
    ctaLabel: "View Guide",
  },
  {
    icon: BookOpen,
    title: "The Stoic Leader Field Guide",
    description: "An introduction to applying timeless Stoic principles in modern leadership. Daily practices, reflection prompts, and practical tools to lead with clarity, courage, and calm.",
    format: "PDF",
    color: "bg-gold/10",
    iconColor: "text-gold",
    href: "/stoic-field-guide",
    ctaIcon: BookOpen,
    ctaLabel: "Get Guide",
  },
];

export default function FreeDownloads() {
  return (
    <div>
      {/* Hero */}
      <TierHeroSection
        customBadge={
          <span className="inline-block bg-lime/90 text-navy font-poppins font-semibold text-sm px-4 py-1.5 rounded-full mb-6">
            Free Resources
          </span>
        }
        headline="Free Resources & Guides"
        description="Practical tools, templates, and frameworks to support your transformation journey."
        ctas={[
          { label: "Browse All", href: "#downloads", isAnchor: true, isPrimary: true },
        ]}
        background={{ type: "image", src: downloadsHero }}
        overlayClass="bg-navy/50"
        minHeightClass="min-h-[60vh]"
      />

      {/* Downloads Grid */}
      <section id="downloads" className="py-16 md:py-24 bg-white">
        <div className="container max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-8">
            {downloads.map((download, index) => {
              const CtaIcon = download.ctaIcon ?? Download;
              const ctaLabel = download.ctaLabel ?? "Download Free";
              return (
                <div
                  key={index}
                  className={`${download.color} p-8 rounded-xl border-l-4 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 ${
                    download.iconColor.replace('text-', 'border-')
                  }`}
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div className={`p-3 rounded-lg bg-white/60 ${download.iconColor}`}>
                      <download.icon className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{download.format}</span>
                      <h3 className="text-xl md:text-2xl font-poppins font-semibold text-navy mt-1">
                        {download.title}
                      </h3>
                    </div>
                  </div>
                  <p className="text-foreground mb-6 text-sm leading-relaxed pl-[4.5rem]">
                    {download.description}
                  </p>
                  <div className="pl-[4.5rem]">
                    {download.href ? (
                      <Link to={download.href}>
                        <Button className="bg-navy border-2 border-navy text-white hover:bg-transparent hover:text-navy transition-colors">
                          <CtaIcon className="w-4 h-4 mr-2" />
                          {ctaLabel}
                        </Button>
                      </Link>
                    ) : (
                      <Button className="bg-navy border-2 border-navy text-white hover:bg-transparent hover:text-navy transition-colors">
                        <CtaIcon className="w-4 h-4 mr-2" />
                        {ctaLabel}
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
