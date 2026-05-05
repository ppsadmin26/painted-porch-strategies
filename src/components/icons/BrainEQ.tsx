/**
 * Custom Brain EQ Icon - Brain with gears (left) and heart (right)
 * Used for EQ-i 2.0 Emotional Intelligence assessment
 */

interface BrainEQProps {
  className?: string;
}

export function BrainEQ({ className = "w-6 h-6" }: BrainEQProps) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="currentColor"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Left brain half with gears */}
      <path d="M48 10c-5 0-9 2-12 5-2-1-5-2-7-1-5 1-9 5-10 10-4 2-7 6-8 11-1 4 0 8 2 11-2 3-3 7-2 11 1 5 5 9 10 10 1 2 3 4 5 5 3 3 7 4 11 4 3 5 8 9 14 10v-8c-4-1-7-3-9-6l-1-2-2 1c-3 0-6-1-8-3-1-1-2-2-3-4l-1-2-2 1c-3-1-6-3-7-7-1-2-1-5 1-7l1-2-2-1c-2-2-3-5-2-8 1-4 3-7 6-8l2-1-1-2c0-4 3-7 7-8 2 0 4 0 5 1l2 1 1-2c2-3 5-5 9-5v-8z" />
      
      {/* Right brain half with heart */}
      <path d="M52 10v8c4 0 7 2 9 5l1 2 2-1c2-1 4-1 5-1 4 1 7 4 7 8l-1 2 2 1c3 1 5 4 6 8 1 3 0 6-2 8l-2 1 1 2c2 2 2 5 1 7-1 4-4 6-7 7l-2-1-1 2c-1 2-2 3-3 4-2 2-5 3-8 3l-2-1-1 2c-2 3-5 5-9 6v8c6-1 11-5 14-10 4 0 8-1 11-4 2-1 4-3 5-5 5-1 9-5 10-10 1-4 0-8-2-11 2-3 3-7 2-11-1-5-4-9-8-11-1-5-5-9-10-10-2-1-5 0-7 1-3-3-7-5-12-5z" />
      
      {/* Large gear on left brain */}
      <g transform="translate(20, 35)">
        <circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" strokeWidth="2" className="fill-background" />
        <path d="M12 0l2 4h-4l2-4zm0 24l-2-4h4l-2 4zm12-12l-4 2v-4l4 2zm-24 0l4-2v4l-4-2zm20.5-8.5l-3.5 2.5-1.5-2.5 3.5-2.5zm-17 17l3.5-2.5 1.5 2.5-3.5 2.5zm17 0l-2.5-3.5 2.5-1.5 2.5 3.5zm-17-17l2.5 3.5-2.5 1.5-2.5-3.5z" />
      </g>
      
      {/* Small gear on left brain */}
      <g transform="translate(28, 55)">
        <circle cx="6" cy="6" r="2" fill="none" stroke="currentColor" strokeWidth="1.5" className="fill-background" />
        <path d="M6 0l1 2h-2l1-2zm0 12l-1-2h2l-1 2zm6-6l-2 1v-2l2 1zm-12 0l2-1v2l-2-1z" />
      </g>
      
      {/* Heart on right brain */}
      <path 
        d="M72 42c-3-4-8-4-11-1l-1 1-1-1c-3-3-8-3-11 1-3 4-3 9 0 13l12 12 12-12c3-4 3-9 0-13z" 
        className="fill-current"
      />
    </svg>
  );
}
