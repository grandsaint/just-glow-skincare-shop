import { useState } from "react";
import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { QuantitySelector } from "@/components/site/QuantitySelector";
import { catalogQuery } from "@/lib/queries";
import { useCart } from "@/lib/cart";
import { formatNaira } from "@/lib/format";
import { PLACEHOLDER_IMAGE } from "@/lib/types";

export const Route = createFileRoute("/product/$slug")({
  loader: async ({ context, params }) => {
    const data = await context.queryClient.ensureQueryData(catalogQuery);
    const product = data.products.find((p) => p.slug === params.slug);
    if (!product) throw notFound();
    return { name: product.name, description: product.short_description };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: loaderData ? `${loaderData.name} | Just Glow` : "Product | Just Glow" },
      { name: "description", content: loaderData?.description ?? "Just Glow skincare product." },
      { property: "og:title", content: loaderData?.name ?? "Just Glow product" },
      { property: "og:description", content: loaderData?.description ?? "Just Glow skincare product." },
      { property: "og:type", content: "product" },
    ],
  }),
  component: ProductPage,
  notFoundComponent: () => <div className="container-shop py-24 text-center">Product not found. <Link to="/" className="text-primary underline">Go home</Link></div>,
  errorComponent: () => <div className="container-shop py-24 text-center">This product couldn't load.</div>,
});

function ProductPage() {
  const { slug } = Route.useParams();
  const { data } = useSuspenseQuery(catalogQuery);
  const product = data.products.find((p) => p.slug === slug)!;
  const [qty, setQty] = useState(1);
  const { addItem } = useCart();
  return (
    <main className="container-shop grid gap-10 py-12 md:grid-cols-2 md:py-20">
      <img src={product.image_url || PLACEHOLDER_IMAGE} alt={product.name} className="aspect-square w-full rounded-3xl object-cover shadow-card" />
      <div className="flex flex-col gap-5">
        <h1 className="text-3xl font-bold md:text-4xl">{product.name}</h1>
        <p className="text-2xl font-bold text-primary">{formatNaira(product.price)}</p>
        <p className="text-muted-foreground">{product.description}</p>
        <div className="flex flex-wrap items-center gap-3">
          <QuantitySelector value={qty} onChange={setQty} />
          <Button variant="brand" size="lg" onClick={() => { addItem(product, qty); toast.success(`${qty} × ${product.name} added to your cart`); }}>Add to Cart</Button>
        </div>
      </div>
    </main>
  );
}
