import { createFileRoute, Link } from "@tanstack/react-router";
import { HardHat, Wheat, Truck, Store, Mountain, HeartHandshake } from "lucide-react";
import { pageMeta } from "@/lib/seo";
import { SITE } from "@/lib/site";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/industries")({
  head: () =>
    pageMeta({
      title: "Industries We Serve",
      description: `How construction, agriculture, logistics, retail, mining and humanitarian teams use shipping containers supplied by ${SITE.name}.`,
      path: "/industries",
    }),
  component: IndustriesPage,
});

const industries = [
  {
    icon: HardHat,
    title: "Construction",
    body: "Site offices, secure tool storage and welfare units that can be relocated between sites.",
    links: [
      { to: "/container-types/$slug", params: { slug: "office-conversion" }, label: "Office conversions" },
      { to: "/container-sizes/$slug", params: { slug: "20ft" }, label: "20ft units" },
    ],
  },
  {
    icon: Wheat,
    title: "Agriculture",
    body: "Weatherproof storage for feed, equipment and harvested produce, with insulated options available.",
    links: [
      { to: "/container-types/$slug", params: { slug: "standard-dry" }, label: "Standard dry" },
      { to: "/container-sizes/$slug", params: { slug: "40ft-high-cube" }, label: "40ft high cube" },
    ],
  },
  {
    icon: Truck,
    title: "Logistics & freight",
    body: "General cargo movement and depot storage in the sizes carriers and forwarders rely on.",
    links: [
      { to: "/container-types/$slug", params: { slug: "high-cube" }, label: "High cube" },
      { to: "/container-types/$slug", params: { slug: "standard-dry" }, label: "Standard dry" },
    ],
  },
  {
    icon: Store,
    title: "Retail & pop-up",
    body: "Converted units for pop-up shops, kiosks and market stalls that need a distinctive footprint.",
    links: [
      { to: "/container-types/$slug", params: { slug: "office-conversion" }, label: "Office conversions" },
    ],
  },
  {
    icon: Mountain,
    title: "Mining & resources",
    body: "Open top and flat rack units for oversized loads, bulk materials and remote-site logistics.",
    links: [
      { to: "/container-types/$slug", params: { slug: "open-top" }, label: "Open top" },
      { to: "/container-types/$slug", params: { slug: "flat-rack" }, label: "Flat rack" },
    ],
  },
  {
    icon: HeartHandshake,
    title: "Humanitarian & NGO",
    body: "Rapid-deploy storage and cold chain units for relief operations and medical logistics.",
    links: [
      { to: "/container-types/$slug", params: { slug: "standard-dry" }, label: "Standard dry" },
      { to: "/container-types/$slug", params: { slug: "refrigerated" }, label: "Refrigerated" },
    ],
  },
] as const;

function IndustriesPage() {
  return (
    <div className="bg-background">
      <div className="border-b border-border bg-secondary/40">
        <nav aria-label="Breadcrumb" className="container-page py-3 text-sm text-muted-foreground">
          <Link to="/" className="hover:text-primary">
            Home
          </Link>
          <span className="px-2">/</span>
          <span className="text-foreground">Industries</span>
        </nav>
      </div>

      <section className="container-page py-14">
        <p className="eyebrow text-primary">Who we serve</p>
        <h1 className="mt-2 font-display text-4xl font-bold uppercase md:text-5xl">Industries</h1>
        <p className="mt-4 max-w-2xl text-muted-foreground">
          Shipping containers turn up in almost every industry. Here's how buyers typically put
          them to work.
        </p>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {industries.map((ind) => (
            <div key={ind.title} className="flex flex-col rounded-sm border border-border bg-card p-6">
              <ind.icon className="size-6 text-primary" aria-hidden />
              <h2 className="mt-4 font-display text-lg font-semibold uppercase">{ind.title}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{ind.body}</p>
              <div className="mt-auto flex flex-wrap gap-2 pt-4">
                {ind.links.map((l) => (
                  <Link
                    key={l.label}
                    to={l.to}
                    params={l.params}
                    className="rounded-sm border border-border px-3 py-1.5 text-xs font-semibold uppercase tracking-wide transition-colors hover:border-primary hover:text-primary"
                  >
                    {l.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12">
          <Button asChild size="lg">
            <Link to="/contact">Discuss your requirement</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
