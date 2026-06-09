import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CheckCircle, ExternalLink, Calendar } from "lucide-react";
import { PPSBreadcrumb } from "@/components/pps/PPSBreadcrumb";
import { FAQSection } from "@/components/pps/FAQSection";
import brainEqIcon from "@/assets/icons/brain-eq.svg";
import LazyHeroVideo from "@/components/pps/LazyHeroVideo";
import eqHeroVideo from "@/assets/eq-hero.mp4.asset.json";
import eqModelImg from "@/assets/eq/eq-model.png";
import reportOverviewImg from "@/assets/eq/report-overview.png";
import reportLeadershipPotentialImg from "@/assets/eq/report-leadership-potential.png";
import reportLeaderBarImg from "@/assets/eq/report-leader-bar.png";
import reportActionPlanImg from "@/assets/eq/report-action-plan.png";
import reportAdditionalLeaderImg from "@/assets/eq/report-additional-leader.png";

const eqFaqCategories = [
  {
    name: "EQ-i 2.0",
    faqs: [
      {
        question: "Is the EQ-i 2.0 assessment for me?",
        answer:
          "The EQ-i 2.0 Assessment is for anyone 18 years of age or over who is seeking clarity and awareness of how you perceive and express yourself, develop and maintain social relationships, cope with challenges, and use emotional information in an effective and meaningful way. While you may not be in an official Leader role, each of us leads and influences ourselves and others in how we show up, share our thoughts and ideas, collaborate, solve problems, and manage stress.",
      },
      {
        question: "How long is the assessment?",
        answer:
          "The online EQ-i 2.0 Assessment includes 133 statements where you will note the frequency with which you think, feel, or act for each one. The average time it takes to complete is between 20–30 minutes, and it must be completed in one session, but there is no imposed time limit. There are no 'good' or 'bad' choices or 'right' or 'wrong' answers.",
      },
      {
        question: "How long will I have access to take the assessment?",
        answer:
          "Shortly after purchase (within 24–48 hours), you will receive an email with a link to access and complete your EQ-i 2.0 assessment. This link will remain active for 30 days. If you are unable to complete the assessment within that time, simply email support@paintedporchstrategies.com to request a new link.",
      },
      {
        question: "What happens after I complete the assessment?",
        answer:
          "Once you've completed the assessment, you will receive a follow-up email to schedule your 45-minute debrief call with our team. You will receive a copy of your report immediately prior to your scheduled session. During your call, we'll review your results, answer any questions, and work with you to design your EQ Action Plan.",
      },
      {
        question: "How does the EQ-i 2.0 compare to other EQ assessments?",
        answer:
          "For almost 20 years, consultants and organizations have trusted the science that underpins the EQ-i 2.0 to improve human performance. The EQ-i was the first scientifically validated measure of emotional intelligence and was developed through an extensive process ensuring its content reflects the model and scope of EI, truly measures the concept, and has a structure that is dependable and applicable across a wide variety of contexts.",
      },
      {
        question: "Do you offer other EQ-i Assessments or Training?",
        answer:
          "Yes! Depending on your needs, there are six report options available including individual, group/team, higher education, and workplace or leadership 360s. Reach out to us to discuss each type and determine the best fit.",
      },
    ],
  },
];

const reportIncludes = [
  {
    tag: "BUILD AWARENESS",
    title: "Your EI Summary",
    image: reportOverviewImg,
    description:
      "Your personalized report includes detailed information about your scores across 5 composites (key EI themes) and 15 competencies (behaviors) of Emotional Intelligence. You'll also receive a summary outlining your:",
    items: [
      "Overall Total EI score",
      "3 Highest-Scoring Competencies",
      "3 Lowest-Scoring Competencies",
    ],
    note: "The summary lays the foundation for building awareness and understanding of how your emotions impact and influence your perceptions, interactions and actions.",
  },
  {
    tag: "CREATE IMPACT",
    title: "Your Leadership Potential",
    image: reportLeadershipPotentialImg,
    description:
      "The EQ-i 2.0 model measures and provides insight in four common leadership impact areas:",
    items: ["Authenticity", "Coaching", "Insight", "Innovation"],
    note: "Whether in an official leadership role or to level up your influence, those who embody these leadership-impacted competencies are more likely to increase work satisfaction, create trust, and foster organizational commitment and loyalty.",
  },
  {
    tag: "FIND BALANCE",
    title: "Your E.Q. Details",
    image: reportLeaderBarImg,
    description:
      "In addition to your summary and highest/lowest scores, you will receive a detailed breakdown for each competency (subscale), including:",
    items: [
      "Your Score Meaning",
      "Impacts",
      "Strategies for Action",
      "How to Balance Your EI",
    ],
  },
  {
    tag: "DEVELOP & GROW",
    title: "Your Action Plan",
    image: reportActionPlanImg,
    description:
      "As part of your 45-minute debrief call, we'll work with you to develop your EI Action Plan to chart your path toward achieving your EI goals. You'll identify:",
    items: [
      "Your top three EI skills or behaviors to develop",
      "Three EQ qualities you'd like to achieve",
      "Timeframe",
      "Success measures",
      "Additional Support or Resources needed",
    ],
  },
  {
    tag: "LEAD WITH KNOWLEDGE",
    title: "Additional Leadership Guidance",
    image: reportAdditionalLeaderImg,
    description:
      "In addition to your personalized report and action plan, you'll also receive further guidance on effective EI-driven leadership in areas such as:",
    items: [
      "Conflict Management",
      "Resilience & Work/Life Harmony",
      "Leading a Multigenerational Workforce",
    ],
  },
];

const stats = [
  {
    type: "ring" as const,
    value: 61,
    suffix: "%",
    compare: 13,
    color: "raspberry",
    headline: "More Innovative",
    text: "of people with highly empathetic leaders report often or always being innovative at work",
    footnote: "vs. only 13% with less empathetic leaders",
  },
  {
    type: "bar" as const,
    value: 70,
    suffix: "%",
    color: "gold",
    headline: "Engagement Variance",
    text: "of the variance in employee engagement is driven by Effective Communication & Flexibility",
  },
  {
    type: "range" as const,
    low: 15,
    high: 20,
    suffix: "%",
    color: "lime",
    headline: "Revenue Outperformance",
    text: "revenue target outperformance by teams led by high-EI leaders",
  },
];

const colorMap: Record<string, { text: string; bg: string; ring: string; bgSoft: string; hex: string }> = {
  raspberry: { text: "text-raspberry", bg: "bg-raspberry", ring: "stroke-raspberry", bgSoft: "bg-raspberry/10", hex: "#DB0043" },
  gold: { text: "text-gold", bg: "bg-gold", ring: "stroke-gold", bgSoft: "bg-gold/10", hex: "#E8A231" },
  lime: { text: "text-lime", bg: "bg-lime", ring: "stroke-lime", bgSoft: "bg-lime/10", hex: "#70A300" },
};


export default function EQAssessment() {
  return (
    <div>
      <PPSBreadcrumb
        segments={[
          { label: "Partner", href: "/partner" },
          { label: "IGNITE", href: "/partner/ignite" },
          { label: "Assessments", href: "/partner/ignite/assessments" },
          { label: "EQ-i 2.0" },
        ]}
      />

      {/* Hero */}
      <section className="relative py-20 md:py-28 text-white overflow-hidden isolate min-h-[60vh] flex items-center">
        <LazyHeroVideo
          slotKey="eq-hero"
          posterUrl={eqHeroVideo.url}
          fallbackVideoUrl={eqHeroVideo.url}
          className="absolute inset-0 w-full h-full"
        />
        {/* Readability overlay */}
        <div className="absolute inset-0 bg-navy/55" />
        <div className="container max-w-5xl mx-auto px-6 relative z-10 text-center w-full">
          <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm rounded-full px-4 py-2 mb-6 ring-1 ring-white/25">
            <img src={brainEqIcon} alt="EQ" className="w-6 h-6" style={{ filter: "brightness(0) invert(1)" }} />
            <span className="text-sm font-semibold">EQ-i 2.0 Assessment</span>
          </div>
          <div className="bg-black/35 backdrop-blur-sm rounded-2xl px-6 py-10 md:px-12 md:py-14 inline-block max-w-4xl">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-poppins font-bold mb-6 leading-tight">
              What Can <span className="text-gold">E.Q.</span> Do For You?
            </h1>
            <p className="text-lg md:text-xl max-w-3xl mx-auto mb-8 text-white/95">
              Uncover your own strengths and opportunities to show up, be heard,
              connect, drive change, and have resilience to the challenges
              presented in life, work, and anywhere in between.
            </p>
            <a href="#get-started">
              <Button size="lg" className="bg-gold text-navy hover:bg-white hover:text-navy font-semibold text-lg px-8">
                Get Started
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* Video Embed */}
      <section className="py-12 bg-muted/30">
        <div className="container max-w-4xl mx-auto px-6">
          <div className="aspect-video rounded-xl overflow-hidden shadow-xl">
            <iframe
              src="https://www.youtube.com/embed/uvlLR-K-V_c"
              title="What Can E.Q. Do For You...and Why It Matters"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
            />
          </div>
        </div>
      </section>

      {/* Stat Callout */}
      <section className="py-16 bg-navy text-white text-center">
        <div className="container max-w-3xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-poppins font-bold mb-4">
            Did you know that Emotional Intelligence has been shown to account
            for 27–45% of job success?
          </h2>
          <p className="text-lg text-white/80 mb-6">
            Learn how you can better listen, understand, be heard, and lead through E.Q.
          </p>
          <a href="#get-started">
            <Button className="bg-gold text-navy hover:bg-gold/90 font-semibold">
              Get Started
            </Button>
          </a>
        </div>
      </section>

      {/* Know Thyself */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container max-w-5xl mx-auto px-6">
          <div className="text-center mb-12">
            <span className="text-sm font-semibold tracking-widest text-raspberry uppercase">
              Know Thyself
            </span>
            <h2 className="text-3xl md:text-4xl font-poppins font-bold text-navy mt-2 mb-6">
              The Impacts of Understanding E.Q.
            </h2>
            <p className="text-foreground max-w-3xl mx-auto text-lg leading-relaxed">
              You've probably been told at some point, at work, in your life, to "put your emotions aside" when dealing with a difficult situation. But the truth is we are NOT thinking beings who <em>feel</em> but rather feeling beings who <em>think</em>. Whether consciously or not, your emotions impact every interaction (including the ones with yourself).
            </p>
          </div>

          <div className="max-w-2xl mx-auto mb-10">
            <p className="text-foreground mb-4 font-medium">
              By understanding your own Emotional Intelligence, you can bring greater awareness to how you:
            </p>
            <ul className="space-y-3">
              {[
                "Perceive yourself and show up (in your life & your work)",
                "Express your thoughts and ideas",
                "Develop and maintain social relationships",
                "Cope with challenges and change",
                "Use emotional information in effective and meaningful ways, to lead in all areas of your life",
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-raspberry flex-shrink-0 mt-0.5" />
                  <span className="text-foreground">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="text-center">
            <p className="text-sm font-semibold tracking-widest text-gold uppercase mb-2">
              Awareness leads to Action
            </p>
            <p className="text-foreground mb-4">
              Take the first steps in discovering how to effectively lead, influence, and have a positive impact by knowing your own Emotional Intelligence.
            </p>
          </div>
        </div>
      </section>

      {/* Why EQ Stats */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-muted/30 via-white to-muted/40 relative overflow-hidden">
        {/* Decorative background blobs */}
        <div aria-hidden className="absolute -top-20 -left-20 w-72 h-72 rounded-full bg-raspberry/10 blur-3xl" />
        <div aria-hidden className="absolute top-40 right-0 w-80 h-80 rounded-full bg-gold/10 blur-3xl" />
        <div aria-hidden className="absolute bottom-0 left-1/3 w-72 h-72 rounded-full bg-lime/10 blur-3xl" />

        <div className="container max-w-6xl mx-auto px-6 relative">
          <div className="text-center mb-14">
            <span className="text-sm font-semibold tracking-widest text-raspberry uppercase">By the numbers</span>
            <h2 className="text-3xl md:text-5xl font-poppins font-bold text-navy mt-2">
              So, why do <span className="text-raspberry">E.Q.</span>?
            </h2>
            <p className="text-foreground mt-4 max-w-2xl mx-auto">
              Three numbers leaders can't ignore.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 lg:gap-10">
            {stats.map((s, i) => {
              const c = colorMap[s.color];
              return (
                <div
                  key={i}
                  className="group relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border border-foreground/5 overflow-hidden animate-fade-in"
                  style={{ animationDelay: `${i * 120}ms` }}
                >
                  {/* Top color bar */}
                  <div className={`absolute top-0 left-0 right-0 h-1.5 ${c.bg}`} />
                  {/* Corner number */}
                  <div className={`absolute -right-4 -top-4 text-[8rem] font-poppins font-black ${c.text} opacity-[0.06] leading-none select-none`}>
                    0{i + 1}
                  </div>

                  {/* Visual */}
                  <div className="flex justify-center mb-6 mt-2">
                    {s.type === "ring" && (
                      <div className="relative w-40 h-40">
                        <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
                          <circle cx="60" cy="60" r="52" className="stroke-foreground/10" strokeWidth="10" fill="none" />
                          <circle
                            cx="60" cy="60" r="52" fill="none" strokeWidth="10" strokeLinecap="round"
                            className={c.ring}
                            strokeDasharray={`${(s.value! / 100) * 326.7} 326.7`}
                            style={{
                              transition: "stroke-dasharray 1.2s ease-out",
                              filter: `drop-shadow(0 0 8px ${c.hex}55)`,
                            }}
                          />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className={`text-4xl font-poppins font-bold ${c.text}`}>{s.value}{s.suffix}</span>
                          <span className="text-xs uppercase tracking-wider text-foreground/60 mt-1">empathetic</span>
                        </div>
                      </div>
                    )}

                    {s.type === "bar" && (
                      <div className="w-full max-w-[200px] flex flex-col items-center">
                        <span className={`text-6xl font-poppins font-black ${c.text} leading-none mb-3`}>
                          {s.value}<span className="text-3xl align-top">{s.suffix}</span>
                        </span>
                        <div className="w-full h-4 rounded-full bg-foreground/10 overflow-hidden">
                          <div
                            className={`h-full ${c.bg} rounded-full origin-left animate-scale-in`}
                            style={{ width: `${s.value}%`, animationDuration: "1s" }}
                          />
                        </div>
                        <div className="flex justify-between w-full text-[10px] text-foreground/50 mt-1 font-medium">
                          <span>0%</span><span>100%</span>
                        </div>
                      </div>
                    )}

                    {s.type === "range" && (
                      <div className="flex flex-col items-center">
                        <div className="flex items-baseline gap-1">
                          <span className={`text-6xl font-poppins font-black ${c.text} leading-none`}>{s.low}</span>
                          <span className={`text-4xl font-poppins font-bold ${c.text}/70`}>–</span>
                          <span className={`text-6xl font-poppins font-black ${c.text} leading-none`}>{s.high}</span>
                          <span className={`text-3xl font-bold ${c.text} ml-1`}>{s.suffix}</span>
                        </div>
                        <div className="mt-4 flex items-center gap-1">
                          {[...Array(5)].map((_, idx) => (
                            <svg key={idx} className={`w-5 h-5 ${c.text}`} viewBox="0 0 20 20" fill="currentColor">
                              <path d="M10 1l2.6 6 6.4.5-4.9 4.2 1.5 6.3L10 14.8 4.4 18l1.5-6.3L1 7.5 7.4 7z" />
                            </svg>
                          ))}
                        </div>
                        <span className="text-xs uppercase tracking-wider text-foreground/60 mt-2">above target</span>
                      </div>
                    )}
                  </div>

                  {/* Text */}
                  <div className="text-center relative z-10">
                    <h3 className={`font-poppins font-bold text-lg ${c.text} mb-2`}>{s.headline}</h3>
                    <p className="text-foreground text-sm leading-relaxed">{s.text}</p>
                    {s.footnote && (
                      <p className="text-xs text-foreground/60 italic mt-2">{s.footnote}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <p className="text-center text-foreground mt-12 max-w-2xl mx-auto text-lg">
            People higher in EI communicate effectively, form strong relationships, and create powerful coping strategies.
          </p>
        </div>
      </section>


      {/* EQ-i 2.0 Model */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container max-w-5xl mx-auto px-6">
          <div className="text-center mb-12">
            <span className="text-sm font-semibold tracking-widest text-muted-foreground uppercase">
              The Modern Day Leader
            </span>
            <h2 className="text-3xl md:text-4xl font-poppins font-bold text-navy mt-2 mb-4">
              The EQ-i 2.0 Model of Emotional Intelligence
            </h2>
            <p className="text-lg text-foreground font-medium">Skills for both Work and Life</p>
            <p className="text-foreground max-w-3xl mx-auto mt-4 leading-relaxed">
              While there are several models of emotional intelligence in use today, the EQ-i 2.0 model is one of the most popular and one of the only validated and reliable measures of self-perceived EQ that ties directly to the skills and competencies needed to lead in all areas of your life, whether you're in an official leadership role or not.
            </p>
          </div>
          <div className="max-w-3xl mx-auto">
            <img
              src={eqModelImg}
              alt="EQ-i 2.0 Model of Emotional Intelligence diagram"
              loading="lazy"
              className="w-full h-auto"
            />
          </div>
        </div>
      </section>

      {/* What's Included */}
      <section className="py-16 bg-muted/30">
        <div className="container max-w-5xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-poppins font-bold text-navy text-center mb-16">
            What's Included In Your EQ-i 2.0 Report
          </h2>
          <div className="space-y-12">
            {reportIncludes.map((section, i) => (
              <div
                key={i}
                className={`flex flex-col ${i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"} gap-8 items-center`}
              >
                <div className="md:w-2/5 flex justify-center">
                  <div className="rounded-xl overflow-hidden bg-white shadow-md border border-border w-full">
                    <img
                      src={section.image}
                      alt={`${section.title} sample from the EQ-i 2.0 report`}
                      loading="lazy"
                      className="w-full h-auto"
                    />
                  </div>
                </div>
                <div className="md:w-3/5 bg-white rounded-xl p-8 shadow-md">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-full bg-raspberry/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-bold text-raspberry">{i + 1}</span>
                    </div>
                    <span className="text-xs font-semibold tracking-widest text-raspberry uppercase">
                      {section.tag}
                    </span>
                  </div>
                  <h3 className="text-xl md:text-2xl font-poppins font-bold text-navy mb-3">
                    {section.title}
                  </h3>
                  <p className="text-foreground mb-4">{section.description}</p>
                  <ul className="space-y-2 mb-3">
                    {section.items.map((item, j) => (
                      <li key={j} className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-raspberry flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-foreground">{item}</span>
                      </li>
                    ))}
                  </ul>
                  {section.note && (
                    <p className="text-sm text-muted-foreground italic">{section.note}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Is For You If */}
      <section className="py-16 bg-raspberry text-white">
        <div className="container max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-poppins font-bold mb-8">
            The EQ-i 2.0 Assessment Is For You If...
          </h2>
          <div className="grid md:grid-cols-3 gap-6 mb-10">
            {[
              "You are currently in a Leadership role (or would like to be)",
              "You wish to develop the skills most desired to lead the 21st-century workforce",
              "You want to gain greater awareness and control over your emotions",
            ].map((item, i) => (
              <div key={i} className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                <CheckCircle className="w-8 h-8 mx-auto mb-3 text-white/90" />
                <p className="text-white/90 text-sm leading-relaxed">{item}</p>
              </div>
            ))}
          </div>
          <a href="#get-started">
            <Button size="lg" className="bg-white text-raspberry hover:bg-white/90 font-semibold">
              Yes, I Want to Learn My EQ
            </Button>
          </a>
        </div>
      </section>

      {/* Pricing */}
      <section id="get-started" className="py-16 md:py-24 bg-white scroll-mt-24">
        <div className="container max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <span className="text-sm font-semibold tracking-widest text-raspberry uppercase">
              Get Started Today
            </span>
            <h2 className="text-3xl md:text-4xl font-poppins font-bold text-navy mt-2">
              Discover Your E.Q.
            </h2>
            <p className="text-foreground mt-3">
              There are six report options we offer, depending on your individual or organizational needs.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Workplace Report */}
            <div className="bg-white rounded-xl border border-border shadow-md p-8 flex flex-col">
              <h3 className="text-xl md:text-2xl font-poppins font-semibold text-navy mb-1">
                EQ-i Workplace Report
              </h3>
              <p className="text-4xl font-bold text-raspberry mb-4">$997</p>
              <p className="text-sm font-medium text-foreground mb-4">
                Gain clarity into your own E.Q.
              </p>
              <ul className="space-y-2 mb-8 flex-grow">
                {[
                  "Access to complete the EQ-i 2.0 online Assessment",
                  "Your customized, 21-page E.Q. report",
                  "A 45-minute one-on-one debrief call to review your results and design your E.Q. development blueprint",
                  "A 30-minute progress check-in & coaching call",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                    <CheckCircle className="w-4 h-4 text-raspberry flex-shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <a
                href="https://explore.onthepaintedporch.com/payment-link/69e67ea9557558e89e521472"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button className="w-full bg-raspberry hover:bg-raspberry/90 text-white">
                  Purchase <ExternalLink className="ml-2 w-4 h-4" />
                </Button>
              </a>
            </div>

            {/* Leadership Report */}
            <div className="bg-white rounded-xl border-2 border-raspberry shadow-xl p-8 flex flex-col relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-raspberry text-white text-xs font-semibold px-4 py-1 rounded-full">
                Most Popular
              </div>
              <h3 className="text-xl md:text-2xl font-poppins font-semibold text-navy mb-1">
                EQ-i Leadership Report
              </h3>
              <p className="text-4xl font-bold text-raspberry mb-4">$1,197</p>
              <p className="text-sm font-medium text-foreground mb-4">
                Know Your Leadership Impact & Potential
              </p>
              <ul className="space-y-2 mb-8 flex-grow">
                {[
                  "Access to complete the EQ-i 2.0 online Assessment",
                  "Your customized, 27-page E.Q. report",
                  "A 45-minute one-on-one debrief call to review your results and design your E.Q. leadership blueprint",
                  "A 30-minute progress check-in & coaching call",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                    <CheckCircle className="w-4 h-4 text-raspberry flex-shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <a
                href="https://explore.onthepaintedporch.com/payment-link/69e67e7a557558e89e521471"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button className="w-full bg-raspberry hover:bg-raspberry/90 text-white">
                  Purchase <ExternalLink className="ml-2 w-4 h-4" />
                </Button>
              </a>
            </div>

            {/* Let's Talk */}
            <div className="bg-muted/40 rounded-xl border border-border shadow-md p-8 flex flex-col">
              <h3 className="text-xl md:text-2xl font-poppins font-semibold text-navy mb-1">
                Unsure or want to learn more?
              </h3>
              <p className="text-2xl font-bold text-navy mb-4">Let's Talk</p>
              <p className="text-sm text-foreground mb-4">
                Interested in one of our other EQ-i reports:
              </p>
              <ul className="space-y-2 mb-8 flex-grow">
                {[
                  "Workplace or Leadership EQ 360",
                  "EQ-i Group (Up to 20 people)",
                  "EQ-i Higher Education",
                  "Simply have a few questions?",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                    <Calendar className="w-4 h-4 text-navy flex-shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <a
                href="https://meet.paintedporchstrategies.com/discovery/eq-discovery"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="outline" className="w-full border-navy text-navy hover:bg-navy hover:text-white">
                  Contact Us <ExternalLink className="ml-2 w-4 h-4" />
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>




      <FAQSection tierName="EQ-i 2.0" categories={eqFaqCategories} />
    </div>
  );
}
