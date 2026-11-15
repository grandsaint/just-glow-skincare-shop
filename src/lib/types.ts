export interface Category {
  id: string;
  slug: string;
  name: string;
  description: string;
  image_url: string | null;
  sort_order: number;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  category_id: string | null;
  price: number;
  short_description: string;
  description: string;
  image_url: string | null;
  featured: boolean;
  active: boolean;
  created_at: string;
}

export interface SiteSettings {
  whatsapp_number: string;
  business_email: string;
  phone: string;
  instagram_url: string;
  facebook_url: string;
  tiktok_url: string;
}

export const DEFAULT_SETTINGS: SiteSettings = {
  whatsapp_number: "2348000000000",
  business_email: "hello@justglow.ng",
  phone: "+234 800 000 0000",
  instagram_url: "https://instagram.com/",
  facebook_url: "https://facebook.com/",
  tiktok_url: "https://tiktok.com/",
};

export const PLACEHOLDER_IMAGE = "/images/collections/body-care.jpg";
