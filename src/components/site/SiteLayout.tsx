import { useState, type FormEvent } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { ArrowUpRight, Instagram, Menu, ShoppingBag, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Logo } from "./Logo";
import { SocialLinks } from "./SocialLinks";
import { useCart } from "@/lib/cart";
import { useQuery } from "@tanstack/react-query";
import { settingsQuery } from "@/lib/queries";
import { DEFAULT_SETTINGS } from "@/lib/types";
import { subscribeNewsletter } from "@/lib/catalog.functions";

const navigation = [
  { label: "Home", to: "/" as const },
  { label: "Shop", to: "/shop" as const },
  { label: "Collections", to: "/collections" as const },
  { label: "Our Story", to: "/about" as const },
  { label: "Contact", to: "/contact" as const },
];

export function SiteLayout({ children }: { children: React.ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { count } = useCart();
  const { data: settings } = useQuery(settingsQuery);
  const shop = settings ?? DEFAULT_SETTINGS;
  const subscribe = useServerFn(subscribeNewsletter);
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterBusy, setNewsletterBusy] = useState(false);
  const pathname = useRouterState({ select: (state) => state.location.pathname });

  const handleNewsletter = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setNewsletterBusy(true);
    try {
      await subscribe({ data: { email: newsletterEmail } });
      toast.success("You’re on the list. Look out for a little glow in your inbox.");
      setNewsletterEmail("");
    } catch {
      toast.error("We couldn’t add you just now. Please try again.");
    } finally { setNewsletterBusy(false); }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-primary px-4 py-2 text-center text-xs font-medium tracking-wide text-primary-foreground">
        A little care, a lot of glow. Thoughtfully chosen for your routine.
      </div>
      <header className="sticky top-0 z-40 border-b border-border/70 bg-background/95 backdrop-blur-md">
        <div className="container-shop flex h-[76px] items-center justify-between gap-4">
          <div className="flex items-center gap-10">
            <Logo />
            <nav className="hidden items-center gap-7 lg:flex" aria-label="Main navigation">
              {navigation.map((item) => (
                <Link key={item.to} to={item.to} className={`text-sm transition-colors hover:text-primary ${pathname === item.to ? "font-semibold text-primary" : "text-foreground/80"}`}>
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="icon" className="relative" aria-label={`Shopping bag, ${count} items`}>
              <Link to="/cart"><ShoppingBag /><span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">{count}</span></Link>
            </Button>
            <Button asChild variant="brand" size="sm" className="hidden sm:inline-flex"><Link to="/shop">Shop all <ArrowUpRight /></Link></Button>
            <Button type="button" variant="ghost" size="icon" className="lg:hidden" aria-label={menuOpen ? "Close menu" : "Open menu"} onClick={() => setMenuOpen((open) => !open)}>{menuOpen ? <X /> : <Menu />}</Button>
          </div>
        </div>
        {menuOpen && <nav className="container-shop grid gap-1 border-t border-border py-3 lg:hidden" aria-label="Mobile navigation">{navigation.map((item) => <Link key={item.to} to={item.to} onClick={() => setMenuOpen(false)} className="py-2 text-sm font-medium">{item.label}</Link>)}</nav>}
      </header>

      {children}

      <footer className="mt-20 bg-foreground text-background">
        <div className="container-shop grid gap-12 py-14 md:grid-cols-[1.4fr_1fr_1fr] md:py-20">
          <div><Logo inverted /><p className="mt-5 max-w-sm text-sm leading-7 text-background/70">A thoughtful edit of skincare and body care for the little rituals that feel like you.</p><SocialLinks className="mt-5" variant="solid" /></div>
          <div><p className="text-sm font-semibold">Explore</p><div className="mt-4 grid gap-3 text-sm text-background/70"><Link to="/shop" className="hover:text-background">Shop all</Link><Link to="/collections" className="hover:text-background">Collections</Link><Link to="/about" className="hover:text-background">Our story</Link><Link to="/contact" className="hover:text-background">Contact</Link></div></div>
          <div><p className="text-sm font-semibold">Say hello</p><div className="mt-4 grid gap-3 text-sm text-background/70"><a href={`mailto:${shop.business_email}`} className="break-all hover:text-background">{shop.business_email}</a><a href={`tel:${shop.phone.replace(/\s/g, "")}`} className="hover:text-background">{shop.phone}</a><a href={`https://wa.me/${shop.whatsapp_number}`} target="_blank" rel="noreferrer" className="hover:text-background">WhatsApp orders</a><Link to="/admin" className="mt-3 text-xs text-background/50 hover:text-background">Shop management</Link></div></div>
        </div>
        <div className="container-shop border-t border-background/15 py-8 md:flex md:items-center md:justify-between md:gap-8"><div><p className="font-semibold">A little glow in your inbox</p><p className="mt-1 text-sm text-background/65">Join our notes for new arrivals and small moments of care.</p></div><form onSubmit={(event) => void handleNewsletter(event)} className="mt-4 flex max-w-md gap-2 md:mt-0 md:w-full"><Input type="email" required maxLength={255} aria-label="Email for newsletter" placeholder="Your email address" value={newsletterEmail} onChange={(event) => setNewsletterEmail(event.target.value)} className="border-background/30 bg-background/10 text-background placeholder:text-background/55" /><Button type="submit" variant="soft" disabled={newsletterBusy}>{newsletterBusy ? "Joining…" : "Join us"}</Button></form></div>
        <div className="border-t border-background/15"><div className="container-shop flex flex-col gap-2 py-4 text-xs text-background/55 sm:flex-row sm:items-center sm:justify-between"><span>© {new Date().getFullYear()} JUST GLOW. All rights reserved.</span><span>Made for your everyday glow.</span></div></div>
      </footer>
    </div>
  );
}