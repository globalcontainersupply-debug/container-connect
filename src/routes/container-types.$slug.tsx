import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { catalogQuery, taxonomyQuery } from "@/lib/queries";
import { pageMeta, breadcrumbLd, jsonLd } from "@/lib/seo";
import { SITE } from "@/lib/site";
import { ProductCard } from "@/components/site/product-card";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/container-types/$slug")({
  loader: async ({ context, params }) => {
    const [taxonomy] = await Promise.all([
      context.queryClient.ensureQueryData(taxonomyQuery),
      context.queryClient.ensureQueryData(catalogQuery),
    ]);
    const type = taxonomy.types.find((t) => t.slug === params.slug);
    if (!type) throw notFound();
    return type;
  },
  head: ({ loaderData, params }) => {
    if (!loaderData) {
      return {
        meta: [{ title: `Container type not found | ${SITE.name}` }, { name: "robots", content: "noindex" }],
      };
    }
    const type = loaderData;
    return {
      ...pageMeta({
        title: type.seo_title ?? type.name,
        description:
          type.seo_description ??
          type.short_description ??
          `${type.name} shipping containers available from ${SITE.name} with worldwide delivery.`,
        path: `/container-types/${params.slug}`,
      }),
      scripts: [
        jsonLd(
          breadcrumbLd([
            { name: "Home", path: "/" },
            { name: "Container Types", path: "/container-types" },
            { name: type.name, path: `/container-types/${params.slug}` },
          ]),
        ),
      ],
    };
  },
  component: ContainerTypePage,
});

function ContainerTypePage() {
  const { slug } = Route.useParams();
  const { data: taxonomy } = useSuspenseQuery(taxonomyQuery);
  const { data: catalog } = useSuspenseQuery(catalogQuery);
  const type = taxonomy.types.find((t) => t.slug === slug);
  if (!type) return null;

  const products = catalog.products.filter((p) => p.type_id === type.id);
  const matchedSizes = taxonomy.sizes.filter((s) => type.available_sizes.includes(s.slug));

  return (
    <div className="bg-background">
      <div className="border-b border-border bg-secondary/40">
        <nav aria-label="Breadcrumb" className="container-page py-3 text-xs text-muted-foreground">
          <ol className="flex flex-wrap items-center gap-2">
            <li>
              <Link to="/" className="hover:text-foreground">
                Home
              </Link>
            </li>
            <li aria-hidden>/</li>
            <li>
              <Link to="/container-types" className="hover:text-foreground">
                Container Types
              </Link>
            </li>
            <li aria-hidden>/</li>
            <li className="text-foreground">{type.name}</li>
          </ol>
        </nav>
      </div>

      <div className="container-page grid gap-10 py-10 lg:grid-cols-2">
        <div className="overflow-hidden rounded-sm border border-border bg-muted">
          {type.image_url ? (
            <img src={type.image_url} alt={type.name} className="aspect-[4/3] w-full object-cover" />
          ) : (
            <div className="aspect-[4/3] w-full" />
          )}
        </div>
        <div>
          <h1 className="font-display text-4xl font-bold uppercase leading-tight">{type.name}</h1>
          {type.short_description ? (
            <p className="mt-3 text-muted-foreground">{type.short_description}</p>
          ) : null}
          {type.description ? (
            <div className="mt-5 space-y-3 text-sm leading-relaxed text-muted-foreground">
              {type.description.split("\n\n").map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>
          ) : null}
          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link to="/contact">Request a quote</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/containers" search={{ type: type.slug }}>
                View {type.name} stock
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="container-page grid gap-10 pb-14 lg:grid-cols-2">
        {type.characteristics.length ? (
          <section>
            <h2 className="font-display text-2xl font-bold uppercase">Characteristics</h2>
            <ul className="mt-3 grid gap-2">
              {type.characteristics.map((c) => (
                <li key={c} className="flex gap-2 text-sm text-muted-foreground">
                  <span className="text-primary">▪</span>
                  {c}
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {type.typical_uses.length ? (
          <section>
            <h2 className="font-display text-2xl font-bold uppercase">Typical uses</h2>
            <ul className="mt-3 flex flex-wrap gap-2">
              {type.typical_uses.map((use) => (
                <li key={use} className="rounded-sm bg-secondary px-3 py-1 text-xs uppercase tracking-wide">
                  {use}
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </div>

      {matchedSizes.length ? (
        <section className="border-t border-border bg-surface py-14">
          <div className="container-page">
            <h2 className="font-display text-2xl font-bold uppercase">Available sizes</h2>
            <div className="mt-6 flex flex-wrap gap-3">
              {matchedSizes.map((s) => (
                <Link
                  key={s.id}
                  to="/container-sizes/$slug"
                  params={{ slug: s.slug }}
                  className="rounded-sm border border-border bg-card px-4 py-2 text-sm font-semibold uppercase tracking-wide transition-colors hover:border-primary hover:text-primary"
                >
                  {s.name}
                </Link>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {products.length ? (
        <section className="border-t border-border py-14">
          <div className="container-page">
            <h2 className="font-display text-2xl font-bold uppercase">
              {type.name} containers in stock
            </h2>
            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </div>
  );
}
