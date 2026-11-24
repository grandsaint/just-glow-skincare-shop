import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type { Category, Product, SiteSettings } from "./types";
import { DEFAULT_SETTINGS } from "./types";

export const getCatalog = createServerFn({ method: "GET" }).handler(async () => {
  const { createPublicSupabase } = await import("./public-supabase.server");
  const sb = createPublicSupabase();
  const [products, categories] = await Promise.all([
    sb.from("products").select("*").eq("active", true).order("created_at", { ascending: false }),
    sb.from("categories").select("*").order("sort_order", { ascending: true }),
  ]);
  if (products.error) throw new Error(products.error.message);
  if (categories.error) throw new Error(categories.error.message);
  return {
    products: products.data as Product[],
    categories: categories.data as Category[],
  };
});

export const getSettings = createServerFn({ method: "GET" }).handler(async () => {
  // Settings are read with the server client so the table itself stays private.
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data } = await supabaseAdmin
    .from("site_settings")
    .select("whatsapp_number, business_email, phone, instagram_url, facebook_url, tiktok_url").eq("id", 1).maybeSingle();
  return (data ?? DEFAULT_SETTINGS) as SiteSettings;
});

export const subscribeNewsletter = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => z.object({ email: z.string().trim().email().max(255) }).parse(d))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("newsletter_subscribers")
      .upsert({ email: data.email.toLowerCase() }, { onConflict: "email", ignoreDuplicates: true });
    if (error) throw new Error("Could not subscribe right now. Please try again.");
    return { ok: true };
  });
