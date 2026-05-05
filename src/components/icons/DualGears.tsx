/**
 * Custom Dual Gears Icon - Two interlocking gears
 * Used for Working Genius assessment
 */

interface DualGearsProps {
  className?: string;
}

export function DualGears({ className = "w-6 h-6" }: DualGearsProps) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="currentColor"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* First gear (larger, top-left) */}
      <g transform="translate(8, 8)">
        {/* Gear teeth */}
        <path d="M22 0h6v8h-6zM22 42h6v8h-6zM0 22v6h8v-6zM42 22v6h8v-6zM6.5 6.5l4.2 4.2 5.7-5.7-4.2-4.2zM33.6 33.6l4.2 4.2 5.7-5.7-4.2-4.2zM6.5 43.5l5.7-5.7 4.2 4.2-5.7 5.7zM33.6 16.4l5.7-5.7 4.2 4.2-5.7 5.7z" />
        {/* Center circle (body of gear) */}
        <circle cx="25" cy="25" r="16" />
        {/* Inner hole */}
        <circle cx="25" cy="25" r="6" className="fill-background" />
      </g>
      
      {/* Second gear (smaller, bottom-right) */}
      <g transform="translate(48, 48)">
        {/* Gear teeth */}
        <path d="M17 0h5v6h-5zM17 33h5v6h-5zM0 17v5h6v-5zM33 17v5h6v-5zM5 5l3.5 3.5 4.5-4.5-3.5-3.5zM26 26l3.5 3.5 4.5-4.5-3.5-3.5zM5 34l4.5-4.5 3.5 3.5-4.5 4.5zM26 13l4.5-4.5 3.5 3.5-4.5 4.5z" />
        {/* Center circle (body of gear) */}
        <circle cx="19.5" cy="19.5" r="13" />
        {/* Inner hole */}
        <circle cx="19.5" cy="19.5" r="5" className="fill-background" />
      </g>
    </svg>
  );
}
