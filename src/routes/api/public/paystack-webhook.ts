import { createFileRoute } from "@tanstack/react-router";

async function hmacSha512Hex(secret: string, body: string) {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-512" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(body));
  return Array.from(new Uint8Array(sig)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

export const Route = createFileRoute("/api/public/paystack-webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const secret = process.env["PAYSTACK_SECRET_KEY"];
        if (!secret) return new Response("Not configured", { status: 503 });
        const raw = await request.text();
        const signature = request.headers.get("x-paystack-signature") ?? "";
        const expected = await hmacSha512Hex(secret, raw);
        if (signature.length !== expected.length || signature !== expected) {
          return new Response("Invalid signature", { status: 401 });
        }
        const event = JSON.parse(raw) as { event: string; data: { status: string; amount: number; currency: string; reference: string } };
        if (event.event === "charge.success") {
          const { markOrderPaidIfValid } = await import("@/lib/paystack.server");
          await markOrderPaidIfValid(event.data);
        }
        return new Response("ok");
      },
    },
  },
});
