import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function SectionHeading({ eyebrow, script, title, intro, align = "center", className }: {
  eyebrow?: string;
  script?: string;
  title: ReactNode;
  intro?: ReactNode;
  align?: "center" | "left";
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-3", align === "center" ? "items-center text-center" : "items-start text-left", className)}>
      {eyebrow && <span className="eyebrow">{eyebrow}</span>}
      {script && <span className="font-script -mb-3 text-4xl text-primary md:text-5xl">{script}</span>}
      <h2 className="text-3xl font-bold tracking-tight md:text-4xl">{title}</h2>
      {intro && <p className="max-w-xl text-muted-foreground">{intro}</p>}
    </div>
  );
}
