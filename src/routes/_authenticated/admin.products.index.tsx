import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Plus, Pencil, Copy } from "lucide-react";
import { toast } from "sonner";
import {
  deleteProduct,
  duplicateProduct,
  listCategoriesAdmin,
  listProductsAdmin,
  listSizesAdmin,
  listTypesAdmin,
  setProductPublished,
} from "@/lib/admin.functions";
import { conditionLabel, formatPrice } from "@/lib/site";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ConfirmDeleteButton } from "@/components/admin/confirm-delete-button";

export const Route = createFileRoute("/_authenticated/admin/products/")({
  ssr: false,
  component: ProductsAdminIndex,
});

function ProductsAdminIndex() {
  const queryClient = useQueryClient();
  const { data: productsData, isLoading } = useQuery({
    queryKey: ["admin-products"],
    queryFn: () => listProductsAdmin(),
  });
  const { data: types } = useQuery({ queryKey: ["admin-types"], queryFn: () => listTypesAdmin() });
  const { data: sizes } = useQuery({ queryKey: ["admin-sizes"], queryFn: () => listSizesAdmin() });
  const { data: categories } = useQuery({ queryKey: ["admin-categories"], queryFn: () => listCategoriesAdmin() });

  const [q, setQ] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [sizeFilter, setSizeFilter] = useState("all");
  const [conditionFilter, setConditionFilter] = useState("all");
  const [publishedFilter, setPublishedFilter] = useState("all");

  const products = productsData?.products;
  const typeById = useMemo(() => new Map((types ?? []).map((t) => [t.id, t.name])), [types]);
  const sizeById = useMemo(() => new Map((sizes ?? []).map((s) => [s.id, s.name])), [sizes]);
  const categoryById = useMemo(() => new Map((categories ?? []).map((c) => [c.id, c.name])), [categories]);
  const imageByProduct = useMemo(() => {
    const map = new Map<string, string>();
    for (const img of productsData?.images ?? []) {
      if (!map.has(img.product_id) || img.is_primary) map.set(img.product_id, img.url);
    }
    return map;
  }, [productsData]);

  const filtered = useMemo(() => {
    return (products ?? []).filter((p) => {
      if (typeFilter !== "all" && p.type_id !== typeFilter) return false;
      if (sizeFilter !== "all" && p.size_id !== sizeFilter) return false;
      if (conditionFilter !== "all" && p.condition !== conditionFilter) return false;
      if (publishedFilter === "published" && !p.published) return false;
      if (publishedFilter === "draft" && p.published) return false;
      if (q) {
        const term = q.toLowerCase();
        if (!`${p.name} ${p.sku ?? ""}`.toLowerCase().includes(term)) return false;
      }
      return true;
    });
  }, [products, typeFilter, sizeFilter, conditionFilter, publishedFilter, q]);

  const togglePublished = useMutation({
    mutationFn: (input: { id: string; published: boolean }) => setProductPublished({ data: input }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-products"] }),
    onError: (e) => toast.error(e.message),
  });

  const duplicate = useMutation({
    mutationFn: (id: string) => duplicateProduct({ data: { id } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      toast.success("Product duplicated");
    },
    onError: (e) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: (id: string) => deleteProduct({ data: { id } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      toast.success("Product deleted");
    },
    onError: (e) => toast.error(e.message),
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl font-bold uppercase">Products</h1>
        <Button asChild>
          <Link to="/admin/products/new">
            <Plus className="mr-1.5 size-4" /> Add product
          </Link>
        </Button>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <Input
          placeholder="Search name or SKU…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="w-56"
        />
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-44"><SelectValue placeholder="Type" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            {(types ?? []).map((t) => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={sizeFilter} onValueChange={setSizeFilter}>
          <SelectTrigger className="w-44"><SelectValue placeholder="Size" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All sizes</SelectItem>
            {(sizes ?? []).map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={conditionFilter} onValueChange={setConditionFilter}>
          <SelectTrigger className="w-36"><SelectValue placeholder="Condition" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All conditions</SelectItem>
            <SelectItem value="new">New</SelectItem>
            <SelectItem value="used">Used</SelectItem>
          </SelectContent>
        </Select>
        <Select value={publishedFilter} onValueChange={setPublishedFilter}>
          <SelectTrigger className="w-36"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="published">Published</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="mt-6 overflow-x-auto rounded-sm border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-secondary/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-2.5">Product</th>
              <th className="px-4 py-2.5">SKU</th>
              <th className="px-4 py-2.5">Type</th>
              <th className="px-4 py-2.5">Size</th>
              <th className="px-4 py-2.5">Condition</th>
              <th className="px-4 py-2.5">Price</th>
              <th className="px-4 py-2.5">Status</th>
              <th className="px-4 py-2.5" />
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr key={p.id} className="border-t border-border">
                <td className="px-4 py-2.5">
                  <div className="flex items-center gap-3">
                    <div className="size-10 shrink-0 overflow-hidden rounded-sm bg-muted">
                      {imageByProduct.get(p.id) ? (
                        <img src={imageByProduct.get(p.id)} alt="" className="size-full object-cover" />
                      ) : null}
                    </div>
                    <div>
                      <p className="font-medium">{p.name}</p>
                      {categoryById.get(p.category_id ?? "") ? (
                        <p className="text-xs text-muted-foreground">{categoryById.get(p.category_id ?? "")}</p>
                      ) : null}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-2.5 text-muted-foreground">{p.sku ?? "—"}</td>
                <td className="px-4 py-2.5 text-muted-foreground">{typeById.get(p.type_id ?? "") ?? "—"}</td>
                <td className="px-4 py-2.5 text-muted-foreground">{sizeById.get(p.size_id ?? "") ?? "—"}</td>
                <td className="px-4 py-2.5 text-muted-foreground">{conditionLabel(p.condition)}</td>
                <td className="px-4 py-2.5 text-muted-foreground">{formatPrice(p.price, p.price_mode, p.currency)}</td>
                <td className="px-4 py-2.5">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={p.published}
                      onCheckedChange={(v) => togglePublished.mutate({ id: p.id, published: v })}
                      aria-label="Toggle published"
                    />
                    {p.featured ? <Badge variant="outline">Featured</Badge> : null}
                  </div>
                </td>
                <td className="px-4 py-2.5 text-right whitespace-nowrap">
                  <Button variant="ghost" size="icon" asChild aria-label="Edit">
                    <Link to="/admin/products/$id" params={{ id: p.id }}>
                      <Pencil className="size-4" />
                    </Link>
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => duplicate.mutate(p.id)} aria-label="Duplicate">
                    <Copy className="size-4" />
                  </Button>
                  <ConfirmDeleteButton label={p.name} onConfirm={() => remove.mutate(p.id)} />
                </td>
              </tr>
            ))}
            {!isLoading && !filtered.length ? (
              <tr>
                <td colSpan={8} className="px-4 py-6 text-center text-muted-foreground">
                  No products match.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
