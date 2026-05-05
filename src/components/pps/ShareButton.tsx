import { useState, useRef, useEffect } from "react";
import { Share2, Link2, Mail, X } from "lucide-react";
import { toast } from "sonner";

interface ShareButtonProps {
  title: string;
  url?: string;
}

const SOCIAL_PLATFORMS = [
  {
    name: "X (Twitter)",
    icon: () => (
      <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
    ),
    getUrl: (url: string, title: string) =>
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
  },
  {
    name: "LinkedIn",
    icon: () => (
      <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
    ),
    getUrl: (url: string) =>
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
  },
  {
    name: "Facebook",
    icon: () => (
      <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
    ),
    getUrl: (url: string) =>
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
  },
  {
    name: "Bluesky",
    icon: () => (
      <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current"><path d="M12 10.8c-1.087-2.114-4.046-6.053-6.798-7.995C2.566.944 1.561 1.266.902 1.565.139 1.908 0 3.08 0 3.768c0 .69.378 5.65.624 6.479.785 2.627 3.588 3.476 6.182 3.21-3.99.567-7.509 2.24-2.827 7.767C8.17 25.834 10.884 18.983 12 16.261c1.116 2.722 3.072 9.092 8.02 4.963 4.683-5.528 1.163-7.2-2.826-7.767 2.593.266 5.396-.583 6.182-3.21.245-.829.624-5.789.624-6.478 0-.69-.139-1.861-.902-2.204-.659-.3-1.664-.62-4.3 1.24C16.046 4.748 13.087 8.687 12 10.8z" /></svg>
    ),
    getUrl: (url: string, title: string) =>
      `https://bsky.app/intent/compose?text=${encodeURIComponent(title + " " + url)}`,
  },
  {
    name: "Reddit",
    icon: () => (
      <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current"><path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z" /></svg>
    ),
    getUrl: (url: string, title: string) =>
      `https://www.reddit.com/submit?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`,
  },
  {
    name: "Pinterest",
    icon: () => (
      <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current"><path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 0 1 .083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12.017 24c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641 0 12.017 0z" /></svg>
    ),
    getUrl: (url: string, title: string) =>
      `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(url)}&description=${encodeURIComponent(title)}`,
  },
];

export default function ShareButton({ title, url }: ShareButtonProps) {
  const [open, setOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  const shareUrl = url || (typeof window !== "undefined" ? window.location.href : "");

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success("Link copied to clipboard!");
      setOpen(false);
    } catch {
      toast.error("Failed to copy link");
    }
  };

  const handleEmail = () => {
    window.open(
      `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(shareUrl)}`,
      "_self"
    );
    setOpen(false);
  };

  const handleSocial = (platform: (typeof SOCIAL_PLATFORMS)[number], e?: React.MouseEvent) => {
    e?.preventDefault();
    const url = platform.getUrl(shareUrl, title);
    // Use a link click instead of window.open to avoid popup blockers
    const a = document.createElement("a");
    a.href = url;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    a.click();
    setOpen(false);
  };

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setOpen(!open)}
        className="inline-flex items-center gap-2 font-poppins font-semibold text-sm px-6 py-2.5 rounded-full border-2 border-muted-foreground/30 text-muted-foreground hover:border-primary hover:text-primary transition-colors"
      >
        <Share2 className="w-4 h-4" />
        Share
      </button>

      {open && (
        <div
          ref={popoverRef}
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-72 bg-background rounded-xl shadow-xl border border-border p-4 z-50 animate-in fade-in slide-in-from-bottom-2 duration-200"
        >
          {/* Close button */}
          <button
            onClick={() => setOpen(false)}
            className="absolute top-3 right-3 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          <p className="font-poppins font-semibold text-foreground mb-4">Share this post</p>

          {/* Quick actions row */}
          <div className="flex gap-3 mb-4">
            <button
              onClick={handleCopyLink}
              className="flex flex-col items-center gap-1.5 group"
            >
              <span className="w-12 h-12 rounded-full bg-muted flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                <Link2 className="w-5 h-5 text-muted-foreground group-hover:text-primary" />
              </span>
              <span className="text-xs text-muted-foreground group-hover:text-foreground">Copy link</span>
            </button>
            <button
              onClick={() => handleSocial(SOCIAL_PLATFORMS[2])}
              className="flex flex-col items-center gap-1.5 group"
            >
              <span className="w-12 h-12 rounded-full bg-muted flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                {SOCIAL_PLATFORMS[2].icon()}
              </span>
              <span className="text-xs text-muted-foreground group-hover:text-foreground">Facebook</span>
            </button>
            <button
              onClick={handleEmail}
              className="flex flex-col items-center gap-1.5 group"
            >
              <span className="w-12 h-12 rounded-full bg-muted flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                <Mail className="w-5 h-5 text-muted-foreground group-hover:text-primary" />
              </span>
              <span className="text-xs text-muted-foreground group-hover:text-foreground">Email</span>
            </button>
          </div>

          {/* Divider */}
          <div className="border-t border-border mb-3" />

          {/* Social list */}
          <div className="space-y-1">
            {SOCIAL_PLATFORMS.filter((_, i) => i !== 2).map((platform) => (
              <button
                key={platform.name}
                onClick={() => handleSocial(platform)}
                className="w-full flex items-center gap-3 px-2 py-2 rounded-lg text-foreground hover:bg-muted transition-colors text-sm"
              >
                <platform.icon />
                {platform.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
