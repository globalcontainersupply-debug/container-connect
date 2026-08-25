import { createServerFn } from "@tanstack/react-start";

export const getSiteChrome = createServerFn({ method: "GET" }).handler(async () => {
  const { fetchSiteChrome } = await import("./catalog-data.server");
  return fetchSiteChrome();
});

export const getHome = createServerFn({ method: "GET" }).handler(async () => {
  const { fetchHome } = await import("./catalog-data.server");
  return fetchHome();
});

export const getCatalog = createServerFn({ method: "GET" }).handler(async () => {
  const { fetchCatalog } = await import("./catalog-data.server");
  return fetchCatalog();
});

export const getProduct = createServerFn({ method: "GET" })
  .inputValidator((data: { slug: string }) => data)
  .handler(async ({ data }) => {
    const { fetchProduct } = await import("./catalog-data.server");
    return fetchProduct(data.slug);
  });

export const getTaxonomy = createServerFn({ method: "GET" }).handler(async () => {
  const { fetchTaxonomy } = await import("./catalog-data.server");
  return fetchTaxonomy();
});

export const getSupportContent = createServerFn({ method: "GET" }).handler(async () => {
  const { fetchSupportContent } = await import("./catalog-data.server");
  return fetchSupportContent();
});

export const getPosts = createServerFn({ method: "GET" }).handler(async () => {
  const { fetchPosts } = await import("./catalog-data.server");
  return fetchPosts();
});

export const getPost = createServerFn({ method: "GET" })
  .inputValidator((data: { slug: string }) => data)
  .handler(async ({ data }) => {
    const { fetchPost } = await import("./catalog-data.server");
    return fetchPost(data.slug);
  });
