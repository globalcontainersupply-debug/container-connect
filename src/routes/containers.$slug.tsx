import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { productQuery } from "@/lib/queries";
import { pageMeta, breadcrumbLd, SITE_URL, jsonLd } from "@/lib/seo";
import { conditionLabel, formatPrice, SITE } from "@/lib/site";
import { useCart } from "@/context/cart";
import { ProductCard } from "@/components/site/product-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent } from "@/components/ui/dialog";

export const Route = createFileRoute("/containers/$slug")({
  loader: async ({ context, params }) => {
    const data = await context.queryClient.ensureQueryData(productQuery(params.slug));
    if (!data) throw notFound();
    return data;
  },
  head: ({ loaderData, params }) => {
    if (!loaderData) {
      return {
        meta: [{ title: `Container not found | ${SITE.name}` }, { name: "robots", content: "noindex" }],
      };
    }
    const p = loaderData.product;
    const image = loaderData.images[0]?.url;
    const base = pageMeta({
      title: p.seo_title ?? p.name,
      description:
        p.seo_description ??
        p.short_description ??
        `${p.name} available from ${SITE.name} with worldwide delivery.`,
      path: `/containers/${params.slug}`,
      image: image ? `${SITE_URL}${image}` : undefined,
      type: "product",
    });
    return {
      ...base,
      scripts: [
        jsonLd({
          "@context": "https://schema.org",
          "@type": "Product",
          name: p.name,
          description: p.short_description ?? p.description ?? p.name,
          sku: p.sku ?? undefined,
          image: image ? [`${SITE_URL}${image}`] : undefined,
          brand: { "@type": "Brand", name: SITE.name },
          offers: {
            "@type": "Offer",
            priceCurrency: p.currency,
            price: p.price_mode === "quote" || p.price == null ? undefined : p.price,
            availability:
              p.availability === "in_stock"
                ? "https://schema.org/InStock"
                : "https://schema.org/PreOrder",
            url: `${SITE_URL}/containers/${params.slug}`,
          },
        }),
        jsonLd(
          breadcrumbLd([
            { name: "Home", path: "/" },
            { name: "Containers", path: "/containers" },
            { name: p.name, path: `/containers/${params.slug}` },
          ]),
        ),
      ],
    };
  },
  component: ProductPage,
});

function ProductPage() {
  const { slug } = Route.useParams();
  const { data } = useSuspenseQuery(productQuery(slug));
  const { addItem } = useCart();
  const [active, setActive] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const [qty, setQty] = useState(1);

  if (!data) return null;
  const { product, images, specs, type, size, category, related } = data;
  const gallery = images.length ? images : [];

  return (
    <div className="bg-background">
      <div className="border-b border-border bg-secondary/40">
        <nav aria-label="Breadcrumb" className="container mx-auto px-4 py-3 text-xs text-muted-foreground">
          <ol className="flex flex-wrap items-center gap-2">
            <li><Link to="/" className="hover:text-foreground">Home</Link></li>
            <li aria-hidden>/</li>
            <li><Link to="/containers" className="hover:text-foreground">Containers</Link></li>
            <li aria-hidden>/</li>
            <li className="text-foreground">{product.name}</li>
          </ol>
        </nav>
      </div>

      <div className="container mx-auto grid gap-10 px-4 py-10 lg:grid-cols-2">
        <div>
          <button
            type="button"
            onClick={() => setLightbox(true)}
            className="block w-full overflow-hidden rounded-sm border border-border bg-muted"
          >
            {gallery[active] ? (
              <img
                src={gallery[active].url}
                alt={gallery[active].alt_text ?? product.name}
                className="aspect-[4/3] w-full object-cover"
              />
            ) : (
              <div className="aspect-[4/3] w-full" />
            )}
          </button>
          {gallery.length > 1 ? (
            <div className="mt-3 grid grid-cols-4 gap-3">
              {gallery.map((img, i) => (
                <button
                  key={img.id}
                  type="button"
                  onClick={() => setActive(i)}
                  aria-label={`View image ${i + 1}`}
                  className={`overflow-hidden rounded-sm border ${i === active ? "border-primary" : "border-border"}`}
                >
                  <img
                    src={img.url}
                    alt={img.alt_text ?? product.name}
                    loading="lazy"
                    className="aspect-square w-full object-cover"
                  />
                </button>
              ))}
            </div>
          ) : null}
        </div>

        <div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">{conditionLabel(product.condition)}</Badge>
            {type ? <Badge variant="outline">{type.name}</Badge> : null}
            {size ? <Badge variant="outline">{size.name}</Badge> : null}
            {product.on_sale ? <Badge>On sale</Badge> : null}
          </div>
          <h1 className="mt-4 font-display text-3xl font-bold uppercase leading-tight text-foreground md:text-4xl">
            {product.name}
          </h1>
          {product.short_description ? (
            <p className="mt-3 text-muted-foreground">{product.short_description}</p>
          ) : null}
          <p className="mt-5 font-display text-3xl font-bold text-primary">
            {formatPrice(product.price, product.price_mode, product.currency)}
          </p>
          <dl className="mt-5 grid grid-cols-2 gap-3 text-sm">
            {product.sku ? (
              <div><dt className="text-muted-foreground">SKU</dt><dd className="font-medium">{product.sku}</dd></div>
            ) : null}
            <div>
              <dt className="text-muted-foreground">Availability</dt>
              <dd className="font-medium capitalize">{product.availability.replace(/_/g, " ")}</dd>
            </div>
            {category ? (
              <div><dt className="text-muted-foreground">Category</dt><dd className="font-medium">{category.name}</dd></div>
            ) : null}
            {product.year_manufactured ? (
              <div><dt className="text-muted-foreground">Year</dt><dd className="font-medium">{product.year_manufactured}</dd></div>
            ) : null}
          </dl>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <div className="flex items-center rounded-sm border border-input">
              <button type="button" aria-label="Decrease quantity" className="px-3 py-2" onClick={() => setQty((q) => Math.max(1, q - 1))}>−</button>
              <span className="w-10 text-center text-sm font-semibold">{qty}</span>
              <button type="button" aria-label="Increase quantity" className="px-3 py-2" onClick={() => setQty((q) => q + 1)}>+</button>
            </div>
            <Button
              size="lg"
              onClick={() => {
                addItem(
                  {
                    slug: product.slug,
                    name: product.name,
                    image: gallery[0]?.url ?? null,
                    price: product.price,
                    priceMode: product.price_mode,
                    currency: product.currency,
                    condition: product.condition,
                  },
                  qty,
                );
                toast.success("Added to your enquiry list");
              }}
            >
              Add to enquiry
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/checkout">Request a quote</Link>
            </Button>
          </div>

          {product.delivery_info ? (
            <p className="mt-5 rounded-sm border border-border bg-secondary/40 p-4 text-sm text-muted-foreground">
              {product.delivery_info}
            </p>
          ) : null}
        </div>
      </div>

      <div className="container mx-auto grid gap-10 px-4 pb-14 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {product.description ? (
            <section>
              <h2 className="font-display text-2xl font-bold uppercase">Description</h2>
              <div className="mt-3 space-y-3 text-sm leading-relaxed text-muted-foreground">
                {product.description.split("\n\n").map((para, i) => (
                  <p key={i}>{para}</p>
                ))}
              </div>
            </section>
          ) : null}

          {product.features.length ? (
            <section className="mt-8">
              <h2 className="font-display text-2xl font-bold uppercase">Features</h2>
              <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                {product.features.map((f) => (
                  <li key={f} className="flex gap-2 text-sm text-muted-foreground">
                    <span className="text-primary">▪</span>
                    {f}
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {product.applications.length ? (
            <section className="mt-8">
              <h2 className="font-display text-2xl font-bold uppercase">Typical applications</h2>
              <ul className="mt-3 flex flex-wrap gap-2">
                {product.applications.map((a) => (
                  <li key={a} className="rounded-sm bg-secondary px-3 py-1 text-xs uppercase tracking-wide">
                    {a}
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>

        {specs.length ? (
          <aside>
            <h2 className="font-display text-2xl font-bold uppercase">Specifications</h2>
            <table className="mt-3 w-full border border-border text-sm">
              <tbody>
                {specs.map((s) => (
                  <tr key={s.id} className="border-b border-border last:border-0">
                    <th scope="row" className="w-1/2 bg-secondary/40 px-3 py-2 text-left font-medium">
                      {s.label}
                    </th>
                    <td className="px-3 py-2 text-muted-foreground">{s.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </aside>
        ) : null}
      </div>

      {related.length ? (
        <section className="border-t border-border bg-secondary/30 py-12">
          <div className="container mx-auto px-4">
            <h2 className="font-display text-2xl font-bold uppercase">Related containers</h2>
            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((r) => (
                <ProductCard key={r.id} product={r} />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <Dialog open={lightbox} onOpenChange={setLightbox}>
        <DialogContent className="max-w-4xl p-0">
          {gallery[active] ? (
            <img
              src={gallery[active].url}
              alt={gallery[active].alt_text ?? product.name}
              className="w-full object-contain"
            />
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
