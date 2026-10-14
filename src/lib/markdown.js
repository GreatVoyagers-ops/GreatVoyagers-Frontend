import { marked } from "marked";

// Shared by the browser and scripts/prerender.mjs, so it must not touch the DOM.

const stripTags = (html) => html.replace(/<[^>]+>/g, "");

const decodeEntities = (text) =>
  text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");

export const headingId = (text) =>
  decodeEntities(text)
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 80);

/** Markdown to HTML with ids on h2/h3 (for the table of contents) and scrollable tables. Not sanitised. */
export function markdownToHtml(markdown) {
  const used = new Set();
  const html = marked.parse(markdown, { gfm: true, breaks: false, async: false });

  return html
    .replace(/<h([23])>([\s\S]*?)<\/h\1>/g, (match, level, inner) => {
      let id = headingId(stripTags(inner)) || "section";
      while (used.has(id)) id += "-2";
      used.add(id);
      return `<h${level} id="${id}">${inner}</h${level}>`;
    })
    .replace(/<table>/g, '<div class="table-wrap"><table>')
    .replace(/<\/table>/g, "</table></div>");
}

/** The article's h2 headings, for an "In this article" list. */
export function extractToc(markdown) {
  const used = new Set();
  const toc = [];
  for (const [, hashes, raw] of markdown.matchAll(/^(#{2,3})\s+(.+)$/gm)) {
    const text = raw.replace(/[*_`]/g, "").trim();
    let id = headingId(text) || "section";
    while (used.has(id)) id += "-2";
    used.add(id);
    if (hashes.length === 2) toc.push({ id, text });
  }
  return toc;
}
