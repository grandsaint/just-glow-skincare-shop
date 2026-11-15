import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const checkoutSchema = z.object({
  customer: z.object({
    name: z.string().trim().min(2, "Please enter your full name").max(120),
    phone: z.string().trim().min(7, "Please enter a valid phone number").max(30),
    email: z.string().trim().email("Please enter a valid email").max(255),
    address: z.string().trim().min(8, "Please enter your full delivery address").max(500),
  }),
  items: z
    .array(z.object({ id: z.string().uuid(), quantity: z.number().int().min(1).max(99) }))
    .min(1, "Your cart is empty")
    .max(50),
  origin: z.string().url(),
});

export type CheckoutResult =
  | { ok: true; authorizationUrl: string; reference: string }
  | { ok: false; error: string };

export const startPaystackCheckout = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => checkoutSchema.parse(d))
  .handler(async ({ data }): Promise<CheckoutResult> => {
    const secret = process.env["PAYSTACK_SECRET_KEY"];
    if (!secret) {
      return {
        ok: false,
        error: "Online payment isn't available yet. Please use “Order via WhatsApp” for now.",
      };
    }
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // Prices always come from the database, never from the browser.
    const ids = data.items.map((i) => i.id);
    const { data: products, error } = await supabaseAdmin
      .from("products")
      .select("id, name, price, active")
      .in("id", ids);
    if (error) return { ok: false, error: "Could not load products. Please try again." };

    const lines = data.items.map((i) => {
      const p = products?.find((x) => x.id === i.id && x.active);
      return p ? { id: p.id, name: p.name, price: p.price, quantity: i.quantity } : null;
    });
    if (lines.some((l) => !l)) {
      return { ok: false, error: "Some items in your cart are no longer available. Please review your cart." };
    }
    const items = lines as { id: string; name: string; price: number; quantity: number }[];
    const total = items.reduce((s, l) => s + l.price * l.quantity, 0);
    const reference = `JG-${Date.now().toString(36).toUpperCase()}-${crypto.randomUUID().slice(0, 6).toUpperCase()}`;

    const { error: insErr } = await supabaseAdmin.from("orders").insert({
      reference,
      customer_name: data.customer.name,
      phone: data.customer.phone,
      email: data.customer.email,
      address: data.customer.address,
      items,
      total,
      payment_method: "paystack",
      payment_status: "pending",
      status: "pending",
    });
    if (insErr) return { ok: false, error: "Could not create your order. Please try again." };

    const res = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: { Authorization: `Bearer ${secret}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        email: data.customer.email,
        amount: total * 100,
        currency: "NGN",
        reference,
        callback_url: `${new URL(data.origin).origin}/order-status`,
        metadata: { customer_name: data.customer.name, phone: data.customer.phone },
      }),
    });
    const json = (await res.json().catch(() => null)) as
      | { status: boolean; message?: string; data?: { authorization_url: string } }
      | null;
    if (!res.ok || !json?.status || !json.data) {
      await supabaseAdmin.from("orders").update({ payment_status: "failed" }).eq("reference", reference);
      return { ok: false, error: json?.message ?? "Payment could not be started. Please try again." };
    }
    return { ok: true, authorizationUrl: json.data.authorization_url, reference };
  });

export interface VerifiedOrder {
  reference: string;
  paymentStatus: "paid" | "pending" | "failed" | "unknown";
  customerName?: string;
  total?: number;
  items?: { name: string; price: number; quantity: number }[];
  message?: string;
}

export const verifyPaystackPayment = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => z.object({ reference: z.string().trim().min(4).max(80) }).parse(d))
  .handler(async ({ data }): Promise<VerifiedOrder> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { markOrderPaidIfValid } = await import("./paystack.server");
    const { data: order } = await supabaseAdmin
      .from("orders")
      .select("reference, customer_name, total, items, payment_status")
      .eq("reference", data.reference)
      .maybeSingle();
    if (!order) return { reference: data.reference, paymentStatus: "unknown", message: "We couldn't find this order." };

    const summary = {
      reference: order.reference,
      customerName: order.customer_name,
      total: order.total,
      items: order.items as VerifiedOrder["items"],
    };
    if (order.payment_status === "paid") return { ...summary, paymentStatus: "paid" };

    const secret = process.env["PAYSTACK_SECRET_KEY"];
    if (!secret) return { ...summary, paymentStatus: "pending", message: "Payment verification is unavailable right now." };

    const res = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(data.reference)}`, {
      headers: { Authorization: `Bearer ${secret}` },
    });
    const json = (await res.json().catch(() => null)) as
      | { status: boolean; data?: { status: string; amount: number; currency: string; reference: string; gateway_response?: string } }
      | null;
    if (!json?.status || !json.data) return { ...summary, paymentStatus: "pending", message: "We couldn't confirm your payment yet." };

    const result = await markOrderPaidIfValid(json.data);
    if (result === "paid") return { ...summary, paymentStatus: "paid" };
    if (json.data.status === "failed" || json.data.status === "abandoned" || result === "mismatch") {
      return { ...summary, paymentStatus: "failed", message: json.data.gateway_response ?? "Your payment was not completed." };
    }
    return { ...summary, paymentStatus: "pending", message: "Your payment is still processing." };
  });
