import { Link } from "react-router-dom";
import { useState } from "react";
import { Youtube, Facebook, Instagram, Linkedin, Loader2 } from "lucide-react";
import ppsLogoWhite from "@/assets/pps-logo-white.png";
import { useArePagesLive } from "@/hooks/useIsPageLive";
import { supabase } from "@/integrations/supabase/client";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function PPSFooter() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!EMAIL_RE.test(trimmed)) {
      setStatus("error");
      setMessage("Please enter a valid email.");
      return;
    }
    setStatus("loading");
    setMessage("");
    try {
      const { error } = await supabase.functions.invoke("submit-newsletter-optin", {
        body: { email: trimmed, source: "Footer Newsletter" },
      });
      if (error) throw error;
      setStatus("success");
      setMessage("You're on the list! Check your inbox.");
      setEmail("");
    } catch (err) {
      console.error("Newsletter signup error:", err);
      setStatus("error");
      setMessage("Something went wrong. Please try again.");
    }
  };

  const quickLinks = [
    { label: "About Us", href: "/about" },
    { label: "The Blue Door", href: "/blue-door" },
    { label: "Partner with Us", href: "/partner" },
    { label: "Insights & Resources", href: "/resources" },
    { label: "Speaking", href: "/speaking" },
    { label: "FAQ", href: "/resources/faq" },
  ];

  const pathways = [
    { label: "Courses", href: "/partner/ignite/courses" },
    { label: "Assessments", href: "/partner/ignite/assessments" },
    { label: "Masterclasses", href: "/partner/ignite/masterclasses" },
    { label: "Leadership Labs", href: "/partner/amplify/labs" },
    { label: "Team Workshops", href: "/partner/amplify/workshops" },
    { label: "Strategic Sprints", href: "/partner/amplify/sprints" },
    { label: "Organizational Advisory", href: "/partner/embody" },
  ];

  const { liveMap, loading: statusLoading } = useArePagesLive([...quickLinks, ...pathways].map((l) => l.href));
  // While statuses load, show all links (treat as live) so the footer renders
  // at full height immediately and doesn't cause a layout shift when data arrives.
  const visibleQuick = statusLoading ? quickLinks : quickLinks.filter((l) => liveMap[l.href] !== false);
  const visiblePathways = statusLoading ? pathways : pathways.filter((l) => liveMap[l.href] !== false);



  const socials = [
    { icon: Youtube, href: "https://www.youtube.com/@onthepaintedporch", label: "YouTube" },
    { icon: Facebook, href: "https://www.facebook.com/paintedporchstrategies", label: "Facebook" },
    { icon: Instagram, href: "https://www.instagram.com/paintedporchstrategies/", label: "Instagram" },
    { icon: Linkedin, href: "https://www.linkedin.com/company/paintedporchstrategies/", label: "LinkedIn" },
    { icon: ({ className }: { className?: string }) => (
      <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/></svg>
    ), href: "https://open.spotify.com/playlist/1F6mkBYTllBzwawCXDEmry", label: "Spotify" },
  ];

  return (
    <footer className="bg-navy text-white">
      <div className="container max-w-7xl mx-auto px-6 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="mb-4">
              <img src={ppsLogoWhite} alt="Painted Porch Strategies" className="h-16 w-auto" />
            </div>
            <p className="text-sm text-white/80 leading-relaxed">
              Painted Porch Strategies partners with leaders to architect strategic shIFt. This is Phase Zero, the work before the work.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-base md:text-lg font-poppins font-semibold text-gold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              {visibleQuick.map((link) => (
                <li key={link.href}>
                  <Link to={link.href} className="text-sm text-white/80 hover:text-lime transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* P.A.T.H.ways */}
          <div>
            <h4 className="text-base md:text-lg font-poppins font-semibold text-gold mb-4">P.A.T.H.ways</h4>
            <ul className="space-y-2">
              {visiblePathways.map((link) => (
                <li key={link.href}>
                  <Link to={link.href} className="text-sm text-white/80 hover:text-lime transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-base md:text-lg font-poppins font-semibold text-gold mb-4">Get In Touch</h4>
            <Link to="/contact?interest=general" className="inline-block bg-transparent border-2 border-white text-white hover:bg-white hover:text-navy font-semibold py-2 px-6 rounded-lg transition-all">
              Contact Us
            </Link>

            {/* Newsletter Signup */}
            <form onSubmit={handleSubscribe} className="mt-5">
              <label htmlFor="footer-newsletter-email" className="block text-sm font-poppins font-semibold text-white mb-2">
                Porch Notes Newsletter
              </label>
              {status === "success" ? (
                <p className="text-sm text-lime" role="status">{message}</p>
              ) : (
                <>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      id="footer-newsletter-email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (status === "error") setStatus("idle");
                      }}
                      placeholder="you@example.com"
                      disabled={status === "loading"}
                      className="flex-1 min-w-0 bg-white/10 border border-white/30 text-white placeholder:text-white/50 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-lime focus:border-transparent disabled:opacity-60"
                    />
                    <button
                      type="submit"
                      disabled={status === "loading"}
                      className="inline-flex items-center justify-center bg-lime text-white hover:bg-white hover:text-navy font-semibold text-sm py-2 px-4 rounded-lg transition-all disabled:opacity-60"
                    >
                      {status === "loading" ? <Loader2 className="w-4 h-4 animate-spin" /> : "Subscribe"}
                    </button>
                  </div>
                  {status === "error" && (
                    <p className="mt-2 text-xs text-raspberry" role="alert">{message}</p>
                  )}
                </>
              )}
            </form>

            <div className="flex items-center gap-4 mt-5">
              {socials.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="text-white/60 hover:text-lime transition-colors"
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Charity Note */}
        <div className="mt-6 pt-6 text-center">
          <h4 className="text-base md:text-lg font-poppins font-bold text-lime mb-2">
            Let's Do Good Sh<span className="text-red-500 font-bold">IF</span>t
          </h4>
          <p className="text-sm text-white/80">
            To do <em>well</em>, we must also do <em>good</em>.{" "}
            <Link to="/about/impact#do-good-shift" className="text-lime font-semibold underline hover:text-white transition-colors">5% of your investment is donated to charity.</Link>
          </p>
        </div>

        {/* Legal Links */}
        <div className="mt-6 pt-6 text-center">
          <ul className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs text-white/70">
            <li><Link to="/terms?tab=terms" className="hover:text-lime transition-colors">Terms</Link></li>
            <li aria-hidden className="text-white/30">·</li>
            <li><Link to="/terms?tab=privacy" className="hover:text-lime transition-colors">Privacy</Link></li>
            <li aria-hidden className="text-white/30">·</li>
            <li><Link to="/terms?tab=cookies" className="hover:text-lime transition-colors">Cookies</Link></li>
          </ul>
        </div>

        {/* Copyright */}
        <div className="mt-4 pt-4 text-center">
          <p className="text-xs text-white/60">
            © {new Date().getFullYear()} Painted Porch Strategies. All rights reserved. Phase Zero, P.A.T.H., and The Painted Porch Pillars are trademarks.
          </p>
        </div>
      </div>
    </footer>
  );
}
