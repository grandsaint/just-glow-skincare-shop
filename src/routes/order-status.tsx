import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, CircleHelp, Clock3, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatNaira } from "@/lib/format";
import { verifyPaystackPayment } from "@/lib/paystack.functions";
import { useCart } from "@/lib/cart";

export const Route = createFileRoute("/order-status")({
  validateSearch: (search: Record<string, unknown>) => ({ reference: typeof search.reference === "string" ? search.reference : undefined }),
  head: () => ({ meta: [
    { title: "Order Status | JUST GLOW" }, { name: "description", content: "Check the status of your JUST GLOW order." },
    { property: "og:title", content: "Order Status | JUST GLOW" }, { property: "og:description", content: "Check the status of your JUST GLOW order." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: OrderStatusPage,
});

function OrderStatusPage() {
  const { reference } = Route.useSearch();
  const verify = useServerFn(verifyPaystackPayment);
  const order = useQuery({ queryKey: ["order-status", reference], queryFn: () => verify({ data: { reference: reference ?? "" } }), enabled: Boolean(reference), retry: 1, staleTime: 0 });
  const result = order.data;
  const paid = result?.paymentStatus === "paid";
  const { clear } = useCart();
  useEffect(() => { if (paid) clear(); }, [paid, clear]);
  const failed = result?.paymentStatus === "failed" || result?.paymentStatus === "unknown";
  const Icon = paid ? CheckCircle2 : failed ? XCircle : Clock3;
  return <main className="container-shop flex min-h-[55vh] flex-col items-center justify-center py-16 text-center"><div className="grid h-16 w-16 place-items-center rounded-full bg-peach text-primary"><Icon className="h-8 w-8" /></div><p className="eyebrow mt-6">{paid ? "ORDER CONFIRMED" : failed ? "PAYMENT NOT COMPLETED" : "PAYMENT CHECK"}</p><h1 className="mt-3 max-w-2xl text-3xl font-semibold">{paid ? "Thank you, your order is confirmed." : failed ? "We couldn't complete that payment." : "We're checking your payment."}</h1>{order.isLoading && <p className="mt-3 text-sm text-muted-foreground">Confirming with the payment provider…</p>}{result && <><p className="mt-3 max-w-lg text-sm leading-6 text-muted-foreground">{result.message ?? (paid ? "Your order is on its way to the JUST GLOW team." : failed ? "You can try again or choose to order through WhatsApp." : "It can take a moment for your payment to appear. Please check again shortly.")}</p>{result.reference && <p className="mt-5 text-xs text-muted-foreground">Reference: <span className="font-medium text-foreground">{result.reference}</span></p>}{typeof result.total === "number" && <p className="mt-2 text-sm font-semibold">{formatNaira(result.total)}</p>}</>}{!reference && <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground"><CircleHelp className="h-4 w-4" /> No order reference was provided.</div>}<div className="mt-8 flex flex-wrap justify-center gap-3"><Button asChild variant="brand"><Link to="/shop">Continue shopping</Link></Button><Button asChild variant="outlineBrand"><Link to="/contact">Contact JUST GLOW</Link></Button></div></main>;
}