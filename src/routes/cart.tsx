import { createFileRoute, Link } from "@tanstack/react-router";
import { useCart } from "@/context/cart";
import { pageMeta } from "@/lib/seo";
import { formatPrice, conditionLabel } from "@/lib/site";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/cart")({
  head: () =>
    pageMeta({
      title: "Your Enquiry List",
      description:
        "Review the shipping containers on your enquiry list before requesting a tailored quote with delivery pricing.",
      path: "/cart",
    }),
  component: CartPage,
});

function CartPage() {
  const { items, subtotal, hasQuoteOnly, updateQuantity, removeItem, clear, hydrated } = useCart();

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="font-display text-3xl font-bold uppercase md:text-4xl">Your enquiry list</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Add as many units as you need — we&apos;ll reply with a single consolidated quote.
      </p>

      {!hydrated ? null : items.length === 0 ? (
        <div className="mt-10 rounded-sm border border-dashed border-border p-10 text-center">
          <p className="font-display text-xl font-semibold uppercase">Your list is empty</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Browse the catalogue and add the containers you&apos;re interested in.
          </p>
          <Button asChild className="mt-6">
            <Link to="/containers">Browse containers</Link>
          </Button>
        </div>
      ) : (
        <div className="mt-8 grid gap-8 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            {items.map((item) => (
              <div key={item.slug} className="flex gap-4 rounded-sm border border-border p-4">
                <div className="size-24 shrink-0 overflow-hidden rounded-sm bg-muted">
                  {item.image ? (
                    <img src={item.image} alt={item.name} loading="lazy" className="size-full object-cover" />
                  ) : null}
                </div>
                <div className="flex flex-1 flex-col gap-1">
                  <Link
                    to="/containers/$slug"
                    params={{ slug: item.slug }}
                    className="font-display text-lg font-semibold uppercase leading-tight hover:text-primary"
                  >
                    {item.name}
                  </Link>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    {conditionLabel(item.condition)}
                  </p>
                  <p className="text-sm font-semibold text-primary">
                    {formatPrice(item.price, item.priceMode, item.currency)}
                  </p>
                  <div className="mt-auto flex items-center gap-3 pt-2">
                    <div className="flex items-center rounded-sm border border-input">
                      <button
                        type="button"
                        aria-label={`Decrease quantity of ${item.name}`}
                        className="px-3 py-1.5"
                        onClick={() => updateQuantity(item.slug, item.quantity - 1)}
                      >
                        −
                      </button>
                      <span className="w-8 text-center text-sm font-semibold">{item.quantity}</span>
                      <button
                        type="button"
                        aria-label={`Increase quantity of ${item.name}`}
                        className="px-3 py-1.5"
                        onClick={() => updateQuantity(item.slug, item.quantity + 1)}
                      >
                        +
                      </button>
                    </div>
                    <button
                      type="button"
                      className="text-xs uppercase tracking-wide text-muted-foreground hover:text-destructive"
                      onClick={() => removeItem(item.slug)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={clear}
              className="text-xs uppercase tracking-wide text-muted-foreground hover:text-destructive"
            >
              Clear list
            </button>
          </div>

          <aside className="h-fit rounded-sm border border-border bg-secondary/40 p-6">
            <h2 className="font-display text-xl font-bold uppercase">Summary</h2>
            <dl className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Listed items total</dt>
                <dd className="font-semibold">{formatPrice(subtotal, "fixed", "USD")}</dd>
              </div>
              {hasQuoteOnly ? (
                <p className="text-xs text-muted-foreground">
                  Some items are priced on request and are not included in this total.
                </p>
              ) : null}
              <p className="text-xs text-muted-foreground">
                Delivery, modifications and taxes are quoted separately based on your location.
              </p>
            </dl>
            <Button asChild className="mt-6 w-full" size="lg">
              <Link to="/checkout">Request quote</Link>
            </Button>
            <Button asChild variant="outline" className="mt-3 w-full">
              <Link to="/containers">Continue browsing</Link>
            </Button>
          </aside>
        </div>
      )}
    </div>
  );
}
