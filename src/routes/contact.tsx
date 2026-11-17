import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowUpRight, Mail, MessageCircle, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/site/SectionHeading";
import { DEFAULT_SETTINGS } from "@/lib/types";
import { settingsQuery } from "@/lib/queries";

export const Route = createFileRoute("/contact")({
  head: () => ({ meta: [
    { title: "Contact JUST GLOW" }, { name: "description", content: "Get in touch with JUST GLOW about your skincare and body care order." },
    { property: "og:title", content: "Contact JUST GLOW" }, { property: "og:description", content: "Get in touch with JUST GLOW about your skincare and body care order." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: ContactPage,
});

function ContactPage() {
  const { data } = useQuery(settingsQuery);
  const shop = data ?? DEFAULT_SETTINGS;
  const contacts = [
    { Icon: MessageCircle, title: "WhatsApp", detail: "Questions or ready to order? Send us a message.", href: `https://wa.me/${shop.whatsapp_number}`, action: "Chat with us" },
    { Icon: Mail, title: "Email", detail: shop.business_email, href: `mailto:${shop.business_email}`, action: "Write an email" },
    { Icon: Phone, title: "Phone", detail: shop.phone, href: `tel:${shop.phone.replace(/\s/g, "")}`, action: "Call JUST GLOW" },
  ];
  return <main className="container-shop py-14 md:py-20"><SectionHeading eyebrow="WE’RE HERE FOR YOU" script="Let’s talk" title="Get in touch" intro="Need a hand choosing something or have a question about your order? We’d love to hear from you." /><div className="mx-auto mt-12 grid max-w-4xl gap-8 md:grid-cols-3">{contacts.map(({ Icon, title, detail, href, action }) => <article key={title} className="border-t border-border pt-6"><Icon className="h-6 w-6 text-primary" /><h2 className="mt-4 text-lg font-semibold">{title}</h2><p className="mt-2 min-h-12 break-words text-sm leading-6 text-muted-foreground">{detail}</p><Button asChild variant="link" className="mt-3 h-auto p-0"><a href={href} target={title === "WhatsApp" ? "_blank" : undefined} rel={title === "WhatsApp" ? "noreferrer" : undefined}>{action} <ArrowUpRight /></a></Button></article>)}</div><div className="mx-auto mt-14 max-w-4xl border-y border-border py-7 text-center"><p className="font-script text-4xl text-primary">We’re happy you’re here.</p><p className="mt-2 text-sm text-muted-foreground">For the quickest response, send us a WhatsApp message.</p></div></main>;
}