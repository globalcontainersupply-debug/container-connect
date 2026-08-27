import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil } from "lucide-react";
import { toast } from "sonner";
import { deletePost, listPostsAdmin } from "@/lib/admin.functions";
import { formatDate } from "@/lib/site";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ConfirmDeleteButton } from "@/components/admin/confirm-delete-button";

export const Route = createFileRoute("/_authenticated/admin/blog/")({
  ssr: false,
  component: BlogAdminIndex,
});

function BlogAdminIndex() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["admin-posts"], queryFn: () => listPostsAdmin() });

  const remove = useMutation({
    mutationFn: (id: string) => deletePost({ data: { id } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-posts"] });
      toast.success("Post deleted");
    },
    onError: (e) => toast.error(e.message),
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl font-bold uppercase">Blog</h1>
        <Button asChild>
          <Link to="/admin/blog/$id" params={{ id: "new" }}>
            <Plus className="mr-1.5 size-4" /> Add post
          </Link>
        </Button>
      </div>

      <div className="mt-6 overflow-hidden rounded-sm border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-secondary/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-2.5">Title</th>
              <th className="px-4 py-2.5">Category</th>
              <th className="px-4 py-2.5">Published</th>
              <th className="px-4 py-2.5">Status</th>
              <th className="px-4 py-2.5" />
            </tr>
          </thead>
          <tbody>
            {(data ?? []).map((row) => (
              <tr key={row.id} className="border-t border-border">
                <td className="px-4 py-2.5 font-medium">{row.title}</td>
                <td className="px-4 py-2.5 text-muted-foreground">{row.category ?? "—"}</td>
                <td className="px-4 py-2.5 text-muted-foreground">{formatDate(row.published_at)}</td>
                <td className="px-4 py-2.5">
                  <Badge variant={row.published ? "default" : "secondary"}>
                    {row.published ? "Published" : "Draft"}
                  </Badge>
                </td>
                <td className="px-4 py-2.5 text-right">
                  <Button variant="ghost" size="icon" asChild aria-label="Edit">
                    <Link to="/admin/blog/$id" params={{ id: row.id }}>
                      <Pencil className="size-4" />
                    </Link>
                  </Button>
                  <ConfirmDeleteButton label={row.title} onConfirm={() => remove.mutate(row.id)} />
                </td>
              </tr>
            ))}
            {!isLoading && !(data ?? []).length ? (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-muted-foreground">
                  No blog posts yet.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
