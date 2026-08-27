import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { supportQuery } from "@/lib/queries";
import { pageMeta, jsonLd } from "@/lib/seo";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const Route = createFileRoute("/faq")({
  loader: ({ context }) => context.queryClient.ensureQueryData(supportQuery),
  head: ({ loaderData }) => {
    const base = pageMeta({
      title: "Frequently Asked Questions",
      description: "Answers to common questions about buying, shipping and paying for shipping containers.",
      path: "/faq",
    });
    if (!loaderData?.faqs.length) return base;
    return {
      ...base,
      scripts: [
        jsonLd({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: loaderData.faqs.map((f) => ({
            "@type": "Question",
            name: f.question,
            acceptedAnswer: { "@type": "Answer", text: f.answer },
          })),
        }),
      ],
    };
  },
  component: FaqPage,
});

function FaqPage() {
  const { data } = useSuspenseQuery(supportQuery);
  const groups = data.faqs.reduce<Record<string, typeof data.faqs>>((acc, f) => {
    const key = f.category ?? "General";
    acc[key] = acc[key] ? [...acc[key], f] : [f];
    return acc;
  }, {});
  const categories = Object.keys(groups);

  return (
    <div className="bg-background">
      <div className="border-b border-border bg-secondary/40">
        <nav aria-label="Breadcrumb" className="container-page py-3 text-sm text-muted-foreground">
          <Link to="/" className="hover:text-primary">
            Home
          </Link>
          <span className="px-2">/</span>
          <span className="text-foreground">FAQ</span>
        </nav>
      </div>

      <section className="container-page py-14">
        <p className="eyebrow text-primary">Support</p>
        <h1 className="mt-2 font-display text-4xl font-bold uppercase md:text-5xl">
          Frequently asked questions
        </h1>

        {categories.length ? (
          <div className="mt-10 space-y-10">
            {categories.map((category) => (
              <div key={category}>
                <h2 className="font-display text-xl font-bold uppercase text-primary">
                  {category}
                </h2>
                <Accordion type="single" collapsible className="mt-4 max-w-3xl">
                  {(groups[category] ?? []).map((f) => (
                    <AccordionItem key={f.id} value={f.id}>
                      <AccordionTrigger className="text-left font-display text-lg uppercase">
                        {f.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground">
                        {f.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-10 text-muted-foreground">No FAQs published yet.</p>
        )}
      </section>
    </div>
  );
}
