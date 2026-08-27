import { createFileRoute, Link } from "@tanstack/react-router";
import { pageMeta } from "@/lib/seo";
import { SITE } from "@/lib/site";

export const Route = createFileRoute("/privacy-policy")({
  head: () =>
    pageMeta({
      title: "Privacy Policy",
      description: `How ${SITE.name} collects, uses and protects your personal information.`,
      path: "/privacy-policy",
    }),
  component: PrivacyPolicyPage,
});

function PrivacyPolicyPage() {
  return (
    <div className="container-page max-w-3xl py-14">
      <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground">
        <Link to="/" className="hover:text-primary">
          Home
        </Link>
        <span className="px-2">/</span>
        <span className="text-foreground">Privacy Policy</span>
      </nav>
      <h1 className="mt-4 font-display text-4xl font-bold uppercase">Privacy Policy</h1>
      <p className="mt-2 text-sm text-muted-foreground">Last updated: August 27, 2026</p>

      <div className="mt-8 space-y-8 text-sm leading-relaxed text-muted-foreground">
        <section>
          <h2 className="font-display text-xl font-bold uppercase text-foreground">
            Information we collect
          </h2>
          <p className="mt-2">
            When you submit an enquiry or contact form, we collect the details you provide —
            typically your name, email address, phone number, company, country and any message
            content. We do not require an account to browse the catalogue or send an enquiry.
          </p>
        </section>
        <section>
          <h2 className="font-display text-xl font-bold uppercase text-foreground">
            How we use it
          </h2>
          <p className="mt-2">
            We use the information you provide to respond to enquiries, prepare quotations, and
            arrange delivery of any containers you order. We do not sell your personal information
            to third parties.
          </p>
        </section>
        <section>
          <h2 className="font-display text-xl font-bold uppercase text-foreground">
            Third-party services
          </h2>
          <p className="mt-2">
            Enquiry and contact forms on this site are delivered via a third-party form processing
            service. Submitting a form means your message content is transmitted through that
            service in order to reach our sales team.
          </p>
        </section>
        <section>
          <h2 className="font-display text-xl font-bold uppercase text-foreground">
            Cookies and local storage
          </h2>
          <p className="mt-2">
            Your enquiry list (cart) is stored in your browser's local storage so it persists
            between visits. This data stays on your device and is not shared with us until you
            submit an enquiry.
          </p>
        </section>
        <section>
          <h2 className="font-display text-xl font-bold uppercase text-foreground">Your rights</h2>
          <p className="mt-2">
            You may request access to, correction of, or deletion of any personal information we
            hold about you by emailing{" "}
            <a href={`mailto:${SITE.email}`} className="text-primary underline">
              {SITE.email}
            </a>
            .
          </p>
        </section>
        <section>
          <h2 className="font-display text-xl font-bold uppercase text-foreground">Contact</h2>
          <p className="mt-2">
            Questions about this policy can be sent to{" "}
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
