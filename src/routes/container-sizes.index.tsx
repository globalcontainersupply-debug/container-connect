import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Boxes } from "lucide-react";
import { taxonomyQuery } from "@/lib/queries";
import { pageMeta } from "@/lib/seo";

export const Route = createFileRoute("/container-sizes/")({
  head: () =>
    pageMeta({
      title: "Container Sizes",
      description:
        "Compare standard shipping container sizes — 10ft, 20ft, 40ft and 45ft — with external, internal and door dimensions, capacity and payload.",
      path: "/container-sizes",
    }),
  loader: ({ context }) => context.queryClient.ensureQueryData(taxonomyQuery),
  component: ContainerSizesPage,
});

function ContainerSizesPage() {
  const { data } = useSuspenseQuery(taxonomyQuery);

  return (
    <div className="container-page py-14">
      <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground">
        <Link to="/" className="hover:text-primary">
          Home
        </Link>
        <span className="px-2">/</span>
        <span className="text-foreground">Container Sizes</span>
      </nav>
      <h1 className="mt-4 font-display text-5xl font-bold uppercase">Container sizes</h1>
      <p className="mt-3 max-w-2xl text-muted-foreground">
        Standard ISO dimensions for every size we stock. Open a size for full internal, external
        and door dimensions plus capacity and payload.
      </p>

      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {data.sizes.map((size) => (
          <Link
            key={size.id}
            to="/container-sizes/$slug"
            params={{ slug: size.slug }}
            className="group flex flex-col overflow-hidden rounded-sm border border-border bg-card transition-shadow hover:shadow-lg"
          >
            <div className="relative aspect-[4/3] overflow-hidden bg-muted">
              {size.image_url ? (
                <img
                  src={size.image_url}
                  alt={size.name}
                  loading="lazy"
                  className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <div className="flex size-full items-center justify-center">
                  <Boxes className="size-10 text-muted-foreground" aria-hidden />
                </div>
              )}
            </div>
            <div className="flex flex-1 flex-col gap-2 p-5">
              <h2 className="font-display text-xl font-semibold uppercase leading-tight">
                {size.name}
              </h2>
              {size.external_dimensions ? (
                <p className="text-sm text-muted-foreground">
                  External: {size.external_dimensions}
                </p>
              ) : null}
              {size.capacity ? (
                <p className="text-sm text-muted-foreground">Capacity: {size.capacity}</p>
              ) : null}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
