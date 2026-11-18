import { useEffect, useState, type FormEvent } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Eye, LogOut, PackagePlus, Pencil, Save, Settings2, ShoppingBasket, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { User } from "@supabase/supabase-js";
import type { Tables } from "@/integrations/supabase/types";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DEFAULT_SETTINGS, type Category, type Product, type SiteSettings } from "@/lib/types";
import { formatNaira } from "@/lib/format";
import {
  deleteAdminCategory, deleteAdminProduct, getAdminAccess, getAdminData,
  saveAdminCategory, saveAdminProduct, saveAdminSettings, updateAdminOrder,
} from "@/lib/admin.functions";

type Order = Tables<"orders">;
type AdminTab = "products" | "collections" | "orders" | "settings";

const emptyProduct = { name: "", slug: "", category_id: "", price: "", short_description: "", description: "", image_url: "", featured: false, active: true };
const emptyCategory = { name: "", slug: "", description: "", image_url: "", sort_order: "0" };

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [
    { title: "Shop Management | JUST GLOW" }, { name: "description", content: "Manage the JUST GLOW product collection, customer orders and shop details." },
    { property: "og:title", content: "Shop Management | JUST GLOW" }, { property: "og:description", content: "Manage the JUST GLOW product collection, customer orders and shop details." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: AdminPage,
});

function AdminPage() {
  const [user, setUser] = useState<User | null>(null);
  const [checkingSession, setCheckingSession] = useState(true);
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authBusy, setAuthBusy] = useState(false);
  const [tab, setTab] = useState<AdminTab>("products");
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [productForm, setProductForm] = useState(emptyProduct);
  const [categoryForm, setCategoryForm] = useState(emptyCategory);
  const [settingsForm, setSettingsForm] = useState<SiteSettings>(DEFAULT_SETTINGS);
  const [productPhoto, setProductPhoto] = useState<File | null>(null);
  const [categoryPhoto, setCategoryPhoto] = useState<File | null>(null);
  const queryClient = useQueryClient();
  const getAccess = useServerFn(getAdminAccess);
  const getData = useServerFn(getAdminData);
  const saveProduct = useServerFn(saveAdminProduct);
  const deleteProduct = useServerFn(deleteAdminProduct);
  const saveCategory = useServerFn(saveAdminCategory);
  const deleteCategory = useServerFn(deleteAdminCategory);
  const saveSettings = useServerFn(saveAdminSettings);
  const updateOrder = useServerFn(updateAdminOrder);

  useEffect(() => {
    let mounted = true;
    void supabase.auth.getSession().then(({ data }) => {
      if (mounted) { setUser(data.session?.user ?? null); setCheckingSession(false); }
    }).catch(() => { if (mounted) setCheckingSession(false); });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => setUser(session?.user ?? null));
    return () => { mounted = false; listener.subscription.unsubscribe(); };
  }, []);

  const access = useQuery({ queryKey: ["admin-access", user?.id], queryFn: () => getAccess(), enabled: Boolean(user), retry: false });
  const isAdmin = access.data?.isAdmin === true;
  const dataQuery = useQuery({ queryKey: ["admin-data"], queryFn: () => getData(), enabled: isAdmin, retry: false });
  const data = dataQuery.data;

  useEffect(() => {
    if (data?.settings) setSettingsForm(data.settings as SiteSettings);
  }, [data?.settings]);

  const signIn = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAuthBusy(true);
    try {
      if (authMode === "signup") {
        const { error } = await supabase.auth.signUp({ email: email.trim(), password });
        if (error) throw error;
        toast.success("Account created. Check your email to confirm your address, then sign in.");
        setAuthMode("signin");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (error) throw error;
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not sign in. Please try again.");
    } finally { setAuthBusy(false); }
  };

  const refreshAdmin = async () => {
    await queryClient.invalidateQueries({ queryKey: ["admin-data"] });
    await queryClient.invalidateQueries({ queryKey: ["catalog"] });
    await queryClient.invalidateQueries({ queryKey: ["settings"] });
  };

  const uploadPhoto = async (file: File, folder: "products" | "collections") => {
    if (!file.type.startsWith("image/") || file.size > 10 * 1024 * 1024) throw new Error("Choose an image under 10 MB.");
    const safeName = file.name.toLowerCase().replace(/[^a-z0-9.-]+/g, "-");
    const path = `${folder}/${crypto.randomUUID()}-${safeName}`;
    const { error } = await supabase.storage.from("product-images").upload(path, file, { upsert: false });
    if (error) throw new Error("Could not upload this photo.");
    return `/api/public/images/${path}`;
  };

  const beginProduct = (product: Product | null) => {
    setEditingProduct(product);
    setProductPhoto(null);
    setProductForm(product ? {
      name: product.name, slug: product.slug, category_id: product.category_id ?? "", price: String(product.price),
      short_description: product.short_description, description: product.description, image_url: product.image_url ?? "",
      featured: product.featured, active: product.active,
    } : emptyProduct);
  };

  const submitProduct = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      const image_url = productPhoto ? await uploadPhoto(productPhoto, "products") : productForm.image_url.trim() || null;
      await saveProduct({ data: {
        ...(editingProduct ? { id: editingProduct.id } : {}), name: productForm.name.trim(), slug: productForm.slug.trim(),
        category_id: productForm.category_id || null, price: Number(productForm.price), short_description: productForm.short_description.trim(),
        description: productForm.description.trim(), image_url, featured: productForm.featured, active: productForm.active,
      } });
      toast.success(editingProduct ? "Product updated." : "Product added.");
      setEditingProduct(null); setProductForm(emptyProduct); setProductPhoto(null); await refreshAdmin();
    } catch (error) { toast.error(error instanceof Error ? error.message : "Could not save this product."); }
  };

  const beginCategory = (category: Category | null) => {
    setEditingCategory(category); setCategoryPhoto(null);
    setCategoryForm(category ? { name: category.name, slug: category.slug, description: category.description, image_url: category.image_url ?? "", sort_order: String(category.sort_order) } : emptyCategory);
  };

  const submitCategory = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      const image_url = categoryPhoto ? await uploadPhoto(categoryPhoto, "collections") : categoryForm.image_url.trim() || null;
      await saveCategory({ data: {
        ...(editingCategory ? { id: editingCategory.id } : {}), name: categoryForm.name.trim(), slug: categoryForm.slug.trim(),
        description: categoryForm.description.trim(), image_url, sort_order: Number(categoryForm.sort_order),
      } });
      toast.success(editingCategory ? "Collection updated." : "Collection added.");
      setEditingCategory(null); setCategoryForm(emptyCategory); setCategoryPhoto(null); await refreshAdmin();
    } catch (error) { toast.error(error instanceof Error ? error.message : "Could not save this collection."); }
  };

  const updateSetting = (key: keyof SiteSettings, value: string) => setSettingsForm((current) => ({ ...current, [key]: value }));
  const submitSettings = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try { await saveSettings({ data: settingsForm }); toast.success("Shop details saved."); await refreshAdmin(); }
    catch (error) { toast.error(error instanceof Error ? error.message : "Could not save shop details."); }
  };

  const logout = async () => { await queryClient.cancelQueries(); queryClient.clear(); await supabase.auth.signOut(); setUser(null); await queryClient.invalidateQueries({ queryKey: ["admin-access"] }); };

  if (checkingSession) return <main className="container-shop flex min-h-[50vh] items-center justify-center py-16 text-sm text-muted-foreground">Checking sign-in…</main>;

  if (!user) return <main className="container-shop flex min-h-[60vh] items-center justify-center py-14"><section className="w-full max-w-md border border-border p-6 sm:p-8"><p className="eyebrow">JUST GLOW</p><h1 className="mt-3 text-2xl font-semibold">{authMode === "signin" ? "Shop management" : "Create a shop account"}</h1><p className="mt-2 text-sm leading-6 text-muted-foreground">{authMode === "signin" ? "Sign in with your shop account to continue." : "Create your account, then confirm your email before signing in."}</p><form onSubmit={(event) => void signIn(event)} className="mt-7 grid gap-5"><div><Label htmlFor="admin-email">Email address</Label><Input id="admin-email" type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} className="mt-2" /></div><div><Label htmlFor="admin-password">Password</Label><Input id="admin-password" type="password" autoComplete={authMode === "signin" ? "current-password" : "new-password"} required minLength={8} value={password} onChange={(event) => setPassword(event.target.value)} className="mt-2" /></div><Button type="submit" variant="brand" size="xl" disabled={authBusy}>{authBusy ? "Please wait…" : authMode === "signin" ? "Sign in" : "Create account"}</Button></form><Button type="button" variant="link" className="mt-4 w-full" onClick={() => setAuthMode(authMode === "signin" ? "signup" : "signin")}>{authMode === "signin" ? "Create a shop account" : "Back to sign in"}</Button></section></main>;

  if (access.isPending || dataQuery.isPending) return <main className="container-shop flex min-h-[50vh] items-center justify-center py-16 text-sm text-muted-foreground">Loading shop management…</main>;
  if (!isAdmin) return <main className="container-shop flex min-h-[55vh] flex-col items-center justify-center py-16 text-center"><h1 className="text-2xl font-semibold">This account doesn’t have shop access.</h1><p className="mt-3 max-w-md text-sm leading-6 text-muted-foreground">Sign out and continue with an account assigned to manage JUST GLOW.</p><Button type="button" variant="outlineBrand" className="mt-6" onClick={() => void logout()}><LogOut /> Sign out</Button></main>;

  const tabs: { id: AdminTab; label: string; Icon: typeof ShoppingBasket }[] = [
    { id: "products", label: "Products", Icon: ShoppingBasket }, { id: "collections", label: "Collections", Icon: PackagePlus },
    { id: "orders", label: "Orders", Icon: Eye }, { id: "settings", label: "Shop details", Icon: Settings2 },
  ];

  return <main className="container-shop min-h-[65vh] py-10 md:py-14"><div className="flex flex-wrap items-end justify-between gap-4"><div><p className="eyebrow">JUST GLOW</p><h1 className="mt-2 text-3xl font-semibold">Shop management</h1><p className="mt-2 text-sm text-muted-foreground">Signed in as {user.email}</p></div><Button type="button" variant="ghost" onClick={() => void logout()}><LogOut /> Sign out</Button></div>
    <div className="mt-8 flex gap-2 overflow-x-auto border-b border-border pb-3">{tabs.map(({ id, label, Icon }) => <Button key={id} type="button" variant={tab === id ? "soft" : "ghost"} size="sm" className="shrink-0" onClick={() => setTab(id)}><Icon /> {label}</Button>)}</div>
    {dataQuery.isError && <div className="mt-5 border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">Could not load the shop data. Refresh the page to try again.</div>}

    {tab === "products" && <section className="py-7"><div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-xl font-semibold">Products</h2><p className="mt-1 text-sm text-muted-foreground">Add and update the products in your shop.</p></div><Button type="button" variant="brand" onClick={() => beginProduct(null)}><PackagePlus /> Add product</Button></div>
      {(productForm !== emptyProduct || editingProduct) && <form onSubmit={(event) => void submitProduct(event)} className="mt-6 grid gap-4 border border-border p-5 sm:grid-cols-2"><h3 className="text-lg font-semibold sm:col-span-2">{editingProduct ? "Edit product" : "New product"}</h3><div><Label htmlFor="product-name">Product name</Label><Input id="product-name" required value={productForm.name} onChange={(e) => setProductForm({ ...productForm, name: e.target.value })} className="mt-2" /></div><div><Label htmlFor="product-slug">Product link name</Label><Input id="product-slug" required pattern="[a-z0-9]+(?:-[a-z0-9]+)*" value={productForm.slug} onChange={(e) => setProductForm({ ...productForm, slug: e.target.value })} className="mt-2" /></div><div><Label htmlFor="product-price">Price in ₦</Label><Input id="product-price" type="number" min="1" step="1" required value={productForm.price} onChange={(e) => setProductForm({ ...productForm, price: e.target.value })} className="mt-2" /></div><div><Label htmlFor="product-category">Collection</Label><Select value={productForm.category_id || "none"} onValueChange={(value) => setProductForm({ ...productForm, category_id: value === "none" ? "" : value })}><SelectTrigger id="product-category" className="mt-2"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="none">No collection</SelectItem>{data?.categories.map((category) => <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>)}</SelectContent></Select></div><div className="sm:col-span-2"><Label htmlFor="product-short">Short description</Label><Input id="product-short" value={productForm.short_description} onChange={(e) => setProductForm({ ...productForm, short_description: e.target.value })} className="mt-2" /></div><div className="sm:col-span-2"><Label htmlFor="product-description">Product description</Label><Textarea id="product-description" rows={3} value={productForm.description} onChange={(e) => setProductForm({ ...productForm, description: e.target.value })} className="mt-2" /></div><div className="sm:col-span-2"><Label htmlFor="product-image">Product photo</Label><Input id="product-image" type="file" accept="image/*" onChange={(e) => setProductPhoto(e.target.files?.[0] ?? null)} className="mt-2" />{productForm.image_url && !productPhoto && <p className="mt-1 truncate text-xs text-muted-foreground">Current photo: {productForm.image_url}</p>}</div><div className="flex items-center gap-4 sm:col-span-2"><label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={productForm.featured} onChange={(e) => setProductForm({ ...productForm, featured: e.target.checked })} /> Show as favourite</label><label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={productForm.active} onChange={(e) => setProductForm({ ...productForm, active: e.target.checked })} /> Available in shop</label></div><div className="flex gap-2 sm:col-span-2"><Button type="submit" variant="brand"><Save /> Save product</Button><Button type="button" variant="outline" onClick={() => beginProduct(null)}>Cancel</Button></div></form>}
      <div className="mt-5 divide-y divide-border border-y border-border">{data?.products.map((product) => <article key={product.id} className="flex flex-wrap items-center gap-3 py-4"><img src={product.image_url ?? "/images/collections/body-care.jpg"} alt="" className="h-14 w-14 object-cover" /><div className="min-w-0 flex-1"><p className="truncate font-medium">{product.name}</p><p className="mt-1 text-xs text-muted-foreground">{formatNaira(product.price)} · {product.active ? "Available" : "Hidden"}{product.featured ? " · Favourite" : ""}</p></div><Button type="button" variant="ghost" size="icon" aria-label={`Edit ${product.name}`} onClick={() => beginProduct(product)}><Pencil /></Button><Button type="button" variant="ghost" size="icon" aria-label={`Delete ${product.name}`} onClick={() => { if (window.confirm(`Delete ${product.name}?`)) void deleteProduct({ data: { id: product.id } }).then(refreshAdmin).then(() => toast.success("Product deleted.")).catch(() => toast.error("Could not delete this product.")); }}><Trash2 /></Button></article>)}</div>
    </section>}

    {tab === "collections" && <section className="py-7"><div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-xl font-semibold">Collections</h2><p className="mt-1 text-sm text-muted-foreground">Organize products into shop collections.</p></div><Button type="button" variant="brand" onClick={() => beginCategory(null)}><PackagePlus /> Add collection</Button></div>
      {(categoryForm !== emptyCategory || editingCategory) && <form onSubmit={(event) => void submitCategory(event)} className="mt-6 grid gap-4 border border-border p-5 sm:grid-cols-2"><h3 className="text-lg font-semibold sm:col-span-2">{editingCategory ? "Edit collection" : "New collection"}</h3><div><Label htmlFor="category-name">Collection name</Label><Input id="category-name" required value={categoryForm.name} onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })} className="mt-2" /></div><div><Label htmlFor="category-slug">Collection link name</Label><Input id="category-slug" required pattern="[a-z0-9]+(?:-[a-z0-9]+)*" value={categoryForm.slug} onChange={(e) => setCategoryForm({ ...categoryForm, slug: e.target.value })} className="mt-2" /></div><div><Label htmlFor="category-order">Display order</Label><Input id="category-order" type="number" min="0" required value={categoryForm.sort_order} onChange={(e) => setCategoryForm({ ...categoryForm, sort_order: e.target.value })} className="mt-2" /></div><div className="sm:col-span-2"><Label htmlFor="category-description">Description</Label><Textarea id="category-description" rows={2} value={categoryForm.description} onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })} className="mt-2" /></div><div className="sm:col-span-2"><Label htmlFor="category-image">Collection photo</Label><Input id="category-image" type="file" accept="image/*" onChange={(e) => setCategoryPhoto(e.target.files?.[0] ?? null)} className="mt-2" /></div><div className="flex gap-2 sm:col-span-2"><Button type="submit" variant="brand"><Save /> Save collection</Button><Button type="button" variant="outline" onClick={() => beginCategory(null)}>Cancel</Button></div></form>}
      <div className="mt-5 divide-y divide-border border-y border-border">{data?.categories.map((category) => <article key={category.id} className="flex flex-wrap items-center gap-3 py-4"><img src={category.image_url ?? "/images/collections/body-care.jpg"} alt="" className="h-14 w-14 object-cover" /><div className="min-w-0 flex-1"><p className="font-medium">{category.name}</p><p className="mt-1 text-xs text-muted-foreground">{data.products.filter((product) => product.category_id === category.id).length} products · Order {category.sort_order}</p></div><Button type="button" variant="ghost" size="icon" aria-label={`Edit ${category.name}`} onClick={() => beginCategory(category)}><Pencil /></Button><Button type="button" variant="ghost" size="icon" aria-label={`Delete ${category.name}`} onClick={() => { if (window.confirm(`Delete ${category.name}? Products assigned to it may prevent removal.`)) void deleteCategory({ data: { id: category.id } }).then(refreshAdmin).then(() => toast.success("Collection removed.")).catch((error) => toast.error(error instanceof Error ? error.message : "Could not remove this collection.")); }}><Trash2 /></Button></article>)}</div>
    </section>}

    {tab === "orders" && <section className="py-7"><div><h2 className="text-xl font-semibold">Customer orders</h2><p className="mt-1 text-sm text-muted-foreground">Recent orders and payment status.</p></div><div className="mt-5 divide-y divide-border border-y border-border">{data?.orders.length ? data.orders.map((order: Order) => <article key={order.id} className="grid gap-4 py-5 md:grid-cols-[1fr_auto]"><div><div className="flex flex-wrap items-center gap-2"><p className="font-semibold">{order.customer_name}</p><span className="text-xs text-muted-foreground">{order.reference}</span></div><p className="mt-1 text-sm text-muted-foreground">{order.phone} · {order.email}</p><p className="mt-1 text-sm text-muted-foreground">{order.address}</p><p className="mt-2 text-sm font-medium">{formatNaira(order.total)} · {order.payment_method} · Payment {order.payment_status}</p><p className="mt-1 text-xs text-muted-foreground">{new Date(order.created_at).toLocaleDateString("en-NG", { dateStyle: "medium" })}</p></div><Select value={order.status} onValueChange={(status) => void updateOrder({ data: { id: order.id, status: status as "pending" | "confirmed" | "processing" | "shipped" | "completed" | "cancelled" } }).then(refreshAdmin).then(() => toast.success("Order updated.")).catch(() => toast.error("Could not update this order."))}><SelectTrigger aria-label={`Order status for ${order.reference}`} className="w-full md:w-44"><SelectValue /></SelectTrigger><SelectContent>{["pending", "confirmed", "processing", "shipped", "completed", "cancelled"].map((status) => <SelectItem key={status} value={status}>{status[0]?.toUpperCase()}{status.slice(1)}</SelectItem>)}</SelectContent></Select></article>) : <p className="py-10 text-sm text-muted-foreground">No customer orders yet.</p>}</div></section>}

    {tab === "settings" && <section className="py-7"><h2 className="text-xl font-semibold">Shop details</h2><p className="mt-1 text-sm text-muted-foreground">These details appear on your contact and order pages.</p><form onSubmit={(event) => void submitSettings(event)} className="mt-6 grid gap-5 sm:grid-cols-2">{([
      ["whatsapp_number", "WhatsApp number (digits only)"], ["business_email", "Business email"], ["phone", "Phone number"],
      ["instagram_url", "Instagram link"], ["facebook_url", "Facebook link"], ["tiktok_url", "TikTok link"],
    ] as const).map(([key, label]) => <div key={key}><Label htmlFor={`settings-${key}`}>{label}</Label><Input id={`settings-${key}`} required type={key === "business_email" ? "email" : "text"} value={settingsForm[key]} onChange={(event) => updateSetting(key, event.target.value)} className="mt-2" /></div>)}<div className="sm:col-span-2"><Button type="submit" variant="brand"><Save /> Save shop details</Button></div></form></section>}
  </main>;
}