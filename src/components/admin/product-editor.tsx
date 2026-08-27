import { useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ArrowDown, ArrowUp, Plus, Star, Trash2 } from "lucide-react";
import {
  getProductAdmin,
  listCategoriesAdmin,
  listSizesAdmin,
  listTypesAdmin,
  saveProductImages,
  saveProductSpecs,
  upsertProduct,
} from "@/lib/admin.functions";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TagListField } from "@/components/admin/tag-list-field";
import { storageProxyUrl } from "@/lib/media-url";

type ProductForm = {
  id?: string;
  slug: string;
  name: string;
  sku: string;
  category_id: string;
  type_id: string;
  size_id: string;
  condition: "new" | "used";
  availability: "available" | "limited" | "on_order";
  price: string;
  currency: string;
  price_mode: "fixed" | "from" | "quote" | "hidden";
  quantity_available: string;
  year_manufactured: string;
  short_description: string;
  description: string;
  features: string[];
  applications: string[];
  delivery_info: string;
  notes: string;
  published: boolean;
  featured: boolean;
  popular: boolean;
  is_new_arrival: boolean;
  on_sale: boolean;
  sort_order: number;
  seo_title: string;
  seo_description: string;
  focus_keyword: string;
  og_image_url: string;
};

type ImageRow = { id?: string; url: string; alt_text: string; is_primary: boolean; sort_order: number };
type SpecRow = { id?: string; label: string; value: string; sort_order: number };

function emptyForm(): ProductForm {
  return {
    slug: "",
    name: "",
    sku: "",
    category_id: "",
    type_id: "",
    size_id: "",
    condition: "new",
    availability: "available",
    price: "",
    currency: "USD",
    price_mode: "fixed",
    quantity_available: "",
    year_manufactured: "",
    short_description: "",
    description: "",
    features: [],
    applications: [],
    delivery_info: "",
    notes: "",
    published: true,
    featured: false,
    popular: false,
    is_new_arrival: false,
    on_sale: false,
    sort_order: 0,
    seo_title: "",
    seo_description: "",
    focus_keyword: "",
    og_image_url: "",
  };
}

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export function ProductEditor({ id }: { id?: string }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isNew = !id;

  const { data: categories } = useQuery({ queryKey: ["admin-categories"], queryFn: () => listCategoriesAdmin() });
  const { data: types } = useQuery({ queryKey: ["admin-types"], queryFn: () => listTypesAdmin() });
  const { data: sizes } = useQuery({ queryKey: ["admin-sizes"], queryFn: () => listSizesAdmin() });
  const { data: existing } = useQuery({
    queryKey: ["admin-product", id],
    queryFn: () => getProductAdmin({ data: { id: id! } }),
    enabled: !isNew,
  });

  const [form, setForm] = useState<ProductForm>(emptyForm());
  const [images, setImages] = useState<ImageRow[]>([]);
  const [specs, setSpecs] = useState<SpecRow[]>([]);
  const [slugTouched, setSlugTouched] = useState(!isNew);
  const [loaded, setLoaded] = useState(isNew);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (isNew || !existing?.product || loaded) return;
    const p = existing.product;
    setForm({
      id: p.id,
      slug: p.slug,
      name: p.name,
      sku: p.sku ?? "",
      category_id: p.category_id ?? "",
      type_id: p.type_id ?? "",
      size_id: p.size_id ?? "",
      condition: p.condition as "new" | "used",
      availability: p.availability as "available" | "limited" | "on_order",
      price: p.price != null ? String(p.price) : "",
      currency: p.currency,
      price_mode: p.price_mode as "fixed" | "from" | "quote" | "hidden",
      quantity_available: p.quantity_available != null ? String(p.quantity_available) : "",
      year_manufactured: p.year_manufactured != null ? String(p.year_manufactured) : "",
      short_description: p.short_description ?? "",
      description: p.description ?? "",
      features: p.features,
      applications: p.applications,
      delivery_info: p.delivery_info ?? "",
      notes: p.notes ?? "",
      published: p.published,
      featured: p.featured,
      popular: p.popular,
      is_new_arrival: p.is_new_arrival,
      on_sale: p.on_sale,
      sort_order: p.sort_order,
      seo_title: p.seo_title ?? "",
      seo_description: p.seo_description ?? "",
      focus_keyword: p.focus_keyword ?? "",
      og_image_url: p.og_image_url ?? "",
    });
    setImages(
      existing.images.map((img) => ({
        id: img.id,
        url: img.url,
        alt_text: img.alt_text ?? "",
        is_primary: img.is_primary,
        sort_order: img.sort_order,
      })),
    );
    setSpecs(existing.specs.map((s) => ({ id: s.id, label: s.label, value: s.value, sort_order: s.sort_order })));
    setLoaded(true);
  }, [isNew, existing, loaded]);

  const save = useMutation({
    mutationFn: async () => {
      const product = await upsertProduct({
        data: {
          id: form.id,
          slug: form.slug,
          name: form.name,
          sku: form.sku || null,
          category_id: form.category_id || null,
          type_id: form.type_id || null,
          size_id: form.size_id || null,
          condition: form.condition,
          availability: form.availability,
          price: form.price ? Number(form.price) : null,
          currency: form.currency,
          price_mode: form.price_mode,
          quantity_available: form.quantity_available ? Number(form.quantity_available) : null,
          year_manufactured: form.year_manufactured ? Number(form.year_manufactured) : null,
          short_description: form.short_description || null,
          description: form.description || null,
          features: form.features,
          applications: form.applications,
          delivery_info: form.delivery_info || null,
          notes: form.notes || null,
          published: form.published,
          featured: form.featured,
          popular: form.popular,
          is_new_arrival: form.is_new_arrival,
          on_sale: form.on_sale,
          sort_order: form.sort_order,
          seo_title: form.seo_title || null,
          seo_description: form.seo_description || null,
          focus_keyword: form.focus_keyword || null,
          og_image_url: form.og_image_url || null,
        },
      });
      await Promise.all([
        saveProductImages({
          data: {
            productId: product.id,
            images: images.map((img, i) => ({
              id: img.id,
              url: img.url,
              alt_text: img.alt_text || null,
              is_primary: img.is_primary,
              sort_order: i,
            })),
          },
        }),
        saveProductSpecs({
          data: {
            productId: product.id,
            specs: specs.map((s, i) => ({ id: s.id, label: s.label, value: s.value, sort_order: i })),
          },
        }),
      ]);
      return product;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      toast.success("Product saved");
      navigate({ to: "/admin/products" });
    },
    onError: (e) => toast.error(e.message),
  });

  async function handleImageUpload(files: FileList) {
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        const path = `${Date.now()}-${file.name}`;
        const { error } = await supabase.storage.from("product-images").upload(path, file);
        if (error) throw error;
        const publicUrl = storageProxyUrl("product-images", path);
        setImages((prev) => [
          ...prev,
          { url: publicUrl, alt_text: "", is_primary: prev.length === 0, sort_order: prev.length },
        ]);
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  function moveImage(index: number, dir: -1 | 1) {
    setImages((prev) => {
      const next = [...prev];
      const target = index + dir;
      if (target < 0 || target >= next.length) return prev;
      const a = next[index];
      const b = next[target];
      if (!a || !b) return prev;
      next[index] = b;
      next[target] = a;
      return next;
    });
  }

  return (
    <div className="max-w-3xl">
      <h1 className="font-display text-3xl font-bold uppercase">
        {isNew ? "New product" : "Edit product"}
      </h1>

      <Tabs defaultValue="details" className="mt-6">
        <TabsList className="flex-wrap">
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="pricing">Pricing</TabsTrigger>
          <TabsTrigger value="media">Media</TabsTrigger>
          <TabsTrigger value="specs">Specs</TabsTrigger>
          <TabsTrigger value="flags">Flags</TabsTrigger>
          <TabsTrigger value="seo">SEO</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="p-name">Name</Label>
            <Input
              id="p-name"
              value={form.name}
              onChange={(e) => {
                const name = e.target.value;
                setForm((f) => ({ ...f, name, slug: slugTouched ? f.slug : slugify(name) }));
              }}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="p-slug">Slug</Label>
            <Input
              id="p-slug"
              value={form.slug}
              onChange={(e) => {
                setSlugTouched(true);
                setForm((f) => ({ ...f, slug: e.target.value }));
              }}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="p-sku">SKU</Label>
            <Input id="p-sku" value={form.sku} onChange={(e) => setForm((f) => ({ ...f, sku: e.target.value }))} />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={form.category_id || "none"} onValueChange={(v) => setForm((f) => ({ ...f, category_id: v === "none" ? "" : v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {(categories ?? []).map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={form.type_id || "none"} onValueChange={(v) => setForm((f) => ({ ...f, type_id: v === "none" ? "" : v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {(types ?? []).map((t) => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Size</Label>
              <Select value={form.size_id || "none"} onValueChange={(v) => setForm((f) => ({ ...f, size_id: v === "none" ? "" : v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {(sizes ?? []).map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Condition</Label>
              <Select value={form.condition} onValueChange={(v) => setForm((f) => ({ ...f, condition: v as "new" | "used" }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="used">Used</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Availability</Label>
              <Select value={form.availability} onValueChange={(v) => setForm((f) => ({ ...f, availability: v as ProductForm["availability"] }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="limited">Limited</SelectItem>
                  <SelectItem value="on_order">On order</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="p-qty">Quantity available</Label>
              <Input id="p-qty" type="number" value={form.quantity_available} onChange={(e) => setForm((f) => ({ ...f, quantity_available: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="p-year">Year manufactured</Label>
              <Input id="p-year" type="number" value={form.year_manufactured} onChange={(e) => setForm((f) => ({ ...f, year_manufactured: e.target.value }))} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="p-short">Short description</Label>
            <Textarea id="p-short" rows={2} value={form.short_description} onChange={(e) => setForm((f) => ({ ...f, short_description: e.target.value }))} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="p-desc">Description</Label>
            <Textarea id="p-desc" rows={6} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
          </div>
          <TagListField id="p-features" label="Features" value={form.features} onChange={(v) => setForm((f) => ({ ...f, features: v }))} />
          <TagListField id="p-applications" label="Applications" value={form.applications} onChange={(v) => setForm((f) => ({ ...f, applications: v }))} />
          <div className="space-y-2">
            <Label htmlFor="p-delivery">Delivery info</Label>
            <Textarea id="p-delivery" rows={2} value={form.delivery_info} onChange={(e) => setForm((f) => ({ ...f, delivery_info: e.target.value }))} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="p-notes">Internal notes</Label>
            <Textarea id="p-notes" rows={2} value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} />
          </div>
        </TabsContent>

        <TabsContent value="pricing" className="space-y-4 pt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="p-price">Price</Label>
              <Input id="p-price" type="number" value={form.price} onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="p-currency">Currency</Label>
              <Input id="p-currency" value={form.currency} onChange={(e) => setForm((f) => ({ ...f, currency: e.target.value }))} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Price mode</Label>
            <Select value={form.price_mode} onValueChange={(v) => setForm((f) => ({ ...f, price_mode: v as ProductForm["price_mode"] }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="fixed">Fixed price</SelectItem>
                <SelectItem value="from">Starting from</SelectItem>
                <SelectItem value="quote">Price on request</SelectItem>
                <SelectItem value="hidden">Hidden</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <Switch id="p-on-sale" checked={form.on_sale} onCheckedChange={(v) => setForm((f) => ({ ...f, on_sale: v }))} />
            <Label htmlFor="p-on-sale">On sale</Label>
          </div>
        </TabsContent>

        <TabsContent value="media" className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="p-image-upload">Upload images</Label>
            <Input
              id="p-image-upload"
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => {
                if (e.target.files?.length) handleImageUpload(e.target.files);
              }}
            />
            {uploading ? <p className="text-xs text-muted-foreground">Uploading…</p> : null}
          </div>
          <div className="space-y-3">
            {images.map((img, i) => (
              <div key={img.id ?? img.url} className="flex gap-3 rounded-sm border border-border bg-card p-3">
                <img src={img.url} alt="" className="size-20 shrink-0 rounded-sm object-cover" />
                <div className="flex-1 space-y-2">
                  <Input
                    placeholder="Alt text"
                    value={img.alt_text}
                    onChange={(e) =>
                      setImages((prev) => prev.map((p, pi) => (pi === i ? { ...p, alt_text: e.target.value } : p)))
                    }
                  />
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant={img.is_primary ? "default" : "outline"}
                      size="sm"
                      onClick={() =>
                        setImages((prev) => prev.map((p, pi) => ({ ...p, is_primary: pi === i })))
                      }
                    >
                      <Star className="mr-1.5 size-3.5" /> Primary
                    </Button>
                    <Button type="button" variant="ghost" size="icon" onClick={() => moveImage(i, -1)} aria-label="Move up">
                      <ArrowUp className="size-4" />
                    </Button>
                    <Button type="button" variant="ghost" size="icon" onClick={() => moveImage(i, 1)} aria-label="Move down">
                      <ArrowDown className="size-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => setImages((prev) => prev.filter((_, pi) => pi !== i))}
                      aria-label="Remove image"
                    >
                      <Trash2 className="size-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            {!images.length ? <p className="text-sm text-muted-foreground">No images yet.</p> : null}
          </div>
        </TabsContent>

        <TabsContent value="specs" className="space-y-3 pt-4">
          {specs.map((spec, i) => (
            <div key={spec.id ?? i} className="flex gap-2">
              <Input
                placeholder="Label"
                value={spec.label}
                onChange={(e) => setSpecs((prev) => prev.map((s, si) => (si === i ? { ...s, label: e.target.value } : s)))}
              />
              <Input
                placeholder="Value"
                value={spec.value}
                onChange={(e) => setSpecs((prev) => prev.map((s, si) => (si === i ? { ...s, value: e.target.value } : s)))}
              />
              <Button type="button" variant="ghost" size="icon" onClick={() => setSpecs((prev) => prev.filter((_, si) => si !== i))} aria-label="Remove spec">
                <Trash2 className="size-4 text-destructive" />
              </Button>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setSpecs((prev) => [...prev, { label: "", value: "", sort_order: prev.length }])}
          >
            <Plus className="mr-1.5 size-4" /> Add spec
          </Button>
        </TabsContent>

        <TabsContent value="flags" className="space-y-4 pt-4">
          <div className="grid grid-cols-2 gap-4">
            {(
              [
                ["published", "Published"],
                ["featured", "Featured"],
                ["popular", "Popular"],
                ["is_new_arrival", "New arrival"],
              ] as const
            ).map(([key, label]) => (
              <div key={key} className="flex items-center gap-2">
                <Switch
                  id={`p-${key}`}
                  checked={form[key]}
                  onCheckedChange={(v) => setForm((f) => ({ ...f, [key]: v }))}
                />
                <Label htmlFor={`p-${key}`}>{label}</Label>
              </div>
            ))}
          </div>
          <div className="space-y-2">
            <Label htmlFor="p-sort">Sort order</Label>
            <Input id="p-sort" type="number" value={form.sort_order} onChange={(e) => setForm((f) => ({ ...f, sort_order: Number(e.target.value) }))} />
          </div>
        </TabsContent>

        <TabsContent value="seo" className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="p-seo-title">SEO title</Label>
            <Input id="p-seo-title" value={form.seo_title} onChange={(e) => setForm((f) => ({ ...f, seo_title: e.target.value }))} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="p-seo-desc">SEO description</Label>
            <Textarea id="p-seo-desc" rows={2} value={form.seo_description} onChange={(e) => setForm((f) => ({ ...f, seo_description: e.target.value }))} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="p-focus">Focus keyword</Label>
            <Input id="p-focus" value={form.focus_keyword} onChange={(e) => setForm((f) => ({ ...f, focus_keyword: e.target.value }))} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="p-og-image">OG image URL</Label>
            <Input id="p-og-image" value={form.og_image_url} onChange={(e) => setForm((f) => ({ ...f, og_image_url: e.target.value }))} />
          </div>
          <div className="rounded-sm border border-border bg-secondary/40 p-4">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Search preview</p>
            <p className="mt-2 truncate text-sm text-primary">{form.seo_title || form.name || "Product title"}</p>
            <p className="truncate text-xs text-muted-foreground">
              {form.seo_description || form.short_description || "Description preview…"}
            </p>
          </div>
        </TabsContent>
      </Tabs>

      <div className="mt-6 flex gap-3">
        <Button onClick={() => save.mutate()} disabled={save.isPending || !form.name || !form.slug}>
          {save.isPending ? "Saving…" : "Save product"}
        </Button>
        <Button variant="outline" onClick={() => navigate({ to: "/admin/products" })}>
          Cancel
        </Button>
      </div>
    </div>
  );
}
