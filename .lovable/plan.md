# Global Container Supply — Completion Plan (handover-grade)

This is the full remaining build spec, written so another agent (Claude Code) can continue and stay byte-compatible with what Lovable already generated.

## 1. Current state (verified)

Backend (Lovable Cloud / Postgres) is complete and seeded. Tables live today:
`categories`, `container_types`, `container_sizes`, `products`, `product_images`,
`product_specs`, `reviews`, `faqs`, `shipping_regions`, `blog_posts`, `media`,
`videos`, `site_settings`, `home_content`. Each has RLS: `public read published <x>`
(SELECT, role `anon`, `USING (published)` — or `USING (true)` for settings/home/media)
and `admins manage <x>` (ALL, role `authenticated`, `USING true WITH CHECK true`).
Storage buckets exist: `product-images`, `media`, `videos`.

Frontend files that already exist and must NOT be re-architected:
- `src/styles.css` — design tokens (`--navy`, `--navy-deep`, `--steel`, `--primary` = safety orange, fonts Barlow / Barlow Condensed) plus a `container-page` utility.
- `src/routes/__root.tsx` — QueryClientProvider, CartProvider, SiteHeader, SiteFooter, Sonner Toaster, fonts via `<link>` in head, Organization + WebSite JSON-LD.
- `src/components/site/` — `site-header.tsx`, `site-footer.tsx`, `product-card.tsx`.
- `src/context/cart.tsx` — cart state in React context + localStorage.
- `src/lib/` — `supabase-public.server.ts` (anon server client), `catalog-data.server.ts` (all read queries), `catalog.functions.ts` (server fns), `queries.ts` (queryOptions), `seo.ts`, `site.ts` (brand constants, `formatPrice`, `FORMSUBMIT_ENDPOINT`).
- Routes done: `/`, `/containers`, `/containers/$slug`, `/cart`, `/checkout`, `/enquiry-received`.

## 2. Conventions every new file must follow

- TanStack Start v1 file routes in `src/routes`. Filename dots = URL slashes; `createFileRoute("/exact/route/id")` must match the filename. Never edit `src/routeTree.gen.ts`.
- Data reads: add a fetcher in `src/lib/catalog-data.server.ts` → wrap in a `createServerFn` in `src/lib/catalog.functions.ts` (handler does `await import("./catalog-data.server")`) → expose `queryOptions` in `src/lib/queries.ts` → route `loader: ({ context }) => context.queryClient.ensureQueryData(xQuery)` + `useSuspenseQuery(xQuery)` in the component. No `useEffect` fetching.
- Writes: `createServerFn({ method: "POST" })` with `.middleware([requireSupabaseAuth])` in a new `src/lib/admin.functions.ts`, using `context.supabase`. Never `supabaseAdmin` for CRUD. Bearer attachment is already registered in `src/start.ts`.
- Admin pages live under `src/routes/_authenticated/` (the pathless gate layout `_authenticated/route.tsx` is integration-managed, `ssr: false`, redirects to `/auth`). Protected loaders are allowed only there; public routes must never call a `requireSupabaseAuth` fn from a loader.
- Every public route defines its own `head()` with unique title, description, `og:title`, `og:description`, canonical. Use the helpers in `src/lib/seo.ts`.
- Only semantic tokens for colour (`bg-navy`, `text-primary`, `bg-muted`…). No `text-white`, no hex.
- UI from `src/components/ui` (shadcn already installed). Toasts via `sonner`.

## 3. Public pages still to build

Each is a route file + `head()` + loader/suspense query. Reuse `ProductCard` and existing filter logic where noted.

| Route | File | Content |
| --- | --- | --- |
| `/container-types` | `container-types.index.tsx` | Grid of published types from `taxonomyQuery`: image, name, short description, typical uses chips, link to detail. |
| `/container-types/$slug` | `container-types.$slug.tsx` | Hero image, long description, characteristics list, typical uses, available sizes chips linking to size pages, products of that `type_id` via `catalogQuery`, breadcrumbs + BreadcrumbList JSON-LD, quote CTA. 404 via `notFound()`. |
| `/container-sizes` | `container-sizes.index.tsx` | Grid of sizes with dimensions summary. |
| `/container-sizes/$slug` | `container-sizes.$slug.tsx` | Spec table (external/internal/door dimensions, capacity, tare, max gross, payload), typical applications, matching products, breadcrumbs JSON-LD. |
| `/new-containers` | `new-containers.tsx` | Catalog grid pre-filtered `condition = 'new'`, intro copy about one-trip units, link into `/containers`. |
| `/used-containers` | `used-containers.tsx` | Same for `condition = 'used'` with grading explainer. |
| `/about-us` | `about-us.tsx` | Company story, sourcing/inspection process (use `public/images/about-inspection.jpg`, `yard-aerial.jpg`), values grid, CTA. No invented certifications or statistics. |
| `/worldwide-shipping` | `worldwide-shipping.tsx` | Regions from `supportQuery.regions`, delivery modes, documentation, lead-time expectations, FAQ subset. |
| `/how-it-works` | `how-it-works.tsx` | 5-step process (enquire → specification → quotation → payment terms → delivery), timeline layout. |
| `/industries` | `industries.tsx` | Static industry cards (construction, agriculture, logistics, retail/pop-up, mining, humanitarian) each linking to relevant type/size pages. |
| `/reviews` | `reviews.tsx` | All published reviews from `supportQuery`, star rating display, featured first, avatar/company/country. |
| `/faq` | `faq.tsx` | Accordion grouped by `faqs.category`, plus FAQPage JSON-LD. |
| `/contact` | `contact.tsx` | Contact details from `site_settings`, plus a FormSubmit form (name, email, phone, company, country, subject, message) reusing the same AJAX pattern as `/checkout`, success toast + inline confirmation. |
| `/blog` | `blog.index.tsx` | Post list from `postsQuery`: featured image, category, date, excerpt; optional category filter via search param. |
| `/blog/$slug` | `blog.$slug.tsx` | Article layout, prose styling, author/date, Article + BreadcrumbList JSON-LD, related posts. `notFound()` on miss. |
| `/search` | `search.tsx` | `?q=` search param; client-side filter across catalog + types + sizes + FAQs + posts (all already loaded via existing queries); grouped result sections; empty state. |
| `/privacy-policy`, `/terms`, `/shipping-policy` | three route files | Plain-language legal copy, `robots: index`, last-updated line. |
| `/$` catch-all | `$.tsx` | "Container Not Found" 404 with search box and links to catalog. |
| `/sitemap.xml` | `sitemap[.]xml.ts` | Server route (`server.handlers.GET`) building XML from `fetchSitemapEntries()` (already implemented) plus all static paths; `Content-Type: application/xml`. |
| `robots.txt` | `public/robots.txt` | Update to allow all, disallow `/admin` and `/enquiry-received`, reference the sitemap URL. |

Also: add these links into `site-header.tsx` nav (types/sizes dropdowns already fed by chrome query) and `site-footer.tsx` columns.

## 4. Admin dashboard

Route tree (all under the auth gate):

```text
src/routes/_authenticated/route.tsx        gate (managed, ssr:false)
src/routes/_authenticated/admin.tsx        admin shell: sidebar + <Outlet />
  admin.index.tsx        dashboard overview
  admin.products.index.tsx / admin.products.$id.tsx / admin.products.new.tsx
  admin.categories.tsx   admin.types.tsx   admin.sizes.tsx
  admin.regions.tsx      admin.faqs.tsx    admin.reviews.tsx
  admin.blog.index.tsx   admin.blog.$id.tsx
  admin.media.tsx        admin.videos.tsx
  admin.settings.tsx     admin.home.tsx
src/routes/auth.tsx                        public email+password sign-in, no signup
```

Every authenticated account is an admin — no roles table, no role checks (explicit product decision).

Shell: fixed sidebar (Dashboard, Products, Taxonomy group, Content group, Media, Settings), top bar with site name, "View site" link, sign-out button (`supabase.auth.signOut()` then navigate to `/auth`).

Panels:
- **Overview** — stat cards: products total/published/unpublished/featured, reviews, media items, videos, blog posts; recent products list; quick-create buttons.
- **Products list** — table with thumbnail, name, SKU, type, size, condition, price, published/featured badges; text search, filters by type/size/condition/published; row actions Edit, Duplicate, Toggle published, Delete (AlertDialog confirm).
- **Product editor** — tabs: *Details* (name, auto-slug with manual override, SKU, category/type/size selects, condition, availability, quantity, year, short + long description, features and applications as tag inputs, delivery info, notes); *Pricing* (price, currency, `price_mode` fixed/from/quote/hidden, on-sale flag); *Media* (multi-upload to `product-images` bucket, set primary, drag reorder, alt text, delete); *Specs* (repeatable label/value rows with order); *Flags* (published, featured, popular, new arrival, sort order); *SEO* (seo_title, seo_description, focus_keyword, og_image_url with live snippet preview). Save via one upsert server fn plus child-row sync fns.
- **Categories / Types / Sizes / Regions** — list + drawer form for their columns (see schema below), publish toggle, sort order, image upload, SEO fields, delete with confirm.
- **FAQs** — question, answer, category, sort order, published; inline reorder.
- **Reviews** — customer name, company, country, avatar upload, rating 1-5, body, review date, published/featured/is_demo, sort order.
- **Blog** — list + editor: title, auto-slug, excerpt, markdown/rich content, featured image, author, category, tags, published, published_at, seo_title, seo_description.
- **Media library** — grid of `media` rows, upload to `media` bucket, filename/type/alt text/description, copy URL, delete.
- **Videos** — upload to `videos` bucket or paste URL, poster image, title, description, placement, enabled, homepage_featured, sort order.
- **Site settings** — single row id=1: company name, email, phone, address, business hours, logo, favicon, currency, default SEO title/description/social image, footer text, social links JSON editor.
- **Homepage content** — single row id=1: hero heading/subheading/CTA labels/hero image, shipping + CTA + about images, benefits array editor (icon, title, text), shipping heading/body, video heading/body.

## 5. Server functions to add (`src/lib/admin.functions.ts`)

All `.middleware([requireSupabaseAuth])`, all input-validated with zod:
`upsertProduct`, `deleteProduct`, `duplicateProduct`, `setProductPublished`,
`saveProductSpecs`, `saveProductImages`, `deleteProductImage`,
`upsertCategory`/`deleteCategory`, `upsertType`/`deleteType`, `upsertSize`/`deleteSize`,
`upsertRegion`/`deleteRegion`, `upsertFaq`/`deleteFaq`, `upsertReview`/`deleteReview`,
`upsertPost`/`deletePost`, `upsertMedia`/`deleteMedia`, `upsertVideo`/`deleteVideo`,
`updateSiteSettings`, `updateHomeContent`, plus `getAdminStats` and admin list fetchers
that read unpublished rows too. Mutations use `useMutation` + `queryClient.invalidateQueries`
and a sonner toast. File uploads go through the browser client
(`supabase.storage.from(bucket).upload(...)`) then persist the public URL via a server fn.

## 6. Database work still required

Schema is otherwise final; only two changes:

1. Storage RLS on `storage.objects` (migration): public SELECT for buckets `product-images`, `media`, `videos`; INSERT/UPDATE/DELETE restricted to `authenticated`. Buckets must be flipped to public read via the bucket-update tool (not SQL).
2. Optional indexes for catalog filters: `products(published, sort_order)`, `products(type_id)`, `products(size_id)`, `products(condition)`, `blog_posts(published, published_at desc)`, and unique indexes on every `slug` column that lacks one.

Column reference for the editors (domain fields only):
- `products`: slug, name, sku, category_id, type_id, size_id, condition, availability, price, currency, price_mode, quantity_available, year_manufactured, short_description, description, features[], applications[], delivery_info, notes, published, featured, popular, is_new_arrival, on_sale, sort_order, seo_title, seo_description, focus_keyword, og_image_url
- `product_images`: product_id, url, alt_text, is_primary, sort_order
- `product_specs`: product_id, label, value, sort_order
- `categories`: slug, name, short_description, description, image_url, sort_order, published, seo_title, seo_description
- `container_types`: + typical_uses[], characteristics[], available_sizes[]
- `container_sizes`: + external/internal/door dimensions, capacity, tare_weight, max_gross_weight, payload, typical_applications[]
- `reviews`: customer_name, company, country, avatar_url, rating, body, review_date, published, featured, is_demo, sort_order
- `faqs`: question, answer, category, sort_order, published
- `shipping_regions`: name, slug, description, notes, sort_order, published
- `blog_posts`: slug, title, excerpt, content, featured_image_url, author, category, tags[], published, published_at, seo_title, seo_description
- `media`: file_name, url, media_type, alt_text, description
- `videos`: title, description, video_url, poster_url, placement, enabled, homepage_featured, sort_order
- `site_settings` / `home_content`: single row, id = 1

## 7. Auth setup

Enable email+password sign-in with signups disabled; add Google as a provider through the platform's social-auth configuration in the same change as the sign-in button (`lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin })`). `/auth` is a public route; after a session exists, redirect to `/admin`.

## 8. Final pass

Sitemap + robots verified, JSON-LD on product/FAQ/article/breadcrumb pages, unique metadata on every route, alt text and lazy loading on images, keyboard-accessible menus and dialogs, mobile layout check at 375/768/1280, build clean.

## 9. Suggested order

1. Storage policies + indexes migration
2. Type/size/new/used pages
3. Content pages (about, shipping, how it works, industries, reviews, FAQ, contact)
4. Blog index + post, search, legal pages, 404
5. Auth route + admin shell + overview
6. Products CRUD (largest panel), then taxonomy, content, media/videos, settings, homepage
7. Sitemap, robots, SEO/accessibility/responsive pass
