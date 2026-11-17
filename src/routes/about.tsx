import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Heart, Leaf, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/site/SectionHeading";

export const Route = createFileRoute("/about")({
  head: () => ({ meta: [
    { title: "Our Story | JUST GLOW" }, { name: "description", content: "Get to know JUST GLOW, a thoughtful edit of skincare and body care for everyday rituals." },
    { property: "og:title", content: "Our Story | JUST GLOW" }, { property: "og:description", content: "Get to know JUST GLOW, a thoughtful edit of skincare and body care for everyday rituals." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: AboutPage,
});

function AboutPage() {
  return <main>
    <section className="relative isolate flex min-h-[360px] items-end overflow-hidden bg-peach md:min-h-[470px]"><img src="/images/hero/slide-1.jpg" alt="The soft, sunlit world of JUST GLOW" className="absolute inset-0 -z-20 h-full w-full object-cover" /><div className="absolute inset-0 -z-10 bg-hero-fade" /><div className="container-shop py-14 md:py-20"><p className="eyebrow">A LITTLE ABOUT US</p><h1 className="mt-3 max-w-xl text-4xl font-semibold md:text-6xl">Skincare, with a little more <span className="font-script text-primary">heart.</span></h1></div></section>
    <section className="container-shop grid items-center gap-10 py-14 md:grid-cols-2 md:gap-16 md:py-20"><div><SectionHeading align="left" eyebrow="THE JUST GLOW STORY" script="Care that feels like you" title="Everyday rituals deserve a little love." /><p className="mt-6 text-sm leading-7 text-muted-foreground">JUST GLOW was created around a simple idea: caring for yourself can be a lovely part of the day, not another thing on the list. We bring together skincare and body care for the little rituals that help you slow down and feel good.</p><p className="mt-4 text-sm leading-7 text-muted-foreground">Our edit is made for exploring at your own pace. Find the textures, products and moments that fit the way you like to care for yourself.</p><Button asChild variant="brand" className="mt-7"><Link to="/shop">Explore the edit <ArrowRight /></Link></Button></div><img src="/images/about.jpg" alt="A calm skincare ritual" loading="lazy" className="aspect-[4/5] w-full object-cover" /></section>
    <section className="bg-peach/60 py-14 md:py-20"><div className="container-shop"><SectionHeading eyebrow="WHAT MATTERS TO US" script="The little things" title="A thoughtful way to glow" /><div className="mt-10 grid gap-8 md:grid-cols-3">{[{ Icon: Heart, title: "Care, at your pace", text: "Your routine is personal. We’re here to make space for the rituals that feel right to you." }, { Icon: Leaf, title: "A considered edit", text: "A welcoming collection of skincare and body care, gathered for everyday moments." }, { Icon: Sparkles, title: "A little joy, daily", text: "Because those few minutes of care can be the sweetest pause in your day." }].map(({ Icon, title, text }) => <article key={title} className="border-t border-primary/30 pt-5"><Icon className="h-6 w-6 text-primary" /><h2 className="mt-4 text-lg font-semibold">{title}</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">{text}</p></article>)}</div></div></section>
  </main>;
}