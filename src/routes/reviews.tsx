import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Star } from "lucide-react";
import { supportQuery } from "@/lib/queries";
import { pageMeta } from "@/lib/seo";
import { formatDate } from "@/lib/site";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export const Route = createFileRoute("/reviews")({
  head: () =>
    pageMeta({
      title: "Customer Reviews",
      description: "Read what buyers say about ordering shipping containers from us — pricing, delivery and condition.",
      path: "/reviews",
    }),
  loader: ({ context }) => context.queryClient.ensureQueryData(supportQuery),
  component: ReviewsPage,
});

function ReviewsPage() {
  const { data } = useSuspenseQuery(supportQuery);
  const reviews = [...data.reviews].sort(
    (a, b) => Number(b.featured) - Number(a.featured) || a.sort_order - b.sort_order,
  );
  const average = reviews.length
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

  return (
    <div className="bg-background">
      <div className="border-b border-border bg-secondary/40">
        <nav aria-label="Breadcrumb" className="container-page py-3 text-sm text-muted-foreground">
          <Link to="/" className="hover:text-primary">
            Home
          </Link>
          <span className="px-2">/</span>
          <span className="text-foreground">Reviews</span>
        </nav>
      </div>

      <section className="container-page py-14">
        <p className="eyebrow text-primary">Customer reviews</p>
        <h1 className="mt-2 font-display text-4xl font-bold uppercase md:text-5xl">
          What buyers say
        </h1>
        {reviews.length ? (
          <div className="mt-4 flex items-center gap-3">
            <div className="flex gap-0.5 text-primary" aria-hidden>
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className={`size-5 ${i < Math.round(average) ? "fill-current" : ""}`} />
              ))}
            </div>
            <p className="text-sm text-muted-foreground">
              {average.toFixed(1)} average from {reviews.length} review{reviews.length === 1 ? "" : "s"}
            </p>
          </div>
        ) : null}

        {reviews.length ? (
          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {reviews.map((r) => (
              <figure key={r.id} className="rounded-sm border border-border bg-card p-6">
                <div className="flex gap-0.5 text-primary" aria-label={`${r.rating} out of 5`}>
                  {Array.from({ length: r.rating }).map((_, i) => (
                    <Star key={i} className="size-4 fill-current" aria-hidden />
                  ))}
                </div>
                <blockquote className="mt-4 text-sm leading-relaxed text-muted-foreground">
                  {r.body}
                </blockquote>
                <figcaption className="mt-5 flex items-center gap-3">
                  <Avatar className="size-9">
                    <AvatarImage src={r.avatar_url ?? undefined} alt="" />
                    <AvatarFallback>{r.customer_name.slice(0, 1)}</AvatarFallback>
                  </Avatar>
                  <div className="text-sm">
                    <p className="font-semibold">{r.customer_name}</p>
                    <p className="text-muted-foreground">
                      {[r.company, r.country].filter(Boolean).join(" · ")}
                      {r.company || r.country ? " · " : ""}
                      {formatDate(r.review_date)}
                    </p>
                  </div>
                </figcaption>
              </figure>
            ))}
          </div>
        ) : (
          <p className="mt-10 text-muted-foreground">No reviews published yet.</p>
        )}
      </section>
    </div>
  );
}
