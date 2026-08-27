import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Plus, Pencil } from "lucide-react";
import { toast } from "sonner";
import { deleteSize, listSizesAdmin, upsertSize } from "@/lib/admin.functions";
import type { SizeRow } from "@/lib/catalog-data.server";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { ConfirmDeleteButton } from "@/components/admin/confirm-delete-button";
import { TagListField } from "@/components/admin/tag-list-field";

export const Route = createFileRoute("/_authenticated/admin/sizes")({
  ssr: false,
  component: SizesAdminPage,
});

type FormState = {
  id?: string;
  slug: string;
  name: string;
  short_description: string;
  description: string;
  external_dimensions: string;
  internal_dimensions: string;
  door_dimensions: string;
  capacity: string;
  tare_weight: string;
  max_gross_weight: string;
  payload: string;
  typical_applications: string[];
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
    external_dimensions: "",
    internal_dimensions: "",
    door_dimensions: "",
    capacity: "",
    tare_weight: "",
    max_gross_weight: "",
    payload: "",
    typical_applications: [],
    image_url: "",
    sort_order: 0,
    published: true,
    seo_title: "",
    seo_description: "",
  };
}

function toForm(row: SizeRow): FormState {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    short_description: row.short_description ?? "",
    description: row.description ?? "",
    external_dimensions: row.external_dimensions ?? "",
    internal_dimensions: row.internal_dimensions ?? "",
    door_dimensions: row.door_dimensions ?? "",
    capacity: row.capacity ?? "",
    tare_weight: row.tare_weight ?? "",
    max_gross_weight: row.max_gross_weight ?? "",
    payload: row.payload ?? "",
    typical_applications: row.typical_applications,
    image_url: row.image_url ?? "",
    sort_order: row.sort_order,
    published: row.published,
    seo_title: row.seo_title ?? "",
    seo_description: row.seo_description ?? "",
  };
}

function SizesAdminPage() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["admin-sizes"], queryFn: () => listSizesAdmin() });
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm());

  const save = useMutation({
    mutationFn: () =>
      upsertSize({
        data: {
          id: form.id,
          slug: form.slug,
          name: form.name,
          short_description: form.short_description || null,
          description: form.description || null,
          external_dimensions: form.external_dimensions || null,
          internal_dimensions: form.internal_dimensions || null,
          door_dimensions: form.door_dimensions || null,
          capacity: form.capacity || null,
          tare_weight: form.tare_weight || null,
          max_gross_weight: form.max_gross_weight || null,
          payload: form.payload || null,
          typical_applications: form.typical_applications,
          image_url: form.image_url || null,
          sort_order: form.sort_order,
          published: form.published,
          seo_title: form.seo_title || null,
          seo_description: form.seo_description || null,
        },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-sizes"] });
      toast.success("Container size saved");
      setOpen(false);
    },
    onError: (e) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: (id: string) => deleteSize({ data: { id } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-sizes"] });
      toast.success("Container size deleted");
    },
    onError: (e) => toast.error(e.message),
  });

  function openNew() {
    setForm(emptyForm());
    setOpen(true);
  }
  function openEdit(row: SizeRow) {
    setForm(toForm(row));
    setOpen(true);
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl font-bold uppercase">Container Sizes</h1>
        <Button onClick={openNew}>
          <Plus className="mr-1.5 size-4" /> Add size
        </Button>
      </div>

      <div className="mt-6 overflow-hidden rounded-sm border border-border bg-card">
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
                  No container sizes yet.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>{form.id ? "Edit container size" : "New container size"}</SheetTitle>
          </SheetHeader>
          <div className="mt-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="size-name">Name</Label>
              <Input id="size-name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="size-slug">Slug</Label>
              <Input id="size-slug" value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="size-short">Short description</Label>
              <Textarea id="size-short" rows={2} value={form.short_description} onChange={(e) => setForm((f) => ({ ...f, short_description: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="size-desc">Description</Label>
              <Textarea id="size-desc" rows={4} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="size-ext">External dimensions</Label>
                <Input id="size-ext" value={form.external_dimensions} onChange={(e) => setForm((f) => ({ ...f, external_dimensions: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="size-int">Internal dimensions</Label>
                <Input id="size-int" value={form.internal_dimensions} onChange={(e) => setForm((f) => ({ ...f, internal_dimensions: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="size-door">Door dimensions</Label>
                <Input id="size-door" value={form.door_dimensions} onChange={(e) => setForm((f) => ({ ...f, door_dimensions: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="size-capacity">Capacity</Label>
                <Input id="size-capacity" value={form.capacity} onChange={(e) => setForm((f) => ({ ...f, capacity: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="size-tare">Tare weight</Label>
                <Input id="size-tare" value={form.tare_weight} onChange={(e) => setForm((f) => ({ ...f, tare_weight: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="size-gross">Max gross weight</Label>
                <Input id="size-gross" value={form.max_gross_weight} onChange={(e) => setForm((f) => ({ ...f, max_gross_weight: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="size-payload">Payload</Label>
                <Input id="size-payload" value={form.payload} onChange={(e) => setForm((f) => ({ ...f, payload: e.target.value }))} />
              </div>
            </div>
            <TagListField id="size-applications" label="Typical applications" value={form.typical_applications} onChange={(v) => setForm((f) => ({ ...f, typical_applications: v }))} />
            <div className="space-y-2">
              <Label htmlFor="size-image">Image URL</Label>
              <Input id="size-image" value={form.image_url} onChange={(e) => setForm((f) => ({ ...f, image_url: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="size-sort">Sort order</Label>
                <Input id="size-sort" type="number" value={form.sort_order} onChange={(e) => setForm((f) => ({ ...f, sort_order: Number(e.target.value) }))} />
              </div>
              <div className="flex items-center gap-2 pt-6">
                <Switch id="size-published" checked={form.published} onCheckedChange={(v) => setForm((f) => ({ ...f, published: v }))} />
                <Label htmlFor="size-published">Published</Label>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="size-seo-title">SEO title</Label>
              <Input id="size-seo-title" value={form.seo_title} onChange={(e) => setForm((f) => ({ ...f, seo_title: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="size-seo-desc">SEO description</Label>
              <Textarea id="size-seo-desc" rows={2} value={form.seo_description} onChange={(e) => setForm((f) => ({ ...f, seo_description: e.target.value }))} />
            </div>
          </div>
          <SheetFooter className="mt-6">
            <Button onClick={() => save.mutate()} disabled={save.isPending || !form.name || !form.slug}>
              {save.isPending ? "Saving…" : "Save size"}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}
