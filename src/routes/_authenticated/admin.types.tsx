import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Plus, Pencil } from "lucide-react";
import { toast } from "sonner";
import { deleteType, listTypesAdmin, upsertType } from "@/lib/admin.functions";
import type { TypeRow } from "@/lib/catalog-data.server";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { ConfirmDeleteButton } from "@/components/admin/confirm-delete-button";
import { TagListField } from "@/components/admin/tag-list-field";

export const Route = createFileRoute("/_authenticated/admin/types")({
  ssr: false,
  component: TypesAdminPage,
});

type FormState = {
  id?: string;
  slug: string;
  name: string;
  short_description: string;
  description: string;
  typical_uses: string[];
  characteristics: string[];
  available_sizes: string[];
  image_url: string;
  sort_order: number;
  published: boolean;
  seo_title: string;
  seo_description: string;
};

function emptyForm(): FormState {
  return {
    slug: "",
    name: "",
    short_description: "",
    description: "",
    typical_uses: [],
    characteristics: [],
    available_sizes: [],
    image_url: "",
    sort_order: 0,
    published: true,
    seo_title: "",
    seo_description: "",
  };
}

function toForm(row: TypeRow): FormState {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    short_description: row.short_description ?? "",
    description: row.description ?? "",
    typical_uses: row.typical_uses,
    characteristics: row.characteristics,
    available_sizes: row.available_sizes,
    image_url: row.image_url ?? "",
    sort_order: row.sort_order,
    published: row.published,
    seo_title: row.seo_title ?? "",
    seo_description: row.seo_description ?? "",
  };
}

function TypesAdminPage() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["admin-types"], queryFn: () => listTypesAdmin() });
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm());

  const save = useMutation({
    mutationFn: () =>
      upsertType({
        data: {
          id: form.id,
          slug: form.slug,
          name: form.name,
          short_description: form.short_description || null,
          description: form.description || null,
          typical_uses: form.typical_uses,
          characteristics: form.characteristics,
          available_sizes: form.available_sizes,
          image_url: form.image_url || null,
          sort_order: form.sort_order,
          published: form.published,
          seo_title: form.seo_title || null,
          seo_description: form.seo_description || null,
        },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-types"] });
      toast.success("Container type saved");
      setOpen(false);
    },
    onError: (e) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: (id: string) => deleteType({ data: { id } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-types"] });
      toast.success("Container type deleted");
    },
    onError: (e) => toast.error(e.message),
  });

  function openNew() {
    setForm(emptyForm());
    setOpen(true);
  }
  function openEdit(row: TypeRow) {
    setForm(toForm(row));
    setOpen(true);
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl font-bold uppercase">Container Types</h1>
        <Button onClick={openNew}>
          <Plus className="mr-1.5 size-4" /> Add type
        </Button>
      </div>

      <div className="mt-6 overflow-x-auto rounded-sm border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-secondary/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-2.5">Name</th>
              <th className="px-4 py-2.5">Slug</th>
              <th className="px-4 py-2.5">Status</th>
              <th className="px-4 py-2.5" />
            </tr>
          </thead>
          <tbody>
            {(data ?? []).map((row) => (
              <tr key={row.id} className="border-t border-border">
                <td className="px-4 py-2.5 font-medium">{row.name}</td>
                <td className="px-4 py-2.5 text-muted-foreground">{row.slug}</td>
                <td className="px-4 py-2.5">
                  <Badge variant={row.published ? "default" : "secondary"}>
                    {row.published ? "Published" : "Draft"}
                  </Badge>
                </td>
                <td className="px-4 py-2.5 text-right">
                  <Button variant="ghost" size="icon" onClick={() => openEdit(row)} aria-label="Edit">
                    <Pencil className="size-4" />
                  </Button>
                  <ConfirmDeleteButton label={row.name} onConfirm={() => remove.mutate(row.id)} />
                </td>
              </tr>
            ))}
            {!isLoading && !(data ?? []).length ? (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-muted-foreground">
                  No container types yet.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>{form.id ? "Edit container type" : "New container type"}</SheetTitle>
          </SheetHeader>
          <div className="mt-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="type-name">Name</Label>
              <Input id="type-name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type-slug">Slug</Label>
              <Input id="type-slug" value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type-short">Short description</Label>
              <Textarea id="type-short" rows={2} value={form.short_description} onChange={(e) => setForm((f) => ({ ...f, short_description: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type-desc">Description</Label>
              <Textarea id="type-desc" rows={4} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
            </div>
            <TagListField id="type-uses" label="Typical uses" value={form.typical_uses} onChange={(v) => setForm((f) => ({ ...f, typical_uses: v }))} />
            <TagListField id="type-characteristics" label="Characteristics" value={form.characteristics} onChange={(v) => setForm((f) => ({ ...f, characteristics: v }))} />
            <TagListField id="type-sizes" label="Available sizes (slugs)" value={form.available_sizes} onChange={(v) => setForm((f) => ({ ...f, available_sizes: v }))} placeholder="e.g. 20ft" />
            <div className="space-y-2">
              <Label htmlFor="type-image">Image URL</Label>
              <Input id="type-image" value={form.image_url} onChange={(e) => setForm((f) => ({ ...f, image_url: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type-sort">Sort order</Label>
                <Input id="type-sort" type="number" value={form.sort_order} onChange={(e) => setForm((f) => ({ ...f, sort_order: Number(e.target.value) }))} />
              </div>
              <div className="flex items-center gap-2 pt-6">
                <Switch id="type-published" checked={form.published} onCheckedChange={(v) => setForm((f) => ({ ...f, published: v }))} />
                <Label htmlFor="type-published">Published</Label>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="type-seo-title">SEO title</Label>
              <Input id="type-seo-title" value={form.seo_title} onChange={(e) => setForm((f) => ({ ...f, seo_title: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type-seo-desc">SEO description</Label>
              <Textarea id="type-seo-desc" rows={2} value={form.seo_description} onChange={(e) => setForm((f) => ({ ...f, seo_description: e.target.value }))} />
            </div>
          </div>
          <SheetFooter className="mt-6">
            <Button onClick={() => save.mutate()} disabled={save.isPending || !form.name || !form.slug}>
              {save.isPending ? "Saving…" : "Save type"}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}
