import { Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Menu, Search, ShoppingCart, X, Mail, Phone, ChevronDown } from "lucide-react";
import { siteChromeQuery } from "@/lib/queries";
import { useCart } from "@/context/cart";
import { SITE } from "@/lib/site";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const mainNav = [
  { to: "/", label: "Home" },
  { to: "/containers", label: "Containers" },
  { to: "/container-types", label: "Types" },
  { to: "/container-sizes", label: "Sizes" },
  { to: "/worldwide-shipping", label: "Shipping" },
  { to: "/about-us", label: "About" },
  { to: "/blog", label: "Blog" },
  { to: "/contact", label: "Contact" },
] as const;

export function SiteHeader() {
  const { data } = useQuery(siteChromeQuery);
  const { count } = useCart();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [term, setTerm] = useState("");

  const settings = data?.settings;

  function submitSearch(event: React.FormEvent) {
    event.preventDefault();
    const q = term.trim();
    if (!q) return;
    setSearchOpen(false);
    setOpen(false);
    navigate({ to: "/search", search: { q } });
  }

  return (
    <header className="sticky top-0 z-50 w-full">
      <div className="hidden bg-navy-deep text-navy-foreground md:block">
        <div className="container-page flex h-9 items-center justify-between text-xs">
          <p className="text-navy-foreground/75">
            Worldwide container supply · Inspected stock · Delivery to 90+ countries
          </p>
          <div className="flex items-center gap-5">
            <a
              href={`mailto:${SITE.email}`}
              className="inline-flex items-center gap-1.5 text-navy-foreground/85 transition-colors hover:text-primary"
            >
              <Mail className="size-3.5" aria-hidden="true" />
              {SITE.email}
            </a>
            {settings?.phone ? (
              <a
                href={`tel:${settings.phone.replace(/[^\d+]/g, "")}`}
                className="inline-flex items-center gap-1.5 text-navy-foreground/85 transition-colors hover:text-primary"
              >
                <Phone className="size-3.5" aria-hidden="true" />
                {settings.phone}
              </a>
            ) : null}
          </div>
        </div>
      </div>

      <div className="border-b border-border bg-background/95 backdrop-blur">
        <div className="container-page flex h-16 items-center gap-4">
          <Link to="/" className="flex shrink-0 items-center gap-2.5" aria-label={SITE.name}>
            <img src="/logo.svg" alt="" className="size-9" width={36} height={36} />
            <span className="leading-none">
              <span className="block font-display text-lg font-bold uppercase tracking-wide">
                Global Container
              </span>
              <span className="block font-display text-[0.7rem] uppercase tracking-[0.28em] text-muted-foreground">
                Supply
              </span>
            </span>
          </Link>

          <nav className="ml-auto hidden items-center gap-1 lg:flex" aria-label="Main">
            {mainNav.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                activeOptions={{ exact: item.to === "/" }}
                activeProps={{ className: "text-foreground after:scale-x-100" }}
                className="relative px-3 py-2 font-display text-sm font-semibold uppercase tracking-wider text-muted-foreground transition-colors after:absolute after:inset-x-3 after:bottom-1 after:h-0.5 after:origin-left after:scale-x-0 after:bg-primary after:transition-transform hover:text-foreground hover:after:scale-x-100"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-1 lg:ml-2">
            <Button
              variant="ghost"
              size="icon"
              aria-label="Search containers"
              onClick={() => setSearchOpen((v) => !v)}
            >
              <Search className="size-5" />
            </Button>

            <Button variant="ghost" size="icon" asChild aria-label={`Cart, ${count} items`}>
              <Link to="/cart" className="relative">
                <ShoppingCart className="size-5" />
                {count > 0 ? (
                  <span className="absolute -right-0.5 -top-0.5 flex size-4.5 min-w-[1.125rem] items-center justify-center rounded-full bg-primary px-1 text-[0.65rem] font-bold text-primary-foreground">
                    {count}
                  </span>
                ) : null}
              </Link>
            </Button>

            <Button asChild className="ml-1 hidden font-display uppercase tracking-wider sm:inline-flex">
              <Link to="/contact">Request a Quote</Link>
            </Button>

            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open menu">
                  <Menu className="size-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[19rem] p-0">
                <SheetTitle className="sr-only">Site navigation</SheetTitle>
                <div className="flex items-center justify-between border-b border-border px-5 py-4">
                  <span className="font-display text-base font-bold uppercase">Menu</span>
                  <Button variant="ghost" size="icon" onClick={() => setOpen(false)} aria-label="Close menu">
                    <X className="size-5" />
                  </Button>
                </div>
                <nav className="flex flex-col p-3" aria-label="Mobile">
                  {mainNav.map((item) => (
                    <Link
                      key={item.to}
                      to={item.to}
                      onClick={() => setOpen(false)}
                      activeOptions={{ exact: item.to === "/" }}
                      activeProps={{ className: "bg-accent text-foreground" }}
                      className="rounded-sm px-3 py-2.5 font-display text-base font-semibold uppercase tracking-wide text-muted-foreground hover:bg-accent hover:text-foreground"
                    >
                      {item.label}
                    </Link>
                  ))}
                  <div className="my-2 h-px bg-border" />
                  {[
                    { to: "/new-containers", label: "New Containers" },
                    { to: "/used-containers", label: "Used Containers" },
                    { to: "/industries", label: "Industries" },
                    { to: "/how-it-works", label: "How It Works" },
                    { to: "/reviews", label: "Reviews" },
                    { to: "/faq", label: "FAQ" },
                  ].map((item) => (
                    <Link
                      key={item.to}
                      to={item.to}
                      onClick={() => setOpen(false)}
                      className="rounded-sm px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground"
                    >
                      {item.label}
                    </Link>
                  ))}
                  <Button asChild className="mt-4 font-display uppercase tracking-wider">
                    <Link to="/contact" onClick={() => setOpen(false)}>
                      Request a Quote
                    </Link>
                  </Button>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        <div
          className={cn(
            "overflow-hidden border-t border-border bg-surface transition-[max-height]",
            searchOpen ? "max-h-24" : "max-h-0 border-t-0",
          )}
        >
          <form onSubmit={submitSearch} className="container-page flex items-center gap-2 py-3" role="search">
            <Input
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              placeholder="Search containers, sizes, types…"
              aria-label="Search containers"
              className="h-10 bg-background"
            />
            <Button type="submit" className="h-10 font-display uppercase tracking-wider">
              Search
            </Button>
          </form>
        </div>
      </div>
    </header>
  );
}

export function CategoryStrip({
  items,
}: {
  items: { slug: string; label: string; hint?: string }[];
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <span
          key={item.slug}
          className="inline-flex items-center gap-1 rounded-sm border border-border bg-surface px-3 py-1 text-xs text-muted-foreground"
        >
          {item.label}
          <ChevronDown className="size-3" aria-hidden="true" />
        </span>
      ))}
    </div>
  );
}
