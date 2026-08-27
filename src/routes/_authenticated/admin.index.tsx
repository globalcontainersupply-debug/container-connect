import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Package, CheckCircle2, EyeOff, Star, MessageSquareQuote, Image as ImageIcon, Video, Newspaper } from "lucide-react";
import { getAdminStats } from "@/lib/admin.functions";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/admin/")({
  ssr: false,
  component: AdminOverview,
});

function AdminOverview() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: () => getAdminStats(),
  });

  const cards = [
    { label: "Total products", value: data?.productsTotal, icon: Package },
    { label: "Published", value: data?.productsPublished, icon: CheckCircle2 },
    { label: "Unpublished", value: data?.productsUnpublished, icon: EyeOff },
    { label: "Featured", value: data?.productsFeatured, icon: Star },
    { label: "Reviews", value: data?.reviewsTotal, icon: MessageSquareQuote },
    { label: "Media items", value: data?.mediaTotal, icon: ImageIcon },
    { label: "Videos", value: data?.videosTotal, icon: Video },
    { label: "Blog posts", value: data?.postsTotal, icon: Newspaper },
  ];

  return (
    <div>
      <h1 className="font-display text-3xl font-bold uppercase">Dashboard</h1>
      <p className="mt-1 text-sm text-muted-foreground">Overview of your catalogue and content.</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="rounded-sm border border-border bg-card p-5">
            <c.icon className="size-5 text-primary" aria-hidden />
            <p className="mt-3 font-display text-3xl font-bold">
              {isLoading ? "—" : (c.value ?? 0)}
            </p>
            <p className="text-sm text-muted-foreground">{c.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <Button asChild>
          <Link to="/admin/products/new">Add product</Link>
        </Button>
        <Button asChild variant="outline">
          <Link to="/admin/blog">Add blog post</Link>
        </Button>
        <Button asChild variant="outline">
          <Link to="/admin/reviews">Add review</Link>
        </Button>
      </div>

      <div className="mt-10">
        <h2 className="font-display text-xl font-bold uppercase">Recent products</h2>
        <div className="mt-4 overflow-x-auto rounded-sm border border-border bg-card">
          <table className="w-full text-sm">
            <thead className="bg-secondary/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-2.5">Name</th>
                <th className="px-4 py-2.5">Status</th>
                <th className="px-4 py-2.5" />
              </tr>
            </thead>
            <tbody>
              {(data?.recentProducts ?? []).map((p) => (
                <tr key={p.id} className="border-t border-border">
                  <td className="px-4 py-2.5 font-medium">{p.name}</td>
                  <td className="px-4 py-2.5 text-muted-foreground">
                    {p.published ? "Published" : "Draft"}
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    <Link
                      to="/admin/products/$id"
                      params={{ id: p.id }}
                      className="text-primary hover:underline"
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
              {!isLoading && !(data?.recentProducts ?? []).length ? (
                <tr>
                  <td colSpan={3} className="px-4 py-6 text-center text-muted-foreground">
                    No products yet.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
