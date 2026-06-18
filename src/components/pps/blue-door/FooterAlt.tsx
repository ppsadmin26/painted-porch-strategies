export default function FooterAlt() {
  const quickLinks = [
    { label: "About Painted Porch Strategies", href: "/about" },
    { label: "The Painted Porch Pillars", href: "/about/approach" },
    { label: "Phase Zero Methodology", href: "/about/approach" },
    { label: "P.A.T.H.ways Partnership", href: "/partner" },
    { label: "Contact Us", href: "mailto:explore@onthepaintedporch.com" }
  ];

  return (
    <footer className="bg-gradient-to-b from-navy to-navy/95 text-white">
      <div className="container max-w-7xl mx-auto px-6 py-12">
        <div className="grid md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl md:text-2xl font-poppins font-bold mb-4 text-gold">
              Painted Porch Strategies
            </h3>
            <p className="text-body-sm opacity-90">
              Painted Porch Strategies partners with leaders to architect strategic sh<span className="text-raspberry font-bold">IF</span>t. This is Phase Zero, the work before the work.
            </p>
          </div>
          
          <div>
            <h4 className="text-base md:text-lg font-poppins font-semibold mb-4 text-gold">
              Quick Links
            </h4>
            <ul className="space-y-2">
              {quickLinks.map((link, index) => (
                <li key={index}>
                  <a 
                    href={link.href}
                    className="text-sm opacity-90 hover:text-lime hover:opacity-100 transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h4 className="text-base md:text-lg font-poppins font-semibold mb-4 text-gold">
              Get In Touch
            </h4>
            <p className="text-body-sm opacity-90">
              Email:{" "}
              <a 
                href="mailto:explore@onthepaintedporch.com"
                className="hover:text-lime transition-colors"
              >
                explore@onthepaintedporch.com
              </a>
            </p>
            <p className="text-body-sm opacity-90 mt-2">
              Website:{" "}
              <a 
                href="https://paintedporchstrategies.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-lime transition-colors"
              >
                paintedporchstrategies.com
              </a>
            </p>
          </div>
        </div>
        
        <div className="mt-10 pt-8 border-t border-white/10 text-center">
          <h4 className="text-base md:text-lg font-poppins font-bold text-lime mb-2">
            Let's Do Good Sh<span className="text-raspberry font-bold">IF</span>t
          </h4>
          <p className="text-body-sm opacity-90 max-w-2xl mx-auto">
            To do <em>well</em>, we must also do <em>good</em>. <span className="font-semibold text-lime">5% of every purchase is donated to charity.</span>
          </p>
        </div>
      </div>
      
      <div className="border-t border-white/10 py-4">
        <div className="container max-w-7xl mx-auto px-6">
          <p className="text-xs text-center opacity-70">
            © 2026 Painted Porch Strategies. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
