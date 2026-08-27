import { createFileRoute, Link } from "@tanstack/react-router";
import { MessageSquare, ClipboardList, FileCheck, CreditCard, Truck } from "lucide-react";
import { pageMeta } from "@/lib/seo";
import { SITE } from "@/lib/site";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/how-it-works")({
  head: () =>
    pageMeta({
      title: "How It Works",
      description: `The five-step process for buying a shipping container from ${SITE.name}, from enquiry to delivery.`,
      path: "/how-it-works",
    }),
  component: HowItWorksPage,
});

const steps = [
  {
    icon: MessageSquare,
    title: "1. Enquire",
    body: "Browse the catalogue or tell us what you need — type, size, condition and quantity. Add units to your list and submit an enquiry.",
  },
  {
    icon: ClipboardList,
    title: "2. Specification",
    body: "We confirm exact specification, any modifications required, and current availability at the nearest depot.",
  },
  {
    icon: FileCheck,
    title: "3. Quotation",
    body: "You receive an itemised quote covering the container price, freight to your destination, and estimated lead time.",
  },
  {
    icon: CreditCard,
    title: "4. Payment terms",
    body: "Once you accept the quote, we confirm payment terms and schedule collection or dispatch from the depot.",
  },
  {
    icon: Truck,
    title: "5. Delivery",
    body: "Your container is delivered to port, depot or door as agreed, with all documentation provided.",
  },
];

function HowItWorksPage() {
  return (
    <div className="bg-background">
      <div className="border-b border-border bg-secondary/40">
        <nav aria-label="Breadcrumb" className="container-page py-3 text-sm text-muted-foreground">
          <Link to="/" className="hover:text-primary">
            Home
          </Link>
          <span className="px-2">/</span>
          <span className="text-foreground">How It Works</span>
        </nav>
      </div>

      <section className="container-page py-14">
        <p className="eyebrow text-primary">Process</p>
        <h1 className="mt-2 font-display text-4xl font-bold uppercase md:text-5xl">
          How it works
        </h1>
        <p className="mt-4 max-w-2xl text-muted-foreground">
          Buying a container from {SITE.name} is a five-step process from first enquiry to
          delivery at your door.
        </p>

        <ol className="relative mt-12 space-y-10 border-l border-border pl-8">
          {steps.map((s) => (
            <li key={s.title} className="relative">
              <span className="absolute -left-[2.55rem] flex size-9 items-center justify-center rounded-full border border-border bg-card">
                <s.icon className="size-4 text-primary" aria-hidden />
              </span>
              <h2 className="font-display text-xl font-bold uppercase">{s.title}</h2>
              <p className="mt-2 max-w-xl text-muted-foreground">{s.body}</p>
            </li>
          ))}
        </ol>

        <div className="mt-12 flex flex-wrap gap-3">
          <Button asChild size="lg">
            <Link to="/contact">Start your enquiry</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link to="/containers">Browse containers</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
