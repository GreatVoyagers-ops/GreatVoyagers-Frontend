// Runs after `vite build`. Writes crawlable HTML for every published blog post, plus sitemap.xml and robots.txt.
// The React app still takes over in the browser; this only gives search engines and link previews real content.
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadEnv } from "vite";
import { markdownToHtml } from "../src/lib/markdown.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dist = path.join(root, "dist");
const env = { ...loadEnv("production", root, ""), ...process.env };

const SITE_URL = (env.VITE_SITE_URL || "https://www.greatvoyagers.com").replace(/\/$/, "");
const API_URL = (env.PRERENDER_API_URL || env.VITE_API_URL || "http://localhost:5000").replace(/\/$/, "");
const SITE_NAME = "GreatVoyagers";
const REQUEST_TIMEOUT_MS = 30_000;

const escapeHtml = (value = "") =>
  String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const safeJson = (value) => JSON.stringify(value).replace(/</g, "\\u003c");

const unsplashSized = (url, width, height) => {
  try {
    const parsed = new URL(url);
    if (parsed.hostname !== "images.unsplash.com") return url;
    parsed.searchParams.set("w", String(width));
    parsed.searchParams.set("h", String(height));
    parsed.searchParams.set("fit", "crop");
    return parsed.toString();
  } catch {
    return url;
  }
};

const formatDate = (value) =>
  new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "long", year: "numeric" }).format(new Date(value));

async function getJson(pathname) {
  const response = await fetch(`${API_URL}/api${pathname}`, { signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS) });
  if (!response.ok) throw new Error(`${pathname} returned ${response.status}`);
  return response.json();
}

async function fetchAllPosts() {
  const posts = [];
  for (let page = 1; page < 50; page += 1) {
    const data = await getJson(`/posts?limit=100&page=${page}`);
    posts.push(...data.posts);
    if (page >= data.totalPages) break;
  }
  return Promise.all(posts.map((post) => getJson(`/posts/${encodeURIComponent(post.slug)}`)));
}

function headTags({ title, description, url, image, type = "website", extra = "", jsonLd = [] }) {
  return [
    `<title data-seo>${escapeHtml(title)}</title>`,
    `<meta data-seo name="description" content="${escapeHtml(description)}" />`,
    `<link data-seo rel="canonical" href="${escapeHtml(url)}" />`,
    `<meta data-seo property="og:site_name" content="${SITE_NAME}" />`,
    `<meta data-seo property="og:type" content="${type}" />`,
    `<meta data-seo property="og:title" content="${escapeHtml(title)}" />`,
    `<meta data-seo property="og:description" content="${escapeHtml(description)}" />`,
    `<meta data-seo property="og:url" content="${escapeHtml(url)}" />`,
    `<meta data-seo property="og:image" content="${escapeHtml(image)}" />`,
    `<meta data-seo name="twitter:card" content="summary_large_image" />`,
    extra,
    ...jsonLd.map((schema) => `<script data-seo type="application/ld+json">${safeJson(schema)}</script>`),
  ]
    .filter(Boolean)
    .join("\n    ");
}

const fill = (template, head, body, preload = "") =>
  template
    .replace(/<!--seo:start-->[\s\S]*?<!--seo:end-->/, `<!--seo:start-->\n    ${head}\n    <!--seo:end-->`)
    .replace("<!--app-html-->", body)
    .replace("</body>", `${preload}</body>`);

function postPage(template, { post, related }) {
  const url = `${SITE_URL}/blog/${post.slug}`;
  const title = post.metaTitle || `${post.title} | ${SITE_NAME}`;
  const description = post.metaDescription || post.excerpt;
  const image = unsplashSized(post.coverImage, 1200, 630);

  const head = headTags({
    title,
    description,
    url,
    image,
    type: "article",
    extra: [
      `<meta data-seo property="article:published_time" content="${post.publishedAt}" />`,
      `<meta data-seo property="article:modified_time" content="${post.updatedAt || post.publishedAt}" />`,
      `<meta data-seo property="article:section" content="${escapeHtml(post.category)}" />`,
    ].join("\n    "),
    jsonLd: [
      {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        headline: post.title,
        description,
        image: [image],
        datePublished: post.publishedAt,
        dateModified: post.updatedAt || post.publishedAt,
        author: { "@type": "Organization", name: post.author || SITE_NAME, url: SITE_URL },
        publisher: { "@type": "Organization", name: SITE_NAME, logo: { "@type": "ImageObject", url: `${SITE_URL}/favicon.svg` } },
        mainEntityOfPage: { "@type": "WebPage", "@id": url },
        articleSection: post.category,
        keywords: (post.tags || []).join(", "),
      },
      {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
          { "@type": "ListItem", position: 2, name: "Blog", item: `${SITE_URL}/blog` },
          { "@type": "ListItem", position: 3, name: post.title, item: url },
        ],
      },
    ],
  });

  const body = `
      <main id="main" class="container-page py-16">
        <article>
          <nav aria-label="Breadcrumb"><a href="/">Home</a> / <a href="/blog">Blog</a> / ${escapeHtml(post.category)}</nav>
          <h1 class="heading-lg mt-6">${escapeHtml(post.title)}</h1>
          <p class="mt-4">${escapeHtml(post.excerpt)}</p>
          <p class="mt-2">By ${escapeHtml(post.author || SITE_NAME)} · <time datetime="${post.publishedAt}">${formatDate(post.publishedAt)}</time> · ${post.readingTime} min read</p>
          <img src="${escapeHtml(unsplashSized(post.coverImage, 1600, 800))}" alt="${escapeHtml(post.coverAlt)}" width="1600" height="800" class="mt-8 w-full rounded-[2rem]" />
          <div class="article-body mt-10">${markdownToHtml(post.content)}</div>
        </article>
        ${
          related.length
            ? `<aside class="mt-16"><h2>Keep reading</h2><ul>${related
                .map((item) => `<li><a href="/blog/${item.slug}">${escapeHtml(item.title)}</a></li>`)
                .join("")}</ul></aside>`
            : ""
        }
      </main>`;

  const preload = `<script id="gv-preload" type="application/json">${safeJson({ post, related })}</script>\n  `;
  return fill(template, head, body, preload);
}

function blogIndexPage(template, posts) {
  const title = `Travel Blog: Thailand Guides & Holiday Tips | ${SITE_NAME}`;
  const description =
    "Thailand travel guides, itineraries, visa rules, budgets and holiday tips for Indian travellers, from the experts at GreatVoyagers.";
  const head = headTags({
    title,
    description,
    url: `${SITE_URL}/blog`,
    image: posts[0] ? unsplashSized(posts[0].coverImage, 1200, 630) : "",
    jsonLd: [
      {
        "@context": "https://schema.org",
        "@type": "Blog",
        name: `${SITE_NAME} Travel Blog`,
        url: `${SITE_URL}/blog`,
        blogPost: posts.map((post) => ({
          "@type": "BlogPosting",
          headline: post.title,
          url: `${SITE_URL}/blog/${post.slug}`,
          datePublished: post.publishedAt,
        })),
      },
    ],
  });
  const body = `
      <main id="main" class="container-page py-16">
        <h1 class="heading-xl">Travel guides &amp; Thailand tips</h1>
        <ul class="mt-10 space-y-6">${posts
          .map(
            (post) =>
              `<li><h2><a href="/blog/${post.slug}">${escapeHtml(post.title)}</a></h2><p>${escapeHtml(post.excerpt)}</p></li>`
          )
          .join("")}</ul>
      </main>`;
  return fill(template, head, body);
}

function sitemap(posts) {
  const today = new Date().toISOString().slice(0, 10);
  const urls = [
    { loc: `${SITE_URL}/`, lastmod: today, priority: "1.0", changefreq: "weekly" },
    { loc: `${SITE_URL}/blog`, lastmod: posts[0]?.updatedAt?.slice(0, 10) || today, priority: "0.8", changefreq: "daily" },
    ...posts.map((post) => ({
      loc: `${SITE_URL}/blog/${post.slug}`,
      lastmod: (post.updatedAt || post.publishedAt).slice(0, 10),
      priority: "0.7",
      changefreq: "monthly",
    })),
  ];
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (url) =>
      `  <url>\n    <loc>${escapeHtml(url.loc)}</loc>\n    <lastmod>${url.lastmod}</lastmod>\n    <changefreq>${url.changefreq}</changefreq>\n    <priority>${url.priority}</priority>\n  </url>`
  )
  .join("\n")}
</urlset>
`;
}

const robots = () => `User-agent: *
Allow: /
Disallow: /admin
Disallow: /q/

Sitemap: ${SITE_URL}/sitemap.xml
`;

async function writePage(relativeDir, html) {
  const dir = path.join(dist, relativeDir);
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, "index.html"), html);
}

const template = await readFile(path.join(dist, "index.html"), "utf8");
let entries = [];
try {
  console.log(`Prerender: fetching posts from ${API_URL}`);
  entries = await fetchAllPosts();
} catch (error) {
  console.warn(`Prerender: skipped blog pages, API not reachable (${error.cause?.code || error.message}).`);
}

for (const entry of entries) {
  await writePage(path.join("blog", entry.post.slug), postPage(template, entry));
}
const posts = entries.map((entry) => entry.post);
if (posts.length) await writePage("blog", blogIndexPage(template, posts));

await writeFile(path.join(dist, "sitemap.xml"), sitemap(posts));
await writeFile(path.join(dist, "robots.txt"), robots());
console.log(`Prerender: ${posts.length} posts, sitemap.xml (${posts.length + 2} URLs) and robots.txt written for ${SITE_URL}`);
