import company from "../data/company";
import { DEFAULT_OG_IMAGE, absoluteUrl } from "../lib/site";

/** Per-page head tags. React 19 hoists <title>, <meta> and <link> into <head>. */
export default function Seo({ title, description, path = "/", image = DEFAULT_OG_IMAGE, type = "website", noindex = false, jsonLd, children }) {
  const fullTitle = title || `${company.name} | Thailand Specialists, Holidays, Flights & Hotels`;
  const url = absoluteUrl(path);
  const schemas = (Array.isArray(jsonLd) ? jsonLd : [jsonLd]).filter(Boolean);

  return (
    <>
      <title>{fullTitle}</title>
      {description && <meta name="description" content={description} />}
      {noindex ? <meta name="robots" content="noindex, nofollow" /> : <link rel="canonical" href={url} />}

      <meta property="og:site_name" content={company.name} />
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      {description && <meta property="og:description" content={description} />}
      <meta property="og:url" content={url} />
      <meta property="og:image" content={image} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      {description && <meta name="twitter:description" content={description} />}
      <meta name="twitter:image" content={image} />
      {children}

      {schemas.map((schema, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }}
        />
      ))}
    </>
  );
}
