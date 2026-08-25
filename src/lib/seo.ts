import { SITE } from "./site";

export const SITE_URL = `https://${SITE.domain}`;

type MetaInput = {
  title: string;
  description: string;
  path?: string;
  image?: string;
  type?: string;
};

export function pageMeta({ title, description, path, image, type = "website" }: MetaInput) {
  const fullTitle = title.includes(SITE.name) ? title : `${title} | ${SITE.name}`;
  const meta: Array<Record<string, string>> = [
    { title: fullTitle },
    { name: "description", content: description },
    { property: "og:title", content: fullTitle },
    { property: "og:description", content: description },
    { property: "og:type", content: type },
    { property: "og:site_name", content: SITE.name },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: fullTitle },
    { name: "twitter:description", content: description },
  ];
  if (image) {
    meta.push({ property: "og:image", content: image });
    meta.push({ name: "twitter:image", content: image });
  }
  const links = path ? [{ rel: "canonical", href: `${SITE_URL}${path}` }] : [];
  return { meta, links };
}

export function jsonLd(data: unknown) {
  return {
    type: "application/ld+json",
    children: JSON.stringify(data),
  };
}

export function breadcrumbLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${SITE_URL}${item.path}`,
    })),
  };
}
