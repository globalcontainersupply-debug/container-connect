import { Link } from "@tanstack/react-router";
import type { ProductCard as ProductCardType } from "@/lib/catalog-data.server";
import { conditionLabel, formatPrice } from "@/lib/site";
import { Badge } from "@/components/ui/badge";

export function ProductCard({ product }: { product: ProductCardType }) {
  return (
    <Link
      to="/containers/$slug"
      params={{ slug: product.slug }}
      className="group flex flex-col overflow-hidden rounded-sm border border-border bg-card transition-shadow hover:shadow-lg"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        {product.image ? (
          <img
            src={product.image}
            alt={product.imageAlt ?? product.name}
            loading="lazy"
            className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : null}
        <div className="absolute left-3 top-3 flex gap-1.5">
          {product.on_sale ? <Badge>On sale</Badge> : null}
          {product.is_new_arrival ? <Badge variant="secondary">New arrival</Badge> : null}
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground">
          <span>{conditionLabel(product.condition)}</span>
          <span aria-hidden>·</span>
          <span>{product.availability.replace(/_/g, " ")}</span>
        </div>
        <h3 className="font-display text-lg font-semibold uppercase leading-tight text-card-foreground">
          {product.name}
        </h3>
        {product.short_description ? (
          <p className="line-clamp-2 text-sm text-muted-foreground">{product.short_description}</p>
        ) : null}
        <p className="mt-auto pt-2 font-display text-xl font-bold text-primary">
          {formatPrice(product.price, product.price_mode, product.currency)}
        </p>
      </div>
    </Link>
  );
}
