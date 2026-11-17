import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { CollectionCard } from "@/components/site/CollectionCard";
import { SectionHeading } from "@/components/site/SectionHeading";
import { catalogQuery } from "@/lib/queries";

export const Route = createFileRoute("/collections/")({
  loader: ({ context }) => context.queryClient.ensureQueryData(catalogQuery),
  head: () => ({ meta: [
    { title: "Skincare Collections | JUST GLOW" },
    { name: "description", content: "Browse the JUST GLOW edit of body care, face care, soaps, scrubs, oils and skin care." },
    { property: "og:title", content: "Skincare Collections | JUST GLOW" },
    { property: "og:description", content: "Browse the JUST GLOW edit of body care, face care, soaps, scrubs, oils and skin care." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: CollectionsPage,
});

function CollectionsPage() {
  const { data } = useSuspenseQuery(catalogQuery);
  return <main className="container-shop py-12 md:py-16"><SectionHeading eyebrow="THE JUST GLOW EDIT" script="Find your ritual" title="Collections" intro="Thoughtful care for every part of your everyday routine." /><div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3">{data.categories.map((category) => <CollectionCard key={category.id} category={category} count={data.products.filter((product) => product.category_id === category.id).length} />)}</div></main>;
}