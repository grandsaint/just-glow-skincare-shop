import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CollectionCard } from "@/components/site/CollectionCard";
import { ProductCard } from "@/components/site/ProductCard";
import { SectionHeading } from "@/components/site/SectionHeading";
import { catalogQuery } from "@/lib/queries";

export const Route = createFileRoute("/")({
  loader: ({ context }) => context.queryClient.ensureQueryData(catalogQuery),
  head: () => ({ meta: [
    { title: "JUST GLOW | Skincare for your glow" },
    { name: "description", content: "Discover everyday skincare, body care and feel-good rituals at JUST GLOW." },
    { property: "og:title", content: "JUST GLOW | Skincare for your glow" },
    { property: "og:description", content: "Discover everyday skincare, body care and feel-good rituals at JUST GLOW." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: HomePage,
});

function HomePage() {
  const { data } = useSuspenseQuery(catalogQuery);
  const featured = data.products.filter((product) => product.featured).slice(0, 4);
  const bestsellers = featured.length ? featured : data.products.slice(0, 4);
  const collections = data.categories.slice(0, 5);
  return <main>
    <section className="relative isolate flex min-h-[570px] items-center overflow-hidden bg-peach md:min-h-[680px]">
      <img src="/images/hero/slide-2.jpg" alt="A peaceful skincare moment" className="absolute inset-0 -z-20 h-full w-full object-cover object-[60%_center]" />
      <div className="absolute inset-0 -z-10 bg-hero-fade" />
      <div className="container-shop py-20 md:py-28">
        <div className="max-w-xl animate-hero-rise">
          <span className="eyebrow">YOUR DAILY RITUAL, REIMAGINED</span>
          <h1 className="mt-5 text-5xl font-semibold leading-[1.08] text-foreground md:text-7xl">Make room for <span className="font-script text-primary">your glow.</span></h1>
          <p className="mt-6 max-w-md text-base leading-7 text-foreground/75 md:text-lg">Skincare and body care for the small, lovely moments that make a day feel like yours.</p>
          <div className="mt-8 flex flex-wrap gap-3"><Button asChild variant="brand" size="xl"><Link to="/shop">Discover the collection <ArrowRight /></Link></Button><Button asChild variant="outlineBrand" size="xl"><Link to="/about">Meet JUST GLOW</Link></Button></div>
        </div>
      </div>
      <div className="absolute bottom-7 right-8 hidden items-center gap-2 text-xs font-medium uppercase tracking-widest text-foreground/70 md:flex"><span className="h-px w-10 bg-primary" /> Thoughtful care, every day</div>
    </section>

    <section className="container-shop py-16 md:py-24">
      <div className="flex items-end justify-between gap-4"><SectionHeading align="left" eyebrow="A LITTLE SOMETHING LOVELY" script="Picked for you" title="Our Glow Favourites" intro="Meet the everyday essentials our community comes back to." /><Link to="/shop" className="mb-1 hidden shrink-0 items-center gap-2 text-sm font-semibold text-primary sm:flex">Shop all <ArrowRight className="h-4 w-4" /></Link></div>
      <div className="mt-9 grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">{bestsellers.map((product) => <ProductCard key={product.id} product={product} />)}</div>
      <div className="mt-6 text-center sm:hidden"><Button asChild variant="outlineBrand"><Link to="/shop">Shop all products <ArrowRight /></Link></Button></div>
    </section>

    <section className="bg-peach/60 py-16 md:py-24"><div className="container-shop"><SectionHeading eyebrow="FIND YOUR RITUAL" script="Made for your moments" title="Browse by collection" intro="A considered little corner for every part of your routine." /><div className="mt-9 grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6">{collections.map((category, index) => <CollectionCard key={category.id} category={category} count={data.products.filter((p) => p.category_id === category.id).length} className={index === 0 ? "md:col-span-2" : ""} />)}</div></div></section>

    <section className="container-shop grid items-center gap-10 py-16 md:grid-cols-2 md:gap-16 md:py-24"><div className="relative"><img src="/images/about.jpg" alt="JUST GLOW skincare, thoughtfully selected" loading="lazy" className="aspect-[4/5] w-full object-cover" /><span className="absolute -bottom-4 -right-4 bg-primary px-5 py-4 text-sm font-semibold text-primary-foreground shadow-soft">Care, with intention</span></div><div className="py-4"><SectionHeading align="left" eyebrow="THE HEART OF JUST GLOW" script="A softer kind of self-care" title="Your everyday glow starts here." intro="We believe feeling good in your skin can begin with a small ritual. JUST GLOW brings together skincare and body care for your everyday routine, chosen to make those moments a little more special." /><Button asChild variant="brand" className="mt-7"><Link to="/about">Our story <ArrowRight /></Link></Button></div></section>

    <section className="bg-foreground py-16 text-background md:py-20"><div className="container-shop flex flex-col items-start justify-between gap-8 md:flex-row md:items-center"><div><span className="eyebrow text-peach">A NOTE FROM JUST GLOW</span><h2 className="mt-3 max-w-xl text-3xl font-semibold md:text-4xl">A little care can change the feel of a whole day.</h2><p className="mt-3 max-w-lg text-sm leading-7 text-background/70">Take a breath, find your ritual, and let your glow be yours.</p></div><Button asChild variant="soft" size="xl"><Link to="/shop">Find your favourites <Sparkles /></Link></Button></div></section>
  </main>;
}