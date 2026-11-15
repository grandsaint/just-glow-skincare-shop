import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

export function Logo({ className, inverted = false }: { className?: string; inverted?: boolean }) {
  return (
    <Link to="/" aria-label="Just Glow home" className={cn("group inline-flex items-baseline gap-1 leading-none", className)}>
      <span className={cn("text-xl font-bold tracking-[0.32em] md:text-2xl", inverted ? "text-primary-foreground" : "text-foreground")}>
        JUST
      </span>
      <span className={cn("font-script text-4xl md:text-5xl -ml-0.5 transition-transform group-hover:-rotate-3", inverted ? "text-primary-foreground" : "text-primary")}>
        Glow
      </span>
    </Link>
  );
}
