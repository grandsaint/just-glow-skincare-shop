
create type public.app_role as enum ('admin', 'user');

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

create policy "Users can view own roles" on public.user_roles
  for select to authenticated using (user_id = auth.uid() or public.has_role(auth.uid(), 'admin'));

-- First signup becomes admin
create or replace function public.handle_first_admin()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if not exists (select 1 from public.user_roles where role = 'admin') then
    insert into public.user_roles (user_id, role) values (new.id, 'admin');
  end if;
  return new;
end;
$$;
create trigger on_auth_user_created_first_admin
  after insert on auth.users for each row execute function public.handle_first_admin();

create or replace function public.touch_updated_at()
returns trigger language plpgsql set search_path = public as $$
begin new.updated_at = now(); return new; end; $$;

-- Categories
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text not null default '',
  image_url text,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select on public.categories to anon, authenticated;
grant insert, update, delete on public.categories to authenticated;
grant all on public.categories to service_role;
alter table public.categories enable row level security;
create policy "Anyone can view categories" on public.categories for select to anon, authenticated using (true);
create policy "Admins insert categories" on public.categories for insert to authenticated with check (public.has_role(auth.uid(), 'admin'));
create policy "Admins update categories" on public.categories for update to authenticated using (public.has_role(auth.uid(), 'admin'));
create policy "Admins delete categories" on public.categories for delete to authenticated using (public.has_role(auth.uid(), 'admin'));
create trigger categories_updated before update on public.categories for each row execute function public.touch_updated_at();

-- Products
create table public.products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  category_id uuid references public.categories(id) on delete set null,
  price integer not null check (price >= 0),
  short_description text not null default '',
  description text not null default '',
  image_url text,
  featured boolean not null default false,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index products_category_idx on public.products(category_id);
grant select on public.products to anon, authenticated;
grant insert, update, delete on public.products to authenticated;
grant all on public.products to service_role;
alter table public.products enable row level security;
create policy "Anyone can view active products" on public.products for select to anon, authenticated
  using (active or public.has_role(auth.uid(), 'admin'));
create policy "Admins insert products" on public.products for insert to authenticated with check (public.has_role(auth.uid(), 'admin'));
create policy "Admins update products" on public.products for update to authenticated using (public.has_role(auth.uid(), 'admin'));
create policy "Admins delete products" on public.products for delete to authenticated using (public.has_role(auth.uid(), 'admin'));
create trigger products_updated before update on public.products for each row execute function public.touch_updated_at();

-- Settings (single row)
create table public.site_settings (
  id int primary key default 1 check (id = 1),
  whatsapp_number text not null default '2348000000000',
  business_email text not null default 'hello@justglow.ng',
  phone text not null default '+234 800 000 0000',
  instagram_url text not null default 'https://instagram.com/',
  facebook_url text not null default 'https://facebook.com/',
  tiktok_url text not null default 'https://tiktok.com/',
  updated_at timestamptz not null default now()
);
grant select on public.site_settings to anon, authenticated;
grant update on public.site_settings to authenticated;
grant all on public.site_settings to service_role;
alter table public.site_settings enable row level security;
create policy "Anyone can view settings" on public.site_settings for select to anon, authenticated using (true);
create policy "Admins update settings" on public.site_settings for update to authenticated using (public.has_role(auth.uid(), 'admin'));
create trigger settings_updated before update on public.site_settings for each row execute function public.touch_updated_at();
insert into public.site_settings (id) values (1);

-- Orders
create table public.orders (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique,
  customer_name text not null,
  phone text not null,
  email text not null,
  address text not null,
  items jsonb not null default '[]'::jsonb,
  total integer not null,
  payment_method text not null default 'paystack',
  payment_status text not null default 'pending',
  status text not null default 'pending',
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, update on public.orders to authenticated;
grant all on public.orders to service_role;
alter table public.orders enable row level security;
create policy "Admins view orders" on public.orders for select to authenticated using (public.has_role(auth.uid(), 'admin'));
create policy "Admins update orders" on public.orders for update to authenticated using (public.has_role(auth.uid(), 'admin'));
create trigger orders_updated before update on public.orders for each row execute function public.touch_updated_at();

-- Newsletter
create table public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  created_at timestamptz not null default now()
);
grant select on public.newsletter_subscribers to authenticated;
grant all on public.newsletter_subscribers to service_role;
alter table public.newsletter_subscribers enable row level security;
create policy "Admins view subscribers" on public.newsletter_subscribers for select to authenticated using (public.has_role(auth.uid(), 'admin'));

-- Seed collections
insert into public.categories (slug, name, description, image_url, sort_order) values
 ('body-care', 'Body Care', 'Silky lotions and body milks for everyday softness.', '/images/collections/body-care.jpg', 1),
 ('face-care', 'Face Care', 'Gentle creams for a fresh, cared-for complexion.', '/images/collections/face-care.jpg', 2),
 ('soaps-scrubs', 'Soaps & Scrubs', 'Cleansing bars and scrubs for a refreshing ritual.', '/images/collections/soaps-scrubs.jpg', 3),
 ('oils-serums', 'Oils & Serums', 'Lightweight oils for a nourished, dewy finish.', '/images/collections/oils-serums.jpg', 4),
 ('skin-treatments', 'Skin Treatments', 'Targeted care products for your routine.', '/images/collections/skin-treatments.jpg', 5);

-- Seed products (created_at staggered so the newest four show as "Latest")
insert into public.products (slug, name, category_id, price, short_description, description, image_url, featured, created_at)
select p.slug, p.name, c.id, p.price, p.short_d, p.long_d, '/images/products/' || p.slug || '.jpg', p.featured, now() - (p.age || ' days')::interval
from (values
 ('extra-lightening-lotion', 'Just Glow Extra Lightening Lotion', 'body-care', 10000, 'A smooth, rich body lotion for your daily routine.', 'A smooth, rich body lotion made for everyday use. Massage generously onto clean skin after bathing and enjoy a soft, comfortable feel. Full ingredient and usage details are available on request.', true, 20),
 ('super-lightening-body-milk-lotion', 'Just Glow Super Lightening Body Milk Lotion', 'body-care', 10000, 'A light, milky body lotion that absorbs easily.', 'A light, milky body lotion with a silky texture that absorbs easily into the skin. Apply to clean skin morning or night as part of your body care routine. Full ingredient and usage details are available on request.', false, 1),
 ('super-lightening-face-cream', 'Just Glow Super Lightening Face Cream', 'face-care', 5000, 'A creamy face moisturiser for daily care.', 'A creamy face moisturiser designed for daily use. Smooth a small amount over a clean face and neck. Full ingredient and usage details are available on request.', false, 2),
 ('radiance-shield-cream', 'Just Glow Radiance Shield Cream', 'face-care', 8000, 'A nourishing cream for a soft, glowing finish.', 'A nourishing everyday cream with a rich, comfortable texture that leaves skin feeling soft. Apply to clean skin as part of your morning or evening routine. Full ingredient and usage details are available on request.', true, 19),
 ('body-treat-soap', 'Just Glow Body Treat Soap', 'soaps-scrubs', 8000, 'A rich, creamy cleansing bar for the body.', 'A rich, creamy cleansing bar that lathers beautifully for a refreshing shower or bath. Full ingredient and usage details are available on request.', false, 3),
 ('super-lightening-soap', 'Just Glow Super Lightening Soap', 'soaps-scrubs', 8000, 'A gentle everyday cleansing bar.', 'A gentle everyday cleansing bar with a soft lather, made to complement the Super Lightening range. Full ingredient and usage details are available on request.', false, 10),
 ('extra-lightening-soap', 'Just Glow Extra Lightening Soap', 'soaps-scrubs', 10000, 'A luxurious cleansing bar from the Extra Lightening range.', 'A luxurious cleansing bar from the Extra Lightening range with a creamy, cushiony lather. Full ingredient and usage details are available on request.', false, 11),
 ('super-lightening-scrub', 'Super Lightening Scrub', 'soaps-scrubs', 8000, 'A body scrub for a smooth, refreshed feel.', 'A body scrub for your weekly exfoliation ritual. Massage gently onto damp skin in circular motions, then rinse well. Full ingredient and usage details are available on request.', false, 4),
 ('miracle-oil', 'Just Glow Miracle Oil for Redness of Face & Glowing Skin', 'oils-serums', 5000, 'A lightweight oil for a dewy, glowing look.', 'A lightweight, fast-absorbing oil that leaves skin with a dewy, glowing look. Warm a few drops between your palms and press gently onto skin. Full ingredient and usage details are available on request.', true, 18),
 ('super-lightening-oil', 'Just Glow Super Lightening Oil', 'oils-serums', 5000, 'A silky body oil from the Super Lightening range.', 'A silky body oil from the Super Lightening range. Apply to damp skin after bathing for a soft, smooth feel. Full ingredient and usage details are available on request.', false, 12),
 ('triple-action-scar-removal', 'Just Glow Triple Action Scar Removal', 'skin-treatments', 10000, 'A targeted care product for your routine.', 'A targeted care product to add to your skincare routine. Apply a small amount to the desired area as directed on the pack. Results vary from person to person. Full ingredient and usage details are available on request.', true, 17)
) as p(slug, name, cat, price, short_d, long_d, featured, age)
join public.categories c on c.slug = p.cat;

-- Storage policies for product images bucket (created via tool)
create policy "Public read product images" on storage.objects for select using (bucket_id = 'product-images');
create policy "Admins upload product images" on storage.objects for insert to authenticated with check (bucket_id = 'product-images' and public.has_role(auth.uid(), 'admin'));
create policy "Admins update product images" on storage.objects for update to authenticated using (bucket_id = 'product-images' and public.has_role(auth.uid(), 'admin'));
create policy "Admins delete product images" on storage.objects for delete to authenticated using (bucket_id = 'product-images' and public.has_role(auth.uid(), 'admin'));
