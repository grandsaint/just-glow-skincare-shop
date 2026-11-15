import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  size?: "sm" | "md";
  className?: string;
}

export function QuantitySelector({ value, onChange, min = 1, max = 99, size = "md", className }: Props) {
  const btn = size === "sm" ? "h-8 w-8" : "h-10 w-10";
  return (
    <div className={cn("inline-flex items-center rounded-full border border-input bg-background", className)}>
      <button
        type="button"
        aria-label="Decrease quantity"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        className={cn(btn, "grid place-items-center rounded-full text-foreground transition-colors hover:bg-peach hover:text-primary disabled:opacity-40")}
      >
        <Minus className="h-3.5 w-3.5" />
      </button>
      <span aria-live="polite" className={cn("min-w-8 text-center font-semibold tabular-nums", size === "sm" ? "text-sm" : "text-base")}>
        {value}
      </span>
      <button
        type="button"
        aria-label="Increase quantity"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        className={cn(btn, "grid place-items-center rounded-full text-foreground transition-colors hover:bg-peach hover:text-primary disabled:opacity-40")}
      >
        <Plus className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
