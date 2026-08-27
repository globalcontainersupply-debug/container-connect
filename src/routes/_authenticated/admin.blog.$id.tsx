import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { listPostsAdmin, upsertPost } from "@/lib/admin.functions";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { TagListField } from "@/components/admin/tag-list-field";
import { storageProxyUrl } from "@/lib/media-url";

export const Route = createFileRoute("/_authenticated/admin/blog/$id")({
  ssr: false,
  component: BlogEditorPage,
});

type FormState = {
  id?: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  featured_image_url: string;
  author: string;
  category: string;
  tags: string[];
  published: boolean;
  published_at: string;
  seo_title: string;
  seo_description: string;
};

function emptyForm(): FormState {
  return {
    slug: "",
    title: "",
    excerpt: "",
    content: "",
    featured_image_url: "",
    author: "",
    category: "",
    tags: [],
    published: true,
    published_at: new Date().toISOString().slice(0, 16),
    seo_title: "",
    seo_description: "",
  };
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function BlogEditorPage() {
  const { id } = Route.useParams();
  const isNew = id === "new";
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: posts } = useQuery({ queryKey: ["admin-posts"], queryFn: () => listPostsAdmin() });
  const [form, setForm] = useState<FormState>(emptyForm());
  const [slugTouched, setSlugTouched] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (isNew || !posts) return;
    const post = posts.find((p) => p.id === id);
    if (post) {
      setForm({
        id: post.id,
        slug: post.slug,
        title: post.title,
        excerpt: post.excerpt ?? "",
        content: post.content,
        featured_image_url: post.featured_image_url ?? "",
        author: post.author ?? "",
        category: post.category ?? "",
        tags: post.tags,
        published: post.published,
        published_at: post.published_at.slice(0, 16),
        seo_title: post.seo_title ?? "",
        seo_description: post.seo_description ?? "",
      });
      setSlugTouched(true);
    }
  }, [isNew, posts, id]);

  const save = useMutation({
    mutationFn: () =>
      upsertPost({
        data: {
          id: form.id,
          slug: form.slug,
          title: form.title,
          excerpt: form.excerpt || null,
          content: form.content,
          featured_image_url: form.featured_image_url || null,
          author: form.author || null,
          category: form.category || null,
          tags: form.tags,
          published: form.published,
          published_at: new Date(form.published_at).toISOString(),
          seo_title: form.seo_title || null,
          seo_description: form.seo_description || null,
        },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-posts"] });
      toast.success("Post saved");
      navigate({ to: "/admin/blog" });
    },
    onError: (e) => toast.error(e.message),
  });

  async function handleImageUpload(file: File) {
    setUploading(true);
    try {
      const path = `blog/${Date.now()}-${file.name}`;
      const { error } = await supabase.storage.from("media").upload(path, file);
      if (error) throw error;
      const publicUrl = storageProxyUrl("media", path);
      setForm((f) => ({ ...f, featured_image_url: publicUrl }));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="max-w-3xl">
      <h1 className="font-display text-3xl font-bold uppercase">
        {isNew ? "New blog post" : "Edit blog post"}
      </h1>

      <div className="mt-6 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="post-title">Title</Label>
          <Input
            id="post-title"
            value={form.title}
            onChange={(e) => {
              const title = e.target.value;
              setForm((f) => ({ ...f, title, slug: slugTouched ? f.slug : slugify(title) }));
            }}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="post-slug">Slug</Label>
          <Input
            id="post-slug"
            value={form.slug}
            onChange={(e) => {
              setSlugTouched(true);
              setForm((f) => ({ ...f, slug: e.target.value }));
            }}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="post-excerpt">Excerpt</Label>
          <Textarea id="post-excerpt" rows={2} value={form.excerpt} onChange={(e) => setForm((f) => ({ ...f, excerpt: e.target.value }))} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="post-content">Content</Label>
          <Textarea id="post-content" rows={12} value={form.content} onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))} />
          <p className="text-xs text-muted-foreground">Separate paragraphs with a blank line.</p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="post-image">Featured image</Label>
          <div className="flex items-center gap-3">
            <Input
              id="post-image"
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleImageUpload(file);
              }}
            />
            {uploading ? <span className="text-xs text-muted-foreground">Uploading…</span> : null}
          </div>
          {form.featured_image_url ? (
            <img src={form.featured_image_url} alt="" className="mt-2 aspect-[16/9] w-full max-w-sm rounded-sm object-cover" />
          ) : null}
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="post-author">Author</Label>
            <Input id="post-author" value={form.author} onChange={(e) => setForm((f) => ({ ...f, author: e.target.value }))} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="post-category">Category</Label>
            <Input id="post-category" value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} />
          </div>
        </div>
        <TagListField id="post-tags" label="Tags" value={form.tags} onChange={(v) => setForm((f) => ({ ...f, tags: v }))} />
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="post-published-at">Published at</Label>
            <Input id="post-published-at" type="datetime-local" value={form.published_at} onChange={(e) => setForm((f) => ({ ...f, published_at: e.target.value }))} />
          </div>
          <div className="flex items-center gap-2 pt-6">
            <Switch id="post-published" checked={form.published} onCheckedChange={(v) => setForm((f) => ({ ...f, published: v }))} />
            <Label htmlFor="post-published">Published</Label>
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="post-seo-title">SEO title</Label>
          <Input id="post-seo-title" value={form.seo_title} onChange={(e) => setForm((f) => ({ ...f, seo_title: e.target.value }))} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="post-seo-desc">SEO description</Label>
          <Textarea id="post-seo-desc" rows={2} value={form.seo_description} onChange={(e) => setForm((f) => ({ ...f, seo_description: e.target.value }))} />
        </div>
      </div>

      <div className="mt-6 flex gap-3">
        <Button onClick={() => save.mutate()} disabled={save.isPending || !form.title || !form.slug || !form.content}>
          {save.isPending ? "Saving…" : "Save post"}
        </Button>
        <Button variant="outline" onClick={() => navigate({ to: "/admin/blog" })}>
          Cancel
        </Button>
      </div>
    </div>
  );
}
