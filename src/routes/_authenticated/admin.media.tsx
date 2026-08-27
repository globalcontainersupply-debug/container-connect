import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Upload, Copy } from "lucide-react";
import { toast } from "sonner";
import { deleteMedia, listMediaAdmin, upsertMedia } from "@/lib/admin.functions";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ConfirmDeleteButton } from "@/components/admin/confirm-delete-button";

export const Route = createFileRoute("/_authenticated/admin/media")({
  ssr: false,
  component: MediaAdminPage,
});

function MediaAdminPage() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["admin-media"], queryFn: () => listMediaAdmin() });
  const [uploading, setUploading] = useState(false);
  const [altText, setAltText] = useState("");

  const remove = useMutation({
    mutationFn: (id: string) => deleteMedia({ data: { id } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-media"] });
      toast.success("Media deleted");
    },
    onError: (e) => toast.error(e.message),
  });

  const save = useMutation({
    mutationFn: (input: { file_name: string; url: string; media_type: string; alt_text: string | null }) =>
      upsertMedia({ data: { ...input, description: null } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-media"] });
      toast.success("Media uploaded");
    },
    onError: (e) => toast.error(e.message),
  });

  async function handleUpload(file: File) {
    setUploading(true);
    try {
      const path = `library/${Date.now()}-${file.name}`;
      const { error } = await supabase.storage.from("media").upload(path, file);
      if (error) throw error;
      const { data: pub } = supabase.storage.from("media").getPublicUrl(path);
      const mediaType = file.type.startsWith("video/") ? "video" : "image";
      await save.mutateAsync({
        file_name: file.name,
        url: pub.publicUrl,
        media_type: mediaType,
        alt_text: altText || null,
      });
      setAltText("");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  function copyUrl(url: string) {
    navigator.clipboard.writeText(url);
    toast.success("URL copied");
  }

  return (
    <div>
      <h1 className="font-display text-3xl font-bold uppercase">Media Library</h1>

      <div className="mt-6 flex flex-wrap items-end gap-3 rounded-sm border border-border bg-card p-5">
        <div className="space-y-2">
          <Label htmlFor="media-alt">Alt text (optional, applies to next upload)</Label>
          <Input id="media-alt" value={altText} onChange={(e) => setAltText(e.target.value)} className="w-72" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="media-file">Upload file</Label>
          <Input
            id="media-file"
            type="file"
            accept="image/*,video/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleUpload(file);
            }}
          />
        </div>
        {uploading ? (
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Upload className="size-3.5 animate-pulse" /> Uploading…
          </span>
        ) : null}
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {(data ?? []).map((item) => (
          <div key={item.id} className="overflow-hidden rounded-sm border border-border bg-card">
            <div className="aspect-square bg-muted">
              {item.media_type === "image" ? (
                <img src={item.url} alt={item.alt_text ?? ""} className="size-full object-cover" />
              ) : (
                <video src={item.url} className="size-full object-cover" muted />
              )}
            </div>
            <div className="p-3">
              <p className="truncate text-xs font-medium">{item.file_name}</p>
              <div className="mt-2 flex items-center justify-between">
                <Button variant="ghost" size="icon" onClick={() => copyUrl(item.url)} aria-label="Copy URL">
                  <Copy className="size-4" />
                </Button>
                <ConfirmDeleteButton label={item.file_name} onConfirm={() => remove.mutate(item.id)} />
              </div>
            </div>
          </div>
        ))}
        {!isLoading && !(data ?? []).length ? (
          <p className="col-span-full py-10 text-center text-muted-foreground">No media uploaded yet.</p>
        ) : null}
      </div>
    </div>
  );
}
