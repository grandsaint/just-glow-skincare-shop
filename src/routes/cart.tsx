import { createFileRoute, Link } from "@tanstack/react-router";
import { ShoppingBag, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { QuantitySelector } from "@/components/site/QuantitySelector";
import { useCart } from "@/lib/cart";
import { formatNaira } from "@/lib/format";
import { PLACEHOLDER_IMAGE } from "@/lib/types";

export const Route = createFileRoute("/cart")({
  head: () => ({ meta: [
    { title: "Your Shopping Bag | JUST GLOW" },
    { name: "description", content: "Review your JUST GLOW shopping bag." },
    { property: "og:title", content: "Your Shopping Bag | JUST GLOW" },
    { property: "og:description", content: "Review your JUST GLOW shopping bag." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: CartPage,
});

function CartPage() {
  const { items, subtotal, hydrated, setQuantity, removeItem } = useCart();
  return <main className="container-shop min-h-[52vh] py-12 md:py-16"><p className="eyebrow">YOUR EDIT</p><h1 className="mt-3 text-3xl font-semibold md:text-4xl">Your shopping bag</h1>
    {!hydrated ? <p className="mt-8 text-sm text-muted-foreground">Loading your bag…</p> : items.length === 0 ? <div className="mt-12 flex flex-col items-center border-y border-border py-16 text-center"><ShoppingBag className="h-10 w-10 text-primary" /><p className="mt-5 text-xl font-semibold">Your bag is taking a little breather.</p><p className="mt-2 text-sm text-muted-foreground">Find something lovely to add to your routine.</p><Button asChild variant="brand" className="mt-6"><Link to="/shop">Explore the shop</Link></Button></div> : <div className="mt-9 grid gap-10 lg:grid-cols-[1fr_340px]">
      <div className="divide-y divide-border">{items.map((item) => <article key={item.id} className="flex gap-4 py-5 first:pt-0"><Link to="/product/$slug" params={{ slug: item.slug }} className="h-24 w-24 shrink-0 overflow-hidden bg-peach sm:h-32 sm:w-32"><img src={item.image || PLACEHOLDER_IMAGE} alt={item.name} className="h-full w-full object-cover" /></Link><div className="flex min-w-0 flex-1 flex-col justify-between gap-3 sm:flex-row sm:items-center"><div className="min-w-0"><Link to="/product/$slug" params={{ slug: item.slug }} className="line-clamp-2 font-semibold hover:text-primary">{item.name}</Link><p className="mt-1 text-sm text-primary">{formatNaira(item.price)}</p></div><div className="flex items-center justify-between gap-4 sm:justify-end"><QuantitySelector value={item.quantity} onChange={(value) => setQuantity(item.id, value)} size="sm" /><span className="w-20 text-right text-sm font-semibold">{formatNaira(item.price * item.quantity)}</span><Button type="button" variant="ghost" size="icon" aria-label={`Remove ${item.name}`} onClick={() => removeItem(item.id)}><Trash2 /></Button></div></div></article>)}</div>
      <aside className="h-fit border border-border p-6"><h2 className="text-lg font-semibold">Order summary</h2><div className="mt-5 flex justify-between border-t border-border pt-4 text-sm"><span>Subtotal</span><span className="font-semibold">{formatNaira(subtotal)}</span></div><p className="mt-3 text-xs leading-5 text-muted-foreground">Delivery details and any applicable fees are confirmed with your order.</p><Button asChild variant="brand" size="xl" className="mt-6 w-full"><Link to="/checkout">Continue to checkout</Link></Button><Button asChild variant="ghost" className="mt-2 w-full"><Link to="/shop">Continue shopping</Link></Button></aside>
    </div>}
  </main>;
}