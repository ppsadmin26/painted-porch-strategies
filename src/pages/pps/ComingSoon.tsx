import { Link } from "react-router-dom";
import { useDocumentSeo } from "@/hooks/useDocumentSeo";
import { ArrowLeft, Mail } from "lucide-react";

/**
 * Shown to public visitors when they hit a route flagged as DRAFT in
 * src/config/pageStatus.ts. Logged-in staff bypass this and see the real page.
 *
 * Features a branded animated SVG scene of a builder painting the
 * Painted Porch, using brand colors (teal, lime, gold, raspberry, purple, navy).
 */
export default function ComingSoon() {
  useDocumentSeo({
    title: "Coming Soon | Painted Porch Strategies",
    description: "We're building something here. Check back soon, or get in touch.",
  });

  return (
    <main className="min-h-[80vh] bg-white flex items-center justify-center px-6 py-16 overflow-hidden">
      <div className="max-w-3xl w-full text-center">
        {/* Animated porch-building scene */}
        <div className="mb-8 flex justify-center">
          <svg
            viewBox="0 0 480 280"
            className="w-full max-w-md h-auto"
            role="img"
            aria-label="Animated illustration of a builder painting a colorful porch"
          >
            <defs>
              <linearGradient id="skyGrad" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#FFF8E7" />
                <stop offset="100%" stopColor="#FFFFFF" />
              </linearGradient>
            </defs>
            <rect x="0" y="0" width="480" height="220" fill="url(#skyGrad)" />

            <circle cx="80" cy="60" r="22" fill="#FFB900">
              <animate attributeName="r" values="22;25;22" dur="3s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.85;1;0.85" dur="3s" repeatCount="indefinite" />
            </circle>

            <rect x="0" y="220" width="480" height="60" fill="#70A300" opacity="0.18" />
            <rect x="0" y="218" width="480" height="4" fill="#70A300" opacity="0.4" />

            <rect x="120" y="200" width="280" height="20" fill="#E8A231" />
            <rect x="120" y="200" width="280" height="3" fill="#523387" opacity="0.3" />

            <polygon points="110,110 410,110 380,80 140,80" fill="#00006B" />
            <rect x="110" y="108" width="300" height="6" fill="#00006B" />

            {/* Pillar 1, Cultural Cornerstone (Teal) */}
            <rect x="140" y="114" width="20" height="86" fill="#E5E7EB" />
            <rect x="140" y="200" width="20" height="0" fill="#007697">
              <animate attributeName="height" values="0;86" dur="2s" begin="0.2s" fill="freeze" />
              <animate attributeName="y" values="200;114" dur="2s" begin="0.2s" fill="freeze" />
            </rect>

            {/* Pillar 2, Operational Frame (Lime) */}
            <rect x="250" y="114" width="20" height="86" fill="#E5E7EB" />
            <rect x="250" y="200" width="20" height="0" fill="#70A300">
              <animate attributeName="height" values="0;86" dur="2s" begin="1.2s" fill="freeze" />
              <animate attributeName="y" values="200;114" dur="2s" begin="1.2s" fill="freeze" />
            </rect>

            {/* Pillar 3, Living Ecosystem (Raspberry) */}
            <rect x="360" y="114" width="20" height="86" fill="#E5E7EB" />
            <rect x="360" y="200" width="20" height="0" fill="#DB0043">
              <animate attributeName="height" values="0;86" dur="2s" begin="2.2s" fill="freeze" />
              <animate attributeName="y" values="200;114" dur="2s" begin="2.2s" fill="freeze" />
            </rect>

            {/* Builder */}
            <g>
              <animateTransform
                attributeName="transform"
                attributeType="XML"
                type="translate"
                values="0,0; 110,0; 220,0; 0,0"
                keyTimes="0; 0.33; 0.66; 1"
                dur="9s"
                repeatCount="indefinite"
              />
              <rect x="170" y="160" width="18" height="32" rx="3" fill="#523387" />
              <circle cx="179" cy="152" r="9" fill="#F4C9A8" />
              <path d="M168,150 Q179,138 190,150 Z" fill="#FFB900" />
              <rect x="168" y="149" width="22" height="3" fill="#E8A231" />
              <g style={{ transformOrigin: "175px 168px" }}>
                <animateTransform
                  attributeName="transform"
                  attributeType="XML"
                  type="rotate"
                  values="-15;25;-15"
                  dur="0.8s"
                  repeatCount="indefinite"
                />
                <rect x="172" y="165" width="4" height="22" fill="#523387" />
                <rect x="168" y="183" width="12" height="6" rx="1" fill="#8B5E34" />
                <rect x="167" y="186" width="14" height="4" fill="#DB0043" />
              </g>
              <rect x="171" y="190" width="6" height="12" fill="#00006B" />
              <rect x="181" y="190" width="6" height="12" fill="#00006B" />
            </g>

            <circle cx="200" cy="130" r="3" fill="#007697">
              <animate attributeName="cy" values="130;120;130" dur="2.5s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="1;0.3;1" dur="2.5s" repeatCount="indefinite" />
            </circle>
            <circle cx="310" cy="135" r="3" fill="#70A300">
              <animate attributeName="cy" values="135;125;135" dur="2.8s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="1;0.3;1" dur="2.8s" repeatCount="indefinite" />
            </circle>
            <circle cx="420" cy="130" r="3" fill="#DB0043">
              <animate attributeName="cy" values="130;120;130" dur="2.3s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="1;0.3;1" dur="2.3s" repeatCount="indefinite" />
            </circle>
          </svg>
        </div>

        <p className="font-montserrat text-pps-teal font-semibold tracking-wide uppercase text-body-sm mb-3">
          Building something here
        </p>

        <h1 className="text-4xl md:text-5xl lg:text-6xl font-poppins font-bold text-pps-navy mb-4">
          Painting this porch as we speak
        </h1>

        <p className="font-montserrat text-pps-charcoal text-lead mb-8 max-w-lg mx-auto">
          We're still adding the finishing brushstrokes. Pull up a chair and check back
          soon, or reach out and we'll let you know when it's ready.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-pps-teal text-white font-poppins font-semibold hover:bg-pps-teal/90 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
          <Link
            to="/contact"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg border-2 border-pps-navy text-pps-navy font-poppins font-semibold hover:bg-pps-navy hover:text-white transition-colors"
          >
            <Mail className="w-4 h-4" />
            Contact Us
          </Link>
        </div>
      </div>
    </main>
  );
}
