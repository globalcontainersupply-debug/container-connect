# Global Container Supply — Full Website + Admin CMS

A complete, database-driven shipping container sales site with a public storefront, enquiry cart, and a protected admin dashboard. Every admin account created in the Cloud auth panel is automatically an admin — no public signup, no role table.

## Brand & design direction

Deep navy base, steel grays, white, restrained orange accent. Industrial-premium: large container photography, layered gradients, clean spec tables, strong typography, restrained motion. Generated hero/section imagery for containers, ports, yards, world-shipping, industries, and avatars.

## Public pages

- Home — hero, featured products, container categories, sizes, why-choose-us, global shipping, how it works, video section, reviews, FAQ teaser, quote CTA
- /containers (catalog with search, filters by type/size/condition/availability/price, sorting, grid + list, pagination)
- /containers/$slug (gallery with lightbox + swipe, full spec table, rich description, breadcrumbs, related products, quote CTA)
- /container-types, /container-types/$slug
- /container-sizes, /container-sizes/$slug
- /new-containers, /used-containers
- /about-us, /worldwide-shipping, /how-it-works, /industries
- /reviews, /faq, /contact
- /blog, /blog/$slug
- /cart, /checkout, /enquiry-received
- /privacy-policy, /terms, /shipping-policy
- /search (global search across products, types, sizes, FAQs, articles)
- 404 "Container Not Found"

## Cart & enquiry

Cart in React context + localStorage, header counter, quantity edits, empty state. Checkout collects name, company, email, phone, country, city, delivery location, preferred contact, message, and auto-attaches cart lines (name, SKU, qty). Submission goes to FormSubmit addressed to info@globalcontainersupply.com with a formatted subject, structured body, and a generated enquiry reference (e.g. GCS-ENQ-8F3K2). No enquiry records are stored in the database; the admin Enquiries area is omitted per your choice. Success page shows the reference and next-step buttons. Contact page uses the same FormSubmit destination.

## Admin dashboard (/admin)

- /admin/login — email + password against Cloud auth; no signup UI. Any authenticated account is an admin.
- Dashboard overview: product counts (total/published/unpublished/featured), reviews, media, videos, blog posts
- Products: full CRUD, duplicate, publish toggle, featured/popular/new/sale flags, availability, price mode (fixed / from / on request / hidden), currency, SKU, category, type, size, condition, specs, rich description, per-product SEO overrides
- Product images: multi-upload to Cloud storage, primary selection, drag reorder, alt text, delete
- Categories, Container Types, Sizes, Shipping Regions, FAQs, Reviews, Blog posts: CRUD with publish toggles
- Media library: images and videos with metadata (filename, type, upload date, alt text, description)
- Videos: upload, poster image, title/description, placement, enable, homepage-featured flag
- Site settings: company name, email, phone, address, hours, social links, logo, favicon, currency, default SEO title/description/social image, footer text
- Homepage content: hero heading/subtext/CTA/background, benefits list, section copy

Destructive actions require confirmation dialogs.

## SEO

Per-route `head()` with unique titles, descriptions, OG/Twitter tags, self-referencing canonicals; product/category/type/size pages generate metadata from their data with admin override. JSON-LD: Organization + WebSite sitewide, Product on product pages, BreadcrumbList on deep pages, FAQPage on the FAQ page, Article on blog posts. Breadcrumbs, internal linking between products/types/sizes, dynamic `/sitemap.xml` server route covering all routes and published rows, `robots.txt`, semantic headings, alt text, lazy loading, responsive images.

## Data & backend

Lovable Cloud (Postgres + auth + storage). Tables: `categories`, `container_types`, `container_sizes`, `products`, `product_images`, `product_specs`, `reviews`, `faqs`, `shipping_regions`, `blog_posts`, `media`, `videos`, `site_settings`, `home_content`. Public read via anon SELECT policies restricted to published rows; all writes require an authenticated session. Storage buckets for product images, media, and videos — public read, authenticated write.

Seeded via migration with clearly labelled demo content: ~24 products across standard dry, high cube, reefer, open top, flat rack, tank, and specialized types in 10/20/40/40HC sizes with new/used conditions, plus categories, types, sizes, ~15 reviews, ~14 FAQs, shipping regions, 6 blog posts, and default settings. No fabricated certifications, statistics, years in business, or verified-customer badges.

## Technical notes

- TanStack Start file routes; loaders use `ensureQueryData` + `useSuspenseQuery`
- Admin routes live under an `_authenticated` layout that redirects to `/admin/login`
- Writes go through `createServerFn` with `requireSupabaseAuth`; no role check, since every auth account is an admin
- Design tokens (navy/steel/orange) defined in `src/styles.css`; no hardcoded color utilities
- Prices display in USD by default, configurable in site settings

## Build order

1. Cloud + schema + seed migration + storage buckets
2. Design system, layout shell, header/footer, home page
3. Catalog, product detail, type/size/condition pages
4. Cart, checkout with FormSubmit, success page
5. Content pages, reviews, FAQ, contact, blog, legal
6. Admin auth + full dashboard CRUD
7. SEO layer, sitemap, structured data, accessibility and responsive pass
