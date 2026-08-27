import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Plus, Pencil } from "lucide-react";
import { toast } from "sonner";
import { deleteVideo, listVideosAdmin, upsertVideo } from "@/lib/admin.functions";
import type { VideoRow } from "@/lib/catalog-data.server";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { ConfirmDeleteButton } from "@/components/admin/confirm-delete-button";
import { storageProxyUrl } from "@/lib/media-url";

export const Route = createFileRoute("/_authenticated/admin/videos")({
  ssr: false,
  component: VideosAdminPage,
});

type FormState = {
  id?: string;
  title: string;
  description: string;
  video_url: string;
  poster_url: string;
  placement: string;
  enabled: boolean;
  homepage_featured: boolean;
  sort_order: number;
};

function emptyForm(): FormState {
  return {
    title: "",
    description: "",
    video_url: "",
    poster_url: "",
    placement: "home",
    enabled: true,
    homepage_featured: false,
    sort_order: 0,
  };
}

function toForm(row: VideoRow): FormState {
  return {
    id: row.id,
    title: row.title,
    description: row.description ?? "",
    video_url: row.video_url,
    poster_url: row.poster_url ?? "",
    placement: row.placement,
    enabled: row.enabled,
    homepage_featured: row.homepage_featured,
    sort_order: row.sort_order,
  };
}

function VideosAdminPage() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["admin-videos"], queryFn: () => listVideosAdmin() });
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm());
  const [uploading, setUploading] = useState(false);

  const save = useMutation({
    mutationFn: () =>
      upsertVideo({
        data: {
          id: form.id,
          title: form.title,
          description: form.description || null,
          video_url: form.video_url,
          poster_url: form.poster_url || null,
          placement: form.placement,
          enabled: form.enabled,
          homepage_featured: form.homepage_featured,
          sort_order: form.sort_order,
        },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-videos"] });
      toast.success("Video saved");
      setOpen(false);
    },
    onError: (e) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: (id: string) => deleteVideo({ data: { id } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-videos"] });
      toast.success("Video deleted");
    },
    onError: (e) => toast.error(e.message),
  });

  async function handleVideoUpload(file: File) {
    setUploading(true);
    try {
      const path = `${Date.now()}-${file.name}`;
      const { error } = await supabase.storage.from("videos").upload(path, file);
      if (error) throw error;
      const publicUrl = storageProxyUrl("videos", path);
      setForm((f) => ({ ...f, video_url: publicUrl }));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function handlePosterUpload(file: File) {
    setUploading(true);
    try {
      const path = `posters/${Date.now()}-${file.name}`;
      const { error } = await supabase.storage.from("media").upload(path, file);
      if (error) throw error;
      const publicUrl = storageProxyUrl("media", path);
      setForm((f) => ({ ...f, poster_url: publicUrl }));
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
  function openEdit(row: VideoRow) {
    setForm(toForm(row));
    setOpen(true);
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl font-bold uppercase">Videos</h1>
        <Button onClick={openNew}>
          <Plus className="mr-1.5 size-4" /> Add video
        </Button>
      </div>

      <div className="mt-6 overflow-x-auto rounded-sm border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-secondary/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-2.5">Title</th>
              <th className="px-4 py-2.5">Placement</th>
              <th className="px-4 py-2.5">Status</th>
              <th className="px-4 py-2.5" />
            </tr>
          </thead>
          <tbody>
            {(data ?? []).map((row) => (
              <tr key={row.id} className="border-t border-border">
                <td className="px-4 py-2.5 font-medium">{row.title}</td>
                <td className="px-4 py-2.5 text-muted-foreground">{row.placement}</td>
                <td className="px-4 py-2.5">
                  <Badge variant={row.enabled ? "default" : "secondary"}>
                    {row.enabled ? "Enabled" : "Disabled"}
                  </Badge>
                </td>
                <td className="px-4 py-2.5 text-right">
                  <Button variant="ghost" size="icon" onClick={() => openEdit(row)} aria-label="Edit">
                    <Pencil className="size-4" />
                  </Button>
                  <ConfirmDeleteButton label={row.title} onConfirm={() => remove.mutate(row.id)} />
                </td>
              </tr>
            ))}
            {!isLoading && !(data ?? []).length ? (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-muted-foreground">
                  No videos yet.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>{form.id ? "Edit video" : "New video"}</SheetTitle>
          </SheetHeader>
          <div className="mt-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="video-title">Title</Label>
              <Input id="video-title" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="video-desc">Description</Label>
              <Textarea id="video-desc" rows={3} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="video-url">Video URL</Label>
              <Input id="video-url" value={form.video_url} onChange={(e) => setForm((f) => ({ ...f, video_url: e.target.value }))} placeholder="Paste a URL or upload below" />
              <div className="flex items-center gap-3">
                <Input
                  type="file"
                  accept="video/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleVideoUpload(file);
                  }}
                />
                {uploading ? <span className="text-xs text-muted-foreground">Uploading…</span> : null}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="video-poster">Poster image</Label>
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handlePosterUpload(file);
                }}
              />
              {form.poster_url ? (
                <img src={form.poster_url} alt="" className="mt-2 aspect-video w-full rounded-sm object-cover" />
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="video-placement">Placement</Label>
              <Input id="video-placement" value={form.placement} onChange={(e) => setForm((f) => ({ ...f, placement: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="video-sort">Sort order</Label>
                <Input id="video-sort" type="number" value={form.sort_order} onChange={(e) => setForm((f) => ({ ...f, sort_order: Number(e.target.value) }))} />
              </div>
            </div>
            <div className="flex flex-wrap gap-6">
              <div className="flex items-center gap-2">
                <Switch id="video-enabled" checked={form.enabled} onCheckedChange={(v) => setForm((f) => ({ ...f, enabled: v }))} />
                <Label htmlFor="video-enabled">Enabled</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch id="video-featured" checked={form.homepage_featured} onCheckedChange={(v) => setForm((f) => ({ ...f, homepage_featured: v }))} />
                <Label htmlFor="video-featured">Homepage featured</Label>
              </div>
            </div>
          </div>
          <SheetFooter className="mt-6">
            <Button onClick={() => save.mutate()} disabled={save.isPending || !form.title || !form.video_url}>
              {save.isPending ? "Saving…" : "Save video"}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}
