import { Link, useSearchParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, RefreshCw } from "lucide-react";
import Seo from "../components/Seo";
import Reveal from "../components/Reveal";
import { Emphasis } from "../components/SectionHeading";
import PostCard, { PostCardSkeleton } from "../components/blog/PostCard";
import BlogCta from "../components/blog/BlogCta";
import usePosts from "../hooks/usePosts";
import company from "../data/company";
import { SITE_URL, absoluteUrl } from "../lib/site";

const PAGE_SIZE = 10;

const blogLink = (category, page) => {
  const params = new URLSearchParams();
  if (category) params.set("category", category);
  if (page > 1) params.set("page", String(page));
  const query = params.toString();
  return query ? `/blog?${query}` : "/blog";
};

export default function Blog() {
  const [searchParams] = useSearchParams();
  const category = searchParams.get("category") || "";
  const page = Math.max(1, Number.parseInt(searchParams.get("page"), 10) || 1);
  const { status, data, error, retry } = usePosts({ page, limit: PAGE_SIZE, category });

  const showFeatured = status === "ready" && page === 1 && !category && data.posts.length > 0;
  const [featured, ...rest] = showFeatured ? data.posts : [null, ...(data?.posts ?? [])];
  const path = blogLink(category, page);

  const title = category
    ? `${category}: Travel Articles | ${company.name} Blog`
    : `Travel Blog: Thailand Guides & Holiday Tips | ${company.name}`;
  const description = category
    ? `Read GreatVoyagers articles on ${category.toLowerCase()}: expert advice for Indian travellers planning Thailand and international holidays.`
    : "Thailand travel guides, itineraries, visa rules, budgets and holiday tips for Indian travellers, from the experts at GreatVoyagers.";

  return (
    <>
      <Seo
        title={title}
        description={description}
        path={path}
        jsonLd={[
          {
            "@context": "https://schema.org",
            "@type": "Blog",
            name: `${company.name} Travel Blog`,
            url: absoluteUrl("/blog"),
            publisher: { "@type": "Organization", name: company.name, url: SITE_URL },
          },
          {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl("/") },
              { "@type": "ListItem", position: 2, name: "Blog", item: absoluteUrl("/blog") },
            ],
          },
        ]}
      />

      <section className="relative overflow-hidden bg-linear-to-b from-ivory-200 to-ivory-100 pb-14 pt-16 md:pb-20 md:pt-24">
        <div aria-hidden="true" className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-terra-400/10 blur-3xl" />
        <div className="container-page relative">
          <nav aria-label="Breadcrumb" className="text-xs font-semibold text-ink-400">
            <ol className="flex items-center gap-2">
              <li>
                <Link to="/" className="hover:text-ink-900">
                  Home
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li aria-current="page" className="text-ink-900">
                Blog
              </li>
            </ol>
          </nav>
          <Reveal as="p" className="eyebrow mt-8">
            The GreatVoyagers Journal
          </Reveal>
          <Reveal as="h1" delay={80} className="heading-xl mt-5 max-w-4xl">
            <Emphasis text={category ? `*${category}*` : "Travel guides & *Thailand tips.*"} />
          </Reveal>
          <Reveal as="p" delay={160} className="mt-6 max-w-2xl text-lg leading-relaxed text-ink-600">
            Itineraries, visa rules, budgets, food and honest comparisons, written by our travel team to help you plan
            a better trip.
          </Reveal>

          {data?.categories?.length > 0 && (
            <Reveal delay={220} className="mt-10">
              <ul className="flex flex-wrap gap-2" aria-label="Filter by category">
                {["", ...data.categories].map((item) => {
                  const active = item === category;
                  return (
                    <li key={item || "all"}>
                      <Link
                        to={blogLink(item, 1)}
                        aria-current={active ? "page" : undefined}
                        className={`inline-flex rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
                          active
                            ? "border-ink-900 bg-ink-900 text-ivory-50"
                            : "border-ink-900/15 bg-ivory-50 text-ink-600 hover:border-ink-900 hover:text-ink-900"
                        }`}
                      >
                        {item || "All articles"}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </Reveal>
          )}
        </div>
      </section>

      <section className="pb-24 pt-6 md:pb-32" aria-label="Articles">
        <div className="container-page">
          {status === "error" && (
            <div role="alert" className="mx-auto max-w-xl rounded-[1.5rem] border border-ink-900/10 bg-ivory-50 p-10 text-center">
              <p className="font-serif text-2xl text-ink-900">We couldn't load the articles.</p>
              <p className="mt-3 text-ink-600">{error?.message}</p>
              <button type="button" onClick={retry} className="btn-primary mt-6">
                <RefreshCw className="h-4 w-4" aria-hidden="true" /> Try again
              </button>
            </div>
          )}

          {status === "loading" && (
            <div className="grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }, (_, index) => (
                <PostCardSkeleton key={index} />
              ))}
            </div>
          )}

          {status === "ready" && data.posts.length === 0 && (
            <div className="mx-auto max-w-xl py-16 text-center">
              <p className="font-serif text-2xl text-ink-900">No articles here yet.</p>
              <Link to="/blog" className="btn-ghost mt-6">
                See all articles
              </Link>
            </div>
          )}

          {status === "ready" && data.posts.length > 0 && (
            <>
              {featured && (
                <Reveal className="mb-16">
                  <PostCard post={featured} featured headingLevel="h2" />
                </Reveal>
              )}
              <div className="grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
                {rest.map((post, index) => (
                  <Reveal key={post._id} delay={(index % 3) * 90}>
                    <PostCard post={post} headingLevel="h2" />
                  </Reveal>
                ))}
              </div>

              {data.totalPages > 1 && (
                <nav aria-label="Pagination" className="mt-20 flex items-center justify-between border-t border-ink-900/10 pt-8">
                  {page > 1 ? (
                    <Link to={blogLink(category, page - 1)} rel="prev" className="btn-ghost">
                      <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Newer
                    </Link>
                  ) : (
                    <span />
                  )}
                  <p className="text-sm font-semibold text-ink-600">
                    Page {page} of {data.totalPages}
                  </p>
                  {page < data.totalPages ? (
                    <Link to={blogLink(category, page + 1)} rel="next" className="btn-ghost">
                      Older <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </Link>
                  ) : (
                    <span />
                  )}
                </nav>
              )}
            </>
          )}
        </div>
      </section>

      <BlogCta />
    </>
  );
}
