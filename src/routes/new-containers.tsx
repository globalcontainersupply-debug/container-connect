import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { catalogQuery } from "@/lib/queries";
import { pageMeta } from "@/lib/seo";
import { ProductCard } from "@/components/site/product-card";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/new-containers")({
  head: () =>
    pageMeta({
      title: "New Shipping Containers",
      description:
        "Browse new, one-trip shipping containers — the closest condition to factory-fresh, having made a single loaded voyage before sale.",
      path: "/new-containers",
    }),
  loader: ({ context }) => context.queryClient.ensureQueryData(catalogQuery),
  component: NewContainersPage,
});

function NewContainersPage() {
  const { data } = useSuspenseQuery(catalogQuery);
  const products = data.products.filter((p) => p.condition === "new");

  return (
    <div className="container-page py-14">
      <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground">
        <Link to="/" className="hover:text-primary">
          Home
        </Link>
        <span className="px-2">/</span>
        <span className="text-foreground">New Containers</span>
      </nav>
      <h1 className="mt-4 font-display text-5xl font-bold uppercase">New (one-trip) containers</h1>
      <p className="mt-3 max-w-2xl text-muted-foreground">
        One-trip units have made a single loaded voyage from the factory before being released for
        sale. They carry minimal cosmetic marks, full structural integrity and the longest
        remaining service life of any container on the market.
      </p>
      <div className="mt-4">
        <Button asChild variant="outline">
          <Link to="/containers" search={{ condition: "new" }}>
            Filter the full catalogue
          </Link>
        </Button>
      </div>

      {products.length ? (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      ) : (
        <p className="mt-10 rounded-sm border border-dashed border-border p-10 text-center text-muted-foreground">
          No new units are listed right now. Contact us for upcoming availability.
        </p>
      )}
    </div>
  );
}
