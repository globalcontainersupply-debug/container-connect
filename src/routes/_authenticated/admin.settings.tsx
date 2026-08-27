import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { getSettingsAdmin, updateSiteSettings } from "@/lib/admin.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/_authenticated/admin/settings")({
  ssr: false,
  component: SettingsAdminPage,
});

type FormState = {
  company_name: string;
  company_email: string;
  phone: string;
  address: string;
  business_hours: string;
  logo_url: string;
  favicon_url: string;
  currency: string;
  default_seo_title: string;
  default_seo_description: string;
  default_social_image: string;
  footer_text: string;
  social_links: string;
};

function emptyForm(): FormState {
  return {
    company_name: "",
    company_email: "",
    phone: "",
    address: "",
    business_hours: "",
    logo_url: "",
    favicon_url: "",
    currency: "USD",
    default_seo_title: "",
    default_seo_description: "",
    default_social_image: "",
    footer_text: "",
    social_links: "{}",
  };
}

function SettingsAdminPage() {
  const queryClient = useQueryClient();
  const { data } = useQuery({ queryKey: ["admin-settings"], queryFn: () => getSettingsAdmin() });
  const [form, setForm] = useState<FormState>(emptyForm());
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!data || loaded) return;
    setForm({
      company_name: data.company_name,
      company_email: data.company_email,
      phone: data.phone ?? "",
      address: data.address ?? "",
      business_hours: data.business_hours ?? "",
      logo_url: data.logo_url ?? "",
      favicon_url: data.favicon_url ?? "",
      currency: data.currency,
      default_seo_title: data.default_seo_title ?? "",
      default_seo_description: data.default_seo_description ?? "",
      default_social_image: data.default_social_image ?? "",
      footer_text: data.footer_text ?? "",
      social_links: JSON.stringify(data.social_links ?? {}, null, 2),
    });
    setLoaded(true);
  }, [data, loaded]);

  const save = useMutation({
    mutationFn: () => {
      let socialLinks: Record<string, string> = {};
      try {
        socialLinks = JSON.parse(form.social_links || "{}");
      } catch {
        throw new Error("Social links must be valid JSON");
      }
      return updateSiteSettings({
        data: {
          company_name: form.company_name,
          company_email: form.company_email,
          phone: form.phone || null,
          address: form.address || null,
          business_hours: form.business_hours || null,
          logo_url: form.logo_url || null,
          favicon_url: form.favicon_url || null,
          currency: form.currency,
          default_seo_title: form.default_seo_title || null,
          default_seo_description: form.default_seo_description || null,
          default_social_image: form.default_social_image || null,
          footer_text: form.footer_text || null,
          social_links: socialLinks,
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-settings"] });
      queryClient.invalidateQueries({ queryKey: ["site-chrome"] });
      toast.success("Settings saved");
    },
    onError: (e) => toast.error(e.message),
  });

  return (
    <div className="max-w-2xl">
      <h1 className="font-display text-3xl font-bold uppercase">Site Settings</h1>

      <div className="mt-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="s-name">Company name</Label>
            <Input id="s-name" value={form.company_name} onChange={(e) => setForm((f) => ({ ...f, company_name: e.target.value }))} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="s-email">Company email</Label>
            <Input id="s-email" type="email" value={form.company_email} onChange={(e) => setForm((f) => ({ ...f, company_email: e.target.value }))} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="s-phone">Phone</Label>
            <Input id="s-phone" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="s-currency">Currency</Label>
            <Input id="s-currency" value={form.currency} onChange={(e) => setForm((f) => ({ ...f, currency: e.target.value }))} />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="s-address">Address</Label>
          <Textarea id="s-address" rows={2} value={form.address} onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="s-hours">Business hours</Label>
          <Input id="s-hours" value={form.business_hours} onChange={(e) => setForm((f) => ({ ...f, business_hours: e.target.value }))} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="s-logo">Logo URL</Label>
            <Input id="s-logo" value={form.logo_url} onChange={(e) => setForm((f) => ({ ...f, logo_url: e.target.value }))} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="s-favicon">Favicon URL</Label>
            <Input id="s-favicon" value={form.favicon_url} onChange={(e) => setForm((f) => ({ ...f, favicon_url: e.target.value }))} />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="s-seo-title">Default SEO title</Label>
          <Input id="s-seo-title" value={form.default_seo_title} onChange={(e) => setForm((f) => ({ ...f, default_seo_title: e.target.value }))} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="s-seo-desc">Default SEO description</Label>
          <Textarea id="s-seo-desc" rows={2} value={form.default_seo_description} onChange={(e) => setForm((f) => ({ ...f, default_seo_description: e.target.value }))} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="s-social-image">Default social image URL</Label>
          <Input id="s-social-image" value={form.default_social_image} onChange={(e) => setForm((f) => ({ ...f, default_social_image: e.target.value }))} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="s-footer">Footer text</Label>
          <Textarea id="s-footer" rows={2} value={form.footer_text} onChange={(e) => setForm((f) => ({ ...f, footer_text: e.target.value }))} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="s-social-links">Social links (JSON)</Label>
          <Textarea
            id="s-social-links"
            rows={5}
            className="font-mono text-xs"
            value={form.social_links}
            onChange={(e) => setForm((f) => ({ ...f, social_links: e.target.value }))}
          />
          <p className="text-xs text-muted-foreground">
            e.g. {`{"facebook": "https://...", "linkedin": "https://..."}`}
          </p>
        </div>
      </div>

      <div className="mt-6">
        <Button onClick={() => save.mutate()} disabled={save.isPending}>
          {save.isPending ? "Saving…" : "Save settings"}
        </Button>
      </div>
    </div>
  );
}
