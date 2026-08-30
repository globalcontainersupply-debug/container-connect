import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const idSchema = z.object({ id: z.string().uuid() });

function fail(error: { message: string } | null) {
  if (error) throw new Error(error.message);
}

function assertRow<T>(row: T | null, error: { message: string } | null): asserts row is T {
  if (error) throw new Error(error.message);
  if (row == null) throw new Error("Row not found after save");
}

function withOptionalId<T extends { id?: string | undefined }>(
  data: T,
): Omit<T, "id"> & { id?: string } {
  const { id, ...rest } = data;
  return (id ? { id, ...rest } : rest) as Omit<T, "id"> & { id?: string };
}

// ---------------------------------------------------------------------------
// Stats
// ---------------------------------------------------------------------------

export const getAdminStats = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase } = context;
    const [products, published, featured, reviews, media, videos, posts] = await Promise.all([
      supabase.from("products").select("id", { count: "exact", head: true }),
      supabase.from("products").select("id", { count: "exact", head: true }).eq("published", true),
      supabase.from("products").select("id", { count: "exact", head: true }).eq("featured", true),
      supabase.from("reviews").select("id", { count: "exact", head: true }),
      supabase.from("media").select("id", { count: "exact", head: true }),
      supabase.from("videos").select("id", { count: "exact", head: true }),
      supabase.from("blog_posts").select("id", { count: "exact", head: true }),
    ]);
    const { data: recentProducts } = await supabase
      .from("products")
      .select("id,slug,name,published,sort_order,created_at")
      .order("created_at", { ascending: false })
      .limit(5);
    return {
      productsTotal: products.count ?? 0,
      productsPublished: published.count ?? 0,
      productsUnpublished: (products.count ?? 0) - (published.count ?? 0),
      productsFeatured: featured.count ?? 0,
      reviewsTotal: reviews.count ?? 0,
      mediaTotal: media.count ?? 0,
      videosTotal: videos.count ?? 0,
      postsTotal: posts.count ?? 0,
      recentProducts: recentProducts ?? [],
    };
  });

// ---------------------------------------------------------------------------
// Products
// ---------------------------------------------------------------------------

const productSchema = z.object({
  id: z.string().uuid().optional(),
  slug: z.string().min(1),
  name: z.string().min(1),
  sku: z.string().nullable(),
  category_id: z.string().uuid().nullable(),
  type_id: z.string().uuid().nullable(),
  size_id: z.string().uuid().nullable(),
  condition: z.enum(["new", "used"]),
  availability: z.enum(["available", "limited", "on_order"]),
  price: z.number().nullable(),
  currency: z.string().min(1),
  price_mode: z.enum(["fixed", "from", "quote", "hidden"]),
  quantity_available: z.number().int().nullable(),
  year_manufactured: z.number().int().nullable(),
  short_description: z.string().nullable(),
  description: z.string().nullable(),
  features: z.array(z.string()),
  applications: z.array(z.string()),
  delivery_info: z.string().nullable(),
  notes: z.string().nullable(),
  published: z.boolean(),
  featured: z.boolean(),
  popular: z.boolean(),
  is_new_arrival: z.boolean(),
  on_sale: z.boolean(),
  sort_order: z.number().int(),
  seo_title: z.string().nullable(),
  seo_description: z.string().nullable(),
  focus_keyword: z.string().nullable(),
  og_image_url: z.string().nullable(),
});

export const listProductsAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const [products, images] = await Promise.all([
      context.supabase.from("products").select("*").order("sort_order"),
      context.supabase
        .from("product_images")
        .select("product_id,url,is_primary,sort_order")
        .order("sort_order"),
    ]);
    fail(products.error);
    return { products: products.data ?? [], images: images.data ?? [] };
  });

export const getProductAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => idSchema.parse(data))
  .handler(async ({ context, data }) => {
    const [product, images, specs] = await Promise.all([
      context.supabase.from("products").select("*").eq("id", data.id).maybeSingle(),
      context.supabase
        .from("product_images")
        .select("*")
        .eq("product_id", data.id)
        .order("sort_order"),
      context.supabase
        .from("product_specs")
        .select("*")
        .eq("product_id", data.id)
        .order("sort_order"),
    ]);
    fail(product.error);
    return {
      product: product.data,
      images: images.data ?? [],
      specs: specs.data ?? [],
    };
  });

export const upsertProduct = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => productSchema.parse(data))
  .handler(async ({ context, data }) => {
    const { data: row, error } = await context.supabase
      .from("products")
      .upsert(withOptionalId(data))
      .select()
      .single();
    assertRow(row, error);
    return row;
  });

export const deleteProduct = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => idSchema.parse(data))
  .handler(async ({ context, data }) => {
    const { error } = await context.supabase.from("products").delete().eq("id", data.id);
    fail(error);
    return { ok: true };
  });

export const duplicateProduct = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => idSchema.parse(data))
  .handler(async ({ context, data }) => {
    const { data: source, error: sourceError } = await context.supabase
      .from("products")
      .select("*")
      .eq("id", data.id)
      .single();
    fail(sourceError);
    if (!source) throw new Error("Product not found");

    const { id: _id, created_at: _createdAt, updated_at: _updatedAt, ...rest } = source;
    const { data: copy, error } = await context.supabase
      .from("products")
      .insert({ ...rest, slug: `${rest.slug}-copy`, name: `${rest.name} (Copy)`, published: false })
      .select()
      .single();
    fail(error);

    const { data: images } = await context.supabase
      .from("product_images")
      .select("url,alt_text,is_primary,sort_order")
      .eq("product_id", data.id);
    if (images?.length && copy) {
      await context.supabase
        .from("product_images")
        .insert(images.map((img) => ({ ...img, product_id: copy.id })));
    }

    const { data: specs } = await context.supabase
      .from("product_specs")
      .select("label,value,sort_order")
      .eq("product_id", data.id);
    if (specs?.length && copy) {
      await context.supabase
        .from("product_specs")
        .insert(specs.map((spec) => ({ ...spec, product_id: copy.id })));
    }

    return copy;
  });

export const setProductPublished = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => z.object({ id: z.string().uuid(), published: z.boolean() }).parse(data))
  .handler(async ({ context, data }) => {
    const { error } = await context.supabase
      .from("products")
      .update({ published: data.published })
      .eq("id", data.id);
    fail(error);
    return { ok: true };
  });

const productSpecRowSchema = z.object({
  id: z.string().uuid().optional(),
  label: z.string().min(1),
  value: z.string().min(1),
  sort_order: z.number().int(),
});

export const saveProductSpecs = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z.object({ productId: z.string().uuid(), specs: z.array(productSpecRowSchema) }).parse(data),
  )
  .handler(async ({ context, data }) => {
    await context.supabase.from("product_specs").delete().eq("product_id", data.productId);
    if (data.specs.length) {
      const { error } = await context.supabase.from("product_specs").insert(
        data.specs.map((s) => ({
          product_id: data.productId,
          label: s.label,
          value: s.value,
          sort_order: s.sort_order,
        })),
      );
      fail(error);
    }
    return { ok: true };
  });

const productImageRowSchema = z.object({
  id: z.string().uuid().optional(),
  url: z.string().min(1),
  alt_text: z.string().nullable(),
  is_primary: z.boolean(),
  sort_order: z.number().int(),
});

export const saveProductImages = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z.object({ productId: z.string().uuid(), images: z.array(productImageRowSchema) }).parse(data),
  )
  .handler(async ({ context, data }) => {
    await context.supabase.from("product_images").delete().eq("product_id", data.productId);
    if (data.images.length) {
      const { error } = await context.supabase.from("product_images").insert(
        data.images.map((img) => ({
          product_id: data.productId,
          url: img.url,
          alt_text: img.alt_text ?? null,
          is_primary: img.is_primary,
          sort_order: img.sort_order,
        })),
      );
      fail(error);
    }
    return { ok: true };
  });

export const deleteProductImage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => idSchema.parse(data))
  .handler(async ({ context, data }) => {
    const { error } = await context.supabase.from("product_images").delete().eq("id", data.id);
    fail(error);
    return { ok: true };
  });

// ---------------------------------------------------------------------------
// Categories
// ---------------------------------------------------------------------------

const categorySchema = z.object({
  id: z.string().uuid().optional(),
  slug: z.string().min(1),
  name: z.string().min(1),
  short_description: z.string().nullable(),
  description: z.string().nullable(),
  image_url: z.string().nullable(),
  sort_order: z.number().int(),
  published: z.boolean(),
  seo_title: z.string().nullable(),
  seo_description: z.string().nullable(),
});

export const listCategoriesAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase.from("categories").select("*").order("sort_order");
    fail(error);
    return data ?? [];
  });

export const upsertCategory = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => categorySchema.parse(data))
  .handler(async ({ context, data }) => {
    const { data: row, error } = await context.supabase.from("categories").upsert(withOptionalId(data)).select().single();
    fail(error);
    return row;
  });

export const deleteCategory = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => idSchema.parse(data))
  .handler(async ({ context, data }) => {
    const { error } = await context.supabase.from("categories").delete().eq("id", data.id);
    fail(error);
    return { ok: true };
  });

// ---------------------------------------------------------------------------
// Container types
// ---------------------------------------------------------------------------

const typeSchema = z.object({
  id: z.string().uuid().optional(),
  slug: z.string().min(1),
  name: z.string().min(1),
  short_description: z.string().nullable(),
  description: z.string().nullable(),
  typical_uses: z.array(z.string()),
  characteristics: z.array(z.string()),
  available_sizes: z.array(z.string()),
  image_url: z.string().nullable(),
  sort_order: z.number().int(),
  published: z.boolean(),
  seo_title: z.string().nullable(),
  seo_description: z.string().nullable(),
});

export const listTypesAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("container_types")
      .select("*")
      .order("sort_order");
    fail(error);
    return data ?? [];
  });

export const upsertType = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => typeSchema.parse(data))
  .handler(async ({ context, data }) => {
    const { data: row, error } = await context.supabase
      .from("container_types")
      .upsert(withOptionalId(data))
      .select()
      .single();
    fail(error);
    return row;
  });

export const deleteType = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => idSchema.parse(data))
  .handler(async ({ context, data }) => {
    const { error } = await context.supabase.from("container_types").delete().eq("id", data.id);
    fail(error);
    return { ok: true };
  });

// ---------------------------------------------------------------------------
// Container sizes
// ---------------------------------------------------------------------------

const sizeSchema = z.object({
  id: z.string().uuid().optional(),
  slug: z.string().min(1),
  name: z.string().min(1),
  short_description: z.string().nullable(),
  description: z.string().nullable(),
  external_dimensions: z.string().nullable(),
  internal_dimensions: z.string().nullable(),
  door_dimensions: z.string().nullable(),
  capacity: z.string().nullable(),
  tare_weight: z.string().nullable(),
  max_gross_weight: z.string().nullable(),
  payload: z.string().nullable(),
  typical_applications: z.array(z.string()),
  image_url: z.string().nullable(),
  sort_order: z.number().int(),
  published: z.boolean(),
  seo_title: z.string().nullable(),
  seo_description: z.string().nullable(),
});

export const listSizesAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("container_sizes")
      .select("*")
      .order("sort_order");
    fail(error);
    return data ?? [];
  });

export const upsertSize = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => sizeSchema.parse(data))
  .handler(async ({ context, data }) => {
    const { data: row, error } = await context.supabase
      .from("container_sizes")
      .upsert(withOptionalId(data))
      .select()
      .single();
    fail(error);
    return row;
  });

export const deleteSize = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => idSchema.parse(data))
  .handler(async ({ context, data }) => {
    const { error } = await context.supabase.from("container_sizes").delete().eq("id", data.id);
    fail(error);
    return { ok: true };
  });

// ---------------------------------------------------------------------------
// Shipping regions
// ---------------------------------------------------------------------------

const regionSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().nullable(),
  notes: z.string().nullable(),
  sort_order: z.number().int(),
  published: z.boolean(),
});

export const listRegionsAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("shipping_regions")
      .select("*")
      .order("sort_order");
    fail(error);
    return data ?? [];
  });

export const upsertRegion = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => regionSchema.parse(data))
  .handler(async ({ context, data }) => {
    const { data: row, error } = await context.supabase
      .from("shipping_regions")
      .upsert(withOptionalId(data))
      .select()
      .single();
    fail(error);
    return row;
  });

export const deleteRegion = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => idSchema.parse(data))
  .handler(async ({ context, data }) => {
    const { error } = await context.supabase.from("shipping_regions").delete().eq("id", data.id);
    fail(error);
    return { ok: true };
  });

// ---------------------------------------------------------------------------
// FAQs
// ---------------------------------------------------------------------------

const faqSchema = z.object({
  id: z.string().uuid().optional(),
  question: z.string().min(1),
  answer: z.string().min(1),
  category: z.string().nullable(),
  sort_order: z.number().int(),
  published: z.boolean(),
});

export const listFaqsAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase.from("faqs").select("*").order("sort_order");
    fail(error);
    return data ?? [];
  });

export const upsertFaq = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => faqSchema.parse(data))
  .handler(async ({ context, data }) => {
    const { data: row, error } = await context.supabase.from("faqs").upsert(withOptionalId(data)).select().single();
    fail(error);
    return row;
  });

export const deleteFaq = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => idSchema.parse(data))
  .handler(async ({ context, data }) => {
    const { error } = await context.supabase.from("faqs").delete().eq("id", data.id);
    fail(error);
    return { ok: true };
  });

// ---------------------------------------------------------------------------
// Reviews
// ---------------------------------------------------------------------------

const reviewSchema = z.object({
  id: z.string().uuid().optional(),
  customer_name: z.string().min(1),
  company: z.string().nullable(),
  country: z.string().nullable(),
  avatar_url: z.string().nullable(),
  rating: z.number().int().min(1).max(5),
  body: z.string().min(1),
  review_date: z.string().min(1),
  published: z.boolean(),
  featured: z.boolean(),
  is_demo: z.boolean(),
  sort_order: z.number().int(),
});

export const listReviewsAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase.from("reviews").select("*").order("sort_order");
    fail(error);
    return data ?? [];
  });

export const upsertReview = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => reviewSchema.parse(data))
  .handler(async ({ context, data }) => {
    const { data: row, error } = await context.supabase.from("reviews").upsert(withOptionalId(data)).select().single();
    fail(error);
    return row;
  });

export const deleteReview = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => idSchema.parse(data))
  .handler(async ({ context, data }) => {
    const { error } = await context.supabase.from("reviews").delete().eq("id", data.id);
    fail(error);
    return { ok: true };
  });

// ---------------------------------------------------------------------------
// Blog posts
// ---------------------------------------------------------------------------

const postSchema = z.object({
  id: z.string().uuid().optional(),
  slug: z.string().min(1),
  title: z.string().min(1),
  excerpt: z.string().nullable(),
  content: z.string().min(1),
  featured_image_url: z.string().nullable(),
  author: z.string().nullable(),
  category: z.string().nullable(),
  tags: z.array(z.string()),
  published: z.boolean(),
  published_at: z.string().min(1),
  seo_title: z.string().nullable(),
  seo_description: z.string().nullable(),
});

export const listPostsAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("blog_posts")
      .select("*")
      .order("published_at", { ascending: false });
    fail(error);
    return data ?? [];
  });

export const upsertPost = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => postSchema.parse(data))
  .handler(async ({ context, data }) => {
    const { data: row, error } = await context.supabase.from("blog_posts").upsert(withOptionalId(data)).select().single();
    fail(error);
    return row;
  });

export const deletePost = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => idSchema.parse(data))
  .handler(async ({ context, data }) => {
    const { error } = await context.supabase.from("blog_posts").delete().eq("id", data.id);
    fail(error);
    return { ok: true };
  });

// ---------------------------------------------------------------------------
// Media
// ---------------------------------------------------------------------------

const mediaSchema = z.object({
  id: z.string().uuid().optional(),
  file_name: z.string().min(1),
  url: z.string().min(1),
  media_type: z.string().min(1),
  alt_text: z.string().nullable(),
  description: z.string().nullable(),
});

export const listMediaAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("media")
      .select("*")
      .order("created_at", { ascending: false });
    fail(error);
    return data ?? [];
  });

export const upsertMedia = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => mediaSchema.parse(data))
  .handler(async ({ context, data }) => {
    const { data: row, error } = await context.supabase.from("media").upsert(withOptionalId(data)).select().single();
    fail(error);
    return row;
  });

export const deleteMedia = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => idSchema.parse(data))
  .handler(async ({ context, data }) => {
    const { error } = await context.supabase.from("media").delete().eq("id", data.id);
    fail(error);
    return { ok: true };
  });

// ---------------------------------------------------------------------------
// Videos
// ---------------------------------------------------------------------------

const videoSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().min(1),
  description: z.string().nullable(),
  video_url: z.string().min(1),
  poster_url: z.string().nullable(),
  placement: z.string().min(1),
  enabled: z.boolean(),
  homepage_featured: z.boolean(),
  sort_order: z.number().int(),
});

export const listVideosAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase.from("videos").select("*").order("sort_order");
    fail(error);
    return data ?? [];
  });

export const upsertVideo = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => videoSchema.parse(data))
  .handler(async ({ context, data }) => {
    const { data: row, error } = await context.supabase.from("videos").upsert(withOptionalId(data)).select().single();
    fail(error);
    return row;
  });

export const deleteVideo = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => idSchema.parse(data))
  .handler(async ({ context, data }) => {
    const { error } = await context.supabase.from("videos").delete().eq("id", data.id);
    fail(error);
    return { ok: true };
  });

// ---------------------------------------------------------------------------
// Site settings & homepage content (singleton rows)
// ---------------------------------------------------------------------------

const settingsSchema = z.object({
  company_name: z.string().min(1),
  company_email: z.string().email(),
  phone: z.string().nullable(),
  whatsapp_secondary: z.string().nullable(),
  address: z.string().nullable(),
  business_hours: z.string().nullable(),
  logo_url: z.string().nullable(),
  favicon_url: z.string().nullable(),
  currency: z.string().min(1),
  default_seo_title: z.string().nullable(),
  default_seo_description: z.string().nullable(),
  default_social_image: z.string().nullable(),
  footer_text: z.string().nullable(),
  social_links: z.record(z.string(), z.string()),
});

export const getSettingsAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("site_settings")
      .select("*")
      .eq("id", 1)
      .maybeSingle();
    fail(error);
    return data;
  });

export const updateSiteSettings = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => settingsSchema.parse(data))
  .handler(async ({ context, data }) => {
    const { data: row, error } = await context.supabase
      .from("site_settings")
      .upsert({ id: 1, ...data })
      .select()
      .single();
    fail(error);
    return row;
  });

const benefitSchema = z.object({ title: z.string(), body: z.string() });

const homeSchema = z.object({
  hero_heading: z.string().min(1),
  hero_subheading: z.string().nullable(),
  hero_primary_cta: z.string().min(1),
  hero_secondary_cta: z.string().min(1),
  hero_image_url: z.string().nullable(),
  shipping_section_image_url: z.string().nullable(),
  cta_section_image_url: z.string().nullable(),
  about_image_url: z.string().nullable(),
  benefits: z.array(benefitSchema),
  shipping_heading: z.string().nullable(),
  shipping_body: z.string().nullable(),
  video_heading: z.string().nullable(),
  video_body: z.string().nullable(),
});

export const getHomeAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("home_content")
      .select("*")
      .eq("id", 1)
      .maybeSingle();
    fail(error);
    return data;
  });

export const updateHomeContent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => homeSchema.parse(data))
  .handler(async ({ context, data }) => {
    const { data: row, error } = await context.supabase
      .from("home_content")
      .upsert({ id: 1, ...data })
      .select()
      .single();
    fail(error);
    return row;
  });
