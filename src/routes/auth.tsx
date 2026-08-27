import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { pageMeta } from "@/lib/seo";
import { SITE } from "@/lib/site";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/auth")({
  ssr: false,
  head: () => ({
    ...pageMeta({
      title: "Admin Sign In",
      description: `Sign in to the ${SITE.name} admin dashboard.`,
      path: "/auth",
    }),
    meta: [{ name: "robots", content: "noindex" }],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/admin" });
    });
  }, [navigate]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setSubmitting(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    navigate({ to: "/admin" });
  }

  async function handleGoogle() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/admin` },
    });
    if (error) toast.error(error.message);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-navy-deep px-4 py-16">
      <div className="w-full max-w-sm rounded-sm border border-white/10 bg-navy p-8 text-navy-foreground">
        <span className="flex size-10 items-center justify-center rounded-sm bg-navy-deep">
          <span className="font-display text-xl font-bold leading-none text-primary">G</span>
        </span>
        <h1 className="mt-5 font-display text-2xl font-bold uppercase">Admin sign in</h1>
        <p className="mt-1 text-sm text-navy-foreground/70">{SITE.name} dashboard</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-navy-foreground/80">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border-white/15 bg-navy-deep text-navy-foreground"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-navy-foreground/80">
              Password
            </Label>
            <Input
              id="password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="border-white/15 bg-navy-deep text-navy-foreground"
            />
          </div>
          <Button type="submit" className="w-full" size="lg" disabled={submitting}>
            {submitting ? "Signing in…" : "Sign in"}
          </Button>
        </form>

        <div className="my-5 flex items-center gap-3 text-xs uppercase tracking-wide text-navy-foreground/50">
          <span className="h-px flex-1 bg-white/10" />
          Or
          <span className="h-px flex-1 bg-white/10" />
        </div>

        <Button variant="outline" className="w-full border-white/15 bg-transparent text-navy-foreground hover:bg-white/5" onClick={handleGoogle}>
          Continue with Google
        </Button>
      </div>
    </div>
  );
}
