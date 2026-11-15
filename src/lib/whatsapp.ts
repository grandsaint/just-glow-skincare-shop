import { formatNaira } from "./format";

export interface OrderLine {
  name: string;
  price: number;
  quantity: number;
}

export function orderTotal(items: OrderLine[]): number {
  return items.reduce((sum, i) => sum + i.price * i.quantity, 0);
}

/** Builds the pre-filled WhatsApp order message. */
export function buildWhatsAppOrderMessage(items: OrderLine[]): string {
  const lines = items.map(
    (item, idx) =>
      `${idx + 1}. ${item.name}\n   Quantity: ${item.quantity}\n   Price: ${formatNaira(item.price)}\n   Subtotal: ${formatNaira(item.price * item.quantity)}`,
  );
  return [
    "Hello Just Glow! I'd like to place an order.",
    "",
    "MY ORDER:",
    "",
    lines.join("\n\n"),
    "",
    `TOTAL: ${formatNaira(orderTotal(items))}`,
    "",
    "Please confirm product availability and provide payment and delivery details.",
  ].join("\n");
}

/** Strips everything but digits so "+234 800-000" becomes "234800000". */
export function normalizeWhatsAppNumber(raw: string): string {
  return raw.replace(/\D/g, "");
}

export function whatsAppLink(number: string, message?: string): string {
  const n = normalizeWhatsAppNumber(number);
  return message ? `https://wa.me/${n}?text=${encodeURIComponent(message)}` : `https://wa.me/${n}`;
}
