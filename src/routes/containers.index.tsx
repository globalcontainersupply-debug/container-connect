import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { catalogQuery } from "@/lib/queries";
import { pageMeta } from "@/lib/seo";
import { ProductCard } from "@/components/site/product-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type CatalogSearch = {
  q?: string;
  type?: string;
  size?: string;
  condition?: string;
  availability?: string;
  sort?: string;
};

export const Route = createFileRoute("/containers/")({
  validateSearch: (search: Record<string, unknown>): CatalogSearch => ({
    q: typeof search.q === "string" && search.q ? search.q : undefined,
    type: typeof search.type === "string" && search.type ? search.type : undefined,
    size: typeof search.size === "string" && search.size ? search.size : undefined,
    condition:
      typeof search.condition === "string" && search.condition ? search.condition : undefined,
    availability:
      typeof search.availability === "string" && search.availability
        ? search.availability
        : undefined,
    sort: typeof search.sort === "string" && search.sort ? search.sort : undefined,
  }),
  head: () =>
    pageMeta({
      title: "Shipping Containers for Sale",
      description:
        "Browse our full catalogue of new and used shipping containers — 10ft to 45ft, dry, high cube, reefer, open top, flat rack and tank units.",
      path: "/containers",
    }),
  loader: ({ context }) => context.queryClient.ensureQueryData(catalogQuery),
  component: CatalogPage,
});

function CatalogPage() {
  const { data } = useSuspenseQuery(catalogQuery);
  const search = Route.useSearch();
  const navigate = useNavigate({ from: "/containers" });

  const setParam = (key: keyof CatalogSearch, value: string) =>
    navigate({
      search: (prev) => ({ ...prev, [key]: value === "all" || !value ? undefined : value }),
    });

  const filtered = useMemo(() => {
    const typeId = data.types.find((t) => t.slug === search.type)?.id;
    const sizeId = data.sizes.find((s) => s.slug === search.size)?.id;
    let rows = data.products.filter((p) => {
      if (typeId && p.type_id !== typeId) return false;
      if (sizeId && p.size_id !== sizeId) return false;
      if (search.condition && p.condition !== search.condition) return false;
      if (search.availability && p.availability !== search.availability) return false;
      if (search.q) {
        const term = search.q.toLowerCase();
        const haystack = `${p.name} ${p.short_description ?? ""}`.toLowerCase();
        if (!haystack.includes(term)) return false;
      }
      return true;
    });
    rows = [...rows];
    if (search.sort === "price-asc") rows.sort((a, b) => (a.price ?? 1e9) - (b.price ?? 1e9));
    else if (search.sort === "price-desc") rows.sort((a, b) => (b.price ?? -1) - (a.price ?? -1));
    else if (search.sort === "name") rows.sort((a, b) => a.name.localeCompare(b.name));
    return rows;
  }, [data, search]);

  return (
    <div className="container-page py-14">
      <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground">
        <Link to="/" className="hover:text-primary">
          Home
        </Link>
        <span className="px-2">/</span>
        <span className="text-foreground">Containers</span>
      </nav>
      <h1 className="mt-4 font-display text-5xl font-bold uppercase">Shipping containers</h1>
      <p className="mt-3 max-w-2xl text-muted-foreground">
        Inspected new and used units ready for export. Filter by type, size, condition and
        availability, then add what you need to your enquiry.
      </p>

      <div className="mt-10 grid gap-8 lg:grid-cols-[260px_1fr]">
        <aside className="space-y-5 rounded-sm border border-border bg-card p-5">
          <div>
            <Label htmlFor="catalog-search">Search</Label>
            <Input
              id="catalog-search"
              value={search.q ?? ""}
              placeholder="e.g. 40ft high cube"
              onChange={(e) => setParam("q", e.target.value)}
              className="mt-1.5"
            />
          </div>
          <FilterSelect
            label="Type"
            value={search.type ?? "all"}
            onChange={(v) => setParam("type", v)}
            options={data.types.map((t) => ({ value: t.slug, label: t.name }))}
          />
          <FilterSelect
            label="Size"
            value={search.size ?? "all"}
            onChange={(v) => setParam("size", v)}
            options={data.sizes.map((s) => ({ value: s.slug, label: s.name }))}
          />
          <FilterSelect
            label="Condition"
            value={search.condition ?? "all"}
            onChange={(v) => setParam("condition", v)}
            options={[
              { value: "new", label: "New (one-trip)" },
              { value: "used", label: "Used" },
            ]}
          />
          <FilterSelect
            label="Availability"
            value={search.availability ?? "all"}
            onChange={(v) => setParam("availability", v)}
            options={[
              { value: "available", label: "Available" },
              { value: "limited", label: "Limited" },
              { value: "on_order", label: "On order" },
            ]}
          />
          <Button variant="outline" className="w-full" onClick={() => navigate({ search: {} })}>
            Clear filters
          </Button>
        </aside>

        <div>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              {filtered.length} container{filtered.length === 1 ? "" : "s"}
            </p>
            <FilterSelect
              label=""
              placeholder="Sort by"
              value={search.sort ?? "all"}
              onChange={(v) => setParam("sort", v)}
              allLabel="Default"
              options={[
                { value: "price-asc", label: "Price: low to high" },
                { value: "price-desc", label: "Price: high to low" },
                { value: "name", label: "Name A–Z" },
              ]}
            />
          </div>
          {filtered.length ? (
            <div className="mt-6 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {filtered.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          ) : (
            <p className="mt-10 rounded-sm border border-dashed border-border p-10 text-center text-muted-foreground">
              No containers match those filters. Try widening your search.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
  allLabel = "All",
  placeholder = "All",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  allLabel?: string;
  placeholder?: string;
}) {
  return (
    <div>
      {label ? <Label>{label}</Label> : null}
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className={label ? "mt-1.5 w-full" : "w-[200px]"}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{allLabel}</SelectItem>
          {options.map((o) => (
            <SelectItem key={o.value} value={o.value}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
