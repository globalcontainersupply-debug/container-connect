import { createPublicClient } from "./supabase-public.server";
import type { Database } from "@/integrations/supabase/types";

type Tables = Database["public"]["Tables"];
export type ProductRow = Tables["products"]["Row"];
export type ProductImageRow = Tables["product_images"]["Row"];
export type ProductSpecRow = Tables["product_specs"]["Row"];
export type CategoryRow = Tables["categories"]["Row"];
export type TypeRow = Tables["container_types"]["Row"];
export type SizeRow = Tables["container_sizes"]["Row"];
export type ReviewRow = Tables["reviews"]["Row"];
export type FaqRow = Tables["faqs"]["Row"];
export type RegionRow = Tables["shipping_regions"]["Row"];
export type BlogRow = Tables["blog_posts"]["Row"];
export type VideoRow = Tables["videos"]["Row"];
export type SettingsRow = Tables["site_settings"]["Row"];
export type HomeRow = Tables["home_content"]["Row"];

export type ProductCard = Pick<
  ProductRow,
  | "id"
  | "slug"
  | "name"
  | "condition"
  | "availability"
  | "price"
  | "currency"
  | "price_mode"
  | "short_description"
  | "featured"
  | "popular"
  | "is_new_arrival"
  | "on_sale"
  | "sort_order"
  | "category_id"
  | "type_id"
  | "size_id"
> & { image: string | null; imageAlt: string | null };

function toCards(
  products: ProductRow[],
  images: Pick<ProductImageRow, "product_id" | "url" | "alt_text" | "is_primary" | "sort_order">[],
): ProductCard[] {
  return products.map((p) => {
    const own = images
      .filter((i) => i.product_id === p.id)
      .sort((a, b) => Number(b.is_primary) - Number(a.is_primary) || a.sort_order - b.sort_order);
    return {
      id: p.id,
      slug: p.slug,
      name: p.name,
      condition: p.condition,
      availability: p.availability,
      price: p.price,
      currency: p.currency,
      price_mode: p.price_mode,
      short_description: p.short_description,
      featured: p.featured,
      popular: p.popular,
      is_new_arrival: p.is_new_arrival,
      on_sale: p.on_sale,
      sort_order: p.sort_order,
      category_id: p.category_id,
      type_id: p.type_id,
      size_id: p.size_id,
      image: own[0]?.url ?? null,
      imageAlt: own[0]?.alt_text ?? p.name,
    };
  });
}

export async function fetchCatalog() {
  const db = createPublicClient();
  const [products, images, categories, types, sizes] = await Promise.all([
    db.from("products").select("*").eq("published", true).order("sort_order"),
    db.from("product_images").select("product_id,url,alt_text,is_primary,sort_order"),
    db.from("categories").select("*").eq("published", true).order("sort_order"),
    db.from("container_types").select("*").eq("published", true).order("sort_order"),
    db.from("container_sizes").select("*").eq("published", true).order("sort_order"),
  ]);

  return {
    products: toCards(products.data ?? [], images.data ?? []),
    categories: (categories.data ?? []) as CategoryRow[],
    types: (types.data ?? []) as TypeRow[],
    sizes: (sizes.data ?? []) as SizeRow[],
  };
}

export async function fetchSiteChrome() {
  const db = createPublicClient();
  const [settings, categories, types, sizes] = await Promise.all([
    db.from("site_settings").select("*").eq("id", 1).maybeSingle(),
    db.from("categories").select("slug,name").eq("published", true).order("sort_order"),
    db.from("container_types").select("slug,name").eq("published", true).order("sort_order"),
    db.from("container_sizes").select("slug,name").eq("published", true).order("sort_order"),
  ]);
  return {
    settings: settings.data as SettingsRow | null,
    categories: categories.data ?? [],
    types: types.data ?? [],
    sizes: sizes.data ?? [],
  };
}

export async function fetchHome() {
  const db = createPublicClient();
  const [home, catalog, reviews, videos, posts] = await Promise.all([
    db.from("home_content").select("*").eq("id", 1).maybeSingle(),
    fetchCatalog(),
    db
      .from("reviews")
      .select("*")
      .eq("published", true)
      .order("sort_order")
      .limit(6),
    db.from("videos").select("*").eq("enabled", true).order("sort_order"),
    db
      .from("blog_posts")
      .select("slug,title,excerpt,featured_image_url,published_at,category")
      .eq("published", true)
      .order("published_at", { ascending: false })
      .limit(3),
  ]);

  return {
    home: home.data as HomeRow | null,
    ...catalog,
    reviews: (reviews.data ?? []) as ReviewRow[],
    videos: (videos.data ?? []) as VideoRow[],
    posts: posts.data ?? [],
  };
}

export async function fetchProduct(slug: string) {
  const db = createPublicClient();
  const { data: product } = await db
    .from("products")
    .select("*")
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle();

  if (!product) return null;

  const [images, specs, category, type, size, related, relatedImages] = await Promise.all([
    db.from("product_images").select("*").eq("product_id", product.id).order("sort_order"),
    db.from("product_specs").select("*").eq("product_id", product.id).order("sort_order"),
    product.category_id
      ? db.from("categories").select("slug,name").eq("id", product.category_id).maybeSingle()
      : Promise.resolve({ data: null }),
    product.type_id
      ? db.from("container_types").select("slug,name").eq("id", product.type_id).maybeSingle()
      : Promise.resolve({ data: null }),
    product.size_id
      ? db.from("container_sizes").select("*").eq("id", product.size_id).maybeSingle()
      : Promise.resolve({ data: null }),
    db
      .from("products")
      .select("*")
      .eq("published", true)
      .neq("id", product.id)
      .limit(20),
    db.from("product_images").select("product_id,url,alt_text,is_primary,sort_order"),
  ]);

  const relatedRows = (related.data ?? []) as ProductRow[];
  const sameType = relatedRows.filter((r) => r.type_id === product.type_id).slice(0, 3);
  const fill = relatedRows.filter((r) => !sameType.includes(r)).slice(0, 3 - sameType.length);

  return {
    product: product as ProductRow,
    images: (images.data ?? []) as ProductImageRow[],
    specs: (specs.data ?? []) as ProductSpecRow[],
    category: category.data as { slug: string; name: string } | null,
    type: type.data as { slug: string; name: string } | null,
    size: size.data as SizeRow | null,
    related: toCards([...sameType, ...fill], relatedImages.data ?? []),
  };
}

export async function fetchTaxonomy() {
  const db = createPublicClient();
  const [types, sizes] = await Promise.all([
    db.from("container_types").select("*").eq("published", true).order("sort_order"),
    db.from("container_sizes").select("*").eq("published", true).order("sort_order"),
  ]);
  return { types: (types.data ?? []) as TypeRow[], sizes: (sizes.data ?? []) as SizeRow[] };
}

export async function fetchSupportContent() {
  const db = createPublicClient();
  const [faqs, reviews, regions] = await Promise.all([
    db.from("faqs").select("*").eq("published", true).order("sort_order"),
    db.from("reviews").select("*").eq("published", true).order("sort_order"),
    db.from("shipping_regions").select("*").eq("published", true).order("sort_order"),
  ]);
  return {
    faqs: (faqs.data ?? []) as FaqRow[],
    reviews: (reviews.data ?? []) as ReviewRow[],
    regions: (regions.data ?? []) as RegionRow[],
  };
}

export async function fetchPosts() {
  const db = createPublicClient();
  const { data } = await db
    .from("blog_posts")
    .select("*")
    .eq("published", true)
    .order("published_at", { ascending: false });
  return (data ?? []) as BlogRow[];
}

export async function fetchPost(slug: string) {
  const db = createPublicClient();
  const { data } = await db
    .from("blog_posts")
    .select("*")
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle();
  return (data as BlogRow | null) ?? null;
}

export async function fetchSitemapEntries() {
  const db = createPublicClient();
  const [products, types, sizes, posts] = await Promise.all([
    db.from("products").select("slug").eq("published", true),
    db.from("container_types").select("slug").eq("published", true),
    db.from("container_sizes").select("slug").eq("published", true),
    db.from("blog_posts").select("slug").eq("published", true),
  ]);
  return {
    products: (products.data ?? []).map((r) => r.slug),
    types: (types.data ?? []).map((r) => r.slug),
    sizes: (sizes.data ?? []).map((r) => r.slug),
    posts: (posts.data ?? []).map((r) => r.slug),
  };
}
