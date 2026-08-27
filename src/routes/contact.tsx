import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Mail, MapPin, Phone, Clock, CheckCircle2 } from "lucide-react";
import { siteChromeQuery } from "@/lib/queries";
import { pageMeta } from "@/lib/seo";
import { FORMSUBMIT_ENDPOINT, SITE } from "@/lib/site";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/contact")({
  head: () =>
    pageMeta({
      title: "Contact Us",
      description: `Get in touch with ${SITE.name} about container availability, pricing or delivery.`,
      path: "/contact",
    }),
  loader: ({ context }) => context.queryClient.ensureQueryData(siteChromeQuery),
  component: ContactPage,
});

function ContactPage() {
  const { data } = useSuspenseQuery(siteChromeQuery);
  const settings = data.settings;
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);

    setSubmitting(true);
    try {
      const response = await fetch(FORMSUBMIT_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          _subject: `Contact form: ${formData.get("subject") || "General enquiry"} — ${formData.get("name")}`,
          _template: "table",
          Name: formData.get("name"),
          Email: formData.get("email"),
          Phone: formData.get("phone"),
          Company: formData.get("company"),
          Country: formData.get("country"),
          Subject: formData.get("subject"),
          Message: formData.get("message"),
        }),
      });
      if (!response.ok) throw new Error("Submission failed");
      setSent(true);
      toast.success("Message sent — we'll be in touch shortly.");
      form.reset();
    } catch {
      toast.error("We couldn't send your message. Please email " + SITE.email);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="bg-background">
      <div className="border-b border-border bg-secondary/40">
        <nav aria-label="Breadcrumb" className="container-page py-3 text-sm text-muted-foreground">
          <Link to="/" className="hover:text-primary">
            Home
          </Link>
          <span className="px-2">/</span>
          <span className="text-foreground">Contact</span>
        </nav>
      </div>

      <section className="container-page py-14">
        <p className="eyebrow text-primary">Get in touch</p>
        <h1 className="mt-2 font-display text-4xl font-bold uppercase md:text-5xl">Contact us</h1>
        <p className="mt-4 max-w-2xl text-muted-foreground">
          Questions about availability, pricing or delivery? Send us a message and our team will
          reply within one business day.
        </p>

        <div className="mt-10 grid gap-10 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-1">
            <div className="rounded-sm border border-border bg-card p-6">
              <h2 className="font-display text-lg font-bold uppercase">Reach us directly</h2>
              <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
                <li className="flex gap-2.5">
                  <Mail className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
                  <a href={`mailto:${SITE.email}`} className="hover:text-primary">
                    {SITE.email}
                  </a>
                </li>
                {settings?.phone ? (
                  <li className="flex gap-2.5">
                    <Phone className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
                    <a href={`tel:${settings.phone.replace(/[^\d+]/g, "")}`} className="hover:text-primary">
                      {settings.phone}
                    </a>
                  </li>
                ) : null}
                {settings?.address ? (
                  <li className="flex gap-2.5">
                    <MapPin className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
                    <span>{settings.address}</span>
                  </li>
                ) : null}
                {settings?.business_hours ? (
                  <li className="flex gap-2.5">
                    <Clock className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
                    <span>{settings.business_hours}</span>
                  </li>
                ) : null}
              </ul>
            </div>
          </div>

          <div className="lg:col-span-2">
            {sent ? (
              <div className="flex flex-col items-center justify-center rounded-sm border border-border bg-card p-12 text-center">
                <CheckCircle2 className="size-10 text-primary" aria-hidden />
                <h2 className="mt-4 font-display text-2xl font-bold uppercase">Message sent</h2>
                <p className="mt-2 max-w-md text-muted-foreground">
                  Thanks for reaching out — we typically reply within one business day.
                </p>
                <Button className="mt-6" variant="outline" onClick={() => setSent(false)}>
                  Send another message
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full name *</Label>
                    <Input id="name" name="name" required autoComplete="name" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input id="email" name="email" type="email" required autoComplete="email" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input id="phone" name="phone" autoComplete="tel" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company">Company</Label>
                    <Input id="company" name="company" autoComplete="organization" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="country">Country</Label>
                    <Input id="country" name="country" autoComplete="country-name" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject</Label>
                    <Input id="subject" name="subject" placeholder="e.g. Pricing enquiry" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">Message *</Label>
                  <Textarea id="message" name="message" rows={6} required />
                </div>
                <Button type="submit" size="lg" disabled={submitting}>
                  {submitting ? "Sending…" : "Send message"}
                </Button>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
