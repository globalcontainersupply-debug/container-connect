import { createFileRoute, Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Package,
  Shapes,
  Ruler,
  Globe2,
  HelpCircle,
  Star,
  Newspaper,
  Image as ImageIcon,
  Video,
  Settings,
  Home as HomeIcon,
  LogOut,
  ExternalLink,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { SITE } from "@/lib/site";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/admin")({
  ssr: false,
  component: AdminShell,
});

const nav = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/admin/products", label: "Products", icon: Package, exact: false },
  { to: "/admin/categories", label: "Categories", icon: Shapes, exact: false },
  { to: "/admin/types", label: "Container Types", icon: Shapes, exact: false },
  { to: "/admin/sizes", label: "Container Sizes", icon: Ruler, exact: false },
  { to: "/admin/regions", label: "Shipping Regions", icon: Globe2, exact: false },
  { to: "/admin/faqs", label: "FAQs", icon: HelpCircle, exact: false },
  { to: "/admin/reviews", label: "Reviews", icon: Star, exact: false },
  { to: "/admin/blog", label: "Blog", icon: Newspaper, exact: false },
  { to: "/admin/media", label: "Media Library", icon: ImageIcon, exact: false },
  { to: "/admin/videos", label: "Videos", icon: Video, exact: false },
  { to: "/admin/home", label: "Homepage Content", icon: HomeIcon, exact: false },
  { to: "/admin/settings", label: "Site Settings", icon: Settings, exact: false },
] as const;

function AdminShell() {
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  async function handleSignOut() {
    await supabase.auth.signOut();
    navigate({ to: "/auth" });
  }

  return (
    <div className="flex min-h-screen bg-secondary/30">
      <aside className="hidden w-64 shrink-0 flex-col border-r border-border bg-navy-deep text-navy-foreground lg:flex">
        <div className="flex items-center gap-2.5 border-b border-white/10 px-5 py-5">
          <span className="flex size-9 items-center justify-center rounded-sm bg-navy">
            <span className="font-display text-lg font-bold leading-none text-primary">G</span>
          </span>
          <span className="font-display text-sm font-bold uppercase tracking-wide">
            {SITE.shortName} Admin
          </span>
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {nav.map((item) => {
            const active = item.exact ? pathname === item.to : pathname.startsWith(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "flex items-center gap-3 rounded-sm px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-navy text-primary"
                    : "text-navy-foreground/70 hover:bg-white/5 hover:text-navy-foreground",
                )}
              >
                <item.icon className="size-4 shrink-0" aria-hidden />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-white/10 p-3">
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 text-navy-foreground/70 hover:bg-white/5 hover:text-navy-foreground"
            onClick={handleSignOut}
          >
            <LogOut className="size-4" aria-hidden />
            Sign out
          </Button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 items-center justify-between border-b border-border bg-card px-5">
          <p className="font-display text-sm font-bold uppercase tracking-wide">{SITE.name}</p>
          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary"
          >
            View site
            <ExternalLink className="size-3.5" aria-hidden />
          </a>
        </header>
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
