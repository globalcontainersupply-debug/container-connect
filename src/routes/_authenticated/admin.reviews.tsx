import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Plus, Pencil, Star } from "lucide-react";
import { toast } from "sonner";
import { deleteReview, listReviewsAdmin, upsertReview } from "@/lib/admin.functions";
import type { ReviewRow } from "@/lib/catalog-data.server";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { ConfirmDeleteButton } from "@/components/admin/confirm-delete-button";

export const Route = createFileRoute("/_authenticated/admin/reviews")({
  ssr: false,
  component: ReviewsAdminPage,
});

type FormState = {
  id?: string;
  customer_name: string;
  company: string;
  country: string;
  avatar_url: string;
  rating: number;
  body: string;
  review_date: string;
  published: boolean;
  featured: boolean;
  is_demo: boolean;
  sort_order: number;
};

function emptyForm(): FormState {
  return {
    customer_name: "",
    company: "",
    country: "",
    avatar_url: "",
    rating: 5,
    body: "",
    review_date: new Date().toISOString().slice(0, 10),
    published: true,
    featured: false,
    is_demo: false,
    sort_order: 0,
  };
}

function toForm(row: ReviewRow): FormState {
  return {
    id: row.id,
    customer_name: row.customer_name,
    company: row.company ?? "",
    country: row.country ?? "",
    avatar_url: row.avatar_url ?? "",
    rating: row.rating,
    body: row.body,
    review_date: row.review_date,
    published: row.published,
    featured: row.featured,
    is_demo: row.is_demo,
    sort_order: row.sort_order,
  };
}

function ReviewsAdminPage() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["admin-reviews"], queryFn: () => listReviewsAdmin() });
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm());
  const [uploading, setUploading] = useState(false);

  const save = useMutation({
    mutationFn: () =>
      upsertReview({
        data: {
          id: form.id,
          customer_name: form.customer_name,
          company: form.company || null,
          country: form.country || null,
          avatar_url: form.avatar_url || null,
          rating: form.rating,
          body: form.body,
          review_date: form.review_date,
          published: form.published,
          featured: form.featured,
          is_demo: form.is_demo,
          sort_order: form.sort_order,
        },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-reviews"] });
      toast.success("Review saved");
      setOpen(false);
    },
    onError: (e) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: (id: string) => deleteReview({ data: { id } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-reviews"] });
      toast.success("Review deleted");
    },
    onError: (e) => toast.error(e.message),
  });

  async function handleAvatarUpload(file: File) {
    setUploading(true);
    try {
      const path = `avatars/${Date.now()}-${file.name}`;
      const { error } = await supabase.storage.from("media").upload(path, file);
      if (error) throw error;
      const { data: pub } = supabase.storage.from("media").getPublicUrl(path);
      setForm((f) => ({ ...f, avatar_url: pub.publicUrl }));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  function openNew() {
    setForm(emptyForm());
    setOpen(true);
  }
  function openEdit(row: ReviewRow) {
    setForm(toForm(row));
    setOpen(true);
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl font-bold uppercase">Reviews</h1>
        <Button onClick={openNew}>
          <Plus className="mr-1.5 size-4" /> Add review
        </Button>
      </div>

      <div className="mt-6 overflow-x-auto rounded-sm border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-secondary/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-2.5">Customer</th>
              <th className="px-4 py-2.5">Rating</th>
              <th className="px-4 py-2.5">Status</th>
              <th className="px-4 py-2.5" />
            </tr>
          </thead>
          <tbody>
            {(data ?? []).map((row) => (
              <tr key={row.id} className="border-t border-border">
                <td className="px-4 py-2.5 font-medium">{row.customer_name}</td>
                <td className="px-4 py-2.5 text-muted-foreground">{row.rating}★</td>
                <td className="px-4 py-2.5 flex gap-1.5">
                  <Badge variant={row.published ? "default" : "secondary"}>
                    {row.published ? "Published" : "Draft"}
                  </Badge>
                  {row.featured ? <Badge variant="outline">Featured</Badge> : null}
                </td>
                <td className="px-4 py-2.5 text-right">
                  <Button variant="ghost" size="icon" onClick={() => openEdit(row)} aria-label="Edit">
                    <Pencil className="size-4" />
                  </Button>
                  <ConfirmDeleteButton label={row.customer_name} onConfirm={() => remove.mutate(row.id)} />
                </td>
              </tr>
            ))}
            {!isLoading && !(data ?? []).length ? (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-muted-foreground">
                  No reviews yet.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>{form.id ? "Edit review" : "New review"}</SheetTitle>
          </SheetHeader>
          <div className="mt-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="rev-name">Customer name</Label>
                <Input id="rev-name" value={form.customer_name} onChange={(e) => setForm((f) => ({ ...f, customer_name: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rev-company">Company</Label>
                <Input id="rev-company" value={form.company} onChange={(e) => setForm((f) => ({ ...f, company: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rev-country">Country</Label>
                <Input id="rev-country" value={form.country} onChange={(e) => setForm((f) => ({ ...f, country: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rev-date">Review date</Label>
                <Input id="rev-date" type="date" value={form.review_date} onChange={(e) => setForm((f) => ({ ...f, review_date: e.target.value }))} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="rev-avatar">Avatar</Label>
              <div className="flex items-center gap-3">
                <Input
                  id="rev-avatar"
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleAvatarUpload(file);
                  }}
                />
                {uploading ? <span className="text-xs text-muted-foreground">Uploading…</span> : null}
              </div>
              {form.avatar_url ? (
                <img src={form.avatar_url} alt="" className="mt-2 size-12 rounded-full object-cover" />
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="rev-rating">Rating</Label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, rating: n }))}
                    aria-label={`${n} star`}
                  >
                    <Star className={`size-6 ${n <= form.rating ? "fill-primary text-primary" : "text-muted-foreground"}`} />
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="rev-body">Review</Label>
              <Textarea id="rev-body" rows={4} value={form.body} onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="rev-sort">Sort order</Label>
                <Input id="rev-sort" type="number" value={form.sort_order} onChange={(e) => setForm((f) => ({ ...f, sort_order: Number(e.target.value) }))} />
              </div>
            </div>
            <div className="flex flex-wrap gap-6">
              <div className="flex items-center gap-2">
                <Switch id="rev-published" checked={form.published} onCheckedChange={(v) => setForm((f) => ({ ...f, published: v }))} />
                <Label htmlFor="rev-published">Published</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch id="rev-featured" checked={form.featured} onCheckedChange={(v) => setForm((f) => ({ ...f, featured: v }))} />
                <Label htmlFor="rev-featured">Featured</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch id="rev-demo" checked={form.is_demo} onCheckedChange={(v) => setForm((f) => ({ ...f, is_demo: v }))} />
                <Label htmlFor="rev-demo">Demo</Label>
              </div>
            </div>
          </div>
          <SheetFooter className="mt-6">
            <Button onClick={() => save.mutate()} disabled={save.isPending || !form.customer_name || !form.body}>
              {save.isPending ? "Saving…" : "Save review"}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}
