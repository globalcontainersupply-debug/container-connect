
CREATE OR REPLACE FUNCTION public.set_updated_at() RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TABLE public.categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  short_description text,
  description text,
  image_url text,
  sort_order int NOT NULL DEFAULT 0,
  published boolean NOT NULL DEFAULT true,
  seo_title text,
  seo_description text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.container_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  short_description text,
  description text,
  typical_uses text[] NOT NULL DEFAULT '{}',
  characteristics text[] NOT NULL DEFAULT '{}',
  available_sizes text[] NOT NULL DEFAULT '{}',
  image_url text,
  sort_order int NOT NULL DEFAULT 0,
  published boolean NOT NULL DEFAULT true,
  seo_title text,
  seo_description text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.container_sizes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  short_description text,
  description text,
  external_dimensions text,
  internal_dimensions text,
  door_dimensions text,
  capacity text,
  tare_weight text,
  max_gross_weight text,
  payload text,
  typical_applications text[] NOT NULL DEFAULT '{}',
  image_url text,
  sort_order int NOT NULL DEFAULT 0,
  published boolean NOT NULL DEFAULT true,
  seo_title text,
  seo_description text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  sku text,
  category_id uuid REFERENCES public.categories(id) ON DELETE SET NULL,
  type_id uuid REFERENCES public.container_types(id) ON DELETE SET NULL,
  size_id uuid REFERENCES public.container_sizes(id) ON DELETE SET NULL,
  condition text NOT NULL DEFAULT 'new',
  availability text NOT NULL DEFAULT 'available',
  price numeric,
  currency text NOT NULL DEFAULT 'USD',
  price_mode text NOT NULL DEFAULT 'fixed',
  quantity_available int,
  year_manufactured int,
  short_description text,
  description text,
  features text[] NOT NULL DEFAULT '{}',
  applications text[] NOT NULL DEFAULT '{}',
  delivery_info text,
  notes text,
  published boolean NOT NULL DEFAULT true,
  featured boolean NOT NULL DEFAULT false,
  popular boolean NOT NULL DEFAULT false,
  is_new_arrival boolean NOT NULL DEFAULT false,
  on_sale boolean NOT NULL DEFAULT false,
  sort_order int NOT NULL DEFAULT 0,
  seo_title text,
  seo_description text,
  focus_keyword text,
  og_image_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX products_type_idx ON public.products(type_id);
CREATE INDEX products_size_idx ON public.products(size_id);
CREATE INDEX products_category_idx ON public.products(category_id);

CREATE TABLE public.product_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  url text NOT NULL,
  alt_text text,
  is_primary boolean NOT NULL DEFAULT false,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX product_images_product_idx ON public.product_images(product_id);

CREATE TABLE public.product_specs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  label text NOT NULL,
  value text NOT NULL,
  sort_order int NOT NULL DEFAULT 0
);
CREATE INDEX product_specs_product_idx ON public.product_specs(product_id);

CREATE TABLE public.reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name text NOT NULL,
  company text,
  country text,
  avatar_url text,
  rating int NOT NULL DEFAULT 5,
  body text NOT NULL,
  review_date date NOT NULL DEFAULT current_date,
  published boolean NOT NULL DEFAULT true,
  featured boolean NOT NULL DEFAULT false,
  is_demo boolean NOT NULL DEFAULT false,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.faqs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question text NOT NULL,
  answer text NOT NULL,
  category text,
  sort_order int NOT NULL DEFAULT 0,
  published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.shipping_regions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  notes text,
  sort_order int NOT NULL DEFAULT 0,
  published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.blog_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  excerpt text,
  content text NOT NULL,
  featured_image_url text,
  author text,
  category text,
  tags text[] NOT NULL DEFAULT '{}',
  published boolean NOT NULL DEFAULT true,
  published_at timestamptz NOT NULL DEFAULT now(),
  seo_title text,
  seo_description text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.media (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  file_name text NOT NULL,
  url text NOT NULL,
  media_type text NOT NULL DEFAULT 'image',
  alt_text text,
  description text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.videos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  video_url text NOT NULL,
  poster_url text,
  placement text NOT NULL DEFAULT 'home',
  enabled boolean NOT NULL DEFAULT true,
  homepage_featured boolean NOT NULL DEFAULT false,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.site_settings (
  id int PRIMARY KEY DEFAULT 1,
  company_name text NOT NULL DEFAULT 'Global Container Supply',
  company_email text NOT NULL DEFAULT 'info@globalcontainersupply.com',
  phone text,
  address text,
  business_hours text,
  logo_url text,
  favicon_url text,
  currency text NOT NULL DEFAULT 'USD',
  default_seo_title text,
  default_seo_description text,
  default_social_image text,
  footer_text text,
  social_links jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT site_settings_singleton CHECK (id = 1)
);

CREATE TABLE public.home_content (
  id int PRIMARY KEY DEFAULT 1,
  hero_heading text NOT NULL DEFAULT 'Shipping Containers Supplied Worldwide',
  hero_subheading text,
  hero_primary_cta text NOT NULL DEFAULT 'Browse Containers',
  hero_secondary_cta text NOT NULL DEFAULT 'Request a Quote',
  hero_image_url text,
  shipping_section_image_url text,
  cta_section_image_url text,
  about_image_url text,
  benefits jsonb NOT NULL DEFAULT '[]'::jsonb,
  shipping_heading text,
  shipping_body text,
  video_heading text,
  video_body text,
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT home_content_singleton CHECK (id = 1)
);

GRANT SELECT ON public.categories, public.container_types, public.container_sizes,
  public.products, public.product_images, public.product_specs, public.reviews,
  public.faqs, public.shipping_regions, public.blog_posts, public.media,
  public.videos, public.site_settings, public.home_content TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.categories, public.container_types, public.container_sizes,
  public.products, public.product_images, public.product_specs, public.reviews,
  public.faqs, public.shipping_regions, public.blog_posts, public.media,
  public.videos, public.site_settings, public.home_content TO authenticated;
GRANT ALL ON public.categories, public.container_types, public.container_sizes,
  public.products, public.product_images, public.product_specs, public.reviews,
  public.faqs, public.shipping_regions, public.blog_posts, public.media,
  public.videos, public.site_settings, public.home_content TO service_role;

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.container_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.container_sizes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_specs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipping_regions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.home_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public read published categories" ON public.categories FOR SELECT TO anon USING (published);
CREATE POLICY "admins manage categories" ON public.categories FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "public read published types" ON public.container_types FOR SELECT TO anon USING (published);
CREATE POLICY "admins manage types" ON public.container_types FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "public read published sizes" ON public.container_sizes FOR SELECT TO anon USING (published);
CREATE POLICY "admins manage sizes" ON public.container_sizes FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "public read published products" ON public.products FOR SELECT TO anon USING (published);
CREATE POLICY "admins manage products" ON public.products FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "public read product images" ON public.product_images FOR SELECT TO anon USING (true);
CREATE POLICY "admins manage product images" ON public.product_images FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "public read product specs" ON public.product_specs FOR SELECT TO anon USING (true);
CREATE POLICY "admins manage product specs" ON public.product_specs FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "public read published reviews" ON public.reviews FOR SELECT TO anon USING (published);
CREATE POLICY "admins manage reviews" ON public.reviews FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "public read published faqs" ON public.faqs FOR SELECT TO anon USING (published);
CREATE POLICY "admins manage faqs" ON public.faqs FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "public read published regions" ON public.shipping_regions FOR SELECT TO anon USING (published);
CREATE POLICY "admins manage regions" ON public.shipping_regions FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "public read published posts" ON public.blog_posts FOR SELECT TO anon USING (published);
CREATE POLICY "admins manage posts" ON public.blog_posts FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "public read media" ON public.media FOR SELECT TO anon USING (true);
CREATE POLICY "admins manage media" ON public.media FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "public read enabled videos" ON public.videos FOR SELECT TO anon USING (enabled);
CREATE POLICY "admins manage videos" ON public.videos FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "public read settings" ON public.site_settings FOR SELECT TO anon USING (true);
CREATE POLICY "admins manage settings" ON public.site_settings FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "public read home content" ON public.home_content FOR SELECT TO anon USING (true);
CREATE POLICY "admins manage home content" ON public.home_content FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE TRIGGER t_categories BEFORE UPDATE ON public.categories FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER t_types BEFORE UPDATE ON public.container_types FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER t_sizes BEFORE UPDATE ON public.container_sizes FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER t_products BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER t_reviews BEFORE UPDATE ON public.reviews FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER t_faqs BEFORE UPDATE ON public.faqs FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER t_regions BEFORE UPDATE ON public.shipping_regions FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER t_posts BEFORE UPDATE ON public.blog_posts FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER t_videos BEFORE UPDATE ON public.videos FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER t_settings BEFORE UPDATE ON public.site_settings FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE POLICY "public read gcs buckets" ON storage.objects FOR SELECT TO anon, authenticated
  USING (bucket_id IN ('product-images','media','videos'));
CREATE POLICY "admins upload gcs buckets" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id IN ('product-images','media','videos'));
CREATE POLICY "admins update gcs buckets" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id IN ('product-images','media','videos'));
CREATE POLICY "admins delete gcs buckets" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id IN ('product-images','media','videos'));
