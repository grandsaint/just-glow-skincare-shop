import { supabaseAdmin } from "@/integrations/supabase/client.server";

interface PaystackTx {
  status: string;
  amount: number;
  currency: string;
  reference: string;
}

/** Marks an order paid only when Paystack reports success for the exact amount and currency. */
export async function markOrderPaidIfValid(tx: PaystackTx): Promise<"paid" | "mismatch" | "not_success" | "missing"> {
  const { data: order } = await supabaseAdmin
    .from("orders")
    .select("id, total, payment_status")
    .eq("reference", tx.reference)
    .maybeSingle();
  if (!order) return "missing";
  if (order.payment_status === "paid") return "paid";
  if (tx.status !== "success") {
    if (tx.status === "failed" || tx.status === "abandoned") {
      await supabaseAdmin.from("orders").update({ payment_status: "failed" }).eq("id", order.id);
    }
    return "not_success";
  }
  if (tx.amount !== order.total * 100 || tx.currency !== "NGN") {
    await supabaseAdmin.from("orders").update({ payment_status: "amount_mismatch" }).eq("id", order.id);
    return "mismatch";
  }
  await supabaseAdmin
    .from("orders")
    .update({ payment_status: "paid", status: "confirmed", paid_at: new Date().toISOString() })
    .eq("id", order.id);
  return "paid";
}
