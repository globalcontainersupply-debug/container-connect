import { createFileRoute, Link } from "@tanstack/react-router";
import { ShieldCheck, Globe2, Wrench, Users } from "lucide-react";
import { pageMeta } from "@/lib/seo";
import { SITE } from "@/lib/site";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/about-us")({
  head: () =>
    pageMeta({
      title: "About Us",
      description: `Learn how ${SITE.name} sources, inspects and delivers shipping containers to buyers worldwide.`,
      path: "/about-us",
    }),
  component: AboutPage,
});

const values = [
  {
    icon: ShieldCheck,
    title: "Inspected stock",
    body: "Every unit is checked for structural integrity and grading before it's listed, so the container you order is the container you receive.",
  },
  {
    icon: Globe2,
    title: "Global reach",
    body: "We coordinate haulage, port handling and freight forwarding to deliver into more than 90 countries.",
  },
  {
    icon: Wrench,
    title: "Specialist units",
    body: "Beyond standard dry vans, we source reefer, open top, flat rack, tank and modified containers on request.",
  },
  {
    icon: Users,
    title: "Direct sales team",
    body: "You deal directly with our team from enquiry to delivery — no anonymous marketplace, no middlemen.",
  },
];

function AboutPage() {
  return (
    <div className="bg-background">
      <div className="border-b border-border bg-secondary/40">
        <nav aria-label="Breadcrumb" className="container-page py-3 text-sm text-muted-foreground">
          <Link to="/" className="hover:text-primary">
            Home
          </Link>
          <span className="px-2">/</span>
          <span className="text-foreground">About Us</span>
        </nav>
      </div>

      <section className="container-page grid gap-10 py-14 lg:grid-cols-2 lg:items-center">
        <div>
          <p className="eyebrow text-primary">About {SITE.name}</p>
          <h1 className="mt-2 font-display text-4xl font-bold uppercase leading-tight md:text-5xl">
            Container supply, done properly
          </h1>
          <p className="mt-5 text-muted-foreground">
            {SITE.name} supplies new and used ISO shipping containers to businesses and individuals
            around the world. We work with depots and container yards to source stock, inspect it
            against a clear grading standard, and arrange delivery to wherever it's needed —
            whether that's a port, a construction site, or a customer's front gate.
          </p>
          <p className="mt-4 text-muted-foreground">
            Our goal is straightforward: make it easy to find the right container, get a clear
            price, and have it delivered without surprises.
          </p>
        </div>
        <div className="overflow-hidden rounded-sm border border-border">
          <img
            src="/images/about-inspection.jpg"
            alt="Inspector checking a shipping container before release"
            loading="lazy"
            className="aspect-[4/3] w-full object-cover"
          />
        </div>
      </section>

      <section className="border-t border-border bg-surface py-14">
        <div className="container-page grid gap-10 lg:grid-cols-2 lg:items-center">
          <div className="order-2 overflow-hidden rounded-sm border border-border lg:order-1">
            <img
              src="/images/yard-aerial.jpg"
              alt="Aerial view of a container storage yard"
              loading="lazy"
              className="aspect-[4/3] w-full object-cover"
            />
          </div>
          <div className="order-1 lg:order-2">
            <p className="eyebrow text-primary">Sourcing &amp; inspection</p>
            <h2 className="mt-2 font-display text-3xl font-bold uppercase">
              How we bring stock to market
            </h2>
            <p className="mt-4 text-muted-foreground">
              We source containers directly from depots and shipping lines, then grade each unit
              before it's offered for sale. New (one-trip) units are checked on arrival; used units
              are inspected and graded cargo-worthy or wind and watertight so buyers know exactly
              what condition they're purchasing.
            </p>
            <p className="mt-4 text-muted-foreground">
              Photos on each product page are taken of stock as it's listed — not stock imagery —
              so what you see reflects what's available.
            </p>
          </div>
        </div>
      </section>

      <section className="container-page py-14">
        <p className="eyebrow text-primary">What we stand for</p>
        <h2 className="mt-2 font-display text-3xl font-bold uppercase">Our values</h2>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {values.map((v) => (
            <div key={v.title} className="rounded-sm border border-border bg-card p-6">
              <v.icon className="size-6 text-primary" aria-hidden />
              <h3 className="mt-4 font-display text-lg font-semibold uppercase">{v.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{v.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-border bg-navy py-14 text-navy-foreground">
        <div className="container-page text-center">
          <h2 className="font-display text-3xl font-bold uppercase">Ready to talk containers?</h2>
          <p className="mx-auto mt-3 max-w-xl text-navy-foreground/80">
            Tell us what you need and where it's going — our team will come back with pricing and
            lead times.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button asChild size="lg">
              <Link to="/contact">Contact us</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/containers">Browse containers</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
