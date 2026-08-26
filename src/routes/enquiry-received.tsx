import { createFileRoute, Link } from "@tanstack/react-router";
import { pageMeta } from "@/lib/seo";
import { SITE } from "@/lib/site";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/enquiry-received")({
  validateSearch: (search: Record<string, unknown>) => ({
    ref: typeof search.ref === "string" ? search.ref : undefined,
  }),
  head: () => ({
    ...pageMeta({
      title: "Enquiry Received",
      description: "Thanks for your container enquiry — our sales team will be in touch shortly.",
      path: "/enquiry-received",
    }),
    meta: [
      ...pageMeta({
        title: "Enquiry Received",
        description: "Thanks for your container enquiry — our sales team will be in touch shortly.",
      }).meta,
      { name: "robots", content: "noindex" },
    ],
  }),
  component: EnquiryReceived,
});

function EnquiryReceived() {
  const { ref } = Route.useSearch();
  return (
    <div className="container mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center px-4 py-16 text-center">
      <p className="eyebrow text-primary">Thank you</p>
      <h1 className="mt-3 font-display text-3xl font-bold uppercase md:text-4xl">
        Enquiry received
      </h1>
      <p className="mt-3 text-muted-foreground">
        Our sales team has your request and will reply with pricing, availability and delivery
        options — usually within one business day.
      </p>
      {ref ? (
        <p className="mt-6 rounded-sm border border-border bg-secondary/40 px-6 py-4 font-display text-xl font-bold uppercase tracking-wide">
          Reference {ref}
        </p>
      ) : null}
      <p className="mt-4 text-sm text-muted-foreground">
        Need to add something? Email {SITE.email} quoting your reference.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button asChild>
          <Link to="/containers">Keep browsing containers</Link>
        </Button>
        <Button asChild variant="outline">
          <Link to="/">Back to home</Link>
        </Button>
      </div>
    </div>
  );
}
