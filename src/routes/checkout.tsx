import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { useCart } from "@/context/cart";
import { pageMeta } from "@/lib/seo";
import { formatPrice, FORMSUBMIT_ENDPOINT, SITE } from "@/lib/site";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/checkout")({
  head: () =>
    pageMeta({
      title: "Request a Container Quote",
      description:
        "Send your container enquiry to our sales team. Tell us your delivery location and we'll come back with pricing and lead times.",
      path: "/checkout",
    }),
  component: CheckoutPage,
});

function makeReference() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ0123456789";
  let out = "";
  for (let i = 0; i < 5; i += 1) out += chars[Math.floor(Math.random() * chars.length)];
  return `GCS-ENQ-${out}`;
}

function CheckoutPage() {
  const { items, subtotal, clear } = useCart();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [contactMethod, setContactMethod] = useState("email");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const reference = makeReference();

    const lines = items
      .map(
        (i) =>
          `- ${i.name} (SKU ${i.slug}) x${i.quantity} — ${formatPrice(i.price, i.priceMode, i.currency)}`,
      )
      .join("\n");

    setSubmitting(true);
    try {
      const response = await fetch(FORMSUBMIT_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          _subject: `Container enquiry ${reference} — ${data.get("name")}`,
          _template: "table",
          Reference: reference,
          Name: data.get("name"),
          Company: data.get("company"),
          Email: data.get("email"),
          Phone: data.get("phone"),
          Country: data.get("country"),
          City: data.get("city"),
          "Delivery location": data.get("delivery"),
          "Preferred contact": contactMethod,
          Message: data.get("message"),
          Items: lines || "No items selected",
          "Listed total": formatPrice(subtotal, "fixed", "USD"),
        }),
      });
      if (!response.ok) throw new Error("Submission failed");
      clear();
      navigate({ to: "/enquiry-received", search: { ref: reference } });
    } catch {
      toast.error("We couldn't send your enquiry. Please email " + SITE.email);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="font-display text-3xl font-bold uppercase md:text-4xl">Request a quote</h1>
      <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
        Share your delivery details and our team will respond with pricing, availability and lead
        times for the units on your list.
      </p>

      <div className="mt-8 grid gap-10 lg:grid-cols-3">
        <form onSubmit={handleSubmit} className="space-y-5 lg:col-span-2">
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Full name *</Label>
              <Input id="name" name="name" required autoComplete="name" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company">Company</Label>
              <Input id="company" name="company" autoComplete="organization" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input id="email" name="email" type="email" required autoComplete="email" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone *</Label>
              <Input id="phone" name="phone" required autoComplete="tel" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="country">Country *</Label>
              <Input id="country" name="country" required autoComplete="country-name" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">City *</Label>
              <Input id="city" name="city" required autoComplete="address-level2" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="delivery">Delivery location / port</Label>
            <Input id="delivery" name="delivery" placeholder="Port, depot or site address" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="contact-method">Preferred contact method</Label>
            <Select value={contactMethod} onValueChange={setContactMethod}>
              <SelectTrigger id="contact-method">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="phone">Phone</SelectItem>
                <SelectItem value="whatsapp">WhatsApp</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Textarea id="message" name="message" rows={5} placeholder="Timelines, modifications, quantities…" />
          </div>
          <Button type="submit" size="lg" disabled={submitting}>
            {submitting ? "Sending…" : "Send enquiry"}
          </Button>
        </form>

        <aside className="h-fit rounded-sm border border-border bg-secondary/40 p-6">
          <h2 className="font-display text-xl font-bold uppercase">Your list</h2>
          {items.length === 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">
              No containers selected yet. You can still send a general enquiry, or{" "}
              <Link to="/containers" className="text-primary underline">
                browse the catalogue
              </Link>
              .
            </p>
          ) : (
            <ul className="mt-4 space-y-3 text-sm">
              {items.map((i) => (
                <li key={i.slug} className="flex justify-between gap-3">
                  <span>
                    {i.name} <span className="text-muted-foreground">×{i.quantity}</span>
                  </span>
                  <span className="shrink-0 font-medium">
                    {formatPrice(i.price, i.priceMode, i.currency)}
                  </span>
                </li>
              ))}
            </ul>
          )}
          <p className="mt-4 border-t border-border pt-4 text-xs text-muted-foreground">
            Enquiries are sent directly to {SITE.email}. We typically reply within one business day.
          </p>
        </aside>
      </div>
    </div>
  );
}
