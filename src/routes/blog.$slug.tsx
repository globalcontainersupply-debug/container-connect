import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { postQuery, postsQuery } from "@/lib/queries";
import { pageMeta, breadcrumbLd, jsonLd, SITE_URL } from "@/lib/seo";
import { SITE, formatDate } from "@/lib/site";

export const Route = createFileRoute("/blog/$slug")({
  loader: async ({ context, params }) => {
    const [post] = await Promise.all([
      context.queryClient.ensureQueryData(postQuery(params.slug)),
      context.queryClient.ensureQueryData(postsQuery),
    ]);
    if (!post) throw notFound();
    return post;
  },
  head: ({ loaderData, params }) => {
    if (!loaderData) {
      return {
        meta: [{ title: `Article not found | ${SITE.name}` }, { name: "robots", content: "noindex" }],
      };
    }
    const post = loaderData;
    const base = pageMeta({
      title: post.seo_title ?? post.title,
      description: post.seo_description ?? post.excerpt ?? post.title,
      path: `/blog/${params.slug}`,
      image: post.featured_image_url ?? undefined,
      type: "article",
    });
    return {
      ...base,
      scripts: [
        jsonLd({
          "@context": "https://schema.org",
          "@type": "Article",
          headline: post.title,
          description: post.excerpt ?? undefined,
          image: post.featured_image_url ? [post.featured_image_url] : undefined,
          author: post.author ? { "@type": "Person", name: post.author } : undefined,
          datePublished: post.published_at,
          mainEntityOfPage: `${SITE_URL}/blog/${params.slug}`,
        }),
        jsonLd(
          breadcrumbLd([
            { name: "Home", path: "/" },
            { name: "Blog", path: "/blog" },
            { name: post.title, path: `/blog/${params.slug}` },
          ]),
        ),
      ],
    };
  },
  component: BlogPostPage,
});

function BlogPostPage() {
  const { slug } = Route.useParams();
  const { data: post } = useSuspenseQuery(postQuery(slug));
  const { data: posts } = useSuspenseQuery(postsQuery);
  if (!post) return null;

  const related = posts
    .filter((p) => p.slug !== post.slug && p.category === post.category)
    .slice(0, 3);

  return (
    <div className="bg-background">
      <div className="border-b border-border bg-secondary/40">
        <nav aria-label="Breadcrumb" className="container-page py-3 text-xs text-muted-foreground">
          <ol className="flex flex-wrap items-center gap-2">
            <li>
              <Link to="/" className="hover:text-foreground">
                Home
              </Link>
            </li>
            <li aria-hidden>/</li>
            <li>
              <Link to="/blog" className="hover:text-foreground">
                Blog
              </Link>
            </li>
            <li aria-hidden>/</li>
            <li className="text-foreground">{post.title}</li>
          </ol>
        </nav>
      </div>

      <article className="container-page max-w-3xl py-14">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">
          {[post.category, formatDate(post.published_at)].filter(Boolean).join(" · ")}
        </p>
        <h1 className="mt-3 font-display text-4xl font-bold uppercase leading-tight md:text-5xl">
          {post.title}
        </h1>
        {post.author ? (
          <p className="mt-3 text-sm text-muted-foreground">By {post.author}</p>
        ) : null}
        {post.featured_image_url ? (
          <img
            src={post.featured_image_url}
            alt={post.title}
            className="mt-8 aspect-[16/9] w-full rounded-sm object-cover"
          />
        ) : null}
        <div className="mt-8 space-y-4 text-base leading-relaxed text-muted-foreground">
          {post.content.split("\n\n").map((para, i) => (
            <p key={i}>{para}</p>
          ))}
        </div>
        {post.tags.length ? (
          <div className="mt-8 flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <span key={tag} className="rounded-sm bg-secondary px-3 py-1 text-xs uppercase tracking-wide">
                {tag}
              </span>
            ))}
          </div>
        ) : null}
      </article>

      {related.length ? (
        <section className="border-t border-border bg-surface py-14">
          <div className="container-page">
            <h2 className="font-display text-2xl font-bold uppercase">Related articles</h2>
            <div className="mt-6 grid gap-6 md:grid-cols-3">
              {related.map((p) => (
                <Link
                  key={p.slug}
                  to="/blog/$slug"
                  params={{ slug: p.slug }}
                  className="group overflow-hidden rounded-sm border border-border bg-card"
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
                    <h3 className="font-display text-lg font-semibold uppercase leading-tight">
                      {p.title}
                    </h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </div>
  );
}
