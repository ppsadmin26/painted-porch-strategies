import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";
import { useDocumentSeo } from "@/hooks/useDocumentSeo";
import { getSiteUrl } from "@/lib/site-url";

const OOPSY_DAISY_GIF = "https://kajabi-storefronts-production.kajabi-cdn.com/kajabi-storefronts-production/file-uploads/themes/2152030869/settings_images/20bf3d-15fc-f6e6-85f1-fcaf7fb6a814_8f5ba8d2-ef56-4b3b-90ac-468f7f2def00.gif";

const NotFound = () => {
  const location = useLocation();

  useDocumentSeo({
    title: "Page Not Found | Painted Porch Strategies",
    robots: "noindex, nofollow",
    canonical: `${getSiteUrl()}${location.pathname}`,
  });

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/30 px-4 py-16">
      <div className="text-center max-w-lg mx-auto space-y-6">
        {/* Schitt's Creek GIF */}
        <div className="mx-auto w-64 h-auto rounded-lg overflow-hidden shadow-md">
          <img
            src={OOPSY_DAISY_GIF}
            alt="Oopsy Daisy - Page not found"
            className="w-full h-auto"
          />
        </div>

        {/* Heading */}
        <h1 className="text-4xl md:text-5xl font-bold text-foreground tracking-tight">
          Page not found
        </h1>

        {/* Description */}
        <p className="text-lg text-muted-foreground">
          The page you are looking for doesn't exist or has been moved.
        </p>

        {/* Support info */}
        <p className="text-muted-foreground">
          If you are having trouble accessing a page on this site, please contact us at{" "}
          <a
            href="mailto:support@onthepaintedporch.com"
            className="font-semibold text-foreground underline underline-offset-2 hover:text-brand-teal transition-colors"
          >
            support@onthepaintedporch.com
          </a>
        </p>

        {/* Back Home Button */}
        <div className="pt-2">
          <Link to="/">
            <Button
              variant="outline"
              size="lg"
              className="gap-2 px-8 text-base font-semibold uppercase tracking-wider border-2 border-foreground text-foreground hover:bg-foreground hover:text-background transition-colors"
            >
              <Home className="w-4 h-4" />
              Back Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
