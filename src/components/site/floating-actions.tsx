import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowUp } from "lucide-react";
import { siteChromeQuery } from "@/lib/queries";
import { whatsappUrl, lineUrl } from "@/lib/site";
import { cn } from "@/lib/utils";

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 32 32" className="size-6" fill="currentColor" aria-hidden="true">
      <path d="M16.02 3c-7.18 0-13 5.82-13 13 0 2.29.6 4.53 1.75 6.5L3 29l6.68-1.75a12.95 12.95 0 0 0 6.34 1.66h.01c7.18 0 13-5.82 13-13s-5.82-13-13.01-13Zm0 23.78h-.01a10.8 10.8 0 0 1-5.5-1.51l-.4-.24-3.97 1.04 1.06-3.87-.26-.4a10.78 10.78 0 0 1-1.65-5.77c0-5.96 4.86-10.82 10.83-10.82 2.9 0 5.62 1.13 7.66 3.18a10.75 10.75 0 0 1 3.17 7.65c0 5.96-4.86 10.82-10.82 10.82h-.11ZM21.9 18.7c-.32-.16-1.9-.94-2.2-1.05-.3-.11-.51-.16-.73.16-.21.32-.84 1.05-1.03 1.26-.19.21-.38.24-.7.08-.32-.16-1.34-.5-2.56-1.6-.94-.85-1.58-1.9-1.76-2.22-.19-.32-.02-.5.14-.65.14-.14.32-.38.48-.56.16-.19.21-.32.32-.54.11-.21.05-.4-.03-.56-.08-.16-.73-1.77-1-2.42-.26-.63-.53-.55-.73-.56h-.62c-.21 0-.56.08-.86.4-.29.32-1.12 1.1-1.12 2.68 0 1.58 1.15 3.11 1.31 3.33.16.21 2.26 3.46 5.48 4.85.77.33 1.36.53 1.83.68.77.24 1.46.21 2.02.13.62-.09 1.9-.78 2.16-1.53.27-.75.27-1.4.19-1.53-.08-.13-.29-.21-.61-.37Z" />
    </svg>
  );
}

function LineIcon() {
  return (
    <svg viewBox="0 0 32 32" className="size-6" aria-hidden="true">
      <path
        fill="currentColor"
        d="M16 4C8.82 4 3 8.85 3 14.83c0 5.36 4.62 9.85 10.86 10.7.42.09 1 .28 1.15.65.13.32.08.83.04 1.16l-.19 1.13c-.05.33-.26 1.3 1.14.71 1.4-.6 7.55-4.45 10.3-7.62C28.15 19.5 29 17.3 29 14.83 29 8.85 23.18 4 16 4Z"
      />
      <path
        fill="#06C755"
        d="M13.5 12.2h-.9a.25.25 0 0 0-.25.25v5.1c0 .14.11.25.25.25h.9c.14 0 .25-.11.25-.25v-5.1a.25.25 0 0 0-.25-.25ZM19.4 12.2h-.9a.25.25 0 0 0-.25.25v3.03l-2.34-3.16-.02-.02v-.01l-.02-.02h-.01l-.01-.01h-.02l-.01-.01h-.1a.25.25 0 0 0-.25.25v5.1c0 .14.11.25.25.25h.9c.14 0 .25-.11.25-.25v-3.03l2.34 3.16c.02.02.04.04.06.05v.01l.02.01h.04l.02.01h.16a.25.25 0 0 0 .25-.25v-5.1a.25.25 0 0 0-.25-.25ZM11.1 16.35H8.87v-3.9a.25.25 0 0 0-.25-.25h-.9a.25.25 0 0 0-.25.25v5.1c0 .07.03.13.07.17.04.04.1.07.17.07h3.4c.14 0 .25-.11.25-.25v-.9a.25.25 0 0 0-.26-.24ZM24.15 13.35c.14 0 .25-.11.25-.25v-.9a.25.25 0 0 0-.25-.25h-3.4a.25.25 0 0 0-.17.07.24.24 0 0 0-.07.17v5.1c0 .07.03.13.07.17.04.04.1.07.17.07h3.4c.14 0 .25-.11.25-.25v-.9a.25.25 0 0 0-.25-.25h-2.24v-.86h2.24c.14 0 .25-.11.25-.25v-.9a.25.25 0 0 0-.25-.25h-2.24v-.86h2.24Z"
      />
    </svg>
  );
}

function FloatingButton({
  href,
  label,
  colorClass,
  children,
}: {
  href: string;
  label: string;
  colorClass: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label={label}
      title={label}
      className={cn(
        "flex size-12 items-center justify-center rounded-full text-white shadow-lg transition-transform hover:scale-110",
        colorClass,
      )}
    >
      {children}
    </a>
  );
}

export function FloatingActions() {
  const { data } = useQuery(siteChromeQuery);
  const settings = data?.settings;
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    function onScroll() {
      setShowTop(window.scrollY > 500);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="fixed bottom-5 right-5 z-40 flex flex-col-reverse items-end gap-3">
      {settings?.phone ? (
        <FloatingButton
          href={whatsappUrl(settings.phone)}
          label={`Chat on WhatsApp (${settings.phone})`}
          colorClass="bg-[#25D366] hover:bg-[#20bd5a]"
        >
          <WhatsAppIcon />
        </FloatingButton>
      ) : null}
      {settings?.whatsapp_secondary ? (
        <FloatingButton
          href={whatsappUrl(settings.whatsapp_secondary)}
          label={`Chat on WhatsApp (${settings.whatsapp_secondary})`}
          colorClass="bg-[#25D366] hover:bg-[#20bd5a]"
        >
          <WhatsAppIcon />
        </FloatingButton>
      ) : null}
      {settings?.line_number ? (
        <FloatingButton
          href={lineUrl(settings.line_number)}
          label={`Chat on LINE (${settings.line_number})`}
          colorClass="bg-white ring-1 ring-border hover:bg-secondary"
        >
          <span className="text-[#06C755]">
            <LineIcon />
          </span>
        </FloatingButton>
      ) : null}
      <button
        type="button"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        aria-label="Back to top"
        title="Back to top"
        className={cn(
          "flex size-12 items-center justify-center rounded-full bg-navy text-navy-foreground shadow-lg transition-all hover:scale-110 hover:bg-navy-deep",
          showTop ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      >
        <ArrowUp className="size-5" aria-hidden />
      </button>
    </div>
  );
}
