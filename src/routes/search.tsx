import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useMemo, useState, type FormEvent } from "react";
import { catalogQuery, postsQuery, supportQuery, taxonomyQuery } from "@/lib/queries";
import { pageMeta } from "@/lib/seo";
import { ProductCard } from "@/components/site/product-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type SearchParams = { q?: string };

export const Route = createFileRoute("/search")({
  validateSearch: (search: Record<string, unknown>): SearchParams => ({
    q: typeof search.q === "string" && search.q ? search.q : undefined,
  }),
  head: () =>
    pageMeta({
      title: "Search",
      description: "Search containers, types, sizes, FAQs and articles.",
      path: "/search",
    }),
  loader: ({ context }) =>
    Promise.all([
      context.queryClient.ensureQueryData(catalogQuery),
      context.queryClient.ensureQueryData(taxonomyQuery),
      context.queryClient.ensureQueryData(supportQuery),
      context.queryClient.ensureQueryData(postsQuery),
    ]),
  component: SearchPage,
});

function SearchPage() {
  const { q } = Route.useSearch();
  const navigate = useNavigate({ from: "/search" });
  const [term, setTerm] = useState(q ?? "");
  const { data: catalog } = useSuspenseQuery(catalogQuery);
  const { data: taxonomy } = useSuspenseQuery(taxonomyQuery);
  const { data: support } = useSuspenseQuery(supportQuery);
  const { data: posts } = useSuspenseQuery(postsQuery);

  const results = useMemo(() => {
    const term = (q ?? "").trim().toLowerCase();
    if (!term) return null;
    const match = (...values: (string | null | undefined)[]) =>
      values.some((v) => v?.toLowerCase().includes(term));

    return {
      products: catalog.products.filter((p) => match(p.name, p.short_description)),
      types: taxonomy.types.filter((t) => match(t.name, t.short_description)),
      sizes: taxonomy.sizes.filter((s) => match(s.name, s.short_description)),
      faqs: support.faqs.filter((f) => match(f.question, f.answer)),
      posts: posts.filter((p) => match(p.title, p.excerpt)),
    };
  }, [q, catalog, taxonomy, support, posts]);

  const totalResults = results
    ? results.products.length +
      results.types.length +
      results.sizes.length +
      results.faqs.length +
      results.posts.length
    : 0;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    navigate({ search: { q: term.trim() || undefined } });
  }

  return (
    <div className="container-page py-14">
      <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground">
        <Link to="/" className="hover:text-primary">
          Home
        </Link>
        <span className="px-2">/</span>
        <span className="text-foreground">Search</span>
      </nav>
      <h1 className="mt-4 font-display text-4xl font-bold uppercase md:text-5xl">Search</h1>

      <form onSubmit={handleSubmit} className="mt-6 flex max-w-xl gap-2" role="search">
        <Input
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          placeholder="Search containers, sizes, types, FAQs…"
          aria-label="Search"
        />
        <Button type="submit">Search</Button>
      </form>

      {!results ? (
        <p className="mt-10 text-muted-foreground">Enter a search term to get started.</p>
      ) : totalResults === 0 ? (
        <p className="mt-10 rounded-sm border border-dashed border-border p-10 text-center text-muted-foreground">
          No results for "{q}". Try a different term or{" "}
          <Link to="/containers" className="text-primary underline">
            browse the full catalogue
          </Link>
          .
        </p>
      ) : (
        <div className="mt-10 space-y-12">
          {results.products.length ? (
            <section>
              <h2 className="font-display text-2xl font-bold uppercase">
                Containers ({results.products.length})
              </h2>
              <div className="mt-5 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {results.products.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            </section>
          ) : null}

          {results.types.length ? (
            <section>
              <h2 className="font-display text-2xl font-bold uppercase">
                Container types ({results.types.length})
              </h2>
              <ul className="mt-4 flex flex-wrap gap-3">
                {results.types.map((t) => (
                  <li key={t.id}>
                    <Link
                      to="/container-types/$slug"
                      params={{ slug: t.slug }}
                      className="rounded-sm border border-border bg-card px-4 py-2 text-sm font-semibold uppercase tracking-wide hover:border-primary hover:text-primary"
                    >
                      {t.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {results.sizes.length ? (
            <section>
              <h2 className="font-display text-2xl font-bold uppercase">
                Container sizes ({results.sizes.length})
              </h2>
              <ul className="mt-4 flex flex-wrap gap-3">
                {results.sizes.map((s) => (
                  <li key={s.id}>
                    <Link
                      to="/container-sizes/$slug"
                      params={{ slug: s.slug }}
                      className="rounded-sm border border-border bg-card px-4 py-2 text-sm font-semibold uppercase tracking-wide hover:border-primary hover:text-primary"
                    >
                      {s.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {results.faqs.length ? (
            <section>
              <h2 className="font-display text-2xl font-bold uppercase">
                FAQs ({results.faqs.length})
              </h2>
              <ul className="mt-4 space-y-3">
                {results.faqs.map((f) => (
                  <li key={f.id} className="rounded-sm border border-border bg-card p-4">
                    <p className="font-semibold">{f.question}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{f.answer}</p>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {results.posts.length ? (
            <section>
              <h2 className="font-display text-2xl font-bold uppercase">
                Articles ({results.posts.length})
              </h2>
              <div className="mt-5 grid gap-6 md:grid-cols-3">
                {results.posts.map((p) => (
                  <Link
                    key={p.slug}
                    to="/blog/$slug"
                    params={{ slug: p.slug }}
                    className="rounded-sm border border-border bg-card p-5 hover:border-primary"
                  >
                    <h3 className="font-display text-lg font-semibold uppercase leading-tight">
                      {p.title}
                    </h3>
                    {p.excerpt ? (
                      <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{p.excerpt}</p>
                    ) : null}
                  </Link>
                ))}
              </div>
            </section>
          ) : null}
        </div>
      )}
    </div>
  );
}
