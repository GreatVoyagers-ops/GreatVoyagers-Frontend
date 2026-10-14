import { api } from "./api";

export const fetchPosts = ({ page = 1, limit = 9, category = "" } = {}, signal) => {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (category) params.set("category", category);
  return api(`/posts?${params}`, { signal });
};

export const fetchPost = (slug, signal) => api(`/posts/${encodeURIComponent(slug)}`, { signal });

export const formatDate = (value) =>
  value
    ? new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "long", year: "numeric" }).format(new Date(value))
    : "";

/** Resizes Unsplash URLs on the fly; other image URLs are returned unchanged. */
export function coverSrc(url, width, height) {
  if (!url) return "";
  try {
    const parsed = new URL(url);
    if (parsed.hostname !== "images.unsplash.com") return url;
    parsed.searchParams.set("auto", "format");
    parsed.searchParams.set("fit", "crop");
    parsed.searchParams.set("q", "75");
    parsed.searchParams.set("w", String(width));
    if (height) parsed.searchParams.set("h", String(height));
    else parsed.searchParams.delete("h");
    return parsed.toString();
  } catch {
    return url;
  }
}

export const coverSrcSet = (url, widths, ratio) =>
  url && url.includes("images.unsplash.com")
    ? widths.map((w) => `${coverSrc(url, w, ratio ? Math.round(w * ratio) : undefined)} ${w}w`).join(", ")
    : undefined;
