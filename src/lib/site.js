export const SITE_URL = (import.meta.env.VITE_SITE_URL || "https://www.greatvoyagers.com").replace(/\/$/, "");

export const DEFAULT_OG_IMAGE =
  "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?auto=format&fit=crop&w=1200&h=630&q=80";

export const absoluteUrl = (path = "/") => `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
