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

const CACHE_PREFIX = "site_videos:url:";

function readCachedUrl(slotKey: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(CACHE_PREFIX + slotKey);
  } catch {
    return null;
  }
}

function writeCachedUrl(slotKey: string, url: string | null): void {
  if (typeof window === "undefined") return;
  try {
    if (url) window.localStorage.setItem(CACHE_PREFIX + slotKey, url);
    else window.localStorage.removeItem(CACHE_PREFIX + slotKey);
  } catch {
    /* ignore quota / private-mode errors */
  }
}

/**
 * Background-video version of LazyPreviewVideo.
 *
 * - Renders the poster image immediately so the section never looks blank.
 * - Uses a localStorage-cached URL on first paint so the <video> can mount
 *   *before* the Supabase round-trip finishes (the cache is revalidated in
 *   the background and replaced if the admin swapped the asset).
 * - Falls back to the poster if the video fails to load.
 */
export default function LazyHeroVideo({
  slotKey,
  posterUrl,
  fallbackVideoUrl,
  className = "absolute inset-0 w-full h-full object-cover",
  mediaClassName = "",
  style,
}: LazyHeroVideoProps) {
  // Seed from cache (or fallback) so the <video> element can mount on first render.
  const [videoUrl, setVideoUrl] = useState<string | null>(
    () => readCachedUrl(slotKey) ?? fallbackVideoUrl ?? null,
  );
  const [errored, setErrored] = useState(false);
  const [posterFailed, setPosterFailed] = useState(false);
  const [retryToken, setRetryToken] = useState(0);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Revalidate the URL from the registry in the background.
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
        if (resolved) {
          setVideoUrl((current) => (current === resolved ? current : resolved));
          writeCachedUrl(slotKey, resolved);
        }
        verifySiteVideoUrl(slotKey, resolved);
      });
    return () => {
      cancelled = true;
    };
  }, [slotKey, retryToken]);

  const showErrorFallback = errored || posterFailed;
  const handleRetry = () => {
    setErrored(false);
    setPosterFailed(false);
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
          className={`absolute inset-0 w-full h-full object-cover ${mediaClassName}`}
        />
      )}
      {videoUrl && !errored && (
        <video
          key={videoUrl}
          src={videoUrl}
          poster={posterUrl}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          onError={() => setErrored(true)}
          className={`absolute inset-0 w-full h-full object-cover ${mediaClassName}`}
        />
      )}
    </div>
  );
}
