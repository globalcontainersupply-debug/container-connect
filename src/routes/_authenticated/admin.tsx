import { createFileRoute, Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useState } from "react";
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
  Menu,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { SITE } from "@/lib/site";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
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

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  async function handleSignOut() {
    await supabase.auth.signOut();
    navigate({ to: "/auth" });
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2.5 border-b border-white/10 px-5 py-5">
        <img src="/logo.svg" alt="" className="size-9 shrink-0" width={36} height={36} />
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
              onClick={onNavigate}
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
    </div>
  );
}

function AdminShell() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const currentLabel = nav.find((item) =>
    item.exact ? pathname === item.to : pathname.startsWith(item.to),
  )?.label;

  return (
    <div className="flex min-h-screen bg-secondary/30">
      <aside className="hidden w-64 shrink-0 border-r border-border bg-navy-deep text-navy-foreground lg:block">
        <div className="sticky top-0 h-screen">
          <SidebarContent />
        </div>
      </aside>

      <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
        <SheetContent side="left" className="w-72 border-navy-deep bg-navy-deep p-0 text-navy-foreground">
          <SheetTitle className="sr-only">Admin navigation</SheetTitle>
          <SidebarContent onNavigate={() => setMobileNavOpen(false)} />
        </SheetContent>
      </Sheet>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-3 border-b border-border bg-card px-4 sm:px-5">
          <div className="flex min-w-0 items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="shrink-0 lg:hidden"
              aria-label="Open admin menu"
              onClick={() => setMobileNavOpen(true)}
            >
              <Menu className="size-5" />
            </Button>
            <p className="truncate font-display text-sm font-bold uppercase tracking-wide">
              <span className="hidden sm:inline">{SITE.name}</span>
              <span className="sm:hidden">{currentLabel ?? SITE.shortName}</span>
            </p>
          </div>
          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="inline-flex shrink-0 items-center gap-1.5 text-sm text-muted-foreground hover:text-primary"
          >
            <span className="hidden sm:inline">View site</span>
            <ExternalLink className="size-3.5" aria-hidden />
          </a>
        </header>
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
