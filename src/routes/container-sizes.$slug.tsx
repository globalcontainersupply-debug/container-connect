import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { catalogQuery, taxonomyQuery } from "@/lib/queries";
import { pageMeta, breadcrumbLd, jsonLd } from "@/lib/seo";
import { SITE } from "@/lib/site";
import { ProductCard } from "@/components/site/product-card";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/container-sizes/$slug")({
  loader: async ({ context, params }) => {
    const [taxonomy] = await Promise.all([
      context.queryClient.ensureQueryData(taxonomyQuery),
      context.queryClient.ensureQueryData(catalogQuery),
    ]);
    const size = taxonomy.sizes.find((s) => s.slug === params.slug);
    if (!size) throw notFound();
    return size;
  },
  head: ({ loaderData, params }) => {
    if (!loaderData) {
      return {
        meta: [{ title: `Container size not found | ${SITE.name}` }, { name: "robots", content: "noindex" }],
      };
    }
    const size = loaderData;
    return {
      ...pageMeta({
        title: size.seo_title ?? size.name,
        description:
          size.seo_description ??
          size.short_description ??
          `${size.name} shipping container specifications and availability from ${SITE.name}.`,
        path: `/container-sizes/${params.slug}`,
      }),
      scripts: [
        jsonLd(
          breadcrumbLd([
            { name: "Home", path: "/" },
            { name: "Container Sizes", path: "/container-sizes" },
            { name: size.name, path: `/container-sizes/${params.slug}` },
          ]),
        ),
      ],
    };
  },
  component: ContainerSizePage,
});

function ContainerSizePage() {
  const { slug } = Route.useParams();
  const { data: taxonomy } = useSuspenseQuery(taxonomyQuery);
  const { data: catalog } = useSuspenseQuery(catalogQuery);
  const size = taxonomy.sizes.find((s) => s.slug === slug);
  if (!size) return null;

  const products = catalog.products.filter((p) => p.size_id === size.id);
  const specRows: [string, string | null][] = [
    ["External dimensions", size.external_dimensions],
    ["Internal dimensions", size.internal_dimensions],
    ["Door dimensions", size.door_dimensions],
    ["Capacity", size.capacity],
    ["Tare weight", size.tare_weight],
    ["Max gross weight", size.max_gross_weight],
    ["Payload", size.payload],
  ].filter(([, value]) => value) as [string, string][];

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
              <Link to="/container-sizes" className="hover:text-foreground">
                Container Sizes
              </Link>
            </li>
            <li aria-hidden>/</li>
            <li className="text-foreground">{size.name}</li>
          </ol>
        </nav>
      </div>

      <div className="container-page grid gap-10 py-10 lg:grid-cols-2">
        <div className="overflow-hidden rounded-sm border border-border bg-muted">
          {size.image_url ? (
            <img src={size.image_url} alt={size.name} className="aspect-[4/3] w-full object-cover" />
          ) : (
            <div className="aspect-[4/3] w-full" />
          )}
        </div>
        <div>
          <h1 className="font-display text-4xl font-bold uppercase leading-tight">{size.name}</h1>
          {size.short_description ? (
            <p className="mt-3 text-muted-foreground">{size.short_description}</p>
          ) : null}
          {size.description ? (
            <div className="mt-5 space-y-3 text-sm leading-relaxed text-muted-foreground">
              {size.description.split("\n\n").map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>
          ) : null}
          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link to="/contact">Request a quote</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/containers" search={{ size: size.slug }}>
                View {size.name} stock
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="container-page grid gap-10 pb-14 lg:grid-cols-3">
        {specRows.length ? (
          <section className="lg:col-span-2">
            <h2 className="font-display text-2xl font-bold uppercase">Specifications</h2>
            <table className="mt-3 w-full border border-border text-sm">
              <tbody>
                {specRows.map(([label, value]) => (
                  <tr key={label} className="border-b border-border last:border-0">
                    <th scope="row" className="w-1/2 bg-secondary/40 px-3 py-2 text-left font-medium">
                      {label}
                    </th>
                    <td className="px-3 py-2 text-muted-foreground">{value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        ) : null}

        {size.typical_applications.length ? (
          <section>
            <h2 className="font-display text-2xl font-bold uppercase">Typical applications</h2>
            <ul className="mt-3 flex flex-wrap gap-2">
              {size.typical_applications.map((a) => (
                <li key={a} className="rounded-sm bg-secondary px-3 py-1 text-xs uppercase tracking-wide">
                  {a}
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </div>

      {products.length ? (
        <section className="border-t border-border py-14">
          <div className="container-page">
            <h2 className="font-display text-2xl font-bold uppercase">
              {size.name} containers in stock
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
