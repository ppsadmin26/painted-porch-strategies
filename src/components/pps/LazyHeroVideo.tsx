import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { verifySiteVideoUrl } from "@/lib/verifySiteVideo";
import VideoFallback from "@/components/pps/VideoFallback";

interface LazyHeroVideoProps {
  /** Slot key registered in the site_videos table (admin-managed) */
  slotKey: string;
  /** Fallback poster image rendered instantly while the URL is fetched / video loads */
  posterUrl: string;
  /** Optional fallback video URL if the slot row hasn't been created yet */
  fallbackVideoUrl?: string;
  /** className applied to the <video> / poster container */
  className?: string;
  /** Extra classes applied to the inner <img>/<video> (e.g. object-position overrides) */
  mediaClassName?: string;
  /** Style applied to the <video> / poster container */
  style?: React.CSSProperties;
}

/**
 * Background-video version of LazyPreviewVideo.
 *
 * - Renders the poster image immediately so the section never looks blank.
 * - Pulls the latest video URL from `site_videos` (admins can swap without code).
 * - Defers mounting the <video> element until the section nears the viewport.
 * - Once visible, autoplays muted/looped/inline (browser-friendly autoplay).
 * - Falls back to the poster if the video fails to load.
 */
export default function LazyHeroVideo({
  slotKey,
  posterUrl,
  fallbackVideoUrl,
  className = "absolute inset-0 w-full h-full object-cover",
  style,
}: LazyHeroVideoProps) {
  const [videoUrl, setVideoUrl] = useState<string | null>(fallbackVideoUrl ?? null);
  const [shouldMount, setShouldMount] = useState(false);
  const [errored, setErrored] = useState(false);
  const [posterFailed, setPosterFailed] = useState(false);
  const [retryToken, setRetryToken] = useState(0);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Resolve the latest URL from the registry
  useEffect(() => {
    let cancelled = false;
    supabase
      .from("site_videos")
      .select("video_url")
      .eq("slot_key", slotKey)
      .maybeSingle()
      .then(({ data }) => {
        if (cancelled) return;
        const resolved = data?.video_url ?? null;
        if (resolved) setVideoUrl(resolved);
        verifySiteVideoUrl(slotKey, resolved);
      });
    return () => {
      cancelled = true;
    };
  }, [slotKey, retryToken]);

  // Mount the <video> only when the hero is near the viewport
  useEffect(() => {
    const el = containerRef.current;
    if (!el || shouldMount) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setShouldMount(true);
          io.disconnect();
        }
      },
      { rootMargin: "200px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [shouldMount]);

  const showErrorFallback = errored || posterFailed;
  const handleRetry = () => {
    setErrored(false);
    setPosterFailed(false);
    setShouldMount(true);
    setRetryToken((n) => n + 1);
  };

  return (
    <div ref={containerRef} className={`${className} isolate`} style={style} data-testid="lazy-hero-video">
      {/* Branded gradient base, shows through if poster/video fail */}
      {showErrorFallback ? (
        <VideoFallback variant="hero" state="error" onRetry={handleRetry} />
      ) : (
        <VideoFallback message={null} variant="hero" />
      )}
      {/* Poster always rendered, instant paint, also covers if video fails */}
      {!posterFailed && (
        <img
          src={posterUrl}
          alt=""
          aria-hidden="true"
          onError={() => setPosterFailed(true)}
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}
      {shouldMount && videoUrl && !errored && (
        <video
          src={videoUrl}
          poster={posterUrl}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          onError={() => setErrored(true)}
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}
    </div>
  );
}
