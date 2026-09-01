import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Anchor, Boxes, Globe2, ShieldCheck, Ship, Star, Truck } from "lucide-react";
import { homeQuery, mediaQuery } from "@/lib/queries";
import { pageMeta } from "@/lib/seo";
import { ProductCard } from "@/components/site/product-card";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { formatDate } from "@/lib/site";
import { CountUp, Reveal, useParallax } from "@/components/site/reveal";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

export const Route = createFileRoute("/")({
  head: () =>
    pageMeta({
      title: "Shipping Containers for Sale Worldwide",
      description:
        "Global Container Supply sells new and used ISO shipping containers — dry, high cube, refrigerated, open top, flat rack and tank units — with delivery to 90+ countries.",
      path: "/",
    }),
  loader: ({ context }) =>
    Promise.all([
      context.queryClient.ensureQueryData(homeQuery),
      context.queryClient.ensureQueryData(mediaQuery),
    ]),
  component: HomePage,
});

const benefitIcons = [ShieldCheck, Globe2, Truck, Boxes];

function HomePage() {
  const { data } = useSuspenseQuery(homeQuery);
  const { data: media } = useSuspenseQuery(mediaQuery);
  const { home, products, types, sizes, reviews, posts, videos } = data;
  const galleryImages = media.filter((m) => m.media_type === "image").slice(0, 12);
const featured = products.filter((p) => p.featured);
  const list = featured.length ? featured : products.slice(0, 6);
  const benefits = Array.isArray(home?.benefits) ? (home.benefits as { title: string; body: string }[]) : [];
  const featuredVideo = videos.find((v) => v.homepage_featured) ?? null;
  const heroParallax = useParallax<HTMLImageElement>(0.18);
  const ctaParallax = useParallax<HTMLImageElement>(0.12);

  return (
    <>
      {featuredVideo ? (
        <section className="border-b border-border bg-navy-deep py-10 text-navy-foreground">
          <div className="container-page">
            <Reveal variant="up">
              {home?.video_heading || home?.video_body ? (
                <div className="mb-6 max-w-2xl">
                  {home?.video_heading ? (
                    <h2 className="font-display text-2xl font-bold uppercase md:text-3xl">
                      {home.video_heading}
                    </h2>
                  ) : null}
                  {home?.video_body ? (
                    <p className="mt-2 text-navy-foreground/75">{home.video_body}</p>
                  ) : null}
                </div>
              ) : null}
            </Reveal>
            <Reveal variant="scale" delay={100}>
              <div className="overflow-hidden rounded-sm border border-white/10 bg-black">
                <video
                  key={featuredVideo.id}
                  controls
                  poster={featuredVideo.poster_url ?? undefined}
                  className="aspect-video w-full"
                  preload="metadata"
                >
                  <source src={featuredVideo.video_url} />
                </video>
              </div>
            </Reveal>
          </div>
        </section>
      ) : null}

      <section className="relative isolate overflow-hidden bg-navy-deep text-navy-foreground">
        <img
          ref={heroParallax}
          src={home?.hero_image_url ?? "/images/hero-port.jpg"}
          alt="Container terminal with stacked shipping containers at dusk"
          className="absolute inset-0 -z-10 size-full object-cover opacity-40"
        />
        <div className="container-page grid gap-10 py-24 md:py-32 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <Reveal variant="up" duration={500}>
              <p className="eyebrow text-primary">Worldwide container supply</p>
            </Reveal>
            <Reveal variant="up" delay={100} duration={600}>
              <h1 className="mt-4 max-w-3xl font-display text-5xl font-bold uppercase leading-[0.95] md:text-7xl">
                {home?.hero_heading ?? "Shipping Containers Supplied Worldwide"}
              </h1>
            </Reveal>
            <Reveal variant="up" delay={200} duration={600}>
              <p className="mt-6 max-w-xl text-lg text-navy-foreground/80">
                {home?.hero_subheading ??
                  "New and used ISO containers, inspected and ready for export. Tell us where it's going and we'll handle the rest."}
              </p>
            </Reveal>
            <Reveal variant="up" delay={300} duration={600}>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button asChild size="lg">
                  <Link to="/containers">{home?.hero_primary_cta ?? "Browse containers"}</Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link to="/contact">{home?.hero_secondary_cta ?? "Request a quote"}</Link>
                </Button>
              </div>
            </Reveal>
            <Reveal variant="fade" delay={450} duration={700}>
              <dl className="mt-12 grid max-w-lg grid-cols-3 gap-6 border-t border-navy-foreground/15 pt-6">
                {[
                  { k: "Container types", v: types.length },
                  { k: "Standard sizes", v: sizes.length },
                  { k: "Delivery regions", v: 90, suffix: "+" },
                ].map((s) => (
                  <div key={s.k}>
                    <dt className="text-xs uppercase tracking-wide text-navy-foreground/60">{s.k}</dt>
                    <dd className="font-display text-3xl font-bold text-primary">
                      <CountUp value={s.v} suffix={s.suffix ?? ""} />
                    </dd>
                  </div>
                ))}
              </dl>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="container-page py-20">
        <Reveal variant="up">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="eyebrow text-primary">Live stock</p>
              <h2 className="mt-2 font-display text-4xl font-bold uppercase">Featured containers</h2>
            </div>
            <Button asChild variant="outline">
              <Link to="/containers">View all containers</Link>
            </Button>
          </div>
        </Reveal>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((p, i) => (
            <Reveal key={p.id} variant="scale" delay={(i % 3) * 100}>
              <ProductCard product={p} />
            </Reveal>
          ))}
        </div>
      </section>

      {galleryImages.length ? (
        <section className="container-page pb-20">
          <Reveal variant="up">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="eyebrow text-primary">Gallery</p>
                <h2 className="mt-2 font-display text-4xl font-bold uppercase">From our yard</h2>
              </div>
              <Button asChild variant="outline">
                <Link to="/gallery">View full gallery</Link>
              </Button>
            </div>
          </Reveal>
          <Reveal variant="fade" delay={100}>
            <Carousel opts={{ align: "start", loop: true }} className="mt-10">
              <CarouselContent>
                {galleryImages.map((item) => (
                  <CarouselItem key={item.id} className="basis-1/2 sm:basis-1/3 lg:basis-1/4">
                    <Link
                      to="/gallery"
                      className="block aspect-square overflow-hidden rounded-sm border border-border bg-muted"
                    >
                      <img
                        src={item.url}
                        alt={item.alt_text ?? ""}
                        loading="lazy"
                        className="size-full object-cover transition-transform duration-500 hover:scale-105"
                      />
                    </Link>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="hidden sm:flex" />
              <CarouselNext className="hidden sm:flex" />
            </Carousel>
          </Reveal>
        </section>
      ) : null}

      <section className="bg-surface py-20">
        <div className="container-page">
          <Reveal variant="up">
            <p className="eyebrow text-primary">Container types</p>
            <h2 className="mt-2 font-display text-4xl font-bold uppercase">Choose the right unit</h2>
          </Reveal>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {types.slice(0, 8).map((t, i) => (
              <Reveal key={t.id} variant={i % 2 === 0 ? "left" : "right"} delay={(i % 4) * 80}>
                <Link
                  to="/container-types/$slug"
                  params={{ slug: t.slug }}
                  className="group block h-full rounded-sm border border-border bg-card p-5 transition-all duration-300 hover:-translate-y-1 hover:border-primary hover:shadow-lg"
                >
                  <Ship className="size-6 text-primary transition-transform duration-300 group-hover:scale-110" aria-hidden />
                  <h3 className="mt-4 font-display text-lg font-semibold uppercase">{t.name}</h3>
                  <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">
                    {t.short_description}
                  </p>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="container-page py-20">
        <Reveal variant="up">
          <p className="eyebrow text-primary">Sizes</p>
          <h2 className="mt-2 font-display text-4xl font-bold uppercase">Standard dimensions</h2>
        </Reveal>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {sizes.map((s, i) => (
            <Reveal key={s.id} variant="up" delay={(i % 3) * 100}>
              <Link
                to="/container-sizes/$slug"
                params={{ slug: s.slug }}
                className="flex items-center justify-between gap-4 rounded-sm border border-border bg-card p-5 transition-all duration-300 hover:-translate-y-1 hover:border-primary hover:shadow-lg"
              >
                <div>
                  <h3 className="font-display text-lg font-semibold uppercase">{s.name}</h3>
                  <p className="text-sm text-muted-foreground">{s.external_dimensions}</p>
                </div>
                <Boxes className="size-6 shrink-0 text-primary" aria-hidden />
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="bg-navy text-navy-foreground py-20">
        <div className="container-page grid gap-12 lg:grid-cols-2 lg:items-center">
          <Reveal variant="left" duration={700}>
            <div>
              <p className="eyebrow text-primary">Why buyers choose us</p>
              <h2 className="mt-2 font-display text-4xl font-bold uppercase">
                {home?.shipping_heading ?? "Global logistics, handled end to end"}
              </h2>
              <p className="mt-4 text-navy-foreground/75">
                {home?.shipping_body ??
                  "From depot inspection to port handover, we coordinate the paperwork, the haulage and the shipping line so your unit lands where you need it."}
              </p>
              <div className="mt-8 grid gap-6 sm:grid-cols-2">
                {(benefits.length
                  ? benefits
                  : [
                      { title: "Inspected stock", body: "Every unit is checked before release." },
                      { title: "Worldwide delivery", body: "Door and port options in 90+ countries." },
                      { title: "Clear pricing", body: "Quotes itemised with delivery costs." },
                      { title: "Specialist units", body: "Reefer, tank, flat rack and modified." },
                    ]
                )
                  .slice(0, 4)
                  .map((b, i) => {
                    const Icon = benefitIcons[i % benefitIcons.length]!;
                    return (
                      <Reveal key={b.title} variant="fade" delay={150 + i * 100}>
                        <div>
                          <Icon className="size-5 text-primary" aria-hidden />
                          <h3 className="mt-3 font-display text-lg font-semibold uppercase">
                            {b.title}
                          </h3>
                          <p className="mt-1 text-sm text-navy-foreground/70">{b.body}</p>
                        </div>
                      </Reveal>
                    );
                  })}
              </div>
            </div>
          </Reveal>
          <Reveal variant="right" duration={700} delay={100}>
            <img
              src={home?.shipping_section_image_url ?? "/images/global-shipping.jpg"}
              alt="Container vessel being loaded at an international port"
              loading="lazy"
              className="rounded-sm object-cover"
            />
          </Reveal>
        </div>
      </section>

      <section className="container-page py-20">
        <Reveal variant="up">
          <p className="eyebrow text-primary">How it works</p>
          <h2 className="mt-2 font-display text-4xl font-bold uppercase">Four steps to delivery</h2>
        </Reveal>
        <ol className="mt-10 grid gap-6 md:grid-cols-4">
          {[
            { t: "Choose your unit", d: "Filter by type, size and condition, then add to your enquiry." },
            { t: "Send the enquiry", d: "Tell us your delivery city and timeline." },
            { t: "Receive a quote", d: "We confirm availability, price and freight." },
            { t: "Delivery", d: "We arrange haulage or port collection." },
          ].map((s, i) => (
            <Reveal key={s.t} as="li" variant="up" delay={i * 150}>
              <div className="h-full rounded-sm border border-border bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                <span className="font-display text-4xl font-bold text-primary">0{i + 1}</span>
                <h3 className="mt-3 font-display text-lg font-semibold uppercase">{s.t}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{s.d}</p>
              </div>
            </Reveal>
          ))}
        </ol>
      </section>

      {reviews.length ? (
        <section className="bg-surface py-20">
          <div className="container-page">
            <Reveal variant="up">
              <p className="eyebrow text-primary">Reviews</p>
              <h2 className="mt-2 font-display text-4xl font-bold uppercase">What buyers say</h2>
            </Reveal>
            <div className="mt-10 grid gap-6 md:grid-cols-3">
              {reviews.slice(0, 3).map((r, i) => (
                <Reveal key={r.id} variant="scale" delay={i * 120}>
                  <figure className="h-full rounded-sm border border-border bg-card p-6 transition-shadow duration-300 hover:shadow-lg">
                    <div className="flex gap-0.5 text-primary" aria-label={`${r.rating} out of 5`}>
                      {Array.from({ length: r.rating }).map((_, si) => (
                        <Star key={si} className="size-4 fill-current" aria-hidden />
                      ))}
                    </div>
                    <blockquote className="mt-4 text-sm leading-relaxed text-muted-foreground">
                      {r.body}
                    </blockquote>
                    <figcaption className="mt-4 text-sm font-semibold">
                      {r.customer_name}
                      {r.company ? (
                        <span className="font-normal text-muted-foreground"> · {r.company}</span>
                      ) : null}
                    </figcaption>
                  </figure>
                </Reveal>
              ))}
            </div>
            <Reveal variant="fade" delay={200}>
              <div className="mt-8">
                <Button asChild variant="outline">
                  <Link to="/reviews">Read all reviews</Link>
                </Button>
              </div>
            </Reveal>
          </div>
        </section>
      ) : null}

      {posts.length ? (
        <section className="container-page py-20">
          <Reveal variant="up">
            <p className="eyebrow text-primary">Insights</p>
            <h2 className="mt-2 font-display text-4xl font-bold uppercase">From the blog</h2>
          </Reveal>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {posts.map((p, i) => (
              <Reveal key={p.slug} variant="up" delay={i * 120}>
                <Link
                  to="/blog/$slug"
                  params={{ slug: p.slug }}
                  className="group block h-full overflow-hidden rounded-sm border border-border bg-card transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                >
                  {p.featured_image_url ? (
                    <img
                      src={p.featured_image_url}
                      alt={p.title}
                      loading="lazy"
                      className="aspect-[16/9] w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : null}
                  <div className="p-5">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">
                      {p.category} · {formatDate(p.published_at)}
                    </p>
                    <h3 className="mt-2 font-display text-lg font-semibold uppercase leading-tight">
                      {p.title}
                    </h3>
                    <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{p.excerpt}</p>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </section>
      ) : null}

      <section className="relative isolate overflow-hidden bg-navy-deep py-20 text-navy-foreground">
        <img
          ref={ctaParallax}
          src={home?.cta_section_image_url ?? "/images/yard-aerial.jpg"}
          alt=""
          aria-hidden
          loading="lazy"
          className="absolute inset-0 -z-10 size-full object-cover opacity-25"
        />
        <Reveal variant="scale" duration={700}>
          <div className="container-page text-center">
            <Anchor className="mx-auto size-8 text-primary" aria-hidden />
            <h2 className="mt-4 font-display text-4xl font-bold uppercase">Ready to buy?</h2>
            <p className="mx-auto mt-3 max-w-xl text-navy-foreground/80">
              Send us your requirement and delivery location — we'll come back with availability,
              pricing and freight options.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Button asChild size="lg">
                <Link to="/contact">Request a quote</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/containers">Browse stock</Link>
              </Button>
            </div>
          </div>
        </Reveal>
      </section>

      <section className="container-page py-20">
        <Reveal variant="up">
          <p className="eyebrow text-primary">FAQ</p>
          <h2 className="mt-2 font-display text-4xl font-bold uppercase">Common questions</h2>
        </Reveal>
        <Reveal variant="fade" delay={100}>
          <Accordion type="single" collapsible className="mt-8 max-w-3xl">
            {[
              {
                q: "Do you deliver internationally?",
                a: "Yes. We arrange port-to-port and door delivery across more than 90 countries.",
              },
              {
                q: "What is the difference between new and used?",
                a: "New (one-trip) units have made a single voyage. Used units are cargo-worthy or wind and watertight with cosmetic wear.",
              },
              {
                q: "How do I get a price?",
                a: "Add units to your enquiry and submit the form — we reply with a full quote including freight.",
              },
            ].map((f) => (
              <AccordionItem key={f.q} value={f.q}>
                <AccordionTrigger className="text-left font-display text-lg uppercase">
                  {f.q}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">{f.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Reveal>
        <div className="mt-6">
          <Button asChild variant="outline">
            <Link to="/faq">See all FAQs</Link>
          </Button>
        </div>
      </section>
    </>
  );
}
