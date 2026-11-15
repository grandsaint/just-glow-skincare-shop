import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart";
import { formatNaira } from "@/lib/format";
import { PLACEHOLDER_IMAGE, type Product } from "@/lib/types";
import { QuantitySelector } from "./QuantitySelector";

export function ProductCard({ product, showDescription = false, categoryName }: { product: Product; showDescription?: boolean; categoryName?: string }) {
  const [qty, setQty] = useState(1);
  const { addItem } = useCart();

  const add = () => {
    addItem(product, qty);
    toast.success(`${qty} × ${product.name} added to your cart`);
    setQty(1);
  };

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-soft transition-all duration-500 hover:-translate-y-1.5 hover:shadow-card">
      <Link to="/product/$slug" params={{ slug: product.slug }} className="relative block aspect-square overflow-hidden bg-peach">
        <img
          src={product.image_url || PLACEHOLDER_IMAGE}
          alt={product.name}
          loading="lazy"
          width={600}
          height={600}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        {categoryName && (
          <span className="absolute left-3 top-3 rounded-full bg-background/90 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-widest text-primary-deep backdrop-blur">
            {categoryName}
          </span>
        )}
      </Link>
      <div className="flex flex-1 flex-col gap-3 p-4 md:p-5">
        <Link to="/product/$slug" params={{ slug: product.slug }} className="hover:text-primary">
          <h3 className="line-clamp-2 text-sm font-bold leading-snug md:text-base">{product.name}</h3>
        </Link>
        {showDescription && <p className="line-clamp-2 text-sm text-muted-foreground">{product.short_description}</p>}
        <p className="text-lg font-bold text-primary md:text-xl">{formatNaira(product.price)}</p>
        <div className="mt-auto flex flex-col gap-2.5 sm:flex-row sm:items-center">
          <QuantitySelector value={qty} onChange={setQty} size="sm" className="self-start" />
          <Button variant="brand" size="sm" className="h-9 flex-1 px-3 text-[0.7rem]" onClick={add}>
            <ShoppingBag /> Add to Cart
          </Button>
        </div>
      </div>
    </article>
  );
}
