import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { PLACEHOLDER_IMAGE, type Category } from "@/lib/types";

export function CollectionCard({ category, className, count }: { category: Category; className?: string; count?: number }) {
  return (
    <Link
      to="/collections/$slug"
      params={{ slug: category.slug }}
      className={cn("group relative isolate block min-h-72 overflow-hidden rounded-3xl shadow-soft", className)}
    >
      <img
        src={category.image_url || PLACEHOLDER_IMAGE}
        alt={category.name}
        loading="lazy"
        className="absolute inset-0 -z-10 h-full w-full scale-110 object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-100"
      />
      <div className="absolute inset-0 -z-10 bg-card-overlay transition-opacity duration-500 group-hover:opacity-90" />
      <div className="flex h-full min-h-72 flex-col justify-end p-6 text-primary-foreground">
        {typeof count === "number" && (
          <span className="text-xs font-medium uppercase tracking-[0.2em] opacity-85">{count} {count === 1 ? "product" : "products"}</span>
        )}
        <div className="mt-1 flex items-end justify-between gap-3">
          <h3 className="text-2xl font-bold md:text-3xl">{category.name}</h3>
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-background text-primary transition-transform duration-500 group-hover:rotate-45">
            <ArrowUpRight className="h-5 w-5" />
          </span>
        </div>
      </div>
    </Link>
  );
}
