import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={cn("w-16 h-16 fill-current text-primary", className)}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      <g filter="url(#glow)">
        <path d="M50,5 L95,27.5 L95,72.5 L50,95 L5,72.5 L5,27.5 L50,5 Z" stroke="hsl(var(--accent))" strokeWidth="4" fill="none" />
        <text
          x="50"
          y="62"
          fontSize="36"
          fontWeight="bold"
          textAnchor="middle"
          fill="hsl(var(--accent))"
          className="font-headline uppercase"
        >
          38
        </text>
      </g>
    </svg>
  );
}
