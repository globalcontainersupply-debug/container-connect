import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Play, ImageOff } from "lucide-react";
import { mediaQuery } from "@/lib/queries";
import { pageMeta } from "@/lib/seo";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Reveal } from "@/components/site/reveal";

export const Route = createFileRoute("/gallery")({
  head: () =>
    pageMeta({
      title: "Photo & Video Gallery",
      description:
        "Browse photos and videos of our shipping container stock, depots and deliveries.",
      path: "/gallery",
    }),
  loader: ({ context }) => context.queryClient.ensureQueryData(mediaQuery),
  component: GalleryPage,
});

function GalleryPage() {
  const { data: media } = useSuspenseQuery(mediaQuery);
  const [active, setActive] = useState<number | null>(null);

  return (
    <div className="bg-background">
      <div className="border-b border-border bg-secondary/40">
        <nav aria-label="Breadcrumb" className="container-page py-3 text-sm text-muted-foreground">
          <Link to="/" className="hover:text-primary">
            Home
          </Link>
          <span className="px-2">/</span>
          <span className="text-foreground">Gallery</span>
        </nav>
      </div>

      <section className="container-page py-14">
        <p className="eyebrow text-primary">Photo &amp; video gallery</p>
        <h1 className="mt-2 font-display text-4xl font-bold uppercase md:text-5xl">Gallery</h1>
        <p className="mt-4 max-w-2xl text-muted-foreground">
          A look at our stock, depots and deliveries.
        </p>

        {media.length ? (
          <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {media.map((item, i) => (
              <Reveal key={item.id} variant="scale" delay={(i % 8) * 60}>
                <button
                  type="button"
                  onClick={() => setActive(i)}
                  className="group relative block aspect-square w-full overflow-hidden rounded-sm border border-border bg-muted"
                >
                  {item.media_type === "video" ? (
                    <>
                      <video src={item.url} className="size-full object-cover" muted />
                      <span className="absolute inset-0 flex items-center justify-center bg-black/30 transition-colors group-hover:bg-black/40">
                        <Play className="size-8 fill-white text-white" aria-hidden />
                      </span>
                    </>
                  ) : (
                    <img
                      src={item.url}
                      alt={item.alt_text ?? ""}
                      loading="lazy"
                      className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  )}
                </button>
              </Reveal>
            ))}
          </div>
        ) : (
          <div className="mt-10 flex flex-col items-center gap-3 rounded-sm border border-dashed border-border p-16 text-center text-muted-foreground">
            <ImageOff className="size-8" aria-hidden />
            No media has been added yet.
          </div>
        )}
      </section>

      <Dialog open={active !== null} onOpenChange={(open) => !open && setActive(null)}>
        <DialogContent className="max-w-4xl p-0">
          <DialogTitle className="sr-only">
            {active !== null ? (media[active]?.alt_text ?? media[active]?.file_name ?? "Media") : "Media"}
          </DialogTitle>
          {active !== null && media[active] ? (
            media[active].media_type === "video" ? (
              <video src={media[active].url} controls autoPlay className="w-full" />
            ) : (
              <img
                src={media[active].url}
                alt={media[active].alt_text ?? ""}
                className="w-full object-contain"
              />
            )
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
