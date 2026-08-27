import { createFileRoute, Link } from "@tanstack/react-router";
import { pageMeta } from "@/lib/seo";
import { SITE } from "@/lib/site";

export const Route = createFileRoute("/shipping-policy")({
  head: () =>
    pageMeta({
      title: "Shipping Policy",
      description: `Delivery methods, lead times and documentation for orders placed with ${SITE.name}.`,
      path: "/shipping-policy",
    }),
  component: ShippingPolicyPage,
});

function ShippingPolicyPage() {
  return (
    <div className="container-page max-w-3xl py-14">
      <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground">
        <Link to="/" className="hover:text-primary">
          Home
        </Link>
        <span className="px-2">/</span>
        <span className="text-foreground">Shipping Policy</span>
      </nav>
      <h1 className="mt-4 font-display text-4xl font-bold uppercase">Shipping Policy</h1>
      <p className="mt-2 text-sm text-muted-foreground">Last updated: August 27, 2026</p>

      <div className="mt-8 space-y-8 text-sm leading-relaxed text-muted-foreground">
        <section>
          <h2 className="font-display text-xl font-bold uppercase text-foreground">Delivery options</h2>
          <p className="mt-2">
            We offer port or depot collection, where you or your forwarder collects the unit
            directly, and door delivery, where we arrange haulage to your site. Availability of
            each option depends on your location and road access for a container-carrying vehicle.
          </p>
        </section>
        <section>
          <h2 className="font-display text-xl font-bold uppercase text-foreground">Lead times</h2>
          <p className="mt-2">
            Typical lead times run from two to six weeks door-to-door, depending on the origin
            depot, destination country and vessel or haulage schedules. Exact timelines are
            confirmed as part of your quotation.
          </p>
        </section>
        <section>
          <h2 className="font-display text-xl font-bold uppercase text-foreground">Documentation</h2>
          <p className="mt-2">
            International orders are accompanied by a bill of lading, packing list and any export
            documentation required for customs clearance at destination. Import duties, taxes and
            local clearance fees are the buyer's responsibility unless otherwise agreed in writing.
          </p>
        </section>
        <section>
          <h2 className="font-display text-xl font-bold uppercase text-foreground">Site access</h2>
          <p className="mt-2">
            For door delivery, please confirm that your site can accommodate a container-carrying
            vehicle and offloading equipment. Delivery may be delayed or re-quoted if access
            constraints are identified after dispatch.
          </p>
        </section>
        <section>
          <h2 className="font-display text-xl font-bold uppercase text-foreground">Contact</h2>
          <p className="mt-2">
            For delivery questions on an existing or upcoming order, email{" "}
            <a href={`mailto:${SITE.email}`} className="text-primary underline">
              {SITE.email}
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
