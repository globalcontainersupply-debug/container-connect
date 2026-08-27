import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Ship, Truck, FileText, Clock } from "lucide-react";
import { supportQuery } from "@/lib/queries";
import { pageMeta } from "@/lib/seo";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const Route = createFileRoute("/worldwide-shipping")({
  head: () =>
    pageMeta({
      title: "Worldwide Shipping",
      description:
        "How we deliver shipping containers worldwide — regions covered, delivery modes, documentation and lead times.",
      path: "/worldwide-shipping",
    }),
  loader: ({ context }) => context.queryClient.ensureQueryData(supportQuery),
  component: WorldwideShippingPage,
});

const modes = [
  {
    icon: Ship,
    title: "Port collection",
    body: "Collect from the nearest port or depot yourself, or arrange your own onward forwarding.",
  },
  {
    icon: Truck,
    title: "Door delivery",
    body: "We arrange haulage direct to your site, subject to road access for a container-carrying vehicle.",
  },
  {
    icon: FileText,
    title: "Full documentation",
    body: "Bill of lading, packing list and any export paperwork required for customs clearance.",
  },
  {
    icon: Clock,
    title: "Lead times",
    body: "Typically 2–6 weeks door-to-door depending on origin depot, destination and vessel schedules.",
  },
];

function WorldwideShippingPage() {
  const { data } = useSuspenseQuery(supportQuery);
  const shippingFaqs = data.faqs.filter((f) => f.category === "shipping");

  return (
    <div className="bg-background">
      <div className="border-b border-border bg-secondary/40">
        <nav aria-label="Breadcrumb" className="container-page py-3 text-sm text-muted-foreground">
          <Link to="/" className="hover:text-primary">
            Home
          </Link>
          <span className="px-2">/</span>
          <span className="text-foreground">Worldwide Shipping</span>
        </nav>
      </div>

      <section className="container-page py-14">
        <p className="eyebrow text-primary">Delivery</p>
        <h1 className="mt-2 font-display text-4xl font-bold uppercase md:text-5xl">
          Worldwide shipping
        </h1>
        <p className="mt-4 max-w-2xl text-muted-foreground">
          We deliver shipping containers to more than 90 countries through a network of haulage and
          freight partners. Wherever you're based, tell us the destination and we'll quote the
          freight alongside the container price.
        </p>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {modes.map((m) => (
            <div key={m.title} className="rounded-sm border border-border bg-card p-6">
              <m.icon className="size-6 text-primary" aria-hidden />
              <h2 className="mt-4 font-display text-lg font-semibold uppercase">{m.title}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{m.body}</p>
            </div>
          ))}
        </div>
      </section>

      {data.regions.length ? (
        <section className="border-t border-border bg-surface py-14">
          <div className="container-page">
            <p className="eyebrow text-primary">Coverage</p>
            <h2 className="mt-2 font-display text-3xl font-bold uppercase">Regions we serve</h2>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {data.regions.map((r) => (
                <div key={r.id} className="rounded-sm border border-border bg-card p-6">
                  <h3 className="font-display text-lg font-semibold uppercase">{r.name}</h3>
                  {r.description ? (
                    <p className="mt-2 text-sm text-muted-foreground">{r.description}</p>
                  ) : null}
                  {r.notes ? (
                    <p className="mt-2 text-xs text-muted-foreground">{r.notes}</p>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {shippingFaqs.length ? (
        <section className="container-page py-14">
          <p className="eyebrow text-primary">Common questions</p>
          <h2 className="mt-2 font-display text-3xl font-bold uppercase">Shipping FAQ</h2>
          <Accordion type="single" collapsible className="mt-6 max-w-3xl">
            {shippingFaqs.map((f) => (
              <AccordionItem key={f.id} value={f.id}>
                <AccordionTrigger className="text-left font-display text-lg uppercase">
                  {f.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">{f.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>
      ) : null}

      <section className="border-t border-border bg-navy py-14 text-navy-foreground">
        <div className="container-page text-center">
          <h2 className="font-display text-3xl font-bold uppercase">Get a delivered price</h2>
          <p className="mx-auto mt-3 max-w-xl text-navy-foreground/80">
            Send your destination and container requirement — we'll come back with a landed price.
          </p>
          <div className="mt-6">
            <Button asChild size="lg">
              <Link to="/contact">Request a quote</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
