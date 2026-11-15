import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ProductCard } from "@/components/site/ProductCard";
import { catalogQuery } from "@/lib/queries";

export const Route = createFileRoute("/collections/$slug")({
  loader: async ({ context, params }) => {
    const data = await context.queryClient.ensureQueryData(catalogQuery);
    const cat = data.categories.find((c) => c.slug === params.slug);
    if (!cat) throw notFound();
    return { name: cat.name, description: cat.description };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: loaderData ? `${loaderData.name} | Just Glow` : "Collection | Just Glow" },
      { name: "description", content: loaderData?.description ?? "Just Glow skincare collection." },
      { property: "og:title", content: loaderData?.name ?? "Just Glow collection" },
      { property: "og:description", content: loaderData?.description ?? "Just Glow skincare collection." },
      { property: "og:type", content: "website" },
    ],
  }),
  component: CollectionPage,
  notFoundComponent: () => <div className="container-shop py-24 text-center">Collection not found. <Link to="/" className="text-primary underline">Go home</Link></div>,
  errorComponent: () => <div className="container-shop py-24 text-center">This collection couldn't load.</div>,
});

function CollectionPage() {
  const { slug } = Route.useParams();
  const { data } = useSuspenseQuery(catalogQuery);
  const cat = data.categories.find((c) => c.slug === slug)!;
  const products = data.products.filter((p) => p.category_id === cat.id);
  return (
    <main className="container-shop py-12 md:py-20">
      <h1 className="text-3xl font-bold md:text-4xl">{cat.name}</h1>
      <p className="mt-2 text-muted-foreground">{cat.description}</p>
      <div className="mt-10 grid grid-cols-2 gap-4 md:gap-6 lg:grid-cols-4">
        {products.map((p) => <ProductCard key={p.id} product={p} showDescription />)}
      </div>
    </main>
  );
}
