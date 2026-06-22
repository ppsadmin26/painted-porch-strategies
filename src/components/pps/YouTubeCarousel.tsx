import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Play } from "lucide-react";

export interface YouTubeVideoItem {
  id: string;
  title: string;
}

interface YouTubeCarouselProps {
  videos: YouTubeVideoItem[];
  getHref: (video: YouTubeVideoItem) => string;
}

const SCROLL_AMOUNT = 320; // 300px card width + 20px gap
const SWIPE_THRESHOLD = 50;
const SWIPE_TIMEOUT = 500;

export function YouTubeCarousel({ videos, getHref }: YouTubeCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const touchStart = useRef<{ x: number; y: number; time: number } | null>(null);
  const isSwiping = useRef(false);
  const didSwipe = useRef(false);

  const updateScrollState = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 1);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
  };

  useEffect(() => {
    updateScrollState();
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener("scroll", updateScrollState, { passive: true });
    window.addEventListener("resize", updateScrollState);
    return () => {
      el.removeEventListener("scroll", updateScrollState);
      window.removeEventListener("resize", updateScrollState);
    };
  }, []);

  const scroll = (direction: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({
      left: direction === "left" ? -SCROLL_AMOUNT : SCROLL_AMOUNT,
      behavior: "smooth",
    });
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    const t = e.touches[0];
    touchStart.current = { x: t.clientX, y: t.clientY, time: Date.now() };
    isSwiping.current = false;
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!touchStart.current) return;
    const t = e.touches[0];
    const dx = touchStart.current.x - t.clientX;
    const dy = touchStart.current.y - t.clientY;

    // Once movement is clearly horizontal, mark as a swipe.
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 10) {
      isSwiping.current = true;
    }
  };

  const handleTouchEnd = () => {
    if (!touchStart.current) return;
    const elapsed = Date.now() - touchStart.current.time;
    touchStart.current = null;

    if (isSwiping.current && elapsed < SWIPE_TIMEOUT) {
      didSwipe.current = true;
      // Clear the swipe flag after the delayed click would have fired.
      setTimeout(() => {
        didSwipe.current = false;
      }, 100);
    }
  };

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (didSwipe.current) {
      e.preventDefault();
      didSwipe.current = false;
    }
  };

  return (
    <div className="relative" onClick={handleClick}>
      <div
        ref={scrollRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="flex gap-5 overflow-x-auto pb-6 snap-x snap-mandatory"
        style={{
          scrollbarWidth: "thin",
          scrollbarColor: "hsl(var(--primary) / 0.5) transparent",
          touchAction: "pan-y",
        }}
      >
        {videos.map((video) => (
          <a
            key={video.id}
            href={getHref(video)}
            target="_blank"
            rel="noopener noreferrer"
            className="group snap-start flex-shrink-0 w-[300px] block select-none"
          >
            <div className="relative aspect-video rounded-xl overflow-hidden bg-navy/10 shadow-md">
              <img
                src={`https://img.youtube.com/vi/${video.id}/mqdefault.jpg`}
                alt={video.title}
                loading="lazy"
                draggable={false}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 select-none"
              />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                <div className="w-14 h-14 rounded-full bg-raspberry/90 flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                  <Play className="w-6 h-6 text-white ml-0.5" fill="white" />
                </div>
              </div>
            </div>
            <h3 className="text-sm font-semibold text-navy mt-3 line-clamp-2 group-hover:text-primary transition-colors text-left">
              {video.title}
            </h3>
          </a>
        ))}
      </div>

      {/* Mobile navigation arrows */}
      <div className="flex items-center justify-center gap-6 mt-2 md:hidden">
        <button
          type="button"
          onClick={() => scroll("left")}
          disabled={!canScrollLeft}
          className="h-10 w-10 rounded-full border-2 border-primary text-primary flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed active:bg-primary active:text-white transition-colors"
          aria-label="Previous video"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          type="button"
          onClick={() => scroll("right")}
          disabled={!canScrollRight}
          className="h-10 w-10 rounded-full border-2 border-primary text-primary flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed active:bg-primary active:text-white transition-colors"
          aria-label="Next video"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
