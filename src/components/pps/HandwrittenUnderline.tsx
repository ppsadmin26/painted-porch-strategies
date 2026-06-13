import { useEffect, useRef, useState } from "react";

interface HandwrittenUnderlineProps {
  children: React.ReactNode;
  color?: string;
  delay?: number;
  duration?: number;
  className?: string;
}

/**
 * Wraps a word with a hand-drawn SVG underline that animates
 * as if being written when it scrolls into view.
 */
export const HandwrittenUnderline = ({
  children,
  color = "currentColor",
  delay = 0,
  duration = 900,
  className = "",
}: HandwrittenUnderlineProps) => {
  const ref = useRef<HTMLSpanElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    if (!ref.current) return;
    const node = ref.current;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.6 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <span ref={ref} className={`relative inline-block ${className}`}>
      {children}
      <svg
        aria-hidden="true"
        viewBox="0 0 100 12"
        preserveAspectRatio="none"
        className="absolute left-0 right-0 -bottom-2 w-full h-[0.5em] pointer-events-none overflow-visible"
      >
        <path
          d="M1.5 7 C 15 3, 32 10, 50 6 S 85 3, 98.5 6.5"
          fill="none"
          stroke={color}
          strokeWidth="2.5"
          strokeLinecap="round"
          style={{
            strokeDasharray: 120,
            strokeDashoffset: inView ? 0 : 120,
            transition: `stroke-dashoffset ${duration}ms cubic-bezier(0.65, 0, 0.35, 1) ${delay}ms`,
          }}
        />
      </svg>
    </span>
  );
};

export default HandwrittenUnderline;
