import { createFileRoute, Link } from "@tanstack/react-router";
import { pageMeta } from "@/lib/seo";
import { SITE } from "@/lib/site";

export const Route = createFileRoute("/terms")({
  head: () =>
    pageMeta({
      title: "Terms & Conditions",
      description: `The terms and conditions that apply when you buy from ${SITE.name}.`,
      path: "/terms",
    }),
  component: TermsPage,
});

function TermsPage() {
  return (
    <div className="container-page max-w-3xl py-14">
      <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground">
        <Link to="/" className="hover:text-primary">
          Home
        </Link>
        <span className="px-2">/</span>
        <span className="text-foreground">Terms &amp; Conditions</span>
      </nav>
      <h1 className="mt-4 font-display text-4xl font-bold uppercase">Terms &amp; Conditions</h1>
      <p className="mt-2 text-sm text-muted-foreground">Last updated: August 27, 2026</p>

      <div className="mt-8 space-y-8 text-sm leading-relaxed text-muted-foreground">
        <section>
          <h2 className="font-display text-xl font-bold uppercase text-foreground">Enquiries and quotes</h2>
          <p className="mt-2">
            Prices shown on the website are indicative and subject to confirmation. A binding
            price is only agreed once we issue a written quotation covering the specific unit,
            condition, quantity and delivery location.
          </p>
        </section>
        <section>
          <h2 className="font-display text-xl font-bold uppercase text-foreground">Availability</h2>
          <p className="mt-2">
            Container stock is sourced from depots and can sell or move between locations. We
            confirm availability at the time your enquiry is processed and will tell you promptly
            if a unit is no longer available.
          </p>
        </section>
        <section>
          <h2 className="font-display text-xl font-bold uppercase text-foreground">Condition grading</h2>
          <p className="mt-2">
            Containers listed as "new" are one-trip units that have made a single loaded voyage.
            Used containers are graded cargo-worthy (CW) or wind and watertight (WWT) as noted on
            the product listing. Grading reflects condition at the time of inspection.
          </p>
        </section>
        <section>
          <h2 className="font-display text-xl font-bold uppercase text-foreground">Payment</h2>
          <p className="mt-2">
            Payment terms are confirmed in writing as part of your quotation. Units are reserved
            and dispatched once payment terms agreed for that order have been met.
          </p>
        </section>
        <section>
          <h2 className="font-display text-xl font-bold uppercase text-foreground">Delivery</h2>
          <p className="mt-2">
            Delivery timelines quoted are estimates based on depot location, destination and
            carrier schedules. We are not liable for delays caused by carriers, customs authorities
            or events outside our reasonable control.
          </p>
        </section>
        <section>
          <h2 className="font-display text-xl font-bold uppercase text-foreground">Contact</h2>
          <p className="mt-2">
            Questions about these terms can be sent to{" "}
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
