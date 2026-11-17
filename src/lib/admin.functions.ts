import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const productInput = z.object({
  id: z.string().uuid().optional(),
  name: z.string().trim().min(2).max(160),
  slug: z.string().trim().min(2).max(180).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  category_id: z.string().uuid().nullable(),
  price: z.number().int().positive().max(100000000),
  short_description: z.string().trim().max(300),
  description: z.string().trim().max(3000),
  image_url: z.string().trim().max(1000).nullable(),
  featured: z.boolean(),
  active: z.boolean(),
});

const categoryInput = z.object({
  id: z.string().uuid().optional(),
  name: z.string().trim().min(2).max(100),
  slug: z.string().trim().min(2).max(120).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  description: z.string().trim().max(500),
  image_url: z.string().trim().max(1000).nullable(),
  sort_order: z.number().int().min(0).max(1000),
});

const settingsInput = z.object({
  whatsapp_number: z.string().trim().regex(/^\d{7,20}$/),
  business_email: z.string().trim().email().max(255),
  phone: z.string().trim().min(7).max(40),
  instagram_url: z.string().url().max(500),
  facebook_url: z.string().url().max(500),
  tiktok_url: z.string().url().max(500),
});

async function ensureAdmin(context: { supabase: { rpc: (name: "has_role", args: { _user_id: string; _role: "admin" }) => Promise<{ data: boolean | null; error: unknown }> }; userId: string }) {
  const { data, error } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
  if (error || !data) throw new Error("Admin access required.");
}

export const getAdminAccess = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
    if (error) throw new Error("Could not check admin access.");
    return { isAdmin: Boolean(data) };
  });

export const getAdminData = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await ensureAdmin(context);
    const [products, categories, orders, settings] = await Promise.all([
      context.supabase.from("products").select("*").order("created_at", { ascending: false }),
      context.supabase.from("categories").select("*").order("sort_order"),
      context.supabase.from("orders").select("*").order("created_at", { ascending: false }).limit(100),
      context.supabase.from("site_settings").select("*").eq("id", 1).single(),
    ]);
    if (products.error || categories.error || orders.error || settings.error) throw new Error("Could not load shop management data.");
    return { products: products.data, categories: categories.data, orders: orders.data, settings: settings.data };
  });

export const saveAdminProduct = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => productInput.parse(input))
  .handler(async ({ data, context }) => {
    await ensureAdmin(context);
    const { id, ...fields } = data;
    const result = id
      ? await context.supabase.from("products").update(fields).eq("id", id).select("id").single()
      : await context.supabase.from("products").insert(fields).select("id").single();
    if (result.error) throw new Error(result.error.message.includes("products_slug_key") ? "That product URL is already in use." : "Could not save this product.");
    return { id: result.data.id };
  });

export const deleteAdminProduct = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    await ensureAdmin(context);
    const { error } = await context.supabase.from("products").delete().eq("id", data.id);
    if (error) throw new Error("Could not delete this product.");
    return { ok: true };
  });

export const saveAdminCategory = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => categoryInput.parse(input))
  .handler(async ({ data, context }) => {
    await ensureAdmin(context);
    const { id, ...fields } = data;
    const result = id
      ? await context.supabase.from("categories").update(fields).eq("id", id).select("id").single()
      : await context.supabase.from("categories").insert(fields).select("id").single();
    if (result.error) throw new Error("Could not save this collection.");
    return { id: result.data.id };
  });

export const deleteAdminCategory = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    await ensureAdmin(context);
    const { error } = await context.supabase.from("categories").delete().eq("id", data.id);
    if (error) throw new Error("This collection could not be removed. Reassign its products first.");
    return { ok: true };
  });

export const saveAdminSettings = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => settingsInput.parse(input))
  .handler(async ({ data, context }) => {
    await ensureAdmin(context);
    const { error } = await context.supabase.from("site_settings").update(data).eq("id", 1);
    if (error) throw new Error("Could not save shop details.");
    return { ok: true };
  });

export const updateAdminOrder = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid(), status: z.enum(["pending", "confirmed", "processing", "shipped", "completed", "cancelled"]) }).parse(input))
  .handler(async ({ data, context }) => {
    await ensureAdmin(context);
    const { error } = await context.supabase.from("orders").update({ status: data.status }).eq("id", data.id);
    if (error) throw new Error("Could not update this order.");
    return { ok: true };
  });