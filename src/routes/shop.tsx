import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Search, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ProductCard } from "@/components/site/ProductCard";
import { SectionHeading } from "@/components/site/SectionHeading";
import { catalogQuery } from "@/lib/queries";

export const Route = createFileRoute("/shop")({
  loader: ({ context }) => context.queryClient.ensureQueryData(catalogQuery),
  head: () => ({ meta: [
    { title: "Shop Skincare & Body Care | JUST GLOW" },
    { name: "description", content: "Explore skincare, body care, soaps, scrubs, oils and more from JUST GLOW." },
    { property: "og:title", content: "Shop Skincare & Body Care | JUST GLOW" },
    { property: "og:description", content: "Explore skincare, body care, soaps, scrubs, oils and more from JUST GLOW." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: ShopPage,
});

function ShopPage() {
  const { data } = useSuspenseQuery(catalogQuery);
  const [term, setTerm] = useState("");
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState("featured");
  const products = useMemo(() => {
    const matching = data.products.filter((product) => {
      const matchesTerm = `${product.name} ${product.short_description}`.toLowerCase().includes(term.toLowerCase());
      return matchesTerm && (category === "all" || product.category_id === category);
    });
    return [...matching].sort((a, b) => sort === "price-low" ? a.price - b.price : sort === "price-high" ? b.price - a.price : sort === "name" ? a.name.localeCompare(b.name) : Number(b.featured) - Number(a.featured));
  }, [data.products, term, category, sort]);
  return <main className="container-shop py-12 md:py-16">
    <div className="border-b border-border pb-10"><SectionHeading align="left" eyebrow="THE JUST GLOW EDIT" script="Find your favourites" title="Shop all" intro="Everyday skincare and body care, gathered in one lovely place." /></div>
    <div className="flex flex-col gap-4 border-b border-border py-5 md:flex-row md:items-center md:justify-between"><div className="relative w-full md:max-w-sm"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input aria-label="Search products" value={term} onChange={(event) => setTerm(event.target.value)} placeholder="Search the collection" className="pl-9" /></div><div className="grid grid-cols-2 gap-3"><Select value={category} onValueChange={setCategory}><SelectTrigger aria-label="Filter by collection" className="w-full min-w-40"><SlidersHorizontal className="mr-2 h-4 w-4" /><SelectValue placeholder="All collections" /></SelectTrigger><SelectContent><SelectItem value="all">All collections</SelectItem>{data.categories.map((item) => <SelectItem key={item.id} value={item.id}>{item.name}</SelectItem>)}</SelectContent></Select><Select value={sort} onValueChange={setSort}><SelectTrigger aria-label="Sort products" className="w-full min-w-36"><SelectValue placeholder="Featured" /></SelectTrigger><SelectContent><SelectItem value="featured">Featured</SelectItem><SelectItem value="price-low">Price: low to high</SelectItem><SelectItem value="price-high">Price: high to low</SelectItem><SelectItem value="name">Name: A–Z</SelectItem></SelectContent></Select></div></div>
    <p className="py-5 text-sm text-muted-foreground">{products.length} {products.length === 1 ? "product" : "products"}</p>
    {products.length ? <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6 lg:grid-cols-4">{products.map((product) => <ProductCard key={product.id} product={product} showDescription />)}</div> : <div className="py-20 text-center"><p className="text-lg font-semibold">Nothing found just yet</p><p className="mt-2 text-sm text-muted-foreground">Try another search or collection.</p></div>}
  </main>;
}