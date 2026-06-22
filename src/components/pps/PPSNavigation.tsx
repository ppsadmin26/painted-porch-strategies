import { Link, useLocation } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { Menu, X, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import ppsLogo from "@/assets/pps-logo.png";
import { SiteSearch } from "@/components/pps/SiteSearch";
import { useArePagesLive } from "@/hooks/useIsPageLive";

const navLinks = [
  { label: "What is Phase Zero?", href: "/phase-zero" },
  { label: "Open Your Blue Door", href: "/blue-door" },
  {
    label: "Partner with Us",
    href: "/partner",
    children: [
      { label: "Ignite ShIFt", href: "/partner/ignite" },
      { label: "Amplify ShIFt", href: "/partner/amplify" },
      { label: "Embody ShIFt", href: "/partner/embody" },
    ],
  },
  {
    label: "Insights & Resources",
    href: "/resources",
    children: [
      { label: "Insights", href: "/resources/insights" },
      { label: "YouTube", href: "/resources/youtube" },
      { label: "Media Appearances", href: "/speaking/media" },
      { label: "Free Resources", href: "/resources/free" },
      { label: "FAQ", href: "/resources/faq" },
    ],
  },
  {
    label: "Speaking",
    href: "/speaking",
    children: [
      { label: "Amy Yackowski", href: "/speaking/amy" },
      { label: "Rob Yackowski", href: "/speaking/rob" },
      { label: "Sierra Modro", href: "/speaking/sierra" },
      { label: "As Seen On", href: "/speaking/media" },
    ],
  },
  {
    label: "About",
    href: "/about",
    children: [
      { label: "Our Approach", href: "/about/approach" },
      { label: "Our Impact", href: "/about/impact" },
    ],
  },
];

export default function PPSNavigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [expandedMobileItem, setExpandedMobileItem] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Collect every internal path used in the nav so we can check status in a
  // single query and filter draft items out for non-admin visitors.
  const allPaths = useMemo(() => {
    const paths: string[] = [];
    for (const l of navLinks) {
      paths.push(l.href);
      if (l.children) for (const c of l.children) paths.push(c.href);
    }
    paths.push("/start-here");
    return paths;
  }, []);
  const { liveMap } = useArePagesLive(allPaths);

  const visibleNav = useMemo(() => {
    return navLinks
      .map((l) => {
        const children = l.children?.filter((c) => liveMap[c.href] !== false);
        const parentLive = liveMap[l.href] !== false;
        // If parent is draft AND no live children, hide entirely.
        if (!parentLive && (!children || children.length === 0)) return null;
        return { ...l, children };
      })
      .filter(Boolean) as typeof navLinks;
  }, [liveMap]);

  const startHereLive = liveMap["/start-here"] !== false;

  const isActiveLink = (href: string) => {
    if (href === "/") return location.pathname === "/";
    return location.pathname === href || location.pathname.startsWith(href + "/");
  };

  return (
    <nav
      className={`bg-white sticky top-0 z-50 transition-shadow ${
        scrolled ? "shadow-md" : "shadow-sm"
      }`}
    >
      <div className="container max-w-7xl mx-auto px-6">
        <div
          className={`flex items-center justify-between transition-all duration-300 ${
            scrolled ? "h-14" : "h-20 md:h-24"
          }`}
        >
          {/* Logo */}
          <Link to="/" className="flex items-center flex-shrink-0 mr-4">
            <img
              src={ppsLogo}
              alt="Painted Porch Strategies"
              className={`w-auto object-contain transition-all duration-300 ${
                scrolled ? "h-10" : "h-12 md:h-14"
              }`}
            />
          </Link>

          {/* Desktop Navigation */}
          <div className={`${scrolled ? "hidden" : "hidden lg:flex"} items-center gap-4`}>
            {visibleNav.map((link) =>
              link.children && link.children.length > 0 ? (
                <DropdownMenu key={link.href}>
                  <div className="flex items-center">
                    <Link
                      to={link.href}
                      className={`text-sm font-medium transition-colors whitespace-nowrap ${
                        isActiveLink(link.href)
                          ? "text-primary"
                          : "text-foreground hover:text-primary"
                      }`}
                    >
                      {link.label}
                    </Link>
                    <DropdownMenuTrigger
                      aria-label={`Open ${link.label} submenu`}
                      className={`ml-1 p-1 transition-colors ${
                        isActiveLink(link.href)
                          ? "text-primary"
                          : "text-foreground hover:text-primary"
                      }`}
                    >
                      <ChevronDown className="w-4 h-4" aria-hidden="true" />
                      <span className="sr-only">Open {link.label} submenu</span>
                    </DropdownMenuTrigger>
                  </div>
                  <DropdownMenuContent align="start" className="w-48 bg-white z-50">
                    {link.children.map((child) => (
                      <DropdownMenuItem key={child.href} asChild>
                        <Link
                          to={child.href}
                          className={`w-full ${
                            location.pathname === child.href ? "text-primary font-medium" : ""
                          }`}
                        >
                          {child.label}
                        </Link>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link
                  key={link.href}
                  to={link.href}
                  className={`text-sm font-medium transition-colors whitespace-nowrap ${
                    isActiveLink(link.href)
                      ? "text-primary"
                      : "text-foreground hover:text-primary"
                  }`}
                >
                  {link.label}
                </Link>
              ),
            )}
            <SiteSearch />
            {startHereLive && (
              <Link to="/start-here" className="flex-shrink-0">
                <Button className="bg-primary hover:bg-primary/90 text-sm px-4 py-1 h-9 whitespace-nowrap">
                  Discover Your P.A.T.H.way
                </Button>
              </Link>
            )}
          </div>

          {/* Compact / Mobile: Search + Menu Button */}
          <div className={`${scrolled ? "flex" : "lg:hidden flex"} items-center gap-3`}>
            <SiteSearch />
            <button
              className="p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6 text-navy" />
              ) : (
                <Menu className="w-6 h-6 text-navy" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className={`${scrolled ? "" : "lg:hidden"} py-4 border-t`}>
            <div className="flex flex-col gap-2">
              {visibleNav.map((link) => (
                <div key={link.href}>
                  {link.children && link.children.length > 0 ? (
                    <div>
                      <div className="flex items-center justify-between">
                        <Link
                          to={link.href}
                          className={`flex-1 font-medium py-2 ${
                            isActiveLink(link.href) ? "text-primary" : "text-foreground"
                          }`}
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          {link.label}
                        </Link>
                        <button
                          type="button"
                          aria-label={`Toggle ${link.label} submenu`}
                          aria-expanded={expandedMobileItem === link.href}
                          className={`px-3 py-2 ${
                            isActiveLink(link.href) ? "text-primary" : "text-foreground"
                          }`}
                          onClick={() =>
                            setExpandedMobileItem(
                              expandedMobileItem === link.href ? null : link.href,
                            )
                          }
                        >
                          <ChevronDown
                            aria-hidden="true"
                            className={`w-4 h-4 transition-transform ${
                              expandedMobileItem === link.href ? "rotate-180" : ""
                            }`}
                          />
                          <span className="sr-only">Toggle {link.label} submenu</span>
                        </button>
                      </div>
                      {expandedMobileItem === link.href && (
                        <div className="ml-4 flex flex-col gap-2 pb-2">
                          {link.children.map((child) => (
                            <Link
                              key={child.href}
                              to={child.href}
                              className={`py-1 text-sm ${
                                location.pathname === child.href
                                  ? "text-primary font-medium"
                                  : "text-foreground"
                              }`}
                              onClick={() => setMobileMenuOpen(false)}
                            >
                              {child.label}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <Link
                      to={link.href}
                      className={`font-medium py-2 block ${
                        isActiveLink(link.href) ? "text-primary" : "text-foreground"
                      }`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {link.label}
                    </Link>
                  )}
                </div>
              ))}
              {startHereLive && (
                <Link to="/start-here" onClick={() => setMobileMenuOpen(false)}>
                  <Button className="bg-primary hover:bg-primary/90 w-full mt-2">
                    Discover Your P.A.T.H.way
                  </Button>
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
