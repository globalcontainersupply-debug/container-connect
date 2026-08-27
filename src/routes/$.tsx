import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { pageMeta } from "@/lib/seo";
import { SITE } from "@/lib/site";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/$")({
  head: () => ({
    ...pageMeta({
      title: "Container Not Found",
      description: "The page you're looking for doesn't exist.",
    }),
    meta: [{ name: "robots", content: "noindex" }],
  }),
  component: CatchAllPage,
});

function CatchAllPage() {
  const navigate = useNavigate();
  const [term, setTerm] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const q = term.trim();
    if (q) navigate({ to: "/search", search: { q } });
  }

  return (
    <div className="flex min-h-[60vh] items-center justify-center bg-background px-4 py-16">
      <div className="max-w-md text-center">
        <p className="eyebrow text-primary">404</p>
        <h1 className="mt-3 font-display text-4xl font-bold uppercase text-foreground">
          Container not found
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          This page has been moved, sold, or never existed on {SITE.name}. Try searching, or browse
          our live stock instead.
        </p>
        <form onSubmit={handleSubmit} className="mt-6 flex gap-2" role="search">
          <Input
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            placeholder="Search containers…"
            aria-label="Search containers"
          />
          <Button type="submit">Search</Button>
        </form>
        <div className="mt-6 flex justify-center gap-3">
          <Button asChild>
            <Link to="/containers">Browse containers</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/">Go home</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
