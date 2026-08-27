import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Ship } from "lucide-react";
import { taxonomyQuery } from "@/lib/queries";
import { pageMeta } from "@/lib/seo";

export const Route = createFileRoute("/container-types/")({
  head: () =>
    pageMeta({
      title: "Container Types",
      description:
        "Explore every shipping container type we supply — dry, high cube, reefer, open top, flat rack and tank units — with typical uses and available sizes.",
      path: "/container-types",
    }),
  loader: ({ context }) => context.queryClient.ensureQueryData(taxonomyQuery),
  component: ContainerTypesPage,
});

function ContainerTypesPage() {
  const { data } = useSuspenseQuery(taxonomyQuery);

  return (
    <div className="container-page py-14">
      <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground">
        <Link to="/" className="hover:text-primary">
          Home
        </Link>
        <span className="px-2">/</span>
        <span className="text-foreground">Container Types</span>
      </nav>
      <h1 className="mt-4 font-display text-5xl font-bold uppercase">Container types</h1>
      <p className="mt-3 max-w-2xl text-muted-foreground">
        From general-purpose dry vans to specialist reefer and tank units, each type is built for a
        different cargo and use case.
      </p>

      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {data.types.map((type) => (
          <Link
            key={type.id}
            to="/container-types/$slug"
            params={{ slug: type.slug }}
            className="group flex flex-col overflow-hidden rounded-sm border border-border bg-card transition-shadow hover:shadow-lg"
          >
            <div className="relative aspect-[4/3] overflow-hidden bg-muted">
              {type.image_url ? (
                <img
                  src={type.image_url}
                  alt={type.name}
                  loading="lazy"
                  className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <div className="flex size-full items-center justify-center">
                  <Ship className="size-10 text-muted-foreground" aria-hidden />
                </div>
              )}
            </div>
            <div className="flex flex-1 flex-col gap-2 p-5">
              <h2 className="font-display text-xl font-semibold uppercase leading-tight">
                {type.name}
              </h2>
              {type.short_description ? (
                <p className="line-clamp-3 text-sm text-muted-foreground">
                  {type.short_description}
                </p>
              ) : null}
              {type.typical_uses.length ? (
                <div className="mt-auto flex flex-wrap gap-1.5 pt-2">
                  {type.typical_uses.slice(0, 3).map((use) => (
                    <span
                      key={use}
                      className="rounded-sm bg-secondary px-2 py-0.5 text-xs uppercase tracking-wide text-secondary-foreground"
                    >
                      {use}
                    </span>
                  ))}
                </div>
              ) : null}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
