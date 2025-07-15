import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={cn("w-16 h-16 fill-current text-primary", className)}
      xmlns="http://www.w3.org/2000/svg"
    >
      <g>
        <path d="M50,5 L95,27.5 L95,72.5 L50,95 L5,72.5 L5,27.5 L50,5 Z" stroke="hsl(var(--accent))" strokeWidth="4" fill="none" />
        <text
          x="50"
          y="58"
          fontSize="32"
          fontWeight="bold"
          textAnchor="middle"
          fill="hsl(var(--accent))"
          className="font-headline"
        >
          38
        </text>
      </g>
    </svg>
  );
}
