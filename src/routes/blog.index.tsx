import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { postsQuery } from "@/lib/queries";
import { pageMeta } from "@/lib/seo";
import { formatDate } from "@/lib/site";
import { Button } from "@/components/ui/button";

type BlogSearch = { category?: string | undefined };

export const Route = createFileRoute("/blog/")({
  validateSearch: (search: Record<string, unknown>): BlogSearch => ({
    category:
      typeof search["category"] === "string" && search["category"]
        ? search["category"]
        : undefined,
  }),
  head: () =>
    pageMeta({
      title: "Blog",
      description: "News, guides and insights on shipping containers, freight and worldwide delivery.",
      path: "/blog",
    }),
  loader: ({ context }) => context.queryClient.ensureQueryData(postsQuery),
  component: BlogIndexPage,
});

function BlogIndexPage() {
  const { data: posts } = useSuspenseQuery(postsQuery);
  const search = Route.useSearch();
  const navigate = useNavigate({ from: "/blog/" });

  const categories = useMemo(
    () => Array.from(new Set(posts.map((p) => p.category).filter((c): c is string => Boolean(c)))),
    [posts],
  );
  const filtered = search.category ? posts.filter((p) => p.category === search.category) : posts;

  return (
    <div className="bg-background">
      <div className="border-b border-border bg-secondary/40">
        <nav aria-label="Breadcrumb" className="container-page py-3 text-sm text-muted-foreground">
          <Link to="/" className="hover:text-primary">
            Home
          </Link>
          <span className="px-2">/</span>
          <span className="text-foreground">Blog</span>
        </nav>
      </div>

      <section className="container-page py-14">
        <p className="eyebrow text-primary">Insights</p>
        <h1 className="mt-2 font-display text-4xl font-bold uppercase md:text-5xl">Blog</h1>

        {categories.length ? (
          <div className="mt-6 flex flex-wrap gap-2">
            <Button
              variant={!search.category ? "default" : "outline"}
              size="sm"
              onClick={() => navigate({ search: {} })}
            >
              All
            </Button>
            {categories.map((c) => (
              <Button
                key={c}
                variant={search.category === c ? "default" : "outline"}
                size="sm"
                onClick={() => navigate({ search: { category: c } })}
              >
                {c}
              </Button>
            ))}
          </div>
        ) : null}

        {filtered.length ? (
          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((p) => (
              <Link
                key={p.slug}
                to="/blog/$slug"
                params={{ slug: p.slug }}
                className="group overflow-hidden rounded-sm border border-border bg-card"
              >
                {p.featured_image_url ? (
                  <img
                    src={p.featured_image_url}
                    alt={p.title}
                    loading="lazy"
                    className="aspect-[16/9] w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : null}
                <div className="p-5">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    {[p.category, formatDate(p.published_at)].filter(Boolean).join(" · ")}
                  </p>
                  <h2 className="mt-2 font-display text-lg font-semibold uppercase leading-tight">
                    {p.title}
                  </h2>
                  {p.excerpt ? (
                    <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{p.excerpt}</p>
                  ) : null}
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="mt-10 text-muted-foreground">No articles published yet.</p>
        )}
      </section>
    </div>
  );
}
