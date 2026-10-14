import { Link } from "react-router-dom";
import { ArrowUpRight, Clock } from "lucide-react";
import { coverSrc, coverSrcSet, formatDate } from "../../lib/blog";

export function PostMeta({ post, className = "" }) {
  return (
    <p className={`flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-semibold text-ink-400 ${className}`}>
      <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
      <span aria-hidden="true" className="h-1 w-1 rounded-full bg-current" />
      <span className="inline-flex items-center gap-1">
        <Clock className="h-3.5 w-3.5" aria-hidden="true" />
        {post.readingTime} min read
      </span>
    </p>
  );
}

export default function PostCard({ post, featured = false, headingLevel = "h3" }) {
  const Heading = headingLevel;
  const href = `/blog/${post.slug}`;

  if (featured) {
    return (
      <article className="group img-zoom relative grid overflow-hidden rounded-[2rem] bg-ink-900 text-ivory-50 lg:grid-cols-12">
        <div className="relative aspect-[16/10] overflow-hidden lg:col-span-7 lg:aspect-auto lg:min-h-[28rem]">
          <img
            src={coverSrc(post.coverImage, 1200, 800)}
            srcSet={coverSrcSet(post.coverImage, [640, 960, 1400], 2 / 3)}
            sizes="(min-width: 1024px) 58vw, 100vw"
            alt={post.coverAlt || ""}
            className="absolute inset-0 h-full w-full object-cover"
          />
        </div>
        <div className="flex flex-col justify-center p-8 md:p-12 lg:col-span-5">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-terra-400">Featured · {post.category}</p>
          <Heading className="mt-4 font-serif text-3xl leading-tight md:text-4xl">
            <Link to={href} className="after:absolute after:inset-0">
              {post.title}
            </Link>
          </Heading>
          <p className="mt-4 line-clamp-3 leading-relaxed text-ivory-50/70">{post.excerpt}</p>
          <PostMeta post={post} className="mt-6 text-ivory-50/50" />
          <span className="mt-8 inline-flex items-center gap-2 text-sm font-bold text-terra-400">
            Read the guide
            <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" />
          </span>
        </div>
      </article>
    );
  }

  return (
    <article className="group img-zoom relative flex h-full flex-col">
      <div className="relative aspect-[4/3] overflow-hidden rounded-[1.5rem] bg-sand-300">
        <img
          src={coverSrc(post.coverImage, 720, 540)}
          srcSet={coverSrcSet(post.coverImage, [400, 720, 1000], 3 / 4)}
          sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 100vw"
          alt={post.coverAlt || ""}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover"
        />
        <span className="absolute left-4 top-4 rounded-full bg-ivory-50/95 px-3 py-1.5 text-[0.7rem] font-bold uppercase tracking-[0.14em] text-ink-900 backdrop-blur">
          {post.category}
        </span>
      </div>
      <div className="flex flex-1 flex-col pt-5">
        <PostMeta post={post} />
        <Heading className="mt-3 font-serif text-[1.45rem] leading-snug text-ink-900 transition-colors group-hover:text-terra-600">
          <Link to={href} className="after:absolute after:inset-0">
            {post.title}
          </Link>
        </Heading>
        <p className="mt-3 line-clamp-3 text-[0.95rem] leading-relaxed text-ink-600">{post.excerpt}</p>
        <span className="mt-auto inline-flex items-center gap-1.5 pt-5 text-sm font-bold text-ink-900">
          Read article
          <ArrowUpRight className="h-4 w-4 text-terra-500 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" />
        </span>
      </div>
    </article>
  );
}

export function PostCardSkeleton() {
  return (
    <div aria-hidden="true" className="animate-pulse">
      <div className="aspect-[4/3] rounded-[1.5rem] bg-sand-300/60" />
      <div className="mt-5 h-3 w-32 rounded bg-sand-300/60" />
      <div className="mt-4 h-6 w-11/12 rounded bg-sand-300/60" />
      <div className="mt-2 h-6 w-2/3 rounded bg-sand-300/60" />
      <div className="mt-4 h-3 w-full rounded bg-sand-300/40" />
      <div className="mt-2 h-3 w-5/6 rounded bg-sand-300/40" />
    </div>
  );
}
