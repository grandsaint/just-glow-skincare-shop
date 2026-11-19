import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { ArrowLeft, CreditCard, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCart } from "@/lib/cart";
import { formatNaira } from "@/lib/format";
import { settingsQuery } from "@/lib/queries";
import { DEFAULT_SETTINGS } from "@/lib/types";
import { buildWhatsAppOrderMessage, whatsAppLink } from "@/lib/whatsapp";
import { startPaystackCheckout } from "@/lib/paystack.functions";
import { useQuery } from "@tanstack/react-query";

export const Route = createFileRoute("/checkout")({
  head: () => ({ meta: [
    { title: "Checkout | JUST GLOW" }, { name: "description", content: "Complete your JUST GLOW order." },
    { property: "og:title", content: "Checkout | JUST GLOW" }, { property: "og:description", content: "Complete your JUST GLOW order." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: CheckoutPage,
});

function CheckoutPage() {
  const { items, subtotal, hydrated } = useCart();
  const { data: settings } = useQuery(settingsQuery);
  const shop = settings ?? DEFAULT_SETTINGS;
  const startCheckout = useServerFn(startPaystackCheckout);
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", email: "", address: "" });
  const [errors, setErrors] = useState<Partial<Record<keyof typeof form, string>>>({});
  const validate = () => {
    const next: Partial<Record<keyof typeof form, string>> = {};
    if (form.name.trim().length < 2) next.name = "Enter your full name.";
    if (form.phone.trim().length < 7) next.phone = "Enter a valid phone number.";
    if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) next.email = "Enter a valid email address.";
    if (form.address.trim().length < 8) next.address = "Enter your full delivery address.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };
  const placeOrder = async (method: "whatsapp" | "paystack") => {
    if (!items.length) { await navigate({ to: "/cart" }); return; }
    if (!validate()) return;
    setBusy(true);
    try {
      if (method === "whatsapp") {
        const message = `${buildWhatsAppOrderMessage(items)}\n\nCUSTOMER DETAILS:\nName: ${form.name.trim()}\nPhone: ${form.phone.trim()}\nEmail: ${form.email.trim()}\nDelivery address: ${form.address.trim()}`;
        window.open(whatsAppLink(shop.whatsapp_number, message), "_blank", "noopener,noreferrer");
        return;
      }
      const result = await startCheckout({ data: { customer: form, items: items.map(({ id, quantity }) => ({ id, quantity })), origin: window.location.origin } });
      if (!result.ok) { toast.error(result.error); return; }
      window.location.assign(result.authorizationUrl);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Checkout could not start. Please try again.");
    } finally {
      setBusy(false);
    }
  };
  if (!hydrated) return <main className="container-shop min-h-[52vh] py-16 text-center text-sm text-muted-foreground">Getting your order ready…</main>;
  if (!items.length) return <main className="container-shop min-h-[52vh] py-16 text-center"><h1 className="text-3xl font-semibold">Your bag is empty</h1><p className="mt-3 text-muted-foreground">Add a favourite before checking out.</p><Button asChild variant="brand" className="mt-6"><Link to="/shop">Explore the shop</Link></Button></main>;
  const fields = [
    { id: "name", label: "Full name", autoComplete: "name" },
    { id: "phone", label: "Phone number", autoComplete: "tel" },
    { id: "email", label: "Email address", autoComplete: "email" },
    { id: "address", label: "Delivery address", autoComplete: "street-address" },
  ] as const;
  return <main className="container-shop py-10 md:py-14"><Link to="/cart" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary"><ArrowLeft className="h-4 w-4" /> Back to bag</Link><div className="mt-7 grid gap-10 lg:grid-cols-[1fr_360px]"><section><p className="eyebrow">ALMOST YOURS</p><h1 className="mt-2 text-3xl font-semibold">Checkout</h1><p className="mt-2 text-sm text-muted-foreground">Where should we send your order?</p><div className="mt-8 grid gap-5 sm:grid-cols-2">{fields.map((field) => <div key={field.id} className={field.id === "address" ? "sm:col-span-2" : ""}><Label htmlFor={field.id}>{field.label}</Label>{field.id === "address" ? <textarea id={field.id} autoComplete={field.autoComplete} rows={3} value={form.address} onChange={(event) => setForm((prev) => ({ ...prev, address: event.target.value }))} className="mt-2 flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" /> : <Input id={field.id} type={field.id === "email" ? "email" : field.id === "phone" ? "tel" : "text"} autoComplete={field.autoComplete} value={form[field.id]} onChange={(event) => setForm((prev) => ({ ...prev, [field.id]: event.target.value }))} className="mt-2" />}{errors[field.id] && <p className="mt-1 text-xs text-destructive">{errors[field.id]}</p>}</div>)}</div></section><aside className="h-fit border border-border p-6"><h2 className="text-lg font-semibold">Your order</h2><div className="mt-4 max-h-64 divide-y divide-border overflow-y-auto">{items.map((item) => <div key={item.id} className="flex justify-between gap-3 py-3 text-sm"><span className="min-w-0"><span className="block truncate">{item.name}</span><span className="text-xs text-muted-foreground">Qty {item.quantity}</span></span><span className="shrink-0">{formatNaira(item.price * item.quantity)}</span></div>)}</div><div className="mt-3 flex justify-between border-t border-border pt-4 font-semibold"><span>Total</span><span>{formatNaira(subtotal)}</span></div><Button type="button" variant="whatsapp" size="xl" className="mt-6 w-full" disabled={busy} onClick={() => void placeOrder("whatsapp")}><MessageCircle /> Order via WhatsApp</Button><Button type="button" variant="outlineBrand" size="xl" className="mt-3 w-full" disabled={busy} onClick={() => void placeOrder("paystack")}><CreditCard /> Pay securely online</Button><p className="mt-4 text-center text-xs leading-5 text-muted-foreground">Online payment will be available when payment setup is complete.</p></aside></div></main>;
}