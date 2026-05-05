import { useEffect, useRef, useState } from "react";
import { Play } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { verifySiteVideoUrl } from "@/lib/verifySiteVideo";
import VideoFallback from "@/components/pps/VideoFallback";

interface LazyPreviewVideoProps {
  /** Slot key registered in the site_videos table (admin-managed) */
  slotKey: string;
  /** Fallback video URL if the slot has not been set yet */
  fallbackVideoUrl: string;
  /** Fallback poster image if no poster has been uploaded */
  fallbackPosterUrl?: string;
  /** Tailwind classes for the play button background (default raspberry) */
  playButtonClassName?: string;
  /** Optional aria-label for the play button */
  ariaLabel?: string;
  /** Optional className for the outer container */
  className?: string;
}

/**
 * Lazy-loaded preview video:
 *  1. Fetches the latest URL from `site_videos` (so admins can swap without code).
 *  2. Defers mounting the <video> element until the section scrolls into view.
 *  3. Defers downloading any video bytes until the user clicks play.
 *  4. Falls back gracefully when the slot or poster is missing.
 */
export default function LazyPreviewVideo({
  slotKey,
  fallbackVideoUrl,
  fallbackPosterUrl,
  playButtonClassName = "bg-raspberry",
  ariaLabel = "Play preview video",
  className = "",
}: LazyPreviewVideoProps) {
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [posterUrl, setPosterUrl] = useState<string | null>(fallbackPosterUrl ?? null);
  const [showVideo, setShowVideo] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [resolved, setResolved] = useState(false);
  const [videoErrored, setVideoErrored] = useState(false);
  const [retryToken, setRetryToken] = useState(0);
  const sectionRef = useRef<HTMLDivElement | null>(null);

  // Pull the latest swappable URL from the registry
  useEffect(() => {
    let cancelled = false;
    setResolved(false);
    supabase
      .from("site_videos")
      .select("video_url, poster_url")
      .eq("slot_key", slotKey)
      .maybeSingle()
      .then(({ data }) => {
        if (cancelled) return;
        const resolvedUrl = data?.video_url ?? fallbackVideoUrl;
        setVideoUrl(resolvedUrl);
        setPosterUrl(data?.poster_url ?? fallbackPosterUrl ?? null);
        setResolved(true);
        verifySiteVideoUrl(slotKey, resolvedUrl);
      });
    return () => {
      cancelled = true;
    };
  }, [slotKey, fallbackVideoUrl, fallbackPosterUrl, retryToken]);

  const handleRetry = () => {
    setVideoErrored(false);
    setIsPlaying(false);
    setShowVideo(true);
    setRetryToken((n) => n + 1);
  };

  // Mount the <video> element only when the section nears the viewport
  useEffect(() => {
    const el = sectionRef.current;
    if (!el || showVideo) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setShowVideo(true);
          io.disconnect();
        }
      },
      { rootMargin: "200px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [showVideo]);

  const errored = resolved && videoErrored;
  const missing = resolved && !videoUrl;
  const loading = !resolved;

  return (
    <div
      ref={sectionRef}
      data-testid="lazy-preview-video"
      className={`relative isolate rounded-xl overflow-hidden shadow-lg bg-black aspect-video ${className}`}
    >
      {errored ? (
        <VideoFallback variant="card" state="error" onRetry={handleRetry} />
      ) : missing ? (
        <VideoFallback variant="card" state="empty" />
      ) : loading ? (
        <VideoFallback variant="card" state="loading" />
      ) : !showVideo || !videoUrl ? (
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={
            posterUrl
              ? { backgroundImage: `url(${posterUrl})`, backgroundSize: "cover", backgroundPosition: "center" }
              : undefined
          }
        >
          {!posterUrl && <VideoFallback variant="card" state="loading" />}
        </div>
      ) : !isPlaying ? (
        <button
          type="button"
          onClick={() => setIsPlaying(true)}
          aria-label={ariaLabel}
          className="absolute inset-0 flex items-center justify-center bg-navy/90 group cursor-pointer"
          style={
            posterUrl
              ? { backgroundImage: `url(${posterUrl})`, backgroundSize: "cover", backgroundPosition: "center" }
              : undefined
          }
        >
          <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-colors" />
          <div
            className={`relative flex items-center justify-center w-20 h-20 rounded-full text-white shadow-xl group-hover:scale-105 transition-transform ${playButtonClassName}`}
          >
            <Play className="w-8 h-8 ml-1" fill="currentColor" />
          </div>
        </button>
      ) : (
        <video
          src={videoUrl}
          poster={posterUrl ?? undefined}
          controls
          autoPlay
          playsInline
          preload="auto"
          onError={() => setVideoErrored(true)}
          className="absolute inset-0 w-full h-full"
        >
          Your browser does not support the video tag.
        </video>
      )}
    </div>
  );
}
