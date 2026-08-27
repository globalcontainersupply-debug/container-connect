import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { catalogQuery } from "@/lib/queries";
import { pageMeta } from "@/lib/seo";
import { ProductCard } from "@/components/site/product-card";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/used-containers")({
  head: () =>
    pageMeta({
      title: "Used Shipping Containers",
      description:
        "Browse used shipping containers, graded cargo-worthy (CW) or wind and watertight (WWT), for buyers who don't need one-trip condition.",
      path: "/used-containers",
    }),
  loader: ({ context }) => context.queryClient.ensureQueryData(catalogQuery),
  component: UsedContainersPage,
});

const grades = [
  {
    title: "Cargo-worthy (CW)",
    body: "Structurally sound and certified fit for international shipment. The most common grade for buyers who plan to move cargo.",
  },
  {
    title: "Wind and watertight (WWT)",
    body: "No longer certified for ocean freight but fully sealed against the elements — ideal for static storage, conversions and site use.",
  },
];

function UsedContainersPage() {
  const { data } = useSuspenseQuery(catalogQuery);
  const products = data.products.filter((p) => p.condition === "used");

  return (
    <div className="container-page py-14">
      <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground">
        <Link to="/" className="hover:text-primary">
          Home
        </Link>
        <span className="px-2">/</span>
        <span className="text-foreground">Used Containers</span>
      </nav>
      <h1 className="mt-4 font-display text-5xl font-bold uppercase">Used containers</h1>
      <p className="mt-3 max-w-2xl text-muted-foreground">
        Used units cost less than one-trip stock and suit buyers who don't need factory-fresh
        condition — storage, conversions, site offices and general cargo moves.
      </p>
      <div className="mt-4">
        <Button asChild variant="outline">
          <Link to="/containers" search={{ condition: "used" }}>
            Filter the full catalogue
          </Link>
        </Button>
      </div>

      <div className="mt-10 grid gap-6 sm:grid-cols-2">
        {grades.map((g) => (
          <div key={g.title} className="rounded-sm border border-border bg-card p-6">
            <h2 className="font-display text-lg font-semibold uppercase">{g.title}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{g.body}</p>
          </div>
        ))}
      </div>

      {products.length ? (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      ) : (
        <p className="mt-10 rounded-sm border border-dashed border-border p-10 text-center text-muted-foreground">
          No used units are listed right now. Contact us for upcoming availability.
        </p>
      )}
    </div>
  );
}
