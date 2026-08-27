import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { getHomeAdmin, updateHomeContent } from "@/lib/admin.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/_authenticated/admin/home")({
  ssr: false,
  component: HomeAdminPage,
});

type Benefit = { title: string; body: string };

type FormState = {
  hero_heading: string;
  hero_subheading: string;
  hero_primary_cta: string;
  hero_secondary_cta: string;
  hero_image_url: string;
  shipping_section_image_url: string;
  cta_section_image_url: string;
  about_image_url: string;
  benefits: Benefit[];
  shipping_heading: string;
  shipping_body: string;
  video_heading: string;
  video_body: string;
};

function emptyForm(): FormState {
  return {
    hero_heading: "",
    hero_subheading: "",
    hero_primary_cta: "",
    hero_secondary_cta: "",
    hero_image_url: "",
    shipping_section_image_url: "",
    cta_section_image_url: "",
    about_image_url: "",
    benefits: [],
    shipping_heading: "",
    shipping_body: "",
    video_heading: "",
    video_body: "",
  };
}

function HomeAdminPage() {
  const queryClient = useQueryClient();
  const { data } = useQuery({ queryKey: ["admin-home"], queryFn: () => getHomeAdmin() });
  const [form, setForm] = useState<FormState>(emptyForm());
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!data || loaded) return;
    setForm({
      hero_heading: data.hero_heading,
      hero_subheading: data.hero_subheading ?? "",
      hero_primary_cta: data.hero_primary_cta,
      hero_secondary_cta: data.hero_secondary_cta,
      hero_image_url: data.hero_image_url ?? "",
      shipping_section_image_url: data.shipping_section_image_url ?? "",
      cta_section_image_url: data.cta_section_image_url ?? "",
      about_image_url: data.about_image_url ?? "",
      benefits: Array.isArray(data.benefits) ? (data.benefits as Benefit[]) : [],
      shipping_heading: data.shipping_heading ?? "",
      shipping_body: data.shipping_body ?? "",
      video_heading: data.video_heading ?? "",
      video_body: data.video_body ?? "",
    });
    setLoaded(true);
  }, [data, loaded]);

  const save = useMutation({
    mutationFn: () =>
      updateHomeContent({
        data: {
          hero_heading: form.hero_heading,
          hero_subheading: form.hero_subheading || null,
          hero_primary_cta: form.hero_primary_cta,
          hero_secondary_cta: form.hero_secondary_cta,
          hero_image_url: form.hero_image_url || null,
          shipping_section_image_url: form.shipping_section_image_url || null,
          cta_section_image_url: form.cta_section_image_url || null,
          about_image_url: form.about_image_url || null,
          benefits: form.benefits,
          shipping_heading: form.shipping_heading || null,
          shipping_body: form.shipping_body || null,
          video_heading: form.video_heading || null,
          video_body: form.video_body || null,
        },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-home"] });
      queryClient.invalidateQueries({ queryKey: ["home"] });
      toast.success("Homepage content saved");
    },
    onError: (e) => toast.error(e.message),
  });

  function updateBenefit(index: number, patch: Partial<Benefit>) {
    setForm((f) => ({
      ...f,
      benefits: f.benefits.map((b, i) => (i === index ? { ...b, ...patch } : b)),
    }));
  }

  function addBenefit() {
    setForm((f) => ({ ...f, benefits: [...f.benefits, { title: "", body: "" }] }));
  }

  function removeBenefit(index: number) {
    setForm((f) => ({ ...f, benefits: f.benefits.filter((_, i) => i !== index) }));
  }

  return (
    <div className="max-w-2xl">
      <h1 className="font-display text-3xl font-bold uppercase">Homepage Content</h1>

      <div className="mt-6 space-y-4">
        <h2 className="font-display text-lg font-bold uppercase text-primary">Hero</h2>
        <div className="space-y-2">
          <Label htmlFor="h-heading">Heading</Label>
          <Input id="h-heading" value={form.hero_heading} onChange={(e) => setForm((f) => ({ ...f, hero_heading: e.target.value }))} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="h-subheading">Subheading</Label>
          <Textarea id="h-subheading" rows={2} value={form.hero_subheading} onChange={(e) => setForm((f) => ({ ...f, hero_subheading: e.target.value }))} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="h-primary-cta">Primary CTA label</Label>
            <Input id="h-primary-cta" value={form.hero_primary_cta} onChange={(e) => setForm((f) => ({ ...f, hero_primary_cta: e.target.value }))} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="h-secondary-cta">Secondary CTA label</Label>
            <Input id="h-secondary-cta" value={form.hero_secondary_cta} onChange={(e) => setForm((f) => ({ ...f, hero_secondary_cta: e.target.value }))} />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="h-hero-image">Hero image URL</Label>
          <Input id="h-hero-image" value={form.hero_image_url} onChange={(e) => setForm((f) => ({ ...f, hero_image_url: e.target.value }))} />
        </div>

        <h2 className="pt-4 font-display text-lg font-bold uppercase text-primary">Images</h2>
        <div className="space-y-2">
          <Label htmlFor="h-shipping-image">Shipping section image URL</Label>
          <Input id="h-shipping-image" value={form.shipping_section_image_url} onChange={(e) => setForm((f) => ({ ...f, shipping_section_image_url: e.target.value }))} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="h-cta-image">CTA section image URL</Label>
          <Input id="h-cta-image" value={form.cta_section_image_url} onChange={(e) => setForm((f) => ({ ...f, cta_section_image_url: e.target.value }))} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="h-about-image">About image URL</Label>
          <Input id="h-about-image" value={form.about_image_url} onChange={(e) => setForm((f) => ({ ...f, about_image_url: e.target.value }))} />
        </div>

        <h2 className="pt-4 font-display text-lg font-bold uppercase text-primary">Benefits</h2>
        <div className="space-y-3">
          {form.benefits.map((b, i) => (
            <div key={i} className="flex gap-2 rounded-sm border border-border bg-card p-3">
              <div className="flex-1 space-y-2">
                <Input
                  placeholder="Title"
                  value={b.title}
                  onChange={(e) => updateBenefit(i, { title: e.target.value })}
                />
                <Textarea
                  placeholder="Body"
                  rows={2}
                  value={b.body}
                  onChange={(e) => updateBenefit(i, { body: e.target.value })}
                />
              </div>
              <Button variant="ghost" size="icon" onClick={() => removeBenefit(i)} aria-label="Remove benefit">
                <Trash2 className="size-4 text-destructive" />
              </Button>
            </div>
          ))}
          <Button variant="outline" size="sm" onClick={addBenefit}>
            <Plus className="mr-1.5 size-4" /> Add benefit
          </Button>
        </div>

        <h2 className="pt-4 font-display text-lg font-bold uppercase text-primary">Shipping section</h2>
        <div className="space-y-2">
          <Label htmlFor="h-shipping-heading">Heading</Label>
          <Input id="h-shipping-heading" value={form.shipping_heading} onChange={(e) => setForm((f) => ({ ...f, shipping_heading: e.target.value }))} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="h-shipping-body">Body</Label>
          <Textarea id="h-shipping-body" rows={3} value={form.shipping_body} onChange={(e) => setForm((f) => ({ ...f, shipping_body: e.target.value }))} />
        </div>

        <h2 className="pt-4 font-display text-lg font-bold uppercase text-primary">Video section</h2>
        <div className="space-y-2">
          <Label htmlFor="h-video-heading">Heading</Label>
          <Input id="h-video-heading" value={form.video_heading} onChange={(e) => setForm((f) => ({ ...f, video_heading: e.target.value }))} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="h-video-body">Body</Label>
          <Textarea id="h-video-body" rows={3} value={form.video_body} onChange={(e) => setForm((f) => ({ ...f, video_body: e.target.value }))} />
        </div>
      </div>

      <div className="mt-6">
        <Button onClick={() => save.mutate()} disabled={save.isPending}>
          {save.isPending ? "Saving…" : "Save homepage content"}
        </Button>
      </div>
    </div>
  );
}
