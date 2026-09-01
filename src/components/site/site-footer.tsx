import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Mail, MapPin, MessageCircle, MessageSquareText, Clock } from "lucide-react";
import { siteChromeQuery } from "@/lib/queries";
import { SITE, whatsappUrl, lineUrl } from "@/lib/site";

export function SiteFooter() {
  const { data } = useQuery(siteChromeQuery);
  const settings = data?.settings;
  const year = new Date().getFullYear();

  return (
    <footer className="mt-24 bg-navy-deep text-navy-foreground">
      <div className="container-page grid gap-10 py-14 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="flex items-center gap-2.5">
            <img src="/logo.svg" alt="" className="size-9" width={36} height={36} />
            <span className="font-display text-lg font-bold uppercase tracking-wide">
              Global Container Supply
            </span>
          </div>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-navy-foreground/70">
            {settings?.footer_text ??
              "We source, inspect and deliver ISO shipping containers to buyers in over 90 countries."}
          </p>
        </div>

        <div>
          <h2 className="font-display text-sm font-bold uppercase tracking-[0.18em] text-primary">
            Containers
          </h2>
          <ul className="mt-4 space-y-2 text-sm">
            {[
              { to: "/containers", label: "Full Catalog" },
              { to: "/new-containers", label: "New Containers" },
              { to: "/used-containers", label: "Used Containers" },
              { to: "/container-types", label: "Container Types" },
              { to: "/container-sizes", label: "Container Sizes" },
            ].map((l) => (
              <li key={l.to}>
                <Link to={l.to} className="text-navy-foreground/70 transition-colors hover:text-primary">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="font-display text-sm font-bold uppercase tracking-[0.18em] text-primary">
            Company
          </h2>
          <ul className="mt-4 space-y-2 text-sm">
            {[
              { to: "/about-us", label: "About Us" },
              { to: "/how-it-works", label: "How It Works" },
              { to: "/industries", label: "Industries" },
              { to: "/worldwide-shipping", label: "Worldwide Shipping" },
              { to: "/reviews", label: "Customer Reviews" },
              { to: "/gallery", label: "Gallery" },
              { to: "/faq", label: "FAQ" },
              { to: "/blog", label: "Blog" },
              { to: "/contact", label: "Contact" },
            ].map((l) => (
              <li key={l.to}>
                <Link to={l.to} className="text-navy-foreground/70 transition-colors hover:text-primary">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="font-display text-sm font-bold uppercase tracking-[0.18em] text-primary">
            Get in Touch
          </h2>
          <ul className="mt-4 space-y-3 text-sm text-navy-foreground/70">
            <li className="flex gap-2.5">
              <Mail className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
              <a href={`mailto:${SITE.email}`} className="hover:text-primary">
                {SITE.email}
              </a>
            </li>
            {settings?.phone ? (
              <li className="flex gap-2.5">
                <MessageCircle className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
                <a href={whatsappUrl(settings.phone)} target="_blank" rel="noreferrer" className="hover:text-primary">
                  {settings.phone}
                </a>
              </li>
            ) : null}
            {settings?.whatsapp_secondary ? (
              <li className="flex gap-2.5">
                <MessageCircle className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
                <a href={whatsappUrl(settings.whatsapp_secondary)} target="_blank" rel="noreferrer" className="hover:text-primary">
                  {settings.whatsapp_secondary}
                </a>
              </li>
            ) : null}
            {settings?.line_number ? (
              <li className="flex gap-2.5">
                <MessageSquareText className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
                <a href={lineUrl(settings.line_number)} target="_blank" rel="noreferrer" className="hover:text-primary">
                  {settings.line_number} (LINE)
                </a>
              </li>
            ) : null}
            {settings?.address ? (
              <li className="flex gap-2.5">
                <MapPin className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
                <span>{settings.address}</span>
              </li>
            ) : null}
            {settings?.business_hours ? (
              <li className="flex gap-2.5">
                <Clock className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
                <span>{settings.business_hours}</span>
              </li>
            ) : null}
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-page flex flex-col gap-3 py-5 text-xs text-navy-foreground/60 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {SITE.name}. All rights reserved.
          </p>
          <nav className="flex flex-wrap gap-5" aria-label="Legal">
            <Link to="/privacy-policy" className="hover:text-primary">
              Privacy Policy
            </Link>
            <Link to="/terms" className="hover:text-primary">
              Terms &amp; Conditions
            </Link>
            <Link to="/shipping-policy" className="hover:text-primary">
              Shipping Policy
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
