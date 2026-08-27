import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Plus, Pencil } from "lucide-react";
import { toast } from "sonner";
import { deleteFaq, listFaqsAdmin, upsertFaq } from "@/lib/admin.functions";
import type { FaqRow } from "@/lib/catalog-data.server";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { ConfirmDeleteButton } from "@/components/admin/confirm-delete-button";

export const Route = createFileRoute("/_authenticated/admin/faqs")({
  ssr: false,
  component: FaqsAdminPage,
});

type FormState = {
  id?: string;
  question: string;
  answer: string;
  category: string;
  sort_order: number;
  published: boolean;
};

function emptyForm(): FormState {
  return { question: "", answer: "", category: "", sort_order: 0, published: true };
}

function toForm(row: FaqRow): FormState {
  return {
    id: row.id,
    question: row.question,
    answer: row.answer,
    category: row.category ?? "",
    sort_order: row.sort_order,
    published: row.published,
  };
}

function FaqsAdminPage() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["admin-faqs"], queryFn: () => listFaqsAdmin() });
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm());

  const save = useMutation({
    mutationFn: () =>
      upsertFaq({
        data: {
          id: form.id,
          question: form.question,
          answer: form.answer,
          category: form.category || null,
          sort_order: form.sort_order,
          published: form.published,
        },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-faqs"] });
      toast.success("FAQ saved");
      setOpen(false);
    },
    onError: (e) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: (id: string) => deleteFaq({ data: { id } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-faqs"] });
      toast.success("FAQ deleted");
    },
    onError: (e) => toast.error(e.message),
  });

  function openNew() {
    setForm(emptyForm());
    setOpen(true);
  }
  function openEdit(row: FaqRow) {
    setForm(toForm(row));
    setOpen(true);
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl font-bold uppercase">FAQs</h1>
        <Button onClick={openNew}>
          <Plus className="mr-1.5 size-4" /> Add FAQ
        </Button>
      </div>

      <div className="mt-6 overflow-hidden rounded-sm border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-secondary/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-2.5">Question</th>
              <th className="px-4 py-2.5">Category</th>
              <th className="px-4 py-2.5">Status</th>
              <th className="px-4 py-2.5" />
            </tr>
          </thead>
          <tbody>
            {(data ?? []).map((row) => (
              <tr key={row.id} className="border-t border-border">
                <td className="px-4 py-2.5 font-medium">{row.question}</td>
                <td className="px-4 py-2.5 text-muted-foreground">{row.category ?? "—"}</td>
                <td className="px-4 py-2.5">
                  <Badge variant={row.published ? "default" : "secondary"}>
                    {row.published ? "Published" : "Draft"}
                  </Badge>
                </td>
                <td className="px-4 py-2.5 text-right">
                  <Button variant="ghost" size="icon" onClick={() => openEdit(row)} aria-label="Edit">
                    <Pencil className="size-4" />
                  </Button>
                  <ConfirmDeleteButton label={row.question} onConfirm={() => remove.mutate(row.id)} />
                </td>
              </tr>
            ))}
            {!isLoading && !(data ?? []).length ? (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-muted-foreground">
                  No FAQs yet.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>{form.id ? "Edit FAQ" : "New FAQ"}</SheetTitle>
          </SheetHeader>
          <div className="mt-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="faq-question">Question</Label>
              <Input id="faq-question" value={form.question} onChange={(e) => setForm((f) => ({ ...f, question: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="faq-answer">Answer</Label>
              <Textarea id="faq-answer" rows={5} value={form.answer} onChange={(e) => setForm((f) => ({ ...f, answer: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="faq-category">Category</Label>
              <Input id="faq-category" value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="faq-sort">Sort order</Label>
                <Input id="faq-sort" type="number" value={form.sort_order} onChange={(e) => setForm((f) => ({ ...f, sort_order: Number(e.target.value) }))} />
              </div>
              <div className="flex items-center gap-2 pt-6">
                <Switch id="faq-published" checked={form.published} onCheckedChange={(v) => setForm((f) => ({ ...f, published: v }))} />
                <Label htmlFor="faq-published">Published</Label>
              </div>
            </div>
          </div>
          <SheetFooter className="mt-6">
            <Button onClick={() => save.mutate()} disabled={save.isPending || !form.question || !form.answer}>
              {save.isPending ? "Saving…" : "Save FAQ"}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}
