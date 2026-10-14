import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowRight, Check, Link2, MessageCircle, RefreshCw } from "lucide-react";
import Seo from "../components/Seo";
import PageLoader from "../components/PageLoader";
import PostCard, { PostMeta } from "../components/blog/PostCard";
import BlogCta from "../components/blog/BlogCta";
import company from "../data/company";
import { coverSrc, coverSrcSet, fetchPost } from "../lib/blog";
import { extractToc } from "../lib/markdown";
import renderMarkdown from "../lib/renderMarkdown";
import { openEnquiry } from "../lib/enquiry";
import { getPreloadedPost } from "../lib/preload";
import { SITE_URL, absoluteUrl } from "../lib/site";
import NotFound from "./NotFound";

const initialState = (slug) => {
  const preloaded = getPreloadedPost(slug);
  return preloaded
    ? { status: "ready", post: preloaded.post, related: preloaded.related, error: null }
    : { status: "loading", post: null, related: [], error: null };
};

function usePost(slug) {
  const [state, setState] = useState(() => initialState(slug));
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    // Keep showing prerendered content while it refreshes in the background.
    setState((current) => (current.post?.slug === slug ? current : initialState(slug)));
    fetchPost(slug, controller.signal)
      .then(({ post, related }) => setState({ status: "ready", post, related, error: null }))
      .catch((error) => {
        if (error.name === "AbortError") return;
        setState((current) =>
          error.status !== 404 && current.post?.slug === slug
            ? current
            : { status: error.status === 404 ? "missing" : "error", post: null, related: [], error }
        );
      });
    return () => controller.abort();
  }, [slug, attempt]);

  return { ...state, retry: () => setAttempt((value) => value + 1) };
}

function ShareLinks({ title, url }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt("Copy this link:", url);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      <span className="text-xs font-bold uppercase tracking-[0.18em] text-ink-400">Share</span>
      <a
        href={`https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`}
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-2 rounded-full border border-ink-900/15 px-4 py-2 text-sm font-semibold text-ink-900 transition-colors hover:border-ink-900"
      >
        <MessageCircle className="h-4 w-4" aria-hidden="true" /> WhatsApp
      </a>
      <button
        type="button"
        onClick={copy}
        className="inline-flex items-center gap-2 rounded-full border border-ink-900/15 px-4 py-2 text-sm font-semibold text-ink-900 transition-colors hover:border-ink-900"
      >
        {copied ? <Check className="h-4 w-4 text-sea-500" aria-hidden="true" /> : <Link2 className="h-4 w-4" aria-hidden="true" />}
        {copied ? "Link copied" : "Copy link"}
      </button>
    </div>
  );
}

export default function BlogPost() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { status, post, related, error, retry } = usePost(slug);

  const html = useMemo(() => (post ? renderMarkdown(post.content) : ""), [post]);
  const toc = useMemo(() => (post ? extractToc(post.content) : []), [post]);

  if (status === "loading") return <PageLoader label="Loading article" />;
  if (status === "missing") return <NotFound />;
  if (status === "error") {
    return (
      <div role="alert" className="container-page flex min-h-[60vh] flex-col items-center justify-center text-center">
        <p className="font-serif text-3xl text-ink-900">We couldn't load this article.</p>
        <p className="mt-3 text-ink-600">{error?.message}</p>
        <button type="button" onClick={retry} className="btn-primary mt-6">
          <RefreshCw className="h-4 w-4" aria-hidden="true" /> Try again
        </button>
      </div>
    );
  }

  const path = `/blog/${post.slug}`;
  const url = absoluteUrl(path);
  const ogImage = coverSrc(post.coverImage, 1200, 630);
  const categoryPath = `/blog?category=${encodeURIComponent(post.category)}`;
  const prefill = post.tags.includes("thailand") ? { destination: "Thailand" } : {};

  const onArticleClick = (event) => {
    const anchor = event.target.closest("a");
    if (!anchor || event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return;
    const href = anchor.getAttribute("href") || "";
    if (href.startsWith("/") && !href.startsWith("//")) {
      event.preventDefault();
      if (href === "/#enquiry") openEnquiry(prefill);
      else navigate(href);
    }
  };

  return (
    <>
      <Seo
        title={post.metaTitle || `${post.title} | ${company.name}`}
        description={post.metaDescription || post.excerpt}
        path={path}
        image={ogImage}
        type="article"
        jsonLd={[
          {
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            headline: post.title,
            description: post.metaDescription || post.excerpt,
            image: [ogImage],
            datePublished: post.publishedAt,
            dateModified: post.updatedAt || post.publishedAt,
            author: { "@type": "Organization", name: post.author || company.name, url: SITE_URL },
            publisher: {
              "@type": "Organization",
              name: company.name,
              logo: { "@type": "ImageObject", url: `${SITE_URL}/favicon.svg` },
            },
            mainEntityOfPage: { "@type": "WebPage", "@id": url },
            articleSection: post.category,
            keywords: post.tags.join(", "),
          },
          {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl("/") },
              { "@type": "ListItem", position: 2, name: "Blog", item: absoluteUrl("/blog") },
              { "@type": "ListItem", position: 3, name: post.title, item: url },
            ],
          },
        ]}
      >
        <meta property="article:published_time" content={post.publishedAt} />
        {post.updatedAt && <meta property="article:modified_time" content={post.updatedAt} />}
        <meta property="article:section" content={post.category} />
      </Seo>

      <article>
        <header className="bg-linear-to-b from-ivory-200 to-ivory-100 pb-10 pt-12 md:pt-20">
          <div className="container-page">
            <nav aria-label="Breadcrumb" className="text-xs font-semibold text-ink-400">
              <ol className="flex flex-wrap items-center gap-2">
                <li>
                  <Link to="/" className="hover:text-ink-900">
                    Home
                  </Link>
                </li>
                <li aria-hidden="true">/</li>
                <li>
                  <Link to="/blog" className="hover:text-ink-900">
                    Blog
                  </Link>
                </li>
                <li aria-hidden="true">/</li>
                <li>
                  <Link to={categoryPath} className="hover:text-ink-900">
                    {post.category}
                  </Link>
                </li>
              </ol>
            </nav>
            <div className="mt-8 max-w-4xl">
              <Link
                to={categoryPath}
                className="inline-flex rounded-full bg-terra-500/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-terra-600"
              >
                {post.category}
              </Link>
              <h1 className="mt-5 font-serif text-[clamp(2.2rem,5vw,4rem)] font-normal leading-[1.06] tracking-[-0.015em] text-ink-900">
                {post.title}
              </h1>
              <p className="mt-6 max-w-3xl text-lg leading-relaxed text-ink-600 md:text-xl">{post.excerpt}</p>
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-ink-900 font-serif text-sm italic text-ivory-50">
                  gv
                </span>
                <div>
                  <p className="text-sm font-bold text-ink-900">{post.author || "GreatVoyagers Team"}</p>
                  <PostMeta post={post} className="mt-0.5" />
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="container-page">
          <figure className="overflow-hidden rounded-[2rem] bg-sand-300">
            <img
              src={coverSrc(post.coverImage, 1600, 800)}
              srcSet={coverSrcSet(post.coverImage, [800, 1200, 1600, 2200], 0.5)}
              sizes="(min-width: 1344px) 1248px, 100vw"
              alt={post.coverAlt || ""}
              fetchPriority="high"
              className="aspect-[16/9] w-full object-cover md:aspect-[2/1]"
            />
          </figure>
        </div>

        <div className="container-page grid gap-12 py-14 md:py-20 lg:grid-cols-12 lg:gap-16">
          <div className="min-w-0 lg:col-span-8">
            {/* Content is sanitised with DOMPurify in renderMarkdown. */}
            <div className="article-body" onClick={onArticleClick} dangerouslySetInnerHTML={{ __html: html }} />

            {post.tags.length > 0 && (
              <ul className="mt-12 flex flex-wrap gap-2" aria-label="Tags">
                {post.tags.map((tag) => (
                  <li key={tag} className="rounded-full bg-ivory-200 px-3 py-1.5 text-xs font-semibold text-ink-600">
                    #{tag}
                  </li>
                ))}
              </ul>
            )}
            <div className="mt-10 border-t border-ink-900/10 pt-8">
              <ShareLinks title={post.title} url={url} />
            </div>
          </div>

          <aside className="lg:col-span-4">
            <div className="space-y-6 lg:sticky lg:top-28">
              {toc.length > 2 && (
                <nav aria-label="In this article" className="rounded-[1.5rem] border border-ink-900/10 bg-ivory-50 p-6">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-terra-500">In this article</p>
                  <ol className="mt-4 space-y-2.5 text-sm">
                    {toc.map((item) => (
                      <li key={item.id}>
                        <a href={`#${item.id}`} className="block leading-snug text-ink-600 transition-colors hover:text-ink-900">
                          {item.text}
                        </a>
                      </li>
                    ))}
                  </ol>
                </nav>
              )}
              <div className="rounded-[1.5rem] bg-ink-900 p-7 text-ivory-50">
                <p className="font-serif text-2xl leading-snug">Want us to plan this trip for you?</p>
                <p className="mt-3 text-sm leading-relaxed text-ivory-50/70">
                  Free custom itinerary and quote from our Thailand specialists. {company.responseTime}.
                </p>
                <button
                  type="button"
                  onClick={() => openEnquiry(prefill)}
                  className="btn-primary mt-6 w-full bg-terra-500 hover:bg-terra-400"
                >
                  Send an enquiry <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            </div>
          </aside>
        </div>
      </article>

      {related.length > 0 && (
        <section className="border-t border-ink-900/10 py-20 md:py-24" aria-labelledby="related-heading">
          <div className="container-page">
            <div className="flex items-end justify-between gap-6">
              <h2 id="related-heading" className="heading-lg">
                Keep <em className="font-light text-terra-500">reading</em>
              </h2>
              <Link to="/blog" className="hidden text-sm font-bold text-ink-900 hover:text-terra-600 sm:inline-flex">
                All articles →
              </Link>
            </div>
            <div className="mt-12 grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((item) => (
                <PostCard key={item._id} post={item} />
              ))}
            </div>
          </div>
        </section>
      )}

      <BlogCta prefill={prefill} />
    </>
  );
}
