import { Play, Loader2, AlertCircle, RotateCw } from "lucide-react";
import type { LucideIcon } from "lucide-react";

type FallbackState = "loading" | "error" | "empty";

interface VideoFallbackProps {
  /** Visual + semantic state. Picks default icon + message. */
  state?: FallbackState;
  /** Override the default message. Pass `null` to hide text entirely. */
  message?: string | null;
  /** Override the default icon. */
  icon?: LucideIcon;
  /** Extra classes for the outer wrapper */
  className?: string;
  /** "hero" = larger paint-splash blurs for full-bleed sections; "card" = compact for cards */
  variant?: "hero" | "card";
  /** When provided and state is "error", renders a Retry button below the message. */
  onRetry?: () => void;
  /** Optional override for the retry button label */
  retryLabel?: string;
}

const DEFAULTS: Record<FallbackState, { message: string | null; icon: LucideIcon; spin: boolean }> = {
  loading: { message: "Loading video…", icon: Loader2, spin: true },
  error: { message: "Video unavailable right now", icon: AlertCircle, spin: false },
  empty: { message: "Preview unavailable right now", icon: Play, spin: false },
};

/**
 * Branded gradient overlay for video slots. Used as the loading shimmer,
 * the error state, and the "no video set" empty state so every site_videos
 * consumer (LazyHeroVideo, LazyPreviewVideo, OurImpact, TeamChallenge, etc.)
 * looks consistent and intentional, never a blank black box.
 *
 * Visual: navy → cobalt gradient with soft animated gold/raspberry/lime
 * paint-splash blurs.
 */
export default function VideoFallback({
  state = "empty",
  message,
  icon,
  className = "",
  variant = "card",
  onRetry,
  retryLabel = "Retry",
}: VideoFallbackProps) {
  const isHero = variant === "hero";
  const def = DEFAULTS[state];
  const Icon = icon ?? def.icon;
  const text = message === undefined ? def.message : message;
  const showRetry = state === "error" && typeof onRetry === "function";

  // Loading + error overlays must paint ON TOP of any sibling poster/video so
  // users never see a partially-blank video area. The silent "empty" base
  // gradient stays behind so a poster can still show through.
  const overlayZ = state === "loading" || state === "error" ? "z-30" : "z-0";

  return (
    <div
      role={state === "error" ? "alert" : undefined}
      aria-live={state === "loading" ? "polite" : undefined}
      aria-hidden={text || showRetry ? undefined : true}
      className={`absolute inset-0 ${overlayZ} overflow-hidden bg-gradient-to-br from-navy via-[#001a4d] to-cobalt ${className}`}
    >

      <div
        className={`absolute -top-24 -left-20 rounded-full bg-gold/20 blur-3xl animate-pulse ${
          isHero ? "h-[28rem] w-[28rem]" : "h-72 w-72"
        }`}
      />
      <div
        className={`absolute -bottom-24 -right-20 rounded-full bg-raspberry/20 blur-3xl animate-pulse ${
          isHero ? "h-[32rem] w-[32rem]" : "h-72 w-72"
        }`}
        style={{ animationDelay: "1.2s" }}
      />
      {isHero && (
        <div
          className="absolute top-1/3 right-1/4 h-64 w-64 rounded-full bg-lime/15 blur-3xl animate-pulse"
          style={{ animationDelay: "2.4s" }}
        />
      )}
      {(text || showRetry) && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-white/90 text-center px-6">
          {text && (
            <>
              <Icon
                className={`${isHero ? "w-12 h-12" : "w-10 h-10"} ${
                  def.spin && !icon ? "animate-spin opacity-90" : "opacity-70"
                }`}
              />
              <span className="text-sm font-medium">{text}</span>
            </>
          )}
          {showRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="mt-1 inline-flex items-center gap-2 rounded-full bg-white/10 hover:bg-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70 px-4 py-2 text-sm font-semibold text-white transition-colors backdrop-blur-sm border border-white/20"
            >
              <RotateCw className="w-4 h-4" aria-hidden="true" />
              {retryLabel}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
