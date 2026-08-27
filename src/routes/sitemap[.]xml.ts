import { createFileRoute } from "@tanstack/react-router";
import { SITE_URL } from "@/lib/seo";

const staticPaths = [
  "/",
  "/containers",
  "/container-types",
  "/container-sizes",
  "/new-containers",
  "/used-containers",
  "/about-us",
  "/worldwide-shipping",
  "/how-it-works",
  "/industries",
  "/reviews",
  "/faq",
  "/contact",
  "/blog",
  "/privacy-policy",
  "/terms",
  "/shipping-policy",
];

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const { fetchSitemapEntries } = await import("@/lib/catalog-data.server");
        const entries = await fetchSitemapEntries();

        const urls = [
          ...staticPaths,
          ...entries.products.map((slug) => `/containers/${slug}`),
          ...entries.types.map((slug) => `/container-types/${slug}`),
          ...entries.sizes.map((slug) => `/container-sizes/${slug}`),
          ...entries.posts.map((slug) => `/blog/${slug}`),
        ];

        const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((path) => `  <url><loc>${SITE_URL}${path}</loc></url>`).join("\n")}
</urlset>`;

        return new Response(body, {
          headers: { "Content-Type": "application/xml" },
        });
      },
    },
  },
});
