import { queryOptions } from "@tanstack/react-query";
import {
  getCatalog,
  getHome,
  getPost,
  getPosts,
  getProduct,
  getSiteChrome,
  getSupportContent,
  getTaxonomy,
} from "./catalog.functions";

export const siteChromeQuery = queryOptions({
  queryKey: ["site-chrome"],
  queryFn: () => getSiteChrome(),
  staleTime: 5 * 60 * 1000,
});

export const homeQuery = queryOptions({
  queryKey: ["home"],
  queryFn: () => getHome(),
});

export const catalogQuery = queryOptions({
  queryKey: ["catalog"],
  queryFn: () => getCatalog(),
});

export const taxonomyQuery = queryOptions({
  queryKey: ["taxonomy"],
  queryFn: () => getTaxonomy(),
});

export const supportQuery = queryOptions({
  queryKey: ["support"],
  queryFn: () => getSupportContent(),
});

export const postsQuery = queryOptions({
  queryKey: ["posts"],
  queryFn: () => getPosts(),
});

export const productQuery = (slug: string) =>
  queryOptions({
    queryKey: ["product", slug],
    queryFn: () => getProduct({ data: { slug } }),
  });

export const postQuery = (slug: string) =>
  queryOptions({
    queryKey: ["post", slug],
    queryFn: () => getPost({ data: { slug } }),
  });
